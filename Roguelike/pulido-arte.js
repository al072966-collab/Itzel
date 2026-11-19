'use strict';
// =====================================================================
//  PULIDO DE ARTE PARA TODOS LOS ESTILOS (ver GUIA_ARTE.md)
//  Solo es dibujo, nunca toca mecánicas ni colisiones:
//    · bruma de profundidad: aclara y desatura lo lejano (mezcla «screen» suave,
//      sirve para cualquier paleta) para que lo jugable se lea primero;
//    · viñeta con tinte cálido y luz: separa el centro de la acción del borde;
//    · motas de luz con parallax (polvo, luciérnagas, ceniza…): el nivel se siente vivo.
//  Un estilo se excluye con st.sinPulido = true. Se carga después de todos los estilos.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined') return;
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const MOTAS = 22;
  for (const id of Object.keys(STYLE_MAP)) {
    const st = STYLE_MAP[id]; if (!st || st.sinPulido || st._pulido) continue; st._pulido = true;
    const sky = st.sky;
    if (sky) st.sky = function (ctx, f) {
      const r = sky.apply(this, arguments);
      try {
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const g = ctx.createLinearGradient(0, VH * .42, 0, VH * .9); g.addColorStop(0, 'rgba(255,236,214,0)'); g.addColorStop(1, 'rgba(255,236,214,.09)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); ctx.restore();
      } catch (e) { ctx.restore(); }
      return r;
    };
    const over = st.over;
    st.over = function (ctx, f) {
      const r = over ? over.apply(this, arguments) : undefined;
      ctx.save();
      // motas de luz: dos capas con parallax distinto (lejos pequeñas y tenues, cerca más grandes)
      ctx.globalCompositeOperation = 'lighter';
      const t = f.t || 0, cam = f.cam || 0;
      for (let i = 0; i < MOTAS; i++) {
        const capa = i % 2, par = capa ? .55 : .25, sp = 3 + h1(i, 1) * 5;
        const x = (((h1(i, 2) * (VW + 60) - cam * par + Math.sin(t * .3 + i) * 6) % (VW + 60)) + VW + 60) % (VW + 60) - 30;
        const y = (((h1(i, 3) * VH - t * sp) % VH) + VH) % VH;
        const a = (.1 + h1(i, 4) * .14) * (.6 + .4 * Math.sin(t * 1.4 + i * 2.1)) * (capa ? 1 : .7);
        ctx.fillStyle = 'rgba(255,238,200,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, capa ? 1.1 : .7, 0, Math.PI * 2); ctx.fill();
      }
      // viñeta suave con calidez en el centro
      ctx.globalCompositeOperation = 'source-over';
      const v = ctx.createRadialGradient(VW / 2, VH * .5, VH * .38, VW / 2, VH * .5, VW * .72);
      v.addColorStop(0, 'rgba(20,10,30,0)'); v.addColorStop(1, 'rgba(20,10,30,.26)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
      ctx.restore();
      return r;
    };
  }
})();
