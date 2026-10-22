window.MoopyGame = window.MoopyGame || {};

window.MoopyGame.FX = {
  damageNumbers: [],
  clawEffects: [],
  slashArcs: [],
  swordTrails: [],
  giantCleaves: [],
  roarWaves: [],
  activeLasers: [],
  lightningBolts: [],
  starImpacts: [],
  diveStreaks: [],
  windSlashes: [],
  slashBarriers: [],
  particles: [],
  afterimages: [],
  feralArcs: [],
  ribbonVortices: [],
  xCrossClaws: [],
  feralSpeedLines: [],

  spawnDamageNumber: function (x, y, amount, color) {
    if (this.damageNumbers.length > 18) this.damageNumbers.shift();
    this.damageNumbers.push({
      x: x + (Math.random() * 12 - 6),
      y: y - 22 + (Math.random() * 4 - 2),
      vx: (Math.random() - 0.5) * 1.3,
      vy: -2.5,
      text: String(Math.round(amount)),
      color: color || "#fde047",
      life: 38
    });
  },

  spawnSlashArc: function (x, y, facing, color, radius, isUpward) {
    if (this.slashArcs.length > 8) this.slashArcs.shift();
    this.slashArcs.push({
      x: Math.round(x),
      y: Math.round(y),
      facing: facing,
      color: color || "#38bdf8",
      radius: radius || 20,
      isUpward: !!isUpward,
      life: 9,
      maxLife: 9
    });
  },

  // Efek Tebasan Basic Attack Pedang Ame no Habakiri
  spawnSwordTrail: function (x, y, facing, swingType, isEvo) {
    if (this.swordTrails.length > 8) this.swordTrails.shift();
    this.swordTrails.push({
      x: Math.round(x),
      y: Math.round(y),
      facing: facing,
      swingType: swingType || 1,
      isEvo: !!isEvo,
      life: 11,
      maxLife: 11
    });
    this.spawnHitParticles(x + facing * 16, y, isEvo ? "#f43f5e" : "#a855f7", 6);
  },

  // =========================================================================
  // SKILL U EVOLUSI XEERA: TEBASAN LAMA & RAKSASA + EFEK-EFEK UNGU BERUNTUN!
  // =========================================================================
  spawnGiantEvoCleave: function (x, y, facing) {
    this.giantCleaves.length = 0;

    // Buat 16 pancaran sinar ungu-magenta-hitam raksasa seperti Gambar 1 (3630487a.jpeg)
    var rays = [];
    var rayCount = 16;
    for (var i = 0; i < rayCount; i++) {
      var ratio = i / (rayCount - 1);
      var angle = -Math.PI + 0.18 + ratio * (Math.PI - 0.36);
      var length = 135 + (i % 3 === 0 ? 65 : (i % 2 === 0 ? 35 : 10));
      rays.push({
        angle: angle,
        len: length,
        col: i % 4 === 0 ? "#09090f" : (i % 3 === 0 ? "#f43f5e" : (i % 2 === 0 ? "#a855f7" : "#e879f9")),
        width: i === 7 || i === 8 ? 4.5 : (i % 2 === 0 ? 2.8 : 1.8)
      });
    }

    this.giantCleaves.push({
      originX: x,
      originY: y,
      epicenterX: Math.max(45, Math.min(435, x + facing * 115)),
      epicenterY: y,
      facing: facing,
      rays: rays,
      afterSlashes: [],
      pillars: [],
      age: 0,
      maxAge: 135 // Berlangsung lama (~2.25 detik penuh efek ungu!)
    });
  },

  spawnWindSlash: function (x, y, facing, isGiantEvo) {
    this.windSlashes.push({
      x: x,
      y: y,
      vx: facing * (isGiantEvo ? 9.5 : 7.8),
      facing: facing,
      isGiant: !!isGiantEvo,
      radius: isGiantEvo ? 46 : 22,
      dmg: isGiantEvo ? 68 : 28,
      hasHit: false,
      life: isGiantEvo ? 36 : 26,
      maxLife: isGiantEvo ? 36 : 26
    });
  },

  spawnSlashBarrier: function (x, y, isEvoBarrier) {
    this.slashBarriers.length = 0;

    var dur = isEvoBarrier ? 600 : 210;
    var rad = isEvoBarrier ? 115 : 58;

    var chords = [];
    var chordCount = isEvoBarrier ? 14 : 8;
    for (var i = 0; i < chordCount; i++) {
      var a1 = (i / chordCount) * Math.PI * 1.15 - 0.08;
      var a2 = a1 + Math.PI * (0.55 + (i % 3) * 0.22);
      chords.push({
        x1: Math.cos(a1) * rad,
        y1: -Math.abs(Math.sin(a1) * rad),
        x2: Math.cos(a2) * rad,
        y2: -Math.abs(Math.sin(a2) * rad)
      });
    }

    this.slashBarriers.push({
      x: x,
      y: y,
      radius: rad,
      isEvo: !!isEvoBarrier,
      chords: chords,
      tick: 0,
      life: dur,
      maxLife: dur
    });
  },

  spawnClawEffect: function (x, y, facing, isWolfMode) {
    if (this.clawEffects.length > 6) this.clawEffects.shift();
    this.clawEffects.push({
      x: Math.round(x),
      y: Math.round(y),
      facing: facing,
      isWolf: isWolfMode,
      life: 13,
      maxLife: 13
    });
    this.spawnHitParticles(x, y, isWolfMode ? "#38bdf8" : "#f43f5e", 8);
  },

  // =========================================================================
  // EFEK CAKARAN FERAL MOOPY WOLF (Referensi Gambar 2, 3, & Bawah)
  // =========================================================================
  spawnFeralClawArc: function (x, y, facing, swingIndex) {
    if (this.feralArcs.length > 10) this.feralArcs.shift();
    var angles = [-0.45, 0.35, -0.25, 0.55];
    var idx = swingIndex || 0;
    this.feralArcs.push({
      x: Math.round(x),
      y: Math.round(y),
      facing: facing,
      tilt: angles[idx % angles.length],
      radius: 34 + (idx % 2) * 6,
      life: 14,
      maxLife: 14
    });
    this.spawnHitParticles(x + facing * 20, y - 6, "#e11d48", 6);
    this.spawnHitParticles(x + facing * 24, y + 4, "#a855f7", 5);
  },

  spawnRibbonClawVortex: function (x, y, facing) {
    if (this.ribbonVortices.length > 6) this.ribbonVortices.shift();
    this.ribbonVortices.push({
      x: Math.round(x),
      y: Math.round(y),
      facing: facing,
      life: 22,
      maxLife: 22
    });
    this.spawnHitParticles(x, y, "#e11d48", 9);
    this.spawnHitParticles(x, y, "#a855f7", 8);
  },

  spawnXCrossClawFinisher: function (x, y) {
    if (this.xCrossClaws.length > 4) this.xCrossClaws.shift();
    this.xCrossClaws.push({
      x: Math.round(x),
      y: Math.round(y),
      life: 26,
      maxLife: 26
    });
    this.spawnStarImpact(x, y, 1.35);
    this.spawnHitParticles(x, y, "#e11d48", 9);
    this.spawnHitParticles(x, y, "#c084fc", 9);
  },

  spawnFeralSpeedLines: function (x, y, facing, count) {
    var n = count || 8;
    var colors = ["#a855f7", "#e11d48", "#09090f", "#f5d0fe"];
    for (var i = 0; i < n; i++) {
      if (this.feralSpeedLines.length > 26) this.feralSpeedLines.shift();
      var oy = (Math.random() - 0.5) * 44;
      var ox = (Math.random() - 0.5) * 26;
      var len = 18 + Math.random() * 22;
      this.feralSpeedLines.push({
        x1: x + ox - facing * (len * 0.5),
        y1: y + oy,
        x2: x + ox + facing * (len * 0.5),
        y2: y + oy + (Math.random() - 0.5) * 4,
        color: colors[i % colors.length],
        life: 10 + Math.floor(Math.random() * 5),
        maxLife: 14
      });
    }
  },

  spawnLightningBolt: function (x1, y1, x2, y2, thickness, life, withCrater) {
    if (this.lightningBolts.length > 14) this.lightningBolts.shift();

    var segments = 6;
    var pts = [{ x: Math.round(x1), y: Math.round(y1) }];
    var branches = [];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;

    for (var i = 1; i < segments; i++) {
      var t = i / segments;
      var jitter = (Math.random() - 0.5) * 18;
      var px = Math.round(x1 + dx * t + nx * jitter);
      var py = Math.round(y1 + dy * t + ny * jitter);
      pts.push({ x: px, y: py });

      if (i === 2 || i === 4) {
        var bDir = (i === 2 ? 1 : -1) * (12 + Math.random() * 14);
        var bxMid = Math.round(px + dx * 0.15 + nx * bDir * 0.6);
        var byMid = Math.round(py + dy * 0.15 + ny * bDir * 0.6);
        var bxEnd = Math.round(px + dx * 0.28 + nx * bDir);
        var byEnd = Math.round(py + dy * 0.28 + ny * bDir + 8);
        branches.push([
          { x: px, y: py },
          { x: bxMid, y: byMid },
          { x: bxEnd, y: byEnd }
        ]);
      }
    }
    pts.push({ x: Math.round(x2), y: Math.round(y2) });

    this.lightningBolts.push({
      pts: pts,
      branches: branches,
      life: Math.min(life || 12, 15),
      maxLife: Math.min(life || 12, 15)
    });

    this.spawnHitParticles(x2, y2, "#00e5ff", 5);
    if (withCrater) {
      this.spawnStarImpact(x2, y2, 1.0);
    }
  },

  spawnStarImpact: function (x, y, scale) {
    if (this.starImpacts.length > 8) this.starImpacts.shift();
    var s = scale || 1.0;
    var rays = [];
    var count = 8;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.1 : -0.1);
      var d = (i % 2 === 0 ? 18 : 11) * s;
      rays.push({
        dx: Math.round(Math.cos(a) * d),
        dy: Math.round(Math.sin(a) * d),
        type: i % 3
      });
    }
    this.starImpacts.push({
      x: Math.round(x),
      y: Math.round(y),
      rays: rays,
      life: 11,
      maxLife: 11
    });
  },

  spawnDiveStreak: function (x, y, vx, vy, isPurple) {
    if (this.diveStreaks.length > 7) this.diveStreaks.shift();
    this.diveStreaks.push({
      x: Math.round(x),
      y: Math.round(y),
      vx: Math.round(vx),
      vy: Math.round(vy),
      isPurple: !!isPurple,
      life: 9
    });
  },

  spawnHitParticles: function (x, y, color, count) {
    var maxSpawn = Math.min(count || 7, 9);
    for (var i = 0; i < maxSpawn; i++) {
      if (this.particles.length > 55) this.particles.shift();
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.2 + Math.random() * 3.4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.7,
        size: i % 3 === 0 ? 3 : 2,
        color: i === 0 ? "#ffffff" : (i % 4 === 0 ? "#09090f" : color),
        gravity: 0.12,
        life: 11 + Math.floor(Math.random() * 7)
      });
    }
  },

  spawnDust: function (x, y, dir, count) {
    var maxSpawn = Math.min(count || 5, 5);
    for (var i = 0; i < maxSpawn; i++) {
      if (this.particles.length > 55) this.particles.shift();
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y - 2,
        vx: -dir * (0.6 + Math.random() * 1.4),
        vy: -0.4 - Math.random() * 0.8,
        size: 2,
        color: "#cbd5e1",
        gravity: 0,
        life: 10
      });
    }
  },

  addBanner: function () {},

  updateAll: function () {
    var i, p, d;
    for (i = this.damageNumbers.length - 1; i >= 0; i--) {
      d = this.damageNumbers[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.14;
      d.life--;
      if (d.life <= 0) this.damageNumbers.splice(i, 1);
    }
    for (i = this.slashArcs.length - 1; i >= 0; i--) {
      this.slashArcs[i].life--;
      if (this.slashArcs[i].life <= 0) this.slashArcs.splice(i, 1);
    }
    for (i = this.swordTrails.length - 1; i >= 0; i--) {
      this.swordTrails[i].life--;
      if (this.swordTrails[i].life <= 0) this.swordTrails.splice(i, 1);
    }
    for (i = this.clawEffects.length - 1; i >= 0; i--) {
      this.clawEffects[i].life--;
      if (this.clawEffects[i].life <= 0) this.clawEffects.splice(i, 1);
    }
    for (i = this.lightningBolts.length - 1; i >= 0; i--) {
      this.lightningBolts[i].life--;
      if (this.lightningBolts[i].life <= 0) this.lightningBolts.splice(i, 1);
    }
    for (i = this.starImpacts.length - 1; i >= 0; i--) {
      this.starImpacts[i].life--;
      if (this.starImpacts[i].life <= 0) this.starImpacts.splice(i, 1);
    }
    for (i = this.diveStreaks.length - 1; i >= 0; i--) {
      this.diveStreaks[i].life--;
      if (this.diveStreaks[i].life <= 0) this.diveStreaks.splice(i, 1);
    }
    for (i = this.particles.length - 1; i >= 0; i--) {
      p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].life--;
      if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
    }
    for (i = this.feralArcs.length - 1; i >= 0; i--) {
      this.feralArcs[i].life--;
      if (this.feralArcs[i].life <= 0) this.feralArcs.splice(i, 1);
    }
    for (i = this.ribbonVortices.length - 1; i >= 0; i--) {
      this.ribbonVortices[i].life--;
      if (this.ribbonVortices[i].life <= 0) this.ribbonVortices.splice(i, 1);
    }
    for (i = this.xCrossClaws.length - 1; i >= 0; i--) {
      this.xCrossClaws[i].life--;
      if (this.xCrossClaws[i].life <= 0) this.xCrossClaws.splice(i, 1);
    }
    for (i = this.feralSpeedLines.length - 1; i >= 0; i--) {
      this.feralSpeedLines[i].life--;
      if (this.feralSpeedLines[i].life <= 0) this.feralSpeedLines.splice(i, 1);
    }
  },

  drawAll: function (ctx, moopy, charScale, baseW) {
    var i, j, b, pIdx, pt0;

    // 0. Kubah Slash Barrier Xeera
    for (i = 0; i < this.slashBarriers.length; i++) {
      var sb = this.slashBarriers[i];
      ctx.save();
      ctx.translate(Math.round(sb.x), Math.round(sb.y));

      ctx.fillStyle = sb.isEvo ? "rgba(168, 85, 247, 0.14)" : "rgba(192, 132, 252, 0.11)";
      ctx.beginPath();
      ctx.arc(0, 0, sb.radius, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, sb.radius, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#d946ef";
      ctx.lineWidth = sb.isEvo ? 2.2 : 1.6;
      ctx.beginPath();
      for (j = 0; j < sb.chords.length; j++) {
        var ch = sb.chords[j];
        var rot = (sb.tick * 0.04 + j) % 3;
        if (rot < 2.2) {
          ctx.moveTo(ch.x1, ch.y1);
          ctx.lineTo(ch.x2, ch.y2);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.strokeStyle = sb.tick % 4 < 2 ? "#c084fc" : "#f0abfc";
      ctx.lineWidth = sb.isEvo ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, sb.radius, Math.PI, 0, false);
      ctx.stroke();

      ctx.fillStyle = "#b45309";
      for (var rk = 0; rk < 4; rk++) {
        var rAng = Math.PI + (rk / 3) * Math.PI;
        var floatY = Math.sin(sb.tick * 0.1 + rk) * 5;
        var rx = Math.cos(rAng) * (sb.radius + 8);
        var ry = -Math.abs(Math.sin(rAng) * (sb.radius * 0.6)) - 10 + floatY;
        ctx.fillRect(rx - 2, ry - 3, 4, 6);
      }

      ctx.restore();
    }

    // =========================================================================
    // 0B. RENDER TEBASAN RAKSASA & ERUPSI EFEK UNGU BERUNTUN (SKILL U EVOLUSI)
    // =========================================================================
    for (i = 0; i < this.giantCleaves.length; i++) {
      var gc = this.giantCleaves[i];

      // FASE 1 (Age 0 - 26): Aura Pengumpulan Energi Ungu di Pedang Xeera
      if (gc.age < 26) {
        var chargeRatio = gc.age / 26;
        ctx.save();
        ctx.translate(moopy.x, moopy.y - 26);
        ctx.strokeStyle = gc.age % 2 === 0 ? "#d946ef" : "#a855f7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 28 * (1 - chargeRatio * 0.6), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // FASE 2 (Age 22 - 58): Ayunan Busur Tebasan Pedang Raksasa Membelah Layar
      if (gc.age >= 22 && gc.age <= 58) {
        var swingAlpha = 1 - (gc.age - 22) / 36;
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, swingAlpha);
        ctx.translate(gc.originX + gc.facing * 20, gc.originY - 24);
        ctx.scale(gc.facing, 1);

        // Busur Sabit Raksasa Ungu-Hitam-Putih
        ctx.strokeStyle = "#6b21a8";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, 78, -1.35, 0.75, false);
        ctx.stroke();

        ctx.strokeStyle = "#d946ef";
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.strokeStyle = "#09090f";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 82, -1.25, 0.65, false);
        ctx.stroke();
        ctx.restore();
      }

      // FASE 3 (Age 26 - 135): Erupsi Pilar Ungu, Sinar Pancaran, & Rentetan Efek Ungu (Gambar 3630487a.jpeg)
      if (gc.age >= 26) {
        var eruptProgress = Math.min(1, (gc.age - 26) / 14);
        var fadeOut = gc.age > 100 ? (135 - gc.age) / 35 : 1.0;

        ctx.save();
        ctx.globalAlpha = Math.max(0, fadeOut);

        // 1. Garis Belahan Pedang Ungu-Hitam di Tanah dari Ujung Pedang Xeera ke Pusat Ledakan
        var swordTipX = gc.originX + gc.facing * 24;
        var swordTipY = gc.originY - 2;
        ctx.strokeStyle = "#7e22ce";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(swordTipX, swordTipY);
        ctx.lineTo(gc.epicenterX, gc.epicenterY - 4);
        ctx.stroke();

        ctx.strokeStyle = "#09090f";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = "#f0abfc";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. Gelombang Bayangan Hitam-Ungu yang Membelah Tanah Kiri & Kanan (Seperti Gambar 3630487a)
        ctx.fillStyle = "rgba(15, 10, 28, 0.78)";
        ctx.beginPath();
        ctx.moveTo(gc.epicenterX, gc.epicenterY - 4);
        ctx.lineTo(gc.epicenterX - 110 * eruptProgress, gc.epicenterY - 24 * eruptProgress);
        ctx.lineTo(gc.epicenterX - 90 * eruptProgress, gc.epicenterY + 12);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(gc.epicenterX, gc.epicenterY - 4);
        ctx.lineTo(gc.epicenterX + 120 * eruptProgress, gc.epicenterY - 32 * eruptProgress);
        ctx.lineTo(gc.epicenterX + 100 * eruptProgress, gc.epicenterY + 12);
        ctx.closePath();
        ctx.fill();

        // 3. Pilar Utama Vertikal Ungu-Merah & 16 Pancaran Sinar Ungu Raksasa dari Titik Tebasan
        ctx.save();
        ctx.translate(gc.epicenterX, gc.epicenterY - 4);

        // Pilar Vertikal Inti (Merah-Ungu-Putih menjulang ke langit)
        var pillarH = 210 * eruptProgress;
        ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
        ctx.fillRect(-12, -pillarH, 24, pillarH);
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(-5, -pillarH, 10, pillarH);
        ctx.fillStyle = "#f0abfc";
        ctx.fillRect(-2, -pillarH, 4, pillarH);

        // Pancaran Sinar-Sinar Ungu & Hitam Melebar (Fanning Slash Rays)
        for (var rIdx = 0; rIdx < gc.rays.length; rIdx++) {
          var ray = gc.rays[rIdx];
          var curLen = ray.len * eruptProgress * (0.9 + Math.sin(gc.age * 0.3 + rIdx) * 0.1);
          ctx.strokeStyle = ray.col;
          ctx.lineWidth = ray.width;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ray.angle) * curLen, Math.sin(ray.angle) * curLen);
          ctx.stroke();
        }

        // Mahkota Ledakan Ungu-Putih di Pusat Tanah
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(0, 0, 18 * eruptProgress, Math.PI, 0, false);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 9 * eruptProgress, Math.PI, 0, false);
        ctx.fill();

        ctx.restore();

        // 4. EFEK-EFEK UNGU SUSULAN (Pilar Api Ungu & Tebasan Silang Ungu Beruntun!)
        for (var pIdx2 = 0; pIdx2 < gc.pillars.length; pIdx2++) {
          var pil = gc.pillars[pIdx2];
          var pRatio = pil.life / pil.maxLife;
          var pW = pil.w * pRatio;
          ctx.fillStyle = "rgba(147, 51, 234, 0.55)";
          ctx.fillRect(pil.x - pW, gc.originY - pil.h, pW * 2, pil.h);
          ctx.fillStyle = "#e879f9";
          ctx.fillRect(pil.x - pW * 0.4, gc.originY - pil.h, pW * 0.8, pil.h);
        }

        for (var asIdx = 0; asIdx < gc.afterSlashes.length; asIdx++) {
          var asl = gc.afterSlashes[asIdx];
          ctx.save();
          ctx.translate(asl.x, asl.y);
          ctx.rotate(asl.angle);
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-asl.len, 0);
          ctx.lineTo(asl.len, 0);
          ctx.stroke();

          ctx.strokeStyle = "#09090f";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }
    }

    // 1. Dive Streaks
    if (this.diveStreaks.length > 0) {
      for (i = 0; i < this.diveStreaks.length; i++) {
        var ds = this.diveStreaks[i];
        var cols = ds.isPurple
          ? ["#09090f", "#7e22ce", "#d946ef", "#ffffff"]
          : ["#09090f", "#ffbe0b", "#00e5ff", "#ffffff"];
        for (var sc = 0; sc < 4; sc++) {
          ctx.strokeStyle = cols[sc];
          ctx.lineWidth = sc === 0 ? 2.5 : (sc === 3 ? 1 : 1.8);
          ctx.beginPath();
          var off = (sc - 1.5) * 2.5;
          ctx.moveTo(ds.x - ds.vx * 2.6 + off, ds.y - ds.vy * 2.6 - off);
          ctx.lineTo(ds.x + ds.vx * 1.2 + off, ds.y + ds.vy * 1.2 - off);
          ctx.stroke();
        }
      }
    }

    // 2. Jejak Tebasan Pedang Ame no Habakiri (Basic Attack Xeera)
    for (i = 0; i < this.swordTrails.length; i++) {
      var st = this.swordTrails[i];
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.scale(st.facing, 1);

      var startA = -1.25;
      var endA = 0.85;
      var rad = 25 * charScale;

      if (st.swingType === 2) {
        startA = -0.95;
        endA = 1.15;
        rad = 27 * charScale;
      } else if (st.swingType === 3) {
        startA = -1.35;
        endA = 1.25;
        rad = 32 * charScale;
      }

      ctx.strokeStyle = st.isEvo ? "#e11d48" : "#7e22ce";
      ctx.lineWidth = 6.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, rad, startA, endA, false);
      ctx.stroke();

      ctx.strokeStyle = "#d946ef";
      ctx.lineWidth = 4.2;
      ctx.stroke();

      ctx.strokeStyle = "#09090f";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, rad + 2.2, startA + 0.1, endA - 0.1, false);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Proyektil Slash Angin Ungu-Hitam (Basic Attack ke-3 Xeera)
    for (i = 0; i < this.windSlashes.length; i++) {
      var ws = this.windSlashes[i];
      ctx.save();
      ctx.translate(Math.round(ws.x), Math.round(ws.y));
      ctx.scale(ws.facing, 1);

      ctx.strokeStyle = "#9333ea";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, ws.radius, -1.05, 1.05, false);
      ctx.stroke();

      ctx.strokeStyle = "#e879f9";
      ctx.lineWidth = 3.4;
      ctx.stroke();

      ctx.strokeStyle = "#09090f";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, ws.radius + 2, -0.9, 0.9, false);
      ctx.stroke();

      ctx.restore();
    }

    // 4. Slash Arcs
    for (i = 0; i < this.slashArcs.length; i++) {
      var s = this.slashArcs[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(s.facing, 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (s.isUpward) ctx.arc(0, 0, s.radius, -1.3, 0.45, false);
      else ctx.arc(0, 0, s.radius, -0.75, 0.9, false);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Claw Slash Effects
    for (i = 0; i < this.clawEffects.length; i++) {
      var c = this.clawEffects[i];
      var progress = 1 - c.life / c.maxLife;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.facing, 1);
      var colPrimary = c.isWolf ? "#38bdf8" : "#f43f5e";
      var len = Math.round(22 * Math.min(1, progress * 2.1));
      for (var line = -1; line <= 1; line++) {
        var oy = line * 5;
        for (var step = 0; step < len; step += 2) {
          var thick = (step > 4 && step < len - 4) ? 3 : 2;
          ctx.fillStyle = colPrimary;
          ctx.fillRect(-10 + step, Math.round(-8 + oy + step * 0.65), thick, thick);
          if (thick === 3) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-9 + step, Math.round(-7 + oy + step * 0.65), 1, 1);
          }
        }
      }
      ctx.restore();
    }

    // 5B. Feral Werewolf Claw FX (Moopy Wolf)
    for (i = 0; i < this.feralSpeedLines.length; i++) {
      var fsl = this.feralSpeedLines[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, fsl.life / fsl.maxLife);
      ctx.strokeStyle = fsl.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(fsl.x1, fsl.y1);
      ctx.lineTo(fsl.x2, fsl.y2);
      ctx.stroke();
      ctx.restore();
    }

    for (i = 0; i < this.feralArcs.length; i++) {
      var fa = this.feralArcs[i];
      var faProgress = 1 - (fa.life / fa.maxLife);
      ctx.save();
      ctx.globalAlpha = Math.min(1, (fa.life / fa.maxLife) * 1.35);
      ctx.translate(fa.x, fa.y);
      ctx.scale(fa.facing, 1);
      ctx.rotate(fa.tilt);
      for (var faClaw = -1; faClaw <= 1; faClaw++) {
        var faR = fa.radius + faClaw * 5;
        var faStart = -1.35 + faProgress * 0.25;
        var faEnd = 1.15 + faProgress * 0.35;

        ctx.strokeStyle = "#090514";
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.arc(6, faClaw * 4, faR, faStart, faEnd);
        ctx.stroke();

        ctx.strokeStyle = faClaw === 0 ? "#e11d48" : "#a855f7";
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.arc(6, faClaw * 4, faR, faStart + 0.08, faEnd);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(6, faClaw * 4, faR, faStart + 0.35, faEnd - 0.08);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (i = 0; i < this.ribbonVortices.length; i++) {
      var rv = this.ribbonVortices[i];
      ctx.save();
      ctx.globalAlpha = Math.min(1, (rv.life / rv.maxLife) * 1.3);
      ctx.translate(rv.x, rv.y);
      var rvLoops = [
        { rx: 56, ry: 16, rot: 0.28, color: "#e11d48" },
        { rx: 56, ry: 16, rot: -0.28, color: "#a855f7" },
        { rx: 38, ry: 26, rot: 0.72, color: "#f43f5e" },
        { rx: 38, ry: 26, rot: -0.72, color: "#c084fc" }
      ];
      for (var rvIdx = 0; rvIdx < rvLoops.length; rvIdx++) {
        var rvLoop = rvLoops[rvIdx];
        ctx.save();
        ctx.rotate(rvLoop.rot);
        for (var rvClaw = -1; rvClaw <= 1; rvClaw++) {
          ctx.strokeStyle = "#090514";
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.ellipse(0, rvClaw * 3.5, rvLoop.rx, rvLoop.ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = rvLoop.color;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.ellipse(0, rvClaw * 3.5, rvLoop.rx, rvLoop.ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-26, -22);
      ctx.lineTo(26, 22);
      ctx.moveTo(-26, 22);
      ctx.lineTo(26, -22);
      ctx.stroke();
      ctx.restore();
    }

    for (i = 0; i < this.xCrossClaws.length; i++) {
      var xc = this.xCrossClaws[i];
      var xcArm = 58;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (xc.life / xc.maxLife) * 1.3);
      ctx.translate(xc.x, xc.y);
      var xcAngles = [-0.68, 0.68];
      for (var xa = 0; xa < xcAngles.length; xa++) {
        ctx.save();
        ctx.rotate(xcAngles[xa]);
        for (var xcClaw = -1; xcClaw <= 1; xcClaw++) {
          var xcOy = xcClaw * 6.5;

          ctx.strokeStyle = "#090514";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(-xcArm, xcOy);
          ctx.lineTo(xcArm, xcOy);
          ctx.stroke();

          ctx.strokeStyle = "#9333ea";
          ctx.lineWidth = 3.6;
          ctx.beginPath();
          ctx.moveTo(-xcArm * 0.92, xcOy);
          ctx.lineTo(xcArm * 0.92, xcOy);
          ctx.stroke();

          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-xcArm * 0.55, xcOy);
          ctx.lineTo(xcArm * 0.55, xcOy);
          ctx.stroke();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-xcArm * 0.35, xcOy);
          ctx.lineTo(xcArm * 0.35, xcOy);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    // 6. Batched Lightning Bolts
    if (this.lightningBolts.length > 0) {
      ctx.strokeStyle = "#09090f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (i = 0; i < this.lightningBolts.length; i++) {
        b = this.lightningBolts[i];
        for (pIdx = 0; pIdx < b.pts.length; pIdx++) {
          pt0 = b.pts[pIdx];
          if (pIdx === 0) ctx.moveTo(pt0.x + 1.5, pt0.y + 1);
          else ctx.lineTo(pt0.x + 1.5, pt0.y + 1);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#ffbe0b";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (i = 0; i < this.lightningBolts.length; i++) {
        b = this.lightningBolts[i];
        for (pIdx = 0; pIdx < b.pts.length; pIdx++) {
          pt0 = b.pts[pIdx];
          if (pIdx === 0) ctx.moveTo(pt0.x - 1, pt0.y);
          else ctx.lineTo(pt0.x - 1, pt0.y);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (i = 0; i < this.lightningBolts.length; i++) {
        b = this.lightningBolts[i];
        for (pIdx = 0; pIdx < b.pts.length; pIdx++) {
          pt0 = b.pts[pIdx];
          if (pIdx === 0) ctx.moveTo(pt0.x + 1, pt0.y);
          else ctx.lineTo(pt0.x + 1, pt0.y);
        }
        for (j = 0; j < b.branches.length; j++) {
          var br = b.branches[j];
          ctx.moveTo(br[0].x, br[0].y);
          ctx.lineTo(br[1].x, br[1].y);
          ctx.lineTo(br[2].x, br[2].y);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < this.lightningBolts.length; i++) {
        b = this.lightningBolts[i];
        for (pIdx = 0; pIdx < b.pts.length; pIdx++) {
          pt0 = b.pts[pIdx];
          if (pIdx === 0) ctx.moveTo(pt0.x, pt0.y);
          else ctx.lineTo(pt0.x, pt0.y);
        }
      }
      ctx.stroke();
    }

    // 7. Batched Starburst Impacts
    if (this.starImpacts.length > 0) {
      var rayColors = ["#00e5ff", "#ffbe0b", "#09090f"];
      for (var rc = 0; rc < 3; rc++) {
        ctx.strokeStyle = rayColors[rc];
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (i = 0; i < this.starImpacts.length; i++) {
          var stImp = this.starImpacts[i];
          var scaleRatio = (stImp.life / stImp.maxLife);
          for (j = 0; j < stImp.rays.length; j++) {
            var r = stImp.rays[j];
            if (r.type === rc) {
              ctx.moveTo(stImp.x, stImp.y);
              ctx.lineTo(stImp.x + r.dx * scaleRatio, stImp.y + r.dy * scaleRatio);
            }
          }
        }
        ctx.stroke();
      }
      for (i = 0; i < this.starImpacts.length; i++) {
        var stCore = this.starImpacts[i];
        ctx.fillStyle = "#d946ef";
        ctx.fillRect(stCore.x - 4, stCore.y - 4, 8, 8);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(stCore.x - 2, stCore.y - 2, 4, 4);
      }
    }

    // 8. Roar Soundwave Rings
    for (i = 0; i < this.roarWaves.length; i++) {
      var w = this.roarWaves[i];
      var waveColor = w.isFeral
        ? (w.life % 2 === 0 ? "#a855f7" : "#e11d48")
        : (w.life % 2 === 0 ? "#facc15" : "#38bdf8");
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = w.isFeral ? 3.5 : 2;
      ctx.beginPath();
      if (w.facing === 1) {
        ctx.arc(Math.round(w.x), Math.round(w.y), Math.round(w.radius), -0.85, 0.85, false);
      } else {
        ctx.arc(Math.round(w.x), Math.round(w.y), Math.round(w.radius), Math.PI - 0.85, Math.PI + 0.85, false);
      }
      ctx.stroke();

      if (w.isFeral) {
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (w.facing === 1) {
          ctx.arc(Math.round(w.x), Math.round(w.y), Math.round(w.radius * 0.76), -0.82, 0.82, false);
        } else {
          ctx.arc(Math.round(w.x), Math.round(w.y), Math.round(w.radius * 0.76), Math.PI - 0.82, Math.PI + 0.82, false);
        }
        ctx.stroke();
      }
    }

    // 9. Wolf Hyper Laser Beam
    for (i = 0; i < this.activeLasers.length; i++) {
      var l = this.activeLasers[i];
      var startX = Math.round(moopy.x + moopy.facing * (18 * charScale));
      var startY = Math.round(moopy.y - 14 * charScale);
      var beamWidth = moopy.facing === 1 ? (baseW - startX) : -startX;
      var thickness = l.life > 30 ? 4 : 11;

      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(startX - 4, startY - 4, 8, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(startX - 2, startY - 2, 4, 4);

      if (l.life <= 30) {
        ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
        ctx.fillRect(startX, Math.round(startY - thickness / 2 - 2), beamWidth, thickness + 4);
        ctx.fillStyle = l.life % 2 === 0 ? "#f43f5e" : "#a855f7";
        ctx.fillRect(startX, Math.round(startY - thickness / 2), beamWidth, thickness);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(startX, Math.round(startY - 2), beamWidth, 4);
      }
    }

    // 10. Pixel Particles
    for (i = 0; i < this.particles.length; i++) {
      var pt = this.particles[i];
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }

    // 11. Floating Damage Numbers
    for (i = 0; i < this.damageNumbers.length; i++) {
      var dn = this.damageNumbers[i];
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillStyle = "#000000";
      ctx.fillText("-" + dn.text, Math.round(dn.x) + 1, Math.round(dn.y) + 1);
      ctx.fillStyle = dn.color;
      ctx.fillText("-" + dn.text, Math.round(dn.x), Math.round(dn.y));
    }
  }
};
