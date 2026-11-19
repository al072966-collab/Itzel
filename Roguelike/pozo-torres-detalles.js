'use strict';
// Adornos de fondo que conservan intactos los apoyos, vitrales y obstáculos activos.
(function () {
  if (typeof vestirNivel !== 'function' || typeof NIVELES === 'undefined') return;
  for (const spec of [
    {id:'bolonchen', estilo:'lowpoly', carpeta:'pozo-detalles', piezas:[[4,15,'antorcha-muro'],[23,30,'antorcha'],[4,46,'antorcha-muro'],[23,66,'antorcha'],[8,10,'estalac0'],[16,22,'estalac1'],[10,36,'estalac2'],[18,52,'estalac0'],[9,60,'estalac1'],[14,26,'arcoCueva'],[6,40,'pico1'],[20,44,'pico0'],[12,56,'cristal0'],[19,18,'cristal1'],[5,24,'roca0'],[21,38,'roca1'],[14,64,'charco0'],[9,50,'charco1'],[13,12,'marco'],[7,70,'tendedero']]},
    {id:'torres', estilo:'vitral', carpeta:'torres-detalles', piezas:[[4,75,'farol'],[19,58,'farol'],[4,38,'farol'],[19,12,'campana'],[11,70,'vitralAzul'],[11,54,'vitralRojo'],[11,42,'vitralVerde'],[11,28,'vitralAmarillo'],[11,16,'roseton'],[3,66,'columna0'],[20,50,'columna1'],[3,32,'columna2'],[20,24,'columna3'],[19,34,'farolCadena'],[4,22,'farolPared'],[11,8,'fronton'],[16,64,'aguja'],[7,46,'friso0']]}
  ]) {
    const def = NIVELES[spec.id]; if (!def) continue;
    const V = vestirNivel({id:spec.estilo,nivel:spec.id,carpeta:spec.carpeta,ver:1}), antes = def.pinta;
    def.pinta = function(c,j,f,capa) {
      if (antes) antes.apply(this, arguments);
      if (capa !== 'atras' || j.def.id !== spec.id || !V.todo()) return;
      for (const [col,row,n] of spec.piezas) {
        const x=col*T,y=row*T;
        if (x<j.cam.x-60 || x>j.cam.x+VW+60 || y<j.cam.y-60 || y>j.cam.y+VH+60) continue;
        V.spr(c,n,x,y,{ay:.5,alfa:n.startsWith('vitral')||n.startsWith('farol')||n.startsWith('antorcha')?.5:.32});
      }
      const t = j.t || 0, cx = j.cam.x, cy = j.cam.y;
      if (spec.id === 'bolonchen') {
        // las antorchas con una luz cálida que titila, y los cristales azules con un brillo que respira
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [col,row,n] of spec.piezas) {
          const x = col * T, y = row * T; if (x - cx < -80 || x - cx > VW + 80 || y - cy < -80 || y - cy > VH + 80) continue;
          if (n.startsWith('antorcha')) glowDot(c, x, y - 4, 34 + Math.sin(t * 9 + col) * 3, '#ff9a40', .30 + .06 * Math.sin(t * 13 + row));
          else if (n.startsWith('cristal')) glowDot(c, x, y, 26 + Math.sin(t * 2 + col) * 4, '#7fc6ff', .32 + .10 * Math.sin(t * 2.4 + row));
        }
        c.restore();
        // el haz de luz que cae por la boca del pozo cuando estás cerca de arriba
        c.save(); c.translate(cx, cy);
        if (cy < 140) { const a = Math.max(0, 1 - cy / 140) * .25, lg = c.createLinearGradient(0, 0, 0, VH); lg.addColorStop(0, 'rgba(190,215,255,' + a.toFixed(3) + ')'); lg.addColorStop(1, 'rgba(190,215,255,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lg; c.beginPath(); c.moveTo(70, 0); c.lineTo(150, 0); c.lineTo(230, VH); c.lineTo(110, VH); c.closePath(); c.fill(); c.restore(); }
        // polvo que flota en el aire de la gruta, y gotas que caen de las estalactitas y salpican
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 34; i++) { const x = (V.h1(i, 81) * (VW + 40) - cx * .15 + Math.sin(t * .5 + i) * 6) % (VW + 40), y = ((V.h1(i, 82) * VH + t * (3 + V.h1(i, 83) * 4)) % VH); c.fillStyle = 'rgba(210,225,255,' + (.18 + .25 * Math.abs(Math.sin(t + i))).toFixed(2) + ')'; c.fillRect((x + VW + 40) % (VW + 40) - 20, y, 1, 1); }
        for (let i = 0; i < 4; i++) { const ph = (t * .55 + i * .27) % 1, x = 40 + i * 95 + V.h1(i, 91) * 30; if (ph < .85) { c.fillStyle = 'rgba(170,215,255,.7)'; c.fillRect(x, 20 + ph * ph * 170, 1, 2); } else { c.strokeStyle = 'rgba(170,215,255,' + (1 - (ph - .85) / .15).toFixed(2) + ')'; c.lineWidth = .6; c.beginPath(); c.ellipse(x, 190, 1 + (ph - .85) * 40, .8, 0, 0, 6.2832); c.stroke(); } }
        c.restore(); c.restore();
      }
      if (spec.id === 'torres') {
        const COL = { vitralAzul: '90,160,255', vitralRojo: '255,90,70', vitralVerde: '90,240,130', vitralAmarillo: '255,210,70' };
        c.save(); c.globalCompositeOperation = 'lighter';
        const nombres = ['vitralAzul', 'vitralRojo', 'vitralVerde', 'vitralAmarillo'];
        for (let row = 10; row <= 74; row += 8) {      // los vitrales de la pared derecha del cuarto, cada ocho filas
          const x = 10 * T + 6, y = row * T + 8; if (y - cy < -150 || y - cy > VH + 140) continue;
          const n = nombres[(row / 8 | 0) % 4];
          const rg = c.createLinearGradient(x, y, x - 100, y + 130); rg.addColorStop(0, 'rgba(' + COL[n] + ',' + (.38 + .06 * Math.sin(t * 1.3 + row)).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + COL[n] + ',0)');
          c.fillStyle = rg; c.beginPath(); c.moveTo(x + 2, y - 14); c.lineTo(x - 2, y + 10); c.lineTo(x - 120, y + 136); c.lineTo(x - 52, y + 140); c.closePath(); c.fill();
          glowDot(c, x, y, 26, 'rgb(' + COL[n] + ')', .26);
        }
        for (const [col,row,n] of spec.piezas) {
          const x = col * T, y = row * T; if (x - cx < -120 || x - cx > VW + 120 || y - cy < -140 || y - cy > VH + 140) continue;
          if (n.startsWith('farol')) glowDot(c, x, y + 4, 22 + Math.sin(t * 6 + col) * 2, '#ffc860', .30 + .05 * Math.sin(t * 8 + row));
        }
        c.translate(cx, cy);
        for (let i = 0; i < 30; i++) { const x = (V.h1(i, 71) * (VW + 40) - cx * .12 + Math.sin(t * .6 + i) * 5 + VW + 40) % (VW + 40) - 20, y = ((V.h1(i, 72) * VH + t * (2 + V.h1(i, 73) * 3)) % VH); c.fillStyle = 'rgba(255,240,200,' + (.15 + .3 * Math.abs(Math.sin(t * 1.2 + i))).toFixed(2) + ')'; c.fillRect(x, y, 1, 1); }
        c.restore();
      }
    };
    window['DETALLES_'+spec.id.toUpperCase()] = V;
  }
})();
