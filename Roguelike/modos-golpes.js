'use strict';
// =====================================================================
//  A GOLPES · Abordaje en el astillero (mundo de grabado)
//  Fresita corta con su espada; Itzel empuja o esquiva. Los barriles
//  esconden corazones y armas de disparos limitados para Itzel.
// =====================================================================
MODOS.golpes = (() => {
  const TINTA = '#1f1a1c', PAPEL = '#efe5cf', ROJO = '#b3342b', MADERA = '#8a5a34';
  const Y0 = 158, Y1 = 226, LARGO = VW * 3, VX = 92, VY = 58, ESC = 1.35;
  const fondo = new Image(), piratasArte = new Image(), barrilArte = new Image(), pistolaArte = new Image(), corazonArte = new Image();
  const jefeArte = new Image(); jefeArte.src = '../Roguelike/assets/abordaje-nuevo/jefe-capitan.png';
  const jefeCaminar = new Image(), jefeAtacar = new Image();
  jefeCaminar.src = '../Roguelike/assets/forge/abordaje/capitan-caminar-v1/sheet-transparent.png';
  jefeAtacar.src = '../Roguelike/assets/forge/abordaje/capitan-atacar-v2/sheet-transparent.png';
  // Las hojas registradas por Sprite Forge mantienen la misma celda y origen
  // en cada fotograma. Si falta una, se usa el arte anterior del juego.
  function hojaForge(nombre) {
    const im = new Image();
    im.onerror = () => { im.onerror = null; im.src = '../Roguelike/assets/abordaje-nuevo/' + nombre + '.png'; };
    im.src = '../Roguelike/assets/forge/abordaje/' + nombre + '-v1/sheet-transparent.png';
    return im;
  }
  const posesItzel = {}; for (const accion of ['caminar', 'empujar', 'herida']) posesItzel[accion] = hojaForge('itzel-' + accion);
  const caminar = {}, atacar = {}; for (const tipo of ['grumete', 'bucanero', 'contramaestre', 'pistolero']) { caminar[tipo] = hojaForge('caminar-' + tipo); atacar[tipo] = hojaForge('atacar-' + tipo); }
  fondo.src = '../Roguelike/assets/abordaje-nuevo/astillero.png'; piratasArte.src = '../Roguelike/assets/abordaje-nuevo/piratas.png'; barrilArte.src = '../Roguelike/assets/abordaje-nuevo/barril.png'; pistolaArte.src = '../Roguelike/assets/abordaje-nuevo/pistola.png'; corazonArte.src = '../Roguelike/assets/abordaje-nuevo/corazon.png';
  const suena = n => { if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx(n); };
  // sonidos del abordaje (ElevenLabs): la voz de cada pirata al recibir un golpe, el filo de la espada y el disparo de pistola
  const archivo = (n, f = 1) => { if (window.AUDIO_ARCHIVOS && AUDIO_ARCHIVOS.efectoEnemigo) { AUDIO_ARCHIVOS.efectoEnemigo('abordaje/' + n + '.mp3', f); return true; } return false; };
  const VOCES = { grumete: 2, bucanero: 1, pistolero: 2, contramaestre: 3 };
  let libreVoz = 0;
  // la voz suena cuando el pirata aparece en pantalla (no al pegarle); si salen varios juntos, una tras otra
  const voz = q => { if (!VOCES[q.tipo]) return; const ahora = performance.now(), cuando = Math.max(ahora, libreVoz); libreVoz = cuando + 650; const n = q.tipo + '-' + (1 + Math.floor(Math.random() * VOCES[q.tipo])); setTimeout(() => { if (STATE === 'play') archivo(n, q.E.jefe ? 1 : .9); }, cuando - ahora); };
  const disparoSfx = () => { if (!archivo('disparo', .85)) suena('impulso'); };
  // Cada oficio tiene ritmo, vida y daño propios (en corazones completos).
  const TIPOS = {
    grumete: { vida: 3, vel: 65, daño: 1, alto: 22, ancho: 9, nombre: 'Grumete veloz', listo: .3, recarga: .32, agresividad: 5 },
    bucanero: { vida: 5, vel: 40, daño: 2, alto: 26, ancho: 11, nombre: 'Bucanero', listo: .65, recarga: .85, agresividad: 2.8 },
    pistolero: { vida: 3, vel: 43, daño: 1, alto: 23, ancho: 9, nombre: 'Pistolero', listo: .85, recarga: 2.4, distancia: true },
    contramaestre: { vida: 12, vel: 28, daño: 3, alto: 34, ancho: 16, nombre: 'El contramaestre', listo: 1.05, recarga: 1.25, agresividad: 1.8, jefe: true },
  };
  const TRAMOS = [
    { x: 0, olas: [['grumete', 'grumete', 'bucanero']] },
    { x: VW, olas: [['pistolero', 'grumete', 'bucanero'], ['pistolero', 'bucanero', 'grumete']] },
    { x: VW * 2, olas: [['pistolero', 'grumete'], ['contramaestre', 'bucanero']] },
  ];
  function crear(def, st) {
    const j = { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, pose: poseItzel(), dy: 0,
      p: { x: 60, y: 196, face: 1, run: 0, golpe: 0, combo: 0, ventana: 0, patada: 0, cdPatada: 0, vx: 0, empuje: 0 },
      fre: { x: 120, y: 100, cool: 0, anim: 0, face: 1 }, disparos: [], balasPiratas: [], premios: [], balas: 0, armaVisible: false, suministros: [], recogidos: 0, cam: 0, tramo: 0, ola: 0, piratas: [], barriles: [], monedas: [], golpes: [], textos: [], espera: 1.2, limpio: false, kAntes: false, sAntes: false,
      aviso: null, demo: typeof STATE !== 'undefined' && STATE === 'libro' };
    [[180, 172], [520, 214], [760, 178], [1000, 206], [1240, 180]].forEach(([x, y], i) => j.barriles.push({ x, y, vida: 2, golpe: 0, premio: i % 2 ? 'arma' : 'corazon' }));
    const filas = Array.from({ length: 15 }, (_, r) => r > 12 ? '#'.repeat(Math.ceil(LARGO / T) + 2) : '.'.repeat(Math.ceil(LARGO / T) + 2));
    j.cieloL = buildLevelFromRows(filas); if (typeof setLevel === 'function') setLevel(j.cieloL);
    return j;
  }
  function soltarOla(j) {
    const tr = TRAMOS[j.tramo], ola = tr.olas[j.ola]; if (!ola) return;
    ola.forEach((tipo, i) => { const E = TIPOS[tipo], lado = i % 2 ? -1 : 1, x = lado > 0 ? j.cam + VW + 20 + i * 18 : j.cam - 20 - i * 18;
      j.piratas.push({ tipo, E, x, y: Y0 + 10 + ((i * 23) % (Y1 - Y0 - 16)), turno: i, vida: E.vida, est: 'llega', t: 0, variante: (i + j.tramo + j.ola) % 3, face: -lado, golpe: 0, burbuja: 0, duerme: 0, prep: 0, atonta: 0, run: 0, carga: 0 }); });
    j.ola++;
  }
  function pegar(j, q, daño, empuje, tumba) {
    if (q.est === 'huye') return;
    // el contramaestre no se deja interrumpir cuando ya echó el brazo atrás o va embistiendo: hay que hacerse a un lado
    const blindado = q.E.jefe && (q.prep > 0 || q.carga > 0) && !tumba;
    q.vida -= daño; q.golpe = .25; if (!blindado) { q.atonta = tumba ? .9 : .32; q.x += empuje; q.prep = 0; q.prepCarga = 0; q.carga = 0; q.punteria = 0; } q.duerme = 0;
    j.golpes.push({ x: q.x - empuje * .3, y: q.y - q.E.alto * .6, t: 0, g: tumba });
    j.shake = tumba ? .18 : .08; suena('pisa');
    if (q.vida <= 0) { q.est = 'huye'; q.t = 0; q.face = empuje > 0 ? 1 : -1; RUN.stomps++; if (Math.random() < .6 || q.E.jefe) j.monedas.push({ x: q.x, y: q.y, vy: -60, h: 12, got: false }); if (q.E.jefe && !j.win) { j.win = j.t || .001; suena('meta'); chispas(j, q.x - j.cam, q.y - q.E.alto, [ROJO, PAPEL, '#ffffff'], 40, 100); } }
  }
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt); j.fre.cool -= dt; j.fre.anim = Math.max(0, j.fre.anim - dt);
    if (j.win) { for (const q of j.piratas) if (q.est === 'huye') { q.x += q.face * 120 * dt; q.run += dt * 16; } pasoChispas(j, dt); MOUSE.clicks.length = 0; return; }
    const p = j.p;
    let k = teclas(), patada = KEYS.has('ShiftLeft') || KEYS.has('ShiftRight') || KEYS.has('KeyK') || KEYS.has('KeyX');
    if (j.demo) {
      const enemigos = j.piratas.filter(q => q.est !== 'huye' && q.x > j.cam && q.x < j.cam + VW);
      const objetivo = enemigos.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
      const destino = objetivo ? clamp(objetivo.x + (objetivo.x < p.x ? 45 : -45), j.cam + 30, j.cam + VW - 30) : j.limpio ? j.cam + VW : j.cam + VW * .42;
      const diferencia = destino - p.x;
      const cerca = objetivo && Math.abs(objetivo.x - p.x) < 27 && Math.abs(objetivo.y - p.y) < 11;
      if (objetivo && Math.abs(objetivo.x - p.x) > 3 && Math.abs(diferencia) < 8) p.face = objetivo.x < p.x ? -1 : 1;
      k = { right: diferencia > 6, left: diferencia < -6, up: !!objetivo && objetivo.y < p.y - 10, down: !!objetivo && objetivo.y > p.y + 10, space: !!cerca && Math.sin(j.t * 4) > .8 };
      patada = false;
      if (objetivo) {
        const fx = objetivo.x - j.cam - (objetivo.guardia ? objetivo.face * 12 : 0), fy = objetivo.y - objetivo.E.alto * .55;
        j.fre.face = fx < j.fre.x ? -1 : 1;
        j.fre.x += (fx - j.fre.x) * Math.min(1, dt * 4); j.fre.y += (fy - j.fre.y) * Math.min(1, dt * 4);
        if (j.fre.cool <= 0 && Math.hypot(fx - j.fre.x, fy - j.fre.y) < 15) MOUSE.clicks.push({ b: 0, up: false });
      } else { j.fre.x += (p.x - j.cam + 22 - j.fre.x) * Math.min(1, dt * 3); j.fre.y += (p.y - 42 - j.fre.y) * Math.min(1, dt * 3); }
    }
    // Fresita
    if (!j.demo && MOUSE.active) { const direccion = MOUSE.x - j.fre.x; if (Math.abs(direccion) > 1) j.fre.face = Math.sign(direccion); j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.dy - j.fre.y) * Math.min(1, dt * 9); }
    else if (!j.demo) { j.fre.x += (p.x - j.cam - p.face * 20 - j.fre.x) * dt * 4; j.fre.y += (p.y - 46 - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up || c.b !== 0 || j.fre.cool > 0 || j.win) continue;
      const fx = j.fre.x + j.cam, fy = j.fre.y;
      let cercano = null, distancia = 32;
      for (const q of j.piratas) if (q.est !== 'huye') {
        const d = Math.hypot(q.x - fx, q.y - q.E.alto * .55 - fy);
        if (d < distancia) { distancia = d; cercano = q; }
      }
      const barril = j.barriles.find(b => b.vida > 0 && Math.hypot(b.x - fx, b.y - 9 - fy) < 32);
      const objetivoX = cercano ? cercano.x : barril ? barril.x : fx + j.fre.face;
      j.fre.face = Math.sign(objetivoX - fx) || j.fre.face; j.fre.cool = .38; j.fre.anim = .32; suena('impulso');
      if (cercano) {
        if (cercano.guardia && Math.sign(fx - cercano.x) === cercano.face) {
          // La guardia se indica visualmente alrededor del pirata.
        } else pegar(j, cercano, 1, j.fre.face * 9, false);
      }
      if (barril) {
        barril.vida--; barril.golpe = .25;
        if (barril.vida <= 0) {
          j.premios.push({ x: barril.x, y: barril.y, tipo: barril.premio, got: false });
          chispas(j, barril.x - j.cam, barril.y - 9, [MADERA, PAPEL, TINTA], 16, 70);
        }
      }
    }
    MOUSE.clicks.length = 0;
    if (j.win) return;
    // Itzel por el muelle
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dyk = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    p.herida = Math.max(0, (p.herida || 0) - dt); p.golpe = Math.max(0, p.golpe - dt); p.disparoAnim = Math.max(0, (p.disparoAnim || 0) - dt); if (!j.balas && !p.disparoAnim) j.armaVisible = false; p.ventana = Math.max(0, p.ventana - dt); p.cdPatada = Math.max(0, p.cdPatada - dt);
    const quieto = p.golpe > .12 || p.patada > 0; p.mueve = !quieto && !j.win && !!(dx || dyk);
    if (!quieto && !j.win) { p.x += dx * VX * dt; p.y += dyk * VY * dt; if (dx) p.face = dx; if (dx || dyk) p.run += dt * 12; }
    if (p.patada > 0) { p.patada = Math.max(0, p.patada - dt); p.x += p.esquivaX * 210 * dt; p.y += p.esquivaY * 135 * dt; }
    const izq = j.cam + 12, der = j.limpio || j.tramo >= TRAMOS.length - 1 ? Math.min(LARGO - 12, j.cam + VW - 12) : j.cam + VW - 12;
    p.x = clamp(p.x, izq, der); p.y = clamp(p.y, Y0 + 4, Y1);
    const sp = !!k.space, pres = sp && !j.sAntes; j.sAntes = sp;
    if (pres && p.golpe <= .12 && p.patada <= 0) {
      p.golpe = .26; p.disparoAnim = j.balas > 0 ? .24 : 0;
      if (j.balas > 0) {
        j.balas--; j.disparos.push({ x: p.x + p.face * 12, y: p.y, dir: p.face, vida: 1.5 }); disparoSfx();
      } else {
        suena('salto');
        for (const q of j.piratas) if (q.est !== 'huye' && (q.x - p.x) * p.face > -4 && Math.abs(q.x - p.x) < 30 && Math.abs(q.y - p.y) < 12) {
          q.x += p.face * 22; q.atonta = .7; q.guardia = false; q.prep = 0; q.prepCarga = 0; q.carga = 0; q.punteria = 0;
          j.golpes.push({ x: q.x, y: q.y - q.E.alto * .6, t: 0, g: false });
        }
      }
    }
    if (patada && !j.kAntes && p.cdPatada <= 0 && p.patada <= 0) {
      const d = Math.hypot(dx, dyk); p.esquivaX = d ? dx / d : -p.face; p.esquivaY = d ? dyk / d : 0;
      p.patada = .28; p.cdPatada = 1; j.inv = Math.max(j.inv, .32); suena('impulso');
    }
    j.kAntes = patada;
    for (const d of j.disparos) {
      const anterior = d.x; d.x += d.dir * 260 * dt; d.vida -= dt;
      for (const q of j.piratas) if (q.est !== 'huye' && Math.abs(q.y - d.y) < 12 && q.x >= Math.min(anterior, d.x) - 9 && q.x <= Math.max(anterior, d.x) + 9) {
        pegar(j, q, 1, d.dir * 12, false); d.vida = 0; break;
      }
    }
    j.disparos = j.disparos.filter(d => d.vida > 0 && d.x >= j.cam - 20 && d.x <= j.cam + VW + 20);
    if (j.win) return;
    for (const premio of j.premios) if (!premio.got && Math.abs(premio.x - p.x) < 13 && Math.abs(premio.y - p.y) < 13) {
      if (premio.tipo === 'corazon' && RUN.hearts >= RUN.maxHearts) continue;
      premio.got = true;
      if (premio.tipo === 'corazon') { RUN.hearts = Math.min(RUN.maxHearts, RUN.hearts + 1); j.textos.push({ x: p.x, y: p.y - 30, txt: '¡Corazón!', t: 0 }); }
      else { j.balas = 5; j.armaVisible = true; j.textos.push({ x: p.x, y: p.y - 30, txt: '¡5 disparos!', t: 0 }); }
      suena('canistel');
    }
    // Los proyectiles viajan por la misma franja del muelle: Itzel puede esquivarlos en profundidad.
    for (const bala of j.balasPiratas) {
      const anterior = bala.x; bala.x += bala.dir * 170 * dt; bala.vida -= dt;
      if (Math.abs(p.y - bala.y) < 10 && p.x >= Math.min(anterior, bala.x) - 7 && p.x <= Math.max(anterior, bala.x) + 7) {
        if (dañoModo(j, bala.daño)) { p.herida = .45; suena('herida'); }
        bala.vida = 0;
      }
    }
    j.balasPiratas = j.balasPiratas.filter(b => b.vida > 0 && b.x > j.cam - 25 && b.x < j.cam + VW + 25);
    // los piratas: se acercan a un lado de Itzel, avisan y pegan
    for (const q of j.piratas) {
      if (!q.salio && q.est !== 'huye' && q.x > j.cam + 6 && q.x < j.cam + VW - 6) { q.salio = true; voz(q); }
      q.mueve = false; q.t += dt; q.ataca = Math.max(0, (q.ataca || 0) - dt); q.golpe = Math.max(0, q.golpe - dt); q.atonta = Math.max(0, q.atonta - dt); q.burbuja = Math.max(0, q.burbuja - dt); q.duerme = Math.max(0, q.duerme - dt);
      if (q.est === 'huye') { q.mueve = true; q.x += q.face * 120 * dt; q.run += dt * 16; continue; }
      if (q.atonta > 0 || q.burbuja > 0 || q.duerme > 0) { q.guardia = false; continue; }
      q.guardia = q.tipo === 'bucanero' && !q.prep && Math.abs(q.x - p.x) < 42 && Math.sin(q.t * 1.8) > .35;
      const E = q.E, lado = q.x < p.x ? -1 : 1;
      // Los que quedan ocupan los sitios libres cuando cae un compañero.
      const turno = Math.max(0, j.piratas.filter(e => e.est !== 'huye' && !e.E.distancia).indexOf(q));
      let ladoTurno = turno % 2 ? -1 : 1;
      const distanciaTurno = (E.jefe ? 32 : 25) + Math.floor(turno / 2) * 30;
      if (p.x + ladoTurno * distanciaTurno < j.cam + 18 || p.x + ladoTurno * distanciaTurno > j.cam + VW - 18) ladoTurno *= -1;
      const tx = clamp(p.x + ladoTurno * distanciaTurno, j.cam + 18, j.cam + VW - 18), ty = clamp(p.y + (turno % 3 - 1) * 7, Y0 + 4, Y1);
      if (E.distancia) {
        q.face = q.x < p.x ? 1 : -1;
        q.recargaTiro = Math.max(0, (q.recargaTiro || 0) - dt);
        if (q.punteria > 0) {
          q.punteria -= dt;
          if (q.punteria <= 0) {
            j.balasPiratas.push({ x: q.x + q.face * 10, y: q.y, dir: q.face, daño: E.daño, vida: 2 });
            q.ataca = .32; q.recargaTiro = E.recarga; disparoSfx();
          }
          continue;
        }
        const distancia = Math.abs(p.x - q.x), mover = distancia > 150 ? q.face : distancia < 75 ? -q.face : 0;
        if (mover) { q.mueve = true; q.x += mover * E.vel * dt; q.run += dt * 10; }
        q.y += clamp(p.y - q.y, -E.vel * .5 * dt, E.vel * .5 * dt);
        q.y = clamp(q.y, Y0 + 4, Y1);
        if (q.x > j.cam + 16 && q.x < j.cam + VW - 16) q.dentro = true;
        if (q.dentro) q.x = clamp(q.x, j.cam + 16, j.cam + VW - 16);
        if (!q.recargaTiro && distancia < 180 && Math.abs(p.y - q.y) < 8) q.punteria = E.listo;
        continue;
      }
      if (q.prepCarga > 0) { q.prepCarga -= dt; if (q.prepCarga <= 0) q.carga = .8; continue; }
      if (E.jefe && q.carga > 0) { q.mueve = true; q.carga -= dt; q.x = clamp(q.x + q.face * 190 * dt, j.cam + 16, j.cam + VW - 16); q.run += dt * 20; if (Math.abs(q.x - p.x) < 18 && Math.abs(q.y - p.y) < 10 && j.inv <= 0) { if (dañoModo(j, E.daño)) { p.herida = .45; suena('herida'); p.x += q.face * 30; } } continue; }
      if (q.prep > 0) { q.prep -= dt; if (q.prep <= 0) { q.ataca = .32; archivo('espada', .85); if (Math.abs(q.x - p.x) < (E.jefe ? 42 : 32) && Math.abs(q.y - p.y) < 12 && dañoModo(j, E.daño)) { p.herida = .45; suena('herida'); p.x -= lado * 18; } q.descansa = E.recarga; } continue; }
      q.descansa = Math.max(0, (q.descansa || 0) - dt); if (q.descansa > 0) continue;
      const ddx = tx - q.x, ddy = ty - q.y, d = Math.hypot(ddx, ddy);
      if (E.jefe && Math.abs(q.y - p.y) < 8 && Math.abs(q.x - p.x) > 60 && q.t > 2 && Math.random() < dt * .8) { q.prepCarga = .85; q.face = q.x < p.x ? 1 : -1; q.prep = 0; continue; }
      if (d > 4) { q.mueve = true; q.x += ddx / d * E.vel * dt; q.y += ddy / d * E.vel * .7 * dt; q.run += dt * 10; }
      q.face = q.x < p.x ? 1 : -1;
      if (d < 8 && Math.abs(q.x - p.x) < (E.jefe ? 40 : 30) && Math.abs(q.y - p.y) < 12 && Math.random() < dt * E.agresividad) q.prep = E.listo;
      q.y = clamp(q.y, Y0 + 4, Y1);
      // ya en pantalla, no se sale de lo que Itzel alcanza
      if (q.x > j.cam + 16 && q.x < j.cam + VW - 16) q.dentro = true;
      if (q.dentro) q.x = clamp(q.x, j.cam + 16, j.cam + VW - 16);
    }
    // Evita que los cuerpos ocupen el mismo punto sin bloquear su entrada por los bordes.
    const dentro = j.piratas.filter(q => q.est !== 'huye' && q.dentro);
    for (let i = 0; i < dentro.length; i++) for (let k = i + 1; k < dentro.length; k++) {
      const a = dentro[i], b = dentro[k], dx = b.x - a.x;
      if (Math.abs(a.y - b.y) < 13 && Math.abs(dx) < 22) {
        const dir = Math.sign(dx) || (a.turno < b.turno ? 1 : -1), separa = (22 - Math.abs(dx)) * .5;
        a.x = clamp(a.x - dir * separa, j.cam + 16, j.cam + VW - 16);
        b.x = clamp(b.x + dir * separa, j.cam + 16, j.cam + VW - 16);
      }
    }
    j.piratas = j.piratas.filter(q => !(q.est === 'huye' && (q.x < j.cam - 60 || q.x > j.cam + VW + 60)));
    // las olas y los tramos
    const vivos = j.piratas.filter(q => q.est !== 'huye').length;
    if (!j.win && !j.limpio && vivos === 0) { j.espera -= dt; if (j.espera <= 0) { if (TRAMOS[j.tramo].olas[j.ola]) { soltarOla(j); j.espera = 1.4; } else j.limpio = true; } }
    if (!j.win && j.limpio && j.tramo < TRAMOS.length - 1 && p.x >= j.cam + VW - 13) {
      j.tramo++; j.cam = TRAMOS[j.tramo].x; p.x = j.cam + 18;
      j.ola = 0; j.limpio = false; j.espera = .6; j.balasPiratas = []; j.disparos = [];
    }
    // monedas que saltan y se recogen
    for (const m of j.monedas) { if (m.got) continue; m.vy += 300 * dt; m.h = Math.max(0, m.h - m.vy * dt); if (m.h <= 0) { m.h = 0; m.vy = -m.vy * .35; } if (Math.abs(m.x - p.x) < 10 && Math.abs(m.y - p.y) < 9) { m.got = true; RUN.coins++; suena('canistel'); } }
    for (const g of j.golpes) g.t += dt; j.golpes = j.golpes.filter(g => g.t < .3);
    for (const x of j.textos) x.t += dt; j.textos = j.textos.filter(x => x.t < 1.2);
    for (const b of j.barriles) b.golpe = Math.max(0, b.golpe - dt);
    if (j.aviso) { if (!(typeof cartelVisible === 'function' && cartelVisible())) j.aviso.t += dt; if (j.aviso.t > 5.5) j.aviso = null; }
    pasoChispas(j, dt);
  }

  // ---------------- dibujo: grabado en linóleo ----------------
  function pirata(ctx, q, t) {
    const E = q.E, s = E.alto / 26, paso = Math.sin(q.run) * (q.est === 'huye' ? 4 : 2.4), x = q.x, y = q.y, f = q.face;
    const tipoArte = q.tipo;
    const tiraAtaque = atacar[tipoArte], accion = (q.prep > 0 || q.prepCarga > 0 || q.carga > 0 || q.ataca > 0 || q.punteria > 0) && !(q.atonta > 0), tira = accion && tiraAtaque && tiraAtaque.complete && tiraAtaque.naturalWidth ? tiraAtaque : caminar[tipoArte], conArte = tira && tira.complete && tira.naturalWidth;
    if (E.jefe && jefeCaminar.complete && jefeCaminar.naturalWidth && jefeAtacar.complete && jefeAtacar.naturalWidth) {
      const preparando = q.prep > 0 || q.prepCarga > 0, atacando = q.carga > 0 || q.ataca > 0;
      const hoja = q.mueve && !preparando && !atacando ? jefeCaminar : jefeAtacar;
      const cuadro = hoja === jefeCaminar ? Math.floor(q.run / (Math.PI / 2)) % 4 : preparando ? 1 : atacando ? 2 : 0;
      const celda = 256, sx = hoja === jefeCaminar ? cuadro * celda : (cuadro % 2) * celda, sy = hoja === jefeCaminar ? 0 : Math.floor(cuadro / 2) * celda;
      const h = E.alto * 1.75;
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
      if (q.golpe > 0) { ctx.translate(-2, 0); ctx.filter = 'brightness(1.7)'; }
      ctx.shadowColor = '#fff5ce'; ctx.shadowBlur = 3.5;
      ctx.drawImage(hoja, sx, sy, celda, celda, -h / 2, -h * .86, h, h); ctx.restore();
    } else if (E.jefe && jefeArte.complete && jefeArte.naturalWidth) {
      const h = E.alto * 1.48, w = h * jefeArte.naturalWidth / jefeArte.naturalHeight;
      const vaiven = q.mueve ? Math.abs(Math.sin(q.run)) * .9 : Math.sin(t * 2) * .22;
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
      ctx.rotate(q.golpe > 0 ? -.2 : q.carga > 0 ? .14 : q.prep > 0 || q.prepCarga > 0 ? -.12 : 0);
      ctx.shadowColor = '#fff5ce'; ctx.shadowBlur = 3.5;
      if (q.golpe > 0) ctx.filter = 'brightness(1.7)';
      ctx.drawImage(jefeArte, -w / 2, -h - vaiven, w, h); ctx.restore();
    } else if (conArte) {
      const celda = tira.naturalWidth / 4, h = E.alto * 1.48, w = h;
      const activo = q.mueve && !(q.atonta > 0 || q.duerme > 0);
      const cuadro = accion && tira === tiraAtaque ? (q.tipo === 'pistolero' ? (q.punteria > 0 ? (q.punteria > q.E.listo * .55 ? 1 : 2) : 3) : (q.prep > 0 || q.prepCarga > 0 ? 1 : q.carga > 0 || q.ataca > .16 ? 2 : 3)) : activo ? Math.floor(q.run / (Math.PI / 2)) % 4 : 0;
      const preparacion = q.prep > 0 ? 1 - q.prep / E.listo : q.prepCarga > 0 ? 1 - q.prepCarga / .85 : 0;
      const vaiven = activo ? Math.abs(Math.sin(q.run)) * .65 : Math.sin(t * 2 + x) * .22;
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
      ctx.rotate(q.golpe > 0 ? -.2 : q.carga > 0 ? .14 : preparacion ? -.12 * preparacion : 0);
      if (q.golpe > 0) ctx.translate(-2, 0);
      ctx.shadowColor = '#fff5ce'; ctx.shadowBlur = 3.5;
      ctx.filter = q.golpe > 0 ? 'brightness(1.7)' : q.variante === 1 ? 'saturate(1.12) contrast(1.12)' : q.variante === 2 ? 'saturate(1.05) contrast(1.15)' : 'saturate(1.25) contrast(1.18)';
      ctx.drawImage(tira, cuadro * celda, 0, celda, tira.naturalHeight, -w / 2, -h - vaiven + h * (14 / 192), w, h);   // la hoja deja 14 de 192 px vacíos bajo los pies: se bajan al piso
      ctx.restore();
    } else if (window.FAUNA_ARTE && FAUNA_ARTE.listo('pirataG')) {
      const n = q.duerme > 0 || q.atonta > .5 ? 3 : q.golpe > 0 || q.atonta > 0 ? 2 : accion ? 1 : 0;   // tumbado, recibe, golpea, parado
      ctx.save(); ctx.translate(x, y); if (q.golpe > 0) ctx.filter = 'brightness(1.7)';
      FAUNA_ARTE.pieza(ctx, 'pirataG' + n, 0, -(q.mueve ? Math.abs(Math.sin(q.run)) * .65 : 0), { h: E.alto * (n === 3 ? .55 : 1.3) * (E.jefe ? 1.3 : 1), voltea: f < 0 });
      ctx.restore();
    } else {
    ctx.save(); ctx.translate(x, y); ctx.scale(f * s, s);
    if (q.golpe > 0) ctx.translate((Math.random() - .5) * 2, 0);
    if (q.atonta > .5) ctx.rotate(-.3);
    ctx.strokeStyle = TINTA; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(-3 - paso, 0); ctx.moveTo(2, -9); ctx.lineTo(3 + paso, 0); ctx.stroke();
    ctx.fillStyle = E.jefe ? '#3a2e2a' : TINTA; ctx.beginPath(); ctx.ellipse(0, -15, E.jefe ? 9 : 6, 8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAPEL; ctx.lineWidth = .6; ctx.beginPath(); for (let i = -4; i <= 4; i += 2) { ctx.moveTo(i, -21); ctx.lineTo(i + 1.4, -9); } ctx.stroke();       // rayado de la gubia
    ctx.fillStyle = PAPEL; ctx.beginPath(); ctx.arc(1, -26, 4.4, 0, TAU); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = ROJO; ctx.beginPath(); ctx.moveTo(-4.4, -27); ctx.quadraticCurveTo(1, -33, 5.4, -27); ctx.lineTo(-4.4, -26); ctx.fill(); ctx.beginPath(); ctx.moveTo(-4.4, -27); ctx.lineTo(-8, -24 + Math.sin(t * 8) * 1); ctx.lineTo(-5, -25); ctx.fill();
    ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(3, -26.4, .9, 0, TAU); ctx.fill(); if (E.jefe) { ctx.fillRect(-1, -24, 6, 1.4); ctx.beginPath(); ctx.arc(-2, -21, 3.4, 0, Math.PI); ctx.fill(); }
    // el brazo con su arma: se echa atrás para avisar
    const prep = q.prep > 0, ang = prep ? -2.2 + (1 - q.prep / E.listo) * .3 : q.carga > 0 ? -.2 : -.6;
    ctx.save(); ctx.translate(3, -18); ctx.rotate(ang); ctx.strokeStyle = TINTA; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, 0); ctx.stroke();
    ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(E.jefe ? 9 : 16, E.jefe ? 0 : -2); ctx.stroke(); if (E.jefe) { ctx.fillStyle = MADERA; ctx.fillRect(7, -3, 6, 6); }
    ctx.restore();
    ctx.restore();
    }
    const prep = q.prep > 0 || q.prepCarga > 0;
    if (q.E.distancia && q.est !== 'huye') {
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
      if (q.punteria > 0 && q.punteria <= E.listo * .55) { ctx.setLineDash([2, 2]); ctx.strokeStyle = 'rgba(186,42,30,.85)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(E.alto * .48, -E.alto * 1.05); ctx.lineTo(E.alto * 1.4, -10); ctx.lineTo(75, -10); ctx.stroke(); }
      ctx.restore();
    }
    if (q.guardia) { ctx.save(); ctx.strokeStyle = '#d7b778'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + q.face * 7, y - E.alto * .55, 8, q.face > 0 ? -1 : Math.PI - 1, q.face > 0 ? 1 : Math.PI + 1); ctx.stroke(); ctx.restore(); }
    if (prep) { ctx.fillStyle = ROJO; ctx.font = 'bold 9px Alegreya, serif'; ctx.textAlign = 'center'; ctx.fillText('!', x, y - (E.jefe ? E.alto * 1.48 + 17 : E.alto + 6)); ctx.textAlign = 'left'; }
    if (q.burbuja > 0) { ctx.strokeStyle = 'rgba(255,140,198,.9)'; ctx.fillStyle = 'rgba(255,200,225,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - E.alto / 2, E.alto * .7, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x - E.alto * .3, y - E.alto * .8, 2, 0, TAU); ctx.fill(); }
    if (q.duerme > 0) { ctx.fillStyle = TINTA; ctx.font = 'italic 6px Alegreya, serif'; ctx.fillText('z z', x + 6, y - E.alto - 4 - (t * 6 % 4)); }
    if (E.jefe && q.est !== 'huye') { const w = 60, barraY = y - E.alto * 1.48 - 7; ctx.fillStyle = 'rgba(31,26,28,.6)'; ctx.fillRect(x - w / 2, barraY, w, 3); ctx.fillStyle = ROJO; ctx.fillRect(x - w / 2, barraY, w * Math.max(0, q.vida) / E.vida, 3); }
  }
  function astillero(ctx, j, Hv) {
    const cam = j.cam, t = j.t;
    // barcos a medio hacer: costillares de madera en el grabado
    for (let k = Math.floor((cam * .6 - 200) / 260); k <= (cam * .6 + VW) / 260; k++) {
      const x = k * 260 - cam * .6 + 80, y = 150, w = 160;
      ctx.fillStyle = PAPEL; ctx.beginPath(); ctx.moveTo(x - 6, y + 2); ctx.quadraticCurveTo(x + w / 2, y + 20, x + w + 6, y - 6); ctx.quadraticCurveTo(x + w + 10, y - 40, x + w - 4, y - 64); ctx.quadraticCurveTo(x + w / 2, y - 44, x + 4, y - 58); ctx.quadraticCurveTo(x - 10, y - 30, x - 6, y + 2); ctx.fill(); // el casco a medio hacer, con su arrufo
      ctx.strokeStyle = 'rgba(31,26,28,.35)'; ctx.lineWidth = .5; ctx.beginPath(); for (let i = 0; i < w; i += 4) { ctx.moveTo(x + i, y - 58); ctx.lineTo(x + i + 2, y + 4); } ctx.stroke();
      ctx.strokeStyle = TINTA; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + 16, x + w, y - 6); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 1; i < 9; i++) { const u = i / 9, bx = x + w * u, by = y + 16 * Math.sin(u * Math.PI) * .8 - 6 * u; ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx - 10, by - 30, bx - 4, by - 54 + Math.sin(u * Math.PI) * 10); } ctx.stroke();
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 10, y - 48); ctx.lineTo(x + w - 10, y - 50); ctx.stroke();
      ctx.fillStyle = TINTA; ctx.fillRect(x + w * .3, y - 2, 5, 10); ctx.fillRect(x + w * .7, y - 4, 5, 12);
    }
    // el muelle: tablones con su rayado y clavos
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, Y0 - 8, VW, Hv - Y0 + 8);
    // tablones largos que se ven más anchos de cerca (abajo), con su veta a gubia
    let y = Y0 - 8, alto = 6;
    while (y < Hv) {
      ctx.strokeStyle = TINTA; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke();
      const largo = 70 + alto * 6, off = (Math.floor(y) * 37) % largo;
      ctx.lineWidth = .9; ctx.beginPath(); for (let x = -((cam + off) % largo); x < VW; x += largo) { ctx.moveTo(x, y); ctx.lineTo(x, y + alto); } ctx.stroke();
      ctx.strokeStyle = 'rgba(31,26,28,.45)'; ctx.lineWidth = .45; ctx.beginPath();
      for (let x = -((cam * 1) % 9); x < VW; x += 9) { const v = hash2(Math.floor((x + cam) / 9), Math.floor(y), 5); if (v < .35) continue; const yy = y + 1.5 + v * (alto - 3); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 4, yy - .8, x + 8 + v * 6, yy); }
      ctx.stroke();
      ctx.fillStyle = TINTA; for (let x = -((cam + off) % largo); x < VW; x += largo) { ctx.fillRect(x + 3, y + alto / 2 - .6, 1.2, 1.2); }
      y += alto; alto = Math.min(16, alto * 1.18);
    }
    ctx.fillStyle = TINTA; ctx.fillRect(0, Y0 - 10, VW, 2.4);
    // el agua al fondo del muelle, a rayas
    ctx.fillStyle = '#2a3a44'; ctx.fillRect(0, Y0 - 26, VW, 16); ctx.strokeStyle = PAPEL; ctx.lineWidth = .6; ctx.beginPath(); for (let x = -((cam * .8 + t * 10) % 14); x < VW; x += 14) { ctx.moveTo(x, Y0 - 20); ctx.quadraticCurveTo(x + 3.5, Y0 - 22, x + 7, Y0 - 20); } ctx.stroke();
    // el barco de la meta
    const mx = LARGO - 40 - cam; if (mx < VW + 80) { ctx.fillStyle = TINTA; ctx.beginPath(); ctx.moveTo(mx - 60, Y0 - 12); ctx.lineTo(mx + 70, Y0 - 12); ctx.lineTo(mx + 50, Y0 + 14); ctx.lineTo(mx - 44, Y0 + 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = PAPEL; ctx.lineWidth = .7; ctx.beginPath(); for (let i = -40; i < 50; i += 8) { ctx.moveTo(mx + i, Y0 - 8); ctx.lineTo(mx + i + 4, Y0 + 10); } ctx.stroke(); ctx.fillStyle = TINTA; ctx.fillRect(mx, Y0 - 80, 3, 68); ctx.fillStyle = j.limpio && j.tramo === TRAMOS.length - 1 ? ROJO : PAPEL; ctx.beginPath(); ctx.moveTo(mx + 3, Y0 - 78); ctx.quadraticCurveTo(mx + 40, Y0 - 52, mx + 3, Y0 - 24); ctx.fill(); ctx.strokeStyle = TINTA; ctx.stroke(); }
  }
  function pintar(j, view) {
    const st = view.st, S = view.S, ctx = view.ctx, t = j.t, p = j.p;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    j.dy = typeof VISTA !== 'undefined' && typeof canvas !== 'undefined' && view.ctx === canvas.getContext('2d') ? Math.max(0, VISTA.H - VH) : 0;
    const Hv = VH + j.dy;
    ctx.setTransform(S, 0, 0, S, 0, j.dy * S); ctx.imageSmoothingEnabled = true;
    const antes = L; L = j.cieloL;
    const f = { t, cam: L.camMin + j.cam, S, g: { p, t }, st, key: st.id + '@' + S.toFixed(3), y0: -j.dy, H: Hv };
    ctx.save(); ctx.translate(0, -j.dy); telon(ctx, st, f, Hv); ctx.restore();
    L = antes;
    if (fondo.complete && fondo.naturalWidth) {
      const ancho = VW * 1.8, desplazamiento = j.tramo / (TRAMOS.length - 1) * (ancho - VW);
      ctx.drawImage(fondo, -desplazamiento, -j.dy, ancho, VH + j.dy);
      ctx.fillStyle = 'rgba(239,229,207,.27)'; ctx.fillRect(0, -j.dy, VW, VH + j.dy);
    } else astillero(ctx, j, VH);
    // todo lo del muelle, ordenado por lo hondo
    const cosas = [];
    for (const b of j.barriles) if (b.vida > 0) cosas.push({ y: b.y, f: () => {
      const x = b.x - j.cam; ctx.save(); ctx.fillStyle = 'rgba(31,26,28,.4)'; ctx.beginPath(); ctx.ellipse(x, b.y, 9, 3, 0, 0, TAU); ctx.fill();
      ctx.translate(x, b.y); ctx.rotate(b.golpe > 0 ? Math.sin(b.golpe * 35) * .12 : 0);
      if (barrilArte.complete && barrilArte.naturalWidth) { ctx.shadowColor = '#f4dfb7'; ctx.shadowBlur = 2; ctx.drawImage(barrilArte, -10, -21, 20, 21); }
      else { ctx.fillStyle = MADERA; ctx.strokeStyle = TINTA; ctx.fillRect(-7, -18, 14, 18); ctx.strokeRect(-7, -18, 14, 18); }
      ctx.restore();
    }});
    for (const premio of j.premios) if (!premio.got) cosas.push({ y: premio.y, f: () => {
      const x = premio.x - j.cam, y = premio.y - 9 + Math.sin(t * 4) * 1.5; ctx.save();
      if (premio.tipo === 'corazon') { if (corazonArte.complete && corazonArte.naturalWidth) { const w = 13, h = w * corazonArte.naturalHeight / corazonArte.naturalWidth; ctx.drawImage(corazonArte, x - w / 2, y - h / 2, w, h); } else drawHeart(ctx, x, y, 5, '#d8203a'); }
      else if (pistolaArte.complete && pistolaArte.naturalWidth) ctx.drawImage(pistolaArte, 282, 107, 1215, 689, x - 5.5, y - 3.2, 11, 6.2);
      else { ctx.strokeStyle = '#49352b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 4); ctx.stroke(); }
      ctx.restore();
    }});
    for (const d of j.balasPiratas) cosas.push({ y: d.y, f: () => { ctx.save(); ctx.fillStyle = '#e65332'; ctx.strokeStyle = '#fff0cf'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(d.x - j.cam, d.y - 10, 2.4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); } });
    for (const d of j.disparos) cosas.push({ y: d.y, f: () => { ctx.save(); ctx.fillStyle = '#ffe17a'; ctx.strokeStyle = '#582d20'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(d.x - j.cam, d.y - 10, 2.3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); } });
    for (const caja of j.suministros) if (!caja.got) cosas.push({ y: caja.y, f: () => {
      const x = caja.x - j.cam, y = caja.y; ctx.save(); ctx.fillStyle = '#ab7948'; ctx.strokeStyle = TINTA; ctx.lineWidth = 1;
      ctx.fillRect(x - 7, y - 13, 14, 13); ctx.strokeRect(x - 7, y - 13, 14, 13);
      ctx.beginPath(); ctx.moveTo(x - 6, y - 12); ctx.lineTo(x + 6, y - 1); ctx.moveTo(x + 6, y - 12); ctx.lineTo(x - 6, y - 1); ctx.stroke();
      ctx.fillStyle = '#f4cf72'; ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('↓', x, y - 16 + Math.sin(t * 5)); ctx.restore();
    }});
    for (const m of j.monedas) if (!m.got) cosas.push({ y: m.y, f: () => { ctx.fillStyle = 'rgba(31,26,28,.25)'; ctx.beginPath(); ctx.ellipse(m.x - j.cam, m.y, 4, 1.5, 0, 0, TAU); ctx.fill(); monedaItzel(ctx, m.x - j.cam, m.y - 6 - m.h, t, f); } });
    for (const q of j.piratas) cosas.push({ y: q.y, f: () => { ctx.fillStyle = 'rgba(31,26,28,.3)'; ctx.beginPath(); ctx.ellipse(q.x - j.cam, q.y, q.E.ancho * ESC, 3.4, 0, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(q.x - j.cam, q.y); ctx.scale(ESC, ESC); ctx.translate(-q.x, -q.y); pirata(ctx, q, t); ctx.restore(); } });
    cosas.push({ y: p.y, f: () => {
      const x = p.x - j.cam; ctx.fillStyle = 'rgba(31,26,28,.3)'; ctx.beginPath(); ctx.ellipse(x, p.y, 7, 2.6, 0, 0, TAU); ctx.fill();
      if (!j.demo && j.inv > 0 && !p.herida && Math.floor(j.inv * 14) % 2) return;
      const pega = p.golpe > .1;
      Object.assign(j.pose, { x: x + (pega ? p.face * 2 : 0) + (p.patada > 0 ? 0 : 0), y: p.y, face: p.face, on: p.patada <= 0, vx: !pega && (teclas().left || teclas().right || teclas().up || teclas().down) ? 110 : 0, vy: p.patada > 0 ? -60 : 0, run: p.run, vis: true, sq: pega ? -.15 : 0 });
      const accion = p.herida > 0 ? 'herida' : pega && !j.armaVisible ? 'empujar' : p.mueve || p.patada > 0 ? 'caminar' : 'reposo';
      const tira = posesItzel[accion === 'reposo' ? 'herida' : accion];
      if (tira && tira.complete && tira.naturalWidth) {
        const cuadro = accion === 'reposo' ? 3 : accion === 'herida' ? Math.min(3, Math.floor((1 - p.herida / .45) * 4)) :
          accion === 'empujar' ? Math.min(3, Math.floor((1 - p.golpe / .26) * 4)) :
          p.mueve ? Math.floor(p.run / (Math.PI / 2)) % 4 : 3;
        const celda = tira.naturalWidth / 4, h = 24 * ESC, w = h;
        const esquivaY = p.patada > 0 ? -4 * Math.sin(Math.PI * (1 - p.patada / .28)) : 0;
        ctx.save(); ctx.translate(x, p.y + esquivaY); ctx.scale(p.face, 1);
        if (p.patada > 0) ctx.rotate(-.18);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(tira, cuadro * celda, 0, celda, tira.naturalHeight, -w / 2, -h * .92, w, h);
        ctx.restore();
      } else {
        ctx.save(); ctx.translate(x, p.y); ctx.scale(ESC, ESC); ctx.translate(-x, -p.y); st.player(ctx, j.pose, f); ctx.restore();
      }
      if (j.armaVisible) {
        const disparando = p.disparoAnim > 0, retroceso = disparando ? Math.sin(p.disparoAnim / .24 * Math.PI) * 2 : 0;
        ctx.save(); ctx.translate(x + p.face * (5 - retroceso), p.y - 14); ctx.scale(p.face, 1);
        if (pistolaArte.complete && pistolaArte.naturalWidth) {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(pistolaArte, 282, 107, 1215, 689, -1, -5, 16, 9);
        } else {
          ctx.fillStyle = '#64402e'; ctx.fillRect(0, -2, 12, 3); ctx.fillRect(0, 0, 3, 4);
        }
        if (disparando && p.disparoAnim > .13) { ctx.fillStyle = '#ffe38b'; ctx.beginPath(); ctx.moveTo(14, -2); ctx.lineTo(19, -5); ctx.lineTo(17, -2); ctx.lineTo(20, 0); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
      // el golpe: un arco de tinta delante de Itzel (más grande en el tercero)
      if (pega && !j.armaVisible) { const r = 9 * ESC, a0 = p.face > 0 ? -1.2 : Math.PI - .2, a1 = a0 + 1.4; ctx.strokeStyle = p.combo === 3 || p.patada > 0 ? ROJO : TINTA; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x + p.face * 8, p.y - 16, r, a0, a1); ctx.stroke(); }
    } });
    cosas.sort((a, b) => a.y - b.y); for (const c of cosas) c.f();
    // los golpes que conectan: estrellas de gubia
    for (const g of j.golpes) { const x = g.x - j.cam, r = (g.g ? 12 : 8) * (1 - g.t / .3 * .4); ctx.fillStyle = g.g ? ROJO : PAPEL; ctx.strokeStyle = TINTA; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, rr = k % 2 ? r * .4 : r; ctx.lineTo(x + Math.cos(a) * rr, g.y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
    for (const x of j.textos) { ctx.globalAlpha = 1 - x.t / 1.2; ctx.font = 'bold 8px Alegreya, serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2.4; ctx.strokeStyle = PAPEL; ctx.strokeText(x.txt, x.x - j.cam, x.y - x.t * 14); ctx.fillStyle = TINTA; ctx.fillText(x.txt, x.x - j.cam, x.y - x.t * 14); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
    pintaChispas(ctx, j);
    if (st.fresita) {
      const pulso = j.fre.anim > 0 ? Math.sin(j.fre.anim / .32 * Math.PI) : 0, face = j.fre.face || 1;
      ctx.save(); ctx.translate(j.fre.x, j.fre.y); ctx.rotate(-face * pulso * .18); ctx.scale(1 + pulso * .12, 1 - pulso * .08); ctx.translate(-j.fre.x, -j.fre.y);
      st.fresita(ctx, { x: j.fre.x, y: j.fre.y - pulso * 2, face }, f); ctx.restore();
      // La espada acompaña a Fresita y traza un arco cuando corta.
      ctx.save(); ctx.translate(j.fre.x + face * 7, j.fre.y + 1); ctx.scale(face, 1); ctx.rotate(-.6 + pulso * 1.35);
      ctx.shadowColor = '#ff55b8'; ctx.shadowBlur = 5; ctx.strokeStyle = '#ef278e'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(12, 0); ctx.stroke();
      ctx.strokeStyle = '#fff0fa'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(12, 0); ctx.stroke();
      ctx.strokeStyle = '#ff83c9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(1, 2); ctx.stroke(); ctx.restore();
      if (pulso > .05) { ctx.save(); ctx.strokeStyle = 'rgba(255,94,190,.95)'; ctx.shadowColor = '#ff69c2'; ctx.shadowBlur = 4; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(j.fre.x + face * 7, j.fre.y, 18, face > 0 ? -1.1 : Math.PI - 1.1, face > 0 ? .9 : Math.PI + .9); ctx.stroke(); ctx.restore(); }
    }
    if (!j.demo) { ctx.save(); ctx.fillStyle = 'rgba(31,26,28,.82)'; ctx.fillRect(8, 34 - j.dy, 158, 12); ctx.font = 'bold 6px Alegreya Sans, sans-serif'; ctx.fillStyle = PAPEL;
    const vivos = j.piratas.filter(q => q.est !== 'huye').length;
    const objetivo = j.win ? '¡Astillero defendido!' : j.limpio ? 'Muelle despejado · avanza →' : 'Defiende el astillero · piratas ' + vivos;
    ctx.fillText('TRAMO ' + (j.tramo + 1) + '/3  ·  ' + objetivo, 12, 42 - j.dy, 150); if (j.balas > 0) { ctx.fillStyle = '#ffe17a'; ctx.fillText('ARMA: ' + j.balas + ' disparos · Espacio', 12, 50 - j.dy); } ctx.restore(); }
    // flecha de «sigan» cuando el tramo quedó limpio
    if (j.limpio && j.tramo < TRAMOS.length - 1 && Math.sin(t * 6) > -.3) { const x = VW - 34, y = 120; ctx.fillStyle = ROJO; ctx.strokeStyle = TINTA; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 16, y); ctx.lineTo(x, y + 8); ctx.lineTo(x, y + 3); ctx.lineTo(x - 14, y + 3); ctx.lineTo(x - 14, y - 3); ctx.lineTo(x, y - 3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (st.over) st.over(ctx, f);
  }
  const listoVista = () => [fondo, jefeArte, jefeCaminar, jefeAtacar, barrilArte, pistolaArte, corazonArte, ...Object.values(posesItzel), ...Object.values(caminar), ...Object.values(atacar)].every(im => im.complete);
  return { crear, paso, pintar, alto: true, listoVista };
})();
MEC.POW.espadaFresita = { name: 'Espada de Fresita', help: 'Acerca a Fresita con el cursor y haz clic para cortar. Itzel empuja con Espacio y esquiva con Shift. Los barriles esconden corazones o un arma temporal.', cd: .38, click() { return false; } };
nivel('abordaje', {
  nombre: 'Abordaje en el astillero', lugar: 'Astilleros del barrio de San Francisco',
  lema: 'Los piratas de Lorencillo quieren robarse un barco a medio hacer. Itzel esquiva y empuja a los piratas mientras Fresita los enfrenta con su espada.',
  dato: 'En el astillero de Campeche se hicieron barcos durante toda la Colonia. Los piratas atacaban la ciudad, entre otras cosas, por sus barcos y su palo de tinte.',
  modo: 'golpes', foe: 'calavera', fauna: ['calavera'], power: 'espadaFresita', plat: NIVELES.grabado.plat, W: 30, skin: NIVELES.grabado.skin,
});
(NIVELES_ALT.grabado = NIVELES_ALT.grabado || []).push('abordaje');

