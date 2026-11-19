'use strict';
// Faroles y diablitos; las piñatas de siete picos y las velas conservan sus estados originales.
(function(){
  if(typeof vestirNivel!=='function'||typeof STYLE_MAP==='undefined'||!STYLE_MAP.hielo)return;
  const V=vestirNivel({id:'hielo',nivel:'posadas',carpeta:'posadas-detalles',ver:1}),{spr}=V;
  // cielo: guirnaldas de papel picado que cruzan la calle, con poco parallax (festivo y sin tapar lo jugable)
  V.cielo((c,f,antes)=>{antes();
    // la estrella de Belén: una estrella dorada con rayos que giran despacio y un halo que late
    const ex=96-((f.cam*.02)%30), ey=44, pl=.85+.15*Math.sin(f.t*2);
    c.save(); c.globalCompositeOperation='lighter'; glowDot(c,ex,ey,34,'#ffe6a0',.32*pl);
    c.translate(ex,ey); c.rotate(f.t*.12);
    for(let r=0;r<8;r++){c.rotate(Math.PI/4);c.fillStyle='rgba(255,236,170,'+(r%2?.55:.8)*pl+')';c.beginPath();c.moveTo(0,-(r%2?9:15));c.lineTo(2.2,-3);c.lineTo(-2.2,-3);c.closePath();c.fill();}
    c.restore();
    // hilos de foquitos de colores entre las casas: cada foco titila con su ritmo
    const COL=['#ff5a4a','#ffd24a','#5acf6a','#4aa8ff','#e86ad0'],uh=170,offh=(f.cam*.18)%uh,baseh=Math.floor(f.cam*.18/uh);
    for(let k=-1;k*uh-offh<VW+uh;k++){
      const i=baseh+k,x0=k*uh-offh,y0=86+(i%3)*7;
      c.strokeStyle='rgba(60,40,30,.7)';c.lineWidth=.6;c.beginPath();for(let q=0;q<=12;q++){const u=q/12,x=x0+u*uh,y=y0+Math.sin(u*Math.PI)*10;q?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
      c.save();c.globalCompositeOperation='lighter';
      for(let q=1;q<12;q++){const u=q/12,x=x0+u*uh,y=y0+Math.sin(u*Math.PI)*10+2,a=.55+.45*Math.sin(f.t*3+q*1.3+i),col=COL[(q+i)%5];glowDot(c,x,y,3.4+a*1.4,col,.55*a);c.fillStyle=col;c.fillRect(x-.8,y-.8,1.6,1.6);}
      c.restore();
    }const u=240,off=(f.cam*.25)%u,base=Math.floor(f.cam*.25/u);for(let k=-1;k*u-off<VW+u;k++){const i=base+k;spr(c,'papel'+Math.floor(V.h1(i,3)*3),k*u-off+V.h1(i,5)*30,34+V.h1(i,7)*18+Math.sin(f.t*.8+i)*.8,{ay:0,alfa:.85});}});
  V.terreno(c=>{
    if(V.listo('nieveCap')){const w=V.TAM.nieveCap.w;c.save();allLoopsPath(c,L.loops);c.clip();for(const r of L.tops)for(let x=r.x0;x<r.x1;x+=w)spr(c,'nieveCap',x,r.y-1,{ax:0,ay:0});c.restore();}
    for(const o of L.deco){const x=o.x+8,y=o.y+.5,i=o.i,v=V.h1(i,7);
      if(o.k==='T')spr(c,'farolillo'+(i%7),x,o.y-18,{alfa:.9});
      else if(o.k==='f')spr(c,['poinsettia','arbusto','caja','barril','sacos','rocaChica'][i%6],x,y,{voltea:v<.5});
      else if(o.k==='r')spr(c,['fuente','nacimiento','rocas','reyes','vela0','vela1'][i%6],x,y);}
  });
  V.fd('diablito',(c,e,t,s,antes)=>{
    if(e.st==='sleep')return V.dormido(c,'diablito0',t);
    const hoja=window.ENEMIGOS_ASSETS?.hojaForge('diablito');
    if(hoja?.complete&&hoja.naturalWidth&&e.st!=='gone'&&e.st!=='stun'&&!(e.aturde>0))return antes(c,e,t,s);
    spr(c,Math.sin((e.anim||t)*7)>0?'diablito1':'diablito0',0,.5);
  },'diablito0');
  window.POSADAS_DETALLES=V;
})();
