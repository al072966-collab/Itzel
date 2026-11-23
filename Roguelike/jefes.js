'use strict';
// =====================================================================
//  JEFES UNIVERSALES · salen en cualquier mundo y siempre atacan igual,
//  pero se vencen con el poder de Fresita de ese mundo:
//   - poderes de ALCANCE (hacen plataformas o elevan a Itzel): el núcleo
//     se abre arriba y Fresita tiene que subir a Itzel hasta él;
//   - poderes de CONTROL: Fresita lo aturde con su poder cuando el núcleo
//     se abre y el jefe cae al suelo.
//  En los dos casos Itzel le cae encima al núcleo. Tres golpes.
// =====================================================================
const JEFES = {
  mythos: { nombre: 'Mythos', lema: 'Una máscara de piedra con un ojo, venida de otro cielo.', ataques: ['orbes', 'tentaculo', 'rayo'],
    texto: 'Una máscara de jade con un ojo y tentáculos, como las de Calakmul, que bajó por la grieta del cielo. Flota, lanza orbes de colores, azota el suelo con un tentáculo y barre el piso con un rayo. Para noquearlo Itzel tiene que agarrar la lágrima de estrella que aparece cuando descansa; con ella, Fresita lo tumba de un clic y entonces sí: Itzel le cae encima.' },
  golem: { nombre: 'El Gólem de piedra', lema: 'Pisa, avienta rocas y embiste contra las paredes.', ataques: ['pisoton', 'rocas', 'embestida'],
    texto: 'Un mascarón de estuco de Edzná que despertó. Es enorme y lento: sus pisotones mandan ondas por el suelo, avienta rocas en arco y embiste hasta chocar con la pared. El cristal de su cabeza es el núcleo.' },
  serpiente: { nombre: 'La Serpiente de nubes', lema: 'Kukulkán vuela, se lanza en picada y escupe fuego.', ataques: ['picada', 'fuego', 'cola'],
    texto: 'Kukulkán, la serpiente emplumada de los mayas. Vuela en ondas, se lanza en picada sobre Itzel, deja caer fuego y barre el suelo con la cola. La joya de su frente es el núcleo.' },
};
const PODER_ALCANCE = new Set(['bloque', 'nenufar', 'avion', 'nube', 'cristal', 'lapiz', 'resorte', 'asidero', 'semilla', 'viento', 'remolino', 'rafaga', 'cargar', 'portal', 'ladrillo', 'moldear', 'constelacion']);
const modoJefe = power => PODER_ALCANCE.has(power) ? 'alcance' : 'control';
const JEFE_EN = w => typeof TIPOS_RUN !== 'undefined' ? (typeof PRESENTACION !== 'undefined' && PRESENTACION.enCurso() ? w === 1 : w === 3) : w === 2 || w === WORLDS; // en el mundo 3 (el 4 es solo la Ruptura)

// ---------------- la arena: misma forma en todos los mundos, con las piezas que el poder necesita ----------------
function construirArena(def, tipo) {
  const b = Constructor(28);
  b.g(0, 27).g(0, 0, 0).g(27, 27, 0).P(4).isl(4, 7, 7).isl(20, 23, 7);
  const k = def.plat && def.plat.k;
  if (k && !['blink', 'seg', 'static', 'ghost', 'lift', 'swing', 'cycle'].includes(k)) b.p(11, 8, 2).p(15, 8, 2);
  if (def.power === 'ladrillo') b.c(9, 9, 8).c(12, 12, 6).c(15, 15, 6).c(18, 18, 8);
  if (def.power === 'moldear') b.o('clay', 10, 11, { axis: 'y', w: 2, min: .6, max: 6 }).o('clay', 16, 11, { axis: 'y', w: 2, min: .6, max: 6 });
  if (def.power === 'constelacion') b.o('estrella', 3, 5).o('estrella', 9, 4).o('estrella', 18, 4).o('estrella', 24, 5);
  if (def.power === 'antorcha') b.o('antorcha', 2).o('antorcha', 25);
  if (def.power === 'burbuja' || def.id === 'agua') b.o('water', 0, 2, { x2: 27 }).o('respiro', 2).o('respiro', 25);
  if (def.power === 'tempano') { b.o('mar', 11, 12, { x2: 16 }); }
  b.o('jefe', 13, 0, { tipo });
  return { rows: b.rows(), ents: b.ents };
}

(function () {
  const { OBJ, ring } = MEC;
  const FLOOR = 11 * T;
  const pal = (def) => { const s = (def && def.skin) || MEC.DEFAULT_SKIN, f = s.foe || MEC.DEFAULT_SKIN.foe; return { a: f.main, b: f.dark, c: f.light, core: s.accent || '#ff6b9a', eye: f.eye || '#ffffff', glow: s.light || s.accent || '#ffffff' }; };
  const hurtIfIn = (g, x0, y0, x1, y1) => { const p = g.p; if (p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1) MEC.hurt(g, p.x < (x0 + x1) / 2 ? -1 : 1); };

  // posición del núcleo según el estado
  function core(o) {
    if (CORE[o.tipo]) return CORE[o.tipo](o);
    if (o.tipo === 'mythos') return o.stunT > 0 ? { x: o.x, y: o.y - 19, r: 12 } : { x: o.x, y: o.y + 2, r: 9 };
    if (o.tipo === 'golem') return { x: o.x + o.face * 2, y: FLOOR - o.hgt + 6, r: 8 };
    const h = o.seg[0]; return { x: h.x, y: h.y - 3, r: 8 };
  }
  // ¿hay algo encima del núcleo que no deje caerle encima? (bloques, islas, plataformas, sólidos de los poderes)
  function tapado(g, x, y) {
    // abajo tiene que haber piso (o un puente) para que Itzel llegue: nada de quedar sobre un hueco
    if (!SOLID(x - 5, FLOOR + 4) || !SOLID(x + 5, FLOOR + 4)) { const puente = (g.plats || []).concat(g.solids || []).some(q => q.on !== false && !q.dead && q.x < x - 4 && q.x + q.w > x + 4 && q.y > y - 4 && q.y < FLOOR + 6); if (!puente) return true; }
    for (let yy = y - 12; yy > y - 80; yy -= 4) for (const dx of [-7, 0, 7]) if (SOLID(x + dx, yy)) return true;
    const cubre = (x0, w, yb) => x0 < x + 9 && x0 + w > x - 9 && yb < y - 6 && yb > y - 80;
    for (const pl of g.plats || []) if (pl.on !== false && !pl.dead && cubre(pl.x, pl.w, pl.y)) return true;
    for (const q of g.solids || []) if (q.on !== false && !q.dead && cubre(q.x, q.w, q.y + q.h)) return true;
    return false;
  }
  function despejar(o, g, dt) {
    const c = core(o); if (!tapado(g, c.x, c.y)) return;
    let best = null; for (let d = 6; d < 320 && best === null; d += 6) for (const sg of [1, -1]) { const x = c.x + sg * d; if (best === null && x > o.x0 + 16 && x < o.x1 - 16 && !tapado(g, x, c.y)) best = x; }
    if (best === null) return; const mv = clamp(best - c.x, -170 * dt, 170 * dt); o.x += mv; if (o.seg) for (const q of o.seg) q.x += mv;
  }
  // en la ventana de alcance el núcleo no puede quedar metido en algo sólido (una columna, un muro):
  // si quedó adentro, el jefe se corre al lugar libre más cercano
  function desenterrar(o, g, dt) {
    const c = core(o), dentro = x => [0, 8, 16, 24, 32].some(d => SOLID(x, c.y - d)), libre = x => !dentro(x - 8) && !dentro(x) && !dentro(x + 8);
    if (libre(c.x)) return;
    let best = null; for (let d = 6; d < 220 && best === null; d += 6) for (const sg of [1, -1]) { const x = c.x + sg * d; if (best === null && x > o.x0 + 16 && x < o.x1 - 16 && libre(x)) best = x; }
    if (best === null) return; const mv = clamp(best - c.x, -170 * dt, 170 * dt); o.x += mv; if (o.seg) for (const q of o.seg) q.x += mv;
  }
  function vulnerable(o) { return o.st === 'ventana' && ((o.mode === 'alcance' && !o.conLagrima) || o.stunT > 0); }

  OBJ.jefe = {
    front: true,
    make(g, en, def) {
      const ax = L.camMin + VW / 2;
      const o = { k: 'jefe', tipo: en.tipo, hp: 3, max: 3, st: 'entra', t: 0, at: 0, ai: 0, x: ax, y: -60, face: -1, mode: modoJefe(def.power), orbs: [], waves: [], stunT: 0, flash: 0, hgt: 92, pal: pal(def), x0: L.camMin + 2 * T, x1: L.camMin + VW - 2 * T };
      if (o.tipo === 'golem') { o.y = FLOOR; o.x = o.x1 - 20; o.drop = -160; }
      if (o.tipo === 'serpiente') { o.seg = Array.from({ length: 11 }, (_, i) => ({ x: ax + 200 + i * 10, y: 60 })); o.trail = []; }
      if (INIT[o.tipo]) INIT[o.tipo](o, g);
      g.objs.push(o); g.boss = o;
    },
    onPower(o, g, x, y) {
      if (o.st !== 'ventana' || o.stunT > 0) return;
      if (o.conLagrima ? !o.cargada : o.mode !== 'control') return; // Mythos: solo si Itzel ya agarró la lágrima
      const c = core(o); if (Math.hypot(c.x - x, c.y - y) > (o.conLagrima ? 50 : 40)) return;
      o.stunT = 3.4 * (typeof difi === 'function' ? difi().ventana : 1); ring(g, c.x, c.y, '#ffffff', 34, .6); g.shake = .2; spawn(g, 16, c.x, c.y, { v: 90, life: .6, s: 2, k: 'spark', cols: ['#ffffff', o.pal.core] });
    },
    step(o, g, dt) {
      const p = g.p; o.t += dt; o.at += dt; o.flash = Math.max(0, o.flash - dt); o.stunT = Math.max(0, o.stunT - dt);
      const A = o.ataques || JEFES[o.tipo].ataques, dif = typeof difi === 'function' ? difi().ventana : 1;   // la dificultad alarga o acorta la ventana
      // la canción de cuna de Fresita deshace los orbes cercanos
      if (g.lull && g.t - g.lull.t < .05) for (const b of o.orbs) if (Math.hypot(b.x - g.lull.x, b.y - g.lull.y) < g.lull.r + 6) { b.dead = true; spawn(g, 6, b.x, b.y, { v: 40, life: .4, s: 1.5, k: 'spark', cols: ['#b9a7ff', '#ffffff'] }); }
      // ---------- máquina de estados común ----------
      if (o.st === 'entra') { if (o.at > 2.2) { o.st = 'ataque'; o.at = 0; o.atk = A[0]; } }
      else if (o.st === 'ataque') { if (o.at > (o.dur || 2.4)) { o.st = 'ventana'; o.at = 0; o.dur = 0; } }
      else if (o.st === 'ventana') { if (o.at > (o.stunT > 0 ? 99 : (o.ventanaT || 3.2) * dif) && o.stunT <= 0) { o.st = 'ataque'; o.at = 0; o.ai = (o.ai + 1) % A.length; o.atk = A[o.ai]; } }
      else if (o.st === 'herido') { if (o.at > 1.1) { o.st = 'ataque'; o.at = 0; o.ai = (o.ai + 1) % A.length; o.atk = A[o.ai]; } }
      else if (o.st === 'muere') { if (o.at > 2.4 && !g.win) { g.win = g.t; RUN.vencidos = (RUN.vencidos || 0) + 1; } }
      // ---------- movimiento y ataques de cada jefe ----------
      STEP[o.tipo](o, g, dt);
      // noqueado nunca debajo de una plataforma: si algo le tapa el núcleo por arriba, se corre a un lugar libre
      if (o.stunT > 0 && o.st === 'ventana') despejar(o, g, dt);
      else if (o.st === 'ventana' && o.mode === 'alcance' && !o.conLagrima) desenterrar(o, g, dt);
      // los jefes que caminan no se quedan parados sobre un hueco de la arena: sus dos lados (según lo ancho que sea el cuerpo) tienen que pisar suelo
      if ((o.tipo === 'golem' || o.tipo === 'cocodrilo' || (o.tipo === 'jaguar' && o.y >= FLOOR - 2)) && !o.charging && !(o.tipo === 'cocodrilo' && o.sub > .6)) {
        const m = { golem: 22, cocodrilo: 20, jaguar: 16 }[o.tipo], pisa = x => SOLID(x - m, FLOOR + 4) && SOLID(x + m, FLOOR + 4);
        if (!pisa(o.x)) {
          let best = null; for (let d = 2; d < 300 && best === null; d += 2) for (const sg of [1, -1]) { const x = o.x + sg * d; if (best === null && x > o.x0 + 10 && x < o.x1 - 10 && pisa(x)) best = x; }
          // si el hueco queda cerca se corre de golpe (no puede perseguir a Itzel por el aire); si nació encima, camina hacia el suelo
          if (best !== null) o.x += Math.abs(best - o.x) <= 40 ? best - o.x : clamp(best - o.x, -150 * dt, 150 * dt);
        }
      }
      // ---------- golpe de Itzel al núcleo ----------
      const c = core(o);
      if (vulnerable(o) && p.vy > 0 && Math.abs(p.x - c.x) < c.r + 6 && p.y > c.y - 10 && p.y < c.y + 8) {
        o.hp--; p.vy = -390; p.noCut = true; p.y = c.y - 10; o.flash = .8; g.shake = .35; o.stunT = 0;
        spawn(g, 24, c.x, c.y, { v: 140, life: .8, s: 2.4, k: 'spark', cols: [o.pal.core, '#ffffff', o.pal.glow] });
        if (o.hp <= 0) { o.st = 'muere'; o.at = 0; for (let i = 0; i < 4; i++) spawn(g, 18, c.x, c.y, { ang: -Math.PI / 2, spread: 3, v: 180, life: 1.4, s: 2.4, k: 'confetti', cols: [o.pal.core, o.pal.a, o.pal.c, '#ffffff'], g: 220 }); }
        else { o.st = 'herido'; o.at = 0; }
      }
      // ---------- orbes ----------
      for (const b of o.orbs) {
        b.life -= dt;
        if (b.c === 'verde') { const dx = p.x - b.x, dy = p.y - 8 - b.y, d = Math.hypot(dx, dy) || 1; b.vx += (dx / d * 60 - b.vx) * dt * 2; b.vy += (dy / d * 60 - b.vy) * dt * 2; }
        if (b.c === 'blanca') { const dx = g.fre.x - b.x, dy = g.fre.y - b.y, d = Math.hypot(dx, dy) || 1; b.vx += (dx / d * 75 - b.vx) * dt * 2.4; b.vy += (dy / d * 75 - b.vy) * dt * 2.4; if (d < 8) { b.dead = true; g.fre.daze = 2; ring(g, g.fre.x, g.fre.y, '#ffffff', 16, .5); } }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.c === 'rosa' && SOLID(b.x, b.y)) b.dead = true;
        if (b.c !== 'blanca' && Math.abs(b.x - p.x) < 7 && b.y > p.y - p.h - 2 && b.y < p.y + 2) { b.dead = true; MEC.hurt(g, b.vx > 0 ? 1 : -1); }
        if (b.life <= 0 || b.y > VH + 10 || b.x < L.camMin - 20 || b.x > L.camMin + VW + 20) b.dead = true;
      }
      o.orbs = o.orbs.filter(b => !b.dead);
      // ---------- ondas por el suelo ----------
      for (const w of o.waves) { w.x += w.v * dt; w.life -= dt; if (p.on && Math.abs(p.x - w.x) < 7 && p.y > FLOOR - 4) MEC.hurt(g, Math.sign(w.v)); }
      o.waves = o.waves.filter(w => w.life > 0 && w.x > o.x0 - 30 && w.x < o.x1 + 30);
    },
    draw(c, o, f) {
      const g = f.g;
      // avisos de los ataques
      TELL[o.tipo](c, o, f);
      for (const w of o.waves) { c.fillStyle = o.pal.c; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(w.x - 6 + k * 3, FLOOR); c.lineTo(w.x - 4 + k * 3, FLOOR - 8 + k * 2); c.lineTo(w.x - 2 + k * 3, FLOOR); c.fill(); } }
      if (!g.visorSinJefe) drawBoss(c, o, f);
      for (const b of o.orbs) { const col = b.col || { rosa: '#ff5d9a', amarilla: '#ffd23f', verde: '#5fe07a', blanca: '#ffffff' }[b.c]; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, b.x, b.y, 9, col, .7); c.restore(); c.fillStyle = col; c.beginPath(); c.arc(b.x, b.y, b.c === 'verde' ? 3.4 : 2.6, 0, TAU); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(b.x - .8, b.y - .8, .9, 0, TAU); c.fill(); }
      // Fresita aturdida
      if (g.fre.daze > 0) for (let k = 0; k < 3; k++) { const a = f.t * 5 + k * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(g.fre.x + Math.cos(a) * 8, g.fre.y - 9 + Math.sin(a) * 2.5, 1.2, 0, TAU); c.fill(); }
      if (g.sinHudJefe) return;
      // barra de vida y nombre
      const cx = g.cam + VW / 2, J = JEFES[o.tipo];
      // una placa de manta con su pespunte, como el resto de la interfaz; la vida son puntadas del color del jefe
      c.save(); c.fillStyle = 'rgba(20,10,6,.35)'; c.beginPath(); roundRect(c, cx - 64, 9.6, 128, 15.4, 2.2); c.fill();
      c.fillStyle = '#efe4cc'; c.beginPath(); roundRect(c, cx - 64, 8.6, 128, 15.4, 2.2); c.fill();
      c.strokeStyle = 'rgba(120,60,30,.6)'; c.lineWidth = .45; c.setLineDash([1.7, 1.3]); c.beginPath(); roundRect(c, cx - 62.4, 10.2, 124.8, 12.2, 1.4); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#3a2418'; c.font = '700 6.4px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillText(J.nombre, cx, 16.6);
      for (let i = 0, an = 112 / o.max; i < o.max; i++) { const x = cx - 56 + i * an, w = an - 1.8; c.fillStyle = i < o.hp ? o.pal.core : 'rgba(120,60,30,.2)'; c.beginPath(); roundRect(c, x, 18.6, w, 2.4, 1); c.fill(); if (i < o.hp) { c.strokeStyle = 'rgba(58,36,24,.55)'; c.lineWidth = .35; c.stroke(); } }
      c.restore();
      if (o.st === 'ventana' && o.conLagrima) { c.fillStyle = '#ffffff'; c.font = 'bold 5.5px "Alegreya Sans", sans-serif'; c.fillText(o.stunT > 0 ? '¡Noqueado! Itzel, cáele encima' : o.cargada ? '¡Fresita, clic sobre Mythos para tumbarlo!' : '¡Itzel, agarra la lágrima de estrella!', cx, 31); }
      else if (o.st === 'ventana') { if (o.textoVentana) { c.font = 'bold 5.5px "Alegreya Sans", sans-serif'; const an = c.measureText(o.textoVentana).width + 10; c.fillStyle = 'rgba(18,8,30,.86)'; c.fillRect(cx - an / 2, 25, an, 8); } c.fillStyle = vulnerable(o) || o.textoVentana ? '#ffffff' : 'rgba(255,255,255,.75)'; c.font = 'bold 5.5px "Alegreya Sans", sans-serif'; c.fillText(o.textoVentana ? o.textoVentana : vulnerable(o) ? (o.mode === 'alcance' ? '¡El núcleo está abierto! Súbanse y cáiganle encima' : '¡Aturdido! Itzel, cáele encima') : `¡Ahora, Fresita! ${MEC.POW[g.power].name} sobre el núcleo`, cx, 31); }
      c.textAlign = 'left';
    },
  };

  // =================== MOVIMIENTO Y ATAQUES ===================
  const CORE = {}, INIT = {};
  const STEP = {
    mythos(o, g, dt) {
      const p = g.p, mid = L.camMin + VW / 2;
      let tx = mid + Math.sin(o.t * .7) * 120, ty = 58 + Math.sin(o.t * 1.4) * 10;
      if (o.st === 'entra') { tx = mid; ty = 58; }
      if (o.st === 'ventana') { ty = o.stunT > 0 ? FLOOR - 9 : 86; tx = o.x + Math.sin(o.t) * .3; } // noqueado cae al suelo
      if (o.st === 'muere') { ty = o.y + 20 * dt; }
      o.x += (tx - o.x) * Math.min(1, dt * (o.stunT > 0 ? 6 : 2)); o.y += (ty - o.y) * Math.min(1, dt * (o.stunT > 0 ? 6 : 2));
      if (o.st !== 'ataque') { o.fx = null; return; }
      const a = o.at;
      if (o.atk === 'orbes') { o.dur = 2.6; const k = Math.floor(a / .42); if (k !== o.lastK && k < 6) { o.lastK = k; const c = ['rosa', 'amarilla', 'verde', 'blanca', 'rosa', 'blanca'][k], ang = Math.atan2(p.y - 8 - o.y, p.x - o.x), sp = c === 'amarilla' ? 150 : c === 'rosa' ? 120 : 50; o.orbs.push({ c, x: o.x, y: o.y + 8, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: c === 'verde' || c === 'blanca' ? 4.5 : 3 }); } if (a > 2.55) o.lastK = -1; }
      else if (o.atk === 'tentaculo') { o.dur = 2.3; if (a < .05) o.tx = p.x; o.fx = a < .95 ? 'aviso' : a < 1.4 ? 'golpe' : null; if (o.fx === 'golpe') { hurtIfIn(g, o.tx - 9, o.y, o.tx + 9, FLOOR); if (!o.slam) { o.slam = 1; g.shake = .3; spawn(g, 14, o.tx, FLOOR, { ang: -Math.PI / 2, spread: 2.4, v: 90, life: .5, s: 2, k: 'dust', cols: [o.pal.c, o.pal.b] }); } } else o.slam = 0; }
      else if (o.atk === 'rayo') { o.dur = 2.3; if (a < .05) o.ry = (o.ai % 2 ? FLOOR - 7 : FLOOR - 7); o.fx = a < .85 ? 'aviso' : a < 1.5 ? 'rayo' : null; if (o.fx === 'rayo') hurtIfIn(g, o.x0 - 20, o.ry - 4, o.x1 + 20, o.ry + 4); }
    },
    golem(o, g, dt) {
      const p = g.p;
      if (o.st === 'entra') { o.drop += 400 * dt; if (o.drop > 0) { if (!o.landed) { o.landed = 1; g.shake = .5; spawn(g, 24, o.x, FLOOR, { ang: -Math.PI / 2, spread: 3, v: 120, life: .6, s: 2.4, k: 'dust', cols: [o.pal.c, o.pal.b] }); } o.drop = 0; } }
      const kneel = o.st === 'ventana' && o.stunT > 0, target = kneel ? 40 : o.st === 'muere' ? 30 : 92;
      o.hgt += (target - o.hgt) * Math.min(1, dt * 5);
      if (o.st === 'ventana' || o.st === 'herido' || o.st === 'muere') { o.fx = null; return; }
      if (o.st !== 'ataque') return;
      const a = o.at;
      if (o.atk === 'pisoton') { o.dur = 2.2; o.jump = a > .4 && a < 1 ? Math.sin((a - .4) / .6 * Math.PI) * 50 : 0; if (a >= 1 && !o.stomped) { o.stomped = 1; g.shake = .45; o.waves.push({ x: o.x - 18, v: -170, life: 2 }, { x: o.x + 18, v: 170, life: 2 }); } if (a < .4) o.stomped = 0; }
      else if (o.atk === 'rocas') { o.dur = 2.5; const k = Math.floor(a / .6); if (k !== o.lastK && k >= 1 && k <= 3) { o.lastK = k; const tt = .95, tx = p.x + (k - 2) * 26, sy = FLOOR - 80; g.objs.push({ k: 'fireball', kind: 'roca', x: o.x, y: sy, vx: (tx - o.x) / tt, vy: ((FLOOR - 4 - sy) - .5 * 420 * tt * tt) / tt, life: 3 }); o.face = Math.sign(p.x - o.x) || o.face; } if (a < .1) o.lastK = 0; }
      else if (o.atk === 'embestida') {
        if (a < .05) { o.face = Math.sign(p.x - o.x) || o.face; o.charging = false; o.dur = 9; }
        if (a > .7) { o.charging = true; o.x += o.face * 200 * dt; if (o.x < o.x0 + 20 || o.x > o.x1 - 20) { o.x = clamp(o.x, o.x0 + 20, o.x1 - 20); g.shake = .5; o.charging = false; o.dur = 0; spawn(g, 20, o.x + o.face * 20, FLOOR - 40, { v: 120, life: .6, s: 2.2, k: 'dust', cols: [o.pal.c, o.pal.b] }); } }
      }
      if (o.atk !== 'embestida') { const dx = p.x - o.x; if (Math.abs(dx) > 50) o.x += Math.sign(dx) * 22 * dt; o.face = Math.sign(dx) || o.face; }
      // cuerpo: lastima al tocarlo (menos la cabeza cuando está abierto)
      hurtIfIn(g, o.x - 16, FLOOR - o.hgt + 18 - (o.jump || 0), o.x + 16, FLOOR - (o.jump || 0));
    },
    serpiente(o, g, dt) {
      const p = g.p, h = o.seg[0], mid = L.camMin + VW / 2;
      let tx, ty, sp = 2.4;
      if (o.st === 'entra') { tx = mid; ty = 60; }
      else if (o.st === 'ventana') { tx = mid; ty = o.stunT > 0 ? FLOOR - 16 : 84; sp = o.stunT > 0 ? 5 : 2.5; }
      else if (o.st === 'herido' || o.st === 'muere') { tx = mid + Math.sin(o.t * 3) * 40; ty = 50; }
      else {
        const a = o.at;
        if (o.atk === 'picada') { o.dur = 2.6; if (a < .05) o.tx = p.x; if (a < 1) { tx = o.tx; ty = 40; } else if (a < 1.5) { tx = o.tx; ty = FLOOR - 6; sp = 8; if (h.y > FLOOR - 14 && !o.hit) { o.hit = 1; g.shake = .4; spawn(g, 18, h.x, FLOOR, { ang: -Math.PI / 2, spread: 2.6, v: 110, life: .6, s: 2.2, k: 'dust', cols: [o.pal.c, o.pal.a] }); } } else { tx = o.tx; ty = 60; o.hit = 0; } }
        else if (o.atk === 'fuego') { o.dur = 3; const u = a / 3; tx = o.x0 + 20 + u * (o.x1 - o.x0 - 40) * (o.ai % 2 ? -1 : 1) + (o.ai % 2 ? o.x1 - o.x0 - 40 : 0); ty = 46 + Math.sin(a * 4) * 6; const k = Math.floor(a / .45); if (k !== o.lastK && k >= 1 && k <= 6) { o.lastK = k; g.objs.push({ k: 'fireball', kind: 'fuego', x: h.x, y: h.y + 6, vx: 0, vy: 40, life: 3 }); } if (a < .1) o.lastK = 0; sp = 5; }
        else if (o.atk === 'cola') { o.dur = 3.2; const dir = o.ai % 2 ? -1 : 1, u = clamp((a - .5) / 2.2, 0, 1); tx = dir > 0 ? lerp(o.x0 - 10, o.x1 + 10, u) : lerp(o.x1 + 10, o.x0 - 10, u); ty = a < .5 ? 80 : FLOOR - 7; sp = a < .5 ? 3 : 7; }
      }
      if (o.st === 'entra' || o.st === 'ventana' || o.st === 'herido' || o.st === 'muere') { tx += Math.sin(o.t * 2) * (o.stunT > 0 ? 0 : 20); }
      h.x += (tx - h.x) * Math.min(1, dt * sp); h.y += (ty - h.y) * Math.min(1, dt * sp); o.x = h.x; o.y = h.y;
      // el cuerpo sigue a la cabeza
      for (let i = 1; i < o.seg.length; i++) { const a2 = o.seg[i - 1], b2 = o.seg[i], d = Math.hypot(a2.x - b2.x, a2.y - b2.y) || 1, L2 = 9 - i * .3; if (d > L2) { b2.x = a2.x + (b2.x - a2.x) / d * L2; b2.y = a2.y + (b2.y - a2.y) / d * L2; } }
      o.face = Math.sign(o.seg[0].x - o.seg[1].x) || o.face;
      // el cuerpo lastima (la cabeza no cuando está abierta)
      for (let i = vulnerable(o) ? 2 : 0; i < o.seg.length; i++) { const s = o.seg[i], r = 6 - i * .3; hurtIfIn(g, s.x - r, s.y - r, s.x + r, s.y + r); }
    },
  };

  // =================== AVISOS ===================
  const TELL = {
    mythos(c, o, f) {
      if (o.fx === 'aviso' && o.atk === 'tentaculo') { c.strokeStyle = rgba(o.pal.core, .5 + Math.sin(f.t * 30) * .3); c.setLineDash([3, 3]); c.lineWidth = 1; c.strokeRect(o.tx - 9, o.y, 18, FLOOR - o.y); c.setLineDash([]); }
      if (o.fx === 'golpe') { c.fillStyle = o.pal.b; c.beginPath(); c.moveTo(o.x - 4, o.y + 10); c.quadraticCurveTo(o.tx - 14, (o.y + FLOOR) / 2, o.tx - 8, FLOOR); c.lineTo(o.tx + 8, FLOOR); c.quadraticCurveTo(o.tx + 4, (o.y + FLOOR) / 2, o.x + 4, o.y + 10); c.fill(); c.strokeStyle = o.pal.core; c.lineWidth = .8; c.stroke(); }
      if (o.atk === 'rayo' && o.fx === 'aviso') { c.strokeStyle = rgba(o.pal.core, .4 + Math.sin(f.t * 30) * .3); c.setLineDash([4, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(o.x0 - 20, o.ry); c.lineTo(o.x1 + 20, o.ry); c.stroke(); c.setLineDash([]); }
      if (o.fx === 'rayo') { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rgba(o.pal.core, .55); c.fillRect(o.x0 - 20, o.ry - 4, o.x1 - o.x0 + 40, 8); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(o.x0 - 20, o.ry - 1, o.x1 - o.x0 + 40, 2); c.restore(); c.strokeStyle = o.pal.core; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + (o.ry > o.y ? 0 : 0), o.ry); c.stroke(); }
    },
    golem(c, o) { if (o.atk === 'embestida' && o.st === 'ataque' && o.at < .7) { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.fillText('!', o.x - 2, FLOOR - o.hgt - 6); } },
    serpiente(c, o, f) { if (o.atk === 'picada' && o.st === 'ataque' && o.at < 1) { c.strokeStyle = rgba(o.pal.core, .4 + Math.sin(f.t * 30) * .3); c.setLineDash([3, 3]); c.beginPath(); c.moveTo(o.tx, 40); c.lineTo(o.tx, FLOOR); c.stroke(); c.setLineDash([]); } },
  };

  // =================== DIBUJO (la paleta sale del mundo: cada estilo tiene su variante) ===================
  const pxCv = mkCanvas(1, 1), pxCx = pxCv.getContext('2d', { willReadFrequently: true });
  function drawBoss(c, o, f) {
    if (!f.st.pixel || typeof hardenCanvas !== 'function') { BODY[o.tipo](c, o, f); return; }
    // en los mundos de pixel el jefe también es de pixel: se dibuja aparte y se le quita el antialias
    if (o.tipo === 'hadas') { BODY[o.tipo](c, o, f); return; }
    const S = f.S, bx = o.x - 70, by = (o.tipo === 'golem' || o.tipo === 'jaguar' || o.tipo === 'cocodrilo' ? FLOOR - 130 + (o.tipo === 'jaguar' ? (o.y - FLOOR) : 0) : o.y - 70), W = 140, H = 140, w = Math.round(W * S), h = Math.round(H * S);
    if (o.tipo === 'serpiente') { BODY[o.tipo](c, o, f); return; }
    if (pxCv.width !== w || pxCv.height !== h) { pxCv.width = w; pxCv.height = h; }
    pxCx.setTransform(1, 0, 0, 1, 0, 0); pxCx.clearRect(0, 0, w, h); pxCx.setTransform(S, 0, 0, S, -bx * S, -by * S);
    BODY[o.tipo](pxCx, o, f); hardenCanvas(pxCv, 8, 0, 90);
    c.drawImage(pxCv, Math.round(bx * S) / S, Math.round(by * S) / S, W, H);
  }
  const BODY = {
    mythos(c, o, f) {
      const P = o.pal, t = f.t, open = o.st === 'ventana' || o.st === 'herido', stun = o.stunT > 0, white = o.flash > 0 && Math.sin(t * 40) > 0;
      c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .25); if (o.st === 'muere') { c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1); c.rotate(o.at * .6); }
      // tentáculos de piedra
      c.lineCap = 'round';
      // noqueado en el suelo, los tentáculos se encogen (no se meten en el piso)
      c.save(); c.translate(0, 10); c.scale(1, stun ? .3 : 1); c.translate(0, -10);
      for (let i = 0; i < 5; i++) { const bx = (i - 2) * 8, ph = t * 2 + i; c.strokeStyle = P.b; c.lineWidth = 4.4 - Math.abs(i - 2) * .5; c.beginPath(); c.moveTo(bx, 10); c.bezierCurveTo(bx + Math.sin(ph) * 6, 22, bx - Math.sin(ph + 1) * 8, 32, bx + Math.sin(ph + 2) * 5, 42 + Math.abs(i - 2) * -3); c.stroke(); c.strokeStyle = P.core; c.lineWidth = .6; c.stroke(); } c.restore();
      // máscara
      c.fillStyle = white ? '#ffffff' : P.a; c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(-24, -24, 0, -26); c.quadraticCurveTo(24, -24, 26, -6); c.quadraticCurveTo(22, 14, 0, 16); c.quadraticCurveTo(-22, 14, -26, -6); c.fill();
      c.strokeStyle = P.c; c.lineWidth = 1.4; c.stroke(); c.strokeStyle = P.b; c.lineWidth = .6; c.stroke();
      c.fillStyle = P.b; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 26, -8); c.lineTo(d * 33, -16); c.lineTo(d * 30, -2); c.fill(); }
      c.strokeStyle = P.c; c.lineWidth = .6; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(-18 + k * 3, -18 + k * 9); c.lineTo(-10 + k * 3, -18 + k * 9); } c.stroke();
      // la grieta que brilla
      c.save(); c.shadowColor = P.core; c.shadowBlur = 6 * f.S; c.strokeStyle = P.core; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, -26); c.lineTo(2, -16); c.lineTo(9, -10); c.lineTo(4, 0); c.lineTo(12, 8); c.lineTo(8, 16); c.stroke(); c.restore();
      // ojo / núcleo
      const eo = open ? 1 : .35 + Math.abs(Math.sin(t * .8)) * .15;
      c.fillStyle = '#120a10'; c.beginPath(); c.ellipse(-2, 0, 13, 9.5 * eo + 1, 0, 0, TAU); c.fill();
      c.fillStyle = '#f6efe6'; c.beginPath(); c.ellipse(-2, 0, 11, 8 * eo, 0, 0, TAU); c.fill();
      const gx = clamp((f.g.p.x - o.x) / 30, -4, 4), gy = clamp((f.g.p.y - o.y) / 40, -2, 3) * eo;
      if (stun) { c.strokeStyle = P.core; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 20; k++) { const a = k * .7 + t * 6, r = k * .3; c.lineTo(-2 + Math.cos(a) * r, Math.sin(a) * r * eo); } c.stroke(); }
      else { c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.arc(-2 + gx, gy, 5 * Math.min(1, eo + .2), 0, TAU); c.fill(); c.restore(); c.fillStyle = '#120a10'; c.beginPath(); c.arc(-2 + gx, gy, 2.2 * Math.min(1, eo + .2), 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-3.5 + gx, gy - 1.6, 1, 0, TAU); c.fill(); }
      if (open && !stun && o.mode === 'control') { c.strokeStyle = rgba(P.c, .8); c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.arc(-2, 0, 15, 0, TAU); c.stroke(); c.setLineDash([]); }
      c.restore();
    },
    golem(c, o, f) {
      const P = o.pal, t = f.t, H = o.hgt, y0 = FLOOR - (o.jump || 0) + Math.min(0, o.drop || 0), stun = o.stunT > 0, white = o.flash > 0 && Math.sin(t * 40) > 0, open = o.st === 'ventana' || o.st === 'herido';
      c.save(); c.translate(o.x, y0); c.scale(o.face, 1); if (o.st === 'muere') { c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1); }
      const k = H / 92, breath = o.st === 'ventana' && !stun ? Math.sin(t * 5) * 1.5 : 0;
      const rock = (x, y, w, h, r) => { c.beginPath(); roundRect(c, x, y, w, h, r); c.fillStyle = white ? '#ffffff' : P.a; c.fill(); c.strokeStyle = P.b; c.lineWidth = 1.2; c.stroke(); };
      // piernas
      rock(-14, -18 * k, 11, 18 * k, 3); rock(3, -18 * k, 11, 18 * k, 3);
      // torso
      rock(-20, -66 * k + breath, 40, 50 * k, 7);
      c.strokeStyle = P.core; c.lineWidth = 1; c.save(); c.shadowColor = P.core; c.shadowBlur = 5 * f.S; c.beginPath(); c.moveTo(-10, -56 * k + breath); c.lineTo(-4, -46 * k + breath); c.lineTo(-10, -36 * k + breath); c.moveTo(8, -58 * k + breath); c.lineTo(12, -44 * k + breath); c.stroke(); c.restore();
      // brazos
      const sw = o.charging ? -1 : Math.sin(t * 2) * .2;
      c.save(); c.translate(-20, -60 * k + breath); c.rotate(.2 + sw); rock(-10, 0, 10, 34 * k, 4); rock(-12, 30 * k, 14, 12, 4); c.restore();
      c.save(); c.translate(20, -60 * k + breath); c.rotate(-.2 - sw); rock(0, 0, 10, 34 * k, 4); rock(-2, 30 * k, 14, 12, 4); c.restore();
      // cabeza y cristal
      rock(-10, -84 * k + breath, 20, 18 * k, 4);
      c.fillStyle = stun ? '#ffffff' : P.eye; c.fillRect(2, -78 * k + breath, 5, 2.4); c.fillRect(-6, -78 * k + breath, 5, 2.4);
      c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.moveTo(2, -84 * k + breath); c.lineTo(6, -92 * k + breath); c.lineTo(9, -84 * k + breath); c.lineTo(6, -81 * k + breath); c.closePath(); c.fill(); c.restore();
      if (stun) for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(Math.cos(a) * 12, -94 * k + Math.sin(a) * 3, 1.4, 0, TAU); c.fill(); }
      c.restore();
    },
    serpiente(c, o, f) {
      const P = o.pal, t = f.t, white = o.flash > 0 && Math.sin(t * 40) > 0, stun = o.stunT > 0, open = o.st === 'ventana' || o.st === 'herido';
      c.save(); if (o.st === 'muere') c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1);
      for (let i = o.seg.length - 1; i >= 1; i--) {
        const s = o.seg[i], r = 6.4 - i * .35, n = o.seg[i - 1], a = Math.atan2(n.y - s.y, n.x - s.x);
        c.fillStyle = white ? '#ffffff' : (i % 2 ? P.a : P.b); c.beginPath(); c.arc(s.x, s.y, r, 0, TAU); c.fill();
        c.fillStyle = P.c; c.beginPath(); c.arc(s.x + Math.cos(a + 1.6) * r * .45, s.y + Math.sin(a + 1.6) * r * .45, r * .35, 0, TAU); c.fill();
        // plumas del quetzal
        c.strokeStyle = i % 3 === 0 ? P.core : '#3fbf7a'; c.lineWidth = 1; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + Math.cos(a - 1.9) * (r + 5), s.y + Math.sin(a - 1.9) * (r + 5)); c.stroke();
      }
      const h = o.seg[0], a = Math.atan2(h.y - o.seg[1].y, h.x - o.seg[1].x);
      c.translate(h.x, h.y); c.rotate(a); if (stun) c.rotate(Math.sin(t * 8) * .2);
      for (let k = 0; k < 5; k++) { c.strokeStyle = k % 2 ? '#3fbf7a' : '#1f8a5a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-4, -4); c.quadraticCurveTo(-12, -10 - k * 2, -18 - k * 2, -6 - k * 3 + Math.sin(t * 6 + k)); c.stroke(); }
      c.fillStyle = white ? '#ffffff' : P.a; c.beginPath(); c.moveTo(-7, -6); c.quadraticCurveTo(4, -9, 12, -2); c.lineTo(12, 2); c.quadraticCurveTo(4, 7, -7, 6); c.closePath(); c.fill(); c.strokeStyle = P.b; c.lineWidth = 1; c.stroke();
      c.fillStyle = P.b; c.beginPath(); c.moveTo(12, 0); c.lineTo(5, 1); c.lineTo(11, 3); c.fill();
      c.fillStyle = stun ? '#ffffff' : P.eye; c.beginPath(); c.arc(4, -3, 1.6, 0, TAU); c.fill(); c.fillStyle = '#111'; if (!stun) { c.beginPath(); c.arc(4.4, -3, .7, 0, TAU); c.fill(); }
      c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.moveTo(-2, -8); c.lineTo(1, -11.5); c.lineTo(4, -8); c.lineTo(1, -6); c.closePath(); c.fill(); c.restore();
      if (o.atk === 'fuego' && o.st === 'ataque') { c.globalCompositeOperation = 'lighter'; glowDot(c, 13, 1, 6, '#ff7a1a', .7); }
      c.restore();
    },
  };
  // la roca del gólem usa el proyectil común
  // los jefes de otros archivos (jefes-nuevos.js) se registran aquí
  window.JEFES_EXT = { STEP, TELL, BODY, CORE, INIT, FLOOR, core, vulnerable, hurtIfIn };
  const fbDraw = OBJ.fireball.draw;
  OBJ.fireball.draw = (c, o, f) => { if (o.kind === 'roca') { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.fillStyle = '#6a6458'; c.beginPath(); c.moveTo(-4, -2); c.lineTo(-1, -4.5); c.lineTo(4, -3); c.lineTo(4.5, 2); c.lineTo(0, 4.5); c.lineTo(-4, 2.5); c.closePath(); c.fill(); c.fillStyle = '#9a9484'; c.fillRect(-2, -3, 3, 1.4); c.restore(); return; } fbDraw(c, o, f); };
})();
