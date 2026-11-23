'use strict';
// =====================================================================
//  EL DIBUJO DE LOS SUBJEFES
//  Cada subjefe es una criatura suya, sacada de algo real de Campeche
//  (la culebrina de un baluarte, el pulpo maya, la escalera de Bolonchén,
//  la ceiba con espinas, el chapopote de Cantarell…). Se dibujan de lado,
//  mirando a la derecha, con los pies en y = 0, y el acabado de cada mundo
//  se les pone encima (enemigos-arte.js → la técnica de los jefes).
//  Lo que usan del subjefe para moverse:
//    e.fase (anda, aviso, ataque, cansado, huye), e.ft (tiempo en la fase),
//    e.paso (lo caminado), e.giro (lo rodado), e.hunde (0 afuera, 1 bajo el
//    piso), e.alfa, e.agacha, e.alza, e.espinas, e.tumbada, e.volteada,
//    e.boca, e.presion.
//  También: sus crías (CRIA), lo que avientan (PROY) y sus pilares (PILAR).
// =====================================================================
window.SUBJEFES_ARTE = (() => {
  const LN = '#1a1018';
  const K = () => window.FOE_KIT;
  const V = (c, path, col, o = {}) => K().vol(c, path, col, Object.assign({ ln: LN, lw: .7 }, o));
  const L = (c, pts, w, col, o = {}) => K().trazo(c, pts, w, col, Object.assign({ ln: LN, lw: .8 }, o));
  const el = (x, y, rx, ry, r = 0) => c => c.ellipse(x, y, rx, ry, r, 0, TAU);
  const pl = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
  const rr = (x, y, w, h, r) => c => roundRect(c, x, y, w, h, r);
  const nubes = l => c => { for (const [x, y, r, k] of l) { c.moveTo(x + r, y); c.ellipse(x, y, r, r * (k || .85), 0, 0, TAU); } };
  const cansado = e => e.fase === 'cansado';
  const enojado = e => e.fase === 'aviso' || e.fase === 'ataque' ? .85 : .3;
  // los ojos: en espiral cuando está cansado (ahí se le puede caer encima)
  const ojo = (c, e, t, x, y, r, o = {}) => K().ojo(c, cansado(e) ? { st: 'stun', hx: e.hx } : e, t, x, y, r, Object.assign({ ln: LN, enojo: enojado(e) }, o));
  const av = e => e.fase === 'aviso' ? clamp(e.ft / (e.avT || .7), 0, 1) : 0;
  const boca = (c, x, y, r, abierta, col = '#5a1418') => {
    c.save(); c.strokeStyle = LN; c.lineWidth = .7; c.lineCap = 'round';
    if (abierta > .05) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * .55 * abierta + .4, 0, 0, TAU); c.fill(); c.stroke(); }
    else { c.beginPath(); c.arc(x, y - r * .6, r, .25 * Math.PI, .75 * Math.PI); c.stroke(); }
    c.restore();
  };
  const estrella = (c, x, y, r, col, puntas = 5, k = .45) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / puntas, q = i % 2 ? r * k : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); };
  const humo = (c, x, y, t, n = 3, col = 'rgba(220,214,206,') => { for (let i = 0; i < n; i++) { const k = (t * .6 + i / n) % 1; c.fillStyle = col + (.5 * (1 - k)).toFixed(2) + ')'; c.beginPath(); c.arc(x + Math.sin(k * 6 + i) * 2, y - k * 12, 1.4 + k * 3, 0, TAU); c.fill(); } };
  const patas = (c, e, xs, largo, grosor, col, fase = 0) => { const w = e.paso || 0; xs.forEach((x, i) => { const s = Math.sin(w * .3 + i * Math.PI + fase), lift = Math.max(0, s) * 2.4; L(c, [[x, -largo], [x + s * 1.6, -lift]], grosor, col); }); };
  const forge = {
    caracol: { archivo: 'caracol-reina-v1/processed', acciones: ['retraerse y asomarse: dos poses', 'aviso de corriente', 'ataque de remolino o burbujas', 'cansado vulnerable'], cajas: [[59,79,138,97],[65,81,126,95],[53,82,151,94],[54,80,147,96]], escala: [151,97], altoCentro: false },
    copo: { archivo: 'copo-nevada-v1/processed', acciones: ['flotar: dos poses alternadas', 'aviso plegado', 'ataque de brazos extendidos', 'cansado vulnerable'], cajas: [[63,53,130,150],[78,58,99,140],[53,55,150,146],[70,59,115,137]], escala: [150,150], altoCentro: true },
    tortuga: { archivo: 'tortuga-orion-v1/processed', acciones: ['nado: dos poses de patas', 'aviso de picada o granizo', 'picada', 'volteada y cansada vulnerable'], cajas: [[53,85,150,85],[56,90,143,76],[59,87,138,83],[59,84,138,88]], escala: [150,88], altoCentro: true },
    volcan: { archivo: 'volcan-chichonal-v1/processed-v2', acciones: ['caminar: pie izquierdo y derecho', 'aviso de erupción', 'erupción y ataque', 'cansancio: estrellas de vulnerabilidad'], cajas: [[56,57,152,141],[51,57,152,142],[53,71,153,128],[50,21,154,178]], escala: [154,178], altoCentro: false },
    cazon: { archivo: 'cazon-calle8-v1/processed', acciones: ['nado con cola arriba/abajo', 'latigazo y aviso', 'salto de ataque', 'aleta sumergida', 'cansancio: estrellas de vulnerabilidad'], cajas: [[53,84,167,87],[35,85,180,102],[52,49,157,144],[66,105,109,49]], escala: [180,144], ajustesEscala: [1.18,1,1,1], altoCentro: false },
    llave: { archivo: 'llave-mar-v1/processed', acciones: ['flotar vertical e inclinada', 'aviso ladeado', 'vuelta de llave', 'cansada vulnerable'], cajas: [[91,41,71,175],[74,44,91,171],[55,43,147,156],[85,44,94,169]], escala: [94,175], altoCentro: true },
    culebrina: { archivo: 'culebrina-v1/processed-v2', acciones: ['reposo', 'rodaje', 'apuntar', 'disparo'], cajas: [[84,140,131,72],[51,140,131,72],[83,121,117,91],[84,138,137,74]], escala: [137,91], altoCentro: false },
    sol: { archivo: 'sol-v1/processed', acciones: ['reposo', 'aviso', 'ataque', 'cansancio'], cajas: [[59,60,137,136],[51,53,154,150],[52,52,152,153],[61,65,134,126]], escala: [154,153], altoCentro: true },
    gota: { archivo: 'gota-v1/processed', acciones: ['reposo', 'aviso', 'salto', 'cansancio'], cajas: [[44,68,168,170],[57,110,141,128],[40,57,175,181],[37,140,184,97]], escala: [184,181], altoCentro: false },
    rehilete: { archivo: 'rehilete-v1/processed', acciones: ['giro', 'embestida', 'erizo', 'mareo'], cajas: [[50,32,156,194],[42,32,171,194],[38,32,180,194],[44,32,167,194]], escala: [180,194], altoCentro: false },
    pulpo: { archivo: 'pulpo-v1/processed', acciones: ['reposo', 'aviso', 'latigazo', 'cansancio'], cajas: [[31,69,194,157],[31,72,194,154],[31,107,194,119],[31,102,194,124]], escala: [194,157], altoCentro: false },
    palotinte: { archivo: 'palotinte-v1/processed', acciones: ['reposo', 'paso', 'latigazo', 'lluvia'], cajas: [[48,46,155,186],[30,47,165,185],[23,43,168,188],[21,40,190,192]], escala: [168,192], altoCentro: false },
    mangle: { archivo: 'mangle-v1/processed', acciones: ['reposo', 'paso', 'aviso de raíces', 'lluvia de propágulos'], cajas: [[36,39,185,183],[35,45,186,177],[37,37,182,185],[35,37,186,185]], escala: [186,185], altoCentro: false },
    reflector: { archivo: 'reflector-v1/processed-v2', acciones: ['reposo', 'paso', 'rayo', 'espejismo'], cajas: [[62,36,132,186],[58,36,138,185],[35,49,187,173],[43,36,170,187]], escala: [187,187], altoCentro: false },
    bruma: { archivo: 'bruma-v1/processed', acciones: ['reposo', 'aviso de remolino', 'remolino', 'espejismo'], cajas: [[39,32,178,189],[32,34,189,190],[32,33,196,189],[33,39,192,184]], escala: [196,190], altoCentro: false },
    escalera: { archivo: 'escalera-v1/processed', acciones: ['reposo', 'aviso de salto', 'tumbo en el aire', 'caída mareada'], cajas: [[69,36,118,185],[36,39,185,183],[35,66,185,155],[48,36,158,185]], escala: [160,185], altoCentro: false },
    estela: { archivo: 'estela-v1/processed', acciones: ['reposo', 'aviso', 'salto', 'caída vulnerable'], cajas: [[56,37,142,185],[54,36,147,185],[49,36,159,185],[35,144,185,77]], escala: [159,185], altoCentro: false },
    garita: { archivo: 'garita-v1/processed', acciones: ['reposo', 'paso', 'ataque', 'cansancio vulnerable'], cajas: [[71,37,114,185],[69,37,119,185],[71,37,115,185],[55,37,146,185]], escala: [146,185], altoCentro: false },
    roseton: { archivo: 'roseton-v1/processed', acciones: ['reposo', 'giro', 'rayo', 'crías de vidrio'], cajas: [[35,40,185,182],[33,59,196,165],[36,65,188,156],[35,77,186,144]], escala: [196,182], altoCentro: false },
    lapiz: { archivo: 'lapiz-v1/processed-v2', acciones: ['reposo', 'aviso', 'salto', 'caída de punta'], cajas: [[110,37,37,184],[73,37,109,185],[63,36,131,185],[36,40,184,182]], escala: [60,185], altoCentro: false },
    mascaron: { archivo: 'mascaron-v1/processed-v2', acciones: ['reposo', 'paso', 'embestida', 'lluvia de clavos'], cajas: [[36,56,185,166],[35,63,185,159],[36,116,185,105],[44,37,167,184]], escala: [185,185], altoCentro: false },
    ola: { archivo: 'ola-v1/processed', acciones: ['reposo', 'cresta', 'rompiente', 'ondas'], cajas: [[35,124,185,98],[35,57,185,164],[36,89,184,133],[36,127,184,94]], escala: [185,164], altoCentro: false },
    ceiba: { archivo: 'ceiba-v1/processed', acciones: ['reposo', 'paso', 'espinas listas', 'tronco pelón vulnerable'], cajas: [[65,37,124,185],[66,36,123,185],[53,36,149,185],[45,36,167,185]], escala: [167,185], altoCentro: false },
    apuntador: { archivo: 'apuntador-v1/processed', acciones: ['asomar', 'emerger', 'aviso de elevadores', 'soplar y lanzar rosas'], cajas: [[36,73,184,148],[49,36,158,186],[52,36,152,186],[36,63,185,159]], escala: [185,186], altoCentro: false },
    chapopote: { archivo: 'chapopote-v1/processed', acciones: ['reposo', 'comprimirse', 'brinco', 'aterrizar y soltar crías'], cajas: [[36,135,185,86],[36,126,184,95],[34,43,187,179],[35,156,186,65]], escala: [187,179], altoCentro: false },
    fauces: { archivo: 'fauces-v1/processed', acciones: ['reposo', 'paso', 'absorber aire', 'escupir piedras'], cajas: [[50,36,155,186],[48,37,159,185],[42,36,173,185],[36,37,185,185]], escala: [185,186], altoCentro: false },
    horno: { archivo: 'horno-v1/processed', acciones: ['reposo', 'paso', 'aviso de brasas', 'ataque de brasas y jarrito'], cajas: [[58,37,139,185],[59,35,138,186],[61,36,134,185],[37,36,182,186]], escala: [182,186], altoCentro: false },
    polvorin: { archivo: 'polvorin-v1/processed', acciones: ['reposo', 'paso', 'mecha de aviso', 'soltar bombas / embestir'], cajas: [[80,37,95,185],[69,37,118,185],[68,37,120,185],[51,36,153,185]], escala: [153,185], altoCentro: false },
    tapir: { archivo: 'tapir-v1/processed-v3', acciones: ['caminar: cuatro poses', 'aviso alzando la pata', 'embestida', 'cansado vulnerable'], cajas: [[19,54,217,148],[19,64,217,127],[19,79,217,98],[19,72,217,111]], escala: [217,148], altoCentro: false },
    tarantula: { archivo: 'tarantula-v1/processed-v3', acciones: ['caminar: cuatro poses', 'aviso agachada', 'salto de ataque', 'cansada vulnerable'], cajas: [[19,42,217,171],[19,55,217,146],[19,52,217,152],[19,58,217,139]], escala: [217,171], altoCentro: false },
  };
  const forgeImgs = Object.create(null);
  const forgeBase = (() => {
    const script = [...document.scripts].find(s => /(?:^|\/)subjefes-arte\.js(?:\?|$)/.test(s.src));
    return script ? new URL('assets/forge/subjefes/', script.src).href : 'assets/forge/subjefes/';
  })();
  const tapirCaminar = new Image();
  tapirCaminar.decoding = 'async';
  tapirCaminar.src = forgeBase + 'tapir-caminar-v1/sheet-transparent.png';
  const tarantulaCaminar = new Image();
  tarantulaCaminar.decoding = 'async';
  tarantulaCaminar.src = forgeBase + 'tarantula-caminar-v1/sheet-transparent.png';
  function imagenForge(clave) {
    const cfg = forge[clave]; if (!cfg) return null;
    if (!forgeImgs[clave]) { const im = new Image(); im.decoding = 'async'; im.src = forgeBase + cfg.archivo + '/sheet-transparent.png'; forgeImgs[clave] = im; }
    return forgeImgs[clave];
  }
  // Precargar también las poses de combate evita mostrar el respaldo vectorial
  // al pasar por primera vez de caminar a avisar o atacar.
  imagenForge('tapir');
  imagenForge('tarantula');
  function cuadroForge(clave, e, t) {
    if (clave === 'caracol') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? 2 : e.fase === 'huye' ? 1 : Math.floor(t * 2) % 2;
    if (clave === 'copo') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? 2 : [0, 2][Math.floor(t * 2) % 2];
    if (clave === 'tapir') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'embestida' ? 2 : 1) : 0;
    if (clave === 'tarantula') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? 2 : 0;
    if (clave === 'tortuga') return e.fase === 'cansado' || (e.volteada || 0) > .5 || (e.tumbada || 0) > .5 ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'picada' ? 2 : 1) : e.fase === 'huye' ? 2 : [0, 1][Math.floor(t * 2) % 2];
    if (clave === 'volcan') return e.fase === 'cansado' ? 2 : e.fase === 'aviso' ? 2 : e.fase === 'ataque' ? 3 : [0, 1][Math.floor(t * 2) % 2];
    if (clave === 'cazon') return (e.hunde || 0) > .5 ? 3 : e.fase === 'cansado' ? 0 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'salto' ? 2 : 1) : [0, 1][Math.floor(t * 3) % 2];
    if (clave === 'llave') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? 2 : [0, 1][Math.floor(t * 2) % 2];
    if (clave === 'culebrina') {
      if (e.fase === 'cansado') return 0;
      if (e.fase === 'aviso') return e.atq === 'granizo' ? 2 : 1;
      if (e.fase === 'ataque') return e.atq === 'granizo' ? 3 : 1;
      return Math.floor(Math.abs(e.paso || 0) / 10) % 2;
    }
    if (clave === 'sol') return e.fase === 'cansado' ? 3 : e.fase === 'ataque' ? 2 : e.fase === 'aviso' ? 1 : 0;
    if (clave === 'gota') return e.fase === 'cansado' ? 3 : e.fase === 'ataque' ? 2 : e.fase === 'aviso' ? 1 : 0;
    if (clave === 'rehilete') {
      if (e.fase === 'cansado') return 3;
      if (e.atq === 'erizo' && (e.fase === 'aviso' || e.fase === 'ataque')) return 2;
      if (e.fase === 'aviso' || e.fase === 'ataque') return 1;
      return Math.floor(Math.abs(e.giro || 0) / 2.4) % 2;
    }
    if (clave === 'pulpo') return e.fase === 'cansado' ? 3 : e.fase === 'ataque' ? 2 : e.fase === 'aviso' ? 1 : ((e.vy || 0) < 0 ? 1 : 0);
    if (clave === 'palotinte') return e.fase === 'cansado' ? 0 : e.fase === 'ataque' ? (e.atq === 'lluvia' ? 3 : 2) : e.fase === 'aviso' ? (e.atq === 'lluvia' ? 3 : 2) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'mangle') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'crias' ? 3 : 2) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'reflector') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'espejismo' ? 3 : e.fase === 'ataque' ? 2 : 1) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'bruma') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'espejismo' ? 3 : e.fase === 'ataque' ? 2 : 1) : 0;
    if (clave === 'escalera') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'salto' ? 2 : 1) : (e.tb || 0) > 0 ? 3 : Math.abs(e.vy || 0) > 0 ? 2 : 0;
    if (clave === 'estela') return e.fase === 'cansado' || (e.tumbada || 0) > .5 ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' || Math.abs(e.vy || 0) > 0 ? 2 : 0;
    if (clave === 'garita') return e.fase === 'cansado' ? 3 : e.fase === 'ataque' ? 2 : e.fase === 'aviso' ? 1 : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'roseton') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'crias' ? 3 : 2) : Math.floor(t * 3) % 2;
    if (clave === 'lapiz') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'salto' ? 2 : 3) : (e.vy || 0) < -10 ? 2 : (e.vy || 0) > 10 ? 3 : 0;
    if (clave === 'mascaron') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'lluvia' ? 3 : 2) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'ola') return e.fase === 'cansado' ? 0 : (e.fase === 'aviso' || e.fase === 'ataque') ? (e.atq === 'ondas' ? 3 : e.fase === 'ataque' ? 2 : 1) : Math.floor(t * 3) % 2;
    if (clave === 'ceiba') return e.fase === 'cansado' ? 3 : e.fase === 'aviso' ? 2 : e.fase === 'ataque' ? 3 : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'apuntador') return e.fase === 'cansado' ? 1 : e.fase === 'aviso' ? 2 : e.fase === 'ataque' ? (e.atq === 'lluvia' ? 3 : 2) : (e.hunde || 0) < .35 ? 1 : 0;
    if (clave === 'chapopote') return e.fase === 'aviso' ? 1 : e.fase === 'ataque' ? (e.atq === 'crias' ? 3 : (e.vy || 0) < -10 ? 2 : 0) : (e.vy || 0) < -10 ? 2 : Math.floor(t * 3) % 2;
    if (clave === 'fauces') return e.fase === 'cansado' ? 0 : e.fase === 'aviso' ? 2 : e.fase === 'ataque' ? (e.atq === 'lluvia' ? 3 : 2) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'horno') return e.fase === 'cansado' ? 0 : e.fase === 'ataque' ? 3 : e.fase === 'aviso' ? 2 : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    if (clave === 'polvorin') return e.fase === 'cansado' ? 0 : e.fase === 'aviso' ? 2 : e.fase === 'ataque' ? (e.atq === 'embestida' ? 3 : 0) : Math.floor(Math.abs(e.paso || 0) / 8) % 2;
    return 0;
  }

  const D = {
    // ---- 1. Pixel · La Culebrina de San Carlos: un cañón de bronce de los baluartes, en su cureña
    culebrina(c, e, t) {
      const a = av(e), arriba = e.atq === 'granizo' ? (e.fase === 'ataque' ? .55 : a * .55) : 0, w = e.paso || 0;
      const rueda = x => { V(c, el(x, -7, 7, 7), '#6a4424'); c.save(); c.translate(x, -7); c.rotate(w * .14); c.strokeStyle = '#3a2210'; c.lineWidth = 1.1; for (let k = 0; k < 6; k++) { c.rotate(TAU / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(5.6, 0); c.stroke(); } c.restore(); V(c, el(x, -7, 1.8, 1.8), '#d8a850', { s: false }); };
      rueda(-9);
      V(c, pl([[-17, -7], [11, -8], [7, -15], [-14, -15]]), '#8a5a2e', { tex: c => { c.strokeStyle = 'rgba(40,20,8,.5)'; c.lineWidth = .5; c.beginPath(); c.moveTo(-15, -11); c.lineTo(9, -11.5); c.stroke(); } });
      c.save(); c.translate(-3, -18); c.rotate(-arriba - .05);
      V(c, c => { c.moveTo(-14, -6.5); c.lineTo(21, -4.6); c.lineTo(21, 4.6); c.lineTo(-14, 6.5); c.quadraticCurveTo(-19.5, 0, -14, -6.5); c.closePath(); }, '#b8863a', { hl: [2, -3.5, 9] });
      for (const [x, h] of [[-10, 13.6], [2, 12.2], [15, 10.6]]) V(c, rr(x, -h / 2, 2.6, h, .9), '#e0b058', { s: false, lw: .5 });
      V(c, el(21.5, 0, 2.3, 5.4), '#e0b058'); c.fillStyle = '#140c08'; c.beginPath(); c.ellipse(22, 0, 1.2, 3.4, 0, 0, TAU); c.fill();
      V(c, el(-18.6, 0, 2.8, 2.8), '#b8863a');
      // el escudo de Campeche, chiquito, grabado en el bronce
      c.strokeStyle = 'rgba(90,50,14,.8)'; c.lineWidth = .45; c.beginPath(); c.moveTo(-5, -3.4); c.lineTo(-1, -3.4); c.lineTo(-1, 1); c.quadraticCurveTo(-3, 3.4, -5, 1); c.closePath(); c.stroke();
      ojo(c, e, t, 6, -1.6, 2.7, { piel: '#b8863a' }); ojo(c, e, t, 12.2, -1.2, 2.4, { piel: '#b8863a' });
      if (e.fase === 'ataque' && e.atq === 'granizo') humo(c, 26, 0, t, 3);
      c.restore();
      rueda(7);
    },
    // ---- 2. Ocaso · El Sol que no se mete: el sol de Seybaplaya, que no quiere meterse en el mar
    sol(c, e, t) {
      const a = av(e), R = 14, rot = t * .35;
      c.save(); c.translate(0, -15);
      for (let k = 0; k < 12; k++) {
        const g = rot + k * TAU / 12, l = R + (k % 2 ? 5 : 8) + a * 4 + Math.sin(t * 3 + k) * .8;
        V(c, pl([[Math.cos(g - .13) * (R - 1), Math.sin(g - .13) * (R - 1)], [Math.cos(g) * l, Math.sin(g) * l], [Math.cos(g + .13) * (R - 1), Math.sin(g + .13) * (R - 1)]]), k % 2 ? '#ffd27a' : '#ffb347', { s: false, lw: .5 });
      }
      V(c, el(0, 0, R, R), '#ff9a3a', { hl: [-5, -6, 10], tex: c => { c.fillStyle = 'rgba(255,90,60,.35)'; c.beginPath(); c.ellipse(0, 8, R, 6, 0, 0, TAU); c.fill(); } });
      K().motas(c, [[-8, 4, 2.6, 1.5], [9, 4, 2.6, 1.5]], 'rgba(255,70,110,.5)');
      ojo(c, e, t, -4, -2, 3, { piel: '#ff9a3a', iris: '#8a3a10' }); ojo(c, e, t, 5, -2, 3, { piel: '#ff9a3a', iris: '#8a3a10' });
      boca(c, 1, 5.5, 3, e.fase === 'ataque' ? 1 : a);
      c.restore();
    },
    // ---- 3. Acuarela · La Gota del Cenote: una gota enorme del Cenote Azul, con su pececito adentro
    gota(c, e, t) {
      const a = av(e), sq = Math.sin(t * 3) * .6;
      const cuerpo = c => { c.moveTo(0, -31 - sq); c.bezierCurveTo(4, -24, 15, -17, 15, -8.5); c.bezierCurveTo(15, -1.5, 8, 0, 0, 0); c.bezierCurveTo(-8, 0, -15, -1.5, -15, -8.5); c.bezierCurveTo(-15, -17, -4, -24, 0, -31 - sq); c.closePath(); };
      L(c, [[-12, -10], [-18, -15 + Math.sin(t * 4) * 1.5]], 2.6, '#4ab0e0'); L(c, [[12, -10], [18, -15 - a * 4]], 2.6, '#4ab0e0');
      V(c, cuerpo, '#4ab0e0', { hl: [-6, -17, 9], tex: c => {
        c.fillStyle = 'rgba(16,80,150,.35)'; c.beginPath(); c.ellipse(2, -3, 13, 5.5, 0, 0, TAU); c.fill();
        const px = Math.sin(t * 1.2) * 6, d = Math.cos(t * 1.2) >= 0 ? 1 : -1; c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(px, -5, 2.8, 1.2, 0, 0, TAU); c.moveTo(px - d * 2.4, -5); c.lineTo(px - d * 4.6, -6.6); c.lineTo(px - d * 4.6, -3.4); c.fill();
      } });
      ojo(c, e, t, -4.5, -13, 3.2, { iris: '#1a5a9a', piel: '#4ab0e0' }); ojo(c, e, t, 5, -13, 3.2, { iris: '#1a5a9a', piel: '#4ab0e0' });
      boca(c, .5, -7, 2.4, a, '#1a3a6a');
    },
    // ---- 4. Papel picado · El Rehilete de la 59: un rehilete de papel picado que rueda solo
    rehilete(c, e, t) {
      const cols = ['#ff4f9a', '#ffd23f', '#3ec18a', '#3a8ae0'], g = e.giro || 0;
      L(c, [[0, -16], [-4, -1]], 1.6, '#c8a070');
      c.save(); c.translate(0, -16); c.rotate(g);
      for (let k = 0; k < 4; k++) {
        c.save(); c.rotate(k * TAU / 4);
        V(c, c => { c.moveTo(0, 0); c.lineTo(16, -1); c.quadraticCurveTo(15.5, -11, 3, -15); c.closePath(); }, cols[k], { lw: .5, tex: c => {
          c.fillStyle = 'rgba(255,248,232,.9)';
          for (const [x, y, r] of [[7, -3, 1.3], [11, -4, 1.1], [8, -8, 1.2], [4.5, -10, .9], [12.5, -8, .8]]) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fill(); }
        } });
        c.restore();
      }
      c.restore();
      V(c, el(0, -16, 5.6, 5.6), '#fff2d0', { s: false });
      ojo(c, e, t, -2.1, -16.8, 1.8, { piel: '#fff2d0' }); ojo(c, e, t, 2.3, -16.8, 1.8, { piel: '#fff2d0' });
    },
    // ---- 5. Bioluminiscencia · El Mangle Viejo de los Petenes: raíces zancudas que caminan
    mangle(c, e, t) {
      const w = e.paso || 0, glow = '#7ff0e0';
      for (let k = 0; k < 6; k++) { const x0 = -12.5 + k * 5, lift = Math.max(0, Math.sin(w * .28 + k * 1.4)) * 2.6; L(c, [[x0 * .4, -15], [x0 * 1.15, -10, x0 * 1.35, -lift]], 2.2, '#5a3a2a'); }
      V(c, c => { c.moveTo(-7, -14); c.quadraticCurveTo(-8.5, -25, -4, -31); c.lineTo(5, -31); c.quadraticCurveTo(9.5, -24, 7, -14); c.closePath(); }, '#6a4a32', { tex: c => { c.strokeStyle = 'rgba(30,16,8,.45)'; c.lineWidth = .5; for (const x of [-4, 0, 4]) { c.beginPath(); c.moveTo(x, -14); c.quadraticCurveTo(x - 1.5, -22, x, -30); c.stroke(); } } });
      V(c, nubes([[-10, -32, 7.5], [0, -36, 8.5], [10, -32, 7.5], [-4, -28.5, 6], [5, -28.5, 6]]), '#2a6a4a', { lw: .6, hl: [-3, -38, 7] });
      for (const x of [-11, -5, 6, 12]) { const sw = Math.sin(t * 2 + x) * 1.2; L(c, [[x, -28], [x + sw, -19]], 1.4, '#7ab83a', { lw: .5 }); }
      c.save(); c.globalAlpha *= .6 + Math.sin(t * 3) * .3; K().motas(c, [[-8, -34, .9], [3, -38, .8], [9, -30, .9], [-2, -26, .7]], glow); c.restore();
      V(c, el(.5, -21, 6, 3.6), '#3a2418', { s: false, l: false });
      c.save(); c.shadowColor = glow; c.shadowBlur = 4;
      ojo(c, e, t, -2.2, -21, 2.1, { blanco: '#c8fff6', iris: '#1a8a8a', piel: '#3a2418' }); ojo(c, e, t, 3.2, -21, 2.1, { blanco: '#c8fff6', iris: '#1a8a8a', piel: '#3a2418' });
      c.restore();
    },
    // ---- 6. Champotón · El Pulpo Maya: el pulpo que solo vive en estas costas, con su ocelo bajo cada ojo
    pulpo(c, e, t) {
      const col = '#c8603a', osc = '#9a4024', a = av(e);
      for (let k = 0; k < 8; k++) {
        const s = k < 4 ? -1 : 1, i = k % 4, x0 = s * (1.5 + i * 2.6), ph = t * 3 + k * 1.3, ext = 9 + i * 2.6;
        L(c, [[x0, -8], [x0 + s * ext * .55, -1.5 + Math.sin(ph) * 1.4, x0 + s * ext, -2.5 + Math.sin(ph + 1.2) * 2.2], [x0 + s * (ext + 3), -5 + Math.sin(ph + 2) * 2, x0 + s * (ext + 1), -7]], 2.6 - i * .25, i % 2 ? osc : col, { lw: .6 });
      }
      V(c, c => { c.moveTo(-10.5, -8); c.bezierCurveTo(-15, -21, -8, -31, 1, -31 - a * 2); c.bezierCurveTo(10, -31 - a * 2, 15.5, -21, 11, -8); c.closePath(); }, col, { hl: [-4, -23, 8], tex: c => { K().motas(c, [[-5, -18, 1.4], [4, -24, 1.2], [7, -16, 1], [-2, -26, 1]], 'rgba(120,40,20,.45)'); } });
      for (const x of [-5.5, 8.5]) { c.fillStyle = '#f0c080'; c.beginPath(); c.ellipse(x, -6.2, 2.4, 1.8, 0, 0, TAU); c.fill(); c.fillStyle = '#2a1018'; c.beginPath(); c.ellipse(x, -6.2, 1.5, 1.1, 0, 0, TAU); c.fill(); }
      ojo(c, e, t, -3.5, -11.5, 2.7, { iris: '#d8a020', piel: col }); ojo(c, e, t, 6.5, -11.5, 2.7, { iris: '#d8a020', piel: col });
    },
    // ---- 7. Sumi-e · El Palo de Tinte: el árbol del que salía el tinte de Campeche, acanalado y con espinas
    palotinte(c, e, t) {
      const w = e.paso || 0, s = Math.sin(w * .25);
      L(c, [[-4, -6], [-8, -2 - Math.max(0, s) * 2, -10, -Math.max(0, s) * 2]], 2.6, '#3a2a2a'); L(c, [[4, -6], [8, -2 - Math.max(0, -s) * 2, 10, -Math.max(0, -s) * 2]], 2.6, '#3a2a2a');
      L(c, [[-5, -27], [-12, -33, -16, -31]], 1.7, '#4a3434'); L(c, [[4, -28], [10, -35, 15, -34]], 1.7, '#4a3434');
      V(c, c => { c.moveTo(-7, -4); c.bezierCurveTo(-10.5, -14, -4, -20, -7, -31); c.lineTo(6, -31); c.bezierCurveTo(3, -20, 10.5, -14, 7, -4); c.closePath(); }, '#4a3434', { tex: c => { c.strokeStyle = 'rgba(16,8,8,.65)'; c.lineWidth = .7; for (const x of [-4, -1, 2, 5]) { c.beginPath(); c.moveTo(x, -4); c.bezierCurveTo(x - 3.5, -14, x + 3, -20, x - 1, -31); c.stroke(); } } });
      for (const [x, y, d] of [[-8.2, -12, -1], [8, -16, 1], [-6.4, -24, -1], [6.5, -9, 1]]) V(c, pl([[x, y - 1], [x + d * 2.6, y - .3], [x, y + 1]]), '#2a1a1a', { s: false, l: false, lw: .3 });
      V(c, nubes([[-16, -32, 3.6, .7], [-11, -35, 3, .7], [15, -35, 3.6, .7], [10, -37, 3, .7], [0, -34, 4.4, .7]]), '#4a7a3a', { lw: .5 });
      for (const [x, y, ph] of [[-3, -15, 0], [4.5, -11, 1.7]]) { const k = (t * .45 + ph) % 1; c.fillStyle = '#8a1a4a'; c.fillRect(x - .45, y, .9, k * 7); c.beginPath(); c.ellipse(x, y + k * 7, 1, 1.4, 0, 0, TAU); c.fill(); }
      V(c, el(.5, -21, 5.6, 3.4), '#2a1a1a', { s: false, l: false });
      ojo(c, e, t, -1.8, -21, 1.9, { iris: '#8a1a4a', piel: '#2a1a1a' }); ojo(c, e, t, 2.8, -21, 1.9, { iris: '#8a1a4a', piel: '#2a1a1a' });
    },
    // ---- 8. Neón · El Reflector de Puerta de Tierra: el foco del espectáculo de luz, en su tripié
    reflector(c, e, t) {
      const a = av(e), w = e.paso || 0, at = e.fase === 'ataque';
      for (const [x0, ph] of [[-8, 0], [0, 2.1], [8, 4.2]]) { const lift = Math.max(0, Math.sin(w * .3 + ph)) * 2.6; L(c, [[0, -14], [x0 * 1.25, -lift]], 1.6, '#2a2a3a'); }
      L(c, [[0, -14], [0, -18]], 2.4, '#3a3a4a');
      c.save(); c.translate(0, -25); c.rotate(-.08);
      V(c, rr(-12, -8, 19, 16, 3.5), '#3a3a52', { hl: [-6, -5, 6], tex: c => { c.strokeStyle = '#1a1a28'; c.lineWidth = .8; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-9 + i * 3, -5); c.lineTo(-9 + i * 3, 5); c.stroke(); } } });
      const ab = cansado(e) ? .15 : .55 + a * .45;
      V(c, pl([[7, -8], [13, -8 - 6 * ab], [13.5, -6.5]]), '#5a5a78'); V(c, pl([[7, 8], [13, 8 + 6 * ab], [13.5, 6.5]]), '#5a5a78');
      c.save(); c.shadowColor = at ? '#ffffff' : '#ff2bd6'; c.shadowBlur = 5 + a * 7; V(c, el(8.5, 0, 4.2, 7.6), at ? '#ffffff' : '#ffe0fa', { s: false }); c.restore();
      ojo(c, e, t, 9, 0, 3.4, { iris: '#ff2bd6', ax: .62, piel: '#ffe0fa' });
      c.restore();
    },
    // ---- 9. Bruma · La Bruma de Hochob: neblina del monte con la boca de monstruo de los Chenes
    bruma(c, e, t) {
      c.save(); c.globalAlpha *= .7;
      for (let k = 0; k < 4; k++) { const x = -10 + k * 6.6, l = 7 + Math.sin(t * 2 + k) * 3; L(c, [[x, -9], [x + Math.sin(t + k) * 3, -9 + l * .6, x - 2, -9 + l]], 3, '#d8d4cc', { lw: 0 }); }
      c.restore();
      V(c, nubes([[-10, -17, 8], [0, -22, 10.5], [10, -17, 8], [-4, -11, 7], [5, -11, 7]]), '#e8e4dc', { lw: .4, hl: [-5, -26, 8] });
      V(c, rr(-8.5, -26, 17, 15, 2), '#b8a888', { tex: c => { c.strokeStyle = '#6a5a44'; c.lineWidth = .6; c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(-8.5 + i * 2.1, -24 + (i % 2) * 1.6); c.stroke(); } });
      ojo(c, e, t, -3.6, -20, 2.4, { iris: '#4ad0c8', piel: '#b8a888' }); ojo(c, e, t, 3.6, -20, 2.4, { iris: '#4ad0c8', piel: '#b8a888' });
      c.fillStyle = '#1a1410'; roundRect(c, -6, -16, 12, 4 + (e.boca || 0) * 3, 1); c.fill();
      c.fillStyle = '#efe8d8'; for (let i = 0; i < 4; i++) c.fillRect(-5.4 + i * 3.2, -16, 1.8, 1.6 + (i % 2) * 1);
    },
    // ---- 10. Lowpoly · La Escalera de Bolonchén: la escalera de madera para bajar por agua, con su cántaro
    escalera(c, e, t) {
      c.save(); c.translate(0, -16); c.rotate(e.giro || 0);
      L(c, [[-6, 16], [-5, -17]], 2.6, '#8a6a3a'); L(c, [[6, 16], [5, -17]], 2.6, '#8a6a3a');
      for (let i = 0; i < 6; i++) { const y = 13 - i * 5.6; L(c, [[-5.8, y], [5.8, y]], 1.7, '#a8844a', { lw: .6 }); c.strokeStyle = '#3a6a2a'; c.lineWidth = .8; c.beginPath(); c.moveTo(-7, y - 1.2); c.lineTo(-5, y + 1.2); c.moveTo(7, y - 1.2); c.lineTo(5, y + 1.2); c.stroke(); }
      V(c, rr(-4.6, -6.8, 9.2, 7.4, 1.5), '#c8a46a', { s: false, lw: .5 });
      ojo(c, e, t, -2, -3.2, 1.8, { piel: '#c8a46a' }); ojo(c, e, t, 2.1, -3.2, 1.8, { piel: '#c8a46a' });
      const sw = Math.sin(t * 2.4) * .3;
      c.save(); c.translate(5.5, -14); c.rotate(sw); L(c, [[0, 0], [0, 4]], .6, '#3a6a2a', { lw: 0 }); V(c, c => { c.moveTo(-2, 4); c.quadraticCurveTo(-4, 8, -2.6, 10); c.lineTo(2.6, 10); c.quadraticCurveTo(4, 8, 2, 4); c.closePath(); }, '#b86a3a', { lw: .5 }); c.restore();
      c.restore();
    },
    // ---- 11. Códice · La Estela de Edzná: una estela de piedra labrada que brinca y cae de cara
    estela(c, e, t) {
      const tb = e.tumbada || 0;
      c.save(); c.translate(0, -5); c.rotate(tb * Math.PI / 2); c.translate(0, 5);
      if (tb < .5) {
        V(c, c => { c.moveTo(-9, 0); c.lineTo(-9, -31); c.lineTo(-4, -36); c.lineTo(4, -36); c.lineTo(9, -31); c.lineTo(9, 0); c.closePath(); }, '#c8b890', { hl: [-4, -28, 7], tex: c => {
          c.fillStyle = '#c8442a'; c.fillRect(-7, -33, 14, 3); c.fillStyle = '#2a8aa0'; c.fillRect(-7, -12, 14, 2.2);
          c.strokeStyle = 'rgba(60,40,20,.7)'; c.lineWidth = .5;
          for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const x = -6.5 + k * 7, y = -9 + r * 4.5; c.strokeRect(x, y, 6, 3.6); c.beginPath(); c.arc(x + 3, y + 1.8, 1, 0, TAU); c.stroke(); }
        } });
        V(c, pl([[-2, -36], [0, -40], [2, -36]]), '#c8b890', { s: false, lw: .5 });
        ojo(c, e, t, -3.2, -23, 2.4, { piel: '#c8b890', iris: '#2a8aa0' }); ojo(c, e, t, 3.4, -23, 2.4, { piel: '#c8b890', iris: '#2a8aa0' });
        c.fillStyle = '#5a3a20'; c.fillRect(-3.4, -18.5, 6.8, 1.4); c.fillStyle = '#efe0c0'; for (let i = 0; i < 3; i++) c.fillRect(-2.8 + i * 2.2, -18.5, 1.2, 1.2);
      } else {
        V(c, rr(-9, -36, 18, 36, 1.5), '#a89870', { tex: c => { c.strokeStyle = 'rgba(60,40,20,.55)'; c.lineWidth = .6; c.beginPath(); c.moveTo(-6, -30); c.lineTo(-1, -22); c.lineTo(-4, -14); c.moveTo(4, -8); c.lineTo(1, -2); c.stroke(); } });
      }
      c.restore();
    },
    // ---- 12. Óleo · La Garita del Fuerte: la caseta de vigía de la muralla, con su remate de fierro
    garita(c, e, t) {
      const sale = cansado(e) || e.fase === 'ataque' ? 1 : av(e), w = e.paso || 0, s = Math.sin(w * .3);
      L(c, [[-5, -5], [-5 + s * 1.5, -Math.max(0, s) * 2]], 3.2, '#a89878'); L(c, [[5, -5], [5 - s * 1.5, -Math.max(0, -s) * 2]], 3.2, '#a89878');
      V(c, rr(-10, -24, 20, 20, 3), '#d8c8a8', { tex: c => { c.strokeStyle = 'rgba(90,70,40,.45)'; c.lineWidth = .5; for (let y = -20; y < -4; y += 4) { c.beginPath(); c.moveTo(-10, y); c.lineTo(10, y); c.stroke(); for (let x = -8 + (y % 8 ? 0 : 3); x < 10; x += 6) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 4); c.stroke(); } } } });
      V(c, rr(-12, -27, 24, 3.6, 1), '#b8a888');
      V(c, c => { c.moveTo(-10, -27); c.quadraticCurveTo(-9, -37, 0, -39); c.quadraticCurveTo(9, -37, 10, -27); c.closePath(); }, '#c8b898', { hl: [-4, -33, 6] });
      if (!cansado(e)) V(c, pl([[-1.6, -38], [0, -45], [1.6, -38]]), '#4a4a5a', { s: false, lw: .5 }); else V(c, el(0, -39.5, 1.6, 1.6), '#4a4a5a', { s: false });
      c.fillStyle = '#1a1210'; roundRect(c, -7, -18.5, 14, 6, 2.6); c.fill();
      if (sale > .3) { ojo(c, e, t, -2.6, -15.5, 2, { piel: '#1a1210' }); ojo(c, e, t, 2.6, -15.5, 2, { piel: '#1a1210' }); }
      else { c.fillStyle = '#ffd23f'; c.fillRect(-3.4, -16, 1.4, 1); c.fillRect(2, -16, 1.4, 1); }
      if (e.fase === 'ataque' || (e.fase === 'aviso' && e.atq === 'lluvia')) L(c, [[6, -15], [6 + 9 * sale, -15.6]], 1.6, '#3a2a1a', { lw: .5 });
    },
    // ---- 13. Vitral · El Rosetón de la Catedral: la ventana redonda, de vidrios de colores
    roseton(c, e, t) {
      const R = 15, g = (e.giro || 0) + t * .3, cols = ['#d8343a', '#2a6ad8', '#e8b83a', '#2a9a5a', '#8a3ad8', '#e86a2a', '#3ac8d8', '#d83a8a'];
      c.save(); c.translate(0, -17);
      V(c, el(0, 0, R + 2.4, R + 2.4), '#5a4a52', { hl: [-6, -8, 8] });
      c.save(); c.rotate(g);
      for (let k = 0; k < 8; k++) {
        const a0 = k * TAU / 8, a1 = a0 + TAU / 8, am = (a0 + a1) / 2;
        c.beginPath(); c.moveTo(Math.cos(a0) * 5, Math.sin(a0) * 5); c.arc(0, 0, R, a0, a1); c.lineTo(Math.cos(a1) * 5, Math.sin(a1) * 5); c.closePath(); c.fillStyle = cols[k]; c.fill(); c.strokeStyle = '#1a1418'; c.lineWidth = 1; c.stroke();
        c.beginPath(); c.arc(Math.cos(am) * 10.5, Math.sin(am) * 10.5, 2.4, 0, TAU); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); c.stroke();
      }
      c.restore();
      V(c, el(0, 0, 5.4, 5.4), '#fff4d0', { s: false });
      ojo(c, e, t, 0, 0, 3.4, { iris: '#2a6ad8', piel: '#fff4d0' });
      c.restore();
    },
    // ---- 14. Cuaderno · El Lápiz de Catherwood: el lápiz con el que se dibujaron las ruinas de Campeche
    lapiz(c, e, t) {
      const tilt = e.fase === 'anda' ? Math.sin((e.paso || 0) * .3) * .12 : 0;
      c.save(); c.rotate(tilt);
      V(c, pl([[0, 0], [-5, -9], [5, -9]]), '#e8c890', { lw: .5 }); V(c, pl([[0, 0], [-1.8, -3.3], [1.8, -3.3]]), '#3a3a40', { s: false, lw: .4 });
      V(c, rr(-5, -32, 10, 23, .6), '#f2c230', { tex: c => { c.fillStyle = 'rgba(160,110,10,.35)'; c.fillRect(-5, -32, 3, 23); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(1.4, -32, 1.1, 23); } });
      L(c, [[-5, -18], [-10, -14 + Math.sin(t * 4)]], 1, '#3a3a40', { lw: .3 }); L(c, [[5, -18], [10, -14 - av(e) * 3]], 1, '#3a3a40', { lw: .3 });
      ojo(c, e, t, -1.6, -23, 1.9, { piel: '#f2c230' }); ojo(c, e, t, 2.6, -23, 1.9, { piel: '#f2c230' });
      V(c, rr(-5.4, -36.4, 10.8, 4.6, .5), '#b8b8c0', { tex: c => { c.strokeStyle = 'rgba(60,60,70,.6)'; c.lineWidth = .4; for (const y of [-35, -33.4]) { c.beginPath(); c.moveTo(-5.4, y); c.lineTo(5.4, y); c.stroke(); } } });
      V(c, rr(-5, -41, 10, 5.2, 2), '#ff8aa0');
      c.restore();
    },
    // ---- 15. Grabado · El Mascarón de Proa: la figura tallada de un galeón de los astilleros de Campeche
    mascaron(c, e, t) {
      const sw = Math.sin(t * 2.5);
      V(c, c => { c.moveTo(-16, -12); c.lineTo(9, -12); c.quadraticCurveTo(19, -12, 21, -21); c.lineTo(17.5, -4); c.quadraticCurveTo(12, 0, -12, 0); c.closePath(); }, '#7a4a24', { tex: c => { c.strokeStyle = 'rgba(30,14,6,.5)'; c.lineWidth = .5; for (const y of [-8, -4]) { c.beginPath(); c.moveTo(-15, y); c.lineTo(17, y - 1); c.stroke(); } } });
      L(c, [[12, -16], [26, -25]], 1.8, '#5a3418');
      V(c, c => { c.moveTo(2, -30); c.bezierCurveTo(-6, -32, -12, -26 + sw, -16, -22 + sw * 2); c.bezierCurveTo(-10, -22, -4, -22, 1, -20); c.closePath(); }, '#4a2a14', { lw: .5 });
      V(c, c => { c.moveTo(-1, -12); c.quadraticCurveTo(-2, -22, 4, -25); c.quadraticCurveTo(11, -23, 10, -12); c.closePath(); }, '#c8a070', { hl: [3, -20, 5] });
      L(c, [[0, -17], [10, -20]], 1.6, '#a8322a', { lw: .4 });
      V(c, el(6.5, -29, 4.6, 5.2), '#d8b080');
      V(c, pl([[2, -33], [3, -37], [5, -34], [6.6, -38], [8, -34], [10, -37], [11, -33]]), '#d8a83a', { s: false, lw: .5 });
      ojo(c, e, t, 5.2, -29.6, 1.5, { piel: '#d8b080' }); ojo(c, e, t, 8.6, -29.6, 1.4, { piel: '#d8b080' });
    },
    // ---- 17. Anime · La Marejada del Malecón: la ola que brinca el malecón cuando hay norte
    ola(c, e, t) {
      const sw = Math.sin(t * 3) * 1.2, a = av(e);
      V(c, c => { c.moveTo(-17, 0); c.quadraticCurveTo(-19, -18, -4, -30 - sw - a * 3); c.quadraticCurveTo(12, -37, 18, -24); c.quadraticCurveTo(10, -28, 6, -22); c.quadraticCurveTo(14, -12, 16, 0); c.closePath(); }, '#2a8ae0', { hl: [-7, -20, 11], tex: c => { c.strokeStyle = 'rgba(160,220,255,.5)'; c.lineWidth = .7; for (const y of [-6, -12]) { c.beginPath(); c.moveTo(-16, y); c.quadraticCurveTo(0, y - 3 + Math.sin(t * 2 + y) * 1.5, 15, y); c.stroke(); } } });
      c.fillStyle = '#ffffff'; c.strokeStyle = LN; c.lineWidth = .5;
      for (let k = 0; k < 7; k++) { const u = k / 6, x = -8 + u * 26 - u * u * 6, y = -29 - Math.sin(u * Math.PI) * 6 + u * 8 - sw, r = 2.2 + Math.sin(t * 4 + k) * .4; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      ojo(c, e, t, -4.5, -15, 4, { ax: .78, iris: '#1a4aa0', piel: '#2a8ae0' }); ojo(c, e, t, 5, -15, 4, { ax: .78, iris: '#1a4aa0', piel: '#2a8ae0' });
      estrella(c, -6.5, -17, .9, '#ffffff', 4); estrella(c, 3, -17, .9, '#ffffff', 4);
      boca(c, .5, -8, 2.2, a, '#0a2a6a');
    },
    // ---- 18. Art nouveau · La Ceiba Joven: la ceiba de tronco verde, cuajado de espinas
    ceiba(c, e, t) {
      const esp = e.espinas ?? 1, w = e.paso || 0, s = Math.sin(w * .3);
      L(c, [[-6, -6], [-10, -2 - Math.max(0, s) * 2, -12, -Math.max(0, s) * 2]], 2.6, '#5a7a4a'); L(c, [[6, -6], [10, -2 - Math.max(0, -s) * 2, 12, -Math.max(0, -s) * 2]], 2.6, '#5a7a4a');
      L(c, [[-4, -29], [-17, -31]], 1.8, '#5a7a4a'); L(c, [[4, -29], [17, -31]], 1.8, '#5a7a4a'); L(c, [[0, -31], [0, -38]], 1.6, '#5a7a4a');
      V(c, c => { c.moveTo(-9, -3); c.bezierCurveTo(-13, -12, -6, -21, -5, -31); c.lineTo(5, -31); c.bezierCurveTo(6, -21, 13, -12, 9, -3); c.closePath(); }, '#6a9a5a', { hl: [-4, -17, 8], tex: c => { c.strokeStyle = 'rgba(40,70,30,.4)'; c.lineWidth = .5; for (const x of [-4, 0, 4]) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x * .6, -30); c.stroke(); } } });
      if (esp > .05) for (const [x, y, d] of [[-10, -8, -1], [-9.5, -14, -1], [-7, -20, -1], [-5.6, -26, -1], [10, -8, 1], [9.4, -14, 1], [7, -20, 1], [5.6, -26, 1], [-2.5, -10, 0], [3, -12, 0], [-1, -27, 0]]) {
        if (d) V(c, pl([[x, y - 1.4], [x + d * 4.2 * esp, y - .4], [x, y + 1.2]]), '#9a8a4a', { s: false, l: false, lw: .4 });
        else { c.fillStyle = '#9a8a4a'; c.strokeStyle = LN; c.lineWidth = .4; c.beginPath(); c.arc(x, y, 1.3 * esp, 0, TAU); c.fill(); c.stroke(); }
      }
      V(c, nubes([[-17, -32, 2.6], [17, -32, 2.6], [0, -39, 2.6], [-10, -33, 2, .7], [10, -33, 2, .7]]), '#4a8a3a', { lw: .4 });
      K().motas(c, [[-14, -34, 1.7], [14, -35, 1.6], [3, -40, 1.5]], '#fbf6ea');
      ojo(c, e, t, -3, -17, 2.4, { piel: '#6a9a5a' }); ojo(c, e, t, 3.2, -17, 2.4, { piel: '#6a9a5a' });
    },
    // ---- 19. Art déco · El Apuntador del Teatro Toro: el que sopla los diálogos desde su concha
    apuntador(c, e, t) {
      const a = av(e);
      V(c, rr(-14, -12, 28, 12, 1), '#2a1a2a', { tex: c => { c.strokeStyle = '#d4af37'; c.lineWidth = .6; for (let x = -11; x < 14; x += 4) { c.beginPath(); c.moveTo(x, -10); c.lineTo(x, -2); c.stroke(); } c.beginPath(); c.moveTo(-14, -10.6); c.lineTo(14, -10.6); c.stroke(); } });
      V(c, c => { c.moveTo(-15, -12); c.bezierCurveTo(-15, -31, 15, -31, 15, -12); c.closePath(); }, '#d4af37', { hl: [-6, -22, 8], tex: c => { c.strokeStyle = 'rgba(110,80,20,.7)'; c.lineWidth = .6; for (let k = 1; k < 8; k++) { const g = Math.PI + k * Math.PI / 8; c.beginPath(); c.moveTo(0, -12); c.lineTo(Math.cos(g) * 16, -12 + Math.sin(g) * 18); c.stroke(); } } });
      c.fillStyle = '#140c14'; c.beginPath(); c.moveTo(-9, -12); c.bezierCurveTo(-9, -24, 9, -24, 9, -12); c.closePath(); c.fill();
      const y = -15 - a * 3;
      V(c, el(0, y, 5, 5), '#e8c8a0', { s: false });
      c.strokeStyle = LN; c.lineWidth = .5; c.beginPath(); c.arc(-2.2, y - .6, 2, 0, TAU); c.moveTo(4.2, y - .6); c.arc(2.2, y - .6, 2, 0, TAU); c.stroke();
      ojo(c, e, t, -2.2, y - .6, 1.4, { piel: '#e8c8a0' }); ojo(c, e, t, 2.2, y - .6, 1.4, { piel: '#e8c8a0' });
      V(c, rr(3, y + 2, 7, 5, .6), '#fbf6ea', { s: false, lw: .4, tex: c => { c.strokeStyle = 'rgba(40,30,40,.6)'; c.lineWidth = .3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(4, y + 3.4 + i * 1.2); c.lineTo(9, y + 3.4 + i * 1.2); c.stroke(); } } });
    },
    // ---- 20. Cyberpunk · El Chapopote de Cantarell: la mancha de petróleo que brotó del mar
    chapopote(c, e, t) {
      const sq = Math.sin(t * 2.5) * 1, a = av(e);
      V(c, c => { c.moveTo(-16, 0); c.bezierCurveTo(-18, -14, -8, -22 - sq - a * 3, 0, -22 - sq - a * 3); c.bezierCurveTo(9, -22 - sq - a * 3, 18, -14, 16, 0); c.closePath(); }, '#141018', { l: false, hl: [-6, -16, 6], tex: c => {
        const g = c.createLinearGradient(-14, -20, 14, -2); g.addColorStop(0, 'rgba(120,60,200,0)'); g.addColorStop(.35, 'rgba(60,180,220,.38)'); g.addColorStop(.55, 'rgba(240,200,60,.32)'); g.addColorStop(.75, 'rgba(220,60,160,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-20, -30, 40, 30);
      } });
      for (const [x, ph] of [[-10, 0], [3, 1.3], [11, 2.4]]) { const k = (t * .7 + ph) % 1; c.fillStyle = '#141018'; c.beginPath(); c.ellipse(x, 1 + k * 3, 1.2, 1.6, 0, 0, TAU); c.fill(); }
      c.strokeStyle = 'rgba(160,220,255,.5)'; c.lineWidth = .4; for (const [x, y] of [[-8, -6], [9, -9]]) { const k = (t + x) % 2; c.beginPath(); c.arc(x, y - k * 2, .8 + k * .4, 0, TAU); c.stroke(); }
      ojo(c, e, t, -4.5, -12, 3, { iris: '#3ac8e0', piel: '#141018', ln: '#000' }); ojo(c, e, t, 5, -12, 3, { iris: '#3ac8e0', piel: '#141018', ln: '#000' });
    },
    // ---- 21. Cine · La Casa de las Fauces: la puerta de Chicanná, la boca de serpiente que camina
    fauces(c, e, t) {
      const ab = clamp((e.boca || 0) + av(e) * .4, 0, 1), w = e.paso || 0, s = Math.sin(w * .28);
      L(c, [[-8, -5], [-8 + s * 1.5, -Math.max(0, s) * 2]], 3.6, '#a89878'); L(c, [[8, -5], [8 - s * 1.5, -Math.max(0, -s) * 2]], 3.6, '#a89878');
      V(c, rr(-16, -35, 32, 31, 1.5), '#d8cbb0', { hl: [-8, -30, 9], tex: c => {
        c.strokeStyle = 'rgba(90,70,40,.4)'; c.lineWidth = .5; for (let y = -31; y < -4; y += 5) { c.beginPath(); c.moveTo(-16, y); c.lineTo(16, y); c.stroke(); }
        c.fillStyle = 'rgba(168,50,42,.35)'; c.fillRect(-16, -35, 32, 3); c.fillRect(-16, -11, 5, 7); c.fillRect(11, -11, 5, 7);
      } });
      for (const x of [-7.5, 7.5]) V(c, rr(x - 4.6, -32, 9.2, 7, 1.5), '#b8a888', { s: false, lw: .5 });
      ojo(c, e, t, -7.5, -28.5, 2.8, { piel: '#b8a888' }); ojo(c, e, t, 7.5, -28.5, 2.8, { piel: '#b8a888' });
      c.strokeStyle = '#5a4a38'; c.lineWidth = .8; c.beginPath(); for (let k = 0; k <= 12; k++) { const g = k / 12 * TAU * 1.4, r = .3 + k * .22; c.lineTo(Math.cos(g) * r, -23 + Math.sin(g) * r); } c.stroke();
      const mh = 7 + ab * 7; c.fillStyle = '#1a0c08'; c.beginPath(); roundRect(c, -9, -19, 18, mh, 2); c.fill();
      c.fillStyle = '#efe8d8'; for (let i = 0; i < 5; i++) { const x = -8 + i * 4; c.beginPath(); c.moveTo(x, -19); c.lineTo(x + 2, -15.5 + (i % 2 ? 0 : 1.2)); c.lineTo(x + 4, -19); c.fill(); }
      for (let i = 0; i < 4; i++) { const x = -7 + i * 4, yb = -19 + mh; c.beginPath(); c.moveTo(x, yb); c.lineTo(x + 2, yb - 2.4); c.lineTo(x + 4, yb); c.fill(); }
    },
    // ---- 23. Barro · El Horno de Tepakán: el horno de leña donde se cuecen las ollas
    horno(c, e, t) {
      const a = av(e), w = e.paso || 0, s = Math.sin(w * .3);
      L(c, [[-7, -4], [-7 + s, -Math.max(0, s) * 2]], 3, '#8a4424'); L(c, [[7, -4], [7 - s, -Math.max(0, -s) * 2]], 3, '#8a4424');
      V(c, c => { c.moveTo(-16, -3); c.bezierCurveTo(-17, -24, -6, -31, 0, -31); c.bezierCurveTo(6, -31, 17, -24, 16, -3); c.closePath(); }, '#b8643a', { hl: [-6, -22, 9], tex: c => { c.strokeStyle = 'rgba(110,50,24,.55)'; c.lineWidth = .5; for (const r of [9, 15, 21]) { c.beginPath(); c.ellipse(0, -3, r * .8, r, 0, Math.PI, TAU); c.stroke(); } } });
      const ab = .55 + a * .45 + (e.fase === 'ataque' ? .2 : 0);
      c.fillStyle = '#2a0c06'; c.beginPath(); c.moveTo(-7, -3); c.bezierCurveTo(-7, -3 - 12 * ab, 7, -3 - 12 * ab, 7, -3); c.closePath(); c.fill();
      for (let k = 0; k < 4; k++) { const x = -4.5 + k * 3, h = (3 + Math.sin(t * 9 + k * 2) * 1.4) * ab * 1.5; c.fillStyle = k % 2 ? '#ffd23f' : '#ff7a2a'; c.beginPath(); c.moveTo(x - 1.6, -3); c.quadraticCurveTo(x, -3 - h * 1.4, x + 1.6, -3); c.fill(); }
      ojo(c, e, t, -5, -20, 2.6, { piel: '#b8643a' }); ojo(c, e, t, 5, -20, 2.6, { piel: '#b8643a' });
      humo(c, 0, -31, t, 3);
    },
    // ---- 24. Fuego · El Polvorín: el barril de pólvora que quedó del ataque de 1685
    polvorin(c, e, t) {
      const w = e.paso || 0, s = Math.sin(w * .32);
      L(c, [[-5, -4], [-5 + s * 1.4, -Math.max(0, s) * 2]], 2.8, '#5a3418'); L(c, [[5, -4], [5 - s * 1.4, -Math.max(0, -s) * 2]], 2.8, '#5a3418');
      V(c, c => { c.moveTo(-10, -4); c.quadraticCurveTo(-14.5, -16, -10, -28); c.lineTo(10, -28); c.quadraticCurveTo(14.5, -16, 10, -4); c.closePath(); }, '#8a5a2e', { hl: [-4, -20, 7], tex: c => { c.strokeStyle = 'rgba(40,20,8,.55)'; c.lineWidth = .5; for (const x of [-6, -2, 2, 6]) { c.beginPath(); c.moveTo(x * .85, -4); c.quadraticCurveTo(x * 1.25, -16, x * .85, -28); c.stroke(); } } });
      for (const y of [-7.5, -24.5]) L(c, [[-11.4, y], [11.4, y]], 1.6, '#3a3a40', { lw: .4 });
      c.fillStyle = 'rgba(30,20,10,.75)'; c.font = 'bold 4px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillText('1685', 0, -10.6);
      const sw = Math.sin(t * 5) * .8; L(c, [[0, -28], [2, -32, sw, -35]], 1.1, '#3a2a1a', { lw: .3 });
      c.save(); c.shadowColor = '#ffb030'; c.shadowBlur = 4; estrella(c, sw, -35.5, 2 + Math.sin(t * 20) * .5, '#ffd23f', 6, .4); c.restore();
      ojo(c, e, t, -3.5, -17, 2.6, { piel: '#8a5a2e' }); ojo(c, e, t, 4, -17, 2.6, { piel: '#8a5a2e' });
    },
    // ---- 25. Arrecife · El Caracol Reina de Cayos Arcas: se encierra en su concha de labio rosado
    caracol(c, e, t) {
      const fuera = cansado(e) || e.fase === 'aviso' && e.atq === 'crias';
      if (fuera) {
        V(c, el(8, -2.5, 11, 3), '#c8a088', { lw: .5 });
        for (const [x, l] of [[13, 0], [16, 1]]) { const sw = Math.sin(t * 3 + x) * 1; L(c, [[x, -4], [x + 2 + sw, -12 - l * 2]], 1.1, '#c8a088', { lw: .4 }); ojo(c, e, t, x + 2 + sw, -12.6 - l * 2, 1.5, { piel: '#c8a088' }); }
      }
      V(c, c => { c.moveTo(-4, -26); c.lineTo(-16, -30); c.lineTo(-11, -22); c.lineTo(-17, -16); c.quadraticCurveTo(-14, -2, 0, -2); c.quadraticCurveTo(13, -2, 13, -14); c.quadraticCurveTo(10, -26, -4, -26); c.closePath(); }, '#f0c8a0', { hl: [-6, -18, 8], tex: c => { c.strokeStyle = 'rgba(160,100,60,.55)'; c.lineWidth = .6; for (const r of [4, 8, 12]) { c.beginPath(); c.ellipse(-1, -14, r, r * .75, -.3, Math.PI * .8, Math.PI * 2.1); c.stroke(); } } });
      for (const [x, y] of [[-12, -24], [-6, -26.5], [0, -26.5], [6, -24.5]]) V(c, pl([[x - 1.8, y + 1], [x, y - (fuera ? 2 : 4.2)], [x + 1.8, y + 1]]), '#e8b890', { s: false, l: false, lw: .4 });
      V(c, c => { c.moveTo(5, -22); c.quadraticCurveTo(19, -20, 18, -6); c.quadraticCurveTo(15, -1, 8, -2); c.quadraticCurveTo(13, -10, 5, -22); c.closePath(); }, '#ff8aa0', { hl: [13, -14, 5] });
      if (!fuera) { c.fillStyle = '#1a1018'; c.beginPath(); c.ellipse(9, -8, 1.2, 3, .3, 0, TAU); c.fill(); c.fillStyle = '#ffd23f'; c.fillRect(8.6, -9.4, 1, 1); }
    },
    // ---- 26. Origami · El Copo de la Nevada: el copo de papel doblado del día que nevó en Campeche
    copo(c, e, t) {
      const g = (e.giro || 0) + t * .5, k = 1 + av(e) * .25;
      c.save(); c.translate(0, -17); c.rotate(g);
      for (let i = 0; i < 6; i++) {
        c.save(); c.rotate(i * TAU / 6); c.scale(k, 1);
        V(c, pl([[0, -2.2], [15.5, 0], [0, 2.2]]), '#eef6ff', { lw: .5, s: 'rgba(90,140,200,.4)' });
        V(c, pl([[7, -.6], [10.5, -5], [9.6, -.4]]), '#dcecff', { s: false, l: false, lw: .4 }); V(c, pl([[7, .6], [10.5, 5], [9.6, .4]]), '#c8dcf4', { s: false, l: false, lw: .4 });
        c.strokeStyle = 'rgba(70,110,170,.55)'; c.lineWidth = .35; c.beginPath(); c.moveTo(0, 0); c.lineTo(15.5, 0); c.stroke();
        c.restore();
      }
      c.restore();
      V(c, el(0, -17, 5.2, 5.2), '#ffffff', { s: false });
      ojo(c, e, t, -2.1, -17.4, 1.7, { iris: '#3a8ad8', piel: '#ffffff' }); ojo(c, e, t, 2.3, -17.4, 1.7, { iris: '#3a8ad8', piel: '#ffffff' });
    },
    // ---- 27. Carta celeste · La Tortuga de Orión: los mayas veían una tortuga en el cinturón de Orión
    tortuga(c, e, t) {
      const fl = Math.sin(t * 3), boca_arriba = (e.volteada || 0) > .5;
      c.save(); if (boca_arriba) { c.translate(0, -11); c.scale(1, -1); c.translate(0, 11 - 3); }
      L(c, [[8, -10], [17, -6 + fl * 3]], 3.2, '#3a7ac8'); L(c, [[-8, -10], [-16, -6 - fl * 3]], 3.2, '#3a7ac8');
      L(c, [[5, -7], [9, -2 - fl]], 2.4, '#3a7ac8'); L(c, [[-5, -7], [-9, -2 + fl]], 2.4, '#3a7ac8');
      V(c, el(16.5, -14.5, 4.6, 3.8), '#3a7ac8');
      ojo(c, e, t, 18, -15.6, 1.7, { piel: '#3a7ac8' });
      V(c, c => { c.moveTo(-14, -9); c.quadraticCurveTo(-12.5, -24.5, 0, -24.5); c.quadraticCurveTo(12.5, -24.5, 14, -9); c.closePath(); }, '#1a2a5a', { hl: [-5, -20, 7], tex: c => {
        c.strokeStyle = 'rgba(216,184,96,.55)'; c.lineWidth = .4; for (const x of [-7, 0, 7]) { c.beginPath(); c.moveTo(x, -9); c.lineTo(x * .7, -24); c.stroke(); } c.beginPath(); c.ellipse(0, -9, 12, 9, 0, Math.PI, TAU); c.stroke();
        for (const [x, y] of [[-4, -16], [0, -17], [4, -18]]) estrella(c, x, y, 1.8, '#fff6c8', 4, .35);
        for (const [x, y] of [[-9, -12], [8, -12], [-6, -21], [6, -21]]) estrella(c, x, y, 1, '#d8b860', 4, .4);
      } });
      V(c, rr(-15, -10.5, 30, 3, 1.5), '#d8b860', { s: false, lw: .5 });
      if (!cansado(e)) for (const x of [-10, -3.4, 3.4, 10]) estrella(c, x, -24 + Math.abs(x) * .55, 1.6, '#ffe070', 4, .3);
      c.restore();
    },
    // ---- 28. Hollín · El Volcancito del Chichonal: la ceniza de 1982, juntada en un cerrito que quiere ser volcán
    volcan(c, e, t) {
      const a = av(e), w = e.paso || 0;
      L(c, [[-7, -3], [-7, -Math.max(0, Math.sin(w * .3)) * 2]], 3, '#4a4440'); L(c, [[7, -3], [7, -Math.max(0, -Math.sin(w * .3)) * 2]], 3, '#4a4440');
      V(c, c => { c.moveTo(-17, -2); c.quadraticCurveTo(-9, -12, -5.5, -28); c.lineTo(5.5, -28); c.quadraticCurveTo(9, -12, 17, -2); c.closePath(); }, '#5a5450', { hl: [-5, -18, 7], tex: c => { c.strokeStyle = 'rgba(160,152,146,.45)'; c.lineWidth = .6; for (const x of [-9, -3, 3, 9]) { c.beginPath(); c.moveTo(x * .55, -26); c.lineTo(x * 1.3, -3); c.stroke(); } if (a > 0 || e.fase === 'ataque') { c.strokeStyle = '#ff5a1a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, -28); c.quadraticCurveTo(-4, -22, -6, -22 + a * 6); c.moveTo(3, -28); c.quadraticCurveTo(4, -24, 5, -24 + a * 5); c.stroke(); } } });
      c.save(); c.shadowColor = '#ff7a2a'; c.shadowBlur = 4 + a * 5; V(c, el(0, -28, 5.6, 1.8), '#ff7a2a', { s: false, lw: .5 }); c.restore();
      humo(c, 0, -30, t, 4, 'rgba(120,114,110,');
      ojo(c, e, t, -4, -14, 2.6, { iris: '#ff7a2a', piel: '#5a5450' }); ojo(c, e, t, 4.4, -14, 2.6, { iris: '#ff7a2a', piel: '#5a5450' });
      boca(c, .2, -8, 2.4, a, '#2a0c06');
    },
    // ---- 29. 8 bits · El Cazón de la Calle 8: el del pan de cazón, que nada debajo de los ladrillos
    cazon(c, e, t) {
      const hu = e.hunde || 0;
      if (hu > .5) {
        const sw = Math.sin(t * 6) * .6;
        V(c, pl([[-4, 0], [1.5 + sw, -9], [5, 0]]), '#7a7a8a', { lw: .6 });
        c.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 3; k++) { const x = -6 - k * 3 + ((t * 20) % 3); c.fillRect(x, -1, 1.4, 1); }
        return;
      }
      c.save(); c.translate(0, -9); c.rotate(clamp((e.vy || 0) / 700, -.6, .6));
      V(c, c => { c.moveTo(19, 0); c.quadraticCurveTo(10, -8, -8, -4); c.lineTo(-18, -8); c.lineTo(-15, 0); c.lineTo(-19, 6); c.lineTo(-8, 3); c.quadraticCurveTo(10, 8, 19, 0); c.closePath(); }, '#8a8a9a', { hl: [4, -4, 7], tex: c => { c.fillStyle = 'rgba(240,236,224,.85)'; c.beginPath(); c.moveTo(18, 1); c.quadraticCurveTo(8, 7, -8, 3.4); c.lineTo(-8, 2); c.quadraticCurveTo(8, 4, 18, 1); c.fill(); } });
      V(c, pl([[-2, -5], [3, -13], [6, -5]]), '#7a7a8a', { lw: .6 }); V(c, pl([[4, 2], [0, 7], [7, 3]]), '#7a7a8a', { lw: .5 });
      c.strokeStyle = 'rgba(30,30,40,.6)'; c.lineWidth = .4; for (const x of [9, 10.5, 12]) { c.beginPath(); c.moveTo(x, -2); c.lineTo(x - .6, 2); c.stroke(); }
      ojo(c, e, t, 13, -2, 1.9, { iris: '#1a1a2a', piel: '#8a8a9a' });
      c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(18 - i * 1.6, 1.4); c.lineTo(17.2 - i * 1.6, 3); c.lineTo(16.4 - i * 1.6, 1.4); } c.fill();
      c.restore();
    },
    // ---- 30. 32 bits · La Llave de la Puerta de Mar: con ella se cerraba la ciudad de noche
    llave(c, e, t) {
      c.save(); c.translate(0, -16); c.rotate(e.giro || 0);
      L(c, [[0, -2], [0, 16]], 3, '#4a4a5a', { brillo: true });
      V(c, pl([[1, 8.6], [7, 8.6], [7, 11.4], [4.6, 11.4], [4.6, 13.4], [7, 13.4], [7, 16.4], [1, 16.4]]), '#4a4a5a', { lw: .5 });
      for (const [x, y] of [[-7.4, -10], [7.4, -10], [0, -17.6]]) V(c, el(x, y, 2.8, 2.8), '#d8a83a', { s: false, lw: .5 });
      V(c, el(0, -10, 8, 8), '#4a4a5a', { hl: [-3, -13, 5] });
      V(c, el(0, -10, 5, 5), '#d8a83a', { s: false, lw: .5 });
      ojo(c, e, t, -1.9, -10.4, 1.6, { piel: '#d8a83a' }); ojo(c, e, t, 1.9, -10.4, 1.6, { piel: '#d8a83a' });
      c.restore();
    },
    // ---- 31. 64 bits · El Tapir de Calakmul: el animal de tierra más grande de la selva
    tapir(c, e, t) {
      const w = e.paso || 0, baja = e.fase === 'ataque' && e.atq === 'embestida' ? 1 : av(e) * .6;
      for (const [x, ph, col] of [[-10, 0, '#2e282e'], [6, Math.PI, '#2e282e'], [-7, Math.PI, '#4a4048'], [9, 0, '#4a4048']]) { const s = Math.sin(w * .32 + ph); L(c, [[x, -9], [x + s * 2, -Math.max(0, s) * 2]], 3, col, { lw: .5 }); }
      V(c, el(-2, -13, 15, 8.5), '#4a4048', { hl: [-6, -18, 8], tex: c => { c.fillStyle = 'rgba(30,24,30,.4)'; c.beginPath(); c.ellipse(-2, -8, 14, 4, 0, 0, TAU); c.fill(); } });
      c.save(); c.translate(11, -15); c.rotate(baja * .35);
      V(c, el(2, 0, 6.6, 6), '#4a4048');
      V(c, el(3, 3, 4, 2.8), '#d8ccb8', { s: false, l: false, lw: .4 });
      L(c, [[7.5, .5], [11, 2 + Math.sin(t * 3) * .8, 11.5, 5.5]], 2.4, '#3a3238', { lw: .5 });
      V(c, el(-1, -6.4, 2, 3.4, -.3), '#4a4048', { lw: .5 }); c.strokeStyle = '#efe8d8'; c.lineWidth = .5; c.beginPath(); c.ellipse(-1, -6.4, 2, 3.4, -.3, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      ojo(c, e, t, 3.6, -2, 1.5, { piel: '#4a4048' });
      c.restore();
      L(c, [[-16, -15], [-18, -13]], 1.4, '#4a4048', { lw: .4 });
    },
    // ---- 32. Miniatura · La Tarántula Yucateca: la de trasero rojizo que solo vive en la península
    tarantula(c, e, t) {
      const w = e.paso || 0, a = av(e);
      const pata = (k, lejos) => {
        const s = k < 2 ? 1 : -1, ph = w * .4 + k * 1.7 + (lejos ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 2.4, bx = 3 + (k - 1.5) * 1.6, kx = bx + s * (6 + Math.abs(k - 1.5) * 3), fx = bx + s * (10 + Math.abs(k - 1.5) * 5) + Math.cos(ph) * 1.4;
        L(c, [[bx, -11], [kx, -19 + Math.abs(k - 1.5), fx, -lift]], lejos ? 1.6 : 2, lejos ? '#2a1e18' : '#3e2c22', { lw: .5 });
        if (!lejos) { c.fillStyle = '#c87a3a'; c.beginPath(); c.arc(kx, -17.6 + Math.abs(k - 1.5), .8, 0, TAU); c.fill(); }
      };
      for (let k = 0; k < 4; k++) pata(k, true);
      V(c, el(-9, -12, 9, 7.5), '#3a2a22', { hl: [-11, -16, 5], tex: c => { c.fillStyle = 'rgba(200,100,42,.75)'; c.beginPath(); c.ellipse(-11, -16, 6, 3.4, -.2, 0, TAU); c.fill(); c.strokeStyle = 'rgba(240,160,90,.6)'; c.lineWidth = .35; for (let i = 0; i < 9; i++) { const x = -16 + i * 1.6; c.beginPath(); c.moveTo(x, -18 + Math.abs(i - 4) * .4); c.lineTo(x - .6, -20.5 + Math.abs(i - 4) * .5); c.stroke(); } } });
      V(c, el(4, -11.5, 7, 5.4), '#4a3428', { hl: [2, -14, 4] });
      for (let k = 0; k < 4; k++) pata(k, false);
      L(c, [[10, -10], [14, -9 - a * 3, 15, -6]], 1.4, '#3e2c22', { lw: .4 });
      K().motas(c, [[5, -16, .5], [6.4, -16.4, .5], [7.8, -16, .5]], '#1a1018');
      ojo(c, e, t, 7.4, -13, 1.9, { piel: '#4a3428' }); ojo(c, e, t, 10.2, -12.6, 1.7, { piel: '#4a3428' });
    },
  };
  D.cazon.propioHunde = true;

  // ---------------- crías ----------------
  const CRIA = {
    gotita(c, e, t) { V(c, c => { c.moveTo(0, -10); c.bezierCurveTo(2, -7, 5, -5, 5, -3); c.bezierCurveTo(5, 0, 2, 0, 0, 0); c.bezierCurveTo(-2, 0, -5, 0, -5, -3); c.bezierCurveTo(-5, -5, -2, -7, 0, -10); c.closePath(); }, '#4ab0e0', { hl: [-2, -5, 3] }); ojo(c, e, t, -1.6, -4, 1.2); ojo(c, e, t, 1.6, -4, 1.2); },
    propagulo(c, e, t) { V(c, rr(-2, -13, 4, 13, 2), '#7ab83a', { tex: c => { c.fillStyle = '#4a7a2a'; c.fillRect(-2, -13, 4, 3); } }); ojo(c, e, t, -.9, -7, 1); ojo(c, e, t, 1.1, -7, 1); },
    vidrio(c, e, t) { c.save(); c.translate(0, -5); c.rotate(t * 2 + e.hx); V(c, pl([[0, -5], [4, 1], [-3, 3]]), ['#d8343a', '#2a6ad8', '#e8b83a', '#2a9a5a'][Math.abs(Math.round(e.hx)) % 4], { lw: .6 }); c.restore(); ojo(c, e, t, 0, -5, 1.2); },
    paca(c, e, t) { c.save(); c.translate(0, -4.5); c.rotate(e.x / 4.5); V(c, el(0, 0, 4.5, 4.5), '#d8c070', { tex: c => { c.strokeStyle = 'rgba(140,110,40,.8)'; c.lineWidth = .4; for (let i = -4; i < 5; i += 1.6) { c.beginPath(); c.moveTo(i, -5); c.lineTo(i, 5); c.stroke(); } } }); c.restore(); ojo(c, e, t, -1.4, -5, 1.1); ojo(c, e, t, 1.4, -5, 1.1); },
    gotachapo(c, e, t) { V(c, c => { c.moveTo(-5, 0); c.bezierCurveTo(-6, -6, -2, -8, 0, -8); c.bezierCurveTo(2, -8, 6, -6, 5, 0); c.closePath(); }, '#141018', { l: false, hl: [-2, -5, 2.4] }); ojo(c, e, t, -1.6, -4, 1.2, { piel: '#141018' }); ojo(c, e, t, 1.6, -4, 1.2, { piel: '#141018' }); },
    jarrito(c, e, t) { V(c, c => { c.moveTo(-3, -9); c.lineTo(3, -9); c.quadraticCurveTo(6, -4, 3, 0); c.lineTo(-3, 0); c.quadraticCurveTo(-6, -4, -3, -9); c.closePath(); }, '#b8643a', { hl: [-1.5, -5, 2.5] }); c.strokeStyle = LN; c.lineWidth = .6; c.beginPath(); c.arc(4.6, -5, 1.8, -1.4, 1.4); c.stroke(); ojo(c, e, t, -1.2, -5, 1); ojo(c, e, t, 1.4, -5, 1); },
    burbuja(c, e, t) { c.fillStyle = 'rgba(200,240,255,.35)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = .6; c.beginPath(); c.arc(0, -5, 4.6, 0, TAU); c.fill(); c.stroke(); K().brillo(c, -1.6, -7, 1.2); ojo(c, e, t, -1.3, -5, .9); ojo(c, e, t, 1.3, -5, .9); },
  };
  // ---------------- lo que avientan ----------------
  const PROY = {
    bala(c, o) { V(c, el(o.x, o.y, 3, 3), '#2a2a30', { hl: [o.x - 1, o.y - 1, 2] }); },
    chispa(c, o, t) { c.save(); c.shadowColor = '#ffb030'; c.shadowBlur = 4; estrella(c, o.x, o.y, 3.2, '#ffd23f', 5, .45); c.restore(); },
    papel(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.fillStyle = ['#ff4f9a', '#ffd23f', '#3ec18a', '#3a8ae0'][o.n % 4]; c.strokeStyle = LN; c.lineWidth = .4; c.beginPath(); c.moveTo(0, -3); c.lineTo(2.4, 0); c.lineTo(0, 3); c.lineTo(-2.4, 0); c.closePath(); c.fill(); c.stroke(); c.restore(); },
    vaina(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); V(c, el(0, 0, 3.6, 1.6), '#6a1a3a'); c.restore(); },
    piedra(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); V(c, pl([[-2.6, -1.4], [-.6, -2.8], [2.6, -1.6], [2.4, 1.8], [-1.8, 2.4]]), '#8a8078'); c.restore(); },
    clavo(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx)); L(c, [[-3, 0], [3, 0]], .9, '#5a5a62', { lw: .3 }); V(c, rr(-3.6, -1.4, 1, 2.8, .3), '#5a5a62', { s: false, lw: .3 }); c.restore(); },
    brasa(c, o, t) { c.save(); c.shadowColor = '#ff7a2a'; c.shadowBlur = 4; V(c, el(o.x, o.y, 2.6, 2.4), '#ff7a2a', { s: false, lw: .4 }); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(o.x - .5, o.y - .5, 1, 0, TAU); c.fill(); c.restore(); },
    algodon(c, o) { K().motas(c, [[o.x, o.y, 2.6], [o.x - 1.8, o.y + .6, 1.8], [o.x + 1.8, o.y + .6, 1.8]], '#fbf6ea'); c.strokeStyle = 'rgba(120,110,90,.6)'; c.lineWidth = .3; c.beginPath(); c.moveTo(o.x, o.y + 1.5); c.lineTo(o.x, o.y + 3.6); c.stroke(); },
    rosa(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); L(c, [[0, 0], [0, 4.4]], .8, '#2a7a3a', { lw: .3 }); V(c, el(0, 0, 2.2, 2), '#d8243a', { lw: .4 }); c.restore(); },
    pelo(c, o) { c.strokeStyle = '#c8642a'; c.lineWidth = .5; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + (o.rot || 0); c.moveTo(o.x, o.y); c.lineTo(o.x + Math.cos(a) * 3, o.y + Math.sin(a) * 3); } c.stroke(); },
    estrella(c, o) { c.save(); c.shadowColor = '#fff6c8'; c.shadowBlur = 5; estrella(c, o.x, o.y, 3.4, '#fff2a0', 5, .42); c.restore(); },
    ceniza(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); V(c, pl([[-3, -1], [-1, -3], [3, -2], [2.6, 2], [-2, 2.4]]), '#4a4440'); c.strokeStyle = '#ff7a2a'; c.lineWidth = .4; c.beginPath(); c.moveTo(-1, -1); c.lineTo(1.4, .6); c.stroke(); c.restore(); },
    espina(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx)); V(c, pl([[-3.4, -1.2], [3.4, 0], [-3.4, 1.2]]), '#9a8a4a', { s: false, lw: .4 }); c.restore(); },
    hielo(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx)); V(c, pl([[-3.4, -1.4], [3.6, 0], [-3.4, 1.4]]), '#cfe8ff', { s: false, lw: .4 }); c.restore(); },
    tinta(c, o) { V(c, el(o.x, o.y, 2.8, 2.6), '#2a1a3a', { s: false, hl: [o.x - 1, o.y - 1, 1.6] }); },
    chapopote(c, o) { V(c, el(o.x, o.y, 2.8, 2.6), '#141018', { s: false, l: false, hl: [o.x - 1, o.y - 1, 1.6] }); },
  };
  // ---------------- los pilares (sirven de escalón un rato) ----------------
  const PILAR = {
    raiz(c, s, t, h) { L(c, [[s.x + s.w / 2, s.y + s.h], [s.x + 1, s.y + s.h - h * .5, s.x + s.w / 2, s.y + s.h - h]], s.w * .7, '#5a3a2a'); V(c, el(s.x + s.w / 2, s.y + s.h - h, s.w * .5, 2.2), '#2a6a4a', { s: false }); },
    estaca(c, s, t, h) { const x = s.x, y = s.y + s.h - h; c.fillStyle = 'rgba(250,248,240,.9)'; c.strokeStyle = '#3a3a40'; c.lineWidth = .7; c.beginPath(); c.moveTo(x + 1, s.y + s.h); c.lineTo(x + 1, y + 4); c.lineTo(x + s.w / 2, y); c.lineTo(x + s.w - 1, y + 4); c.lineTo(x + s.w - 1, s.y + s.h); c.fill(); c.stroke(); c.lineWidth = .35; for (let k = y + 6; k < s.y + s.h; k += 2.4) { c.beginPath(); c.moveTo(x + 1.5, k); c.lineTo(x + s.w - 1.5, k - 2); c.stroke(); } },
    elevador(c, s, t, h) { const y = s.y + s.h - h; L(c, [[s.x + 3, s.y + s.h], [s.x + 3, y + 2]], 1.2, '#5a4a3a', { lw: .3 }); L(c, [[s.x + s.w - 3, s.y + s.h], [s.x + s.w - 3, y + 2]], 1.2, '#5a4a3a', { lw: .3 }); V(c, rr(s.x - 1, y, s.w + 2, 3.4, .6), '#2a1a2a', { s: false, tex: c => { c.fillStyle = '#d4af37'; c.fillRect(s.x - 1, y, s.w + 2, .8); } }); },
    carambano(c, s, t, h) { V(c, pl([[s.x, s.y + s.h], [s.x + 1.5, s.y + s.h - h + 3], [s.x + s.w / 2, s.y + s.h - h], [s.x + s.w - 1.5, s.y + s.h - h + 3], [s.x + s.w, s.y + s.h]]), '#cfe8ff', { s: 'rgba(60,120,190,.4)', hl: [s.x + 3, s.y + s.h - h + 5, 3] }); },
  };
  const PILAR_BASE = (c, s, t, h, col) => V(c, rr(s.x, s.y + s.h - h, s.w, h, 1.2), col || '#9a9088', { tex: c => { c.strokeStyle = 'rgba(40,30,20,.4)'; c.lineWidth = .5; for (let y = s.y + s.h - h + 4; y < s.y + s.h; y += 5) { c.beginPath(); c.moveTo(s.x, y); c.lineTo(s.x + s.w, y); c.stroke(); } } });

  // Cada mundo tiene su propio arte; se carga al necesitarlo y se conserva
  // el dibujo original como respaldo si la imagen todavía no está disponible.
  const imagenes = Object.create(null);
  function imagenSubjefe(clave) {
    if (imagenes[clave]) return imagenes[clave];
    const asset = imagenes[clave] = { lista: false }, img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, cv.width, cv.height).data;
        let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
        for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
          if (d[(y * cv.width + x) * 4 + 3] < 96) continue;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
        if (x1 < x0) return;
        const pad = Math.ceil(Math.max(x1 - x0, y1 - y0) * .025);
        x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
        x1 = Math.min(cv.width - 1, x1 + pad); y1 = Math.min(cv.height - 1, y1 + pad);
        Object.assign(asset, { img, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, lista: true });
      } catch (_) { /* el dibujo original sigue disponible */ }
    };
    img.src = '../Roguelike/assets/subjefes/' + clave + '.png';
    return asset;
  }

  function dibuja(clave) {
    const fn = D[clave];
    return (c, e, t) => {
      c.save();
      if (e.alfa !== undefined && e.alfa < 1) c.globalAlpha *= Math.max(0, e.alfa);
      const hu = e.hunde || 0;
      if (hu > 0 && !fn.propioHunde) { c.beginPath(); c.rect(-90, -140, 180, 140); c.clip(); c.translate(0, hu * ((e.h || 30) + 8)); }
      const ag = e.agacha || 0, al = e.alza || 0; if (ag || al) c.scale(1 + ag * .12 - al * .05, 1 - ag * .18 + al * .12);
      if (clave === 'tapir' && (e.fase === 'anda' || e.fase === 'huye') && tapirCaminar.complete && tapirCaminar.naturalWidth) {
        const s = e.sj || e.sub || {}, escala = Math.min((s.w || e.w || 30) * 1.25 / 217, (s.h || e.h || 30) * 1.2 / 148);
        const frame = Math.floor(Math.abs(e.paso || 0) / 7) % 4, w = 217 * escala, h = 143.5 * escala;
        c.drawImage(tapirCaminar, (frame % 2) * 256 + 30, Math.floor(frame / 2) * 256 + 65, 189, 125, -w / 2, -h, w, h);
        c.restore(); return;
      }
      if (clave === 'tarantula' && (e.fase === 'anda' || e.fase === 'huye') && tarantulaCaminar.complete && tarantulaCaminar.naturalWidth) {
        const s = e.sj || e.sub || {}, escala = Math.min((s.w || e.w || 30) * 1.25 / 217, (s.h || e.h || 30) * 1.2 / 171);
        const frame = Math.floor(Math.abs(e.paso || 0) / 7) % 4, w = 190 * escala, h = 147 * escala;
        c.drawImage(tarantulaCaminar, (frame % 2) * 256 + 34, Math.floor(frame / 2) * 256 + 54, 190, 147, -w / 2, -h, w, h);
        c.restore(); return;
      }
      if ((clave === 'tapir' || clave === 'tarantula') && (e.fase === 'anda' || e.fase === 'huye')) { fn(c, e, t); c.restore(); return; }
      const gen = forge[clave], im = imagenForge(clave);
      const listo = !!(gen && im && im.complete && im.naturalWidth), asset = listo ? null : imagenSubjefe(clave);
      if (listo) {
        const s = e.sj || e.sub || {}, w = (s.w || e.w || 30) * 1.25, h = (s.h || e.h || 30) * 1.2;
        const frame = cuadroForge(clave, e, t), r = gen.cajas[frame], escala = Math.min(w / gen.escala[0], h / gen.escala[1]);
        const ajuste = gen.ajustesEscala && gen.ajustesEscala[frame] || 1;
        const dw = r[2] * escala * ajuste, dh = r[3] * escala * ajuste, dx = -dw / 2, dy = gen.altoCentro ? -(s.h || e.h || 30) * .5 - dh / 2 : -dh;
        c.save();
        if (clave === 'sol') { c.translate(0, Math.sin(t * 2) * .55); c.rotate(Math.sin(t * .7) * .018); }
        c.imageSmoothingEnabled = clave !== 'culebrina';
        c.drawImage(im, (frame % 2) * 256 + r[0], Math.floor(frame / 2) * 256 + r[1], r[2], r[3], dx, dy, dw, dh);
        // (antes aquí salían dos estrellas amarillas cruzadas, que se veían como una equis gigante sobre el cazón y el volcán; el mareo ya lo marcan las estrellitas de arriba)
        if (clave === 'culebrina' && e.fase === 'cansado') { estrella(c, 11, -dh - 3, 2.4, '#ffd84a', 4, .4); }
        c.restore();
      } else if (asset.lista) {
        const s = e.sj || e.sub || {}, w = (s.w || e.w || 30) * 1.25, h = (s.h || e.h || 30) * 1.2;
        const escala = Math.min(w / asset.w, h / asset.h), dw = asset.w * escala, dh = asset.h * escala;
        c.drawImage(asset.img, asset.x, asset.y, asset.w, asset.h, -dw / 2, -dh, dw, dh);
      } else fn(c, e, t);
      c.restore();
    };
  }
  return { D, CRIA, PROY, PILAR, PILAR_BASE, dibuja, estrella, forge };
})();
