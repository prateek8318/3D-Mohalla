// Sarvam TTS ki pehli call — chalao: node --env-file=.env sarvam-test.mjs
// Key sirf environment se (SARVAM_API_KEY); kabhi print nahi hoti.
import fs from 'node:fs';
import { SarvamAIClient } from 'sarvamai';

const client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });

for (const [speaker, text, file] of [
  ['rahul', 'अरे भैया, जल्दी चलो! ट्रेन छूट जाएगी।', 'sarvam-male.wav'],
  ['priya', 'ऐसे मत देखो, शरम आती है।', 'sarvam-female.wav'],
]) {
  const res = await client.textToSpeech.convert({ text, language_code: 'hi-IN', model: 'bulbul:v3', speaker });
  const audio = Buffer.from(res.audios.join(''), 'base64');
  fs.writeFileSync(file, audio);
  console.log(`${speaker}: ${file} saved (${audio.length} bytes), request_id=${res.request_id}`);
}
