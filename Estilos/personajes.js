'use strict';
// =====================================================================
//  PERSONAJES · Itzel y Fresita con un diseño propio para cada estilo
//  favorito. Itzel: niña campechana, coletas con moño rojo, corona de
//  flores, huipil blanco bordado, short verde, tenis rojos y mochila.
//  Fresita: ajolote rosa mágico que flota.
// =====================================================================
const FAVORITOS = ['pixel', 'ocaso', 'acuarela', 'paper', 'biolum', 'flat', 'sumie', 'neon', 'bruma', 'lowpoly', 'codex', 'oleo', 'vitral', 'cuaderno', 'grabado', 'anime', 'nouveau', 'deco', 'cyber', 'cinema', 'vapor'];

const ITZEL_BASE = { skin: '#b9784f', hair: '#241718', blouse: '#f6f1e6', emb: ['#e0485a', '#f2b233', '#3fa36b', '#3f7fd6'], shorts: '#3f8f4a', shoes: '#d83a3a', bow: '#e0303f', pack: '#e8a33a', eye: '#241718', cheek: 'rgba(224,72,90,.45)', flowers: true };
const FRESITA_BASE = { body: '#ffc9e0', belly: '#ffe6f1', gill: '#ff4f95', gillTip: '#ff7fb2', eye: '#2a1020', line: '#a8396a', lw: .7, glow: '#ff8cc6', glowA: .35, cheek: 'rgba(255,90,150,.5)' };

// ---------- pose de Itzel (brazos y coletas sobre la pose comun) ----------
function itzelPose(p, t) {
  const g = heroPose(p, t), b = g.bob, flow = .35 + g.sp * .65 + (g.air ? .3 : 0), sw = Math.sin(p.run) * g.run;
  const vy = g.air ? clamp(p.vy * .004, -1.2, 1.2) : 0;
  g.arm = [1.4, -9.4 + b, 1.8 + sw * 2.6 + (g.air ? 2.2 : 0), -6.2 + b - (g.air ? 3 : 0)];
  g.arm2 = [-1.2, -9.4 + b, -1.4 - sw * 2.6 - (g.air ? 1 : 0), -6.4 + b];
  g.pigA = []; for (let i = 0; i <= 4; i++) g.pigA.push([-3.7 - i * (.5 + .75 * flow), -14.4 + b + i * (1.55 - flow * .75) + Math.sin(t * 8 - i * .9) * .3 * i * (.3 + flow) + vy * i]);
  g.pigB = []; for (let i = 0; i <= 3; i++) g.pigB.push([-1.4 - i * (.6 + .8 * flow), -18.6 + b - i * .45 + i * i * (.38 - flow * .12) + Math.sin(t * 8 - i - 1) * .25 * i + vy * i * .7]);
  if (p.pared) resbalaPared(g, t);
  return g;
}
// resbalándose por una pared (de cara a ella, la pared queda adelante): la mano de enfrente pegada arriba,
// la otra abierta para no voltearse, un pie apoyado con la rodilla doblada, el otro colgando,
// y las coletas que se levantan porque va bajando
function resbalaPared(g, t) {
  const tiembla = Math.sin(t * 38) * .18; g.bob = 0; g.sq = 0;
  g.arm = [1.4, -9.4, 4.5, -14.6 + tiembla];
  g.arm2 = [-1.2, -9.4, -4.4, -12.2 - tiembla];
  g.l1 = [-1.2, -3.5, -2.4, -.2 + Math.sin(t * 9) * .5];
  g.l2 = [1.2, -3.5, 4.3, -4.4];
  g.pigA = []; for (let i = 0; i <= 4; i++) g.pigA.push([-3.7 - i * .9, -14.4 - i * 1.15 + Math.sin(t * 14 - i) * .25 * i]);
  g.pigB = []; for (let i = 0; i <= 3; i++) g.pigB.push([-1.4 - i * .8, -18.6 - i * 1.25 + Math.sin(t * 14 - i - 1) * .2 * i]);
}

// o._mode: 'both' (relleno + linea), 'fill' (solo relleno), 'line' (solo linea, para bocetos)
function drawItzel(ctx, p, f, o0) {
  const o = Object.assign({}, ITZEL_BASE, o0), g = itzelPose(p, f.t), b = g.bob;
  const mode = o._mode || 'both', lw = mode === 'fill' ? 0 : (o.lw || 0), line = o.line, doFill = mode !== 'line';
  const col = k => (o.mono && !(o.keep && o.keep.includes(k))) ? o.mono : o[k];
  const plain = doFill && !o.mono;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.face * g.sx, g.sy);
  if (o.alpha) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = (o.glowB || 6) * f.S; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fs = c => { if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); } if (doFill && c) { ctx.fillStyle = c; ctx.fill(); } };
  const thick = (w, c) => { if (lw && mode === 'line') { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); return; } if (lw) { ctx.lineWidth = w + lw * 2; ctx.strokeStyle = line; ctx.stroke(); } if (doFill) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); } };
  const blobs = (pts, r0, r1, extra) => { ctx.beginPath(); pts.forEach((q, i) => { const r = lerp(r0, r1, i / (pts.length - 1)) + extra; ctx.moveTo(q[0] + r, q[1]); ctx.arc(q[0], q[1], r, 0, TAU); }); };
  const chain = (pts, r0, r1, c) => {
    if (mode === 'line') { blobs(pts, r0, r1, 0); ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); return; }
    if (lw) { blobs(pts, r0, r1, lw); ctx.fillStyle = line; ctx.fill(); }
    if (doFill) { blobs(pts, r0, r1, 0); ctx.fillStyle = c; ctx.fill(); }
  };
  const leg = (l) => { ctx.beginPath(); ctx.moveTo(l[0], l[1] + b); ctx.lineTo(l[2], l[3] - .6); thick(2.1, col('skin')); ctx.beginPath(); ctx.ellipse(l[2] + .8, l[3] - .9, 1.9, 1.15, 0, 0, TAU); fs(col('shoes')); if (plain) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(l[2] - 1, l[3] - .35, 3.6, .45); } };
  const bow = (q) => { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 1.9, q[1] - 1.6); ctx.lineTo(q[0] - 1.9, q[1] + 1.4); ctx.closePath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + 1.9, q[1] - 1.6); ctx.lineTo(q[0] + 1.9, q[1] + 1.4); ctx.closePath(); fs(col('bow')); ctx.beginPath(); ctx.arc(q[0], q[1], .75, 0, TAU); fs(col('bow')); };
  // brazo de atras, mochila, pierna de atras
  ctx.beginPath(); ctx.moveTo(g.arm2[0], g.arm2[1]); ctx.lineTo(g.arm2[2], g.arm2[3]); thick(1.5, o.mono ? o.mono : shade(o.skin, -.18));
  ctx.beginPath(); roundRect(ctx, -6.7, -10.7 + b, 3.5, 5.7, 1.3); fs(col('pack'));
  if (plain) { ctx.strokeStyle = shade(o.pack, -.3); ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(-6.6, -8.5 + b); ctx.lineTo(-3.3, -8.5 + b); ctx.stroke(); }
  leg(g.l1);
  ctx.beginPath(); roundRect(ctx, -4, -5.8 + b, 8, 2.8, .9); fs(col('shorts'));
  leg(g.l2);
  // huipil
  const blouse = () => { ctx.beginPath(); ctx.moveTo(-3.4, -10.9 + b); ctx.quadraticCurveTo(0, -11.7 + b, 3.4, -10.9 + b); ctx.lineTo(4.6, -4.7 + b); ctx.quadraticCurveTo(0, -4 + b, -4.6, -4.7 + b); ctx.closePath(); };
  blouse(); fs(col('blouse'));
  if (plain) {
    ctx.save(); blouse(); ctx.clip();
    if (o.blouse2) { ctx.fillStyle = o.blouse2; ctx.fillRect(.8, -12 + b, 6, 9); }
    const E = o.emb;
    for (let i = 0; i < 6; i++) { ctx.fillStyle = E[i % E.length]; ctx.beginPath(); ctx.arc(-2.9 + i * 1.15, -10.5 + b + Math.abs(i - 2.5) * .12, .5, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 8; i++) { ctx.fillStyle = E[(i + 1) % E.length]; ctx.beginPath(); const x = -4.4 + i * 1.25; ctx.moveTo(x, -4.6 + b); ctx.lineTo(x + .62, -5.9 + b); ctx.lineTo(x + 1.24, -4.6 + b); ctx.fill(); }
    ctx.fillStyle = E[0]; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; ctx.beginPath(); ctx.arc(1.1 + Math.cos(a) * .75, -7.9 + b + Math.sin(a) * .75, .5, 0, TAU); ctx.fill(); } ctx.fillStyle = E[1]; ctx.beginPath(); ctx.arc(1.1, -7.9 + b, .4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = shade(o.pack, -.25); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(-3, -10.6 + b); ctx.lineTo(1.4, -4.9 + b); ctx.stroke();
  }
  // brazo de enfrente y manga
  ctx.beginPath(); ctx.moveTo(g.arm[0], g.arm[1]); ctx.lineTo(g.arm[2], g.arm[3]); thick(1.6, col('skin'));
  ctx.beginPath(); ctx.arc(1.6, -9.8 + b, 1.5, 0, TAU); fs(col('blouse'));
  // coletas, cabeza, cara
  chain(g.pigB, 1.4, .8, col('hair')); chain(g.pigA, 1.7, .9, col('hair'));
  const hy = -15 + b; ctx.beginPath();
  if (o.poly) { for (let i = 0; i < o.poly; i++) { const a = i / o.poly * TAU + .3; ctx.lineTo(.6 + Math.cos(a) * 4.9, hy + Math.sin(a) * 4.9); } ctx.closePath(); } else ctx.arc(.6, hy, 4.75, 0, TAU);
  fs(col('hair'));
  if (!o.noFace && doFill) {
    ctx.beginPath(); ctx.ellipse(2.25, hy + .9, 3.2, 3.3, 0, 0, TAU); ctx.fillStyle = col('skin'); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.6, hy - 4.2); ctx.quadraticCurveTo(3, hy - 5.8, 5.4, hy - 1.6); ctx.lineTo(4.4, hy - 2.1); ctx.lineTo(3.6, hy - 1.2); ctx.lineTo(2.6, hy - 2.3); ctx.lineTo(1.4, hy - 1.4); ctx.lineTo(.2, hy - 2.6); ctx.closePath(); ctx.fillStyle = col('hair'); ctx.fill();
  }
  const blink = (f.t % 3.7) < .12 ? .15 : 1;
  if (!o.noFace) {
    if (o.bigEyes) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(3.1, hy + .5, 1.15, 1.6 * blink, 0, 0, TAU); ctx.fill(); ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(3.35, hy + .6, .85, 1.3 * blink, 0, 0, TAU); ctx.fill(); if (blink > .5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(3.6, hy, .38, 0, TAU); ctx.fill(); } ctx.strokeStyle = o.line || o.eye; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(2, hy - 1.1); ctx.lineTo(4.4, hy - 1.3); ctx.stroke(); }
    else { ctx.fillStyle = mode === 'line' ? line : col('eye'); ctx.beginPath(); ctx.ellipse(3.2, hy + .5, .75, 1.15 * blink, 0, 0, TAU); ctx.fill(); if (o.glint && blink > .5) { ctx.fillStyle = o.glint; ctx.beginPath(); ctx.arc(3.45, hy, .3, 0, TAU); ctx.fill(); } }
    if (plain && o.cheek) { ctx.fillStyle = o.cheek; ctx.beginPath(); ctx.ellipse(3.9, hy + 2.3, .9, .55, 0, 0, TAU); ctx.fill(); }
  } else if (o.eyeGlow) {
    const es = o.twoEyes ? [1.8, 3.9] : [3.2];
    for (const ex of es) { ctx.save(); ctx.shadowColor = o.eyeGlow; ctx.shadowBlur = 4 * f.S; ctx.fillStyle = o.eyeGlow; ctx.beginPath(); ctx.ellipse(ex, hy + .4, .65, 1 * blink, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  bow(g.pigA[0]); bow(g.pigB[0]);
  if (o.flowers) { const fc = o.flowerCols || o.emb; [[-1.8, -4.1], [.6, -4.9], [3, -4.3]].forEach(([fx, fy], i) => { const x = fx, y = hy + fy; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; ctx.moveTo(x + Math.cos(a) * .9 + .65, y + Math.sin(a) * .9); ctx.arc(x + Math.cos(a) * .9, y + Math.sin(a) * .9, .65, 0, TAU); } fs(o.mono && !(o.keep && o.keep.includes('flowers')) ? o.mono : fc[i % fc.length]); if (plain) { ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(x, y, .45, 0, TAU); ctx.fill(); } }); }
  if (o.extra) o.extra(ctx, g, o, mode, f);
  ctx.restore();
  return g;
}

// ---------- Fresita ----------
function drawAxolotl(ctx, x, y, face, t, f, o0) {
  const o = Object.assign({}, FRESITA_BASE, o0), mode = o._mode || 'both', lw = mode === 'fill' ? 0 : (o.lw || 0), line = o.line, doFill = mode !== 'line';
  const col = k => (o.mono && !(o.keep && o.keep.includes(k))) ? o.mono : o[k];
  const plain = doFill && !o.mono;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * 1.4); ctx.scale(face, 1);
  if (o.alpha) ctx.globalAlpha *= o.alpha;
  if (o.glow && doFill && !o.noHalo) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, o.haloR || 18, o.glow, o.glowA); ctx.globalCompositeOperation = 'source-over'; }
  if (o.shadowGlow) { ctx.shadowColor = o.shadowGlow; ctx.shadowBlur = 6 * f.S; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fs = c => { if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); } if (doFill && c) { ctx.fillStyle = c; ctx.fill(); } };
  // cola
  ctx.beginPath(); ctx.moveTo(-5, -1); for (let i = 0; i <= 8; i++) ctx.lineTo(-5 - i * 1.1, -1 + Math.sin(t * 8 - i * .7) * i * .25); for (let i = 8; i >= 0; i--) ctx.lineTo(-5 - i * 1.1, 1.4 + Math.sin(t * 8 - i * .7) * i * .25 - i * .25); ctx.closePath(); fs(col('body'));
  for (const [lx, ph] of [[-3, 0], [2, 1]]) { ctx.beginPath(); ctx.ellipse(lx + Math.sin(t * 6 + ph) * .6, 3.3, .9, 1.6, .4, 0, TAU); fs(col('body')); }
  const bodyP = () => { ctx.beginPath(); if (o.poly) { [[-7, 0], [-4, -3.6], [2, -3.9], [5, -1], [3, 3.4], [-4, 3.6]].forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); } else ctx.ellipse(-1, 0, 6.5, 3.8, 0, 0, TAU); };
  bodyP(); fs(col('body'));
  if (plain) { ctx.save(); bodyP(); ctx.clip(); if (o.body2) { ctx.fillStyle = o.body2; ctx.fillRect(-8, .8, 14, 4); } ctx.fillStyle = o.belly; ctx.beginPath(); ctx.ellipse(-1, 1.9, 4.5, 1.5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // branquias
  // branquias: tres plumas arriba y dos abajo, detras de la cabeza, en abanico
  const GILLS = [[2.6, -3.2, -1.75, 5.4], [2, -2.4, -2.2, 5.8], [1.6, -1.4, -2.65, 5], [1.8, 1.2, 2.55, 4.4], [2.4, 2, 2.1, 4]];
  GILLS.forEach(([x0, y0, a0, l], k) => {
    const a = a0 + Math.sin(t * 5 + k * 1.3) * .12, tx = x0 + Math.cos(a) * l, ty = y0 + Math.sin(a) * l;
    const stalk = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.cos(a + .25) * l * .55, y0 + Math.sin(a + .25) * l * .55, tx, ty); };
    const ticks = () => { ctx.beginPath(); for (let i = 1; i <= 3; i++) { const m = i / 4, px = x0 + (tx - x0) * m, py = y0 + (ty - y0) * m, n = a + Math.PI / 2; ctx.moveTo(px - Math.cos(n) * 1.1, py - Math.sin(n) * 1.1); ctx.lineTo(px + Math.cos(n) * 1.1, py + Math.sin(n) * 1.1); } };
    if (mode === 'line') { stalk(); ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); ticks(); ctx.stroke(); return; }
    if (lw && o.gillLine) { stalk(); ctx.lineWidth = 1.5 + lw * 2; ctx.strokeStyle = line; ctx.stroke(); }
    stalk(); ctx.lineWidth = 1.5; ctx.strokeStyle = col('gill'); ctx.stroke();
    ticks(); ctx.lineWidth = .8; ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, 1, 0, TAU); ctx.fillStyle = col('gillTip'); ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.beginPath(); if (o.poly) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.lineTo(4.5 + Math.cos(a) * 4.4, -.5 + Math.sin(a) * 4.2); } ctx.closePath(); } else ctx.arc(4.5, -.5, 4.2, 0, TAU);
  fs(col('body'));
  // (la cabeza va de un solo color: la franja oscura de abajo parecía barba)
  if (!o.noFace) {
    const blink = (t % 4.3) < .12 ? .2 : 1;
    if (o.bigEyes) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(6, -1.2, 1.25, 1.5 * blink, 0, 0, TAU); ctx.fill(); ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(6.2, -1.1, .95, 1.2 * blink, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.5, -1.6, .4, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = mode === 'line' ? line : (o.eyeGlow || col('eye')); if (o.eyeGlow) { ctx.shadowColor = o.eyeGlow; ctx.shadowBlur = 4 * f.S; } ctx.beginPath(); ctx.ellipse(6.2, -1.4, .95, .95 * blink, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; if (plain) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.5, -1.8, .35, 0, TAU); ctx.fill(); } }
    if (plain || mode === 'line') { ctx.strokeStyle = mode === 'line' ? line : (o.mouth || line); ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(6.4, .9, 1.2, .2, Math.PI - .4); ctx.stroke(); }
    if (plain && o.cheek) { ctx.fillStyle = o.cheek; ctx.beginPath(); ctx.ellipse(4.6, 1.2, .9, .5, 0, 0, TAU); ctx.fill(); }
  }
  if (o.extra) o.extra(ctx, o, mode, f, t);
  ctx.restore();
}

// ---------- pixel art (lo usan pixel, Game Boy y CGA) ----------
const PXO = '#222034';
function pxSprite(ctx, X, Y, fc, rects) {
  const mx = (x, w) => fc > 0 ? X + x : X - x - w;
  ctx.fillStyle = PXO; for (const [x, y, w, h, , out] of rects) if (out !== false) ctx.fillRect(mx(x, w) - 1, Y + y - 1, w + 2, h + 2);
  for (const [x, y, w, h, c] of rects) { ctx.fillStyle = c; ctx.fillRect(mx(x, w), Y + y, w, h); }
}
function pixelItzel(ctx, p, t) {
  const run = p.on && Math.abs(p.vx) > 25, fr = run ? Math.floor(p.run / (TAU / 4)) % 4 : 0, b = run ? (fr % 2 ? -1 : 0) : 0;
  const SK = '#c27a4e', SK2 = '#8f563b', HR = '#2b1d20', WH = '#f4efe6', R = [];
  const r = (x, y, w, h, c, out) => R.push([x, y, w, h, c, out]);
  let legs;
  if (!p.on) legs = [[-4, -4, 2], [1, -3, 2]];
  else if (!run) legs = [[-3, -3, 3], [1, -3, 3]];
  else legs = [[[-4, -3, 3], [2, -3, 3]], [[-2, -4, 3], [1, -3, 3]], [[2, -3, 3], [-4, -3, 3]], [[1, -3, 3], [-2, -4, 3]]][fr];
  const sw = run ? (fr < 2 ? 1 : -1) : 0, wv = Math.round(Math.sin(t * 9) * (run || !p.on ? 1 : .4));
  r(-3 - sw, -9 + b, 1, 3, SK2, false);
  r(-7, -10 + b, 3, 5, '#df7126'); r(-7, -8 + b, 3, 1, '#8f563b', false);
  legs.forEach(([x, y, h], i) => { r(x, y, 2, h, i ? SK : SK2); r(x, y + h - 1, 3, 1, '#ac3232', false); });
  r(-4, -5 + b, 8, 2, '#37946e'); r(-4, -4 + b, 8, 1, '#2f7a5c', false);
  r(-4, -10 + b, 8, 5, WH); r(2, -10 + b, 2, 5, '#cbdbfc', false);
  ['#d95763', '#fbf236', '#639bff', '#6abe30'].forEach((c, i) => { r(-4 + i * 2, -10 + b, 1, 1, c, false); r(-3 + i * 2, -6 + b, 1, 1, c, false); });
  r(0, -8 + b, 1, 1, '#d95763', false);
  r(-3, -10 + b, 1, 1, '#8f563b', false); r(-2, -9 + b, 1, 1, '#8f563b', false); r(-1, -8 + b, 1, 1, '#8f563b', false);
  r(1 + sw, -9 + b, 1, 3, SK, false);
  r(-6, -14 + b + wv, 2, 4, HR); r(-7, -11 + b + wv * 2, 2, 3, HR);
  r(-4, -17 + b, 9, 7, HR);
  r(-1, -14 + b, 6, 4, SK, false); r(-1, -14 + b, 3, 1, HR, false); r(3, -14 + b, 1, 1, HR, false);
  const blink = (t % 3.7) < .12;
  r(1, -13 + b, 1, blink ? 1 : 2, PXO, false); r(3, -13 + b, 1, blink ? 1 : 2, PXO, false); r(4, -11 + b, 1, 1, '#d95763', false);
  r(-6, -16 + b, 3, 2, '#d95763'); r(-5, -16 + b, 1, 2, '#ac3232', false);
  r(-3, -18 + b, 1, 1, '#fbf236', false); r(0, -18 + b, 1, 1, '#d95763', false); r(3, -17 + b, 1, 1, '#ffffff', false); r(-2, -18 + b, 1, 1, '#6abe30', false);
  pxSprite(ctx, Math.round(p.x), Math.round(p.y), p.face, R);
}
function pixelFresita(ctx, x, y, face, t) {
  const B = '#ffaccb', G1 = '#ff5c9a', R = [], r = (a, b, w, h, c, out) => R.push([a, b, w, h, c, out]);
  const w1 = Math.round(Math.sin(t * 8) * .7), w2 = Math.round(Math.sin(t * 8 - 1.5) * .7), lg = Math.round(Math.sin(t * 6));
  r(-12, w2, 3, 1, B); r(-9, -1 + w1, 3, 2, B); r(-7, -1, 2, 3, B);
  r(-3, 2, 1, 2 + lg, B); r(1, 2, 1, 2 - lg, B);
  r(-5, -2, 6, 4, B); r(-4, 1, 5, 1, '#ffe0ec', false);
  r(1, -3, 7, 5, B); r(2, -3, 4, 1, '#ffd6e6', false);
  const G2 = '#ff9cc8';
  r(0, -4, 1, 1, G1, false); r(-1, -5, 1, 1, G1, false); r(-2, -6, 1, 1, G2, false);
  r(1, -5, 1, 1, G1, false); r(1, -6, 1, 1, G1, false); r(0, -7, 1, 1, G2, false);
  r(2, -4, 1, 1, G1, false); r(3, -5, 1, 1, G1, false); r(3, -6, 1, 1, G2, false);
  r(0, 2, 1, 1, G1, false); r(-1, 3, 1, 1, G1, false); r(-2, 4, 1, 1, G2, false);
  const blink = (t % 4.3) < .12;
  r(6, -2, 1, blink ? 1 : 2, '#3a1030', false); r(6, 1, 2, 1, '#c0507a', false); r(4, 0, 1, 1, '#ff7fb0', false);
  pxSprite(ctx, Math.round(x), Math.round(y + Math.sin(t * 3) * 1.4), face, R);
  if ((t * 3 | 0) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x + Math.cos(t * 2) * 10), Math.round(y - 6 + Math.sin(t * 2.6) * 5), 1, 1); }
}

// ---------- diseños por estilo ----------
function setChar(id, player, fresita) { const st = STYLE_MAP[id]; if (!st) return; st.player = player; st.fresita = fresita; }
const I = (o) => (ctx, p, f) => drawItzel(ctx, p, f, o);
const F = (o) => (ctx, fr, f) => drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, o);
// sombra de papel: el personaje se dibuja aparte y la sombra sale de su silueta completa
// (antes cada trazo echaba su sombra y el ojo y la boca de Fresita se veían dobles)
const SOMBRA = { cv: null, cx: null };
const withShadow = (fn, c, b, oy) => (ctx, a, f) => {
  const m = ctx.getTransform(), S = Math.hypot(m.a, m.b) || 1, px = m.a * a.x + m.c * a.y + m.e, py = m.b * a.x + m.d * a.y + m.f, R = Math.ceil(32 * S), W = R * 2, H = R * 2, x0 = Math.floor(px - R), y0 = Math.floor(py - R * 1.4);
  if (!SOMBRA.cv) { SOMBRA.cv = mkCanvas(1, 1); SOMBRA.cx = SOMBRA.cv.getContext('2d'); }
  const cv = SOMBRA.cv, cx = SOMBRA.cx; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.globalAlpha = 1; cx.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
  fn(cx, a, f);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.shadowColor = c; ctx.shadowBlur = b * S; ctx.shadowOffsetY = oy * S; ctx.drawImage(cv, x0, y0); ctx.restore();
};
const sketchy = (o, seedRate = 8) => (ctx, p, f) => {
  ctx.save(); ctx.globalAlpha = .55; drawItzel(ctx, p, f, { ...o, _mode: 'fill' }); ctx.restore();
  const s = Math.floor(f.t * seedRate);
  for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate((hash1(s, k) - .5) * .7, (hash1(s, k + 5) - .5) * .7); drawItzel(ctx, p, f, { ...o, _mode: 'line' }); ctx.restore(); }
};
const sketchyF = (o, seedRate = 8) => (ctx, fr, f) => {
  ctx.save(); ctx.globalAlpha = .6; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { ...o, _mode: 'fill' }); ctx.restore();
  const s = Math.floor(f.t * seedRate);
  for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate((hash1(s, k + 9) - .5) * .7, (hash1(s, k + 15) - .5) * .7); drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { ...o, _mode: 'line' }); ctx.restore(); }
};

// 1 · Pixel 16 bits (y por herencia Game Boy y CGA)
setChar('pixel', (ctx, p, f) => pixelItzel(ctx, p, f.t), (ctx, fr, f) => pixelFresita(ctx, fr.x, fr.y, fr.face, f.t));

// 2 · Ocaso en siluetas (elegido: Contraluz dorado): silueta con filo de sol dorado en la orilla
{ const K = '#12081a', FILO = '#ffb070';
  setChar('ocaso', (ctx, p, f) => { ctx.save(); ctx.translate(p.face * .7, -.4); drawItzel(ctx, p, f, { _mode: 'fill', mono: FILO }); ctx.restore(); drawItzel(ctx, p, f, { mono: K, keep: ['bow'], noFace: true, eyeGlow: FILO }); },
    (ctx, fr, f) => { ctx.save(); ctx.translate(fr.face * .7, -.4); drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: FILO, noHalo: true }); ctx.restore(); drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { mono: K, keep: ['gill', 'gillTip'], eyeGlow: FILO, glow: FILO, glowA: .15 }); }); }

// 3 · Acuarela y tinta (elegido: Pastel): colores muy diluidos, casi blancos
setChar('acuarela', I({ lw: .7, line: '#8a6a5a', alpha: .9, skin: '#f0c8b0', hair: '#8a6a5a', blouse: '#ffffff', emb: ['#f0a0a0', '#f0d890', '#a0c0f0'], shorts: '#b8d8a8', shoes: '#f0a0a0', bow: '#f0a0a0', pack: '#f0d890', cheek: 'rgba(217,101,91,.45)' }),
  F({ lw: .6, line: '#9a7a7a', alpha: .92, body: '#fcd0dc', belly: '#fff4f8', gill: '#f0a0b8', gillTip: '#fcd0dc', eye: '#3a2e2a', glowA: .15 }));

// 4 · Papel recortado: borde blanco de calcomania y sombra de capa de papel
setChar('paper', withShadow(I({ lw: 1.3, line: '#fffaf0', skin: '#c98a5e', hair: '#3b2a20', blouse: '#f8eedb', emb: ['#e83f6f', '#ffbf00', '#2274a5', '#32936f'], shorts: '#32936f', shoes: '#e83f6f', bow: '#e83f6f', pack: '#f6a93b' }), 'rgba(70,40,20,.4)', 2.5, 1.5),
  withShadow(F({ lw: 1.2, line: '#fffaf0', body: '#ff9fbf', belly: '#ffd6e4', gill: '#e83f6f', gillTip: '#ffbf00', glow: null, gillLine: true }), 'rgba(70,40,20,.4)', 2.5, 1.5));

// 5 · Bosque bioluminiscente: Itzel brilla tenue; Fresita es un espiritu blanco con brillo rosa
setChar('biolum', (ctx, p, f) => { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, p.x, p.y - 9, 18, '#bfffef', .35); ctx.globalCompositeOperation = 'source-over';
  drawItzel(ctx, p, f, { glow: '#9fffe6', glowB: 5, skin: '#e8c8b4', hair: '#1f4a5a', blouse: '#e8fffb', blouse2: '#c0f0e8', emb: ['#5fffe0', '#ff9ff3', '#ffffff'], shorts: '#5fd8c0', shoes: '#ff9ff3', bow: '#ff9ff3', pack: '#4fb8a8', eye: '#0a3040', flowerCols: ['#5fffe0', '#ff9ff3', '#ffffff'] }); },
  F({ lw: 0, body: '#ffffff', belly: '#ffe6f4', gill: '#ff8fd0', gillTip: '#ffe0f6', glow: '#ff8cc6', glowA: .6, haloR: 22, shadowGlow: '#ff9fdc', eye: '#5a2a4a' }));

// 7 · Geometrico suave: plano, dos tonos, sin contorno
setChar('flat', I({ skin: '#c98a6a', hair: '#2a2347', blouse: '#f4efe6', blouse2: '#d9cdc6', emb: ['#ff6b5b', '#f4a786', '#6c4a76'], shorts: '#4a8a7a', shoes: '#ff6b5b', bow: '#ff6b5b', pack: '#f4a786', eye: '#2a2347' }),
  F({ lw: 0, body: '#ffa5bd', body2: '#e98aa6', belly: '#ffd6e0', gill: '#ff6b5b', gillTip: '#ffb38a', glowA: .25 }));

// 8 · Tinta sumi-e: linea de pincel, papel de arroz y rojo bermellon
{ const S = '#1d1b19', BENI = '#c23b2e', P = '#f0e7d2';
  setChar('sumie', I({ lw: .9, line: S, skin: P, hair: S, blouse: P, emb: [S, BENI], shorts: '#6a6660', shoes: S, bow: BENI, pack: '#8a8070', eye: S, cheek: null, flowerCols: [BENI, S] }),
    F({ lw: .8, line: S, body: P, belly: P, gill: BENI, gillTip: BENI, eye: S, glow: null, cheek: null, mouth: S })); }

// 9 · Neon synthwave: tubos de neon sobre siluetas oscuras
setChar('neon', I({ lw: .9, line: '#ff2bd6', glow: '#ff2bd6', glowB: 7, mono: '#1a0838', keep: ['bow', 'shoes', 'flowers'], bow: '#00e8ff', shoes: '#00e8ff', noFace: true, eyeGlow: '#00e8ff', flowerCols: ['#ffe74c'] }),
  F({ lw: .9, line: '#00e8ff', shadowGlow: '#00e8ff', mono: '#14062a', keep: ['gill', 'gillTip'], gill: '#ff2bd6', gillTip: '#ffe74c', eyeGlow: '#ff2bd6', glow: '#00e8ff', glowA: .2 }));

// 10 · Bruma en blanco y negro: silueta total, solo ojos que brillan
setChar('bruma', I({ mono: '#0b0b0a', noFace: true, eyeGlow: '#ffffff', twoEyes: true }),
  F({ mono: '#0b0b0a', keep: ['gillTip'], gillTip: '#b8b8b0', lw: 0, eyeGlow: '#ffffff', glow: '#ffffff', glowA: .12 }));

// 11 · Low poly: cabeza facetada, sombreado de dos caras
setChar('lowpoly', I({ poly: 6, skin: '#c88a64', hair: '#2d2a4a', blouse: '#f2ede4', blouse2: '#cfc7d8', emb: ['#f39bb0', '#ffd166', '#7fd8f0'], shorts: '#3f8a6a', shoes: '#f08a5d', bow: '#f08a5d', pack: '#ffd166', eye: '#2d2a4a' }),
  F({ poly: true, lw: 0, body: '#f39bb0', body2: '#c96a8a', belly: '#ffd0dc', gill: '#ffd166', gillTip: '#fff0b0', glowA: .25 }));

// 12 · Codice maya: linea negra firme, pigmentos, pluma de quetzal y orejeras de jade
{ const K = '#1c1612', RED = '#b0412e', OCH = '#d79a3d', MB = '#4a9eb0', JADE = '#4d8a5c', CRM = '#f1e2bd';
  setChar('codex', I({ lw: 1.2, line: K, skin: '#b8774a', hair: K, blouse: CRM, emb: [RED, JADE, MB, OCH], shorts: JADE, shoes: RED, bow: RED, pack: OCH, eye: K, cheek: null, flowerCols: [RED, OCH, MB],
    extra: (ctx, g, o, mode) => { const b = g.bob; ctx.lineWidth = .8; ctx.strokeStyle = K; ctx.beginPath(); ctx.moveTo(-2, -19.2 + b); ctx.quadraticCurveTo(-6, -26 + b, -10, -24 + b); ctx.quadraticCurveTo(-5.5, -22.5 + b, -2, -19.2 + b); ctx.fillStyle = '#3f9a5c'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(-.7, -12.1 + b, 1, 0, TAU); ctx.fillStyle = JADE; ctx.fill(); ctx.stroke(); } }),
    F({ lw: 1.1, line: K, body: '#f2a0b8', belly: CRM, gill: RED, gillTip: OCH, eye: K, glow: null, gillLine: true, mouth: K,
      extra: (ctx, o, mode) => { if (mode === 'line') return; ctx.fillStyle = JADE; for (const [x, y] of [[-3, -1.6], [-.5, -2.2], [-5.5, -.4]]) { ctx.beginPath(); ctx.arc(x, y, .7, 0, TAU); ctx.fill(); } } })); }

// 13 · Oleo impresionista
setChar('oleo', I({ lw: 1.1, line: '#14203f', skin: '#c98a5a', hair: '#2a1a14', blouse: '#f2e6c0', blouse2: '#d8c898', emb: ['#d9542b', '#e8c547', '#6c9ad8'], shorts: '#4f6f4a', shoes: '#d9542b', bow: '#d9542b', pack: '#e8c547' }),
  F({ lw: 1, line: '#14203f', body: '#f0a0b8', body2: '#d07a98', belly: '#fcd8e4', gill: '#d9542b', gillTip: '#e8c547', glowA: .2,
    extra: (ctx, o, mode) => { if (mode === 'line') return; ctx.strokeStyle = 'rgba(255,240,200,.7)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(-1, -.5, 3.6, 3.6, 5.2); ctx.stroke(); } }));

// 14 · Vitral: piezas de vidrio unidas con plomo
setChar('vitral', I({ lw: 1.3, line: '#141414', skin: '#d9a06a', hair: '#2c2a60', blouse: '#f3ead0', emb: ['#c0392b', '#2f5ea8', '#f1c40f', '#2f8a46'], shorts: '#2f8a46', shoes: '#c0392b', bow: '#c0392b', pack: '#f1c40f', eye: '#141414',
  extra: (ctx, g, o, mode) => { const b = g.bob; ctx.strokeStyle = '#141414'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(.4, -11.2 + b); ctx.lineTo(-.6, -4.3 + b); ctx.moveTo(-4, -7.6 + b); ctx.lineTo(4.2, -7 + b); ctx.stroke(); } }),
  F({ lw: 1.2, line: '#141414', body: '#ff8fb8', body2: '#e0608f', belly: '#ffd0e0', gill: '#f1c40f', gillTip: '#c0392b', glow: '#ffb0d0', glowA: .3, gillLine: true,
    extra: (ctx, o, mode) => { ctx.strokeStyle = '#141414'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(-3, -3.6); ctx.lineTo(-1.5, 3.6); ctx.moveTo(1.5, -3.6); ctx.lineTo(2.5, 3.4); ctx.stroke(); } }));

// 15 · Cuaderno a lapiz: lapices de color y pluma azul que "hierve"
setChar('cuaderno', sketchy({ lw: .6, line: '#2a4ab0', skin: '#e0a882', hair: '#4a4a55', blouse: '#ffffff', emb: ['#e05a4f', '#f2c94c', '#3f6fd8', '#5fbf5f'], shorts: '#5fbf5f', shoes: '#e05a4f', bow: '#e05a4f', pack: '#f2c94c', eye: '#2a4ab0' }),
  sketchyF({ lw: .55, line: '#2a4ab0', body: '#ff9fbf', belly: '#ffd6e4', gill: '#e05a4f', gillTip: '#ff8fb0', glow: null }));

// 17 · Grabado en linoleo: tinta, cortes de gubia y un solo rojo
{ const K = '#1f1a1c', P = '#efe5cf', RED = '#b3342b';
  setChar('grabado', I({ lw: .7, line: P, mono: K, keep: ['bow', 'shoes'], bow: RED, shoes: RED, noFace: true, eyeGlow: P,
    extra: (ctx, g, o, mode) => { const b = g.bob; ctx.strokeStyle = P; ctx.lineWidth = .45; ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(-3.6 + i * 1.6, -6 + b); ctx.lineTo(-2.8 + i * 1.6, -7.2 + b); ctx.lineTo(-2 + i * 1.6, -6 + b); } ctx.moveTo(-1.4, -18.6 + b); ctx.quadraticCurveTo(2.6, -19.6 + b, 4.6, -17 + b); ctx.moveTo(2.2, -10 + b); ctx.lineTo(2.4, -7.6 + b); ctx.stroke(); } }),
    F({ lw: .7, line: P, mono: K, keep: ['gill', 'gillTip'], gill: RED, gillTip: RED, eyeGlow: P, glow: null,
      extra: (ctx) => { ctx.strokeStyle = P; ctx.lineWidth = .45; ctx.beginPath(); ctx.moveTo(-6, .6); ctx.quadraticCurveTo(-1, 2.6, 3, 1.2); ctx.moveTo(-4, -1.6); ctx.quadraticCurveTo(-1, -2.6, 1.4, -2); ctx.stroke(); } })); }

// 23 · Cielo anime: ojos grandes con brillo
setChar('anime', I({ lw: .8, line: '#2a1e2e', skin: '#d39a74', hair: '#2a1a2e', blouse: '#ffffff', blouse2: '#dfe6f6', emb: ['#e83a4a', '#ffb000', '#3a9ad8'], shorts: '#3f9a5a', shoes: '#e83a4a', bow: '#e83a4a', pack: '#ffb000', eye: '#3a2a6a', bigEyes: true, cheek: 'rgba(255,120,140,.6)' }),
  F({ lw: .8, line: '#7a2a4a', body: '#ffb8d4', belly: '#fff0f6', gill: '#ff6fa0', gillTip: '#ffd0e4', bigEyes: true, eye: '#5a1a3a', glowA: .25 }));

// 25 · Art Nouveau: corona de flores dorada, colores empolvados
{ const NB = '#4a3426', GOLD = '#c9a24a', ROSE = '#d89a8a', SAGE = '#9fb08a';
  setChar('nouveau', I({ lw: .9, line: NB, skin: '#c99a76', hair: '#7a4a2a', blouse: '#f1e6c8', emb: [ROSE, GOLD, SAGE], shorts: '#7f9a6a', shoes: ROSE, bow: ROSE, pack: GOLD, eye: NB, flowerCols: [GOLD, ROSE, '#f6e6d0'],
    extra: (ctx, g) => { const b = g.bob; ctx.strokeStyle = GOLD; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(.6, -15 + b, 6.8, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } }),
    F({ lw: .8, line: NB, body: '#e8b0a8', belly: '#f6e6d0', gill: GOLD, gillTip: ROSE, eye: NB, glow: '#f0c8a0', glowA: .25, gillLine: true })); }

// 26 · Art Deco: oro sobre negro, diadema con pluma
{ const DG = '#d4af37', DK = '#0b0e14';
  setChar('deco', I({ lw: .7, line: DG, skin: '#b9784f', hair: DK, blouse: '#efe3c8', emb: [DG, DK], shorts: DK, shoes: DG, bow: DG, pack: DK, eye: DK, flowers: false,
    extra: (ctx, g) => { const b = g.bob; ctx.strokeStyle = DG; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(.6, -15 + b, 4.6, Math.PI * 1.1, Math.PI * 1.85); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1.6, -19 + b); ctx.quadraticCurveTo(-3, -24 + b, -1, -26 + b); ctx.quadraticCurveTo(-.5, -22 + b, -1.6, -19 + b); ctx.fillStyle = '#efe3c8'; ctx.fill(); ctx.stroke(); } }),
    F({ lw: .7, line: DG, body: '#e8a8b8', belly: '#efe3c8', gill: DG, gillTip: '#fff2c0', eye: DK, glow: '#ffd870', glowA: .25, gillLine: true })); }

// 31 · Cyberpunk lluvioso: chamarra oscura con bordado de neon, moños luminosos
{ const NP = '#ff2a6d', NC = '#05d9e8';
  setChar('cyber', (ctx, p, f) => { drawItzel(ctx, p, f, { lw: .6, line: '#4a4f70', skin: '#a86a48', hair: '#141522', blouse: '#1c1e2e', blouse2: '#2a2d44', emb: [NC, NP], shorts: '#2a2d44', shoes: NP, bow: NC, pack: '#2a2d44', eye: NC, glint: '#ffffff', flowerCols: [NC, NP],
    extra: (ctx, g) => { const b = g.bob; ctx.save(); ctx.shadowColor = NC; ctx.shadowBlur = 6 * f.S; ctx.strokeStyle = NC; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-3.6, -7 + b); ctx.lineTo(4, -7 + b); ctx.stroke(); ctx.fillStyle = NP; ctx.beginPath(); ctx.arc(-.6, -14 + b, .7, 0, TAU); ctx.fill(); ctx.restore(); } }); },
    F({ lw: .6, line: NC, alpha: .85, body: '#7ff4ff', belly: '#d0ffff', gill: NP, gillTip: '#ffd0e0', eye: '#0a2a40', glow: NC, glowA: .35, shadowGlow: NC,
      extra: (ctx, o, mode, f, t) => { ctx.fillStyle = 'rgba(10,40,60,.25)'; for (let y = -4; y < 4; y += 1.2) ctx.fillRect(-7, y + (t * 6 % 1.2), 15, .4); } })); }

// 32 · Poligonos cinematicos: rotoscopia plana, sin cara
setChar('cinema', I({ skin: '#d8a078', hair: '#2a1a1a', blouse: '#e0d8c8', blouse2: '#8a8478', emb: ['#c0502a'], shorts: '#3a5a4a', shoes: '#c0502a', bow: '#c0502a', pack: '#5a4a3a', noFace: true, flowers: false, poly: 5 }),
  F({ lw: 0, poly: true, body: '#e8a0b0', body2: '#a86a7a', belly: '#f0c8d0', gill: '#7ff0e0', gillTip: '#d8fff8', eye: '#2a1a2a', glow: '#7ff0e0', glowA: .2, cheek: null }));

// =====================================================================
//  MUNDOS NUEVOS (no son de la galería original, pero salen en las runs)
// =====================================================================
const NUEVOS = ['barro', 'eco', 'fuego', 'agua', 'hielo', 'cielo', 'hollin', 'bits8', 'bits32', 'bits64'];
const MUNDOS = FAVORITOS.concat(NUEVOS);

// Plastilina: la pose cambia a 12 cuadros por segundo, como stop-motion, pero se desplaza fluida (si no, parece que el juego se traba)
const stopMotion = (fn) => (ctx, a, f) => {
  const k = Math.floor(f.t * 12);
  if (a._smk !== k) { a._smk = k; a._sms = { vx: a.vx, vy: a.vy, on: a.on, face: a.face, run: a.run, sq: a.sq }; }
  const b = Object.assign({}, a, a._sms || {}), f2 = Object.assign({}, f, { t: k / 12 });
  ctx.save(); ctx.translate((hash1(k, 3) - .5) * .35, (hash1(k, 4) - .5) * .35); fn(ctx, b, f2); ctx.restore();
};
// se dibuja en un lienzo aparte y se le da relieve de plastilina (brillo y sombra en las orillas)
// el relieve es caro: como el stop-motion solo cambia 12 veces por segundo, se reusa el cuadro mientras no cambie
const clayChar = (fn, W, H, oy) => { const cv = mkCanvas(1, 1), cx = cv.getContext('2d', { willReadFrequently: true }); let ult = null;
  return (ctx, a, f) => { const S = f.S, w = Math.ceil(W * S), h = Math.ceil(H * S), k = Math.floor(f.t * 12); if (!(w > 0 && h > 0)) return;
    if (!ult || ult.a !== a || ult.k !== k || ult.S !== S || ult.vis !== a.vis || ult.inv !== (a.inv > 0)) {
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, w, h); cx.setTransform(S, 0, 0, S, (W / 2 - a.x) * S, (oy - a.y) * S); fn(cx, a, f);
      if (typeof relieveArcilla === 'function') relieveArcilla(cv, S, { blur: 1.1, alcance: .55, fuerza: 1.7, lum: .55, brillo: .7 });
      ult = { a, k, S, vis: a.vis, inv: a.inv > 0 };
    }
    ctx.drawImage(cv, a.x - W / 2, a.y - oy, W, H); }; };
setChar('barro', clayChar(stopMotion(I({ lw: .55, line: '#5a2a1a', skin: '#c98a5e', hair: '#3a2420', blouse: '#fbf1e2', blouse2: '#efdcc4', emb: ['#e85a4f', '#f2b233', '#4f8fd6', '#5fae6a'], shorts: '#5fae6a', shoes: '#e85a4f', bow: '#e85a4f', pack: '#f2b233',
  extra: (ctx, g) => { ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-.4, -18.4 + g.bob, 1.9, .8, -.4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(90,40,20,.18)'; ctx.beginPath(); ctx.ellipse(2.4, -6.5 + g.bob, 1.2, .7, .5, 0, TAU); ctx.fill(); } })), 34, 36, 31),
  clayChar(stopMotion(F({ lw: .5, line: '#a8396a', glowA: .1, noHalo: true, extra: (ctx) => { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(3.4, -3.2, 1.6, .7, -.3, 0, TAU); ctx.fill(); } })), 36, 28, 14));

// Diorama 2.5D: sombra proyectada sobre la cara de arriba y luz de borde
const groundShadow = (fn) => (ctx, a, f) => {
  if (a.w) { const sy = L.surfaceY(Math.floor(a.x / T), Math.max(0, Math.floor((a.y - 2) / T))) * T, d = clamp((sy - a.y) / 80, 0, 1); ctx.fillStyle = `rgba(6,20,24,${.35 * (1 - d)})`; ctx.beginPath(); ctx.ellipse(a.x + 3, sy - 3, 6 * (1 - d * .5), 1.6, 0, 0, TAU); ctx.fill(); }
  fn(ctx, a, f);
};
setChar('eco', groundShadow(I({ lw: .5, line: '#10262f', skin: '#d8a882', hair: '#1d3a40', blouse: '#f3ecdf', blouse2: '#cfe3da', emb: ['#73efd0', '#ffc980', '#cba6ff', '#e0485a'], shorts: '#3f8f6a', shoes: '#e0485a', bow: '#e0485a', pack: '#ffc980', eye: '#10262f', glint: '#c7ffed', flowerCols: ['#ffdd94', '#9affee', '#cba6ff'] })),
  F({ lw: .5, line: '#7a3a6a', glow: '#9affee', glowA: .25, gill: '#ff7fb2', gillTip: '#9affee' }));

// Pintura en amate: contorno negro grueso, colores alegres y puntitos de decoración
{ const K = '#1a0e08';
  const puntosHuipil = (ctx, g) => { const b = g.bob; ctx.fillStyle = '#e0306a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-3 + i * 1.5, -8.6 + b, .35, 0, TAU); ctx.fill(); } };
  setChar('fuego', I({ lw: 1, line: K, skin: '#c87a4a', hair: K, blouse: '#fff4e0', emb: ['#e0306a', '#ffd23a', '#2ab8b0', '#3a9a4a'], shorts: '#3a9a4a', shoes: '#e0306a', bow: '#e0306a', pack: '#ffd23a', eye: K, cheek: 'rgba(224,48,106,.5)', flowerCols: ['#ffd23a', '#2ab8b0', '#e0306a'], extra: puntosHuipil }),
    F({ lw: 1, line: K, body: '#ff7aa8', belly: '#ffd23a', gill: '#2ab8b0', gillTip: '#ffd23a', eye: K, glow: null, gillLine: true, cheek: null,
      extra: (ctx, o, mode) => { if (mode === 'line') return; ctx.fillStyle = '#fff4e0'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-5 + i * 1.6, -1.6 + (i % 2) * .6, .4, 0, TAU); ctx.fill(); } } })); }

// Cianotipia: todo blanco (lo que tapó la luz) con trazo azul de Prusia
setChar('agua', I({ mono: '#eef5fb', keep: ['eye'], eye: '#0d2c55', lw: .55, line: '#0d2c55', cheek: null }),
  F({ mono: '#eef5fb', keep: ['eye'], eye: '#0d2c55', lw: .5, line: '#0d2c55', glow: '#cfe3f6', glowA: .18 }));

// Origami: cabeza facetada y bufanda roja de papel (está nevando)
setChar('hielo', I({ poly: 5, lw: .35, line: '#8a94b0', skin: '#f0c9a8', hair: '#3a3a5a', blouse: '#ffffff', blouse2: '#e3e8f0', emb: ['#d9443a', '#f2b233', '#4f7fb8'], shorts: '#4f9a7a', shoes: '#d9443a', bow: '#d9443a', pack: '#f2b233', eye: '#3a3a5a',
  extra: (ctx, g) => { const b = g.bob; ctx.fillStyle = '#d9443a'; ctx.beginPath(); ctx.moveTo(-3.6, -11.6 + b); ctx.lineTo(3.8, -11.4 + b); ctx.lineTo(3.4, -9.8 + b); ctx.lineTo(-3.4, -10 + b); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b8302a'; ctx.beginPath(); ctx.moveTo(-3, -10.4 + b); ctx.lineTo(-6.4 + Math.sin(p_t(g)) * .6, -7.4 + b); ctx.lineTo(-4.2, -7 + b); ctx.lineTo(-1.6, -10 + b); ctx.closePath(); ctx.fill(); } }),
  F({ poly: true, lw: .35, line: '#b06080', body: '#ffd1e3', body2: '#f2b0cc', belly: '#fff0f6', gill: '#ff7fb2', gillTip: '#ffffff', glowA: .15 }));
function p_t(g) { return g.run * 3 + g.bob; }

// Carta celeste: figura grabada en oro sobre azul noche, con estrellas en las articulaciones
setChar('cielo', (ctx, p, f) => {
  ctx.save(); ctx.globalAlpha = .9; drawItzel(ctx, p, f, { _mode: 'fill', mono: '#14224a', noFace: true }); ctx.restore();
  const g = drawItzel(ctx, p, f, { _mode: 'line', lw: .5, line: '#e2c06e' });
  const X = (lx, ly) => [p.x + lx * p.face * g.sx, p.y + ly * g.sy];
  for (const [lx, ly] of [[.6, -15 + g.bob], [g.arm[2], g.arm[3]], [g.l1[2], g.l1[3]], [g.l2[2], g.l2[3]]]) { const [x, y] = X(lx, ly); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, y, .8 + Math.sin(f.t * 5 + lx) * .2, 0, TAU); ctx.fill(); }
}, (ctx, fr, f) => {
  ctx.save(); ctx.globalAlpha = .9; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#14224a', noHalo: true }); ctx.restore();
  drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .5, line: '#e2c06e', glow: '#fff3c4', glowA: .2 });
  ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(fr.x + fr.face * 6, fr.y - 1.4, .9, 0, TAU); ctx.fill();
});

// Siluetas de ceniza: negro total, solo los moños rojos y los ojos
setChar('hollin', I({ mono: '#08080a', keep: ['bow'], bow: '#c8202a', noFace: true, eyeGlow: '#ffffff' }),
  F({ mono: '#08080a', eyeGlow: '#ff4f95', glow: '#ff4f95', glowA: .14, lw: 0 }));

// Pixel 8 bits: los sprites de 16 bits pasados a la paleta de la NES
if (typeof pixelSprite === 'function') {
  const NESPAL = ['#000000', '#fcfcfc', '#f83800', '#fcd8a8', '#c84c0c', '#00a800', '#b8f818', '#0078f8', '#f878f8', '#fc9838', '#503000', '#a4e4fc', '#f8b800'];
  setChar('bits8', pixelSprite((ctx, p, f) => pixelItzel(ctx, p, f.t), { w: 26, h: 26, oy: 22, palette: NESPAL }),
    pixelSprite((ctx, fr, f) => pixelFresita(ctx, fr.x, fr.y, fr.face, f.t), { w: 30, h: 20, oy: 10, palette: NESPAL }));
  // Pixel 32 bits: luz de luna (tonos fríos) y contorno morado oscuro
  setChar('bits32', pixelSprite(I({ skin: '#b9845e', hair: '#1c1626', blouse: '#e8e2f0', blouse2: '#b8b0cc', emb: ['#d84a5a', '#ffd04a', '#5a8ad8', '#5ab86a'], shorts: '#3a7a5a', shoes: '#d84a5a', bow: '#e0304a', pack: '#c8902a', eye: '#1c1626', glint: '#ffffff' }), { w: 30, h: 32, oy: 27, levels: 9, outline: '#0b0a1f' }),
    pixelSprite(F({ lw: 0, glowA: .2, glow: '#ff8cc6' }), { w: 30, h: 22, oy: 11, levels: 9, outline: '#2a0f2a' }));
  // Pixel 64 bits: colores completos, contorno café cálido como en el pixel art moderno
  setChar('bits64', pixelSprite(I({ glint: '#ffffff' }), { w: 30, h: 32, oy: 27, levels: 16, outline: '#1a1008' }),
    pixelSprite(F({ lw: 0, glowA: .25 }), { w: 30, h: 22, oy: 11, levels: 16, outline: '#4a1030' }));
}

// Vapor y engranajes (el mundo que era CGA): el mismo diseño de Itzel con colores de taller
// y unos goggles de latón en la frente; Fresita con branquias de cobre
setChar('vapor', I({ lw: .7, line: '#2a1810', skin: '#c8865a', hair: '#2a1810', blouse: '#f0e2c4', blouse2: '#d8c8a0', emb: ['#c8203a', '#c8902a', '#2a6a5a'], shorts: '#4a5a3a', shoes: '#c8203a', bow: '#c8203a', pack: '#8a5a2a', eye: '#2a1810', cheek: 'rgba(200,80,60,.35)',
  extra: (ctx, g) => { const hy = -15 + g.bob; ctx.strokeStyle = '#3a2414'; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(.6, hy, 4.9, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    for (const gx of [-.4, 2.8]) { ctx.fillStyle = '#c8902a'; ctx.beginPath(); ctx.arc(gx, hy - 4, 1.55, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = .4; ctx.stroke(); ctx.fillStyle = '#9ad8e8'; ctx.beginPath(); ctx.arc(gx, hy - 4, .95, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(gx - .5, hy - 4.6, .45, .45); } } }),
  F({ lw: .7, line: '#2a1810', body: '#f0a0b0', belly: '#f8d8c8', gill: '#c8743a', gillTip: '#f2c94c', eye: '#2a1810', glow: '#ffb060', glowA: .2, gillLine: true }));
