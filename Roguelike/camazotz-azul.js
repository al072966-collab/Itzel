'use strict';
// Camazotz de la cueva, con alas articuladas y el jade en el pecho.
(() => {
  const X=JEFES_EXT,anterior=X.BODY.camazotz,art=new Image(); art.src='../Roguelike/assets/jefes/camazotz-azul.png';let limpia=null,pixelada=null;
  function img(pixel){if(!art.complete||!art.naturalWidth)return null;if(!limpia){limpia=document.createElement('canvas');limpia.width=768;limpia.height=512;const x=limpia.getContext('2d',{willReadFrequently:true});x.drawImage(art,0,0,768,512);try { const im=x.getImageData(0,0,768,512),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]<210?0:255;x.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }}if(!pixel)return limpia;if(!pixelada){pixelada=document.createElement('canvas');pixelada.width=128;pixelada.height=85;pixelada.getContext('2d').drawImage(limpia,0,0,128,85);}return pixelada;}
  X.BODY.camazotz=(c,o,f)=>{if(X.FORGE_READY?.('camazotz')||(window.visorJefeNitido&&X.CAMAZOTZ_HD_READY?.()))return anterior(c,o,f);const t=f.t||0,px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base)),im=img(px);if(!im)return anterior(c,o,f);const abierto=o.st==='ventana'||o.st==='herido';c.save();c.translate(o.x,o.y);if(o.stunT>0)c.rotate(Math.sin(t*6)*.08);else if(o.st==='ataque'&&o.atk==='picada'&&o.at>.8&&o.at<2.1)c.rotate((o.lado||1)*.18*Math.sin((o.at-.8)/1.3*Math.PI));if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';c.imageSmoothingEnabled=!px;c.translate(-50,-36);c.scale(100/1536,66/1024);
    const ala=(poly,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.translate(-x,-y);c.beginPath();poly.forEach(([u,v],i)=>i?c.lineTo(u,v):c.moveTo(u,v));c.closePath();c.clip();c.drawImage(im,0,0,1536,1024);c.restore();};
    const a=Math.sin(t*(o.st==='ataque'?9:6))*.105, pie=Math.sin(t*3)*.045;
    // Alas, patas y tronco usan regiones contiguas: no hay partes repetidas.
    ala([[0,0],[570,0],[570,1024],[0,1024]],570,470,-a);
    ala([[966,0],[1536,0],[1536,1024],[966,1024]],966,470,a);
    ala([[570,0],[966,0],[966,720],[570,720]],768,500,0);
    ala([[570,720],[768,720],[768,1024],[570,1024]],675,720,pie);
    ala([[768,720],[966,720],[966,1024],[768,1024]],860,720,-pie);
    c.restore();if(abierto){c.save();c.globalCompositeOperation='lighter';glowDot(c,o.x,o.y+4,8,'#a7f8d4',.36+.12*Math.sin(t*6));c.restore();}};
})();
