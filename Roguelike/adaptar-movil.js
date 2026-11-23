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
    #banner{top:4%!important;width:min(360px,60vw)!important} #banner .panel{padding:7px 14px 8px 28px!important} #banner b{font-size:17px!important}
  }`;
  document.head.appendChild(cb);
  // avisos de descubrimiento, logros y toasts: pequeños y en la esquina, sin tapar los botones de juego (teléfonos y ventanas bajas)
  const cn = document.createElement('style'); cn.id = 'cssAvisosChicos';
  cn.textContent = `@media (pointer:coarse), (max-height:520px){
    #tarjetas{left:50%!important;right:auto!important;transform:translateX(-50%)!important;bottom:auto!important;top:44px!important;width:min(240px,46vw)!important}
    #avisos{right:56px!important;top:44px!important;max-width:min(240px,40vw)!important;gap:3px!important}
    .tarjeta{gap:6px!important;padding:4px 8px 4px 5px!important;outline-offset:-3px!important;box-shadow:0 2px 8px rgba(0,0,0,.4)!important}
    .tarjeta .t-foto{width:30px!important;height:26px!important} .tarjeta .t-foto canvas{width:30px!important;height:25px!important} .tarjeta .t-foto img,.tarjeta .t-foto img.real{height:22px!important;width:auto!important;max-width:30px!important}
    .t-txt small{font-size:8px!important;letter-spacing:.06em!important} .t-txt b{font-size:12px!important;line-height:1.1!important} .t-txt span{display:none!important} .t-txt em{display:none!important}
    .aviso{gap:6px!important;padding:3px 9px 4px 6px!important;box-shadow:0 0 0 2px #ffd23f,0 3px 10px rgba(0,0,0,.45)!important;outline-offset:-4px!important}
    .aviso img{height:20px!important} .aviso small{font-size:8px!important;letter-spacing:.08em!important} .aviso b{font-size:12px!important}
    #toasts{bottom:62px!important;gap:3px!important} .toast{padding:3px 10px!important;font-size:11px!important;outline-offset:-3px!important}
    .descubrimiento-libro{width:46px!important;height:44px!important}
  }`;
  document.head.appendChild(cn);
  // tipografía en el teléfono: los títulos en negrita usaban Alegreya (fuente variable) y en algunos teléfonos salían pálidos o fantasmas;
  // ahí se usa Alegreya Sans, que trae sus pesos propios (el estilo es el mismo familiar, más claro)
  const cf = document.createElement('style'); cf.id = 'cssTipografiaMovil';
  cf.textContent = `@media (pointer:coarse){
    b,strong,h1,h2,h3,.opcion b,.t-txt b,.aviso b,#banner b,#introNivel h2,.skin-sel h3{font-family:'Alegreya Sans',system-ui,sans-serif!important;font-weight:800!important;font-synthesis:none;-webkit-font-smoothing:antialiased}
    .opcion b{font-size:24px} .menu .opcion b{letter-spacing:.01em}
    /* El color fijo sobre los paneles claros evita que el modo oscuro fuerce letras blancas. */
    .opcion b, .t-txt b, .aviso b, .op-txt b, .est b, .logro b, #banner b, #introNivel h2, #where .where-nombre { color:#2e190f!important; background-image:linear-gradient(#2e190f,#2e190f)!important; background-clip:text!important; -webkit-background-clip:text!important; -webkit-text-fill-color:transparent!important; }
  }`;
  document.head.appendChild(cf);
  // ---------- «modo oscuro» forzado del navegador (Samsung Internet, Chrome con «oscurecer páginas»…) ----------
  // Ese modo aclara el texto oscuro (los títulos en negrita sobre el marco crema quedaban casi blancos) aunque la página diga
  // «solo claro». Un texto pintado con un degradado recortado a las letras no lo toca: se hace igual de oscuro, pero a prueba de eso.
  const lum = c => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(c); if (!m) return null; if (m[4] !== undefined && +m[4] < .3) return null; return (.299 * m[1] + .587 * m[2] + .114 * m[3]) / 255; };
  const SEL = 'b, strong, h1, h2, h3, h4, .opcion b';
  function blinda(raiz) {
    try {
      const lista = raiz.matches && raiz.matches(SEL) ? [raiz] : []; lista.push(...(raiz.querySelectorAll ? raiz.querySelectorAll(SEL) : []));
      for (const el of lista) {
        if (el.dataset.oscuro || el.closest('#tactil, #giraTelefono, #hud')) continue;
        const cs = getComputedStyle(el), l = lum(cs.color);
        el.dataset.oscuro = '1';
        if (l === null || l > .4 || (cs.textShadow && cs.textShadow !== 'none') || cs.backgroundImage !== 'none' || cs.webkitTextStrokeWidth !== '0px') continue;
        const col = cs.color;
        el.style.color = 'transparent'; el.style.webkitTextFillColor = 'transparent';
        el.style.backgroundImage = `linear-gradient(${col},${col})`; el.style.webkitBackgroundClip = 'text'; el.style.backgroundClip = 'text';
      }
    } catch (e) {}
  }
  let pendientes = new Set(), programado = false;
  function procesa() { programado = false; const l = [...pendientes]; pendientes.clear(); for (const n of l) if (n.isConnected) blinda(n); }
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) pendientes.add(n); if (!programado && pendientes.size) { programado = true; requestAnimationFrame(procesa); } })
    .observe(document.body, { childList: true, subtree: true });
  blinda(document.body);
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
