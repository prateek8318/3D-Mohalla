# मोहल्ला 3D 🛺

Ek desi neon city jo 3D mein hai. Auto-rickshaw chalao, dukaanein kholo aur gaana bajao. Poori city music ki beat pe naachti hai.

## Features
- **🧭 Mission guidance**: objective pe ➤ teer + distance pill, saaf HUD (kahan jao, kya karo), minimap peela nishaan
- **🔍 YouTube search ab in-app**: naya tab nahi khulta; na mile to free ad-free gaane apne aap
- **Asli time din-raat**: ab game khud phone ke time pe chalta hai (📍 menu se badal sakte ho)
- **Lambi east-west sadak**: Mandir se Masjid tak poora street, dono taraf buildings
- **Aur jode (couples)**: park, ghat, chowk, bench pe baithe (saaf-suthra)
- Minimap flicker fix, building clipping fix
- **🅼 Story missions** (5): Rickshaw ka Raja → Gali ke Gunde → Kallu ka Katta → Chhat ka Sniper → Thullon se Bacho (Respect level se unlock)
- **🔫 Bandook**: Kallu Kattewala (Park) — Katta, Dunali, Sniper; Right-click/R = nishana, Click/J = goli, 1/2/3 = badlo; 3⭐ pe police bhi goli chalati hai, ❤️ health
- **🛗 Hotel ki chhat**: lift se upar, sniper ke saath
- **🛣️ Highway**: 600m, khet, Highway Dhaba, fuel station
- **🪞 Salon**: asli aaina reflection, kursi ke peeche se camera
- **💼 Kaam (K)**: Sawari (taxi), Delivery, Chor pakdo, Baraat — paisa + 🏅 Respect level (progress save hota hai)
- **🚂 Mohalla Junction**: naya station, aati-jaati train; map 430m+ lamba, naya Station Road
- **Accident**: log sadak paar karte hain, takkar pe udte hain, gaali ke bubble
- **E system**: har cheez ke upar naam + [E], jidhar dekho wahi chunao
- **🔍 Music search** (🎵 → Search): gaane ka naam likho, Audius se poora gaana free + ad-free; YouTube search optional (key chahiye)
- **🗺️ Minimap**: GTA jaisa; tap = poora naksha
- **🏨 Hotel Raj Palace**: disco LED floor, item-song dance show, girlfriend ke saath candlelight dinner / couple dance / hug
- **Traffic**: car, kaali-peeli taxi, auto, scooter khud chalte hain (left side); F se kisi ki bhi gaadi chheeno
- **Maar-peet**: J / 👊 se ghoonsa, Bat ya Lathi (Patang Ghar) se maaro; log girte hain, kuch palat ke maarte hain
- **Kood/Daud**: Space / ⤴️ se kood, Shift / 🏃 se daud; khaate-peete hue bhi chal-daud sakte ho
- **Background music**: panel khula ho tab bhi game chalta hai; YouTube chhoti patti mein bajta hai
- **🎬 Cinematic look** (VHS hata diya — Raja Video Library se wapas la sakte ho)
- **Paidal ghoomo**: F se rickshaw se utro/baitho, Shift se daudo, Q se naacho
- **Log hi log**: raahgir, har dukaan mein dukaandaar, balcony pe log/bachche, ghat pe aarti/nahaate log/naav, park mein cricket-patang-taash
- **Jhola (B)**: kharida saaman bag mein, khaate-peete dikhte ho; paan ki pichkaari, patang, gubbara, ittar
- **Salon**: kursi pe baith ke haircut, dadhi, facial, champi
- **Ladkiyan**: baat karo, gift do, propose karo — haan / daant / thappad 👋
- **Police**: gadbad = wanted ⭐, sipahi aur jeep peeche; challan, rishwat ya bhaago
- **Bazaar Gali** (sirf paidal), Bazaar Road, Gandhi Park, Police Thana
- **18+ gaali mode**: 🤬 button do baar, age confirm ke baad
- **90s mahaul**: 📼 VHS film look, STD-PCO, video library, kaali-peeli taxi, scooter, TV antenna, bijli ke taar, filmy posters
- **Subah se raat**: 1 game-ghanta = 30 sec, clock dabao to agla pahar
- **Mandir aur Masjid**: ghanti, aarti, prasad, sewaiyan, dua (bakchodi mode mein bhi yahan izzat se baat)
- **Kutte-billi**: tez rickshaw ke peeche kutte bhaagte hain; biscuit/doodh khilao to saath ghoomenge
- **Filmy kiss scene** (Prem Ghat): letterbox, subtitles aur 90s censor wale phool
- **Explore**: main road, chowk, gate aur Prem Ghat (Ganga kinaara, diye, lantern, chaand)
- **Dukaanein**: Gupta Mishthan, Raju Salon, Pappu Chai, Banarasi Paan, DJ Wale Babu, Litti Chokha, Sharma STD PCO, Raja Video Library, Sharma General Store, Banarasi Chaat
  - Mithai = sugar rush 🌈, chai/lassi = turbo 🚀, fire paan = 🔥, barber = naya hairstyle, champi = 😵
- **Music**: MP3 (ad-free, asli beat sync), YouTube aur Spotify embed, Mic mode, Tap-tempo
- **Bhasha**: Hindi / Bhojpuri toggle, aur 🤬 Bakchodi mode
- Sadak pe ₹ sikke, ghoomti gaay 🐄, horn, ghat pe 💞 Ishq mode
- Responsive: mobile pe joystick, desktop pe WASD

## Chalao
```bash
npm install
npm run dev
```

## Vercel pe deploy
1. GitHub pe repo push karo, phir vercel.com → **Add New Project** → repo import karo (Vite apne aap detect ho jaayega), **Deploy**.
2. Ya CLI se: `npx vercel` (pehli baar) aur phir `npx vercel --prod`.

## Controls
| Desktop | Mobile |
|---|---|
| WASD / Arrows: rickshaw chalao | Joystick |
| F: rickshaw se utro/baitho | 🚶/🛺 button |
| E: dukaan / baat karo | 🛎️ button |
| B: jhola | 🎒 |
| Shift: daudo | Joystick poora dhakelo |
| H: horn | 📯 |
| M: music | 🎵 |
| Mouse drag / scroll: camera | Screen drag |

## YouTube search (optional)
1. Google Cloud Console mein project banao → **YouTube Data API v3** enable karo → Credentials → **API key** banao (free quota roz ~100 searches).
2. Local: `.env.example` ko `.env` naam se copy karo aur key daalo.
3. Vercel: Project → Settings → Environment Variables → `VITE_YT_API_KEY` = key → redeploy.

Bina key ke bhi **🎧 Free** search (Audius) poore gaane bajata hai.

## Save kaise hota hai
- Har 15 sec aur tab band karne pe **browser (localStorage)** mein apne aap save: paisa, respect, story, bandookein, jhola, look.
- 📍 → **💾 Save / Load** → "Save code copy karo" → doosre phone pe "Code daalo". Browser data clear kiya to save mit jaayega, isliye code sambhaal ke rakho.
- Cloud save (login ke saath, har device pe) ke liye Supabase/Firebase jodna padega — free tier kaafi hai.
