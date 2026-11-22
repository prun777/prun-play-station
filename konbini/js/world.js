/* =========================================================
   HOSHINO MART — the square diorama base, corner street,
   background block, utility pole, vending machine, bicycle…
   ========================================================= */
(function () {
  'use strict';
  const K = window.KONBINI, T = K.T;

  const M = {
    baseRock: K.toon(0x272a33),
    baseSoil: K.toon(0x3a302b),
    baseConcrete: K.toon(0x3f4450),
    plinth: K.toon(0x111419),
    brass: K.toon(0x9b7b42),
    curb: K.toon(0x878d99),
    tactile: K.toon(0xd8b23f),
    paint: K.toon(0xe0e6ee, { emissive: 0x8fa6b8, emissiveIntensity: 0.35 }),
    paintWarm: K.toon(0xe8dfcd, { emissive: 0xb8a88f, emissiveIntensity: 0.3 }),
    guard: K.toon(0x5b636f),
    pole: K.toon(0x3b3f48),
    wood: K.toon(0x6a4f36),
    woodDark: K.toon(0x3a2a20),
    metal: K.toon(0x6b737e),
    darkMetal: K.toon(0x272c35),
    black: K.toon(0x14171d),
    vendingBody: K.toon(0xb23a44),
    vendingBlue: K.toon(0x2d5f92),
    bike: K.toon(0x3f6f8f),
    bikeDark: K.toon(0x1b2028),
    binGreen: K.toon(0x3e6a52),
    binBlue: K.toon(0x355d84),
    cone: K.toon(0xd56a2f),
    plant: K.toon(0x2f5a44),
    plant2: K.toon(0x3d7350),
    pot: K.toon(0x4b4f58),
    neonPink: K.basic(0xff5f9e),
    neonCyan: K.basic(0x5fe0ff),
    glass: new T.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.10, depthWrite: false }),
    wetAsphalt: null
  };
  K.worldMats = M;

  function groundPlane(parent, w, d, x, z, mat, y) {
    const m = K.plane(parent, w, d, x, y, z, mat, { rx: -Math.PI / 2, receive: true });
    return m;
  }

  function asphaltTexture(repeatX, repeatY) {
    const tex = K.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#1d232e';
      ctx.fillRect(0, 0, w, h);
      const rand = mulberry(7);
      for (let i = 0; i < 2200; i++) {
        const v = 18 + Math.floor(rand() * 30);
        ctx.fillStyle = 'rgba(' + v + ',' + (v + 4) + ',' + (v + 10) + ',0.55)';
        ctx.fillRect(rand() * w, rand() * h, 1.4, 1.4);
      }
      // faint wet sheen streaks
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = 'rgba(90,120,160,0.045)';
        ctx.fillRect(rand() * w, 0, 2 + rand() * 5, h);
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    return tex;
  }

  function pavedTexture(base, line, repeatX, repeatY, cells) {
    const tex = K.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      const rand = mulberry(11);
      for (let i = 0; i < 1200; i++) {
        const a = 0.03 + rand() * 0.05;
        ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
        ctx.fillRect(rand() * w, rand() * h, 2, 2);
      }
      ctx.strokeStyle = line;
      ctx.lineWidth = 2;
      const n = cells || 4;
      for (let i = 0; i <= n; i++) {
        const p = (i / n) * w;
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    return tex;
  }

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =====================  BASE  ===================== */
  function buildBase() {
    const g = K.group(K.scene, 0, 0, 0, 'base');
    const W = 24;
    // plinth + strata
    K.box(g, 24.5, 0.22, 24.5, 0, -1.85, 0, M.plinth, { outline: true, cast: true });
    K.box(g, 24.2, 0.55, 24.2, 0, -1.63, 0, M.baseRock, { outline: true, cast: true });
    K.box(g, 24.05, 0.5, 24.05, 0, -1.08, 0, M.baseSoil, { cast: true });
    K.box(g, 23.95, 0.55, 23.95, 0, -0.58, 0, M.baseConcrete, { cast: true });
    K.box(g, 24.0, 0.04, 24.0, 0, -0.03, 0, K.toon(0x222834), { receive: true });
    // brass edge line
    K.box(g, 24.35, 0.035, 24.35, 0, -1.4, 0, M.brass, { receive: false });
    // thin brass rim around the top of the square base, so the module reads at night
    const rim = K.basic(0x7d6a48);
    K.box(g, 24.05, 0.02, 0.05, 0, 0.01, 12.0, rim, { receive: false });
    K.box(g, 24.05, 0.02, 0.05, 0, 0.01, -12.0, rim, { receive: false });
    K.box(g, 0.05, 0.02, 24.05, 12.0, 0.01, 0, rim, { receive: false });
    K.box(g, 0.05, 0.02, 24.05, -12.0, 0.01, 0, rim, { receive: false });
    // nameplate on the front edge
    K.box(g, 4.6, 0.62, 0.05, 0, -1.32, 12.01, M.brass, { outline: true });
    K.signPlane(g, 'HOSHINO MART', 4.2, 0.34, {
      x: 0, y: -1.01, z: 12.045, size: 66, texW: 1024, texH: 128,
      color: '#17140d', spacing: 6
    });
    K.signPlane(g, 'RAINY CORNER · 1:24', 3.0, 0.2, {
      x: 0, y: -1.28, z: 12.045, size: 40, texW: 1024, texH: 96,
      color: 'rgba(25,20,10,.8)'
    });
    K.addPiece(g, 0, { drop: 4.8, dur: 1.15 });
    K.world = K.world || {};
    K.world.base = g;
    return g;
  }

  /* =====================  GROUND / STREET  ===================== */
  function buildGround() {
    const g = K.group(K.scene, 0, 0, 0, 'ground');
    // asphalt (standard: wet specular)
    const roadMat = new T.MeshStandardMaterial({
      map: asphaltTexture(5, 2), color: 0x9aa3b4, roughness: 0.34, metalness: 0.28
    });
    const roadMatE = new T.MeshStandardMaterial({
      map: asphaltTexture(2, 7), color: 0x9aa3b4, roughness: 0.34, metalness: 0.28
    });
    M.wetAsphalt = roadMat;
    // south road (up to the corner) + east road
    groundPlane(g, 18.4, 3.6, -2.8, 8.1, roadMat, 0.02);
    groundPlane(g, 4.65, 21.9, 8.72, -1.05, roadMatE, 0.021);
    // sidewalk
    const walkMat = K.toon(0xffffff, { map: pavedTexture('#5b6272', 'rgba(26,31,42,.7)', 4, 1.2, 3) });
    const walkMatE = K.toon(0xffffff, { map: pavedTexture('#5b6272', 'rgba(26,31,42,.7)', 1.2, 6, 3) });
    const foreMat = K.toon(0xffffff, { map: pavedTexture('#6b6f79', 'rgba(28,32,40,.55)', 5, 3, 3) });
    groundPlane(g, 18.4, 1.0, -2.8, 5.8, walkMat, 0.1);
    groundPlane(g, 1.4, 17.3, 5.7, -3.35, walkMatE, 0.1);
    groundPlane(g, 23, 1.2, -0.5, 10.5, walkMat, 0.1);
    groundPlane(g, 1.0, 21.9, 11.5, -1.05, walkMatE, 0.1);
    groundPlane(g, 12, 6.5, -1, 2.05, foreMat, 0.055);
    // west alley + back yard
    groundPlane(g, 3.0, 11.7, -6.7, -1.0, K.toon(0xffffff, { map: pavedTexture('#3d424d', 'rgba(20,24,30,.7)', 1.5, 5, 3) }), 0.035);
    groundPlane(g, 19.4, 4.6, -2.3, -9.6, K.toon(0xffffff, { map: pavedTexture('#3b404a', 'rgba(18,22,28,.6)', 8, 1.8, 3) }), 0.035);
    // curbs
    K.box(g, 18.5, 0.14, 0.16, -2.8, 0.1, 6.3, M.curb, { outline: true });
    K.box(g, 0.16, 0.14, 17.3, 6.4, 0.1, -3.35, M.curb, { outline: true });
    K.box(g, 22.8, 0.14, 0.16, -0.4, 0.1, 9.92, M.curb);
    K.box(g, 0.16, 0.14, 21.9, 11.0, 0.1, -1.05, M.curb);
    // tactile paving at the corner
    K.box(g, 3.0, 0.025, 0.3, 0.6, 0.12, 6.02, M.tactile);
    K.box(g, 0.3, 0.025, 2.0, 6.15, 0.12, 5.0, M.tactile);
    // lane markings
    for (let x = -11.5; x < 5.5; x += 2.6) K.box(g, 1.3, 0.012, 0.09, x, 0.026, 8.1, M.paint, { receive: false });
    for (let z = -11.5; z < 5.5; z += 2.6) K.box(g, 0.09, 0.012, 1.3, 8.7, 0.027, z, M.paint, { receive: false });
    // crosswalk (reflective)
    for (let i = 0; i < 5; i++) {
      K.box(g, 0.58, 0.014, 3.1, -1.2 + i * 0.98, 0.03, 8.1, M.paintWarm, { receive: false });
    }
    // stop line
    K.box(g, 0.16, 0.014, 3.4, 5.85, 0.03, 8.1, M.paint, { receive: false });
    // parking bays
    for (let i = 0; i < 2; i++) {
      K.box(g, 0.09, 0.012, 4.3, -4.7 + i * 2.45, 0.07, 2.9, M.paint, { receive: false });
    }
    K.box(g, 4.8, 0.012, 0.09, -3.5, 0.07, 0.8, M.paint, { receive: false });
    K.box(g, 4.8, 0.012, 0.09, -3.5, 0.07, 5.0, M.paint, { receive: false });
    K.box(g, 0.5, 0.1, 0.3, -2.2, 0.07, 4.65, M.curb);
    K.box(g, 0.5, 0.1, 0.3, -4.8, 0.07, 4.65, M.curb);
    // drainage grates
    for (const [x, z] of [[2.4, 6.45], [-6.2, 6.45], [6.5, 1.6], [6.5, -4.0]]) {
      const gr = K.box(g, z < 6.6 && x > 6 ? 0.5 : 0.62, 0.02, z < 6.6 && x > 6 ? 0.62 : 0.36, x, 0.03, z, M.darkMetal, { receive: false });
      for (let i = 0; i < 4; i++) {
        K.box(g, z < 6.6 && x > 6 ? 0.05 : 0.5, 0.006, z < 6.6 && x > 6 ? 0.5 : 0.04, x, 0.05, z - 0.13 + i * 0.09, M.black, { receive: false });
      }
    }
    // manhole
    const mh = K.cyl(g, 0.55, 0.55, 0.02, -1.8, 0.028, 9.4, M.darkMetal, { seg: 20, receive: true });
    K.cyl(g, 0.42, 0.42, 0.022, -1.8, 0.03, 9.4, M.metal, { seg: 20, receive: false });
    K.addPiece(g, 0.12, { drop: 4.4, dur: 1.0 });
    K.world.ground = g;
  }

  /* =====================  BACKGROUND BLOCK + ALLEY  ===================== */
  function buildBackground() {
    const g = K.group(K.scene, 0, 0, 0, 'block');
    const x0 = -11.7, x1 = -9.4, z0 = -9.6, z1 = 4.3, h = 3.45;
    K.box(g, x1 - x0, h, z1 - z0, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, K.toon(0x2b2e38), { outline: true, cast: true });
    // roof
    K.box(g, x1 - x0 + 0.3, 0.22, z1 - z0 + 0.3, (x0 + x1) / 2, h + 0.02, (z0 + z1) / 2, K.toon(0x1b1e25), { outline: true, cast: true });
    K.box(g, 2.0, 0.5, 1.5, -10.4, h + 0.24, -4.4, M.darkMetal, { outline: true });
    // east-facing alley windows + door
    const winMat = K.toon(0x514532, { emissive: 0xffbd72, emissiveIntensity: 0.9 });
    const winMat2 = K.toon(0x2c3542, { emissive: 0x9fc4ff, emissiveIntensity: 0.35 });
    K.box(g, 0.08, 0.95, 1.35, x1 + 0.01, 2.1, -5.8, winMat, { receive: false });
    K.box(g, 0.08, 0.95, 1.1, x1 + 0.01, 2.15, -2.0, winMat2, { receive: false });
    K.box(g, 0.08, 1.7, 0.95, x1 + 0.01, 0.1, 1.9, M.woodDark, {});
    // window frames
    for (const [z, len] of [[-5.8, 1.45], [-2.0, 1.2]]) {
      K.box(g, 0.06, 1.12, 0.06, x1 + 0.06, 2.0, z - len / 2, M.darkMetal);
      K.box(g, 0.06, 1.12, 0.06, x1 + 0.06, 2.0, z + len / 2, M.darkMetal);
      K.box(g, 0.06, 0.06, len, x1 + 0.06, 2.52, z, M.darkMetal);
      K.box(g, 0.06, 0.06, len, x1 + 0.06, 2.0, z, M.darkMetal);
    }
    // vertical neon sign on the alley wall
    K.box(g, 0.12, 2.2, 0.62, x1 + 0.14, 2.75, 0.55, K.toon(0x20232b), { outline: true });
    const snackTex = K.textTexture('スナック', {
      vertical: true, texW: 128, texH: 512, size: 78, color: '#ff9bd1', glow: 'rgba(255,70,150,.75)'
    });
    K.textMesh(g, 'スナック', 0.34, 1.9, snackTex, { x: x1 + 0.21, y: 3.75, z: 0.55, ry: Math.PI / 2 });
    K.world.alleyNeon = K.lightPool(g, -8.0, 0.55, 1.9, 0xff5f9e, 0.10, 0.04);
    // pipes down the wall
    K.cyl(g, 0.06, 0.06, 3.2, x1 + 0.16, 0.2, 3.9, M.darkMetal, { seg: 8 });
    K.cyl(g, 0.04, 0.04, 4.2, x1 + 0.13, 0.1, -8.0, M.metal, { seg: 8 });
    // AC on the wall
    const ac = K.box(g, 0.45, 0.72, 0.92, x1 + 0.28, 1.7, -1.0, M.metal, { outline: true, cast: true });
    K.cyl(g, 0.26, 0.26, 0.02, x1 + 0.52, 2.06, -1.0, M.darkMetal, { seg: 16, rz: Math.PI / 2 });
    // wall lamp in the alley
    K.box(g, 0.18, 0.18, 0.3, x1 + 0.2, 2.9, -3.4, K.basic(0xffd0a0), {});
    K.lightPool(g, -8.1, -3.4, 1.4, 0xffc07a, 0.16, 0.04);

    // bulletin board on the store's west wall, facing the alley
    K.box(g, 0.12, 1.0, 1.7, -5.38, 1.35, -3.1, M.woodDark, { outline: true });
    K.box(g, 0.08, 0.9, 1.55, -5.43, 1.4, -3.1, M.wood, {});
    const boardPoster = K.canvasTexture(256, 160, (ctx, w, h) => {
      ctx.fillStyle = '#e8dfc9'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3f5d4a'; ctx.fillRect(0, 0, w, 28);
      ctx.fillStyle = '#f5ead6'; ctx.font = '600 16px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('星野町 掲示板', w / 2, 20);
      const cols = ['#d47a3a', '#3f6f9a', '#b84545', '#3f7a5b'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = cols[i]; ctx.fillRect(12 + (i % 2) * 120, 44 + Math.floor(i / 2) * 56, 100, 42);
        ctx.fillStyle = 'rgba(255,255,255,.65)';
        for (let j = 0; j < 3; j++) ctx.fillRect(18 + (i % 2) * 120, 56 + Math.floor(i / 2) * 56 + j * 9, 70, 3);
      }
    });
    const bp = new T.Mesh(new T.PlaneGeometry(1.45, 0.82), new T.MeshBasicMaterial({ map: boardPoster, toneMapped: false }));
    bp.position.set(-5.47, 1.85, -3.1); bp.rotation.y = -Math.PI / 2; g.add(bp);
    // a small wall lamp over the board
    K.box(g, 0.16, 0.14, 0.26, -5.3, 2.5, -2.4, K.basic(0xffd0a0), {});
    K.lightPool(g, -5.8, -2.4, 1.4, 0xffc07a, 0.15, 0.05);
    // store west alley bulletin board lives in store.js, add clutter here
    K.box(g, 0.7, 0.8, 1.0, -7.7, 0.02, -6.9, M.woodDark, { outline: true });
    K.box(g, 0.8, 0.12, 1.1, -7.7, 0.82, -6.9, M.wood, {});
    K.box(g, 0.62, 0.1, 0.9, -7.7, 0.92, -6.9, M.darkMetal, {});
    // crates in the alley
    for (let i = 0; i < 3; i++) {
      K.box(g, 0.62, 0.4, 0.52, -7.5 + i * 0.08, 0.05 + i * 0.4, 3.1 - i * 0.15, K.toon(i % 2 ? 0x7a5a36 : 0x8f6a40), { outline: true, ry: i * 0.2 });
    }
    // alley step
    K.box(g, 0.4, 0.12, 1.6, -5.45, 0.03, -4.7, M.curb);
    K.addPiece(g, 0.5, { drop: 4.4, dur: 1.1 });
    K.world.block = g;
  }

  /* =====================  UTILITY POLE + WIRES  ===================== */
  function buildUtility() {
    const g = K.group(K.scene, 0, 0, 0, 'utility');
    const px = 6.0, pz = 4.0;
    // pole
    K.cyl(g, 0.11, 0.17, 7.3, px, 0, pz, M.pole, { seg: 10, outline: true, cast: true });
    // cross arms
    for (const [y, w] of [[6.15, 2.0], [5.6, 1.6]]) {
      K.box(g, 0.1, 0.1, w, px, y, pz, M.darkMetal, { outline: true });
      for (let i = -1; i <= 1; i++) {
        K.cyl(g, 0.055, 0.055, 0.18, px, y + 0.08, pz + i * w * 0.36, K.toon(0x8a8f99), { seg: 6 });
      }
    }
    // transformer / drums
    K.cyl(g, 0.24, 0.24, 0.62, px - 0.28, 4.7, pz + 0.12, M.darkMetal, { seg: 10, outline: true });
    K.cyl(g, 0.19, 0.19, 0.5, px + 0.3, 4.9, pz - 0.1, M.metal, { seg: 10 });
    // pole signs
    K.box(g, 0.3, 0.55, 0.04, px, 3.0, pz + 0.17, K.toon(0x3a4150), {});
    K.signPlane(g, '星野町', 0.26, 0.24, { x: px, y: 3.28, z: pz + 0.2, size: 28, texW: 192, texH: 128, color: '#dbe7f5' });
    K.signPlane(g, '1', 0.16, 0.14, { x: px, y: 3.04, z: pz + 0.2, size: 30, texW: 128, texH: 128, color: '#dbe7f5' });
    // wires: sagging catenaries to the second pole and off to the block
    const southPole = new T.Vector3(px, 6.35, pz);
    const northPole = new T.Vector3(px, 6.35, -10.4);
    for (let i = -1; i <= 1; i++) {
      const pts = [];
      for (let j = 0; j <= 16; j++) {
        const tt = j / 16;
        const z = pz + (northPole.z - pz) * tt;
        const y = southPole.y - Math.sin(Math.PI * tt) * 0.55 + i * 0.16;
        pts.push(new T.Vector3(px + i * 0.12, y, z));
      }
      g.add(K.wire(pts, 0x111722));
    }
    for (let i = 0; i < 2; i++) {
      const pts = [];
      for (let j = 0; j <= 14; j++) {
        const tt = j / 14;
        const x = px + (-8.5 - px) * tt;
        const z = pz + (-4.4 - pz) * tt;
        const y = 6.25 - Math.sin(Math.PI * tt) * 0.6 - i * 0.18;
        pts.push(new T.Vector3(x, y, z));
      }
      g.add(K.wire(pts, 0x121722));
    }
    // second pole at the north end
    const g2 = K.group(g, 0, 0, 0, 'poleN');
    K.cyl(g2, 0.1, 0.15, 6.9, px, 0, -10.4, M.pole, { seg: 10, outline: true });
    K.box(g2, 0.09, 0.09, 1.4, px, 5.9, -10.4, M.darkMetal);
    for (let i = -1; i <= 1; i++) K.cyl(g2, 0.05, 0.05, 0.16, px, 5.98, -10.4 + i * 0.5, K.toon(0x8a8f99), { seg: 6 });
    K.addPiece(g, 0.9, { drop: 4.6, dur: 1.1 });
    K.world.utility = g;
  }

  /* =====================  STREET LAMP / SIGNALS / SIGNS  ===================== */
  function buildStreetFurniture() {
    // street lamp
    const lampG = K.group(K.scene, 0, 0, 0, 'streetlamp');
    const lx = 5.15, lz = 4.7;
    K.cyl(lampG, 0.07, 0.11, 4.5, lx, 0.1, lz, M.pole, { seg: 8, outline: true, cast: true });
    K.cyl(lampG, 0.045, 0.045, 0.9, lx - 0.45, 4.55, lz, M.pole, { seg: 8, rz: Math.PI / 2 });
    const head = K.box(lampG, 0.62, 0.16, 0.34, lx - 0.9, 4.42, lz, M.darkMetal, { outline: true });
    const warm = K.basic(0xffd8a6);
    K.box(lampG, 0.5, 0.04, 0.26, lx - 0.9, 4.4, lz, warm, {});
    const lampLight = new T.PointLight(0xffc98a, 28, 11, 2);
    lampLight.position.set(lx - 0.9, 4.2, lz);
    lampG.add(lampLight);
    K.world.lampLight = lampLight;
    K.lightPool(lampG, lx - 0.9, lz, 2.2, 0xffc98a, 0.24, 0.075);
    const lampGlow = new T.Sprite(new T.SpriteMaterial({
      map: K.glowTexture(), color: 0xffc98a, transparent: true, opacity: 0.7,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    lampGlow.position.set(lx - 0.9, 4.42, lz);
    lampGlow.scale.set(1.4, 1.4, 1);
    lampG.add(lampGlow);
    // second lamp nearer the seam/forecourt
    const lx2 = -4.8, lz2 = 4.9;
    K.cyl(lampG, 0.06, 0.1, 4.2, lx2, 0.1, lz2, M.pole, { seg: 8, outline: true, cast: true });
    K.cyl(lampG, 0.04, 0.04, 0.8, lx2 + 0.4, 4.25, lz2, M.pole, { seg: 8, rz: Math.PI / 2 });
    K.box(lampG, 0.55, 0.14, 0.3, lx2 + 0.8, 4.15, lz2, M.darkMetal, { outline: true });
    K.box(lampG, 0.44, 0.04, 0.22, lx2 + 0.8, 4.13, lz2, K.basic(0xffd8a6), {});
    const lampLight2 = new T.PointLight(0xffc98a, 55, 10, 2);
    lampLight2.position.set(lx2 + 0.8, 4.0, lz2);
    lampG.add(lampLight2);
    K.lightPool(lampG, lx2 + 0.8, lz2, 2.0, 0xffc98a, 0.24, 0.075);
    K.world.lampLight2 = lampLight2;
    const lampGlow2 = new T.Sprite(new T.SpriteMaterial({
      map: K.glowTexture(), color: 0xffc98a, transparent: true, opacity: 0.65,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    lampGlow2.position.set(lx2 + 0.8, 4.15, lz2);
    lampGlow2.scale.set(1.2, 1.2, 1);
    lampG.add(lampGlow2);
    // third lamp at the western seam, lighting the connection
    const lx3 = -8.45, lz3 = 4.85;
    K.cyl(lampG, 0.06, 0.1, 4.2, lx3, 0.1, lz3, M.pole, { seg: 8, outline: true, cast: true });
    K.cyl(lampG, 0.04, 0.04, 0.8, lx3 + 0.4, 4.25, lz3, M.pole, { seg: 8, rz: Math.PI / 2 });
    K.box(lampG, 0.55, 0.14, 0.3, lx3 + 0.8, 4.15, lz3, M.darkMetal, { outline: true });
    K.box(lampG, 0.44, 0.04, 0.22, lx3 + 0.8, 4.13, lz3, K.basic(0xffd8a6), {});
    const lampLight3 = new T.PointLight(0xffc98a, 52, 10, 2);
    lampLight3.position.set(lx3 + 0.8, 4.0, lz3);
    lampG.add(lampLight3);
    K.lightPool(lampG, lx3 + 0.8, lz3, 2.2, 0xffc98a, 0.26, 0.075);
    K.world.lampLight3 = lampLight3;
    const lampGlow3 = new T.Sprite(new T.SpriteMaterial({
      map: K.glowTexture(), color: 0xffc98a, transparent: true, opacity: 0.6,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    lampGlow3.position.set(lx3 + 0.8, 4.15, lz3);
    lampGlow3.scale.set(1.1, 1.1, 1);
    lampG.add(lampGlow3);
    K.addPiece(lampG, 1.25, { drop: 4.2, dur: 1.0 });

    // traffic signal
    const sigG = K.group(K.scene, 0, 0, 0, 'signal');
    const sx = 5.8, sz = 4.9;
    K.cyl(sigG, 0.055, 0.08, 3.4, sx, 0.1, sz, M.pole, { seg: 8, outline: true });
    K.box(sigG, 0.4, 1.1, 0.3, sx, 2.45, sz, M.darkMetal, { outline: true });
    const red = K.basic(0x5a1a20);
    const amber = K.basic(0x5a4218);
    const green = K.basic(0x1e4a32);
    K.cyl(sigG, 0.115, 0.115, 0.06, sx, 3.28, sz + 0.17, red, { seg: 16, rx: Math.PI / 2 });
    K.cyl(sigG, 0.115, 0.115, 0.06, sx, 2.98, sz + 0.17, amber, { seg: 16, rx: Math.PI / 2 });
    K.cyl(sigG, 0.115, 0.115, 0.06, sx, 2.68, sz + 0.17, green, { seg: 16, rx: Math.PI / 2 });
    const halo = new T.Sprite(new T.SpriteMaterial({
      map: K.glowTexture(), color: 0x5fe08a, transparent: true, opacity: 0.35,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    halo.position.set(sx, 2.68, sz + 0.24);
    halo.scale.set(0.75, 0.75, 1);
    sigG.add(halo);
    // pedestrian signal
    K.box(sigG, 0.34, 0.44, 0.22, sx, 1.6, sz + 0.1, M.darkMetal, { outline: true });
    const pedMat = K.basic(0x7a241e);
    K.box(sigG, 0.2, 0.2, 0.03, sx, 1.75, sz + 0.23, pedMat, {});
    K.addPiece(sigG, 1.3, { drop: 4.2, dur: 1.0 });
    K.world.signal = { red, amber, green, pedMat, halo, greenOn: true };

    // stop sign + street name sign
    const signG = K.group(K.scene, 0, 0, 0, 'signs');
    K.cyl(signG, 0.035, 0.05, 2.6, 4.55, 0.1, 5.4, M.metal, { seg: 8 });
    const stopTex = K.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#c53030';
      ctx.beginPath(); ctx.moveTo(w / 2, 26); ctx.lineTo(w - 20, h - 34); ctx.lineTo(20, h - 34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 8; ctx.stroke();
      ctx.fillStyle = '#fff6ec'; ctx.font = '700 52px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('止まれ', w / 2, h - 68);
    });
    K.textMesh(signG, '止まれ', 0.9, 0.9, stopTex, { x: 4.55, y: 2.5, z: 5.44 });
    K.box(signG, 0.5, 0.28, 0.04, 4.55, 2.08, 5.4, K.basic(0x2f6f9f), {});
    K.signPlane(signG, '星野町 1', 0.44, 0.16, { x: 4.55, y: 2.22, z: 5.43, size: 28, texW: 256, texH: 96, color: '#e8f3ff' });
    // parking sign
    K.cyl(signG, 0.03, 0.04, 2.0, -6.4, 0.06, 4.6, M.metal, { seg: 6 });
    K.box(signG, 0.55, 0.55, 0.04, -6.4, 1.95, 4.6, K.basic(0x2f6f9f), {});
    K.signPlane(signG, 'P', 0.38, 0.38, { x: -6.4, y: 2.22, z: 4.63, size: 140, texW: 256, texH: 256, color: '#f5fbff' });
    K.addPiece(signG, 1.4, { drop: 4.2, dur: 0.95 });

    // guardrail along the far pavement
    const railG = K.group(K.scene, 0, 0, 0, 'guardrail');
    for (let x = -11.2; x <= 10.2; x += 2.4) {
      K.cyl(railG, 0.045, 0.055, 0.8, x, 0.1, 11.72, M.guard, { seg: 6 });
    }
    K.box(railG, 22.2, 0.08, 0.08, -0.5, 0.84, 11.72, M.guard, { outline: true });
    K.box(railG, 22.2, 0.06, 0.06, -0.5, 0.66, 11.72, M.guard);
    // east side rail
    for (let z = -9.5; z <= 9.5; z += 2.7) K.cyl(railG, 0.04, 0.05, 0.78, 11.75, 0.1, z, M.guard, { seg: 6 });
    K.box(railG, 0.08, 0.08, 20.0, 11.75, 0.82, 0, M.guard, { outline: true });
    K.addPiece(railG, 1.05, { drop: 4.2, dur: 1.0 });
  }

  /* =====================  OUTDOOR PROPS  ===================== */
  function vendingFrontTex() {
    return K.canvasTexture(320, 560, (ctx, w, h) => {
      ctx.fillStyle = '#261217'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3a1a22'; ctx.fillRect(10, 10, w - 20, h - 150);
      const cols = ['#ff7a6b', '#ffd166', '#74d7ff', '#b48cff', '#8dffb0', '#ff99cf'];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = cols[(r * 4 + c) % cols.length];
          ctx.beginPath(); ctx.arc(46 + c * 76, 58 + r * 88, 18, 0, 6.28); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.18)';
          ctx.fillRect(28 + c * 76, 84 + r * 88, 36, 9);
        }
      }
      ctx.fillStyle = '#f2e7d8'; ctx.font = '700 26px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('HOSHINO DRINKS', w / 2, h - 66);
      ctx.fillStyle = '#5fe0ff'; ctx.fillRect(24, h - 44, w - 48, 5);
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(130, 0); ctx.lineTo(0, 360); ctx.closePath(); ctx.fill();
    });
  }

  function buildProps() {
    // vending machine
    const vendG = K.group(K.scene, 0, 0, 0, 'vending');
    const vx = 3.9, vz = 0.18;
    K.box(vendG, 1.15, 1.95, 0.8, vx, 0.08, vz, M.vendingBody, { outline: true, cast: true });
    K.box(vendG, 1.2, 0.07, 0.86, vx, 2.03, vz, M.darkMetal);
    const vTex = vendingFrontTex();
    const vFront = new T.Mesh(new T.PlaneGeometry(1.0, 1.7), new T.MeshBasicMaterial({ map: vTex, toneMapped: false }));
    vFront.position.set(vx, 1.16, vz + 0.44);
    vendG.add(vFront);
    K.box(vendG, 0.7, 0.12, 0.06, vx, 0.38, vz + 0.46, M.darkMetal);
    K.lightPool(vendG, vx, vz + 1.0, 1.25, 0xff5f78, 0.16, 0.085);
    const vLight = new T.PointLight(0xff7088, 6, 4.5, 2);
    vLight.position.set(vx, 1.4, vz + 0.9);
    vendG.add(vLight);
    K.world.vendingLight = vLight;
    K.addPiece(vendG, 1.55, { drop: 4.3, dur: 1.0 });

    // bicycle
    const bikeG = K.group(K.scene, 0, 0, 0, 'bicycle');
    const bx = -4.35, bz = 0.15;
    const bike = K.group(bikeG, bx, 0.06, bz);
    bike.rotation.y = -0.12;
    K.torus(bike, 0.42, 0.035, -0.55, 0.44, 0, M.bikeDark, { rz: 0, ry: Math.PI / 2, cast: true });
    K.torus(bike, 0.42, 0.035, 0.55, 0.44, 0, M.bikeDark, { ry: Math.PI / 2, cast: true });
    for (const wx of [-0.55, 0.55]) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI;
        const spoke = K.cyl(bike, 0.008, 0.008, 0.8, wx, 0.44 - 0.4, 0, M.metal, { seg: 4, rz: a });
        spoke.position.y = 0.44;
      }
    }
    const frameMat = M.bike;
    K.cyl(bike, 0.022, 0.022, 0.9, -0.18, 0.44, 0, frameMat, { seg: 6, rz: 1.0, outline: true });
    K.cyl(bike, 0.022, 0.022, 0.8, 0.1, 0.44, 0, frameMat, { seg: 6, rz: -0.8, outline: true });
    K.cyl(bike, 0.022, 0.022, 0.7, 0.34, 0.44, 0, frameMat, { seg: 6, rz: 1.1 });
    const seat = K.box(bike, 0.28, 0.06, 0.14, -0.18, 0.9, 0, M.black, {});
    K.cyl(bike, 0.018, 0.018, 0.4, -0.18, 0.68, 0, M.metal, { seg: 5 });
    K.cyl(bike, 0.02, 0.02, 0.5, 0.55, 0.86, 0, M.metal, { seg: 5, rz: Math.PI / 2 });
    const bar = K.cyl(bike, 0.018, 0.018, 0.38, 0.55, 0.86, 0, M.metal, { seg: 5, rx: Math.PI / 2 });
    bar.rotation.z = 0;
    const basket = K.box(bike, 0.38, 0.25, 0.3, 0.62, 1.05, 0, K.toon(0x6b727c), { outline: true });
    K.box(bike, 0.3, 0.02, 0.22, 0.62, 1.3, 0, M.darkMetal);
    // kickstand
    K.cyl(bike, 0.012, 0.012, 0.4, -0.1, 0.06, 0.12, M.metal, { seg: 4, rz: 0.35 });
    K.addPiece(bikeG, 1.65, { drop: 4.3, dur: 1.0 });

    // umbrella stand
    const umbG = K.group(K.scene, 0, 0, 0, 'umbrella');
    K.cyl(umbG, 0.22, 0.19, 0.48, 1.55, 0.1, -0.63, M.darkMetal, { seg: 12, outline: true });
    const umbCols = [0x8fb7d8, 0xd7a7b6, 0x6b8fa8];
    for (let i = 0; i < 3; i++) {
      K.cyl(umbG, 0.045, 0.035, 0.9, 1.55 + (i - 1) * 0.1, 0.5, -0.63 + (i % 2) * 0.07, K.toon(umbCols[i]), { seg: 8, rz: (i - 1) * 0.12, cast: true });
      K.torus(umbG, 0.1, 0.018, 1.55 + (i - 1) * 0.1, 1.5, -0.63 + (i % 2) * 0.07, K.toon(umbCols[i]), { rx: Math.PI / 2, rz: (i - 1) * 0.12 });
    }
    K.addPiece(umbG, 1.75, { drop: 4.2, dur: 0.9 });

    // recycling bins
    const binG = K.group(K.scene, 0, 0, 0, 'bins');
    for (let i = 0; i < 2; i++) {
      const bx2 = -2.9 + i * 0.56;
      K.box(binG, 0.48, 0.72, 0.48, bx2, 0.1, 0.5, i ? M.binBlue : M.binGreen, { outline: true, cast: true });
      K.box(binG, 0.52, 0.06, 0.52, bx2, 0.82, 0.5, M.darkMetal, {});
      K.box(binG, 0.24, 0.16, 0.02, bx2, 0.55, 0.75, K.basic(i ? 0xd8e8ff : 0xd8ffe0), {});
    }
    K.addPiece(binG, 1.6, { drop: 4.2, dur: 0.9 });

    // cigarette bin next to the vending
    const cigG = K.group(K.scene, 0, 0, 0, 'cig');
    K.cyl(cigG, 0.17, 0.15, 0.7, 3.0, 0.1, 0.1, M.darkMetal, { seg: 10, outline: true });
    K.cyl(cigG, 0.19, 0.19, 0.05, 3.0, 0.8, 0.1, M.metal, { seg: 10 });
    K.addPiece(cigG, 1.7, { drop: 4.0, dur: 0.8 });

    // planters
    const plantG = K.group(K.scene, 0, 0, 0, 'planters');
    for (const [px, pz, w, d] of [[-6.2, 4.2, 0.9, 0.7], [4.7, 2.9, 0.8, 0.6], [-5.35, -0.4, 0.55, 0.55]]) {
      K.box(plantG, w, 0.4, d, px, 0.1, pz, M.pot, { outline: true, cast: true });
      K.box(plantG, w - 0.1, 0.04, d - 0.1, px, 0.5, pz, K.toon(0x2b211b), {});
      for (let i = 0; i < 3; i++) {
        K.ico(plantG, 0.18 + (i % 2) * 0.08, px + (i - 1) * 0.18, 0.66 + i * 0.1, pz + (i % 2 ? 0.1 : -0.08), i % 2 ? M.plant : M.plant2, { cast: true });
      }
    }
    K.addPiece(plantG, 1.75, { drop: 4.1, dur: 0.9 });

    // traffic cones
    const coneG = K.group(K.scene, 0, 0, 0, 'cones');
    for (const [cx, cz] of [[-5.9, 4.8], [-6.6, 3.7]]) {
      K.cyl(coneG, 0.06, 0.32, 0.62, cx, 0.1, cz, M.cone, { seg: 10, outline: true });
      K.cyl(coneG, 0.22, 0.22, 0.05, cx, 0.1, cz, M.darkMetal, { seg: 10 });
      K.box(coneG, 0.4, 0.03, 0.03, cx, 0.5, cz, M.paint, {});
    }
    K.addPiece(coneG, 1.8, { drop: 4.0, dur: 0.8 });
  }

  /* =====================  ALLEY / BACK YARD DETAIL  ===================== */
  function buildBackyard() {
    const g = K.group(K.scene, 0, 0, 0, 'backyard');
    // fence
    for (let x = -11.2; x <= 4.4; x += 2.0) K.cyl(g, 0.05, 0.06, 1.5, x, 0.08, -11.75, M.metal, { seg: 6 });
    K.box(g, 16.4, 0.07, 0.07, -3.3, 1.5, -11.75, M.metal, { outline: true });
    K.box(g, 16.4, 0.06, 0.06, -3.3, 0.95, -11.75, M.metal);
    // dumpster
    K.box(g, 2.2, 1.15, 1.15, -7.8, 0.08, -8.4, K.toon(0x2f4a40), { outline: true, cast: true });
    K.box(g, 2.28, 0.1, 1.2, -7.8, 1.23, -8.4, M.darkMetal, {});
    K.box(g, 2.0, 0.5, 0.05, -7.8, 0.4, -7.8, M.darkMetal, {});
    // crates
    for (let i = 0; i < 4; i++) {
      K.box(g, 0.7, 0.42, 0.6, 1.0 + (i % 2) * 0.8, 0.08 + Math.floor(i / 2) * 0.44, -9.3, K.toon(i % 2 ? 0x7c5b38 : 0x8c6942), { outline: true });
    }
    // AC units in back
    for (let i = 0; i < 2; i++) {
      const ax = -3.0 + i * 1.5;
      K.box(g, 0.9, 0.65, 0.62, ax, 0.08, -10.7, M.metal, { outline: true, cast: true });
      K.cyl(g, 0.22, 0.22, 0.04, ax, 0.4, -10.36, M.darkMetal, { seg: 14, rx: Math.PI / 2 });
      K.box(g, 0.8, 0.02, 0.06, ax, 0.3, -10.4, M.darkMetal, {});
    }
    // back door step
    K.box(g, 1.0, 0.13, 0.6, -4.9, 0.02, -7.4, M.curb);
    K.addPiece(g, 1.1, { drop: 4.2, dur: 1.0 });
  }

  /* =====================  PUDDLES + GROUND SHEEN  ===================== */
  function buildWet() {
    const g = K.group(K.scene, 0, 0, 0, 'wet');
    const alpha = K.glowTexture([[0, 'rgba(255,255,255,1)'], [0.55, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']]);
    const puddleMat = new T.MeshStandardMaterial({
      color: 0x0b1420, roughness: 0.05, metalness: 0.75,
      transparent: true, opacity: 0.85, depthWrite: false, alphaMap: alpha
    });
    const spots = [
      [1.2, 9.1, 1.9, 0.85], [-4.6, 8.0, 1.4, 0.65], [6.2, 7.8, 1.2, 0.5],
      [9.2, 2.0, 1.1, 1.5], [-2.0, 3.1, 1.2, 0.6], [2.3, 2.2, 1.0, 0.5],
      [-6.7, 2.0, 0.8, 1.1], [8.5, -5.0, 0.9, 1.2]
    ];
    for (const [x, z, sx, sz] of spots) {
      const p = new T.Mesh(new T.CircleGeometry(1, 18), puddleMat);
      p.rotation.x = -Math.PI / 2;
      p.scale.set(sx, sz, 1);
      p.position.set(x, 0.045, z);
      p.renderOrder = 1;
      g.add(p);
    }
    // painted neon reflections
    const streakTex = K.canvasTexture(128, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const cols = ['rgba(255,95,158,.8)', 'rgba(95,224,255,.75)', 'rgba(255,190,110,.8)', 'rgba(240,245,255,.5)'];
      const rand = mulberry(23);
      for (let i = 0; i < 18; i++) {
        const x = rand() * w, len = 40 + rand() * 150, y = 40 + rand() * (h - 120);
        const gr = ctx.createLinearGradient(0, y, 0, y + len);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(0.5, cols[i % cols.length]);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x, y, 2 + rand() * 2, len);
      }
    });
    const streakMat = new T.MeshBasicMaterial({
      map: streakTex, transparent: true, opacity: 0.55, depthWrite: false,
      blending: T.AdditiveBlending, toneMapped: false
    });
    for (const [x, z, w, d] of [[1.2, 9.1, 2.4, 1.3], [3.9, 1.1, 1.6, 1.1], [-3.0, 1.0, 2.0, 1.2], [6.2, 7.8, 1.4, 0.8]]) {
      const r = new T.Mesh(new T.PlaneGeometry(w, d), streakMat);
      r.rotation.x = -Math.PI / 2;
      r.position.set(x, 0.052, z);
      r.renderOrder = 2;
      g.add(r);
    }
    // warm spill in front of the store
    K.lightPool(g, 0.0, 0.4, 3.6, 0xffb35c, 0.3, 0.06);
    K.lightPool(g, 3.9, 0.9, 1.8, 0xff7288, 0.22, 0.06);
    K.lightPool(g, -9.0, 8.1, 2.6, 0xffc98a, 0.32, 0.06);
    K.addPiece(g, 1.0, { drop: 3.8, dur: 0.9 });
    K.world.wet = { group: g, puddles: [], streakMat };
  }

  /* =====================  BUILD  ===================== */
  K.buildWorld = function () {
    buildBase();
    buildGround();
    buildBackground();
    buildUtility();
    buildStreetFurniture();
    buildProps();
    buildBackyard();
    buildWet();
    console.log('[KONBINI] world ready');
  };
})();
