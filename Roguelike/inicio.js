'use strict';
// Apertura del juego, en este orden: logo de GDevelop → logo de la empresa (Sphynx) → cinemática 1 («La tarde que se
// rompió el cielo») → pantalla de inicio («Presiona Start») → menú del juego. Al darle a Jugar salen los controles y
// «¡A jugar!» manda directo al primer mundo (ver cine-entrada.js).
// No sale cuando se entra a un mundo concreto (enciclopedia, GDevelop) ni en las pruebas (?mudo, ?fijo, ?fotos…).
(() => {
  const q = new URLSearchParams(location.search);
  if (q.has('propuesta')) window.presentacionPropuesta = true;
  // Mientras se depura la apertura (logos, cinemática 1 y portada) está escondida: se entra directo al menú del juego.
  // Para volver a verla: poner APERTURA_VISIBLE en true, o abrir el juego con ?intro=1.
  const APERTURA_VISIBLE = !!window.MODO_PUBLICO;   // visible en el sitio publicado; en local, con ?intro=1
  // «Itzel final» (GDevelop) muestra su logo de GDevelop mientras este juego carga escondido en un marco (?gdapertura=1);
  // aquí la apertura sigue desde el logo de la empresa, en cuanto GDevelop avise (mensaje «inicia»)
  const desdeGD = q.has('gdapertura');
  if (!desdeGD && !APERTURA_VISIBLE && !q.has('intro')) return;
  if (['propuesta', 'jugar', 'gd', 'mundo', 'nivel', 'jefe', 'fotos', 'mudo', 'fijo', 'sinintro'].some(k => q.has(k))) return;
  window.enApertura = true;
  const style = document.createElement('style');
  style.textContent = `
    body.presentando-inicio #screen { visibility:hidden; }
    #apertura { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; overflow:hidden; background:#000; color:#fff; }
    #apertura .marca { display:block; max-width:min(78vw,760px); max-height:72vh; object-fit:contain; animation:entrada-marca 4.3s ease-in-out both; }
    #apertura.entrada-itzel { background:radial-gradient(ellipse at center,transparent 25%,rgba(120,70,40,.25) 100%), var(--manta) repeat; background-size:auto, 8px 8px; color:#583b2b; }
    #apertura .portada { --logo:min(58vw,440px); display:flex; flex-direction:column; align-items:center; text-align:center; padding:32px; z-index:1; }
    #apertura .bordado-area { width:var(--logo); }
    #apertura .bordado-area .logo { width:var(--logo); filter:drop-shadow(0 3px 1px #744a332c); }
    #apertura .flores { position:absolute; width:clamp(90px,19vw,220px); display:flex; justify-content:space-between; gap:3px; pointer-events:none; }
    #apertura .flores img { width:18%; height:auto; filter:drop-shadow(0 2px 1px #7f583944); }
    #apertura .flores.si { top:7%; left:5%; } #apertura .flores.sd { top:7%; right:5%; transform:scaleX(-1); }
    #apertura .flores.ii { bottom:7%; left:5%; transform:scaleY(-1); } #apertura .flores.id { bottom:7%; right:5%; transform:scale(-1); }
    #apertura .lema { color:#6a4434; font:italic bold clamp(15px,2vw,20px) Georgia,serif; margin:20px 0 36px; }
    #apertura .continuar { cursor:pointer; border:0; background:none; color:#8b3e35; font:bold clamp(16px,2vw,20px) Georgia,serif; padding:10px 18px; animation:latido-inicio 2s ease-in-out infinite; }
    #apertura .continuar:hover, #apertura .continuar:focus-visible { color:#c8203a; }
    @keyframes latido-inicio { 50% { opacity:.55; } }
    @media (prefers-reduced-motion:reduce) { #apertura .continuar { animation:none; } }
    /* el logo (blanco sobre negro) sale de lo negro hasta su blanco y regresa */
    @keyframes entrada-marca { 0%{opacity:0;filter:brightness(0)} 35%,65%{opacity:1;filter:brightness(1)} 100%{opacity:0;filter:brightness(0)} }
  `;
  document.head.appendChild(style);
  const capa = document.createElement('div');
  document.body.classList.add('presentando-inicio');
  capa.id = 'apertura'; capa.setAttribute('aria-label', 'Presentación de Itzel');
  document.body.appendChild(capa);
  let fase = desdeGD ? 1 : 0, temporizador;
  // cada logo dura lo que su sonido (gdevelop 2seg.mp3 y sphynx 2seg.mp3): ms que se queda en pantalla
  const marcas = [ ['assets/inicio/gdevelop.png', 'GDevelop', 4300], ['assets/inicio/sphynx.png', 'Sphynx', 7900] ];
  let etapa = 'logos'; // logos → cine → portada
  // mientras el juego carga, la página se congela por ratos y la subida del logo se salta; se espera a que haya 8 cuadros seguidos fluidos (máx. 8 s)
  function esperaQuieto(sigue) {
    let ant = performance.now(), buenos = 0; const limite = ant + 8000;
    (function cuadro(t) { buenos = t - ant < 40 ? buenos + 1 : 0; ant = t;
      if (buenos >= 8 || t > limite) sigue(); else requestAnimationFrame(cuadro); })(ant);
  }
  function mostrar() {
    clearTimeout(temporizador);
    if (fase < marcas.length) {
      const img = document.createElement('img'); img.className = 'marca';
      [img.src, img.alt] = marcas[fase]; img.style.animationDuration = marcas[fase][2] + 'ms'; capa.replaceChildren(img);
      // la animación y el sonido arrancan cuando la imagen ya está lista; si no, el inicio de la subida se pierde mientras carga
      img.style.animationPlayState = 'paused'; const f = fase;
      const arranca = () => { if (fase !== f || etapa !== 'logos') return; esperaQuieto(() => {
        if (fase !== f || etapa !== 'logos') return; img.style.animationPlayState = 'running';
        if (window.AUDIO_ARCHIVOS) AUDIO_ARCHIVOS.apertura(f === 0 ? 'gdevelop 2seg.mp3' : 'sphynx 2seg.mp3');
        temporizador = setTimeout(() => { fase++; mostrar(); }, marcas[f][2]); }); };
      (img.decode ? img.decode() : Promise.resolve()).then(arranca, arranca);
      return;
    }
    if (etapa === 'logos') { cinematica(); return; }
    capa.classList.add('entrada-itzel');
    const flores = ['#c8203a','#f2b233','#2f7fc8','#3f9a5c','#e85a8a'].map(col => `<img alt="" src="${BORDADO.icon('flor', 5, [col, '#f2b233'])}">`).join('');
    const esquinas = ['si','sd','ii','id'].map(pos => `<div class="flores ${pos}" aria-hidden="true">${flores}</div>`).join('');
    capa.innerHTML = `${esquinas}<div class="portada"><div class="bordado-area"><img class="logo" alt="Itzel" src="${stitched('Itzel', 16)}"></div><p class="lema">Hay aventuras que empiezan en Campeche</p><button class="continuar" id="inicioContinuar">Presiona Start para continuar</button></div>`;
    BORDADO.teje(capa.querySelector('.bordado-area .logo'));
    document.getElementById('inicioContinuar').onclick = cerrar;
  }
  // la cinemática 1 va entre los logos y la pantalla de inicio; se puede saltar como todas (Espacio, Esc o Start)
  function cinematica() {
    etapa = 'cine'; clearTimeout(temporizador); removeEventListener('keydown', teclado, true); capa.style.display = 'none';
    const sigue = () => { etapa = 'portada'; if (typeof title === 'function') title(); capa.style.display = ''; addEventListener('keydown', teclado, true); mostrar(); };
    if (typeof window.INTRO_ENTRADA === 'function') { try { window.INTRO_ENTRADA(sigue); } catch (e) { sigue(); } } else sigue();
  }
  function cerrar() { clearTimeout(temporizador); window.enApertura = false; document.body.classList.remove('presentando-inicio'); capa.remove(); style.remove(); removeEventListener('keydown', teclado, true); }
  function teclado(e) {
    if (e.code !== 'Enter' && e.code !== 'Space') return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (etapa !== 'portada') { if (etapa === 'logos') { fase++; mostrar(); } return; }
    cerrar();
  }
  addEventListener('keydown', teclado, true);
  let startAnterior = false;
  function control() {
    if (!capa.isConnected) return;
    const pulsado = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(p => p && p.connected && p.buttons[9]?.pressed);
    if (pulsado && !startAnterior) { if (etapa === 'logos') { fase++; mostrar(); } else if (etapa === 'portada') cerrar(); }
    startAnterior = pulsado;
    requestAnimationFrame(control);
  }
  requestAnimationFrame(control);
  if (!desdeGD) mostrar();
  else {
    // se queda en negro hasta que GDevelop termine su logo y muestre este marco; entonces arranca el logo de la empresa
    let arrancada = false;
    const arranca = () => { if (arrancada) return; arrancada = true; mostrar(); };
    addEventListener('message', e => { if (e.data && e.data.itzelGD === 'inicia') arranca(); });
    const avisaListo = () => setTimeout(() => { try { parent.postMessage({ itzelGD: 'listo' }, '*'); } catch (er) {} }, 300);
    if (document.readyState === 'complete') avisaListo(); else addEventListener('load', avisaListo);
  }
})();
