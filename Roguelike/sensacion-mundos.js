'use strict';
// =====================================================================
//  SENSACIÓN DE CADA MUNDO: cómo se mueve Itzel según el lugar.
//  Cada mundo tiene su perfil de movimiento (solo multiplicadores):
//    grav   · gravedad (<1 = más flotante)        jumpK · fuerza del salto
//    accK   · aceleración al empezar a correr     frK   · fricción al soltar la tecla
//    maxK   · velocidad máxima (todos en 1: más velocidad hacía fallar los saltos precisos)
//  Regla de diseño: ningún perfil REDUCE el alcance del salto ni la velocidad
//  máxima respecto al mundo de referencia (pixel), para que los niveles hechos a
//  mano sigan siendo superables; lo «pesado» o «resbaloso» se logra con la
//  aceleración y la fricción, no quitando alcance.
// =====================================================================
(function () {
  if (typeof NIVELES === 'undefined') return;
  const PERFIL = {
    //            grav   jumpK  accK  frK   maxK
    pixel:    [1,     1,     1,    1,    1   ],   // referencia: seco y fiel
    ocaso:    [.88,   1.02,  .9,   .8,   1   ],   // brisa del Golfo: planea un poco
    acuarela: [0.9, 1, 0.8, 0.8, 1],   // aguada: flota y arrastra
    paper:    [.8,    1,     1.1,  1,    1   ],   // papel: ligero y de giro rápido
    biolum:   [0.9, 1, 0.7, 0.6, 1],   // bosque que brilla: suave
    flat:     [1, 1, 1.4, 1.5, 1],   // vector: ágil y preciso
    sumie:    [0.9, 1, 0.6, 0.45, 1],   // tinta: trazos largos, desliza
    neon:     [1, 1, 1.6, 1.8, 1],   // neón: rápido y nervioso
    bruma:    [1, 1, 0.55, 1.2, 1],   // niebla: arranca lento, frena seco
    lowpoly:  [.95,   1,     1,    1,    1   ],
    codex:    [1, 1, 0.6, 1.6, 1],   // piedra: se planta
    oleo:     [0.85, 1, 0.65, 0.45, 1],   // remolinos: arrastra
    vitral:   [1,     1,     .9,   .85,  1   ],   // vidrio: un poco resbaloso
    cuaderno: [.9,    1,     1.2,  1.2,  1   ],   // lápiz: ágil
    grabado:  [1, 1, 0.6, 1.4, 1],   // taller: pesado al arrancar
    anime:    [.88,   1.06,  1.15, 1,    1   ],   // resortes: rebotón
    nouveau:  [.8,    1,     .8,   .7,   1   ],   // jardín: flota entre hojas
    deco:     [1, 1, 1.8, 2.4, 1],   // relojería: precisión mecánica
    cyber:    [1,     1,     1.3,  .9,   1   ],   // ciudad: veloz
    cinema:   [.95,   1,     .85,  1.1,  1   ],
    barro:    [1, 1, 0.55, 1.3, 1],   // plastilina: pesada
    fuego:    [1,     1,     1.1,  1,    1   ],
    hielo:    [1, 1, 0.5, 0.25, 1],   // nortes: resbala de verdad
    cielo:    [.75,   1,     .9,   .6,   1   ],   // cielo: casi ingrávido
    hollin:   [1,     1,     .9,   1.3,  1   ],   // sigilo: pasos controlados
    bits8:    [1, 1, 2, 2, 1],   // 8 bits: seco
    bits32:   [1,     1,     1.3,  1.3,  1   ],
    bits64:   [.95,   1,     1.1,  1.1,  1   ],
    miniatura:[.85,   1,     .9,   .9,   1   ],   // mundo diminuto: saltos largos
  };
  for (const id of Object.keys(PERFIL)) {
    const d = NIVELES[id]; if (!d || d.modo) continue;
    const [grav, jumpK, accK, frK, maxK] = PERFIL[id];
    if (grav !== 1) d.grav = d.grav || grav;
    if (jumpK !== 1) d.jumpK = d.jumpK || jumpK;
    if (accK !== 1) d.accK = accK;
    if (frK !== 1) d.frK = frK;
    if (maxK !== 1) d.maxK = maxK;
  }
  window.SENSACION_MUNDOS = PERFIL;
})();
