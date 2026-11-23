'use strict';
// =====================================================================
//  LA OTRA ITZEL · el duelo contra tu reflejo (forma 8 de la Ruptura)
//  Como Link contra Dark Link: el espejo de obsidiana del prólogo revienta,
//  el mundo se apaga, queda una sala de niebla con piso de agua y tu propio
//  reflejo se levanta. Es tu Itzel del estilo actual, teñida de negro, y
//  pelea con tus mismas reglas.
//  Con ella viene Zarzamora, el ajolotito malo: duelo doble, Itzel contra
//  Itzel y Fresita contra Zarzamora.
//   · Se le gana cayéndole en la cabeza cuando se cansa.
//   · Si le caes antes de tiempo, chocan como espadas: tres choques seguidos
//     la dejan sin equilibrio.
//   · Desde la fase 2, Zarzamora la cubre con un escudo cuando descansa: solo
//     la canción de cuna de Fresita sobre Zarzamora lo rompe.
//   · Con un golpe restante la sala se invierte: noche total y ella brilla.
//  Nadie muere: al final vuelve a ser tu reflejo.
// =====================================================================
(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn, { OBJ } = MEC;
  const MAG = '#ff4fd8', VIOLETA = '#7a4dff';
  const INTRO = 6.2, ROMPE = 1.1, FIN = 1.9, FASES = { 1: ['reflejo', 'embestida', 'pisoton'], 2: ['embestida', 'reflejo', 'sombras', 'pisoton'], 3: ['danza', 'sombras', 'danza', 'pisoton'] };
  const esDuelo = o => !!(o.F && o.F.duelo);
  const enCine = () => typeof CINE !== 'undefined' && CINE.activo(); // en la cinemática el jefe es el espejo de siempre
  const mid = o => (o.x0 + o.x1) / 2;
  const fase = o => o.hp >= 4 ? 1 : o.hp >= 2 ? 2 : 3;

  // ---------- preparar el duelo ----------
  const initViejo = X.INIT.ruptura;
  X.INIT.ruptura = (o, g) => {
    initViejo(o, g); if (!esDuelo(o)) return;
    o.pal = Object.assign({}, o.pal, { c: '#2a0f3e' });
    Object.assign(o, { vx: 0, vy: 0, on: true, face: -1, run: 0, intro: INTRO, sale: 0, choques: 0, ecos: [], mode: 'alcance', pose: null, ataques: FASES[1], textoVentana: '', luz: 0, z: { x: mid(o) + 60, y: FLOOR + 10, t: 0, cd: 3, sueno: 0, ver: 0 } });
    g.objs.push({ k: 'salaEspejo', jefe: o, v: 0, neg: 0, t: 0 }, { k: 'duelista', jefe: o });
  };
  const coreViejo = X.CORE.ruptura;
  X.CORE.ruptura = o => esDuelo(o) ? { x: o.x, y: o.y - 15, r: 8 } : coreViejo(o);

  // la sala es la misma en todos los mundos: piso firme de lado a lado, dos islas y dos muros
  const ISLAS = [4, 20], FILA_ISLA = 7, ANCHO_ISLA = 4;
  function preparaSala(o, g, directo) {
    o.salaLista = true; const { gw, gh, grid } = L, muroIzq = PAD, muroDer = PAD + 27;
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) grid[y * gw + x] = y >= 11 || x <= muroIzq || x >= muroDer || (y === FILA_ISLA && ISLAS.some(c => x >= c + PAD && x < c + PAD + ANCHO_ISLA)) ? 1 : 0;
    g.plats.length = 0; g.solids.length = 0; g.zones.length = 0; g.foes.length = 0; for (const k of ['coins', 'enemies', 'pickups', 'bubbles']) if (Array.isArray(g[k])) g[k].length = 0; g.doblones = []; g.objs = g.objs.filter(q => q === o || q.k === 'salaEspejo' || q.k === 'duelista');
    const p = g.p; L.start.x = mid(o) - 130; L.start.y = FLOOR; p.x = clamp(p.x, o.x0 + 8, mid(o) - 40); p.y = Math.min(p.y, FLOOR); p.plat = null;
    const sala = g.objs.find(q => q.k === 'salaEspejo'); if (sala) sala.v = 1; // el destello tapa el cambio: la sala ya no se funde con el mundo de atrás
    if (directo) { o.y = FLOOR; o.sale = 1; o.ojos = 1; Object.assign(o.z, { x: o.x - 20, y: FLOOR - 28, ver: 1 }); return; }
    o.x = mid(o) + 110; o.y = FLOOR; o.z.x = o.x; o.z.y = FLOOR + 10;
    // el espejo revienta: la luz tapa el cambio de mundo
    o.luz = 1; g.shake = .7; for (let i = 0; i < 3; i++) spawn(g, 26, mid(o), 72, { v: 190, life: 1.1, s: 2.6, k: 'spark', cols: ['#ffffff', MAG, '#7a4dff', '#16101c'], g: 180 });
  }
  // ---------- su cuerpo pesa como el de Itzel ----------
  function mueve(o, dt) {
    if (!o.on) o.vy = Math.min(o.vy + G * dt, 520);
    o.x = clamp(o.x + o.vx * dt, o.x0 - 8, o.x1 + 8); o.y += o.vy * dt;
    if (o.y >= FLOOR) { if (!o.on && o.vy > 200) o.polvo = 1; o.y = FLOOR; o.vy = 0; o.on = true; } else o.on = false;
    if (Math.abs(o.vx) > 10) { o.run += Math.abs(o.vx) * dt * .16; o.face = Math.sign(o.vx); }
  }
  const eco = (o, dt) => { o.ecoT = (o.ecoT || 0) - dt; if (o.ecoT <= 0) { o.ecoT = .045; o.ecos.push({ x: o.x, y: o.y, t: .34, face: o.face }); } };
  const fin = o => {
    if (o.cadena > 0) { o.cadena--; o.atk = o.atk === 'embestida' ? 'pisoton' : 'embestida'; o.at = 0; o.dur = 99; }
    else { o.dur = .001; o.vx = 0; }
  };
  const cuerpoHiere = (o, g) => hurtIfIn(g, o.x - 6, o.y - 18, o.x + 6, o.y);

  // ---------- lo que sabe hacer ----------
  const ATK = {
    // te imita en espejo, como tu reflejo; al final se suelta y se lanza
    reflejo(o, g, dt, a) {
      const p = g.p; o.dur = 3.9; o.fx = null;
      if (a < 2.9) { const mx = clamp(2 * mid(o) - p.x, o.x0 - 8, o.x1 + 8), ax = o.x; o.x += (mx - o.x) * Math.min(1, dt * 7); o.y += (p.y - o.y) * Math.min(1, dt * 9); o.vx = (o.x - ax) / Math.max(dt, .001); o.vy = 0; o.on = o.y >= FLOOR - 1; o.face = Math.sign(p.x - o.x) || o.face; if (Math.abs(o.vx) > 10) o.run += Math.abs(o.vx) * dt * .16; return; }
      if (a < 3.2) { o.fx = 'carga'; o.vx = 0; o.pose = 'agacha'; mueve(o, dt); o.face = Math.sign(p.x - o.x) || o.face; o.blanco = p.x; return; }
      o.vx = Math.sign(o.blanco - o.x) * 400; eco(o, dt); mueve(o, dt); cuerpoHiere(o, g);
      if (Math.abs(o.blanco - o.x) < 12 || a > 3.8) fin(o);
    },
    // cruza la sala a ras de piso: se brinca
    embestida(o, g, dt, a) {
      const p = g.p, tell = o.furia ? .36 : .62; o.dur = 99;
      if (a < .03 && !o.dash) { o.face = Math.sign(p.x - o.x) || 1; o.cruces = fase(o) >= 2 ? 2 : 1; }
      if (a < tell) { o.fx = 'linea'; o.pose = 'agacha'; o.vx = 0; mueve(o, dt); return; }
      o.fx = null; if (!o.dash) { o.dash = o.face; spawn(g, 12, o.x, o.y - 4, { ang: o.dash > 0 ? Math.PI : 0, spread: .6, v: 90, life: .4, s: 2, k: 'dust', cols: ['#2a1a40', MAG] }); }
      o.vx = o.dash * 440; eco(o, dt); mueve(o, dt); cuerpoHiere(o, g);
      if (o.x <= o.x0 - 7 || o.x >= o.x1 + 7) { g.shake = Math.max(g.shake || 0, .15); o.dash = 0; o.vx = 0; if (--o.cruces > 0) { o.face = -o.face; o.at = tell * .45; } else fin(o); }
    },
    // flota sobre ti, cae como piedra y manda ondas por el piso
    pisoton(o, g, dt, a) {
      const p = g.p, tell = o.furia ? .2 : .42, flota = o.furia ? .7 : 1.05; o.dur = 99;
      if (a < tell) { o.pose = 'agacha'; o.vx = 0; o.fx = null; mueve(o, dt); o.cae = 0; return; }
      if (a < tell + flota) { const k = Math.min(1, dt * 7); o.fx = 'sombra'; o.x += (clamp(p.x, o.x0, o.x1) - o.x) * k; o.y += (46 - o.y) * k; o.on = false; o.vx = 0; o.vy = 0; o.face = Math.sign(p.x - o.x) || o.face; eco(o, dt * .5); return; }
      if (!o.cae) { o.fx = 'sombra'; o.y += 640 * dt; eco(o, dt); hurtIfIn(g, o.x - 9, o.y - 18, o.x + 9, o.y + 4); if (o.y >= FLOOR) { o.y = FLOOR; o.on = true; o.cae = a; o.fx = null; g.shake = .5; o.waves.push({ x: o.x - 16, v: -180, life: 2 }, { x: o.x + 16, v: 180, life: 2 }); spawn(g, 28, o.x, FLOOR, { ang: -Math.PI / 2, spread: 3, v: 150, life: .7, s: 2.4, k: 'dust', cols: ['#dfe6f2', '#2a1a40', MAG] }); } return; }
      if (a - o.cae > .3) fin(o);
    },
    // sus sombras cruzan a dos alturas: las bajas se brincan y las altas se dejan pasar
    sombras(o, g, dt, a) {
      o.dur = 3.9; o.vx = 0; mueve(o, dt); o.fx = 'invoca';
      for (let i = 0; i < 4; i++) { const w = .4 + i * .72; if (a > w && !o['s' + i]) { o['s' + i] = 1; const dir = i % 2 ? -1 : 1; g.objs.push({ k: 'sombraDuelo', jefe: o, dir, x: dir > 0 ? o.x0 - 20 : o.x1 + 20, alto: i === 1 || i === 3 ? (i === 3 ? 0 : 1) : (i === 2 ? 1 : 0), t: 0 }); } }
      if (a > 3.7) for (let i = 0; i < 4; i++) o['s' + i] = 0;
    },
    // la fase final: embestida, pisotón y embestida, sin descanso
    danza(o) { o.cadena = 3; o.atk = 'embestida'; o.at = 0; o.dur = 99; },
  };

  // ---------- Zarzamora ----------
  function zarzamora(o, g, dt) {
    const z = o.z, fr = g.fre; z.t += dt; z.ver = Math.min(1, z.ver + dt * 2);
    if (z.sueno > 0) { z.sueno -= dt; z.y += (FLOOR - 8 - z.y) * Math.min(1, dt * 2.5); return; }
    // la canción de cuna de Fresita la duerme y rompe el escudo
    if (g.lull && g.t - g.lull.t < .05 && Math.hypot(z.x - g.lull.x, z.y - g.lull.y) < g.lull.r + 14) {
      z.sueno = 4.6; MEC.ring(g, z.x, z.y, '#b9a7ff', 30, .6); spawn(g, 16, z.x, z.y, { v: 80, life: .6, s: 2, k: 'spark', cols: ['#b9a7ff', '#ffffff'] });
      if (o.escudo) { o.escudo = false; MEC.ring(g, o.x, o.y - 10, '#ffffff', 34, .5); spawn(g, 26, o.x, o.y - 10, { v: 130, life: .6, s: 2.2, k: 'spark', cols: [VIOLETA, '#ffffff', MAG] }); g.shake = Math.max(g.shake || 0, .2); }
      return;
    }
    const tx = o.st === 'ventana' ? o.x - o.face * 15 : o.x - o.face * 20, ty = o.y - 28 + Math.sin(z.t * 2.4) * 4;
    z.x += (tx - z.x) * Math.min(1, dt * 4); z.y += (ty - z.y) * Math.min(1, dt * 4);
    z.cd -= dt;
    if (z.cd <= 0 && o.st !== 'muere') { z.cd = o.furia ? 2.4 : 3.6; const dx = fr.x - z.x, dy = fr.y - z.y, d = Math.hypot(dx, dy) || 1; o.orbs.push({ c: 'blanca', col: '#d81f4e', x: z.x, y: z.y, vx: dx / d * 70, vy: dy / d * 70, life: 3.6 }); z.lanza = .3; }
    z.lanza = Math.max(0, (z.lanza || 0) - dt);
  }

  // ---------- chocar como espadas ----------
  function choque(o, g) {
    const p = g.p; if (o.st !== 'ataque' && !(o.st === 'ventana' && o.escudo)) return; o.cdChoque = Math.max(0, (o.cdChoque || 0) - 1 / 60); if (o.cdChoque > 0) return;
    const encima = p.vy > 0 && Math.abs(p.x - o.x) < 14 && p.y > o.y - 26 && p.y < o.y - 8, frente = o.atk === 'reflejo' && o.at < 2.9 && Math.abs(p.x - o.x) < 11 && Math.abs(p.y - o.y) < 12;
    if (!encima && !frente) return;
    o.cdChoque = .3; p.inv = Math.max(p.inv || 0, .4); const lado = Math.sign(p.x - o.x) || 1;
    if (encima) { p.vy = -340; p.noCut = true; p.on = false; } else { p.vx = lado * 260; p.boost = .16; p.vy = Math.min(p.vy, -120); p.on = false; o.x -= lado * 12; }
    const x = (p.x + o.x) / 2, y = encima ? o.y - 20 : p.y - 8; MEC.ring(g, x, y, '#ffffff', 26, .35); spawn(g, 18, x, y, { v: 170, life: .4, s: 1.8, k: 'spark', cols: ['#ffffff', MAG, '#ffe07a'] }); g.shake = Math.max(g.shake || 0, .22); o.flashChoque = .12;
    if (o.escudo) return;
    if (++o.choques >= 3) { o.choques = 0; o.st = 'ventana'; o.at = 0; o.ventanaT = 2.8; o.fx = null; o.vx = 0; o.dash = 0; o.cadena = 0; o.desbalance = 1; o.vy = 0; }
  }

  // ---------- el paso del duelo ----------
  function duelo(o, g, dt) {
    if (!o.salaLista && o.st !== 'entra') preparaSala(o, g, true);
    const p = g.p; o.polvo = 0; o.luz = Math.max(0, o.luz - dt * 1.5); o.flashChoque = Math.max(0, (o.flashChoque || 0) - dt); o.pose = null;
    for (const q of o.ecos) q.t -= dt; o.ecos = o.ecos.filter(q => q.t > 0);
    if (o.st === 'entra') {
      o.intro -= dt; const t = INTRO - o.intro;
      o.at = o.intro > 0 ? 0 : 3; // el jefe no arranca hasta que ella termine de levantarse
      if (t >= ROMPE && !o.salaLista) preparaSala(o, g);
      o.sale = clamp((t - 2.1) / 1.9, 0, 1); o.face = Math.sign(p.x - o.x) || -1;
      if (t > 3.9) { const z = o.z; z.ver = Math.min(1, z.ver + dt); z.y += (o.y - 32 - z.y) * Math.min(1, dt * 2.6); z.x += (o.x - 20 - z.x) * Math.min(1, dt * 2.6); }
      if (t > 4.05 && !o.ojos) { o.ojos = 1; g.shake = .3; MEC.ring(g, o.x, o.y - 16, MAG, 34, .6); }
      return;
    }
    if (o.st === 'muere') {
      o.vx = 0; o.y = Math.min(o.y, FLOOR); mueve(o, dt); o.z.sueno = 9; zarzamora(o, g, dt);
      if (!o.finT) { o.finT = .001; g.shake = .7; MEC.ring(g, o.x, o.y - 12, '#ffffff', 60, .9); }
      if (o.finT < FIN) { o.finT += dt; o.at = 0; } // el jefe no se va hasta que ella termine
      return;
    }
    if (o.st === 'herido' || (o.st === 'ataque' && o.ultimoAtk !== o.ataques)) { o.ataques = FASES[fase(o)]; o.ultimoAtk = o.ataques; }
    o.pal.c = o.furia ? MAG : '#2a0f3e';
    zarzamora(o, g, dt);
    if (o.st === 'ataque') {
      if (ATK[o.atk]) ATK[o.atk](o, g, dt, o.at); else o.atk = 'embestida';
      if (o.polvo) spawn(g, 10, o.x, FLOOR, { ang: -Math.PI / 2, spread: 2.4, v: 60, life: .4, s: 2, k: 'dust', cols: ['#dfe6f2'] });
    } else {
      // descansa: jadea, y desde la fase 2 Zarzamora la cubre
      o.fx = null; o.dash = 0; o.vx *= Math.pow(.01, dt); mueve(o, dt);
      if (o.st === 'ventana') {
        if (o.at < .05 && !o.desbalance) { o.ventanaT = o.furia ? 2.1 : 3.3; o.escudo = fase(o) >= 2 && o.z.sueno <= 0; if (o.escudo) { o.ventanaT = 5; MEC.ring(g, o.x, o.y - 10, VIOLETA, 30, .5); } }
        if (o.z.sueno > 0 && o.escudo) o.escudo = false;
        o.mode = o.escudo ? 'escudo' : 'alcance';
        o.textoVentana = o.escudo ? '¡Fresita! Clic derecho cerca de Zarzamora para romper el escudo' : o.desbalance ? '¡Perdió el equilibrio! Cáele encima' : '¡Está cansada! Cáele encima';
      } else { o.escudo = false; o.mode = 'alcance'; o.desbalance = 0; }
    }
    if (o.st === 'ataque') { o.mode = 'alcance'; o.escudo = false; o.desbalance = 0; }
    choque(o, g);
  }
  const stepViejo = X.STEP.ruptura;
  X.STEP.ruptura = (o, g, dt) => { if (!esDuelo(o)) return stepViejo(o, g, dt); duelo(o, g, dt); if (o.st === 'muere') RUPTURA_FORMAS.registra(o, g); };

  // ---------- sus sombras ----------
  OBJ.sombraDuelo = {
    front: true,
    step(o, g, dt) {
      o.t += dt; const j = o.jefe; if (!j || j.st === 'muere' || g.boss !== j) { o.dead = true; return; } if (o.t < .55) return;
      o.x += o.dir * 340 * dt; const y1 = o.alto ? FLOOR - 26 : FLOOR, y0 = y1 - 18; hurtIfIn(g, o.x - 7, y0, o.x + 7, y1);
      if (o.dir > 0 ? o.x > j.x1 + 30 : o.x < j.x0 - 30) o.dead = true;
    },
    draw(c, o, f) {
      const j = o.jefe, y = o.alto ? FLOOR - 26 : FLOOR;
      if (o.t < .55) { const k = o.t / .55; c.fillStyle = rgba(MAG, .1 + .2 * Math.abs(Math.sin(f.t * 16))); c.fillRect(j.x0 - 8, y - 18, j.x1 - j.x0 + 16, 18); c.strokeStyle = rgba(MAG, .5 + k * .4); c.lineWidth = .7; c.setLineDash([4, 3]); c.lineDashOffset = o.dir * f.t * -40; c.beginPath(); c.moveTo(j.x0 - 8, y - 9); c.lineTo(j.x1 + 8, y - 9); c.stroke(); c.setLineDash([]); return; }
      c.save(); c.globalAlpha = .82; ponSprite(c, OSCURA, o.x, y, o.dir < 0); c.restore();
    },
  };

  // ---------- los retratos: el dibujo real de cada estilo, teñido ----------
  const lienzo = () => { const c = document.createElement('canvas'); return { c, x: c.getContext('2d') }; };
  const ITZEL = lienzo(), OSCURA = lienzo(), ESTELA = lienzo(), FRESA = lienzo(), ZARZA = lienzo(), AN = 90, AL = 72, PIE = 62;
  function retrata(L, f, tinte, pinta) {
    const S = f.S, W = Math.round(AN * S), H = Math.round(AL * S); if (L.c.width !== W || L.c.height !== H) { L.c.width = W; L.c.height = H; } const x = L.x;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, W, H); x.imageSmoothingEnabled = !f.st.pixel;
    x.setTransform(S, 0, 0, S, AN / 2 * S, PIE * S); pinta(x);
    if (tinte) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-atop'; x.fillStyle = tinte; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
  }
  function ponSprite(c, L, x, y, voltea) { c.save(); c.translate(x, y); if (voltea) c.scale(-1, 1); c.imageSmoothingEnabled = false; c.drawImage(L.c, -AN / 2, -PIE, AN, AL); c.restore(); }
  const OTRA = hazItzel(TITERES_DATOS.otra); // el mismo títere que Itzel, con la ilustración de su reflejo
  const arteOtra = imgPerezosa('../Roguelike/assets/personajes/otra-itzel-nueva.png'), arteZarza = imgPerezosa('../Roguelike/assets/personajes/zarzamora-nueva.png');
  const lista = img => img.complete && img.naturalWidth > 0;
  // Cada franja se pinta una sola vez: la silueta ondula sin duplicar brazos ni pies.
  function nuevaOtra(x, o, f) {
    const w = 25, h = 37, paso = 8, marcha = Math.min(1, Math.abs(o.vx || 0) / 120);
    x.save(); x.scale(o.face < 0 ? -1 : 1, 1);
    // Mantiene la misma silueta; inclina el cuerpo al prepararse y al recibir daño.
    const a = o.at || 0, aviso = o.st === 'ataque' && o.pose === 'agacha' ? -.10 * Math.min(1, a * 4) : 0;
    const herida = o.st === 'herido' || o.flash > 0 ? .10 * Math.sin(a * 18) * Math.exp(-a * 3.5) : 0;
    x.translate(0, -15); x.rotate(aviso + herida); x.translate(0, 15);
    for (let sy = 0; sy < arteOtra.height; sy += paso) {
      const sh = Math.min(paso, arteOtra.height - sy), u = sy / arteOtra.height;
      const vaiven = Math.sin(f.t * (marcha ? 10 : 2.8) + u * 4) * (marcha * .55 + .12) * Math.abs(u - .7);
      x.drawImage(arteOtra, 0, sy, arteOtra.width, sh, -w / 2 + vaiven, -h + u * h, w, sh / arteOtra.height * h + .015);
    }
    x.restore();
  }
  function nuevaZarza(x, o, f) {
    const w = 24, h = 12, paso = 12;
    x.save(); x.translate(0, -30); x.scale(o.x > o.z.x ? 1 : -1, 1);
    for (let sx = 0; sx < arteZarza.width; sx += paso) {
      const sw = Math.min(paso, arteZarza.width - sx), u = sx / arteZarza.width;
      const cola = Math.sin(f.t * 6 + u * 5) * (1 - u) * .65;
      x.drawImage(arteZarza, sx, 0, sw, arteZarza.height, -w / 2 + u * w, -h / 2 + cola, sw / arteZarza.width * w + .015, h);
    }
    x.restore();
  }
  function retratos(o, f) {
    if (o.cuadro === f.t) return; o.cuadro = f.t; const g = f.g, st = f.st, p = g.p, neg = o.furia && o.st !== 'muere', aclara = 1 - clamp((o.finT || 0) / FIN, 0, 1);
    if (st.player) {
      retrata(ITZEL, f, null, x => { st.player(x, Object.assign({}, p, { x: 0, y: 0, vis: true }), f); });
      retrata(OSCURA, f, neg ? 'rgba(244,236,255,.97)' : null, x => { if (lista(arteOtra)) nuevaOtra(x, o, f); else OTRA(x, { titere: 'otra', x: 0, y: 0, vx: o.vx, vy: o.vy, on: o.on, face: o.face, crouch: o.pose === 'agacha', dash: Math.abs(o.vx) > 300 ? 1 : 0, sq: 0, inv: 0 }, f); });
    }
    if (o.ecos.length) { const q = ESTELA, W = OSCURA.c.width, H = OSCURA.c.height; if (q.c.width !== W || q.c.height !== H) { q.c.width = W; q.c.height = H; } const x = q.x; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.drawImage(OSCURA.c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = neg ? '#ff4fd8' : '#b12ee0'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
    if (st.fresita) {
      retrata(FRESA, f, null, x => st.fresita(x, { x: 0, y: -30, face: g.fre.face || 1 }, f));
      retrata(ZARZA, f, lista(arteZarza) ? null : neg ? 'rgba(244,236,255,.95)' : `rgba(30,8,44,${.92 * aclara})`, x => { if (lista(arteZarza)) nuevaZarza(x, o, f); else st.fresita(x, { titere: 'zarza', x: 0, y: -30, face: o.x > o.z.x ? 1 : -1 }, f); });
    }
  }
  // en el agua todo se ve de cabeza y temblando
  function reflejo(c, L, x, y, alfa, t) {
    const sep = FLOOR - y, S = L.c.width / AN, paso = 4; if (sep > 90) return; c.save(); c.globalAlpha *= alfa * clamp(1 - sep / 90, .2, 1); c.imageSmoothingEnabled = false;
    for (let d = 0; d < PIE; d += paso) { const dx = Math.sin(t * 3 + d * .22) * (.4 + d * .03); c.save(); c.translate(x + dx, FLOOR + sep + d + paso); c.scale(1, -1); c.drawImage(L.c, 0, (PIE - d - paso) * S, L.c.width, paso * S, -AN / 2, 0, AN, paso + .3); c.restore(); }
    c.restore();
  }
  function ojos(c, o, f) {
    if (!lista(arteZarza) && o.z.ver > 0 && o.z.sueno <= 0) { const z = o.z, s = o.x > z.x ? 1 : -1; c.fillStyle = '#ff3a5c'; c.fillRect(z.x + s * 4 - .6, z.y - 1.6, 1.2, 1.6); c.fillRect(z.x + s * 7.5 - .4, z.y - 2, .8, 1.5); }
  }

  // ---------- la sala: niebla perlada, agua que refleja y una ceiba sin hojas ----------
  function pintaSala(x, noche, fuerte) {
    const cielo = x.createLinearGradient(0, 0, 0, FLOOR); if (noche) { cielo.addColorStop(0, '#05030c'); cielo.addColorStop(.75, '#150a2c'); cielo.addColorStop(1, '#2c1250'); } else { cielo.addColorStop(0, '#aeb7c8'); cielo.addColorStop(.6, '#dfe5ee'); cielo.addColorStop(1, '#f6f8fb'); }
    x.fillStyle = cielo; x.fillRect(0, 0, VW, FLOOR);
    // arcos lejanos y una ceiba seca entre la niebla
    x.fillStyle = noche ? 'rgba(120,70,190,.2)' : 'rgba(120,132,156,.34)';
    for (let i = 0; i < 6; i++) { const a = 14 + i * 76, w = 22; x.beginPath(); x.moveTo(a, FLOOR); x.lineTo(a, 74); x.arc(a + w / 2, 74, w / 2, Math.PI, 0); x.lineTo(a + w, FLOOR); x.closePath(); x.fill(); }
    const rama = (a, b, an, l, n) => { const c = a + Math.cos(an) * l, d = b + Math.sin(an) * l; x.lineWidth = n * 1.5 + .6; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); if (n > 0) { rama(c, d, an - .44, l * .74, n - 1); rama(c, d, an + .4, l * .72, n - 1); } };
    x.strokeStyle = noche ? 'rgba(170,110,240,.5)' : 'rgba(70,78,98,.5)'; x.lineCap = 'round'; rama(VW / 2, FLOOR, -Math.PI / 2, 44, 5);
    x.lineCap = 'butt'; for (let i = 0; i < 40; i++) { const a = hash1(i, 61) * VW, b = 40 + hash1(i, 62) * (FLOOR - 50), r = 16 + hash1(i, 63) * 40; x.fillStyle = noche ? 'rgba(90,50,160,.05)' : 'rgba(255,255,255,.1)'; x.beginPath(); x.ellipse(a, b, r * 1.8, r * .5, 0, 0, TAU); x.fill(); }
    const agua = x.createLinearGradient(0, FLOOR, 0, VH); if (noche) { agua.addColorStop(0, '#3a1a68'); agua.addColorStop(1, '#07030f'); } else { agua.addColorStop(0, '#eef2f7'); agua.addColorStop(1, '#8e9ab0'); }
    x.fillStyle = agua; x.fillRect(0, FLOOR, VW, VH - FLOOR + 8);
    x.strokeStyle = noche ? 'rgba(255,79,216,.75)' : 'rgba(255,255,255,.95)'; x.lineWidth = .8; x.beginPath(); x.moveTo(0, FLOOR + .4); x.lineTo(VW, FLOOR + .4); x.stroke();
    x.strokeStyle = noche ? 'rgba(200,160,255,.16)' : 'rgba(255,255,255,.3)'; x.lineWidth = .5; for (let i = 0; i < 22; i++) { const a = hash1(i, 71) * VW, b = FLOOR + 6 + hash1(i, 72) * (VH - FLOOR - 10); x.beginPath(); x.moveTo(a, b); x.lineTo(a + 12 + hash1(i, 73) * 34, b); x.stroke(); }
    if (fuerte && !noche) { x.globalCompositeOperation = 'multiply'; x.fillStyle = '#7f8594'; x.fillRect(0, 0, VW, VH + 8); x.globalCompositeOperation = 'source-over'; x.strokeStyle = '#ffffff'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, FLOOR + .7); x.lineTo(VW, FLOOR + .7); x.stroke(); }
  }
  OBJ.salaEspejo = {
    step(o, g, dt) {
      o.t += dt; const j = o.jefe; if (g.boss !== j) { o.dead = true; return; }
      o.v += ((j.salaLista ? 1 : 0) - o.v) * Math.min(1, dt * 2.6);
      o.neg += ((j.furia && j.st !== 'muere' ? 1 : 0) - o.neg) * Math.min(1, dt * 3.2);
    },
    draw(c, o, f) {
      if (enCine() || o.v < .01) return;
      const g = f.g, j = o.jefe, y0 = Math.min(0, f.y0 || 0), H = f.H || VH, mundo = g.def && STYLE_MAP[g.def.id], fuerte = !!(mundo && mundo.process); retratos(j, f);
      c.save(); c.globalAlpha = clamp(o.v, 0, 1);
      c.fillStyle = o.neg > .5 ? '#05030c' : fuerte ? '#575c68' : '#aeb7c8'; c.fillRect(g.cam - 2, y0 - 2, VW + 4, -y0 + 4);
      c.drawImage(cached(f, 'sala-dia', VW, VH + 8, x => pintaSala(x, false, fuerte)), g.cam, 0, VW, VH + 8);
      if (o.neg > .01) { c.globalAlpha = clamp(o.v, 0, 1) * o.neg; c.drawImage(cached(f, 'sala-noche', VW, VH + 8, x => pintaSala(x, true)), g.cam, 0, VW, VH + 8); }
      c.restore();
      if (o.v > .05) { c.save(); c.globalAlpha = clamp(o.v * 1.4, 0, 1); const noche = o.neg > .5, cara = noche ? '#2a1250' : fuerte ? '#2c303c' : '#c3cbd9', sombra = noche ? '#12082a' : fuerte ? '#14161e' : '#8d97aa', luz = noche ? '#ff7ae0' : '#f6f8fb';
        for (const col of ISLAS) { const x = (col + PAD) * T, y = FILA_ISLA * T, w = ANCHO_ISLA * T; c.fillStyle = sombra; c.fillRect(x, y + 4, w, T - 4); c.fillStyle = cara; c.fillRect(x, y, w, 7); c.fillStyle = luz; c.fillRect(x, y, w, 1.4); c.fillStyle = sombra; for (let i = 8; i < w; i += 16) c.fillRect(x + i, y + 8, 1, T - 8); c.fillStyle = rgba(noche ? '#7a4dff' : '#ffffff', .14); c.beginPath(); c.moveTo(x + 4, y + T); c.lineTo(x + w - 4, y + T); c.lineTo(x + w - 14, FLOOR); c.lineTo(x + 14, FLOOR); c.closePath(); c.fill(); }
        for (const x of [(PAD - 1) * T, (PAD + 27) * T]) { c.fillStyle = sombra; c.fillRect(x, y0, 2 * T, FLOOR - y0); c.fillStyle = cara; c.fillRect(x + 3, y0, 2 * T - 6, FLOOR - y0); }
        c.restore(); }
      // los reflejos: la sala solo existe cuando ya hay agua
      if (o.v < .25) return; c.save(); c.globalAlpha = clamp((o.v - .25) * 1.4, 0, 1);
      const p = g.p, t = f.t, ve = j.sale >= 1 || j.st !== 'entra', dibuja = (L, x, y, a) => { if (L.c.width) reflejo(c, L, x, y, a, t); };
      if (p.vis !== false) dibuja(ITZEL, p.x, p.y, .42); if (g.fre && !g.sinFresita) dibuja(FRESA, g.fre.x, g.fre.y + 30, .3);
      if (j.st === 'entra') { if (j.sale < 1) dibuja(OSCURA, j.x, FLOOR, .6); else dibuja(OSCURA, j.x, j.y, .5); } else if (ve) dibuja(OSCURA, j.x, j.y, .5);
      if (j.z.ver > 0) dibuja(ZARZA, j.z.x, j.z.y + 30, .3 * j.z.ver);
      for (const q of [p, j]) if (q.y >= FLOOR - 2) { const k = (t * .9 + q.x * .01) % 1; c.strokeStyle = rgba(o.neg > .5 ? '#ff9ae6' : '#ffffff', .6 * (1 - k)); c.lineWidth = .7; c.beginPath(); c.ellipse(q.x, FLOOR + 2, 6 + k * 18, 1 + k * 2, 0, 0, TAU); c.stroke(); }
      c.restore();
    },
  };

  // ---------- avisos ----------
  const tellViejo = X.TELL.ruptura;
  X.TELL.ruptura = (c, o, f) => {
    if (!esDuelo(o) || enCine()) return tellViejo(c, o, f);
    const g = f.g, t = f.t, a = o.at;
    if (o.fx === 'linea') { const dir = o.face, x1 = dir > 0 ? o.x1 + 8 : o.x0 - 8, u = clamp(a / .62, 0, 1); c.fillStyle = rgba(MAG, .08 + .16 * Math.abs(Math.sin(t * 18))); c.fillRect(Math.min(o.x, x1), FLOOR - 18, Math.abs(x1 - o.x), 18); c.strokeStyle = rgba(MAG, .5 + u * .4); c.lineWidth = 1; c.setLineDash([5, 3]); c.lineDashOffset = -dir * t * 60; c.beginPath(); c.moveTo(o.x, FLOOR - 9); c.lineTo(x1, FLOOR - 9); c.stroke(); c.setLineDash([]); }
    if (o.fx === 'sombra') { const k = clamp((FLOOR - o.y) / 130, 0, 1); c.fillStyle = 'rgba(20,8,36,.5)'; c.beginPath(); c.ellipse(o.x, FLOOR + 1, 18 - k * 8, 3, 0, 0, TAU); c.fill(); c.strokeStyle = rgba(MAG, .55 + Math.sin(t * 22) * .3); c.lineWidth = 1; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x, FLOOR); c.stroke(); c.setLineDash([]); }
    if (o.fx === 'carga' || o.fx === 'invoca') { for (let n = 0; n < 8; n++) { const an = n / 8 * TAU + t * 3, r = 26 * (1 - (t * 2 + n / 8) % 1); c.fillStyle = rgba(MAG, .8); c.beginPath(); c.arc(o.x + Math.cos(an) * r, o.y - 10 + Math.sin(an) * r, 1, 0, TAU); c.fill(); } }
  };

  // ---------- ella y Zarzamora ----------
  const bodyViejo = X.BODY.ruptura;
  const cuerpoDuelo = (c, o, f) => {
    const t = f.t, g = f.g;
    if (!o.salaLista && o.st !== 'entra') preparaSala(o, g, true);
    // el espejo se agrieta antes de reventar
    if (!o.salaLista) { const u = clamp((INTRO - o.intro) / ROMPE, 0, 1), xm = mid(o); c.save(); c.translate(xm + Math.sin(t * 60) * u * 1.6, 72); RUPTURA.dibuja(c, 8, t, {}); c.strokeStyle = '#ffffff'; c.lineWidth = .9; c.beginPath(); for (let i = 0; i < 7; i++) { const an = i * 2.4 + .3, l = 12 + (i % 3) * 16; c.moveTo(0, 0); c.lineTo(Math.cos(an) * l * u * .6, Math.sin(an) * l * u * .6); c.lineTo(Math.cos(an + .3) * l * u * 1.5, Math.sin(an + .3) * l * u * 1.5); } c.stroke(); c.restore(); return; }
    retratos(o, f);
    // la estela de sus embestidas
    for (const q of o.ecos) { c.save(); c.globalAlpha = q.t / .34 * .6; ponSprite(c, ESTELA, q.x, q.y, q.face < 0); c.restore(); }
    c.save();
    if (o.st === 'muere') {
      const u = clamp(o.at / 2.2, 0, 1), k = clamp(((o.finT || 0) - .5) / .4, 0, 1) * (1 - u); c.beginPath(); c.rect(o.x - 60, -60, 120, FLOOR + 60); c.clip(); ponSprite(c, OSCURA, o.x, o.y + u * 34); c.restore();
      if (k > 0) { const cx = g.cam + VW / 2; c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.font = 'italic 700 13px Alegreya, Georgia, serif'; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.8)'; c.strokeText('Otra vez es tu reflejo', cx, 74); c.fillStyle = '#160a22'; c.fillText('Otra vez es tu reflejo', cx, 74); c.textAlign = 'left'; c.restore(); }
      for (let i = 0; i < 5; i++) { const k = (t * .8 + i / 5) % 1; c.strokeStyle = rgba('#ffffff', (1 - k) * (1 - u)); c.lineWidth = .8; c.beginPath(); c.ellipse(o.x, FLOOR + 1, 8 + k * 46, 1.4 + k * 4, 0, 0, TAU); c.stroke(); }
      if (o.z.ver > 0) { c.save(); c.globalAlpha = 1 - u; ponSprite(c, ZARZA, o.z.x, o.z.y + 30); c.restore(); }
      return;
    }
    if (o.st === 'entra') {
      // se levanta del agua: lo que sigue bajo la superficie no se ve
      c.beginPath(); c.rect(o.x - 60, -60, 120, FLOOR + 60); c.clip();
      ponSprite(c, OSCURA, o.x, FLOOR + (1 - o.sale) * 28); c.restore();
      if (o.sale > 0 && o.sale < 1) for (let i = 0; i < 3; i++) { const k = (t * 1.3 + i / 3) % 1; c.strokeStyle = rgba('#ffffff', 1 - k); c.lineWidth = .9; c.beginPath(); c.ellipse(o.x, FLOOR + 1, 7 + k * 32, 1.4 + k * 3, 0, 0, TAU); c.stroke(); }
      if (o.ojos) ojos(c, o, f); if (o.z.ver > 0) { c.save(); c.globalAlpha = o.z.ver; ponSprite(c, ZARZA, o.z.x, o.z.y + 30); c.restore(); }
      const u = INTRO - o.intro, k = clamp((u - 4.3) / .4, 0, 1) * clamp((INTRO - .1 - u) / .4, 0, 1);
      if (k > 0) { const cx = g.cam + VW / 2; c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.font = '700 20px Alegreya, Georgia, serif'; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.75)'; c.strokeText('La otra Itzel', cx, 70); c.fillStyle = '#160a22'; c.fillText('La otra Itzel', cx, 70); c.font = 'italic 600 9px Alegreya, Georgia, serif'; c.fillStyle = '#5a2a70'; c.fillText('Tu reflejo ya no te obedece', cx, 83); c.textAlign = 'left'; c.restore(); }
      return;
    }
    const brillo = o.flash > 0 && Math.sin(t * 40) > 0;
    if (!brillo) { c.shadowColor = o.furia ? '#ff2bb0' : MAG; c.shadowBlur = (o.furia ? 5 : 3) * f.S; }
    if (o.st === 'ventana') { const dy = Math.sin(t * 9) * .7; c.translate(0, dy); }
    ponSprite(c, OSCURA, o.x, o.y); c.restore(); ojos(c, o, f);
    if (o.flashChoque > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 12, 30, '#ffffff', o.flashChoque * 7); c.restore(); }
    // Zarzamora
    const z = o.z; if (z.ver > 0) { c.save(); if (z.sueno <= 0) { c.shadowColor = '#ff3a5c'; c.shadowBlur = 2.4 * f.S; } ponSprite(c, ZARZA, z.x, z.y + 30, false); c.restore(); if (z.sueno > 0) { c.fillStyle = '#ffffff'; c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.fillText('z', z.x + 5, z.y - 8 + Math.sin(t * 3) * 2); } if (z.lanza) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, z.x, z.y, 12, '#ff3a5c', z.lanza * 2); c.restore(); } }
    // el escudo
    if (o.escudo) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 12, 24, VIOLETA, .3); c.restore(); c.strokeStyle = rgba(VIOLETA, .8); c.lineWidth = 1.1; c.beginPath(); c.arc(o.x, o.y - 12, 17 + Math.sin(t * 6), 0, TAU); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .5; for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + t; c.beginPath(); c.arc(o.x, o.y - 12, 17, an, an + .4); c.stroke(); } }
    // estrellitas cuando se marea
    if (o.st === 'ventana' && !o.escudo) for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(o.x + Math.cos(an) * 8, o.y - 25 + Math.sin(an) * 2.4, 1.1, 0, TAU); c.fill(); }
    // los choques que lleva
    if (o.choques) { for (let i = 0; i < 3; i++) { c.fillStyle = i < o.choques ? '#ffffff' : 'rgba(255,255,255,.25)'; c.fillRect(o.x - 7 + i * 5, o.y - 31, 3.6, 1.4); } }
  };
  // el jefe normal pasa por un lienzo recortado alrededor de él (pixel, acuarela...) y aquí se saldrían
  // el título, la estela y el destello: en el duelo todo se dibuja en su propia capa, sobre la pantalla entera
  X.BODY.ruptura = (c, o, f) => { if (!esDuelo(o) || enCine()) bodyViejo(c, o, f); };
  OBJ.duelista = {
    front: true,
    step(o, g) { if (g.boss !== o.jefe) o.dead = true; },
    draw(c, o, f) {
      const j = o.jefe; if (enCine() || f.g.boss !== j) return; cuerpoDuelo(c, j, f);
      if (j.luz > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = `rgba(255,255,255,${Math.min(1, j.luz)})`; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); }
    },
  };
})();
