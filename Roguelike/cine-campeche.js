'use strict';
// =====================================================================
//  CINEMÁTICAS · tomas de Campeche (entrada al juego, antes de Itzel)
//  Tres tomas pintadas, con paralaje y vida propia, que se funden entre sí:
//    1 Parque Principal: la catedral, el kiosco, palomas y gente paseando
//    2 La muralla: la Puerta de Tierra, su bandera y un cañón en primer plano
//    3 Una calle del centro: fachadas de colores y papel picado
//  CAMPECHE_TOMAS.prepara() pinta las capas una vez; dibuja(ctx, t, M) las
//  pone en el cuadro de la cinemática (640×360, con el origen al centro).
// =====================================================================
const CAMPECHE_TOMAS = (() => {
  const LARGO = 3.7, CRUCE = .55, PASO = LARGO - CRUCE;
  const DUR = PASO * 2 + LARGO;
  const SOMBRA = '#4a2a3a', LUZ = '#ffd9a0', PIEDRA = '#d9b48a', PIEDRA2 = '#b08a6e', CAL = '#efdcc0';
  let C = null, BUF = null, TEX = null;

  // ---------- pintura ----------
  function capa(x0, y0, w, h, pinta, R = 2, a = .85) {
    const c = mkCanvas(w * R, h * R), x = c.getContext('2d');
    x.scale(R, R); x.translate(-x0, -y0); pinta(x);
    return { c: curte(c, a), x0, y0, w, h };
  }
  // mosaico gris de manchas y grano: sobre cualquier color le da poro de cal, piedra o tierra
  function tejido() {
    const S = 512, c = mkCanvas(S, S), x = c.getContext('2d'), r = rng(41);
    x.fillStyle = '#808080'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++) { const px = r() * S, py = r() * S, w = 6 + r() * 46, h = 3 + r() * 20, a = r() * 3; x.fillStyle = r() < .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.04)';
      for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) ov(x, px + dx, py + dy, w, h, a); }
    const d = x.getImageData(0, 0, S, S), q = d.data; for (let i = 0; i < q.length; i += 4) { const n = (r() - .5) * 46; q[i] += n; q[i + 1] += n; q[i + 2] += n; }
    x.putImageData(d, 0, 0); return c;
  }
  function curte(c, a) {
    TEX = TEX || tejido();
    const t = mkCanvas(c.width, c.height), q = t.getContext('2d');
    q.drawImage(c, 0, 0); q.globalCompositeOperation = 'overlay'; q.globalAlpha = a; q.fillStyle = q.createPattern(TEX, 'repeat'); q.fillRect(0, 0, t.width, t.height);
    q.globalAlpha = 1; q.globalCompositeOperation = 'destination-in'; q.drawImage(c, 0, 0);
    return t;
  }
  const ov = (x, cx, cy, rx, ry, rot = 0) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, TAU); x.fill(); };
  function pincel(x, r, x0, y0, len, w, col, a) {
    const n = 7; x.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / n, hw = w * .5 * Math.pow(Math.sin(Math.PI * clamp(u, .02, .98)), .6) * (.8 + r() * .4); x.lineTo(x0 + len * u, y0 - hw); }
    for (let i = n; i >= 0; i--) { const u = i / n, hw = w * .5 * Math.pow(Math.sin(Math.PI * clamp(u, .02, .98)), .6) * (.8 + r() * .4); x.lineTo(x0 + len * u, y0 + hw); }
    x.closePath(); x.globalAlpha = a; x.fillStyle = col; x.fill(); x.globalAlpha = 1;
  }
  function cielo(x, r, x0, y0, w, y1) {
    const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#47708c'); g.addColorStop(.45, '#b89a92'); g.addColorStop(.75, '#f0b070'); g.addColorStop(1, '#ffd089');
    x.fillStyle = g; x.fillRect(x0, y0, w, y1 - y0);
    for (let i = 0; i < 260; i++) { const y = y0 + r() * (y1 - y0), u = (y - y0) / (y1 - y0); pincel(x, r, x0 + r() * w - 60, y, 50 + r() * 170, 3 + r() * 9, u < .5 ? '#7f9aa8' : '#ffc98a', .1, 0); }
    // nubes con la panza encendida
    for (let k = 0; k < 7; k++) { const cx = x0 + r() * w, cy = y0 + 40 + r() * (y1 - y0) * .6, L = 90 + r() * 160;
      for (let i = 0; i < 26; i++) pincel(x, r, cx + (r() - .5) * L, cy + (r() - .5) * 15, 30 + r() * 80, 4 + r() * 8, r() < .55 ? '#c98a8e' : '#ffcf9a', .34); }
  }
  // sillar: muro de piedra con hiladas, manchas y luz de la tarde
  function muro(x, r, X, Y, W, H, col = PIEDRA) {
    x.fillStyle = col; x.fillRect(X, Y, W, H);
    // cada sillar con su tono, su canto de luz arriba y su junta en sombra
    for (let y = Y, k = 0; y < Y + H; y += 7, k++) for (let xx = X - (k % 2) * 8; xx < X + W;) {
      const w = 14 + r() * 7, a = Math.max(X, xx), b = Math.min(X + W, xx + w), h = Math.min(7, Y + H - y), t = r();
      x.fillStyle = t < .5 ? `rgba(92,58,62,${.02 + (.5 - t) * .2})` : `rgba(255,236,198,${.02 + (t - .5) * .28})`; x.fillRect(a, y, b - a, h);
      x.fillStyle = 'rgba(255,240,210,.3)'; x.fillRect(a + .4, y + .3, b - a - .8, .55);
      x.fillStyle = 'rgba(78,46,52,.3)'; x.fillRect(a, y + h - .5, b - a, .5); x.fillRect(b - .5, y, .5, h);
      xx += w;
    }
    for (let i = 0; i < W * H / 420; i++) { x.fillStyle = r() < .5 ? 'rgba(80,60,55,.09)' : 'rgba(255,225,180,.1)'; ov(x, X + r() * W, Y + r() * H, 2 + r() * 8, 1 + r() * 4); }
  }
  // escurridos de humedad: bajan de cornisas y almenas, oscuros arriba y perdidos abajo
  function escurre(x, r, X, Y, W, H, n, a = .2) {
    for (let i = 0; i < n; i++) { const px = X + r() * W, w = 2 + r() * 9, h = H * (.2 + r() * .8), g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, `rgba(58,44,50,${a})`); g.addColorStop(1, 'rgba(58,44,50,0)');
      x.fillStyle = g; x.beginPath(); x.moveTo(px, Y); x.lineTo(px + w, Y); x.quadraticCurveTo(px + w * .8, Y + h * .6, px + w * (.3 + r() * .4), Y + h); x.quadraticCurveTo(px + w * .2, Y + h * .6, px, Y); x.fill(); }
  }
  // el pie de los muros: tierra y humedad
  function zocalo(x, X, Y, W, H) { const g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, 'rgba(62,58,48,0)'); g.addColorStop(1, 'rgba(62,58,48,.5)'); x.fillStyle = g; x.fillRect(X, Y, W, H); }
  function cornisa(x, X, Y, W, h = 2.6) {
    x.fillStyle = LUZ; x.fillRect(X, Y, W, h); x.fillStyle = 'rgba(255,246,222,.6)'; x.fillRect(X, Y, W, h * .35);
    const g = x.createLinearGradient(0, Y + h, 0, Y + h + 7); g.addColorStop(0, 'rgba(60,35,55,.44)'); g.addColorStop(1, 'rgba(60,35,55,0)'); x.fillStyle = g; x.fillRect(X, Y + h, W, 7);
  }
  function arcoP(x, cx, base, w, h) { x.beginPath(); x.moveTo(cx - w / 2, base); x.lineTo(cx - w / 2, base - h + w / 2); x.arc(cx, base - h + w / 2, w / 2, Math.PI, 0); x.lineTo(cx + w / 2, base); x.closePath(); }
  function arco(x, cx, base, w, h, col = '#2e1e2a') { x.fillStyle = col; arcoP(x, cx, base, w, h); x.fill(); }
  // vano con marco de cantera: el jambaje de la derecha agarra el sol y el de la izquierda queda en sombra
  function vano(x, cx, base, w, h, col = '#2e1e2a', m = 2.2) {
    arco(x, cx, base, w + m * 2, h + m, '#f4e3c2'); arco(x, cx, base, w, h, col);
    x.save(); arcoP(x, cx, base, w, h); x.clip();
    x.fillStyle = 'rgba(255,190,130,.2)'; x.fillRect(cx + w * .24, base - h, w * .26, h);
    x.fillStyle = 'rgba(14,8,18,.45)'; x.fillRect(cx - w / 2, base - h, w * .26, h); x.fillRect(cx - w / 2, base - h, w, h * .16);
    x.restore();
  }
  // copa: una masa oscura y racimos con su propio volumen, para que no sea un puñado de manchas
  function follaje(x, r, cx, cy, rx, ry, n = 240) {
    const TON = ['#1d3729', '#2c5337', '#477a45', '#79a850', '#b9d06c'];
    x.fillStyle = TON[0]; ov(x, cx, cy, rx, ry);
    for (let i = 0; i < 16; i++) { const a = r() * TAU; ov(x, cx + Math.cos(a) * rx * .86, cy + Math.sin(a) * ry * .86, rx * (.16 + r() * .14), ry * (.18 + r() * .14)); }
    const racimos = Math.round(n / 9), L = [];
    for (let i = 0; i < racimos; i++) { const a = r() * TAU, q = Math.sqrt(r()); L.push([cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q]); }
    L.sort((a, b) => a[1] - b[1]);
    for (const [px, py] of L) {
      const base = clamp(.5 - (px - cx) / rx * .42 - (py - cy) / ry * .42, 0, 1), R = 8 + r() * 11;
      for (let k = 0; k < 26; k++) { const a = r() * TAU, q = Math.sqrt(r()), ox = Math.cos(a) * q, oy = Math.sin(a) * q, luz = clamp(base + (-ox - oy) * .28 + (r() - .5) * .22, 0, .999);
        x.fillStyle = TON[Math.floor(luz * 5)]; const l = 2.2 + r() * 2.6; x.save(); x.translate(px + ox * R, py + oy * R * .8); x.rotate(r() * TAU); x.beginPath(); x.moveTo(-l, 0); x.quadraticCurveTo(0, -l * .6, l, 0); x.quadraticCurveTo(0, l * .6, -l, 0); x.fill(); x.restore(); }
    }
  }

  // ---------- toma 1: Parque Principal ----------
  function torreCatedral(x, r, cx, base, w, alto) {
    muro(x, r, cx - w / 2, base - alto * .56, w, alto * .56, CAL);
    muro(x, r, cx - w * .4, base - alto * .82, w * .8, alto * .26, CAL);
    x.fillStyle = 'rgba(80,50,70,.28)'; x.fillRect(cx + w * .12, base - alto * .56, w * .38, alto * .56); x.fillRect(cx + w * .1, base - alto * .82, w * .3, alto * .26);
    escurre(x, r, cx - w / 2, base - alto * .55, w, alto * .5, 12, .18); escurre(x, r, cx - w * .4, base - alto * .81, w * .8, alto * .24, 7, .18);
    cornisa(x, cx - w / 2 - 2, base - alto * .57, w + 4, 2.4); cornisa(x, cx - w * .4 - 2, base - alto * .83, w * .8 + 4, 2);
    for (const s of [-1, 1]) { vano(x, cx + s * w * .19, base - alto * .59, w * .22, alto * .19, '#231622', 1.6); const bx = cx + s * w * .19, by = base - alto * .68; x.fillStyle = '#7a5a34'; x.beginPath(); x.moveTo(bx - 3, by + 4); x.quadraticCurveTo(bx - 2.2, by - 3, bx, by - 3); x.quadraticCurveTo(bx + 2.2, by - 3, bx + 3, by + 4); x.fill(); }
    const g = x.createLinearGradient(cx - w * .36, 0, cx + w * .36, 0); g.addColorStop(0, '#fff0d4'); g.addColorStop(.55, CAL); g.addColorStop(1, '#a8846e'); x.fillStyle = g; x.beginPath(); x.ellipse(cx, base - alto * .83, w * .36, w * .34, 0, Math.PI, 0); x.fill();
    x.strokeStyle = 'rgba(90,60,70,.4)'; x.lineWidth = .7; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(cx + i * w * .13, base - alto * .83); x.quadraticCurveTo(cx + i * w * .1, base - alto * .83 - w * .26, cx, base - alto * .83 - w * .34); x.stroke(); }
    x.fillStyle = CAL; x.fillRect(cx - 4, base - alto * .95, 8, alto * .1); x.fillStyle = 'rgba(80,50,70,.3)'; x.fillRect(cx + .6, base - alto * .95, 3.4, alto * .1);
    x.strokeStyle = '#5a4048'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(cx, base - alto * .95); x.lineTo(cx, base - alto * 1.02); x.moveTo(cx - 4, base - alto * .995); x.lineTo(cx + 4, base - alto * .995); x.stroke();
  }
  function portales(x, r, x0, x1, base, alto) {
    for (let xx = x0, i = 3; xx < x1; i++) {
      const w = 70 + r() * 30, col = mix(CAMP.FACHADAS[i % 8], '#f4c49a', .18); x.fillStyle = col; x.fillRect(xx, base - alto, w, alto);
      // aplanado viejo: manchas de cal y lluvia que baja del pretil
      for (let k = 0; k < 14; k++) { x.fillStyle = r() < .5 ? 'rgba(255,240,210,.1)' : 'rgba(80,50,60,.1)'; ov(x, xx + r() * w, base - alto + 6 + r() * (alto - 6), 3 + r() * 10, 2 + r() * 6); }
      escurre(x, r, xx, base - alto + 3, w, alto * .5, 7, .17); zocalo(x, xx, base - 12, w, 12);
      x.fillStyle = shade(col, .28); x.fillRect(xx, base - alto, w, 2.4); x.fillStyle = 'rgba(60,35,55,.3)'; x.fillRect(xx, base - alto + 2.4, w, 2); x.fillStyle = 'rgba(70,40,60,.2)'; x.fillRect(xx + w - 7, base - alto, 7, alto);
      for (let k = 0; k < Math.floor(w / 25); k++) { const cx = xx + 12 + k * 25;
        vano(x, cx, base, 19, alto * .46, '#3e2a34', 1.4); x.fillStyle = 'rgba(255,200,120,.5)'; x.fillRect(cx - 7, base - 9, 14, 9);
        vano(x, cx, base - alto * .56, 10, alto * .26, '#4a3040', 1.2); x.strokeStyle = '#2e2028'; x.lineWidth = 1; x.strokeRect(cx - 7, base - alto * .62, 14, 3); x.lineWidth = .5; for (let q = -2; q <= 2; q++) { x.beginPath(); x.moveTo(cx + q * 2.8, base - alto * .62); x.lineTo(cx + q * 2.8, base - alto * .56); x.stroke(); } }
      xx += w + 1;
    }
  }
  function pintaPlazaFondo(x) {
    const r = rng(7); cielo(x, r, -640, -320, 1280, 80);
    portales(x, r, -640, -130, 68, 76); portales(x, r, 190, 640, 68, 76);
    const cx = 30, base = 68;
    // la catedral: cuerpo, tres calles, portada y frontón curvo (a esta escala entra completa, con cúpulas y cruces)
    x.save(); x.translate(cx, base); x.scale(.84, .84); x.translate(-cx, -base);
    muro(x, r, cx - 94, base - 158, 188, 158, CAL);
    x.fillStyle = 'rgba(80,50,70,.24)'; x.fillRect(cx + 34, base - 158, 60, 158);
    x.fillStyle = CAL; x.beginPath(); x.moveTo(cx - 62, base - 158); x.quadraticCurveTo(cx, base - 214, cx + 62, base - 158); x.fill();
    x.fillStyle = 'rgba(80,50,70,.2)'; x.beginPath(); x.moveTo(cx + 16, base - 158); x.lineTo(cx + 16, base - 186); x.quadraticCurveTo(cx + 46, base - 176, cx + 62, base - 158); x.fill();
    x.strokeStyle = LUZ; x.lineWidth = 2.4; x.beginPath(); x.moveTo(cx - 64, base - 158); x.quadraticCurveTo(cx, base - 216, cx + 64, base - 158); x.stroke();
    escurre(x, r, cx - 94, base - 156, 188, 66, 34, .2); escurre(x, r, cx - 94, base - 88, 188, 80, 26, .17); zocalo(x, cx - 94, base - 22, 188, 22);
    cornisa(x, cx - 96, base - 160, 192, 2.6); cornisa(x, cx - 96, base - 92, 192, 2.6);
    for (const dx of [-90, -36, 36, 90]) { x.fillStyle = '#f7e6c8'; x.fillRect(cx + dx - 3, base - 158, 6, 158); x.fillStyle = 'rgba(80,50,70,.3)'; x.fillRect(cx + dx + 1, base - 158, 2, 158); x.fillStyle = 'rgba(255,250,235,.7)'; x.fillRect(cx + dx - 3, base - 158, 1, 158); escurre(x, r, cx + dx - 3, base - 155, 6, 60, 2, .2); }
    vano(x, cx, base, 46, 72, '#2e1e2a', 3); x.fillStyle = '#6a4030'; x.beginPath(); x.moveTo(cx - 19, base); x.lineTo(cx - 19, base - 52); x.arc(cx, base - 52, 19, Math.PI, 0); x.lineTo(cx + 19, base); x.fill(); x.strokeStyle = '#3a2228'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cx, base); x.lineTo(cx, base - 70); x.stroke();
    x.lineWidth = .6; for (const q of [-13, -6.5, 6.5, 13]) { x.beginPath(); x.moveTo(cx + q, base); x.lineTo(cx + q, base - 62); x.stroke(); } for (let q = 12; q < 62; q += 12) { x.beginPath(); x.moveTo(cx - 19, base - q); x.lineTo(cx + 19, base - q); x.stroke(); }
    vano(x, cx, base - 104, 30, 46, '#2e1e2a', 2.4); x.fillStyle = '#7a5a68'; x.beginPath(); x.arc(cx, base - 174, 9, 0, TAU); x.fill(); x.strokeStyle = LUZ; x.lineWidth = 2; x.stroke();
    for (const s of [-1, 1]) { vano(x, cx + s * 63, base - 18, 22, 44); vano(x, cx + s * 63, base - 104, 18, 36); }
    x.strokeStyle = '#5a4048'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(cx, base - 196); x.lineTo(cx, base - 224); x.moveTo(cx - 7, base - 214); x.lineTo(cx + 7, base - 214); x.stroke();
    torreCatedral(x, r, cx - 122, base, 60, 268); torreCatedral(x, r, cx + 122, base, 60, 268);
    x.restore();
  }
  // jardín con guarnición de piedra, pasto de verdad, seto recortado y flores
  function jardin(x, r, px, py, w, h) {
    x.fillStyle = 'rgba(58,36,70,.3)'; ov(x, px + 10, py + 5, w + 4, h + 3);
    x.fillStyle = '#8f7460'; ov(x, px, py + 2.4, w + 5, h + 3.6); x.fillStyle = '#ecd6b0'; ov(x, px, py, w + 5, h + 3.4);
    x.fillStyle = '#466d40'; ov(x, px, py, w, h);
    x.save(); x.beginPath(); x.ellipse(px, py, w, h, 0, 0, TAU); x.clip();
    for (let i = 0; i < w * h / 16; i++) { const a = r() * TAU, q = Math.sqrt(r()), bx = px + Math.cos(a) * w * q, by = py + Math.sin(a) * h * q, l = 2.4 + r() * 3.4, luz = r() - (bx - px) / w * .3; x.strokeStyle = luz > .75 ? '#a9c466' : luz > .4 ? '#6f9a52' : '#3a6040'; x.lineWidth = .9; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + (r() - .5) * 2, by - l); x.stroke(); }
    x.restore();
    for (let a = Math.PI * 1.04; a < Math.PI * 1.96; a += .05) { const bx = px + Math.cos(a) * w * .84, by = py + Math.sin(a) * h * .72; x.fillStyle = '#26442f'; ov(x, bx, by, 7, 5); x.fillStyle = r() < .5 ? '#3f6e42' : '#558a4a'; ov(x, bx - 1.4, by - 1.8, 5, 2.8); x.fillStyle = '#8fb860'; ov(x, bx - 2.2, by - 3, 2.4, 1.1); }
    for (let i = 0; i < w * .5; i++) { const a = Math.PI * (.08 + r() * .84), bx = px + Math.cos(a) * w * (.76 + r() * .2), by = py + Math.sin(a) * h * (.72 + r() * .24); x.fillStyle = '#2f5236'; ov(x, bx, by + 1, 2.6, 1.6); x.fillStyle = ['#e0483e', '#f2b233', '#fff0d0', '#e87a2a'][Math.floor(r() * 4)]; ov(x, bx, by - .6, 1.5, 1.2); }
  }
  // sombra de un árbol tirada por la tarde: se le cuela la luz entre las hojas
  function sombraArbol(x, r, cx, cy, L, H) { for (let i = 0; i < 70; i++) { const u = r(); x.fillStyle = 'rgba(58,36,78,.07)'; ov(x, cx + u * L, cy + (r() - .5) * H * (1 - u * .4), 12 + r() * 26, 3 + r() * 7, .06); } }
  function pintaPlazaMedio(x) {
    const r = rng(11);
    // las losas del parque, en perspectiva hacia la catedral
    x.fillStyle = '#c9a982'; x.fillRect(-660, 64, 1320, 270);
    const VPX = 30, VPY = 40, Y = z => VPY + 294 / z, LX = (i, z) => VPX + i * 92 / z;
    for (let z = 12, j = 0; z > .8; z *= .94, j++) { const z2 = z * .94, y0 = Y(z), y1 = Y(z2);
      for (let i = -90; i < 90; i++) { const a0 = LX(i, z), a1 = LX(i + 1, z), b0 = LX(i, z2), b1 = LX(i + 1, z2); if (Math.max(a1, b1) < -700 || Math.min(a0, b0) > 700) continue;
        x.beginPath(); x.moveTo(a0, y0); x.lineTo(a1, y0); x.lineTo(b1, y1); x.lineTo(b0, y1); x.closePath();
        const t = r(); x.fillStyle = (i + j) & 1 ? `rgba(246,224,186,${.1 + t * .24})` : `rgba(146,114,92,${.08 + t * .22})`; x.fill();
        x.strokeStyle = `rgba(88,58,54,${Math.min(.42, .9 / z)})`; x.lineWidth = .6; x.stroke(); } }
    for (let i = 0; i < 180; i++) pincel(x, r, -660 + r() * 1320, 66 + Math.pow(r(), 1.5) * 260, 26 + r() * 90, 1.5 + r() * 4, r() < .5 ? '#f0d6ac' : '#94765e', .1);
    // las sombras largas de la tarde corren hacia la derecha
    sombraArbol(x, r, -500, 142, 330, 34); sombraArbol(x, r, 430, 146, 280, 44); sombraArbol(x, r, 150, 92, 200, 12);
    x.fillStyle = 'rgba(58,36,78,.3)'; ov(x, -86, 150, 124, 11, .02);
    for (const lx of [-330, -32, 132, 330]) { const g = x.createLinearGradient(lx, 0, lx + 130, 0); g.addColorStop(0, 'rgba(58,36,78,.34)'); g.addColorStop(1, 'rgba(58,36,78,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(lx - 2, 136); x.lineTo(lx + 130, 146); x.lineTo(lx + 130, 150); x.lineTo(lx + 2, 137); x.fill(); }
    for (const [px, py, w, h] of [[-110, 108, 150, 15], [200, 110, 180, 16], [-470, 148, 220, 38], [340, 214, 310, 42], [-430, 226, 260, 64]]) jardin(x, r, px, py, w, h);
    x.fillStyle = '#3e2a2a'; x.fillRect(-528, 70, 15, 70); x.fillRect(412, 76, 16, 66); x.fillStyle = 'rgba(255,200,140,.4)'; x.fillRect(-528, 70, 4, 70); x.fillRect(412, 76, 4, 66); x.strokeStyle = 'rgba(30,18,22,.5)'; x.lineWidth = .8; for (let i = 0; i < 26; i++) { const bx = r() < .5 ? -528 + r() * 15 : 412 + r() * 16, by = 76 + r() * 58; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + (r() - .5) * 2, by + 5 + r() * 9); x.stroke(); }
    follaje(x, r, -520, 8, 112, 86); follaje(x, r, 420, 6, 120, 92); follaje(x, r, 560, 40, 86, 70);
    // el kiosco: gradas, ocho columnas y cúpula
    const kx = -186, ky = 138, col = (cx, c, a) => { x.fillStyle = c; x.fillRect(cx - 2.6, ky - 62, 5.2, 62); x.fillStyle = `rgba(90,58,70,${a})`; x.fillRect(cx + .3, ky - 62, 2.3, 62); x.fillStyle = 'rgba(255,250,232,.6)'; x.fillRect(cx - 2.6, ky - 62, 1, 62); x.fillStyle = c; x.fillRect(cx - 4, ky - 64, 8, 2.4); x.fillRect(cx - 3.6, ky - 3, 7.2, 3); };
    x.fillStyle = '#e8d2b0'; x.beginPath(); x.ellipse(kx, ky + 4, 84, 18, 0, 0, TAU); x.fill(); x.fillStyle = '#b8987a'; x.beginPath(); x.ellipse(kx, ky + 8, 84, 18, 0, 0, Math.PI); x.fill();
    x.strokeStyle = 'rgba(90,60,60,.5)'; x.lineWidth = .7; for (const q of [11, 14.5, 18]) { x.beginPath(); x.ellipse(kx, ky + 8 + q - 14, 84, 18, 0, .05, Math.PI - .05); x.stroke(); }
    x.fillStyle = '#6a4a4a'; x.beginPath(); x.ellipse(kx, ky - 2, 70, 14, 0, 0, TAU); x.fill();
    for (let i = 0; i < 6; i++) { const a = Math.PI * (i / 5); col(kx + Math.cos(a) * 52, '#8a7068', .3); } // las de atrás, en la sombra de la cúpula
    x.fillStyle = 'rgba(46,26,40,.62)'; ov(x, kx, ky - 58, 68, 13);
    for (let i = 0; i < 6; i++) { const a = Math.PI * (i / 5); col(kx + Math.cos(a) * 62, i < 3 ? '#c8a88a' : '#f7ead0', .4); }
    x.strokeStyle = '#3e2a30'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(kx - 66, ky - 14); x.lineTo(kx + 66, ky - 14); x.stroke(); for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(kx + i * 10.5, ky - 14); x.lineTo(kx + i * 10.5, ky - 3); x.stroke(); }
    const dg = x.createLinearGradient(kx - 74, 0, kx + 74, 0); dg.addColorStop(0, '#ffb884'); dg.addColorStop(.42, '#d67a54'); dg.addColorStop(1, '#8a3f38');
    x.fillStyle = dg; x.beginPath(); x.moveTo(kx - 74, ky - 60); x.quadraticCurveTo(kx - 48, ky - 96, kx, ky - 110); x.quadraticCurveTo(kx + 48, ky - 96, kx + 74, ky - 60); x.quadraticCurveTo(kx, ky - 44, kx - 74, ky - 60); x.fill();
    x.strokeStyle = 'rgba(90,40,40,.5)'; x.lineWidth = .9; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(kx + i * 21, ky - 60 + (9 - i * i) * 1.3); x.quadraticCurveTo(kx + i * 15, ky - 92, kx, ky - 110); x.stroke(); }
    x.strokeStyle = '#f7ead0'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(kx - 74, ky - 60); x.quadraticCurveTo(kx, ky - 44, kx + 74, ky - 60); x.stroke();
    x.fillStyle = '#f7ead0'; x.fillRect(kx - 8, ky - 124, 16, 14); x.fillStyle = 'rgba(90,58,70,.35)'; x.fillRect(kx + 1, ky - 124, 7, 14); x.fillStyle = '#c86a4a'; x.beginPath(); x.arc(kx, ky - 124, 9, Math.PI, 0); x.fill(); x.strokeStyle = '#5a4048'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(kx, ky - 132); x.lineTo(kx, ky - 144); x.stroke();
    // bancas y faroles del parque
    for (const lx of [-330, -32, 132, 330]) { x.strokeStyle = '#2e2a30'; x.lineWidth = 3; x.beginPath(); x.moveTo(lx, 136); x.lineTo(lx, 64); x.moveTo(lx - 13, 70); x.lineTo(lx + 13, 70); x.stroke(); x.strokeStyle = 'rgba(255,210,150,.6)'; x.lineWidth = .8; x.beginPath(); x.moveTo(lx - 1.1, 135); x.lineTo(lx - 1.1, 70); x.stroke(); x.fillStyle = '#2e2a30'; x.fillRect(lx - 4, 130, 8, 7); x.fillStyle = '#fff0c8'; for (const s of [-13, 0, 13]) { x.beginPath(); x.arc(lx + s, s ? 65 : 58, 5, 0, TAU); x.fill(); } }
  }
  function pintaPlazaFrente(x) {
    const r = rng(19);
    follaje(x, r, 560, -170, 190, 118, 260); follaje(x, r, -590, -180, 170, 96, 220);
    // la banca de hierro y tablones del primer término
    for (const y of [172, 182, 196, 206]) { x.fillStyle = 'rgba(30,25,35,.94)'; x.fillRect(-470, y, 210, y < 190 ? 7 : 8); x.fillStyle = 'rgba(255,190,130,.34)'; x.fillRect(-470, y, 210, 1); }
    x.fillStyle = 'rgba(30,25,35,.94)'; for (const px of [-452, -280]) x.fillRect(px, 172, 8, 66);
  }
  // la gente del centro: sombrero jipi y guayabera, huipil y falda, vestido de paseo, niños y el globero.
  // Nadie se desliza: cada quien sigue una ruta con arranques y paradas, y sus pasos salen de lo que avanza.
  const trecho = u => { const r = .2, q = 2 * r * (1 - r); return u < r ? u * u / q : u > 1 - r ? 1 - (1 - u) * (1 - u) / q : (u - r / 2) / (1 - r); };
  function ruta(k, t) {
    let x = k[0][1], y = k[0][2], d = 0;
    for (let i = 1; i < k.length; i++) { const a = k[i - 1], b = k[i], e = trecho(clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); d += Math.hypot(b[1] - a[1], b[2] - a[2]) * e; if (t >= a[0]) { x = lerp(a[1], b[1], e); y = lerp(a[2], b[2], e); } }
    return { x, y, d };
  }
  const talla = v => (v.tipo === 'nino' ? .7 : 1) * (v.alto || 1);
  // de la ruta saca dónde va, a qué paso (el ciclo de marcha sale de la distancia, así los pies no patinan) y qué está haciendo
  function marcha(g, t, escala) {
    const a = ruta(g.r, t), b = ruta(g.r, t + .05), c = ruta(g.r, t - .05), s = escala ? escala(a) : g.s, k = talla(g.v), vl = Math.hypot(b.x - c.x, b.y - c.y) / .1 / (s * k), ph = g.ph || 0;
    const e = { ph, f: ph + a.d / (26 * k * s) * TAU, anda: clamp(vl / 9, 0, 1), corre: clamp((vl - 36) / 30, 0, 1), dir: g.dir || 1 };
    if (g.acto) g.acto(e, t);
    return [a.x, a.y, s, e, g.v, g];
  }
  const GLOBOS = [['#e0486a', -7, -35], ['#f2b233', 3, -39], ['#2fa3a0', 11, -32], ['#8a5ad0', -2, -27], ['#f07a2a', 7, -25], ['#48b070', 15, -23]];
  function globo(ctx, x, y, c) { const g = ctx.createRadialGradient(x - 1.8, y - 1.8, .5, x, y, 6); g.addColorStop(0, shade(c, .5)); g.addColorStop(.5, c); g.addColorStop(1, shade(c, -.3)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 4.6, 5.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y + 5.2); ctx.lineTo(x - 1, y + 6.4); ctx.lineTo(x + 1, y + 6.4); ctx.fill(); }
  function bici(ctx, f) {
    ctx.strokeStyle = '#1e1a20'; ctx.lineWidth = .7; for (const cx of [-9, 10]) { ctx.beginPath(); ctx.arc(cx, -6.6, 6.2, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(235,225,210,.6)'; ctx.lineWidth = .18; for (const cx of [-9, 10]) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + f * .6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 6, -6.6 + Math.sin(a) * 6); ctx.lineTo(cx - Math.cos(a) * 6, -6.6 - Math.sin(a) * 6); ctx.stroke(); }
    ctx.strokeStyle = '#c8283a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, -6.6); ctx.lineTo(1.5, -7.8); ctx.lineTo(-2.4, -17); ctx.lineTo(-9, -6.6); ctx.moveTo(-2.4, -17); ctx.lineTo(7, -17.6); ctx.lineTo(1.5, -7.8); ctx.moveTo(10, -6.6); ctx.lineTo(7, -20); ctx.stroke();
    ctx.strokeStyle = '#1e1a20'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(.6, -18); ctx.moveTo(4.6, -21); ctx.lineTo(8.6, -20); ctx.stroke();
  }
  function persona(ctx, x, y, s, v, t, e) {
    const tipo = v.tipo, nino = tipo === 'nino', k = talla(v), { f, anda, corre, ph, dir } = e, piel = v.piel, fal = tipo === 'huipil' || tipo === 'vestido', jipi = tipo === 'jipi' || tipo === 'globero', lado = dir < 0 ? -1 : 1, salto = e.salto || 0;
    // su sombra larga en el piso, hacia la derecha (la tarde entra por la izquierda): se queda abajo aunque brinque
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    const so = ctx.createLinearGradient(0, 0, 50, 0); so.addColorStop(0, 'rgba(45,25,55,.46)'); so.addColorStop(1, 'rgba(45,25,55,0)'); ctx.fillStyle = so; ctx.beginPath(); ctx.moveTo(-5, -.6); ctx.lineTo(50, 4.4); ctx.lineTo(48, 8.4); ctx.lineTo(-3, 1.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(40,20,30,.42)'; ctx.beginPath(); ctx.ellipse(.6, .4, 6.6 - salto * .3, 1.5, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y - salto * s * k); ctx.scale(s * k * (Math.abs(dir) < .15 ? .15 * lado : dir), s * k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const vol = (c, a, b) => { const g = ctx.createLinearGradient(lado > 0 ? a : b, 0, lado > 0 ? b : a, 0); g.addColorStop(0, shade(c, .24)); g.addColorStop(.5, c); g.addColorStop(1, shade(c, -.3)); return g; };
    // las piernas: muslo y espinilla; la rodilla se dobla al traer la pierna, y el pie más bajo siempre pisa el suelo
    const L = 7.6, peso = Math.sin(t * 1.15 + ph) * (1 - anda), resp = Math.sin(t * 1.9 + ph) * .28 * (1 - anda);
    const ata = (q, abre) => {
      if (e.pedalea) { const fx = 1.5 + Math.cos(f + q) * 3.4, fy = 9.6 + Math.sin(f + q) * 3.4, m = Math.hypot(fx, fy), g = Math.sqrt(Math.max(0, L * L - m * m / 4)); return { kx: fx / 2 + fy / m * g, ky: fy / 2 - fx / m * g, fx, fy, a: 0 }; }
      const th = Math.sin(f + q) * (.44 + corre * .36) * anda + (1 - anda) * (abre + peso * .05), fl = Math.pow(Math.max(0, Math.cos(f + q)), 1.2) * (.9 + corre * .8) * anda + .05, kx = Math.sin(th) * L, ky = Math.cos(th) * L; return { kx, ky, fx: kx + Math.sin(th - fl) * L, fy: ky + Math.cos(th - fl) * L, a: th - fl };
    };
    const A = ata(0, .08), B = ata(Math.PI, -.08), hx = peso * .6, hy = e.pedalea ? -17.4 : -Math.max(A.fy, B.fy), drop = 15.2 + hy, lean = (.04 * anda + corre * .2 + (v.baston ? .14 : 0) + (e.inclina || 0));
    const pie = P => { ctx.save(); ctx.translate(hx + P.fx, hy + P.fy); ctx.rotate(-P.a * .6); ctx.fillStyle = '#2a1c1e'; ctx.beginPath(); ctx.ellipse(1.1, -.9, 2.7, 1.25, 0, 0, TAU); ctx.fill(); ctx.restore(); };
    const pierna = (P, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + P.kx, hy + P.ky); ctx.lineTo(hx + P.fx, hy + P.fy); ctx.stroke(); pie(P); };
    const enTorso = fn => { ctx.save(); ctx.translate(hx, drop + resp); ctx.translate(0, -15.2); ctx.rotate(lean); ctx.translate(0, 15.2); fn(); ctx.restore(); };
    const camisa = jipi ? '#f3ecdc' : tipo === 'huipil' ? '#f8f2e6' : v.col, manga = jipi ? null : shade(piel, -.04);
    // el brazo: hombro, codo y mano (0 es colgando, positivo hacia adelante); regresa dónde quedó la mano
    const brazo = (ang, cod, c, c2) => { const x1 = Math.sin(ang) * 5.6, y1 = -26.2 + Math.cos(ang) * 5.6, a2 = ang + cod, x2 = x1 + Math.sin(a2) * 5.4, y2 = y1 + Math.cos(a2) * 5.4; ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -26.2); ctx.lineTo(x1, y1); if (c2) { ctx.stroke(); ctx.strokeStyle = c2; ctx.lineWidth = 2.1; ctx.beginPath(); ctx.moveTo(x1, y1); } ctx.lineTo(x2, y2); ctx.stroke(); ctx.fillStyle = piel; ctx.beginPath(); ctx.arc(x2, y2, 1.4, 0, TAU); ctx.fill(); return [x2, y2]; };
    const vaiven = Math.sin(f) * .5 * anda * (1 + corre * .5), cod = .26 + corre * 1 + anda * .2 + (1 - anda) * Math.max(0, peso) * .08;
    let mano = null;
    enTorso(() => { const b = e.brazo2 || [vaiven + .05, cod]; brazo(b[0], b[1], shade(camisa, -.3), manga && shade(piel, -.2)); });
    if (e.pedalea) bici(ctx, f);
    if (fal) {
      const h = tipo === 'huipil' ? -1.4 : -7.5, hem = (A.fx + B.fx) / 2 * .5 + hx, ab = 6.5 + Math.abs(A.fx - B.fx) * .2, top = hy - 2.3 + drop * .3;
      if (tipo === 'vestido') for (const [P, c] of [[B, shade(piel, -.16)], [A, piel]]) { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hx + P.kx * .6, h - 2); ctx.lineTo(hx + P.fx, hy + P.fy - .6); ctx.stroke(); }
      pie(B); pie(A);
      ctx.fillStyle = vol(v.col, -7, 7); ctx.beginPath(); ctx.moveTo(hx - 4.4, top); ctx.quadraticCurveTo(hx - 6.2, -9, hem - ab, h); ctx.quadraticCurveTo(hem, h + 1.8, hem + ab, h); ctx.quadraticCurveTo(hx + 6.2, -9, hx + 4.4, top); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(v.col, -.26); ctx.lineWidth = .55; for (const q of [-2.8, 0, 2.8]) { ctx.beginPath(); ctx.moveTo(hx + q * .5, top + 1.5); ctx.quadraticCurveTo(hx + q, -9, hem + q * 1.5, h + 1); ctx.stroke(); }
    } else {
      const c = nino ? piel : v.col2; pierna(B, shade(c, -.2)); pierna(A, c);
      if (nino) { ctx.strokeStyle = v.col2; ctx.lineWidth = 3.8; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + A.kx * .7, hy + A.ky * .7); ctx.moveTo(hx, hy); ctx.lineTo(hx + B.kx * .7, hy + B.ky * .7); ctx.stroke(); }
    }
    enTorso(() => {
      // el torso y lo que lo distingue
      ctx.fillStyle = vol(camisa, -6, 6); ctx.beginPath(); ctx.moveTo(-3.6, -27.6); ctx.quadraticCurveTo(0, -28.8, 3.6, -27.6); ctx.lineTo(tipo === 'huipil' ? 5.6 : 4.9, -13.6); ctx.quadraticCurveTo(0, -12.4, tipo === 'huipil' ? -5.6 : -4.9, -13.6); ctx.closePath(); ctx.fill();
      if (jipi) { ctx.strokeStyle = 'rgba(150,130,110,.7)'; ctx.lineWidth = .45; for (const q of [-2.4, 2.4]) { ctx.beginPath(); ctx.moveTo(q, -26.4); ctx.lineTo(q * 1.2, -14); ctx.stroke(); } ctx.strokeRect(.8, -21, 2.6, 2.6); }
      if (tipo === 'huipil') { ctx.fillStyle = v.col; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 2.2, -14.8, .95, 0, TAU); ctx.fill(); } ctx.fillStyle = '#f2b233'; for (let i = -2; i < 2; i++) { ctx.beginPath(); ctx.arc(i * 2.2 + 1.1, -15.8, .55, 0, TAU); ctx.fill(); } ctx.strokeStyle = v.col; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-2.4, -27.8); ctx.lineTo(-2, -24.8); ctx.lineTo(2, -24.8); ctx.lineTo(2.4, -27.8); ctx.stroke(); }
      if (tipo === 'vestido') { ctx.fillStyle = shade(v.col, -.34); ctx.fillRect(-4.8, -17.8, 9.6, 1.1); ctx.strokeStyle = '#6a3a2a'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(-5.2, -18 + Math.sin(f) * .5); ctx.lineTo(-2.2, -26.8); ctx.stroke(); ctx.fillStyle = '#6a3a2a'; ctx.fillRect(-7.4, -18 + Math.sin(f) * .5, 4.4, 4.6); }
      // el cuello y la cabeza: voltea, mira hacia arriba, cabecea al pisar y parpadea
      ctx.fillStyle = shade(piel, -.16); ctx.fillRect(-1.4, -30, 2.8, 3);
      ctx.save(); const mira = e.mira === undefined ? 1 : e.mira, m = Math.abs(mira) < .35 ? (mira < 0 ? -.35 : .35) : mira, risa = e.risa || 0; ctx.translate(0, -29); ctx.rotate(-(e.alza || 0) + Math.sin(f * 2) * .03 * anda - risa * Math.abs(Math.sin(t * 11)) * .1 + (1 - anda) * Math.sin(t * .8 + ph) * .03); ctx.scale(m, 1); ctx.translate(0, 29);
      ctx.fillStyle = vol(piel, -4, 4); ctx.beginPath(); ctx.ellipse(.4, -32.2, 3.9, 4.3, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, -33); ctx.lineTo(5.2, -31.4); ctx.lineTo(3.9, -31); ctx.fill();
      ctx.fillStyle = '#1e1416'; if ((t * .31 + ph * .37) % 1 < .05) ctx.fillRect(1.9, -32.9, 1.2, .3); else { ctx.beginPath(); ctx.arc(2.5, -32.8, .46, 0, TAU); ctx.fill(); }
      if (risa) { ctx.fillStyle = '#5a2228'; ctx.beginPath(); ctx.ellipse(2.5, -30.3, 1.05, .75 + risa * .35, 0, 0, TAU); ctx.fill(); } else { ctx.strokeStyle = 'rgba(70,30,30,.7)'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(1.6, -30.4); ctx.quadraticCurveTo(2.6, -29.9, 3.5, -30.5); ctx.stroke(); }
      ctx.fillStyle = v.pelo; ctx.beginPath(); ctx.moveTo(3.9, -34.2); ctx.quadraticCurveTo(1, -37.9, -2.6, -35.8); ctx.quadraticCurveTo(-4.7, -33, -3.6, -29.6); ctx.quadraticCurveTo(-1.6, -31, -.6, -33.2); ctx.quadraticCurveTo(1.8, -33.6, 3.9, -34.2); ctx.fill();
      if (tipo === 'huipil') { ctx.beginPath(); ctx.arc(-4, -34.2, 2.3, 0, TAU); ctx.fill(); ctx.fillStyle = v.col; ctx.fillRect(-3.6, -36.2, 1.6, 4); ctx.fillStyle = '#f2b233'; ctx.beginPath(); ctx.arc(-1.4, -36.4, 1, 0, TAU); ctx.fill(); }
      if (tipo === 'vestido') { ctx.beginPath(); ctx.moveTo(-1, -35); ctx.quadraticCurveTo(-5.6, -32, -5.2 - Math.sin(f) * .6, -24.4); ctx.quadraticCurveTo(-2.4, -26.4, -1, -30); ctx.fill(); }
      if (jipi) { // el sombrero jipi: palma tejida, listón y su sombra en la cara
        ctx.fillStyle = 'rgba(40,20,30,.26)'; ctx.beginPath(); ctx.ellipse(1, -33.8, 4, 1.2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = vol('#eadcb4', -7, 7); ctx.beginPath(); ctx.ellipse(.4, -35.6, 7.6, 1.8, -.04, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-3.6, -35.8); ctx.quadraticCurveTo(-3.4, -39.8, .4, -40); ctx.quadraticCurveTo(4.2, -39.8, 4.4, -35.8); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#3e3038'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3.5, -36.6); ctx.quadraticCurveTo(.4, -35.6, 4.3, -36.6); ctx.stroke();
      }
      ctx.restore();
      const b = e.brazo || (v.baston ? [.5 + Math.sin(f) * .08, .2] : [-vaiven + .05, cod]); mano = brazo(b[0], b[1], shade(camisa, -.04), manga);
      if (e.abanico) { ctx.save(); ctx.translate(mano[0], mano[1]); ctx.rotate(.5 + Math.sin(t * 9 + ph) * .34); ctx.fillStyle = e.abanico; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 6.4, -2.3, -.8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(70,40,40,.5)'; ctx.lineWidth = .3; for (let i = 0; i < 5; i++) { const a = -2.3 + i * .375; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 6.4, Math.sin(a) * 6.4); ctx.stroke(); } ctx.restore(); }
    });
    const mx = hx + mano[0], my = drop + resp + mano[1]; e.mano = [x + mx * s * k * dir, y + (my - salto) * s * k];
    if (e.camara) { ctx.fillStyle = '#2a2428'; ctx.fillRect(mx - .6, my - 2.4, 5, 3.6); ctx.fillStyle = '#5a6a7a'; ctx.beginPath(); ctx.arc(mx + 3.4, my - .6, 1.1, 0, TAU); ctx.fill(); if (e.flash) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,250,235,${e.flash * .9})`; ctx.beginPath(); ctx.arc(mx + 4, my - 2, 2 + e.flash * 5, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; } }
    if (v.baston) { ctx.strokeStyle = '#4a3026'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(mx, my - 1); ctx.lineTo(mx + 2.4 + Math.sin(f) * 2.4 * anda, -.2); ctx.stroke(); }
    if (tipo === 'globero') for (const [i, [c, gx, gy]] of GLOBOS.entries()) { if (i === e.quita) continue; const px = mx + gx + Math.sin(t * 1.7 + i * 1.3) * 1.4, py = my + gy + Math.sin(t * 2.3 + i * 2.1) * .8; ctx.strokeStyle = 'rgba(245,235,215,.8)'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(mx + gx * .3, my + gy * .6, px, py + 6); ctx.stroke(); globo(ctx, px, py, c); }
    if (e.globo) { const px = mx + 1 + Math.sin(t * 2.2) * 1.2, py = my - 17 + Math.sin(t * 3.1) * .8; ctx.strokeStyle = 'rgba(245,235,215,.8)'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(px, py + 6); ctx.stroke(); globo(ctx, px, py, e.globo); }
    ctx.restore();
  }
  const voltea = (t, a, b) => 1 - 2 * smooth(a, a + .25, t) * (1 - smooth(b, b + .25, t)); // mira hacia atrás de a a b
  const ROPA = {
    huipilRosa: { tipo: 'huipil', col: '#c8506a', piel: '#8a5a3c', pelo: '#1e1416', alto: .96 }, huipilAzul: { tipo: 'huipil', col: '#3f7fa8', piel: '#8a5a3c', pelo: '#1e1416' }, huipilNaranja: { tipo: 'huipil', col: '#d06a4a', piel: '#74482f', pelo: '#1e1416', alto: .97 },
    jipiOscuro: { tipo: 'jipi', col2: '#39404e', piel: '#74482f', pelo: '#2a1c1c', alto: 1.04 }, jipiCafe: { tipo: 'jipi', col2: '#4a4038', piel: '#a06c48', pelo: '#3a2a28' }, abuelo: { tipo: 'jipi', col2: '#6a5a4a', piel: '#8a5a3c', pelo: '#6a6468', baston: true, alto: .95 },
    vestidoVerde: { tipo: 'vestido', col: '#3f8f6a', piel: '#8a5a3c', pelo: '#2a1c1c' }, vestidoAmbar: { tipo: 'vestido', col: '#e0a040', piel: '#b07a54', pelo: '#3a2a28' }, vestidoNaranja: { tipo: 'vestido', col: '#d06a4a', piel: '#a06c48', pelo: '#2a1c1c' }, vestidoLila: { tipo: 'vestido', col: '#7a5a9a', piel: '#a06c48', pelo: '#2a1c1c' },
    ninoRojo: { tipo: 'nino', col: '#c8283a', col2: '#2e5a8a', piel: '#a06c48', pelo: '#1e1416' }, ninoSol: { tipo: 'nino', col: '#f2b233', col2: '#40506a', piel: '#a06c48', pelo: '#231718' }, ninoAzul: { tipo: 'nino', col: '#3f7f9a', col2: '#40506a', piel: '#a06c48', pelo: '#1e1416', alto: 1.1 },
  };
  // quién hace qué en el parque (la toma dura 3.7 s):
  //  · el niño de amarillo corre a espantar a las palomas y se queda brincando viéndolas volar
  //  · otro niño jala a su mamá con el globero, estira la mano, le dan un globo y brinca
  //  · la pareja viene platicando y se para; él señala las palomas y ella se ríe
  //  · la señora del abanico se queda viendo el cielo y el abuelo sigue a su paso, con bastón
  const GENTE = [
    { v: ROPA.huipilAzul, r: [[0, -74, 84], [3.7, -30, 84]], s: .48, ph: 1 },
    { v: ROPA.jipiCafe, r: [[0, -60, 85.5], [3.7, -16, 85.5]], s: .49, ph: 2.4 },
    { v: ROPA.vestidoNaranja, r: [[0, 176, 82], [1.8, 150, 82], [2.6, 150, 82], [3.7, 134, 82]], s: .46, dir: -1, ph: .7 },
    { v: ROPA.abuelo, r: [[0, 300, 141], [3.7, 264, 141]], s: 1.08, dir: -1, ph: 3.1 },
    { v: ROPA.vestidoVerde, r: [[0, 154, 139]], s: 1.06, dir: -1, ph: .4, acto(e, t) { e.abanico = '#f4e6c8'; e.brazo = [1.05, 1.5]; e.alza = smooth(1.1, 1.6, t) * .42; } },
    { v: ROPA.huipilRosa, r: [[0, -98, 146], [2, -40, 146], [3.7, -40, 146]], s: 1.13, ph: 5.2, acto(e, t) { const u = smooth(2, 2.5, t); e.alza = u * .32; e.risa = smooth(1.1, 1.3, t) * (1 - smooth(1.8, 2, t)) + smooth(2.6, 2.8, t); } },
    { v: ROPA.jipiOscuro, r: [[0, -72, 148], [1.9, -14, 148], [3.7, -14, 148]], s: 1.15, ph: 2, acto(e, t) { const u = smooth(2, 2.35, t); e.mira = voltea(t, .9, 1.75); if (u) { e.brazo = [lerp(.05, 2.25, u), .1 + Math.sin(t * 5) * .05 * u]; e.alza = u * .3; } } },
    { v: ROPA.vestidoAmbar, r: [[0, 322, 149], [2.1, 238, 151], [3.7, 238, 151]], s: 1.16, dir: -1, ph: 1.7, acto(e, t) { e.risa = smooth(2.8, 3, t); e.brazo = t > 2 ? [.3, .9 * smooth(2.1, 2.5, t)] : undefined; } },
    { v: ROPA.ninoRojo, r: [[0, 298, 151], [1.9, 216, 154], [3.7, 216, 154]], s: 1.18, dir: -1, ph: 4, acto(e, t) { const u = smooth(1.9, 2.25, t), w = t - 2.85; e.alza = u * .5; if (u) e.brazo = [lerp(.05, 2.5, u), .1]; if (t > 2.65) e.globo = GLOBOS[1][0]; if (w > 0) { e.salto = Math.abs(Math.sin(w * 8)) * 5 * Math.max(0, 1 - w / 1); e.risa = 1; } } },
    { v: { ...ROPA.jipiCafe, tipo: 'globero', col2: '#3e3a44', piel: '#74482f' }, r: [[0, 196, 153]], s: 1.21, ph: .9, acto(e, t) { const u = smooth(2.1, 2.5, t) * (1 - smooth(2.9, 3.2, t)); e.brazo = [2.5 + Math.sin(t * 1.3) * .06, .12]; e.brazo2 = [u * 1.55 + .05, .25]; e.alza = -.14 * u; e.inclina = .06 * u; if (t > 2.65) e.quita = 1; e.risa = smooth(2.6, 2.8, t); } },
    { v: ROPA.ninoSol, r: [[.3, -24, 158], [1.35, 92, 151], [3.7, 92, 151]], s: 1.25, ph: .3, acto(e, t) { const u = smooth(1.4, 1.7, t); e.alza = u * .55; e.risa = u; if (u) { e.brazo = [lerp(.05, 2.7, u), .15 + Math.sin(t * 14) * .25]; e.brazo2 = [lerp(.05, 2.4, u), .15 - Math.sin(t * 14) * .25]; e.salto = u * Math.abs(Math.sin(t * 8)) * 3.4; } } },
  ];
  // en la muralla: una pareja sale paseando por el camino; un señor le enseña la bandera a su hijo
  const MURO = [
    { v: ROPA.huipilRosa, r: [[0, 74, 114], [3.7, 124, 137]], ph: 0, acto(e, t) { e.mira = voltea(t, 1.5, 2.5); } },
    { v: ROPA.jipiCafe, r: [[0, 100, 112], [3.7, 152, 134]], ph: 2.3, acto(e, t) { e.mira = voltea(t, 1.6, 2.4); } },
    { v: ROPA.ninoAzul, r: [[0, 30, 129]], g: .84, ph: 1.4, acto(e, t) { e.alza = .55; e.salto = Math.abs(Math.sin(t * 5)) * smooth(1.2, 1.5, t) * 1.8; } },
    { v: ROPA.jipiOscuro, r: [[0, 46, 126]], g: .8, ph: 3, acto(e, t) { const u = smooth(.5, 1, t); e.alza = .4 * u; e.mira = voltea(t, 2.2, 3); e.brazo = [lerp(.05, 2.4, u) + Math.sin(t * 3) * .05 * u, .1]; } },
  ];
  function paloma(ctx, x, y, s, t, i) { const a = Math.sin(t * 22 + i) * 3.2 * s; ctx.fillStyle = i % 3 ? '#6a6878' : '#ece6dc'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 3 * s, y - 1 - a * .5, x - 7 * s, y - a); ctx.quadraticCurveTo(x - 3 * s, y + 1.5, x, y + 1.6 * s); ctx.quadraticCurveTo(x + 3 * s, y + 1.5, x + 7 * s, y - a); ctx.quadraticCurveTo(x + 3 * s, y - 1 - a * .5, x, y); ctx.fill(); }
  // paloma en el piso, picoteando
  function palomaPiso(ctx, x, y, i, t) {
    const d = i % 2 ? 1 : -1, pica = Math.max(0, Math.sin(t * 5 + i * 2.1)) * 1.7, col = i % 3 ? '#6a6878' : '#ece6dc';
    ctx.fillStyle = 'rgba(40,20,30,.3)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 2.4, 5, 1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - d * 6, y + .6); ctx.quadraticCurveTo(x - d * 2, y - 3, x + d * 2.4, y - 1.6); ctx.quadraticCurveTo(x + d * 2, y + 2.4, x - d * 2, y + 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x + d * 3, y - 2.2 + pica, 1.4, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(col, -.25); ctx.beginPath(); ctx.ellipse(x - d, y - .2, 2.4, 1.1, .2 * d, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d8a040'; ctx.fillRect(x + d * 4 - .5, y - 2.3 + pica, 1, .7);
  }

  // ---------- toma 2: la muralla y la Puerta de Tierra ----------
  function almenas(x, r, X0, X1, y) { for (let xx = X0; xx < X1; xx += 24) { muro(x, r, xx, y - 12, 14, 13); x.fillStyle = LUZ; x.fillRect(xx, y - 12, 14, 2); x.fillStyle = 'rgba(80,50,70,.34)'; x.fillRect(xx + 10, y - 10, 4, 11); escurre(x, r, xx, y + 1, 14, 34, 2, .22); } }
  // el pasaje de la puerta: bóveda de cañón que se hunde en la muralla, los dos portones de madera abiertos contra
  // los muros, el piso que sigue, y al fondo la calle de la ciudad con su luz de la tarde. Alrededor, sus dovelas
  function pasaje(x, r, gx, base) {
    const W = 94, H = 124, R0 = W / 2, cy = base - H + R0, w2 = 50, h2 = 70, r2 = w2 / 2, cy2 = base - 6 - h2 + r2, b2 = base - 6; // boca de afuera y boca del fondo
    x.save(); arcoP(x, gx, base, W, H); x.clip();
    // la calle del fondo: cielo tibio, dos fachadas de colores con su balcón y un farol
    let g = x.createLinearGradient(0, cy2 - r2, 0, b2); g.addColorStop(0, '#ffd9a0'); g.addColorStop(1, '#ffb878'); x.fillStyle = g; x.fillRect(gx - W, base - H - 4, W * 2, H + 8);
    for (const [fx, fw, fh, col] of [[gx - 34, 30, 52, '#e07a5a'], [gx - 6, 18, 40, '#f2c46a'], [gx + 10, 26, 48, '#6aa8a0']]) { x.fillStyle = col; x.fillRect(fx, b2 - fh, fw, fh); x.fillStyle = 'rgba(60,30,40,.55)'; for (let k = 0; k < 2; k++) x.fillRect(fx + 4 + k * (fw - 12) / 1.6, b2 - fh + 10, 4, 9); x.fillStyle = 'rgba(255,240,210,.5)'; x.fillRect(fx, b2 - fh, fw, 2); }
    x.fillStyle = '#c8a888'; x.fillRect(gx - W, b2, W * 2, 10);
    // los muros del pasaje (de la boca de afuera a la del fondo), la bóveda y el piso
    const muroP = (sg) => { x.beginPath(); x.moveTo(gx + sg * R0, base); x.lineTo(gx + sg * R0, cy); x.lineTo(gx + sg * r2, cy2); x.lineTo(gx + sg * r2, b2); x.closePath(); };
    for (const sg of [-1, 1]) { muroP(sg); g = x.createLinearGradient(gx + sg * R0, 0, gx + sg * r2, 0); g.addColorStop(0, sg < 0 ? '#4a3438' : '#5e4240'); g.addColorStop(1, sg < 0 ? '#a07a62' : '#b88a68'); x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(40,24,28,.35)'; x.lineWidth = .8; for (let k = 1; k < 7; k++) { const u = k / 7, yA = lerp(base, cy, u), yB = lerp(b2, cy2, u); x.beginPath(); x.moveTo(gx + sg * R0, yA); x.lineTo(gx + sg * r2, yB); x.stroke(); } }
    x.beginPath(); x.arc(gx, cy, R0, Math.PI, 0); x.lineTo(gx + r2, cy2); x.arc(gx, cy2, r2, 0, Math.PI, true); x.closePath();
    g = x.createLinearGradient(0, cy - R0, 0, cy2); g.addColorStop(0, '#2a1c24'); g.addColorStop(1, '#7a5a50'); x.fillStyle = g; x.fill();
    x.strokeStyle = 'rgba(30,18,24,.4)'; x.lineWidth = .8; for (let k = 1; k < 9; k++) { const a = Math.PI + k / 9 * Math.PI; x.beginPath(); x.moveTo(gx + Math.cos(a) * R0, cy + Math.sin(a) * R0); x.lineTo(gx + Math.cos(a) * r2, cy2 + Math.sin(a) * r2); x.stroke(); }
    x.beginPath(); x.moveTo(gx - R0, base); x.lineTo(gx - r2, b2); x.lineTo(gx + r2, b2); x.lineTo(gx + R0, base); x.closePath(); g = x.createLinearGradient(0, b2, 0, base); g.addColorStop(0, '#e8c090'); g.addColorStop(1, '#8a6a58'); x.fillStyle = g; x.fill();
    for (let k = 0; k < 40; k++) { const v = r(), y = lerp(b2, base, v), hw = lerp(r2, R0, v), px = gx + (r() - .5) * 2 * hw * .9; x.fillStyle = 'rgba(70,46,40,.3)'; ov(x, px, y, 1.2 + v * 2.6, .5 + v); }
    // los portones de madera, abiertos contra los muros, con sus clavos de hierro
    for (const sg of [-1, 1]) { const xa = gx + sg * R0, xb = gx + sg * (R0 - 13), ya = base, yb = base - 2;
      x.beginPath(); x.moveTo(xa, ya); x.lineTo(xa, cy - 4); x.lineTo(xb, cy + 3); x.lineTo(xb, yb); x.closePath(); g = x.createLinearGradient(xa, 0, xb, 0); g.addColorStop(0, '#3a2418'); g.addColorStop(1, '#6a4428'); x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(20,10,8,.55)'; x.lineWidth = .7; for (let k = 1; k < 4; k++) { const u = k / 4; x.beginPath(); x.moveTo(lerp(xa, xb, u), lerp(cy - 4, cy + 3, u)); x.lineTo(lerp(xa, xb, u), lerp(ya, yb, u)); x.stroke(); }
      x.fillStyle = '#2a201c'; for (let k = 0; k < 5; k++) for (let q = 0; q < 2; q++) { const u = .25 + q * .5; x.beginPath(); x.arc(lerp(xa, xb, u), lerp(cy + 6, base - 6, k / 4), .9, 0, TAU); x.fill(); } }
    // la luz de la calle entra por el fondo
    x.globalCompositeOperation = 'lighter'; g = x.createRadialGradient(gx, b2 - 18, 4, gx, b2 - 18, 70); g.addColorStop(0, 'rgba(255,200,130,.5)'); g.addColorStop(1, 'rgba(255,170,100,0)'); x.fillStyle = g; x.fillRect(gx - W, base - H, W * 2, H);
    x.restore();
    // las dovelas: cuñas de cantera alrededor del arco, con la clave al centro
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI, ext = i === 6 ? 15 : 11;
      x.beginPath(); x.arc(gx, cy, R0, a0, a1); x.arc(gx, cy, R0 + ext, a1, a0, true); x.closePath(); x.fillStyle = i % 2 ? '#ead0a4' : '#d6b488'; x.fill(); x.strokeStyle = 'rgba(90,60,50,.55)'; x.lineWidth = 1; x.stroke();
      x.fillStyle = 'rgba(255,240,210,.35)'; x.beginPath(); x.arc(gx, cy, R0 + ext - 1.2, a0 + .01, a1 - .01); x.arc(gx, cy, R0 + ext - 3, a1 - .01, a0 + .01, true); x.closePath(); x.fill();
    }
    for (const sg of [-1, 1]) for (let k = 0; k < 4; k++) { const yy = cy + k * 19; x.fillStyle = k % 2 ? '#ead0a4' : '#d6b488'; x.fillRect(sg < 0 ? gx - R0 - 11 : gx + R0, yy, 11, 18); x.strokeStyle = 'rgba(90,60,50,.5)'; x.strokeRect(sg < 0 ? gx - R0 - 11 : gx + R0, yy, 11, 18); }
  }
  // la garita de esquina: su ménsula, el cuerpo redondo con troneras, la cúpula y el pináculo
  function garita(x, r, cx, y, lado) {
    x.fillStyle = PIEDRA2; x.beginPath(); x.moveTo(cx - 17, y - 2); x.lineTo(cx + 17, y - 2); x.lineTo(cx + 5 * lado, y + 34); x.lineTo(cx - 3 * lado, y + 34); x.closePath(); x.fill();
    for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? 'rgba(255,220,170,.25)' : 'rgba(80,50,60,.2)'; x.fillRect(cx - 15 + k * 1.2, y + 2 + k * 7, 30 - k * 3.2, 2); }
    muro(x, r, cx - 16, y - 46, 32, 46, CAL);
    const g = x.createLinearGradient(cx - 16, 0, cx + 16, 0); g.addColorStop(0, 'rgba(255,240,215,.25)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(70,40,60,.35)'); x.fillStyle = g; x.fillRect(cx - 16, y - 46, 32, 46);
    x.fillStyle = '#3e2a30'; x.fillRect(cx - 3, y - 36, 6, 17); x.fillStyle = CAL; x.beginPath(); x.ellipse(cx, y - 46, 18, 16, 0, Math.PI, 0); x.fill();
    x.fillStyle = 'rgba(80,50,70,.3)'; x.beginPath(); x.ellipse(cx, y - 46, 18, 16, 0, -1.1, 0); x.lineTo(cx, y - 46); x.fill(); cornisa(x, cx - 19, y - 48, 38, 2.4);
    x.fillStyle = CAL; x.fillRect(cx - 2.4, y - 72, 4.8, 12); x.beginPath(); x.arc(cx, y - 73, 4, 0, TAU); x.fill();
  }
  function pintaMurallaCielo(x) { cielo(x, rng(23), -720, -340, 1440, 130); }
  function palmaLlena(x, r, px, base, alto, inc) {
    const tx = px + inc * alto, ty = base - alto, cx = px + inc * alto * .35, cy = base - alto * .55;
    // el tronco: se adelgaza hacia arriba, con anillos y su lado iluminado
    const N = 18, pts = []; for (let i = 0; i <= N; i++) { const u = i / N, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; pts.push([a * px + b * cx + c * tx, a * base + b * cy + c * ty, 6.5 - u * 3]); }
    x.fillStyle = '#5e4c3e'; x.beginPath(); pts.forEach(([X, Y, w], i) => i ? x.lineTo(X - w, Y) : x.moveTo(X - w, Y)); for (let i = N; i >= 0; i--) x.lineTo(pts[i][0] + pts[i][2], pts[i][1]); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,196,130,.35)'; x.beginPath(); pts.forEach(([X, Y, w], i) => i ? x.lineTo(X + w * .1, Y) : x.moveTo(X + w * .1, Y)); for (let i = N; i >= 0; i--) x.lineTo(pts[i][0] + pts[i][2], pts[i][1]); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(40,28,26,.45)'; x.lineWidth = 1; for (let i = 1; i < N; i++) { const [X, Y, w] = pts[i]; x.beginPath(); x.moveTo(X - w, Y); x.quadraticCurveTo(X, Y + 1.6, X + w, Y); x.stroke(); }
    // las hojas: las de atrás más oscuras; cada una se arquea y cae, con foliolos a los dos lados
    const hojas = 11 + Math.floor(r() * 3);
    for (const capa of [0, 1]) for (let i = 0; i < hojas; i++) {
      if ((i % 2) !== capa) continue;
      const a0 = -Math.PI / 2 + (i / (hojas - 1) - .5) * 3.6 + (r() - .5) * .25, L = 44 + r() * 26, cae = .9 + r() * .6;
      const sp = []; for (let k = 0; k <= 12; k++) { const u = k / 12, a = a0 + Math.sign(Math.cos(a0) || 1) * u * u * cae * (Math.abs(Math.cos(a0)) + .25); sp.push([tx + Math.cos(a) * L * u, ty + Math.sin(a) * L * u + u * u * L * .22]); }
      x.strokeStyle = capa ? '#46663f' : '#2c4430'; x.lineCap = 'round';
      for (let k = 1; k <= 12; k++) { const [X0, Y0] = sp[k - 1], [X1, Y1] = sp[k], dx = X1 - X0, dy = Y1 - Y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, fl = 13 * Math.sin(k / 12 * Math.PI) + 3;
        x.lineWidth = 2.2; for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(X1, Y1); x.quadraticCurveTo(X1 + nx * sg * fl * .5 + dx * .2, Y1 + ny * sg * fl * .5 + fl * .3, X1 + nx * sg * fl + dx * .5, Y1 + ny * sg * fl + fl * .9); x.stroke(); } }
      x.strokeStyle = capa ? '#5a7a48' : '#3a5638'; x.lineWidth = 1.6; x.beginPath(); sp.forEach(([X, Y], k) => k ? x.lineTo(X, Y) : x.moveTo(X, Y)); x.stroke();
      if (capa) { x.strokeStyle = 'rgba(255,206,140,.32)'; x.lineWidth = 1.2; x.beginPath(); sp.slice(0, 7).forEach(([X, Y], k) => k ? x.lineTo(X, Y - 1.2) : x.moveTo(X, Y - 1.2)); x.stroke(); }
    }
    for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? '#6a4e30' : '#7e6038'; x.beginPath(); x.arc(tx + (k - 1.5) * 4.2, ty + 4 + (k % 2) * 2.4, 3.6, 0, TAU); x.fill(); }
  }
  function pintaMurallaPalmas(x) { const r = rng(24); for (const [px, alto, inc] of [[-650, 196, .1], [-560, 222, -.06], [-470, 180, .14], [-340, 210, -.1], [-225, 176, .08], [-110, 200, .05], [262, 186, -.06], [345, 214, -.12], [455, 228, .06], [565, 184, -.08], [660, 206, .1]]) palmaLlena(x, r, px, 10, alto, inc); }
  function pintaMurallaFondo(x) {
    const r = rng(25), base = 104, top = -38, gx = 90;
    // el baluarte a la izquierda: talud, cordón, garita de esquina
    muro(x, r, -700, top, 1400, base - top);
    x.fillStyle = 'rgba(80,50,70,.16)'; x.fillRect(-700, top + 70, 1400, base - top - 70);
    escurre(x, r, -700, top + 56, 1400, 84, 110, .22); zocalo(x, -700, base - 36, 1400, 36);
    for (let i = 0; i < 90; i++) { x.fillStyle = r() < .5 ? 'rgba(92,110,62,.3)' : 'rgba(58,70,46,.26)'; ov(x, -700 + r() * 1400, base - r() * r() * 26, 3 + r() * 12, 1 + r() * 4); }
    x.fillStyle = LUZ; x.fillRect(-700, top, 1400, 3); cornisa(x, -700, top + 54, 1400, 3); almenas(x, r, -700, 700, top);
    x.fillStyle = PIEDRA2; x.beginPath(); x.moveTo(-500, top - 12); x.lineTo(-240, top - 12); x.lineTo(-208, base); x.lineTo(-532, base); x.closePath(); x.fill(); x.save(); x.clip(); muro(x, r, -540, top - 14, 340, base - top + 16, '#cfa67c'); x.fillStyle = 'rgba(80,50,70,.24)'; x.fillRect(-330, top - 14, 140, base - top + 16); x.restore();
    almenas(x, r, -500, -236, top - 12);
    const gq = -510; x.fillStyle = PIEDRA; x.beginPath(); x.moveTo(gq - 18, top - 26); x.lineTo(gq + 18, top - 26); x.lineTo(gq + 5, top + 12); x.lineTo(gq - 5, top + 12); x.fill();
    muro(x, r, gq - 19, top - 76, 38, 52, CAL); x.fillStyle = '#3e2a30'; x.fillRect(gq - 8, top - 62, 5, 20); x.fillRect(gq + 5, top - 62, 5, 20); x.fillStyle = CAL; x.beginPath(); x.ellipse(gq, top - 76, 21, 19, 0, Math.PI, 0); x.fill(); x.fillStyle = 'rgba(80,50,70,.28)'; x.beginPath(); x.ellipse(gq, top - 76, 21, 19, 0, -1.2, 0); x.lineTo(gq, top - 76); x.fill(); x.fillStyle = CAL; x.fillRect(gq - 3, top - 106, 6, 14); x.beginPath(); x.arc(gq, top - 107, 5, 0, TAU); x.fill();
    // la Puerta de Tierra: bloque alto, arco, escudo y remate
    muro(x, r, gx - 112, top - 86, 224, base - top + 86, '#e0be92');
    x.fillStyle = 'rgba(80,50,70,.24)'; x.fillRect(gx + 44, top - 86, 68, base - top + 86);
    escurre(x, r, gx - 112, top - 84, 224, 62, 24, .2); escurre(x, r, gx - 112, top - 16, 224, 100, 30, .2); zocalo(x, gx - 112, base - 30, 224, 30);
    cornisa(x, gx - 116, top - 88, 232, 4); cornisa(x, gx - 116, top - 20, 232, 3);
    almenas(x, r, gx - 104, gx + 104, top - 86);
    for (const sg of [-1, 1]) garita(x, r, gx + sg * 112, top - 86, sg);
    pasaje(x, r, gx, base);
    x.fillStyle = '#c8a07a'; x.beginPath(); x.moveTo(gx - 19, top - 74); x.lineTo(gx + 19, top - 74); x.lineTo(gx + 19, top - 46); x.quadraticCurveTo(gx, top - 24, gx - 19, top - 46); x.fill(); x.strokeStyle = '#5a3a3a'; x.lineWidth = 1.8; x.stroke();
    x.fillStyle = '#8a4a44'; x.fillRect(gx - 4, top - 66, 8, 22); x.fillRect(gx - 12, top - 58, 24, 7);
  }
  function pintaMurallaMedio(x) {
    const r = rng(29), gx = 90, base = 104;
    x.fillStyle = '#7f9a58'; x.fillRect(-700, base - 2, 1400, 240); for (let i = 0; i < 300; i++) pincel(x, r, -700 + r() * 1400, base + r() * 220, 20 + r() * 80, 2 + r() * 5, r() < .5 ? '#a7bb68' : '#5a7a4a', .34);
    // la sombra de la muralla en el pasto y el pasto, brizna por brizna (más grande conforme se acerca)
    { const g = x.createLinearGradient(0, base - 2, 0, base + 34); g.addColorStop(0, 'rgba(50,40,70,.5)'); g.addColorStop(1, 'rgba(50,40,70,0)'); x.fillStyle = g; x.fillRect(-700, base - 2, 1400, 36); }
    for (let i = 0; i < 4200; i++) { const v = Math.pow(r(), 1.3), y = base + 1 + v * 232, bx = -700 + r() * 1400, l = 2.2 + v * 9 + r() * 2, luz = r(); x.strokeStyle = luz > .72 ? '#c2cf72' : luz > .36 ? '#8aa858' : '#4c6e46'; x.lineWidth = .7 + v * 1.1; x.beginPath(); x.moveTo(bx, y); x.quadraticCurveTo(bx + (r() - .5) * 2, y - l * .6, bx + (r() - .5) * 5, y - l); x.stroke(); }
    for (let i = 0; i < 130; i++) { const v = r(), y = base + 6 + v * 226, bx = -700 + r() * 1400; x.fillStyle = ['#fff0d0', '#f2b233', '#e0486a'][Math.floor(r() * 3)]; ov(x, bx, y, .9 + v * 1.5, .7 + v * 1.1); }
    // el camino empedrado que entra por el arco
    x.fillStyle = '#b89a7c'; x.beginPath(); x.moveTo(gx - 46, base); x.lineTo(gx + 46, base); x.lineTo(gx + 340, 340); x.lineTo(gx - 340, 340); x.closePath(); x.fill(); x.save(); x.clip();
    x.fillStyle = 'rgba(70,48,52,.42)'; x.fillRect(gx - 340, base, 680, 240); // las juntas, y sobre ellas cada piedra con su canto de luz
    for (let i = 0; i < 2100; i++) { const v = Math.pow(r(), 1.7), y = base + v * 236, hw = 46 + v * 300, px = gx + (r() - .5) * 2 * hw, s = 1 + v * 5, t = r(); x.fillStyle = 'rgba(52,34,40,.5)'; ov(x, px + s * .25, y + s * .3, s * 1.5, s * .74); x.fillStyle = t < .5 ? '#b89a7c' : t < .8 ? '#cdb08e' : '#97786a'; ov(x, px, y, s * 1.5, s * .7); x.fillStyle = 'rgba(255,236,204,.46)'; ov(x, px - s * .32, y - s * .2, s * .8, s * .22); }
    x.restore();
    for (const [ax, ay, s] of [[-520, 150, 1.2], [-300, 128, .8], [430, 134, .9], [560, 174, 1.4]]) for (let k = 0; k < 9; k++) { const a = -Math.PI * (k + .5) / 9; x.strokeStyle = k % 2 ? '#3f7a5a' : '#5f9a68'; x.lineWidth = 3.6 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax + Math.cos(a) * 34 * s, ay + Math.sin(a) * 30 * s); x.stroke(); }
  }
  function pintaCanon(x) {
    x.save(); x.translate(-370, 268); x.scale(.64, .64); x.translate(355, -262); pintaCanon0(x); x.restore();
  }
  function pintaCanon0(x) {
    const r = rng(31); x.save(); x.translate(-320, 214); x.rotate(-.13);
    const g = x.createLinearGradient(0, -34, 0, 22); g.addColorStop(0, '#6a5a5a'); g.addColorStop(.35, '#2e2630'); g.addColorStop(1, '#17121a'); x.fillStyle = g;
    x.beginPath(); x.moveTo(-190, -24); x.quadraticCurveTo(-210, 0, -190, 26); x.lineTo(40, 26); x.lineTo(40, 34); x.lineTo(64, 34); x.lineTo(64, 28); x.lineTo(230, 17); x.lineTo(246, 22); x.lineTo(246, -22); x.lineTo(230, -17); x.lineTo(64, -28); x.lineTo(64, -34); x.lineTo(40, -34); x.lineTo(40, -26); x.closePath(); x.fill();
    x.save(); x.clip(); for (let i = 0; i < 200; i++) { x.fillStyle = r() < .5 ? 'rgba(128,72,44,.17)' : 'rgba(10,8,14,.2)'; ov(x, -200 + r() * 450, -30 + r() * 60, 3 + r() * 16, 1 + r() * 5); } x.restore();
    x.strokeStyle = 'rgba(255,190,120,.65)'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-180, -24); x.lineTo(40, -26); x.moveTo(64, -28); x.lineTo(230, -17); x.stroke();
    for (const [ax, h] of [[-120, 26], [-60, 26.4], [120, 23], [204, 19]]) { x.fillStyle = '#17121a'; x.fillRect(ax, -h, 7, h * 2); x.fillStyle = 'rgba(255,190,120,.5)'; x.fillRect(ax, -h, 7, 1.6); x.fillStyle = 'rgba(255,220,180,.12)'; x.fillRect(ax, -h + 2, 2, h * 1.6); }
    x.restore();
    { const g = x.createLinearGradient(0, 214, 0, 280); g.addColorStop(0, '#5a3e30'); g.addColorStop(.3, '#3a2a28'); g.addColorStop(1, '#1e1618'); x.fillStyle = g; } x.beginPath(); x.moveTo(-540, 240); x.lineTo(-500, 214); x.lineTo(-210, 214); x.lineTo(-170, 260); x.lineTo(-540, 280); x.closePath(); x.fill();
    x.save(); x.clip(); x.strokeStyle = 'rgba(14,10,12,.6)'; x.lineWidth = .9; for (let i = 0; i < 26; i++) { const y = 214 + r() * 66, bx = -540 + r() * 360; x.beginPath(); x.moveTo(bx, y); x.lineTo(bx + 30 + r() * 90, y + (r() - .5) * 2); x.stroke(); } x.restore();
    for (const cx of [-440, -255]) { x.strokeStyle = '#17121a'; x.lineWidth = 18; x.beginPath(); x.arc(cx, 262, 58, 0, TAU); x.stroke(); x.strokeStyle = '#6a4a3a'; x.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; x.beginPath(); x.moveTo(cx, 262); x.lineTo(cx + Math.cos(a) * 50, 262 + Math.sin(a) * 50); x.stroke(); } x.fillStyle = '#2e2028'; x.beginPath(); x.arc(cx, 262, 12, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,190,120,.45)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, 262, 67, Math.PI * 1.05, Math.PI * 1.6); x.stroke(); }
  }
  function bandera(ctx, x, y, t) {
    ctx.strokeStyle = '#3e3038'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + 62); ctx.lineTo(x, y - 6); ctx.stroke(); ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.arc(x, y - 7, 2, 0, TAU); ctx.fill();
    const col = ['#2e8a58', '#f7f2e8', '#c8283a'], W = 50, H = 28, n = 12;
    for (let c = 0; c < 3; c++) { ctx.fillStyle = col[c]; ctx.beginPath(); for (let i = 0; i <= n; i++) { const u = c / 3 + i / n / 3, q = u * W, w = Math.sin(u * 7 - t * 7) * 5 * u; ctx.lineTo(x + q, y + w); } for (let i = n; i >= 0; i--) { const u = c / 3 + i / n / 3, q = u * W, w = Math.sin(u * 7 - t * 7 + .5) * 5 * u; ctx.lineTo(x + q, y + H + w); } ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#8a6a30'; ctx.beginPath(); ctx.arc(x + W / 2, y + H / 2 + Math.sin(3.5 - t * 7) * 2.5, 2.6, 0, TAU); ctx.fill();
  }

  // ---------- toma 3: una calle del centro ----------
  const VX = 0, VY = -18, MW = 620, SUELO = 330, TECHO = 470;
  // la calle es un pasillo de verdad: fachadas y piso se pintan planos (z a lo largo) y una cámara los proyecta,
  // así casas, gente, papel y pelota avanzan juntos cuando la cámara entra a la calle
  const Z0 = 1.4, CASA = 1.5, CASAS = 10, LZ = CASA * CASAS, ZF = Z0 + LZ, UZ = 230, TOPE = 490, ALTOT = TOPE + SUELO, BANQ = .78;
  const CAM = { x: 0, z: 0 }, ve = (X, z) => VX + (X - CAM.x) / (z - CAM.z);
  function pintaCalleCielo(x) {
    cielo(x, rng(37), -700, -340, 1400, 60);
    const g = x.createRadialGradient(VX, VY, 0, VX, VY, 170); g.addColorStop(0, 'rgba(255,226,160,.95)'); g.addColorStop(1, 'rgba(255,190,110,0)'); x.fillStyle = g; x.fillRect(-180, -190, 360, 340);
  }
  function pintaCallePuerta(x) { x.fillStyle = PIEDRA2; x.fillRect(VX - 39, VY - 32, 78, 62); x.fillStyle = LUZ; x.fillRect(VX - 39, VY - 33, 78, 2); arco(x, VX, VY + 30, 26, 34, '#fff0c0'); }
  function fachadas(s) {
    const c = mkCanvas(LZ * UZ, ALTOT), x = c.getContext('2d'), r = rng(s < 0 ? 37 : 43), Q = (a, b, h0, h1, col) => { x.fillStyle = col; x.fillRect((a - Z0) * UZ, h1 + TOPE, (b - a) * UZ, h0 - h1); }, ZX = z => (z - Z0) * UZ, HY = h => h + TOPE;
    for (let i = 0; i < CASAS; i++) {
      const z0 = Z0 + i * CASA, z1 = z0 + CASA, col = mix(CAMP.FACHADAS[(i * 3 + (s > 0 ? 2 : 5)) % 8], '#f4c49a', .1), alto = TECHO * (.84 + (i * 7 % 3) * .08), base = shade(col, s < 0 ? .1 : -.12);
      Q(z0, z1, SUELO, -alto, base); Q(z0, z1, -alto + 30, -alto, shade(col, .3)); Q(z0, z1, SUELO, SUELO - 86, shade(col, -.2));
      // aplanado viejo: la cal se cae y enseña la piedra, y la lluvia baja de la cornisa
      for (let k = 0; k < 16; k++) { const a = lerp(z0, z1, r()), b = Math.min(z1, a + CASA * (.03 + r() * .08)), h0 = -alto + 60 + r() * (alto + SUELO - 170), t = r(); Q(a, b, h0 + 16 + r() * 50, h0, t < .32 ? 'rgba(186,146,114,.55)' : t < .66 ? 'rgba(60,40,50,.12)' : 'rgba(255,240,215,.12)'); }
      escurre(x, r, ZX(z0), HY(-alto + 30), CASA * UZ, 300, 26, .15); zocalo(x, ZX(z0), HY(SUELO - 120), CASA * UZ, 120);
      Q(z0, z1, -alto + 52, -alto + 30, 'rgba(50,30,45,.3)'); Q(z0, z1, SUELO - 86, SUELO - 94, 'rgba(255,236,205,.3)');
      Q(z0, z0 + CASA * .02, SUELO, -alto, 'rgba(60,35,55,.36)'); Q(z1 - CASA * .012, z1, SUELO, -alto, 'rgba(255,240,215,.2)');
      for (let k = 0; k < 2; k++) {
        const za = lerp(z0, z1, .16 + k * .5), zb = lerp(z0, z1, .36 + k * .5);
        Q(za, zb, -80, -270, '#402a34'); Q(za - .02, zb + .02, -272, -292, shade(col, .32)); Q(za, zb, -264, -270, 'rgba(20,12,20,.5)');
        x.strokeStyle = '#231a22'; x.lineWidth = 2; for (let q = 0; q < 7; q++) { const px = lerp(ZX(za), ZX(zb), q / 6); x.beginPath(); x.moveTo(px, HY(-70)); x.lineTo(px, HY(-130)); x.stroke(); }
        x.lineWidth = 3.4; x.beginPath(); x.moveTo(ZX(za), HY(-132)); x.lineTo(ZX(zb), HY(-132)); x.stroke();
        Q(za - .03, zb + .03, -60, -70, shade(col, .36)); Q(za, zb, -52, -60, 'rgba(50,30,45,.3)');
        Q(za, zb, SUELO, 76, k ? '#6a3e30' : '#44303a'); Q(za - .02, zb + .02, 76, 62, shade(col, .32)); if (k && r() < .6) Q(za, zb, 300, 228, 'rgba(255,200,120,.55)');
        x.strokeStyle = 'rgba(30,18,24,.6)'; x.lineWidth = 1.6; for (let q = 1; q < 3; q++) { const px = lerp(ZX(za), ZX(zb), q / 3); x.beginPath(); x.moveTo(px, HY(SUELO)); x.lineTo(px, HY(76)); x.stroke(); } x.beginPath(); x.moveTo(ZX(za), HY(190)); x.lineTo(ZX(zb), HY(190)); x.stroke();
        if (r() < .6) for (let q = 0; q < 12; q++) { const px = lerp(ZX(za), ZX(zb), r()), py = HY(-146 - r() * 14); x.fillStyle = '#3f6e42'; ov(x, px, py, 9, 7); x.fillStyle = q % 3 ? '#e0483e' : '#f2b233'; ov(x, px, py - 8, 4, 4); }
      }
    }
    return curte(c, .85);
  }
  function pintaPiso() {
    const W = 1000, H = LZ * 200, c = mkCanvas(W, H), x = c.getContext('2d'), r = rng(47), R = W / 2 * BANQ, cx = W / 2;
    x.fillStyle = '#7e6658'; x.fillRect(0, 0, W, H);
    // adoquines: cada uno con su sombra y su canto de luz (redondos en la calle, la perspectiva los aplasta)
    for (let i = 0; i < 9000; i++) { const px = cx + (r() - .5) * 2 * R, py = r() * H, a = 15 + r() * 7, b = 5.2 + r() * 2.2, t = r(); x.fillStyle = 'rgba(46,30,38,.5)'; ov(x, px + 2, py + 1.4, a, b); x.fillStyle = t < .5 ? '#a58a76' : t < .8 ? '#bb9f86' : '#8f7468'; ov(x, px, py, a, b); x.fillStyle = 'rgba(255,232,200,.42)'; ov(x, px - a * .22, py - b * .3, a * .54, b * .28); }
    // banquetas de losas
    for (const [a, b] of [[0, cx - R], [cx + R, W]]) { x.fillStyle = '#d4bb98'; x.fillRect(a, 0, b - a, H); x.strokeStyle = 'rgba(100,70,60,.34)'; x.lineWidth = 1.4; for (let y = 0; y < H; y += 50) { x.beginPath(); x.moveTo(a, y); x.lineTo(b, y); x.stroke(); } }
    // de un lado entra la luz de la tarde y el otro queda en la sombra de las casas
    x.fillStyle = 'rgba(255,214,150,.14)'; x.fillRect(0, 0, W * .54, H); x.fillStyle = 'rgba(70,40,80,.18)'; x.fillRect(W * .54, 0, W * .46, H);
    return curte(c, .7);
  }
  // el visor: dos triángulos por superficie, con su textura y un poco de aire a lo lejos
  function camaraGL(izq, der, piso) {
    const cv = document.createElement('canvas'), gl = cv.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true }); if (!gl) return null;
    const sh = (tipo, src) => { const o = gl.createShader(tipo); gl.shaderSource(o, src); gl.compileShader(o); return o; }, pg = gl.createProgram();
    gl.attachShader(pg, sh(gl.VERTEX_SHADER, `#version 300 es
in vec3 p; in vec2 uv; in float luz; uniform vec4 m; uniform vec2 cam; uniform vec2 vp; out vec2 v; out float l; out float w;
void main() { w = p.z - cam.y; v = uv; l = luz; gl_Position = vec4((m.x * vp.x + m.y) * w + m.x * (p.x - cam.x), (m.z * vp.y + m.w) * w + m.z * p.y, 0., w); }`));
    gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float; uniform sampler2D t; in vec2 v; in float l; in float w; out vec4 o;
void main() { vec4 c = texture(t, v); c.rgb *= l; c.rgb = mix(c.rgb, vec3(1., .86, .64) * c.a, smoothstep(3., 15., w) * .62); o = c; }`));
    gl.linkProgram(pg); if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return null;
    gl.useProgram(pg);
    const R = BANQ * MW, q = [], tex = c => { const o = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, o); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); return o; }, an = gl.getExtension('EXT_texture_filter_anisotropic');
    const quad = (a, b, c2, d2) => q.push(...a, ...b, ...c2, ...a, ...c2, ...d2);
    const suelo = (x0, x1, h, luz) => { const U = X => (X + MW) / (2 * MW); quad([x0, h, Z0, U(x0), 0, luz], [x1, h, Z0, U(x1), 0, luz], [x1, h, ZF, U(x1), 1, luz], [x0, h, ZF, U(x0), 1, luz]); };
    const pared = s => quad([s * MW, -TOPE, Z0, 0, 0, 1], [s * MW, -TOPE, ZF, 1, 0, 1], [s * MW, SUELO, ZF, 1, 1, 1], [s * MW, SUELO, Z0, 0, 1, 1]);
    suelo(-R, R, SUELO, 1); suelo(-MW, -R, SUELO - 26, 1); suelo(R, MW, SUELO - 26, 1);
    for (const s of [-1, 1]) quad([s * R, SUELO, Z0, .95, 0, .6], [s * R, SUELO - 26, Z0, .95, 0, .6], [s * R, SUELO - 26, ZF, .95, 1, .6], [s * R, SUELO, ZF, .95, 1, .6]); // la guarnición
    pared(-1); pared(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(q), gl.STATIC_DRAW);
    for (const [n, k, o] of [['p', 3, 0], ['uv', 2, 12], ['luz', 1, 20]]) { const a = gl.getAttribLocation(pg, n); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, k, gl.FLOAT, false, 24, o); }
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform2f(gl.getUniformLocation(pg, 'vp'), VX, VY);
    return { cv, gl, m: gl.getUniformLocation(pg, 'm'), cam: gl.getUniformLocation(pg, 'cam'), piso: tex(piso), izq: tex(izq), der: tex(der) };
  }
  function pintaCalleGL(ctx) {
    const G = C.gl, gl = G.gl, W = ctx.canvas.width, H = ctx.canvas.height, T = ctx.getTransform();
    if (G.cv.width !== W || G.cv.height !== H) { G.cv.width = W; G.cv.height = H; }
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4f(G.m, 2 * T.a / W, 2 * T.e / W - 1, -2 * T.d / H, 1 - 2 * T.f / H); gl.uniform2f(G.cam, CAM.x, CAM.z);
    gl.bindTexture(gl.TEXTURE_2D, G.piso); gl.drawArrays(gl.TRIANGLES, 0, 30);
    gl.bindTexture(gl.TEXTURE_2D, G.izq); gl.drawArrays(gl.TRIANGLES, 30, 6);
    gl.bindTexture(gl.TEXTURE_2D, G.der); gl.drawArrays(gl.TRIANGLES, 36, 6);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(G.cv, 0, 0); ctx.restore();
  }
  // sin WebGL2: misma cámara, por renglones y columnas (menos fino pero con el mismo movimiento)
  function pintaCalle2D(ctx, M) {
    const P = C.piso, ini = VY + SUELO / (ZF - CAM.z);
    for (let y = ini; y < M.y1; y += 2) { const w = SUELO / (y - VY), z = w + CAM.z; if (z < Z0) continue; ctx.drawImage(P, 0, (z - Z0) / LZ * P.height, P.width, Math.max(1, 2 * w * w / SUELO / LZ * P.height), VX + (-MW - CAM.x) / w, y, 2 * MW / w, 2.6); }
    for (const s of [-1, 1]) { const L = s < 0 ? C.fIzq : C.fDer, x0 = VX + (s * MW - CAM.x) / (ZF - CAM.z);
      for (let x = x0; s < 0 ? x > M.x0 : x < M.x1; x += s * 2) { const w = (s * MW - CAM.x) / (x - VX), z = w + CAM.z; if (z < Z0) break; ctx.drawImage(L, (z - Z0) / LZ * L.width, 0, Math.max(1, 2 * w * w / MW / LZ * L.width), L.height, s < 0 ? x - 2 : x, VY - TOPE / w, 2.6, ALTOT / w); } }
  }
  const PICADO = ['#e0486a', '#f2b233', '#2fa3a0', '#8a5ad0', '#f07a2a', '#48b070'];
  function papelPicado(ctx, zb, t, sem) {
    const z = zb - CAM.z; if (z < 1.3) return;
    const y0 = VY - 345 / z, cx = VX - CAM.x / z, n = 18, L = MW / z, H = 40 / z, w = L * 2 / n;
    ctx.save(); ctx.strokeStyle = 'rgba(245,235,215,.8)'; ctx.lineWidth = Math.max(.4, 1.4 / z); ctx.beginPath();
    const yc = u => y0 + Math.sin(u * Math.PI) * 26 / z + Math.sin(t * 2 + u * 7 + sem) * 2 / z;
    for (let i = 0; i <= 28; i++) { const u = i / 28; ctx.lineTo(cx - L + u * L * 2, yc(u)); } ctx.stroke();
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, x = cx - L + u * L * 2, y = yc(u), bw = w * .42, oleaje = Math.sin(t * 5 + i * 1.7 + sem) * 5 / z;
      ctx.fillStyle = PICADO[(i + sem) % PICADO.length]; ctx.beginPath(); ctx.moveTo(x - bw, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw + oleaje, y + H * .84);
      for (let k = 4; k >= 0; k--) { const q = k / 4, ex = lerp(x - bw, x + bw, q) + oleaje; ctx.lineTo(ex, y + H * (k % 2 ? 1 : .86)); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,225,.82)'; for (let k = 0; k < 3; k++) { const ex = x + (k - 1) * bw * .56 + oleaje * .5; ctx.beginPath(); ctx.ellipse(ex, y + H * .42, Math.max(.3, 4 / z), Math.max(.3, 7 / z), 0, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }

  // ---------- preparar y dibujar ----------
  function prepara() {
    C = {
      plazaF: capa(-660, -340, 1320, 430, pintaPlazaFondo), plazaM: capa(-700, -180, 1400, 530, pintaPlazaMedio), plazaC: capa(-800, -320, 1600, 620, pintaPlazaFrente, 1.4),
      muroS: capa(-720, -340, 1440, 470, pintaMurallaCielo, 1.2), muroP: capa(-720, -220, 1440, 200, pintaMurallaPalmas, 1.6), muroF: capa(-720, -340, 1440, 470, pintaMurallaFondo), muroM: capa(-740, 90, 1480, 270, pintaMurallaMedio),
      canon: Object.assign(capa(-760, 90, 780, 290, pintaCanon, 1.4), { x0: -830, y0: 14 }), // (se sube para que las barras no lo tapen, y arranca a la izquierda de la gente)
      calleS: capa(-700, -340, 1400, 400, pintaCalleCielo, 1.2), calleP: capa(-60, -70, 120, 90, pintaCallePuerta, 3),
      fIzq: fachadas(-1), fDer: fachadas(1), piso: pintaPiso(),
    };
    C.gl = camaraGL(C.fIzq, C.fDer, C.piso);
  }
  function pon(ctx, L, cam, d) { const z = 1 + (cam.z - 1) * d; ctx.save(); ctx.translate(-cam.x * d, -cam.y * d); ctx.scale(z, z); ctx.drawImage(L.c, L.x0, L.y0, L.w, L.h); ctx.restore(); }
  function cubre(ctx, M, col) { ctx.fillStyle = col; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8); }

  function plaza(ctx, t, M) {
    const u = t / LARGO, cam = { x: lerp(-24, 22, EASE.io2(u)), y: lerp(14, -4, EASE.io2(u)), z: lerp(1.02, 1.09, u) };
    cubre(ctx, M, '#d8a070'); pon(ctx, C.plazaF, cam, .35); pon(ctx, C.plazaM, cam, .65);
    ctx.save(); const zm = 1 + (cam.z - 1) * .65; ctx.translate(-cam.x * .65, -cam.y * .65); ctx.scale(zm, zm);
    for (const [x, y, s, e, v] of GENTE.map(g => marcha(g, t)).sort((a, b) => a[1] - b[1])) persona(ctx, x, y, s, v, t, e);
    // las palomas se alborotan y salen volando
    for (let i = 0; i < 18; i++) { const x0 = 60 + (hash1(i, 4) - .5) * 150, f = Math.max(0, t - .22 - (x0 + 24) * .0091 - hash1(i, 3) * .16), x = x0 + f * (40 + hash1(i, 5) * 80), y = 146 + (hash1(i, 6) - .5) * 12 - f * f * 70 - f * 40; if (f <= 0) palomaPiso(ctx, x, y, i, t); else paloma(ctx, x, y, 1 + hash1(i, 7) * .5, t, i); }
    ctx.globalCompositeOperation = 'lighter'; for (const lx of [-330, -32, 132, 330]) for (const s of [-13, 0, 13]) glowDot(ctx, lx + s, s ? 65 : 58, 17, '#ffcf7a', .42 + Math.sin(t * 7 + lx) * .04);
    ctx.restore();
    pon(ctx, C.plazaC, cam, 1.25);
  }
  // la muralla: la cámara se desliza de lado y todo se mueve con ella. Lo lejano menos y lo cercano más, y el pasto
  // va en renglones cada uno con su paralaje, así no hay costura entre el muro y el piso que pisa
  const P_MURO = .45, P_FRENTE = 1.35, Pm = y => lerp(P_MURO, P_FRENTE, clamp((y - 104) / 84, 0, 1));
  function muralla(ctx, t, M) {
    const u = t / LARGO, cx = lerp(-90, 90, EASE.io2(u)), cy = lerp(-5, 6, u), Z = 1.05;
    const pone = (L, d, dx = 0) => { ctx.save(); ctx.translate(-cx * d + dx, -cy); ctx.scale(Z, Z); ctx.drawImage(L.c, L.x0, L.y0, L.w, L.h); ctx.restore(); };
    cubre(ctx, M, '#e0a878'); pone(C.muroS, .12, t * 3); pone(C.muroP, .3); pone(C.muroF, P_MURO);
    ctx.save(); ctx.translate(-cx * P_MURO, -cy); ctx.scale(Z, Z);
    bandera(ctx, 90, -204, t); // el asta sale de las almenas de la puerta
    for (let i = 0; i < 4; i++) paloma(ctx, -360 + i * 44 + t * 34, -180 - i * 16 + Math.sin(t * 2 + i) * 8, 1.5, t, i * 3 + 2);
    ctx.restore();
    const G = C.muroM, k = G.c.height / G.h;
    for (let y = 100; y * Z - cy < M.y1 + 4; y += 2) ctx.drawImage(G.c, 0, (y - G.y0) * k, G.c.width, 2 * k, G.x0 * Z - cx * Pm(y + 1), y * Z - cy, G.w * Z, 2.7);
    for (const [x, y, s, e, v] of MURO.map(g => marcha(g, t, a => g.g || .7 + (a.y - 112) * .02)).sort((a, b) => a[1] - b[1])) persona(ctx, x * Z - cx * Pm(y), y * Z - cy, s * Z, v, t, e);
    pone(C.canon, P_FRENTE);
  }
  // en la calle: dos platican, una señora cruza y los saluda, el abuelo sigue a su paso y un niño corre tras su pelota
  const CACHA = 2.18; // cuando el niño la levanta
  function pelota(ctx, e, t) { // rueda a la guarnición, rebota y queda a los pies del niño, que la levanta
    const u = t < 1.55 ? lerp(.72, -.75, t / 1.55) : lerp(-.75, -.6, EASE.out2(clamp((t - 1.55) / .6, 0, 1))), z = lerp(3.4, 3.62, clamp(t / 1.55, 0, 1)), w = z - CAM.z, r = 21 / w, k = smooth(CACHA - .1, CACHA + .04, t);
    const h = (t < 1.55 ? Math.abs(Math.sin(t * 6.4)) * 90 * Math.exp(-t * .9) : Math.abs(Math.sin((t - 1.55) * 9)) * 22 * Math.exp(-(t - 1.55) * 3)) / w;
    const px = ve(u * MW, z), py = VY + (SUELO - 8) / w, bx = lerp(px, e.mano[0], k), by = lerp(py - r - h, e.mano[1] - r * .4, k);
    if (k < 1) { ctx.fillStyle = `rgba(45,25,55,${.4 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(px, py, r * (1 - h / r * .08), r * .3, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#e0483e'; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff0d0'; ctx.lineWidth = r * .3; ctx.beginPath(); const giro = Math.min(t, CACHA) * 7; ctx.arc(bx, by, r * .96, giro, giro + 1.5); ctx.stroke();
  }
  const CALLE = [
    { v: ROPA.abuelo, r: [[0, .56 * MW, 760], [3.7, .44 * MW, 760]], dir: -1, ph: 1 },
    { v: ROPA.vestidoLila, r: [[0, .02 * MW, 660], [3.7, .3 * MW, 615]], ph: 4, acto(e, t) { const u = smooth(1, 1.3, t) * (1 - smooth(2.3, 2.7, t)); e.mira = voltea(t, .9, 2.5); if (u) e.brazo = [lerp(.05, 2.7, u), .3 + Math.sin(t * 11) * .3]; e.risa = u; } },
    { v: ROPA.jipiCafe, r: [[0, -.19 * MW, 490]], dir: -1, ph: 2, acto(e, t) { const g = Math.sin(t * 4.3) * .5 + .5, hab = smooth(.2, .4, t) * (1 - smooth(1.5, 1.8, t)); e.brazo = [lerp(.05, 1.25 + g * .55, hab), lerp(.26, 1 - g * .5, hab)]; e.risa = smooth(1.9, 2.1, t) * (1 - smooth(3, 3.3, t)); e.inclina = hab * .05; } },
    { v: ROPA.huipilNaranja, r: [[0, -.37 * MW, 495]], ph: .6, acto(e, t) { const r = smooth(1.3, 1.5, t) * (1 - smooth(2.1, 2.3, t)); e.risa = r; e.inclina = -r * .08; e.alza = r * .16; if (t > 2.3) { const u = smooth(2.3, 2.7, t); e.brazo = [lerp(.05, 1.5 + Math.sin(t * 5) * .3, u), lerp(.26, .9, u)]; } } },
    { v: ROPA.ninoAzul, r: [[.25, .86 * MW, 344], [1.95, -.49 * MW, 362], [2.4, -.49 * MW, 362], [3.7, .4 * MW, 352]], ph: 1.1, tras: pelota, acto(e, t) { // la alcanza, se agacha por ella y regresa contento con la pelota en el brazo
      const u = smooth(1.85, 2.1, t) * (1 - smooth(CACHA, 2.4, t)), v = smooth(CACHA - .05, 2.4, t); e.dir = lerp(-1, 1, smooth(2.26, 2.46, t)); e.inclina = .05 + u * .6; e.alza = -u * .3;
      e.brazo = [lerp(lerp(-Math.sin(e.f) * .5 * e.anda + .05, .95, smooth(1.85, 2.1, t)), 1.2, v), lerp(.3, .85, v)]; e.risa = smooth(2.45, 2.65, t); } },
  ];
  const GENTE_CALLE = 7.6; // a esta escala la gente llega a dos tercios de las puertas (antes casi las tapaba)
  function calle(ctx, t, M) {
    const u = t / LARGO; CAM.x = lerp(-46, 46, EASE.io2(u)); CAM.z = 1.15 * u;
    cubre(ctx, M, '#c89878'); ctx.drawImage(C.calleS.c, C.calleS.x0, C.calleS.y0, C.calleS.w, C.calleS.h);
    { const w = ZF - CAM.z, f = ZF / w, L = C.calleP; ctx.save(); ctx.translate(VX - CAM.x / w, VY); ctx.scale(f, f); ctx.translate(-VX, -VY); ctx.drawImage(L.c, L.x0, L.y0, L.w, L.h); ctx.restore(); }
    if (C.gl) pintaCalleGL(ctx); else pintaCalle2D(ctx, M);
    for (const [x, y, , e, v, g] of CALLE.map(g => marcha(g, t, () => 11)).sort((a, b) => b[1] - a[1])) { const z = y / 100, w = z - CAM.z; persona(ctx, ve(x, z), VY + (SUELO - 8) / w, GENTE_CALLE / w, v, t, e); if (g.tras) g.tras(ctx, e, t); }
    // las tiras de papel picado van amarradas de casa a casa, por arriba de las ventanas
    for (let i = 9; i >= 0; i--) papelPicado(ctx, 2.9 + i * CASA, t, i);
  }
  // ---------- la gente del malecón (la grúa baja por el hilo de un papalote hasta el niño que lo vuela) ----------
  function papalote(ctx, e, T) {
    const hx = 40 + Math.sin(T * .7) * 16, hy = -392 + Math.sin(T * 1.1) * 12, rot = Math.sin(T * 1.3) * .16 + .1;
    ctx.strokeStyle = 'rgba(255,248,232,.72)'; ctx.lineWidth = .45; ctx.beginPath(); ctx.moveTo(e.mano[0], e.mano[1]); ctx.quadraticCurveTo(lerp(e.mano[0], hx, .5) + 46, lerp(e.mano[1], hy, .5) + 34 + Math.sin(T * 1.7) * 5, hx, hy + 20); ctx.stroke();
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot);
    // la cola con moños, ondeando
    ctx.strokeStyle = 'rgba(255,248,232,.8)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(0, 24); for (let i = 1; i <= 16; i++) ctx.lineTo(Math.sin(i * .6 - T * 4) * i * .55, 24 + i * 4.2); ctx.stroke();
    for (let i = 3; i <= 15; i += 3) { const bx = Math.sin(i * .6 - T * 4) * i * .55, by = 24 + i * 4.2; ctx.fillStyle = ['#e0486a', '#f2b233', '#2fa3a0', '#f07a2a', '#8a5ad0'][i / 3 - 1]; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 4.4, by - 2); ctx.lineTo(bx - 4.4, by + 2); ctx.lineTo(bx + 4.4, by - 2); ctx.lineTo(bx + 4.4, by + 2); ctx.closePath(); ctx.fill(); }
    const cara = [[0, -26, -17, -8, 0, 24, '#d8302c'], [0, -26, 17, -8, 0, 24, '#f2b233']];
    for (const [ax, ay, bx, by, cx, cy, col] of cara) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#2fa3a0'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-7, -14.6); ctx.lineTo(0, -8); ctx.lineTo(7, -14.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-17, -8); ctx.lineTo(0, 24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,30,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 24); ctx.moveTo(-17, -8); ctx.lineTo(17, -8); ctx.stroke();
    ctx.restore();
  }
  function cana(ctx, e) {
    const [x, y] = e.mano, tx = x - 30, ty = y - 34;
    ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 16, y - 24, tx, ty); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,240,230,.5)'; ctx.lineWidth = .28; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx - 16, ty + 10, tx - 22, 120); ctx.stroke();
  }
  // el carrito de cocos con su sombrilla
  function carrito(ctx, x, y, T) {
    ctx.save(); ctx.translate(x, y);
    const so = ctx.createLinearGradient(0, 0, 70, 0); so.addColorStop(0, 'rgba(45,25,55,.42)'); so.addColorStop(1, 'rgba(45,25,55,0)'); ctx.fillStyle = so; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(70, 4); ctx.lineTo(66, 8); ctx.lineTo(-12, 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -48); ctx.stroke();
    const g = ctx.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, '#d8a060'); g.addColorStop(1, '#8a5a3c'); ctx.fillStyle = g; ctx.fillRect(-18, -19, 36, 13); ctx.fillStyle = 'rgba(60,30,30,.4)'; for (const q of [-9, 0, 9]) ctx.fillRect(q, -19, .7, 13); ctx.fillStyle = '#f0c890'; ctx.fillRect(-19, -20, 38, 1.6);
    for (const [cx, cy] of [[-11, -22], [-3.6, -22.4], [3.6, -22], [11, -22.4], [-7.4, -26], [0, -26.4], [7.4, -26]]) { ctx.fillStyle = '#4f8a3e'; ctx.beginPath(); ctx.arc(cx, cy, 3.9, 0, TAU); ctx.fill(); ctx.fillStyle = '#8fc05a'; ctx.beginPath(); ctx.arc(cx - 1.1, cy - 1.1, 1.5, 0, TAU); ctx.fill(); }
    for (const cx of [-11, 11]) { ctx.fillStyle = '#231a20'; ctx.beginPath(); ctx.arc(cx, -3.8, 3.8, 0, TAU); ctx.fill(); ctx.fillStyle = '#b08a5a'; ctx.beginPath(); ctx.arc(cx, -3.8, 1.3, 0, TAU); ctx.fill(); }
    const v = Math.sin(T * 2.3) * .7; for (let i = 0; i < 6; i++) { const a = i / 6, b = (i + 1) / 6, xa = lerp(-24, 24, a), xb = lerp(-24, 24, b); ctx.fillStyle = i % 2 ? '#fff0d8' : '#d8302c'; ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(xa, -42 + Math.sin(a * Math.PI) * 2 + v * (i % 2)); ctx.quadraticCurveTo((xa + xb) / 2, -38 + Math.sin(a * Math.PI) * 2, xb, -42 + Math.sin(b * Math.PI) * 2 + v * ((i + 1) % 2)); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  const MALECON = [
    { prop: carrito, x: -50, y: 153 },
    { v: ROPA.jipiOscuro, r: [[0, 122, 151.5]], s: 1.12, dir: -1, ph: .8, acto(e, T) { e.brazo = [1.35 + Math.sin(T * .9) * .05, .2]; e.alza = .1; }, tras: cana }, // pescando desde el pretil
    { v: ROPA.vestidoNaranja, r: [[0, -82, 151]], s: 1.1, ph: 1.4, acto(e, T) { const u = smooth(3.9, 4.3, T) * (1 - smooth(5, 5.3, T)); e.brazo = [lerp(.05, 1.5, u), .3]; e.risa = u; } }, // la que atiende los cocos
    { v: ROPA.vestidoVerde, r: [[0, 22, 156], [3.6, -6, 156], [12, -6, 156]], s: 1.14, dir: -1, ph: 2.2, acto(e, T) { const u = smooth(3.9, 4.3, T); e.brazo = [lerp(.05, 1.5, u) - smooth(5.1, 5.5, T) * .1, lerp(.26, 1.1, smooth(5.1, 5.5, T))]; } },
    { v: ROPA.abuelo, r: [[0, 340, 153], [12, 190, 153]], s: 1.08, dir: -1, ph: .5 },
    { v: ROPA.huipilAzul, r: [[0, -110, 153], [8, -430, 153]], s: 1.1, dir: -1, ph: 1.3, acto(e, T) { e.risa = smooth(4.6, 4.8, T) * (1 - smooth(5.5, 5.7, T)); } },
    { v: ROPA.jipiCafe, r: [[0, -132, 154.5], [8, -452, 154.5]], s: 1.13, dir: -1, ph: 3, acto(e, T) { e.mira = voltea(T, 4.2, 5.5); } },
    { v: ROPA.vestidoAmbar, r: [[0, 150, 157]], s: 1.17, ph: .2, acto(e, T) { e.risa = smooth(4.6, 4.9, T); e.brazo2 = [.5, .6]; } },
    { v: ROPA.ninoAzul, r: [[0, 168, 158]], s: 1.17, ph: 2.6, acto(e, T) { e.brazo = [2.5, .2 + Math.sin(T * 9) * .3]; e.salto = Math.abs(Math.sin(T * 5)) * 1.4; e.risa = 1; } },
    { v: ROPA.jipiCafe, r: [[0, 216, 160]], s: 1.2, dir: -1, ph: 1, acto(e, T) { e.camara = 1; e.brazo = [1.55, 1.05]; e.brazo2 = [1.5, 1.1]; e.inclina = .06; const f = (T - 5.05) / .22; e.flash = f > 0 && f < 1 ? 1 - f : 0; } },
    { v: ROPA.ninoRojo, r: [[0, 42, 162], [4.6, 62, 162], [5.4, 62, 162], [7, 50, 162]], s: 1.15, ph: 1.9, acto(e, T) { e.alza = .62; e.brazo = [2.55 + Math.sin(T * 2.1) * .1, .14]; }, tras: papalote },
    { v: ROPA.ninoSol, r: [[0, 88, 164]], s: 1.12, dir: -1, ph: .6, acto(e, T) { e.alza = .55; e.brazo = [2.3, .12 + Math.sin(T * 6) * .14]; e.risa = 1; } },
    { v: { tipo: 'nino', alto: 1.42, col: '#2fa3a0', col2: '#2e3040', piel: '#a06c48', pelo: '#2a1c1c' }, r: [[2, -340, 165], [14, 335, 165]], s: 1.1, ph: .9 }, // la que trota
    { v: { tipo: 'jipi', col2: '#39404e', piel: '#8a5a3c', pelo: '#2a1c1c' }, r: [[2.4, 430, 157], [8.4, -600, 157]], s: 1.1, dir: -1, ph: 0, acto(e) { e.pedalea = 1; e.anda = 1; e.corre = 0; e.f *= .45; e.brazo = [1.3, .3]; e.brazo2 = [1.3, .3]; e.inclina = .3; } },
  ];
  function maleconVivo(ctx, T) {
    const L = MALECON.map(g => g.prop ? [g.x, g.y, 0, null, null, g] : marcha(g, T)).sort((a, b) => a[1] - b[1]);
    for (const [x, y, s, e, v, g] of L) { if (g.prop) { g.prop(ctx, x, y, T); continue; } persona(ctx, x, y, s, v, T, e); if (g.tras) g.tras(ctx, e, T); }
  }

  // el rótulo de lugar: se escribe letra por letra y se borda un hilo rojo debajo
  function rotulo(ctx, M, t, l1, l2, t0, t1) {
    const a = tramo(t, t0, t0 + .4) * (1 - tramo(t, t1 - .45, t1));
    if (a <= 0) return;
    const x0 = Math.max(M.x0 + 34, -300), y0 = M.y0 + 78;
    ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(40,20,20,.7)'; ctx.shadowBlur = 6;
    if ('textRendering' in ctx) ctx.textRendering = 'geometricPrecision'; if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    // el texto ya escrito se dibuja de una sola vez (así las letras quedan bien espaciadas); solo las que van apareciendo se ponen una por una
    const escribe = (txt, fx, fy, ini, paso, rise) => {
      const k = i => clamp((t - t0 - ini - i * paso) / .3, 0, 1); let hechas = 0; while (hechas < txt.length && k(hechas) >= 1) hechas++;
      ctx.globalAlpha = a; ctx.fillText(txt.slice(0, hechas), fx, fy);
      for (let i = hechas; i < txt.length; i++) { const ki = k(i); if (ki <= 0) break; ctx.globalAlpha = a * ki; ctx.fillText(txt[i], fx + ctx.measureText(txt.slice(0, i)).width, fy + (1 - EASE.out3(ki)) * rise); }
    };
    ctx.font = '700 21px Alegreya, Georgia, serif'; ctx.fillStyle = '#fff3dc'; escribe(l1, x0, y0, .1, .03, 5);
    const w1 = ctx.measureText(l1).width;
    ctx.font = 'italic 500 14px Alegreya, Georgia, serif'; ctx.fillStyle = '#ffe2b8'; escribe(l2, x0 + 2, y0 + 18, .55, .022, 4);
    ctx.shadowBlur = 0; ctx.globalAlpha = a; const u = tramo(t, t0 + .4, t0 + 1.4, 'io2'); ctx.strokeStyle = '#e0304a'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(x0, y0 + 5); ctx.lineTo(x0 + w1 * u, y0 + 5); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  const LUGARES = [['Parque Principal', 'la Catedral de la Concepción y su kiosco'], ['Puerta de Tierra', 'la muralla que cuidó a la ciudad de los piratas'], ['Calle 59', 'el papel picado del centro histórico']];
  const TOMAS = [plaza, muralla, calle];
  function dibuja(ctx, t, M) {
    const i = clamp(Math.floor(t / PASO), 0, 2), ti = t - i * PASO;
    TOMAS[i](ctx, ti, M);
    if (i < 2 && ti > PASO) { // se funde con la siguiente
      const W = ctx.canvas.width, H = ctx.canvas.height; if (!BUF || BUF.width !== W || BUF.height !== H) BUF = mkCanvas(W, H);
      const b = BUF.getContext('2d'); b.setTransform(ctx.getTransform()); TOMAS[i + 1](b, ti - PASO, M);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = EASE.io2((ti - PASO) / CRUCE); ctx.drawImage(BUF, 0, 0); ctx.restore();
    }
    // la misma luz de la tarde en las tres tomas
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,170,90,.32)'; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8);
    // entra por la izquierda, se enfría a la derecha y las orillas se cierran
    const g = ctx.createLinearGradient(M.x0, 0, M.x1, 0); g.addColorStop(0, 'rgba(255,196,120,.34)'); g.addColorStop(.55, 'rgba(255,196,120,0)'); g.addColorStop(1, 'rgba(70,40,120,.34)'); ctx.fillStyle = g; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8);
    ctx.globalCompositeOperation = 'source-over'; const v = ctx.createRadialGradient(0, 0, (M.x1 - M.x0) * .32, 0, 0, (M.x1 - M.x0) * .66); v.addColorStop(0, 'rgba(34,14,44,0)'); v.addColorStop(1, 'rgba(34,14,44,.42)'); ctx.fillStyle = v; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8); ctx.restore();
    LUGARES.forEach(([a, b], k) => rotulo(ctx, M, t - k * PASO, a, b, .2, 3.1));
  }
  return { DUR, prepara, dibuja, rotulo, malecon: maleconVivo, libera() { if (C && C.gl) { const e = C.gl.gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); } C = null; BUF = null; TEX = null; } };
})();
