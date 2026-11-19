'use strict';
(function(){
 if(typeof vestirNivel!=='function')return;
 const D=vestirNivel({id:'fuego',nivel:'templo',carpeta:'defensa-detalles',ver:1});
 const P=vestirNivel({id:'cuaderno',nivel:'planos',carpeta:'planos-detalles',ver:1});
 window.DEFENSA_DETALLES={todo:D.todo,pinta(c){if(D.todo())for(const [x,y] of [[58,65],[370,74],[65,203],[358,210]])D.spr(c,'palma',x,y,{alfa:.36})}};
 window.PLANOS_DETALLES={todo:P.todo,pinta(c){if(P.todo())P.spr(c,'lapiz',380,227,{ay:.5,alfa:.3})}};
})();
