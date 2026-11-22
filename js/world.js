/* =========================================================
   PRUN PLAY STATION — terrain, coast, road, tunnel
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T, S = P.scene;

  const M = {
    rock1: P.flat(0x26282e, 0.95),
    rock2: P.flat(0x35383e, 0.95),
    earth: P.flat(0x4a4036, 0.98),
    strata: P.flat(0x565148, 0.98),
    grass: P.flat(0x6f8f57, 0.94),
    concrete: P.std(0x6b7076, 0.85, 0.03),
    concreteDark: P.std(0x4a4f55, 0.82, 0.05),
    concreteLight: P.std(0x83888d, 0.8, 0.03),
    asphalt: new T.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.92, metalness: 0.06 }),
    paint: P.std(0xd9dde0, 0.6, 0.05),
    paintY: P.std(0xd8b23f, 0.65, 0.05),
    sea: new T.MeshStandardMaterial({ color: 0x2a7fa0, roughness: 0.22, metalness: 0.3, flatShading: true, transparent: true, opacity: 0.96 }),
    sand: P.flat(0xd8c79c, 0.95),
    palmTrunk: P.flat(0x6b5236, 0.9),
    palmLeaf: new T.MeshStandardMaterial({ color: 0x4f8f55, roughness: 0.82, metalness: 0.02, flatShading: true, side: T.DoubleSide }),
    pine: new T.MeshStandardMaterial({ color: 0x3f6b4f, roughness: 0.85, flatShading: true }),
    foliage: new T.MeshStandardMaterial({ color: 0xefa8c4, roughness: 0.88, flatShading: true }),
    foliage2: new T.MeshStandardMaterial({ color: 0xf7c3d6, roughness: 0.88, flatShading: true }),
    pineSnow: new T.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.75, flatShading: true, transparent: true, opacity: 0 }),
    wood: P.std(0x5b4632, 0.85),
    steel: P.std(0x6a7078, 0.55, 0.55),
    darkSteel: P.std(0x2e3339, 0.6, 0.5),
    glass: P.glassMat,
    red: P.std(0xb8393f, 0.6, 0.15),
    vending: P.std(0x8f2f35, 0.55, 0.2),
    rockHill: P.flat(0x595552, 0.96),
    rockHill2: P.flat(0x6a645e, 0.96),
    tunnelDark: new T.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 1, metalness: 0 }),
    caution: P.std(0xc9a43c, 0.7, 0.05)
  };
  P.worldMats = M;

  function groundBox(parent, w, h, d, x, yTop, z, mat, receive) {
    return P.box(parent, w, h, d, x, yTop - h, z, mat, { receive: receive !== false });
  }

  /* =====================  BASE · geologic strata  ===================== */
  const baseG = P.group(S, 0, 0, 0, 'base');
  {
    const layers = [
      { y: -3.2, h: 0.9, w: 35.8, d: 26.8, m: M.rock1 },
      { y: -2.3, h: 0.8, w: 35.72, d: 26.72, m: M.rock2 },
      { y: -1.5, h: 0.75, w: 35.64, d: 26.64, m: M.earth },
      { y: -0.75, h: 0.55, w: 35.55, d: 26.55, m: M.strata }
    ];
    for (const l of layers) P.box(baseG, l.w, l.h, l.d, 0, l.y, 0, l.m, { receive: true });
    for (let i = 0; i < 10; i++) {
      const y = -3.05 + P.rand() * 2.3;
      const t = 0.02 + P.rand() * 0.025;
      P.box(baseG, 35.86, t, 26.86, 0, y, 0, i % 3 === 0 ? M.earth : M.rock1, { receive: false });
    }
    groundBox(baseG, 35.8, 0.14, 26.8, 0, 0.02, 0, M.grass);
  }

  /* =====================  SEA · beach · promenade  ===================== */
  const seaG = P.group(S, 0, 0, 0, 'sea');
  {
    const geo = new T.PlaneGeometry(35.8, 4.05, 56, 10);
    geo.rotateX(-Math.PI / 2);
    const water = new T.Mesh(geo, M.sea);
    water.position.set(0, 0.07, -11.4);
    water.receiveShadow = true;
    seaG.add(water);
    P.seaMesh = water;
    P.seaBase = Float32Array.from(geo.attributes.position.array);

    P.foam = [];
    for (let i = 0; i < 4; i++) {
      const mat = new T.MeshBasicMaterial({ color: 0xe9f4fa, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
      const foam = P.box(seaG, 35.4 - i * 0.6, 0.015, 0.1 + i * 0.04, 0, 0.075, -9.52 - i * 0.22, mat, { receive: false });
      foam.castShadow = false;
      P.foam.push({ mesh: foam, mat: mat, phase: i * 1.7 });
    }
    P.box(seaG, 35.8, 0.3, 0.22, 0, 0.0, -9.36, M.concreteDark, { cast: true });
    groundBox(seaG, 35.8, 0.06, 1.1, 0, 0.05, -8.8, M.sand);
    groundBox(seaG, 35.8, 0.08, 1.75, 0, 0.06, -7.36, M.concrete);
    for (let x = -17; x <= 17; x += 2.2) {
      P.box(seaG, 0.02, 0.005, 1.75, x, 0.141, -7.36, M.concreteDark, { receive: false });
    }
    for (let i = 0; i < 9; i++) {
      const x = P.rr(-17, 17), z = P.rr(-9.2, -8.35), r = P.rr(0.12, 0.3);
      const rock = P.ico(seaG, r, x, 0.08, z, M.rockHill2, { cast: true });
      rock.scale.y *= 0.6;
    }
  }

  /* =====================  PALMS  ===================== */
  const palmsG = P.group(S, 0, 0, 0, 'palms');
  const palmLeaves = [];
  function makePalm(x, z, scale, lean) {
    const g = P.group(palmsG, x, 0.02, z);
    g.scale.setScalar(scale);
    let px = 0, py = 0;
    for (let i = 0; i < 6; i++) {
      const h = 0.82 - i * 0.03;
      const seg = P.cyl(g, 0.13 - i * 0.008, 0.155 - i * 0.008, h, px, py, 0, M.palmTrunk, { seg: 7, cast: true });
      seg.rotation.z = lean * 0.035;
      px += Math.sin(lean * 0.1) * 0.09 + lean * 0.012;
      py += h * 0.98;
    }
    const crown = P.group(g, px, py, 0);
    for (let i = 0; i < 8; i++) {
      const pivot = P.group(crown, 0, 0, 0);
      pivot.rotation.y = (i / 8) * Math.PI * 2 + P.rr(-0.15, 0.15);
      const geo = new T.ConeGeometry(0.34, 2.9, 5, 1, true);
      geo.translate(0, 1.45, 0);
      const frond = new T.Mesh(geo, M.palmLeaf);
      frond.rotation.z = -(Math.PI / 2 - 0.42 - P.rand() * 0.18);
      frond.castShadow = true;
      pivot.add(frond);
      palmLeaves.push({ mesh: frond, baseZ: frond.rotation.z, phase: P.rand() * 6.28 });
    }
    for (let i = 0; i < 3; i++) {
      P.ico(crown, 0.12, Math.cos(i * 2.1) * 0.18, -0.05, Math.sin(i * 2.1) * 0.18, M.palmTrunk);
    }
  }
  [
    [-15.6, -8.15, 1.05, 1.0], [-11.2, -7.95, 0.92, -0.7], [-6.6, -8.1, 1.0, 0.4],
    [-2.2, -8.0, 0.88, -1.1], [2.4, -8.12, 1.04, 0.8], [7.0, -7.98, 0.94, -0.4],
    [11.4, -8.1, 1.0, 1.2], [15.8, -7.95, 0.86, -0.9]
  ].forEach(([x, z, s, lean]) => makePalm(x, z, s, lean));

  // flowering broadleaf trees (spring sakura / summer green / autumn orange / winter bare)
  function makeBroadleaf(x, z, scale, hue) {
    const g = P.group(palmsG, x, 0.02, z);
    g.scale.setScalar(scale);
    P.cyl(g, 0.1, 0.16, 2.3, 0, 0, 0, M.palmTrunk, { seg: 7, cast: true });
    const crown = P.group(g, 0, 2.2, 0);
    const rnd2 = P.mulberry32(Math.floor(x * 31 + z * 17 + 99));
    const blobs = [
      [0, 0.9, 0, 1.15], [-0.85, 0.55, 0.2, 0.85], [0.8, 0.6, -0.2, 0.9],
      [0.15, 0.4, 0.85, 0.8], [-0.2, 0.3, -0.9, 0.75], [0.4, 1.35, 0.25, 0.7]
    ];
    for (const [bx, by, bz, r] of blobs) {
      const m = rnd2() > 0.5 ? M.foliage : M.foliage2;
      P.ico(crown, r, bx, by, bz, m, { cast: true, rz: r * 0.9 });
    }
  }
  makeBroadleaf(-0.9, -8.7, 1.15);
  makeBroadleaf(5.2, -8.75, 1.0);
  makeBroadleaf(13.4, 11.5, 1.05);
  makeBroadleaf(16.6, 11.0, 0.9);

  /* =====================  ROAD · sidewalk  ===================== */
  const roadG = P.group(S, 0, 0, 0, 'road');
  {
    groundBox(roadG, 35.8, 0.16, 1.05, 0, 0.14, 6.72, M.concreteLight);   // sidewalk
    P.box(roadG, 35.8, 0.12, 0.12, 0, 0.14, 7.24, M.concreteDark);        // curb
    groundBox(roadG, 35.8, 0.05, 3.6, 0, 0.03, 9.0, M.asphalt);
    for (let x = -17; x <= 17; x += 3.4) {
      P.box(roadG, 1.7, 0.012, 0.08, x, 0.036, 9.0, M.paint, { receive: false });
    }
    P.box(roadG, 35.8, 0.012, 0.07, 0, 0.036, 7.42, M.paint, { receive: false });
    P.box(roadG, 35.8, 0.012, 0.07, 0, 0.036, 10.58, M.paint, { receive: false });
    for (let i = 0; i < 6; i++) {
      P.box(roadG, 0.5, 0.012, 2.9, -10.4 + i * 0.95, 0.036, 9.0, M.paint, { receive: false });
    }
    for (let x = -17; x < 17; x += 1.2) {
      P.box(roadG, 0.5, 0.01, 0.22, x, 0.145, 6.28, M.caution, { receive: false });
    }
    // puddles attach here in effects.js
    P.roadGroup = roadG;
  }

  /* =====================  FORECOURT  ===================== */
  const forecourtG = P.group(S, 0, 0, 0, 'forecourt');
  {
    groundBox(forecourtG, 30.6, 0.05, 5.25, -1.4, 0.05, 3.75, M.concreteDark);
    for (let i = 0; i < 3; i++) {
      const x = -6.4 + i * 3.1;
      P.box(forecourtG, 0.07, 0.01, 4.2, x, 0.056, 4.05, M.paint, { receive: false });
    }
    P.box(forecourtG, 9.4, 0.01, 0.07, -3.25, 0.056, 6.1, M.paint, { receive: false });
    groundBox(forecourtG, 4.4, 0.055, 5.4, -8.3, 0.06, 3.7, M.concreteLight);
    for (let z = 1.2; z < 6.2; z += 0.9) {
      P.box(forecourtG, 4.4, 0.008, 0.05, -8.3, 0.061, z, M.concreteDark, { receive: false });
    }
    function planter(x, z, w, d) {
      P.box(forecourtG, w, 0.5, d, x, 0.05, z, M.concreteDark, { cast: true });
      P.box(forecourtG, w - 0.16, 0.05, d - 0.16, x, 0.55, z, M.earth, { receive: false });
      for (let i = 0; i < 3; i++) {
        P.ico(forecourtG, P.rr(0.22, 0.34), x + P.rr(-w / 3, w / 3), 0.72, z + P.rr(-d / 3, d / 3), P.flat(0x4c6b45, 0.9), { cast: true });
      }
    }
    planter(-13.9, 4.4, 1.5, 1.0);
    planter(8.8, 3.4, 1.4, 1.0);
    planter(-1.2, 5.4, 1.2, 0.9);
    for (let i = 0; i < 4; i++) {
      P.cyl(forecourtG, 0.09, 0.1, 0.75, -10.3, 0.05, 1.6 + i * 1.2, M.darkSteel, { seg: 8, cast: true });
      P.cyl(forecourtG, 0.11, 0.11, 0.06, -10.3, 0.8, 1.6 + i * 1.2, M.caution, { seg: 8 });
    }
    // painted facility icons
    P.box(forecourtG, 0.9, 0.008, 0.9, -4.4, 0.057, 2.2, M.paintY, { receive: false });
    P.box(forecourtG, 0.6, 0.008, 0.6, -4.55, 0.06, 2.35, M.concreteDark, { receive: false });
  }

  /* =====================  REST AREA (east)  ===================== */
  const restG = P.group(S, 0, 0, 0, 'rest');
  {
    groundBox(restG, 6.8, 0.1, 2.2, 14.0, 0.06, 12.15, M.wood);
    for (let x = 10.7; x < 17.3; x += 0.42) {
      P.box(restG, 0.03, 0.006, 2.2, x, 0.161, 12.15, M.darkSteel, { receive: false });
    }
    const bench = P.group(restG, 15.6, 0.16, 12.55);
    for (let i = 0; i < 4; i++) P.box(bench, 2.6, 0.08, 0.16, 0, 0.5, -0.24 + i * 0.17, M.wood, { cast: true });
    for (let i = 0; i < 3; i++) P.box(bench, 2.6, 0.08, 0.14, 0, 0.85 + i * 0.18, 0.4, M.wood, { cast: true });
    P.box(bench, 0.09, 0.5, 0.5, -1.05, 0, 0.0, M.darkSteel, { cast: true });
    P.box(bench, 0.09, 0.5, 0.5, 1.05, 0, 0.0, M.darkSteel, { cast: true });
    P.box(bench, 0.09, 0.75, 0.09, -1.05, 0.4, 0.45, M.darkSteel, { cast: true });
    P.box(bench, 0.09, 0.75, 0.09, 1.05, 0.4, 0.45, M.darkSteel, { cast: true });
    P.cyl(restG, 0.55, 0.55, 0.06, 12.6, 0.85, 12.25, M.wood, { seg: 12, cast: true });
    P.cyl(restG, 0.06, 0.08, 0.78, 12.6, 0.16, 12.25, M.darkSteel, { seg: 8 });
    P.cyl(restG, 0.22, 0.22, 0.06, 11.7, 0.52, 11.55, M.wood, { seg: 10 });
    P.cyl(restG, 0.22, 0.22, 0.06, 13.5, 0.52, 12.85, M.wood, { seg: 10 });
    P.cyl(restG, 0.04, 0.04, 0.46, 11.7, 0.06, 11.55, M.darkSteel, { seg: 6 });
    P.cyl(restG, 0.04, 0.04, 0.46, 13.5, 0.06, 12.85, M.darkSteel, { seg: 6 });
    P.box(restG, 1.3, 0.55, 1.3, 10.9, 0.06, 12.3, M.concreteDark, { cast: true });
    P.box(restG, 1.14, 0.04, 1.14, 10.9, 0.61, 12.3, M.earth);
    const pine = P.group(restG, 10.9, 0.62, 12.3);
    P.cyl(pine, 0.12, 0.17, 0.8, 0, 0, 0, M.palmTrunk, { seg: 7, cast: true });
    for (let i = 0; i < 3; i++) {
      P.cyl(pine, 0.05, 1.15 - i * 0.28, 1.25, 0, 0.55 + i * 0.72, 0, M.pine, { seg: 8, cast: true });
    }
    P.pineSnowCaps = [];
    for (let i = 0; i < 3; i++) {
      const cap = P.cyl(pine, 0.04, 1.0 - i * 0.26, 0.22, 0, 1.35 + i * 0.72, 0, M.pineSnow, { seg: 8 });
      cap.castShadow = false;
      P.pineSnowCaps.push(cap);
    }
    P.cyl(restG, 0.26, 0.22, 0.8, 17.0, 0.16, 12.7, M.darkSteel, { seg: 10, cast: true });
    P.cyl(restG, 0.28, 0.28, 0.05, 17.0, 0.96, 12.7, M.steel, { seg: 10 });
  }


  /* =====================  STREET LAMPS  ===================== */
  const lampsG = P.group(S, 0, 0, 0, 'lamps');
  const lampHeads = [];
  P.lampLights = [];
  P.lampPools = [];
  [-14.2, -7.6, 0.8, 8.6].forEach((x, i) => {
    const z = 6.95;
    P.cyl(lampsG, 0.07, 0.09, 4.6, x, 0.14, z, M.darkSteel, { seg: 8, cast: true });
    P.box(lampsG, 0.08, 0.08, 1.1, x, 4.5, z + 0.5, M.darkSteel, { cast: true });
    const headMat = new T.MeshStandardMaterial({
      color: 0x2a2f36, emissive: 0xffc98a, emissiveIntensity: 0.0, roughness: 0.5, metalness: 0.45
    });
    P.box(lampsG, 0.34, 0.12, 0.62, x, 4.4, z + 1.05, headMat, { cast: false });
    P.lampPools.push(P.lightPool(lampsG, x, z + 1.05, 2.6, 0xffc07a, 0.0, 0.158));
    lampHeads.push({ mat: headMat });
    if (i === 1 || i === 2) {
      const pl = new T.PointLight(0xffc27a, 0, 11, 2);
      pl.position.set(x, 4.25, z + 1.05);
      lampsG.add(pl);
      P.lampLights.push(pl);
    }
  });
  P.lampHeads = lampHeads;

  /* =====================  VENDING MACHINE  ===================== */
  const vendingG = P.group(S, 0, 0, 0, 'vending');
  {
    const x = 12.15, z = 12.45;
    P.box(vendingG, 1.15, 1.95, 0.8, x, 0.16, z, M.vending, { cast: true });
    P.box(vendingG, 1.2, 0.08, 0.85, x, 2.11, z, M.darkSteel);
    const tex = P.canvasTexture(256, 512, (ctx, w, h) => {
      ctx.fillStyle = '#160c10'; ctx.fillRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255,90,90,.20)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1218'; ctx.fillRect(14, 14, w - 28, h - 120);
      const cols = ['#ff6b6b', '#ffd166', '#6bd3ff', '#a98bff', '#7dffb2', '#ff9ad5'];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        ctx.fillStyle = cols[(r * 4 + c) % cols.length];
        ctx.beginPath(); ctx.arc(38 + c * 60, 52 + r * 66, 15, 0, 6.28); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.14)';
        ctx.fillRect(24 + c * 60, 74 + r * 66, 30, 7);
      }
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.font = '600 18px -apple-system,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRUN DRINKS', w / 2, h - 54);
      ctx.fillStyle = '#5fe0ff';
      ctx.fillRect(18, h - 40, w - 36, 4);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, 0); ctx.lineTo(0, 260); ctx.closePath(); ctx.fill();
    });
    const mat = new T.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.55,
      roughness: 0.35, metalness: 0.1
    });
    P.plane(vendingG, 0.98, 1.72, x, 1.16, z - 0.405, mat, { ry: Math.PI, receive: true });
    P.vendingMat = mat;
    P.box(vendingG, 0.7, 0.12, 0.06, x, 0.36, z - 0.41, M.darkSteel);
    P.vendingPool = P.lightPool(vendingG, x, z - 0.9, 1.3, 0xff6b78, 0.0, 0.162);
  }

  /* =====================  TUNNEL HILL (west)  ===================== */
  const tunnelG = P.group(S, 0, 0, 0, 'tunnel');
  {
    const rocks = [
      // south of the opening (z < 6)
      [-14.8, 1.4, 2.6, 6.0, 3.8, 2.4],
      [-17.0, 3.0, 3.0, 5.4, 3.0, 1.6],
      [-12.8, 4.0, 2.8, 5.2, 2.6, 1.4],
      [-16.6, 4.5, 2.6, 4.4, 2.2, 0.9],
      [-13.8, 4.9, 2.4, 3.6, 2.0, 0.8],
      // north of the opening (z > 12)
      [-14.8, 12.9, 2.8, 5.2, 3.2, 0.6],
      [-17.0, 12.9, 2.6, 4.4, 2.2, 0.5]
    ];
    for (const [x, z, y, sy, sx, sz] of rocks) {
      const r = P.ico(tunnelG, 1, x, y, z, P.rand() > 0.5 ? M.rockHill : M.rockHill2, { cast: true, rot: P.rand() * 6.28 });
      r.scale.set(sx, sy, sz);
    }
    // cap over the portal so no sky leaks through
    const cap = P.ico(tunnelG, 1, -15.0, 10.0, 9.0, M.rockHill2, { cast: true });
    cap.scale.set(3.4, 1.2, 3.2);
    // rock bridge above the portal
    const bridge = P.ico(tunnelG, 1, -15.0, 12.3, 9.0, M.rockHill, { cast: true });
    bridge.scale.set(3.2, 1.6, 4.3);
    // portal frame (opens to +x), sized for the machine
    P.box(tunnelG, 0.65, 8.8, 0.6, -12.0, 0.02, 6.15, M.concreteDark, { cast: true });
    P.box(tunnelG, 0.65, 8.8, 0.6, -12.0, 0.02, 11.85, M.concreteDark, { cast: true });
    P.box(tunnelG, 0.75, 0.8, 6.4, -12.0, 8.8, 9.0, M.concreteDark, { cast: true });
    // lighter portal trim so the opening reads at a glance
    P.box(tunnelG, 0.5, 0.2, 6.7, -11.85, 8.68, 9.0, M.concreteLight, { cast: true });
    P.box(tunnelG, 0.5, 8.7, 0.2, -11.85, 0.02, 6.05, M.concreteLight, { cast: true });
    P.box(tunnelG, 0.5, 8.7, 0.2, -11.85, 0.02, 11.95, M.concreteLight, { cast: true });
    // small warm lamps flanking the portal
    for (const side of [-1, 1]) {
      P.ico(tunnelG, 0.08, -11.6, 8.82, 9.0 + side * 2.5, P.emissive(0xffc98a, 1.4));
    }
    // dark interior shell
    P.box(tunnelG, 6.0, 0.06, 5.9, -15.0, 0.03, 9.0, M.tunnelDark, { receive: false });
    P.box(tunnelG, 6.0, 8.7, 0.12, -15.0, 0.06, 6.06, M.tunnelDark, { receive: false });
    P.box(tunnelG, 6.0, 8.7, 0.12, -15.0, 0.06, 11.94, M.tunnelDark, { receive: false });
    P.box(tunnelG, 6.0, 0.12, 5.9, -15.0, 8.64, 9.0, M.tunnelDark, { receive: false });
    // red warning strip
    P.tunnelRedMat = new T.MeshStandardMaterial({ color: 0x3a0d12, emissive: 0xff2438, emissiveIntensity: 0.0, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      P.box(tunnelG, 0.06, 0.1, 0.5, -12.35 - i * 1.05, 8.45, 6.16, P.tunnelRedMat, { receive: false });
    }
    P.box(tunnelG, 0.06, 0.1, 5.4, -12.5, 0.2, 9.0, P.tunnelRedMat, { receive: false });
    // red light for the event
    const red = new T.SpotLight(0xff2233, 0, 26, 0.5, 0.55, 2);
    red.position.set(-15.6, 4.2, 9.0);
    red.target.position.set(-6, 2, 9.0);
    tunnelG.add(red); tunnelG.add(red.target);
    P.tunnelLight = red;
    // sign above the portal facing +x
    P.signMesh(tunnelG, 'TUNNEL 03', 2.2, 0.55, {
      x: -11.58, y: 9.2, z: 9.0, ry: Math.PI / 2,
      size: 46, texW: 512, texH: 128, color: '#ffb35c', glow: 'rgba(255,120,50,.55)'
    });
    // pines on the hill
    for (let i = 0; i < 4; i++) {
      const px = P.rr(-17.2, -12.6), pz = P.rr(2.6, 12.8);
      if (pz > 6.8 && pz < 11.2) continue;
      const pine = P.group(tunnelG, px, 6.2, pz);
      P.cyl(pine, 0.1, 0.14, 0.7, 0, 0, 0, M.palmTrunk, { seg: 6 });
      for (let j = 0; j < 3; j++) P.cyl(pine, 0.04, 1.0 - j * 0.25, 1.1, 0, 0.5 + j * 0.62, 0, M.pine, { seg: 7 });
    }
  }

  /* =====================  SNOW COVER (land only)  ===================== */
  {
    const tex = P.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = 'rgba(255,255,255,.88)';
      ctx.fillRect(0, 0, w, h);
      const rand = P.mulberry32(99);
      for (let i = 0; i < 160; i++) {
        const x = rand() * w, y = rand() * h, r = 8 + rand() * 26;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const dark = rand() > 0.55;
        g.addColorStop(0, dark ? 'rgba(210,220,230,.30)' : 'rgba(255,255,255,.45)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(3, 2.2);
    const mat = new T.MeshBasicMaterial({
      map: tex, color: 0xf4f8fd, transparent: true, opacity: 0,
      depthWrite: false, toneMapped: false
    });
    const snow = new T.Mesh(new T.PlaneGeometry(35.7, 22.6), mat);
    snow.rotation.x = -Math.PI / 2;
    snow.position.set(0, 0.175, 2.1);
    P.scene.add(snow);
    P.groundSnow = snow;
    P.groundSnowMat = mat;
  }

  /* =====================  register 1–9  ===================== */
  P.register({ id: 'base', name: '地质切块底座', en: 'Geologic Strata Base', group: baseG, desc: '35.8 × 26.8 的微缩地块，四层岩层与土层剖面按 1:24 比例切出，边缘保留原始凿痕。', tags: ['1:24', '地块剖面', '基础'] });
  P.register({ id: 'sea', name: '海岸与浪花', en: 'Shoreline & Surf', group: seaG, desc: '低多边形海面随潮汐起伏，浪线一层层推向防波堤，退潮时留下湿润的滩痕。', tags: ['海岸', '动态水面', '浪花'] });
  P.register({ id: 'palms', name: '海岸植被', en: 'Coastal Grove', group: palmsG, desc: '沿海步道的八株棕榈与四株阔叶树：春季开粉花、夏季浓绿、秋季转橙红、冬季覆上冷色与薄雪。', tags: ['植被', '风动', '四季'] });
  P.register({ id: 'tunnel', name: '隧道', en: 'Tunnel Portal', group: tunnelG, desc: '穿过西侧山体的隧道口。警报响起时洞内亮起强红光并喷出烟雾。', tags: ['隧道', '山体', '警报'] });
  P.register({ id: 'road', name: '公路', en: 'Coast Road', group: roadG, desc: '双车道沿海公路，虚线中线与斑马线。雨天路面变湿，积水映出霓虹倒影。', tags: ['公路', '湿面反射'] });
  P.register({ id: 'forecourt', name: '前场停车场', en: 'Forecourt & Parking', group: forecourtG, desc: '店前铺装前场，三个停车位与入口步道，两侧布置花箱与防撞柱。', tags: ['铺装', '停车', '入口'] });
  P.register({ id: 'rest', name: '路边休息区', en: 'Roadside Rest Area', group: restG, desc: '木平台、长椅与小圆桌，旅人可以在这里喝完一罐饮料再上路。', tags: ['休息区', '长椅', '木平台'] });
  P.register({ id: 'lamps', name: '路灯', en: 'Street Lamps', group: lampsG, desc: '四盏沿街灯柱，入夜后投下暖色光池，雨天光锥会在空气里显形。', tags: ['照明', '夜间', '光池'] });
  P.register({ id: 'vending', name: '自动售货机', en: 'Vending Machine', group: vendingG, desc: 'PRUN 限定饮料机，灯箱常亮，夜间是休息区最亮的一块颜色。', tags: ['售货机', '发光', '夜'] });

  /* =====================  updates  ===================== */
  const wind = { value: 0 };
  P.wind = wind;

  P.onUpdate(function worldUpdate(dt, t) {
    const st = P.state;
    const night = P.isNight() ? 1 : 0;

    P.applySeasonColor(M.grass, 'grass', dt, 1.8);
    P.applySeasonColor(M.sand, 'sand', dt, 1.8);
    P.applySeasonColor(M.sea, 'sea', dt, 1.8);
    P.applySeasonColor(M.palmLeaf, 'palm', dt, 1.8);
    P.applySeasonColor(M.pine, 'pine', dt, 1.8);
    P.applySeasonColor(M.foliage, 'foliage', dt, 1.8);
    P.applySeasonColor(M.foliage2, 'foliage2', dt, 1.8);

    const windTarget = 0.35 + (st.weather === 'storm' ? 1.6 : st.weather === 'rain' ? 0.7 : 0) * (0.6 + st.rain * 0.6);
    wind.value += (windTarget - wind.value) * Math.min(1, dt * 1.5);

    if (P.seaMesh) {
      const pos = P.seaMesh.geometry.attributes.position;
      const base = P.seaBase;
      const amp = 0.055 + wind.value * 0.035;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        pos.array[i * 3 + 1] = Math.sin(x * 0.55 + t * 0.9 + z * 0.8) * amp + Math.sin(x * 1.7 - t * 0.55) * amp * 0.35;
      }
      pos.needsUpdate = true;
      P.seaMesh.geometry.computeVertexNormals();
    }
    for (const f of P.foam) {
      f.mat.opacity = 0.18 + Math.sin(t * 0.9 + f.phase) * 0.1 + wind.value * 0.06;
    }
    for (const f of palmLeaves) {
      f.mesh.rotation.z = f.baseZ + Math.sin(t * 1.4 + f.phase) * 0.035 * (0.6 + wind.value);
      f.mesh.rotation.x = Math.sin(t * 1.1 + f.phase * 1.3) * 0.02 * wind.value;
    }

    const lampI = night * 1.0 + st.rain * 0.2;
    for (const h of P.lampHeads) {
      h.mat.emissiveIntensity += ((0.0 + lampI * 2.6) - h.mat.emissiveIntensity) * Math.min(1, dt * 3);
    }
    for (const l of P.lampLights) {
      const target = night * 55 + st.rain * 10;
      l.intensity += (target - l.intensity) * Math.min(1, dt * 3);
    }
    if (P.vendingMat) {
      P.vendingMat.emissiveIntensity += ((0.45 + night * 1.5) - P.vendingMat.emissiveIntensity) * Math.min(1, dt * 3);
    }
    if (P.vendingPool) {
      P.vendingPool.material.opacity += ((night * 0.28) - P.vendingPool.material.opacity) * Math.min(1, dt * 3);
    }
    for (const pool of P.lampPools) {
      pool.material.opacity += ((night * 0.2 + st.rain * 0.05) - pool.material.opacity) * Math.min(1, dt * 2.4);
    }

    const snowTarget = st.season === 'winter' ? 0.82 : 0;
    P.groundSnowMat.opacity += (snowTarget - P.groundSnowMat.opacity) * Math.min(1, dt * 1.6);
    P.groundSnow.visible = P.groundSnowMat.opacity > 0.01;
    if (P.pineSnowCaps) {
      M.pineSnow.opacity += ((st.season === 'winter' ? 0.95 : 0) - M.pineSnow.opacity) * Math.min(1, dt * 1.6);
    }

    const wet = Math.min(1, st.rain * 1.35 + (st.weather === 'storm' ? 0.25 : 0));
    const targetRough = 0.9 - wet * 0.58;
    const targetMetal = 0.06 + wet * 0.32;
    M.asphalt.roughness += (targetRough - M.asphalt.roughness) * Math.min(1, dt * 2);
    M.asphalt.metalness += (targetMetal - M.asphalt.metalness) * Math.min(1, dt * 2);
    M.concreteDark.roughness += ((0.82 - wet * 0.35) - M.concreteDark.roughness) * Math.min(1, dt * 2);

    if (!st.alert && P.tunnelRedMat) {
      P.tunnelRedMat.emissiveIntensity += ((0.04 + Math.sin(t * 1.4) * 0.02) - P.tunnelRedMat.emissiveIntensity) * Math.min(1, dt * 2);
    }
  });

  console.log('[PRUN] world ready · registry', P.registry.length);
})();
