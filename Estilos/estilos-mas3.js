'use strict';
// =====================================================================
//  Segunda tanda (3/3): estilos derivados que re-interpretan otra escena
// =====================================================================
(function () {
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer4 = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
  const TILES = new Map();
  function tile(key, w, h, draw) { if (TILES.has(key)) return TILES.get(key); const c = mkCanvas(w, h); draw(c.getContext('2d'), w, h); TILES.set(key, c); return c; }
  function off(v, name, W, H) { v.offs = v.offs || {}; let c = v.offs[name]; if (!c || c.width !== W || c.height !== H) { c = mkCanvas(W, H); v.offs[name] = c; } const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, W, H); return [c, x]; }


  // ======================= PUNTILLISMO =======================
  function dotTile(key, S, seed) {
    const tw = Math.max(12, Math.round(26 * S));
    return tile(key + tw, tw, tw, (x, w) => { const r = rng(seed); x.fillStyle = '#fff'; for (let i = 0; i < 46; i++) { const cx = r() * w, cy = r() * w, rr = (1.1 + r() * .7) * S; for (const ox of [-w, 0, w]) for (const oy of [-w, 0, w]) { x.beginPath(); x.ellipse(cx + ox, cy + oy, rr * 1.15, rr, r() * 3, 0, TAU); x.fill(); } } });
  }


  // ======================= CAMARA TERMICA =======================
  const IRON = (() => { const st = [[0, '#000010'], [.22, '#2a0a5a'], [.42, '#8a1a7a'], [.6, '#d8402a'], [.78, '#f8a020'], [.92, '#fff070'], [1, '#ffffff']].map(([t, c]) => [t, hex(c)]); const lut = []; for (let i = 0; i < 256; i++) { const t = i / 255; let k = 0; while (k < st.length - 2 && t > st[k + 1][0]) k++; const [t0, a] = st[k], [t1, b] = st[k + 1], u = clamp((t - t0) / (t1 - t0), 0, 1); lut.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]); } return lut; })();

})();
