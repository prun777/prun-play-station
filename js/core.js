/* =========================================================
   PRUN PLAY STATION — core
   renderer / camera / controls / helpers / registry / tween
   ========================================================= */
(function () {
  'use strict';

  const P = window.PRUN = window.PRUN || {};
  const T = window.THREE;

  P.T = T;
  P.W = 35.8;             // diorama width  (x)
  P.D = 26.8;             // diorama depth  (z)
  P.HALF_W = P.W / 2;
  P.HALF_D = P.D / 2;
  P.FLOOR = 0;            // top of the base slab

  /* ---------------- tiny seeded RNG (reproducible shots) ---------------- */
  P.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  P.rand = P.mulberry32(20261122);
  P.rr = (a, b) => a + (b - a) * P.rand();

  /* ---------------- renderer ---------------- */
  const stage = document.getElementById('stage');
  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false
    });
  } catch (e) {
    document.getElementById('loader').innerHTML =
      '<div style="font:13px/1.8 -apple-system,sans-serif;color:#ff8090;text-align:center;padding:40px">' +
      '无法创建 WebGL 上下文。<br>请使用支持 WebGL2 的浏览器，并开启硬件加速。</div>';
    throw e;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = T.SRGBColorSpace;
  stage.appendChild(renderer.domElement);
  P.renderer = renderer;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x0c1119, 0.0032);
  P.scene = scene;

  const camera = new T.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 600);
  P.camera = camera;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  });

  /* ---------------- orbit controls (self contained) ---------------- */
  const HOME = { theta: 0.60, phi: 0.96, radius: 58, tx: 0, ty: 2.6, tz: 2.2 };
  const view = {
    theta: HOME.theta, phi: HOME.phi, radius: HOME.radius,
    tx: HOME.tx, ty: HOME.ty, tz: HOME.tz,
    // smoothed
    st: HOME.theta, sp: HOME.phi, sr: HOME.radius,
    stx: HOME.tx, sty: HOME.ty, stz: HOME.tz
  };
  P.view = view;
  P.HOME = HOME;

  let dragging = false, lastX = 0, lastY = 0, moved = 0;
  const el = renderer.domElement;

  el.addEventListener('pointerdown', (e) => {
    if (P.state.cinema) return;
    dragging = true; moved = 0;
    lastX = e.clientX; lastY = e.clientY;
    el.classList.add('dragging');
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    view.theta -= dx * 0.0052;
    view.phi = T.MathUtils.clamp(view.phi - dy * 0.0042, 0.55, 1.45);
  });
  const endDrag = () => { dragging = false; el.classList.remove('dragging'); };
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('wheel', (e) => {
    if (P.state.cinema) return;
    e.preventDefault();
    view.radius = T.MathUtils.clamp(view.radius * (1 + Math.sign(e.deltaY) * 0.07), 22, 82);
  }, { passive: false });

  P.isDragging = () => dragging;
  P.dragMoved = () => moved;

  P.setViewHome = function (immediate) {
    if (immediate) {
      Object.assign(view, HOME);
      view.st = HOME.theta; view.sp = HOME.phi; view.sr = HOME.radius;
      view.stx = HOME.tx; view.sty = HOME.ty; view.stz = HOME.tz;
    } else {
      P.tween({
        dur: 1.25, ease: P.easeInOutCubic,
        update: (k) => {
          view.theta = T.MathUtils.lerp(view.theta, HOME.theta, k * 0.35);
          view.phi = T.MathUtils.lerp(view.phi, HOME.phi, k * 0.35);
          view.radius = T.MathUtils.lerp(view.radius, HOME.radius, k * 0.35);
          view.tx = T.MathUtils.lerp(view.tx, HOME.tx, k * 0.35);
          view.ty = T.MathUtils.lerp(view.ty, HOME.ty, k * 0.35);
          view.tz = T.MathUtils.lerp(view.tz, HOME.tz, k * 0.35);
        }
      });
    }
  };

  const tmpVec = new T.Vector3();
  P.focusOn = function (point, dist) {
    const r = dist || 26;
    const t0 = { theta: view.theta, phi: view.phi, radius: view.radius, tx: view.tx, ty: view.ty, tz: view.tz };
    // shortest angular path
    let dy = point.y - t0.ty;
    P.tween({
      dur: 1.15, ease: P.easeInOutCubic,
      update: (k) => {
        view.tx = T.MathUtils.lerp(t0.tx, point.x, k);
        view.ty = T.MathUtils.lerp(t0.ty, point.y, k);
        view.tz = T.MathUtils.lerp(t0.tz, point.z, k);
        view.radius = T.MathUtils.lerp(t0.radius, r, k);
        view.phi = T.MathUtils.lerp(t0.phi, 1.02, k);
      }
    });
  };

  /* ---------------- tween manager ---------------- */
  P.tweens = [];
  P.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  P.easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  P.easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
  P.easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

  P.tween = function (opts) {
    const tw = {
      t: 0, dur: Math.max(opts.dur || 1, 0.0001),
      ease: opts.ease || P.easeOutCubic,
      update: opts.update, done: opts.done
    };
    P.tweens.push(tw);
    return tw;
  };

  P.updateTweens = function (dt) {
    for (let i = P.tweens.length - 1; i >= 0; i--) {
      const tw = P.tweens[i];
      tw.t += dt;
      const raw = Math.min(tw.t / tw.dur, 1);
      try { tw.update(tw.ease(raw), raw); } catch (err) { console.warn(err); }
      if (raw >= 1) { P.tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
  };

  /* ---------------- controls update ---------------- */
  P.updateCamera = function (dt, t) {
    if (P.state.autoRotate && !dragging && !P.state.cinema) view.theta += dt * 0.075;
    if (P.state.cinema) {
      view.theta += dt * 0.045;
      view.phi = T.MathUtils.damp(view.phi, 1.09, 1.4, dt);
      view.radius = T.MathUtils.damp(view.radius, 47, 1.2, dt);
      view.ty = T.MathUtils.damp(view.ty, 3.6, 1.2, dt);
    }
    const k = 1 - Math.exp(-dt * 10);
    view.st += (view.theta - view.st) * k;
    view.sp += (view.phi - view.sp) * k;
    view.sr += (view.radius - view.sr) * k;
    view.stx += (view.tx - view.stx) * k;
    view.sty += (view.ty - view.sty) * k;
    view.stz += (view.tz - view.stz) * k;

    const sp = Math.sin(view.sp), cp = Math.cos(view.sp);
    camera.position.set(
      view.stx + view.sr * sp * Math.sin(view.st),
      view.sty + view.sr * cp,
      view.stz + view.sr * sp * Math.cos(view.st)
    );
    if (camera.position.y < 1.4) camera.position.y = 1.4;
    camera.lookAt(view.stx, view.sty, view.stz);
    camera.updateMatrixWorld();
  };

  /* ---------------- material helpers ---------------- */
  const matCache = new Map();
  P.mat = function (key, make) {
    if (!matCache.has(key)) matCache.set(key, make());
    return matCache.get(key);
  };

  P.std = function (color, roughness, metalness, extra) {
    return new T.MeshStandardMaterial(Object.assign({
      color: color,
      roughness: roughness === undefined ? 0.78 : roughness,
      metalness: metalness === undefined ? 0.04 : metalness,
      flatShading: false
    }, extra || {}));
  };
  P.flat = function (color, roughness, extra) {
    return new T.MeshStandardMaterial(Object.assign({
      color: color, roughness: roughness === undefined ? 0.9 : roughness,
      metalness: 0.02, flatShading: true
    }, extra || {}));
  };
  P.emissive = function (color, intensity, extra) {
    return new T.MeshStandardMaterial(Object.assign({
      color: color, emissive: color, emissiveIntensity: intensity === undefined ? 1.4 : intensity,
      roughness: 0.4, metalness: 0.1
    }, extra || {}));
  };
  P.basic = function (color, extra) {
    return new T.MeshBasicMaterial(Object.assign({ color: color }, extra || {}));
  };

  /* glass: very transparent, faint edge reflection, never a colored halo */
  P.glassMat = P.mat('glass', () => new T.MeshPhysicalMaterial({
    color: 0xe6f6ff,
    roughness: 0.10,
    metalness: 0.0,
    transparent: true,
    opacity: 0.068,
    transmission: 0,
    reflectivity: 0.06,
    clearcoat: 0.08,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0,
    side: T.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1
  }));

  /* shared geometry */
  const G = {
    box: new T.BoxGeometry(1, 1, 1),
    sphereLo: new T.IcosahedronGeometry(1, 1),
    sphereHi: new T.SphereGeometry(1, 16, 12),
    cyl8: new T.CylinderGeometry(1, 1, 1, 8),
    cyl12: new T.CylinderGeometry(1, 1, 1, 12),
    plane: new T.PlaneGeometry(1, 1)
  };
  P.G = G;

  /* ---------------- mesh helpers (y = bottom of the box) ---------------- */
  P.box = function (parent, w, h, d, x, yBottom, z, material, opts) {
    opts = opts || {};
    const m = new T.Mesh(G.box, material);
    m.scale.set(w, h, d);
    m.position.set(x, yBottom + h / 2, z);
    if (opts.ry) m.rotation.y = opts.ry;
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.rz) m.rotation.z = opts.rz;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    if (opts.name) m.name = opts.name;
    parent.add(m);
    return m;
  };

  P.cyl = function (parent, rTop, rBottom, h, x, yBottom, z, material, opts) {
    opts = opts || {};
    const geo = new T.CylinderGeometry(rTop, rBottom, h, opts.seg || 10, 1, !!opts.open);
    const m = new T.Mesh(geo, material);
    m.position.set(x, yBottom + h / 2, z);
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.rz) m.rotation.z = opts.rz;
    if (opts.ry) m.rotation.y = opts.ry;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    parent.add(m);
    return m;
  };

  P.ico = function (parent, r, x, y, z, material, opts) {
    opts = opts || {};
    const m = new T.Mesh(G.sphereLo, material);
    m.scale.set(r, opts.ry || r, opts.rz || r);
    m.position.set(x, y, z);
    m.rotation.y = opts.rot || 0;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    parent.add(m);
    return m;
  };

  P.plane = function (parent, w, h, x, y, z, material, opts) {
    opts = opts || {};
    const m = new T.Mesh(G.plane, material);
    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    if (opts.rz !== undefined) m.rotation.z = opts.rz;
    m.receiveShadow = !!opts.receive;
    parent.add(m);
    return m;
  };

  P.group = function (parent, x, y, z, name) {
    const g = new T.Group();
    g.position.set(x || 0, y || 0, z || 0);
    if (name) g.name = name;
    parent.add(g);
    return g;
  };

  /* ---------------- canvas texture helpers (all offline) ---------------- */
  P.canvasTexture = function (w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    tex.needsUpdate = true;
    return tex;
  };

  P.textTexture = function (text, opts) {
    opts = opts || {};
    const size = opts.size || 72;
    const weight = opts.weight || 700;
    const font = opts.font || '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    const color = opts.color || '#eaf8ff';
    const pad = opts.pad === undefined ? 24 : opts.pad;
    const spacing = opts.spacing === undefined ? 6 : opts.spacing;
    const glow = opts.glow || null;
    const w = Math.ceil(opts.w || 1024);
    const h = Math.ceil(opts.h || 256);
    return P.canvasTexture(w, h, (ctx) => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${weight} ${size}px ${font}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      // measure with spacing
      let total = 0;
      const chars = Array.from(text);
      for (const ch of chars) total += ctx.measureText(ch).width + spacing;
      total -= spacing;
      let x = (w - total) / 2;
      const y = h / 2 + (opts.offsetY || 0);
      ctx.shadowBlur = glow ? 22 : 0;
      ctx.shadowColor = glow || 'transparent';
      for (const ch of chars) {
        ctx.fillStyle = color;
        ctx.fillText(ch, x, y);
        x += ctx.measureText(ch).width + spacing;
      }
      if (opts.sub) {
        ctx.shadowBlur = 0;
        ctx.font = `500 ${opts.subSize || 24}px ${font}`;
        ctx.fillStyle = opts.subColor || 'rgba(200,225,240,.62)';
        ctx.textAlign = 'center';
        ctx.fillText(opts.sub, w / 2, h / 2 + size * 0.78);
      }
    });
  };

  P.signMesh = function (parent, text, w, h, opts) {
    opts = opts || {};
    const tex = P.textTexture(text, {
      w: opts.texW || 1024, h: opts.texH || 256,
      size: opts.size || 84, color: opts.color || '#dff8ff',
      glow: opts.glow || null, spacing: opts.spacing === undefined ? 8 : opts.spacing,
      weight: opts.weight || 700, sub: opts.sub, subSize: opts.subSize,
      subColor: opts.subColor
    });
    const mat = new T.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false,
      side: T.DoubleSide, toneMapped: false
    });
    const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    m.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    m.renderOrder = 2;
    parent.add(m);
    return m;
  };

  /* radial glow sprite texture */
  P.glowTexture = function (colorStops) {
    return P.canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      (colorStops || [[0, 'rgba(255,255,255,.9)'], [0.35, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']])
        .forEach(([p, c]) => g.addColorStop(p, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
  };

  P.lightPool = function (parent, x, z, radius, color, opacity, y) {
    const tex = P.mat('pooltex_' + color, () => P.glowTexture([
      [0, 'rgba(255,255,255,.95)'], [0.45, 'rgba(255,255,255,.32)'], [1, 'rgba(255,255,255,0)']
    ]));
    const mat = new T.MeshBasicMaterial({
      map: tex, color: color, transparent: true, opacity: opacity === undefined ? 0.35 : opacity,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    });
    const m = new T.Mesh(new T.PlaneGeometry(radius * 2, radius * 2), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, (y === undefined ? 0.063 : y), z);
    m.renderOrder = 1;
    parent.add(m);
    return m;
  };

  P.contactShadow = function (parent, w, d, x, y, z, opacity) {
    const tex = P.mat('contactshadow', () => P.glowTexture([
      [0, 'rgba(255,255,255,.95)'], [0.55, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']
    ]));
    const mat = new T.MeshBasicMaterial({
      map: tex, color: 0x000000, transparent: true, opacity: opacity === undefined ? 0.4 : opacity,
      depthWrite: false, toneMapped: false
    });
    const m = new T.Mesh(new T.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.renderOrder = 1;
    m.userData.noPick = true;
    parent.add(m);
    return m;
  };

  /* ---------------- clickable-object registry ---------------- */
  P.registry = [];
  P.byId = {};
  P.pickables = [];

  P.register = function (def) {
    if (!def || !def.group) return;
    if (P.byId[def.id]) console.warn('duplicate object id', def.id);
    const entry = Object.assign({ tags: [] }, def);
    entry.group.userData.objId = def.id;
    entry.center = new T.Vector3();
    P.registry.push(entry);
    P.byId[def.id] = entry;
    return entry;
  };

  P.finalizeRegistry = function () {
    P.pickables.length = 0;
    const proxyOnly = { storeGlass: true, warehouseGlass: true };
    for (const entry of P.registry) {
      entry.group.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(entry.group);
      if (isFinite(box.min.x)) {
        box.getCenter(entry.center);
        entry.size = box.getSize(new T.Vector3()).length();
      }
      entry.group.traverse((o) => {
        if (!o.isMesh) return;
        if (o.userData.noPick) return;
        if (proxyOnly[entry.id] && !o.userData.isProxy) return;
        o.userData.objId = entry.id;
        P.pickables.push(o);
      });
    }
    if (P.registry.length !== 46) {
      console.warn('[PRUN] expected 46 clickable objects, got', P.registry.length);
    } else {
      console.log('[PRUN] 46 clickable objects registered');
    }
    P.buildDiagnosticsList();
  };

  /* ---------------- shared state ---------------- */
  P.state = {
    season: 'spring',
    hour: 14,
    autoTime: false,
    weather: 'clear',
    rain: 0,
    autoRotate: false,
    cinema: false,
    alert: false,
    assembling: false,
    loaded: false,
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* diagnostics list filled by world/building */
  P.diagTargets = {};
  P.buildDiagnosticsList = function () {
    P.diagIds = Object.keys(P.diagTargets);
  };

  /* ---------------- misc utilities ---------------- */
  P.lerp = T.MathUtils.lerp;
  P.clamp = T.MathUtils.clamp;
  P.damp = T.MathUtils.damp;

  P.clock = { t: 0, dt: 0 };

  P.isNight = () => (P.state.hour < 6.2 || P.state.hour > 19.2);
  P.hourString = function (h) {
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };

  P.worldPoint = function (x, y, z) { return new T.Vector3(x, y, z); };

  /* update functions registry */
  P.updaters = [];
  P.onUpdate = (fn) => P.updaters.push(fn);

  console.log('[PRUN] core ready · three r' + T.REVISION);
})();
