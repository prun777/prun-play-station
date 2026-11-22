/* =========================================================
   HOSHINO MART — local rain, drips, glass rivulets, puddles,
   auto door, traffic light, sign flicker, steam
   ========================================================= */
(function () {
  'use strict';
  const K = window.KONBINI, T = K.T;
  const P = window.PRUN;
  let F = null;

  const RAIN_N = 760;
  const rainDrops = [];
  let rainLines, rainMat;
  const ripples = [];
  const drips = [];
  let dripPoints, dripMat;
  let doorSpill;

  const storeRect = { x0: -5.5, x1: 5.1, z0: -7.5, z1: -0.8 };
  const blockRect = { x0: -11.9, x1: -8.1, z0: -9.8, z1: 4.5 };
  function insideBlockBuildings(x, z) {
    return (x > storeRect.x0 && x < storeRect.x1 && z > storeRect.z0 && z < storeRect.z1) ||
      (x > blockRect.x0 && x < blockRect.x1 && z > blockRect.z0 && z < blockRect.z1);
  }
  function rand(a, b) { return a + (b - a) * Math.random(); }

  K.buildEffects = function () {
    F = K.scene;
    const fx = K.group(F, 0, 0, 0, 'konbiniFx');
    K.fx = { group: fx };

    /* ---- rain ---- */
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(RAIN_N * 6);
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    rainMat = new T.LineBasicMaterial({ color: 0xbcd8f2, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false });
    rainLines = new T.LineSegments(geo, rainMat);
    rainLines.frustumCulled = false;
    fx.add(rainLines);
    for (let i = 0; i < RAIN_N; i++) {
      const d = { x: 0, y: 0, z: 0, vy: 0, len: 0 };
      resetDrop(d, true);
      rainDrops.push(d);
    }

    /* ---- splashes / ripples ---- */
    for (let i = 0; i < 16; i++) {
      const mat = new T.MeshBasicMaterial({ color: 0xb8dff2, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, toneMapped: false });
      const ring = new T.Mesh(new T.RingGeometry(0.07, 0.085, 16), mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.055, 0);
      ring.renderOrder = 3;
      fx.add(ring);
      ripples.push({ mesh: ring, mat, age: rand(0, 1), life: rand(0.8, 1.4), x: 0, z: 0 });
      resetRipple(ripples[i], true);
    }

    /* ---- awning drips ---- */
    const dgeo = new T.BufferGeometry();
    dgeo.setAttribute('position', new T.BufferAttribute(new Float32Array(9 * 3), 3));
    dripMat = new T.PointsMaterial({
      map: K.glowTexture(), color: 0xd8ecff, size: 0.075, transparent: true, opacity: 0.7,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    });
    dripPoints = new T.Points(dgeo, dripMat);
    dripPoints.frustumCulled = false;
    fx.add(dripPoints);
    for (let i = 0; i < 9; i++) drips.push({ x: -4 + i * 1.0, y: rand(2.1, 3.0), z: 0.0, vy: rand(1.8, 3.2) });

    /* ---- door light spill ---- */
    doorSpill = K.lightPool(fx, 0, 0.55, 2.0, 0xffc98a, 0.04, 0.06);
    K.fx.doorSpill = doorSpill;

    /* ---- steam sprites (oden + coffee) ---- */
    const steamTex = K.glowTexture([[0, 'rgba(255,255,255,.7)'], [0.5, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]);
    K.fx.steam = [];
    if (K.store) {
      for (let s = 0; s < 2; s++) {
        const base = K.store.steam[s];
        for (let i = 0; i < 3; i++) {
          const mat = new T.SpriteMaterial({
            map: steamTex, color: s === 0 ? 0xffe0b0 : 0xf2ead8, transparent: true,
            opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
          });
          const sp = new T.Sprite(mat);
          sp.position.copy(base);
          sp.scale.set(0.32, 0.32, 1);
          K.store.interior.add(sp);
          K.fx.steam.push({ sp, mat, base: base.clone(), phase: rand(0, 2), speed: rand(0.25, 0.45), drift: rand(-0.08, 0.08) });
        }
      }
    }

    /* ---- sign flicker state ---- */
    K.fx.flicker = { timer: rand(7, 12), active: 0, value: 1 };
    K.fx.traffic = { t: 0, phase: 0 };
    K.fx.doorTimer = rand(5, 9);
    K.fx.time = 0;

    console.log('[KONBINI] effects ready');
  };

  function resetDrop(d, initial) {
    let x, z, tries = 0;
    do {
      x = rand(-12, 12);
      z = rand(-12, 12);
      tries++;
    } while (insideBlockBuildings(x, z) && tries < 8);
    d.x = x; d.z = z;
    d.y = initial ? rand(0, 10) : rand(7, 10);
    d.vy = rand(5.5, 9.5);
    d.len = rand(0.35, 0.7);
  }

  function resetRipple(r, initial) {
    let x, z, tries = 0;
    do {
      x = rand(-11, 11);
      z = rand(-4, 11);
      tries++;
    } while (insideBlockBuildings(x, z) && tries < 8);
    r.x = x; r.z = z;
    r.mesh.position.set(x, 0.055, z);
    r.age = initial ? rand(0, r.life) : 0;
  }

  K.updateEffects = function (dt, t) {
    if (!K.fx) return;
    const st = P ? P.state : null;
    const hosted = !!P;
    const night = hosted && P.isNight ? (P.isNight() ? 1 : 0) : 1;
    const globalRain = st ? (st.rain || 0) : 0;
    // the district keeps a drizzle even when the main map is clear
    const rain = Math.min(1, 0.5 + globalRain * 0.55 + ((st && st.weather === 'storm') ? 0.1 : 0));
    K.fx.time += dt;

    /* rain */
    rainMat.opacity = 0.22 + rain * 0.22;
    rainLines.visible = rain > 0.05;
    if (rainLines.visible) {
      const geo = rainLines.geometry;
      const arr = geo.attributes.position.array;
      const count = Math.floor(RAIN_N * (0.45 + rain * 0.55));
      for (let i = 0; i < count; i++) {
        const d = rainDrops[i];
        d.y -= d.vy * dt;
        d.x -= (0.45 + (st ? (st.rain || 0) : 0.3)) * dt;
        if (d.y < 0.04 || d.x < -12.5) resetDrop(d, false);
        const slant = 0.16 + (st ? (st.rain || 0) * 0.08 : 0.03);
        arr[i * 6] = d.x;
        arr[i * 6 + 1] = d.y;
        arr[i * 6 + 2] = d.z;
        arr[i * 6 + 3] = d.x - slant * d.len;
        arr[i * 6 + 4] = d.y + d.len;
        arr[i * 6 + 5] = d.z;
      }
      geo.setDrawRange(0, count * 2);
      geo.attributes.position.needsUpdate = true;
    }

    /* ripples */
    for (const r of ripples) {
      if (rain < 0.1) { r.mat.opacity = 0; continue; }
      r.age += dt;
      if (r.age > r.life) { resetRipple(r, false); }
      const k = r.age / r.life;
      r.mat.opacity = Math.sin(k * Math.PI) * 0.32 * rain;
      r.mesh.scale.setScalar(0.5 + k * 2.8);
    }

    /* awning drips */
    if (rain > 0.1) {
      const arr = dripPoints.geometry.attributes.position.array;
      for (let i = 0; i < drips.length; i++) {
        const d = drips[i];
        d.y -= d.vy * dt;
        if (d.y < 0.06) {
          d.y = rand(2.15, 2.6);
          d.x = rand(-4, 4);
          d.z = rand(-0.1, 0.2);
        }
        arr[i * 3] = d.x; arr[i * 3 + 1] = d.y; arr[i * 3 + 2] = d.z;
      }
      dripPoints.geometry.attributes.position.needsUpdate = true;
      dripMat.opacity = 0.25 + rain * 0.4;
      dripPoints.visible = true;
    } else {
      dripPoints.visible = false;
    }

    /* rain sliding down the store glass */
    if (K.storeStreak && K.storeStreak.map) {
      K.storeStreak.map.offset.y -= dt * (0.045 + rain * 0.05);
      K.storeStreak.opacity = 0.07 + rain * 0.15;
    }

    /* auto door */
    if (K.store) {
      K.fx.doorTimer -= dt;
      if (K.fx.doorTimer <= 0) {
        K.store.doorTarget = K.store.doorTarget > 0.5 ? 0 : 1;
        K.fx.doorTimer = K.store.doorTarget > 0.5 ? 2.6 : rand(7, 13);
      }
      K.store.doorOpen += (K.store.doorTarget - K.store.doorOpen) * Math.min(1, dt * 2.2);
      const open = K.store.doorOpen;
      K.store.doorL.position.x = -0.55 - open * 0.82;
      K.store.doorR.position.x = 0.55 + open * 0.82;
      if (doorSpill) doorSpill.material.opacity = 0.025 + open * 0.09;
    }

    /* sign flicker — subtle, occasional */
    if (K.store && K.store.signGlowMat) {
      const fl = K.fx.flicker;
      fl.timer -= dt;
      if (fl.timer <= 0) { fl.active = rand(0.08, 0.2); fl.timer = rand(7, 16); }
      fl.active = Math.max(0, fl.active - dt);
      const target = fl.active > 0 ? 0.55 : 1;
      fl.value += (target - fl.value) * Math.min(1, dt * 22);
      K.store.signGlowMat.opacity = 0.28 * fl.value;
      if (K.store.signFace) {
        const v = 0.92 + 0.08 * fl.value;
        K.store.signFace.color.setRGB(v, v, v);
      }
    }

    /* traffic signal */
    if (K.world && K.world.signal) {
      const sig = K.world.signal;
      const tr = K.fx.traffic;
      tr.t += dt;
      const cycle = 10.0;
      if (tr.t > cycle) { tr.t -= cycle; }
      let phase = tr.t < 3.8 ? 0 : tr.t < 4.9 ? 1 : 2; // green, amber, red
      if (tr.phase !== phase) {
        tr.phase = phase;
        const dark = { r: 0x5a1a20, a: 0x5a4218, g: 0x1e4a32 };
        sig.green.color.setHex(phase === 0 ? 0x4dff9a : dark.g);
        sig.amber.color.setHex(phase === 1 ? 0xffb020 : dark.a);
        sig.red.color.setHex(phase === 2 ? 0xff3b30 : dark.r);
        sig.pedMat.color.setHex(phase === 2 ? 0x4dff9a : 0x7a241e);
        sig.halo.material.color.setHex(phase === 0 ? 0x4dff9a : phase === 1 ? 0xffb020 : 0xff3b30);
        sig.halo.position.y = phase === 0 ? 2.68 : phase === 1 ? 2.98 : 3.28;
      }
      sig.halo.material.opacity = 0.28 + Math.sin(t * 3) * 0.05;
    }

    /* steam */
    if (K.fx.steam) {
      for (const s of K.fx.steam) {
        const k = (s.phase + t * s.speed) % 1;
        s.sp.position.set(s.base.x + s.drift * k, s.base.y + k * 0.7, s.base.z);
        s.mat.opacity = Math.sin(k * Math.PI) * 0.18;
        const sc = 0.16 + k * 0.36;
        s.sp.scale.set(sc, sc, 1);
      }
    }

    /* wet neon shimmer */
    if (K.world && K.world.wet && K.world.wet.streakMat) {
      K.world.wet.streakMat.opacity = 0.3 + Math.sin(t * 0.9) * 0.06 + rain * 0.12;
    }

    /* local light levels: warm inside, cool outside */
    if (K.store && K.store.lights && K.store.lights.length) {
      const level = 0.75 + night * 0.4;
      K.store.lights[0].intensity = 170 * level;
      if (K.store.lights[1]) K.store.lights[1].intensity = 140 * level;
      if (K.store.lights[2]) K.store.lights[2].intensity = 80 * level;
    }
    if (K.world) {
      if (K.world.lampLight) K.world.lampLight.intensity = 58 + night * 30;
      if (K.world.lampLight2) K.world.lampLight2.intensity = 55 + night * 25;
      if (K.world.lampLight3) K.world.lampLight3.intensity = 52 + night * 22;
      if (K.world.vendingLight) K.world.vendingLight.intensity = 10 + night * 5;
    }
  };
})();
