'use strict';
// =====================================================================
//  NIVELES DE LOS MUNDOS NUEVOS (mismo formato que niveles.js)
// =====================================================================

// ---------------------------------------------------------------- barro
nivel('barro', {
  nombre: 'El taller de la alfarera', lema: 'Puentes que se estiran, pilares que suben y grumos que te persiguen.',
  foe: 'grumo', power: 'moldear', plat: { k: 'taffy', look: 'arcilla', depth: 58 }, W: 120,
  skin: { plat: '#c66b3d', plat2: '#a8552e', line: '#3a2014', accent: '#e8955a', foe: { main: '#8a6ab0', dark: '#3a2a50', light: '#d8c8f0', accent: '#e85a4f', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 7).d('r', 10).d('f', 12);
    b.o('clay', 14, 11, { axis: 'x', dir: 1, min: .6, max: 8 }).c(15, 20, 9);
    b.g(21, 38).e(26).e(33).d('f', 23).d('r', 29).d('T', 31).c(24, 30, 9);
    b.o('clay', 37, 11, { axis: 'y', w: 2, min: .6, max: 5.4 });
    b.g(39, 50, 6).e(45, 6).c(40, 49, 4).d('T', 48).d('r', 41);
    b.p(53, 8, 3).p(58, 9, 3).c(53, 60, 5);
    b.g(63, 80).e(68).e(76).p(71, 7, 3).c(70, 74, 5).d('T', 65).d('r', 79);
    b.o('clay', 89, 11, { axis: 'x', dir: -1, min: .6, max: 8 }).c(82, 88, 9);
    b.g(89, 105).h(95, 9).e(99).d('f', 91).d('T', 102);
    b.o('clay', 104, 11, { axis: 'y', w: 2, min: .6, max: 5.2 });
    b.g(106, 119, 6).Gl(115).d('r', 108).d('f', 111);
  },
});
// ---------------------------------------------------------------- eco
nivel('eco', {
  nombre: 'El jardín de los ecos', lema: 'Deja tu eco en los círculos para que los puentes no se apaguen.',
  foe: 'erizo', power: 'eco', plat: { k: 'rise', look: 'losa', depth: 64 }, W: 118,
  skin: { plat: '#4e8878', plat2: '#173440', line: '#24454e', accent: '#9affee', foe: { main: '#6f9a5a', dark: '#2a4a3a', light: '#c8e0b0', accent: '#ffdd94', eye: '#111111' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 6).o('plate', 10, 0, { grp: 0, n: 'I' });
    b.s('ecobridge', 13, 11, 6, 1, { grp: 0, on: false }).c(13, 18, 9);
    b.g(19, 34).e(24).e(30).d('f', 21).d('T', 27).d('r', 33).c(22, 32, 9);
    b.p(37, 10, 3).p(41, 10, 2).c(37, 43, 4);
    b.g(45, 58, 5).d('T', 48).d('f', 52).o('plate', 56, 0, { grp: 1, n: 'II' }).c(46, 54, 3);
    b.s('ecobridge', 59, 5, 7, 1, { grp: 1, on: false }).c(59, 65, 3);
    b.g(66, 80, 5).e(72, 5).d('r', 68).d('T', 77).c(67, 79, 3);
    b.g(81, 96).o('plate', 86, 0, { grp: 2, n: 'III' }).e(91).d('f', 83).h(93, 9);
    b.s('ecobridge', 97, 11, 7, 1, { grp: 2, on: false }).p(99, 8, 2).c(97, 103, 6);
    b.g(104, 117).Gl(113).d('T', 107).d('f', 110);
  },
});
// ---------------------------------------------------------------- fuego
nivel('fuego', {
  nombre: 'La muralla en llamas', lema: 'Los piratas prendieron la ciudad: apaga las brasas para cruzar.',
  foe: 'salamandra', power: 'agua', plat: { k: 'hot', look: 'basalto', amp: 0 }, W: 120,
  skin: { plat: '#6a3a1a', plat2: '#4a2810', line: '#1a0e08', accent: '#ff7a2a', foe: { main: '#ff7a2a', dark: '#1a0e08', light: '#ffd23a', accent: '#e0306a', eye: '#ffd23a' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('brasas', 13, 13, { x2: 20 }).p(16, 10, 2).c(14, 19, 8);
    b.g(21, 36).e(27).e(33).o('geiser', 30).d('f', 23).d('T', 35).c(22, 28, 9);
    b.o('brasas', 37, 13, { x2: 46 }).p(38, 9, 3, { amp: 14, sp: .9 }).p(43, 9, 3, { amp: 14, sp: .9, ph: 2 }).c(38, 45, 6);
    b.g(47, 62).e(52).o('geiser', 56).o('geiser', 59, 0, { off: 1.5 }).d('r', 49).d('T', 61).c(48, 54, 9);
    b.o('brasas', 63, 13, { x2: 74 }).p(65, 9, 2).p(70, 8, 2).c(64, 73, 6);
    b.g(75, 90).e(80).e(86).h(83, 9).d('f', 77).d('T', 89);
    b.o('brasas', 91, 13, { x2: 96 }).c(91, 96, 8);
    b.g(97, 119).o('geiser', 102).Gl(113).d('r', 99).d('T', 107).d('f', 116);
  },
});
// ---------------------------------------------------------------- agua
nivel('agua', {
  nombre: 'El fondo del Golfo', lema: 'Nada hasta el ancla. Fresita te da burbujas de aire.',
  foe: 'botete', power: 'burbuja', plat: { k: 'jelly', look: 'medusa', amp: 16, sp: 1.1, pow: 360 }, W: 116,
  skin: { plat: '#eef5fb', plat2: '#a9c7e3', line: '#0b2a52', accent: '#eef5fb', foe: { main: '#eef5fb', dark: '#123f75', light: '#cfe3f6', accent: '#5f8fc0', eye: '#0b2a52' } },
  build(b) {
    b.o('water', 0, 2, { x2: 115 });
    b.g(0, 14).P(3).d('T', 6).d('f', 10).d('r', 13);
    b.g(15, 26, 10).e(20, 7).d('T', 18).d('f', 24).c(16, 25, 7);
    b.g(27, 30, 4).o('respiro', 25).p(32, 8, 3).c(31, 34, 5);
    b.g(36, 58, 12).isl(36, 58, 0, 5).o('corriente', 36, 6, { x2: 58, y2: 11, v: -60 }).e(44, 9).e(52, 8).c(38, 56, 9);
    b.o('respiro', 47, 6).g(59, 70, 9).d('T', 62).d('r', 68).c(60, 69, 7);
    b.p(73, 10, 3, { ph: 1 }).p(78, 9, 3, { ph: 2.5 }).c(72, 80, 5);
    b.g(82, 96, 11).isl(86, 92, 3, 4).e(89, 9).o('respiro', 84).h(94, 9).d('f', 83).d('T', 95);
    b.o('corriente', 97, 4, { x2: 103, y2: 11, v: 45 }).c(97, 103, 8);
    b.g(104, 115).Gl(111).d('r', 106).d('f', 109);
  },
});
// ---------------------------------------------------------------- hielo
nivel('hielo', {
  nombre: 'El día que nevó en Campeche', lema: 'Todo resbala, los carámbanos caen y el mar está helado.',
  foe: 'carambano', power: 'tempano', iceGround: true, plat: { k: 'crack', look: 'papelhielo' }, W: 120,
  skin: { plat: '#bcd7ea', plat2: '#8fb8d6', line: '#5a6a8a', accent: '#ffffff', foe: { main: '#ffffff', dark: '#2a3a5a', light: '#bcd7ea', accent: '#d9443a', eye: '#2a3a5a' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('mar', 13, 12, { x2: 20 }).c(14, 19, 9);
    b.g(21, 38).isl(26, 32, 5).e(27, 7).e(30, 7).d('f', 23).d('T', 36).c(26, 32, 9);
    b.o('mar', 39, 12, { x2: 50 }).p(41, 9, 3).p(46, 8, 3).c(41, 48, 6);
    b.g(51, 66).isl(55, 62, 5).e(56, 7).e(59, 7).e(61, 7).d('r', 53).d('T', 65).c(55, 62, 9);
    b.o('mar', 67, 12, { x2: 78 }).p(71, 9, 2).c(68, 77, 8);
    b.g(79, 95).isl(84, 88, 6).e(85, 8).h(92, 9).d('f', 81).d('T', 94);
    b.o('mar', 96, 12, { x2: 101 }).c(96, 101, 9);
    b.g(102, 119).Gl(114).d('r', 105).d('T', 109).d('f', 117);
  },
});
// ---------------------------------------------------------------- cielo
nivel('cielo', {
  nombre: 'El cielo de los mayas', lema: 'Poca gravedad, meteoros de paso y estrellas para tender caminos.',
  foe: 'escorpion', power: 'constelacion', grav: .5, jumpK: .74, plat: { k: 'cycle', look: 'meteoro', span: 150, sp: 24 }, W: 118,
  skin: { plat: '#16244d', plat2: '#0b1430', line: '#e2c06e', accent: '#e2c06e', foe: { main: '#14224a', dark: '#0b1430', light: '#efe3c2', accent: '#e2c06e', eye: '#fff3c4' } },
  build(b) {
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('estrella', 12, 9).o('estrella', 23, 9).c(14, 21, 7);
    b.g(23, 38).e(28).e(34).d('f', 25).d('T', 31).c(26, 36, 8);
    b.p(40, 9, 3, { ph: 0 }).p(40, 7, 3, { ph: 75 }).c(41, 50, 5);
    b.g(53, 64, 7).d('r', 56).d('T', 61).c(54, 63, 5).o('estrella', 64, 5);
    b.o('estrella', 71, 4).o('estrella', 79, 5).c(66, 78, 2);
    b.g(79, 92).e(84).e(89).h(86, 8).d('f', 81);
    b.p(94, 9, 3, { span: 110, sp: 20 }).o('estrella', 92, 7).o('estrella', 101, 7).c(94, 100, 6);
    b.g(101, 117).Gl(112).d('T', 105).d('r', 109).d('f', 115);
  },
});
// ---------------------------------------------------------------- hollin
nivel('hollin', {
  nombre: 'Campeche bajo la ceniza', lema: 'Las criaturas no ven: oyen. Agáchate en los escondites (↓).',
  foe: 'perro', power: 'bengala', plat: { k: 'static', look: 'tablon' }, W: 124,
  skin: { plat: '#08080a', plat2: '#2a2a2e', line: '#08080a', accent: '#ff3030', foe: { main: '#060608', dark: '#060608', light: '#2a2a2e', accent: '#ff3030', eye: '#ff3030' } },
  build(b) {
    b.o('ruido', 0, 0);
    b.g(0, 14).P(3).d('T', 7).o('escondite', 10, 0, { x2: 12 });
    b.g(15, 40).o('escondite', 19, 0, { x2: 22, kind: 'auto' }).e(27).o('escondite', 31, 0, { x2: 33 }).d('r', 36).c(24, 30, 9);
    b.p(42, 10, 2, { k: 'creak' }).p(46, 9, 2, { k: 'creak' }).c(42, 47, 7);
    b.g(49, 72).o('escondite', 52, 0, { x2: 54 }).e(57).o('escondite', 61, 0, { x2: 64, kind: 'auto' }).e(67).o('escondite', 69, 0, { x2: 71 }).d('T', 59).c(55, 70, 9);
    b.g(73, 76, 8).g(77, 90).o('escondite', 79, 0, { x2: 81, kind: 'auto' }).e(85).h(88, 9).d('r', 83);
    b.p(92, 10, 2, { k: 'creak' }).p(96, 9, 2, { k: 'creak' }).p(100, 10, 2, { k: 'creak' }).c(92, 101, 7);
    b.g(103, 123).o('escondite', 106, 0, { x2: 108 }).e(112).Gl(119).d('T', 115);
  },
});
// ---------------------------------------------------------------- 8 bits
nivel('bits8', {
  nombre: 'Campeche 1-1', lema: 'Elevadores que no paran y canisteles que se vuelven ladrillos.',
  foe: 'chapulin', power: 'ladrillo', plat: { k: 'lift', look: 'ladrillo8', sp: 30 }, W: 120,
  skin: { plat: '#c84c0c', plat2: '#000000', line: '#000000', accent: '#fc9838', foe: { main: '#00a800', dark: '#005800', light: '#b8f818', accent: '#f83800', eye: '#ffffff' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 7).d('f', 10);
    b.c(16, 16, 10).c(19, 19, 10).c(15, 20, 7);
    b.g(22, 36).e(27).e(32).d('r', 24).d('T', 30).c(34, 34, 9).c(35, 35, 7);
    b.g(37, 50, 5).e(44, 5).d('f', 39).d('T', 48).c(40, 49, 3);
    b.g(51, 56).p(58, 12, 2, { y0: 0 }).p(61, 6, 2).p(64, 0, 2).c(57, 66, 4);
    b.g(67, 82).e(71).e(78).h(75, 9).d('r', 69).d('T', 80);
    b.c(85, 85, 9).c(88, 88, 8).c(91, 91, 9).c(84, 92, 5);
    b.g(94, 119).e(100).Gl(114).d('f', 97).d('T', 106).d('r', 110);
  },
});
// ---------------------------------------------------------------- 32 bits
nivel('bits32', {
  nombre: 'La noche del baluarte', lema: 'Enciende las antorchas: a su luz aparecen las losas fantasmales.',
  foe: 'pirata', power: 'antorcha', plat: { k: 'swing', look: 'candil', len: 4, amp: .7, sp: 1.3 }, W: 120,
  skin: { plat: '#463848', plat2: '#2e2436', line: '#1c1626', accent: '#ffd04a', foe: { main: '#efe6d0', dark: '#1c1626', light: '#efe6d0', accent: '#b8203a', eye: '#ffd04a' } },
  build(b) {
    const G = { k: 'ghost', look: 'espectral' };
    b.g(0, 12).P(3).d('T', 5).o('antorcha', 8, 0, { lit: true });
    b.o('antorcha', 11).p(15, 9, 3, G).p(20, 8, 3, G).c(15, 22, 6);
    b.g(25, 40).e(30).e(37).o('antorcha', 27).d('r', 33).c(26, 39, 9);
    b.p(43, 7, 3).p(49, 7, 3, { ph: 2 }).c(42, 52, 5);
    b.g(54, 68).e(60).o('antorcha', 66).d('T', 57).c(55, 64, 9);
    b.p(70, 9, 3, G).p(74, 8, 2, G).g(77, 77, 9).o('antorcha', 77).p(80, 9, 3, G).c(70, 82, 6);
    b.g(84, 99).e(88).e(95).h(91, 9).d('r', 86).o('antorcha', 97);
    b.p(102, 7, 3, { len: 5, amp: .6 }).c(101, 105, 4);
    b.g(107, 119).Gl(114).o('antorcha', 110, 0, { lit: true }).d('T', 117);
  },
});
// ---------------------------------------------------------------- 64 bits
nivel('bits64', {
  nombre: 'La selva de Calakmul', lema: 'Flores que solo abren con Fresita cerca, y ella puede cargarte.',
  foe: 'mono', power: 'cargar', plat: { k: 'bloom', look: 'flor' }, W: 120,
  skin: { plat: '#f07aa8', plat2: '#ffb0d0', line: '#2f6a3a', accent: '#ffe070', foe: { main: '#7a5a3a', dark: '#3a2414', light: '#d8b890', accent: '#ffe070', eye: '#111111' } },
  build(b) {
    b.g(0, 13).P(3).d('T', 7).d('f', 11);
    b.p(16, 9, 3).p(21, 8, 3).c(16, 23, 6);
    b.g(25, 40).isl(33, 36, 7).e(34, 7).d('r', 28).d('f', 38).c(26, 31, 9);
    b.g(41, 52, 4).c(42, 51, 2).d('T', 47).d('f', 43);
    b.p(56, 6, 3).c(53, 61, 3);
    b.g(62, 76, 9).e(68, 9).d('T', 64).d('f', 73).c(63, 75, 7);
    b.p(79, 9, 3).p(84, 8, 3).p(89, 9, 3).c(78, 91, 6);
    b.g(92, 105).e(97).h(100, 9).isl(102, 104, 6).e(103, 6).d('r', 94);
    b.g(106, 119).Gl(114).d('T', 109).d('f', 117);
  },
});

// ---------------------------------------------------------------- fauna
// Cada mundo tiene su enemigo principal y dos compañeros que se turnan en
// los lugares de enemigo (mismo tipo de lugar: suelo o aire). Se dibujan
// con los colores del mundo, así que cada uno se ve propio de ese arte.
const FAUNA = {
  pixel: ['tortuga', 'rana'], acuarela: ['cangrejo', 'culebra'], sumie: ['rana', 'jaguar'], neon: ['automata', 'escarabajo'], bruma: ['calavera', 'jaguar'],
  lowpoly: ['escarabajo', 'rana'], codex: ['culebra', 'iguana'], vitral: ['tortuga', 'iguana'], cuaderno: ['calavera', 'chapulin'], grabado: ['culebra', 'jabali'],
 deco: ['escarabajo', 'jaguar'], cinema: ['jabali', 'escorpion'], barro: ['rana', 'tortuga'], eco: ['rana', 'escarabajo'],
  fuego: ['iguana', 'escorpion'], cielo: ['jaguar', 'tortuga'], hollin: ['jabali'], bits8: ['cangrejo', 'tortuga'], bits32: ['calavera', 'alux'],
  ocaso: ['zopilote', 'buho'], paper: ['abeja', 'murcielago'], biolum: ['murcielago', 'buho'], flat: ['pelicano', 'murcielago'], oleo: ['murcielago', 'cocuyo'],
  anime: ['zopilote', 'avispa'], nouveau: ['avispa', 'cocuyo'], cyber: ['murcielago', 'avispa'], agua: ['cocuyo'],
};
for (const [id, extra] of Object.entries(FAUNA)) if (NIVELES[id]) NIVELES[id].fauna = [NIVELES[id].foe, ...extra];
