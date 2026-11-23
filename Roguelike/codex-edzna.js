'use strict';
// =====================================================================
//  EL GLIFO DE EDZNÁ, CON SUS ASSETS (estilo códice maya)
//  El telón y el terreno del códice se quedan. Lo de enfrente usa las
//  piezas de tools/codex-edzna.py (Roguelike/assets/edzna):
//    · losas que se hunden (cornisa pintada, con la cubierta medida);
//    · bloques de glifo: prendidos con su glifo (cada grupo su color),
//      apagados como piedra lisa tenue (no se pisan);
//    · la estela apagada y prendida, con el aro del calendario de antes;
//    · jaguar, mono escribano (pinta en su atril), guerrero con escudo
//      (el escudo brilla si está protegido) y culebra emplumada;
//    · ceiba, plantas y ollas; canistel, corazón y el templo de salida.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «El glifo de Edzná».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.codex) return;
  const V = vestirNivel({ id: 'codex', carpeta: 'edzna', ver: 1, manifiesto: window.CODEX_EDZNA_MANIFIESTO });
  const { spr, h1, TAM, IMG } = V;
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ fondo:'paisaje-codice-v1', suelo:'pigmento-terreno-v1', fondoBajo:'pigmento-fondo-v1' })) {
    const im = paisaje[n] = new Image(); im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/edzna/' + archivo + '.png';
  }
  // también en la enciclopedia (jefes, personajes): el estilo códice se ve igual que en la partida, con el pergamino liso
  const principal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'codex' || !!(f.st && String(f.st.id).split('~')[0] === 'codex');
  // Apagado a pedido de David: el telón y el terreno de láminas (pirámides, colinas, pigmento) se quitan y el nivel usa el telón y terreno
  // dibujados en código, que es el que le gusta. Los personajes y objetos con láminas se quedan.
  const paisajeListo = () => false;

  // telón de códice: glifos-cartucho que se encienden y se apagan, con puntos y barras mayas, y pigmento que flota
  function glifo(c, x, y, k, i, al) {
    c.save(); c.translate(x, y); c.globalAlpha = al;
    c.strokeStyle = '#7a2e1c'; c.lineWidth = .9; c.beginPath(); c.roundRect ? c.roundRect(-7 * k, -8 * k, 14 * k, 16 * k, 4 * k) : c.rect(-7 * k, -8 * k, 14 * k, 16 * k); c.stroke();
    c.fillStyle = '#7a2e1c';
    const n = 1 + Math.floor(h1(i, 3) * 4);                                // número maya: barra y puntos
    c.fillRect(-4.5 * k, 2.5 * k, 9 * k, 1.6 * k);
    for (let d = 0; d < n; d++) { c.beginPath(); c.arc((d - (n - 1) / 2) * 3.2 * k, -.8 * k, 1.1 * k, 0, 6.2832); c.fill(); }
    c.fillStyle = '#2a7a6a'; c.beginPath(); c.arc(0, -5 * k, 1.5 * k, 0, 6.2832); c.fill();
    c.restore();
  }
  V.cielo((c, f, antes) => {
    if (principal(f) && paisajeListo()) {
      const ancho = 700, base = 176 - (f.y0 || 0), alto = f.H || VH, off = ((f.cam * .12 % ancho) + ancho) % ancho;
      const arriba = Math.min(0, base - 176);
      c.save(); c.fillStyle = '#9eaa83'; c.fillRect(0, 0, VW, alto);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) {
        c.drawImage(paisaje.fondo, 0, 0, 2172, 596, x, arriba, ancho, base - arriba);
        if (base < alto) c.drawImage(paisaje.fondoBajo, x, base, ancho, alto - base);
      }
      c.restore();
    } else if (principal(f) && typeof paperTex === 'function') {
      // El telón de este nivel: solo el pergamino de amate, sin pirámides, colinas, sol ni glifos fantasma (a pedido de David)
      c.drawImage(paperTex(f, 'amate', '#ecdcb4', { grain: 14, blot: 16, fibers: 22 }), 0, 0, VW, VH);
    } else antes();
    const t = f.t;
    for (let i = 0; i < (principal(f) ? 0 : 7); i++) {
      const per = 8 + h1(i, 5) * 4, T = (t + h1(i, 6) * 12) % per, n = Math.floor((t + h1(i, 6) * 12) / per), u = T / per, w = VW + 80;
      const x = ((h1(n * 7 + i, 7) * w - f.cam * .1) % w + w) % w - 40, y = 30 + h1(n * 7 + i, 8) * 110 - u * 8, al = Math.sin(u * Math.PI) * .42;
      c.save(); c.globalCompositeOperation = 'multiply'; glifo(c, x, y, 1.3 + h1(i, 9) * .5, n * 7 + i, al); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = al * .5; const g = c.createRadialGradient(x, y, 2, x, y, 18); g.addColorStop(0, 'rgba(255,200,110,.4)'); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 18, 0, 6.2832); c.fill(); c.restore();
    }
    c.save(); c.globalCompositeOperation = 'lighter';                      // motas de pigmento al aire
    for (let i = 0; i < 26; i++) {
      const w = VW + 40, x = ((h1(i, 11) * w - f.cam * .2 + t * (2 + h1(i, 12) * 3)) % w + w) % w - 20, y = ((h1(i, 13) * 200 - t * (3 + h1(i, 14) * 4)) % 200 + 200) % 200;
      c.globalAlpha = .45 * (.5 + .5 * Math.sin(t * 1.4 + i)); c.fillStyle = i % 3 ? '#ffd9a0' : '#9fe0d0'; c.fillRect(x, y, 1, 1);
    }
    c.restore();
  });

  // el suelo de este nivel va liso (sin los puntitos de pigmento que le pone el estilo): el estilo lo consulta con esta función
  window.CODEX_SIN_PUNTOS = () => typeof CUR !== 'undefined' && !!CUR && !!CUR.def && CUR.def.id === 'codex' && !CUR.modo;
  let pigmento = null;
  V.terreno((ctx, f) => {
    if (principal(f) && paisajeListo()) {
      if (!pigmento) { pigmento = ctx.createPattern(paisaje.suelo, 'repeat'); pigmento.setTransform(new DOMMatrix().scale(480 / paisaje.suelo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.fillStyle = pigmento;
      for (const r of L.tops) ctx.fillRect(r.x0, r.y + 16, r.x1 - r.x0, VH + 40);
      ctx.restore();
    }
    for (const r of L.tops) for (let x = r.x0 + 12; x < r.x1 - 12; x += 30 + h1(x | 0, r.y) * 46) if (h1(x | 0, 61) > .62) spr(ctx, ['planta2', 'flor', 'olla1'][Math.floor(h1(x | 0, 62) * 3)], x, r.y + 1, { voltea: h1(x | 0, 63) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, o.i % 3 === 2 ? 'planta0' : 'ceiba', x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['planta1', 'flor', 'planta2', 'planta0'][o.i % 4], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['olla0', 'olla2', 'olla1'][o.i % 3], x, y);
    }
  });

  // ---------------- losas y glifos ----------------
  V.look('stone', (c, pl) => {
    const n = pl.w > 24 ? 'losa1' : 'losa0', t = TAM[n];
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .1, w: pl.w + 2 });
  }, 'losa0');
  V.solido('glyph', (c, s) => {
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const im = IMG[s.on ? 'glifo' + ((s.grp || 0) % 4) : 'glifoApagado'], n = Math.max(1, Math.round(s.w / 8)), m = Math.max(1, Math.round(s.h / 8)), cw = s.w / n, ch = s.h / m;
    if (!s.on) c.globalAlpha *= .3;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) c.drawImage(im, s.x + i * cw, s.y + j * ch, cw + .2, ch + .2);
    if (!s.on) { c.globalAlpha = .5; c.strokeStyle = '#1c1612'; c.setLineDash([1.5, 1.5]); c.lineWidth = .5; c.strokeRect(s.x + .3, s.y + .3, s.w - .6, s.h - .6); c.setLineDash([]); }
    c.restore();
  }, 'glifo0');
  V.obj('estela', (c, o, f) => {
    spr(c, o.prendido ? 'estela1' : 'estela0', o.x, o.y + 1);
    if (o.prendido) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 14, 10, '#d79a3d', .35); c.restore(); }
    const u = (o.t % o.per) / o.per, y = o.y - 33;
    c.strokeStyle = 'rgba(176,65,46,.9)'; c.lineWidth = 1.1; c.beginPath(); c.arc(o.x, y, 3, -Math.PI / 2, -Math.PI / 2 + u * TAU); c.stroke();
    c.strokeStyle = 'rgba(28,22,18,.45)'; c.lineWidth = .4; c.beginPath(); c.arc(o.x, y, 3, 0, TAU); c.stroke();
  }, 'estela0');

  // ---------------- jaguar, escribano, guerrero y culebra ----------------
  V.fd('jaguar', (c, e, t) => {
    const aire = Math.abs(e.vy || 0) > 1, n = e.st === 'sleep' || e.aturde > 0 ? 7 : aire ? 6 : (e.tt > 0 && e.tt < .3) ? 4 : Math.floor((e.anim || t) * 7) % 4;
    spr(c, 'jaguar' + n, 0, .8);
  }, 'jaguar0');
  V.fd('escribano', (c, e, t, s, antes) => antes(c, e, t, s), 'escribano0');
  V.fd('guerrero', (c, e, t, s, antes) => {
    if (window.CODICE_GUERRERO && CODICE_GUERRERO.activo() && CODICE_GUERRERO.dibuja(c, e, t)) return;   // en Las páginas del códice: sus seis poses de lámina
    // Conserva la pieza de sueño del códice; los demás estados usan los
    // recortes Forge, cuyo dibujante mantiene el brillo del escudo.
    if (e.st === 'sleep') {
      const n = Math.floor((e.anim || t) * 3) % 8;
      spr(c, 'guerrero' + n, 0, .8);
      return;
    }
    antes(c, e, t, s);
  }, 'guerrero0');
  V.fd('culebra', (c, e, t) => {
    const n = e.st === 'lunge' ? 5 : e.st === 'sleep' ? 0 : e.tt > .3 ? 4 : [6, 7, 6, 3][Math.floor((e.anim || t) * 4) % 4];
    spr(c, 'culebra' + n, 0, .6);
  }, 'culebra0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.CODEX_EDZNA = V;
})();
