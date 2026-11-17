import { defineConfig, loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// 🛠️ `npm run dev` mein bhi /api/* chale (talk, tts, music) — bilkul Vercel jaisa, keys .env se.
// Sirf dev server ke liye; build/deploy pe iska koi asar nahi (wahan Vercel khud api/ chalata hai).
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/api\/([\w-]+)(?:\?.*)?$/.exec(req.url || '');
        const file = m && path.resolve('api', m[1] + '.js');
        if (!file || !fs.existsSync(file)) return next();
        try {
          let raw = '';
          for await (const c of req) raw += c;
          try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
          req.query = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
          res.status = (c) => { res.statusCode = c; return res; };
          res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
          res.send = (b) => { res.end(b); return res; };
          const mod = await import(pathToFileURL(file).href + '?t=' + fs.statSync(file).mtimeMs);
          await mod.default(req, res);
        } catch (e) {
          if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); }
          res.end(JSON.stringify({ error: String(e?.message || e) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), '')); // .env ki saari keys api/ functions ko
  return { plugins: [devApi()] };
});
