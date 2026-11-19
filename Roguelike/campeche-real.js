'use strict';
// =====================================================================
//  CAMPECHE DE VERDAD
//  Cada mundo, jefe, enemigo y objeto del juego queda ligado a un lugar,
//  un suceso, una tradición o un animal reales de Campeche. Aquí viven
//  todos esos nombres y datos: se aplican encima de las definiciones de
//  cada mundo, sin tocar sus mecánicas. Las fuentes están en CAMPECHE.md.
//    lugar: dónde pasa (se ve en el letrero del mundo y en la enciclopedia)
//    dato:  lo que es cierto (se ve en pausa, al terminar y en la enciclopedia)
//  Lo que es cuento o leyenda se dice como tal en su dato.
// =====================================================================
const CAMPECHE = (() => {
  const MUNDOS = {
    pixel: { nombre: 'La muralla en obra', lugar: 'Las murallas de Campeche', lema: 'La ciudad levanta su muralla: ladrillos que se desmoronan y cangrejos del malecón.',
      dato: 'Después del ataque pirata de 1685, Campeche se encerró en un recinto amurallado. El último baluarte, el de Santiago, se terminó en 1704.' },
    ocaso: { nombre: 'Atardecer en Seybaplaya', lugar: 'Seybaplaya', espejo: true, lema: 'De derecha a izquierda, hacia el poniente donde se mete el sol: hamacas de pescador que te avientan alto y murciélagos que salen con la tarde.',
      dato: 'Seybaplaya es una comunidad costera de Campeche y uno de sus puertos pesqueros. Su costa mira al poniente, por lo que desde la orilla se puede ver el atardecer sobre el mar. Las hamacas y los saltos del nivel imaginan un recorrido por ese paisaje.' },
    acuarela: { nombre: 'Los cenotes de Miguel Colorado', lugar: 'Miguel Colorado, Champotón', lema: 'Nenúfares que se hunden y ranas que brincan en el Cenote Azul.',
      dato: 'En el ejido Miguel Colorado hay tres cenotes: el Azul, el de Los Patos y el K41. El Azul mide unos 250 metros de diámetro.' },
    paper: { nombre: 'El Puente de los Perros', lugar: 'Puente de los Perros, Calle 59', lema: 'Plataformas que se doblan solas y avispas de papel entre las casonas, junto al puente amarillo de los perros blancos.',
      dato: 'El Puente de los Perros, también llamado de la Merced, se atribuye a Francisco de Paula Toro, hacia 1830. La leyenda dice que los perros de piedra son los de su esposa; es tradición oral. La Calle 59 cruza el centro histórico de Puerta de Mar a Puerta de Tierra.' },
    biolum: { nombre: 'Los Petenes de noche', lugar: 'Reserva de la Biosfera Los Petenes', lema: 'Hongos que rebotan, caminos de luz y cocuyos entre el manglar.',
      dato: 'Un peten es una isla de selva o de manglar que crece alrededor de un manantial o un cenote. Dan nombre a la reserva de Los Petenes, en la costa de Campeche.' },
    flat: { nombre: 'Las lanchas de Champotón', lugar: 'Bahía de Champotón', lema: 'Lanchas que van y vienen y zopilotes al acecho en la bahía de la Mala Pelea.',
      dato: 'El 25 de marzo de 1517, en Champotón, la gente de Moch Couoh venció a la expedición de Hernández de Córdoba. Por eso los españoles llamaron al lugar bahía de la Mala Pelea.' },
    sumie: { nombre: 'El palo de tinte', lugar: 'Laguna de Términos', lema: 'Nubes de tinta del palo de Campeche, paredes que Fresita mancha para trepar y culebras que muerden.',
      dato: 'El palo de tinte se llama Haematoxylum campechianum por Campeche. Piratas ingleses, holandeses y franceses cortaban su madera en la Laguna de Términos para vender el tinte en Europa.' },
    neon: { nombre: 'Luz y sonido en Puerta de Tierra', lugar: 'Puerta de Tierra', lema: 'Bloques que se prenden al ritmo del espectáculo: Fresita los sostiene si le pega justo al compás.',
      dato: 'Puerta de Tierra era la entrada a la ciudad amurallada por el lado de tierra. De noche sus muros se iluminan con un espectáculo de luz y sonido.' },
    bruma: { nombre: 'Aluxes de los Chenes', lugar: 'Los Chenes, Hopelchén', lema: 'El camino solo existe donde Fresita apunta su faro; los aluxes cuidan el monte.',
      dato: 'Los aluxes son duendecitos de la tradición oral maya, guardianes de la milpa. En Campeche se cuentan junto a la Xtabay. Chenes viene de «chen», pozo.' },
    lowpoly: { nombre: 'Las grutas de Xtacumbilxunaan', lugar: 'Bolonchén de Rejón, Hopelchén', lema: 'Cristales que suben y bajan como las escaleras del pozo; jabalíes que embisten.',
      dato: 'Bolonchén significa «nueve pozos». Frederick Catherwood dibujó a los mayas bajando por una escalera altísima de troncos y cuerdas para sacar agua de estas grutas.' },
    codex: { nombre: 'El glifo de Edzná', lugar: 'Zona arqueológica de Edzná', lema: 'Piedras que se hunden, glifos que abren puertas y el jaguar.',
      dato: 'El Edificio de los Cinco Pisos de Edzná alcanza unos 31.5 metros de altura y tiene jeroglíficos en sus escalinatas. En otro edificio del sitio, el Templo de los Mascarones, se conservan rostros de estuco asociados con la deidad solar. Los glifos que abren puertas en el nivel son una idea del juego.' },
    oleo: { nombre: 'Noche en el Fuerte de San Miguel', lugar: 'Fuerte de San Miguel', lema: 'Desde el cerro del fuerte, remolinos pintados que avientan a Itzel como resortera y búhos que se lanzan.',
      dato: 'El Fuerte de San Miguel se construyó en el cerro de La Eminencia como parte de las defensas costeras de Campeche. Junto con las baterías cercanas, ayudaba a dificultar los desembarcos enemigos. Hoy alberga el Museo de Arqueología Maya, con piezas de sitios de la región.' },
    vitral: { nombre: 'La Catedral de la Concepción', lugar: 'Catedral de Campeche', lema: 'Vidrio resbaloso y escarabajos joya rodando bajo las dos torres.',
      dato: 'La Catedral de Nuestra Señora de la Purísima Concepción da a la plaza principal. Sus dos torres se ven desde el malecón. Los vitrales de este mundo son pura imaginación.' },
    cuaderno: { nombre: 'El cuaderno de Catherwood', lugar: 'Camino a Hochob, los Chenes', lema: 'Líneas de lápiz para caminar y garabatos que rebotan, como en un cuaderno de viajero por los Chenes.',
      dato: 'Frederick Catherwood fue un dibujante que viajó por la península de Yucatán con John Lloyd Stephens y documentó sitios mayas con sus ilustraciones. Stephens publicó el relato de sus viajes en 1843. Este nivel imagina que el cuaderno de Catherwood llega a Hochob.' },
    grabado: { nombre: 'Los astilleros de Campeche', lugar: 'Astilleros del barrio de San Francisco', lema: 'Ruedas de tablas, muros de madera y calaveritas entre barcos a medio hacer.',
      dato: 'Campeche fue de las pocas ciudades de la América española que hacían sus propios barcos. La madera más usada era el jabín, junto con caoba, cedro y guayacán.' },
    anime: { nombre: 'Malecón de las cometas', lugar: 'Malecón de Campeche', lema: 'Fresita se vuelve sólida en el aire: cuélgate de ella y salta adonde quieras, con pelícanos en picada frente al mar.',
      dato: 'El malecón de Campeche bordea la costa de la ciudad y mira hacia el golfo de México. Las cometas y los saltos sobre Fresita son parte de la imaginación del juego.' },
    nouveau: { nombre: 'El jardín Xmuch Haltún', lugar: 'Baluarte de Santiago', lema: 'Cruza el jardín entre flores y pétalos; Fresita crea hojas donde Itzel necesita apoyo.',
      dato: 'Adentro del Baluarte de Santiago hay un jardín botánico con unas 250 especies de plantas y una enorme ceiba. Su nombre se traduce como «conjunto de sartenejas».' },
    deco: { nombre: 'La tramoya del Teatro Toro', lugar: 'Teatro Francisco de Paula Toro', lema: 'Las máquinas doradas detrás del escenario: plataformas rapidísimas y autómatas de cuerda.',
      dato: 'El teatro abrió el 15 de septiembre de 1834 y fue de los primeros teatros líricos de México. Su ingeniero, el francés Teodoro Journot, estaba preso en Campeche.' },
    cyber: { nombre: 'Las plataformas de la Sonda', lugar: 'Sonda de Campeche', lema: 'Bandas transportadoras y drones con láser en las plataformas del Golfo.',
      dato: 'El pescador Rudesindo Cantarell vio una mancha de chapopote en el mar y avisó a Pemex. El yacimiento gigante de la Sonda de Campeche lleva su nombre.' },
    cinema: { nombre: 'Las bocas de Chicanná', lugar: 'Chicanná, ruta Río Bec', lema: 'Portales con boca de serpiente, rocas que flotan, babosas que saltan y muros imposibles.',
      dato: 'Chicanná quiere decir «casa de la boca de la serpiente». Se entra a uno de sus edificios por las fauces de un enorme mascarón de Itzamná.' },
    vapor: { nombre: 'La hacienda Uayamón', lugar: 'Hacienda Uayamón', lema: 'Rejillas de vapor y máquinas raspadoras de henequén.',
      dato: 'Uayamón empezó como rancho ganadero, los piratas la saquearon en 1685 y luego creció con el henequén. En 1913 destruyeron las calderas de sus máquinas raspadoras.' },
    barro: { nombre: 'Los alfareros de Tepakán', lugar: 'Tepakán, Calkiní', lema: 'Puentes que se estiran, pilares que suben y grumos que te persiguen en el taller.',
      dato: 'La alfarería de Tepakán es una herencia maya que pasa de generación en generación. Son famosos sus silbatos de barro de colores para el Día de Muertos.' },
    eco: { nombre: 'La maqueta de la ciudad', lugar: 'Museo de la Ciudad, Baluarte de San Carlos', lema: 'Camina entre islas de maqueta. Deja tu eco en los círculos para que los puentes no se apaguen.',
      dato: 'El Baluarte de San Carlos formó parte de las defensas de la ciudad amurallada. En su interior está el Museo de la Ciudad, donde fotografías y maquetas cuentan cómo fue cambiando Campeche. El nivel imagina que Itzel camina dentro de una de esas maquetas.' },
    fuego: { nombre: 'La toma de 1685', lugar: 'Ciudad de Campeche', lema: 'Lorencillo y Grammont entraron a la ciudad: apaga las brasas para cruzar.',
      dato: 'En 1685 Lorencillo y Grammont tomaron Campeche con cerca de mil hombres. Permanecieron varios días, saquearon la villa y atacaron y quemaron ranchos cercanos. El ataque mostró lo vulnerable que era la ciudad y fue uno de los motivos para construir sus murallas.' },
    agua: { nombre: 'Los arrecifes de Cayos Arcas', lugar: 'Cayos Arcas, Sonda de Campeche', lema: 'Nada hasta el ancla. Fresita te da burbujas de aire.',
      dato: 'Cayos Arcas es un grupo de pequeñas islas y arrecifes de la Bahía de Campeche. Aunque las islas están deshabitadas, en sus alrededores hay instalaciones petroleras. El recorrido submarino del juego imagina sus aguas como un camino entre arrecifes y un ancla.' },
    hielo: { nombre: 'Los nortes de Isla Aguada', lugar: 'Isla Aguada, Laguna de Términos', lema: 'Un norte inventado que lo congela todo: resbala, esquiva carámbanos y cruza el mar helado sobre témpanos.',
      dato: 'Isla Aguada es Pueblo Mágico y puerta de entrada a la Laguna de Términos y sus delfines. Campeche es tierra caliente: lo más frío que llega son los nortes. La nieve de este mundo es puro cuento.' },
    cielo: { nombre: 'El cielo sobre Edzná', lugar: 'El cielo de Campeche', lema: 'Poca gravedad, meteoros de paso y estrellas para tender caminos.',
      dato: 'Los pueblos mayas reconocían figuras propias en el cielo, entre ellas el alacrán Sinan Ek y un conejo en la Luna. Edzná fue una ciudad maya de Campeche, conocida por su gran Edificio de los Cinco Pisos. El nivel imagina un viaje entre estrellas sobre ese paisaje.' },
    hollin: { nombre: 'La ceniza del Chichonal', lugar: 'Campeche', lema: 'La ceniza oscurece el día. Las criaturas no ven: oyen. Agáchate en los escondites (↓).',
      dato: 'A finales de marzo de 1982 hizo erupción el volcán Chichonal, en Chiapas. La ceniza cayó sobre Chiapas y Tabasco y también alcanzó Campeche en menor grado. El nivel imagina cómo se vería el paisaje oscurecido por esa nube; las criaturas que se guían por el sonido son parte del juego.' },
    bits8: { nombre: 'Campeche 1-1', lugar: 'Los barrios de la ciudad', lema: 'Elevadores que no paran y canisteles que se vuelven ladrillos.',
      dato: 'La ciudad de Campeche tiene barrios históricos como San Francisco, San Román y Santa Ana. El juego imagina sus calles y fachadas como un mundo de ocho bits.' },
    bits32: { nombre: 'La noche de la Soledad', lugar: 'Baluarte de la Soledad', lema: 'Enciende las antorchas: a su luz aparecen las losas fantasmales.',
      dato: 'El Baluarte de la Soledad fue parte de la muralla que defendía Campeche de los ataques por mar. Hoy alberga el Museo de Arquitectura Maya, donde se exhiben piezas de distintos sitios de la región. Las losas que aparecen con la luz son una idea fantástica del nivel.' },
    bits64: { nombre: 'La selva de Calakmul', lugar: 'Reserva de la Biosfera de Calakmul', lema: 'Flores que solo abren con Fresita cerca, y ella puede cargarte.',
      dato: 'Calakmul fue una de las grandes ciudades mayas. Su selva es hogar de jaguares, y al atardecer miles de murciélagos salen de una cueva llamada el Volcán de los Murciélagos.' },
    miniatura: { nombre: 'Calakmul en miniatura', lugar: 'Calakmul, visto desde el suelo', lema: 'Fresita e Itzel se encogieron: cada piedra es un edificio y los bichos son de su tamaño. Las hojas se abren con Fresita cerca, y ella puede cargarte.',
      dato: 'Las piedras y la hojarasca de este mundo salen de una foto real de Calakmul. Este mundo es un cuento: nadie se encoge, pero las hormigas arrieras de verdad cortan hojas y las cargan hasta su nido.' },
    // otros géneros y fiestas
    templo: { nombre: 'La defensa de Campeche', lugar: 'Ciudad de Campeche', lema: 'Cinco oleadas de piratas rumbo a la Catedral, con Grammont y Lorencillo al frente. Fresita arma las defensas; Itzel junta la pólvora y apaga los incendios.',
      dato: 'En 1685 Lorencillo y Grammont tomaron y saquearon Campeche con cerca de mil hombres; también atacaron ranchos cercanos. Después se construyeron murallas para proteger la ciudad. Este nivel imagina que Itzel y Fresita ayudan a defenderla.' },
    vuelo: { nombre: 'Vuelo sobre Edzná', lugar: 'El cielo de Campeche', lema: 'Itzel pilotea la canoa de estrellas; Fresita dispara. Al final espera el alacrán.',
      dato: 'Edzná fue una ciudad maya construida en un valle donde el manejo del agua era fundamental. Sus habitantes usaron canales y una represa para captar, guardar y distribuir el agua de lluvia. La canoa de estrellas del nivel es una manera imaginaria de volar sobre ese lugar.' },
    cocina: { nombre: 'La cocina del mercado', lugar: 'Mercado de Campeche', lema: 'Pan de cazón, panuchos y agua de chaya: Itzel prepara, Fresita cocina y sirve.',
      dato: 'El pan de cazón es un platillo tradicional de Campeche, aunque no lleva pan. Se prepara con tortillas apiladas, frijol y cazón, y se cubre con salsa de tomate. En el nivel, Itzel y Fresita lo preparan junto con otros pedidos del mercado.' },
    pesca: { nombre: 'Pesca en el malecón', lugar: 'Malecón de Campeche', lema: 'Itzel pesca desde el malecón y Fresita, abajo del agua, le lleva los peces del pedido del mercado.',
      dato: 'La pesca es una actividad importante para las comunidades de la costa campechana. Las capturas se desembarcan en puertos como Isla Arena, Campeche, Seybaplaya, Champotón e Isla Aguada. El nivel imagina que Itzel y Fresita reúnen los peces para un pedido del mercado.' },
    jarana: { nombre: 'La vaquería de la jarana', lugar: 'Plaza principal de Campeche, frente a la Catedral', lema: 'Itzel mantiene la botella en equilibrio durante la vaquería y Fresita le ayuda.',
      dato: 'La jarana se baila en las vaquerías de Campeche y otros lugares de la península de Yucatán.' },
    campechanidad: { nombre: 'La Campechanita', lugar: 'Plaza principal de Campeche, frente a la Catedral', lema: 'Celebren la Campechanidad bailando al ritmo de la Campechanita habanera.',
      dato: 'El 4 de octubre se recuerda la fundación de la villa de San Francisco de Campeche en 1540; octubre es el mes de la Campechanidad.' },
    imprenta: { nombre: 'Estampas de Jaina', lugar: 'Isla de Jaina', lema: 'Fresita estampa a Itzel en papel: la estampa pisa las prensas para que los pliegos no se atoren, entre figurillas de la isla.',
      dato: 'La Isla de Jaina, en la costa de Campeche, fue lugar de entierro de la élite maya y de ella salen figurillas de barro famosas. Este nivel imagina una imprenta que estampa esas figurillas.' },
    posadas: { nombre: 'Las posadas de San Francisco', lugar: 'Barrio de San Francisco', lema: 'Piñatas de siete picos, peregrinos con velitas que derriten los carámbanos y diablitos de pastorela.',
      dato: 'San Francisco es uno de los barrios históricos de Campeche y se organiza alrededor de su parroquia. En el barrio se fundó un convento franciscano durante el siglo XVI. El nivel imagina una posada entre sus calles, con peregrinos, piñatas y personajes de pastorela.' },
    animas: { nombre: 'Hanal Pixán en Pomuch', lugar: 'Pomuch, Hecelchakán', lema: 'Fresita prende las velas con su faro y su luz ya no se apaga; las ánimas caminan delante con su velita.',
      dato: 'Hanal Pixán significa «comida de las almas». En Pomuch las familias limpian con cariño los huesos de sus difuntos, el Choo Baak, Patrimonio Cultural de Campeche desde 2017. Ahí también se hornea el pan de Pomuch.' },
    carnaval: { nombre: 'Carnaval de Campeche', lugar: 'Calles de la ciudad de Campeche', lema: 'Itzel no brinca sola: Fresita la hace saltar con un clic justo al compás. Súbete a los carros alegóricos y esquiva la pintadera.',
      dato: 'Se considera el carnaval más antiguo de México: su primer registro es de 1582. Empieza quemando a Juan Carnaval, un muñeco que carga con el mal humor, y su día más loco es el Martes de Pintadera.' },
    feria: { nombre: 'La Feria de San Román', lugar: 'Barrio de San Román', lema: 'La rueda de la fortuna gira y Fresita la frena con su reloj; cuidado con los toritos de cohetes.',
      dato: 'Se celebra en septiembre. Cuenta la tradición que el Cristo Negro llegó en 1565 en un barco que salió de Alvarado con Juan Cano y cruzó una gran tormenta.' },
  };

  const JEFES_REAL = {
    mythos: { nombre: 'La Máscara de Calakmul', carta: 'LA MÁSCARA DE CALAKMUL', menu: 'Entrada de la Máscara de Calakmul', lema: 'Una máscara de jade con un ojo que bajó por la grieta del cielo.',
      dato: 'En Calakmul se hallaron máscaras funerarias de mosaico de jade, concha y obsidiana. Una apareció en 1984 en la tumba de un rey, en la Estructura VII.' },
    golem: { nombre: 'El Mascarón de Edzná', carta: 'EL MASCARÓN DE EDZNÁ', menu: 'Entrada del Mascarón de Edzná', lema: 'Pisa, avienta rocas y embiste contra las paredes.',
      dato: 'Edzná guarda mascarones de estuco enormes: los del Templo de los Mascarones están entre los mejores ejemplos de estuco modelado.' },
    serpiente: { nombre: 'Kukulkán, la Serpiente de nubes', carta: 'KUKULKÁN', menu: 'Entrada de Kukulkán', lema: 'Vuela, se lanza en picada y escupe fuego.',
      dato: 'Kukulkán es la serpiente emplumada de los mayas. En Campeche, las portadas de la región de los Chenes y Río Bec también se abren como bocas de serpiente.' },
    jaguar: { nombre: 'Balam, el jaguar de Calakmul', carta: 'BALAM', menu: 'Entrada de Balam', lema: 'Acecha, salta y ruge hasta que se cae el techo.',
      dato: 'Balam es jaguar en maya. En la selva de Calakmul todavía viven jaguares.' },
    hadas: { nombre: 'La Xtabay de la ceiba', carta: 'LA XTABAY', menu: 'Entrada de la Xtabay', lema: 'Sus luces se roban a Fresita; Itzel tiene que rescatarla.',
      dato: 'La Xtabay es un personaje de leyenda: una mujer que se aparece junto a las ceibas en noches de luna. En Uayamón y en toda la península se sigue contando.' },
    cocodrilo: { nombre: 'El Cocodrilo de Términos', carta: 'EL COCODRILO', menu: 'Entrada del Cocodrilo', lema: 'Nada bajo el suelo y sale a morder donde estás parada.',
      dato: 'En las lagunas y los manglares de Campeche viven cocodrilos, como los de la Laguna de Términos.' },
    pirata: { nombre: 'Lorencillo, el pirata fantasma', carta: 'LORENCILLO', menu: 'Entrada de Lorencillo', lema: 'Su barco navega por el aire y dispara contra la muralla.',
      dato: 'Lorencillo es Laurens de Graaf, un pirata holandés que atacó Campeche. Volvió en 1685 con Grammont.' },
    chaac: { nombre: 'Chaac, el señor de la lluvia', carta: 'CHAAC', menu: 'Entrada de Chaac', lema: 'Una nube con máscara que suelta rayos, aguaceros y ventarrones.',
      dato: 'En la región de los Chenes y Río Bec, los mascarones del dios de la lluvia se apilan en las esquinas de los edificios.' },
    camazotz: { nombre: 'Camazotz, el del Volcán de los Murciélagos', carta: 'CAMAZOTZ', menu: 'Entrada de Camazotz', lema: 'Se lanza en picada, chilla y apaga la luz.',
      dato: 'Cerca de Conhuás, en Calakmul, miles de murciélagos salen de una cueva al atardecer como la fumarola de un volcán.' },
    abeja: { nombre: 'Xunán Kab, la abeja reina', carta: 'XUNÁN KAB', menu: 'Entrada de Xunán Kab', lema: 'Manda su enjambre, tira miel pegajosa y clava el aguijón.',
      dato: 'Xunán Kab es la abeja melipona, sin aguijón de verdad: los mayas la han cuidado por siglos para sacar su miel.' },
    brawbot: { nombre: 'La Gran Raspadora de Uayamón', carta: 'LA GRAN RASPADORA', menu: 'Entrada de la Gran Raspadora', lema: 'La máquina de la hacienda: golpes, ondas de choque y calderas al rojo.',
      dato: 'Las máquinas raspadoras sacaban la fibra del henequén. En Uayamón funcionaban con calderas.' },
    ruptura: { nombre: 'La Ruptura de Edzná', carta: 'LA RUPTURA', menu: 'Entrada de la Ruptura', lema: 'Todos los lugares de Campeche fundidos en uno, con un núcleo que late.',
      dato: 'Edzná fue una gran ciudad maya en el valle de Campeche. Su pirámide de los Cinco Pisos mide 31.5 metros.' },
  };

  // [nombre nuevo, descripción nueva o null para dejar la que tiene]
  const FAUNA = {
    guardia: ['Guardián de Chicanná', 'Vigila la entrada de la casa de la boca de la serpiente: lanza su dardo hacia donde mira y tarda en voltearse.'],
    bestia: ['La bestia de la gruta', null],
    foca: ['Manatí del Golfo', 'Nada bajo el hielo (se ven sus ondas) y sale junto a Itzel: empuja el témpano y avienta a Itzel.'],
    muneco: ['Muñeco de nieve', 'Solo existe en este cuento. Avienta bolas de nieve; si caen al mar, dejan un pedacito de hielo flotando un rato.'],
    pavo: ['Pavo ocelado', 'El ave más vistosa de Calakmul: camina muy orgullosa y cada tanto abre la cola. El abanico la protege y empuja a Itzel lejos.'],
    koi: ['Robalo de tinta', 'Un robalo de Champotón pintado de un brochazo que nada por el aire dando ochos.'],
    grulla: ['Garza de papel', 'Una garza doblada de papel que planea y se lanza en picada.'],
    cuervo: ['Zanate del maizal', 'Vuelan en parvada de un lado a otro, como una ola sobre la milpa de noche.'],
    cuervoCeniza: ['Zanate de ceniza', null],
    nahual: ['Uay de niebla', 'Un brujo de la tradición maya vuelto humo con forma de jaguarcito: se acerca a pasitos mientras no lo veas.'],
    erizo: ['Puerco espín de musgo', 'Camina por el jardín del baluarte y cada tanto se hace bolita de espinas.'],
    erizoTinta: ['Puerco espín de linóleo', 'El puerco espín del jardín, tallado en linóleo para la imprenta. Camina y se hace bolita.'],
    mono: ['Saraguato', 'El mono aullador de Calakmul: desde lo alto te avienta cocos que caen justo donde estás.'],
    jabali: ['Pecarí de cristal', 'Embiste en línea recta cuando te ve, hasta chocar con algo.'],
    girasol: ['Flor de tajonal', 'La flor amarilla del monte, de donde las meliponas sacan su miel: voltea hacia Itzel y escupe semillas en arco.'],
    automata: ['Autómata de la tramoya', 'Una figura de cuerda del Teatro Toro: marcha, se detiene y se da la vuelta como un reloj.'],
    bailarina: ['Bailarina del Teatro Toro', 'Gira sobre la punta por todo el escenario; mientras gira no se le puede caer encima.'],
    cucu: ['Cucú del apuntador', 'Sale disparado de su concha de apuntador cada tanto, muy lejos, y regresa a su casita.'],
    gargola: ['Mono de cantera', 'Espera en su ménsula de piedra de la catedral y se lanza en picada cuando Itzel pasa abajo; luego regresa volando.'],
    rover: ['Carrito de plataforma', 'Un robotito de seis ruedas que patrulla la cubierta y embiste si ve a Itzel enfrente.'],
    dron: ['Dron de la Sonda', 'Vigila las plataformas del Golfo y dispara un láser hacia el suelo.'],
    invasor: ['Corsario de 4 colores', 'Bajan en formación de lado a lado, como la flota de un pirata.'],
    tucan: ['Tucán de Calakmul', null],
    bucanero: ['Bucanero de Isla Tris', 'Desde su lancha avienta cocos en arco hacia Itzel. Isla Tris era el nombre de la Isla del Carmen, guarida de piratas.'],
    calavera: ['Calaverita de Pomuch', 'Brinca de un lado a otro como en el Hanal Pixán.'],
    medusa: ['Medusa del malecón', null],
    silbato: ['Silbato de Tepakán', null],
    catrin: ['Catrín del astillero', null],
    pirata: ['Pirata de Lorencillo', 'De la toma de 1685: avienta huesos en arco.'],
    fantasma: ['Fantasma de la Soledad', null],
    centinela: ['Centinela de la Soledad', null],
  };

  const OBJETOS = { // nombres del entorno
    relojcucu: 'Concha del apuntador', tele: 'Boca de serpiente', camara: 'Cámara de la plataforma', laser: 'Puerta láser de la plataforma',
    respiro: 'Coral de Cayos Arcas', prensa: 'Prensa de la imprenta', estela: 'Estela de Edzná', obsidiana: 'Espejo de obsidiana',
  };
  const PODERES = { cristal: 'Pilar de estalactita', gubia: 'Azuela del astillero', lapiz: 'Lápiz de Catherwood', vidrio: 'Vitral de la Catedral', farol: 'Faro de Seybaplaya', hackeo: 'Hackeo de la plataforma', valvula: 'Válvula de caldera', portal: 'Boca de serpiente', moldear: 'Barro de Tepakán' };

  function aplicar() {
    if (typeof NIVELES !== 'undefined') for (const id in MUNDOS) if (NIVELES[id]) Object.assign(NIVELES[id], MUNDOS[id]);
    if (typeof JEFES !== 'undefined') for (const id in JEFES_REAL) if (JEFES[id]) { const { nombre, lema, dato } = JEFES_REAL[id]; Object.assign(JEFES[id], { nombre, lema, dato }); }
    if (typeof ENEMIGO_INFO !== 'undefined') for (const id in FAUNA) if (ENEMIGO_INFO[id]) { ENEMIGO_INFO[id][0] = FAUNA[id][0]; if (FAUNA[id][1]) ENEMIGO_INFO[id][1] = FAUNA[id][1]; }
    if (typeof ENTORNO !== 'undefined') for (const id in OBJETOS) if (ENTORNO[id]) ENTORNO[id].nombre = OBJETOS[id];
    if (typeof MEC !== 'undefined') for (const id in PODERES) if (MEC.POW[id]) MEC.POW[id].name = PODERES[id];
  }
  aplicar();
  return { MUNDOS, JEFES: JEFES_REAL, FAUNA, aplicar };
})();
