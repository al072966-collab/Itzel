'use strict';
// =====================================================================
//  RITMO DE NEÓN, CON SUS ASSETS (estilo neón synthwave)
//  El telón (plaza de noche con el sol synthwave y la ciudad en neón) se
//  queda. Lo de enfrente usa las piezas de tools/neon-ritmo.py
//  (Roguelike/assets/neon, 6 px por unidad):
//    · bloques A (triángulo) y B (círculo) que se prenden al compás: apagados
//      se ven tenues (no se pisan), prendidos brillan;
//    · la tapa del ecualizador sobre sus barras (las barras siguen igual);
//    · el piso con las losas de la lámina, el filo cian encima;
//    · iguana, bocina (late al compás) y bailarín (una pose por compás);
//    · palmeras, farol, armazón de luces y reflectores; canistel, corazón y
//      el portal de salida.
//  Nada cambia colisiones ni mecánicas. Solo aplica al estilo «neon».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.neon) return;
  const V = vestirNivel({ id: 'neon', carpeta: 'neon', ver: 1 });
  const { spr, h1, TAM, IMG } = V, CY = '#00e8ff', MG = '#ff2bd6';
  const iguanaForge = new Image(); iguanaForge.decoding = 'async';
  iguanaForge.src = '../Roguelike/assets/forge/enemigos/iguana-v1/processed/sheet-transparent.png';

  // Puerta de Tierra: el arco y las dos torres del portón, en trazo de neón al fondo (símbolo del lugar)
  function puerta(c, x, y, f) {
    if (window.LUGARES_CAMPECHE && window.LUGARES_CAMPECHE.dib(c, 'puertaTierra', x, y + 4, { w: 126, filtro: 'saturate(1.3) hue-rotate(250deg) brightness(.75)' })) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 12, 44, MG, .16 + .06 * Math.sin(f.t * 2)); c.restore(); return; }
    const pul = .75 + .25 * Math.sin(f.t * 2); c.save(); c.shadowColor = MG; c.shadowBlur = 5; c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,43,214,' + pul + ')'; c.fillStyle = 'rgba(30,6,50,.7)';
    c.beginPath(); c.rect(x - 34, y - 52, 14, 52); c.rect(x + 20, y - 52, 14, 52); c.fill(); c.stroke();
    for (const bx of [-34, 20]) { c.beginPath(); for (let k = 0; k < 3; k++) c.rect(x + bx + k * 5, y - 58, 4, 6); c.stroke(); }
    c.beginPath(); c.moveTo(x - 20, y); c.lineTo(x - 20, y - 30); c.arc(x, y - 30, 20, Math.PI, 0); c.lineTo(x + 20, y); c.stroke();
    c.strokeStyle = 'rgba(0,232,255,' + pul + ')'; c.shadowColor = CY; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x - 14, y - 30); c.arc(x, y - 30, 14, Math.PI, 0); c.lineTo(x + 14, y); c.stroke();
    c.restore();
  }
  V.cielo((c, f, antes) => {
    antes();
    const u = 400, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    c.save(); c.globalAlpha = .55;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (h1(i, 2) < .3) continue; puerta(c, k * u - off + 80 + h1(i, 5) * 140, 176, f); }
    c.restore();
  });
  // ---------------- el piso: losas de neón ----------------
  let patron = null;
  V.terreno((ctx, f) => {
    if (!patron) { patron = ctx.createPattern(IMG.losa, 'repeat'); const k = TAM.losa.w / IMG.losa.naturalWidth; patron.setTransform(new DOMMatrix().scale(k)); }
    ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
    ctx.globalAlpha = .55; ctx.fillStyle = patron; ctx.fillRect(0, 0, L.ww, VH + 40);
    const g = ctx.createLinearGradient(0, 150, 0, VH + 10); g.addColorStop(0, 'rgba(10,2,24,0)'); g.addColorStop(1, 'rgba(10,2,24,.8)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 140, L.ww, VH);
    ctx.restore();
    // el filo cian de lo que se pisa, con su brillo
    ctx.save(); ctx.shadowColor = CY; ctx.shadowBlur = 5 * f.S; ctx.strokeStyle = CY; ctx.lineWidth = 1.1; allLoopsPath(ctx, L.loops); ctx.stroke(); ctx.restore();
    ctx.beginPath(); for (const r of L.tops) { ctx.moveTo(r.x0 + 1, r.y + 1.4); ctx.lineTo(r.x1 - 1, r.y + 1.4); } ctx.strokeStyle = 'rgba(255,43,214,.75)'; ctx.lineWidth = .5; ctx.stroke();
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, o.i % 4 === 3 ? 'armazon' : 'palmera' + (o.i % 3), x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['farol', 'reflector0', 'reflector2'][o.i % 3], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['reflector1', 'reflector0'][o.i % 2], x, y, { voltea: v < .5 });
    }
  });

  // ---------------- bloques A y B al ritmo ----------------
  const neonAntes = (ctx, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, on = pl.on; ctx.save(); ctx.strokeStyle = pl.grp === 'A' ? CY : MG; ctx.globalAlpha *= on ? 1 : .25; ctx.lineWidth = on ? 1.2 : .6; if (on) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8 * f.S; }
    ctx.setLineDash(on ? [] : [2, 2]); ctx.strokeRect(x, y, w, 7); ctx.fillStyle = on ? rgba(pl.grp === 'A' ? CY : MG, .2) : 'transparent'; ctx.fillRect(x, y, w, 7); ctx.restore(); ctx.setLineDash([]);
  };
  V.look('neon', (c, pl, f) => {
    const n = Math.max(1, Math.round(pl.w / 8)), lado = pl.w / n, g = pl.grp === 'A' ? 'A' : 'B';
    c.save();
    if (!pl.on) { c.globalAlpha *= .32; c.strokeStyle = g === 'A' ? CY : MG; c.lineWidth = .5; c.setLineDash([2, 2]); c.strokeRect(pl.x, pl.y, pl.w, lado); c.setLineDash([]); }
    for (let i = 0; i < n; i++) spr(c, 'bloque' + g + (pl.on ? 1 : 0), pl.x + i * lado + lado / 2, pl.y - .3, { ay: 0, w: lado + .4 });
    c.restore();
  }, 'bloqueA1', neonAntes);

  // ---------------- la tapa del ecualizador ----------------
  V.look('eq', (c, pl, f, sk, antes) => {
    antes(c, pl, f, sk);
    const t = TAM.tapa; spr(c, 'tapa', pl.x + pl.w / 2, pl.y - .3, { ay: t.cubierta || .3, w: pl.w + 3 });
  }, 'tapa');

  // ---------------- iguana, bocina y bailarín ----------------
  const CAMINA = [0, 1, 2, 1];
  V.fd('iguana', (c, e, t) => {
    let n; const anim = e.anim ?? t;
    if (e.st === 'gone') n = 11;
    else if (e.st === 'sleep' || e.aturde > 0) n = 6;
    else if (Math.abs(e.vy || 0) > 1) n = (e.vy || 0) < 0 ? 7 : 8;
    else if (iguanaForge.complete && iguanaForge.naturalWidth) {
      const cuadro = Math.floor(anim * (Math.abs(e.vx || 0) > 50 ? 12 : 6)) % 4;
      // Cuatro poses de carrera con la base de los pies alineada al suelo.
      c.imageSmoothingEnabled = true;
      c.drawImage(iguanaForge, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256 + 148, 220, 91, -12, -10, 24, 10);
      return;
    } else n = CAMINA[Math.floor(anim * (Math.abs(e.vx || 0) > 50 ? 12 : 6)) % 4];
    if (e.st === 'sleep') { c.save(); c.rotate(Math.sin(t * 9) * .06); spr(c, 'iguana' + n, 0, .8); c.restore(); return; }
    spr(c, 'iguana' + n, 0, .8);
  }, 'iguana0');
  V.fd('bocina', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('bocina');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const late = e.late || 0, n = late > .22 ? 3 : late > .12 ? 2 : late > 0 ? 1 : 0;
    const cuadro = late > 0 ? n : [0, 1, 2, 3][Math.floor((e.anim ?? t) * 8) % 4];
    spr(c, 'bocina' + cuadro, 0, .5, { k: 1 + late * .3 });
  }, 'bocina0');
  V.fd('bailarin', (c, e, t, s, antes) => {
    antes(c, e, t, s);
  }, 'bailarin0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1 });
  window.NEON_RITMO = V;
})();
