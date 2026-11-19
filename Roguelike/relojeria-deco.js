'use strict';
// La relojería dorada: recortes de latón sobre un telón dibujado por código.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.deco) return;
  const V = vestirNivel({ id: 'deco', carpeta: 'relojeria', ver: 3 });
  const { spr, h1 } = V;
  // Engranes lejanos tenues, trazados por código y sin superficies rectas
  // que puedan confundirse con plataformas.
  V.cielo((c, f, antes) => {
    antes();
    c.save(); c.strokeStyle = '#d4af37'; c.globalAlpha = .18; c.lineWidth = .6;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 108 - f.cam * .12) % (VW + 110) + VW + 110) % (VW + 110) - 55;
      const y = 100 + (i % 2) * 27, r = 21 + (i % 3) * 4;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.arc(x, y, r * .78, 0, Math.PI * 2); c.arc(x, y, r * .15, 0, Math.PI * 2); c.stroke();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4 + f.t * .025 * (i % 2 ? -1 : 1);
        c.beginPath(); c.moveTo(x + Math.cos(a) * r * .22, y + Math.sin(a) * r * .22); c.lineTo(x + Math.cos(a) * r * .73, y + Math.sin(a) * r * .73); c.stroke();
      }
    }
    c.restore();
  });
  // función de gala: reflectores dorados que barren la tramoya, polvo de oro y una carátula de reloj con manecillas a saltos
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 2; k++) {
      const bx = k ? VW - 60 : 60, ang = Math.sin(t * .35 + k * 2) * .35 + (k ? .25 : -.25), len = 260;
      const g = c.createLinearGradient(bx, 0, bx + Math.sin(ang) * len, Math.cos(ang) * len); g.addColorStop(0, 'rgba(255,214,120,.2)'); g.addColorStop(1, 'rgba(255,214,120,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(bx - 3, 0); c.lineTo(bx + 3, 0); c.lineTo(bx + Math.sin(ang) * len + 26, Math.cos(ang) * len); c.lineTo(bx + Math.sin(ang) * len - 26, Math.cos(ang) * len); c.closePath(); c.fill();
    }
    for (let i = 0; i < 26; i++) {
      const w = VW + 40, x = ((h1(i, 31) * w - f.cam * .18 + Math.sin(t * .6 + i) * 5) % w + w) % w - 20, y = ((h1(i, 32) * 220 - t * (3 + h1(i, 33) * 4)) % 220 + 220) % 220;
      c.globalAlpha = .6 * Math.sin(Math.PI * y / 220); c.fillStyle = '#ffe28a'; c.fillRect(x, y, 1.2, 1.2);
    }
    c.restore();
    const cx = 340 - f.cam * .05, cy = 60, r = 24, seg = Math.floor(t * 1) , min = (seg % 60) / 60 * 6.2832 - 1.5708, hor = (seg % 720) / 720 * 6.2832 - 1.5708;
    c.save(); c.globalAlpha = .35; c.strokeStyle = '#d4af37'; c.lineWidth = .8; c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
    for (let q = 0; q < 12; q++) { const a = q * .5236; c.beginPath(); c.moveTo(cx + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86); c.lineTo(cx + Math.cos(a) * r * .97, cy + Math.sin(a) * r * .97); c.stroke(); }
    c.lineWidth = 1.1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(min) * r * .8, cy + Math.sin(min) * r * .8); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(hor) * r * .5, cy + Math.sin(hor) * r * .5); c.stroke();
    c.restore();
  });
  // el Puente de los Perros (Campeche): un perro de piedra sentado sobre su pilar, al lado de la tramoya del Teatro Toro (mismo Francisco de Paula Toro)
  function perroPuente(c, x, y) {
    c.save(); c.translate(x, y); c.fillStyle = '#3a2f22'; c.strokeStyle = '#d9b45a'; c.lineWidth = .6; c.lineJoin = 'round';
    c.beginPath(); c.rect(-6, -12, 12, 12); c.fill(); c.stroke(); c.beginPath(); c.rect(-7.5, -14, 15, 2.5); c.fill(); c.stroke();
    c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(-4, -14); c.lineTo(-4.5, -22); c.quadraticCurveTo(-4, -26, -1, -26); c.lineTo(1, -29); c.lineTo(3, -26); c.lineTo(5, -25.5); c.lineTo(5, -23); c.lineTo(2, -22); c.lineTo(3, -14); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-4.5, -20); c.quadraticCurveTo(-9, -18, -8, -14); c.lineTo(-4, -14); c.fill(); c.stroke();
    c.restore();
  }
  V.terreno(ctx => {
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5;
      if (o.k === 'T') { if (V.h1(o.i, 3) < .5) perroPuente(ctx, x, y); else spr(ctx, o.i % 2 ? 'columna' : 'reloj', x, y); }
      else if (o.k === 'f') spr(ctx, 'lampara', x, y);
      else if (o.k === 'r') spr(ctx, 'engranes', x, y);
    }
  });
  const cuadro = (t, fps) => [0, 1, 2, 1][Math.floor(t * fps) % 4];
  V.fd('automata', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'automata0', t, .5);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('automata');
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'gone' && e.st !== 'stun' && !(e.aturde > 0) && !(e._golpe > .25)) return antes(c, e, t, s);
    spr(c, 'automata' + cuadro(e.anim || t, 5), 0, .5);
  }, 'automata0');
  V.fd('bailarina', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('bailarina');
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'gone') return antes(c, e, t, s);
    const i = e.reverencia ? 5 : [0, 2, 3, 4, 3, 2][Math.floor((e.giro || 0) * 2 / Math.PI) % 6];
    spr(c, 'bailarina' + i, 0, .5);
    if (!e.reverencia) { c.strokeStyle = 'rgba(255,219,103,.8)'; c.lineWidth = .5; c.beginPath(); c.ellipse(0, -6, 7, 2, 0, Math.sin(t * 9), Math.sin(t * 9) + 2); c.stroke(); }
  }, 'bailarina0');
  V.fd('jaguar', (c, e, t) => spr(c, 'jaguar' + (Math.abs(e.vy || 0) > 1 ? 4 : [1, 3][Math.floor((e.anim || t) * 5) % 2]), 0, .5), 'jaguar1');
  // La tapa se añade debajo del apoyo. El pistón y su aviso siguen intactos.
  V.look('piston', (c, pl, f, sk, antes) => {
    antes(c, pl, f, sk);
    c.save(); c.beginPath(); c.rect(pl.x, pl.y + 5, pl.w, 12); c.clip();
    spr(c, 'tapa', pl.x + pl.w / 2, pl.y + 4, { ay: 0, w: pl.w }); c.restore();
  }, 'tapa');
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1 });
  window.RELOJERIA_DECO = V;
})();
