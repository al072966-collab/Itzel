'use strict';
// Xtabay de la ceiba: una aparición flotante, no una reina con alas.
(() => {
  const X=JEFES_EXT, anterior=X.BODY.hadas, art=new Image();
  art.src='../Roguelike/assets/jefes/xtabay-perfil.png';
  const estilos=new Set(['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','vapor','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura']);
  const imagenes=Object.create(null), cache=new Map();
  function obtener(estilo){
    const id=String(window.estiloArteDerivado||estilo&&estilo.id||'').split('~')[0];
    if(!estilos.has(id))return null;
    if(!imagenes[id]){const im=new Image();im.src='../Roguelike/assets/jefes/xtabay-estilos/'+id+'.png';imagenes[id]=im;}
    const im=imagenes[id];return im.complete&&im.naturalWidth?im:null;
  }
  window.XTABAY_ESTILOS={obtener};
  // Cada píxel pertenece a una sola pieza: los recortes nunca se solapan.
  const mascaras = [
    {id:'pieIzq', puntos:[[260,1536],[260,1340],[365,1190],[470,1020],[565,1020],[565,1170],[480,1330],[435,1536]]},
    {id:'pieDer', puntos:[[565,1536],[565,1200],[600,1110],[750,1110],[750,1536]]},
    {id:'brazoIzq', puntos:[[363,709],[400,651],[490,600],[650,410],[711,398],[733,461],[660,540],[526,680],[408,748],[363,748]]},
    {id:'brazoDer', puntos:[[870,487],[904,487],[937,590],[1018,735],[1024,820],[957,820],[919,725],[863,600]]},
    {id:'cabello', puntos:[[0,0],[690,0],[690,285],[615,390],[510,520],[365,650],[350,860],[0,915]]}
  ];
  function construir(fuente,silueta,gameboy){
    if(!fuente.complete||!fuente.naturalWidth)return null;
    if(cache.has(fuente))return cache.get(fuente);
    const w=512,h=768,src=document.createElement('canvas');src.width=w;src.height=h;
    const sx=src.getContext('2d',{willReadFrequently:true});sx.drawImage(fuente,0,0,w,h);
    try { const pix=sx.getImageData(0,0,w,h),d=pix.data;
    for(let i=0;i<d.length;i+=4){
      d[i+3]=d[i+3]<210?0:255;
      if(silueta&&d[i+3]){const n=i/4,x=n%w,y=Math.floor(n/w),ojo=x>370&&y<170&&d[i]>120&&d[i]>d[i+1]*1.5&&d[i]>d[i+2]*1.4;if(ojo){d[i]=255;d[i+1]=32;d[i+2]=24;}else{d[i]=10;d[i+1]=8;d[i+2]=8;}}
      else if(gameboy&&d[i+3]&&(d[i]*.3+d[i+1]*.59+d[i+2]*.11)>150){d[i]=100;d[i+1]=145;d[i+2]=60;}
    }
    sx.putImageData(pix,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    const mascara=(ctx,pts)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x/2,y/2):ctx.moveTo(x/2,y/2));ctx.closePath();};
    const disponibles=document.createElement('canvas');disponibles.width=w;disponibles.height=h;const dx=disponibles.getContext('2d');dx.drawImage(src,0,0);
    const piezas={};
    for(const m of mascaras){
      const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
      x.save();mascara(x,m.puntos);x.clip();x.drawImage(disponibles,0,0);x.restore();piezas[m.id]=c;
      dx.save();dx.globalCompositeOperation='destination-out';mascara(dx,m.puntos);dx.fill();dx.restore();
    }
    piezas.cuerpo=disponibles;
    piezas.contorno=document.createElement('canvas');piezas.contorno.width=w;piezas.contorno.height=h;
    const cx=piezas.contorno.getContext('2d');cx.drawImage(src,0,0);cx.globalCompositeOperation='source-in';cx.fillStyle='#0f380f';cx.fillRect(0,0,w,h);
    cache.delete(fuente);cache.set(fuente,piezas);
    if(cache.size>4)cache.delete(cache.keys().next().value);
    return piezas;
  }
  const pasoAnterior=X.STEP.hadas;
  X.STEP.hadas=(o,g,dt)=>{
    const x=o.x;pasoAnterior(o,g,dt);const dx=o.x-x,p=g&&g.p;
    // En combate mira hacia Itzel; en la vista de cerca acompaña su avance.
    if(p&&p.vis!==false&&Math.abs(p.x-o.x)>12)o.xtFace=Math.sign(p.x-o.x);
    else if((!p||p.vis===false)&&Math.abs(dx)>.06)o.xtFace=Math.sign(dx);
  };
  X.CORE.hadas = o => ({x:o.x-(o.xtFace||1)*3,y:o.y-17,r:8});
  X.BODY.hadas=(c,o,f)=>{
    if(X.FORGE_READY?.('hadas') && !obtener(f.st))return anterior(c,o,f);
    const t=f.t||0,esPixel=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base)),propia=obtener(f.st),id=String(window.estiloArteDerivado||f.st&&f.st.id||'').split('~')[0],silueta=id==='hollin',partes=construir(propia||art,silueta&&!!propia,id==='gameboy'&&!!propia);
    if(!partes)return anterior(c,o,f);
    const abierto=o.st==='ventana'||o.st==='herido', ataca=o.st==='ataque';
    c.save();c.translate(o.x,o.y);c.scale(o.xtFace||1,1);c.imageSmoothingEnabled=!esPixel;
    if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    // Todas las capas se obtienen de regiones excluyentes del dibujo original.
    c.translate(-35,-25);c.scale(46/1024,69/1536);
    // La paleta de Game Boy comparte el tono del cielo y del vestido:
    // un borde oscuro mantiene visible la silueta sobre el fondo.
    if(id==='gameboy')for(const [x,y] of [[-14,0],[14,0],[0,-14],[0,14],[-10,-10],[10,-10],[-10,10],[10,10]])c.drawImage(partes.contorno,x,y,1024,1536);
    const parte=(id,px,py,a)=>{c.save();c.translate(px,py);c.rotate(a);c.translate(-px,-py);c.drawImage(partes[id],0,0,1024,1536);c.restore();};
    const ritmo=Math.sin(t*2.5)*(silueta?.55:1), oleaje=Math.sin(t*1.7)*(silueta?.55:1), fase=o.at||0;
    const gesto=ataca ? (o.atk==='secuestro' ? -.20-.10*Math.sin(fase*4) : o.atk==='polvo' ? .14*Math.sin(fase*7) : .17*Math.sin(fase*5)) : 0;
    parte('cabello',660,300,oleaje*.045);
    parte('pieIzq',515,1060,ritmo*.10);
    parte('pieDer',650,1140,-ritmo*.10);
    parte('cuerpo',760,500,0);
    parte('brazoIzq',700,420,ritmo*.09+gesto);
    parte('brazoDer',890,490,-ritmo*.09-gesto*.7);

    c.restore();
    if(abierto&&!silueta){ c.save();c.globalCompositeOperation='lighter';glowDot(c,o.x-(o.xtFace||1)*3,o.y-17,8,'#d9f4e7',.35+.1*Math.sin(t*6));c.restore(); }
  };
})();
