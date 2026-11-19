'use strict';
// =====================================================================
//  LA GRIETA: la rasgadura de la Ruptura, con su remolino, sus orillas
//  encendidas y los hilos rotos del cielo. La usan la entrada (en el cielo
//  de Campeche) y el viaje entre mundos (chiquita, en el aire).
//  P es el trazo de abajo hacia arriba; se dibuja con el ctx ya colocado.
// =====================================================================
const GRIETA = (() => {
  function dibuja(ctx, P, { T, alto = 1, ancho = 0, aspira = .35, cx0 = 0, cy0 = 0, fotos = [] }) {
    const n = Math.max(3, Math.ceil(P.length * alto)), izq = [], der = [];
    // una rasgadura de orillas suaves: las dos orillas ondulan por su cuenta y respiran despacio
    for (let i = 0; i < n; i++) {
      const u = i / (P.length - 1), w = ancho * Math.pow(Math.sin(Math.PI * clamp(u * 1.02, 0, 1)), .72);
      izq.push([P[i][0] - w * .5 * (1 + .13 * Math.sin(u * 13 + 1.3) + .07 * Math.sin(u * 31 + T * .9)) - .6, P[i][1]]);
      der.push([P[i][0] + w * .5 * (1 + .12 * Math.sin(u * 11 + 4.1) + .07 * Math.sin(u * 27 - T * .8)) + .6, P[i][1]]);
    }
    const curva = (q, inicio) => { if (inicio) ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length - 1; i++) ctx.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2); ctx.lineTo(q[q.length - 1][0], q[q.length - 1][1]); };
    const forma = () => { ctx.beginPath(); curva(izq, true); curva(der.slice().reverse()); ctx.closePath(); };
    const orilla = q => { ctx.beginPath(); curva(q, true); };
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // resplandor: varias pasadas anchas y tenues, cian de un lado y magenta del otro
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [lw, a] of [[34, .035], [20, .05], [10, .08]]) { const k = lw * (.5 + ancho / 110); orilla(izq); ctx.lineWidth = k; ctx.strokeStyle = 'rgba(80,240,230,' + a + ')'; ctx.stroke(); orilla(der); ctx.lineWidth = k; ctx.strokeStyle = 'rgba(255,70,190,' + a + ')'; ctx.stroke(); }
    ctx.restore();
    // adentro: un remolino que va del violeta profundo a una luz blanca en el centro
    forma(); const fondo = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, 132);
    fondo.addColorStop(0, '#fff6fd'); fondo.addColorStop(.05, '#ffc2f0'); fondo.addColorStop(.15, '#d648c8'); fondo.addColorStop(.34, '#5c279e'); fondo.addColorStop(.62, '#1c1254'); fondo.addColorStop(1, '#080618');
    ctx.fillStyle = fondo; ctx.fill();
    if (ancho > 4) {
      ctx.save(); forma(); ctx.clip();
      const gira = T * (.5 + aspira * .55), ex = .62, pos = (r, a) => [cx0 + Math.cos(a) * r * ex, cy0 + Math.sin(a) * r];
      // brazos del remolino: cada uno se aprieta y se enciende hacia el centro
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const brazo = (a0, col, an) => { for (let tramoB = 0; tramoB < 4; tramoB++) { ctx.beginPath(); for (let j = 0; j <= 7; j++) { const v = (tramoB + j / 7) / 4, r = 124 * Math.pow(1 - v, 1.7) + 3, [x, y] = pos(r, a0 + v * 5.4 - gira); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = rgba(col, an * (.2 + tramoB * .24)); ctx.lineWidth = 4.2 - tramoB * .8; ctx.stroke(); } };
      for (let b = 0; b < 6; b++) { const a0 = b / 6 * TAU; brazo(a0, b % 2 ? '#ff5ad0' : '#62f4ff', .55); brazo(a0 + .35, b % 3 ? '#8a6aff' : '#ffd27a', .24); }
      // estrellas que caen en espiral, estiradas por la velocidad
      ambient(80, 63, (i, h1, h2, h3) => {
        const f = wrap(T * (.1 + h3 * .16) * (.7 + aspira) + h1, 1), r = 122 * Math.pow(1 - f, 1.5) + 3, r2 = r * 1.12 + 1.5, a = h2 * TAU + f * 4.6 - gira * .5, [x, y] = pos(r, a), [x2, y2] = pos(r2, a - .16);
        ctx.strokeStyle = i % 4 === 0 ? '#ffd9f4' : i % 4 === 1 ? '#a8f6ff' : '#ffffff'; ctx.globalAlpha = Math.sin(f * Math.PI) * (.45 + h3 * .5); ctx.lineWidth = .35 + h3 * .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      });
      ctx.restore();
      // pedazos de los otros mundos: entran grandes y se van encogiendo hacia el centro
      fotos.forEach((foto, i) => {
        const u = wrap(T * .055 * (.7 + aspira) + i / fotos.length, 1), r = lerp(118, 7, Math.pow(u, 1.35)), a = i * 2.4 + u * 6 - gira * .6, [x, y] = pos(r, a), s = lerp(.15, .025, u), w = foto.width * s, h = foto.height * s;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + u * 3); ctx.globalAlpha = smooth(0, .08, u) * (1 - smooth(.72, .97, u)) * .95;
        ctx.beginPath(); ctx.moveTo(-w * .5, -h * .28); ctx.quadraticCurveTo(-w * .42, -h * .52, -w * .1, -h * .5); ctx.lineTo(w * .42, -h * .46); ctx.quadraticCurveTo(w * .54, -h * .3, w * .5, h * .18); ctx.lineTo(w * .26, h * .5); ctx.quadraticCurveTo(-w * .2, h * .56, -w * .44, h * .34); ctx.closePath();
        ctx.save(); ctx.clip(); ctx.drawImage(foto, -w / 2, -h / 2, w, h); ctx.fillStyle = 'rgba(60,20,120,' + (u * .5) + ')'; ctx.fillRect(-w, -h, w * 2, h * 2); ctx.restore();
        ctx.lineWidth = .5; ctx.strokeStyle = 'rgba(160,255,250,.6)'; ctx.stroke(); ctx.restore();
      });
      // la orilla hacia adentro se hunde en sombra: da profundidad
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; for (const [q, col] of [[izq, 'rgba(16,10,50,.55)'], [der, 'rgba(30,8,50,.55)']]) { orilla(q); ctx.lineWidth = 11; ctx.strokeStyle = col; ctx.stroke(); } ctx.restore();
      ctx.restore();
    }
    // orillas encendidas, con energía que corre hacia arriba
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [lado, col] of [[izq, '#62f4ff'], [der, '#ff5ad0']]) {
      orilla(lado); ctx.lineWidth = 3.4; ctx.strokeStyle = rgba(col, .4); ctx.stroke(); ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(col, .9); ctx.stroke(); ctx.lineWidth = .45; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.setLineDash([9, 22]); ctx.lineDashOffset = T * 34; ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    // el cielo era una tela bordada: sus hilos rotos se estiran hacia adentro
    if (ancho > 6) for (let i = 2; i < n - 2; i += 3) for (const [lado, sg] of [[izq, 1], [der, -1]]) {
      const q = lado[i], col = ['#c8203a', '#f2b233', '#3f9a5c', '#2f7fc8'][i % 4], l = 8 + hash1(i, sg + 3) * 9 + aspira * 7, sw = Math.sin(T * 3.4 + i) * 1.6;
      ctx.strokeStyle = col; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(q[0] - sg * 3, q[1] - 1); ctx.quadraticCurveTo(q[0] + sg * l * .5, q[1] + sw, q[0] + sg * l, q[1] + sw * 2 + (cy0 - q[1]) * .05); ctx.stroke();
    }
    // polvo de luz que la grieta se va tragando, en curva, desde lejos
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ambient(Math.round(26 + aspira * 44), 59, (i, h1, h2, h3) => {
      const f = wrap(T * (.2 + h3 * .25) * (.6 + aspira) + h1, 1), e = EASE.in3(f), an = h2 * TAU + f * 1.9, r = lerp(95 + h3 * 110, ancho * .3, e), x = cx0 + Math.cos(an) * r * 1.5, y = cy0 + 18 + Math.sin(an) * r, an2 = an - .1, r2 = r * (1 + .08 + e * .22), x2 = cx0 + Math.cos(an2) * r2 * 1.5, y2 = cy0 + 18 + Math.sin(an2) * r2;
      ctx.strokeStyle = i % 3 ? '#9ff8ff' : i % 2 ? '#ff9ae6' : '#ffe8b0'; ctx.globalAlpha = Math.sin(f * Math.PI) * (.3 + aspira * .5); ctx.lineWidth = .5 + h3 * .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    });
    // el viento: arcos largos y tenues que se cierran sobre la grieta
    if (aspira > .45) { const v = (aspira - .45) / .55; for (let i = 0; i < 12; i++) { const f = wrap(T * .28 + i / 12, 1), r = lerp(250, 70, f), a0 = i * 2.1 + f * 1.4; ctx.globalAlpha = Math.sin(f * Math.PI) * .13 * v; ctx.strokeStyle = '#d8f8ff'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(cx0, cy0 + 18, r * 1.45, r, 0, a0, a0 + .7 + (1 - f) * .5); ctx.stroke(); } }
    ctx.restore();
    ctx.restore();
  }
  // un trazo ya listo, de 228 de alto y centrado en 0, para colocarlo con translate y scale
  function trazo(sem) { const r = rng(sem), P = []; for (let y = 114; y > -114; y -= 7 + r() * 5) P.push([(r() - .5) * 5 + Math.sin(y * .035 + sem) * 7, y]); return P; }
  return { dibuja, trazo };
})();
