'use strict';
// =====================================================================
//  LA RUPTURA DE LA PIRÁMIDE (el jefe final de Itzel, según la hoja
//  art/referencia/assets/fases_jefe_final.png; su cuerpo se dibuja en
//  ruptura-cuerpo.js) y los arreglos de Mythos.
//
//  La Ruptura cambia de forma con cada golpe, como en la guía del jefe:
//  Sombra → Códice (mural vivo) → Mágica (gólem dimensional), y cuando
//  abre el núcleo se ve el «Núcleo expuesto». Ataca con un láser de
//  energía, fragmentos de piedra y aplastones que mandan ondas.
// =====================================================================
Object.assign(JEFES, {
  ruptura: { nombre: 'La Ruptura de la pirámide', lema: 'La fusión de todas las dimensiones, con un núcleo que late.', ataques: ['laser', 'fragmentos', 'aplastar'],
    texto: 'El jefe final de Itzel: una grieta en los Cinco Pisos de Edzná donde se juntan la oscuridad, el códice y todos los lugares de Campeche. Es el único jefe con diez formas y cada una pelea distinto: Mural del códice, Gólem dimensional, Núcleo expuesto, La Marea, El Baluarte, El Enjambre, El Huracán, La otra Itzel, La Ceiba y, al final, Los Tentáculos. Dispara un láser de energía que apunta a Itzel, revienta fragmentos de piedra en abanico y se deja caer para aplastar, mandando ondas por el suelo.' },
});

(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn;
  const mid = o => (o.x0 + o.x1) / 2;

  // el cuerpo (sus cuatro formas) se dibuja en código: ruptura-cuerpo.js

  X.INIT.ruptura = (o) => { o.x = mid(o); o.y = -70; o.forma = 0; o.cambio = 0; o.ang = 0; };
  X.CORE.ruptura = (o) => ({ x: o.x, y: o.y, r: o.stunT > 0 ? 12 : 10 });
  X.STEP.ruptura = (o, g, dt) => {
    const p = g.p, a = o.at; let tx = mid(o) + Math.sin(o.t * .4) * 90, ty = 72 + Math.sin(o.t * 1.1) * 6, k = 1.6;
    if (o.st === 'entra') { tx = mid(o); ty = 72; }
    if (o.st === 'ventana') { tx = clamp(o.x, o.x0 + 70, o.x1 - 70); ty = o.stunT > 0 ? FLOOR - 24 : 94; k = o.stunT > 0 ? 6 : 2; }
    if (o.st === 'muere') { tx = o.x; ty = o.y - 10 * dt; }
    // forma según la vida; con el núcleo abierto se ve expuesto
    const quiere = o.F ? (o.F.final && (o.st === 'ventana' || o.st === 'herido') ? 3 : o.F.cuerpo) : o.st === 'ventana' || o.st === 'herido' ? 3 : clamp(3 - o.hp, 0, 2);
    if (quiere !== o.forma) { o.forma = quiere; o.cambio = .45; spawn(g, 18, o.x, o.y, { v: 120, life: .6, s: 2.2, k: 'spark', cols: ['#ff4fd8', '#ffffff', '#7ad8ff'] }); }
    o.cambio = Math.max(0, o.cambio - dt);
    let libre = true;
    if (o.st === 'ataque') {
      const propio = X.RUP_ATK && X.RUP_ATK[o.atk];
      if (propio) { const m = { tx, ty, k }; o.fx = o.atk === 'pozo' ? 'pozo' : null; propio(o, g, dt, a, m); tx = m.tx; ty = m.ty; k = m.k; }
      else if (o.atk === 'laser') {
        o.dur = 2.9; const quiereAng = Math.atan2(p.y - 7 - o.y, p.x - o.x);
        if (a < .05) o.ang = quiereAng;
        if (a < 1.05) { o.fx = 'carga'; o.ang += clamp(quiereAng - o.ang, -1.6 * dt, 1.6 * dt); }
        else if (a < 1.85) { o.fx = 'laser'; o.ang += (o.x > p.x ? -1 : 1) * .22 * dt; const dx = Math.cos(o.ang), dy = Math.sin(o.ang), vx = p.x - o.x, vy = p.y - 7 - o.y, pr = vx * dx + vy * dy; if (pr > 0 && Math.abs(vx * dy - vy * dx) < 7) MEC.hurt(g, dx > 0 ? 1 : -1); }
        else o.fx = null;
      } else if (o.atk === 'fragmentos') {
        o.dur = 2.6; o.fx = null;
        for (const w of [.6, 1.4]) if (a > w && !o['r' + w]) { o['r' + w] = 1; g.shake = Math.max(g.shake, .2); for (let n = 0; n < 7; n++) { const an = -Math.PI * (.12 + n / 6 * .76) + (w > 1 ? .1 : 0), sp = 150 + Math.random() * 40; g.objs.push({ k: 'fireball', kind: 'fragmento', x: o.x, y: o.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 4 }); } }
        if (a < .2) { o['r0.6'] = 0; o['r1.4'] = 0; }
      } else if (o.atk === 'aplastar') {
        o.dur = 2.9; o.fx = null;
        if (a < .05) o.tx = clamp(p.x, o.x0 + 30, o.x1 - 30);
        if (a < .95) { o.tx += clamp(p.x - o.tx, -70 * dt, 70 * dt); o.tx = clamp(o.tx, o.x0 + 30, o.x1 - 30); tx = o.tx; ty = 44; k = 4; }
        else if (a < 1.2) { libre = false; o.x = o.tx; o.y = lerp(44, FLOOR - 34, (a - .95) / .25); hurtIfIn(g, o.x - 26, o.y - 20, o.x + 26, o.y + 30); }
        else if (a < 2) { libre = false; o.y = FLOOR - 34; if (!o.cayo) { o.cayo = 1; g.shake = .5; o.waves.push({ x: o.x - 30, v: -170, life: 2 }, { x: o.x + 30, v: 170, life: 2 }); spawn(g, 26, o.x, FLOOR, { ang: -Math.PI / 2, spread: 3, v: 130, life: .7, s: 2.4, k: 'dust', cols: ['#2a1a40', '#ff4fd8', '#7ad8ff'] }); } }
        else { tx = o.tx; ty = 72; }
        if (a < .1) o.cayo = 0;
      }
    } else o.fx = null;
    if (libre) { o.x += (tx - o.x) * Math.min(1, dt * k); o.y += (ty - o.y) * Math.min(1, dt * k); }
    // su cuerpo lastima mientras ataca (con el núcleo abierto, no: hay que llegarle)
    if (o.st === 'ataque' || o.st === 'entra') hurtIfIn(g, o.x - 24, o.y - 24, o.x + 24, o.y + 24);
  };
  X.TELL.ruptura = (c, o, f) => {
    const P = o.pal;
    if (o.fx === 'carga') {
      const k = clamp(o.at / 1.05, 0, 1);
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, 10 + k * 16, '#ff4fd8', .3 + k * .5); c.restore();
      c.strokeStyle = rgba('#ffb0f0', .25 + k * .4); c.lineWidth = .6; c.setLineDash([2, 3]); c.lineDashOffset = -f.t * 20; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + Math.cos(o.ang) * 420, o.y + Math.sin(o.ang) * 420); c.stroke(); c.setLineDash([]);
      for (let n = 0; n < 8; n++) { const an = n / 8 * TAU + f.t * 3, r = 34 * (1 - (f.t * 2 + n / 8) % 1); c.fillStyle = rgba('#ffd0f8', .8); c.beginPath(); c.arc(o.x + Math.cos(an) * r, o.y + Math.sin(an) * r, .9, 0, TAU); c.fill(); }
    }
    if (o.fx === 'laser') {
      const L = 460, ex = o.x + Math.cos(o.ang) * L, ey = o.y + Math.sin(o.ang) * L, w = 1 + Math.sin(f.t * 50) * .25;
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (const [col, lw, al] of [['#ff4fd8', 14, .25], ['#ff4fd8', 8, .5], ['#ffb0f0', 4, .8], ['#ffffff', 1.6, 1]]) { c.strokeStyle = rgba(col, al); c.lineWidth = lw * w; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(ex, ey); c.stroke(); }
      glowDot(c, o.x, o.y, 22, '#ff4fd8', .8); c.restore();
    }
    if (o.st === 'ataque' && o.atk === 'aplastar' && o.at < 1.2) { const k = clamp(o.at / .95, 0, 1); c.fillStyle = rgba('#1a0a24', .25 + k * .35); c.beginPath(); c.ellipse(o.tx ?? o.x, FLOOR + 1, 16 + k * 14, 3, 0, 0, TAU); c.fill(); c.strokeStyle = rgba('#ff4fd8', .4 + Math.sin(f.t * 30) * .3); c.lineWidth = .8; c.stroke(); }
  };
  X.BODY.ruptura = (c, o, f) => {
    const t = f.t, stun = o.stunT > 0, open = o.st === 'ventana' || o.st === 'herido', wh = o.flash > 0 && Math.sin(t * 40) > 0;
    const a = o.at || 0, atacando = o.st === 'ataque';
    // Conserva el tamaño de cada forma; la energía y las piezas se mueven por separado.
    let balance = Math.sin(t * .5) * .04;
    if (atacando && (o.fx === 'carga' || o.fx === 'laser')) balance += .018 * Math.sin(a * 9);
    else if (atacando && ['aplastar','cristales','barridaRaiz','tornado'].includes(o.atk)) balance += .035 * Math.sin(a * 5) * Math.min(1, a * 3);
    else if (atacando) balance += .015 * Math.sin(a * 6) * Math.min(1, a * 3);
    if (o.st === 'herido' || o.flash > 0) balance += .08 * Math.sin(a * 18) * Math.exp(-a * 3.5);
    c.save(); c.translate(o.x, o.y); c.rotate(balance + (o.st === 'muere' ? a * .5 : 0));
    if (o.st === 'muere') c.globalAlpha *= clamp(1 - o.at / 2.4, 0, 1);
    // escombros que orbitan
    for (let n = 0; n < 9; n++) { const an = n / 9 * TAU + t * (.25 + (n % 3) * .08), r = 54 + (n % 3) * 6, x = Math.cos(an) * r, y = Math.sin(an) * r * .8, s = 3 + (n % 4); c.save(); c.translate(x, y); c.rotate(an + t); c.fillStyle = '#1a1030'; c.fillRect(-s / 2, -s / 2, s, s); c.strokeStyle = rgba('#ff4fd8', .6); c.lineWidth = .5; c.strokeRect(-s / 2 + .8, -s / 2 + .8, s - 1.6, s - 1.6); c.restore(); }
    // la forma, dibujada a la resolución de la pantalla (ruptura-cuerpo.js)
    if (wh) c.filter = 'brightness(3)';
    RUPTURA.dibuja(c, o.forma, t, { alcances: o.alcances, st: o.st, atk: o.atk, at: o.at });
    c.filter = 'none';
    // el núcleo que late, con destello de cuatro rayos
    const pulso = .6 + Math.sin(t * 5) * .2 + (open ? .4 : 0);
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 16 + pulso * 8, '#ff4fd8', .5 * pulso);
    c.rotate(t * .6); c.fillStyle = rgba('#ffd8fa', .55 * pulso); for (let n = 0; n < 4; n++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -1.4); c.lineTo(34 * pulso, 0); c.lineTo(0, 1.4); c.fill(); }
    c.restore();
    if (o.cambio > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 70, '#ffffff', o.cambio * 1.6); c.restore(); }
    c.restore();
    if (stun) for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(o.x + Math.cos(an) * 14, o.y - 30 + Math.sin(an) * 3, 1.4, 0, TAU); c.fill(); }
  };
  // fragmentos de piedra de la Ruptura
  const prevFb = MEC.OBJ.fireball.draw;
  MEC.OBJ.fireball.draw = (c, o, f) => {
    if (o.kind !== 'fragmento') return prevFb(c, o, f);
    c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 7, '#ff4fd8', .45); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#20143a'; c.beginPath(); c.moveTo(-4, -3); c.lineTo(3, -4); c.lineTo(4.5, 2); c.lineTo(-1, 4); c.lineTo(-4.5, 1); c.closePath(); c.fill();
    c.strokeStyle = '#ff7ae0'; c.lineWidth = .6; c.beginPath(); c.moveTo(-2, -1); c.lineTo(1, -1); c.lineTo(1, 1.4); c.stroke(); c.restore();
  };

  // ======================= MYTHOS: la lágrima, su cuerpo y ataques más bonitos =======================
  X.INIT.mythos = (o) => { o.conLagrima = true; o.ventanaT = 7.5; o.lagrima = null; o.cargada = false; };
  const pasoMythos = X.STEP.mythos;
  X.STEP.mythos = (o, g, dt) => {
    pasoMythos(o, g, dt);
    const p = g.p;
    if (o.st === 'ventana' && !(o.stunT > 0)) {
      // aparece la lágrima de estrella del lado contrario a Itzel; ella la agarra y Fresita queda cargada
      if (!o.cargada && !o.lagrima) { const x = clamp(p.x < mid(o) ? mid(o) + 95 : mid(o) - 95, o.x0 + 16, o.x1 - 16); o.lagrima = { x, y: FLOOR - 12, t: 0 }; spawn(g, 10, x, FLOOR - 12, { v: 50, life: .5, s: 1.6, k: 'spark', cols: ['#bff6ff', '#ffffff'] }); }
      if (o.lagrima) { o.lagrima.t += dt; const q = o.lagrima; if (Math.abs(p.x - q.x) < 10 && p.y > q.y - 5 && p.y - p.h < q.y + 7) { o.cargada = true; o.lagrima = null; MEC.ring(g, g.fre.x, g.fre.y, '#bff6ff', 26, .6); spawn(g, 16, q.x, q.y, { v: 90, life: .6, s: 2, k: 'spark', cols: ['#bff6ff', '#ffffff', o.pal.core] }); } }
    } else if (o.st !== 'ventana') { o.lagrima = null; o.cargada = false; }
    // la máscara lastima al tocarla mientras ataca (los tentáculos no); descansando o noqueado, no
    if (o.st === 'ataque') hurtIfIn(g, o.x - 20, o.y - 22, o.x + 20, o.y + 13);
  };
  const viejoTell = X.TELL.mythos;
  X.TELL.mythos = (c, o, f) => {
    const P = o.pal, a = o.at, g = f.g;
    // la lágrima de estrella
    if (o.lagrima) { const q = o.lagrima, y = q.y + Math.sin(q.t * 3) * 2; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, q.x, y, 14, '#9ae8ff', .5 + Math.sin(q.t * 6) * .15); c.rotate(0); c.restore(); c.save(); c.translate(q.x, y); c.rotate(Math.sin(q.t * 2) * .15); c.fillStyle = '#e8fbff'; c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(4.5, 0, 0, 4.5); c.quadraticCurveTo(-4.5, 0, 0, -6); c.fill(); c.fillStyle = '#8ad8ff'; c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(2.4, 1, 0, 3); c.quadraticCurveTo(-1, 1, 0, -3); c.fill(); c.restore(); c.strokeStyle = rgba('#bff6ff', .7); c.lineWidth = .5; for (let n = 0; n < 4; n++) { const an = n / 4 * TAU + q.t * 2; c.beginPath(); c.moveTo(q.x + Math.cos(an) * 7, y + Math.sin(an) * 7); c.lineTo(q.x + Math.cos(an) * 10, y + Math.sin(an) * 10); c.stroke(); } }
    // Fresita cargada con la lágrima
    if (o.cargada && !(o.stunT > 0)) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, g.fre.x, g.fre.y, 16, '#9ae8ff', .45 + Math.sin(f.t * 8) * .15); c.restore(); }
    // tentáculo: aviso con columna de luz y glifo en el suelo; golpe con un tentáculo de piedra de segmentos
    if (o.atk === 'tentaculo' && o.st === 'ataque' && o.tx != null) {
      if (a < .95) {
        const k = a / .95, gr = c.createLinearGradient(0, o.y, 0, FLOOR); gr.addColorStop(0, rgba(P.core, 0)); gr.addColorStop(1, rgba(P.core, .12 + k * .22));
        c.fillStyle = gr; c.fillRect(o.tx - 9, o.y, 18, FLOOR - o.y);
        c.save(); c.translate(o.tx, FLOOR); c.scale(1, .3); c.strokeStyle = rgba(P.core, .5 + Math.sin(f.t * 20) * .3); c.lineWidth = 2; c.setLineDash([4, 3]); c.lineDashOffset = f.t * 30; c.beginPath(); c.arc(0, 0, 12 - k * 3, 0, TAU); c.stroke(); c.setLineDash([]); c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 5 + k * 3, 0, TAU); c.stroke(); c.restore();
        for (let n = 0; n < 3; n++) { const yy = FLOOR - ((f.t * 40 + n * 13) % 40); c.fillStyle = rgba(P.c, .6); c.fillRect(o.tx - 6 + n * 5, yy, 1, 1); }
      } else if (a < 1.45) {
        const u = clamp((a - .95) / .12, 0, 1) * (a > 1.32 ? clamp((1.45 - a) / .13, 0, 1) : 1), sx = o.x, sy = o.y + 12, N = Math.max(18, Math.ceil(Math.hypot(o.tx - o.x, FLOOR - sy) / 2.6)), ex = o.tx, ey = FLOOR - 2, cxp = (sx + ex) / 2 + (ex > sx ? -24 : 24), cyp = (sy + ey) / 2 - 10;
        const pt = (q) => [(1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cxp + q * q * ex, (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cyp + q * q * ey];
        const n = Math.max(1, Math.floor(N * u));
        // el cuerpo continuo (de grueso a delgado) y encima los anillos de piedra
        c.lineCap = 'round'; for (let i = 1; i < n; i++) { const q0 = (i - 1) / (N - 1), q1 = i / (N - 1), [x0, y0] = pt(q0), [x1, y1] = pt(q1); c.strokeStyle = P.b; c.lineWidth = lerp(9, 4, q1); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
        for (let i = 0; i < n; i += 3) { const q = i / (N - 1), [x, y] = pt(q), r = lerp(4.8, 2.2, q) + Math.sin(f.t * 12 + i) * .2; c.fillStyle = P.a; c.beginPath(); c.ellipse(x, y - r * .25, r * .8, r * .5, 0, 0, TAU); c.fill(); if (i % 6 === 3) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 4, P.core, .7); c.restore(); } }
        if (u > .95) {
          const [x, y] = pt(1); c.strokeStyle = P.b; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(x + 3, y - 3, 3, Math.PI, Math.PI * 2.6); c.stroke();
          const k = clamp((a - 1.07) / .35, 0, 1); c.strokeStyle = rgba(P.c, 1 - k); c.lineWidth = 1.2; c.beginPath(); c.ellipse(ex, FLOOR, 8 + k * 26, 2 + k * 4, 0, 0, TAU); c.stroke();
          c.strokeStyle = rgba(P.b, .8 * (1 - k)); c.lineWidth = .7; c.beginPath(); for (const d of [-1, 1]) { c.moveTo(ex, FLOOR); c.lineTo(ex + d * 8, FLOOR - 1); c.lineTo(ex + d * 14, FLOOR); } c.stroke();
        }
      }
    }
    // rayo: el ojo se carga y dispara al suelo; la luz corre por el piso como una ola
    if (o.atk === 'rayo' && o.st === 'ataque') {
      if (o.fx === 'aviso') { const k = a / .85; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y + 2, 6 + k * 14, P.core, .3 + k * .5); c.restore(); c.strokeStyle = rgba(P.core, .3 + Math.sin(f.t * 30) * .2); c.lineWidth = .6; c.beginPath(); c.moveTo(o.x0 - 20, o.ry); c.lineTo(o.x1 + 20, o.ry); c.stroke(); for (let n = 0; n < 10; n++) { const x = lerp(o.x0, o.x1, ((n / 10 + f.t * .5) % 1)); c.fillStyle = rgba('#ffffff', .6); c.fillRect(x, o.ry - .5, 1.4, 1); } }
      if (o.fx === 'rayo') {
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (const [col, lw, al] of [[P.core, 9, .35], [P.core, 4, .7], ['#ffffff', 1.4, 1]]) { c.strokeStyle = rgba(col, al); c.lineWidth = lw; c.beginPath(); c.moveTo(o.x, o.y + 4); c.lineTo(o.x, o.ry); c.stroke(); }
        c.fillStyle = rgba(P.core, .45); c.beginPath(); c.moveTo(o.x0 - 20, o.ry + 4); for (let x = o.x0 - 20; x <= o.x1 + 20; x += 6) c.lineTo(x, o.ry - 3 - Math.abs(Math.sin(x * .08 - f.t * 18)) * 3); c.lineTo(o.x1 + 20, o.ry + 4); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(o.x0 - 20, o.ry - .8, o.x1 - o.x0 + 40, 1.6);
        glowDot(c, o.x, o.ry, 16, P.core, .7); c.restore();
      }
    }
    // los avisos viejos solo quedan para lo que no se redibujó
    if (o.atk !== 'tentaculo' && o.atk !== 'rayo') viejoTell(c, o, f);
  };
})();
