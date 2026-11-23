'use strict';
// =====================================================================
//  TARJETA DE INICIO DE NIVEL
//  Antes de empezar cada nivel o jefe el juego se detiene y explica dónde estás, en qué época y qué puede hacer Fresita,
//  con la misma demostración animada que tiene la enciclopedia. No sigue hasta que se pulsa «¡Listo!» (o Enter / espacio),
//  así que da tiempo de analizarla, también al entrar desde la enciclopedia. Se omite en las pruebas
//  (?mudo, ?fijo, ?sinintro, ?fotos).
//  EPOCAS: la época de cada nivel (por id del nivel o del jefe). Lo que no está aquí sale sin época.
//  La demostración es la página de la enciclopedia con ?demo=<poder>&mundo=<estilo> (Estilos/enciclopedia.js): se pide
//  con anticipación en un marco escondido y, si el poder no tiene demostración, la tarjeta sale solo con texto.
// =====================================================================
const INTRO_NIVEL = (() => {
  const EPOCAS = {
    anime: 'Hoy, en el malecón de Campeche',
    planos: 'De 1686 a 1704, cuando se traza y se levanta la muralla',
    bits64: 'Hoy, en la selva que cubrió la ciudad maya del periodo Clásico (hacia 250 a 900 d. C.)',
    pixel: 'Hacia 1685 a 1704, cuando la ciudad se encierra en su muralla',
    campechanidad: '4 de octubre, Día de la Campechanidad',
    fuego: '1685, durante el ataque pirata',
    templo: '1685, durante el ataque pirata',
    hollin: 'Marzo de 1982, erupción del Chichonal',
    paper: 'Hacia 1830, cuando se construye el Puente de los Perros',
    flat: 'El 25 de marzo de 1517, la bahía de la Mala Pelea',
    pirata: 'Siglo XVII, los años de los ataques piratas',
    huracan: 'Octubre de 1995, el huracán Opal',
    ruptura: 'Octubre de 1995, el huracán Opal',
  };
  const LUGARES = { huracan: 'Ciudad de Campeche y la Bahía de Campeche', ruptura: 'Ciudad de Campeche y la Bahía de Campeche', pirata: 'El malecón y la muralla de Campeche' };
  const quita = new Set(['mudo', 'fijo', 'sinintro', 'fotos']);
  // en el teléfono (pantalla táctil) no hay pantalla de ayuda ni demostraciones: Fresita juega sola y los niveles arrancan de una
  const tactilMovil = (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) && !/[?&]ayuda=1/.test(location.search);
  const salta = () => { const q = new URLSearchParams(location.search); return tactilMovil || [...quita].some(k => q.has(k)); };
  const esc = t => String(t == null ? '' : t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  // Símbolos de cada poder; el nenúfar usa además el arte del propio cenote.
  const ICONOS = { paginas:'📜', bloque:'🧱', viento:'🌬️', nenufar:'🪷', avion:'🛩️', nube:'☁️', cristal:'💎', lapiz:'✏️', resorte:'🌀', asidero:'🫴', semilla:'🍃', reloj:'⌛', hackeo:'💻', portal:'🌀', congelar:'❄️', burbuja:'🫧', burbujaFlota:'🫧', cristalFlota:'💎', agua:'💧', aguja:'🪡', antorcha:'🔥', bengala:'🎆', cargar:'🤲', seda:'🕸️', cocinar:'🍲', confetiFresita:'🎉', constelacion:'🌟', eco:'🔊', espadaFresita:'⚔️', estampa:'🖨️', estrellas:'⭐', farol:'🏮', glifo:'🟨', gravedad:'↕️', gubia:'🪵', interruptor:'🔀', jaranear:'🎵', ladrillo:'🧱', luz:'🔆', luzVitral:'🌈', moldear:'🏺', pescar:'🎣', planos:'📐', pulso:'🔲', rafaga:'💨', remolino:'🌪️', tempano:'🧊', torre:'🏰', vidrio:'🔷' };
  const ARTE_PODER = { asidero:'personajes/asidero-anime/fresita.png', bloque:'muralla/bloque.png', nube:'tinta/nube0.png', cristal:'cristal/cristales0.png', resorte:'resortes/resorte0.png', semilla:'estero/hoja-ancha.png', reloj:'relojeria/reloj.png', glifo:'edzna/glifo0.png', gubia:'imprenta-estampas/gubias.png', ladrillo:'campeche-1-1/ladrillo.png', pulso:'neon/bloqueA1.png', vidrio:'catedral/vidrio0.png', luzVitral:'catedral/vidrio0.png', pescar:'fauna/pezRobaloAnzuelo.png', antorcha:'pozo-detalles/antorcha.png' };
  const iconoPoder = (id, mundo) => {
    if (id === 'farol') return `<span class="iconoPoder faroFresita" aria-hidden="true"><svg viewBox="1150 120 850 650"><defs><linearGradient id="luzFaroIcono" x1="0" x2="1"><stop stop-color="#fffbd7" stop-opacity=".95"/><stop offset="1" stop-color="#ffeaa0" stop-opacity=".12"/></linearGradient></defs><image href="assets/personajes/fresita-estilos/bruma.webp" width="1775" height="887"/><path d="M1505 405 L1980 210 L1980 520 Z" fill="url(#luzFaroIcono)"/><path d="M1680 405 L1990 335 L1990 480 Z" fill="url(#luzFaroIcono)"/><circle cx="1505" cy="405" r="19" fill="#fffde7"/><circle cx="1680" cy="405" r="13" fill="#fffde7"/></svg></span>`;
    if (id === 'nenufar') return '<span class="iconoPoder nenufar" aria-hidden="true"><img src="assets/cenote/nenufar0.png" alt=""><img src="assets/cenote/flor-loto.png" alt=""></span>';
    const archivo = id === 'burbujaFlota' && /^[a-z0-9]+$/i.test(mundo || '') ? `piezas-subida/${mundo}/burbuja.png` : ARTE_PODER[id];
    return `<span class="iconoPoder iconoIlustrado" aria-hidden="true"><span>${ICONOS[id] || '✦'}</span>${archivo ? `<img src="assets/${archivo}" alt="">` : ''}</span>`;
  };
  // Fondos originales de cada escenario, reducidos para la cabecera del diario.
  const FONDOS = new Set('pixel ocaso acuarela paper biolum flat sumie neon bruma lowpoly codex oleo vitral cuaderno grabado gameboy anime nouveau deco cyber cinema barro eco fuego agua hielo cielo hollin bits8 bits32 bits64 miniatura cabeza torres chicanna imprenta posadas animas carnaval feria cocina pesca jarana vuelo templo planos abordaje bordado desfile'.split(' '));
  function fondoNivel(info) {
    const id = String(info.nivel || '').replace(/^(subida|bajada)_/, '');
    const mundo = info.poder && info.poder.mundo;
    const clave = FONDOS.has(id) ? id : FONDOS.has(mundo) ? mundo : null;
    return clave ? `assets/intro-fondos/${clave}.webp` : '';
  }
  let el = null, cierra = null, info0 = null;
  const demos = {};
  function css() {
    if (document.getElementById('introNivelCss')) return;
    const s = document.createElement('style'); s.id = 'introNivelCss';
    s.textContent = `#introNivel{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(20,12,8,.62);animation:introIn .35s ease}
      @keyframes introIn{from{opacity:0}to{opacity:1}}
      #introNivel .panel{width:min(560px,94vw);padding:10px 26px 16px;color:#4a2e20;font:500 17px 'Alegreya Sans',sans-serif}
      #introNivel.conDemo .panel{width:min(900px,96vw)}
      #introNivel .cab{text-align:center}
      #introNivel small{display:block;font:700 13px 'Alegreya Sans';letter-spacing:.18em;text-transform:uppercase;color:#8a5a3a}
      #introNivel h2{margin:4px 0 2px;font:700 32px 'Alegreya',serif;color:#3a2218}
      #introNivel .cuerpo{display:grid;grid-template-columns:1fr;gap:16px;margin-top:6px}
      #introNivel.conDemo .cuerpo{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);align-items:center}
      #introNivel .donde{margin:6px 0;font-size:16px}
      #introNivel .donde b{color:#8a2a1c}
      #introNivel .lema{margin:8px 0;font-style:italic;font-family:'Alegreya',serif;font-size:18px}
      #introNivel .poder{margin:10px 0 4px;padding:8px 12px;border:2px dashed #b88a60;border-radius:10px;background:rgba(255,236,200,.55)}
      #introNivel .poder b{display:block;color:#a3203a;font:700 15px 'Alegreya Sans';letter-spacing:.06em;text-transform:uppercase}
      #introNivel .poder{display:flex;gap:11px;align-items:center}
      #introNivel .poderTexto{flex:1;min-width:0}
      #introNivel .iconoPoder{flex:none;position:relative;width:51px;height:51px;display:grid;place-items:center;border-radius:50%;background:#f4e7cd;border:1px solid #d7b991;font-size:30px;line-height:1}
      #introNivel .iconoPoder.nenufar img:first-child{position:absolute;width:45px;bottom:6px;left:3px}
      #introNivel .iconoPoder.nenufar img:last-child{position:absolute;width:24px;top:3px;left:14px}
      #introNivel .faroFresita{overflow:hidden;background:#dce3dc}
      #introNivel .faroFresita svg{width:100%;height:100%;display:block}
      #introNivel .iconoIlustrado img{position:absolute;width:88%;height:88%;object-fit:contain;inset:6%}
      #introNivel .video{position:relative;aspect-ratio:427/240;border:3px solid #8a5a3a;border-radius:8px;overflow:hidden;background:#1a120d;box-shadow:0 4px 14px rgba(0,0,0,.35)}
      #introNivel .video[hidden]{display:none}
      #introNivel .video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}
      #introNivel .video i{position:absolute;left:8px;bottom:6px;z-index:1;font:700 11px 'Alegreya Sans';letter-spacing:.14em;text-transform:uppercase;color:#fff;text-shadow:0 1px 3px #000}
      #introNivel .cargandoDemo{position:absolute;inset:0;display:grid;place-items:center;color:#fff5df;font:700 14px 'Alegreya Sans',sans-serif}
      #introNivel .cargandoDemo[hidden]{display:none}
      .playIntroDemo{position:fixed;z-index:62;transform:translate(-50%,-50%);width:58px;height:58px;border:2px solid #fff4d4;border-radius:50%;background:#792638e8;color:#fff8e7;font-size:25px;cursor:pointer;box-shadow:0 3px 12px #0008}
      .playIntroDemo:hover{background:#ad3047}
      #introNivel .listo{display:block;margin:14px auto 0;padding:9px 34px;border:0;border-radius:999px;background:#a3203a;color:#fff6e4;font:700 18px 'Alegreya Sans',sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;box-shadow:0 3px 0 #6c1425}
      #introNivel .listo:hover{background:#bb2a47}
      #introNivel .seguir{margin-top:8px;text-align:center;font:600 12px 'Alegreya Sans';letter-spacing:.1em;text-transform:uppercase;color:#8a5a3a}
      #introNivel.diario .panel{position:relative;box-sizing:border-box;max-height:94vh;overflow:auto;padding:25px 34px 22px 60px;border:4px solid #633524;border-radius:14px;color:#4a2e20;background:repeating-linear-gradient(0deg,transparent 0 5px,rgba(153,110,67,.035) 5px 6px),linear-gradient(90deg,rgba(145,43,48,.1),transparent 12%),#f6e9cd;box-shadow:0 7px 0 #432016,0 14px 35px #160b08aa,inset 0 0 0 3px #d0ad76,inset 0 0 0 6px #f7e9ca}
      #introNivel.diario .panel:before{content:'';position:absolute;left:14px;top:10px;bottom:10px;width:25px;border-left:3px solid #862637;border-right:3px solid #862637;background:repeating-linear-gradient(45deg,#287f80 0 3px,#efd089 3px 6px,#bd3440 6px 9px,#f6e9cd 9px 12px)}
      #introNivel.diario .cab{text-align:left;min-height:85px;padding-right:35%;position:relative}
      #introNivel.diario .cab .vistaMundo{position:absolute;right:0;top:0;width:34%;height:85px;object-fit:cover;mask-image:linear-gradient(90deg,transparent,#000 30%);-webkit-mask-image:linear-gradient(90deg,transparent,#000 30%);pointer-events:none}
      #introNivel.diario h2{font-size:34px;line-height:1.05;max-width:550px;color:#4c261b}
      #introNivel.diario small{color:#a12537;letter-spacing:.13em}
      #introNivel.diario .cuerpo{gap:22px;margin-top:14px}
      #introNivel.diario .donde{display:inline-block;padding:6px 10px;background:#fff9e9;border:1px solid #d4b78a;border-radius:7px}
      #introNivel.diario .lema{line-height:1.25}
      #introNivel.diario .poder{border-color:#b22d42;background:#fff8e9;padding:12px 14px}
      #introNivel.diario .donde:before{content:'◆';color:#a71e36;margin-right:6px}
      #introNivel.diario .cab small:before,#introNivel.diario .cab small:after{content:' ✿ ';color:#aa2638}
      #introNivel.diario .poder .iconoPoder{background:#edf4e2;border-color:#9aac82}
      #introNivel.diario.cenote .panel:after{content:'';position:absolute;right:15px;bottom:12px;width:52px;height:38px;opacity:.8;background:url('assets/cenote/flor-loto.png') center/contain no-repeat;pointer-events:none}
      #introNivel.diario .video{border:4px solid #edddbd;outline:2px solid #a84442;box-shadow:0 4px 12px #4a261b55}
      #introNivel.diario .listo{background:#a71e36;border:2px solid #e5b875;box-shadow:0 3px 0 #632231}
      #introNivel.diario .seguir{font-size:11px}
      @media (max-width:720px){#introNivel.diario .panel{padding:18px 18px 18px 48px}#introNivel.diario .cab{padding-right:0;background:none}#introNivel.diario .cab .vistaMundo{position:relative;display:block;width:100%;height:55px;margin-top:6px}#introNivel.diario.cenote .cab .vistaMundo{display:block}#introNivel.diario h2{font-size:27px}}
      @media (max-width:720px){#introNivel.conDemo .cuerpo{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  // Calentamiento: cuando el juego ya cargó, se abre escondida la página que hospeda las demostraciones (mismos scripts) y se cierra a los pocos segundos.
  // Así el navegador ya tiene todo bajado y compilado cuando el primer video lo necesita.
  if (!salta()) addEventListener('load', () => setTimeout(() => {
    if (document.getElementById('calientaDemos')) return;
    const fr = document.createElement('iframe'); fr.id = 'calientaDemos'; fr.title = ''; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:0;top:0;width:320px;height:200px;border:0;opacity:0;pointer-events:none;z-index:-1';
    fr.src = '../Estilos/index.html?v=demo-hojas-1&calienta=1'; document.body.appendChild(fr);
    fr.addEventListener('load', () => setTimeout(() => fr.remove(), 4000));
    setTimeout(() => { if (fr.isConnected) fr.remove(); }, 25000);
  }, 2500));
  // la demostración se pide con anticipación, mientras se arma el nivel
  function precarga(poder, mundo, nivel) {
    if (!poder || salta()) return null; const k = poder + '|' + mundo + '|' + (nivel || ''); if (demos[k]) return k;
    const fr = document.createElement('iframe'); fr.title = 'Demostración del poder'; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:0;top:0;width:640px;height:360px;border:0;opacity:0;pointer-events:none;z-index:-1';
    fr.src = `../Estilos/index.html?v=demo-hojas-1&demo=${encodeURIComponent(poder)}&mundo=${encodeURIComponent(mundo)}&nivel=${encodeURIComponent(nivel || '')}`;
    document.body.appendChild(fr); const d = demos[k] = { fr, ok: null };
    // Si el navegador retrasa la señal de la escena, no dejar el recuadro esperando para siempre.
    fr.addEventListener('load', () => { d.respaldo = setTimeout(() => { if (demos[k] === d && d.ok === null) { d.ok = true; ponDemo(); } }, 3500); });
    return k;
  }
  // espera a que la demostración pedida esté lista (o haya fallado, o pase el tiempo máximo)
  function espera(k, ms) {
    return new Promise(res => {
      if (!k) return res();
      const t0 = performance.now(), iv = setInterval(() => { const d = demos[k]; if (!d || d.ok !== null || performance.now() - t0 > ms) { clearInterval(iv); res(); } }, 60);
    });
  }
  // una demostración pedida por adelantado que al final no se usa (la otra opción del camino): se quita para no gastar
  function descarta(poder, mundo, nivel) {
    const k = poder + '|' + mundo + '|' + (nivel || ''), d = demos[k]; if (!d || d.mostrando || (info0 && info0.demoClave === k)) return;
    clearTimeout(d.respaldo); if (d.play) d.play.remove(); d.fr.remove(); delete demos[k];
  }
  addEventListener('message', e => {
    const m = e.data; if (!m || !m.introDemo) return;
    for (const k in demos) if (demos[k].fr.contentWindow === e.source) { const d = demos[k]; clearTimeout(d.respaldo); d.ok = m.introDemo === 'si'; if (!d.ok) { d.fr.remove(); if (d.play) d.play.remove(); d.mostrando = false; cancelAnimationFrame(d.raf); delete demos[k]; if (el && info0 && info0.demoClave === k) { el.querySelector('.video').hidden = true; el.classList.remove('conDemo'); } } else ponDemo(); }
  });
  function ponDemo() {
    if (!el || !info0 || !info0.demoClave) return; const d = demos[info0.demoClave], caja = el.querySelector('.video');
    if (!d || !caja) return;
    caja.hidden = false; el.classList.add('conDemo');
    if (d.ok !== true || d.mostrando) return;
    d.mostrando = true; caja.querySelector('.cargandoDemo').hidden = true;
    const play = document.createElement('button'); play.className = 'playIntroDemo'; play.type = 'button'; play.textContent = '▶'; play.setAttribute('aria-label', 'Reproducir demostración'); document.body.appendChild(play); d.play = play;
    const ubica = () => {
      if (!el || !d.mostrando) return;
      const r = caja.getBoundingClientRect(), borde = caja.clientLeft;
      Object.assign(d.fr.style, { left: (r.left + borde) + 'px', top: (r.top + borde) + 'px', width: caja.clientWidth + 'px', height: caja.clientHeight + 'px', opacity: '1', zIndex: '61' });
      play.style.left = (r.left + r.width / 2) + 'px'; play.style.top = (r.top + r.height / 2) + 'px';
      d.raf = requestAnimationFrame(ubica);
    };
    ubica();
    play.onclick = () => { d.fr.contentWindow.postMessage({ controlDemo: 'reproducir' }, '*'); play.hidden = true; };
    // arranca sola, sin tener que darle clic
    play.hidden = true; setTimeout(() => { try { d.fr.contentWindow.postMessage({ controlDemo: 'reproducir' }, '*'); } catch (x) { play.hidden = false; } }, 250);
  }
  // info = { etiqueta, titulo, lugar, epoca, lema, poder:{nombre, ayuda, id, mundo} }
  function mostrar(info, alSeguir) {
    if (salta()) return false;
    css(); quitar(); info0 = info;
    info.demoClave = info.poder && info.poder.id ? precarga(info.poder.id, info.poder.mundo, info.nivel) : null;
    el = document.createElement('div'); el.id = 'introNivel'; el.setAttribute('role', 'dialog');
    el.classList.add('diario');
    if (info.poder && info.poder.mundo === 'acuarela' && /cenotes de Miguel Colorado/i.test(info.titulo || '')) el.classList.add('cenote');
    el.innerHTML = `<div class="panel"><div class="cab"><small>${esc(info.etiqueta)}</small><h2>${esc(info.titulo)}</h2><img class="vistaMundo" alt="" aria-hidden="true" hidden></div><div class="cuerpo"><div class="txt">`
      + (info.lugar ? `<div class="donde"><b>Dónde:</b> ${esc(info.lugar)}</div>` : '')
      + (info.epoca ? `<div class="donde"><b>Época:</b> ${esc(info.epoca)}</div>` : '')
      + (info.lema ? `<div class="lema">${esc(info.lema)}</div>` : '')
      + (info.poder && !matchMedia('(pointer:coarse)').matches ? `<div class="poder">${iconoPoder(info.poder.id, info.poder.mundo)}<div class="poderTexto"><b>Poder de Fresita: ${esc(info.poder.nombre)}</b>${esc(info.poder.ayuda)}</div></div>` : '')
      + `</div><div class="video" hidden><i>${info.vistaNivel ? 'Vista del nivel' : 'Así se usa'}</i><span class="cargandoDemo">Preparando demostración…</span></div></div>`
      + `<button class="listo" type="button">¡Vamos!</button><div class="seguir">Tómate tu tiempo · Enter o espacio también sirven</div></div>`;
    document.body.appendChild(el);
    for (const img of el.querySelectorAll('.iconoIlustrado img')) {
      const listo = () => { if (img.naturalWidth) img.previousElementSibling.hidden = true; else img.hidden = true; };
      if (img.complete) listo(); else { img.addEventListener('load', listo, { once:true }); img.addEventListener('error', listo, { once:true }); }
    }
    const vista = el.querySelector('.vistaMundo'), fondo = fondoNivel(info);
    if (vista && fondo) { vista.src = fondo; vista.hidden = false; vista.onerror = () => { vista.hidden = true; }; }
    STATE = 'intro';
    const sigue = () => { if (!el) return; quitar(); alSeguir(); };
    cierra = sigue; el.querySelector('.listo').onclick = e => { e.stopPropagation(); sigue(); };
    addEventListener('keydown', teclas, true); ponDemo();
    return true;
  }
  const teclas = e => { if (!el) return; if (e.target.classList && e.target.classList.contains('playIntroDemo')) { e.stopPropagation(); return; } if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') { e.preventDefault(); e.stopImmediatePropagation(); cierra && cierra(); } else e.stopImmediatePropagation(); };
  function quitar() {
    removeEventListener('keydown', teclas, true);
    if (el) { const k = info0 && info0.demoClave, d = k && demos[k]; if (d) { d.mostrando = false; clearTimeout(d.respaldo); cancelAnimationFrame(d.raf); if (d.play) d.play.remove(); d.fr.remove(); delete demos[k]; } el.remove(); el = null; } cierra = null;
  }
  const epoca = id => EPOCAS[id] || '';
  return { mostrar, precarga, espera, descarta, epoca, EPOCAS, lugar: id => LUGARES[id] || '' };
})();
