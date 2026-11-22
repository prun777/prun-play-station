/* =========================================================
   PRUN PLAY STATION — building, interiors, furniture
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T, S = P.scene;

  /* ---------------- materials ---------------- */
  const B = {
    facade: P.std(0x252b33, 0.75, 0.18),
    facadePanel: P.std(0x2b323a, 0.7, 0.2),
    frame: P.std(0x15181d, 0.55, 0.55),
    frameLight: P.std(0x2c333b, 0.5, 0.5),
    plinth: P.std(0x4a4f55, 0.85, 0.05),
    interiorWall: P.std(0x3a332c, 0.88, 0.03),
    warehouseWall: P.std(0x3c4045, 0.85, 0.06),
    floorWood: P.std(0x4e3a2a, 0.72, 0.05),
    floorWare: P.std(0x4b4f54, 0.85, 0.04),
    ceiling: P.std(0x22262b, 0.9, 0.02),
    wood: P.std(0x6a4d33, 0.62, 0.08),
    woodDark: P.std(0x3c2c1f, 0.7, 0.06),
    desk: P.std(0x2a211b, 0.5, 0.12),
    steel: P.std(0x787f88, 0.42, 0.62),
    darkSteel: P.std(0x2b3036, 0.55, 0.55),
    black: P.std(0x14171b, 0.6, 0.3),
    white: P.std(0xd9dee4, 0.6, 0.05),
    crate: P.std(0x9a7448, 0.9, 0.02),
    crate2: P.std(0x7c5a36, 0.92, 0.02),
    tote: P.std(0x2f4b6e, 0.75, 0.08),
    toteRed: P.std(0x7a3238, 0.75, 0.08),
    fabric: P.std(0x3a8f86, 0.9, 0.02),
    accBlue: P.std(0x3f6fa8, 0.7, 0.1),
    accRed: P.std(0x8f3f4a, 0.7, 0.1),
    accGreen: P.std(0x3f8a6a, 0.7, 0.1),
    accGold: P.std(0xc9a43c, 0.7, 0.1),
    accPurple: P.std(0x6a5aa8, 0.7, 0.1),
    accWood: P.std(0x8a6a3f, 0.7, 0.1),
    tape: P.std(0xc9b78d, 0.8, 0.02),
    fabric2: P.std(0x3a4a5c, 0.92, 0.02),
    rug: P.std(0x39434f, 1.0, 0.0),
    rugOffice: P.std(0x33302c, 1.0, 0.0),
    plant: P.flat(0x2f5a3b, 0.9),
    plant2: P.flat(0x3f7347, 0.9),
    pot: P.std(0x4a4e53, 0.8, 0.05),
    glass: P.glassMat,
    screenBack: P.std(0x0e1013, 0.5, 0.3)
  };
  P.buildMats = B;

  /* ---------------- small helpers ---------------- */
  P.proxyMat = new T.MeshBasicMaterial({
    transparent: true, opacity: 0, depthWrite: false, colorWrite: false, side: T.DoubleSide
  });
  function pickProxyBox(parent, w, h, d, x, yBottom, z) {
    const m = P.box(parent, w, h, d, x, yBottom, z, P.proxyMat, { receive: false });
    m.userData.isProxy = true;
    return m;
  }
  function box(parent, w, h, d, x, y, z, mat, opts) { return P.box(parent, w, h, d, x, y, z, mat, opts); }
  function cyl(parent, rt, rb, h, x, y, z, mat, opts) { return P.cyl(parent, rt, rb, h, x, y, z, mat, opts); }
  function screenMat(draw, w, h, intensity) {
    const tex = P.canvasTexture(w || 512, h || 288, draw);
    return new T.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: 0xffffff,
      emissiveIntensity: intensity === undefined ? 0.9 : intensity,
      roughness: 0.35, metalness: 0.1
    });
  }
  const rnd = P.mulberry32(4242);

  /* ---------------- screen artwork (all procedural) ---------------- */
  function artGame1(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#071a33'); g.addColorStop(0.6, '#0d2f52'); g.addColorStop(1, '#1b0b2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // sun
    ctx.fillStyle = 'rgba(255,120,170,.85)';
    ctx.beginPath(); ctx.arc(w * 0.7, h * 0.36, 62, 0, 6.28); ctx.fill();
    // grid horizon
    ctx.strokeStyle = 'rgba(95,224,255,.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + (i - 4) * 22, h * 0.58);
      ctx.lineTo(w * 0.5 + (i - 4) * 150, h);
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const y = h * 0.58 + Math.pow(i / 6, 1.7) * h * 0.42;
      ctx.globalAlpha = 0.5 - i * 0.05;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // mountains
    ctx.fillStyle = '#0a1f36';
    ctx.beginPath(); ctx.moveTo(0, h * 0.62); ctx.lineTo(w * 0.22, h * 0.3); ctx.lineTo(w * 0.4, h * 0.62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#08182b';
    ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.62); ctx.lineTo(w * 0.55, h * 0.38); ctx.lineTo(w * 0.8, h * 0.62); ctx.closePath(); ctx.fill();
    // HUD
    ctx.fillStyle = 'rgba(95,224,255,.9)'; ctx.font = '600 18px monospace';
    ctx.fillText('PRUN // SECTOR 7', 22, 34);
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillRect(22, h - 38, 120, 6);
    ctx.fillStyle = 'rgba(255,94,109,.9)';
    ctx.fillRect(22, h - 38, 78, 6);
  }
  function artGame2(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#12041f'); g.addColorStop(0.5, '#2b0a3d'); g.addColorStop(1, '#050a18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5fe0ff'; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.55, 40 + i * 34, 0.2, Math.PI - 0.2); ctx.stroke();
    }
    ctx.fillStyle = '#ff5f9e';
    ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.3); ctx.lineTo(w * 0.72, h * 0.62); ctx.lineTo(w * 0.28, h * 0.62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '700 26px monospace';
    ctx.fillText('NEON DRIFT', 26, 46);
    ctx.font = '500 13px monospace'; ctx.fillStyle = 'rgba(95,224,255,.8)';
    ctx.fillText('LAP 03 · 00:41.2', 26, 70);
  }
  function artGame3(ctx, w, h) {
    ctx.fillStyle = '#0b1c12'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < 14; y++) for (let x = 0; x < 24; x++) {
      if (rnd() > 0.72) {
        ctx.fillStyle = ['#1e5b3a', '#2b7a4b', '#17452c'][(x + y) % 3];
        ctx.fillRect(x * 21, y * 20 + 12, 21, 20);
      }
    }
    // platformer character
    ctx.fillStyle = '#ffb35c'; ctx.fillRect(190, 150, 26, 30);
    ctx.fillStyle = '#5fe0ff'; ctx.fillRect(196, 160, 6, 6); ctx.fillRect(206, 160, 6, 6);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = '#dff8ff'; ctx.font = '600 16px monospace';
    ctx.fillText('PRUN QUEST  ·  WORLD 2-3', 14, 23);
    ctx.fillStyle = '#ffb35c'; ctx.font = '700 15px monospace';
    ctx.textAlign = 'right'; ctx.fillText('×12  0420', w - 14, 23); ctx.textAlign = 'left';
  }
  function artHud(ctx, w, h) {
    ctx.fillStyle = '#04101c'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(95,224,255,.28)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = '#5fe0ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const y = h * 0.55 + Math.sin(x * 0.045 + 1) * 18 * Math.sin(x * 0.011);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#7dffb2'; ctx.font = '600 15px monospace';
    ctx.fillText('DIAGNOSTIC LINK · STABLE', 14, 24);
    ctx.fillStyle = 'rgba(200,230,245,.7)'; ctx.font = '500 12px monospace';
    for (let i = 0; i < 4; i++) ctx.fillText('CH-' + (i + 1) + '   ' + (78 + i * 4) + '%', 14, 52 + i * 20);
    ctx.fillStyle = '#ffb35c';
    ctx.fillRect(w - 96, 18, 76, 8);
    ctx.fillStyle = 'rgba(255,179,92,.35)';
    ctx.fillRect(w - 96, 32, 52, 4);
  }
  function artNews(ctx, w, h) {
    ctx.fillStyle = '#0a111c'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#132033'; ctx.fillRect(0, 0, w * 0.62, h);
    ctx.fillStyle = '#1c314c'; ctx.fillRect(w * 0.62, 0, w * 0.38, h);
    ctx.fillStyle = 'rgba(95,224,255,.8)'; ctx.fillRect(w * 0.62, 0, w * 0.38, 4);
    ctx.fillStyle = '#e8f4ff'; ctx.font = '700 20px -apple-system,sans-serif';
    ctx.fillText('PRUN NEWS · 24H', 16, 32);
    ctx.fillStyle = '#5fe0ff'; ctx.font = '600 13px monospace';
    ctx.fillText('MARKET  +2.41%', 16, 58);
    ctx.fillStyle = 'rgba(210,225,240,.7)';
    for (let i = 0; i < 8; i++) ctx.fillRect(16, 84 + i * 18, w * (0.3 + rnd() * 0.22), 5);
    ctx.fillStyle = '#ffb35c'; ctx.fillRect(w * 0.66, 24, w * 0.28, 10);
    ctx.fillStyle = 'rgba(255,179,92,.35)'; ctx.fillRect(w * 0.66, 40, w * 0.2, 6);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(160,200,230,.18)';
      ctx.fillRect(w * 0.66, 70 + i * 34, w * 0.28, 22);
    }
  }
  function artArcade(ctx, w, h) {
    ctx.fillStyle = '#050a16'; ctx.fillRect(0, 0, w, h);
    const rand = P.mulberry32(8);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(95,224,255,' + (0.1 + rand() * 0.35) + ')';
      ctx.fillRect(rand() * w, rand() * h, 3, 3);
    }
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 210); ctx.lineTo(60, 90); ctx.lineTo(120, 90);
    ctx.lineTo(120, 150); ctx.lineTo(190, 150); ctx.lineTo(190, 70); ctx.lineTo(260, 70);
    ctx.lineTo(260, 210); ctx.stroke();
    ctx.fillStyle = '#ff5f9e'; ctx.beginPath(); ctx.arc(260, 70, 9, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#dff8ff'; ctx.font = '700 22px monospace'; ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORE 1987', w / 2, 40); ctx.textAlign = 'left';
  }
  P.artGame1 = artGame1;

  /* =====================  SHELL  ===================== */
  const shell = P.group(S, 0, 0, 0, 'shell');
  {
    // plinth
    box(shell, 9.75, 0.22, 6.8, -8.25, 0.0, -2.25, B.plinth, { cast: true });
    box(shell, 12.15, 0.22, 7.8, 2.5, 0.0, -2.75, B.plinth, { cast: true });
    // ground floors
    box(shell, 9.3, 0.08, 6.3, -8.25, 0.22, -2.25, B.floorWood, { receive: true });
    box(shell, 11.8, 0.08, 7.3, 2.5, 0.22, -2.75, B.floorWare, { receive: true });
    // back walls
    box(shell, 9.5, 6.2, 0.2, -8.25, 0.22, -5.5, B.interiorWall, { cast: true });
    box(shell, 12.2, 6.2, 0.2, 2.5, 0.22, -6.5, B.warehouseWall, { cast: true });
    // west wall
    box(shell, 0.2, 6.2, 6.6, -13.0, 0.22, -2.3, B.facade, { cast: true });
    // partition store / warehouse, with a service doorway at z -3.2..-2.3
    box(shell, 0.2, 3.0, 3.3, -3.5, 0.22, -4.85, B.interiorWall, { cast: true });
    box(shell, 0.2, 3.0, 3.3, -3.5, 0.22, -0.65, B.interiorWall, { cast: true });
    box(shell, 0.24, 1.0, 0.95, -3.5, 2.22, -2.75, B.frame); // header above the opening
    box(shell, 0.22, 2.05, 0.08, -3.5, 0.3, -3.2, B.frame);
    // east wall of warehouse — mostly glass; solid frame edges
    box(shell, 0.22, 6.2, 0.5, 8.5, 0.22, -6.25, B.facade, { cast: true });
    box(shell, 0.22, 6.2, 0.4, 8.5, 0.22, 0.8, B.facade, { cast: true });
    // middle floor slab
    box(shell, 21.8, 0.2, 7.5, -2.25, 3.2, -2.75, B.ceiling, { cast: true, receive: true });
    // fascia band between floors (front)
    box(shell, 21.9, 0.34, 0.26, -2.25, 3.02, 0.98, B.facade, { cast: true });
    // roof slab
    box(shell, 21.9, 0.22, 7.7, -2.25, 6.3, -2.75, B.ceiling, { cast: true });
    // parapet
    box(shell, 21.9, 0.5, 0.18, -2.25, 6.52, 0.94, B.facadePanel, { cast: true });
    box(shell, 21.9, 0.5, 0.18, -2.25, 6.52, -6.44, B.facadePanel, { cast: true });
    box(shell, 0.18, 0.5, 7.7, -13.06, 6.52, -2.75, B.facadePanel, { cast: true });
    box(shell, 0.18, 0.5, 7.7, 8.56, 6.52, -2.75, B.facadePanel, { cast: true });
    // roof membrane
    box(shell, 21.4, 0.04, 7.2, -2.25, 6.52, -2.75, P.std(0x4a4e53, 0.95, 0.02), { receive: true });
    // rooftop plant & vents
    box(shell, 1.8, 1.0, 1.4, 4.6, 6.56, -4.4, B.darkSteel, { cast: true });
    box(shell, 1.5, 0.16, 1.1, 4.6, 7.56, -4.4, B.steel);
    for (let i = 0; i < 3; i++) cyl(shell, 0.38, 0.38, 0.35, 1.2 + i * 1.1, 6.56, -3.2, B.steel, { seg: 12 });
    box(shell, 0.5, 0.9, 0.5, -11.4, 6.56, -5.2, B.darkSteel);
    // slim antenna
    cyl(shell, 0.02, 0.03, 2.6, -12.2, 6.56, -5.8, B.steel, { seg: 5 });
    // second-floor warm cove near the front glass (reads from far away at night)
    P.coveMat = new T.MeshStandardMaterial({ color: 0x2a2118, emissive: 0xffc98a, emissiveIntensity: 0.35, roughness: 0.6 });
    box(shell, 20.8, 0.06, 0.07, -2.25, 6.13, 0.55, P.coveMat, { receive: false });
    P.downlights = [];
    const dlMat = new T.MeshStandardMaterial({ color: 0x2a2a28, emissive: 0xffd9a8, emissiveIntensity: 0.6, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      P.cyl(shell, 0.09, 0.09, 0.04, -11.5 + i * 4.6, 6.12, -0.6, dlMat, { seg: 12, receive: false });
    }
    P.downlightMat = dlMat;
    // roof edge LED strip (night)
    P.roofStripMat = new T.MeshStandardMaterial({ color: 0x1a2a33, emissive: 0x5fe0ff, emissiveIntensity: 0.0, roughness: 0.5 });
    box(shell, 21.6, 0.05, 0.05, -2.25, 6.5, 1.02, P.roofStripMat, { receive: false });
    // interior ceiling light panels
    P.ceilingGlow = [];
    const stripMat = new T.MeshStandardMaterial({ color: 0x2a2a28, emissive: 0xfff1dc, emissiveIntensity: 0.2, roughness: 0.6 });
    for (let i = 0; i < 3; i++) {
      box(shell, 0.28, 0.05, 4.8, -11.6 + i * 3.0, 3.13, -2.3, stripMat, { receive: false });
      P.ceilingGlow.push(stripMat);
    }
    for (let i = 0; i < 3; i++) {
      box(shell, 0.28, 0.05, 5.6, 0.5 + i * 3.2, 3.13, -2.9, stripMat, { receive: false });
    }
    // second-floor ceiling strips (office + lounge)
    for (let i = 0; i < 4; i++) {
      box(shell, 0.24, 0.04, 4.6, -11.2 + i * 5.0, 6.19, -2.7, stripMat, { receive: false });
    }
    // store + warehouse interior lights (always present, dimmed by time)
    P.storeLight = new T.PointLight(0xffd9b0, 55, 13, 2);
    P.storeLight.position.set(-8.2, 2.8, -2.4);
    P.scene.add(P.storeLight);
    P.wareLight = new T.PointLight(0xffe2c4, 70, 15, 2);
    P.wareLight.position.set(2.6, 2.85, -2.6);
    P.scene.add(P.wareLight);
    P.officeLight = new T.PointLight(0xffcf9e, 0, 9, 2);
    P.officeLight.position.set(-9.6, 5.4, -2.8);
    P.scene.add(P.officeLight);
    P.loungeLight = new T.PointLight(0xffcf9e, 0, 10, 2);
    P.loungeLight.position.set(2.4, 5.4, -3.0);
    P.scene.add(P.loungeLight);
  }

  /* =====================  ROOFTOP SIGN (10)  ===================== */
  const signG = P.group(S, 0, 0, 0, 'sign');
  {
    box(signG, 0.12, 1.5, 0.12, -11.6, 6.56, -0.9, B.frame, { cast: true });
    box(signG, 0.12, 1.5, 0.12, -4.9, 6.56, -0.9, B.frame, { cast: true });
    box(signG, 7.2, 1.9, 0.18, -8.25, 7.0, -0.95, B.facade, { cast: true });
    const tex = P.canvasTexture(1400, 360, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 116px -apple-system,"PingFang SC",sans-serif';
      ctx.fillStyle = '#e9fbff';
      ctx.shadowColor = 'rgba(95,224,255,.85)'; ctx.shadowBlur = 26;
      ctx.fillText('PRUN PLAY STATION', w / 2, h * 0.40);
      ctx.shadowBlur = 0;
      ctx.font = '500 40px -apple-system,"PingFang SC",sans-serif';
      ctx.fillStyle = 'rgba(255,179,92,.92)';
      ctx.fillText('G A M E S   &   S E R V I C I N G', w / 2, h * 0.78);
    });
    const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false });
    const plate = new T.Mesh(new T.PlaneGeometry(7.0, 1.8), mat);
    plate.position.set(-8.25, 7.05, -0.82);
    signG.add(plate);
    // cyan under-bar
    P.signBarMat = new T.MeshStandardMaterial({ color: 0x123038, emissive: 0x5fe0ff, emissiveIntensity: 1.1, roughness: 0.4 });
    box(signG, 7.0, 0.05, 0.2, -8.25, 6.9, -0.86, P.signBarMat, { receive: false });
  }

  /* =====================  STORE GLASS (11)  ===================== */
  const storeGlassG = P.group(S, 0, 0, 0, 'storeGlass');
  {
    const z = 1.0;
    // glass panels: ground + upper
    const pane1 = P.plane(storeGlassG, 9.3, 2.82, -8.25, 1.71, z, B.glass, { ry: 0, receive: false });
    pane1.userData.noPick = true;
    const pane2 = P.plane(storeGlassG, 9.3, 2.8, -8.25, 4.83, z, B.glass, { ry: 0, receive: false });
    pane2.userData.noPick = true;
    // mullions
    for (let i = 0; i <= 5; i++) {
      const x = -12.9 + i * 1.86;
      box(storeGlassG, 0.09, 6.0, 0.14, x, 0.3, z + 0.02, B.frame, { cast: true });
    }
    box(storeGlassG, 9.34, 0.1, 0.16, -8.25, 0.25, z + 0.02, B.frame, { cast: true });
    box(storeGlassG, 9.34, 0.08, 0.16, -8.25, 3.12, z + 0.02, B.frame, { cast: true });
    box(storeGlassG, 9.34, 0.1, 0.16, -8.25, 6.18, z + 0.02, B.frame, { cast: true });
    // entrance doors
    box(storeGlassG, 0.08, 2.35, 0.1, -9.55, 0.3, z + 0.03, B.frame, { cast: true });
    box(storeGlassG, 0.08, 2.35, 0.1, -7.0, 0.3, z + 0.03, B.frame, { cast: true });
    box(storeGlassG, 2.55, 0.08, 0.1, -8.27, 2.62, z + 0.03, B.frame, { cast: true });
    const doorGlass = P.plane(storeGlassG, 2.45, 2.25, -8.27, 1.45, z + 0.05, B.glass, {});
    doorGlass.userData.noPick = true;
    box(storeGlassG, 0.04, 0.55, 0.04, -8.45, 1.45, z + 0.12, B.steel);
    box(storeGlassG, 0.04, 0.55, 0.04, -8.1, 1.45, z + 0.12, B.steel);
    // storefront sign band
    P.signMesh(storeGlassG, 'PRUN PLAY STATION', 7.4, 0.42, {
      x: -8.25, y: 3.36, z: z + 0.14, size: 86, texW: 1024, texH: 160,
      color: '#e8fbff', glow: 'rgba(95,224,255,.65)', spacing: 9
    });
    P.signMesh(storeGlassG, 'GAMES & SERVICING · 1:24', 4.6, 0.24, {
      x: -8.25, y: 3.05, z: z + 0.14, size: 44, texW: 1024, texH: 120,
      color: 'rgba(255,179,92,.92)', spacing: 8
    });
    // small neon SERVICING tag on the west column
    P.signMesh(storeGlassG, 'SERVICING', 1.9, 0.3, {
      x: -12.62, y: 4.35, z: z + 0.06, size: 52, texW: 512, texH: 128,
      color: '#ff9ad5', glow: 'rgba(255,95,160,.6)'
    });
  }

  /* =====================  WAREHOUSE GLASS (23)  ===================== */
  const warehouseGlassG = P.group(S, 0, 0, 0, 'warehouseGlass');
  {
    const z = 1.0;
    // front glass, both floors (x -3.4 .. 8.4)
    const p1 = P.plane(warehouseGlassG, 11.8, 2.82, 2.5, 1.71, z, B.glass, { receive: false });
    p1.userData.noPick = true;
    const p2 = P.plane(warehouseGlassG, 11.8, 2.8, 2.5, 4.83, z, B.glass, { receive: false });
    p2.userData.noPick = true;
    // east side glass (x = 8.5)
    const e1 = P.plane(warehouseGlassG, 7.2, 2.82, 8.5, 1.71, -2.75, B.glass, { ry: Math.PI / 2, receive: false });
    e1.userData.noPick = true;
    const e2 = P.plane(warehouseGlassG, 7.2, 2.8, 8.5, 4.83, -2.75, B.glass, { ry: Math.PI / 2, receive: false });
    e2.userData.noPick = true;
    // industrial mullions, front
    for (let i = 0; i <= 6; i++) {
      const x = -3.4 + i * 1.966;
      box(warehouseGlassG, 0.11, 6.0, 0.15, x, 0.3, z + 0.02, B.frame, { cast: true });
    }
    box(warehouseGlassG, 11.84, 0.12, 0.17, 2.5, 0.25, z + 0.02, B.frame, { cast: true });
    box(warehouseGlassG, 11.84, 0.09, 0.17, 2.5, 3.12, z + 0.02, B.frame, { cast: true });
    box(warehouseGlassG, 11.84, 0.12, 0.17, 2.5, 6.18, z + 0.02, B.frame, { cast: true });
    // east mullions
    for (let i = 0; i <= 4; i++) {
      box(warehouseGlassG, 0.15, 6.0, 0.11, 8.53, 0.3, -6.3 + i * 1.78, B.frame, { cast: true });
    }
    box(warehouseGlassG, 0.17, 0.1, 7.2, 8.53, 3.12, -2.75, B.frame, { cast: true });
    // warehouse sign on the glass band
    P.signMesh(warehouseGlassG, 'SERVICE WAREHOUSE', 5.0, 0.34, {
      x: 4.6, y: 3.35, z: z + 0.14, size: 64, texW: 1024, texH: 160,
      color: '#dff8ff', glow: 'rgba(95,224,255,.4)', spacing: 7
    });
    P.signMesh(warehouseGlassG, 'INTAKE · QC · PARTS', 4.0, 0.22, {
      x: 4.6, y: 3.06, z: z + 0.14, size: 44, texW: 1024, texH: 120,
      color: 'rgba(255,179,92,.85)', spacing: 6
    });
  }

  /* =====================  CANOPY (12)  ===================== */
  const canopyG = P.group(S, 0, 0, 0, 'canopy');
  {
    box(canopyG, 4.6, 0.12, 1.9, -8.3, 2.66, 1.95, B.frame, { cast: true });
    box(canopyG, 4.4, 0.03, 1.7, -8.3, 2.64, 1.95, P.emissive(0xbfeaff, 0.55), { receive: false });
    // edge light strip
    P.canopyStripMat = new T.MeshStandardMaterial({ color: 0x1c2c33, emissive: 0x5fe0ff, emissiveIntensity: 0.7, roughness: 0.4 });
    box(canopyG, 4.6, 0.04, 0.04, -8.3, 2.67, 2.87, P.canopyStripMat, { receive: false });
    // support rods
    [0, 1].forEach((i) => {
      const rod = cyl(canopyG, 0.015, 0.015, 1.5, -9.9 + i * 3.2, 3.1, 2.5, B.steel, { seg: 5 });
      rod.rotation.x = 0.85;
    });
    // doormat
    box(canopyG, 2.2, 0.02, 0.9, -8.3, 0.3, 1.55, B.rug, { receive: true });
    P.signMesh(canopyG, 'OPEN', 0.66, 0.22, {
      x: -7.25, y: 2.35, z: 1.05, size: 60, texW: 256, texH: 96,
      color: '#7dffb2', glow: 'rgba(80,255,160,.6)'
    });
  }

  /* =====================  STORE INTERIOR  ===================== */
  const F = 0.3; // store floor top

  // helper: tiny controller
  function controller(parent, x, y, z, color, ry) {
    const g = P.group(parent, x, y, z);
    g.rotation.y = ry || 0;
    P.box(g, 0.24, 0.06, 0.14, 0, 0, 0, color, { cast: true });
    P.box(g, 0.1, 0.04, 0.08, -0.12, 0.0, 0.02, color, {});
    P.box(g, 0.1, 0.04, 0.08, 0.12, 0.0, 0.02, color, {});
    P.ico(g, 0.025, -0.02, 0.07, 0, B.steel);
    P.ico(g, 0.025, 0.05, 0.07, -0.01, B.steel);
    return g;
  }

  /* ---- 13 repair bench ---- */
  const benchG = P.group(S, 0, 0, 0, 'repairBench');
  {
    const x0 = -12.55, x1 = -10.15, z0 = -5.35, z1 = -4.72;
    box(benchG, x1 - x0, 0.1, z1 - z0, (x0 + x1) / 2, F + 0.62, (z0 + z1) / 2, B.wood, { cast: true });
    box(benchG, x1 - x0 - 0.1, 0.5, z1 - z0 - 0.1, (x0 + x1) / 2, F + 0.1, (z0 + z1) / 2, B.darkSteel, {});
    for (let i = 0; i < 4; i++) {
      box(benchG, 0.06, 0.62, 0.06, x0 + 0.12, F, z0 + 0.1 + i * 0.18, B.steel);
    }
    // opened console on the bench
    const c = P.group(benchG, -12.1, F + 0.72, -5.05);
    P.box(c, 0.62, 0.09, 0.4, 0, 0, 0, B.white, { cast: true });
    P.box(c, 0.56, 0.02, 0.34, 0, 0.02, 0, P.std(0x2a6a4a, 0.8, 0.1), {});
    P.box(c, 0.6, 0.05, 0.36, 0.02, 0.09, 0.34, B.white, { ry: 0, rz: 0, cast: true }); // lid tilted
    P.box(c, 0.34, 0.05, 0.24, 0, 0.1, 0.02, P.std(0x1c3a2f, 0.8, 0.2), {});
    P.box(c, 0.02, 0.14, 0.02, -0.26, 0.02, 0.16, B.steel);
    // small parts tray
    box(benchG, 0.3, 0.03, 0.2, -11.55, F + 0.74, -5.1, B.steel);
    for (let i = 0; i < 5; i++) P.ico(benchG, 0.02, -11.63 + i * 0.04, F + 0.775, -5.12, B.steel);
    // gooseneck lamp
    const arm = cyl(benchG, 0.02, 0.02, 0.7, -12.45, F + 0.78, -5.3, B.steel, { seg: 6 });
    arm.rotation.z = 0.4;
    P.ico(benchG, 0.09, -12.22, F + 1.4, -5.2, P.emissive(0xfff1d8, 1.2));
    // parts cabinet under bench
    for (let i = 0; i < 3; i++) {
      box(benchG, 0.62, 0.24, 0.05, -12.2 + i * 0.75, F + 0.12, -4.66, B.frameLight, {});
      box(benchG, 0.28, 0.02, 0.02, -12.2 + i * 0.75, F + 0.24, -4.63, B.steel);
    }
    pickProxyBox(benchG, 2.5, 1.0, 0.75, -11.35, F + 0.32, -5.05);
  }

  /* ---- 18 tool wall ---- */
  const toolWallG = P.group(S, 0, 0, 0, 'toolWall');
  {
    box(toolWallG, 2.5, 1.5, 0.06, -11.35, F + 1.05, -5.4, P.std(0x2a2d31, 0.9, 0.05), {});
    // peg holes pattern
    const pegMat = P.std(0x1b1e22, 0.9, 0.02);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) {
      box(toolWallG, 0.02, 0.02, 0.01, -12.5 + c * 0.17, F + 1.12 + r * 0.22, -5.36, pegMat, { receive: false });
    }
    // tools
    const toolY = F + 1.25;
    for (let i = 0; i < 5; i++) {
      box(toolWallG, 0.06, 0.34, 0.03, -12.35 + i * 0.32, toolY, -5.34, B.steel, { cast: true });
      box(toolWallG, 0.14, 0.04, 0.03, -12.35 + i * 0.32, toolY + 0.36, -5.34, B.steel, {});
    }
    for (let i = 0; i < 4; i++) {
      cyl(toolWallG, 0.04, 0.04, 0.3, -12.2 + i * 0.4, toolY + 0.62, -5.33, B.red, { seg: 8, cast: true, rx: Math.PI / 2 });
    }
    // shelf with spray cans
    box(toolWallG, 2.2, 0.04, 0.16, -11.35, F + 1.75, -5.3, B.wood, { cast: true });
    for (let i = 0; i < 6; i++) {
      cyl(toolWallG, 0.045, 0.05, 0.16, -12.3 + i * 0.36, F + 1.8, -5.3, i % 2 ? B.red : B.accBlue, { seg: 8 });
    }
  }

  /* ---- 14 diagnostic instruments ---- */
  const testerG = P.group(S, 0, 0, 0, 'tester');
  {
    // rolling instrument cart
    box(testerG, 1.05, 0.06, 0.6, -9.62, F + 0.78, -5.05, B.steel, { cast: true });
    for (let i = 0; i < 4; i++) {
      P.cyl(testerG, 0.05, 0.05, 0.06, -10.05 + (i % 2) * 0.86, F + 0.02, -5.28 + Math.floor(i / 2) * 0.42, B.black, { seg: 8, rx: Math.PI / 2 });
    }
    // oscilloscope
    box(testerG, 0.56, 0.38, 0.3, -9.85, F + 0.86, -5.05, B.black, { cast: true });
    const scope = screenMat(artHud, 512, 288, 1.25);
    P.plane(testerG, 0.44, 0.26, -9.85, F + 1.04, -4.895, scope, { receive: false });
    for (let i = 0; i < 3; i++) P.ico(testerG, 0.028, -10.0 + i * 0.13, F + 0.9, -5.22, B.steel);
    // signal analyzer (angled)
    box(testerG, 0.42, 0.3, 0.26, -9.2, F + 0.86, -5.08, B.frameLight, { cast: true });
    const an = screenMat(artHud, 512, 288, 1.0);
    P.plane(testerG, 0.32, 0.2, -9.2, F + 1.06, -4.945, an, { receive: false });
    // cables
    for (let i = 0; i < 4; i++) {
      const cable = cyl(testerG, 0.012, 0.012, 0.5, -9.55 + i * 0.1, F + 0.8, -4.86, B.red, { seg: 5, rx: 0.9 });
      cable.position.y += 0.15;
    }
    pickProxyBox(testerG, 1.2, 1.25, 0.72, -9.6, F + 0.3, -5.06);
  }

  /* ---- 19 teardown station ---- */
  const teardownG = P.group(S, 0, 0, 0, 'teardown');
  {
    const cx = -8.15, cz = -5.0;
    box(teardownG, 1.6, 0.08, 0.66, cx, F + 0.7, cz, B.woodDark, { cast: true });
    for (let i = 0; i < 4; i++) {
      cyl(teardownG, 0.03, 0.035, 0.7, cx - 0.72 + (i % 2) * 1.44, F, cz - 0.26 + Math.floor(i / 2) * 0.52, B.steel, { seg: 6 });
    }
    // disassembled console: shell, board, fan
    box(teardownG, 0.5, 0.06, 0.34, cx - 0.35, F + 0.8, cz, B.white, { cast: true });
    box(teardownG, 0.42, 0.02, 0.28, cx - 0.35, F + 0.81, cz, P.std(0x20543c, 0.7, 0.15), {});
    box(teardownG, 0.16, 0.03, 0.12, cx - 0.35, F + 0.88, cz - 0.02, B.darkSteel, {});
    cyl(teardownG, 0.07, 0.07, 0.03, cx + 0.2, F + 0.78, cz + 0.05, B.black, { seg: 10 });
    P.cyl(teardownG, 0.01, 0.01, 0.3, cx + 0.6, F + 0.9, cz + 0.1, B.red, { seg: 5, rz: 1.0 });
    box(teardownG, 0.22, 0.04, 0.16, cx + 0.62, F + 1.02, cz + 0.18, B.red, { cast: true }); // heat gun
    // screws + mat
    box(teardownG, 0.6, 0.008, 0.4, cx + 0.05, F + 0.75, cz + 0.02, B.rug, { receive: false });
    for (let i = 0; i < 7; i++) P.ico(teardownG, 0.018, cx - 0.15 + P.rand() * 0.4, F + 0.765, cz - 0.1 + P.rand() * 0.24, B.steel);
    // anti-static wrist strap
    P.cyl(teardownG, 0.05, 0.05, 0.02, cx - 0.7, F + 0.75, cz + 0.2, P.std(0x3f6fa8, 0.7, 0.1), { seg: 8 });
    pickProxyBox(teardownG, 1.7, 1.3, 0.8, cx, F + 0.28, cz);
  }

  /* ---- 15 controller stand ---- */
  const ctrlStandG = P.group(S, 0, 0, 0, 'controllerStand');
  {
    const x = -6.45, z = -5.08;
    box(ctrlStandG, 1.1, 0.08, 0.55, x, F + 0.12, z, B.darkSteel, { cast: true });
    for (let s = 0; s < 3; s++) {
      box(ctrlStandG, 1.05, 0.04, 0.5, x, F + 0.5 + s * 0.62, z, B.woodDark, { cast: true });
      for (let i = 0; i < 3; i++) {
        const colors = [B.white, B.black, B.red];
        controller(ctrlStandG, x - 0.34 + i * 0.34, F + 0.55 + s * 0.62, z + 0.05, colors[i % 3], 0.15);
      }
      // little price tags
      box(ctrlStandG, 0.2, 0.008, 0.09, x, F + 0.58 + s * 0.62, z - 0.2, B.white, { receive: false });
    }
    for (let i = 0; i < 4; i++) {
      cyl(ctrlStandG, 0.02, 0.02, 1.9, x - 0.52 + (i % 2) * 1.04, F, z - 0.2 + Math.floor(i / 2) * 0.4, B.steel, { seg: 6 });
    }
  }

  /* ---- 16 accessory shelves ---- */
  const accessG = P.group(S, 0, 0, 0, 'accessoryShelf');
  {
    const x = -4.85, z = -5.1;
    box(accessG, 2.0, 0.08, 0.6, x, F + 0.1, z, B.darkSteel, { cast: true });
    box(accessG, 2.0, 0.08, 0.6, x, F + 2.3, z, B.darkSteel, { cast: true });
    for (let i = 0; i < 4; i++) {
      box(accessG, 0.05, 2.3, 0.05, x - 0.98, F + 0.1, z - 0.27 + i * 0.53, B.steel, {});
      box(accessG, 0.05, 2.3, 0.05, x + 0.98, F + 0.1, z - 0.27 + i * 0.53, B.steel, {});
    }
    for (let s = 0; s < 4; s++) {
      box(accessG, 1.96, 0.035, 0.58, x, F + 0.5 + s * 0.55, z, B.wood, { cast: true });
      for (let i = 0; i < 5; i++) {
        const h = 0.14 + P.rand() * 0.16;
        box(accessG, 0.22, h, 0.3, x - 0.72 + i * 0.34, F + 0.535 + s * 0.55, z,
          [B.accBlue, B.accRed, B.accGreen, B.accGold, B.accPurple][i % 5], { cast: true });
      }
    }
    // cable hanks on hooks
    for (let i = 0; i < 3; i++) {
      const ring = new T.Mesh(new T.TorusGeometry(0.11, 0.03, 6, 12), B.black);
      ring.position.set(x + 0.55, F + 2.05 - i * 0.12, z - 0.33);
      accessG.add(ring);
    }
  }

  /* ---- 17 display case ---- */
  const caseG = P.group(S, 0, 0, 0, 'displayCase');
  {
    const x = -12.55, z = -2.1;
    box(caseG, 0.6, 0.5, 2.7, x, F, z, B.woodDark, { cast: true });
    box(caseG, 0.06, 1.7, 2.6, x - 0.25, F + 0.5, z, B.frame, {});
    box(caseG, 0.06, 1.7, 2.6, x + 0.25, F + 0.5, z, B.frame, {});
    box(caseG, 0.56, 0.06, 2.6, x, F + 2.14, z, B.frame, { cast: true });
    const pane = P.plane(caseG, 2.5, 1.6, x + 0.27, F + 1.28, z, B.glass, { ry: Math.PI / 2, receive: false });
    pane.userData.noPick = true;
    // shelves + retro handhelds
    for (let s = 0; s < 3; s++) {
      box(caseG, 0.44, 0.03, 2.45, x, F + 0.85 + s * 0.42, z, B.wood, { cast: true });
      for (let i = 0; i < 5; i++) {
        box(caseG, 0.18, 0.09, 0.28, x + 0.02, F + 0.89 + s * 0.42, z - 1.0 + i * 0.5,
          [B.white, B.red, B.accBlue, B.black, B.accWood][i % 5], { cast: true });
        box(caseG, 0.16, 0.06, 0.06, x + 0.02, F + 0.985 + s * 0.42, z - 0.95 + i * 0.5, B.white, {});
      }
    }
    // spot inside the case
    P.ico(caseG, 0.05, x, F + 2.05, z - 0.9, P.emissive(0xfff0d0, 2));
    P.ico(caseG, 0.05, x, F + 2.05, z + 0.9, P.emissive(0xfff0d0, 2));
    P.signMesh(caseG, 'RETRO VAULT', 1.3, 0.22, {
      x: x + 0.3, y: F + 2.02, z: z, ry: Math.PI / 2,
      size: 40, texW: 512, texH: 96, color: '#ffd166'
    });
  }

  /* ---- 20 playtest table ---- */
  const expG = P.group(S, 0, 0, 0, 'experienceSet');
  {
    const cx = -8.9, cz = -2.2;
    box(expG, 2.3, 0.03, 1.4, cx, F + 0.02, cz, B.rugOffice, { receive: true }); // rug
    box(expG, 1.9, 0.1, 0.95, cx, F + 0.7, cz, B.wood, { cast: true });
    for (let i = 0; i < 4; i++) {
      cyl(expG, 0.035, 0.04, 0.7, cx - 0.85 + (i % 2) * 1.7, F, cz - 0.38 + Math.floor(i / 2) * 0.76, B.steel, { seg: 6 });
    }
    // controllers + console + drinks
    controller(expG, cx - 0.3, F + 0.8, cz, B.white, 0.3);
    controller(expG, cx + 0.25, F + 0.8, cz - 0.1, B.black, -0.4);
    box(expG, 0.34, 0.08, 0.26, cx + 0.5, F + 0.8, cz + 0.2, B.white, { cast: true });
    cyl(expG, 0.05, 0.05, 0.13, cx - 0.6, F + 0.8, cz + 0.25, P.std(0xc94a3f, 0.6, 0.1), { seg: 8 });
    // two chairs
    function chair(x, z, ry) {
      const c = P.group(expG, x, F, z);
      c.rotation.y = ry;
      box(c, 0.5, 0.07, 0.5, 0, 0.42, 0, B.fabric2, { cast: true });
      box(c, 0.5, 0.5, 0.07, 0, 0.49, 0.24, B.fabric2, { cast: true });
      for (let i = 0; i < 4; i++) cyl(c, 0.025, 0.025, 0.42, -0.2 + (i % 2) * 0.4, 0, -0.2 + Math.floor(i / 2) * 0.4, B.steel, { seg: 5 });
      return c;
    }
    chair(cx - 0.35, cz + 1.05, Math.PI);
    chair(cx + 0.45, cz - 1.05, 0);
  }

  /* ---- 21 counter ---- */
  const counterG = P.group(S, 0, 0, 0, 'counter');
  {
    const x = -5.25, z = -0.1;
    box(counterG, 2.0, 0.95, 0.6, x, F, z, B.woodDark, { cast: true });
    box(counterG, 2.06, 0.05, 0.66, x, F + 0.95, z, B.wood, { cast: true });
    box(counterG, 0.6, 0.95, 0.9, x + 0.7, F, z - 0.15, B.woodDark, { cast: true });
    box(counterG, 0.66, 0.05, 0.96, x + 0.7, F + 0.95, z - 0.15, B.wood, { cast: true });
    // register + screen
    box(counterG, 0.3, 0.12, 0.24, x - 0.3, F + 1.0, z + 0.1, B.black, { cast: true });
    const scr = screenMat(artHud, 512, 288, 0.9);
    P.plane(counterG, 0.26, 0.15, x - 0.3, F + 1.09, z + 0.225, scr, { receive: false });
    // card terminal
    box(counterG, 0.12, 0.08, 0.16, x + 0.1, F + 1.0, z + 0.15, B.darkSteel, {});
    P.plane(counterG, 0.09, 0.06, x + 0.1, F + 1.045, z + 0.235, P.emissive(0x5fe0ff, 1.2), { receive: false });
    // bags + receipt
    for (let i = 0; i < 3; i++) {
      box(counterG, 0.18, 0.24, 0.08, x - 0.75 + i * 0.24, F + 1.0, z - 0.12, B.white, {});
    }
    P.signMesh(counterG, 'CHECKOUT', 1.4, 0.22, {
      x: x, y: F + 1.28, z: z - 0.32, ry: Math.PI,
      size: 42, texW: 512, texH: 96, color: '#dff8ff'
    });
    // staff stool
    cyl(counterG, 0.2, 0.2, 0.06, x - 0.6, F + 0.55, z - 0.55, B.fabric, { seg: 10, cast: true });
    cyl(counterG, 0.03, 0.03, 0.55, x - 0.6, F, z - 0.55, B.steel, { seg: 6 });
  }

  /* ---- 22 demo TV wall ---- */
  const tvWallG = P.group(S, 0, 0, 0, 'tvWall');
  {
    const x = -3.62, z = -3.2;
    box(tvWallG, 0.06, 2.0, 2.6, x, F + 0.45, z, B.frame, { cast: true });
    const arts = [artGame1, artGame2, artGame3];
    for (let i = 0; i < 3; i++) {
      const zz = z - 0.8 + i * 0.8;
      box(tvWallG, 0.08, 0.82, 0.72, x + 0.05, F + 1.05, zz, B.black, { cast: true });
      const mat = screenMat(arts[i], 512, 288, 1.15);
      P.plane(tvWallG, 0.62, 0.44, x + 0.1, F + 1.4, zz, mat, { ry: -Math.PI / 2, receive: false });
      // controller shelf under each screen
      box(tvWallG, 0.2, 0.03, 0.5, x + 0.11, F + 0.98, zz, B.darkSteel, {});
      controller(tvWallG, x + 0.15, F + 1.02, zz, B.white, Math.PI / 2 + 0.2);
    }
    // signage above
    P.signMesh(tvWallG, 'DEMO ZONE', 1.6, 0.25, {
      x: x + 0.06, y: F + 2.15, z: z, ry: -Math.PI / 2,
      size: 46, texW: 512, texH: 96, color: '#5fe0ff', glow: 'rgba(95,224,255,.5)'
    });
  }

  /* =====================  WAREHOUSE INTERIOR  ===================== */
  const WF = 0.3;
  /* ---- 24 industrial racks ---- */
  const racksG = P.group(S, 0, 0, 0, 'racks');
  {
    const bx = 7.75;
    for (let bay = 0; bay < 3; bay++) {
      const z = -5.55 + bay * 1.8;
      for (let s = 0; s < 4; s++) {
        box(racksG, 1.0, 0.05, 1.62, bx, WF + 0.35 + s * 0.66, z, B.steel, { cast: true });
        // contents
        for (let k = 0; k < 2; k++) {
          if (P.rand() > 0.22) {
            box(racksG, 0.72, 0.4, 0.64, bx, WF + 0.4 + s * 0.66, z - 0.4 + k * 0.8,
              P.rand() > 0.5 ? B.crate : B.crate2, { cast: true });
          }
        }
      }
      for (let i = 0; i < 2; i++) {
        box(racksG, 0.08, 2.9, 0.08, bx - 0.48 + i * 0.96, WF, z - 0.78, B.steel, { cast: true });
      }
    }
    // top shelf labels
    for (let i = 0; i < 3; i++) {
      box(racksG, 0.5, 0.14, 0.02, bx - 0.51, WF + 2.48, -5.55 + i * 1.8 + 0.7, B.white, { receive: false });
    }
    // safety stripe on floor
    box(racksG, 0.06, 0.008, 6.4, bx - 0.75, WF + 0.005, -3.0, P.std(0xd8b23f, 0.8, 0.02), { receive: false });
  }

  /* ---- 25 cartons ---- */
  const boxesG = P.group(S, 0, 0, 0, 'boxes');
  {
    const base = [[2.9, -4.6], [4.1, -4.7], [5.3, -4.5], [3.4, -3.6], [4.8, -3.5], [2.6, -2.8], [5.6, -2.6]];
    for (const [x, z] of base) {
      const n = 1 + Math.floor(P.rand() * 3);
      for (let i = 0; i < n; i++) {
        const s = 0.7 + P.rand() * 0.25;
        box(boxesG, s, s * 0.8, s, x + P.rr(-0.05, 0.05), WF + i * s * 0.82, z, P.rand() > 0.55 ? B.crate : B.crate2, { cast: true });
        // tape stripe
        box(boxesG, s * 1.01, 0.02, 0.1, x, WF + i * s * 0.82 + s * 0.8, z, B.tape, { receive: false });
      }
    }
    // PRUN label on one box
    P.signMesh(boxesG, 'PRUN', 0.5, 0.16, {
      x: 4.1, y: WF + 0.5, z: -4.7 + 0.5, size: 46, texW: 256, texH: 80,
      color: '#3a2a1c', spacing: 4
    });
    // pallet under the stack
    box(boxesG, 2.8, 0.1, 2.6, 4.2, WF - 0.0, -3.8, B.woodDark, { receive: true });
  }

  /* ---- 26 parts bay ---- */
  const partsG = P.group(S, 0, 0, 0, 'parts');
  {
    box(partsG, 3.6, 1.6, 0.5, 1.9, WF, -6.15, B.darkSteel, { cast: true });
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        box(partsG, 0.5, 0.36, 0.06, 0.3 + c * 0.56, WF + 0.15 + r * 0.46, -5.88, B.frameLight, {});
        box(partsG, 0.24, 0.03, 0.02, 0.3 + c * 0.56, WF + 0.42 + r * 0.46, -5.84, B.steel, { receive: false });
        box(partsG, 0.42, 0.1, 0.004, 0.3 + c * 0.56, WF + 0.3 + r * 0.46, -5.84,
          [B.accGold, B.accRed, B.accGreen][c % 3], { receive: false });
      }
    }
    // bin on top with cables
    box(partsG, 1.4, 0.3, 0.4, 1.9, WF + 1.6, -6.15, B.tote, { cast: true });
    for (let i = 0; i < 5; i++) {
      const ring = new T.Mesh(new T.TorusGeometry(0.1, 0.025, 5, 10), B.black);
      ring.position.set(1.4 + i * 0.22, WF + 1.92, -6.15);
      ring.rotation.x = Math.PI / 2;
      partsG.add(ring);
    }
    P.signMesh(partsG, 'PARTS · A–F', 1.6, 0.22, {
      x: 1.9, y: WF + 1.75, z: -5.88, size: 40, texW: 512, texH: 96, color: '#ffb35c'
    });
  }

  /* ---- 27 awaiting service ---- */
  const awaitG = P.group(S, 0, 0, 0, 'awaiting');
  {
    const cx = -1.3, cz = -2.9;
    box(awaitG, 2.4, 0.1, 1.5, cx, WF, cz, B.woodDark, { receive: true });
    for (let i = 0; i < 3; i++) {
      const x = cx - 0.75 + i * 0.75;
      box(awaitG, 0.5, 0.09, 0.34, x, WF + 0.12, cz, [B.white, B.black, B.accGreen][i], { cast: true });
      box(awaitG, 0.44, 0.02, 0.28, x, WF + 0.2, cz, B.darkSteel, {});
      // service tag
      box(awaitG, 0.14, 0.09, 0.005, x + 0.18, WF + 0.24, cz + 0.19, P.std(0xd8b23f, 0.8, 0.02), { receive: false });
      box(awaitG, 0.1, 0.02, 0.005, x + 0.18, WF + 0.28, cz + 0.195, B.black, { receive: false });
      // cable
      cyl(awaitG, 0.012, 0.012, 0.3, x - 0.2, WF + 0.16, cz - 0.2, B.black, { seg: 4, rx: 0.9 });
    }
    // standing A-frame sign beside the pallet (not a plank on the floor)
    box(awaitG, 1.5, 0.5, 0.06, cx, WF + 0.55, cz + 0.74, B.frame, { cast: true });
    P.signMesh(awaitG, 'AWAITING SERVICE', 1.38, 0.34, {
      x: cx, y: WF + 0.62, z: cz + 0.78, size: 38, texW: 512, texH: 96, color: '#ffcf9e'
    });
    for (const side of [-1, 1]) {
      box(awaitG, 0.05, 0.55, 0.05, cx + side * 0.6, WF + 0.02, cz + 0.72, B.steel);
    }
  }

  /* ---- 28 tool cart ---- */
  const cartG = P.group(S, 0, 0, 0, 'toolCart');
  {
    const x = 1.7, z = -1.0;
    box(cartG, 0.9, 0.06, 0.55, x, WF + 0.72, z, B.red, { cast: true });
    box(cartG, 0.9, 0.06, 0.55, x, WF + 0.46, z, B.red, { cast: true });
    box(cartG, 0.9, 0.06, 0.55, x, WF + 0.2, z, B.red, { cast: true });
    for (let i = 0; i < 4; i++) {
      box(cartG, 0.04, 0.7, 0.04, x - 0.42 + (i % 2) * 0.84, WF + 0.1, z - 0.24 + Math.floor(i / 2) * 0.48, B.steel, {});
      P.cyl(cartG, 0.055, 0.055, 0.05, x - 0.42 + (i % 2) * 0.84, WF + 0.02, z - 0.24 + Math.floor(i / 2) * 0.48, B.black, { seg: 8, rx: Math.PI / 2 });
    }
    // handle
    cyl(cartG, 0.025, 0.025, 0.8, x, WF + 0.72, z + 0.3, B.steel, { seg: 5, rz: Math.PI / 2 });
    // tools on top
    box(cartG, 0.3, 0.08, 0.2, x - 0.2, WF + 0.78, z, B.darkSteel, {});
    for (let i = 0; i < 4; i++) {
      cyl(cartG, 0.015, 0.015, 0.26, x + 0.05 + i * 0.07, WF + 0.8, z, B.steel, { seg: 4, rx: Math.PI / 2 });
    }
    box(cartG, 0.24, 0.05, 0.16, x + 0.25, WF + 0.78, z + 0.05, B.black, {});
  }

  /* =====================  SECOND FLOOR  ===================== */
  const UF = 3.4; // second floor finished level

  /* ---- pendants ---- */
  const pendantBulbs = [];
  function pendant(x, z, warm) {
    const g = P.group(S, x, 6.16, z);
    cyl(g, 0.012, 0.012, 0.95, 0, -0.95, 0, B.black, { seg: 4 });
    const shade = cyl(g, 0.1, 0.42, 0.3, 0, -1.22, 0, B.darkSteel, { seg: 12 });
    shade.castShadow = true;
    const bulbMat = P.emissive(warm ? 0xffc98a : 0xffe0b0, 1.8);
    P.ico(g, 0.1, 0, -1.34, 0, bulbMat);
    // soft cone, from the shade down to the lounge floor (never through it)
    const coneGeo = new T.CylinderGeometry(0.3, 1.5, 1.5, 20, 1, true);
    const coneMat = new T.MeshBasicMaterial({
      color: warm ? 0xffc98a : 0xffe2c0, transparent: true, opacity: 0.045,
      depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false
    });
    const cone = new T.Mesh(coneGeo, coneMat);
    cone.position.set(0, -2.05, 0);
    g.add(cone);
    pendantBulbs.push({ mat: bulbMat, coneMat: coneMat });
    return g;
  }
  pendant(-11.0, -2.6, true);
  pendant(-6.9, -3.0, true);
  pendant(-0.6, -3.2, true);
  pendant(2.6, -2.6, true);
  pendant(6.3, -3.4, true);
  P.pendantBulbs = pendantBulbs;

  /* ---- 29 office ---- */
  const officeG = P.group(S, 0, 0, 0, 'office');
  {
    // rug
    const officeRug = box(officeG, 4.4, 0.03, 3.0, -9.0, UF, -2.9, B.rugOffice, { receive: true });
    officeRug.userData.noPick = true;
    // partition glass to the lounge
    const pane = P.plane(officeG, 7.3, 2.75, -3.6, UF + 1.4, -2.75, B.glass, { ry: Math.PI / 2, receive: false });
    pane.userData.noPick = true;
    // partition frame
    box(officeG, 0.12, 2.9, 0.12, -3.6, UF, -6.4, B.frame, { cast: true });
    box(officeG, 0.12, 2.9, 0.12, -3.6, UF, 0.8, B.frame, { cast: true });
    box(officeG, 0.12, 0.12, 7.2, -3.6, UF + 2.78, -2.75, B.frame, { cast: true });
    box(officeG, 0.12, 0.1, 7.2, -3.6, UF + 0.1, -2.75, B.frame, { cast: true });
    // frosted band
    const frost = new T.MeshStandardMaterial({ color: 0xbfc9d4, roughness: 0.9, transparent: true, opacity: 0.22, depthWrite: false });
    P.plane(officeG, 7.0, 0.5, -3.59, UF + 2.4, -2.75, frost, { ry: Math.PI / 2, receive: false }).userData.noPick = true;
    // door gap frame at z -1.1
    box(officeG, 0.12, 2.9, 0.12, -3.6, UF, -1.75, B.frame, { cast: true });
    box(officeG, 0.12, 2.9, 0.12, -3.6, UF, -0.75, B.frame, { cast: true });
    // wall art
    box(officeG, 0.06, 0.9, 1.5, -12.88, UF + 1.5, -4.4, B.frame, {});
    const art = P.canvasTexture(256, 160, (ctx, w, h) => {
      ctx.fillStyle = '#101820'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2f5a6e';
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * 0.35, h * 0.3); ctx.lineTo(w * 0.6, h); ctx.fill();
      ctx.fillStyle = '#c46a3f';
      ctx.beginPath(); ctx.arc(w * 0.72, h * 0.38, 24, 0, 6.28); ctx.fill();
      ctx.strokeStyle = 'rgba(200,230,245,.4)'; ctx.strokeRect(10, 10, w - 20, h - 20);
    });
    P.plane(officeG, 1.4, 0.8, -12.84, UF + 1.95, -4.4, new T.MeshBasicMaterial({ map: art }), { ry: Math.PI / 2 });
    // ceiling beams
    for (let i = 0; i < 4; i++) box(officeG, 9.2, 0.1, 0.12, -8.8, UF + 2.82, -5.6 + i * 1.7, B.frame).userData.noPick = true;
    P.officeFloorY = UF;
  }

  /* ---- 30 desk ---- */
  const deskG = P.group(S, 0, 0, 0, 'desk');
  {
    const x = -9.35, z = -3.1;
    box(deskG, 2.8, 0.08, 0.95, x, UF + 0.72, z, B.desk, { cast: true });
    box(deskG, 0.08, 0.72, 0.85, x - 1.34, UF, z, B.desk, { cast: true });
    box(deskG, 0.08, 0.72, 0.85, x + 1.34, UF, z, B.desk, { cast: true });
    box(deskG, 2.5, 0.3, 0.06, x, UF + 0.36, z + 0.36, B.desk, {});
    // papers + pen + coffee
    for (let i = 0; i < 3; i++) {
      box(deskG, 0.3, 0.01, 0.42, x - 0.9 + i * 0.06, UF + 0.8 + i * 0.008, z + 0.18, B.white, { ry: P.rr(-0.2, 0.2), receive: false });
    }
    cyl(deskG, 0.045, 0.05, 0.1, x + 0.95, UF + 0.8, z + 0.2, P.std(0xd8d4cc, 0.7, 0.02), { seg: 8 });
    box(deskG, 0.22, 0.02, 0.08, x - 0.2, UF + 0.8, z + 0.32, B.black, { receive: false });
    // desk lamp
    cyl(deskG, 0.02, 0.03, 0.5, x - 1.15, UF + 0.8, z - 0.2, B.steel, { seg: 5 });
    P.ico(deskG, 0.09, x - 1.0, UF + 1.28, z - 0.2, P.emissive(0xffe0b0, 1.3));
    // drawer unit
    box(deskG, 0.5, 0.6, 0.7, x + 1.0, UF + 0.1, z - 0.1, B.desk, { cast: true });
    for (let i = 0; i < 3; i++) box(deskG, 0.44, 0.03, 0.02, x + 1.0, UF + 0.22 + i * 0.18, z + 0.26, B.steel);
  }

  /* ---- 31 blue monitor ---- */
  const monitorG = P.group(S, 0, 0, 0, 'monitor');
  {
    const x = -8.45, z = -3.0;
    box(monitorG, 0.1, 0.08, 0.2, x + 0.3, UF + 0.8, z, B.black, { rx: 0, cast: true });
    cyl(monitorG, 0.03, 0.03, 0.28, x + 0.35, UF + 0.8, z, B.black, { seg: 6 });
    const g = P.group(monitorG, x, UF + 1.05, z);
    g.rotation.y = -0.32;
    box(g, 0.96, 0.56, 0.05, 0, 0, 0, B.black, { cast: true });
    const mat = screenMat((ctx, w, h) => {
      ctx.fillStyle = '#03101f'; ctx.fillRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(40,140,255,.30)'); grad.addColorStop(1, 'rgba(0,20,60,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#4fb7ff'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 5) {
          const y = h * (0.3 + i * 0.13) + Math.sin(x * 0.03 + i) * 14;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.8 - i * 0.15; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(180,225,255,.9)'; ctx.font = '600 20px monospace';
      ctx.fillText('PRUN OS · SALES', 18, 34);
      ctx.fillStyle = '#7dffb2'; ctx.font = '500 14px monospace';
      ctx.fillText('REVENUE   +18.4%', 18, 60);
      ctx.fillText('ORDERS    142', 18, 82);
      ctx.fillStyle = 'rgba(95,224,255,.5)';
      ctx.fillRect(18, h - 30, w - 36, 6);
    }, 512, 288, 1.35);
    P.plane(g, 0.88, 0.48, 0, 0, 0.032, mat, { receive: false });
    // small blue glow bar under the monitor
    P.ico(monitorG, 0.03, x + 0.35, UF + 0.82, z + 0.2, P.emissive(0x4fb7ff, 2.2));
    // keyboard
    box(monitorG, 0.5, 0.03, 0.16, x + 0.45, UF + 0.8, z + 0.32, B.darkSteel, {});
    // notebook
    box(monitorG, 0.24, 0.02, 0.3, x - 0.5, UF + 0.8, z + 0.28, P.std(0x3a4a5c, 0.8, 0.05), { receive: false });
  }

  /* ---- 32 boss chair ---- */
  const bossChairG = P.group(S, 0, 0, 0, 'bossChair');
  {
    const x = -9.1, z = -3.95;
    box(bossChairG, 0.62, 0.12, 0.6, x, UF + 0.42, z, P.std(0x22262c, 0.85, 0.05), { cast: true });
    box(bossChairG, 0.6, 0.85, 0.12, x, UF + 0.54, z - 0.32, P.std(0x22262c, 0.85, 0.05), { cast: true });
    box(bossChairG, 0.62, 0.1, 0.1, x, UF + 1.28, z - 0.36, B.steel, {});
    box(bossChairG, 0.1, 0.4, 0.5, x - 0.34, UF + 0.55, z, B.black, {});
    box(bossChairG, 0.1, 0.4, 0.5, x + 0.34, UF + 0.55, z, B.black, {});
    cyl(bossChairG, 0.04, 0.04, 0.42, x, UF, z, B.steel, { seg: 8 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      box(bossChairG, 0.34, 0.04, 0.07, x + Math.cos(a) * 0.2, UF + 0.03, z + Math.sin(a) * 0.2, B.black, { ry: -a });
    }
  }

  /* ---- 33 guest chair ---- */
  const guestChairG = P.group(S, 0, 0, 0, 'guestChair');
  {
    const g = P.group(guestChairG, -7.55, UF, -2.05);
    g.rotation.y = -2.5;
    box(g, 0.52, 0.08, 0.5, 0, 0.42, 0, B.fabric2, { cast: true });
    box(g, 0.52, 0.5, 0.08, 0, 0.5, 0.23, B.fabric2, { cast: true });
    for (let i = 0; i < 4; i++) {
      cyl(g, 0.022, 0.022, 0.42, -0.21 + (i % 2) * 0.42, 0, -0.2 + Math.floor(i / 2) * 0.4, B.steel, { seg: 5 });
    }
  }

  /* ---- 34 file cabinet ---- */
  const cabinetG = P.group(S, 0, 0, 0, 'cabinet');
  {
    const x = -12.55, z = -1.4;
    box(cabinetG, 0.62, 1.5, 1.0, x, UF, z, B.darkSteel, { cast: true });
    for (let i = 0; i < 3; i++) {
      box(cabinetG, 0.58, 0.4, 0.02, x + 0.33, UF + 0.12 + i * 0.46, z, B.frameLight, {});
      box(cabinetG, 0.02, 0.04, 0.2, x + 0.35, UF + 0.3 + i * 0.46, z, B.steel);
    }
    // papers on top
    box(cabinetG, 0.4, 0.1, 0.3, x, UF + 1.5, z + 0.1, B.white, {});
    // printer
    box(cabinetG, 0.5, 0.24, 0.4, x, UF + 1.5, z - 0.25, B.white, { cast: true });
  }

  /* ---- 35 large plant ---- */
  const plantG = P.group(S, 0, 0, 0, 'plant');
  {
    const x = -12.3, z = -5.6;
    cyl(plantG, 0.34, 0.28, 0.55, x, UF, z, B.pot, { seg: 12, cast: true });
    cyl(plantG, 0.31, 0.31, 0.03, x, UF + 0.5, z, B.earth, { seg: 12 });
    cyl(plantG, 0.05, 0.07, 1.4, x, UF + 0.5, z, P.std(0x5a4632, 0.9, 0.02), { seg: 7 });
    const clusters = [
      [0, 2.1, 0, 0.55], [-0.35, 1.8, 0.15, 0.42], [0.35, 1.9, -0.1, 0.45],
      [0.1, 2.35, 0.25, 0.4], [-0.2, 1.55, -0.3, 0.35], [0.3, 1.6, 0.3, 0.33]
    ];
    for (const [dx, dy, dz, r] of clusters) {
      P.ico(plantG, r, x + dx, UF + dy, z + dz, P.rand() > 0.5 ? B.plant : B.plant2, { cast: true, ry: r * 0.8 });
    }
  }

  /* ---- 36 lounge ---- */
  const loungeG = P.group(S, 0, 0, 0, 'lounge');
  {
    box(loungeG, 5.6, 0.03, 3.6, 1.6, UF, -3.4, B.rug, { receive: true }).userData.noPick = true;
    // ceiling beams
    for (let i = 0; i < 4; i++) box(loungeG, 11.6, 0.1, 0.12, 2.5, UF + 2.82, -5.6 + i * 1.7, B.frame).userData.noPick = true;
    // arcade glow pools
    // neon strip over the lounge partition
    P.loungeStripMat = new T.MeshStandardMaterial({ color: 0x241a16, emissive: 0xff9a5c, emissiveIntensity: 0.45, roughness: 0.5 });
    box(loungeG, 0.05, 0.05, 5.8, 7.9, UF + 2.6, -3.2, P.loungeStripMat, { receive: false });
    // small plants
    cyl(loungeG, 0.2, 0.17, 0.35, -2.9, UF, -5.8, B.pot, { seg: 10, cast: true });
    P.ico(loungeG, 0.36, -2.9, UF + 0.55, -5.8, B.plant, { cast: true });
    // floor lamp beside the sofa
    cyl(loungeG, 0.025, 0.04, 1.5, 4.6, UF, -5.6, B.steel, { seg: 6, cast: true });
    const lampShade = P.cyl(loungeG, 0.28, 0.36, 0.32, 4.6, UF + 1.5, -5.6, P.emissive(0xffd9a8, 0.9), { seg: 12, open: true });
    lampShade.castShadow = false;
    P.lightPool(loungeG, 4.6, -5.0, 1.2, 0xffc98a, 0.07, UF + 0.02);
  }

  /* ---- 37 sofa ---- */
  const sofaG = P.group(S, 0, 0, 0, 'sofa');
  {
    const x = 1.8, z = -5.75;
    box(sofaG, 3.7, 0.42, 1.05, x, UF + 0.1, z, B.fabric, { cast: true });
    box(sofaG, 3.7, 0.72, 0.22, x, UF + 0.5, z - 0.43, B.fabric, { cast: true });
    box(sofaG, 0.22, 0.5, 1.0, x - 1.9, UF + 0.3, z, B.fabric, { cast: true });
    box(sofaG, 0.22, 0.5, 1.0, x + 1.9, UF + 0.3, z, B.fabric, { cast: true });
    // cushions
    for (let i = 0; i < 3; i++) {
      box(sofaG, 1.08, 0.16, 0.85, x - 1.14 + i * 1.14, UF + 0.5, z + 0.03, P.std(0x4aa39a, 0.95, 0.01), { cast: true });
    }
    for (let i = 0; i < 2; i++) {
      box(sofaG, 0.34, 0.34, 0.12, x - 0.9 + i * 1.8, UF + 0.66, z - 0.28, P.std(0x8a6a4f, 0.95, 0.01), { ry: P.rr(-0.2, 0.2) });
    }
    // throw blanket
    box(sofaG, 0.7, 0.06, 0.9, x + 1.25, UF + 0.66, z + 0.08, P.std(0xc9a43c, 0.95, 0.02), {});
  }

  /* ---- 38 coffee table ---- */
  const coffeeG = P.group(S, 0, 0, 0, 'coffeeTable');
  {
    const x = 1.9, z = -4.15;
    box(coffeeG, 2.2, 0.07, 1.0, x, UF + 0.38, z, P.std(0x8a6a45, 0.6, 0.08), { cast: true });
    for (let i = 0; i < 4; i++) {
      cyl(coffeeG, 0.03, 0.03, 0.38, x - 1.0 + (i % 2) * 2.0, UF, z - 0.42 + Math.floor(i / 2) * 0.84, B.darkSteel, { seg: 5 });
    }
    // cups + tray + remote + magazine
    box(coffeeG, 0.6, 0.02, 0.34, x - 0.2, UF + 0.45, z + 0.05, B.darkSteel, { receive: false });
    for (let i = 0; i < 3; i++) {
      cyl(coffeeG, 0.05, 0.045, 0.11, x - 0.38 + i * 0.2, UF + 0.46, z + 0.05, B.white, { seg: 9 });
      cyl(coffeeG, 0.038, 0.038, 0.005, x - 0.38 + i * 0.2, UF + 0.555, z + 0.05, P.std(0x3a2a1e, 0.5, 0.1), { seg: 9 });
    }
    box(coffeeG, 0.1, 0.03, 0.28, x + 0.6, UF + 0.45, z - 0.1, B.black, { receive: false });
    box(coffeeG, 0.3, 0.015, 0.4, x + 0.55, UF + 0.45, z + 0.28, P.std(0xc9c2b4, 0.9, 0.02), { receive: false });
  }

  /* ---- 39 water dispenser ---- */
  const dispenserG = P.group(S, 0, 0, 0, 'dispenser');
  {
    const x = 7.55, z = -5.55;
    box(dispenserG, 0.55, 0.95, 0.5, x, UF + 0.05, z, B.white, { cast: true });
    box(dispenserG, 0.5, 0.05, 0.45, x, UF + 1.0, z, B.darkSteel, {});
    // bottles
    cyl(dispenserG, 0.19, 0.22, 0.5, x, UF + 1.05, z, new T.MeshPhysicalMaterial({
      color: 0x8fd0ff, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0, clearcoat: 0.5
    }), { seg: 12, cast: true });
    cyl(dispenserG, 0.08, 0.19, 0.16, x, UF + 1.55, z, new T.MeshPhysicalMaterial({
      color: 0x8fd0ff, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0
    }), { seg: 10 });
    // taps
    box(dispenserG, 0.1, 0.04, 0.08, x - 0.12, UF + 0.78, z + 0.26, B.steel, {});
    box(dispenserG, 0.1, 0.04, 0.08, x + 0.1, UF + 0.78, z + 0.26, B.red, {});
    // cup holder
    box(dispenserG, 0.16, 0.14, 0.16, x + 0.2, UF + 1.02, z + 0.15, B.frameLight, {});
  }

  /* ---- 40 wall TV ---- */
  const wallTvG = P.group(S, 0, 0, 0, 'wallTV');
  {
    const z = -6.34;
    box(wallTvG, 2.7, 1.5, 0.1, 1.7, UF + 1.35, z, B.black, { cast: true });
    const mat = screenMat(artNews, 512, 288, 0.95);
    P.plane(wallTvG, 2.56, 1.36, 1.7, UF + 2.1, z + 0.09, mat, { receive: false });
    // soundbar
    box(wallTvG, 1.8, 0.1, 0.12, 1.7, UF + 1.12, z + 0.08, B.darkSteel, {});
    // game console under TV on a small shelf
    box(wallTvG, 1.2, 0.06, 0.4, 1.7, UF + 0.86, z + 0.2, B.wood, { cast: true });
    box(wallTvG, 0.6, 0.12, 0.36, 1.45, UF + 0.92, z + 0.2, B.white, { cast: true });
    box(wallTvG, 0.05, 0.02, 0.02, 1.2, UF + 0.98, z + 0.4, P.emissive(0x5fe0ff, 2), {});
    controller(wallTvG, 2.05, UF + 0.94, z + 0.2, B.black, 0.1);
  }

  /* ---- 41 retro arcade ---- */
  const arcadeG = P.group(S, 0, 0, 0, 'arcade');
  {
    const g = P.group(arcadeG, 7.55, UF, -2.3);
    g.rotation.y = -Math.PI / 2;
    box(g, 1.05, 1.9, 0.75, 0, 0.05, 0, P.std(0x5e2740, 0.6, 0.15), { cast: true });
    box(g, 1.1, 0.35, 0.8, 0, 1.95, 0, P.std(0x3c1828, 0.6, 0.15), { cast: true });
    // marquee
    const marquee = P.canvasTexture(512, 128, (ctx, w, h) => {
      ctx.fillStyle = '#1a0a14'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff5f9e'; ctx.font = '700 56px -apple-system,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ff5f9e'; ctx.shadowBlur = 20;
      ctx.fillText('PRUN ARCADE', w / 2, h / 2 + 2);
    });
    P.plane(g, 0.9, 0.22, 0, 2.08, 0.415, new T.MeshBasicMaterial({ map: marquee, transparent: true, toneMapped: false }), {});
    // screen
    const mat = screenMat(artArcade, 512, 288, 1.3);
    P.plane(g, 0.78, 0.56, 0, 1.42, 0.39, mat, { rx: -0.16, receive: false });
    box(g, 0.88, 0.62, 0.06, 0, 1.13, 0.34, B.black, { cast: true });
    // control panel
    box(g, 1.0, 0.08, 0.4, 0, 0.98, 0.42, P.std(0x2a1a26, 0.7, 0.1), { cast: true });
    cyl(g, 0.02, 0.02, 0.16, -0.22, 1.06, 0.44, B.steel, { seg: 6 });
    P.ico(g, 0.05, -0.22, 1.24, 0.44, P.emissive(0xff5f6d, 1.5));
    for (let i = 0; i < 3; i++) {
      cyl(g, 0.045, 0.045, 0.03, 0.08 + i * 0.14, 1.06, 0.44, [P.emissive(0x5fe0ff, 1.2), P.emissive(0xffd166, 1.2), P.emissive(0x7dffb2, 1.2)][i], { seg: 10 });
    }
    // coin slot glow
    box(g, 0.06, 0.12, 0.02, 0.38, 0.62, 0.39, P.emissive(0xffb35c, 1.4), {});
    // stool
    cyl(arcadeG, 0.19, 0.17, 0.42, 6.45, UF, -2.3, P.std(0x7a3238, 0.85, 0.03), { seg: 10, cast: true });
  }

  /* =====================  RADAR (45)  ===================== */
  const radarG = P.group(S, 0, 0, 0, 'radar');
  {
    cyl(radarG, 0.08, 0.12, 1.5, 6.4, 6.54, -5.4, B.steel, { seg: 8, cast: true });
    const head = P.group(radarG, 6.4, 8.05, -5.4);
    // dish
    const dishGeo = new T.SphereGeometry(0.75, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const dish = new T.Mesh(dishGeo, new T.MeshStandardMaterial({ color: 0x8d969f, roughness: 0.42, metalness: 0.6, side: T.DoubleSide }));
    dish.rotation.x = 1.15;
    const rim = new T.Mesh(new T.TorusGeometry(0.72, 0.035, 6, 24), P.std(0x5c646c, 0.45, 0.6));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0.05, 0.12);
    head.add(rim);
    dish.castShadow = true;
    head.add(dish);
    // feed arm
    cyl(head, 0.015, 0.015, 0.8, 0, 0.1, -0.25, B.steel, { seg: 5, rx: -0.7 });
    P.ico(head, 0.05, 0, 0.32, -0.5, P.emissive(0xff5f6d, 1.6));
    // red beacon
    P.ico(radarG, 0.06, 6.4, 8.0, -5.4, P.emissive(0xff3344, 1.2));
    P.radarHead = head;
  }

  /* =====================  ROOF SNOW  ===================== */
  {
    const mat = new T.MeshBasicMaterial({ color: 0xeef4fb, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const snow = new T.Mesh(new T.PlaneGeometry(21.4, 7.2), mat);
    snow.rotation.x = -Math.PI / 2;
    snow.position.set(-2.25, 6.57, -2.75);
    P.scene.add(snow);
    P.roofSnowMat = mat;
    const canopySnow = new T.Mesh(new T.PlaneGeometry(4.6, 1.9), mat);
    canopySnow.rotation.x = -Math.PI / 2;
    canopySnow.position.set(-8.3, 2.73, 1.95);
    P.scene.add(canopySnow);
    P.canopySnow = canopySnow;
  }

  /* ---- invisible pick proxies for the two glass wings ----
     The frame mullions would otherwise swallow every click aimed at an
     interior object. The proxy sits at the back wall, so interior meshes are
     always closer to the camera along the ray. */
  function pickProxy(parent, w, h, x, y, z, ry) {
    const m = P.plane(parent, w, h, x, y, z, P.proxyMat, { ry: ry || 0, receive: false });
    m.userData.isProxy = true;
    return m;
  }
  pickProxy(storeGlassG, 8.8, 5.4, -8.25, 3.2, -5.62, 0);
  pickProxy(warehouseGlassG, 11.2, 5.4, 2.5, 3.2, -6.62, 0);

  /* =====================  REGISTER 10–41  ===================== */
  const REG = [
    ['sign', '屋顶招牌', 'Rooftop Sign', signG, '“PRUN PLAY STATION — GAMES & SERVICING” 发光字，固定在左翼屋顶的钢架上，绝不闪烁。', ['招牌', '品牌', '夜光']],
    ['storeGlass', '玻璃店面', 'Store Glass Front', storeGlassG, '左翼游戏店的整面玻璃幕墙，高透低反射，只留一圈淡淡边缘反光，内部陈设一览无余。', ['玻璃幕墙', '店面', '通透']],
    ['canopy', '入口门头', 'Entrance Canopy', canopyG, '深色悬挑雨棚与青色灯带，门垫上印着 OPEN，推门就是主轴服务区。', ['入口', '雨棚', '灯带']],
    ['repairBench', '主机检修台', 'Console Service Bench', benchG, '拆开的白色主机、零件盘和鹅颈灯。电玩服务区的第一张工作面。', ['维修', '工作台', '电玩服务']],
    ['tester', '检测仪器', 'Diagnostic Instruments', testerG, '示波器与信号分析仪，屏幕上实时跑着波形，通过线缆接到待检修主机。', ['检测', '仪器', '诊断 HUD']],
    ['controllerStand', '手柄支架', 'Controller Stand', ctrlStandG, '三层木质展架，黑白红三色手柄按批次排列，每层挂着手写价签。', ['手柄', '展架', '配件']],
    ['accessoryShelf', '配件货架', 'Accessory Shelves', accessG, '四层工业货架，收纳手柄、线材、收纳包与限定配件，颜色分区一眼可辨。', ['货架', '配件', '收纳']],
    ['displayCase', '游戏陈列柜', 'Game Display Case', caseG, '玻璃展柜里的复古掌机与卡带，柜顶两枚小射灯把玻璃打亮。', ['陈列', '复古', '玻璃柜']],
    ['toolWall', '工具墙', 'Tool Wall', toolWallG, '洞洞板工具墙：螺丝刀、扳手、热风枪与喷罐各就各位，维修动线的中心。', ['工具', '洞洞板', '维修']],
    ['teardown', '拆机维修设备', 'Teardown Station', teardownG, '拆机台配有防静电垫与腕带，主板、风扇与外壳分解摆放在防静电毯上。', ['拆机', '防静电', '维修']],
    ['experienceSet', '体验桌椅', 'Playtest Table', expG, '试玩桌配两把椅子、两只手柄和一台小主机，是玩家决定买不买的地方。', ['试玩', '桌椅', '体验']],
    ['counter', '收银台', 'Checkout Counter', counterG, 'L 形木质收银台，收款机、刷卡机与纸袋；台面下藏着维修单抽屉。', ['收银', '前台', '服务']],
    ['tvWall', '试玩电视墙', 'Demo TV Wall', tvWallG, '三块竖向排列的试玩屏，轮播三款自制演示，屏幕下方各配一只手柄。', ['电视墙', '试玩', '演示']],
    ['warehouseGlass', '仓库玻璃翼楼', 'Warehouse Glass Wing', warehouseGlassG, '右翼加宽的双层玻璃仓库，工业竖框与高透玻璃，从街上能看见货架与作业区。', ['仓库', '玻璃翼楼', '工业']],
    ['racks', '工业货架', 'Industrial Racking', racksG, '三层高位货架，纸箱与设备按库位码放，黄色安全线划出货架边界。', ['货架', '仓储', '库位']],
    ['boxes', '游戏设备纸箱', 'Device Cartons', boxesG, '成堆的 PRUN 纸箱，封箱胶带与手写标签，木托盘压在最下面。', ['纸箱', '物流', '托盘']],
    ['parts', '主机配件区', 'Console Parts Bay', partsG, '六列零件抽屉与线材筐，每个抽屉贴着色标，维修工按编码取件。', ['零件', '抽屉', '线材']],
    ['awaiting', '待检修设备区', 'Awaiting Service', awaitG, '三台贴了黄色工单的待修主机，线缆绕好，等检测工位叫号。', ['待修', '工单', '主机']],
    ['toolCart', '工具车', 'Tool Cart', cartG, '红色三层工具车，万向轮与推手，常用工具随手可取。', ['工具车', '维修', '移动']],
    ['office', '老板办公室', 'Owner’s Office', officeG, '二楼左翼的玻璃隔间办公室：深色地毯、工业吊灯与磨砂腰带，安静但不封闭。', ['办公室', '玻璃隔间', '二楼']],
    ['desk', '深色办公桌', 'Executive Desk', deskG, '两张深胡桃木桌拼成的老板桌，抽屉柜、台灯、文件与一杯没喝完的咖啡。', ['办公桌', '胡桃木', '老板']],
    ['monitor', '蓝光显示器', 'Blue Glow Monitor', monitorG, '显示销售看板的蓝光屏，键盘、便签与一本翻开的笔记本。', ['显示器', '蓝光', '数据']],
    ['bossChair', '老板椅', 'Boss Chair', bossChairG, '高背真皮转椅，五爪底座，扶手微微外扩。', ['座椅', '老板', '办公']],
    ['guestChair', '客椅', 'Guest Chair', guestChairG, '面向办公桌的客椅，访客或汇报工作的员工坐在这里。', ['座椅', '访客', '办公']],
    ['cabinet', '文件柜', 'File Cabinet', cabinetG, '三抽铁皮文件柜，顶上放着合同与一台小型打印机。', ['文件柜', '收纳', '办公']],
    ['plant', '大型绿植', 'Large Plant', plantG, '办公室角落的散尾葵，陶盆与六丛叶团，把硬朗的工业空间柔化。', ['绿植', '软装', '角落']],
    ['lounge', '员工休息区', 'Staff Lounge', loungeG, '二楼右翼的休息区：地毯、暖光灯带与靠窗的街景，是员工换气的地方。', ['休息区', '二楼', '暖光']],
    ['sofa', '长沙发', 'Long Sofa', sofaG, '三座布艺长沙发，靠背正对电视，扶手上搭着一条黄色毯子。', ['沙发', '休息', '布艺']],
    ['coffeeTable', '茶几与杯子', 'Coffee Table', coffeeG, '木面茶几上放着托盘、三只杯子和遥控器，杯底还留着水痕。', ['茶几', '杯子', '日常']],
    ['dispenser', '饮水机', 'Water Dispenser', dispenserG, '白色饮水机顶着蓝色水桶，冷热两个龙头与一摞纸杯。', ['饮水机', '水桶', '休息区']],
    ['wallTV', '壁挂电视', 'Wall TV', wallTvG, '挂在休息区后墙的大屏电视，正在播 PRUN NEWS，下面摆着游戏主机与手柄。', ['电视', '新闻', '壁挂']],
    ['arcade', '复古街机', 'Retro Arcade', arcadeG, '一台还在营业的复古街机，灯箱写着 PRUN ARCADE，屏幕里跑着 1987 年的高分。', ['街机', '复古', '霓虹']],
    ['radar', '雷达', 'Radar Array', radarG, '屋顶的搜索雷达，平时静止；巨物警报时开始旋转扫描。', ['雷达', '屋顶', '警报']]
  ];
  for (const [id, name, en, group, desc, tags] of REG) {
    P.register({ id, name, en, group, desc, tags });
  }

  /* =====================  UPDATE  ===================== */
  P.onUpdate(function buildingUpdate(dt, t) {
    const st = P.state;
    const night = P.isNight() ? 1 : 0;
    const dark = 1 - Math.min(1, P.sun.intensity / 2.2);

    // interior lights: stronger at night / rain
    const interior = 0.25 + night * 0.9 + st.rain * 0.2;
    P.storeLight.intensity += ((78 * interior + 58) - P.storeLight.intensity) * Math.min(1, dt * 2);
    P.wareLight.intensity += ((86 * interior + 66) - P.wareLight.intensity) * Math.min(1, dt * 2);
    P.officeLight.intensity += ((night * 62 + 55) - P.officeLight.intensity) * Math.min(1, dt * 2);
    P.loungeLight.intensity += ((night * 78 + 64) - P.loungeLight.intensity) * Math.min(1, dt * 2);

    P.ceilingGlow[0].emissiveIntensity += ((0.42 + night * 0.5) - P.ceilingGlow[0].emissiveIntensity) * Math.min(1, dt * 4);

    // pendant bulbs
    for (const p of P.pendantBulbs) {
      p.mat.emissiveIntensity += ((1.1 + night * 0.8) - p.mat.emissiveIntensity) * Math.min(1, dt * 3);
      p.coneMat.opacity += ((0.028 + night * 0.04 + st.rain * 0.012) - p.coneMat.opacity) * Math.min(1, dt * 3);
    }
    // signs — steady, no flicker
    P.signBarMat.emissiveIntensity += ((0.8 + night * 0.6) - P.signBarMat.emissiveIntensity) * Math.min(1, dt * 3);
    P.roofStripMat.emissiveIntensity += ((night * 1.4 + st.rain * 0.3) - P.roofStripMat.emissiveIntensity) * Math.min(1, dt * 3);
    P.canopyStripMat.emissiveIntensity += ((0.5 + night * 0.9) - P.canopyStripMat.emissiveIntensity) * Math.min(1, dt * 3);
    P.loungeStripMat.emissiveIntensity += ((0.35 + night * 1.1) - P.loungeStripMat.emissiveIntensity) * Math.min(1, dt * 3);
    P.coveMat.emissiveIntensity += ((0.25 + night * 1.15) - P.coveMat.emissiveIntensity) * Math.min(1, dt * 3);
    P.downlightMat.emissiveIntensity += ((0.3 + night * 1.4) - P.downlightMat.emissiveIntensity) * Math.min(1, dt * 3);
    // radar spins during alert
    if (P.radarHead) {
      const spin = P.state.alert ? 1 : 0;
      P.radarHead.rotation.y += dt * 2.4 * spin;
      P.radarHead.rotation.x += ((P.state.alert ? 0.12 : 0) - P.radarHead.rotation.x) * Math.min(1, dt * 3);
    }
    // snow on roof + canopy
    const snowT = st.season === 'winter' ? 0.72 : 0;
    P.roofSnowMat.opacity += (snowT - P.roofSnowMat.opacity) * Math.min(1, dt * 1.6);
    P.canopySnow.visible = P.roofSnowMat.opacity > 0.01;
    // monitor screen: subtle breathing blue, never flicker
    // (kept static to avoid overexposure)
  });

  console.log('[PRUN] building ready · registry', P.registry.length);
})();
