'use strict';
// Barco espectral de Lorencillo. La mecánica de cañones, ancla y loros no cambia.
(() => {
  const X=JEFES_EXT, anterior=X.BODY.pirata, art=new Image(); art.src='../Roguelike/assets/jefes/lorencillo-barco.png';
  let limpia=null,pixelada=null;
  function imagen(pixel){
    if(!art.complete||!art.naturalWidth)return null;
    if(!limpia){limpia=document.createElement('canvas');limpia.width=768;limpia.height=512;const x=limpia.getContext('2d',{willReadFrequently:true});x.drawImage(art,0,0,768,512);try { const im=x.getImageData(0,0,768,512),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]<210?0:255;x.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }}
    if(!pixel)return limpia;
    if(!pixelada){pixelada=document.createElement('canvas');pixelada.width=120;pixelada.height=80;pixelada.getContext('2d').drawImage(limpia,0,0,120,80);}
    return pixelada;
  }
  X.BODY.pirata=(c,o,f)=>{
    if(X.FORGE_READY?.('pirata'))return anterior(c,o,f);
    const t=f.t||0,px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base)),img=imagen(px);
    if(!img)return anterior(c,o,f);
    const ab=o.st==='ventana'||o.st==='herido', balance=o.stunT>0?Math.sin(t*5)*.06:Math.sin(t*1.2)*.018;
    c.save();c.translate(o.x,o.y);c.scale(o.face||1,1);c.rotate(balance);c.imageSmoothingEnabled=!px;
    if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    c.save();c.translate(-38,-53);c.scale(76/1536,64/1024);
    const pieza=(poly,px0,py0,a)=>{c.save();c.translate(px0,py0);c.rotate(a);c.translate(-px0,-py0);c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();c.drawImage(img,0,0,1536,1024);c.restore();};
    // Velas con un leve vaivén; el casco permanece unido a la posición del jefe.
    // Ambas regiones comparten el mismo corte: no se repite el borde del casco.
    pieza([[0,0],[1536,0],[1536,630],[0,630]],760,630,Math.sin(t*1.7)*.025);
    pieza([[0,630],[1536,630],[1536,1024],[0,1024]],760,820,0);
    c.restore();
    // Farol en la proa: señala el punto vulnerable existente.
    if(ab){c.save();c.globalCompositeOperation='lighter';glowDot(c,27,-15,9,'#abffdb',.45+.12*Math.sin(t*6));c.restore();}
    c.fillStyle=ab?'#effff4':'#a6e5c8';c.strokeStyle='#234d42';c.lineWidth=.6;c.beginPath();c.arc(27,-15,2.2,0,Math.PI*2);c.fill();c.stroke();
    c.restore();
  };
})();
