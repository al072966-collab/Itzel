'use strict';
// =====================================================================
//  TOWER DEFENSE · La defensa de Campeche (la invasión pirata de 1685)
//  Un plano antiguo de la ciudad visto desde arriba: los piratas bajan del
//  galeón y marchan hacia la Catedral. Son cinco oleadas con nombre, un
//  segundo desembarco y dos capitanes: Grammont y Lorencillo.
//   · Fresita arma cinco defensas con tres niveles; en el tercero se elige
//     una de dos especialidades. Clic derecho: canción de cuna.
//   · Itzel junta la pólvora, apaga los incendios y, parada junto a una
//     defensa, la hace disparar más rápido.
//  Entre oleadas se cuenta lo que pasó de verdad y se decide cuándo llega
//  la siguiente: llamarla antes de tiempo da pólvora extra.
// =====================================================================
MODOS.torres = (() => {
  const TS = 16, OY = 26, MAR = 40, MURO = MAR + 8;
  const K = '#1c1612', PAP = '#f1e2bd', ROJO = '#b0412e', JADE = '#4d8a5c', OCRE = '#d79a3d', AZUL = '#4a9eb0', VERDE = '#a8d8b0';
  const cx = c => c * TS + TS / 2, cy = r => OY + r * TS + TS / 2;
  // ---------- los caminos: el del muelle y, desde la oleada 5, el segundo desembarco ----------
  const TRAMO = [[12, 9], [12, 3], [19, 3], [19, 10], [22.5, 10]];
  const CELDAS = [[[-1.5, 2], [6, 2], [6, 9], ...TRAMO], [[-1.5, 11], [9, 11], [9, 9], ...TRAMO]];
  const hazRuta = ruta => { const pts = ruta.map(([c, r]) => [cx(c), cy(r)]), seg = []; let largo = 0; for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push([largo, d]); largo += d; } return { pts, seg, largo }; };
  const RUTAS = CELDAS.map(hazRuta);
  const enRuta = (R, s) => { s = clamp(s, 0, R.largo); for (let i = 0; i < R.seg.length; i++) { const [a, d] = R.seg[i]; if (s <= a + d) { const u = (s - a) / d; return [lerp(R.pts[i][0], R.pts[i + 1][0], u), lerp(R.pts[i][1], R.pts[i + 1][1], u), Math.sign(R.pts[i + 1][0] - R.pts[i][0]) || 1]; } } return [...R.pts[R.pts.length - 1], 1]; };
  const CAMINO = new Set();
  for (const ruta of CELDAS) for (let i = 0; i < ruta.length - 1; i++) { const [a, b] = ruta[i], [c, d] = ruta[i + 1]; for (let x = Math.round(Math.min(a, c)); x <= Math.round(Math.max(a, c)); x++) for (let y = Math.min(b, d); y <= Math.max(b, d); y++) CAMINO.add(x + ',' + y); }
  const libre = lista => lista.filter(([c, r]) => !CAMINO.has(c + ',' + r));
  const PEDESTALES = libre([[4, 3], [7, 4], [5, 6], [7, 7], [8, 8], [10, 7], [11, 4], [13, 6], [14, 2], [17, 4], [16, 7], [18, 8], [20, 5], [20, 11], [3, 1], [9, 1], [5, 10], [7, 10], [11, 11], [7, 12], [15, 5], [21, 8]]);
  const ARBOLES = libre([[4, 8], [15, 10], [22, 1], [16, 1], [3, 12], [13, 12]]);
  const ocupa = (c, r) => PEDESTALES.some(q => q[0] === c && q[1] === r) || ARBOLES.some(q => q[0] === c && q[1] === r);
  const CASAS = libre([[4, 5, 0], [5, 9, 1], [8, 6, 3], [10, 2, 4], [15, 7, 5], [14, 11, 6], [17, 11, 7], [21, 3, 0], [21, 6, 2], [12, 11, 3], [16, 3, 5], [10, 5, 2], [14, 8, 4], [17, 1, 1], [12, 1, 6], [16, 12, 0], [10, 12, 5], [20, 2, 3], [5, 12, 4], [18, 12, 2], [7, 1, 7], [14, 4, 1]]).filter(([c, r]) => !ocupa(c, r));

  // ---------- las defensas ----------
  const TIPOS = {
    lanza: { nombre: 'Cañón del baluarte', costo: 5, rango: 60, cada: 1.15, daño: 2.4, txt: 'Un golpe fuerte a un solo pirata' },
    mosquete: { nombre: 'Mosquetes de la milicia', costo: 4, rango: 46, cada: .4, daño: .6, txt: 'Disparan rápido, pero las corazas los frenan' },
    viento: { nombre: 'Campana de alarma', costo: 6, rango: 42, cada: 3.2, daño: .4, txt: 'Hace retroceder a todos los que estén cerca' },
    sueno: { nombre: 'Redes de pescador', costo: 5, rango: 44, cada: .2, daño: 0, txt: 'Frena a los piratas que pasan por ahí' },
    polvorin: { nombre: 'Polvorín', costo: 8, rango: 0, cada: 1, daño: 0, txt: 'Da pólvora al terminar cada oleada' },
  };
  const MENU = ['lanza', 'mosquete', 'viento', 'sueno', 'polvorin'];
  const RAMAS = {
    lanza: [{ id: 'culebrina', nombre: 'Culebrina', txt: 'Alcance enorme y un golpe tremendo, pero tarda en recargar' }, { id: 'metralla', nombre: 'Metralla', txt: 'Revienta al caer y le pega a todos los cercanos' }],
    mosquete: [{ id: 'tiradores', nombre: 'Tiradores', txt: 'Atraviesan las corazas y apuntan al más fuerte' }, { id: 'salva', nombre: 'Salva cerrada', txt: 'Disparan a tres piratas a la vez' }],
    viento: [{ id: 'repique', nombre: 'Repique', txt: 'Además de empujar, aturde un segundo' }, { id: 'rebato', nombre: 'Toque de rebato', txt: 'Las defensas cercanas disparan más rápido' }],
    sueno: [{ id: 'atarraya', nombre: 'Atarraya', txt: 'Frena muchísimo y alcanza más lejos' }, { id: 'anzuelos', nombre: 'Anzuelos', txt: 'Además de frenar, lastima poco a poco' }],
  };
  const costoMejora = t2 => Math.round(TIPOS[t2.tipo].costo * (t2.nivel === 1 ? 1.2 : 2));
  const PAGA = [0, 2, 3, 5]; // lo que da el polvorín al terminar una oleada, según su nivel
  function datos(t2) {
    const T2 = TIPOS[t2.tipo], n = t2.nivel, r = t2.rama, S = { rango: T2.rango * (n > 1 ? 1.12 : 1), cada: T2.cada * (n > 1 ? .85 : 1), daño: T2.daño * (n > 1 ? 1.5 : 1) };
    if (n > 2) { S.daño *= 1.3; S.cada *= .9; }
    if (r === 'culebrina') { S.rango *= 1.5; S.daño *= 2.2; S.cada *= 1.5; }
    if (r === 'metralla') S.rad = 26;
    if (r === 'atarraya') S.rango *= 1.25;
    return S;
  }

  // ---------- los piratas ----------
  const ENEM = {
    pirata: { nombre: 'pirata', vida: 5, vel: 28, botin: 1 },
    bucanero: { nombre: 'bucanero', vida: 3.5, vel: 48, botin: 1 },
    incendiario: { nombre: 'incendiario', vida: 14, vel: 20, botin: 3 },
    abordador: { nombre: 'abordador', vida: 15, vel: 23, botin: 2, coraza: .4 },
    contramaestre: { nombre: 'contramaestre', vida: 10, vel: 26, botin: 2 },
    grammont: { nombre: 'Grammont', vida: 190, vel: 14, botin: 10, jefe: true },
    lorencillo: { nombre: 'Lorencillo', vida: 420, vel: 12, botin: 0, jefe: true },
  };
  // [tipo, cuántos, cada cuánto salen, camino]
  const OLEADAS = [
    { nombre: 'Velas en el horizonte', grupos: [['pirata', 6, 1.2]] },
    { nombre: 'Los bucaneros de Isla Tris', grupos: [['pirata', 4, 1.1], ['bucanero', 5, .8]] },
    { nombre: 'Antorchas en la noche', grupos: [['bucanero', 4, .8], ['incendiario', 2, 2.2], ['pirata', 5, 1]] },
    { nombre: 'El tambor del contramaestre', grupos: [['pirata', 5, .9], ['contramaestre', 1, 1], ['bucanero', 6, .6], ['incendiario', 2, 2]] },
    { nombre: 'Segundo desembarco', aviso: '¡Otro desembarco por el sur! Protejan los dos caminos', grupos: [['pirata', 6, 1, 1], ['bucanero', 6, .7, 0], ['contramaestre', 1, 1, 1], ['incendiario', 2, 2, 1]] },
    { nombre: 'Llega Grammont', aviso: '¡Grammont desembarcó con su gente!', grupos: [['grammont', 1, 3], ['pirata', 8, .9], ['bucanero', 4, .7, 1]] },
    { nombre: 'Corazas de abordaje', grupos: [['abordador', 4, 1.6], ['pirata', 6, .8, 1], ['contramaestre', 1, 1], ['abordador', 2, 1.6, 1]] },
    { nombre: 'Por los dos frentes', grupos: [['incendiario', 3, 1.5, 1], ['abordador', 3, 1.4], ['bucanero', 8, .5, 1], ['contramaestre', 2, 2], ['abordador', 3, 1.4, 1]] },
    { nombre: 'La marea de piratas', grupos: [['bucanero', 10, .35], ['pirata', 10, .45, 1], ['abordador', 4, 1], ['incendiario', 3, 1.2, 1], ['contramaestre', 2, 1.2]] },
    { nombre: 'Lorencillo en persona', aviso: '¡Lorencillo baja de su galeón!', grupos: [['lorencillo', 1, 4], ['abordador', 4, 1.4], ['contramaestre', 2, 2, 1], ['incendiario', 3, 1.6], ['bucanero', 8, .5, 1], ['abordador', 3, 1.4, 1]] },
  ].filter((_, i) => [0, 1, 4, 5, 9].includes(i)); // cinco oleadas: lo que dura un nivel normal
  const SEGUNDO = OLEADAS.findIndex(o => o.nombre === 'Segundo desembarco') + 1; // desde ahí se usa el camino del sur
  // lo que pasó de verdad, entre oleada y oleada
  const HISTORIA = ['Campeche vivió con miedo a los piratas durante generaciones.', 'Lorencillo es el apodo de Laurens de Graaf, un pirata de origen holandés.', 'La Isla del Carmen se llamó Isla Tris y fue guarida de piratas.', 'Por estas costas también rondaron Cornelius Jol y William Parker.', 'Los piratas también saquearon haciendas cercanas, como Uayamón.', 'En 1685 Lorencillo volvió a la ciudad junto con el corsario Grammont.', 'El palo de tinte de la Laguna de Términos también atraía a los piratas.', 'En 1716 una expedición desalojó a los piratas de la Laguna de Términos.', 'Tras el ataque de 1685 se levantó el recinto amurallado.', 'El último baluarte, el de Santiago, se terminó en 1704.'];
  const FINAL = 'En la historia real, en 1685 la ciudad sí cayó: por eso se amuralló. Aquí la salvaron ustedes.';
  const ESPERA_1 = 20, ESPERA = 14;

  // «10 bucaneros, 1 contramaestre»: lo que viene en una oleada
  function quienes(O) { const cuenta = {}; for (const [tipo, n] of O.grupos) cuenta[tipo] = (cuenta[tipo] || 0) + n; return Object.entries(cuenta).map(([k, n]) => { const E = ENEM[k]; return E.jefe ? E.nombre : `${n} ${E.nombre}${n > 1 ? (/[aeiou]$/.test(E.nombre) ? 's' : 'es') : ''}`; }).join(', '); }
  function crear(def, st) {
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, cacao: 14, templo: 10, oleada: 0, fase: 'prep', cola: [], espera: ESPERA_1, salida: 0, enem: [], balas: [], trazos: [], aros: [], textos: [], tiros: [], suelto: [], menu: null, jefe: null, rapido: false, hitCiudad: 0,
      torres: PEDESTALES.map(([c, r]) => ({ c, r, x: cx(c), y: cy(r), tipo: null, nivel: 0, rama: null, cd: 0, sopla: 0, ang: 0, retro: 0, quema: 0, gastado: 0, objetivo: 'primero', ayuda: 0, rebato: 0 })),
      arboles: ARBOLES.map(([c, r], i) => ({ x: cx(c), y: cy(r), t: i * 1.3 })),
      p: { x: cx(2) + 28, y: cy(5), face: 1, run: 0, cd: 0 }, pose: poseItzel(), fre: { x: 200, y: 80, cuna: 0 }, aviso: '¡Velas en el horizonte! Armen las defensas', avisoT: 6 };
  }
  const texto = (j, x, y, txt, col = '#fff3c4') => j.textos.push({ x, y, txt, col, t: 1 });
  const aro = (j, x, y, r, col, d = .4) => j.aros.push({ x, y, r, col, t: 0, d });
  const dice = (j, txt, seg = 3) => { j.aviso = txt; j.avisoT = seg; };
  function ganaPolvora(j, n, x, y) { j.cacao += n; if (n && x !== undefined) texto(j, x, y, `+${n} de pólvora`, '#ffd98a'); }
  function pega(j, e, d, arma) {
    const E = ENEM[e.tipo]; if (E.coraza && arma !== 'perfora' && arma !== 'bala') d *= E.coraza;
    e.vida -= d; e.golpe = .09;
  }

  function siguienteOleada(j, antes) {
    if (antes > 0) { const extra = Math.ceil(antes / 3); ganaPolvora(j, extra, VW / 2, OY + 30); }
    const O = OLEADAS[j.oleada]; j.oleada++; j.fase = 'oleada'; j.salida = .4;
    j.cola = O.grupos.flatMap(([tipo, n, cada, ruta]) => Array.from({ length: n }, () => ({ tipo, cada, ruta: ruta || 0 })));
    dice(j, O.aviso || `Oleada ${j.oleada}: ${O.nombre}`, O.aviso ? 3.5 : 2.5);
  }
  function sale(j, q) {
    const E = ENEM[q.tipo], R = RUTAS[q.ruta], m = E.jefe ? 1 : 1 + (j.oleada - 1) * .3, [x, y] = enRuta(R, 0);
    const e = { tipo: q.tipo, ruta: q.ruta, s: 0, vida: E.vida * m, max: E.vida * m, vel: E.vel, x, y, dir: 1, anim: Math.random() * 3, t: 0, cd: 3 + Math.random() * 3 };
    j.enem.push(e); if (E.jefe) { j.jefe = e; j.shake = .45; aro(j, x, y, 40, ROJO, .7); }
    if (typeof ENCI !== 'undefined' && !E.jefe) ENCI.ver('enemigo:' + q.tipo);
  }
  // un tiro del galeón: se ve la mira antes de que caiga, y la defensa se queda ardiendo
  function tiroGaleon(j) {
    const blanco = j.torres.filter(q => q.tipo && !q.quema); if (!blanco.length) return;
    const t2 = blanco[Math.floor(Math.random() * blanco.length)]; j.tiros.push({ t2, t: 0, d: 1.5, x0: 15, y0: cy(2) });
  }

  // ---------- un paso del mundo (con ×2 corre dos veces; Itzel y Fresita no se aceleran) ----------
  function mundo(j, dt) {
    const p = j.p;
    for (const a of j.arboles) { a.t += dt; if (a.t > 22) { a.t = 0; j.suelto.push({ x: a.x + (Math.random() - .5) * 18, y: a.y + 10 + Math.random() * 6, vida: 16 }); } }
    for (const s of j.suelto) s.vida -= dt;
    j.suelto = j.suelto.filter(s => s.vida > 0);
    // oleadas
    if (j.fase === 'prep') { j.espera -= dt; if (j.espera <= 0) siguienteOleada(j, 0); }
    if (j.cola.length) { j.salida -= dt; if (j.salida <= 0) { const q = j.cola.shift(); sale(j, q); j.salida = q.cada; } }
    if (j.fase === 'oleada' && !j.cola.length && !j.enem.length) {
      ganaPolvora(j, 2 + Math.ceil(j.oleada / 2), VW / 2, OY + 40); for (const t2 of j.torres) if (t2.tipo === 'polvorin') { ganaPolvora(j, PAGA[t2.nivel], t2.x, t2.y - 22); aro(j, t2.x, t2.y, 20, OCRE); }
      if (j.oleada >= OLEADAS.length) { j.fase = 'fin'; j.fin = 5; chispas(j, VW - 30, cy(10), [OCRE, JADE, ROJO, '#ffffff'], 70, 150); dice(j, '¡Los piratas se fueron! Campeche está a salvo', 6); }
      else { j.fase = 'prep'; j.espera = ESPERA; }
    }
    if (j.fase === 'fin' && !j.win) { j.fin -= dt; if (Math.random() < dt * 5) chispas(j, 60 + Math.random() * (VW - 120), 50 + Math.random() * 70, [OCRE, ROJO, '#ffffff', AZUL], 26, 90); if (j.fin <= 0) j.win = j.t; }
    // los piratas avanzan por su camino
    const animo = j.enem.filter(e => e.tipo === 'contramaestre' && !e.dormido && !e.aturdido);
    for (const e of j.enem) {
      const E = ENEM[e.tipo], R = RUTAS[e.ruta]; e.anim += dt; e.t += dt; e.golpe = Math.max(0, (e.golpe || 0) - dt); e.aturdido = Math.max(0, (e.aturdido || 0) - dt); e.dormido = Math.max(0, (e.dormido || 0) - dt);
      let frena = 1, duele = 0;
      for (const t2 of j.torres) if (t2.tipo === 'sueno' && !t2.quema && Math.hypot(t2.x - e.x, t2.y - e.y) < datos(t2).rango) { frena = Math.min(frena, t2.rama === 'atarraya' ? .25 : t2.nivel > 1 ? .4 : .55); if (t2.rama === 'anzuelos') duele = .9; }
      if (E.jefe) frena = Math.max(frena, .6);
      if (duele) pega(j, e, duele * dt, 'bala');
      const apura = e.tipo !== 'contramaestre' && animo.some(q => Math.hypot(q.x - e.x, q.y - e.y) < 42) ? 1.3 : 1; e.apura = apura > 1;
      const quieto = e.aturdido || e.dormido;
      if (!quieto) { e.s += e.vel * frena * apura * dt; e.cd -= dt; }
      const [x, y, d] = enRuta(R, e.s); e.x = x; e.y = y; e.dir = d;
      // lo que sabe hacer cada quien
      if (!quieto && e.cd <= 0) {
        if (e.tipo === 'incendiario') { const t2 = j.torres.filter(q => q.tipo && !q.quema && Math.hypot(q.x - e.x, q.y - e.y) < 36)[0]; e.cd = t2 ? 6 : .5; if (t2) { t2.quema = 7; e.lanza = .3; chispas(j, t2.x, t2.y - 10, ['#ff6c2f', '#ffd27a'], 12, 50); texto(j, t2.x, t2.y - 26, '¡Se quema!', '#ffb08a'); } }
        else if (e.tipo === 'grammont') { e.cd = 8; for (let i = 0; i < 2; i++) { sale(j, { tipo: 'bucanero', ruta: e.ruta }); const n = j.enem[j.enem.length - 1]; n.s = Math.max(0, e.s - 8 - i * 10); } dice(j, 'Grammont llama a sus bucaneros', 2); }
        else if (e.tipo === 'lorencillo') { e.cd = 6; tiroGaleon(j); dice(j, '¡Fuego desde el galeón! Itzel, apaga el incendio', 2.4); }
        else e.cd = 3;
      }
      e.lanza = Math.max(0, (e.lanza || 0) - dt);
      if (e.tipo === 'bucanero' && !quieto && j.inv <= 0 && Math.hypot(e.x - p.x, e.y - p.y) < 10) { j.inv = 1; const robo = Math.min(2, j.cacao); j.cacao -= robo; if (robo) texto(j, p.x, p.y - 22, `Le robaron ${robo} de pólvora`, '#ffb08a'); }
      if (e.s >= R.largo) {
        const quita = E.jefe ? 4 : 1; j.templo -= quita; j.shake = .3; j.hitCiudad = .5; chispas(j, e.x, e.y, [ROJO, '#ffffff'], 14, 80);
        if (E.jefe) { e.s = 0; e.vida = Math.min(e.max, e.vida + e.max * .1); dice(j, `${E.nombre} saqueó la Catedral y vuelve por más`, 3); } else e.vida = -99;
        if (j.templo <= 0) { j.templo = 10; dañoModo(j); if (typeof toast === 'function') toast('¡Llegaron a la Catedral! Perdieron un corazón'); }
      }
      if (e.vida <= 0 && e.vida > -50) {
        RUN.stomps++; chispas(j, e.x, e.y - 6, ['#ffffff', OCRE], E.jefe ? 50 : 12, E.jefe ? 130 : 60); if (E.jefe) { j.jefe = null; j.shake = .5; dice(j, `¡${E.nombre} huye a su barco!`, 3); }
        const sueltos = E.botin > 1 ? Math.min(E.botin, 3) : Math.random() < .45 ? 1 : 0; for (let i = 0; i < sueltos; i++) j.suelto.push({ x: e.x + (Math.random() - .5) * 14, y: e.y + (Math.random() - .5) * 8, vida: 13 });
        if (E.botin > 3) ganaPolvora(j, E.botin, e.x, e.y - 18);
      }
    }
    j.enem = j.enem.filter(e => e.vida > 0);
    // las defensas
    for (const t2 of j.torres) {
      if (!t2.tipo) continue;
      t2.sopla = Math.max(0, t2.sopla - dt); t2.retro = Math.max(0, t2.retro - dt * 5);
      if (t2.quema) { t2.quema = Math.max(0, t2.quema - dt); if (Math.random() < dt * 8) chispas(j, t2.x + (Math.random() - .5) * 9, t2.y - 12, ['#ff6c2f', '#ffd27a', '#6a5a50'], 1, 18); continue; }
      t2.ayuda = Math.hypot(p.x - t2.x, p.y - t2.y) < 20; if (t2.tipo === 'polvorin' || t2.tipo === 'sueno') continue;
      const S = datos(t2);
      const llama = j.torres.some(q => q.rama === 'rebato' && q !== t2 && !q.quema && Math.hypot(q.x - t2.x, q.y - t2.y) < datos(q).rango);
      t2.cd -= dt * (t2.ayuda ? 1.45 : 1) * (llama ? 1.3 : 1);
      const cerca = j.enem.filter(e => Math.hypot(e.x - t2.x, e.y - t2.y) < S.rango); if (!cerca.length) continue;
      const fuerte = t2.objetivo === 'fuerte' || t2.rama === 'tiradores';
      cerca.sort(fuerte ? (a, b) => b.vida - a.vida : (a, b) => (RUTAS[a.ruta].largo - a.s) - (RUTAS[b.ruta].largo - b.s));
      const obj = cerca[0]; if (t2.tipo !== 'viento') { let da = Math.atan2(obj.y - 6 - (t2.y - 16), obj.x - t2.x) - t2.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); t2.ang += da * Math.min(1, dt * 12); }
      if (t2.cd > 0) continue; t2.cd = S.cada;
      if (t2.tipo === 'lanza') {
        const b0 = [t2.x + Math.cos(t2.ang) * 11, t2.y - 16 + Math.sin(t2.ang) * 11], d = Math.hypot(obj.x - b0[0], obj.y - b0[1]);
        j.balas.push({ x0: b0[0], y0: b0[1], x: b0[0], y: b0[1], obj, tx: obj.x, ty: obj.y - 5, u: 0, dur: clamp(d / 240, .16, .5), daño: S.daño, rad: S.rad || 0 });
        t2.retro = 1; chispas(j, b0[0], b0[1], ['#fff3c4', '#ffb35a', '#8a8078'], 5, 34);
      } else if (t2.tipo === 'mosquete') {
        t2.retro = 1;
        for (const e of cerca.slice(0, t2.rama === 'salva' ? 3 : 1)) { pega(j, e, S.daño, t2.rama === 'tiradores' ? 'perfora' : 'mosquete'); j.trazos.push({ x0: t2.x, y0: t2.y - 16, x1: e.x, y1: e.y - 7, t: .08 }); }
      } else {
        t2.sopla = .5; aro(j, t2.x, t2.y, S.rango, AZUL, .5);
        for (const e of cerca) { if (!ENEM[e.tipo].jefe) e.s = Math.max(0, e.s - 28 - t2.nivel * 5); else e.s = Math.max(0, e.s - 6); pega(j, e, S.daño, 'campana'); if (t2.rama === 'repique') e.aturdido = Math.max(e.aturdido || 0, ENEM[e.tipo].jefe ? .3 : 1); }
      }
    }
    // balas de cañón: vuelan en arco
    for (const b of j.balas) {
      b.u += dt / b.dur; if (j.enem.includes(b.obj)) { b.tx = b.obj.x; b.ty = b.obj.y - 5; }
      b.x = lerp(b.x0, b.tx, Math.min(1, b.u)); b.y = lerp(b.y0, b.ty, Math.min(1, b.u)) - Math.sin(Math.min(1, b.u) * Math.PI) * 10;
      if (b.u < 1) continue;
      if (b.rad) { aro(j, b.tx, b.ty, b.rad, '#ff9a4a', .3); chispas(j, b.tx, b.ty, ['#ffd27a', '#ff6c2f', '#3a3028'], 16, 80); for (const e of j.enem) if (Math.hypot(e.x - b.tx, e.y - 5 - b.ty) < b.rad) pega(j, e, b.daño, 'bala'); }
      else { if (j.enem.includes(b.obj)) pega(j, b.obj, b.daño, 'bala'); chispas(j, b.tx, b.ty, [K, PAP], 5, 40); }
    }
    j.balas = j.balas.filter(b => b.u < 1);
    // el galeón de Lorencillo
    for (const q of j.tiros) { q.t += dt; if (q.t >= q.d) { q.t2.quema = 8; j.shake = .25; aro(j, q.t2.x, q.t2.y, 22, '#ff9a4a', .35); chispas(j, q.t2.x, q.t2.y - 8, ['#ff6c2f', '#ffd27a', K], 22, 90); } }
    j.tiros = j.tiros.filter(q => q.t < q.d);
    for (const q of j.trazos) q.t -= dt; j.trazos = j.trazos.filter(q => q.t > 0);
    for (const q of j.aros) q.t += dt; j.aros = j.aros.filter(q => q.t < q.d);
    for (const q of j.textos) { q.t -= dt * .8; q.y -= dt * 11; } j.textos = j.textos.filter(q => q.t > 0);
    j.hitCiudad = Math.max(0, j.hitCiudad - dt);
    pasoChispas(j, dt);
  }
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt); j.avisoT = Math.max(0, (j.avisoT || 0) - dt); if (!j.avisoT) j.aviso = '';
    const p = j.p, k = teclas();
    // Itzel camina en 8 direcciones; Espacio = pisotón que aturde
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0), n = Math.hypot(dx, dy);
    if (n) { p.x = clamp(p.x + dx / n * 96 * dt, MURO + 12, VW - 6); p.y = clamp(p.y + dy / n * 96 * dt, OY + 8, VH - 4); if (dx) p.face = Math.sign(dx); p.run += dt * 18; }
    p.mov = !!n; p.cd = Math.max(0, p.cd - dt);
    if (k.space && p.cd <= 0) { p.cd = .8; j.pisa = .25; chispas(j, p.x, p.y, [OCRE, PAP], 14, 70); for (const e of j.enem) if (Math.hypot(e.x - p.x, e.y - p.y) < 26) { e.aturdido = ENEM[e.tipo].jefe ? .4 : 1.5; pega(j, e, 1, 'bala'); } }
    j.pisa = Math.max(0, (j.pisa || 0) - dt);
    // la pólvora tirada; y si pasa junto a una defensa en llamas, la apaga
    for (const s of j.suelto) if (Math.hypot(s.x - p.x, s.y - p.y) < 12) { s.vida = 0; ganaPolvora(j, 1); chispas(j, s.x, s.y, [OCRE, '#ffe9a0'], 8, 40); }
    for (const t2 of j.torres) if (t2.quema && Math.hypot(t2.x - p.x, t2.y - p.y) < 17) { t2.quema = 0; texto(j, t2.x, t2.y - 26, '¡Apagado!', VERDE); chispas(j, t2.x, t2.y - 10, ['#ffffff', '#9fd0e0'], 12, 50); }
    // Fresita: sigue al mouse; izquierdo arma, derecho duerme piratas
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    j.fre.cuna = Math.max(0, j.fre.cuna - dt);
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { if (j.fre.cuna > 0) continue; j.fre.cuna = 7; chispas(j, c.x, c.y, ['#b9a7ff', '#ffffff'], 16, 60); aro(j, c.x, c.y, 44, '#b9a7ff', .5); for (const e of j.enem) if (Math.hypot(e.x - c.x, e.y - c.y) < 44) e.dormido = ENEM[e.tipo].jefe ? 1 : 3; continue; }
      clic(j, c.x, c.y);
    }
    MOUSE.clicks.length = 0;
    mundo(j, dt); if (j.rapido) mundo(j, dt);
  }

  // ---------- los botones ----------
  const BOTON_LISTOS = { x: VW / 2, y: OY + 11, w: 124, h: 15 }, BOTON_VEL = { x: 20, y: 96, r: 11 }, BOTON_CUNA = { x: 20, y: 122, r: 9 };
  const dentro = (b, x, y) => Math.abs(x - b.x) < b.w / 2 && Math.abs(y - b.y) < b.h / 2;
  function armar(j, t2, tipo) {
    const T2 = TIPOS[tipo]; if (j.cacao < T2.costo) return falta(j, T2.nombre, T2.costo);
    j.cacao -= T2.costo; t2.gastado = T2.costo; t2.tipo = tipo; t2.nivel = 1; t2.rama = null; t2.cd = 0; chispas(j, t2.x, t2.y, [OCRE, JADE, '#ffffff'], 16, 60);
    if (typeof ENCI !== 'undefined') ENCI.ver('poder:torre');
  }
  function falta(j, nombre, costo) { if (typeof toast === 'function') toast(`Falta pólvora: ${nombre} cuesta ${costo}. ¡Itzel, junta más!`); }
  function sube(j, t2, rama) {
    const costo = costoMejora(t2); if (j.cacao < costo) return falta(j, rama ? rama.nombre : 'la mejora', costo);
    j.cacao -= costo; t2.gastado += costo; t2.nivel++; if (rama) t2.rama = rama.id; chispas(j, t2.x, t2.y - 10, ['#ffe9a0', '#ffffff'], 18, 70); aro(j, t2.x, t2.y, 20, OCRE);
  }
  function vende(j, t2) { ganaPolvora(j, Math.ceil(t2.gastado * .7), t2.x, t2.y - 22); Object.assign(t2, { tipo: null, nivel: 0, rama: null, gastado: 0, quema: 0, objetivo: 'primero' }); }
  // los botones que rodean al pedestal elegido
  function botones(j) {
    const m = j.menu; if (!m) return []; const t2 = m.t, B = [];
    if (!t2.tipo) for (const tipo of MENU) { const T2 = TIPOS[tipo]; B.push({ ico: tipo, costo: T2.costo, titulo: T2.nombre, txt: T2.txt, rango: T2.rango, hace: () => armar(j, t2, tipo) }); }
    else {
      const T2 = TIPOS[t2.tipo], costo = costoMejora(t2);
      if (t2.nivel === 1 || (t2.nivel === 2 && t2.tipo === 'polvorin')) B.push({ ico: 'sube', costo, titulo: 'Mejorar', txt: t2.tipo === 'polvorin' ? `Da ${PAGA[t2.nivel + 1]} de pólvora por oleada` : 'Más daño, más alcance y dispara más seguido', rango: t2.tipo === 'polvorin' ? 0 : T2.rango * 1.12, hace: () => sube(j, t2) });
      else if (t2.nivel === 2) for (const r of RAMAS[t2.tipo]) B.push({ ico: r.id, costo, titulo: r.nombre, txt: r.txt, hace: () => sube(j, t2, r) });
      if (t2.tipo === 'lanza' || (t2.tipo === 'mosquete' && t2.rama !== 'tiradores')) B.push({ ico: t2.objetivo === 'primero' ? 'primero' : 'fuerte', titulo: t2.objetivo === 'primero' ? 'Apunta: al más adelantado' : 'Apunta: al más fuerte', txt: 'Clic para cambiar a quién le dispara', hace: () => { t2.objetivo = t2.objetivo === 'primero' ? 'fuerte' : 'primero'; }, sigue: true });
      B.push({ ico: 'vende', paga: Math.ceil(t2.gastado * .7), titulo: 'Vender', txt: `Recupera ${Math.ceil(t2.gastado * .7)} de pólvora`, hace: () => vende(j, t2) });
    }
    const n = B.length, abajo = t2.y < OY + 56, base = abajo ? 90 : -90, sep = 44, R = 27, cen = clamp(t2.x, 16 + (n - 1) * 8, VW - 16 - (n - 1) * 8);
    B.forEach((b, i) => { const a = (base + (i - (n - 1) / 2) * sep) * Math.PI / 180; b.x = cen + Math.cos(a) * R * (n > 3 ? 1.25 : 1); b.y = t2.y - (abajo ? 0 : 6) + Math.sin(a) * R * (n > 3 ? 1.1 : 1); });
    return B;
  }
  function clic(j, x, y) {
    if (Math.hypot(x - BOTON_VEL.x, y - BOTON_VEL.y) < BOTON_VEL.r) { j.rapido = !j.rapido; return; }
    if (j.fase === 'prep' && !j.menu && dentro(BOTON_LISTOS, x, y)) { siguienteOleada(j, j.espera); return; }
    if (j.menu) {
      const b = botones(j).find(q => Math.hypot(x - q.x, y - q.y) < 11);
      if (b) { b.hace(); if (!b.sigue) j.menu = null; return; }
      j.menu = null;
    }
    const t2 = j.torres.find(q => Math.abs(q.x - x) < 10 && Math.abs(q.y - 4 - y) < 15);
    if (t2) j.menu = { t: t2 };
  }

  // ---------- el plano: lo que no se mueve se pinta una sola vez ----------
  function plano(x, f) {
    x.drawImage(paperTex(f, 'plano-campeche', '#e9d6a8', { grain: 14, blot: 18, fibers: 10 }), 0, 0, VW, VH);
    // las manzanas de la ciudad, como en los planos antiguos
    x.lineWidth = .4;
    for (let c = 4; c < 23; c += 2) for (let r = 0; r < 14; r += 2) { const px = c * TS + 2, py = OY + r * TS + 2; let hay = false; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if (CAMINO.has((c + a) + ',' + (r + b))) hay = true; if (hay) continue; x.fillStyle = hash1(c, r) > .5 ? 'rgba(190,150,96,.2)' : 'rgba(176,136,90,.14)'; x.fillRect(px, py, TS * 2 - 4, TS * 2 - 4); x.strokeStyle = 'rgba(90,62,34,.3)'; x.strokeRect(px, py, TS * 2 - 4, TS * 2 - 4); }
    x.fillStyle = 'rgba(77,138,92,.22)';
    for (let i = 0; i < 170; i++) { const a = hash1(i, 1) * VW, b = OY + hash1(i, 2) * (VH - OY); if (a < MURO + 12 || CAMINO.has(Math.floor(a / TS) + ',' + Math.floor((b - OY) / TS))) continue; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 1.5, b - 4); x.lineTo(a + 3, b); x.fill(); }
    // las casas de colores
    for (const [c, r, i] of CASAS) { const a = cx(c), b = cy(r), col = CAMP.FACHADAS[i % CAMP.FACHADAS.length]; x.fillStyle = 'rgba(28,22,18,.18)'; x.fillRect(a - 6, b + 7, 15, 2); x.fillStyle = col; x.fillRect(a - 7, b - 4, 14, 11); x.fillStyle = shade(col, .3); x.fillRect(a - 8, b - 6, 16, 2.6); x.strokeStyle = 'rgba(28,22,18,.65)'; x.lineWidth = .6; x.strokeRect(a - 7, b - 4, 14, 11); x.fillStyle = 'rgba(28,22,18,.65)'; x.fillRect(a - 1.4, b + 1, 2.8, 6); x.fillRect(a - 5, b - 1, 2, 3); x.fillRect(a + 3, b - 1, 2, 3); }
    // el camino de piedra
    x.lineCap = 'square'; x.lineJoin = 'miter';
    const linea = (w, col) => { for (const R of RUTAS) { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); R.pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); } };
    linea(16, K); linea(14, '#c8a878'); linea(10, '#d8bc8c');
    x.fillStyle = 'rgba(120,90,56,.3)'; for (let i = 0; i < 240; i++) { const a = hash1(i, 21) * VW, b = OY + hash1(i, 22) * (VH - OY); if (CAMINO.has(Math.floor(a / TS) + ',' + Math.floor((b - OY) / TS))) x.fillRect(a, b, 1.2, .8); }
    // el Golfo
    x.fillStyle = '#3f8f9a'; x.beginPath(); x.moveTo(0, OY); x.lineTo(MAR, OY); for (let y = OY; y <= VH; y += 6) x.lineTo(MAR + Math.sin(y * .2) * 2, y); x.lineTo(0, VH); x.closePath(); x.fill();
    x.fillStyle = '#8fc6c6'; x.beginPath(); x.moveTo(MAR, OY); for (let y = OY; y <= VH; y += 6) x.lineTo(MAR + Math.sin(y * .2) * 2, y); x.lineTo(MURO, VH); x.lineTo(MURO, OY); x.closePath(); x.globalAlpha = .28; x.fill(); x.globalAlpha = 1;
    x.save(); x.translate(14, 172); x.rotate(-Math.PI / 2); x.font = 'italic 8px Alegreya, Georgia, serif'; x.fillStyle = 'rgba(236,250,255,.65)'; x.textAlign = 'center'; x.fillText('Golfo de México', 0, 3); x.restore();
    // la muralla, con sus dos entradas
    const puertas = RUTAS.map(R => R.pts[0][1]);
    for (let y = OY; y < VH; y += 8) { if (puertas.some(p => Math.abs(y + 4 - p) < 12)) continue; x.fillStyle = (y / 8 | 0) % 2 ? '#c7a878' : '#b89668'; x.fillRect(MURO, y, 9, 8); x.strokeStyle = 'rgba(28,22,18,.55)'; x.lineWidth = .5; x.strokeRect(MURO, y, 9, 8); }
    for (const by of [OY + 10, cy(6.5)]) { x.fillStyle = '#d8ba8a'; x.beginPath(); x.moveTo(MURO - 6, by); x.lineTo(MURO + 4, by - 10); x.lineTo(MURO + 15, by); x.lineTo(MURO + 4, by + 10); x.closePath(); x.fill(); x.strokeStyle = K; x.lineWidth = .8; x.stroke(); x.fillStyle = '#b89464'; x.beginPath(); x.arc(MURO + 4, by, 3, 0, TAU); x.fill(); x.stroke(); }
    // la rosa de los vientos y el título del plano
    { const a = 340, b = cy(12) + 2; x.strokeStyle = 'rgba(90,62,34,.6)'; x.lineWidth = .5; x.beginPath(); x.arc(a, b, 9, 0, TAU); x.stroke(); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, l = i % 2 ? 7 : 12; x.fillStyle = i % 2 ? 'rgba(90,62,34,.5)' : 'rgba(176,65,46,.8)'; x.beginPath(); x.moveTo(a + Math.cos(an) * l, b + Math.sin(an) * l); x.lineTo(a + Math.cos(an + .3) * 2.4, b + Math.sin(an + .3) * 2.4); x.lineTo(a + Math.cos(an - .3) * 2.4, b + Math.sin(an - .3) * 2.4); x.closePath(); x.fill(); } x.font = 'bold 5px Alegreya, Georgia, serif'; x.fillStyle = 'rgba(90,62,34,.8)'; x.textAlign = 'center'; x.fillText('N', a, b - 13); }
    // la Catedral: lo que hay que defender
    const tx = VW - 28, ty = cy(10);
    x.fillStyle = 'rgba(28,22,18,.2)'; x.fillRect(tx - 18, ty + 16, 38, 3);
    x.fillStyle = '#e4d6bc'; x.fillRect(tx - 15, ty - 12, 30, 28); x.strokeStyle = K; x.lineWidth = 1; x.strokeRect(tx - 15, ty - 12, 30, 28);
    for (const s of [-1, 1]) { x.fillStyle = '#efe2c8'; x.fillRect(tx + s * 12 - 5, ty - 30, 10, 24); x.strokeRect(tx + s * 12 - 5, ty - 30, 10, 24); x.fillStyle = '#c8b28a'; x.beginPath(); x.moveTo(tx + s * 12 - 6, ty - 30); x.lineTo(tx + s * 12, ty - 37); x.lineTo(tx + s * 12 + 6, ty - 30); x.closePath(); x.fill(); x.stroke(); x.fillStyle = K; x.fillRect(tx + s * 12 - 1.5, ty - 25, 3, 6); x.beginPath(); x.moveTo(tx + s * 12, ty - 37); x.lineTo(tx + s * 12, ty - 42); x.moveTo(tx + s * 12 - 1.6, ty - 40); x.lineTo(tx + s * 12 + 1.6, ty - 40); x.stroke(); }
    x.fillStyle = '#6a4a2a'; x.beginPath(); x.moveTo(tx - 5, ty + 16); x.lineTo(tx - 5, ty + 5); x.arc(tx, ty + 5, 5, Math.PI, 0); x.lineTo(tx + 5, ty + 16); x.closePath(); x.fill(); x.stroke();
    x.textAlign = 'left'; x.setLineDash([]);
  }

  // ---------- los dibujos que se mueven ----------
  // un capitán pirata: casaca larga, tricornio con pluma y sable
  function capitan(c, e, t, casaca, galon, pluma) {
    const a = Math.sin(e.anim * 7) * 1.4, ln = K;
    c.lineWidth = .7; c.strokeStyle = ln;
    c.fillStyle = '#2a2236'; c.fillRect(-3 + a * .3, -6, 2.4, 6); c.fillRect(.8 - a * .3, -6, 2.4, 6); c.strokeRect(-3 + a * .3, -6, 2.4, 6); c.strokeRect(.8 - a * .3, -6, 2.4, 6);
    c.fillStyle = casaca; c.beginPath(); c.moveTo(-4.6, -2); c.lineTo(-3.6, -13); c.lineTo(3.6, -13); c.lineTo(4.6, -2); c.lineTo(1, -3.4); c.lineTo(-1, -3.4); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = galon; c.lineWidth = .8; c.beginPath(); c.moveTo(0, -13); c.lineTo(0, -4); c.moveTo(-3.8, -5.4); c.lineTo(-1.2, -5.4); c.moveTo(1.2, -5.4); c.lineTo(3.8, -5.4); c.stroke();
    c.fillStyle = '#c98a5e'; c.strokeStyle = ln; c.lineWidth = .6; c.beginPath(); c.arc(.3, -15.4, 2.9, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#3a2418'; c.beginPath(); c.moveTo(-2.2, -14.4); c.quadraticCurveTo(.3, -11.2, 3, -14.2); c.lineTo(3, -14.9); c.quadraticCurveTo(.5, -13.4, -2.2, -14.9); c.fill();
    c.fillStyle = ln; c.fillRect(1.2, -16.1, 1, 1.1);
    c.fillStyle = '#1e1a22'; c.beginPath(); c.moveTo(-6.4, -17); c.quadraticCurveTo(.3, -15.6, 6.8, -17); c.quadraticCurveTo(3.4, -22.4, .3, -22); c.quadraticCurveTo(-3.2, -22.4, -6.4, -17); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = galon; c.lineWidth = .5; c.beginPath(); c.moveTo(-6, -17.2); c.quadraticCurveTo(.3, -15.9, 6.4, -17.2); c.stroke();
    c.strokeStyle = pluma; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, -20.6); c.quadraticCurveTo(-7, -24.6 + Math.sin(t * 5) * .8, -9.4, -21.6); c.stroke(); c.lineCap = 'butt';
    c.strokeStyle = '#dfe4ea'; c.lineWidth = .8; c.beginPath(); c.moveTo(4, -9); c.lineTo(9.6, -14 - Math.sin(e.anim * 7) * 1.4); c.stroke(); c.strokeStyle = OCRE; c.lineWidth = 1; c.beginPath(); c.moveTo(3.2, -10.6); c.lineTo(5.2, -8); c.stroke();
  }
  const FD = MEC.FD;
  // abordador: el pirata de siempre con peto y morrión de hierro
  FD.abordador = (c, e, t, s) => {
    FD.pirata(c, e, t, s);
    c.fillStyle = '#8c96a0'; c.strokeStyle = K; c.lineWidth = .45; c.beginPath(); roundRect(c, -3.9, -11.9, 7.8, 7, 1.6); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(-2.6, -10.8, 1.6, 4.4); c.strokeStyle = 'rgba(28,22,18,.55)'; c.beginPath(); c.moveTo(0, -11.6); c.lineTo(0, -5.2); c.stroke();
    c.fillStyle = '#8c96a0'; c.strokeStyle = K; c.beginPath(); c.moveTo(-5.4, -15.4); c.quadraticCurveTo(0, -14.2, 5.4, -15.4); c.quadraticCurveTo(2.4, -21, 0, -20.6); c.quadraticCurveTo(-2.4, -21, -5.4, -15.4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-1.2, -18, .8, 1.5, .3, 0, TAU); c.fill();
  };
  // contramaestre: marca el paso con su tambor y apura a los que tiene cerca
  FD.contramaestre = (c, e, t, s) => {
    FD.pirata(c, e, t, s); const toc = Math.sin(t * 12);
    c.fillStyle = ROJO; c.strokeStyle = K; c.lineWidth = .45; c.beginPath(); roundRect(c, 1.6, -9, 7, 5, .8); c.fill(); c.stroke();
    c.fillStyle = PAP; c.beginPath(); c.ellipse(5.1, -9, 3.5, 1.1, 0, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = OCRE; c.lineWidth = .4; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(2.2 + i * 2, -8.4); c.lineTo(3.2 + i * 2, -4.6); c.moveTo(4.2 + i * 2 - 1, -8.4); c.lineTo(2.2 + i * 2, -4.6); } c.stroke();
    c.strokeStyle = '#6a4a2a'; c.lineWidth = .55; c.beginPath(); c.moveTo(3, -11.6 - toc); c.lineTo(5, -9.2 - Math.max(0, toc)); c.moveTo(7.6, -11.6 + toc); c.lineTo(5.6, -9.2 - Math.max(0, -toc)); c.stroke();
  };
  // que el libro también los pueda enseñar
  if (MEC.FOE) { MEC.FOE.abordador = { beh: 'walk', w: 11, h: 15, v: 14 }; MEC.FOE.contramaestre = { beh: 'walk', w: 11, h: 15, v: 14 }; }
  if (typeof ENEMIGO_INFO !== 'undefined') {
    ENEMIGO_INFO.abordador = ['Abordador con coraza', 'Lleva peto y morrión de hierro: los mosquetes casi no le hacen nada.', 'Usa cañones o Tiradores, que atraviesan el hierro.'];
    ENEMIGO_INFO.contramaestre = ['Contramaestre del tambor', 'Marca el paso con su tambor y los piratas cercanos corren más.', 'Tíralo primero: sin tambor, los demás vuelven a su paso.'];
  }

  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), sk = j.def.skin, t = j.t;
    ctx.drawImage(cached(f, 'plano-torres', VW, VH, x => plano(x, f)), 0, 0, VW, VH);
    if (typeof DEFENSA_DETALLES !== 'undefined') DEFENSA_DETALLES.pinta(ctx);
    // lo que se mueve del plano
    ctx.lineCap = 'butt'; ctx.setLineDash([3, 2]); ctx.lineDashOffset = -t * 6; ctx.strokeStyle = rgba(ROJO, .8); ctx.lineWidth = .9;
    RUTAS.forEach((R, i) => { if (i && j.oleada < SEGUNDO) { ctx.strokeStyle = rgba(ROJO, .25); } ctx.beginPath(); R.pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(236,250,255,.55)'; ctx.lineWidth = .6; ctx.beginPath(); for (let i = 0; i < 16; i++) { const x = 4 + hash1(i, 11) * 30, y = OY + 6 + hash1(i, 12) * (VH - OY - 12) + Math.sin(t + i) * 1.2; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 3, y - 1.6, x + 6, y); } ctx.stroke();
    // el galeón de Lorencillo
    { const bx = 15, by = cy(2) + 5 + Math.sin(t * 1.5) * 1.2; ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.moveTo(bx - 13, by - 2); ctx.lineTo(bx + 13, by - 3); ctx.lineTo(bx + 9, by + 5); ctx.lineTo(bx - 9, by + 5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = '#efe6d0'; for (const [mx, h] of [[-5, 15], [5, 18]]) { ctx.beginPath(); ctx.moveTo(bx + mx, by - 3); ctx.lineTo(bx + mx, by - h); ctx.quadraticCurveTo(bx + mx + 7, by - h * .6, bx + mx, by - 5); ctx.fill(); ctx.stroke(); } ctx.fillStyle = K; ctx.fillRect(bx + 5, by - 22, 7, 4); }
    if (j.oleada >= SEGUNDO) { const bx = 14, by = cy(11) + 7 + Math.sin(t * 1.3 + 1) * 1.2; ctx.fillStyle = '#6a3f22'; ctx.beginPath(); ctx.moveTo(bx - 10, by - 2); ctx.lineTo(bx + 10, by - 2); ctx.lineTo(bx + 7, by + 4); ctx.lineTo(bx - 7, by + 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = '#efe6d0'; ctx.beginPath(); ctx.moveTo(bx, by - 2); ctx.lineTo(bx, by - 13); ctx.quadraticCurveTo(bx + 7, by - 8, bx, by - 3); ctx.fill(); ctx.stroke(); }
    // el daño de la Catedral
    { const tx = VW - 28, ty = cy(10); if (j.hitCiudad) { ctx.fillStyle = rgba(ROJO, j.hitCiudad * .7); ctx.fillRect(tx - 17, ty - 32, 34, 50); } ctx.fillStyle = 'rgba(28,22,18,.75)'; ctx.fillRect(tx - 16, ty + 19, 32, 5); for (let i = 0; i < 10; i++) { ctx.fillStyle = i < j.templo ? (j.templo > 3 ? JADE : ROJO) : 'rgba(241,226,189,.2)'; ctx.fillRect(tx - 15 + i * 3, ty + 20, 2.4, 3); } }
    const sobre = hoverTorre(j);
    // el alcance de lo que se está viendo
    const aRango = j.menu ? j.menu.t : sobre;
    if (aRango && aRango.tipo && aRango.tipo !== 'polvorin') circulo(aRango.x, aRango.y, datos(aRango).rango);
    const ayudaB = botonBajoMouse(j); if (ayudaB && ayudaB.rango && j.menu) circulo(j.menu.t.x, j.menu.t.y, ayudaB.rango);
    function circulo(x, y, r) { ctx.fillStyle = rgba(OCRE, .1); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(OCRE, .75); ctx.setLineDash([3, 2]); ctx.lineWidth = .8; ctx.stroke(); ctx.setLineDash([]); }
    // las redes tendidas, debajo de todo
    for (const t2 of j.torres) if (t2.tipo === 'sueno') { const r = datos(t2).rango; ctx.fillStyle = rgba(AZUL, t2.quema ? .03 : .1); ctx.beginPath(); ctx.arc(t2.x, t2.y, r, 0, TAU); ctx.fill(); if (!t2.quema) { ctx.strokeStyle = rgba('#6a4a2a', .28); ctx.lineWidth = .4; ctx.beginPath(); for (let k = -r; k <= r; k += 7) { const w = Math.sqrt(r * r - k * k); ctx.moveTo(t2.x - w, t2.y + k); ctx.lineTo(t2.x + w, t2.y + k); ctx.moveTo(t2.x + k, t2.y - w); ctx.lineTo(t2.x + k, t2.y + w); } ctx.stroke(); } }
    // lo que tiene altura, de arriba a abajo
    const items = [];
    for (const a of j.arboles) items.push({ y: a.y, f: () => { ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(a.x + 2, a.y - 8, a.x, a.y - 16); ctx.stroke(); ctx.strokeStyle = JADE; ctx.lineWidth = 1.7; for (let q = 0; q < 6; q++) { const an = q / 6 * TAU + .3 + Math.sin(t + a.x) * .05; ctx.beginPath(); ctx.moveTo(a.x, a.y - 16); ctx.quadraticCurveTo(a.x + Math.cos(an) * 7, a.y - 21 + Math.sin(an) * 3, a.x + Math.cos(an) * 11, a.y - 13 + Math.sin(an) * 4); ctx.stroke(); } const lleno = clamp(a.t / 22, 0, 1); ctx.fillStyle = rgba('#5a3418', .35 + lleno * .65); ctx.fillRect(a.x + 3, a.y - 4, 5, 6); ctx.strokeStyle = K; ctx.lineWidth = .5; ctx.strokeRect(a.x + 3, a.y - 4, 5, 6); } });
    for (const s of j.suelto) items.push({ y: s.y, f: () => { if (s.vida < 3 && Math.sin(t * 20) > 0) return; const b = Math.sin(t * 4 + s.x) * .8; ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.ellipse(s.x, s.y - 3 + b, 3, 4, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .6; ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.x - 3, s.y - 4.4 + b); ctx.lineTo(s.x + 3, s.y - 4.4 + b); ctx.moveTo(s.x - 3, s.y - 1.6 + b); ctx.lineTo(s.x + 3, s.y - 1.6 + b); ctx.stroke(); ctx.fillStyle = OCRE; ctx.fillRect(s.x - 1, s.y - 7.6 + b, 2, 1); } });
    for (const t2 of j.torres) items.push({ y: t2.y + 2, f: () => torre(t2, t2 === sobre) });
    for (const e of j.enem) items.push({ y: e.y, f: () => {
      const E = ENEM[e.tipo], esc = E.jefe ? 1.75 : 1.15, quieto = e.dormido || e.aturdido;
      ctx.fillStyle = 'rgba(28,22,18,.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y + 1, E.jefe ? 12 : 8, E.jefe ? 3.4 : 2.4, 0, 0, TAU); ctx.fill();
      const FA = window.FAUNA_ARTE, conArte = FA && (E.jefe ? FA.listo('capitanT') : e.tipo === 'pirata' && FA.listo('pirataT'));
      ctx.save(); ctx.translate(e.x, e.y);
      if (conArte) {
        const n = (E.jefe ? 'capitanT' : 'pirataT') + (quieto ? 0 : Math.floor(e.anim * 5) % 2);
        const o = { h: E.jefe ? 28 : 19, voltea: e.dir < 0, rot: quieto ? -.1 : 0 };
        if (e.tipo === 'grammont') o.filtro = 'hue-rotate(200deg) saturate(.8)'; else if (quieto) o.filtro = 'saturate(.6) brightness(.85)';
        FA.pieza(ctx, n, 0, 1, o);
      } else ctx.scale(e.dir * esc, esc);
      if (conArte) {}
      else if (E.jefe) capitan(ctx, e, t, e.tipo === 'lorencillo' ? '#7a1f2a' : '#23406e', OCRE, e.tipo === 'lorencillo' ? '#f2e6c8' : ROJO);
      else FD[e.tipo](ctx, Object.assign({ st: e.dormido ? 'sleep' : 'ok', h: 10, w: 14, vy: 0 }, e), t, sk.foe);
      if (e.golpe) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-10, -26, 20, 26); ctx.globalCompositeOperation = 'source-over'; }
      ctx.restore();
      if (e.apura) { ctx.fillStyle = rgba(OCRE, .8); ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; ctx.fillText('♪', e.x - 8, e.y - 15 + Math.sin(t * 8 + e.x)); }
      if (e.vida < e.max && !E.jefe) { ctx.fillStyle = K; ctx.fillRect(e.x - 7, e.y - 21, 14, 2); ctx.fillStyle = E.coraza ? '#8c96a0' : ROJO; ctx.fillRect(e.x - 7, e.y - 21, 14 * clamp(e.vida / e.max, 0, 1), 2); }
      if (quieto) { ctx.fillStyle = '#ffffff'; ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.fillText(e.dormido ? 'z' : '*', e.x + 5, e.y - 22 + Math.sin(t * 5) * 1.2); } } });
    items.push({ y: j.p.y, f: () => {
      const p = j.p; ctx.fillStyle = 'rgba(28,22,18,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 6, 2, 0, 0, TAU); ctx.fill();
      if (j.pisa > 0) { ctx.strokeStyle = rgba(OCRE, j.pisa * 4); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(p.x, p.y, 26 * (1 - j.pisa * 2), 9 * (1 - j.pisa * 2), 0, 0, TAU); ctx.stroke(); }
      if (j.inv > 0 && Math.floor(j.inv * 14) % 2) return;
      Object.assign(j.pose, { x: p.x, y: p.y + 1, face: p.face, vx: p.mov ? 120 : 0, run: p.run, on: true }); st.player(ctx, j.pose, f); } });
    items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
    // tiros de mosquete, balas de cañón, aros y el fuego del galeón
    ctx.strokeStyle = 'rgba(255,240,190,.9)'; ctx.lineWidth = .7; ctx.beginPath(); for (const q of j.trazos) { ctx.moveTo(q.x0, q.y0); ctx.lineTo(q.x1, q.y1); } ctx.stroke();
    for (const b of j.balas) { ctx.fillStyle = 'rgba(28,22,18,.2)'; ctx.beginPath(); ctx.ellipse(lerp(b.x0, b.tx, Math.min(1, b.u)), lerp(b.y0, b.ty, Math.min(1, b.u)) + 2, 2, 1, 0, 0, TAU); ctx.fill(); ctx.fillStyle = K; ctx.beginPath(); ctx.arc(b.x, b.y, 1.9, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(b.x - 1, b.y - 1, .8, .8); }
    for (const q of j.aros) { const u = q.t / q.d; ctx.strokeStyle = rgba(q.col, 1 - u); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (.3 + u * .7), 0, TAU); ctx.stroke(); }
    for (const q of j.tiros) { const u = q.t / q.d, x = lerp(q.x0, q.t2.x, u), y = lerp(q.y0, q.t2.y - 8, u) - Math.sin(u * Math.PI) * 70; ctx.strokeStyle = rgba(ROJO, .5 + Math.sin(t * 20) * .4); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(q.t2.x, q.t2.y - 4, 12 - u * 5, 0, TAU); ctx.moveTo(q.t2.x - 15, q.t2.y - 4); ctx.lineTo(q.t2.x + 15, q.t2.y - 4); ctx.moveTo(q.t2.x, q.t2.y - 19); ctx.lineTo(q.t2.x, q.t2.y + 11); ctx.stroke(); ctx.fillStyle = K; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); }
    pintaChispas(ctx, j);
    for (const q of j.textos) { ctx.globalAlpha = Math.min(1, q.t * 2); ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(q.txt, q.x, q.y); ctx.fillStyle = q.col; ctx.fillText(q.txt, q.x, q.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: 1 }, f);
    // menú alrededor del pedestal
    const lista = botones(j);
    for (const b of lista) {
      const ok = b.costo === undefined || j.cacao >= b.costo, enc = b === lista.find(q => ayudaB && q.titulo === ayudaB.titulo);
      ctx.fillStyle = 'rgba(28,22,18,.3)'; ctx.beginPath(); ctx.arc(b.x, b.y + 1.2, 10.4, 0, TAU); ctx.fill();
      ctx.fillStyle = ok ? PAP : '#b8a888'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = enc ? OCRE : K; ctx.lineWidth = enc ? 1.6 : 1; ctx.stroke();
      ico(b.ico, b.x, b.y - (b.costo !== undefined || b.paga ? 1.5 : 0), 1.05);
      if (b.costo !== undefined || b.paga) { const txt = b.paga ? `+${b.paga}` : `${b.costo}`; ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2; ctx.strokeStyle = PAP; ctx.strokeText(txt, b.x, b.y + 8.4); ctx.fillStyle = ok ? K : ROJO; ctx.fillText(txt, b.x, b.y + 8.4); ctx.textAlign = 'left'; }
    }
    interfaz();

    function interfaz() {
      // barra de arriba
      ctx.fillStyle = 'rgba(28,22,18,.88)'; ctx.fillRect(0, 0, VW, OY - 4); ctx.fillStyle = ROJO; ctx.fillRect(0, OY - 6, VW, 2);
      ctx.font = 'bold 8.5px "Alegreya Sans", sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = OCRE; ctx.fillText(`Pólvora ${j.cacao}`, 92, 12); ctx.fillStyle = PAP; ctx.fillText(`Oleada ${Math.max(1, j.oleada)} de ${OLEADAS.length}`, 146, 12); ctx.fillStyle = j.templo > 3 ? VERDE : '#ffb08a'; ctx.fillText(`Ciudad ${j.templo}/10`, 208, 12);
      ctx.font = '6px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#e8d8b8';
      if (j.fase === 'prep' && OLEADAS[j.oleada]) ctx.fillText(`Sigue: ${OLEADAS[j.oleada].nombre}`, 92, 19);
      else if (j.fase === 'oleada') ctx.fillText(`${OLEADAS[j.oleada - 1].nombre} · faltan ${j.enem.length + j.cola.length} piratas`, 92, 19);
      // el jefe
      if (j.jefe) { const e = j.jefe, E = ENEM[e.tipo], w = 170, x = (VW - w) / 2, y = OY + 2; ctx.fillStyle = 'rgba(28,22,18,.8)'; ctx.fillRect(x - 2, y, w + 4, 13); ctx.fillStyle = '#4a1a14'; ctx.fillRect(x, y + 8, w, 3.4); ctx.fillStyle = ROJO; ctx.fillRect(x, y + 8, w * clamp(e.vida / e.max, 0, 1), 3.4); ctx.font = 'bold 6.5px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3c4'; ctx.fillText(E.nombre, VW / 2, y + 6.6); ctx.textAlign = 'left'; }
      // lista para la siguiente oleada
      if (j.fase === 'prep') {
        const b = BOTON_LISTOS, enc = dentro(b, MOUSE.x, MOUSE.y) && !j.menu, extra = Math.ceil(j.espera / 3);
        ctx.fillStyle = 'rgba(28,22,18,.3)'; ctx.fillRect(b.x - b.w / 2 + 1, b.y - b.h / 2 + 1.6, b.w, b.h); ctx.fillStyle = enc ? '#ffe4a8' : PAP; ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); ctx.strokeStyle = ROJO; ctx.lineWidth = 1.1; ctx.strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        ctx.font = 'bold 7.5px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = ROJO; ctx.fillText(`¡Que vengan! +${extra} de pólvora · ${Math.ceil(j.espera)} s`, b.x, b.y + 2.6); ctx.textAlign = 'left';
        if (HISTORIA[j.oleada]) letrero(ctx, HISTORIA[j.oleada], VW / 2, b.y + 17, '#ffffff'); // lo que pasó de verdad
      }
      if (j.aviso) letrero(ctx, j.aviso, VW / 2, j.fase === 'prep' ? OY + 41 : OY + 26, '#fff3c4');
      if (j.fase === 'fin') { ctx.fillStyle = 'rgba(28,22,18,.8)'; ctx.fillRect(40, VH / 2 - 16, VW - 80, 30); ctx.strokeStyle = OCRE; ctx.lineWidth = 1; ctx.strokeRect(40, VH / 2 - 16, VW - 80, 30); letrero(ctx, '¡Campeche resistió!', VW / 2, VH / 2 - 4, '#ffd98a'); letrero(ctx, FINAL, VW / 2, VH / 2 + 7, '#ffffff'); }
      // en el mar: velocidad y canción
      { const b = BOTON_VEL, enc = Math.hypot(MOUSE.x - b.x, MOUSE.y - b.y) < b.r; ctx.fillStyle = j.rapido ? OCRE : PAP; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.strokeStyle = enc ? '#ffffff' : K; ctx.lineWidth = 1.1; ctx.stroke(); ctx.fillStyle = K; ctx.font = 'bold 8px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(j.rapido ? '×2' : '×1', b.x, b.y + 3); ctx.textAlign = 'left'; }
      { const { x, y, r } = BOTON_CUNA, u = j.fre.cuna / 7; ctx.fillStyle = u ? '#a89ac0' : '#d8ccf0'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = 1; ctx.stroke(); if (u) { ctx.fillStyle = 'rgba(28,22,18,.45)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + u * TAU); ctx.closePath(); ctx.fill(); } ctx.fillStyle = K; ctx.font = 'bold 9px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♪', x, y + 3.4); ctx.textAlign = 'left'; }
      // lo que hace lo que se está señalando
      let tit = '', des = '';
      if (ayudaB) { tit = ayudaB.titulo + (ayudaB.costo !== undefined ? ` · ${ayudaB.costo} de pólvora` : ''); des = ayudaB.txt; }
      else if (sobre && sobre.tipo) { const T2 = TIPOS[sobre.tipo], R = RAMAS[sobre.tipo] && sobre.rama && RAMAS[sobre.tipo].find(q => q.id === sobre.rama); tit = `${R ? R.nombre : T2.nombre} · nivel ${sobre.nivel}`; des = sobre.quema ? 'En llamas: que Itzel pase junto a ella para apagarla' : R ? R.txt : T2.txt; }
      else if (sobre) { tit = 'Pedestal libre'; des = 'Clic para armar una defensa'; }
      else if (j.fase === 'prep' && !j.menu && dentro(BOTON_LISTOS, MOUSE.x, MOUSE.y)) { const O = OLEADAS[j.oleada]; tit = O.nombre; des = quienes(O); }
      else if (j.oleada === 0) { tit = 'Fresita: clic en un pedestal arma una defensa. Clic derecho: canción de cuna.'; des = 'Itzel: junta la pólvora y, junto a una defensa, la hace disparar más rápido. Espacio: pisotón.'; }
      if (tit) { const w = 300, x = (VW - w) / 2 + 6, y = VH - 25; ctx.fillStyle = 'rgba(241,226,189,.95)'; ctx.fillRect(x, y, w, 22); ctx.strokeStyle = K; ctx.lineWidth = .8; ctx.strokeRect(x, y, w, 22); ctx.font = 'bold 7.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = ROJO; ctx.textAlign = 'center'; ctx.fillText(tit, x + w / 2, y + 9); ctx.font = '7px "Alegreya Sans", sans-serif'; ctx.fillStyle = K; ctx.fillText(des, x + w / 2, y + 18); ctx.textAlign = 'left'; }
    }
    function ico(tipo, x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = K; ctx.lineWidth = .9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (tipo === 'lanza' || tipo === 'culebrina' || tipo === 'metralla') { ctx.fillStyle = K; ctx.beginPath(); roundRect(ctx, -5.4, -2.4, tipo === 'culebrina' ? 11 : 9, 3.8, 1.4); ctx.fill(); ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.arc(-1, 2.4, 2.2, 0, TAU); ctx.fill(); if (tipo === 'metralla') { ctx.fillStyle = ROJO; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(5.4, -3.6 + i * 1.6, .7, 0, TAU); ctx.fill(); } } }
      else if (tipo === 'mosquete' || tipo === 'tiradores' || tipo === 'salva') { const n = tipo === 'salva' ? 3 : tipo === 'tiradores' ? 1 : 2; for (let i = 0; i < n; i++) { const dy = (i - (n - 1) / 2) * 3; ctx.strokeStyle = K; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, dy + 1.4); ctx.lineTo(5, dy - 1.4); ctx.stroke(); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, dy + 1.4); ctx.lineTo(-1.6, dy + .5); ctx.stroke(); } if (tipo === 'tiradores') { ctx.strokeStyle = ROJO; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(3, -3, 2.2, 0, TAU); ctx.stroke(); } }
      else if (tipo === 'viento' || tipo === 'repique' || tipo === 'rebato') { ctx.fillStyle = OCRE; ctx.beginPath(); ctx.moveTo(-4.4, 3); ctx.quadraticCurveTo(-3, 2, -2.8, -2); ctx.quadraticCurveTo(0, -5.6, 2.8, -2); ctx.quadraticCurveTo(3, 2, 4.4, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = K; ctx.beginPath(); ctx.arc(0, 3.8, 1, 0, TAU); ctx.fill(); if (tipo === 'rebato') { ctx.strokeStyle = ROJO; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(0, 0, 6.2, -.8, .8); ctx.moveTo(-4.3, 4.3); ctx.arc(0, 0, 6.2, Math.PI - .8, Math.PI + .8); ctx.stroke(); } if (tipo === 'repique') { ctx.fillStyle = ROJO; ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('*', 5, -2); } }
      else if (tipo === 'sueno' || tipo === 'atarraya' || tipo === 'anzuelos') { ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = .7; ctx.beginPath(); for (let i = -4; i <= 4; i += 2) { ctx.moveTo(i, -4); ctx.lineTo(i, 4); ctx.moveTo(-4, i); ctx.lineTo(4, i); } ctx.stroke(); if (tipo === 'atarraya') { ctx.strokeStyle = AZUL; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.stroke(); } if (tipo === 'anzuelos') { ctx.strokeStyle = ROJO; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(2, -5); ctx.lineTo(2, 2); ctx.arc(.4, 2, 1.6, 0, Math.PI); ctx.stroke(); } }
      else if (tipo === 'polvorin') { ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.ellipse(0, 0, 3.8, 5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-3.6, -1.6); ctx.lineTo(3.6, -1.6); ctx.moveTo(-3.6, 1.6); ctx.lineTo(3.6, 1.6); ctx.stroke(); ctx.fillStyle = OCRE; ctx.fillRect(-1, -6, 2, 1.2); }
      else if (tipo === 'sube') { ctx.strokeStyle = JADE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 1); ctx.lineTo(0, -3.4); ctx.lineTo(4, 1); ctx.moveTo(-4, 4.4); ctx.lineTo(0, 0); ctx.lineTo(4, 4.4); ctx.stroke(); }
      else if (tipo === 'vende') { ctx.fillStyle = OCRE; ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = K; ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('$', 0, 2.5); }
      else if (tipo === 'primero') { ctx.strokeStyle = ROJO; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.moveTo(1, -3); ctx.lineTo(4, 0); ctx.lineTo(1, 3); ctx.stroke(); }
      else if (tipo === 'fuerte') { ctx.fillStyle = ROJO; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(4, -3); ctx.lineTo(3.4, 2); ctx.lineTo(0, 5); ctx.lineTo(-3.4, 2); ctx.lineTo(-4, -3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
    function torre(t2, sobre2) {
      const x = t2.x, y = t2.y, elegida = j.menu && j.menu.t === t2;
      if (!t2.tipo) { ctx.fillStyle = 'rgba(28,22,18,.2)'; ctx.fillRect(x - 7, y + 3, 16, 2); ctx.fillStyle = '#a89070'; ctx.fillRect(x - 7, y - 3, 14, 7); ctx.strokeStyle = K; ctx.lineWidth = .8; ctx.strokeRect(x - 7, y - 3, 14, 7); ctx.fillStyle = 'rgba(28,22,18,.4)'; ctx.fillRect(x - 3, y, 6, 1); ctx.fillRect(x - .5, y - 2.5, 1, 6); if (sobre2 || elegida) { ctx.strokeStyle = OCRE; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(x - 9, y - 5, 18, 11); ctx.setLineDash([]); } return; }
      const n = t2.nivel, h = 7 + n * 2, base = '#cdb48a';
      ctx.fillStyle = 'rgba(28,22,18,.25)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 4, 11, 3, 0, 0, TAU); ctx.fill();
      // el baluartito de piedra: crece con el nivel
      ctx.fillStyle = base; ctx.beginPath(); ctx.moveTo(x - 8, y + 3); ctx.lineTo(x - 7, y - h); ctx.lineTo(x + 7, y - h); ctx.lineTo(x + 8, y + 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .8; ctx.stroke();
      ctx.strokeStyle = 'rgba(90,62,34,.45)'; ctx.lineWidth = .4; ctx.beginPath(); for (let i = 1; i < 3; i++) { const yy = y - h + (h + 3) * i / 3; ctx.moveTo(x - 7.4, yy); ctx.lineTo(x + 7.4, yy); } ctx.stroke();
      ctx.fillStyle = '#e0c89a'; ctx.fillRect(x - 8, y - h - 2, 16, 2.4); ctx.strokeStyle = K; ctx.lineWidth = .7; ctx.strokeRect(x - 8, y - h - 2, 16, 2.4);
      for (let i = 0; i < n; i++) { ctx.fillStyle = OCRE; ctx.beginPath(); ctx.moveTo(x - 4 + i * 4 - 1.6, y + 1); ctx.lineTo(x - 4 + i * 4, y - 1.2); ctx.lineTo(x - 4 + i * 4 + 1.6, y + 1); ctx.closePath(); ctx.fill(); }
      const ty = y - h - 2, a = t2.ang, q = Math.cos(a) < 0 ? -1 : 1;
      if (t2.ayuda) { ctx.strokeStyle = rgba('#ffd98a', .6 + Math.sin(t * 9) * .3); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y + 3, 13, 4.4, 0, 0, TAU); ctx.stroke(); }
      if (t2.tipo === 'lanza') {
        ctx.fillStyle = '#6a4a2a'; ctx.strokeStyle = K; ctx.lineWidth = .6; ctx.fillRect(x - 4, ty - 1, 8, 2.4); ctx.strokeRect(x - 4, ty - 1, 8, 2.4);
        ctx.save(); ctx.translate(x, ty - 2.6); ctx.rotate(a); ctx.translate(-t2.retro * 2.4, 0); const largo = t2.rama === 'culebrina' ? 15 : 10 + n; ctx.fillStyle = K; ctx.beginPath(); ctx.moveTo(-4, -2.4); ctx.lineTo(largo, -1.5); ctx.lineTo(largo, 1.5); ctx.lineTo(-4, 2.4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4a4238'; ctx.fillRect(-3, -2, 3, 1); if (t2.rama === 'metralla') { ctx.fillStyle = K; ctx.beginPath(); ctx.moveTo(largo - 2, -1.5); ctx.lineTo(largo + 2.4, -3.2); ctx.lineTo(largo + 2.4, 3.2); ctx.lineTo(largo - 2, 1.5); ctx.closePath(); ctx.fill(); } ctx.restore();
        ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.arc(x, ty - .4, 2.2, 0, TAU); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .5; ctx.stroke();
      } else if (t2.tipo === 'mosquete') {
        const hombres = t2.rama === 'salva' ? 3 : 2;
        for (let i = 0; i < hombres; i++) { const hx = x + (i - (hombres - 1) / 2) * 6; ctx.fillStyle = '#28446e'; ctx.fillRect(hx - 1.6, ty - 5, 3.2, 5); ctx.fillStyle = '#c98a5e'; ctx.beginPath(); ctx.arc(hx, ty - 6.4, 1.6, 0, TAU); ctx.fill(); ctx.fillStyle = K; ctx.fillRect(hx - 2.2, ty - 8.2, 4.4, 1.2); ctx.strokeStyle = K; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(hx, ty - 4); ctx.lineTo(hx + Math.cos(a) * 7, ty - 4 + Math.sin(a) * 7); ctx.stroke(); if (t2.retro > .5) { ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(hx + Math.cos(a) * 8, ty - 4 + Math.sin(a) * 8, 1.2, 0, TAU); ctx.fill(); } }
      } else if (t2.tipo === 'viento') {
        const vaiven = t2.sopla ? Math.sin(t * 30) * .5 : 0; ctx.fillStyle = '#cdb48a'; ctx.fillRect(x - 6, ty - 14, 2.4, 14); ctx.fillRect(x + 3.6, ty - 14, 2.4, 14); ctx.strokeStyle = K; ctx.lineWidth = .6; ctx.strokeRect(x - 6, ty - 14, 2.4, 14); ctx.strokeRect(x + 3.6, ty - 14, 2.4, 14); ctx.fillStyle = '#b8966a'; ctx.beginPath(); ctx.moveTo(x - 7.4, ty - 14); ctx.lineTo(x, ty - 19); ctx.lineTo(x + 7.4, ty - 14); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.translate(x, ty - 13); ctx.rotate(vaiven); ctx.fillStyle = t2.rama === 'rebato' ? ROJO : OCRE; ctx.beginPath(); ctx.moveTo(-3.6, 8); ctx.quadraticCurveTo(-2.4, 6, -2.4, 3); ctx.quadraticCurveTo(0, -.4, 2.4, 3); ctx.quadraticCurveTo(2.4, 6, 3.6, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      } else if (t2.tipo === 'sueno') {
        ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 6, ty); ctx.lineTo(x - 6, ty - 12); ctx.moveTo(x + 6, ty); ctx.lineTo(x + 6, ty - 12); ctx.stroke();
        ctx.strokeStyle = rgba('#6a4a2a', .85); ctx.lineWidth = .4; ctx.beginPath(); for (let k = 0; k <= 4; k++) { ctx.moveTo(x - 6 + k * 3, ty - 12); ctx.quadraticCurveTo(x - 6 + k * 3, ty - 6, x - 6 + k * 3, ty - 1); } for (let k = 0; k <= 3; k++) { ctx.moveTo(x - 6, ty - 12 + k * 3.6); ctx.quadraticCurveTo(x, ty - 10 + k * 3.6, x + 6, ty - 12 + k * 3.6); } ctx.stroke();
        if (t2.rama === 'anzuelos') { ctx.strokeStyle = ROJO; ctx.lineWidth = .7; for (const k of [-3, 0, 3]) { ctx.beginPath(); ctx.arc(x + k, ty - 3, 1.1, 0, Math.PI); ctx.stroke(); } }
      } else {
        for (const [bx, by] of [[-4, 0], [4, 0], [0, -6.4]]) { ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.ellipse(x + bx, ty - 3 + by, 3.4, 4, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = .6; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + bx - 3.2, ty - 4 + by); ctx.lineTo(x + bx + 3.2, ty - 4 + by); ctx.moveTo(x + bx - 3.2, ty - 2 + by); ctx.lineTo(x + bx + 3.2, ty - 2 + by); ctx.stroke(); }
        if (n > 1) { ctx.fillStyle = OCRE; ctx.fillRect(x - 1, ty - 12, 2, 1.2); }
      }
      if (t2.quema) { ctx.fillStyle = 'rgba(40,24,16,.35)'; ctx.fillRect(x - 8, ty - 12, 16, 15 + h); for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, al = 7 + Math.sin(t * 16 + k * 2) * 2.4; ctx.fillStyle = '#ff6c2f'; ctx.beginPath(); ctx.moveTo(fx - 2.6, ty + 1); ctx.quadraticCurveTo(fx - 2, ty - al * .6, fx, ty - al); ctx.quadraticCurveTo(fx + 2, ty - al * .6, fx + 2.6, ty + 1); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.moveTo(fx - 1.2, ty + 1); ctx.quadraticCurveTo(fx - .8, ty - al * .3, fx, ty - al * .55); ctx.quadraticCurveTo(fx + .8, ty - al * .3, fx + 1.2, ty + 1); ctx.closePath(); ctx.fill(); } }
      if (sobre2 || elegida) { ctx.strokeStyle = OCRE; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(x - 10, ty - 14, 20, y - ty + 19); ctx.setLineDash([]); }
    }
  }
  const hoverTorre = j => MOUSE.active ? j.torres.find(q => Math.abs(q.x - MOUSE.x) < 10 && Math.abs(q.y - 4 - MOUSE.y) < 15) || null : null;
  const botonBajoMouse = j => MOUSE.active ? botones(j).find(q => Math.hypot(MOUSE.x - q.x, MOUSE.y - q.y) < 11) || null : null;
  return { crear, paso, pintar, botones, clic, OLEADAS };
})();
MEC.POW.torre = { name: 'Defensas de la ciudad', help: 'Clic en un pedestal para armar una defensa; clic sobre ella para mejorarla, escoger su especialidad o venderla. Itzel junta la pólvora y, parada junto a una defensa, la hace disparar más rápido.', cd: .3, click() { return false; } };
nivel('templo', {
  nombre: 'La defensa de Campeche', lema: 'Cinco oleadas de piratas rumbo a la Catedral, con Grammont y Lorencillo al frente. Fresita arma las defensas; Itzel junta la pólvora y apaga los incendios.',
  modo: 'torres', foe: 'pirata', fauna: ['pirata', 'bucanero', 'incendiario', 'abordador', 'contramaestre'], power: 'torre', plat: NIVELES.fuego.plat, W: 30, skin: NIVELES.fuego.skin,
});
(NIVELES_ALT.fuego = NIVELES_ALT.fuego || []).push('templo');

