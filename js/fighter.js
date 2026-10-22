window.MoopyGame = window.MoopyGame || {};

(function (G) {
  "use strict";

  var cds = G.Config.cooldowns;

  G.moopy = {
    charId: "moopy",
    x: 130,
    y: G.Config.GROUND_Y,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: true,
    jumpsUsed: 0,
    maxJumps: 2,
    hp: 1000,
    maxHp: 1000,
    displayHp: 1000,
    rage: 100,
    maxRage: 100,
    isWolf: false,
    evoTimer: 0,
    wolfAuraTimer: 0,
    // Sistem Energi & Evolusi: energi diisi lewat serangan yang mengenai lawan.
    // Saat FULL (100%), P bisa ditekan. Energi terkuras habis dalam 27 detik
    // (27 * 60 frame = 1620 frame) lalu otomatis kembali ke Base Form.
    energy: 0,
    maxEnergy: 100,
    evoFrames: 27 * 60,
    energyGain: 4.5,
    state: "idle",
    stateTimer: 0,
    maxStateTimer: 14,
    attackType: "",
    comboStep: 0,
    lastAttackFamily: "",
    comboWindow: 0,
    comboCount: 0,
    comboResetTimer: 0,
    animTick: 0,
    blitzRemaining: 0,
    blitzTimer: 0,
    stormTimer: 0,
    dashCharges: G.Config.maxDashCharges || 3,
    maxDashCharges: G.Config.maxDashCharges || 3,
    cd: {
      dash: 0,
      wolf: 0,
      roar: 0,
      laser: 0
    },
    maxCd: {
      dash: cds.dashL,
      wolf: cds.ultWolfP,
      roar: cds.roarU,
      laser: cds.laserI
    }
  };

  G.dummy = {
    x: 335,
    y: G.Config.GROUND_Y,
    vx: 0,
    vy: 0,
    facing: -1,
    onGround: true,
    hp: 1500,
    maxHp: 1500,
    displayHp: 1500,
    hitFlash: 0,
    hurtTimer: 0,
    stunTimer: 0,
    koResetTimer: 0,
    aiTick: 0,
    patrolDir: -1
  };

  function setAnimState(m, stateName, duration) {
    m.state = stateName;
    m.stateTimer = duration;
    m.maxStateTimer = Math.max(1, duration);
  }

  G.Actions = {
    // Dipanggil setiap kali serangan player mengenai dummy (lihat applyDamageToDummy).
    // Berlaku untuk SEMUA karakter (Moopy, Simon, Xeera) selama masih Base Form.
    addEnergy: function (amount) {
      var m = G.moopy;
      if (m.isWolf) return;
      m.energy = Math.min(m.maxEnergy, m.energy + amount);
    },

    // Menguras energi selama 27 detik saat mode evolusi aktif (Moopy, Simon, Xeera).
    // Saat energi habis: kembali ke Base Form + efek visual sesuai karakter.
    updateEnergyDrain: function () {
      var m = G.moopy;
      if (!m.isWolf) return;
      if (m.energy <= 0) {
        this.revertToBaseForm();
        return;
      }
      m.energy = Math.max(0, m.energy - (m.maxEnergy / m.evoFrames));
    },

    // Kembalikan karakter ke Base Form saat energi evolusi habis.
    revertToBaseForm: function () {
      var m = G.moopy;
      var s = G.Config.charScale;
      m.isWolf = false;
      m.energy = 0;
      m.evoTimer = 0;
      m.attackType = "";
      m.blitzRemaining = 0;
      G.Sound.play("transform");

      if (m.charId === "xeera") {
        G.FX.spawnStarImpact(m.x, m.y - 20 * s, 1.2);
        G.FX.spawnHitParticles(m.x, m.y - 16 * s, "#a855f7", 12);
      } else if (m.charId === "simon") {
        G.FX.spawnStarImpact(m.x, m.y - 20 * s, 1.2);
        G.FX.spawnHitParticles(m.x, m.y - 16 * s, "#facc15", 12);
      } else {
        G.FX.spawnStarImpact(m.x, m.y - 20 * s, 1.2);
        G.FX.spawnHitParticles(m.x, m.y - 16 * s, "#38bdf8", 10);
      }
      G.FX.spawnDust(m.x, G.Config.GROUND_Y, 0, 5);
      this.updateModeBadge();
    },

    updateModeBadge: function () {
      var m = G.moopy;
      var badge = document.getElementById("modeBadge");
      if (!badge) return;

      if (m.charId === "xeera") {
        if (m.isWolf) {
          var secLeft = Math.ceil((m.energy / m.maxEnergy) * 27);
          badge.textContent = "XEERA: EVOLUSI (" + secLeft + "s)";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-purple-950/90 border border-rose-500 text-purple-200";
        } else {
          badge.textContent = "XEERA: AME NO HABAKIRI";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-purple-950/90 border border-purple-400 text-purple-200";
        }
      } else if (m.charId === "simon") {
        if (m.isWolf) {
          badge.textContent = "SIMON: THUNDER DEVIL";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-amber-950/90 border border-amber-400 text-amber-200";
        } else {
          badge.textContent = "SIMON: THUNDER MAGE";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-sky-950/90 border border-sky-400 text-sky-200";
        }
      } else {
        if (m.isWolf) {
          badge.textContent = "MOOPY: DIRE WOLF";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-fuchsia-950/90 border border-fuchsia-400 text-fuchsia-200";
        } else {
          badge.textContent = "MOOPY: STICKMAN";
          badge.className = "font-pixel text-[8px] px-2 py-1 bg-indigo-950/90 border border-indigo-400 text-indigo-200";
        }
      }
    },

    applyDamageToDummy: function (dmg, knockX, knockY, color, moveLabel, isClawVisual) {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;

      var mult = (d.stunTimer > 0 ? 1.25 : 1.0) * (m.isWolf && m.charId !== "moopy" ? 1.25 : 1.0);
      var finalDmg = Math.round(dmg * mult);

      d.hp = Math.max(0, d.hp - finalDmg);
      d.hitFlash = 7;
      d.hurtTimer = 13;
      d.vx = m.facing * knockX;
      if (knockY < 0) {
        d.vy = knockY;
        d.onGround = false;
      }

      m.rage = Math.min(m.maxRage, m.rage + 12);
      m.comboCount += 1;
      m.comboResetTimer = 115;
      this.addEnergy(m.energyGain);

      var hitX = d.x;
      var hitY = d.y - 22 * s;

      G.FX.spawnDamageNumber(hitX, hitY, finalDmg, color);
      G.FX.spawnHitParticles(hitX, hitY, color, 8);

      if (m.charId === "simon") {
        G.FX.spawnStarImpact(hitX, hitY, finalDmg >= 30 ? 1.1 : 0.75);
      } else if (m.charId === "moopy" && isClawVisual) {
        G.FX.spawnClawEffect(d.x, d.y - 18 * s, m.facing, m.isWolf);
      }

      if (G.Camera) {
        G.Camera.shake = Math.min(7, Math.floor(finalDmg / 8) + 2);
      }
    },

    checkMeleeHit: function (rangeX, rangeY, dmg, knockX, knockY, color, moveLabel, showClaw) {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;
      var dx = d.x - m.x;
      var dy = Math.abs(d.y - m.y);
      var inFront = (m.facing === 1 && dx >= -12 && dx <= rangeX) ||
                    (m.facing === -1 && dx <= 12 && dx >= -rangeX);

      if (m.charId !== "xeera") {
        G.FX.spawnSlashArc(
          m.x + m.facing * (14 * s),
          m.y - 16 * s,
          m.facing,
          color,
          18 * s,
          knockY < -2
        );
      }

      if (inFront && dy <= rangeY) {
        this.applyDamageToDummy(dmg, knockX, knockY, color, "", showClaw);
        return true;
      } else if (showClaw && m.charId === "moopy") {
        G.FX.spawnClawEffect(m.x + m.facing * (22 * s), m.y - 16 * s, m.facing, m.isWolf);
      }
      return false;
    },

    jump: function () {
      var m = G.moopy;
      if (m.state === "laser" || m.state === "transform" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;

      if (m.onGround) {
        m.vy = -6.6;
        m.onGround = false;
        m.jumpsUsed = 1;
        G.Sound.play("jump");
        G.FX.spawnDust(m.x, G.Config.GROUND_Y, m.facing, 4);
      } else if (m.jumpsUsed < m.maxJumps) {
        m.vy = -6.2;
        m.onGround = false;
        m.jumpsUsed = 2;
        G.Sound.play("doublejump");
        var jCol = m.charId === "xeera" ? "#d946ef" : (m.charId === "simon" ? "#ffbe0b" : "#38bdf8");
        G.FX.spawnHitParticles(m.x, m.y - 6, jCol, 7);
      }
    },

    dash: function () {
      var m = G.moopy;
      if (m.state === "laser" || m.state === "transform" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;
      if (m.cd.dash > 0) {
        G.Sound.play("cooldown");
        return;
      }

      var oldX = m.x;
      var oldY = m.y - 15;
      setAnimState(m, "dash", 11);
      m.vx = m.facing * (m.isWolf ? 8.6 : 7.6);
      if (!m.onGround && m.vy > 0) m.vy = 0;

      m.dashCharges--;
      if (m.dashCharges <= 0) {
        m.cd.dash = m.maxCd.dash;
      }

      if (m.charId === "simon") {
        G.Sound.play("zap");
        G.FX.spawnLightningBolt(oldX, oldY, oldX + m.facing * 52, oldY - 2, 2, 11, true);
      } else if (m.charId === "xeera") {
        G.Sound.play("claw");
        G.FX.spawnHitParticles(m.x, m.y - 14, "#c084fc", 7);
      } else {
        G.Sound.play("dash");
        G.FX.spawnDust(m.x, m.y, m.facing, 5);
        if (m.isWolf) {
          G.FX.spawnFeralSpeedLines(m.x, m.y - 16, m.facing, 6);
        }
      }
    },

    basicAttackJ: function () {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;
      if (m.state === "laser" || m.state === "transform" || m.state === "roar" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;

      if (m.comboWindow > 0) {
        m.comboStep = (m.comboStep + 1) % 3;
      } else {
        m.comboStep = 0;
      }

      m.comboWindow = 36;
      m.vx = m.facing * (m.isWolf ? 3.5 : 2.5);

      if (m.charId === "xeera") {
        G.Sound.play("claw");
        var slashX = m.x + m.facing * (12 * s);
        var slashY = m.y - 17 * s;

        if (m.comboStep === 0) {
          m.attackType = "punch1";
          setAnimState(m, "attack", 13);
          G.FX.spawnSwordTrail(slashX, slashY, m.facing, 1, m.isWolf);
          this.checkMeleeHit(60 * s, 42 * s, 16, 1.8, 0, "#c084fc", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "punch2";
          setAnimState(m, "attack", 14);
          G.FX.spawnSwordTrail(slashX, slashY - 2, m.facing, 2, m.isWolf);
          this.checkMeleeHit(64 * s, 44 * s, 22, 2.4, -1.6, "#a855f7", "", false);
        } else {
          m.attackType = "clawFinisher";
          setAnimState(m, "attack", 18);
          G.FX.spawnSwordTrail(slashX + m.facing * 4, slashY, m.facing, 3, m.isWolf);
          G.FX.spawnWindSlash(m.x + m.facing * (22 * s), m.y - 16 * s, m.facing, false);
          this.checkMeleeHit(70 * s, 46 * s, 32, 4.8, -2.5, "#d946ef", "", false);
        }
        m.lastAttackFamily = "J";
        return;
      }

      if (m.charId === "simon") {
        G.Sound.play("zap");
        var handX = m.x + m.facing * (14 * s);
        var handY = m.y - 18 * s;

        if (m.comboStep === 0) {
          m.attackType = "punch1";
          setAnimState(m, "attack", 12);
          G.FX.spawnLightningBolt(handX, handY, handX + m.facing * (34 * s), handY - 3, 2, 9, false);
          this.checkMeleeHit(54 * s, 38 * s, 14, 1.8, 0, "#00e5ff", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "punch2";
          setAnimState(m, "attack", 14);
          G.FX.spawnLightningBolt(handX, handY, handX + m.facing * (42 * s), handY - 12 * s, 2, 10, true);
          this.checkMeleeHit(58 * s, 42 * s, 20, 2.4, -1.4, "#ffbe0b", "", false);
        } else {
          m.attackType = "clawFinisher";
          setAnimState(m, "attack", 17);
          var boltEndX = m.x + m.facing * (82 * s);
          var dx = d.x - m.x;
          if ((m.facing === 1 && dx > 0 && dx < 90 * s) || (m.facing === -1 && dx < 0 && dx > -90 * s)) {
            boltEndX = d.x;
          }
          G.FX.spawnLightningBolt(handX, handY, boltEndX, handY, 2, 12, true);
          if (m.isWolf) {
            G.FX.spawnLightningBolt(handX, handY - 6, boltEndX, handY + 5, 2, 12, false);
          }
          this.checkMeleeHit(88 * s, 46 * s, 34, 5.2, -2.8, "#00e5ff", "", false);
        }
        m.lastAttackFamily = "J";
        return;
      }

      if (!m.isWolf) {
        if (m.lastAttackFamily === "K" && m.comboStep > 0) {
          m.attackType = "clawFinisher";
          setAnimState(m, "attack", 16);
          m.comboStep = 0;
          G.Sound.play("claw");
          this.checkMeleeHit(54 * s, 42 * s, 34, 4.8, -2.8, "#f43f5e", "", true);
        } else if (m.comboStep === 0) {
          m.attackType = "punch1";
          setAnimState(m, "attack", 12);
          G.Sound.play("punch");
          this.checkMeleeHit(44 * s, 36 * s, 12, 1.5, 0, "#fde047", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "punch2";
          setAnimState(m, "attack", 14);
          G.Sound.play("punch");
          this.checkMeleeHit(46 * s, 38 * s, 18, 2.0, -1.2, "#fb923c", "", false);
        } else {
          m.attackType = "clawFinisher";
          setAnimState(m, "attack", 17);
          G.Sound.play("claw");
          this.checkMeleeHit(56 * s, 44 * s, 32, 5.2, -3.0, "#22d3ee", "", true);
        }
      } else {
        G.Sound.play("claw");
        G.FX.spawnFeralClawArc(m.x + m.facing * (18 * s), m.y - 18 * s, m.facing, m.comboStep);
        if (m.comboStep === 0) {
          m.attackType = "wolfClaw1";
          setAnimState(m, "attack", 12);
          this.checkMeleeHit(56 * s, 40 * s, 22, 2.4, 0, "#e11d48", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "wolfClaw2";
          setAnimState(m, "attack", 14);
          this.checkMeleeHit(58 * s, 42 * s, 28, 3.0, -1.5, "#a855f7", "", false);
        } else {
          m.attackType = "wolfClaw3";
          setAnimState(m, "attack", 17);
          this.checkMeleeHit(64 * s, 46 * s, 42, 6.0, -3.5, "#f43f5e", "", false);
        }
      }
      m.lastAttackFamily = "J";
    },

    kickAttackK: function () {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;
      if (m.state === "laser" || m.state === "transform" || m.state === "roar" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;

      if (m.charId === "xeera") {
        if (m.onGround) return;
        setAnimState(m, "diveKick", 22);
        m.attackType = "kick3";
        var dxX = d.x - m.x;
        var dyX = (d.y - 10) - m.y;
        var distX = Math.hypot(dxX, dyX) || 1;
        var spdX = m.jumpsUsed >= 2 ? 12.0 : 10.2;
        m.facing = dxX >= 0 ? 1 : -1;
        m.vx = (dxX / distX) * spdX;
        m.vy = Math.max(3.2, (dyX / distX) * spdX);
        G.Sound.play("claw");
        G.FX.spawnSwordTrail(m.x + m.facing * 10, m.y - 14 * s, m.facing, 1, m.isWolf);
        return;
      }

      if (m.charId === "simon" && !m.onGround && m.jumpsUsed >= 2) {
        setAnimState(m, "diveKick", 22);
        m.attackType = "kick3";
        var dx = d.x - m.x;
        var dy = (d.y - 10) - m.y;
        var dist = Math.hypot(dx, dy) || 1;
        var speed = 11.5;
        m.facing = dx >= 0 ? 1 : -1;
        m.vx = (dx / dist) * speed;
        m.vy = Math.max(3.5, (dy / dist) * speed);
        G.Sound.play("zap");
        G.FX.spawnStarImpact(m.x, m.y - 12, 0.9);
        return;
      }

      if (m.comboWindow > 0) {
        m.comboStep = (m.comboStep + 1) % 3;
      } else {
        m.comboStep = 0;
      }

      m.comboWindow = 34;
      m.vx = m.facing * (m.isWolf ? 3.6 : 2.5);

      if (m.charId === "simon") {
        G.Sound.play("zap");
        var footX = m.x + m.facing * (14 * s);
        var footY = m.y - 12 * s;
        G.FX.spawnLightningBolt(m.x, footY, footX + m.facing * (34 * s), footY - (m.comboStep * 6), 2, 10, m.comboStep === 2);

        if (m.comboStep === 0) {
          m.attackType = "kick1";
          setAnimState(m, "attack", 13);
          this.checkMeleeHit(52 * s, 38 * s, 16, 2.2, 0, "#00e5ff", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "kick2";
          setAnimState(m, "attack", 15);
          this.checkMeleeHit(56 * s, 42 * s, 24, 3.0, -2.4, "#ffbe0b", "", false);
        } else {
          m.attackType = "kick3";
          setAnimState(m, "attack", 17);
          this.checkMeleeHit(62 * s, 46 * s, 36, 5.6, -3.4, "#00e5ff", "", false);
        }
        m.lastAttackFamily = "K";
        return;
      }

      G.Sound.play("kick");
      if (!m.isWolf) {
        if (m.lastAttackFamily === "J" && m.comboStep === 1) {
          m.attackType = "crossKnee";
          setAnimState(m, "attack", 14);
          this.checkMeleeHit(48 * s, 42 * s, 25, 2.2, -4.2, "#34d399", "", false);
        } else if (m.lastAttackFamily === "J" && m.comboStep === 2) {
          m.attackType = "crossCrescent";
          setAnimState(m, "attack", 16);
          this.checkMeleeHit(58 * s, 46 * s, 38, 5.8, -3.2, "#10b981", "", false);
        } else if (m.comboStep === 0) {
          m.attackType = "kick1";
          setAnimState(m, "attack", 13);
          this.checkMeleeHit(48 * s, 36 * s, 15, 2.0, 0, "#4ade80", "", false);
        } else if (m.comboStep === 1) {
          m.attackType = "kick2";
          setAnimState(m, "attack", 15);
          this.checkMeleeHit(52 * s, 40 * s, 23, 2.8, -2.2, "#2dd4bf", "", false);
        } else {
          m.attackType = "kick3";
          setAnimState(m, "attack", 17);
          this.checkMeleeHit(56 * s, 44 * s, 35, 5.5, -3.4, "#fbbf24", "", false);
        }
      } else {
        if (m.comboStep % 2 === 0) {
          m.attackType = "wolfKick1";
          setAnimState(m, "attack", 14);
          this.checkMeleeHit(58 * s, 42 * s, 26, 3.5, -2.5, "#34d399", "", true);
        } else {
          m.attackType = "wolfKick2";
          setAnimState(m, "attack", 16);
          this.checkMeleeHit(62 * s, 46 * s, 36, 5.5, -3.5, "#a78bfa", "", true);
        }
      }
      m.lastAttackFamily = "K";
    },

    ultimateTransformP: function () {
      var m = G.moopy;
      var s = G.Config.charScale;
      if (m.state === "laser" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;

      // Semua karakter (Moopy, Simon, Xeera): berubah/evolusi HANYA saat energi FULL (100%).
      // Energi lalu terkuras otomatis selama 27 detik, dan kembali ke Base Form saat habis.
      if (m.isWolf || m.energy < m.maxEnergy) {
        G.Sound.play("cooldown");
        return;
      }

      if (m.charId === "xeera") {
        m.isWolf = true;
        m.energy = m.maxEnergy;
        m.evoTimer = m.evoFrames;
        setAnimState(m, "transform", 24);
        m.vx = 0;
        G.Sound.play("transform");
        if (G.Camera) G.Camera.shake = 9;
        G.FX.spawnHitParticles(m.x, m.y - 16, "#a855f7", 12);
        G.FX.spawnStarImpact(m.x, m.y - 20, 1.2);
        G.FX.spawnWindSlash(m.x, m.y - 18 * s, 1, true);
        G.FX.spawnWindSlash(m.x, m.y - 18 * s, -1, true);
        this.checkMeleeHit(80 * s, 55 * s, 30, 4.5, -2.8, "#d946ef", "", false);
        this.updateModeBadge();
        return;
      }

      if (m.charId === "moopy") {
        m.isWolf = true;
        m.energy = m.maxEnergy;
        setAnimState(m, "transform", 22);
        m.vx = 0;
        G.Sound.play("transform");
        if (G.Camera) G.Camera.shake = 8;
        this.updateModeBadge();
        G.FX.spawnHitParticles(m.x, m.y - 14, "#e879f9", 10);
        G.FX.spawnStarImpact(m.x, m.y - 20, 1.1);
        G.FX.spawnFeralSpeedLines(m.x, m.y - 18, m.facing, 10);
        this.checkMeleeHit(75 * s, 50 * s, 25, 4.0, -2.5, "#e11d48", "", false);
        return;
      }

      // SIMON: Base Mage -> Thunder Devil (bertanduk), durasi 27 detik.
      m.isWolf = true;
      m.energy = m.maxEnergy;
      setAnimState(m, "transform", 22);
      m.vx = 0;
      G.Sound.play("thunder");
      if (G.Camera) G.Camera.shake = 8;
      this.updateModeBadge();

      G.FX.spawnLightningBolt(m.x - 14, 0, m.x, m.y - 16 * s, 2, 14, true);
      G.FX.spawnLightningBolt(m.x + 14, 0, m.x, m.y - 16 * s, 2, 14, false);
      G.FX.spawnStarImpact(m.x, m.y - 20 * s, 1.2);
      G.FX.spawnHitParticles(m.x, m.y - 16 * s, "#facc15", 12);
      this.checkMeleeHit(75 * s, 50 * s, 28, 4.0, -2.5, "#ef4444", "", false);
    },

    // U: Skill 1
    // Saat Xeera Evolusi -> Menebas Lama & Besar + Diikuti Rentetan Efek Ungu (Gambar 3630487a.jpeg)!
    wolfRoarU: function () {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;
      if (m.state === "laser" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;
      if (m.cd.roar > 0) {
        G.Sound.play("cooldown");
        return;
      }

      if (m.charId === "xeera") {
        m.cd.roar = 120; // CD 2 Detik
        if (!m.isWolf) {
          // Sebelum Evolusi: Melesat cepat & menebas lawan
          var startX = m.x;
          var dashDist = m.facing * 105;
          m.x = Math.max(26, Math.min(G.Config.BASE_W - 26, m.x + dashDist));
          m.attackType = "clawFinisher";
          setAnimState(m, "attack", 16);
          G.Sound.play("claw");
          G.FX.spawnDiveStreak((startX + m.x) * 0.5, m.y - 16 * s, m.facing * 14, 0, true);
          G.FX.spawnSwordTrail(m.x, m.y - 16 * s, m.facing, 3, false);

          var minX = Math.min(startX, m.x) - 18;
          var maxX = Math.max(startX, m.x) + 18;
          if (d.x >= minX && d.x <= maxX && Math.abs(d.y - m.y) < 48 * s) {
            this.applyDamageToDummy(38, 3.8, -2.2, "#c084fc", "", false);
          }
        } else {
          // SAAT EVOLUSI: Menebas Lama (85 frame) & Besar + Rentetan Efek Ungu Beruntun!
          m.attackType = "xeeraGiantSlash";
          setAnimState(m, "attack", 85);
          m.vx = 0;
          G.Sound.play("transform");
          G.FX.spawnGiantEvoCleave(m.x, G.Config.GROUND_Y, m.facing);
        }
        return;
      }

      m.cd.roar = m.maxCd.roar;

      if (m.charId === "simon") {
        if (!m.isWolf) {
          // SEBELUM EVOLUSI (Thunder Mage): Menembakkan 3 gelombang kilat beruntun
          // dari tangannya, lalu maju menghantam target dengan pukulan petir.
          m.attackType = "simonBaseU";
          setAnimState(m, "simonBaseU", 34);
          m.vx = 0;
          G.Sound.play("zap");
        } else {
          // SESUDAH EVOLUSI (Thunder Devil): 3x Thunder Blitz Strike
          // (melesat zig-zag & memukul berulang 3 kali).
          m.state = "blitz";
          m.blitzRemaining = 3;
          m.blitzTimer = 1;
          m.vx = 0;
          m.vy = 0;
        }
        return;
      }

      // MOOPY SKILL U: Berbeda antara Sebelum Berubah & Sesudah Berubah!
      if (!m.isWolf) {
        // Sebelum Berubah: Cakaran beruntun 4x (multi-hit)
        m.attackType = "moopyClawFlurry";
        setAnimState(m, "moopyClawFlurry", 36);
        m.vx = m.facing * 2.5;
        G.Sound.play("claw");
        G.FX.spawnClawEffect(m.x + m.facing * (18 * s), m.y - 18 * s, m.facing, false);
      } else {
        // Sesudah Berubah: Cakaran feral 4x lalu melesat & pusaran pita silang
        m.attackType = "moopyWolfU";
        setAnimState(m, "moopyWolfU", 54);
        m.vx = 0;
        G.Sound.play("claw");
        G.FX.spawnFeralSpeedLines(m.x, m.y - 16 * s, m.facing, 6);
      }
      return;
    },

    wolfLaserI: function () {
      var m = G.moopy;
      var d = G.dummy;
      var s = G.Config.charScale;
      if (m.state === "laser" || m.state === "diveKick" || m.state === "blitz" || m.state === "simonBaseU" || m.state === "thunderStorm" || m.state === "moopyClawFlurry" || m.state === "moopyBlitzStun" || m.state === "moopyWolfU" || m.state === "moopyWolfI") return;
      if (m.attackType === "xeeraGiantSlash") return;
      if (m.cd.laser > 0) {
        G.Sound.play("cooldown");
        return;
      }

      if (m.charId === "xeera") {
        m.cd.laser = 300;
        m.attackType = "punch2";
        setAnimState(m, "attack", m.isWolf ? 20 : 16);
        m.vx = 0;
        G.Sound.play("transform");
        if (G.Camera) G.Camera.shake = m.isWolf ? 9 : 5;
        // Base Form: barrier standar. Sesudah Evolusi: Barrier RAKSASA
        // berdurasi lama (10 detik) dengan batu-batu melayang.
        G.FX.spawnSlashBarrier(m.x, G.Config.GROUND_Y, m.isWolf);
        return;
      }

      m.cd.laser = m.maxCd.laser;

      if (m.charId === "simon") {
        if (m.isWolf) {
          // SESUDAH EVOLUSI (Thunder Devil): Cataclysmic Devil Thunderstorm
          // Rentetan 5 sambaran petir raksasa merah-emas-biru + STUN dahsyat.
          m.attackType = "simonDevilI";
          setAnimState(m, "thunderStorm", 52);
          m.stormTimer = 52;
          m.stormTimerMax = 52;
          m.vx = 0;
          G.Sound.play("thunder");
          if (G.Camera) G.Camera.shake = 12;
          G.FX.spawnStarImpact(m.x, m.y - 24 * s, 1.35);
          G.FX.spawnHitParticles(m.x, m.y - 18 * s, "#ef4444", 14);
        } else {
          // SEBELUM EVOLUSI (Base Mage): 1 sambaran petir langit yang memberi STUN.
          m.attackType = "thunderStorm";
          setAnimState(m, "thunderStorm", 32);
          m.stormTimer = 32;
          m.stormTimerMax = 32;
          m.vx = 0;
          G.Sound.play("thunder");
          if (G.Camera) G.Camera.shake = 8;
        }
        return;
      }

      // MOOPY SKILL I: Sebelum Berubah -> Blitz Stun. Sesudah Berubah -> Roar + Teleport + Shredder.
      if (!m.isWolf) {
        var startX = m.x;
        m.attackType = "moopyBlitzStun";
        setAnimState(m, "moopyBlitzStun", 22);
        if (d) {
          m.facing = d.x >= m.x ? 1 : -1;
          m.x = Math.max(26, Math.min(G.Config.BASE_W - 26, d.x - m.facing * 18));
        } else {
          m.x = Math.max(26, Math.min(G.Config.BASE_W - 26, m.x + m.facing * 85));
        }
        m.vx = m.facing * 2.5;
        G.Sound.play("dash");
        G.FX.spawnDiveStreak((startX + m.x) * 0.5, m.y - 18 * s, m.facing * 14, 0, true);
        G.FX.spawnStarImpact(m.x + m.facing * (16 * s), m.y - 18 * s, 1.0);
      } else {
        m.attackType = "moopyWolfI";
        setAnimState(m, "moopyWolfI", 76);
        m.vx = 0;
        G.Sound.play("roar");
        if (G.Camera) G.Camera.shake = 7;
        G.FX.spawnFeralSpeedLines(m.x, m.y - 18 * s, m.facing, 12);
      }
    }
  };

  function limb(ctx, x1, y1, x2, y2, width, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function jointedLimb(ctx, x1, y1, mx, my, x2, y2, width, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(mx, my);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function circle(ctx, x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function poly(ctx, pts, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
      else ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }

  function getAttackProgress(m) {
    if (m.state !== "attack" || m.maxStateTimer <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - (m.stateTimer / m.maxStateTimer)));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function swingPulse(t) {
    return Math.sin(Math.min(1, t * 1.15) * Math.PI);
  }

  // Cakar tajam untuk model Feral Werewolf Moopy
  function drawFeralClawHand(ctx, hx, hy, angle, clawColor) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    circle(ctx, 0, 0, 3.2, "#090514");
    circle(ctx, 0, 0, 2.1, "#f8fafc");

    for (var c = -1; c <= 1; c++) {
      ctx.strokeStyle = "#090514";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(1, c * 2.2);
      ctx.quadraticCurveTo(5.5, c * 3.2 - 1.5, 8.5, c * 3.6 + 1.2);
      ctx.stroke();

      ctx.strokeStyle = clawColor || "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(1, c * 2.2);
      ctx.quadraticCurveTo(5.5, c * 3.2 - 1.5, 8.5, c * 3.6 + 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ekor serigala lebat dengan corak merah-ungu
  function drawFeralWolfTail(ctx, hipX, hipY, tailSwing) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(tailSwing);

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#090514";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -8, -24, -6, -30, 5);
    ctx.bezierCurveTo(-24, 11, -11, 10, 0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(-15, -4, -23, 3);
    ctx.quadraticCurveTo(-15, 6, -4, 1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#a855f7";
    ctx.beginPath();
    ctx.moveTo(-10, 1);
    ctx.quadraticCurveTo(-18, -1, -26, 4);
    ctx.quadraticCurveTo(-18, 7, -10, 3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#090514";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(-14, 1);
    ctx.moveTo(-14, -2);
    ctx.lineTo(-20, 2);
    ctx.moveTo(-11, 4);
    ctx.lineTo(-18, 6);
    ctx.stroke();

    ctx.restore();
  }

  G.Renderer = {
    drawXeera: function (ctx, x, y, facing, scale, isGhost, assets) {
      var m = G.moopy;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(facing * scale, scale);

      if (m.isWolf && assets.moopyWolf && !isGhost) {
        ctx.drawImage(assets.moopyWolf, -16, -34, 32, 34);
        ctx.restore();
        return;
      }
      if (!m.isWolf && assets.moopyStickman && !isGhost) {
        ctx.drawImage(assets.moopyStickman, -16, -34, 32, 34);
        ctx.restore();
        return;
      }

      var bodyCol = isGhost ? "rgba(192, 132, 252, 0.35)" : (m.isWolf ? "#f8fafc" : "#181824");
      var legShade = isGhost ? "rgba(168, 85, 247, 0.25)" : (m.isWolf ? "#cbd5e1" : "#0e0e16");
      var p = getAttackProgress(m);
      var ep = easeOutCubic(p);
      var sp = swingPulse(p);

      var breathe = m.onGround ? Math.sin(m.animTick * 0.1) * 0.9 : 0;
      var runBob = m.state === "walk" ? Math.abs(Math.sin(m.animTick * 0.32)) * -2.2 : 0;
      var bob = breathe + runBob;

      var bodyLean = 0;
      if (m.state === "walk") bodyLean = 0.16;
      else if (m.state === "dash") bodyLean = 0.32;
      else if (m.state === "attack") {
        if (m.attackType === "xeeraGiantSlash") {
          // Saat mengangkat pedang raksasa condong ke belakang, lalu saat menebas condong tajam ke depan!
          bodyLean = p < 0.3 ? (-p * 0.6) : Math.min(0.32, (p - 0.3) * 1.2);
        } else if (m.attackType === "punch1") {
          bodyLean = sp * 0.26;
        } else if (m.attackType === "punch2") {
          bodyLean = -sp * 0.14;
        } else {
          bodyLean = sp * 0.34;
        }
      }

      if (!isGhost) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, -1, 10, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (m.state === "diveKick") {
        ctx.translate(0, -14);
        ctx.rotate(0.55);
        ctx.translate(0, 14);
      }

      if (m.state === "walk") {
        var cycle = m.animTick * 0.32;
        var s1 = Math.sin(cycle), c1 = Math.cos(cycle);
        var s2 = Math.sin(cycle + Math.PI), c2 = Math.cos(cycle + Math.PI);

        var k1x = -1 + s2 * 4.5 + Math.max(0, -c2) * 2.5;
        var k1y = -6.5 - Math.max(0, c2) * 3;
        var f1x = -1 + s2 * 6.5;
        var f1y = -1.5 - Math.max(0, c2) * 2.5;
        jointedLimb(ctx, -1, -11 + bob, k1x, k1y, f1x, f1y, 3.2, legShade);

        var k2x = 1 + s1 * 4.5 + Math.max(0, -c1) * 2.5;
        var k2y = -6.5 - Math.max(0, c1) * 3;
        var f2x = 1 + s1 * 6.5;
        var f2y = -1.5 - Math.max(0, c1) * 2.5;
        jointedLimb(ctx, 1, -11 + bob, k2x, k2y, f2x, f2y, 3.2, bodyCol);
      } else if (!m.onGround) {
        jointedLimb(ctx, -1.5, -11, -5, -7, -3.5, -3, 3.2, legShade);
        jointedLimb(ctx, 1.5, -11, 5.5, -8, 3, -3.5, 3.2, bodyCol);
      } else {
        var lungeShift = m.state === "attack" ? (m.attackType === "xeeraGiantSlash" && p >= 0.3 ? 4.5 : sp * 3.5) : 0;
        jointedLimb(ctx, -1.5, -11 + bob, -4 - lungeShift * 0.3, -6, -5.5 - lungeShift * 0.5, -1.5, 3.3, legShade);
        jointedLimb(ctx, 1.5, -11 + bob, 4.5 + lungeShift * 0.6, -6, 4 + lungeShift * 0.5, -1.5, 3.3, bodyCol);
      }

      ctx.save();
      ctx.translate(0, -11 + bob);
      ctx.rotate(bodyLean);
      ctx.translate(0, 11 - bob);

      if (m.isWolf && !isGhost) {
        var capeWave = Math.sin(m.animTick * 0.22) * 3.2;
        var capeSwing = m.state === "attack" ? (m.attackType === "xeeraGiantSlash" ? 6 : sp * 5) : 0;
        poly(ctx, [
          [-2, -23 + bob],
          [-26 - capeSwing, -34 + bob + capeWave * 0.6],
          [-21 - capeSwing, -25 + bob],
          [-28 - capeSwing, -21 + bob + capeWave],
          [-18 - capeSwing, -16 + bob],
          [-23 - capeSwing, -11 + bob - capeWave * 0.5],
          [-3, -13 + bob]
        ], "rgba(147, 51, 234, 0.85)");

        poly(ctx, [
          [-2, -22 + bob],
          [-18 - capeSwing * 0.6, -28 + bob + capeWave * 0.4],
          [-20 - capeSwing * 0.6, -18 + bob + capeWave * 0.7],
          [-4, -15 + bob]
        ], "#c084fc");
      }

      var sayaTilt = m.state === "attack" ? -sp * 2 : 0;
      limb(ctx, -1, -12 + bob, -13, -6 + bob + sayaTilt, 2.2, "#3b0764");

      var leftElbowX = -4 - (m.state === "attack" ? sp * 2 : 0);
      var leftElbowY = -16 + bob;
      var leftHandX = -2 - (m.state === "attack" ? sp * 3 : 0);
      var leftHandY = -12.5 + bob;
      jointedLimb(ctx, -2, -20 + bob, leftElbowX, leftElbowY, leftHandX, leftHandY, 2.5, legShade);

      poly(ctx, [
        [-3.5, -21 + bob],
        [3.5, -21 + bob],
        [3, -11 + bob],
        [-3, -11 + bob]
      ], bodyCol);
      limb(ctx, -3, -12 + bob, 3, -12 + bob, 2, "#a855f7");

      circle(ctx, 0.5, -25.5 + bob, 4.4, bodyCol);
      if (m.isWolf) {
        ctx.strokeStyle = "#09090f";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (m.isWolf) {
        circle(ctx, 2.5, -25.2 + bob, 1.5, "#e11d48");
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-4.5, -25.2 + bob);
        ctx.lineTo(9.5, -25.2 + bob);
        ctx.moveTo(2.5, -32 + bob);
        ctx.lineTo(2.5, -18 + bob);
        ctx.stroke();
      } else {
        circle(ctx, 2.5, -25.2 + bob, 1.2, "#c084fc");
      }

      var shoulderX = 1.5;
      var shoulderY = -19.5 + bob;
      var elbowX = 4;
      var elbowY = -16 + bob;
      var handX = 6.5;
      var handY = -15 + bob + Math.sin(m.animTick * 0.1) * 0.6;
      var swordAngle = -0.42 + Math.sin(m.animTick * 0.1) * 0.05;
      var bladeScale = 1.0;

      if (m.state === "walk") {
        var walkSwing = Math.sin(m.animTick * 0.32) * 2.2;
        elbowX = 3 + walkSwing * 0.5;
        handX = 6 + walkSwing;
        handY = -14.5 + bob;
        swordAngle = -0.25 + walkSwing * 0.06;
      } else if (m.state === "attack") {
        if (m.attackType === "xeeraGiantSlash") {
          // SKILL U EVOLUSI: Angkat Pedang Raksasa Lama -> Tebas Membelah Tanah -> Tahan Pose Tebasan!
          bladeScale = 1.75; // Bilah pedang membesar dengan aura ungu!
          if (p < 0.3) {
            var chargeP = easeOutCubic(p / 0.3);
            elbowX = 2 - chargeP * 2;
            elbowY = -22 + bob - chargeP * 5;
            handX = 3 - chargeP * 2;
            handY = -26 + bob - chargeP * 7;
            swordAngle = -0.6 - chargeP * 1.35;
          } else if (p < 0.5) {
            var cleaveP = easeOutCubic((p - 0.3) / 0.2);
            elbowX = 0 + cleaveP * 7;
            elbowY = -27 + bob + cleaveP * 12;
            handX = 1 + cleaveP * 9;
            handY = -33 + bob + cleaveP * 20;
            swordAngle = -1.95 + cleaveP * 2.65;
          } else {
            // Tahan pose akhir menebas ke tanah seperti di Gambar 3630487a.jpeg!
            elbowX = 7;
            elbowY = -15 + bob;
            handX = 10;
            handY = -13 + bob;
            swordAngle = 0.7;
          }
        } else if (m.attackType === "punch1") {
          swordAngle = -1.65 + ep * 2.5;
          var reach1 = Math.sin(ep * Math.PI);
          elbowX = 4 + reach1 * 3;
          elbowY = -19 + bob + ep * 4;
          handX = 6 + reach1 * 5.5;
          handY = -21 + bob + ep * 8;
        } else if (m.attackType === "punch2") {
          swordAngle = 1.15 - ep * 2.6;
          var reach2 = Math.sin(ep * Math.PI);
          elbowX = 4 + reach2 * 3;
          elbowY = -15 + bob - ep * 5;
          handX = 6 + reach2 * 5.5;
          handY = -13 + bob - ep * 9;
        } else if (m.attackType === "clawFinisher") {
          if (p < 0.22) {
            var prep = p / 0.22;
            elbowX = 2 - prep * 4;
            handX = 4 - prep * 5;
            handY = -14 + bob + prep * 2;
            swordAngle = -0.4 - prep * 1.4;
          } else {
            var slashP = easeOutCubic((p - 0.22) / 0.78);
            elbowX = -2 + slashP * 8;
            elbowY = -16 + bob;
            handX = -1 + slashP * 12;
            handY = -16 + bob;
            swordAngle = -1.8 + slashP * 2.45;
          }
        }
      } else if (m.state === "diveKick") {
        elbowX = 6;
        elbowY = -16;
        handX = 10;
        handY = -14;
        swordAngle = 0.22;
      }

      jointedLimb(ctx, shoulderX, shoulderY, elbowX, elbowY, handX, handY, 2.8, bodyCol);

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(swordAngle);
      ctx.scale(bladeScale, bladeScale);

      limb(ctx, -5, 0, 0, 0, 2.4, "#9f1239");
      limb(ctx, 0, -3.2, 0, 3.2, 1.8, "#f43f5e");

      limb(ctx, 1, 0, 24, -1, 3.2, "#a855f7");
      limb(ctx, 1, -0.4, 23, -1.1, 1.7, "#09090f");
      limb(ctx, 1, 0.9, 24, -0.5, 0.9, "#ffffff");

      ctx.restore();
      ctx.restore();
      ctx.restore();
    },

    drawSimon: function (ctx, x, y, facing, scale, isGhost, assets) {
      var m = G.moopy;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(facing * scale, scale);

      if (m.isWolf && assets.moopyWolf && !isGhost) {
        ctx.drawImage(assets.moopyWolf, -16, -34, 32, 34);
        ctx.restore();
        return;
      }
      if (!m.isWolf && assets.moopyStickman && !isGhost) {
        ctx.drawImage(assets.moopyStickman, -16, -34, 32, 34);
        ctx.restore();
        return;
      }

      var coreBlack = isGhost ? "rgba(0, 229, 255, 0.35)" : "#0b0b12";
      var shadeDark = isGhost ? "rgba(0, 229, 255, 0.25)" : "#1c1930";
      var cloakCol = isGhost ? "rgba(255, 190, 11, 0.3)" : "#281e4a";
      var sparkCyan = "#00e5ff";
      var sparkGold = "#ffbe0b";
      var p = getAttackProgress(m);
      var sp = swingPulse(p);

      var breathe = m.onGround ? Math.sin(m.animTick * 0.11) * 0.8 : 0;
      var runBob = m.state === "walk" ? Math.abs(Math.sin(m.animTick * 0.34)) * -2.0 : 0;
      var bob = breathe + runBob;

      var bodyLean = m.state === "walk" ? 0.15 : (m.state === "dash" ? 0.3 : (m.state === "attack" ? sp * 0.22 : 0));

      if (!isGhost) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, -1, 9, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (m.state === "diveKick") {
        ctx.translate(0, -15);
        ctx.rotate(0.6);
        ctx.translate(0, 15);
      } else if (!m.onGround && m.jumpsUsed === 2 && m.state === "jump") {
        ctx.translate(0, -15);
        ctx.rotate(m.animTick * 0.45);
        ctx.translate(0, 15);
      }

      if (m.attackType === "kick1" || m.attackType === "kick2" || m.attackType === "kick3" || m.state === "diveKick") {
        var kReach = m.state === "diveKick" ? 1 : sp;
        jointedLimb(ctx, -2, -11, -4, -6, -4, -1.5, 3.2, shadeDark);
        var targetFootY = m.attackType === "kick2" ? -11 - kReach * 8 : -10;
        jointedLimb(ctx, 1, -11, 4 + kReach * 4, -12, 4 + kReach * 10, targetFootY, 3.2, coreBlack);
        circle(ctx, 4 + kReach * 10, targetFootY, 2.2, m.attackType === "kick2" ? sparkGold : sparkCyan);
      } else if (m.state === "walk") {
        var cyc = m.animTick * 0.34;
        var s1 = Math.sin(cyc), c1 = Math.cos(cyc);
        var s2 = Math.sin(cyc + Math.PI), c2 = Math.cos(cyc + Math.PI);
        jointedLimb(ctx, -1, -11 + bob, -1 + s2 * 4 + Math.max(0, -c2) * 2, -6 - Math.max(0, c2) * 2.5, -1 + s2 * 6, -1.5 - Math.max(0, c2) * 2, 3.1, shadeDark);
        jointedLimb(ctx, 1, -11 + bob, 1 + s1 * 4 + Math.max(0, -c1) * 2, -6 - Math.max(0, c1) * 2.5, 1 + s1 * 6, -1.5 - Math.max(0, c1) * 2, 3.1, coreBlack);
      } else if (!m.onGround) {
        jointedLimb(ctx, -2, -11, -5, -6.5, -3, -3, 3.1, shadeDark);
        jointedLimb(ctx, 1, -11, 4.5, -7.5, 2.5, -3.5, 3.1, coreBlack);
      } else {
        jointedLimb(ctx, -2, -11 + bob, -4.5, -6, -4, -1.5, 3.2, shadeDark);
        jointedLimb(ctx, 1, -11 + bob, 3.8, -6, 3.2, -1.5, 3.2, coreBlack);
      }

      ctx.save();
      ctx.translate(0, -11 + bob);
      ctx.rotate(bodyLean);
      ctx.translate(0, 11 - bob);

      if (m.isWolf && !isGhost) {
        ctx.strokeStyle = m.animTick % 6 < 3 ? sparkGold : sparkCyan;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(-2, -19 + bob, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      var wave = Math.sin(m.animTick * 0.26) * 2.5;
      poly(ctx, [
        [-2, -22 + bob],
        [-11, -19 + bob + wave * 0.4],
        [-15, -14 + bob + wave],
        [-6, -15 + bob]
      ], cloakCol);

      var backArmSwing = m.state === "walk" ? -Math.sin(m.animTick * 0.34) * 3 : -sp * 2;
      jointedLimb(ctx, -2, -19.5 + bob, -4 + backArmSwing * 0.5, -16 + bob, -2 + backArmSwing, -14 + bob, 2.6, shadeDark);

      poly(ctx, [
        [-4, -21 + bob],
        [4, -21 + bob],
        [3, -11 + bob],
        [-3, -11 + bob]
      ], coreBlack);
      limb(ctx, -2.5, -12 + bob, 2.5, -12 + bob, 2, m.isWolf ? sparkGold : sparkCyan);

      circle(ctx, 0.5, -25.5 + bob, 4.4, coreBlack);
      poly(ctx, [
        [-3.5, -27 + bob],
        [-5.5, -29 + bob],
        [-0.5, -29.5 + bob],
        [3.5, -30.5 + bob],
        [4.5, -27 + bob]
      ], coreBlack);

      ctx.fillStyle = m.isWolf ? sparkGold : "#ffffff";
      ctx.beginPath();
      ctx.ellipse(2.5, -25.5 + bob, 1.5, 0.9, -0.15, 0, Math.PI * 2);
      ctx.fill();

      if (m.isWolf) {
        ctx.strokeStyle = sparkGold;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-1.5, -29 + bob);
        ctx.quadraticCurveTo(-5.5, -33 + bob, -3.5, -36.5 + bob);
        ctx.stroke();

        ctx.strokeStyle = sparkCyan;
        ctx.beginPath();
        ctx.moveTo(2.5, -29 + bob);
        ctx.quadraticCurveTo(6.5, -33 + bob, 5, -36.5 + bob);
        ctx.stroke();
      }

      if (m.attackType === "punch1" || m.attackType === "clawFinisher" || m.state === "thunderStorm") {
        var ext = m.state === "thunderStorm" ? 1 : sp;
        var hx = 5 + ext * 8.5;
        var hy = -18.5 + bob;
        jointedLimb(ctx, 1.5, -19.5 + bob, 3.5 + ext * 3, -18 + bob, hx, hy, 3, coreBlack);
        circle(ctx, hx + 1, hy, 2.8, m.attackType === "clawFinisher" ? sparkGold : sparkCyan);
        circle(ctx, hx + 1, hy, 1.4, "#ffffff");
      } else if (m.attackType === "punch2") {
        var uExt = sp;
        var ux = 5 + uExt * 4;
        var uy = -18 + bob - uExt * 9.5;
        jointedLimb(ctx, 1.5, -19.5 + bob, 5 + uExt * 2, -17 + bob, ux, uy, 3, coreBlack);
        circle(ctx, ux, uy, 2.6, sparkGold);
      } else {
        var armWalk = m.state === "walk" ? Math.sin(m.animTick * 0.34) * 3 : 0;
        jointedLimb(ctx, 1.5, -19.5 + bob, 4 + armWalk * 0.4, -16.5 + bob, 6.5 + armWalk, -18.5 + bob, 2.8, coreBlack);
        circle(ctx, 6.8 + armWalk, -18.8 + bob, 1.8, m.animTick % 8 < 4 ? sparkCyan : sparkGold);
      }

      ctx.restore();
      ctx.restore();
    },

    drawMoopyStickman: function (ctx, x, y, facing, scale, isGhost, assets) {
      var m = G.moopy;
      if (m.charId === "xeera") {
        this.drawXeera(ctx, x, y, facing, scale, isGhost, assets);
        return;
      }
      if (m.charId === "simon") {
        this.drawSimon(ctx, x, y, facing, scale, isGhost, assets);
        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(facing * scale, scale);

      if (assets.moopyStickman && !isGhost) {
        ctx.drawImage(assets.moopyStickman, -16, -34, 32, 34);
        ctx.restore();
        return;
      }

      var skinLight = isGhost ? "rgba(56, 189, 248, 0.4)" : "#f8fafc";
      var skinShade = isGhost ? "rgba(56, 189, 248, 0.25)" : "#cbd5e1";
      var vestCol = isGhost ? "rgba(30, 41, 59, 0.4)" : "#1e293b";
      var scarfRed = isGhost ? "rgba(244, 63, 94, 0.4)" : "#f43f5e";
      var cyanGlow = "#38bdf8";
      var p = getAttackProgress(m);
      var sp = swingPulse(p);

      var breathe = m.onGround ? Math.sin(m.animTick * 0.11) * 0.8 : 0;
      var runBob = m.state === "walk" ? Math.abs(Math.sin(m.animTick * 0.34)) * -2.0 : 0;
      var bob = breathe + runBob;

      var bodyLean = m.state === "walk" ? 0.16 : (m.state === "dash" ? 0.3 : (m.state === "attack" ? sp * 0.22 : 0));

      if (!isGhost) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, -1, 9, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!m.onGround && m.jumpsUsed === 2 && m.state === "jump") {
        ctx.translate(0, -15);
        ctx.rotate(m.animTick * 0.45);
        ctx.translate(0, 15);
      }

      if (m.attackType === "kick1" || m.attackType === "kick2" || m.attackType === "crossCrescent") {
        jointedLimb(ctx, -2, -11, -4, -6, -4, -1.5, 3.2, skinShade);
        var ky = (m.attackType === "kick1") ? -11 : -11 - sp * 8;
        var kx = 4 + sp * 10;
        jointedLimb(ctx, 1, -11, 4 + sp * 4, -12, kx, ky, 3.2, skinLight);
        circle(ctx, kx, ky, 2.2, "#34d399");
      } else if (m.attackType === "kick3") {
        limb(ctx, -9 * sp, -12, 12 * sp, -12, 3.2, "#fbbf24");
        jointedLimb(ctx, -1, -11, 0, -6, 0, -2, 3, skinLight);
      } else if (m.attackType === "crossKnee") {
        jointedLimb(ctx, -2, -11, -3, -6, -3, -1.5, 3.2, skinShade);
        jointedLimb(ctx, 1, -11, 3 + sp * 4.5, -12 - sp * 5, 2 + sp * 2, -7 - sp * 4, 3.4, "#34d399");
      } else if (m.state === "walk") {
        var cyc = m.animTick * 0.34;
        var s1 = Math.sin(cyc), c1 = Math.cos(cyc);
        var s2 = Math.sin(cyc + Math.PI), c2 = Math.cos(cyc + Math.PI);
        jointedLimb(ctx, -1, -11 + bob, -1 + s2 * 4 + Math.max(0, -c2) * 2, -6 - Math.max(0, c2) * 2.5, -1 + s2 * 6, -1.5 - Math.max(0, c2) * 2, 3.1, skinShade);
        jointedLimb(ctx, 1, -11 + bob, 1 + s1 * 4 + Math.max(0, -c1) * 2, -6 - Math.max(0, c1) * 2.5, 1 + s1 * 6, -1.5 - Math.max(0, c1) * 2, 3.1, skinLight);
      } else if (!m.onGround) {
        jointedLimb(ctx, -2, -11, -5, -6.5, -3, -3, 3.1, skinShade);
        jointedLimb(ctx, 1, -11, 4.5, -7.5, 2.5, -3.5, 3.1, skinLight);
      } else {
        jointedLimb(ctx, -2, -11 + bob, -4.5, -6, -4, -1.5, 3.2, skinShade);
        jointedLimb(ctx, 1, -11 + bob, 3.8, -6, 3.2, -1.5, 3.2, skinLight);
      }

      ctx.save();
      ctx.translate(0, -11 + bob);
      ctx.rotate(bodyLean);
      ctx.translate(0, 11 - bob);

      var wave = Math.sin(m.animTick * 0.28) * 2.5;
      ctx.strokeStyle = scarfRed;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-3, -27 + bob);
      ctx.quadraticCurveTo(-9, -26 + bob, -14, -23 + bob + wave);
      ctx.stroke();

      var backSwing = m.state === "walk" ? -Math.sin(m.animTick * 0.34) * 3 : -sp * 2;
      jointedLimb(ctx, -2, -19.5 + bob, -4 + backSwing * 0.5, -16 + bob, -2 + backSwing, -14 + bob, 2.6, skinShade);

      poly(ctx, [
        [-4, -21 + bob],
        [4, -21 + bob],
        [3, -11 + bob],
        [-3, -11 + bob]
      ], vestCol);
      limb(ctx, -2.5, -12 + bob, 2.5, -12 + bob, 2, cyanGlow);

      circle(ctx, 0.5, -25.5 + bob, 4.4, skinLight);
      limb(ctx, -3, -27 + bob, 4, -27 + bob, 2.2, scarfRed);
      circle(ctx, 2.5, -25.2 + bob, 1.1, cyanGlow);

      if (m.attackType === "punch1") {
        var px = 5 + sp * 8;
        jointedLimb(ctx, 1.5, -19.5 + bob, 3.5 + sp * 3, -18.5 + bob, px, -19 + bob, 3, skinLight);
        circle(ctx, px + 0.5, -19 + bob, 2.4, "#fde047");
      } else if (m.attackType === "punch2") {
        var ux = 5 + sp * 4;
        var uy = -18 + bob - sp * 9.5;
        jointedLimb(ctx, 1.5, -19.5 + bob, 4.5 + sp * 2, -17 + bob, ux, uy, 3, skinLight);
        circle(ctx, ux, uy, 2.5, "#fb923c");
      } else if (m.attackType === "clawFinisher") {
        var cx = 5 + sp * 8.5;
        jointedLimb(ctx, 1.5, -19.5 + bob, 4 + sp * 3, -19 + bob, cx, -19 + bob, 3.2, cyanGlow);
        limb(ctx, cx, -22 + bob, cx + 4.5, -21 + bob, 1.6, scarfRed);
        limb(ctx, cx + 1, -19 + bob, cx + 5.5, -19 + bob, 1.6, scarfRed);
        limb(ctx, cx, -16 + bob, cx + 4.5, -17 + bob, 1.6, scarfRed);
      } else {
        var armW = m.state === "walk" ? Math.sin(m.animTick * 0.34) * 3 : 0;
        jointedLimb(ctx, 1.5, -19.5 + bob, 4 + armW * 0.4, -16.5 + bob, 6.5 + armW, -18.5 + bob, 2.8, skinLight);
        circle(ctx, 6.8 + armW, -18.8 + bob, 2.0, scarfRed);
      }

      ctx.restore();
      ctx.restore();
    },

    drawMoopyWolf: function (ctx, x, y, facing, scale, isGhost, assets) {
      var m = G.moopy;
      if (m.charId === "xeera") {
        this.drawXeera(ctx, x, y, facing, scale, isGhost, assets);
        return;
      }
      if (m.charId === "simon") {
        this.drawSimon(ctx, x, y, facing, scale, isGhost, assets);
        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(facing * scale, scale);

      if (assets.moopyWolf && !isGhost) {
        ctx.drawImage(assets.moopyWolf, -22, -28, 44, 28);
        ctx.restore();
        return;
      }

      var t = m.animTick;
      var breathe = Math.sin(t * 0.14) * 1.4;
      if (isGhost) ctx.globalAlpha *= 0.45;

      // Postur default: membungkuk agresif seperti referensi werewolf
      var hipX = -4, hipY = -13 + breathe * 0.3;
      var shoulderX = 5, shoulderY = -24 + breathe;
      var headX = 10, headY = -28 + breathe;
      var tailAngle = Math.sin(t * 0.16) * 0.18;

      var fFootX = 11, fFootY = 0;
      var bFootX = -13, bFootY = 0;
      var fHandX = 18, fHandY = -22;
      var bHandX = -10, bHandY = -25;
      var fClawAngle = 0.2;
      var bClawAngle = -2.4;

      if (m.state === "walk") {
        var stride = Math.sin(t * 0.45);
        shoulderX = 7;
        shoulderY = -23 + Math.abs(stride) * 2;
        headX = 13;
        headY = -26;
        fFootX = 4 + stride * 13;
        fFootY = stride > 0 ? -Math.sin(stride * Math.PI) * 5 : 0;
        bFootX = -6 - stride * 13;
        bFootY = stride < 0 ? -Math.sin(-stride * Math.PI) * 5 : 0;
        fHandX = 16 + stride * 8;
        fHandY = -18 - stride * 4;
        bHandX = -6 - stride * 8;
        bHandY = -22 + stride * 4;
        tailAngle = -0.25 + stride * 0.22;
      } else if (!m.onGround) {
        shoulderX = 6;
        shoulderY = -26;
        headX = 11;
        headY = -30;
        fFootX = 10;
        fFootY = -6;
        bFootX = -10;
        bFootY = -4;
        fHandX = 19;
        fHandY = -28;
        bHandX = -9;
        bHandY = -28;
        tailAngle = 0.35;
      }

      if (m.state === "attack") {
        var atkP = getAttackProgress(m);
        var swing = Math.sin(atkP * Math.PI);
        if (m.attackType.indexOf("wolfClaw") === 0 || m.attackType === "clawFinisher") {
          shoulderX = 8 + swing * 4;
          shoulderY = -24;
          headX = 13 + swing * 3;
          fHandX = 14 + swing * 16;
          fHandY = -28 + swing * 10;
          bHandX = -10;
          bHandY = -22;
          fClawAngle = 0.45;
          tailAngle = -0.35 * swing;
        } else if (m.attackType.indexOf("kick") === 0 || m.attackType.indexOf("wolfKick") === 0) {
          shoulderX = -2;
          headX = 2;
          fFootX = 12 + swing * 16;
          fFootY = -12 - swing * 6;
          bFootX = -10;
          bFootY = 0;
          tailAngle = 0.3;
        } else {
          fHandX = 16 + swing * 8;
          fHandY = -25 + swing * 7;
        }
      } else if (m.state === "transform") {
        var trP = 1 - (m.stateTimer / Math.max(1, m.maxStateTimer));
        shoulderX = 0;
        shoulderY = -25;
        headX = 2;
        headY = -30;
        fHandX = 15;
        fHandY = -33;
        bHandX = -14;
        bHandY = -32;
        fClawAngle = -0.7;
        bClawAngle = -2.3;
        tailAngle = 0.4 + trP * 0.2;
      }

      // SKILL U WOLF: cakar berulang lalu melesat & memukul
      if (m.state === "moopyWolfU") {
        var uElapsed = 54 - m.stateTimer;
        if (uElapsed < 10) {
          hipX = -5;
          hipY = -11;
          shoulderX = 6;
          shoulderY = -20;
          headX = 11;
          headY = -23;
          fHandX = 19;
          fHandY = -21;
          bHandX = -9;
          bHandY = -24;
          fFootX = 11;
          bFootX = -14;
          tailAngle = -0.15;
        } else if (uElapsed < 38) {
          var slashCycle = Math.sin((uElapsed - 10) * 0.55);
          hipX = -2;
          hipY = -14;
          shoulderX = 7;
          shoulderY = -26;
          headX = 5;
          headY = -30;
          fHandX = 18 + slashCycle * 10;
          fHandY = -32 - Math.abs(slashCycle) * 6;
          bHandX = 10 - slashCycle * 10;
          bHandY = -26 + slashCycle * 6;
          fFootX = 11;
          fFootY = -3;
          bFootX = -11;
          bFootY = 0;
          fClawAngle = -0.55;
          tailAngle = 0.25;
        } else {
          hipX = -3;
          hipY = -9;
          shoulderX = 8;
          shoulderY = -16;
          headX = 12;
          headY = -18;
          fHandX = 20;
          fHandY = -14;
          bHandX = -6;
          bHandY = -20;
          fFootX = 14;
          fFootY = 0;
          bFootX = -15;
          bFootY = 0;
          tailAngle = -0.35;
        }
      }

      // SKILL I WOLF: roar -> teleport -> shredder -> X-cross
      if (m.state === "moopyWolfI") {
        var iElapsed = 76 - m.stateTimer;
        if (iElapsed < 22) {
          hipX = -2;
          hipY = -13;
          shoulderX = 2;
          shoulderY = -24;
          headX = 4;
          headY = -28;
          fHandX = 16;
          fHandY = -35;
          bHandX = -15;
          bHandY = -33;
          fFootX = 11;
          bFootX = -13;
          fClawAngle = -0.7;
          bClawAngle = -2.3;
          tailAngle = 0.3;
        } else if (iElapsed < 30) {
          ctx.globalAlpha *= 0.35;
        } else {
          var shredPh = Math.sin(iElapsed * 0.9);
          hipX = -3;
          hipY = -13;
          shoulderX = 8;
          shoulderY = -24;
          headX = 13;
          headY = -27;
          fHandX = 22 + shredPh * 8;
          fHandY = -26 + shredPh * 10;
          bHandX = 16 - shredPh * 8;
          bHandY = -20 - shredPh * 10;
          fClawAngle = shredPh * 0.6;
          bClawAngle = -shredPh * 0.6;
          tailAngle = Math.cos(iElapsed * 0.8) * 0.4;
        }
      }

      if (!isGhost) {
        ctx.fillStyle = "rgba(0,0,0,0.48)";
        ctx.beginPath();
        ctx.ellipse(0, -1, 17, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Ekor serigala di belakang pinggang
      drawFeralWolfTail(ctx, hipX - 2, hipY, tailAngle);

      // 2. Kaki feral dengan pergelangan melebar
      var bLeg = {
        midX: (hipX + bFootX) * 0.5 - 3,
        midY: (hipY + bFootY) * 0.5
      };
      var fLeg = {
        midX: (hipX + fFootX) * 0.5 + 3,
        midY: (hipY + fFootY) * 0.5
      };
      jointedLimb(ctx, hipX, hipY, bLeg.midX, bLeg.midY, bFootX, bFootY - 2, 3.0, "#111827");
      jointedLimb(ctx, hipX, hipY, fLeg.midX, fLeg.midY, fFootX, fFootY - 2, 3.2, "#111827");

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#090514";
      ctx.lineWidth = 2.0;
      var feet = [
        { kx: bLeg.midX, ky: bLeg.midY, fx: bFootX, fy: bFootY },
        { kx: fLeg.midX, ky: fLeg.midY, fx: fFootX, fy: fFootY }
      ];
      for (var ft = 0; ft < feet.length; ft++) {
        var leg = feet[ft];
        ctx.beginPath();
        ctx.moveTo(leg.kx, leg.ky);
        ctx.lineTo(leg.fx - 4, leg.fy);
        ctx.lineTo(leg.fx + 5, leg.fy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3. Lengan belakang + cakar
      jointedLimb(ctx, shoulderX, shoulderY, (shoulderX + bHandX) * 0.5 - 2, (shoulderY + bHandY) * 0.5, bHandX, bHandY, 2.8, "#111827");
      drawFeralClawHand(ctx, bHandX, bHandY, bClawAngle, "#f8fafc");

      // 4. Torso membungkuk feral
      jointedLimb(ctx, hipX, hipY, (hipX + shoulderX) * 0.5 - 1, (hipY + shoulderY) * 0.5, shoulderX, shoulderY, 3.6, "#111827");

      // 5. Kepala + telinga + mata merah
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#090514";
      ctx.lineWidth = 2.4;
      circle(ctx, headX, headY, 5.2, "#f8fafc");
      ctx.beginPath();
      ctx.arc(headX, headY, 5.2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#090514";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(headX - 4.2, headY - 3.2);
      ctx.lineTo(headX - 6.5, headY - 10);
      ctx.lineTo(headX - 1.2, headY - 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 1.2, headY - 4.5);
      ctx.lineTo(headX + 4.5, headY - 9.5);
      ctx.lineTo(headX + 5.2, headY - 2.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e11d48";
      ctx.fillRect(headX + 1.2, headY - 1.5, 3.2, 2.2);
      ctx.fillStyle = "#f0abfc";
      ctx.fillRect(headX + 2.0, headY - 1.2, 1.0, 1.0);

      ctx.strokeStyle = "#090514";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(headX + 3.4, headY + 2.2);
      ctx.lineTo(headX + 6.0, headY + 1.6);
      ctx.lineTo(headX + 4.0, headY + 3.6);
      ctx.closePath();
      ctx.fillStyle = "#f8fafc";
      ctx.fill();
      ctx.stroke();

      // 6. Lengan depan + cakar merah
      jointedLimb(ctx, shoulderX, shoulderY, (shoulderX + fHandX) * 0.5 + 2, (shoulderY + fHandY) * 0.5, fHandX, fHandY, 3.0, "#111827");
      drawFeralClawHand(ctx, fHandX, fHandY, fClawAngle, "#e11d48");

      ctx.restore();
    },

    drawDummy: function (ctx, scale, assets) {
      var d = G.dummy;
      var m = G.moopy;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(d.facing * scale, scale);

      if (assets.dummy) {
        ctx.drawImage(assets.dummy, -16, -34, 32, 34);
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, -1, 9, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        var woodCol = d.hitFlash > 0 ? "#ffffff" : "#78350f";
        var strawCol = d.hitFlash > 0 ? "#ffffff" : "#d97706";
        var hatCol = d.hitFlash > 0 ? "#ffffff" : "#fbbf24";
        var targetCol = d.hitFlash > 0 ? "#ffffff" : "#ef4444";

        var springTilt = d.hurtTimer > 0 ? Math.sin(d.hurtTimer * 0.9) * 0.22 : Math.sin(m.animTick * 0.06) * 0.02;

        limb(ctx, -5, -1.5, 5, -1.5, 3, woodCol);
        limb(ctx, 0, -2, 0, -9, 4, woodCol);
        limb(ctx, -2.5, -6, 2.5, -7, 2, "#64748b");

        ctx.save();
        ctx.translate(0, -9);
        ctx.rotate(springTilt);
        ctx.translate(0, 9);

        limb(ctx, -9, -20, 9, -20, 3.2, woodCol);

        ctx.fillStyle = strawCol;
        ctx.beginPath();
        ctx.roundRect(-5.5, -24, 11, 13, 3);
        ctx.fill();

        circle(ctx, 0.5, -17.5, 3.4, targetCol);
        circle(ctx, 0.5, -17.5, 1.4, "#ffffff");

        circle(ctx, 0, -28, 4, strawCol);
        poly(ctx, [
          [-10, -30],
          [0, -36],
          [10, -30]
        ], hatCol);

        ctx.restore();
        ctx.restore();
      }

      if (d.stunTimer > 0) {
        ctx.save();
        var starY = d.y - 40 * scale;
        for (var s = 0; s < 3; s++) {
          var angle = (m.animTick * 0.15) + (s * (Math.PI * 2 / 3));
          var sx = d.x + Math.cos(angle) * 11;
          var sy = starY + Math.sin(angle) * 3;
          circle(ctx, sx, sy, 2, "#facc15");
        }
        ctx.restore();
      }
    }
  };
})(window.MoopyGame);
