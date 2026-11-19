'use strict';
(function(){
 if(typeof vestirNivel!=='function')return;
 const H=vestirNivel({id:'bordado',nivel:'bordado',carpeta:'hipil-detalles',ver:1});
 const J=vestirNivel({id:'nouveau',nivel:'jarana',carpeta:'jarana-detalles',ver:1});
 // la flor de la lámina se borda a punto de cruz (PUNTO.aPunto, como los rosetones del modo): pintada
 // tal cual desentonaba con la tela; queda en la franja alta de la manta, lejos de lo que se pisa
 window.HIPIL_DETALLES={todo:H.todo,pinta(c,u0,w){if(!H.todo())return;const PT=typeof PUNTO!=='undefined'?PUNTO:null;
  for(let k=Math.floor((u0-20)/180);k<=(u0+w+20)/180;k++){const cx=k*180+80,cy=90,tm=H.TAM.flor,fw=tm.w,fh=tm.h;
   if(PT&&PT.aPunto)PT.aPunto(c,Math.round(cx-fw/2),Math.round(cy-fh/2),Math.ceil(fw),Math.ceil(fh),2,x=>{H.spr(x,'flor',cx,cy,{ay:.5})});
   else H.spr(c,'flor',cx,cy,{ay:.5,alfa:.65});}}};
 // jarana: guirnalda de flores y papel picado arriba, iglesia y arcadas lejanas con transparencia, y farolas y guitarra en los bordes
 window.JARANA_DETALLES={todo:J.todo,pinta(c){if(!J.todo())return;
  [[40,'papelA'],[105,'papelB'],[170,'papelC'],[235,'papelD'],[300,'papelE'],[365,'papelF']].forEach(([x,n],i)=>J.spr(c,n,x,6+Math.sin(i*1.7)*2,{ay:0,alfa:.7}));
  J.spr(c,'guirnalda',213,14,{ay:0,alfa:.55});
  for(const x of [135,292])J.spr(c,'farol',x,120,{ay:.5,alfa:.7});
  }};
})();
