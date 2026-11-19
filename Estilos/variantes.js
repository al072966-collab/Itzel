'use strict';
// =====================================================================
//  VARIANTES de Itzel y Fresita para elegir, por estilo.
//  Se ven en disenos.html?estilo=biolum (o cuaderno, deco, cinema).
// =====================================================================
const VARIANTES = {};
// todo va encerrado para no chocar con nombres del juego; solo salen VARIANTES y unas ayudas
(function () {
const TAU2 = Math.PI * 2;
const add = (ctx, fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); };
const ax = (o) => (ctx, fr, f) => drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, o);
// coordenadas locales de Itzel -> mundo (para pintar luces encima)
const X = (p, g, lx, ly) => [p.x + lx * p.face * g.sx, p.y + ly * g.sy];

VARIANTES.biolum = [
  { nombre: 'Bordado que brilla', nota: 'Itzel es silueta azul noche y solo brillan el bordado del huipil, los moños, la corona y las suelas. Fresita es una medusa transparente con contorno rosa.',
    itzel: (ctx, p, f) => drawItzel(ctx, p, f, { mono: '#0b2233', keep: ['bow', 'flowers', 'shoes'], bow: '#ff7fe0', shoes: '#5fffe0', flowerCols: ['#5fffe0', '#ff9ff3', '#fffbe0'], noFace: true, eyeGlow: '#bfffef',
      extra: (c, g) => { const b = g.bob; c.save(); c.shadowColor = '#5fffe0'; c.shadowBlur = 5 * f.S; c.fillStyle = '#9fffe8'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-2.9 + i * 1.15, -10.5 + b, .45, 0, TAU2); c.fill(); } c.fillStyle = '#ff9ff3'; for (let i = 0; i < 8; i++) { const x = -4.4 + i * 1.25; c.beginPath(); c.moveTo(x, -4.6 + b); c.lineTo(x + .62, -5.9 + b); c.lineTo(x + 1.24, -4.6 + b); c.fill(); } c.fillStyle = '#5fffe0'; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU2 + .4; c.beginPath(); c.arc(1.1 + Math.cos(a) * .75, -7.9 + b + Math.sin(a) * .75, .45, 0, TAU2); c.fill(); } c.restore(); } }),
    fresita: ax({ lw: .7, line: '#ff9ff3', body: 'rgba(255,160,230,.16)', belly: 'rgba(255,220,240,.18)', gill: '#ff7fe0', gillTip: '#ffffff', glow: '#ff8cc6', glowA: .3, shadowGlow: '#ff7fe0', eye: '#ffffff', cheek: null }) },

  { nombre: 'Frasco de luciérnagas', nota: 'Itzel con sus colores de siempre, oscurecidos por la noche, y un frasco de luciérnagas que le ilumina la cara desde abajo. Fresita es oscura y la punta de su cola es una luciérnaga.',
    itzel: (ctx, p, f) => { const g = drawItzel(ctx, p, f, { skin: '#8a6058', hair: '#141a24', blouse: '#9fb0b4', blouse2: '#7f9094', emb: ['#a8405a', '#b8902a', '#3a6a9a'], shorts: '#2a5a3a', shoes: '#8a2a3a', bow: '#a8203a', pack: '#7a5a2a', eye: '#0a0a12', cheek: null, flowerCols: ['#a8405a', '#c8a040', '#ffffff'] });
      const [jx, jy] = X(p, g, g.arm[2] + .6, g.arm[3] + 2.4), fl = .8 + Math.sin(f.t * 9) * .2;
      add(ctx, () => { glowDot(ctx, jx, jy, 26, '#d8ff6a', .28 * fl); glowDot(ctx, jx, jy, 8, '#f0ff9a', .7 * fl); });
      ctx.strokeStyle = 'rgba(220,255,200,.8)'; ctx.lineWidth = .5; ctx.strokeRect(jx - 1.6, jy - 2, 3.2, 4); ctx.fillStyle = '#5a4a2a'; ctx.fillRect(jx - 1.8, jy - 2.6, 3.6, .8);
      ctx.fillStyle = '#f8ffb0'; for (let k = 0; k < 3; k++) ctx.fillRect(jx - 1 + Math.sin(f.t * 3 + k * 2) * .8, jy - 1 + Math.cos(f.t * 4 + k) * 1.2, .5, .5); },
    fresita: ax({ lw: .5, line: '#0a1a20', body: '#2a3a48', belly: '#3a4a5a', gill: '#c8ff6a', gillTip: '#f0ffa0', glow: '#c8ff6a', glowA: .12, eye: '#f0ffa0', cheek: null,
      extra: (c, o, m, f, t) => { const tx = -14, ty = Math.sin(t * 8 - 6) * 2 - .8; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, tx, ty, 9, '#d8ff6a', .7 + Math.sin(t * 7) * .2); c.restore(); c.fillStyle = '#f8ffb0'; c.beginPath(); c.arc(tx, ty, 1.3, 0, TAU2); c.fill(); } }) },

  { nombre: 'Cristal de cenote', nota: 'Las dos son de vidrio de agua: relleno transparente y contorno de luz. Se ve el bosque a través de ellas.',
    itzel: (ctx, p, f) => { ctx.save(); ctx.globalAlpha = .28; drawItzel(ctx, p, f, { _mode: 'fill', mono: '#5fffe0', noFace: true }); ctx.restore(); ctx.save(); ctx.shadowColor = '#5fffe0'; ctx.shadowBlur = 5 * f.S; drawItzel(ctx, p, f, { _mode: 'line', lw: .55, line: '#c8fff4' }); ctx.restore(); },
    fresita: (ctx, fr, f) => { ctx.save(); ctx.globalAlpha = .3; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#ff9ff3', noHalo: true }); ctx.restore(); ctx.save(); ctx.shadowColor = '#ff7fe0'; ctx.shadowBlur = 5 * f.S; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .55, line: '#ffe0f8', glow: '#ff8cc6', glowA: .2 }); ctx.restore(); } },

  { nombre: 'Luz negra', nota: 'Como un póster bajo luz ultravioleta: todo morado oscuro y las líneas en verde limón, magenta y naranja fosforescentes.',
    itzel: (ctx, p, f) => { drawItzel(ctx, p, f, { mono: '#1a0a2e', keep: ['bow', 'shoes', 'flowers'], bow: '#ff3fd4', shoes: '#ff8a00', flowerCols: ['#d4ff3a', '#ff3fd4', '#ff8a00'], noFace: true, eyeGlow: '#d4ff3a' }); ctx.save(); ctx.shadowColor = '#d4ff3a'; ctx.shadowBlur = 4 * f.S; drawItzel(ctx, p, f, { _mode: 'line', lw: .5, line: '#d4ff3a' }); ctx.restore(); },
    fresita: (ctx, fr, f) => { drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { mono: '#1a0a2e', keep: ['gill', 'gillTip'], gill: '#ff3fd4', gillTip: '#ff8a00', eyeGlow: '#d4ff3a', glow: '#ff3fd4', glowA: .25 }); ctx.save(); ctx.shadowColor = '#ff3fd4'; ctx.shadowBlur = 4 * f.S; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .5, line: '#ff3fd4', noHalo: true }); ctx.restore(); } },

  { nombre: 'Hongos y musgo', nota: 'Itzel con ropa de musgo y una corona de hongos que brillan. Fresita es un ajolote de río oscuro con puntos de luz en los costados, como los peces de lo profundo.',
    itzel: (ctx, p, f) => drawItzel(ctx, p, f, { skin: '#c8a090', hair: '#183028', blouse: '#cfe8d8', blouse2: '#a8ccbc', emb: ['#5fffe0', '#ff9ff3'], shorts: '#2f6a50', shoes: '#5fffe0', bow: '#ff9ff3', pack: '#4a6a3a', eye: '#08201a', flowers: false, cheek: 'rgba(255,143,200,.4)',
      extra: (c, g) => { const hy = -15 + g.bob; c.save(); c.shadowColor = '#5fffe0'; c.shadowBlur = 6 * f.S; [[-2, -4.4, 1.6], [.8, -5.2, 2], [3.3, -4.2, 1.4]].forEach(([x, y, r], i) => { c.fillStyle = '#e8fff8'; c.fillRect(x - .25, hy + y, .5, 1.6); c.fillStyle = i === 1 ? '#ff9ff3' : '#7fffe0'; c.beginPath(); c.ellipse(x, hy + y, r, r * .6, 0, Math.PI, 0); c.fill(); }); c.restore(); } }),
    fresita: ax({ lw: .5, line: '#0a2028', body: '#2a5060', belly: '#3a6878', gill: '#ff9ff3', gillTip: '#ffe0f6', glow: '#5fffe0', glowA: .12, eye: '#e8fff8', cheek: null,
      extra: (c, o, m, f, t) => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) glowDot(c, -6 + i * 1.8, 1.6, 2.4, '#5fffe0', .6 + Math.sin(t * 4 + i) * .3); c.restore(); c.fillStyle = '#c8fff4'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-6 + i * 1.8, 1.6, .4, 0, TAU2); c.fill(); } } }) },

  { nombre: 'Esporas', nota: 'Las dos dibujadas solo con puntitos de luz sobre una sombra, como esporas que flotan en el bosque.',
    itzel: (ctx, p, f) => { drawItzel(ctx, p, f, { _mode: 'fill', mono: '#06202a', noFace: true }); ctx.save(); ctx.setLineDash([.25, .9]); ctx.lineCap = 'round'; ctx.shadowColor = '#7fffe0'; ctx.shadowBlur = 3 * f.S; drawItzel(ctx, p, f, { _mode: 'line', lw: .7, line: '#bfffef' }); ctx.restore(); },
    fresita: (ctx, fr, f) => { drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#200a20', noHalo: true }); ctx.save(); ctx.setLineDash([.25, .8]); ctx.lineCap = 'round'; ctx.shadowColor = '#ff8cc6'; ctx.shadowBlur = 3 * f.S; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .7, line: '#ffd0f0', noHalo: true }); ctx.restore(); } },

  { nombre: 'Luna fría', nota: 'La más natural: los colores de siempre bajo la luna (más azules) y un filo de luz turquesa en la espalda. Fresita rosa pastel con el mismo filo.',
    itzel: (ctx, p, f) => { const o = { skin: '#b89a98', hair: '#1a2a3a', blouse: '#d4e4ee', blouse2: '#a8bccc', emb: ['#d04a6a', '#c8a050', '#4a7ab8', '#4a9a6a'], shorts: '#3a6a5a', shoes: '#c04a6a', bow: '#d04a7a', pack: '#a8804a', eye: '#101824', cheek: 'rgba(208,74,122,.3)' };
      ctx.save(); ctx.translate(-p.face * .6, -.3); ctx.shadowColor = '#5fffe0'; ctx.shadowBlur = 3 * f.S; drawItzel(ctx, p, f, { ...o, _mode: 'fill', mono: '#7fffe0', noFace: true }); ctx.restore(); drawItzel(ctx, p, f, o); },
    fresita: (ctx, fr, f) => { ctx.save(); ctx.translate(-fr.face * .6, -.4); drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#7fffe0', noHalo: true }); ctx.restore(); drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { body: '#f0c8dc', belly: '#fbe8f2', gill: '#e070a8', gillTip: '#f8b0d8', line: '#8a4a6a', lw: .5, glow: '#7fffe0', glowA: .12 }); } },

  { nombre: 'Espíritu del cenote', nota: 'Itzel y Fresita como espíritus de luz: blancas, con brillo turquesa y rosa, dejando chispas al moverse.',
    itzel: (ctx, p, f) => { if (Math.abs(p.vx) > 10 || !p.on) add(ctx, () => { for (let k = 1; k <= 5; k++) glowDot(ctx, p.x - p.face * k * 3.2, p.y - 8 + Math.sin(f.t * 9 + k) * 1.5, 3.5 - k * .4, '#7fffe0', .4 - k * .06); });
      add(ctx, () => glowDot(ctx, p.x, p.y - 9, 20, '#5fffe0', .35)); ctx.save(); ctx.shadowColor = '#5fffe0'; ctx.shadowBlur = 8 * f.S; drawItzel(ctx, p, f, { mono: '#effffb', keep: ['bow'], bow: '#ff9ff3', noFace: true, eyeGlow: '#3a8a9a', twoEyes: true }); ctx.restore(); },
    fresita: ax({ mono: '#fff4fb', keep: ['gill', 'gillTip'], gill: '#ff9ff3', gillTip: '#ffffff', eyeGlow: '#c0508a', glow: '#ff8cc6', glowA: .55, haloR: 24, shadowGlow: '#ff9fdc' }) },

  { nombre: 'Señuelo abisal', nota: 'Fresita con una lucecita colgando de la cabeza, como el pez linterna, para alumbrarle el camino a Itzel. Itzel en tonos de noche, con la corona y los tenis encendidos.',
    itzel: (ctx, p, f) => drawItzel(ctx, p, f, { skin: '#7a5a5e', hair: '#0e141e', blouse: '#5a6a7a', blouse2: '#4a5868', emb: ['#ff9ff3', '#5fffe0'], shorts: '#1f3a3a', shoes: '#5fffe0', bow: '#ff7fe0', pack: '#3a3a4a', eye: '#f0fffb', glint: '#ffffff', cheek: null, flowerCols: ['#ffe066', '#ff9ff3', '#7fffe0'],
      extra: (c, g) => { const hy = -15 + g.bob; c.save(); c.globalCompositeOperation = 'lighter'; [[-1.8, -4.1], [.6, -4.9], [3, -4.3]].forEach(([x, y]) => glowDot(c, x, hy + y, 3, '#ffe066', .6)); [g.l1, g.l2].forEach(l => glowDot(c, l[2] + .8, l[3] - .9, 3, '#5fffe0', .6)); c.restore(); } }),
    fresita: ax({ lw: .5, line: '#2a0f2a', body: '#4a2a5a', belly: '#6a3a6a', gill: '#ff7fe0', gillTip: '#ffc0f0', glow: '#ff8cc6', glowA: .08, eye: '#ffe0f6', cheek: null,
      extra: (c, o, m, f, t) => { const sx = 6, sy = -4, ex = 13 + Math.sin(t * 2) * 1.2, ey = -2 + Math.cos(t * 2.4) * 1.5; c.strokeStyle = '#6a3a7a'; c.lineWidth = .6; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(10, -10, ex, ey); c.stroke(); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, ex, ey, 14, '#fff0a0', .55); c.restore(); c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(ex, ey, 1.4, 0, TAU2); c.fill(); } }) },

  { nombre: 'Plancton arcoíris', nota: 'Como las medusas peine: los bordes y el bordado cambian de color en arcoíris mientras se mueven. Fresita transparente con branquias de todos los colores.',
    itzel: (ctx, p, f) => { const h = (f.t * 70) % 360, col = k => `hsl(${(h + k * 60) % 360},100%,72%)`;
      drawItzel(ctx, p, f, { skin: '#e0c0b0', hair: '#22283a', blouse: '#f2fbff', blouse2: '#d8eef6', emb: [0, 1, 2, 3, 4].map(col), shorts: '#4a8a8a', shoes: col(5), bow: col(0), pack: '#6a7a9a', eye: '#141824', flowerCols: [col(1), col(3), col(5)] });
      ctx.save(); ctx.globalAlpha = .8; ctx.shadowColor = col(2); ctx.shadowBlur = 4 * f.S; drawItzel(ctx, p, f, { _mode: 'line', lw: .45, line: col(2) }); ctx.restore(); },
    fresita: (ctx, fr, f) => { const h = (f.t * 70 + 180) % 360; drawAxolotl(ctx, fr.x, fr.y, fr.face, f.t, f, { lw: .6, line: `hsl(${h},100%,75%)`, body: 'rgba(255,230,245,.35)', belly: 'rgba(255,255,255,.3)', gill: `hsl(${(h + 120) % 360},100%,70%)`, gillTip: `hsl(${(h + 240) % 360},100%,80%)`, glow: `hsl(${h},100%,70%)`, glowA: .3, shadowGlow: `hsl(${h},100%,70%)`, eye: '#2a1030', cheek: null }); } },
];


// ---------- ayudas ----------
// rayado de lápiz o crayón como relleno (patrón en unidades del mundo)
const PAT = new Map();
function rayado(f, col, sep = 1.6, ang = -.8, lw = .45, cruz = false) {
  const key = [col, sep, ang, lw, cruz, f.S].join('|'); if (PAT.has(key)) return PAT.get(key);
  const S = f.S, n = Math.max(2, Math.round(8 * S)), c = mkCanvas(n, n), x = c.getContext('2d');
  x.scale(S, S); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round';
  const dirs = cruz ? [ang, ang + Math.PI / 2] : [ang];
  for (const a of dirs) { x.save(); x.translate(4, 4); x.rotate(a); for (let k = -12; k <= 12; k += sep) { x.beginPath(); x.moveTo(-12, k); x.lineTo(12, k); x.stroke(); } x.restore(); }
  const p = x.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix([1 / S, 0, 0, 1 / S, 0, 0])); PAT.set(key, p); return p;
}
const ORIG = {};
for (const id of ['biolum', 'cuaderno', 'deco', 'cinema']) ORIG[id] = { itzel: STYLE_MAP[id].player, fresita: STYLE_MAP[id].fresita };
const actual = (id, nota) => ({ nombre: 'El de ahora', nota, itzel: (c, p, f) => ORIG[id].itzel(c, p, f), fresita: (c, fr, f) => ORIG[id].fresita(c, fr, f) });
// dibuja dos veces: relleno y luego línea
const dos = (fill, line) => (c, a, f) => { fill(c, a, f); line(c, a, f); };
// solo la línea temblorosa de lápiz (sin relleno)
const sketchLine = (o) => (c, p, f) => { const s = Math.floor(f.t * 8); for (let k = 0; k < 2; k++) { c.save(); c.translate((hash1(s, k) - .5) * .7, (hash1(s, k + 5) - .5) * .7); drawItzel(c, p, f, { ...o, _mode: 'line' }); c.restore(); } };
const sketchLineF = (o) => (c, fr, f) => { const s = Math.floor(f.t * 8); for (let k = 0; k < 2; k++) { c.save(); c.translate((hash1(s, k + 9) - .5) * .7, (hash1(s, k + 15) - .5) * .7); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...o, _mode: 'line', noHalo: true }); c.restore(); } };

// =====================================================================
//  CUADERNO A LÁPIZ
// =====================================================================
{
  const INK = '#2a4ab0', RED = '#d8302a';
  const base = { skin: '#e0a882', hair: '#4a4a55', blouse: '#ffffff', emb: ['#e05a4f', '#f2c94c', '#3f6fd8', '#5fbf5f'], shorts: '#5fbf5f', shoes: '#e05a4f', bow: '#e05a4f', pack: '#f2c94c', eye: INK };
  const fBase = { body: '#ff9fbf', belly: '#ffd6e4', gill: '#e05a4f', gillTip: '#ff8fb0', glow: null };
  VARIANTES.cuaderno = [
    actual('cuaderno', 'Colores de madera con pluma azul que “hierve” cuadro a cuadro.'),
    { nombre: 'Grafito', nota: 'Solo lápiz de grafito: grises, rayado de sombra y el único color es el moño rojo.',
      itzel: sketchy({ lw: .55, line: '#3a3a42', skin: '#e8e4dc', hair: '#5a5a62', blouse: '#f6f4ee', emb: ['#8a8a92'], shorts: '#b0b0b8', shoes: '#7a7a82', bow: RED, pack: '#c0c0c8', eye: '#2a2a32', cheek: null, flowerCols: ['#9a9aa2'] }),
      fresita: sketchyF({ lw: .5, line: '#3a3a42', body: '#e0e0e6', belly: '#f6f6fa', gill: '#8a8a92', gillTip: '#b8b8c0', glow: null, cheek: null }) },
    { nombre: 'Crayolas', nota: 'Rellenos rayados con crayola encerada que se salen tantito de la línea.',
      itzel: (c, p, f) => sketchy({ lw: .8, line: '#3a2a2a', skin: '#f0b890', hair: rayado(f, '#3a2a2a', 1, -.8, .7), blouse: rayado(f, '#ffb0c8', 1.3, -.7, .6), emb: ['#e83a3a', '#2a8aff', '#ffcc00'], shorts: rayado(f, '#2ab84a', 1, -.9, .7), shoes: '#e83a3a', bow: '#e83a3a', pack: '#ffcc00', eye: '#2a1a1a' })(c, p, f),
      fresita: (c, fr, f) => sketchyF({ lw: .8, line: '#3a2a2a', body: rayado(f, '#ff6fa8', 1.1, -.7, .7), belly: '#ffd6e4', gill: '#e83a3a', gillTip: '#ffcc00', glow: null })(c, fr, f) },
    { nombre: 'Marcatextos', nota: 'Rellenos de marcatextos fosforescentes, transparentes y encimados, con línea de pluma azul.',
      itzel: dos((c, p, f) => { c.save(); c.globalAlpha = .7; drawItzel(c, p, f, { _mode: 'fill', skin: '#ffc89a', hair: '#ff4fb0', blouse: '#fff36a', blouse2: '#fff36a', emb: ['#ff4fb0', '#4fffa0'], shorts: '#4fffa0', shoes: '#ff4fb0', bow: '#ff4fb0', pack: '#ffb14f', eye: INK }); c.restore(); }, sketchLine({ lw: .55, line: INK })),
      fresita: dos((c, fr, f) => { c.save(); c.globalAlpha = .7; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', body: '#ff4fb0', belly: '#fff36a', gill: '#4fffa0', gillTip: '#fff36a', noHalo: true }); c.restore(); }, sketchLineF({ lw: .55, line: INK })) },
    { nombre: 'Pluma roja de la maestra', nota: 'Dibujadas con la pluma roja de calificar, solo línea, con su palomita y todo.',
      itzel: (c, p, f) => { sketchLine({ lw: .6, line: RED })(c, p, f); const s = Math.floor(f.t * 2) % 4; if (s < 3) { c.strokeStyle = RED; c.lineWidth = .7; c.beginPath(); c.moveTo(p.x + 8, p.y - 24); c.lineTo(p.x + 10, p.y - 21.5); c.lineTo(p.x + 14, p.y - 28); c.stroke(); } },
      fresita: sketchLineF({ lw: .6, line: RED }) },
    { nombre: 'Estampa recortada', nota: 'Recortadas del cuaderno con borde blanco y pegadas con un pedazo de cinta.',
      itzel: (c, p, f) => { c.save(); c.shadowColor = 'rgba(40,40,60,.35)'; c.shadowBlur = 2 * f.S; c.shadowOffsetY = 1 * f.S; drawItzel(c, p, f, { mono: '#ffffff', lw: 2.2, line: '#ffffff', noFace: true }); c.restore(); sketchy({ ...base, lw: .55, line: INK })(c, p, f); c.fillStyle = 'rgba(240,230,190,.7)'; c.save(); c.translate(p.x - 2, p.y - 21); c.rotate(-.3); c.fillRect(-4, -1.5, 8, 3); c.restore(); },
      fresita: (c, fr, f) => { c.save(); c.shadowColor = 'rgba(40,40,60,.35)'; c.shadowBlur = 2 * f.S; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: '#ffffff', lw: 2.2, line: '#ffffff', noHalo: true }); c.restore(); sketchyF({ ...fBase, lw: .55, line: INK })(c, fr, f); } },
    { nombre: 'Plumón negro', nota: 'Contorno grueso de plumón permanente y colores planos de marcador.',
      itzel: I({ ...base, lw: 1.1, line: '#141414', blouse2: '#e8e8f0', hair: '#2a2a30', shorts: '#3fbf5f', eye: '#141414', glint: '#ffffff' }),
      fresita: F({ ...fBase, lw: 1, line: '#141414', gillLine: true, eye: '#141414' }) },
    { nombre: 'Lápiz acuarelable', nota: 'Rayones de color que se corrieron con agua: el relleno se difumina fuera de la línea.',
      itzel: dos((c, p, f) => { c.save(); c.globalAlpha = .6; c.filter = `blur(${1.1 * f.S}px)`; drawItzel(c, p, f, { ...base, _mode: 'fill', blouse: '#dfe8ff' }); c.restore(); }, sketchLine({ lw: .5, line: '#5a5a72' })),
      fresita: dos((c, fr, f) => { c.save(); c.globalAlpha = .6; c.filter = `blur(${1.1 * f.S}px)`; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...fBase, _mode: 'fill', noHalo: true }); c.restore(); }, sketchLineF({ lw: .5, line: '#5a5a72' })) },
    { nombre: 'Plumas de gel', nota: 'Colores pastel de plumas de gel con brillitos de diamantina.',
      itzel: (c, p, f) => { sketchy({ lw: .5, line: '#8a5ad8', skin: '#f6d0b8', hair: '#6a4a9a', blouse: '#fbf6ff', emb: ['#ff8fd8', '#7fd8ff', '#ffd86f', '#9fffb0'], shorts: '#9fe8c8', shoes: '#ff8fd8', bow: '#ff8fd8', pack: '#ffd86f', eye: '#5a3a8a' })(c, p, f); for (let k = 0; k < 6; k++) { const a = hash1(k, Math.floor(f.t * 4)); c.fillStyle = ['#ffffff', '#ffd86f', '#7fd8ff'][k % 3]; c.fillRect(p.x - 6 + a * 12, p.y - 20 + hash1(k + 9, Math.floor(f.t * 4)) * 20, .7, .7); } },
      fresita: sketchyF({ lw: .5, line: '#8a5ad8', body: '#ffc0e8', belly: '#fff0fa', gill: '#c08aff', gillTip: '#7fd8ff', glow: null }) },
    { nombre: 'Tramado a pluma', nota: 'Todo sombreado con rayitas cruzadas de pluma azul, como ilustración de libro viejo; sin colores.',
      itzel: (c, p, f) => { drawItzel(c, p, f, { mono: rayado(f, INK, 1.1, -.8, .35, true), keep: ['eye'], eye: INK, lw: .55, line: INK }); },
      fresita: (c, fr, f) => drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: rayado(f, INK, 1.1, -.8, .35, true), keep: ['eye'], eye: INK, lw: .55, line: INK, noHalo: true }) },
  ];
}

// =====================================================================
//  ART DÉCO
// =====================================================================
{
  const GD = '#d4af37', DK = '#0b0e14', CR = '#efe3c8';
  const tiara = (col, fill) => (ctx, g) => { const b = g.bob; ctx.strokeStyle = col; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(.6, -15 + b, 4.6, Math.PI * 1.1, Math.PI * 1.85); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1.6, -19 + b); ctx.quadraticCurveTo(-3, -24 + b, -1, -26 + b); ctx.quadraticCurveTo(-.5, -22 + b, -1.6, -19 + b); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
  const rayos = (c, x, y, r, col) => { c.save(); c.strokeStyle = col; c.lineWidth = .5; c.beginPath(); for (let i = 0; i < 16; i++) { const a = Math.PI + i / 15 * Math.PI, l = i % 2 ? r : r * 1.35; c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); } c.stroke(); c.restore(); };
  const esmalte = { lw: .9, line: GD, skin: '#c98a5e', hair: '#1a2a4a', blouse: CR, blouse2: '#e0d0b0', emb: ['#2a8a7a', '#c8503a', '#1a3a6a'], shorts: '#2a8a7a', shoes: '#c8503a', bow: '#c8503a', pack: '#1a3a6a', eye: DK, flowers: false };
  const tall = fn => (c, p, f) => { c.save(); c.translate(p.x, p.y); c.scale(.9, 1.13); c.translate(-p.x, -p.y); fn(c, p, f); c.restore(); };
  VARIANTES.deco = [
    actual('deco', 'Contorno dorado y diadema con pluma de los años 20.'),
    { nombre: 'Silueta con filo de oro', nota: 'Como un cartel: las dos en negro y solo el contorno en oro.',
      itzel: (c, p, f) => { drawItzel(c, p, f, { mono: DK, noFace: true, flowers: false, extra: tiara(GD, DK) }); drawItzel(c, p, f, { _mode: 'line', lw: .6, line: GD, flowers: false }); },
      fresita: (c, fr, f) => { drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: DK, eyeGlow: GD, noHalo: true }); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .6, line: GD }); } },
    { nombre: 'Esmalte', nota: 'Joyería esmaltada: jade, coral y azul marino separados por filetes de oro grueso.',
      itzel: I({ ...esmalte, extra: tiara(GD, CR) }), fresita: F({ lw: .9, line: GD, body: '#e86a7a', belly: CR, gill: '#2a8a7a', gillTip: GD, eye: DK, glow: null, gillLine: true }) },
    { nombre: 'Marfil y ébano', nota: 'Solo dos colores, marfil y negro, con cortes limpios.',
      itzel: I({ lw: .5, line: DK, skin: CR, hair: DK, blouse: CR, emb: [DK], shorts: DK, shoes: DK, bow: DK, pack: DK, eye: DK, cheek: null, flowers: false, extra: tiara(DK, CR) }),
      fresita: F({ lw: .5, line: DK, body: CR, belly: '#ffffff', gill: DK, gillTip: CR, eye: DK, glow: null, cheek: null }) },
    { nombre: 'Sol déco', nota: 'Detrás de cada una se abre un sol de rayos dorados, el motivo más déco que hay.',
      itzel: (c, p, f) => { rayos(c, p.x + p.face * .6, p.y - 15, 13, rgba(GD, .8)); I({ ...esmalte, extra: tiara(GD, CR) })(c, p, f); },
      fresita: (c, fr, f) => { rayos(c, fr.x, fr.y + 2, 11, rgba(GD, .7)); F({ lw: .7, line: GD, body: '#e8a8b8', belly: CR, gill: GD, gillTip: '#fff2c0', eye: DK, glow: null, gillLine: true })(c, fr, f); } },
    { nombre: 'Platino y zafiro', nota: 'Plata en lugar de oro, con zafiros: más frío y elegante.',
      itzel: I({ lw: .7, line: '#c8ccd4', skin: '#b9784f', hair: DK, blouse: '#e8eaf0', emb: ['#2a4aa8', '#c8ccd4'], shorts: '#2a4aa8', shoes: '#c8ccd4', bow: '#2a4aa8', pack: '#8a90a0', eye: DK, flowers: false, extra: tiara('#c8ccd4', '#e8eaf0') }),
      fresita: F({ lw: .7, line: '#c8ccd4', body: '#d8c8e8', belly: '#f0f2f8', gill: '#2a4aa8', gillTip: '#c8ccd4', eye: DK, glow: '#c8d8ff', glowA: .2, gillLine: true }) },
    { nombre: 'Cartel estilizado', nota: 'Proporciones alargadas como en los carteles de Erté: más altas y delgadas.',
      itzel: tall(I({ lw: .6, line: GD, skin: '#b9784f', hair: DK, blouse: CR, blouse2: '#d8c8a8', emb: [GD, DK], shorts: DK, shoes: GD, bow: GD, pack: DK, eye: DK, flowers: false, extra: tiara(GD, CR) })),
      fresita: (c, fr, f) => { c.save(); c.translate(fr.x, fr.y); c.scale(1.15, .85); c.translate(-fr.x, -fr.y); F({ lw: .6, line: GD, body: '#e8a8b8', belly: CR, gill: GD, gillTip: '#fff2c0', eye: DK, glow: null, gillLine: true })(c, fr, f); c.restore(); } },
    { nombre: 'Octágono', nota: 'Cabezas de ocho lados y cuerpo facetado, geometría pura de rascacielos.',
      itzel: I({ ...esmalte, poly: 8, extra: tiara(GD, CR) }), fresita: F({ lw: .8, line: GD, poly: true, body: '#e86a7a', body2: '#c8503a', belly: CR, gill: '#2a8a7a', gillTip: GD, eye: DK, glow: null }) },
    { nombre: 'Letrero luminoso', nota: 'Siluetas oscuras con contorno de tubo dorado encendido, como la marquesina de un cine.',
      itzel: (c, p, f) => { drawItzel(c, p, f, { mono: '#14161c', noFace: true, eyeGlow: '#ffe28a', flowers: false }); c.save(); c.shadowColor = '#ffd870'; c.shadowBlur = 5 * f.S; drawItzel(c, p, f, { _mode: 'line', lw: .6, line: '#ffe28a', flowers: false, extra: tiara('#ffe28a', '#14161c') }); c.restore(); },
      fresita: (c, fr, f) => { drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: '#14161c', eyeGlow: '#ffe28a', noHalo: true }); c.save(); c.shadowColor = '#ffd870'; c.shadowBlur = 5 * f.S; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .6, line: '#ffe28a' }); c.restore(); } },
    { nombre: 'Medalla de oro', nota: 'Todo en tonos de oro, como acuñadas en una medalla.',
      itzel: I({ lw: .5, line: '#7a5a10', skin: '#e8c86a', hair: '#8a6a1a', blouse: '#f2dc8a', emb: ['#b8902a'], shorts: '#c8a03a', shoes: '#a8801a', bow: '#a8801a', pack: '#b8902a', eye: '#5a4210', cheek: null, flowers: false, extra: tiara('#7a5a10', '#f2dc8a') }),
      fresita: F({ lw: .5, line: '#7a5a10', body: '#ecc860', belly: '#f8e8a8', gill: '#b8902a', gillTip: '#fff2c0', eye: '#5a4210', glow: '#ffd870', glowA: .2, cheek: null }) },
  ];
}

// =====================================================================
//  POLÍGONOS CINEMÁTICOS
// =====================================================================
{
  const base = { skin: '#d8a078', hair: '#2a1a1a', blouse: '#e0d8c8', blouse2: '#8a8478', emb: ['#c0502a'], shorts: '#3a5a4a', shoes: '#c0502a', bow: '#c0502a', pack: '#5a4a3a', noFace: true, flowers: false, poly: 5 };
  const fBase = { lw: 0, poly: true, body: '#e8a0b0', body2: '#a86a7a', belly: '#f0c8d0', gill: '#7ff0e0', gillTip: '#d8fff8', eye: '#2a1a2a', glow: '#7ff0e0', glowA: .2, cheek: null };
  const sombraMitad = (o, col = '#2a1a2a') => (c, a, f) => { drawItzel(c, a, f, o); c.save(); c.beginPath(); c.rect(a.face > 0 ? a.x - 30 : a.x, a.y - 40, 30, 50); c.clip(); c.globalAlpha = .4; drawItzel(c, a, f, { ...o, _mode: 'fill', mono: col }); c.restore(); };
  VARIANTES.cinema = [
    actual('cinema', 'Rotoscopia plana sin rostro, como Another World; Fresita con branquias alienígenas.'),
    { nombre: 'Contraluz', nota: 'Las dos contra el atardecer: silueta oscura con un filo naranja de luz en la orilla.',
      itzel: (c, p, f) => { c.save(); c.translate(p.face * .7, -.4); drawItzel(c, p, f, { ...base, _mode: 'fill', mono: '#ffa060' }); c.restore(); drawItzel(c, p, f, { ...base, mono: '#24161e' }); },
      fresita: (c, fr, f) => { c.save(); c.translate(fr.face * .7, -.4); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...fBase, _mode: 'fill', mono: '#ffa060', noHalo: true }); c.restore(); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...fBase, mono: '#24161e', keep: ['gill', 'gillTip'] }); } },
    { nombre: 'Tres tonos', nota: 'Colores planos con la mitad de atrás en sombra dura, como las cinemáticas de Flashback.',
      itzel: sombraMitad(base), fresita: (c, fr, f) => { F(fBase)(c, fr, f); } },
    { nombre: 'Con cara', nota: 'El mismo estilo plano pero con ojos, para que se lean mejor las expresiones.',
      itzel: I({ ...base, noFace: false, eye: '#2a1a1a', cheek: null }), fresita: F(fBase) },
    { nombre: 'Expedición fría', nota: 'Paleta de planeta alienígena: azules y turquesa, como la intro de Another World.',
      itzel: I({ ...base, skin: '#c8a088', hair: '#1a2a3a', blouse: '#a8c8c8', blouse2: '#6a8a9a', shorts: '#2a4a5a', shoes: '#7ff0e0', bow: '#7ff0e0', pack: '#3a5a6a' }),
      fresita: F({ ...fBase, body: '#a8d8e0', body2: '#6a9aaa', belly: '#d8f0f0', gill: '#ff8fb0', gillTip: '#ffd0e0' }) },
    { nombre: 'Película sepia', nota: 'Como una película vieja: todo en sepia y un leve parpadeo de proyector.',
      itzel: (c, p, f) => { c.save(); c.globalAlpha = .88 + hash1(Math.floor(f.t * 12), 3) * .12; I({ ...base, skin: '#c8a078', hair: '#2a1e14', blouse: '#e8d8b8', blouse2: '#a89070', emb: ['#6a4a2a'], shorts: '#5a4a34', shoes: '#6a4a2a', bow: '#6a4a2a', pack: '#4a3a28' })(c, p, f); c.restore(); },
      fresita: F({ ...fBase, body: '#d8b898', body2: '#a88a6a', belly: '#f0e0c8', gill: '#8a6a4a', gillTip: '#e8d8b8', glow: null }) },
    { nombre: 'Rotoscopia con línea', nota: 'Los mismos planos de color con una línea fina oscura, más claros sobre fondos cargados.',
      itzel: I({ ...base, lw: .5, line: '#1a1218' }), fresita: F({ ...fBase, lw: .5, line: '#1a1218' }) },
    { nombre: 'Sombra larga', nota: 'Una sombra larga y plana que se estira por el suelo, como luz de atardecer.',
      itzel: (c, p, f) => { if (p.on) { c.fillStyle = 'rgba(30,15,30,.35)'; c.beginPath(); c.moveTo(p.x - 4, p.y); c.lineTo(p.x + 4, p.y); c.lineTo(p.x - 26, p.y + 3); c.lineTo(p.x - 34, p.y + 3); c.closePath(); c.fill(); } I(base)(c, p, f); },
      fresita: (c, fr, f) => { c.fillStyle = 'rgba(30,15,30,.18)'; c.beginPath(); c.ellipse(fr.x - 14, fr.y + 30, 10, 1.6, 0, 0, TAU); c.fill(); F(fBase)(c, fr, f); } },
    { nombre: 'Desierto', nota: 'Colores cálidos de desierto al atardecer, que combinan con las rocas de este mundo.',
      itzel: I({ ...base, skin: '#d88a5a', hair: '#3a1a2a', blouse: '#f0c8a0', blouse2: '#c0806a', emb: ['#e0503a'], shorts: '#6a3a5a', shoes: '#e0503a', bow: '#e0503a', pack: '#8a4a3a' }),
      fresita: F({ ...fBase, body: '#f0a890', body2: '#c07060', belly: '#f8d8c0', gill: '#ffd080', gillTip: '#fff0c0' }) },
    { nombre: 'Cinta VHS', nota: 'Como un video viejo: colores corridos en rojo y cian, y líneas de barrido.',
      itzel: (c, p, f) => { c.save(); c.globalAlpha = .55; c.translate(-.7, 0); drawItzel(c, p, f, { ...base, _mode: 'fill', mono: '#ff3a5a' }); c.translate(1.4, 0); drawItzel(c, p, f, { ...base, _mode: 'fill', mono: '#3affe0' }); c.restore(); I(base)(c, p, f); c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = p.y - 22; y < p.y + 2; y += 1.2) c.fillRect(p.x - 10, y + (f.t * 8) % 1.2, 20, .4); },
      fresita: (c, fr, f) => { c.save(); c.globalAlpha = .55; c.translate(-.7, 0); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...fBase, _mode: 'fill', mono: '#ff3a5a', noHalo: true }); c.translate(1.4, 0); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...fBase, _mode: 'fill', mono: '#3affe0', noHalo: true }); c.restore(); F(fBase)(c, fr, f); } },
  ];
}
Object.assign(window, { rayado, sketchLine, sketchLineF });
})();
