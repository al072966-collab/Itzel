'use strict';
// =====================================================================
//  VAPOR Y ENGRANAJES · el mundo steampunk (sustituye al de CGA)
//  Reusa el arte de la Práctica 4 de David («Vapor y Engranajes», GDevelop):
//  fondo industrial en cuatro capas, losetas de acero y remaches, tuberías,
//  calderas, tanques, engranajes, monedas, enemigos y el jefe BrawBot.
//  Los archivos están en arte/vapor/ (créditos y licencias en arte/vapor/CREDITOS.md).
// =====================================================================
const VAPOR = (() => {
  const base = new URL('arte/vapor/', document.currentScript.src).href, cache = {};
  const img = n => cache[n] || (cache[n] = Object.assign(new Image(), { src: base + n + '.png' }));
  const listo = im => im && im.complete && im.naturalWidth > 0;
  // dibuja una imagen escalada con el ancla en (ax, ay) en pixeles de la imagen; sin suavizar (es pixel art)
  function pinta(ctx, n, x, y, k, ax = 0, ay = 0, flip = 1) {
    const im = img(n); if (!listo(im)) return false;
    const s0 = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    if (flip < 0) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.drawImage(im, -ax * k, -ay * k, im.width * k, im.height * k); ctx.restore(); }
    else ctx.drawImage(im, x - ax * k, y - ay * k, im.width * k, im.height * k);
    ctx.imageSmoothingEnabled = s0; return true;
  }
  // precarga lo que se ve primero
  ['bg_reactor_sky', 'bg_reactor_far', 'bg_reactor_mid', 'bg_reactor_front', 'tile_suelo', 'tile_relleno', 'caja', 'caldera', 'tanque', 'engranaje_maestro', 'valvula_on', 'valvula_off'].forEach(img);
  for (let k = 0; k < 8; k++) img('moneda_' + k);
  for (let k = 0; k < 5; k++) img('engranaje_fondo_' + k);
  return { img, listo, pinta };
})();

(function () {
  const { img, listo, pinta } = VAPOR;
  // una capa de fondo que se repite a lo ancho, con su paralaje
  function capaFondo(ctx, f, n, par, esc, abajo) {
    const im = img(n); if (!listo(im)) return;
    const w = im.width * esc, h = im.height * esc, off = ((f.cam * par) % w + w) % w;
    ctx.imageSmoothingEnabled = false;
    for (let x = -off; x < VW; x += w) ctx.drawImage(im, x, abajo - h, w + .5, h);
    ctx.imageSmoothingEnabled = true;
  }
  const patrones = new WeakMap();
  function patron(ctx, n, esc) {
    let m = patrones.get(ctx); if (!m) patrones.set(ctx, m = {});
    if (m[n]) return m[n]; const im = img(n); if (!listo(im)) return null;
    const p = ctx.createPattern(im, 'repeat'); p.setTransform(new DOMMatrix([esc, 0, 0, esc, 0, 0])); return (m[n] = p);
  }

  defStyle({
    id: 'vapor', name: 'Vapor y engranajes', ref: 'Vapor y Engranajes (Práctica 4 de David) · assets de OpenGameArt', order: 40,
    desc: 'Una fábrica steampunk al atardecer: chimeneas, calderas de cobre, tuberías y engranajes que giran. El arte viene del juego «Vapor y Engranajes»; sprites de OpenGameArt de AR (Anton Revin), KnoblePersona, mauriku, Bluce, pzUH, wuhu, Umplix, NettySvit, Blarumyrran, Clint Bellanger, TokyoGeisha, bevouliin, Luis Zuno (ansimuz) y Sinestesia.',
    fx: { dust: ['#8a6a50', '#c89a70'], spark: ['#ffb040', '#ffe08a', '#ffffff'], confetti: ['#c8743a', '#f2c94c', '#8a4a2a', '#e8d0a0'] },
    sky(ctx, f) {
      const cielo = img('bg_reactor_sky');
      if (listo(cielo)) { ctx.imageSmoothingEnabled = false; ctx.drawImage(cielo, 0, -24, VW, VW * cielo.height / cielo.width); ctx.imageSmoothingEnabled = true; }
      else { ctx.fillStyle = '#5a2a1a'; ctx.fillRect(0, 0, VW, VH); }
      // engranajes enormes girando a lo lejos
      ctx.save(); ctx.globalAlpha = .22;
      for (let k = 0; k < 3; k++) { const fr = Math.floor(f.t * 5 + k * 2) % 5, x = ((k * 190 + 60 - f.cam * .04) % 570 + 570) % 570 - 80; pinta(ctx, 'engranaje_fondo_' + fr, x, 40 + k * 18, .42 - k * .06, 150, 148); }
      ctx.restore();
      capaFondo(ctx, f, 'bg_reactor_far', .08, .34, 212);
      ctx.fillStyle = 'rgba(120,50,30,.18)'; ctx.fillRect(0, 0, VW, VH);
      capaFondo(ctx, f, 'bg_reactor_mid', .18, .3, 206);
      // humo de las chimeneas
      ambient(14, 21, (i, a, b, c) => { const u = (f.t * (.04 + c * .03) + a) % 1, x = ((a * 900 - f.cam * .18) % VW + VW) % VW + Math.sin(f.t + i) * 6, y = 70 - u * 80; ctx.fillStyle = `rgba(60,40,36,${.25 * (1 - u)})`; ctx.beginPath(); ctx.arc(x, y, 6 + u * 14, 0, TAU); ctx.fill(); });
      capaFondo(ctx, f, 'bg_reactor_front', .32, .3, 214);
      const n = ctx.createLinearGradient(0, 150, 0, VH); n.addColorStop(0, 'rgba(255,140,60,0)'); n.addColorStop(1, 'rgba(255,140,60,.18)'); ctx.fillStyle = n; ctx.fillRect(0, 150, VW, VH);
    },
    terrain(ctx) {
      const R2 = (x, y) => hash1(Math.round(x * 3 + y * 7), 19);
      allLoopsPath(ctx, L.loops, 0);
      { const g = ctx.createLinearGradient(0, 120, 0, VH); g.addColorStop(0, '#6a4632'); g.addColorStop(1, '#2e1c14'); ctx.fillStyle = g; ctx.fill(); }
      ctx.save(); ctx.clip();
      for (let y = 96, k = 0; y < VH + 16; y += 20, k++) for (let x = (k % 2) * -22; x < L.ww; x += 44) {
        const q = R2(x, y); ctx.fillStyle = q < .3 ? 'rgba(200,116,58,.12)' : q < .6 ? 'rgba(20,10,6,.14)' : 'rgba(255,190,120,.05)'; ctx.fillRect(x, y, 44, 20);
        ctx.fillStyle = 'rgba(255,190,120,.2)'; ctx.fillRect(x, y, 44, .7); ctx.fillRect(x, y, .7, 20); ctx.fillStyle = 'rgba(16,8,4,.6)'; ctx.fillRect(x, y + 19.2, 44, .8); ctx.fillRect(x + 43.2, y, .8, 20);
        for (const [rx, ry] of [[3, 3], [41, 3], [3, 17], [41, 17], [22, 3], [22, 17]]) { ctx.fillStyle = '#2a1810'; ctx.beginPath(); ctx.arc(x + rx + .3, y + ry + .4, 1.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#c89a68'; ctx.beginPath(); ctx.arc(x + rx, y + ry, 1, 0, TAU); ctx.fill(); }
        if (q > .82) { ctx.fillStyle = 'rgba(120,60,24,.32)'; ctx.fillRect(x + 8 + q * 20, y + 2, 2.4, 14 + q * 8); }
      }
      ctx.restore();
      ctx.strokeStyle = '#140c08'; ctx.lineWidth = 1; allLoopsPath(ctx, L.loops, 0); ctx.stroke();
      const suelo = img('tile_suelo');
      if (listo(suelo)) {
        ctx.imageSmoothingEnabled = false;
        for (const r of L.tops) for (let x = r.x0; x < r.x1; x += 16) { const w = Math.min(16, r.x1 - x); ctx.drawImage(suelo, 0, 0, w * 4, 64, x, r.y, w, 16); }
        ctx.imageSmoothingEnabled = true;
      }
      for (const r of L.bottoms) { ctx.fillStyle = 'rgba(10,5,2,.4)'; ctx.fillRect(r.x0, r.y - 4, r.x1 - r.x0, 4); }
      for (const o of L.deco) {
        if (o.k === 'T') pinta(ctx, o.i % 2 ? 'caldera' : 'tanque', o.x, o.y + 1, .3, 30, o.i % 2 ? 128 : 122);
        else if (o.k === 'r') pinta(ctx, 'caja', o.x, o.y + 1, .25, 32, 64);
        else if (o.k === 'f') pinta(ctx, 'tile_tubo_v', o.x, o.y + 1, .25, 20, 64);
      }
    },
    coin(ctx, x, y, t) {
      const k = Math.floor(t * 10 + x * .07) % 8, yy = y + Math.sin(t * 2.5 + x) * 1.4;
      glowDot(ctx, x, yy, 9, '#ffcc60', .35);
      if (!pinta(ctx, 'moneda_' + k, x, yy, .32, 24, 17)) { ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.arc(x, yy, 3.5, 0, TAU); ctx.fill(); }
    },
    goal(ctx, x, y, t, f) {
      const ganó = f && f.g && f.g.win;
      pinta(ctx, ganó ? 'valvula_on' : 'valvula_off', x, y + 1, .26, 24, 144);
      ctx.save(); ctx.translate(x, y - 44); ctx.rotate(t * (ganó ? 4 : 1)); pinta(ctx, 'engranaje_maestro', 0, 0, .34, 32, 31.5); ctx.restore();
      glowDot(ctx, x, y - 44, 14, '#ffb040', .35 + Math.sin(t * 3) * .1);
    },
    over(ctx, f) {
      // chispas de las calderas y vapor que pasa
      ctx.globalCompositeOperation = 'lighter';
      ambient(16, 31, (i, a, b, c) => { const x = ((a * VW * 1.4 - f.cam * (.5 + c * .5)) % (VW + 20) + VW + 20) % (VW + 20) - 10, y = ((b * VH - f.t * (8 + c * 10)) % VH + VH) % VH; ctx.fillStyle = `rgba(255,170,80,${.15 + c * .25})`; ctx.fillRect(x, y, .9, .9); });
      ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .35, '#1a0c06');
    },
  });
})();
