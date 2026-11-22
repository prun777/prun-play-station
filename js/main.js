/* =========================================================
   PRUN PLAY STATION — boot & the single animate() loop
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T;
  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(location.search);
  const debug = {
    shot: params.has('shot') || params.has('freeze'),
    t: parseFloat(params.get('t') || '0') || 0,
    season: params.get('season'),
    hour: params.get('hour'),
    weather: params.get('weather'),
    rain: params.get('rain'),
    alert: params.get('alert'),
    eventAt: params.get('eventAt'),
    theta: params.get('theta'),
    phi: params.get('phi'),
    radius: params.get('radius'),
    tx: params.get('tx'),
    ty: params.get('ty'),
    tz: params.get('tz')
  };
  P.debug = debug;

  /* batch static meshes first, then build the pick list */
  if (P.mergeStaticScene) P.mergeStaticScene();
  P.finalizeRegistry();
  if (P.ui && P.ui.setWeather) { /* keep initial UI in sync */ }

  /* camera starts at home immediately */
  P.setViewHome(true);
  P.updateCamera(0.016, 0);

  /* debug scenario setup */
  if (debug.season && P.SEASON[debug.season]) P.setSeason(debug.season);
  if (debug.hour !== null && debug.hour !== undefined) P.state.hour = parseFloat(debug.hour);
  if (debug.weather) {
    P.state.weather = debug.weather;
    if (debug.rain !== null && debug.rain !== undefined) P.state.rain = parseFloat(debug.rain);
    else P.state.rain = debug.weather === 'storm' ? 0.95 : debug.weather === 'rain' ? 0.65 : 0;
  } else if (debug.rain !== null && debug.rain !== undefined) {
    P.state.rain = parseFloat(debug.rain);
    if (P.state.rain > 0.01) P.state.weather = 'rain';
  }
  if (debug.theta !== null && debug.theta !== undefined) {
    P.view.theta = parseFloat(debug.theta);
    P.view.st = P.view.theta;
  }
  if (debug.phi !== null && debug.phi !== undefined) {
    P.view.phi = parseFloat(debug.phi);
    P.view.sp = P.view.phi;
  }
  if (debug.radius !== null && debug.radius !== undefined) {
    P.view.radius = parseFloat(debug.radius);
    P.view.sr = P.view.radius;
  }
  for (const k of ['tx', 'ty', 'tz']) {
    if (debug[k] !== null && debug[k] !== undefined) {
      P.view[k] = parseFloat(debug[k]);
      P.view['s' + k] = P.view[k];
    }
  }
  if (debug.alert !== null && debug.alert !== undefined && debug.alert !== '0') {
    P.setAlert(true);
    if (debug.eventAt !== null && debug.eventAt !== undefined) {
      P.kaiju.elapsed = parseFloat(debug.eventAt);
      if (P.kaiju.elapsed > 3) { P.kaiju.triggered = true; P.smokeActive = true; }
    }
  }
  if (P.syncUIFromState) P.syncUIFromState();
  if (params.get('cinema') === '1' && P.ui && P.ui.setCinema) P.ui.setCinema(true);

  /* ---------------- the single update step ---------------- */
  function step(dt, t) {
    P.clock.dt = dt;
    P.clock.t = t;
    P.updateTweens(dt);
    P.updateCamera(dt, t);
    P.updateSky(dt);
    for (let i = 0; i < P.updaters.length; i++) {
      try { P.updaters[i](dt, t); } catch (err) { console.error(err); }
    }
    // auto day cycle — 30 s per day
    if (P.state.autoTime) {
      P.state.hour = (P.state.hour + dt * (24 / 30)) % 24;
      if (P.syncTimeUI) P.syncTimeUI();
    }
  }

  /* ---------------- boot ---------------- */
  let started = false;
  let elapsed = 0;
  let last = performance.now();
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    const l = $('loader');
    if (l) {
      l.classList.add('gone');
      setTimeout(() => { l.style.display = 'none'; }, 900);
    }
    setTimeout(() => {
      const h = $('hint');
      if (h) h.style.opacity = '0';
    }, 9000);
  }

  function firstFrame() {
    P.renderer.render(P.scene, P.camera);
    hideLoader();
    window.__ready = true;
    document.body.classList.add('ready');
  }

  if (debug.shot) {
    // deterministic freeze: advance the simulation to t seconds, render one frame
    const fixed = 1 / 30;
    const steps = Math.min(Math.round(debug.t * 30), 3600);
    for (let i = 0; i < steps; i++) {
      elapsed += fixed;
      step(fixed, elapsed);
    }
    P.updateCamera(0.001, elapsed);
    P.renderer.render(P.scene, P.camera);
    hideLoader();
    window.__ready = true;
    // allow a few extra frames for async shader compile without advancing time
    let extra = 0;
    function freezeLoop() {
      if (extra++ < 8) {
        P.renderer.render(P.scene, P.camera);
        requestAnimationFrame(freezeLoop);
      } else {
        window.__frozen = true;
      }
    }
    requestAnimationFrame(freezeLoop);
  } else {
    async function boot() {
      try {
        if (P.renderer.compileAsync) {
          await P.renderer.compileAsync(P.scene, P.camera);
        }
      } catch (e) { /* compileAsync is an optimisation only */ }
      firstFrame();
      P.renderer.shadowMap.autoUpdate = false;
      P.renderer.shadowMap.needsUpdate = true;
      P.renderer.setAnimationLoop(animate);
    }

    // --- performance governor: keep the frame budget under ~16 ms ---
  let perfWindow = 0, perfFrames = 0, perfCooldown = 0, shadowClock = 0;
  let shadowEvery = 0;
  function govern(rawDt) {
    if (rawDt > 0.25) return;                 // tab switch / debugger pause
    perfWindow += rawDt; perfFrames++;
    perfCooldown = Math.max(0, perfCooldown - rawDt);
    shadowClock += rawDt;
    if (shadowClock > 0.12) {
      shadowClock = 0;
      P.renderer.shadowMap.needsUpdate = true;
    }
    if (perfWindow < 2) return;
    const avg = perfWindow / perfFrames;
    const cur = P.renderer.getPixelRatio();
    const cap = Math.min(window.devicePixelRatio || 1, 1.75);
    if (avg > 0.0175 && cur > 1.0 && perfCooldown <= 0) {
      P.renderer.setPixelRatio(Math.max(1.0, +(cur - 0.25).toFixed(2)));
      perfCooldown = 2.0;
    } else if (avg < 0.0135 && cur < cap - 0.01 && perfCooldown <= 0) {
      P.renderer.setPixelRatio(Math.min(cap, +(cur + 0.25).toFixed(2)));
      perfCooldown = 3.0;
    }
    perfWindow = 0; perfFrames = 0;
  }

  function animate() {
      const now = performance.now();
      const rawDt = (now - last) / 1000;
      last = now;
      let dt = isFinite(rawDt) && rawDt > 0 ? rawDt : 0.016;
      dt = Math.min(dt, 1 / 20); // clamp simulation after tab switches
      elapsed += dt;
      step(dt, elapsed);
      P.renderer.render(P.scene, P.camera);
      govern(rawDt);
      if (P.reportFrame) P.reportFrame(rawDt);
      if (!started) { started = true; hideLoader(); window.__ready = true; }
    }
    // Let the loader paint before the heavy build starts
    requestAnimationFrame(() => setTimeout(boot, 30));
  }

  console.log('[PRUN] boot · objects=' + P.registry.length +
    ' · pickables=' + P.pickables.length +
    ' · three r' + T.REVISION);
})();
