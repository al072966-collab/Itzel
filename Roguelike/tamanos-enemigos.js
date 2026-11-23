'use strict';
// =====================================================================
//  TAMAÑO DE LOS ENEMIGOS
//  Varios enemigos se veían muy chiquitos junto a Itzel. Regla general para todos los niveles: cada enemigo
//  se dibuja un poco más grande (más mientras más chico era) y su caja de golpe crece con él.
//  Solo se quedan chiquitos los que lo son a propósito (el saltamontes y sus parientes), los jefes y
//  los subjefes. El factor sale de la altura de su caja: ≤7 → ×1.7 · ≤9 → ×1.55 · ≤11 → ×1.4 · ≤13 → ×1.3 · más → ×1.15.
// =====================================================================
(function () {
  if (typeof MEC === 'undefined' || !MEC.FOE) return;
  const CHICOS_A_PROPOSITO = new Set(['chapulin', 'saltarina', 'polilla', 'carcoma', 'libelula', 'zancudo', 'mancha', 'sjCria', 'hormiga', 'rinoceronte', 'alacranMini', 'avispaMini']);
  const factor = h => h <= 7 ? 1.7 : h <= 9 ? 1.55 : h <= 11 ? 1.4 : h <= 13 ? 1.3 : 1.15;
  const ESPECIALES = { guerrero: 1.6, cocuyo: 1.15 };   // el cocuyo ya viene muy grande en su hoja: solo un poco más que su caja   // el guerrero de piedra del códice se veía muy chico junto a Itzel
  for (const k of Object.keys(MEC.FOE)) {
    const d = MEC.FOE[k];
    if (d.esc || CHICOS_A_PROPOSITO.has(k) || /^sj_/.test(k) || !d.w || !d.h) continue;
    const esc = ESPECIALES[k] || factor(d.h); d.esc = esc;
    const caja = 1 + (esc - 1) * .8;            // la caja crece un poco menos que el dibujo
    d.w = Math.round(d.w * caja); d.h = Math.round(d.h * caja);
  }
  // AJUSTE FINO (medido sobre el dibujo real de cada enemigo): los grandes se achican un poco y los chicos crecen, para que todos
  // queden en un rango parecido junto a Itzel. Factor sobre el tamaño de arriba; la caja de golpe sigue la mitad del cambio.
  const AJUSTE = { abeja: 0.97, abordador: 1.06, alacranMini: 1.06, alux: 1.03, aplastador: 1.11, automata: 1.1, avispa: 0.92, avispaMini: 1.08, babosa: 0.91, bailarin: 1.21, bailarina: 1.1, bestia: 1.01, bocina: 1.03, botete: 1.06, bucanero: 1.14, buho: 1.05, calavera: 1.01, campana: 1.01, cangrejo: 0.88, carambano: 1.14, carcoma: 1.6, carpintero: 1.06, catrin: 1.01, centinela: 1.12, chapulin: 1.29, charran: 0.91, cocuyo: 1.03, cometa: 0.95, conejo: 1.12, contramaestre: 1.03, cuadrito: 0.99, cucu: 1.04, cuervo: 0.89, cuervoCeniza: 0.97, culebra: 0.88, diablito: 1.01, dron: 0.95, erizo: 0.87, erizoTinta: 0.9, escarabajo: 0.95, escorpion: 0.92, escribano: 1.15, esporin: 0.99, fantasma: 1.03, foca: 0.95, fragata: 0.88, garabato: 0.94, gargola: 0.87, garza: 1.01, gaviota: 0.93, geoda: 0.97, goma: 0.99, grulla: 0.91, grumo: 0.94, guardia: 1.06, guerrero: 0.83, hadita: 0.96, halcon: 0.92, hormiga: 1.12, iguana: 0.83, incendiario: 1.07, invasor: 0.98, jabali: 0.88, jaguar: 0.85, koi: 0.95, libelula: 1.6, loro: 0.92, magma: 1.04, mancha: 1.47, medusa: 1.05, mono: 1.0, morena: 0.99, muneco: 1.01, murcielago: 0.96, nahual: 0.96, nauyaca: 1.12, ollita: 0.95, oruga: 0.91, pavo: 1.06, pelicano: 0.88, perro: 0.86, pezloro: 0.96, pintador: 1.11, pirata: 1.14, polilla: 1.5, rana: 0.93, rinoceronte: 0.98, rover: 0.89, sacapuntas: 0.94, salamandra: 0.83, saltarina: 1.28, silbato: 0.94, sjCria: 1.24, soplo: 1.01, tijeras: 0.92, topon: 0.96, torito: 0.97, tortuga: 0.98, tucan: 0.92, zancudo: 1.2, zopilote: 0.85 };
  for (const k of Object.keys(AJUSTE)) {
    const d = MEC.FOE[k]; if (!d) continue;
    const f = AJUSTE[k]; d.esc = +((d.esc || 1) * f).toFixed(3);
    if (d.w && d.h) { const caja = 1 + (f - 1) * .5; d.w = Math.max(5, Math.round(d.w * caja)); d.h = Math.max(4, Math.round(d.h * caja)); }
  }
  window.AJUSTE_ENEMIGOS = AJUSTE;
  window.ESCALA_ENEMIGOS = { factor, CHICOS_A_PROPOSITO };
})();
