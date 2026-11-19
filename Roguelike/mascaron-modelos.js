'use strict';
// Diez diseños de prueba para comparar al Mascarón dentro del juego.
const MASCARON_MODELOS = (() => {
  // El Tocado solar es la propuesta elegida; las demás siguen disponibles para comparar.
  const nombres = ['Tocado solar', 'Guardián jaguar', 'Monolito', 'Templo viviente', 'Piedras flotantes', 'Roca antigua', 'Estela ceremonial', 'Jaguar de raíces', 'Ceiba de piedra', 'Puños del baluarte'];
  const arteSolar = new Image();
  arteSolar.src = '../Roguelike/assets/jefes/mascaron-solar.png';
  const arteLateral = new Image();
  arteLateral.src = '../Roguelike/assets/jefes/mascaron-solar-lateral.png';
  const versionesPixel = new WeakMap();
  function versionPixel(imagen) {
    if (versionesPixel.has(imagen)) return versionesPixel.get(imagen);
    if (!imagen.complete || !imagen.naturalWidth) return null;
    // Se simplifican los colores y el detalle al tamaño real del personaje:
    // así las piedras se leen como píxeles, no como una foto reducida.
    const cv = document.createElement('canvas'); cv.width = 92; cv.height = Math.round(92 * imagen.naturalHeight / imagen.naturalWidth);
    const x = cv.getContext('2d', { willReadFrequently:true });
    x.imageSmoothingEnabled = true; x.drawImage(imagen, 0, 0, cv.width, cv.height);
    const im = x.getImageData(0, 0, cv.width, cv.height), d = im.data;
    const pal = ['#241e24','#3c2a27','#54382e','#704b36','#8b5f40','#aa7750','#c39263','#d8af7b','#efd09b','#fff0bc','#672d2d','#913d32','#b94c3a','#d86d4a','#ed9570','#364832','#506737','#6e8644','#91a75a','#1d5652','#28877c','#48bbad','#8de4d2','#dbfff1'].map(h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
    for (let i=0;i<d.length;i+=4) {
      if (d[i+3]<96) { d[i+3]=0; continue; }
      let mejor=pal[0], distancia=Infinity;
      for (const q of pal) { const dr=d[i]-q[0], dg=d[i+1]-q[1], db=d[i+2]-q[2], v=dr*dr*.3+dg*dg*.59+db*db*.11; if(v<distancia){distancia=v;mejor=q;} }
      d[i]=mejor[0];d[i+1]=mejor[1];d[i+2]=mejor[2];d[i+3]=255;
    }
    x.putImageData(im,0,0); versionesPixel.set(imagen,cv); return cv;
  }
  const tonos = { claro:'#cbb58b', medio:'#aa936c', sombra:'#80694e', linea:'#4a3728', rojo:'#ad5942', jade:'#54c1b0', musgo:'#738c51' };
  function rect(c,x,y,w,h,col=tonos.medio) { c.fillStyle=col; c.strokeStyle=tonos.linea; c.lineWidth=1; c.beginPath(); c.roundRect(x,y,w,h,Math.min(2,w/4,h/4)); c.fill(); c.stroke(); c.fillStyle='rgba(255,244,204,.22)'; c.fillRect(x+1,y+1,Math.max(0,w-2),1); }
  function piedra(c,x,y,w,h,col=tonos.medio) { c.fillStyle=col; c.strokeStyle=tonos.linea; c.lineWidth=1.2; c.beginPath(); c.moveTo(x+w*.16,y);c.lineTo(x+w*.8,y);c.lineTo(x+w,y+h*.24);c.lineTo(x+w*.94,y+h*.8);c.lineTo(x+w*.72,y+h);c.lineTo(x+w*.12,y+h*.96);c.lineTo(x,y+h*.65);c.lineTo(x+w*.02,y+h*.23);c.closePath();c.fill();c.stroke(); c.strokeStyle='rgba(255,244,204,.35)';c.lineWidth=.8;c.beginPath();c.moveTo(x+w*.16,y+2);c.lineTo(x+w*.75,y+2);c.stroke(); }
  function glifo(c,x,y,s=1) {c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=tonos.rojo;c.lineWidth=2.4;c.beginPath();c.moveTo(-5,4);c.lineTo(-5,-5);c.lineTo(5,-5);c.lineTo(5,3);c.lineTo(0,3);c.lineTo(0,-1);c.stroke();c.restore();}
  function cristal(c,x,y,t,open) {c.save();c.translate(x,y); if(open){c.shadowColor=tonos.jade;c.shadowBlur=6+Math.sin(t*8)*2;} c.fillStyle=tonos.jade;c.strokeStyle='#285b54';c.lineWidth=.9;c.beginPath();c.moveTo(0,-9);c.lineTo(5,-3);c.lineTo(3,1);c.lineTo(-4,1);c.lineTo(-5,-3);c.closePath();c.fill();c.stroke();c.fillStyle='#b7f5e7';c.beginPath();c.moveTo(0,-8);c.lineTo(0,0);c.lineTo(-3,-3);c.closePath();c.fill();c.restore();}
  function rostro(c,x,y,w,h,t,open,felino=false) {piedra(c,x-w/2,y,w,h,tonos.claro);rect(c,x-w*.47,y+4,w*.94,4,tonos.sombra);c.fillStyle='#31534a';c.fillRect(x-w*.34,y+10,w*.23,3);c.fillRect(x+w*.11,y+10,w*.23,3);c.fillStyle='#b4fff0';c.fillRect(x-w*.31,y+10,w*.15,1.5);c.fillRect(x+w*.14,y+10,w*.15,1.5);rect(c,x-3,y+12,6,8,tonos.medio);rect(c,x-w*.27,y+h-8,w*.54,5,tonos.sombra);if(felino){c.fillStyle='#f2e3bf';for(const s of [-1,1]){c.beginPath();c.moveTo(x+s*6,y+h-7);c.lineTo(x+s*3,y+h-7);c.lineTo(x+s*5,y+h-2);c.fill();}} cristal(c,x+3,y-1,t,open);}
  function bloque(c,x,y,w,h,col=tonos.medio,marca=true){piedra(c,x,y,w,h,col);if(marca&&w>10&&h>10)glifo(c,x+w/2,y+h/2,.45);}
  // El elegido: estuco, relieves y piezas de piedra visibles a escala de juego.
  function solar(c, t, o, abierto, paso, golpe, estilo) {
    if (arteSolar.complete && arteSolar.naturalWidth) {
      solarIlustrado(c,t,o,abierto,paso,golpe,estilo);
      return;
    }
    const trazo = '#46372b', sombra = '#756349', base = '#ab9877', luz = '#d6c6a2', rojo = '#ad604f';
    function losa(x,y,w,h,col=base) {
      c.fillStyle=col; c.strokeStyle=trazo; c.lineWidth=.85;
      c.beginPath(); c.moveTo(x+2,y); c.lineTo(x+w-2,y); c.lineTo(x+w,y+2); c.lineTo(x+w-1,y+h-1); c.lineTo(x+1,y+h); c.lineTo(x,y+2); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle='rgba(255,241,207,.42)'; c.lineWidth=.6; c.beginPath(); c.moveTo(x+2,y+1.5); c.lineTo(x+w-2,y+1.5); c.stroke();
      c.strokeStyle='rgba(70,54,39,.25)'; c.beginPath(); c.moveTo(x+3,y+h-2); c.lineTo(x+w-3,y+h-2); c.stroke();
    }
    function marca(x,y,s) { c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.35;c.strokeStyle=rojo;c.beginPath();c.moveTo(-5,3);c.lineTo(-5,-4);c.lineTo(5,-4);c.lineTo(5,3);c.lineTo(0,3);c.lineTo(0,0);c.stroke();c.restore(); }
    function brazo(s) {
      c.save(); c.translate(s*24,-58); c.rotate(s*(.08 + golpe*.028) + paso*.012);
      losa(-7,-3,14,14,s<0?sombra:base); losa(-8,8,16,20,s<0?base:luz); marca(0,17,.7);
      losa(-8,26,16,10,base); losa(-9,32,18,12,luz);
      c.strokeStyle='rgba(70,54,39,.55)'; c.lineWidth=.7; for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*4,35);c.lineTo(i*4,40);c.stroke();} c.restore();
    }
    function pierna(s) {
      c.save(); c.translate(s*10, Math.max(0,s*paso));
      losa(-8,-24,16,17,s<0?sombra:base); losa(-9,-11,18,9,luz); losa(-11,-4,21,5,base); marca(0,-16,.45); c.restore();
    }
    // Piezas del tocado: abanico escalonado detrás del rostro, con una junta por bloque.
    for (let i=-4;i<=4;i++) {
      const ax=Math.abs(i), x=i*6.6-4.6, y=-103+ax*3.3, h=20-ax;
      losa(x,y,9,h,ax%2?base:luz);
      if(ax>1){c.fillStyle=rojo;c.fillRect(x+2,y+8,5,3);}
    }
    losa(-25,-80,50,8,sombra);
    for (const s of [-1,1]) {
      losa(s<0?-34:22,-78,12,17,base); losa(s<0?-31:23,-74,8,9,rojo);
      losa(s<0?-33:25,-66,8,8,luz); marca(s*29,-62,.43);
    }
    pierna(-1); pierna(1); brazo(-1);
    // Torso formado por mampostería y un pectoral, sin cubrir la cara.
    losa(-21,-62,42,38,sombra); losa(-19,-60,38,34,base);
    for(let row=0;row<3;row++) { const y=-58+row*10; c.strokeStyle='rgba(69,50,35,.42)';c.lineWidth=.65;c.beginPath();c.moveTo(-18,y+8);c.lineTo(18,y+8);c.moveTo(row%2?-6:6,y);c.lineTo(row%2?-6:6,y+8);c.stroke(); }
    losa(-11,-56,22,22,luz); losa(-8,-53,16,16,rojo); losa(-5,-50,10,10,base); marca(0,-45,.55);
    losa(-13,-28,26,7,sombra); for(let i=-1;i<=1;i++)losa(i*8-3,-27,6,5,luz);
    brazo(1);
    // El gran mascarón: ojos hundidos, nariz saliente, mandíbula y orejeras.
    losa(-16,-85,32,25,sombra); losa(-14,-84,28,21,luz);
    for(const s of [-1,1]) { losa(s<0?-21:15,-79,6,12,base); c.fillStyle=rojo;c.beginPath();c.arc(s*18,-73,1.8,0,Math.PI*2);c.fill(); }
    losa(-13,-81,26,5,base); losa(-11,-75,9,4,sombra); losa(2,-75,9,4,sombra);
    c.fillStyle='#a6e7d7'; c.fillRect(-9,-74,5,1.7); c.fillRect(4,-74,5,1.7);
    losa(-3,-75,6,10,base); losa(-9,-66,18,5,sombra); losa(-7,-65,14,2,luz);
    losa(-7,-62,14,5,base); c.strokeStyle='rgba(70,54,39,.5)';c.lineWidth=.5;c.beginPath();c.moveTo(-2,-61);c.lineTo(-2,-58);c.moveTo(3,-61);c.lineTo(3,-58);c.stroke();
    // El núcleo queda cerca de la misma posición que la zona vulnerable.
    cristal(c,2,-85,t,abierto);
    if (abierto) { c.save();c.globalAlpha=.22+.1*Math.sin(t*7);c.strokeStyle='#79ddc7';c.lineWidth=1;c.beginPath();c.arc(2,-89,8,0,Math.PI*2);c.stroke();c.restore(); }
  }
  // Las piezas se recortan del mismo dibujo y giran alrededor de sus juntas.
  // Esto mantiene la textura continua cuando está quieto y permite mover
  // brazos, piernas, torso y cabeza sin desplazar la zona vulnerable.
  function solarIlustrado(c,t,o,abierto,paso,golpe,estilo) {
    const W=1145,H=1374, balance=o.charging ? -.045 : Math.sin(t*1.7)*.008;
    const pixel = !!(estilo && (estilo.pixel || estilo.fixedS || estilo.base));
    const propio=typeof MASCARON_ESTILOS!=='undefined' && MASCARON_ESTILOS.obtener(estilo);
    if (o.charging && arteLateral.complete && arteLateral.naturalWidth) { solarCarrera(c,t,pixel,propio && propio.lateral); return; }
    const imagen = propio ? propio.frente : (pixel ? (versionPixel(arteSolar) || arteSolar) : arteSolar);
    const andando = o.charging || (o.st === 'ataque' && o.atk !== 'pisoton');
    const andar = andando ? Math.sin(t * (o.charging ? 11 : 4.4)) : 0;
    // Regiones exclusivas: al mover una extremidad no se conserva otra copia debajo.
    const regiones={
      piernaI:[[130,840],[555,840],[555,1374],[130,1374]],
      piernaD:[[590,840],[1020,840],[1020,1374],[590,1374]],
      brazoI:[[0,470],[385,470],[415,680],[350,1130],[0,1130]],
      brazoD:[[760,470],[1145,470],[1145,1130],[795,1130],[730,680]],
      cabeza:[[0,0],[1145,0],[1145,470],[0,470]]
    };
    const orden=['piernaI','piernaD','brazoI','brazoD','cabeza'];
    const trazar=poly=>{c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
    const pieza=(id,px,py,giro=0)=>{
      c.save();c.translate(px,py);c.rotate(giro);c.translate(-px,-py);
      if(id!=='cuerpo'){trazar(regiones[id]);c.clip();}
      const fin=id==='cuerpo'?orden.length:orden.indexOf(id);
      for(let i=0;i<fin;i++){c.beginPath();c.rect(-20,-20,W+40,H+40);const poly=regiones[orden[i]];poly.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip('evenodd');}
      c.drawImage(imagen,0,0,W,H);c.restore();
    };
    c.save(); c.imageSmoothingEnabled=!pixel; c.translate(-40,-101); c.scale(80/W,101/H); c.translate(W/2,H);c.rotate(balance);c.translate(-W/2,-H);
    const lanzamiento=o.st==='ataque'&&o.atk==='rocas' ? Math.sin(Math.min(1,(o.at||0)/.65)*Math.PI)*.28 : 0;
    pieza('piernaI',420,870,-andar*.075);
    pieza('piernaD',720,870,andar*.075);
    pieza('brazoI',330,555,-.03*Math.sin(t*2)-andar*.04);
    pieza('brazoD',815,555,.03*Math.sin(t*2)+lanzamiento+andar*.04);
    pieza('cabeza',570,480,Math.sin(t*1.4)*.008);
    pieza('cuerpo',570,780,0);
    c.restore();
    if (abierto) { c.save();c.globalAlpha=.2+.08*Math.sin(t*7);c.strokeStyle='#9ffff1';c.lineWidth=.8;c.beginPath();c.arc(0,-89,6.5,0,Math.PI*2);c.stroke();c.restore(); }
  }
  function solarCarrera(c,t,pixel,lateralPropio) {
    const W=1312,H=1199, imagen = lateralPropio && lateralPropio.complete && lateralPropio.naturalWidth ? lateralPropio : (pixel ? (versionPixel(arteLateral)||arteLateral) : arteLateral);
    const paso = Math.sin(t*13), rebote = Math.max(0,Math.sin(t*26))*1.4;
    c.save(); c.imageSmoothingEnabled=!pixel; c.translate(-41,-90-rebote); c.scale(82/W,90/H);
    // Ambos apoyos se alternan sin separar las piezas del cuerpo.
    const parte=(poligono,dx,dy) => { c.save();c.translate(dx,dy);c.beginPath();poligono.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();c.drawImage(imagen,0,0,W,H);c.restore(); };
    parte([[0,790],[650,790],[650,1199],[0,1199]],paso*24,-Math.max(0,paso)*22);
    parte([[650,790],[1312,790],[1312,1199],[650,1199]],-paso*24,-Math.max(0,-paso)*22);
    parte([[0,0],[1312,0],[1312,790],[0,790]],0,0);
    c.restore();
  }
  function pintar(c,o,f,n) {
    const t=f.t||0, id=Math.max(1,Math.min(10,+n||1)), H=o.hgt||92, k=H/92, abierto=o.st==='ventana'||o.st==='herido', salto=o.jump||0, y=JEFES_EXT.FLOOR-salto+Math.min(0,o.drop||0);
    const paso=(o.charging?Math.sin(t*16)*4:Math.sin(t*3)*1.3), golpe=o.st==='ataque'&&o.atk==='rocas'?Math.sin(Math.min(1,o.at||0)*Math.PI)*9:0, pis=o.st==='ataque'&&o.atk==='pisoton'?Math.max(0,Math.sin((o.at||0)*4))*3:0;
    c.save();c.translate(o.x,y);c.scale(o.face||1,1);c.scale(k,k);c.translate(0,-pis);c.lineJoin='round';
    c.fillStyle='rgba(95,72,48,.10)';c.beginPath();c.ellipse(0,0,25,2,0,0,Math.PI*2);c.fill();
    if (id === 1) { solar(c,t,o,abierto,paso,golpe,f.st); c.restore(); return; }
    const baja=id===2||id===8, flot=id===5, alto=id===3||id===7, roca=id===6, ceiba=id===9, ancho=id===4||id===10;
    if (ceiba) {c.strokeStyle='#67513a';c.lineWidth=4;for(const s of [-1,1]){c.beginPath();c.moveTo(s*8,-60);c.quadraticCurveTo(s*35,-78,s*29,-100);c.moveTo(s*21,-83);c.lineTo(s*35,-91);c.moveTo(s*6,-20);c.quadraticCurveTo(s*18,-4,s*30,0);c.stroke();}}
    if (baja) {
      bloque(c,-29,-42+paso,15,40,tonos.sombra);bloque(c,14,-42-paso,15,40,tonos.medio);bloque(c,-31,-10+paso,18,10,tonos.claro,false);bloque(c,13,-10-paso,18,10,tonos.claro,false);
      piedra(c,-28,-67,56,42,tonos.medio); for(let i=0;i<3;i++)bloque(c,-22+i*16,-75-i%2*4,12,14,tonos.claro,false);
      rostro(c,2,-55,34,29,t,abierto,true); if(id===8){c.strokeStyle='#66824b';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-25+i*9,-58);c.quadraticCurveTo(-18+i*9,-42,-25+i*9,-28);c.stroke();}}
    } else {
      const torsoY=alto?-69:-64, torsoH=alto?47:40, cuerpoW=ancho?46:roca?49:35, hueco=flot?3:0;
      bloque(c,-20,-19+paso,16,18,tonos.sombra);bloque(c,4,-19-paso,16,18,tonos.medio);bloque(c,-22,-6+paso,19,6,tonos.claro,false);bloque(c,4,-6-paso,19,6,tonos.claro,false);
      if(roca){piedra(c,-26,torsoY-5,52,52,tonos.sombra);piedra(c,-21,torsoY,42,43,tonos.medio);} else if(flot){for(let j=0;j<2;j++)for(let i=0;i<3;i++)bloque(c,-19+i*14+(i===1?Math.sin(t*2)*2:0),torsoY+j*20+(j?2:-2),11,17,(i+j)%2?tonos.claro:tonos.medio,false);} else {bloque(c,-cuerpoW/2,torsoY,cuerpoW,torsoH,tonos.medio,false);glifo(c,0,torsoY+torsoH*.58,1.05);}
      const armY=torsoY+4, brazo=ancho?17:13;
      for(const s of [-1,1]){const x=s<0?-cuerpoW/2-brazo+2:cuerpoW/2-2, ay=armY+(s>0?-golpe:golpe*.3); bloque(c,x,ay,brazo,16,tonos.claro);bloque(c,x+(s<0?-2:1),ay+17+hueco,brazo+2,id===10?23:18,tonos.medio); if(id===10)bloque(c,x+(s<0?-4:0),ay+30,brazo+7,14,tonos.claro,false);}
      if(id===4){for(let i=0;i<3;i++)bloque(c,-23+i*16,-91,15,12,i===1?tonos.claro:tonos.sombra,false);rect(c,-25,-79,50,6,tonos.rojo);}
      if(id===1){for(let i=-3;i<=3;i++)bloque(c,i*8-4,-100+Math.abs(i)*3,8,18,i%2?tonos.rojo:tonos.claro,false);}
      if(alto){bloque(c,-13,-101,26,18,tonos.sombra);for(const s of [-1,1]){bloque(c,s<0?-30:18,-91,12,12,tonos.rojo);bloque(c,s<0?-34:22,-82,12,7,tonos.claro,false);}}
      if(flot){for(const s of [-1,1]){bloque(c,s<0?-34:23,-100,11,15,tonos.rojo);bloque(c,s<0?-27:17,-80,10,9,tonos.claro,false);}}
      rostro(c,0,alto?-90:-87,alto?23:30,alto?27:25,t,abierto,false);
      if(id===7){rect(c,-5,-63,10,33,tonos.rojo);glifo(c,0,-49,.5);}
      if(roca||ceiba){c.fillStyle=tonos.musgo;for(let i=0;i<6;i++){c.beginPath();c.ellipse(-22+i*8,-64+(i%2)*3,5,2,0,0,Math.PI*2);c.fill();}}
    }
    c.restore();
  }
  const original=JEFES_EXT.BODY.golem;
  JEFES_EXT.CORE.golem = o => {
    let n = o.modeloMascaron;
    if (n == null) n = 1;
    return { x:o.x + (n === 1 ? 0 : o.face * 2), y:JEFES_EXT.FLOOR - o.hgt + (n === 1 ? 2 : 6), r:8 };
  };
  JEFES_EXT.BODY.golem=(c,o,f)=>{const n=o.modeloMascaron == null ? 1 : o.modeloMascaron; if(n===1&&JEFES_EXT.FORGE_READY?.('golem')&&!(typeof MASCARON_ESTILOS!=='undefined'&&MASCARON_ESTILOS.obtener(f.st))) return original(c,o,f); if(n>=1&&n<=10) pintar(c,o,f,n); else original(c,o,f);};
  return { nombres, pintar };
})();
