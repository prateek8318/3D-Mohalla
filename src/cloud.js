// ☁️ Firebase: login (Google / Guest), cloud save, leaderboard — Realtime Database
// Firebase lazy-load hota hai: game turant khulta hai, net na ho to bhi chalta rahega.
// Note: Firebase web config public hoti hai (secret nahi) — data ki hifazat database.rules.json se hoti hai.
const env = import.meta.env;
const CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBXK3TzdQo7cpXqPXutoqwK3c2m0FmZiRI',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'mohalla-3d.firebaseapp.com',
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || 'https://mohalla-3d-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'mohalla-3d',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'mohalla-3d.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '483915806259',
  appId: env.VITE_FIREBASE_APP_ID || '1:483915806259:web:5e6c4d1242474267d35546',
};

let fb = null; // { auth, db, A (auth module), D (database module) }
let user = null;
const listeners = new Set();

async function init() {
  if (fb) return fb;
  const [{ initializeApp }, A, D] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/database'),
  ]);
  const app = initializeApp(CONFIG);
  const auth = A.getAuth(app);
  const db = D.getDatabase(app);
  fb = { auth, db, A, D };
  // mobile pe popup block ho jaata hai to redirect se login hota hai — wapas aane pe result utha lo
  A.getRedirectResult(auth).catch(() => {});
  A.onAuthStateChanged(auth, (u) => {
    user = u;
    for (const f of listeners) f(u);
  });
  return fb;
}

const guestName = () => {
  let n = null;
  try { n = localStorage.getItem('mohalla.name'); } catch { /* ok */ }
  if (!n) {
    n = 'Guest-' + Math.floor(1000 + Math.random() * 9000);
    try { localStorage.setItem('mohalla.name', n); } catch { /* ok */ }
  }
  return n;
};

export const cloud = {
  /** Firebase shuru karo (fail ho to game offline chalta rahega) */
  async start() {
    try { await init(); return true; } catch (e) { console.warn('Firebase load nahi hua (offline?)', e); return false; }
  },
  onUser(f) { listeners.add(f); if (fb) f(user); return () => listeners.delete(f); },
  get user() { return user; },
  get isGuest() { return !!user?.isAnonymous; },
  name() {
    if (!user) return guestName();
    if (!user.isAnonymous && user.displayName) return user.displayName.split(' ')[0].slice(0, 20);
    return guestName();
  },

  async loginGuest() {
    const { auth, A } = await init();
    if (auth.currentUser) return auth.currentUser;
    const r = await A.signInAnonymously(auth);
    return r.user;
  },

  /** Google login. Guest pehle se ho to usi account ko Google se jod do (progress na khoye). */
  async loginGoogle() {
    const { auth, A } = await init();
    const provider = new A.GoogleAuthProvider();
    const isMobile = matchMedia('(pointer:coarse)').matches;
    try {
      if (auth.currentUser?.isAnonymous) {
        try {
          const r = await A.linkWithPopup(auth.currentUser, provider);
          return r.user;
        } catch (e) {
          // ye Google account pehle se kisi save se juda hai → seedha usme login
          if (e.code === 'auth/credential-already-in-use') {
            const cred = A.GoogleAuthProvider.credentialFromError(e);
            if (cred) return (await A.signInWithCredential(auth, cred)).user;
          }
          throw e;
        }
      }
      return (await A.signInWithPopup(auth, provider)).user;
    } catch (e) {
      if (isMobile && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        await A.signInWithRedirect(auth, provider);
        return null;
      }
      throw e;
    }
  },

  async logout() {
    const { auth, A } = await init();
    await A.signOut(auth);
  },

  async loadSave() {
    if (!user) return null;
    const { db, D } = await init();
    const snap = await D.get(D.ref(db, `saves/${user.uid}`));
    return snap.exists() ? snap.val() : null;
  },

  async save(data) {
    if (!user || !data) return false;
    const { db, D } = await init();
    // Realtime DB undefined accept nahi karta → JSON se saaf
    const clean = JSON.parse(JSON.stringify(data));
    await D.set(D.ref(db, `saves/${user.uid}`), clean);
    await D.set(D.ref(db, `leaderboard/${user.uid}`), {
      name: this.name(),
      money: Math.max(0, Math.min(5000000, Math.round(clean.money || 0))),
      respect: Math.max(0, Math.min(1000000, Math.round(clean.respect || 0))),
      at: D.serverTimestamp(),
    });
    return true;
  },

  /** by = 'money' | 'respect' → top N, sabse bada pehle */
  async top(by = 'money', n = 10) {
    const { db, D } = await init();
    const q = D.query(D.ref(db, 'leaderboard'), D.orderByChild(by), D.limitToLast(n));
    const snap = await D.get(q);
    const rows = [];
    snap.forEach((c) => { rows.push({ uid: c.key, ...c.val() }); });
    return rows.sort((a, b) => (b[by] || 0) - (a[by] || 0));
  },
};
