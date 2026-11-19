'use strict';
(function(){
  if(typeof vestirNivel!=='function')return;
  const C=vestirNivel({id:'paper',nivel:'cocina',carpeta:'cocina-detalles',ver:1});
  const P=vestirNivel({id:'agua',nivel:'pesca',carpeta:'pesca-detalles',ver:1});
  // cocina: tira de papel picado con distintos cortes sobre la ventanilla y, en el piso, canastas, ollas y fruta (lejos de las zonas de juego)
  window.COCINA_DETALLES={todo:C.todo,pinta(c){if(!C.todo())return;
    [[20,'papel'],[98,'papel2'],[180,'papel3'],[262,'papel4'],[340,'papel5'],[400,'papel1']].forEach(([x,n])=>C.spr(c,n,x,10,{ay:.5,alfa:.75}));
    [[14,'canasta0'],[408,'canasta3'],[44,'olla'],[380,'molcajete'],[28,'mango'],[398,'maiz'],[60,'limon'],[366,'habanero']].forEach(([x,n],i)=>C.spr(c,n,x,i<4?236:i<6?208:238,{ay:1,alfa:.9}));
    C.spr(c,'flor0',212,100,{ay:.5,alfa:.9});
    ambienteCocina(c)}};
  // ambiente del mercado (solo decoración, lejos de lo jugable): rayos de sol por la ventanilla, ristras de chile y ajo, vapor de las ollas y aroma que sube
  function ambienteCocina(c){
    const t=performance.now()/1000;
    c.save();c.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){const x=90+k*110+Math.sin(t*.3+k)*6,g=c.createLinearGradient(x,18,x-40,240);g.addColorStop(0,'rgba(255,225,150,.16)');g.addColorStop(1,'rgba(255,225,150,0)');c.fillStyle=g;c.beginPath();c.moveTo(x-8,18);c.lineTo(x+10,18);c.lineTo(x-30,240);c.lineTo(x-70,240);c.closePath();c.fill()}
    c.restore();
    for(const [x0,col] of [[8,'#c2342a'],[417,'#d9482a'],[30,'#e8dcc0']]){c.strokeStyle='#6b4a2a';c.lineWidth=.8;c.beginPath();c.moveTo(x0,16);c.lineTo(x0+Math.sin(t*.7+x0)*1.2,58);c.stroke();for(let j=0;j<6;j++){const y=24+j*6,sw=Math.sin(t*.7+x0+j*.4)*1.2;c.fillStyle=col;c.beginPath();c.ellipse(x0+sw-2.4,y,1.4,3,.3,0,6.3);c.fill();c.beginPath();c.ellipse(x0+sw+2.4,y+2,1.4,3,-.3,0,6.3);c.fill()}}
    for(const x0 of [46,380]){for(let q=0;q<7;q++){const ph=(t*.22+q/7)%1,x=x0+Math.sin(ph*6+q)*(3+ph*7),y=232-ph*80,r=2+ph*6;c.fillStyle='rgba(255,250,240,'+(.22*Math.sin(ph*Math.PI)).toFixed(3)+')';c.beginPath();c.arc(x,y,r,0,6.3);c.fill()}}
  }
  // pesca: más corales, algas y conchas en el fondo; estrellas y un canasto sobre la arena
  window.PESCA_DETALLES={todo:P.todo,pinta(c,fondo){if(!P.todo())return;
    [[45,'alga'],[100,'abanico'],[155,'coral'],[210,'tubos'],[272,'alga2'],[320,'cerebro'],[380,'coral'],[412,'pasto'],[18,'alga3']].forEach(([x,n])=>P.spr(c,n,x,fondo+1,{alfa:.3}));
    [[70,'concha0'],[190,'estrella'],[300,'concha1'],[350,'galleta']].forEach(([x,n])=>P.spr(c,n,x,fondo+5,{alfa:.5}));}};
})();
