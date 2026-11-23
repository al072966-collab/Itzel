'use strict';
// =====================================================================
//  ITZEL DE CADA MUNDO, CON VIDA
//  Las ilustraciones propias de cada mundo (itzel-<mundo>-opcionN.png) se cortan en tools/itzel-mundos.py:
//  el cuerpo sin brazos y los dos brazos (mallas con codo). Aquí se animan todas con el mismo esqueleto:
//    - el cuerpo se pinta por renglones: la falda se mece, se abre al correr y se alza al saltar o caer; el tronco
//      respira e inclina; el pelo de arriba rebota y se queda atrás al correr
//    - los brazos se balancean contra las piernas y en el aire se abren con los codos doblados
//    - las piernas pasan bajo la falda; si la falda se alza, el muslo sigue a la pierna
//  En reposo se ve igual que la ilustración. Medidas en pixeles del dibujo original.
//  Va después de itzel-renovada.js (reemplaza a las Itzel de piernas sueltas que ahí se instalan).
// =====================================================================
(() => {
  if (!window.ITZEL_MUNDOS_DATOS || typeof TITERE === 'undefined') return;
  const { carga, listo, estado, muelle, suave, malla, prepara } = TITERE;
  // recorte de cada dibujo (el mismo que ya usaba cada mundo), cintura, cuello y orilla de la falda (y absoluta; lo más
  // bajo de la orilla, con su contorno: abajo de ahí solo hay piernas)
  // centro: x donde va el centro de los pies; mitad: donde se separan las piernas
  const RIG = {
    ocaso:   { sx: 220, sy: 75,  sw: 650, sh: 1245, orilla: 1108, mitad: 550, cintura: 735, cuello: 575 },
    paper:   { sx: 145, sy: 25,  sw: 790, sh: 1405, orilla: 1170, mitad: 535, cintura: 815, cuello: 625 },
    biolum:  { sx: 235, sy: 20,  sw: 700, sh: 1270, orilla: 1058, mitad: 585, cintura: 720, cuello: 520 },
    flat:    { sx: 195, sy: 100, sw: 695, sh: 1270, orilla: 1180, mitad: 550, cintura: 830, cuello: 610 },
    sumie:   { sx: 150, sy: 10,  sw: 850, sh: 1280, orilla: 1050, mitad: 650, cintura: 715, cuello: 545, centro: 670 },
    neon:    { sx: 190, sy: 30,  sw: 740, sh: 1320, orilla: 1162, mitad: 560, cintura: 735, cuello: 555 },
    bruma:   { sx: 250, sy: 30,  sw: 680, sh: 1240, orilla: 1078, mitad: 620, cintura: 720, cuello: 545 },
    lowpoly: { sx: 250, sy: 35,  sw: 680, sh: 1270, orilla: 1162, mitad: 610, cintura: 785, cuello: 585 },
    codex:   { sx: 200, sy: 50,  sw: 760, sh: 1270, orilla: 1146, mitad: 600, cintura: 785, cuello: 600 },
    pixel:   { sx: 300, sy: 150, sw: 570, sh: 990,  orilla: 968,  mitad: 570, cintura: 715, cuello: 575, duro: 1 },
  };
  const ALTO = 21;
  const pixelOriginal = imgPerezosa('../Roguelike/assets/personajes/itzel-pixel16-opcion5.png');
  function hazItzel(id, D, R) {
    const T = carga(D), M = D.mallas, BR = Object.keys(M).sort(), ESTADOS = new WeakMap();
    for (const k of BR) prepara(M[k]);
    const E = (R.duro ? 21 : ALTO) / R.sh, CX = R.centro || R.sx + R.sw / 2, PIE = R.sy + R.sh, CIN = R.cintura, CUE = R.cuello, ORI = D.orilla, FIN = D.fin, ARR = R.sy, FALDA = FIN - CIN; // la falda llega hasta FIN; las piernas empiezan en ORI
    // los brazos: 0 el de la izquierda del dibujo, 1 el de la derecha (con la mano hacia donde mira, al frente)
    const lado = k => M[k].n[0][0] < CX ? -1 : 1;
    const nuevo = () => ({ fase: Math.random() * 6, cara: 1 });
    // cómo se mueve cada renglón del cuerpo: dónde queda (y) y cuánto se corre (x). Todo es continuo, así no hay costuras
    function mapa(s) {
      const { bote, resp, inc, pelo, rebote, faldaX, faldaAbre, largo } = s.m;
      const tronco = CIN - CUE;
      const Y = y => {
        if (y >= CIN) return CIN + FALDA * largo(Math.min(1, (y - CIN) / FALDA)) + bote;
        if (y >= CUE) return CIN - (CIN - y) * (1 + resp) + bote;
        return CIN - tronco * (1 + resp) - (CUE - y) * (1 + rebote) + bote;
      };
      const X = y => {
        if (y >= CIN) return faldaX(Math.min(1, (y - CIN) / FALDA));
        return inc * (CIN - y) + (y < CUE ? pelo * Math.pow(clamp((CUE - y) / (CUE - ARR), 0, 1), 1.7) : 0);
      };
      const A = y => y >= CIN ? faldaAbre(Math.min(1, (y - CIN) / FALDA)) : 1;
      return { Y, X, A };
    }
    function renglones(c, mp, y0, y1, N) {
      const q = T.q.cuerpo, h = (y1 - y0) / N;
      for (let j = 0; j < N; j++) {
        const a = y0 + j * h, b = a + h, m = (a + b) / 2, ya = mp.Y(a), yb = mp.Y(b), dx = mp.X(m), ab = mp.A(m);
        const x0 = R.sx, w = R.sw;
        c.drawImage(T.img, q[0] + x0, q[1] + a, w, h + .5, CX + (x0 - CX) * ab + dx, ya, w * ab, yb - ya + .8);
      }
    }
    // cada pierna gira desde arriba, justo bajo la orilla: arriba casi no se mueve (así no se separa de lo que la
    // falda deja ver entre sus ondas) y el pie sí da el paso
    const CADERA = 10;
    function pierna(c, x0, x1, ang, dy, sube) {
      if (R.duro && pixelOriginal.complete && pixelOriginal.naturalWidth) {
        // Tomar cada pierna completa desde la ilustración original, incluida
        // la parte que asoma bajo la falda. Así no aparece un corte en el
        // tobillo ni se estira una fila de píxeles para inventar el muslo.
        const top=950, h=PIE-top, giro=ang*.35;
        c.save();c.translate((x0+x1)/2,top);c.rotate(giro);c.translate(-(x0+x1)/2,-top);
        c.drawImage(pixelOriginal,x0,top,x1-x0,h,x0,top,x1-x0,h);c.restore();
        return;
      }
      const q = T.q.piernas, top = ORI, h = PIE - top, cx = (x0 + x1) / 2, py = top - CADERA, sy = y => q[1] + y - q[5];
      c.save(); c.translate(cx, py + dy); c.rotate(ang); c.translate(-cx, -py);
      // el muslo: el primer renglón de la pierna se estira hacia arriba, escondido bajo la falda; si la falda se alza, se ve
      const alto = sube + 30; if (!R.duro) c.drawImage(T.img, q[0] + x0, sy(top + 3), x1 - x0, 6, x0, top - alto, x1 - x0, alto + 3);
      c.drawImage(T.img, q[0] + x0, sy(top), x1 - x0, h, x0, top, x1 - x0, h);
      c.restore();
    }
    function brazo(c, k, mp, ang, ang2) {
      const m = M[k], p0 = m.n[0], ox = mp.X(p0[1]), oy = mp.Y(p0[1]) - p0[1], h = [p0[0] + ox, p0[1] + oy], Q = [h];
      let x = h[0], y = h[1], d = 0;
      for (let i = 1; i < m.n.length; i++) {
        const ax = m.n[i][0] - m.n[i - 1][0], ay = m.n[i][1] - m.n[i - 1][1], l = Math.hypot(ax, ay), u = clamp((d + l / 2 - m.codo + 30) / 60, 0, 1), b = ang + ang2 * u * u * (3 - 2 * u), sb = Math.sin(b), cb = Math.cos(b);
        d += l; x += ax * cb - ay * sb; y += ax * sb + ay * cb; Q.push([x, y]);
      }
      malla(c, T, k, m, Q);
    }
    function arma(c, p, f, s) {
      const t = f.t || 0, dt = s.dt, g = f.g, env = g && g.env, vx = p.vx || 0, vy = p.vy || 0, sp = Math.abs(vx);
      const nada = !!(env && env.swim), aire = p.on === false && !nada, gana = !!(g && g.win), agacha = !!p.crouch;
      const corre = suave(s, 'kc', !aire && !nada ? clamp(sp / 118, 0, 1) : 0, 13), kAire = suave(s, 'ka', aire ? 1 : 0, 14), sube = suave(s, 'ks', clamp(-vy / 330, -1, 1), 10), kNada = suave(s, 'kn', nada ? 1 : 0, 6), kAg = suave(s, 'kg', agacha ? 1 : 0, 12), kGana = suave(s, 'kw', gana ? 1 : 0, 7);
      const ph = p.run !== undefined && corre > .02 ? p.run : (s.fase += sp * dt * .09), paso = Math.sin(ph) * corre, resp = Math.sin(t * 2.1), mece = Math.sin(t * 1.3);
      const local = vx * (p.face || 1);
      // ---- tronco: bota con cada paso, respira en reposo, se inclina al correr; al caer se aplasta un poco
      const cae = suave(s, 'kl', !aire ? Math.max(0, p.sq || 0) : 0, 22);
      const bote = -Math.abs(Math.sin(ph)) * 26 * corre + Math.cos(ph * 2) * 4 * corre + resp * 3 * (1 - corre) * (1 - kAire) + cae * 60 + kAg * 40 - (gana ? Math.abs(Math.sin(t * 7)) * 40 : 0);
      const inc = muelle(s, 'inc', corre * .06 + kAire * (sube > 0 ? -.03 : .04) + kNada * .1 + kAg * .08 + mece * .006 * (1 - corre), 90, 12);
      const respira = resp * .009 * (1 - corre) * (1 - kAire) - cae * .05;
      // ---- pelo: rebota con el paso y se queda atrás al correr; al caer se levanta y al subir se asienta
      const pelo = muelle(s, 'pelo', -clamp(local / 132, -1.2, 1.4) * 26 + mece * 5 * (1 - corre) + Math.cos(ph * 2 - .9) * 7 * corre, 70, 7);
      const rebote = muelle(s, 'reb', Math.cos(ph * 2 - 1.1) * .018 * corre + kAire * clamp(vy / 430, -1, 1) * .03 + Math.sin(t * 1.7) * .004 * (1 - corre), 120, 9);
      // ---- falda: se queda atrás al correr y ondula con el paso; en el aire se alza según la caída (se satura
      // en campana) y al subir se cierra contra las piernas; al aterrizar rebota
      s.tAire = aire ? (s.tAire || 0) + dt : 0;
      const cae2 = kAire * clamp(vy / 430, 0, 1.3) * (.5 + .5 * clamp(s.tAire / .55, 0, 1)), sube2 = kAire * clamp(-vy / 430, 0, 1.4);
      const infla = 1 - Math.exp(-cae2 * 1.35), lleva = suave(s, 'lv', clamp(sp / 140, 0, 1), 8);
      const vuelo = muelle(s, 'vue', -lleva * 26 - kAire * clamp(local / 132, -1, 1) * 22, 46, 6);
      const abre = muelle(s, 'abr', .035 * corre + infla * .34 - sube2 * .1 + kNada * .15 - cae * .05, 44, 7);
      const alza = muelle(s, 'alz', infla * .26 - sube2 * .04, 46, 7.5), estira = muelle(s, 'est', 1 + sube2 * .06 - infla * .04 + cae * .03, 60, 7.5);
      const aleteo = kAire * (6 + infla * 22 + sube2 * 8) + kNada * 8;
      const faldaX = u => vuelo * u * u + Math.sin(ph - .6 - u * 2.4) * u * u * 11 * corre + Math.sin(t * (2.2 + kAire * 6) - u * 3.4) * u * u * (3 + aleteo);
      const faldaAbre = u => 1 + abre * u + Math.sin(t * (1.9 + kAire * 9) - u * 4) * u * (.006 + kAire * .02 + infla * .03);
      const largo = v => v * estira - clamp(alza, -.04, .3) * v * v;
      s.m = { bote, resp: respira, inc, pelo, rebote, faldaX, faldaAbre, largo };
      const mp = mapa(s), sube3 = Math.max(0, FIN - (mp.Y(FIN) - bote)); // cuánto se alzó la orilla
      // ---- piernas (detrás de la falda): la de adelante con el brazo de atrás
      // ---- piernas (detrás de la falda): giran desde la cadera, contrarias a los brazos; el pie que va al frente se
      // levanta un poco. En el aire, la de adelante sube la rodilla y la otra se queda atrás
      const anda = suave(s, 'and', corre, 10), piso = 1 - kAire;
      const pasoPie=R.duro?.12:.3, airePie=R.duro?.35:1;
      const aD = -paso * pasoPie - kAire * (sube > 0 ? .26 : .12)*airePie + kNada * Math.sin(t * 8) * .25, aI = paso * pasoPie + kAire * (sube > 0 ? .14 : .2)*airePie - kNada * Math.sin(t * 8) * .25;
      const yD = (-Math.max(0, Math.cos(ph)) * 18 * anda * piso - kAire * (sube > 0 ? 40 : 14))*airePie + bote * .3, yI = (-Math.max(0, -Math.cos(ph)) * 18 * anda * piso - kAire * (sube > 0 ? 10 : 22))*airePie + bote * .3;
      pierna(c, R.sx, R.mitad, aI, yI, sube3);
      pierna(c, R.mitad, R.sx + R.sw, aD, yD, sube3);
      // ---- cuerpo por renglones: de arriba al cuello, tronco y falda
      renglones(c, mp, ARR, CUE, 40); renglones(c, mp, CUE, CIN, 22); renglones(c, mp, CIN, R.duro && pixelOriginal.complete && pixelOriginal.naturalWidth ? 950 : FIN, 32);
      // El ojo del sprite de 16 bits parpadea en la misma posición del
      // rostro deformado, sin dejar el ojo abierto visible por debajo.
      if (id === 'pixel' && (t % 3.2) < .22) {
        const y=mp.Y(425), x=mp.X(460); c.save();c.translate(x,y-425);
        c.fillStyle='#ed8d47';c.fillRect(597,425,37,70);
        c.fillStyle='#211015';c.fillRect(596,458,40,8);c.restore();
      }
      // ---- brazos: se balancean contra las piernas (llegan un poco tarde); en el aire se abren con los codos doblados
      const fr = Math.sin(ph + .25) * corre;
      for (const k of BR) {
        const l = lado(k), adelante = l < 0 ? fr : -fr;
        // adelante es +x en el dibujo: girar hacia adelante es ángulo negativo; el codo dobla hacia el frente
        let a = -adelante * .34 - (mece * .02 + resp * .012) * l * (1 - corre), b = -(.12 + .3 * Math.max(0, adelante)) * corre;
        if (kAire > .01) { const u = (sube + 1) / 2, ale = Math.sin(t * 11 + l) * .05 * (1 - u); a = lerp(a, -l * lerp(.42, .56, u) + ale, kAire); b = lerp(b, -l * lerp(.5, .42, u), kAire); }
        if (kNada > .01) { const br = Math.sin(t * 4.4 + (l > 0 ? 0 : 1.6)); a = lerp(a, -l * (1 + br * .6), kNada); }
        a = lerp(a, -l * (2.2 + Math.sin(t * 8) * .2), kGana); a -= cae * .3 * l;
        a = muelle(s, 'a' + k, a, 90, 15); b = muelle(s, 'b' + k, b, 70, 13);
        brazo(c, k, mp, a, b);
      }
    }
    function dibuja(c, p, f) {
      const s = estado(p, f, nuevo, ESTADOS), sq = p.sq || 0, cara = p.face || 1;
      c.save();
      c.translate(p.x, p.y);
      c.scale((cara < 0 ? -1 : 1) * E * (1 + Math.min(0, sq) * .3), E * (1 - Math.min(0, sq) * .3));
      c.translate(-CX, -PIE);
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      arma(c, p, f, s);
      c.restore();
    }
    return { T, dibuja };
  }
  const HECHAS = {}, IMAGENES = {};
  for (const id of Object.keys(RIG)) {
    const D = ITZEL_MUNDOS_DATOS[id]; if (!D || !STYLE_MAP[id]) continue;
    const it = hazItzel(id, D, RIG[id]), anterior = STYLE_MAP[id].player;
    IMAGENES[id] = it.T.img;
    HECHAS[id] = function itzelConVida(c, p, f) { if (!listo(it.T)) return anterior(c, p, f); it.dibuja(c, p, f); };
  }
  window.ITZEL_CON_VIDA = HECHAS;
  window.precargaItzelMundo = id => { const img = IMAGENES[id]; if (img && img.pide) img.pide(); };
  function instalar(id) { if (HECHAS[id] && STYLE_MAP[id]) STYLE_MAP[id].player = HECHAS[id]; }
  for (const id of Object.keys(HECHAS)) instalar(id);
  GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const nombre = previo(id, k); instalar(id); return nombre; });
})();
