'use strict';
// =====================================================================
//  DOS JUGADORES EN LA MISMA COMPUTADORA
//  Una persona es Itzel (teclado o primer control) y la otra es Fresita (mouse o segundo control). Se enciende en
//  Menú › Opciones › Jugadores (en la run de presentación ya viene en dos). RUN.jugadores vale 1 o 2.
//  Lo que cambia con dos personas: al terminar un mundo, cada una escoge el siguiente camino. Si escogen distinto,
//  una moneda decide al azar y gana la persona cuya carta salga (se sigue con el nivel que esa persona escogió).
//  · Itzel escoge con ← → (o A D) y Espacio o Enter. Un clic que NO viene del mouse (el botón A del control) también cuenta como Itzel.
//  · Fresita escoge con un clic del mouse.
// =====================================================================
const MULTI = (() => {
  const dos = () => typeof RUN !== 'undefined' && !!RUN && RUN.jugadores === 2;
  const NOM = { itzel: 'Itzel', fresita: 'Fresita' };
  const COLOR = { itzel: ['#c8203a', '#a01a30'], fresita: ['#e85a8a', '#b83a6a'] };
  const sello = q => (typeof stitched === 'function' ? stitched(NOM[q], 3, COLOR[q]) : '');
  function css() {
    if (document.getElementById('multiCss')) return;
    const s = document.createElement('style'); s.id = 'multiCss';
    s.textContent = `.card.foco-itzel{outline:4px solid #c8203a;outline-offset:3px;transform:translateY(-4px) rotate(var(--r,0deg))}
      .card .votos{display:flex;gap:6px;justify-content:center;min-height:22px;margin-top:6px}
      .card .votos img{height:18px;image-rendering:pixelated}
      .voto-ayuda{margin:10px auto 0;max-width:640px;text-align:center;font:600 15px 'Alegreya Sans',sans-serif;color:#f3e7cf}
      .voto-ayuda b{color:#ffd1ea}
      .voto-est{margin:6px auto 0;text-align:center;font:700 17px 'Alegreya Sans',sans-serif;color:#fff6e4;min-height:24px}
      #monedaVoto{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(20,12,8,.72);gap:18px;animation:introIn .3s ease}
      #monedaVoto .moneda{width:150px;height:150px;perspective:700px}
      #monedaVoto .giro{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:monedaGira 2.4s cubic-bezier(.2,.7,.3,1) forwards}
      #monedaVoto .cara{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;border:6px solid #b8860b;box-shadow:inset 0 0 0 4px #f6d365,0 6px 18px rgba(0,0,0,.5);background:radial-gradient(circle at 35% 30%,#fff3b0,#e8b93a 60%,#b8860b)}
      #monedaVoto .cara img{width:104px;image-rendering:pixelated}
      #monedaVoto .atras{transform:rotateY(180deg)}
      @keyframes monedaGira{from{transform:translateY(120px) rotateY(0)}30%{transform:translateY(-90px) rotateY(540deg)}to{transform:translateY(0) rotateY(var(--fin,1800deg))}}
      #monedaVoto .dice{font:700 28px 'Alegreya',serif;color:#fff6e4;text-align:center;max-width:80vw;text-shadow:0 2px 6px #000;min-height:70px}
      #monedaVoto .dice small{display:block;font:600 16px 'Alegreya Sans';letter-spacing:.08em;text-transform:uppercase;color:#ffd1ea}`;
    document.head.appendChild(s);
  }
  let activo = null;   // la votación en curso (para quitar sus teclas si se sale de la pantalla)
  function limpia() { if (activo) { removeEventListener('keydown', activo.teclas, true); removeEventListener('keyup', activo.suelta, true); if (activo.moneda) activo.moneda.remove(); activo = null; } }

  // Elección en dos: cada persona vota una carta; si coinciden se sigue; si no, moneda.
  function vota(cartas, alResolver) {
    css(); limpia();
    const V = { itzel: null, fresita: null }, foco = { i: 0 }, A = activo = { moneda: null };
    const raiz = cartas[0].closest('.ofrenda') || cartas[0].parentElement;
    const ayuda = document.createElement('p'); ayuda.className = 'voto-ayuda';
    ayuda.innerHTML = '<b>Itzel</b>: ← → y Espacio · <b>Fresita</b>: clic con el mouse. Si escogen distinto, decide una moneda.';
    const est = document.createElement('p'); est.className = 'voto-est';
    raiz.appendChild(ayuda); raiz.appendChild(est);
    cartas.forEach(el => { if (!el.querySelector('.votos')) { const v = document.createElement('div'); v.className = 'votos'; el.appendChild(v); } });
    let cerrado = false;
    const pinta = () => {
      cartas.forEach((el, k) => {
        el.classList.toggle('foco-itzel', V.itzel === null && foco.i === k);
        el.querySelector('.votos').innerHTML = ['itzel', 'fresita'].filter(q => V[q] === k).map(q => `<img alt="${NOM[q]}" src="${sello(q)}">`).join('');
      });
      est.textContent = V.itzel === null && V.fresita === null ? '' : V.itzel === null ? 'Fresita ya escogió. Falta Itzel.' : V.fresita === null ? 'Itzel ya escogió. Falta Fresita.' : '';
    };
    const voto = (q, k) => { if (cerrado || V[q] !== null) return; V[q] = k; pinta(); if (V.itzel !== null && V.fresita !== null) resuelve(); };
    function resuelve() {
      cerrado = true; limpia();
      if (V.itzel === V.fresita) { est.textContent = '¡Escogieron lo mismo!'; setTimeout(() => alResolver(V.itzel), 900); return; }
      moneda();
    }
    function moneda() {
      const gana = Math.random() < .5 ? 'itzel' : 'fresita'; MULTI.ultima = { V: { ...V }, gana };
      const m = document.createElement('div'); m.id = 'monedaVoto'; m.setAttribute('role', 'status');
      m.innerHTML = `<div class="moneda"><div class="giro" style="--fin:${gana === 'itzel' ? 1800 : 1980}deg"><div class="cara"><img alt="Itzel" src="${sello('itzel')}"></div><div class="cara atras"><img alt="Fresita" src="${sello('fresita')}"></div></div></div><div class="dice"><small>Escogieron distinto</small>Echamos una moneda…</div>`;
      document.body.appendChild(m);
      setTimeout(() => { const d = m.querySelector('.dice'); if (d) d.innerHTML = `<small>¡Ganó ${NOM[gana]}!</small>Seguimos con su camino`; }, 2500);
      setTimeout(() => { m.remove(); alResolver(V[gana]); }, 4200);
    }
    // Itzel: flechas / A D para mover el foco, Espacio o Enter para escoger
    A.teclas = e => {
      if (cerrado) return;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { foco.i = Math.max(0, foco.i - 1); pinta(); }
      else if (['ArrowRight', 'KeyD'].includes(e.code)) { foco.i = Math.min(cartas.length - 1, foco.i + 1); pinta(); }
      else if (['Space', 'Enter', 'NumpadEnter', 'ArrowDown'].includes(e.code)) voto('itzel', foco.i);
      else return;
      e.preventDefault(); e.stopImmediatePropagation();
    };
    A.suelta = e => { if (!cerrado && ['Space', 'Enter', 'NumpadEnter'].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); } };
    addEventListener('keydown', A.teclas, true); addEventListener('keyup', A.suelta, true);
    // Fresita: el clic del mouse; un clic que no viene del mouse (el botón A del control) es de Itzel
    cartas.forEach((el, k) => { el.onclick = e => { const delMouse = e.isTrusted && e.detail > 0; voto(delMouse ? 'fresita' : 'itzel', k); }; });
    pinta();
  }

  // Elección sencilla con teclado (los regalos): flechas y Espacio, además del clic
  function elige(cartas, alElegir) {
    css(); limpia(); let i = 0, hecho = false; const A = activo = { moneda: null };
    const pinta = () => cartas.forEach((el, k) => el.classList.toggle('foco-itzel', k === i));
    A.teclas = e => {
      if (hecho) return;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) i = Math.max(0, i - 1);
      else if (['ArrowRight', 'KeyD'].includes(e.code)) i = Math.min(cartas.length - 1, i + 1);
      else if (['Space', 'Enter', 'NumpadEnter', 'ArrowDown'].includes(e.code)) { hecho = true; limpia(); alElegir(i); }
      else return;
      pinta(); e.preventDefault(); e.stopImmediatePropagation();
    };
    A.suelta = e => { if (['Space', 'Enter', 'NumpadEnter'].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); } };
    addEventListener('keydown', A.teclas, true); addEventListener('keyup', A.suelta, true); pinta();
  }
  return { dos, vota, elige, limpia, ultima: null, forzar: 0 };   // forzar: 2 cuando se empieza desde «Multijugador»
})();
