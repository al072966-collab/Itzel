'use strict';
// =====================================================================
//  AMBIENTE DE CADA MUNDO: una mecánica de clima propia, además de la plataforma,
//  el enemigo y el poder. Es periódica y SIEMPRE avisa antes (rayitas que aparecen
//  ~1.5 s antes), para que se pueda leer y aprovechar:
//    · ocaso  · brisa del Golfo: ráfagas que empujan (a favor y, menos, en contra)
//    · hielo  · ventisca: ráfagas más fuertes a favor y un poco en contra
//    · paper  · térmica: una corriente de aire que levanta (menos gravedad un rato)
//    · fuego  · calor: columnas de aire caliente que levantan, con brasas
//    · cielo  · corrientes suaves que cambian de lado
//  Reglas de seguridad: el viento en contra es mucho más débil que el de a favor y
//  nunca pasa de ~7 % de la velocidad de Itzel; la térmica solo REDUCE la gravedad
//  (más alcance, nunca menos). Se envuelve MEC.env (no se toca el motor).
//  No se aplica a los modos propios (verticales, jarana, pesca…), solo a los 5 mundos.
// =====================================================================
(function () {
  if (typeof MEC === 'undefined' || typeof NIVELES === 'undefined' || typeof STYLE_MAP === 'undefined') return;
  const AMB = {
    //          ciclo  dur   aviso   tipo
    ocaso: { ciclo: 11, dur: 3.2, aviso: 1.5, tipo: 'viento', fav: 24, con: 9, tono: '255,236,214' },
    hielo: { ciclo: 12, dur: 3.6, aviso: 1.5, tipo: 'viento', fav: 30, con: 9, tono: '236,246,255' },
    paper: { ciclo: 10, dur: 2.8, aviso: 1.5, tipo: 'termica', alza: .4, tono: '255,255,255', colores: ['255,110,150', '255,200,50', '80,160,240', '110,200,120', '190,110,230'] },
    fuego: { ciclo: 9, dur: 2.4, aviso: 1.5, tipo: 'termica', alza: .35, tono: '255,170,70', brasas: true },
    cielo: { ciclo: 8, dur: 3.5, aviso: 1.2, tipo: 'viento', fav: 14, con: 8, tono: '210,225,255' },
  };
  // ventana del ciclo: n = número de ciclo, w = segundos dentro, u = fuerza 0..1, av = aviso 0..1
  function fase(a, t) {
    const T = t + a.ciclo * .45, n = Math.floor(T / a.ciclo), w = T - n * a.ciclo;
    const u = w < a.dur ? Math.sin(Math.PI * w / a.dur) ** .6 : 0;
    const av = w > a.ciclo - a.aviso ? (w - (a.ciclo - a.aviso)) / a.aviso : 0;
    // en el ciclo siguiente (el aviso anticipa la dirección del próximo)
    return { n, w, u, av, sig: w > a.ciclo - a.aviso ? n + 1 : n };
  }
  const dirDe = n => (n % 3 === 2 ? -1 : 1);       // dos de cada tres ráfagas son a favor
  const activo = g => g && g.def && AMB[g.def.id] && !g.def.modo ? AMB[g.def.id] : null;

  const envAntes = MEC.env;
  MEC.env = function (g) {
    const e = envAntes.apply(this, arguments), a = activo(g);
    if (!a || g.win) return e;
    const f = fase(a, g.t), p = g.p;
    g.ambienteVista = { id: g.def.id, n: f.n, u: f.u, av: f.av, sig: f.sig };
    if (f.u <= 0) return e;
    if (a.tipo === 'viento') { const d = dirDe(f.n); e.push = (e.push || 0) + f.u * (d > 0 ? a.fav : -a.con); }
    else if (a.tipo === 'termica' && !p.on) e.grav = (e.grav || 1) * (1 - a.alza * f.u);
    return e;
  };

  // señal visual: antes de la ráfaga aparecen rayitas tenues; durante, rayas claras que cruzan
  const R = (i, k) => { let h = (i * 374761393 + k * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function dibuja(ctx, f) {
    const g = f.g, v = g && g.ambienteVista, a = v && AMB[v.id]; if (!a || v.id !== (f.st && f.st.id) && !(f.st && f.st.base)) return;
    const k = Math.max(v.u, v.av * .45); if (k <= .02) return;
    const t = f.t, tono = a.tono, dir = a.tipo === 'viento' ? dirDe(v.u > 0 ? v.n : v.sig) : 1;
    ctx.save(); ctx.lineCap = 'round';
    if (a.tipo === 'viento') {
      // discretas: pocas, finas, cortas y translúcidas (se leen sin tapar el paisaje)
      for (let i = 0; i < 12; i++) {
        const sp = 90 + R(i, 1) * 160, y = 14 + R(i, 2) * 200, len = 10 + R(i, 3) * 22, x = ((R(i, 4) * (VW + 80) + dir * t * sp) % (VW + 80) + VW + 80) % (VW + 80) - 40;
        ctx.strokeStyle = `rgba(${tono},${Math.min(.3, .32 * k).toFixed(3)})`; ctx.lineWidth = .5 + R(i, 5) * .45;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - dir * len * .5, y + Math.sin(t * 3 + i) * 2, x - dir * len, y); ctx.stroke();
      }
    } else {
      for (let i = 0; i < 20; i++) {
        const sp = 50 + R(i, 1) * 70, x = 10 + R(i, 2) * (VW - 20), y = 236 - (((t * sp + R(i, 3) * 240) % 240 + 240) % 240), r = a.brasas ? 1.4 + R(i, 4) * 1.4 : 2.6 + R(i, 4) * 2.2, bal = Math.sin(t * 2.4 + i) * 3;
        ctx.fillStyle = `rgba(${a.colores ? a.colores[i % a.colores.length] : tono},${Math.min(.95, .85 * k * (y / 240 + .4)).toFixed(3)})`;
        if (a.brasas) { ctx.beginPath(); ctx.arc(x + bal, y, r, 0, 6.2832); ctx.fill(); } else { ctx.save(); ctx.translate(x + bal, y); ctx.rotate(t * 2 + i); ctx.fillRect(-r, -r * .6, r * 2, r * 1.2); ctx.restore(); }
      }
    }
    ctx.restore();
  }
  for (const id of Object.keys(AMB)) {
    const st = STYLE_MAP[id]; if (!st) continue; const antes = st.over;
    st.over = function (ctx, f) { if (antes) antes.call(this, ctx, f); try { dibuja(ctx, f); } catch (e) { /* la señal nunca rompe la partida */ } };
  }
  window.AMBIENTE_MUNDOS = AMB;
})();
