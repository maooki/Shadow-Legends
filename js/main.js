window.MoopyGame = window.MoopyGame || {};

(function (G) {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");

  var SCALE_RES = 2;
  canvas.width = G.Config.BASE_W * SCALE_RES;
  canvas.height = G.Config.BASE_H * SCALE_RES;

  var gamePaused = true;
  var selectedCharId = "moopy";
  var keys = { a: false, s: false };

  G.Camera = {
    shake: 0
  };

  var LoadedAssets = {
    bg: null,
    heartbar: null,
    menu: null,
    moopyStickman: null,
    moopyWolf: null,
    dummy: null
  };

  var bgCache = document.createElement("canvas");
  bgCache.width = G.Config.BASE_W * SCALE_RES;
  bgCache.height = G.Config.BASE_H * SCALE_RES;

  function buildGothicStageCache() {
    var bctx = bgCache.getContext("2d");
    bctx.save();
    bctx.scale(SCALE_RES, SCALE_RES);

    var W = G.Config.BASE_W;
    var H = G.Config.BASE_H;
    var GY = G.Config.GROUND_Y;

    var skyGrad = bctx.createLinearGradient(0, 0, 0, GY);
    skyGrad.addColorStop(0, "#66586e");
    skyGrad.addColorStop(0.55, "#87748b");
    skyGrad.addColorStop(1, "#5c4f66");
    bctx.fillStyle = skyGrad;
    bctx.fillRect(0, 0, W, GY);

    bctx.fillStyle = "rgba(72, 62, 84, 0.55)";
    bctx.beginPath();
    bctx.arc(145, 95, 78, Math.PI * 0.7, Math.PI * 2.1);
    bctx.arc(165, 95, 42, Math.PI * 2.1, Math.PI * 0.7, true);
    bctx.fill();

    bctx.strokeStyle = "rgba(225, 90, 120, 0.22)";
    bctx.lineWidth = 10;
    bctx.lineCap = "round";
    bctx.beginPath();
    bctx.moveTo(130, 62);
    bctx.bezierCurveTo(190, 115, 250, 80, 295, 18);
    bctx.stroke();

    bctx.fillStyle = "rgba(215, 200, 220, 0.25)";
    bctx.beginPath();
    bctx.arc(278, 72, 18, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#7a6980";
    bctx.beginPath();
    bctx.arc(282, 73, 12, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = "#52465c";
    bctx.beginPath();
    bctx.moveTo(315, GY);
    bctx.lineTo(315, 125);
    bctx.lineTo(324, 92);
    bctx.lineTo(331, 120);
    bctx.lineTo(337, 56);
    bctx.lineTo(344, 115);
    bctx.lineTo(352, 84);
    bctx.lineTo(360, 118);
    bctx.lineTo(368, 96);
    bctx.lineTo(376, 130);
    bctx.lineTo(376, GY);
    bctx.closePath();
    bctx.fill();

    var castleWins = [[336, 98], [326, 126], [348, 118], [358, 112], [339, 134]];
    bctx.fillStyle = "#f43f5e";
    for (var cw = 0; cw < castleWins.length; cw++) {
      bctx.fillRect(castleWins[cw][0], castleWins[cw][1], 2, 3.5);
    }

    bctx.fillStyle = "#3f364a";
    bctx.beginPath();
    bctx.arc(95, GY, 55, Math.PI, 0);
    bctx.arc(195, GY, 38, Math.PI, 0);
    bctx.arc(365, GY, 52, Math.PI, 0);
    bctx.fill();

    bctx.strokeStyle = "#241f30";
    bctx.lineWidth = 7;
    bctx.lineCap = "round";
    bctx.beginPath();
    bctx.moveTo(95, GY);
    bctx.bezierCurveTo(80, 185, 135, 155, 145, 95);
    bctx.stroke();

    bctx.lineWidth = 3.5;
    bctx.beginPath();
    bctx.moveTo(125, 142);
    bctx.bezierCurveTo(95, 130, 82, 100, 102, 102);
    bctx.moveTo(132, 132);
    bctx.bezierCurveTo(165, 125, 195, 95, 208, 108);
    bctx.moveTo(145, 95);
    bctx.bezierCurveTo(158, 72, 132, 68, 138, 82);
    bctx.stroke();

    bctx.fillStyle = "#120f1a";
    bctx.beginPath();
    bctx.ellipse(141, 69, 5.5, 8.5, 0.25, 0, Math.PI * 2);
    bctx.fill();
    bctx.beginPath();
    bctx.arc(144, 61, 4, 0, Math.PI * 2);
    bctx.fill();
    bctx.beginPath();
    bctx.moveTo(147, 60);
    bctx.lineTo(151, 62);
    bctx.lineTo(147, 63);
    bctx.fill();
    bctx.fillRect(136, 75, 2.5, 9);
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(144.5, 60.5, 1.5, 1.5);

    var lx = 224;
    bctx.strokeStyle = "#171421";
    bctx.lineWidth = 2.5;
    bctx.beginPath();
    bctx.moveTo(lx, GY);
    bctx.lineTo(lx, 152);
    bctx.stroke();

    var halo = bctx.createRadialGradient(lx, 144, 2, lx, 144, 22);
    halo.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    halo.addColorStop(0.5, "rgba(235, 230, 245, 0.22)");
    halo.addColorStop(1, "rgba(235, 230, 245, 0)");
    bctx.fillStyle = halo;
    bctx.beginPath();
    bctx.arc(lx, 144, 22, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = "#171421";
    bctx.beginPath();
    bctx.moveTo(lx - 8, 138);
    bctx.lineTo(lx, 130);
    bctx.lineTo(lx + 8, 138);
    bctx.closePath();
    bctx.fill();
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(lx - 5, 138, 10, 11);
    bctx.strokeStyle = "#171421";
    bctx.lineWidth = 1.2;
    bctx.strokeRect(lx - 5, 138, 10, 11);
    bctx.beginPath();
    bctx.moveTo(lx - 2, 138);
    bctx.lineTo(lx - 2, 149);
    bctx.moveTo(lx + 2, 138);
    bctx.lineTo(lx + 2, 149);
    bctx.stroke();

    var ux = 274;
    bctx.fillStyle = "#120f1a";
    bctx.beginPath();
    bctx.arc(ux, 196, 4.5, 0, Math.PI * 2);
    bctx.moveTo(ux - 5, 200);
    bctx.quadraticCurveTo(ux - 9, 216, ux - 6, 224);
    bctx.lineTo(ux + 6, 224);
    bctx.quadraticCurveTo(ux + 8, 212, ux + 4, 200);
    bctx.fill();
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(ux - 2, 195, 1.4, 1.4);
    bctx.fillRect(ux + 1, 195, 1.4, 1.4);

    bctx.strokeStyle = "#120f1a";
    bctx.lineWidth = 1.6;
    bctx.beginPath();
    bctx.moveTo(ux + 12, GY);
    bctx.lineTo(ux + 12, 155);
    bctx.stroke();
    bctx.fillStyle = "#120f1a";
    bctx.beginPath();
    bctx.arc(ux + 12, 174, 17, Math.PI, 0);
    bctx.fill();

    bctx.fillStyle = "#14111d";
    bctx.fillRect(0, 115, 52, GY - 115);
    bctx.fillRect(0, 115, 62, 16);
    bctx.fillRect(425, 155, 55, GY - 155);
    bctx.fillRect(435, 52, 45, 115);
    bctx.fillRect(415, 68, 65, 22);

    bctx.strokeStyle = "#14111d";
    bctx.lineWidth = 2;
    bctx.beginPath();
    bctx.moveTo(355, 185);
    bctx.quadraticCurveTo(395, 205, 445, 198);
    for (var fp = 358; fp <= 430; fp += 16) {
      bctx.moveTo(fp, 182);
      bctx.lineTo(fp - 3, GY);
    }
    bctx.stroke();

    var blossoms = [
      [38, 120], [45, 126], [22, 188], [28, 194], [88, 218], [96, 222],
      [115, 122], [134, 112], [156, 92], [178, 112], [202, 104],
      [164, 222], [312, 221], [322, 224], [385, 223],
      [428, 72], [436, 78], [442, 160], [456, 132]
    ];
    for (var bl = 0; bl < blossoms.length; bl++) {
      bctx.fillStyle = bl % 2 === 0 ? "#f43f5e" : "#fb7185";
      bctx.beginPath();
      bctx.arc(blossoms[bl][0], blossoms[bl][1], 2.2, 0, Math.PI * 2);
      bctx.fill();
    }

    var waterGrad = bctx.createLinearGradient(0, GY, 0, H);
    waterGrad.addColorStop(0, "#1c1829");
    waterGrad.addColorStop(0.3, "#3b344a");
    waterGrad.addColorStop(1, "#1e1a29");
    bctx.fillStyle = waterGrad;
    bctx.fillRect(0, GY, W, H - GY);

    bctx.fillStyle = "#120f1a";
    bctx.fillRect(0, GY - 2, W, 3.5);

    bctx.fillStyle = "rgba(226, 232, 240, 0.35)";
    for (var wy = GY + 5; wy < H - 4; wy += 4) {
      var rw = 48 - (wy - GY) * 0.9;
      bctx.fillRect(lx - rw * 0.5, wy, rw, 1.5);
    }

    bctx.fillStyle = "#0e0c14";
    bctx.beginPath();
    bctx.moveTo(105, H - 6);
    bctx.quadraticCurveTo(145, GY + 8, 188, H - 6);
    bctx.moveTo(335, H - 8);
    bctx.quadraticCurveTo(385, GY + 12, 435, H - 8);
    bctx.fill();

    bctx.restore();
  }

  function removeSolidBackground(img) {
    try {
      var off = document.createElement("canvas");
      off.width = img.width;
      off.height = img.height;
      var octx = off.getContext("2d");
      octx.drawImage(img, 0, 0);
      var imgData = octx.getImageData(0, 0, off.width, off.height);
      var data = imgData.data;
      var bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];
      if (bgA > 240) {
        for (var i = 0; i < data.length; i += 4) {
          var dr = Math.abs(data[i] - bgR);
          var dg = Math.abs(data[i + 1] - bgG);
          var db = Math.abs(data[i + 2] - bgB);
          if (dr < 24 && dg < 24 && db < 24) {
            data[i + 3] = 0;
          }
        }
        octx.putImageData(imgData, 0, 0);
        return off;
      }
    } catch (err) {}
    return img;
  }

  function tryLoadFolderAsset(path, key, statusElId) {
    var img = new Image();
    img.onload = function () {
      LoadedAssets[key] = key === "heartbar" ? removeSolidBackground(img) : img;
      if (key === "menu") {
        var box = document.getElementById("customMenuBannerBox");
        var bannerImg = document.getElementById("customMenuBannerImg");
        if (box && bannerImg) {
          bannerImg.src = img.src;
          box.classList.remove("hidden");
        }
      }
      var st = document.getElementById(statusElId);
      if (st) {
        st.textContent = "Aktif dari folder: " + path;
        st.className = "text-sm text-emerald-400";
      }
    };
    img.src = path;
  }

  function initFolderAssets() {
    var p = G.Config.assetPaths;
    tryLoadFolderAsset(p.bg, "bg", "statusBgAsset");
    tryLoadFolderAsset(p.heartbar, "heartbar", "statusHeartAsset");
    tryLoadFolderAsset(p.menu, "menu", "statusMenuAsset");
    tryLoadFolderAsset(p.moopyStickman, "moopyStickman", "statusMoopyAsset");
    tryLoadFolderAsset(p.moopyWolf, "moopyWolf", "statusWolfAsset");
    tryLoadFolderAsset(p.dummy, "dummy", "");
  }

  var startPlayOverlay = document.getElementById("startPlayOverlay");
  var charSelectOverlay = document.getElementById("charSelectOverlay");
  var cardMoopy = document.getElementById("cardSelectMoopy");
  var cardSimon = document.getElementById("cardSelectSimon");
  var cardXeera = document.getElementById("cardSelectXeera");

  function selectCharacter(id) {
    selectedCharId = id;
    G.moopy.charId = id;
    G.moopy.isWolf = false;
    G.moopy.evoTimer = 0;
    G.moopy.energy = 0;
    G.moopy.state = "idle";
    G.moopy.stateTimer = 0;
    G.moopy.attackType = "";
    G.moopy.blitzRemaining = 0;
    G.moopy.blitzTimer = 0;
    G.moopy.stormTimer = 0;
    G.moopy.vx = 0;
    G.moopy.vy = 0;
    G.moopy.y = G.Config.GROUND_Y;
    G.moopy.onGround = true;
    G.moopy.jumpsUsed = 0;
    G.FX.slashBarriers.length = 0;
    G.FX.windSlashes.length = 0;
    G.FX.giantCleaves.length = 0;
    G.FX.feralArcs.length = 0;
    G.FX.ribbonVortices.length = 0;
    G.FX.xCrossClaws.length = 0;
    G.FX.feralSpeedLines.length = 0;
    G.FX.roarWaves.length = 0;
    G.Actions.updateModeBadge();

    var baseClass = "pixel-box p-3 cursor-pointer border-4 border-[#4a3f6b] bg-[#120e24] opacity-80 transition-all flex flex-col items-center text-center";
    if (cardMoopy) cardMoopy.className = baseClass;
    if (cardSimon) cardSimon.className = baseClass;
    if (cardXeera) cardXeera.className = baseClass;

    if (id === "moopy" && cardMoopy) {
      cardMoopy.className = "pixel-box p-3 cursor-pointer border-4 border-cyan-400 bg-[#1c1538] transition-all flex flex-col items-center text-center";
    } else if (id === "simon" && cardSimon) {
      cardSimon.className = "pixel-box p-3 cursor-pointer border-4 border-amber-400 bg-[#1c1538] transition-all flex flex-col items-center text-center";
    } else if (id === "xeera" && cardXeera) {
      cardXeera.className = "pixel-box p-3 cursor-pointer border-4 border-purple-400 bg-[#1c1538] transition-all flex flex-col items-center text-center";
    }
  }

  document.getElementById("btnPlayNow").addEventListener("click", function () {
    startPlayOverlay.classList.add("hidden");
    charSelectOverlay.classList.remove("hidden");
    G.Sound.init();
  });
  document.getElementById("btnPlayAssets").addEventListener("click", function () {
    document.getElementById("assetsModal").classList.remove("hidden");
  });
  document.getElementById("btnPlayMoves").addEventListener("click", function () {
    document.getElementById("movesModal").classList.remove("hidden");
  });
  document.getElementById("btnBackToPlay").addEventListener("click", function () {
    charSelectOverlay.classList.add("hidden");
    startPlayOverlay.classList.remove("hidden");
  });

  if (cardMoopy) cardMoopy.addEventListener("click", function () { selectCharacter("moopy"); });
  if (cardSimon) cardSimon.addEventListener("click", function () { selectCharacter("simon"); });
  if (cardXeera) cardXeera.addEventListener("click", function () { selectCharacter("xeera"); });

  document.getElementById("btnConfirmChar").addEventListener("click", function () {
    selectCharacter(selectedCharId);
    charSelectOverlay.classList.add("hidden");
    gamePaused = false;
    G.Sound.init();
  });
  document.getElementById("btnChangeChar").addEventListener("click", function () {
    document.getElementById("mainMenuOverlay").classList.add("hidden");
    charSelectOverlay.classList.remove("hidden");
    gamePaused = true;
  });

  function highlightButton(k, isDown) {
    var btn = document.querySelector('.key-btn[data-key="' + k + '"]');
    if (btn) {
      if (isDown) btn.classList.add("active-key");
      else btn.classList.remove("active-key");
    }
  }

  function handleKeyDown(key) {
    if (gamePaused) return;
    var k = key.toLowerCase();
    highlightButton(k, true);

    if (k === "w" || k === "arrowup" || k === " ") G.Actions.jump();
    else if (k === "a" || k === "arrowleft") keys.a = true;
    else if (k === "s" || k === "d" || k === "arrowright") keys.s = true;
    else if (k === "j") G.Actions.basicAttackJ();
    else if (k === "k") G.Actions.kickAttackK();
    else if (k === "l") G.Actions.dash();
    else if (k === "p") G.Actions.ultimateTransformP();
    else if (k === "u") G.Actions.wolfRoarU();
    else if (k === "i") G.Actions.wolfLaserI();
  }

  function handleKeyUp(key) {
    var k = key.toLowerCase();
    highlightButton(k, false);
    if (k === "a" || k === "arrowleft") keys.a = false;
    if (k === "s" || k === "d" || k === "arrowright") keys.s = false;
  }

  window.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) return;
    var k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "j", "k", "l", "p", "u", "i", "arrowup", "arrowleft", "arrowright", " "].indexOf(k) !== -1) {
      e.preventDefault();
    }
    if (e.repeat && ["w", "j", "k", "l", "p", "u", "i", "arrowup", " "].indexOf(k) !== -1) return;
    handleKeyDown(k);
  });

  window.addEventListener("keyup", function (e) {
    handleKeyUp(e.key);
  });

  document.querySelectorAll(".key-btn").forEach(function (btn) {
    var keyName = btn.getAttribute("data-key");
    btn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      handleKeyDown(keyName);
    });
    btn.addEventListener("pointerup", function (e) {
      e.preventDefault();
      handleKeyUp(keyName);
    });
    btn.addEventListener("pointerleave", function () {
      handleKeyUp(keyName);
    });
  });

  function updateBottomSkillButtons() {
    var m = G.moopy;
    var elL = document.getElementById("cdTextL");
    var elP = document.getElementById("cdTextP");
    var elU = document.getElementById("cdTextU");
    var elI = document.getElementById("cdTextI");

    if (elL) elL.textContent = m.cd.dash > 0 ? (m.cd.dash / 60).toFixed(1) + "s" : "";
    // Tombol P untuk SEMUA karakter: persen energi -> MAX -> hitung mundur detik saat evolusi aktif.
    if (elP) {
      if (m.isWolf) {
        elP.textContent = ((m.energy / m.maxEnergy) * 27).toFixed(1) + "s";
      } else if (m.energy < m.maxEnergy) {
        elP.textContent = Math.floor(m.energy) + "%";
      } else {
        elP.textContent = "MAX";
      }
    }
    if (elU) elU.textContent = m.cd.roar > 0 ? (m.cd.roar / 60).toFixed(1) + "s" : "";
    if (elI) elI.textContent = m.cd.laser > 0 ? (m.cd.laser / 60).toFixed(1) + "s" : "";
  }

  function updateGame() {
    if (gamePaused) return;

    var m = G.moopy;
    var d = G.dummy;
    var cfg = G.Config;
    var s = cfg.charScale;

    m.animTick++;
    if (m.isWolf) m.wolfAuraTimer++;
    if (m.comboWindow > 0) m.comboWindow--;
    if (m.comboResetTimer > 0) {
      m.comboResetTimer--;
      if (m.comboResetTimer === 0) m.comboCount = 0;
    }

    // Energi & durasi evolusi (27 detik) berlaku sama untuk Moopy, Simon, dan Xeera.
    G.Actions.updateEnergyDrain();

    if (m.cd.dash > 0) {
      m.cd.dash--;
      if (m.cd.dash === 0) m.dashCharges = m.maxDashCharges;
    }
    if (m.cd.wolf > 0) m.cd.wolf--;
    if (m.cd.roar > 0) m.cd.roar--;
    if (m.cd.laser > 0) m.cd.laser--;

    updateBottomSkillButtons();

    m.displayHp += (m.hp - m.displayHp) * 0.15;
    d.displayHp += (d.hp - d.displayHp) * 0.15;

    if (m.isWolf && m.animTick % 5 === 0) {
      var pCol = m.charId === "xeera"
        ? (Math.random() > 0.5 ? "#a855f7" : "#f43f5e")
        : (m.charId === "simon"
          ? (Math.random() > 0.5 ? "#00e5ff" : "#ffbe0b")
          : (Math.random() > 0.5 ? "#e11d48" : "#a855f7"));
      G.FX.particles.push({
        x: m.x + (Math.random() * 18 - 9) * s,
        y: m.y - Math.random() * 16 * s,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.9 - Math.random() * 0.7,
        size: 2,
        color: pCol,
        gravity: 0,
        life: 13
      });
    }

    // =========================================================================
    // UPDATE SKILL U EVOLUSI XEERA: TEBASAN BESAR & EFEK UNGU SUSULAN BERUNTUN
    // =========================================================================
    for (var gcIdx = G.FX.giantCleaves.length - 1; gcIdx >= 0; gcIdx--) {
      var gc = G.FX.giantCleaves[gcIdx];
      gc.age++;

      // Saat pedang raksasa menghantam tanah (Age 26): Ledakan utama!
      if (gc.age === 26) {
        G.Sound.play("laser");
        G.Camera.shake = 12;
        G.FX.spawnStarImpact(gc.epicenterX, gc.epicenterY - 14, 1.5);
        var inCleaveZone = (gc.facing === 1 && d.x >= gc.originX - 15 && d.x <= gc.epicenterX + 125) ||
                           (gc.facing === -1 && d.x <= gc.originX + 15 && d.x >= gc.epicenterX - 125);
        if (inCleaveZone) {
          G.Actions.applyDamageToDummy(42, 4.5, -3.5, "#d946ef", "", false);
        }
      }

      // Diikuti Efek-Efek Ungu Beruntun (Age 30 - 120): Tebasan silang ungu & pilar ungu + Multi-Hit!
      if (gc.age > 28 && gc.age < 120) {
        if (gc.age % 6 === 0) {
          var rx = gc.epicenterX + (Math.random() * 150 - 75);
          var ry = gc.epicenterY - 12 - Math.random() * 95;
          gc.afterSlashes.push({
            x: rx,
            y: ry,
            len: 22 + Math.random() * 26,
            angle: (Math.random() - 0.5) * 2.4,
            life: 10
          });
          G.FX.spawnHitParticles(rx, ry, "#a855f7", 4);
        }

        if (gc.age % 9 === 0) {
          gc.pillars.push({
            x: gc.epicenterX + (Math.random() * 140 - 70),
            w: 5 + Math.random() * 6,
            h: 55 + Math.random() * 75,
            life: 14,
            maxLife: 14
          });
        }

        // Multi-Hit Damage dari efek-efek ungu susulan setiap 12 frame
        if (gc.age % 12 === 0) {
          var distToEpicenter = Math.abs(d.x - gc.epicenterX);
          if (distToEpicenter < 115) {
            G.Sound.play("claw");
            G.Camera.shake = 5;
            G.Actions.applyDamageToDummy(18, 1.2, -1.6, "#c084fc", "", false);
          }
        }
      }

      // Update umur sub-efek ungu
      for (var asI = gc.afterSlashes.length - 1; asI >= 0; asI--) {
        gc.afterSlashes[asI].life--;
        if (gc.afterSlashes[asI].life <= 0) gc.afterSlashes.splice(asI, 1);
      }
      for (var plI = gc.pillars.length - 1; plI >= 0; plI--) {
        gc.pillars[plI].life--;
        if (gc.pillars[plI].life <= 0) gc.pillars.splice(plI, 1);
      }

      if (gc.age >= gc.maxAge) {
        G.FX.giantCleaves.splice(gcIdx, 1);
      }
    }

    // Update Proyektil Slash Angin Ungu (Basic Attack ke-3 Xeera)
    for (var wsIdx = G.FX.windSlashes.length - 1; wsIdx >= 0; wsIdx--) {
      var ws = G.FX.windSlashes[wsIdx];
      ws.x += ws.vx;
      ws.life--;

      if (!ws.hasHit) {
        var distW = Math.abs(d.x - ws.x);
        var dyW = Math.abs((d.y - 16 * s) - ws.y);
        if (distW < ws.radius + 14 && dyW < ws.radius + 16) {
          ws.hasHit = true;
          G.Sound.play("claw");
          G.FX.spawnStarImpact(d.x, d.y - 16 * s, 0.9);
          G.Actions.applyDamageToDummy(ws.dmg, 3.8, -2.0, "#d946ef", "", false);
        }
      }
      if (ws.life <= 0 || ws.x < -40 || ws.x > cfg.BASE_W + 40) {
        G.FX.windSlashes.splice(wsIdx, 1);
      }
    }

    // Update Kubah Slash Barrier Xeera
    for (var sbIdx = G.FX.slashBarriers.length - 1; sbIdx >= 0; sbIdx--) {
      var sb = G.FX.slashBarriers[sbIdx];
      sb.tick++;
      sb.life--;

      if (sb.tick % 12 === 0) {
        var distInBarrier = Math.abs(d.x - sb.x);
        if (distInBarrier <= sb.radius + 8 && (sb.y - d.y) <= sb.radius) {
          G.Sound.play("claw");
          var bDmg = sb.isEvo ? 20 : 14;
          G.Actions.applyDamageToDummy(bDmg, 0.8, -0.8, "#c084fc", "", false);
        }
      }
      if (sb.life <= 0) {
        G.FX.slashBarriers.splice(sbIdx, 1);
      }
    }

    // Skill U Simon: 3x Thunder Blitz
    if (m.state === "blitz") {
      m.blitzTimer--;
      if (m.blitzTimer <= 0) {
        if (m.blitzRemaining > 0) {
          var prevX = m.x;
          var prevY = m.y - 16 * s;
          var offsets = [
            { ox: -30 * s, oy: -32 * s, f: 1 },
            { ox: 32 * s,  oy: -16 * s, f: -1 },
            { ox: -20 * s, oy: 0,       f: 1 }
          ];
          var idx = 3 - m.blitzRemaining;
          var targetPos = offsets[idx];

          m.x = Math.max(28, Math.min(cfg.BASE_W - 28, d.x + targetPos.ox));
          m.y = cfg.GROUND_Y + targetPos.oy;
          m.onGround = m.y >= cfg.GROUND_Y;
          m.facing = targetPos.f;
          m.attackType = idx % 2 === 0 ? "punch1" : "punch2";

          G.Sound.play("zap");
          G.FX.spawnLightningBolt(prevX, prevY, m.x, m.y - 14 * s, 2, 15, true);
          G.FX.spawnStarImpact(d.x + (idx - 1) * 10, d.y - 18 * s + targetPos.oy * 0.4, 1.15);
          G.Actions.applyDamageToDummy(26, 1.5, -1.8, idx % 2 === 0 ? "#00e5ff" : "#ffbe0b", "", false);

          m.blitzRemaining--;
          m.blitzTimer = 8;
        } else {
          m.state = m.onGround ? "idle" : "jump";
          m.attackType = "";
        }
      }
    }

    // Skill U Simon SEBELUM EVOLUSI (Base Thunder Mage):
    // Menembakkan 3 gelombang kilat beruntun dari tangan, lalu maju menghantam dengan pukulan petir.
    if (m.charId === "simon" && m.state === "simonBaseU") {
      var simonWaves = [28, 18, 8];
      if (simonWaves.indexOf(m.stateTimer) !== -1) {
        var isFinalPunch = m.stateTimer === 8;
        m.vx = m.facing * (isFinalPunch ? 5.2 : 2.2);
        var reachX = m.x + m.facing * (isFinalPunch ? 95 * s : 75 * s);
        var waveColor = isFinalPunch ? "#ffbe0b" : "#38bdf8";
        G.Sound.play(isFinalPunch ? "thunder" : "zap");
        G.FX.spawnLightningBolt(m.x + m.facing * (10 * s), m.y - 20 * s, reachX, m.y - 18 * s, 2.8, 12, true);
        G.FX.spawnHitParticles(m.x + m.facing * (16 * s), m.y - 20 * s, waveColor, 6);
        if (Math.abs(d.x - m.x) < 95 * s && (m.facing === 1 ? d.x >= m.x : d.x <= m.x)) {
          G.Actions.applyDamageToDummy(isFinalPunch ? 18 : 11, isFinalPunch ? 5.5 : 2.2, isFinalPunch ? -3.4 : -1.5, waveColor, "", false);
          G.FX.spawnStarImpact(d.x, d.y - 18 * s, 1.1);
        }
      }
    }

    // Skill I Simon: Base Form = 1 sambaran petir stun.
    // Thunder Devil = rentetan 5 sambaran petir raksasa merah-emas-biru + stun dahsyat.
    if (m.charId === "simon" && m.state === "thunderStorm" && m.stormTimer > 0) {
      m.stormTimer--;
      var isDevil = m.attackType === "simonDevilI";
      var totalFrames = m.stormTimerMax || (isDevil ? 52 : 32);
      var coreX = m.x + m.facing * (26 * s);
      var coreY = m.y - 74 * s;

      if (isDevil) {
        // 5 sambaran besar berturut-turut (frame: 44, 34, 24, 14, 4)
        var devilFrames = [44, 34, 24, 14, 4];
        if (devilFrames.indexOf(m.stormTimer) !== -1) {
          var isLast = m.stormTimer === 4;
          G.Sound.play("thunder");
          if (G.Camera) G.Camera.shake = isLast ? 14 : 9;
          var strikeX = d.x + (Math.random() * 36 - 18);
          strikeX = Math.max(24, Math.min(cfg.BASE_W - 24, strikeX));
          // Warna bergantian merah / emas / biru sesuai tema Cataclysmic Devil
          var boltTint = (devilFrames.indexOf(m.stormTimer) % 3);
          G.FX.spawnLightningBolt(coreX, coreY, strikeX, cfg.GROUND_Y, 3, 16, true);
          G.FX.spawnLightningBolt(coreX, coreY, strikeX + 10, cfg.GROUND_Y, 2.4, 13, false);
          G.FX.spawnStarImpact(strikeX, cfg.GROUND_Y - 16 * s, isLast ? 1.5 : 1.15);
          G.FX.spawnHitParticles(strikeX, cfg.GROUND_Y - 18 * s,
            boltTint === 0 ? "#ef4444" : (boltTint === 1 ? "#facc15" : "#38bdf8"), 10);
          if (Math.abs(d.x - coreX) < 210) {
            d.stunTimer = isLast ? Math.max(d.stunTimer, 110) : Math.max(d.stunTimer, 35);
            G.Actions.applyDamageToDummy(isLast ? 22 : 12, 1.5, -1.8,
              boltTint === 0 ? "#ef4444" : (boltTint === 1 ? "#ffbe0b" : "#00e5ff"), "", false);
          }
        }
        if (m.stormTimer === 0) {
          m.attackType = "";
          m.state = m.onGround ? "idle" : "jump";
        }
      } else {
        if (m.stormTimer === 30) {
          G.FX.spawnStarImpact(coreX, coreY, 1.3);
        }

        if (m.stormTimer % 5 === 0 && m.stormTimer > 4) {
          G.Sound.play("zap");
          for (var b = 0; b < 2; b++) {
            var strikeX2 = d.x + (Math.random() * 80 - 40);
            strikeX2 = Math.max(24, Math.min(cfg.BASE_W - 24, strikeX2));
            G.FX.spawnLightningBolt(coreX, coreY, strikeX2, cfg.GROUND_Y, 2, 11, true);
          }
          if (Math.abs(d.x - coreX) < 120) {
            d.stunTimer = 185;
            G.Actions.applyDamageToDummy(22, 1.2, -1.0, "#ffbe0b", "", false);
          }
        }
        if (m.stormTimer === 0) {
          m.state = m.onGround ? "idle" : "jump";
        }
      }
    }

    // =========================================================================
    // MOOPY: MULTI-HIT & FASE SKILL U / I (SEBELUM & SESUDAH BERUBAH)
    // =========================================================================
    if (m.charId === "moopy") {
      var moopyDist = Math.abs(m.x - d.x);
      var moopyFacingTarget = (m.facing === 1 && d.x >= m.x - 14) ||
                              (m.facing === -1 && d.x <= m.x + 14);

      // Skill U sebelum berubah: 4x cakaran cepat
      if (m.state === "moopyClawFlurry") {
        if ([30, 22, 14, 6].indexOf(m.stateTimer) !== -1) {
          m.vx = m.facing * 3.0;
          G.Sound.play("claw");
          G.FX.spawnClawEffect(m.x + m.facing * (20 * s), m.y - 18 * s, m.facing, false);
          if (moopyDist < 58 * s && moopyFacingTarget) {
            var clawFinal = m.stateTimer === 6;
            G.Actions.applyDamageToDummy(11, clawFinal ? 5.5 : 2.0, clawFinal ? -3.2 : -1.4, "#f43f5e", "", false);
          }
        }
      }

      // Skill I sebelum berubah: blitz + pukulan berat stun 1.5 detik
      if (m.state === "moopyBlitzStun" && m.stateTimer === 18) {
        if (moopyDist < 58 * s) {
          G.Sound.play("kick");
          G.FX.spawnStarImpact(d.x, d.y - 18 * s, 1.25);
          G.Actions.applyDamageToDummy(32, 5.0, -3.2, "#ffbe0b", "", false);
          d.stunTimer = Math.max(d.stunTimer, 90);
        }
      }

      // Skill U sesudah berubah: cakaran feral 4x + dash + pusaran pita silang
      if (m.state === "moopyWolfU") {
        if ([42, 34, 26, 18].indexOf(m.stateTimer) !== -1) {
          var uSwing = (42 - m.stateTimer) / 8;
          m.vx = m.facing * 3.2;
          G.Sound.play("claw");
          G.FX.spawnFeralClawArc(m.x + m.facing * (24 * s), m.y - 20 * s, m.facing, uSwing);
          if (moopyDist < 72 * s && moopyFacingTarget) {
            G.Actions.applyDamageToDummy(12, 2.2, -1.8, "#e11d48", "", false);
          }
        }

        if (m.stateTimer === 10) {
          var dashStartX = m.x;
          var dashEndX = Math.max(26, Math.min(cfg.BASE_W - 26, d.x + m.facing * 36));
          m.x = dashEndX;
          m.vx = 0;
          G.Sound.play("dash");
          G.Sound.play("claw");
          G.FX.spawnFeralSpeedLines((dashStartX + dashEndX) * 0.5, m.y - 18 * s, m.facing, 12);
          G.FX.spawnRibbonClawVortex(d.x, d.y - 20 * s, m.facing);
          if (Math.abs(dashStartX - d.x) < 150 * s) {
            G.Actions.applyDamageToDummy(30, 6.8, -4.4, "#a855f7", "", false);
          }
        }
      }

      // Skill I sesudah berubah: roar stun 100f -> teleport -> shredder -> X-cross
      if (m.state === "moopyWolfI") {
        if (m.stateTimer === 68) {
          G.Sound.play("roar");
          G.Camera.shake = 8;
          G.FX.spawnFeralSpeedLines(m.x, m.y - 18 * s, m.facing, 10);
          for (var fw = 0; fw < 2; fw++) {
            G.FX.roarWaves.push({
              x: m.x + m.facing * (14 * s),
              y: m.y - 14 * s,
              facing: m.facing,
              radius: 10 + fw * 24,
              life: 22 - fw * 4,
              hasHit: true,
              isFeral: true
            });
          }
          if (moopyDist < 185 * s) {
            G.Actions.applyDamageToDummy(15, 1.5, -1.2, "#e11d48", "", false);
            d.stunTimer = 100;
          }
        }

        if (m.stateTimer === 50) {
          G.FX.spawnFeralSpeedLines(m.x, m.y - 18 * s, m.facing, 8);
          m.x = Math.max(26, Math.min(cfg.BASE_W - 26, d.x - m.facing * 20));
          m.facing = d.x >= m.x ? 1 : -1;
          G.Sound.play("dash");
          G.FX.spawnFeralSpeedLines(m.x, m.y - 18 * s, m.facing, 10);
        }

        if ([42, 34, 26, 18].indexOf(m.stateTimer) !== -1) {
          var iSwing = (42 - m.stateTimer) / 8;
          var side = iSwing % 2 === 0 ? -18 : 18;
          m.x = Math.max(26, Math.min(cfg.BASE_W - 26, d.x + side));
          m.facing = d.x >= m.x ? 1 : -1;

          G.Sound.play("claw");
          G.FX.spawnFeralClawArc(d.x, d.y - 20 * s, m.facing, iSwing);
          if (iSwing === 2) {
            G.FX.spawnRibbonClawVortex(d.x, d.y - 20 * s, m.facing);
          }
          G.Actions.applyDamageToDummy(12, 1.2, -1.5, "#c084fc", "", false);
          d.stunTimer = Math.max(d.stunTimer, 24);
        }

        if (m.stateTimer === 8) {
          G.Sound.play("thunder");
          G.Sound.play("claw");
          G.FX.spawnXCrossClawFinisher(d.x, d.y - 22 * s);
          G.Actions.applyDamageToDummy(34, 7.2, -5.0, "#e11d48", "", false);
          d.stunTimer = Math.max(d.stunTimer, 30);
        }
      }
    }

    // Dive Kick / Meluncur dengan Pedang (Simon & Xeera)
    if (m.state === "diveKick") {
      G.FX.spawnDiveStreak(m.x, m.y - 12 * s, m.vx, m.vy, m.charId === "xeera");
      var distDive = Math.hypot(d.x - m.x, (d.y - 12) - m.y);
      if (distDive < 28 * s || m.y >= cfg.GROUND_Y - 2) {
        if (m.charId === "xeera") {
          G.Sound.play("claw");
          G.FX.spawnSwordTrail(d.x, d.y - 14 * s, m.facing, 3, m.isWolf);
          if (distDive < 54 * s) {
            G.Actions.applyDamageToDummy(36, 5.0, -3.2, "#d946ef", "", false);
          }
        } else {
          G.Sound.play("thunder");
          G.FX.spawnLightningBolt(m.x - m.facing * 42, m.y - 48, d.x, d.y - 10, 2, 12, true);
          G.FX.spawnStarImpact(d.x, d.y - 14 * s, 1.25);
          if (distDive < 52 * s) {
            G.Actions.applyDamageToDummy(38, 5.2, -3.3, "#00e5ff", "", false);
          }
        }
        m.vx = -m.facing * 2.0;
        m.vy = -3.0;
        m.onGround = false;
        m.state = "jump";
        m.stateTimer = 0;
        m.attackType = "";
      }
    }

    if (m.stateTimer > 0 && m.state !== "blitz") {
      m.stateTimer--;
      if (m.state === "dash" && m.stateTimer % 2 === 0) {
        G.FX.afterimages.push({
          x: m.x,
          y: m.y,
          facing: m.facing,
          isWolf: m.isWolf,
          life: 8
        });
      }
      if (m.stateTimer === 0) {
        m.state = m.onGround ? "idle" : "jump";
        m.attackType = "";
      }
    }

    var moveSpeed = m.isWolf ? 3.5 : 2.7;
    if (m.state === "idle" || m.state === "walk" || m.state === "jump") {
      if (keys.a && !keys.s) {
        m.vx = -moveSpeed;
        m.facing = -1;
        if (m.onGround) m.state = "walk";
      } else if (keys.s && !keys.a) {
        m.vx = moveSpeed;
        m.facing = 1;
        if (m.onGround) m.state = "walk";
      } else {
        m.vx *= 0.72;
        if (Math.abs(m.vx) < 0.15) m.vx = 0;
        if (m.onGround) m.state = "idle";
      }
    } else if (m.state === "attack") {
      m.vx *= 0.82;
    } else if (m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") {
      m.vx *= 0.8;
    }

    if (m.state !== "blitz") {
      m.x += m.vx;
      m.y += m.vy;

      if (m.y < cfg.GROUND_Y || m.vy < 0) {
        m.onGround = false;
      }
      if (!m.onGround) {
        if (m.state !== "diveKick") m.vy += cfg.GRAVITY;
        if (m.y >= cfg.GROUND_Y) {
          m.y = cfg.GROUND_Y;
          m.vy = 0;
          m.onGround = true;
          m.jumpsUsed = 0;
          G.FX.spawnDust(m.x, cfg.GROUND_Y, 0, 4);
          if (m.state === "jump" || m.state === "diveKick") m.state = "idle";
        }
      } else {
        m.y = cfg.GROUND_Y;
        m.vy = 0;
      }
    }

    if (m.y < 32) {
      m.y = 32;
      if (m.vy < 0) m.vy = 0;
    }
    m.x = Math.max(24, Math.min(cfg.BASE_W - 24, m.x));

    for (var i = G.FX.activeLasers.length - 1; i >= 0; i--) {
      var laser = G.FX.activeLasers[i];
      laser.life--;
      laser.tickCounter++;
      if (laser.life < 30 && laser.life > 4 && laser.tickCounter % 4 === 0) {
        var beamStartX = m.x + m.facing * (18 * s);
        var inBeamDir = (m.facing === 1 && d.x >= beamStartX - 8) ||
                        (m.facing === -1 && d.x <= beamStartX + 8);
        var yDiff = Math.abs((d.y - 16 * s) - (m.y - 12 * s));
        if (inBeamDir && yDiff < 38 * s) {
          var tickDmg = 18 + Math.floor(Math.random() * 7);
          G.Actions.applyDamageToDummy(tickDmg, 2.2, -0.8, "#fb7185", "", false);
        }
      }
      if (laser.life <= 0) G.FX.activeLasers.splice(i, 1);
    }

    for (var r = G.FX.roarWaves.length - 1; r >= 0; r--) {
      var w = G.FX.roarWaves[r];
      w.radius += 5.2;
      w.x += w.facing * 2.6;
      w.life--;
      if (!w.hasHit) {
        var dist = Math.hypot(d.x - w.x, (d.y - 16) - w.y);
        if (dist <= w.radius + 16) {
          w.hasHit = true;
          d.stunTimer = 185;
          G.Actions.applyDamageToDummy(28, 3.2, -2.0, "#facc15", "", false);
        }
      }
      if (w.life <= 0) G.FX.roarWaves.splice(r, 1);
    }

    if (d.hitFlash > 0) d.hitFlash--;
    if (d.hurtTimer > 0) d.hurtTimer--;
    if (d.stunTimer > 0) d.stunTimer--;

    if (d.stunTimer <= 0 && d.hurtTimer <= 0 && d.hp > 0) {
      d.aiTick++;
      d.facing = m.x < d.x ? -1 : 1;
      if (cfg.dummyBehavior === "patrol") {
        d.vx = d.patrolDir * 1.25;
        if (d.x < 90) d.patrolDir = 1;
        if (d.x > cfg.BASE_W - 70) d.patrolDir = -1;
      } else if (cfg.dummyBehavior === "jump") {
        if (d.onGround && d.aiTick % 55 === 0) {
          d.vy = -5.8;
          d.onGround = false;
        }
      } else if (cfg.dummyBehavior === "spar") {
        var distToMoopy = d.x - m.x;
        if (Math.abs(distToMoopy) > 42) {
          d.vx = distToMoopy > 0 ? -1.4 : 1.4;
        } else if (d.aiTick % 45 === 0) {
          m.hp = Math.max(100, m.hp - 8);
          G.FX.spawnDamageNumber(m.x, m.y - 20, 8, "#f87171");
        }
      } else {
        d.vx *= 0.8;
      }
    } else {
      d.vx *= 0.84;
    }

    d.x += d.vx;
    d.y += d.vy;
    if (d.y < cfg.GROUND_Y || d.vy < 0) d.onGround = false;
    if (!d.onGround) {
      d.vy += 0.4;
      if (d.y >= cfg.GROUND_Y) {
        d.y = cfg.GROUND_Y;
        d.vy = 0;
        d.onGround = true;
      }
    } else {
      d.y = cfg.GROUND_Y;
      d.vy = 0;
    }

    if (d.x < 28) {
      d.x = 28;
      d.vx = Math.abs(d.vx) * 0.6;
    } else if (d.x > cfg.BASE_W - 28) {
      d.x = cfg.BASE_W - 28;
      d.vx = -Math.abs(d.vx) * 0.6;
    }

    if (d.hp <= 0) {
      d.koResetTimer++;
      if (d.koResetTimer > 65) {
        d.hp = d.maxHp;
        d.stunTimer = 0;
        d.koResetTimer = 0;
      }
    }

    G.FX.updateAll();

    if (G.Camera.shake > 0) G.Camera.shake--;
  }

  function drawEnergyTube(tubeX, tubeY, tubeW, ratio, isWolf, isReady, pulseTick) {
    var enH = 4;
    var enY = tubeY;

    ctx.fillStyle = "#09090b";
    var enGrad;
    ctx.fillRect(tubeX - 1, enY - 1, tubeW + 2, enH + 2);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(tubeX, enY, tubeW, enH);

    var enFillW = Math.round(tubeW * ratio);
    if (enFillW <= 0) return;

    if (isWolf) {
      // Warna bar energi mengikuti karakter saat evolusi:
      // Moopy = merah/ungu, Simon = emas, Xeera = ungu.
      var mEvo = G.moopy;
      var evoMain = mEvo.charId === "xeera" ? "#a855f7" : (mEvo.charId === "simon" ? "#facc15" : "#e11d48");
      var evoTop = mEvo.charId === "xeera" ? "#f5d0fe" : (mEvo.charId === "simon" ? "#fef08a" : "#fda4af");
      ctx.fillStyle = evoMain;
      ctx.fillRect(tubeX, enY, enFillW, enH);
      ctx.fillStyle = evoTop;
      ctx.fillRect(tubeX, enY, enFillW, 1.5);
    } else if (isReady) {
      ctx.fillStyle = pulseTick ? "#facc15" : "#38bdf8";
      ctx.fillRect(tubeX, enY, enFillW, enH);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(tubeX, enY, enFillW, 1.5);
    } else {
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(tubeX, enY, enFillW, enH);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(tubeX, enY, enFillW, 1.5);
    }
  }

  function drawHornedSkullHeartbar(x, y, hpRatio, drainRatio, isMirrored) {
    var m = G.moopy;
    ctx.save();
    if (isMirrored) {
      ctx.translate(x + 188, y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x, y);
    }

    // Bar Energi untuk semua karakter pemain (Moopy, Simon, Xeera).
    var showEnergy = !isMirrored;
    var energyRatio = showEnergy ? Math.max(0, Math.min(1, m.energy / m.maxEnergy)) : 0;
    var energyReady = showEnergy && !m.isWolf && m.energy >= m.maxEnergy;
    var energyPulse = showEnergy ? (m.animTick % 16 < 8) : false;

    if (LoadedAssets.heartbar) {
      ctx.drawImage(LoadedAssets.heartbar, 0, -4, 188, 30);
      var missingW = Math.round((1 - Math.max(0, hpRatio)) * 130);
      if (missingW > 0) {
        ctx.fillStyle = "#1a070a";
        ctx.fillRect(184 - missingW, 9, missingW, 7);
      }
      if (showEnergy) {
        drawEnergyTube(24, 21, 158, energyRatio, m.isWolf, energyReady, energyPulse);
      }
      ctx.restore();
      return;
    }

    var tubeX = 24;
    var tubeY = 8;
    var tubeW = 160;
    var tubeH = 9;

    ctx.fillStyle = "#120407";
    ctx.beginPath();
    ctx.roundRect(tubeX - 1, tubeY - 1, tubeW + 3, tubeH + 2, 4);
    ctx.fill();

    ctx.fillStyle = "#2b090e";
    ctx.beginPath();
    ctx.roundRect(tubeX, tubeY, tubeW, tubeH, 3);
    ctx.fill();

    var drainW = Math.max(0, drainRatio * tubeW);
    if (drainW > 0) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(tubeX, tubeY + 1, drainW, tubeH - 2);
    }

    var fillW = Math.max(0, hpRatio * tubeW);
    if (fillW > 0) {
      var tubeGrad = ctx.createLinearGradient(0, tubeY, 0, tubeY + tubeH);
      tubeGrad.addColorStop(0, "#8f070e");
      tubeGrad.addColorStop(0.25, "#ff7a82");
      tubeGrad.addColorStop(0.5, "#e0111a");
      tubeGrad.addColorStop(1, "#4a0307");
      ctx.fillStyle = tubeGrad;
      ctx.beginPath();
      ctx.roundRect(tubeX, tubeY, fillW, tubeH, 3);
      ctx.fill();
    }

    ctx.fillStyle = "#ef1522";
    ctx.beginPath();
    ctx.arc(21, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(20, 10.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    var coils = [27, 34, 41, 48, 54];
    for (var c = 0; c < coils.length; c++) {
      var cx = coils[c];
      ctx.strokeStyle = "#140d10";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, 6.5);
      ctx.lineTo(cx + 1.5, 18);
      ctx.stroke();

      ctx.strokeStyle = "#6e5d62";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    ctx.fillStyle = "#cfc6bc";
    ctx.beginPath();
    ctx.arc(13, 9, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#140d10";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#140d10";
    ctx.beginPath();
    ctx.arc(13.5, 8.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#140d10";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.quadraticCurveTo(1, 18, 2, 6);
    ctx.stroke();

    ctx.strokeStyle = "#9e9288";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (showEnergy) {
      drawEnergyTube(tubeX, tubeY + tubeH + 5, tubeW, energyRatio, m.isWolf, energyReady, energyPulse);
    }

    ctx.restore();
  }

  function drawModeLabel() {
    var m = G.moopy;

    var label;
    if (m.isWolf) {
      var secLeft = Math.max(0, Math.ceil((m.energy / m.maxEnergy) * 27));
      var evoName = m.charId === "xeera" ? "RED EYES EVO" : (m.charId === "simon" ? "THUNDER DEVIL" : "DIRE WOLF");
      label = evoName + " " + secLeft + "s";
    } else if (m.energy >= m.maxEnergy) {
      label = "EVO READY!";
    } else {
      label = "ENERGY " + Math.floor(m.energy) + "%";
    }

    ctx.save();
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = "left";
    ctx.fillStyle = "#000000";
    ctx.fillText(label, 9, 47);
    var labelColor = "#7dd3fc";
    if (m.isWolf) labelColor = m.charId === "xeera" ? "#e9d5ff" : (m.charId === "simon" ? "#fde68a" : "#f0abfc");
    else if (m.energy >= m.maxEnergy) labelColor = "#facc15";
    ctx.fillStyle = labelColor;
    ctx.fillText(label, 8, 46);
    ctx.restore();
  }

  function drawHUD() {
    var m = G.moopy;
    var d = G.dummy;
    var W = G.Config.BASE_W;

    drawHornedSkullHeartbar(8, 8, m.hp / m.maxHp, m.displayHp / m.maxHp, false);
    drawHornedSkullHeartbar(W - 228, 8, d.hp / d.maxHp, d.displayHp / d.maxHp, true);
    drawModeLabel();
  }

  function renderGame() {
    var W = G.Config.BASE_W;
    var H = G.Config.BASE_H;
    var m = G.moopy;
    var s = G.Config.charScale;

    ctx.save();
    ctx.scale(SCALE_RES, SCALE_RES);

    if (G.Camera.shake > 0) {
      var sx = (Math.random() - 0.5) * G.Camera.shake;
      var sy = (Math.random() - 0.5) * G.Camera.shake;
      ctx.translate(sx, sy);
    }

    if (LoadedAssets.bg) {
      ctx.drawImage(LoadedAssets.bg, 0, 0, W, H);
    } else {
      ctx.drawImage(bgCache, 0, 0, W, H);
    }

    for (var i = 0; i < G.FX.afterimages.length; i++) {
      var a = G.FX.afterimages[i];
      if (a.isWolf) G.Renderer.drawMoopyWolf(ctx, a.x, a.y, a.facing, s, true, LoadedAssets);
      else G.Renderer.drawMoopyStickman(ctx, a.x, a.y, a.facing, s, true, LoadedAssets);
    }

    G.Renderer.drawDummy(ctx, s, LoadedAssets);

    if (m.isWolf) {
      G.Renderer.drawMoopyWolf(ctx, m.x, m.y, m.facing, s, false, LoadedAssets);
    } else {
      G.Renderer.drawMoopyStickman(ctx, m.x, m.y, m.facing, s, false, LoadedAssets);
    }

    G.FX.drawAll(ctx, m, s, W);
    drawHUD();

    ctx.restore();
  }

  var scaleSelect = document.getElementById("scaleSelect");
  var dummySelect = document.getElementById("dummySelect");
  var mainMenuOverlay = document.getElementById("mainMenuOverlay");
  var assetsModal = document.getElementById("assetsModal");
  var movesModal = document.getElementById("movesModal");

  scaleSelect.addEventListener("change", function () {
    G.Config.charScale = parseFloat(scaleSelect.value) || 1.0;
  });
  dummySelect.addEventListener("change", function () {
    G.Config.dummyBehavior = dummySelect.value;
  });
  document.getElementById("btnToggleMenu").addEventListener("click", function () {
    mainMenuOverlay.classList.toggle("hidden");
    gamePaused = !mainMenuOverlay.classList.contains("hidden") ||
                 !charSelectOverlay.classList.contains("hidden") ||
                 !startPlayOverlay.classList.contains("hidden");
  });
  document.getElementById("btnStartGame").addEventListener("click", function () {
    mainMenuOverlay.classList.add("hidden");
    gamePaused = false;
    G.Sound.init();
  });
  document.getElementById("btnOpenAssets").addEventListener("click", function () {
    assetsModal.classList.remove("hidden");
  });
  document.getElementById("btnCloseAssets").addEventListener("click", function () {
    assetsModal.classList.add("hidden");
  });
  document.getElementById("btnSaveAssets").addEventListener("click", function () {
    assetsModal.classList.add("hidden");
  });
  document.getElementById("btnOpenMoves").addEventListener("click", function () {
    movesModal.classList.remove("hidden");
  });
  document.getElementById("btnCloseMoves").addEventListener("click", function () {
    movesModal.classList.add("hidden");
  });
  document.getElementById("btnGotItMoves").addEventListener("click", function () {
    movesModal.classList.add("hidden");
  });
  document.getElementById("btnMute").addEventListener("click", function () {
    G.Sound.muted = !G.Sound.muted;
    document.getElementById("btnMute").textContent = G.Sound.muted ? "SFX: OFF" : "SFX: ON";
  });
  document.getElementById("btnResetFight").addEventListener("click", function () {
    var m = G.moopy;
    var d = G.dummy;
    m.x = 130;
    m.y = G.Config.GROUND_Y;
    m.vx = 0;
    m.vy = 0;
    m.onGround = true;
    m.jumpsUsed = 0;
    m.state = "idle";
    m.stateTimer = 0;
    m.maxStateTimer = 14;
    m.attackType = "";
    m.blitzRemaining = 0;
    m.blitzTimer = 0;
    m.stormTimer = 0;
    m.comboStep = 0;
    m.comboWindow = 0;
    m.comboCount = 0;
    m.comboResetTimer = 0;
    m.lastAttackFamily = "";
    m.hp = m.maxHp;
    m.displayHp = m.maxHp;
    m.dashCharges = m.maxDashCharges;
    m.evoTimer = 0;
    m.isWolf = false;
    m.energy = 0;
    m.cd.dash = 0;
    m.cd.wolf = 0;
    m.cd.roar = 0;
    m.cd.laser = 0;
    G.FX.slashBarriers.length = 0;
    G.FX.windSlashes.length = 0;
    G.FX.giantCleaves.length = 0;
    G.FX.feralArcs.length = 0;
    G.FX.ribbonVortices.length = 0;
    G.FX.xCrossClaws.length = 0;
    G.FX.feralSpeedLines.length = 0;
    G.FX.roarWaves.length = 0;
    G.FX.clawEffects.length = 0;
    d.x = 335;
    d.y = G.Config.GROUND_Y;
    d.vx = 0;
    d.vy = 0;
    d.onGround = true;
    d.hp = d.maxHp;
    d.displayHp = d.maxHp;
    d.stunTimer = 0;
    G.Actions.updateModeBadge();
    mainMenuOverlay.classList.add("hidden");
    gamePaused = false;
  });

  function bindUpload(inputId, statusId, assetKey) {
    var input = document.getElementById(inputId);
    var status = document.getElementById(statusId);
    if (!input) return;
    input.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          LoadedAssets[assetKey] = assetKey === "heartbar" ? removeSolidBackground(img) : img;
          if (assetKey === "menu") {
            var box = document.getElementById("customMenuBannerBox");
            var bannerImg = document.getElementById("customMenuBannerImg");
            if (box && bannerImg) {
              bannerImg.src = img.src;
              box.classList.remove("hidden");
            }
          }
          if (status) {
            status.textContent = "Terpasang: " + file.name;
            status.className = "text-sm text-emerald-400";
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  bindUpload("inputBgAsset", "statusBgAsset", "bg");
  bindUpload("inputHeartAsset", "statusHeartAsset", "heartbar");
  bindUpload("inputMenuAsset", "statusMenuAsset", "menu");
  bindUpload("inputMoopyAsset", "statusMoopyAsset", "moopyStickman");
  bindUpload("inputWolfAsset", "statusWolfAsset", "moopyWolf");

  document.getElementById("btnResetAssets").addEventListener("click", function () {
    LoadedAssets.bg = null;
    LoadedAssets.heartbar = null;
    LoadedAssets.menu = null;
    LoadedAssets.moopyStickman = null;
    LoadedAssets.moopyWolf = null;
    document.getElementById("customMenuBannerBox").classList.add("hidden");
    initFolderAssets();
  });

  function loop() {
    updateGame();
    renderGame();
    requestAnimationFrame(loop);
  }

  window.onload = function () {
    buildGothicStageCache();
    initFolderAssets();
    selectCharacter("moopy");
    loop();
  };
})(window.MoopyGame); 
