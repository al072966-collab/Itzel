'use strict';
// Balam ceremonial: piezas articuladas para conservar la silueta felina en juego.
(() => {
  const X = JEFES_EXT, original = X.BODY.jaguar;
  const normal = new Image(), rugido = new Image();
  const saltoAcuarela = new Image();
  saltoAcuarela.src = '../Roguelike/assets/forge/jefes/balam-acuarela-salto-v1/sheet-transparent.png';
  normal.src = '../Roguelike/assets/jefes/balam-ceremonial.png';
  rugido.src = '../Roguelike/assets/jefes/balam-rugido.png';
  const estilos = new Set(['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','vapor','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura']);
  const variantes = Object.create(null);
  function obtener(estilo) {
    const id = String(estilo && estilo.id || '').split('~')[0];
    if (!estilos.has(id)) return null;
    if (!variantes[id]) {
      const normal = new Image(), rugido = new Image();
      normal.src = '../Roguelike/assets/jefes/balam-estilos/' + id + '.png';
      rugido.src = '../Roguelike/assets/jefes/balam-estilos/' + id + '-rugido.png';
      variantes[id] = { normal, rugido };
    }
    const v = variantes[id];
    return v.normal.complete && v.normal.naturalWidth ? v : null;
  }
  window.BALAM_ESTILOS = { obtener, forge: { acuarela: ['acecho'] } };
  const cache = new WeakMap();
  function imagen(art, pixel, silueta = false) {
    if (!art.complete || !art.naturalWidth) return null;
    let item = cache.get(art);
    if (!item) {
      const limpio = document.createElement('canvas'); limpio.width = 768; limpio.height = 512;
      const cx = limpio.getContext('2d', { willReadFrequently:true }); cx.drawImage(art,0,0,768,512);
      try { const im = cx.getImageData(0,0,768,512), d=im.data;
      for(let i=0;i<d.length;i+=4) {
        d[i+3] = d[i+3]<210 ? 0 : 255;
        if (silueta && d[i+3]) {
          const n=i/4, x=n%768, y=Math.floor(n/768);
          const ojo=x>600 && y>170 && y<240 && d[i]>120 && d[i]>d[i+1]*1.5 && d[i]>d[i+2]*1.4;
          if (ojo) { d[i]=255; d[i+1]=32; d[i+2]=24; }
          else { d[i]=10; d[i+1]=8; d[i+2]=8; }
        }
      }
      cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; } item={limpio,pixel:null}; cache.set(art,item);
    }
    if(!pixel)return item.limpio;
    if(!item.pixel){ item.pixel=document.createElement('canvas');item.pixel.width=128;item.pixel.height=85;item.pixel.getContext('2d').drawImage(item.limpio,0,0,128,85); }
    return item.pixel;
  }
  X.CORE.jaguar = o => ({x:o.x + (o.face||1)*17.4,y:o.y-24+(o.crouch?2:0),r:8});
  X.BODY.jaguar = (c,o,f) => {
    const t=f.t||0, pixel=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base));
    const estilo = String(f.st && f.st.id || '').split('~')[0];
    if (estilo === 'acuarela' && o.st === 'ataque' && o.atk === 'acecho' && saltoAcuarela.complete && saltoAcuarela.naturalWidth) {
      const fase = o.salto ? (o.salto.t < .16 ? 1 : o.salto.t < .65 ? 2 : 3) : 0;
      c.save(); c.translate(o.x, o.y); c.scale(o.face || 1, 1);
      if (o.flash > 0 && Math.sin(t * 40) > 0) c.filter = 'brightness(2.3)';
      c.imageSmoothingEnabled = true;
      c.drawImage(saltoAcuarela, (fase % 2) * 256 + 28, Math.floor(fase / 2) * 256 + 77, 205, 102, -38, -39, 64, 40);
      c.restore(); return;
    }
    const ruge=o.st==='ataque'&&o.atk==='rugido'&&o.at>.35&&o.at<1.65;
    const variante=obtener(f.st), base=variante ? variante.normal : normal;
    const boca=variante && variante.rugido.complete && variante.rugido.naturalWidth ? variante.rugido : (variante ? base : rugido);
    const silueta=!!(f.st && String(f.st.id||'').split('~')[0]==='hollin');
    const art=imagen(ruge?boca:base,pixel,silueta)||imagen(base,pixel,silueta);
    if(!art)return original(c,o,f);
    const W=1536,H=1024, corre=o.st==='ataque'&&o.atk==='garras'&&o.at>.5, aire=o.y<X.FLOOR-2;
    const dx=o._balamX==null?0:o.x-o._balamX;o._balamX=o.x;
    if(Math.abs(dx)<20)o._balamPaso=(o._balamPaso||0)+Math.abs(dx)*.22;
    const andando=Math.abs(dx)>.03&&Math.abs(dx)<20,zancada=corre||andando?Math.sin(o._balamPaso||0)*(corre?1:.55):Math.sin(t*2.2)*.15,crouch=o.crouch?2:0;
    c.save();c.translate(o.x,o.y);c.scale(o.face||1,1);
    if(o.st==='muere'){c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);c.rotate(Math.sin(t*10)*.08);}
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2.3)';
    if(!aire){c.fillStyle='rgba(90,65,43,.14)';c.beginPath();c.ellipse(-3,0,20,2,0,0,Math.PI*2);c.fill();}
    c.imageSmoothingEnabled=!pixel;c.translate(-38,-39+crouch);c.scale(64/W,40/H);
    // La partición es exclusiva: ningún píxel aparece en dos piezas.
    // Se usa una flexión moderada para conservar la anatomía del dibujo.
    const corte=700, cola=[[0,0],[420,0],[420,corte],[0,corte]];
    const patas=[[[0,corte],[510,corte],[510,H],[0,H]],[[510,corte],[810,corte],[810,H],[510,H]],[[810,corte],[1120,corte],[1120,H],[810,H]],[[1120,corte],[W,corte],[W,H],[1120,H]]];
    const path=poly=>{poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
    const pieza=(poly,px,py,rot=0)=>{c.save();c.translate(px,py);c.rotate(rot);c.translate(-px,-py);c.beginPath();path(poly);c.clip();c.drawImage(art,0,0,W,H);c.restore();};
    c.save(); c.beginPath(); c.rect(0,0,W,H); path(cola); for(const p of patas)path(p); c.clip('evenodd'); c.drawImage(art,0,0,W,H); c.restore();
    pieza(cola,420,510,Math.sin(t*2.3)*.025);
    const ang=aire?.055:zancada*.065;
    for(let i=0;i<patas.length;i++) pieza(patas[i],[360,650,960,1270][i],corte,i%2?-ang:ang);
    c.restore();
  };
})();
