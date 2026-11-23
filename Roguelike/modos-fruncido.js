'use strict';
// =====================================================================
//  EL FRUNCIDO · el mundo bordado (punto de cruz)
//  El nivel está bordado en una manta larga. Por abajo, la tela tiene
//  calados: agujeros por donde Itzel se cae. Sobre ellos van hilvanes,
//  puntadas largas de hilo suelto. Con clic, Fresita jala un hilván y la
//  tela se frunce: ese tramo se encoge (con todo lo bordado, hasta el
//  cielo) y el calado queda a un salto. Fresita tiene un solo hilo: al
//  jalar otro hilván, el anterior se suelta. Los hilvanes flojos (rosas)
//  se sueltan solos a los pocos segundos.
//  Itzel se mueve sobre la tela: su posición se guarda en la tela (u) y en
//  pantalla se ve donde la deja el fruncido (X(u)).
//  Las polillas se comen la tela y abren calados nuevos; los alfileres
//  pican y los botones rebotan.
// =====================================================================
MODOS.fruncido = (() => {
  const P = 2, ARR = 64, CW = 256, PISO = 192, K = .3;
  const canistelBordado = new Image();
  canistelBordado.src = '../Roguelike/assets/hipil-detalles/canistel-bordado-v1.png';
  const itzelCamina = new Image(), itzelSalta = new Image();
  itzelCamina.src = '../Roguelike/assets/forge/itzel/hipil-caminar-v3/sheet-transparent.png';
  itzelSalta.src = '../Roguelike/assets/forge/itzel/hipil-salto-v3/sheet-transparent.png';
  function dibujaItzel(c, p, st, f) {
    const aire = !p.on, im = aire ? itzelSalta : itzelCamina;
    if (!im.complete || !im.naturalWidth) return st.player(c, p, f);
    const q = aire ? ((p.vy || 0) < 0 ? 1 : 2) : Math.abs(p.vx || 0) > 20 ? 1 + Math.floor((p.run || 0) / (Math.PI / 3)) % 6 : 0;
    const cols = aire ? 2 : 4, altura = aire ? 89 : 190, piso = aire ? 173 : 223, lado = 21 * 256 / altura;
    c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
    c.drawImage(im, (q % cols) * 256, Math.floor(q / cols) * 256, 256, 256, -lado / 2, -piso * lado / 256, lado, lado);
    c.restore();
  }
  const GRAV = 1100, SALTO = 385, VEL = 112, AN = 5, ALTO = 20;
  const suena = n => { if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx(n); };
  const e3 = g => g * g * (3 - 2 * g);

  // ---------------- la manta, columna por columna ----------------
  function armar() {
    const W = 172, H = 15, M = new Uint8Array(W * H);
    const pon = (c0, c1, r0, r1, v) => { for (let c = c0; c < c1; c++) for (let r = r0; r < r1; r++) M[r * W + c] = v; };
    const hueco = (c0, c1) => pon(c0, c1, 12, H, 0);
    pon(0, W, 12, H, 1);
    const secs = [], hil = (c0, c1, flojo) => secs.push({ u0: c0 * T, u1: c1 * T, g: 0, quiere: 0, t: 0, flojo: !!flojo });
    const coins = [], mon = (c, r) => coins.push({ u: c * T + 8, y: r * T + 8, got: false });
    const alfileres = [], botones = [], polillas = [], bichos = [];
    // I. un calado chico y el primer hilván
    hueco(8, 10); mon(9, 9);
    pon(11, 15, 11, 12, 1); pon(12, 14, 10, 11, 1); mon(13, 8);                       // la primera colina de tela
    hil(15, 31); hueco(18, 28); mon(23, 10); mon(25, 10);
    // II. dos hilvanes seguidos con una isla: un solo hilo
    pon(32, 35, 8, 9, 2); mon(32, 7); mon(33, 7); mon(34, 7);
    hil(36, 48); hueco(38, 46); pon(40, 44, 9, 10, 2); mon(41, 8); mon(42, 8); mon(43, 8); polillas.push({ c: 41 });
    pon(48, 52, 10, 12, 1); pon(49, 51, 9, 10, 1); mon(50, 7);
    hil(52, 64); hueco(54, 62); mon(58, 10); pon(57, 60, 9, 10, 2); mon(58, 8);
    // III. alfileres y el hilván flojo, el más largo
    bichos.push([62, 65]); alfileres.push(66 * T + 8, 67 * T + 8); pon(65, 69, 9, 10, 2); mon(66, 8); mon(68, 8);
    hil(70, 88, true); hueco(72, 86); mon(79, 9); pon(82, 85, 9, 10, 2); mon(83, 8); polillas.push({ c: 76 });
    bichos.push([90, 96]); polillas.push({ c: 92 });
    // IV. el botón que rebota al bordado de arriba (o el hilván por abajo)
    botones.push(98 * T + 8); pon(101, 111, 5, 6, 2); hueco(101, 113); hil(100, 114); for (let c = 102; c < 110; c += 2) mon(c, 4);
    bichos.push([113, 116]); alfileres.push(117 * T + 8); polillas.push({ c: 119 });
    pon(119, 122, 10, 12, 1); pon(120, 122, 9, 10, 1); mon(121, 7);
    // V. el final: un hilván fijo, uno flojo y la flor del hipil
    hil(122, 136); hueco(124, 134); pon(137, 139, 9, 10, 2); mon(137, 8); mon(138, 8);
    hil(140, 154, true); hueco(142, 151); polillas.push({ c: 158 }); polillas.push({ c: 130 }); polillas.push({ c: 147 }); mon(146, 10); pon(144, 148, 9, 10, 2); mon(146, 8);
    bichos.push([152, 157]); pon(159, 163, 10, 12, 1); pon(160, 162, 9, 10, 1); mon(161, 7);
    return { W, H, M, secs, coins, alfileres, botones, meta: 164 * T, inicio: 2 * T + 8,
      bichos: bichos.map(([a, b], i) => ({ a: a * T, b: b * T, u: (a + (b - a) * (i % 2 ? .3 : .7)) * T, d: i % 2 ? 1 : -1, st: 'vivo', t: 0 })),
      polillas: polillas.map((q, i) => ({ home: q.c * T, u: q.c * T, y: 140, st: 'vuela', t: i * 2.3, come: 0, comidas: 0 })),
      ayudas: [
        { id: 'calado', u: 5 * T, txt: 'Esos agujeros son el calado de la tela: si Itzel se cae, se va por el revés.' },
        { id: 'hilvan', u: 13 * T, txt: 'Fresita: haz clic sobre el hilván para jalarlo. La tela se frunce y el calado se achica.' },
        { id: 'unhilo', u: 47 * T, txt: 'Fresita tiene un solo hilo: al jalar otro hilván, el anterior se suelta.' },
        { id: 'flojo', u: 68 * T, txt: 'Ese hilván rosa está flojo: se suelta solito en unos segundos. ¡Rápido!' },
        { id: 'polilla', u: 88 * T, txt: 'Las polillas se comen la tela. Cáeles encima, o que Fresita les cante con clic derecho.' },
        { id: 'bicho', u: 60 * T, txt: 'Los escarabajos bordados patrullan la tela: salta sobre ellos para aplastarlos.' },
        { id: 'boton', u: 96 * T, txt: 'Los botones rebotan: por arriba hay canisteles; por abajo, otro hilván.' },
      ] };
  }
  const celda = (n, c, r) => c < 0 || c >= n.W ? 1 : r < 0 || r >= n.H ? 0 : n.M[r * n.W + c];
  // del largo de la tela (u) a la pantalla (x) y de regreso, según lo fruncido
  function X(j, u) { let x = u; for (const s of j.n.secs) { if (u <= s.u0) break; x -= (Math.min(u, s.u1) - s.u0) * (1 - K) * e3(s.g); } return x; }
  function U(j, x) {
    let off = 0;
    for (const s of j.n.secs) { const k = (1 - K) * e3(s.g), a = s.u0 - off; if (x <= a) return x + off; const largo = (s.u1 - s.u0) * (1 - k); if (x <= a + largo) return s.u0 + (x - a) / (1 - k); off += (s.u1 - s.u0) * k; }
    return x + off;
  }
  const escala = (j, u) => { for (const s of j.n.secs) if (u >= s.u0 && u < s.u1) return 1 - (1 - K) * e3(s.g); return 1; };
  function choca(j, u, y) {
    const n = j.n, c0 = Math.floor((u - AN) / T), c1 = Math.floor((u + AN - .01) / T), r0 = Math.floor((y - ALTO) / T), r1 = Math.floor((y - .01) / T);
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (celda(n, c, r)) return { c, r };
    return null;
  }
  function crear(def, st) {
    const n = armar();
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, n, inv: 0, pose: poseItzel(), chunks: new Map(), S: 0,
      p: { u: n.inicio, y: PISO, vx: 0, vy: 0, on: true, face: 1, run: 0 }, safe: { u: n.inicio, y: PISO },
      cam: 0, coyote: 0, buf: 0, saltaAntes: false, fre: { x: 90, y: 120 }, vistas: {}, aviso: null, demo: typeof STATE !== 'undefined' && STATE === 'libro', dy: 0 };
  }
  const avisa = (j, txt) => { j.aviso = { txt, t: 0 }; };
  // la sección bajo el cursor (con un poco de margen)
  const seccionEn = (j, sx) => j.n.secs.find(s => sx >= X(j, s.u0) - j.cam - 8 && sx <= X(j, s.u1) - j.cam + 8);
  function jala(j, s) {
    if (s.quiere) { s.quiere = 0; suena('poder'); return; }
    for (const o of j.n.secs) o.quiere = 0;
    s.quiere = 1; s.t = 0; suena('poder');
    if (typeof ENCI !== 'undefined' && ENCI.ver) ENCI.ver('poder:aguja');
  }
  function comeTela(j, c) {
    const n = j.n; if (!celda(n, c, 12) || c < 4) return false;
    for (let r = 12; r < n.H; r++) n.M[r * n.W + c] = 0;
    for (const [k] of j.chunks) if (Math.abs(k * CW + CW / 2 - c * T) < CW) j.chunks.get(k).sucio = true;
    return true;
  }

  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    // demo del poder en la enciclopedia: Itzel camina sola y salta donde se acaba la tela; Fresita jala el hilván que viene
    if (j.camina) {
      for (const sc of j.n.secs) sc.quiere = (j.p.u > sc.u0 - 90 && j.p.u < sc.u1 + 4 && !(sc.flojo && sc.t > 3)) ? 1 : 0;
      const p0 = j.p, hueco = [8].some(d => !celda(j.n, Math.floor((j.p.u + d) / T), 12) && celda(j.n, Math.floor((j.p.u + d) / T), 11) === 0);
      const pared = [6, 12, 20].some(d => celda(j.n, Math.floor((j.p.u + d) / T), 11) !== 0 || celda(j.n, Math.floor((j.p.u + d) / T), 10) !== 0);
      j.kAuto = { right: true, space: (hueco && p0.on) || (pared && Math.floor(j.t * 6) % 2 === 0) };   // pulsa el salto (un salto por pulsación)
    }
    const p = j.p, n = j.n, k = j.camina ? j.kAuto || {} : j.demo ? {} : teclas(), px = X(j, p.u) - j.cam;
    // Fresita sigue al cursor; clic jala el hilván que está debajo; clic derecho canta
    if (MOUSE.active && !j.demo) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.dy - j.fre.y) * Math.min(1, dt * 9); }
    else { j.fre.x += (px - p.face * 18 - j.fre.x) * dt * 4; j.fre.y += (p.y - 34 + Math.sin(j.t * 2.2) * 2 - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { for (const q of n.polillas) if (q.st !== 'huye' && Math.hypot(X(j, q.u) - j.cam - j.fre.x, q.y - j.fre.y) < 60) { q.st = 'duerme'; q.t = 0; } chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 14, 50); suena('arrullo'); continue; }
      const s = seccionEn(j, c.x); if (s) jala(j, s); else chispas(j, c.x, c.y - j.dy, ['#c8203a'], 5, 20);
    }
    MOUSE.clicks.length = 0;
    if (j.demo && !j.camina && j.t % 2.4 < dt) { const s = n.secs.find(q => q.u1 > p.u) || n.secs[0]; jala(j, s); }
    // los hilvanes se frunzen y se sueltan poco a poco; los flojos se sueltan solos
    for (const s of n.secs) {
      s.t += dt; if (s.flojo && s.quiere && s.t > 3.4) { s.quiere = 0; suena('aviso'); }
      s.g += Math.sign(s.quiere - s.g) * Math.min(Math.abs(s.quiere - s.g), dt * 3.2);
    }
    if (j.aviso) { if (!(typeof cartelVisible === 'function' && cartelVisible())) j.aviso.t += dt; if (j.aviso.t > 5.5) j.aviso = null; }
    // Itzel: se mueve en pantalla, pero su lugar se guarda en la tela
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    p.vx += (dx * VEL * (j.camina ? 1.3 : 1) - p.vx) * Math.min(1, dt * 14); if (dx) p.face = dx;
    if (!j.win && p.vx) {
      const nu = U(j, X(j, p.u) + p.vx * dt), h = choca(j, nu, p.y);
      if (h) p.u = p.vx > 0 ? h.c * T - AN - .01 : (h.c + 1) * T + AN + .01; else p.u = nu;
    }
    if (Math.abs(p.vx) > 20) p.run += dt * 14;
    const salta = !!(k.space || k.up), pres = salta && !j.saltaAntes; j.saltaAntes = salta;
    j.buf = pres ? .12 : Math.max(0, j.buf - dt); j.coyote = p.on ? .1 : Math.max(0, j.coyote - dt);
    if (j.buf > 0 && j.coyote > 0) { p.vy = -SALTO; p.on = false; j.buf = 0; j.coyote = 0; suena('salto'); }
    j.reboteT = Math.max(0, (j.reboteT || 0) - dt);
    if (!salta && p.vy < 0 && !j.reboteT) p.vy += GRAV * dt * 1.3;
    p.vy = Math.min(p.vy + GRAV * dt, 520);
    const cae = p.vy, y0 = p.y; p.y += p.vy * dt;
    const h = choca(j, p.u, p.y);
    if (h) { if (cae > 0) { p.y = h.r * T; if (!p.on && cae > 380) suena('cae'); p.on = true; } else p.y = (h.r + 1) * T + ALTO; p.vy = 0; }
    else p.on = false;
    if (p.on && celda(n, Math.floor(p.u / T), Math.floor(p.y / T)) && celda(n, Math.floor((p.u - AN) / T), Math.floor(p.y / T)) && celda(n, Math.floor((p.u + AN) / T), Math.floor(p.y / T))) Object.assign(j.safe, { u: p.u, y: p.y });
    // por el calado se va al revés de la tela
    if (p.y > VH + 30) { if (dañoModo(j)) suena('herida'); Object.assign(p, { u: j.safe.u, y: j.safe.y, vx: 0, vy: 0 }); }
    // alfileres y botones
    for (const a of n.alfileres) if (Math.abs(p.u - a) < AN + 2 && p.y > PISO - 8 && dañoModo(j)) { suena('herida'); p.vy = -280; p.on = false; }
    for (const b of n.botones) if (cae > 0 && Math.abs(p.u - b) < AN + 7 && p.y >= PISO - 7 && y0 <= PISO - 5) { p.vy = -560; p.y = PISO - 7; p.on = false; suena('salto'); chispas(j, X(j, b) - j.cam, PISO - 6, ['#2f5fa8', '#ffffff'], 8, 40); }
    // escarabajos bordados: patrullan un tramo plano; se pisan desde arriba
    for (const b of n.bichos) {
      b.t += dt;
      if (b.st === 'muerto') continue;
      b.u += b.d * 24 * dt; if (b.u < b.a + 6) { b.u = b.a + 6; b.d = 1; } if (b.u > b.b - 6) { b.u = b.b - 6; b.d = -1; }
      if (Math.abs(X(j, b.u) - X(j, p.u)) < 9 && p.y > PISO - 10 && p.y < PISO + 6) {
        if (cae > 0 && y0 <= PISO - 6) { b.st = 'muerto'; b.t = 0; p.vy = -340; j.reboteT = .25; RUN.stomps++; if (puedeSoltarCorazon()) (j.corazones || (j.corazones = [])).push({ u: b.u, y: PISO - 8 }); suena('pisa'); chispas(j, X(j, b.u) - j.cam, PISO - 4, ['#c8203a', '#2a2228', '#ffffff'], 12, 40); }
        else if (dañoModo(j)) { suena('herida'); p.vy = -200; p.on = false; }
      }
    }
    // polillas: revolotean, bajan a comer tela y abren calados
    for (const q of n.polillas) {
      q.t += dt;
      if (q.st === 'huye') { q.y -= 70 * dt; q.u += 50 * dt; continue; }
      if (q.st === 'duerme') { if (q.t > 5) { q.st = 'vuela'; q.t = 0; } continue; }
      if (q.st === 'vuela') {
        q.u = q.home + Math.sin(q.t * .7) * 42; q.y = 140 + Math.sin(q.t * 1.9) * 18;
        const col = Math.floor(q.u / T);
        if (q.t > 6 && q.comidas < 2 && celda(n, col, 12) && Math.abs(q.u - p.u) > 40) { q.st = 'baja'; q.t = 0; q.col = col; }
      } else if (q.st === 'baja') { q.y += (PISO - 4 - q.y) * Math.min(1, dt * 3); if (q.t > 1.8) { if (comeTela(j, q.col)) { q.comidas++; chispas(j, X(j, q.col * T + 8) - j.cam, PISO + 4, ['#efe6d0', '#c8203a'], 12, 40); } q.st = 'vuela'; q.t = 0; q.home = q.u; } }
      const sx = X(j, q.u) - j.cam, ix = X(j, p.u) - j.cam;
      if (Math.abs(sx - ix) < 10 && Math.abs(q.y - (p.y - 10)) < 12) {
        if (cae > 0 && p.y < q.y) { q.st = 'huye'; q.t = 0; p.vy = -395; j.reboteT = .3; RUN.stomps++; if (puedeSoltarCorazon()) (j.corazones || (j.corazones = [])).push({ u:q.u, y:q.y }); suena('pisa'); chispas(j, sx, q.y, ['#a89880', '#ffffff'], 12, 60); }
        else if (q.st !== 'duerme' && dañoModo(j)) { suena('herida'); p.vy = -200; }
      }
    }
    if (j.corazones) j.corazones = j.corazones.filter(h => { if (RUN.hearts < RUN.maxHearts && Math.hypot(X(j,h.u) - X(j,p.u), h.y - (p.y - 10)) < 12) { RUN.hearts++; suena('cura'); return false; } return true; });
    for (const c of n.coins) if (!c.got && Math.abs(X(j, c.u) - X(j, p.u)) < 9 && Math.abs(c.y - (p.y - 10)) < 14) { c.got = true; RUN.coins++; suena('canistel'); chispas(j, X(j, c.u) - j.cam, c.y, ['#f2b51f', '#e8742a', '#ffffff']); }
    if (!j.win && p.u >= n.meta) { j.win = j.t; suena('meta'); chispas(j, X(j, p.u) - j.cam, p.y - 30, ['#c8203a', '#f2b51f', '#3f8f4a', '#ffffff'], 60, 140); }
    for (const a of n.ayudas) if (!j.vistas[a.id] && p.u > a.u && p.u < a.u + 5 * T) { j.vistas[a.id] = 1; avisa(j, a.txt); }
    const meta = clamp(X(j, p.u) - VW * .4, 0, X(j, n.W * T) - VW); j.cam += (meta - j.cam) * Math.min(1, dt * 5);
    pasoChispas(j, dt);
  }

  // ---------------- la tela bordada, en pedazos de 256 de largo ----------------
  function pintaPedazo(x, j, u0) {
    const n = j.n, u1 = u0 + CW, PT = PUNTO, R = (i, s) => hash1(i, s);
    PT.manta(x, u0, -ARR, CW, VH + ARR, P);
    const al = v => Math.floor(v / P) * P;
    // dos cenefas de grecas: arriba de todo y bajo el cielo
    const cel = [];
    for (let i = Math.floor(u0 / P); i < u1 / P; i++) for (let jj = 0; jj < 5; jj++) for (const y0 of [-56, 6]) { const z = (i + jj) % 6, w = ((i - jj) % 6 + 6) % 6; if (jj === 0 || jj === 4) cel.push([i * P, y0 + jj * P, '#2f5fa8']); else if (z === 0 || w === 0) cel.push([i * P, y0 + jj * P, '#c8203a']); }
    // Campeche al fondo, bordado: casas de colores, catedral, muralla
    const FACH = ['#e8607a', '#f2b51f', '#6aaee0', '#86c25a', '#e8742a', '#ffb3c8', '#c98a5c'];
    for (let i = Math.floor(u0 / P); i < u1 / P; i++) {
      const wx = i * P, top = al(184 - CAMP.h(wx * .8, 'mid', 21) * 1.35), seg = CAMP.seg(wx * .8, 'mid', 21), fa = seg.t === 'casas' ? seg.fac.find(q => wx * .8 >= q.x0 && wx * .8 < q.x0 + q.w) : null;
      for (let y = top; y < PISO; y += P) {
        let c = seg.t === 'catedral' ? '#d8d0bc' : seg.t === 'muralla' || seg.t === 'baluarte' ? '#c98a5c' : fa ? FACH[fa.col % FACH.length] : '#d8d0bc';
        if (fa && (y - top) > 6 && ((wx * .8 - fa.x0) % 8 < 3) && ((y - top) % 12 < 5)) c = '#2f5fa8';
        if (y - top < P * 1.5) c = PT.sombra(c);
        cel.push([wx, y, c]);
      }
    }
    PT.bordar(x, cel, P);
    // rosetones de muestrario, soles y palmas bordadas
    for (let k = Math.floor(u0 / 70) - 1; k <= u1 / 70 + 1; k++) {
      const cx = al(k * 70 + R(k, 1) * 40), cy = al(-38 + R(k, 2) * 130), cols = [['#c8203a', '#f2b51f'], ['#2f5fa8', '#6aaee0'], ['#7a3f9a', '#e8607a'], ['#3f8f4a', '#f2b51f']][k & 3];
      if (R(k, 5) < .18) PT.aPunto(x, cx - 22, cy - 22, 44, 44, P, c => { c.fillStyle = '#f2b51f'; c.beginPath(); c.arc(cx, cy, 11, 0, TAU); c.fill(); c.fillStyle = '#e8742a'; for (let q = 0; q < 10; q++) { const a = q / 10 * TAU; c.beginPath(); c.arc(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 2.2, 0, TAU); c.fill(); } });
      else PT.aPunto(x, cx - 14, cy - 14, 28, 28, P, c => { for (let q = 0; q < 8; q++) { const a = q / 8 * TAU; c.fillStyle = q % 2 ? cols[0] : cols[1]; c.beginPath(); c.ellipse(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 5, 2.6, a, 0, TAU); c.fill(); } c.fillStyle = '#2a2228'; c.fillRect(cx - 2, cy - 2, 4, 4); });
    }
    for (let k = Math.floor(u0 / 190) - 1; k <= u1 / 190 + 1; k++) { const cx = al(k * 190 + R(k, 11) * 90), cy = al(70 + R(k, 12) * 30), w = 26 + R(k, 13) * 14;
      PT.aPunto(x, cx - w, cy - 14, w * 2, 26, P, c => { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(cx, cy, w * .8, 6, 0, 0, TAU); c.ellipse(cx - w * .3, cy - 4, w * .4, 6, 0, 0, TAU); c.ellipse(cx + w * .25, cy - 5, w * .35, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#6aaee0'; c.fillRect(cx - w * .8, cy + 4, w * 1.6, 2.2); }); }
    for (const q of CAMP.props(u0 - 40, u1 + 40, 'near', 31)) if (q.k === 'palma') PT.aPunto(x, al(q.x - 30), 112, 60, 82, P, c => { c.beginPath(); CAMP.palma(c, q.x, PISO, q.h * .95, q.lean, q.s, 0, 'crown'); c.fillStyle = '#3f8f4a'; c.fill(); c.beginPath(); CAMP.palma(c, q.x, PISO, q.h * .95, q.lean, q.s, 0, 'trunk'); c.fillStyle = '#7a4a2a'; c.fill(); });
    for (let k = Math.floor(u0 / 150); k <= u1 / 150; k++) { const fx = k * 150 + R(k, 7) * 80, fy = 60 + R(k, 8) * 40; PT.puntoAtras(x, [[fx - 8, fy + 2], [fx - 4, fy - 1], [fx, fy + 1], [fx + 4, fy - 1], [fx + 8, fy + 2]], P, '#2a2228', .7); }
    if (typeof HIPIL_DETALLES !== 'undefined') HIPIL_DETALLES.pinta(x, u0, CW);
    // el suelo y los bordados donde se pisa
    const suelo = [];
    for (let i = Math.floor(u0 / P); i < u1 / P; i++) {
      const c = Math.floor(i * P / T); let d = -1;
      for (let jj = 0; jj < VH / P; jj++) {
        const r = Math.floor(jj * P / T), v = celda(n, c, r);
        if (!v) { d = -1; continue; } d++;
        suelo.push([i * P, jj * P, v === 2 ? (d % 8 === 0 || d % 8 === 7 ? '#2f5fa8' : (i + d) % 4 < 2 ? '#c8203a' : '#f6f0e2') : PT.cenefa(i, d)]);
      }
    }
    PT.bordar(x, suelo, P);
    x.strokeStyle = '#2a2228'; x.lineWidth = .7; x.beginPath();
    for (let c = Math.floor(u0 / T) - 1; c <= u1 / T; c++) for (let r = 0; r < n.H; r++) {
      if (!celda(n, c, r) || c < 0 || c >= n.W) continue; const cx = c * T, cy = r * T;
      if (!celda(n, c, r - 1)) for (let s = 0; s < T; s += 4) { x.moveTo(cx + s + .4, cy - .2); x.lineTo(cx + s + 3.4, cy - .2); }
      if (!celda(n, c - 1, r)) for (let s = 0; s < T; s += 4) { x.moveTo(cx - .2, cy + s + .4); x.lineTo(cx - .2, cy + s + 3.4); }
      if (!celda(n, c + 1, r)) for (let s = 0; s < T; s += 4) { x.moveTo(cx + T + .2, cy + s + .4); x.lineTo(cx + T + .2, cy + s + 3.4); }
      if (r > 0 && r < 12 && !celda(n, c, r + 1)) for (let s = 0; s < T; s += 4) { x.moveTo(cx + s + .4, cy + T + .2); x.lineTo(cx + s + 3.4, cy + T + .2); }
    }
    x.stroke();
    // los calados: se recorta la tela y quedan hebras sueltas colgando
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
    for (let c = Math.floor(u0 / T) - 1; c <= u1 / T; c++) if (c >= 0 && c < n.W && !celda(n, c, 12)) x.fillRect(c * T, PISO, T, VH - PISO + 2);
    x.globalCompositeOperation = 'source-over';
    x.strokeStyle = '#e8dcc0'; x.lineWidth = .5; x.beginPath();
    for (let c = Math.floor(u0 / T) - 1; c <= u1 / T; c++) {
      if (c < 0 || c >= n.W || celda(n, c, 12)) continue;
      for (let s = 0; s < T; s += 2) { const L2 = 2 + R(c * 31 + s, 9) * 6; x.moveTo(c * T + s + .5, PISO); x.quadraticCurveTo(c * T + s + .5 + (R(c + s, 4) - .5) * 3, PISO + L2 * .6, c * T + s + (R(c * 7 + s, 5) - .5) * 2, PISO + L2); }
      for (const lado of [0, 1]) if (celda(n, c + (lado ? 1 : -1), 12)) for (let y = PISO + 2; y < VH; y += 3) { const bx = c * T + (lado ? T : 0); x.moveTo(bx, y); x.lineTo(bx + (lado ? -1 : 1) * (1.5 + R(y + c, 3) * 3), y + 1.4); }
    }
    x.stroke();
  }
  function pedazo(j, k, S) {
    let o = j.chunks.get(k);
    if (!o || o.S !== S || o.sucio) {
      const cv = o && o.S === S ? o.cv : mkCanvas(CW * S, (VH + ARR) * S), x = cv.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.setTransform(S, 0, 0, S, -k * CW * S, ARR * S);
      pintaPedazo(x, j, k * CW); o = { cv, S, sucio: false }; j.chunks.set(k, o);
    }
    return o.cv;
  }
  // la mesa bajo la tela: madera y el revés del bordado (hebras de colores enredadas)
  function mesa(ctx, j, y0) {
    ctx.fillStyle = '#4a3226'; ctx.fillRect(0, y0, VW, VH - y0);
    ctx.strokeStyle = 'rgba(30,18,12,.35)'; ctx.lineWidth = .6; ctx.beginPath(); for (let y = y0 + 3; y < VH; y += 5) { ctx.moveTo(0, y); for (let x = 0; x <= VW; x += 20) ctx.lineTo(x, y + Math.sin(x * .05 + y + j.cam * .05) * 1.2); } ctx.stroke();
    const cols = ['#c8203a', '#f2b51f', '#3f8f4a', '#2f5fa8', '#e8607a'];
    for (let k = Math.floor(j.cam / 40) - 1; k < (j.cam + VW) / 40 + 1; k++) { ctx.strokeStyle = rgba(cols[((k % 5) + 5) % 5], .55); ctx.lineWidth = .8; ctx.beginPath(); const x = k * 40 - j.cam + hash1(k, 3) * 20; ctx.moveTo(x, PISO + 4); ctx.bezierCurveTo(x + 14, PISO + 30, x - 10, PISO + 20, x + 18 * hash1(k, 4), VH); ctx.stroke(); }
  }

  function pintar(j, view) {
    const st = view.st, S = view.S, ctx = view.ctx, t = j.t, n = j.n, p = j.p;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    j.dy = typeof VISTA !== 'undefined' && typeof canvas !== 'undefined' && view.ctx === canvas.getContext('2d') ? Math.max(0, VISTA.H - VH) : 0;
    ctx.setTransform(S, 0, 0, S, 0, j.dy * S); ctx.imageSmoothingEnabled = true;
    const f = { t, cam: j.cam, S, g: j, st, key: st.id + '@' + S.toFixed(3) };
    if (j.S !== S) { j.chunks.clear(); j.S = S; }
    if (!j.hipilAssets && typeof HIPIL_DETALLES !== 'undefined' && HIPIL_DETALLES.todo()) { j.chunks.clear(); j.hipilAssets = true; }
    mesa(ctx, j, -j.dy);
    // la tela, pedazo por pedazo, estirada o fruncida según cada tramo
    const uA = U(j, j.cam) - 4, uB = U(j, j.cam + VW) + 4, cortes = [];
    for (const s of n.secs) cortes.push(s.u0, s.u1);
    for (let k = Math.floor(uA / CW); k <= Math.floor(uB / CW); k++) {
      if (k < 0 || k * CW > n.W * T) continue;
      const cv = pedazo(j, k, S), a0 = k * CW, b0 = a0 + CW, puntos = [a0, ...cortes.filter(c => c > a0 && c < b0), b0];
      for (let i = 0; i + 1 < puntos.length; i++) {
        const a = Math.max(puntos[i], uA), b = Math.min(puntos[i + 1], uB); if (b <= a) continue;
        const xa = X(j, a) - j.cam, xb = X(j, b) - j.cam;
        ctx.drawImage(cv, (a - a0) * S, 0, (b - a) * S, (VH + ARR) * S, xa, -ARR, xb - xa + .35, VH + ARR);
      }
    }
    // los pliegues del fruncido: sombra y luz en cada doblez
    for (const s of n.secs) {
      const g = e3(s.g); if (g < .02) continue;
      const xa = X(j, s.u0) - j.cam, xb = X(j, s.u1) - j.cam, nP = Math.round((s.u1 - s.u0) / 14), w = (xb - xa) / nP;
      for (let i = 0; i < nP; i++) { const gr = ctx.createLinearGradient(xa + i * w, 0, xa + (i + 1) * w, 0); gr.addColorStop(0, `rgba(255,255,255,${.22 * g})`); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(.85, `rgba(70,40,25,${.3 * g})`); gr.addColorStop(1, `rgba(70,40,25,${.12 * g})`); ctx.fillStyle = gr; ctx.fillRect(xa + i * w, -ARR, w, PISO + ARR + 1); }
      // donde empieza y termina el fruncido, la tela se jala
      for (const [x0, d] of [[xa, -1], [xb, 1]]) { const gr = ctx.createLinearGradient(x0, 0, x0 + d * 14, 0); gr.addColorStop(0, `rgba(70,40,25,${.18 * g})`); gr.addColorStop(1, 'rgba(70,40,25,0)'); ctx.fillStyle = gr; ctx.fillRect(Math.min(x0, x0 + d * 14), -ARR, 14, PISO + ARR); }
    }
    // los hilvanes: puntadas largas sobre el calado; el que jala Fresita va tenso hasta ella
    const bajo = MOUSE && MOUSE.active ? seccionEn(j, MOUSE.x) : null;
    for (const s of n.secs) {
      const xa = X(j, s.u0) - j.cam, xb = X(j, s.u1) - j.cam, y = PISO - 5, col = s.flojo ? '#ff4f95' : '#c8203a', aviso = s.flojo && s.quiere && s.t > 2.2 && Math.sin(t * 20) > 0;
      if (xb < -20 || xa > VW + 20) continue;
      ctx.strokeStyle = aviso ? '#ffffff' : col; ctx.lineWidth = s === bajo ? 1.5 : 1; ctx.lineCap = 'round'; ctx.beginPath();
      const nPun = Math.round((s.u1 - s.u0) / 10);
      for (let i = 0; i < nPun; i++) { const a = s.u0 + i * 10 + 1, b = a + 6, ya = y + Math.sin(i * 1.7) * e3(s.g) * 1.6; ctx.moveTo(X(j, a) - j.cam, ya); ctx.lineTo(X(j, b) - j.cam, ya); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xa, y, 1.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2a2228'; ctx.lineWidth = .4; ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = s.quiere ? 1 : .8; ctx.beginPath(); ctx.moveTo(xb, y);
      if (s.quiere) ctx.quadraticCurveTo((xb + j.fre.x) / 2, Math.max(y, j.fre.y) + 6, j.fre.x, j.fre.y + 3);
      else ctx.quadraticCurveTo(xb + 6, y - 6, xb + 4 + Math.sin(t * 2 + s.u0) * 1.5, y - 14);
      ctx.stroke();
      if (s === bajo && !s.quiere) { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = 'italic 6px Alegreya, serif'; ctx.textAlign = 'center'; ctx.fillText('jalar', (xa + xb) / 2, y - 6); ctx.textAlign = 'left'; }
    }
    // alfileres (de verdad, clavados en la tela) y botones cosidos
    for (const a of n.alfileres) { const x = X(j, a) - j.cam; if (x < -10 || x > VW + 10) continue; ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(x - 1, PISO + 3); ctx.lineTo(x + 1.5, PISO - 9); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(x - .6, PISO + 2); ctx.lineTo(x + 1.6, PISO - 8); ctx.stroke(); ctx.fillStyle = '#c8203a'; ctx.beginPath(); ctx.arc(x + 1.8, PISO - 10, 2.3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x + 1.2, PISO - 10.7, .7, 0, TAU); ctx.fill(); }
    for (const b of n.botones) {
      const x = X(j, b) - j.cam, sq = Math.max(0, 1 - Math.abs(X(j, p.u) - j.cam - x) / 10) * (p.on ? 1 : 0);
      ctx.fillStyle = 'rgba(60,40,30,.25)'; ctx.beginPath(); ctx.ellipse(x + 1, PISO, 9, 2.4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2f5fa8'; ctx.beginPath(); ctx.ellipse(x, PISO - 4 + sq, 8.5, 3.6 - sq, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a3a6a'; ctx.lineWidth = .6; ctx.stroke();
      ctx.strokeStyle = '#f6f0e2'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - 2.4, PISO - 5 + sq); ctx.lineTo(x + 2.4, PISO - 3 + sq); ctx.moveTo(x + 2.4, PISO - 5 + sq); ctx.lineTo(x - 2.4, PISO - 3 + sq); ctx.stroke();
    }
    for (const c of n.coins) if (!c.got) {
      const x = X(j, c.u) - j.cam; if (x < -12 || x > VW + 12) continue;
      if (canistelBordado.complete && canistelBordado.naturalWidth) {
        const y = c.y + Math.sin(t * 2.5 + c.u * .04) * 1.2;
        ctx.drawImage(canistelBordado, x - 8, y - 8, 16, 16);
      } else st.coin(ctx, x, c.y, t, f);
    }
    for (const h of j.corazones || []) { const x = X(j, h.u) - j.cam, y = h.y + Math.sin(t * 3) * 1.5; drawHeart(ctx, x, y, 5, '#7a0f2a'); drawHeart(ctx, x, y, 4, '#ff3b5c'); }
    st.goal(ctx, X(j, n.meta + 24) - j.cam, PISO, t, f);
    // escarabajos bordados
    for (const b of n.bichos) {
      const x = X(j, b.u) - j.cam; if (x < -14 || x > VW + 14) continue;
      const al = b.st === 'muerto' ? Math.max(0, 1 - b.t * 1.5) : 1; if (al <= 0) continue;
      const sq = b.st === 'muerto' ? .35 : 1, pat = Math.sin(t * 14 + b.a) * .8;
      ctx.save(); ctx.globalAlpha = al; ctx.translate(x, PISO); ctx.scale(b.d, sq);
      ctx.strokeStyle = '#2a2228'; ctx.lineWidth = .7; ctx.beginPath();
      for (let i = -1; i <= 1; i++) { ctx.moveTo(i * 3, -3); ctx.lineTo(i * 3 + (i ? i * 2 : 1) + pat * (i ? 1 : -1), 0); }
      ctx.stroke();
      ctx.fillStyle = '#c8203a'; ctx.beginPath(); ctx.ellipse(0, -4.6, 6.2, 4.4, 0, Math.PI, TAU); ctx.fill(); ctx.fillRect(-6.2, -4.7, 12.4, 1.8);
      ctx.strokeStyle = '#2a2228'; ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(0, -4.6, 6.2, 4.4, 0, Math.PI, TAU); ctx.moveTo(0, -9); ctx.lineTo(0, -2.9); ctx.stroke();
      ctx.fillStyle = '#2a2228'; for (const [dx, dy] of [[-3.2, -5.6], [3.2, -5.6], [-2.2, -3.8], [2.2, -3.8]]) { ctx.beginPath(); ctx.arc(dx, dy, .9, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.arc(6.4, -3.6, 2.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(6.6, -4.4, .9, .9);
      ctx.restore();
    }
    // polillas
    for (const q of n.polillas) {
      const x = X(j, q.u) - j.cam, y = q.y, al = q.st === 'huye' ? Math.max(0, 1 - q.t) : 1; if (x < -20 || x > VW + 20 || al <= 0) continue;
      const aleteo = q.st === 'duerme' ? .2 : q.st === 'baja' && q.t > .6 ? .5 + Math.sin(t * 30) * .3 : Math.sin(t * 22 + q.home);
      ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y);
      ctx.fillStyle = '#a89880'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 4.4, -1, 5, 3 + aleteo * 1.6, s * .5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#8a7a64'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 4.6, -1, 1.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6a5a48'; ctx.beginPath(); ctx.ellipse(0, 0, 1.8, 4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(-.6, -3.6); ctx.quadraticCurveTo(-2, -6, -3, -6.4); ctx.moveTo(.6, -3.6); ctx.quadraticCurveTo(2, -6, 3, -6.4); ctx.stroke();
      if (q.st === 'duerme') { ctx.fillStyle = '#2a2228'; ctx.font = 'italic 5px Alegreya, serif'; ctx.fillText('z', 6, -6 - (t * 6 % 4)); }
      ctx.restore();
    }
    // Itzel y Fresita, bordadas
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) { Object.assign(j.pose, { x: X(j, p.u) - j.cam, y: p.y, face: p.face, on: p.on, vx: Math.abs(p.vx) > 20 ? p.vx : 0, vy: p.vy, run: p.run, vis: true, sq: 0 }); dibujaItzel(ctx, j.pose, st, f); }
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: j.fre.x < X(j, p.u) - j.cam ? 1 : -1 }, f);
    pintaChispas(ctx, j);
    // el bastidor: barras de madera arriba y abajo
    for (const [y, h] of [[-j.dy, 6], [VH - 5, 5]]) { const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#b07a48'); gr.addColorStop(1, '#6a4428'); ctx.fillStyle = gr; ctx.fillRect(0, y, VW, h); ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.fillRect(0, y + 1, VW, .8); for (let x = (-(j.cam * .999) % 80 + 80) % 80; x < VW; x += 80) { ctx.fillStyle = '#c8b090'; ctx.beginPath(); ctx.arc(x, y + h / 2, 1.4, 0, TAU); ctx.fill(); } }
    if (j.aviso) { const a = Math.min(1, j.aviso.t * 4, (5.5 - j.aviso.t) * 2); etiqueta(ctx, j.aviso.txt, VW / 2, 34 - j.dy, a); }
    if (j.t < 12 && !j.demo) { ctx.globalAlpha = Math.min(1, (12 - j.t) / 2); etiqueta(ctx, 'Itzel: A y D caminan, Espacio salta. Fresita: clic sobre un hilván para fruncir la tela; clic derecho canta.', VW / 2, VH - 16, 1); ctx.globalAlpha = 1; }
  }
  // una etiqueta de tela cosida con punto de bastilla
  function etiqueta(ctx, txt, x, y, al) {
    ctx.save(); ctx.globalAlpha *= al; ctx.font = '6.6px "Alegreya Sans", sans-serif';
    const w = Math.min(VW - 40, ctx.measureText(txt).width + 16);
    ctx.fillStyle = 'rgba(60,40,30,.25)'; ctx.fillRect(x - w / 2 + 1.5, y - 8.5, w, 13);
    ctx.fillStyle = '#f6f0e2'; ctx.fillRect(x - w / 2, y - 10, w, 13);
    ctx.strokeStyle = '#c8203a'; ctx.lineWidth = .6; ctx.setLineDash([2.4, 1.6]); ctx.strokeRect(x - w / 2 + 2, y - 8, w - 4, 9); ctx.setLineDash([]);
    ctx.fillStyle = '#2a2228'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y - 1.4, w - 10); ctx.textAlign = 'left'; ctx.restore();
  }
  return { crear, paso, pintar, X, U, alto: true, plataformas: true }; // es un plataformero 2D: no cuenta como otro género
})();

// en las arenas de jefe (plataformas normales) la aguja cose una puntada para pisar
MEC.LOOK.hilo = (c, pl) => {
  const cel = [], p = 2; for (let x = 0; x < pl.w; x += p) for (let y = 0; y < 4; y += p) cel.push([Math.round((pl.x + x) / p) * p, pl.y + y, (Math.floor(x / p) + y / p) % 4 < 2 ? '#c8203a' : '#f2b51f']);
  PUNTO.bordar(c, cel, p); PUNTO.puntoAtras(c, [[pl.x, pl.y - .3], [pl.x + pl.w, pl.y - .3]], 3, '#2a2228', .6);
};
MEC.POW.aguja = { name: 'Aguja e hilo', help: 'Clic sobre un hilván: Fresita lo jala y la tela se frunce, así el calado queda a un salto. Solo tiene un hilo: al jalar otro hilván, el anterior se suelta. Contra los jefes, cada clic cose una puntada para pisar.', cd: .35,
  click(g, x, y) { const M = MEC; if (L.solid(Math.floor(x / T), Math.floor(y / T))) return false; M.lim(g.plats, q => q.pw, 3); g.plats.push(M.mkPlat({ k: 'static', look: 'hilo', x: x - 17, y, w: 34, life: 7, pw: true })); return true; } };
if (typeof PODER_ALCANCE !== 'undefined') PODER_ALCANCE.add('aguja');
nivel('bordado', {
  nombre: 'El hipil fruncido', lugar: 'Un hipil bordado de Campeche',
  lema: 'Todo está bordado en punto de cruz. Fresita jala los hilvanes y frunce la tela para que Itzel brinque los calados; las polillas se la comen.',
  dato: 'En la península de Yucatán al punto de cruz se le dice xokbil chuy, que en maya quiere decir «hilo contado»: cada cruz se cuenta sobre los hilos de la tela. Así se bordan las flores de los hipiles.',
  modo: 'fruncido', foe: 'polilla', fauna: ['polilla'], power: 'aguja', plat: { k: 'static', look: 'hilo' }, W: 172,
  skin: { plat: '#c8203a', plat2: '#f2b51f', line: '#2a2228', accent: '#2f5fa8', foe: { main: '#a89880', dark: '#2a2228', light: '#f6f0e2', accent: '#c8203a', eye: '#ffffff' } },
});

