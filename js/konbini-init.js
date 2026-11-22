/* =========================================================
   HOSHINO MART expansion — stitch the east block to the map,
   build it, hook its update loop and add one dock entry.
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN;
  const K = window.KONBINI;
  if (!P || !K) return;
  const T = P.T;
  const scene = P.scene;

  /* widen the sun shadow frustum so the new block is shadowed too */
  if (P.sun && P.sun.shadow) {
    const sc = P.sun.shadow.camera;
    sc.left = -48; sc.right = 48; sc.top = 48; sc.bottom = -48;
    sc.updateProjectionMatrix();
  }

  /* ---- seam bridge: fill the 0.1-unit gap between bases ---- */
  const bridgeMat = new T.MeshStandardMaterial({ color: 0x2a2e37, roughness: 0.9, metalness: 0.03 });
  const bridge = new T.Mesh(new T.BoxGeometry(0.6, 1.74, 24.0), bridgeMat);
  bridge.position.set(17.95, -0.85, 0.9); // top at 0.02
  bridge.receiveShadow = true;
  scene.add(bridge);

  /* ---- road / sidewalk / forecourt patches across the seam ---- */
  function patch(w, h, d, x, yTop, z, mat) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, yTop - h / 2, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  const roadPatchMat = new T.MeshStandardMaterial({ color: 0x23262c, roughness: 0.32, metalness: 0.3 });
  const walkPatchMat = new T.MeshStandardMaterial({ color: 0x767b82, roughness: 0.82, metalness: 0.04 });
  const forePatchMat = new T.MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.8, metalness: 0.05 });
  patch(1.25, 0.018, 3.6, 17.95, 0.038, 9.0, roadPatchMat);
  patch(1.25, 0.16, 1.0, 17.95, 0.15, 6.7, walkPatchMat);
  patch(1.25, 0.07, 6.5, 17.95, 0.075, 2.95, forePatchMat);
  patch(1.25, 0.16, 2.1, 17.95, 0.15, 11.85, walkPatchMat);
  const seamPaint = new T.MeshStandardMaterial({ color: 0xc7d0da, emissive: 0x536575, emissiveIntensity: 0.5, roughness: 0.6 });
  patch(1.7, 0.012, 0.09, 17.95, 0.045, 9.0, seamPaint);

  /* ---- build the block ---- */
  K.buildWorld();
  K.buildStore();
  if (K.bakeInteriorUnlit) K.bakeInteriorUnlit();
  K.buildEffects();
  K.settlePieces();

  P.onUpdate(function konbiniUpdate(dt, t) {
    K.updateAssembly(dt);
    if (K.updateEffects) K.updateEffects(dt, t);
  });

  function focusKonbini() {
    if (P.state.alert) P.setAlert(false);
    P.state.autoTime = false;
    P.state.hour = 22;
    P.state.weather = 'rain';
    P.state.rain = 0.88;
    if (P.syncUIFromState) P.syncUIFromState();
    P.view.theta = 0.55;
    P.view.phi = 1.22;
    P.focusOn(new T.Vector3(30, 1.9, 1.2), 33);
    if (K.replayAssembly) K.replayAssembly();
  }
  P.konbini = { K, focus: focusKonbini, blockGroup: K.blockGroup };

  /* ---- one dock entry: fly east + replay the block assembly ---- */
  const dock = document.getElementById('dock');
  if (dock && !document.getElementById('btnKonbini')) {
    const btn = document.createElement('button');
    btn.className = 'dock-btn';
    btn.id = 'btnKonbini';
    btn.title = '雨夜街区 · 地图扩展';
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 9.5l1.2-4.5h13.6L20 9.5"/><path d="M5.2 9.5V20h13.6V9.5"/><path d="M9.5 20v-5.5h5V20"/><path d="M8 6h8"/></svg><span>雨夜街区</span>';
    const sep = dock.querySelector('.dock-sep');
    dock.insertBefore(btn, sep || null);
    btn.addEventListener('click', focusKonbini);
  }

  console.log('[KONBINI] expansion stitched · block', K.blockGroup.position.toArray().join(','));
})();
