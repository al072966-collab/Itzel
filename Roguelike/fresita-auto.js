'use strict';
// =====================================================================
//  FRESITA AYUDANTE (para jugar con una sola mano en el teléfono)
//  En el teléfono es muy difícil mover a Itzel y, a la vez, apuntar el poder de Fresita. Con esta ayuda Fresita
//  sigue a Itzel sola y usa su poder del mundo en el momento y el lugar donde hace falta: un hueco que no se salta,
//  una pared alta, un bloque de madera, un vidrio para un enemigo, una brasa…  Es la misma lógica con la que el bot
//  de pruebas (pruebas-bot.js) pasa los niveles. Contra los jefes, en la ventana de daño pone su poder sobre el núcleo.
//  Se prende sola en pantallas táctiles; el botón «A» (junto al de pantalla completa) la apaga y la prende.
//  Solo toca a Fresita: los niveles, los poderes y la dificultad son los mismos.
// =====================================================================
(function () {
  if (typeof stepFresita !== 'function') return;
  const LS = 'itzel-fresita-auto';
  const tactil = matchMedia('(pointer:coarse)').matches || /[?&]auto=1/.test(location.search);
  let activa = tactil;
  try { const g = localStorage.getItem(LS); if (g === '1') activa = true; else if (g === '0') activa = false; } catch (e) {}
  window.FRESITA_AUTO = { get activa() { return activa; }, pon(v) { activa = !!v; try { localStorage.setItem(LS, activa ? '1' : '0'); } catch (e) {} pintaBoton(); } };

  const original = stepFresita;
  const click = (g, x, y, b = 0, up) => ({ x: x - g.cam, y, b, up });

  // ---------------- niveles de plataformas: un hueco o una pared que Itzel no pasa sola ----------------
  function ayudaPlataformas(g, m, dt) {
    const p = g.p, def = g.def, pw = def && def.power; if (!def || !pw) return;
    const A = g._auto || (g._auto = { lastPow: -9, best: p.x, bestT: g.t });
    const S = (x, y) => SOLID(x, y);
    const surfAt = (x, y0, y1) => {
      let top = null;
      for (let y = Math.max(0, y0); y <= y1; y += 2) if (S(x, y) && !S(x, y - 2)) { top = y; break; }
      for (const pl of g.plats) if (pl.on) { const a = pl.k === 'seg' ? Math.min(pl.x, pl.x2) : pl.x, b2 = pl.k === 'seg' ? Math.max(pl.x, pl.x2) : pl.x + pl.w; if (x > a + 1 && x < b2 - 1) { const t = pl.k === 'seg' ? pl.y : pl.y; if (top === null || t < top) top = t; } }
      return top;
    };
    if (p.x > A.best + 2) { A.best = p.x; A.bestT = g.t; }
    if (!p.on || p.face < 0) return;
    let wallC = null, wallTop = null;
    for (let k = 0; k <= 4; k++) { const x = p.x + 8 + k * T; if (S(x, p.y - 4)) { let ty = p.y - 4; while (ty > 0 && S(x, ty - 2)) ty -= 2; if (p.y - ty > 3.6 * T) { wallC = Math.floor(x / T); wallTop = ty; } break; } }
    const gapAhead = surfAt(p.x + 12, p.y - 64, p.y + 70) === null;
    let landing = null;
    for (let dx = gapAhead ? 16 : 6; dx <= 92; dx += 4) { const s = surfAt(p.x + dx, p.y - 62, p.y + 64); if (s !== null && !S(p.x + dx, s - 6)) { landing = { x: p.x + dx, y: s }; if (s < p.y - 4 || gapAhead) break; } }
    const blockedWall = wallC !== null && wallC * T - p.x < 3 * T;
    const quiere = Math.abs(p.vx) > 8 || g.t - A.bestT > .6;                 // Itzel va hacia allá o se quedó parada frente al estorbo
    const atorada = g.t - A.bestT > 1.6;
    const necesita = quiere && ((gapAhead && !landing) || blockedWall || atorada);
    if (def.light) { g.fre.x = p.x + 36; g.fre.y = p.y - 18; }
    if (!necesita || g.t - A.lastPow < 1.3) return;
    A.lastPow = g.t; g.fre.cool = 0;
    const wx = wallC !== null ? wallC * T : null, stepTop = wx !== null ? Math.max(wallTop + 36, p.y - 46) : p.y - 4, hx = wx !== null ? wx - 14 : p.x + 56;
    g.fre.x = p.x - 16; g.fre.y = p.y - 26;
    const K = m.clicks, c = (x, y, b, up) => K.push(click(g, x, y, b, up));
    if (pw === 'bloque') { if (wx !== null) { const n = Math.min(3, Math.max(1, Math.ceil((p.y - wallTop - 52) / T))); for (let k = 0; k < n; k++) c(wx - 8, p.y - 8 - k * T); } else { c(p.x + 40, stepTop + 2); c(p.x + 72, p.y - 8); } }
    else if (pw === 'cristal') c(wx !== null ? wx - 8 : p.x + 40, stepTop + 2);
    else if (['nenufar', 'avion', 'nube'].includes(pw)) c(hx - (pw === 'avion' ? 10 : 0), stepTop);
    else if (pw === 'lapiz') { if (wx !== null) { c(wx - 60, stepTop + 14); c(wx - 4, stepTop, 0, true); } else { c(p.x + 14, p.y + 2); c(p.x + 120, p.y - 4, 0, true); } }
    else if (pw === 'asidero') { if (!g.asid) { const hx2 = wx !== null ? wx - 22 : p.x + 52, hy2 = wx !== null ? p.y - 62 : p.y - 44; g.fre.x = hx2; g.fre.y = hy2; c(hx2, hy2); } }
    else if (pw === 'resorte') c(wx !== null ? wx - 28 : p.x + 24, p.y - 4);
    else if (pw === 'semilla') c(wx !== null ? wx - 14 : p.x + 20, p.y - 8);
    else if (pw === 'viento') c(p.x + 4, 20);
    else if (pw === 'remolino') c(p.x + 8, p.y - 24);
    else if (pw === 'rafaga') { g.fre.x = p.x - 22; g.fre.y = p.y + 2; c(p.x, p.y); }
    else if (pw === 'glifo') { const s = g.solids.filter(s => s.k === 'glyph' && s.x > p.x - 20 && s.x < p.x + 220 && (s.on ? s.h > T : true)).sort((a, b) => a.x - b.x)[0]; if (s) c(s.x + 4, s.y + 4); }
    else if (pw === 'gubia') { const s = g.solids.find(s => s.k === 'wood' && s.x > p.x - 4 && s.x < p.x + 60); if (s) c(s.x + 4, s.y + 4); }
    else if (['interruptor', 'pulso', 'luz', 'farol', 'reloj', 'congelar'].includes(pw)) c(p.x, p.y - 30);
    else if (pw === 'portal') { let x = p.x + 20; while ((S(x, p.y - 8) || S(x, p.y - 40)) && x < p.x + 220) x += 6; const s = surfAt(x + 14, 0, VH); g.fre.x = x + 14; g.fre.y = (s ?? p.y) - 22; c(g.fre.x, g.fre.y); }
    else if (pw === 'hackeo') c(p.x + 60, p.y - 10);
    else if (pw === 'ladrillo') { const co = g.coins.filter(q => !q.got && q.x > p.x + 8 && q.x < p.x + 90 && q.y > p.y - 36).sort((a, b) => a.x - b.x)[0]; if (co) c(co.x, co.y); }
    else if (pw === 'vidrio') { const e = g.foes.filter(e => e.st === 'ok').sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; if (e) c(e.x, e.y - e.h / 2); }
    else if (pw === 'agua') { const br = g.objs.find(o => o.k === 'brasas' && o.x0 - 10 < p.x + 70 && o.x1 > p.x); if (br) c(clamp(p.x + 34, br.x0 + 8, br.x1 - 8), br.y - 4); else { const e = g.foes.filter(e => e.fiery && e.st === 'ok').sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; if (e) c(e.x, e.y - 4); } }
  }
  // un enemigo con escudo o fuego, justo adelante, también se duerme con la canción (clic derecho) cuando va a pegarle a Itzel
  function ayudaEnemigos(g, m) {
    const p = g.p, A = g._auto || (g._auto = {}); if (!p.on || (A.cuna || -9) > g.t - 4 || g.fre.cool > 0) return;
    const cerca = g.foes.find(e => (e.st === 'ok' || e.st === 'run' || e.st === 'lunge') && Math.abs(e.x - p.x) < 34 && Math.abs(e.y - p.y) < 22 && (e.spiky && e.spiky(e) || (e.hp > 1 && p.inv <= 0)));
    if (cerca && (g.arrullos === undefined || g.arrullos > 0) && p.inv <= 0) { A.cuna = g.t; m.clicks.push({ x: g.fre.x - g.cam, y: g.fre.y, b: 2 }); }
  }

  // ---------------- jefes: en la ventana de daño, el poder sobre el núcleo ----------------
  function ayudaJefe(g, m) {
    const o = g.boss; if (!o || typeof JEFES_EXT === 'undefined') return;
    const core = JEFES_EXT.core(o), p = g.p;
    if (o.st !== 'ventana') return;
    const A = g._auto || (g._auto = {});
    if ((o.mode === 'control' || o.conLagrima) && !(o.stunT > 0)) {
      if (g.t - (A.jefeT || -9) < .6) return; A.jefeT = g.t; g.fre.cool = 0; g.fre.x = core.x; g.fre.y = core.y; m.clicks.push(click(g, core.x, core.y));
    } else if (o.mode === 'alcance' && !o.conLagrima) { g.fre.x = p.x; g.fre.y = p.y - 12; }
  }

  // ---------------- el gancho: se calcula antes de que Fresita se mueva ----------------
  window.stepFresita = stepFresita = function (g, mouse, dt) {
    if (activa && typeof STATE !== 'undefined' && STATE === 'play' && g && g.p && g.def && !g.modo && !g.win && !g.quieta && !g.demo) {
      const m = { active: false, x: 0, y: 0, clicks: [] };
      try { if (g.isBoss) ayudaJefe(g, m); else { ayudaPlataformas(g, m, dt); ayudaEnemigos(g, m); } } catch (e) { /* la ayuda nunca debe romper la partida */ }
      // el puntero real (si hubo un toque o un clic del jugador) manda sobre la ayuda
      const real = mouse && mouse.clicks && mouse.clicks.length;
      if (!real) { mouse.active = false; mouse.clicks.push(...m.clicks); }
    }
    return original.apply(this, arguments);
  };

  // ---------------- el botón «A» ----------------
  const btn = document.createElement('button'); btn.id = 'btnAuto'; btn.type = 'button'; btn.setAttribute('aria-label', 'Fresita automática');
  const css = document.createElement('style');
  css.textContent = '#btnAuto{position:fixed;right:8px;top:110px;z-index:9998;width:40px;height:40px;border-radius:9px;border:0;padding:0;cursor:pointer;background:rgba(26,18,13,.62);color:#f3e7cf;font:800 13px/1.05 "Alegreya Sans",sans-serif;box-shadow:0 0 0 2px rgba(243,231,207,.55);display:none}'
    + '#btnAuto.on{background:rgba(63,138,74,.85)} @media (pointer:coarse){#btnAuto{display:block}} #btnAuto.siempre{display:block}';
  document.head.appendChild(css);
  function pintaBoton() { btn.innerHTML = 'Fresita<br>' + (activa ? 'auto' : 'manual'); btn.classList.toggle('on', activa); btn.title = activa ? 'Fresita te sigue y usa su poder sola (toca para apagarla)' : 'Fresita la manejas tú (toca para que sea automática)'; }
  btn.addEventListener('click', e => { e.stopPropagation(); window.FRESITA_AUTO.pon(!activa); if (typeof toast === 'function') toast(activa ? 'Fresita te sigue y usa su poder sola' : 'Fresita la manejas tú'); });
  document.body.appendChild(btn); pintaBoton();
  if (/[?&]auto=1/.test(location.search)) btn.classList.add('siempre');
})();
