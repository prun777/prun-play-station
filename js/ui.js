/* =========================================================
   PRUN PLAY STATION — UI, picking, diagnostics
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T;
  const $ = (id) => document.getElementById(id);

  const seasonNames = { spring: 'SPRING', summer: 'SUMMER', autumn: 'AUTUMN', winter: 'WINTER' };
  const weatherNames = { clear: 'CLEAR', rain: 'RAIN', storm: 'STORM', fog: 'FOG' };

  /* ---------------- state sync ---------------- */
  P.onAlertToggle = function (on) {
    $('alertbar').classList.toggle('show', on);
    $('btnAlert').classList.toggle('on', on);
    $('chip-season').parentElement && null;
    document.querySelectorAll('.status .chip').forEach(c => c.classList.toggle('alert', on));
    if (!on) {
      // objects that belong to the event fold away
    }
  };

  /* ---------------- panels ---------------- */
  document.querySelectorAll('[data-collapse]').forEach(head => {
    head.addEventListener('click', () => {
      const panel = document.getElementById(head.getAttribute('data-collapse'));
      panel.classList.toggle('collapsed');
    });
  });

  /* ---------------- seasons ---------------- */
  const seasonSeg = $('seasonSeg');
  seasonSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-season]');
    if (!btn) return;
    const season = btn.getAttribute('data-season');
    P.setSeason(season);
    seasonSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    updateChips();
  });

  /* ---------------- time ---------------- */
  const timeSlider = $('timeSlider');
  const timeVal = $('timeVal');
  const autoTime = $('autoTime');
  timeSlider.addEventListener('input', () => {
    P.state.hour = parseFloat(timeSlider.value);
    P.state.autoTime = false;
    autoTime.classList.remove('on');
    timeVal.textContent = P.hourString(P.state.hour);
    updateChips();
  });
  autoTime.addEventListener('click', () => {
    P.state.autoTime = !P.state.autoTime;
    autoTime.classList.toggle('on', P.state.autoTime);
  });

  /* ---------------- weather ---------------- */
  const weatherSeg = $('weatherSeg');
  const rainSlider = $('rainSlider');
  const rainVal = $('rainVal');
  function setWeather(w) {
    P.state.weather = w;
    if (w === 'clear') P.state.rain = 0;
    else if (w === 'rain') P.state.rain = 0.65;
    else if (w === 'storm') P.state.rain = 0.95;
    else if (w === 'fog') P.state.rain = 0;
    rainSlider.value = P.state.rain;
    rainVal.textContent = Math.round(P.state.rain * 100) + '%';
    weatherSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.getAttribute('data-weather') === w));
    updateChips();
  }
  weatherSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-weather]');
    if (!btn) return;
    setWeather(btn.getAttribute('data-weather'));
  });
  rainSlider.addEventListener('input', () => {
    P.state.rain = parseFloat(rainSlider.value);
    if (P.state.rain > 0.01 && (P.state.weather === 'clear' || P.state.weather === 'fog')) {
      P.state.weather = 'rain';
    }
    if (P.state.rain <= 0.01 && P.state.weather !== 'fog') P.state.weather = 'clear';
    rainVal.textContent = Math.round(P.state.rain * 100) + '%';
    weatherSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.getAttribute('data-weather') === P.state.weather));
    updateChips();
  });

  /* ---------------- chips ---------------- */
  function updateChips() {
    const st = P.state;
    const chips = document.querySelectorAll('.status .chip');
    if (chips[0]) chips[0].innerHTML = '<span class="dot"></span>SEASON <b>' + seasonNames[st.season] + '</b>';
    if (chips[1]) chips[1].innerHTML = '<span class="dot"></span>TIME <b>' + P.hourString(st.hour) + '</b>';
    if (chips[2]) chips[2].innerHTML = '<span class="dot"></span>WEATHER <b>' + weatherNames[st.weather] + '</b>';
  }

  /* ---------------- dock ---------------- */
  const btnRotate = $('btnRotate');
  const btnCinema = $('btnCinema');
  const btnAlert = $('btnAlert');
  const btnAssemble = $('btnAssemble');

  $('btnReset').addEventListener('click', () => {
    if (P.state.alert) P.setAlert(false);
    P.setViewHome(false);
  });
  btnRotate.addEventListener('click', () => {
    P.state.autoRotate = !P.state.autoRotate;
    btnRotate.classList.toggle('on', P.state.autoRotate);
  });
  btnCinema.addEventListener('click', () => setCinema(!P.state.cinema));
  btnAlert.addEventListener('click', () => {
    if (P.state.assembling) return;
    P.toggleAlert();
  });
  btnAssemble.addEventListener('click', () => runAssembly());

  function setCinema(on) {
    P.state.cinema = on;
    document.body.classList.toggle('cinema', on);
    btnCinema.classList.toggle('on', on);
    if (on) {
      closeInfo();
      hideDiag();
    }
  }

  /* cinema hint + escape */
  const cineHint = document.createElement('div');
  cineHint.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:31;font:9px/1 var(--mono);letter-spacing:.28em;color:rgba(210,230,245,.5);opacity:0;transition:.4s;pointer-events:none';
  cineHint.textContent = 'CINEMA MODE · ESC 退出';
  document.body.appendChild(cineHint);
  const style = document.createElement('style');
  style.textContent = 'body.cinema #cinehint{opacity:1}';
  document.head.appendChild(style);
  cineHint.id = 'cinehint';
  const obs = new MutationObserver(() => { cineHint.style.opacity = P.state.cinema ? '1' : '0'; });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (P.state.cinema) { setCinema(false); return; }
      closeInfo();
      hideDiag();
    }
  });
  document.addEventListener('dblclick', (e) => {
    if (P.state.cinema) setCinema(false);
  });

  /* ---------------- fullscreen ---------------- */
  $('fullscreen').addEventListener('click', () => {
    const d = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (d.requestFullscreen || d.webkitRequestFullscreen || function () { }).call(d);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () { }).call(document);
    }
  });

  /* ---------------- assembly animation ---------------- */
  function runAssembly() {
    if (P.state.assembling || P.state.alert) return;
    P.state.assembling = true;
    const items = P.registry.slice();
    items.forEach((entry, i) => {
      const g = entry.group;
      if (!g) return;
      const y0 = g.position.y;
      const s0 = g.scale.x || 1;
      const lift = 5 + (i % 7) * 1.1;
      const delay = i * 0.022;
      setTimeout(() => {
        P.tween({
          dur: 1.15, ease: P.easeOutQuint,
          update: (k) => {
            g.position.y = y0 + (1 - k) * lift;
            const s = s0 * (0.86 + 0.14 * k);
            g.scale.set(s, s, s);
          },
          done: () => {
            g.position.y = y0;
            g.scale.setScalar(s0);
          }
        });
      }, delay * 1000);
    });
    setTimeout(() => { P.state.assembling = false; }, (items.length * 0.022 + 1.3) * 1000);
  }

  /* ---------------- object picking ---------------- */
  const raycaster = new T.Raycaster();
  const pointer = new T.Vector2(-10, -10);
  let pointerInside = false;
  let hoverId = null, selectedId = null;
  const canvas = P.renderer.domElement;

  canvas.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerInside = true;
  });
  canvas.addEventListener('pointerleave', () => { pointerInside = false; setHover(null); });

  let downX = 0, downY = 0;
  canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('pointerup', (e) => {
    if (P.state.cinema) return;
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 7) return;
    pickAt(e.clientX, e.clientY, true);
  });

  const outline = new T.BoxHelper(new T.Object3D(), 0x5fe0ff);
  outline.material.depthTest = false;
  outline.material.transparent = true;
  outline.material.opacity = 0.85;
  outline.material.toneMapped = false;
  outline.visible = false;
  outline.renderOrder = 20;
  P.scene.add(outline);
  P.outline = outline;

  function pickAt(clientX, clientY, isClick) {
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera({ x: nx, y: ny }, P.camera);
    const hits = raycaster.intersectObjects(P.pickables, false);
    if (!hits.length) {
      if (isClick) { closeInfo(); hideDiag(); setHover(null); }
      return null;
    }
    const id = hits[0].object.userData.objId;
    const entry = P.byId[id];
    if (!entry) return null;
    if (isClick) selectObject(entry);
    return entry;
  }

  function setHover(entry) {
    const id = entry ? entry.id : null;
    if (id === hoverId) return;
    hoverId = id;
    if (!entry) {
      if (!selectedId) outline.visible = false;
      else if (P.byId[selectedId]) { outline.setFromObject(P.byId[selectedId].group); outline.visible = true; }
      canvas.style.cursor = 'grab';
      return;
    }
    if (!selectedId || selectedId !== id) {
      outline.setFromObject(entry.group);
      outline.visible = true;
    }
    canvas.style.cursor = 'pointer';
  }

  P.onUpdate(function hoverTick() {
    if (P.state.cinema || P.isDragging() || !pointerInside) { if (!selectedId) outline.visible = false; return; }
    // throttle raycasts to ~12 Hz using frame time
    hoverTick.acc = (hoverTick.acc || 0) + P.clock.dt;
    if (hoverTick.acc < 0.09) return;
    hoverTick.acc = 0;
    raycaster.setFromCamera({ x: pointer.x, y: pointer.y }, P.camera);
    const hits = raycaster.intersectObjects(P.pickables, false);
    if (!hits.length) { setHover(null); return; }
    const entry = P.byId[hits[0].object.userData.objId];
    setHover(entry || null);
  });

  /* ---------------- info card ---------------- */
  const info = $('info');
  let infoEntry = null;
  function selectObject(entry) {
    infoEntry = entry;
    selectedId = entry.id;
    outline.setFromObject(entry.group);
    outline.visible = true;
    const idx = P.registry.indexOf(entry) + 1;
    $('infoId').textContent = 'OBJ-' + String(idx).padStart(2, '0') + ' / 46';
    $('infoName').textContent = entry.name;
    $('infoEn').textContent = entry.en || '';
    $('infoDesc').textContent = entry.desc || '';
    const tags = $('infoTags');
    tags.innerHTML = '';
    (entry.tags || []).forEach(t => {
      const s = document.createElement('span');
      s.className = 'tag';
      s.textContent = t;
      tags.appendChild(s);
    });
    info.classList.add('show');
    if (P.diagTargets && P.diagTargets[entry.id]) showDiag(entry);
    else hideDiag();
  }
  function closeInfo() {
    info.classList.remove('show');
    infoEntry = null;
    selectedId = null;
    if (!hoverId) outline.visible = false;
    else if (P.byId[hoverId]) { outline.setFromObject(P.byId[hoverId].group); outline.visible = true; }
    hideDiag();
  }
  $('infoClose').addEventListener('click', closeInfo);
  $('infoOk').addEventListener('click', closeInfo);
  $('infoFocus').addEventListener('click', () => {
    if (!infoEntry) return;
    const box = new T.Box3().setFromObject(infoEntry.group);
    const c = box.getCenter(new T.Vector3());
    const size = box.getSize(new T.Vector3()).length();
    P.focusOn(c, P.clamp(size * 0.85, 12, 32));
  });

  /* ---------------- diagnostics ---------------- */
  const diag = $('diag');
  const diagCanvas = $('diagCanvas');
  const dctx = diagCanvas.getContext('2d');
  let diagOpen = null;
  P.diagTargets = {
    repairBench: { cpu: 46, volt: 12.0, sig: 82, temp: 48, unit: 'P-0x2F' },
    tester: { cpu: 32, volt: 5.02, sig: 96, temp: 41, unit: 'P-0x31' },
    teardown: { cpu: 58, volt: 12.4, sig: 74, temp: 53, unit: 'P-0x37' }
  };
  P.diagValues = {
    repairBench: { cpu: 46, volt: 12.0, sig: 82, temp: 48 },
    tester: { cpu: 32, volt: 5.02, sig: 96, temp: 41 },
    teardown: { cpu: 58, volt: 12.4, sig: 74, temp: 53 }
  };
  P.buildDiagnosticsList && P.buildDiagnosticsList();

  function showDiag(entry) {
    diagOpen = entry.id;
    $('diagName').textContent = entry.name;
    diag.classList.add('show');
    const foot = diag.querySelectorAll('.d-foot b');
    if (foot[0]) foot[0].textContent = P.diagTargets[entry.id].unit;
  }
  function hideDiag() {
    diagOpen = null;
    diag.classList.remove('show');
  }
  $('diagClose').addEventListener('click', hideDiag);

  let diagAcc = 0;
  P.onUpdate(function diagUpdate(dt, t) {
    if (!diagOpen) return;
    const base = P.diagTargets[diagOpen];
    const v = P.diagValues[diagOpen];
    v.cpu += ((base.cpu + Math.sin(t * 1.3) * 7 + Math.sin(t * 3.1) * 3) - v.cpu) * Math.min(1, dt * 2);
    v.volt += ((base.volt + Math.sin(t * 2.2) * 0.02) - v.volt) * Math.min(1, dt * 2);
    v.sig += ((base.sig + Math.sin(t * 0.9) * 6) - v.sig) * Math.min(1, dt * 2);
    v.temp += ((base.temp + Math.sin(t * 0.7) * 4) - v.temp) * Math.min(1, dt * 2);
    diagAcc += dt;
    if (diagAcc < 0.12) return;
    diagAcc = 0;
    setBar('barCpu', 'valCpu', v.cpu, Math.round(v.cpu) + '%', false);
    setBar('barVolt', 'valVolt', (v.volt - 2) / 10 * 100, v.volt.toFixed(2) + 'V', false);
    setBar('barSig', 'valSig', v.sig, Math.round(v.sig) + '%', v.sig < 75);
    setBar('barTemp', 'valTemp', (v.temp - 25) / 55 * 100, Math.round(v.temp) + '°C', v.temp > 58);
    drawScope(t, v);
  });

  function setBar(barId, valId, pct, text, warn) {
    const bar = $(barId), val = $(valId);
    if (bar) {
      bar.style.width = P.clamp(pct, 0, 100) + '%';
      bar.classList.toggle('warn', !!warn);
    }
    if (val) val.textContent = text;
  }

  const waveHistory = [];
  function drawScope(t, v) {
    const w = diagCanvas.width, h = diagCanvas.height;
    dctx.clearRect(0, 0, w, h);
    // grid
    dctx.strokeStyle = 'rgba(95,224,255,.09)';
    dctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      dctx.beginPath(); dctx.moveTo(x, 0); dctx.lineTo(x, h); dctx.stroke();
    }
    for (let y = 0; y < h; y += 26) {
      dctx.beginPath(); dctx.moveTo(0, y); dctx.lineTo(w, y); dctx.stroke();
    }
    // waveform
    dctx.strokeStyle = '#5fe0ff';
    dctx.lineWidth = 2;
    dctx.beginPath();
    for (let x = 0; x < w; x += 2) {
      const ph = x * 0.035 + t * 4;
      const amp = 16 + Math.sin(t * 0.8) * 5;
      const y = h / 2 + Math.sin(ph) * amp + Math.sin(ph * 2.7) * amp * 0.3;
      if (x === 0) dctx.moveTo(x, y); else dctx.lineTo(x, y);
    }
    dctx.stroke();
    // threshold
    dctx.strokeStyle = 'rgba(255,179,92,.35)';
    dctx.setLineDash([6, 6]);
    dctx.beginPath(); dctx.moveTo(0, 22); dctx.lineTo(w, 22); dctx.stroke();
    dctx.setLineDash([]);
    // marker
    dctx.fillStyle = 'rgba(125,255,178,.9)';
    dctx.fillRect(w - 4, h / 2 - 18, 3, 36);
  }

  /* ---------------- HUD chip time refresh ---------------- */
  let chipAcc = 0;
  P.onUpdate(function hudUpdate(dt) {
    chipAcc += dt;
    if (chipAcc > 0.2) {
      chipAcc = 0;
      const st = P.state;
      const chips = document.querySelectorAll('.status .chip');
      if (chips[1]) chips[1].innerHTML = '<span class="dot"></span>TIME <b>' + P.hourString(st.hour) + '</b>';
      if (chips[2]) chips[2].innerHTML = '<span class="dot"></span>WEATHER <b>' + weatherNames[st.weather] + '</b>';
      if (chips[0] && !chips[0].innerHTML.includes(seasonNames[st.season])) {
        chips[0].innerHTML = '<span class="dot"></span>SEASON <b>' + seasonNames[st.season] + '</b>';
      }
    }
  });

  /* ---------------- time slider sync (auto cycle) ---------------- */
  P.syncTimeUI = function () {
    timeSlider.value = P.state.hour;
    timeVal.textContent = P.hourString(P.state.hour);
  };

  /* ---------------- FPS ---------------- */
  let fpsAcc = 0, fpsFrames = 0;
  P.reportFrame = function (dt) {
    fpsAcc += dt; fpsFrames++;
    if (fpsAcc >= 0.5) {
      const fps = Math.round(fpsFrames / fpsAcc);
      const el = $('fps');
      if (el) el.innerHTML = 'FPS <b>' + fps + '</b>';
      fpsAcc = 0; fpsFrames = 0;
    }
  };

  P.syncUIFromState = function () {
    const st = P.state;
    seasonSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.getAttribute('data-season') === st.season));
    weatherSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.getAttribute('data-weather') === st.weather));
    timeSlider.value = st.hour;
    timeVal.textContent = P.hourString(st.hour);
    rainSlider.value = st.rain;
    rainVal.textContent = Math.round(st.rain * 100) + '%';
    autoTime.classList.toggle('on', st.autoTime);
    updateChips();
  };

  updateChips();

  P.ui = { setCinema, closeInfo, runAssembly, setWeather, sync: P.syncUIFromState };
  console.log('[PRUN] ui ready');
})();
