'use strict';
// La raspadora conserva su maquinaria y anima sus patas durante el combate.
(() => {
  const X = JEFES_EXT, anterior = X.BODY.brawbot, imagen = new Image();
  imagen.src = '../Roguelike/assets/jefes/raspadora-uayamon.png';
  let limpio, pixelado;
  function obtener(pixel) {
    if (!imagen.complete || !imagen.naturalWidth) return null;
    if (!limpio) {
      limpio = document.createElement('canvas'); limpio.width = 678; limpio.height = 580;
      const cx = limpio.getContext('2d', {willReadFrequently:true});
      cx.drawImage(imagen, 0, 0, limpio.width, limpio.height);
      try { const datos = cx.getImageData(0, 0, limpio.width, limpio.height);
      for (let i = 3; i < datos.data.length; i += 4) datos.data[i] = datos.data[i] < 210 ? 0 : 255;
      cx.putImageData(datos, 0, 0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    if (!pixel) return limpio;
    if (!pixelado) { pixelado = document.createElement('canvas'); pixelado.width = 136; pixelado.height = 116; pixelado.getContext('2d').drawImage(limpio, 0, 0, 136, 116); }
    return pixelado;
  }
  // El núcleo está en la ventanilla de la caldera, también mientras está aturdido.
  X.CORE.brawbot = o => ({x:o.x + (o.face || 1) * 26, y:X.FLOOR - 65, r:9});
  X.BODY.brawbot = (c, o, f) => {
    const t = f.t || 0, pixel = !!(f.st && (f.st.pixel || f.st.fixedS || f.st.base));
    const art = obtener(pixel); if (!art) return anterior(c, o, f);
    const dx=o._raspadoraX==null?0:o.x-o._raspadoraX;o._raspadoraX=o.x;
    if(Math.abs(dx)<20)o._raspadoraPaso=(o._raspadoraPaso||0)+Math.abs(dx)*.22;
    const andando = Math.abs(dx)>.03&&Math.abs(dx)<20, ataque = o.st === 'ataque';
    const paso = andando ? Math.sin(o._raspadoraPaso||0)*.16 : Math.sin(t*2)*.025;
    const golpe = ataque && o.atk === 'golpe' ? Math.sin(Math.min(1, Math.max(0, (o.at - .65) / .65)) * Math.PI) : 0;
    const sacudida = ataque && o.atk === 'onda' ? Math.sin(t * 15) * .025 : Math.sin(t * 2) * .006;
    c.save(); c.translate(o.x, X.FLOOR); c.scale(o.face || 1, 1);
    if (o.st === 'muere') c.globalAlpha *= Math.max(0, 1 - (o.at || 0) / 2.4);
    if (o.flash > 0 && Math.sin(t * 40) > 0) c.filter = 'brightness(2.3)';
    c.imageSmoothingEnabled = !pixel; c.translate(-60, -103); c.scale(120 / 1357, 103 / 1159);
    const pieza = (poly, px, py, ang) => {
      c.save(); c.translate(px, py); c.rotate(ang); c.translate(-px, -py);
      c.beginPath(); poly.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.clip(); c.drawImage(art, 0, 0, 1357, 1159); c.restore();
    };
    pieza([[0,710],[525,710],[525,1159],[0,1159]], 455, 710, paso + golpe * .14);
    pieza([[525,710],[1357,710],[1357,1159],[525,1159]], 900, 710, -paso);
    pieza([[0,0],[1357,0],[1357,710],[0,710]], 680, 700, sacudida - golpe * .025);
    c.restore();
    const cr = X.core(o), abierto = o.st === 'ventana' || o.st === 'herido';
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, cr.x, cr.y, abierto ? 12 : 5, '#ff9a35', abierto ? .65 : .22); c.restore();
    if (abierto) for (let i=0; i<3; i++) { const u=(t*.65+i/3)%1; c.fillStyle=`rgba(240,229,208,${.34*(1-u)})`; c.beginPath(); c.arc(cr.x+Math.sin(t+i)*2,cr.y-16-u*15,1+u*3,0,Math.PI*2); c.fill(); }
  };
})();
