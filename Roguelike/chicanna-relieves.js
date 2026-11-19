'use strict';
// Relieves al fondo de cámaras; no intervienen en el mapa ni señalan muros falsos.
(function () {
  if (typeof vestirNivel !== 'function' || typeof NIVELES === 'undefined' || !NIVELES.chicanna) return;
  const V = vestirNivel({ id: 'cinema', nivel: 'chicanna', carpeta: 'chicanna-relieves', ver: 1 });
  const def = NIVELES.chicanna, antes = def.pinta;
  def.pinta = function (c, j, f, capa) {
    if (antes) antes.apply(this, arguments);
    if (capa !== 'atras' || j.def.id !== 'chicanna' || !V.todo()) return;
    // relieves (como antes) más una segunda tanda de columnas, braseros, lianas y fachadas; todo al fondo, tenue y sin marcar muros
    const dec = [[8,4,'mascaron'],[27,4,'serpiente'],[44,4,'mascaron'],[62,4,'serpiente'],[27,19,'mascaron'],[8,34,'serpiente'],[62,34,'mascaron'],
      [17,4,'dragon0'],[36,4,'rostro'],[53,4,'dragon1'],[18,19,'relieve0'],[36,19,'relieve1'],[52,19,'fachada'],[17,34,'relieve0'],[35,34,'dragon1'],[50,34,'fachada'],
      [13,10,'liana0'],[31,10,'liana2'],[48,10,'liana1'],[58,10,'liana0'],[13,26,'liana1'],[40,26,'liana2'],[56,26,'liana0'],
      [4,13,'brasero0'],[23,13,'brasero1'],[40,13,'brasero0'],[58,13,'brasero1'],[4,29,'brasero1'],[30,29,'brasero0'],[46,29,'brasero1']];
    for (const [cx, cy, n] of dec) {
      const x = cx * T, y = cy * T;
      if (x < j.cam.x - 70 || x > j.cam.x + VW + 70 || y < j.cam.y - 70 || y > j.cam.y + VH + 70) continue;
      V.spr(c, n, x, y, { ay: .5, alfa: n.startsWith('brasero') ? .55 : n.startsWith('liana') ? .4 : .3 });
      if (n.startsWith('brasero')) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 5, 14, '#ffae50', .16 + .04 * Math.sin(f.t * 7 + cx)); c.restore(); }
    }
    // brasas que suben de los braseros, polvo en la luz y ojos que brillan en la oscuridad de los muros (mundo, no pantalla)
    const t = f.t || 0; c.save(); c.globalCompositeOperation = 'lighter';
    for (const [cx, cy, n] of dec) if (n.startsWith('brasero')) {
      const x = cx * T, y = cy * T; if (x < j.cam.x - 40 || x > j.cam.x + VW + 40 || y < j.cam.y - 90 || y > j.cam.y + VH + 40) continue;
      for (let q = 0; q < 6; q++) { const ph = (t * .5 + q / 6 + cx * .13) % 1; c.fillStyle = 'rgba(255,' + (150 + q * 14) + ',70,' + (.8 * (1 - ph)).toFixed(2) + ')'; c.fillRect(x + Math.sin(ph * 6 + q) * 3, y - 8 - ph * 34, 1.1, 1.1); }
    }
    for (let i = 0; i < 40; i++) { const wx = j.cam.x + ((V.h1(i, 81) * (VW + 40) - j.cam.x * .08 + Math.sin(t * .5 + i) * 6) % (VW + 40) + VW + 40) % (VW + 40) - 20, wy = j.cam.y + (V.h1(i, 82) * VH + t * (1.5 + V.h1(i, 83) * 2.5)) % VH; c.fillStyle = 'rgba(255,230,190,' + (.12 + .22 * Math.abs(Math.sin(t + i))).toFixed(2) + ')'; c.fillRect(wx, wy, 1, 1); }
    for (let i = 0; i < 9; i++) {
      const ex = (6 + V.h1(i, 91) * 56) * T, ey = (8 + V.h1(i, 92) * 28) * T, open = ((t * .35 + V.h1(i, 93) * 5) % 5) < 3.9; if (!open || ex < j.cam.x - 20 || ex > j.cam.x + VW + 20 || ey < j.cam.y - 20 || ey > j.cam.y + VH + 20) continue;
      glowDot(c, ex - 3, ey, 3, '#ffcf4a', .55); glowDot(c, ex + 3, ey, 3, '#ffcf4a', .55); c.fillStyle = 'rgba(255,240,170,.9)'; c.fillRect(ex - 3.5, ey - .5, 1.6, 1); c.fillRect(ex + 2, ey - .5, 1.6, 1);
    }
    c.restore();
  };
  window.CHICANNA_RELIEVES = V;
})();
