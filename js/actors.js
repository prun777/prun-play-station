/* =========================================================
   PRUN PLAY STATION — NPCs, vehicles, the shop dog
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T, S = P.scene;
  const M = P.buildMats || {};

  const skin = P.std(0xd8ae8c, 0.85, 0.02);
  const skin2 = P.std(0xb98a63, 0.85, 0.02);
  const hair = P.std(0x241a14, 0.9, 0.02);
  const shoe = P.std(0x1c1e22, 0.85, 0.05);

  const npcs = [];
  P.npcs = npcs;

  /* ---------------- person builder ---------------- */
  function person(opts) {
    opts = opts || {};
    const g = P.group(S, opts.x || 0, opts.y || 0, opts.z || 0, opts.name || 'npc');
    if (opts.ry !== undefined) g.rotation.y = opts.ry;
    const shirt = P.std(opts.shirt || 0x3f5f8a, 0.9, 0.02);
    const pants = P.std(opts.pants || 0x2b2f38, 0.92, 0.02);

    // legs
    const legs = [];
    for (const side of [-1, 1]) {
      const pivot = P.group(g, side * 0.1, 0.7, 0);
      const leg = P.cyl(pivot, 0.055, 0.05, 0.64, 0, -0.66, 0, pants, { seg: 6, cast: true });
      P.box(pivot, 0.11, 0.06, 0.2, 0, -0.7, 0.03, shoe, { cast: true });
      legs.push(pivot);
    }
    // torso
    const body = P.group(g, 0, 0.72, 0);
    const torsoGeo = new T.CapsuleGeometry(0.16, 0.34, 4, 8);
    const torso = new T.Mesh(torsoGeo, shirt);
    torso.position.y = 0.3;
    torso.castShadow = true;
    body.add(torso);
    // hips
    P.box(body, 0.3, 0.16, 0.22, 0, -0.06, 0, pants, { cast: true });
    // arms
    const arms = [];
    for (const side of [-1, 1]) {
      const pivot = P.group(body, side * 0.24, 0.5, 0);
      const arm = P.cyl(pivot, 0.045, 0.04, 0.5, 0, -0.5, 0, shirt, { seg: 6, cast: true });
      P.ico(pivot, 0.055, 0, -0.53, 0, skin, { cast: true });
      arms.push(pivot);
    }
    // head
    const head = P.group(body, 0, 0.6, 0);
    P.ico(head, 0.145, 0, 0.02, 0, opts.skin || skin, { cast: true });
    P.ico(head, 0.15, 0, 0.09, -0.02, opts.hairMat || hair, { ry: 0.12 });
    if (opts.cap) {
      P.cyl(head, 0.15, 0.16, 0.06, 0, 0.16, 0, opts.cap, { seg: 10 });
      P.box(head, 0.26, 0.03, 0.18, 0, 0.16, 0.12, opts.cap, {});
    }
    if (opts.mask) {
      P.box(head, 0.24, 0.13, 0.1, 0, -0.02, 0.1, opts.mask, {});
      P.box(head, 0.1, 0.04, 0.02, 0.05, 0.02, 0.16, P.emissive(0x7dffb2, 1.0), {});
    }
    if (opts.apron) {
      P.box(body, 0.36, 0.6, 0.04, 0, -0.2, 0.16, opts.apron, {});
    }
    const npc = {
      group: g, body, head, legs, arms,
      home: { x: g.position.x, y: g.position.y, z: g.position.z, ry: g.rotation.y },
      speed: opts.speed || 0.9,
      baseSpeed: opts.speed || 0.9,
      route: (opts.route || []).map(p => new T.Vector2(p[0], p[1])),
      routeIndex: 0,
      routeDir: 1,
      phase: P.rand() * 6.28,
      state: 'idle',
      seated: !!opts.seated,
      seatedPose: opts.seatedPose || null,
      idleAmp: opts.idleAmp === undefined ? 1 : opts.idleAmp,
      carry: !!opts.carry,
      label: opts.label || 'npc',
      floorY: g.position.y
    };
    if (opts.seated) setSeated(npc, true);
    if (opts.carry) {
      // box carried in front of the chest
      const box = P.box(body, 0.42, 0.34, 0.34, 0, 0.1, 0.3, P.std(0x9a7448, 0.9, 0.02), { cast: true });
      box.userData.carryBox = true;
    }
    npcs.push(npc);
    return npc;
  }

  function setSeated(npc, seated) {
    npc.seated = seated;
    if (seated) {
      for (const leg of npc.legs) { leg.rotation.x = 1.35; }
      npc.body.position.y = 0.46;
      npc.body.rotation.x = -0.08;
    } else {
      for (const leg of npc.legs) leg.rotation.x = 0;
      npc.body.position.y = 0.72;
      npc.body.rotation.x = 0;
    }
  }
  P.setSeated = setSeated;

  /* ---------------- shop clerk ---------------- */
  const clerk = person({
    x: -5.9, y: 0.3, z: -0.85, ry: Math.PI, label: 'clerk',
    shirt: 0x2f6f9a, pants: 0x232833, aprons: true, speed: 0.9,
    route: [[-11.6, -1.2], [-6.6, -1.2]], idleAmp: 0.5
  });
  clerk.apron = true;
  P.box(clerk.body, 0.36, 0.62, 0.04, 0, -0.2, 0.17, P.std(0x2f6f9a, 0.9, 0.02), {});

  /* ---------------- warehouse crew ---------------- */
  const porter = person({
    x: 5.6, y: 0.3, z: -2.35, ry: -Math.PI / 2, label: 'porter',
    shirt: 0xd8b23f, pants: 0x2b3038, cap: P.std(0xd8b23f, 0.8, 0.03), carry: true,
    speed: 1.35, route: [[5.6, -2.35], [0.4, -2.35]]
  });
  const checker = person({
    x: 6.5, y: 0.3, z: -2.7, ry: 2.4, label: 'checker',
    shirt: 0x3f8a6a, pants: 0x2b3038, cap: P.std(0x2f5f4a, 0.8, 0.03),
    speed: 0.8, route: [[6.4, -1.9], [0.6, -0.9]]
  });
  // clipboard
  P.box(checker.body, 0.26, 0.34, 0.02, 0.18, 0.02, 0.26, P.std(0xc9c2b4, 0.9, 0.02), { ry: 0.2 });
  const tech = person({
    x: -0.1, y: 0.3, z: -2.0, ry: -1.2, label: 'tech',
    shirt: 0x3f5f8a, pants: 0x232833, speed: 0.9, route: [[-2.2, -0.8], [6.0, -0.8]]
  });
  // kneeling pose
  tech.body.position.y = 0.5;
  tech.legs[0].rotation.x = 1.1;
  tech.legs[1].rotation.x = -0.5;
  const welder = person({
    x: 5.72, y: 0.3, z: -1.28, ry: Math.PI, label: 'welder',
    shirt: 0x4a3f36, pants: 0x2b2b30, mask: P.std(0x2a333c, 0.5, 0.5), speed: 0.9,
    route: []
  });
  P.welder = welder;
  // welding torch in the right hand
  const torch = P.cyl(welder.arms[1], 0.02, 0.03, 0.34, 0, -0.62, 0.06, P.std(0x5a6068, 0.4, 0.7), { seg: 6, rx: 0.5 });
  P.ico(welder.arms[1], 0.035, 0, -0.78, 0.16, P.emissive(0xffa04a, 0.8));
  P.weldSpot = new T.Vector3(5.45, 0.95, -0.55);
  // welding table
  P.box(S, 1.2, 0.1, 0.8, 5.6, 0.8, -0.55, P.std(0x3a3e44, 0.7, 0.4), { cast: true });
  P.box(S, 1.1, 0.02, 0.7, 5.6, 0.9, -0.55, P.std(0x22262b, 0.5, 0.5), {});
  for (let i = 0; i < 4; i++) {
    P.cyl(S, 0.03, 0.03, 0.8, 5.1 + (i % 2) * 1.0, 0.3, -0.85 + Math.floor(i / 2) * 0.6, P.buildMats.steel, { seg: 5 });
  }
  P.box(S, 0.36, 0.1, 0.26, 5.5, 0.93, -0.5, P.std(0x5a6068, 0.65, 0.4), { cast: true });

  /* ---------------- office NPCs ---------------- */
  const boss = person({
    x: -9.1, y: 3.4, z: -3.95, ry: 0.25, label: 'boss', seated: true,
    shirt: 0x2a2f3a, pants: 0x1d2028, speed: 1.9,
    route: [[-11.6, -1.3], [-5.3, -1.4]]
  });
  const reporter = person({
    x: -8.55, y: 3.4, z: -2.05, ry: Math.PI + 0.25, label: 'reporter',
    shirt: 0x5c4a7a, pants: 0x2b3038, speed: 1.9,
    route: [[-10.8, -5.1], [-5.1, -5.1]]
  });
  // reporter holds a tablet
  P.box(reporter.body, 0.26, 0.2, 0.02, 0.2, 0.05, 0.26, P.std(0x1a1d22, 0.5, 0.3), { ry: 0.3 });
  P.plane(reporter.body, 0.2, 0.14, 0.2, 0.05, 0.275, P.emissive(0x4fb7ff, 1.1), { ry: 0.3 });

  /* ---------------- lounge NPC ---------------- */
  const lounger = person({
    x: 2.0, y: 3.5, z: -5.18, ry: 0.1, label: 'lounger', seated: true,
    shirt: 0xc98a3a, pants: 0x3a3f48, speed: 1.8,
    route: [[0.2, -2.0], [6.4, -2.2]]
  });
  // coffee cup in hand
  P.cyl(lounger.arms[0], 0.05, 0.045, 0.1, 0, -0.5, 0.1, P.std(0xd8d4cc, 0.7, 0.02), { seg: 8 });

  /* ---------------- pedestrians + dog ---------------- */
  const peds = [];
  function pedestrian(x, z, shirt, speed) {
    const n = person({
      x, y: 0.14, z, ry: Math.PI / 2, label: 'pedestrian',
      shirt, pants: 0x2b3038, speed,
      route: [[-12.5, z], [12.5, z]]
    });
    peds.push(n);
    return n;
  }
  const ped1 = pedestrian(-4, 6.62, 0xb8564a, 1.0);
  const ped2 = pedestrian(3.5, 6.85, 0x3f6fa8, 0.85);
  // small bags
  P.box(ped1.body, 0.16, 0.22, 0.1, -0.28, -0.1, 0.12, P.std(0xc9c2b4, 0.9, 0.02), {});

  // dog
  const dogG = P.group(S, 0, 0.14, 6.5, 'dog');
  const dog = {
    group: dogG,
    legs: [],
    tail: null,
    phase: P.rand() * 6.28,
    speed: 2.2,
    home: { x: 0, z: 6.5 },
    route: [[-10.5, 6.5], [10.5, 6.5]],
    routeIndex: 0, routeDir: 1,
    fleeing: false
  };
  {
    const fur = P.std(0xc99a5e, 0.92, 0.02);
    const furDark = P.std(0x8a6438, 0.92, 0.02);
    P.box(dogG, 0.5, 0.26, 0.24, 0, 0.2, 0, fur, { cast: true });
    const head = P.group(dogG, 0.3, 0.36, 0);
    P.box(head, 0.28, 0.24, 0.22, 0, 0, 0, fur, { cast: true });
    P.box(head, 0.18, 0.14, 0.14, 0.16, -0.03, 0, furDark, { cast: true });
    P.ico(head, 0.03, 0.25, 0.02, 0.06, P.emissive(0x1a1a1a, 0.2), {});
    P.ico(head, 0.03, 0.25, 0.02, -0.06, P.emissive(0x1a1a1a, 0.2), {});
    P.box(head, 0.06, 0.1, 0.05, -0.05, 0.12, 0.1, furDark, {});
    P.box(head, 0.06, 0.1, 0.05, -0.05, 0.12, -0.1, furDark, {});
    for (let i = 0; i < 4; i++) {
      const pivot = P.group(dogG, -0.18 + (i % 2) * 0.36, 0.2, -0.11 + Math.floor(i / 2) * 0.22);
      const leg = P.cyl(pivot, 0.035, 0.03, 0.2, 0, -0.2, 0, furDark, { seg: 5, cast: true });
      leg.userData.noMerge = true;
      dog.legs.push(pivot);
    }
    const tail = P.group(dogG, -0.28, 0.33, 0);
    const tailMesh = P.cyl(tail, 0.02, 0.035, 0.3, 0, 0.02, 0, furDark, { seg: 5, rz: 0.8 });
    tailMesh.userData.noMerge = true;
    dog.tail = tail;
    // collar
    P.box(dogG, 0.04, 0.06, 0.26, 0.22, 0.32, 0, P.std(0xb8393f, 0.7, 0.05), {});
    P.contactShadow(dogG, 0.8, 0.45, 0.02, 0.004, 0, 0.35);
  }

  /* ---------------- vehicles ---------------- */
  const vehicles = [];
  P.vehicles = vehicles;
  P.extraMergeGroups = [];
  const wheelGeo = new T.CylinderGeometry(0.19, 0.19, 0.16, 12);
  const wheelMat = P.std(0x17191d, 0.9, 0.05);
  const carHeadMat = P.emissive(0xfff1d0, 0.25);
  const carTailMat = P.emissive(0xff2b3a, 0.55);
  const carHazMat = new T.MeshStandardMaterial({ color: 0x6a4a10, emissive: 0xffb020, emissiveIntensity: 0.05, roughness: 0.4 });

  function car(opts) {
    const g = P.group(S, opts.x, 0.03, opts.z, opts.name || 'car');
    g.rotation.y = opts.ry || 0;
    const paint = P.std(opts.color, 0.35, 0.55);
    const glassMat = new T.MeshPhysicalMaterial({
      color: 0x9fc7dd, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.45,
      depthWrite: false
    });
    const L = opts.length || 2.2, W = opts.width || 1.0;
    P.box(g, L, 0.34, W, 0, 0.2, 0, paint, { cast: true });
    P.box(g, L * 0.55, 0.34, W * 0.9, -L * 0.06, 0.54, 0, paint, { cast: true });
    // windows
    P.box(g, L * 0.5, 0.26, W * 0.92, -L * 0.06, 0.56, 0, glassMat, {});
    P.contactShadow(g, L + 0.7, W + 0.5, 0, 0.006, 0, 0.5);
    // wheels
    const wheels = [];
    for (let i = 0; i < 4; i++) {
      const wx = -L * 0.32 + (i % 2) * L * 0.64;
      const wz = -W / 2 - 0.02 + Math.floor(i / 2) * (W + 0.04);
      const wheel = new T.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.19, wz);
      wheel.castShadow = true;
      wheel.userData.noMerge = true;
      g.add(wheel);
      wheels.push(wheel);
    }
    // headlights / tail lights
    const headMat = carHeadMat;
    const tailMat = carTailMat;
    const hazMat = carHazMat;
    P.box(g, 0.06, 0.14, 0.2, L / 2 - 0.02, 0.3, W * 0.3, headMat, {});
    P.box(g, 0.06, 0.14, 0.2, L / 2 - 0.02, 0.3, -W * 0.3, headMat, {});
    P.box(g, 0.05, 0.12, 0.18, -L / 2 + 0.01, 0.32, W * 0.32, tailMat, {});
    P.box(g, 0.05, 0.12, 0.18, -L / 2 + 0.01, 0.32, -W * 0.32, tailMat, {});
    P.box(g, 0.05, 0.09, 0.12, L / 2 - 0.01, 0.44, W * 0.32, hazMat, {});
    P.box(g, 0.05, 0.09, 0.12, L / 2 - 0.01, 0.44, -W * 0.32, hazMat, {});
    P.box(g, 0.05, 0.09, 0.12, -L / 2 + 0.01, 0.44, W * 0.32, hazMat, {});
    P.box(g, 0.05, 0.09, 0.12, -L / 2 + 0.01, 0.44, -W * 0.32, hazMat, {});
    return {
      group: g, wheels, headMat, tailMat, hazMat,
      base: { x: opts.x, z: opts.z, ry: opts.ry || 0 },
      speed: opts.speed || 0, dir: opts.dir || 1,
      laneZ: opts.z, moving: !!opts.moving, frozen: false,
      label: opts.name
    };
  }

  // two moving cars
  const carA = car({ x: -12, z: 9.85, color: 0x2f5f8a, name: 'sedanA', length: 2.3, width: 1.0, speed: 3.2, moving: true });
  const carB = car({ x: 8, z: 8.15, color: 0x8f3f46, name: 'sedanB', length: 2.1, width: 0.95, speed: 2.7, moving: true });
  carB.group.rotation.y = Math.PI;
  vehicles.push(carA, carB);
  P.extraMergeGroups.push(carA.group, carB.group);

  // registered delivery van (42)
  const vanG = P.group(S, 0, 0.06, 0, 'van');
  const van = (function buildVan() {
    const g = vanG;
    g.position.set(-3.15, 0.06, 4.1);
    g.rotation.y = 0;
    const bodyMat = P.std(0xd7dde2, 0.4, 0.35);
    const trim = P.std(0x2a6f8a, 0.5, 0.3);
    P.box(g, 3.0, 1.05, 1.25, 0, 0.32, 0, bodyMat, { cast: true });
    P.box(g, 2.9, 0.5, 1.2, -0.05, 1.37, 0, bodyMat, { cast: true });
    P.box(g, 0.98, 0.62, 1.26, 1.45, 0.5, 0, trim, { cast: true });
    // windshield
    P.box(g, 0.5, 0.42, 1.16, 0.92, 1.38, 0, new T.MeshPhysicalMaterial({
      color: 0x9fc7dd, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.45, depthWrite: false
    }), {});
    // side glass
    P.box(g, 1.2, 0.38, 1.24, -0.25, 1.4, 0, new T.MeshPhysicalMaterial({
      color: 0x9fc7dd, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false
    }), {});
    // PRUN livery
    const tex = P.canvasTexture(512, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#2a6f8a'; ctx.fillRect(0, h - 46, w, 46);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0d3b4a'; ctx.font = '800 64px -apple-system,sans-serif';
      ctx.fillText('PRUN', w / 2, 80);
      ctx.fillStyle = '#5fe0ff'; ctx.font = '600 22px -apple-system,sans-serif';
      ctx.fillText('PLAY STATION · SERVICE', w / 2, 132);
      ctx.fillStyle = 'rgba(95,224,255,.85)'; ctx.fillRect(w * 0.25, 160, w * 0.5, 4);
    });
    const logoMat = new T.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    P.plane(g, 2.2, 1.1, -0.1, 0.98, 0.635, logoMat, { ry: 0, receive: false });
    const logoMat2 = logoMat.clone();
    P.plane(g, 2.2, 1.1, -0.1, 0.98, -0.635, logoMat2, { ry: Math.PI, receive: false });
    P.contactShadow(g, 3.7, 1.8, 0, 0.006, 0, 0.55);
    // wheels
    const wheels = [];
    for (let i = 0; i < 4; i++) {
      const wx = -0.95 + (i % 2) * 2.0;
      const wz = -0.67 + Math.floor(i / 2) * 1.34;
      const wheel = new T.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.19, wz);
      wheel.castShadow = true;
      wheel.userData.noMerge = true;
      g.add(wheel);
      wheels.push(wheel);
    }
    const headMat = carHeadMat;
    const tailMat = carTailMat;
    const hazMat = carHazMat;
    P.box(g, 0.06, 0.16, 0.22, 1.94, 0.62, 0.42, headMat, {});
    P.box(g, 0.06, 0.16, 0.22, 1.94, 0.62, -0.42, headMat, {});
    P.box(g, 0.05, 0.14, 0.2, -1.51, 0.66, 0.44, tailMat, {});
    P.box(g, 0.05, 0.14, 0.2, -1.51, 0.66, -0.44, tailMat, {});
    P.box(g, 0.05, 0.1, 0.14, 1.9, 0.9, 0.5, hazMat, {});
    P.box(g, 0.05, 0.1, 0.14, 1.9, 0.9, -0.5, hazMat, {});
    P.box(g, 0.05, 0.1, 0.14, -1.49, 0.9, 0.5, hazMat, {});
    P.box(g, 0.05, 0.1, 0.14, -1.49, 0.9, -0.5, hazMat, {});
    return {
      group: g, wheels, headMat, tailMat, hazMat,
      base: { x: -3.15, z: 4.1, ry: 0 }, speed: 0, moving: false, frozen: false
    };
  })();
  vehicles.push(van);
  P.extraMergeGroups.push(vanG);

  P.extraMergeGroups.push(dogG);

  /* ---------------- registry for clickable actors ---------------- */
  P.register({
    id: 'van', name: '配送车', en: 'Delivery Van', group: vanG,
    desc: 'PRUN 的自有配送车，车身喷着店招，后备厢常年塞满待送修的主机。',
    tags: ['车辆', '物流', '品牌']
  });
  P.register({
    id: 'dog', name: '小狗', en: 'Shop Dog', group: dogG,
    desc: '店里的常驻小狗，白天在店门口晒太阳，警报响起时会沿着人行道来回奔跑。',
    tags: ['狗', 'NPC', '街道']
  });
  // pedestrians share one clickable group
  const pedG = P.group(S, 0, 0, 0, 'pedestrians');
  // re-parent the two pedestrians into pedG, preserving world transform
  pedG.updateMatrixWorld(true);
  ped1.group.parent.remove(ped1.group);
  ped2.group.parent.remove(ped2.group);
  pedG.add(ped1.group);
  pedG.add(ped2.group);
  P.register({
    id: 'pedestrians', name: '行人', en: 'Pedestrians', group: pedG,
    desc: '沿海公路人行道上的两位路人，巨物警报时会加速沿人行道往返奔跑。',
    tags: ['NPC', '行人', '人行道']
  });

  /* ---------------- helpers ---------------- */
  function faceTo(npc, targetX, targetZ) {
    const dx = targetX - npc.group.position.x;
    const dz = targetZ - npc.group.position.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.001) {
      const target = Math.atan2(dx, dz);
      let cur = npc.group.rotation.y;
      let diff = ((target - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      npc.group.rotation.y = cur + diff * 0.12;
    }
  }

  function stepNpc(npc, dt, t, speedMul) {
    const route = npc.fleeRoute || npc.route;
    if (!route || route.length < 2) {
      // idle bob
      if (!npc.seated) {
        npc.body.position.y = 0.72 + Math.sin(t * 1.8 + npc.phase) * 0.008 * npc.idleAmp;
      }
      return;
    }
    const target = route[npc.routeIndex];
    const dx = target.x - npc.group.position.x;
    const dz = target.y - npc.group.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.22) {
      npc.routeIndex += npc.routeDir;
      if (npc.routeIndex >= route.length) { npc.routeIndex = route.length - 2; npc.routeDir = -1; }
      if (npc.routeIndex < 0) { npc.routeIndex = 1; npc.routeDir = 1; }
      return;
    }
    const spd = npc.speed * speedMul;
    const vx = dx / dist * spd, vz = dz / dist * spd;
    npc.group.position.x += vx * dt;
    npc.group.position.z += vz * dt;
    faceTo(npc, target.x, target.y);
    npc.phase += dt * (5.2 + spd * 2.2);
    const swing = Math.sin(npc.phase) * 0.55;
    if (!npc.seated) {
      npc.legs[0].rotation.x = swing;
      npc.legs[1].rotation.x = -swing;
      npc.arms[0].rotation.x = -swing * 0.8;
      npc.arms[1].rotation.x = swing * 0.8;
      npc.body.position.y = 0.72 + Math.abs(Math.sin(npc.phase)) * 0.03;
    }
  }

  function stopAnim(npc) {
    npc.legs[0].rotation.x *= 0.9;
    npc.legs[1].rotation.x *= 0.9;
    npc.arms[0].rotation.x *= 0.9;
    npc.arms[1].rotation.x *= 0.9;
  }

  P.setWeldPose = function (welding) {
    if (!welder) return;
    welder.arms[1].rotation.x = welding ? -0.95 : 0;
    welder.arms[0].rotation.x = welding ? -0.2 : 0;
  };
  P.setWeldPose(true);

  /* ---------------- alert handlers ---------------- */
  const FLEE_ROUTES = {
    clerk: [[-11.5, 0.65], [-4.4, 0.65]],
    porter: [[6.2, -1.7], [0.3, -1.7]],
    checker: [[6.4, -1.7], [0.2, -1.7]],
    tech: [[5.6, -1.7], [0.5, -1.7]],
    welder: [[5.6, -1.7], [0.5, -1.7]],
    boss: [[-11.6, -1.2], [-5.2, -1.2]],
    reporter: [[-10.8, -1.4], [-5.0, -1.4]],
    lounger: [[0.3, -2.1], [6.3, -2.1]],
    pedestrian: null
  };
  P.onAlertChange = function (on) {
    for (const npc of npcs) {
      if (on) {
        npc.fleeing = true;
        npc.state = 'fleeing';
        npc.routeIndex = 0;
        npc.routeDir = 1;
        const fr = FLEE_ROUTES[npc.label];
        npc.fleeRoute = fr ? fr.map(([x, z]) => new T.Vector2(x, z)) : npc.route;
        if (npc.seated) setSeated(npc, false);
      } else {
        npc.fleeing = false;
        npc.fleeRoute = null;
        if (npc.label === 'pedestrian') {
          npc.state = 'idle';
          npc.speed = npc.baseSpeed;
        } else {
          // walk back to the post, then restore the pose (seated NPCs sit again)
          npc.state = 'returning';
          npc.routeIndex = 0;
          npc.routeDir = 1;
        }
      }
    }
  };

  /* ---------------- update ---------------- */
  let wasAlert = false;
  P.onUpdate(function actorUpdate(dt, t) {
    const alert = P.state.alert;
    if (alert !== wasAlert) { P.onAlertChange && P.onAlertChange(alert); wasAlert = alert; }

    // NPCs
    for (const npc of npcs) {
      const indoor = npc.label !== 'pedestrian';
      if (npc.fleeing) {
        stepNpc(npc, dt, t, 1.75);
      } else if (npc.state === 'returning') {
        // walk back to home, then restore pose and idle
        const dx = npc.home.x - npc.group.position.x;
        const dz = npc.home.z - npc.group.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.25) {
          npc.state = 'idle';
          npc.route = npc.homeRoute || npc.route;
          npc.routeIndex = 0; npc.routeDir = 1;
          if (npc.homePoseSeated) setSeated(npc, true);
          if (npc.label === 'welder') P.setWeldPose(true);
          npc.group.rotation.y = npc.home.ry;
        } else {
          npc.group.position.x += dx / d * npc.speed * 1.4 * dt;
          npc.group.position.z += dz / d * npc.speed * 1.4 * dt;
          faceTo(npc, npc.home.x, npc.home.z);
          npc.phase += dt * 7;
          const swing = Math.sin(npc.phase) * 0.5;
          npc.legs[0].rotation.x = swing; npc.legs[1].rotation.x = -swing;
          npc.arms[0].rotation.x = -swing * 0.8; npc.arms[1].rotation.x = swing * 0.8;
          npc.body.position.y = 0.72 + Math.abs(Math.sin(npc.phase)) * 0.03;
        }
      } else {
        // normal life
        if (npc.label === 'pedestrian') {
          stepNpc(npc, dt, t, alert ? 1.6 : 1);
        } else if (npc.label === 'porter' || npc.label === 'checker') {
          stepNpc(npc, dt, t, 1);
        } else if (npc.label === 'welder') {
          npc.body.position.y = 0.72 + Math.sin(t * 2.2 + npc.phase) * 0.006;
          if (!alert) {
            npc.arms[1].rotation.x = -0.95 + Math.sin(t * 14) * 0.05;
            npc.arms[0].rotation.x = -0.2 + Math.sin(t * 7) * 0.03;
          }
        } else if (npc.label === 'tech') {
          // stays crouched at the bench
          if (!npc.seated) {
            npc.body.position.y = 0.5 + Math.sin(t * 1.4 + npc.phase) * 0.006;
          }
        } else if (npc.label === 'boss' || npc.label === 'lounger') {
          if (npc.seated) {
            npc.body.position.y = 0.46 + Math.sin(t * 1.2 + npc.phase) * 0.004;
          }
        } else if (npc.label === 'reporter') {
          // gesturing toward the boss
          npc.arms[1].rotation.x = -0.35 + Math.sin(t * 1.1) * 0.18;
          npc.body.position.y = 0.72 + Math.sin(t * 1.5) * 0.005;
        } else {
          stopAnim(npc);
          if (!npc.seated) npc.body.position.y = 0.72 + Math.sin(t * 1.6 + npc.phase) * 0.006;
        }
      }
    }

    // dog
    {
      const route = dog.route;
      const target = route[dog.routeIndex];
      const dx = target[0] - dog.group.position.x;
      const dz = target[1] - dog.group.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.2) {
        dog.routeIndex = dog.routeIndex === 0 ? 1 : 0;
      } else {
        const spd = dog.speed * (alert ? 1.5 : 1);
        dog.group.position.x += dx / d * spd * dt;
        dog.group.position.z += dz / d * spd * dt;
        dog.group.rotation.y = Math.atan2(dx, dz);
        dog.phase += dt * (8 + spd * 2);
        for (let i = 0; i < 4; i++) {
          dog.legs[i].rotation.x = Math.sin(dog.phase + (i % 2) * Math.PI) * 0.7;
        }
        dog.tail.rotation.y = Math.sin(t * 10) * 0.3;
      }
    }

    // vehicles
    for (const v of vehicles) {
      if (v.moving && !alert) {
        v.group.position.x += v.speed * (v === carB ? -1 : 1) * dt;
        if (v.group.position.x > 18.4) v.group.position.x = -18.4;
        if (v.group.position.x < -18.4) v.group.position.x = 18.4;
        for (const w of v.wheels) w.rotation.y += dt * (v === carB ? -1 : 1) * v.speed * 2.2;
        v.headMat.emissiveIntensity = (P.isNight() ? 1.6 : 0.25);
        v.tailMat.emissiveIntensity = (P.isNight() ? 1.2 : 0.55);
        v.hazMat.emissiveIntensity = 0.05;
        // face travel direction
        const targetRy = v === carB ? Math.PI : 0;
        v.group.rotation.y += (targetRy - v.group.rotation.y) * Math.min(1, dt * 4);
      } else if (alert) {
        // freeze, turn toward the west tunnel, hazards blinking
        v.frozen = true;
        const targetRy = Math.PI; // face -x, toward the tunnel / mech
        let diff = ((targetRy - v.group.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        v.group.rotation.y += diff * Math.min(1, dt * 3);
        const blink = (Math.sin(t * 9) > 0) ? 2.2 : 0.1;
        v.hazMat.emissiveIntensity = blink;
        v.headMat.emissiveIntensity = 1.2;
        v.tailMat.emissiveIntensity = 1.0;
      } else {
        // parked / resuming
        v.frozen = false;
        const targetRy = v.base.ry;
        let diff = ((targetRy - v.group.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        v.group.rotation.y += diff * Math.min(1, dt * 2);
        v.hazMat.emissiveIntensity += (0.05 - v.hazMat.emissiveIntensity) * Math.min(1, dt * 4);
        v.headMat.emissiveIntensity = P.isNight() ? 1.4 : 0.22;
        v.tailMat.emissiveIntensity = 0.55;
      }
    }
    // van stays parked; its group is separate from car handling (base ry 0)
    {
      const blink = alert ? ((Math.sin(t * 9) > 0) ? 2.2 : 0.1) : 0.05;
      van.hazMat.emissiveIntensity += (blink - van.hazMat.emissiveIntensity) * Math.min(1, dt * 8);
      if (alert) {
        let diff = ((Math.PI - van.group.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        van.group.rotation.y += diff * Math.min(1, dt * 2.5);
      } else {
        let diff = ((0 - van.group.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        van.group.rotation.y += diff * Math.min(1, dt * 2.5);
      }
    }
  });

  // set return metadata for NPCs (after build)
  for (const npc of npcs) {
    npc.homeRoute = npc.route ? npc.route.map(v => ({ x: v.x, y: v.y })) : null;
    npc.homePoseSeated = npc.seated;
  }

  P.actors = { npcs, dog, vehicles, carA, carB, van, peds };
  console.log('[PRUN] actors ready · registry', P.registry.length);
})();
