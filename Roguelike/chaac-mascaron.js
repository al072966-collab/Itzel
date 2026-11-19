'use strict';
// Chaac: mascarón de piedra y nube que respira, con los ataques originales.
(() => {
  const X=JEFES_EXT, anterior=X.BODY.chaac, art=new Image();art.src='../Roguelike/assets/jefes/chaac-mascaron.png';
  const acuarelaForge = new Image(); acuarelaForge.src = '../Roguelike/assets/forge/jefes/chaac-acuarela-expresiones-v1/sheet-transparent.png';
  const variantes=Object.create(null), cache=new WeakMap();
  const estilosPropios=new Set(['pixel','acuarela','paper','grabado']);
  function obtener(estilo){
    const id=String(window.estiloArteDerivado||estilo&&estilo.id||'').split('~')[0];
    if(!estilosPropios.has(id))return null;
    if(!variantes[id]){const im=new Image();im.src='../Roguelike/assets/jefes/chaac-estilos/'+id+'.png';variantes[id]=im;}
    const im=variantes[id];return im.complete&&im.naturalWidth?im:null;
  }
  window.CHAAC_ESTILOS={obtener, forge: { acuarela: ['reposo', 'ataque', 'vulnerable'] }};
  function imagen(pixel,original){
    if(!original.complete||!original.naturalWidth)return null;
    let entrada=cache.get(original);
    if(!entrada){const limpia=document.createElement('canvas');limpia.width=512;limpia.height=512;const x=limpia.getContext('2d');x.drawImage(original,0,0,512,512);entrada={limpia,pixelada:null};cache.set(original,entrada);}
    if(!pixel)return entrada.limpia;
    if(!entrada.pixelada){entrada.pixelada=document.createElement('canvas');entrada.pixelada.width=80;entrada.pixelada.height=80;entrada.pixelada.getContext('2d').drawImage(entrada.limpia,0,0,80,80);}return entrada.pixelada;
  }
  X.BODY.chaac=(c,o,f)=>{
    const t=f.t||0,propia=obtener(f.st),id=String(window.estiloArteDerivado||f.st&&f.st.id||'').split('~')[0],px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base)),img=imagen(px,propia||art);
    if(!img)return anterior(c,o,f);
    const tormenta=o.st==='ataque',abierto=o.st==='ventana'||o.st==='herido';
    c.save();c.translate(o.x,o.y);if(o.stunT>0)c.rotate(Math.sin(t*6)*.08);
    if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    const nubes=[[-27,5,10],[-19,12,12],[-8,15,12],[5,15,12],[19,11,12],[29,4,9],[-12,4,11],[12,4,11]];
    const tonos=id==='grabado'?['#242321','#c5bba5','rgba(255,250,232,.35)']:id==='paper'?['#355c78','#83bad0','rgba(247,251,235,.45)']:id==='acuarela'?['#627d90','#a7c7d1','rgba(250,251,239,.32)']:['#263b59','#435b78','rgba(179,202,219,.16)'];
    for(const [x,y,r] of nubes){const rr=r+Math.sin(t*1.8+x*.2)*.5;c.fillStyle=tonos[0];c.beginPath();c.arc(x,y+2,rr+1,0,Math.PI*2);c.fill();c.fillStyle=tonos[1];c.beginPath();c.arc(x,y,rr,0,Math.PI*2);c.fill();c.fillStyle=tonos[2];c.beginPath();c.arc(x-rr*.25,y-rr*.3,rr*.48,0,Math.PI*2);c.fill();}
    c.imageSmoothingEnabled=!px;
    if(propia){c.save();c.translate(0,Math.sin(t*1.7)*.7);c.rotate(Math.sin(t*1.1)*.025);
      if (id === 'acuarela' && acuarelaForge.complete && acuarelaForge.naturalWidth) {
        const cuadro = abierto || o.stunT > 0 ? 3 : tormenta ? 2 : t % 5.3 < .14 ? 1 : 0;
        c.drawImage(acuarelaForge, (cuadro % 2) * 256 + 28, Math.floor(cuadro / 2) * 256 + 25, 201, 207, -29, -32, 58, 58);
      } else c.drawImage(img,-29,-32,58,58);
      c.restore();}
    else {
    // Párpados: se retiran las dos regiones del rostro antes de dibujarlas
    // con su apertura animada, sin conservar otra copia debajo.
    const ojos=[[-8,-3],[7,-3]],fase=t%5.3,parpadeo=fase<.22?Math.max(.08,Math.abs(fase/.11-1)):1;
    c.save();c.beginPath();c.rect(-29,-32,58,58);for(const [x,y] of ojos){c.moveTo(x+4,y);c.ellipse(x,y,4,3,0,0,Math.PI*2);}c.clip('evenodd');c.drawImage(img,-29,-32,58,58);c.restore();
    for(const [x,y] of ojos){
      c.save();c.beginPath();c.ellipse(x,y,4,3,0,0,Math.PI*2);c.clip();
      c.fillStyle='#182a2d';c.fillRect(x-4,y-3,8,6);
      c.translate(x,y);c.scale(1,parpadeo);c.translate(-x,-y);c.drawImage(img,-29,-32,58,58);c.restore();
    }
    }
    if(tormenta){c.strokeStyle='rgba(175,229,245,.65)';c.lineWidth=.7;for(let i=0;i<7;i++){const x=-25+i*8,y=18+((t*22+i*7)%12);c.beginPath();c.moveTo(x,y);c.lineTo(x-1,y+3);c.stroke();}}
    if(abierto){c.save();c.globalCompositeOperation='lighter';glowDot(c,0,-13,8,'#b8fff0',.38+.1*Math.sin(t*6));c.restore();}
    c.restore();
  };
})();
