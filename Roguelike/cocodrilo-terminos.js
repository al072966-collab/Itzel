'use strict';
// Cocodrilo veterano de Términos; comparte estados y ataques del jefe original.
(() => {
  const X=JEFES_EXT, original=X.BODY.cocodrilo, cerrado=new Image(), abierto=new Image();
  const mordidaAcuarela = new Image();
  mordidaAcuarela.src = '../Roguelike/assets/forge/jefes/cocodrilo-acuarela-morder-v1/sheet-transparent.png';
  cerrado.src='../Roguelike/assets/jefes/cocodrilo-terminos.png'; abierto.src='../Roguelike/assets/jefes/cocodrilo-mordida.png';
  // Activar cada variante cuando estén disponibles sus dos poses.
  const estilos=new Set(['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','anime','nouveau','deco','cyber','cinema','vapor','barro','eco','fuego']);
  const variantes=Object.create(null);
  function obtener(estilo){
    const id=String(window.estiloArteDerivado||estilo&&estilo.id||'').split('~')[0];if(!estilos.has(id))return null;
    if(!variantes[id]){const cerrado=new Image(),abierto=new Image();cerrado.src='../Roguelike/assets/jefes/cocodrilo-estilos/'+id+'.png';abierto.src='../Roguelike/assets/jefes/cocodrilo-estilos/'+id+'-mordida.png';variantes[id]={cerrado,abierto};}
    const v=variantes[id];return v.cerrado.complete&&v.cerrado.naturalWidth?v:null;
  }
  window.COCODRILO_ESTILOS={obtener, forge: { acuarela: ['emboscada'] }};
  const cache=new WeakMap();
  function sprite(img,pixel,silueta=false,gameboy=false){
    if(!img.complete||!img.naturalWidth)return null;
    let item=cache.get(img);
    if(!item){const cv=document.createElement('canvas');cv.width=1024;cv.height=384;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,1024,384);try { const im=x.getImageData(0,0,1024,384),d=im.data;for(let i=0;i<d.length;i+=4){d[i+3]=d[i+3]<210?0:255;if(silueta&&d[i+3]){const n=i/4,xx=n%1024,yy=Math.floor(n/1024),ojo=xx>760&&yy>100&&yy<250&&d[i]>110&&d[i]>d[i+1]*1.5&&d[i]>d[i+2]*1.4;if(ojo){d[i]=255;d[i+1]=32;d[i+2]=24;}else{d[i]=10;d[i+1]=8;d[i+2]=8;}}else if(gameboy&&d[i+3]&&(d[i]*.3+d[i+1]*.59+d[i+2]*.11)>150){d[i]=100;d[i+1]=145;d[i+2]=60;}}x.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }item={cv,pixel:null};cache.set(img,item);}
    if(!pixel)return item.cv;
    if(!item.pixel){item.pixel=document.createElement('canvas');item.pixel.width=160;item.pixel.height=60;item.pixel.getContext('2d').drawImage(item.cv,0,0,160,60);}return item.pixel;
  }
  X.CORE.cocodrilo=o=>{
    const theta=-(o.erg||0)*.5, lx=12.5, ly=-19.3, cs=Math.cos(theta),sn=Math.sin(theta);
    return {x:o.x+(o.face||1)*(cs*lx-sn*ly),y:X.FLOOR+(o.sub||0)*16-(o.erg||0)*18+sn*lx+cs*ly,r:8};
  };
  X.BODY.cocodrilo=(c,o,f)=>{
    const t=f.t||0,px=!!(f.st&&(f.st.pixel||f.st.fixedS||f.st.base));
    const m=o.mordida||0, atacando=o.st==='ataque'&&(o.atk==='escupe'||m>0),v=obtener(f.st),base=v?v.cerrado:cerrado,boca=v&&v.abierto.complete&&v.abierto.naturalWidth?v.abierto:(v?base:abierto),id=String(window.estiloArteDerivado||f.st&&f.st.id||'').split('~')[0],sil=id==='hollin'&&!!v,gb=id==='gameboy'&&!!v,img=sprite(atacando?boca:base,px,sil,gb)||sprite(base,px,sil,gb);
    if(!img)return original(c,o,f);
    if((o.sub||0)>.7&&!m)return;
    c.save();c.imageSmoothingEnabled=!px;
    if(o.st==='muere')c.globalAlpha*=clamp(1-(o.at||0)/2.4,0,1);
    if(o.flash>0&&Math.sin(t*40)>0)c.filter='brightness(2)';
    if(m>0){
      // Brota con la cabeza hacia arriba; la parte aún bajo tierra queda oculta.
      c.beginPath();c.rect(o.x-24,X.FLOOR-58,48,58);c.clip();c.translate(o.x,X.FLOOR+35*(1-m));c.rotate(-Math.PI/2);
      if(gb){c.save();c.filter='brightness(0)';for(const [x,y] of [[-.7,0],[.7,0],[0,-.7],[0,.7]])c.drawImage(img,-30+x,-14+y,76,28);c.restore();}
      if (id === 'acuarela' && mordidaAcuarela.complete && mordidaAcuarela.naturalWidth) {
        // Las cuatro poses cubren la subida de la mordida: cierre,
        // apertura, mandíbula abierta y repliegue. La señal de aviso
        // conserva el dibujante del nivel antes de que empiece a emerger.
        const fase = (o.at || 0) < 1.92 ? 0 : (o.at || 0) < 2.02 ? 1 : (o.at || 0) < 2.26 ? 2 : 3;
        c.drawImage(mordidaAcuarela, (fase % 2) * 256 + 17, Math.floor(fase / 2) * 256 + 94, 224, 68, -30, -14, 76, 28);
      } else c.drawImage(img,-30,-14,76,28);
      c.restore();return;
    }
    const sub=o.sub||0,erg=o.erg||0;
    c.beginPath();c.rect(o.x-65,X.FLOOR-110,130,110);c.clip();
    c.translate(o.x,X.FLOOR+sub*16-erg*18);c.scale(o.face||1,1);c.rotate(-erg*.5);
    const W=2048,H=768; c.translate(-48,-32);c.scale(96/W,36/H);
    const pieza=(pol,px,py,rot=0)=>{c.save();c.translate(px,py);c.rotate(rot);c.translate(-px,-py);c.beginPath();pol.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();if(gb){c.save();c.filter='brightness(0)';for(const [x,y] of [[-20,0],[20,0],[0,-20],[0,20]])c.drawImage(img,x,y,W,H);c.restore();}c.drawImage(img,0,0,W,H);c.restore();};
    const cola=o.st==='ataque'&&o.atk==='coletazo' ? Math.sin((o.at||0)*7)*.13 : Math.sin(t*2)*.025;
    // Las regiones son contiguas y excluyentes: la cola, el torso y las
    // cuatro patas se dibujan una sola vez y pueden moverse por separado.
    const corte=540, limites=[0,900,1200,1500,2048];
    pieza([[0,0],[700,0],[700,corte],[0,corte]],700,430,cola);
    pieza([[700,0],[2048,0],[2048,corte],[700,corte]],1200,400,Math.sin(t*1.5)*.004);
    const movimiento=o.st==='ataque'&&o.atk==='coletazo'?.035:.018;
    for(let i=0;i<4;i++){const a=limites[i],b=limites[i+1],giro=Math.sin(t*3+i*Math.PI)*movimiento;pieza([[a,corte],[b,corte],[b,H],[a,H]],(a+b)/2,corte,giro);}
    c.restore();
    if((o.st==='ventana'||o.st==='herido')&&!sil){const k=X.CORE.cocodrilo(o);c.save();c.globalCompositeOperation='lighter';glowDot(c,k.x,k.y,8,'#7de3d0',.25+.1*Math.sin(t*5));c.restore();}
  };
})();
