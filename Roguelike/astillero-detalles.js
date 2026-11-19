'use strict';
// Astillero: postes con polea al borde de atrás del muelle (detrás de la línea por donde se camina) y,
// colgado de algunos, un timón. Antes el timón quedaba flotando en el cielo; ahora se apoya en su poste.
(function(){
  if(typeof vestirNivel!=='function')return;
  const V=vestirNivel({id:'grabado',nivel:'abordaje',carpeta:'astillero-detalles',ver:1});
  const BORDE=158-11;                                         // Y0 - 11: la orilla de atrás del muelle, sobre el agua
  window.ASTILLERO_DETALLES={todo:V.todo,pinta(c,j){
    if(!V.todo())return;
    for(const [x,timon] of [[130,true],[410,false],[690,true],[970,false],[1250,true]]){
      const sx=x-j.cam; if(sx<-30||sx>VW+30)continue;
      V.spr(c,'polea',sx,BORDE,{ay:1,alfa:.62});
      if(timon)V.spr(c,'timon',sx+1,BORDE-17,{ay:.5,h:13,alfa:.62});
    }
  }};
})();
