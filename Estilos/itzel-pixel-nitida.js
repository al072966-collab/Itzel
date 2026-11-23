'use strict';
// =====================================================================
//  ITZEL EN EL MUNDO DE PIXEL (16 bits): nítida
//  La Itzel con animación sale de dibujos de ~1000 px que se encogen a ~22 unidades de alto; reducirlos tal cual da una mancha.
//  Aquí se dibuja a UN pixel por unidad (con suavizado de calidad), y luego se le da el tratamiento de pixel art: bordes duros,
//  colores en escalones y un contorno oscuro de un pixel. Las animaciones siguen siendo las mismas; solo cambia cómo se ve.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || typeof pixelSprite !== 'function') return;
  const W = 44, H = 46, OY = 38, K = 6, NIV = 14;     // ventana en unidades; se dibuja a K px por unidad y se reduce a 1
  const grande = document.createElement('canvas'), chico = document.createElement('canvas');
  grande.width = W * K; grande.height = H * K; chico.width = W; chico.height = H;
  const gx = grande.getContext('2d', { willReadFrequently: true }), cx = chico.getContext('2d', { willReadFrequently: true });
  function instalar(id) {
    const st = STYLE_MAP[id]; if (id !== 'pixel' || !st || !st.player || st.player._nitida) return;
    const original = st.player;
    const nitida = function (c, p, f) {
      const ax = Math.round(p.x), ay = Math.round(p.y);
      gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, W * K, H * K);
      gx.setTransform(K, 0, 0, K, (W / 2 - ax) * K, (OY - ay) * K);
      gx.imageSmoothingEnabled = true; gx.imageSmoothingQuality = 'high';
      const x0 = p.x, y0 = p.y; p.x = x0; p.y = y0;
      original(gx, p, Object.assign({}, f, { S: K }));
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
      cx.drawImage(grande, 0, 0, W, H);
      let im; try { im = cx.getImageData(0, 0, W, H); } catch (e) { c.save(); c.imageSmoothingEnabled = false; c.drawImage(chico, ax - W / 2, ay - OY, W, H); c.restore(); return; }
      const d = im.data, al = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const q = i * 4; if (d[q + 3] < 110) { d[q + 3] = 0; continue; }
        d[q + 3] = 255; al[i] = 1;
        for (let k = 0; k < 3; k++) d[q + k] = Math.round(d[q + k] / 255 * NIV) / NIV * 255;
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x; if (al[i]) continue;
        if ((x > 0 && al[i - 1]) || (x < W - 1 && al[i + 1]) || (y > 0 && al[i - W]) || (y < H - 1 && al[i + W])) { const q = i * 4; d[q] = 29; d[q + 1] = 18; d[q + 2] = 12; d[q + 3] = 255; }
      }
      cx.putImageData(im, 0, 0);
      c.save(); c.imageSmoothingEnabled = false; c.drawImage(chico, ax - W / 2, ay - OY, W, H); c.restore();
    };
    nitida._nitida = true; st.player = nitida;
  }
  instalar('pixel');
  GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const nombre = previo(id, k); instalar(id); return nombre; });
})();
