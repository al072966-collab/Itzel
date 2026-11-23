'use strict';
// Coordenadas de cada abertura (sobre una cuadrícula de 256 × 256).
// Las cabezas y el ojo se alinean a la misma posición del núcleo del jefe.
const MASCARA_ESTILOS = (() => {
  const imgs=Object.create(null), completos=Object.create(null);
  function obtenerCuerpo(estilo){const k=String(estilo&&estilo.id||'').split('~')[0];if(!completos[k]){const im=new Image();im.src='../Roguelike/assets/jefes/mascara-estilos-completos/'+k+'.png';completos[k]=im;}const im=completos[k];return im.complete&&im.naturalWidth?im:null;}
  function id(f){return f&&f.st?String(f.st.id||'').split('~')[0]:'';}
  function obtener(f){
    const k=id(f);if(!k)return null;
    if(!imgs[k]){const im=new Image();im.src='../Roguelike/assets/jefes/mascara-modelo-estilos/'+k+'.svg';imgs[k]=im;}
    const im=imgs[k];if(!im.complete||!im.naturalWidth)return null;
    const [l,t,r,b]=[76,104,180,133],cx=(l+r)/512,cy=(t+b)/512;
    return {img:im,id:k,x:-2-84*cx,y:-64*cy,rx:(r-l)*84/512,ry:(b-t)*64/512,top:t/256,bottom:b/256};
  }
  return {obtener,obtenerCuerpo};
})();
