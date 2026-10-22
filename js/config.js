window.MoopyGame = window.MoopyGame || {};

window.MoopyGame.Config = {
  // Resolusi internal canvas pixel-art 16:9
  BASE_W: 480,
  BASE_H: 270,
  GROUND_Y: 228,
  GRAVITY: 0.42,

  // Ukuran default karakter (1.0 = Kecil)
  charScale: 1.0,
  dummyBehavior: "static",

  // Jumlah maksimal Dash sebelum terkena cooldown
  maxDashCharges: 3,

  // Durasi Cooldown Skill (60 frame = 1 detik)
  cooldowns: {
    dashL: 120,      // L (Setelah 3x Dash) = 2.0 detik (120 frame)
    ultWolfP: 360,   // P (Ultimate Wolf)   = 6.0 detik (360 frame)
    roarU: 300,      // U (Skill Roar)      = 5.0 detik (300 frame)
    laserI: 600      // I (Laser Beam)      = 10.0 detik (600 frame)
  },

  // Lokasi file gambar di dalam folder assets/
  assetPaths: {
    bg: "assets/background/stage.png",
    heartbar: "assets/ui/heartbar.png",
    menu: "assets/ui/menu.png",
    moopyStickman: "assets/characters/moopy_stickman.png",
    moopyWolf: "assets/characters/moopy_wolf.png",
    dummy: "assets/characters/dummy.png"
  }
};
