'use strict';
// =====================================================================
//  CINEMÁTICAS 3 · ENTRADAS DE JEFE (guion en GUION_CINEMATICAS.md)
//  Salen en el primer startBoss() del mundo, cuando se arma el PRÓLOGO del
//  jefe (jefes-fases.js): mientras se arma, el último cuadro se queda quieto;
//  la entrada pasa dentro del prólogo, en el arte del mundo, con el mismo
//  objeto-jefe del prólogo (BODY con la técnica de jefes-arte.js), y al
//  final todo regresa a su estado inicial y el prólogo arranca.
//  Cámara: se acerca la imagen del mundo; el jefe siempre se dibuja encima
//  (nítido en los estilos dibujados, con su pixel en los de pixel) y, en
//  los planos cerrados de estilos dibujados, también Itzel y Fresita, con el
//  fondo desenfocado. Cierre: cuadro congelado que se vuelve carta de lotería.
//  La primera vez sale completa; después, la versión corta.
// =====================================================================
(() => {
  const U = window.CINE_UTIL;
  const ORDEN = ['mythos', 'golem', 'serpiente', 'jaguar', 'hadas', 'cocodrilo', 'pirata', 'chaac', 'camazotz', 'abeja', 'ruptura'];
  const CARTA = Object.fromEntries(Object.entries(CAMPECHE.JEFES).map(([k, j]) => [k, j.carta])), NOMBRE_MENU = Object.fromEntries(Object.entries(CAMPECHE.JEFES).map(([k, j]) => [k, j.menu]));
  const FLOOR = JEFES_EXT.FLOOR;
  const ENTRADAS = {};
  const CUADRO_ESTILO = { barro: 1 / 12 }; // mundos que en la cinemática van a menos cuadros (como sus enemigos en el juego)
  const ruido = (t, s) => noise1(t, s) - .5;

  // ---------- de mundo a pantalla, con el acercamiento de la cámara ----------
  function vista(M, cam) {
    const [rx, ry, rw, rh] = U.rectJuego(M), sw = rw / VW, sh = rh / VISTA.H, y0 = CUR.camY ?? VH - VISTA.H;
    const P = (x, y) => [rx + (x - CUR.cam) * sw, ry + (y - y0) * sh];
    const A = P(cam.fx, cam.fy), z = cam.z;
    // el sujeto (A) va al centro del cuadro, corrido por cam.dx/dy; sin destapar nada fuera de la imagen del mundo
    const D = [M.w / 2 + (cam.dx || 0) * M.k, M.h / 2 + (cam.dy || 0) * M.k];
    if (z >= 1) {
      D[0] = clamp(D[0], M.w - M.pilar - (rx + rw - A[0]) * z, M.pilar - (rx - A[0]) * z);
      D[1] = clamp(D[1], ry + rh - (ry + rh - A[1]) * z, ry - (ry - A[1]) * z);
    }
    return { z, A, D, sx: sw * z, sy: sh * z, ex: D[0] - A[0] * z + (rx - CUR.cam * sw) * z, ey: D[1] - A[1] * z + (ry - y0 * sh) * z, y0,
      scr: (x, y) => { const q = P(x, y); return [D[0] + (q[0] - A[0]) * z, D[1] + (q[1] - A[1]) * z]; } };
  }
  const enMundo = (ctx, V) => ctx.setTransform(V.sx, 0, 0, V.sy, V.ex, V.ey);
  const vectorial = () => !(view.st.pixel || view.st.fixedS || view.st.base);
  const golemPenasco = new Image();
  golemPenasco.src = '../Roguelike/assets/cinematicas-jefes/golem-penasco-v1.webp';
  const golemPenascoBits8 = new Image();
  golemPenascoBits8.src = '../Roguelike/assets/cinematicas-jefes/golem-penasco-bits8-v1.webp';
  const golemOnda = new Image();
  golemOnda.src = '../Roguelike/assets/cinematicas-jefes/golem-onda-v1.webp';
  const golemOndaBits8 = new Image();
  golemOndaBits8.src = '../Roguelike/assets/cinematicas-jefes/golem-onda-bits8-v1.webp';
  const golemDormidoCine = new Image();
  golemDormidoCine.src = '../Roguelike/assets/cinematicas-jefes/golem-dormido-v1.webp';
  const golemDespertandoCine = new Image();
  golemDespertandoCine.src = '../Roguelike/assets/cinematicas-jefes/golem-despertando-v1.webp';
  const golemDormidoBits8Cine = new Image();
  golemDormidoBits8Cine.src = '../Roguelike/assets/cinematicas-jefes/golem-dormido-bits8-v1.webp';
  const golemDespiertaBits8Cine = new Image();
  golemDespiertaBits8Cine.src = '../Roguelike/assets/cinematicas-jefes/golem-despierta-bits8-v1.webp';
  const xunanDormidaCine = new Image();
  xunanDormidaCine.src = '../Roguelike/assets/cinematicas-jefes/xunan-kab-dormida-cine-v1.webp';
  const xunanDespertandoCine = new Image();
  xunanDespertandoCine.src = '../Roguelike/assets/cinematicas-jefes/xunan-kab-despertando-cine-v1.webp';
  const itzelRayo = new Image();
  itzelRayo.src = '../Roguelike/assets/cinematicas-jefes/itzel-esquiva-rayo-hoja-v1.webp';
  const itzelSaltoBits8 = new Image();
  itzelSaltoBits8.src = '../Roguelike/assets/cinematicas-jefes/itzel-salto-bits8-v1.webp';
  const posesRayo = [[35,300,393,387,17,16], [548,252,396,430,17,18], [1097,23,438,545,18,22], [1650,253,462,436,19,18]];
  const itzelSusto = new Image();
  itzelSusto.src = '../Roguelike/assets/cinematicas-jefes/itzel-susto-huida-hoja-v1.webp';
  const posesSusto = [[180,125,464,568,18,21], [910,39,426,583,17,22], [1546,123,550,560,20,21]];
  const itzelEquilibrio = new Image();
  itzelEquilibrio.src = '../Roguelike/assets/cinematicas-jefes/itzel-equilibrio-tronco-v1.webp';
  const itzelAlcanza = new Image();
  itzelAlcanza.src = '../Roguelike/assets/cinematicas-jefes/itzel-alcanzar-fresita-v1.webp';
  const itzelAgua = new Image();
  itzelAgua.src = '../Roguelike/assets/cinematicas-jefes/itzel-reaccion-agua-v1.webp';
  const itzelGota = new Image();
  itzelGota.src = '../Roguelike/assets/cinematicas-jefes/itzel-primera-gota-v1.webp';
  const rescateRio = new Image();
  rescateRio.src = '../Roguelike/assets/cinematicas-jefes/fresita-rescata-itzel-v1.webp';
  const hojaJaguar = new Image();
  hojaJaguar.src = '../Roguelike/assets/cinematicas-jefes/jaguar-hoja-v1.webp';
  const polvoJaguar = new Image();
  polvoJaguar.src = '../Roguelike/assets/cinematicas-jefes/jaguar-polvo-v1.webp';
  const fresitaCanta = new Image();
  fresitaCanta.src = '../Roguelike/assets/cinematicas-jefes/fresita-reacciones-hoja-v1.webp';
  const fresitaSustoBits8 = new Image();
  fresitaSustoBits8.src = '../Roguelike/assets/cinematicas-jefes/fresita-susto-bits8-v1.webp';
  const fresitaReconoce = new Image();
  fresitaReconoce.src = '../Roguelike/assets/cinematicas-jefes/fresita-reconoce-amigos-v1.webp';
  const rayoCine = new Image();
  rayoCine.src = '../Roguelike/assets/cinematicas-jefes/chaac-rayo-v1.webp';
  const rayoBits8 = new Image();
  rayoBits8.src = '../Roguelike/assets/cinematicas-jefes/chaac-rayo-bits8-v1.webp';
  const nubeChaac = new Image();
  nubeChaac.src = '../Roguelike/assets/cinematicas-jefes/chaac-nube-v1.webp';
  const nubeChaacBits8 = new Image();
  nubeChaacBits8.src = '../Roguelike/assets/cinematicas-jefes/chaac-nube-bits8-v1.webp';
  const grietaMythos = new Image();
  grietaMythos.src = '../Roguelike/assets/cinematicas-jefes/mythos-grieta-v1.webp';
  const fuegoKukulkan = new Image();
  fuegoKukulkan.src = '../Roguelike/assets/cinematicas-jefes/kukulkan-fuego-v1.webp';
  const plumaKukulkan = new Image();
  plumaKukulkan.src = '../Roguelike/assets/cinematicas-jefes/kukulkan-pluma-v1.webp';
  const reinaConjuro = new Image();
  reinaConjuro.src = '../Roguelike/assets/forge/jefes/hadas-v2/processed-v1/raw-sheet-clean.webp';
  // el jefe, encima de todo: nítido (estilos dibujados) o con el pixel de su mundo
  const tmp = mkCanvas(8, 8), tx = tmp.getContext('2d');
  function dibujaJefe(ctx, V, S) {
    const J = S.J, caja = (JEFES_ARTE.CAJA[J.tipo] || (o => [o.x - 60, o.y - 60, o.x + 60, o.y + 60]))(J), pad = 16;
    let alfaCuerpo = 1;
    const estiloJefe = String(view.st.id).split('~')[0], golemBits8 = estiloJefe === 'bits8';
    const imagenDormidoGolem = golemBits8 ? golemDormidoBits8Cine : golemDormidoCine, imagenDespiertoGolem = golemBits8 ? golemDespiertaBits8Cine : golemDespertandoCine;
    if (J.tipo === 'golem' && S.poseGolem && (estiloJefe === 'acuarela' || golemBits8) && imagenDormidoGolem.complete && imagenDormidoGolem.naturalWidth && imagenDespiertoGolem.complete && imagenDespiertoGolem.naturalWidth) {
      const h = Math.max(44, (J.hgt || 92) + 14), w = 84;
      ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = true;
      if (S.escala != null && S.escala !== 1) { ctx.translate(J.x, J.y); ctx.scale(S.escala, S.escala); ctx.translate(-J.x, -J.y); }
      if (S.giro) { ctx.translate(J.x, J.y); ctx.rotate(S.giro); ctx.translate(-J.x, -J.y); }
      ctx.globalAlpha = S.alfaJefe != null ? S.alfaJefe : 1;
      if (S.poseGolem === 'dormido') ctx.drawImage(imagenDormidoGolem, J.x - w / 2, FLOOR - h, w, h);
      else {
        const a = clamp(S.despertarGolem || 0, 0, 1);
        if (a < 1) { ctx.globalAlpha *= 1 - a; ctx.drawImage(imagenDormidoGolem, J.x - w / 2, FLOOR - h, w, h); }
        if (a > 0) { ctx.globalAlpha = (S.alfaJefe != null ? S.alfaJefe : 1) * a; ctx.drawImage(imagenDespiertoGolem, J.x - w / 2, FLOOR - h, w, h); }
      }
      ctx.restore(); return;
    }
    if (J.tipo === 'abeja' && S.poseAbeja && String(view.st.id).split('~')[0] === 'acuarela' && xunanDormidaCine.complete && xunanDormidaCine.naturalWidth && xunanDespertandoCine.complete && xunanDespertandoCine.naturalWidth) {
      const w = 70, y = S.poseAbeja === 'dormida' ? 2 : 0, alpha = S.alfaJefe != null ? S.alfaJefe : 1;
      const pintaPose = (img, a) => { ctx.globalAlpha = alpha * a; const h = w * img.naturalHeight / img.naturalWidth; ctx.drawImage(img, -w / 2, y - h / 2, w, h); };
      ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = true; ctx.translate(J.x, J.y); ctx.scale(J.face || 1, 1);
      if (S.poseAbeja === 'dormida') pintaPose(xunanDormidaCine, 1);
      else { const a = clamp(S.despertarAbeja || 0, 0, 1); if (a < 1) pintaPose(xunanDormidaCine, 1 - a); if (a > 0) pintaPose(xunanDespertandoCine, a); }
      ctx.restore(); return;
    }
    if (S.tipo === 'hadas' && String(view.st.id).split('~')[0] === 'acuarela' && J.t >= 3.15 && J.t < 3.7 && reinaConjuro.complete && reinaConjuro.naturalWidth) {
      ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = true; ctx.translate(J.x, J.y); ctx.scale(-1, 1);
      ctx.drawImage(reinaConjuro, 162, 732, 355, 430, -21, -29, 42, 51); ctx.restore(); return;
    }
    // con técnica del mundo (acuarela, vitral, papel…) el retoque cuesta por pixel: se procesa a menos resolución y a 30 cuadros
    const tec = !!JEFES_ARTE.ARTE[String(view.st.id).split('~')[0]];
    // (y en los jefes grandes, como la Ruptura, con un tope de pixeles y a 12 cuadros)
    const area = (caja[2] - caja[0] + pad * 2) * (caja[3] - caja[1] + pad * 2), grande = tec && area > 2.4e4;
    let s0 = vectorial() ? Math.min(V.sx, tec ? 4.2 : 6.5, tec ? Math.sqrt((grande ? 3.6e5 : 3.2e5) / area) : 99) : view.S, x0 = caja[0] - pad, y0 = caja[1] - pad, W = Math.ceil((caja[2] - caja[0] + pad * 2) * s0), H = Math.ceil((caja[3] - caja[1] + pad * 2) * s0);
    if (W < 2 || H < 2 || W > 3000 || H > 3000) return;
    const R = S.ultJefe;
    if (tec && R && Math.abs(J.t - R.t) < (grande ? 1 / 12 : 1 / 30) && J.t >= R.t && Math.abs(s0 / R.s0 - 1) < .06 && R.tinte === (S.tinte ? S.tinte.join() : '')) {
      ({ s0, W, H } = R); x0 = R.x0 + J.x - R.jx; y0 = R.y0 + J.y - R.jy; // el mismo cuadro, movido a donde va el jefe
    } else {
      if (tmp.width < W || tmp.height < H) { tmp.width = Math.max(tmp.width, W); tmp.height = Math.max(tmp.height, H); }
      tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-over'; tx.globalAlpha = 1; tx.filter = 'none'; tx.clearRect(0, 0, W + 2, H + 2);
      tx.setTransform(s0, 0, 0, s0, -x0 * s0, -y0 * s0);
      const g = Object.create(CUR); g.p = S.mira ? { x: S.mira[0], y: S.mira[1] } : CUR.p;
      const f = { t: CUR.t, cam: CUR.cam, S: s0, g, st: view.st, key: view.st.id + '@cine', y0: V.y0, H: VISTA.H };
      try { JEFES_EXT.BODY[J.tipo](tx, J, f); } catch (e) { /* si el cuerpo pide algo que la escena no tiene, no se dibuja */ }
      tx.setTransform(1, 0, 0, 1, 0, 0);
      if (S.tinte && S.tinte[1] > 0) { tx.globalCompositeOperation = 'source-atop'; tx.fillStyle = rgba(S.tinte[0], S.tinte[1]); tx.fillRect(0, 0, W, H); tx.globalCompositeOperation = 'source-over'; }
      S.ultJefe = { t: J.t, s0, W, H, x0, y0, jx: J.x, jy: J.y, tinte: S.tinte ? S.tinte.join() : '' };
    }
    ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = vectorial();
    if (S.escala != null && S.escala !== 1) { ctx.translate(J.x, J.y); ctx.scale(S.escala, S.escala); ctx.translate(-J.x, -J.y); } // nace chiquito de la grieta
    if (S.giro) { ctx.translate(J.x, J.y); ctx.rotate(S.giro); ctx.translate(-J.x, -J.y); }
    ctx.globalAlpha = alfaCuerpo * (S.alfaJefe != null ? S.alfaJefe : 1);
    const dy = S.dyJefe || 0, pinta = () => ctx.drawImage(tmp, 0, 0, W, H, x0, y0 + dy, W / s0, H / s0);
    if (S.agua == null) pinta();
    else { // bajo el agua se ve apenas, a través de ella
      const a = ctx.globalAlpha, arriba = S.agua - (y0 + dy), w = W / s0 + 10;
      if (arriba > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 5, y0 + dy - 5, w, arriba + 5); ctx.clip(); pinta(); ctx.restore(); }
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 5, Math.max(S.agua, y0 + dy - 5), w, 1e4); ctx.clip(); ctx.globalAlpha = a * .3; pinta(); ctx.restore();
    }
    ctx.restore();
  }
  function dibujaNinas(ctx, V) {
    const f = { t: CUR.t, cam: CUR.cam, S: V.sx, g: CUR, st: view.st, key: view.st.id + '@cine', y0: V.y0, H: VISTA.H };
    ctx.save(); enMundo(ctx, V);
    if (CUR.p.vis !== false) view.st.player(ctx, CUR.p, f);
    if (CUR.fre) { if (view.st.fresita) view.st.fresita(ctx, CUR.fre, f); else drawFresita(ctx, CUR.fre, CUR.t, false); }
    ctx.restore();
  }

  // ---------- la carta de lotería ----------
  function carta(ctx, M, S, u, tipo) {
    const k = M.k, img = S.congelado;
    const sale = EASE.in2(clamp((u - 1.25) / .35, 0, 1));
    // Recuperar la luz del plano mientras se retira la carta evita un salto
    // brusco de brillo al volver al juego.
    ctx.save(); ctx.filter = `saturate(${lerp(.7, 1, sale)}) brightness(${lerp(.62, 1, sale)})`; ctx.drawImage(img, 0, 0); ctx.filter = 'none';
    const H = Math.min(M.h * .74, (M.y1 - M.y0) * k * .8), W = H * .64, cx = M.w / 2, cy = M.h / 2;
    const entra = EASE.outBack(clamp(u / .38, 0, 1));
    ctx.translate(cx + (1 - entra) * M.w * .55, cy + (1 - entra) * H * .1); ctx.rotate((1 - entra) * .5 - .035 + sale * .2); ctx.scale(Math.max(.02, 1 - sale), 1); ctx.globalAlpha = 1 - sale * .6;
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 24 * k; ctx.shadowOffsetY = 8 * k;
    ctx.fillStyle = '#f3e6c4'; ctx.beginPath(); roundRect(ctx, -W / 2, -H / 2, W, H, 9 * k); ctx.fill(); ctx.shadowColor = 'transparent';
    // cartulina: fibras y orilla gastada
    ctx.strokeStyle = 'rgba(120,90,50,.08)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 60; i++) { const y = -H / 2 + hash1(i, 3) * H, x = -W / 2 + hash1(i, 4) * W; ctx.moveTo(x, y); ctx.lineTo(x + 6 * k + hash1(i, 5) * 14 * k, y + (hash1(i, 6) - .5) * 2 * k); } ctx.stroke();
    ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 2.6 * k; ctx.beginPath(); roundRect(ctx, -W / 2 + 7 * k, -H / 2 + 7 * k, W - 14 * k, H - 14 * k, 5 * k); ctx.stroke();
    ctx.strokeStyle = '#b8202a'; ctx.lineWidth = 1.2 * k; ctx.beginPath(); roundRect(ctx, -W / 2 + 11 * k, -H / 2 + 11 * k, W - 22 * k, H - 22 * k, 3 * k); ctx.stroke();
    // la imagen: el cuadro congelado, recortado alrededor del jefe
    const ix = -W / 2 + 16 * k, iy = -H / 2 + 16 * k, iw = W - 32 * k, ih = H * .74;
    const fc = S.focoCarta || S.foco || [M.w / 2, M.h / 2], ch = Math.min(M.h, ih * 1.35), cw = ch * iw / ih, sx0 = clamp(fc[0] - cw / 2, 0, Math.max(0, M.w - cw)), sy0 = clamp(fc[1] - ch / 2, 0, Math.max(0, M.h - ch));
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip(); ctx.drawImage(S.imgCarta || img, sx0, sy0, cw, ch, ix, iy, iw, ih); ctx.restore(); // (cartaEn: la carta lleva otro cuadro que el de fondo)
    ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 2 * k; ctx.strokeRect(ix, iy, iw, ih);
    // número y nombre
    const n = ORDEN.indexOf(tipo) + 1;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `800 ${20 * k}px Alegreya, Georgia, serif`; ctx.lineWidth = 4 * k; ctx.strokeStyle = '#f3e6c4'; ctx.strokeText(String(n), ix + 6 * k, iy + 4 * k); ctx.fillStyle = '#1a1210'; ctx.fillText(String(n), ix + 6 * k, iy + 4 * k);
    const nombre = CARTA[tipo] || JEFES[tipo].nombre.toUpperCase(), forma = tipo === 'ruptura' && S.formaRuptura ? S.formaRuptura.nombre : null;
    let fs = 19 * k; ctx.font = `800 ${fs}px Alegreya, Georgia, serif`; while (ctx.measureText(nombre).width > iw - 24 * k && fs > 8 * k) { fs *= .92; ctx.font = `800 ${fs}px Alegreya, Georgia, serif`; }
    const yNombre = iy + ih + (H / 2 - 16 * k - iy - ih) / 2 + 1 * k;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a1210'; ctx.fillText(nombre, 0, yNombre - (forma ? 8 * k : 0));
    if (forma) { let f = 13 * k; ctx.font = `700 ${f}px Alegreya, Georgia, serif`; while (ctx.measureText(forma).width > iw - 12 * k && f > 7 * k) { f *= .92; ctx.font = `700 ${f}px Alegreya, Georgia, serif`; } ctx.fillStyle = '#a42b36'; ctx.fillText(forma, 0, yNombre + 12 * k); }
    // una puntada roja de cada lado del nombre (la carta también va bordada)
    for (const s of [-1, 1]) U.puntada(ctx, s * (iw / 2 - 7 * k) - 3 * k, iy + ih + (H / 2 - 16 * k - iy - ih) / 2 - 3 * k, 6 * k, '#c8203a');
    ctx.restore();
  }

  // =====================================================================
  //  LA ESCENA (común): construye el prólogo, corre el guion del jefe y entrega
  // =====================================================================
  function crearEntradaJefe(tipo, opc = {}) {
    const E = ENTRADAS[tipo];
    if (opc.soloDatos) return { dur: E.tCarta + 1.6, cues: E.cues, subs: [] };
    let M = CINE.M; const titulo = opc.repeticion ? true : !!opc.titulo;
    const S = { tipo, repeticion: !!opc.repeticion, t0C: null, construido: false, construyendo: false, plate: null, curAntes: CUR, bannerArgs: null, corta: !!opc.corta, congelado: null, foco: null, cam: { x: 0, z: 1, fx: 0, fy: 0 }, J: null, Obj: null };
    const bannerOrig = banner; canvas.style.transform = '';
    window.__jefe = S; // para revisar en pruebas-cine.js
    const largo = () => (S.corta ? E.corta[1] - E.corta[0] : E.tCarta) + (S.mostrarCarta === false ? 0 : 1.6);
    // tiempo del guion: en la versión corta se ve solo un tramo y luego la carta
    const tau = t => { const u = t - S.t0C; if (!S.corta) return u; const d = E.corta[1] - E.corta[0]; return u < d ? E.corta[0] + u : E.tCarta + (u - d); };

    function construir() {
      if (S.construyendo) return; S.construyendo = true;
      banner = (...a) => { S.bannerArgs = a; };
      if (opc.repeticion) {
        // desde el menú: una partida de mentiras en un mundo que ya visitaron, con el prólogo del jefe
        const vistos = Object.keys(PROG.s.mundos || {}).filter(id => MUNDOS.includes(id) && NIVELES[id] && !NIVELES[id].modo), pool = vistos.length ? vistos : MUNDOS.filter(id => NIVELES[id] && !NIVELES[id].modo);
        newRun((Math.random() * 1e6) | 0); RUN.styles[0] = opc.mundo || STYLE_MAP[pool[(Math.random() * pool.length) | 0]]; RUN.world = 1; RUN.jefeOrden = [tipo]; RUN.bossIdx = 0;
        aplicaElegido(curStyle().id, 0); iniciaPrologo(tipo);
      } else opc.construir();
      $('loading').classList.remove('on');
    }
    function revisaConstruccion() {
      if (S.construido || !S.construyendo) return;
      if (STATE === 'play' && CUR && CUR !== S.curAntes) {
        S.construido = true; STATE = 'cine'; $('hud').classList.remove('on'); banner = bannerOrig;
        // el jefe del prólogo (o el de la arena si no hay prólogo); se guarda todo para dejarlo igual al final
        S.Obj = (CUR.objs || []).find(q => q.j && q.j.tipo === tipo) || null; S.J = S.Obj ? S.Obj.j : CUR.boss;
        const copia = o => { try { return structuredClone(o); } catch (e) { return JSON.parse(JSON.stringify(o)); } };
        S.guarda = { obj: S.Obj ? copia(S.Obj) : null, jefe: !S.Obj && S.J ? copia(S.J) : null, p: copia(CUR.p), fre: CUR.fre ? copia(CUR.fre) : null, cam: CUR.cam, t: CUR.t };
        if (!S.J && E.crea) { S.J = E.crea(S); S.propio = true; } // el prólogo no trae al jefe: uno solo para la toma
        if (CUR.rings) CUR.rings.length = 0; // el aro de llegada del juego no va en la toma
        if (E.inicia) E.inicia(S);
        S.claveCarta = tipo === 'ruptura' && S.formaRuptura ? 'ruptura:' + S.formaRuptura.id : 'jefe:' + tipo;
        const vistas = PROG.d.tarjetasJefes || (PROG.d.tarjetasJefes = {});
        S.mostrarCarta = !vistas[S.claveCarta];
      }
    }
    function capturaPlaca() { const c = mkCanvas(M.w, M.h); U.componer(c.getContext('2d'), M); S.plate = c; }
    // Los cuerpos de algunos jefes se cargan al primer dibujo. Esperarlos antes
    // de arrancar evita que la ilustración cambie a mitad de su presentación.
    function arteListo() {
      const estilo = view.st, id = String(window.estiloArteDerivado || estilo.id).split('~')[0];
      if (tipo === 'mythos' && typeof MASCARA_ESTILOS !== 'undefined' && MASCARA_ESTILOS.obtenerCuerpo)
        return !!MASCARA_ESTILOS.obtenerCuerpo(estilo);
      const variantes = window.JEFES_VARIANTES;
      if (variantes && variantes.archivos[tipo] && variantes.archivos[tipo][id])
        return !!variantes.obtener(tipo, id);
      return true;
    }
    function restaura() {
      const G = S.guarda; if (!G) return;
      if (S.Obj && G.obj) { for (const k of Object.keys(S.Obj)) if (!(k in G.obj)) delete S.Obj[k]; Object.assign(S.Obj, G.obj); S.J = S.Obj.j; }
      else if (S.J && G.jefe) Object.assign(S.J, G.jefe);
      Object.assign(CUR.p, G.p); if (CUR.fre && G.fre) Object.assign(CUR.fre, G.fre); CUR.cam = G.cam;
      if (E.entrega) E.entrega(S);
    }

    // un cuadro de la entrada: el guion mueve a todos, se dibuja el mundo y encima el jefe (y ellas, nítidas)
    function escena(ctx, T, dt) {
        S.tinte = null; S.mira = null; S.sacude = 0; S.escala = null; S.alfaJefe = null; S.giro = 0; S.dyJefe = 0; S.agua = null; S.oculto = false; S.ritmo = 1; S.mundoObj = null; S.estiloMundo = null;
        E.paso(S, T, dt);
        const c = S.cam; CUR.cam = c.x; CUR.t += dt * S.ritmo; U.pasoParticulas(CUR, dt * S.ritmo);
        if (S.sacude) { c.fx += ruido(T * 9, 1) * S.sacude; c.fy += ruido(T * 9, 2) * S.sacude; }
        const nit = c.nit && vectorial();
        // el jefe siempre va encima; en los planos cerrados también ellas, nítidas
        // el objeto del prólogo: oculto (lo dibuja la entrada), «sinJefe» (su lluvia, su agua… sin el jefe) o todo
        const modo = S.mundoObj || (E.dejaObj ? 'todo' : 'oculto'), tapa = S.Obj && modo === 'oculto', kObj = S.Obj ? S.Obj.k : null, jReal = S.Obj ? S.Obj.j : null;
        if (tapa) S.Obj.k = '__entrada'; else if (S.J && !S.Obj) S.J.__k = S.J.k, S.J.k = '__entrada';
        if (S.Obj && modo === 'sinJefe') S.Obj.j = { tipo: '__nada', x: jReal.x, y: jReal.y, t: jReal.t, pal: jReal.pal };
        const acuarela = String(view.st.id).split('~')[0] === 'acuarela';
        const poseRayo = S.tipo === 'chaac' && acuarela && T >= 4.55 && T < 5.15 && itzelRayo.complete && itzelRayo.naturalWidth;
        const saltoBits8 = String(view.st.id).split('~')[0] === 'bits8' && itzelSaltoBits8.complete && itzelSaltoBits8.naturalWidth && ((S.tipo === 'chaac' && T >= 4.7 && T < 5) || (S.tipo === 'golem' && ((T > S.ola - .18 && T < S.ola + .18) || (T > 5.8 && T < 6.12))) || (S.tipo === 'abeja' && T >= 1 && T < 1.3));
        const poseJaguar = S.tipo === 'jaguar' && acuarela && T >= 3.6 && T < 4.7 && itzelSusto.complete && itzelSusto.naturalWidth;
        const poseTronco = S.tipo === 'cocodrilo' && acuarela && S.s >= 2.82 && S.s < 2.95 && itzelEquilibrio.complete && itzelEquilibrio.naturalWidth;
        const poseHuida = S.tipo === 'golem' && acuarela && T >= 5.35 && T < 5.8 && itzelSusto.complete && itzelSusto.naturalWidth;
        const saltoGolem = S.tipo === 'golem' && acuarela && ((T > S.ola - .22 && T < S.ola + .22) || (T > 5.8 && T < 6.12)) && itzelRayo.complete && itzelRayo.naturalWidth;
        const posePirata = S.tipo === 'pirata' && acuarela && T >= 4.55 && T < 5.1 && itzelSusto.complete && itzelSusto.naturalWidth;
        const saltoMiel = S.tipo === 'abeja' && acuarela && T >= 1 && T < 1.3 && itzelRayo.complete && itzelRayo.naturalWidth;
        const poseAlcanza = S.tipo === 'hadas' && acuarela && T >= 4.35 && T < 4.85 && itzelAlcanza.complete && itzelAlcanza.naturalWidth;
        const poseAgua = S.tipo === 'cocodrilo' && acuarela && S.s >= 4.45 && S.s < 4.85 && itzelAgua.complete && itzelAgua.naturalWidth;
        const poseGota = S.tipo === 'chaac' && acuarela && T >= 1.1 && T < 1.45 && itzelGota.complete && itzelGota.naturalWidth;
        const poseRescate = S.tipo === 'cocodrilo' && acuarela && CUR.fre && S.s >= 2.95 && S.s < 3.15 && rescateRio.complete && rescateRio.naturalWidth;
        const poseItzel = poseRayo || saltoBits8 || poseJaguar || poseTronco || poseHuida || saltoGolem || posePirata || saltoMiel || poseAlcanza || poseAgua || poseGota || poseRescate;
        const cantoFresita = S.tipo === 'abeja' && T >= 3.9 && T < 4.65;
        const sustoFresita = (S.tipo === 'jaguar' && T >= 2.3 && T < 2.75) || (S.tipo === 'golem' && ((T >= 1.25 && T < 1.45) || (T >= 5.35 && T < 5.55))) || (S.tipo === 'hadas' && T >= 4 && T < 5.95);
        const sustoFresitaT = S.tipo === 'golem' && ((T >= 3.9 && T < 4.2) || (T >= 5.35 && T < 5.55));
        const aguaFresita = S.tipo === 'cocodrilo' && S.s >= 4.55 && S.s < 4.85;
        const reconoceAmigos = S.tipo === 'ruptura' && T >= 1.7 && T < 2.3 && fresitaReconoce.complete && fresitaReconoce.naturalWidth;
        const sustoBits8 = String(view.st.id).split('~')[0] === 'bits8' && sustoFresitaT && fresitaSustoBits8.complete && fresitaSustoBits8.naturalWidth;
        const poseFresita = CUR.fre && (sustoBits8 || (acuarela && (poseRescate || reconoceAmigos || ((cantoFresita || sustoFresita || aguaFresita) && fresitaCanta.complete && fresitaCanta.naturalWidth))));
        const pv = CUR.p.vis, fx = CUR.fre ? CUR.fre.x : 0; if (nit || poseItzel) CUR.p.vis = false; if ((nit || poseFresita) && CUR.fre) CUR.fre.x = -1e5;
        // el mundo puede parpadear unos cuadros con el arte de otro mundo (la Ruptura); el jefe sigue en el suyo
        const otro = S.estiloMundo && STYLE_MAP[S.estiloMundo], st0 = view.st; if (otro && otro !== st0) view.setStyle(otro);
        U.pintaMundo(CUR, false);
        if (otro && otro !== st0) view.setStyle(st0);
        if (tapa) S.Obj.k = kObj; else if (S.J && !S.Obj) S.J.k = S.J.__k;
        if (S.Obj) S.Obj.j = jReal;
        CUR.p.vis = pv; if (CUR.fre) CUR.fre.x = fx;
        const V = vista(M, c);
        U.componer(ctx, M, c.z, V.A, nit ? (c.dof || 0) * 4 * M.k : 0, V.D);
        if (E.atras) { ctx.save(); enMundo(ctx, V); E.atras(ctx, S, T, V); ctx.restore(); }
        if (!S.oculto) dibujaJefe(ctx, V, S);
        if (poseItzel) {
          const saltoJaguar = poseJaguar && T >= 4.15 && T < 4.5;
          const saltoPirata = posePirata && T < 4.9;
          const [sx, sy, sw, sh, w, h] = poseRayo ? posesRayo[T < 4.67 ? 0 : T < 4.76 ? 1 : T < 5.0 ? 2 : 3] : saltoBits8 ? [370,90,720,860,19,23] : saltoGolem || saltoMiel ? posesRayo[2] : poseJaguar || posePirata ? posesSusto[saltoJaguar || saltoPirata ? 1 : 0] : poseHuida ? posesSusto[T < 5.6 ? 0 : 2] : poseAlcanza ? [46,83,1007,1260,19,24] : poseAgua ? [186,20,710,1430,15,22] : poseGota ? [79,9,780,1445,15,23] : poseRescate ? [0,0,1107,1421,23,27] : [47,34,976,1334,20,21], p = CUR.p;
          ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = !saltoBits8; ctx.translate(p.x, p.y);
          if ((poseJaguar && !saltoJaguar) || (posePirata && !saltoPirata)) ctx.scale(-1, 1);
          if ((saltoGolem || saltoBits8) && p.face < 0) ctx.scale(-1, 1);
          ctx.drawImage(poseRayo || saltoGolem || saltoMiel ? itzelRayo : saltoBits8 ? itzelSaltoBits8 : poseJaguar || poseHuida || posePirata ? itzelSusto : poseAlcanza ? itzelAlcanza : poseAgua ? itzelAgua : poseGota ? itzelGota : poseRescate ? rescateRio : itzelEquilibrio, sx, sy, sw, sh, poseRescate ? -w * .6 : -w / 2, -h, w, h); ctx.restore();
        }
        if (nit) { if (poseItzel) CUR.p.vis = false; if (poseFresita) CUR.fre.x = -1e5; dibujaNinas(ctx, V); CUR.p.vis = pv; if (poseFresita) CUR.fre.x = fx; }
        if (poseFresita && !poseRescate) { ctx.save(); enMundo(ctx, V); ctx.imageSmoothingEnabled = !sustoBits8; if (sustoBits8) ctx.drawImage(fresitaSustoBits8, 194, 14, 1004, 1172, CUR.fre.x - 7, CUR.fre.y - 7.5, 14, 15); else if (reconoceAmigos) ctx.drawImage(fresitaReconoce, CUR.fre.x - 7.5, CUR.fre.y - 8.5, 15, 17); else ctx.drawImage(fresitaCanta, cantoFresita ? 705 : aguaFresita ? 1410 : 0, 0, aguaFresita ? 738 : 705, 732, CUR.fre.x - 7, CUR.fre.y - 7.5, 14, 15); ctx.restore(); }
        if (E.frente) { ctx.save(); enMundo(ctx, V); E.frente(ctx, S, T, V); ctx.restore(); }
        if (E.pantalla) { ctx.save(); E.pantalla(ctx, M, S, T, V); ctx.restore(); }
        S.foco = E.foco ? V.scr(...E.foco(S)) : [M.w / 2, M.h / 2];
        if (T < .3 && !S.corta) { ctx.fillStyle = `rgba(13,8,6,${1 - T / .3})`; ctx.fillRect(0, 0, M.w, M.h); }
    }

    const esc = {
      inmediata: true, subs: [], saltoDirecto: true,
      // El reloj del motor también avanza mientras se prepara el prólogo.
      // Las marcas pertenecen al guion, no a ese tiempo de espera.
      get cues() {
        if (S.t0C == null) return [];
        if (!S.corta) return E.cues.filter(c => S.mostrarCarta !== false || c[0] < E.tCarta).map(c => [S.t0C + c[0], c[1], c[2]]);
        const [inicio, fin] = E.corta, duracion = fin - inicio;
        return E.cues.filter(c => (c[0] >= inicio && c[0] < fin) || (S.mostrarCarta !== false && c[0] >= E.tCarta))
          .map(c => [S.t0C + (c[0] < fin ? c[0] - inicio : duracion + c[0] - E.tCarta), c[1], c[2]]);
      },
      get dur() { return S.t0C == null ? 99 : S.t0C + largo(); },
      barras(t) { return .55 * Math.min(tramo(t, 0, .35), S.t0C == null ? 1 : 1 - tramo(t, S.t0C + largo() - .45, S.t0C + largo() - .05)); },
      saltar(t) { if (!S.construyendo) { if (!S.plate) capturaPlaca(); construir(); } return S.construido && S.t0C != null ? Math.max(t, S.t0C + largo() - .05) : null; },
      cuadro(ctx, t, dt) {
        M = CINE.M; ctx.setTransform(1, 0, 0, 1, 0, 0);
        revisaConstruccion();
        if (!S.plate) { capturaPlaca(); construir(); }
        if (!S.construido) { ctx.drawImage(S.plate, 0, 0); ctx.fillStyle = `rgba(13,8,6,${.5 * tramo(t, 0, .4)})`; ctx.fillRect(0, 0, M.w, M.h); return; } // se oscurece mientras se arma el prólogo
        if (!S.artePreparado) {
          if (S.esperaArte == null) S.esperaArte = performance.now();
          if (!arteListo() && performance.now() - S.esperaArte < 1500) {
            ctx.drawImage(S.plate, 0, 0); ctx.fillStyle = 'rgba(13,8,6,.5)'; ctx.fillRect(0, 0, M.w, M.h); return;
          }
          S.artePreparado = true; // si falta el archivo, continuar con el arte alternativo
        }
        // antes de arrancar, con la imagen todavía quieta: se dibujan aparte las tomas clave para que el mundo
        // y el jefe armen sus cachés a esos acercamientos (si no, el primer primer plano da un tirón)
        if (!S.calentado) {
          S.calentado = true; // en el mismo lienzo (así la GPU también prepara sus desenfoques); la imagen quieta lo tapa
          for (const tc of E.calienta || [.3, 2.0, 3.9, 5.0]) { ctx.save(); escena(ctx, tc, 0); ctx.restore(); }
          if (canvas.width > 1 && canvas.height > 1) { for (let r = 1; r <= 12; r++) { ctx.filter = `blur(${r}px)`; ctx.drawImage(canvas, 0, 0, M.w, M.h); } ctx.filter = 'none'; } // (con la ventana en cero no hay nada que preparar)
          S.cuerpo = false; S.tUlt = 0; S.ultJefe = null; S.lento = null; S.cubeta = null; S.tLento = null;
          ctx.drawImage(S.plate, 0, 0); ctx.fillStyle = `rgba(13,8,6,${.5 * tramo(t, 0, .4)})`; ctx.fillRect(0, 0, M.w, M.h); return;
        }
        if (S.t0C == null) S.t0C = t;
        const T = tau(t);
        // ---- la carta: se dibuja el último cuadro, se congela y se vuelve carta ----
        if (T >= E.tCarta) {
          // Si la carta ya se vio, conservar la última toma también cuando se
          // salta: el motor limpia el lienzo antes de llamar a cuadro().
          if (!S.mostrarCarta) { escena(ctx, E.tCarta - .001, 0); return; }
          const vistas = PROG.d.tarjetasJefes || (PROG.d.tarjetasJefes = {});
          if (!vistas[S.claveCarta]) { vistas[S.claveCarta] = true; PROG.save(); }
          if (!S.congelado) {
            if (E.cartaEn != null) { escena(ctx, E.cartaEn, 0); S.imgCarta = mkCanvas(M.w, M.h); S.imgCarta.getContext('2d').drawImage(ctx.canvas, 0, 0); S.focoCarta = S.foco; }
            escena(ctx, E.tCarta - .001, 0); S.congelado = mkCanvas(M.w, M.h); S.congelado.getContext('2d').drawImage(ctx.canvas, 0, 0);
          }
          ctx.fillStyle = '#0d0806'; ctx.fillRect(0, 0, M.w, M.h);
          carta(ctx, M, S, T - E.tCarta, tipo);
          return;
        }
        // la plastilina va en stop motion de verdad (y su relieve cuesta mucho): la toma cambia 12 veces por segundo
        const cada = CUADRO_ESTILO[String(view.st.id).split('~')[0]];
        if (cada) {
          const b = Math.floor(T / cada), L2 = S.lento;
          if (!L2 || L2.width !== M.w || L2.height !== M.h) S.lento = mkCanvas(M.w, M.h);
          if (b !== S.cubeta || S.lento !== L2) { S.cubeta = b; const cx = S.lento.getContext('2d'); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, M.w, M.h); escena(cx, T, S.tLento == null ? 0 : Math.max(0, T - S.tLento)); S.tLento = T; }
          ctx.drawImage(S.lento, 0, 0); return;
        }
        escena(ctx, T, dt);
      },
      fin() {
        banner = bannerOrig;
        if (!S.construido) { if (!S.construyendo) construir(); return; }
        restaura();
        if (opc.repeticion) return;
        CUR.acc = 0; STATE = 'play'; $('hud').classList.add('on'); HUDKEY = ''; MOUSE.clicks.length = 0;
        if (S.bannerArgs) banner(...S.bannerArgs);
      },
    };
    return esc;
  }

  // =====================================================================
  //  1 · MYTHOS: «El ojo de otro cielo»
  // =====================================================================
  const ORBE = ['#ff5d9a', '#ffd23f', '#5fe07a', '#ffffff'];
  // el rasgón del cielo: una herida dentada con el cosmos adentro; al final la cosen cinco puntadas
  function rasgon(ctx, x, y, ab, ci, t) {
    const vivo = ab * (1 - ci); if (ab <= 0 || ci >= 1) return;
    const h = 46 + 30 * ab, w = 24 * vivo + .6, n = 14, borde = [];
    for (let i = 0; i <= n; i++) { const u = i / n, yy = y - h / 2 + u * h, k = Math.pow(Math.sin(u * Math.PI), .75), j = (hash1(i, 31) - .5) * 5 * k; borde.push([x + w * k + j * vivo, yy]); }
    for (let i = n; i >= 0; i--) { const u = i / n, yy = y - h / 2 + u * h, k = Math.pow(Math.sin(u * Math.PI), .75), j = (hash1(i, 37) - .5) * 5 * k; borde.push([x - w * k + j * vivo, yy]); }
    const traza = () => { ctx.beginPath(); borde.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); };
    ctx.save();
    // resplandor turquesa y rosa alrededor
    ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, h * .8, '#5fe8ff', .35 * vivo); glowDot(ctx, x, y + h * .2, h * .5, '#ff5dc8', .25 * vivo);
    ctx.globalCompositeOperation = 'source-over';
    // adentro, otro cielo
    const grietaIlustrada = String(view.st.id).split('~')[0] === 'acuarela' && grietaMythos.complete && grietaMythos.naturalWidth;
    if (grietaIlustrada) { const ancho = Math.max(1, w * 3.3); ctx.globalAlpha = Math.min(1, ab * 2); ctx.drawImage(grietaMythos, x - ancho / 2, y - h / 2, ancho, h); ctx.globalAlpha = 1; }
    else { traza(); ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2); g.addColorStop(0, '#1a0638'); g.addColorStop(.5, '#3b0a5e'); g.addColorStop(1, '#0a1840'); ctx.fillStyle = g; ctx.fillRect(x - w - 6, y - h / 2, w * 2 + 12, h);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 16; i++) { const sx = x + (hash1(i, 41) - .5) * 44, sy = y - h / 2 + ((hash1(i, 43) * h + t * 9) % h), r = .4 + hash1(i, 47) * .7; ctx.globalAlpha = .5 + .5 * Math.sin(t * 5 + i); ctx.fillRect(sx - r, sy - r, r * 2, r * 2); }
    ctx.restore();
    // labios de la herida
    traza(); ctx.lineJoin = 'round'; ctx.strokeStyle = '#ff7fd6'; ctx.lineWidth = 2.2; ctx.globalAlpha = .9 * Math.min(1, ab * 2); ctx.stroke();
    ctx.strokeStyle = '#c6fbff'; ctx.lineWidth = .9; ctx.stroke(); }
    ctx.globalAlpha = 1;
    // las puntadas aparecen y jalan los labios hasta cerrarla
    if (ci > 0) {
      const cuantas = 5, ap = tramo(ci, 0, .35);
      for (let i = 0; i < cuantas; i++) { const u = (i + .5) / cuantas, k = Math.pow(Math.sin(u * Math.PI), .75), yy = y - h / 2 + u * h, a = clamp(ap * cuantas - i, 0, 1); if (a <= 0) continue;
        ctx.globalAlpha = a; ctx.strokeStyle = HILO[i % HILO.length]; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        const ww = (w * k + 3) * a; ctx.beginPath(); ctx.moveTo(x - ww, yy - 2.5); ctx.lineTo(x + ww, yy + 2.5); ctx.moveTo(x + ww, yy - 2.5); ctx.lineTo(x - ww, yy + 2.5); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    // destello cuando se cierra
    if (ci > .75) { const k = (ci - .75) / .25; ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 10 + k * 26, '#fff6d0', .8 * (1 - k)); }
    ctx.restore();
  }
  const HILO = ['#e8364f', '#2fb3a5', '#ffc93c', '#8f4ac7', '#ff7aa8'];
  ENTRADAS.mythos = {
    tCarta: 5.95, corta: [1.75, 4.45],
    cues: [[.3, 'silencio', 'las estrellas se apagan'], [1.55, 'golpe', 'se agrieta el cielo'], [1.85, 'swell', 'baja Mythos'], [3.75, 'golpe', 'se abre el ojo'], [4.7, 'efecto', 'orbes'], [5.95, 'acento', 'carta']],
    inicia(S) { const st = L.start; S.mx = Math.min(st.x + 160, L.camMin + VW - 70); S.my = 58; },
    paso(S, t, dt) {
      const p = CUR.p, st = L.start, J = S.J, fr = CUR.fre;
      const anda = tramo(t, 0, 1.3, 'out2'); Object.assign(p, { x: st.x - 26 + 26 * anda, y: st.y, on: true, face: 1, vx: anda < 1 ? 80 * (1 - anda) : 0, vy: 0, vis: true, inv: 0 });
      p.run += Math.abs(p.vx) * dt * .16; p.sq = t > 4.6 && t < 4.95 ? Math.sin((t - 4.6) / .35 * Math.PI) * .2 : 0;
      if (fr) { const pega = tramo(t, 1.5, 1.9); Object.assign(fr, { x: p.x - 18 + pega * 6 + Math.sin(t * 2) * 2, y: p.y - 30 + pega * 6 + Math.sin(t * 2.6) * 2.5, face: 1 }); }
      // Mythos baja por la grieta; el ojo se abre a los 3.75
      const baja = EASE.out3(tramo(t, 1.85, 3.3, 'lin')), grieta = S.my - 40;
      S.escala = lerp(.12, 1, EASE.outBack(tramo(t, 1.85, 3.0, 'lin'))); S.alfaJefe = tramo(t, 1.8, 2.05);
      Object.assign(J, { x: S.mx + Math.sin(t * .8) * 3, y: lerp(grieta, S.my, baja) + Math.sin(t * 1.4) * 2 * baja, t, at: t, st: t > 3.75 ? 'ventana' : 'entra', cineOjoCerrado: t < 3.75, stunT: 0, flash: t > 3.72 && t < 3.86 ? .4 : 0, mode: 'alcance', conLagrima: false });
      // la pupila busca a los lados y se clava en Itzel
      S.mira = t < 4.05 ? [J.x + Math.sin(t * 7) * 70, J.y + 30] : [p.x, p.y - 8];
      if (t < 1.5) S.cam = { x: L.camMin - 44, z: claves(t, [[0, 1.05], [1.5, 1]]), fx: p.x + 70, fy: 110, nit: false };
      else if (t < 3.3) S.cam = { x: L.camMin - 44, z: claves(t, [[1.5, 1.1], [3.3, 1.45, 'io2']]), fx: S.mx, fy: claves(t, [[1.5, S.my - 30], [3.3, S.my + 4]]), dof: .15, nit: true };
      else if (t < 4.6) S.cam = { x: L.camMin, z: claves(t, [[3.3, 3.1], [4.6, 3.45, 'io2']]), fx: J.x - 2, fy: J.y, dof: .8, nit: true };
      else S.cam = { x: L.camMin - 44, z: claves(t, [[4.6, 1.5], [5.95, 1.62]]), fx: lerp(p.x, S.mx, .5), fy: lerp(p.y - 20, S.my, .5), dof: .3, nit: true };
      if (t > 3.72 && t < 4.1) S.sacude = 3 * (1 - tramo(t, 3.72, 4.1));
    },
    // la grieta del cielo y los pedazos de piedra que caen de ella
    atras(ctx, S, t, V) {
      if (t < 1.45) return;
      const x = S.mx, y = S.my - (String(view.st.id).split('~')[0] === 'acuarela' ? 12 : 40), ab = EASE.out3(tramo(t, 1.5, 1.85, 'lin')), ci = EASE.io2(tramo(t, 3.0, 3.45, 'lin'));
      rasgon(ctx, x, y, ab, ci, t);
      ctx.fillStyle = S.J.pal.b;
      for (let i = 0; i < 9; i++) { const f = t - 1.6 - hash1(i, 2) * 1.2; if (f < 0 || f > 1.6) continue; const px = x + (hash1(i, 3) - .5) * 40, py = y - 10 + f * f * 140; ctx.save(); ctx.translate(px, py); ctx.rotate(f * (hash1(i, 4) * 6 - 3)); ctx.globalAlpha = 1 - f / 1.6; ctx.fillRect(-1.6, -1.6, 3.2 + hash1(i, 5) * 2, 3.2); ctx.restore(); }
    },
    // los orbes de colores salen en espiral y se reparten por el cielo
    frente(ctx, S, t) {
      if (t < 4.6) return;
      const u = t - 4.6;
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * TAU + u * 2.6, r = EASE.out2(clamp(u / 1.2, 0, 1)) * (40 + (i % 3) * 22), x = S.J.x + Math.cos(a) * r * 1.6, y = S.J.y + 6 + Math.sin(a) * r * .7, col = ORBE[i % 4];
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 9, col, .7); ctx.restore();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, i % 4 === 2 ? 3.4 : 2.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - .8, y - .8, .9, 0, TAU); ctx.fill();
      }
    },
    // las estrellas del cielo se apagan una por una y todo se oscurece
    pantalla(ctx, M, S, t) {
      const osc = tramo(t, .2, 1.7) * (t > 4.6 ? 1 - tramo(t, 4.6, 5.4) * .3 : 1);
      ctx.fillStyle = `rgba(10,6,24,${.38 * osc})`; ctx.fillRect(0, 0, M.w, M.h);
      if (t < 1.8) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const x = M.w * (.06 + hash1(i, 7) * .88), y = M.h * (.1 + hash1(i, 8) * .3), apaga = .25 + hash1(i, 9) * 1.3, k = 1 - tramo(t, apaga, apaga + .18); if (k <= 0) continue; const r = (1.6 + hash1(i, 10) * 1.6) * M.k * k; ctx.fillStyle = `rgba(255,250,220,${k})`; ctx.beginPath(); ctx.moveTo(x, y - r * 2.4); ctx.lineTo(x + r * .4, y); ctx.lineTo(x, y + r * 2.4); ctx.lineTo(x - r * .4, y); ctx.closePath(); ctx.moveTo(x - r * 2.4, y); ctx.lineTo(x, y + r * .4); ctx.lineTo(x + r * 2.4, y); ctx.lineTo(x, y - r * .4); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }
    },
    foco: S => [S.J.x, S.J.y + 6],
    entrega(S) { const o = S.Obj; if (o && o.k === 'mythosOrbes') { o.j.x = S.mx; o.tiro = Math.max(o.tiro, 1.2); } }, // sigue flotando donde quedó en la toma
  };

  // =====================================================================
  //  2 · EL GÓLEM: «El cerro que despierta»
  // =====================================================================
  ENTRADAS.golem = {
    tCarta: 5.95, corta: [2.8, 4.75],
    cues: [[.4, 'efecto', 'retumbo lejano'], [1.9, 'golpe', 'se enciende el cristal'], [2.85, 'swell', 'se levanta'], [4.0, 'golpe', 'pisotón'], [5.35, 'golpe', 'cae el peñasco'], [5.95, 'acento', 'carta y a correr']],
    inicia(S) { S.gx = L.start.x - 74; },
    paso(S, t, dt) {
      const p = CUR.p, st = L.start, J = S.J, fr = CUR.fre, gx = S.gx;
      // el gólem: dormido y agachado, se le prende el cristal, se levanta, pisa
      const sube = EASE.outBack(tramo(t, 2.85, 3.5, 'lin'));
      const avienta = t >= 4.45 && t < 5.35;
      const pisa = t >= 4.0 && t < 4.45;
      Object.assign(J, { x: gx, y: FLOOR, face: 1, t, at: avienta ? t - 4.45 : t, hgt: lerp(30, 92, sube), st: avienta || pisa ? 'ataque' : 'ventana', atk: avienta ? 'rocas' : 'pisoton', cineDormido: t < 2.05, cineDespierta: t >= 2.05 && t < 3.5, stunT: 0, flash: t > 1.9 && t < 2.02 ? .4 : 0, drop: 0, charging: false, jump: t > 3.6 && t < 4.0 ? Math.sin((t - 3.6) / .4 * Math.PI) * 26 : 0 });
      S.poseGolem = t < 2.05 ? 'dormido' : t < 3.5 ? 'despertando' : null;
      S.despertarGolem = tramo(t, 2.05, 2.55, 'io2');
      S.tinte = ['#1a1018', .55 * (1 - tramo(t, 1.95, 2.6))]; // la piedra dormida, apagada
      // Itzel: camina, oye algo, voltea; brinca la onda; el peñasco; sale corriendo
      const ola = 4.0 + (st.x + 6 - gx - 18) / 170;
      let x = st.x + 8, y = st.y, face = 1, vx = 0, on = true, vy = 0;
      if (t < 1.1) { const u = tramo(t, 0, 1.1, 'out2'); x = st.x - 14 + 22 * u; vx = 70 * (1 - u); }
      else if (t < 1.3) { face = 1; }
      else face = -1;
      if (t > ola - .22 && t < ola + .22) { const u = (t - ola + .22) / .44, [ax, ay] = arco(u, st.x + 8, st.y, st.x + 8, st.y, 18); y = ay; on = false; vy = u < .5 ? -200 : 200; }
      if (t > 5.45) { face = 1; const u = t - 5.6; if (u > 0) { x = st.x + 8 + u * 135; vx = 135; }
        if (t > 5.8 && t < 6.12) { const k = (t - 5.8) / .32; y = st.y - Math.sin(k * Math.PI) * 20; on = false; vy = k < .5 ? -180 : 180; } } // brinca el peñasco
      Object.assign(p, { x, y, face, vx, vy, on, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = (t > ola + .22 && t < ola + .4) ? .28 * (1 - (t - ola - .22) / .18) : (t > 5.35 && t < 5.55 ? .2 : 0);
      if (fr) { const salta = (t > 1.25 && t < 1.45) || (t > 5.35 && t < 5.55) ? 6 : 0; Object.assign(fr, { x: p.x - face * 16, y: p.y - 30 - salta + Math.sin(t * 2.6) * 2, face }); }
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin - 62, z: claves(t, [[0, 1.05], [1.4, 1]]), fx: (gx + st.x) / 2, fy: FLOOR - 40, nit: false };
      else if (t < 2.8) S.cam = { x: L.camMin - 62, z: claves(t, [[1.4, 2.4], [2.8, 2.85, 'io2']]), fx: gx + 2, fy: FLOOR - 84 * J.hgt / 92, dof: .7, nit: true };
      else if (t < 4.45) S.cam = { x: L.camMin - 62, z: claves(t, [[2.8, 1.35], [4.45, 1.5, 'io2']]), fx: gx + 30, fy: FLOOR - 30, dof: .2, nit: true };
      else S.cam = { x: L.camMin - 62, z: claves(t, [[4.45, 1.25], [5.95, 1.32]]), fx: (gx + p.x) / 2 + 24, fy: FLOOR - 42, dof: .1, nit: true };
      if (t < 1.4) S.sacude = .8 * Math.abs(Math.sin(t * 3)); if (t > 2.85 && t < 3.6) S.sacude = 4 * (1 - tramo(t, 3.3, 3.6)); if (t > 4 && t < 4.4) S.sacude = 6 * (1 - tramo(t, 4, 4.4)); if (t > 5.35 && t < 5.7) S.sacude = 4 * (1 - tramo(t, 5.35, 5.7));
      S.ola = ola;
    },
    atras(ctx, S, t) {
      const J = S.J, k = J.hgt / 92, gx = S.gx;
      // piedritas que caen del cerro dormido y, al levantarse, de sus hombros
      ctx.fillStyle = J.pal.b;
      for (let i = 0; i < 14; i++) { const t0 = i < 6 ? .2 + i * .2 : 2.85 + (i - 6) * .09, f = t - t0; if (f < 0 || f > .9) continue; const px = gx + (hash1(i, 1) - .5) * 36, py = FLOOR - J.hgt * (.55 + hash1(i, 2) * .4) + f * f * 300; if (py > FLOOR) continue; ctx.save(); ctx.translate(px, py); ctx.rotate(f * 5); ctx.fillRect(-1.5, -1.5, 3, 3); ctx.restore(); }
      // la onda del pisotón corre por el suelo
      if (t > 4.0 && t < 5.2) { const x = gx + 18 + (t - 4.0) * 170, a = 1 - tramo(t, 4.8, 5.2);
        const estilo = String(view.st.id).split('~')[0], onda = estilo === 'acuarela' ? golemOnda : estilo === 'bits8' ? golemOndaBits8 : null;
        if (onda && onda.complete && onda.naturalWidth) { ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = estilo !== 'bits8'; if (estilo === 'bits8') ctx.drawImage(onda, 74, 227, 2009, 417, x - 38, FLOOR - 11, 40, 11); else ctx.drawImage(onda, 45, 215, 2051, 413, x - 38, FLOOR - 11, 40, 11); ctx.restore(); }
        else { ctx.globalAlpha = a; ctx.fillStyle = J.pal.c; for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.moveTo(x - 7 + q * 3.5, FLOOR); ctx.lineTo(x - 4.5 + q * 3.5, FLOOR - 10 + q * 2); ctx.lineTo(x - 2 + q * 3.5, FLOOR); ctx.fill(); } ctx.fillStyle = J.pal.b; ctx.fillRect(gx + 18, FLOOR - 1.2, x - gx - 18, 1.2); ctx.globalAlpha = 1;
          for (let i = 0; i < 6; i++) { const f = ((t - 4) * 3 + i / 6) % 1; ctx.fillStyle = `rgba(200,180,150,${.5 * (1 - f) * a})`; ctx.beginPath(); ctx.arc(x - 6 - f * 14, FLOOR - 3 - f * 6, 2 + f * 3, 0, TAU); ctx.fill(); } } }
    },
    frente(ctx, S, t) {
      const J = S.J, k = J.hgt / 92, gx = S.gx, p = CUR.p;
      // los ojos se encienden
      const estilo = String(view.st.id).split('~')[0];
      if (t > 2.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = tramo(t, 2.05, 2.4) * (.8 + .2 * Math.sin(t * 9)); for (const ex of [4.5, -3.5]) glowDot(ctx, gx + ex, FLOOR - 77 * k - (J.jump || 0), 7, J.pal.eye, .8 * a); ctx.restore(); }
      // el peñasco: lo arranca del suelo, lo avienta en arco y cae frente a Itzel
      if (t > 4.45) {
        const destino = L.start.x + 8 + 48, x0 = gx + 36, y0 = FLOOR - 101;
        let x, y, rot = 0;
        if (t < 4.7) { const u = tramo(t, 4.45, 4.7); x = x0; y = lerp(FLOOR, y0, EASE.out2(u)); }
        else if (t < 5.35) { const u = (t - 4.7) / .65; [x, y] = arco(u, x0, y0, destino, FLOOR - 6, 46); rot = u * 6; }
        else { x = destino; y = FLOOR - 6; rot = 6; }
        { ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
          const roca = estilo === 'acuarela' ? golemPenasco : estilo === 'bits8' ? golemPenascoBits8 : null;
          if (roca && roca.complete && roca.naturalWidth) { ctx.imageSmoothingEnabled = estilo !== 'bits8'; ctx.drawImage(roca, -12, -11, 24, 22); }
          else { ctx.scale(2.2, 2.2); ctx.fillStyle = '#6a6458'; ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-1, -4.5); ctx.lineTo(4, -3); ctx.lineTo(4.5, 2); ctx.lineTo(0, 4.5); ctx.lineTo(-4, 2.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = J.pal.b; ctx.lineWidth = .5; ctx.stroke(); ctx.fillStyle = '#9a9484'; ctx.fillRect(-2, -3, 3, 1.4); }
          ctx.restore(); }
        if (t > 5.35 && t < 6) { const f = (t - 5.35) / .6; for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI, d = 6 + EASE.out2(f) * 26; ctx.fillStyle = `rgba(190,170,140,${.7 * (1 - f)})`; ctx.beginPath(); ctx.arc(destino + Math.cos(a) * d, FLOOR - 4 + Math.sin(a) * d * .5, 2 + f * 4, 0, TAU); ctx.fill(); } }
      }
      // el grito de Itzel al ver el peñasco: unas rayitas de susto
      if (t > 5.35 && t < 5.7) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .8; for (const a of [-2.2, -1.6, -1]) { ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * 12, p.y - 22 + Math.sin(a) * 12); ctx.lineTo(p.x + Math.cos(a) * 17, p.y - 22 + Math.sin(a) * 17); ctx.stroke(); } }
    },
    // ya despertó: la persecución arranca de una vez, desde donde quedaron los dos en la toma
    entrega(S) { const o = S.Obj; if (!o || o.k !== 'golemPersigue') return; o.espera = 1.1; o.x = o.j.x = S.gx; Object.assign(CUR.p, { x: L.start.x + 8 + .35 * 135, y: L.start.y, vx: 135, vy: 0, on: true, face: 1 }); },
    foco: S => [S.gx + 12, FLOOR - 50],
  };

  // =====================================================================
  //  3 · LA SERPIENTE DE NUBES: «Kukulkán»
  // =====================================================================
  // camino de la cabeza (Catmull-Rom entre puntos clave)
  function catmull(P, t) {
    let i = 0; while (i < P.length - 2 && t > P[i + 1][0]) i++;
    const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(P.length - 1, i + 2)], u = clamp((t - b[0]) / (c[0] - b[0]), 0, 1), u2 = u * u, u3 = u2 * u;
    const f = k => .5 * ((2 * b[k]) + (-a[k] + c[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * u3);
    return [f(1), f(2)];
  }
  ENTRADAS.serpiente = {
    tCarta: 5.95, corta: [1.6, 4.5],
    cues: [[.2, 'ambiente', 'viento del vacío'], [1.5, 'swell', 'sube Kukulkán'], [3.65, 'golpe', 'se abre el penacho'], [3.85, 'efecto', 'fuego'], [5.95, 'acento', 'carta']],
    inicia(S) {
      const borde = L.camMin + 13.6 * T; S.bx = borde;
      // termina entrando a su vuelta (la del prólogo) por el punto más cercano a Itzel: así el juego sigue sin brinco
      const o = S.Obj && S.Obj.k === 'kukulkan' ? S.Obj : null, ref = o || { cx: L.camMin + 37 * T, cy: 104, rx: 22 * T, ry: 58, vel: .26 };
      const H = []; for (let k = 0; k < 400; k++) { const a = Math.PI + k * ref.vel / 60; H.push([ref.cx + Math.cos(a) * ref.rx, ref.cy + Math.sin(a) * ref.ry]); }
      S.hist = H; S.final = [];
      let k = 0, acc = 0; for (let i = 0; i < 12; i++) { while (k < H.length - 1 && acc < i * 11) { acc += Math.hypot(H[k][0] - H[k + 1][0], H[k][1] - H[k + 1][1]); k++; } S.final.push(H[k].slice()); }
      S.camino = [[1.3, borde + 120, 300], [2.0, borde + 90, 110], [2.55, borde - 20, 40], [3.05, borde - 150, 70], [3.45, borde - 90, 115], [3.85, borde + 20, 92], [4.55, borde + 90, 76], [5.25, borde + 150, 48], [5.95, H[0][0], H[0][1]]];
    },
    paso(S, t, dt) {
      const p = CUR.p, st = L.start, J = S.J, fr = CUR.fre, bx = S.bx;
      // Itzel llega a la orilla, se asoma; luego mira a Fresita, que asiente
      const anda = tramo(t, 0, 1.3, 'out2');
      let face = 1; if (t > 4.75 && t < 5.15) face = -1;
      Object.assign(p, { x: lerp(st.x, bx - 12, anda), y: st.y, on: true, face, vx: anda < 1 ? 90 * (1 - anda) : 0, vy: 0, vis: true, inv: 0 }); p.run += Math.abs(p.vx) * dt * .16;
      p.sq = t > 5.35 && t < 5.6 ? Math.sin((t - 5.35) / .25 * Math.PI) * .15 : 0;
      if (fr) { const asiente = t > 4.95 && t < 5.45 ? Math.abs(Math.sin((t - 4.95) / .25 * Math.PI)) * 5 : 0; Object.assign(fr, { x: p.x - 18, y: p.y - 30 + asiente + Math.sin(t * 2.6) * 2, face: 1 }); }
      // la serpiente: la cabeza sigue su camino y el cuerpo la sigue (como en el juego)
      const seg = J.seg, h = t < 1.3 ? [bx + 120, 340] : catmull(S.camino, t);
      if (!S.cuerpo || t < S.tUlt) { for (let i = 0; i < seg.length; i++) { seg[i].x = h[0]; seg[i].y = h[1] + i * 9; } }
      S.tUlt = t; seg[0].x = h[0]; seg[0].y = h[1]; S.cuerpo = true;
      for (let i = 1; i < seg.length; i++) { const a = seg[i - 1], b = seg[i], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, L2 = 9 - i * .3; if (d > L2) { b.x = a.x + (b.x - a.x) / d * L2; b.y = a.y + (b.y - a.y) / d * L2; } }
      // al final se acomoda donde la espera el prólogo
      if (S.final && t > 5.3) { const u = tramo(t, 5.3, 5.95); for (let i = 1; i < seg.length && i < S.final.length; i++) { seg[i].x = lerp(seg[i].x, S.final[i][0], u); seg[i].y = lerp(seg[i].y, S.final[i][1], u); } }
      J.x = seg[0].x; J.y = seg[0].y; J.face = Math.sign(seg[0].x - seg[1].x) || 1; J.t = t; J.stunT = 0;
      J.st = t > 3.6 && t < 3.8 ? 'ventana' : 'ataque'; J.atk = t > 3.8 && t < 4.5 ? 'fuego' : 'picada'; J.flash = t > 3.6 && t < 3.7 ? .3 : 0;
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.06], [1.4, 1]]), fx: p.x + 60, fy: 110, nit: false };
      else if (t < 3.1) S.cam = { x: clamp(seg[0].x - 230, L.camMin, L.camMax), z: 1.08, fx: seg[0].x, fy: seg[0].y, nit: true, dof: .1 };
      else if (t < 4.55) S.cam = { x: clamp(seg[0].x - 230, L.camMin, L.camMax), z: claves(t, [[3.1, 1.2], [3.75, 2.9, 'io3'], [4.55, 3.1]]), fx: seg[0].x, fy: seg[0].y, nit: true, dof: .75 };
      else S.cam = { x: clamp(lerp(seg[0].x - 230, L.camMin, tramo(t, 4.55, 5.2)), L.camMin, L.camMax), z: claves(t, [[4.55, 1.3], [5.95, 1.38]]), fx: p.x + 50, fy: p.y - 46, nit: true, dof: .3 };
      if (t > 3.6 && t < 4.5) S.sacude = 2.5;
    },
    atras(ctx, S, t) {
      // plumas de quetzal que bajan girando
      for (let i = 0; i < 10; i++) {
        const f = (t * .32 + hash1(i, 1)) % 1, x = S.bx - 140 + hash1(i, 2) * 260 + Math.sin(t * 1.6 + i) * 12, y = -10 + f * 220, a = Math.sin(t * 2 + i) * .9;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = Math.min(1, (1 - f) * 3) * .9;
        if (String(view.st.id).split('~')[0] === 'acuarela' && plumaKukulkan.complete && plumaKukulkan.naturalWidth) ctx.drawImage(plumaKukulkan, -4, -7, 8, 14);
        else { ctx.strokeStyle = '#1f8a5a'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke();
          ctx.fillStyle = i % 3 ? '#3fbf7a' : '#2fa36a'; ctx.beginPath(); ctx.ellipse(0, -.5, 1.8, 4.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = S.J.pal.core; ctx.beginPath(); ctx.arc(0, -3, .8, 0, TAU); ctx.fill(); }
        ctx.restore();
      }
    },
    // el fuego: una línea de lumbre que cruza el cielo, con chispas que caen
    frente(ctx, S, t) {
      if (t < 3.8 || t > 4.9) return;
      const h = S.J.seg[0], n = S.J.seg[1], a = Math.atan2(h.y - n.y, h.x - n.x), sale = tramo(t, 3.8, 4.1), apaga = tramo(t, 4.45, 4.9);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (String(view.st.id).split('~')[0] === 'acuarela' && fuegoKukulkan.complete && fuegoKukulkan.naturalWidth) {
        const alto = 50 * Math.max(.2, sale);
        ctx.translate(h.x, h.y); ctx.rotate(a); ctx.globalAlpha = 1 - apaga; ctx.drawImage(fuegoKukulkan, 0, -alto / 2, Math.max(.1, 150 * sale), alto);
      } else for (let i = 0; i < 40; i++) {
        const f = ((t - 3.8) * 2.2 + i / 40) % 1; if (f > sale * 1.2) continue;
        const d = 12 + f * 150, w = (2 + f * 14) * (1 - apaga), x = h.x + Math.cos(a) * d + Math.sin(i * 7 + t * 20) * f * 6, y = h.y + Math.sin(a) * d + Math.cos(i * 5 + t * 18) * f * 6 + f * f * 10;
        ctx.globalAlpha = (1 - f) * (1 - apaga); glowDot(ctx, x, y, w, f < .3 ? '#fff0a0' : f < .6 ? '#ffa02e' : '#ff4a1a', .9);
      }
      ctx.restore();
      ctx.fillStyle = '#ffb040'; for (let i = 0; i < 16; i++) { const f = ((t - 3.9) * 1.4 + hash1(i, 4)) % 1; if (t < 3.9) continue; const x = h.x + Math.cos(a) * (30 + hash1(i, 5) * 110), y = h.y + Math.sin(a) * (30 + hash1(i, 5) * 110) + f * 90; ctx.globalAlpha = (1 - f) * (1 - apaga * .5); ctx.fillRect(x, y, 1.2, 1.6); }
      ctx.globalAlpha = 1;
    },
    foco: S => [S.J.seg[0].x + 14, S.J.seg[0].y + 4],
    entrega(S) { const o = S.Obj; if (o && o.k === 'kukulkan') { o.a = Math.PI; o.hist = S.hist.map(q => q.slice()); o.j.seg.forEach((q, i) => { q.x = S.final[i][0]; q.y = S.final[i][1]; }); } },
  };

  // =====================================================================
  //  4 · EL JAGUAR: «Ojos en el zacatal»
  // =====================================================================
  // el zacate que va delante del jaguar (el mismo trazo del juego) para que asome entre las hojas
  function zacateDelante(ctx, Z, x0, x1, t, mueve) {
    for (let x = Z.x0 + 2; x < Z.x1 - 1; x += 3) {
      if (x < x0 || x > x1) continue;
      const h = 16 + ((x * 7) % 9), sw = Math.sin(t * 2 + x * .3) * 1.5 + (mueve ? Math.sin(t * 40 + x) * 3 * mueve : 0);
      ctx.strokeStyle = (x % 2 ? '#4f7a2a' : '#6a9a3a'); ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, Z.y); ctx.quadraticCurveTo(x + sw * .5, Z.y - h * .6, x + sw, Z.y - h); ctx.stroke();
    }
  }
  const HOJA = ['#4f7a2a', '#6a9a3a', '#8ab84a'];
  ENTRADAS.jaguar = {
    tCarta: 5.95, corta: [1.9, 4.75],
    cues: [[.9, 'silencio', 'se callan las chicharras'], [2.05, 'golpe', 'ojos en el zacate'], [2.8, 'swell', 'asoma el jaguar'], [4.6, 'golpe', 'cae el jaguar'], [5.3, 'acento', 'ruge'], [5.95, 'acento', 'carta']],
    inicia(S) {
      const st = L.start; S.Z = (CUR.objs || []).find(o => o.k === 'zacatal' && o.x0 > st.x + 40) || { x0: st.x + 280, x1: st.x + 390, y: FLOOR };
      S.ex = S.Z.x0 + 30; S.px = Math.min(st.x + 100, S.Z.x0 - 150); S.salta = S.px; S.atras = S.px - 34;
    },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre, Z = S.Z;
      // Itzel entra y se detiene; brinca hacia atrás cuando salta el jaguar
      const anda = tramo(t, 0, 1.3, 'out2');
      let x = lerp(S.px - 120, S.px, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 90 * (1 - anda) : 0;
      if (t > 4.15) { const u = tramo(t, 4.15, 4.5, 'lin'); [x, y] = arco(u, S.px, FLOOR, S.atras, FLOOR, 18); on = u >= 1; vy = u < .5 ? -160 : 160; }
      Object.assign(p, { x, y, on, vx, vy, face: 1, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = t > 3.55 && t < 3.75 ? Math.sin((t - 3.55) / .2 * Math.PI) * .12 : t > 4.5 && t < 4.7 ? .25 * (1 - (t - 4.5) / .2) : 0;
      // Fresita: se adelanta por encima del zacate, le brillan los ojos abajo y regresa de un jalón
      if (fr) {
        const casa = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2], sobre = [Z.x0 + 46, Z.y - 36 + Math.sin(t * 3) * 2];
        let q = casa;
        if (t > 1.45 && t < 2.3) { const u = EASE.io2(tramo(t, 1.45, 2.0, 'lin')); q = [lerp(casa[0], sobre[0], u), lerp(casa[1], sobre[1], u)]; }
        else if (t >= 2.3 && t < 2.75) { const u = EASE.out3(tramo(t, 2.3, 2.75, 'lin')); q = [lerp(sobre[0], casa[0] + 6, u), lerp(sobre[1], casa[1] - 4, u) - 6 * Math.sin(u * Math.PI)]; }
        else if (t >= 2.75 && t < 4.1) q = [casa[0] + 6, casa[1] - 4]; // pegadita a Itzel
        if (t > .9 && t < 1.45) q = [casa[0] + 4, casa[1] - 2]; // se detiene en el aire
        if (t > 5.3) q = [q[0] - 6 * tramo(t, 5.3, 5.45), q[1]]; // el rugido la empuja
        Object.assign(fr, { x: q[0], y: q[1], face: t > 2.3 && t < 2.75 ? -1 : 1 });
      }
      // el jaguar: escondido, asoma agachado, salta y ruge
      S.oculto = t < 2.8;
      let jx = S.ex, jy = FLOOR + 12 * (1 - EASE.out2(tramo(t, 2.8, 3.6, 'lin'))), atk = 'acecho', at = t, crouch = true;
      if (t > 4.05) { const u = tramo(t, 4.05, 4.6, 'lin'); jx = lerp(S.ex, S.salta, EASE.io2(u)); jy = FLOOR - Math.sin(u * Math.PI) * 46; crouch = false; atk = 'garras'; at = 1; }
      if (t > 5.3) { atk = 'rugido'; at = .4 + (t - 5.3) * 1.2; }
      Object.assign(J, { x: jx, y: jy, face: -1, t, at, st: 'ataque', atk, saltoCine: t > 4.05 && t < 4.7 ? t - 4.05 : null, cineAcecho: t >= 2.8 && t < 4.05, cineAterriza: t >= 4.6 && t < 5.3, crouch: crouch && t < 4.05, stunT: 0, flash: 0 });
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.08], [1.4, 1.02]]), fx: lerp(p.x, Z.x0, .45), fy: FLOOR - 26, nit: false };
      else if (t < 2.8) S.cam = { x: L.camMin, z: 1.3, fx: lerp(p.x + 40, fr ? fr.x : Z.x0, .5), fy: FLOOR - 34, dof: .15, nit: true };
      else if (t < 4.05) S.cam = { x: L.camMin, z: claves(t, [[2.8, 2.5], [4.05, 2.85, 'io2']]), fx: S.ex - 4, fy: FLOOR - 14, dof: .75, nit: true };
      else if (t < 5.3) S.cam = { x: L.camMin, z: claves(t, [[4.05, 1.45], [5.3, 1.35]]), fx: lerp(S.ex, (S.salta + S.atras) / 2, EASE.io2(tramo(t, 4.05, 4.5, 'lin'))), fy: FLOOR - 30, dof: .2, nit: true };
      else S.cam = { x: L.camMin, z: claves(t, [[5.3, 1.85], [5.95, 2.0]]), fx: lerp(S.salta, S.atras, .35), fy: FLOOR - 26, dy: -10, dof: .3, nit: true };
      if (t > 4.6 && t < 4.95) S.sacude = 4 * (1 - tramo(t, 4.6, 4.95)); if (t > 5.3) S.sacude = 2.2;
    },
    frente(ctx, S, t) {
      const Z = S.Z, J = S.J, ct = CUR.t;
      // la parvada que sale del zacate
      if (t > .95 && t < 2.2) {
        ctx.strokeStyle = '#2b2620'; ctx.lineWidth = .9; ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const f = t - .95 - i * .05; if (f < 0) continue; const x = Z.x0 + 20 + hash1(i, 1) * (Z.x1 - Z.x0 - 30) - f * (40 + hash1(i, 2) * 40), y = Z.y - 14 - f * (70 + hash1(i, 3) * 40), a = Math.sin(t * 22 + i) * 2.2; ctx.beginPath(); ctx.moveTo(x - 3, y - a); ctx.lineTo(x, y); ctx.lineTo(x + 3, y - a); ctx.stroke(); }
      }
      // los ojos en el zacate: siguen a Fresita
      if (t > 2.05 && t < 2.95) {
        const a = tramo(t, 2.05, 2.2) * (1 - tramo(t, 2.75, 2.95)), fx = CUR.fre ? CUR.fre.x : S.ex, ex = clamp(fx, Z.x0 + 10, Z.x1 - 10) * .5 + S.ex * .5;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const d of [-3, 3]) glowDot(ctx, ex + d, Z.y - 10, 4, '#ffe24a', .9 * a); ctx.restore();
      }
      // al asomar, sus ojos brillan entre las hojas
      if (t > 2.8 && t < 4.1) { const a = tramo(t, 2.9, 3.3) * (1 - tramo(t, 3.95, 4.1)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, J.x - 16.2, J.y - 13.4, 3.4, '#ffe24a', .8 * a); ctx.restore(); }
      // el zacate delante de él mientras está escondido (y se mueve cuando asoma)
      if (t < 4.1) zacateDelante(ctx, Z, S.ex - 26, S.ex + 30, ct, t > 2.8 ? .5 * (1 - tramo(t, 3.4, 3.9)) : 0);
      // hojas y polvo al caer
      if (t > 4.55) {
        for (let i = 0; i < 16; i++) {
          const f = (t - 4.55) * (.8 + hash1(i, 4) * .6); if (f > 1.4) continue;
          const x = S.salta + (hash1(i, 5) - .5) * 30 + (hash1(i, 6) - .5) * f * 90, y = FLOOR - 4 - f * (50 + hash1(i, 7) * 30) + f * f * 50;
          ctx.save(); ctx.translate(x, y); ctx.rotate(f * 8 + i); ctx.globalAlpha = 1 - f / 1.4; if (String(view.st.id).split('~')[0] === 'acuarela' && hojaJaguar.complete && hojaJaguar.naturalWidth) ctx.drawImage(hojaJaguar, 150, 125, 1540, 635, -2.8, -1.2, 5.6, 2.4); else { ctx.fillStyle = HOJA[i % 3]; ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 1, 0, 0, TAU); ctx.fill(); } ctx.restore();
        }
        const d = tramo(t, 4.6, 5.3); if (d < 1) { if (String(view.st.id).split('~')[0] === 'acuarela' && polvoJaguar.complete && polvoJaguar.naturalWidth) { const w = 30 + d * 28, h = 8 + d * 6; ctx.save(); ctx.globalAlpha = .65 * (1 - d); ctx.drawImage(polvoJaguar, 140, 175, 1600, 510, S.salta - w / 2, FLOOR - h, w, h); ctx.restore(); } else { ctx.fillStyle = `rgba(190,170,130,${.45 * (1 - d)})`; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(S.salta + s * (8 + d * 22), FLOOR - 3 - d * 4, 7 + d * 8, 3 + d * 3, 0, 0, TAU); ctx.fill(); } } }
      }
      // el rugido: ondas y hojas hacia Itzel
      if (t > 5.3) {
        const u = t - 5.3, bx = J.x - 18, by = J.y - 13;
        ctx.strokeStyle = 'rgba(255,240,210,.75)'; for (let k = 0; k < 4; k++) { const r = 8 + ((u * 70 + k * 12) % 48); ctx.globalAlpha = 1 - r / 56; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx, by, r, Math.PI - .65, Math.PI + .65); ctx.stroke(); }
        ctx.globalAlpha = 1;
        for (let i = 0; i < 10; i++) { const f = (u * 1.4 + hash1(i, 9)) % 1, x = bx - f * 110, y = by + (hash1(i, 10) - .5) * 40 * (1 + f); ctx.save(); ctx.translate(x, y); ctx.rotate(f * 9); ctx.globalAlpha = 1 - f; if (String(view.st.id).split('~')[0] === 'acuarela' && hojaJaguar.complete && hojaJaguar.naturalWidth) ctx.drawImage(hojaJaguar, 150, 125, 1540, 635, -3, -1.3, 6, 2.6); else { ctx.fillStyle = HOJA[i % 3]; ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 1.1, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
      }
    },
    entrega(S) { Object.assign(CUR.p, { x: S.atras, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: S.atras - 16, y: FLOOR - 30 }); }, // el jaguar ya está escondido en su zacatal (lo pone el prólogo)
    foco: S => [S.J.x - 4, S.J.y - 16],
  };

  // =====================================================================
  //  5 · LA REINA DE LAS HADAS: «Se llevan a Fresita»
  //  Su prólogo no la trae (Itzel va sola y Fresita espera en la jaula):
  //  se hace una reina solo para la toma, con su cuerpo y el arte del mundo.
  // =====================================================================
  const HADITAS = 7;
  const burbujaHadas = new Image();
  burbujaHadas.src = '../Roguelike/assets/bosque/piezas/burbuja.png';
  function burbuja(ctx, x, y, r, a) {
    if (burbujaHadas.complete && burbujaHadas.naturalWidth) {
      // El centro de la ilustración tiene color: la transparencia deja ver
      // a Fresita mientras conserva el borde y los reflejos de la burbuja.
      ctx.save(); ctx.globalAlpha = .42 * a; ctx.drawImage(burbujaHadas, x - r, y - r, r * 2, r * 2); ctx.restore(); return;
    }
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,214,246,.16)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .8; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,150,220,.5)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r - 1.2), .4, 2.2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * .45, y - r * .5, r * .22, r * .1, -.7, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ENTRADAS.hadas = {
    tCarta: 5.95, corta: [1.5, 5.0],
    cues: [[.3, 'ambiente', 'campanitas'], [1.45, 'silencio', 'se detienen las lucecitas'], [1.6, 'swell', 'baja la reina'], [3.3, 'golpe', 'señala a Fresita'], [3.7, 'efecto', 'risitas, espiral de hadas'], [4.6, 'golpe', 'Itzel no la alcanza'], [5.95, 'acento', 'carta']],
    crea(S) {
      const st = L.start; S.px = st.x + 62; S.qx = S.px + 124;
      return FASES_UTIL.falso('hadas', NIVELES[curStyle().id], { x: S.qx, y: -60, st: 'entra', minis: [], reflejos: [], jaula: null });
    },
    inicia(S) {
      S.hadas = Array.from({ length: HADITAS }, (_, i) => ({ anim: i * 1.7, bx: S.px - 70 + hash1(i, 21) * 260, by: 70 + hash1(i, 22) * 70 }));
    },
    // la reina y la burbuja de Fresita en el tiempo t (también para la estela de polvo)
    reina(S, t) {
      const baja = EASE.out3(tramo(t, 1.6, 2.6, 'lin')), va = EASE.io2(tramo(t, 5.0, 6.2, 'lin'));
      return [S.qx + Math.sin(t * .9) * 4 + va * 60, lerp(-60, 82, baja) + Math.sin(t * 1.6) * 3 * baja - va * 12];
    },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre;
      // Itzel entra riéndose; luego brinca por la burbuja y no la alcanza
      const anda = tramo(t, 0, 1.3, 'out2');
      let x = lerp(S.px - 70, S.px, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 70 * (1 - anda) : 0;
      if (t > 4.35) { const u = tramo(t, 4.35, 4.85, 'lin'); [x, y] = arco(u, S.px, FLOOR, S.px + 22, FLOOR, 30); on = u >= 1; vy = u < .5 ? -220 : 200; }
      Object.assign(p, { x, y, on, vx, vy, face: 1, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = t > .8 && t < 1.1 ? Math.sin((t - .8) / .3 * Math.PI) * .1 : t > 4.85 && t < 5.05 ? .25 * (1 - (t - 4.85) / .2) : t > 5.25 && t < 5.5 ? Math.sin((t - 5.25) / .25 * Math.PI) * .14 : 0;
      // la reina
      const [rx, ry] = ENTRADAS.hadas.reina(S, t);
      Object.assign(J, { x: rx, y: ry, t, at: t, st: t < 2.6 ? 'entra' : 'ataque', atk: 'secuestro', stunT: 0, flash: 0 });
      S.giro = t > 2.2 && t < 2.6 ? .14 * Math.sin(tramo(t, 2.2, 2.6) * Math.PI) : t > 3.15 && t < 3.7 ? -.16 * Math.sin(tramo(t, 3.15, 3.7) * Math.PI) : 0;
      // Fresita: persigue una lucecita, se queda viendo a la reina, la envuelven y se la llevan en una burbuja
      if (fr) {
        const h = S.hadas[0], hx = p.x + 30 + Math.cos(t * 3.2) * 26, hy = p.y - 40 + Math.sin(t * 6.4) * 9;
        let q = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2];
        if (t > .3 && t < 1.45) { const u = tramo(t, .3, .6); q = [lerp(q[0], hx - 10, u), lerp(q[1], hy + 2, u)]; }
        else if (t >= 1.45 && t < 3.7) q = [lerp(p.x + 18, p.x + 14, tramo(t, 1.45, 2)), p.y - 34 + Math.sin(t * 2.6) * 1.5];
        else if (t >= 3.7) {
          const f0 = [p.x + 14, p.y - 36], b1 = [rx - 30, ry + 14], u = EASE.io2(tramo(t, 4.15, 5.0, 'lin')), alza = tramo(t, 3.7, 4.15, 'out2') * 8;
          q = [lerp(f0[0], b1[0], u), lerp(f0[1] - alza, b1[1], u)];
          if (t > 5.0) { const [rx2, ry2] = ENTRADAS.hadas.reina(S, t); q = [rx2 - 30, ry2 + 14]; }
        }
        S.hx = hx; S.hy = hy; h.persigue = t > .3 && t < 1.45;
        Object.assign(fr, { x: q[0], y: q[1], face: t > .3 && t < 1.45 ? Math.sign(Math.cos(t * 3.2 - 1.6)) || 1 : 1 });
      }
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.1], [1.4, 1.04]]), fx: p.x + 60, fy: FLOOR - 50, nit: false };
      else if (t < 2.6) S.cam = { x: L.camMin, z: claves(t, [[1.4, 1.25], [2.6, 1.4, 'io2']]), fx: lerp(p.x + 40, rx, .6), fy: lerp(FLOOR - 70, ry + 18, tramo(t, 1.4, 2.6)), dof: .15, nit: true };
      else if (t < 3.7) S.cam = { x: L.camMin, z: claves(t, [[2.6, 2.9], [3.7, 3.2, 'io2']]), fx: rx - 2, fy: ry - 8, dof: .8, nit: true };
      else if (t < 5.0) S.cam = { x: L.camMin, z: claves(t, [[3.7, 1.12], [5.0, 1.08]]), fx: lerp(p.x, rx, .5), fy: lerp(FLOOR - 25, ry - 16, .5), dof: .15, nit: true };
      else S.cam = { x: L.camMin, z: claves(t, [[5.0, 1.08], [5.95, 1.3, 'io2']]), fx: lerp(p.x, rx, .5), fy: lerp(FLOOR - 25, ry - 16, .5), dof: .15, nit: true };
      if (t > 3.3 && t < 3.5) S.sacude = 1.4;
    },
    atras(ctx, S, t) {
      // la estela de polvo de estrellas de la reina
      if (t < 1.6) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 1; k < 26; k++) { const tk = t - k * .045; if (tk < 1.6) break; const [x, y] = ENTRADAS.hadas.reina(S, tk), a = (1 - k / 26) * .6; glowDot(ctx, x + Math.sin(k * 2.3 + t) * 3, y + 8 + k * .8, 2.2, k % 3 ? '#ffd6f4' : '#fff6c8', a); }
      ctx.restore();
    },
    frente(ctx, S, t) {
      const fr = CUR.fre, J = S.J, ct = CUR.t, FD = MEC.FD;
      // las lucecitas (haditas del juego): flotan, se detienen, envuelven a Fresita y se van con ella
      for (let i = 0; i < S.hadas.length; i++) {
        const h = S.hadas[i]; let x = h.bx + Math.sin(ct * 1.3 + i) * 10, y = h.by + Math.cos(ct * 1.7 + i * 2) * 6;
        if (t > 1.45) { const quieto = Math.min(t, 1.45); x = h.bx + Math.sin(quieto * 1.3 + i) * 10 + Math.sin(t * 8 + i) * .4; y = h.by + Math.cos(quieto * 1.7 + i * 2) * 6; }
        if (i === 0 && t > .3 && t < 1.45) { x = S.hx; y = S.hy; }
        if (fr && t > 1.45) { const mira = tramo(t, 1.5, 2.2) * .15; x = lerp(x, fr.x, mira); y = lerp(y, fr.y, mira); }
        if (fr && t > 3.7) { const u = EASE.io2(tramo(t, 3.7 + i * .04, 4.2 + i * .04, 'lin')), a = i / S.hadas.length * TAU + t * 5, r = lerp(40, 14, u); x = lerp(x, fr.x + Math.cos(a) * r, u); y = lerp(y, fr.y - 2 + Math.sin(a) * r * .6, u); }
        ctx.save(); ctx.translate(x, y + 5); FD.hadita(ctx, h, ct); ctx.restore();
      }
      // el polvo de la varita
      if (t > 2.7 && t < 3.9) { const tip = [J.x + 13, J.y - 14]; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 14; i++) { const f = ((t - 2.7) * 1.5 + hash1(i, 31)) % 1, x = tip[0] + (hash1(i, 32) - .5) * 16 * f, y = tip[1] + f * 22; glowDot(ctx, x, y, 1.6, i % 2 ? '#ffd6f4' : '#fff6c8', 1 - f); }
        if (t > 3.3) { const k = tramo(t, 3.3, 3.75); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; glowDot(ctx, tip[0] + Math.cos(a) * k * 18, tip[1] + Math.sin(a) * k * 18, 1.8, '#ffffff', 1 - k); } }
        ctx.restore(); }
      // la burbuja
      if (fr && t > 4.0) { const r = 13 * EASE.outBack(tramo(t, 4.0, 4.3, 'lin')); burbuja(ctx, fr.x, fr.y - 2, Math.max(.1, r), 1); }
    },
    entrega(S) { Object.assign(CUR.p, { x: S.px + 22, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); }, // Fresita ya está en la jaula (la regresa el prólogo)
    foco: S => [S.J.x - 10, S.J.y - 2],
  };

  // =====================================================================
  //  6 · EL COCODRILO DEL CENOTE: «Burbujas en el río»
  //  El río lo pinta su prólogo (objeto «rio»), así que se queda en el mundo;
  //  el cocodrilo se dibuja encima y lo que queda bajo el agua se ve apenas.
  //  La mordida va en cámara lenta: el guion corre en su propio tiempo (s).
  // =====================================================================
  const AGUA = FLOOR + 8;
  const salpiconRio = new Image(), gotaRio = new Image();
  salpiconRio.src = '../Roguelike/assets/cenote/salpica.png';
  gotaRio.src = '../Roguelike/assets/golfo/salpica0.png';
  const LENTO = [3.0, 3.6, .3]; // de 3.0 a 3.6 s el tiempo corre al 30%
  const tiempoRio = t => t < LENTO[0] ? t : t < LENTO[1] ? LENTO[0] + (t - LENTO[0]) * LENTO[2] : LENTO[0] + (LENTO[1] - LENTO[0]) * LENTO[2] + (t - LENTO[1]);
  ENTRADAS.cocodrilo = {
    tCarta: 5.95, cartaEn: 4.55, corta: [1.5, 5.1], dejaObj: true,
    cues: [[.2, 'ambiente', 'agua y ranas'], [1.45, 'swell', 'burbujas'], [3.0, 'golpe', 'la mordida (cámara lenta)'], [3.95, 'efecto', 'rugido y chorro'], [5.0, 'silencio', 'solo los ojos'], [5.95, 'acento', 'carta']],
    inicia(S) {
      const st = L.start, R = S.Obj, tr = R && R.tramos ? R.tramos[0] : [15, 36];
      S.r0 = MEC.tx(tr[0]); S.r1 = MEC.tx(tr[1] + 1); S.orilla = S.r0 - 14;
      S.troncos = CUR.plats.filter(pl => pl.look === 'tronco').map(pl => ({ pl, t0: pl.t || 0 }));
      S.tr = S.troncos.find(q => q.pl.x0 >= S.r0 && q.pl.x0 < S.r1) || S.troncos[0];
    },
    paso(S, t, dt) {
      const s = tiempoRio(t), p = CUR.p, J = S.J, fr = CUR.fre, R = S.Obj;
      S.s = s; S.ritmo = t > LENTO[0] && t < LENTO[1] ? LENTO[2] : 1;
      if (R) R.mordida = null; // el río del prólogo no muerde durante la toma
      // los troncos siguen flotando de un lado a otro; el mordido se hunde
      for (const q of S.troncos) { const pl = q.pl; pl.t = q.t0 + s; pl.x = pl.x0 + Math.sin(pl.t * (pl.sp || 1) + (pl.ph || 0)) * (pl.amp || 30); pl.y = pl.y0; pl.on = true; }
      const tr = S.tr && S.tr.pl, logX = tr ? tr.x : S.r0 + 40, logW = tr ? tr.w : 64;
      if (S.bx == null || s < 2.98) S.bx = logX + logW / 2;
      if (tr && s > 2.98) { tr.x = S.bx - logW / 2; if (s > 3.06) { tr.y = tr.y0 + Math.min(44, (s - 3.06) * 70); tr.on = tr.y < tr.y0 + 14; } }
      // Itzel: llega a la orilla, sube al tronco, Fresita la jala de regreso; se moja con el chorro
      const anda = tramo(s, 0, 1.3, 'out2');
      let x = lerp(S.orilla - 120, S.orilla, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 90 * (1 - anda) : 0, face = 1;
      if (s > 2.6 && s < 2.95) { const u = tramo(s, 2.6, 2.82, 'lin'); [x, y] = arco(u, S.orilla, FLOOR, logX + 10, tr ? tr.y0 : FLOOR - 16, 10); on = u >= 1; if (u >= 1) x = logX + 10; }
      else if (s >= 2.95) { const u = tramo(s, 2.95, 3.15, 'lin'), x0 = S.bx - logW / 2 + 10; [x, y] = arco(u, x0, tr ? tr.y0 : FLOOR - 16, S.orilla, FLOOR, 14); on = u >= 1; face = u < 1 ? -1 : 1; vy = u < .5 ? -150 : 150; }
      Object.assign(p, { x, y, on, vx, vy, face, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = s > 4.45 && s < 4.75 ? Math.sin((s - 4.45) / .3 * Math.PI) * .22 : s > 3.15 && s < 3.3 ? .2 * (1 - (s - 3.15) / .15) : 0;
      // Fresita: se mira en el agua y hace caras; jala a Itzel de la coleta; se sacude el agua
      if (fr) {
        let q = [p.x - 16, p.y - 30 + Math.sin(s * 2.6) * 2], fc = 1;
        if (s > .35 && s < 1.5) { const u = EASE.io2(tramo(s, .35, .8, 'lin')) * (1 - EASE.io2(tramo(s, 1.25, 1.5, 'lin'))); q = [lerp(q[0], S.r0 + 22, u), lerp(q[1], AGUA - 16 + Math.sin(s * 9) * 1.5, u)]; fc = Math.floor(s * 3.2) % 2 ? -1 : 1; }
        if (s > 2.78 && s < 3.2) { const u = tramo(s, 2.78, 2.92); q = [lerp(q[0], p.x - 6, u), lerp(q[1], p.y - 26, u)]; fc = -1; }
        if (s > 4.55 && s < 4.85) q[0] += Math.sin(s * 70) * 2.2;
        Object.assign(fr, { x: q[0], y: q[1], face: fc });
      }
      // el cocodrilo: cresta bajo el agua, mordida, se levanta, escupe y se hunde hasta los ojos
      const bur = EASE.io2(tramo(s, 1.4, 2.5, 'lin')), frente = lerp(S.r1 - 40, S.bx, bur);
      S.frenteBur = frente;
      let cx = S.bx, dy = 30, erg = 0, mord = 0, oculto = true, f = -1;
      if (s > 1.7 && s < 2.35) { cx = frente + 18; dy = 20 + 8 * (1 - Math.sin(tramo(s, 1.7, 2.35) * Math.PI)); oculto = false; }
      if (s > 2.98 && s < 3.5) { mord = s < 3.1 ? EASE.out3(tramo(s, 2.98, 3.1, 'lin')) : 1 - EASE.in2(tramo(s, 3.35, 3.5, 'lin')); dy = 8; oculto = mord <= 0; }
      if (s >= 3.45) { oculto = false; mord = 0; dy = lerp(32, 10, EASE.outBack(tramo(s, 3.45, 3.85, 'lin'))); erg = .5 * EASE.io2(tramo(s, 3.85, 4.1, 'lin')) * (1 - EASE.io2(tramo(s, 4.6, 4.9, 'lin'))); if (s > 4.7) dy = lerp(10, 19, EASE.io2(tramo(s, 4.7, 5.4, 'lin'))); }
      S.oculto = oculto; S.dyJefe = dy; S.agua = AGUA;
      // La hoja de mordida usa los tiempos del ataque del juego (1.82–2.4),
      // no los segundos del guion: así recorre sus cuadros en cámara lenta.
      const atMordida = mord > 0 ? lerp(1.82, 2.4, tramo(s, 2.98, 3.5, 'lin')) : s, escupe = s >= 3.85 && s < 4.55;
      Object.assign(J, { x: cx, face: f, t: s, at: atMordida, st: 'ataque', atk: escupe ? 'escupe' : 'emboscada', sub: 0, erg, mordida: mord, cineAgua: AGUA, stunT: 0, flash: 0 });
      // la boca (para el chorro), con el giro del cuerpo al levantarse
      const th = -erg * 1.2; S.boca = [cx + f * (30 * Math.cos(th) + 6 * Math.sin(th)), FLOOR + dy + 30 * Math.sin(th) - 6 * Math.cos(th)];
      S.ojo = [cx + f * 17, FLOOR + dy - 12.5];
      // cámara (en el tiempo del guion)
      if (s < 1.4) S.cam = { x: L.camMin, z: claves(s, [[0, 1.08], [1.4, 1.02]]), fx: lerp(p.x, S.r0 + 60, .5), fy: FLOOR - 20, nit: false };
      else if (s < 2.6) S.cam = { x: clamp(frente - VW / 2, L.camMin, L.camMax), z: 2.0, fx: frente - 8, fy: AGUA - 4, dof: .5, nit: true }; // el mundo se pinta donde van las burbujas
      else if (s < 3.28) S.cam = { x: L.camMin, z: claves(s, [[2.6, 1.9], [3.28, 2.15]]), fx: lerp(S.orilla, S.bx, .5), fy: FLOOR - 18, dof: .35, nit: true };
      else if (s < 4.58) S.cam = { x: L.camMin, z: claves(s, [[3.28, 1.55], [4.58, 1.68]]), fx: lerp(S.orilla, S.bx, .55), fy: FLOOR - 26, dy: -8, dof: .25, nit: true };
      else S.cam = { x: L.camMin, z: claves(s, [[4.58, 2.9], [5.53, 3.2, 'io2']]), fx: S.ojo[0] + 6, fy: S.ojo[1] + 2, dof: .8, nit: true };
      if (s > 3.0 && s < 3.25) S.sacude = 3; if (s > 3.55 && s < 3.8) S.sacude = 2.5 * (1 - tramo(s, 3.55, 3.8));
    },
    // el reflejo de Fresita en el agua
    atras(ctx, S, t, V) {
      const fr = CUR.fre, s = S.s; if (!fr || s < .35 || s > 1.5) return;
      ctx.save(); ctx.beginPath(); ctx.rect(S.r0, AGUA + .5, S.r1 - S.r0, 60); ctx.clip();
      ctx.translate(0, AGUA * 2); ctx.scale(1, -1); ctx.globalAlpha = .38;
      const f = { t: CUR.t, cam: CUR.cam, S: V.sx, g: CUR, st: view.st, key: view.st.id + '@cine', y0: V.y0, H: VISTA.H }, ref = Object.assign({}, fr, { y: fr.y + Math.sin(CUR.t * 4) * .6 });
      if (view.st.fresita) view.st.fresita(ctx, ref, f); else drawFresita(ctx, ref, CUR.t, false);
      ctx.restore();
    },
    frente(ctx, S, t) {
      const s = S.s, ct = CUR.t;
      // la fila de burbujas bajo el agua
      if (s > 1.4 && s < 2.95) {
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = .5;
        for (let k = 0; k < 14; k++) { const x = S.frenteBur + k * 7 + Math.sin(ct * 9 + k) * 2, y = AGUA + 2 + ((ct * 18 + k * 5) % 9); ctx.globalAlpha = (1 - k / 14) * (1 - tramo(s, 2.6, 2.95)); ctx.beginPath(); ctx.arc(x, y, 1.1 + (k % 3) * .3, 0, TAU); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // el salpicón de la mordida (se ve en cámara lenta) y astillas del tronco
      if (s > 3.0 && s < 3.9) {
        const f = s - 3.0;
        if (String(view.st.id).split('~')[0] === 'acuarela' && salpiconRio.complete && salpiconRio.naturalWidth) { const k = tramo(s, 3.0, 3.9); ctx.save(); ctx.globalAlpha = Math.min(1, k * 8) * (1 - k); const w = 18 + k * 35, h = 7 + k * 16; ctx.drawImage(salpiconRio, S.bx - w / 2, AGUA - h, w, h); ctx.restore(); }
        else for (let i = 0; i < 34; i++) { const vx = (hash1(i, 41) - .5) * 160, vy = 120 + hash1(i, 42) * 120, x = S.bx + vx * f, y = AGUA - (vy * f - 260 * f * f); if (y > AGUA + 2) continue; ctx.fillStyle = `rgba(205,236,255,${.9 * (1 - f / .9)})`; ctx.beginPath(); ctx.arc(x, y, .9 + hash1(i, 43) * 1.1, 0, TAU); ctx.fill(); }
        for (let i = 0; i < 8; i++) { const vx = (hash1(i, 44) - .5) * 120, vy = 90 + hash1(i, 45) * 90, x = S.bx + vx * f, y = AGUA - 20 - (vy * f - 260 * f * f); ctx.save(); ctx.translate(x, y); ctx.rotate(f * 14 + i); ctx.globalAlpha = 1 - f / .9; ctx.fillStyle = i % 2 ? '#6a4228' : '#8a5a3a'; ctx.fillRect(-2, -.6, 4, 1.2); ctx.restore(); }
        const k = tramo(s, 3.02, 3.5); ctx.strokeStyle = `rgba(230,245,255,${.8 * (1 - k)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(S.bx, AGUA, 8 + k * 34, 2 + k * 5, 0, 0, TAU); ctx.stroke();
      }
      // el chorro de agua en arco hasta Itzel
      if (s > 4.1 && s < 4.75) {
        const [mx, my] = S.boca, tx = S.orilla + 6, ty = FLOOR - 14;
        for (let i = 0; i < 26; i++) { const u = (s - 4.1) * 2.6 - i * .025; if (u < 0 || u > 1) continue; const [x, y] = arco(u, mx, my, tx, ty, 38), a = .85 * (1 - tramo(s, 4.55, 4.75)); if (String(view.st.id).split('~')[0] === 'acuarela' && gotaRio.complete && gotaRio.naturalWidth) { const w = 3.2 - i * .06; ctx.save(); ctx.globalAlpha = a; ctx.drawImage(gotaRio, x - w / 2, y - w / 2, w, w); ctx.restore(); } else { ctx.fillStyle = `rgba(150,215,255,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.6 - i * .03, 0, TAU); ctx.fill(); } }
        if (s > 4.42) { const k = tramo(s, 4.42, 4.75); for (let i = 0; i < 12; i++) { const a = -Math.PI * (.1 + hash1(i, 46) * .8), d = k * (10 + hash1(i, 47) * 14); ctx.fillStyle = `rgba(190,230,255,${.9 * (1 - k)})`; ctx.beginPath(); ctx.arc(tx + Math.cos(a) * d, ty + Math.sin(a) * d + k * k * 10, 1.1, 0, TAU); ctx.fill(); } }
      }
      // gotitas que Fresita se sacude
      if (CUR.fre && s > 4.55 && s < 5.0) { const k = tramo(s, 4.55, 5.0), fr = CUR.fre; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, d = 6 + k * 14; ctx.fillStyle = `rgba(190,230,255,${.8 * (1 - k)})`; ctx.beginPath(); ctx.arc(fr.x + Math.cos(a) * d, fr.y + Math.sin(a) * d * .7 + k * 6, .8, 0, TAU); ctx.fill(); } }
      // al final, unas burbujas junto a los ojos
      if (s > 5.1) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .4; for (let k = 0; k < 4; k++) { const f = ((s - 5.1) * 1.4 + k * .27) % 1; ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(S.ojo[0] + 8 + k * 3, AGUA + 1 - f * 3, .8 + f * .6, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1; }
    },
    // el prólogo empieza en la orilla, con el tronco en su lugar y el cocodrilo listo para su primera emboscada
    entrega(S) {
      if (S.tr) { const pl = S.tr.pl; pl.y = pl.y0; pl.on = true; pl.apagado = 0; }
      Object.assign(CUR.p, { x: S.orilla, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 });
      if (CUR.fre) Object.assign(CUR.fre, { x: S.orilla - 16, y: FLOOR - 30 });
    },
    foco: S => [S.ojo[0] + 4, S.ojo[1] - 4],
  };

  // =====================================================================
  //  7 · LORENCILLO: «La niebla sobre la muralla»
  // =====================================================================
  const loroCine = new Image();
  loroCine.src = '../Roguelike/assets/forge/enemigos/loro-v1/processed-v2/sheet-transparent.png';
  const humoCanion = new Image();
  humoCanion.src = '../Roguelike/assets/cinematicas-jefes/lorencillo-humo-v1.webp';
  const NIEBLA = 'rgba(222,230,236,';
  function niebla(ctx, x, y, w, a, t, n = 7) {
    for (let k = 0; k < n; k++) { const px = x + (hash1(k, 61) - .5) * w + Math.sin(t * .7 + k) * 6, py = y + (hash1(k, 62) - .5) * 10, r = 12 + hash1(k, 63) * 14; ctx.fillStyle = NIEBLA + (a * (.25 + hash1(k, 64) * .2)) + ')'; ctx.beginPath(); ctx.ellipse(px, py, r * 1.6, r * .55, 0, 0, TAU); ctx.fill(); }
  }
  function explosion(ctx, x, y, f) {
    if (f < 0 || f > 1.1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 4, 26 * (1 - f * .6), '#ffb02e', .8 * (1 - f)); ctx.restore();
    for (let i = 0; i < 12; i++) { const a = -Math.PI * (.08 + hash1(i, 71) * .84), d = 6 + EASE.out2(Math.min(1, f * 1.4)) * (14 + hash1(i, 72) * 20); ctx.fillStyle = `rgba(90,86,80,${.55 * (1 - f / 1.1)})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y - 4 + Math.sin(a) * d * .8 - f * 10, 3 + f * 6, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 7; i++) { const vx = (hash1(i, 73) - .5) * 120, vy = 80 + hash1(i, 74) * 80; ctx.fillStyle = '#6b655c'; ctx.fillRect(x + vx * f - 1, y - (vy * f - 220 * f * f) - 1, 2, 2); }
  }
  ENTRADAS.pirata = {
    tCarta: 5.95, corta: [1.5, 5.2],
    cues: [[.2, 'ambiente', 'olas y campana'], [.6, 'efecto', 'loro fantasma'], [1.5, 'swell', 'sale el barco de la niebla'], [3.3, 'efecto', 'risa del capitán'], [3.95, 'golpe', 'cañonazos'], [4.7, 'golpe', 'cae la bala'], [5.95, 'acento', 'carta']],
    inicia(S) {
      const st = L.start; S.px = st.x + 70; S.bx = S.px + 165;
      S.miras = [[S.px + 6, 3.95, .75], [S.px + 70, 4.15, .75], [S.px + 118, 4.35, .75]].map(([x, t0, e]) => ({ x, y: L.surfaceY(Math.floor(x / T), 0) * T, t0, espera: e }));
    },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre;
      const anda = tramo(t, 0, 1.3, 'out2');
      let x = lerp(S.px - 90, S.px, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 80 * (1 - anda) : 0;
      if (t > 4.55) { const u = tramo(t, 4.55, 4.9, 'lin'); [x, y] = arco(u, S.px, FLOOR, S.px - 34, FLOOR, 18); on = u >= 1; vy = u < .5 ? -160 : 160; }
      Object.assign(p, { x, y, on, vx, vy, face: 1, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = t > 4.9 && t < 5.1 ? .25 * (1 - (t - 4.9) / .2) : t > 5.45 && t < 5.7 ? Math.sin((t - 5.45) / .25 * Math.PI) * .14 : 0;
      if (fr) { let q = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2]; if (t > 5.2) { const u = tramo(t, 5.2, 5.45); q = [lerp(q[0], p.x - 7, u), lerp(q[1], p.y - 25, u)]; } Object.assign(fr, { x: q[0], y: q[1], face: 1 }); }
      // el barco: sale de la niebla, dispara y pasa por encima de ellas
      const pasa = EASE.io2(tramo(t, 5.0, 5.9, 'lin'));
      const atkBarco = t >= 3.95 && t < 4.7 ? 'canones' : 'navega';
      Object.assign(J, { x: lerp(S.bx, S.px + 24, pasa) + Math.sin(t * .6) * 4, y: lerp(86, 90, pasa) + Math.sin(t * 1.3) * 3, face: -1, t, at: t, st: 'ataque', atk: atkBarco, stunT: 0, flash: 0 });
      S.alfaJefe = tramo(t, 1.5, 2.5); if (t <= 5.95) S.finJ = [J.x, J.y];
      S.giro = t > 3.9 && t < 4.5 ? Math.sin((t - 3.9) * 18) * .015 * (1 - tramo(t, 3.9, 4.5)) : 0; // el retroceso de los cañones
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.06], [1.4, 1.0]]), fx: p.x + 80, fy: FLOOR - 40, nit: false };
      else if (t < 2.8) { const u = EASE.io2(tramo(t, 1.4, 2.5, 'lin')); S.cam = { x: L.camMin, z: 1.15, fx: lerp(p.x + 60, S.bx, u), fy: lerp(FLOOR - 40, J.y + 6, u), dof: .1, nit: true }; }
      else if (t < 3.9) S.cam = { x: L.camMin, z: claves(t, [[2.8, 3.0], [3.9, 3.3, 'io2']]), fx: J.x + 20, fy: J.y - 16, dof: .8, nit: true };
      else if (t < 5.2) S.cam = { x: L.camMin, z: claves(t, [[3.9, 1.05], [5.2, 1.08]]), fx: lerp(p.x, J.x, .5), fy: lerp(FLOOR - 20, J.y - 28, .5), dof: .15, nit: true };
      else { const u = EASE.io2(tramo(t, 5.2, 5.95, 'lin')); S.cam = { x: L.camMin, z: lerp(1.08, 1.25, u), fx: lerp(lerp(p.x, J.x, .5), p.x + 16, u), fy: lerp(lerp(FLOOR - 20, J.y - 28, .5), lerp(FLOOR - 24, J.y - 16, .5), u), dy: 6 * u, dof: lerp(.15, .25, u), nit: true }; }
      for (const m of S.miras) { const f = t - m.t0 - m.espera; if (f > 0 && f < .3) S.sacude = Math.max(S.sacude, 3.5 * (1 - f / .3)); }
    },
    atras(ctx, S, t) {
      // el banco de niebla del que sale el barco
      if (t > 1.2) niebla(ctx, S.bx, 64, 110, (1 - tramo(t, 3.0, 4.0) * .5), CUR.t, 9);
    },
    frente(ctx, S, t) {
      const J = S.J, ct = CUR.t, FD = MEC.FD;
      // la niebla baja que entra del lado del mar, entre las almenas
      for (let k = 0; k < 9; k++) { const x = L.camMin + VW + 60 - ((t * 38 + k * 61) % (VW + 160)) * tramo(t, .2, 1.4), y = FLOOR - 6 - (k % 3) * 9; ctx.fillStyle = NIEBLA + (.22 * tramo(t, .2, 1.2)) + ')'; ctx.beginPath(); ctx.ellipse(x, y, 34, 7, 0, 0, TAU); ctx.fill(); }
      // el loro fantasma que cruza
      if (t > .5 && t < 1.6) { const u = (t - .5) / 1.1, x = lerp(S.px + 220, S.px - 160, u), y = 72 + Math.sin(u * 9) * 6; ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.globalAlpha = .6;
        if (String(view.st.id).split('~')[0] === 'acuarela' && loroCine.complete && loroCine.naturalWidth) { const f = Math.floor(ct * 9) % 3; ctx.drawImage(loroCine, (f % 2) * 256, Math.floor(f / 2) * 256, 256, 256, -9, -12, 18, 18); }
        else FD.loro(ctx, { anim: 0 }, ct); ctx.restore(); }
      // el capitán levanta la mano: «¡fuego!»
      if (t > 3.2 && t < 4.3) { const u = EASE.outBack(tramo(t, 3.2, 3.5, 'lin')) * (1 - tramo(t, 4.0, 4.3)), sx = J.x + 16, sy = J.y - 14, a = lerp(.6, -1.35, u); ctx.strokeStyle = rgba(J.pal.c, .9); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 7, sy + Math.sin(a) * 7); ctx.stroke(); ctx.fillStyle = rgba(J.pal.c, .9); ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 7.6, sy + Math.sin(a) * 7.6, 1.3, 0, TAU); ctx.fill(); }
      // los cañonazos: fogonazo y humo en las troneras
      for (let i = 0; i < 3; i++) { const f = t - (3.95 + i * .2); if (f < 0 || f > 1.2) continue; const x = J.x - [-12, -2, 8][i], y = J.y - 1;
        if (f < .15) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x - 4, y, 10, '#ffcf5a', 1 - f / .15); ctx.restore(); }
        if (String(view.st.id).split('~')[0] === 'acuarela' && humoCanion.complete && humoCanion.naturalWidth) { const w = 10 + f * 20, h = 5 + f * 9; ctx.save(); ctx.globalAlpha = .7 * (1 - f / 1.2); ctx.drawImage(humoCanion, 75, 50, 1620, 790, x - 5 - w, y - h * .65 - f * 5, w, h); ctx.restore(); }
        else for (let k = 0; k < 5; k++) { ctx.fillStyle = `rgba(200,200,205,${.5 * (1 - f / 1.2)})`; ctx.beginPath(); ctx.arc(x - 6 - f * 20 - k * 3, y + 2 + k * 1.5 - f * 6, 2.4 + f * 5, 0, TAU); ctx.fill(); } }
      // las miras del juego y sus balas, y la explosión al caer
      for (const m of S.miras) { const f = t - m.t0; if (f < 0) continue; if (f < m.espera) MEC.OBJ.mira.draw(ctx, { x: m.x, y: m.y, t: f, espera: m.espera }); else explosion(ctx, m.x, m.y, f - m.espera); }
      // la sombra del barco que pasa por encima
      if (t > 5.2) { const a = .28 * tramo(t, 5.2, 5.7); ctx.fillStyle = `rgba(10,12,20,${a})`; ctx.beginPath(); ctx.ellipse(J.x, FLOOR - 2, 46, 5, 0, 0, TAU); ctx.fill(); }
    },
    pantalla(ctx, M, S, t) { if (t > 5.2) { ctx.fillStyle = `rgba(12,14,24,${.22 * tramo(t, 5.2, 5.8)})`; ctx.fillRect(0, 0, M.w, M.h); } },
    entrega(S) { Object.assign(CUR.p, { x: S.px - 34, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: S.px - 50, y: FLOOR - 30 }); if (S.Obj && S.finJ) S.Obj.j.x = S.finJ[0]; }, // el barco sigue desde donde quedó
    foco: S => [S.J.x + 2, S.J.y - 12],
  };

  // =====================================================================
  //  8 · CHAAC: «Llega el aguacero»
  //  Su prólogo («inundacion») pinta la lluvia y el agua: desde el aguacero
  //  se deja en el mundo, sin su Chaac (ese lo dibuja la entrada).
  // =====================================================================
  ENTRADAS.chaac = {
    tCarta: 5.95, corta: [1.5, 5.1],
    cues: [[.2, 'ambiente', 'viento que sube'], [1.1, 'efecto', 'la primera gota'], [1.5, 'swell', 'se abre la nube'], [2.9, 'efecto', 'toma aire'], [3.8, 'golpe', 'el aguacero'], [4.8, 'golpe', 'el rayo'], [5.95, 'acento', 'carta']],
    inicia(S) { const st = L.start; S.px = st.x + 50; S.cx = S.px + 72; S.cy = 58; },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre, R = S.Obj;
      const anda = tramo(t, 0, 1.1, 'out2');
      let x = lerp(S.px - 80, S.px, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 80 * (1 - anda) : 0, face = 1;
      if (t > 4.7) { const u = tramo(t, 4.7, 5.0, 'lin'); [x, y] = arco(u, S.px, FLOOR, S.px + 26, FLOOR, 20); on = u >= 1; vy = u < .5 ? -170 : 170; }
      if (t > 5.15 && t < 5.5) face = -1; // voltea a ver a Fresita
      Object.assign(p, { x, y, on, vx, vy, face, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = t > 1.12 && t < 1.3 ? Math.sin((t - 1.12) / .18 * Math.PI) * .14 : t > 5.0 && t < 5.15 ? .2 * (1 - (t - 5.0) / .15) : t > 5.6 && t < 5.85 ? Math.sin((t - 5.6) / .25 * Math.PI) * .16 : 0;
      if (fr) { let q = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2]; if (t > 5.05 && t < 5.65) { const a = tramo(t, 5.05, 5.65) * TAU; q = [p.x - 4 + Math.cos(a - Math.PI) * 14, p.y - 34 + Math.sin(a - Math.PI) * 10]; } Object.assign(fr, { x: q[0], y: q[1], face: t > 5.05 && t < 5.65 ? (Math.sin(tramo(t, 5.05, 5.65) * TAU - Math.PI) > 0 ? -1 : 1) : 1 }); }
      // Chaac: sale de la nube, toma aire (se infla) y suelta el aguacero
      const sale = EASE.outBack(tramo(t, 1.5, 2.4, 'lin')), infla = EASE.io2(tramo(t, 2.9, 3.6, 'lin')) * (1 - EASE.out3(tramo(t, 3.75, 3.95, 'lin')));
      const atkChaac = t < 3.8 ? 'ventarron' : t >= 4.8 && t < 5.2 ? 'rayos' : 'aguacero';
      Object.assign(J, { x: S.cx + Math.sin(t * .7) * 3, y: S.cy + Math.sin(t * 1.1) * 2, t, at: t, st: t > 2.0 ? 'ataque' : 'entra', atk: atkChaac, cineInhala: t >= 2.9 && t < 3.75, stunT: 0, flash: 0 });
      S.escala = lerp(.5, 1, sale) * (1 + .13 * infla); S.alfaJefe = tramo(t, 1.45, 1.9); S.oculto = t < 1.45; if (t <= 5.95) S.finJ = [J.x, J.y];
      // desde el aguacero, su lluvia y su agua (las del juego) se quedan en el mundo
      if (R) { S.mundoObj = t > 3.8 ? 'sinJefe' : 'oculto'; R.t = 5; R.nivel = lerp(VH + 40, FLOOR + 18, EASE.out2(tramo(t, 3.8, 5.2, 'lin'))); }
      CUR.destello = 0;
      // cámara
      if (t < 1.4) { const detalle = String(view.st.id).split('~')[0] === 'acuarela' ? Math.sin(Math.PI * tramo(t, .95, 1.4, 'lin')) : 0; S.cam = { x: L.camMin, z: claves(t, [[0, 1.08], [1.4, 1.02]]) + 1.8 * detalle, fx: lerp(lerp(p.x + 40, S.cx, .3), p.x, detalle), fy: lerp(FLOOR - 60, p.y - 14, detalle), nit: detalle > 0 }; }
      else if (t < 2.7) S.cam = { x: L.camMin, z: claves(t, [[1.4, 1.2], [2.7, 1.45, 'io2']]), fx: lerp(p.x + 30, S.cx, .7), fy: lerp(FLOOR - 50, S.cy + 10, EASE.io2(tramo(t, 1.4, 2.2, 'lin'))), dof: .15, nit: true };
      else if (t < 3.8) S.cam = { x: L.camMin, z: claves(t, [[2.7, 2.7], [3.8, 2.95, 'io2']]), fx: J.x, fy: J.y - 2, dof: .8, nit: true };
      else if (t < 5.0) S.cam = { x: L.camMin, z: claves(t, [[3.8, 1.2], [5.0, 1.28]]), fx: lerp(p.x, S.cx, .45), fy: lerp(FLOOR - 30, S.cy, .4), dof: .15, nit: true };
      else S.cam = { x: L.camMin, z: claves(t, [[5.0, 1.35], [5.95, 1.45]]), fx: lerp(p.x, S.cx, .35), fy: lerp(p.y - 22, S.cy, .45), dof: .2, nit: true };
      if (t > 3.75 && t < 4.0) S.sacude = 2; if (t > 4.8 && t < 5.1) S.sacude = 4 * (1 - tramo(t, 4.8, 5.1));
    },
    atras(ctx, S, t) {
      // las nubes que se juntan en una sola
      const u = EASE.io2(tramo(t, .2, 1.6, 'lin')), a = 1 - tramo(t, 2.2, 3.0) * .6;
      for (let k = 0; k < 9; k++) { const lado = k % 2 ? 1 : -1, x0 = S.cx + lado * (170 + hash1(k, 81) * 90), x = lerp(x0, S.cx + (hash1(k, 82) - .5) * 70, u), y = S.cy - 6 + (hash1(k, 83) - .5) * 24, r = 14 + hash1(k, 84) * 10;
        const estilo = String(view.st.id).split('~')[0], nube = estilo === 'acuarela' ? nubeChaac : estilo === 'bits8' ? nubeChaacBits8 : null;
        if (nube && nube.complete && nube.naturalWidth) { ctx.save(); ctx.globalAlpha = .8 * a; ctx.imageSmoothingEnabled = estilo !== 'bits8'; if (estilo === 'bits8') ctx.drawImage(nube, 110, 70, 1550, 775, x - r * 1.2, y - r * .6, r * 2.4, r * 1.2); else ctx.drawImage(nube, 110, 75, 1555, 750, x - r * 1.2, y - r * .6, r * 2.4, r * 1.2); ctx.restore(); }
        else { ctx.fillStyle = `rgba(110,118,134,${.75 * a})`; ctx.beginPath(); ctx.arc(x, y + 3, r, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(150,158,172,${.8 * a})`; ctx.beginPath(); ctx.arc(x - 2, y, r * .85, 0, TAU); ctx.fill(); } }
      // relámpagos dentro de la nube
      if (t > 1.4 && t < 3.8) { const f = Math.max(0, Math.sin(t * 11) * Math.sin(t * 3.7)); if (f > .5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, S.cx + Math.sin(t * 17) * 30, S.cy, 30, '#fff6c0', (f - .5) * .8); ctx.restore(); } }
    },
    frente(ctx, S, t, V) {
      const p = CUR.p;
      // la primera gota, en la nariz de Itzel
      if (t > .85 && t < 1.35) { const u = tramo(t, .85, 1.1, 'in2'); if (u < 1) { ctx.fillStyle = 'rgba(160,210,255,.95)'; ctx.beginPath(); ctx.ellipse(p.x + 3, lerp(p.y - 90, p.y - 22, u), .9, 1.6, 0, 0, TAU); ctx.fill(); } else { const k = tramo(t, 1.1, 1.35); for (let i = 0; i < 5; i++) { const a = -Math.PI * (.15 + i * .17); ctx.fillStyle = `rgba(180,220,255,${1 - k})`; ctx.beginPath(); ctx.arc(p.x + 3 + Math.cos(a) * k * 6, p.y - 22 + Math.sin(a) * k * 5, .6, 0, TAU); ctx.fill(); } } }
      // el aguacero: lluvia gruesa en diagonal sobre la que ya pinta el prólogo
      if (t > 3.8) { const a = tramo(t, 3.8, 4.1), x0 = CUR.cam - 30; ctx.strokeStyle = `rgba(205,225,255,${.5 * a})`; ctx.lineWidth = .9; ctx.beginPath();
        for (let k = 0; k < 110; k++) { const x = x0 + ((k * 37 + CUR.t * 70) % (VW + 60)), y = V.y0 - 10 + ((k * 89 + CUR.t * 330) % ((VISTA.H || VH) + 30)); ctx.moveTo(x, y); ctx.lineTo(x - 3.5, y + 11); } ctx.stroke(); }
      // el rayo del juego: línea de aviso (reforzada) y luego el rayo
      if (t > 3.95 && t < 4.8) { const y1 = L.surfaceY(Math.floor((S.px - 24) / T), 0) * T; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,240,150,${.3 + Math.sin(t * 30) * .15})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(S.px - 24, V.y0); ctx.lineTo(S.px - 24, y1); ctx.stroke(); glowDot(ctx, S.px - 24, y1, 10, '#fff2a0', .5); ctx.restore(); }
      if (t > 3.95 && t < 5.2) {
        const estilo = String(view.st.id).split('~')[0], imagenRayo = estilo === 'acuarela' ? rayoCine : estilo === 'bits8' ? rayoBits8 : null;
        const usaRayo = t >= 4.8 && imagenRayo && imagenRayo.complete && imagenRayo.naturalWidth;
        if (usaRayo) { const x = S.px - 24, y0 = V.y0 - 44, y1 = L.surfaceY(Math.floor(x / T), 0) * T; ctx.save(); ctx.imageSmoothingEnabled = estilo !== 'bits8'; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(imagenRayo, x - 22, y0, 44, y1 - y0); ctx.restore(); }
        else MEC.OBJ.rayoChaac.draw(ctx, { x: S.px - 24, t: t - 3.95 }, { y0: V.y0 - 40 });
      }
      // empapadas: les escurre el agua
      if (t > 4.2) { ctx.fillStyle = 'rgba(170,215,255,.85)'; for (let i = 0; i < 6; i++) { const f = (t * 1.6 + i / 6) % 1, sx = p.x + (i % 2 ? 5 : -5) + (i % 3 - 1); ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.ellipse(sx, p.y - 20 + f * 18, .6, 1.1, 0, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    },
    pantalla(ctx, M, S, t) {
      ctx.fillStyle = `rgba(16,22,38,${.34 * tramo(t, .2, 1.4)})`; ctx.fillRect(0, 0, M.w, M.h); // se oscurece el cielo
      if (t > 4.8 && t < 5.15) { ctx.fillStyle = `rgba(255,255,240,${.22 * (1 - tramo(t, 4.8, 5.15))})`; ctx.fillRect(0, 0, M.w, M.h); } // el destello del rayo sin ocultar la esquiva
    },
    entrega(S) { Object.assign(CUR.p, { x: S.px + 26, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: S.px + 10, y: FLOOR - 30 }); if (S.Obj && S.finJ) S.Obj.j.x = S.finJ[0]; }, // el agua regresa a su nivel (la guarda el prólogo); Chaac sigue desde donde quedó
    foco: S => [S.J.x, S.J.y + 2],
  };

  // =====================================================================
  //  9 · CAMAZOTZ: «La cueva sin luz»
  //  La oscuridad la pone la entrada (el mismo velo con huecos de luz del
  //  prólogo), encima de todo: así Camazotz solo se ve donde alumbra Fresita.
  // =====================================================================
  const velo = mkCanvas(8, 8), vx = velo.getContext('2d');
  const murcielagosCine = [0, 1, 2].map(i => { const img = new Image(); img.src = `../Roguelike/assets/fauna/murcielagoNoche${i}.png`; return img; });
  function murcielaguito(ctx, x, y, t, s = 1, col = '#1c1622') {
    const al = Math.sin(t * 26) * 3; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 3 * s, y - (2 + al) * s, x - 7 * s, y - al * s); ctx.quadraticCurveTo(x - 4 * s, y + s, x, y + 1.6 * s);
    ctx.quadraticCurveTo(x + 4 * s, y + s, x + 7 * s, y - al * s); ctx.quadraticCurveTo(x + 3 * s, y - (2 + al) * s, x, y); ctx.fill();
  }
  ENTRADAS.camazotz = {
    tCarta: 5.95, corta: [1.5, 5.0],
    cues: [[.2, 'ambiente', 'eco y se va la luz'], [1.45, 'efecto', 'aleteo de murcielaguitos'], [1.95, 'silencio', 'se apaga todo'], [2.7, 'swell', 'ojos rojos'], [3.85, 'golpe', 'el chillido'], [4.4, 'efecto', 'picada'], [5.95, 'acento', 'carta']],
    inicia(S) {
      const st = L.start; S.px = st.x + 50; S.cx = S.px + 42;
      S.cris = (CUR.objs || []).filter(o => o.k === 'cristalCueva');
      S.bats = Array.from({ length: 18 }, (_, i) => ({ y: 56 + hash1(i, 91) * 100, d: hash1(i, 92) * .5, v: .8 + hash1(i, 93) * .5 }));
    },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre;
      const anda = tramo(t, 0, 1.3, 'out2');
      Object.assign(p, { x: lerp(S.px - 80, S.px, anda), y: FLOOR, on: true, vx: anda < 1 ? 70 * (1 - anda) : 0, vy: 0, face: 1, vis: true, inv: 0 }); p.run += Math.abs(p.vx) * dt * .16;
      p.sq = t > 1.45 && t < 1.65 ? Math.sin((t - 1.45) / .2 * Math.PI) * .14 : t > 5.3 && t < 5.5 ? Math.sin((t - 5.3) / .2 * Math.PI) * .08 : 0;
      if (fr) { // se acerca a Camazotz con su luz; quieta en el chillido; sube a ver el techo
        let q = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2];
        if (t > 2.6) { const u = EASE.io2(tramo(t, 2.6, 3.2, 'lin')); q = [lerp(q[0], p.x + 6, u), lerp(q[1], p.y - 40, u)]; }
        if (t > 3.8 && t < 5.0) q = [p.x + 6, p.y - 40]; // ni se mueve
        if (t > 5.0) { const u = EASE.io2(tramo(t, 5.0, 5.6, 'lin')); q = [lerp(p.x + 6, p.x + 12, u), lerp(p.y - 40, p.y - 56, u)]; }
        Object.assign(fr, { x: q[0], y: q[1], face: 1 });
      }
      // Camazotz: baja a la luz con las alas cerradas, las abre, chilla, se lanza en picada y se cuelga del techo
      let x = S.cx, y = lerp(18, 92, EASE.io2(tramo(t, 2.8, 3.6, 'lin'))), st = t < 3.3 ? 'ventana' : 'ataque', atk = 'chillido', at = t;
      if (t > 4.4 && t < 4.95) { const u = tramo(t, 4.4, 4.95, 'lin'); x = lerp(S.cx, p.x - 150, u); y = 92 + Math.sin(u * Math.PI) * (p.y - 30 - 92 + 20); atk = 'picada'; at = 1; }
      if (t >= 4.95) { x = S.px + 44; y = 50; st = 'ventana'; }
      Object.assign(J, { x, y, face: x < p.x ? 1 : -1, t, at, st, atk, cineAlasCerradas: t >= 2.7 && t < 3.3, cineChilla: t >= 3.3 && t < 4.4, cineColgado: t >= 4.95, stunT: 0, flash: 0 });
      S.oculto = t < 2.7 || (t > 4.95 && t < 5.05);
      S.giro = t >= 4.95 ? Math.PI : 0; // colgado de cabeza
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.06], [1.4, 1.0]]), fx: p.x + 70, fy: FLOOR - 50, nit: false };
      else if (t < 2.6) S.cam = { x: L.camMin, z: claves(t, [[1.4, 1.35], [2.6, 1.45]]), fx: p.x + 20, fy: FLOOR - 40, dof: .1, nit: true };
      else if (t < 3.8) S.cam = { x: L.camMin, z: claves(t, [[2.6, 2.0], [3.8, 2.35, 'io2']]), fx: lerp(S.cx, p.x, .25), fy: lerp(60, 112, tramo(t, 2.8, 3.6)), dof: .4, nit: true };
      else if (t < 5.0) S.cam = { x: L.camMin, z: claves(t, [[3.8, 1.35], [5.0, 1.3]]), fx: p.x + 10, fy: FLOOR - 50, dof: .15, nit: true };
      else S.cam = { x: L.camMin, z: claves(t, [[5.0, 1.6], [5.95, 1.72]]), fx: lerp(p.x, J.x, .5), fy: lerp(lerp(p.y - 24, J.y, .55), J.y + 3, EASE.io2(tramo(t, 5.0, 5.3, 'lin'))), dy: 10, dof: .25, nit: true };
      if (t > 3.85 && t < 4.4) S.sacude = 2.2;
    },
    frente(ctx, S, t) {
      // la ráfaga de murcielaguitos
      if (t > 1.4 && t < 2.6) for (const b of S.bats) { const u = (t - 1.4 - b.d) * b.v; if (u < 0 || u > 1) continue; const x = lerp(S.px + 260, S.px - 220, u), y = b.y + Math.sin(u * 12 + b.y) * 8, f = Math.floor((t * 11 + b.y) % 3), img = murcielagosCine[f]; if (String(view.st.id).split('~')[0] === 'acuarela' && img.complete && img.naturalWidth) ctx.drawImage(img, x - 8, y - 5, 16, 10); else murcielaguito(ctx, x, y, CUR.t + b.y, 1); }
    },
    // la oscuridad (con los huecos de luz del juego), los ojos rojos y el chillido encima
    pantalla(ctx, M, S, t, V) {
      const J = S.J, osc = tramo(t, 1.9, 2.3);
      if (osc <= 0) { const a = .3 * tramo(t, .3, 1.4); if (a > 0) { ctx.fillStyle = `rgba(6,4,12,${a})`; ctx.fillRect(0, 0, M.w, M.h); } return; } // la luz se va yendo
      if (velo.width !== M.w || velo.height !== M.h) { velo.width = M.w; velo.height = M.h; }
      vx.setTransform(1, 0, 0, 1, 0, 0); vx.globalCompositeOperation = 'source-over'; vx.clearRect(0, 0, M.w, M.h); vx.fillStyle = `rgba(4,2,8,${.95 * osc})`; vx.fillRect(0, 0, M.w, M.h);
      vx.globalCompositeOperation = 'destination-out';
      const hueco = (x, y, r) => { const [X, Y] = V.scr(x, y), R = r * V.sx, g = vx.createRadialGradient(X, Y, R * .2, X, Y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); vx.fillStyle = g; vx.fillRect(X - R, Y - R, R * 2, R * 2); };
      const fr = CUR.fre, p = CUR.p; if (fr) hueco(fr.x, fr.y, (t > 5.0 ? 74 : 62) + Math.sin(CUR.t * 3) * 3); hueco(p.x, p.y - 8, 26);
      if (t > 3.85 && t < 4.4 && String(view.st.id).split('~')[0] === 'acuarela') hueco(J.x, J.y - 6, 32 * Math.min(tramo(t, 3.85, 3.95), 1 - tramo(t, 4.3, 4.4)));
      // La luz de Fresita alcanza al jefe en todos los estilos, no solo en acuarela.
      if (t > 5.05) hueco(J.x, J.y, 48 * tramo(t, 5.05, 5.35));
      for (const q of S.cris) hueco(q.x, q.y - 6, 40);
      ctx.drawImage(velo, 0, 0);
      // los ojos rojos brillan aunque esté oscuro
      if (t > 2.7 && !S.oculto) { const a = tramo(t, 2.7, 2.9), up = S.giro ? -1 : 1;
        for (const d of [-1, 1]) { const [X, Y] = V.scr(J.x + d * 3.2 * up, J.y - 12 * up);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, X, Y, 3.2 * V.sx, '#ff3a3a', .7 * a); ctx.restore();
          ctx.fillStyle = rgba('#ff5a4a', a); ctx.beginPath(); ctx.ellipse(X, Y, 1.5 * V.sx, 1.1 * V.sx, d * up * .3, 0, TAU); ctx.fill(); } }
      // el chillido: ondas rojas
      if (t > 3.85 && t < 4.5) { const [X, Y] = V.scr(J.x, J.y); ctx.strokeStyle = `rgba(255,60,60,${.6 * (1 - tramo(t, 4.3, 4.5))})`; ctx.lineWidth = 1.6 * M.k; for (let k = 0; k < 4; k++) { const r = ((t - 3.85) * 140 + k * 30) % 130; ctx.beginPath(); ctx.arc(X, Y, r * V.sx, 0, TAU); ctx.stroke(); } }
    },
    entrega(S) { Object.assign(CUR.p, { x: S.px, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: S.px - 16, y: FLOOR - 30 }); }, // el ciclo del chillido empieza de cero (lo guarda el prólogo)
    foco: S => [S.J.x, S.J.y + 4],
  };

  // =====================================================================
  //  10 · XUNÁN KAB: «El zumbido»
  //  Las abejas del enjambre (y su «z z» dormidas) las pinta su prólogo:
  //  se deja en el mundo sin la reina, que la dibuja la entrada.
  // =====================================================================
  const abejasCine = Array.from({ length: 4 }, (_, i) => { const im = new Image(); im.src = '../Roguelike/assets/jardin/abeja' + i + '.png'; return im; });
  const abejaDormida = new Image();
  abejaDormida.src = '../Roguelike/assets/cinematicas-jefes/abeja-dormida-v1.webp';
  const hiloMiel = new Image();
  hiloMiel.src = '../Roguelike/assets/cinematicas-jefes/miel-hilo-v1.webp';
  const charcoMiel = new Image();
  charcoMiel.src = '../Roguelike/assets/cinematicas-jefes/miel-charco-v1.webp';
  function abejita(ctx, x, y, t, i, dormida = false) {
    const imagen = dormida && abejaDormida.complete && abejaDormida.naturalWidth ? abejaDormida : abejasCine[dormida ? 3 : Math.floor(t * 12 + i) % abejasCine.length];
    if (String(view.st.id).split('~')[0] === 'acuarela' && imagen.complete && imagen.naturalWidth) {
      ctx.drawImage(imagen, x - 3, y - 3, 6, 6); return;
    }
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(x, y, 1.6, 1.1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffbf00'; ctx.fillRect(x - .6, y - .9, 1.2, .6);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x, y - 1.6, 1.2, .6, dormida ? .9 : Math.sin(t * 40 + i), 0, TAU); ctx.fill();
  }
  function notita(ctx, x, y, a, col = '#b98cff') {
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = .7;
    ctx.beginPath(); ctx.ellipse(x, y, 1.7, 1.2, -.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 1.5, y); ctx.lineTo(x + 1.5, y - 6); ctx.quadraticCurveTo(x + 3.5, y - 5, x + 4, y - 3); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ENTRADAS.abeja = {
    tCarta: 5.95, corta: [1.5, 5.2],
    cues: [[.2, 'ambiente', 'zumbido lejano'], [.6, 'efecto', 'gota de miel'], [1.5, 'swell', 'llega el enjambre'], [3.2, 'golpe', 'el aguijón'], [3.9, 'efecto', 'canción de cuna'], [4.65, 'golpe', 'zumbido furioso'], [5.95, 'acento', 'carta']],
    inicia(S) { const st = L.start; S.px = st.x + 62; S.charco = { x0: S.px + 16, x1: S.px + 36, y: FLOOR }; },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre, o = S.Obj;
      // Itzel camina, brinca de puntitas el charco de miel y al final sale corriendo
      const anda = tramo(t, 0, 1.0, 'out2');
      let x = lerp(S.px - 90, S.px - 4, anda), y = FLOOR, on = true, vy = 0, vx = anda < 1 ? 80 * (1 - anda) : 0;
      if (t > 1.0) { const u = tramo(t, 1.0, 1.3, 'lin'); [x, y] = arco(u, S.px - 4, FLOOR, S.px + 44, FLOOR, 10); on = u >= 1; vy = u < .5 ? -120 : 120; }
      if (t > 5.25) { x = S.px + 44 + (t - 5.25) * 130; vx = 130; }
      Object.assign(p, { x, y, on, vx, vy, face: t > 1.6 && t < 5.25 ? -1 : 1, vis: true, inv: 0 }); p.run += Math.abs(vx) * dt * .16;
      p.sq = t > 1.3 && t < 1.45 ? .15 * (1 - (t - 1.3) / .15) : t > 5.1 && t < 5.25 ? .2 : 0;
      // Fresita: nerviosa canta su canción de cuna; luego se pega a Itzel al correr
      if (fr) { let q = [p.x + 14, p.y - 30 + Math.sin(t * 2.6) * 2], fc = -1;
        if (t > 3.75 && t < 5.0) { const u = EASE.io2(tramo(t, 3.75, 4.0, 'lin')); q = [lerp(q[0], p.x - 26, u), lerp(q[1], p.y - 36, u) + Math.sin(t * 9) * 1.2]; }
        if (t >= 5.0) { const u = tramo(t, 5.0, 5.3); q = [lerp(p.x - 26, p.x - 12, u), lerp(p.y - 36, p.y - 28, u)]; fc = t > 5.25 ? 1 : -1; }
        if (t < 1.6) fc = 1;
        Object.assign(fr, { x: q[0], y: q[1], face: fc }); }
      // el enjambre entra por la izquierda, se queda, se duerme un instante, despierta y se lanza
      const entra = EASE.out2(tramo(t, 1.4, 2.6, 'lin')), va = EASE.in2(tramo(t, 5.0, 6.0, 'lin'));
      const ox = lerp(L.camMin - 160, S.px - 110, entra) + va * 120, oy = 138 + Math.sin(t * 1.5) * 4;
      if (o) { o.x = ox; o.y = oy; o.espera = 0; o.duerme = t > 4.2 && t < 4.65 ? 2 : 0; S.mundoObj = 'sinJefe'; }
      const duerme = t > 4.2 && t < 4.65, despierta = t >= 4.65 && t < 4.95, enojo = despierta;
      Object.assign(J, { x: ox - 4 + (enojo ? Math.sin(t * 60) * 1.5 : 0), y: oy - 14, face: 1, t, at: t, st: duerme ? 'ventana' : 'ataque', atk: t > 3.1 && t < 3.8 ? 'aguijon' : 'enjambre', cineDormida: duerme, cineDespierta: despierta, stunT: 0, flash: enojo && t < 4.75 ? .3 : 0 });
      S.poseAbeja = duerme ? 'dormida' : despierta ? 'despertando' : null;
      S.despertarAbeja = tramo(t, 4.65, 4.95, 'io2');
      S.alfaJefe = tramo(t, 1.9, 2.3); S.oculto = t < 1.9;
      if (t <= 5.95) S.fin = { ox, oy, px: x };
      // cámara
      if (t < 1.4) S.cam = { x: L.camMin, z: claves(t, [[0, 1.08], [1.4, 1.03]]), fx: p.x + 40, fy: FLOOR - 40, nit: false };
      else if (t < 2.7) S.cam = { x: L.camMin - 60, z: 1.15, fx: lerp(p.x, ox, EASE.io2(tramo(t, 1.4, 2.4, 'lin')) * .75), fy: lerp(FLOOR - 40, oy - 6, tramo(t, 1.4, 2.4)), dof: .1, nit: true };
      else if (t < 3.8) S.cam = { x: L.camMin - 60, z: claves(t, [[2.7, 2.7], [3.8, 3.0, 'io2']]), fx: J.x + 2, fy: J.y - 4, dof: .8, nit: true };
      else if (t < 5.0) S.cam = { x: L.camMin - 60, z: claves(t, [[3.8, 1.12], [5.0, 1.1]]), fx: lerp(p.x, ox, .5), fy: lerp(FLOOR - 30, oy - 15, .5), dof: .15, nit: true };
      else { const u = EASE.io2(tramo(t, 5.0, 5.95, 'lin')); S.cam = { x: L.camMin - 60, z: lerp(1.1, 1.25, u), fx: lerp(lerp(p.x, ox, .5), lerp(ox, p.x, .45), u), fy: lerp(lerp(FLOOR - 30, oy - 15, .5), lerp(oy, FLOOR - 30, .4), u), dof: .15, nit: true }; }
      if (enojo) S.sacude = 2;
    },
    frente(ctx, S, t) {
      const J = S.J, ct = CUR.t, fr = CUR.fre;
      // el hilo de miel que cae y su charco (el del juego)
      if (t > .4 && t < 1.15) { const u = tramo(t, .4, .95, 'in2'), x = S.px + 26, y0 = CUR.camY ?? 0, y1 = lerp(y0, FLOOR - 1, u); if (String(view.st.id).split('~')[0] === 'acuarela' && hiloMiel.complete && hiloMiel.naturalWidth && y1 > y0) ctx.drawImage(hiloMiel, x - 5, y0, 10, y1 - y0); else { ctx.strokeStyle = 'rgba(232,160,30,.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); } }
      if (t > .9) { const k = EASE.outBack(tramo(t, .9, 1.25, 'lin')), c = S.charco, m = (c.x0 + c.x1) / 2, w = (c.x1 - c.x0) / 2 * k; if (String(view.st.id).split('~')[0] === 'acuarela' && charcoMiel.complete && charcoMiel.naturalWidth && w > 0) ctx.drawImage(charcoMiel, 80, 280, 1600, 400, m - w, c.y - 4, w * 2, 5); else MEC.OBJ.miel.draw(ctx, { x0: m - w, x1: m + w, y: c.y }, { t: ct }); }
      // abejitas sueltas
      if (t < 1.8) for (let i = 0; i < 3; i++) { const u = (t * .6 + i * .33) % 1; abejita(ctx, S.px - 60 + u * 200, 90 + i * 18 + Math.sin(t * 7 + i * 2) * 6, ct, i); }
      // las filas que forma el enjambre detrás de la reina
      if (t > 2.2 && t < 5.0) { const u = EASE.io2(tramo(t, 2.2, 2.8, 'lin')), d = J.x - 30;
        const duerme = t > 4.2 && t < 4.65, cae = duerme ? Math.sin(tramo(t, 4.2, 4.65) * Math.PI) * 3 : 0;
        for (let i = 0; i < 16; i++) { const fila = i < 8 ? -26 : 26, k = i % 8, x0 = J.x + Math.cos(i * 2.4 + ct * 3) * 22, y0 = J.y + 14 + Math.sin(i * 1.7 + ct * 3) * 14, x1 = d - k * 9 + (duerme ? 0 : Math.sin(ct * 8 + i) * .8), y1 = J.y + 14 + fila + cae;
          abejita(ctx, lerp(x0, x1, u), lerp(y0, y1, u), ct, i, duerme); }
        // se quedan dormidas un instante: «z z» (como en el juego)
        if (duerme) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.fillStyle = '#ffffff';
          for (const [zx, zy] of [[d - 10, J.y - 18], [d - 44, J.y - 16], [J.x + 4, J.y - 34]]) { const yy = zy - ((t * 6) % 4); ctx.strokeText('z z', zx, yy); ctx.fillText('z z', zx, yy); } } }
      // el aguijón brilla
      if (t > 3.1 && t < 3.8) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, J.x - 23 * (J.face || 1), J.y + 2, 6, '#fff6c8', .9 * Math.sin(tramo(t, 3.1, 3.8) * Math.PI)); ctx.restore(); }
      // la canción de cuna de Fresita: notitas moradas hacia el enjambre
      if (fr && t > 3.9 && t < 4.9) for (let i = 0; i < 6; i++) { const f = (t - 3.9) * 1.3 - i * .14; if (f < 0 || f > 1) continue; notita(ctx, lerp(fr.x - 6, J.x + 20, f), fr.y - 6 - Math.sin(f * Math.PI) * 14 + Math.sin(f * 12 + i) * 2, 1 - f); }
      // el zumbido furioso
      if (t > 4.65 && t < 5.0) { const k = tramo(t, 4.65, 5.0); ctx.strokeStyle = `rgba(255,200,40,${.7 * (1 - k)})`; ctx.lineWidth = 1; for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.arc(J.x, J.y, 10 + k * 40 + r * 7, 0, TAU); ctx.stroke(); } }
    },
    // la persecución arranca desde donde quedó la toma, con un respiro para leer el aviso
    entrega(S) { const o = S.Obj, f = S.fin; if (o && f) { o.x = f.ox; o.y = f.oy; o.espera = 1.0; }
      if (f) Object.assign(CUR.p, { x: f.px, y: FLOOR, vx: 130, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: CUR.p.x - 14, y: FLOOR - 28 }); },
    foco: S => [S.J.x + 6, S.J.y + 4],
  };

  // =====================================================================
  //  12 · LA RUPTURA: «El corazón de la pirámide»
  //  Cierra la historia de la entrada: los tres ajolotes en sus orbes
  //  (los mismos actores de la entrada, en chiquito). Al cambiar de forma,
  //  el mundo parpadea con el arte de los mundos que visitaron.
  // =====================================================================
  const AJOS3 = ['azul', 'naranja', 'violeta'], COLAJO = { azul: '#6fc0ff', naranja: '#ffae5a', violeta: '#b890ff' };
  const orbeAmigos = new Image();
  orbeAmigos.src = '../Roguelike/assets/bosque/piezas/burbuja.png';
  function orbeAjolote(ctx, x, y, r, a, T) {
    const col = COLAJO[a.color];
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, r * 1.9, col, .45); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * .95, 0, TAU); ctx.clip(); const k = r * 1.7 / 104; ctx.scale(k, k); a.x = 0; a.y = 8; ACTOR.dibuja(ctx, a); ctx.restore();
    if (String(view.st.id).split('~')[0] === 'acuarela' && orbeAmigos.complete && orbeAmigos.naturalWidth) { ctx.save(); ctx.globalAlpha = .25; ctx.drawImage(orbeAmigos, -r, -r, r * 2, r * 2); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = rgba(col, .16); ctx.fill(); ctx.lineWidth = r * .1; ctx.strokeStyle = 'rgba(255,79,216,.9)'; ctx.stroke(); ctx.lineWidth = r * .04; ctx.strokeStyle = 'rgba(122,240,255,.9)'; ctx.stroke();
      for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + T * 1.6; ctx.fillStyle = '#1c1028'; ctx.fillRect(Math.cos(an) * r - r * .08, Math.sin(an) * r - r * .08, r * .16, r * .16); }
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .4, r * .2, r * .1, -.6, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ENTRADAS.ruptura = {
    tCarta: 7.95, corta: [3.0, 7.4],
    calienta: [.3, 2.0, 3.06, 3.65, 4.25, 5.0, 6.8],
    cues: [[.3, 'silencio', 'latido grave'], [1.7, 'efecto', 'tres notas: los ajolotes'], [3.0, 'golpe', 'aparece la Ruptura'], [3.6, 'golpe', 'la Ruptura cambia'], [4.2, 'golpe', 'revela su forma'], [4.8, 'swell', 'el núcleo late'], [6.3, 'efecto', 'se abre la grieta'], [7.95, 'acento', 'carta']],
    inicia(S) {
      const st = L.start, o = S.Obj; S.px = st.x + 62; S.rx = L.camMin + VW - (VISTA.rec || 0) - 96; S.ry = 66;
      S.ajos = AJOS3.map(c => { const a = ACTOR.ajolote(c); a.cara.ojos = 1; return a; });
      // El prólogo usa un jefe de utilería; reservar su forma para la arena.
      S.formaRuptura = S.J.F || RUPTURA_FORMAS.elige();
      if (!S.J.F && !S.propio && !S.repeticion) RUN.formaRupturaEntrada = S.formaRuptura.id;
      const base = String(view.st.id).split('~')[0], ids = (o && o.ids ? o.ids : []).filter(id => id !== base && STYLE_MAP[id]);
      S.otros = ids.length ? ids : null; S.g0 = o ? o.x : L.camMin - 60;
    },
    // dónde va cada orbe: flotando arriba, luego jalado a orbitar el núcleo
    orbe(S, i, t) {
      const A = [S.px + 92 + i * 30, 84 + Math.sin(t * 1.6 + i * 2) * 5], an = t * 1.1 + i * 2.1, B = [S.J.x + Math.cos(an) * 52, S.J.y + 4 + Math.sin(an) * 30], u = EASE.io2(tramo(t, 3.0, 3.8, 'lin'));
      return [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
    },
    paso(S, t, dt) {
      const p = CUR.p, J = S.J, fr = CUR.fre, o = S.Obj;
      const anda = tramo(t, 0, 1.4, 'out2');
      let face = 1; if (t > 6.5 && t < 7.25) face = -1; // voltea a ver la grieta
      Object.assign(p, { x: lerp(S.px - 90, S.px, anda), y: FLOOR, on: true, vx: anda < 1 ? 60 * (1 - anda) : 0, vy: 0, face, vis: true, inv: 0 }); p.run += Math.abs(p.vx) * dt * .16;
      p.sq = t > 7.55 && t < 7.8 ? Math.sin((t - 7.55) / .25 * Math.PI) * .15 : 0;
      // Fresita ve a sus amigos, nada hacia ellos y regresa cuando se los llevan
      if (fr) { const casa = [p.x - 16, p.y - 30 + Math.sin(t * 2.6) * 2]; let q = casa;
        if (t > 1.7 && t < 2.3) q = [casa[0], casa[1] - 4 * Math.sin(tramo(t, 1.7, 2.0) * Math.PI)];
        else if (t >= 2.3 && t < 4.4) { const ir = EASE.io2(tramo(t, 2.3, 3.0, 'lin')), vuelve = EASE.io2(tramo(t, 3.6, 4.4, 'lin')), cerca = [S.px + 64, 112 + Math.sin(t * 3) * 2]; q = [lerp(lerp(casa[0], cerca[0], ir), casa[0], vuelve), lerp(lerp(casa[1], cerca[1], ir), casa[1], vuelve)]; }
        if (t > 7.4) { const u = tramo(t, 7.4, 7.65); q = [lerp(casa[0], p.x - 8, u), lerp(casa[1], p.y - 26, u)]; }
        Object.assign(fr, { x: q[0], y: q[1], face: t > 6.5 && t < 7.25 ? -1 : 1 }); }
      // la Ruptura: aparece detrás de los orbes y cambia de forma
      const destino = S.formaRuptura.cuerpo;
      const forma = destino; // una sola forma principal por entrada; la metamorfosis la marcan luz y movimiento
      Object.assign(J, { x: S.rx + Math.sin(t * .6) * 3, y: S.ry + Math.sin(t * 1.1) * 3, t, at: t, forma, st: t > 4.8 && t < 6.3 ? 'ventana' : 'ataque', atk: 'laser', stunT: 0, flash: (t > 3.6 && t < 3.72) || (t > 4.2 && t < 4.32) ? .3 : 0 });
      S.oculto = t < 3.0; S.alfaJefe = tramo(t, 3.0, 3.4); S.escala = lerp(.6, 1, EASE.outBack(tramo(t, 3.0, 3.6, 'lin')));
      const pulsoCambio = t > 3.6 && t < 3.76 ? Math.sin(tramo(t, 3.6, 3.76) * Math.PI) : t > 4.2 && t < 4.36 ? Math.sin(tramo(t, 4.2, 4.36) * Math.PI) : 0;
      S.escala *= 1 + .08 * pulsoCambio; S.giro = (t > 3.6 && t < 3.76 ? .08 * pulsoCambio : 0) - (t > 4.2 && t < 4.36 ? .06 * pulsoCambio : 0);
      S.tinte = t < 3.6 ? ['#271032', .42 * tramo(t, 3.0, 3.35)] : t < 4.36 ? ['#ff4fd8', .18 * pulsoCambio] : null;
      // con cada forma, el mundo parpadea con el arte de otro de sus mundos
      if (S.otros) { const z = [[3.0, 3.12], [3.6, 3.74], [4.2, 4.34]].findIndex(([a, b]) => t >= a && t < b); if (z >= 0) S.estiloMundo = S.otros[z % S.otros.length]; }
      // la grieta del prólogo se abre detrás de ellas y empieza a borrar el camino
      if (o) { o.espera = 0; o.x = lerp(S.g0, L.camMin + 30, EASE.io2(tramo(t, 6.3, 7.2, 'lin'))); S.mundoObj = 'sinJefe'; if (t <= 7.95) S.gFin = o.x; }
      for (const a of S.ajos) { a.cara.branquias = Math.sin(t * 5 + a.color.length) * .5; ACTOR.paso && ACTOR.paso(a, Math.min(dt, 1 / 30)); }
      // cámara
      if (t < 1.6) S.cam = { x: L.camMin, z: claves(t, [[0, 1.05], [1.6, 1.0]]), fx: p.x + 90, fy: FLOOR - 50, nit: false };
      else if (t < 2.3) S.cam = { x: L.camMin, z: 1.8, fx: fr ? fr.x + 10 : p.x, fy: fr ? fr.y : FLOOR - 40, dof: .4, nit: true };
      else if (t < 3.0) { const u = EASE.io2(tramo(t, 2.3, 3.0, 'lin')), c = ENTRADAS.ruptura.orbe(S, 1, t); S.cam = { x: L.camMin, z: lerp(1.8, 1.5, u), fx: lerp(fr ? fr.x : p.x, c[0], u * .7), fy: lerp(fr ? fr.y : FLOOR - 40, c[1] + 6, u), dof: .3, nit: true }; }
      else if (t < 4.8) { const u = tramo(t, 3.4, 4.6); S.cam = { x: L.camMin, z: claves(t, [[3.0, 1.6], [4.8, 1, 'io2']]), fx: lerp(lerp(S.px + 120, J.x, tramo(t, 3.0, 4.0)), (S.px + J.x) / 2, u), fy: lerp(J.y + 14, FLOOR - 62, u), dy: 10 * (1 - u), dof: .2 * (1 - u), nit: true }; }
      else if (t < 6.3) S.cam = { x: L.camMin, z: claves(t, [[4.8, 3.0], [6.3, 3.3, 'io2']]), fx: J.x, fy: J.y, dof: .8, nit: true };
      else if (t < 7.4) S.cam = { x: L.camMin, z: 1, fx: (L.camMin + 30 + J.x + 56) / 2, fy: FLOOR - 62, dof: .1, nit: true };
      else S.cam = { x: L.camMin, z: claves(t, [[7.4, 1.04], [7.95, 1.1]]), fx: lerp(p.x, J.x + 40, .5), fy: lerp(p.y - 24, J.y, .4), dof: .2, nit: true };
      if ((t > 3.0 && t < 3.2) || (t > 3.6 && t < 3.75) || (t > 4.2 && t < 4.4)) S.sacude = 3;
      if (t > 6.3 && t < 7.0) S.sacude = 1.4;
    },
    frente(ctx, S, t) {
      if (t < 1.6) return;
      const ct = CUR.t, aparece = tramo(t, 1.6, 2.0);
      S.ajos.forEach((a, i) => { const [x, y] = ENTRADAS.ruptura.orbe(S, i, t); orbeAjolote(ctx, x, y, 12 * aparece + .01, a, ct); });
      // Cada forma deja una estela distinta al revelarse, sin tapar su silueta.
      if (t >= 3.6 && t < 6.3) {
        const colores = { mural:'#e8ba70', golem:'#95ddff', nucleo:'#ff89e7', marea:'#65d6ec', baluarte:'#ffb263', enjambre:'#e8d772', huracan:'#cae5ef', espejo:'#dc98ff', ceiba:'#9cd990', tentaculos:'#ff78dc' };
        const id = S.formaRuptura.id, col = colores[id] || '#ff78dc', u = tramo(t, 3.6, 3.85), fade = 1 - tramo(t, 5.7, 6.3);
        ctx.save(); ctx.translate(S.J.x, S.J.y); ctx.globalAlpha = .55 * u * fade; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const ang = i * TAU / 8 + t * (id === 'huracan' ? 1.5 : .35), r = 68 + Math.sin(t * 2 + i) * 5, x = Math.cos(ang) * r, y = Math.sin(ang) * r * .72;
          ctx.save(); ctx.translate(x, y); ctx.rotate(ang + t * .4);
          if (id === 'marea' || id === 'huracan') { ctx.beginPath(); ctx.arc(0, 0, 4 + (i % 2), .1, Math.PI * 1.4); ctx.stroke(); }
          else if (id === 'ceiba') { ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, TAU); ctx.fill(); }
          else if (id === 'enjambre') { ctx.beginPath(); ctx.ellipse(0, 0, 2.5, 1.5, 0, 0, TAU); ctx.fill(); }
          else { ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3, 0); ctx.lineTo(0, 4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.stroke(); }
          ctx.restore();
        }
        ctx.restore();
      }
      // el destello rosa del núcleo
      if (t > 5.6 && t < 6.2) { const k = tramo(t, 5.6, 6.2); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, S.J.x, S.J.y, 20 + k * 60, '#ff4fd8', .8 * Math.sin(k * Math.PI)); ctx.restore(); }
    },
    pantalla(ctx, M, S, t) { if (t > 4.8 && t < 6.3) { const a = .25 * Math.sin(tramo(t, 4.8, 6.3) * Math.PI) * (.6 + .4 * Math.sin(t * 9)); ctx.fillStyle = `rgba(40,0,40,${a})`; ctx.fillRect(0, 0, M.w, M.h); } }, // el latido oscurece el cuadro
    entrega(S) { const o = S.Obj; if (o && S.gFin != null) { o.x = S.gFin; o.espera = 1.2; }
      Object.assign(CUR.p, { x: S.px, y: FLOOR, vx: 0, vy: 0, on: true, face: 1 }); if (CUR.fre) Object.assign(CUR.fre, { x: S.px - 16, y: FLOOR - 30 }); },
    foco: S => [S.J.x, S.J.y + 6],
  };

  // ---------- registro (aparecen en Menú › Cinemáticas cuando ya salieron) ----------
  for (const tipo of Object.keys(ENTRADAS)) CINE.registrar('jefe-' + tipo, { orden: 10 + ORDEN.indexOf(tipo), nombre: NOMBRE_MENU[tipo] || 'Entrada de ' + JEFES[tipo].nombre, desc: JEFES[tipo].lema, crear: o => crearEntradaJefe(tipo, o) });

  // ---------------------------------------------------------------------
  //  ENGANCHE: cuando startBoss() va a armar el prólogo del jefe, sale su
  //  entrada (completa la primera vez, corta después)
  // ---------------------------------------------------------------------
  GANCHOS.en('startBoss', _armaJefe => function () {
    const tipo = RUN.jefeOrden[RUN.bossIdx || 0] || 'ruptura', id = 'jefe-' + tipo;
    const prologo = typeof PROLOGOS !== 'undefined' && PROLOGOS[tipo] && RUN.prologo !== RUN.world + ':' + tipo && !RUN.sinPrologo;
    const encuentro = RUN.world + ':' + (RUN.bossIdx || 0);
    const entradaRuptura = tipo === 'ruptura' && RUN.entradaRuptura !== encuentro;
    if (!ENTRADAS[tipo] || (!prologo && !entradaRuptura)) return _armaJefe.apply(this, arguments);
    if (entradaRuptura) RUN.entradaRuptura = encuentro;
    const corta = CINE.vista(id);
    CINE.play(id, { titulo: STATE === 'title', corta, construir: () => _armaJefe(), alTerminar() {} });
  });
})();
