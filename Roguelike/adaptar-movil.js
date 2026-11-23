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
  // ---------- la ayuda del nivel («Así se usa…»): versión compacta para ventanas bajas (teléfono horizontal) ----------
  const cb = document.createElement('style'); cb.id = 'cssCompacto';
  cb.textContent = `@media (max-height:520px){
    #introNivel .panel,#introNivel.diario .panel{width:min(96vw,900px)!important;max-height:98vh!important;padding:8px 16px 8px 44px!important;font-size:13px!important}
    #introNivel.diario .panel:before{left:9px!important;top:8px!important;bottom:8px!important;width:18px!important}
    #introNivel .cab{min-height:0!important;padding-right:0!important} #introNivel .cab .vistaMundo{display:none!important}
    #introNivel h2,#introNivel.diario h2{font-size:21px!important;margin:0!important;max-width:none!important} #introNivel small{font-size:10px!important;letter-spacing:.1em!important}
    #introNivel .cuerpo,#introNivel.diario .cuerpo{gap:10px!important;margin-top:4px!important}
    #introNivel .donde,#introNivel.diario .donde{font-size:11.5px!important;margin:2px 0!important;padding:2px 7px!important}
    #introNivel .lema{font-size:12.5px!important;margin:3px 0!important;line-height:1.2!important}
    #introNivel .poder,#introNivel.diario .poder{margin:4px 0 0!important;padding:5px 8px!important;gap:8px!important}
    #introNivel .poder b{font-size:11px!important} #introNivel .poderTexto{font-size:12px!important;line-height:1.2!important}
    #introNivel .iconoPoder{width:34px!important;height:34px!important;font-size:20px!important}
    #introNivel .listo{margin:6px auto 0!important;padding:5px 24px!important;font-size:14px!important}
    #introNivel .seguir{margin-top:3px!important;font-size:9.5px!important}
    .tarjeta{transform:scale(.8);transform-origin:right bottom} #tarjetas{right:6px!important;bottom:6px!important}
    #banner{top:4%!important;width:min(360px,60vw)!important} #banner .panel{padding:7px 14px 8px 28px!important} #banner b{font-size:17px!important}
  }`;
  document.head.appendChild(cb);
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
