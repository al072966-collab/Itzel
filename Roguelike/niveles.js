'use strict';
// =====================================================================
//  NIVELES HECHOS A MANO: uno por estilo, cada uno con su enemigo,
//  su plataforma especial y el poder de Fresita que se usa ahí.
//  Coordenadas en losetas: x de 0 a W, y de 0 (arriba) a 14; el suelo
//  normal tiene su superficie en la fila 11. Itzel salta ~4 losetas
//  de alto y ~5 de largo.
// =====================================================================
function Constructor(W) {
  const G = Array.from({ length: 15 }, () => Array(W).fill('.')), ents = [];
  const b = {
    W, ents,
    g(x0, x1, top = 11) { for (let x = x0; x <= x1; x++) for (let y = top; y < 15; y++) G[y][x] = '#'; return b; },
    blk(x, y, w = 1, h = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) G[y + j][x + i] = '#'; return b; },
    isl(x0, x1, y, h = 1) { return b.blk(x0, y, x1 - x0 + 1, h); },
    c(x0, x1, y) { for (let x = x0; x <= x1; x++) if (G[y][x] === '.') G[y][x] = 'o'; return b; },
    top(x) { for (let y = 0; y < 15; y++) if (G[y][x] === '#') return y; return 15; },
    d(k, x) { const y = b.top(x) - 1; if (y >= 0 && y < 14 && G[y][x] === '.') G[y][x] = k; return b; },
    P(x) { G[b.top(x) - 1][x] = 'P'; return b; },
    Gl(x) { G[b.top(x) - 1][x] = 'G'; return b; },
    h(x, y) { G[y][x] = 'h'; return b; },
    e(x, y, k) { ents.push({ t: 'foe', x, y, k }); return b; },
    o(k, x, y, opt = {}) { ents.push(Object.assign({ t: 'obj', k, x, y }, opt)); return b; },
    p(x, y, w, o) { ents.push({ t: 'plat', x, y, w, o }); return b; },
    s(k, x, y, w, h, o = {}) { ents.push(Object.assign({ t: 'solid', k, x, y, w, h }, o)); return b; },
    z(x0, x1, y0, y1) { ents.push({ t: 'zone', x0, x1, y0, y1 }); return b; },
    rows() { return G.map(r => r.join('')); },
  };
  return b;
}
const NIVELES = {};
function nivel(id, def) { NIVELES[id] = Object.assign({ id }, def); }
function construirNivel(def) { const b = Constructor(def.W); def.build(b); return { rows: b.rows(), ents: b.ents }; }

// ---------------------------------------------------------------- 1
nivel('pixel', {
  nombre: 'La muralla de pixel', lema: 'Ladrillos que se desmoronan y cangrejos del malecón.',
  foe: 'cangrejo', power: 'bloque', plat: { k: 'fall', look: 'bricks' }, W: 124,
  skin: { plat: '#8f563b', plat2: '#663931', line: '#222034', accent: '#df7126', foe: { main: '#d95763', dark: '#45283c', light: '#eec39a', accent: '#fbf236', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 7).d('f', 10).d('r', 12);
    b.p(15, 10, 2).p(18, 9, 2).p(21, 10, 2).c(15, 23, 7);
    b.g(25, 42).blk(34, 10, 2, 1).e(30).e(38).d('f', 27).d('T', 41);
    b.g(43, 46).g(47, 56, 5).c(48, 55, 3).d('T', 52);
    b.p(58, 6, 2).p(61, 7, 2).p(64, 8, 2);
    b.g(67, 84).isl(72, 75, 7).c(72, 75, 6).e(70).e(79).e(83).d('f', 68);
    b.p(87, 9, 2).p(96, 9, 2).c(89, 94, 7);
    b.g(99, 110).h(104, 9).e(107).d('T', 101);
    b.g(111, 123).g(114, 118, 9).Gl(120).d('f', 112);
  },
});
// ---------------------------------------------------------------- 2
nivel('ocaso', {
  nombre: 'Hamacas al atardecer', lema: 'Las hamacas te avientan alto; los murciélagos salen con el sol.',
  foe: 'murcielago', power: 'viento', plat: { k: 'bounce', look: 'hammock', pow: 600 }, W: 120,
  skin: { plat: '#c0506a', plat2: '#ff9a70', line: '#12081a', accent: '#ffd27a', foe: { main: '#12081a', dark: '#12081a', light: '#5a2a4a', accent: '#ff7a59', eye: '#ffd9a0' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 8);
    b.p(15, 10, 3).isl(20, 25, 4).c(20, 25, 3);
    b.g(27, 45).e(32, 7).e(40, 6).d('f', 29).d('T', 43);
    b.g(46, 48).g(49, 60, 4).c(50, 59, 2).d('T', 55);
    b.g(61, 74, 8).e(67, 4).d('f', 63).d('T', 72);
    b.p(77, 10, 3).p(84, 9, 3).p(91, 10, 3).c(80, 82, 4).c(87, 89, 3);
    b.g(97, 119).e(103, 7).h(108, 8).Gl(114).d('T', 100).d('f', 111);
  },
});
// ---------------------------------------------------------------- 3
nivel('acuarela', {
  nombre: 'El cenote de acuarela', lema: 'Nenúfares que se hunden y ranas que brincan.',
  foe: 'rana', power: 'nenufar', plat: { k: 'sink', look: 'lily', depth: 56, rate: 16 }, W: 122,
  skin: { plat: '#7fae5a', plat2: '#5d8f45', line: '#3a5a2a', accent: '#e89ab0', foe: { main: '#7fae5a', dark: '#3a4a2a', light: '#e8f0c0', accent: '#d9655b', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('f', 6).d('T', 10);
    b.p(15, 10, 2).p(19, 10, 2).p(23, 10, 2).c(15, 24, 8);
    b.g(26, 44).e(30).e(36).e(41).d('T', 33).d('f', 43);
    b.p(48, 10, 2).p(60, 10, 2).c(51, 57, 8);
    b.g(64, 82).g(71, 82, 9).e(67).e(77, 9).d('T', 74);
    b.p(85, 10, 2).p(90, 9, 2).p(95, 10, 2).c(85, 96, 7);
    b.g(99, 121).h(104, 9).e(108).Gl(116).d('f', 101).d('T', 112);
  },
});
// ---------------------------------------------------------------- 4
nivel('paper', {
  nombre: 'Papel picado', lema: 'Plataformas que se doblan solas y avispas de papel.',
  foe: 'avispa', power: 'avion', plat: { k: 'timed', look: 'paper', per: 2.4, duty: .62 }, W: 120,
  skin: { plat: '#f6bd60', plat2: '#e4572e', line: '#7a4a2a', accent: '#e83f6f', foe: { main: '#ffbf00', dark: '#2a2a3a', light: '#ffffff', accent: '#e83f6f', eye: '#ffffff' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 7).d('f', 10);
    b.p(14, 10, 3, { off: 0 }).p(18, 9, 3, { off: .33 }).p(22, 10, 3, { off: .66 }).c(14, 24, 7);
    b.g(26, 42).e(31, 6).e(38, 5).d('f', 28).d('T', 40);
    b.p(49, 9, 2, { off: .2 }).c(45, 56, 6);
    b.g(58, 72).g(65, 72, 8).e(69, 4).d('T', 61);
    b.p(74, 8, 2, { off: 0 }).p(77, 6, 2, { off: .3 }).p(80, 4, 2, { off: .6 });
    b.g(83, 94, 4).c(84, 93, 2).d('T', 89);
    b.g(95, 119).e(100, 6).e(108, 6).h(104, 8).Gl(114).d('f', 97);
  },
});
// ---------------------------------------------------------------- 5
nivel('biolum', {
  nombre: 'El bosque que brilla', lema: 'Hongos que rebotan, caminos de luz y cocuyos.',
  foe: 'cocuyo', power: 'luz', light: 58, plat: { k: 'reveal', look: 'glowline' }, W: 120,
  skin: { plat: '#5fffe0', plat2: '#2de0b0', line: '#06141a', accent: '#5fffe0', light: '#bfffef', foe: { main: '#1a3a4a', dark: '#06141a', light: '#bfffef', accent: '#ff8ff0', eye: '#7fffe0' } },
  build(b) {
    const S = { k: 'bounce', look: 'shroom', pow: 600 };
    b.g(0, 12).P(3).d('f', 6).d('T', 10);
    b.p(13, 10.5, 2, S).isl(19, 25, 6).c(19, 25, 5);
    b.p(28, 7, 3).p(33, 6, 3).p(38, 7, 3);
    b.g(41, 56).e(45, 7).e(52, 6).d('T', 48).d('f', 55);
    b.p(59, 9, 2).p(63, 7, 2).p(67, 8, 2).p(71, 6, 2).p(75, 8, 2).p(79, 9, 2).c(60, 80, 4);
    b.g(82, 97).p(88, 10.5, 2, S).isl(91, 97, 5).c(91, 97, 4).e(85, 7);
    b.g(98, 119).h(103, 9).Gl(114).d('T', 101).d('f', 110);
  },
});
// ---------------------------------------------------------------- 6
nivel('flat', {
  nombre: 'Lanchas del Golfo', lema: 'Lanchas que van y vienen y zopilotes al acecho.',
  foe: 'zopilote', power: 'rafaga', plat: { k: 'move', path: 'h', look: 'lancha', amp: 40, sp: .9 }, W: 120,
  skin: { plat: '#f4efe6', plat2: '#ff6b5b', line: '#2a2347', accent: '#ff6b5b', foe: { main: '#2a2347', dark: '#1b1530', light: '#f4a786', accent: '#d84a5a', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8).d('r', 11);
    b.p(17, 10, 3).p(28, 10, 3, { amp: 44, sp: .75, ph: 2 }).c(16, 33, 7);
    b.g(36, 50).e(42, 4).e(48, 3).d('f', 38).d('T', 45);
    b.c(52, 59, 8);
    b.g(61, 76).e(68, 4).d('T', 64).d('r', 73);
    b.p(80, 10, 3, { sp: 1 }).p(90, 10, 3, { sp: .8, ph: 1.5 }).c(79, 94, 7);
    b.g(97, 119).h(101, 9).e(106, 3).Gl(114).d('T', 111);
  },
});
// ---------------------------------------------------------------- 7
nivel('sumie', {
  nombre: 'Nubes de tinta', lema: 'Nubes que aparecen y se borran, paredes que Fresita mancha de tinta para trepar y culebras que muerden.',
  foe: 'culebra', power: 'nube', plat: { k: 'timed', look: 'inkcloud', per: 3, duty: .65 }, W: 122,
  skin: { plat: '#2a2826', plat2: '#5a5650', line: '#1d1b19', accent: '#c23b2e', foe: { main: '#c23b2e', dark: '#1d1b19', light: '#f0e7d2', accent: '#e8b84a', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8).d('f', 11);
    b.p(15, 9, 3, { off: 0 }).p(20, 8, 3, { off: .3 }).p(25, 9, 3, { off: .6 }).c(15, 27, 6);
    b.g(29, 46).e(34).e(42).d('T', 37).d('r', 45);
    b.g(47, 49).g(50, 58, 5).c(51, 57, 3).d('T', 55);
    b.p(61, 7, 3, { off: .1 }).p(66, 8, 3, { off: .4 }).p(71, 9, 3, { off: .7 });
    b.g(75, 92).e(80).e(88).d('f', 77).d('T', 85);
    b.p(94, 9, 3, { off: .2 }).p(98, 8, 3, { off: .55 }).c(94, 101, 6);
    b.g(103, 121).h(107, 9).Gl(116).d('T', 112);
  },
});
// ---------------------------------------------------------------- 8
nivel('neon', {
  nombre: 'Ritmo de neón', lema: 'Bloques que se prenden al ritmo: Fresita los sostiene si le pega justo al compás.',
  foe: 'iguana', power: 'pulso', beatAuto: 1.6, plat: { k: 'beat', look: 'neon' }, W: 120,
  skin: { plat: '#14062a', plat2: '#2a0b4a', line: '#ff2bd6', accent: '#00e8ff', foe: { main: '#14062a', dark: '#14062a', light: '#00e8ff', accent: '#ff2bd6', eye: '#3dff8a' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 7);
    b.p(14, 10, 3, { grp: 'A' }).p(18, 8, 3, { grp: 'B' }).p(22, 9, 3, { grp: 'A' }).p(26, 10, 3, { grp: 'B' }).c(14, 28, 6);
    b.g(30, 48).e(35).e(44).d('f', 32).d('T', 40);
    b.p(50, 9, 2, { grp: 'A' }).p(53, 7, 2, { grp: 'B' }).p(56, 5, 2, { grp: 'A' });
    b.g(58, 62, 4).c(58, 62, 2);
    b.g(63, 80).e(69).e(76).d('T', 66);
    b.p(83, 9, 2, { grp: 'A' }).p(87, 9, 2, { grp: 'B' }).p(91, 9, 2, { grp: 'A' }).p(95, 9, 2, { grp: 'B' }).c(83, 96, 7);
    b.g(98, 119).h(102, 9).Gl(114).d('T', 108);
  },
});
// ---------------------------------------------------------------- 9
nivel('bruma', {
  nombre: 'Aluxes en la niebla', lema: 'El camino solo existe donde Fresita apunta su faro.',
  foe: 'alux', power: 'farol', light: 50, plat: { k: 'reveal', look: 'fogstone' }, W: 126,
  skin: { plat: '#0b0b0a', plat2: '#2a2a28', line: '#0b0b0a', accent: '#ffffff', light: '#ffffff', foe: { main: '#0b0b0a', dark: '#0b0b0a', light: '#555555', accent: '#ffffff', eye: '#ffffff' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 8);
    b.p(14, 10, 2).p(18, 9, 2).p(22, 10, 2).c(14, 23, 7);
    b.g(25, 42).e(30).e(38).d('T', 27).d('r', 35).d('T', 41);
    b.p(45, 9, 2).p(49, 7, 2).p(53, 5, 2).isl(56, 62, 4).c(57, 61, 3);
    b.p(65, 6, 2).p(69, 8, 2).p(73, 10, 2);
    b.g(76, 94).e(82).e(90).d('T', 79).d('T', 87);
    b.p(97, 9, 2).p(101, 8, 2).p(105, 9, 2).c(97, 106, 6);
    b.g(108, 125).h(111, 9).Gl(120).d('T', 115);
  },
});
// ---------------------------------------------------------------- 10
nivel('lowpoly', {
  nombre: 'Elevadores de cristal', lema: 'Cristales que suben y bajan; jabalíes que embisten.',
  foe: 'jabali', power: 'cristal', plat: { k: 'move', path: 'v', look: 'crystal', amp: 40, sp: 1 }, W: 120,
  skin: { plat: '#7fd8f0', plat2: '#3a8fc0', line: '#2d2a4a', accent: '#ffd166', foe: { main: '#6a4a5a', dark: '#2d2a4a', light: '#f2ede4', accent: '#ffd166', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 7).d('f', 11);
    b.p(16, 8, 3).g(20, 32, 5).c(21, 31, 3).d('T', 26);
    b.g(33, 50).e(38).e(46).d('f', 35).d('T', 48);
    b.g(51, 53).g(54, 66, 5).c(55, 65, 3).d('T', 60);
    b.p(70, 7, 3, { amp: 32, sp: 1.1 }).p(77, 9, 3, { amp: 28, sp: .9, ph: 1.5 }).c(70, 79, 5);
    b.g(83, 100).e(88).e(95).d('f', 85);
    b.g(101, 119).g(106, 110, 9).h(108, 7).Gl(114);
  },
});
// ---------------------------------------------------------------- 11
nivel('codex', {
  nombre: 'El glifo de Edzná', lema: 'Piedras que se hunden, glifos que abren puertas y el jaguar.',
  foe: 'jaguar', power: 'glifo', plat: { k: 'sink', look: 'stone', depth: 60, rate: 10 }, W: 124,
  skin: { plat: '#cdb48a', plat2: '#b0412e', line: '#1c1612', accent: '#4d8a5c', foe: { main: '#d79a3d', dark: '#1c1612', light: '#f1e2bd', accent: '#b0412e', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8).d('f', 11);
    b.p(15, 9, 2).p(19, 8, 2).p(23, 9, 2).c(15, 24, 6);
    b.g(26, 44).e(32).e(40).d('T', 29).d('r', 37);
    b.g(45, 60).s('glyph', 48, 5, 2, 6, { grp: 1 }).c(52, 58, 9).d('f', 54);
    b.s('glyph', 61, 10, 10, 1, { grp: 2, on: false }).c(61, 70, 8);
    b.g(71, 88).e(77).e(84).d('T', 74);
    b.p(90, 9, 2).p(94, 7, 2).p(98, 5, 2);
    b.g(101, 108, 4).c(102, 107, 2);
    b.g(109, 123).h(112, 9).Gl(118).d('T', 115);
  },
});
// ---------------------------------------------------------------- 12
nivel('oleo', {
  nombre: 'Remolinos de la noche', lema: 'Remolinos pintados que avientan a Itzel como resortera y búhos que se lanzan.',
  foe: 'buho', power: 'remolino', plat: { k: 'move', path: 'circle', look: 'swirlplat', amp: 22, sp: 1 }, W: 124,
  skin: { plat: '#2c3a5e', plat2: '#1a2240', line: '#14203f', accent: '#f8e27a', foe: { main: '#8a6a3a', dark: '#1a2240', light: '#f0d090', accent: '#e8a028', eye: '#f8e27a' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.z(15, 18, 3, 12).isl(20, 26, 5).c(20, 26, 4);
    b.g(28, 44).e(32, 4).e(40, 3).d('T', 30).d('f', 43);
    b.p(49, 7, 3).p(56, 7, 3, { ph: 3.14 }).c(48, 59, 4);
    b.g(61, 75).d('T', 66).e(70, 4);
    b.g(76, 77).g(78, 86, 5).c(79, 85, 3);
    b.g(87, 100).e(93, 4).d('f', 90);
    b.z(103, 105, 2, 12).c(102, 106, 5);
    b.g(108, 123).h(111, 9).Gl(118).d('T', 114);
  },
});
// ---------------------------------------------------------------- 13
nivel('vitral', {
  nombre: 'La catedral de vidrio', lema: 'Vidrio resbaloso y escarabajos joya rodando.',
  foe: 'escarabajo', power: 'vidrio', plat: { k: 'ice', look: 'ice' }, W: 126,
  skin: { plat: '#8fc8f0', plat2: '#2f5ea8', line: '#141414', accent: '#ffd36b', foe: { main: '#2f8a46', dark: '#1a3a6a', light: '#ffd36b', accent: '#c0392b', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.p(15, 10, 4).p(21, 9, 4).c(15, 24, 7);
    b.g(27, 47).e(33).e(41).d('T', 30).d('f', 44);
    b.g(48, 56, 6).c(49, 55, 4);
    b.p(59, 7, 3).p(64, 8, 3).p(69, 9, 3);
    b.g(73, 92).e(78).e(86).d('T', 76).d('f', 90);
    b.p(95, 10, 4).p(101, 9, 4).p(107, 10, 4).c(95, 110, 7);
    b.g(112, 125).h(115, 9).Gl(120);
  },
});
// ---------------------------------------------------------------- 14
nivel('cuaderno', {
  nombre: 'Garabatos del cuaderno', lema: 'Líneas de lápiz para caminar y garabatos que rebotan.',
  foe: 'garabato', power: 'lapiz', plat: { k: 'seg', look: 'pencil' }, W: 122,
  skin: { plat: '#2a4ab0', plat2: '#5a7ad0', line: '#2a4ab0', accent: '#e05a4f', foe: { main: '#3a3a42', dark: '#3a3a42', light: '#ffffff', accent: '#e05a4f', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.c(15, 27, 6);
    b.g(30, 46).e(35).e(42).d('f', 33).d('T', 40);
    b.c(49, 61, 8);
    b.g(63, 78).e(70).d('T', 66);
    b.g(94, 102, 4).c(95, 101, 2);
    b.g(103, 121).h(107, 9).Gl(116).d('T', 111);
  },
});
// ---------------------------------------------------------------- 15
nivel('grabado', {
  nombre: 'Talla de madera', lema: 'Ruedas de tablas, muros de madera y calaveritas.',
  foe: 'calavera', power: 'gubia', plat: { k: 'move', path: 'circle', look: 'plank', amp: 40, sp: .8 }, W: 124,
  skin: { plat: '#1f1a1c', plat2: '#3a3438', line: '#efe5cf', accent: '#b3342b', foe: { main: '#efe5cf', dark: '#1f1a1c', light: '#efe5cf', accent: '#b3342b', eye: '#ffffff' } },
  build(b) {
    b.g(0, 15).P(3).d('T', 8);
    for (const ph of [0, 2.09, 4.19]) b.p(20, 8, 3, { ph });
    b.c(18, 24, 4);
    b.g(26, 44).e(34).e(41).d('T', 31);
    b.g(45, 62).s('wood', 48, 6, 2, 5).c(52, 56, 9).d('f', 55).s('wood', 58, 8, 1, 3);
    b.g(63, 64);
    for (const ph of [0, 2.09, 4.19]) b.p(70, 8, 3, { ph, amp: 40 });
    b.c(68, 74, 4);
    b.g(76, 96).e(85).e(92).d('T', 88);
    b.g(97, 123).s('wood', 100, 5, 2, 6).h(105, 9).Gl(118).d('T', 112);
  },
});
// ---------------------------------------------------------------- 17
nivel('anime', {
  nombre: 'El malecón colgante', lema: 'Fresita se vuelve sólida y te cuelgas de ella para volar; pelícanos en picada.',
  foe: 'pelicano', power: 'asidero', plat: { k: 'bounce', look: 'spring', pow: 640 }, W: 116,
  skin: { plat: '#e83a4a', plat2: '#5a6a7a', line: '#2a1e2e', accent: '#e83a4a', foe: { main: '#f4f4f0', dark: '#5a6a7a', light: '#ffffff', accent: '#f2a33a', eye: '#ffffff' } },
  build(b) {
    b.g(0, 15).P(3).d('T', 8);
    b.g(16, 26, 5).c(17, 25, 3).d('T', 22);
    b.g(27, 44).e(32, 2).e(40, 2).d('f', 30).d('T', 38);
    b.g(45, 47).g(48, 56, 3).c(49, 55, 1);
    b.g(57, 70).e(63, 2).d('T', 60);
    b.isl(73, 75, 10).p(74, 9.62, .75).isl(81, 83, 9).p(82, 8.62, .75).c(77, 79, 4).c(85, 88, 3);
    b.g(91, 115).e(98, 2).h(102, 9).Gl(108).d('T', 95);
  },
});
// ---------------------------------------------------------------- 18
nivel('nouveau', {
  nombre: 'Pétalos y enredaderas', lema: 'Pétalos que caen despacio y abejas meliponas.',
  foe: 'abeja', power: 'semilla', plat: { k: 'drift', look: 'petal' }, W: 126,
  skin: { plat: '#e8b0a8', plat2: '#d89a8a', line: '#4a3426', accent: '#c9a24a', foe: { main: '#d8a83a', dark: '#4a3426', light: '#f1e6c8', accent: '#d89a8a', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.p(15, 9, 3).p(20, 8, 3).p(25, 9, 3).c(15, 27, 6);
    b.g(29, 44).e(34, 6).e(41, 5).d('f', 31).d('T', 38);
    b.g(45, 47).g(48, 58, 4).c(49, 57, 2).d('T', 53);
    b.p(61, 6, 3).p(66, 7, 3).p(71, 8, 3);
    b.g(75, 90).e(80, 6).e(87, 6).d('f', 77);
    b.p(93, 9, 3).p(98, 8, 3).p(103, 9, 3).c(93, 105, 6);
    b.g(107, 125).h(110, 9).Gl(120).d('T', 115);
  },
});
// ---------------------------------------------------------------- 19
nivel('deco', {
  nombre: 'La relojería dorada', lema: 'Plataformas rapidísimas y autómatas de cuerda.',
  foe: 'automata', power: 'reloj', plat: { k: 'move', path: 'h', look: 'gold', amp: 40, sp: 2.4 }, W: 118,
  skin: { plat: '#0b0e14', plat2: '#d4af37', line: '#d4af37', accent: '#d4af37', foe: { main: '#0b0e14', dark: '#0b0e14', light: '#efe3c8', accent: '#d4af37', eye: '#d4af37' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.p(17, 9, 3).p(24, 9, 3, { amp: 30, sp: 2.8, ph: 1 }).c(16, 27, 6);
    b.g(30, 47).e(35).e(42).d('T', 38);
    b.p(51, 8, 3, { path: 'circle', amp: 26, sp: 2.4 }).c(49, 56, 5);
    b.g(58, 77).e(66).e(73).d('f', 60);
    b.p(81, 7, 3, { path: 'v', amp: 40, sp: 2.8 });
    b.g(85, 95, 4).c(86, 94, 2).d('T', 90);
    b.g(96, 117).h(100, 9).Gl(112);
  },
});
// ---------------------------------------------------------------- 20
nivel('cyber', {
  nombre: 'Bandas de la ciudad', lema: 'Bandas transportadoras y drones con láser.',
  foe: 'dron', power: 'hackeo', plat: { k: 'conveyor', look: 'belt', v: -45 }, W: 114,
  skin: { plat: '#1a1d2a', plat2: '#4a4f70', line: '#05d9e8', accent: '#ff2a6d', foe: { main: '#1c1e2e', dark: '#141522', light: '#4a4f70', accent: '#ff2a6d', eye: '#ff2a6d' } },
  build(b) {
    b.g(0, 12).P(3);
    b.p(13, 10, 9).c(14, 21, 8);
    b.g(23, 40).e(28, 4).e(36, 4).d('T', 25).d('f', 33);
    b.p(43, 9, 15, { v: -80 }).c(44, 57, 7);
    b.g(60, 78).e(65, 3).e(73, 3).d('T', 68);
    b.p(81, 10, 10, { v: 60 }).c(82, 92, 7);
    b.g(94, 113).h(98, 9).Gl(108).d('T', 103);
  },
});
// ---------------------------------------------------------------- 21
nivel('cinema', {
  nombre: 'Portales de Fresita', lema: 'Rocas que flotan, babosas que saltan y muros imposibles.',
  foe: 'babosa', power: 'portal', plat: { k: 'move', path: 'bob', look: 'gasrock', amp: 14, sp: 1.4 }, W: 120,
  skin: { plat: '#3a2e44', plat2: '#5a3e4e', line: '#1c1826', accent: '#7ff0e0', foe: { main: '#2a5050', dark: '#1a2a2a', light: '#7ff0e0', accent: '#7ff0e0', eye: '#ffe0a0' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 8);
    b.p(15, 9, 3).p(21, 8, 3, { ph: 1 }).p(27, 9, 3, { ph: 2 }).c(15, 29, 6);
    b.g(31, 46).e(36).e(42).d('T', 39);
    b.g(47, 48).g(49, 51, 2).g(52, 66).c(53, 58, 9).d('T', 61);
    b.p(69, 8, 3, { ph: .5 }).p(75, 7, 3, { ph: 1.5 }).p(81, 8, 3, { ph: 2.5 }).c(69, 83, 5);
    b.g(85, 100).e(90).e(96).d('r', 87);
    b.g(101, 119).h(104, 9).Gl(114);
  },
});
// ---------------------------------------------------------------- 22
