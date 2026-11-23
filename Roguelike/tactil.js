'use strict';
// =====================================================================
//  CONTROLES TÁCTILES (celular y tableta)
//  · Solo se activan en pantallas táctiles (o con ?tactil=1 para probar en la compu).
//  · Itzel: flechas ◀ ▶ a la izquierda; saltar y impulso a la derecha, como en un control.
//  · Fresita: un dedo sobre el mundo la lleva ahí, y tocar usa el poder (clic izquierdo).
//    El botón de la canción de cuna es el clic derecho en el último lugar tocado.
//  · «Oprimen» las mismas teclas y los mismos eventos del mouse que usa el resto del juego,
//    así funciona igual en plataformas, isométrico, naves, torres, cocina, jarana y pesca.
//  · En las cinemáticas, tocar la pantalla las salta (como Espacio); en los menús los botones
//    se tocan normal. Si el teléfono está vertical, pide girarlo.
// =====================================================================
const TACTIL = (() => {
  const forzado = /[?&]tactil=1/.test(location.search);
  const touch = forzado || (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches);
  if (!touch) return { activo: false };

  const css = document.createElement('style');
  css.textContent = `
    html, body { touch-action:none; overscroll-behavior:none; -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; }
    #game, #relleno { touch-action:none; }
    #tactil { position:fixed; inset:0; z-index:40; pointer-events:none; display:none; }
    #tactil.on { display:block; }
    #tactil .bt { position:absolute; pointer-events:auto; touch-action:none; display:grid; place-items:center; width:var(--bt); height:var(--bt); border-radius:50%;
      background:rgba(40,24,16,.42); border:2px dashed rgba(255,240,215,.7); color:#fff6e4; font:800 calc(var(--bt) * .34) 'Alegreya Sans', system-ui, sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,.35); backdrop-filter:blur(2px); }
    #tactil .bt.on { background:rgba(200,32,58,.62); transform:scale(.94); }
    #tactil { --bt: clamp(58px, 15vmin, 96px); }
    #tactil .izq { left:calc(env(safe-area-inset-left) + 14px); bottom:calc(env(safe-area-inset-bottom) + 16px); }
    #tactil .der { left:calc(env(safe-area-inset-left) + 14px + var(--bt) * 1.25); bottom:calc(env(safe-area-inset-bottom) + 16px); }
    #tactil .arr, #tactil .aba { display:none; left:calc(env(safe-area-inset-left) + 14px + var(--bt) * .62); }
    #tactil .arr { bottom:calc(env(safe-area-inset-bottom) + 28px + var(--bt) * 1.15); } #tactil .aba { bottom:calc(env(safe-area-inset-bottom) + 16px); display:none; }
    #tactil.vert .arr, #tactil.vert .aba { display:grid; } #tactil.vert .izq, #tactil.vert .der { display:none; }
    /* niveles con escaleras (Escalando Calakmul): ▲ y ▼ junto a ◀ ▶ para trepar y bajar */
    #tactil.esc .arr, #tactil.esc .aba { display:grid; left:calc(env(safe-area-inset-left) + 14px + var(--bt) * 2.7); }
    #tactil.esc .arr { bottom:calc(env(safe-area-inset-bottom) + 24px + var(--bt)); } #tactil.esc .aba { bottom:calc(env(safe-area-inset-bottom) + 16px); }
    #tactil .salto { right:calc(env(safe-area-inset-right) + 14px); bottom:calc(env(safe-area-inset-bottom) + 16px); width:calc(var(--bt) * 1.15); height:calc(var(--bt) * 1.15); background:rgba(63,138,74,.5); }
    #tactil .impulso { right:calc(env(safe-area-inset-right) + 24px + var(--bt) * 1.15); bottom:calc(env(safe-area-inset-bottom) + 16px); background:rgba(242,178,51,.45); }
    #tactil .cuna { right:calc(env(safe-area-inset-right) + 14px); bottom:calc(env(safe-area-inset-bottom) + 28px + var(--bt) * 1.15); width:calc(var(--bt) * .8); height:calc(var(--bt) * .8); background:rgba(232,90,138,.5); }
    #tactil .bt small { position:absolute; bottom:-15px; font:700 11px 'Alegreya Sans', sans-serif; letter-spacing:.06em; color:#fff6e4; text-shadow:0 1px 2px #000; white-space:nowrap; }
    #giraTelefono { position:fixed; inset:0; z-index:99998; display:none; place-items:center; align-content:center; gap:14px; background:#1a120d; color:#f3e7cf; text-align:center; font:700 20px 'Alegreya', Georgia, serif; padding:30px; }
    #giraTelefono b { font-size:56px; }
    @media (orientation:portrait) { body.es-tactil #giraTelefono { display:grid; } }
  `;
  document.head.appendChild(css);
  document.body.classList.add('es-tactil');

  const capa = document.createElement('div'); capa.id = 'tactil';
  capa.innerHTML = `<div class="bt izq" data-k="ArrowLeft">◀</div><div class="bt der" data-k="ArrowRight">▶</div><div class="bt arr" data-k="ArrowUp">▲</div><div class="bt aba" data-k="ArrowDown">▼</div>
    <div class="bt impulso" data-k="ShiftLeft">⚡<small>impulso</small></div><div class="bt salto" data-k="Space">▲<small>saltar</small></div>
    <div class="bt cuna" data-clic="2">♪<small>cuna</small></div>`;
  document.body.appendChild(capa);
  const gira = document.createElement('div'); gira.id = 'giraTelefono'; gira.innerHTML = '<b>↻</b><div>Gira el teléfono para jugar<br>(Itzel se juega en horizontal)</div>'; document.body.appendChild(gira);

  // ---------- teclas que los botones tienen oprimidas ----------
  const dentro = new Map();   // pointerId → botón
  const teclas = new Set();
  function tecla(code, on) {
    if (on === teclas.has(code)) return;
    if (on) teclas.add(code); else teclas.delete(code);
    dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
  }
  const toque = code => { dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true })); dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true })); };
  let ultimo = { x: 213, y: 120 };     // último lugar tocado en el mundo (en unidades del juego)
  function botonDown(e) {
    const b = e.currentTarget; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) {} dentro.set(e.pointerId, b); b.classList.add('on');
    if (b.dataset.k) tecla(b.dataset.k, true);
    else if (b.dataset.clic && typeof STATE !== 'undefined' && STATE === 'play') { MOUSE.x = ultimo.x; MOUSE.y = ultimo.y; MOUSE.active = true; MOUSE.last = performance.now(); MOUSE.clicks.push({ x: ultimo.x, y: ultimo.y, b: 2 }); }
  }
  function botonUp(e) {
    const b = dentro.get(e.pointerId); if (!b) return; dentro.delete(e.pointerId);
    if (![...dentro.values()].includes(b)) { b.classList.remove('on'); if (b.dataset.k) tecla(b.dataset.k, false); }
  }
  for (const b of capa.querySelectorAll('.bt')) { b.addEventListener('pointerdown', botonDown); b.addEventListener('pointerup', botonUp); b.addEventListener('pointercancel', botonUp); }

  // ---------- Fresita: el dedo sobre el mundo ----------
  const lienzo = document.getElementById('game');
  const aMundo = e => { const r = lienzo.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * VISTA.H }; };
  let dedo = null;
  lienzo.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && !forzado) return;               // con mouse manda el código de siempre
    e.preventDefault();
    if (STATE === 'cine') { toque('Space'); return; }
    if (STATE !== 'play') return;
    const p = aMundo(e); ultimo = p; dedo = e.pointerId; try { lienzo.setPointerCapture(e.pointerId); } catch (err) {}
    MOUSE.x = p.x; MOUSE.y = p.y; MOUSE.active = true; MOUSE.last = performance.now(); MOUSE.clicks.push({ x: p.x, y: p.y, b: 0 });
  });
  lienzo.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && !forzado) return;
    if (dedo !== e.pointerId) return; e.preventDefault();
    const p = aMundo(e); ultimo = p; MOUSE.x = p.x; MOUSE.y = p.y; MOUSE.active = true; MOUSE.last = performance.now();
  });
  const sueltaDedo = e => {
    if (dedo !== e.pointerId) return; dedo = null;
    if (STATE === 'play') MOUSE.clicks.push({ x: MOUSE.x, y: MOUSE.y, b: 0, up: true });
  };
  lienzo.addEventListener('pointerup', sueltaDedo); lienzo.addEventListener('pointercancel', sueltaDedo);

  // ---------- cuándo se ven los botones ----------
  setInterval(() => {
    const jugando = typeof STATE !== 'undefined' && STATE === 'play' && !document.getElementById('enci')?.classList.contains('on');
    capa.classList.toggle('on', jugando); capa.classList.toggle('vert', !!(typeof CUR !== 'undefined' && CUR && CUR.modo && CUR.modo.vertical));
    // ¿este nivel tiene escaleras («H» en su mapa)? se mira una sola vez por nivel
    let esc = false;
    try {
      if (jugando && typeof CUR !== 'undefined' && CUR && typeof CUR.at === 'function' && CUR.W && CUR.H) {
        if (CUR._tieneEscaleras === undefined) { let n = false; for (let r = 0; r < CUR.H && !n; r++) for (let c = 0; c < CUR.W; c++) if (CUR.at(c, r) === 'H') { n = true; break; } CUR._tieneEscaleras = n; }
        esc = CUR._tieneEscaleras && !(CUR.modo && CUR.modo.vertical);
      }
    } catch (e) {}
    capa.classList.toggle('esc', !!esc);   // carreras: ▲ ▼ cambian de carril
    if (!jugando) for (const k of [...teclas]) tecla(k, false);
  }, 120);

  // pantalla completa y horizontal al primer toque (si el navegador lo permite)
  addEventListener('pointerdown', function una() {
    removeEventListener('pointerdown', una, true);
    try { const el = document.documentElement; if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {}); } catch (e) {}
  }, true);
  return { activo: true };
})();
