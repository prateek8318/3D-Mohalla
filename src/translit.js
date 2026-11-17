// 🔤 Roman Hinglish/Bhojpuri → Devanagari (sirf BOLNE ke liye — Hindi aawaz desi andaaz mein padhe)
// Pehle aam shabdon ki list, phir aawaz ke niyam. 100% sahi nahi, par Hindi TTS ke liye kaafi;
// Claude wali lines ka sahi Devanagari server se aata hai (voice.js mein yaad rehta hai).
const DICT = {
  hai: 'है', hain: 'हैं', ho: 'हो', hoon: 'हूँ', hun: 'हूँ', tha: 'था', thi: 'थी', the: 'थे', nahi: 'नहीं', nahin: 'नहीं', na: 'ना', mat: 'मत',
  main: 'मैं', mai: 'मैं', mein: 'में', me: 'में', mera: 'मेरा', meri: 'मेरी', mere: 'मेरे', mujhe: 'मुझे', hum: 'हम', hamara: 'हमारा', ham: 'हम',
  tum: 'तुम', tu: 'तू', tera: 'तेरा', teri: 'तेरी', tere: 'तेरे', tumhara: 'तुम्हारा', tumhari: 'तुम्हारी', tumhare: 'तुम्हारे', tumhe: 'तुम्हें', aap: 'आप', apna: 'अपना', apni: 'अपनी', apne: 'अपने',
  wo: 'वो', woh: 'वो', vo: 'वो', ye: 'ये', yeh: 'ये', is: 'इस', us: 'उस', iska: 'इसका', uska: 'उसका', unka: 'उनका', yahan: 'यहाँ', wahan: 'वहाँ', kahan: 'कहाँ', jahan: 'जहाँ',
  kya: 'क्या', kyu: 'क्यों', kyun: 'क्यों', kyon: 'क्यों', kaise: 'कैसे', kaisa: 'कैसा', kaisi: 'कैसी', kab: 'कब', kaun: 'कौन', kitna: 'कितना', kitni: 'कितनी', kuch: 'कुछ', kuchh: 'कुछ', koi: 'कोई',
  aur: 'और', ya: 'या', par: 'पर', pe: 'पे', se: 'से', ko: 'को', ka: 'का', ki: 'की', ke: 'के', to: 'तो', bhi: 'भी', hi: 'ही', sab: 'सब', bas: 'बस', ab: 'अब', abhi: 'अभी', phir: 'फिर', fir: 'फिर',
  bhai: 'भाई', bhaiya: 'भैया', bhaisaab: 'भाईसाब', didi: 'दीदी', beta: 'बेटा', babua: 'बबुआ', ji: 'जी', arre: 'अरे', are: 'अरे', abe: 'अबे', oye: 'ओए', haan: 'हाँ', han: 'हाँ', accha: 'अच्छा', achha: 'अच्छा', theek: 'ठीक', thik: 'ठीक',
  chalo: 'चलो', chal: 'चल', jao: 'जाओ', jaa: 'जा', aao: 'आओ', aa: 'आ', karo: 'करो', kar: 'कर', karna: 'करना', karke: 'करके', dekho: 'देखो', dekh: 'देख', suno: 'सुनो', bolo: 'बोलो', bol: 'बोल', ruko: 'रुको', ruk: 'रुक',
  raha: 'रहा', rahi: 'रही', rahe: 'रहे', gaya: 'गया', gayi: 'गई', gaye: 'गए', diya: 'दिया', di: 'दी', liya: 'लिया', hua: 'हुआ', hui: 'हुई', hue: 'हुए', hoga: 'होगा', hogi: 'होगी', sakta: 'सकता', sakti: 'सकती',
  pyaar: 'प्यार', pyar: 'प्यार', dil: 'दिल', jaan: 'जान', jaanu: 'जानू', chaand: 'चाँद', chand: 'चाँद', raat: 'रात', din: 'दिन', subah: 'सुबह', shaam: 'शाम', ghar: 'घर', paisa: 'पैसा', paise: 'पैसे', gaadi: 'गाड़ी', gadi: 'गाड़ी', sadak: 'सड़क',
  bahut: 'बहुत', bohot: 'बहुत', thoda: 'थोड़ा', thodi: 'थोड़ी', jaldi: 'जल्दी', zara: 'ज़रा', sach: 'सच', sachchi: 'सच्ची', sundar: 'सुंदर', khoobsurat: 'ख़ूबसूरत', shukriya: 'शुक्रिया', dhanyavaad: 'धन्यवाद', namaste: 'नमस्ते',
  ba: 'बा', baa: 'बा', baate: 'बाटे', hamra: 'हमरा', tohra: 'तोहरा', tohar: 'तोहार', hamar: 'हमार', kaahe: 'काहे', ka: 'का', ee: 'ई', oo: 'ऊ', ehije: 'एहिजे', okra: 'ओकरा', rauwa: 'रउआ',
  train: 'ट्रेन', hato: 'हटो', hat: 'हट', chhoot: 'छूट', chhod: 'छोड़', chhodo: 'छोड़ो', baat: 'बात', baatein: 'बातें', log: 'लोग', ladki: 'लड़की', ladka: 'लड़का', badi: 'बड़ी', bada: 'बड़ा', bade: 'बड़े', pahle: 'पहले', pehle: 'पहले', time: 'टाइम', paani: 'पानी', khana: 'खाना', sharam: 'शरम', tez: 'तेज़', thand: 'ठंड', mazaak: 'मज़ाक', gussa: 'ग़ुस्सा', izzat: 'इज़्ज़त', saala: 'साला', kamina: 'कमीना', chup: 'चुप', pagal: 'पागल', dimaag: 'दिमाग़', zindagi: 'ज़िंदगी', ishq: 'इश्क़', mohabbat: 'मोहब्बत', yaar: 'यार',
  sawari: 'सवारी', mohalla: 'मोहल्ला', mohalle: 'मोहल्ले', ghat: 'घाट', ganga: 'गंगा', chai: 'चाय', rickshaw: 'रिक्शा', auto: 'ऑटो', taxi: 'टैक्सी', hero: 'हीरो', sorry: 'सॉरी', please: 'प्लीज़', thank: 'थैंक', you: 'यू', love: 'लव', okay: 'ओके', ok: 'ओके', hello: 'हेलो', hi_: 'हाय',
};
const V = { a: ['अ', ''], aa: ['आ', 'ा'], i: ['इ', 'ि'], ee: ['ई', 'ी'], ii: ['ई', 'ी'], u: ['उ', 'ु'], oo: ['ऊ', 'ू'], uu: ['ऊ', 'ू'], e: ['ए', 'े'], ai: ['ऐ', 'ै'], ei: ['ए', 'े'], o: ['ओ', 'ो'], au: ['औ', 'ौ'], ri: ['ऋ', 'ृ'] };
const C = {
  chh: 'छ', kh: 'ख', gh: 'घ', ch: 'च', jh: 'झ', th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श', ny: 'ञ', ng: 'ङ',
  k: 'क', g: 'ग', c: 'क', j: 'ज', t: 'त', d: 'द', n: 'न', p: 'प', f: 'फ़', b: 'ब', m: 'म', y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह', z: 'ज़', q: 'क़', x: 'क्स',
};
const VK = Object.keys(V).sort((a, b) => b.length - a.length), CK = Object.keys(C).sort((a, b) => b.length - a.length);

function word(w) {
  const lw = w.toLowerCase();
  if (DICT[lw] && lw !== 'hi_') return DICT[lw];
  let out = '', i = 0, prevCons = false;
  while (i < lw.length) {
    const rest = lw.slice(i);
    const v = VK.find((k) => rest.startsWith(k));
    if (v) {
      let val = V[v];
      const last = i + v.length === lw.length;
      // shabd ke aakhir ka akela 'a' → 'ा' (accha → अच्छा); 'a' ke turant baad swar → 'ा' (dikhao → दिखाओ)
      if (v === 'a' && prevCons && ((last && lw.length > 2) || /^[aeiou]/.test(lw.slice(i + 1)))) val = V.aa;
      // aakhir ki chhoti i/u Hinglish mein lambi hoti hai (aati → आती, babu → बाबू)
      if (last && prevCons && v === 'i') val = V.ee;
      if (last && prevCons && v === 'u' && lw.length > 2) val = V.oo;
      out += prevCons ? val[1] : val[0];
      i += v.length; prevCons = false;
      continue;
    }
    const c = CK.find((k) => rest.startsWith(k));
    if (c) {
      const after = lw.slice(i + c.length);
      // n + vyanjan → anusvaar (ं), aakhir mein n (lambe swar ke baad) → ं
      if (c === 'n' && !prevCons && i > 0 && (CK.some((k) => after.startsWith(k) && k !== 'y' && k !== 'h') || (after === '' && /(aa|ai|ei|ee|ii|oo|o|e)$/.test(lw.slice(0, i))))) { out += 'ं'; i += 1; continue; }
      if (prevCons) out += '्'; // do vyanjan saath → halant
      out += C[c];
      i += c.length; prevCons = true;
      continue;
    }
    out += rest[0]; i += 1; prevCons = false;
  }
  return out;
}

/** "Arre bhaiya, jaldi chalo!" → "अरे भैया, जल्दी चलो!" */
export function romanToDeva(text) {
  return String(text).replace(/[A-Za-z]+/g, (w) => word(w));
}
