'use strict';
// =====================================================================
//  CONTROL (GAMEPAD)
//  · Control 1 es Itzel: stick izquierdo o cruceta para correr, A salta,
//    B o X (o RB) impulso, Start pausa. El control «oprime» las mismas teclas
//    del teclado, así funciona igual en todos los géneros (plataformas,
//    isométrico, naves, torres, cocina, jarana y pesca).
//  · Fresita sigue con el mouse; o con el stick derecho del mismo control
//    (RT poder, LT o LB canción de cuna), o con un segundo control (stick
//    izquierdo, A poder, B canción). Si se mueve el mouse, el mouse manda.
//  · En los menús: cruceta o stick para moverse entre botones, A escoge,
//    B regresa, Start sigue. En las cinemáticas A o Start las saltan.
//  · Vibra cuando Itzel recibe un golpe (si está prendido en Opciones).
// =====================================================================
const MANDO = (() => {
  const conectados = () => [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(p => p && p.connected);
  const btn = (p, i) => !!(p && p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > .5));
  const muerto = v => Math.abs(v || 0) < .2 ? 0 : v;
  const antes = {};
  const flanco = (k, on) => { const era = antes[k]; antes[k] = on; return on && !era; };
  const suelta = (k, on) => { const era = antes[k]; antes[k] = on; return !on && era; };

  // ---------- teclas que el control tiene oprimidas ----------
  const teclas = new Set();
  function tecla(code, on) {
    if (on === teclas.has(code)) return;
    if (on) teclas.add(code); else teclas.delete(code);
    dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
  }
  const toque = code => { dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true })); dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true })); };
  const sueltaTodo = () => { for (const k of [...teclas]) tecla(k, false); };

  // ---------- Fresita con stick: un puntero propio y una retícula bordada ----------
  let cursor = null, desde = 0, aSostenido = false, pmx = 0, pmy = 0, pa = false, pb = false;
  const ret = document.createElement('div'); ret.id = 'reticula'; document.body.appendChild(ret);
  function fresita(p1, p2, dt) {
    let mx, my, a, b;
    if (p2) { mx = muerto(p2.axes[0]); my = muerto(p2.axes[1]); a = btn(p2, 0); b = btn(p2, 1); }
    else { mx = muerto(p1.axes[2]); my = muerto(p1.axes[3]); a = btn(p1, 7); b = btn(p1, 6) || btn(p1, 4); }
    // Un stick con deriva (o un gatillo pegado) no debe quitarle el control al mouse: el mando solo manda
    // cuando hay un movimiento nuevo; si el mouse se movió después, el mouse gana y se queda.
    const nuevo = (a && !pa) || (b && !pb) || Math.abs(mx - pmx) + Math.abs(my - pmy) > .06;
    pmx = mx; pmy = my; pa = !!a; pb = !!b;
    if ((mx || my || a || b) && (cursor || nuevo || MOUSE.last <= desde)) {
      if (!cursor) {
        // en el motor propio (niveles verticales) la cámara es {x, y} y Fresita ya está en coordenadas de pantalla
        const propio = CUR && typeof CUR.cam === 'object', fx = CUR && CUR.fre ? (propio ? CUR.fre.x : CUR.fre.x - CUR.cam) : NaN, fy = CUR && CUR.fre ? (propio ? CUR.fre.y : CUR.fre.y - (CUR.camY || 0)) : NaN;
        cursor = Number.isFinite(fx) && Number.isFinite(fy) ? { x: clamp(fx, 4, VW - 4), y: clamp(fy, 4, VISTA.H - 4) } : { x: VW / 2, y: VISTA.H / 2 };
        desde = performance.now();
      } else if (nuevo) desde = performance.now();
    }
    if (cursor && MOUSE.last > desde) cursor = null;     // se movió el mouse: el mouse manda
    if (!cursor) { ret.classList.remove('on'); if (aSostenido) aSostenido = false; return; }
    const v = 250 * Math.hypot(mx, my) ** 1.4 / (Math.hypot(mx, my) || 1);
    cursor.x = clamp(cursor.x + mx * v * dt, 2, VW - 2); cursor.y = clamp(cursor.y + my * v * dt, 2, VISTA.H - 2);
    MOUSE.x = cursor.x; MOUSE.y = cursor.y; MOUSE.active = true;
    if (flanco('fa', a)) { MOUSE.clicks.push({ x: cursor.x, y: cursor.y, b: 0 }); aSostenido = true; }
    if (suelta('fa2', a) && aSostenido) { MOUSE.clicks.push({ x: cursor.x, y: cursor.y, b: 0, up: true }); aSostenido = false; }
    if (flanco('fb', b)) MOUSE.clicks.push({ x: cursor.x, y: cursor.y, b: 2 });
    const r = canvas.getBoundingClientRect();
    ret.style.left = (r.left + cursor.x / VW * r.width) + 'px'; ret.style.top = (r.top + cursor.y / VISTA.H * r.height) + 'px'; ret.classList.add('on');
  }

  // ---------- menús: un foco que se mueve entre los botones ----------
  let foco = null, ultimo = 0, sigue = false;
  function botones() {
    const raiz = $('enci').classList.contains('on') ? $('enci') : $('screen').classList.contains('on') ? $('screen') : null;
    return raiz ? [...raiz.querySelectorAll('button, input[data-vol]')].filter(b => b.offsetParent !== null && !b.disabled) : [];
  }
  function ponFoco(b, recorre = true) {
    document.querySelectorAll('.gp-foco').forEach(e => e.classList.remove('gp-foco'));
    foco = b || null; if (foco) { foco.classList.add('gp-foco'); if (recorre) foco.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  // al botón más cercano en esa dirección (lo que queda de lado cuenta más)
  function mover(dx, dy) {
    const r0 = foco.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
    let mejor = null, md = 1e9;
    for (const b of botones()) {
      if (b === foco) continue;
      const r = b.getBoundingClientRect(), vx = r.left + r.width / 2 - x0, vy = r.top + r.height / 2 - y0, va = vx * dx + vy * dy;
      if (va <= 4) continue; const d = va + Math.abs(vx * dy - vy * dx) * 2.5;
      if (d < md) { md = d; mejor = b; }
    }
    // nada en esa dirección (botones en una sola fila): abajo/derecha es el siguiente y arriba/izquierda el anterior
    if (!mejor) { const bs = botones(), i = bs.indexOf(foco); mejor = bs[clamp(i + (dx + dy > 0 ? 1 : -1), 0, bs.length - 1)]; }
    if (mejor) ponFoco(mejor);
  }
  function regresa() {
    if ($('enci').classList.contains('on')) { cerrarEnci(); return; }
    const b = botones().find(b => /Volver$|^cont$|^cVolver$/.test(b.id) || /^(Volver|Seguir)$/.test(b.textContent.trim()));
    if (b) b.click(); else if (STATE === 'pause') pause(false);
  }
  function menu(p, izq, der, arr, aba) {
    const bs = botones(); if (!bs.length) { ponFoco(null); return; }
    if (!foco || !bs.includes(foco)) ponFoco(bs.find(b => /^(mJugar|cJugar|cont|again)$/.test(b.id)) || bs[0], false);
    const dir = izq ? [-1, 0] : der ? [1, 0] : arr ? [0, -1] : aba ? [0, 1] : null, ahora = performance.now();
    if (dir) { if (ahora - ultimo > (sigue ? 140 : 360)) { if (foco.matches('input[data-vol]') && (izq || der)) { foco.value = Math.max(0, Math.min(100, Number(foco.value) + (der ? 5 : -5))); foco.dispatchEvent(new Event('input', { bubbles: true })); } else mover(...dir); sigue = ahora - ultimo < 400; ultimo = ahora; } }
    else { ultimo = 0; sigue = false; }
    if (flanco('mA', btn(p, 0)) && foco) { bloqueaA = true; foco.click(); }
    if (flanco('mB', btn(p, 1))) regresa();
    if (flanco('mStart', btn(p, 9))) { if (STATE === 'pause') pause(false); else if (foco) { bloqueaA = true; foco.click(); } }
  }

  // ---------- el bucle ----------
  let bloqueaA = false, enMenu = false, tAntes = performance.now();
  function paso(t) {
    const dt = Math.min(.05, (t - tAntes) / 1000); tAntes = t;
    if (window.enApertura) { sueltaTodo(); ponFoco(null); return; }
    const ps = conectados(), p1 = ps[0], p2 = ps[1];
    if (p1) {
      const ax = muerto(p1.axes[0]), ay = muerto(p1.axes[1]);
      const izq = ax < -.4 || btn(p1, 14), der = ax > .4 || btn(p1, 15), arr = ay < -.5 || btn(p1, 12), aba = ay > .5 || btn(p1, 13);
      if (!btn(p1, 0)) bloqueaA = false;    // el A que escogió en el menú no salta al empezar
      const cine = typeof CINE !== 'undefined' && CINE.activo(), enci = $('enci').classList.contains('on');
      if (cine) { sueltaTodo(); if (flanco('cA', btn(p1, 0) || btn(p1, 9))) toque('Space'); }
      else if (STATE === 'play' && !enci) {
        tecla('ArrowLeft', izq); tecla('ArrowRight', der); tecla('ArrowDown', aba);
        tecla('ArrowUp', arr && !!(CUR && CUR.modo));                     // en plataformas, arriba no salta (para eso está A)
        tecla('Space', btn(p1, 0) && !bloqueaA); tecla('ShiftLeft', btn(p1, 1) || btn(p1, 2) || btn(p1, 5));
        if (flanco('start', btn(p1, 9))) toque('Escape');
        fresita(p1, p2, dt); ponFoco(null);
      } else {
        // recién llegó a un menú: lo que ya venía apretado no cuenta como clic (si no, «Otra vez» se escoge solo)
        if (!enMenu) { antes.mA = btn(p1, 0); antes.mB = btn(p1, 1); antes.mStart = btn(p1, 9); }
        sueltaTodo(); ret.classList.remove('on'); antes.start = btn(p1, 9); menu(p1, izq, der, arr, aba);
      }
      enMenu = !(STATE === 'play' && !enci) && !cine;
    } else if (teclas.size) sueltaTodo();
  }
  const cuadro = t => { paso(t); requestAnimationFrame(cuadro); };
  requestAnimationFrame(cuadro);

  addEventListener('gamepadconnected', e => { if (typeof AVISOS === 'function') AVISOS(conectados().length > 1 ? 'Segundo control' : 'Control conectado', conectados().length > 1 ? 'Ahora Fresita se mueve con este control' : 'Itzel ya se puede jugar con el control', 'control'); });
  addEventListener('gamepaddisconnected', () => { sueltaTodo(); cursor = null; ret.classList.remove('on'); });
  // el mouse vuelve a mandar en los menús: se quita el foco del control
  addEventListener('mousemove', () => { if (foco) ponFoco(null); });

  function vibra() {
    if (!opcion('vibracion', true)) return; const p = conectados()[0], act = p && p.vibrationActuator;
    try { if (act && act.playEffect) act.playEffect('dual-rumble', { duration: 220, strongMagnitude: .7, weakMagnitude: .45 }); } catch (e) {}
  }
  return { conectados, vibra, paso };   // paso: para probarlo a mano (con la ventana oculta no corre requestAnimationFrame)
})();
