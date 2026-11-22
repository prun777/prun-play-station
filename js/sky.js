/* =========================================================
   PRUN PLAY STATION — sky, sun, seasons
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T;

  /* ---------------- season palettes ---------------- */
  // all colors are sRGB hex; three converts them into the linear working space
  P.SEASON = {
    spring: {
      name: '春季 · 樱', en: 'SPRING',
      zenith: 0x86b8f5, horizon: 0xffd9e8, dusk: 0xff9d86,
      nightZenith: 0x050a18, nightHorizon: 0x101a2c,
      sun: 0xfff0ea, sunDusk: 0xff9c74, hemiSky: 0xffd8e6, hemiGround: 0x4a4148,
      grass: 0x556b47, ground: 0x505748, foliage: 0xefa8c4, foliage2: 0xf7c3d6,
      palm: 0x4f8f55, pine: 0x3f6b4f, sand: 0xd8c79c, sea: 0x2a7fa0,
      fog: 0xc9d6e8, sunIntensity: 2.6, exposure: 1.12
    },
    summer: {
      name: '夏季 · 晴', en: 'SUMMER',
      zenith: 0x5ea8ff, horizon: 0xd2efff, dusk: 0xff9d5c,
      nightZenith: 0x040917, nightHorizon: 0x0c1728,
      sun: 0xfff6e2, sunDusk: 0xff8a45, hemiSky: 0xbfe2ff, hemiGround: 0x3f5a3a,
      grass: 0x3a6e38, ground: 0x3d5837, foliage: 0x2f7a3a, foliage2: 0x4a9b4d,
      palm: 0x2f7d3f, pine: 0x2f6340, sand: 0xe2cf9e, sea: 0x1f86a8,
      fog: 0xd6ecf7, sunIntensity: 3.1, exposure: 1.1
    },
    autumn: {
      name: '秋季 · 枫', en: 'AUTUMN',
      zenith: 0x8fa0dd, horizon: 0xffd08a, dusk: 0xff8f53,
      nightZenith: 0x060914, nightHorizon: 0x121522,
      sun: 0xffe8c8, sunDusk: 0xff8a4a, hemiSky: 0xffd9a8, hemiGround: 0x4a3a2c,
      grass: 0x6f6a3e, ground: 0x5a563c, foliage: 0xd9622b, foliage2: 0xf0a03c,
      palm: 0x6f8a45, pine: 0x3f6244, sand: 0xd3bd8d, sea: 0x2c6f7f,
      fog: 0xe3d2b4, sunIntensity: 2.35, exposure: 1.12
    },
    winter: {
      name: '冬季 · 雪', en: 'WINTER',
      zenith: 0xb6c7d8, horizon: 0xe8eff5, dusk: 0xe8a882,
      nightZenith: 0x060b16, nightHorizon: 0x121c2b,
      sun: 0xeaf1ff, sunDusk: 0xd8b090, hemiSky: 0xdce6f2, hemiGround: 0x4a5058,
      grass: 0x60665a, ground: 0x878e96, foliage: 0x9aa4a8, foliage2: 0xb6c0c4,
      palm: 0x5c6b62, pine: 0x2f4a3f, sand: 0xbfc4c1, sea: 0x35596c,
      fog: 0xd9e2ec, sunIntensity: 1.9, exposure: 1.16
    }
  };

  // live season color targets (THREE.Color instances, updated on season change)
  P.seasonColors = {};
  function buildColorTargets() {
    const p = P.SEASON[P.state.season];
    for (const k in p) {
      if (typeof p[k] === 'string') continue;
      if (k === 'name' || k === 'en' || k === 'sunIntensity' || k === 'exposure') continue;
      P.seasonColors[k] = new T.Color(p[k]);
    }
  }
  buildColorTargets();

  P.setSeason = function (season) {
    if (!P.SEASON[season]) return;
    P.state.season = season;
    buildColorTargets();
    if (P.onSeasonChange) P.onSeasonChange(season);
  };

  P.applySeasonColor = function (mat, key, dt, rate) {
    const target = P.seasonColors[key];
    if (!target || !mat || !mat.color) return;
    const k = 1 - Math.exp(-(rate || 2.0) * Math.min(dt, 0.1));
    mat.color.lerp(target, k);
  };

  /* ---------------- sky dome ---------------- */
  const uniforms = {
    uZenith: { value: new T.Color(0x6ea4f2) },
    uHorizon: { value: new T.Color(0xffd3e3) },
    uSunColor: { value: new T.Color(0xfff0ea) },
    uSunDir: { value: new T.Vector3(0.3, 0.7, 0.6) },
    uSunGlow: { value: 1 },
    uNight: { value: 0 },
    uFlash: { value: 0 },
    uCamY: { value: -0.55 }
  };
  P.skyUniforms = uniforms;

  const skyGeo = new T.SphereGeometry(260, 32, 20);
  const skyMat = new T.ShaderMaterial({
    uniforms: uniforms,
    side: T.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: true,
    vertexShader: `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSunColor;
      uniform vec3 uSunDir; uniform float uSunGlow; uniform float uNight; uniform float uFlash; uniform float uCamY;
      varying vec3 vDir;
      void main(){
        vec3 dir = normalize(vDir);
        // camera-relative elevation: the diorama camera always looks down, so tie the
        // gradient to the view so the zenith colour is visible above the scene
        float h = dir.y - uCamY;
        float t = smoothstep(-0.06, 0.34, h);
        vec3 col = mix(uHorizon, uZenith, t);
        // horizon haze
        col = mix(col, uHorizon * 1.04, smoothstep(0.06, -0.08, h) * 0.55);
        // sun disc + halo (day only)
        float d = max(dot(dir, normalize(uSunDir)), 0.0);
        col += uSunColor * pow(d, 620.0) * 2.6 * uSunGlow;
        col += uSunColor * pow(d, 18.0) * 0.16 * uSunGlow;
        // faint night gradient lift
        col += vec3(0.004, 0.007, 0.016) * uNight;
        col += vec3(0.55, 0.62, 0.75) * uFlash;
        gl_FragColor = vec4(col * (1.02 + 0.05 * (1.0 - uNight)), 1.0);
      }`
  });
  const skyDome = new T.Mesh(skyGeo, skyMat);
  skyDome.renderOrder = -10;
  skyDome.frustumCulled = false;
  P.scene.add(skyDome);

  /* ---------------- stars ---------------- */
  const starGeo = new T.BufferGeometry();
  {
    const N = 720, pos = new Float32Array(N * 3), r = 210;
    const rand = P.mulberry32(777);
    for (let i = 0; i < N; i++) {
      const theta = rand() * Math.PI * 2;
      const y = Math.pow(rand(), 0.55) * 0.92 + 0.06;
      const s = Math.sqrt(1 - y * y);
      pos[i * 3] = Math.cos(theta) * s * r;
      pos[i * 3 + 1] = y * r;
      pos[i * 3 + 2] = Math.sin(theta) * s * r;
    }
    starGeo.setAttribute('position', new T.BufferAttribute(pos, 3));
  }
  const starMat = new T.PointsMaterial({
    color: 0xbfd6ff, size: 1.5, sizeAttenuation: false,
    transparent: true, opacity: 0, depthWrite: false,
    blending: T.AdditiveBlending, toneMapped: false
  });
  const stars = new T.Points(starGeo, starMat);
  stars.frustumCulled = false;
  P.scene.add(stars);
  P.stars = stars;

  // moon
  const moonMat = new T.MeshBasicMaterial({ color: 0xdce7ff, transparent: true, opacity: 0, toneMapped: false });
  const moon = new T.Mesh(new T.SphereGeometry(3.2, 16, 12), moonMat);
  moon.frustumCulled = false;
  P.scene.add(moon);
  const moonGlowMat = new T.MeshBasicMaterial({
    map: P.glowTexture([[0, 'rgba(210,225,255,.85)'], [0.28, 'rgba(170,195,255,.22)'], [1, 'rgba(140,170,255,0)']]),
    transparent: true, opacity: 0, depthWrite: false,
    blending: T.AdditiveBlending, toneMapped: false, side: T.BackSide
  });
  const moonGlow = new T.Mesh(new T.SphereGeometry(9, 16, 12), moonGlowMat);
  moonGlow.frustumCulled = false;
  P.scene.add(moonGlow);

  /* ---------------- lights ---------------- */
  const sun = new T.DirectionalLight(0xfff0ea, 2.6);
  sun.position.set(26, 34, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30;
  sc.near = 1; sc.far = 120;
  sc.updateProjectionMatrix();
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00025;
  sun.shadow.radius = 2;
  sun.target.position.set(0, 0, 0);
  P.scene.add(sun);
  P.scene.add(sun.target);
  P.sun = sun;

  const hemi = new T.HemisphereLight(0xffd8e6, 0x4a4148, 0.75);
  P.scene.add(hemi);
  P.hemi = hemi;

  const ambient = new T.AmbientLight(0x8fa6c8, 0.1);
  P.scene.add(ambient);
  P.ambient = ambient;

  const moonLight = new T.DirectionalLight(0x9db8ff, 0);
  moonLight.position.set(-30, 26, -18);
  P.scene.add(moonLight);
  P.moonLight = moonLight;

  // soft camera-side fill so the glass facade and interiors read by day
  const fill = new T.DirectionalLight(0xd6e6ff, 0.45);
  fill.position.set(-16, 17, 26);
  fill.target.position.set(0, 2, 0);
  P.scene.add(fill);
  P.scene.add(fill.target);
  P.fillLight = fill;

  /* ---------------- day / night update ---------------- */
  const cZen = new T.Color(), cHor = new T.Color(), cSun = new T.Color();
  const cNightZen = new T.Color(), cNightHor = new T.Color();
  const sunDir = new T.Vector3();
  const smoothstep = (a, b, x) => { const t = P.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  P.updateSky = function (dt) {
    const st = P.state;
    const pal = P.SEASON[st.season];

    const az = ((st.hour - 6) / 12) * Math.PI;
    const elev = Math.sin(az);
    const day = smoothstep(-0.06, 0.24, elev);
    const night = 1 - smoothstep(-0.20, 0.03, elev);
    const dusk = P.clamp(1 - Math.abs(elev) / 0.34, 0, 1) * day;

    // sun position — rises in the east (+x) and sets in the west (-x)
    const sx = Math.cos(az) * 52;
    const sy = elev * 48 + 2;
    const sz = 26;
    sun.position.set(sx, sy, sz);
    sunDir.set(sx, sy, sz).normalize();
    sun.target.position.set(0, 2, 0);
    sun.target.updateMatrixWorld();

    // weather dimming
    const rain = st.rain;
    const storm = st.weather === 'storm' ? 1 : 0;
    const fogW = st.weather === 'fog' ? 1 : 0;
    const dim = 1 - rain * 0.30 - storm * 0.10 - fogW * 0.12;

    // day colors
    cZen.setHex(pal.zenith).lerp(new T.Color(pal.dusk), dusk * 0.35);
    cHor.setHex(pal.horizon).lerp(new T.Color(pal.dusk), dusk * 0.72);
    // night colors
    cNightZen.setHex(pal.nightZenith);
    cNightHor.setHex(pal.nightHorizon);

    cZen.lerp(cNightZen, night).multiplyScalar(dim);
    cHor.lerp(cNightHor, night).multiplyScalar(dim);
    // overcast: pull the sky toward cold grey when it rains or fogs
    const murk = Math.min(1, rain * 0.8 + fogW * 0.5);
    const stormCol = new T.Color(0x5d6b7a);
    cZen.lerp(stormCol, murk * 0.62);
    cHor.lerp(stormCol, murk * 0.52);

    // smooth the sky
    const k = 1 - Math.exp(-dt * 6);
    uniforms.uZenith.value.lerp(cZen, k);
    uniforms.uHorizon.value.lerp(cHor, k);
    uniforms.uSunDir.value.copy(sunDir);
    uniforms.uNight.value += (night - uniforms.uNight.value) * k;
    uniforms.uFlash.value += ((P.flash || 0) - uniforms.uFlash.value) * Math.min(1, dt * 18);
    const camDir = new T.Vector3();
    P.camera.getWorldDirection(camDir);
    uniforms.uCamY.value += (camDir.y - uniforms.uCamY.value) * Math.min(1, dt * 8);

    // sun color + intensity
    cSun.setHex(pal.sun).lerp(new T.Color(pal.sunDusk), dusk * 0.85);
    sun.color.lerp(cSun, k);
    const sunPower = pal.sunIntensity * 1.16 * day * (0.55 + 0.45 * Math.max(elev, 0)) * (1 - rain * 0.55 - storm * 0.15) * (1 - fogW * 0.35);
    sun.intensity += (sunPower - sun.intensity) * k;
    uniforms.uSunGlow.value += ((day * (1 - rain * 0.8)) - uniforms.uSunGlow.value) * k;

    // hemisphere + ambient
    hemi.color.lerp(cHor, k);
    hemi.groundColor.lerp(new T.Color(pal.hemiGround), k);
    const hemiPower = (0.45 + 1.05 * day) * (1 - rain * 0.30 - storm * 0.08);
    hemi.intensity += (hemiPower - hemi.intensity) * k;
    ambient.intensity += (((0.09 + 0.14 * day)) - ambient.intensity) * k;

    // fill
    const fillPower = (0.26 + 0.78 * day) * (1 - rain * 0.25);
    P.fillLight.intensity += (fillPower - P.fillLight.intensity) * k;

    // moon
    moonLight.position.set(-sx * 0.8, Math.max(-sy, 10) + 18, -20);
    moonLight.intensity += ((0.30 * night) - moonLight.intensity) * k;
    const moonDir = new T.Vector3(-sx * 0.8, Math.max(-sy, 10) + 18, -20).normalize();
    moon.position.copy(moonDir.multiplyScalar(230));
    moonGlow.position.copy(moon.position);
    moonMat.opacity += ((night * 0.95) - moonMat.opacity) * k;
    moonGlowMat.opacity += ((night * 0.5) - moonGlowMat.opacity) * k;

    // stars
    const starOp = night * (1 - rain * 0.9) * (1 - fogW * 0.9) * (storm ? 0.25 : 1);
    starMat.opacity += (starOp - starMat.opacity) * k;

    // fog — color follows the horizon, density follows weather
    const fogColorTarget = cHor.clone().multiplyScalar(0.72 + day * 0.2);
    P.scene.fog.color.lerp(fogColorTarget, k);
    const density = 0.0026 + rain * 0.0032 + storm * 0.0018 + fogW * 0.010 + night * 0.0008;
    P.scene.fog.density += (density - P.scene.fog.density) * k;

    // exposure — keep day bright, night readable
    const exposure = pal.exposure + 0.10 + dusk * 0.03 - night * 0.06;
    P.renderer.toneMappingExposure += (exposure - P.renderer.toneMappingExposure) * k;

    // status chip time handled by UI
  };

  P.getSunAzimuth = () => ((P.state.hour - 6) / 12) * Math.PI;

  console.log('[PRUN] sky ready');
})();
