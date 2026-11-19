'use strict';
// =====================================================================
//  SUBJEFES
//  Cada mundo de plataformas guarda, cerca del final, a una criatura suya
//  sacada de algo real de Campeche: la culebrina de un baluarte, el pulpo
//  maya, la escalera de Bolonchén, la ceiba con espinas, el chapopote de
//  Cantarell… No son enemigos agrandados: cada una tiene su cuerpo
//  (subjefes-arte.js), su manera de moverse y dos ataques suyos.
//  Pelean en un tramo de piso parejo (su arena). Entre ataque y ataque se
//  cansan (ojos en espiral): ese es el momento seguro para caerles encima.
//  Las que traen coraza (espinas, concha, piedra, vapor…) solo se dejan
//  pisar cansadas. Tras cada golpe se escapan un poco. Se les puede
//  rodear, pero al vencerlas se rinden y sueltan un corazón. Nadie muere.
//    mov: paso (camina), brinco, tumbo (de punta a punta), rueda, flota,
//         excava (se esconde bajo el piso y sale a atacar)
//    ataques: ver ATQ (embestida, salto, ondas, lluvia, crias, pilares,
//         rayo, remolino, erizo, picada, granizo, latigazo, charco, bomba,
//         espejismo)
//  Las ventajas del mundo (ventajas.js) son solo de los jefes.
// =====================================================================
const SUBJEFES = (() => {
  const { OBJ, ring, FOE, FD, BEH } = MEC, ARTE = () => window.SUBJEFES_ARTE;
  const LISTA = {
    pixel: { clave: 'culebrina', nombre: 'La Culebrina de San Carlos', mov: 'paso', v: 26, ataques: ['granizo', 'embestida'], vida: 3, w: 30, h: 22, granizo: 'bala', cosa: 'balas de cañón', col: ['#b8863a', '#4a2a10', '#ffe0a0'],
      lema: 'Se bajó del baluarte a ver quién se acerca a la muralla sin permiso. Dispara al cielo para que las balas les caigan a los demás.', dato: 'La culebrina era un cañón largo y delgado. El Baluarte de San Carlos fue de los primeros de la muralla y hoy guarda cañones de la época.' },
    ocaso: { clave: 'sol', nombre: 'El Sol que no se mete', mov: 'excava', hundeMax: .62, v: 34, ataques: ['rayo', 'granizo'], vida: 3, w: 28, h: 30, granizo: 'chispa', cosa: 'chispas de sol', col: ['#ff9a3a', '#7a2a10', '#ffe6a0'],
      lema: 'Está tan a gusto en el atardecer de Seybaplaya que no se quiere meter: se asoma del mar, suelta un rayo y avienta chispas.', dato: 'La costa de Campeche mira al poniente: el sol se mete en el mar, y en Seybaplaya los atardeceres son famosos.' },
    acuarela: { clave: 'gota', nombre: 'La Gota del Cenote', mov: 'brinco', ataques: ['salto', 'crias'], vida: 3, w: 28, h: 30, cria: 'gotita', crias: 'gotitas', col: ['#4ab0e0', '#1a4a7a', '#d8f4ff'],
      lema: 'Se escapó del Cenote Azul y brinca como gota en charco, con todo y su pececito. Sus gotitas la siguen a todos lados.', dato: 'El Cenote Azul de Miguel Colorado, en Champotón, es un cenote de paredes altísimas rodeado de selva.' },
    paper: { clave: 'rehilete', nombre: 'El Rehilete de la 59', mov: 'rueda', v: 62, coraza: true, ataques: ['embestida', 'erizo'], vida: 3, w: 30, h: 32, proy: 'papel', cosa: 'papelitos filosos', col: ['#ff4f9a', '#3a1a3a', '#fff2d0'],
      lema: 'Rueda por toda la Calle 59 y, mientras gira, no hay quien le caiga encima: hay que esperar a que se maree.', dato: 'La Calle 59 es la calle peatonal del centro histórico de Campeche; en las fiestas se adorna con papel picado.', pisar: 'Solo cuando deja de girar y se marea.' },
    biolum: { clave: 'mangle', nombre: 'El Mangle Viejo de los Petenes', mov: 'paso', v: 22, ataques: ['pilares', 'crias'], vida: 4, w: 30, h: 40, pilar: 'raiz', pilares: 'raíces', cria: 'propagulo', crias: 'propágulos', col: ['#2a6a4a', '#1a2a1a', '#7ff0e0'],
      lema: 'Camina sobre sus raíces por el manglar. Hace brotar raíces bajo los pies de Itzel, y de sus ramas caen propágulos que se plantan solos.', dato: 'Los Petenes son islas de selva en medio del manglar, en la costa norte de Campeche. Las semillas del mangle rojo germinan colgadas del árbol y caen ya listas para plantarse.' },
    flat: { clave: 'pulpo', nombre: 'El Pulpo Maya', mov: 'brinco', ataques: ['charco', 'latigazo'], vida: 3, w: 30, h: 30, charco: 'tinta', charcos: 'tinta que mancha el piso', latigo: 'tentaculo', latigazo: 'un latigazo con un tentáculo', col: ['#c8603a', '#3a1010', '#f0a070'],
      lema: 'Escupe tinta que mancha el piso y sus tentáculos llegan lejos. La mancha bajo cada ojo no es un ojo, aunque lo parezca.', dato: 'El pulpo maya solo vive en la península de Yucatán. Campeche es de los estados que más lo pescan, con el gareteo: lanchas a la deriva con varas y líneas.' },
    sumie: { clave: 'palotinte', nombre: 'El Palo de Tinte', mov: 'paso', v: 24, ataques: ['latigazo', 'lluvia'], vida: 3, w: 22, h: 38, latigo: 'rama', latigazo: 'un latigazo con una rama', proy: 'vaina', cosa: 'vainas de tinte', col: ['#4a3434', '#1a0a0a', '#8a1a4a'],
      lema: 'Un palo de tinte con muy mal genio: azota sus ramas al ras del piso y avienta vainas que manchan de rojo.', dato: 'El palo de Campeche dio un tinte rojo y morado muy buscado en Europa. Por él llegaron barcos, y piratas, a la Laguna de Términos.' },
    neon: { clave: 'reflector', nombre: 'El Reflector de Puerta de Tierra', mov: 'paso', v: 30, ataques: ['rayo', 'espejismo'], vida: 3, w: 24, h: 34, col: ['#ff2bd6', '#1a1a2a', '#ffe0fa'],
      lema: 'Dice que la función no empieza sin él. Avisa con una línea de luz antes de soltar el rayo, y se apaga para prenderse del otro lado.', dato: 'En la Puerta de Tierra se presenta un espectáculo de luz y sonido sobre la historia de la ciudad.' },
    bruma: { clave: 'bruma', nombre: 'La Bruma de Hochob', mov: 'flota', alto: 22, ataques: ['espejismo', 'remolino'], vida: 3, w: 30, h: 30, col: ['#d8d4cc', '#3a3430', '#4ad0c8'],
      lema: 'Neblina del monte con la cara de la puerta de Hochob. Se desvanece, sale donde no la esperan y jala aire para tragarse a quien pase.', dato: 'Hochob y Santa Rosa Xtampak son sitios del estilo Chenes, famosos por sus fachadas con una gran boca de monstruo en la puerta.' },
    lowpoly: { clave: 'escalera', nombre: 'La Escalera de Bolonchén', mov: 'tumbo', ataques: ['salto', 'granizo'], vida: 3, w: 18, h: 32, granizo: 'piedra', cosa: 'piedritas del techo de la gruta', col: ['#a8844a', '#3a2a14', '#e8d0a0'],
      lema: 'Bajó a la gruta por agua tantas veces que aprendió a caminar sola, de punta a punta. Cuando brinca, del techo caen piedritas.', dato: 'En las grutas de Bolonchén se bajaba por agua con escaleras de madera amarradas con bejuco. Frederick Catherwood dibujó una en 1842.' },
    codex: { clave: 'estela', nombre: 'La Estela de Edzná', mov: 'brinco', coraza: true, cae: true, ataques: ['salto', 'ondas'], vida: 3, w: 18, h: 36, col: ['#c8b890', '#3a2a14', '#c8442a'],
      lema: 'Brinca con todo su peso y cae de cara. Parada es pura piedra: solo acostada se le puede caer encima.', dato: 'Edzná tiene estelas de piedra labradas con sus gobernantes y fechas en cuenta larga.', pisar: 'Solo cuando queda acostada, después de su golpe.' },
    oleo: { clave: 'garita', nombre: 'La Garita del Fuerte', mov: 'paso', v: 24, coraza: true, ataques: ['lluvia', 'embestida'], vida: 3, w: 24, h: 38, proy: 'bala', cosa: 'balas de mosquete', col: ['#d8c8a8', '#3a2a1a', '#ffd23f'],
      lema: 'Se encierra en su caseta de piedra con el remate de fierro para arriba. Solo se asoma, cansada, después de disparar.', dato: 'Las murallas y los fuertes de Campeche tienen garitas: casetas de piedra en las esquinas desde donde se vigilaba el mar.', pisar: 'Solo cuando se asoma cansada y esconde el remate.' },
    vitral: { clave: 'roseton', nombre: 'El Rosetón de la Catedral', mov: 'flota', alto: 24, ataques: ['rayo', 'crias'], vida: 3, w: 30, h: 34, cria: 'vidrio', criaAire: true, crias: 'vidritos de colores', col: ['#2a6ad8', '#1a1418', '#fff4d0'],
      lema: 'Se soltó de la catedral y gira despacio, soltando rayos y vidritos de colores.', dato: 'La Catedral de Campeche tardó más de dos siglos en terminarse: una de sus torres es de 1760 y la otra de 1850.' },
    cuaderno: { clave: 'lapiz', nombre: 'El Lápiz de Catherwood', mov: 'brinco', ataques: ['pilares', 'salto'], vida: 3, w: 12, h: 41, pilar: 'estaca', pilares: 'estacas', col: ['#f2c230', '#3a3a40', '#ff8aa0'],
      lema: 'Dibuja estacas donde estés parado y luego se deja caer de punta. Lo que dibuja, después sirve de escalón.', dato: 'Frederick Catherwood recorrió Yucatán y Campeche con John Lloyd Stephens en 1841 y 1842, y dibujó las ruinas con muchísimo detalle.' },
    grabado: { clave: 'mascaron', nombre: 'El Mascarón de Proa', mov: 'paso', v: 30, ataques: ['embestida', 'lluvia'], vida: 3, w: 34, h: 36, proy: 'clavo', cosa: 'clavos de astillero', col: ['#7a4a24', '#1f1a1c', '#d8a83a'],
      lema: 'Se soltó de un galeón a medio construir y navega por el piso como si fuera el mar.', dato: 'Campeche tuvo astilleros desde el siglo XVI; ahí se construyeron barcos para la Armada española.' },
    anime: { clave: 'ola', nombre: 'La Marejada del Malecón', mov: 'rueda', v: 56, ataques: ['ondas', 'salto'], vida: 3, w: 32, h: 34, col: ['#2a8ae0', '#0a2a5a', '#ffffff'],
      lema: 'La ola que brinca el malecón cuando entra un norte. Revienta contra el piso y manda su espuma para los dos lados.', dato: 'Cuando entra un norte, el viento frío del norte, el mar del malecón de Campeche se pica y las olas brincan el muro.' },
    nouveau: { clave: 'ceiba', nombre: 'La Ceiba Joven', mov: 'paso', v: 24, coraza: true, espinas: true, ataques: ['erizo', 'lluvia'], vida: 3, w: 24, h: 40, proy: 'espina', cosa: 'sus espinas', proy2: 'algodon', cosa2: 'motas de algodón de ceiba', col: ['#6a9a5a', '#2a3a1a', '#fbf6ea'],
      lema: 'Mientras tiene sus espinas no se le puede caer encima. Cuando las avienta, queda pelona un ratito.', dato: 'La ceiba es el árbol sagrado de los mayas. De joven tiene el tronco verde cuajado de espinas, y sus frutos sueltan una especie de algodón.', pisar: 'Solo cuando avienta sus espinas y queda pelona.' },
    deco: { clave: 'apuntador', nombre: 'El Apuntador del Teatro Toro', mov: 'excava', v: 50, ataques: ['pilares', 'lluvia'], vida: 3, w: 30, h: 28, pilar: 'elevador', pilares: 'elevadores del escenario', proy: 'rosa', cosa: 'rosas del público', col: ['#d4af37', '#2a1a2a', '#e8c8a0'],
      lema: 'Se esconde bajo el escenario y sube por la trampilla a soplar el diálogo… y a aventar rosas.', dato: 'El Teatro Francisco de Paula Toro se inauguró en 1834. Los teatros de entonces tenían concha del apuntador: una caseta al pie del escenario desde donde se les soplaba el texto a los actores.' },
    cyber: { clave: 'chapopote', nombre: 'El Chapopote de Cantarell', mov: 'brinco', ataques: ['charco', 'crias'], vida: 3, w: 32, h: 24, charco: 'chapopote', charcos: 'chapopote que quema el piso', cria: 'gotachapo', crias: 'gotas de chapopote', col: ['#141018', '#000000', '#3ac8e0'],
      lema: 'Una mancha de chapopote con ganas de pelear: deja charcos que queman y gotas que caminan.', dato: 'El yacimiento Cantarell, en la Sonda de Campeche, se llama así por el pescador Rudesindo Cantarell, que en los años setenta avisó de una mancha de chapopote en el mar.' },
    cinema: { clave: 'fauces', nombre: 'La Casa de las Fauces', mov: 'paso', v: 20, ataques: ['remolino', 'lluvia'], vida: 4, w: 32, h: 36, proy: 'piedra', cosa: 'piedras', col: ['#d8cbb0', '#1a0c08', '#a8322a'],
      lema: 'La puerta con boca de monstruo de Chicanná echó a andar. Jala aire para tragarse a quien pase y escupe piedras.', dato: 'Chicanná quiere decir «casa de la boca de serpiente»: la puerta de su Estructura II tiene forma de las fauces de un monstruo de la tierra.' },
    vapor: { clave: 'caldera', nombre: 'La Caldera de Uayamón', mov: 'paso', v: 22, coraza: true, ataques: ['erizo', 'salto'], vida: 3, w: 26, h: 38, proy: 'vapor', cosa: 'chorros de vapor', col: ['#b8743a', '#1a0c06', '#f6e0a8'],
      lema: 'Cuando la aguja llega al rojo suelta todo su vapor. Mientras está caliente no se le puede tocar.', dato: 'La hacienda Uayamón procesaba henequén; sus máquinas desfibradoras se movían con calderas de vapor.', pisar: 'Solo cuando suelta el vapor y se enfría.' },
    barro: { clave: 'horno', nombre: 'El Horno de Tepakán', mov: 'paso', v: 22, ataques: ['lluvia', 'crias'], vida: 3, w: 32, h: 32, proy: 'brasa', cosa: 'brasas', cria: 'jarrito', crias: 'jarritos recién cocidos', col: ['#b8643a', '#2a0c06', '#ffd23f'],
      lema: 'Avienta brasas por la boca y saca jarritos recién cocidos que todavía no se enfrían.', dato: 'Tepakán, en Calkiní, es un pueblo de alfareros: sus ollas y cántaros se cuecen en hornos de leña.' },
    fuego: { clave: 'polvorin', nombre: 'El Polvorín', mov: 'paso', v: 30, ataques: ['bomba', 'embestida'], vida: 3, w: 24, h: 36, col: ['#8a5a2e', '#1a0a04', '#ffd23f'],
      lema: 'Trae la mecha prendida desde 1685. Deja bombitas y embiste sin fijarse.', dato: 'En 1685 el pirata Lorencillo saqueó Campeche. Después la ciudad se amuralló y guardó su pólvora en polvorines dentro de los baluartes.' },
    agua: { clave: 'caracol', nombre: 'El Caracol Reina de Cayos Arcas', mov: 'paso', v: 16, coraza: true, ataques: ['remolino', 'crias'], vida: 3, w: 34, h: 30, cria: 'burbuja', criaAire: true, crias: 'burbujas', col: ['#f0c8a0', '#3a1a10', '#ff8aa0'],
      lema: 'Se encierra en su concha, que tiene picos. Solo se asoma cuando se cansa de jalar la corriente.', dato: 'En los arrecifes del Golfo y del Caribe vive el caracol rosado o caracol reina; hoy está protegido porque se pescó de más.', pisar: 'Solo cuando se asoma de la concha.' },
    hielo: { clave: 'copo', nombre: 'El Copo de la Nevada', mov: 'flota', alto: 22, ataques: ['erizo', 'pilares'], vida: 3, w: 30, h: 34, proy: 'hielo', cosa: 'picos de hielo', pilar: 'carambano', pilares: 'carámbanos', col: ['#cfe8ff', '#1e4a72', '#ffffff'],
      lema: 'Un copo de papel doblado. Suelta picos de hielo y hace salir carámbanos del piso.', dato: 'Esto es un cuento: en Campeche casi nunca hace frío y no hay registro de que haya nevado.' },
    cielo: { clave: 'tortuga', nombre: 'La Tortuga de Orión', mov: 'flota', alto: 26, coraza: true, voltea: true, ataques: ['granizo', 'picada'], vida: 3, w: 34, h: 26, granizo: 'estrella', cosa: 'estrellas fugaces', col: ['#1a2a5a', '#0a1028', '#d8b860'],
      lema: 'Nada por el cielo con las estrellas en el caparazón. Si cae panza arriba, se le puede caer encima.', dato: 'Para los mayas, las tres estrellas del cinturón de Orión eran el caparazón de una tortuga.', pisar: 'Solo cuando cae panza arriba o baja cansada.' },
    hollin: { clave: 'volcan', nombre: 'El Volcancito del Chichonal', mov: 'brinco', ataques: ['granizo', 'ondas'], vida: 3, w: 32, h: 32, granizo: 'ceniza', cosa: 'piedras de ceniza', col: ['#5a5450', '#1a1410', '#ff7a2a'],
      lema: 'La ceniza que llegó del Chichonal se juntó en un cerrito que se cree volcán: retumba y avienta piedras de ceniza.', dato: 'En marzo y abril de 1982 hizo erupción el volcán Chichonal, en Chiapas, y su ceniza llegó hasta Campeche.' },
    bits8: { clave: 'cazon', nombre: 'El Cazón de la Calle 8', mov: 'excava', v: 70, aleta: true, ataques: ['salto', 'latigazo'], vida: 3, w: 36, h: 18, latigo: 'cola', latigazo: 'un coletazo', col: ['#8a8a9a', '#1a1a2a', '#f0ece0'],
      lema: 'Nada debajo de los ladrillos y solo se le ve la aleta, que también lastima. Sale de un brinco a morder.', dato: 'El pan de cazón es el platillo más famoso de Campeche: tortillas con cazón, un tiburón chico, guisado con frijol y bañadas en salsa de tomate.' },
    bits32: { clave: 'llave', nombre: 'La Llave de la Puerta de Mar', mov: 'tumbo', ataques: ['latigazo', 'salto'], vida: 3, w: 20, h: 34, latigo: 'llave', latigazo: 'una vuelta de llave', col: ['#4a4a5a', '#141420', '#d8a83a'],
      lema: 'Se escapó para que nadie pueda cerrar la ciudad. Camina de punta a punta y da vueltas de llave al ras del piso.', dato: 'La muralla de Campeche tenía cuatro puertas: la de Mar, la de Tierra, la de Guadalupe y la de San Román. De noche se cerraban.' },
    bits64: { clave: 'tapir', nombre: 'El Tapir de Calakmul', mov: 'paso', v: 26, ataques: ['embestida', 'ondas'], vida: 4, w: 36, h: 24, col: ['#4a4048', '#1a1418', '#d8ccb8'],
      lema: 'Es grandote y tranquilo, hasta que se le cierra el paso. Entonces embiste, y cuando pisa fuerte retumba la selva.', dato: 'El tapir es el mamífero de tierra más grande de México, y en Calakmul todavía vive en libertad.' },
    miniatura: { clave: 'tarantula', nombre: 'La Tarántula Yucateca', mov: 'paso', v: 36, ataques: ['salto', 'lluvia'], vida: 3, w: 40, h: 20, proy: 'pelo', cosa: 'pelos que pican', col: ['#3a2a22', '#140a06', '#c8642a'],
      lema: 'Para ustedes es enorme. Brinca sobre su presa y se rasca para soltar pelos que pican.', dato: 'La tarántula de trasero rojizo de Yucatán solo vive en la península. Si se asusta, se rasca la panza y suelta pelos que pican.' },
  };
  LISTA.uayamon_selva = LISTA.uayamon_taller = LISTA.vapor;
  const UNICOS = [...new Set(Object.values(LISTA))];
  // premios: cada pisotón suelta canisteles, al rendirse sueltan más y un corazón,
  // y si no les tocaron ni un golpe hay otro corazón y un bonito extra
  const PREMIO = 40, POR_GOLPE = 3, PERFECTO = 10, GRAV = 1000;
  const MOV = { paso: 'Camina hacia Itzel.', brinco: 'Va a brincos.', tumbo: 'Camina de punta a punta, dando la vuelta entera.', rueda: 'Rueda de un lado a otro de su arena.', flota: 'Flota en el aire; baja cuando se cansa.', excava: 'Se esconde bajo el piso y sale para atacar.' };

  // ---------------- utilidades ----------------
  const clampX = (e, x) => clamp(x, e.ax0 + e.w / 2, e.ax1 - e.w / 2);
  const toca = (p, x0, y0, x1, y1) => p && p.vis !== false && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1;
  const duele = (g, x) => MEC.hurt(g, g.p.x < x ? -1 : 1);
  // en la enciclopedia ataca a un blanco imaginario frente a él
  const blanco = (e, g) => e.vitrina ? e.vitrina : g.p;
  function vuela(e, d) {
    e.vy += GRAV * d; e.y += e.vy * d; e.x = clampX(e, e.x + (e.vx || 0) * d);
    if (e.y >= e.gy) { e.y = e.gy; e.vy = 0; e.vx = 0; return true; }
    return false;
  }
  function golpePiso(e, g, vida = 1.6) {
    g.shake = Math.max(g.shake || 0, .22);
    for (const v of [-1, 1]) g.objs.push({ k: 'ondaSub', x: e.x + v * e.w * .5, y: e.gy, v: v * 135, life: vida, col: e.sj.col });
    spawn(g, 14, e.x, e.gy, { ang: -Math.PI / 2, spread: 2.6, v: 90, life: .5, s: 2.2, k: 'dust', cols: ['#ffffff', '#d8c8a8'] });
  }
  function proy(g, e, x, y, vx, vy, gr, kind, extra) { g.objs.push(Object.assign({ k: 'sjProy', x, y, vx, vy, gr, kind: kind || e.sj.proy || 'piedra', col: e.sj.col, life: 3.2, rot: 0, n: Math.floor(Math.random() * 4), gy: e.gy }, extra)); }
  const pilarEn = (g, x) => g.solids && g.solids.some(s => s.k === 'sjPilarS' && x > s.x - 2 && x < s.x + s.w + 2);
  // el tramo de piso parejo donde pelea
  function arena(x, gy) {
    let a = x, b = x; const ok = xx => SOLID(xx, gy + 3) && !SOLID(xx, gy - 4) && !SOLID(xx, gy - 20);
    for (let i = 0; i < 14 && ok(a - T); i++) a -= T;
    for (let i = 0; i < 14 && ok(b + T); i++) b += T;
    return [Math.floor(a / T) * T + 2, Math.floor(b / T) * T + T - 2];
  }

  // ---------------- los ataques ----------------
  // av: segundos de aviso; cansa: lo que dura cansado después; pica: lastima aunque le caigan encima
  const ATQ = {
    embestida: { av: .8, cansa: 1.7, pica: true,
      aviso(e, g, d, b) { if (e.ft < .55) e.dir = Math.sign(b.x - e.x) || e.dir; e.tiembla = true; if (Math.random() < d * 20) spawn(g, 1, e.x - e.dir * e.w * .4, e.gy, { v: 30, life: .4, s: 1.6, k: 'dust', cols: ['#ffffff'] }); },
      ini(e) { e.tiembla = false; e.vel = e.sj.mov === 'rueda' ? 190 : 165; },
      paso(e, g, d) {
        e.x += e.dir * e.vel * d; e.paso += e.vel * d; e.giro += e.dir * e.vel * d / 16;
        if (Math.random() < d * 25) spawn(g, 1, e.x - e.dir * e.w * .5, e.gy, { v: 40, life: .4, s: 1.8, k: 'dust', cols: ['#ffffff', '#d8c8a8'] });
        const lim = e.dir > 0 ? e.ax1 - e.w / 2 : e.ax0 + e.w / 2;
        if ((e.dir > 0 ? e.x >= lim : e.x <= lim) || pilarEn(g, e.x + e.dir * e.w / 2) || e.ft > 3) {
          e.x = clampX(e, e.x); g.shake = Math.max(g.shake || 0, .3); ring(g, e.x + e.dir * e.w / 2, e.gy - e.h * .5, '#ffffff', 14, .3);
          spawn(g, 12, e.x + e.dir * e.w / 2, e.gy - e.h * .5, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#ffffff', '#ffd23f'] }); return true;
        }
      } },
    salto: { av: .6, cansa: 1.3,
      aviso(e, g, d, b) { e.agacha = clamp(e.ft / .6, 0, 1); e.dir = Math.sign(b.x - e.x) || e.dir; e.tx = clampX(e, b.x); },
      ini(e, g, b) { const Tt = .72; e.agacha = 0; e.tx = clampX(e, b.x); e.vy = -.5 * GRAV * Tt; e.vx = (e.tx - e.x) / Tt; e.y = Math.min(e.y, e.gy) - 1; e.hunde = 0; },
      paso(e, g, d) { if (e.sj.mov === 'tumbo') e.giro += e.dir * Math.PI * 2 * d / .72; if (vuela(e, d)) { e.giro = Math.round(e.giro / Math.PI) * Math.PI; golpePiso(e, g, .5); return true; } } },
    ondas: { av: .7, cansa: .9,
      aviso(e) { e.alza = clamp(e.ft / .7, 0, 1); },
      ini(e, g) { e.alza = 0; golpePiso(e, g, 1.6); },
      paso: e => e.ft > .3 },
    lluvia: { av: .6, cansa: .8,
      ini(e, g, b) {
        const tt = .95, y = e.y - e.h * .75, x = e.x + e.dir * e.w * .3, kind = e.sj.proy2 && Math.random() < .5 ? e.sj.proy2 : e.sj.proy, flojo = kind === 'algodon';
        for (const dx of [-34, 0, 34]) { const t2 = flojo ? 1.6 : tt, gr = flojo ? 120 : 420; proy(g, e, x, y, (b.x + dx - x) / t2, ((b.y - 6 - y) - .5 * gr * t2 * t2) / t2, gr, kind); }
        if (e.sj.clave === 'fauces') e.boca = .6;
      },
      paso(e) { if (e.ft > .35) { e.boca = 0; return true; } } },
    crias: { av: .7, cansa: 1,
      ini(e, g) {
        const vivas = g.foes.filter(q => q.dueno === e && q.st !== 'gone').length; if (vivas >= 3) return;
        for (const v of [-1, 1]) { const x = clamp(e.x + v * (e.w * .5 + 10), e.ax0 + 6, e.ax1 - 6), q = MEC.mkFoe('sjCria', x, e.sj.criaAire ? e.gy - 20 : e.gy); Object.assign(q, { dueno: e, kind: e.sj.cria, aire: !!e.sj.criaAire, gy: e.gy, cria: true, vidaFija: 1, ax0: e.ax0 - 30, ax1: e.ax1 + 30, dir: v }); g.foes.push(q); spawn(g, 10, x, e.gy - 8, { v: 60, life: .5, s: 1.8, k: 'spark', cols: ['#ffffff', e.sj.col[2]] }); }
      },
      paso: e => e.ft > .4 },
    pilares: { av: .5, cansa: 1.2,
      ini(e, g, b) { [0, -1, 1].forEach((k, i) => { const x = clamp(b.x + k * 36, e.ax0 + 8, e.ax1 - 8); if (Math.abs(x - e.x) < e.w / 2 + 12) return; g.objs.push({ k: 'sjPilar', x, gy: e.gy, t: -i * .22, tipo: e.sj.pilar, col: e.sj.col, h: 24 + (i ? 8 : 0) }); }); },
      paso: e => e.ft > 1.1 },
    rayo: { av: .9, cansa: 1, pica: false,
      prep(e, g) {
        const p = g.p; e.rAlto = !e.rAlto; const ph = (p && p.h) || 14, y = e.rAlto ? e.gy - ph - 7 : e.gy - 5, ox = e.x + e.dir * e.w * .4;
        g.objs.push({ k: 'sjRayo', x0: e.dir > 0 ? ox : ox - 240, x1: e.dir > 0 ? ox + 240 : ox, y, oy: e.y - e.h * .6, ox, t: 0, av: .9, dur: .55, col: e.sj.col, alto: e.rAlto });
      },
      aviso(e) { e.tiembla = e.ft > .6; },
      ini(e) { e.tiembla = false; },
      paso: e => e.ft > .55 },
    remolino: { av: .5, cansa: 1.4, pica: true,
      ini(e) { e.boca = 1; },
      paso(e, g, d) {
        const p = g.p, dx = e.x - p.x; e.boca = 1;
        if (!e.vitrina && Math.abs(dx) < 150 && Math.abs(p.y - e.y) < 70 && Math.abs(dx) > e.w / 2 + 6) { const s = Math.sign(dx), nx = p.x + s * 54 * d; if (!SOLID(nx + s * p.w / 2, p.y - 6)) p.x = nx; }
        if (Math.random() < d * 30) { const a = Math.random() * TAU, r = 50 + Math.random() * 30; spawn(g, 1, e.x + Math.cos(a) * r, e.y - e.h * .5 + Math.sin(a) * r * .5, { v: 10, life: .5, s: 1.4, k: 'dust', cols: ['rgba(255,255,255,.8)', e.sj.col[2]] }); }
        if (e.ft > 1.6) { e.boca = 0; return true; }
      } },
    erizo: { av: .8, cansa: 1.5, pica: true,
      aviso(e) { e.alza = clamp(e.ft / .8, 0, 1) * .6; e.presion = .3 + clamp(e.ft / .8, 0, 1) * .7; },
      ini(e, g) {
        e.alza = 0; const cx = e.x, cy = e.y - e.h * .55;
        for (let k = 0; k <= 6; k++) { const a = -Math.PI + k * Math.PI / 6; proy(g, e, cx + Math.cos(a) * e.w * .4, cy + Math.sin(a) * e.h * .4, Math.cos(a) * 125, Math.sin(a) * 125, 140); }
        if (e.sj.espinas) e.espinas = 0; e.presion = 0; ring(g, cx, cy, '#ffffff', e.w * .8, .3);
      },
      paso: e => e.ft > .4 },
    picada: { av: 1.1, cansa: 1.7,
      aviso(e, g, d, b) { e.y += (e.gy - 92 - e.y) * Math.min(1, d * 4); e.x = clampX(e, e.x + (b.x - e.x) * Math.min(1, d * 3)); e.tx = e.x; },
      ini(e) { e.vy = 0; },
      paso(e, g, d) { e.vy = Math.min(e.vy + 1600 * d, 520); e.y += e.vy * d; if (e.y >= e.gy) { e.y = e.gy; e.vy = 0; golpePiso(e, g, .55); g.shake = Math.max(g.shake || 0, .3); return true; } } },
    granizo: { av: .55, cansa: .8,
      ini(e, g, b) { const xs = [b.x, b.x - 30, b.x + 30, b.x + (Math.random() - .5) * 70]; xs.forEach((x, i) => g.objs.push({ k: 'sjMarca', x: clamp(x, e.ax0 - 30, e.ax1 + 30), gy: e.gy, t: -i * .18, cae: .9, kind: e.sj.granizo || 'piedra', col: e.sj.col })); if (e.sj.clave === 'culebrina') { spawn(g, 10, e.x + e.dir * 18, e.y - 30, { ang: -Math.PI / 2, spread: .8, v: 90, life: .7, s: 2.4, k: 'dust', cols: ['#ffffff', '#d8d0c0'] }); g.shake = Math.max(g.shake || 0, .15); } },
      paso: e => e.ft > 1.1 },
    latigazo: { av: .7, cansa: .9,
      aviso(e, g, d, b) { if (e.ft < .4) e.dir = Math.sign(b.x - e.x) || e.dir; e.latigo = -clamp(e.ft / .7, 0, 1) * .3; },
      paso(e, g, d) {
        const k = clamp(e.ft / .45, 0, 1), r = 60 * Math.sin(k * Math.PI); e.latigo = k; e.latigoR = r;
        const x0 = e.x + e.dir * e.w * .45, x1 = x0 + e.dir * r;
        if (!e.vitrina && r > 6 && toca(g.p, Math.min(x0, x1), e.gy - 10, Math.max(x0, x1), e.gy)) duele(g, e.x);
        if (e.sj.mov === 'tumbo') e.giro += e.dir * TAU * d / .45;
        if (k >= 1) { e.latigo = 0; e.latigoR = 0; e.giro = Math.round(e.giro / Math.PI) * Math.PI; return true; }
      } },
    charco: { av: .6, cansa: .8,
      ini(e, g, b) { const tt = .8, y = e.y - e.h * .7; for (const dx of [0, e.dir * 26]) proy(g, e, e.x, y, (b.x + dx - e.x) / tt, ((e.gy - 1 - y) - .5 * 420 * tt * tt) / tt, 420, e.sj.charco, { charco: e.sj.charco }); },
      paso: e => e.ft > .35 },
    bomba: { av: .6, cansa: 1,
      ini(e, g, b) { const tt = .7, y = e.y - e.h * .8; for (const dx of [0, -e.dir * 30]) g.objs.push({ k: 'sjBomba', x: e.x, y, vx: (b.x + dx - e.x) / tt, vy: ((e.gy - y) - .5 * 800 * tt * tt) / tt, gy: e.gy, t: 0, fuse: 1.3, suelo: false }); },
      paso: e => e.ft > .4 },
    espejismo: { av: .6, cansa: 1.1,
      aviso(e) { e.alfa = 1 - clamp(e.ft / .6, 0, 1); },
      ini(e, g, b) {
        const lado = Math.sign(e.x - b.x) || 1; e.x = clampX(e, b.x - lado * 54); e.dir = lado; e.alfa = 0;
        if (e.sj.mov === 'flota') e.y = e.gy - (e.sj.alto || 24); else { e.y = e.gy; e.hunde = 0; }
      },
      paso(e, g, d, b) {
        if (e.ft < .3) { e.alfa = e.ft / .3; return; }
        e.alfa = 1;
        if (e.sj.mov === 'flota') { e.x = clampX(e, e.x + e.dir * 150 * d); e.y += (b.y - 8 - e.y) * Math.min(1, d * 3); return e.ft > .9; }
        if (!e.salto) { e.salto = true; e.vy = -200; e.vx = e.dir * 120; e.y -= 1; }
        if (vuela(e, d)) { e.salto = false; return true; }
      } },
  };
  const DICE = {
    embestida: s => 'Escarba el piso y se lanza contra Itzel hasta chocar con la orilla; ahí se queda mareado.',
    salto: s => 'Se agacha y brinca hasta donde está Itzel; su sombra avisa dónde va a caer.',
    ondas: s => 'Golpea el piso y manda dos ondas, una para cada lado: hay que brincarlas.',
    lluvia: s => `Avienta tres ${s.cosa} en arco.${s.cosa2 ? ` A veces son ${s.cosa2}, que caen despacito.` : ''}`,
    crias: s => `Saca ${s.crias} que van tras Itzel. Se les puede caer encima.`,
    pilares: s => `Hace salir ${s.pilares} del piso donde está Itzel (antes tiembla el piso). Luego sirven de escalón.`,
    rayo: s => 'Avisa con una línea y suelta un rayo: si va abajo se brinca, si va arriba hay que quedarse en el piso.',
    remolino: s => 'Jala a Itzel hacia su cuerpo: hay que correr para el otro lado.',
    erizo: s => `Se infla y suelta ${s.cosa} para todos lados.`,
    picada: s => 'Se sube alto y se deja caer donde marca su sombra.',
    granizo: s => `Hace caer ${s.cosa} del cielo; las sombras en el piso avisan dónde.`,
    latigazo: s => `Da ${s.latigazo} al ras del piso: se brinca.`,
    charco: s => `Escupe ${s.charcos} un rato.`,
    bomba: s => 'Deja dos bombitas que estallan al rato: hay que alejarse.',
    espejismo: s => 'Se desvanece, sale del otro lado de Itzel y se le echa encima.',
  };

  // ---------------- el subjefe ----------------
  for (const s of UNICOS) {
    const k = 'sj_' + s.clave;
    FOE[k] = { beh: 'subjefe', w: s.w, h: s.h, v: 0, spiky: e => pica(e) };
    let dib = null; FD[k] = (c, e, t, sk) => { K().pal(sk || MEC.DEFAULT_SKIN.foe); (dib || (dib = ARTE().dibuja(s.clave)))(c, e, t); };
    // El arte de cada subjefe ya corresponde a su mundo; no volver a filtrarlo.
    if (window.FOE_ARTE) FOE_ARTE.GEN.delete(k);
  }
  const K = () => window.FOE_KIT;
  const fantasma = e => e.fase === 'huye' || (e.hunde || 0) > .35 || (e.alfa !== undefined && e.alfa < .5);
  function pica(e) { if (e.fase === 'cansado') return false; if (e.sj.coraza) return true; return e.fase === 'ataque' && !!(ATQ[e.atq] && ATQ[e.atq].pica); }
  function fase(e, f) {
    e.fase = f; e.ft = 0; e.tiembla = false; e.agacha = 0; e.alza = 0;
    if (f === 'aviso') e.avT = ATQ[e.atq].av;
    if (f === 'cansado') { e.durT = ATQ[e.atq] ? ATQ[e.atq].cansa : 1; e.vx = 0; if (e.sj.cae) e.tumbada = 1; if (e.sj.voltea && e.atq === 'picada') e.volteada = 1; e.hunde = 0; e.alfa = 1; e.latigo = 0; e.boca = 0; }
    if (f === 'anda' || f === 'huye') { e.tumbada = 0; e.volteada = 0; e.latigo = 0; e.boca = 0; e.alfa = 1; e.salto = false; }
  }
  const pausa = e => (e.hp <= e.max / 2 ? 1 : 1.7) + Math.random() * .6;
  function crea(s, x, gy, ax0, ax1) {
    const e = MEC.mkFoe('sj_' + s.clave, x, gy);
    Object.assign(e, { sj: s, sub: s, vidaFija: s.vida, gy, ax0, ax1, fase: 'anda', ft: 0, cd: 1.1, paso: 0, giro: 0, hunde: s.mov === 'excava' ? 1 : 0, cual: 1, hpVisto: s.vida, dir: -1, alfa: 1, espinas: 1, presion: .3, vy: 0, vx: 0 });
    if (s.mov === 'flota') { e.vuelo = gy - (s.alto || 24); e.y = e.vuelo; }
    return e;
  }
  function mueve(e, g, d, b) {
    const s = e.sj, dx = b.x - e.x, dir = Math.sign(dx) || e.dir;
    switch (s.mov) {
      case 'paso': e.dir = dir; if (Math.abs(dx) > 40) { const nx = clampX(e, e.x + dir * (s.v || 28) * d); e.paso += Math.abs(nx - e.x); e.x = nx; } break;
      case 'brinco': case 'tumbo':
        if (e.y < e.gy || e.vy) { if (s.mov === 'tumbo') e.giro += e.dir * Math.PI * d / .48; if (vuela(e, d)) { e.tb = s.mov === 'tumbo' ? .5 : .65; e.giro = Math.round(e.giro / Math.PI) * Math.PI; spawn(g, 4, e.x, e.gy, { v: 40, life: .35, s: 1.6, k: 'dust', cols: ['#ffffff'] }); } }
        else { e.tb = (e.tb ?? .5) - d; if (e.tb <= 0 && Math.abs(dx) > 30) { e.dir = dir; e.vy = s.mov === 'tumbo' ? -240 : -210; e.vx = dir * (s.mov === 'tumbo' ? 70 : 60); e.y -= 1; } }
        break;
      case 'rueda': { const v = s.v || 58; e.rdir = e.rdir || -1; e.x += e.rdir * v * d; e.giro += e.rdir * v * d / 16; e.paso += v * d; if (e.x <= e.ax0 + e.w / 2 || e.x >= e.ax1 - e.w / 2) { e.rdir *= -1; e.x = clampX(e, e.x); } e.dir = e.rdir; break; }
      case 'flota': e.y += (e.vuelo + Math.sin(e.t * 2) * 3 - e.y) * Math.min(1, d * 3); if (Math.abs(dx) > 24) e.x = clampX(e, e.x + dir * 26 * d); e.dir = dir; break;
      case 'excava':
        e.hunde = Math.min(s.hundeMax || 1, e.hunde + d * 2); if (Math.abs(dx) > 8) e.x = clampX(e, e.x + dir * (s.v || 50) * d); e.dir = dir; e.paso += d * 40;
        if (s.aleta && e.hunde > .5 && !e.vitrina && toca(g.p, e.x - 5, e.gy - 9, e.x + 5, e.gy)) duele(g, e.x);
        break;
    }
  }
  function piensa(e, g, d) {
    const s = e.sj, p = g.p, b = blanco(e, g); e.ft += d;
    e.sinSombra = (e.hunde || 0) > .5 || (e.alfa ?? 1) < .5;
    e.h = e.tumbada > .5 ? 12 : s.h;
    if (e.vitrina && g.p) g.p.vis = false;
    // tras un pisotón se escapa (y no se le puede volver a pegar en el aire)
    if (e.hp < e.hpVisto) {
      e.hpVisto = e.hp; fase(e, 'huye'); const lado = Math.sign(e.x - (b ? b.x : e.x)) || -e.dir;
      if (s.mov === 'flota' || s.mov === 'excava') e.vx = lado * 110; else { e.y = Math.min(e.y, e.gy) - 1; e.vy = -250; e.vx = lado * 120; }
    }
    if (!e.pelea) {
      if (e.vitrina || (p && Math.abs(p.x - e.x) < 150 && Math.abs(p.y - e.y) < 110)) e.pelea = true;
      else { if (s.mov === 'flota') e.y = e.vuelo + Math.sin(e.t * 2) * 3; return fantasma(e) ? 'skip' : undefined; }
    }
    const lejos = !e.vitrina && p && Math.abs(p.x - e.x) > 230;
    if (s.espinas && e.fase === 'anda') e.espinas = Math.min(1, (e.espinas ?? 1) + d / .6);
    if (e.fase === 'anda' && s.clave === 'caldera') e.presion = Math.min(.6, (e.presion || 0) + d * .15);
    switch (e.fase) {
      case 'anda': {
        mueve(e, g, d, b); if (!lejos) e.cd -= d;
        const enPiso = s.mov === 'flota' || s.mov === 'excava' || (e.y >= e.gy && !e.vy);
        if (e.cd <= 0 && enPiso) { e.cual = Math.random() < .25 ? e.cual : 1 - e.cual; e.atq = s.ataques[e.cual]; fase(e, 'aviso'); const A = ATQ[e.atq]; if (A.prep) A.prep(e, g); }
        break;
      }
      case 'aviso': {
        const A = ATQ[e.atq];
        if (s.mov === 'excava') e.hunde = Math.max(0, e.hunde - d / Math.max(.3, e.avT * .7));
        if (s.mov === 'flota' && e.atq !== 'picada' && e.atq !== 'espejismo') e.y += (e.vuelo - e.y) * Math.min(1, d * 3);
        if (A.aviso) A.aviso(e, g, d, b);
        if (e.ft >= e.avT) { e.hunde = e.atq === 'espejismo' ? e.hunde : 0; fase(e, 'ataque'); if (A.ini) A.ini(e, g, b); }
        break;
      }
      case 'ataque': if (ATQ[e.atq].paso(e, g, d, b)) fase(e, 'cansado'); break;
      case 'cansado':
        if (e.y < e.gy) e.y = Math.min(e.gy, e.y + 110 * d);
        if (e.ft >= e.durT) { fase(e, 'anda'); e.cd = pausa(e); }
        break;
      case 'huye':
        if (s.mov === 'flota') { e.y += (e.vuelo - 10 - e.y) * Math.min(1, d * 4); e.x = clampX(e, e.x + e.vx * d); if (e.ft > .6) { fase(e, 'anda'); e.cd = .8; } }
        else if (s.mov === 'excava') { e.hunde = Math.min(1, e.hunde + d * 3); e.x = clampX(e, e.x + e.vx * d); if (e.ft > .6) { fase(e, 'anda'); e.cd = .9; } }
        else if (vuela(e, d) || e.ft > 2) { fase(e, 'anda'); e.cd = .7; e.y = e.gy; e.vy = 0; }
        break;
    }
    return fantasma(e) ? 'skip' : undefined;
  }
  BEH.subjefe = (e, g, d) => piensa(e, g, d);

  // ---------------- sus crías ----------------
  FOE.sjCria = { beh: 'sjCria', w: 9, h: 9, v: 30 };
  FD.sjCria = (c, e, t, sk) => {
    const tipo = e.kind || 'gotita', quieta = e.st === 'sleep' || e.st === 'stun' || e.st === 'gone';
    const fase = quieta ? 0 : Math.floor(((e.anim ?? t) * 60 / 8) + (e.hx || 0)) % 4;
    const pose = quieta ? [0, 0, 0, 1, 1] : [
      [-.42, 0, -.12, 1.02, .96],
      [0, .55, .08, 1.1, .9],
      [.42, 0, .14, .96, 1.04],
      [0, -.62, -.06, .91, 1.12],
    ][fase];
    const [dx, dy, giro, sx, sy] = pose;
    const balanceo = tipo === 'propagulo' || tipo === 'jarrito' ? 1.35 : tipo === 'vidrio' || tipo === 'paca' ? .8 : 1;
    c.save();
    c.translate(dx, dy - (e.aire && fase === 3 ? .35 : 0));
    c.rotate(giro * balanceo);
    c.scale(sx, sy);
    K().pal(sk || MEC.DEFAULT_SKIN.foe);
    (ARTE().CRIA[tipo] || ARTE().CRIA.gotita)(c, e, quieta ? 0 : t);
    c.restore();
  };
  if (window.FOE_ARTE) FOE_ARTE.GEN.add('sjCria');
  BEH.sjCria = (q, g, d) => {
    const e = q.dueno; if (!e || e.st === 'gone' || !g.foes.includes(e)) { q.st = 'gone'; q.tt = 0; return 'skip'; }
    const b = blanco(e, g), dir = Math.sign(b.x - q.x) || q.dir; q.dir = dir;
    if (q.aire) { q.x = clamp(q.x + dir * 24 * d, q.ax0, q.ax1); q.y += (b.y - 14 + Math.sin(q.t * 3 + q.hx) * 6 - q.y) * Math.min(1, d * 1.5); }
    else { q.x = clamp(q.x + dir * 32 * d, q.ax0, q.ax1); q.y = q.gy; }
  };

  // ---------------- lo que dejan en la arena ----------------
  OBJ.sjProy = {
    step(o, g, dt) {
      o.vy += o.gr * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += dt * 8; o.life -= dt;
      if (toca(g.p, o.x - 3, o.y - 3, o.x + 3, o.y + 3)) { duele(g, o.x); o.dead = true; return; }
      if (o.charco && o.vy > 0 && o.y >= o.gy - 1) { g.objs.push({ k: 'sjCharco', x: o.x, gy: o.gy, w: 26, life: 3.2, kind: o.charco, col: o.col }); spawn(g, 6, o.x, o.gy, { v: 40, life: .4, s: 1.6, k: 'dust', cols: [o.kind === 'tinta' ? '#2a1a3a' : '#141018'] }); o.dead = true; return; }
      if (SOLID(o.x, o.y) || o.y > VH + 20 || o.life <= 0) { o.dead = true; spawn(g, 4, o.x, o.y, { v: 40, life: .3, s: 1.4, k: 'dust', cols: ['#ffffff'] }); }
    },
    draw(c, o, f) { const P = ARTE().PROY[o.kind] || ARTE().PROY.piedra; c.save(); P(c, o, f.t); c.restore(); },
  };
  OBJ.sjMarca = {
    step(o, g, dt) {
      o.t += dt; if (o.t < 0) return; const k = o.t - (o.cae - .32);
      if (k >= 0) { o.y = o.gy - 150 * (1 - k / .32); if (!o.pego && toca(g.p, o.x - 4, o.y - 5, o.x + 4, o.y + 4)) { o.pego = true; duele(g, o.x); } }
      if (o.t >= o.cae) { o.dead = true; spawn(g, 8, o.x, o.gy, { ang: -Math.PI / 2, spread: 2.4, v: 70, life: .45, s: 1.8, k: 'dust', cols: ['#ffffff', '#d8c8a8'] }); }
    },
    draw(c, o, f) {
      if (o.t < 0) return; const k = clamp(o.t / o.cae, 0, 1);
      c.save(); c.fillStyle = `rgba(20,10,20,${.18 + k * .3})`; c.beginPath(); c.ellipse(o.x, o.gy, 2 + k * 5, 1 + k * 1.6, 0, 0, TAU); c.fill();
      c.strokeStyle = `rgba(255,80,60,${.3 + .4 * Math.abs(Math.sin(f.t * 12))})`; c.lineWidth = .6; c.beginPath(); c.ellipse(o.x, o.gy, 8, 2.4, 0, 0, TAU); c.stroke();
      if (o.y !== undefined && o.t >= o.cae - .32) { const P = ARTE().PROY[o.kind] || ARTE().PROY.piedra; P(c, { x: o.x, y: o.y, vx: 0, vy: 1, rot: f.t * 6, n: 1 }, f.t); }
      c.restore();
    },
  };
  OBJ.sjPilar = {
    step(o, g, dt) {
      o.t += dt; if (o.t < .7) { if (o.t > 0 && Math.random() < dt * 14) spawn(g, 1, o.x + (Math.random() - .5) * 10, o.gy, { ang: -Math.PI / 2, spread: 1, v: 40, life: .3, s: 1.4, k: 'dust', cols: ['#d8c8a8'] }); return; }
      if (!o.salio) {
        o.salio = true; const x0 = o.x - 6;
        if (toca(g.p, x0, o.gy - o.h, x0 + 12, o.gy)) duele(g, o.x);
        else g.solids.push({ k: 'sjPilarS', x: x0, y: o.gy - o.h, w: 12, h: o.h, on: true, life: 2.6, grow: 0, tipo: o.tipo, col: o.col });
        spawn(g, 10, o.x, o.gy, { ang: -Math.PI / 2, spread: 1.6, v: 90, life: .45, s: 1.8, k: 'dust', cols: ['#ffffff', '#d8c8a8'] }); g.shake = Math.max(g.shake || 0, .1);
      }
      if (o.t > .8) o.dead = true;
    },
    draw(c, o, f) {
      if (o.t < 0 || o.salio) return; const a = .35 + .45 * Math.abs(Math.sin(f.t * 14));
      c.save(); c.strokeStyle = `rgba(40,20,10,${a})`; c.lineWidth = .8; c.beginPath(); c.moveTo(o.x - 7, o.gy - .5); for (let i = 1; i <= 6; i++) c.lineTo(o.x - 7 + i * 2.3, o.gy - .5 - (i % 2) * 1.6); c.stroke();
      c.fillStyle = `rgba(255,80,60,${a * .5})`; c.fillRect(o.x - 6, o.gy - 1.2, 12, 1.2); c.restore();
    },
  };
  OBJ.sjPilarS = {
    drawSolid(c, s, f) {
      const h = s.h * (s.grow ?? 1); c.save(); c.globalAlpha *= clamp(s.life / .4, 0, 1);
      const P = ARTE().PILAR[s.tipo]; if (P) P(c, s, f.t, h); else ARTE().PILAR_BASE(c, s, f.t, h, s.col && s.col[0]);
      c.restore();
    },
  };
  OBJ.sjRayo = {
    step(o, g, dt) { o.t += dt; if (o.t > o.av && o.t < o.av + o.dur && toca(g.p, o.x0, o.y - 2.6, o.x1, o.y + 2.6)) duele(g, o.ox); if (o.t > o.av + o.dur) o.dead = true; },
    draw(c, o, f) {
      const col = o.col[0]; c.save();
      if (o.t < o.av) {
        const a = .35 + .4 * Math.abs(Math.sin(f.t * 10)); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = .8; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(o.x0, o.y); c.lineTo(o.x1, o.y); c.stroke(); c.setLineDash([]);
        c.fillStyle = col; const dir = o.x1 - o.ox > 1 ? 1 : -1; for (let i = 1; i < 6; i++) { const x = o.ox + dir * i * 36; c.beginPath(); c.moveTo(x, o.y - 2); c.lineTo(x + dir * 3, o.y); c.lineTo(x, o.y + 2); c.fill(); }
      } else {
        const k = clamp((o.t - o.av) / .08, 0, 1) * clamp((o.av + o.dur - o.t) / .1, 0, 1), w = 5 * k;
        c.globalAlpha = .9; c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col; c.fillRect(o.x0, o.y - w / 2 - 1, o.x1 - o.x0, w + 2);
        c.fillStyle = '#ffffff'; c.fillRect(o.x0, o.y - w * .25, o.x1 - o.x0, w * .5);
      }
      c.restore();
    },
  };
  OBJ.sjCharco = {
    step(o, g, dt) { o.life -= dt; const p = g.p; if (o.life > .2 && p && p.on && Math.abs(p.x - o.x) < o.w / 2 && Math.abs(p.y - o.gy) < 3) duele(g, o.x); if (o.life <= 0) o.dead = true; },
    draw(c, o, f) {
      const a = clamp(o.life / .5, 0, 1), base = o.kind === 'tinta' ? '#2a1a3a' : '#141018'; c.save(); c.globalAlpha = a;
      c.fillStyle = base; c.beginPath(); c.ellipse(o.x, o.gy - .4, o.w / 2, 2.2, 0, 0, TAU); c.fill();
      if (o.kind !== 'tinta') { const g2 = c.createLinearGradient(o.x - o.w / 2, 0, o.x + o.w / 2, 0); g2.addColorStop(0, 'rgba(60,180,220,.3)'); g2.addColorStop(.5, 'rgba(240,200,60,.3)'); g2.addColorStop(1, 'rgba(220,60,160,.3)'); c.fillStyle = g2; c.beginPath(); c.ellipse(o.x, o.gy - .8, o.w / 2 - 2, 1.2, 0, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 2; i++) { const k = (f.t * .8 + i * .5) % 1; c.beginPath(); c.arc(o.x - 6 + i * 10, o.gy - 1 - k * 3, .8 * (1 - k) + .2, 0, TAU); c.fill(); }
      c.restore();
    },
  };
  OBJ.sjBomba = {
    step(o, g, dt) {
      if (!o.suelo) { o.vy += 800 * dt; o.x += o.vx * dt; o.y += o.vy * dt; if (o.y >= o.gy) { o.y = o.gy; o.suelo = true; } return; }
      o.t += dt; if (o.t < o.fuse) return;
      o.dead = true; ring(g, o.x, o.gy - 5, '#ffd23f', 26, .35); g.shake = Math.max(g.shake || 0, .25);
      spawn(g, 18, o.x, o.gy - 5, { v: 120, life: .5, s: 2.2, k: 'spark', cols: ['#ffd23f', '#ff7a2a', '#ffffff'] });
      const p = g.p; if (p && p.vis !== false && Math.hypot(p.x - o.x, (p.y - p.h / 2) - (o.gy - 5)) < 25) duele(g, o.x);
    },
    draw(c, o, f) {
      c.save(); const y = o.y - 4, blink = o.suelo && o.t > o.fuse - .6 && Math.floor(f.t * 12) % 2;
      if (o.suelo) { c.strokeStyle = `rgba(255,60,40,${.25 + .25 * Math.abs(Math.sin(f.t * 8))})`; c.lineWidth = .6; c.setLineDash([2, 2]); c.beginPath(); c.ellipse(o.x, o.gy, 25, 4, 0, 0, TAU); c.stroke(); c.setLineDash([]); }
      c.fillStyle = blink ? '#a01818' : '#2a2a30'; c.strokeStyle = '#000'; c.lineWidth = .5; c.beginPath(); c.arc(o.x, y, 4, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(o.x - 1.4, y - 1.4, 1.2, 0, TAU); c.fill();
      c.strokeStyle = '#8a6a3a'; c.lineWidth = .7; c.beginPath(); c.moveTo(o.x + 1, y - 4); c.quadraticCurveTo(o.x + 3, y - 6, o.x + 2, y - 7); c.stroke();
      ARTE().estrella(c, o.x + 2, y - 7.4, 1.4 + Math.sin(f.t * 30) * .4, '#ffd23f', 6, .4);
      c.restore();
    },
  };
  // las ondas del piso (con el color del subjefe)
  OBJ.ondaSub = {
    step(o, g, dt) {
      o.x += o.v * dt; o.life -= dt; const p = g.p, y = MEC.surf(o.x, o.y - 6);
      if (o.life <= 0 || Math.abs(y - o.y) > 7 || SOLID(o.x, o.y - 6)) { o.dead = true; return; } o.y = y;
      if (p && p.on && Math.abs(p.x - o.x) < 7 && Math.abs(p.y - o.y) < 10) MEC.hurt(g, Math.sign(o.v));
    },
    draw(c, o, f, sk) {
      const F = (sk && sk.foe) || MEC.DEFAULT_SKIN.foe, cA = o.col ? o.col[0] : F.main, cB = o.col ? o.col[2] : F.dark, a = clamp(o.life * 2, 0, 1); c.save(); c.globalAlpha = a;
      for (let k = 0; k < 3; k++) { const x = o.x - 6 + k * 3.4, h = 9 - Math.abs(k - 1) * 3 + Math.sin(f.t * 30 + k) * 1.2; c.fillStyle = k === 1 ? cB : cA; c.strokeStyle = 'rgba(20,12,16,.75)'; c.lineWidth = .5; c.beginPath(); c.moveTo(x - 2.4, o.y); c.lineTo(x, o.y - h); c.lineTo(x + 2.4, o.y); c.closePath(); c.fill(); c.stroke(); }
      c.restore();
    },
  };
  const SUYOS = new Set(['sjProy', 'sjMarca', 'sjPilar', 'sjRayo', 'sjCharco', 'sjBomba', 'ondaSub']);

  // La arena ocupa una pantalla completa y no se puede abandonar hasta ganar.
  MEC.ZONAS.arenaSubjefe = {
    paso(z, g) {
      const p = g.p, margen = (p.w || 10) / 2;
      if (p.x < z.x0 + margen) { p.x = z.x0 + margen; p.vx = Math.max(0, p.vx); }
      if (p.x > z.x1 - margen) { p.x = z.x1 - margen; p.vx = Math.min(0, p.vx); }
    },
    pinta(c, z, f) {
      c.save(); c.lineWidth = 2; c.setLineDash([5, 4]);
      c.strokeStyle = 'rgba(255,222,153,.9)'; c.shadowColor = '#c8203a'; c.shadowBlur = 8;
      for (const x of [z.x0, z.x1]) { c.beginPath(); c.moveTo(x, (f.y0 || 0) - 5); c.lineTo(x, (f.y0 || 0) + VISTA.H + 5); c.stroke(); }
      c.restore();
    }
  };
  function cerrarArena(g, o) {
    const rec = VISTA.rec || 0, e = o.foe;
    const cam = clamp((g.p.x + e.x) / 2 - VW / 2, L.camMin - rec, L.camMax + rec);
    o.zona = { k: 'arenaSubjefe', x0: cam + rec + 5, x1: cam + VW - rec - 5, t: 0 };
    g.zones.push(o.zona); g.arenaSubjefe = { cam, zona: o.zona }; g.cam = cam;
  }
  function abrirArena(g, o) {
    if (o.zona) o.zona.dead = true;
    if (g.arenaSubjefe && g.arenaSubjefe.zona === o.zona) g.arenaSubjefe = null;
  }

  // ---------------- la pelea: aparece, se ve y se rinde ----------------
  function prepara(g) {
    if (g.isBoss || g.isPrologo || g.modo || !g.objs || !g.foes) return; const s = deNivel(g); if (!s) return;
    const c = sitio(g, s.h + (s.alto || 0) + 30); if (c === null) return;
    const x = (c + PAD) * T + 8, gy = L.surfaceY(c + PAD, 0) * T, [a0, a1] = arena(x, gy), e = crea(s, x, gy, a0, a1);
    g.foes = g.foes.filter(q => q.x < a0 - 24 || q.x > a1 + 24 || q.y < gy - 60); // la arena es suya
    g.foes.push(e); g.objs.push({ k: 'subjefe', foe: e, s, fase: 'espera', t: 0, barra: s.vida, x0: e.x, y0: e.y });
  }
  // los niveles alternos de un mundo (imprenta, posadas…) traen al subjefe de su mundo
  const deNivel = g => { const id = g.def && g.def.id; if (!id) return null; if (LISTA[id]) return LISTA[id]; const m = Object.keys(NIVELES_ALT || {}).find(k => NIVELES_ALT[k].includes(id)); return (m && LISTA[m]) || null; };
  // busca un tramo de piso parejo y largo, de preferencia pasando la mitad del nivel y lejos de la meta
  // alto: lo que necesita libre arriba del piso (el subjefe, más Itzel brincándole encima)
  function libre(g, x0, x1, y0, y1) {
    for (let x = x0; x <= x1; x += 6) for (let y = y0; y < y1; y += 6) if (SOLID(x, y)) return false;
    return !(g && g.plats || []).some(q => q.x < x1 && q.x + (q.w || 16) > x0 && q.y < y1 && q.y + (q.h || 6) > y0);
  }
  function sitio(g, alto = 70) {
    // en los niveles al revés (L.espejo) se avanza hacia la izquierda: u es lo avanzado
    const W = L.gw - PAD * 2, esp = !!L.espejo, meta = esp ? W - ((L.goal.x / T) - PAD) : (L.goal.x / T) - PAD; let mejor = null, nota = -1e9;
    for (let u = Math.floor(W * .35); u < Math.min(W * .94, meta - 12); u++) {
      const c = esp ? W - 1 - u : u;
      const y0 = L.surfaceY(c + PAD, 0); if (y0 < 8 || y0 >= 15) continue;
      let largo = 0; for (let d = 1; d < 9; d++) { if (L.surfaceY(c + PAD - d, 0) !== y0 || L.surfaceY(c + PAD + d, 0) !== y0) break; largo = d; }
      if (largo < 4) continue; const gy = y0 * T, xc = (c + PAD) * T + 8;
      if (!libre(g, xc - 3 * T, xc + 3 * T, gy - alto, gy - 2)) continue;
      const q = largo * 2 - Math.abs(u - W * .78) * .2; if (q > nota) { nota = q; mejor = c; }
    }
    return mejor;
  }
  function vencido(g, o) {
    abrirArena(g, o); o.fase = 'fin'; o.t = 0; const s = o.s, p = g.p, e = o.foe; const perfecto = !o.recibio; RUN.coins += PREMIO + (perfecto ? PERFECTO : 0); RUN.subjefes = (RUN.subjefes || 0) + 1;
    g.pickups.push({ k: 'heart', x: p.x, y: Math.max(40, p.y - 34), got: false });
    if (perfecto) g.pickups.push({ k: 'heart', x: p.x + 14, y: Math.max(40, p.y - 40), got: false });
    for (let i = 0; i < 3; i++) spawn(g, 16, e.x, e.y - e.h * .6, { ang: -Math.PI / 2, spread: 2.6, v: 160, life: 1.2, s: 2.2, k: 'confetti', cols: ['#ffd23f', '#ff5d73', '#ffffff', s.col[0]], g: 220 });
    for (const q of g.foes) if (q.dueno === e && q.st !== 'gone') { q.st = 'gone'; q.tt = 0; }
    for (const q of g.objs) if (SUYOS.has(q.k)) q.dead = true;
    for (const q of g.solids) if (q.k === 'sjPilarS') q.life = Math.min(q.life, .4);
    if (typeof toast === 'function') toast(perfecto ? `¡Sin un rasguño! ${s.nombre} se rinde: dos corazones y ${PREMIO + PERFECTO} canisteles` : `${s.nombre} se rinde: suelta un corazón y ${PREMIO} canisteles`, 3400);
    if (typeof PROG !== 'undefined') { const S = PROG.s; (S.subjefes = S.subjefes || {})[s.clave] = true; S.subjefesVencidos = (S.subjefesVencidos || 0) + 1; if (perfecto) S.subjefesPerfectos = (S.subjefesPerfectos || 0) + 1; }
  }
  OBJ.subjefe = {
    front: true,
    step(o, g, dt) {
      o.t += dt; const e = o.foe, p = g.p; if (o.fase === 'fin') { if (o.t > 3) o.dead = true; return; }
      if (e.y > VH + 16) { e.x = o.x0; e.y = e.gy; e.vy = 0; e.vx = 0; }
      if (e.st === 'gone' || !g.foes.includes(e)) { vencido(g, o); return; }
      if (o.fase === 'espera' && e.pelea) { o.fase = 'pelea'; o.t = 0; cerrarArena(g, o); g.shake = Math.max(g.shake, .25); if (typeof ENCI !== 'undefined') ENCI.ver('subjefe:' + o.s.clave); if (typeof toast === 'function') toast(`¡${o.s.nombre}! Cuando se maree, cáiganle encima: cada golpe da canisteles.`, 3400); }
      if (o.fase === 'pelea') {
        // cada pisotón que le dan suelta canisteles que vuelan hacia Itzel
        if (o.hpPrev === undefined) { o.hpPrev = e.hp; o.cor = RUN.hearts; }
        if (e.hp < o.hpPrev) {
          o.hpPrev = e.hp; RUN.coins += POR_GOLPE;
          spawn(g, 12, e.x, e.y - e.h * .6, { ang: -Math.PI / 2, spread: 2.4, v: 130, life: .9, s: 2.2, k: 'confetti', cols: ['#ffd23f', '#ffe680', '#ffffff'], g: 260 });
          if (typeof toast === 'function' && e.hp > 0) toast(`+${POR_GOLPE} canisteles por el golpe`, 1100);
        }
        if (RUN.hearts < o.cor) o.recibio = true; o.cor = RUN.hearts;
      }
      if (e.hp !== undefined) o.barra += (e.hp - o.barra) * Math.min(1, dt * 7);
    },
    draw(c, o, f) {
      const g = f.g, e = o.foe, s = o.s, t = f.t; if (o.fase !== 'pelea' || e.st === 'gone') return;
      c.save();
      const cab = e.y - e.h - 4 + (e.hunde || 0) * (e.h + 8);
      if (e.fase === 'aviso' && (e.hunde || 0) < .8 && FOE_KIT) FOE_KIT.globo(c, e.x, cab - 1, '¡!', '#a01818');
      if (e.fase === 'cansado' && e.st === 'ok' && FOE_KIT) FOE_KIT.mareo(c, e.x, cab - 2, t, Math.max(6, e.w * .3));
      if (e.fase === 'huye' && Math.floor(t * 16) % 2) { c.globalAlpha = .4; }
      // dónde va a caer
      if ((e.atq === 'salto' && (e.fase === 'aviso' || e.fase === 'ataque')) || (e.atq === 'picada' && e.fase !== 'cansado' && e.fase !== 'anda')) {
        const x = e.tx ?? e.x, k = .5 + .5 * Math.abs(Math.sin(t * 10)); c.fillStyle = `rgba(20,8,20,${.18 + .2 * k})`; c.beginPath(); c.ellipse(x, e.gy, e.w * .5, 2.4, 0, 0, TAU); c.fill();
        c.strokeStyle = `rgba(255,70,60,${.4 * k})`; c.lineWidth = .6; c.beginPath(); c.ellipse(x, e.gy, e.w * .5 + 2, 3.2, 0, 0, TAU); c.stroke();
      }
      // el latigazo, por dónde va a pegar
      if (e.atq === 'latigazo' && (e.fase === 'aviso' || e.fase === 'ataque')) latigo(c, e, s, t);
      // el remolino
      if (e.atq === 'remolino' && e.fase === 'ataque') {
        const cx = e.x, cy = e.y - e.h * .5; c.strokeStyle = s.col[2]; c.lineWidth = .8;
        for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i / 5) % 1, r = 70 * (1 - ph) + 8; c.globalAlpha = .55 * ph; c.beginPath(); c.ellipse(cx, cy, r, r * .45, 0, t * 3 + i, t * 3 + i + 2.4); c.stroke(); }
        c.globalAlpha = 1;
      }
      // la trampilla del apuntador
      if (s.clave === 'apuntador' && (e.hunde || 0) > .6) { c.fillStyle = '#2a1a2a'; c.fillRect(e.x - 9, e.gy - 1, 18, 1.6); c.fillStyle = '#d4af37'; c.fillRect(e.x - 9, e.gy - 1.4, 18, .5); }
      c.restore();
      // la barra
      const cx = g.cam + VW / 2, y = (f.y0 || 0) + 19, an = 118 / e.max;
      c.save(); c.fillStyle = 'rgba(20,12,10,.72)'; c.fillRect(cx - 62, y, 124, 13); c.strokeStyle = '#e8c070'; c.lineWidth = .5; c.setLineDash([2, 1.4]); c.strokeRect(cx - 60.8, y + 1.2, 121.6, 10.6); c.setLineDash([]);
      c.fillStyle = '#ffe6a8'; c.font = 'bold 5.8px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillText(`Subjefe · ${s.nombre}`, cx, y + 7);
      for (let i = 0; i < e.max; i++) { const k = clamp(o.barra - i, 0, 1); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(cx - 58 + i * an, y + 9, an - 2.3, 2); c.fillStyle = '#ff5d73'; c.fillRect(cx - 58 + i * an, y + 9, (an - 2.3) * k, 2); }
      c.restore();
    },
  };
  // tentáculo, rama, cola o la vuelta de la llave
  function latigo(c, e, s, t) {
    const dir = e.dir || 1, x0 = e.x + dir * e.w * .45, y0 = e.gy - 4;
    if (e.fase === 'aviso') { const a = .2 + .3 * Math.abs(Math.sin(t * 12)); c.fillStyle = `rgba(255,70,60,${a})`; c.fillRect(Math.min(x0, x0 + dir * 60), e.gy - 1.2, 60, 1.2); return; }
    const r = e.latigoR || 0; if (r < 2) return; const x1 = x0 + dir * r, col = s.col[0], tipo = s.latigo;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const curva = w => { c.beginPath(); c.moveTo(x0, y0 - 4); c.quadraticCurveTo((x0 + x1) / 2, y0 - 8 + Math.sin(t * 20) * 1.5, x1, y0); c.lineWidth = w; c.stroke(); };
    if (tipo === 'llave') { c.strokeStyle = 'rgba(216,168,58,.7)'; c.lineWidth = 2; c.beginPath(); c.ellipse(e.x, y0 - 6, r * .9 + 6, 6, 0, dir > 0 ? -.4 : Math.PI - .4, dir > 0 ? .9 : Math.PI + .9); c.stroke(); }
    else { c.strokeStyle = '#1a1018'; curva(tipo === 'rama' ? 3.4 : 4.4); c.strokeStyle = tipo === 'cola' ? '#8a8a9a' : col; curva(tipo === 'rama' ? 2.2 : 3.2); }
    if (tipo === 'tentaculo') { c.fillStyle = '#f0c080'; for (let i = 1; i < 5; i++) { const u = i / 5; c.beginPath(); c.arc(x0 + dir * r * u, y0 - 5 + u * 4.4, .7, 0, TAU); c.fill(); } }
    if (tipo === 'rama') { c.fillStyle = '#4a7a3a'; for (let i = 1; i < 4; i++) { const u = i / 4; c.beginPath(); c.ellipse(x0 + dir * r * u, y0 - 7 + u * 5, 1.6, .9, .5, 0, TAU); c.fill(); } }
    c.restore();
  }
  if (typeof COOP !== 'undefined') { const init = COOP.init; COOP.init = g => { init(g); prepara(g); }; }

  // ---------------- en la enciclopedia ----------------
  // deja uno solo, en el piso de la izquierda, peleando contra un blanco imaginario
  function vitrina(g, e0, s) {
    const gy = e0.y, [a0, a1] = arena(e0.x, gy), e = crea(s, clamp(e0.x - 30, a0 + s.w, a1 - s.w), gy, a0, a1);
    e.vitrina = { x: clamp(e.x + 64, a0 + 6, a1 - 6), y: gy, w: 10, h: 14, on: true }; e.pelea = true; e.cd = .6;
    g.foes.length = 0; g.foes.push(e); return e;
  }

  // ---------------- logros ----------------
  if (typeof LOGROS !== 'undefined') {
    const claves = new Set(UNICOS.map(s => s.clave)), distintos = s => Object.keys(s.subjefes || {}).filter(k => claves.has(k)).length;
    LOGROS.push(
      { id: 'subjefe', icon: 'speed', nombre: '¡Se rindió!', desc: 'Venzan a su primer subjefe.', meta: 1, valor: s => s.subjefesVencidos || 0 },
      { id: 'subjefes', icon: 'cup', nombre: 'Cazasubjefes', desc: 'Venzan a 10 subjefes distintos.', meta: 10, valor: distintos },
      { id: 'subjefeperfecto', icon: 'speed', nombre: 'Ni un rasguño', desc: 'Venzan a un subjefe sin que les toque un solo golpe.', meta: 1, valor: s => s.subjefesPerfectos || 0 },
      { id: 'subjefestodos', icon: 'jade', nombre: 'Ni uno se queda', desc: 'Venzan a todos los subjefes.', meta: UNICOS.length, valor: distintos },
    );
  }
  const fichas = () => Object.keys(LISTA).filter(m => NIVELES[m] && !m.startsWith('uayamon')).map(m => {
    const s = LISTA[m], d = NIVELES[m];
    const pisar = s.pisar || 'Cuando quieras, pero tras cada golpe se escapa. Lo seguro es esperar a que se maree después de atacar.';
    return { id: 'subjefe:' + s.clave, tipo: 'enemigo', subjefe: s, clave: 'sj_' + s.clave, mundo: m, niveles: [m], nombre: s.nombre, sub: `Subjefe · ${d.nombre}`,
      datos: [['Vida', `${VIDA_ENEMIGOS.iconos(s.vida)} Cae con ${VIDA_ENEMIGOS.golpes(s.vida)}.`], ['Cómo se mueve', MOV[s.mov]], ['Su ataque', DICE[s.ataques[0]](s)], ['Y también', DICE[s.ataques[1]](s)], ['Cuándo caerle encima', pisar], ['De Campeche', s.dato], ['Premio', `${POR_GOLPE} canisteles por cada golpe, y al rendirse un corazón y ${PREMIO} canisteles. Si no le tocan ni un golpe: otro corazón y ${PERFECTO} canisteles más.`]], nota: s.lema };
  });
  return { LISTA, ATQ, fichas, prepara, sitio, vitrina, crea, arena };
})();
