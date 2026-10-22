# Shadow Legends

Pixel fighter 1v1 bertema gothic — pilih **Moopy** (feral werewolf), **Simon** (thunder mage), atau **Xeera** (samurai pedang Ame no Habakiri), lalu hancurkan lawan.

## Fitur

- **3 karakter** dengan model & skill berbeda.
- **Sistem energi & evolusi 27 detik** untuk ketiga karakter:
  - Semua mulai dari Energi 0% (Base Form).
  - Basic attack (J), kick (K), proyektil, dan skill (U/I) mengisi energi sampai 100%.
  - Saat penuh (**EVO READY!**), tekan **P** untuk berevolusi.
  - Energi terkuras otomatis selama 27 detik; di 0% karakter kembali ke Base Form.
- **Skill berbeda sebelum vs sesudah evolusi:**
  - **Moopy** — Base: cakaran beruntun / blitz stun. Evo (Dire Wolf): cakaran feral + pusaran pita.
  - **Simon** — Base: 3 gelombang kilat + pukulan; 1 sambaran langit (stun). Evo (Thunder Devil): 3x Thunder Blitz Strike; Cataclysmic Devil Thunderstorm (5 sambaran raksasa merah-emas-biru + stun dahsyat).
  - **Xeera** — Base: dash-slash (CD 2s); Slash Barrier standar (CD 5s). Evo (mata merah + jubah ungu): tebasan raksasa + pilar ungu; Barrier Raksasa 10 detik + batu melayang.

## Kontrol

| Tombol | Aksi |
|--------|------|
| A / ← | Jalan kiri |
| S / D / → | Jalan kanan |
| W / ↑ / Spasi | Lompat (double jump) |
| J | Basic attack (kombo) |
| K | Kick / tendangan |
| L | Dash |
| U | Skill 1 |
| I | Skill 2 |
| P | Evolusi (butuh Energi 100%) |

## Struktur

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js      # konstanta game
│   ├── audio.js       # sound effect
│   ├── particles.js   # sistem efek visual
│   ├── fighter.js     # logika karakter, skill, energi/evolusi
│   └── main.js        # loop game, input, render, HUD
└── assets/
    ├── background/
    ├── characters/
    └── ui/
```

## Menjalankan secara lokal

Game ini murni client-side (tanpa build step). Cukup jalankan static web server dari root folder:

```bash
# Python
python3 -m http.server 8000

# atau Node
npx serve -l 8000
```

Lalu buka `http://localhost:8000/`.

> Catatan: beberapa browser memblokir audio/fitur tertentu kalau dibuka lewat `file://`, jadi disarankan pakai web server.

## Teknologi

Vanilla JavaScript + HTML5 Canvas. Tanpa framework, tanpa dependensi runtime.
