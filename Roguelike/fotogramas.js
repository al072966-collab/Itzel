'use strict';
// =====================================================================
//  FOTOGRAMAS: una hoja con un cuadro por cada segundo de una cinemática,
//  para revisarla con calma y decir «en el segundo 34 pasa esto».
//    index.html?fotos=entrada            (cada segundo)
//    index.html?fotos=final&paso=.5      (cada medio segundo)
//    index.html?fotos=entrada&desde=40&hasta=55&paso=.25
//  La cinemática se recorre cuadro por cuadro (a 30 por segundo), igual que
//  cuando corre: lo que se ve en la hoja es lo que se ve jugando.
//  Clic en un cuadro: se ve grande; flechas ← → para pasar al otro; Esc cierra.
// =====================================================================
(() => {
  const q = new URLSearchParams(location.search), id = q.get('fotos'); if (!id) return;
  const paso = Math.max(.05, parseFloat(q.get('paso')) || 1), desde = parseFloat(q.get('desde')) || 0, hasta = parseFloat(q.get('hasta')) || Infinity, mundo = q.get('mundo') || 'acuarela';
  const espera = ms => new Promise(r => setTimeout(r, ms));
  // cede el turno sin temporizador (en una pestaña de fondo los temporizadores se frenan a uno por segundo)
  const cede = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
  addEventListener('load', async () => {
    await espera(600);
    const caja = document.createElement('div');
    Object.assign(caja.style, { position: 'fixed', inset: 0, overflow: 'auto', background: '#140c10', color: '#f4e6d0', zIndex: 9999, font: '15px "Alegreya Sans", system-ui, sans-serif', padding: '14px 16px' });
    caja.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:baseline"><b style="font-size:20px">Fotogramas · ${id}</b><span id="fEstado">Preparando la cinemática…</span>
      <span style="opacity:.7">Cambia la dirección: <code>?fotos=entrada</code> o <code>?fotos=final</code>, <code>&amp;paso=.5</code>, <code>&amp;desde=40&amp;hasta=55</code></span></div>
      <div id="fRejilla" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;margin-top:12px"></div>`;
    document.body.appendChild(caja);
    const estado = caja.querySelector('#fEstado'), rejilla = caja.querySelector('#fRejilla'), fotos = [];
    try {
      CINE.play(id, { repeticion: true, mundo: typeof STYLE_MAP !== 'undefined' ? STYLE_MAP[mundo] : undefined, alTerminar() {} });
      const t0 = performance.now(); while (performance.now() - t0 < 60000 && !CINE.ir(0)) await espera(100);
      CINE.pausa(true);
      const dur = Math.min(CINE.dur || 0, hasta), cv = document.getElementById('cine'), W = 480, H = Math.round(W * cv.height / cv.width);
      const mini = document.createElement('canvas'); mini.width = W; mini.height = H; const mx = mini.getContext('2d');
      let sig = desde, n = 0;
      for (let t = 0; t <= dur + 1e-6; t += 1 / 30) {
        CINE.ir(t, false);
        if (t + 1e-6 >= sig) {
          mx.drawImage(cv, 0, 0, W, H); const src = mini.toDataURL('image/jpeg', .84), k = fotos.length; fotos.push({ src, t: sig });
          const f = document.createElement('figure'); f.style.margin = '0';
          f.innerHTML = `<img src="${src}" style="width:100%;display:block;border-radius:4px;cursor:zoom-in"><figcaption style="margin-top:3px"><b>${sig.toFixed(sig % 1 ? 2 : 0)} s</b></figcaption>`;
          f.querySelector('img').onclick = () => grande(k); rejilla.appendChild(f); sig += paso;
        }
        if (++n % 20 === 0) { estado.textContent = `Recorriendo… ${t.toFixed(1)} de ${dur.toFixed(1)} s`; await cede(); }
      }
      estado.textContent = `${fotos.length} cuadros, de ${desde} a ${dur.toFixed(1)} s, cada ${paso} s.`;
      CINE.parar(true);
    } catch (e) { estado.textContent = 'No se pudo: ' + e.message; }
    // un cuadro en grande
    let vista = null, actual = 0;
    function grande(k) {
      actual = (k + fotos.length) % fotos.length;
      if (!vista) { vista = document.createElement('div'); Object.assign(vista.style, { position: 'fixed', inset: 0, background: 'rgba(10,6,8,.94)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f4e6d0', font: '18px system-ui' }); vista.onclick = () => { vista.remove(); vista = null; }; document.body.appendChild(vista); }
      vista.innerHTML = `<img src="${fotos[actual].src}" style="max-width:96vw;max-height:88vh"><div style="margin-top:8px">${fotos[actual].t.toFixed(2)} s · ← → para moverte · Esc para cerrar</div>`;
    }
    addEventListener('keydown', e => { if (!vista) return; if (e.key === 'Escape') { vista.remove(); vista = null; } else if (e.key === 'ArrowRight') grande(actual + 1); else if (e.key === 'ArrowLeft') grande(actual - 1); });
  });
})();
