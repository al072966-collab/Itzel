'use strict';
// =====================================================================
//  FRESITA SÓLIDA (poder del cielo anime)
//  Se mantiene el clic: Fresita se queda quieta en ese punto del aire y se vuelve sólida. Itzel se cuelga de ella al tocarla
//  y, con un salto, sale disparada hacia donde quiera (flechas: izquierda, derecha, abajo; sin flechas, hacia arriba).
//  Aguanta 4 segundos; al soltar el clic Itzel cae. Los charranes la picotean y la sueltan.
//  Estado: g.asid = { t, max, latch, rg }  (latch: Itzel está colgada; rg: espera para volver a agarrarse)
// =====================================================================
(() => {
  const { POW, OBJ, ring } = MEC;
  const suelta = g => { if (g.asid && g.asid.latch) { g.p.vx *= .3; g.p.vy = Math.min(g.p.vy, 40); } g.asid = null; };
  const tecla = k => typeof KEYS !== 'undefined' && KEYS.has(k);
  POW.asidero = { name: 'Fresita sólida', cd: .25, drag: true,
    help: 'Mantén el clic: Fresita se queda quieta en ese punto del aire y se vuelve sólida. Toca a Fresita para colgarte de ella y salta (espacio) hacia donde quieras con las flechas.',
    click(g, x, y, c) {
      if (c.up) { if (g.asid) { suelta(g); g.fre.cool = .5; return true; } return false; }
      if (g.asid || SOLID(x, y)) return false;
      g.asid = { t: 0, max: 4, latch: false, rg: 0 }; g.fre.objX = x; g.fre.objY = y;
      g.objs.push({ k: 'asidero', front: true }); return true;
    } };
  MEC.asideroSuelta = (g, espera = .6) => { if (g.asid) { if (g.asid.latch) g.p.vy = Math.min(g.p.vy, 20); g.asid.latch = false; g.asid.rg = espera; } };
  OBJ.asidero = {
    front: true,
    env(o, g, e) { if (g.asid && g.asid.latch) e.grav = .02; },
    step(o, g, dt) {
      const A = g.asid; if (!A) { o.dead = true; return; }
      const p = g.p, fr = g.fre; A.t += dt; A.rg = Math.max(0, A.rg - dt);
      if (A.t > A.max || g.win) { suelta(g); fr.cool = 1; return; }
      if (!A.latch) {
        if (A.rg <= 0 && Math.hypot(fr.x - p.x, fr.y - (p.y - 12)) < 21) { A.latch = true; ring(g, fr.x, fr.y, '#ffd1ea', 16, .35); spawn(g, 8, fr.x, fr.y, { v: 50, life: .4, s: 1.6, k: 'spark', cols: ['#ffd1ea', '#ffffff'] }); }
        return;
      }
      p.vx = clamp((fr.x - p.x) * 14, -240, 240); p.vy = clamp((fr.y + 20 - p.y) * 14, -240, 240); p.noCut = true; p.boost = .05; p.on = false; p.plat = null; p.dash = 0;
      const inp = g.inp, press = inp ? inp.press : p.jb > 0;   // en las demos de la enciclopedia el guion salta con jb
      if (press) {
        const d = inp ? inp.dir : (g.mando ? g.mando.dir : 0), abajo = tecla('ArrowDown') || tecla('KeyS');
        p.vx = d * MAXV * 1.35; p.vy = abajo ? 170 : -JUMP * (d ? 1.02 : 1.1); p.boost = .24; p.noCut = true; p.sq = -.25; if (d) p.face = d;
        A.latch = false; A.rg = .45; p.jb = 0;
        spawn(g, 10, p.x, p.y - 8, { v: 70, life: .45, s: 1.8, k: 'spark', cols: ['#ffd1ea', '#ffffff', '#fff3a0'], g: 40 });
      }
    },
    draw(c, o, f) {
      const g = f.g, A = g.asid; if (!A) return; const fr = g.fre, p = g.p, t = f.t, k = 1 - A.t / A.max;
      c.save();
      const r = 9 + Math.sin(t * 8) * .8, gr = c.createRadialGradient(fr.x, fr.y, 1, fr.x, fr.y, r + 4);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.7, 'rgba(255,209,234,.35)'); gr.addColorStop(1, 'rgba(255,209,234,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(fr.x, fr.y, r + 4, 0, TAU); c.fill();
      c.strokeStyle = k < .3 ? '#ff6060' : '#ffffff'; c.lineWidth = 1.1; c.beginPath(); c.arc(fr.x, fr.y, r, -Math.PI / 2, -Math.PI / 2 + TAU * k); c.stroke();
      if (!A.latch) { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .6; c.setLineDash([2, 2]); c.beginPath(); c.arc(fr.x, fr.y, 15, t * 2, t * 2 + TAU); c.stroke(); c.setLineDash([]); }
      else if (!(window.ASIDERO_ANIME_ARTE && window.ASIDERO_ANIME_ARTE.activo(f))) { c.strokeStyle = '#ffd1ea'; c.lineWidth = .9; c.beginPath(); c.moveTo(fr.x - 2, fr.y + 4); c.lineTo(p.x - 3, p.y - 14); c.moveTo(fr.x + 2, fr.y + 4); c.lineTo(p.x + 3, p.y - 14); c.stroke(); }
      c.restore();
    },
  };
})();
