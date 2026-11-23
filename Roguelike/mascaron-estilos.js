'use strict';
// El Mascarón conserva una ilustración frontal y una lateral para cada estilo.
const MASCARON_ESTILOS=(()=>{
  const ids=new Set(['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura','bordado']);
  const cache=Object.create(null);
  function obtener(st){const id=String(st&&st.id||'').split('~')[0];if(!ids.has(id))return null;
    if(!cache[id]){const frente=new Image(),lateral=new Image();frente.src='../Roguelike/assets/jefes/mascaron-estilos/'+id+'.png';lateral.src='../Roguelike/assets/jefes/mascaron-estilos/'+id+(id==='bordado'?'.png':'-lateral.png');cache[id]={frente,lateral};}
    const c=cache[id];return c.frente.complete&&c.frente.naturalWidth?c:null;
  }
  return {obtener};
})();
