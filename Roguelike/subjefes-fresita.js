'use strict';
// =====================================================================
//  SUBJEFES · ATAQUES DE FIRMA Y EL PUNTO DÉBIL DE FRESITA
//  Pedido de David (2026-11-21): «los subjefes están muy básicos, casi
//  todos tienen los mismos ataques… que Fresita tenga que usar su poder
//  para vencerlos».
//   · Cada subjefe tiene un tercer ataque, su firma (cinco nuevos: abanico,
//     órbita, tres saltos, cerco y tromba), que usa más a media vida.
//   · Cuando se cansa le sale un PUNTO DÉBIL que brilla con el color de su
//     mundo: Fresita tiene que tocarlo con su poder (clic encima). Sin eso,
//     Itzel no le puede caer encima. Cuando Fresita lo abre, el subjefe
//     queda aturdido un rato más.
// =====================================================================
(() => {
  if (typeof SUBJEFES === 'undefined') return;
  const { ATQ, LISTA } = SUBJEFES, { OBJ, BEH, FOE, ring } = MEC, GRAV = 1000;
  const clampX = (e, x) => clamp(x, e.ax0 + e.w / 2, e.ax1 - e.w / 2);
  const toca = (p, x0, y0, x1, y1) => p && p.vis !== false && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1;
  const duele = (g, x) => MEC.hurt(g, g.p.x < x ? -1 : 1);
  const blanco = (e, g) => e.vitrina ? e.vitrina : g.p;
  function proy(g, e, x, y, vx, vy, gr, extra) { g.objs.push(Object.assign({ k: 'sjProy', x, y, vx, vy, gr, kind: e.sj.proy || e.sj.granizo || 'piedra', col: e.sj.col, life: 3.2, rot: 0, n: Math.floor(Math.random() * 4), gy: e.gy }, extra)); }
  function golpe(e, g) { g.shake = Math.max(g.shake || 0, .2); spawn(g, 12, e.x, e.gy, { ang: -Math.PI / 2, spread: 2.6, v: 90, life: .5, s: 2.2, k: 'dust', cols: ['#ffffff', '#d8c8a8'] }); }

  // ---------------- los cinco ataques de firma ----------------
  Object.assign(ATQ, {
    // un abanico de siete tiros con UN hueco: hay que pararse justo ahí
    abanico: { av: .8, cansa: 1.3,
      aviso(e, g, d, b) { e.alza = clamp(e.ft / .8, 0, 1) * .5; e.dir = Math.sign(b.x - e.x) || e.dir; },
      ini(e, g, b) {
        e.alza = 0; const x = e.x, y = e.y - e.h * .6, a0 = Math.atan2(b.y - 8 - y, b.x - x), hueco = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < 7; i++) { if (i === hueco) continue; const a = a0 + (i - 3) * .17; proy(g, e, x, y, Math.cos(a) * 150, Math.sin(a) * 150, 0, { life: 2.4 }); }
        ring(g, x, y, '#ffffff', e.w * .7, .3);
      },
      paso: e => e.ft > .5 },
    // cosas que le dan vueltas y se abren en espiral hacia afuera
    orbita: { av: .6, cansa: 1.4, pica: true,
      ini(e, g) { for (let i = 0; i < 6; i++) g.objs.push({ k: 'sjOrbita', e, a: i / 6 * Math.PI * 2, r: e.w * .6, t: 0, kind: e.sj.proy || e.sj.granizo || 'piedra', col: e.sj.col, n: i }); },
      paso: e => e.ft > 1.9 },
    // tres brincos seguidos, cada uno hacia donde está Itzel
    triple: { av: .5, cansa: 1.7,
      aviso(e, g, d, b) { e.agacha = clamp(e.ft / .5, 0, 1); },
      ini(e, g, b) { e.agacha = 0; e.saltos = 3; brinca(e, b); },
      paso(e, g, d, b) {
        e.vy += GRAV * d; e.y += e.vy * d; e.x = clampX(e, e.x + (e.vx || 0) * d);
        if (e.y >= e.gy) { e.y = e.gy; e.vy = 0; e.vx = 0; golpe(e, g); for (const v of [-1, 1]) g.objs.push({ k: 'ondaSub', x: e.x + v * e.w * .5, y: e.gy, v: v * 120, life: .45, col: e.sj.col }); if (--e.saltos <= 0) return true; brinca(e, b); }
      } },
    // dos pilares encierran a Itzel y luego cae lluvia en medio: hay que treparse a un pilar
    cerco: { av: .5, cansa: 1.4,
      ini(e, g, b) {
        for (const k of [-1, 1]) { const x = clamp(b.x + k * 44, e.ax0 + 8, e.ax1 - 8); if (Math.abs(x - e.x) < e.w / 2 + 10) continue; g.objs.push({ k: 'sjPilar', x, gy: e.gy, t: 0, tipo: e.sj.pilar, col: e.sj.col, h: 30 }); }
        [-22, 0, 22].forEach((dx, i) => g.objs.push({ k: 'sjMarca', x: clamp(b.x + dx, e.ax0 - 30, e.ax1 + 30), gy: e.gy, t: -.55 - i * .15, cae: 1, kind: e.sj.granizo || e.sj.proy || 'piedra', col: e.sj.col }));
      },
      paso: e => e.ft > 1.8 },
    // una tromba en espiral desde su cuerpo
    tromba: { av: .8, cansa: 1.2,
      aviso(e) { e.tiembla = true; },
      ini(e) { e.tiembla = false; e.giroT = Math.random() * 6; e.emite = 0; },
      paso(e, g, d) {
        e.emite -= d; e.giro += d * 6;
        if (e.emite <= 0 && e.ft < 1.3) { e.emite = .085; e.giroT += .55; const x = e.x, y = e.y - e.h * .55; proy(g, e, x, y, Math.cos(e.giroT) * 95, Math.sin(e.giroT) * 95, 0, { life: 2.6 }); }
        return e.ft > 1.4;
      } },
  });
  function brinca(e, b) { const Tt = .62; e.tx = clampX(e, b.x); e.vy = -.5 * GRAV * Tt; e.vx = (e.tx - e.x) / Tt; e.y = Math.min(e.y, e.gy) - 1; e.dir = Math.sign(b.x - e.x) || e.dir; e.hunde = 0; }
  OBJ.sjOrbita = {
    step(o, g, dt) {
      const e = o.e; o.t += dt; o.a += dt * (2.6 - o.t * .6); o.r += dt * 34;
      o.x = e.x + Math.cos(o.a) * o.r; o.y = e.y - e.h * .5 + Math.sin(o.a) * o.r * .75;
      if (toca(g.p, o.x - 3, o.y - 3, o.x + 3, o.y + 3)) { duele(g, o.x); o.dead = true; }
      if (o.t > 2.2 || !g.foes.includes(e)) o.dead = true;
    },
    draw(c, o, f) { const P = (window.SUBJEFES_ARTE.PROY[o.kind] || window.SUBJEFES_ARTE.PROY.piedra); c.save(); P(c, { x: o.x, y: o.y, vx: Math.cos(o.a + 1.6), vy: Math.sin(o.a + 1.6), rot: o.t * 6, n: o.n }, f.t); c.restore(); },
  };
  const TXT = {
    abanico: s => `Su firma: un abanico de ${s.cosa || 'tiros'} con un solo hueco; hay que pararse justo ahí.`,
    orbita: s => `Su firma: le dan vueltas ${s.cosa || 'piedras'} que se abren en espiral; se esquivan entre vuelta y vuelta.`,
    triple: () => 'Su firma: tres brincos seguidos, cada uno hacia donde está Itzel; cada caída manda ondas cortas.',
    cerco: () => 'Su firma: dos pilares encierran a Itzel y luego cae lluvia en medio; hay que treparse a un pilar.',
    tromba: s => `Su firma: una tromba de ${s.cosa || 'tiros'} en espiral; se pasa por los huecos.`,
  };
  // la firma de cada uno, según su manera de pelear
  const FIRMA = { culebrina: 'abanico', sol: 'tromba', gota: 'triple', rehilete: 'orbita', mangle: 'cerco', pulpo: 'tromba', palotinte: 'abanico', reflector: 'tromba', bruma: 'orbita', escalera: 'triple', estela: 'cerco',
    garita: 'abanico', roseton: 'orbita', lapiz: 'cerco', mascaron: 'triple', ola: 'triple', ceiba: 'orbita', apuntador: 'cerco', chapopote: 'triple', fauces: 'tromba', caldera: 'tromba', horno: 'abanico',
    polvorin: 'cerco', caracol: 'orbita', copo: 'tromba', tortuga: 'abanico', volcan: 'cerco', cazon: 'triple', llave: 'orbita', tapir: 'triple', tarantula: 'abanico' };
  for (const s of new Set(Object.values(LISTA))) s.firma = FIRMA[s.clave] || 'abanico';

  // ---------------- el punto débil que abre Fresita ----------------
  for (const s of new Set(Object.values(LISTA))) {
    const F = FOE['sj_' + s.clave]; if (!F) continue;
    const antes = F.spiky; F.spiky = e => (e.fase === 'cansado' && !e.abierto && !e.vitrina) ? true : antes(e);
  }
  const punto = e => ({ x: e.x, y: e.y - Math.max(10, (e.tumbada > .5 ? 12 : e.h) * .62) });
  const piensa0 = BEH.subjefe;
  BEH.subjefe = function (e, g, d) {
    const r = piensa0.call(this, e, g, d);
    if (e.fase === 'cansado') { if (!e._cans) { e._cans = true; e.abierto = false; e.durT += 1.2; } }
    else if (e._cans) { e._cans = false; e.abierto = false; }
    if (e.vitrina) e.abierto = true;   // en la enciclopedia no hay Fresita que lo abra
    if (!g._sjPunto && g.objs) { g._sjPunto = true; g.objs.push({ k: 'sjPunto' }); }
    return r;
  };
  // Fresita: un clic con ella encima del punto débil lo abre (y ese clic no gasta el poder)
  GANCHOS.en('stepFresita', previo => function (g, mouse, dt) {
    if (g && g.foes && mouse && mouse.clicks && mouse.clicks.length && g.fre && !g.fre.atrapada) {
      const e = g.foes.find(q => q.sj && q.fase === 'cansado' && !q.abierto && q.st !== 'gone');
      if (e) {
        const P = punto(e), cerca = Math.hypot(g.fre.x - P.x, g.fre.y - P.y) < 26;
        const i = mouse.clicks.findIndex(c => !c.up && c.b !== 2);
        if (cerca && i >= 0) {
          mouse.clicks.splice(i, 1); e.abierto = true; e.durT += 1.4;
          ring(g, P.x, P.y, e.sj.col[2] || '#ffffff', 26, .5); spawn(g, 20, P.x, P.y, { v: 90, life: .6, s: 2, k: 'spark', cols: [e.sj.col[2] || '#ffffff', '#ffffff', '#ffe27a'] });
          g.shake = Math.max(g.shake || 0, .15);
          if (typeof SONIDO !== 'undefined' && SONIDO.fx) try { SONIDO.fx('poder'); } catch (er) { /* sin sonido */ }
          if (typeof toast === 'function' && !g.avisoAbierto) { g.avisoAbierto = 1; toast('¡Fresita abrió su punto débil! Itzel, cáele encima', 2400); }
        }
      }
    }
    return previo.apply(this, arguments);
  });
  OBJ.sjPunto = {
    front: true,
    step() {},
    draw(c, o, f) {
      const g = f.g && f.g.foes ? f.g : (typeof CUR !== 'undefined' ? CUR : null); if (!g || !g.foes) return;
      for (const e of g.foes) {
        if (!e.sj || e.fase !== 'cansado' || e.st === 'gone' || e.vitrina) continue;
        const P = punto(e), col = e.sj.col[2] || '#ffffff', t = f.t, ab = e.abierto;
        c.save();
        if (!ab) {
          // la marca que hay que tocar: un rombo que late con la luz del mundo
          const k = .6 + .4 * Math.abs(Math.sin(t * 6)), r = 7 + k * 2;
          c.globalCompositeOperation = 'lighter'; glowDot(c, P.x, P.y, 18, col, .45 * k); c.globalCompositeOperation = 'source-over';
          c.strokeStyle = col; c.lineWidth = 1.4; c.beginPath(); c.moveTo(P.x, P.y - r); c.lineTo(P.x + r, P.y); c.lineTo(P.x, P.y + r); c.lineTo(P.x - r, P.y); c.closePath(); c.stroke();
          c.fillStyle = '#ffffff'; c.beginPath(); c.arc(P.x, P.y, 2 + k, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .7; c.beginPath(); c.arc(P.x, P.y, 13 + (t * 20 % 8), 0, TAU); c.stroke();
          c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.lineWidth = 2; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText('¡Fresita, aquí!', P.x, P.y - 16); c.fillStyle = '#ffffff'; c.fillText('¡Fresita, aquí!', P.x, P.y - 16);
        } else {
          // abierto: estrellitas de mareo y una flecha para caerle encima
          for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(P.x + Math.cos(a) * 10, P.y - 8 + Math.sin(a) * 3, 1.6, 0, TAU); c.fill(); }
          const y = P.y - 22 - Math.abs(Math.sin(t * 6)) * 4; c.fillStyle = '#ffe27a'; c.beginPath(); c.moveTo(P.x - 5, y); c.lineTo(P.x + 5, y); c.lineTo(P.x, y + 6); c.closePath(); c.fill();
        }
        c.restore();
      }
    },
  };
  // en la enciclopedia: su firma y lo que hace Fresita
  const fichas0 = SUBJEFES.fichas;
  SUBJEFES.fichas = function () {
    return fichas0.apply(this, arguments).map(fi => { const s = fi.subjefe; if (s && s.firma && fi.datos) fi.datos.splice(4, 0, ['Su firma', TXT[s.firma](s)], ['Fresita', 'Cuando se cansa le sale un punto débil que brilla: Fresita lo toca con su poder y solo entonces Itzel le puede caer encima.']); return fi; });
  };
})();
