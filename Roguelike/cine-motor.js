'use strict';
// =====================================================================
//  CINEMÁTICAS · motor común (se carga después de menu.js)
//  Un lienzo propio, a la resolución de la ventana, encima del juego.
//  Cada cinemática se registra con CINE.registrar(id, def):
//    def    = { nombre, desc, orden, crear(opc) → escena }
//    escena = { dur, preparar(), cuadro(ctx, t, dt, vista), barras(t) → 0..1,
//               cues: [[t, tipo, nombre]], subs: [[t0, t1, quien, texto, opc]] }
//  Las escenas dibujan en un cuadro seguro de 640×360 con el origen al
//  centro. Lo que sobra de la ventana (hasta MX/MY unidades por lado)
//  también se ve, así que cada escena pinta con margen.
//  Sonido: el juego no tiene audio todavía. Las marcas (cues) se emiten
//  como evento 'cine-cue' en window; con ?cues en la dirección se ven.
// =====================================================================
const EASE = {
  lin: t => t,
  in2: t => t * t, out2: t => 1 - (1 - t) * (1 - t), io2: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  in3: t => t * t * t, out3: t => 1 - Math.pow(1 - t, 3), io3: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  io5: t => t < .5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  outBack: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  inBack: t => { const c = 1.70158; return (c + 1) * t * t * t - c * t * t; },
  outElastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
};
// avance suavizado de un tramo: 0 antes de a, 1 después de b
function tramo(t, a, b, e = 'io3') { return EASE[e](clamp((t - a) / (b - a), 0, 1)); }
// claves por tramos: ks = [[t, valor, curva], ...]; el valor puede ser número o arreglo
function claves(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1, e] = ks[i]; if (t > t1) continue;
    const [t0, v0] = ks[i - 1], u = EASE[e || 'io3']((t - t0) / (t1 - t0 || 1));
    return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * u) : v0 + (v1 - v0) * u;
  }
  return ks[ks.length - 1][1];
}
// parábola de un salto entre dos puntos con altura h sobre el más alto
function arco(u, x0, y0, x1, y1, h) {
  // una sola parábola (x avanza parejo): la cima cae donde las dos ramas tienen la misma curvatura
  const top = Math.min(y0, y1) - h, a = y0 - top, b = y1 - top, sa = Math.sqrt(a), sb = Math.sqrt(b), uc = sa / (sa + sb);
  const y = u < uc ? top + a * Math.pow(1 - u / uc, 2) : top + b * Math.pow((u - uc) / (1 - uc), 2);
  return [x0 + (x1 - x0) * u, y];
}

const CINE = (() => {
  const FW = 640, FH = 360, MX = 210, MY = 64, BAR = 38;
  const REG = {}, ORDEN = [];
  const VER_CUES = /[?&]cues\b/.test(location.search);
  let ultima = null, cv = null, cx = null, act = null, raf = 0, antes = 0, k = 1, M = null, bandaC = null, bandaK = 0, tejido = null;

  function registrar(id, def) {
    REG[id] = def; if (!ORDEN.includes(id)) ORDEN.push(id);
    // el menú principal se dibuja antes de que carguen las cinemáticas: si ya está en pantalla, se vuelve a dibujar con su opción
    if ($('mEnci') && !$('mCine')) menuPrincipal();
  }
  const prog = () => (PROG.d.cine = PROG.d.cine || { vistas: {} });
  const vista = id => !!prog().vistas[id];
  // MIENTRAS SE PRUEBA EL JUEGO: el menú enseña todas las cinemáticas aunque no hayan salido.
  // (Solo cambia el menú; la entrada sigue saliendo solo la primera vez y los jefes en versión corta si ya se vieron.)
  // Para el juego final, poner en false y vuelven a desbloquearse al ir saliendo.
  const MENU_TODAS = true;
  const enMenu = id => MENU_TODAS || (!(REG[id] && REG[id].bloqueada && REG[id].bloqueada()) && vista(id));
  function marcar(id) { if (!vista(id)) { prog().vistas[id] = Date.now(); PROG.save(); } }

  function lienzo() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.id = 'cine';
    Object.assign(cv.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', zIndex: 45, display: 'none', cursor: 'default', background: '#0d0806' });
    document.body.appendChild(cv); cx = cv.getContext('2d');
    cv.addEventListener('mousedown', e => { e.preventDefault(); intentaSaltar(); });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('resize', () => { if (act) medir(); });
  }
  // tamaño del lienzo y del cuadro seguro; se limita a ~2.4 Mpx para ir a 60 fps
  function medir() {
    const W = innerWidth || 640, H = innerHeight || 360, q =Math.min(devicePixelRatio || 1, Math.sqrt(2.4e6 / (W * H)));
    const w = Math.round(W * q), h = Math.round(H * q);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    k = Math.min(w / FW, h / FH);
    const vw = Math.min(w / k, FW + 2 * MX), vh = Math.min(h / k, FH + 2 * MY);
    M = { k, w, h, x0: -vw / 2, x1: vw / 2, y0: -vh / 2, y1: vh / 2, pilar: (w - vw * k) / 2, extra: (h - vh * k) / 2, FW, FH, BAR };
    if (bandaK !== k) { bandaC = banda(k); tejido = tela(k); bandaK = k; }
  }

  // ---------- franjas de cine: tela oscura con una cenefa bordada ----------
  function puntada(x, cx0, cy0, s, col) {
    const a = s * .14, b = s * .86; x.lineCap = 'round';
    x.strokeStyle = shade(col, -.35); x.lineWidth = s * .36; x.beginPath(); x.moveTo(cx0 + a, cy0 + a + s * .05); x.lineTo(cx0 + b, cy0 + b + s * .05); x.stroke();
    x.strokeStyle = col; x.lineWidth = s * .32; x.beginPath(); x.moveTo(cx0 + a, cy0 + a); x.lineTo(cx0 + b, cy0 + b); x.stroke();
    x.strokeStyle = shade(col, -.2); x.lineWidth = s * .34; x.beginPath(); x.moveTo(cx0 + b, cy0 + a); x.lineTo(cx0 + a, cy0 + b); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = s * .09; x.beginPath(); x.moveTo(cx0 + b - s * .08, cy0 + a + s * .08); x.lineTo(cx0 + a + s * .2, cy0 + b - s * .2); x.stroke();
  }
  const CENEFA = ['.a........b.......', 'aya.r...rbyb.g...g', '.a...r.r..b...g.g.', '......r........g..'];
  const CCOL = { a: '#c8203a', y: '#f2b233', b: '#2f7fc8', r: '#3f9a5c', g: '#e85a8a' };
  function banda(k) {
    const s = Math.max(2, Math.round(1.9 * k)), w = CENEFA[0].length, c = mkCanvas(w * s, CENEFA.length * s), x = c.getContext('2d');
    CENEFA.forEach((r, j) => { for (let i = 0; i < w; i++) if (CCOL[r[i]]) puntada(x, i * s, j * s, s, CCOL[r[i]]); });
    return c;
  }
  function tela(k) { // trama de tela oscura (un mosaico chico)
    const s = Math.max(4, Math.round(3 * k)), c = mkCanvas(s * 8, s * 8), x = c.getContext('2d');
    x.fillStyle = '#140c09'; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? 'rgba(255,220,180,.025)' : 'rgba(0,0,0,.25)'; x.fillRect(0, i * s, c.width, Math.max(1, s * .4)); x.fillRect(i * s, 0, Math.max(1, s * .4), c.height); }
    return c;
  }
  function franjas(p) {
    const { w, h, extra, pilar } = M, alto = BAR * k * p;
    const top = extra + alto, bot = h - extra - alto;
    cx.setTransform(1, 0, 0, 1, 0, 0);
    const pat = cx.createPattern(tejido, 'repeat'); cx.fillStyle = pat;
    if (top > 0) cx.fillRect(0, 0, w, Math.ceil(top));
    if (bot < h) cx.fillRect(0, Math.floor(bot), w, h - Math.floor(bot));
    if (pilar > 0) { cx.fillRect(0, 0, Math.ceil(pilar), h); cx.fillRect(Math.floor(w - pilar), 0, Math.ceil(pilar), h); }
    if (p > .02) { // cenefa bordada en la orilla de adentro
      const bh = bandaC.height, a = clamp(p * 1.6 - .3, 0, 1);
      cx.globalAlpha = a;
      for (const [y, flip] of [[top - bh - k * 2, false], [bot + k * 2, true]]) {
        cx.save(); cx.translate(0, y); if (flip) { cx.translate(0, bh); cx.scale(1, -1); }
        for (let x = (w / 2) % bandaC.width - bandaC.width; x < w; x += bandaC.width) cx.drawImage(bandaC, Math.round(x), 0);
        cx.restore();
      }
      cx.globalAlpha = 1;
    }
    return { top, bot };
  }

  // ---------- subtítulos en la franja de abajo ----------
  const VOZ = { Itzel: '#c8203a', Fresita: '#d8407a', Naranja: '#d8601e', Violeta: '#7a3fc6', Azul: '#2a6fb8' };
  function subtitulos(t, fr) {
    if (!act.esc.subs) return;
    for (const s of act.esc.subs) {
      const [t0, t1, quien, texto, o = {}] = s; if (t < t0 - .05 || t > t1 + .35) continue;
      const a = Math.min(tramo(t, t0, t0 + .22, 'out2'), 1 - tramo(t, t1, t1 + .3, 'in2'));
      const n = Math.floor((t - t0) * 46), vis = texto.slice(0, Math.max(0, n));
      const cy = fr.bot + (M.h - M.extra - fr.bot) / 2 + k * 1.5, sub = (1 - a) * 4 * k;
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = a; cx.textBaseline = 'middle';
      const fT = `${o.susurro ? 'italic 500' : 'italic 500'} ${(o.susurro ? 12.2 : 13.4) * k}px Alegreya, Georgia, serif`;
      const fN = `800 ${7.4 * k}px "Alegreya Sans", sans-serif`;
      cx.font = fT; const wT = cx.measureText(texto).width;
      cx.font = fN; if ('letterSpacing' in cx) cx.letterSpacing = `${.9 * k}px`; const nom = quien.toUpperCase(), wN = cx.measureText(nom).width;
      const padX = 6 * k, tagW = wN + padX * 2, tagH = 13 * k, gap = 8 * k, tot = tagW + gap + wT, x0 = M.w / 2 - tot / 2;
      // parche de manta con el nombre
      cx.save(); cx.translate(x0, cy - tagH / 2 + sub); cx.rotate(-.02);
      cx.fillStyle = '#efe4cc'; cx.beginPath(); roundRect(cx, 0, 0, tagW, tagH, 2.5 * k); cx.fill();
      cx.strokeStyle = 'rgba(120,60,30,.55)'; cx.lineWidth = Math.max(1, .7 * k); cx.setLineDash([2.2 * k, 1.6 * k]); cx.beginPath(); roundRect(cx, 2 * k, 2 * k, tagW - 4 * k, tagH - 4 * k, 1.5 * k); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = VOZ[quien] || '#c8203a'; cx.textAlign = 'left'; cx.fillText(nom, padX, tagH / 2 + .5 * k);
      cx.restore(); if ('letterSpacing' in cx) cx.letterSpacing = '0px';
      cx.font = fT; cx.textAlign = 'left'; cx.fillStyle = o.susurro ? '#d9c9b4' : '#f8ead0';
      cx.shadowColor = 'rgba(0,0,0,.6)'; cx.shadowBlur = 3 * k; cx.fillText(vis, x0 + tagW + gap, cy + sub); cx.shadowBlur = 0;
      cx.globalAlpha = 1;
    }
  }
  // quién habla ahora y qué tan abierta va su boca (sílabas fingidas mientras corre el texto)
  function boca(quien, t) {
    if (!act || !act.esc.subs) return 0;
    for (const [t0, t1, q, texto] of act.esc.subs) if (q === quien && t >= t0 && t <= t1) {
      const fin = t0 + texto.length / 46 + .15; if (t > fin) return 0;
      const n = Math.floor((t - t0) * 46), ch = texto[Math.min(n, texto.length - 1)] || ' ';
      if (/[,.…!?]/.test(ch)) return 0;
      const s = Math.sin((t - t0) * Math.PI * 2 * 3.1); // unas tres sílabas por segundo
      return s > .05 ? .3 + .55 * s * (.75 + .25 * Math.sin(n * .9)) : 0;
    }
    return 0;
  }

  // ---------- saltar ----------
  let pide = 0;
  function intentaSaltar() {
    if (!act || act.saliendo) return;
    if (!act.listo) { act.saltada = true; parar(); return; } // todavía se estaba preparando: se sale de una vez
    if (act.esc.saltar) { act.pideSalto = true; return; } // la escena decide a dónde brinca (p. ej. el viaje espera a que el nivel esté armado)
    const ahora = performance.now();
    if (act.esc.saltoDirecto || ahora - pide < 2600) { act.saliendo = act.t; act.saltada = true; return; }
    pide = ahora;
  }
  function teclas(e) {
    if (!act) return;
    if (['Space', 'Escape', 'Enter', 'NumpadEnter'].includes(e.code)) { if (!e.repeat) intentaSaltar(); }
    if (e.code !== 'F5' && e.code !== 'F12') { e.preventDefault(); e.stopImmediatePropagation(); }
  }
  addEventListener('keydown', teclas, true);

  // ---------- reproducción ----------
  function play(id, opc = {}) {
    lienzo(); parar(true);
    const def = REG[id]; if (!def) { if (opc.alTerminar) opc.alTerminar(); return; }
    const antesEstado = typeof STATE !== 'undefined' ? STATE : null;
    STATE = 'cine'; showScreen(''); $('hud').classList.remove('on');
    cv.style.display = 'block'; medir();
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = '#0d0806'; cx.fillRect(0, 0, cv.width, cv.height);
    const esc = def.crear(Object.assign({}, opc));
    act = { id, esc, t: 0, opc, cue: 0, ultCue: null, saliendo: 0, saltada: false, antesEstado, listo: false };
    marcar(id); pide = 0;
    // escenas que arrancan en el acto, sin pantalla de espera (el viaje entre mundos: parte del cuadro que ya se ve)
    if (esc.inmediata) { if (esc.preparar) esc.preparar(); act.listo = true; antes = performance.now(); pinta(0, 0); raf = requestAnimationFrame(cuadro); return; }
    const fuentes = ['italic 500 20px Alegreya', '700 20px Alegreya', '500 20px Alegreya', '800 20px "Alegreya Sans"', '600 20px "Alegreya Sans"'];
    // mientras se pintan las capas: una hilera de puntadas que se borda sola (la pantalla nunca se queda congelada)
    const t0 = performance.now(), espera = ahora => { if (!act || act.esc !== esc || act.listo) return; pintaEspera((ahora - t0) / 1000); raf = requestAnimationFrame(espera); };
    raf = requestAnimationFrame(espera);
    Promise.all(fuentes.map(f => document.fonts && document.fonts.load(f).catch(() => 0))).then(async () => {
      if (!act || act.esc !== esc) return;
      if (esc.preparar) await esc.preparar();
      if (!act || act.esc !== esc) return;
      cancelAnimationFrame(raf); act.listo = true; antes = performance.now(); raf = requestAnimationFrame(cuadro);
    });
  }
  function parar(sinAviso) {
    cancelAnimationFrame(raf); raf = 0;
    if (!act) return;
    const a = act; act = null;
    dispatchEvent(new CustomEvent('cine-fin', { detail: { cine: a.id } }));
    // se guarda la última imagen: la siguiente escena puede partir de ella (la entrada termina en la manta del logo)
    try { if (!ultima || ultima.width !== cv.width || ultima.height !== cv.height) ultima = mkCanvas(cv.width, cv.height); const u = ultima.getContext('2d'); u.clearRect(0, 0, cv.width, cv.height); u.drawImage(cv, 0, 0); } catch (e) {}
    if (a.esc.fin) a.esc.fin(a.saltada);
    cv.style.display = 'none';
    if (!sinAviso && a.opc.alTerminar) a.opc.alTerminar(a.saltada);
  }
  function pintaEspera(s) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.fillStyle = '#0d0806'; cx.fillRect(0, 0, M.w, M.h);
    const n = 7, ciclo = (s * 2) % (n + 3), lado = Math.round(6 * k), x0 = M.w - M.pilar - 24 * k - n * lado, y0 = M.h - M.extra - 22 * k;
    const cols = ['#c8203a', '#f2b233', '#3f9a5c', '#2f7fc8', '#e85a8a'];
    for (let i = 0; i < n; i++) { const a = clamp(ciclo - i, 0, 1) * (ciclo > n + 1 ? clamp(n + 3 - ciclo, 0, 1) : 1); if (a <= 0) continue; cx.globalAlpha = a; puntada(cx, x0 + i * lado, y0, lado, cols[i % cols.length]); }
    cx.globalAlpha = 1;
  }
  function emiteCues(t0, t1) {
    const cues = act.esc.cues || [];
    for (const c of cues) if (c[0] >= t0 && c[0] < t1) {
      act.ultCue = { c, t: t1 };
      try { dispatchEvent(new CustomEvent('cine-cue', { detail: { cine: act.id, t: c[0], tipo: c[1], nombre: c[2] } })); } catch (e) {}
    }
  }
  function pinta(t, dt) {
    const esc = act.esc;
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.filter = 'none';
    cx.fillStyle = '#0d0806'; cx.fillRect(0, 0, M.w, M.h);
    cx.save(); cx.setTransform(k, 0, 0, k, M.w / 2, M.h / 2);
    esc.cuadro(cx, t, dt, M);
    cx.restore();
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.filter = 'none'; cx.shadowBlur = 0;
    const fr = franjas(esc.barras ? esc.barras(t) : 1);
    subtitulos(t, fr);
    // aviso para saltar
    const ap = performance.now() - pide;
    if (pide && ap < 2600) {
      const a = Math.min(1, ap / 200, (2600 - ap) / 400);
      cx.globalAlpha = a; cx.font = `600 ${7.6 * k}px "Alegreya Sans", sans-serif`; cx.textAlign = 'right'; cx.textBaseline = 'middle'; cx.fillStyle = '#e8d4b4';
      cx.fillText('Presiona otra vez para saltar', M.w - M.pilar - 14 * k, Math.max(fr.top, 14 * k) - BAR * k / 2 + 0 * k); cx.globalAlpha = 1;
    }
    if (VER_CUES && act.ultCue) {
      const { c, t: tc } = act.ultCue, a = clamp(1 - (t - tc) / 1.2, 0, 1);
      if (a > 0) { cx.globalAlpha = a; cx.font = `700 ${9 * k}px "Alegreya Sans", sans-serif`; cx.textAlign = 'left'; cx.fillStyle = c[1] === 'golpe' ? '#ff6a5a' : c[1] === 'silencio' ? '#9ad0ff' : '#ffd36a'; cx.fillText(`♪ ${c[0].toFixed(1)} s ${c[1]}: ${c[2]}`, M.pilar + 12 * k, Math.max(fr.top, 16 * k) - BAR * k / 2); cx.globalAlpha = 1; }
    }
    // salida: fundido a negro
    if (act.saliendo) { const a = clamp((t - act.saliendo) / .35, 0, 1); cx.fillStyle = `rgba(13,8,6,${a})`; cx.fillRect(0, 0, M.w, M.h); }
  }
  function cuadro(ahora) {
    if (!act) return;
    const dt = Math.min(.05, (ahora - antes) / 1000); antes = ahora;
    if (act.pideSalto) { const nt = act.esc.saltar(act.t); if (nt != null) { act.t = Math.max(act.t, nt); act.pideSalto = false; } }
    const t0 = act.t; act.t += dt;
    emiteCues(t0, act.t);
    pinta(act.t, dt);
    if (act.t >= act.esc.dur || (act.saliendo && act.t - act.saliendo > .38)) { parar(); return; }
    raf = requestAnimationFrame(cuadro);
  }
  // ---------- para revisar cuadro por cuadro (consola / pruebas) ----------
  function ir(t, asentar = true) {
    if (!act || !act.listo) return false; const dtSim = 1 / 60;
    if (act.pideSalto) { const nt = act.esc.saltar(act.t); if (nt != null) { t = Math.max(t, nt); act.pideSalto = false; } }
    if (asentar && act.esc.asentar) act.esc.asentar(t); act.t = t; pinta(t, dtSim);
    if (t >= act.esc.dur) parar();
    return true;
  }
  function pausa(on) { if (!act) return; if (on) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { antes = performance.now(); raf = requestAnimationFrame(cuadro); } dispatchEvent(new CustomEvent('cine-pausa', { detail: { cine: act.id, pausada: !!on } })); }
  function listaCues(id) { const e = REG[id] && REG[id].crear({ soloDatos: true }); return e ? e.cues.map(c => `${c[0].toFixed(2)} s  ${c[1]}  ${c[2]}`).join('\n') : ''; }

  // ---------- componer un actor en un lienzo aparte (contraluz, borde de luz, desenfoque) ----------
  const POOL = [mkCanvas(8, 8), mkCanvas(8, 8)];
  function capa(ctx, caja, dibuja, o = {}) {
    const m = ctx.getTransform(), W = ctx.canvas.width, H = ctx.canvas.height;
    const xs = [], ys = [];
    for (const [x, y] of [[caja[0], caja[1]], [caja[2], caja[1]], [caja[0], caja[3]], [caja[2], caja[3]]]) { xs.push(m.a * x + m.c * y + m.e); ys.push(m.b * x + m.d * y + m.f); }
    const pad = Math.ceil((o.blur || 0) * 2.5 + 4);
    const X0 = Math.max(0, Math.floor(Math.min(...xs)) - pad), Y0 = Math.max(0, Math.floor(Math.min(...ys)) - pad);
    const X1 = Math.min(W, Math.ceil(Math.max(...xs)) + pad), Y1 = Math.min(H, Math.ceil(Math.max(...ys)) + pad);
    const w = X1 - X0, h = Y1 - Y0; if (w <= 0 || h <= 0) return;
    const c = POOL[0]; if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); }
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, w + 2, h + 2);
    x.setTransform(m.a, m.b, m.c, m.d, m.e - X0, m.f - Y0);
    dibuja(x);
    x.setTransform(1, 0, 0, 1, 0, 0);
    if (o.tinte) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = rgba(o.tinte[0], o.tinte[1]); x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; }
    for (const b of o.bordes || []) { // luz de borde: la silueta menos la silueta corrida lejos de la luz
      const r = POOL[1]; if (r.width < w || r.height < h) { r.width = Math.max(r.width, w); r.height = Math.max(r.height, h); }
      const y = r.getContext('2d'); y.setTransform(1, 0, 0, 1, 0, 0); y.globalCompositeOperation = 'source-over'; y.globalAlpha = 1; y.clearRect(0, 0, w + 2, h + 2);
      y.drawImage(c, 0, 0, w, h, 0, 0, w, h);
      y.globalCompositeOperation = 'source-in'; y.fillStyle = b.c; y.fillRect(0, 0, w, h);
      const sc = Math.hypot(m.a, m.b), d = (b.d || 1.5) * sc;
      y.globalCompositeOperation = 'destination-out'; y.drawImage(c, 0, 0, w, h, -b.dx * d, -b.dy * d, w, h);
      x.globalCompositeOperation = b.modo || 'source-over'; x.globalAlpha = b.a ?? 1; x.drawImage(r, 0, 0, w, h, 0, 0, w, h); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.blur > .3) ctx.filter = `blur(${o.blur.toFixed(1)}px)`;
    ctx.globalAlpha = o.alpha ?? 1; if (o.modo) ctx.globalCompositeOperation = o.modo;
    ctx.drawImage(c, 0, 0, w, h, X0, Y0, w, h);
    ctx.restore();
  }

  // ---------- menú: sección «Cinemáticas» ----------
  function lista() { return ORDEN.slice().sort((a, b) => (REG[a].orden ?? 99) - (REG[b].orden ?? 99) || String(REG[a].nombre || a).localeCompare(String(REG[b].nombre || b), 'es')); } // en el orden de la historia
  function pantalla() {
    if (typeof paraVistas === 'function') paraVistas();
    const ids = lista();
    showScreen(`<div class="title cines"><img class="hstitch" alt="Cinemáticas" src="${stitched('Cinemáticas', 8)}">
      <p class="sub">${MENU_TODAS ? 'Todas disponibles mientras se prueba el juego' : 'Las que ya les salieron se pueden volver a ver'}</p>
      <div class="logro-lista">${ids.map(id => { const d = REG[id], ok = enMenu(id); return `<div class="logro panel ${ok ? 'ok' : ''}"><img src="${ico(ok ? (window.ICONO_CINE && ICONO_CINE(id)) || 'feather' : 'moon', 5)}"><div><b>${ok ? d.nombre : 'Sin descubrir'}</b><span>${ok ? d.desc : 'Sigan jugando para encontrarla.'}</span>${ok ? `<button class="patch verde cine-ver" data-id="${id}" style="padding:6px 16px;font-size:14px;margin:8px 0 0">Ver</button>` : ''}</div></div>`; }).join('')}</div>
      <button class="patch volver-esquina" id="cvVolver">Volver</button></div>`);
    document.querySelectorAll('.cine-ver').forEach(b => b.onclick = () => play(b.dataset.id, { repeticion: true, alTerminar: () => { title(); pantalla(); } }));
    $('cvVolver').onclick = menuPrincipal;
  }
  GANCHOS.en('menuPrincipal', _menu => function () {
    _menu();
    const enci = $('mEnci'); if (!enci || !ORDEN.length) return;
    const n = lista().filter(vista).length;
    const b = document.createElement('button'); b.className = 'opcion'; b.id = 'mCine';
    b.innerHTML = `<img src="${ico('claqueta', 5)}"><b>Cinemáticas</b><span>${MENU_TODAS ? `Las ${ORDEN.length}, para probarlas` : n ? `${n} de ${ORDEN.length} vistas` : 'Todavía no han visto ninguna'}</span>`;
    b.onclick = pantalla; enci.before(b);
  });

  return { registrar, play, parar, vista, marcar, ir, pausa, boca, capa, listaCues, pantalla, activo: () => !!act, get t() { return act ? act.t : 0; }, get dur() { return act ? act.esc.dur : 0; }, get M() { return M; }, get ultima() { return ultima; } };
})();
