/* =========================================================
   PRUN PLAY STATION — weather, seasons, particles, wet road
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T, S = P.scene;
  const rand = P.mulberry32(31337);
  const rr = (a, b) => a + (b - a) * rand();

  /* soft round sprite for points */
  const softTex = P.glowTexture([
    [0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']
  ]);

  /* =====================  SEASONAL PARTICLES  ===================== */
  // ---- petals (instanced quads) ----
  const petalMat = new T.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide,
    depthWrite: false, toneMapped: false
  });
  const petals = new T.InstancedMesh(new T.PlaneGeometry(0.17, 0.11), petalMat, 140);
  petals.frustumCulled = false;
  const petalState = [];
  const pink = [0xffb7cf, 0xffd3e1, 0xff9fc0, 0xffe3ee];
  {
    const c = new T.Color();
    for (let i = 0; i < 140; i++) {
      petalState.push({
        x: rr(-17, 17), y: rr(0.5, 14), z: rr(-9, 8),
        vy: rr(0.25, 0.7), sway: rr(0.4, 1.2), phase: rr(0, 6.28),
        rot: rr(0, 6.28), vr: rr(-2, 2), scale: rr(0.6, 1.3)
      });
      petals.setColorAt(i, c.setHex(pink[i % pink.length]));
    }
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
  }
  S.add(petals);

  // ---- autumn leaves ----
  const leafMat = new T.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide,
    depthWrite: false, toneMapped: false
  });
  const leaves = new T.InstancedMesh(new T.PlaneGeometry(0.17, 0.11), leafMat, 96);
  leaves.frustumCulled = false;
  const leafState = [];
  {
    const c = new T.Color();
    const cols = [0xe0742c, 0xc94a2f, 0xf0a03c, 0xa8452c, 0xd95f33];
    for (let i = 0; i < 96; i++) {
      leafState.push({
        x: rr(-17, 17), y: rr(0.4, 13), z: rr(-9, 8),
        vy: rr(0.3, 0.8), sway: rr(0.5, 1.4), phase: rr(0, 6.28),
        rot: rr(0, 6.28), vr: rr(-2.6, 2.6), scale: rr(0.7, 1.4)
      });
      leaves.setColorAt(i, c.setHex(cols[i % cols.length]));
    }
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  }
  S.add(leaves);

  // ---- snow (points) ----
  const SNOW_N = 720;
  const snowGeo = new T.BufferGeometry();
  const snowPos = new Float32Array(SNOW_N * 3);
  const snowState = [];
  for (let i = 0; i < SNOW_N; i++) {
    snowState.push({
      x: rr(-17.8, 17.8), y: rr(0, 15), z: rr(-13, 13),
      vy: rr(0.5, 1.5), sway: rr(0.2, 0.8), phase: rr(0, 6.28)
    });
    snowPos[i * 3] = snowState[i].x;
    snowPos[i * 3 + 1] = snowState[i].y;
    snowPos[i * 3 + 2] = snowState[i].z;
  }
  snowGeo.setAttribute('position', new T.BufferAttribute(snowPos, 3));
  const snowMat = new T.PointsMaterial({
    map: softTex, color: 0xf2f7ff, size: 0.13, sizeAttenuation: true,
    transparent: true, opacity: 0, depthWrite: false, toneMapped: false
  });
  const snow = new T.Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  S.add(snow);

  // ---- summer fireflies ----
  const FF_N = 36;
  const ffGeo = new T.BufferGeometry();
  const ffPos = new Float32Array(FF_N * 3);
  const ffState = [];
  for (let i = 0; i < FF_N; i++) {
    ffState.push({
      x: rr(-16, 16), y: rr(0.5, 4.5), z: rr(-9, 8),
      phase: rr(0, 6.28), sp: rr(0.2, 0.6), r: rr(0.5, 1.6)
    });
    ffPos[i * 3] = ffState[i].x; ffPos[i * 3 + 1] = ffState[i].y; ffPos[i * 3 + 2] = ffState[i].z;
  }
  ffGeo.setAttribute('position', new T.BufferAttribute(ffPos, 3));
  const ffMat = new T.PointsMaterial({
    map: softTex, color: 0xffe6a0, size: 0.12, transparent: true, opacity: 0,
    depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
  });
  const fireflies = new T.Points(ffGeo, ffMat);
  fireflies.frustumCulled = false;
  S.add(fireflies);

  /* =====================  RAIN  ===================== */
  const RAIN_N = 1100;
  const rainGeo = new T.BufferGeometry();
  const rainPos = new Float32Array(RAIN_N * 6);
  const rainDrops = [];
  const insideBuilding = (x, z) => (x > -13.2 && x < 8.7 && z > -6.7 && z < 1.15);
  function resetDrop(d, initial) {
    let x, z, tries = 0;
    do {
      x = rr(-18, 18); z = rr(-13.2, 13.2);
      tries++;
    } while (insideBuilding(x, z) && tries < 8);
    d.x = x; d.z = z;
    d.y = initial ? rr(0, 16) : rr(14, 17);
    d.vy = rr(14, 20);
    d.len = rr(0.45, 0.85);
  }
  for (let i = 0; i < RAIN_N; i++) {
    const d = {}; resetDrop(d, true); rainDrops.push(d);
  }
  rainGeo.setAttribute('position', new T.BufferAttribute(rainPos, 3));
  const rainMat = new T.LineBasicMaterial({
    color: 0xaac9e6, transparent: true, opacity: 0, depthWrite: false, toneMapped: false
  });
  const rain = new T.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  S.add(rain);
  let rainCount = 0;

  /* =====================  PUDDLES + NEON REFLECTIONS  ===================== */
  const puddleAlpha = P.glowTexture([[0, 'rgba(255,255,255,1)'], [0.6, 'rgba(255,255,255,.85)'], [1, 'rgba(255,255,255,0)']]);
  const puddleMat = new T.MeshStandardMaterial({
    color: 0x1b2530, roughness: 0.08, metalness: 0.85,
    transparent: true, opacity: 0, depthWrite: false, alphaMap: puddleAlpha
  });
  const puddles = [];
  const puddleSpots = [
    [1.2, 8.4, 2.0, 0.8], [-6.8, 9.6, 1.6, 0.7], [8.4, 8.9, 2.2, 0.9],
    [-13.4, 9.4, 1.5, 0.6], [5.8, 3.6, 1.4, 0.6], [-9.6, 3.9, 1.2, 0.5],
    [-1.6, 4.8, 1.1, 0.45], [13.6, 10.0, 1.0, 0.4]
  ];
  const reflTex = P.canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cols = ['rgba(95,224,255,.85)', 'rgba(255,95,160,.7)', 'rgba(255,179,92,.8)', 'rgba(210,255,255,.55)'];
    const rand2 = P.mulberry32(7);
    for (let i = 0; i < 26; i++) {
      const x = rand2() * w;
      const len = 30 + rand2() * 150;
      const y = 70 + rand2() * (h - 140);
      const grd = ctx.createLinearGradient(0, y, 0, y + len);
      const col = cols[i % cols.length];
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(0.5, col);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - 1.5, y, 3 + rand2() * 2, len);
    }
  });
  const reflMat = new T.MeshBasicMaterial({
    map: reflTex, transparent: true, opacity: 0, depthWrite: false,
    blending: T.AdditiveBlending, toneMapped: false, color: 0xffffff
  });
  for (const [x, z, sx, sz] of puddleSpots) {
    const p = new T.Mesh(new T.CircleGeometry(1, 20), puddleMat);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(sx, sz, 1);
    p.position.set(x, 0.062, z);
    p.renderOrder = 1;
    S.add(p);
    const r = new T.Mesh(new T.PlaneGeometry(sx * 1.7, sz * 1.7), reflMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(x, 0.066, z);
    r.renderOrder = 2;
    S.add(r);
    puddles.push({ mesh: p, refl: r });
  }
  // ripple rings
  const ripples = [];
  for (let i = 0; i < 14; i++) {
    const mat = new T.MeshBasicMaterial({
      color: 0xbfe2f2, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, toneMapped: false
    });
    const ring = new T.Mesh(new T.RingGeometry(0.085, 0.1, 18), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(rr(-14, 14), 0.07, rr(2, 10.5));
    ring.renderOrder = 2;
    S.add(ring);
    ripples.push({ mesh: ring, mat, age: rr(0, 1.2), life: 1.2, x: ring.position.x, z: ring.position.z });
  }

  /* =====================  SEARCHLIGHTS  ===================== */
  const searchlights = [];
  function makeSearchlight(x, z) {
    const g = P.group(S, x, 6.62, z);
    const base = P.cyl(g, 0.16, 0.22, 0.3, 0, 0, 0, P.buildMats.darkSteel, { seg: 10, cast: true });
    const body = P.group(g, 0, 0.42, 0);
    P.box(body, 0.5, 0.34, 0.44, 0, 0, 0, P.buildMats.frame, { cast: true });
    const lensMat = new T.MeshStandardMaterial({ color: 0xdfefff, emissive: 0xcfe6ff, emissiveIntensity: 0.2, roughness: 0.2 });
    P.plane(body, 0.36, 0.26, 0, 0.02, 0.23, lensMat, { receive: false });
    // spot light
    const spot = new T.SpotLight(0xd8ecff, 0, 45, 0.2, 0.55, 2);
    spot.position.set(x, 7.04, z);
    spot.target.position.set(x, 0, z + 10);
    S.add(spot); S.add(spot.target);
    // visible cone
    const coneGeo = new T.CylinderGeometry(0.08, 1.5, 14, 18, 1, true);
    const coneMat = new T.MeshBasicMaterial({
      color: 0xcfe6ff, transparent: true, opacity: 0, depthWrite: false,
      side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false
    });
    const cone = new T.Mesh(coneGeo, coneMat);
    S.add(cone);
    const coreGeo = new T.CylinderGeometry(0.04, 0.62, 14, 14, 1, true);
    const coreMat = new T.MeshBasicMaterial({
      color: 0xeaf4ff, transparent: true, opacity: 0, depthWrite: false,
      side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false
    });
    const core = new T.Mesh(coreGeo, coreMat);
    S.add(core);
    return { group: g, body, spot, cone, core, coneMat, coreMat, lensMat, x, z, sweep: rr(0, 6.28) };
  }
  searchlights.push(makeSearchlight(-12.35, 0.35));
  searchlights.push(makeSearchlight(7.85, 0.35));

  /* =====================  SPARKS (welder)  ===================== */
  const SPARK_N = 160;
  const sparkGeo = new T.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_N * 3);
  const sparkCol = new Float32Array(SPARK_N * 3);
  const sparkState = [];
  for (let i = 0; i < SPARK_N; i++) {
    sparkState.push({ life: 0, max: 1, vx: 0, vy: 0, vz: 0, x: 0, y: -99, z: 0 });
    sparkPos[i * 3 + 1] = -99;
  }
  sparkGeo.setAttribute('position', new T.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new T.BufferAttribute(sparkCol, 3));
  const sparkMat = new T.PointsMaterial({
    size: 0.115, vertexColors: true, transparent: true, opacity: 1,
    depthWrite: false, blending: T.AdditiveBlending, map: softTex, toneMapped: false
  });
  const sparks = new T.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  S.add(sparks);
  const weldLight = new T.PointLight(0xff8a3a, 0, 6, 2);
  weldLight.position.copy(P.weldSpot || new T.Vector3(5.45, 1, -0.55));
  S.add(weldLight);
  const weldGlowMat = new T.SpriteMaterial({
    map: P.glowTexture([[0, 'rgba(255,180,90,.95)'], [0.35, 'rgba(255,110,30,.4)'], [1, 'rgba(255,80,0,0)']]),
    color: 0xffa050, transparent: true, opacity: 0, depthWrite: false,
    blending: T.AdditiveBlending, toneMapped: false
  });
  const weldGlow = new T.Sprite(weldGlowMat);
  weldGlow.position.copy(weldLight.position);
  weldGlow.scale.set(1.6, 1.6, 1);
  S.add(weldGlow);
  let weldTimer = 2.4, sparkBurst = 0;

  function burstSparks(origin) {
    let spawned = 0;
    for (let i = 0; i < SPARK_N && spawned < 150; i++) {
      const s = sparkState[i];
      if (s.life > 0) continue;
      s.life = s.max = rr(0.55, 1.15);
      s.x = origin.x + rr(-0.12, 0.12);
      s.y = origin.y + rr(0, 0.12);
      s.z = origin.z + rr(-0.12, 0.12);
      const a = rr(0, Math.PI * 2);
      const sp = rr(0.6, 3.4);
      s.vx = Math.cos(a) * sp * 0.55;
      s.vz = Math.sin(a) * sp * 0.55;
      s.vy = rr(1.6, 4.2);
      sparkPos[i * 3] = s.x; sparkPos[i * 3 + 1] = s.y; sparkPos[i * 3 + 2] = s.z;
      sparkCol[i * 3] = 1; sparkCol[i * 3 + 1] = 0.72; sparkCol[i * 3 + 2] = 0.3;
      spawned++;
    }
    sparkBurst = 1;
    P.sparkCount = spawned;
  }

  /* =====================  SMOKE (tunnel / event)  ===================== */
  const SMOKE_N = 90;
  const smokeGeo = new T.BufferGeometry();
  const smokePos = new Float32Array(SMOKE_N * 3);
  const smokeLife = new Float32Array(SMOKE_N);
  const smokeSize = new Float32Array(SMOKE_N);
  const smokeState = [];
  for (let i = 0; i < SMOKE_N; i++) {
    smokeState.push({ life: 0, max: 1, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, size: 1 });
    smokePos[i * 3 + 1] = -99;
  }
  smokeGeo.setAttribute('position', new T.BufferAttribute(smokePos, 3));
  smokeGeo.setAttribute('aLife', new T.BufferAttribute(smokeLife, 1));
  smokeGeo.setAttribute('aSize', new T.BufferAttribute(smokeSize, 1));
  const smokeMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.NormalBlending, toneMapped: false,
    uniforms: { uColor: { value: new T.Color(0xb9c0c8) } },
    vertexShader: `
      attribute float aLife; attribute float aSize;
      varying float vLife;
      void main(){
        vLife = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (240.0 / max(-mv.z, 1.0)) * (1.6 - aLife * 0.6);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying float vLife;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d) * vLife * 0.8;
        gl_FragColor = vec4(uColor, a);
      }`
  });
  const smoke = new T.Points(smokeGeo, smokeMat);
  smoke.frustumCulled = false;
  S.add(smoke);
  let smokeSpawnAcc = 0;
  P.smokeActive = false;
  const smokeOrigin = new T.Vector3(-11.6, 1.0, 9.0);

  /* =====================  LIGHTNING  ===================== */
  P.flash = 0;
  let nextBolt = 4 + rand() * 5;

  /* =====================  UPDATE  ===================== */
  P.onUpdate(function effectsUpdate(dt, t) {
    const st = P.state;
    const season = st.season;
    const night = P.isNight() ? 1 : 0;
    const damp = (cur, target, rate) => cur + (target - cur) * Math.min(1, dt * rate);

    /* ---- seasonal particle visibility ---- */
    const petalT = season === 'spring' ? 1 : 0;
    const leafT = season === 'autumn' ? 1 : 0;
    const snowT = season === 'winter' ? 1 : 0;
    petalMat.opacity = damp(petalMat.opacity, petalT, 1.4);
    leafMat.opacity = damp(leafMat.opacity, leafT, 1.4);
    snowMat.opacity = damp(snowMat.opacity, snowT * 0.9, 1.4);
    petals.visible = petalMat.opacity > 0.02;
    leaves.visible = leafMat.opacity > 0.02;
    snow.visible = snowMat.opacity > 0.02;

    const windX = 0.4 + (P.wind ? P.wind.value : 0) * 0.5;

    /* petals */
    if (petals.visible) {
      const dummy = P._dummy || (P._dummy = new T.Object3D());
      for (let i = 0; i < 140; i++) {
        const s = petalState[i];
        s.y -= s.vy * dt;
        s.x += Math.sin(t * 0.9 + s.phase) * 0.35 * dt + windX * 0.25 * dt;
        s.rot += s.vr * dt;
        if (s.y < 0.1) {
          s.y = rr(10, 15); s.x = rr(-17, 17); s.z = rr(-9, 8);
          if (insideBuilding(s.x, s.z)) s.z = rr(1.6, 8);
        }
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.set(s.rot * 0.8, s.rot, s.rot * 0.5);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;
    }
    /* leaves */
    if (leaves.visible) {
      const dummy = P._dummy2 || (P._dummy2 = new T.Object3D());
      for (let i = 0; i < 96; i++) {
        const s = leafState[i];
        s.y -= s.vy * dt;
        s.x += Math.sin(t * 1.1 + s.phase) * 0.5 * dt + windX * 0.35 * dt;
        s.rot += s.vr * dt;
        if (s.y < 0.1) {
          s.y = rr(9, 14); s.x = rr(-17, 17); s.z = rr(-9, 8);
          if (insideBuilding(s.x, s.z)) s.z = rr(1.6, 8);
        }
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.set(s.rot, s.rot * 0.7, s.rot * 0.4);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
      }
      leaves.instanceMatrix.needsUpdate = true;
    }
    /* snow */
    if (snow.visible) {
      const pos = snowGeo.attributes.position;
      for (let i = 0; i < SNOW_N; i++) {
        const s = snowState[i];
        s.y -= s.vy * dt;
        s.x += Math.sin(t * 0.8 + s.phase) * 0.18 * dt + windX * 0.2 * dt;
        if (s.y < 0.05) { s.y = rr(12, 16); s.x = rr(-17.8, 17.8); s.z = rr(-12, 13); if (insideBuilding(s.x, s.z)) s.z = rr(1.6, 8); }
        pos.array[i * 3] = s.x; pos.array[i * 3 + 1] = s.y; pos.array[i * 3 + 2] = s.z;
      }
      pos.needsUpdate = true;
    }
    /* fireflies */
    {
      const ffT = season === 'summer' ? night * 0.9 : 0;
      ffMat.opacity = damp(ffMat.opacity, ffT, 1.2);
      fireflies.visible = ffMat.opacity > 0.02;
      if (fireflies.visible) {
        const pos = ffGeo.attributes.position;
        for (let i = 0; i < FF_N; i++) {
          const f = ffState[i];
          pos.array[i * 3] = f.x + Math.sin(t * f.sp + f.phase) * f.r;
          pos.array[i * 3 + 1] = f.y + Math.sin(t * f.sp * 1.7 + f.phase) * 0.35;
          pos.array[i * 3 + 2] = f.z + Math.cos(t * f.sp * 0.8 + f.phase) * f.r;
        }
        pos.needsUpdate = true;
      }
    }

    /* ---- rain ---- */
    const rainTarget = P.clamp(st.rain * 1.15, 0, 1);
    rainMat.opacity = damp(rainMat.opacity, rainTarget * 0.5, 2);
    rainCount = Math.floor(RAIN_N * rainTarget);
    rain.visible = rainCount > 4;
    if (rain.visible) {
      const pos = rainGeo.attributes.position;
      for (let i = 0; i < rainCount; i++) {
        const d = rainDrops[i];
        d.y -= d.vy * dt;
        d.x -= (1.2 + (P.wind ? P.wind.value : 0)) * dt;
        if (d.y < 0.05 || d.x < -18) resetDrop(d, false);
        const slant = 0.22 + (P.wind ? P.wind.value : 0) * 0.06;
        pos.array[i * 6] = d.x;
        pos.array[i * 6 + 1] = d.y;
        pos.array[i * 6 + 2] = d.z;
        pos.array[i * 6 + 3] = d.x - slant * d.len;
        pos.array[i * 6 + 4] = d.y + d.len;
        pos.array[i * 6 + 5] = d.z;
      }
      rainGeo.setDrawRange(0, rainCount * 2);
      pos.needsUpdate = true;
    }

    /* ---- puddles + neon reflections ---- */
    const wet = P.clamp(st.rain * 1.3 + (st.weather === 'storm' ? 0.2 : 0), 0, 1);
    puddleMat.opacity = damp(puddleMat.opacity, wet * 0.62, 2);
    reflMat.opacity = damp(reflMat.opacity, wet * (0.05 + night * 0.33), 2);
    for (const p of puddles) {
      p.mesh.visible = puddleMat.opacity > 0.02;
      p.refl.visible = reflMat.opacity > 0.02;
    }
    for (const r of ripples) {
      if (wet < 0.05) { r.mat.opacity = 0; r.mesh.visible = false; continue; }
      r.mesh.visible = true;
      r.age += dt;
      if (r.age > r.life) {
        r.age = 0;
        r.x = rr(-14, 14); r.z = rr(2, 10.5);
        r.mesh.position.set(r.x, 0.07, r.z);
      }
      const k = r.age / r.life;
      r.mat.opacity = Math.sin(k * Math.PI) * 0.28 * wet;
      r.mesh.scale.setScalar(0.5 + k * 2.4);
    }

    /* ---- lightning ---- */
    if (st.weather === 'storm' && !P.state.reducedMotion) {
      nextBolt -= dt;
      if (nextBolt <= 0) {
        P.flash = 1;
        nextBolt = 5 + rand() * 7;
      }
    }
    P.flash = Math.max(0, P.flash - dt * 3.2);
    if (P.flash > 0.55 && rand() > 0.5) P.flash *= 0.6; // stutter

    /* ---- searchlights ---- */
    const active = st.rain > 0.08 || st.weather === 'storm' || st.alert;
    const _from = P._slFrom || (P._slFrom = new T.Vector3());
    const _to = P._slTo || (P._slTo = new T.Vector3());
    const _dir = P._slDir || (P._slDir = new T.Vector3());
    const _mid = P._slMid || (P._slMid = new T.Vector3());
    const _up = P._slUp || (P._slUp = new T.Vector3(0, 1, 0));
    for (let i = 0; i < searchlights.length; i++) {
      const sl = searchlights[i];
      sl.sweep += dt * (st.alert ? 0.35 : 0.14);
      const aimX = st.alert ? -5 : Math.sin(sl.sweep + i * 2.2) * 16;
      const aimZ = st.alert ? 9 : 10 + Math.cos(sl.sweep + i * 1.7) * 4;
      const from = _from.set(sl.x, 7.0, sl.z);
      const to = _to.set(aimX, 0.2, aimZ);
      const dir = _dir.copy(to).sub(from).normalize();
      sl.spot.target.position.copy(to);
      sl.spot.target.updateMatrixWorld();
      sl.spot.intensity = damp(sl.spot.intensity, active ? (st.alert ? 620 : 210) * (0.4 + night * 0.6) : 0, 3);
      sl.lensMat.emissiveIntensity = damp(sl.lensMat.emissiveIntensity, active ? 2.2 : 0.2, 3);
      // orient the cone
      const mid = _mid.copy(from).addScaledVector(dir, 8);
      sl.cone.position.copy(mid);
      sl.cone.quaternion.setFromUnitVectors(_up, dir.clone().multiplyScalar(-1));
      sl.core.position.copy(mid);
      sl.core.quaternion.copy(sl.cone.quaternion);
      sl.coneMat.opacity = damp(sl.coneMat.opacity, active ? (st.alert ? 0.105 : 0.055) : 0, 2.5);
      sl.coreMat.opacity = damp(sl.coreMat.opacity, active ? (st.alert ? 0.10 : 0.05) : 0, 2.5);
      sl.cone.visible = sl.coneMat.opacity > 0.004;
      sl.core.visible = sl.coreMat.opacity > 0.004;
    }

    /* ---- welder sparks ---- */
    const working = !st.alert && !P.state.assembling;
    if (working) {
      weldTimer -= dt;
      if (weldTimer <= 0) {
        weldTimer = 2 + rand() * 1.0;
        if (P.weldSpot) burstSparks(P.weldSpot);
      }
    }
    sparkBurst = Math.max(0, sparkBurst - dt * 2.2);
    weldLight.intensity = damp(weldLight.intensity, sparkBurst * 85, 8);
    weldGlowMat.opacity = sparkBurst * 0.85;
    weldGlow.visible = weldGlowMat.opacity > 0.01;
    {
      const pos = sparkGeo.attributes.position;
      const col = sparkGeo.attributes.color;
      let any = false;
      for (let i = 0; i < SPARK_N; i++) {
        const s = sparkState[i];
        if (s.life <= 0) { if (pos.array[i * 3 + 1] > -50) { pos.array[i * 3 + 1] = -99; col.array[i * 3] = col.array[i * 3 + 1] = col.array[i * 3 + 2] = 0; any = true; } continue; }
        any = true;
        s.life -= dt;
        s.vy -= 7.5 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
        if (s.y < 0.35) { s.y = 0.35; s.vy *= -0.35; s.vx *= 0.6; s.vz *= 0.6; }
        pos.array[i * 3] = s.x; pos.array[i * 3 + 1] = s.y; pos.array[i * 3 + 2] = s.z;
        const k = Math.max(0, s.life / s.max);
        col.array[i * 3] = k * 0.95;
        col.array[i * 3 + 1] = k * 0.34;
        col.array[i * 3 + 2] = k * 0.06;
      }
      if (any) { pos.needsUpdate = true; colorNeedsUpdate(col); }
    }

    /* ---- smoke (kaiju event) ---- */
    if (P.kaiju) {
      const out = P.kaiju.out || 0;
      smokeOrigin.set(-11.6 + 6.0 * out - 1.2, 1.0, 9.0);
    }
    if (P.smokeActive) {
      smokeSpawnAcc += dt * 34;
      while (smokeSpawnAcc >= 1) {
        smokeSpawnAcc -= 1;
        for (let i = 0; i < SMOKE_N; i++) {
          const s = smokeState[i];
          if (s.life > 0) continue;
          s.life = s.max = rr(2.0, 3.4);
          const atTunnel = rand() < 0.45;
          s.x = (atTunnel ? -11.4 : smokeOrigin.x) + rr(-2.4, 2.0);
          s.y = (atTunnel ? 2.0 : smokeOrigin.y) + rr(0.2, 3.6);
          s.z = smokeOrigin.z + rr(-3.0, 3.0);
          s.vx = rr(0.15, 1.0); s.vy = rr(0.3, 0.9); s.vz = rr(-0.2, 0.2);
          s.size = rr(4.0, 7.0);
          break;
        }
      }
    }
    {
      const pos = smokeGeo.attributes.position;
      const life = smokeGeo.attributes.aLife;
      const size = smokeGeo.attributes.aSize;
      let any = false;
      for (let i = 0; i < SMOKE_N; i++) {
        const s = smokeState[i];
        if (s.life <= 0) {
          if (pos.array[i * 3 + 1] > -50) {
            pos.array[i * 3 + 1] = -99; life.array[i] = 0; any = true;
          }
          continue;
        }
        any = true;
        s.life -= dt;
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
        s.vx *= (1 - dt * 0.4);
        pos.array[i * 3] = s.x; pos.array[i * 3 + 1] = s.y; pos.array[i * 3 + 2] = s.z;
        life.array[i] = Math.max(0, s.life / s.max);
        size.array[i] = s.size;
      }
      if (any) { pos.needsUpdate = true; life.needsUpdate = true; size.needsUpdate = true; }
    }

    // vending / pool glows handled by world
  });

  function colorNeedsUpdate(attr) { attr.needsUpdate = true; }

  P.effects = {
    petals, leaves, snow, rain, fireflies, sparks, smoke, puddles, searchlights,
    burstSparks, resetDrop
  };
  console.log('[PRUN] effects ready');
})();
