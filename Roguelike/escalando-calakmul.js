'use strict';
// =====================================================================
//  ESCALANDO CALAKMUL · el interior de la pirámide (rework visual)
//  Antes se subía por el exterior, entre hojas y raíces en foto macro. Ahora se sube por dentro de
//  la Estructura II: muros de piedra, luz de antorchas y relieves mayas (láminas de ChatGPT recortadas
//  con tools/escalando-calakmul.py → Roguelike/assets/escalando):
//    · fondo.webp   · la cámara del interior, que se recorre despacio al subir;
//    · muro.webp    · la piedra que rellena lo macizo;
//    · piso.webp    · el borde de piedra que corona cada plataforma.
//  Las antorchas de los muros se dibujan por código (ménsula, llama que titila y su luz) porque las de
//  la lámina vienen sobre bruma. Nada cambia las colisiones, el mapa, las burbujas, los picos ni los bichos.
// =====================================================================
(function () {
  const def = typeof NIVELES !== 'undefined' && NIVELES.subida_miniatura;
  if (!def) return;
  const RUTA = '../Roguelike/assets/escalando/', IM = {};
  for (const n of ['fondo', 'muro', 'piso']) { const im = IM[n] = new Image(); im.decoding = 'async'; im.src = RUTA + n + '.webp'; }
  const listo = () => Object.values(IM).every(im => im.complete && im.naturalWidth);
  const R = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  let patron = null;
  def.sinOver = true;                                   // sin las briznas de foto macro ni la viñeta verde del estilo
  def.relleno = ctx => { if (!listo()) return '#2a2118'; if (!patron) { patron = ctx.createPattern(IM.muro, 'repeat'); if (patron && patron.setTransform) patron.setTransform(new DOMMatrix().scale(.62)); } return patron || '#2a2118'; };
  def.rellenoSombra = 'rgba(10,6,2,.38)';
  def.tinte = () => {};
  def.terrenoListo = listo;
  // el borde de piedra de cada plataforma y la sombra que deja debajo
  def.terreno = (x) => {
    if (!listo()) return;
    const p = IM.piso, escala = 9 / p.naturalHeight, ancho = p.naturalWidth * escala;
    for (const t of L.tops) {
      let a = t.x0 - .6; const b = t.x1 + .6;
      while (a < b) { const sx = ((a % ancho) + ancho) % ancho, w = Math.min(b - a, ancho - sx); x.drawImage(p, sx / escala, 0, w / escala, p.naturalHeight, a, t.y - 1.4, w, 9); a += w; }
      const gl = x.createLinearGradient(0, t.y - 1, 0, t.y + 9); gl.addColorStop(0, 'rgba(255,214,150,.34)'); gl.addColorStop(.25, 'rgba(255,214,150,0)'); gl.addColorStop(1, 'rgba(0,0,0,.4)');
      x.fillStyle = gl; x.fillRect(t.x0 - .6, t.y - 1.4, t.x1 - t.x0 + 1.2, 10.4);
      const sg = x.createLinearGradient(0, t.y + 8, 0, t.y + 26); sg.addColorStop(0, 'rgba(0,0,0,.5)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sg; x.fillRect(t.x0, t.y + 8, t.x1 - t.x0, 18);
    }
    for (const b of L.bottoms) {                          // la sombra que cae bajo los salientes
      const g = x.createLinearGradient(0, b.y, 0, b.y + 14); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(b.x0, b.y, b.x1 - b.x0, 14);
    }
  };
  // antorchas pegadas a los muros del pozo: cada tantas filas, alternando de lado
  function antorchas(j, c0, c1, r0, r1) {
    const out = [];
    for (let r = Math.max(4, r0 - r0 % 9); r <= r1; r += 9) {
      const lado = (r / 9) % 2 ? -1 : 1;
      let c = lado < 0 ? j.W - 1 : 0; while (c >= 0 && c < j.W && j.at(c, r) === '#') c += lado;      // la cara libre del muro
      if (c < 0 || c >= j.W || c < c0 - 1 || c > c1 + 1) continue;
      if ([-1, 0, 1].some(d => j.at(c, r + d) === '#' || j.at(c + lado, r + d) === '#')) continue;
      out.push({ x: (lado > 0 ? c : c + 1) * T + lado * -1, y: r * T + 6, lado, r });
    }
    return out;
  }
  function antorcha(ctx, q, t) {
    const fl = .75 + .25 * Math.sin(t * 9 + q.r) * Math.sin(t * 5.3 + q.r * 2), x = q.x, y = q.y;
    ctx.save(); ctx.translate(x, y); ctx.scale(q.lado * 1.5, 1.5);
    ctx.fillStyle = '#4a3320'; ctx.fillRect(-1, 0, 5.5, 2.6); ctx.fillStyle = '#6a4a2c'; ctx.beginPath(); ctx.moveTo(2, 1); ctx.lineTo(8, -.4); ctx.lineTo(7, 5); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(8.4, -1, 3.6, 1.6, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(8.4, -3, 0, 8.4, -3, 54 * fl); gr.addColorStop(0, 'rgba(255,170,70,.34)'); gr.addColorStop(.35, 'rgba(255,120,40,.14)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = gr; ctx.fillRect(-50, -60, 120, 120);
    for (const [k, col, w, h] of [[0, 'rgba(255,120,30,.85)', 3.4, 9], [1, 'rgba(255,190,70,.9)', 2.4, 7], [2, 'rgba(255,245,200,.95)', 1.2, 4]]) {
      const sw = Math.sin(t * (11 + k * 3) + q.r) * (1.1 - k * .3);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(8.4 - w, -1.4); ctx.quadraticCurveTo(8.4 - w * .6 + sw, -h * .7 * fl - 1.4, 8.4 + sw * 1.4, -h * fl - 3.4); ctx.quadraticCurveTo(8.4 + w * .6 + sw, -h * .7 * fl - 1.4, 8.4 + w, -1.4); ctx.quadraticCurveTo(8.4, .6, 8.4 - w, -1.4); ctx.fill();
    }
    ctx.restore();
  }
  def.antorchas = antorchas;
  const pintaAntes = def.pinta;
  def.pinta = function (ctx, j, f, capa) {
    if (capa === 'atras' && listo()) {
      const im = IM.fondo, Hv = (typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.H : VH), w = VW * 1.1, h = im.naturalHeight * w / im.naturalWidth;
      const u = clamp(j.cam.y / Math.max(1, j.H * T - Hv), 0, 1), px = clamp(j.cam.x / Math.max(1, j.W * T - VW), 0, 1);
      ctx.drawImage(im, j.cam.x - (w - VW) * px, j.cam.y - u * Math.max(0, h - Hv), w, h);
    }
    if (capa === 'medio') {
      for (const q of antorchas(j, Math.floor(j.cam.x / T), Math.ceil((j.cam.x + VW) / T), Math.floor(j.cam.y / T) - 2, Math.ceil((j.cam.y + 330) / T) + 2)) antorcha(ctx, q, j.t);
    }
    if (capa === 'frente') {
      const Hv = (typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.H : VH), x0 = j.cam.x, y0 = j.cam.y;   // viñeta cálida: el borde de la vista se pierde en la oscuridad
      const g = ctx.createRadialGradient(x0 + VW / 2, y0 + Hv * .5, Hv * .35, x0 + VW / 2, y0 + Hv * .5, VW * .62); g.addColorStop(0, 'rgba(10,5,0,0)'); g.addColorStop(1, 'rgba(10,5,0,.5)');
      ctx.fillStyle = g; ctx.fillRect(x0, y0, VW, Hv);
    }
    if (pintaAntes) return pintaAntes.apply(this, arguments);
  };
})();
