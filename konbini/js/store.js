/* =========================================================
   HOSHINO MART — the convenience store: shell, glass,
   warm interior, shelves, fridges, counter, sign, details
   ========================================================= */
(function () {
  'use strict';
  const K = window.KONBINI, T = K.T;

  const C = {
    wall: K.toon(0x3a4148),
    wallDark: K.toon(0x252b31),
    trim: K.toon(0x1a1f25),
    kick: K.toon(0x2d343b),
    cream: K.toon(0xf1e6d2),
    creamDark: K.toon(0xd9cbb2),
    floor: null,
    white: K.toon(0xf7f2e8),
    wood: K.toon(0x8a6a45),
    woodDark: K.toon(0x5a4430),
    steel: K.toon(0x8b949f),
    darkSteel: K.toon(0x3a4048),
    metal: K.toon(0x6b737e),
    black: K.toon(0x171b20),
    green: K.toon(0x3f7a5b),
    blue: K.toon(0x3f6f9a),
    red: K.toon(0xb84545),
    warmPanel: K.basic(0xfff3d8),
    coolPanel: K.basic(0xe8f4ff),
    glass: new T.MeshBasicMaterial({
      color: 0xd8efff, transparent: true, opacity: 0.075, depthWrite: false, side: T.DoubleSide
    }),
    fridgeGlass: new T.MeshBasicMaterial({
      color: 0xcfe9ff, transparent: true, opacity: 0.13, depthWrite: false, side: T.DoubleSide
    })
  };
  K.storeMats = C;

  const productColors = [0xe05f5f, 0xf0b04a, 0x4f9bd9, 0x67b87a, 0xb27ad9, 0xef8fb0, 0x6ac7c7, 0xd9d06a, 0xe8e2d4];

  function floorTexture() {
    const tex = K.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#dcd0bb'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(120,105,85,.28)'; ctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        const p = i / 4 * w;
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
      }
      const rand = (function () { let a = 9; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.02 + rand() * 0.04) + ')';
        ctx.fillRect(rand() * w, rand() * h, 2, 2);
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }
  C.floor = K.toon(0xffffff, { map: floorTexture() });

  function interiorWallTexture() {
    return K.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#e8dcc8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      for (let i = 0; i < 600; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      ctx.strokeStyle = 'rgba(150,130,105,.18)';
      for (let y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    });
  }

  function starLogo(ctx, cx, cy, r, color) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 === 0 ? r : r * 0.44;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  }

  function signTexture() {
    return K.canvasTexture(1600, 300, (ctx, w, h) => {
      ctx.fillStyle = '#f6f2e4'; ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(235,225,205,.25)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // dark green band
      ctx.fillStyle = '#2f5f4a'; ctx.fillRect(0, h - 54, w, 54);
      starLogo(ctx, 120, h / 2, 52, '#2f5f4a');
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#243a32';
      ctx.font = '800 112px "Hiragino Sans","PingFang SC",sans-serif';
      ctx.fillText('HOSHINO MART', 200, h / 2 - 16);
      ctx.fillStyle = '#b06a3a';
      ctx.font = '600 34px "Hiragino Sans",sans-serif';
      ctx.fillText('ほしのマート  ·  HOSHINO 1-CHOME', 202, h / 2 + 76);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#2f5f4a'; ctx.font = '800 64px "Hiragino Sans",sans-serif';
      ctx.fillText('24H', w - 40, h / 2 - 8);
      ctx.fillStyle = '#b06a3a'; ctx.font = '600 24px "Hiragino Sans",sans-serif';
      ctx.fillText('OPEN', w - 42, h / 2 + 48);
    });
  }

  function verticalSignTexture() {
    return K.canvasTexture(160, 900, (ctx, w, h) => {
      ctx.fillStyle = '#f6f2e4'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#2f5f4a'; ctx.lineWidth = 10; ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = '#2f5f4a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 94px "Hiragino Sans","PingFang SC",sans-serif';
      const t = 'ほしのマート';
      for (let i = 0; i < t.length; i++) ctx.fillText(t[i], w / 2, 115 + i * 105);
      starLogo(ctx, w / 2, h - 95, 38, '#b06a3a');
    });
  }

  function posterTexture(kind) {
    return K.canvasTexture(256, 384, (ctx, w, h) => {
      if (kind === 0) {
        ctx.fillStyle = '#e75f7f'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff3ea'; ctx.font = '800 54px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('新発売', w / 2, 96);
        ctx.font = '600 30px "Hiragino Sans",sans-serif';
        ctx.fillText('いちご', w / 2, 160); ctx.fillText('スイーツ', w / 2, 198);
        ctx.fillStyle = '#ffe3a8'; ctx.beginPath(); ctx.arc(w / 2, 290, 52, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#e75f7f'; ctx.font = '700 24px sans-serif'; ctx.fillText('¥298', w / 2, 300);
      } else if (kind === 1) {
        ctx.fillStyle = '#3f5d4a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#f6ead6'; ctx.font = '700 50px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('HOT', w / 2, 76); ctx.fillText('COFFEE', w / 2, 132);
        ctx.fillStyle = '#d8b47a'; ctx.beginPath(); ctx.roundRect(80, 190, 96, 80, 12); ctx.fill();
        ctx.fillStyle = '#f6ead6'; ctx.font = '600 26px sans-serif';
        ctx.fillText('¥100', w / 2, 320);
      } else if (kind === 2) {
        ctx.fillStyle = '#d47a3a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff2dd'; ctx.font = '800 52px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('おでん', w / 2, 90);
        ctx.font = '600 26px "Hiragino Sans",sans-serif';
        ctx.fillText('あったか〜い', w / 2, 140);
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i === 1 ? '#f7e3b0' : '#c48a5a';
          ctx.beginPath(); ctx.ellipse(70 + i * 58, 250, 24, 34, 0, 0, 6.28); ctx.fill();
        }
      } else {
        ctx.fillStyle = '#2f5f7f'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e9f5ff'; ctx.font = '800 64px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('ATM', w / 2, 140);
        ctx.font = '600 26px "Hiragino Sans",sans-serif';
        ctx.fillText('24時間', w / 2, 206); ctx.fillText('ご利用ください', w / 2, 246);
      }
    });
  }

  function posScreenTexture() {
    return K.canvasTexture(256, 192, (ctx, w, h) => {
      ctx.fillStyle = '#0c2433'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5fe0d0'; ctx.font = '700 18px monospace';
      ctx.fillText('HOSHINO POS', 14, 28);
      ctx.fillStyle = 'rgba(120,230,210,.8)'; ctx.font = '13px monospace';
      for (let i = 0; i < 5; i++) ctx.fillText('ITEM ' + (i + 1) + '   ¥' + (128 + i * 40), 14, 58 + i * 22);
      ctx.fillStyle = '#ffd166'; ctx.font = '700 16px monospace';
      ctx.fillText('TOTAL  ¥ 1,284', 14, h - 26);
      ctx.fillStyle = '#5fe0d0'; ctx.fillRect(0, 34, w, 2);
    });
  }

  function magazineTexture(kind) {
    const titles = ['COMIC', 'TRAVEL', 'CAR', 'GAME', 'COOK', 'NEWS'];
    const cols = ['#d9534f', '#3f7a5b', '#3f6f9a', '#8a5aa8', '#d47a3a', '#4f6f8a'];
    return K.canvasTexture(160, 220, (ctx, w, h) => {
      ctx.fillStyle = cols[kind]; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(0, 0, w, 40);
      ctx.fillStyle = '#fff4e2'; ctx.font = '800 28px "Hiragino Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(titles[kind], w / 2, 34);
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.fillRect(16, 60, w - 32, h - 84);
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(24, 74, w - 48, 40);
      ctx.fillStyle = '#fff'; ctx.font = '700 12px sans-serif';
      ctx.fillText('HOSHINO', w / 2, h - 16);
    });
  }

  /* =====================  INTERIOR CEL BAKE  =====================
     The store interior is painted as flat cel colours so it always reads
     warm and bright against the rainy night, independent of the host's
     point-light budget. Outlines stay on the meshes. */
  K.bakeInteriorUnlit = function () {
    if (!K.store) return;
    const cache = new Map();
    const warm = new T.Color(0xffe2c6);
    function basicFor(mat) {
      if (cache.has(mat.uuid)) return cache.get(mat.uuid);
      const c = mat.color ? mat.color.clone() : new T.Color(0xffffff);
      c.multiply(warm);
      const m = new T.MeshBasicMaterial({
        color: c,
        map: mat.map || null,
        side: mat.side || T.FrontSide,
        toneMapped: false
      });
      cache.set(mat.uuid, m);
      return m;
    }
    function bake(group) {
      if (!group) return;
      group.traverse((o) => {
        if (!o.isMesh) return;
        const mat = o.material;
        if (!mat || Array.isArray(mat)) return;
        if (mat.isMeshBasicMaterial || mat.transparent) return;
        o.material = basicFor(mat);
      });
    }
    bake(K.store.interior);
    bake(K.store.shelvesG);
    bake(K.store.fridgeG);
    bake(K.store.counterG);
    // the shell's interior floor, ceiling and wall linings
    if (K.store.shell) {
      const tinted = [K.storeMats.floor, K.storeMats.cream, K.storeMats.creamDark];
      K.store.shell.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        if (tinted.indexOf(o.material) !== -1) o.material = basicFor(o.material);
      });
    }
    // the baked interior no longer needs its point lights
    for (const l of K.store.lights) { if (l.parent) l.parent.remove(l); }
    K.store.lights.length = 0;
    console.log('[KONBINI] interior cel-baked');
  };

  /* =====================  BUILD  ===================== */
  K.buildStore = function () {
    const S = K.scene;
    const shell = K.group(S, 0, 0, 0, 'storeShell');
    const glassG = K.group(S, 0, 0, 0, 'storeGlass');
    const interior = K.group(S, 0, 0, 0, 'storeInterior');
    const shelvesG = K.group(S, 0, 0, 0, 'storeShelves');
    const fridgeG = K.group(S, 0, 0, 0, 'storeFridge');
    const counterG = K.group(S, 0, 0, 0, 'storeCounter');
    const signG = K.group(S, 0, 0, 0, 'storeSign');
    const roofG = K.group(S, 0, 0, 0, 'storeRoof');

    const X0 = -5.2, X1 = 4.8, Z0 = -7.2, Z1 = -1.2;
    const W = X1 - X0, D = Z1 - Z0;
    const F = 0.27; // interior floor level

    /* ---------- shell ---------- */
    K.box(shell, W + 0.3, 0.26, D + 0.3, 0, 0.02, (Z0 + Z1) / 2, C.kick, { outline: true, cast: true });
    K.box(shell, W, 0.05, D, 0, F - 0.03, (Z0 + Z1) / 2, C.floor, { receive: true });
    // back and west walls
    K.box(shell, W, 3.0, 0.2, 0, F, Z0 + 0.1, C.wall, { outline: true, cast: true });
    K.box(shell, 0.2, 3.0, D, X0 + 0.1, F, (Z0 + Z1) / 2, C.wall, { outline: true, cast: true });
    // interior wall lining (cream)
    K.plane(shell, W - 0.4, 2.75, 0, F + 1.4, Z0 + 0.22, C.cream, { receive: true });
    K.plane(shell, D - 0.3, 2.75, X0 + 0.22, F + 1.4, (Z0 + Z1) / 2, C.cream, { ry: Math.PI / 2, receive: true });
    // east glass wall frame + kick
    K.box(shell, 0.18, 3.0, 0.18, X1, F, Z0 + 0.12, C.trim, { outline: true });
    K.box(shell, 0.18, 3.0, 0.18, X1, F, Z1 - 0.14, C.trim, { outline: true });
    K.box(shell, 0.2, 0.42, D - 0.3, X1, F, (Z0 + Z1) / 2, C.kick, { outline: true });
    K.box(shell, 0.2, 0.16, D - 0.2, X1, F + 2.75, (Z0 + Z1) / 2, C.trim);
    for (let i = 0; i < 4; i++) {
      K.box(shell, 0.12, 2.9, 0.12, X1, F, Z0 + 0.9 + i * 1.55, C.trim);
    }
    // front frame
    K.box(shell, W, 0.16, 0.22, 0, F, Z1, C.trim, { outline: true });
    K.box(shell, W, 0.18, 0.22, 0, F + 2.72, Z1, C.trim, { outline: true });
    for (const x of [X0 + 0.12, -1.1, 1.1, X1 - 0.12]) {
      K.box(shell, 0.14, 2.9, 0.18, x, F, Z1, C.trim, { outline: true });
    }
    K.box(shell, 2.4, 0.14, 0.18, 0, F + 2.35, Z1, C.trim);
    // roof + parapet
    K.box(shell, W + 0.3, 0.22, D + 0.3, 0, 3.08, (Z0 + Z1) / 2, C.wallDark, { outline: true, cast: true });
    K.box(shell, W + 0.34, 0.32, 0.16, 0, 3.3, Z1 + 0.12, C.trim);
    K.box(shell, 0.16, 0.32, D + 0.3, X0 - 0.02, 3.3, (Z0 + Z1) / 2, C.trim);
    K.box(shell, 0.16, 0.32, D + 0.3, X1 + 0.02, 3.3, (Z0 + Z1) / 2, C.trim);
    K.box(shell, W + 0.34, 0.32, 0.16, 0, 3.3, Z0 - 0.02, C.trim);
    // ceiling
    K.box(shell, W - 0.3, 0.05, D - 0.25, 0, 2.86, (Z0 + Z1) / 2, C.cream, { receive: true });
    // exterior AC / vents / downpipe
    K.box(shell, 0.9, 0.75, 0.6, -4.0, 0.4, Z0 - 0.35, C.darkSteel, { outline: true });
    K.cyl(shell, 0.23, 0.23, 0.05, -4.0, 0.78, Z0 - 0.6, C.steel, { seg: 14, rx: Math.PI / 2 });
    for (let i = 0; i < 3; i++) K.box(shell, 0.05, 0.06, 0.34, X0 - 0.2, 0.4 + i * 0.6, -5.5, C.darkSteel);
    K.cyl(shell, 0.06, 0.06, 3.0, X0 - 0.25, 0.1, -6.8, C.darkSteel, { seg: 8 });

    /* ---------- glass ---------- */
    // front panes, split around the door
    const frontPanes = [[X0 + 0.15, -1.1], [1.1, X1 - 0.15]];
    for (const [a, b] of frontPanes) {
      K.plane(glassG, b - a, 2.45, (a + b) / 2, F + 1.33, Z1, C.glass, {});
    }
    K.plane(glassG, 2.0, 0.45, 0, F + 2.57, Z1, C.glass, {});
    // east glass
    K.plane(glassG, D - 0.4, 2.35, X1, F + 1.4, (Z0 + Z1) / 2 + 0.1, C.glass, { ry: Math.PI / 2 });
    // door panels
    const doorL = new T.Group(), doorR = new T.Group();
    doorL.position.set(-0.55, 0, Z1);
    doorR.position.set(0.55, 0, Z1);
    glassG.add(doorL, doorR);
    for (const [g, side] of [[doorL, -1], [doorR, 1]]) {
      // a real glass door: thin frame, not a solid slab
      K.box(g, 1.0, 0.08, 0.06, 0, F, 0, C.trim, {});
      K.box(g, 1.0, 0.08, 0.06, 0, F + 2.22, 0, C.trim, {});
      K.box(g, 0.07, 2.22, 0.06, -0.465, F, 0, C.trim, {});
      K.box(g, 0.07, 2.22, 0.06, 0.465, F, 0, C.trim, {});
      K.plane(g, 0.86, 2.08, 0, F + 1.13, 0.035, C.glass, {});
      // vertical pull handle
      K.cyl(g, 0.018, 0.018, 0.55, side * 0.34, F + 1.1, 0.09, C.steel, { seg: 6 });
      K.box(g, 0.03, 0.03, 0.08, side * 0.34, F + 1.62, 0.06, C.steel);
      K.box(g, 0.03, 0.03, 0.08, side * 0.34, F + 1.1, 0.06, C.steel);
      K.signPlane(g, '自動ドア', 0.38, 0.1, { x: 0, y: F + 1.55, z: 0.045, size: 24, texW: 256, texH: 64, color: '#e8f5ff' });
    }
    // door mat + sensor
    const matTex = K.canvasTexture(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#2f4a42'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e8dfc9'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = '#f2ead8'; ctx.textAlign = 'center'; ctx.font = '700 50px "Hiragino Sans",sans-serif';
      ctx.fillText('HOSHINO MART', w / 2, h / 2 + 12);
    });
    const matMat = new T.MeshBasicMaterial({ map: matTex, toneMapped: false });
    K.plane(glassG, 2.4, 1.2, 0, 0.035, Z1 + 1.05, matMat, { rx: -Math.PI / 2 });
    K.box(glassG, 0.6, 0.1, 0.12, 0, F + 2.4, Z1 + 0.08, C.darkSteel);
    // rain streak plane over the glass
    const streakTex = K.canvasTexture(1024, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const rand = (function () { let a = 31; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
      for (let i = 0; i < 95; i++) {
        const x = rand() * w, y = rand() * h, len = 30 + rand() * 150;
        const g = ctx.createLinearGradient(x, y, x, y + len);
        g.addColorStop(0, 'rgba(220,240,255,0)');
        g.addColorStop(0.4, 'rgba(220,240,255,.55)');
        g.addColorStop(1, 'rgba(220,240,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, 1.5 + rand() * 1.5, len);
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = 'rgba(230,245,255,' + (0.15 + rand() * 0.3) + ')';
        ctx.beginPath(); ctx.arc(rand() * w, rand() * h, 1 + rand() * 2.2, 0, 6.28); ctx.fill();
      }
    });
    streakTex.wrapS = streakTex.wrapT = T.RepeatWrapping;
    const streakMat = new T.MeshBasicMaterial({
      map: streakTex, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false
    });
    K.plane(glassG, 9.4, 2.5, 0, F + 1.35, Z1 + 0.06, streakMat, {});
    K.storeStreak = streakMat;

    /* ---------- interior basic ---------- */
    // ceiling lights + bright soffit at the glass line
    for (let i = 0; i < 3; i++) {
      K.box(interior, 2.6, 0.045, 0.5, -2.7 + i * 2.7, 2.83, -3.0 - (i % 2) * 1.0, C.warmPanel, {});
      K.lightPool(interior, -2.7 + i * 2.7, -3.0, 1.5, 0xffe0b0, 0.2, F + 0.02);
    }
    K.box(interior, 9.2, 0.05, 0.09, 0, 2.66, Z1 - 0.12, C.warmPanel, {});
    K.box(interior, 8.7, 0.02, 3.4, 0, 2.845, -4.0, C.warmPanel, {});
    K.box(interior, 3.0, 0.05, 0.06, 0.5, 2.55, -1.9, C.warmPanel, {});
    // back wall wash strip above the fridges
    K.box(interior, 4.8, 0.05, 0.08, -2.0, 2.45, Z0 + 0.12, C.warmPanel, {});
    const l3 = new T.PointLight(0xfff2dc, 80, 6.5, 2); l3.position.set(0, 2.15, -1.85); interior.add(l3);
    const l1 = new T.PointLight(0xffe3bd, 170, 9.5, 2); l1.position.set(-2.4, 2.55, -3.3); interior.add(l1);
    const l2 = new T.PointLight(0xfff0d8, 140, 9, 2); l2.position.set(2.4, 2.5, -2.4); interior.add(l2);
    // floor guide stripe + arrows
    K.box(interior, 0.5, 0.012, 4.4, -0.2, F + 0.005, -3.4, C.green, { receive: false });
    K.signPlane(interior, 'レジ →', 1.2, 0.32, { x: 1.1, y: F + 0.02, z: -1.9, rx: -Math.PI / 2, size: 42, texW: 512, texH: 128, color: '#2f5f4a' });
    // wall clock
    K.cyl(interior, 0.22, 0.22, 0.05, 0.4, 2.15, Z0 + 0.24, C.white, { seg: 18, rx: Math.PI / 2 });
    K.cyl(interior, 0.18, 0.18, 0.06, 0.4, 2.15, Z0 + 0.26, C.cream, { seg: 18, rx: Math.PI / 2 });
    // security camera
    K.box(interior, 0.18, 0.12, 0.22, -4.4, 2.72, -2.2, C.white, {});
    // hanging aisle signs
    const aisleSigns = [
      ['おにぎり・お弁当', -2.8, -4.6, '#d47a3a'],
      ['飲料', -1.2, -6.2, '#3f6f9a'],
      ['お菓子', 0.5, -4.0, '#b84545']
    ];
    for (const [txt, x, z, color] of aisleSigns) {
      K.box(interior, 1.5, 0.32, 0.05, x, 2.3, z, K.basic(0xf6f0e2), {});
      K.signPlane(interior, txt, 1.4, 0.26, { x, y: 2.46, z: z + 0.03, size: 38, texW: 512, texH: 128, color, bg: null });
      K.cyl(interior, 0.012, 0.012, 0.24, x - 0.5, 2.62, z, C.steel, { seg: 4 });
      K.cyl(interior, 0.012, 0.012, 0.24, x + 0.5, 2.62, z, C.steel, { seg: 4 });
    }
    // posters inside
    const posters = [posterTexture(0), posterTexture(1), posterTexture(2), posterTexture(3)];
    for (let i = 0; i < 3; i++) {
      const p = new T.Mesh(new T.PlaneGeometry(0.72, 1.08), new T.MeshBasicMaterial({ map: posters[i], toneMapped: false }));
      p.position.set(X0 + 0.24, F + 1.6, -5.7 + i * 1.25);
      p.rotation.y = Math.PI / 2;
      interior.add(p);
    }
    // back room door
    K.box(interior, 1.0, 2.35, 0.08, -3.1, F, Z0 + 0.25, C.steel, { outline: true });
    K.box(interior, 0.7, 0.5, 0.02, -3.1, F + 1.45, Z0 + 0.3, C.fridgeGlass, {});
    K.box(interior, 0.08, 0.3, 0.06, -2.7, F + 1.0, Z0 + 0.32, C.darkSteel);
    // lockers
    for (let i = 0; i < 2; i++) {
      K.box(interior, 0.45, 1.8, 0.5, -4.85, F, Z0 + 0.95 + i * 0.55, C.steel, { outline: true });
      for (let j = 0; j < 3; j++) K.box(interior, 0.36, 0.02, 0.02, -4.85, F + 0.4 + j * 0.45, Z0 + 0.71 + i * 0.55, C.darkSteel);
    }
    // ATM on the east wall
    K.box(interior, 0.45, 1.5, 0.55, 4.5, F, -2.1, C.steel, { outline: true });
    K.box(interior, 0.34, 0.28, 0.02, 4.49, F + 1.1, -1.86, C.coolPanel, {});
    K.signPlane(interior, 'ATM', 0.34, 0.14, { x: 4.47, y: F + 1.0, z: -1.84, size: 32, texW: 256, texH: 96, color: '#e8f5ff' });
    // shopping baskets by the door
    for (let i = 0; i < 3; i++) K.box(interior, 0.46, 0.22, 0.36, -1.7, F + i * 0.2, -1.7, i % 2 ? C.red : C.blue, { outline: true });
    // interior mats
    K.plane(interior, 1.6, 0.9, 0, F + 0.012, -1.55, K.toon(0x556a5e), { rx: -Math.PI / 2 });

    /* ---------- gondola shelves + products ---------- */
    const snacks = [];
    const priceTags = [];
    const gondolaZ = [-5.6, -4.4, -3.2];
    for (let gi = 0; gi < gondolaZ.length; gi++) {
      const gz = gondolaZ[gi];
      K.box(shelvesG, 5.2, 0.08, 0.62, -1.8, F + 0.02, gz, C.darkSteel, { outline: true, cast: true });
      K.box(shelvesG, 5.2, 1.0, 0.08, -1.8, F + 0.1, gz, C.steel, { outline: true });
      for (let tier = 0; tier < 3; tier++) {
        const y = F + 0.3 + tier * 0.33;
        K.box(shelvesG, 5.1, 0.04, 0.58, -1.8, y, gz, C.steel);
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 0; i < 11; i++) {
            const x = -4.2 + i * 0.42;
            const c = productColors[(i + tier * 3 + gi + (side > 0 ? 2 : 0)) % productColors.length];
            snacks.push({
              x: x + (side > 0 ? 0.0 : 0.02), yBottom: y + 0.05, z: gz + side * 0.18,
              w: 0.22 + (i % 3) * 0.03, h: 0.14 + (i % 2) * 0.05, d: 0.18, color: c, ry: (i % 2) * 0.08
            });
          }
        }
        priceTags.push({ x: -1.8, yBottom: y + 0.02, z: gz + 0.31, w: 4.6, h: 0.05, d: 0.012, color: 0xf7f3e8 });
        K.box(shelvesG, 4.9, 0.02, 0.02, -1.8, y + 0.03, gz + 0.32, C.warmPanel, {});
      }
    }
    // shelf ends / side boards
    for (const gz of gondolaZ) {
      K.box(shelvesG, 0.07, 1.0, 0.64, -4.4, F + 0.1, gz, C.steel);
      K.box(shelvesG, 0.07, 1.0, 0.64, 0.8, F + 0.1, gz, C.steel);
    }

    /* ---------- fridges along the back ---------- */
    // open fridge bank: glowing back wall + frames + bottles behind glass
    K.box(fridgeG, 5.4, 2.25, 0.1, -2.0, F, Z0 + 0.24, C.darkSteel, { outline: true, cast: true });
    K.box(fridgeG, 5.0, 1.9, 0.04, -2.0, F + 0.2, Z0 + 0.3, C.coolPanel, {});
    K.box(fridgeG, 5.2, 0.08, 0.62, -2.0, F + 2.2, Z0 + 0.54, C.darkSteel);
    K.box(fridgeG, 5.2, 0.08, 0.62, -2.0, F, Z0 + 0.54, C.darkSteel);
    K.box(fridgeG, 0.1, 2.25, 0.62, -4.65, F, Z0 + 0.54, C.darkSteel);
    K.box(fridgeG, 0.1, 2.25, 0.62, 0.65, F, Z0 + 0.54, C.darkSteel);
    for (let d = 0; d < 4; d++) {
      const dx = -4.1 + d * 1.2;
      K.box(fridgeG, 1.08, 1.98, 0.03, dx, F + 0.18, Z0 + 0.82, C.fridgeGlass, {});
      K.box(fridgeG, 0.05, 1.9, 0.08, dx - 0.54, F + 0.2, Z0 + 0.84, C.steel);
      K.box(fridgeG, 0.05, 1.9, 0.08, dx + 0.54, F + 0.2, Z0 + 0.84, C.steel);
      K.box(fridgeG, 0.5, 0.04, 0.06, dx, F + 1.95, Z0 + 0.86, C.coolPanel);
    }
    // fridge shelves + bottles
    const bottles = [];
    for (let d = 0; d < 4; d++) {
      const dx = -4.1 + d * 1.2;
      for (let tier = 0; tier < 4; tier++) {
        const y = F + 0.3 + tier * 0.4;
        K.box(fridgeG, 1.0, 0.03, 0.48, dx, y, Z0 + 0.5, C.steel);
        for (let i = 0; i < 5; i++) {
          bottles.push({
            x: dx - 0.4 + i * 0.2, yBottom: y + 0.04, z: Z0 + 0.5,
            w: 0.11, h: 0.24 + (i % 3) * 0.03, d: 0.11,
            color: productColors[(d + tier + i) % productColors.length]
          });
        }
      }
    }

    /* ---------- open cooler: bento & onigiri ---------- */
    K.box(fridgeG, 1.0, 0.7, 2.6, 4.15, F, -5.0, C.white, { outline: true, cast: true });
    K.box(fridgeG, 0.9, 0.04, 2.4, 4.15, F + 0.55, -5.0, C.coolPanel, {});
    K.box(fridgeG, 1.0, 0.5, 0.08, 4.15, F + 0.7, -6.25, C.white);
    K.box(fridgeG, 1.0, 0.5, 0.08, 4.15, F + 0.7, -3.75, C.white);
    const bento = [];
    for (let i = 0; i < 5; i++) {
      bento.push({ x: 4.15, yBottom: F + 0.78, z: -6.0 + i * 0.42, w: 0.62, h: 0.08, d: 0.3, color: 0xf6f1e5 });
      bento.push({ x: 4.15, yBottom: F + 0.86, z: -6.0 + i * 0.42, w: 0.5, h: 0.04, d: 0.24, color: [0xe8b06a, 0xd9d06a, 0xe08a6a, 0xb8d08a, 0xe0c060][i] });
    }
    // onigiri on the middle shelf
    for (let i = 0; i < 4; i++) {
      bento.push({ x: 4.15, yBottom: F + 1.1, z: -5.6 + i * 0.42, w: 0.18, h: 0.13, d: 0.22, color: 0xf7f4ea });
      bento.push({ x: 4.15, yBottom: F + 1.1, z: -5.6 + i * 0.42 + 0.1, w: 0.19, h: 0.05, d: 0.05, color: 0x1f2a24 });
    }

    /* ---------- magazines near the front ---------- */
    const magG = K.group(shelvesG, 0, 0, 0, 'magazines');
    for (let tier = 0; tier < 3; tier++) {
      K.box(magG, 1.9, 0.05, 0.5 - tier * 0.08, -3.8, F + 0.15 + tier * 0.35, -1.95 + tier * 0.06, C.wood, { outline: true });
      for (let i = 0; i < 4; i++) {
        const tex = magazineTexture((tier + i) % 6);
        const p = new T.Mesh(new T.PlaneGeometry(0.34, 0.48), new T.MeshBasicMaterial({ map: tex, toneMapped: false }));
        p.position.set(-4.5 + i * 0.44, F + 0.45 + tier * 0.35, -1.88 + tier * 0.06);
        p.rotation.x = -0.16;
        magG.add(p);
      }
    }

    /* ---------- counter / register / coffee / oden ---------- */
    K.box(counterG, 2.9, 1.0, 0.85, 2.8, F, -2.1, C.wood, { outline: true, cast: true });
    K.box(counterG, 2.95, 0.06, 0.9, 2.8, F + 1.0, -2.1, C.white, { outline: true });
    K.box(counterG, 0.85, 1.0, 1.4, 3.85, F, -2.7, C.wood, { outline: true, cast: true });
    K.box(counterG, 0.9, 0.06, 1.45, 3.85, F + 1.0, -2.7, C.white);
    // POS
    K.box(counterG, 0.5, 0.08, 0.4, 2.4, F + 1.02, -2.1, C.darkSteel);
    K.box(counterG, 0.08, 0.25, 0.08, 2.4, F + 1.1, -2.16, C.darkSteel);
    const pos = new T.Mesh(new T.PlaneGeometry(0.46, 0.32), new T.MeshBasicMaterial({ map: posScreenTexture(), toneMapped: false }));
    pos.position.set(2.4, F + 1.3, -1.88); pos.rotation.y = 0.18;
    counterG.add(pos);
    K.box(counterG, 0.26, 0.06, 0.2, 2.0, F + 1.02, -1.9, C.darkSteel);
    K.box(counterG, 0.14, 0.05, 0.12, 2.95, F + 1.02, -1.86, C.steel);
    // coffee machine
    K.box(counterG, 0.62, 0.8, 0.5, 3.7, F + 1.06, -2.25, C.darkSteel, { outline: true });
    K.box(counterG, 0.4, 0.16, 0.03, 3.7, F + 1.6, -2.0, C.coolPanel, {});
    K.signPlane(counterG, 'COFFEE', 0.42, 0.13, { x: 3.7, y: F + 1.5, z: -1.985, size: 26, texW: 256, texH: 96, color: '#f7e8cf' });
    for (let i = 0; i < 3; i++) K.cyl(counterG, 0.055, 0.045, 0.09, 3.95 + i * 0.09, F + 1.06, -1.92, C.white, { seg: 8 });
    // oden steamer (near the window)
    K.box(counterG, 1.15, 0.18, 0.5, 2.45, F + 1.0, -1.72, C.steel, { outline: true });
    K.box(counterG, 1.0, 0.08, 0.4, 2.45, F + 1.16, -1.72, C.warmPanel, {});
    for (let i = 0; i < 6; i++) {
      K.box(counterG, 0.12, 0.04, 0.22, 2.1 + i * 0.16, F + 1.2, -1.72, K.toon([0xd9a05a, 0xf2e3b8, 0xc07a4a][i % 3], { flatShading: true }), {});
    }
    K.signPlane(counterG, 'おでん', 0.85, 0.24, { x: 2.45, y: F + 1.36, z: -1.99, size: 36, texW: 512, texH: 128, color: '#ffd6a0' });
    // hot snack case
    K.box(counterG, 0.8, 0.55, 0.42, 1.45, F + 1.0, -2.15, C.coolPanel, { outline: true });
    for (let i = 0; i < 4; i++) K.box(counterG, 0.14, 0.1, 0.14, 1.22 + i * 0.16, F + 1.16, -2.15, K.toon([0xe0a060, 0xd8c070, 0xe08a5a, 0xe8c080][i], { flatShading: true }), {});
    // receipt printer + card terminal
    K.box(counterG, 0.25, 0.18, 0.2, 1.25, F + 1.02, -2.0, C.white);
    // ice cream freezer
    K.box(counterG, 1.0, 0.9, 0.7, 3.9, F, -4.9, C.white, { outline: true, cast: true });
    K.box(counterG, 0.9, 0.05, 0.6, 3.9, F + 0.88, -4.9, C.fridgeGlass, {});
    for (let i = 0; i < 4; i++) K.box(counterG, 0.16, 0.14, 0.1, 3.55 + i * 0.18, F + 0.92, -4.9, K.toon([0xf2d9c8, 0xd8e8c8, 0xf2c8d8, 0xe8d8a8][i], { flatShading: true }), {});
    // cigarette rack behind the counter
    K.box(counterG, 0.16, 0.9, 1.4, 4.45, F + 1.35, -3.2, C.darkSteel, { outline: true });
    const cigs = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      cigs.push({ x: 4.36, yBottom: F + 1.45 + r * 0.19, z: -3.82 + c * 0.2, w: 0.06, h: 0.13, d: 0.1, color: productColors[(r + c) % productColors.length] });
    }
    // small "OPEN" hanging sign
    K.signPlane(counterG, 'OPEN · 24H', 0.9, 0.25, { x: 2.6, y: F + 2.25, z: -2.0, size: 30, texW: 512, texH: 128, color: '#9fe8c8', glow: 'rgba(80,255,170,.5)' });

    /* ---------- instanced products ---------- */
    K.instancedBoxes(shelvesG, snacks, { cast: false });
    K.instancedBoxes(fridgeG, bottles, { cast: false });
    K.instancedBoxes(fridgeG, bento, { cast: false });
    K.instancedBoxes(shelvesG, priceTags, { cast: false });
    K.instancedBoxes(counterG, cigs, { cast: false });

    /* ---------- awning + sign ---------- */
    const awning = K.box(signG, 9.8, 0.14, 1.1, 0, 2.52, Z1 + 0.58, C.wallDark, { outline: true, cast: true });
    K.box(signG, 9.4, 0.03, 0.9, 0, 2.5, Z1 + 0.6, C.warmPanel, {});
    for (let i = 0; i < 4; i++) K.box(signG, 0.06, 2.3, 0.06, -4.2 + i * 2.8, 0.25, Z1 + 1.08, C.trim);
    // sign light box
    K.box(signG, 8.2, 1.25, 0.3, 0, 3.15, Z1 - 0.15, C.white, { outline: true });
    const signFace = new T.MeshBasicMaterial({ map: signTexture(), toneMapped: false });
    const sf = new T.Mesh(new T.PlaneGeometry(7.9, 1.12), signFace);
    sf.position.set(0, 3.78, Z1 + 0.015);
    signG.add(sf);
    const signGlow = new T.Sprite(new T.SpriteMaterial({
      map: K.glowTexture(), color: 0xfff0cf, transparent: true, opacity: 0.28,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    signGlow.position.set(0, 3.75, Z1 + 0.2);
    signGlow.scale.set(10, 2.8, 1);
    signG.add(signGlow);
    // vertical sign at the corner
    K.box(signG, 0.5, 2.0, 0.18, X1 - 0.15, 2.0, Z1 - 0.12, C.white, { outline: true });
    const vs = new T.Mesh(new T.PlaneGeometry(0.38, 1.8), new T.MeshBasicMaterial({ map: verticalSignTexture(), toneMapped: false }));
    vs.position.set(X1 - 0.15, 3.0, Z1 - 0.02);
    signG.add(vs);
    // window posters
    const postFront = [posterTexture(0), posterTexture(1), posterTexture(2), posterTexture(3)];
    const pPos = [[-4.4, 1.5, 0.6], [-3.4, 1.5, 0.6], [3.6, 1.5, 0.6], [4.3, 1.5, 0.55]];
    for (let i = 0; i < 4; i++) {
      const p = new T.Mesh(new T.PlaneGeometry(pPos[i][2], pPos[i][2] * 1.5), new T.MeshBasicMaterial({ map: postFront[i], toneMapped: false }));
      p.position.set(pPos[i][0], pPos[i][1], Z1 + 0.02);
      signG.add(p);
    }
    // entrance step / mat outside (on the ground piece)
    K.box(signG, 3.0, 0.08, 0.8, 0, 0.02, Z1 + 0.55, C.kick, { outline: true });

    /* ---------- roof equipment ---------- */
    K.box(roofG, 1.6, 0.8, 1.1, -2.8, 3.22, -4.0, C.metal, { outline: true });
    K.cyl(roofG, 0.32, 0.32, 0.06, -2.8, 3.8, -3.45, C.darkSteel, { seg: 16, rx: Math.PI / 2 });
    for (let i = 0; i < 3; i++) K.cyl(roofG, 0.24, 0.24, 0.3, 1.0 + i * 0.7, 3.3, -4.6, C.steel, { seg: 12 });
    K.cyl(roofG, 0.06, 0.06, 2.2, 3.9, 3.25, -5.9, C.darkSteel, { seg: 8 });
    K.box(roofG, 0.6, 0.4, 0.4, 4.0, 3.3, -6.2, C.darkSteel);

    /* ---------- steam anchors ---------- */
    K.store = {
      group: K.scene,
      shell, glassG, interior, shelvesG, fridgeG, counterG, signG, roofG,
      doorL, doorR,
      signGlow, signGlowMat: signGlow.material,
      signFace, vertical: vs,
      lights: [l1, l2, l3],
      steam: [
        new T.Vector3(2.45, F + 1.3, -1.72),
        new T.Vector3(3.7, F + 1.7, -2.2)
      ],
      awningEdge: new T.Vector3(0, 2.5, Z1 + 1.12),
      interiorCenter: new T.Vector3(0, 1.5, -4.0),
      doorOpen: 0,
      doorTarget: 0,
      doorTimer: 6
    };

    // pieces
    K.addPiece(shell, 0.7, { drop: 4.2 });
    K.addPiece(glassG, 0.85, { drop: 4.0 });
    K.addPiece(interior, 0.95, { drop: 4.0 });
    K.addPiece(shelvesG, 1.1, { drop: 3.8 });
    K.addPiece(fridgeG, 1.2, { drop: 3.8 });
    K.addPiece(counterG, 1.3, { drop: 3.6 });
    K.addPiece(signG, 1.4, { drop: 4.2 });
    K.addPiece(roofG, 1.5, { drop: 4.2 });

    console.log('[KONBINI] store ready');
  };
})();
