'use strict';
// =====================================================================
//  VIDA DE LOS ENEMIGOS
//  No todos caen al primer pisotón: los pesados, los que traen coraza y
//  los que se defienden aguantan más. Al aguantar se quedan sacudidos un
//  momento, y arriba les salen sus corazones para saber cuánto les falta.
//  Las ventajas del mundo (ventajas.js) son solo de los jefes.
// =====================================================================
const VIDA_ENEMIGOS = (() => {
  const { FOE, VIDA, ring } = MEC;
  const TABLA = {
    3: 'guerrero mecha rinoceronte torito',
    2: 'centinela jabali jaguar automata bucanero catrin pirata incendiario perro guardia muneco campana garza pintador mono hormiga alacranMini escorpion topon pavo rover ollita gargola buho zopilote pelicano fragata salamandra culebra babosa diablito grumo abordador contramaestre',
  };
  // a estos no se les puede caer encima: se pasan con el poder de Fresita o esquivándolos
  const NO_SE_PISA = new Set('zancudo bocina carambano aplastador bestia morena magma cometa'.split(' '));
  for (const n in TABLA) for (const k of TABLA[n].split(' ')) if (FOE[k]) FOE[k].vida = +n;
  const vidaDe = k => (FOE[k] && FOE[k].vida) || 1;

  VIDA.prepara = e => { e.hp = e.max = e.vidaFija || vidaDe(e.k); };
  VIDA.golpe = (e, g) => {
    e.hp--; e.aturde = .5; e._golpe = 1; g.shake = Math.max(g.shake || 0, .1);
    spawn(g, 10, e.x, e.y - e.h * .7, { v: 70, life: .45, s: 1.8, k: 'spark', cols: ['#ffffff', '#ffd23f', '#ff7a9a'], g: 80 });
    ring(g, e.x, e.y - e.h * .6, '#ffffff', e.w * .7 + 6, .3);
    // los de la lanza se vuelven a cubrir después de cada golpe: el centinela levanta la lanza y el guerrero vuelve a alzar su escudo
    if (e.k === 'centinela') e.lanza = Math.max(e.lanza || 0, 1.6);
    if (e.k === 'guerrero') e.reescudo = 1.8;
  };
  function corazon(c, x, y, lleno, pix) {
    if (pix) { c.fillStyle = '#2a1420'; c.fillRect(x - 2, y - 2, 5, 3); c.fillRect(x - 1, y + 1, 3, 1); c.fillRect(x, y + 2, 1, 1); c.fillStyle = lleno ? '#ff5d73' : '#6a5a64'; c.fillRect(x - 1, y - 1, 3, 2); c.fillRect(x, y + 1, 1, 1); return; }
    c.beginPath(); c.moveTo(x, y + 2.2); c.bezierCurveTo(x - 3.4, y - .2, x - 1.8, y - 2.4, x, y - .8); c.bezierCurveTo(x + 1.8, y - 2.4, x + 3.4, y - .2, x, y + 2.2); c.closePath();
    c.fillStyle = lleno ? '#ff5d73' : 'rgba(70,60,70,.75)'; c.fill(); c.strokeStyle = 'rgba(40,16,30,.9)'; c.lineWidth = .5; c.stroke();
  }
  // corazones arriba del enemigo; salen de cerca o cuando ya lleva un golpe
  VIDA.dibuja = (c, e, f) => {
    if (e.sub || e.st === 'gone' || !f.g || !f.g.p) return; const p = f.g.p, cerca = Math.abs(p.x - e.x) < 72 && Math.abs(p.y - e.y) < 60;
    if (!(e.max > 1 && (cerca || e.hp < e.max))) return;
    const pix = !!(f.st && f.st.pixel), n = e.max || 1, y = Math.round(e.y - e.h - 6), x0 = e.x - (n - 1) * 2.6;
    c.save();
    if (n > 1) for (let i = 0; i < n; i++) corazon(c, pix ? Math.round(x0 + i * 5.2) : x0 + i * 5.2, y, i < e.hp, pix);
    c.restore();
  };
  // ---------------- para la enciclopedia ----------------
  const iconos = n => { const src = typeof BORDADO !== 'undefined' ? BORDADO.icon('heart', 3) : ''; return `<span class="vidaFicha">${Array.from({ length: n }, () => `<img src="${src}" alt="">`).join('')}</span>`; };
  const golpes = n => n === 1 ? 'un golpe' : `${n} golpes`;
  function texto(k) {
    if (NO_SE_PISA.has(k)) return 'No se le puede caer encima: se esquiva o se pasa con el poder de Fresita.';
    const n = vidaDe(k); return `${iconos(n)} Cae con ${golpes(n)}.`;
  }
  return { vidaDe, texto, iconos, golpes, NO_SE_PISA, sePisa: k => !NO_SE_PISA.has(k) };
})();
