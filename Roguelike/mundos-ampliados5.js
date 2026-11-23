'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 6 (cine, plastilina, agua, fuego)
//  (el jardín de ecos es isométrico: sus mecánicas de plataformas viven en la imprenta)
//  Cuatro actos por mundo; dos enemigos y una pieza que juegan con el
//  poder de Fresita. Los dibujos de los enemigos van en enemigos-mundos.js.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, FOE, POW, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf, surf } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const tocaItzel = (g, x0, y0, x1, y1) => { const p = g.p; return p.vis && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1; };
  const vuela = (e, tx2, ty2, sp, d) => { const dx = tx2 - e.x, dy = ty2 - e.y, dd = Math.hypot(dx, dy) || 1, k = Math.min(dd, sp * d); e.x += dx / dd * k; e.y += dy / dd * k; if (Math.abs(dx) > 1) e.dir = Math.sign(dx); return dd; };
  const dispara = (g, o) => g.objs.push(Object.assign({ k: 'bala' }, o));
  // camina sin caerse: en la orilla se queda esperando en vez de dar la vuelta
  const avanzaHasta = (e, d, v) => { const nx = e.x + e.dir * v * d, ahead = nx + e.dir * e.w / 2; if (SOLID(ahead, e.y - 4) || !SOLID(ahead, e.y + 2)) return false; e.x = nx; return true; };

  // =================================================================
  //  CINE · Portales de Fresita (Itzel aparece donde está Fresita)
  // =================================================================
  // la bestia de la cueva: si ve a Itzel la persigue a toda carrera; no salta barrancos, se queda rugiendo en la orilla
  FOE.bestia = { beh: 'bestia', w: 20, h: 16, v: 20, spiky: () => true };
  BEH.bestia = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const p = g.p; e.caza = Math.max(0, (e.caza || 0) - d); e.ruge = Math.max(0, (e.ruge || 0) - d);
    if (!e.caza && Math.abs(toP) < 150 && Math.abs(p.y - e.y) < 40 && (e.calma || 0) <= 0) { e.caza = 4.5; e.ruge = .6; g.shake = Math.max(g.shake || 0, .12); }
    e.calma = Math.max(0, (e.calma || 0) - d);
    if (e.ruge > 0) return;
    if (e.caza > 0) { e.dir = Math.sign(toP) || e.dir; e.corre = avanzaHasta(e, d, 92); if (!e.corre) e.ruge = .4; if (e.caza <= d) e.calma = 2; return; }
    e.corre = false; const lejos = e.x - e.hx; if (Math.abs(lejos) > 40) e.dir = -Math.sign(lejos); if (!avanzaHasta(e, d, e.v)) e.dir *= -1;
  };
  // guardián de Chicanná: tira dardos hacia donde mira y tarda en voltear; por la espalda se le puede caer encima
  FOE.guardia = { beh: 'guardia', w: 10, h: 15, v: 0, spiky: e => e.delante };
  BEH.guardia = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const p = g.p, mismo = Math.abs(p.y - e.y) < 24;
    e.delante = Math.sign(toP) === e.dir && Math.abs(toP) < 40 && mismo;
    if (Math.sign(toP) !== e.dir && Math.abs(toP) < 160) { e.voltea = (e.voltea || 0) + d; if (e.voltea > 1.4) { e.dir = -e.dir; e.voltea = 0; } } else e.voltea = 0;
    e.tt = (e.tt ?? 1.5) - d; e.apunta = e.tt < .5;
    if (e.tt <= 0) { e.tt = 2.2; if (Math.sign(toP) === e.dir && Math.abs(toP) < 170) dispara(g, { x: e.x + e.dir * 7, y: e.y - 10, vx: e.dir * 150, vy: 0, r: 1.8, dib: 'laserAlien', vida: 2.4, polvo: ['#c8a060', '#7a4a24'] }); }
  };
  OBJ.bala.dibujos.laserAlien = (c, o) => { const d = Math.sign(o.vx) || 1; c.strokeStyle = '#7a4a24'; c.lineWidth = .8; c.beginPath(); c.moveTo(o.x - d * 8, o.y); c.lineTo(o.x, o.y); c.stroke(); c.fillStyle = '#1a1420'; c.beginPath(); c.moveTo(o.x, o.y - 1.1); c.lineTo(o.x + d * 3, o.y); c.lineTo(o.x, o.y + 1.1); c.closePath(); c.fill(); c.fillStyle = '#c8203a'; c.fillRect(o.x - d * 8 - .8, o.y - 1, 1.6, 2); };
  // teletransportador: dos plataformas hermanas; al pisar una, Itzel aparece en la otra
  OBJ.tele = {
    make(g, en) { g.objs.push({ k: 'tele', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, par: en.par, cd: 0, brillo: 0 }); },
    step(o, g, dt) {
      o.cd = Math.max(0, o.cd - dt); o.brillo = Math.max(0, o.brillo - dt * 2);
      const p = g.p; if (o.cd > 0 || !p.on || Math.abs(p.x - o.x) > 6 || Math.abs(p.y - o.y) > 3) return;
      const otro = g.objs.find(q => q.k === 'tele' && q !== o && q.par === o.par); if (!otro) return;
      spawn(g, 16, p.x, p.y - 7, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#7ff0e0', '#ffffff'] });
      p.x = otro.x; p.y = otro.y; p.vx = p.vy = 0; p.plat = null; o.cd = otro.cd = 1.2; o.brillo = otro.brillo = 1;
      spawn(g, 16, p.x, p.y - 7, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#7ff0e0', '#ffffff'] });
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, b = o.brillo, listo = o.cd <= 0;
      c.fillStyle = '#1c1826'; c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x - 6, y - 3); c.lineTo(x + 6, y - 3); c.lineTo(x + 8, y); c.closePath(); c.fill();
      c.fillStyle = '#3a2e44'; c.fillRect(x - 6, y - 3, 12, 1);
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(127,240,224,${listo ? .6 + Math.sin(f.t * 4) * .2 : .2})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y - 3, 6, 1.6, 0, 0, TAU); c.stroke();
      if (listo || b > 0) { const gr = c.createLinearGradient(0, y - 30, 0, y - 3); gr.addColorStop(0, 'rgba(127,240,224,0)'); gr.addColorStop(1, `rgba(127,240,224,${.18 + b * .5})`); c.fillStyle = gr; c.fillRect(x - 5, y - 30, 10, 27); }
      c.restore(); c.fillStyle = '#7ff0e0'; c.font = 'bold 4px monospace'; c.textAlign = 'center'; c.fillText('◇'.repeat(Math.min(3, o.par || 1)), x, y + 4.5);
    },
  };
  amplia('cinema', 190, b => {
    // I · rocas que flotan, la primera guardia y el muro imposible
    b.g(0, 13).P(3).d('T', 8);
    b.p(15, 9, 3).p(21, 8, 3, { ph: 1 }).p(27, 9, 3, { ph: 2 }).c(15, 29, 6);
    b.g(31, 48).e(36, undefined, 'babosa').e(43, undefined, 'guardia').d('T', 39);
    b.g(49, 50).g(51, 53, 2).g(54, 66).c(55, 60, 9).d('r', 63);
    // II · la bestia: corre a donde está Itzel; del otro lado del barranco no la alcanza
    b.g(67, 90).e(76, undefined, 'bestia').o('tele', 87, 0, { par: 1 }).d('r', 69);
    b.g(97, 112).o('tele', 99, 0, { par: 1 }).e(106, undefined, 'guardia').d('T', 110).c(91, 96, 7);
    // III · rocas, alacranes y el muro con teletransportadores
    b.p(115, 8, 3, { ph: .5 }).p(121, 7, 3, { ph: 1.5 }).p(127, 8, 3, { ph: 2.5 }).c(115, 129, 5);
    b.g(131, 150).e(136, undefined, 'escorpion').o('tele', 140, 0, { par: 2 }).blk(142, 3, 2, 8).o('tele', 147, 0, { par: 2 }).c(142, 143, 2);
    // IV · la última carrera contra la bestia
    b.g(151, 169).e(159, undefined, 'bestia').o('tele', 167, 0, { par: 3 }).c(170, 175, 7);
    b.g(176, 189).o('tele', 178, 0, { par: 3 }).e(183, undefined, 'guardia').h(181, 9).Gl(187).d('T', 180);
  });
  NIVELES.cinema.fauna = ['babosa', 'bestia', 'guardia', 'escorpion'];
  NIVELES.cinema.lema = 'Rocas que flotan, una bestia que te persigue hasta la orilla, guardias que tardan en voltear, muros imposibles y teletransportadores.';

  // =================================================================
  //  PLASTILINA · El taller de la alfarera (Fresita estira la plastilina)
  // =================================================================
  // ollita: da brincos hacia Itzel; los pilares de plastilina la detienen
  FOE.ollita = { beh: 'ollita', w: 12, h: 12, v: 0 };
  BEH.ollita = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.cd = (e.cd ?? 1) - d; e.agacha = e.cd < .25;
    if (e.cd <= 0 && Math.abs(toP) < 150) { e.dir = Math.sign(toP) || e.dir; e.vy = -230; e.vx = e.dir * 50; e.y -= 1; e.cd = 1.4; }
  };
  // pajarito silbato: vuela en arcos; cuando silba, la plastilina cercana se encoge a su tamaño chico
  FOE.silbato = { beh: 'silbato', w: 10, h: 8, v: 0 };
  BEH.silbato = (e, g, d) => {
    vuela(e, e.hx + Math.sin(e.t * .8) * 50, e.hy + Math.sin(e.t * 1.6) * 10 - Math.abs(Math.sin(e.t * .8)) * 8, 60, d);
    e.cd = (e.cd ?? 2.5) - d; e.silba = Math.max(0, (e.silba || 0) - d);
    if (e.cd <= 0) { e.cd = 3.5; e.silba = .6; for (const s of g.solids) if (s.k === 'clay' && g.knead !== s && Math.hypot(s.x + s.w / 2 - e.x, s.y + s.h / 2 - e.y) < 100) s.tgt = s.min; ring(g, e.x, e.y - 4, '#e8955a', 40, .5); }
  };
  // torno de alfarero: gira y arrastra a Itzel hacia un lado; cada tres segundos cambia de sentido
  OBJ.torno = {
    make(g, en) { const pl = mkPlat({ k: 'static', look: 'torno', x: tx(en.x), y: tl(en.y), w: 3 * T }); g.plats.push(pl); g.objs.push({ k: 'torno', pl, t: en.off || 0 }); },
    step(o, g, dt) { o.t += dt; const pl = o.pl, s = Math.sin(o.t * Math.PI / 3); pl.giro = (pl.giro || 0) + Math.sign(s) * dt * 6; pl.avisa = Math.abs(s) < .25; if (g.p.plat === pl) g.p.x += Math.sign(s) * 55 * Math.min(1, Math.abs(s) * 3) * dt; },
    draw() {},
  };
  LOOK.torno = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, gi = pl.giro || 0;
    c.fillStyle = '#5a3a24'; c.fillRect(cx - 3, y + 6, 6, 12); c.fillStyle = '#3a2014'; c.beginPath(); c.ellipse(cx, y + 18, 9, 2.4, 0, 0, TAU); c.fill();
    const gr = c.createLinearGradient(0, y, 0, y + 6); gr.addColorStop(0, '#d89060'); gr.addColorStop(1, '#8a4a28'); c.fillStyle = gr; c.beginPath(); c.ellipse(cx, y + 3, w / 2, 3.4, 0, 0, TAU); c.fill(); c.strokeStyle = '#3a2014'; c.lineWidth = .6; c.stroke();
    c.strokeStyle = 'rgba(255,230,200,.6)'; c.lineWidth = .5; for (let k = 0; k < 4; k++) { const a = gi + k * Math.PI / 2, ex = Math.cos(a) * w / 2 * .85; if (Math.sin(a) < 0) continue; c.beginPath(); c.moveTo(cx, y + 3); c.lineTo(cx + ex, y + 3 + Math.sin(a) * 2.8); c.stroke(); }
    if (pl.avisa) { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('↻', cx, y - 3); }
  };
  amplia('barro', 190, b => {
    // I · el primer puente y la ollita brincona
    b.g(0, 13).P(3).d('T', 7).d('r', 10).d('f', 12);
    b.o('clay', 14, 11, { axis: 'x', dir: 1, min: .6, max: 8 }).c(15, 20, 9);
    b.g(21, 36).e(26, undefined, 'ollita').e(32, 5, 'silbato').d('f', 23).d('T', 31).c(24, 30, 9);
    b.o('clay', 37, 11, { axis: 'y', w: 2, min: .6, max: 5.4 });
    b.g(39, 50, 6).e(45, 6, 'ollita').c(40, 49, 4).d('T', 48);
    // II · tornos sobre el barranco
    b.p(53, 8, 3).p(58, 9, 3).c(53, 60, 5);
    b.g(63, 70).d('r', 65).o('torno', 72, 9).o('torno', 76, 9, { off: 1.5 }).c(71, 79, 7);
    b.g(80, 96).e(85, undefined, 'grumo').e(91, 4, 'silbato').d('T', 94);
    // III · el puente largo (el silbato lo encoge) y el pilar hasta la repisa
    b.o('clay', 97, 11, { axis: 'x', dir: 1, min: .6, max: 9 }).c(98, 105, 9);
    b.g(107, 120).e(112, undefined, 'ollita').e(116, 4, 'silbato').o('clay', 121, 11, { axis: 'y', w: 2, min: .6, max: 5.6 });
    b.g(123, 134, 6).c(124, 133, 4).d('r', 128);
    // IV · tornos, ollitas y el último pilar
    b.p(137, 8, 3).p(142, 9, 3).o('torno', 147, 8).c(137, 150, 6);
    b.g(152, 189).e(157, undefined, 'ollita').o('clay', 163, 11, { axis: 'y', w: 2, min: .6, max: 5 }).blk(165, 6, 2, 5).e(171, 4, 'silbato').e(176, undefined, 'grumo').h(180, 9).Gl(185).d('T', 182);
  });
  NIVELES.barro.fauna = ['grumo', 'ollita', 'silbato', 'rana'];
  NIVELES.barro.lema = 'Puentes que se estiran, pilares que suben, ollitas que brincan, pajaritos silbato que encogen la plastilina y tornos de alfarero.';

  // =================================================================
  //  AGUA · El fondo del Golfo (Fresita da burbujas de aire)
  // =================================================================
  // morena: vive en un agujero de la pared y sale a morder cuando Itzel pasa enfrente
  FOE.morena = { beh: 'morena', w: 12, h: 7, v: 0, spiky: () => true, sinSombra: true };
  BEH.morena = (e, g, d) => {
    const p = g.p; e.cd = Math.max(0, (e.cd || 0) - d); e.ft = (e.ft || 0);
    if (e.visor && !e.fase && e.cd <= 0) { e.fase = 'sale'; e.ft = 0; }   // la ficha de la enciclopedia: asoma sola
    if (!e.fase && e.cd <= 0 && Math.sign(p.x - e.hx) === e.dir && Math.abs(p.x - e.hx) < 56 && Math.abs(p.y - 6 - e.hy) < 22) { e.fase = 'sale'; e.ft = 0; }
    let ext = 0;
    if (e.fase) { e.ft += d; const k = e.ft, sale = e.visor ? 1.9 : .65; ext = k < .25 ? k / .25 : k < sale ? 1 : Math.max(0, 1 - (k - sale) / .6); if (k > sale + .6) { e.fase = null; e.cd = e.visor ? .5 : 1.4; } }   // (en la ficha del libro se queda más rato afuera)
    e.ext = ext; e.asoma = !e.fase && e.cd <= 0; e.x = e.hx + e.dir * (2 + ext * 30); e.y = ext > .05 ? e.hy + 4 : -999;
  };
  OBJ.morena = {
    make(g, en) { const dir = en.dir || -1, hx = tx(en.x) + (dir < 0 ? 0 : T), hy = tl(en.y) + 8; g.foes.push(Object.assign(MEC.mkFoe('morena', hx, -999), { hx, hy, dir })); g.objs.push({ k: 'morena', x: hx, y: hy, dir }); },
    draw(c, o, f) {
      const e = f.g.foes.find(q => q.k === 'morena' && q.hx === o.x && q.hy === o.y);
      c.fillStyle = '#05162a'; c.beginPath(); c.ellipse(o.x, o.y, 3.4, 4.4, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(169,199,227,.5)'; c.lineWidth = .6; c.stroke();
      if (e && e.asoma) { for (const dy of [-1.2, 1.2]) { c.fillStyle = '#ffe080'; c.beginPath(); c.arc(o.x + o.dir * 1.2, o.y + dy * .6 - .6, .5, 0, TAU); c.fill(); } }
      if (e && e.ext > .05) { c.strokeStyle = '#3a6a3a'; c.lineWidth = 4.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(o.x, o.y); for (let k = 1; k <= 8; k++) { const xx = o.x + (e.x - o.dir * 6 - o.x) * k / 8; c.lineTo(xx, o.y + Math.sin(f.t * 12 + k) * 1.2 * (k / 8)); } c.stroke(); c.strokeStyle = '#7aa04a'; c.lineWidth = 2.6; c.stroke(); }
    },
  };
  // pez loro: muerde y revienta las burbujas de aire de Fresita
  FOE.pezloro = { beh: 'pezloro', w: 12, h: 8, v: 0 };
  BEH.pezloro = (e, g, d) => {
    e.muerde = false;
    const bu = g.plats.filter(pl => pl.k === 'airbub' && !pl.dead && Math.abs(pl.x - e.x) < 140).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (bu) { if (vuela(e, bu.x + bu.w / 2 - e.dir * 8, bu.y + 4, 70, d) < 6) { bu.life = Math.min(bu.life ?? 6, 6) - d * 3.5; e.muerde = true; if (bu.life <= 0) spawn(g, 10, bu.x + bu.w / 2, bu.y, { v: 60, life: .5, s: 1.6, k: 'dust', cols: ['#ffffff', '#cfe3f6'] }); } return; }
    vuela(e, e.hx + Math.sin(e.t * .7) * 50, e.hy + Math.sin(e.t * 1.7) * 8, 40, d);
  };
  // almeja gigante: abre y cierra; abierta, su perla le da aire a Itzel; al cerrarse, muerde
  OBJ.almeja = {
    make(g, en) { g.objs.push({ k: 'almeja', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, t: en.off || 0 }); },
    step(o, g, dt) {
      o.t += dt; const u = o.t % 4.4; o.abre = u < 2.4 ? Math.min(1, u / .3) : u < 3.2 ? Math.max(0, 1 - (u - 2.4) / .25) : 0; o.avisa = u > 1.9 && u < 2.4;
      const p = g.p, dentro = Math.abs(p.x - o.x) < 9 && p.y > o.y - 12 && p.y <= o.y + 1;
      if (o.abre > .7 && Math.hypot(p.x - o.x, p.y - 6 - (o.y - 6)) < 14) g.air = Math.min(1, (g.air ?? 1) + dt * 1.4);
      const cierra = u > 2.4 && u < 2.7; if (cierra && dentro) MEC.hurt(g, p.x < o.x ? -1 : 1);
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, a = o.abre || 0, sh = o.avisa ? Math.sin(f.t * 40) * .4 : 0;
      c.fillStyle = '#4a6a8a'; c.beginPath(); c.ellipse(x, y - 2, 10, 3, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#123f75'; c.beginPath(); c.ellipse(x, y - 2, 9, 2.4, 0, 0, TAU); c.fill();
      if (a > .1) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 5, 10, '#ffffff', .4 * a); c.restore(); c.fillStyle = '#f4f0ff'; c.beginPath(); c.arc(x, y - 4.4, 2.2, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,200,230,.6)'; c.beginPath(); c.arc(x - .7, y - 5, .8, 0, TAU); c.fill(); }
      c.save(); c.translate(x + 9, y - 2); c.rotate(-a * 1.1 + sh);
      const g2 = c.createLinearGradient(-18, -8, 0, 0); g2.addColorStop(0, '#cfe3f6'); g2.addColorStop(1, '#6a8aaa'); c.fillStyle = g2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-9, -9, -19, 0); c.closePath(); c.fill(); c.strokeStyle = '#0b2a52'; c.lineWidth = .6; c.stroke();
      c.strokeStyle = 'rgba(11,42,82,.5)'; c.lineWidth = .4; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(-9.5, -.4); c.lineTo(-k * 3.6, -Math.sin(k / 6 * Math.PI) * 6.4); c.stroke(); }
      c.restore();
    },
  };
  amplia('agua', 190, b => {
    b.o('water', 0, 2, { x2: 189 });
    // I · el arrecife: burbujas y el primer pez loro
    b.g(0, 14).P(3).d('T', 6).d('f', 10).d('r', 13);
    b.g(15, 26, 10).e(20, 7, 'botete').d('T', 18).d('f', 24).c(16, 25, 7);
    b.g(27, 30, 4).o('respiro', 25).p(32, 8, 3).c(31, 34, 5).e(33, 5, 'pezloro');
    // II · el túnel de la corriente con su almeja y la pared de las morenas
    b.g(36, 58, 12).isl(36, 58, 0, 5).o('corriente', 36, 6, { x2: 58, y2: 11, v: -60 }).e(44, 9, 'botete').o('almeja', 51, 0).c(38, 56, 9);
    b.o('respiro', 47, 6).g(59, 74, 9).blk(66, 4, 2, 5).o('morena', 66, 7, { dir: -1 }).e(71, 6, 'pezloro').c(60, 64, 7).d('T', 62);
    // III · medusas y el arco del barco hundido
    b.p(77, 10, 3, { ph: 1 }).p(82, 9, 3, { ph: 2.5 }).c(76, 85, 5).e(80, 5, 'pezloro');
    b.g(87, 108, 11).isl(91, 98, 3, 4).o('almeja', 95, 0).blk(100, 6, 2, 5).o('morena', 100, 8, { dir: -1 }).e(104, 9, 'botete').h(106, 9).d('f', 88);
    // IV · la corriente, el paso de las morenas y el ancla
    b.o('corriente', 109, 4, { x2: 118, y2: 11, v: 45 }).c(109, 118, 8);
    b.g(119, 140, 10).o('respiro', 122).blk(127, 3, 2, 7).o('morena', 127, 6, { dir: -1 }).o('morena', 128, 8, { dir: 1 }).e(134, 7, 'pezloro');
    b.g(141, 150, 12).o('almeja', 145, 0).e(147, 9, 'botete');
    b.g(151, 189).e(158, 6, 'pezloro').blk(165, 5, 2, 6).o('morena', 165, 7, { dir: -1 }).o('almeja', 172, 0).o('respiro', 176).Gl(185).d('T', 182);
  });
  NIVELES.agua.fauna = ['botete', 'pezloro', 'morena', 'cocuyo'];
  NIVELES.agua.lema = 'Nada hasta el ancla: corrientes, morenas que salen de su agujero, peces loro que revientan las burbujas de Fresita y almejas que dan aire con su perla.';

  // =================================================================
  //  FUEGO · La muralla en llamas (el chorro de agua de Fresita)
  // =================================================================
  // pirata incendiario: avienta bombas que dejan una llamarada en el piso; el agua lo duerme
  FOE.incendiario = { beh: 'incendiario', w: 10, h: 15, v: 18, fiery: true };
  BEH.incendiario = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const p = g.p; e.cd = (e.cd ?? 2) - d; e.lanza = Math.max(0, (e.lanza || 0) - d);
    if (e.cd <= 0 && Math.abs(toP) < 150) { e.cd = 3; e.lanza = .35; e.dir = Math.sign(toP) || e.dir; const tt = .9, sx = e.x + e.dir * 5, sy = e.y - 15; g.objs.push({ k: 'bomba', x: sx, y: sy, vx: (p.x - sx) / tt, vy: ((p.y - 2 - sy) - .5 * 420 * tt * tt) / tt, t: 0 }); return; }
    if (e.lanza <= 0) walkStep(e, d, e.v);
  };
  OBJ.bomba = {
    step(o, g, dt) {
      o.t += dt; o.vy += 420 * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      if (tocaItzel(g, o.x - 2, o.y - 2, o.x + 2, o.y + 2)) { o.dead = true; MEC.hurt(g, o.vx > 0 ? 1 : -1); return; }
      if (o.y > VH + 30) { o.dead = true; return; }
      if (SOLID(o.x, o.y) || o.t > 3) { o.dead = true; const gy = Math.floor(o.y / T) * T; spawn(g, 14, o.x, gy, { v: 70, life: .5, s: 2, k: 'spark', cols: ['#ffe800', '#ff6c2f', '#3a2a2a'] }); if (SOLID(o.x, o.y)) g.objs.push({ k: 'llamarada', x0: o.x - 14, x1: o.x + 14, y: gy, t: 0 }); }
    },
    draw(c, o, f) { c.fillStyle = '#1a1414'; c.beginPath(); c.arc(o.x, o.y, 2.6, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(o.x - .8, o.y - .8, .8, 0, TAU); c.fill(); c.strokeStyle = '#8a6a4a'; c.lineWidth = .5; c.beginPath(); c.moveTo(o.x, o.y - 2.6); c.lineTo(o.x + 1, o.y - 4.4); c.stroke(); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x + 1, o.y - 4.6, 3, '#ffe800', .6 + Math.sin(f.t * 40) * .3); c.restore(); },
  };
  OBJ.llamarada = {
    step(o, g, dt) { o.t += dt; if (o.t > 4) { o.dead = true; return; } if (tocaItzel(g, o.x0 + 2, o.y - 9, o.x1 - 2, o.y + 1)) MEC.hurt(g, g.p.x < (o.x0 + o.x1) / 2 ? -1 : 1); },
    draw(c, o, f) {
      const a = Math.min(1, (4 - o.t) * 2) * Math.min(1, o.t * 6);
      c.save(); c.globalAlpha *= a; c.globalCompositeOperation = 'lighter';
      for (let x = o.x0 + 2; x < o.x1 - 1; x += 4) { const h = 5 + hash1(x | 0, Math.floor(f.t * 10)) * 6; for (const [col, k] of [['#ff6c2f', 1], ['#ffe800', .6]]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 2.2 * k, o.y); c.quadraticCurveTo(x - .6, o.y - h * k, x + Math.sin(f.t * 9 + x) * .8, o.y - h * k * 1.3); c.quadraticCurveTo(x + .6, o.y - h * k * .5, x + 2.2 * k, o.y); c.fill(); } }
      c.restore();
    },
  };
  // gólem de magma: caliente no se toca; el agua lo enfría y se vuelve piedra que se puede pisar
  FOE.magma = { beh: 'magma', w: 14, h: 14, v: 12, spiky: () => true };
  BEH.magma = (e, g, d) => { e.piedra = false; if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; } walkStep(e, d, e.v); };
  // tablón: si Itzel se queda encima, el fuego lo agarra y se cae; el agua lo apaga
  PK.tablonArde = (pl, g, d, dt) => {
    pl.fase = pl.fase || 'bien';
    if (pl.fase === 'bien') { if (pl.stood || pl.arde > 0) pl.arde = (pl.arde || 0) + dt; if (pl.arde > 2.6) { pl.fase = 'cae'; pl.vy = 0; } }
    else if (pl.fase === 'cae') { pl.vy += 600 * dt; pl.y += pl.vy * dt; if (pl.y > VH + 30) { pl.fase = 'nada'; pl.tt = 0; pl.on = false; } }
    else { pl.tt += dt; if (pl.tt > 5) { pl.fase = 'bien'; pl.on = true; pl.y = pl.y0; pl.arde = 0; } }
  };
  LOOK.tablonArde = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, a = clamp((pl.arde || 0) / 2.6, 0, 1);
    c.fillStyle = mix('#8a5a30', '#2a1410', a); c.fillRect(x, y, w, 5); c.strokeStyle = '#1a0e08'; c.lineWidth = .5; c.strokeRect(x, y, w, 5);
    c.strokeStyle = 'rgba(40,20,10,.5)'; c.lineWidth = .4; c.beginPath(); c.moveTo(x + 1, y + 2); c.lineTo(x + w - 1, y + 2.4); c.stroke();
    if (a > .05) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < w / 5; k++) { const fx = x + 2 + k * 5, h = (2 + hash1(k, Math.floor(f.t * 12)) * 4) * a; c.fillStyle = k % 2 ? '#ffe800' : '#ff6c2f'; c.beginPath(); c.moveTo(fx - 1.6, y + 1); c.quadraticCurveTo(fx, y - h * 1.4, fx + 1.6, y + 1); c.fill(); } c.restore(); }
  };
  // el agua de Fresita también enfría al gólem de magma, apaga las llamaradas, las bombas y los tablones
  const ag0 = POW.agua.click;
  POW.agua.click = function (g, x, y, c) {
    const r = ag0.call(this, g, x, y, c);
    for (const e of g.foes) if (e.k === 'magma' && e.st === 'ok' && Math.hypot(e.x - x, e.y - 7 - y) < 26) { e.st = 'glass'; e.tt = 6; e.piedra = true; e.solid = { k: 'magmaFria', x: e.x - 8, y: e.y - 14, w: 16, h: 14, on: true }; g.solids.push(e.solid); ring(g, e.x, e.y - 7, '#bfe6ff', 20, .4); }
    for (const o of g.objs) { if (o.k === 'llamarada' && x > o.x0 - 10 && x < o.x1 + 10 && Math.abs(y - o.y) < 40) o.dead = true; if (o.k === 'bomba' && Math.hypot(o.x - x, o.y - y) < 20) o.dead = true; }
    for (const pl of g.plats) if (pl.k === 'tablonArde' && pl.fase === 'bien' && x > pl.x - 10 && x < pl.x + pl.w + 10 && Math.abs(y - pl.y) < 40) pl.arde = 0;
    return r;
  };
  POW.agua.help = 'Clic: Fresita escupe agua. Enfría las brasas en piedra, tapa géiseres, apaga salamandras, piratas, llamaradas y tablones, y vuelve piedra al gólem de magma.';
  amplia('fuego', 190, b => {
    const TAB = { k: 'tablonArde', look: 'tablonArde' };
    // I · brasas, el primer pirata incendiario y los tablones que arden
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('brasas', 13, 13, { x2: 20 }).p(16, 10, 2).c(14, 19, 8);
    b.g(21, 40).e(27, undefined, 'incendiario').o('geiser', 31).e(36, undefined, 'salamandra').d('f', 23).c(22, 28, 9);
    b.o('brasas', 41, 13, { x2: 48 }).p(42, 9, 3, TAB).p(46, 9, 2, TAB).c(41, 48, 6);
    // II · el gólem de magma: enfriado, es un escalón
    b.g(49, 66).e(54, undefined, 'magma').o('geiser', 60).e(63, undefined, 'iguana').d('T', 51);
    b.o('brasas', 67, 13, { x2: 78 }).p(69, 9, 2).p(74, 8, 2).c(68, 77, 6);
    b.g(79, 96).e(84, undefined, 'incendiario').e(90, undefined, 'magma').h(87, 9).d('f', 81);
    // III · el campo de brasas: tablones y piedra de agua
    b.o('brasas', 97, 13, { x2: 110 }).p(99, 9, 2, TAB).p(104, 9, 2, TAB).p(108, 8, 2).c(98, 109, 6);
    b.g(111, 128).e(116, undefined, 'magma').o('geiser', 121).e(125, undefined, 'incendiario').d('T', 113);
    // IV · hasta la puerta de tierra
    b.o('brasas', 129, 13, { x2: 136 }).p(131, 9, 3, TAB).c(129, 136, 7);
    b.g(137, 189).e(142, undefined, 'salamandra').blk(148, 6, 2, 5).e(152, undefined, 'magma').e(160, undefined, 'incendiario').o('geiser', 166).e(172, undefined, 'magma').h(178, 9).Gl(185).d('T', 182);
  });
  NIVELES.fuego.fauna = ['salamandra', 'incendiario', 'magma', 'iguana'];
  NIVELES.fuego.lema = 'Los piratas prendieron la ciudad: piratas incendiarios, gólems de magma que el agua vuelve piedra, tablones que arden y brasas que hay que apagar.';
})();
