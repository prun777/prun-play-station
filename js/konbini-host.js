/* =========================================================
   HOSHINO MART expansion — host adapter
   Runs the konbini block inside the existing PRUN scene,
   offset east of the original diorama. No extra renderer,
   no extra camera, no UI of its own.
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN;
  const T = P.T;
  const K = window.KONBINI = {};
  K.T = T;
  K.hosted = true;
  K.renderer = P.renderer;
  K.camera = P.camera;

  /* the 24×24 expansion block, butted against the east edge of the
     original 35.8×26.8 base. Road/sidewalk levels line up. */
  const block = new T.Group();
  block.name = 'konbiniBlock';
  block.position.set(30.0, 0.01, 0.9);
  P.scene.add(block);
  K.blockGroup = block;
  K.scene = block;

  /* ---------------- toon pipeline ---------------- */
  const gradData = new Uint8Array([
    58, 58, 58, 255, 122, 122, 122, 255, 190, 190, 190, 255, 255, 255, 255
  ]);
  const gradientMap = new T.DataTexture(gradData, 4, 1, T.RGBAFormat);
  gradientMap.minFilter = T.NearestFilter;
  gradientMap.magFilter = T.NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;
  K.gradientMap = gradientMap;

  const toonCache = new Map();
  K.toon = function (color, opts) {
    opts = opts || {};
    const key = color + '|' + (opts.emissive || 0) + '|' + (opts.emissiveIntensity || 0) +
      '|' + (opts.flatShading ? 1 : 0) + '|' + (opts.side || 0) + '|' +
      (opts.map ? opts.map.uuid : '') + '|' + (opts.transparent ? (opts.opacity || 0) : 1);
    let m = toonCache.get(key);
    if (!m) {
      m = new T.MeshToonMaterial({
        color: color,
        gradientMap: gradientMap,
        map: opts.map || null,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.emissiveIntensity || 0,
        flatShading: !!opts.flatShading,
        side: opts.side || T.FrontSide,
        transparent: !!opts.transparent,
        opacity: opts.transparent ? (opts.opacity === undefined ? 1 : opts.opacity) : 1
      });
      m.toneMapped = false; // keep the anime palette flat inside the ACES PRUN scene
      toonCache.set(key, m);
    }
    return m;
  };

  const basicCache = new Map();
  K.basic = function (color, opts) {
    opts = opts || {};
    const key = color + '|' + (opts.opacity === undefined ? 1 : opts.opacity) + '|' + (opts.side || 0) + '|' + (opts.blending || 0);
    let m = basicCache.get(key);
    if (!m) {
      m = new T.MeshBasicMaterial({
        color: color,
        transparent: opts.opacity !== undefined && opts.opacity < 1,
        opacity: opts.opacity === undefined ? 1 : opts.opacity,
        side: opts.side || T.FrontSide,
        depthWrite: opts.depthWrite !== false,
        blending: opts.blending || T.NormalBlending,
        toneMapped: false
      });
      basicCache.set(key, m);
    }
    return m;
  };

  const outlineMat = new T.LineBasicMaterial({ color: 0x0a0c12, transparent: true, opacity: 0.85, toneMapped: false });
  K.outlineMat = outlineMat;
  const edgeCache = new Map();
  K.outline = function (mesh, threshold) {
    if (!mesh || !mesh.geometry) return null;
    threshold = threshold || 32;
    const key = mesh.geometry.uuid + '|' + threshold;
    let edges = edgeCache.get(key);
    if (!edges) {
      edges = new T.EdgesGeometry(mesh.geometry, threshold);
      edgeCache.set(key, edges);
    }
    const line = new T.LineSegments(edges, outlineMat);
    line.renderOrder = 2;
    mesh.add(line);
    return line;
  };

  /* ---------------- geometry helpers ---------------- */
  const unitBox = new T.BoxGeometry(1, 1, 1);
  const unitPlane = new T.PlaneGeometry(1, 1);
  const icoGeo = new T.IcosahedronGeometry(1, 1);
  K.geo = { box: unitBox, plane: unitPlane, ico: icoGeo };

  K.box = function (parent, w, h, d, x, yBottom, z, mat, opts) {
    opts = opts || {};
    const m = new T.Mesh(unitBox, mat);
    m.scale.set(w, h, d);
    m.position.set(x, yBottom + h / 2, z);
    if (opts.ry) m.rotation.y = opts.ry;
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.rz) m.rotation.z = opts.rz;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    if (mat.transparent) m.castShadow = false;
    parent.add(m);
    if (opts.outline) K.outline(m, opts.outlineAngle);
    return m;
  };

  K.cyl = function (parent, rt, rb, h, x, yBottom, z, mat, opts) {
    opts = opts || {};
    const g = new T.CylinderGeometry(rt, rb, h, opts.seg || 10, 1, !!opts.open);
    const m = new T.Mesh(g, mat);
    m.position.set(x, yBottom + h / 2, z);
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.rz) m.rotation.z = opts.rz;
    if (opts.ry) m.rotation.y = opts.ry;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    parent.add(m);
    if (opts.outline) K.outline(m, opts.outlineAngle);
    return m;
  };

  K.ico = function (parent, r, x, y, z, mat, opts) {
    opts = opts || {};
    const m = new T.Mesh(icoGeo, mat);
    m.scale.set(r, opts.sy || r, opts.sz || r);
    m.position.set(x, y, z);
    m.rotation.y = opts.ry || 0;
    m.castShadow = !!opts.cast;
    m.receiveShadow = opts.receive !== false;
    parent.add(m);
    if (opts.outline) K.outline(m);
    return m;
  };

  K.plane = function (parent, w, h, x, y, z, mat, opts) {
    opts = opts || {};
    const m = new T.Mesh(unitPlane, mat);
    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    if (opts.rz !== undefined) m.rotation.z = opts.rz;
    m.receiveShadow = !!opts.receive;
    parent.add(m);
    return m;
  };

  K.torus = function (parent, r, tube, x, y, z, mat, opts) {
    opts = opts || {};
    const m = new T.Mesh(new T.TorusGeometry(r, tube, 6, 16), mat);
    m.position.set(x, y, z);
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    if (opts.rz !== undefined) m.rotation.z = opts.rz;
    m.castShadow = !!opts.cast;
    parent.add(m);
    return m;
  };

  K.group = function (parent, x, y, z, name) {
    const g = new T.Group();
    g.position.set(x || 0, y || 0, z || 0);
    if (name) g.name = name;
    (parent || block).add(g);
    return g;
  };

  /* ---------------- textures / text ---------------- */
  K.canvasTexture = function (w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, P.renderer.capabilities.getMaxAnisotropy());
    tex.needsUpdate = true;
    return tex;
  };

  K.glowTexture = function (stops) {
    return K.canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      (stops || [[0, 'rgba(255,255,255,.95)'], [0.45, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']])
        .forEach(([p, c]) => g.addColorStop(p, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
  };

  K.textTexture = function (text, opts) {
    opts = opts || {};
    const w = Math.ceil(opts.texW || 512);
    const h = Math.ceil(opts.texH || 128);
    const fontFamily = opts.font || '"Hiragino Sans","Hiragino Kaku Gothic ProN","PingFang SC",-apple-system,sans-serif';
    const size = opts.size || 52;
    const color = opts.color || '#f2f7ff';
    const weight = opts.weight || 700;
    return K.canvasTexture(w, h, (ctx) => {
      ctx.clearRect(0, 0, w, h);
      if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, w, h); }
      ctx.font = weight + ' ' + size + 'px ' + fontFamily;
      ctx.textBaseline = 'middle';
      ctx.shadowColor = opts.glow || 'transparent';
      ctx.shadowBlur = opts.glow ? 16 : 0;
      if (opts.vertical) {
        ctx.textAlign = 'center';
        const chars = Array.from(text);
        const total = chars.length * size * 0.96;
        let y = h / 2 - total / 2 + size * 0.52 + (opts.offsetY || 0);
        for (const ch of chars) {
          ctx.fillStyle = color;
          ctx.fillText(ch, w / 2, y);
          y += size * 0.96;
        }
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.fillText(text, w / 2, h / 2 + (opts.offsetY || 0));
      }
      if (opts.sub) {
        ctx.shadowBlur = 0;
        ctx.font = '500 ' + (opts.subSize || 22) + 'px ' + fontFamily;
        ctx.fillStyle = opts.subColor || 'rgba(235,245,255,.65)';
        ctx.textAlign = 'center';
        ctx.fillText(opts.sub, w / 2, h / 2 + size * 0.78);
      }
    });
  };

  K.signPlane = function (parent, text, w, h, opts) {
    opts = opts || {};
    const tex = K.textTexture(text, Object.assign({}, opts, { texW: opts.texW || 1024, texH: opts.texH || 256 }));
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false
    }));
    m.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    m.renderOrder = 3;
    parent.add(m);
    return m;
  };

  K.textMesh = function (parent, text, w, h, tex, opts) {
    opts = opts || {};
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false
    }));
    m.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    if (opts.rx !== undefined) m.rotation.x = opts.rx;
    if (opts.ry !== undefined) m.rotation.y = opts.ry;
    m.renderOrder = 3;
    parent.add(m);
    return m;
  };

  K.lightPool = function (parent, x, z, radius, color, opacity, y) {
    const tex = K.glowTexture();
    const m = new T.Mesh(new T.PlaneGeometry(radius * 2, radius * 2), new T.MeshBasicMaterial({
      map: tex, color: color, transparent: true, opacity: opacity === undefined ? 0.22 : opacity,
      depthWrite: false, blending: T.AdditiveBlending, toneMapped: false
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y === undefined ? 0.03 : y, z);
    m.renderOrder = 1;
    parent.add(m);
    return m;
  };

  K.instancedBoxes = function (parent, items, opts) {
    opts = opts || {};
    const mat = opts.material || K.toon(0xffffff);
    const mesh = new T.InstancedMesh(unitBox, mat, items.length);
    const dummy = new T.Object3D();
    const color = new T.Color();
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      dummy.position.set(it.x, it.yBottom + it.h / 2, it.z);
      dummy.rotation.set(0, it.ry || 0, 0);
      dummy.scale.set(it.w, it.h, it.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setHex(it.color));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = opts.cast !== false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  K.wire = function (points, color, opacity) {
    const geo = new T.BufferGeometry().setFromPoints(points);
    const mat = new T.LineBasicMaterial({ color: color || 0x0c0f16, transparent: opacity !== undefined, opacity: opacity === undefined ? 1 : opacity });
    return new T.Line(geo, mat);
  };

  /* ---------------- expansion assembly (local to the block) ---------------- */
  const pieces = [];
  K.pieces = pieces;
  K.addPiece = function (obj, delay, opts) {
    opts = opts || {};
    const homeY = obj.position.y;
    const drop = opts.drop === undefined ? 4.4 : opts.drop;
    pieces.push({ obj: obj, homeY: homeY, startY: homeY - drop, delay: delay || 0, dur: opts.dur || 1.05 });
    return obj;
  };
  K.settlePieces = function () {
    for (const p of pieces) p.obj.position.y = p.homeY;
    K.assembly.started = false;
    K.assembly.done = true;
  };
  K.assembly = { started: false, time: 0, done: true };
  K.replayAssembly = function () {
    for (const p of pieces) p.obj.position.y = p.startY;
    K.assembly.started = true;
    K.assembly.time = 0;
    K.assembly.done = false;
  };
  K.updateAssembly = function (dt) {
    const a = K.assembly;
    if (!a.started) return;
    a.time += dt;
    let allDone = true;
    for (const p of pieces) {
      const local = T.MathUtils.clamp((a.time - p.delay) / p.dur, 0, 1);
      const e = 1 - Math.pow(1 - local, 3);
      p.obj.position.y = p.startY + (p.homeY - p.startY) * e;
      if (local < 1) allDone = false;
    }
    if (allDone) { a.done = true; a.started = false; }
  };

  console.log('[KONBINI] host ready · block at', block.position.toArray().join(','));
})();
