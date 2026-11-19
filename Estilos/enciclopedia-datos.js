'use strict';
// =====================================================================
//  ENCICLOPEDIA · datos y registro de lo descubierto
//  El juego llama ENCI.ver('tipo:id') cuando el jugador encuentra algo;
//  el libro (index.html de Estilos) muestra lo que ya está y lo que falta.
// =====================================================================
const ENCI = (() => {
  const KEY = 'itzel-enciclopedia'; let S = new Set();
  try { S = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...S])); } catch (e) {} };
  const ALIAS = { glyph: 'glyph', wood: 'wood', switch: 'switch', clay: 'clay', plate: 'plate', ecobridge: 'ecobridge', brasas: 'brasas', geiser: 'geiser', water: 'water', respiro: 'respiro', corriente: 'corriente', mar: 'mar', estrella: 'estrella', escondite: 'escondite', antorcha: 'antorcha', prensa: 'prensa', pliego: 'pliego', canon: 'canon', cascada: 'cascada', rehilete: 'rehilete', biombo: 'biombo', obsidiana: 'obsidiana', regla: 'regla', camara: 'camara', tele: 'tele', ventisca: 'ventisca', rastrillo: 'rastrillo', pozo: 'pozo', vidrios: 'vidrios', torno: 'torno', almeja: 'almeja', bomba: 'llamarada', laser: 'laser', cucu: 'relojcucu', rodillo: 'rodillo', boton: 'boton', estela: 'estela', pinata: 'pinata', peregrinos: 'peregrinos', vela: 'vela', altar: 'altar', anima: 'anima', confeti: 'confeti', globo: 'pintadera', rueda: 'rueda', guirnalda: 'papelpicado' };
  let callado = false;
  function ver(id) { if (S.has(id)) return false; S.add(id); save(); if (!callado && api.alNuevo) api.alNuevo(id); return true; }
  // al entrar a un mundo se registra lo que se ve ahí
  function mundo(def) {
    ver('mundo:' + def.id); callado = true; ['atuendo:', 'plataforma:'].forEach(k => ver(k + def.id));
    if (def.modo) for (const k of def.fauna || [def.foe]) ver('enemigo:' + k); // en los demás niveles se anotan cuando salen en pantalla
    ['entorno:cacao', 'entorno:meta', 'personaje:itzel', 'personaje:fresita'].forEach(ver);
    if (typeof construirNivel === 'function' && def.build) {
      const nv = construirNivel(def);
      if (nv.rows.some(r => r.includes('h'))) ver('entorno:corazon');
    }
    callado = false;
  }
  // vuelve a leer lo descubierto (cuando la enciclopedia vive dentro del juego y se jugó mientras estaba cerrada)
  function recargar() { try { S = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {} }
  const api = { ver, mundo, recargar, ALIAS, alNuevo: null, tiene: id => S.has(id), cuantos: () => S.size, borrar() { S.clear(); save(); } };
  return api;
})();

// ---------------- enemigos ----------------
const ENEMIGO_INFO = {
  fantasma: ['Fantasma del baluarte', 'Un pirata ánima: en lo oscuro casi no se ve, persigue a Itzel y no se le puede caer encima.', 'A la luz de una antorcha encendida se asusta y se queda quieto: ahí sí, cáele encima.'],
  soplo: ['Soplo', 'Un remolinito de viento con cachetes que va a las antorchas encendidas y las apaga.', 'Vuelve a prenderlas con Fresita, o cáele encima mientras sopla.'],
  tucan: ['Tucán de Calakmul', 'Mientras Fresita carga a Itzel, la persigue y la picotea hasta que la suelta.', 'Carga a Itzel cuando esté lejos, o en tramos cortos.'],
  nauyaca: ['Nauyaca', 'Una víbora enroscada entre las hojas: cascabelea y lanza la mordida.', 'Cuando suene el cascabel, aléjate; enroscada se le puede caer encima.'],
  calderita: ['Calderita', 'Una caldera con patas que resopla un chorro de vapor de lado y empuja a Itzel.', 'El vapor de las rejillas de Fresita la levanta y la quita del camino.'],
  pajaro: ['Pájaro de cuerda', 'Un ornitóptero de latón que vuela en ochos por la fábrica.', 'Si pasa por una columna de vapor, sale volando lejos.'],
  foca: ['Foca del mar helado', 'Nada bajo el hielo (se ven sus ondas) y sale junto a Itzel: empuja el témpano y avienta a Itzel.', 'Cuando veas las ondas debajo, brinca a otro témpano.'],
  muneco: ['Muñeco de nieve', 'Avienta bolas de nieve; si caen al mar, dejan un pedacito de hielo flotando un rato.', 'Se echa para atrás antes de aventar. Se le puede caer encima.'],
  cometa: ['Cometa', 'Cruza el cielo en diagonal cada tanto; si pasa por una línea de constelación de Fresita, la rompe.', 'Una estrellita brilla antes de que salga: tiende la línea después de que pase.'],
  conejo: ['Conejo de la luna', 'El conejo de las pinturas mayas: con la poca gravedad da brincos enormes y cae sobre las líneas de Fresita.', 'Se agacha antes de brincar. Se le puede caer encima.'],
  aranaCeniza: ['Araña de ceniza', 'Cuelga de su hilo y, si oye ruido abajo, baja de golpe.', 'Pasa despacito o agachada: si no te oye, no baja.'],
  cuervoCeniza: ['Cuervo de ceniza', 'Si ve a Itzel sin esconderse, grazna: el ruido llega al máximo y los perros vienen.', 'Escóndete antes de que te mire un rato, o suelta una bengala lejos.'],
  topon: ['Topón', 'Un cabezón de casco que, si tiene un ladrillo encima, brinca y lo rompe de un cabezazo.', 'Haz los ladrillos lejos de él, o cáele encima primero.'],
  halcon: ['Halcón de 8 bits', 'Se detiene, apunta a Itzel y sale volando en diagonal; rebota en paredes y ladrillos.', 'Cuando se detiene a apuntar, muévete: va a donde estabas.'],
  bestia: ['La bestia de la cueva', 'Una fiera negra que, si ve a Itzel, la persigue a toda carrera; no salta barrancos: se queda rugiendo en la orilla.', 'No se le puede caer encima. Escapa con el portal de Fresita o con un teletransportador.'],
  guardia: ['Guardia alienígena', 'Dispara su rifle hacia donde mira y tarda en voltearse.', 'Por la espalda se le puede caer encima: aparece detrás de él con el portal.'],
  ollita: ['Ollita brincona', 'Una olla de barro que se agacha y da brincos hacia Itzel.', 'Un pilar de plastilina le cierra el paso. Se le puede caer encima.'],
  silbato: ['Pajarito silbato', 'Un silbato de barro que vuela en arcos; cuando silba, la plastilina cercana se encoge a su tamaño chico.', 'Mientras Fresita la sostiene, la plastilina no se encoge.'],
  morena: ['Morena', 'Vive en un agujero de la pared y sale a morder cuando Itzel pasa enfrente; sus ojos brillan cuando está lista.', 'No se le puede caer encima: pasa nadando por arriba o espera a que se esconda.'],
  pezloro: ['Pez loro', 'Muerde y revienta las burbujas de aire de Fresita.', 'Pon la burbuja justo cuando la vayas a usar, o cáele encima primero.'],
  incendiario: ['Pirata incendiario', 'Avienta bombas que dejan una llamarada en el piso por unos segundos.', 'El agua de Fresita lo duerme y apaga sus llamaradas.'],
  magma: ['Gólem de magma', 'Una roca negra con grietas de lava: caliente no se puede tocar.', 'El agua de Fresita lo enfría y se vuelve un escalón de piedra un rato.'],
  charran: ['Charrán', 'Un ave marina de gorrito negro que se acerca a los resortes de Fresita e intenta romperlos.', 'Acerca a Fresita para espantarlo antes de que rompa el resorte; también puedes dormirlo con su canción.'],
  medusa: ['Medusa del malecón', 'Flota despacito y se queda encima del resorte más cercano, justo donde Itzel va a salir volando.', 'Pon el resorte lejos de ella, o rebota desde un lado. Se le puede caer encima.'],
  oruga: ['Oruga monarca', 'Busca las enredaderas de Fresita, se sube por ellas y se come las hojas.', 'Siembra lejos de ella o cáele encima antes de que llegue a la enredadera.'],
  pavo: ['Pavo real', 'Camina muy orgulloso y cada tanto abre la cola: el abanico lo protege y empuja a Itzel lejos.', 'Con la cola cerrada se le puede caer encima.'],
  cucu: ['Cucú', 'Sale disparado de su reloj de pared cada tanto, muy lejos, y regresa a su casita.', 'La puertita brilla antes de que salga. Con el reloj de arena de Fresita sale despacito.'],
  bailarina: ['Bailarina de caja de música', 'Gira sobre la punta por toda la repisa; mientras gira no se le puede caer encima.', 'Espera su reverencia: ahí sí. El reloj de arena la hace más larga.'],
  rover: ['Rover de reparto', 'Un robotito de seis ruedas que patrulla la calle y embiste si ve a Itzel enfrente.', 'El hackeo de Fresita lo apaga: se queda quieto como un bloque que se puede pisar.'],
  gargola: ['Gárgola de la catedral', 'Espera en su ménsula de piedra y se lanza en picada cuando Itzel pasa abajo; luego regresa volando.', 'Si Fresita la encierra en vidrio a medio vuelo, se queda en el aire como un bloque: sirve para subir.'],
  campana: ['Campana de bronce', 'Da brincos hacia Itzel y, cada vez que cae, repica: una onda corre por el piso hacia los dos lados.', 'Salta la onda justo cuando pasa debajo, o enciérrala en vidrio para que se calle.'],
  goma: ['Goma de borrar', 'Camina dando brinquitos y borra rapidísimo las líneas de lápiz que toca.', 'Dibuja tus líneas lejos de ella o cáele encima primero.'],
  sacapuntas: ['Sacapuntas', 'Le da vueltas a su manivela y avienta virutas en arco hacia Itzel.', 'Una línea de lápiz de Fresita entre los dos detiene la viruta.'],
  catrin: ['Catrín', 'Una calavera muy elegante, a la manera de Posada: frac, moño, bastón y sombrero de copa que avienta como bumerán.', 'Sin sombrero no puede volver a lanzar: es el momento de caerle encima.'],
  carcoma: ['Carcoma', 'Una larvita que vive dentro de los bloques de madera y se asoma a morder cuando Itzel pasa junto.', 'Si Fresita talla su bloque con la gubia, se queda sin casa y se va.'],
  aplastador: ['Aplastador', 'Un bloque con cara de pocos amigos que espera arriba y se deja caer cuando Itzel pasa abajo.', 'Tiembla antes de caer. Un bloque A o B prendido debajo lo detiene.'],
  cuadrito: ['Cuadrito', 'Un bichito con su letra, A o B. Cuando su letra se prende, se vuelve un bloque dormido que se puede pisar.', 'Espera a que camine a donde te sirve y cambia los bloques: ahí se queda de escalón.'],
  nahual: ['Nahual de niebla', 'Un espíritu de humo con forma de jaguarcito que se acerca a pasitos mientras está a oscuras.', 'Alúmbralo con el faro: se vuelve estatua de piedra y hasta se puede pisar. Cuando lo sueltas, tiembla antes de despertar.'],
  bejuco: ['Bejuco comelón', 'Un capullo que cuelga del dosel de la selva y baja de golpe cuando Itzel pasa abajo en lo oscuro.', 'Con la luz del faro se recoge y cierra la boca: alúmbralo antes de pasar.'],
  carpintero: ['Carpintero de cristal', 'Un pájaro de facetas que se le pega a los pilares de Fresita y los picotea hasta romperlos; si no hay pilares, se lanza sobre Itzel.', 'Pon el pilar justo cuando lo vayas a usar, o úsalo de carnada lejos del camino.'],
  geoda: ['Geoda saltarina', 'Una piedra abierta llena de amatistas que rebota en diagonal contra paredes, piso y techo.', 'Los pilares de Fresita también la rebotan: úsalos para cambiarle el camino. Se le puede caer encima.'],
  escribano: ['Mono escribano', 'El mono del códice: cada tanto se detiene y repinta el glifo más cercano, prendiéndolo o apagándolo.', 'Cuando su pincel brilla, ya sabes qué glifo va a cambiar: cruza antes o cáele encima mientras pinta.'],
  guerrero: ['Guerrero de piedra', 'Su escudo lleva el mismo glifo que un muro o un puente cercano: mientras ese grupo esté prendido, no se le puede caer encima.', 'Apaga su grupo de glifos con Fresita y el escudo se apaga; ahí sí, cáele encima.'],
  girasol: ['Girasol de óleo', 'Voltea la cara hacia Itzel, se echa para atrás y escupe semillas en arco.', 'Cuando se echa para atrás, muévete: la semilla cae donde estabas. Se le puede caer encima de la cabeza.'],
  cuervo: ['Cuervo del trigal', 'Vuelan en parvada de un lado a otro, como una ola sobre el campo de noche.', 'Un remolino de Fresita los atrapa y los avienta lejos.'],
  polilla: ['Polilla del bosque', 'No va por Itzel: va por la luz de Fresita. Mientras le revolotean, la luz se achica y los caminos se apagan.', 'El destello de Fresita las espanta un rato.'],
  esporin: ['Hongo de esporas', 'Cada tanto suelta una nube de esporas que brillan y lastiman.', 'Pásale entre nube y nube, o cáele encima.'],
  bucanero: ['Bucanero', 'Desde su lancha avienta cocos en arco hacia Itzel.', 'Muévete cuando lance; entre coco y coco, cáele encima.'],
  fragata: ['Fragata', 'El pájaro negro de bolsa roja: planea muy alto y baja en una picada larga y rápida.', 'Hazte a un lado cuando baje; cerca del piso se le puede caer encima.'],
  mancha: ['Mancha trepadora', 'Una mancha de tinta que sube y baja por la cara de los muros.', 'Si Fresita mancha el muro donde pasa, se queda pegada un rato.'],
  koi: ['Koi de tinta', 'Un pez pintado de un brochazo que nada por el aire dando ochos.', 'Fíjate en su vuelta y pasa cuando esté lejos; también se le puede caer encima.'],
  bocina: ['Bocina', 'En cada compás manda una onda por el piso hacia los dos lados.', 'Salta la onda. Si Fresita le pega justo al compás, se calla un rato.'],
  bailarin: ['Bailarín de neón', 'Solo se mueve en el compás: un brinco hacia Itzel y se queda congelado en su pose.', 'Entre compás y compás está quieto: ahí cáele encima.'],
  centinela: ['Centinela de la muralla', 'Patrulla el adarve del baluarte; si Itzel se le pone enfrente, levanta la lanza un momento.', 'Espera a que baje la lanza y cáele encima; un bloque de Fresita en su camino lo hace dar la vuelta.'],
  gaviota: ['Gaviota del malecón', 'Planea sobre la muralla y se lanza en picada sobre Itzel.', 'Muévete cuando se lance; si pasa cerca del piso, cáele encima.'],
  garza: ['Garza del estero', 'Parada en una pata junto al agua; cuando Itzel se acerca, estira el cuello y pica.', 'Acércate después del picotazo y cáele encima.'],
  zancudo: ['Enjambre de zancudos', 'Una nube de zancudos que persigue a Itzel; son tan chiquitos que no se les puede caer encima.', 'El viento de Fresita se los lleva; si no, rodéalos.'],
  mojarra: ['Mojarra del cenote', 'Vive en el agua y salta en arco por encima de los nenúfares, primero a un lado y luego al otro.', 'Cruza cuando esté abajo; en lo alto del salto se le puede caer encima.'],
  libelula: ['Libélula', 'Flota quieta y de repente sale disparada a otro lado.', 'Espera a que se detenga y pásale por abajo o cáele encima.'],
  tijeras: ['Tijeras de papel picado', 'Caminan abriendo y cerrando: abiertas cortan.', 'Cáeles encima justo cuando estén cerradas.'],
  grulla: ['Grulla de papel', 'Una grulla de origami que planea y se lanza en picada.', 'Muévete cuando se lance y cáele encima cuando pase bajito.'],
  diablito: ['Diablito de pastorela', 'Sale de las pastorelas de Navidad a estorbarle el camino a Belén: brinca hacia Itzel con su trinche de cartón.', 'Espera a que aterrice y cáele encima; se va brincando de regreso a la pastorela.'],
  pintador: ['Pintador de la pintadera', 'En el martes de carnaval avienta globos de pintura; si le atina a Itzel, resbala un ratito como en hielo.', 'Acércate entre globo y globo y cáele encima; Fresita lo marea si le pega al compás.'],
  torito: ['Torito de la feria', 'Un armazón de carrizo con forma de toro y cargado de cohetes; cuando ve a Itzel de frente, embiste echando chispas.', 'Hazte a un lado: al chocar con una pared se queda aturdido y ahí se le cae encima. El reloj de Fresita lo frena.'],
  cangrejo: ['Cangrejo del malecón', 'Camina de lado por la orilla y a veces da un brinco.', 'Cáele encima.'],
  murcielago: ['Murciélago del ocaso', 'Sale cuando se mete el sol y vuela en ochos sobre las hamacas.', 'Pásale por abajo o cáele cuando baje.'],
  rana: ['Rana del cenote', 'Brinca hacia Itzel cuando la ve cerca.', 'Espera a que aterrice y cáele encima.'],
  avispa: ['Avispa de papel', 'Patrulla en el aire y se lanza en picada.', 'Esquiva la picada; Fresita la duerme con la canción.'],
  cocuyo: ['Cocuyo', 'Da vueltas con su luz verde en la oscuridad.', 'El destello de Fresita lo aturde.'],
  zopilote: ['Zopilote', 'Planea alto y baja en picada cuando Itzel pasa debajo.', 'No te quedes quieta abajo de él.'],
  culebra: ['Coralillo de tinta', 'Repta despacio y lanza una mordida corta si te acercas de frente.', 'Brínquela o cáele en la cola.'],
  iguana: ['Iguana de neón', 'Corre a ráfagas: un segundo quieta, un segundo disparada.', 'Pásala cuando se detenga.'],
  alux: ['Alux', 'Duende maya que se aparece junto a Itzel y desaparece con la luz.', 'Fresita lo espanta con el farol.'],
  jabali: ['Jabalí de cristal', 'Embiste en línea recta cuando te ve, hasta chocar con algo.', 'Hazlo chocar contra un pilar y cáele encima.'],
  jaguar: ['Jaguar del códice', 'Acecha y salta sobre Itzel desde lejos.', 'Esquiva el salto y cáele mientras se recupera.'],
  buho: ['Búho de la noche estrellada', 'Vuela en remolinos y se lanza sobre Itzel.', 'Muévete cuando lo veas bajar.'],
  escarabajo: ['Escarabajo de vitral', 'Rueda muy rápido por el suelo.', 'Fresita lo encierra en vidrio y se vuelve escalón.'],
  garabato: ['Garabato', 'Un dibujo que se escapó del cuaderno y no deja de saltar.', 'Cáele encima entre brinco y brinco.'],
  calavera: ['Calaverita de grabado', 'Brinca de un lado a otro como en el Día de Muertos.', 'Cáele encima.'],
  tortuga: ['Tortuga de 4 tonos', 'Camina lento; si la pisas se mete en su concha.', 'Patea la concha y tumba a las demás.'],
  pelicano: ['Pelícano', 'Vuela alto sobre el malecón y se clava como si pescara.', 'Corre cuando lo veas apuntar.'],
  abeja: ['Abeja melipona', 'Vuela en ochos alrededor de las flores.', 'Fresita la duerme con la canción de cuna.'],
  automata: ['Autómata de cuerda', 'Marcha, se detiene y se da la vuelta como un reloj.', 'Cáele cuando se detenga.'],
  dron: ['Dron de la ciudad', 'Patrulla y dispara un láser hacia el suelo.', 'Fresita lo apaga con el hackeo.'],
  babosa: ['Babosa de gas', 'Se arrastra y salta hacia Itzel.', 'Cáele encima cuando aterrice.'],
  invasor: ['Invasor de 4 colores', 'Avanzan en formación de lado a lado.', 'Pasa por debajo mientras regresan.'],
  grumo: ['Grumo de plastilina', 'Camina despacio, pero si te ve da un brinco y te persigue.', 'Cáele encima: se aplasta.'],
  erizoTinta: ['Erizo de linóleo', 'El erizo del jardín, tallado en linóleo para la imprenta. Camina, se hace bolita de cortes de gubia y se da la vuelta si choca con la estampa.', 'Cáele encima cuando no esté hecho bolita, o ponle la estampa enfrente para que regrese.'],
  erizo: ['Erizo de musgo', 'Camina por el jardín y cada tanto se hace bolita de espinas.', 'Pisa solo cuando no esté hecho bolita.'],
  salamandra: ['Salamandra de fuego', 'Se detiene, apunta y escupe bolas de fuego en arco.', 'El chorro de agua de Fresita la apaga.'],
  botete: ['Botete', 'Nada de lado a lado y se infla de espinas si te acercas.', 'Pásale lejos o cáele cuando esté desinflado.'],
  carambano: ['Carámbano', 'Cuelga del hielo y se deja caer cuando pasas debajo; luego vuelve a crecer.', 'Pasa corriendo: tarda en soltarse.'],
  escorpion: ['Alacrán de estrellas', 'La constelación de Sinan Ek: camina y ataca con la cola.', 'Brínquelo o cáele encima.'],
  perro: ['Perro de ceniza', 'No ve: oye. Mientras más ruido hagas, desde más lejos te encuentra.', 'Agáchate en un escondite o lánzale una bengala.'],
  chapulin: ['Chapulín de 8 bits', 'Salta muy alto hacia Itzel, una y otra vez.', 'Cáele encima cuando aterrice.'],
  pirata: ['Pirata esqueleto', 'Del ataque a la muralla de Campeche: avienta huesos en arco.', 'Acércate entre tiro y tiro.'],
  mono: ['Mono aullador', 'Desde lo alto te avienta cocos que caen justo donde estás.', 'Sigue moviéndote o súbete y cáele encima.'],
};

// ---------------- plataformas (según el tipo y la forma) ----------------
const PLAT_TIPO = {
  fall: 'Se desmorona medio segundo después de pisarla y luego vuelve.', bounce: 'Te avienta muy alto en cuanto caes encima.', sink: 'Se hunde mientras estés parada en ella.',
  timed: 'Aparece y desaparece a un ritmo fijo.', reveal: 'Solo existe donde llega la luz de Fresita.', move: 'Se mueve sola por su camino; Itzel viaja encima.',
  beat: 'Se prende y se apaga con el pulso.', ice: 'Resbala: Itzel tarda en frenar.', seg: 'Una línea inclinada para caminar.', static: 'Fija; aquí lo especial son los bloques A y B.',
  drift: 'Al pisarla empieza a caer meciéndose como pétalo.', conveyor: 'Una banda que arrastra a Itzel.', blink: 'Salta de un lugar a otro cada segundo.',
  taffy: 'Cuelga de un hilo de plastilina que se estira con el peso hasta reventar.', rise: 'Flota y sube mientras estés encima; luego baja sola.',
  hot: 'Flota sobre las brasas y se calienta si te quedas: al ponerse roja se hunde.', jelly: 'Una medusa que sube, baja y te rebota.',
  crack: 'Cada vez que caes en ella se raja más; a la tercera se rompe.', cycle: 'Cruza el cielo y se deshace al final de su viaje.',
  lift: 'Elevador que sube sin parar y da la vuelta a la pantalla.', swing: 'Candil que se columpia de una cadena.', bloom: 'Flor gigante que solo abre si Fresita está cerca.',
  taco: 'Cuelga del husillo de una prensa: sube mientras estés encima y luego baja sola.',
  carro: 'Un carro alegórico que va y viene por su tramo del desfile y se espera en cada esquina.',
  papalote: 'Un papalote amarrado que flota en su lugar; con el viento de Fresita sube y se lleva a Itzel.',
  hongoLuz: 'Un hongo que crece mientras Fresita lo alumbra y se encoge en lo oscuro: un elevador vivo.',
  mimosa: 'Una dormilona: si Itzel se queda parada encima, sus hojas se cierran; después de un rato se vuelven a abrir.',
  grua: 'Un gancho que corre por su riel cargando una caja; en las orillas baja un poco.',
  balanza: 'Dos plataformas colgadas de la misma cuerda: la que pisas baja y la otra sube.',
  tablonArde: 'Un tablón sobre las brasas: si Itzel se queda encima, el fuego lo agarra y se cae. El agua de Fresita lo apaga.',
  globos: 'Unos globos de feria amarrados a una canastita: si Itzel se sube, la llevan hacia arriba; a los tres segundos revientan.',
  lirio: 'Un botón cerrado que se abre en flor (y se puede pisar) cuando la enredadera de Fresita crece cerca.',
  piston: 'Un pistón de latón que espera abajo, sube de golpe, se queda un momento y baja.',
  candelabro: 'Un candelabro colgado de una cadena: si Itzel se sube, lo sube despacito; arriba tiembla y se suelta de golpe.',
  prisma: 'Un prisma de tres caras que da media vuelta cada tanto: tiembla antes de girar y mientras gira no se puede pisar.',
  luna: 'Una luna creciente colgada de una estrella que se mece de un lado al otro; se sube uno y lo lleva.',
  velero: 'No tiene motor: avanza cuando Fresita le sopla a la vela con su ráfaga.',
  eq: 'Sube y baja con la música, como la barra de un ecualizador.',
};
const PLAT_NOMBRE = {
  hojaMini: 'Hoja gigante',
  bricks: 'Ladrillos que se desmoronan', hammock: 'Hamaca', lily: 'Nenúfar', paper: 'Tira de papel', glowline: 'Raíz luminosa', lancha: 'Lancha', inkcloud: 'Nube de tinta',
  neon: 'Bloque de neón', fogstone: 'Piedra en la niebla', crystal: 'Cristal flotante', stone: 'Losa maya', swirlplat: 'Remolino de óleo', ice: 'Vitral helado',
  pencil: 'Raya de lápiz', plank: 'Rueda de la fortuna', spring: 'Resorte', petal: 'Pétalo', gold: 'Engrane dorado', belt: 'Banda transportadora',
  gasrock: 'Roca de gas', pixblk: 'Bloque que salta', arcilla: 'Losa de plastilina', losa: 'Losa flotante', basalto: 'Piedra caliente', medusa: 'Medusa',
  papelhielo: 'Hielo de papel', meteoro: 'Meteoro', tablon: 'Tablón que cruje', ladrillo8: 'Elevador', candil: 'Candil', flor: 'Flor gigante', taco: 'Taco de madera', plain: 'Bloques A y B', carro: 'Carro alegórico', gondola: 'Góndola de la rueda', papalote: 'Papalote', aspa: 'Aspa de rehilete', prisma: 'Prisma que gira', mimosa: 'Dormilona', grua: 'Grúa de gancho', balanza: 'Balanza', tablonArde: 'Tablón que arde', torno: 'Torno de alfarero', globos: 'Globos de feria', lirio: 'Lirio', piston: 'Pistón', candelabro: 'Candelabro', rodillo: 'Rodillo de entintar', luna: 'Luna columpio', hongoLuz: 'Hongo de luz', velero: 'Velero', boya: 'Boya', eq: 'Barra del ecualizador'
};

// ---------------- entorno ----------------
const ENTORNO = {
  cacao: { nombre: 'Canistel', mundo: 'paper', texto: 'El canistel es la fruta que Itzel recoge durante la partida. Fresita tiene sus propias semillas de luz.' },
  anomalia: { nombre: 'Destello de anomalía', mundo: 'pixel', texto: 'De vez en cuando la grieta destella y por ahí se cuelan criaturas de otro mundo, pintadas con la técnica del mundo donde aparecen. Si las vencen, quedan en la ficha de cada enemigo. El regalo Hilo de la grieta hace que salgan mucho más seguido.' },
  mercado: { nombre: 'El mercado', mundo: 'paper', texto: 'Entre mundo y mundo, los canisteles se gastan en cosas de Campeche: pan de cazón, agua de chaya, dulce de ciricote, sombreros de jipi de Bécal, miel de melipona y silbatos de Tepakán.' },
  burbujaCura: { nombre: 'Burbuja de curación', mundo: 'acuarela', texto: 'En las peleas de jefe, si a Itzel le faltan corazones, sale una burbuja cerca del piso. Itzel la atraviesa: la que tiene que bajar a tocarla es Fresita, y el corazón vuela hasta Itzel. Si nadie la toca a tiempo, se revienta.' },
  corazon: { nombre: 'Corazón con flores', mundo: 'acuarela', texto: 'Devuelve un corazón. Suele estar escondido en un lugar difícil.' },
  meta: { nombre: 'La meta', mundo: 'flat', texto: 'Al tocarla se acaba el mundo. Cambia con el estilo: bandera, grulla de papel, ancla, esfera armilar, estela maya…' },
  semilla: { nombre: 'Semilla de luz', mundo: 'eco', texto: 'Flota donde Itzel no alcanza. Solo Fresita las junta; se cuentan por separado y cada 12 curan un corazón.' },
  plaga: { nombre: 'Plaga', mundo: 'acuarela', texto: 'Un bicho ronda a Fresita, se detiene a apuntar (tiembla y marca con una línea roja por dónde va a lanzarse) y se avienta en línea recta. Si Fresita se quita a tiempo, falla; si falla una vez se va. Si la alcanza, la inmoviliza y bloquea sus poderes: para zafarse hay que hacer clic varias veces seguidas. Antes de que la atrape, Fresita puede dormirlo con su canción.' },
  glyph: { nombre: 'Bloque con glifo', mundo: 'codex', texto: 'Fresita los prende y los apaga por grupos para abrir puertas y tender puentes.' },
  wood: { nombre: 'Madera para tallar', mundo: 'grabado', texto: 'La gubia de Fresita la talla hasta que desaparece.' },
  zona: { nombre: 'Corriente de remolino', mundo: 'oleo', texto: 'Un remolino pintado que eleva a Itzel mientras esté adentro.' },
  clay: { nombre: 'Plastilina moldeable', mundo: 'barro', texto: 'Fresita la agarra y la arrastra: un puente que se estira o un pilar que sube con Itzel encima.' },
  plate: { nombre: 'Círculo de eco', mundo: 'eco', texto: 'Mientras alguien esté encima, su puente de luz existe. El eco de Itzel también cuenta.' },
  ecobridge: { nombre: 'Puente de luz', mundo: 'eco', texto: 'Se enciende con su círculo (I, II, III) y se apaga cuando nadie lo sostiene.' },
  brasas: { nombre: 'Cama de brasas', mundo: 'fuego', texto: 'No se puede tocar. El chorro de agua de Fresita la enfría en piedra por unos segundos.' },
  geiser: { nombre: 'Géiser de fuego', mundo: 'fuego', texto: 'Burbujea, avisa y lanza una columna de fuego. El agua lo tapa un rato.' },
  water: { nombre: 'Agua honda', mundo: 'agua', texto: 'Itzel nada: cada salto es una brazada. Bajo el agua el aire se acaba.' },
  respiro: { nombre: 'Respiradero', mundo: 'agua', texto: 'Un coral que suelta burbujas: ahí Itzel recupera el aire.' },
  corriente: { nombre: 'Corriente', mundo: 'agua', texto: 'Empuja a Itzel hacia un lado mientras nada.' },
  mar: { nombre: 'Mar helado', mundo: 'hielo', texto: 'Caer en él te regresa al último lugar seguro. Fresita hace brotar témpanos que se derriten.' },
  estrella: { nombre: 'Estrella ancla', mundo: 'cielo', texto: 'Fresita une dos estrellas con una línea de luz para que Itzel camine encima.' },
  escondite: { nombre: 'Escondite', mundo: 'hollin', texto: 'Arbustos y coches quemados: agachada detrás (↓), las criaturas no oyen a Itzel.' },
  prensa: { nombre: 'Prensa de madera', mundo: 'grabado', nivel: 'imprenta', texto: 'Rescatada del Jardín de los ecos. Mientras alguien la pise (Itzel o su estampa), su pliego se desenrolla.' },
  pliego: { nombre: 'Pliego impreso', mundo: 'grabado', nivel: 'imprenta', texto: 'Una tira de papel grabado que sale de su rodillo cuando su prensa (I, II, III) está pisada; si nadie la pisa, se enrolla y solo quedan las marcas de corte.' },
  antorcha: { nombre: 'Antorcha', mundo: 'bits32', texto: 'Fresita la enciende y a su luz aparecen las losas fantasmales.' },
  papelpicado: { nombre: 'Papel picado', mundo: 'hielo', nivel: 'posadas', texto: 'En cada fiesta cuelga con sus colores: estrellas en Navidad, calaveritas en Hanal Pixán, flores en el carnaval y en la feria.' },
  pinata: { nombre: 'Piñata de siete picos', mundo: 'hielo', nivel: 'posadas', texto: 'Itzel le pega con la cabeza al saltar y Fresita con un clic. A los tres golpes revienta y llueve colación, caña, mandarinas y cacahuates.' },
  peregrinos: { nombre: 'Los peregrinos', mundo: 'hielo', nivel: 'posadas', texto: 'José, María en su burrito y los niños con velitas piden posada por la calle. La flama de las velas derrite los carámbanos que cuelgan encima.' },
  vela: { nombre: 'Vela del paseo', mundo: 'bruma', nivel: 'animas', texto: 'Fresita la prende con su faro y ya no se apaga: su luz deja ver las piedras de la niebla para siempre y espanta a los aluxes.' },
  altar: { nombre: 'Altar de Hanal Pixán', mundo: 'bruma', nivel: 'animas', texto: 'Mantel bordado, arco de flores, pib, chocolate, pan y la foto de los abuelos. Con todas sus velas prendidas, las ánimas lo encuentran y ofrecen pan y pib.' },
  anima: { nombre: 'Ánima', mundo: 'bruma', nivel: 'animas', texto: 'Un alma con su velita que camina delante de Itzel; espera si se queda atrás y su luz alumbra el camino de piedras.' },
  confeti: { nombre: 'Cañón de confeti', mundo: 'neon', nivel: 'carnaval', texto: 'Dispara al compás. Si Itzel está encima justo cuando suena, la avienta altísimo.' },
  pintadera: { nombre: 'Globo de la pintadera', mundo: 'neon', nivel: 'carnaval', texto: 'Si le pega a Itzel, la pinta y resbala un ratito; si cae al piso, deja un charco de color.' },
  rueda: { nombre: 'Rueda de la fortuna', mundo: 'deco', nivel: 'feria', texto: 'Sus góndolas suben y bajan dando vueltas: sirven para cruzar los barrancos. El reloj de Fresita la frena.' },
  canon: { nombre: 'Cañón del baluarte', mundo: 'pixel', texto: 'Dispara balas de hierro en línea recta cuando Itzel anda cerca; la mecha chisporrotea antes. Un bloque de Fresita para la bala.' },
  cascada: { nombre: 'Cascada de la gruta', mundo: 'acuarela', texto: 'El agua que cae del techo del cenote empuja hacia abajo a quien salte por ella y hunde rápido los nenúfares.' },
  rehilete: { nombre: 'Rehilete', mundo: 'paper', texto: 'Un rehilete gigante de papel: sus cuatro aspas giran y se pueden pisar para cruzar.' },
  rastrillo: { nombre: 'Rastrillo', mundo: 'bits32', texto: 'La reja del baluarte: se queda arriba mientras su antorcha esté encendida; si se apaga, baja.' },
  ventisca: { nombre: 'Ventisca', mundo: 'hielo', texto: 'Un viento helado que sopla a ratos y empuja a Itzel sobre el piso resbaloso; antes de soplar se ven los primeros copos.' },
  pozo: { nombre: 'Remolino de estrellas', mundo: 'cielo', texto: 'Jala a Itzel hacia su centro, que quema. Con la poca gravedad del cielo, hay que pasar lejos o con mucho impulso.' },
  vidrios: { nombre: 'Vidrios rotos', mundo: 'hollin', texto: 'Si Itzel los pisa corriendo, crujen y el ruido llega lejos. Despacito o agachada no suenan.' },
  tele: { nombre: 'Teletransportador', mundo: 'cinema', texto: 'Dos plataformas hermanas: al pisar una, Itzel aparece en la otra. Sirven para escapar de la bestia.' },
  torno: { nombre: 'Torno de alfarero', mundo: 'barro', texto: 'Gira y arrastra a Itzel hacia un lado; cada tres segundos cambia de sentido.' },
  almeja: { nombre: 'Almeja gigante', mundo: 'agua', texto: 'Abre y cierra. Abierta, su perla le da aire a Itzel; tiembla antes de cerrarse y, si la agarra adentro, muerde.' },
  llamarada: { nombre: 'Llamarada', mundo: 'fuego', texto: 'Lo que deja la bomba de un pirata incendiario: arde unos segundos en el piso. El agua de Fresita la apaga.' },
  camara: { nombre: 'Cámara de seguridad', mundo: 'cyber', texto: 'Barre la calle con su cono de luz; si ve a Itzel, se pone roja y dispara rayitos. El hackeo de Fresita la apaga un rato.' },
  laser: { nombre: 'Puerta láser', mundo: 'cyber', texto: 'Un rayo de piso a techo que se prende y se apaga (parpadea antes de prender). El hackeo de Fresita la apaga un rato.' },
  relojcucu: { nombre: 'Reloj de cucú', mundo: 'deco', texto: 'La casita del cucú, colgada en los muros de la relojería: la puertita brilla antes de que salga el pájaro.' },
  regla: { nombre: 'Regla', mundo: 'cuaderno', texto: 'Parada junto a un barranco. Si Itzel la empuja un momento, se cae y queda de puente.' },
  rodillo: { nombre: 'Rodillo de entintar', mundo: 'grabado', texto: 'Rueda de un lado a otro por el piso del taller. Encima se puede viajar; de lado, empuja y lastima.' },
  obsidiana: { nombre: 'Espejo de obsidiana', mundo: 'bruma', texto: 'Cuando el faro de Fresita le pega, rebota la luz hacia donde está inclinado y la guarda unos segundos: así se alumbran dos tramos a la vez.' },
  estela: { nombre: 'Estela del calendario', mundo: 'codex', texto: 'Un monumento con su glifo del día: al llenarse su aro prende o apaga todo su grupo de glifos (puentes y muros). Si Itzel está donde se prendería, espera.' },
  biombo: { nombre: 'Biombo de tinta', mundo: 'sumie', texto: 'Un panel de papel pintado que gira cada tanto: cerrado es un muro que se trepa con tinta; abierto se cruza.' }
};

// ---------------- personajes ----------------
const PERSONAJES = {
  itzel: { nombre: 'Itzel', texto: 'Niña campechana de coletas con moño rojo, corona de flores, huipil bordado, short verde, tenis rojos y mochila. Corre, salta y le cae encima a lo que se mueva. Se juega con el teclado.' },
  fresita: { nombre: 'Fresita', texto: 'Ajolote rosa mágico que flota. Sigue al mouse, usa el poder de cada mundo con el clic izquierdo y canta una canción de cuna con el derecho.' },
};
