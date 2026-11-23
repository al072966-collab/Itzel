'use strict';
// =====================================================================
//  ANOMALÍAS
//  Como un shiny: en algunos niveles salta un destello y, por una grieta
//  chiquita, se cuelan criaturas de otro mundo pintadas con la técnica del
//  mundo donde aparecen. Vencerlas (pisotón, canción de cuna, vitral…) las
//  anota en el libro: cada enemigo tiene una versión por estilo.
//  Salen en 1 de cada 5 niveles; cada «Hilo de la grieta» de las ofrendas
//  suma otro tanto. Para probarlo: ?anomalia=1 en la dirección.
// =====================================================================
const ANOMALIAS = (() => {
  // no se cuelan: los de agua, los que dependen de algo de su mundo (ritmo, techo, madera, lava)
  // y el invasor, que no tiene mundo propio. Los demás se probaron fuera de casa en seis mundos.
  const NO_SE_CUELAN = new Set(['morena', 'pezloro', 'mojarra', 'botete', 'koi', 'medusa', 'foca', 'carcoma', 'aplastador', 'carambano', 'bocina', 'bailarin', 'magma', 'cometa', 'bestia', 'invasor']);
  // los que vuelan nacen en el aire: las conductas de vuelo y los que flotan a su manera (se midió cuáles se hunden si nacen en el piso)
  const AEREOS = new Set(['fly', 'swoop', 'orbit', 'drone']), FLOTAN = new Set(['fantasma', 'soplo', 'tucan', 'pajaro', 'aranaCeniza', 'silbato', 'charran', 'bejuco', 'carpintero', 'cuervo', 'polilla', 'zancudo', 'libelula']);
  const VENCIDO = new Set(['gone', 'sleep', 'glass', 'shell', 'off']);
  const BRILLO = ['#ffffff', '#ffe07a', '#7af0ff', '#ff9be0'];
  const BASE = .2, HILO = .2;
  const id = (k, m) => `anomalia:${k}:${m}`;
  const seCuela = k => !!(ENEMIGO_INFO[k] && MEC.FOE[k] && MEC.FD[k]) && !NO_SE_CUELAN.has(k) && !(MEC.OBJ[k] && MEC.OBJ[k].make); // los que nacen con su objeto tampoco
  const todas = () => Object.keys(ENEMIGO_INFO).filter(seCuela);
  const prob = () => Math.min(.8, BASE + ((RUN && RUN.upg && RUN.upg.anomalia) || 0) * HILO);
  const estilo = () => curStyle().id;
  function especie(g) {
    const m = estilo(), d = g.def || {}, propios = d.fauna || [d.foe], lista = todas().filter(k => !propios.includes(k)), falta = lista.filter(k => !ENCI.tiene(id(k, m)));
    const de = falta.length && Math.random() < .75 ? falta : lista; return de[Math.floor(Math.random() * de.length)];
  }
  // escoge dónde va a brincar: un tramo de piso firme a media altura del nivel
  function prepara(g) {
    const pide = typeof pedido === 'function' && pedido('anomalia');
    if (g.isBoss || g.modo || !g.objs || !(pide || Math.random() < prob())) return;
    const W = L.gw - PAD * 2, cols = [];
    for (let c = Math.floor(W * (pide ? .08 : .3)); c < W * (pide ? .4 : .72); c++) { const y0 = L.surfaceY(c + PAD, 0); if (y0 < 8 || y0 >= 15) continue; let plano = true; for (let k = -3; k <= 3; k++) if (L.surfaceY(c + PAD + k, 0) !== y0) plano = false; if (plano) cols.push(c); }
    if (!cols.length) return;
    const c = cols[Math.floor(Math.random() * cols.length)];
    g.objs.push({ k: 'anomalia', x: (c + PAD) * T + 8, y: L.surfaceY(c + PAD, 0) * T, fase: 'espera', t: 0, foes: [], clave: null });
  }
  function abre(g, o) {
    const n = 2 + (Math.random() < .35 ? 1 : 0), aire = AEREOS.has(MEC.FOE[o.clave].beh) || FLOTAN.has(o.clave) ? 38 : 0;
    for (let i = 0; i < n; i++) { const e = MEC.mkFoe(o.clave, o.x + (i - (n - 1) / 2) * 22, o.y - aire); e.anomalia = true; e.dir = g.p.x < e.x ? -1 : 1; g.foes.push(e); o.foes.push(e); spawn(g, 16, e.x, e.y - 8, { v: 90, life: .6, s: 2, k: 'spark', cols: BRILLO, g: -20 }); }
    g.shake = Math.max(g.shake || 0, .2); ENCI.ver('enemigo:' + o.clave);
  }
  function atrapa(g, o, e) {
    e.atrapada = true; const cual = id(e.k, estilo()), nueva = !ENCI.tiene(cual); ENCI.ver(cual);
    RUN.coins += 2; RUN.anomalias = (RUN.anomalias || 0) + 1; MEC.ring(g, e.x, e.y - 8, '#7af0ff', 30, .5); spawn(g, 22, e.x, e.y - 8, { v: 110, life: .7, s: 2, k: 'spark', cols: BRILLO, g: -10 });
    if (nueva && typeof PROG !== 'undefined') { PROG.s.anomalias = (PROG.s.anomalias || 0) + 1; PROG.save(); }
  }
  function estrella(c, x, y, r, a) {
    c.beginPath(); for (let i = 0; i < 8; i++) { const an = a + i * Math.PI / 4, l = i % 2 ? r * .22 : r; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * l, y + Math.sin(an) * l); } c.closePath(); c.fill();
  }
  MEC.OBJ.anomalia = {
    front: true,
    step(o, g, dt) {
      o.t += dt;
      if (o.fase === 'espera') {
        if (o.x > g.cam + VW - 90) return; // que salte ya bien adentro de la pantalla
        o.fase = 'destello'; o.t = 0; o.clave = especie(g); ENCI.ver('entorno:anomalia');
        if (typeof toast === 'function') toast('¡Destello de anomalía! Algo se está colando', 2600);
      } else if (o.fase === 'destello') { if (o.t >= .9) { abre(g, o); o.fase = 'caza'; o.t = 0; } }
      else {
        for (const e of o.foes) if (!e.atrapada && VENCIDO.has(e.st) && e.y < VH) atrapa(g, o, e);
        if (o.foes.every(e => e.atrapada || !g.foes.includes(e))) { o.dead = true; if (o.foes.some(e => e.atrapada) && typeof toast === 'function') toast(`Anomalía atrapada: ${ENEMIGO_INFO[o.clave][0]}`, 2600); }
      }
    },
    draw(c, o, f) {
      if (o.fase === 'espera') return; const t = f.t, g = f.g, yc = o.y - 30;
      c.save();
      if (o.fase === 'destello') {
        const u = o.t / .9, a = Math.sin(Math.min(1, u * 1.4) * Math.PI);
        c.fillStyle = `rgba(255,255,255,${.34 * Math.max(0, 1 - u * 3.4)})`; c.fillRect(g.cam - 4, (f.y0 || 0) - 4, VW + 8, (f.H || VH) + 8); // un golpe de luz suave, sin parpadeo
        for (let i = 0; i < 9; i++) { const an = i / 9 * TAU + u * 2.4, r = 6 + u * 46, q = 11 * a * (i % 3 === 0 ? 1.1 : .65); c.fillStyle = BRILLO[i % 4]; estrella(c, o.x + Math.cos(an) * r, yc + Math.sin(an) * r * .75, q, u * 2); }
        c.fillStyle = '#ffffff'; estrella(c, o.x, yc, 26 * a, u * 1.4);
        c.font = '800 12px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(20,10,40,.7)'; c.globalAlpha = Math.min(1, a * 2); c.strokeText('¡Destello de anomalía!', o.x, yc - 34); c.fillStyle = '#ffe07a'; c.fillText('¡Destello de anomalía!', o.x, yc - 34); c.globalAlpha = 1;
      }
      // la grieta chiquita por donde se cuelan
      const CU = window.CINE_UTIL; if (CU && CU.grietaAire) { const abre = o.fase === 'destello' ? clamp(o.t / .55, 0, 1) : 1, cierra = o.fase === 'caza' ? clamp(o.t / .7, 0, 1) : 0; if (cierra < 1) CU.grietaAire(c, o.x, yc, 1, 26, abre, cierra, t * 2.5); }
      // el brillo de los colados: estrellitas que giran, como un shiny
      for (const e of o.foes) {
        if (e.atrapada || e.st === 'gone' || !g.foes.includes(e)) continue; const my = e.y - e.h / 2;
        for (let i = 0; i < 5; i++) { const an = t * 2.2 + i / 5 * TAU, r = e.w * .75 + 4, b = (Math.sin(t * 7 + i * 1.7) + 1) / 2; c.globalAlpha = .35 + b * .65; c.fillStyle = BRILLO[i % 4]; estrella(c, e.x + Math.cos(an) * r, my + Math.sin(an) * r * .7, 1.8 + b * 2.4, an); }
        c.globalAlpha = 1;
      }
      c.restore();
    },
  };
  if (typeof COOP !== 'undefined') { const init = COOP.init; COOP.init = g => { init(g); prepara(g); }; }
  return { id, seCuela, todas, prob, prepara, especie };
})();
