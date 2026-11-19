'use strict';
// Xunán Kab: reina melipona de cuerpo redondo y alas animadas.
(() => {
  const X=JEFES_EXT,anterior=X.BODY.abeja,art=new Image(),forge=new Image();
  art.src='../Roguelike/assets/jefes/xunan-kab.png';
  forge.decoding='async';forge.src='../Roguelike/assets/forge/jefes/xunan-kab-v1/processed-v2/sheet-transparent.png';
  let limpia=null,pixelada=null;
  function imagen(pixel){if(!art.complete||!art.naturalWidth)return null;if(!limpia){limpia=document.createElement('canvas');limpia.width=656;limpia.height=600;const x=limpia.getContext('2d',{willReadFrequently:true});x.drawImage(art,0,0,656,600);const im=x.getImageData(0,0,656,600),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]<205?0:255;x.putImageData(im,0,0);}if(!pixel)return limpia;if(!pixelada){pixelada=document.createElement('canvas');pixelada.width=100;pixelada.height=91;pixelada.getContext('2d').drawImage(limpia,0,0,100,91);}return pixelada;}
  function cuadro(o,t){if(o.st==='ventana'||o.st==='herido'||o.st==='muere')return 3;if(o.st==='ataque'&&o.atk==='aguijon')return 2;if(o.st==='aviso')return o.atk==='aguijon'?2:1;if(o.st==='ataque')return 1;return Math.floor(t*4)%2;}
  function original(c,o,f,t,px,abierto,clavada){const im=imagen(px);if(!im){anterior(c,o,f);return;}c.imageSmoothingEnabled=!px;c.translate(-43,-45);c.scale(70/1312,66/1199);const pieza=(pol,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.translate(-x,-y);c.beginPath();pol.forEach(([u,v],i)=>i?c.lineTo(u,v):c.moveTo(u,v));c.closePath();c.clip();c.drawImage(im,0,0,1312,1199);c.restore();};const w=Math.sin(t*(abierto?7:24))*.09,izq=[[0,0],[590,0],[590,400],[425,530],[0,620]],der=[[860,0],[1312,0],[1312,620],[1080,535],[860,410]],traza=pol=>{pol.forEach(([u,v],i)=>i?c.lineTo(u,v):c.moveTo(u,v));c.closePath();};pieza(izq,560,460,-w);pieza(der,940,480,w);c.save();c.beginPath();c.rect(0,0,1312,1199);traza(izq);traza(der);c.clip('evenodd');c.drawImage(im,0,0,1312,1199);c.restore();}
  X.BODY.abeja=(c,o,f)=>{
    const t=f.t||0,px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base)),abierto=o.st==='ventana'||o.st==='herido',clavada=o.st==='ataque'&&o.atk==='aguijon'&&o.at>.9&&o.at<2.1,frame=cuadro(o,t);
    c.save();c.translate(o.x,o.y);c.scale(o.face||1,1);if(o.stunT>0)c.rotate(Math.sin(t*6)*.14);if(clavada)c.rotate(.25);if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    if(forge.complete&&forge.naturalWidth){const cajas=[[19,31,217,193],[19,54,217,148],[19,33,217,190],[19,46,217,164]],r=cajas[frame];c.imageSmoothingEnabled=!px;c.drawImage(forge,(frame%2)*256+r[0],Math.floor(frame/2)*256+r[1],r[2],r[3],-35,-33,70,66);}
    else original(c,o,f,t,px,abierto,clavada);
    c.restore();if(abierto){const k=X.CORE.abeja(o);c.save();c.globalCompositeOperation='lighter';glowDot(c,k.x,k.y,8,'#fff1ab',.4+.12*Math.sin(t*6));c.restore();}
  };
})();
