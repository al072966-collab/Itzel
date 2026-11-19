'use strict';
// =====================================================================
//  QUE NADIE SE QUEDE SIN HACER NADA
//   - Plagas (rescatadas de la v1): cada tanto un bicho persigue a
//     Fresita: la ronda, apunta (avisa con una línea) y se lanza en línea
//     recta; Fresita la esquiva moviéndose. Si la alcanza, se zafa a clics.
//   - Semillas de luz: flotan arriba, donde Itzel no llega. Solo Fresita
//     las junta; se cuentan por separado y cada 12 curan un corazón.
// =====================================================================
const COOP = (() => {
  const { OBJ } = MEC;
  function init(g) {
    if (g.isBoss) return;
    const W = L.gw - PAD * 2;
    for (let c = 9; c < W - 5; c += 12) {
      const x = (c + PAD + .5 + (hash1(c, 3) - .5) * 4) * T, y = 22 + hash1(c, 4) * 30;
      if (!SOLID(x, y) && !SOLID(x, y + 8)) g.objs.push({ k: 'semilla', x, y, t: hash1(c, 5) * 6 });
    }
    g.objs.push({ k: 'plagactl', t: 14 });
  }
  // Cada nivel tiñe sus semillas con su propio matiz (solo código, sin assets).
  const tono = def => {
    const id = String(def && def.id || 'x'); let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    const m = (h * 137.508) % 360;
    return { m, hue: m - 40, cuerpo: `hsl(${m},90%,82%)`, borde: `hsl(${m},55%,26%)`, rayos: `hsl(${m},60%,40%)`, brillo: `hsl(${m},100%,88%)` };
  };
  OBJ.semilla = {
    front: true,
    step(o, g, dt) {
      o.t += dt; if (Math.hypot(o.x - g.fre.x, o.y + Math.sin(o.t * 2) * 3 - g.fre.y) > 11) return;
      o.dead = true; RUN.semillas = (RUN.semillas || 0) + 1;
      spawn(g, 14, o.x, o.y, { v: 70, life: .7, s: 1.8, k: 'spark', cols: ['#fff6c8', '#ffd1ea', '#ffffff'], g: -20 });
      if (RUN.semillas % 12 === 0) { if (RUN.hearts < RUN.maxHearts) { RUN.hearts++; toast('Fresita juntó 12 semillas de luz: un corazón más'); } else toast('Fresita juntó 12 semillas de luz'); }
      if (typeof ENCI !== 'undefined') ENCI.ver('entorno:semilla');
    },
    draw(c, o, f) {
      const y = o.y + Math.sin(o.t * 2) * 3, pul = .7 + Math.sin(o.t * 5) * .3;
      const tn = tono(typeof CUR !== "undefined" && CUR ? CUR.def : null);
      if (!f.st.pixel) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, y, 10, tn.brillo, .45 * pul); c.restore(); }
      c.fillStyle = tn.cuerpo; c.strokeStyle = tn.borde; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(o.x, y - 4.2); c.quadraticCurveTo(o.x + 3.6, y, o.x, y + 4.2); c.quadraticCurveTo(o.x - 3.6, y, o.x, y - 4.2); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = tn.rayos; c.lineWidth = .65; c.beginPath(); for (let k = 0; k < 4; k++) { const a = o.t * 2 + k * Math.PI / 2; c.moveTo(o.x + Math.cos(a) * 5, y + Math.sin(a) * 5); c.lineTo(o.x + Math.cos(a) * (6.5 + pul), y + Math.sin(a) * (6.5 + pul)); } c.stroke();
    },
  };
  OBJ.plagactl = {
    step(o, g, dt) {
      if (g.win) return; o.t -= dt;
      if (o.t > 0 || g.objs.some(q => q.k === 'plaga')) return;
      const side = Math.random() < .5 ? -1 : 1;
      g.objs.push({ k: 'plaga', x: g.cam + (side < 0 ? -12 : VW + 12), y: (g.camY || 0) + 30 + Math.random() * 80, vx: 0, vy: 0, t: 0, st: 'ronda', tt: 1.6, lances: 0, ang: side < 0 ? Math.PI : 0 });
      o.t = 20 + Math.random() * 10; if (typeof ENCI !== 'undefined') ENCI.ver('entorno:plaga');
    },
  };
  // la plaga: ronda → apunta (tiembla y marca la línea) → se lanza recto. Si falla una vez, se va. (Suavizada: más lenta, avisa más y sale menos.)
  const CLICS = 4, LANCE = 200, RADIO = 52, APUNTA = 1;
  OBJ.plaga = {
    front: true,
    step(o, g, dt) {
      o.t += dt; const fr = g.fre;
      if (g.lull && g.t - g.lull.t < .05 && Math.hypot(o.x - g.lull.x, o.y - g.lull.y) < g.lull.r + 8 && o.st !== 'agarra') { o.st = 'duerme'; RUN.naps++; }
      if (o.st === 'ronda') {
        // da vueltas alrededor de Fresita, a distancia
        o.ang += dt * 1.6; o.tt -= dt;
        const tx = fr.x + Math.cos(o.ang) * RADIO, ty = fr.y + Math.sin(o.ang) * RADIO * .6;
        o.vx += ((tx - o.x) * 3 - o.vx) * Math.min(1, dt * 4); o.vy += ((ty - o.y) * 3 - o.vy) * Math.min(1, dt * 4);
        if (o.tt <= 0) { o.st = 'apunta'; o.tt = APUNTA; }
      } else if (o.st === 'apunta') {
        // se detiene y apunta adonde está Fresita; al final fija el rumbo
        o.vx *= .8; o.vy *= .8; o.tt -= dt; o.mx = fr.x; o.my = fr.y;
        if (o.tt <= 0) { const dx = fr.x - o.x, dy = fr.y - o.y, d = Math.hypot(dx, dy) || 1; o.dx = dx / d; o.dy = dy / d; o.st = 'lanza'; o.tt = Math.min(.9, (d + 40) / LANCE); }
      } else if (o.st === 'lanza') {
        o.vx = o.dx * LANCE; o.vy = o.dy * LANCE; o.tt -= dt;
        if (Math.hypot(fr.x - o.x, fr.y - o.y) < 7 && !fr.atrapada) {
          o.st = 'agarra'; o.clics = 0; fr.atrapada = o; o.vx = o.vy = 0; MEC.ring(g, fr.x, fr.y, '#ff8080', 14, .4);
          if (typeof toast === 'function') toast('¡Fresita, haz clic varias veces para zafarte!', 3500);
        } else if (o.tt <= 0) {
          o.lances++; o.st = o.lances >= 1 ? 'huye' : 'ronda'; o.tt = 1.3 + Math.random() * .8; o.ang = Math.atan2(o.y - fr.y, o.x - fr.x);
          if (o.st === 'huye') { o.vx = o.dx * 60; o.vy = -60; }
        }
      } else if (o.st === 'agarra') {
        o.x = fr.x + 5 + Math.sin(o.t * 22) * 1.2; o.y = fr.y - 6 + Math.cos(o.t * 19); return;
      } else if (o.st === 'huye') { o.vy -= 80 * dt; o.vx *= .98; if (o.y < (g.camY || 0) - 20 || o.x < g.cam - 40 || o.x > g.cam + VW + 40) o.dead = true; }
      else if (o.st === 'duerme') { o.vx = 0; o.vy += 120 * dt; if (o.y > VH + 10) o.dead = true; }
      const z = o.st === 'lanza' ? 0 : 1;
      o.x += o.vx * dt + Math.sin(o.t * 13) * .4 * z; o.y += o.vy * dt + Math.cos(o.t * 11) * .4 * z;
    },
    draw(c, o, f) {
      const sk = (f.g.def && f.g.def.skin) || MEC.DEFAULT_SKIN, F = sk.foe || MEC.DEFAULT_SKIN.foe, wing = Math.sin(o.t * 50) * .5 + .5;
      const dir = o.st === 'apunta' ? (o.mx >= o.x ? 1 : -1) : o.vx >= 0 ? 1 : -1;
      // el aviso: la línea por donde se va a lanzar, cada vez más fuerte
      if (o.st === 'apunta') {
        const k = 1 - o.tt / APUNTA, dx = o.mx - o.x, dy = o.my - o.y, d = Math.hypot(dx, dy) || 1, L2 = Math.min(d + 40, LANCE * .9);
        c.save(); c.strokeStyle = `rgba(255,70,70,${.25 + k * .6})`; c.lineWidth = .7 + k * .6; c.setLineDash([3, 2]);
        c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + dx / d * L2, o.y + dy / d * L2); c.stroke(); c.restore();
        c.fillStyle = '#ff4040'; c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('!', o.x, o.y - 6); c.textAlign = 'left';
      }
      if (o.st === 'lanza') { c.save(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x - o.dx * 12, o.y - o.dy * 12); c.stroke(); c.restore(); }
      const tiembla = o.st === 'apunta' ? (Math.random() - .5) * 1.2 : 0;
      // la mosca de la lámina (fauna.js): aleteo, apunta con ojos rojos, se lanza estirada, agarra con las patas, aturdida
      const FA = window.FAUNA_ARTE;
      if (FA && FA.listo('mosca')) {
        const n = o.st === 'apunta' ? 2 : o.st === 'lanza' ? 3 : o.st === 'agarra' ? 4 : o.st === 'duerme' ? 5 : Math.floor(o.t * 18) % 2;
        const rot = o.st === 'lanza' ? Math.atan2(o.dy, Math.abs(o.dx) || .01) * dir * .7 : o.st === 'duerme' ? Math.PI * .8 : 0;
        FA.pieza(c, 'mosca' + n, o.x + tiembla, o.y + 3, { w: o.st === 'lanza' ? 12 : 10, ay: .6, voltea: dir < 0, rot });
      } else {
      c.save(); c.translate(o.x + tiembla, o.y); c.scale(dir, 1); if (o.st === 'duerme') c.rotate(Math.PI * .8);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-1, -2.6 - wing, 2.6, 1.2, -.5, 0, TAU); c.ellipse(1, -2.6 - wing, 2.6, 1.2, .5, 0, TAU); c.fill();
      c.fillStyle = F.dark; c.beginPath(); c.ellipse(-1.5, 0, 3, 2, 0, 0, TAU); c.fill(); c.fillStyle = F.main; c.beginPath(); c.arc(1.8, -.3, 1.8, 0, TAU); c.fill();
      c.fillStyle = o.st === 'apunta' || o.st === 'lanza' ? '#ff4040' : '#ffffff'; c.fillRect(2.3, -1, .9, .9);
      c.strokeStyle = F.dark; c.lineWidth = .4; c.beginPath(); c.moveTo(3.2, .2); c.lineTo(5.4, 1.2); c.stroke();
      c.restore();
      }
      if (o.st === 'agarra') {
        const fr = f.g.fre, progreso = Math.min(1, (o.clics || 0) / CLICS);
        c.save(); c.lineWidth = 1.8; c.strokeStyle = 'rgba(40,25,20,.65)'; c.beginPath(); c.arc(fr.x, fr.y, 13, 0, TAU); c.stroke();
        c.strokeStyle = '#ffe27a'; c.beginPath(); c.arc(fr.x, fr.y, 13, -Math.PI / 2, -Math.PI / 2 + TAU * progreso); c.stroke();
        c.fillStyle = '#fff4db'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('¡Clic, clic!', fr.x, fr.y - 17); c.restore();
      }
      if (o.st === 'ronda' && o.lances === 0 && o.t < 2.5) { c.fillStyle = 'rgba(255,255,255,.85)'; c.font = 'bold 4.5px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('¡esquívala!', o.x, o.y - 7); c.textAlign = 'left'; }
    },
  };
  OBJ.plaga.CLICS = CLICS;
  return { init, tono };
})();
