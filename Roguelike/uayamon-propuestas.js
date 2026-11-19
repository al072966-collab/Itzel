'use strict';
// Dos propuestas independientes para comparar Uayamón antes de elegir una.
(() => {
  const base = NIVELES.vapor;
  function crea(id, nombre, lema, build) {
    nivel(id, { ...base, id, nombre, lugar: 'Hacienda Uayamón', lema,
      dato: 'Uayamón tuvo cultivos de henequén, maquinaria y ferrocarril. Esta interpretación del recorrido es imaginaria.',
      W: 114, escenarioUayamon: id, build });
  }
  crea('uayamon_selva', 'Uayamón · La hacienda entre raíces', 'Exploren la hacienda tomada por la selva y activen el vapor para alcanzar sus patios.', b => {
    b.g(0, 19).P(3).d('T', 7).d('f', 12).c(5, 16, 9).e(17, undefined, 'arana');
    b.p(22, 10, 3, { k: 'static', look: 'uay_losa' }).c(22, 24, 8);
    b.g(28, 46).d('T', 31).d('f', 39).c(30, 43, 9).o('valvula', 40, 0, { grp: 0 }).o('vent', 45, 0, { grp: 0 });
    b.g(47, 49, 9).g(50, 59, 7).c(50, 56, 5).e(54, undefined, 'arana');
    b.g(60, 73).d('T', 63).c(61, 70, 9).e(69, 7, 'pajaro');
    b.p(76, 10, 3, { k: 'static', look: 'uay_losa' }).p(81, 9, 3, { k: 'static', look: 'uay_losa' });
    b.c(76, 78, 8).c(81, 83, 7);
    b.g(87, 113).d('T', 91).d('f', 103).c(90, 107, 9).e(98, undefined, 'calderita').h(105, 9).Gl(110);
  });
  crea('uayamon_taller', 'Uayamón · El taller del henequén', 'Cruza el campo y el taller: Fresita controla el vapor y cambia el sentido de las bandas.', b => {
    b.g(0, 22).P(3).d('f', 6).d('f', 13).c(5, 19, 9).e(19, undefined, 'arana');
    b.g(23, 41, 9).c(24, 38, 7).o('valvula', 32, 0, { grp: 0 }).o('vent', 39, 0, { grp: 0 });
    b.g(42, 53, 5).c(43, 50, 3).e(49, undefined, 'calderita').o('valvula', 51, 0, { grp: 2 });
    b.p(56, 8, 3, { k: 'conveyor', look: 'uay_banda', v: -32, bandaUayamon: true }).p(61, 9, 3, { k: 'conveyor', look: 'uay_banda', v: -32, bandaUayamon: true }).c(56, 58, 6).c(61, 63, 7);
    b.g(67, 86).d('r', 71).c(69, 83, 9).e(74, undefined, 'mecha').o('valvula', 78, 0, { grp: 1 }).o('vent', 84, 0, { grp: 1 });
    b.g(87, 96, 7).c(88, 94, 5).e(92, 5, 'pajaro');
    b.g(97, 113).d('r', 100).c(99, 109, 9).e(103, undefined, 'calderita').h(108, 9).Gl(111);
  });
  const normal = nivelPara;
  nivelPara = function (st, rand, tipo) {
    const pide = typeof pedido === 'function' ? pedido('nivel') : null;
    if (st === 'vapor' && (pide === 'uayamon_selva' || pide === 'uayamon_taller')) return NIVELES[pide];
    return normal(st, rand, tipo);
  };
  MEC.LOOK.uay_losa = (c, p) => {
    c.fillStyle = '#554032'; c.fillRect(p.x, p.y, p.w, 8);
    c.fillStyle = '#b6956e'; c.fillRect(p.x, p.y, p.w, 3);
    c.fillStyle = '#e5cfa1'; c.fillRect(p.x, p.y, p.w, 1);
    c.fillStyle = '#6c5943'; for (let x = p.x + 7; x < p.x + p.w; x += 12) c.fillRect(x, p.y + 3, 1, 5);
  };
  MEC.LOOK.uay_banda = (c, p, f) => {
    c.fillStyle = '#563b2b'; c.fillRect(p.x, p.y, p.w, 7);
    c.fillStyle = '#d0a061'; c.fillRect(p.x, p.y, p.w, 2);
    c.fillStyle = '#ead4a1'; const dir = p.rev > 0 ? 1 : -1;
    for (let x = 4 + ((f.t * dir * 16 % 10 + 10) % 10); x < p.w - 3; x += 10) { c.fillRect(p.x + x, p.y + 3, 3, 1); c.fillRect(p.x + x + dir, p.y + 4, 3, 1); }
  };
  const valvulaOriginal = MEC.POW.valvula.click;
  MEC.POW.valvula.click = function(g, x, y, ...args) {
    const ok = valvulaOriginal.call(this, g, x, y, ...args);
    if (g.def?.id === 'uayamon_taller' && g.objs.some(o => o.k === 'valvula' && o.grp === 2 && Math.abs(o.x - x) < 16 && y > o.y - 40 && y < o.y + 10)) {
      for (const banda of g.plats) if (banda.bandaUayamon) banda.rev = 5;
      if (typeof toast === 'function') toast('Las bandas cambiaron de sentido');
    }
    return ok;
  };
  const st = STYLE_MAP.vapor, cieloOriginal = st.sky, terrenoOriginal = st.terrain, sobreOriginal = st.over;
  function fachada(c, x, y, w, color, selva) {
    c.fillStyle = '#594632'; c.fillRect(x + 3, y + 3, w, 57);
    c.fillStyle = color; c.fillRect(x, y, w, 57);
    c.fillStyle = '#efd9ae'; c.fillRect(x - 3, y - 3, w + 6, 4); c.fillRect(x + 2, y + 12, w - 4, 2);
    for (let a = x + 8; a < x + w - 5; a += 21) {
      c.fillStyle = '#584332'; c.fillRect(a, y + 25, 13, 30); c.fillRect(a + 2, y + 21, 9, 6);
      c.fillStyle = '#d9bf91'; c.fillRect(a - 2, y + 27, 2, 27); c.fillRect(a + 13, y + 27, 2, 27); c.fillRect(a, y + 23, 2, 4); c.fillRect(a + 11, y + 23, 2, 4);
    }
    if (selva) { c.strokeStyle = '#57764b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w - 8, y - 4); c.lineTo(x + w - 12, y + 16); c.lineTo(x + w - 5, y + 32); c.stroke(); for (let i=0;i<5;i++) { c.fillStyle=i%2?'#7e9c54':'#526d3d'; c.fillRect(x+w-15+(i%2)*7,y+i*7,5,3); } }
  }
  function agave(c,x,y,s=1) {
    const hojas=[[-13,-15],[-9,-23],[-4,-25],[1,-23],[6,-19],[11,-13]];
    for (const [dx,dy] of hojas) { c.fillStyle=dx%2?'#527e58':'#719b67'; c.beginPath(); c.moveTo(x-2*s,y); c.lineTo(x+dx*s,y+dy*s); c.lineTo(x+3*s,y-2*s); c.closePath(); c.fill(); }
    c.fillStyle='#344d39'; c.fillRect(x-2*s,y-3*s,4*s,3*s);
  }
  st.sky = function(c,f) {
    const id=f.g?.def?.id; if (id !== 'uayamon_selva' && id !== 'uayamon_taller') return cieloOriginal.call(this,c,f);
    const selva=id==='uayamon_selva', grd=c.createLinearGradient(0,0,0,VH);
    grd.addColorStop(0,selva?'#80b8b0':'#e0b484'); grd.addColorStop(1,selva?'#e9d9aa':'#f0dfb3'); c.fillStyle=grd; c.fillRect(0,0,VW,VH);
    c.fillStyle=selva?'#9abda6':'#c99f78'; for(let i=0;i<8;i++){const x=((i*83-f.cam*.08)%660+660)%660-80;c.beginPath();c.arc(x,180,42+i%3*7,Math.PI,0);c.fill();}
    const unit=180, offset=((f.cam*.18)%unit+unit)%unit;
    for(let x=-offset-90;x<VW+unit;x+=unit) fachada(c,x,103,150,selva?'#d7be91':'#c99e73',selva);
    c.fillStyle=selva?'#78936b':'#b48b64'; c.fillRect(0,159,VW,3);
    for(let i=0;i<10;i++){const x=((i*62-f.cam*.35)%620+620)%620-30;agave(c,x,177,selva?.85:1.15);}
    if(!selva){
      c.fillStyle='#6a4b35'; c.fillRect(0,82,VW,3); c.fillRect(0,91,VW,2);
      for(let i=0;i<6;i++){const x=((i*100-f.cam*.25)%600+600)%600-20;c.fillStyle='#704c34';c.fillRect(x,85,3,25);c.fillStyle='#b57a43';c.fillRect(x-4,108,12,3);}
    }
  };
  st.terrain = function(c,f) {
    if (!L.escenarioUayamon) return terrenoOriginal.call(this,c,f);
    const selva=L.escenarioUayamon==='uayamon_selva';
    for(let y=0;y<L.gh;y++)for(let x=0;x<L.gw;x++)if(L.solid(x,y)){
      const wx=x*T,wy=y*T;c.fillStyle=selva?'#7c6749':'#826044';c.fillRect(wx,wy,T,T);
      c.fillStyle=selva?'#9e8860':'#a77a50';c.fillRect(wx+1,wy+1,T-2,1);
      c.fillStyle=selva?'#67543b':'#6d4935';c.fillRect(wx,wy+T-1,T,1);
      c.fillRect(wx+(y%2?7:1),wy+2,1,T-3);
    }
    for(const r of L.tops){c.fillStyle=selva?'#516f48':'#d2b182';c.fillRect(r.x0,r.y,r.x1-r.x0,3);c.fillStyle=selva?'#a8bc79':'#edcea0';c.fillRect(r.x0,r.y,r.x1-r.x0,1);}
    for(const o of L.deco){ if(o.k==='f'){agave(c,o.x,o.y,1)} else if(o.k==='T'&&selva){c.fillStyle='#69513a';c.fillRect(o.x-3,o.y-35,6,35);c.fillStyle='#4b704a';c.beginPath();c.arc(o.x,o.y-38,13,0,TAU);c.fill();c.fillStyle='#7b9a5a';c.beginPath();c.arc(o.x-5,o.y-43,8,0,TAU);c.fill();} else {c.fillStyle='#9a6740';c.fillRect(o.x-5,o.y-8,10,8);c.fillStyle='#d6ac70';c.fillRect(o.x-4,o.y-7,8,2);} }
  };
  st.over = function(c,f){if(f.g?.def?.escenarioUayamon){vignette(c,.18,'#33291e');return;} return sobreOriginal.call(this,c,f);};
  // Las propuestas se conservan; solo se inician con el parámetro explícito jugar=1.
  const enlace = new URLSearchParams(location.search), demo = enlace.get('propuesta');
  if (enlace.get('jugar') === '1' && !window.presentacionPropuesta && (demo === 'uayamon_selva' || demo === 'uayamon_taller')) {
    setTimeout(() => { PIDE = { mundo: 'vapor', nivel: demo }; newRun((Math.random() * 1e6) | 0); _startLevel(); }, 100);
  }
})();
