'use strict';
// =====================================================================
//  EL CUERPO DE LA RUPTURA, dibujado en código (antes era la hoja
//  arte/ruptura.png estirada, y de cerca se veía borrosa).
//  Sigue la hoja del jefe final de David (art/referencia/assets/
//  fases_jefe_final.png), forma por forma:
//    0 Sombra            tentáculos de bloques oscuros con orilla magenta
//    1 Mural del códice  tablillas de piedra naranja con grecas turquesa
//    2 Gólem dimensional arco de bloques azules con cristales encima
//    3 Núcleo expuesto   tentáculos de galaxia alrededor del núcleo
//  RUPTURA.dibuja(c, forma, t, o) dibuja en unidades del mundo, con el
//  núcleo en (0, 0) y unas 100 de ancho; el núcleo que late lo pone
//  quien la usa (el jefe y las cinemáticas).
// =====================================================================
const RUPTURA = (() => {
  const TAU = Math.PI * 2;
  const MAG = '#ff4fd8';

  // un bloque de piedra: cara, luz arriba, sombra abajo y orilla de color
  function bloque(c, x, y, s, rot, col, orilla, oa = .7) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const a = -s / 2;
    c.fillStyle = col[0]; c.beginPath(); roundRect(c, a, a, s, s, s * .2); c.fill();
    c.fillStyle = col[1]; c.fillRect(a + s * .14, a + s * .1, s * .72, s * .17);
    c.fillStyle = col[2]; c.fillRect(a + s * .1, -a - s * .24, s * .8, s * .14);
    if (orilla) { c.strokeStyle = orilla; c.globalAlpha *= oa; c.lineWidth = Math.max(.35, s * .09); c.beginPath(); roundRect(c, a, a, s, s, s * .2); c.stroke(); }
    c.restore();
  }
  // greca: la espiral cuadrada de los glifos
  function greca(c, x, y, s, col, lw = s * .1) {
    c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'square'; c.lineJoin = 'miter';
    // arriba, derecha, abajo del largo completo; luego cada tramo más corto, hacia adentro
    const p = s * .24, dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]]; let px = -s / 2, py = s / 2; c.beginPath(); c.moveTo(px, py);
    for (let i = 0; i < 9; i++) { const L = i < 3 ? s : s - (i - 2) * p; if (L < p * .5) break; const [dx, dy] = dirs[i % 4]; px += dx * L; py += dy * L; c.lineTo(px, py); }
    c.stroke(); c.restore();
  }
  // el camino de un tentáculo: sale del anillo, ondula y enrosca la punta
  function camino(ang, R0, L, g, t, fase, ondas, enrosca) {
    const n = Math.max(6, Math.ceil(L / (g * .62))), ds = L / n, pts = [];
    let x = Math.cos(ang) * R0, y = Math.sin(ang) * R0;
    for (let i = 0; i <= n; i++) {
      const u = i / n, dir = ang + .62 * Math.sin(u * ondas * TAU + fase - t * 1.5) * (.25 + u * .75) + enrosca * u * u * u * 1.6;
      pts.push([x, y, u, dir]); x += Math.cos(dir) * ds; y += Math.sin(dir) * ds;
    }
    return pts;
  }
  // el mismo tentáculo, pero estirándose hasta (tx, ty): curva suave con su ondulación; k = cuánto ya se estiró
  function alcance(ang, R0, tx, ty, k, g, t, fase) {
    const x0 = Math.cos(ang) * R0, y0 = Math.sin(ang) * R0, dx = tx - x0, dy = ty - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    // sale primero hacia afuera (en la dirección de su raíz) y luego se curva hacia el blanco
    const c1 = [x0 + Math.cos(ang) * L * .35 + nx * L * .12, y0 + Math.sin(ang) * L * .35 + ny * L * .12];
    const n = Math.max(8, Math.ceil(L * k / (g * .5))), pts = [], amp = Math.min(7, L * .05);
    let px = x0, py = y0;
    for (let i = 0; i <= n; i++) {
      const u = i / n * k, a = 1 - u, bx = a * a * x0 + 2 * a * u * c1[0] + u * u * tx, by = a * a * y0 + 2 * a * u * c1[1] + u * u * ty, w = Math.sin(u * 3 * TAU - t * 6 + fase) * amp * Math.sin(u * Math.PI);
      const x = bx + nx * w, y = by + ny * w, dir = i ? Math.atan2(y - py, x - px) : ang;
      pts.push([x, y, i / n * .9, dir]); px = x; py = y;
    }
    return pts;
  }
  // de los tentáculos de su cuerpo, cuáles se estiran a agarrar: el más cercano a cada blanco
  function asigna(angs, alcances) {
    const usados = new Map();
    for (const q of alcances || []) { if (!(q.k > .001)) continue; const a = Math.atan2(q.y, q.x); let mejor = -1, md = 1e9; angs.forEach((b, i) => { if (usados.has(i)) return; const d = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); if (d < md) { md = d; mejor = i; } }); if (mejor >= 0) usados.set(mejor, q); }
    return usados;
  }
  function brillo(c, pts, ancho, col, a) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba(col, a); c.lineWidth = ancho;
    c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.restore();
  }
  // el tubo del tentáculo (se adelgaza hacia la punta), para que sea macizo entre bloque y bloque
  function tubo(c, pts, g, col, fin = .45) {
    c.save(); c.lineCap = 'round'; c.strokeStyle = col;
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; c.lineWidth = g * (1 - b[2] * (1 - fin)) * .9; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.restore();
  }
  // escombros flotando
  function escombros(c, t, n, r0, r1, sem, cols, orilla) {
    for (let i = 0; i < n; i++) {
      const an = hash1(i, sem) * TAU + t * (.05 + hash1(i, sem + 1) * .08), r = r0 + hash1(i, sem + 2) * (r1 - r0), s = 2.2 + hash1(i, sem + 3) * 3.4;
      bloque(c, Math.cos(an) * r, Math.sin(an) * r * .9 + Math.sin(t * 1.3 + i) * 1.2, s, t * .4 + i, cols, orilla, .55);
    }
  }
  // anillo de bloques alrededor del núcleo
  function anillo(c, t, n, r, s, cols, orilla, gl) {
    for (let i = 0; i < n; i++) { const an = i / n * TAU + t * .08; bloque(c, Math.cos(an) * r, Math.sin(an) * r, s, an, cols, orilla, .5); if (gl && i % 3 === 0) greca(c, Math.cos(an) * r, Math.sin(an) * r, s * .55, gl, s * .07); }
  }
  function aroNucleo(c, r, a = .85) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(MAG, a); c.lineWidth = .8; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.strokeStyle = rgba('#ffd0f6', a * .6); c.lineWidth = .35; c.beginPath(); c.arc(0, 0, r - 1.6, 0, TAU); c.stroke(); c.restore(); }

  // ---------------- 0 · Sombra ----------------
  const SOMBRA = ['#1c1030', '#3a2658', '#0c0618'];
  const humoImagen=new Image(); humoImagen.src='../Roguelike/assets/jefes/ruptura-tentaculos-humo.png';
  let humoLimpio;
  function prepararHumo(){
    if(!humoImagen.complete||!humoImagen.naturalWidth)return null;
    if(!humoLimpio){humoLimpio=document.createElement('canvas');humoLimpio.width=630;humoLimpio.height=623;
      const x=humoLimpio.getContext('2d',{willReadFrequently:true});x.drawImage(humoImagen,0,0,630,623);
      try { const im=x.getImageData(0,0,630,623);for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]<160?0:255;x.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }}
    return humoLimpio;
  }
  function dibujarHumo(c,t,img){
    const n=8,paso=TAU/n;
    for(let i=0;i<n;i++){const a=-Math.PI/2+i*paso,d=Math.sin(t*1.6+i*1.3)*1.5;
      c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);c.beginPath();c.moveTo(0,0);c.arc(0,0,78,a-paso/2,a+paso/2);c.closePath();c.clip();c.drawImage(img,-57,-56,114,112);c.restore();}
  }
  function sombra(c, t, o = {}) {
    const imagen=prepararHumo(); if(imagen) dibujarHumo(c,t,imagen);
    // La forma final es una grieta viva: humo violeta, no bloques rígidos.
    const tent = [], angs = Array.from({ length: 9 }, (_, k) => k / 9 * TAU + (hash1(k, 3) - .5) * .18 - Math.PI / 2), agarra = asigna(angs, o.alcances);
    for (let k = 0; k < angs.length; k++) {
      const ang = angs[k], L = 37 + hash1(k, 4) * 10, g = 9.5, q = agarra.get(k);
      if (imagen && !q) continue;
      const pts = q ? alcance(ang, 12, q.x, q.y, q.k, g, t, k * 1.9) : camino(ang, 12, L, g, t, k * 1.9, .8 + hash1(k, 5) * .4, (k % 2 ? 1 : -1) * (.55 + hash1(k, 6) * .4));
      tent.push([pts, g, k]);
    }
    for (const [pts, g] of tent) { brillo(c, pts, g * 2.2, '#a43dd1', .10); brillo(c, pts, g * 1.35, '#6c278c', .22); }
    for (const [pts, g, k] of tent) {
      tubo(c, pts, g * 1.15, '#160b28', .16);
      tubo(c, pts, g * .78, '#321044', .10);
      brillo(c, pts, g * .22, k % 2 ? '#a343c2' : '#7f37ae', .48);
      // Hilos de humo recorren cada tentáculo y se separan hacia la punta.
      for (const lado of [-1, 1]) {
        const hilo = pts.map(([x,y,u,dir],i) => {
          const d = lado * (1.2 + Math.sin(t * 2.5 - u * 7 + k + lado) * 1.2) * (1-u*.35);
          return [x - Math.sin(dir) * d, y + Math.cos(dir) * d, u, dir];
        });
        brillo(c, hilo, .75, lado > 0 ? '#d87aea' : '#6d2b98', .4);
      }
    }
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 22, '#ca48d8', .3 + .08 * Math.sin(t * 3)); c.restore();
    c.fillStyle = '#1a0929'; c.beginPath(); c.arc(0,0,10,0,TAU); c.fill();
    aroNucleo(c, 9, 1);
  }

  // ---------------- 3 · Núcleo expuesto: tentáculos de galaxia ----------------
  const NOCHE = ['#1d0b33', '#3a1a5e', '#0a0416'];
  function galaxia(c, t, pts, g, sem) {
    const p = new Path2D();
    for (const [x, y, u, dir] of pts) { const s = g * (1 - u * .5); const cs = Math.cos(dir), sn = Math.sin(dir), h = s / 2; p.moveTo(x + (-h * cs + h * sn), y + (-h * sn - h * cs)); p.lineTo(x + (h * cs + h * sn), y + (h * sn - h * cs)); p.lineTo(x + (h * cs - h * sn), y + (h * sn + h * cs)); p.lineTo(x + (-h * cs - h * sn), y + (-h * sn + h * cs)); p.closePath(); }
    c.fillStyle = NOCHE[0]; c.fill(p);
    c.save(); c.clip(p);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const q = pts[Math.floor((i + .5) / 4 * pts.length)]; glowDot(c, q[0], q[1], g * 1.5, i % 2 ? '#3a5aff' : MAG, .28); }
    c.fillStyle = '#ffffff'; for (let i = 0; i < 16; i++) { const q = pts[Math.floor(hash1(i, sem) * pts.length)], r = .25 + hash1(i, sem + 1) * .45; c.globalAlpha = .5 + .5 * Math.sin(t * 4 + i * 1.7); c.fillRect(q[0] + (hash1(i, sem + 2) - .5) * g * .8, q[1] + (hash1(i, sem + 3) - .5) * g * .8, r, r); }
    c.restore();
    c.strokeStyle = rgba(MAG, .75); c.lineWidth = .7; c.stroke(p);
  }
  const nucleoImagen = new Image();
  nucleoImagen.src = '../Roguelike/assets/jefes/ruptura-nucleo-expuesto.png';
  let nucleoLimpio;
  function prepararNucleo() {
    if (!nucleoImagen.complete || !nucleoImagen.naturalWidth) return null;
    if (!nucleoLimpio) {
      nucleoLimpio = document.createElement('canvas'); nucleoLimpio.width = 612; nucleoLimpio.height = 643;
      const cx = nucleoLimpio.getContext('2d', {willReadFrequently:true});
      cx.drawImage(nucleoImagen, 0, 0, 612, 643);
      try { const im = cx.getImageData(0, 0, 612, 643);
      for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] < 210 ? 0 : 255;
      cx.putImageData(im, 0, 0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    return nucleoLimpio;
  }
  function nucleoNuevo(c, t, imagen) {
    const x = -56, y = -55, w = 112, h = 117.7;
    // Anillo y grieta respiran por separado, con el centro en el punto de impacto.
    c.save(); c.rotate(Math.sin(t * .7) * .025);
    c.beginPath(); c.rect(-80,-80,160,160); c.arc(0,0,28,0,TAU,true); c.clip('evenodd');
    c.drawImage(imagen,x,y,w,h); c.restore();
    c.save(); c.beginPath(); c.arc(0,0,28.3,0,TAU); c.clip();
    const pulso = 1 + Math.sin(t*2.6)*.012; c.scale(pulso,pulso); c.drawImage(imagen,x,y,w,h); c.restore();
  }
  function nucleo(c, t, o = {}) {
    const imagen = prepararNucleo(); if (imagen) { nucleoNuevo(c, t, imagen); return; }
    escombros(c, t, 12, 42, 58, 21, NOCHE, MAG);
    const tent = [], angs = Array.from({ length: 10 }, (_, k) => k / 10 * TAU + (hash1(k, 13) - .5) * .25 - Math.PI / 2), agarra = asigna(angs, o.alcances);
    for (let k = 0; k < 10; k++) {
      const ang = angs[k], L = 32 + hash1(k, 14) * 12, g = 11, q = agarra.get(k);
      tent.push([q ? alcance(ang, 16, q.x, q.y, q.k, g, t * 1.15, k * 2.3) : camino(ang, 16, L, g, t * 1.15, k * 2.3, .85 + hash1(k, 15) * .35, (k % 2 ? 1 : -1) * (.45 + hash1(k, 16) * .4)), g, k]);
    }
    for (const [pts, g] of tent) brillo(c, pts, g * 1.6, MAG, .14);
    for (const [pts, g, k] of tent) galaxia(c, t, pts, g, 30 + k * 7);
    anillo(c, t, 16, 20, 6, ['#2a0e2e', '#5a1e4a', '#12040e'], '#ff6a8a');
    anillo(c, -t, 11, 13.5, 6.4, NOCHE, MAG);
    aroNucleo(c, 10, 1);
  }

  // ---------------- 1 · Mural del códice ----------------
  const PIEDRA = ['#c4581f', '#ec8a3e', '#7a2c10'], OSCURA = ['#7a2c10', '#a8461c', '#3a140a'], TURQ = ['#1f5a5c', '#3a8f8a', '#0e2e30'], LINEA = '#3a160a';
  function tablilla(c, x, y, w, h, col, glifo, t, i) {
    const f = Math.sin(t * 1.3 + i) * .7; c.save(); c.translate(x, y + f);
    c.fillStyle = col[0]; c.beginPath(); roundRect(c, -w / 2, -h / 2, w, h, 1.4); c.fill();
    c.fillStyle = col[1]; c.fillRect(-w / 2 + 1, -h / 2 + .8, w - 2, 1.3); c.fillStyle = col[2]; c.fillRect(-w / 2 + .8, h / 2 - 1.6, w - 1.6, 1);
    c.strokeStyle = LINEA; c.lineWidth = .6; c.beginPath(); roundRect(c, -w / 2, -h / 2, w, h, 1.4); c.stroke();
    if (glifo) { const s = Math.min(w, h) * .62; greca(c, 0, 0, s, glifo, s * .13); }
    c.restore();
  }
  const muralImagen = new Image();
  muralImagen.src = '../Roguelike/assets/jefes/ruptura-mural.png';
  // Cada sector se desplaza por separado, conservando libre el centro del núcleo.
  function muralNuevo(c, t) {
    const n = 10, paso = TAU / n;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * paso;
      const desplazamiento = Math.sin(t * 1.4 + i * 1.17) * 1.6;
      c.save();
      c.translate(Math.cos(a) * desplazamiento, Math.sin(a) * desplazamiento);
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 80, a - paso / 2, a + paso / 2); c.closePath(); c.clip();
      c.drawImage(muralImagen, -56, -55, 112, 110);
      c.restore();
    }
    aroNucleo(c, 9, .95);
  }
  function codice(c, t) {
    if (muralImagen.complete && muralImagen.naturalWidth) { muralNuevo(c, t); return; }
    // chispas de piedra que flotan
    for (let i = 0; i < 18; i++) { const x = (hash1(i, 41) - .5) * 92, y = 14 + hash1(i, 42) * 38 + Math.sin(t * 1.4 + i) * 1.5, w = 1.6 + hash1(i, 43) * 2.4, h = 2.4 + hash1(i, 44) * 3.6; c.save(); c.translate(x, y); c.rotate((hash1(i, 45) - .5) * .6); c.fillStyle = i % 3 ? PIEDRA[0] : OSCURA[0]; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = LINEA; c.lineWidth = .4; c.strokeRect(-w / 2, -h / 2, w, h); c.restore(); }
    // rocas de las esquinas
    for (const s of [-1, 1]) { c.save(); c.translate(s * 38, -30 + Math.sin(t * 1.1 + s) * 1); c.fillStyle = OSCURA[0]; c.beginPath(); c.moveTo(-7, -3); c.lineTo(-2, -7); c.lineTo(6, -5); c.lineTo(7, 3); c.lineTo(1, 6); c.lineTo(-6, 4); c.closePath(); c.fill(); c.strokeStyle = LINEA; c.lineWidth = .6; c.stroke(); c.fillStyle = PIEDRA[1]; c.beginPath(); c.moveTo(-5, -3); c.lineTo(-1, -6); c.lineTo(4, -4); c.lineTo(-1, -2); c.fill(); c.strokeStyle = 'rgba(40,10,4,.6)'; c.beginPath(); c.moveTo(-1, -2); c.lineTo(2, 3); c.stroke(); c.restore(); }
    // brazos de tablillas a los lados
    for (const s of [-1, 1]) {
      tablilla(c, s * 22, 0, 9, 10, TURQ, '#7af0e0', t, 1 + s);
      tablilla(c, s * 32.5, -7, 10, 10, PIEDRA, TURQ[0], t, 3 + s); tablilla(c, s * 32.5, 6, 10, 10, PIEDRA, TURQ[0], t, 5 + s);
      tablilla(c, s * 45, -2, 10, 30, OSCURA, null, t, 7 + s); greca(c, s * 45, -9 + Math.sin(t * 1.3 + 7 + s) * .7, 6, '#3a8f8a', .8); greca(c, s * 45, 5 + Math.sin(t * 1.3 + 7 + s) * .7, 6, '#3a8f8a', .8);
      tablilla(c, s * 26, -22, 7, 7, PIEDRA, null, t, 9 + s); tablilla(c, s * 26, 21, 7, 9, TURQ, '#7af0e0', t, 11 + s);
    }
    // columna de arriba con el glifo cuadrado, y la de abajo como cerradura
    tablilla(c, 0, -22, 8, 9, PIEDRA, null, t, 20);
    { const f = Math.sin(t * 1.3 + 21) * .7; tablilla(c, 0, -35, 12, 12, OSCURA, null, t, 21); c.strokeStyle = TURQ[1]; c.lineWidth = .9; c.strokeRect(-3.6, -35 + f - 3.6, 7.2, 7.2); c.strokeRect(-1.6, -35 + f - 1.6, 3.2, 3.2); }
    tablilla(c, 0, 22, 8, 14, OSCURA, null, t, 22); c.fillStyle = '#2a0e08'; c.fillRect(-1.4, 17, 2.8, 10);
    tablilla(c, 0, 35, 11, 11, PIEDRA, TURQ[0], t, 23);
    // el disco tallado alrededor del núcleo
    // (el borde es de bloques escalonados, como la hoja)
    for (let i = 0; i < 20; i++) { const an = i / 20 * TAU; bloque(c, Math.cos(an) * 19.5, Math.sin(an) * 19.5, 5.4, an, i % 5 === 0 ? TURQ : OSCURA, LINEA, .9); }
    c.fillStyle = PIEDRA[0]; c.beginPath(); c.arc(0, 0, 17.5, 0, TAU); c.fill(); c.strokeStyle = LINEA; c.lineWidth = .8; c.stroke();
    c.fillStyle = PIEDRA[1]; c.beginPath(); c.arc(0, 0, 17.5, Math.PI * 1.1, Math.PI * 1.65); c.arc(0, 0, 15.6, Math.PI * 1.65, Math.PI * 1.1, true); c.fill();
    c.fillStyle = OSCURA[0]; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = LINEA; c.lineWidth = .6; for (let i = 0; i < 16; i++) { const an = i / 16 * TAU; c.beginPath(); c.moveTo(Math.cos(an) * 13, Math.sin(an) * 13); c.lineTo(Math.cos(an) * 17.5, Math.sin(an) * 17.5); c.stroke(); }
    for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + TAU / 16; greca(c, Math.cos(an) * 15.2, Math.sin(an) * 15.2, 2.6, TURQ[0], .45); }
    for (let i = 0; i < 4; i++) { const an = i / 4 * TAU; c.fillStyle = TURQ[1]; c.fillRect(Math.cos(an) * 15.2 - 1.4, Math.sin(an) * 15.2 - 1.4, 2.8, 2.8); }
    c.fillStyle = '#26090c'; c.beginPath(); c.arc(0, 0, 9.5, 0, TAU); c.fill();
    // la luz del núcleo corre por las ranuras del mural
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(MAG, .35 + Math.sin(t * 3) * .12); c.lineWidth = .7; c.beginPath(); c.moveTo(-50, 0); c.lineTo(-17, 0); c.moveTo(17, 0); c.lineTo(50, 0); c.moveTo(0, -17); c.lineTo(0, -29); c.moveTo(0, 17); c.lineTo(0, 29); c.stroke(); c.restore();
    aroNucleo(c, 8);
  }

  // ---------------- 2 · Gólem dimensional ----------------
  const AZUL = ['#1e2470', '#3a48b8', '#0e1238'], CIAN = '#3ad8ff';
  function cristal(c, x, y, w, h, ang, t, i) {
    const f = 1 + .12 * Math.sin(t * 3.4 + i * 1.7); c.save(); c.translate(x, y); c.rotate(ang); c.scale(1, f);
    const g = c.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, 'rgba(58,110,255,.95)'); g.addColorStop(.6, 'rgba(150,110,255,.9)'); g.addColorStop(1, 'rgba(220,170,255,.85)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w * .42, -h * .62); c.lineTo(0, -h); c.lineTo(w * .42, -h * .62); c.lineTo(w / 2, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,220,255,.8)'; c.lineWidth = .45; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .5; c.beginPath(); c.moveTo(-w * .15, -h * .15); c.lineTo(-w * .1, -h * .7); c.stroke();
    c.restore();
  }
  const golemImagen = new Image();
  golemImagen.src = '../Roguelike/assets/jefes/ruptura-golem-dimensional.png';
  let golemLimpio;
  function prepararGolem() {
    if (!golemImagen.complete || !golemImagen.naturalWidth) return null;
    if (!golemLimpio) {
      golemLimpio = document.createElement('canvas');
      golemLimpio.width = 512; golemLimpio.height = 768;
      const cx = golemLimpio.getContext('2d', { willReadFrequently: true });
      cx.drawImage(golemImagen, 0, 0, 512, 768);
      try { const im = cx.getImageData(0, 0, 512, 768);
      for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] < 210 ? 0 : 255;
      cx.putImageData(im, 0, 0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    return golemLimpio;
  }
  function golemNuevo(c, t, img) {
    // El núcleo del sprite coincide con (0, 0), donde el combate detecta los golpes.
    const x = -36.7, y = -35, w = 73.4, h = 110;
    const pieza = (poligono, dx, dy, ang, px, py) => {
      c.save(); c.translate(dx, dy); c.translate(px, py); c.rotate(ang); c.translate(-px, -py);
      c.beginPath(); poligono.forEach(([a,b], i) => i ? c.lineTo(a,b) : c.moveTo(a,b)); c.closePath(); c.clip();
      c.drawImage(img, x, y, w, h); c.restore();
    };
    const ritmo = Math.sin(t * 1.6);
    pieza([[-40,-10],[-12,-10],[-12,34],[-40,34]], -ritmo*.6, ritmo*.45, ritmo*.075, -15, -7);
    pieza([[12,-10],[40,-10],[40,34],[12,34]], ritmo*.6, -ritmo*.45, -ritmo*.075, 15, -7);
    pieza([[-40,32],[40,32],[40,80],[-40,80]], 0, Math.sin(t*1.3)*.45, ritmo*.004, 0, 32);
    pieza([[-40,-40],[40,-40],[40,-10],[16,-10],[16,32],[-16,32],[-16,-10],[-40,-10]], 0, Math.sin(t*1.3)*.3, 0, 0, 0);
    aroNucleo(c, 8.5);
  }
  function golem(c, t) {
    const imagen = prepararGolem(); if (imagen) { golemNuevo(c, t, imagen); return; }
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -6, 62, '#3a6aff', .2); c.restore();
    // esquirlas de cristal que flotan
    for (let i = 0; i < 16; i++) { const an = hash1(i, 51) * TAU + t * .07, r = 48 + hash1(i, 52) * 14; cristal(c, Math.cos(an) * r, Math.sin(an) * r * .85 + 6, 2.4, 4 + hash1(i, 53) * 4, an + t * .3, t, i); }
    // cristales grandes encima del arco, como flamas azules y moradas
    for (let i = 0; i < 15; i++) { const u = i / 14, an = Math.PI * (1.0 + u), x = Math.cos(an) * 44, y = 6 + Math.sin(an) * 36, h = 14 + hash1(i, 61) * 10 + Math.sin(u * Math.PI) * 6; cristal(c, x, y, 6 + hash1(i, 62) * 3, h, an + Math.PI / 2 + (hash1(i, 63) - .5) * .35, t, i); }
    // los brazos: dos hileras de bloques que bajan por los lados y enroscan las garras hacia adentro
    for (const s of [-1, 1]) {
      const P = [[38, -6], [45, 6], [49, 20], [48, 34], [43, 46], [35, 55], [26, 60]];
      for (const [dx, dy, sz] of [[0, 0, 11], [-7, 3, 9]]) for (let i = 0; i < P.length; i++) { const [x, y] = P[i], sw = Math.sin(t * 1.6 + i * .6) * 1.1; bloque(c, s * (x + dx + sw), y + dy, sz - i * .55, i * .1 * s, AZUL, '#6a8aff', .8); if (dx === 0 && i % 2 === 0) greca(c, s * (x + sw), y, 4.6, CIAN, .5); }
      cristal(c, s * 22, 62, 4, 10, s * -2.2, t, 30 + s); cristal(c, s * 28, 64, 3.2, 8, s * -2.6, t, 32 + s);
    }
    // el arco de bloques de hombro a hombro, en tres hileras
    for (const [r, n, sz] of [[38, 15, 10], [30, 12, 9.5], [22, 9, 9]]) for (let i = 0; i <= n; i++) { const an = Math.PI * (1.02 + i / n * .96), x = Math.cos(an) * r * 1.1, y = 6 + Math.sin(an) * r; bloque(c, x, y, sz, an + Math.PI / 2, AZUL, '#6a8aff', .8); if ((i + r) % 4 === 1) greca(c, x, y, sz * .48, CIAN, .5); }
    // los hombros
    for (const s of [-1, 1]) for (const [x, y, sz] of [[36, -10, 12], [44, -2, 11], [30, -2, 10]]) { bloque(c, s * x, y, sz, s * .15, AZUL, '#6a8aff', .8); greca(c, s * x, y, sz * .45, CIAN, .5); }
    // el pecho y la quilla de abajo
    for (const [x, y, s] of [[-15, 4, 9], [15, 4, 9], [-9, 15, 9], [9, 15, 9], [0, 22, 9], [0, 30, 7.5], [0, 37, 6]]) bloque(c, x, y, s, 0, AZUL, '#6a8aff', .8);
    cristal(c, 0, 40, 4, 11, Math.PI, t, 40);
    greca(c, 0, 22, 4.2, CIAN, .5);
    anillo(c, t, 9, 12, 7, AZUL, '#8aa8ff');
    aroNucleo(c, 8.5);
  }

  const FORMAS = [sombra, codice, golem, nucleo];
  const NOMBRES = ['Sombra', 'Mural del códice', 'Gólem dimensional', 'Núcleo expuesto'];
  // o.alcances = [{ x, y, k }]: blancos (en sus unidades) a los que estira sus propios tentáculos (Sombra y Núcleo)
  function dibuja(c, forma, t, o) { (FORMAS[forma] || sombra)(c, t, o); }
  return { dibuja, NOMBRES, FORMAS, bloque, greca, anillo, escombros };
})();
