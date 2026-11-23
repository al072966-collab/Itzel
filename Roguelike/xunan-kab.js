'use strict';
// Xunán Kab: reina melipona de cuerpo redondo y alas animadas.
(() => {
  const X=JEFES_EXT,anterior=X.BODY.abeja,art=new Image(),forge=new Image();
  art.src='../Roguelike/assets/jefes/xunan-kab.png';
  forge.decoding='async';forge.src='../Roguelike/assets/forge/jefes/xunan-kab-v1/processed-v2/sheet-transparent.png';
  let limpia=null,pixelada=null;
  function imagen(pixel){if(!art.complete||!art.naturalWidth)return null;if(!limpia){limpia=document.createElement('canvas');limpia.width=656;limpia.height=600;const x=limpia.getContext('2d',{willReadFrequently:true});x.drawImage(art,0,0,656,600);const im=x.getImageData(0,0,656,600),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]<205?0:255;x.putImageData(im,0,0);}if(!pixel)return limpia;if(!pixelada){pixelada=document.createElement('canvas');pixelada.width=100;pixelada.height=91;pixelada.getContext('2d').drawImage(limpia,0,0,100,91);}return pixelada;}
  function cuadro(o,t){if(o.st==='ventana'||o.st==='herido'||o.st==='muere')return 3;if(o.st==='ataque'&&o.atk==='aguijon')return 2;if(o.st==='aviso')return o.atk==='aguijon'?2:1;if(o.st==='ataque')return 1;return Math.floor(t*4)%2;}
  function original(c,o,f,t,px,abierto,clavada){const im=imagen(px);if(!im){anterior(c,o,f);return;}c.imageSmoothingEnabled=!px;c.translate(-43,-45);c.scale(70/1312,66/1199);const pieza=(pol,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.translate(-x,-y);c.beginPath();pol.forEach(([u,v],i)=>i?c.lineTo(u,v):c.moveTo(u,v));c.closePath();c.clip();c.drawImage(im,0,0,1312,1199);c.restore();};const ritmo=abierto?7:o.st==='ataque'&&o.atk==='enjambre'?19:13, fuerza=o.stunT>0?.035:o.st==='ataque'&&o.atk==='aguijon'?.045:.105;const w=Math.sin(t*ritmo)*fuerza,izq=[[0,0],[590,0],[590,400],[425,530],[0,620]],der=[[860,0],[1312,0],[1312,620],[1080,535],[860,410]],traza=pol=>{pol.forEach(([u,v],i)=>i?c.lineTo(u,v):c.moveTo(u,v));c.closePath();};pieza(izq,560,460,-w);pieza(der,940,480,w);c.save();c.beginPath();c.rect(0,0,1312,1199);traza(izq);traza(der);c.clip('evenodd');c.drawImage(im,0,0,1312,1199);c.restore();}
  X.BODY.abeja=(c,o,f)=>{
    const t=f.t||0, a=o.at||0, px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base));
    const abierto=o.st==='ventana'||o.st==='herido', ataque=o.st==='ataque';
    const clavada=ataque&&o.atk==='aguijon'&&a>.9&&a<2.1;
    const im=imagen(px);
    if(!im){ anterior(c,o,f); return; }
    // El mismo cuerpo y su corona se usan en vuelo, ataques, daño y descanso.
    // El giro es alrededor de la corona, que coincide con el núcleo de colisión.
    let giro=Math.sin(t*2.5)*.025;
    if(ataque&&o.atk==='aguijon') giro+=.20*Math.sin(Math.PI*Math.min(1,Math.max(0,(a-.65)/1.6)));
    if(ataque&&o.atk==='miel') giro+=.055*Math.sin(a*4)*Math.min(1,a*2);
    if(ataque&&o.atk==='enjambre') giro+=.045*Math.sin(a*6)*Math.min(1,a*2);
    if(o.st==='herido'||o.flash>0) giro+=.11*Math.sin(a*18)*Math.exp(-a*3.5);
    if(o.stunT>0) giro+=Math.sin(t*6)*.08;
    c.save();c.translate(o.x,o.y);c.scale(o.face||1,1);
    c.translate(4,-19);c.rotate(giro);c.translate(-4,19);
    if(o.st==='muere')c.globalAlpha*=clamp(1-a/2.4,0,1);
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    original(c,o,f,t,px,abierto,clavada);
    c.restore();
    if(abierto){const k=X.CORE.abeja(o);c.save();c.globalCompositeOperation='lighter';glowDot(c,k.x,k.y,8,'#fff1ab',.4+.12*Math.sin(t*6));c.restore();}
  };
})();
