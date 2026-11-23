'use strict';
// =====================================================================
//  EL JUEGO EN EL TELÉFONO
//   · Pantallas de menú (título, opciones, logros…): en un teléfono horizontal la ventana mide ~350 px de alto y el
//     menú, hecho para 600+, se salía. Cada pantalla se encoge (zoom) lo justo para que quepa entera.
//   · Botón de pantalla completa (⛶) en una esquina, siempre a mano; se esconde solo cuando ya está en pantalla completa.
//     En iPhone/iPad (Safari no deja pantalla completa en páginas) avisa cómo instalarlo desde «Compartir».
// =====================================================================
(function () {
  const pantalla = document.getElementById('screen');
  // ---------- que cada pantalla quepa ----------
  let ocupado = false;
  function ajusta() {
    if (ocupado || !pantalla) return; ocupado = true;
    try {
      for (const hijo of pantalla.children) {
        if (hijo.nodeType !== 1) continue;
        hijo.style.zoom = '';                                           // medir sin zoom
        const h = hijo.getBoundingClientRect().height, w = hijo.getBoundingClientRect().width, libre = innerHeight - 30, ancho = innerWidth - 8;
        const k = Math.min(1, h > 0 ? libre / h : 1, w > 0 ? ancho / w : 1);
        if (k < .98) hijo.style.zoom = Math.max(.45, k).toFixed(3);
      }
    } finally { ocupado = false; }
  }
  if (pantalla) {
    new MutationObserver(() => requestAnimationFrame(ajusta)).observe(pantalla, { childList: true });
    addEventListener('resize', () => requestAnimationFrame(ajusta)); addEventListener('orientationchange', () => setTimeout(ajusta, 250));
    setTimeout(ajusta, 300); setTimeout(ajusta, 1200); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(ajusta, 100));
  }
  // ---------- pantalla completa ----------
  const css = document.createElement('style');
  css.textContent = '#btnCompleta{position:fixed;right:8px;top:64px;z-index:9998;width:40px;height:40px;border-radius:9px;border:0;padding:0;cursor:pointer;background:rgba(26,18,13,.62);color:#f3e7cf;font:700 22px/40px Georgia,serif;box-shadow:0 0 0 2px rgba(243,231,207,.55);display:none}'
    + '#btnCompleta:active{background:rgba(200,32,58,.85)} body.es-completa #btnCompleta{display:none}'
    + '@media (pointer:coarse){#btnCompleta{display:block}} #btnCompleta.siempre{display:block}'
    + '#avisoCompleta{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9999;max-width:86vw;background:#f1e2bd;color:#3a2418;border:2px dashed #b0412e;border-radius:6px;padding:8px 14px;font:600 14px/1.3 "Alegreya Sans",sans-serif;text-align:center}';
  document.head.appendChild(css);
  const btn = document.createElement('button'); btn.id = 'btnCompleta'; btn.type = 'button'; btn.title = 'Pantalla completa'; btn.setAttribute('aria-label', 'Pantalla completa'); btn.textContent = '⛶';
  document.body.appendChild(btn);
  const esCompleta = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const marca = () => document.body.classList.toggle('es-completa', esCompleta() || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  document.addEventListener('fullscreenchange', () => { marca(); setTimeout(ajusta, 200); }); document.addEventListener('webkitfullscreenchange', marca); marca();
  function aviso(t) { let a = document.getElementById('avisoCompleta'); if (!a) { a = document.createElement('div'); a.id = 'avisoCompleta'; document.body.appendChild(a); } a.textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(() => a.remove(), 6000); }
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const el = document.documentElement, pide = el.requestFullscreen || el.webkitRequestFullscreen;
    if (esCompleta()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (!pide) { aviso('En iPhone o iPad: toca «Compartir» y «Agregar a pantalla de inicio» para jugar a pantalla completa.'); return; }
    Promise.resolve(pide.call(el, { navigationUI: 'hide' })).then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (x) {} }).catch(() => aviso('Tu navegador no dejó pasar a pantalla completa. Prueba desde el menú del navegador.'));
  });
  // el botón también existe fuera de táctil si se pide (?completa=1)
  if (/[?&]completa=1/.test(location.search)) btn.classList.add('siempre');
})();
