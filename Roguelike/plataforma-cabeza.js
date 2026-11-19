'use strict';
// Controles industriales al fondo: los láseres y el sentido de la gravedad conservan sus señales originales.
(function () {
  if (typeof vestirNivel !== 'function' || typeof NIVELES === 'undefined' || !NIVELES.cabeza) return;
  const V = vestirNivel({ id: 'cyber', nivel: 'cabeza', carpeta: 'plataforma-cabeza', ver: 1 });
  const def = NIVELES.cabeza, antes = def.pinta, PISO = {};
  // y del piso en una columna: la primera fila sólida de la mitad hacia abajo (solo se calcula una vez por columna)
  const pisoY = (j, col) => { if (PISO[col] !== undefined) return PISO[col]; let y = null; for (let r = 5; r < 22; r++) if (PROPIO.solido(j, col, r)) { y = r * T; break; } return (PISO[col] = y); };
  def.pinta = function (c, j, f, capa) {
    if (antes) antes.apply(this, arguments);
    if (capa !== 'atras' || j.def.id !== 'cabeza' || !V.todo()) return;
    const cx = j.cam.x;
    // efectos de tormenta en coordenadas de pantalla (el lienzo sigue a la cámara, así que se traslada de vuelta)
    { const t = j.t || 0, cy0 = j.cam.y || 0; c.save(); c.translate(cx, cy0);
      // un reflector de la plataforma barre las nubes
      c.globalCompositeOperation = 'lighter'; const ang = -Math.PI / 2 + Math.sin(t * .5) * .7, bx = 60, by = VH + 4, L2 = 280, ox = Math.cos(ang + 1.5708) * 18, oy = Math.sin(ang + 1.5708) * 18;
      const lg = c.createLinearGradient(bx, by, bx + Math.cos(ang) * L2, by + Math.sin(ang) * L2); lg.addColorStop(0, 'rgba(120,230,255,.22)'); lg.addColorStop(1, 'rgba(120,230,255,0)');
      c.fillStyle = lg; c.beginPath(); c.moveTo(bx - 3, by); c.lineTo(bx + 3, by); c.lineTo(bx + Math.cos(ang) * L2 + ox, by + Math.sin(ang) * L2 + oy); c.lineTo(bx + Math.cos(ang) * L2 - ox, by + Math.sin(ang) * L2 - oy); c.closePath(); c.fill();
      // relámpago: un destello violeta y blanco que cae rápido, con un ramalazo en zigzag
      const lt = (t % 11); if (lt < .5) { const a = lt < .08 ? lt / .08 : Math.exp(-(lt - .08) * 7); c.fillStyle = 'rgba(190,170,255,' + (.28 * a).toFixed(3) + ')'; c.fillRect(0, 0, VW, VH);
        if (lt < .22) { c.strokeStyle = 'rgba(240,235,255,' + a.toFixed(2) + ')'; c.lineWidth = 1.2; c.beginPath(); let lx = 120 + (Math.floor(t / 11) * 97) % 200, ly = 0; c.moveTo(lx, ly); for (let q = 0; q < 8; q++) { lx += (V.h1(q + Math.floor(t / 11), 5) - .5) * 26; ly += 16; c.lineTo(lx, ly); } c.stroke(); } }
      // chispas eléctricas de neón que flotan y se apagan
      for (let i = 0; i < 26; i++) { const w = VW + 30, x = ((V.h1(i, 51) * w - cx * .3 + Math.sin(t * .9 + i) * 8) % w + w) % w - 15, y = ((V.h1(i, 52) * VH - t * (3 + V.h1(i, 53) * 5)) % VH + VH) % VH, a = Math.max(0, Math.sin(t * 2.4 + i * 1.9)); c.fillStyle = i % 2 ? 'rgba(0,232,255,' + (.8 * a).toFixed(2) + ')' : 'rgba(255,43,214,' + (.8 * a).toFixed(2) + ')'; c.fillRect(x, y, 1.2, 1.2); }
      c.restore(); }
    // lejos (parallax suave): plataformas petroleras, barcos y aerogeneradores sobre el mar, con bruma violeta
    const u = 300, off = (cx * .12) % u, base = Math.floor(cx * .12 / u);
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k, h = V.h1(i, 3); V.spr(c, ['plataformaPetro', 'barco0', 'eolicas', 'barco1', 'torrePetro'][Math.floor(h * 5)], cx + k * u - off + h * 80, 188, { ay: 1, alfa: .55 }); }
    // cerca (en el mundo): grúas, tanques y máquinas sobre el piso, y cables colgando del techo; solo escenario, atrás de lo jugable
    const c0 = Math.floor((cx - 60) / T), c1 = Math.ceil((cx + VW + 60) / T);
    for (let col = c0; col <= c1; col++) {
      const h = V.h1(col, 11), cuarto = Math.floor(col / 9);
      if (col % 9 !== 4 || V.h1(cuarto, 5) < .15) continue;
      const py = pisoY(j, col); if (py === null) continue;
      const n = ['grua', 'tanques', 'maquina0', 'tanquesTorre', 'portico', 'transformador', 'esfera', 'bomba', 'gruaBrazo', 'antena'][Math.floor(V.h1(cuarto, 7) * 10)];
      V.spr(c, n, col * T + 8, py + .5, { ay: 1, alfa: .62 });
    }
    for (let col = c0; col <= c1; col++) if (col % 13 === 6) V.spr(c, ['cable0', 'cable1', 'cable2'][Math.floor(V.h1(col, 4) * 3)], col * T, 5 * T, { ay: 0, ax: .5, alfa: .5 });
    for (const [col, n] of [[5,'panel-cian'],[32,'panel-rosa'],[58,'lampara'],[82,'panel-cian'],[113,'panel-rosa'],[136,'lampara'],[157,'panel-cian'],[186,'panel-rosa']]) {
      const x = col * T, y = 7.5 * T;
      if (x < cx - 45 || x > cx + VW + 45) continue;
      V.spr(c, n, x, y, { ay: .5, alfa: .42 });
    }
  };
  window.PLATAFORMA_CABEZA_ASSETS = V;
})();
