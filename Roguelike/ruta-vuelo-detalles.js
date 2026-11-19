'use strict';
(function(){
 if(typeof vestirNivel!=='function')return;
 const V=vestirNivel({id:'cielo',nivel:'vuelo',carpeta:'vuelo-detalles',ver:1});
 const hh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967296};
 const TINTA='47,75,82';
 // noche de Edzná: nebulosa a la deriva, estrellas que titilan con paralaje, luna creciente y estrellas fugaces (solo fondo)
 function cieloEstrellado(c,t){
  c.save();
  for(let k=0;k<2;k++){const x=((k*300-t*5)%560+560)%560-80,y=70+k*110,g=c.createRadialGradient(x,y,4,x,y,110);g.addColorStop(0,k?'rgba(90,200,200,.16)':'rgba(150,110,230,.18)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,120,60,.3,0,6.2832);c.fill()}
  c.save();c.beginPath();c.rect(0,0,600,300);c.arc(358,38,12,0,6.2832);c.clip('evenodd');c.fillStyle='#f4ecc8';c.beginPath();c.arc(352,42,13,0,6.2832);c.fill();c.restore();
  for(let i=0;i<70;i++){const par=.4+hh(i,1)*1.6,x=((hh(i,2)*560-t*par*7)%560+560)%560-60,y=hh(i,3)*232,tw=.35+.65*Math.abs(Math.sin(t*(.8+hh(i,4)*2)+i));c.globalAlpha=tw*.9;c.fillStyle=i%5?'#fff3c4':'#bfe8ff';c.fillRect(x,y,i%7?1:1.6,i%7?1:1.6);if(i%11===0){c.fillRect(x-2.5,y+.3,6,.5);c.fillRect(x+.3,y-2.5,.5,6)}}
  c.globalAlpha=1;c.lineCap='round';
  for(let m=0;m<3;m++){const per=7+m*2.3,T=(t+m*3.1)%per;if(T<.9){const u=T/.9,n=Math.floor((t+m*3.1)/per),x0=60+hh(n*3+m,5)*380,y0=10+hh(n*3+m,6)*80,x=x0-u*110,y=y0+u*60;const g=c.createLinearGradient(x,y,x+34,y-18);g.addColorStop(0,'rgba(255,248,210,'+(.9*Math.sin(u*Math.PI)).toFixed(3)+')');g.addColorStop(1,'rgba(255,248,210,0)');c.strokeStyle=g;c.lineWidth=1.3;c.beginPath();c.moveTo(x,y);c.lineTo(x+34,y-18);c.stroke()}}
  c.restore()
 }
 window.VUELO_DETALLES={todo:V.todo,pinta(c,t){cieloEstrellado(c,t);if(V.todo())for(let i=0;i<4;i++){let x=((i*135-t*12)%560+560)%560-50;V.spr(c,'constelacion',x,48+i%2*125,{ay:.5,alfa:.25})}}};
})();
