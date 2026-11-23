'use strict';
// =====================================================================
//  MECANICAS DE LOS MUNDOS NUEVOS: barro, jardín de ecos, fuego, agua,
//  hielo, cielo y hollín. Se registran en las tablas de MEC.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, LANDK, POW, ZONAS, FOE, FD, mkPlat, walkStep, gravity, onGround, ring, lim, freeOf, snapX, surf, tx, tl } = MEC;
  const near2 = (ax, ay, bx, by, r) => Math.hypot(ax - bx, ay - by) < r;
  const inBox = (x, y, s, pad = 0) => x >= s.x - pad && x < s.x + s.w + pad && y >= s.y - pad && y < s.y + s.h + pad;
  // estado de caida compartido por varias plataformas
  function fallStep(pl, dt, back = 3) {
    if (pl.st === 'fall') { pl.vy = (pl.vy || 0) + 900 * dt; pl.y += pl.vy * dt; if (pl.y > VH + 30) { pl.st = 'gone'; pl.tt = 0; } }
    else if (pl.st === 'gone') { pl.tt += dt; if (pl.tt > back) { pl.st = null; pl.y = pl.y0; pl.x = pl.x0; pl.vy = 0; pl.tt = 0; pl.heat = 0; pl.cracks = 0; } }
    pl.on = pl.st !== 'gone';
    return pl.st !== null;
  }

  // ================= PLATAFORMAS =================
  // barro: losa colgada de un hilo de plastilina que se estira con el peso
  PK.taffy = (pl, g, d, dt) => {
    if (pl.st === 'snap') { pl.tt += dt; pl.on = false; pl.dropY = (pl.dropY || 0) + (pl.dv = (pl.dv || 0) + 900 * dt) * dt; if (pl.tt > 2.6) { pl.st = null; pl.y = pl.y0; pl.on = true; pl.v = 0; pl.dropY = 0; pl.dv = 0; } return; }
    if (pl.stood) { pl.v = Math.min((pl.v || 0) + 34 * dt, 64); pl.y += pl.v * d; if (pl.y > pl.y0 + (pl.depth || 60)) { pl.st = 'snap'; pl.tt = 0; } }
    else { pl.v = 0; pl.y += (pl.y0 - pl.y) * Math.min(1, dt * 1.6); }
  };
  // eco: losa flotante que sube cuando la pisas y baja sola
  PK.rise = (pl, g, d) => { const top = pl.y0 - (pl.depth || 64); if (pl.stood) pl.y = Math.max(top, pl.y - 30 * d); else pl.y = Math.min(pl.y0, pl.y + 20 * d); };
  // fuego: piedra que flota sobre las brasas y se calienta si te quedas
  PK.hot = (pl, g, d, dt) => {
    if (fallStep(pl, dt)) return;
    pl.x = pl.x0 + Math.sin(pl.t * (pl.sp || .8)) * (pl.amp || 0);
    pl.heat = clamp((pl.heat || 0) + (pl.stood ? dt : -dt * .6), 0, 2);
    if (pl.heat >= 1.7) { pl.st = 'fall'; pl.vy = 0; }
  };
  // agua: medusa que sube y baja y te rebota
  PK.jelly = (pl) => { pl.bouncy = true; pl.y = pl.y0 + Math.sin(pl.t * (pl.sp || 1.2) + (pl.ph || 0)) * (pl.amp || 14); };
  // hielo: témpano que se raja cada vez que caes en él
  PK.crack = (pl, g, d, dt) => { fallStep(pl, dt, 3.5); };
  LANDK.crack = (pl, g) => { pl.cracks = (pl.cracks || 0) + 1; spawn(g, 6, pl.x + pl.w / 2, pl.y, { v: 50, life: .4, s: 1.4, k: 'dust', cols: ['#ffffff', '#bcd7ea'] }); if (pl.cracks >= 3) { pl.st = 'fall'; pl.vy = 0; } };
  // cielo: meteoros que cruzan y se deshacen al final de su viaje
  PK.cycle = (pl) => { const span = pl.span || 160, u = wrap(pl.t * (pl.sp || 22) + (pl.ph || 0), span); pl.x = pl.x0 + u; pl.u = u / span; pl.on = pl.u > .06 && pl.u < .9; };
  // hollín: tablón que cruje (hace ruido) cuando caes encima
  LANDK.creak = (pl, g) => { g.noise = Math.min(1, (g.noise || 0) + .45); pl.sq = 1; };
  // tempano flotante creado por Fresita
  PK.floe = (pl, g, d) => { pl.x += (pl.vx || 0) * d; pl.y = pl.y0 + Math.sin(pl.t * 2) * 1.2; const k = clamp(pl.life / pl.max, 0, 1); const nw = 12 + (pl.w0 - 12) * k; pl.x += (pl.w - nw) / 2; pl.w = nw; };
  // burbuja de aire que sube
  PK.airbub = (pl, g, d) => { pl.y -= 18 * d; pl.x = pl.x0 + Math.sin(pl.t * 3) * 2; if (pl.y < 40) pl.dead = true; };

  // ---------- dibujos de plataformas ----------
  LOOK.arcilla = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y + (pl.dropY || 0), w = pl.w;
    if (pl.st === 'snap' && pl.tt > .6) return;
    const g = c.createLinearGradient(0, y, 0, y + 8); g.addColorStop(0, shade(sk.plat, .25)); g.addColorStop(1, shade(sk.plat, -.3));
    c.fillStyle = g; c.beginPath(); roundRect(c, x, y, w, 8, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x + w * .3, y + 2, w * .2, 1, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(80,30,10,.2)'; c.lineWidth = .4; c.beginPath(); c.ellipse(x + w * .65, y + 4.5, 2.4, 1.4, .3, .2, TAU - .6); c.stroke();
  };
  LOOK.losa = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, DX = 12, DY = -8;
    c.fillStyle = 'rgba(10,30,30,.3)'; c.beginPath(); c.ellipse(x + w / 2 + 4, pl.y0 + 30, w * .45, 3, 0, 0, TAU); c.fill();
    c.fillStyle = sk.plat2; c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + DX, y + DY); c.lineTo(x + w + DX, y + DY + 8); c.lineTo(x + w, y + 8); c.fill();
    c.fillStyle = sk.plat; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w + DX, y + DY); c.lineTo(x + DX, y + DY); c.closePath(); c.fill(); c.strokeStyle = sk.accent; c.lineWidth = .5; c.stroke();
    c.fillStyle = sk.line; c.fillRect(x, y, w, 8); c.fillStyle = sk.accent; c.fillRect(x, y, w, 1.2);
    c.globalCompositeOperation = 'lighter'; glowDot(c, x + w / 2, y + 12, 10, sk.accent, .25 + (pl.y0 - pl.y) / 120); c.globalCompositeOperation = 'source-over';
  };
  LOOK.basalto = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, h = clamp((pl.heat || 0) / 1.7, 0, 1);
    c.fillStyle = mix(sk.plat, '#ff6c2f', h * .7); c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 3, y + 7); c.lineTo(x + w * .6, y + 10); c.lineTo(x + 4, y + 7); c.closePath(); c.fill();
    c.strokeStyle = mix('#ffe800', '#ff48b0', 1 - h); c.globalAlpha = .3 + h * .7; c.lineWidth = .7; c.beginPath(); c.moveTo(x + 4, y + 3); c.lineTo(x + w * .4, y + 6); c.lineTo(x + w * .7, y + 3); c.stroke(); c.globalAlpha = 1;
    if (h > .5 && Math.random() < h * .3) spawn(f.g, 1, x + Math.random() * w, y, { ang: -Math.PI / 2, spread: .6, v: 30, life: .5, s: 1.2, k: 'spark', cols: ['#ffe800', '#ff6c2f'] });
  };
  LOOK.medusa = (c, pl, f, sk) => {
    const x = pl.x + pl.w / 2, y = pl.y, w = pl.w / 2, sq = (pl.sq || 0); pl.sq = sq * .9; const t = f.t;
    c.save(); c.globalAlpha = .9; c.fillStyle = rgba(sk.accent, .55); c.beginPath(); c.moveTo(x - w, y + 3); c.quadraticCurveTo(x - w, y - 7 + sq * 3, x, y - 7 + sq * 3); c.quadraticCurveTo(x + w, y - 7 + sq * 3, x + w, y + 3); c.closePath(); c.fill();
    c.strokeStyle = sk.accent; c.lineWidth = .7; c.stroke();
    c.strokeStyle = rgba(sk.accent, .6); c.lineWidth = .5; for (let i = 0; i < 5; i++) { const lx = x - w * .7 + i * w * .35; c.beginPath(); c.moveTo(lx, y + 3); c.quadraticCurveTo(lx + Math.sin(t * 3 + i) * 3, y + 9, lx + Math.sin(t * 2 + i) * 2, y + 15); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - w * .3, y - 3, w * .25, 1.2, -.3, 0, TAU); c.fill(); c.restore();
  };
  LOOK.papelhielo = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, k = pl.cracks || 0;
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 3, y + 6); c.lineTo(x + 3, y + 6); c.closePath(); c.fill();
    c.fillStyle = sk.plat; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w, y); c.lineTo(x + w - 3, y + 6); c.lineTo(x + w / 2, y + 6); c.fill();
    c.strokeStyle = sk.line; c.lineWidth = .5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke();
    if (k) { c.strokeStyle = '#3a5a8a'; c.lineWidth = .5; c.beginPath(); for (let i = 0; i < k; i++) { const cx = x + w * (.3 + i * .22); c.moveTo(cx, y); c.lineTo(cx + 2, y + 3); c.lineTo(cx - 1, y + 6); } c.stroke(); }
  };
  LOOK.meteoro = (c, pl, f, sk) => {
    const u = pl.u ?? .5, a = clamp(Math.min((u - .02) / .06, (.94 - u) / .06), 0, 1), x = pl.x, y = pl.y, w = pl.w;
    c.save(); c.globalAlpha = a;
    c.strokeStyle = rgba(sk.accent, .35); c.lineWidth = .5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x - 2, y + 2 + i * 1.4); c.lineTo(x - 10 - i * 5, y + 1 + i * 1.6); c.stroke(); }
    c.fillStyle = sk.plat; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 4, y + 8); c.lineTo(x + w * .45, y + 11); c.lineTo(x + 3, y + 6); c.closePath(); c.fill(); c.strokeStyle = sk.accent; c.lineWidth = .6; c.stroke();
    c.fillStyle = sk.accent; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + w * (.25 + i * .25), y + 4 + (i % 2) * 2, .6, 0, TAU); c.fill(); }
    c.restore();
  };
  LOOK.tablon = (c, pl, f, sk) => {
    const sq = pl.sq || 0; pl.sq = sq * .88; const x = pl.x, y = pl.y + sq * 1.5, w = pl.w;
    c.fillStyle = sk.plat; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y + .6); c.lineTo(x + w - 1, y + 5); c.lineTo(x + 1, y + 4.6); c.fill();
    c.strokeStyle = sk.plat2; c.lineWidth = .5; c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + w - 3, y + 2.6); c.stroke();
    c.fillStyle = sk.plat; c.fillRect(x + 2, y + 4, 1.4, 10); c.fillRect(x + w - 3.4, y + 4.4, 1.4, 10);
    if (sq > .2) { c.fillStyle = '#c8202a'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.fillText('¡crac!', x + w / 2 - 8, y - 4); }
  };
  LOOK.tempano = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w;
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + w * .3, y - 1); c.lineTo(x + w, y + .5); c.lineTo(x + w - 2, y + 5); c.lineTo(x + 2, y + 5); c.closePath(); c.fill();
    c.fillStyle = '#bcd7ea'; c.beginPath(); c.moveTo(x + w * .3, y - 1); c.lineTo(x + w, y + .5); c.lineTo(x + w - 2, y + 5); c.lineTo(x + w * .45, y + 5); c.fill();
  };
  LOOK.burbuja = (c, pl, f) => {
    const x = pl.x + pl.w / 2, y = pl.y + 4, r = pl.w / 2, blink = pl.life < 1 && Math.sin(f.t * 28) > 0;
    c.save(); c.globalAlpha = blink ? .35 : .85; c.strokeStyle = '#ffffff'; c.lineWidth = .8; c.beginPath(); c.ellipse(x, y, r, 6, 0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,200,230,.18)'; c.fill(); c.beginPath(); c.ellipse(x - r * .4, y - 2.5, r * .3, 1.2, -.3, 0, TAU); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); c.restore();
  };
  LOOK.constel = (c, pl, f, sk) => {
    c.save(); c.strokeStyle = '#fff3c4'; c.shadowColor = sk.accent; c.shadowBlur = 5 * f.S; c.lineWidth = 1.1; c.setLineDash([3, 1.5]); c.lineDashOffset = -f.t * 8;
    c.beginPath(); c.moveTo(pl.x, pl.y); c.lineTo(pl.x2, pl.y2); c.stroke(); c.restore();
  };

  // ================= ENEMIGOS =================
  Object.assign(FOE, {
    grumo: { beh: 'grumo', w: 13, h: 10, v: 18 },
    erizo: { beh: 'erizo', w: 13, h: 9, v: 15, spiky: e => e.curl > .5 },
    salamandra: { beh: 'spit', w: 17, h: 7, v: 18, fiery: true },
    botete: { beh: 'puffer', w: 12, h: 10, rx: 30, spiky: e => e.puff > .5 },
    carambano: { beh: 'icicle', w: 8, h: 14, spiky: () => true },
    escorpion: { beh: 'strike', v: 16, w: 17, h: 8 },
    perro: { beh: 'hear', w: 17, h: 11, v: 20 },
  });
  BEH.grumo = (e, g, d, toP) => {
    const p = g.p; if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const sees = Math.abs(toP) < 85 && Math.abs(p.y - e.y) < 30;
    if (sees && !e.alert) { e.alert = true; e.alertT = 0; e.vy = -170; e.y -= 1; }
    if (!sees) e.alert = false;
    e.alertT = (e.alertT || 0) + d;
    if (e.alert) { e.dir = Math.sign(toP) || e.dir; if (e.alertT > .45) walkStep(e, d, 52); }
    else walkStep(e, d, e.v);
  };
  BEH.erizo = (e, g, d) => {
    e.cyc = (e.cyc || 0) + d; const want = (e.cyc % 3.4) > 2.2 ? 1 : 0; e.curl = (e.curl || 0) + (want - (e.curl || 0)) * Math.min(1, d * 8);
    if (e.curl > .5) return;
    const eco = (g.objs || []).find(o => o.k === 'echo');
    if (eco && Math.abs(eco.x - (e.x + e.dir * 9)) < 5 && Math.abs(eco.y - e.y) < 8) e.dir *= -1;
    walkStep(e, d, e.v);
  };
  BEH.spit = (e, g, d, toP, near) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.tt -= d;
    if (e.aim > 0) { e.aim -= d; if (e.aim <= 0) { g.objs.push({ k: 'fireball', origen: e, kind: e.proj || 'fuego', x: e.x + e.dir * 9, y: e.y - 5, vx: e.dir * 100, vy: -150, life: 3 }); e.tt = 2.4; } return; }
    if (near && Math.abs(toP) < 160 && e.tt <= 0) { e.dir = Math.sign(toP) || 1; e.aim = .55; return; }
    walkStep(e, d, e.v);
  };
  BEH.puffer = (e, g, d) => {
    const p = g.p; e.x = e.hx + Math.sin(e.t * .9) * e.rx; e.y = e.hy + Math.sin(e.t * 1.7) * 4; e.dir = Math.cos(e.t * .9) >= 0 ? 1 : -1;
    const close = near2(p.x, p.y - 7, e.x, e.y - 5, 46);
    e.puffPrev = e.puff || 0;
    e.puff = clamp((e.puff || 0) + (close ? d * 4 : -d * 1.2), 0, 1);
    e.w = 12 + e.puff * 10; e.h = 10 + e.puff * 8;
  };
  BEH.icicle = (e, g, d) => {
    const p = g.p;
    if (e.ic === 'regrow') { e.tt -= d; e.grow = clamp(1 - e.tt / 2.5, 0, 1); if (e.tt <= 0) { e.ic = null; e.y = e.hy; e.vy = 0; } return e.grow < 1 ? 'skip' : undefined; }
    if (e.ic === 'shake') { e.tt -= d; e.jit = (Math.random() - .5) * 1.4; if (e.tt <= 0) { e.ic = 'fall'; e.vy = 0; } return; }
    if (e.ic === 'fall') { e.vy += 900 * d; e.y += e.vy * d; if (SOLID(e.x, e.y) || e.y > VH + 20) { spawn(g, 12, e.x, e.y - 3, { v: 80, life: .5, s: 1.6, k: 'dust', cols: ['#ffffff', '#bcd7ea'] }); e.ic = 'regrow'; e.tt = 2.5; e.y = e.hy; e.grow = 0; } return; }
    e.jit = 0;
    if (Math.abs(p.x - e.x) < 22 && p.y > e.y) { e.ic = 'shake'; e.tt = .45; }
  };
  BEH.hear = (e, g, d) => {
    const p = g.p, x0 = e.hx - 90, x1 = e.hx + 90;
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const fl = (g.objs || []).find(o => o.k === 'bengala' && o.on && Math.abs(o.x - e.x) < 150 && Math.abs(o.y - e.y) < 60);
    const hearR = 18 + (g.noise || 0) * 170, hears = !g.hidden && Math.hypot(p.x - e.x, p.y - e.y) < hearR;
    if (fl) { e.mode = 'flare'; e.dir = Math.sign(fl.x - e.x) || e.dir; if (Math.abs(fl.x - e.x) > 10) walkStep(e, d, 70); return; }
    if (hears) e.mode = 'hunt', e.lost = 1.5; else if (e.mode === 'hunt') { e.lost -= d; if (e.lost <= 0) e.mode = null; }
    if (e.mode === 'hunt') { e.dir = Math.sign(p.x - e.x) || e.dir; if ((e.dir > 0 && e.x < x1) || (e.dir < 0 && e.x > x0)) walkStep(e, d, 105); return; }
    if (e.x < x0) e.dir = 1; if (e.x > x1) e.dir = -1; walkStep(e, d, e.v);
  };

  // ---------- dibujos de enemigos ----------
  Object.assign(FD, {
    grumo(c, e, t, s) {
      const k = Math.floor(t * 12) / 12, air = e.vy !== 0, sq = air ? .85 : 1 + Math.sin(k * 9) * .06;
      c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -5 * sq, 7 / sq, 5 * sq, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-2.5, -8 * sq, 2.6, 1.2, -.3, 0, TAU); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(1.5, -2, 5, 1.6, 0, 0, TAU); c.fill();
      for (const ex of [1, 4]) { c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, -6 * sq, 1.5, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(ex + .5, -6 * sq, .7, 0, TAU); c.fill(); }
      if (e.alert && e.alertT < .6) { c.fillStyle = s.accent; c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.fillText('!', -1.5, -14); }
    },
    erizo(c, e, t, s) {
      const k = e.curl || 0, a = Math.sin(e.anim * 10) * (1 - k);
      c.fillStyle = s.dark; c.beginPath(); for (let i = 0; i <= 12; i++) { const an = Math.PI + i / 12 * Math.PI * (1 + k), r = i % 2 ? 6 + k : 9 + k * 2; c.lineTo(Math.cos(an) * r, -4 - k * 1 + Math.sin(an) * r * (.8 + k * .2)); } c.closePath(); c.fill();
      c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -4, 6.5, 4.4 + k, 0, Math.PI, 0); c.fill();
      if (k < .5) { c.fillStyle = s.light; c.beginPath(); c.ellipse(6, -3, 3, 2.2, 0, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(8.6, -3.4, .6, 0, TAU); c.fill(); c.arc(6.6, -4.2, .5, 0, TAU); c.fill(); c.fillStyle = s.dark; c.fillRect(-4 + a, -1, 1.6, 1.4); c.fillRect(2 - a, -1, 1.6, 1.4); }
      c.globalCompositeOperation = 'lighter'; glowDot(c, -2, -9, 4, s.accent, .5); c.globalCompositeOperation = 'source-over';
    },
    salamandra(c, e, t, s) {
      const a = Math.sin(e.anim * 12), out = e.st === 'sleep';
      c.fillStyle = out ? '#5a4a4a' : s.main; c.beginPath(); c.moveTo(-16, -2 + a); c.quadraticCurveTo(-9, -5, -5, -4); c.lineTo(6, -5); c.quadraticCurveTo(11, -5, 11, -2.5); c.quadraticCurveTo(8, 0, 5, -1); c.lineTo(-6, -1); c.closePath(); c.fill();
      c.fillStyle = s.dark; for (let i = -4; i < 6; i += 3) { c.beginPath(); c.arc(i, -3.4, .8, 0, TAU); c.fill(); }
      c.fillStyle = out ? '#5a4a4a' : s.main; for (const [lx, ph] of [[-4, 0], [4, 1]]) { c.fillRect(lx + (ph ? a : -a), -1.4, 1.4, 1.6); }
      c.fillStyle = '#ffe800'; c.beginPath(); c.arc(8.2, -3.6, .8, 0, TAU); c.fill();
      if (!out) { const fl = 2 + Math.sin(t * 20) * .8; for (let i = -6; i < 6; i += 4) { c.fillStyle = s.accent; c.beginPath(); c.moveTo(i - 1.6, -4.8); c.quadraticCurveTo(i, -6 - fl * 1.6, i + 1.6, -4.8); c.fill(); } if (e.aim > 0) { c.globalCompositeOperation = 'lighter'; glowDot(c, 12, -3, 5, '#ffe800', .7); c.globalCompositeOperation = 'source-over'; } }
      else { c.fillStyle = 'rgba(200,200,220,.6)'; c.beginPath(); c.arc(0, -9 - (t * 6 % 4), 1.4, 0, TAU); c.fill(); }
    },
    botete(c, e, t, s) {
      const k = e.puff || 0, r = 5 + k * 5;
      c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -5 - k * 3, r * 1.15, r, 0, 0, TAU); c.fill();
      if (k > .2) { c.strokeStyle = s.dark; c.lineWidth = .6; c.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, x = Math.cos(a) * r * 1.15, y = -5 - k * 3 + Math.sin(a) * r; c.moveTo(x, y); c.lineTo(x * (1 + .35 * k), -5 - k * 3 + (y + 5 + k * 3) * (1 + .35 * k)); } c.stroke(); }
      c.fillStyle = s.light; c.beginPath(); c.ellipse(0, -2 - k * 2, r * .8, r * .4, 0, 0, Math.PI); c.fill();
      c.fillStyle = s.main; c.beginPath(); c.moveTo(-r, -5 - k * 3); c.lineTo(-r - 4, -8 - k * 3 + Math.sin(t * 10)); c.lineTo(-r - 4, -2 - k * 3 - Math.sin(t * 10)); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(r * .5, -7 - k * 3, 1.6, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(r * .5 + .4, -7 - k * 3, .7, 0, TAU); c.fill();
      c.strokeStyle = s.dark; c.lineWidth = .5; c.beginPath(); c.arc(r * .85, -4 - k * 3, .9, 0, TAU); c.stroke();
    },
    carambano(c, e, t, s) {
      const gr = e.ic === 'regrow' ? e.grow : 1, j = e.jit || 0;
      c.save(); c.translate(j, 0); c.scale(1, gr);
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-5, -15); c.lineTo(5, -15); c.lineTo(0, 0); c.closePath(); c.fill();
      c.fillStyle = s.light; c.beginPath(); c.moveTo(0, -15); c.lineTo(5, -15); c.lineTo(0, 0); c.fill();
      c.fillStyle = '#2a3a5a'; c.fillRect(-2.6, -11, 1.2, 1.4); c.fillRect(1, -11, 1.2, 1.4);
      c.strokeStyle = '#2a3a5a'; c.lineWidth = .5; c.beginPath(); c.moveTo(-3, -12.6); c.lineTo(-1, -12); c.moveTo(3, -12.6); c.lineTo(1, -12); c.stroke();
      c.restore();
    },
    escorpion(c, e, t, s) {
      const L2 = e.st === 'lunge' ? 1 : 0, a = Math.sin(e.anim * 10);
      c.strokeStyle = s.accent; c.fillStyle = s.main; c.lineWidth = .7;
      c.beginPath(); c.ellipse(0, -4, 7, 3.4, 0, 0, TAU); c.fill(); c.stroke();
      let px = -6, py = -4; for (let i = 0; i < 4; i++) { const nx = px - 2.4 + i * .6, ny = py - 2.6 - L2; c.beginPath(); c.arc(nx, ny, 1.6, 0, TAU); c.fill(); c.stroke(); px = nx; py = ny; }
      c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 4 + L2 * 4, py - 4, px + 6 + L2 * 6, py + 1 + L2 * 2); c.stroke();
      for (const d of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-3 + k * 3, -2); c.lineTo(-4 + k * 3 + a * d * .6, 0); c.stroke(); }
      c.beginPath(); c.moveTo(6, -4); c.lineTo(10 + L2 * 3, -6); c.lineTo(12 + L2 * 3, -4.5); c.stroke();
      c.fillStyle = '#fff3c4'; for (const [sx, sy] of [[0, -4], [-6, -4], [px, py], [10 + L2 * 3, -6]]) { c.beginPath(); c.arc(sx, sy, .9, 0, TAU); c.fill(); }
    },
    perro(c, e, t, s) {
      const run = e.mode === 'hunt', a = Math.sin(e.anim * (run ? 22 : 9));
      c.fillStyle = s.main;
      for (const [lx, ph] of [[-6, 0], [-3, 1], [4, 0], [7, 1]]) { c.save(); c.translate(lx, -4); c.rotate((ph ? a : -a) * .5); c.fillRect(-.7, 0, 1.4, 4.4); c.restore(); }
      c.beginPath(); c.ellipse(0, -6, 8.5, 3.6, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-6, -8); for (let i = 0; i < 7; i++) c.lineTo(-6 + i * 2 + 1, -12 - (i % 2) * 2.5 - (run ? 1 : 0)), c.lineTo(-6 + i * 2 + 2, -8.5); c.fill();
      c.beginPath(); c.moveTo(6, -9); c.lineTo(12, -8); c.lineTo(13, -6); c.lineTo(7, -4.5); c.fill();
      c.beginPath(); c.moveTo(-8, -6); c.lineTo(-12, -9 + a); c.lineTo(-9, -5); c.fill();
      c.globalCompositeOperation = 'lighter'; glowDot(c, 10, -7.6, 5, '#ff2020', e.mode === 'hunt' ? .9 : .45); c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#ff3030'; c.fillRect(9.4, -8.2, 1.4, 1);
      if (e.mode === 'flare') { c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.fillText('?', -1, -16); }
    },
  });

  // ================= OBJETOS DEL ESCENARIO =================
  // barro: piezas de plastilina que Fresita estira (puente en x, pilar en y)
  function clayRect(s) {
    if (s.axis === 'x') { const l = s.len; s.x = s.dir > 0 ? s.bx : s.bx - l; s.w = l; s.y = s.by; s.h = s.thick; }
    else { s.w = s.pw; s.x = s.bx; s.h = s.len; s.y = s.base - s.len; }
  }
  OBJ.clay = {
    make(g, en) {
      const axis = en.axis || 'x', dir = en.dir || 1, y = tl(en.y); let bx = tx(en.x);
      if (axis === 'x' && !solidAt(bx + dir * .5, y + 2) && !solidAt(bx - dir * .5, y + 2)) {
        // Una pieza volteada puede dejar el anclaje una loseta dentro del hueco.
        // Buscar únicamente el borde de tierra más cercano detrás del puente.
        for (let distancia = 1; distancia <= T * 2; distancia++) {
          const x = bx - dir * distancia;
          if (solidAt(x, y + 2)) { bx = borde(x, y + 2, dir > 0 ? 'der' : 'izq'); break; }
        }
      }
      const s = { k: 'clay', axis, dir, bx, by: y, base: y, pw: tl(en.w || 2), thick: 10, len: tl(en.min || .6), min: tl(en.min || .6), max: tl(en.max || 8), on: true, glow: 0 };
      s.tgt = s.len; clayRect(s); g.solids.push(s); g.objs.push({ k: 'clayctl', s });
    },
    drawSolid(c, s, f, sk) {
      const x = s.x, y = s.y, w = s.w, h = s.h, wob = s.wob || 0;
      c.save();
      if (s.glow > .05) { c.shadowColor = '#fff3c4'; c.shadowBlur = 6 * f.S * s.glow; }
      const g = s.axis === 'x' ? c.createLinearGradient(0, y, 0, y + h) : c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, shade(sk.accent, .3)); g.addColorStop(.5, sk.accent); g.addColorStop(1, shade(sk.accent, -.35));
      c.fillStyle = g; c.beginPath(); roundRect(c, x, y + Math.sin(f.t * 18) * wob, w, h, Math.min(4, w / 2, h / 2)); c.fill(); c.restore();
      c.strokeStyle = 'rgba(80,30,10,.18)'; c.lineWidth = .4; for (let i = 0; i < (s.axis === 'x' ? w : h) / 9; i++) { c.beginPath(); if (s.axis === 'x') c.ellipse(x + 4 + i * 9, y + h / 2, 2.2, 1.4, .4, .3, TAU - .6); else c.ellipse(x + w / 2, y + 4 + i * 9, 1.4, 2.2, .4, .3, TAU - .6); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.35)'; if (s.axis === 'x') c.fillRect(x + 2, y + 1.5, w - 4, 1); else c.fillRect(x + 1.5, y + 2, 1, h - 4);
      // flechas que dicen hacia dónde se estira
      if (s.glow > .05 || (f.t % 2 < 1 && s.len <= s.min + 1)) { c.globalAlpha = .6; c.fillStyle = '#fff'; const ax = s.axis === 'x' ? (s.dir > 0 ? x + w + 4 : x - 4) : x + w / 2, ay = s.axis === 'x' ? y + h / 2 : y - 4; c.beginPath(); if (s.axis === 'x') { c.moveTo(ax, ay - 2.5); c.lineTo(ax + s.dir * 3, ay); c.lineTo(ax, ay + 2.5); } else { c.moveTo(ax - 2.5, ay); c.lineTo(ax, ay - 3); c.lineTo(ax + 2.5, ay); } c.fill(); c.globalAlpha = 1; }
    },
  };
  OBJ.clayctl = {
    step(o, g, dt) {
      const s = o.s, p = g.p, held = g.knead === s;
      s.glow += ((held ? 1 : 0) - s.glow) * Math.min(1, dt * 8);
      if (held) s.tgt = clamp(s.axis === 'x' ? (g.fre.x - s.bx) * s.dir : s.base - g.fre.y, s.min, s.max);
      const old = { x: s.x, y: s.y, w: s.w, h: s.h, len: s.len };
      const nl = s.len + clamp(s.tgt - s.len, -170 * dt, 170 * dt); if (Math.abs(nl - s.len) < .01) { s.wob = Math.max(0, (s.wob || 0) - dt * 2); return; }
      s.len = nl; clayRect(s); s.wob = Math.min(.6, (s.wob || 0) + dt * 3);
      const onTop = p.vy >= 0 && Math.abs(p.y - old.y) < 3 && p.x + p.w / 2 > old.x && p.x - p.w / 2 < old.x + old.w;
      // la plastilina no atraviesa el escenario: se detiene al tocar tierra
      let choca = false; for (let yy = s.y + .5; yy < s.y + s.h && !choca; yy += Math.min(4, s.h - 1)) for (let xx = s.x + .5; xx < s.x + s.w; xx += Math.min(4, s.w - 1)) if (solidAt(xx, yy)) { choca = true; break; }
      if (choca) { s.len = old.len; s.tgt = old.len; clayRect(s); s.wob = 0; return; }
      if (!freeOf(g, s.x, s.y, s.w, s.h)) {
        if (s.axis === 'y' && onTop && !SOLID(p.x, s.y - p.h - 1)) p.y = s.y;   // el pilar sube a Itzel
        else { s.len = old.len; s.tgt = old.len; clayRect(s); }
      } else if (s.axis === 'y' && onTop) p.y = s.y;
      if (Math.random() < dt * 20) spawn(g, 1, s.axis === 'x' ? (s.dir > 0 ? s.x + s.w : s.x) : s.x + s.w / 2, s.axis === 'x' ? s.y + 4 : s.y, { v: 30, life: .4, s: 1.4, k: 'dust', cols: [g.def && g.def.skin ? g.def.skin.accent : '#e3a273'] });
    },
  };
  // jardín de ecos: círculos que abren puentes mientras alguien (Itzel o su eco) está encima
  OBJ.plate = {
    make(g, en) { g.objs.push({ k: 'plate', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, grp: en.grp, n: en.n || ['I', 'II', 'III', 'IV'][en.grp] || '', on: false, a: 0 }); },
    step(o, g, dt) {
      const p = g.p, e = g.objs.find(q => q.k === 'echo');
      const by = (q) => q && Math.abs(q.x - o.x) < 10 && Math.abs(q.y - o.y) < 3;
      o.on = (by(p) && p.on) || by(e);
      o.a += ((o.on ? 1 : 0) - o.a) * Math.min(1, dt * 6);
      for (const s of g.solids) if (s.k === 'ecobridge' && s.grp === o.grp) { if (o.on && !s.on && !freeOf(g, s.x, s.y, s.w, s.h)) continue; s.on = o.on; }
    },
    draw(c, o, f, sk) {
      const x = o.x + 4, y = o.y - 3;
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 14, sk.accent, .2 + o.a * .5); c.restore();
      c.strokeStyle = o.on ? '#ffffff' : sk.accent; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, 9, 3.4, 0, 0, TAU); c.stroke();
      c.lineWidth = .5; c.beginPath(); c.ellipse(x, y, 6, 2.2, 0, 0, TAU); c.stroke();
      c.fillStyle = o.on ? '#ffffff' : sk.accent; c.font = 'bold 5px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillText(o.n, x, y - 5); c.textAlign = 'left';
    },
  };
  OBJ.ecobridge = {
    drawSolid(c, s, f, sk) {
      s.a = (s.a || 0) + ((s.on ? 1 : 0) - (s.a || 0)) * .15;
      const DX = 12, DY = -8, col = ['#73efd0', '#ffc980', '#cba6ff', '#9affee'][s.grp % 4];
      if (s.a < .05) { c.strokeStyle = rgba(col, .35); c.setLineDash([2, 2]); c.lineWidth = .7; c.strokeRect(s.x + .5, s.y + .5, s.w - 1, 5); c.setLineDash([]); return; }
      c.save(); c.globalAlpha = s.a;
      c.fillStyle = col; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + s.w, s.y); c.lineTo(s.x + s.w + DX, s.y + DY); c.lineTo(s.x + DX, s.y + DY); c.closePath(); c.fill();
      c.fillStyle = shade(col, -.45); c.fillRect(s.x, s.y, s.w, s.h);
      c.strokeStyle = '#c7ffed'; c.lineWidth = .5; for (let x = s.x; x < s.x + s.w; x += T) c.strokeRect(x, s.y, T, s.h);
      c.restore();
    },
  };
  OBJ.echo = {
    step(o) { o.t = (o.t || 0) + 1 / 60; },
    draw(c, o, f) {
      c.save(); c.globalAlpha = .5 + Math.sin(f.t * 4) * .1;
      c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 8, 18, '#9affee', .35); c.globalCompositeOperation = 'source-over';
      const ghost = { x: o.x, y: o.y, w: 10, h: 14, vx: 0, vy: 0, on: true, face: o.face, run: 0, sq: 0, vis: true, inv: 0 };
      c.filter = 'saturate(.2) brightness(1.4)'; if (f.st.player) f.st.player(c, ghost, f); c.filter = 'none';
      c.restore();
      c.strokeStyle = 'rgba(154,255,238,.6)'; c.lineWidth = .6; const k = wrap(f.t, 1.4) / 1.4; c.globalAlpha = 1 - k; c.beginPath(); c.ellipse(o.x, o.y, 6 + k * 14, (6 + k * 14) * .35, 0, 0, TAU); c.stroke(); c.globalAlpha = 1;
    },
  };
  // fuego: cama de brasas que no se puede tocar
  OBJ.brasas = {
    make(g, en) { g.objs.push({ k: 'brasas', x0: tx(en.x), x1: tx(en.x2 + 1), y: tl(en.y) }); },
    env(o, g, e) { const p = g.p; if (p.x > o.x0 && p.x < o.x1 && p.y > o.y + 3) { e.deadly = true; e.deadlyCols = ['#ff6c2f', '#ffe800', '#ff48b0']; } },
    draw(c, o, f, sk) {
      const t = f.t, w = o.x1 - o.x0;
      const g = c.createLinearGradient(0, o.y, 0, VH); g.addColorStop(0, '#ff6c2f'); g.addColorStop(.25, '#c8203a'); g.addColorStop(1, '#3a0a1a'); c.fillStyle = g; c.fillRect(o.x0, o.y + 2, w, VH - o.y);
      c.fillStyle = '#2a0a12'; for (let x = o.x0; x < o.x1; x += 7) { const h = 2 + R(x, 3) * 3; c.beginPath(); c.ellipse(x + 3.5, o.y + 5 + h, 3.6, h, 0, 0, TAU); c.fill(); }
      c.strokeStyle = '#ffe800'; c.lineWidth = .6; c.globalAlpha = .6 + Math.sin(t * 6) * .2; c.beginPath(); for (let x = o.x0; x < o.x1; x += 7) { c.moveTo(x + 1, o.y + 6); c.lineTo(x + 4, o.y + 8); c.lineTo(x + 6, o.y + 6.5); } c.stroke(); c.globalAlpha = 1;
      const fr = Math.floor(t * 9);
      for (let x = o.x0 + 3; x < o.x1 - 2; x += 9) { const h = 7 + R(x, fr % 3) * 9; c.fillStyle = (x / 9 | 0) % 2 ? sk.accent : (sk.foe ? sk.foe.accent : '#ff48b0'); c.beginPath(); c.moveTo(x - 3.5, o.y + 4); c.quadraticCurveTo(x - 1 + Math.sin(t * 7 + x) * 2, o.y - h * .6, x + Math.sin(t * 5 + x), o.y - h); c.quadraticCurveTo(x + 2, o.y - h * .4, x + 3.5, o.y + 4); c.fill(); }
      if (Math.random() < w / 900) spawn(f.g, 1, o.x0 + Math.random() * w, o.y, { ang: -Math.PI / 2, spread: .5, v: 40, life: 1, s: 1, k: 'spark', cols: ['#ffe800', '#ff6c2f'], g: -20 });
    },
  };
  const R = (i, s) => hash1(i, s);
  OBJ.basalto = {
    drawSolid(c, s, f) {
      const k = clamp(s.life / 7, 0, 1);
      c.fillStyle = '#2a2a3a'; c.beginPath(); c.moveTo(s.x, s.y + 2); c.lineTo(s.x + 4, s.y); c.lineTo(s.x + s.w - 5, s.y + .5); c.lineTo(s.x + s.w, s.y + 3); c.lineTo(s.x + s.w, s.y + s.h); c.lineTo(s.x, s.y + s.h); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(160,200,255,.6)'; c.lineWidth = .5; c.beginPath(); c.moveTo(s.x + 3, s.y + 2); c.lineTo(s.x + s.w - 4, s.y + 2); c.stroke();
      if (k < .3) { c.strokeStyle = '#ff6c2f'; c.globalAlpha = 1 - k / .3; c.beginPath(); c.moveTo(s.x + 5, s.y + 4); c.lineTo(s.x + s.w / 2, s.y + 7); c.lineTo(s.x + s.w - 6, s.y + 4); c.stroke(); c.globalAlpha = 1; }
      if (Math.random() < .08) spawn(f.g, 1, s.x + Math.random() * s.w, s.y, { ang: -Math.PI / 2, spread: .4, v: 15, life: 1, s: 2, k: 'dust', cols: ['rgba(220,230,255,.6)'], g: -15 });
    },
  };
  OBJ.geiser = {
    make(g, en) { g.objs.push({ k: 'geiser', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, t: en.off || 0, plug: 0 }); },
    step(o, g, dt) {
      o.t += dt; o.plug = Math.max(0, o.plug - dt); const ph = o.t % 3.2; o.warn = ph > 1.3 && ph < 1.9 && !o.plug; o.fire = ph >= 1.9 && ph < 2.9 && !o.plug;
      const p = g.p; if (o.fire && Math.abs(p.x - o.x) < 8 && p.y > o.y - 70 && p.y - p.h < o.y) MEC.hurt(g, p.x < o.x ? -1 : 1);
    },
    draw(c, o, f) {
      c.fillStyle = '#2a1a22'; c.beginPath(); c.ellipse(o.x, o.y, 7, 2.4, 0, 0, TAU); c.fill();
      if (o.plug) { c.fillStyle = '#4a4a5a'; c.beginPath(); c.ellipse(o.x, o.y - 1, 6, 2.6, 0, Math.PI, 0); c.fill(); return; }
      if (o.warn) { for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(255,232,0,${.4 + Math.sin(f.t * 30) * .3})`; c.beginPath(); c.arc(o.x + (i - 1) * 3, o.y - 2 - (f.t * 20 + i * 3) % 6, .8, 0, TAU); c.fill(); } }
      if (o.fire) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const w = 7 - k * 2, col = ['#ff48b0', '#ff6c2f', '#ffe800'][k]; c.fillStyle = col; c.beginPath(); c.moveTo(o.x - w, o.y); for (let y = 0; y <= 70; y += 7) c.lineTo(o.x - w * (1 - y / 90) + Math.sin(f.t * 20 + y) * 1.5, o.y - y); for (let y = 70; y >= 0; y -= 7) c.lineTo(o.x + w * (1 - y / 90) + Math.sin(f.t * 22 + y) * 1.5, o.y - y); c.fill(); } c.restore(); }
    },
  };
  OBJ.fireball = {
    step(o, g, dt) {
      o.vy += 420 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
      const fire = !o.kind || o.kind === 'fuego', cols = fire ? ['#ffe800', '#ff6c2f'] : o.kind === 'hueso' ? ['#efe6d0', '#b8ac94'] : ['#8a5a2a', '#c8a060'];
      if (SOLID(o.x, o.y) || o.life <= 0 || o.y > VH + 20) { o.dead = true; spawn(g, 8, o.x, o.y, { v: 60, life: .4, s: 1.5, k: fire ? 'spark' : 'dust', cols }); return; }
      const p = g.p; if (!MEC.protegePisoton(g, o) && Math.abs(p.x - o.x) < 7 && p.y > o.y - 3 && p.y - p.h < o.y + 3) { o.dead = true; MEC.hurt(g, o.vx > 0 ? 1 : -1); }
      if (fire && Math.random() < .5) spawn(g, 1, o.x, o.y, { v: 8, life: .3, s: 1.4, k: 'spark', cols: ['#ff6c2f', '#ff48b0'] });
      o.rot = (o.rot || 0) + dt * 12;
    },
    draw(c, o, f) {
      if (o.kind === 'hueso') { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.fillStyle = '#efe6d0'; c.fillRect(-3.5, -.8, 7, 1.6); for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 3.6, -1, 1.2, 0, TAU); c.arc(d * 3.6, 1, 1.2, 0, TAU); c.fill(); } c.restore(); return; }
      if (o.kind === 'coco') { c.fillStyle = '#5a3a1a'; c.beginPath(); c.arc(o.x, o.y, 3, 0, TAU); c.fill(); c.fillStyle = '#8a5a2a'; c.beginPath(); c.arc(o.x - .8, o.y - .8, 1.6, 0, TAU); c.fill(); c.fillStyle = '#2a1a0a'; c.fillRect(o.x + .6, o.y - .4, .8, .8); return; }
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, 8, '#ff6c2f', .8); c.restore(); c.fillStyle = '#ffe800'; c.beginPath(); c.arc(o.x, o.y, 2.2, 0, TAU); c.fill();
    },
  };
  // chorro de agua (efecto del poder)
  OBJ.chorro = {
    step(o, g, dt) { o.life -= dt; if (o.life <= 0) o.dead = true; },
    draw(c, o) { const k = 1 - o.life / .35; c.strokeStyle = 'rgba(160,220,255,.9)'; c.lineWidth = 2 * (1 - k * .6); c.lineCap = 'round'; c.beginPath(); c.moveTo(o.x0, o.y0); c.quadraticCurveTo((o.x0 + o.x1) / 2, Math.min(o.y0, o.y1) - 30, o.x1, o.y1); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = .6; c.stroke(); },
  };
  // agua: zona donde Itzel nada
  // el aire se acaba bajo el agua: se recupera en la superficie, en los respiraderos o en las burbujas de Fresita
  OBJ.water = {
    front: true,
    make(g, en) { g.objs.push({ k: 'water', x0: tx(en.x), x1: tx(en.x2 + 1), y0: tl(en.y) }); g.air = 1; },
    env(o, g, e) { const p = g.p; if (p.x > o.x0 && p.x < o.x1 && p.y - 5 > o.y0) e.swim = true; },
    step(o, g, dt) {
      const p = g.p, under = p.x > o.x0 && p.x < o.x1 && p.y - p.h > o.y0 + 2;
      let refill = !under;
      for (const pl of g.plats) if (pl.k === 'airbub' && Math.abs(p.x - (pl.x + pl.w / 2)) < pl.w / 2 + 6 && Math.abs(p.y - 6 - pl.y) < 16) refill = true;
      for (const v of g.objs) if (v.k === 'respiro' && Math.abs(p.x - v.x) < 12 && p.y > v.y - 90) refill = true;
      g.air = clamp((g.air ?? 1) + (refill ? dt * .8 : -dt / 13), 0, 1);
      if (g.air <= 0) { MEC.hurt(g, p.face > 0 ? -1 : 1); g.air = .45; }
    },
    draw(c, o, f) {
      const g = f.g, p = g.p, a = g.air ?? 1; if (a > .98) return;
      const n = 6, x0 = p.x - n * 2.4, y = p.y - 26;
      for (let i = 0; i < n; i++) { const full = a * n > i + .5, low = a < .3 && Math.sin(f.t * 16) > 0; c.strokeStyle = low ? '#ff8080' : '#ffffff'; c.lineWidth = .6; c.beginPath(); c.arc(x0 + i * 4.8, y, 1.7, 0, TAU); c.stroke(); if (full) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); } }
    },
  };
  OBJ.respiro = {
    make(g, en) { g.objs.push({ k: 'respiro', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T }); },
    draw(c, o, f) {
      c.fillStyle = '#eef5fb'; c.beginPath(); c.moveTo(o.x - 6, o.y); c.quadraticCurveTo(o.x - 4, o.y - 7, o.x - 1.5, o.y - 8); c.lineTo(o.x + 1.5, o.y - 8); c.quadraticCurveTo(o.x + 4, o.y - 7, o.x + 6, o.y); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .5;
      for (let i = 0; i < 8; i++) { const k = wrap(f.t * .5 + i / 8, 1), y = o.y - 9 - k * 90; c.globalAlpha = 1 - k; c.beginPath(); c.arc(o.x + Math.sin(f.t * 3 + i) * 2.5, y, .8 + (i % 3) * .5, 0, TAU); c.stroke(); }
      c.globalAlpha = 1;
    },
  };
  OBJ.corriente = {
    make(g, en) { g.objs.push({ k: 'corriente', x0: tx(en.x), x1: tx(en.x2 + 1), y0: tl(en.y), y1: tl(en.y2 + 1), v: en.v || 50 }); },
    env(o, g, e) { const p = g.p; if (p.x > o.x0 && p.x < o.x1 && p.y > o.y0 && p.y - p.h < o.y1) e.push = (e.push || 0) + o.v; },
    draw(c, o, f) {
      c.strokeStyle = 'rgba(238,245,251,.35)'; c.lineWidth = .6; const dir = Math.sign(o.v), len = o.x1 - o.x0;
      for (let i = 0; i < 9; i++) { const y = o.y0 + 4 + R(i, 7) * (o.y1 - o.y0 - 8), u = wrap(f.t * Math.abs(o.v) * .9 + R(i, 8) * len, len), x = dir > 0 ? o.x0 + u : o.x1 - u; c.beginPath(); c.moveTo(x, y); c.lineTo(x - dir * 10, y + Math.sin(f.t * 3 + i) * 1.2); c.stroke(); }
    },
  };
  // hielo: mar helado (tocarlo te regresa al último lugar seguro)
  OBJ.mar = {
    make(g, en) { g.objs.push({ k: 'mar', x0: tx(en.x), x1: tx(en.x2 + 1), y: tl(en.y) }); },
    env(o, g, e) { const p = g.p; if (p.x > o.x0 && p.x < o.x1 && p.y > o.y + 4) { e.deadly = true; e.deadlyCols = ['#ffffff', '#bcd7ea', '#8fb8d6']; } },
    draw(c, o, f) {
      const w = o.x1 - o.x0; c.fillStyle = '#8fb8d6'; c.fillRect(o.x0, o.y + 3, w, VH - o.y);
      for (let x = o.x0, k = 0; x < o.x1; x += 8, k++) { const yy = o.y + 2 + Math.sin(f.t * 1.5 + k) * 1.2; c.fillStyle = k % 2 ? '#bcd7ea' : '#a3c6e0'; c.beginPath(); c.moveTo(x, yy + 3); c.lineTo(x + 4, yy); c.lineTo(x + 8, yy + 3); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = o.x0 + 6; x < o.x1; x += 23) c.fillRect(x + Math.sin(f.t + x) * 2, o.y + 9, 6, .7);
    },
  };
  // cielo: estrellas ancla para tender constelaciones
  OBJ.estrella = {
    make(g, en) { g.objs.push({ k: 'estrella', x: tx(en.x) + 8, y: tl(en.y) + 8, i: g.objs.filter(o => o.k === 'estrella').length }); },
    draw(c, o, f, sk) {
      const sel = f.g.selStar === o, tw = .8 + Math.sin(f.t * 3 + o.i) * .2;
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, sel ? 18 : 11, '#fff3c4', (sel ? .7 : .35) * tw); c.restore();
      c.fillStyle = sel ? '#ffffff' : '#fff3c4'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + f.t * .3, r = i % 4 === 0 ? 5 * tw : i % 2 ? 1 : 2; c.lineTo(o.x + Math.cos(a) * r, o.y + Math.sin(a) * r); } c.closePath(); c.fill();
      c.strokeStyle = rgba(sk.accent || '#e2c06e', .5); c.lineWidth = .4; c.beginPath(); c.arc(o.x, o.y, 8, 0, TAU); c.stroke();
    },
  };
  // hollín: escondites (agáchate detrás) y el ruido que haces
  OBJ.escondite = {
    front: true,
    make(g, en) { g.objs.push({ k: 'escondite', x0: tx(en.x), x1: tx(en.x2 + 1), y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, kind: en.kind || 'arbusto', s: en.x }); },
    draw(c, o, f, sk) {
      const p = f.g.p, w = o.x1 - o.x0, hidden = f.g.hidden && p.x > o.x0 && p.x < o.x1;
      c.fillStyle = sk.plat; c.beginPath();
      if (o.kind === 'auto') { c.moveTo(o.x0, o.y); c.lineTo(o.x0 + 2, o.y - 9); c.lineTo(o.x0 + w * .3, o.y - 10); c.lineTo(o.x0 + w * .42, o.y - 17); c.lineTo(o.x0 + w * .78, o.y - 17); c.lineTo(o.x0 + w * .88, o.y - 10); c.lineTo(o.x1, o.y - 8); c.lineTo(o.x1, o.y); c.closePath(); }
      else for (let i = 0; i < w / 6; i++) { const cx = o.x0 + 3 + i * 6, r = 6 + R(o.s * 9 + i, 2) * 4; c.moveTo(cx + r, o.y); c.arc(cx, o.y - r * .6, r, 0, TAU); }
      c.fill();
      if (o.kind === 'auto') { c.fillStyle = rgba(sk.accent, .25); c.fillRect(o.x0 + w * .46, o.y - 15, w * .14, 5); c.fillRect(o.x0 + w * .63, o.y - 15, w * .12, 5); }
      if (hidden) { c.fillStyle = 'rgba(255,255,255,.5)'; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('oculta', (o.x0 + o.x1) / 2, o.y - 22); c.textAlign = 'left'; }
    },
    step(o, g) { const p = g.p, down = typeof KEYS !== 'undefined' && (KEYS.has('ArrowDown') || KEYS.has('KeyS')); if (p.x > o.x0 + 2 && p.x < o.x1 - 2 && p.on && (down || g.crouchBot)) g.hideFrame = true; },
  };
  OBJ.ruido = {
    front: true,
    draw(c, o, f) {
      const g = f.g, p = g.p, n = g.noise || 0; if (n < .05 && !g.hidden) return;
      const x = p.x - 8, y = p.y - 27;
      c.fillStyle = 'rgba(10,10,12,.7)'; c.fillRect(x - .5, y - .5, 17, 3);
      c.fillStyle = n > .6 ? '#ff3030' : n > .3 ? '#ff9a40' : '#d8d2c8'; c.fillRect(x, y, 16 * n, 2);
      c.fillStyle = '#d8d2c8'; c.font = 'bold 4px "Alegreya Sans", sans-serif'; c.fillText(g.hidden ? 'oculta' : 'ruido', x, y - 1.5);
    },
    make(g) { g.objs.push({ k: 'ruido', was: true }); g.noise = 0; },
    step(o, g, dt) {
      const p = g.p; g.hidden = !!g.hideFrame; g.hideFrame = false;
      let n = g.noise || 0;
      if (p.on && Math.abs(p.vx) > 90) n += dt * .32; else if (p.on && Math.abs(p.vx) < 20) n -= dt * (g.hidden ? .9 : .45); else n -= dt * .15;
      if (p.on && !o.was) n += .22; o.was = p.on;
      g.noise = clamp(n, 0, 1); p.crouch = g.hidden; if (g.hidden) p.sq = Math.max(p.sq, .32);
    },
  };
  OBJ.bengala = {
    step(o, g, dt) { if (!o.on) { o.vy += 500 * dt; o.y += o.vy * dt; if (SOLID(o.x, o.y)) { o.y = Math.floor(o.y / T) * T; o.on = true; } if (o.y > VH + 20) o.dead = true; } else { o.life -= dt; if (o.life <= 0) o.dead = true; if (Math.random() < .5) spawn(g, 1, o.x, o.y - 3, { ang: -Math.PI / 2, spread: 1, v: 30, life: .5, s: 1.2, k: 'spark', cols: ['#ff4040', '#ffd0a0'], g: 40 }); } },
    draw(c, o, f) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 3, o.on ? 40 + Math.sin(f.t * 30) * 4 : 10, '#ff3030', .45); c.restore(); c.fillStyle = '#c8202a'; c.fillRect(o.x - 1, o.y - 6, 2, 6); c.fillStyle = '#ffd0a0'; c.beginPath(); c.arc(o.x, o.y - 6.5, 1.4, 0, TAU); c.fill(); },
  };

  // ================= PODERES DE FRESITA =================
  Object.assign(POW, {
    moldear: { name: 'Moldear', help: 'Mantén clic sobre la plastilina y arrastra: el puente se estira y el pilar sube.', cd: .05, drag: true,
      click(g, x, y, c) {
        if (c.up) { const had = !!g.knead; g.knead = null; return had; }
        let best = null, bd = 30; for (const s of g.solids) if (s.k === 'clay') { const d = Math.hypot(clamp(x, s.x, s.x + s.w) - x, clamp(y, s.y, s.y + s.h) - y); if (d < bd) { bd = d; best = s; } }
        if (!best) return false; g.knead = best; return true;
      } },
    eco: { name: 'Eco', help: 'Clic: deja un eco de Itzel donde está parada; sostiene los círculos aunque ella se vaya.', cd: .4,
      click(g) { const p = g.p; if (!p.on || !solidAt(p.x, p.y + 2)) return false; g.objs = g.objs.filter(o => o.k !== 'echo'); g.objs.push({ k: 'echo', x: p.x, y: p.y, face: p.face, t: 0 }); ring(g, p.x, p.y - 7, '#9affee', 24, .5); return true; } },
    agua: { name: 'Chorro de agua', help: 'Clic: Fresita escupe agua. Enfría las brasas en piedra, tapa géiseres y apaga salamandras.', cd: .45,
      click(g, x, y) {
        g.objs.push({ k: 'chorro', x0: g.fre.x, y0: g.fre.y, x1: x, y1: y, life: .35 });
        spawn(g, 12, x, y, { v: 70, life: .5, s: 1.6, k: 'dust', cols: ['#bfe6ff', '#ffffff'], g: 200 });
        let ok = false;
        for (const e of g.foes) if (e.fiery && e.st === 'ok' && near2(e.x, e.y - 4, x, y, 26)) { e.st = 'sleep'; e.tt = 4.5; ok = true; }
        for (const o of g.objs) { if (o.k === 'fireball' && near2(o.x, o.y, x, y, 24)) { o.dead = true; ok = true; } if (o.k === 'geiser' && Math.abs(o.x - x) < 22 && y > o.y - 80) { o.plug = 4.5; ok = true; } }
        const br = g.objs.find(o => o.k === 'brasas' && x > o.x0 - 8 && x < o.x1 + 8 && y > o.y - 50);
        if (br) { const bx = clamp(snapX(x) - 8, br.x0, br.x1 - 32); lim(g.solids, s => s.k === 'basalto', 2); g.solids.push({ k: 'basalto', x: bx, y: br.y - 5, w: 32, h: 12, on: true, life: 7 }); ok = true; }
        return ok ? true : true;
      } },
    burbuja: { name: 'Burbuja de aire', help: 'Clic: una burbuja grande que sube despacio; Itzel se puede parar encima.', cd: .5,
      click(g, x, y) { if (SOLID(x, y)) return false; lim(g.plats, q => q.pw, 2); g.plats.push(mkPlat({ k: 'airbub', look: 'burbuja', x: x - 14, y, w: 28, life: 6, pw: true })); return true; } },
    tempano: { name: 'Ventisca de Fresita', help: 'Clic para lanzar una ventisca: impulsa a Itzel en la dirección del soplo, adormece enemigos y deshace bolas de nieve. Sobre el mar también forma un témpano.', cd: .8,
      click(g, x, y) {
        const dx = x - g.fre.x, dir = Math.sign(dx) || g.fre.face || 1;
        const m = g.objs.find(o => o.k === 'mar' && x > o.x0 && x < o.x1 && y > o.y - 60);
        if (m) {
          lim(g.plats, q => q.pw, 2);
          const pl = mkPlat({ k: 'floe', look: 'tempano', x: x - 17, y: m.y - 2, w: 34, life: 7, pw: true, vx: dir * 6 });
          pl.w0 = 34; pl.max = 7; g.plats.push(pl);
        }
        g.zones.push({ k: 'soploNieve', x, y, dir, life: .55, t: 0 });
        const p = g.p;
        if (Math.hypot(p.x - x, p.y - p.h / 2 - y) < 45) { p.vx = dir * 220; p.boost = .3; }
        for (const e of g.foes) if (e.st === 'ok' && Math.hypot(e.x - x, e.y - (e.h || 8) / 2 - y) < 45) { e.st = 'sleep'; e.tt = 3; }
        for (const o of g.objs) if (o.k === 'bolaNieve' && Math.hypot(o.x - x, o.y - y) < 45) o.dead = true;
        return true;
      } },
    constelacion: { name: 'Constelación', help: 'Clic en una estrella y luego en otra: se tiende una línea de luz entre las dos.', cd: .15,
      click(g, x, y) {
        const s = g.objs.filter(o => o.k === 'estrella').sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
        if (!s || Math.hypot(s.x - x, s.y - y) > 18) { g.selStar = null; return false; }
        if (!g.selStar || g.selStar === s) { g.selStar = s; ring(g, s.x, s.y, '#fff3c4', 14); return true; }
        const a = g.selStar; g.selStar = null; if (Math.hypot(a.x - s.x, a.y - s.y) > 180) return false;
        let [p, q] = a.x < s.x ? [a, s] : [s, a];
        lim(g.plats, o => o.pw, 2); g.plats.push(mkPlat({ k: 'seg', look: 'constel', x: p.x, y: p.y, x2: q.x, y2: q.y, w: q.x - p.x, life: 10, pw: true })); return true;
      } },
    bengala: { name: 'Bengala', help: 'Clic: suelta una bengala roja; las criaturas van hacia la luz y se olvidan de Itzel.', cd: 1.2,
      click(g, x, y) { if (SOLID(x, y)) return false; lim(g.objs, o => o.k === 'bengala', 2); g.objs.push({ k: 'bengala', x, y, vy: 0, on: false, life: 7 }); return true; } },
  });

  // Un remolino breve marca el área del soplo; sus efectos ocurren al lanzarlo.
  ZONAS.soploNieve = {
    paso() {},
    pinta(c, z, f) {
      const a = Math.min(1, z.life * 3);
      c.save(); c.translate(z.x, z.y); c.globalAlpha = a; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        c.strokeStyle = i === 1 ? '#a8dfff' : '#ffffff'; c.lineWidth = 1.5 - i * .25;
        c.beginPath(); c.ellipse(0, 0, 14 + i * 9, 8 + i * 5, z.dir * .25, f.t * 5 + i, f.t * 5 + i + 4.1); c.stroke();
      }
      for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4 + f.t * 3, r = 12 + i * 3; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(Math.cos(ang) * r, Math.sin(ang) * r * .7, 1.2, 0, Math.PI * 2); c.fill(); }
      c.restore();
    },
  };

  // =====================================================================
  //  PIXEL 8, 32 Y 64 BITS
  // =====================================================================
  // 8 bits: elevadores que suben (o bajan) sin parar y dan la vuelta a la pantalla
  PK.lift = (pl, g, d) => {
    pl.y -= (pl.sp ?? 32) * d;
    const wrapTo = pl.y < -12 ? VH + 12 : pl.y > VH + 12 ? -12 : null;
    if (wrapTo !== null) { if (g.p.plat === pl) g.p.plat = null; pl.y = wrapTo; }
  };
  // 32 bits: candiles que se columpian de una cadena
  PK.swing = (pl, g, d) => {
    const len = (pl.len || 4) * T, a = Math.sin(pl.t * (pl.sp || 1.3) + (pl.ph || 0)) * (pl.amp || .8);
    pl.px = pl.x0 + pl.w / 2; pl.py = pl.y0 - len; pl.x = pl.px + Math.sin(a) * len - pl.w / 2; pl.y = pl.py + Math.cos(a) * len;
  };
  // 32 bits: losas fantasmales que solo existen cerca de una antorcha encendida
  PK.ghost = (pl, g, d, dt) => {
    const cx = pl.x + pl.w / 2, lit = (g.objs || []).some(o => o.k === 'antorcha' && o.lit > 0 && Math.hypot(o.x - cx, o.y - 20 - pl.y) < 135);
    pl.glow = (pl.glow || 0) + ((lit ? 1 : 0) - (pl.glow || 0)) * Math.min(1, dt * 6); pl.on = pl.glow > .5;
  };
  // 64 bits: flores gigantes que abren cuando Fresita está cerca (o mientras Itzel está encima)
  PK.bloom = (pl, g, d, dt) => {
    const cx = pl.x + pl.w / 2, near = Math.hypot(g.fre.x - cx, g.fre.y - pl.y) < 80 || (g.p.plat === pl);
    pl.open = clamp((pl.open || 0) + (near ? dt * 3 : -dt * 1.2), 0, 1); pl.on = pl.open > .55;
  };
  LOOK.ladrillo8 = (c, pl, f, sk) => {
    const x = Math.round(pl.x), y = Math.round(pl.y), w = Math.round(pl.w);
    c.fillStyle = '#000000'; c.fillRect(x - 1, y - 1, w + 2, 8); c.fillStyle = sk.plat; c.fillRect(x, y, w, 6); c.fillStyle = sk.accent; c.fillRect(x, y, w, 1);
    c.fillStyle = sk.plat2; for (let i = 0; i < w; i += 4) c.fillRect(x + i, y + 3, 2, 3);
  };
  LOOK.candil = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w;
    if (pl.px !== undefined) { c.strokeStyle = '#463848'; c.lineWidth = 1; c.setLineDash([1.5, 1]); c.beginPath(); c.moveTo(pl.px, pl.py); c.lineTo(x + w / 2, y); c.stroke(); c.setLineDash([]); c.fillStyle = '#62525e'; c.fillRect(pl.px - 2, pl.py - 1, 4, 2); }
    c.fillStyle = '#2e2436'; c.fillRect(x, y, w, 4); c.fillStyle = '#857478'; c.fillRect(x, y, w, 1); c.fillStyle = '#463848'; c.fillRect(x + 2, y + 4, w - 4, 2);
    for (let i = 0; i < 3; i++) { const cx = x + w * (.2 + i * .3); c.fillStyle = '#efe6d0'; c.fillRect(cx - .5, y - 3, 1, 3); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, cx, y - 4, 6, '#ff7a1a', .5 + Math.sin(f.t * 12 + i) * .1); c.restore(); c.fillStyle = '#ffd04a'; c.fillRect(cx - .5, y - 5, 1, 2); }
  };
  LOOK.espectral = (c, pl, f, sk) => {
    const a = pl.glow || 0, x = pl.x, y = pl.y, w = pl.w;
    c.save(); c.globalAlpha = .18 + a * .82;
    c.fillStyle = a > .5 ? '#5a6aa8' : '#2e2436'; c.fillRect(x, y, w, 6); c.fillStyle = '#c8d0ff'; c.fillRect(x, y, w, 1);
    c.fillStyle = '#8a96d8'; for (let i = 2; i < w; i += 6) c.fillRect(x + i, y + 2, 2, 2);
    if (a > .3) { c.globalCompositeOperation = 'lighter'; glowDot(c, x + w / 2, y + 3, w * .6, '#8a96ff', .2 * a); }
    c.restore();
  };
  LOOK.flor = (c, pl, f, sk) => {
    const k = pl.open || 0, x = pl.x + pl.w / 2, y = pl.y, w = pl.w / 2;
    // el tallo baja hasta el suelo (o hasta el fondo si abajo es hueco): nunca se queda colgando en el aire
    const fin = (typeof sueloDebajo === 'function' ? sueloDebajo(x, y) ?? fondoVista() : y + 60), lar = fin - y;
    c.strokeStyle = '#2f6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 3); c.quadraticCurveTo(x + 4, y + lar * .5, x - 2, fin); c.stroke();
    const petals = 7;
    for (let i = 0; i < petals; i++) {
      const u = i / (petals - 1) - .5, a = -Math.PI / 2 + u * (Math.PI * (.35 + k * .7)), l = w * (.55 + k * .55);
      c.fillStyle = i % 2 ? sk.plat : sk.plat2; c.beginPath(); c.moveTo(x, y + 3); c.quadraticCurveTo(x + Math.cos(a - .3) * l * .7, y + 3 + Math.sin(a - .3) * l * .7 * (1 - k * .7), x + Math.cos(a) * l, y + 3 + Math.sin(a) * l * (1 - k * .85)); c.quadraticCurveTo(x + Math.cos(a + .3) * l * .7, y + 3 + Math.sin(a + .3) * l * .7 * (1 - k * .7), x, y + 3); c.fill();
    }
    c.fillStyle = '#ffe070'; c.beginPath(); c.ellipse(x, y + 2, 3 + k * 2, 1.6, 0, 0, TAU); c.fill();
  };

  Object.assign(FOE, {
    chapulin: { beh: 'jumper', w: 12, h: 9 },
    pirata: { beh: 'spit', w: 11, h: 15, v: 16, proj: 'hueso' },
    mono: { beh: 'thrower', w: 13, h: 13 },
  });
  BEH.jumper = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.tt -= d; if (e.tt <= 0) { e.dir = Math.sign(toP) || e.dir; e.vy = -340; e.vx = e.dir * 45; e.y -= 1; e.tt = 1.2 + Math.random() * .5; }
  };
  BEH.thrower = (e, g, d, toP) => {
    const p = g.p; e.tt -= d; e.dir = Math.sign(toP) || e.dir;
    if (e.tt <= 0 && Math.abs(toP) < 150 && p.y >= e.y - 10) { const tt = .9; g.objs.push({ k: 'fireball', origen: e, kind: 'coco', x: e.x, y: e.y - 10, vx: (p.x - e.x) / tt, vy: ((p.y - 8 - (e.y - 10)) - .5 * 420 * tt * tt) / tt, life: 3 }); e.tt = 2.2; e.throwT = .3; }
    e.throwT = Math.max(0, (e.throwT || 0) - d);
  };
  Object.assign(FD, {
    chapulin(c, e, t, s) {
      const air = e.vy !== 0, X = (x) => Math.round(x);
      c.fillStyle = '#000000'; c.fillRect(-6, -7, 12, 5); c.fillStyle = s.main; c.fillRect(-5, -6, 10, 3); c.fillStyle = s.light; c.fillRect(-5, -6, 10, 1);
      c.fillStyle = '#000000'; c.fillRect(4, -9, 4, 4); c.fillStyle = s.main; c.fillRect(5, -8, 2, 2); c.fillStyle = '#ffffff'; c.fillRect(6, -8, 1, 1);
      c.fillStyle = s.dark; if (air) { c.fillRect(-6, -3, 2, 4); c.fillRect(2, -3, 2, 4); } else { c.fillRect(-7, -4, 5, 1); c.fillRect(-7, -3, 1, 3); c.fillRect(2, -3, 1, 3); }
      c.fillStyle = s.accent; c.fillRect(-4, -8, 6, 1); void X;
    },
    pirata(c, e, t, s) {
      const a = Math.sin(e.anim * 9), aim = e.aim > 0;
      c.fillStyle = '#efe6d0'; c.fillRect(-2.5 + a, -5, 1.6, 5); c.fillRect(1 - a, -5, 1.6, 5);
      c.fillStyle = '#463848'; c.fillRect(-3.5, -11, 7, 6); c.fillStyle = '#efe6d0'; for (let i = 0; i < 3; i++) c.fillRect(-2.5, -10 + i * 2, 5, 1);
      c.fillStyle = '#efe6d0'; c.beginPath(); c.arc(0, -13, 3.4, 0, TAU); c.fill(); c.fillStyle = '#1c1626'; c.fillRect(-1.6, -14, 1.4, 1.6); c.fillRect(1, -14, 1.4, 1.6); c.fillRect(-1, -11.4, 2.4, .6);
      c.fillStyle = '#b8203a'; c.beginPath(); c.moveTo(-4, -15); c.quadraticCurveTo(0, -19, 4, -15); c.lineTo(5, -14); c.lineTo(-4, -14.6); c.fill();
      c.fillStyle = '#efe6d0'; if (aim) c.fillRect(3, -14, 1.4, 5); else c.fillRect(3, -10, 1.4, 5);
    },
    mono(c, e, t, s) {
      const th = e.throwT > 0, a = Math.sin(e.anim * 3);
      c.strokeStyle = s.dark; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-4, -4); c.quadraticCurveTo(-11, -4 + a * 2, -9, -12); c.stroke();
      c.fillStyle = s.dark; c.beginPath(); c.ellipse(0, -6, 5, 5.5, 0, 0, TAU); c.fill();
      c.fillStyle = s.main; c.beginPath(); c.ellipse(1, -12, 4.2, 3.8, 0, 0, TAU); c.fill(); c.fillStyle = s.light; c.beginPath(); c.ellipse(2, -11.5, 2.6, 2.4, 0, 0, TAU); c.fill();
      c.fillStyle = '#111'; c.fillRect(1.5, -12.6, 1, 1); c.fillRect(3.2, -12.6, 1, 1);
      c.strokeStyle = s.dark; c.lineWidth = 1.6; c.beginPath(); c.moveTo(3, -8); c.lineTo(th ? 6 : 5, th ? -14 : -4); c.stroke();
      if (th) { c.fillStyle = '#fff'; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.fillText('¡uh!', -4, -18); }
    },
  });

  OBJ.ladrillo = {
    drawSolid(c, s, f, sk) {
      const x = Math.round(s.x), y = Math.round(s.y), blink = s.life < 1.2 && Math.sin(f.t * 30) > 0;
      c.fillStyle = '#000000'; c.fillRect(x, y, 16, 16);
      c.fillStyle = blink ? '#fcd8a8' : '#c84c0c'; c.fillRect(x + 1, y + 1, 14, 14);
      c.fillStyle = '#fc9838'; c.fillRect(x + 1, y + 1, 14, 1); c.fillRect(x + 1, y + 1, 1, 14);
      c.fillStyle = '#000000'; c.fillRect(x + 1, y + 8, 14, 1); c.fillRect(x + 8, y + 1, 1, 7); c.fillRect(x + 4, y + 9, 1, 6); c.fillRect(x + 12, y + 9, 1, 6);
    },
  };
  OBJ.ladrilloctl = { step(o, g) { if (o.s.dead || o.s.life <= 0) { o.c.got = false; o.dead = true; } } };
  OBJ.antorcha = {
    make(g, en) { g.objs.push({ k: 'antorcha', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, lit: en.lit ? 1e9 : 0 }); },
    step(o, g, dt) { if (o.lit > 0 && o.lit < 1e8) o.lit -= dt; },
    draw(c, o, f) {
      const x = Math.round(o.x), y = o.y, on = o.lit > 0, low = on && o.lit < 1.5 && Math.sin(f.t * 20) > 0;
      c.fillStyle = '#2e2436'; c.fillRect(x - 1, y - 22, 3, 22); c.fillStyle = '#62525e'; c.fillRect(x - 1, y - 22, 1, 22);
      c.fillStyle = '#463848'; c.fillRect(x - 4, y - 25, 9, 3); c.fillStyle = '#857478'; c.fillRect(x - 4, y - 25, 9, 1);
      if (on && !low) {
        c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 30, 46, '#ff7a1a', .35); c.restore();
        const h = 7 + Math.sin(f.t * 14) * 1.5; c.fillStyle = '#ff7a1a'; c.beginPath(); c.moveTo(x - 3.5, y - 25); c.quadraticCurveTo(x - 3, y - 25 - h * .7, x + Math.sin(f.t * 9), y - 25 - h); c.quadraticCurveTo(x + 3, y - 25 - h * .6, x + 3.5, y - 25); c.fill();
        c.fillStyle = '#ffd04a'; c.beginPath(); c.moveTo(x - 2, y - 25); c.quadraticCurveTo(x, y - 25 - h * .7, x + 2, y - 25); c.fill();
      } else { c.fillStyle = '#5a2a1a'; c.fillRect(x - 2, y - 27, 4, 2); if (Math.sin(f.t * 3) > 0) { c.fillStyle = '#ff7a1a'; c.fillRect(x, y - 27, 1, 1); } }
    },
  };
  OBJ.carga = {
    env(o, g, e) { if (g.carry) e.grav = .02; },
    step(o, g, dt) {
      const p = g.p; if (!g.carry) { o.dead = true; return; }
      g.carry.t -= dt; if (g.carry.t <= 0) { g.carry = null; o.dead = true; g.fre.cool = 1.2; return; }
      const tx2 = g.fre.x, ty2 = g.fre.y + 21; p.vx = clamp((tx2 - p.x) * 7, -170, 170); p.vy = clamp((ty2 - p.y) * 7, -220, 220); p.noCut = true; p.boost = .05; p.on = false; p.plat = null; p.face = Math.sign(p.vx) || p.face;
    },
    draw(c, o, f) {
      const g = f.g, p = g.p; if (!g.carry) return; const k = g.carry.t / 1.8;
      c.strokeStyle = '#ffd1ea'; c.lineWidth = .8; c.beginPath(); c.moveTo(g.fre.x - 2, g.fre.y + 3); c.lineTo(p.x - 2, p.y - 15); c.moveTo(g.fre.x + 2, g.fre.y + 3); c.lineTo(p.x + 2, p.y - 15); c.stroke();
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(g.fre.x - 8, g.fre.y - 12, 16, 2); c.fillStyle = k < .3 ? '#ff6060' : '#ffd1ea'; c.fillRect(g.fre.x - 8, g.fre.y - 12, 16 * k, 2);
      if (k < .35) { c.fillStyle = '#9fd8ff'; c.beginPath(); c.arc(g.fre.x + 6, g.fre.y - 6 + (f.t * 20 % 4), .9, 0, TAU); c.fill(); }
    },
  };
  Object.assign(POW, {
    ladrillo: { name: 'Ladrillo', help: 'Clic sobre un canistel: lo vuelve ladrillo por 5 segundos (luego regresa).', cd: .3,
      click(g, x, y) {
        const c = g.coins.filter(c => !c.got).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
        if (!c || Math.hypot(c.x - x, c.y - y) > 16) return false;
        const bx = Math.floor(c.x / T) * T, by = Math.floor(c.y / T) * T; if (!freeOf(g, bx, by, T, T)) return false;
        lim(g.solids, s => s.k === 'ladrillo', 4);
        const s = { k: 'ladrillo', x: bx, y: by, w: T, h: T, on: true, life: 5 }; g.solids.push(s); c.got = true; g.objs.push({ k: 'ladrilloctl', s, c });
        spawn(g, 8, c.x, c.y, { v: 50, life: .35, s: 1.5, k: 'spark', cols: ['#fc9838', '#fcd8a8'] }); return true;
      } },
    antorcha: { name: 'Antorcha', help: 'Clic sobre una antorcha: la enciende y aparecen las losas fantasmales cercanas.', cd: .3,
      click(g, x, y) { const o = g.objs.filter(o => o.k === 'antorcha').sort((a, b) => Math.hypot(a.x - x, a.y - 25 - y) - Math.hypot(b.x - x, b.y - 25 - y))[0]; if (!o || Math.hypot(o.x - x, o.y - 25 - y) > 26) return false; if (o.lit < 1e8) o.lit = 7; spawn(g, 14, o.x, o.y - 28, { v: 60, life: .5, s: 1.6, k: 'spark', cols: ['#ffd04a', '#ff7a1a'], g: -40 }); return true; } },
    cargar: { name: 'Cargar', help: 'Mantén clic cerca de Itzel: Fresita la carga volando un ratito (como en Owlboy).', cd: .1, drag: true,
      click(g, x, y, c) {
        if (c.up) { if (g.carry) { g.carry = null; g.fre.cool = .6; return true; } return false; }
        const p = g.p; if (g.carry || Math.hypot(g.fre.x - p.x, g.fre.y - (p.y - 10)) > 34) return false;
        g.carry = { t: 1.8 }; g.objs.push({ k: 'carga' }); return true;
      } },
  });
})();
