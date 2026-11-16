// Bazaar gali, ladkiyan, police, 18+ gaali — sab yahan
const sg = (hi, bho) => ({ hi, bho });

export const STALLS = [
  {
    id: 'phool', x: -24, side: -1, color: '#ff3d7f', sign: 'फूल वाला', sub: 'गुलाब • गजरा • गुलदस्ता',
    name: sg('Ramu Phool Wala', 'Ramu Phool Wala'), owner: 'Ramu Kaka', avatar: '🌹', keeper: { old: true, outfit: 'kurta', top: 0xfff6e0 },
    greet: sg(['Gulab le jao beta, kisi ka dil jeet lo 🌹', 'Gajra le lo, ladkiyon ko bahut pasand hai!'], ['Gulab le ja babua, kehu ke dil jeet la 🌹', 'Gajra le la, laikiyan ke bahut pasand ba!']),
    gaali: sg(['Abe phool lega ya sirf soonghega?', 'Single hai na? Shakal se pata chal raha hai 😂'], ['Phool kinbe ki sunghbe bas?', 'Akela baade na? Muh dekh ke bujhat ba 😂']),
    items: [
      { n: '🌹 Gulab', p: 20, kind: 'gift', gift: 1, mesh: 'gulab' },
      { n: '💐 Bouquet', p: 60, kind: 'gift', gift: 2.2, mesh: 'bouquet' },
      { n: '🌼 Gajra', p: 15, kind: 'gift', gift: 1, mesh: 'gulab' },
    ],
  },
  {
    id: 'chudi', x: -24, side: 1, color: '#b14bff', sign: 'चूड़ी भंडार', sub: 'काँच की चूड़ी • झुमका • बिंदी',
    name: sg('Shabnam Chudi Bhandar', 'Shabnam Chudi Bhandar'), owner: 'Shabnam Aunty', avatar: '💍', keeper: { female: true, outfit: 'salwar', top: 0x8e24aa },
    greet: sg(['Aao bhaiya, girlfriend ke liye chudi le jao 💍', 'Jhumka dekho, ekdum filmi!'], ['Aava bhaiya, sanghatiya khatir chudi le ja 💍', 'Jhumka dekha, ekdam filmi!']),
    gaali: sg(['Girlfriend hai bhi ya hawa mein kharid raha hai? 😂', 'Itna mol-bhaav mat kar, kanjoos!'], ['Sanghatiya ba bhi ki hawa mein kinat baade? 😂', 'Etna mol-bhaav mat kar, kanjoos!']),
    items: [
      { n: '💍 Kaanch ki Chudi', p: 30, kind: 'gift', gift: 1.4, mesh: 'gift' },
      { n: '✨ Bindi Packet', p: 10, kind: 'gift', gift: 0.6, mesh: 'gift' },
      { n: '👂 Jhumka', p: 80, kind: 'gift', gift: 2.6, mesh: 'gift' },
    ],
  },
  {
    id: 'juice', x: -42, side: -1, color: '#3dff7a', sign: 'गन्ने का रस', sub: 'ठंडा ठंडा कूल कूल',
    name: sg('Bablu Juice Corner', 'Bablu Juice Corner'), owner: 'Bablu', avatar: '🥤', keeper: { outfit: 'tshirt' },
    greet: sg(['Garmi mein ganne ka ras, dimaag ekdum thanda!', 'Barf daalu ya bina barf?'], ['Garmi mein ganna ke ras, dimaag thanda!', 'Barf daali ki bina barf?']),
    gaali: sg(['Glass wapas kar ke jaana, chor kahin ka!', 'Abe muft ka nahi hai, paise nikaal!'], ['Gilaas lauta ke jaiha, chor kahin ke!', 'Muft ke naikhe, paisa nikaal!']),
    items: [
      { n: '🥤 Ganne ka Ras', p: 15, fx: 'turbo', mesh: 'glass' },
      { n: '🍋 Shikanji', p: 10, fx: 'turbo', mesh: 'glass' },
      { n: '🥭 Mango Shake', p: 30, fx: 'sugar', mesh: 'glass' },
    ],
  },
  {
    id: 'patang', x: -42, side: 1, color: '#2ef2ff', sign: 'पतंग घर', sub: 'पतंग • बैट • लाठी • गुब्बारा',
    name: sg('Chhotu Patang Ghar', 'Chhotu Patang Ghar'), owner: 'Chhotu', avatar: '🪁', keeper: { kid: true, outfit: 'tshirt' },
    greet: sg(['Bhaiya patang lo, park mein udao! Kai po che! 🪁', 'Gubbara bhi hai, laal wala!'], ['Bhaiya patang la, park mein udaava! 🪁', 'Gubbara bhi ba, laal wala!']),
    gaali: sg(['Bhaiya aap budhe ho gaye ho patang ke liye 😂', 'Paise do pehle, udhaar nahi!'], ['Bhaiya rauaa budhaa gaile patang khatir 😂', 'Pahile paisa di, udhaar na!']),
    items: [
      { n: '🪁 Patang + Manjha', p: 25, kind: 'kite', mesh: 'gift' },
      { n: '🎈 Gubbara', p: 5, kind: 'balloon', mesh: 'balloon' },
      { n: '🏏 Cricket Bat', p: 40, kind: 'weapon', mesh: 'bat', d: 'J se maaro' },
      { n: '🦯 Lathi', p: 30, kind: 'weapon', mesh: 'lathi', d: 'J se maaro' },
    ],
  },
  {
    id: 'kapda', x: -60, side: -1, color: '#ffd23f', sign: 'फैशन कलेक्शन', sub: 'बॉम्बे का लेटेस्ट माल',
    name: sg('Pappu Fashion Collection', 'Pappu Fashion Collection'), owner: 'Pappu Tailor', avatar: '👕', keeper: { outfit: 'shirt', top: 0xffd23f, shades: true },
    greet: sg(['Bombay ka latest maal! Pehen ke hero ban jao 😎', 'Disco shirt lo, shaadi mein sab dekhenge!'], ['Bambai ke latest maal! Pahin ke hero ban ja 😎', 'Disco shirt la, biyah mein sab dekhihen!']),
    gaali: sg(['Isi kapde mein ghoomta hai? Badbu aa rahi hai!', 'Trial room mein selfie mat le, nikal!'], ['Ehi kapda mein ghumela? Badbu aawat ba!', 'Trial room mein selfie mat le, nikal!']),
    items: [
      { n: '👕 Disco Shirt', p: 120, kind: 'shirt', color: 0xff3d7f, outfit: 'shirt' },
      { n: '🧥 Leather Jacket', p: 250, kind: 'shirt', color: 0x2a1a12, outfit: 'jacket' },
      { n: '👔 Safari Suit', p: 180, kind: 'shirt', color: 0xc8b28a, outfit: 'kurta' },
      { n: '🕶️ Kaala Chashma', p: 60, kind: 'shades' },
      { n: '🧴 Ittar', p: 40, kind: 'ittar' },
    ],
  },
  {
    id: 'samosa', x: -60, side: 1, color: '#ff9a1f', sign: 'तिवारी समोसा', sub: 'गरम समोसा • इमरती • दूध',
    name: sg('Tiwari Samosa', 'Tiwari Samosa'), owner: 'Tiwari ji', avatar: '🥟', keeper: { outfit: 'kurta', top: 0xffffff, old: true },
    greet: sg(['Garam samosa, hari chutney ke saath!', 'Kulhad mein doodh, malai maar ke!'], ['Garam samosa, hariyar chatni sanghe!', 'Kulhad mein doodh, malai maar ke!']),
    gaali: sg(['Chutney dobara maangi to haath tod dunga!', 'Abe bhukkad, plate chaatna band kar!'], ['Chatni dobaara maangbe ta haath tor deb!', 'Ae bhukhad, thaali chaatal band kar!']),
    items: [
      { n: '🥟 Samosa', p: 10, fx: 'full', mesh: 'samosa' },
      { n: '🍥 Imarti', p: 20, fx: 'sugar', mesh: 'jalebi' },
      { n: '🥛 Kulhad Doodh', p: 15, fx: 'full', mesh: 'cup' },
    ],
  },
  {
    id: 'jyotish', x: -78, side: 1, color: '#ff5c97', sign: 'पंडित जी ज्योतिष', sub: 'हाथ दिखाओ, भविष्य जानो',
    name: sg('Pandit Bhavishyavani', 'Pandit Bhavishyavani'), owner: 'Pandit ji', avatar: '🔮', keeper: { old: true, outfit: 'kurta', top: 0xff8c1a, hat: 'pagdi' },
    greet: sg(['Haath dikhao bachcha, kismat ki rekha padhta hoon 🔮', 'Shani bhaari hai tumpe… upaay hai mere paas.'], ['Haath dekhaava babua, kismat ke rekha padhat bani 🔮', 'Shani bhaari ba tohra pe… upaay ba hamra lagge.']),
    gaali: sg(['Kismat to teri pehle se phooti hai 😂', 'Free mein bhavishya nahi batata, nikaal dakshina!'], ['Kismat ta tohar pahile se phootal ba 😂', 'Muft mein bhavishya na bataib, dakshina nikaal!']),
    items: [
      { n: '✋ Haath dikhao', p: 21, fx: 'fortune' },
      { n: '💞 Pyaar ka yog', p: 51, fx: 'loveyog', d: 'Kaun pasand karti hai?' },
    ],
  },
  {
    id: 'mochi', x: -78, side: -1, color: '#c8b28a', sign: 'मोची', sub: 'जूता पॉलिश ₹10',
    name: sg('Hariya Mochi', 'Hariya Mochi'), owner: 'Hariya', avatar: '👞', keeper: { old: true, outfit: 'lungi' },
    greet: sg(['Joota chamka doon saab? Sheesha bana dunga!', 'Chappal ki silai bhi hoti hai.'], ['Joota chamka di saahab? Aaina bana deb!', 'Chappal ke silaai bhi hola.']),
    gaali: sg(['Joote se badbu aa rahi hai, kab dhoye the?', 'Jaldi pair aage kar, nawab!'], ['Joota se badbu aawat ba, kab dhoile rahla?', 'Jaldi gor aage kar, nawab!']),
    items: [{ n: '👞 Joota Polish', p: 10, fx: 'polish', d: 'Impression +' }],
  },
];

export const FORTUNES = {
  hi: ['Agle hafte paisa aayega… ya jaayega, dono mein se ek pakka 😅', 'Tumhari shaadi ek Pinky naam ki ladki se hogi… ya Sweety se 💍', 'Shani ki dasha hai, rickshaw dheere chalaana!', 'Tum bahut aage jaoge… bas peeche mudke mat dekhna 🔮', 'Ek kaali billi tumhara raasta kaategi, sambhal ke 🐈‍⬛'],
  bho: ['Agila hafta paisa aai… ya jaai, dunu mein ek pakka 😅', 'Tohar biyah Pinky naam ke laiki se hoi… ya Sweety se 💍', 'Shani ke dasha ba, rickshaw dhire chalaiha!', 'Tu bahut aage jaiba… bas peechhe mud ke mat dekhiha 🔮', 'Ek kariya billi tohar raasta kaati, sambhar ke 🐈‍⬛'],
};

export const GIRL_NAMES = ['Pinky', 'Sweety', 'Rani', 'Neha', 'Pooja', 'Kajal', 'Priya', 'Sonam', 'Anjali', 'Dimple', 'Guddi', 'Babli', 'Komal', 'Reshma', 'Simran'];

export const GIRL = {
  hi: {
    hello: ['Haan bolo?', 'Hmm? Kya chahiye?', 'Hi… tum naye ho mohalle mein?', 'Mummy dekh legi, jaldi bolo!'],
    yes: ['Sach mein? …Haan! 🙈💞', 'Itne dino se intezaar tha tumhare bolne ka 🥹💕', 'Theek hai… par mummy-papa ko tum hi manaoge! 💞'],
    no: ['Sorry, main kisi aur ko pasand karti hoon.', 'Pehle kuch ban jao, phir aana.', 'Bhaiya bulaun kya? 😠', 'Mere papa police mein hain, samjhe?'],
    laugh: ['Hahaha… bahut filmy ho tum 😂', 'Ye line kis picture se churaayi? 😄'],
    slap: ['Tameez se baat karo! 👋', 'Sharam nahi aati? 👋', 'Dobara dikhe to chappal padegi! 👋'],
    gift: ['Aww… ye mere liye? 🥹', 'Itna kharcha kyun kiya? …par achha hai 😊'],
    noGift: 'Dene ko kuch hai bhi tumhare paas? 😏',
    already: 'Hum to already saath hain na, buddhu 💞',
    bye: 'Chalo, bye! 👋',
  },
  bho: {
    hello: ['Haan bola?', 'Ka chaahi?', 'Tu naya baada mohalla mein?', 'Mai dekh lihi, jaldi bola!'],
    yes: ['Sach mein? …Haan! 🙈💞', 'Kab se intezaar rahe tohra bole ke 🥹💕', 'Theek ba… bakir mai-babuji ke tuhi manaiba! 💞'],
    no: ['Sorry, ham kehu aur ke pasand karila.', 'Pahile kuchh ban ja, tab aaiha.', 'Bhaiya ke bolaai ka? 😠', 'Hamar babuji police mein baade, samjhla?'],
    laugh: ['Hahaha… bada filmy baada tu 😂', 'Ee line kaun picture se churaile ho? 😄'],
    slap: ['Tameez se baat kara! 👋', 'Laaj naikhe lagat? 👋', 'Phir dikhba ta chappal padi! 👋'],
    gift: ['Aww… ee hamra khatir? 🥹', 'Etna kharcha kaahe kailu? …bakir badhiya ba 😊'],
    noGift: 'Dewe khatir kuchh ba bhi tohra lagge? 😏',
    already: 'Ham ta pahile se sanghe baani na, buddhu 💞',
    bye: 'Chala, bye! 👋',
  },
};

export const PICKUP = {
  hi: ['Kya tum Wi-Fi ho? Main connected feel kar raha hoon 📶', 'Tumhare papa chor the kya? Saare taare chura ke tumhari aankhon mein daal diye ✨', 'Chai peene chalogi? Main cutting share kar lunga ☕', 'Tumhe dekh ke mera rickshaw bhi ruk gaya 🛺'],
  bho: ['Tu Wi-Fi hau ka? Ham connected feel karat bani 📶', 'Tohar babuji chor rahlan ka? Saara taara chura ke tohra aankh mein daal dihlan ✨', 'Chah pie chalbu? Ham cutting baant lebe ☕', 'Tohra ke dekh ke hamar rickshaw bhi ruk gail 🛺'],
};

export const POLICE = {
  hi: { caught: ['Ruko! Kahan bhaag rahe ho? Challan katega!', 'Chalo thane, bahut hero ban rahe the!'], paid: 'Challan kat gaya. Aage se dhyaan rakhna!', bribeOk: 'Theek hai… is baar chhod raha hoon. Chal nikal 🤫', bribeNo: 'Rishwat? Police ko rishwat?! Double challan! ₹200 😡', run: 'Haath chhuda ke bhaag gaye! Police abhi bhi peeche hai 🚨', siren: '🚨 Police peeche pad gayi!', lost: '😮‍💨 Police se bach gaye!', tease: '🚨 Kisi ne police ko bata diya!' },
  bho: { caught: ['Ruka! Kahan bhaagat baada? Challan kati!', 'Chala thana, bahut hero banat rahla!'], paid: 'Challan kat gail. Aage se dhyaan rakhiha!', bribeOk: 'Theek ba… ee baar chhod det bani. Chal bhaag 🤫', bribeNo: 'Ghoos? Police ke ghoos?! Dugna challan! ₹200 😡', run: 'Haath chhuda ke bhaag gaila! Police ab bhi peechhe ba 🚨', siren: '🚨 Police peechhe lag gail!', lost: '😮‍💨 Police se bach gaila!', tease: '🚨 Kehu police ke bata dihlas!' },
};

export const PED = {
  hi: { hit: ['Arre! Dekh ke chalao bhai!', 'Haath-pair tod diye, dhyaan kahan hai?!'] },
  bho: { hit: ['Are! Dekh ke chalaava bhaiya!', 'Haath-gor tor dihla, dhyaan kahan ba?!'] },
};
export const BAK2 = {
  hi: { hitPed: ['Abe andhe! Dikhta nahi kya?!', 'Oye rickshaw wale, licence kahan se kharida?!'], girlNo: ['Shakal dekhi hai apni? Chal hatt!'], girlSlap: ['Badtameez! 👋'], police: ['Chal be hero, challan bhar!'] },
  bho: { hitPed: ['Ae aanhar! Lauke na ka?!', 'Ae rickshaw wala, licence kahan se kinla?!'], girlNo: ['Apan muh dekhle baade? Chal hatt!'], girlSlap: ['Badtameez! 👋'], police: ['Chal re hero, challan bhar!'] },
};

// ⚠️ 18+ GAALI MODE — sirf age confirm karne ke baad
export const UI18 = {
  hi: {
    shopGreet: ['Aa gaya bhosdike? Ab kuch lega bhi ya sirf ghoorta rahega?', 'Abe madarchod, jaldi bol kya chahiye, dhanda khoti mat kar!', 'Bhenchod roz aata hai, kharidta ghanta kuch nahi!', 'Chal be chutiye, maal dekh aur paisa nikaal!'],
    noMoney: 'Jeb mein phooti kaudi nahi aur chala hai shopping karne, chutiye! 😂',
    cow: 'Abe andhe madarchod, gaay ko thokega kya?! 🐄',
    horn: 'Pom pom! Hatt bhenchod, baap ki sadak hai kya? 📯',
    bark: 'Bhow! Kutta bhi bol raha hai — bhaag bhosdike 😂',
    hitPed: ['Abe madarchod, aankhein ghar pe chhod aaya kya?!', 'Bhenchod rickshaw chala raha hai ya tank?!', 'Ruk bhosdike, tujhe abhi batata hoon!'],
    police: ['Ruk bhosdike! Licence dikha!', 'Chal madarchod, thane chal, wahan teri aarti utaarenge!', 'Bahut hero banta hai behenchod? Ab bhar challan!'],
    girlNo: ['Chal nikal chutiye, shakal dekhi hai apni?', 'Bhai ko bulaun? Haddi tod dega teri, gaandu!', 'Hatt bhosdike, raasta naap!'],
    girlSlap: ['Teri himmat kaise hui, harami kutte! 👋', 'Chataak! Ghar mein maa-behen nahi hai kya, kamine? 👋', 'Madarchod, dobara dikha to chappal se maarungi! 👋'],
  },
  bho: {
    shopGreet: ['Aa gaile bhosdiwala? Kuchh kinbe ki khali taakat rahbe?', 'Ka re madarchod, jaldi bol ka chaahi, dhandha mat bigaad!', 'Bhenchod roj aawela, kinela ghanta kuchhu na!', 'Chal re chutiya, maal dekh aur paisa nikaal!'],
    noMoney: 'Jeb mein ek dhela naikhe aur chalal baade kine, chutiya! 😂',
    cow: 'Ae aanhar madarchod, gaiya ke thok debe ka?! 🐄',
    horn: 'Pom pom! Hatt bhenchod, tohar baap ke sadak ha ka? 📯',
    bark: 'Bhow! Kukuro kahat ba — bhaag bhosdiwala 😂',
    hitPed: ['Ae madarchod, aankh ghare chhod aaile ka?!', 'Bhenchod rickshaw chalawat baade ki tank?!', 'Ruk bhosdiwala, abhi batawat bani!'],
    police: ['Ruk bhosdiwala! Licence dekha!', 'Chal madarchod, thana chal, uhaan tohar aarti utaral jaai!', 'Bahut hero banat baade bhenchod? Ab bhar challan!'],
    girlNo: ['Chal bhaag chutiya, apan muh dekhle baade?', 'Bhaiya ke bolaai? Haddi tor di tohar, gaandu!', 'Hatt bhosdiwala, raasta naap!'],
    girlSlap: ['Tohar himmat kaise bhail, haramzada! 👋', 'Chataak! Ghar mein maai-bahin naikhe ka, kameena? 👋', 'Madarchod, phir dikhle ta chappal se maarab! 👋'],
  },
};

export const UIX = {
  hi: {
    exit: 'F — Rickshaw se utro', enter: 'F — Rickshaw mein baitho', walkIn: (n) => `F se utro, phir ${n} mein jao`,
    talk: (n) => `E — ${n} se baat karo`, bagEmpty: 'Jhola khaali hai. Kuch kharido! 🛍️', added: (n) => `${n} jhole mein daala 🎒`,
    footOnly: 'Pehle rickshaw se utro (F) 🚶', spit: 'Pichkaari maar di! 🔴 (Sadak gandi mat karo 😅)', ittar: 'Ittar laga liya, mehak rahe ho ✨',
    kite: 'Patang udaa rahe ho! 🪁 Kai po che!', shirt: 'Naye kapde! Ekdum hero 😎', shades: 'Chashma laga liya 🕶️',
    gfFollow: (n) => `${n} ab tumhare saath hai 💞`, gfRide: (n) => `${n} rickshaw mein baith gayi 💞`,
    salonSit: 'Kursi pe baitho… Raju ustaad kaam pe lag gaye ✂️', polish: 'Joote chamak gaye! ✨', facial: 'Chehra chamak raha hai ✨',
    loveyog: (n) => `Pandit ji: "${n} tumhe chupke chupke pasand karti hai!" 💘`, cops: 'Police', eatDone: 'Waah! Pet aur dil dono khush 😋',
  },
  bho: {
    exit: 'F — Rickshaw se utra', enter: 'F — Rickshaw mein baitha', walkIn: (n) => `F se utra, phir ${n} mein jaa`,
    talk: (n) => `E — ${n} se baat kara`, bagEmpty: 'Jhola khaali ba. Kuchh kina! 🛍️', added: (n) => `${n} jhola mein daalal 🎒`,
    footOnly: 'Pahile rickshaw se utra (F) 🚶', spit: 'Pichkaari maar dihla! 🔴 (Sadak ganda mat kara 😅)', ittar: 'Ittar laga lihla, gamkat baada ✨',
    kite: 'Patang udaawat baada! 🪁', shirt: 'Naya kapda! Ekdam hero 😎', shades: 'Chashma laga lihla 🕶️',
    gfFollow: (n) => `${n} ab tohra sanghe baadi 💞`, gfRide: (n) => `${n} rickshaw mein baith gaili 💞`,
    salonSit: 'Kursi pe baitha… Raju ustaad kaam pe lag gailan ✂️', polish: 'Joota chamak gail! ✨', facial: 'Chehra chamkat ba ✨',
    loveyog: (n) => `Pandit ji: "${n} tohra ke chupke chupke pasand kareli!" 💘`, cops: 'Police', eatDone: 'Waah! Pet aur mann dunu khush 😋',
  },
};

export const FIGHT = {
  hi: { victim: ['Arre maar kyun raha hai?!', 'Bachao! Gunda hai ye!', 'Ruk tujhe dekhta hoon!', 'Aaah! Haddi tod di!'], hijack: ['Arre meri gaadi! Chor! Chor!', 'Utar meri gaadi se, chor!'], punched: ['Le! Ek aur chahiye?', 'Ab bol, hero!'], honk: ['Pom pom! Hato raaste se!', 'Beech sadak pe khade ho bhai?'], copHit: '🚨 Police pe haath uthaya?! Ab to gaye!' },
  bho: { victim: ['Are maarat kaahe baade?!', 'Bachaava! Gunda ba ee!', 'Ruk, abhi dekhat bani!', 'Aaah! Haddi tor dihlas!'], hijack: ['Are hamar gaadi! Chor! Chor!', 'Utar hamra gaadi se, chor!'], punched: ['Le! Ek aur chaahi?', 'Ab bol, hero!'], honk: ['Pom pom! Hata raasta se!', 'Beech sadak pe thaadh baada ho?'], copHit: '🚨 Police pe haath uthawala?! Ab ta gaila!' },
};
export const FIGHT18 = {
  hi: { victim: ['Madarchod, maarta hai? Ruk tujhe batata hoon!', 'Bhenchod gunda kahin ka!', 'Bhosdike, teri himmat kaise hui?!'], hijack: ['Bhosdike meri gaadi le ke bhaag raha hai! Pakdo madarchod ko!', 'Utar bhenchod meri gaadi se!'], punched: ['Le madarchod! Aur maar khayega?', 'Chal bhosdike, ab bol!'], honk: ['Pom pom! Hatt bhosdike, beech mein kyun khada hai?!', 'Abe madarchod, sadak baap ki hai kya?!'] },
  bho: { victim: ['Madarchod, maarat baade? Ruk!', 'Bhenchod gunda kahin ke!', 'Bhosdiwala, tohar himmat kaise bhail?!'], hijack: ['Bhosdiwala hamar gaadi le ke bhaagat ba! Pakda madarchod ke!', 'Utar bhenchod hamra gaadi se!'], punched: ['Le madarchod! Aur maar khaibe?', 'Chal bhosdiwala, ab bol!'], honk: ['Pom pom! Hatt bhosdiwala, beech mein kaahe thaadh baade?!', 'Ae madarchod, sadak tohar baap ke ha ka?!'] },
};
// ================= HOTEL RAJ PALACE =================
export const HOTEL = {
  id: 'hotel', color: '#ffd23f', sign: 'होटल राज पैलेस', sub: '★★★★★ • रंगीला बार • डिस्को • डिनर',
  name: { hi: 'Hotel Raj Palace 🏨', bho: 'Hotel Raj Palace 🏨' }, owner: 'Manager Malhotra', avatar: '🏨',
  greet: {
    hi: ['Welcome sir! Aaj disco mein DJ zabardast hai 🕺', 'Candlelight dinner book karein? Madam ko impress karna hai na 😉'],
    bho: ['Welcome sir! Aaj disco mein DJ jabardast ba 🕺', 'Candlelight dinner book kari? Madam ke impress kare ke ba na 😉'],
  },
  gaali: {
    hi: ['Chappal pehen ke five-star mein ghus aaya? Paise hain bhi?', 'Sir, pehle bill dekh lo, phir hero bano 😏'],
    bho: ['Chappal pahin ke five-star mein ghus aaila? Paisa ba bhi?', 'Sir, pahile bill dekh la, tab hero bana 😏'],
  },
  items: [
    { n: '💃 Item Song Dance Show', p: 100, fx: 'show', d: 'Stage pe filmi dance' },
    { n: '💸 Notes ki baarish', p: 50, fx: 'notes', d: 'Dancers pe paise udao' },
    { n: '🍺 Beer', p: 60, fx: 'drunk', mesh: 'bottle', d: '18+ • nasha' },
    { n: '🥃 Desi Tharra', p: 30, fx: 'drunk', mesh: 'glass', d: '18+ • tagda nasha' },
    { n: '🕯️ Candlelight Dinner', p: 150, fx: 'dinner', d: 'Girlfriend ke saath' },
    { n: '🕺 Couple Dance', p: 60, fx: 'coupledance', d: 'Dance floor pe dono' },
    { n: '🍽️ Shahi Thali', p: 80, fx: 'full', mesh: 'plate' },
    { n: '🍹 Mocktail', p: 40, fx: 'turbo', mesh: 'glass' },
    { n: '🛏️ Room — aaram', p: 250, fx: 'room', d: 'Seedha subah' },
  ],
};

export const SCENES = {
  hi: {
    needGf: 'Pehle kisi ko patao! Akele candlelight dinner? 😅 (Ladki se baat karo → Propose)',
    dinner: ['Candle ki roshni, halki si music…', '"Tum aaj bahut sundar lag rahi ho." 🥹', '"Aur tum… thode kam bewakoof" 😄', 'Haath mein haath… 💞', '…aur gaal pe ek pyaari si pappi 😘'],
    dance: ['DJ wale babu, romantic gaana bajao! 🎶', 'Dono ki nazrein mili… 💞', 'Aur duniya ruk gayi 🌙'],
    hug: ['Kas ke jhappi! 🤗💞', '"Kabhi chhod ke mat jaana…"'],
    show: ['🎤 Ladies and gentlemen… aaj ka special item number! 💃', 'Seetiyan aur taaliyan! 👏👏'],
    room: '🛏️ Mast neend li… subah ho gayi! Taaza mehsoos kar rahe ho ☀️',
  },
  bho: {
    needGf: 'Pahile kehu ke pataava! Akele candlelight dinner? 😅 (Laiki se baat kara → Propose)',
    dinner: ['Candle ke roshni, halka music…', '"Tu aaj bahut sundar laagat baadu." 🥹', '"Aur tu… tani kam buddhu" 😄', 'Haath mein haath… 💞', '…aur gaal pe ek pyaar bhari pappi 😘'],
    dance: ['DJ wale babu, romantic gaana bajaava! 🎶', 'Dunu ke nazar milal… 💞', 'Aa duniya tham gail 🌙'],
    hug: ['Kas ke jhappi! 🤗💞', '"Kabahu chhod ke mat jaiha…"'],
    show: ['🎤 Bhaiyo aur bahino… aaj ke special item number! 💃', 'Seeti aur taali! 👏👏'],
    room: '🛏️ Mast neend lihla… bhor ho gail! Taaza laagat ba ☀️',
  },
};

// ===== 18+ gaali — badi list (user ki di hui) =====
Object.assign(UI18.hi, {
  shopGreet: ['Aa gaya bhosdike? Kuch lega bhi ya sirf ghoorega, chirkut?', 'Abe chutiye, jaldi bol kya chahiye, dhanda khoti mat kar!', 'Bakchodi band kar aur maal dekh, gaandu!', 'Saala haramkhor roz aata hai, kharidta jhaant barabar bhi nahi!', 'Zyada shaana mat ban, dedh shaane! Paisa nikaal.', 'Chal be fattu, itna kya soch raha hai? Le le!'],
  noMoney: 'Jeb mein phooti kaudi nahi aur shopping karne aaya hai, chutiye! Teri to waat lagi padi hai 😂',
  cow: 'Abe gadhe ki gaand, gaay ko thokega kya?! 🐄',
  horn: 'Pom pom! Hawa aane de bhosdike, baap ki sadak hai kya? 📯',
  hitPed: ['Abe madarchod, aankhein ghar pe chhod aaya kya?!', 'Bhosdike, aukaat mein reh warna yahin gaad dunga!', 'Teri hekdi abhi nikalta hoon, haramkhor!', 'Zyada charbi chadhi hai kya, gaandu?!'],
  police: ['Ruk bhosdike! Licence dikha!', 'Chal madarchod, thane chal, wahan teri saari bhaukaal nikalenge!', 'Bahut lafanga banta hai? Khopche mein le jaake bajaunga!', 'Ab bhar challan, chirkut!'],
  girlNo: ['Chal nikal chutiye, shakal dekhi hai apni?', 'Hawa aane de, lafange!', 'Bhai ko bulaun? Haddi tod dega teri, fattu!', 'Tere jaise sau ko roz jeb mein leke ghoomti hoon 😏'],
  girlSlap: ['Teri himmat kaise hui, kamine! 👋', 'Chataak! Ghar mein maa-behen nahi hai kya, haramkhor? 👋', 'Lafanga kahin ka! Dobara dikha to chappal se maarungi! 👋', 'Suar ki aulaad! Sharam nahi aati? 👋'],
});
Object.assign(UI18.bho, {
  shopGreet: ['Aa gaile bhosdiwala? Kuchh kinbe ki khali taakat rahbe, chirkut?', 'Ka re chutiya, jaldi bol ka chaahi!', 'Burbak, bakchodi band kar aur maal dekh!', 'Sasura roj aawela, kinela jhaant barabar bhi na!', 'Dedh shaana mat ban, paisa nikaal!'],
  noMoney: 'Jeb mein ek dhela naikhe aur chalal baade kine, chutiya! Tohar ta waat lagal ba 😂',
  cow: 'Ae burbak, gaiya ke thok debe ka?! 🐄',
  horn: 'Pom pom! Hawa aawe de bhosdiwala, tohar baap ke sadak ha ka? 📯',
  hitPed: ['Ae madarchod, aankh ghare chhod aaile ka?!', 'Bhosdiwala, aukaat mein rah na ta ehije gaad deb!', 'Tohar hekdi abhi nikalat bani, haramkhor!', 'Dher charbi chadhal ba ka, burbak?!'],
  police: ['Ruk bhosdiwala! Licence dekha!', 'Chal madarchod, thana chal, uhaan tohar saara bhaukaal nikal jaai!', 'Bahut lampat banat baade? Khopcha mein le ja ke bajaaib!', 'Ab bhar challan, chirkut!'],
  girlNo: ['Chal bhaag chutiya, apan muh dekhle baade?', 'Hawa aawe de, lafanga!', 'Bhaiya ke bolaai? Haddi tor di tohar, fattu!', 'Tohra jaisan sau go ke roj jeb mein le ke ghumila 😏'],
  girlSlap: ['Tohar himmat kaise bhail, kameena! 👋', 'Chataak! Ghar mein maai-bahin naikhe ka, haramkhor? 👋', 'Lampat kahin ke! Phir dikhle ta chappal se maarab! 👋', 'Suar ke aulaad! Laaj naikhe lagat? 👋'],
});
Object.assign(FIGHT18.hi, {
  victim: ['Madarchod, maarta hai? Ruk tujhe batata hoon!', 'Teri hekdi abhi nikalta hoon, bhosdike!', 'Bakwaas band kar warna munh tod dunga!', 'Kutte ka pilla! Ruk zara!', 'Namakharaam! Tujhe khopche mein le jaake bajaunga!'],
  hijack: ['Bhosdike meri gaadi le ke bhaag raha hai! Pakdo haramkhor ko!', 'Utar bhenchod meri gaadi se, chor saala!', 'Abe namakharaam, gaadi wapas kar!'],
  punched: ['Le madarchod! Aur maar khayega?', 'Tere tatte kaanp rahe hain na? 😂', 'Aukaat mein reh, chirkut!', 'Jhand ho gayi na teri? 😂', 'Tere jaise sau ko roz jeb mein leke ghoomta hoon!'],
  honk: ['Pom pom! Hatt bhosdike, beech mein kyun khada hai?!', 'Abe gadhe ki gaand, sadak baap ki hai kya?!', 'Hawa aane de, chutiye!'],
});
Object.assign(FIGHT18.bho, {
  victim: ['Madarchod, maarat baade? Ruk!', 'Tohar hekdi abhi nikalat bani, bhosdiwala!', 'Bakwaas band kar na ta muh tor deb!', 'Kukur ke pilla! Ruk tani!', 'Namakharaam! Khopcha mein le ja ke bajaaib!'],
  hijack: ['Bhosdiwala hamar gaadi le ke bhaagat ba! Pakda haramkhor ke!', 'Utar bhenchod hamra gaadi se, chor sasura!', 'Ae namakharaam, gaadi lauta!'],
  punched: ['Le madarchod! Aur maar khaibe?', 'Tohar tatta kaanpat ba na? 😂', 'Aukaat mein rah, chirkut!', 'Jhand ho gail na tohar? 😂'],
  honk: ['Pom pom! Hatt bhosdiwala, beech mein kaahe thaadh baade?!', 'Ae gadha, sadak tohar baap ke ha ka?!', 'Hawa aawe de, chutiya!'],
});
export const BAR = {
  hi: { notes: ['💸 Paise hi paise! Noton ki baarish!', '💸 Seeti bajao! Aaj to mohalla loot liya 😎'], drunk: ['🍺 Hic! Duniya ghoom rahi hai 🥴', '🥃 Tharra chadh gaya… ab sab apne lag rahe hain 🥴'], sober: 'Nasha utar gaya 😮‍💨', noShow: 'Pehle dance show shuru karwao (💃), phir paise udao!' },
  bho: { notes: ['💸 Paisa hi paisa! Note ke barsaat!', '💸 Seeti bajaava! Aaj ta mohalla loot lihni 😎'], drunk: ['🍺 Hic! Duniya ghumat ba 🥴', '🥃 Tharra chadh gail… ab sab apne laagat baade 🥴'], sober: 'Nasha utar gail 😮‍💨', noShow: 'Pahile dance show shuru karaava (💃), tab paisa udaava!' },
};

// ===== Kallu Kattewala (hathiyaar) + Highway Dhaba =====
export const KALLU = {
  id: 'kallu', color: '#ff4d4d', sign: 'कल्लू', sub: '', name: { hi: 'Kallu Kattewala 🔫', bho: 'Kallu Kattewala 🔫' }, owner: 'Kallu (chupke se…)', avatar: '🕶️',
  greet: { hi: ['Shhh… dheere bol. Maal chahiye? 🔫', 'Police ko bataya to tera bhi hisaab ho jaayega 😶'], bho: ['Shhh… dhire bol. Maal chaahi? 🔫', 'Police ke bataibe ta tohro hisaab ho jaai 😶'] },
  gaali: { hi: ['Abe chirkut, paise dikha pehle!', 'Fattu log hathiyaar nahi rakhte, nikal!'], bho: ['Ae chirkut, pahile paisa dekha!', 'Fattu log hathiyaar na rakhele, nikal!'] },
  items: [
    { n: '🔫 Desi Katta', p: 300, kind: 'gun', gun: 'katta', d: '12 goli' },
    { n: '💥 Dunali (Shotgun)', p: 700, kind: 'gun', gun: 'dunali', d: '8 kaartoos' },
    { n: '🎯 Sniper Rifle', p: 1500, kind: 'gun', gun: 'sniper', d: 'Respect Lv 3+' },
    { n: '📦 Goli refill', p: 50, kind: 'ammo', d: 'Haath wali bandook' },
  ],
};
export const HDHABA = {
  id: 'hdhaba', color: '#ff9a1f', sign: 'शेर-ए-हाईवे ढाबा', sub: 'खटिया • तंदूरी • लस्सी • 24 घंटे',
  name: { hi: 'Highway Dhaba 🍛', bho: 'Highway Dhaba 🍛' }, owner: 'Balwinder paaji', avatar: '🧔',
  greet: { hi: ['Aao ji, lambi drive hai — paratha kha ke jao! 🫓', 'Lassi peeyo, neend bhagao!'], bho: ['Aava ji, lamba safar ba — paratha kha ke ja! 🫓', 'Lassi pi la, neend bhaagi!'] },
  gaali: { hi: ['Truck wale bhi tujhse tez chalate hain, chirkut!', 'Khaata hai ki sirf dekhta rahega, burbak?'], bho: ['Truck wala bhi tohra se tej chalawela, chirkut!', 'Khaibe ki khali taakat rahbe, burbak?'] },
  items: [
    { n: '🫓 Aloo Paratha', p: 50, fx: 'full', mesh: 'samosa' },
    { n: '🍗 Tandoori Plate', p: 120, fx: 'full', mesh: 'plate' },
    { n: '🥛 Patiala Lassi', p: 40, fx: 'turbo', mesh: 'glass' },
    { n: '☕ Truck-wali Chai', p: 15, fx: 'turbo', mesh: 'cup' },
  ],
};
export const MISC3 = {
  hi: { liftUp: '🛗 Chhat pe pahunch gaye! Yahan se poora mohalla dikhta hai 🌆', liftDown: '🛗 Neeche aa gaye', scream: ['Aaaaa! Goli! Bhaago! 😱', 'Bachao! Goli chal rahi hai!', 'Maa! 😱'], behosh: '😵 BEHOSH! Aspataal mein aankh khuli… paise bhi kat gaye', passed: (n, r) => `🏆 MISSION PASSED: ${n} — ₹${r}`, saved: '💾 Game save ho gaya' },
  bho: { liftUp: '🛗 Chhat pe pahunch gaila! Ehija se poora mohalla dekhaela 🌆', liftDown: '🛗 Neeche aa gaila', scream: ['Aaaaa! Goli! Bhaaga! 😱', 'Bachaava! Goli chalat ba!', 'Mai ge! 😱'], behosh: '😵 BEHOSH! Aspataal mein aankh khulal… paisa bhi kat gail', passed: (n, r) => `🏆 MISSION PASSED: ${n} — ₹${r}`, saved: '💾 Game save ho gail' },
};
