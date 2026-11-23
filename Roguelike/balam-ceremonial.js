'use strict';
// Balam ceremonial: piezas articuladas para conservar la silueta felina en juego.
(() => {
  const X = JEFES_EXT, original = X.BODY.jaguar;
  const normal = new Image(), rugido = new Image();
  const saltoAcuarela = new Image();
  saltoAcuarela.src = '../Roguelike/assets/forge/jefes/balam-acuarela-salto-v1/sheet-transparent.png';
  const accionesAnime = new Image();
  accionesAnime.src = '../Roguelike/assets/forge/jefes/balam-anime-acciones-v1/sheet-transparent.png';
  normal.src = '../Roguelike/assets/jefes/balam-ceremonial.png';
  rugido.src = '../Roguelike/assets/jefes/balam-rugido.png';
  const estilos = new Set(['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura','bordado']);
  const variantes = Object.create(null);
  function obtener(estilo) {
    const id = String(estilo && estilo.id || '').split('~')[0];
    if (!estilos.has(id)) return null;
    if (!variantes[id]) {
      const normal = new Image(), rugido = new Image();
      normal.src = '../Roguelike/assets/jefes/balam-estilos/' + id + '.png';
      rugido.src = '../Roguelike/assets/jefes/balam-estilos/' + id + (id === 'bordado' ? '.png' : '-rugido.png');
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
      cx.putImageData(im,0,0);
      // dónde quedan las patas dentro de la imagen (cada estilo deja un margen distinto abajo): sirve para apoyarlas en el piso
      let pie=1; const d2=im.data; for(let y=511;y>=0;y--){ let n=0; for(let x=0;x<768&&n<4;x++) if(d2[(y*768+x)*4+3]>0) n++; if(n>=4){ pie=(y+1)/512; break; } }
      limpio.pie=pie; } catch (e) { if (e.name !== 'SecurityError') throw e; } item={limpio,pixel:null}; cache.set(art,item);
    }
    if(!pixel)return item.limpio;
    if(!item.pixel){ item.pixel=document.createElement('canvas');item.pixel.width=128;item.pixel.height=85;item.pixel.getContext('2d').drawImage(item.limpio,0,0,128,85); item.pixel.pie=item.limpio.pie; }
    return item.pixel;
  }
  X.CORE.jaguar = o => ({x:o.x + (o.face||1)*17.4,y:o.y-24+(o.crouch?2:0),r:8});
  X.BODY.jaguar = (c,o,f) => {
    const t=f.t||0, pixel=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base));
    const estilo = String(f.st && f.st.id || '').split('~')[0];
    const saltoCine = f.key && f.key.endsWith('@cine') ? o.saltoCine : null;
    if (estilo === 'acuarela' && f.key && f.key.endsWith('@cine') && o.st === 'ataque' && (o.atk === 'acecho' || saltoCine != null) && saltoAcuarela.complete && saltoAcuarela.naturalWidth) {
      const tiempoSalto = saltoCine != null ? saltoCine : o.salto && o.salto.t;
      const fase = tiempoSalto != null ? (tiempoSalto < .16 ? 1 : tiempoSalto < .65 ? 2 : 3) : 0;
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
    const art=imagen(base,pixel,silueta), arteRugido=imagen(boca,pixel,silueta);
    if(!art)return original(c,o,f);
    const a=o.at||0, mezcla=o.st==='ataque'&&o.atk==='rugido' ? Math.max(0,Math.min(1,(a-.25)/.12,(1.75-a)/.12)) : 0;
    const W=1536,H=1024, corre=o.st==='ataque'&&o.atk==='garras'&&o.at>.5, aire=o.y<X.FLOOR-2;
    const dx=o._balamX==null?0:o.x-o._balamX;o._balamX=o.x;
    if(Math.abs(dx)<20)o._balamPaso=(o._balamPaso||0)+Math.abs(dx)*.22;
    const andando=Math.abs(dx)>.03&&Math.abs(dx)<20,zancada=corre||andando?Math.sin(o._balamPaso||0)*(corre?1:.55):Math.sin(t*2.2)*.15,crouch=o.crouch?2:0;
    c.save();c.translate(o.x,o.y);c.scale(o.face||1,1);
    if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);
    if(o.st==='herido'||o.flash>0){const a=o.at||0;c.translate(17.4,-24+crouch);c.rotate(.08*Math.sin(a*18)*Math.exp(-a*3.5));c.translate(-17.4,24-crouch);}
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2.3)';
    if(!aire){c.fillStyle='rgba(90,65,43,.14)';c.beginPath();c.ellipse(-3,0,20,2,0,0,Math.PI*2);c.fill();}
    if(estilo==='anime'&&o.st==='ataque'&&accionesAnime.complete&&accionesAnime.naturalWidth){
      const q=o.atk==='acecho'?(o.salto?1:0):o.atk==='garras'&&o.at>.5?2:o.atk==='rugido'&&o.at>.35&&o.at<1.65?3:-1;
      if(q>=0){
        const apoyo=f.g&&f.g.vistaJefeNitida&&!aire?2.5:0;
        c.imageSmoothingEnabled=true;
        // Respiración y tensión del lomo, con las patas apoyadas en el mismo lugar.
        const sx=(q%2)*256, sy=Math.floor(q/2)*256, bandas=24;
        for(let i=0;i<bandas;i++){
          const u=i/bandas,v=(i+1)/bandas, fuerza=Math.max(0,Math.min(1,(.75-u)*4));
          const dx=Math.sin(t*(q===3?5:3)+u*3)*.45*fuerza;
          c.drawImage(accionesAnime,sx,sy+u*256,256,256/bandas,-56+dx,-170*100/256+apoyo+u*100,100,(v-u)*100+.06);
        }
        c.restore();return;
      }
    }
    // En el visor el borde visible de la plataforma queda algo por debajo
    // del piso físico; acercamos las patas solo cuando Balam está en tierra.
    const ajusteVisor=f.g && f.g.vistaJefeNitida && !aire ? 2.5 : 0;
    c.imageSmoothingEnabled=!pixel;const apoyo=Number.isFinite(art.pie)?39.3-art.pie*40:0;c.translate(-38,-39+crouch+apoyo+ajusteVisor);c.scale(64/W,40/H);
    // La partición es exclusiva: ningún píxel aparece en dos piezas.
    // Se usa una flexión moderada para conservar la anatomía del dibujo.
    const corte=700, cola=[[0,0],[420,0],[420,corte],[0,corte]];
    const patas=[[[0,corte],[510,corte],[510,H],[0,H]],[[510,corte],[810,corte],[810,H],[510,H]],[[810,corte],[1120,corte],[1120,H],[810,H]],[[1120,corte],[W,corte],[W,H],[1120,H]]];
    const path=poly=>{poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
    const dibujaArte=()=>{c.drawImage(art,0,0,W,H);if(arteRugido&&mezcla>0){c.save();c.globalAlpha*=mezcla;c.drawImage(arteRugido,0,0,W,H);c.restore();}};
    const pieza=(poly,px,py,rot=0)=>{c.save();c.translate(px,py);c.rotate(rot);c.translate(-px,-py);c.beginPath();path(poly);c.clip();dibujaArte();c.restore();};
    c.save(); c.beginPath(); c.rect(0,0,W,H); path(cola); for(const p of patas)path(p); c.clip('evenodd'); dibujaArte(); c.restore();
    pieza(cola,420,510,Math.sin(t*2.3)*.025);
    const ataque=o.st==='ataque'&&o.atk==='garras' ? Math.sin((o.at||0)*9)*.035 : 0;
    const ang=(aire?.055:zancada*.065)+ataque;
    for(let i=0;i<patas.length;i++) pieza(patas[i],[360,650,960,1270][i],corte,i%2?-ang:ang);
    c.restore();
    if(ruge&&!silueta){
      const fase=(o.at||0)-.35; c.save();c.translate(o.x+(o.face||1)*28,o.y-20);c.scale(o.face||1,1);
      c.strokeStyle='rgba(255,220,155,.6)';c.lineWidth=.8;
      for(let i=0;i<3;i++){const r=3+((fase*16+i*4)%14);c.globalAlpha=Math.max(0,1-r/17)*.7;c.beginPath();c.arc(0,0,r,-.8,.8);c.stroke();}c.restore();
    }
  };
})();
