'use strict';
// =====================================================================
//  PODERES REHECHOS para que ninguno se parezca a otro:
//   · bruma  → FARO: se mantiene el clic y Fresita apunta un haz de luz;
//              las piedras de la niebla solo existen dentro del haz y los
//              aluxes huyen de él (antes era el mismo destello del bosque).
//   · oleo   → REMOLINO DE ÓLEO: atrapa a Itzel, la hace girar y la avienta
//              como resortera; con dos se encadenan (antes era otra columna
//              que subía, igual que el viento).
//   · neon   → AL COMPÁS: clic justo en el pulso: los bloques se sostienen,
//              Itzel rebota alto y las iguanas se marean; fuera de ritmo no
//              pasa nada (antes cambiaba bloques como el interruptor).
//   · sumie  → TINTA EN LA PARED: Fresita mancha una pared y Itzel se agarra
//              y salta desde ahí (antes era otra plataforma temporal).
// =====================================================================
(function () {
  const { POW, ZONAS, ring } = MEC;
  const TAU2 = Math.PI * 2;

  // ======================= FARO (bruma) =======================
  const LARGO = 185, ABRE = .36, DURA = 11;
  const origenFaro = g => ({ x: g.fre.x + (g.fre.face || 1) * 6.5, y: g.fre.y - .8 + Math.sin(g.t * 2) * .45 });
  MEC.ponLuzExtra((g, x, y) => {
    const h = g.haz; if (!h) return false;
    const origen = origenFaro(g), dx = x - origen.x, dy = y - origen.y, d = Math.hypot(dx, dy); if (d > LARGO || d < 2) return d < 2;
    let da = Math.atan2(dy, dx) - h.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    return Math.abs(da) < ABRE + 10 / d;
  });
  POW.farol = { name: 'Faro', help: 'Mueve a Fresita con el cursor. Mantén el clic para detenerla y apuntar el faro. Dentro del haz aparecen las piedras de la niebla y los aluxes huyen. Dura hasta 11 segundos.', cd: .2, drag: true,
    click(g, x, y, c) {
      if (c.up) { if (g.haz) { g.haz.dead = true; g.haz = null; g.fre.cool = .35; return true; } return false; }
      const z = { k: 'faro', tx: x, ty: y, t: 0, ang: Math.atan2(y - g.fre.y, x - g.fre.x) }; g.fre.face = Math.cos(z.ang) < 0 ? -1 : 1; g.zones.push(z); g.haz = z; return true;
    } };
  ZONAS.faro = {
    paso(z, g, dt) {
      z.t += dt; if (z.t > DURA || g.haz !== z) { z.dead = true; if (g.haz === z) { g.haz = null; g.fre.cool = 1.2; } return; }
      // el haz sigue al cursor solo cuando el cursor se mueve; si la cámara avanza con Itzel y el cursor se queda quieto,
      // la mira se queda donde estaba en el mundo (antes se iba con la cámara y era incómodo apuntar)
      if (MOUSE.active) {
        if (z.mx !== undefined && (z.mx !== MOUSE.x || z.my !== MOUSE.y)) { z.tx = g.cam + MOUSE.x; z.ty = MOUSE.y + (g.camY || 0); }
        z.mx = MOUSE.x; z.my = MOUSE.y;
      }
      const ax = z.tx - g.fre.x, ay = z.ty - g.fre.y; if (Math.hypot(ax, ay) < 14) return; // tan cerca de Fresita no hay dirección: se queda como iba
      let da = Math.atan2(ay, ax) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); z.ang += da * Math.min(1, dt * 18); if (Math.abs(Math.cos(z.ang)) > .05) g.fre.face = Math.cos(z.ang) < 0 ? -1 : 1;
    },
    pinta(ctx, z, f) {
      const fr = f.g.fre, origen = origenFaro(f.g), a = z.ang, fin = Math.min(1, (DURA - z.t) * 2), queda = 1 - z.t / DURA;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(origen.x, origen.y, 0, origen.x, origen.y, LARGO); gr.addColorStop(0, `rgba(255,250,225,${.55 * fin})`); gr.addColorStop(1, 'rgba(255,250,225,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(origen.x, origen.y); ctx.arc(origen.x, origen.y, LARGO, a - ABRE, a + ABRE); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,240,${.5 * fin})`; for (let k = 0; k < 10; k++) { const u = ((f.t * .3 + k * .37) % 1), da = (hash1(k, 7) - .5) * ABRE * 1.6, d = 20 + u * (LARGO - 30); ctx.beginPath(); ctx.arc(origen.x + Math.cos(a + da) * d, origen.y + Math.sin(a + da) * d, .7, 0, TAU2); ctx.fill(); }
      ctx.restore();
      // la mira: adónde está apuntando, y cuánta luz le queda al faro
      ctx.strokeStyle = 'rgba(20,16,12,.7)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(z.tx, z.ty, 5, 0, TAU2); ctx.stroke();
      ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(z.tx, z.ty, 5, 0, TAU2); ctx.stroke();
      ctx.fillStyle = '#fff6d8'; ctx.fillRect(z.tx - .8, z.ty - .8, 1.6, 1.6);
      ctx.fillStyle = 'rgba(20,16,12,.7)'; ctx.fillRect(fr.x - 11, fr.y - 15, 22, 3.4);
      ctx.fillStyle = queda < .25 && Math.sin(f.t * 14) > 0 ? '#ff8a5a' : '#ffe9a8'; ctx.fillRect(fr.x - 10, fr.y - 14, 20 * queda, 1.4);
    },
  };

  // ======================= REMOLINO DE ÓLEO (oleo) =======================
  POW.remolino = { name: 'Remolino de óleo', help: 'Clic: un remolino pintado. Si Itzel entra, la atrapa, la hace girar y la avienta hacia arriba como resortera (salta para soltarte antes). Puedes tener dos y encadenarlos.', cd: .45,
    click(g, x, y) {
      if (SOLID(x, y)) return false;
      const vivos = g.zones.filter(z => z.k === 'orbita' && !z.dead); if (vivos.length >= 2) vivos[0].dead = true;
      g.zones.push({ k: 'orbita', cx: x, cy: y, r: 24, life: 6, t: 0, cool: 0 }); return true;
    } };
  ZONAS.orbita = {
    paso(z, g, dt) {
      const p = g.p; z.t += dt;
      if (!z.cap) {
        if (z.cool > 0) { z.cool -= dt; return; }
        if (g.orbitando && g.orbitando !== z && !g.orbitando.dead) return;
        if (Math.hypot(p.x - z.cx, p.y - 8 - z.cy) < z.r + 7) { z.cap = { a: Math.atan2(p.y - 8 - z.cy, p.x - z.cx), sen: p.vx < -5 ? -1 : 1, rec: 0 }; g.orbitando = z; z.life = Math.max(z.life, 2.5); }
        return;
      }
      const c = z.cap, w = 8 * c.sen; c.a += w * dt; c.rec += Math.abs(w) * dt;
      const tx = -Math.sin(c.a) * c.sen, ty = Math.cos(c.a) * c.sen;
      p.x = z.cx + Math.cos(c.a) * z.r; p.y = z.cy + Math.sin(c.a) * z.r + 8;
      p.vx = tx * 190; p.vy = ty * 190 - G * dt; p.on = false; p.plat = null; p.noCut = true; p.boost = .12; p.face = c.sen; p.coyote = 0;
      // se suelta sola en diagonal hacia arriba y adelante (después de casi una vuelta), o antes si Itzel salta
      if (p.jb > 0 || (c.rec > 4.2 && ty < -.55 && tx * c.sen > .55)) {
        p.jb = 0; p.vx = tx * 340; p.vy = ty * 480; p.boost = .45; z.cap = null; z.cool = .7; g.orbitando = null;
        spawn(g, 16, p.x, p.y - 6, { v: 90, life: .5, s: 2, k: 'spark', cols: ['#f8e27a', '#5a8ad8', '#ffffff'] });
      }
    },
    pinta(ctx, z, f) {
      const a = Math.min(1, z.life) * (z.cap ? 1 : .8), t = f.t * (z.cap ? 5 : 2);
      ctx.save(); ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) { const r = z.r * (.35 + k * .22); ctx.strokeStyle = k % 2 ? `rgba(248,226,122,${.8 * a})` : `rgba(90,138,216,${.85 * a})`; ctx.lineWidth = 2.2 - k * .3; ctx.beginPath(); ctx.arc(z.cx, z.cy, r, t + k * 1.3, t + k * 1.3 + 4.2); ctx.stroke(); }
      ctx.fillStyle = `rgba(255,250,230,${.9 * a})`; ctx.beginPath(); ctx.arc(z.cx, z.cy, 1.6, 0, TAU2); ctx.fill();
      ctx.restore();
    },
  };

  // ======================= AL COMPÁS (neón) =======================
  // el clic cuenta si cae a esta distancia del compás (en segundos); lo verde en pantalla mide exactamente esto
  const VENTANA = .2, enCompas = g => { const per = g.beatAuto || 1.6, t = g.beatT || 0; return Math.min(t, per - t) < VENTANA; };
  function brinco(g) { const p = g.p; p.vy = -JUMP * 1.22; p.on = false; p.noCut = true; p.plat = null; p.coyote = 0; p.sq = -.28; }
  POW.pulso = { name: 'Al compás', help: 'Clic cuando el aro se cierra y se pone verde: los bloques de neón se quedan como están dos tiempos, Itzel rebota muy alto si está en el suelo y las iguanas cercanas se marean. Fuera de ritmo no pasa nada.', cd: .3,
    click(g) {
      const per = g.beatAuto || 1.6, t = g.beatT || 0, p = g.p;
      if (enCompas(g)) {
        const pisa = p.on || p.coyote > 0;
        g.holdBeats = 2; g.compas = { t: .7, ok: true, txt: pisa ? '¡Brinca!' : '¡A tiempo!' }; ring(g, g.fre.x, g.fre.y, '#ff2bd6', 70, .6); ring(g, p.x, p.y - 6, '#00e8ff', 40, .5);
        if (pisa) brinco(g); else g.rebote = .14; // si le faltaba poquito para caer, brinca al tocar el piso
        for (const e of g.foes) if (e.st === 'ok' && Math.hypot(e.x - p.x, e.y - p.y) < 95) { e.st = 'sleep'; e.tt = 2.2; }
        spawn(g, 20, p.x, p.y, { v: 110, life: .5, s: 2, k: 'spark', cols: ['#ff2bd6', '#00e8ff', '#ffffff'] });
      } else { g.compas = { t: .6, ok: false, txt: t > per / 2 ? 'muy pronto' : 'muy tarde' }; ring(g, g.fre.x, g.fre.y, '#6a5a7a', 14, .3); }
      return true;
    } };
  // el aro que marca el pulso, alrededor de Fresita
  ZONAS.metronomo = {
    paso(z, g, dt) {
      if (g.compas) { g.compas.t -= dt; if (g.compas.t <= 0) g.compas = null; }
      g.pideSalto = Math.max(0, (g.pideSalto || 0) - dt);
      if (g.rebote > 0) { g.rebote -= dt; if (g.p.on) { g.rebote = 0; brinco(g); } }
    },
    pinta(ctx, z, f) {
      const g = f.g, fr = g.fre, p = g.p, per = g.beatAuto || 1.6, ya = enCompas(g), falta = per - (g.beatT || 0), r = ya ? 5 : 5 + 20 * falta / per, sin = g.def && g.def.sinSalto;
      const VERDE = '#3dff8a', ROSA = '#ff2bd6', AZUL = '#00e8ff', letra = (txt, x, y, px, col) => { ctx.font = `800 ${px}px "Alegreya Sans", sans-serif`; ctx.lineWidth = 2.4; ctx.strokeStyle = '#14062a'; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); };
      ctx.save(); ctx.textAlign = 'center'; ctx.strokeStyle = ya ? VERDE : 'rgba(255,43,214,.75)'; ctx.lineWidth = ya ? 2 : 1; ctx.shadowColor = ya ? VERDE : ROSA; ctx.shadowBlur = 4 * f.S;
      ctx.beginPath(); ctx.arc(fr.x, fr.y, r, 0, TAU2); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,232,255,.5)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(fr.x, fr.y, 5, 0, TAU2); ctx.stroke();
      if (g.holdBeats > 0) { ctx.fillStyle = AZUL; for (let k = 0; k < g.holdBeats; k++) { ctx.beginPath(); ctx.arc(fr.x - 3 + k * 6, fr.y - 12, 1.3, 0, TAU2); ctx.fill(); } }
      if (sin) {
        // el aro alrededor de Itzel: se cierra hasta el círculo fijo y ahí es el clic. En el aire no sale, porque no podría brincar.
        const pisa = p.on || p.coyote > 0, cy = p.y - 8, R = 13;
        if (pisa) {
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(p.x, cy, R, 0, TAU2); ctx.stroke();
          ctx.strokeStyle = ya ? VERDE : ROSA; ctx.lineWidth = ya ? 2.4 : 1.1; ctx.beginPath(); ctx.arc(p.x, cy, ya ? R : R + 30 * falta / per, 0, TAU2); ctx.stroke();
          if (ya) { ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(61,255,138,.16)'; ctx.beginPath(); ctx.arc(p.x, cy, R, 0, TAU2); ctx.fill(); letra('¡CLIC!', p.x, p.y - 27, 11, VERDE); }
        }
        // la barra de ritmo: los puntos llegan al centro; cuando entran a la caja, es el clic
        const cx = g.cam + VW / 2, y = (g.camY || 0) + 27, largo = 84, caja = VENTANA / per * largo;
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(20,6,42,.72)'; ctx.fillRect(cx - largo - 8, y - 9, (largo + 8) * 2, 18);
        ctx.strokeStyle = 'rgba(255,43,214,.7)'; ctx.lineWidth = .8; ctx.strokeRect(cx - largo - 8 + .5, y - 9 + .5, (largo + 8) * 2 - 1, 17);
        ctx.fillStyle = ya ? VERDE : 'rgba(61,255,138,.14)'; ctx.fillRect(cx - caja, y - 8, caja * 2, 16);
        ctx.strokeStyle = VERDE; ctx.lineWidth = ya ? 1.6 : 1; ctx.strokeRect(cx - caja, y - 8, caja * 2, 16);
        ctx.fillStyle = ya ? '#14062a' : AZUL;
        for (const k of [0, 1]) for (const s of [-1, 1]) { const dx = (falta + k * per) / per * largo; if (dx < largo + 4) { ctx.beginPath(); ctx.arc(cx + s * dx, y, 3.4, 0, TAU2); ctx.fill(); } }
        if ((g.beatT || 0) < VENTANA) { ctx.beginPath(); ctx.arc(cx, y, 3.4, 0, TAU2); ctx.fill(); }
        if (ya) for (const s of [-1, 1]) letra('¡CLIC!', cx + s * 50, y + 4.5, 13, VERDE);
        if (g.pideSalto > 0 && !g.compas) { ctx.globalAlpha = Math.min(1, g.pideSalto * 3); letra('Solo brinca con el clic de Fresita', p.x, p.y - 27, 8, '#ffffff'); ctx.globalAlpha = 1; }
      }
      if (g.compas) { ctx.shadowBlur = 0; const q = g.compas, sube = (1 - q.t) * 8; ctx.globalAlpha = Math.min(1, q.t * 3); if (sin) letra(q.txt, p.x, p.y - 34 - sube, 10, q.ok ? '#ffffff' : '#ffb0b0'); else letra(q.txt, fr.x, fr.y - 16 - sube, 7, q.ok ? '#ffffff' : 'rgba(200,190,220,.9)'); }
      ctx.restore();
    },
  };
  // en el mundo de neón el aro sale desde el principio
  const iniPrev = MEC.init;
  MEC.init = function (g, def, ents) { const r = iniPrev.apply(this, arguments); if (def && def.power === 'pulso') g.zones.push({ k: 'metronomo' }); return r; };

  // ======================= TINTA EN LA PARED (sumi-e) =======================
  POW.nube = { name: 'Tinta en la pared', help: 'Clic junto a una pared: Fresita la mancha de tinta. Itzel se agarra de la mancha (se resbala despacio) y salta desde ahí: mirando a la pared trepa, mirando afuera se impulsa lejos. Hasta dos manchas.', cd: .4,
    click(g, x, y) {
      // busca la cara de una pared cerca del clic
      for (const dx of [0, -6, 6, -12, 12, -18, 18, -24, 24]) {
        const sx = x + dx; if (!SOLID(sx, y)) continue;
        const col = Math.floor(sx / T);
        // la cara del lado donde se hizo clic (si las dos están libres); si no, la que esté libre
        let fx, lado;
        const izq = !SOLID(col * T - 4, y), der = !SOLID((col + 1) * T + 4, y);
        if (izq && (!der || x < col * T + T / 2)) { fx = col * T; lado = -1; } else if (der) { fx = (col + 1) * T; lado = 1; } else continue;
        let y0 = y - 26, y1 = y + 26; while (y0 < y && !SOLID(fx - lado * 4, y0)) y0 += 4; while (y1 > y && !SOLID(fx - lado * 4, y1)) y1 -= 4;
        const vivas = g.zones.filter(z => z.k === 'tinta' && !z.dead); if (vivas.length >= 2) vivas[0].dead = true;
        g.zones.push({ k: 'tinta', fx, lado, y0, y1, life: 9, t: 0 });
        spawn(g, 14, fx, y, { v: 70, life: .5, s: 2, k: 'dust', cols: ['#1d1b19', '#c23b2e'] });
        return true;
      }
      return false;
    } };
  ZONAS.tinta = {
    paso(z, g, dt) {
      z.t += dt; const p = g.p; if (p.on) return;
      const borde = z.lado < 0 ? p.x + p.w / 2 : p.x - p.w / 2;
      if (Math.abs(borde - z.fx) > 2.5 || p.y - 3 < z.y0 || p.y - p.h > z.y1) return;
      p.vy = Math.min(p.vy, 32); p.coyote = 0; z.agarre = .15;
      // mirando a la pared trepa (salto corto hacia arriba); mirando afuera se impulsa lejos
      if (p.jb > 0) { const trepa = p.face === -z.lado; p.jb = 0; p.vy = -JUMP * (trepa ? .88 : .95); p.vx = z.lado * (trepa ? 40 : 185); p.boost = trepa ? .1 : .2; p.noCut = true; if (!trepa) p.face = z.lado; spawn(g, 8, p.x, p.y - 8, { v: 50, life: .5, s: 1.6, k: 'dust', cols: ['#1d1b19'] }); }
    },
    pinta(ctx, z, f) {
      const a = Math.min(1, z.life, z.t * 4), s = -z.lado; // la tinta se pinta sobre la cara de la pared
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#1d1b19';
      ctx.beginPath(); ctx.moveTo(z.fx, z.y0);
      for (let y = z.y0; y <= z.y1; y += 3) ctx.lineTo(z.fx + s * (2.5 + hash1(Math.floor(y), 3) * 3), y);
      ctx.lineTo(z.fx, z.y1); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 3; k++) { const y = z.y0 + (k + .5) * (z.y1 - z.y0) / 3, l = 4 + hash1(k, 9) * 6 + Math.min(6, z.t * 3); ctx.fillRect(z.fx + s * 1, y, s * 1.2, l); ctx.beginPath(); ctx.arc(z.fx + s * 1.6, y + l, 1.1, 0, TAU2); ctx.fill(); }
      ctx.fillStyle = '#c23b2e'; ctx.fillRect(z.fx + s * 2 - 1.5, z.y0 + 3, 3, 3); // el sello rojo
      if (z.agarre > 0) { z.agarre -= 1 / 60; ctx.strokeStyle = 'rgba(194,59,46,.7)'; ctx.lineWidth = .7; ctx.strokeRect(z.fx + Math.min(0, s * 6), z.y0, 6, z.y1 - z.y0); }
      ctx.restore();
    },
  };
})();
