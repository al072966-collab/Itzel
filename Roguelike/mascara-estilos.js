'use strict';
// Coordenadas de cada abertura (sobre una cuadrícula de 256 × 256).
// Las cabezas y el ojo se alinean a la misma posición del núcleo del jefe.
const MASCARA_ESTILOS = (() => {
  const huecos={
    acuarela:[96,102,160,140],agua:[85,117,171,139],anime:[80,102,176,139],barro:[71,104,185,136],
    biolum:[89,101,167,127],bits32:[73,109,183,138],bits64:[83,107,167,136],bits8:[84,116,172,146],
    bruma:[76,98,191,132],cielo:[74,109,182,134],cinema:[77,102,179,130],codex:[76,104,180,133],
    cuaderno:[86,98,170,125],cyber:[72,110,185,136],deco:[84,107,172,136],eco:[72,117,184,150],
    flat:[77,88,179,120],fuego:[79,108,179,137],grabado:[66,94,191,121],
    hielo:[76,107,180,134],hollin:[85,107,171,140],lowpoly:[76,108,180,134],miniatura:[76,93,181,132],
    neon:[82,106,174,128],nouveau:[79,112,177,137],ocaso:[84,110,172,139],oleo:[82,106,174,133],
    paper:[76,106,179,136],pixel:[75,108,181,136],sumie:[62,94,189,131],vapor:[69,102,187,129],vitral:[78,103,178,134]
  };
  const imgs=Object.create(null);
  function id(f){return f&&f.st?String(f.st.id||'').split('~')[0]:'';}
  function obtener(f){
    const k=id(f),h=huecos[k];if(!h)return null;
    if(!imgs[k]){const im=new Image();im.src='../Roguelike/assets/jefes/mascara-estilos/'+k+'.png';imgs[k]=im;}
    const im=imgs[k];if(!im.complete||!im.naturalWidth)return null;
    const [l,t,r,b]=h,cx=(l+r)/512,cy=(t+b)/512;
    return {img:im,id:k,x:-2-84*cx,y:-64*cy,rx:(r-l)*84/512,ry:(b-t)*64/512,top:t/256,bottom:b/256};
  }
  return {obtener};
})();
