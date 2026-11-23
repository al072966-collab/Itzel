'use strict';
// Las canciones de cuna de Fresita (clic derecho) son 3 por nivel: aquí se dibujan como tres lunitas bajo los corazones.
(function () {
  if (typeof GANCHOS === 'undefined') return;
  GANCHOS.en('WORLD_HOOK', prev => function (ctx, f, layer) {
    prev.apply(this, arguments);
    const g = f && f.g; if (!g || layer !== 'over' || g.modo || g.isBoss || g.win || !g.def) return;
    const enCine = (typeof CINE !== 'undefined' && CINE.activo && CINE.activo()) || (typeof STATE !== 'undefined' && STATE !== 'play') || g.cine || g.quieta;
    if (enCine) return;   // ni en cinemáticas ni con el juego en pausa: las lunitas y el aviso son solo de jugar
    const m = ctx.getTransform(), x0 = -m.e / m.a + 12 + ((typeof VISTA !== 'undefined' && VISTA.rec) || 0), y0 = -m.f / m.d + 36;
    ctx.save(); ctx.lineJoin = 'round';
    for (let k = 0; k < 3; k++) {
      const llena = k < (g.arrullos === undefined ? 3 : g.arrullos), x = x0 + k * 11;
      ctx.globalAlpha = llena ? 1 : .3; ctx.fillStyle = llena ? '#cdbcff' : '#6c6a88'; ctx.strokeStyle = 'rgba(40,30,70,.85)'; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(x, y0, 4, Math.PI * .5, Math.PI * 1.5, false); ctx.arc(x + 1.8, y0, 3.1, Math.PI * 1.5, Math.PI * .5, true); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    // aviso de las primeras veces: una flecha a las lunas y qué hace el segundo poder de Fresita
    if (g._tutArr === undefined && typeof RUN !== 'undefined') { RUN.tutArrN = RUN.tutArrN || 0; g._tutArr = RUN.tutArrN < 2; if (g._tutArr) RUN.tutArrN++; }
    const usada = g.arrullos !== undefined && g.arrullos < 3;
    if (g._tutArr && !usada && g.t > .6 && g.t < 13) {
      const al = Math.min(1, (g.t - .6) * 2, (13 - g.t) * 1.5), bob = Math.sin(g.t * 5) * 1.6;
      ctx.save(); ctx.globalAlpha = al; ctx.lineJoin = 'round';
      // la flecha, bajo las lunas, apuntándoles
      const ax = x0 + 12, ay = y0 + 9 + bob;
      ctx.fillStyle = '#fff4d6'; ctx.strokeStyle = '#8a1f35'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 5, ay + 6); ctx.lineTo(ax - 1.8, ay + 6); ctx.lineTo(ax - 1.8, ay + 12); ctx.lineTo(ax + 1.8, ay + 12); ctx.lineTo(ax + 1.8, ay + 6); ctx.lineTo(ax + 5, ay + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      // el letrero
      const lineas = ['Segundo poder de Fresita: clic derecho', 'Canta una canción de cuna y duerme a los', 'enemigos de cerca. Solo tienes 3 usos por', 'nivel: son las lunitas de aquí arriba.'];
      ctx.font = '6.2px "Alegreya Sans", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const w = Math.max(...lineas.map(t => ctx.measureText(t).width)) + 12, h = lineas.length * 8 + 8, bx = x0 - 6, by = ay + 14;
      ctx.fillStyle = 'rgba(60,40,30,.25)'; ctx.fillRect(bx + 1.5, by + 1.5, w, h);
      ctx.fillStyle = '#f6f0e2'; ctx.fillRect(bx, by, w, h);
      ctx.strokeStyle = '#c8203a'; ctx.lineWidth = .6; ctx.setLineDash([2.4, 1.6]); ctx.strokeRect(bx + 2, by + 2, w - 4, h - 4); ctx.setLineDash([]);
      lineas.forEach((t, i) => { ctx.fillStyle = i === 0 ? '#8a1f35' : '#2a2228'; ctx.font = (i === 0 ? 'bold ' : '') + '6.2px "Alegreya Sans", sans-serif'; ctx.fillText(t, bx + 6, by + 8 + i * 8); });
      ctx.restore();
    }
  });
})();
