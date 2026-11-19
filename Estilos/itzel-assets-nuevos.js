// Diseños propios de Itzel para carta celeste y punto de cruz.
(() => {
  const archivos = {cielo:'itzel-carta-celeste-opcion4.png', bordado:'itzel-bordado-limpia.png'};
  const sprites = {}, anteriores = {}, MIRA_IZQUIERDA = new Set(['bordado']); // la ilustración de punto de cruz mira a la izquierda: se invierte
  for (const id of Object.keys(archivos)) {
    const img = imgPerezosa('../Roguelike/assets/personajes/' + archivos[id]);
    sprites[id] = img;
    if (STYLE_MAP[id]) anteriores[id] = STYLE_MAP[id].player;
  }
  function instalar(id) {
    const st = STYLE_MAP[id], img = sprites[id];
    if (!st || !img) return;
    st.player = function(c,p,f) {
      if (!img.complete || !img.naturalWidth) return anteriores[id](c,p,f);
      const corre=p.on && Math.abs(p.vx||0)>25, paso=corre?Math.sin(p.run||0):0;
      if (corre) return anteriores[id](c,p,f);
      const w=14, h=21, split=.78, mov=paso*.6;
      c.save(); c.translate(p.x,p.y); c.scale(((p.face||1)<0)!==MIRA_IZQUIERDA.has(id)?-1:1,1);
      c.imageSmoothingEnabled=true;
      const sw=img.naturalWidth, sh=img.naturalHeight, corte=Math.round(sh*split), mitad=Math.round(sw/2);
      c.drawImage(img,0,0,sw,corte,-w/2,-h,w,h*split);
      c.drawImage(img,0,corte,mitad,sh-corte,-w/2-mov,-h+h*split,w*mitad/sw,h*(1-split));
      c.drawImage(img,mitad,corte,sw-mitad,sh-corte,-w/2+w*mitad/sw+mov,-h+h*split,w*(sw-mitad)/sw,h*(1-split));
      c.restore();
    };
  }
  Object.keys(archivos).forEach(instalar);
  GANCHOS.en('aplicaElegido', previo => function (id,k=0) { const nombre=previo(id,k); instalar(id); return nombre; });
})();
