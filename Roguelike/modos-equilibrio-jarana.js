'use strict';
// Vaquería: sostener la botella requiere corregir su inclinación.
MODOS.jarana = (() => {
  const plaza = new Image(); plaza.src = '../Roguelike/assets/jarana-nueva/plaza-textura.png';
  function crear(def, st) { return { t:0, win:0, shake:0, bubbles:[], parts:[], def, st, inv:0, pose:poseItzel(), angulo:.12, velocidad:0, caidas:0, ayuda:0, fre:{x:300,y:135} }; }
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.ayuda = Math.max(0, j.ayuda - dt); j.shake = Math.max(0, j.shake - dt);
    const izquierda = KEYS.has('ArrowLeft') || KEYS.has('KeyA'), derecha = KEYS.has('ArrowRight') || KEYS.has('KeyD');
    const viento = Math.sin(j.t * 1.18) * .37 + Math.sin(j.t * .53 + 1.3) * .22;
    j.velocidad += (viento + j.angulo * .7 + (izquierda ? -.95 : 0) + (derecha ? .95 : 0)) * dt;
    j.velocidad *= Math.pow(.45, dt); j.angulo += j.velocidad * dt;
    for (const c of MOUSE.clicks) if (!c.up && c.b === 0 && j.ayuda <= 0) { j.velocidad *= .2; j.angulo *= .65; j.ayuda = 2.5; }
    MOUSE.clicks.length = 0;
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 8); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 8); }
    if (Math.abs(j.angulo) >= 1) { j.caidas++; dañoModo(j); j.angulo = 0; j.velocidad = 0; }
    if (!j.win && j.t >= 45) { j.win = j.t; RUN.coins += Math.max(1, 8 - j.caidas); chispas(j,213,85,['#e85a4f','#f2b233','#5fae6a','#4f8fd6'],40,90); }
    pasoChispas(j, dt);
  }
  function pintar(j, view) {
    const {ctx, f, st} = marcoModo(j, view);
    if (plaza.complete && plaza.naturalWidth) ctx.drawImage(plaza, 0, 0, VW, VH);
    ctx.fillStyle='rgba(42,28,35,.25)'; ctx.fillRect(0,0,VW,VH);
    if (typeof JARANA_DETALLES !== 'undefined') JARANA_DETALLES.pinta(ctx);
    ctx.fillStyle='#8a5a3a';ctx.fillRect(132,193,162,13);ctx.fillStyle='#613d2a';ctx.fillRect(132,206,162,6);
    const p=j.pose; Object.assign(p,{x:213+Math.sin(j.t*3)*2,y:193,face:j.angulo>0?1:-1,vx:40,run:j.t*4,on:true});
    if (!(j.inv>0 && Math.floor(j.inv*14)%2)) st.player(ctx,p,f);
    ctx.save();ctx.translate(p.x,p.y-25);ctx.rotate(j.angulo*.8);ctx.fillStyle='#e3be7d';ctx.beginPath();ctx.ellipse(0,0,10,2.4,0,0,TAU);ctx.fill();ctx.fillStyle='#518c62';ctx.fillRect(-2.5,-11,5,10);ctx.fillRect(-1.2,-14,2.4,4);ctx.fillStyle='#df6256';ctx.fillRect(-1.3,-15,2.6,2);ctx.restore();
    if(st.fresita) st.fresita(ctx,{x:j.fre.x,y:j.fre.y+Math.sin(j.t*4)*2,face:1},f);
    ctx.fillStyle='rgba(29,19,26,.8)';ctx.fillRect(80,16,266,30);ctx.fillStyle='#ffead0';ctx.font='bold 8px "Alegreya Sans"';ctx.textAlign='center';ctx.fillText('Mantén la botella en equilibrio',213,27);
    ctx.fillStyle='#9e5a4e';ctx.fillRect(115,33,196,5);ctx.fillStyle='#81bd77';ctx.fillRect(181,33,64,5);ctx.fillStyle='#fff6df';ctx.fillRect(211+j.angulo*94,30,4,11);ctx.textAlign='left';
    letrero(ctx,`Tiempo: ${Math.max(0,Math.ceil(45-j.t))} s`,213,60,'#fff4e0');
    letrero(ctx,'← → equilibra · Fresita: clic para ayudar',213,220,'#fff4e0');
    if(j.ayuda>0) letrero(ctx,'Fresita ayuda',213,75,'#ffb6d1');
    if(j.win) letrero(ctx,'¡Qué buena vaquería!',213,105,'#ffd23f');
    pintaChispas(ctx,j);if(st.over)st.over(ctx,f);
  }
  return { crear, paso, pintar };
})();
MEC.POW.equilibrio = { name:'Manita de Fresita', help:'Clic para ayudar a Itzel a estabilizar la botella; espera un momento para volver a usarlo.', cd:2.5, click() {} };
nivel('jarana', { nombre:'La vaquería de la jarana', lema:'Itzel mantiene la botella en equilibrio mientras Fresita le ayuda.', modo:'jarana', foe:'abeja', fauna:['abeja'], power:'equilibrio', plat:NIVELES.nouveau.plat, W:30, skin:NIVELES.nouveau.skin });
(NIVELES_ALT.nouveau = NIVELES_ALT.nouveau || []).push('jarana');
