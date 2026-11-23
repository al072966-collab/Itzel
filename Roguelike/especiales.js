'use strict';
// =====================================================================
//  DOBLONES DE LORENCILLO: 3 monedas especiales por nivel
//  Están en la cima exacta de un salto largo y completo (casi siempre sobre
//  un barranco o muy alto); si el salto sale corto o bajito, no se alcanzan.
//  Solo Itzel las agarra (Fresita vuela a todos lados: sería trampa).
//  Las posiciones salen de simular los saltos de Itzel (pruebas-especiales.js)
//  y viven en especiales-datos.js. Se guardan por nivel en el progreso.
// =====================================================================
(function () {
  const RADIO_MONEDA = 8;  // radio visible del doblón
  const guardadas = id => PROG.d.doblones?.[id] || [];
  function guarda(id, i) {
    const d = PROG.d.doblones || (PROG.d.doblones = {}), l = d[id] || (d[id] = []);
    if (!l.includes(i)) l.push(i);
    PROG.s.doblones = Object.values(d).reduce((n, v) => n + v.length, 0);
    PROG.save();
  }
  window.DOBLONES = { guardadas, total: () => PROG.s.doblones || 0 };

  // al montar el nivel
  const iniPrev = MEC.init;
  MEC.init = function (g, def, ents) {
    const r = iniPrev.apply(this, arguments);
    const armados = (ents || []).filter(e => e.t === 'doblon').sort((a, b) => a.i - b.i); // en un nivel armado por piezas los pone piezas.js
    let pos = armados.length ? armados.map(e => [e.x, e.y]) : def && !def.modo && typeof ESPECIALES !== 'undefined' && ESPECIALES[def.id];
    if (pos && !armados.length && L.espejo) pos = pos.map(([cx, cy]) => [L.anchoEspejo - cx, cy]); // el nivel va de derecha a izquierda
    g.doblones = (pos || []).map(([cx, cy], i) => ({ i, x: (cx + PAD) * T, y: cy * T, got: false, ya: guardadas(def.id).includes(i), t: i * 1.3 }));
    // Campeche 1-1: el doblón más fácil de la subida se intercambia con el corazón que premia la ruta alta (arriba de todo va el doblón)
    if (def && def.id === 'bits8' && g.pickups) {
      const alto = g.pickups.filter(h => h.k === 'heart' && !h.got && h.y < 0).sort((a, b) => a.y - b.y)[0], d0 = g.doblones.find(d => d.i === 0);
      if (alto && d0) { const x = alto.x, y = alto.y; alto.x = d0.x; alto.y = d0.y; d0.x = x; d0.y = y; d0.alto = true; }
    }
    // red de seguridad: un doblón nunca queda en el aire sin nada que se pueda pisar debajo (los niveles cambian y sus escaleras con ellos)
    const apoyo = (x, y) => { let m = Infinity; const s = L.surfaceY(Math.floor(x / T), 0) * T; if (s >= y && s < VH) m = s - y; for (const p of g.plats || []) if (!p.dead && x >= p.x - 6 && x <= p.x + p.w + 6 && p.y >= y) m = Math.min(m, p.y - y); return m; };
    for (const d of g.doblones) {
      if (apoyo(d.x, d.y) <= 64 || d.alto || (def.id === 'bits8' && d.i === 1)) continue;   // el de Campeche 1-1 está alto a propósito: se alcanza con ladrillos
      let mejor = null; // la plataforma más alta cerca, y si no hay, el piso
      for (const p of g.plats || []) if (!p.dead && p.x + p.w >= d.x - 48 && p.x <= d.x + 48 && (!mejor || p.y < mejor.y)) mejor = p;
      const s = L.surfaceY(Math.floor(d.x / T), 0) * T;
      d.y = mejor && mejor.y < s ? mejor.y - 36 : (s < VH ? s : 176) - 44;
      if (mejor && mejor.y < s) d.x = clamp(d.x, mejor.x + 4, mejor.x + mejor.w - 4);
    }
    // El cielo de los mayas: bajo cada doblón hay una estrellita para tender, con la constelación de Fresita, el camino que lleva a él
    if (def && def.id === 'cielo' && g.objs) for (const d of g.doblones) {
      const estrellas = () => g.objs.filter(o => o.k === 'estrella'), nueva = (x, y) => g.objs.push({ k: 'estrella', x, y, i: estrellas().length });
      if (estrellas().some(o => Math.hypot(o.x - d.x, o.y - (d.y + 22)) < 14)) continue;
      nueva(d.x, d.y + 22);
      // si no hay otra estrella a un tendido de distancia (150 px), una más de apoyo hacia el lado de donde se llega
      if (!estrellas().some(o => o.x !== d.x && Math.hypot(o.x - d.x, o.y - (d.y + 22)) < 150)) nueva(d.x - 80, d.y + 36);
    }
    return r;
  };

  // recogerlos (después del paso normal de Itzel)
  GANCHOS.en('stepRun', pasoPrev => function (g, inp, dt, st) {
    pasoPrev.apply(this, arguments);
    if (!g.doblones || !g.def) return;
    const p = g.p;
    for (const d of g.doblones) {
      d.t += dt;
      const yMoneda = d.y + Math.sin(d.t * 2.6) * 1.6;
      const ancho = (p.w || 10) / 2;
      // El cuerpo completo de Itzel recoge el disco, también al rozarlo con la cabeza.
      if (d.got || d.x + RADIO_MONEDA < p.x - ancho || d.x - RADIO_MONEDA > p.x + ancho ||
          yMoneda + RADIO_MONEDA < p.y - (p.h || 14) - 3 || yMoneda - RADIO_MONEDA > p.y) continue;
      d.got = true; d.brillo = 1;
      const nuevo = !d.ya; guarda(g.def.id, d.i);
      spawn(g, 26, d.x, d.y, { v: 120, life: .9, s: 2.2, k: 'spark', cols: ['#ffe27a', '#fff6c8', '#f2b233', '#ffffff'], g: 40 });
      MEC.ring(g, d.x, d.y, '#ffe27a', 26, .6);
      const n = g.doblones.filter(q => q.got || q.ya).length;
      if (typeof AVISOS === 'function') AVISOS(nuevo ? 'Doblón de Lorencillo' : 'Este doblón ya era tuyo', `${n} de 3 en ${g.def.nombre}`, 'cup');
      if (nuevo && typeof TARJETAS !== 'undefined') TARJETAS.descubre(g.def); // cada doblón nuevo enseña algo de Campeche
      HUDKEY = '';
    }
  });

  // ---------- el dibujo: un doblón de oro con la cruz de Jerusalén, que gira ----------
  function doblon(ctx, x, y, t, pixel, fantasma) {
    const giro = Math.cos(t * 2.2), sx = Math.max(.12, Math.abs(giro)), cara = giro >= 0;
    const yy = y + Math.sin(t * 2.6) * 1.6;
    ctx.save();
    if (fantasma) ctx.globalAlpha = .38;
    if (!pixel && !fantasma) { const gr = ctx.createRadialGradient(x, yy, 1, x, yy, 18); gr.addColorStop(0, 'rgba(255,226,122,.55)'); gr.addColorStop(1, 'rgba(255,226,122,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 18, yy - 18, 36, 36); }
    // listón rojo detrás (no gira): así no se confunde con las monedas del mundo
    if (!fantasma) {
      const ond = Math.sin(t * 4) * .8;
      ctx.fillStyle = pixel ? '#ac3232' : '#c8203a';
      if (pixel) { ctx.fillRect(Math.round(x) - 5, Math.round(yy) + 5, 3, 6); ctx.fillRect(Math.round(x) + 2, Math.round(yy) + 5, 3, 7); ctx.fillStyle = '#5a1020'; ctx.fillRect(Math.round(x) - 5, Math.round(yy) + 10, 3, 1); ctx.fillRect(Math.round(x) + 2, Math.round(yy) + 11, 3, 1); }
      else {
        ctx.beginPath(); ctx.moveTo(x - 2.5, yy + 4); ctx.lineTo(x - 5.5 + ond, yy + 12.5); ctx.lineTo(x - 3.6 + ond, yy + 11.4); ctx.lineTo(x - 2.4 + ond, yy + 13.2); ctx.lineTo(x - .2, yy + 5); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + .2, yy + 5); ctx.lineTo(x + 2.6 - ond, yy + 13.6); ctx.lineTo(x + 3.8 - ond, yy + 11.8); ctx.lineTo(x + 5.8 - ond, yy + 12.8); ctx.lineTo(x + 2.6, yy + 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,215,.7)'; ctx.fillRect(x - 3.4 + ond * .5, yy + 7, .5, 3); ctx.fillRect(x + 2.6 - ond * .5, yy + 7.5, .5, 3);
      }
    }
    ctx.translate(x, yy); ctx.scale(sx, 1);
    const R = 7.6;
    if (pixel) {
      // versión de cuadritos para los mundos de pixel
      const P = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
      P(-4, -8, 8, 16, '#5a3410'); P(-6, -7, 12, 14, '#5a3410'); P(-7, -6, 14, 12, '#5a3410'); P(-8, -4, 16, 8, '#5a3410');
      P(-4, -7, 8, 14, '#f2b233'); P(-6, -6, 12, 12, '#f2b233'); P(-7, -4, 14, 8, '#f2b233');
      P(-3, -6, 4, 1, '#fff2a8'); P(-5, -5, 2, 2, '#fff2a8'); P(-6, -3, 1, 2, '#fff2a8');
      P(3, 3, 2, 2, '#a8661c'); P(4, 1, 2, 2, '#a8661c');
      if (cara) { P(-1, -5, 2, 10, '#8a5216'); P(-5, -1, 10, 2, '#8a5216'); for (const [a, b] of [[-4, -4], [3, -4], [-4, 3], [3, 3]]) P(a, b, 1, 1, '#8a5216'); }
      else { P(-3, -2, 6, 5, '#8a5216'); P(-3, -3, 1, 1, '#8a5216'); P(-1, -3, 2, 1, '#8a5216'); P(2, -3, 1, 1, '#8a5216'); P(-1, 1, 2, 2, '#f2b233'); }
    } else {
      ctx.fillStyle = '#5a3410'; ctx.beginPath(); ctx.arc(0, 0, R + .9, 0, TAU); ctx.fill();
      const g = ctx.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#fff2a8'); g.addColorStop(.45, '#f2b233'); g.addColorStop(1, '#a8661c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
      // canto con muescas (moneda acuñada a mano: un poco irregular)
      ctx.strokeStyle = 'rgba(90,52,16,.55)'; ctx.lineWidth = .5;
      for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * (R - .2), Math.sin(a) * (R - .2)); ctx.lineTo(Math.cos(a) * (R - 1.2), Math.sin(a) * (R - 1.2)); ctx.stroke(); }
      ctx.strokeStyle = '#8a5216'; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(0, 0, R - 1.8, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#8a5216';
      if (cara) {
        // cruz de Jerusalén: una cruz grande y cuatro cruces chicas
        ctx.fillRect(-.8, -4.4, 1.6, 8.8); ctx.fillRect(-4.4, -.8, 8.8, 1.6);
        for (const [a, b] of [[-2.9, -2.9], [2.9, -2.9], [-2.9, 2.9], [2.9, 2.9]]) { ctx.fillRect(a - .25, b - .8, .5, 1.6); ctx.fillRect(a - .8, b - .25, 1.6, .5); }
      } else {
        // reverso: el baluarte de Campeche
        ctx.beginPath(); ctx.moveTo(-3, 2.6); ctx.lineTo(-3, -1); ctx.lineTo(-2, -1); ctx.lineTo(-2, -2.2); ctx.lineTo(-1, -2.2); ctx.lineTo(-1, -1); ctx.lineTo(1, -1); ctx.lineTo(1, -2.2); ctx.lineTo(2, -2.2); ctx.lineTo(2, -1); ctx.lineTo(3, -1); ctx.lineTo(3, 2.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f2b233'; ctx.fillRect(-.6, .6, 1.2, 2);
      }
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-2.4, -3.2, 1.6, .7, -.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
    // destellos
    if (!fantasma && (t * 1.7) % 2.4 < .35) { const k = ((t * 1.7) % 2.4) / .35; ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#fffbe0'; const s = 1 + k * 3; ctx.fillRect(x + 4 - s / 2, yy - 5 - .3, s, .6); ctx.fillRect(x + 4 - .3, yy - 5 - s / 2, .6, s); ctx.restore(); }
  }
  window.dibujaDoblon = doblon;

  GANCHOS.en('WORLD_HOOK', ganchoPrev => function (ctx, f, layer) {
    ganchoPrev.apply(this, arguments);
    const g = f.g; if (layer !== 'under' || !g.doblones) return;
    for (const d of g.doblones) if (!d.got) doblon(ctx, d.x, d.y, d.t, !!f.st.pixel, d.ya);
  });

  // ---------- HUD: tres ranuras por nivel ----------
  GANCHOS.en('hud', hudPrev => function () {
    hudPrev.apply(this, arguments);
    let el = document.getElementById('doblones');
    if (!el) { el = document.createElement('span'); el.id = 'doblones'; el.title = 'Doblones de Lorencillo de este nivel'; const fila = document.querySelector('#hud .hrow'); if (fila) fila.appendChild(el); }
    const l = CUR && CUR.doblones;
    if (!l || !l.length) { el.innerHTML = ''; el.dataset.k = ''; return; }
    const clave = l.map(d => (d.got || d.ya) ? 1 : 0).join('');
    if (el.dataset.k === clave) return; el.dataset.k = clave;
    el.setAttribute('aria-label', `Doblones de este nivel: ${l.filter(d => d.got || d.ya).length} de ${l.length}`);
    el.innerHTML = l.map((d, i) => `<span class="doblon-hud ${d.got || d.ya ? 'conseguido' : ''}" title="Doblón ${i + 1}: ${d.got || d.ya ? 'conseguido' : 'pendiente'}"><canvas width="42" height="42"></canvas></span>`).join('');
    el.querySelectorAll('canvas').forEach((cv, i) => {
      const x = cv.getContext('2d'), conseguido = l[i].got || l[i].ya;
      x.translate(21, 21);
      x.beginPath(); x.arc(0, 0, 15, 0, TAU); x.fillStyle = conseguido ? '#f7bd43' : '#6c5844'; x.fill();
      x.lineWidth = 2; x.strokeStyle = conseguido ? '#fff0ad' : '#cbb28b'; x.stroke();
      x.beginPath(); x.arc(0, 0, 11.5, 0, TAU); x.strokeStyle = conseguido ? '#a46217' : '#988369'; x.lineWidth = 1.3; x.stroke();
      x.fillStyle = conseguido ? '#8a5015' : '#d3bea0'; x.fillRect(-2, -8, 4, 16); x.fillRect(-8, -2, 16, 4);
    });
  });

  // ---------- logros ----------
  if (typeof LOGROS !== 'undefined') {
    const porNivel = () => Object.values(PROG.d.doblones || {}).filter(l => l.length >= 3).length;
    LOGROS.push(
      { id: 'doblon', icon: 'cup', nombre: 'El primer doblón', desc: 'Itzel atrapa un doblón de Lorencillo.', meta: 1, valor: s => s.doblones || 0 },
      { id: 'cofre', icon: 'cup', nombre: 'Cofre completo', desc: 'Junten los 3 doblones de un mismo nivel.', meta: 1, valor: porNivel },
      { id: 'tesoro', icon: 'jade', nombre: 'El tesoro de Lorencillo', desc: 'Junten 45 doblones.', meta: 45, valor: s => s.doblones || 0 },
    );
  }
})();
