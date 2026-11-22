/* =========================================================
   PRUN PLAY STATION — the colossal machine
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T, S = P.scene;

  const mechG = P.group(S, -16.2, 0.03, 9.0, 'mech');
  const headG = P.group(mechG, 0, 0, 0, 'mechHead');

  const matSteel = P.std(0x565c64, 0.48, 0.66);
  const matPlate = P.std(0x6a7078, 0.42, 0.62);
  const matDark = P.std(0x2b3036, 0.6, 0.5);
  const matRust = P.std(0x6b4535, 0.8, 0.25);
  const matRed = new T.MeshStandardMaterial({
    color: 0x3a0d12, emissive: 0xff2233, emissiveIntensity: 0, roughness: 0.45
  });
  const matChest = new T.MeshStandardMaterial({
    color: 0x2a0a0e, emissive: 0xff3a22, emissiveIntensity: 0, roughness: 0.5
  });

  /* ----- shoulders / torso chassis ----- */
  // grounded hover base so the machine never looks like it floats
  P.box(mechG, 2.9, 0.55, 3.8, 0, 0.0, 0, matDark, { cast: true });
  P.box(mechG, 2.2, 0.18, 3.0, 0, 0.55, 0, matSteel, {});
  const torso = P.box(mechG, 3.0, 2.6, 4.4, 0, 0.55, 0, matSteel, { cast: true });
  P.box(mechG, 2.4, 0.5, 4.8, -0.2, 3.0, 0, matDark, { cast: true });
  // chest core — a round reactor, not a letter shape
  P.cyl(mechG, 0.3, 0.3, 0.1, 1.55, 1.5, 0, matChest, { seg: 16, rz: Math.PI / 2 });
  P.cyl(mechG, 0.38, 0.38, 0.05, 1.52, 1.5, 0, matDark, { seg: 16, rz: Math.PI / 2 });
  P.box(mechG, 0.12, 1.1, 0.05, 1.55, 0.5, 1.5, matChest, { cast: false });
  P.box(mechG, 0.12, 1.1, 0.05, 1.55, 0.5, -1.5, matChest, { cast: false });
  // shoulder pads
  for (const side of [-1, 1]) {
    const pad = P.box(mechG, 2.8, 2.1, 1.35, 0.15, 0.9, side * 2.55, matPlate, { cast: true });
    pad.rotation.x = side * 0.16;
    P.box(mechG, 3.1, 0.4, 1.0, 0.1, 2.9, side * 2.5, matDark, { cast: true });
    // spikes
    for (let i = 0; i < 3; i++) {
      const spike = P.cyl(mechG, 0.02, 0.16, 0.9, 0.9 - i * 0.6, 2.2, side * 3.15, matRust, { seg: 6, cast: true });
      spike.rotation.x = side * 0.5;
    }
    // layered lower plates
    P.box(mechG, 2.2, 0.5, 1.5, 0.3, 0.15, side * 2.5, matSteel, { cast: true });
    // thin red seam on the pad front face
    P.box(mechG, 0.03, 0.3, 0.8, 1.58, 2.0, side * 2.5, matRed, { cast: false });
    // vents
    for (let i = 0; i < 3; i++) {
      P.box(mechG, 0.05, 0.3, 0.9, 1.35, 1.4 + i * 0.45, side * 2.45, matDark, {});
    }
  }
  // neck
  P.cyl(mechG, 0.55, 0.75, 1.0, 0, 2.9, 0, matDark, { seg: 10, cast: true });
  // shoulder spikes pointing up
  for (const side of [-1, 1]) {
    const horn = P.cyl(mechG, 0.02, 0.22, 1.4, -0.6, 3.1, side * 2.8, matRust, { seg: 6, cast: true });
    horn.rotation.z = 0.18;
  }
  // exposed cabling
  for (let i = 0; i < 4; i++) {
    const cable = P.cyl(mechG, 0.035, 0.035, 1.6, -1.2 + i * 0.1, 0.6, -2.0 + i * 0.28, P.std(0x1a1d20, 0.8, 0.2), { seg: 5 });
    cable.rotation.z = 0.4;
  }

  /* ----- head ----- */
  headG.position.set(0.2, 3.5, 0);
  {
    // skull
    P.box(headG, 2.4, 2.2, 2.9, 0, 0, 0, matPlate, { cast: true });
    // brow
    const brow = P.box(headG, 0.7, 0.4, 3.0, 1.05, 1.5, 0, matDark, { cast: true });
    brow.rotation.z = -0.1;
    // jaw
    P.box(headG, 1.6, 0.55, 2.0, 0.4, -0.9, 0, matDark, { cast: true });
    for (let i = 0; i < 4; i++) {
      P.box(headG, 0.14, 0.22, 0.12, 1.1, -0.62, -0.7 + i * 0.46, matSteel, {});
    }
    // cheek plates
    for (const side of [-1, 1]) {
      const cheek = P.box(headG, 1.3, 1.4, 0.35, 0.1, -0.25, side * 1.52, matSteel, { cast: true });
      cheek.rotation.y = side * 0.12;
      // red seam
      P.box(headG, 0.8, 0.06, 0.02, 0.4, 0.2, side * 1.7, matRed, {});
    }
    // eye sockets + glowing eyes
    const eyeZ = 0.72;
    P.eyeGlows = [];
    const eyeGlowTex = P.glowTexture([[0, 'rgba(255,60,70,.95)'], [0.35, 'rgba(255,30,40,.4)'], [1, 'rgba(255,0,20,0)']]);
    for (const side of [-1, 1]) {
      P.box(headG, 0.3, 0.5, 0.62, 1.24, 0.55, side * eyeZ, matDark, {});
      P.ico(headG, 0.2, 1.42, 0.8, side * eyeZ, matRed, { cast: false });
      const gm = new T.SpriteMaterial({ map: eyeGlowTex, color: 0xff2030, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
      const sp = new T.Sprite(gm);
      sp.position.set(1.55, 0.8, side * eyeZ);
      sp.scale.set(1.5, 1.5, 1);
      headG.add(sp);
      P.eyeGlows.push(gm);
    }
    // crown spikes
    for (let i = 0; i < 3; i++) {
      const spire = P.cyl(headG, 0.02, 0.13, 0.8 + i * 0.12, -0.5 + i * 0.35, 2.1, 0, matRust, { seg: 5, cast: true });
      spire.rotation.z = (i - 1) * 0.2;
    }
    // antenna
    const ant = P.cyl(headG, 0.02, 0.03, 1.2, -0.2, 2.2, 1.2, matSteel, { seg: 5, cast: true });
    ant.rotation.z = 0.12;
    P.ico(headG, 0.05, -0.3, 3.42, 1.2, P.emissive(0xff3344, 1.0));
    // mouth grille
    for (let i = 0; i < 4; i++) {
      P.box(headG, 0.06, 0.1, 1.4, 1.32, -1.05 + i * 0.14, 0, matDark, {});
    }
  }

  /* ----- red eye spot lights ----- */
  const eyeSpots = [];
  for (const side of [-1, 1]) {
    const sp = new T.SpotLight(0xff1e2e, 0, 34, 0.2, 0.6, 2);
    sp.position.set(1.45, 0.8, side * 0.72);
    sp.target.position.set(14, -1.6, side * 1.2);
    headG.add(sp);
    headG.add(sp.target);
    eyeSpots.push(sp);
    // faint visible beam so the scan reads in rain / at night
    const beamGeo = new T.ConeGeometry(0.6, 9, 12, 1, true);
    const beamMat = new T.MeshBasicMaterial({
      color: 0xff2233, transparent: true, opacity: 0, depthWrite: false,
      side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false
    });
    const beam = new T.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(6.2, 0.8, side * 0.72);
    headG.add(beam);
    P.eyeBeams = P.eyeBeams || [];
    P.eyeBeams.push(beamMat);
  }
  const underGlowMat = new T.SpriteMaterial({
    map: P.glowTexture([[0, 'rgba(255,60,50,.8)'], [1, 'rgba(255,0,0,0)']]),
    color: 0xff2233, transparent: true, opacity: 0, depthWrite: false,
    blending: T.AdditiveBlending, toneMapped: false
  });
  const underGlow = new T.Sprite(underGlowMat);
  underGlow.position.set(0, 0.25, 0);
  underGlow.scale.set(7, 2.4, 1);
  mechG.add(underGlow);

  /* ----- event state ----- */
  P.kaiju = {
    active: false, elapsed: 0, out: 0, glow: 0, scan: 0,
    retracting: false, triggered: false
  };

  P.setAlert = function (on) {
    const k = P.kaiju;
    if (on) {
      if (P.state.alert && !k.retracting) return;
      P.state.alert = true;
      k.active = true;
      k.retracting = false;
      k.elapsed = 0;
      k.triggered = false;
      P.smokeActive = false;
      if (P.onAlertToggle) P.onAlertToggle(true);
    } else {
      if (!P.state.alert && !k.active) return;
      P.state.alert = false;
      k.retracting = true;
      P.smokeActive = false;
      if (P.onAlertToggle) P.onAlertToggle(false);
    }
  };
  P.toggleAlert = function () { P.setAlert(!P.state.alert); };

  P.contactShadow(mechG, 7.5, 6.4, 0, 0.004, 0, 0.55);
  // the machine is larger than the shop's ground floor, but still fits the portal
  mechG.scale.setScalar(1.2);

  /* register the 46th object */
  P.register({
    id: 'mech', name: '巨物 · 机械头颅', en: 'Colossal Machine', group: mechG,
    desc: '从隧道深处驶出的巨型机械：头颅与肩甲缓缓探出，双眼亮起红色探照光并左右扫视。再次点击警报或视角复位，它会退回隧道。',
    tags: ['巨物', '事件', '红色探照']
  });

  /* ----- update ----- */
  P.onUpdate(function kaijuUpdate(dt, t) {
    const k = P.kaiju;
    const st = P.state;
    const damp = (cur, target, rate) => cur + (target - cur) * Math.min(1, dt * rate);

    if (k.active && !k.retracting) {
      k.elapsed += dt;
      // 3 seconds of warning, then the light, smoke and the machine
      if (k.elapsed > 3.0) {
        k.triggered = true;
        P.smokeActive = true;
      }
      const outTarget = k.triggered ? 1 : 0;
      k.out = damp(k.out, outTarget, 0.55);
      k.glow = damp(k.glow, k.triggered ? 1 : 0, 1.4);
      k.scan = damp(k.scan, k.out > 0.82 ? 1 : 0, 1.2);
    } else if (k.retracting) {
      k.out = damp(k.out, 0, 0.9);
      k.glow = damp(k.glow, 0, 1.6);
      k.scan = damp(k.scan, 0, 2);
      P.smokeActive = false;
      if (k.out < 0.01 && k.glow < 0.01) {
        k.active = false;
        k.retracting = false;
        k.out = 0;
      }
    } else {
      k.glow = damp(k.glow, 0, 1.5);
      k.scan = damp(k.scan, 0, 1.5);
    }

    // position: from deep inside the tunnel to the road in front of the shop
    const out = k.out;
    mechG.position.x = -16.2 + out * 13.0;
    mechG.position.y = 0.03 + Math.sin(t * 0.55) * 0.05 * out;
    // it rises to full height as it clears the portal
    const grow = P.clamp((out - 0.5) / 0.42, 0, 1);
    mechG.scale.setScalar(1.2 + 0.65 * grow);
    // subtle shoulder sway while moving; turn to face the shop once it is out
    mechG.rotation.z = Math.sin(t * 0.4) * 0.008 * out;
    const faceOut = P.clamp((out - 0.55) / 0.32, 0, 1);
    mechG.rotation.y = -0.62 * faceOut + Math.sin(t * 0.22) * 0.012 * out;

    // head scanning
    headG.rotation.y = Math.sin(t * 0.62) * 0.34 * k.scan - 0.04 * k.scan;
    headG.rotation.z = Math.sin(t * 0.4 + 1) * 0.02 * k.scan;

    // eyes + local glow
    const eyePower = k.glow * (0.92 + Math.sin(t * 2.2) * 0.05);
    matRed.emissiveIntensity = k.glow * 3.4;
    matChest.emissiveIntensity = k.glow * 1.5;
    if (P.eyeGlows) for (const gm of P.eyeGlows) gm.opacity = k.glow * 0.95;
    if (P.eyeBeams) for (const bm of P.eyeBeams) { bm.opacity = k.glow * (0.055 + P.state.rain * 0.12); bm.visible = bm.opacity > 0.005; }
    underGlowMat.opacity = k.glow * 0.55;
    underGlow.visible = underGlowMat.opacity > 0.01;
    for (const sp of eyeSpots) {
      sp.intensity = eyePower * 1200;
    }

    // tunnel warning light + strips
    if (P.tunnelLight) {
      P.tunnelLight.intensity = k.glow * 900;
    }
    if (P.tunnelRedMat) {
      P.tunnelRedMat.emissiveIntensity = 0.04 + k.glow * 3.4;
    }

    // radar / alert visuals are driven by P.state.alert in building.js
  });

  console.log('[PRUN] kaiju ready · registry', P.registry.length);
})();
