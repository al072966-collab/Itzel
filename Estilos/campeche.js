'use strict';
// =====================================================================
//  CAMPECHE · el lugar del juego, para que ningún fondo sea "montañas
//  de ruido". Da perfiles de horizonte (altura por x) y siluetas de
//  props que cada estilo pinta con su propia técnica:
//    far  : llanura, lomeríos de la sierrita y la pirámide de Edzná
//    mid  : centro histórico: casas de colores, catedral, muralla,
//           baluartes con garitas
//    near : selva baja con dosel irregular, ceibas y palmeras
// =====================================================================
const CAMP = (() => {
  const LAYOUTS = new Map();
  const TYPES = {
    far: [['llano', 3], ['loma', 3], ['piramide', 1.3]],
    mid: [['casas', 6], ['catedral', 1.2], ['muralla', 2.2], ['baluarte', 1.4]],
    near: [['selva', 1]],
  };
  const WID = { llano: [60, 140], loma: [100, 190], piramide: [150, 180], casas: [100, 220], catedral: [74, 82], muralla: [70, 130], baluarte: [46, 56], selva: [260, 340] };
  // colores de fachada del centro histórico (se usan si el estilo los quiere)
  const FACHADAS = ['#e9a3a0', '#f2c76b', '#8fc6c2', '#f0e1c0', '#b9a4d6', '#e88f6a', '#9fc48a', '#7fb2d9'];

  function layout(kind, seed) {
    const key = kind + ':' + seed; let segs = LAYOUTS.get(key); if (segs) return segs;
    const r = rng(seed * 7919 + kind.length * 131 + 17), types = TYPES[kind], tot = types.reduce((s, t) => s + t[1], 0);
    segs = []; let x = -500, last = '';
    while (x < 7000) {
      let t; do { let v = r() * tot, k = 0; while (v > types[k][1]) v -= types[k++][1]; t = types[k][0]; } while ((t === last && (t === 'piramide' || t === 'catedral' || t === 'baluarte')) && types.length > 1);
      const [a, b] = WID[t], w = a + r() * (b - a), s = { t, x0: x, w, s: (r() * 1e6) | 0 };
      if (t === 'casas') { s.fac = []; let fx = x; while (fx < x + w - 8) { const fw = 13 + r() * 12; s.fac.push({ x0: fx, w: Math.min(fw, x + w - fx), h: 17 + r() * 11, top: r() < .16 ? 'espadana' : r() < .12 ? 'cupula' : 'pretil', col: (r() * FACHADAS.length) | 0, doors: r() < .7 }); fx += fw; } }
      segs.push(s); x += w; last = t;
    }
    LAYOUTS.set(key, segs); return segs;
  }
  function find(segs, x) { let lo = 0, hi = segs.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (segs[m].x0 <= x) lo = m; else hi = m - 1; } return segs[lo]; }
  const dome = (d, r) => Math.abs(d) < r ? Math.sqrt(r * r - d * d) : 0;
  const merlons = (u) => (Math.floor(u / 3.2) % 2 === 0 ? 2.2 : 0);

  function h(x, kind, seed) {
    const s = find(layout(kind, seed), x), u = x - s.x0, w = s.w, c = u - w / 2;
    const ground = (kind === 'far' ? 3 : 4) + fbm1(x * .015, seed + 3, 3) * 6;
    switch (s.t) {
      case 'llano': return ground;
      case 'loma': { const k = Math.sin(Math.PI * clamp(u / w, 0, 1)); return ground + Math.pow(k, 1.6) * (16 + hash1(s.s, 1) * 20) + fbm1(x * .06, seed, 2) * 3; }
      case 'piramide': {
        const hw = w * .42, ad = Math.abs(c); let y = ground;
        for (let i = 0; i < 5; i++) if (ad < hw * (1 - i * .15)) y = ground + (i + 1) * 7.5;
        if (ad < hw * .17) y = ground + 5 * 7.5 + 7;                       // templo
        if (ad < hw * .1) y = ground + 5 * 7.5 + 13 + (Math.floor(ad / 2) % 2 ? -2 : 0); // cresteria calada
        return y;
      }
      case 'casas': {
        const fa = s.fac.find(q => x >= q.x0 && x < q.x0 + q.w) || s.fac[s.fac.length - 1], fu = x - fa.x0, fc = fu - fa.w / 2;
        let y = 4 + fa.h;
        if (fa.top === 'pretil') { if (fu < 1.6 || fu > fa.w - 1.6) y += 1.6; }
        else if (fa.top === 'espadana') { const a = Math.abs(fc); if (a < 5) y += 4; if (a < 3) y += 4; if (a < 1.2) y += 2; }
        else if (fa.top === 'cupula') { y += dome(fc, 5.5); if (Math.abs(fc) < .8) y += 6.8; }
        return y;
      }
      case 'catedral': {
        const a = Math.abs(c);
        if (a > w * .22 && a < w * .42) { const tc = a - w * .32; let y = 50; if (Math.abs(tc) < w * .07) y = 58 + dome(tc, w * .07) * .9; if (Math.abs(tc) < 1) y += 7; return y; }
        if (a <= w * .22) return 36 + (w * .22 - a) * .45;
        return 26;
      }
      case 'muralla': { let y = 20 + merlons(u); const gu = u % 42; if (gu > 18 && gu < 24) y = 27 + dome(gu - 21, 3); return y; }
      case 'baluarte': { const e = Math.min(u, w - u); let y = 20 + Math.min(1, e / 7) * 8 + (e > 7 ? merlons(u) : 0); if (Math.abs(c) < 3.2) y = 37 + dome(c, 3.2); return y; }
      case 'selva': return 18 + fbm1(x * .045, seed, 3) * 14 + Math.abs(Math.sin(x * .17 + fbm1(x * .02, seed + 9, 2) * 6)) * 4.5;
    }
    return ground;
  }

  // props (ceibas y palmeras) en un rango de x
  function props(x0, x1, kind, seed) {
    const out = [], r0 = Math.floor(x0 / 40) - 2, r1 = Math.ceil(x1 / 40) + 2;
    for (let k = r0; k <= r1; k++) {
      const a = hash1(k, seed * 3 + 1), x = k * 40 + hash1(k, seed * 3 + 2) * 30;
      if (kind === 'near') { if (a < .2) out.push({ k: 'ceiba', x, h: 48 + hash1(k, seed + 5) * 16, w: 36 + hash1(k, seed + 6) * 14, s: k }); else if (a < .55) out.push({ k: 'palma', x, h: 34 + hash1(k, seed + 7) * 18, lean: (hash1(k, seed + 8) - .5) * .6, s: k }); }
      else if (kind === 'mid') { if (a < .22 && find(layout('mid', seed), x).t !== 'catedral') out.push({ k: 'palma', x, h: 30 + hash1(k, seed + 7) * 14, lean: (hash1(k, seed + 8) - .5) * .5, s: k }); }
      else if (kind === 'far') { if (a < .1) out.push({ k: 'palma', x, h: 14 + hash1(k, seed + 7) * 6, lean: (hash1(k, seed + 8) - .5) * .4, s: k }); }
    }
    return out;
  }

  // silueta de ceiba (yaxche): contrafuertes, tronco recto y copa ancha en pisos de ramas horizontales
  function ceiba(ctx, x, base, hh, w, seed, part) {
    const r = rng(seed * 13 + 5), ty = base - hh * .5, TR = part !== 'crown', CR = part !== 'trunk';
    if (TR) {
    ctx.moveTo(x - 8, base); ctx.quadraticCurveTo(x - 2.8, base - 2, x - 2.3, base - 9); ctx.lineTo(x - 1.7, ty); ctx.lineTo(x + 1.7, ty); ctx.lineTo(x + 2.3, base - 9); ctx.quadraticCurveTo(x + 2.8, base - 2, x + 8, base); ctx.closePath();
    ctx.moveTo(x - 1.2, ty + 1); ctx.lineTo(x - .7, base - hh * .86); ctx.lineTo(x + .7, base - hh * .86); ctx.lineTo(x + 1.2, ty + 1); ctx.closePath();
    }
    for (let t = 0; t < 3; t++) {
      const by = ty - t * hh * .13, span = w * (.5 - t * .12);
      for (const d of [-1, 1]) {
        const ex = x + d * span, ey = by - 2.5 - t;
        if (TR) { ctx.moveTo(x, by + 1.4); ctx.quadraticCurveTo(x + d * span * .5, by - .5, ex, ey); ctx.lineTo(ex, ey + 1.1); ctx.quadraticCurveTo(x + d * span * .5, by + 1.2, x, by + 3); ctx.closePath(); }
        const nb = 3 + (2 - t);
        for (let i = 0; i < nb; i++) { const k = (i + .6) / nb, cx = x + d * span * k + (r() - .5) * 3, cy = by - 3.5 - t - r() * 2.5 + k * 1.5, rx = 4.2 + r() * 3.2, ry = 3 + r() * 1.8; if (CR) { ctx.moveTo(cx + rx, cy); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); } }
      }
    }
    for (let i = 0; i < 4; i++) { const cx = x + (i - 1.5) * 5 + (r() - .5) * 2, cy = base - hh * .88 - r() * 3, rx = 4 + r() * 2.5, ry = 3.2 + r() * 1.5; if (CR) { ctx.moveTo(cx + rx, cy); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); } }
  }
  // silueta de palmera: tronco curvo anillado y penachos colgantes
  function palma(ctx, x, base, hh, lean, seed, t = 0, part) {
    const tx = x + lean * hh, ty = base - hh, sway = Math.sin(t * 1.3 + seed) * 1.2;
    if (part !== 'crown') { ctx.moveTo(x - 1.6, base); ctx.quadraticCurveTo(x + lean * hh * .2 - 1.2, base - hh * .55, tx - .8, ty); ctx.lineTo(tx + .8, ty); ctx.quadraticCurveTo(x + lean * hh * .2 + 1.2, base - hh * .55, x + 1.6, base); ctx.closePath(); }
    if (part === 'trunk') return;
    const fr = 8, L = hh * .42;
    for (let i = 0; i < fr; i++) {
      const a = -Math.PI / 2 + (i / (fr - 1) - .5) * 3.6 + sway * .03, l = L * (.75 + hash1(i, seed) * .4), droop = .55 + Math.abs(i / (fr - 1) - .5) * 1.1;
      const ex = tx + Math.cos(a) * l + sway, ey = ty + Math.sin(a) * l * .55 + l * droop * .5, mx = tx + Math.cos(a) * l * .5, my = ty + Math.sin(a) * l * .5 - 2;
      const nx = -Math.sin(a) * 1.6, ny = Math.cos(a) * 1.6;
      ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mx + nx, my + ny, ex, ey); ctx.quadraticCurveTo(mx - nx, my - ny, tx, ty);
    }
    ctx.moveTo(tx + 2.2, ty); ctx.arc(tx, ty, 2.2, 0, TAU);
  }
  // camino de horizonte listo para rellenar (en coordenadas de la capa)
  function skyline(ctx, x0, x1, base, kind, seed, sc = 1, step = 1.5, off = 0) {
    ctx.moveTo(x0, VH + 8);
    for (let x = x0; x <= x1 + step; x += step) ctx.lineTo(x, base - h(x + off, kind, seed) * sc);
    ctx.lineTo(x1 + step, VH + 8); ctx.closePath();
  }
  function facades(x0, x1, seed) { const out = []; for (const s of layout('mid', seed)) { if (s.x0 > x1) break; if (s.t === 'casas' && s.x0 + s.w > x0) out.push(...s.fac); } return out; }
  return { h, props, ceiba, palma, skyline, facades, FACHADAS, seg: (x, kind, seed) => find(layout(kind, seed), x) };
})();
// horizonte por cuadro (capas no pre-pintadas): reemplazo directo de ridgePath
function campPath(ctx, f, par, base, kind, seed, sc = 1, step = 2) {
  const off = f.cam * par; ctx.beginPath(); CAMP.skyline(ctx, -4, VW + 4, base, kind, seed, sc, step, off);
}
function campProps(ctx, f, par, base, kind, seed, sc = 1, t = 0) {
  const off = f.cam * par; ctx.beginPath();
  for (const q of CAMP.props(off - 60, off + VW + 60, kind, seed)) { const x = q.x - off, b = base - CAMP.h(q.x, kind, seed) * sc + 3; if (q.k === 'ceiba') CAMP.ceiba(ctx, x, b, q.h * sc, q.w * sc, q.s); else CAMP.palma(ctx, x, b, q.h * sc, q.lean, q.s, t); }
}
// ventanas, balcones y portones sobre las fachadas visibles de una capa 'mid'
function campWindows(ctx, f, par, base, seed, sc, col, prob = .55, dark = 'rgba(0,0,0,.22)') {
  const off = f.cam * par;
  for (const fa of CAMP.facades(off - 30, off + VW + 30, seed)) {
    const sx = fa.x0 - off; if (sx > VW + 10 || sx + fa.w < -10) continue;
    const top = base - (4 + fa.h) * sc, bot = base - 4 * sc, n = Math.max(1, Math.floor(fa.w / 6.5)), gap = fa.w / n;
    for (let i = 0; i < n; i++) {
      const wx = sx + gap * (i + .5), lit = hash1((fa.x0 | 0) * 7 + i, seed) < prob;
      ctx.fillStyle = lit ? col : dark;
      ctx.beginPath(); ctx.moveTo(wx - 1.2 * sc, top + 9 * sc); ctx.lineTo(wx - 1.2 * sc, top + 5 * sc); ctx.arc(wx, top + 5 * sc, 1.2 * sc, Math.PI, 0); ctx.lineTo(wx + 1.2 * sc, top + 9 * sc); ctx.fill();
      if (fa.doors && i === (n >> 1)) { ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(wx - 1.8 * sc, bot); ctx.lineTo(wx - 1.8 * sc, bot - 5 * sc); ctx.arc(wx, bot - 5 * sc, 1.8 * sc, Math.PI, 0); ctx.lineTo(wx + 1.8 * sc, bot); ctx.fill(); }
    }
  }
}
// fragatas planeando (las aves del Golfo): lámina de ChatGPT (Roguelike/fauna.js). Con un color de tinta
// fuerte (el ocaso) van a contraluz; con uno tenue, de lejos y algo transparentes.
function fragatas(ctx, f, n, seed, col, y0, spread = 50) {
  if (!window.FAUNA_ARTE || !FAUNA_ARTE.listo('fragata')) return;   // sin la lámina no se dibuja nada (nada de figuras)
  const al = +((col.match(/,\s*([\d.]+)\)\s*$/) || [0, 1])[1]), contra = al > .7;
  for (let i = 0; i < Math.min(n, 4); i++) {
    const a = hash1(i, seed), b = hash1(i, seed + 1), x = wrap(a * 700 - f.t * (5 + b * 4) - f.cam * .08, VW + 80) - 40, y = y0 + b * spread + Math.sin(f.t * .7 + i) * 2.5;
    const s = .8 + hash1(i, seed + 2) * .5;
    FAUNA_ARTE.dib(ctx, 'fragata', f.t * .6 + i * .4, x, y, { w: 9 * s, ay: .5, fps: 4, seq: [3, 3, 1, 0, 1, 3, 2], voltea: true, alfa: contra ? .9 : Math.min(1, al + .35), filtro: contra ? 'brightness(.28) saturate(.6)' : undefined });
  }
}
