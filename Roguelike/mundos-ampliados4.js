'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 5 (anime, nouveau, art déco, cyberpunk)
//  Cuatro actos por mundo; dos enemigos y una pieza que juegan con el
//  poder de Fresita. Los dibujos de los enemigos van en enemigos-mundos.js.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, FOE, POW, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf, surf } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const tocaItzel = (g, x0, y0, x1, y1) => { const p = g.p; return p.vis && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1; };
  const vuela = (e, tx2, ty2, sp, d) => { const dx = tx2 - e.x, dy = ty2 - e.y, dd = Math.hypot(dx, dy) || 1, k = Math.min(dd, sp * d); e.x += dx / dd * k; e.y += dy / dd * k; if (Math.abs(dx) > 1) e.dir = Math.sign(dx); return dd; };

  // =================================================================
  //  ANIME · El malecón (Fresita se vuelve sólida y Itzel se cuelga de ella)
  // =================================================================
  const resortes = (g, soloFresita) => g.plats.filter(pl => pl.k === 'bounce' && pl.on !== false && !pl.dead && (!soloFresita || pl.pw));
  // El charrán picotea a Fresita cuando está sólida (y suelta a Itzel); si no, Fresita lo espanta al acercarse.
  FOE.charran = { beh: 'charran', w: 12, h: 8, v: 0 };
  BEH.charran = (e, g, d, toP) => {
    const fr = g.fre, distancia = Math.hypot(e.x - fr.x, e.y - 5 - fr.y), solida = !!g.asid;
    if (distancia < 38 && !solida && !(e.espanto > 0)) {
      e.espanto = 2.4; e.amenaza = 0; e.objetivo = null;
      const dx = e.x - fr.x, dy = e.y - 5 - fr.y, l = Math.hypot(dx, dy) || 1;
      e.escapeX = e.x + (dx || (e.dir || 1) * 8) / l * 90; e.escapeY = e.y + dy / l * 50 - 15;
    }
    if (e.espanto > 0) { e.espanto -= d; vuela(e, e.escapeX, e.escapeY, 115, d); if (e.espanto <= 0) e.cd = 2; return; }
    e.cd = Math.max(0, (e.cd || 0) - d);
    if (solida && e.cd <= 0 && Math.abs(e.x - fr.x) < 170) {
      if (vuela(e, fr.x, fr.y - 4, 70, d) < 10) {
        e.amenaza += d;
        if (e.amenaza >= .7) {
          e.amenaza = 0; e.cd = 3; if (MEC.asideroSuelta) MEC.asideroSuelta(g, .9); fr.daze = .6;
          ring(g, fr.x, fr.y, '#ffcf65', 14, .45); spawn(g, 12, fr.x, fr.y, { v: 60, life: .6, s: 1.6, k: 'spark', cols: ['#f2b233', '#e85a4f', '#ffffff'], g: 100 });
          e.espanto = 1.8; e.escapeX = e.x + (e.x < fr.x ? -90 : 90); e.escapeY = e.y - 40;
        }
      } else e.amenaza = Math.max(0, e.amenaza - d);
      return;
    }
    e.amenaza = 0;
    vuela(e, e.hx + Math.sin(e.t * .9) * 40, e.hy + Math.sin(e.t * 2.1) * 6, 60, d);
  };
  // medusa: flota despacio y sube y baja en su sitio, estorbando el salto
  FOE.medusa = { beh: 'medusa', w: 10, h: 10, v: 0 };
  BEH.medusa = (e, g, d) => {
    vuela(e, e.hx + Math.sin(e.t * .6) * 34, e.hy + Math.sin(e.t * 1.6) * 10, 26, d); e.pulso = Math.sin(e.t * 3.2);
  };
  // globos de feria: si Itzel se sube, la llevan hacia arriba; a los 3 segundos revientan
  PK.globos = (pl, g, d, dt) => {
    pl.fase = pl.fase || 'flota';
    if (pl.fase === 'flota') { pl.y = pl.y0 + Math.sin(pl.t * 1.8) * 2; if (pl.stood) { pl.fase = 'sube'; pl.tt = 0; } }
    else if (pl.fase === 'sube') { pl.tt += dt; pl.y -= 26 * d; pl.avisa = pl.tt > 2.2; if (pl.tt > 3 || pl.y < -20) { pl.fase = 'roto'; pl.tt = 0; pl.on = false; spawn(g, 18, pl.x + pl.w / 2, pl.y - 14, { v: 90, life: .5, s: 2, k: 'confetti', cols: ['#e83a4a', '#f2a33a', '#5ab0d8', '#ffffff'], g: 200 }); } }
    else { pl.tt += dt; if (pl.tt > 4) { pl.fase = 'flota'; pl.on = true; pl.y = pl.y0; pl.avisa = false; } }
    pl.verSiempre = false;
  };
  LOOK.globos = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, sh = pl.avisa ? Math.sin(f.t * 40) * .8 : 0, cols = ['#e83a4a', '#f2a33a', '#5ab0d8', '#ff7fb0'];
    c.strokeStyle = '#2a1e2e'; c.lineWidth = .4;
    for (let k = 0; k < 4; k++) { const bx = cx + (k - 1.5) * 5 + Math.sin(f.t * 2 + k) * 1.2 + sh, by = y - 18 - (k % 2) * 4; c.beginPath(); c.moveTo(cx + (k - 1.5) * 2, y); c.lineTo(bx, by + 5); c.stroke(); c.fillStyle = cols[k]; c.beginPath(); c.ellipse(bx, by, 4, 5, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(bx - 1.4, by - 2, 1.2, 1.8, -.4, 0, TAU); c.fill(); }
    c.fillStyle = '#c8905a'; c.beginPath(); roundRect(c, x, y, w, 5, 1.6); c.fill(); c.stroke(); c.strokeStyle = 'rgba(80,50,30,.5)'; c.beginPath(); for (let k = 2; k < w; k += 3) { c.moveTo(x + k, y); c.lineTo(x + k, y + 5); } c.stroke();
  };
  amplia('anime', 190, b => {
    const GLOBO = { k: 'globos', look: 'globos' };
    // I · el primer muro del malecón: se pasa colgada de Fresita
    b.g(0, 15).P(3).d('T', 8);
    b.g(16, 26, 5).c(17, 25, 3).d('T', 22);
    b.g(27, 44).e(32, 2, 'pelicano').e(40, 4, 'charran').d('f', 30);
    b.g(45, 47).g(48, 56, 4).c(49, 55, 2);
    // II · un salto largo: Fresita sólida en medio del aire, zopilotes y globos de feria
    b.g(57, 72).e(62, 6, 'zopilote').e(68, 4, 'charran').d('T', 60);
    b.isl(80, 82, 10).p(86, 8, 2, GLOBO).c(76, 90, 5);
    b.g(91, 106).e(96, 2, 'pelicano').e(102, 6, 'zopilote').d('f', 93);
    // III · el faro del malecón: un muro alto; Fresita sólida o globos para pasar
    b.g(107, 124).p(110, 9, 2, GLOBO).blk(114, 4, 3, 7).e(120, 4, 'charran').c(114, 116, 2).d('T', 122);
    // IV · islas hasta el muelle: el hueco del medio es largo y pide colgarse
    b.isl(127, 129, 10).p(134, 8, 2, GLOBO).isl(140, 142, 9).c(131, 138, 4);
    b.g(145, 189).e(151, 6, 'zopilote').e(158, 2, 'pelicano').e(165, 4, 'charran').blk(172, 5, 2, 6).h(180, 9).Gl(186).d('T', 183);
  });
  NIVELES.anime.fauna = ['pelicano', 'charran', 'zopilote'];
  NIVELES.anime.lema = 'Mantén el clic y Fresita se vuelve sólida en el aire: cuélgate de ella y salta adonde quieras. Cuidado con los charranes, que la picotean.';

  // =================================================================
  //  NOUVEAU · Pétalos y enredaderas (Fresita siembra enredaderas)
  // =================================================================
  const hojas = g => g.plats.filter(pl => pl.pw && pl.look === 'leaf' && !pl.dead);
  // oruga: va a la enredadera de Fresita, se sube y se come las hojas
  FOE.oruga = { beh: 'oruga', w: 14, h: 6, v: 14 };
  BEH.oruga = (e, g, d) => {
    const hs = hojas(g);
    if (e.trepa) {
      const vine = hs.filter(h => Math.abs(h.vineX - e.trepa) < 2); if (!vine.length) { e.trepa = null; e.vy = 0; return; }
      const top = Math.min(...vine.map(h => h.y)); e.y = Math.max(top + 4, e.y - 18 * d); e.x = e.trepa; e.come = false;
      for (const h of vine) if (Math.abs(h.y - e.y) < 9) { h.life = Math.min(h.life, 8) - d * 4; e.come = true; }
      return;
    }
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const v = hs.find(h => Math.abs(h.vineX - e.x) < 70 && Math.abs(h.vineY - e.y) < 10);
    if (v) { e.dir = Math.sign(v.vineX - e.x) || e.dir; walkStep(e, d, 30); if (Math.abs(v.vineX - e.x) < 3) e.trepa = v.vineX; return; }
    walkStep(e, d, e.v);
  };
  // pavo real: camina; cada tanto abre su cola: el abanico lo protege y empuja a Itzel
  FOE.pavo = { beh: 'pavo', w: 14, h: 14, v: 16, spiky: e => e.abre > .5 };
  BEH.pavo = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.cd = (e.cd ?? 3) - d; e.abre = e.abre || 0;
    if (e.cola > 0) { e.cola -= d; e.abre = Math.min(1, e.abre + d * 5); const p = g.p, dx = p.x - e.x; if (e.abre > .5 && Math.abs(dx) < 34 && Math.abs(p.y - e.y) < 30) { p.vx = Math.sign(dx || e.dir) * 170; p.vy = Math.min(p.vy, -60); } return; }
    e.abre = Math.max(0, e.abre - d * 3);
    if (e.cd <= 0 && Math.abs(toP) < 110) { e.cola = 1.5; e.cd = 4; e.dir = Math.sign(toP) || e.dir; return; }
    walkStep(e, d, e.v);
  };
  // lirio: un botón cerrado que se abre (y se puede pisar) cuando la enredadera de Fresita crece cerca
  OBJ.lirio = {
    make(g, en) { const pl = mkPlat({ k: 'static', look: 'lirio', x: tx(en.x) - 4, y: tl(en.y), w: T + 8, on: false }); pl.verSiempre = true; pl.abre = 0; g.plats.push(pl); g.objs.push({ k: 'lirio', pl, vive: 0 }); },
    step(o, g, dt) {
      const pl = o.pl, cx = pl.x + pl.w / 2;
      if (hojas(g).some(h => Math.abs(h.vineX - cx) < 52)) o.vive = 6; else o.vive = Math.max(0, o.vive - dt);
      const quiere = o.vive > 0; if (quiere && !pl.on) ring(g, cx, pl.y, '#e8b0a8', 14, .3);
      pl.on = quiere || (pl.on && !freeOf(g, pl.x, pl.y - 2, pl.w, 4)); pl.abre += ((pl.on ? 1 : 0) - pl.abre) * Math.min(1, dt * 6); pl.avisa = quiere && o.vive < 1.2;
    },
    draw() {},
  };
  LOOK.lirio = (c, pl, f) => {
    const cx = pl.x + pl.w / 2, y = pl.y, a = pl.abre || 0, sh = pl.avisa ? Math.sin(f.t * 30) * .5 : 0;
    c.strokeStyle = '#4a6a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx, y + 4); c.quadraticCurveTo(cx + 3, y + 16, cx - 1, y + 30); c.stroke();
    c.fillStyle = '#5a8a3a'; c.beginPath(); c.ellipse(cx + 4, y + 14, 4, 1.4, .5, 0, TAU); c.fill();
    for (let k = 0; k < 5; k++) {
      const an = -Math.PI / 2 + (k - 2) * (.25 + a * .45) + sh * .05, L2 = 9 + a * 3;
      c.save(); c.translate(cx, y + 3); c.rotate(an + Math.PI / 2);
      c.fillStyle = k % 2 ? '#f1e6c8' : '#e8b0a8'; c.strokeStyle = '#4a3426'; c.lineWidth = .4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-3 - a * 1.4, -L2 * .5, 0, -L2); c.quadraticCurveTo(3 + a * 1.4, -L2 * .5, 0, 0); c.fill(); c.stroke(); c.restore();
    }
    if (a > .5) { c.fillStyle = '#c9a24a'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(cx + k * 1.6, y + 1 - Math.abs(k) * .4, .6, 0, TAU); c.fill(); } }
  };
  amplia('nouveau', 148, b => {
    // Entrada: camino llano para aprender a moverse y recoger fruta.
    b.g(0, 20).P(3).d('T', 5).d('f', 11).c(8, 17, 9).e(18, undefined, 'oruga');
    // Primer estanque: hojas amplias y una ruta de canisteles por encima.
    b.p(23, 10, 3, { k: 'static' }).p(28, 9, 3, { k: 'static' });
    b.c(23, 25, 8).c(28, 30, 7);
    b.g(33, 49).d('f', 36).d('T', 43).e(40, 7, 'abeja').c(35, 47, 9);
    // Terrazas de una o dos losetas; Fresita puede colocar hojas donde ayuden.
    b.g(50, 58, 9).c(51, 57, 7).g(59, 68, 7).c(60, 66, 5).e(64, undefined, 'pavo');
    b.g(69, 82, 9).c(71, 80, 7).d('f', 75);
    // Segundo estanque: pétalos flotantes con una separación legible.
    b.p(85, 10, 3, { k: 'static' }).p(90, 9, 3, { k: 'static' }).p(95, 10, 3, { k: 'static' });
    b.c(85, 87, 8).c(90, 92, 7).c(95, 97, 8).e(92, 6, 'avispa');
    b.g(100, 116).d('T', 103).e(108, undefined, 'oruga').c(102, 114, 9);
    // Jardín final, con una pequeña terraza y espacio para terminar el nivel.
    b.g(117, 126, 9).c(118, 124, 7).g(127, 147).c(129, 140, 9);
    b.d('f', 133).d('T', 143).e(136, undefined, 'pavo').h(141, 9).Gl(145);
  });
  NIVELES.nouveau.fauna = ['abeja', 'oruga', 'pavo', 'avispa'];
  NIVELES.nouveau.lema = 'Crucen el jardín entre flores y pétalos; Fresita crea hojas para ayudar a Itzel a subir y cruzar.';

  // =================================================================
  //  ART DÉCO · La relojería dorada (el reloj de arena lo hace todo lento)
  // =================================================================
  // cucú: sale disparado de su reloj de pared cada tanto, muy lejos, y regresa
  FOE.cucu = { beh: 'cucu', w: 8, h: 7, v: 0, sinSombra: true };
  BEH.cucu = (e, g, d) => {
    e.ct = (e.ct || 0) + d; const per = 3.2, u = (e.ct + (e.off || 0)) % per, L2 = e.largo || 60;
    let ext = 0; if (u > 2) { const k = u - 2; ext = k < .3 ? k / .3 : k < .7 ? 1 : Math.max(0, 1 - (k - .7) / .5); }
    e.ext = ext; e.avisa = u > 1.5 && u <= 2; e.x = e.hx + e.dir * ext * L2; e.y = ext > .02 ? e.hy : -999;
  };
  OBJ.cucu = {
    make(g, en) { const dir = en.dir || 1, cx = tx(en.x) + 8, cy = tl(en.y) + 8; const e = Object.assign(MEC.mkFoe('cucu', cx + dir * 6, -999), { hx: cx + dir * 6, hy: cy + 3, dir, largo: (en.largo || 4) * T, off: en.off || 0 }); g.foes.push(e); g.objs.push({ k: 'cucu', x: cx, y: cy, dir, e }); },
    draw(c, o, f) {
      const x = o.x, y = o.y, e = o.e;
      if (e.ext > .02) { c.strokeStyle = '#d4af37'; c.lineWidth = .8; c.beginPath(); for (let k = 0; k <= 10; k++) { const xx = x + o.dir * 5 + (e.x - x - o.dir * 5) * k / 10; c.lineTo(xx, y + 1 + (k % 2 ? -1.4 : 1.4)); } c.stroke(); }
      c.fillStyle = '#0b0e14'; c.beginPath(); c.moveTo(x - 7, y + 8); c.lineTo(x - 7, y - 4); c.lineTo(x, y - 10); c.lineTo(x + 7, y - 4); c.lineTo(x + 7, y + 8); c.closePath(); c.fill();
      c.strokeStyle = '#d4af37'; c.lineWidth = .8; c.stroke(); c.lineWidth = .4; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + k * 3, y - 4.6); c.stroke(); }
      c.fillStyle = '#efe3c8'; c.beginPath(); c.arc(x, y + 1, 4.2, 0, TAU); c.fill(); c.strokeStyle = '#0b0e14'; c.lineWidth = .4; c.stroke();
      c.lineWidth = .6; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + Math.cos(f.t * .5) * 3, y + 1 + Math.sin(f.t * .5) * 3); c.moveTo(x, y + 1); c.lineTo(x + Math.cos(f.t * 6) * 2, y + 1 + Math.sin(f.t * 6) * 2); c.stroke();
      c.fillStyle = e.avisa && Math.sin(f.t * 30) > 0 ? '#ffe9a0' : '#d4af37'; c.fillRect(x + o.dir * 5 - 1.4, y - 2, 2.8, 4);
      c.strokeStyle = '#d4af37'; c.lineWidth = .5; c.beginPath(); c.moveTo(x - 2, y + 8); c.lineTo(x - 2, y + 14 + Math.sin(f.t * 3) * 1); c.moveTo(x + 2, y + 8); c.lineTo(x + 2, y + 12 - Math.sin(f.t * 3) * 1); c.stroke();
    },
  };
  // bailarina de caja de música: gira sobre la punta (así no se le puede caer encima) y luego hace una reverencia
  FOE.bailarina = { beh: 'bailarina', w: 10, h: 14, v: 40, spiky: e => !e.reverencia };
  BEH.bailarina = (e, g, d) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.ft = (e.ft || 0) + d; const u = e.ft % 3.6; e.reverencia = u > 2.4; e.giro = (e.giro || 0) + d * (e.reverencia ? 0 : 14);
    if (!e.reverencia) walkStep(e, d, e.v);
  };
  // pistón: espera abajo, sube de golpe, se queda y baja; con el reloj de arena es fácil de tomar
  PK.piston = (pl, g, d) => {
    const A = pl.amp || 64, u = (pl.t + (pl.off || 0)) % 2.6; let k;
    if (u < .9) k = 0; else if (u < 1.05) k = (u - .9) / .15; else if (u < 1.9) k = 1; else k = Math.max(0, 1 - (u - 1.9) / .7);
    pl.y = pl.y0 - A * k; pl.avisa = u > .6 && u < .9;
  };
  LOOK.piston = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, base = VH + 40;
    const gr = c.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#8a6a20'); gr.addColorStop(.4, '#f2d27a'); gr.addColorStop(1, '#6a4a10'); c.fillStyle = gr; c.fillRect(x + 4, y + 4, w - 8, base - y);
    c.strokeStyle = '#0b0e14'; c.lineWidth = .4; for (let k = x + 6; k < x + w - 5; k += 2.2) { c.beginPath(); c.moveTo(k, y + 6); c.lineTo(k, base); c.stroke(); }
    c.fillStyle = '#0b0e14'; c.fillRect(x, y, w, 5); c.fillStyle = pl.avisa && Math.sin(f.t * 30) > 0 ? '#ffe9a0' : '#d4af37'; c.fillRect(x + 1, y + 1, w - 2, 3);
    c.fillStyle = '#0b0e14'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + w / 2 - 4 + k * 4, y + 1); c.lineTo(x + w / 2 - 2 + k * 4, y + 4); c.lineTo(x + w / 2 + k * 4, y + 1); c.fill(); }
  };
  amplia('deco', 190, b => {
    const PIST = (amp, o = {}) => Object.assign({ k: 'piston', look: 'piston', amp }, o);
    // I · plataformas rapidísimas y la primera bailarina
    b.g(0, 13).P(3).d('T', 8);
    b.p(17, 9, 3).p(24, 9, 3, { amp: 30, sp: 2.8, ph: 1 }).c(16, 27, 6);
    b.g(30, 48).e(35, undefined, 'automata').e(43, undefined, 'bailarina').d('T', 38);
    b.p(51, 8, 3, { path: 'circle', amp: 26, sp: 2.4 }).c(49, 56, 5);
    // II · el muro de los relojes: un pistón para subir; cucús que salen de cada lado
    b.g(58, 80).p(63, 10, 2, PIST(72)).blk(66, 4, 2, 7).o('cucu', 66, 7, { dir: -1 }).o('cucu', 67, 8, { dir: 1, off: 1.6 }).e(73, undefined, 'bailarina').c(66, 67, 3).d('f', 77);
    // III · tres pistones sobre el foso de engranes
    b.p(83, 10, 2, PIST(64, { off: .6 })).p(87, 10, 2, PIST(80, { off: 1.2 })).p(91, 10, 2, PIST(48)).c(83, 93, 5);
    b.g(95, 112).e(100, undefined, 'bailarina').e(107, undefined, 'automata').d('T', 97);
    // IV · la gran relojería
    b.p(115, 8, 3, { path: 'circle', amp: 26, sp: 2.4 }).p(122, 9, 3, { amp: 30, sp: 2.8 }).c(114, 126, 5);
    b.g(128, 189).blk(133, 6, 1, 5).o('cucu', 133, 8, { dir: 1 }).e(141, undefined, 'bailarina').p(148, 10, 2, PIST(72)).blk(151, 5, 3, 6).o('cucu', 151, 7, { dir: -1, off: .8 }).e(160, undefined, 'jaguar').e(168, undefined, 'bailarina').h(175, 9).Gl(184).d('T', 180);
  });
  NIVELES.deco.fauna = ['automata', 'bailarina', 'cucu', 'jaguar'];
  NIVELES.deco.lema = 'Plataformas rapidísimas, pistones de latón, cucús que salen disparados de sus relojes y bailarinas de caja de música que solo se detienen para la reverencia.';

  // =================================================================
  //  CYBERPUNK · Bandas de la ciudad (hackeo)
  // =================================================================
  // cámara de seguridad: barre con su cono; si ve a Itzel, dispara rayitos; el hackeo la apaga
  OBJ.camara = {
    make(g, en) { g.objs.push({ k: 'camara', x: tx(en.x) + 8, cy: tl(en.y) + 4, a0: en.a0 ?? 1.9, a1: en.a1 ?? 2.9, t: en.off || 0, apagada: 0, tiro: 0 }); },
    step(o, g, dt) {
      o.t += dt; o.apagada = Math.max(0, o.apagada - dt); o.ang = o.a0 + (o.a1 - o.a0) * (Math.sin(o.t * 1.1) + 1) / 2; o.ve = false;
      if (o.apagada > 0) return;
      const p = g.p, dx = p.x - o.x, dy = p.y - 8 - o.cy, dd = Math.hypot(dx, dy); let da = Math.atan2(dy, dx) - o.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      o.ve = p.vis && dd < 140 && Math.abs(da) < .24; o.tiro = Math.max(0, o.tiro - dt);
      if (o.ve && o.tiro <= 0) { o.tiro = .9; const sp = 130; g.objs.push({ k: 'bala', x: o.x, y: o.cy, vx: dx / dd * sp, vy: dy / dd * sp, r: 1.6, dib: 'laserBala', vida: 2, polvo: ['#ff2a6d', '#ffffff'] }); }
    },
    draw(c, o, f) {
      const x = o.x, y = o.cy, on = o.apagada <= 0, col = o.ve ? '255,42,109' : '5,217,232';
      if (on) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 2, x, y, 140); gr.addColorStop(0, `rgba(${col},.35)`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 140, o.ang - .24, o.ang + .24); c.closePath(); c.fill(); c.restore(); }
      c.strokeStyle = '#4a4f70'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y); c.stroke();
      c.save(); c.translate(x, y); c.rotate(o.ang); c.fillStyle = '#1c1e2e'; c.beginPath(); roundRect(c, -3, -2.6, 9, 5.2, 1.4); c.fill(); c.strokeStyle = '#4a4f70'; c.lineWidth = .5; c.stroke();
      c.fillStyle = on ? (o.ve ? '#ff2a6d' : '#05d9e8') : '#333'; c.beginPath(); c.arc(5.4, 0, 1.6, 0, TAU); c.fill(); c.restore();
      c.fillStyle = on ? (Math.floor(f.t * 2) % 2 ? '#ff2a6d' : '#5a1020') : '#222'; c.beginPath(); c.arc(x - 2, y - 4, .6, 0, TAU); c.fill();
    },
  };
  OBJ.bala.dibujos.laserBala = (c, o) => { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, 4, '#ff2a6d', .7); c.restore(); c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x - o.vx * .03, o.y - o.vy * .03); c.stroke(); };
  // rover de reparto: patrulla y embiste si ve a Itzel enfrente; hackeado, se apaga y queda como bloque
  FOE.rover = { beh: 'rover', w: 14, h: 9, v: 38 };
  BEH.rover = (e, g, d, toP) => {
    e.hack = false; if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const p = g.p, ve = Math.sign(toP) === e.dir && Math.abs(toP) < 70 && Math.abs(p.y - e.y) < 16; e.embiste = ve;
    walkStep(e, d, ve ? 95 : e.v);
  };
  // puerta láser: se prende y se apaga; prendida, no se cruza; el hackeo la apaga un rato
  OBJ.laser = {
    make(g, en) { const base = tl(en.y ?? 11); g.objs.push({ k: 'laser', x: tx(en.x) + 8, base, top: base - (en.h || 5) * T, cy: base - (en.h || 5) * T / 2, per: en.per || 3.2, t: en.off || 0, apagada: 0 }); },
    step(o, g, dt) {
      o.t += dt; o.apagada = Math.max(0, o.apagada - dt); const u = o.t % o.per; o.on = o.apagada <= 0 && u < o.per * .62; o.avisa = o.apagada <= 0 && u > o.per - .5;
      if (o.on && tocaItzel(g, o.x - 2, o.top, o.x + 2, o.base)) MEC.hurt(g, g.p.x < o.x ? -1 : 1);
    },
    draw(c, o, f) {
      const x = o.x;
      for (const [y, s] of [[o.top, 1], [o.base, -1]]) { c.fillStyle = '#1c1e2e'; c.fillRect(x - 4, s > 0 ? y - 3 : y - 1, 8, 4); c.fillStyle = o.apagada > 0 ? '#333' : '#ff2a6d'; c.fillRect(x - 1.4, s > 0 ? y : y - 2, 2.8, 2); }
      if (o.on) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,42,109,.35)'; c.fillRect(x - 3, o.top, 6, o.base - o.top); c.restore(); c.fillStyle = '#ff2a6d'; c.fillRect(x - 1, o.top, 2, o.base - o.top); c.fillStyle = '#ffffff'; c.fillRect(x - .3, o.top, .6, o.base - o.top); }
      else if (o.avisa) { c.strokeStyle = `rgba(255,42,109,${Math.sin(f.t * 30) > 0 ? .7 : .2})`; c.setLineDash([2, 3]); c.lineWidth = .6; c.beginPath(); c.moveTo(x, o.top); c.lineTo(x, o.base); c.stroke(); c.setLineDash([]); }
    },
  };
  // el hackeo también apaga cámaras y láseres y deja quietos a los rovers
  const hk0 = POW.hackeo.click;
  POW.hackeo.click = function (g, x, y, c) {
    let ok = hk0.call(this, g, x, y, c);
    for (const o of g.objs) if ((o.k === 'camara' || o.k === 'laser') && Math.hypot(o.x - x, o.cy - y) < 80) { o.apagada = 5; ok = true; }
    for (const e of g.foes) if (e.k === 'rover' && e.st === 'ok' && Math.hypot(e.x - x, e.y - 5 - y) < 60) { e.st = 'glass'; e.tt = 5; e.sinVidrio = true; e.solid = { k: 'roverOff', x: e.x - 8, y: e.y - 10, w: 16, h: 10, on: true }; g.solids.push(e.solid); ok = true; }
    return ok;
  };
  POW.hackeo.help = 'Clic: apaga drones, cámaras y láseres cercanos, deja quietos a los rovers (se pueden pisar) y voltea las bandas.';
  amplia('cyber', 190, b => {
    // I · bandas, drones y la primera cámara
    b.g(0, 12).P(3);
    b.p(13, 10, 9).c(14, 21, 8);
    b.g(23, 42).e(28, 4, 'dron').e(34, undefined, 'rover').o('camara', 40, 4, { a0: 2, a1: 2.8 }).d('T', 25);
    b.p(45, 9, 15, { v: -80 }).c(46, 59, 7).o('laser', 52, 9, { h: 3 });
    // II · el callejón de láseres
    b.g(62, 82).e(67, 3, 'dron').o('laser', 72, 11, { h: 5 }).e(77, undefined, 'rover').o('camara', 80, 3, { a0: 1.9, a1: 2.9 }).d('f', 64);
    b.p(85, 10, 10, { v: 60 }).c(86, 94, 7);
    // III · dos láseres turnados, rovers y la cámara de la azotea
    b.g(97, 120).o('laser', 102, 11, { h: 5, per: 2.2 }).o('laser', 106, 11, { h: 5, per: 2.2, off: 1.1 }).e(112, undefined, 'rover').o('camara', 118, 4, { a0: 2.1, a1: 3 }).e(116, 3, 'murcielago');
    b.p(123, 9, 8, { v: -70 }).p(133, 8, 8, { v: 70 }).c(123, 140, 6);
    // IV · hasta la antena
    b.g(143, 189).e(148, undefined, 'rover').o('camara', 152, 3, { a0: .3, a1: 1.2 }).o('laser', 158, 11, { h: 5 }).e(163, 4, 'dron').o('laser', 170, 11, { h: 5, off: 1 }).e(175, undefined, 'rover').h(179, 9).Gl(185).d('T', 182);
  });
  NIVELES.cyber.fauna = ['dron', 'rover', 'murcielago', 'avispa'];
  NIVELES.cyber.lema = 'Bandas transportadoras, drones con láser, cámaras que barren la calle, puertas láser y rovers de reparto; el hackeo de Fresita lo apaga todo un rato.';
})();
