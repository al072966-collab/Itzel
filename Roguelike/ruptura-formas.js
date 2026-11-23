'use strict';
// =====================================================================
//  LAS DIEZ FORMAS DE LA RUPTURA
//  Es el único jefe con diez diseños y diez combates distintos. Cada vez
//  que sale toma una forma que todavía no se ha vencido; la última es
//  siempre la de los tentáculos. Al vencerla se gana el logro y se abre
//  la cinemática final, y desde ahí sale con una forma al azar.
//  Aquí viven: el progreso, las formas nuevas, sus ataques y sus peligros.
//  El avance se guarda en PROG.d.ruptura = { vencidas: [ids], completa }.
// =====================================================================
const RUPTURA_FORMAS = (() => {
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn, { OBJ, FD } = MEC, { bloque, greca, anillo, escombros } = RUPTURA;
  const mid = o => (o.x0 + o.x1) / 2, MAG = '#ff4fd8';
  const azar = (a, b) => a + Math.random() * (b - a);

  // ---------------- peligros: avisan en el piso, luego lastiman ----------------
  const peligro = (g, o) => g.objs.push(Object.assign({ k: 'peligroRup', t: 0, aviso: .8, dura: .5, vx: 0, estilo: 'losa', y0: 0, y1: FLOOR }, o));
  const proy = (g, o) => g.objs.push(Object.assign({ k: 'proyRup', vx: 0, vy: 0, ay: 0, r: 5, estilo: 'piedra', life: 5, t: 0 }, o));
  const jefeVivo = g => g.boss && g.boss.st !== 'muere';
  OBJ.peligroRup = {
    front: true,
    step(o, g, dt) {
      o.t += dt; if (!jefeVivo(g) || o.t > o.aviso + o.dura) { o.dead = true; return; }
      if (o.t < o.aviso) return;
      if (o.vx) { o.x0 += o.vx * dt; o.x1 += o.vx * dt; }
      if (!o.golpe && o.estilo !== 'ola' && o.estilo !== 'muro' && o.estilo !== 'tornado') { o.golpe = 1; g.shake = Math.max(g.shake || 0, .12); }
      hurtIfIn(g, o.x0, o.y0, o.x1, o.y1);
    },
    draw(c, o, f) {
      const w = o.x1 - o.x0, cx = o.x0 + w / 2, t = f.t;
      if (o.t < o.aviso) {
        const k = o.t / o.aviso, ax0 = o.vx ? (o.vx > 0 ? o.x0 : o.x1 - 26) : o.x0, aw = o.vx ? 26 : w;
        c.fillStyle = rgba(MAG, (.16 + .2 * Math.abs(Math.sin(t * 14))) * (.5 + k * .5)); c.fillRect(ax0, o.horizontal ? o.y0 : FLOOR - 3, aw, o.horizontal ? o.y1 - o.y0 : 3);
        if (!o.horizontal) { c.strokeStyle = rgba('#ffd0f6', .6); c.lineWidth = .6; c.setLineDash([2, 3]); c.lineDashOffset = -t * 18; c.beginPath(); c.moveTo(ax0, Math.max(o.y0, FLOOR - 64)); c.lineTo(ax0, FLOOR); c.moveTo(ax0 + aw, Math.max(o.y0, FLOOR - 64)); c.lineTo(ax0 + aw, FLOOR); c.stroke(); c.setLineDash([]); }
        return;
      }
      const u = clamp((o.t - o.aviso) / Math.max(.1, Math.min(.18, o.dura)), 0, 1), h = o.y1 - o.y0;
      if (o.estilo === 'losa') { const y = lerp(-20, o.y1 - 22, u * u); c.fillStyle = '#7a2c10'; c.fillRect(o.x0 + 1, y, w - 2, 24); c.fillStyle = '#c4581f'; c.fillRect(o.x0 + 3, y + 2, w - 6, 18); c.fillStyle = '#ec8a3e'; c.fillRect(o.x0 + 3, y + 2, w - 6, 3); greca(c, cx, y + 12, 11, '#1f5a5c', 1.2); }
      else if (o.estilo === 'cristal') { const g2 = c.createLinearGradient(0, o.y0, 0, o.y1); g2.addColorStop(0, '#d8c8ff'); g2.addColorStop(1, '#3a6eff'); c.fillStyle = g2; for (const [dx, k] of [[-.28, .7], [.3, .82], [0, 1]]) { c.beginPath(); c.moveTo(cx + dx * w - w * .28, FLOOR); c.lineTo(cx + dx * w, FLOOR - h * k * u); c.lineTo(cx + dx * w + w * .28, FLOOR); c.closePath(); c.fill(); } c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .5; c.beginPath(); c.moveTo(cx, FLOOR); c.lineTo(cx, FLOOR - h * u); c.stroke(); }
      else if (o.estilo === 'raiz') { c.fillStyle = '#4a2c1a'; c.beginPath(); c.moveTo(o.x0, FLOOR); c.quadraticCurveTo(cx + Math.sin(t * 9) * 3, FLOOR - h * .5, cx, FLOOR - h * u); c.quadraticCurveTo(cx + Math.sin(t * 9 + 1) * 3 + 2, FLOOR - h * .5, o.x1, FLOOR); c.closePath(); c.fill(); c.strokeStyle = '#8a5a34'; c.lineWidth = .7; c.beginPath(); c.moveTo(cx - 1, FLOOR); c.quadraticCurveTo(cx + 1, FLOOR - h * .5, cx, FLOOR - h * u); c.stroke(); c.fillStyle = MAG; c.beginPath(); c.arc(cx, FLOOR - h * u, 1.3, 0, TAU); c.fill(); }
      else if (o.estilo === 'geiser') { const g2 = c.createLinearGradient(0, o.y0, 0, FLOOR); g2.addColorStop(0, 'rgba(220,250,255,.55)'); g2.addColorStop(1, 'rgba(70,170,210,.9)'); c.fillStyle = g2; c.beginPath(); c.moveTo(o.x0, FLOOR); c.quadraticCurveTo(cx - 3 + Math.sin(t * 20) * 2, FLOOR - h * .6 * u, cx - 4, FLOOR - h * u); c.quadraticCurveTo(cx, FLOOR - h * u - 8, cx + 4, FLOOR - h * u); c.quadraticCurveTo(cx + 3 + Math.sin(t * 22) * 2, FLOOR - h * .6 * u, o.x1, FLOOR); c.closePath(); c.fill(); }
      else if (o.estilo === 'ola') { const dir = Math.sign(o.vx) || 1; c.fillStyle = 'rgba(50,130,170,.92)'; c.beginPath(); c.moveTo(o.x0 - 30 * dir * (dir > 0 ? 1 : 0), FLOOR); for (let i = 0; i <= 10; i++) { const u2 = i / 10, x = o.x0 + w * u2, cresta = Math.sin(u2 * Math.PI); c.lineTo(x, FLOOR - h * cresta - Math.sin(t * 8 + i) * 1.2); } c.lineTo(o.x1, FLOOR); c.closePath(); c.fill(); c.strokeStyle = 'rgba(236,250,255,.95)'; c.lineWidth = 1.4; c.beginPath(); for (let i = 1; i < 10; i++) { const u2 = i / 10; c.lineTo(o.x0 + w * u2, FLOOR - h * Math.sin(u2 * Math.PI) - Math.sin(t * 8 + i) * 1.2); } c.stroke(); }
      else if (o.estilo === 'muro') { for (let y = o.y1 - 12; y > o.y0 - 12; y -= 12) for (let x = 0; x < 2; x++) bloque(c, o.x0 + 6 + x * 12, y + 6, 12, 0, ['#c7a878', '#e4c89a', '#8a6a48'], '#5a4028', .8); greca(c, cx, (o.y0 + o.y1) / 2, 12, MAG, 1.2); }
      else if (o.estilo === 'barrida') { c.fillStyle = '#4a2c1a'; c.beginPath(); c.moveTo(o.x0, o.y1); for (let i = 0; i <= 14; i++) c.lineTo(o.x0 + w * i / 14, o.y0 + Math.sin(i * 1.4 + t * 20) * 1.6); c.lineTo(o.x1, o.y1); c.closePath(); c.fill(); c.strokeStyle = MAG; c.lineWidth = .7; c.stroke(); }
      else if (o.estilo === 'tornado') { for (let i = 0; i < 9; i++) { const u2 = i / 9, y = FLOOR - u2 * h, rx = 6 + u2 * 24, s = Math.sin(t * 12 + i) * 4 * u2; c.strokeStyle = rgba(i % 2 ? '#d8e4ee' : '#8a98a8', .78); c.lineWidth = 2.2; c.beginPath(); c.ellipse(cx + s, y, rx, 3 + u2 * 3, 0, 0, TAU); c.stroke(); } }
    },
  };
  OBJ.proyRup = {
    front: true,
    step(o, g, dt) {
      o.t += dt; o.life -= dt; o.vy += o.ay * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.life <= 0 || !jefeVivo(g) || (o.suelo !== false && o.y > FLOOR + 2)) { o.dead = true; return; }
      const p = g.p; if (Math.abs(p.x - o.x) < o.r + 4 && o.y > p.y - p.h - o.r + 2 && o.y < p.y + o.r - 2) { o.dead = true; MEC.hurt(g, o.vx >= 0 ? 1 : -1); }
    },
    draw(c, o, f) {
      const t = f.t; c.save(); c.translate(o.x, o.y);
      if (o.estilo === 'bala') { c.fillStyle = '#1a1a22'; c.beginPath(); c.arc(0, 0, o.r, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(-o.r * .35, -o.r * .35, o.r * .28, 0, TAU); c.fill(); c.strokeStyle = rgba('#ffb060', .55); c.lineWidth = 1; c.beginPath(); c.moveTo(-Math.sign(o.vx) * o.r, 0); c.lineTo(-Math.sign(o.vx) * o.r * 3, 0); c.stroke(); }
      else if (o.estilo === 'bicho' || o.estilo === 'hormiga') {
        const vuelo=o.estilo==='bicho'; c.rotate(Math.atan2(o.vy||0,o.vx||1));
        c.strokeStyle='#8c6c3e'; c.lineWidth=.65;
        for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*2,-2);c.lineTo(i*2-1,-4);c.moveTo(i*2,2);c.lineTo(i*2-1,4);c.stroke();}
        if(vuelo){c.fillStyle='rgba(185,239,229,.65)';c.beginPath();c.ellipse(-1,-3,3,1.3,Math.sin(t*35)*.45,0,TAU);c.ellipse(-1,3,3,1.3,-Math.sin(t*35)*.45,0,TAU);c.fill();}
        c.fillStyle='#104843';c.beginPath();c.ellipse(0,0,4.3,3.1,0,0,TAU);c.fill();c.strokeStyle='#d7b35e';c.lineWidth=.6;c.stroke();c.beginPath();c.moveTo(-3.4,0);c.lineTo(3,0);c.stroke();c.fillStyle='#0b2928';c.beginPath();c.arc(3.6,0,1.4,0,TAU);c.fill();
      }
      else if (o.estilo === 'espina') { c.rotate(Math.atan2(o.vy, o.vx) - Math.PI / 2); c.fillStyle = '#5a3a20'; c.beginPath(); c.moveTo(-2.4, -6); c.lineTo(2.4, -6); c.lineTo(0, 7); c.closePath(); c.fill(); c.strokeStyle = MAG; c.lineWidth = .5; c.stroke(); }
      else if (o.estilo === 'gota') { c.fillStyle = 'rgba(140,210,255,.92)'; c.beginPath(); c.arc(0, 0, o.r, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(-1.4, -1.4, 1.2, 0, TAU); c.fill(); }
      else { c.rotate(o.t * 5); c.fillStyle = '#4a4438'; c.beginPath(); c.moveTo(-o.r, -o.r * .5); c.lineTo(o.r * .3, -o.r); c.lineTo(o.r, o.r * .3); c.lineTo(-o.r * .2, o.r); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = .5; c.stroke(); }
      c.restore();
    },
  };
  // el agua de La Marea: sube y frena a Itzel
  OBJ.mareaRup = {
    front: true,
    step(o, g, dt) { o.nivel += (o.meta - o.nivel) * Math.min(1, dt * .45); const p = g.p; if (!jefeVivo(g)) { o.meta = FLOOR + 40; if (o.nivel > FLOOR + 30) o.dead = true; return; } if (p.y > o.nivel) { p.vx *= .84; if (p.vy > 70) p.vy = 70; } },
    draw(c, o, f) { const g = f.g; c.fillStyle = 'rgba(40,120,150,.44)'; c.fillRect(g.cam - 20, o.nivel, VW + 40, 110); c.strokeStyle = 'rgba(226,246,255,.8)'; c.lineWidth = .8; c.beginPath(); for (let x = g.cam - 20; x <= g.cam + VW + 20; x += 6) c.lineTo(x, o.nivel + Math.sin(x * .06 + f.t * 3) * 1.4); c.stroke(); },
  };

  // ---------------- los ataques nuevos ----------------
  //  a = tiempo del ataque; m = { tx, ty, k, libre }: a dónde se mueve el cuerpo
  const una = (o, id) => { if (o['u' + id]) return false; o['u' + id] = 1; return true; };
  const limpia = (o, a) => { if (a < .03) for (const k of Object.keys(o)) if (k[0] === 'u' && k.length > 1 && k[1] >= '0' && k[1] <= '9') o[k] = 0; };
  const ATK = {
    // losas por columnas: dos columnas seguras que hay que encontrar
    glifos(o, g, dt, a) {
      o.dur = 3.6; limpia(o, a); const n = 6, ancho = (o.x1 - o.x0) / n;
      for (const [id, w] of [[1, .3], [2, 1.9]]) if (a > w && una(o, id)) { const s1 = Math.floor(Math.random() * n), s2 = (s1 + 2 + Math.floor(Math.random() * 3)) % n; for (let i = 0; i < n; i++) if (i !== s1 && i !== s2) peligro(g, { x0: o.x0 + i * ancho + 1, x1: o.x0 + (i + 1) * ancho - 1, aviso: 1.1, dura: .32, estilo: 'losa' }); }
    },
    // picos de cristal que avanzan hacia los dos lados
    cristales(o, g, dt, a, m) {
      o.dur = 3.1; limpia(o, a); m.ty = 60;
      for (let i = 0; i < 11; i++) if (a > .35 + i * .19 && una(o, 1 + i)) for (const s of [-1, 1]) { const x = o.x + s * (18 + i * 27); if (x > o.x0 && x < o.x1) peligro(g, { x0: x - 9, x1: x + 9, y0: FLOOR - 32, aviso: .42, dura: .55, estilo: 'cristal' }); }
    },
    // pozo de gravedad: jala a Itzel hacia el centro
    pozo(o, g, dt, a, m) {
      o.dur = 3.5; o.fx = 'pozo'; m.tx = mid(o); m.ty = 96; const k = a < .7 ? 0 : a < 3 ? 1 : 0, p = g.p;
      if (k) { const d = o.x - p.x; p.x += Math.sign(d) * Math.min(Math.abs(d), 62 * dt); if (Math.random() < .5) spawn(g, 1, o.x + azar(-150, 150), azar(30, 170), { ang: Math.PI / 2, spread: 6, v: 30, life: .5, s: 1.3, k: 'spark', cols: ['#ff9ae6', '#7ad8ff'] }); }
      hurtIfIn(g, o.x - 16, o.y - 16, o.x + 16, o.y + 16);
    },
    estrellas(o, g, dt, a) {
      o.dur = 3.4; limpia(o, a);
      for (let i = 0; i < 7; i++) if (a > .3 + i * .36 && una(o, 1 + i)) g.objs.push({ k: 'penasco', x: clamp(g.p.x + azar(-70, 70), o.x0 + 10, o.x1 - 10), y: -30, vy: 0, aviso: .75 });
    },
    // la ola cruza toda la arena: se brinca o se sube a una isla
    ola(o, g, dt, a) {
      o.dur = 3.6; limpia(o, a); const dir = (o.ai % 2) ? 1 : -1;
      if (a > .2 && una(o, 1)) peligro(g, dir > 0 ? { x0: o.x0 - 54, x1: o.x0 - 4, y0: FLOOR - 20, vx: 205, aviso: .8, dura: 2.5, estilo: 'ola' } : { x0: o.x1 + 4, x1: o.x1 + 54, y0: FLOOR - 20, vx: -205, aviso: .8, dura: 2.5, estilo: 'ola' });
    },
    chorros(o, g, dt, a) {
      o.dur = 3.1; limpia(o, a);
      for (let i = 0; i < 5; i++) if (a > .3 + i * .48 && una(o, 1 + i)) { const x = clamp(g.p.x + (i % 2 ? azar(-30, 30) : 0), o.x0 + 12, o.x1 - 12); peligro(g, { x0: x - 9, x1: x + 9, y0: 30, aviso: .72, dura: .6, estilo: 'geiser' }); }
    },
    // cañonazos a dos alturas: alta (quedarse abajo) o baja (brincar)
    canones(o, g, dt, a, m) {
      o.dur = 3.5; limpia(o, a); m.tx = o.x1 - 34; m.ty = 104; m.k = 3;
      for (let i = 0; i < 6; i++) if (a > .75 + i * .4 && una(o, 1 + i)) { const alta = (i + o.ai) % 2 === 0; proy(g, { x: o.x - 22, y: FLOOR - (alta ? 34 : 8), vx: -190, r: 5, estilo: 'bala', life: 3, suelo: false }); spawn(g, 5, o.x - 24, FLOOR - (alta ? 34 : 8), { v: 50, life: .3, s: 1.6, k: 'dust', cols: ['#d8d0c0', '#8a8070'] }); }
    },
    andanada(o, g, dt, a, m) {
      o.dur = 3; limpia(o, a); m.tx = o.x1 - 34; m.ty = 72; m.k = 3;
      for (let i = 0; i < 6; i++) if (a > .3 + i * .36 && una(o, 1 + i)) g.objs.push({ k: 'mira', x: clamp(g.p.x + azar(-60, 60), o.x0 + 10, o.x1 - 10), y: FLOOR, t: 0 });
    },
    // muro que avanza: unas veces se pasa por abajo, otras por arriba
    muro(o, g, dt, a, m) {
      o.dur = 3.4; limpia(o, a); m.tx = o.x1 - 34; m.ty = 60; m.k = 3; const abajo = o.ai % 2 === 0;
      if (a > .2 && una(o, 1)) peligro(g, { x0: o.x1 + 4, x1: o.x1 + 28, y0: abajo ? 0 : FLOOR - 30, y1: abajo ? FLOOR - 34 : FLOOR, vx: -130, aviso: .7, dura: 3, estilo: 'muro', horizontal: true });
    },
    // filas de bichos: una baja que se brinca y una alta que se deja pasar
    filaBaja(o, g, dt, a) {
      o.dur = 2.8; limpia(o, a); const dir = o.ai % 2 ? 1 : -1, x = dir > 0 ? o.x0 - 14 : o.x1 + 14;
      for (let i = 0; i < 6; i++) if (a > .5 + i * .12 && una(o, 1 + i)) proy(g, { x, y: FLOOR - 9, vx: dir * 165, r: 4.5, estilo: 'bicho', life: 3, suelo: false });
    },
    filaAlta(o, g, dt, a) {
      o.dur = 2.8; limpia(o, a); const dir = o.ai % 2 ? -1 : 1, x = dir > 0 ? o.x0 - 14 : o.x1 + 14;
      for (let i = 0; i < 7; i++) if (a > .5 + i * .12 && una(o, 1 + i)) proy(g, { x, y: FLOOR - 40, vx: dir * 165, r: 4.5, estilo: 'bicho', life: 3, suelo: false });
    },
    picadas(o, g, dt, a) {
      o.dur = 3; limpia(o, a);
      for (let i = 0; i < 4; i++) if (a > .5 + i * .55 && una(o, 1 + i)) { const sx = o.x + azar(-40, 40), sy = o.y, tt = .85; proy(g, { x: sx, y: sy, vx: (g.p.x - sx) / tt, vy: (g.p.y - 8 - sy) / tt, r: 4.5, estilo: 'bicho', life: 1.4 }); }
    },
    hormigas(o, g, dt, a) {
      o.dur = 2.6; limpia(o, a);
      for (let i = 0; i < 4; i++) if (a > .4 + i * .3 && una(o, 1 + i)) { const dir = i % 2 ? 1 : -1; proy(g, { x: dir > 0 ? o.x0 : o.x1, y: FLOOR - 5, vx: dir * 62, r: 5, estilo: 'hormiga', life: 5.6, suelo: false }); }
    },
    // el viento empuja de un lado y trae escombros
    viento(o, g, dt, a) {
      o.dur = 3.4; limpia(o, a); const dir = o.ai % 2 ? 1 : -1, p = g.p;
      if (a > .5 && a < 3.1) { p.x += dir * 88 * dt; if (Math.random() < .7) spawn(g, 1, dir > 0 ? o.x0 : o.x1, azar(40, 170), { ang: dir > 0 ? 0 : Math.PI, spread: .1, v: 300, life: .7, s: 1.2, k: 'dust', cols: ['#e8eef4', '#a8b4c0'] }); }
      for (let i = 0; i < 6; i++) if (a > .8 + i * .38 && una(o, 1 + i)) proy(g, { x: dir > 0 ? o.x0 - 8 : o.x1 + 8, y: azar(FLOOR - 54, FLOOR - 12), vx: dir * 210, r: 4.5, life: 3, suelo: false });
    },
    tornado(o, g, dt, a) {
      o.dur = 3.2; limpia(o, a); const dir = g.p.x > mid(o) ? -1 : 1;
      if (a > .2 && una(o, 1)) peligro(g, dir > 0 ? { x0: o.x0 - 10, x1: o.x0 + 14, y0: FLOOR - 74, vx: 118, aviso: .7, dura: 2.6, estilo: 'tornado' } : { x0: o.x1 - 14, x1: o.x1 + 10, y0: FLOOR - 74, vx: -118, aviso: .7, dura: 2.6, estilo: 'tornado' });
    },
    escombros(o, g, dt, a) {
      o.dur = 2.8; limpia(o, a);
      for (let i = 0; i < 7; i++) if (a > .4 + i * .28 && una(o, 1 + i)) proy(g, { x: o.x + azar(-30, 30), y: o.y + 10, vx: azar(-120, 120), vy: -80, ay: 480, r: 4.5, life: 3 });
    },
    // las raíces brotan donde pisa Itzel
    raices(o, g, dt, a) {
      o.dur = 3.5; limpia(o, a);
      for (let i = 0; i < 6; i++) if (a > .3 + i * .48 && una(o, 1 + i)) { const x = clamp(g.p.x, o.x0 + 8, o.x1 - 8); peligro(g, { x0: x - 8, x1: x + 8, y0: FLOOR - 56, aviso: .62, dura: .55, estilo: 'raiz' }); }
    },
    barridaRaiz(o, g, dt, a) {
      o.dur = 2.9; limpia(o, a);
      for (const [id, w] of [[1, .3], [2, 1.5]]) if (a > w && una(o, id)) peligro(g, { x0: o.x0 - 20, x1: o.x1 + 20, y0: FLOOR - 13, aviso: .95, dura: .32, estilo: 'barrida', horizontal: true });
    },
    espinas(o, g, dt, a) {
      o.dur = 3; limpia(o, a);
      for (let i = 0; i < 9; i++) if (a > .35 + i * .26 && una(o, 1 + i)) proy(g, { x: clamp(g.p.x + azar(-90, 90), o.x0 + 8, o.x1 - 8), y: -8, vy: 170, r: 3.5, estilo: 'espina', life: 2 });
    },
    // la forma final: tres tentáculos que se estiran a donde estaba Itzel
    agarre(o, g, dt, a) {
      o.dur = 3.6; limpia(o, a); if (a < .05) { o.alcances = []; o.b0 = o.b1 = o.b2 = null; } const p = g.p;
      [.2, 1.2, 2.2].forEach((w, i) => {
        const id = 'b' + i, u = a - w;
        if (u < 0) return;
        if (u < .04 && !o[id]) o[id] = { x: p.x, y: p.y - 8 };
        const q = o[id]; if (!q) return;
        const k = u < .55 ? u / .55 * .3 : u < .75 ? .3 + (u - .55) / .2 * .7 : u < 1 ? 1 : Math.max(0, 1 - (u - 1) / .3);
        o.alcances[i] = { x: q.x - o.x, y: q.y - o.y, k };
        if (u > .55 && u < 1) { const dx = q.x - o.x, dy = q.y - o.y, L0 = Math.hypot(dx, dy) || 1, vx = p.x - o.x, vy = p.y - 7 - o.y, pr = (vx * dx + vy * dy) / L0; if (pr > 0 && pr < L0 + 6 && Math.abs(vx * dy - vy * dx) / L0 < 8) MEC.hurt(g, dx > 0 ? 1 : -1); }
      });
      if (a > 3.5) { o.alcances = []; o.b0 = o.b1 = o.b2 = null; }
    },
    barrido(o, g, dt, a) {
      o.dur = 3; limpia(o, a); for (const [id, w, y0, y1] of [[1, .3, FLOOR - 13, FLOOR], [2, 1.5, FLOOR - 62, FLOOR - 26]]) if (a > w && una(o, id)) peligro(g, { x0: o.x0 - 20, x1: o.x1 + 20, y0, y1, aviso: .95, dura: .3, estilo: 'barrida', horizontal: true });
    },
    // encierra a Fresita en un cristal: por un rato no hay poderes
    jaula(o, g, dt, a) {
      o.dur = 3; limpia(o, a);
      if (a > .5 && una(o, 1)) { g.fre.daze = 2.6; MEC.ring(g, g.fre.x, g.fre.y, MAG, 32, .7); spawn(g, 18, g.fre.x, g.fre.y, { v: 90, life: .6, s: 2, k: 'spark', cols: [MAG, '#ffffff'] }); if (typeof toast === 'function') toast('¡Fresita quedó encerrada en un cristal!'); }
      for (let i = 0; i < 4; i++) if (a > .8 + i * .46 && una(o, 2 + i)) g.objs.push({ k: 'penasco', x: clamp(g.p.x + azar(-30, 30), o.x0 + 10, o.x1 - 10), y: -30, vy: 0, aviso: .7 });
    },
  };

  // lo que cada ataque dibuja además de sus peligros
  const dibujaPozo = (c, o, f) => {
    const t = f.t; c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = .8;
    for (let i = 0; i < 7; i++) { const u = ((t * .9 + i / 7) % 1), r = 150 * (1 - u) + 12; c.strokeStyle = rgba(i % 2 ? '#ff4fd8' : '#7ad8ff', u * .5); c.beginPath(); c.ellipse(o.x, o.y, r, r * .72, 0, 0, TAU); c.stroke(); }
    c.restore();
  };

  // ---------------- las diez formas ----------------
  const cada = (o, dt, seg) => { o.ft -= dt; if (o.ft > 0) return false; o.ft = seg; return true; };
  const FORMAS = [
    { id: 'mural', cuerpo: 1, nombre: 'Mural del códice', lema: 'Las losas del mural caen por columnas: busca las dos libres.', ataques: ['glifos', 'fragmentos', 'aplastar'],
      furia: { aviso: '¡El mural se derrumba!', paso(o, g, dt) { if (cada(o, dt, 2.4)) { const n = 6, w = (o.x1 - o.x0) / n, i = Math.floor(Math.random() * n); peligro(g, { x0: o.x0 + i * w + 1, x1: o.x0 + (i + 1) * w - 1, aviso: 1, dura: .32, estilo: 'losa' }); } } } },
    { id: 'golem', cuerpo: 2, nombre: 'Gólem dimensional', lema: 'Sus picos de cristal corren por el piso: brínquelos a tiempo.', ataques: ['cristales', 'aplastar', 'fragmentos'],
      furia: { aviso: '¡El piso se llena de cristales!', paso(o, g, dt) { if (cada(o, dt, 1.5)) { const x = azar(o.x0 + 14, o.x1 - 14); peligro(g, { x0: x - 9, x1: x + 9, y0: FLOOR - 32, aviso: .7, dura: .7, estilo: 'cristal' }); } } } },
    { id: 'nucleo', cuerpo: 3, nombre: 'Núcleo expuesto', lema: 'Su gravedad jala a Itzel: corre en contra sin dejar de esquivar.', ataques: ['pozo', 'estrellas', 'laser'],
      furia: { aviso: '¡La gravedad ya no se apaga!', paso(o, g, dt) { const p = g.p, d = o.x - p.x; if (o.st !== 'ventana') p.x += Math.sign(d) * Math.min(Math.abs(d), 20 * dt); } } },
    { id: 'marea', cuerpo: 4, nombre: 'La Marea', lema: 'Olas por todo el piso y géiseres del Golfo: sube a las islas o brinca.', ataques: ['ola', 'chorros', 'ola'],
      furia: { aviso: '¡Sube el mar!', inicio(o, g) { g.objs.push({ k: 'mareaRup', nivel: FLOOR + 30, meta: FLOOR - 7 }); } } },
    { id: 'baluarte', cuerpo: 5, nombre: 'El Baluarte', lema: 'Se atrinchera en un lado: cañonazos a dos alturas y muros que avanzan.', ataques: ['canones', 'muro', 'andanada'],
      furia: { aviso: '¡Fuego a discreción!', paso(o, g, dt) { if (cada(o, dt, 1.5)) g.objs.push({ k: 'mira', x: clamp(g.p.x + azar(-50, 50), o.x0 + 10, o.x1 - 10), y: FLOOR, t: 0 }); } } },
    { id: 'enjambre', cuerpo: 6, nombre: 'El Enjambre', lema: 'Escarabajos de la Ruptura: filas bajas, filas altas y picadas.', ataques: ['filaBaja', 'filaAlta', 'picadas', 'hormigas'],
      furia: { aviso: '¡Todo el enjambre al ataque!', paso(o, g, dt) { if (cada(o, dt, 1.9) && o.st !== 'ventana') { const sx = o.x, sy = o.y; proy(g, { x: sx, y: sy, vx: (g.p.x - sx) / .85, vy: (g.p.y - 8 - sy) / .85, r: 4.5, estilo: 'bicho', life: 1.4 }); } } } },
    { id: 'huracan', cuerpo: 7, nombre: 'El Huracán', lema: 'El viento te arrastra y el tornado barre la arena: agárrate del piso.', ataques: ['viento', 'tornado', 'escombros'],
      furia: { aviso: '¡El ojo del huracán!', inicio(o) { o.vientoF = 1; }, paso(o, g, dt) { if (cada(o, dt, 3)) o.vientoF = -o.vientoF; const p = g.p; if (!p.plat && o.st !== 'ventana') p.x += o.vientoF * 30 * dt; } } },
    // el duelo contra tu reflejo y Zarzamora vive en ruptura-duelo.js
    { id: 'espejo', cuerpo: 8, duelo: true, hp: 5, nombre: 'La otra Itzel', lema: 'Tu reflejo se levantó del agua con su ajolotito malo. Pelea igual que tú: cáele cuando se canse.', ataques: ['reflejo', 'embestida', 'pisoton', 'sombras', 'danza'],
      furia: { aviso: 'Ya no es tu reflejo' } },
    { id: 'ceiba', cuerpo: 9, nombre: 'La Ceiba', lema: 'Sus raíces brotan justo donde pisas: no dejes de moverte.', ataques: ['raices', 'barridaRaiz', 'espinas'],
      furia: { aviso: '¡Toda la ceiba despierta!', paso(o, g, dt) { if (cada(o, dt, 1.7)) { const x = clamp(g.p.x, o.x0 + 8, o.x1 - 8); peligro(g, { x0: x - 8, x1: x + 8, y0: FLOOR - 56, aviso: .7, dura: .5, estilo: 'raiz' }); } } } },
    { id: 'tentaculos', cuerpo: 0, final: true, hp: 5, nombre: 'Los Tentáculos', lema: 'Su forma verdadera: agarra, barre y encierra a Fresita. Es la última.', ataques: ['agarre', 'laser', 'barrido', 'fragmentos', 'jaula', 'aplastar'], furiaVieja: true },
  ];
  const FINAL = FORMAS.find(q => q.final), DE = Object.fromEntries(FORMAS.map(q => [q.id, q]));

  // ---------------- el progreso ----------------
  const prog = () => { if (typeof PROG === 'undefined') return { vencidas: [], completa: false }; return PROG.d.ruptura || (PROG.d.ruptura = { vencidas: [], completa: false }); };
  let fuerza = null; // para probar una forma en especial
  function elige() {
    if (fuerza) return DE[fuerza];
    const pide = typeof pedido === 'function' && pedido('forma'); if (DE[pide]) return DE[pide]; // ?jefe=ruptura&forma=ceiba: para probar un combate
    const p = prog(); if (p.completa) return FORMAS[Math.floor(Math.random() * FORMAS.length)];
    const falta = FORMAS.filter(q => !q.final && !p.vencidas.includes(q.id));
    return falta.length ? falta[Math.floor(Math.random() * falta.length)] : FINAL;
  }
  function registra(o, g) {
    if (o.registrada) return; o.registrada = true; if (typeof RUN !== 'undefined' && RUN && RUN.jefeDirecto) return; // las pruebas directas no cuentan
    const p = prog(), F = o.F, nueva = !p.vencidas.includes(F.id);
    if (nueva) { p.vencidas.push(F.id); if (typeof PROG !== 'undefined') PROG.s.rupturaFormas = p.vencidas.length; }
    if (F.final && !p.completa) { p.completa = true; if (typeof RUN !== 'undefined' && RUN) RUN.verFinal = true; }
    if (typeof AVISOS === 'function' && nueva && !p.completa) AVISOS('La Ruptura', `Forma ${p.vencidas.length} de 10 vencida: ${F.nombre}`, 'jade');
    if (typeof revisaLogros === 'function') revisaLogros(); else if (typeof PROG !== 'undefined') PROG.save();
  }

  // ---------------- enganches con el jefe ----------------
  const initViejo = X.INIT.ruptura;
  X.INIT.ruptura = (o, g) => {
    initViejo(o, g); const F = (typeof RUN !== 'undefined' && RUN && DE[RUN.formaRupturaEntrada]) || elige();
    if (typeof RUN !== 'undefined' && RUN) delete RUN.formaRupturaEntrada;
    o.F = F; o.ataques = F.ataques; o.hp = o.max = F.hp || 3; o.forma = F.cuerpo; o.alcances = [];
    JEFES.ruptura.nombre = `La Ruptura: ${F.nombre}`; JEFES.ruptura.lema = F.lema;
    // la forma del huracán enseña lo que fue Opal (los datos del libro, uno por pelea)
    if (F.id === 'huracan' && typeof TARJETAS !== 'undefined') setTimeout(() => { if (STATE === 'play' && CUR && CUR.isBoss && NIVELES.bruma) TARJETAS.descubre(NIVELES.bruma); }, 6000);
  };
  const stepViejo = X.STEP.ruptura;
  X.STEP.ruptura = (o, g, dt) => { stepViejo(o, g, dt); if (o.st === 'muere' && o.F) registra(o, g); };
  X.RUP_ATK = ATK;
  const tellViejo = X.TELL.ruptura;
  X.TELL.ruptura = (c, o, f) => { tellViejo(c, o, f); if (o.fx === 'pozo') dibujaPozo(c, o, f); };

  if (typeof FURIA !== 'undefined') {
    const vieja = FURIA.ruptura;
    FURIA.ruptura = {
      aviso: vieja.aviso,
      inicio(o, g) { const q = o.F && o.F.furia; this.aviso = q ? q.aviso : vieja.aviso; if (q && q.inicio) q.inicio(o, g); },
      paso(o, g, dt) { const q = o.F && o.F.furia; if (q) { if (q.paso) q.paso(o, g, dt); } else vieja.paso(o, g, dt); },
    };
  }
  // la pelea repetida no pasa otra vez por el prólogo: solo la primera vez y en la forma final
  if (typeof startBoss === 'function') {
    GANCHOS.en('startBoss', sbPrev => function () {
      const sigue = RUN.jefeOrden[RUN.bossIdx || 0] || 'ruptura';
      if (sigue === 'ruptura') { const p = prog(), pide = typeof pedido === 'function' && pedido('forma'); if (pide) RUN.sinPrologo = true; else if (!RUN.jefeDirecto) RUN.sinPrologo = !(p.vencidas.length === 0 || p.vencidas.length >= FORMAS.length - 1); }
      sbPrev.apply(this, arguments);
    });
    // la forma final se celebra con su cinemática antes de seguir jugando
    GANCHOS.en('levelDone', ldPrev => function () {
      if (RUN && RUN.verFinal && CUR && CUR.isBoss) {
        RUN.verFinal = false; const yo = this, args = arguments, estado = STATE;
        // después de la cinemática final salen los créditos, y al cerrarlos sigue la pantalla de victoria
        const sigue = () => { STATE = estado; ldPrev.apply(yo, args); };
        CINE.play('final', { alTerminar: () => {
          if (window.OPCIONES && OPCIONES.pantallaCreditos) { STATE = 'win'; const h = document.getElementById('hud'); if (h) h.classList.remove('on'); OPCIONES.pantallaCreditos(sigue); } else sigue();
        } });
        return;
      }
      ldPrev.apply(this, arguments);
    });
  }

  // ---------------- los seis cuerpos nuevos (mismos bloques y núcleo que los otros) ----------------
  const hoy = (cols, orilla) => (c, x, y, s, r = 0) => bloque(c, x, y, s, r, cols, orilla, .8);
  // 4 · La Marea: una ola de bloques turquesa que se enrosca
  const MARE = ['#1a6a88', '#46b4c8', '#0c3448'], BM = hoy(MARE, '#bff4ff');
  const mareaImagen = new Image();
  mareaImagen.src = '../Roguelike/assets/jefes/ruptura-marea.png';
  let mareaLimpia;
  function prepararMarea() {
    if (!mareaImagen.complete || !mareaImagen.naturalWidth) return null;
    if (!mareaLimpia) {
      mareaLimpia = document.createElement('canvas'); mareaLimpia.width = 512; mareaLimpia.height = 768;
      const cx = mareaLimpia.getContext('2d', {willReadFrequently:true}); cx.drawImage(mareaImagen,0,0,512,768);
      try { const im = cx.getImageData(0,0,512,768);
      for (let i=3; i<im.data.length; i+=4) im.data[i] = im.data[i]<210 ? 0 : 255;
      cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    return mareaLimpia;
  }
  const impulsoVisual = o => o && o.st === 'ataque' ? Math.min(1, Math.max(0, (o.at || 0) * 3)) : 0;
  function dibujarMarea(c,t,img,impulso=0) {
    // La franja central queda alineada con el punto de impacto; las otras ondulan.
    const bandas = [[0,205],[205,320],[320,390],[390,530],[530,768]];
    const ancho=81.3, alto=122, x=-43.7, y=-56.4;
    for (let i=0; i<bandas.length; i++) {
      const [a,b]=bandas[i], desplazamiento=i===2?0:Math.sin(t*2+i*1.6)*(1.4+impulso*1.6);
      c.drawImage(img,0,a,512,b-a,x+desplazamiento,y+a*alto/768,ancho,(b-a)*alto/768+.05);
    }
  }
  RUPTURA.FORMAS.push((c, t, o) => {
    const imagen = prepararMarea(); if (imagen) { dibujarMarea(c,t,imagen,impulsoVisual(o)); return; }
    escombros(c, t, 12, 40, 56, 71, MARE, '#bff4ff');
    for (let i = 0; i < 34; i++) { const u = i / 34, an = u * TAU * 1.5 - Math.PI * .8 + t * .35, r = 16 + u * 36; BM(c, Math.cos(an) * r, Math.sin(an) * r * .86 + Math.sin(t * 2 + i * .4) * 1.5, 11 - u * 5, an); }
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU - t * .5, r = 56 + Math.sin(t * 2 + i) * 3; c.fillStyle = 'rgba(236,250,255,.85)'; c.beginPath(); c.arc(Math.cos(an) * r, Math.sin(an) * r * .84, 1.8 + (i % 3) * .6, 0, TAU); c.fill(); }
    anillo(c, t, 11, 13, 6.4, MARE, '#bff4ff');
  });
  // 5 · El Baluarte: una torre de piedra campechana con garita y cañones
  const CAL = ['#c7a878', '#e4c89a', '#8a6a48'], BC = hoy(CAL, '#5a4028');
  const baluarteImagen = new Image();
  baluarteImagen.src = '../Roguelike/assets/jefes/ruptura-baluarte.png';
  let baluarteLimpio;
  function prepararBaluarte() {
    if (!baluarteImagen.complete || !baluarteImagen.naturalWidth) return null;
    if (!baluarteLimpio) {
      baluarteLimpio=document.createElement('canvas'); baluarteLimpio.width=512; baluarteLimpio.height=768;
      const cx=baluarteLimpio.getContext('2d',{willReadFrequently:true}); cx.drawImage(baluarteImagen,0,0,512,768);
      try { const im=cx.getImageData(0,0,512,768);
      for(let i=3;i<im.data.length;i+=4) im.data[i]=im.data[i]<210?0:255;
      cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    return baluarteLimpio;
  }
  function dibujarBaluarte(c,t,img,impulso=0) {
    const x=-40.7,y=-47.3,w=81.4,h=122;
    const pieza=(poly,dx,dy)=>{ c.save();c.translate(dx,dy);c.beginPath();poly.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.clip();c.drawImage(img,x,y,w,h);c.restore(); };
    const a=Math.sin(t*1.4)*1.4+impulso*Math.sin(t*6)*.8;
    pieza([[-45,-38],[-11,-38],[-11,20],[-45,20]],-a,a*.4);
    pieza([[11,-38],[45,-38],[45,20],[11,20]],a,-a*.4);
    pieza([[-45,20],[45,20],[45,78],[-45,78]],0,Math.sin(t*1.2)*.55);
    pieza([[-45,-50],[45,-50],[45,-38],[11,-38],[11,20],[-11,20],[-11,-38],[-45,-38]],0,0);
  }
  RUPTURA.FORMAS.push((c, t, o) => {
    const imagen=prepararBaluarte(); if(imagen) { dibujarBaluarte(c,t,imagen,impulsoVisual(o)); return; }
    for (let y = 0; y < 5; y++) for (let x = -3 + (y % 2) * .5; x <= 3; x++) BC(c, x * 13, 30 - y * 13, 12.6);
    for (let x = -3; x <= 3; x += 2) BC(c, x * 13, -36, 10);
    for (const s of [-1, 1]) { c.fillStyle = '#d8ba8a'; c.beginPath(); c.moveTo(s * 42, -30); c.lineTo(s * 58, -30); c.lineTo(s * 56, -8); c.lineTo(s * 44, -8); c.closePath(); c.fill(); c.strokeStyle = '#5a4028'; c.lineWidth = .8; c.stroke(); c.fillStyle = '#b89464'; c.beginPath(); c.arc(s * 50, -30, 8.4, Math.PI, 0); c.fill(); c.stroke(); c.fillStyle = '#2a1a10'; c.fillRect(s * 50 - 1.6, -24, 3.2, 8); }
    for (const [x, y] of [[-30, 12], [30, 12], [0, 24]]) { c.fillStyle = '#1a1a22'; c.beginPath(); roundRect(c, x - 2, y - 3, 22, 6.4, 2.4); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x, y - 2, 18, 1); }
    greca(c, -26, -14, 8, MAG, 1); greca(c, 26, -14, 8, MAG, 1); anillo(c, t, 11, 13, 6.2, ['#8a6a48', '#c7a878', '#5a4028'], MAG);
  });
  // 6 · El Enjambre: una nube de bichos que da vueltas alrededor del núcleo
  const enjambreImagen=new Image();
  enjambreImagen.src='../Roguelike/assets/jefes/ruptura-enjambre-escarabajos.png';
  let enjambreLimpio;
  function prepararEnjambre() {
    if(!enjambreImagen.complete||!enjambreImagen.naturalWidth)return null;
    if(!enjambreLimpio){
      enjambreLimpio=document.createElement('canvas'); enjambreLimpio.width=512;enjambreLimpio.height=768;
      const cx=enjambreLimpio.getContext('2d',{willReadFrequently:true});cx.drawImage(enjambreImagen,0,0,512,768);
      try { const im=cx.getImageData(0,0,512,768);for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]<210?0:255;cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }
    }
    return enjambreLimpio;
  }
  function dibujarEnjambre(c,t,img,impulso=0){
    const x=-40.7,y=-47.2,w=81.4,h=122, oscilacion=Math.sin(t*2)*(1.2+impulso*1.1);
    const pieza=(poly,dx,dy)=>{c.save();c.translate(dx,dy);c.beginPath();poly.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.clip();c.drawImage(img,x,y,w,h);c.restore();};
    pieza([[-43,-27],[-13,-27],[-13,18],[-43,18]],-oscilacion,0);
    pieza([[13,-27],[43,-27],[43,18],[13,18]],oscilacion,0);
    pieza([[-43,18],[43,18],[43,77],[-43,77]],Math.sin(t*1.5)*.5,Math.sin(t*2)*.5);
    pieza([[-43,-48],[43,-48],[43,-27],[13,-27],[13,18],[-13,18],[-13,-27],[-43,-27]],0,0);
    for(let i=0;i<8;i++){const a=i*TAU/8+t*(i%2?.7:-.6),r=43+Math.sin(t*2+i)*3; c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r*.75);c.rotate(a+Math.PI/2);c.fillStyle='#0a3836';c.beginPath();c.ellipse(0,0,1.6,2.6,0,0,TAU);c.fill();c.strokeStyle='#d1ad59';c.lineWidth=.45;c.stroke();c.beginPath();c.moveTo(0,-2);c.lineTo(0,2);c.stroke();c.restore();}
  }
  RUPTURA.FORMAS.push((c, t, o) => {
    const imagen=prepararEnjambre();if(imagen){dibujarEnjambre(c,t,imagen,impulsoVisual(o));return;}
    for (let i = 0; i < 46; i++) { const h = hash1(i, 81), r = 18 + hash1(i, 82) * 40, an = h * TAU + t * (.7 + hash1(i, 83)) * (i % 2 ? 1 : -1), x = Math.cos(an) * r, y = Math.sin(an) * r * .78 + Math.sin(t * 3 + i) * 2.4, s = 1.4 + hash1(i, 84) * 1.6; c.fillStyle = i % 3 ? '#1a120a' : '#3a2410'; c.beginPath(); c.ellipse(x, y, s * 1.7, s, an + Math.PI / 2, 0, TAU); c.fill(); c.fillStyle = 'rgba(214,236,255,.5)'; c.beginPath(); c.ellipse(x, y - s, s * 1.2, s * .5, Math.sin(t * 40 + i), 0, TAU); c.fill(); if (i % 5 === 0) { c.fillStyle = '#e6b422'; c.fillRect(x - s * .7, y - .4, s * 1.4, .8); } }
    anillo(c, t, 10, 12.5, 6.2, ['#2a1a0a', '#6a4418', '#120a06'], '#e6b422');
  });
  // 7 · El Huracán: un remolino de nubes con su ojo en el núcleo
  const huracanImagen=new Image();
  huracanImagen.src='../Roguelike/assets/jefes/ruptura-huracan.png';
  let huracanLimpio;
  function prepararHuracan(){
    if(!huracanImagen.complete||!huracanImagen.naturalWidth)return null;
    if(!huracanLimpio){huracanLimpio=document.createElement('canvas');huracanLimpio.width=512;huracanLimpio.height=768;
      const cx=huracanLimpio.getContext('2d',{willReadFrequently:true});cx.drawImage(huracanImagen,0,0,512,768);
      try { const im=cx.getImageData(0,0,512,768);for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]<210?0:255;cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }}
    return huracanLimpio;
  }
  function dibujarHuracan(c,t,img,impulso=0){
    // El ojo permanece fijo en el punto vulnerable y la cola ondula con el viento.
    const x=-40.7,y=-41.3,w=81.4,h=122;
    const bandas=[[0,190],[190,330],[330,470],[470,615],[615,768]];
    bandas.forEach(([a,b],i)=>{const dx=i===1?0:Math.sin(t*1.8-i*.8)*(.2+i*.27)*(1+impulso*.7);c.drawImage(img,0,a,512,b-a,x+dx,y+a*h/768,w,(b-a)*h/768+.1);});
    for(let i=0;i<5;i++){const an=t*1.6+i*TAU/5,r=35+i*2;c.save();c.translate(Math.cos(an)*r,Math.sin(an)*r*.7);c.rotate(an);c.fillStyle='rgba(183,219,226,.7)';c.beginPath();c.ellipse(0,0,1.6,.6,0,0,TAU);c.fill();c.restore();}
  }
  RUPTURA.FORMAS.push((c, t, o) => {
    const imagen=prepararHuracan();if(imagen){dibujarHuracan(c,t,imagen,impulsoVisual(o));return;}
    for (let a = 0; a < 4; a++) for (let i = 0; i < 18; i++) { const u = i / 18, an = a / 4 * TAU + u * 4 - t * 1.6, r = 12 + u * 46, s = 3.2 + u * 7.5; c.fillStyle = rgba(i % 2 ? '#c8d4e0' : '#7a8898', .9 - u * .45); c.beginPath(); c.ellipse(Math.cos(an) * r, Math.sin(an) * r * .78, s * 1.4, s * .8, an, 0, TAU); c.fill(); }
    for (let i = 0; i < 9; i++) { const an = i / 9 * TAU + t * 2.2, r = 44 + (i % 3) * 8; bloque(c, Math.cos(an) * r, Math.sin(an) * r * .78, 3.4, an, ['#5a5448', '#8a8070', '#2a2620'], null); }
    c.strokeStyle = rgba('#e8f4ff', .55); c.lineWidth = .7; for (let i = 0; i < 5; i++) { const an = i * 1.3 - t * 2.4; c.beginPath(); c.ellipse(0, 0, 30 + i * 6, 22 + i * 4, 0, an, an + 1.2); c.stroke(); }
    anillo(c, -t, 10, 12, 5.6, ['#3a4656', '#6a7a8c', '#1a222c'], '#bff4ff');
  });
  // 8 · La otra Itzel: un espejo de obsidiana con la silueta de Itzel adentro
  RUPTURA.FORMAS.push((c, t) => {
    for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, x = Math.cos(an) * 44, y = Math.sin(an) * 52; bloque(c, x, y, 13, an, ['#16101c', '#3a3048', '#06040a'], MAG, .8); }
    c.fillStyle = '#0c0814'; c.beginPath(); c.ellipse(0, 0, 40, 48, 0, 0, TAU); c.fill(); c.save(); c.beginPath(); c.ellipse(0, 0, 40, 48, 0, 0, TAU); c.clip();
    c.fillStyle = 'rgba(160,220,255,.1)'; c.beginPath(); c.moveTo(-40, -30); c.lineTo(-8, -48); c.lineTo(20, 48); c.lineTo(-12, 48); c.closePath(); c.fill();
    c.fillStyle = '#1e1230'; c.beginPath(); c.arc(0, -18, 15, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-12, 30); c.lineTo(-10, -2); c.quadraticCurveTo(0, -8, 10, -2); c.lineTo(12, 30); c.closePath(); c.fill(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 11, -28); c.quadraticCurveTo(s * 24, -24 + Math.sin(t * 2) * 2, s * 22, -6); c.lineTo(s * 13, -14); c.fill(); }
    c.fillStyle = '#ff9ae6'; for (const s of [-1, 1]) c.fillRect(s * 5.4 - 1.4, -21, 2.8, 3.4); c.restore();
    anillo(c, t, 10, 11, 5, ['#2a1a3a', '#5a3a78', '#0c0814'], MAG);
  });
  // 9 · La Ceiba: copa de ramas y raíces con espinas, como la ceiba de la selva
  const ceibaImagen=new Image();
  ceibaImagen.src='../Roguelike/assets/jefes/ruptura-ceiba.png';
  let ceibaLimpia;
  function prepararCeiba(){
    if(!ceibaImagen.complete||!ceibaImagen.naturalWidth)return null;
    if(!ceibaLimpia){ceibaLimpia=document.createElement('canvas');ceibaLimpia.width=612;ceibaLimpia.height=643;
      const cx=ceibaLimpia.getContext('2d',{willReadFrequently:true});cx.drawImage(ceibaImagen,0,0,612,643);
      try { const im=cx.getImageData(0,0,612,643);for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]<210?0:255;cx.putImageData(im,0,0); } catch (e) { if (e.name !== 'SecurityError') throw e; }}
    return ceibaLimpia;
  }
  function dibujarCeiba(c,t,img,impulso=0){
    const x=-55,y=-60,w=110,h=116;
    const pieza=(poly,dx,dy,angulo,px,py)=>{c.save();c.translate(dx,dy);c.translate(px,py);c.rotate(angulo);c.translate(-px,-py);c.beginPath();poly.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.clip();c.drawImage(img,x,y,w,h);c.restore();};
    const brisa=Math.sin(t*1.3)*(1+impulso*.8);
    pieza([[-56,-61],[56,-61],[56,-25],[-56,-25]],0,0,brisa*.025,0,-25);
    pieza([[-56,25],[0,25],[0,57],[-56,57]],-brisa*.25,0,0,0,0);
    pieza([[0,25],[56,25],[56,57],[0,57]],brisa*.25,0,0,0,0);
    pieza([[-56,-25],[56,-25],[56,25],[-56,25]],0,0,0,0,0);
  }
  RUPTURA.FORMAS.push((c, t, o) => {
    const imagen=prepararCeiba();if(imagen){dibujarCeiba(c,t,imagen,impulsoVisual(o));return;}
    const rama = (x, y, an, l, n) => { const x2 = x + Math.cos(an) * l, y2 = y + Math.sin(an) * l, sw = Math.sin(t * 1.4 + n + x) * .05; c.strokeStyle = '#4a2c1a'; c.lineWidth = n * 1.5 + .7; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); if (n > 0) { rama(x2, y2, an - .46 + sw, l * .74, n - 1); rama(x2, y2, an + .42 + sw, l * .72, n - 1); } else { c.fillStyle = ['#3f7a34', '#5a9a44', '#2c5a28'][(Math.abs(Math.round(x * 3))) % 3]; c.beginPath(); c.ellipse(x2, y2, 4.8, 3.4, an, 0, TAU); c.fill(); } };
    c.lineCap = 'round'; for (const an of [-1.57, -2.2, -.94, -2.8, -.34]) rama(0, -4, an, 19, 3);
    for (const [an, l] of [[1.57, 30], [2.2, 28], [.94, 28], [2.75, 24], [.4, 24]]) { const x = Math.cos(an) * l, y = Math.sin(an) * l + 10; c.strokeStyle = '#3a2214'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(x * .3 + Math.sin(t + an) * 3, y * .9, x, y + 6); c.stroke(); }
    c.fillStyle = '#6a4a2e'; c.beginPath(); c.moveTo(-13, 22); c.quadraticCurveTo(-8, 0, -10, -18); c.lineTo(10, -18); c.quadraticCurveTo(8, 0, 13, 22); c.closePath(); c.fill();
    c.fillStyle = '#3a2214'; for (let i = 0; i < 9; i++) { const x = (hash1(i, 91) - .5) * 20, y = -14 + hash1(i, 92) * 32; c.beginPath(); c.moveTo(x - 1.6, y); c.lineTo(x, y - 3.4); c.lineTo(x + 1.6, y); c.closePath(); c.fill(); }
    anillo(c, t, 10, 12, 5.6, ['#3a2214', '#6a4a2e', '#1c100a'], MAG);
  });

  return { FORMAS, FINAL, elige, prog, registra, fuerza: id => { fuerza = id; }, faltan: () => FORMAS.length - prog().vencidas.length };
})();
