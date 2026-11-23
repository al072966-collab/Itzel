'use strict';
// =====================================================================
//  PRIMER PLANO DE UNA SKIN (lo usan disenos.html, personajes.html y el
//  menú de Skins del juego). Dibuja la escena del mundo a alta resolución
//  y la recorta de cerca: Itzel, Fresita o las dos, quietas, corriendo o
//  saltando. Se cierra con ✕, con Esc o haciendo clic fuera.
// =====================================================================
const PRIMER_PLANO = (() => {
  let caja = null, cv = null, view = null, raf = 0, foco = 'ambas', pose = 'todo', antes = 0, zoom = 1, solo = null, skins = null, cambiarMundo = null, listaEstilos = null, alCerrar = null;
  const FOCOS = [['ambas', 'Las dos'], ['itzel', 'Itzel'], ['fresita', 'Fresita']];
  const POSES = [['todo', 'Todo'], ['quieta', 'Quieta'], ['corre', 'Corriendo'], ['salta', 'Saltando']];
  function estilos() {
    if (document.getElementById('pp-css')) return;
    const s = document.createElement('style'); s.id = 'pp-css';
    s.textContent = `#primerPlano { position:fixed; inset:0; z-index:200; display:grid; place-items:center; background:rgba(20,12,8,.82); backdrop-filter:blur(3px); font-family:'Alegreya Sans', sans-serif; }
      #primerPlano .pp { width:min(1000px, 94vw); background:#f3e7cf; border-radius:10px; padding:14px 16px 16px; color:#3a2418; position:relative;
        box-shadow:0 0 0 4px #6a3a22, 0 0 0 7px #3e1e10, 0 24px 60px rgba(0,0,0,.6); }
      #primerPlano .pp::before { content:''; position:absolute; inset:6px; border:2px dashed rgba(120,60,30,.45); border-radius:6px; pointer-events:none; }
      #primerPlano .pp-tit { display:flex; align-items:baseline; gap:12px; margin-bottom:10px; position:relative; }
      #primerPlano .pp-tit b { font:700 25px 'Alegreya', Georgia, serif; color:#3a2418; } #primerPlano .pp-tit span { color:#8a6a4a; font-size:15px; font-style:italic; flex:1; }
      #primerPlano canvas { width:100%; aspect-ratio:16/9; display:block; border-radius:4px; background:#000; box-shadow:0 0 0 3px #fffaf0, 0 3px 10px rgba(60,30,10,.4); position:relative; }
      #primerPlano .pp-bot, #primerPlano .pp-skins { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; align-items:center; position:relative; }
      #primerPlano .pp-skins {max-height:112px;overflow-y:auto;padding:3px} #primerPlano .pp-skins em { font:italic 600 15px 'Alegreya', serif; color:#7a5a44; margin-right:4px; }
      #primerPlano button { font:700 14px 'Alegreya Sans', sans-serif; color:#fff4e0; background:#6a3a22; border:0; border-radius:6px; padding:7px 14px; cursor:pointer; position:relative;
        box-shadow:0 0 0 2px #3e1e10, 0 3px 0 #2a120a; }
      #primerPlano button::after { content:''; position:absolute; inset:3px; border:1.5px dashed rgba(255,230,200,.55); border-radius:4px; pointer-events:none; }
      #primerPlano button:hover { background:#7e4628; transform:translateY(-1px); }
      #primerPlano button.on { background:#b8203a; box-shadow:0 0 0 2px #6a0f1e, 0 3px 0 #4a0a14; }
      #primerPlano .pp-x { width:38px; height:38px; padding:0; font-size:17px; background:#b8203a; box-shadow:0 0 0 2px #6a0f1e, 0 3px 0 #4a0a14; }
      #primerPlano .pp-bot .sep { width:2px; height:24px; background:repeating-linear-gradient(#b8946a 0 4px, transparent 4px 7px); margin:0 3px; }
      #primerPlano .pp-bot small { color:#8a6a4a; margin-left:auto; font-style:italic; }`;
    s.textContent += `#primerPlano .pp-navega{position:relative} #primerPlano .pp-flecha{position:absolute;top:50%;transform:translateY(-50%);z-index:2;font-size:22px;padding:8px 13px} #primerPlano .pp-flecha:hover{transform:translateY(-50%)} #primerPlano .pp-ant{left:12px} #primerPlano .pp-sig{right:12px}`;
    document.head.appendChild(s);
  }
  function teclas(e) { if (caja && e.key === 'Escape') { cerrar(); e.stopImmediatePropagation(); e.preventDefault(); } }
  function cerrar() { cancelAnimationFrame(raf); if (caja) caja.remove(); caja = null; view = null; removeEventListener('keydown', teclas, true); if (skins && skins.alCerrar) { const s0 = skins; skins = null; s0.alCerrar(s0.actual); } if (alCerrar) { const fn = alCerrar; alCerrar = null; fn(); } }
  function botones() {
    const fila = (lista, actual, k) => lista.map(([v, t]) => `<button data-${k}="${v}" class="${v === actual ? 'on' : ''}">${t}</button>`).join('');
    // con «solo» (la enciclopedia) se ve a una nada más: sin botones de a quién ver; Fresita flota, así que tampoco lleva poses
    caja.querySelector('.pp-bot').innerHTML = `${solo ? '' : fila(FOCOS, foco, 'foco') + '<span class="sep"></span>'}${solo === 'fresita' ? '' : fila(POSES, pose, 'pose')}<small>Esc: cerrar</small>`;
    caja.querySelectorAll('[data-foco]').forEach(b => b.onclick = () => { foco = b.dataset.foco; botones(); });
    caja.querySelectorAll('[data-pose]').forEach(b => b.onclick = () => { pose = b.dataset.pose; botones(); });
    // las skins de ese mundo: se cambia de diseño sin salir del primer plano
    const fs = caja.querySelector('.pp-skins');
    if (listaEstilos) {
      fs.style.display = ''; fs.innerHTML = '<em>Estilos:</em>' + listaEstilos.lista.map(q => `<button data-estilo="${q.id}" class="${q.id === listaEstilos.actual ? 'on' : ''}">${q.nombre}</button>`).join('');
      fs.querySelectorAll('[data-estilo]').forEach(b => b.onclick = () => { if (b.dataset.estilo === listaEstilos.actual) return; aplicarMundo(listaEstilos.poner(b.dataset.estilo)); });
      return;
    }
    if (!skins || skins.lista.length < 2) { fs.style.display = 'none'; return; }
    fs.style.display = ''; fs.innerHTML = '<em>Skins:</em>' + skins.lista.map((n, k) => `<button data-skin="${k}" class="${k === skins.actual ? 'on' : ''}">${n}</button>`).join('');
    fs.querySelectorAll('[data-skin]').forEach(b => b.onclick = () => { const k = +b.dataset.skin; if (k === skins.actual) return; skins.actual = k; const st = skins.poner(k); if (st) ponerVista(st); caja.querySelector('.pp-tit b').textContent = skins.titulo ? skins.titulo(k) : skins.lista[k]; botones(); });
  }
  function aplicarMundo(r) {
    if (!r) return;
    if (listaEstilos) listaEstilos.actual = r.st.id;
    skins = r.skins || null;
    caja.querySelector('.pp-tit b').textContent = r.titulo;
    caja.querySelector('.pp-tit span').textContent = r.sub;
    ponerVista(r.st); botones();
  }
  // arma la escena (a otra resolución la de pixel) para un estilo/diseño
  function ponerVista(st) {
    const off = document.createElement('canvas'); view = new View(off, st, false);
    const S = st.fixedS || (st.base ? 6 : 3.5); view.resize(VW * S / (devicePixelRatio || 1), S);
  }
  function abrir(st, titulo = '', sub = '', opt = {}) {
    cerrar(); estilos(); zoom = 1; solo = opt.solo || null; skins = opt.skins || null; cambiarMundo = opt.cambiarMundo || null; listaEstilos = opt.estilos || null; alCerrar = opt.alCerrar || null;
    if (solo) foco = solo; else if (foco !== 'itzel' && foco !== 'fresita') foco = 'ambas'; if (solo === 'fresita') pose = 'quieta';
    caja = document.createElement('div'); caja.id = 'primerPlano';
    caja.innerHTML = `<div class="pp"><div class="pp-tit"><b></b><span></span><button class="pp-x" title="Cerrar">✕</button></div><div class="pp-navega"><canvas></canvas>${cambiarMundo ? '<button class="pp-flecha pp-ant" aria-label="Estilo anterior">‹</button><button class="pp-flecha pp-sig" aria-label="Estilo siguiente">›</button>' : ''}</div><div class="pp-skins"></div><div class="pp-bot"></div></div>`;
    caja.querySelector('.pp-tit b').textContent = titulo; caja.querySelector('.pp-tit span').textContent = sub;
    document.body.appendChild(caja);
    caja.onclick = e => { if (e.target === caja) cerrar(); };
    caja.querySelector('.pp-x').onclick = cerrar;
    cv = caja.querySelector('canvas');
    if (cambiarMundo) for (const [sel, dir] of [['.pp-ant', -1], ['.pp-sig', 1]]) caja.querySelector(sel).onclick = () => { aplicarMundo(cambiarMundo(dir)); };
    addEventListener('keydown', teclas, true);
    botones();
    // la escena se dibuja a alta resolución en un lienzo aparte (los estilos de pixel, a su tamaño)
    // el fondo no necesita tanta resolución: Itzel y Fresita se dibujan aparte, nítidas (ver cuadro)
    ponerVista(st);
    const W = Math.round(cv.clientWidth * (devicePixelRatio || 1)); cv.width = W; cv.height = Math.round(W * 9 / 16);
    antes = performance.now(); raf = requestAnimationFrame(cuadro);
  }
  // un cuadro que truena (por ejemplo, un estilo que lee píxeles en una página abierta como archivo) no debe detener la animación:
  // se vuelve a intentar en el siguiente y, al cambiar de estilo, se recupera sola
  function cuadro(ahora) {
    try { cuadroReal(ahora); } catch (e) { if (view) raf = requestAnimationFrame(cuadro); }
  }
  function cuadroReal(ahora) {
    if (!view) return;
    const dt = Math.min(.05, (ahora - antes) / 1000); antes = ahora;
    const g = view.g, p = g.p; g.t += dt;
    let suelo = L.surfaceY(PAD + 4) * T; if (!isFinite(suelo) || suelo > VH) suelo = 176;
    const baseX = (PAD + 4.5) * T;
    p.x = baseX; p.face = 1; p.vis = true; p.inv = 0;
    const ph = pose === 'quieta' ? 0 : pose === 'corre' ? 2.5 : pose === 'salta' ? (view.st.id === 'pixel' ? 4.4 : 4.4 + ((g.t * .5) % 2)) : g.t % 6.4;
    if (ph < 2) { p.vx = 0; p.on = true; p.y = suelo; p.vy = 0; }
    else if (ph < 4.4) { p.vx = 125; p.on = true; p.y = suelo; p.run = (p.run || 0) + 125 * dt * .16; p.vy = 0; }
    else if (view.st.id === 'pixel') {
      // Misma gravedad y velocidad inicial que la partida; una pausa corta
      // en el suelo permite distinguir el aterrizaje antes del próximo salto.
      const vuelo = 2 * JUMP / G, ciclo = vuelo + .28;
      const tiempo = (pose === 'salta' ? g.t : ph - 4.4) % ciclo;
      if (tiempo < vuelo) { p.on = false; p.y = suelo - (JUMP * tiempo - .5 * G * tiempo * tiempo); p.vy = -JUMP + G * tiempo; p.vx = 60; }
      else { p.on = true; p.y = suelo; p.vy = 0; p.vx = 0; }
    } else { const k = (ph - 4.4) / 2; p.on = false; p.y = suelo - Math.sin(k * Math.PI) * 34; p.vy = -Math.cos(k * Math.PI) * 330; p.vx = 60; }
    p.sq = (p.sq || 0) * .9;
    g.cam = clamp(p.x - VW * .45, L.camMin, L.camMax); g.parts = [];
    // Fresita acompaña a Itzel (igual que en la galería)
    const tx = p.x - p.face * 16, ty = p.y - 27 + Math.sin(g.t * 2.2) * 2.5;
    if (g.cx === undefined || Math.abs(g.cx - tx) > 80) { g.cx = tx; g.cy = ty; }
    g.cx += (tx - g.cx) * .08; g.cy += (ty - g.cy) * .08;
    // en los estilos dibujados (no de pixel ni repintados) las dos se dibujan aparte, a la resolución del primer plano:
    // así no pierden calidad aunque se acerque mucho. El fondo queda detrás, un poco suave como en una foto.
    const st = view.st, nitidas = !(st.pixel || st.fixedS || st.base);
    // La Itzel de 16 bits tiene un sprite propio con más detalle que el
    // lienzo del escenario. Dibujarla después del recorte conserva sus
    // píxeles en primer plano sin cambiar la resolución del mundo.
    const esBits = ['pixel', 'bits8', 'bits32', 'bits64'].includes(st.id);
    const itzelNitida = nitidas || esBits;
    const fresitaNitida = nitidas || esBits;
    // en la escena no se pinta a quien se dibuja aparte (nítida) ni a quien no se quiere ver
    const sinItzel = itzelNitida || solo === 'fresita', sinFresita = fresitaNitida || solo === 'itzel';
    if (sinItzel) p.vis = false; if (sinFresita) g.fre = true;
    view.render();
    p.vis = true; g.fre = null;
    // el recorte: más cerrado en Itzel o en Fresita, más abierto con las dos
    // el encuadre es FIJO: se calcula con el suelo y no con la pose, para que la cámara no "respire"
    // con el vaivén de Fresita ni con los saltos (si la pose salta, el cuadro ya deja lugar arriba)
    // la altura sigue a Itzel suave (solo se mueve cuando salta: quieta o corriendo su y no cambia)
    const S = view.S, ix = baseX - g.cam, fx = ix - 16;
    // El libro puede cambiar de escenario mientras está abierto el primer plano.
    // Si cambia la altura del suelo, actualizar el encuadre de inmediato evita
    // que la cámara se quede mirando el cielo durante varias imágenes.
    if (g.camY === undefined || Math.abs(g.camY - suelo) > 40) g.camY = suelo;
    g.camY += (p.y - g.camY) * Math.min(1, dt * 6);
    // Una cámara fija evita que el fondo tiemble mientras Itzel salta.
    const encuadrePixel = view.st.id === 'pixel';
    const dy = encuadrePixel ? 0 : g.camY - suelo, fy = suelo - 27 + dy;
    const cajaI = [ix - 10, suelo - 31 + dy, ix + 10, suelo + 3 + dy], cajaF = [fx - 16, fy - 13, fx + 13, fy + 11];
    const b = foco === 'itzel' ? cajaI : foco === 'fresita' ? cajaF : [Math.min(cajaI[0], cajaF[0]), Math.min(cajaI[1], cajaF[1]), Math.max(cajaI[2], cajaF[2]), Math.max(cajaI[3], cajaF[3])];
    const ch = (view.st.id === 'pixel' ? 34 : Math.max((b[3] - b[1]) * 1.18, (b[2] - b[0]) * 1.18 * 9 / 16)) / zoom, cw = ch * 16 / 9, x = cv.getContext('2d');
    // el recorte no se sale de la escena (si no, queda una franja negra)
    const centroY = view.st.id === 'pixel' && foco === 'itzel' ? p.y - 8 : (b[1] + b[3]) / 2;
    const cx = clamp((b[0] + b[2]) / 2, cw / 2, VW - cw / 2), cy = clamp(centroY, ch / 2, VH - ch / 2);
    x.imageSmoothingEnabled = !(view.st.pixel || view.st.fixedS);
    x.clearRect(0, 0, cv.width, cv.height);
    x.drawImage(view.c, (cx - cw / 2) * S, (cy - ch / 2) * S, cw * S, ch * S, 0, 0, cv.width, cv.height);
    if (itzelNitida || fresitaNitida) {
      const k = cv.width / cw, x0 = cx - cw / 2 + g.cam, y0 = cy - ch / 2, f = { t: g.t, cam: g.cam, S: k, g, st, key: st.id + '@cerca' };
      x.save(); x.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); x.imageSmoothingEnabled = true;
      if (itzelNitida && solo !== 'fresita') {
        // Conservar el objeto del jugador mantiene el temporizador de reposo.
        const y = p.y;
        try { if (st.id === 'pixel') p.y += 2; st.player(x, p, f); }
        finally { p.y = y; }
      }   // en 16 bits los pies quedaban 2 unidades sobre el suelo if (fresitaNitida && solo !== 'itzel') { const dibuja = st.fresita || (st.base && STYLE_MAP[st.base] && STYLE_MAP[st.base].fresita); if (dibuja) { const anterior = window.estiloArteDerivado; try { window.estiloArteDerivado = st.id; dibuja(x, { x: g.cx, y: g.cy, face: p.face }, f); } finally { window.estiloArteDerivado = anterior; } } }
      x.restore();
    }
    raf = requestAnimationFrame(cuadro);
  }
  return { abrir, cerrar };
})();
