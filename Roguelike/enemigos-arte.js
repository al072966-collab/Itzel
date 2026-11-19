'use strict';
// =====================================================================
//  ACABADO DE LOS ENEMIGOS
//  Todos los enemigos pasan por aquí antes de pintarse:
//   · sombra en el suelo (más chica y tenue mientras más alto vuelan);
//   · peso: se estiran al saltar, se aplastan al caer y al recibir un pisotón,
//     y respiran cuando están quietos;
//   · ojos que siguen a Itzel y parpadean (el kit FOE_KIT.ojo);
//   · la técnica del mundo (la misma de los jefes: tinta, acuarela, grabado,
//     pixel…), así un cangrejo de sumi-e no se ve igual que uno de neón;
//   · convertidos en vidrio, se ven de vidrio; dormidos, sueltan zetas.
//  Los enemigos que se dibujaron para un mundo en particular (los de pixel,
//  de silueta, de tinta…) se quedan con su técnica propia.
//  También trae el kit con el que se dibujan (volumen, ojos, extremidades).
// =====================================================================
(function () {
  // ---------------- colores ----------------
  const MEMO = new Map();
  const memo = (k, fn) => { let v = MEMO.get(k); if (v === undefined) { v = fn(); MEMO.set(k, v); } return v; };
  const esHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  const largo = c => typeof c === 'string' && /^#[0-9a-f]{3}$/i.test(c) ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
  const tono = (c, k) => { c = largo(c); return esHex(c) ? memo(c + k, () => shade(c, k)) : c; };
  const sombraDe = c => { c = largo(c); return esHex(c) ? memo('s' + c, () => rgba(shade(c, -.55), .5)) : 'rgba(0,0,0,.3)'; };
  const luzDe = c => { c = largo(c); return esHex(c) ? memo('l' + c, () => rgba(shade(c, .55), .55)) : 'rgba(255,255,255,.28)'; };
  const PALS = new WeakMap();
  let cur = null, PLANO = false;   // PLANO: en mundos de pixel, sin luz de borde ni brillos (se ven como ruido a un pixel por unidad)
  // la paleta de un enemigo, a partir de la piel del mundo
  function pal(s) {
    let P = PALS.get(s);
    if (!P) {
      const m = largo(s.main) || '#c8503a', d = largo(s.dark) || '#2a1a1a', l = largo(s.light) || tono(m, .5), a = largo(s.accent) || '#e8b84a';
      P = { m, d, l, a, e: largo(s.eye) || '#ffe080', ms: tono(m, -.3), mss: tono(m, -.5), ml: tono(m, .28), mh: tono(m, .55), ds: tono(d, -.3), dl: tono(d, .28), dh: tono(d, .5), ls: tono(l, -.18), lh: tono(l, .4), as: tono(a, -.3), al: tono(a, .35), ln: tono(d, -.5) };
      PALS.set(s, P);
    }
    cur = P; return P;
  }

  // ---------------- volumen ----------------
  // rellena la forma, le pone textura, sombra propia abajo, luz de borde arriba, un brillo y el contorno
  function vol(c, path, col, o = {}) {
    c.beginPath(); path(c); c.fillStyle = col; c.fill();
    c.save(); c.clip();
    if (o.tex) o.tex(c);
    const [dx, dy] = o.d || [.7, 1.3];
    if (o.s !== false) { c.beginPath(); path(c); c.save(); c.translate(-dx, -dy); path(c); c.restore(); c.fillStyle = o.s || sombraDe(col); c.fill('evenodd'); }
    if (o.l !== false && !PLANO) { c.beginPath(); path(c); c.save(); c.translate(dx * .55, dy * .55); path(c); c.restore(); c.fillStyle = o.l || luzDe(col); c.fill('evenodd'); }
    if (o.hl && !PLANO) { const [x, y, r] = o.hl, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.restore();
    if (o.lw !== 0) { c.beginPath(); path(c); c.lineJoin = 'round'; c.strokeStyle = o.ln || (cur && cur.ln) || '#1a1018'; c.lineWidth = o.lw || .6; c.stroke(); }
  }
  // extremidad: una línea gruesa con su contorno (patas, colas, cuellos)
  function trazo(c, pts, w, col, o = {}) {
    const linea = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else c.lineTo(p[0], p[1]); } };
    c.save(); c.lineCap = o.cap || 'round'; c.lineJoin = 'round';
    if (o.lw !== 0) { linea(); c.strokeStyle = o.ln || (cur && cur.ln) || '#1a1018'; c.lineWidth = w + (o.lw || .9); c.stroke(); }
    linea(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
    if (o.brillo) { c.globalAlpha *= .5; c.translate(-w * .18, -w * .22); linea(); c.strokeStyle = luzDe(col); c.lineWidth = w * .35; c.stroke(); }
    c.restore();
  }
  // parpadeo: cada 3-5 s, un instante
  const parpadea = (e, t) => { const per = 3.2 + ((e.hx * 7.31) % 1.8 + 1.8) % 1.8; return ((t + e.hx * .37) % per + per) % per < .13; };
  const dormido = e => e.st === 'sleep' || e.st === 'glass';
  // un ojo que mira a Itzel: o.piel (color del párpado), o.iris, o.pupila, o.blanco, o.enojo (0-1), o.ax (ancho), o.cerrado
  function ojo(c, e, t, x, y, r, o = {}) {
    const ln = o.ln || (cur && cur.ln) || '#1a1018';
    if (dormido(e) || o.cerrado || e.st === 'stun') {
      c.save(); c.strokeStyle = ln; c.lineCap = 'round'; c.lineWidth = Math.max(.35, r * .32);
      if (e.st === 'stun') { c.beginPath(); for (let k = 0; k <= 10; k++) { const a = k / 10 * TAU * 1.6 + t * 8, rr = r * .9 * k / 10; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.stroke(); }
      else { c.beginPath(); c.arc(x, y - r * .35, r * .85, .2 * Math.PI, .8 * Math.PI); c.stroke(); }
      c.restore(); return;
    }
    const ax = o.ax || 1, cierra = parpadea(e, t);
    c.fillStyle = o.blanco || '#fffaf0'; c.beginPath(); c.ellipse(x, y, r * ax, r, 0, 0, TAU); c.fill();
    if (!cierra) {
      const mx = (e._mx || 0) * r * .32 * ax, my = (e._my || 0) * r * .28;
      if (o.iris) { c.fillStyle = o.iris; c.beginPath(); c.arc(x + mx, y + my, r * .64, 0, TAU); c.fill(); }
      c.fillStyle = o.pupila || '#140c14'; c.beginPath(); c.arc(x + mx, y + my, r * (o.iris ? .34 : .52), 0, TAU); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + mx - r * .2, y + my - r * .26, Math.max(.22, r * .2), 0, TAU); c.fill();
    }
    c.save(); c.beginPath(); c.ellipse(x, y, r * ax, r, 0, 0, TAU); c.clip();
    const en = o.enojo || 0;
    if (cierra) { c.fillStyle = o.piel || (cur && cur.m) || '#888'; c.fillRect(x - r * 2, y - r * 2, r * 4, r * 2.1); }
    else if (en > 0) { c.fillStyle = o.piel || (cur && cur.m) || '#888'; c.beginPath(); c.moveTo(x - r * 1.2, y - r * 1.2); c.lineTo(x + r * 1.2 * ax, y - r * 1.2); c.lineTo(x + r * 1.2 * ax, y - r * (1 - en * 1.3)); c.lineTo(x - r * 1.2, y - r * (1 - en * .5)); c.fill(); }
    c.restore();
    c.strokeStyle = ln; c.lineWidth = Math.max(.3, r * .26); c.beginPath(); c.ellipse(x, y, r * ax, r, 0, 0, TAU); c.stroke();
    if (cierra) { c.beginPath(); c.moveTo(x - r * ax, y + .1); c.quadraticCurveTo(x, y + r * .5, x + r * ax, y + .1); c.stroke(); }
    else if (en > 0) { c.lineWidth = Math.max(.35, r * .34); c.beginPath(); c.moveTo(x - r * 1.05, y - r * (1 - en * .5)); c.lineTo(x + r * 1.05 * ax, y - r * (1 - en * 1.3)); c.stroke(); }
  }
  // un brillito de luz
  const brillo = (c, x, y, rx, ry = rx * .55, a = .8, ang = -.5) => { if (PLANO) return; c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, ang, 0, TAU); c.fill(); };
  // puntitos (motas, manchas)
  const motas = (c, pts, col) => { c.fillStyle = col; for (const [x, y, r, ry] of pts) { c.beginPath(); c.ellipse(x, y, r, ry || r, 0, 0, TAU); c.fill(); } };
  // estrellitas de mareo
  function mareo(c, x, y, t, r = 5) {
    for (let k = 0; k < 3; k++) { const a = t * 5 + k * TAU / 3, sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * .35; c.fillStyle = k % 2 ? '#fff3a0' : '#ffd23f'; c.strokeStyle = '#4a2a10'; c.lineWidth = .3; c.beginPath(); for (let i = 0; i < 10; i++) { const b = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? .55 : 1.3; c.lineTo(sx + Math.cos(b) * rr, sy + Math.sin(b) * rr); } c.closePath(); c.fill(); c.stroke(); }
  }
  // globo de diálogo chico (¡!, ¿?, ¡uh!)
  function globo(c, x, y, txt, col = '#2a1a1a', fondo = '#fffaf0') {
    c.save(); c.font = 'bold 5px Alegreya, Georgia, serif'; const w = c.measureText(txt).width + 3.4, h = 6.4;
    c.fillStyle = fondo; c.strokeStyle = col; c.lineWidth = .5; c.beginPath(); roundRect(c, x - w / 2, y - h, w, h, 2.4); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 1.2, y - .2); c.lineTo(x - 2.4, y + 2); c.lineTo(x + .6, y - .2); c.fillStyle = fondo; c.fill(); c.stroke();
    c.fillStyle = fondo; c.fillRect(x - 1.4, y - .9, 2.2, 1); c.fillStyle = col; c.textAlign = 'center'; c.fillText(txt, x, y - 1.6); c.restore();
  }
  window.FOE_KIT = { pal, tono, sombraDe, luzDe, vol, trazo, ojo, brillo, motas, mareo, globo, parpadea, dormido };

  // ---------------- el acabado ----------------
  // efectos fuera del cuerpo: FX van antes (rayos, estelas), FXD después (globos, estrellas); no reciben la técnica del mundo
  const FX = {}, FXD = {};
  // los enemigos «de todos los mundos» (los que se redibujaron con el kit) reciben la técnica del mundo
  const GEN = new Set();
  window.FOE_ARTE = { FX, FXD, GEN };

  function prepara(e, f) {
    const g = f.g, t = f.t, dt = e._ft === undefined ? 0 : clamp(t - e._ft, 0, .1); e._ft = t;
    const p = g && g.p;
    if (p) {
      const dx = (p.x - e.x) * (e.dir || 1), dy = (p.y - 9) - (e.y - Math.max(6, (e.h || 10) * .8)), m = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dt * 9); e._mx = (e._mx || 0) + (dx / m - (e._mx || 0)) * k; e._my = (e._my || 0) + (dy / m - (e._my || 0)) * k; e._cerca = m < 60;
    }
    const vy = e.vy || 0; if ((e._vy || 0) > 140 && vy === 0) e._land = Math.min(1, e._vy / 420); e._vy = vy;
    e._land = Math.max(0, (e._land || 0) - dt * 5);
    if (e.st !== e._st) { if (e._st !== undefined && ['sleep', 'glass', 'off', 'stun', 'shell'].includes(e.st)) e._golpe = 1; e._st = e.st; }
    e._golpe = Math.max(0, (e._golpe || 0) - dt * 3);
  }
  function escala(e, t, quieto) {
    let sx = 1, sy = 1;
    const vy = e.vy || 0; if (vy) { const k = clamp(Math.abs(vy) / 700, 0, .16); sy += k; sx -= k * .7; }
    if (e._land) { sy -= .22 * e._land; sx += .2 * e._land; }
    if (e._golpe) { const k = e._golpe * Math.cos((1 - e._golpe) * 9); sy -= .32 * k; sx += .28 * k; }
    if (!quieto && !vy && e.st !== 'gone') { const dorm = e.st === 'sleep', b = Math.sin(t * (dorm ? 1.7 : 3.1) + e.hx) * (dorm ? .05 : .022); sy += b; sx -= b * .5; }
    return [sx, sy];
  }
  // sombra en el suelo
  function sombra(c, e, f) {
    if (e.st === 'gone' || e.sinSombra || !L || !L.surfaceY) return;
    const gy = MEC.surf(e.x, e.y - 3); if (!(gy < VH + 60)) return;
    const h = gy - e.y; if (h < -3 || h > 90) return;
    const k = 1 - Math.max(0, h) / 90, rx = Math.max(4, (e.w || 12) * .55) * (.55 + .45 * k), a = .3 * k;
    if (f.st && f.st.pixel) { c.fillStyle = `rgba(8,4,16,${a})`; c.fillRect(Math.round(e.x - rx), Math.round(gy) - 1, Math.round(rx * 2), 1); c.fillRect(Math.round(e.x - rx * .7), Math.round(gy), Math.round(rx * 1.4), 1); return; }
    c.save(); c.translate(e.x, gy); c.scale(1, .3);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(10,6,16,${a})`); gr.addColorStop(.7, `rgba(10,6,16,${a * .6})`); gr.addColorStop(1, 'rgba(10,6,16,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
  }
  // zetas de sueño
  function zzz(c, e, t, pix) {
    const y0 = e.y - Math.max(9, (e.h || 10) + 1);
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < 3; k++) {
      const ph = (t * .6 + k / 3) % 1, x = e.x + 3 + ph * 7 + Math.sin(ph * 6 + k) * 1.2, y = y0 - ph * 13, z = (.7 + ph * .9) * (pix ? 1.3 : 1);
      c.globalAlpha = Math.min(1, (1 - ph) * 1.6) * Math.min(1, ph * 6);
      const Z = () => { c.beginPath(); c.moveTo(x - z, y - z); c.lineTo(x + z, y - z); c.lineTo(x - z, y + z); c.lineTo(x + z, y + z); };
      Z(); c.strokeStyle = 'rgba(30,20,50,.85)'; c.lineWidth = pix ? 1.4 : 1.3; c.stroke();
      Z(); c.strokeStyle = '#ffffff'; c.lineWidth = pix ? .7 : .55; c.stroke();
    }
    c.restore();
  }
  // convertidos en vidrio: azul translúcido con un reflejo que pasa
  function vidrio(cx, W, H, S, t = 0) {
    const im = cx.getImageData(0, 0, W, H), d = im.data, per = Math.max(12, W * .9), off = (t * .8 % 1) * per * 2, b1 = Math.max(1.5, 1.6 * S), b2 = Math.max(1, .6 * S);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
      if (!d[i + 3]) continue;
      const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, u = ((x - y * .8 - off) % (per * 2) + per * 2) % (per * 2);
      d[i] = 110 + l * 130; d[i + 1] = 196 + l * 59; d[i + 2] = 240 + l * 15; d[i + 3] = d[i + 3] * .74;
      const brillo = u < b1 ? .75 : (u > b1 * 1.8 && u < b1 * 1.8 + b2) ? .5 : 0;
      if (brillo) { d[i] += (255 - d[i]) * brillo; d[i + 1] += (255 - d[i + 1]) * brillo; d[i + 2] = 255; d[i + 3] = Math.max(d[i + 3], 200); }
    }
    cx.putImageData(im, 0, 0);
  }
  // vuelto piedra (el nahual con la luz): gris tibio, moteado, con grietas
  function piedra(cx, W, H, S) {
    const im = cx.getImageData(0, 0, W, H), d = im.data, h = (x, y) => { let k = (x * 374761393 + y * 668265263) | 0; k = (k ^ (k >>> 13)) * 1274126177; return ((k ^ (k >>> 16)) >>> 0) / 4294967296; };
    const gx = Math.max(1, Math.round(S * .7));
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
      if (!d[i + 3]) continue;
      const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, n = h((x / gx) | 0, (y / gx) | 0) * .22 - .11, v = clamp(.35 + l * .55 + n, 0, 1);
      d[i] = 70 + v * 150; d[i + 1] = 66 + v * 144; d[i + 2] = 58 + v * 130; d[i + 3] = 255;
    }
    cx.putImageData(im, 0, 0);
    cx.save(); cx.globalCompositeOperation = 'source-atop'; cx.strokeStyle = 'rgba(30,26,22,.7)'; cx.lineWidth = Math.max(1, S * .35);
    cx.beginPath(); cx.moveTo(W * .3, H * .35); cx.lineTo(W * .42, H * .5); cx.lineTo(W * .38, H * .62); cx.moveTo(W * .62, H * .4); cx.lineTo(W * .55, H * .55); cx.stroke(); cx.restore();
  }
  // mundos de pixel (un pixel por unidad): orillas duras y los colores de la paleta DawnBringer de 32,
  // así el enemigo queda como sprite y no como mancha
  const DB32 = ['#000000', '#222034', '#45283c', '#663931', '#8f563b', '#df7126', '#d9a066', '#eec39a', '#fbf236', '#99e550', '#6abe30', '#37946e', '#4b692f', '#524b24', '#323c39', '#3f3f74', '#306082', '#5b6ee1', '#639bff', '#5fcde4', '#cbdbfc', '#ffffff', '#9badb7', '#847e87', '#696a6a', '#595652', '#76428a', '#ac3232', '#d95763', '#d77bba', '#8f974a', '#8a6f30'].map(h => hex(h));
  function pixelar(cx, W, H) {
    const im = cx.getImageData(0, 0, W, H), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
      const a = d[i + 3] / 255, r = d[i] / a, g = d[i + 1] / a, b = d[i + 2] / a; let best = DB32[0], bd = 1e9;
      for (const c of DB32) { const e = (c[0] - r) ** 2 * .3 + (c[1] - g) ** 2 * .59 + (c[2] - b) ** 2 * .11; if (e < bd) { bd = e; best = c; } }
      d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2]; d[i + 3] = 255;
    }
    cx.putImageData(im, 0, 0);
  }
  // contorno de un pixel, oscuro, alrededor de la silueta
  function contornoPx(cx, W, H) {
    const im = cx.getImageData(0, 0, W, H), d = im.data, a = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (a[i]) continue;
      if ((x > 0 && a[i - 1]) || (x < W - 1 && a[i + 1]) || (y > 0 && a[i - W]) || (y < H - 1 && a[i + W])) { d[i * 4] = 34; d[i * 4 + 1] = 32; d[i * 4 + 2] = 52; d[i * 4 + 3] = 255; }
    }
    cx.putImageData(im, 0, 0);
  }
  const PIXEL_PROPIO = new Set(['pixel']);
  // los enemigos con técnica se repintan a 12 cuadros por segundo (como animación de sprites); entre cuadros solo se mueven
  const CADA = 1 / 12, CADA_ESTILO = { barro: 1 / 8 };   // la plastilina, en stop motion de verdad (y su relieve cuesta más)   // mundos de pixel donde el enemigo lleva este acabado y no la técnica del jefe
  const caja = e => { const k = e.escala || 1, R = Math.max((e.w || 12) / k * .5 + 9, 14) * k, A = Math.max((e.h || 10) / k * 1.6 + 8, 20) * k; return [e.x - R, e.y - A, e.x + R, e.y + 3]; };

  function pinta(ctx, e, f, s, fd) {
    if (f.cam !== undefined && f.g && f.g.p && (e.x < f.cam - 70 || e.x > f.cam + VW + 70)) return;
    const t = f.t, nat = !GEN.has(e.k) || !!(!e.sub && fd._assetNuevo && fd._assetListo()), pix = !!(f.st && f.st.pixel), k = e.escala || 1;
    prepara(e, f);
    if (FX[e.k]) { ctx.save(); ctx.translate(e.x, e.y); ctx.scale((e.dir || 1) * k, k); FX[e.k](ctx, e, t, s, f); ctx.restore(); }
    sombra(ctx, e, f);
    const [sx, sy] = escala(e, t, pix || e.quieto);
    const cuerpo = c => {
      c.save(); const tb = e.tiembla || e.aturde > 0 ? (Math.random() - .5) * 1.2 * k : 0; if (pix) c.translate(Math.round(e.x + tb), Math.round(e.y)); else c.translate(e.x + tb, e.y); c.scale((e.dir || 1) * sx * k, sy * k);
      if (e.st === 'gone') { c.globalAlpha *= clamp(1 - e.tt / .7, 0, 1); c.rotate(e.tt * 4); }
      fd(c, e, t, s); c.restore();
    };
    const A = window.JEFES_ARTE, vid = e.st === 'glass' && !e.sinVidrio, arte = !nat && e.st !== 'gone' && !FOE_ARTE.crudo && A && A.tiene(f);
    const sid = f.st ? String(f.st.id).split('~')[0] : '', px1 = pix && !nat && e.st !== 'gone', propio = px1 && PIXEL_PROPIO.has(sid);
    const post = vid ? (e.piedra ? piedra : (cx, W, H, S) => vidrio(cx, W, H, S, t)) : propio ? contornoPx : null; PLANO = px1;
    const cc = e._cc || (e._cc = {}), llave = e.st + '|' + (e.dir || 1) + '|' + sid; if (cc.llave !== llave) { cc.llave = llave; cc.t = -1e9; }
    if (!((arte || vid || px1) && A && A.aplicar(ctx, f, caja(e), cuerpo, { k: .5, sinTecnica: !arte || propio, pre: px1 ? pixelar : null, post, cache: cc, cada: CADA_ESTILO[sid] || CADA, maxS: 3, entero: pix }))) cuerpo(ctx);
    PLANO = false;
    if (FXD[e.k]) { ctx.save(); ctx.translate(e.x, e.y); ctx.scale(k, k); FXD[e.k](ctx, e, t, s, f); ctx.restore(); }
    if (e.st === 'sleep' && !e.sinZ) zzz(ctx, e, t, pix);
  }
  MEC.setFoeArte((ctx, e, f, sk, FD) => pinta(ctx, e, f, (sk && sk.foe) || MEC.DEFAULT_SKIN.foe, FD[e.k] || FD.cangrejo));
  window.FOE_ARTE.pinta = pinta;
})();
