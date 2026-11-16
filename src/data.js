// Saari dukaanein, dialogue, item aur unke effects.
// fx: sugar | turbo | fire | champi | hair | music | full | diya | shayari | romance

export const SHOPS = [
  {
    id: 'mithai', side: -1, z: 45, color: '#ffb000', wall: 0xf5d76e,
    sign: 'गुप्ता मिष्ठान भंडार', sub: 'शुद्ध देसी घी • Since 1972',
    name: { hi: 'Gupta Mishthan Bhandar', bho: 'Gupta Mishthan Bhandar' },
    owner: 'Gupta ji', avatar: '🧔🏽',
    greet: {
      hi: ['Aao aao beta! Garma garam jalebi abhi utri hai, ek plate ho jaaye?', 'Shaadi ho ya result, mithai to Gupta ji ki hi chalegi!', 'Diabetes ki tension mat lo, aaj to cheat day hai 😄'],
      bho: ['Ka ho babua! Ekdam taaza rasgulla ba, khaiba ki na?', 'Mann mithaas se bhar jaai, ek baar chakh ke dekha!', 'Aav aav, tohra khatir special laddoo rakhle bani!'],
    },
    gaali: {
      hi: ['Abe kanjoos! Sirf sungh ke jaayega kya? Kuch kharid le!', 'Oye bhukkad, muh mein paani aa raha hai to paise bhi nikaal!'],
      bho: ['Ka re kanjoos, khali dekhe aail baadu? Kuchho le la!', 'Laar mat tapkaav re, paisa nikaal pahile!'],
    },
    items: [
      { n: 'Jalebi 🍥', p: 30, fx: 'sugar', say: { hi: 'Kurkuri jalebi! Sugar rush shuru 🌈', bho: 'Jalebi ekdam kurkur! Sugar rush chalu 🌈' } },
      { n: 'Kaju Katli 💎', p: 60, fx: 'sugar', say: { hi: 'Ameeron wali mithai, aaj tu bhi ameer 😎', bho: 'Badka log wala mithai, aaj tu bhi badka 😎' } },
      { n: 'Rasgulla ⚪', p: 40, fx: 'sugar', say: { hi: 'Ras tapak raha hai… sambhaal ke!', bho: 'Ras chuat ba… sambhar ke ho!' } },
      { n: 'Gulab Jamun 🟤', p: 35, fx: 'sugar', say: { hi: 'Garam gulab jamun, dil garden garden!', bho: 'Garam gulab jamun, mann gadgad!' } },
      { n: 'Besan Laddoo 🟠', p: 25, fx: 'sugar', say: { hi: 'Maa ke haath jaisa laddoo 🥹', bho: 'Mai ke haath jaisan laddoo 🥹' } },
    ],
  },
  {
    id: 'barber', side: 1, z: 45, color: '#2ef2ff', wall: 0x9ad8ff,
    sign: 'राजू हेयर सैलून', sub: 'AC • Facial • Champi',
    name: { hi: 'Raju Hair Salon', bho: 'Raju Hair Salon' },
    owner: 'Raju Ustaad', avatar: '💈',
    greet: {
      hi: ['Baitho bhai, aisa cut maarenge ki poora mohalla dekhta reh jaayega!', 'Aaj kya banna hai? Hero ya villain?', 'Shaadi mein jaana hai? Special cut milega.'],
      bho: ['Baith ja bhaiya, aisan baal kaatab ki sasural wala pahchanihe na!', 'Aaj hero banaib tohke, guarantee ba!', 'Naya look chahi? Raju ke haath mein jaadu ba.'],
    },
    gaali: {
      hi: ['Abe baal hain ya chidiya ka ghosla? Kab se nahi kataye?', 'Oye jhadoo-sar, baith chup chaap!'],
      bho: ['Ka ho, maatha pe chidiya ke ghonsla bana lele ba ka?', 'Ae jhaadu-kapaar, chupchaap baith!'],
    },
    items: [
      { n: 'Salman Cut 🦁', p: 50, fx: 'hair', hair: 'salman', color: 0x2a1a0e, say: { hi: 'Bhai wala look! Ab shirt utaarne ka mann karega 😂', bho: 'Bhaijaan wala look! Ab tohra se ke bachi 😂' } },
      { n: 'Spiky Jhakaas ⚡', p: 40, fx: 'hair', hair: 'spiky', color: 0x111111, say: { hi: 'Ekdum jhakaas! Gel ki poori dibbi laga di.', bho: 'Ekdam jhakaas! Poora dibba gel laga dihni.' } },
      { n: 'Tapori Mohawk 🔥', p: 60, fx: 'hair', hair: 'mohawk', color: 0xff2d75, say: { hi: 'Pink mohawk! Ab tu mohalle ka rockstar hai 🎸', bho: 'Gulaabi mohawk! Ab tu mohalla ke rockstar 🎸' } },
      { n: 'Ganja Takla 🥚', p: 30, fx: 'hair', hair: 'bald', say: { hi: 'Chamakta takla! Raat mein torch ki zaroorat nahi 😂', bho: 'Chamkat taklaa! Raat mein torch ke jaroorat naikhe 😂' } },
      { n: 'Shareef Cut 🙂', p: 20, fx: 'hair', hair: 'normal', color: 0x111111, say: { hi: 'Sasural wala shareef look. Rishta pakka!', bho: 'Sasuraal wala sharif look. Biyah pakka!' } },
      { n: 'Head Champi 💆', p: 25, fx: 'champi', say: { hi: 'Tel maalish… sar ghoom raha hai na? 😵', bho: 'Tel maalis… kapaar ghumat ba na? 😵' } },
      { n: 'Dadhi rakhwao 🧔', p: 30, fx: 'beard', beard: true, say: { hi: 'Dadhi set! Ab tu Kabir Singh lagta hai 😎', bho: 'Dadhi set! Ab tu ekdam hero lagat baade 😎' } },
      { n: 'Clean Shave 🪒', p: 20, fx: 'beard', beard: false, say: { hi: 'Makkhan jaisa chikna! 🧈', bho: 'Makkhan jaisan chikkan! 🧈' } },
      { n: 'Facial ✨', p: 40, fx: 'facial', say: { hi: 'Chehra chamak gaya, ab ladkiyan dekhengi 😏', bho: 'Chehra chamak gail, ab laikiyan dekhihen 😏' } },
    ],
  },
  {
    id: 'chai', side: -1, z: 20, color: '#ff9a1f', wall: 0xd98c5f,
    sign: 'पप्पू चाय टपरी', sub: 'कटिंग • मसाला • बन मस्का',
    name: { hi: 'Pappu Chai Tapri', bho: 'Pappu Chah Dukaan' },
    owner: 'Pappu', avatar: '☕',
    greet: {
      hi: ['Chai peelo bhai, duniya ki tension baad mein!', 'Ek cutting aur thodi politics ho jaaye?', 'Adrak daal ke, ekdum kadak!'],
      bho: ['Chah pi la ho, dimaag ekdam fresh ho jaai!', 'Ek cutting aur thoda raajneeti ho jaai?', 'Aadi daal ke, ekdam kadak!'],
    },
    gaali: {
      hi: ['Udhaar wale nikal! Pichhla hisaab abhi tak baaki hai!', 'Abe nalle, kaam dhanda kuch hai ya din bhar chai hi peeyega?'],
      bho: ['Udhaari wala babua, pichhla paisa kab dihba?', 'Ae nikamma, din bhar chahe pi ke rahbe ka?'],
    },
    items: [
      { n: 'Cutting Chai ☕', p: 10, fx: 'turbo', say: { hi: 'Kadak chai = Turbo rickshaw! 🚀', bho: 'Kadak chah = Turbo rickshaw! 🚀' } },
      { n: 'Masala Chai 🫖', p: 15, fx: 'turbo', say: { hi: 'Elaichi wali, ab rickshaw udega!', bho: 'Elaichi wala, ab rickshaw udi!' } },
      { n: 'Bun Maska 🍞', p: 20, fx: 'full', say: { hi: 'Maska itna ki boss ko bhi laga sakta hai 😏', bho: 'Etna maska ki boss ke bhi laga sakela 😏' } },
      { n: 'Samosa 🔺', p: 15, fx: 'full', say: { hi: 'Samosa + chai = shaadi se bhi pakka rishta', bho: 'Samosa aur chah = biyah se pakka rishta' } },
    ],
  },
  {
    id: 'paan', side: 1, z: 20, color: '#3dff7a', wall: 0x7fbf6a,
    sign: 'बनारसी पान भंडार', sub: 'खइके पान बनारस वाला',
    name: { hi: 'Banarasi Paan Bhandar', bho: 'Banarasi Paan Bhandar' },
    owner: 'Chaurasia ji', avatar: '🌿',
    greet: {
      hi: ['Khaike paan Banaras wala, khul jaaye band akal ka taala!', 'Meetha ya fire? Aaj kuch dhamaakedaar ho jaaye.'],
      bho: ['Paan khaa la babu, muh laal, mann khush!', 'Meetha ki aag wala? Aaj kuchh dhamaal ho jaai.'],
    },
    gaali: {
      hi: ['Sadak pe peek maari na, to tera rickshaw zabt! Samjha be?', 'Abe lalloo, muh khol aur paan daal, natak mat kar.'],
      bho: ['Sadak pe thook dihba ta tohar tangri tor deb!', 'Ae lalua, muh khol, nautanki mat kar.'],
    },
    items: [
      { n: 'Meetha Paan 🍃', p: 20, fx: 'full', say: { hi: 'Gulkand wala meetha paan, muh mein ghul gaya!', bho: 'Gulkand wala meetha paan, muh mein ghul gail!' } },
      { n: 'Banarasi Paan 🌿', p: 30, fx: 'full', say: { hi: 'Asli Banarasi! Ab tu bhi Don 2 wala gaana gaa 😎', bho: 'Asli Banarasi! Ab tu bhi gaana gaawa 😎' } },
      { n: 'Chocolate Paan 🍫', p: 40, fx: 'sugar', say: { hi: 'Gen-Z wala paan, sugar rush!', bho: 'Naya zamaana ke paan, sugar rush!' } },
      { n: 'FIRE Paan 🔥', p: 60, fx: 'fire', say: { hi: 'AAG LAG GAYI! Muh se dhuaan nikal raha hai 🔥🔥', bho: 'AAG LAG GAIL! Muh se dhuaan niklat ba 🔥🔥' } },
    ],
  },
  {
    id: 'dj', side: -1, z: -25, color: '#b14bff', wall: 0x6a4bbf,
    sign: 'DJ वाले बाबू', sub: 'साउंड • लाइट • शादी पार्टी बुकिंग',
    name: { hi: 'DJ Wale Babu Music Centre', bho: 'DJ Wale Babu Music Centre' },
    owner: 'DJ Bablu', avatar: '🎧',
    greet: {
      hi: ['Gaana bajao, volume badhao, padosi ko jalao!', 'Bass itna denge ki chhat ka plaster gir jaaye!'],
      bho: ['Bajaawa ho DJ, aaj mohalla hilaawe ke ba!', 'Etna bass deb ki chhat hil jaai!'],
    },
    gaali: {
      hi: ['Abe dheemi awaaz mein sunega to kya khaak party hogi!', 'Oye dhakkan, volume full kar warna nikal!'],
      bho: ['Dhire bajaiba ta ka khaak naachal jaai re!', 'Ae dhakkan, volume full kar na ta bhaag!'],
    },
    items: [
      { n: 'Apne Gaane (MP3) 📁', p: 0, fx: 'music', tab: 'mp3', bpm: 120, say: { hi: 'Apna gaana daalo, city asli beat pe naachegi!', bho: 'Apan gaana daala, shahar asli beat pe naachi!' } },
      { n: 'Bhojpuri Bass 🔊', p: 0, fx: 'music', tab: 'yt', q: 'bhojpuri dj song', bpm: 128, say: { hi: 'Bhojpuri bass shuru! Lollypop lagelu vibes 😎', bho: 'Bhojpuri bass chalu! Ab kamariya hili 😎' } },
      { n: 'Bollywood Party 🪩', p: 0, fx: 'music', tab: 'yt', q: 'bollywood party songs', bpm: 118, say: { hi: 'Shaadi wala naagin dance taiyaar!', bho: 'Biyah wala naagin dance taiyaar!' } },
      { n: 'Romantic Slow 💞', p: 0, fx: 'music', tab: 'sp', bpm: 80, say: { hi: 'Dil ko chhoo lene wale gaane…', bho: 'Dil ke chhoo lewe wala gaana…' } },
      { n: 'Haryanvi / Punjabi 🥁', p: 0, fx: 'music', tab: 'yt', q: 'haryanvi punjabi dj songs', bpm: 100, say: { hi: 'Dhol bajega, gabru naachega!', bho: 'Dhol baji, sab naachi!' } },
    ],
  },
  {
    id: 'dhaba', side: 1, z: -25, color: '#ff4b2b', wall: 0xc96a3a,
    sign: 'लिट्टी चोखा कॉर्नर', sub: 'बिहार का असली स्वाद',
    name: { hi: 'Litti Chokha Corner', bho: 'Litti Chokha Corner' },
    owner: 'Chhotu Bhaiya', avatar: '🍛',
    greet: {
      hi: ['Bhook lagi hai? Garam litti, ghee mein dubaake!', 'Khaana khao, aashirwaad pao!'],
      bho: ['Bhookh lagal ba? Garam litti, ghee mein bor ke!', 'Khaa la babu, pet bhar ke!'],
    },
    gaali: {
      hi: ['Abe bhukkad, plate chaat ke rakhna, dhona na pade!', 'Oye petu, teesri baar aaya hai aaj!'],
      bho: ['Ka re bhukhad, thaali chaat ke rakhiha!', 'Ae petu, aaj teesar baar aail baade!'],
    },
    items: [
      { n: 'Litti Chokha 🥟', p: 40, fx: 'full', say: { hi: 'Ghee wali litti! Aatma tript ho gayi 🙏', bho: 'Ghee wala litti! Aatma tript ho gail 🙏' } },
      { n: 'Chole Bhature 🫓', p: 60, fx: 'full', say: { hi: 'Bhatura itna bada ki chhata ban jaaye!', bho: 'Bhatura etna bada ki chhaata ban jaai!' } },
      { n: 'Paneer Butter Masala 🧈', p: 90, fx: 'full', say: { hi: 'Shaadi wala swaad, bina shagun diye 😂', bho: 'Biyah wala swaad, bina nevta ke 😂' } },
      { n: 'Lassi 🥛', p: 30, fx: 'turbo', say: { hi: 'Malai maar ke lassi, energy full!', bho: 'Malai wala lassi, taakat full!' } },
    ],
  },
  {
    id: 'std', side: -1, z: 75, color: '#ffd23f', wall: 0xf2d24b,
    sign: 'STD • ISD • PCO', sub: 'लोकल कॉल ₹1 • रात 9 के बाद आधा रेट',
    name: { hi: 'Sharma STD PCO', bho: 'Sharma STD PCO' },
    owner: 'Sharma ji', avatar: '☎️',
    greet: {
      hi: ['Raat 9 baje ke baad aana, aadha rate lagega!', 'Meter dekh ke baat karna, har second ka paisa hai!'],
      bho: ['Raat nau baje ke baad aava, aadha rate lagi!', 'Meter dekh ke baat kariha, har second ke paisa ba!'],
    },
    gaali: {
      hi: ['Abe kitni der baat karega? Line mein log khade hain!', 'Girlfriend se baat kar raha hai kya? Bill dekh ke behosh ho jaayega!'],
      bho: ['Ka re, ketna der baat karbe? Line lagal ba!', 'Sanghatiya se baat karat baade ka? Bill dekh ke behosh ho jaiba!'],
    },
    items: [
      { n: '📞 Ghar pe call', p: 5, fx: 'call', calls: 'home' },
      { n: '💌 Usko call', p: 10, fx: 'call', calls: 'gf' },
      { n: '✈️ Dubai wale chacha', p: 30, fx: 'call', calls: 'dubai' },
      { n: '📠 Fax bhejo', p: 15, fx: 'call', calls: 'fax' },
    ],
  },
  {
    id: 'video', side: 1, z: 75, color: '#ff3d7f', wall: 0xb04a7a,
    sign: 'राजा वीडियो लाइब्रेरी', sub: 'VCR • कैसेट किराये पर • नई पिक्चर आई है',
    name: { hi: 'Raja Video Library', bho: 'Raja Video Library' },
    owner: 'Raja Bhai', avatar: '📼',
    greet: {
      hi: ['Nayi picture aayi hai! VCR ke saath raat bhar ka ₹50.', 'Cassette rewind karke wapas karna, warna fine lagega!'],
      bho: ['Naya picture aail ba! VCR sanghe raat bhar ke ₹50.', 'Cassette rewind kar ke lautaiha, na ta fine lagi!'],
    },
    gaali: {
      hi: ['Pichhli cassette mein reel kisne phansaayi thi? Tu hi tha na be!', 'Abe kanjoos, ek cassette chaar gharon mein ghumaata hai!'],
      bho: ['Pichhla cassette mein reel ke phansaail rahe? Tuhi rahle na re!', 'Ka re kanjoos, ek cassette chaar ghar mein ghumawela!'],
    },
    items: [
      { n: '📼 90s Romantic Hits', p: 20, fx: 'music', tab: 'yt', q: '90s bollywood romantic songs', bpm: 84, say: { hi: 'Cassette chadh gayi! Ab dil dhak dhak karega 💞', bho: 'Cassette chadh gail! Ab dil dhak dhak kari 💞' } },
      { n: '🎙️ Purane Sadabahar', p: 20, fx: 'music', tab: 'yt', q: 'old hindi evergreen songs', bpm: 90, say: { hi: 'Sadabahar gaane, kabhi purane nahi hote 🎶', bho: 'Sadabahar gaana kabahu purana na hoi 🎶' } },
      { n: '🪕 Bhojpuri Purana', p: 20, fx: 'music', tab: 'yt', q: 'purana bhojpuri geet', bpm: 96, say: { hi: 'Gaon ki mitti ki khushboo wale gaane 🌾', bho: 'Gaon ke maati ke sugandh wala gaana 🌾' } },
      { n: '📺 VHS Mode', p: 0, fx: 'retro', d: 'Film grain + purane rang' },
    ],
  },
  {
    id: 'kirana', side: -1, z: -55, color: '#3dff7a', wall: 0x8fbf5a,
    sign: 'शर्मा जनरल स्टोर', sub: 'हर माल मिलेगा • उधार बंद है',
    name: { hi: 'Sharma General Store', bho: 'Sharma General Store' },
    owner: 'Lala ji', avatar: '🧮',
    greet: {
      hi: ['Bolo kya chahiye? Saabun, tel, toffee, sab milega.', 'Chhutta nahi hai, toffee le lo baaki ka 😄'],
      bho: ['Bola ka chaahi? Saabun, tel, toffee, sab mili.', 'Chhutta naikhe, toffee le la baaki ke 😄'],
    },
    gaali: {
      hi: ['Board padha nahi? UDHAAR BAND HAI!', 'Abe chhote, gullak tod ke aaya hai kya?'],
      bho: ['Board na padhla? UDHAARI BAND BA!', 'Ka re chhotka, gullak tor ke aail baade ka?'],
    },
    items: [
      { n: '🍪 Glucose Biscuit', p: 5, fx: 'full', say: { hi: 'Chai mein dubo ke khana, bachpan yaad aa jaayega 🥹', bho: 'Chah mein bor ke khaiha, bachpan yaad aa jaai 🥹' } },
      { n: '🍬 Orange Toffee', p: 1, fx: 'sugar', say: { hi: 'Ek rupaye ki toffee, khushi lakhon ki 🍬', bho: 'Ek rupaya ke toffee, khushi lakhan ke 🍬' } },
      { n: '🥤 Kaanch wali Cola', p: 10, fx: 'turbo', say: { hi: 'Botal wapas karna, warna ₹5 extra! 🥤', bho: 'Botal lautaiha, na ta ₹5 aur! 🥤' } },
      { n: '🍭 Ice Lolly', p: 2, fx: 'sugar', say: { hi: 'Zabaan laal ho gayi 😛', bho: 'Jeebh laal ho gail 😛' } },
      { n: '🦴 Kutte ke liye biscuit', p: 5, fx: 'dogfood', d: 'Kutta dost ban jaayega' },
      { n: '🥛 Billi ke liye doodh', p: 5, fx: 'catfood', d: 'Billi saath ghoomegi' },
    ],
  },
  {
    id: 'golgappa', side: 1, z: -55, color: '#ff9a1f', wall: 0xd9a441,
    sign: 'बनारसी चाट भंडार', sub: 'गोलगप्पा • टिक्की • दही भल्ला',
    name: { hi: 'Banarasi Chaat Bhandar', bho: 'Banarasi Chaat Bhandar' },
    owner: 'Bhaiya ji', avatar: '🥙',
    greet: {
      hi: ['Aao bhaiya, ek aur? Bas ek aur, bas ek aur 😋', 'Teekha ya meetha? Aankh se paani aa jaayega!'],
      bho: ['Aav bhaiya, ek aur? Bas ek aur 😋', 'Teekha ki meetha? Aankh se lor gir jaai!'],
    },
    gaali: {
      hi: ['Abe paani mat bahaa, puri phat jaayegi!', 'Oye bhukkad, 20 ho gaye, ab bas kar!'],
      bho: ['Ka re, paani mat gira, puri phaat jaai!', 'Ae petu, bees ho gail, ab bas kar!'],
    },
    items: [
      { n: '💧 Golgappe (6)', p: 20, fx: 'full', say: { hi: 'Khatta-meetha-teekha, ek saath! 💥', bho: 'Khatta-meetha-teekha, ek saathe! 💥' } },
      { n: '🌶️ Teekha Golgappa', p: 25, fx: 'fire', say: { hi: 'MIRCHI! Kaan se dhuaan nikla 🔥', bho: 'MIRCHA! Kaan se dhuaan niklal 🔥' } },
      { n: '🥔 Aloo Tikki', p: 30, fx: 'full' },
      { n: '🥣 Dahi Bhalla', p: 35, fx: 'full' },
      { n: '🍨 Kulfi', p: 15, fx: 'sugar', say: { hi: 'Matke wali kulfi, thandak hi thandak 🍨', bho: 'Matka wala kulfi, thandak hi thandak 🍨' } },
    ],
  },
];

// Dharmik jagah: bakchodi mode mein bhi izzat se baat (gaali = greet).
const mandirGreet = {
  hi: ['Jai Bholenath! Aao beta, prasad le lo 🙏', 'Ghanti bajao, mann shaant ho jaayega.'],
  bho: ['Har Har Mahadev! Aav babua, prasad le la 🙏', 'Ghanti bajaa, mann shaant ho jaai.'],
};
export const MANDIR = {
  id: 'mandir', color: '#ff9a1f', sign: 'श्री शिव मंदिर', sub: 'हर हर महादेव',
  name: { hi: 'Shri Shiv Mandir 🛕', bho: 'Shri Shiv Mandir 🛕' }, owner: 'Pujari ji', avatar: '🛕',
  greet: mandirGreet, gaali: mandirGreet,
  items: [
    { n: '🔔 Ghanti bajao', p: 0, fx: 'bell', say: { hi: 'Tunnn… mann shaant ho gaya 🙏', bho: 'Tunnn… mann shaant ho gail 🙏' } },
    { n: '🪔 Aarti', p: 0, fx: 'aarti', say: { hi: 'Aarti shuru… diye jagmaga uthe 🪔', bho: 'Aarti shuru… diya jagmag ho gail 🪔' } },
    { n: '🍬 Prasad', p: 0, fx: 'sugar', say: { hi: 'Boondi ke laddoo ka prasad 🙏', bho: 'Boondi laddoo ke prasad 🙏' } },
    { n: '🙏 Mannat maango', p: 0, fx: 'wish' },
    { n: '🪙 Daan ₹11', p: 11, fx: 'wish' },
  ],
};
const masjidGreet = {
  hi: ['Assalamu alaikum! Aao, sewaiyan kha ke jaana 😊', 'Sukoon ki jagah hai, thoda baitho.'],
  bho: ['Assalamu alaikum! Aava, sewai kha ke jaiha 😊', 'Sukoon ke jagah ba, tani baitha.'],
};
export const MASJID = {
  id: 'masjid', color: '#3dff7a', sign: 'जामा मस्जिद', sub: 'अमन • मोहब्बत • भाईचारा',
  name: { hi: 'Jama Masjid 🕌', bho: 'Jama Masjid 🕌' }, owner: 'Imam sahab', avatar: '🕌',
  greet: masjidGreet, gaali: masjidGreet,
  items: [
    { n: '🍮 Sewaiyan', p: 0, fx: 'sugar', say: { hi: 'Meethi sewaiyan, Eid wala swaad 😋', bho: 'Meetha sewai, Eid wala swaad 😋' } },
    { n: '🌹 Ittar lagao', p: 10, fx: 'full', say: { hi: 'Gulaab ka ittar, poora mohalla mehak gaya 🌹', bho: 'Gulaab ke ittar, poora mohalla gamak gail 🌹' } },
    { n: '🤲 Dua maango', p: 0, fx: 'wish' },
    { n: '🌙 Eid Mubarak', p: 0, fx: 'eid', say: { hi: 'Eid Mubarak! Gale milo 🤗', bho: 'Eid Mubarak! Gala mila 🤗' } },
  ],
};

export const WISHES = {
  hi: ['Pariksha mein pass ho jaoge… bas padhai bhi kar lena 😄', 'Naukri lagegi, aur achhi lagegi 🙏', 'Jo socha hai wo milega, sabr rakho 🌸', 'Ghar mein sukh-shanti rahegi 🙏', 'Jiska intezaar hai, wo jaldi milega 💞'],
  bho: ['Pariksha mein pass ho jaiba… bas padhai bhi kar liha 😄', 'Naukri lagi, aur badhiya lagi 🙏', 'Je sochle baada, u mili, sabr rakha 🌸', 'Ghar mein sukh-shanti rahi 🙏', 'Jekar intezaar ba, u jaldi mili 💞'],
};

export const CALLS = {
  hi: {
    home: ['Maa: "Khaana khaya? Kab aa raha hai ghar?" 🥹', 'Papa: "Phone rakh, bill badh raha hai!" 😤'],
    gf: ['"Hello? …arre uske papa ne utha liya! Kaato kaato!" 😱', '"Kal 4 baje, mandir ke peeche, peepal ke ped ke paas 💕"'],
    dubai: ['Chacha: "Beta, VCR aur ghadi bhej raha hoon!" 📼', 'Chacha: "Hello? Awaaz kat rahi hai… HELLO?" 📡'],
    fax: ['Fax gaya… kaagaz atak gaya 😂', 'Kiiii-krrrr… fax pahunch gaya ✅'],
  },
  bho: {
    home: ['Mai: "Khaana khaile ki na? Kab aaiba ghare?" 🥹', 'Babuji: "Phone rakh, bill badhat ba!" 😤'],
    gf: ['"Hello? …are oke babuji utha lihle! Kaata kaata!" 😱', '"Kaal chaar baje, mandir ke peechhe, peepal tare 💕"'],
    dubai: ['Chacha: "Babua, VCR aur ghadi bhejat bani!" 📼', 'Chacha: "Hello? Awaaz katat ba… HELLO?" 📡'],
    fax: ['Fax gail… kaagaj phans gail 😂', 'Kiiii-krrrr… fax pahunch gail ✅'],
  },
};

export const GENERIC = {
  hi: ['Waah! Maza aa gaya 😋', 'Paisa vasool! 👌'],
  bho: ['Waah! Majaa aa gail 😋', 'Paisa vasool! 👌'],
};

export const KISS_LINES = {
  hi: ['Chaand gawah hai, Ganga gawah hai… 🌙', 'Ye pal yahin tham jaaye… 💞', '🌸 Censor board ne yahan phool laga diye 🌸', 'Aur phir… picture abhi baaki hai! 🎬'],
  bho: ['Chaand gawah ba, Ganga maiya gawah baadi… 🌙', 'Ee pal ehije tham jaai… 💞', '🌸 Censor board ehijaa phool laga dihlas 🌸', 'Aa phir… picture abhi baaki ba! 🎬'],
};

export const PHASES = {
  hi: { morning: 'Subah', noon: 'Dopahar', evening: 'Shaam', night: 'Raat' },
  bho: { morning: 'Bhor', noon: 'Dupahariya', evening: 'Saanjh', night: 'Raat' },
};

export const GHAT = {
  id: 'ghat', color: '#ff5c97',
  sign: 'प्रेम घाट', sub: 'गंगा आरती • शाम 7 बजे',
  name: { hi: 'Prem Ghat 🌙', bho: 'Prem Ghat 🌙' },
  owner: 'Ganga kinaare, chaand ke neeche', avatar: '🌙',
  greet: {
    hi: ['Thandi hawa, chaand, diye aur tum… isse romantic aur kya hoga? 💞', 'Ghat ki seedhiyon pe baith ke dil ki baat keh do.'],
    bho: ['Thanda hawa, chaand, diya aur tu… ehse romantic ka hoi? 💞', 'Ghat ke seedhi pe baith ke mann ke baat kah da.'],
  },
  gaali: {
    hi: ['Abe single, yahan akele kya kar raha hai? Diya hi baha de 😂', 'Itna sharma kyun raha hai be, bol de dil ki baat!'],
    bho: ['Ka re akela, ehijaa ka karat baade? Diya hi baha da 😂', 'Etna kahe sharmaat baade, kah da mann ke baat!'],
  },
  items: [
    { n: '💋 Filmy Kiss Scene', p: 0, fx: 'kiss', d: '90s style 🎬' },
    { n: '🪔 Diya bahao', p: 0, fx: 'diya', say: { hi: 'Diya Ganga ji mein… mannat maangi? 🙏', bho: 'Diya bah gail, mannat maang la 🙏' } },
    { n: '💌 Shayari suno', p: 0, fx: 'shayari' },
    { n: '💞 Ishq Mode', p: 0, fx: 'romance', d: 'Pink lights + hearts' },
    { n: '🎶 Romantic gaana', p: 0, fx: 'music', tab: 'sp', bpm: 76 },
    { n: '☕ Kulhad chai for two', p: 30, fx: 'full', say: { hi: 'Do kulhad, ek chaand, aur dher saari baatein ☕☕', bho: 'Du kulhad, ek chaand, aur dher saara baat ☕☕' } },
  ],
};

export const SHAYARI = {
  hi: [
    'Tumhari muskaan pe Banaras ka ghat bhi sharma jaaye,\nchaand bhi dekhe tumhe to raasta bhool jaaye 🌙',
    'Ganga ki lehron si hai teri baatein,\nbas yunhi kat jaayein saari raatein 💞',
    'Diya jalaaya hai tere naam ka,\nab andhera bhi dushman nahi kisi kaam ka 🪔',
    'Chai ki chuski aur tera saath,\nisse meetha kuch nahi, ye hai pakki baat ☕',
  ],
  bho: [
    'Tohra aankh mein Ganga ji ke dhaar ba,\nhamra dil mein bas tohre pyaar ba 💞',
    'Chaand bhi sharmaa jaai tohra muskaan pe,\njaan luta deb ham tohra ek pehchaan pe 🌙',
    'Ghat ke seedhi, thanda bayaar,\ntu saath ba ta sab kuchh gulzaar 🪔',
    'Litti chokha aur tohar saath,\nehse badhiya ka hoi kauno baat ☕',
  ],
};

export const UI = {
  hi: {
    prompt: (n) => `E dabao / 🛎️ — ${n}`,
    noMoney: 'Jeb khaali hai bhai! Sadak pe ₹ sikke dhoondo 🪙',
    coin: '+₹20 mil gaye! 🪙',
    cow: 'Arre gaay mata ko takkar mat maaro! 🐄',
    horn: 'Pom pom! 📯 Side do bhai!',
    romanceOn: 'Ishq mode ON 💞',
    romanceOff: 'Ishq mode OFF 😅',
    bought: (i, p) => `${i} liya — ₹${p} kate`,
    free: 'Free',
    turbo: '🚀 Turbo', sugar: '🌈 Sugar rush', fire: '🔥 Muh mein aag', champi: '😵 Champi',
    welcome: 'Swagat hai mohalle mein! Sikke uthao, dukaan kholo 🛺',
    bark: 'Bhow bhow! 🐕 Kutta peeche pad gaya, bhaago!',
    meow: 'Meow… 🐈',
    dogFriend: 'Kalu daudta hua aa raha hai, ab tumhara dost hai 🐕❤️',
    catFriend: 'Billi rickshaw ki chhat pe baith gayi 🐈',
  },
  bho: {
    prompt: (n) => `E dabaa / 🛎️ — ${n}`,
    noMoney: 'Jeb khaali ba ho! Sadak pe sikka bitoro 🪙',
    coin: '+₹20 mil gail! 🪙',
    cow: 'Ae babua, gaiya ke dhakka mat maara! 🐄',
    horn: 'Pom pom! 📯 Hata ho bhaiya!',
    romanceOn: 'Ishq mode ON 💞',
    romanceOff: 'Ishq mode OFF 😅',
    bought: (i, p) => `${i} lihla — ₹${p} kat gail`,
    free: 'Free',
    turbo: '🚀 Turbo', sugar: '🌈 Mitha nasha', fire: '🔥 Muh mein aag', champi: '😵 Champi',
    welcome: 'Mohalla mein swagat ba! Sikka bitora, dukaan khola 🛺',
    bark: 'Bhow bhow! 🐕 Kukur peechhe lag gail, bhaaga!',
    meow: 'Meow… 🐈',
    dogFriend: 'Kalua daudat aawat ba, ab tohar dost ba 🐕❤️',
    catFriend: 'Billi rickshaw ke chhat pe baith gail 🐈',
  },
  bak: {
    hi: {
      cow: 'Abe andhe! Gaay ko thok dega kya? 🐄😡',
      noMoney: 'Abe kangaal! Jeb mein phooti kaudi nahi, chala shopping karne 😂',
      horn: 'Pom pom! Hatt be, beech sadak pe khada hai! 📯',
      bark: 'Bhow! Abe kutta bhi tujhse pareshaan hai, bhaag 😂',
    },
    bho: {
      cow: 'Ka re aanhar! Gaiya ke thok debe ka? 🐄😡',
      noMoney: 'Ka re kangla! Paisa naikhe aur chalal baade kharide 😂',
      horn: 'Pom pom! Hatt re, beech sadak pe thaadh ba! 📯',
      bark: 'Bhow! Kukuro tohra se pareshaan ba, bhaag 😂',
    },
  },
};

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
