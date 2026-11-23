'use strict';
// =====================================================================
//  CUERPOS DE LOS JEFES (acabado fino)
//  Vuelve a dibujar a los diez jefes vectoriales con volumen de verdad:
//  luz arriba, sombra abajo, luz de borde, textura de su material
//  (piedra, escamas, plumas, pelo, madera, membrana) y colores propios
//  entonados con el mundo. Y les da vida: respiran, caminan con paso,
//  miran a Itzel, parpadean, se preparan antes de atacar, se aplastan al
//  recibir un golpe y, noqueados, ven estrellitas.
//  Los núcleos y las cajas no se mueven: la pelea es la misma. La técnica
//  de cada mundo (jefes-arte.js) se aplica encima de estos dibujos.
//  Va después de jefes.js, jefes-nuevos.js y jefes-mas.js, y antes de jefes-arte.js.
// =====================================================================
(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR;
  const FORGE_JEFES = {
    mythos: { archivo: 'mythos-v1', cajas: [[46,29,165,194],[40,31,179,192],[27,42,195,171],[49,32,159,190]], acciones: ['reposo flotante','aviso de tentáculo o rayo','golpe de tentáculo o rayo','ojo vulnerable'] },
    golem: { archivo: 'golem-v1', cajas: [[59,36,136,185],[54,36,148,185],[54,36,146,185],[36,48,185,159]], acciones: ['reposo','paso','pisotón o rocas','embestida'] },
    serpiente: { archivo: 'serpiente-v1', cajas: [[35,58,185,139],[36,69,185,118],[35,55,185,145],[35,56,186,144]], acciones: ['cabeza cerrada','picada o daño','fuego','picada descendente'] },
    abeja: { archivo: 'xunan-kab-v1/processed-v2', cajas: [[19,31,217,193],[19,54,217,148],[19,33,217,190],[19,46,217,164]], acciones: ['vuelo: dos poses alternadas','aviso de miel o enjambre','aguijón','ventana vulnerable'] },
    jaguar: { archivo: 'jaguar-v2/processed-v1', cajas: [[37,59,185,136],[31,62,196,131],[33,60,190,135],[28,56,199,150]], acciones: ['acecho y reposo','paso','salto agazapado','rugido'] },
    hadas: { archivo: 'hadas-v2/processed-v1', cajas: [[78,47,104,166],[49,52,154,150],[79,54,124,149],[59,42,119,162]], acciones: ['reposo flotante','planeo','conjuro','aturdida'] },
    cocodrilo: { archivo: 'cocodrilo-v1/processed-v1', cajas: [[22,98,212,62],[24,87,210,74],[22,78,212,100],[30,75,202,107]], acciones: ['nado o espera','caminar','escupir','preparar coletazo'] },
    pirata: { archivo: 'pirata-v1/processed-v1', cajas: [[46,60,170,141],[40,59,170,143],[48,54,164,140],[41,53,168,146]], acciones: ['navega en reposo','navega con velas llenas','cañones','prepara ancla'] },
    chaac: { archivo: 'chaac-v1/processed-v1', cajas: [[54,48,156,158],[44,52,169,154],[56,43,143,171],[39,44,171,161]], acciones: ['flota','ventarrón','rayos','aguacero'] },
    camazotz: { archivo: 'camazotz-v1/processed-v1', cajas: [[70,72,131,119],[38,93,166,92],[65,53,139,144],[50,55,142,139]], acciones: ['aleteo: alas arriba','aleteo: alas abiertas','aleteo: alas abajo','picada'] },
  };
  X.FORGE = FORGE_JEFES;
  const hojasForgeJefes = Object.create(null);
  function hojaForgeJefe(id) {
    const cfg = FORGE_JEFES[id]; if (!cfg) return null;
    if (!hojasForgeJefes[id]) { const img = new Image(); img.decoding = 'async'; img.src = '../Roguelike/assets/forge/jefes/' + cfg.archivo + (cfg.archivo.includes('/') ? '' : '/processed') + '/sheet-transparent.webp'; hojasForgeJefes[id] = img; }
    return hojasForgeJefes[id];
  }
  function listoForgeJefe(id) { const img = hojaForgeJefe(id); return !!(img && img.complete && img.naturalWidth); }
  X.FORGE_READY = listoForgeJefe;
  // Las hojas limpias conservan el detalle del arte principal para el juego.
  const camazotzNitido = new Image();
  camazotzNitido.src = '../Roguelike/assets/forge/jefes/camazotz-v1/processed-v1/raw-sheet-clean.webp';
  X.CAMAZOTZ_HD_READY = () => !!(camazotzNitido.complete && camazotzNitido.naturalWidth);
  const camazotzCajasOriginales = [[135,121,376,343], [676,183,479,262], [122,687,401,416], [711,694,409,401]];
  // Registro de las hojas originales: conserva la misma posición de las poses
  // sin ampliar los sprites reducidos de 256 px en la enciclopedia.
  const DETALLE_FORGE = {"mythos":[{"src":[107,57,530,558],"pos":[50,36],"size":[155,184]},{"src":[726,77,1158,543],"pos":[43,36],"size":[170,184]},{"src":[51,707,562,1153],"pos":[36,48],"size":[184,160]},{"src":[750,716,1141,1186],"pos":[51,36],"size":[153,184]}],"golem":[{"src":[118,18,523,568],"pos":[60,36],"size":[135,184]},{"src":[714,19,1159,572],"pos":[54,36],"size":[148,184]},{"src":[70,635,532,1222],"pos":[55,36],"size":[145,184]},{"src":[656,704,1218,1187],"pos":[36,49],"size":[184,158]}],"serpiente":[{"src":[63,103,606,512],"pos":[36,59],"size":[184,138]},{"src":[673,154,1205,496],"pos":[36,69],"size":[184,118]},{"src":[67,714,591,1125],"pos":[36,56],"size":[184,144]},{"src":[678,732,1182,1127],"pos":[36,56],"size":[184,144]}],"abeja":[{"src":[34,39,592,535],"pos":[19,31],"size":[217,193]},{"src":[661,115,1223,498],"pos":[19,54],"size":[217,148]},{"src":[33,655,612,1162],"pos":[19,33],"size":[217,190]},{"src":[655,746,1204,1162],"pos":[19,46],"size":[217,164]}],"jaguar":[{"src":[50,111,578,500],"pos":[37,59],"size":[183,135]},{"src":[660,120,1220,496],"pos":[31,62],"size":[194,130]},{"src":[40,743,578,1127],"pos":[33,61],"size":[187,133]},{"src":[654,731,1216,1158],"pos":[29,57],"size":[195,148]}],"hadas":[{"src":[159,80,457,559],"pos":[78,47],"size":[103,165]},{"src":[700,94,1142,529],"pos":[50,52],"size":[152,150]},{"src":[162,732,517,1162],"pos":[79,54],"size":[122,148]},{"src":[727,698,1070,1164],"pos":[59,42],"size":[118,160]}],"cocodrilo":[{"src":[13,256,615,429],"pos":[23,98],"size":[209,60]},{"src":[644,227,1244,431],"pos":[24,88],"size":[208,71]},{"src":[12,828,615,1108],"pos":[23,79],"size":[209,97]},{"src":[663,818,1237,1119],"pos":[31,76],"size":[199,104]}],"pirata":[{"src":[72,104,555,504],"pos":[46,61],"size":[168,139]},{"src":[682,103,1164,506],"pos":[41,60],"size":[167,140]},{"src":[79,715,545,1111],"pos":[49,55],"size":[162,137]},{"src":[684,712,1162,1124],"pos":[41,54],"size":[166,143]}],"chaac":[{"src":[98,64,542,516],"pos":[55,49],"size":[153,155]},{"src":[700,78,1185,518],"pos":[45,53],"size":[167,151]},{"src":[102,671,512,1164],"pos":[57,43],"size":[141,169]},{"src":[684,674,1175,1138],"pos":[39,44],"size":[169,160]}]};
  const hojasDetalleForge = Object.create(null);
  function hojaDetalleForge(id) {
    if (!DETALLE_FORGE[id]) return null;
    if (!hojasDetalleForge[id]) { const im = new Image(); im.decoding = 'async'; const cfg = FORGE_JEFES[id]; im.src = '../Roguelike/assets/forge/jefes/' + cfg.archivo + (cfg.archivo.includes('/') ? '' : '/processed') + '/raw-sheet-clean.webp'; hojasDetalleForge[id] = im; }
    const im = hojasDetalleForge[id]; return im.complete && im.naturalWidth ? im : null;
  }
  function dibujaForgeJefe(c, id, cuadro, x, y, maxW, maxH, ancla = 'centro') {
    const img = hojaForgeJefe(id), cfg = FORGE_JEFES[id];
    if (!cfg || !cfg.cajas.length) return false;
    cuadro = Number.isFinite(cuadro) ? ((Math.floor(cuadro) % cfg.cajas.length) + cfg.cajas.length) % cfg.cajas.length : 0;
    const caja = cfg.cajas[cuadro];
    if ((!img || !img.complete || !img.naturalWidth) && !(id === 'camazotz' && X.CAMAZOTZ_HD_READY())) return false;
    // Todas las poses comparten escala; el tamaño del recorte no debe hacer
    // que el jefe crezca o se encoja al cambiar de estado.
    const anchoHoja = Math.max(...cfg.cajas.map(q => q[2]));
    const altoHoja = Math.max(...cfg.cajas.map(q => q[3]));
    const k = Math.min(maxW / anchoHoja, maxH / altoHoja), w = caja[2] * k, h = caja[3] * k;
    const dx = x - w / 2, dy = ancla === 'abajo' ? y - h : ancla === 'arriba' ? y : y - h / 2;
    if (id === 'camazotz' && camazotzNitido.complete && camazotzNitido.naturalWidth) {
      const fuente = camazotzCajasOriginales[cuadro]; c.drawImage(camazotzNitido, ...fuente, dx, dy, w, h);
    } else {
      const detalle = hojaDetalleForge(id), fuente = detalle && DETALLE_FORGE[id][cuadro];
      if (fuente) {
        const [sx, sy, sx2, sy2] = fuente.src, [ox, oy] = fuente.pos, [ow, oh] = fuente.size;
        c.save(); c.beginPath(); c.rect(dx, dy, w, h); c.clip();
        c.drawImage(detalle, sx, sy, sx2 - sx, sy2 - sy, dx + (ox - caja[0]) * k, dy + (oy - caja[1]) * k, ow * k, oh * k); c.restore();
      } else c.drawImage(img, (cuadro % 2) * 256 + caja[0], Math.floor(cuadro / 2) * 256 + caja[1], caja[2], caja[3], dx, dy, w, h);
    }
    return true;
  }
  X.CAMAZOTZ_HD_DRAW = (c, o, f) => {
    if (!X.CAMAZOTZ_HD_READY()) return false;
    let cuadro = o.st === 'ataque' && o.atk === 'picada' && o.at > .8 && o.at < 2.1 ? 3 : o.st === 'ataque' && (o.atk === 'chillido' || o.atk === 'oscuridad') ? 2 : o.st === 'ventana' ? 0 : Math.floor(f.t * 8) % 3;
    c.save(); c.translate(o.x, o.y); dibujaForgeJefe(c, 'camazotz', cuadro, 0, 0, 76, 70); c.restore(); return true;
  };
  const mythosAnimeAcciones = new Image();
  mythosAnimeAcciones.src = '../Roguelike/assets/forge/jefes/mythos-anime-acciones-v1/sheet-transparent.png';
  const cabezaKukulkan = new Image();
  cabezaKukulkan.src = '../Roguelike/assets/jefes/kukulkan-mascaron.png';
  const mandibulaAnime = new Image();
  mandibulaAnime.src = '../Roguelike/assets/forge/jefes/kukulkan-anime-mandibula-v1/sheet-transparent.png';
  const cabezaCerrada = new Image();
  cabezaCerrada.src = '../Roguelike/assets/jefes/kukulkan-boca-cerrada.png';
  const cuerpoKukulkan = new Image();
  cuerpoKukulkan.src = '../Roguelike/assets/jefes/kukulkan-cuerpo.png';
  // el cuerpo lleva los colores de la cabeza de cada estilo (tools/serpiente-cuerpos.py y tools/serpiente-neon.py los generan)
  const cuerposKukulkan = Object.create(null);
  const texturaCuerpoKukulkan = f => {
    const id = String(window.estiloArteDerivado || f && f.st && f.st.id || '').split('~')[0];
    if (!id || id === 'bordado') return cuerpoKukulkan;
    if (!cuerposKukulkan[id]) { const im = new Image(); im.src = '../Roguelike/assets/jefes/serpiente-estilos/' + id + '-cuerpo.png'; cuerposKukulkan[id] = im; }
    const im = cuerposKukulkan[id];
    return im.complete && im.naturalWidth ? im : cuerpoKukulkan;
  };
  const cacheKukulkan = new WeakMap();
  const cabezasKukulkanPorEstilo = Object.create(null);
  function imagenKukulkan(pixel, abierta, estilo) {
    const id = String(window.estiloArteDerivado || estilo && estilo.id || '').split('~')[0];
    const ids = ['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura','bordado'];
    let original;
    if (ids.includes(id)) {
      if (!cabezasKukulkanPorEstilo[id]) {
        const cerrada = new Image(), abierta = new Image();
        cerrada.src = '../Roguelike/assets/jefes/serpiente-estilos/' + id + '.png';
        abierta.src = '../Roguelike/assets/jefes/serpiente-estilos/' + id + '-abierta.png';
        cabezasKukulkanPorEstilo[id] = { cerrada, abierta };
      }
      const variante = cabezasKukulkanPorEstilo[id];
      const elegida = abierta ? variante.abierta : variante.cerrada;
      if (elegida.complete && elegida.naturalWidth) original = elegida;
      else if (variante.cerrada.complete && variante.cerrada.naturalWidth) original = variante.cerrada;
    }
    if (!original) original = abierta || !cabezaCerrada.complete || !cabezaCerrada.naturalWidth ? cabezaKukulkan : cabezaCerrada;
    if (!original.complete || !original.naturalWidth) return null;
    let cache = cacheKukulkan.get(original);
    if (!cache) {
      const limpia = document.createElement('canvas'); limpia.width = 768; limpia.height = 512;
      const x = limpia.getContext('2d', { willReadFrequently:true }); x.drawImage(original,0,0,768,512);
      try { const im = x.getImageData(0,0,768,512), d = im.data;
      // Quitar el resplandor oscuro de la ilustración, conservando solo la silueta.
      for(let i=3;i<d.length;i+=4) d[i] = d[i] < 210 ? 0 : 255;
      x.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; } cache = { limpia, pixel:null }; cacheKukulkan.set(original,cache);
    }
    if (!pixel) return cache.limpia;
    if (!cache.pixel) {
      cache.pixel = document.createElement('canvas'); cache.pixel.width = 96; cache.pixel.height = 64;
      const x = cache.pixel.getContext('2d'); x.drawImage(cache.limpia, 0, 0, 96, 64);
    }
    return cache.pixel;
  }
  const esHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  const mz = (a, b, k) => esHex(a) && esHex(b) ? mix(a, b, k) : a;
  const sh = (a, k) => esHex(a) ? shade(a, k) : a;
  const ra = (a, al) => esHex(a) ? rgba(a, al) : a;
  const hs = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const luma = h => { const c = hex(h); return (c[0] * .3 + c[1] * .59 + c[2] * .11) / 255; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

  // ---------------- colores: los del jefe, entonados con el mundo ----------------
  // cada color se acerca un poco al color del mundo de luz parecida (así el jefe es él mismo, pero de ese mundo)
  const MEMO = new Map();
  function colores(o, propios, k = .3) {
    const p = o.pal || {}, key = o.tipo + '|' + p.a + p.b + p.c + p.core;
    let P = MEMO.get(key); if (P) return P;
    const ref = [p.a, p.b, p.c].filter(esHex); P = {};
    for (const n in propios) {
      const col = propios[n]; if (!ref.length) { P[n] = col; continue; }
      const l = luma(col), r = ref.slice().sort((a, b) => Math.abs(luma(a) - l) - Math.abs(luma(b) - l))[0];
      P[n] = mz(col, r, k);
    }
    P.core = p.core || '#ff6b9a'; MEMO.set(key, P); return P;
  }

  // ---------------- el kit ----------------
  let BL = false, LN = '#140c18';            // BL: destello blanco al recibir el golpe; LN: color de la línea
  const C = col => BL ? '#ffffff' : col;
  const blanco = (o, t) => o.flash > 0 && Math.sin(t * 40) > 0;
  const parpadeo = (t, k = 0) => ((t + k) % 4.3) < .13;
  // volumen: relleno, textura, degradado de luz a sombra, luz de borde arriba a la izquierda y contorno
  function vol(c, path, col, b, o = {}) {
    c.beginPath(); path(c); c.fillStyle = C(col); c.fill();
    if (!BL) {
      c.save(); c.beginPath(); path(c); c.clip();
      if (o.tex) o.tex(c);
      const [x0, y0, x1, y1] = b, g = c.createLinearGradient(x0, y0, x0 + (x1 - x0) * .3, y1);
      g.addColorStop(0, `rgba(255,250,235,${o.luz ?? .28})`); g.addColorStop(.42, 'rgba(255,255,255,0)'); g.addColorStop(.58, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(12,6,24,${o.osc ?? .42})`);
      c.fillStyle = g; c.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2);
      if (o.borde !== false) { const d = o.bd || .9; c.beginPath(); path(c); c.save(); c.translate(d, d * 1.2); path(c); c.restore(); c.fillStyle = `rgba(255,250,232,${o.rl ?? .32})`; c.fill('evenodd'); }
      c.restore();
    }
    if (o.lw !== 0) { c.beginPath(); path(c); c.lineJoin = 'round'; c.strokeStyle = o.ln || LN; c.lineWidth = o.lw || .8; c.stroke(); }
  }
  // un tubo que se adelgaza (colas, patas, huesos, narices): w(u) da el grosor a lo largo
  function tubo(c, pos, w, col, n = 12, o = {}) {
    const pt = [], ws = []; for (let k = 0; k <= n; k++) { pt.push(pos(k / n)); ws.push(w(k / n)); }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    if (o.lw !== 0) { c.strokeStyle = o.ln || LN; for (let k = 0; k < n; k++) { c.lineWidth = ws[k] + (o.lw || .9); c.beginPath(); c.moveTo(pt[k][0], pt[k][1]); c.lineTo(pt[k + 1][0], pt[k + 1][1]); c.stroke(); } }
    c.strokeStyle = C(col); for (let k = 0; k < n; k++) { c.lineWidth = ws[k]; c.beginPath(); c.moveTo(pt[k][0], pt[k][1]); c.lineTo(pt[k + 1][0], pt[k + 1][1]); c.stroke(); }
    if (!BL && o.brillo !== false) { c.strokeStyle = `rgba(255,250,235,${o.brillo || .16})`; for (let k = 0; k < n; k++) { c.lineWidth = ws[k] * .3; c.beginPath(); c.moveTo(pt[k][0] - ws[k] * .12, pt[k][1] - ws[k] * .24); c.lineTo(pt[k + 1][0] - ws[k] * .12, pt[k + 1][1] - ws[k] * .24); c.stroke(); } }
    c.restore(); return pt;
  }
  function motas(c, b, n, col, seed, r0 = .4, r1 = 1) { if (BL) return; c.fillStyle = col; for (let i = 0; i < n; i++) { const x = b[0] + hs(i, seed) * (b[2] - b[0]), y = b[1] + hs(seed, i + 31) * (b[3] - b[1]); c.beginPath(); c.arc(x, y, r0 + hs(i + 7, seed) * (r1 - r0), 0, TAU); c.fill(); } }
  function grieta(c, x, y, len, ang, seed, col, lw = .5) { if (BL) return; c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); let a = ang; for (let i = 1; i <= 4; i++) { a += (hs(i, seed) - .5) * 1.2; x += Math.cos(a) * len / 4; y += Math.sin(a) * len / 4; c.lineTo(x, y); } c.stroke(); }
  // roca irregular y losa con las esquinas mordidas
  function piedra(q, x, y, rx, ry, seed) { const n = 9; for (let i = 0; i <= n; i++) { const a = (i % n) / n * TAU, k = .86 + hs(i % n, seed) * .2, px = x + Math.cos(a) * rx * k, py = y + Math.sin(a) * ry * k; i ? q.lineTo(px, py) : q.moveTo(px, py); } q.closePath(); }
  function losa(q, x, y, w, h, seed, ch = .24) {
    const c0 = Math.min(w, h) * ch, j = i => (hs(i, seed) - .5) * c0 * .5;
    const pts = [[x + c0, y], [x + w - c0, y], [x + w, y + c0], [x + w, y + h - c0], [x + w - c0, y + h], [x + c0, y + h], [x, y + h - c0], [x, y + c0]];
    pts.forEach(([px, py], i) => i ? q.lineTo(px + j(i), py + j(i + 9)) : q.moveTo(px + j(i), py + j(i + 9))); q.closePath();
  }
  // ojo con iris, pupila (redonda o de rendija), brillo, sombra del párpado y ceja
  function ojo(c, x, y, rx, ry, o2 = {}) {
    const abre = o2.abre ?? 1, ln = o2.ln || LN;
    if (abre <= .08) { c.save(); c.strokeStyle = ln; c.lineWidth = Math.max(.4, ry * .3); c.lineCap = 'round'; c.beginPath(); c.moveTo(x - rx, y); c.quadraticCurveTo(x, y + ry * .55, x + rx, y); c.stroke(); c.restore(); return; }
    const ry2 = ry * abre;
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry2, 0, 0, TAU); c.fillStyle = C(o2.blanco || '#fbf4e8'); c.fill();
    if (!BL) {
      c.clip(); const ir = Math.min(rx, ry) * (o2.ir || .62), ix = x + (o2.mx || 0) * (rx - ir) * .8, iy = y + (o2.my || 0) * (ry2 - ir * .5) * .6, iris = o2.iris || '#e8a030';
      const g = c.createRadialGradient(ix - ir * .3, iy - ir * .3, 0, ix, iy, ir); g.addColorStop(0, sh(iris, .4)); g.addColorStop(.7, iris); g.addColorStop(1, sh(iris, -.5));
      c.fillStyle = g; c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.fill();
      c.fillStyle = o2.pupila || '#120a10'; c.beginPath(); if (o2.rendija) c.ellipse(ix, iy, ir * .24, ir * .88, 0, 0, TAU); else c.arc(ix, iy, ir * .46, 0, TAU); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ix - ir * .35, iy - ir * .42, Math.max(.28, ir * .26), 0, TAU); c.fill();
      if (!o2.sinSombra) { c.fillStyle = 'rgba(20,10,30,.3)'; c.fillRect(x - rx, y - ry2, rx * 2, ry2 * .45); }
    }
    c.restore();
    c.strokeStyle = ln; c.lineWidth = o2.lw || .55; c.beginPath(); c.ellipse(x, y, rx, ry2, 0, 0, TAU); c.stroke();
    if (o2.ceja) { const e = (o2.enojo || 0) * ry * .55, yy = y - ry2 - ry * .25; c.save(); c.strokeStyle = ln; c.lineWidth = o2.ceja; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - rx * 1.15, yy - e); c.lineTo(x + rx * 1.15, yy + e); c.stroke(); c.restore(); }
  }
  // hacia dónde mira: la dirección a Itzel desde un punto del jefe (en coordenadas de su dibujo)
  function mira(o, f, x, y, face = 1) { const p = f.g && f.g.p; if (!p) return [0, 0]; const dx = (p.x - (o.x + x * face)) * face, dy = p.y - 10 - (o.y + y), d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; }
  // estrellitas del noqueado
  function estrellas(c, x, y, t, r = 9) {
    for (let i = 0; i < 4; i++) {
      const a = t * 4 + i * TAU / 4, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .32, s = 1.6 + Math.sin(a) * .45;
      c.save(); c.translate(px, py); c.rotate(t * 3 + i); c.fillStyle = i % 2 ? '#fff3a0' : '#ffd84a'; c.strokeStyle = '#a8761a'; c.lineWidth = .35;
      c.beginPath(); for (let k = 0; k < 10; k++) { const an = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? s * .45 : s; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore();
    }
  }
  // lo de todos: se aplastan con el golpe; al final se encogen, se marean y se van
  function comun(c, o) {
    if (o.flash > 0) { const u = o.flash / .8, s = Math.sin(u * Math.PI * 4) * u * .13; c.scale(1 + s, 1 - s); }
    if (o.st === 'muere') { const u = clamp(o.at / 2.4, 0, 1), k = 1 - Math.max(0, u - .35) * .7; c.globalAlpha *= clamp((1 - u) * 1.6, 0, 1); c.scale(k, k); c.rotate(Math.sin(o.at * 10) * .12 * (1 - u)); }
  }
  // la gema del núcleo: facetas, brillo y destello cuando está abierto
  function gema(c, o, f, x, y, r, forma = 'rombo') {
    const open = o.st === 'ventana' || o.st === 'herido', col = o.pal.core;
    if (open && !BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, r * 5, col, .45 + Math.sin(f.t * 8) * .15); c.restore(); }
    const path = q => {
      if (forma === 'rombo') { q.moveTo(x, y - r * 1.5); q.lineTo(x + r, y); q.lineTo(x, y + r * 1.2); q.lineTo(x - r, y); q.closePath(); }
      else if (forma === 'hex') { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; q.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } q.closePath(); }
      else q.arc(x, y, r, 0, TAU);
    };
    c.beginPath(); path(c); c.fillStyle = C(col); c.fill();
    if (!BL) {
      c.save(); c.beginPath(); path(c); c.clip();
      c.fillStyle = ra(sh(col, .35), .55); c.beginPath(); c.moveTo(x - r * 1.3, y - r * 1.6); c.lineTo(x + r * .2, y - r * .1); c.lineTo(x - r * 1.3, y + r * 1.3); c.fill();
      c.fillStyle = ra(sh(col, -.3), .5); c.beginPath(); c.moveTo(x + r * .2, y - r * .1); c.lineTo(x + r * 1.4, y - r * .3); c.lineTo(x + r * 1.4, y + r * 1.6); c.lineTo(x - r * .4, y + r * 1.6); c.fill();
      c.restore();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x - r * .35, y - r * .45, r * .26, 0, TAU); c.fill();
      if (open) { const s = r * 1.3 * Math.abs(Math.sin(f.t * 3)); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x + r * .6, y - r * .9 - s); c.lineTo(x + r * .6 + s * .2, y - r * .9); c.lineTo(x + r * .6, y - r * .9 + s); c.lineTo(x + r * .6 - s * .2, y - r * .9); c.closePath(); c.fill(); }
    }
    c.strokeStyle = esHex(col) ? sh(col, -.6) : LN; c.lineWidth = .45; c.beginPath(); path(c); c.stroke();
  }
  // pluma: hoja larga con raquis, sombra en la base y ojo en la punta
  function pluma(c, x, y, ang, L, w, col, punta) {
    c.save(); c.translate(x, y); c.rotate(ang);
    const path = z => { z.moveTo(0, 0); z.quadraticCurveTo(L * .45, -w, L, 0); z.quadraticCurveTo(L * .45, w, 0, 0); z.closePath(); };
    c.beginPath(); path(c); c.fillStyle = C(col); c.fill();
    if (!BL) {
      const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(.5, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fill();
      if (punta) { c.fillStyle = punta; c.beginPath(); c.ellipse(L * .76, 0, L * .13, w * .55, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(10,20,40,.75)'; c.beginPath(); c.arc(L * .76, 0, w * .24, 0, TAU); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = .3; c.beginPath(); c.moveTo(0, 0); c.lineTo(L * .95, 0); c.stroke();
    }
    c.strokeStyle = LN; c.lineWidth = .35; c.beginPath(); path(c); c.stroke(); c.restore();
  }
  const sombraSuelo = (c, x, y, w, alto = 0) => { if (BL) return; c.fillStyle = `rgba(0,0,0,${.22 * Math.max(.25, 1 - alto / 120)})`; c.beginPath(); c.ellipse(x, y, w * Math.max(.4, 1 - alto / 160), 2.6, 0, 0, TAU); c.fill(); };
  // cuánto se movió desde el cuadro anterior (para el paso al caminar); se guarda en el propio jefe
  const paso = (o, k, f = .2) => { const d = o['_x' + k] == null ? 0 : o.x - o['_x' + k]; o['_x' + k] = o.x; const v = Math.abs(d) < 20 ? Math.abs(d) : 0; o['_p' + k] = (o['_p' + k] || 0) + v * f; return v; };

  // =====================================================================
  //  MYTHOS · máscara-ojo de piedra con tentáculos
  // =====================================================================
  function tentaculo(c, x0, y0, i, t, P, L, tension) {
    const n = P.angular ? 7 : 12, pts = [], Lp = [], Rp = [];
    for (let k = 0; k <= n; k++) { const u = k / n, w = Math.sin(t * 2.3 + i * 1.7 - u * 3.4) * (1.5 + u * 7) * (1 - tension), x=x0 * (1 + u * .45) + w, y=y0 + u * L * (1 - tension * .3); pts.push(P.pixel ? [Math.round(x*1.5)/1.5,Math.round(y*1.5)/1.5] : [x,y]); }
    const ancho = u => 4.8 * Math.pow(1 - u, .8) + .5;
    for (let k = 0; k <= n; k++) { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = ancho(k / n) / 2; Lp.push([pts[k][0] + nx * w, pts[k][1] + ny * w]); Rp.push([pts[k][0] - nx * w, pts[k][1] - ny * w]); }
    const path = q => { q.moveTo(Lp[0][0], Lp[0][1]); for (const p of Lp) q.lineTo(p[0], p[1]); for (let k = n; k >= 0; k--) q.lineTo(Rp[k][0], Rp[k][1]); q.closePath(); };
    c.save(); if(P.brillo&&!BL){c.shadowColor=P.brillo;c.shadowBlur=2.4;}
    vol(c, path, P.tent, [x0 - 12, y0, x0 + 12, y0 + L], { lw: .6, luz: .22, osc: .32, bd: .6 }); c.restore();
    if (!BL && P.trama) {
      c.save(); c.strokeStyle=P.trama; c.lineWidth=.38;
      for(let k=2;k<n-1;k+=2){c.beginPath();c.moveTo(Lp[k][0],Lp[k][1]);c.lineTo(Rp[Math.min(n,k+1)][0],Rp[Math.min(n,k+1)][1]);c.stroke();}
      c.restore();
    }
    if (!BL && P.segmentos) {
      c.save(); c.strokeStyle=P.oscura; c.lineWidth=.55;
      for(let k=2;k<n-1;k+=3){c.beginPath();c.moveTo(Lp[k][0],Lp[k][1]);c.lineTo(Rp[k][0],Rp[k][1]);c.stroke();}
      c.restore();
    }
    if (!BL && !P.sinVentosas) for (let k = 2; k < n - 1; k++) { const [x, y] = Rp[k], r = ancho(k / n) * .2; c.fillStyle = P.vent; c.beginPath(); c.ellipse(x, y, r * 1.2, r, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(40,10,40,.5)'; c.beginPath(); c.arc(x, y, r * .45, 0, TAU); c.fill(); }
  }
  const mascaraCalakmul3 = new Image();
  mascaraCalakmul3.src = '../Roguelike/assets/jefes/mascara-calakmul-3.png';
  // Materiales para los elementos móviles de cada máscara ilustrada.
  // Orden: tentáculo, ventosas, piedra orbital, sombra y runa.
  const materialesMascara={
    pixel:['#245b48','#dbc585','#397e62','#142c28','#dfbb65'],ocaso:['#352237','#e8a071','#50304a','#1b1226','#f3a169'],
    acuarela:['#81a69a','#e6d9c0','#88ab9e','#536d68','#b68a7b'],paper:['#398c6b','#f3d693','#6ea57d','#264f48','#dfaa54'],
    biolum:['#124443','#6de3d0','#185d59','#082d31','#64e8d3'],flat:['#4da69c','#e4d8b4','#6bb7a4','#2b6663','#dfb562'],
    sumie:['#5c5b57','#ddd7c9','#7a7971','#242422','#b94737'],neon:['#442276','#f15cd3','#6344a2','#241239','#ec52d4'],
    bruma:['#666666','#dddddd','#949494','#343434','#b8b8b8'],lowpoly:['#347765','#d9bf80','#499781','#204f48','#d8b967'],
    codex:['#487553','#e9cc8b','#62885a','#283e30','#cc713d'],oleo:['#4c795e','#d9c79d','#688f6a','#30433d','#d5a452'],
    vitral:['#45a79b','#ecd585','#67c8ae','#1d3a43','#edbd62'],cuaderno:['#85827b','#e7e3d9','#aaa79e','#46433e','#716e68'],
    grabado:['#d9d0b9','#eee8d5','#cfc6ae','#171512','#25221e'],
    anime:['#369e89','#ffe1ab','#60b5a0','#174c4a','#f9ba67'],nouveau:['#6d8567','#e5d1a4','#879c79','#414f3e','#d3af6e'],
    deco:['#236e65','#e8d29a','#398f7e','#172e2b','#d9b54b'],cyber:['#343266','#fb68b7','#574898','#171935','#f455b3'],
    cinema:['#4b7565','#ddc496','#709282','#273b37','#c5a36d'],
    barro:['#66865b','#e6bc80','#86a879','#43583e','#d8a76c'],eco:['#568f80','#e8d7ab','#79ac9a','#365d55','#e3bd7a'],
    fuego:['#278956','#f7ce50','#40a769','#1a3524','#ee8355'],agua:['#2b6592','#d5eff0','#548eb2','#153d68','#b7e1e8'],
    hielo:['#487960','#e9d198','#b19a63','#304e3d','#d2aa6a'],cielo:['#a0804b','#ead5a6','#bd9b5d','#554021','#ead09a'],
    hollin:['#0a0808','#0a0808','#0a0808','#080606','#0a0808'],bits8:['#176e42','#f5ce42','#29914f','#071d12','#f2d94d'],
    bits32:['#266b50','#edcc71','#398b6c','#102e24','#ebbc5c'],bits64:['#33795b','#eed38c','#539878','#193c2f','#eac478'],
    miniatura:['#456f59','#decda3','#688a6c','#263d30','#c8ad72']
  };
  function partesMascara(P,f){
    const id=f.st&&String(f.st.id||'').split('~')[0],m=materialesMascara[id];
    if(!m)return P;
    return Object.assign({},P,{tent:m[0],vent:m[1],piedra:m[2],oscura:m[3],core:m[4],
      trama:['grabado','cuaderno','sumie'].includes(id)?m[3]:null,
      angular:['hielo','lowpoly','vitral','deco'].includes(id),segmentos:['hielo','vitral','deco','codex'].includes(id),
      pixel:['pixel','bits8','bits32','bits64'].includes(id),brillo:['neon','biolum','cyber'].includes(id)?m[4]:null,sinVentosas:id==='hollin'});
  }
  const trazoGrieta = q => { q.beginPath(); q.moveTo(6, -26); q.lineTo(2, -16); q.lineTo(9, -10); q.lineTo(4, 0); q.lineTo(12, 8); q.lineTo(8, 16); q.moveTo(2, -16); q.lineTo(-4, -21); q.moveTo(9, -10); q.lineTo(15, -12); };
  X.BODY.mythos = (c, o, f) => {
    const P = colores(o, { piedra: '#3f9a7a', oscura: '#0f3a34', clara: '#a8e6c8', tent: '#1f5a4e', vent: '#e8d8b0' }); // jade, concha y obsidiana, como las máscaras de Calakmul
    const t = f.t, open = o.st === 'ventana' || o.st === 'herido', stun = o.stunT > 0, AP=partesMascara(P,f); BL = blanco(o, t); LN = sh(AP.oscura, -.55);
    // ilustración completa de la máscara para cada estilo (1024 × 1024, mismo encuadre): se mueve y se inclina entera
    const cuerpoArte = typeof MASCARA_ESTILOS !== 'undefined' && MASCARA_ESTILOS.obtenerCuerpo && MASCARA_ESTILOS.obtenerCuerpo(f.st);
    if (cuerpoArte) {
      const k = .1155, flota = Math.sin(t * 1.7) * 1.1, ataca = o.st === 'ataque', inclina = Math.sin(t * 1.1) * .035 + (ataca ? Math.sin(t * 9) * .02 : 0), latido = open ? 1 + Math.sin(t * 8) * .012 : 1;
      c.save(); c.translate(o.x, o.y + flota); c.rotate(inclina + (stun ? Math.sin(t * 6) * .25 : 0)); c.scale(latido, latido); comun(c, o);
      c.imageSmoothingEnabled = !(f.st && f.st.pixel); c.imageSmoothingQuality = 'high'; if (BL) c.filter = 'brightness(3)';
      const estilo = String(window.estiloArteDerivado || f.st && f.st.id || '').split('~')[0];
      if (estilo === 'anime' && mythosAnimeAcciones.complete && mythosAnimeAcciones.naturalWidth) {
        // El ojo y el cuerpo usan un mismo encuadre en todas las poses.
        const hoja = mythosAnimeAcciones, tam = 150, x = -tam / 2, y = -58;
        const pose = ataca ? (o.atk === 'tentaculo' ? (o.fx === 'golpe' ? 2 : 1) : o.atk === 'rayo' ? 3 : 1) : 0;
        const sx = (pose % 2) * 256, sy = Math.floor(pose / 2) * 256, corte = .57;
        c.drawImage(hoja, sx, sy, 256, 256 * corte, x, y, tam, tam * corte);
        for (let i = 0; i < 18; i++) {
          const a = corte + (1 - corte) * i / 18, b = corte + (1 - corte) * (i + 1) / 18;
          const amplitud = ataca && o.atk === 'tentaculo' ? 2 : 1;
          const dx = Math.sin(t * 3.4 - i * .32) * amplitud * (i + 1) / 18;
          c.drawImage(hoja, sx, sy + 256 * a, 256, 256 * (b - a), x + dx, y + tam * a, tam, tam * (b - a) + .12);
        }
      } else {
        // Ondular solo la parte inferior deja el ojo y la máscara registrados.
        const w = cuerpoArte.naturalWidth, h = cuerpoArte.naturalHeight;
        const dx = -515.5 * k, dy = -39 - 62 * k, lado = 1024 * k, corte = .57;
        c.drawImage(cuerpoArte, 0, 0, w, h * corte, dx, dy, lado, lado * corte);
        const franjas = 18, intensidad = ataca && o.atk === 'tentaculo' ? 2.5 : 1.25;
        for (let i = 0; i < franjas; i++) {
          const a = corte + (1 - corte) * i / franjas, b = corte + (1 - corte) * (i + 1) / franjas;
          const desplaza = Math.sin(t * 3.4 - i * .32) * intensidad * (i + 1) / franjas;
          c.drawImage(cuerpoArte, 0, h * a, w, h * (b - a), dx + desplaza, dy + lado * a, lado, lado * (b - a) + .12);
        }
      }
      c.filter = 'none'; if (stun) estrellas(c, 0, -39, t, 15);
      c.restore(); return;
    }
    if (listoForgeJefe('mythos') && !(typeof MASCARA_ESTILOS !== 'undefined' && MASCARA_ESTILOS.obtener(f))) {
      const cuadro = o.cineOjoCerrado ? 0 : o.st === 'ventana' || o.st === 'herido' || o.st === 'muere' || stun ? 3 : o.st === 'ataque' ? (o.fx === 'golpe' || o.fx === 'rayo' ? 2 : 1) : o.st === 'entra' ? 1 : 0;
      c.save(); c.translate(o.x, o.y + 2); if (stun) c.rotate(Math.sin(t * 6) * .25); comun(c, o);
      c.imageSmoothingEnabled = !(f.st && f.st.pixel); if (BL) c.filter = 'brightness(3)';
      dibujaForgeJefe(c, 'mythos', cuadro, 0, 0, 88, 92);
      if (o.cineOjoCerrado) {
        c.save(); c.fillStyle = C(P.piedra); c.beginPath(); c.ellipse(0, -1, 10, 5.2, 0, 0, TAU); c.fill();
        c.strokeStyle = C(P.vent); c.lineWidth = 1; c.beginPath(); c.moveTo(-9, -1); c.quadraticCurveTo(0, 3.5, 9, -1); c.stroke(); c.restore();
      }
      if (stun) estrellas(c, 0, -39, t, 15);
      c.restore(); return;
    }
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .25); comun(c, o);
    // piedritas con runas que le dan vueltas (las de atrás antes)
    const orbita = frente => { for (let k = 0; k < 3; k++) { const a = t * .9 + k * TAU / 3; if ((Math.sin(a) > 0) !== frente) continue; const x = Math.cos(a) * 36, y = -2 + Math.sin(a) * 9 + Math.sin(t * 2 + k) * 2, r = 2.4 + k * .5; vol(c, q => piedra(q, x, y, r, r * .8, k + 7), frente ? AP.piedra : sh(AP.piedra, -.2), [x - r, y - r, x + r, y + r], { lw: .5, bd: .5 }); if (!BL) { c.strokeStyle = AP.core; c.lineWidth = .45; c.beginPath(); c.moveTo(x - r * .4, y - r * .2); c.lineTo(x, y + r * .3); c.lineTo(x + r * .4, y - r * .2); c.stroke(); } } };
    orbita(false);
    // tentáculos (noqueado se encogen, no se meten en el piso); se tensan antes del azote
    c.save(); c.translate(0, 12); c.translate(0, 10); c.scale(1, stun ? .3 : 1); c.translate(0, -10);
    const tensa = o.st === 'ataque' && o.atk === 'tentaculo' && o.at < .95 ? Math.min(1, o.at / .5) * .6 : 0;
    for (const i of [0, 5, 1, 4, 2, 3]) tentaculo(c, (i - 2.5) * 6.2, 8, i, t, AP, 36 - Math.abs(i - 2.5) * 4.5, tensa);
    c.restore();
    // La máscara elegida deja la cuenca libre: el ojo sigue siendo una pieza animada.
    const mascaraPropia = typeof MASCARA_ESTILOS !== 'undefined' && MASCARA_ESTILOS.obtener(f);
    if (mascaraPropia || (mascaraCalakmul3.complete && mascaraCalakmul3.naturalWidth)) {
      c.save();
      if (BL) c.filter = 'brightness(3)';
      if (mascaraPropia) {
        // Abre el hueco con tres franjas contiguas: no hay piezas repetidas.
        const im=mascaraPropia.img, w=im.naturalWidth, h=im.naturalHeight;
        const top=h*mascaraPropia.top, bottom=h*mascaraPropia.bottom, x=mascaraPropia.x;
        c.drawImage(im,0,0,w,top,x,-37,84,28.2);
        c.drawImage(im,0,top,w,bottom-top,x,-8.8,84,17.6);
        c.drawImage(im,0,bottom,w,h-bottom,x,8.8,84,18.2);
      } else c.drawImage(mascaraCalakmul3,-44,-37,84,64);
      c.restore();
    } else {
    // cuernos
    for (const d of [-1, 1]) vol(c, q => { q.moveTo(d * 23, -13); q.quadraticCurveTo(d * 33, -17, d * 38, -27); q.quadraticCurveTo(d * 35, -12, d * 26, -1); q.closePath(); }, P.oscura, [d < 0 ? -38 : 23, -27, d < 0 ? -23 : 38, -1], { lw: .7, luz: .22 });
    // la máscara de piedra tallada
    const mask = q => { q.moveTo(-26, -6); q.quadraticCurveTo(-24, -24, 0, -26); q.quadraticCurveTo(24, -24, 26, -6); q.quadraticCurveTo(22, 14, 0, 16); q.quadraticCurveTo(-22, 14, -26, -6); q.closePath(); };
    vol(c, mask, P.piedra, [-26, -26, 26, 16], { lw: 1.1, tex: q => {
      q.strokeStyle = ra(P.oscura, .5); q.lineWidth = .45; for (let k = 0; k < 90; k++) { const x = -26 + hs(k, 3) * 52, y = -26 + hs(k, 7) * 42, w = 3 + hs(k, 9) * 4, h = 2.4 + hs(k, 11) * 3.4; q.fillStyle = k % 3 ? ra(P.clara, .1 + hs(k, 13) * .16) : ra(P.oscura, .16); q.beginPath(); q.moveTo(x, y); q.lineTo(x + w, y + .8); q.lineTo(x + w - .6, y + h); q.lineTo(x - .5, y + h - .6); q.closePath(); q.fill(); q.stroke(); }
      q.strokeStyle = ra(P.oscura, .75); q.lineWidth = .7;
      for (const d of [-1, 1]) { q.beginPath(); for (let k = 0; k < 16; k++) { const an = k * .55 * d, rr = 4.2 - k * .24; q.lineTo(d * 17 + Math.cos(an) * rr, 7 + Math.sin(an) * rr); } q.stroke(); }
      q.beginPath(); q.moveTo(-15, -16); q.lineTo(-8, -16); q.lineTo(-8, -20); q.lineTo(8, -20); q.lineTo(8, -16); q.lineTo(15, -16); q.stroke();
      q.strokeStyle = ra(P.clara, .55); q.lineWidth = .4; q.beginPath(); q.moveTo(-15, -15.3); q.lineTo(-8.7, -15.3); q.lineTo(-8.7, -19.3); q.lineTo(8.7, -19.3); q.stroke();
      grieta(q, -20, -9, 9, 2.2, 11, ra(P.oscura, .8)); grieta(q, 17, 12, 7, -1.8, 4, ra(P.oscura, .8)); grieta(q, -6, 13, 6, -1.2, 9, ra(P.oscura, .7), .4);
    } });
    // la grieta que brilla y late
    if (f.st.id !== 'hollin') {
      if (!BL) { const pl = .55 + Math.sin(t * 3) * .25 + (open ? .25 : 0); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = ra(P.core, pl * .55); c.lineWidth = 3.2; c.lineCap = 'round'; trazoGrieta(c); c.stroke(); c.restore(); }
      c.strokeStyle = C(P.core); c.lineWidth = 1.2; trazoGrieta(c); c.stroke(); if (!BL) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .4; trazoGrieta(c); c.stroke(); }
    }
    }
    // En los dibujos individuales el ojo se adapta a la abertura real del arte.
    const eo = stun ? .9 : open ? 1 : .38 + Math.abs(Math.sin(t * .8)) * .14;
    if (mascaraPropia) {
      const rx=mascaraPropia.rx*.96, ry=8.2;
      const [mx,my]=mira(o,f,-2,0);
      if (mascaraPropia.id==='hollin') {
        // En ceniza, ojo negro y pupila completamente roja.
        c.fillStyle='#050303';c.beginPath();c.ellipse(-2,0,rx,ry,0,0,TAU);c.fill();
        const ir=Math.min(rx,ry)*.70,ix=-2+mx*(rx-ir)*.5,iy=my*(ry-ir)*.45;
        c.fillStyle='#ff251b';c.beginPath();c.arc(ix,iy,ir,0,TAU);c.fill();
      } else if (stun) {
        c.fillStyle=C('#ffffff');c.beginPath();c.ellipse(-2,0,rx,ry*.9,0,0,TAU);c.fill();
      } else {
        ojo(c,-2,0,rx,ry,{abre:eo,iris:P.core,rendija:true,mx,my,ir:.58,blanco:'#ffffff',sinSombra:true,lw:.45});
      }
    } else {
    c.fillStyle = C('#140a14'); c.beginPath(); c.ellipse(-2, 0, 14.4, 9.5 * eo + 2.4, 0, 0, TAU); c.fill();
    if (stun) { c.fillStyle = C('#f4ecf6'); c.beginPath(); c.ellipse(-2, 0, 11.5, 8 * eo, 0, 0, TAU); c.fill(); c.strokeStyle = C(P.core); c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 22; k++) { const a = k * .7 + t * 6, r = k * .3; c.lineTo(-2 + Math.cos(a) * r, Math.sin(a) * r * eo); } c.stroke(); }
    else if (f.st.id === 'hollin') {
      const [mx, my] = mira(o, f, -2, 0), ir = 8.2 * .58;
      const ix = -2 + mx * (11.5 - ir) * .8, iy = my * (8.2 * eo - ir * .5) * .6;
      c.fillStyle = '#050303'; c.beginPath(); c.ellipse(-2, 0, 11.5, 8.2 * eo, 0, 0, TAU); c.fill();
      c.fillStyle = '#ff251b'; c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.fill();
    } else { const [mx, my] = mira(o, f, -2, 0); ojo(c, -2, 0, 11.5, 8.2, { abre: eo, iris: P.core, rendija: true, mx, my, ir: .58, blanco: '#ffffff', sinSombra: true, lw: .7 }); }
    for (const s of [-1, 1]) vol(c, q => { q.ellipse(-2, s * (8.2 * eo + 1.2), 13.4, 2.3, 0, s < 0 ? Math.PI : 0, s < 0 ? TAU : Math.PI); q.closePath(); }, sh(P.piedra, -.12), [-15, -12, 11, 12], { lw: .6, luz: .3, bd: .5 });
    }
    if (open && !stun && o.mode === 'control') { c.strokeStyle = BL ? '#fff' : rgba(P.clara, .8); c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.arc(-2, 0, 15.5, 0, TAU); c.stroke(); c.setLineDash([]); }
    orbita(true);
    if (stun) estrellas(c, -2, -32, t, 15);
    c.restore();
  };

  // =====================================================================
  //  EL GÓLEM DE PIEDRA
  // =====================================================================
  const venas = (q, k, br) => { q.beginPath(); q.moveTo(-10, -56 * k + br); q.lineTo(-4, -46 * k + br); q.lineTo(-10, -36 * k + br); q.lineTo(-6, -27 * k + br); q.moveTo(8, -58 * k + br); q.lineTo(12, -44 * k + br); q.lineTo(9, -34 * k + br); q.moveTo(-4, -46 * k + br); q.lineTo(3, -44 * k + br); };
  X.BODY.golem = (c, o, f) => {
    const P = colores(o, { roca: '#8d8573', oscura: '#3d352a', clara: '#d0c6a8', musgo: '#5f8f3c', musgo2: '#9ac25a' });
    const t = f.t, H = o.hgt || 92, k = H / 92, salto = o.jump || 0, y0 = FLOOR - salto + Math.min(0, o.drop || 0), stun = o.stunT > 0, open = (o.st === 'ventana' || o.st === 'herido') && !o.cineDormido;
    BL = blanco(o, t); LN = sh(P.oscura, -.55);
    if (listoForgeJefe('golem')) {
      const cuadro = o.cineDormido ? 3 : o.cineDespierta ? 1 : stun || open || o.st === 'muere' ? 0 : o.st === 'ataque' && o.atk === 'embestida' ? (o.charging || o.at >= .7 ? 3 : 1) : o.st === 'ataque' ? 2 : o.st === 'entra' ? 1 : 0;
      if (y0 < FLOOR + 1) { c.save(); c.translate(o.x, 0); sombraSuelo(c, 0, FLOOR + 1, 26, FLOOR - y0); c.restore(); }
      c.save(); c.translate(o.x, y0); c.scale(o.face || 1, 1); comun(c, o);
      c.imageSmoothingEnabled = !(f.st && f.st.pixel); if (BL) c.filter = 'brightness(3)';
      dibujaForgeJefe(c, 'golem', cuadro, 0, 0, 84, H + 14, 'abajo');
      if (stun) estrellas(c, 0, -(H + 14) * .82, t, 10);
      c.restore(); return;
    }
    const v = paso(o, 'g', o.charging ? .09 : .16), anda = v > .05 && !(salto > 0), s = anda ? Math.sin(o._pg) : 0;
    if (y0 < FLOOR + 1) { c.save(); c.translate(o.x, 0); sombraSuelo(c, 0, FLOOR + 1, 26, FLOOR - y0); c.restore(); }
    c.save(); c.translate(o.x, y0); c.scale(o.face, 1); comun(c, o);
    const br = (o.st === 'ventana' && !stun ? Math.sin(t * 5) * 1.5 : Math.sin(t * 1.6) * .6) - Math.abs(s) * 1.3 + (salto > 0 ? -2 : 0);
    const roca = (path, b, col, seed, musgo) => vol(c, path, col, b, { lw: 1, tex: q => {
      motas(q, b, 16, ra(P.oscura, .32), seed, .3, 1); motas(q, b, 9, ra(P.clara, .45), seed + 5, .3, .7);
      grieta(q, b[0] + (b[2] - b[0]) * (.2 + hs(seed, 2) * .6), b[1] + (b[3] - b[1]) * .15, (b[3] - b[1]) * .55, 1.5, seed, ra(P.oscura, .6), .45);
      if (musgo) { for (let i = 0; i < 6; i++) { const x = b[0] + hs(i, seed + 3) * (b[2] - b[0]); q.fillStyle = ra(P.musgo, .92); q.beginPath(); q.ellipse(x, b[1] + .6, 2 + hs(i, seed) * 2.6, 1.5 + hs(seed, i) * 1.4, 0, 0, TAU); q.fill(); } q.fillStyle = ra(P.musgo2, .85); for (let i = 0; i < 5; i++) { q.beginPath(); q.arc(b[0] + hs(i + 4, seed) * (b[2] - b[0]), b[1] + .3, .8, 0, TAU); q.fill(); } }
    } });
    // brazos: hombrera con musgo, brazo, puño con nudillos
    const sw = o.charging ? -1.05 : Math.sin(t * 2) * .2 + s * .35;
    const lanza = o.st === 'ataque' && o.atk === 'rocas' && o.at > .3 ? Math.max(0, Math.sin(((o.at % .6) / .6) * Math.PI)) : 0;
    const arriba = salto > 0 ? Math.min(1, salto / 25) : 0;
    const brazo = (lado, ang, col) => {
      c.save(); c.translate(lado * 20, -60 * k + br); c.rotate(ang);
      const ax = lado > 0 ? 5 : -5;
      roca(q => piedra(q, ax, 10 * k, 6.6, 10 * k + 1, 3 + lado), [ax - 6.6, -1, ax + 6.6, 21 * k], col, 3 + lado);
      roca(q => piedra(q, ax + lado * .5, 25 * k, 6.2, 8 * k + 1, 5 + lado), [ax - 6, 16 * k, ax + 6.6, 34 * k], sh(col, -.05), 5 + lado);
      const fx = lado > 0 ? 5 : -5, fy = 34 * k + 4;
      roca(q => piedra(q, fx, fy, 8, 7, 9 + lado), [fx - 8, fy - 7, fx + 8, fy + 7], col, 9 + lado);
      if (!BL) { c.strokeStyle = ra(P.oscura, .75); c.lineWidth = .55; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(fx - 4 + i * 3, fy + 3); c.lineTo(fx - 3 + i * 3, fy + 6); c.stroke(); } }
      roca(q => piedra(q, 0, 0, 9, 7, 21 + lado), [-9, -7, 9, 7], col, 21 + lado, true);
      c.restore();
    };
    const atras = sh(P.roca, -.2);
    brazo(-1, .2 + sw + arriba * 2.5, atras);
    // piernas que dan el paso
    const pierna = (lado, lift, col) => { const x = lado < 0 ? -14 : 3; c.save(); c.translate(0, -lift); roca(q => losa(q, x, -18 * k, 11, 18 * k, 13 + lado), [x, -18 * k, x + 11, 0], col, 13 + lado); roca(q => losa(q, x - 1.5, -4.5, 14, 5, 15 + lado, .4), [x - 1.5, -4.5, x + 12.5, .5], sh(col, -.1), 15 + lado); c.restore(); };
    pierna(-1, Math.max(0, s) * 3.4, atras); pierna(1, Math.max(0, -s) * 3.4, P.roca);
    // torso con un glifo tallado y las venas del núcleo que laten
    const ty = -66 * k + br, th = 50 * k;
    roca(q => losa(q, -20, ty, 40, th, 31, .3), [-20, ty, 20, ty + th], P.roca, 31, true);
    // piedras sueltas incrustadas en el pecho y la panza
    for (const [x, y, r, sd] of [[-14, ty + th * .72, 4.2, 51], [13, ty + th * .62, 3.4, 52], [9, ty + th * .9, 3, 53]]) roca(q => piedra(q, x, y, r, r * .8, sd), [x - r, y - r, x + r, y + r], sh(P.roca, .06), sd);
    if (!BL) { c.strokeStyle = ra(P.oscura, .7); c.lineWidth = .7; const gx = -8, gy = ty + th * .42, gs = 11 * Math.max(.6, k); c.beginPath(); roundRect(c, gx, gy, gs, gs, 2); c.stroke(); c.beginPath(); for (let i = 0; i < 14; i++) { const a = i * .6, r = gs * .38 - i * .25; c.lineTo(gx + gs / 2 + Math.cos(a) * r, gy + gs / 2 + Math.sin(a) * r); } c.stroke(); }
    const pulso = .5 + Math.sin(t * 3) * .3 + (open ? .3 : 0);
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = ra(P.core, pulso * .45); c.lineWidth = 2.8; c.lineCap = 'round'; venas(c, k, br); c.stroke(); c.restore(); }
    c.strokeStyle = C(P.core); c.lineWidth = .9; c.lineCap = 'round'; venas(c, k, br); c.stroke();
    // cabeza: ceja de piedra, ojos que arden y el cristal
    const hy = -84 * k + br, hh = 18 * k;
    roca(q => losa(q, -10, hy, 20, hh, 41), [-10, hy, 10, hy + hh], P.roca, 41, true);
    vol(c, q => losa(q, -9.5, hy + hh * .3 - 1.5, 19, 3.2, 43, .5), sh(P.roca, -.22), [-9.5, hy + hh * .3 - 1.5, 9.5, hy + hh * .3 + 1.7], { lw: .6 });
    const ey = hy + hh * .3 + 3.4;
    if (stun) { c.strokeStyle = C('#fff3d0'); c.lineWidth = .8; for (const x of [-3.5, 4.5]) { c.beginPath(); c.moveTo(x - 1.6, ey - 1.4); c.lineTo(x + 1.6, ey + 1.4); c.moveTo(x + 1.6, ey - 1.4); c.lineTo(x - 1.6, ey + 1.4); c.stroke(); } }
    else { const fu = o.st === 'ataque' ? 1 : .7; if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 4.5, ey, 6, '#ffc850', .55 * fu); glowDot(c, -3.5, ey, 5, '#ffc850', .4 * fu); c.restore(); } c.fillStyle = C('#fff2b0'); c.fillRect(2, ey - 1.1, 5, 2.2); c.fillRect(-6, ey - 1.1, 5, 2.2); }
    if (!BL) { c.strokeStyle = ra(P.oscura, .85); c.lineWidth = .6; c.beginPath(); c.moveTo(-5, hy + hh * .82); c.lineTo(-1, hy + hh * .78); c.lineTo(2, hy + hh * .84); c.lineTo(6, hy + hh * .8); c.stroke(); }
    // el cristal (núcleo) con una astilla al lado
    const cy = -84 * k + br;
    vol(c, q => { q.moveTo(-1.5, cy); q.lineTo(0, cy - 5.5); q.lineTo(2, cy - 1); q.closePath(); }, sh(P.core, -.15), [-1.5, cy - 5.5, 2, cy], { lw: .4 });
    if (open && !BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 5.5, cy - 4, 18, P.core, .45 + Math.sin(t * 8) * .15); c.restore(); }
    const cris = q => { q.moveTo(2, cy); q.lineTo(5.5, cy - 9); q.lineTo(9, cy); q.lineTo(5.5, cy + 2.6); q.closePath(); };
    c.beginPath(); cris(c); c.fillStyle = C(P.core); c.fill();
    if (!BL) { c.fillStyle = ra(sh(P.core, .4), .6); c.beginPath(); c.moveTo(2, cy); c.lineTo(5.5, cy - 9); c.lineTo(5.5, cy + 2.6); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(4.2, cy - 4); c.lineTo(5.2, cy - 7); c.lineTo(5, cy - 3.6); c.fill(); }
    c.strokeStyle = sh(P.core, -.6); c.lineWidth = .5; c.beginPath(); cris(c); c.stroke();
    brazo(1, -.2 - sw - lanza * 2.4 - arriba * 2.5, P.roca);
    if (stun) estrellas(c, 0, -96 * k, t, 13);
    c.restore();
  };

  // =====================================================================
  //  LA SERPIENTE DE NUBES (Kukulkán)
  // =====================================================================
  X.BODY.serpiente = (c, o, f) => {
    const P = colores(o, { cuerpo: '#256d5b', oscura: '#123e34', panza: '#dfcbaa', pluma: '#236b54', pluma2: '#a84537', roja: '#b94635', oro: '#d4a952' }, .25);
    const t = f.t, stun = o.stunT > 0, S = o.seg, n = S.length, h = S[0]; BL = blanco(o, t); LN = sh(P.oscura, -.5);
    c.save(); c.translate(h.x, h.y); comun(c, o); c.translate(-h.x, -h.y);
    const ang = i => Math.atan2(S[i - 1].y - S[i].y, S[i - 1].x - S[i].x);
    const arribaDe = a => { let u = a - Math.PI / 2; if (Math.sin(u) > 0) u += Math.PI; return u; };
    const TXK = texturaCuerpoKukulkan(f);
    const cuerpoIlustrado = TXK.complete && TXK.naturalWidth;
    if (cuerpoIlustrado) {
      // Cada mitad de tramo es un triángulo del mismo dibujo. Compartir
      // vértices evita huecos y permite doblar el cuerpo sin repetirlo.
      const W = TXK.naturalWidth, H = TXK.naturalHeight;
      const lados = S.map((p, i) => {
        const u = arribaDe(ang(Math.max(1, i))), ancho = 17;
        return [{x:p.x+Math.cos(u)*ancho,y:p.y+Math.sin(u)*ancho},
                {x:p.x-Math.cos(u)*ancho,y:p.y-Math.sin(u)*ancho}];
      });
      const triangulo = (s, d) => {
        const [a,b,e] = s, [A,B,E] = d;
        const det=(b.x-a.x)*(e.y-a.y)-(e.x-a.x)*(b.y-a.y);
        if (Math.abs(det)<.0001) return;
        const ax=((B.x-A.x)*(e.y-a.y)-(E.x-A.x)*(b.y-a.y))/det;
        const cx=((E.x-A.x)*(b.x-a.x)-(B.x-A.x)*(e.x-a.x))/det;
        const ay=((B.y-A.y)*(e.y-a.y)-(E.y-A.y)*(b.y-a.y))/det;
        const cy=((E.y-A.y)*(b.x-a.x)-(B.y-A.y)*(e.x-a.x))/det;
        c.save(); c.beginPath(); c.moveTo(A.x,A.y); c.lineTo(B.x,B.y); c.lineTo(E.x,E.y); c.closePath(); c.clip();
        c.transform(ax,ay,cx,cy,A.x-ax*a.x-cx*a.y,A.y-ay*a.x-cy*a.y);
        c.drawImage(TXK,0,0); c.restore();
      };
      for (let i=n-2; i>=0; i--) {
        const x0=W*(1-i/(n-1)), x1=W*(1-(i+1)/(n-1));
        const [a,b]=lados[i], [d,e]=lados[i+1];
        triangulo([{x:x0,y:0},{x:x1,y:0},{x:x0,y:H}],[a,d,b]);
        triangulo([{x:x1,y:0},{x:x1,y:H},{x:x0,y:H}],[d,e,b]);
      }
    } else {
    // Silueta continua: las plumas nacen del lomo y se solapan como un
    // plumaje, en lugar de ser púas sueltas colocadas sobre un tubo.
    const R = i => Math.max(2.3, 8.2 - i * .54);
    const puntos = S.map((s, i) => {
      const j = Math.max(1, i), a = ang(j), u = arribaDe(a);
      return { x:s.x, y:s.y, a, ux:Math.cos(u), uy:Math.sin(u), r:R(i) };
    });
    // Arranca debajo del penacho, detrás de la mandíbula.
    puntos[0].x = lerp(S[0].x, S[1].x, .46);
    puntos[0].y = lerp(S[0].y, S[1].y, .46);
    const silueta = (superior, inferior) => {
      const borde = (p, k) => [p.x + p.ux * p.r * k, p.y + p.uy * p.r * k];
      const lista = puntos.map(p => borde(p, superior)).concat([...puntos].reverse().map(p => borde(p, inferior)));
      c.beginPath(); c.moveTo(...lista[0]);
      for (let i = 1; i < lista.length; i++) {
        const actual = lista[i], siguiente = lista[(i + 1) % lista.length];
        c.quadraticCurveTo(actual[0], actual[1], (actual[0]+siguiente[0])/2, (actual[1]+siguiente[1])/2);
      }
      c.closePath();
    };
    // Capas del penacho dorsal y de la cola, detrás del cuerpo.
    for (let i = n - 1; i >= 1; i--) {
      const p = puntos[i], retro = p.a + Math.PI, alto = Math.atan2(p.uy, p.ux);
      const dir = alto + Math.atan2(Math.sin(retro-alto)*1.25, 1+Math.cos(retro-alto)*1.25);
      const largo = (10 + p.r * 1.45) * (i > n-3 ? 1.18 : 1);
      pluma(c, p.x + p.ux*p.r*.32, p.y + p.uy*p.r*.32, dir + Math.sin(t*2.5+i*.65)*.045, largo, 4.1, i%3 ? P.pluma : P.pluma2, P.oro);
    }
    { const p=puntos[n-1], dir=p.a+Math.PI;
      for (const k of [-1,0,1]) pluma(c,p.x,p.y,dir+k*.38+Math.sin(t*2.8+k)*.08,18-Math.abs(k)*2,4.2,k===0?P.pluma:P.pluma2,P.oro);
    }
    silueta(1, -1); c.fillStyle=C(P.oscura); c.fill(); c.strokeStyle=LN; c.lineWidth=1.1; c.lineJoin='round'; c.stroke();
    silueta(.72, -.68); c.fillStyle=C(P.cuerpo); c.fill();
    if (!BL) {
      // Una franja de vientre modelada y escamas que siguen cada segmento.
      silueta(-.38, -.83); c.fillStyle=ra(P.panza, .83); c.fill();
      c.lineCap='round';
      for (let i=1; i<n-1; i++) {
        const p=puntos[i], nx=p.ux, ny=p.uy, tx=Math.cos(p.a), ty=Math.sin(p.a);
        const x=p.x+nx*p.r*.05, y=p.y+ny*p.r*.05;
        c.save(); c.translate(x,y); c.rotate(p.a);
        c.fillStyle=C(i%3===0?P.pluma2:P.pluma);
        c.strokeStyle=ra(P.oscura,.75); c.lineWidth=.45;
        c.beginPath(); c.moveTo(-p.r*.68,-p.r*.22); c.quadraticCurveTo(-p.r*.1,-p.r*.78,p.r*.58,-p.r*.22); c.quadraticCurveTo(p.r*.08,p.r*.42,-p.r*.68,-p.r*.22); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle=ra(P.oro,.8); c.lineWidth=.43; c.beginPath(); c.moveTo(-p.r*.45,-p.r*.18); c.quadraticCurveTo(0,-p.r*.54,p.r*.37,-p.r*.18); c.stroke();
        c.fillStyle=C(P.oro); c.beginPath(); c.arc(0,-p.r*.2,.55,0,TAU); c.fill();
        c.restore();
      }
    }
    }
    // la cabeza: penacho, mandíbula que se abre, colmillos, ojo con ceja y la joya
    const a = Math.atan2(h.y - S[1].y, h.x - S[1].x);
    c.translate(h.x, h.y); c.rotate(a); if (Math.cos(a) < 0) c.scale(1, -1); if (stun) c.rotate(Math.sin(t * 8) * .2);
    const fuego = o.atk === 'fuego' && o.st === 'ataque', boca = fuego ? .55 + Math.sin(t * 12) * .1 : o.atk === 'picada' && o.st === 'ataque' && o.at > .7 && o.at < 1.5 ? .5 : .07 + Math.sin(t * 2) * .04;
    const pixelCabeza = !!(f.st && (f.st.pixel || f.st.fixedS || f.st.base));
    const abierta = fuego || (o.st === 'ataque' && o.atk === 'picada' && o.at > .7 && o.at < 1.5) || (o.st !== 'ataque' && t % 5 < .35);
    const idCabeza = String(window.estiloArteDerivado || f.st && f.st.id || '').split('~')[0];
    if (idCabeza === 'anime' && mandibulaAnime.complete && mandibulaAnime.naturalWidth) {
      const a = o.at || 0, picada = o.st === 'ataque' && o.atk === 'picada';
      const activa = fuego ? a > .35 && a < 2.75 : picada && a > .7 && a < 1.5;
      const q = !activa ? 0 : fuego ? [1,2,3,2][Math.floor(a * 7) % 4] : a < .85 ? 1 : a < 1.32 ? 2 : 3;
      c.save(); c.imageSmoothingEnabled = !pixelCabeza; if (BL) c.filter = 'brightness(3)';
      c.drawImage(mandibulaAnime,(q%2)*256,Math.floor(q/2)*256,256,256,-39.5+(q%2?2.15:0),-26.5,55,54);
      c.restore();
      if (fuego) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 5, -1, 6, '#ff9a2a', .55); c.restore(); }
      c.restore(); if (stun) estrellas(c,h.x,h.y-18,t,10); return;
    }
    const imagen = imagenKukulkan(pixelCabeza, abierta, f.st);
    if (imagen) {
      // El mascarón sigue la orientación de la cabeza; el cuerpo sigue
      // articulado por sus segmentos y no se estira como una sola imagen.
      c.save(); c.imageSmoothingEnabled = !pixelCabeza;
      if (BL) c.filter = 'brightness(3)';
      c.drawImage(imagen, -29, -11.5, 36, 24); c.restore();
      // La joya ya forma parte de cada ilustración; otra encima puede
      // quedar desplazada al cambiar de estilo o de pose.
      if (fuego) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 5, -1, 6, '#ff9a2a', .55); c.restore(); }
      c.restore();
      if (stun) estrellas(c, h.x, h.y - 18, t, 10);
      return;
    }
    if (listoForgeJefe('serpiente')) {
      const cuadro = stun || o.st === 'ventana' || o.st === 'herido' ? 1 : fuego ? 2 : o.st === 'muere' || o.st === 'ataque' && o.atk === 'picada' && o.at > .7 ? 3 : o.st === 'ataque' ? 1 : 0;
      c.save(); c.imageSmoothingEnabled = !pixelCabeza; if (BL) c.filter = 'brightness(3)';
      dibujaForgeJefe(c, 'serpiente', cuadro, -11, 0, 36, 24);
      c.restore();
      if (fuego) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 5, -1, 6, '#ff9a2a', .55); c.restore(); }
      c.restore(); if (stun) estrellas(c, h.x, h.y - 18, t, 10); return;
    }
    for (let k = 0; k < 6; k++) pluma(c, -5, -4, Math.PI + .5 + k * .22 + Math.sin(t * 6 + k) * .07, 14 + k * 1.8, 2.6, k % 2 ? P.pluma : P.pluma2, k % 3 ? P.oro : P.roja);
    for (let k = 0; k < 3; k++) pluma(c, -2, 3, Math.PI * .8 - k * .25 + Math.sin(t * 5 + k) * .08, 8 + k, 1.8, P.roja, null);
    if (!BL && boca > .12) { c.fillStyle = '#5a1420'; c.beginPath(); c.moveTo(-3, 1.4); c.lineTo(14, 1.4); c.lineTo(-3 + Math.cos(boca) * 16, 1.4 + Math.sin(boca) * 16); c.closePath(); c.fill(); if (fuego) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 9, 4, 8, '#ff9a2a', .8); c.restore(); } }
    if (!fuego && !BL && (t % 3.1) < .45) { const l = Math.sin((t % 3.1) / .45 * Math.PI) * 9; c.strokeStyle = '#d8304a'; c.lineWidth = .5; c.beginPath(); c.moveTo(12, 1.6); c.lineTo(12 + l, 1.8); c.lineTo(14 + l, .6); c.moveTo(12 + l, 1.8); c.lineTo(14 + l, 3); c.stroke(); }
    c.save(); c.translate(-3, 1.6); c.rotate(boca);
    vol(c, q => { q.moveTo(0, 0); q.lineTo(15.5, 0); q.quadraticCurveTo(16.5, 2.4, 13, 3.4); q.quadraticCurveTo(4, 5.2, -2, 3); q.closePath(); }, sh(P.cuerpo, -.1), [-2, 0, 16.5, 5.2], { lw: .7, tex: q => { q.fillStyle = ra(P.panza, .9); q.fillRect(-2, 2.4, 18, 3); } });
    c.fillStyle = C('#fffaf0'); for (let x = 7; x < 15; x += 2.6) { c.beginPath(); c.moveTo(x, .2); c.lineTo(x + .7, -1.6); c.lineTo(x + 1.4, .2); c.fill(); }
    c.restore();
    const cab = q => { q.moveTo(-8, -5); q.quadraticCurveTo(-2, -10.5, 6, -8.4); q.quadraticCurveTo(12, -6.8, 15.5, -2.6); q.quadraticCurveTo(16.4, .6, 14, 1.6); q.lineTo(-3, 1.6); q.quadraticCurveTo(-9, 1, -8, -5); q.closePath(); };
    vol(c, cab, P.cuerpo, [-9, -10.5, 16.4, 1.6], { lw: .8, tex: q => {
      q.strokeStyle = ra(P.oscura, .45); q.lineWidth = .35; for (let x = -4; x < 12; x += 3) { q.beginPath(); q.moveTo(x, -6.5); q.lineTo(x + 1.5, -5); q.lineTo(x + 3, -6.5); q.stroke(); }
      q.strokeStyle = ra(P.oro, .9); q.lineWidth = .6; q.beginPath(); for (let k = 0; k < 14; k++) { const an = k * .6, rr = 3 - k * .2; q.lineTo(-2.5 + Math.cos(an) * rr, -2 + Math.sin(an) * rr); } q.stroke();
    } });
    c.fillStyle = C('#fffaf0'); for (const x of [10, 12.6]) { c.beginPath(); c.moveTo(x, 1.4); c.quadraticCurveTo(x + .6, 3.6, x + .2, 4.6); c.lineTo(x + 1.3, 1.4); c.fill(); }
    c.fillStyle = C(LN); c.beginPath(); c.ellipse(14.2, -2.6, .8, .45, -.3, 0, TAU); c.fill();
    if (stun) { c.strokeStyle = C('#fff3a0'); c.lineWidth = .6; c.beginPath(); for (let k = 0; k < 12; k++) { const an = k * .8 + t * 8, rr = k * .17; c.lineTo(4 + Math.cos(an) * rr, -4.6 + Math.sin(an) * rr); } c.stroke(); }
    else ojo(c, 4, -4.6, 2.4, 2.1, { iris: P.oro, rendija: true, ir: .78, ceja: .9, enojo: 1, abre: parpadeo(t, 1) ? 0 : 1, lw: .5 });
    gema(c, o, f, 1, -8.8, 2.2, 'rombo');
    c.restore();
    if (stun) estrellas(c, h.x, h.y - 18, t, 10);
  };

  // =====================================================================
  //  EL JAGUAR DE OBSIDIANA
  // =====================================================================
  const ROS = [[-13, -12], [-8, -15.5], [-3, -11], [2, -15], [6.5, -11.5], [-9, -8.6], [0, -8], [-15.5, -9.5], [7.5, -15.5], [-4, -16.2]];
  X.BODY.jaguar = (c, o, f) => {
    const P = colores(o, { piel: '#2e2c3a', clara: '#615f7c', roseta: '#0d0b15', oro: '#eab443', panza: '#4c4864', boca: '#8a2a34' }, .2);
    const t = f.t, stun = o.stunT > 0; BL = blanco(o, t); LN = '#07050b';
    const cr = o.crouch ? 3 : 0, run = o.st === 'ataque' && o.atk === 'garras' && o.at > .5, aire = o.y < FLOOR - 1.5;
    if (listoForgeJefe('jaguar') && o.st !== 'herido' && o.st !== 'muere' && o.st !== 'ventana') {
      let cuadro = Math.floor(t * (run ? 12 : 4)) % 2;
      if (o.cineAcecho || o.crouch || o.cineAterriza || o.st === 'ataque' && o.atk === 'acecho') cuadro = 2;
      else if (aire) cuadro = 1;
      if (o.st === 'ataque' && o.atk === 'rugido' && o.at > .25) cuadro = 3;
      c.save(); c.translate(o.x, o.y - 11); c.scale(o.face || 1, 1);
      if (stun) c.rotate(Math.sin(t * 7) * .08);
      if (o.flash > 0 && Math.sin(t * 40) > 0) c.globalAlpha = .72;
      dibujaForgeJefe(c, 'jaguar', cuadro, 0, 0, 52, 42);
      if (stun) estrellas(c, 0, -22, t, 8);
      c.restore(); return;
    }
    const v = paso(o, 'j', .24), mov = v > .05 && !aire, ph = o._pj || 0;
    c.save(); c.translate(o.x, 0); sombraSuelo(c, 0, FLOOR + 1, 18, FLOOR - o.y); c.restore();
    c.save(); c.translate(o.x, o.y); c.scale(o.face, 1); comun(c, o);
    const bob = mov ? -Math.abs(Math.sin(ph)) * 1.3 : Math.sin(t * 2) * .35, by = cr + bob;
    // la cola en S, gruesa, con anillos hacia la punta (se mece, y azota corriendo)
    const ts = Math.sin(t * (run ? 14 : 2.6)), cpt = u => bez([-17, -11 + by], [-25, -7 + by + ts], [-31, -9 + by - ts * 2], [-31 + ts * 2, -19 + by - ts * 2.5], u);
    const tp = tubo(c, cpt, u => 3.6 - u * 1.6, P.piel, 14, { brillo: false });
    if (!BL) { c.strokeStyle = P.roseta; c.lineWidth = 1.1; c.lineCap = 'butt'; for (const k of [8, 10, 12]) { const [x, y] = tp[k], [x2, y2] = tp[k + 1], a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, w = (3.6 - k / 14 * 1.6) / 2 + .2; c.beginPath(); c.moveTo(x + Math.cos(a) * w, y + Math.sin(a) * w); c.lineTo(x - Math.cos(a) * w, y - Math.sin(a) * w); c.stroke(); } c.lineCap = 'round'; }
    // patas: muslo, pierna y mano; las de lejos más oscuras
    const pata = (bx, fase, lejos) => {
      const col = lejos ? sh(P.piel, -.3) : P.piel, del = bx > 0;
      let a1, a2;
      if (aire) { a1 = del ? -1 : 1; a2 = del ? .5 : -.4; }
      else if (mov) { const s = Math.sin(ph + fase); a1 = s * (run ? .85 : .5); a2 = Math.max(0, -Math.cos(ph + fase)) * (run ? 1.1 : .7) * (del ? -1 : 1); }
      else { a1 = cr ? (del ? -.55 : .65) : 0; a2 = cr ? (del ? 1.05 : -1.15) : 0; }
      const hip = [bx, -10 + by], k1 = [hip[0] + Math.sin(a1) * 5.6, hip[1] + Math.cos(a1) * 5.6], k2 = [k1[0] + Math.sin(a1 + a2) * 5, k1[1] + Math.cos(a1 + a2) * 5];
      tubo(c, u => u < .5 ? L2(hip, k1, u * 2) : L2(k1, k2, (u - .5) * 2), u => 5.4 - u * 2.2, col, 4, { brillo: lejos ? false : .12 });
      vol(c, q => q.ellipse(k2[0] + 1.5, k2[1] - .6, 3, 1.8, 0, 0, TAU), col, [k2[0] - 1.5, k2[1] - 2.4, k2[0] + 4.5, k2[1] + 1.2], { lw: .5, bd: .4, tex: q => { q.strokeStyle = 'rgba(0,0,0,.5)'; q.lineWidth = .3; for (const d of [.4, 1.6, 2.8]) { q.beginPath(); q.moveTo(k2[0] + d, k2[1] - .2); q.lineTo(k2[0] + d, k2[1] + 1.2); q.stroke(); } } });
    };
    pata(-10, Math.PI, true); pata(8, 0, true);
    // el cuerpo: lomo con la joroba de los hombros, pecho hondo, rosetas, panza y el brillo de la obsidiana
    const cuerpo = q => { q.moveTo(-18.4, -10 + by); q.bezierCurveTo(-18.4, -17 + by, -10, -19 + by, -2, -17.4 + by); q.bezierCurveTo(3, -16.6 + by, 5.5, -20.4 + by, 10, -19.4 + by); q.bezierCurveTo(15.5, -18.2 + by, 15.6, -9 + by, 11.6, -5.8 + by); q.bezierCurveTo(5, -3.4 + by, -8, -4.4 + by, -14, -6 + by); q.bezierCurveTo(-17, -7 + by, -18.4, -8 + by, -18.4, -10 + by); q.closePath(); };
    vol(c, cuerpo, P.piel, [-19, -20.4 + by, 15.6, -3.4 + by], { lw: .85, luz: .2, tex: q => {
      q.fillStyle = ra(P.panza, .75); q.beginPath(); q.ellipse(-1, -4.8 + by, 13, 2.6, 0, 0, TAU); q.fill();
      q.strokeStyle = 'rgba(0,0,0,.28)'; q.lineWidth = .6; q.beginPath(); q.moveTo(6, -17 + by); q.quadraticCurveTo(3, -11 + by, 6.5, -6 + by); q.moveTo(-12, -15 + by); q.quadraticCurveTo(-9, -10 + by, -12.5, -6.5 + by); q.stroke();
      for (const [rx, ry] of ROS) { q.fillStyle = ra(P.oro, .24); q.beginPath(); q.arc(rx, ry + by, 1.3, 0, TAU); q.fill(); q.fillStyle = P.roseta; for (let j = 0; j < 5; j++) { const an = j * 1.3 + rx; q.beginPath(); q.arc(rx + Math.cos(an) * 2, ry + by + Math.sin(an) * 1.7, .7, 0, TAU); q.fill(); } }
      const u = ((t * .35) % 1.6) - .3, gx = lerp(-20, 16, u), g = q.createLinearGradient(gx - 5, 0, gx + 5, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(210,225,255,.38)'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(gx - 6, -20 + by, 12, 16);
    } });
    pata(-13, 0, false); pata(10.5, Math.PI, false);
    // la cabeza
    const hx = 14, hy = -15 + cr + bob * .6, ruge = o.st === 'ataque' && o.atk === 'rugido' && o.at > .3 && o.at < 1.5, jaw = ruge ? .6 : (o.st === 'ventana' && !stun ? .12 + Math.sin(t * 5) * .06 : 0);
    for (const [ex, ey, d] of [[hx - 3.6, hy - 6.6, -1], [hx + 1.4, hy - 7.6, 1]]) vol(c, q => { q.moveTo(ex - 2.2, ey + 1.6); q.quadraticCurveTo(ex - 1.6 + d * .3, ey - 2.8, ex + .4, ey - 3); q.quadraticCurveTo(ex + 2.4, ey - 1.4, ex + 2.2, ey + 1.6); q.closePath(); }, d < 0 ? sh(P.piel, -.2) : P.piel, [ex - 2.2, ey - 3, ex + 2.4, ey + 1.6], { lw: .5, tex: q => { q.fillStyle = ra(P.clara, .7); q.beginPath(); q.ellipse(ex + .1, ey - .2, .9, 1.4, 0, 0, TAU); q.fill(); } });
    if (jaw > .05 && !BL) { c.fillStyle = P.boca; c.beginPath(); c.moveTo(hx + 1.5, hy + 2.4); c.lineTo(hx + 10.4, hy + 1.6); c.lineTo(hx + 1.5 + Math.cos(jaw) * 9, hy + 2.4 + Math.sin(jaw) * 9); c.closePath(); c.fill(); }
    c.save(); c.translate(hx + 1.5, hy + 2.6); c.rotate(jaw);
    vol(c, q => { q.moveTo(-1.5, -.4); q.lineTo(8.4, -.8); q.quadraticCurveTo(8.8, 1.6, 6.6, 2.4); q.quadraticCurveTo(2, 3.2, -1.5, 2); q.closePath(); }, sh(P.piel, -.08), [-1.5, -.8, 8.8, 3.2], { lw: .55, tex: q => { q.fillStyle = ra(P.clara, .55); q.fillRect(-1.5, 1, 10.5, 2.4); } });
    if (ruge) { c.fillStyle = C('#fffaf0'); for (const x of [1.4, 6.4]) { c.beginPath(); c.moveTo(x, -.6); c.lineTo(x + .7, -2.8); c.lineTo(x + 1.4, -.6); c.fill(); } }
    c.restore();
    const cab = q => { q.moveTo(hx - 6.4, hy + 1); q.bezierCurveTo(hx - 7.4, hy - 6, hx - 1, hy - 9.6, hx + 4, hy - 7.8); q.quadraticCurveTo(hx + 9, hy - 6.6, hx + 10.8, hy - 2.8); q.quadraticCurveTo(hx + 11.6, hy + .4, hx + 9.8, hy + 1.8); q.quadraticCurveTo(hx + 7, hy + 4.6, hx + 1, hy + 4.6); q.quadraticCurveTo(hx - 5, hy + 4.4, hx - 6.4, hy + 1); q.closePath(); };
    vol(c, cab, P.piel, [hx - 7.4, hy - 9.6, hx + 11.6, hy + 4.6], { lw: .75, luz: .22, tex: q => {
      q.fillStyle = ra(P.clara, .5); q.beginPath(); q.ellipse(hx + 7.4, hy + 1, 3.8, 2.4, -.1, 0, TAU); q.fill();
      q.strokeStyle = 'rgba(0,0,0,.3)'; q.lineWidth = .5; q.beginPath(); q.moveTo(hx + 1.6, hy - 5.6); q.quadraticCurveTo(hx + 4.4, hy - 5.4, hx + 6, hy - 4); q.stroke();
      q.fillStyle = P.roseta; for (const [rx, ry] of [[-3.6, -4.4], [-1, -6.6], [-4.8, .2], [-2.2, -1.6], [1.4, -7.4]]) { q.beginPath(); q.arc(hx + rx, hy + ry, .65, 0, TAU); q.fill(); }
    } });
    if (ruge) { c.fillStyle = C('#fffaf0'); for (const x of [hx + 4.4, hx + 8.4]) { c.beginPath(); c.moveTo(x, hy + 2.6); c.lineTo(x + .65, hy + 5.4); c.lineTo(x + 1.3, hy + 2.6); c.fill(); } }
    c.fillStyle = C('#1a0e14'); c.beginPath(); c.moveTo(hx + 9.2, hy - 3); c.lineTo(hx + 11.2, hy - 2.7); c.lineTo(hx + 10.4, hy - 1.3); c.closePath(); c.fill();
    if (!BL) { c.strokeStyle = 'rgba(240,235,220,.55)'; c.lineWidth = .25; for (const [dx, dy] of [[5.4, -1.6], [5.8, -.2], [5, 1.2]]) { c.beginPath(); c.moveTo(hx + 8.4, hy + .4); c.quadraticCurveTo(hx + 8.4 + dx * .6, hy + dy * .6, hx + 8.4 + dx, hy + dy); c.stroke(); } }
    const ex = hx + 4.2, ey = hy - 3.4, [mx, my] = mira(o, f, ex, ey, o.face);
    if (stun) { c.strokeStyle = C(P.oro); c.lineWidth = .5; c.beginPath(); for (let k = 0; k < 10; k++) { const an = k * .8 + t * 8, rr = k * .17; c.lineTo(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr); } c.stroke(); }
    else { if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, ex, ey, 5, P.oro, o.st === 'ataque' ? .6 : .32); c.restore(); } ojo(c, ex, ey, 2, 1.4, { iris: P.oro, rendija: true, ir: .92, blanco: '#f6e6b0', mx, my, ceja: .7, enojo: 1, abre: parpadeo(t, 2) ? 0 : 1, lw: .5 }); }
    gema(c, o, f, 14, -21.6 + cr + bob * .6, 2, 'rombo');
    if (stun) estrellas(c, 14, -29 + cr, t, 8);
    c.restore();
  };

  // =====================================================================
  //  LA REINA DE LAS HADAS
  // =====================================================================
  function ala(c, x, y, s, rot, P, t) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const path = q => { q.moveTo(0, 0); q.bezierCurveTo(10, -24, 28, -20, 22, -6); q.bezierCurveTo(26, 2, 14, 8, 0, 3); q.closePath(); };
    c.beginPath(); path(c);
    if (BL) { c.fillStyle = '#ffffff'; c.fill(); }
    else { const g = c.createLinearGradient(0, -20, 24, 6); g.addColorStop(0, ra(P.ala, .7)); g.addColorStop(.55, 'rgba(255,255,255,.35)'); g.addColorStop(1, ra(P.vestido, .6)); c.fillStyle = g; c.fill(); }
    if (!BL) {
      c.save(); c.beginPath(); path(c); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .45; c.beginPath(); for (const [ex, ey] of [[20, -16], [24, -7], [20, 2], [12, 5]]) { c.moveTo(1, 0); c.quadraticCurveTo(ex * .5, ey * .3, ex, ey); } c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = .3; for (let k = 0; k < 6; k++) { const a = -1.1 + k * .32; c.beginPath(); c.arc(0, 0, 12 + (k % 2) * 4, a, a + .3); c.stroke(); }
      c.fillStyle = ra(P.vestido, .75); c.beginPath(); c.arc(17, -9, 2.8, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(17, -9, 1.1, 0, TAU); c.fill();
      for (let k = 0; k < 5; k++) { const tw = Math.max(0, Math.sin(t * 4 + k * 1.7)); c.fillStyle = `rgba(255,255,255,${tw * .9})`; c.beginPath(); c.arc(6 + hs(k, 3) * 16, -12 + hs(3, k) * 14, .45, 0, TAU); c.fill(); }
      c.restore();
    }
    c.strokeStyle = BL ? '#fff' : ra(P.vestido2, .9); c.lineWidth = .7; c.beginPath(); path(c); c.stroke();
    c.restore();
  }
  X.BODY.hadas = (c, o, f) => {
    const P = colores(o, { vestido: '#f4efe2', vestido2: '#c8203a', ala: '#c8f4d8', piel: '#c89a78', pelo: '#1a1418', oro: '#3f9a5c' }, .2);
    const t = f.t, stun = o.stunT > 0; BL = blanco(o, t); LN = sh(P.vestido2, -.55);
    if (listoForgeJefe('hadas') && o.st !== 'herido' && o.st !== 'muere') {
      const cuadro = stun ? 3 : o.st === 'ataque' ? 2 : Math.floor(t * 5) % 2;
      c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .16);
      if (BL) c.globalAlpha = .72;
      dibujaForgeJefe(c, 'hadas', cuadro, 0, -8, 34, 50);
      c.restore(); return;
    }
    const flota = stun ? 0 : Math.sin(t * 2.2) * 1.3, ataca = o.st === 'ataque';
    c.save(); c.translate(o.x, o.y + flota); if (stun) c.rotate(Math.sin(t * 6) * .3); comun(c, o);
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -6, 34, P.ala, .22); c.restore(); }
    // la rama de ceiba de la que se aparece, con flores que se mecen
    if (!BL) { c.strokeStyle = '#3a2a22'; c.lineCap = 'round'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-24, -24); c.quadraticCurveTo(-8, -28, 14, -21); c.stroke(); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-6, -26); c.quadraticCurveTo(-2, -32, 6, -33); c.stroke(); for (let k = 0; k < 5; k++) { const x = -20 + k * 8, y = -24 - Math.sin(k * 1.7) * 3 + Math.sin(t * 1.6 + k) * .7; c.fillStyle = k % 2 ? '#f4efe2' : '#e8a0b0'; c.beginPath(); c.arc(x, y, 1.5, 0, TAU); c.fill(); c.fillStyle = '#e8b84a'; c.beginPath(); c.arc(x, y, .5, 0, TAU); c.fill(); } }
    // el pelo largo, por detrás
    const ond = Math.sin(t * 2.4);
    vol(c, q => { q.moveTo(-4.6, -14); q.bezierCurveTo(-9, -8, -7 + ond, 0, -9 + ond * 1.5, 6); q.quadraticCurveTo(-4, 3, -2, -6); q.lineTo(2, -6); q.quadraticCurveTo(4, 3, 9 - ond * 1.5, 6); q.bezierCurveTo(7 - ond, 0, 9, -8, 4.6, -14); q.closePath(); }, P.pelo, [-9, -14, 9, 6], { lw: .5, tex: q => { q.strokeStyle = ra(sh(P.pelo, -.3), .6); q.lineWidth = .3; for (const x of [-6, -4, 4, 6]) { q.beginPath(); q.moveTo(x * .7, -12); q.quadraticCurveTo(x, -4, x * 1.2 + ond, 4); q.stroke(); } } });
    // el vestido: campana con el borde en ondas, pliegues y pétalos encima que se mecen
    const vs = Math.sin(t * 2.4) * 1.2, hem = k => [lerp(-11.5, 11.5, k / 6) + vs * .5, 14];
    const falda = q => { q.moveTo(-4.4, -1.2); q.quadraticCurveTo(-7.4, 6, hem(0)[0], 14); for (let k = 0; k < 6; k++) { const [x0] = hem(k), [x1] = hem(k + 1); q.quadraticCurveTo((x0 + x1) / 2, 17.4 + Math.sin(t * 3 + k) * .5, x1, 14); } q.quadraticCurveTo(7.4, 6, 4.4, -1.2); q.closePath(); };
    vol(c, falda, P.vestido, [-12, -1.2, 12, 17.6], { lw: .6, luz: .32, osc: .38, tex: q => {
      for (let k = 0; k < 7; k++) { const x = lerp(-9.5, 9.5, k / 6) + vs * .4; q.strokeStyle = k % 2 ? 'rgba(40,10,60,.22)' : 'rgba(255,240,255,.28)'; q.lineWidth = .7; q.beginPath(); q.moveTo(x * .3, -1); q.quadraticCurveTo(x * .7, 7, x, 16.5); q.stroke(); }
      q.fillStyle = ra(P.oro, .8); for (let k = 0; k < 14; k++) { q.beginPath(); q.arc(-9 + hs(k, 21) * 18, 3 + hs(21, k) * 11, .35, 0, TAU); q.fill(); }
    } });
    if (!BL) { c.strokeStyle = P.oro; c.lineWidth = .55; c.beginPath(); c.moveTo(hem(0)[0], 14); for (let k = 0; k < 6; k++) { const [x0] = hem(k), [x1] = hem(k + 1); c.quadraticCurveTo((x0 + x1) / 2, 17.4 + Math.sin(t * 3 + k) * .5, x1, 14); } c.stroke(); }
    for (const k of [0, 4, 1, 3, 2]) { const a = lerp(-.95, .95, k / 4) + Math.sin(t * 2.6 + k) * .06, L = 11 - Math.abs(k - 2) * 1.2; c.save(); c.translate(0, -1); c.rotate(a); vol(c, q => { q.moveTo(0, 0); q.quadraticCurveTo(-3.4, L * .55, 0, L); q.quadraticCurveTo(3.4, L * .55, 0, 0); q.closePath(); }, mz(P.vestido, '#ffffff', .3), [-3.4, 0, 3.4, L], { lw: .45, luz: .35, osc: .25, bd: .5, tex: q => { q.strokeStyle = 'rgba(255,255,255,.5)'; q.lineWidth = .3; q.beginPath(); q.moveTo(0, .6); q.lineTo(0, L - 1); q.stroke(); } }); c.restore(); }
    // corpiño
    vol(c, q => { q.moveTo(-3.2, -8.6); q.lineTo(3.2, -8.6); q.lineTo(4.4, -1); q.quadraticCurveTo(0, .6, -4.4, -1); q.closePath(); }, P.vestido2, [-4.4, -8.6, 4.4, .6], { lw: .5, tex: q => { q.strokeStyle = ra(P.oro, .9); q.lineWidth = .3; q.beginPath(); for (let y = -7.5; y < -1; y += 1.6) { q.moveTo(-1, y); q.lineTo(1, y + .8); q.moveTo(1, y); q.lineTo(-1, y + .8); } q.stroke(); } });
    // brazos: uno en la cintura, el otro con la varita (la alza al atacar)
    const alza = ataca ? Math.min(1, o.at * 2) : 0, mano = [8 - alza, -7.5 - alza * 5];
    tubo(c, u => u < .5 ? L2([-3.2, -7.6], [-6.4, -4], u * 2) : L2([-6.4, -4], [-4.2, -1.2], (u - .5) * 2), () => 1.3, P.piel, 4, { lw: .5 });
    tubo(c, u => u < .5 ? L2([3.2, -7.6], [6.4, -5.6 - alza * 2], u * 2) : L2([6.4, -5.6 - alza * 2], mano, (u - .5) * 2), () => 1.3, P.piel, 4, { lw: .5 });
    const punta = [mano[0] + 5, mano[1] - 6.5];
    c.strokeStyle = C(sh(P.oro, -.3)); c.lineWidth = .9; c.lineCap = 'round'; c.beginPath(); c.moveTo(mano[0], mano[1]); c.lineTo(punta[0], punta[1]); c.stroke(); c.strokeStyle = C(P.oro); c.lineWidth = .45; c.stroke();
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, punta[0], punta[1], 7, P.ala, .8); c.restore(); }
    c.save(); c.translate(punta[0], punta[1]); c.rotate(t * 2); c.fillStyle = C('#fff6c0'); c.strokeStyle = sh(P.oro, -.4); c.lineWidth = .3; c.beginPath(); for (let k = 0; k < 10; k++) { const an = k / 10 * TAU, rr = k % 2 ? 1 : 2.4; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore();
    if (!BL) for (let k = 0; k < 5; k++) { const u = ((t * .9 + k * .2) % 1), x = punta[0] - u * 8 + Math.sin(t * 3 + k) * 2, y = punta[1] + u * 10; c.fillStyle = `rgba(255,250,210,${(1 - u) * .9})`; c.beginPath(); c.arc(x, y, .6 * (1 - u) + .2, 0, TAU); c.fill(); }
    // la cara
    vol(c, q => q.arc(0, -12, 4.2, 0, TAU), P.piel, [-4.2, -16.2, 4.2, -7.8], { lw: .5, luz: .18, osc: .22 });
    if (!BL) { c.fillStyle = 'rgba(255,120,150,.35)'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 2.4, -10.6, 1, .6, 0, 0, TAU); c.fill(); } }
    const [mx, my] = mira(o, f, 0, -12), cerr = parpadeo(t, 3) ? 0 : 1;
    for (const d of [-1, 1]) ojo(c, d * 1.6, -12.4, .95, 1.15, { iris: '#7a4ab8', ir: .82, mx, my, abre: stun ? 0 : cerr, ln: '#3a1a2a', lw: .35 });
    c.strokeStyle = C('#8a3a4a'); c.lineWidth = .35; c.beginPath(); if (ataca) c.arc(0, -9.4, .7, Math.PI * 1.1, Math.PI * 1.9); else c.arc(0, -10.2, .8, .2, Math.PI - .2); c.stroke();
    vol(c, q => { q.moveTo(-4.4, -12.4); q.quadraticCurveTo(-4.6, -17.2, 0, -16.8); q.quadraticCurveTo(4.6, -17.2, 4.4, -12.4); q.quadraticCurveTo(2.6, -15, .5, -13.6); q.quadraticCurveTo(-2, -15.4, -4.4, -12.4); q.closePath(); }, P.pelo, [-4.6, -17.2, 4.6, -12.4], { lw: .45 });
    // la corona con la joya (núcleo)
    vol(c, q => { q.moveTo(-4, -16.6); q.lineTo(-3.2, -21); q.lineTo(-1.4, -18.2); q.lineTo(0, -22.4); q.lineTo(1.4, -18.2); q.lineTo(3.2, -21); q.lineTo(4, -16.6); q.closePath(); }, P.oro, [-4, -22.4, 4, -16.6], { lw: .45, luz: .4 });
    if (!BL) { c.fillStyle = '#7ae0ff'; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 3.2, -21, .55, 0, TAU); c.fill(); } }
    gema(c, o, f, 0, -18.4, 1.5, 'circulo');
    if (stun) estrellas(c, 0, -25, t, 8);
    c.restore();
  };

  // =====================================================================
  //  EL COCODRILO DEL CENOTE
  // =====================================================================
  X.BODY.cocodrilo = (c, o, f) => {
    const P = colores(o, { piel: '#4d6e3a', oscura: '#1d2c16', panza: '#d2c892', escudo: '#34492a', boca: '#c8606a', ojo: '#d8c040' }, .26);
    const t = f.t, stun = o.stunT > 0; BL = blanco(o, t); LN = sh(P.oscura, -.5);
    if (listoForgeJefe('cocodrilo') && (!(o.mordida > 0) || o.cineAgua != null) && o.sub <= .7 && o.st !== 'herido' && o.st !== 'muere') {
      const mordidaCine = o.cineAgua != null && o.mordida > 0;
      let cuadro = mordidaCine ? 2 : Math.floor(t * 4) % 2;
      if (o.st === 'ventana' || o.st === 'entra') cuadro = 0;
      if (o.st === 'ataque' && o.atk === 'escupe' && o.at > .25) cuadro = 2;
      if (o.st === 'ataque' && o.atk === 'coletazo') cuadro = 3;
      const m = mordidaCine ? clamp(o.mordida, 0, 1) : 1;
      c.save(); c.translate(o.x, mordidaCine ? o.cineAgua + (1 - m) * 16 : FLOOR + o.sub * 16); c.scale(o.face || 1, mordidaCine ? .72 + .28 * m : 1);
      if (stun) c.rotate(Math.sin(t * 7) * .08);
      dibujaForgeJefe(c, 'cocodrilo', cuadro, 0, mordidaCine ? 0 : -21, 62, 34);
      if (stun) estrellas(c, 0, -29, t, 8);
      c.restore(); return;
    }
    if (o.mordida > 0) { // respaldo vectorial para la mordida durante el juego
      const m = o.mordida; c.save(); c.translate(o.x, FLOOR);
      if (!BL) { c.fillStyle = ra(P.panza, .6); for (let k = 0; k < 8; k++) { const a = Math.PI + (k + .5) / 8 * Math.PI, r = 13 + m * 7; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * .4 - m * 2, 1 + hs(k, 2) * 1.2, 0, TAU); c.fill(); } c.fillStyle = '#4a1218'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(0, -42 * m); c.lineTo(9, 0); c.closePath(); c.fill(); }
      for (const d of [-1, 1]) {
        c.save(); c.scale(d, 1); c.rotate(-.25 + (1 - m) * .2);
        const jaw = q => { q.moveTo(0, 0); q.quadraticCurveTo(2, -30 * m, 4.5, -44 * m); q.quadraticCurveTo(9.5, -42 * m, 11, -34 * m); q.lineTo(12.5, 0); q.closePath(); };
        vol(c, jaw, d < 0 ? sh(P.piel, -.15) : P.piel, [0, -44 * m, 12.5, 0], { lw: .9, tex: q => { q.strokeStyle = ra(P.oscura, .45); q.lineWidth = .4; for (let y = -4; y > -44 * m; y -= 4) { q.beginPath(); q.moveTo(2, y); q.lineTo(13, y + 1); q.stroke(); } q.fillStyle = ra(P.escudo, .9); for (let y = -6; y > -36 * m; y -= 6) { q.beginPath(); q.arc(11.4, y, 1.2, 0, TAU); q.fill(); } } });
        c.fillStyle = C(P.boca); c.beginPath(); c.moveTo(.4, 0); c.quadraticCurveTo(2.4, -30 * m, 4.6, -43 * m); c.lineTo(5.8, -41.6 * m); c.quadraticCurveTo(3.8, -30 * m, 2.4, 0); c.closePath(); c.fill();
        c.fillStyle = C('#fff8e8'); for (let k = 1; k < 8; k++) { const y = -k * 5.3 * m, x = 1.6 + k * .42; c.beginPath(); c.moveTo(x + 1, y + 1.2); c.lineTo(x - 2.3, y - .5); c.lineTo(x + 1, y - 1.6); c.closePath(); c.fill(); }
        c.restore();
      }
      c.restore(); return;
    }
    if (o.sub > .7) return;
    const e = o.erg || 0, v = paso(o, 'c', .3), mov = v > .05, s = mov ? Math.sin(o._pc) : 0;
    c.save(); c.translate(o.x, FLOOR + o.sub * 16); c.scale(o.face, 1); comun(c, o); c.rotate(-e * 1.2);
    const escupe = o.st === 'ataque' && o.atk === 'escupe', boca = escupe && o.at > .3 ? Math.max(0, Math.sin(((o.at % .55) / .55) * Math.PI)) * .5 : (o.st === 'ventana' && !stun ? .14 + Math.sin(t * 3) * .05 : 0);
    const cola = Math.sin(t * 2.5) * 1.5 + (o.atk === 'coletazo' && o.st === 'ataque' ? Math.sin(o.at * 8) * 4 : 0), br = Math.sin(t * 1.8) * .4;
    const pataC = (bx, f2, lejos) => { const col = lejos ? sh(P.piel, -.38) : sh(P.piel, -.14), a = [bx, -3.5], b = [bx + 2.4 + f2 * 2.6, -.4 - Math.max(0, f2) * 1.6], cc = [bx + 4.4 + f2 * 3, 1]; tubo(c, u => u < .5 ? L2(a, b, u * 2) : L2(b, cc, (u - .5) * 2), u => 3.8 - u * 1.4, col, 4, { brillo: lejos ? false : .1 }); if (!BL) { c.strokeStyle = LN; c.lineWidth = .5; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(cc[0], cc[1]); c.lineTo(cc[0] + 2 + k * .3, cc[1] + k * .9); c.stroke(); } } };
    pataC(-12, s, true); pataC(10, -s, true);
    // la mandíbula de abajo (se abre para escupir)
    if (boca > .05 && !BL) { c.fillStyle = '#5a1a22'; c.beginPath(); c.moveTo(15, -3.4); c.lineTo(34, -3.8); c.lineTo(15 + Math.cos(boca) * 19, -3.4 + Math.sin(boca) * 19); c.closePath(); c.fill(); c.fillStyle = P.boca; c.beginPath(); c.ellipse(20, -2 + boca * 5, 4, 1.2, boca, 0, TAU); c.fill(); }
    c.save(); c.translate(15, -3.4); c.rotate(boca);
    vol(c, q => { q.moveTo(0, 0); q.lineTo(19, -.4); q.quadraticCurveTo(20, 1.6, 17, 2.2); q.lineTo(2, 3); q.closePath(); }, sh(P.piel, -.08), [0, -.4, 20, 3], { lw: .7, tex: q => { q.fillStyle = ra(P.panza, .8); q.fillRect(0, 1.6, 20, 2); } });
    c.fillStyle = C('#fff8e8'); for (let x = 3; x < 18; x += 2.8) { c.beginPath(); c.moveTo(x, -.2); c.lineTo(x + .7, -1.8); c.lineTo(x + 1.4, -.2); c.fill(); }
    c.restore();
    // el cuerpo: escamas en cuadrícula, panza clara y escudos en el lomo
    const cuerpo = q => { q.moveTo(-44, -3 + cola); q.quadraticCurveTo(-34, -6.5 + cola * .6, -24, -9.2 + br); q.quadraticCurveTo(-8, -15.4 + br, 6, -12.6); q.lineTo(12, -11.6); q.lineTo(15.5, -12.2); q.quadraticCurveTo(18.5, -15.4, 21.4, -12.3); q.quadraticCurveTo(28, -9.6, 33, -7.4); q.quadraticCurveTo(35.6, -6, 34, -3.8); q.lineTo(15, -3.4); q.quadraticCurveTo(-2, 1.4, -22, -1); q.quadraticCurveTo(-34, -1.4, -44, -2 + cola); q.closePath(); };
    vol(c, cuerpo, P.piel, [-44, -15.4, 36, 1.4], { lw: .9, tex: q => {
      q.fillStyle = ra(P.panza, .9); q.beginPath(); q.moveTo(-30, -1.6); q.quadraticCurveTo(-6, 1.6, 15, -2.8); q.lineTo(15, -1); q.quadraticCurveTo(-6, 3, -30, 0); q.closePath(); q.fill();
      q.strokeStyle = ra(sh(P.panza, -.35), .7); q.lineWidth = .3; for (let x = -26; x < 14; x += 2.6) { q.beginPath(); q.moveTo(x, -2.2); q.lineTo(x + .4, 1); q.stroke(); }
      q.strokeStyle = ra(P.oscura, .38); q.lineWidth = .35; for (let x = -42; x < 33; x += 3.2) { q.beginPath(); q.moveTo(x, -16); q.lineTo(x + .6, -1); q.stroke(); }
      for (const y of [-9, -6]) { q.beginPath(); q.moveTo(-40, y + 3); q.quadraticCurveTo(-10, y - 2, 16, y + .5); q.stroke(); }
      q.fillStyle = ra(P.oscura, .5); for (const [x, y] of [[31.8, -7.2], [32.8, -6.6]]) { q.beginPath(); q.arc(x, y, .5, 0, TAU); q.fill(); }
    } });
    // escudos del lomo (dos filas que suben y bajan)
    const lomo = x => x < -24 ? lerp(-3.4 + cola, -9.4 + br, (x + 44) / 20) : x < 6 ? lerp(-9.4 + br, -13.6 + br * .5, (x + 24) / 30) - Math.sin((x + 24) / 30 * Math.PI) * 1.6 : -12.6;
    for (let x = -40; x < 9; x += 4.2) { const y = lomo(x), hgt = 2.2 + (x > -26 ? 1 : 0); vol(c, q => { q.moveTo(x - 1.8, y + .8); q.quadraticCurveTo(x, y - hgt * 1.4, x + 1.8, y + .8); q.closePath(); }, P.escudo, [x - 1.8, y - hgt, x + 1.8, y + .8], { lw: .45, bd: .4 }); }
    // ojo, dientes de arriba y la piedra del lomo con la joya (núcleo)
    c.fillStyle = C('#fff8e8'); for (let x = 18; x < 33; x += 3) { c.beginPath(); c.moveTo(x, -3.6); c.lineTo(x + .75, -1.8); c.lineTo(x + 1.5, -3.6); c.fill(); }
    if (stun) { c.strokeStyle = C(P.ojo); c.lineWidth = .5; c.beginPath(); for (let k = 0; k < 10; k++) { const an = k * .8 + t * 8, rr = k * .16; c.lineTo(18.6 + Math.cos(an) * rr, -13.2 + Math.sin(an) * rr); } c.stroke(); }
    else { const [mx, my] = mira(o, f, 18.6, -13.2, o.face); ojo(c, 18.6, -13.2, 1.9, 1.5, { iris: P.ojo, rendija: true, ir: .9, mx, my, abre: parpadeo(t, 4) ? 0 : 1, lw: .45 }); }
    vol(c, q => piedra(q, -2, -14.6, 5.4, 3.4, 61), mz(P.escudo, '#6a6a5a', .5), [-7.4, -18, 3.4, -11.2], { lw: .6, tex: q => { q.fillStyle = ra(P.piel, .8); q.beginPath(); q.ellipse(-4.6, -16.6, 2.2, 1, 0, 0, TAU); q.fill(); } });
    gema(c, o, f, -2, -15.4, 2.1, 'rombo');
    pataC(-15, -s, false); pataC(7, s, false);
    if (stun) estrellas(c, 17, -21, t, 7);
    c.restore();
  };

  // =====================================================================
  //  LORENCILLO, EL PIRATA FANTASMA
  // =====================================================================
  X.BODY.pirata = (c, o, f) => {
    const P = colores(o, { madera: '#5e4636', oscura: '#221812', fantasma: '#9affd8', vela: '#e0e8dc', metal: '#6a7470', oro: '#d8b050' }, .24);
    const t = f.t, stun = o.stunT > 0; BL = blanco(o, t); LN = sh(P.oscura, -.4);
    const lean = stun ? Math.sin(t * 5) * .12 : Math.sin(t * 1.3) * .05, bob = Math.sin(t * 1.6) * 1.2, dispara = o.st === 'ataque' && o.atk === 'canones';
    if (listoForgeJefe('pirata') && o.st !== 'muere') {
      let cuadro = Math.floor(t * 4) % 2;
      if (o.st === 'ventana' || o.st === 'entra') cuadro = 0;
      if (o.st === 'ataque' && o.atk === 'canones' && o.at > .2) cuadro = 2;
      if (o.st === 'ataque' && o.atk === 'ancla') cuadro = 3;
      c.save(); c.translate(o.x, o.y + bob); c.scale(o.face || 1, 1); c.rotate(lean);
      if (stun) c.rotate(Math.sin(t * 5) * .06);
      if (BL) c.globalAlpha = .72;
      dibujaForgeJefe(c, 'pirata', cuadro, 0, -15, 86, 76);
      if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 27, -15, 12, P.fantasma, .35 + Math.sin(t * 6) * .1); c.restore(); }
      if (stun) estrellas(c, -20, -30, t, 8);
      c.restore(); return;
    }
    c.save(); c.translate(o.x, o.y + bob); c.scale(o.face, 1); c.rotate(lean); comun(c, o);
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -12, 50, P.fantasma, .15); c.restore(); }
    // niebla que lo sostiene, en remolino
    if (!BL) for (let k = 0; k < 8; k++) { const a = t * .8 + k * .8, x = -28 + k * 8 + Math.sin(a) * 3, y = 14 + Math.sin(t * 2 + k * 1.7) * 1.6; c.fillStyle = ra(P.fantasma, .16 + (k % 2) * .06); c.beginPath(); c.ellipse(x, y, 9 + Math.sin(a) * 1.5, 3.6, 0, 0, TAU); c.fill(); }
    // jarcia (cuerdas)
    c.strokeStyle = BL ? '#fff' : ra(P.oscura, .65); c.lineWidth = .35; c.beginPath(); for (const [x, y] of [[-28, -9], [-18, -7], [14, -7], [26, -10]]) { c.moveTo(-2, -50); c.lineTo(x, y); } c.stroke();
    // mástil, cofa y vergas
    vol(c, q => q.rect(-3.2, -52, 2.4, 54), P.madera, [-3.2, -52, -.8, 2], { lw: .5, bd: .5 });
    vol(c, q => { q.moveTo(-6, -41); q.lineTo(2, -41); q.lineTo(1, -37); q.lineTo(-5, -37); q.closePath(); }, P.madera, [-6, -41, 2, -37], { lw: .5 });
    for (const [y, a, b] of [[-44, -16, 12], [-20, -14, 10]]) vol(c, q => q.rect(a, y - .6, b - a, 1.3), sh(P.madera, -.1), [a, y - .6, b, y + .7], { lw: .4, borde: false });
    // la bandera ondeando
    const fl = q => { q.moveTo(-2, -51); for (let k = 0; k <= 6; k++) q.lineTo(-2 + k * 1.8, -51 + Math.sin(t * 6 - k * .8) * .9 * k / 6); for (let k = 6; k >= 0; k--) q.lineTo(-2 + k * 1.8, -46.6 + Math.sin(t * 6 - k * .8) * .9 * k / 6); q.closePath(); };
    vol(c, fl, '#1c1820', [-2, -52, 9, -45], { lw: .4, luz: .2, borde: false }); if (!BL) { c.fillStyle = '#f0ece0'; c.beginPath(); c.arc(4, -48.8, .9, 0, TAU); c.fill(); }
    // la vela rota, con agujeros y una calavera
    const ola = Math.sin(t * 2.4) * 2;
    const vela = q => { q.moveTo(-15, -43); q.quadraticCurveTo(-2 + ola, -36, 11, -43); q.lineTo(10, -30); q.lineTo(7, -24); q.lineTo(4, -28); q.lineTo(0, -21); q.lineTo(-4, -26); q.lineTo(-9, -21); q.lineTo(-13, -26); q.closePath(); for (const [x, y, r] of [[-9, -32, 1.6], [5.5, -36, 1.2], [6, -29, .9]]) { q.moveTo(x + r, y); q.arc(x, y, r, 0, TAU); } };
    c.beginPath(); vela(c); c.fillStyle = BL ? '#ffffff' : ra(P.vela, .88); c.fill('evenodd');
    if (!BL) { c.save(); c.beginPath(); vela(c); c.clip('evenodd'); const g = c.createLinearGradient(-15, 0, 11, 0); g.addColorStop(0, 'rgba(40,60,50,.3)'); g.addColorStop(.35, 'rgba(255,255,255,.15)'); g.addColorStop(.6, 'rgba(40,60,50,.22)'); g.addColorStop(1, 'rgba(255,255,255,.1)'); c.fillStyle = g; c.fillRect(-16, -44, 28, 24); c.strokeStyle = 'rgba(40,60,50,.25)'; c.lineWidth = .4; for (const x of [-9, -3, 3]) { c.beginPath(); c.moveTo(x, -41); c.quadraticCurveTo(x + ola * .3, -32, x - 1, -24); c.stroke(); } c.restore(); }
    c.strokeStyle = LN; c.lineWidth = .55; c.beginPath(); vela(c); c.stroke();
    if (!BL) { const sx = -1 + ola * .3, sy = -34; c.fillStyle = '#1c1820'; c.beginPath(); c.arc(sx, sy - .6, 2.6, 0, TAU); c.fill(); c.fillRect(sx - 1.6, sy + 1, 3.2, 1.6); c.fillStyle = ra(P.vela, .95); for (const d of [-1, 1]) { c.beginPath(); c.arc(sx + d * 1, sy - .8, .65, 0, TAU); c.fill(); } c.strokeStyle = '#1c1820'; c.lineWidth = .7; c.beginPath(); c.moveTo(sx - 4, sy + 1); c.lineTo(sx + 4, sy + 4.6); c.moveTo(sx + 4, sy + 1); c.lineTo(sx - 4, sy + 4.6); c.stroke(); }
    // el casco: tablones, cinta, troneras con cañones, ventanitas que brillan y grietas con luz fantasma
    const casco = q => { q.moveTo(-30, -8); q.lineTo(-24, -12.5); q.lineTo(-20, -6); q.lineTo(22, -6); q.lineTo(30, -12); q.quadraticCurveTo(26, 4, 18, 11); q.lineTo(-20, 11); q.quadraticCurveTo(-28, 4, -30, -8); q.closePath(); };
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = ra(P.fantasma, .35); c.lineWidth = 2.4; c.beginPath(); casco(c); c.stroke(); c.restore(); }
    vol(c, casco, P.madera, [-30, -12.5, 30, 11], { lw: 1, tex: q => {
      q.strokeStyle = ra(P.oscura, .7); q.lineWidth = .45; for (const y of [-2, 3, 7]) { q.beginPath(); q.moveTo(-28, y); q.quadraticCurveTo(0, y + 1.4, 28, y - 1); q.stroke(); }
      for (let r = 0; r < 4; r++) for (let x = -26 + (r % 2) * 5; x < 26; x += 10) { const y = -5 + r * 4.6; q.beginPath(); q.moveTo(x, y); q.lineTo(x, y + 3.2); q.stroke(); }
      q.fillStyle = ra(P.oscura, .85); q.beginPath(); q.moveTo(-28, -4.6); q.quadraticCurveTo(0, -3.2, 29, -5.6); q.lineTo(29, -3.8); q.quadraticCurveTo(0, -1.4, -28, -2.8); q.closePath(); q.fill();
      motas(q, [-30, -12, 30, 11], 18, ra(P.oscura, .3), 41, .3, .8);
      q.save(); q.globalCompositeOperation = 'lighter'; q.fillStyle = ra(P.fantasma, .55); for (const [x0, x1, h] of [[-14, -6, 5], [6, 13, 7]]) { q.beginPath(); q.moveTo(x0, 11); q.lineTo((x0 + x1) / 2 - 1, 11 - h); q.lineTo((x0 + x1) / 2 + .5, 11 - h * .5); q.lineTo(x1, 11); q.closePath(); q.fill(); } q.restore();
    } });
    for (const x of [-12, -2, 8]) { c.fillStyle = C('#140e0c'); c.fillRect(x - 2, .4, 4, 3.2); const sale = dispara ? Math.max(0, Math.sin(o.at * 10 + x)) * 1.6 : 0; vol(c, q => q.rect(x - 1.2 + 3 - 3, 1.2, 2.4 + 0, 1.6), P.metal, [x - 1.2, 1.2, x + 1.2, 2.8], { lw: .3, borde: false }); if (!BL) { c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(x, 2 + sale * .1, .6, 0, TAU); c.fill(); } }
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; for (const x of [-25.5, -22]) glowDot(c, x, -7.6, 3.4, P.fantasma, .7 + Math.sin(t * 5 + x) * .2); c.restore(); c.fillStyle = ra(P.fantasma, .95); for (const x of [-25.5, -22]) c.fillRect(x - .8, -8.6, 1.6, 2); }
    // algas y cadenas que cuelgan y gotean luz
    if (!BL) for (let k = 0; k < 4; k++) { const x = -16 + k * 10, L = 5 + hs(k, 5) * 6, sw = Math.sin(t * 2 + k) * 1.5; c.strokeStyle = ra(P.fantasma, .45); c.lineWidth = .6; c.beginPath(); c.moveTo(x, 10.5); c.quadraticCurveTo(x + sw, 10.5 + L * .5, x - sw * .5, 10.5 + L); c.stroke(); const u = (t * .7 + k * .3) % 1; c.fillStyle = ra(P.fantasma, .8 * (1 - u)); c.beginPath(); c.arc(x - sw * .5, 10.5 + L + u * 8, .6, 0, TAU); c.fill(); }
    // el capitán fantasma, en la popa
    c.save(); c.translate(-20, -12 + Math.sin(t * 2.2) * .6);
    const fantasma = q => { q.moveTo(-5, 6); q.quadraticCurveTo(-7.2, -6, 0, -9); q.quadraticCurveTo(7.2, -6, 5, 6); q.quadraticCurveTo(3.4, 3.4, 2, 6.4); q.quadraticCurveTo(0, 3.6, -1.6, 6.4); q.quadraticCurveTo(-3.2, 3.4, -5, 6); q.closePath(); };
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -2, 12, P.fantasma, .4); c.restore(); }
    c.beginPath(); fantasma(c); if (BL) c.fillStyle = '#fff'; else { const g = c.createLinearGradient(0, -9, 0, 7); g.addColorStop(0, ra(P.fantasma, .95)); g.addColorStop(1, ra(P.fantasma, .2)); c.fillStyle = g; } c.fill();
    c.strokeStyle = ra(sh(P.fantasma, -.5), .7); c.lineWidth = .4; c.stroke();
    if (dispara) tubo(c, u => L2([3, -1], [9, -4 - Math.sin(o.at * 6) * 1.5], u), u => 1.6 - u * .5, ra(P.fantasma, .9), 3, { lw: .3, brillo: false });
    vol(c, q => { q.moveTo(-8.4, -8.6); q.quadraticCurveTo(0, -12.2, 8.4, -8.6); q.lineTo(5.4, -14.4); q.quadraticCurveTo(0, -12.4, -5.4, -14.4); q.closePath(); }, '#1c1820', [-8.4, -14.4, 8.4, -8.6], { lw: .4, luz: .25 });
    c.strokeStyle = C(P.oro); c.lineWidth = .45; c.beginPath(); c.moveTo(-8, -8.9); c.quadraticCurveTo(0, -12, 8, -8.9); c.stroke();
    gema(c, { pal: { core: P.oro }, st: '' }, f, 0, -11.6, .9, 'circulo');
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 2.4, -5.5, 3.4, P.fantasma, .9); c.restore(); }
    c.fillStyle = stun ? '#ffffff' : C('#eafff6'); c.beginPath(); c.arc(2.4, -5.5, 1.1, 0, TAU); c.fill();
    c.fillStyle = C('#1c1820'); c.fillRect(-3.8, -6.5, 3.6, 1.6); c.strokeStyle = C('#1c1820'); c.lineWidth = .3; c.beginPath(); c.moveTo(-3.8, -6); c.lineTo(-6, -8); c.stroke();
    c.fillStyle = BL ? '#fff' : ra(sh(P.fantasma, -.45), .7); c.beginPath(); c.moveTo(-2.6, -2.4); c.quadraticCurveTo(1, 5, 4.4, -2.4); c.quadraticCurveTo(1, 0, -2.6, -2.4); c.fill();
    c.restore();
    // el farol de la proa (núcleo)
    c.strokeStyle = C(P.oscura); c.lineWidth = 1; c.beginPath(); c.moveTo(24, -9); c.lineTo(28, -21); c.stroke();
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 27, -15, 13, P.core, .38 + Math.sin(t * 6) * .1); c.restore(); }
    gema(c, o, f, 27, -15.3, 2.4, 'circulo');
    c.strokeStyle = C(P.metal); c.lineWidth = .55; c.beginPath(); c.moveTo(24.4, -19); c.lineTo(29.6, -19); c.lineTo(29.2, -11.4); c.lineTo(24.8, -11.4); c.closePath(); c.moveTo(27, -19); c.lineTo(27, -11.4); c.stroke();
    vol(c, q => { q.moveTo(24, -19); q.lineTo(27, -21.6); q.lineTo(30, -19); q.closePath(); }, P.metal, [24, -21.6, 30, -19], { lw: .4 });
    if (stun) estrellas(c, -20, -33, t, 9);
    c.restore();
  };

  // =====================================================================
  //  CHAAC, SEÑOR DE LA LLUVIA
  // =====================================================================
  X.BODY.chaac = (c, o, f) => {
    const P = colores(o, { nube: '#d6dde8', nube2: '#66768e', mascara: '#4aa2b2', oscura: '#163840', jade: '#3ac08a', oro: '#f2c94c', pluma: '#2fb08a', hueso: '#f6efe2' }, .24);
    const t = f.t, stun = o.stunT > 0, tormenta = o.st === 'ataque'; BL = blanco(o, t); LN = sh(P.oscura, -.5);
    if (listoForgeJefe('chaac') && o.st !== 'muere' && o.st !== 'ventana') {
      let cuadro = Math.floor(t * 4) % 2;
      if (tormenta && o.atk === 'rayos' && o.at > .2) cuadro = 2;
      if (tormenta && o.atk === 'aguacero') cuadro = 3;
      if (tormenta && (o.atk === 'ventarron' || o.cineInhala)) cuadro = 1;
      c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .12);
      if (BL) c.globalAlpha = .72;
      dibujaForgeJefe(c, 'chaac', cuadro, 0, 0, 68, 66);
      c.restore(); return;
    }
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .12); comun(c, o);
    // la nube: sombra abajo, luz arriba, bocanadas que respiran
    const puffs = [[-30, 4, 13], [-18, -6, 15], [0, -12, 17], [18, -6, 15], [30, 4, 13], [-12, 10, 14], [12, 10, 14]];
    c.fillStyle = C(P.nube2); for (const [x, y, r] of puffs) { c.beginPath(); c.arc(x, y + 4.5, r + .6 + Math.sin(t * 2 + x) * .6, 0, TAU); c.fill(); }
    for (const [x, y, r0] of puffs) { const r = r0 * .93 + Math.sin(t * 2 + x) * .6; c.beginPath(); c.arc(x, y, r, 0, TAU); if (BL) c.fillStyle = '#fff'; else { const g = c.createRadialGradient(x - r * .3, y - r * .45, r * .1, x, y + r * .2, r * 1.05); g.addColorStop(0, sh(P.nube, .5)); g.addColorStop(.55, P.nube); g.addColorStop(1, mz(P.nube, P.nube2, .55)); c.fillStyle = g; } c.fill(); }
    if (tormenta && !BL && Math.sin(t * 9) > .2) { const lx = Math.sin(t * 13) * 18; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, lx, 4, 20, '#fff6c0', .45); c.strokeStyle = 'rgba(255,250,210,.85)'; c.lineWidth = .8; c.beginPath(); c.moveTo(lx - 4, -4); c.lineTo(lx + 1, 2); c.lineTo(lx - 2, 4); c.lineTo(lx + 3, 11); c.stroke(); c.restore(); }
    // el penacho de plumas detrás de la máscara
    for (let k = 0; k < 7; k++) pluma(c, (k - 3) * 3.4, -17, -Math.PI / 2 + (k - 3) * .3 + Math.sin(t * 3 + k) * .05, 14 - Math.abs(k - 3) * 1.6, 2.3, k % 2 ? P.pluma : P.jade, P.oro);
    // orejeras de jade con su colgante
    for (const d of [-1, 1]) {
      tubo(c, u => [d * 15 + d * u * 1.2, -.5 + u * 8], () => 1.4, P.jade, 4, { lw: .5 });
      vol(c, q => q.arc(d * 15, -4, 4.6, 0, TAU), P.jade, [d * 15 - 4.6, -8.6, d * 15 + 4.6, .6], { lw: .7, tex: q => { q.strokeStyle = ra(sh(P.jade, .4), .7); q.lineWidth = .5; q.beginPath(); q.arc(d * 15, -4, 3, 0, TAU); q.stroke(); } });
      c.fillStyle = C(P.oscura); c.beginPath(); c.arc(d * 15, -4, 1.3, 0, TAU); c.fill();
      vol(c, q => q.arc(d * 16.2, 8.6, 1.5, 0, TAU), P.oro, [d * 16.2 - 1.5, 7.1, d * 16.2 + 1.5, 10.1], { lw: .4 });
    }
    // la máscara tallada
    const mascara = q => { q.moveTo(-11, -14); q.lineTo(11, -14); q.lineTo(12, 4); q.quadraticCurveTo(0, 8, -12, 4); q.closePath(); };
    vol(c, mascara, P.mascara, [-12, -14, 12, 8], { lw: 1, tex: q => {
      motas(q, [-12, -14, 12, 8], 20, ra(P.oscura, .25), 71, .3, .8);
      q.strokeStyle = ra(P.oscura, .65); q.lineWidth = .6; q.beginPath(); q.moveTo(-11, -9.4); q.lineTo(11, -9.4); q.stroke();
      for (const d of [-1, 1]) { q.beginPath(); for (let k = 0; k < 12; k++) { const an = k * .6 * d, rr = 2.4 - k * .18; q.lineTo(d * 9 + Math.cos(an) * rr, 3 + Math.sin(an) * rr); } q.stroke(); }
    } });
    // ojos de espiral en marco
    for (const d of [-1, 1]) {
      vol(c, q => roundRect(q, d * 5.4 - 4.6, -9, 9.2, 8.6, 2.4), P.oscura, [d * 5.4 - 4.6, -9, d * 5.4 + 4.6, -.4], { lw: .5, luz: .2 });
      c.fillStyle = C(P.hueso); c.beginPath(); c.arc(d * 5.4, -4.7, 3.5, 0, TAU); c.fill();
      c.strokeStyle = stun ? '#ffd84a' : C(P.oscura); c.lineWidth = .8; c.beginPath(); for (let k = 0; k < 14; k++) { const an = k * .7 * d + (stun ? t * 6 : t * .6), r = k * .2; c.lineTo(d * 5.4 + Math.cos(an) * r, -4.7 + Math.sin(an) * r); } c.stroke();
    }
    // la nariz larga y enroscada, con anillos
    const sw = Math.sin(t * 2) * 1.5 + (tormenta ? Math.sin(t * 7) : 0);
    const nariz = u => { const a = [0, -3], b = [1, 6], cc = [3 + sw, 14], d2 = [9 + sw, 13], e2 = [13 + sw, 12], g2 = [12 + sw, 6], h2 = [8 + sw, 7]; if (u < .6) { const v = u / .6; return bez(a, b, cc, d2, v); } const v = (u - .6) / .4; return bez(d2, e2, g2, h2, v); };
    const pts = tubo(c, nariz, u => 4.6 - u * 1.8, P.mascara, 16);
    if (!BL) { c.strokeStyle = ra(P.oscura, .55); c.lineWidth = .4; for (let k = 2; k < 14; k += 2) { const [x, y] = pts[k], [x2, y2] = pts[k + 1], a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, w = (4.6 - k / 16 * 1.8) / 2; c.beginPath(); c.moveTo(x + Math.cos(a) * w, y + Math.sin(a) * w); c.lineTo(x - Math.cos(a) * w, y - Math.sin(a) * w); c.stroke(); } }
    // boca y colmillos
    c.fillStyle = C('#2a0e14'); c.beginPath(); c.ellipse(-3.6, 4.6, 3.4, 1.4, 0, 0, TAU); c.fill();
    for (const d of [-1, 1]) vol(c, q => { q.moveTo(d * 7, 3.6); q.quadraticCurveTo(d * 9.4, 9, d * 5, 10.4); q.lineTo(d * 5.2, 5); q.closePath(); }, P.hueso, [Math.min(d * 9.4, d * 5), 3.6, Math.max(d * 9.4, d * 5), 10.4], { lw: .45 });
    // el hacha de rayo
    c.save(); c.translate(-30, 2); c.rotate(-.5 + (tormenta ? Math.sin(t * 8) * .25 : Math.sin(t * 1.5) * .05));
    tubo(c, u => [0, 6 - u * 20], () => 1.5, sh(P.oscura, .2), 3, { lw: .5 });
    const rayo = q => { q.moveTo(0, -14); q.lineTo(7, -18.5); q.lineTo(4, -12.2); q.lineTo(9.4, -11); q.lineTo(1, -3.6); q.lineTo(3, -10); q.closePath(); };
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 4, -11, 10, '#fff2a0', tormenta ? .6 : .3); c.restore(); }
    vol(c, rayo, '#ffe36a', [0, -18.5, 9.4, -3.6], { lw: .5, luz: .5 });
    c.restore();
    // diadema y el jade (núcleo)
    vol(c, q => q.rect(-12, -17, 24, 3.2), P.oro, [-12, -17, 12, -13.8], { lw: .5 });
    for (let k = -10; k <= 10; k += 5) vol(c, q => { q.moveTo(k - 2, -17); q.lineTo(k, -22); q.lineTo(k + 2, -17); q.closePath(); }, k % 2 ? P.jade : P.oro, [k - 2, -22, k + 2, -17], { lw: .4 });
    gema(c, o, f, 0, -13, 2.6, 'circulo');
    // la lluvia que cuelga de la nube
    if (!BL) { c.strokeStyle = ra(P.nube, .6); c.lineWidth = .6; for (let k = 0; k < 10; k++) { const x = -30 + k * 6.6, y0 = 21 + ((t * 40 + k * 7) % 12); c.beginPath(); c.moveTo(x, y0); c.lineTo(x - 1, y0 + 4); c.stroke(); } }
    if (stun) estrellas(c, 0, -30, t, 12);
    c.restore();
  };
  // punto de una curva de Bézier cúbica
  function bez(a, b, c2, d, u) { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c2[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c2[1] + u * u * u * d[1]]; }

  // =====================================================================
  //  CAMAZOTZ, EL MURCIÉLAGO DE LA CUEVA
  // =====================================================================
  X.BODY.camazotz = (c, o, f) => {
    const P = colores(o, { pelo: '#4e3852', oscura: '#1a1022', membrana: '#62284e', oreja: '#c8708e', obsidiana: '#1a1824', jade: '#3ac08a', hueso: '#2c1a30' }, .24);
    const t = f.t, stun = o.stunT > 0, quieto = o.st === 'ventana', picada = o.st === 'ataque' && o.atk === 'picada' && o.at > .8 && o.at < 2.1, chilla = o.st === 'ataque' && o.atk === 'chillido' && o.at > .4;
    BL = blanco(o, t); LN = sh(P.oscura, -.4);
    if ((listoForgeJefe('camazotz') || X.CAMAZOTZ_HD_READY()) && o.st !== 'muere') {
      let cuadro = Math.floor(t * 8) % 3;
      if (picada) cuadro = 3;
      else if (o.cineChilla || chilla || o.st === 'ataque' && o.atk === 'oscuridad') cuadro = 1;
      else if (o.cineAlasCerradas) cuadro = 0;
      else if (o.cineColgado) cuadro = 2;
      else if (quieto) cuadro = 0;
      c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .2);
      if (BL) c.globalAlpha = .72;
      dibujaForgeJefe(c, 'camazotz', cuadro, 0, 0, 76, 70);
      if (o.cineChilla) { c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -8, 3 + Math.sin(t * 36) * .6, '#ff5a4a', .55); }
      c.restore(); return;
    }
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .25); comun(c, o);
    const fl = quieto ? .15 : picada ? -.4 : Math.sin(t * 9) * .6;
    // las alas: membrana a contraluz con venas, dedos de hueso y navajas de obsidiana
    for (const d of [-1, 1]) {
      c.save(); c.scale(d, 1); c.rotate(-fl * .5); const span = quieto ? 20 : 44;
      const W = [span * .45, -14 - fl * 10], T1 = [span, -8 - fl * 16], E1 = [span * .8, 8 - fl * 4], E2 = [span * .55, 12 - fl * 2], E3 = [span * .3, 14];
      const mem = q => { q.moveTo(4, -6); q.lineTo(W[0], W[1]); q.lineTo(T1[0], T1[1]); q.quadraticCurveTo(span * .9, 2, E1[0], E1[1]); q.quadraticCurveTo(span * .62, 3, E2[0], E2[1]); q.quadraticCurveTo(span * .38, 6, E3[0], E3[1]); q.quadraticCurveTo(span * .18, 8, 5, 10); q.closePath(); };
      c.beginPath(); mem(c); if (BL) c.fillStyle = '#fff'; else { const g = c.createLinearGradient(4, 0, span, 0); g.addColorStop(0, sh(P.membrana, -.35)); g.addColorStop(.55, P.membrana); g.addColorStop(1, mz(P.membrana, '#d0507a', .35)); c.fillStyle = g; } c.fill();
      if (!BL) { c.save(); c.beginPath(); mem(c); c.clip(); c.strokeStyle = 'rgba(255,120,150,.28)'; c.lineWidth = .35; for (let k = 0; k < 9; k++) { const a = hs(k, 2), b = hs(2, k); c.beginPath(); c.moveTo(W[0] + (E1[0] - W[0]) * a, W[1] + (E1[1] - W[1]) * a); c.quadraticCurveTo(span * (.3 + b * .4), 4, W[0] + (E3[0] - W[0]) * b, W[1] + (E3[1] - W[1]) * b); c.stroke(); } c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 4, span + 6, 12); c.restore(); }
      c.strokeStyle = LN; c.lineWidth = .6; c.beginPath(); mem(c); c.stroke();
      tubo(c, u => L2([4, -6], W, u), u => 2.3 - u * .6, P.hueso, 3, { lw: .5 });
      for (const E of [T1, E1, E2, E3]) tubo(c, u => L2(W, E, u), u => 1.3 - u * .8, P.hueso, 3, { lw: .4, brillo: false });
      vol(c, q => { q.moveTo(W[0], W[1]); q.quadraticCurveTo(W[0] - 1, W[1] - 3.6, W[0] - 3, W[1] - 3.2); q.quadraticCurveTo(W[0] - 1.6, W[1] - 1.6, W[0] - .6, W[1] + .6); q.closePath(); }, P.obsidiana, [W[0] - 3, W[1] - 3.6, W[0], W[1] + .6], { lw: .3, luz: .6 });
      vol(c, q => { q.moveTo(T1[0] - 1, T1[1] + 1); q.lineTo(T1[0] + 5, T1[1] - 3.4); q.lineTo(T1[0] + .6, T1[1] + 3); q.closePath(); }, P.obsidiana, [T1[0] - 1, T1[1] - 3.4, T1[0] + 5, T1[1] + 3], { lw: .3, luz: .7 });
      if (!BL) { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .3; c.beginPath(); c.moveTo(T1[0], T1[1] + .6); c.lineTo(T1[0] + 4, T1[1] - 2.6); c.stroke(); }
      c.restore();
    }
    // el cuerpo peludo y las patas
    for (const d of [-1, 1]) tubo(c, u => u < .6 ? L2([d * 3, 11], [d * 4, 16.6], u / .6) : L2([d * 4, 16.6], [d * 5.6, 18.2], (u - .6) / .4), u => 1.6 - u * .6, P.hueso, 4, { lw: .4 });
    vol(c, q => q.ellipse(0, 2, 8, 11, 0, 0, TAU), P.pelo, [-8, -9, 8, 13], { lw: .8, tex: q => {
      q.fillStyle = ra(sh(P.pelo, .25), .55); q.beginPath(); q.ellipse(0, 4, 4.6, 7, 0, 0, TAU); q.fill();
      q.strokeStyle = ra(P.oscura, .45); q.lineWidth = .35; for (let k = 0; k < 22; k++) { const x = -6 + hs(k, 9) * 12, y = -7 + hs(9, k) * 18; q.beginPath(); q.moveTo(x, y); q.lineTo(x + (hs(k, 1) - .5) * 1.4, y + 1.8); q.stroke(); }
    } });
    if (!BL) { c.strokeStyle = ra(P.pelo, .9); c.lineWidth = .45; for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, x = Math.cos(a) * 8, y = 2 + Math.sin(a) * 11; c.beginPath(); c.moveTo(x, y); c.lineTo(x * 1.12, y + Math.sin(a) * 1.2 + .4); c.stroke(); } }
    // la cabeza: orejas largas, nariz de hoja, ojos rojos y colmillos
    for (const d of [-1, 1]) vol(c, q => { q.moveTo(d * 3, -15); q.quadraticCurveTo(d * 9.6, -22, d * 9, -28); q.quadraticCurveTo(d * 9.4, -18, d * 7, -12.6); q.closePath(); }, P.pelo, [Math.min(d * 3, d * 9.6), -28, Math.max(d * 3, d * 9.6), -12.6], { lw: .6, tex: q => { q.fillStyle = ra(P.oreja, .75); q.beginPath(); q.moveTo(d * 4.4, -15); q.quadraticCurveTo(d * 8.4, -21, d * 8.4, -25); q.quadraticCurveTo(d * 8, -17.6, d * 6.4, -14); q.closePath(); q.fill(); q.strokeStyle = ra(P.oscura, .4); q.lineWidth = .3; for (const y of [-17, -19.5, -22]) { q.beginPath(); q.moveTo(d * 6, y); q.lineTo(d * 8, y - 1); q.stroke(); } } });
    vol(c, q => q.arc(0, -11, 6.6, 0, TAU), P.pelo, [-6.6, -17.6, 6.6, -4.4], { lw: .7, tex: q => { q.strokeStyle = ra(P.oscura, .4); q.lineWidth = .3; for (let k = 0; k < 10; k++) { const x = -4 + hs(k, 4) * 8, y = -16 + hs(4, k) * 5; q.beginPath(); q.moveTo(x, y); q.lineTo(x, y + 1.4); q.stroke(); } } });
    vol(c, q => { q.moveTo(0, -16.4); q.quadraticCurveTo(3.4, -12, 0, -7.6); q.quadraticCurveTo(-3.4, -12, 0, -16.4); q.closePath(); }, sh(P.pelo, -.28), [-3.4, -16.4, 3.4, -7.6], { lw: .5, tex: q => { q.strokeStyle = ra(P.oreja, .5); q.lineWidth = .35; q.beginPath(); q.moveTo(0, -15.6); q.lineTo(0, -8.4); q.stroke(); } });
    if (chilla && !BL) { c.fillStyle = '#2a0812'; c.beginPath(); c.ellipse(0, -5.6, 2.8, 2 + Math.sin(t * 30) * .4, 0, 0, TAU); c.fill(); }
    if (!BL) { c.save(); c.globalCompositeOperation = 'lighter'; for (const d of [-1, 1]) glowDot(c, d * 3.2, -12, 4.6, '#ff3a3a', stun ? .2 : .6); c.restore(); }
    for (const d of [-1, 1]) { c.fillStyle = stun ? '#ffffff' : C('#ff4a4a'); c.beginPath(); c.ellipse(d * 3.2, -12, 1.5, 1.1, d * .3, 0, TAU); c.fill(); if (!BL && !stun) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(d * 3.2 - .4, -12.4, .35, 0, TAU); c.fill(); } }
    c.fillStyle = C('#fffaf0'); for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 1.4, -7.2); c.lineTo(d * 2.1, chilla ? -3.6 : -4.4); c.lineTo(d * 2.8, -7.2); c.fill(); }
    // el collar de jade y el núcleo
    for (let k = -3; k <= 3; k++) { const x = k * 2.2, y = -3 - Math.abs(k) * .3; vol(c, q => q.arc(x, y, 1.05, 0, TAU), P.jade, [x - 1, y - 1, x + 1, y + 1], { lw: .3, borde: false, luz: .5 }); }
    gema(c, o, f, 0, 4, 2.6, 'rombo');
    if (stun) estrellas(c, 0, -31, t, 11);
    c.restore();
  };

  // =====================================================================
  //  XUNÁN KAB, LA ABEJA REINA
  // =====================================================================
  X.BODY.abeja = (c, o, f) => {
    const P = colores(o, { oro: '#f2b01a', ambar: '#c8780e', oscura: '#2a1a0a', ala: '#e2f4ff', pelo: '#ffd77a', polen: '#ffe04a', miel: '#e8960f', barro: '#a8683a' }, .22);
    const t = f.t, stun = o.stunT > 0, cansada = o.st === 'ventana' || !!o.cineDormida; BL = blanco(o, t); LN = sh(P.oscura, -.3);
    if (listoForgeJefe('abeja')) {
      const cuadro = o.cineDormida ? 3 : o.cineDespierta ? 1 : o.atk === 'aguijon' ? 2 : o.st === 'ventana' || stun ? 3 : o.st === 'ataque' ? Math.floor(t * 12) % 2 : Math.floor(t * 12) % 2;
      c.save(); c.translate(o.x, o.y + (o.cineDormida ? 3 : o.cineDespierta ? Math.sin(t * 32) * 1.2 : 0)); c.scale(o.face || 1, 1); if (stun) c.rotate(Math.sin(t * 6) * .2); comun(c, o);
      c.imageSmoothingEnabled = !(f.st && f.st.pixel); if (BL) c.filter = 'brightness(3)'; if (o.cineDespierta && Math.sin(t * 40) > 0) c.filter = 'brightness(1.8)';
      dibujaForgeJefe(c, 'abeja', cuadro, 0, o.cineDormida ? 2 : 0, 70, 66); c.restore(); return;
    }
    c.save(); c.translate(o.x, o.y); c.scale(o.face, 1); if (stun) c.rotate(Math.sin(t * 6) * .3); comun(c, o);
    const clavada = o.st === 'ataque' && o.atk === 'aguijon' && o.at > .9 && o.at < 2.1; if (clavada) c.rotate(.5);
    // alas que zumban, con estela
    const wv = cansada ? Math.sin(t * 6) * .2 : Math.sin(t * 60) * .5;
    const unaAla = (dx, r, s, al) => { c.save(); c.globalAlpha *= al; c.translate(dx, -10); c.rotate(r); const path = q => q.ellipse(-12 * s, 0, 13 * s, 5 * s, 0, 0, TAU); c.beginPath(); path(c); if (BL) c.fillStyle = '#fff'; else { const g = c.createLinearGradient(-24 * s, -4, 0, 4); g.addColorStop(0, 'rgba(190,225,255,.7)'); g.addColorStop(.5, ra(P.ala, .8)); g.addColorStop(1, 'rgba(255,215,240,.75)'); c.fillStyle = g; } c.fill(); c.strokeStyle = ra(P.oscura, .5); c.lineWidth = .45; c.stroke(); if (!BL) { c.strokeStyle = ra(P.oscura, .4); c.lineWidth = .3; c.beginPath(); c.moveTo(0, 0); c.lineTo(-22 * s, -.5); c.moveTo(-6 * s, 0); c.lineTo(-13 * s, -3.4 * s); c.moveTo(-10 * s, -.2); c.lineTo(-17 * s, 3 * s); c.moveTo(-14 * s, -.3); c.lineTo(-20 * s, -2.6 * s); c.stroke(); } c.restore(); };
    if (!cansada && !BL) unaAla(-2, -.5 - wv, .8, .2);
    unaAla(-2, -.5 + wv, .8, .9);
    // el abdomen: rayas que siguen la panza, pelusa, brillo y el aguijón
    c.save(); c.translate(-10, 4 + Math.sin(t * 3) * .4); c.rotate(.35 + (cansada ? Math.sin(t * 2) * .05 : 0));
    vol(c, q => { q.moveTo(-18, -2); q.lineTo(-25 - (clavada ? 6 : 0), .6); q.lineTo(-18, 2.6); q.closePath(); }, P.oscura, [-31, -2, -18, 2.6], { lw: .4, luz: .5 });
    vol(c, q => q.ellipse(-6, 0, 13, 9, 0, 0, TAU), P.oro, [-19, -9, 7, 9], { lw: .9, tex: q => {
      q.fillStyle = P.oscura; for (const x of [-14.5, -7.5, -.5]) { q.beginPath(); q.ellipse(x, 0, 2.3, 10, 0, 0, TAU); q.fill(); }
      q.fillStyle = ra(P.ambar, .5); q.beginPath(); q.ellipse(-6, 5, 12, 4, 0, 0, TAU); q.fill();
      q.fillStyle = 'rgba(255,255,255,.4)'; q.beginPath(); q.ellipse(-5, -5, 7, 1.8, -.1, 0, TAU); q.fill();
    } });
    if (!BL) { c.strokeStyle = ra(P.pelo, .8); c.lineWidth = .35; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = -6 + Math.cos(a) * 13, y = Math.sin(a) * 9; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 1.3, y + Math.sin(a) * 1.3); c.stroke(); } }
    c.restore();
    if (!cansada && !BL) unaAla(-4, -.95 - wv, 1.05, .22);
    unaAla(-4, -.95 + wv, 1.05, .85);
    // patas, con canastas de polen, y el tarro de miel que gotea
    for (const [x, y, k] of [[-3, 5, 0], [1, 6, 1], [5, 4, 2]]) { const sw = Math.sin(t * 4 + k) * .6; tubo(c, u => u < .5 ? L2([x, 2.6], [x + 1 + sw, y + 4], u * 2) : L2([x + 1 + sw, y + 4], [x + 3 + sw, y + 5.2], (u - .5) * 2), () => 1, P.oscura, 4, { lw: .3, brillo: false }); if (k === 0 && !BL) { c.fillStyle = P.polen; c.beginPath(); c.arc(x + 1.4 + sw, y + 3.6, 1.4, 0, TAU); c.fill(); } }
    vol(c, q => { q.moveTo(6.6, 6); q.lineTo(12.4, 6); q.quadraticCurveTo(14, 9.6, 12, 13); q.lineTo(7, 13); q.quadraticCurveTo(5, 9.6, 6.6, 6); q.closePath(); }, P.barro, [5, 6, 14, 13], { lw: .5, tex: q => { q.fillStyle = P.miel; q.beginPath(); q.ellipse(9.5, 6.6, 3.2, 1.2, 0, 0, TAU); q.fill(); q.strokeStyle = ra(P.oscura, .4); q.lineWidth = .3; q.beginPath(); q.moveTo(5.6, 9.5); q.lineTo(13.4, 9.5); q.stroke(); } });
    if (!BL) { const u = (t * .6) % 1, L = 1 + u * 6; c.fillStyle = P.miel; c.beginPath(); c.moveTo(12, 7); c.quadraticCurveTo(13.4, 7 + L * .5, 12.8, 7 + L); c.arc(12.8, 7 + L, .7 * (1 - u * .3), 0, Math.PI); c.quadraticCurveTo(12.2, 8, 11.6, 7); c.fill(); }
    // el tórax peludo
    vol(c, q => q.arc(0, -2, 7.6, 0, TAU), sh(P.oro, -.12), [-7.6, -9.6, 7.6, 5.6], { lw: .8, tex: q => { q.fillStyle = ra(P.oscura, .3); q.beginPath(); q.ellipse(-1, 1, 5, 3.6, 0, 0, TAU); q.fill(); } });
    if (!BL) { c.strokeStyle = ra(P.pelo, .9); c.lineWidth = .45; for (let k = 0; k < 18; k++) { const an = k / 18 * TAU + Math.sin(t * 2 + k) * .05; c.beginPath(); c.moveTo(Math.cos(an) * 6.4, -2 + Math.sin(an) * 6.4); c.lineTo(Math.cos(an) * 8.8, -2 + Math.sin(an) * 8.8); c.stroke(); } }
    // la cabeza: ojos compuestos con facetas, mandíbulas y antenas
    vol(c, q => q.arc(7, -10, 6, 0, TAU), P.oro, [1, -16, 13, -4], { lw: .8 });
    vol(c, q => q.ellipse(9.6, -10.6, 2.8, 3.8, .2, 0, TAU), '#1a120a', [6.8, -14.4, 12.4, -6.8], { lw: .45, luz: .45, tex: q => { q.strokeStyle = 'rgba(160,140,255,.35)'; q.lineWidth = .25; for (let y = -14; y < -7; y += 1.1) for (let x = 7 + ((y * 10) % 2 ? .55 : 0); x < 12.4; x += 1.1) { q.beginPath(); q.arc(x, y, .55, 0, TAU); q.stroke(); } } });
    if (!BL && !stun) { c.fillStyle = 'rgba(255,255,255,.7)'; for (const [x, y, r] of [[8.8, -12.4, .7], [10.4, -11.2, .4]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
    if (stun) { c.strokeStyle = '#fff3a0'; c.lineWidth = .5; c.beginPath(); for (let k = 0; k < 10; k++) { const an = k * .8 + t * 8, rr = k * .18; c.lineTo(9.6 + Math.cos(an) * rr, -10.6 + Math.sin(an) * rr); } c.stroke(); }
    const mord = Math.sin(t * 7) * .15; c.fillStyle = C(sh(P.ambar, -.4)); for (const s of [-1, 1]) { c.save(); c.translate(11.6, -6.6); c.rotate(s * (.3 + mord)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(2, s * .4, 2.4, s * 1.4); c.lineTo(.4, s * .8); c.closePath(); c.fill(); c.restore(); }
    const an = Math.sin(t * 3) * .1;
    tubo(c, u => bez([7, -15], [8, -19], [10 + an * 10, -22], [13, -22 + an * 6], u), () => .7, P.oscura, 6, { lw: .2, brillo: false });
    tubo(c, u => bez([5, -15], [5, -19], [5.6, -22], [8, -23 - an * 6], u), () => .7, P.oscura, 6, { lw: .2, brillo: false });
    for (const [x, y] of [[13, -22 + an * 6], [8, -23 - an * 6]]) vol(c, q => q.arc(x, y, 1.05, 0, TAU), P.oscura, [x - 1, y - 1, x + 1, y + 1], { lw: 0, luz: .5, borde: false });
    // la corona de panal con la celda real (núcleo)
    for (const [x, y] of [[0, -17], [8, -17], [2, -21.5], [6, -22.5]]) vol(c, q => { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; q.lineTo(x + Math.cos(a) * 2.3, y + Math.sin(a) * 2.3); } q.closePath(); }, '#f2c94c', [x - 2.3, y - 2.3, x + 2.3, y + 2.3], { lw: .4, luz: .4, tex: q => { q.fillStyle = ra(P.miel, .6); q.beginPath(); q.arc(x, y + .4, 1.2, 0, TAU); q.fill(); } });
    gema(c, o, f, 4, -19.5, 2.2, 'hex');
    if (stun) estrellas(c, 6, -30, t, 10);
    c.restore();
  };
})();
