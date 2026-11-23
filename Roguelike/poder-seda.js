'use strict';
// =====================================================================
//  HILO DE SEDA (poder de Calakmul en miniatura)
//  A la escala de un bicho, el hilo de una araña aguanta a Itzel. Se mantiene
//  el clic sobre una ramita (o cualquier hoja o piedra que quede arriba):
//  Fresita vuela allá, amarra un hilo de seda dorada e Itzel se columpia.
//  ← → la impulsan, ↑ ↓ suben o bajan por el hilo, y al saltar (o soltar el
//  clic) sale disparada con todo el vuelo del columpio.
//  Lo inspira la araña de seda dorada (Trichonephila clavipes) de las selvas
//  del sureste: su telaraña brilla amarilla al sol.
//  Pedido de David (2026-11-19): el poder de Calakmul era «Cargar», igual al
//  de la selva de 64 bits y copiado de Owlboy, y el nivel se pasaba sin usarlo.
//  Estado: g.seda = { ax, ay, len, w, t, quieto }
// =====================================================================
(() => {
  const { POW, OBJ, ring, tx, tl } = MEC;
  const ALCANCE = 150, MINL = 22, MAXL = 150, MANOS = 14;
  const tecla = k => typeof KEYS !== 'undefined' && KEYS.has(k);
  const ORO = '#f2cf5a', ORO2 = '#fff3b0';

  // dónde se puede amarrar: una ramita cerca del clic, o algo sólido (tierra, hoja, piedra) justo ahí
  function anclaEn(g, x, y, radio = 48, sinRama = null) {
    const r = g.objs.filter(o => o.k === 'ramita' && o !== sinRama).map(o => ({ o, d: Math.hypot(o.x - x, o.y - y) })).sort((a, b) => a.d - b.d)[0];
    if (r && r.d < radio) return { x: r.o.x, y: r.o.y, rama: r.o };   // un poco más generoso al apuntar
    if (SOLID(x, y)) return { x, y: borde(x, y, 'abajo') };
    for (const pl of g.plats) if (pl.on !== false && x >= pl.x && x <= pl.x + pl.w && y >= pl.y - 4 && y <= pl.y + 12) return { x, y: pl.y + 6, plat: pl };
    return null;
  }
  function suelta(g, salto) {
    const S = g.seda; if (!S) return; const p = g.p;
    const th = Math.atan2(p.x - S.ax, p.y - MANOS - S.ay), v = S.w * S.len;
    p.vx = clamp(Math.cos(th) * v * 1.12, -330, 330); p.vy = clamp(-Math.sin(th) * v * 1.12, -360, 300);
    if (salto) { p.vx = clamp(p.vx * 1.25, -400, 400); p.vy = Math.min(p.vy, 0) - 190; p.sq = -.25; spawn(g, 10, p.x, p.y - 10, { v: 70, life: .45, s: 1.8, k: 'spark', cols: [ORO, ORO2, '#ffffff'], g: 40 }); }
    if (Math.abs(p.vx) > 20) p.face = Math.sign(p.vx);
    p.boost = .3; p.noCut = true; p.jb = 0;
    g.seda = null; g.fre.cool = .35; g.sedaSuelta = true;   // ese mismo cuadro la tecla no debe contar además como salto normal (borraba el impulso)
  }
  MEC.sedaSuelta = suelta;
  // si le pegan, Itzel se suelta del hilo (igual que de Fresita sólida)
  GANCHOS.en('cambiaDiseno', previo => function (g) { const r = previo.apply(this, arguments); if (g && g.seda) suelta(g, false); return r; });

  POW.seda = { name: 'Hilo de seda', cd: .2,
    help: 'Clic en una ramita (o una hoja o piedra arriba de Itzel): Fresita lanza un hilo de seda y Itzel queda colgada, sin tener que mantener el clic. Con otro clic en otra ramita cambias de hilo; ← → para impulsarse, ↑ ↓ para subir o bajar por el hilo; Espacio para salir volando.',
    click(g, x, y, c) {
      if (c.up) { if (g.seda) { suelta(g, false); return true; } return false; }
      // con el hilo puesto, un clic en otra ramita lo cambia al vuelo: se encadenan los columpios sin soltar la velocidad
      const colgada = !!g.seda, p = g.p; let a = null;
      a = colgada ? anclaEn(g, x, y, 90, g.seda.rama) : anclaEn(g, x, y); if (!a) return false;
      const hy = p.y - MANOS, d = Math.hypot(p.x - a.x, hy - a.y);
      if (colgada && !(a.y > hy - 10 || d > ALCANCE)) { suelta(g, false); g.fre.cool = 0; }   // suelta el primer hilo y cuelga del segundo (solo si el segundo sí alcanza)
      if (a.y > hy - 10 || d > ALCANCE) { if (typeof toast === 'function' && !g.avisoSeda) { g.avisoSeda = 1; toast('El hilo no alcanza: amárralo más cerca y arriba de Itzel', 2200); } return false; }
      // desde el piso el hilo se tensa lo justo para que el arco no roce la tierra: el primer tirón la levanta
      const th = Math.atan2(p.x - a.x, hy - a.y), libre = p.on ? (hy - a.y) - 4 : MAXL, len = clamp(Math.min(d, libre), MINL, MAXL);
      // la velocidad que traía Itzel se vuelve vuelo del columpio
      const w = (p.vx * Math.cos(th) - p.vy * Math.sin(th)) / len;
      g.seda = { ax: a.x, ay: a.y, len, w, t: 0, rama: a.rama || null, tira: 0, lanza: .32 };   // el hilo tarda un momento en llegar: te da tiempo de ver adónde va
      if (!g.objs.some(o => o.k === 'sedaHilo')) g.objs.push({ k: 'sedaHilo' });
      ring(g, a.x, a.y, ORO2, 14, .35); spawn(g, 8, a.x, a.y, { v: 40, life: .4, s: 1.4, k: 'spark', cols: [ORO, ORO2] });
      if (typeof SONIDO !== 'undefined' && SONIDO.fx) try { SONIDO.fx('poder'); } catch (e) { /* sin sonido */ }
      return true;
    } };

  OBJ.sedaHilo = {
    front: true,
    env(o, g, e) { if (g.seda && !(g.seda.lanza > 0)) e.grav = .02; },
    step(o, g, dt) {
      const S = g.seda; if (!S) { o.dead = true; return; }
      const p = g.p, fr = g.fre, inp = g.inp || {};
      if (g.win || p.dead) { g.seda = null; return; }
      S.t += dt;
      if (S.lanza > 0) {
        S.lanza -= dt; fr.objX = S.ax; fr.objY = S.ay - 4; fr.x += (S.ax - fr.x) * Math.min(1, dt * 14); fr.y += (S.ay - 4 - fr.y) * Math.min(1, dt * 14);
        if (S.lanza > 0) return;
        fr.objX = fr.x; fr.objY = fr.y;   // termina de lanzar el hilo y queda libre
        const hy = p.y - MANOS, d = Math.hypot(p.x - S.ax, hy - S.ay), th0 = Math.atan2(p.x - S.ax, hy - S.ay), libre = p.on ? (hy - S.ay) - 4 : MAXL;
        S.len = clamp(Math.min(d, libre), MINL, MAXL); S.w = (p.vx * Math.cos(th0) - p.vy * Math.sin(th0)) / S.len * .85;   // engancha con un tirón más suave
        if (d > ALCANCE + 40) { g.seda = null; g.fre.cool = .35; return; }                  // se alejó demasiado mientras llegaba el hilo
      }
      // Fresita ya no se queda atada al amarre: se mueve libre con el mouse (el hilo está sujeto a la ramita, no a ella)
      // si una pared detuvo el columpio, el vuelo rebota en vez de empujar contra ella
      if (S.meta && Math.hypot(p.x - S.meta.x, p.y - S.meta.y) > 3) S.w *= -.3;
      let th = Math.atan2(p.x - S.ax, p.y - MANOS - S.ay);
      // subir y bajar por el hilo
      if (tecla('ArrowUp') || tecla('KeyW')) S.len = Math.max(MINL, S.len - 70 * dt);
      if (tecla('ArrowDown') || tecla('KeyS')) S.len = Math.min(MAXL, S.len + 70 * dt);
      // gravedad del péndulo, impulso con flechas y un poco de roce
      const d = g.inp ? (inp.dir || 0) : (g.mando ? g.mando.dir || 0 : 0);   // en los videos de la enciclopedia el guion maneja a Itzel con g.mando
      S.w += (-900 / S.len * Math.sin(th)) * dt + d * 3.4 * dt * (Math.cos(th) > .2 ? 1 : .3);
      S.w *= Math.pow(.86, dt);
      S.w = clamp(S.w, -7, 7);
      th = clamp(th + S.w * dt, -1.75, 1.75);
      const tx = S.ax + Math.sin(th) * S.len, ty = S.ay + Math.cos(th) * S.len + MANOS;
      p.vx = clamp((tx - p.x) / dt, -420, 420); p.vy = clamp((ty - p.y) / dt, -420, 420);
      p.on = false; p.plat = null; p.boost = .05; p.noCut = true; p.dash = 0; if (Math.abs(S.w) > .4) p.face = Math.sign(Math.cos(th) * S.w) || p.face;
      S.meta = { x: p.x + p.vx * dt, y: p.y + p.vy * dt };
      // salir volando: solo con Espacio (o Z); ↑ y W suben por el hilo y antes lo rompían
      const esp = tecla('Space') || tecla('KeyZ');
      if (S.esp === undefined) S.esp = esp;
      if (g.inp ? (esp && !S.esp) : (S.t > .1 && p.jb > 0)) { S.esp = esp; suelta(g, true); return; }
      S.esp = esp;
    },
    draw(c, o, f) {
      const g = f.g, S = g.seda; if (!S) return; const p = g.p, t = f.t;
      const hx = p.x, hy = p.y - MANOS;
      c.save();
      if (S.lanza > 0) {   // el hilo viaja de Fresita a la ramita
        const u = 1 - S.lanza / .32, ex = hx + (S.ax - hx) * u, ey = hy + (S.ay - hy) * u;
        c.lineCap = 'round'; c.strokeStyle = ORO; c.lineWidth = .8; c.globalAlpha = .9; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
        c.fillStyle = ORO2; c.beginPath(); c.arc(ex, ey, 1.6, 0, TAU); c.fill(); c.restore(); return;
      }
      // el hilo: un trazo dorado que brilla al sol, con un destello que corre por él
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(60,40,10,.35)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(S.ax, S.ay); c.lineTo(hx, hy); c.stroke();
      c.strokeStyle = ORO; c.lineWidth = .8; c.beginPath(); c.moveTo(S.ax, S.ay); c.lineTo(hx, hy); c.stroke();
      const u = (t * 1.6) % 1, gx = S.ax + (hx - S.ax) * u, gy = S.ay + (hy - S.ay) * u;
      c.fillStyle = ORO2; c.globalAlpha = .9; c.beginPath(); c.arc(gx, gy, 1.1, 0, TAU); c.fill(); c.globalAlpha = 1;
      // el nudo en el amarre
      c.fillStyle = ORO; c.beginPath(); c.arc(S.ax, S.ay, 1.6, 0, TAU); c.fill();
      c.strokeStyle = ORO2; c.lineWidth = .5; c.beginPath(); c.arc(S.ax, S.ay, 2.6 + Math.sin(t * 6) * .4, 0, TAU); c.stroke();
      c.restore();
    },
  };

  // ---------------- la ramita para amarrar ----------------
  // Una ramita cruzada entre dos briznas de pasto, en lo alto. No es piso: solo sirve de amarre.
  const RAMA = new Image(); RAMA.decoding = 'async'; RAMA.src = '../Roguelike/assets/macro-detalles/rama-macro-v1.png';
  OBJ.ramita = {
    make(g, en) { g.objs.push({ k: 'ramita', x: tx(en.x) + 8, y: tl(en.y) + 8, largo: en.largo || 34, i: en.x }); },
    draw(c, o, f) {
      const g = f.g, p = g.p, t = f.t, sw = Math.sin(t * 1.3 + o.i) * .6;
      const cerca = !g.seda && Math.hypot(p.x - o.x, p.y - MANOS - o.y) < ALCANCE && o.y < p.y - MANOS - 10;
      c.save();
      // las dos briznas de pasto que la sostienen, desde el fondo del barranco: anchas abajo, finas arriba, con una hoja de lado
      for (const s of [-1, 1]) {
        const bx = o.x + s * (o.largo / 2 - 3), x0 = bx + s * 7, y0 = o.y + 240, xm = bx + s * 3, ym = o.y + 100, x1 = bx + sw, y1 = o.y - 7;
        c.fillStyle = s < 0 ? '#3c5826' : '#466a2c';
        c.beginPath(); c.moveTo(x0 - 3, y0); c.quadraticCurveTo(xm - 2.2, ym, x1 - .5, y1); c.lineTo(x1 + .7, y1 + 1); c.quadraticCurveTo(xm + 2.2, ym, x0 + 3, y0); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(214,236,150,.45)'; c.lineWidth = .5; c.beginPath(); c.moveTo(x0 - .8, y0); c.quadraticCurveTo(xm - .6, ym, x1, y1 + 2); c.stroke();
        // una hoja que se abre de la brizna
        const hy = o.y + 46 + (s > 0 ? 22 : 0), hx = bx + s * 4;
        c.fillStyle = '#4f7a30'; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + s * 12, hy - 14, hx + s * 20 + sw, hy - 26); c.quadraticCurveTo(hx + s * 8, hy - 8, hx, hy + 5); c.closePath(); c.fill();
      }
      // la ramita
      if (RAMA.complete && RAMA.naturalWidth) { c.imageSmoothingEnabled = true; c.drawImage(RAMA, 68, 295, 2037, 198, o.x - o.largo / 2 + sw, o.y - 3, o.largo, 5.5); }
      else { c.strokeStyle = '#4a3018'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(o.x - o.largo / 2 + sw, o.y); c.lineTo(o.x + o.largo / 2 + sw, o.y - 1); c.stroke(); }
      // un hilito de telaraña que cuelga y brilla cuando Itzel está a su alcance
      c.strokeStyle = cerca ? ORO2 : 'rgba(255,243,176,.45)'; c.lineWidth = cerca ? .7 : .45;
      c.beginPath(); c.moveTo(o.x + sw, o.y); c.lineTo(o.x + sw + Math.sin(t * 2 + o.i) * 1.5, o.y + 9); c.stroke();
      if (cerca) { c.globalAlpha = .55 + Math.sin(t * 6) * .25; c.strokeStyle = ORO2; c.lineWidth = .7; c.setLineDash([1.5, 2]); c.beginPath(); c.arc(o.x + sw, o.y, 9, 0, TAU); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; }
      c.restore();
    },
  };

  // en las peleas de jefe, la seda también es poder de alcance y su arena trae ramitas sobre los huecos
  if (typeof PODER_ALCANCE !== 'undefined') PODER_ALCANCE.add('seda');
  if (window.ARENAS) window.ARENAS.seda = b => {
    b.g(0, 0, 0).g(27, 27, 0);
    for (let x = 1; x <= 26; x++) if (!(x >= 7 && x <= 11) && !(x >= 16 && x <= 20)) b.g(x, x);
    return b.o('ramita', 9, 4).o('ramita', 18, 4).o('ramita', 13, 2, { largo: 40 });
  };
})();
