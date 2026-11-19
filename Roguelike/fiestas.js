'use strict';
// =====================================================================
//  FIESTAS DE CAMPECHE · niveles alternos ambientados en las tradiciones
//  Cada fiesta vive en un mundo (con su arte y el poder de Fresita de ese
//  mundo) y trae piezas propias. Cerca de su fecha real, ese mundo escoge
//  casi siempre su nivel de fiesta.
//   · hielo  → Las posadas de San Francisco (Navidad)
//   · bruma  → El Paseo de las Ánimas (Hanal Pixán)
//   · neon   → Carnaval de Campeche
//   · deco   → La Feria de San Román
// =====================================================================
const FIESTAS = [];
(function () {
  const { LOOK, PK, BEH, OBJ, POW, FOE, FD, mkPlat, walkStep, ring, tx, tl } = MEC;
  const TAU2 = Math.PI * 2;

  // ---------------------------------------------------------------
  //  piezas compartidas
  // ---------------------------------------------------------------
  // papel picado colgado entre dos postes; cada fiesta con sus colores
  OBJ.guirnalda = {
    make(g, en) { g.objs.push({ k: 'guirnalda', x0: tx(en.x) + 8, x1: tx(en.x2) + 8, y: tl(en.y), cols: en.cols || ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#9b5de5'], poste: en.poste !== false, picado: en.picado || 'flor' }); },
    draw(c, o, f) {
      const { x0, x1, y } = o, n = Math.max(3, Math.round((x1 - x0) / 9)), sag = Math.min(14, (x1 - x0) * .08);
      if (o.poste) for (const px of [x0, x1]) { const base = L.surfaceY(Math.floor(px / T), Math.max(0, Math.floor(y / T))) * T; c.fillStyle = 'rgba(40,30,25,.85)'; c.fillRect(px - .8, y - 2, 1.6, base - y + 2); }
      c.strokeStyle = 'rgba(40,30,25,.7)'; c.lineWidth = .5; c.beginPath();
      for (let i = 0; i <= 24; i++) { const u = i / 24, xx = lerp(x0, x1, u), yy = y + Math.sin(u * Math.PI) * sag; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
      for (let i = 0; i < n; i++) {
        const u = (i + .5) / n, xx = lerp(x0, x1, u), yy = y + Math.sin(u * Math.PI) * sag, sw = Math.sin(f.t * 2.2 + i * 1.7 + x0) * .18;
        c.save(); c.translate(xx, yy); c.rotate(sw); c.fillStyle = o.cols[i % o.cols.length];
        c.beginPath(); c.moveTo(-3.2, 0); c.lineTo(3.2, 0); c.lineTo(3.2, 6.2); for (let k = 0; k <= 6; k++) c.lineTo(3.2 - k * 6.4 / 6, 6.2 + (k % 2 ? 1.1 : 0)); c.closePath(); c.fill();
        // el picado: agujeritos con la forma de la fiesta
        c.fillStyle = 'rgba(255,255,255,.55)';
        if (o.picado === 'flor') { for (const [a, b] of [[0, 2.4], [-1.4, 3.6], [1.4, 3.6], [0, 4.8]]) { c.beginPath(); c.arc(a, b, .55, 0, TAU2); c.fill(); } }
        else if (o.picado === 'calavera') { c.beginPath(); c.arc(0, 2.8, 1.5, 0, TAU2); c.fill(); c.fillStyle = o.cols[i % o.cols.length]; c.fillRect(-.9, 2.4, .7, .7); c.fillRect(.2, 2.4, .7, .7); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-.8, 4.3, 1.6, .9); }
        else if (o.picado === 'estrella') { c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? .8 : 1.9, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * r, 3.2 + Math.sin(a) * r); } c.fill(); }
        else { c.fillRect(-1.8, 1.6, 3.6, .6); c.fillRect(-1.8, 3.2, 3.6, .6); c.fillRect(-1.8, 4.8, 3.6, .6); }
        c.restore();
      }
    },
  };
  // dulces que caen (colación de la piñata, pan de muerto de los altares…): se juntan como cacao
  const DULCES = {
    colacion: ['#ff8fb1', '#ffe27a', '#9fe0ff', '#ffffff'], cana: ['#c9b26a'], mandarina: ['#ff9a1f'], cacahuate: ['#c79a5a'],
    pan: ['#d9924a'], pib: ['#a8662a'], chocolate: ['#5a2e1a'], dulce: ['#ff9a1f', '#ffd23f'],
  };
  function tiraDulces(g, x, y, tipos, n) {
    for (let i = 0; i < n; i++) { const tipo = tipos[i % tipos.length]; g.objs.push({ k: 'dulce', tipo, x, y, vx: (Math.random() - .5) * 140, vy: -120 - Math.random() * 120, t: 0, col: DULCES[tipo][Math.floor(Math.random() * DULCES[tipo].length)] }); }
  }
  OBJ.dulce = {
    step(o, g, dt) {
      o.t += dt; if (o.t > 14) { o.dead = true; return; }
      if (!o.quieto) {
        o.vy = Math.min(o.vy + 700 * dt, 420); const nx = o.x + o.vx * dt, ny = o.y + o.vy * dt;
        if (SOLID(nx, o.y - 1)) o.vx = -o.vx * .4; else o.x = nx;
        if (o.vy > 0 && SOLID(o.x, ny)) { o.y = borde(o.x, ny, 'arriba'); o.vy = -o.vy * .25; o.vx *= .5; if (Math.abs(o.vy) < 30) { o.quieto = true; o.vy = 0; } } else o.y = ny;
        if (o.y > VH + 30) o.dead = true;
      }
      const p = g.p, fr = g.fre;
      if (o.t > .25 && (Math.hypot(o.x - p.x, o.y - (p.y - 6)) < 11 || Math.hypot(o.x - fr.x, o.y - fr.y) < 10)) {
        o.dead = true; RUN.coins++; spawn(g, 6, o.x, o.y, { v: 50, life: .4, s: 1.6, k: 'spark', cols: [o.col, '#ffffff'], g: 40 });
      }
    },
    draw(c, o, f) {
      const a = o.t > 12 ? (Math.floor(o.t * 8) % 2 ? .3 : 1) : 1; c.save(); c.globalAlpha = a; c.translate(o.x, o.y - 2);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 2, 2.6, .8, 0, 0, TAU2); c.fill();
      c.fillStyle = o.col;
      if (o.tipo === 'cana') { c.rotate(.5); c.fillRect(-.8, -3.5, 1.6, 7); c.fillStyle = '#8a7a3a'; c.fillRect(-.8, -1, 1.6, .5); c.fillRect(-.8, 1.5, 1.6, .5); }
      else if (o.tipo === 'mandarina') { c.beginPath(); c.arc(0, 0, 2.4, 0, TAU2); c.fill(); c.fillStyle = '#3f8a4a'; c.fillRect(-.3, -3, 1.2, 1); }
      else if (o.tipo === 'cacahuate') { c.beginPath(); c.ellipse(-1, 0, 1.5, 1.3, 0, 0, TAU2); c.ellipse(1.1, 0, 1.5, 1.3, 0, 0, TAU2); c.fill(); }
      else if (o.tipo === 'pan') { c.beginPath(); c.arc(0, 0, 2.8, Math.PI, 0); c.lineTo(2.8, .8); c.lineTo(-2.8, .8); c.fill(); c.fillStyle = '#f6e0a8'; c.fillRect(-2.2, -1.2, 4.4, .6); c.beginPath(); c.arc(0, -2.4, .8, 0, TAU2); c.fill(); }
      else if (o.tipo === 'pib') { c.fillStyle = '#3f6a2a'; c.fillRect(-3, -2, 6, 3.6); c.fillStyle = o.col; c.fillRect(-2.4, -1.4, 4.8, 2.4); c.strokeStyle = '#2a4a1a'; c.lineWidth = .4; c.strokeRect(-3, -2, 6, 3.6); }
      else if (o.tipo === 'chocolate') { c.fillRect(-1.8, -2.2, 3.6, 3.6); c.fillStyle = '#fff4e0'; c.fillRect(-2.2, -2.6, 4.4, .8); }
      else { c.beginPath(); c.arc(0, 0, 1.6, 0, TAU2); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-.8, -1, .7, .7); }
      c.restore();
    },
  };
  // la meta propia de cada nivel de fiesta
  const iniPrev = MEC.init;
  MEC.init = function (g, def, ents) { const r = iniPrev.apply(this, arguments); L.metaPinta = def && def.meta ? (ctx, x, y, t, f) => def.meta(ctx, x, y, t, f) : null; return r; };

  // =================================================================
  //  NAVIDAD · Las posadas de San Francisco (mundo de papel doblado)
  // =================================================================
  // piñata de siete picos: Itzel le pega con la cabeza al saltar; Fresita, con un clic. Tres golpes y revienta.
  const PIC = ['#d9443a', '#ffd23f', '#3f9a5a', '#ff7fb0', '#4f8fd6', '#ff9a1f', '#9b5de5'];
  OBJ.pinata = {
    make(g, en) { const ax = tx(en.x) + 8, ay = tl(en.y); g.objs.push({ k: 'pinata', ax, ay, L: en.cuerda || 26, a: 0, va: 0, golpes: 0, cd: 0, rota: false, t: Math.random() * 3 }); },
    pos(o) { return [o.ax + Math.sin(o.a) * o.L, o.ay + Math.cos(o.a) * o.L]; },
    pega(o, g, dir) {
      if (o.rota || o.cd > 0) return; o.cd = .3; o.golpes++; o.va += dir * 3.2;
      const [x, y] = OBJ.pinata.pos(o);
      spawn(g, 8, x, y, { v: 60, life: .5, s: 1.6, k: 'confetti', cols: PIC, g: 160 }); g.shake = Math.max(g.shake || 0, .08);
      if (o.golpes >= 3) { o.rota = true; tiraDulces(g, x, y + 4, ['colacion', 'colacion', 'cana', 'mandarina', 'cacahuate'], 12); spawn(g, 26, x, y, { v: 130, life: 1, s: 2.2, k: 'confetti', cols: PIC, g: 200 }); ring(g, x, y, '#ffd23f', 30, .5); if (typeof AVISOS === 'function' && !g.avisoPinata) { g.avisoPinata = true; } }
    },
    step(o, g, dt) {
      o.t += dt; o.cd -= dt; o.va += (-Math.sin(o.a) * 9 - o.va * 1.2) * dt; o.a += o.va * dt;
      if (o.rota) return;
      const [x, y] = OBJ.pinata.pos(o), p = g.p;
      if (p.vy < 0 && Math.abs(p.x - x) < 13 && p.y - p.h < y + 11 && p.y - p.h > y - 8) { p.vy = 90; OBJ.pinata.pega(o, g, p.x < x ? 1 : -1); }
    },
    onPower(o, g, x, y) { const [px, py] = OBJ.pinata.pos(o); if (Math.hypot(x - px, y - py) < 16) OBJ.pinata.pega(o, g, x < px ? 1 : -1); },
    draw(c, o, f) {
      const [x, y] = OBJ.pinata.pos(o);
      c.strokeStyle = '#6a5a4a'; c.lineWidth = .5; c.beginPath(); c.moveTo(o.ax, o.ay - 60); c.lineTo(o.ax, o.ay); c.lineTo(x, y - 6); c.stroke();
      if (o.rota) { c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(x - 4, y - 6); c.lineTo(x + 3, y - 6); c.lineTo(x + 1, y - 1); c.lineTo(x - 2, y - 3); c.fill(); return; }
      c.save(); c.translate(x, y); c.rotate(o.a * .6); c.scale(1.35, 1.35);
      // siete picos de papel doblado (cada uno con su cara clara y su cara oscura) y sus tiras
      for (let i = 0; i < 7; i++) {
        const an = -Math.PI / 2 + i * TAU2 / 7, len = 11, w = .34, col = PIC[i];
        const tx2 = Math.cos(an) * len, ty2 = Math.sin(an) * len, l1 = [Math.cos(an - w) * 4.6, Math.sin(an - w) * 4.6], l2 = [Math.cos(an + w) * 4.6, Math.sin(an + w) * 4.6];
        c.fillStyle = col; c.beginPath(); c.moveTo(l1[0], l1[1]); c.lineTo(tx2, ty2); c.lineTo(0, 0); c.fill();
        c.fillStyle = shade(col, -.22); c.beginPath(); c.moveTo(l2[0], l2[1]); c.lineTo(tx2, ty2); c.lineTo(0, 0); c.fill();
        if (i) { const sw = Math.sin(f.t * 5 + i) * 1.2; c.strokeStyle = PIC[(i + 3) % 7]; c.lineWidth = .7; c.beginPath(); c.moveTo(tx2, ty2); c.lineTo(tx2 + sw, ty2 + 5); c.moveTo(tx2, ty2); c.lineTo(tx2 - 1 + sw, ty2 + 4); c.stroke(); }
      }
      // la olla forrada de papel
      c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(0, 0, 5.2, 0, TAU2); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.6 : 3.6, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
      c.strokeStyle = 'rgba(90,106,138,.5)'; c.lineWidth = .4; c.beginPath(); c.arc(0, 0, 5.2, 0, TAU2); c.stroke();
      c.restore();
      // marcas de golpes
      for (let k = 0; k < 3; k++) { c.fillStyle = k < o.golpes ? '#d9443a' : 'rgba(90,106,138,.35)'; c.beginPath(); c.arc(x - 3 + k * 3, y + 19, .9, 0, TAU2); c.fill(); }
    },
  };
  // los peregrinos: niños con velitas, José y María en su burrito; andan despacio pidiendo posada.
  // La flama de las velas derrite los carámbanos que cuelgan encima.
  OBJ.peregrinos = {
    make(g, en) { g.objs.push({ k: 'peregrinos', x0: tx(en.x), x1: tx(en.x2), x: tx(en.x) + 4, dir: 1, t: 0, pausa: 0, canta: 0, fila: en.fila ?? 8 }); }, // caminan por la calle, debajo de los aleros
    figuras(o) { return [0, -17, -34, -52].map((d, i) => o.x + d * o.dir).map((x, i) => ({ x, y: L.surfaceY(Math.floor(x / T), o.fila) * T, i })); },
    step(o, g, dt) {
      o.t += dt;
      if (o.pausa > 0) { o.pausa -= dt; if (o.pausa <= 0) o.dir *= -1; }
      else { o.x += o.dir * 13 * dt; if (o.x > o.x1) { o.x = o.x1; o.pausa = 3.5; o.canta = 3.5; } if (o.x < o.x0) { o.x = o.x0; o.pausa = 3.5; o.canta = 3.5; } }
      o.canta = Math.max(0, o.canta - dt);
      for (const fg of OBJ.peregrinos.figuras(o)) if (fg.i !== 1) for (const e of g.foes) if (e.k === 'carambano' && !e.ic && Math.abs(e.x - fg.x) < 30 && e.y < fg.y) { e.ic = 'regrow'; e.tt = 6; e.grow = 0; spawn(g, 10, e.x, e.y - 6, { v: 40, life: .7, s: 1.6, k: 'dust', cols: ['#9fe0ff', '#ffffff'], g: 260 }); }
    },
    draw(c, o, f) {
      for (const fg of OBJ.peregrinos.figuras(o)) {
        const { x, y, i } = fg, b = Math.abs(Math.sin(o.t * 6 + i)) * (o.pausa > 0 ? 0 : 1);
        c.save(); c.translate(x, y - b); c.scale(o.dir * 1.3, 1.3);
        if (i === 1) {
          // el burrito con María (papel doblado: triángulos y facetas)
          c.fillStyle = '#9a8a7a'; c.beginPath(); c.moveTo(-8, -5); c.lineTo(6, -6); c.lineTo(7, -1); c.lineTo(-7, 0); c.fill(); c.fillStyle = '#7a6a5a'; c.fillRect(-6, -1, 1.6, 4); c.fillRect(3, -1, 1.6, 4); c.beginPath(); c.moveTo(6, -6); c.lineTo(10, -9); c.lineTo(10, -5); c.lineTo(7, -3); c.fill(); c.fillRect(8.4, -12, 1, 3.4);
          c.fillStyle = '#4f8fd6'; c.beginPath(); c.moveTo(-3, -6); c.lineTo(1, -16); c.lineTo(4, -6); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-1.6, -14); c.lineTo(1, -19); c.lineTo(3, -14); c.fill(); c.fillStyle = '#c98a5e'; c.beginPath(); c.arc(1, -15, 1.6, 0, TAU2); c.fill();
        } else {
          const capa = ['#d9443a', '#8a6a4a', '#3f9a5a', '#ff9a1f'][i];
          c.fillStyle = capa; c.beginPath(); c.moveTo(-4, 0); c.lineTo(0, -12 - (i === 2 ? 3 : 0)); c.lineTo(4, 0); c.fill();
          c.fillStyle = shade(capa, -.2); c.beginPath(); c.moveTo(0, -12 - (i === 2 ? 3 : 0)); c.lineTo(4, 0); c.lineTo(1, 0); c.fill();
          c.fillStyle = '#c98a5e'; c.beginPath(); c.arc(0, -13 - (i === 2 ? 3 : 0), 2, 0, TAU2); c.fill();
          if (i === 2) { c.strokeStyle = '#8a6a4a'; c.lineWidth = .8; c.beginPath(); c.moveTo(4, 0); c.lineTo(5, -18); c.quadraticCurveTo(7, -20, 6, -17); c.stroke(); }
          // la velita en su farolito de papel
          if (i !== 2) { c.fillStyle = '#fff6d8'; c.fillRect(3, -9, 2.4, 3.4); c.fillStyle = '#ffb02e'; c.beginPath(); c.ellipse(4.2, -10.4 - Math.sin(o.t * 12 + i) * .3, .8, 1.5, 0, 0, TAU2); c.fill(); }
        }
        c.restore();
        if (i !== 1 && i !== 2) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x + 4 * o.dir, y - 10, 1, x + 4 * o.dir, y - 10, 26); gr.addColorStop(0, 'rgba(255,190,90,.35)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); c.fillStyle = gr; c.fillRect(x - 26, y - 36, 56, 50); c.restore(); }
      }
      if (o.canta > 0) { const x = o.x - 20 * o.dir, y = L.surfaceY(Math.floor(x / T), o.fila) * T - 30; c.font = 'italic 5.5px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.9)'; c.fillText(o.dir > 0 ? '«En nombre del cielo, os pido posada…»' : '«…pues no puede andar mi esposa amada»', x, y); c.textAlign = 'left'; }
    },
  };
  // diablito de pastorela: brinca hacia Itzel para estorbarle el camino a Belén; de un pisotón se va
  FOE.diablito = { beh: 'pounce', w: 10, h: 12, v: 20 };
  FD.diablito = (c, e, t, s) => {
    const a = Math.sin(e.anim * 9) * 1.2, salto = e.vy < 0 ? -1 : 0;
    c.fillStyle = '#1a1a2a'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(0, -10 + salto); c.lineTo(6, 0); c.fill();   // la capa
    c.fillStyle = '#d9443a'; c.beginPath(); c.moveTo(-4, 0); c.lineTo(0, -9 + salto); c.lineTo(4, 0); c.fill();
    c.fillStyle = shade('#d9443a', -.25); c.beginPath(); c.moveTo(0, -9 + salto); c.lineTo(4, 0); c.lineTo(1, 0); c.fill();
    // máscara de cartón con cuernos
    c.fillStyle = '#d9443a'; c.beginPath(); c.arc(0, -11 + salto, 3.4, 0, TAU2); c.fill();
    c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(-3, -13 + salto); c.lineTo(-4.6, -17 + salto); c.lineTo(-1.6, -14 + salto); c.fill(); c.beginPath(); c.moveTo(3, -13 + salto); c.lineTo(4.6, -17 + salto); c.lineTo(1.6, -14 + salto); c.fill();
    c.fillStyle = '#1a1a2a'; c.fillRect(-2, -12 + salto, 1.2, 1); c.fillRect(1, -12 + salto, 1.2, 1); c.fillRect(-1.6, -9.8 + salto, 3.2, .6);
    // trinche de cartón
    c.strokeStyle = '#ffd23f'; c.lineWidth = .7; c.beginPath(); c.moveTo(5, 1); c.lineTo(5 + a * .3, -14); c.moveTo(3.6, -13); c.lineTo(3.6, -15); c.moveTo(6.4, -13); c.lineTo(6.4, -15); c.moveTo(3.6, -13); c.lineTo(6.4, -13); c.stroke();
    c.fillStyle = '#1a1a2a'; c.beginPath(); c.moveTo(-1, -1); c.quadraticCurveTo(-7, 1, -6 - a, -4); c.lineWidth = .6; c.strokeStyle = '#1a1a2a'; c.stroke();
  };
  function nacimiento(ctx, x, y, t, f) {
    const g = f.g;
    // el portal de papel doblado
    ctx.fillStyle = '#c9a77a'; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 22, y - 20); ctx.lineTo(x + 22, y - 20); ctx.lineTo(x + 22, y); ctx.fill();
    ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.moveTo(x - 27, y - 18); ctx.lineTo(x, y - 34); ctx.lineTo(x + 27, y - 18); ctx.fill();
    ctx.fillStyle = shade('#8a6a4a', -.25); ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 27, y - 18); ctx.lineTo(x + 2, y - 18); ctx.fill();
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 18, y - 17, 36, 17);
    // la estrella de Belén con su cola
    const tw = .7 + Math.sin(t * 3) * .3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x, y - 48, 1, x, y - 48, 22); gr.addColorStop(0, `rgba(255,230,150,${.55 * tw})`); gr.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 22, y - 70, 44, 44); ctx.restore();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 1.8 : (k % 4 ? 4 : 6.5), a = -Math.PI / 2 + k * Math.PI / 8; ctx.lineTo(x + Math.cos(a) * r, y - 48 + Math.sin(a) * r); } ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,120,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y - 46); ctx.quadraticCurveTo(x + 16, y - 50, x + 30, y - 62); ctx.stroke();
    // María, José, el niño en su pesebre, el buey y la mula
    const fig = (fx, capa, alto) => { ctx.fillStyle = capa; ctx.beginPath(); ctx.moveTo(fx - 4, y); ctx.lineTo(fx, y - alto); ctx.lineTo(fx + 4, y); ctx.fill(); ctx.fillStyle = '#c98a5e'; ctx.beginPath(); ctx.arc(fx, y - alto - 1.6, 1.9, 0, TAU2); ctx.fill(); };
    fig(x - 9, '#4f8fd6', 11); fig(x + 9, '#8a6a4a', 13);
    ctx.fillStyle = '#e8c87a'; ctx.fillRect(x - 3.5, y - 4, 7, 4); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(x, y - 4.6, 2.6, 1.4, 0, 0, TAU2); ctx.fill(); ctx.fillStyle = '#c98a5e'; ctx.beginPath(); ctx.arc(x + 1.4, y - 5.2, .9, 0, TAU2); ctx.fill();
    ctx.fillStyle = '#a89a8a'; ctx.beginPath(); ctx.ellipse(x - 15, y - 5, 3, 2.2, 0, 0, TAU2); ctx.fill(); ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.ellipse(x + 15, y - 5, 3, 2.2, 0, 0, TAU2); ctx.fill();
    if (g && g.win) { ctx.font = 'italic 6px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.fillText('«¡Entren, santos peregrinos!»', x, y - 74); ctx.textAlign = 'left'; }
  }
  const H = NIVELES.hielo;
  nivel('posadas', {
    nombre: 'Las posadas de San Francisco', lema: 'Piñatas de siete picos, peregrinos con velitas que derriten los carámbanos y diablitos de pastorela.',
    foe: 'diablito', fauna: ['diablito', 'carambano'], power: 'tempano', iceGround: true, plat: H.plat, W: 124, fiesta: 'navidad',
    skin: Object.assign({}, H.skin, { accent: '#ffd23f' }), meta: nacimiento,
    build(b) {
      const ROJ = ['#d9443a', '#ffffff', '#3f9a5a', '#ffd23f'];
      b.g(0, 14).P(3).d('T', 8).o('guirnalda', 4, 7, { x2: 13, cols: ROJ, picado: 'estrella' });
      b.o('pinata', 11, 4, { cuerda: 34 });
      b.o('mar', 15, 12, { x2: 22 }).c(16, 21, 9);
      // la calle de los peregrinos: carámbanos colgando de los aleros y la procesión que los derrite
      b.g(23, 52).isl(27, 33, 5).isl(39, 46, 5).e(28, 7, 'carambano').e(31, 7, 'carambano').e(41, 7, 'carambano').e(44, 7, 'carambano');
      b.o('peregrinos', 24, 0, { x2: 50 }).o('guirnalda', 24, 3, { x2: 51, cols: ROJ, picado: 'estrella' }).d('f', 25).d('T', 37).c(34, 38, 9);
      b.o('pinata', 36, 1, { cuerda: 30 });
      b.o('mar', 53, 12, { x2: 64 }).p(55, 9, 3).p(60, 8, 3).c(55, 62, 6);
      b.g(65, 82).isl(70, 76, 6).e(68, undefined, 'diablito').e(79, undefined, 'diablito').d('r', 66).d('T', 81).o('pinata', 73, 1, { cuerda: 34 }).c(70, 76, 4);
      b.o('mar', 83, 12, { x2: 92 }).p(86, 9, 2).c(84, 91, 8);
      b.g(93, 123).e(99, undefined, 'diablito').isl(103, 108, 6).e(104, 8, 'carambano').e(107, 8, 'carambano');
      b.o('guirnalda', 110, 6, { x2: 121, cols: ROJ, picado: 'estrella' }).h(100, 9).Gl(116).d('f', 95).d('T', 112);
    },
  });
  (NIVELES_ALT.hielo = NIVELES_ALT.hielo || []).push('posadas');
  FIESTAS.push({ id: 'navidad', nombre: 'Navidad', nivel: 'posadas', mundo: 'hielo', hoy: d => d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 6) });

  // =================================================================
  //  HANAL PIXÁN · El Paseo de las Ánimas (mundo de niebla)
  //  En Campeche, la noche del 31 de octubre se camina del cementerio de
  //  San Román al barrio de Guadalupe con velas. Aquí Fresita prende las
  //  velas con su faro y ya no se apagan: su luz deja ver las piedras de
  //  la niebla para siempre. Los altares con todas sus velas prendidas
  //  despiertan a las ánimas, que ofrecen pan, pib y chocolate.
  // =================================================================
  const luzAntes = MEC.luzActual();
  MEC.ponLuzExtra((g, x, y) => { for (const o of g.objs || []) { if (o.k === 'vela' && o.lit && Math.hypot(o.x - x, o.y - 8 - y) < 52) return true; if (o.k === 'anima' && Math.hypot(o.x - x, o.y - y) < 30) return true; } return false; });
  OBJ.vela = {
    make(g, en) { const x = tx(en.x) + 8; g.objs.push({ k: 'vela', x, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, lit: false, t: Math.random() * 4, alto: en.alto || 7 }); },
    step(o, g, dt) {
      o.t += dt; if (o.lit) return;
      const fr = g.fre, cerca = g.lightR && Math.hypot(fr.x - o.x, fr.y - (o.y - 8)) < g.lightR * .8;
      if (cerca || luzAntes(g, o.x, o.y - 8)) { o.lit = true; ring(g, o.x, o.y - 10, '#ffb02e', 24, .5); spawn(g, 10, o.x, o.y - o.alto - 2, { v: 40, life: .6, s: 1.6, k: 'spark', cols: ['#ffd27a', '#ff9a1f', '#ffffff'], g: -40 }); }
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, h = o.alto;
      c.fillStyle = '#efe8d8'; c.fillRect(x - 1.5, y - h, 3, h); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + .5, y - h, 1, h);
      c.fillStyle = '#2a2a28'; c.fillRect(x - .3, y - h - 1.6, .6, 1.6);
      if (o.lit) {
        c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y - h - 3, 1, x, y - h - 3, 40); gr.addColorStop(0, 'rgba(255,170,70,.5)'); gr.addColorStop(.5, 'rgba(255,140,50,.14)'); gr.addColorStop(1, 'rgba(255,140,50,0)'); c.fillStyle = gr; c.fillRect(x - 40, y - h - 43, 80, 80); c.restore();
        const fl = Math.sin(o.t * 13) * .4 + Math.sin(o.t * 7.3) * .3;
        c.fillStyle = '#ff9a1f'; c.beginPath(); c.ellipse(x + fl * .4, y - h - 3.4, 1.4, 2.8, fl * .1, 0, TAU2); c.fill();
        c.fillStyle = '#fff2b0'; c.beginPath(); c.ellipse(x + fl * .3, y - h - 2.8, .6, 1.4, 0, 0, TAU2); c.fill();
      } else { const k = (Math.sin(o.t * 3) + 1) / 2; c.strokeStyle = `rgba(255,255,255,${.15 + k * .25})`; c.setLineDash([1, 1.5]); c.lineWidth = .5; c.beginPath(); c.arc(x, y - h - 4, 5 + k * 2, 0, TAU2); c.stroke(); c.setLineDash([]); }
    },
  };
  // altar de Hanal Pixán: mantel bordado, arco de flores, el pib, el chocolate, el pan y las fotos de los abuelos
  OBJ.altar = {
    make(g, en) { const x = tx(en.x) + 8; g.objs.push({ k: 'altar', x, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, listo: false, t: 0 }); },
    step(o, g, dt) {
      o.t += dt; if (o.listo) return;
      const suyas = g.objs.filter(v => v.k === 'vela' && Math.abs(v.x - o.x) < 34 && Math.abs(v.y - o.y) < 24);
      if (suyas.length && suyas.every(v => v.lit)) {
        o.listo = true; tiraDulces(g, o.x, o.y - 18, ['pan', 'pib', 'chocolate', 'dulce'], 9);
        for (let k = 0; k < 3; k++) g.objs.push({ k: 'anima', x: o.x - 10 + k * 10, y: o.y - 20, t: k, vx: 0, sube: true });
        ring(g, o.x, o.y - 20, '#ffd27a', 40, .8); if (typeof toast === 'function') toast('Las ánimas encontraron su altar');
      }
    },
    draw(c, o, f) {
      const x = o.x, y = o.y;
      // arco de palma con flores (xpujuc anaranjado y morado)
      c.strokeStyle = '#3f5a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 15, y - 12); c.quadraticCurveTo(x - 16, y - 38, x, y - 40); c.quadraticCurveTo(x + 16, y - 38, x + 15, y - 12); c.stroke();
      for (let k = 0; k <= 12; k++) { const u = k / 12, a = Math.PI - u * Math.PI, fx = x + Math.cos(a) * 15.5, fy = y - 25 - Math.sin(a) * 14; c.fillStyle = k % 3 === 1 ? '#8a3aa8' : '#ff9a1f'; c.beginPath(); c.arc(fx, fy, 1.8, 0, TAU2); c.fill(); }
      // mesa con mantel blanco bordado
      c.fillStyle = '#3a2a1a'; c.fillRect(x - 15, y - 12, 2, 12); c.fillRect(x + 13, y - 12, 2, 12);
      c.fillStyle = '#f4efe2'; c.fillRect(x - 17, y - 14, 34, 7);
      for (let k = 0; k < 8; k++) { c.fillStyle = ['#d9443a', '#3f9a5a', '#ffbf00', '#8a3aa8'][k % 4]; c.beginPath(); c.arc(x - 14 + k * 4, y - 8.8, .9, 0, TAU2); c.fill(); }
      // ofrenda: pib en hoja de plátano, jícara de chocolate, pan, foto de los abuelos y la cruz verde
      c.fillStyle = '#3f6a2a'; c.fillRect(x - 13, y - 18, 8, 4); c.fillStyle = '#a8662a'; c.fillRect(x - 12, y - 17.2, 6, 2.4);
      c.fillStyle = '#5a2e1a'; c.beginPath(); c.arc(x - 2, y - 15, 2.4, 0, Math.PI); c.fill(); c.fillStyle = '#8a5a3a'; c.fillRect(x - 4.4, y - 15.6, 4.8, .8);
      c.fillStyle = '#d9924a'; c.beginPath(); c.arc(x + 5, y - 15, 2.6, Math.PI, 0); c.fill();
      c.fillStyle = '#c8b89a'; c.fillRect(x + 9, y - 22, 5, 7); c.fillStyle = '#4a4a4a'; c.fillRect(x + 10, y - 21, 3, 5); c.fillStyle = '#c8b89a'; c.beginPath(); c.arc(x + 11.5, y - 19.6, 1, 0, TAU2); c.fill();
      c.fillStyle = '#3f9a5a'; c.fillRect(x - .6, y - 28, 1.2, 9); c.fillRect(x - 3, y - 25.6, 6, 1.2);
      if (o.listo) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y - 22, 2, x, y - 22, 34); gr.addColorStop(0, 'rgba(255,210,122,.3)'); gr.addColorStop(1, 'rgba(255,210,122,0)'); c.fillStyle = gr; c.fillRect(x - 34, y - 56, 68, 68); c.restore(); }
    },
  };
  // ánima: un alma con su velita que camina delante de Itzel; su luz deja ver las piedras de la niebla
  OBJ.anima = {
    make(g, en) { g.objs.push({ k: 'anima', x: tx(en.x) + 8, y: tl(en.y ?? 8), x1: tx(en.x2 ?? en.x + 20), t: Math.random() * 4, vx: 0 }); },
    step(o, g, dt) {
      o.t += dt; const p = g.p;
      if (o.sube) { o.y -= 26 * dt; o.x += Math.sin(o.t * 2) * 10 * dt; if (o.y < -40) o.dead = true; return; }
      // espera a Itzel; cuando la tiene cerca, avanza hasta el final de su tramo
      const lejos = o.x - p.x, quiere = lejos < 70 && o.x < o.x1 ? 22 : lejos > 130 ? -8 : 0;
      o.vx += (quiere - o.vx) * Math.min(1, dt * 2); o.x += o.vx * dt;
      // flota a la altura del camino (piedra de niebla o suelo) que tiene debajo
      let piso = L.surfaceY(Math.floor(o.x / T), 0) * T; for (const pl of g.plats) if (pl.k === 'reveal' && o.x > pl.x - 8 && o.x < pl.x + pl.w + 8) piso = Math.min(piso, pl.y);
      if (piso > VH) piso = o.y + 22; o.y += ((piso - 24 + Math.sin(o.t * 2.4) * 3) - o.y) * Math.min(1, dt * 2.5);
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, a = o.sube ? Math.max(0, Math.min(1, (o.y + 40) / 60)) : 1;
      c.save(); c.globalAlpha = a;
      c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 1, x, y, 26); gr.addColorStop(0, 'rgba(220,235,255,.32)'); gr.addColorStop(1, 'rgba(220,235,255,0)'); c.fillStyle = gr; c.fillRect(x - 26, y - 26, 52, 52);
      c.globalCompositeOperation = 'source-over';
      // el rebozo blanco que se deshace en la niebla
      c.fillStyle = 'rgba(245,248,255,.82)'; c.beginPath(); c.moveTo(x - 4, y + 7); c.quadraticCurveTo(x - 6, y - 4, x, y - 8); c.quadraticCurveTo(x + 6, y - 4, x + 4, y + 7);
      for (let k = 0; k <= 4; k++) c.lineTo(x + 4 - k * 2, y + 7 + Math.sin(f.t * 5 + k + o.t) * 1.6); c.fill();
      c.fillStyle = 'rgba(30,30,40,.7)'; c.beginPath(); c.ellipse(x, y - 3.6, 2, 2.4, 0, 0, TAU2); c.fill();
      c.fillStyle = '#efe8d8'; c.fillRect(x + 3.4, y - 1, 1.2, 4); c.fillStyle = '#ff9a1f'; c.beginPath(); c.ellipse(x + 4, y - 2.4, .7, 1.4, 0, 0, TAU2); c.fill();
      c.restore();
    },
  };
  function arcoAnimas(ctx, x, y, t, f) {
    // el arco del barrio de Guadalupe adornado: la meta del paseo
    ctx.fillStyle = '#1a1a18'; ctx.fillRect(x - 20, y - 34, 5, 34); ctx.fillRect(x + 15, y - 34, 5, 34);
    ctx.beginPath(); ctx.moveTo(x - 22, y - 34); ctx.quadraticCurveTo(x, y - 52, x + 22, y - 34); ctx.lineTo(x + 22, y - 30); ctx.quadraticCurveTo(x, y - 46, x - 22, y - 30); ctx.fill();
    for (let k = 0; k <= 16; k++) { const u = k / 16, fx = lerp(x - 21, x + 21, u), fy = y - 33 - Math.sin(u * Math.PI) * 12; ctx.fillStyle = k % 2 ? '#8a3aa8' : '#ff9a1f'; ctx.beginPath(); ctx.arc(fx, fy, 1.9, 0, TAU2); ctx.fill(); }
    for (const dx of [-17, 17]) { ctx.fillStyle = '#efe8d8'; ctx.fillRect(x + dx - 1.2, y - 6, 2.4, 6); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x + dx, y - 9, 1, x + dx, y - 9, 22); gr.addColorStop(0, 'rgba(255,170,70,.45)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = gr; ctx.fillRect(x + dx - 22, y - 31, 44, 44); ctx.restore(); ctx.fillStyle = '#ff9a1f'; ctx.beginPath(); ctx.ellipse(x + dx, y - 8, 1.1, 2.2, 0, 0, TAU2); ctx.fill(); }
    if (f.g && f.g.win) { ctx.font = 'italic 6px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd27a'; ctx.fillText('Las ánimas llegaron a casa', x, y - 58); ctx.textAlign = 'left'; }
  }
  const B = NIVELES.bruma, MOR = ['#8a3aa8', '#ff9a1f', '#f4efe2', '#d9443a', '#ffbf00'];
  nivel('animas', {
    nombre: 'El Paseo de las Ánimas', lema: 'Fresita prende las velas con su faro y su luz ya no se apaga; las ánimas caminan delante con su velita.',
    foe: 'alux', power: 'farol', light: 50, plat: B.plat, W: 128, fiesta: 'hanalpixan', skin: B.skin, meta: arcoAnimas,
    build(b) {
      b.g(0, 12).P(3).d('T', 8).o('guirnalda', 2, 6, { x2: 11, cols: MOR, picado: 'calavera' }).o('vela', 6).o('vela', 11);
      // el primer barranco: las velas de la orilla dejan ver las piedras
      b.p(14, 10, 2).p(18, 9, 2).p(22, 10, 2).c(14, 23, 7).o('anima', 12, 8, { x2: 25 });
      b.g(25, 44).e(31).e(40).o('vela', 25).o('altar', 34).o('vela', 31).o('vela', 37).d('T', 27).d('T', 43).o('guirnalda', 29, 5, { x2: 39, cols: MOR, picado: 'calavera' });
      b.o('vela', 44).p(47, 9, 2).p(51, 7, 2).p(55, 5, 2).isl(58, 64, 4).o('vela', 58, 3).o('vela', 64, 3).c(59, 63, 3).o('anima', 45, 6, { x2: 64 });
      b.p(67, 6, 2).p(71, 8, 2).p(75, 10, 2).o('anima', 65, 5, { x2: 78 });
      b.g(78, 98).e(84).e(93).o('vela', 78).o('altar', 88).o('vela', 85).o('vela', 91).d('T', 81).d('T', 96).o('guirnalda', 82, 5, { x2: 94, cols: MOR, picado: 'calavera' });
      b.o('vela', 98).p(101, 9, 2).p(105, 8, 2).p(109, 9, 2).c(101, 110, 6).o('anima', 99, 7, { x2: 112 });
      b.g(112, 127).o('vela', 112).h(115, 9).Gl(122).d('T', 118);
    },
  });
  (NIVELES_ALT.bruma = NIVELES_ALT.bruma || []).push('animas');
  FIESTAS.push({ id: 'hanalpixan', nombre: 'Hanal Pixán', nivel: 'animas', mundo: 'bruma', hoy: d => (d.getMonth() === 9 && d.getDate() >= 20) || (d.getMonth() === 10 && d.getDate() <= 5) });

  // =================================================================
  //  CARNAVAL DE CAMPECHE (mundo de neón)
  //  Carros alegóricos que recorren la calle, cañones de confeti que
  //  disparan al compás y los de la pintadera, que avientan globos de
  //  pintura: si te pintan, resbalas un ratito. Al final, Juan Carnaval.
  // =================================================================
  // carro alegórico: va y viene por su tramo de calle (se espera en cada esquina)
  PK.carro = (pl, g, d) => {
    const dist = pl.dist || 120, sp = pl.sp || 34, w = pl.espera || 1.2, T1 = dist / sp, per = 2 * (T1 + w), m = wrap(pl.t, per);
    pl.x = pl.x0 + (m < w ? 0 : m < w + T1 ? (m - w) * sp : m < 2 * w + T1 ? dist : dist - (m - 2 * w - T1) * sp);
  };
  const NEON = ['#ff2bd6', '#00e8ff', '#3dff8a', '#ffd23f', '#ff7a2b'];
  LOOK.carro = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, t = f.t, glow = (col, b) => { c.shadowColor = col; c.shadowBlur = b * f.S; };
    c.save();
    // la plataforma del carro y sus llantas
    c.fillStyle = '#14062a'; c.fillRect(x, y, w, 8); glow('#ff2bd6', 4); c.strokeStyle = '#ff2bd6'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w - 1, 7);
    glow('#00e8ff', 3); c.strokeStyle = '#00e8ff'; for (const k of [10, w - 10]) { c.beginPath(); c.arc(x + k, y + 10, 4, 0, TAU2); c.stroke(); c.beginPath(); c.moveTo(x + k, y + 10); c.lineTo(x + k + Math.cos(t * 6) * 4, y + 10 + Math.sin(t * 6) * 4); c.stroke(); }
    // la figura del carro: una guacamaya gigante de cartón con luces
    const fx = x + w * .78, fy = y - 2; glow('#3dff8a', 4); c.strokeStyle = '#3dff8a'; c.lineWidth = .9;
    c.beginPath(); c.moveTo(fx - 6, fy); c.quadraticCurveTo(fx - 9, fy - 16, fx, fy - 22); c.quadraticCurveTo(fx + 7, fy - 20, fx + 6, fy - 12); c.lineTo(fx + 10, fy - 10); c.lineTo(fx + 5, fy - 8); c.quadraticCurveTo(fx + 4, fy - 2, fx + 6, fy); c.stroke();
    glow('#ff7a2b', 4); c.strokeStyle = '#ff7a2b'; c.beginPath(); for (let k = 0; k < 5; k++) { c.moveTo(fx - 4, fy - 8 + k * 1.6); c.lineTo(fx - 14 - k * 1.6, fy - 14 + k * 3 + Math.sin(t * 4 + k) * 1.4); } c.stroke();
    c.shadowBlur = 0; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(fx + 1.5, fy - 16, .9, 0, TAU2); c.fill();
    // foquitos en la orilla que se prenden en fila
    for (let k = 0; k < w; k += 5) { const on = Math.floor(t * 8 + k / 5) % 3 === 0; c.fillStyle = on ? NEON[(k / 5) % 5 | 0] : 'rgba(255,255,255,.25)'; c.fillRect(x + k + 1, y + 3, 1.6, 1.6); }
    c.restore();
  };
  // cañón de confeti: si Itzel está encima cuando suena el compás, la avienta muy alto
  OBJ.confeti = {
    make(g, en) { const x = tx(en.x) + 8; g.objs.push({ k: 'confeti', x, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, bt: 0, tiro: 0 }); },
    step(o, g, dt) {
      o.tiro = Math.max(0, o.tiro - dt); const bt = g.beatT || 0, son = bt < o.bt; o.bt = bt;
      if (!son) return;
      o.tiro = .4; spawn(g, 18, o.x, o.y - 10, { ang: -Math.PI / 2, spread: .7, v: 220, life: 1, s: 1.8, k: 'confetti', cols: NEON, g: 260 });
      const p = g.p; if (p.on && Math.abs(p.x - o.x) < 9 && Math.abs(p.y - (o.y - 6)) < 4) { p.vy = -JUMP * 1.3; p.on = false; p.noCut = true; p.plat = null; ring(g, o.x, o.y - 8, '#ffd23f', 26, .5); }
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, g = f.g, u = (g.beatT || 0) / (g.beatAuto || 1.6), k = o.tiro > 0 ? o.tiro / .4 : 0;
      c.save(); c.shadowColor = '#ffd23f'; c.shadowBlur = 4 * f.S;
      c.fillStyle = '#14062a'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 5, y - 6); c.lineTo(x + 5, y - 6); c.lineTo(x + 7, y); c.fill();
      c.strokeStyle = '#ffd23f'; c.lineWidth = .9; c.stroke(); c.strokeStyle = '#ff2bd6'; c.beginPath(); c.moveTo(x - 4, y - 6 - k * 2); c.lineTo(x - 3, y - 11 - k * 3); c.lineTo(x + 3, y - 11 - k * 3); c.lineTo(x + 4, y - 6 - k * 2); c.stroke();
      // el aro que se cierra hasta el compás (como el de Fresita)
      c.shadowBlur = 0; c.strokeStyle = u > .85 ? '#ffffff' : 'rgba(255,210,63,.6)'; c.lineWidth = .7; c.beginPath(); c.arc(x, y - 4, 4 + 12 * (1 - u), 0, TAU2); c.stroke();
      c.restore();
    },
  };
  // flechas de neón: aquí toca que Fresita haga brincar a Itzel. Se encienden al compás y más si Itzel está cerca.
  OBJ.pista = {
    make(g, en) { g.objs.push({ k: 'pista', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T }); },
    draw(c, o, f) {
      const g = f.g, per = g.beatAuto || 1.6, t = g.beatT || 0, ya = Math.min(t, per - t) < .2, cerca = Math.abs(g.p.x - o.x) < 64;
      c.save(); c.strokeStyle = ya ? '#3dff8a' : '#ff2bd6'; c.shadowColor = c.strokeStyle; c.shadowBlur = 3 * f.S; c.lineWidth = 1.5; c.lineCap = 'round'; c.lineJoin = 'round';
      for (let k = 0; k < 3; k++) { c.globalAlpha = (cerca ? 1 : .45) * (ya ? 1 : .5 + k * .2); const y = o.y - 7 - k * 6; c.beginPath(); c.moveTo(o.x - 6, y + 3); c.lineTo(o.x, y - 2); c.lineTo(o.x + 6, y + 3); c.stroke(); }
      c.restore();
    },
  };
  // el letrero de luces del desfile: explica la regla del nivel sin detener el juego
  OBJ.letrero = {
    make(g, en) { g.objs.push({ k: 'letrero', x: tx(en.x), y: en.y * T }); },
    draw(c, o, f) {
      c.save(); c.textAlign = 'center'; c.shadowColor = '#ff2bd6'; c.shadowBlur = 4 * f.S;
      c.font = '800 13px "Alegreya Sans", sans-serif'; c.fillStyle = '#ffffff'; c.fillText('Itzel no brinca sola', o.x, o.y);
      c.font = '700 9.5px "Alegreya Sans", sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Fresita le da el brinco: clic cuando el aro se cierre', o.x, o.y + 12);
      c.restore();
    },
  };
  // la pintadera: el martes de carnaval se avientan pintura; aquí con globos. Si te pinta, resbalas.
  OBJ.globo = {
    step(o, g, dt) {
      o.vy += 500 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.t = (o.t || 0) + dt;
      const p = g.p;
      if (Math.abs(p.x - o.x) < 7 && o.y > p.y - p.h - 2 && o.y < p.y + 2) { o.dead = true; g.pintura = 3.2; g.colPintura = o.col; spawn(g, 16, o.x, o.y, { v: 90, life: .5, s: 2, k: 'dust', cols: [o.col, '#ffffff'] }); return; }
      if (SOLID(o.x, o.y) || o.y > VH + 20) { o.dead = true; spawn(g, 12, o.x, o.y - 2, { v: 70, life: .5, s: 1.8, k: 'dust', cols: [o.col] }); if (o.y < VH) g.objs.push({ k: 'charco', x: o.x, y: borde(o.x, o.y, 'arriba'), col: o.col, t: 0 }); }
    },
    draw(c, o) { c.fillStyle = o.col; c.beginPath(); c.ellipse(o.x, o.y, 2.4, 2.8, Math.atan2(o.vy, o.vx), 0, TAU2); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(o.x - 1, o.y - 1.6, .8, .8); },
  };
  OBJ.charco = { step(o, g, dt) { o.t += dt; if (o.t > 6) o.dead = true; }, draw(c, o) { c.save(); c.globalAlpha = Math.min(1, 6 - o.t); c.fillStyle = o.col; c.beginPath(); c.ellipse(o.x, o.y - .4, 6, 1.2, 0, 0, TAU2); c.fill(); c.restore(); } };
  // controlador del carnaval: lo pintado resbala (y se le ve a Itzel)
  OBJ.carnaval = {
    make(g) { g.objs.push({ k: 'carnaval' }); },
    step(o, g, dt) { g.pintura = Math.max(0, (g.pintura || 0) - dt); },
    env(o, g, e) { if (g.pintura > 0 && g.p.on) e.ice = true; },
    front: true,
    draw(c, o, f) {
      const g = f.g; if (!(g.pintura > 0)) return; const p = g.p;
      c.save(); c.globalAlpha = Math.min(1, g.pintura); c.fillStyle = g.colPintura || '#ff2bd6';
      for (const [a, b, r] of [[-3, -10, 2.2], [2, -6, 1.8], [-1, -3, 1.5], [3, -12, 1.4]]) { c.beginPath(); c.arc(p.x + a, p.y + b, r, 0, TAU2); c.fill(); }
      c.restore();
    },
  };
  FOE.pintador = { beh: 'pintador', w: 11, h: 15, v: 14 };
  BEH.pintador = (e, g, d, toP, near) => {
    e.tt -= d;
    if (near && e.tt <= 0 && Math.abs(toP) > 18) {
      e.dir = Math.sign(toP) || 1; e.tt = 2.6; e.lanza = .35;
      const tv = .8, dx = g.p.x - e.x, dy = (g.p.y - 8) - (e.y - 14);
      g.objs.push({ k: 'globo', x: e.x + e.dir * 5, y: e.y - 14, vx: dx / tv, vy: dy / tv - 250 * tv, col: NEON[Math.floor(Math.random() * 5)] });
      return;
    }
    e.lanza = Math.max(0, (e.lanza || 0) - d);
    if (!(e.lanza > 0)) walkStep(e, d, e.v);
  };
  FD.pintador = (c, e, t, s) => {
    const a = Math.sin(e.anim * 8) * 1.4, brazo = e.lanza > 0 ? -1 : 0;
    c.save(); c.shadowColor = '#00e8ff'; c.shadowBlur = 3;
    c.strokeStyle = '#00e8ff'; c.lineWidth = .9; c.fillStyle = '#14062a';
    c.beginPath(); c.moveTo(-4, 0); c.lineTo(-3 + a * .3, -7); c.lineTo(3 - a * .3, -7); c.lineTo(4, 0); c.stroke();
    c.beginPath(); c.rect(-4, -13, 8, 6); c.fill(); c.stroke();
    c.strokeStyle = '#ff2bd6'; c.beginPath(); c.arc(0, -15.5, 2.6, 0, TAU2); c.stroke();
    c.strokeStyle = '#ffd23f'; c.beginPath(); c.moveTo(-5, -16.5); c.lineTo(5, -16.5); c.moveTo(-3, -16.5); c.lineTo(-2, -19); c.lineTo(2, -19); c.lineTo(3, -16.5); c.stroke();
    c.strokeStyle = '#3dff8a'; c.beginPath(); c.moveTo(-1.6, -15.6); c.lineTo(1.6, -15.6); c.stroke();
    c.strokeStyle = '#00e8ff'; c.beginPath(); c.moveTo(3, -12); c.lineTo(7, -12 + brazo * 6); c.stroke();
    c.fillStyle = NEON[Math.floor(t * 2) % 5]; c.beginPath(); c.arc(7.4, -12.6 + brazo * 6, 2, 0, TAU2); c.fill();
    c.restore();
  };
  function juanCarnaval(ctx, x, y, t, f) {
    const g = f.g, glow = (col) => { ctx.shadowColor = col; ctx.shadowBlur = 5 * f.S; };
    ctx.save(); ctx.lineWidth = 1.1;
    // Juan Carnaval: el muñeco de cartón sentado en su silla
    glow('#ffd23f'); ctx.strokeStyle = '#ffd23f'; ctx.strokeRect(x - 10, y - 14, 20, 14);
    glow('#ff2bd6'); ctx.strokeStyle = '#ff2bd6'; ctx.beginPath(); ctx.moveTo(x - 7, y - 14); ctx.lineTo(x - 9, y - 32); ctx.lineTo(x + 9, y - 32); ctx.lineTo(x + 7, y - 14); ctx.stroke();
    glow('#00e8ff'); ctx.strokeStyle = '#00e8ff'; ctx.beginPath(); ctx.arc(x, y - 39, 7, 0, TAU2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 16, y - 47); ctx.lineTo(x + 16, y - 47); ctx.moveTo(x - 8, y - 47); ctx.quadraticCurveTo(x, y - 60, x + 8, y - 47); ctx.stroke();
    glow('#3dff8a'); ctx.strokeStyle = '#3dff8a'; ctx.beginPath(); ctx.moveTo(x - 4, y - 36); ctx.quadraticCurveTo(x, y - 33, x + 4, y - 36); ctx.stroke();
    const br = Math.sin(t * 3) * 3; ctx.strokeStyle = '#ff2bd6'; ctx.beginPath(); ctx.moveTo(x - 9, y - 28); ctx.lineTo(x - 18, y - 34 + br); ctx.moveTo(x + 9, y - 28); ctx.lineTo(x + 18, y - 34 - br); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, y - 41, 1.4, 1.4); ctx.fillRect(x + 2, y - 41, 1.4, 1.4);
    ctx.restore();
    // al llegar: la despedida de Juan Carnaval… con cohetes de luz
    if (g && g.win) {
      const k = (g.t - g.win);
      for (let i = 0; i < 6; i++) { const ph = wrap(k * .9 + i * .37, 1.6), cx = x - 50 + i * 20, cy = y - 60 - ph * 40; if (ph < .9) { ctx.fillStyle = NEON[i % 5]; ctx.fillRect(cx, cy, 1.2, 4); } else { const r = (ph - .9) * 40; ctx.strokeStyle = NEON[i % 5]; ctx.lineWidth = .8; for (let a = 0; a < 10; a++) { const an = a / 10 * TAU2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r * .4, cy + Math.sin(an) * r * .4); ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); ctx.stroke(); } } }
      ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd23f'; ctx.fillText('¡Se fue Juan Carnaval!', x, y - 70); ctx.textAlign = 'left';
    }
  }
  const N = NIVELES.neon;
  nivel('carnaval', {
    nombre: 'Carnaval de Campeche', lema: 'Itzel no brinca sola: Fresita la hace saltar con un clic justo al compás. Súbete a los carros alegóricos y esquiva la pintadera.',
    foe: 'pintador', fauna: ['pintador', 'iguana'], power: 'pulso', sinSalto: true, beatAuto: 1.6, plat: { k: 'carro', look: 'carro' }, W: 130, fiesta: 'carnaval', skin: N.skin, meta: juanCarnaval,
    build(b) {
      b.o('carnaval', 0, 0).g(0, 13).P(3).d('T', 8).o('guirnalda', 4, 6, { x2: 13, cols: NEON, picado: 'flor' }).o('letrero', 9, 3).o('pista', 12);
      // la calle del desfile: un carro va y viene sobre el barranco
      b.p(14, 9, 5, { k: 'carro', dist: 112, sp: 30 }).c(16, 24, 6);
      b.g(23, 44).e(29, undefined, 'pintador').e(38, undefined, 'iguana').o('confeti', 28).isl(30, 36, 4).c(31, 35, 2).d('T', 42).o('guirnalda', 24, 6, { x2: 43, cols: NEON, picado: 'flor' }).o('pista', 43);
      b.p(45, 9, 4, { k: 'carro', dist: 96, sp: 36, espera: .8 }).p(48, 5, 3, { k: 'carro', dist: 70, sp: 24 }).c(46, 58, 7);
      b.g(61, 80).o('confeti', 64).o('confeti', 75).isl(67, 72, 3).c(67, 72, 1).e(70, undefined, 'pintador').d('f', 62).d('T', 78).o('pista', 79);
      b.p(81, 9, 5, { k: 'carro', dist: 104, sp: 32 }).c(83, 92, 6);
      b.g(89, 92, 6).o('confeti', 90, 6);
      b.g(94, 129).e(100, undefined, 'pintador').e(108, undefined, 'iguana').h(104, 9).o('guirnalda', 110, 6, { x2: 126, cols: NEON, picado: 'flor' }).Gl(120).d('T', 97).d('f', 113);
    },
  });
  (NIVELES_ALT.neon = NIVELES_ALT.neon || []).push('carnaval');
  // el martes de carnaval cae 47 días antes de la Pascua; la fiesta dura del viernes anterior al miércoles de ceniza
  const pascua = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f2 = Math.floor((b + 8) / 25), g2 = Math.floor((b - f2 + 1) / 3), h = (19 * a + b - d - g2 + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mes - 1, dia); };
  FIESTAS.push({ id: 'carnaval', nombre: 'Carnaval', nivel: 'carnaval', mundo: 'neon', hoy: d => { const mt = new Date(pascua(d.getFullYear()).getTime() - 47 * 864e5), dd = (d - mt) / 864e5; return dd >= -12 && dd <= 1.5; } });

  // =================================================================
  //  LA FERIA DE SAN ROMÁN (mundo art déco dorado)
  //  En septiembre, el barrio de San Román celebra al Cristo Negro con su
  //  feria: la rueda de la fortuna (Fresita la frena con su reloj) y los
  //  toritos de fuegos artificiales que corren echando chispas.
  // =================================================================
  OBJ.rueda = {
    make(g, en) {
      const cx = tx(en.x) + 8, cy = tl(en.y), R = (en.r || 4) * T, n = en.n || 6, sp = en.sp || .5, o = { k: 'rueda', cx, cy, R, n, sp, gond: [] };
      for (let i = 0; i < n; i++) { const pl = mkPlat({ k: 'move', path: 'circle', look: 'gondola', x: cx - 12, y: cy + 10, w: 24, amp: R, sp, ph: i * TAU2 / n }); o.gond.push(pl); g.plats.push(pl); }
      g.objs.push(o);
    },
    draw(c, o, f) {
      const a0 = o.gond[0].t * o.sp, { cx, cy, R } = o;
      c.save(); c.strokeStyle = '#d4af37'; c.lineWidth = 1.2;
      const pata = dx => { const bx = cx + dx, by = Math.min(VH, L.surfaceY(Math.floor(bx / T), Math.floor(cy / T)) * T); c.moveTo(cx, cy); c.lineTo(bx, by); };
      c.beginPath(); pata(-R * .55); pata(R * .55); c.stroke();
      // aros y rayos
      c.lineWidth = .8; c.beginPath(); c.arc(cx, cy, R, 0, TAU2); c.stroke(); c.beginPath(); c.arc(cx, cy, R * .62, 0, TAU2); c.stroke();
      for (let i = 0; i < o.n * 2; i++) { const a = a0 + i * Math.PI / o.n; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); }
      for (let i = 0; i < o.n * 4; i++) { const a = a0 + i * Math.PI / (o.n * 2), on = Math.floor(f.t * 5 + i) % 4 === 0; c.fillStyle = on ? '#fff3c4' : '#8a7020'; c.beginPath(); c.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, on ? 1.3 : .8, 0, TAU2); c.fill(); }
      c.fillStyle = '#0b0e14'; c.beginPath(); c.arc(cx, cy, 4, 0, TAU2); c.fill(); c.stroke();
      c.restore();
    },
  };
  LOOK.gondola = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2;
    c.strokeStyle = '#d4af37'; c.lineWidth = .8; c.beginPath(); c.moveTo(cx, y - 10); c.lineTo(cx, y - 16); c.stroke();
    c.fillStyle = '#0b0e14'; c.beginPath(); c.moveTo(x + 2, y - 10); c.lineTo(x + w - 2, y - 10); c.lineTo(x + w - 5, y - 14); c.lineTo(x + 5, y - 14); c.fill(); c.stroke();
    c.fillStyle = '#d4af37'; c.fillRect(x, y, w, 2.4); c.fillStyle = '#0b0e14'; c.fillRect(x + 1, y + 2.4, w - 2, 5); c.strokeRect(x + 1, y + 2.4, w - 2, 5);
    c.strokeStyle = 'rgba(212,175,55,.6)'; c.beginPath(); c.moveTo(x + 2, y); c.lineTo(x + 2, y - 10); c.moveTo(x + w - 2, y); c.lineTo(x + w - 2, y - 10); c.stroke();
    for (let k = x + 4; k < x + w - 3; k += 4) { c.fillStyle = '#d4af37'; c.fillRect(k, y + 4, 1.4, 1.4); }
  };
  // torito: armazón de carrizo con forma de toro cargado de cohetes; corre hacia Itzel echando chispas
  FOE.torito = { beh: 'torito', w: 16, h: 14, v: 18 };
  BEH.torito = (e, g, d, toP, near) => {
    const p = g.p;
    if (e.st === 'stun') { e.tt -= d; if (e.tt <= 0) e.st = 'ok'; return; }
    if (e.st === 'run') {
      if (Math.random() < .6) spawn(g, 1, e.x - e.dir * 6, e.y - 14, { v: 70, life: .5, s: 1.4, k: 'spark', cols: ['#ffd27a', '#ffffff', '#ff9a1f'], g: 160 });
      if (!walkStep(e, d, 110)) { e.st = 'stun'; e.tt = 1.4; g.shake = Math.max(g.shake || 0, .12); } return;
    }
    if (near && Math.abs(p.y - e.y) < 18 && Math.sign(toP) === e.dir && Math.abs(toP) < 100) { e.st = 'run'; return; }
    walkStep(e, d, e.v);
  };
  FD.torito = (c, e, t, s) => {
    const corre = e.st === 'run', a = Math.sin(e.anim * (corre ? 16 : 8)) * 1.5;
    c.strokeStyle = '#efe3c8'; c.lineWidth = .9; c.beginPath(); c.moveTo(-2, 0); c.lineTo(-1 + a * .5, -6); c.moveTo(2, 0); c.lineTo(1 - a * .5, -6); c.stroke();
    c.strokeStyle = '#d4af37'; c.lineWidth = .8; c.fillStyle = 'rgba(11,14,20,.85)';
    c.beginPath(); c.moveTo(-8, -6); c.lineTo(-8, -12); c.quadraticCurveTo(0, -16, 6, -12); c.lineTo(9, -13); c.lineTo(10, -10); c.lineTo(7, -8); c.lineTo(6, -6); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(8, -13); c.quadraticCurveTo(10, -17, 12, -16); c.moveTo(8.6, -13); c.quadraticCurveTo(7, -18, 5, -18); c.stroke();
    c.beginPath(); for (let k = -6; k < 6; k += 3) { c.moveTo(k, -6); c.lineTo(k + 1.5, -12); } c.stroke();
    for (let k = 0; k < 4; k++) { const cx = -6 + k * 4; c.fillStyle = '#d9443a'; c.fillRect(cx, -16 - (k % 2), 1.4, 3); if (corre) { c.fillStyle = Math.floor(t * 20 + k) % 2 ? '#fff3c4' : '#ff9a1f'; c.beginPath(); c.arc(cx + .7, -17 - (k % 2), 1.3, 0, TAU2); c.fill(); } }
  };
  // puestos de la feria (adorno al fondo): lotería, algodones, globos
  OBJ.puesto = {
    make(g, en) { const x = tx(en.x) + 8; g.objs.push({ k: 'puesto', x, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, tipo: en.tipo || 'loteria' }); },
    draw(c, o, f) {
      const { x, y } = o; c.save();
      c.fillStyle = '#0b0e14'; c.fillRect(x - 13, y - 22, 26, 22); c.strokeStyle = '#d4af37'; c.lineWidth = .7; c.strokeRect(x - 13, y - 22, 26, 22);
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#d9443a' : '#efe3c8'; c.beginPath(); c.moveTo(x - 14 + k * 4.66, y - 22); c.lineTo(x - 14 + (k + 1) * 4.66, y - 22); c.lineTo(x - 14 + (k + .5) * 4.66, y - 26); c.fill(); }
      c.fillStyle = '#d4af37'; c.font = 'bold 4.5px Alegreya, Georgia, serif'; c.textAlign = 'center';
      if (o.tipo === 'loteria') { c.fillText('LOTERÍA', x, y - 16); for (let k = 0; k < 4; k++) { c.fillStyle = '#efe3c8'; c.fillRect(x - 10 + k * 5.4, y - 13, 4.4, 6); c.fillStyle = ['#d9443a', '#3f6aa8', '#3f9a5a', '#d4af37'][k]; c.fillRect(x - 9.4 + k * 5.4, y - 11.6, 3.2, 3); } }
      else { c.fillText('ALGODONES', x, y - 16); for (let k = 0; k < 3; k++) { c.fillStyle = ['#ff9ac8', '#9fe0ff', '#fff3c4'][k]; c.beginPath(); c.arc(x - 7 + k * 7, y - 9, 3, 0, TAU2); c.fill(); c.fillStyle = '#efe3c8'; c.fillRect(x - 7.3 + k * 7, y - 6, .6, 5); } }
      c.textAlign = 'left';
      for (let k = 0; k < 3; k++) { const gx = x + 15 + k * 3, gy = y - 30 - k * 3 + Math.sin(f.t * 2 + k) * 1.2; c.strokeStyle = 'rgba(239,227,200,.6)'; c.lineWidth = .3; c.beginPath(); c.moveTo(x + 13, y - 4); c.lineTo(gx, gy + 3); c.stroke(); c.fillStyle = ['#d9443a', '#d4af37', '#3f6aa8'][k]; c.beginPath(); c.ellipse(gx, gy, 2.2, 2.8, 0, 0, TAU2); c.fill(); }
      c.restore();
    },
  };
  function sanRoman(ctx, x, y, t, f) {
    // el templo de San Román: fachada sencilla con su torre y su cruz, en dorado
    ctx.save(); ctx.strokeStyle = '#d4af37'; ctx.fillStyle = '#0b0e14'; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.rect(x - 18, y - 30, 36, 30); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 20, y - 30); ctx.lineTo(x, y - 40); ctx.lineTo(x + 20, y - 30); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(x + 8, y - 56, 9, 26); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 7, y - 56); ctx.lineTo(x + 12.5, y - 64); ctx.lineTo(x + 18, y - 56); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 12.5, y - 64); ctx.lineTo(x + 12.5, y - 70); ctx.moveTo(x + 10.5, y - 68); ctx.lineTo(x + 14.5, y - 68); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - 10, 6, Math.PI, 0); ctx.lineTo(x + 6, y); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 6, y - 24, 2.6, 0, TAU2); ctx.stroke();
    ctx.restore();
    if (f.g && f.g.win) { for (let i = 0; i < 5; i++) { const ph = wrap((f.g.t - f.g.win) * .8 + i * .3, 1.4), cx = x - 40 + i * 20, cy = y - 70; if (ph > .5) { const r = (ph - .5) * 30; ctx.strokeStyle = ['#d4af37', '#efe3c8', '#d9443a'][i % 3]; ctx.lineWidth = .7; for (let a = 0; a < 12; a++) { const an = a / 12 * TAU2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r * .5, cy + Math.sin(an) * r * .5); ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); ctx.stroke(); } } } }
  }
  const D = NIVELES.deco;
  nivel('feria', {
    nombre: 'La Feria de San Román', lema: 'La rueda de la fortuna gira y Fresita la frena con su reloj; cuidado con los toritos de cohetes.',
    foe: 'torito', fauna: ['torito', 'automata'], power: 'reloj', plat: D.plat, W: 124, fiesta: 'sanroman', skin: D.skin, meta: sanRoman,
    build(b) {
      const ORO = ['#d4af37', '#efe3c8', '#d9443a'];
      b.g(0, 14).P(3).d('T', 8).o('puesto', 11, 0, { tipo: 'algodon' }).o('guirnalda', 2, 6, { x2: 13, cols: ORO, picado: 'flor' });
      // la rueda: se sube por una góndola y se baja del otro lado del barranco
      b.o('rueda', 20, 5, { r: 4, n: 6, sp: .55 }).c(17, 23, 1);
      b.g(26, 46).e(32, undefined, 'torito').e(42, undefined, 'automata').o('puesto', 37, 0, { tipo: 'loteria' }).d('f', 28).d('T', 45).o('guirnalda', 27, 5, { x2: 44, cols: ORO, picado: 'flor' });
      b.p(49, 9, 3).p(56, 9, 3, { amp: 30, sp: 2.8, ph: 1 }).c(48, 59, 6);
      b.g(61, 74).e(66, undefined, 'torito').o('puesto', 70, 0, { tipo: 'algodon' });
      b.o('rueda', 80, 4, { r: 4.5, n: 8, sp: .7 }).c(77, 83, 0);
      b.g(87, 123).e(93, undefined, 'torito').e(101, undefined, 'automata').o('puesto', 97, 0, { tipo: 'loteria' }).h(105, 9).o('guirnalda', 106, 6, { x2: 120, cols: ORO, picado: 'flor' }).Gl(116).d('T', 90).d('f', 110);
    },
  });
  (NIVELES_ALT.deco = NIVELES_ALT.deco || []).push('feria');
  FIESTAS.push({ id: 'sanroman', nombre: 'Feria de San Román', nivel: 'feria', mundo: 'deco', hoy: d => d.getMonth() === 8 });

  // ---------------------------------------------------------------
  //  cerca de la fecha de la fiesta, el mundo escoge su nivel de fiesta (7 de cada 10 veces)
  // ---------------------------------------------------------------
  const elegir = nivelPara;
  nivelPara = function (stId, rand, tipo) {
    const pide = typeof pedido === 'function' ? pedido('nivel') : new URLSearchParams(location.search).get('nivel');
    const hoy = new Date(), f = FIESTAS.find(q => q.mundo === stId && q.hoy(hoy)), d = f && NIVELES[f.nivel];
    if (!pide && d && (!tipo || (tipo === 'especial') === esEspecial(d)) && rand() < .7) return d; // la fiesta, si es del tipo que toca en la partida
    return elegir(stId, rand, tipo);
  };
})();
