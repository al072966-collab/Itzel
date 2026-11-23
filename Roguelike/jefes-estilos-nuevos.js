'use strict';
// Ilustraciones originales de cada mundo para los jefes universales.
// Las imágenes conservan el área de dibujo del original; la colisión y el núcleo no cambian.
(() => {
  const X = JEFES_EXT;
  const archivos = {"camazotz":{"bruma":"camazotz-bruma-transparente.png","ocaso":"camazotz-ocaso-transparente.png","miniatura":"camazotz-macro-transparente.png","bits8":"camazotz-pixel-8-bits-transparente.png","cielo":"camazotz-carta-celeste-transparente.png","cuaderno":"camazotz-cuaderno-lapiz-transparente.png","codex":"camazotz-codice-maya-transparente.png","bordado":"camazotz-punto-cruz-transparente.png","nouveau":"camazotz-art-nouveau-transparente.png","sumie":"camazotz-tinta-sumi-e-transparente.png","paper":"camazotz-papel-recortado-transparente.png","vitral":"camazotz-vitral-transparente.png","hollin":"camazotz-hollin-transparente.png","eco":"camazotz-miniatura-2-5d-transparente.png","pixel":"camazotz-pixel-16-bits-transparente.png","bits32":"camazotz-pixel-32-bits-transparente.png","bits64":"camazotz-pixel-64-bits-transparente.png","fuego":"camazotz-pintura-amate-transparente.png","deco":"camazotz-art-deco-transparente.png","cinema":"camazotz-poligonos-cinematicos-transparente.png","lowpoly":"camazotz-lowpoly-transparente.png","flat":"camazotz-geometria-suave-transparente.png","cyber":"camazotz-cyberpunk-transparente.png","barro":"camazotz-plastilina-transparente.png","agua":"camazotz-cianotipia-transparente.png","grabado":"camazotz-linoleo-transparente.png","acuarela":"camazotz-acuarela-v2-transparente.png","hielo":"camazotz-origami-transparente.png","biolum":"camazotz-bioluminiscente-transparente.png","neon":"camazotz-neon-synthwave-transparente.png","anime":"camazotz-anime-transparente.png","oleo":"camazotz-oleo-transparente.png"},"abeja":{"bruma":"xunan-kab-bruma-transparente.png","ocaso":"xunan-kab-ocaso-transparente.png","miniatura":"xunan-kab-macro-transparente.png","bits8":"xunan-kab-pixel-8-bits-transparente.png","cielo":"xunan-kab-carta-celeste-transparente.png","cuaderno":"xunan-kab-cuaderno-lapiz-transparente.png","codex":"xunan-kab-codice-maya-transparente.png","bordado":"xunan-kab-punto-cruz-transparente.png","nouveau":"xunan-kab-art-nouveau-transparente.png","sumie":"xunan-kab-tinta-sumi-e-transparente.png","paper":"xunan-kab-papel-recortado-transparente.png","vitral":"xunan-kab-vitral-transparente.png","hollin":"xunan-kab-siluetas-ceniza-transparente.png","eco":"xunan-kab-diorama-2-5d-transparente.png","pixel":"xunan-kab-pixel-16-bits-transparente.png","bits32":"xunan-kab-pixel-32-bits-transparente.png","bits64":"xunan-kab-pixel-64-bits-transparente.png","fuego":"xunan-kab-pintura-amate-transparente.png","deco":"xunan-kab-art-deco-transparente.png","cinema":"xunan-kab-poligonos-cinematicos-transparente.png","lowpoly":"xunan-kab-lowpoly-transparente.png","flat":"xunan-kab-geometria-suave-transparente.png","cyber":"xunan-kab-cyberpunk-lluvioso-transparente.png","barro":"xunan-kab-plastilina-transparente.png","agua":"xunan-kab-cianotipia-transparente.png","grabado":"xunan-kab-grabado-linoleo-transparente.png","acuarela":"xunan-kab-acuarela-tinta-transparente.png","hielo":"xunan-kab-origami-transparente.png","biolum":"xunan-kab-bosque-bioluminiscente-transparente.png","neon":"xunan-kab-neon-synthwave-transparente.png","anime":"xunan-kab-cielo-anime-transparente.png","oleo":"xunan-kab-oleo-impresionista-transparente.png"},"pirata":{"bruma":"lorencillo-bruma-transparente.png","ocaso":"lorencillo-ocaso-transparente.png","miniatura":"lorencillo-macro-transparente.png","bits8":"lorencillo-pixel-8-bits-transparente.png","cielo":"lorencillo-carta-celeste-transparente.png","cuaderno":"lorencillo-cuaderno-lapiz-transparente.png","codex":"lorencillo-codice-maya-transparente.png","bordado":"lorencillo-punto-cruz-transparente.png","nouveau":"lorencillo-art-nouveau-transparente.png","sumie":"lorencillo-tinta-sumi-e-transparente.png","paper":"lorencillo-papel-recortado-transparente.png","vitral":"lorencillo-vitral-transparente.png","hollin":"lorencillo-hollin-transparente.png","eco":"lorencillo-diorama-2-5d-transparente.png","pixel":"lorencillo-pixel-16-bits-transparente.png","bits32":"lorencillo-pixel-32-bits-transparente.png","bits64":"lorencillo-pixel-64-bits-transparente.png","fuego":"lorencillo-pintura-amate-transparente.png","deco":"lorencillo-art-deco-transparente.png","cinema":"lorencillo-poligonos-cinematicos-transparente.png","lowpoly":"lorencillo-lowpoly-transparente.png","flat":"lorencillo-geometria-suave-transparente.png","cyber":"lorencillo-cyberpunk-transparente.png","barro":"lorencillo-plastilina-transparente.png","agua":"lorencillo-cianotipia-transparente.png","grabado":"lorencillo-linoleo-transparente.png","acuarela":"lorencillo-acuarela-tinta-transparente.png","hielo":"lorencillo-origami-transparente.png","biolum":"lorencillo-bosque-bioluminiscente-transparente.png","neon":"lorencillo-neon-synthwave-transparente.png","anime":"lorencillo-cielo-anime-transparente.png","oleo":"lorencillo-oleo-transparente.png"}};
  const cache = Object.create(null);
  const ataquesCamazotz = new Image();
  ataquesCamazotz.src = '../Roguelike/assets/forge/jefes/camazotz-anime-ataques-v2/sheet-transparent.png';
  const ataquesXunan = new Image();
  ataquesXunan.src = '../Roguelike/assets/forge/jefes/xunan-anime-acciones-v1/sheet-transparent.png';
  const accionesLorencillo = new Image();
  accionesLorencillo.src = '../Roguelike/assets/forge/jefes/lorencillo-anime-acciones-v1/sheet-transparent.png';
  const estiloDe = f => String(window.estiloArteDerivado || (f.st && f.st.id) || '').split('~')[0];
  function obtener(tipo, estilo) {
    const id = typeof estilo === 'string' ? estilo : String(window.estiloArteDerivado || estilo && estilo.id || '').split('~')[0];
    const archivo = archivos[tipo] && archivos[tipo][id]; if (!archivo) return null;
    const clave = tipo + ':' + id;
    if (!cache[clave]) { const imagen = new Image(); imagen.decoding = 'async'; imagen.src = '../Roguelike/assets/jefes/' + archivo; cache[clave] = imagen; }
    const im = cache[clave]; return im.complete && im.naturalWidth ? im : null;
  }
  function pinta(c, o, f, im, tipo) {
    const t = f.t || 0, estado = o.st || '', ataque = estado === 'ataque', abierto = estado === 'ventana' || estado === 'herido';
    c.save();
    c.translate(o.x, o.y);
    if (tipo !== 'camazotz') c.scale(o.face || 1, 1);
    if (o.stunT > 0) c.rotate(Math.sin(t * 6) * .08);
    else if (tipo === 'camazotz' && ataque && o.atk === 'picada') c.rotate((o.lado || 1) * .14 * Math.sin(Math.min(1, Math.max(0, (o.at - .8) / 1.3)) * Math.PI));
    else if (tipo === 'pirata') c.rotate(Math.sin(t * 1.3) * .018);
    if (estado === 'muere') c.globalAlpha *= Math.max(0, 1 - (o.at || 0) / 2.4);
    if (o.flash > 0 && Math.sin(t * 40) > 0) c.filter = 'brightness(2)';
    c.imageSmoothingEnabled = true;
    if (tipo === 'camazotz') {
      const estilo = estiloDe(f), tiempo = o.at || 0;
      const pose = ataque && o.atk === 'picada' && tiempo >= .8 && tiempo < 2.1 ? 0 :
        ataque && o.atk === 'chillido' && tiempo >= .5 && tiempo < 2.15 ? 1 :
        ataque && o.atk === 'oscuridad' && tiempo >= .35 && tiempo < 4.2 ? 2 : -1;
      if (estilo === 'anime' && pose >= 0 && ataquesCamazotz.complete && ataquesCamazotz.naturalWidth) {
        // El margen de la hoja conserva la escala del cuerpo; solo las alas
        // ondulan durante el ataque y la cabeza permanece en su sitio.
        const sx = (pose % 2) * 256, sy = Math.floor(pose / 2) * 256, bandas = 40;
        const aleteo = Math.sin(t * (pose === 0 ? 8 : 5));
        const posicion = u => {
          const x = (u - .5) * 140, ala = Math.max(0, (Math.abs(x) - 20) / 50);
          return x - Math.sign(x) * ala * (1 - aleteo) * 2;
        };
        for (let i = 0; i < bandas; i++) {
          const u = i / bandas, v = (i + 1) / bandas;
          const punta = Math.max(0, (Math.abs(((u + v) / 2 - .5) * 140) - 20) / 50);
          const x = posicion(u), siguiente = posicion(v);
          c.drawImage(ataquesCamazotz, sx + u * 256, sy, 256 / bandas, 256,
            x, -60 + aleteo * punta * punta * 2, siguiente - x + .08, 110);
        }
      } else {
      // Las franjas conservan el mismo dibujo y mueven las alas alrededor
      // del cuerpo: así la cara y el núcleo no cambian entre fotogramas.
      const fase = t * (ataque && o.atk === 'picada' ? 9 : 5.2);
      const encoge = ataque && o.atk === 'oscuridad' ? Math.min(1, Math.max(0, (tiempo - .25) * 2), Math.max(0, (4.3 - tiempo) * 2)) : 0;
      const aleteo = Math.sin(fase), bandas = 48, ancho = im.naturalWidth, alto = im.naturalHeight;
      const posicion = u => {
        const x = (u - .5) * 100, distancia = Math.max(0, (Math.abs(x) - 14) / 36);
        return x - Math.sign(x) * distancia * ((1 - aleteo) * 3.5 + encoge * 9);
      };
      for (let i = 0; i < bandas; i++) {
        const u0 = i / bandas, u1 = (i + 1) / bandas, medio = (u0 + u1) / 2;
        const x0 = posicion(u0), x1 = posicion(u1), punta = Math.max(0, (Math.abs((medio - .5) * 100) - 14) / 36);
        const sacudida = ataque && o.atk === 'chillido' && tiempo > .5 && tiempo < 2.2 ? Math.sin(t * 23) * .7 : 0;
        const y = -36 + aleteo * punta * punta * 3.2 + sacudida;
        c.drawImage(im, u0 * ancho, 0, ancho / bandas, alto, x0, y, x1 - x0 + .08, 66);
      }
      }
    }
    else if (tipo === 'abeja') {
      const tiempo = o.at || 0, q = ataque && o.atk === 'enjambre' && tiempo > .3 ? 1 : ataque && o.atk === 'miel' && tiempo > .3 ? 2 : ataque && o.atk === 'aguijon' && tiempo >= .9 && tiempo < 2.1 ? 3 : -1;
      if (estiloDe(f) === 'anime' && q >= 0 && ataquesXunan.complete && ataquesXunan.naturalWidth) {
        // Mantener el aleteo también mientras prepara y ejecuta ataques.
        const sx = (q % 2) * 256, sy = Math.floor(q / 2) * 256, bandas = 40;
        const fase = Math.sin(t * (o.atk === 'aguijon' ? 16 : 12));
        const xAla = u => { const x = (u - .5) * 123, ala = Math.max(0, (Math.abs(x) - 22) / 39.5); return x - Math.sign(x) * ala * (1 - fase) * 2; };
        for (let i = 0; i < bandas; i++) {
          const u = i / bandas, v = (i + 1) / bandas, x = xAla(u), siguiente = xAla(v);
          const punta = Math.max(0, (Math.abs(((u + v) / 2 - .5) * 123) - 22) / 39.5);
          c.drawImage(ataquesXunan, sx + u * 256, sy, 256 / bandas, 256,
            x - 8.5, -76 + fase * punta * punta * 1.5, siguiente - x + .08, 116);
        }
      } else {
        // Se animan las franjas exteriores sin mover la cabeza ni el núcleo.
        const bandas = 40, sw = im.naturalWidth, sh = im.naturalHeight, fase = Math.sin(t * (ataque ? 14 : 9));
        const alas = u => { const x = (u - .5) * 70, k = Math.max(0, (Math.abs(x) - 13) / 22); return x - Math.sign(x) * k * (1 - fase) * 2; };
        if (ataque && o.atk === 'aguijon' && tiempo >= .9 && tiempo < 2.1) c.rotate(.18);
        for (let i = 0; i < bandas; i++) {
          const u0 = i / bandas, u1 = (i + 1) / bandas, x0 = alas(u0), x1 = alas(u1);
          const extremo = Math.max(0, (Math.abs(((u0 + u1) / 2 - .5) * 70) - 13) / 22);
          c.drawImage(im, u0 * sw, 0, sw / bandas, sh, x0 - 8, -45 + fase * extremo * 1.5, x1 - x0 + .08, 66);
        }
      }
    }
    else if (tipo === 'pirata') {
      const a = o.at || 0;
      const disparo = ataque && o.atk === 'canones' && a > .3 && a < 2.1 && (a - .3) % .6 < .18;
      const ancla = ataque && o.atk === 'ancla' && a >= .8 && a < 2.1;
      const q = ancla ? 3 : disparo ? 2 : Math.sin(t * 2) > 0 ? 1 : 0;
      if (estiloDe(f) === 'anime' && accionesLorencillo.complete && accionesLorencillo.naturalWidth) {
        // Las velas siguen ondeando aun cuando dispara o baja el ancla.
        const sx = (q % 2) * 256, sy = Math.floor(q / 2) * 256, bandas = 32;
        const retroceso = disparo ? Math.sin(Math.PI * ((a - .3) % .6) / .18) * 1.2 : 0;
        for (let i = 0; i < bandas; i++) {
          const u = i / bandas, v = (i + 1) / bandas;
          const vela = Math.max(0, Math.min(1, (.68 - u) * 3));
          const onda = Math.sin(t * 3.2 + u * 8) * vela * 1.2;
          c.drawImage(accionesLorencillo, sx, sy + u * 256, 256, 256 / bandas,
            -56 + onda - retroceso, -80 + u * 112, 112, (v - u) * 112 + .08);
        }
      } else {
        // Mover las franjas de las velas, dejando el casco y su núcleo fijos.
        const bandas = 32, sw = im.naturalWidth, sh = im.naturalHeight;
        const retroceso = disparo ? Math.sin(Math.PI * ((a - .3) % .6) / .18) * 1.2 : 0;
        for (let i = 0; i < bandas; i++) {
          const u = i / bandas, v = (i + 1) / bandas;
          const vela = Math.max(0, Math.min(1, (.72 - u) * 3));
          const onda = Math.sin(t * 3.2 + u * 8) * vela * 1.2;
          c.drawImage(im, 0, u * sh, sw, sh / bandas, -38 + onda - retroceso, -53 + u * 64, 76, (v - u) * 64 + .08);
        }
      }
    }
    else c.drawImage(im, -60, -103, 120, 103);
    c.restore();
    if (abierto) { const nucleo = X.core(o); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, nucleo.x, nucleo.y, 8, '#c7fff0', .38 + .1 * Math.sin(t * 6)); c.restore(); }
  }
  for (const tipo of Object.keys(archivos)) {
    const anterior = X.BODY[tipo];
    X.BODY[tipo] = (c, o, f) => { const im = obtener(tipo, estiloDe(f)); if (im) return pinta(c, o, f, im, tipo); return anterior(c, o, f); };
  }
  window.JEFES_VARIANTES = { archivos, obtener };
})();
