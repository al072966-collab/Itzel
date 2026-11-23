'use strict';
// Ilustraciones proporcionadas para los enemigos. La lógica, colisiones y
// efectos de cada criatura siguen siendo los del juego.
(() => {
  const catalogo = {
  "abeja": {
    "file": "abejamelipona.png",
    "box": [
      253,
      67,
      1285,
      865
    ]
  },
  "abordador": {
    "file": "abordado.png",
    "box": [
      174,
      12,
      911,
      1370
    ]
  },
  "escorpion": {
    "file": "alacran.png",
    "box": [
      151,
      15,
      1624,
      853
    ]
  },
  "alacranMini": {
    "file": "alacranrealista.png",
    "box": [
      52,
      16,
      1699,
      883
    ]
  },
  "alux": {
    "file": "alux.png",
    "box": [
      42,
      17,
      1055,
      1425
    ]
  },
  "aplastador": {
    "file": "aplastador.png",
    "box": [
      127,
      60,
      1136,
      1161
    ]
  },
  "arana": {
    "file": "araña.png",
    "box": [
      153,
      22,
      1383,
      984
    ]
  },
  "aranaCeniza": {
    "file": "arañadeceniza.png",
    "box": [
      208,
      74,
      1321,
      873
    ]
  },
  "saltarina": {
    "file": "arañasaltarina.png",
    "box": [
      50,
      59,
      1482,
      939
    ]
  },
  "automata": {
    "file": "automata.png",
    "box": [
      228,
      32,
      920,
      1337
    ]
  },
  "avispa": {
    "file": "avispa de papel.png",
    "box": [
      67,
      33,
      1582,
      867
    ]
  },
  "avispaMini": {
    "file": "avispa.png",
    "box": [
      178,
      5,
      1595,
      820
    ]
  },
  "babosa": {
    "file": "babosa.png",
    "box": [
      371,
      11,
      1730,
      690
    ]
  },
  "bailarin": {
    "file": "bailarin de neon.png",
    "box": [
      211,
      68,
      940,
      1293
    ]
  },
  "bailarina": {
    "file": "bailarina.png",
    "box": [
      82,
      22,
      934,
      1511
    ]
  },
  "bejuco": {
    "file": "bejuco.png",
    "box": [
      258,
      45,
      636,
      1738
    ]
  },
  "bocina": {
    "file": "bocina.png",
    "box": [
      244,
      116,
      1033,
      1117
    ]
  },
  "botete": {
    "file": "botete.png",
    "box": [
      196,
      97,
      1355,
      898
    ]
  },
  "bucanero": {
    "file": "bucanero.png",
    "box": [
      205,
      42,
      1001,
      1254
    ]
  },
  "buho": {
    "file": "buho de la noche.png",
    "box": [
      0,
      104,
      1536,
      901
    ]
  },
  "calavera": {
    "file": "calaverita.png",
    "box": [
      180,
      79,
      1098,
      1140
    ]
  },
  "campana": {
    "file": "campana de bronce.png",
    "box": [
      181,
      27,
      1097,
      1197
    ]
  },
  "cangrejo": {
    "file": "cangrejodelmalecon.png",
    "box": [
      106,
      53,
      1668,
      834
    ]
  },
  "carambano": {
    "file": "carambano.png",
    "box": [
      199,
      64,
      1109,
      1086
    ]
  },
  "carcoma": {
    "file": "carcoma.png",
    "box": [
      161,
      137,
      1335,
      879
    ]
  },
  "carpintero": {
    "file": "carpientero decrital.png",
    "box": [
      199,
      73,
      1254,
      862
    ]
  },
  "rover": {
    "file": "carritodeplataforma.png",
    "box": [
      187,
      43,
      1345,
      932
    ]
  },
  "catrin": {
    "file": "catrindelastillero.png",
    "box": [
      228,
      21,
      772,
      1530
    ]
  },
  "centinela": {
    "file": "centineleda.png",
    "box": [
      259,
      66,
      1171,
      977
    ]
  },
  "chapulin": {
    "file": "chapulin.png",
    "box": [
      131,
      14,
      1598,
      785
    ]
  },
  "charran": {
    "file": "charran.png",
    "box": [
      388,
      40,
      1368,
      758
    ]
  },
  "cocuyo": {
    "file": "cocuyo.png",
    "box": [
      164,
      150,
      1540,
      738
    ]
  },
  "cometa": {
    "file": "cometa.png",
    "box": [
      380,
      109,
      1143,
      869
    ]
  },
  "conejo": {
    "file": "conejo.png",
    "box": [
      174,
      0,
      1021,
      1271
    ]
  },
  "contramaestre": {
    "file": "contramastre.png",
    "box": [
      275,
      26,
      1083,
      1182
    ]
  },
  "culebra": {
    "file": "coralillo.png",
    "box": [
      234,
      111,
      1932,
      610
    ]
  },
  "cuadrito": {
    "file": "cuadradito.png",
    "box": [
      162,
      82,
      1375,
      971
    ]
  },
  "cucu": {
    "file": "cucu.png",
    "box": [
      211,
      173,
      1326,
      843
    ]
  },
  "diablito": {
    "file": "diablito.png",
    "box": [
      68,
      27,
      1123,
      1285
    ]
  },
  "dron": {
    "file": "drondelasonda.png",
    "box": [
      77,
      163,
      1697,
      719
    ]
  },
  "zancudo": {
    "file": "enjambredezancudos.png",
    "box": [
      336,
      181,
      1218,
      838
    ]
  },
  "escarabajo": {
    "file": "escarabajo de vitral.png",
    "box": [
      134,
      64,
      1178,
      1086
    ]
  },
  "rinoceronte": {
    "file": "escarabajorinoceronte.png",
    "box": [
      177,
      4,
      1704,
      866
    ]
  },
  "fantasma": {
    "file": "fantasma.png",
    "box": [
      300,
      226,
      1011,
      978
    ]
  },
  "girasol": {
    "file": "flor de tajonal.png",
    "box": [
      159,
      5,
      864,
      1522
    ]
  },
  "fragata": {
    "file": "fragata.png",
    "box": [
      48,
      122,
      2124,
      620
    ]
  },
  "garabato": {
    "file": "garabato.png",
    "box": [
      167,
      70,
      1142,
      1087
    ]
  },
  "garza": {
    "file": "garzadel estero.png",
    "box": [
      175,
      56,
      959,
      1350
    ]
  },
  "grulla": {
    "file": "garzadepapel.png",
    "box": [
      117,
      6,
      1359,
      961
    ]
  },
  "gaviota": {
    "file": "gaviotadelmalecon.png",
    "box": [
      313,
      150,
      1462,
      737
    ]
  },
  "geoda": {
    "file": "geoda saltarina.png",
    "box": [
      59,
      61,
      1194,
      1196
    ]
  },
  "magma": {
    "file": "golemdemagma.png",
    "box": [
      132,
      95,
      1177,
      1117
    ]
  },
  "goma": {
    "file": "goma.png",
    "box": [
      210,
      158,
      1314,
      881
    ]
  },
  "grumo": {
    "file": "grumodeplastilina.png",
    "box": [
      257,
      172,
      1285,
      847
    ]
  },
  "guardia": {
    "file": "guardian.png",
    "box": [
      33,
      70,
      995,
      1425
    ]
  },
  "guerrero": {
    "file": "guerrero de pieda.png",
    "box": [
      279,
      2,
      936,
      1291
    ]
  },
  "halcon": {
    "file": "halcon.png",
    "box": [
      293,
      107,
      1462,
      797
    ]
  },
  "esporin": {
    "file": "hongodeesporas.png",
    "box": [
      353,
      164,
      1176,
      873
    ]
  },
  "hormiga": {
    "file": "hormiga.png",
    "box": [
      53,
      137,
      1718,
      799
    ]
  },
  "iguana": {
    "file": "iguanadeneon.png",
    "box": [
      87,
      80,
      2088,
      651
    ]
  },
  "jaguar": {
    "file": "jaguar.png",
    "box": [
      107,
      0,
      1674,
      874
    ]
  },
  "bestia": {
    "file": "la bestia.png",
    "box": [
      37,
      1,
      1738,
      867
    ]
  },
  "libelula": {
    "file": "libelula.png",
    "box": [
      419,
      26,
      1436,
      867
    ]
  },
  "foca": {
    "file": "manati.png",
    "box": [
      85,
      141,
      1446,
      825
    ]
  },
  "mancha": {
    "file": "manchatrepadora.png",
    "box": [
      199,
      47,
      1134,
      1037
    ]
  },
  "mecha": {
    "file": "mecha.png",
    "box": [
      267,
      59,
      1012,
      1160
    ]
  },
  "medusa": {
    "file": "medusa.png",
    "box": [
      303,
      103,
      987,
      1088
    ]
  },
  "mojarra": {
    "file": "mojarra del cenote.png",
    "box": [
      13,
      0,
      1773,
      887
    ]
  },
  "gargola": {
    "file": "mono de cantera.png",
    "box": [
      107,
      32,
      1444,
      1001
    ]
  },
  "escribano": {
    "file": "mono escribano.png",
    "box": [
      188,
      7,
      1139,
      1189
    ]
  },
  "morena": {
    "file": "morena.png",
    "box": [
      62,
      151,
      2117,
      575
    ]
  },
  "muneco": {
    "file": "muñecodenieve.png",
    "box": [
      69,
      68,
      957,
      1481
    ]
  },
  "murcielago": {
    "file": "murcielago del ocsao.png",
    "box": [
      144,
      79,
      1630,
      788
    ]
  },
  "nauyaca": {
    "file": "nauyaca.png",
    "box": [
      240,
      66,
      1254,
      920
    ]
  },
  "ollita": {
    "file": "olitabrincona.png",
    "box": [
      85,
      88,
      1240,
      1084
    ]
  },
  "oruga": {
    "file": "orguamonarca.png",
    "box": [
      224,
      48,
      1712,
      677
    ]
  },
  "pavo": {
    "file": "pavo.png",
    "box": [
      186,
      65,
      1344,
      932
    ]
  },
  "pelicano": {
    "file": "pelicano.png",
    "box": [
      67,
      16,
      1898,
      783
    ]
  },
  "jabali": {
    "file": "percari de crista.png",
    "box": [
      191,
      12,
      1568,
      869
    ]
  },
  "perro": {
    "file": "perrodeceniza.png",
    "box": [
      214,
      81,
      1544,
      822
    ]
  },
  "pezloro": {
    "file": "pezloro.png",
    "box": [
      89,
      0,
      1710,
      887
    ]
  },
  "pintador": {
    "file": "pintador.png",
    "box": [
      179,
      63,
      948,
      1199
    ]
  },
  "pirata": {
    "file": "pirata.png",
    "box": [
      140,
      169,
      900,
      1394
    ]
  },
  "incendiario": {
    "file": "pirataincendiario.png",
    "box": [
      45,
      56,
      951,
      1417
    ]
  },
  "polilla": {
    "file": "polilla.png",
    "box": [
      323,
      48,
      1210,
      849
    ]
  },
  "erizo": {
    "file": "puerscoespin.png",
    "box": [
      351,
      81,
      1435,
      779
    ]
  },
  "erizoTinta": {
    "file": "puescopindelineoleo.png",
    "box": [
      107,
      17,
      1655,
      870
    ]
  },
  "rana": {
    "file": "ranadelcenote.png",
    "box": [
      288,
      124,
      1241,
      849
    ]
  },
  "koi": {
    "file": "robalo de tinta.png",
    "box": [
      66,
      86,
      2142,
      657
    ]
  },
  "sacapuntas": {
    "file": "sacapuntos.png",
    "box": [
      253,
      102,
      1247,
      892
    ]
  },
  "salamandra": {
    "file": "salamandra.png",
    "box": [
      97,
      2,
      2069,
      722
    ]
  },
  "mono": {
    "file": "saraguato.png",
    "box": [
      198,
      119,
      1141,
      1102
    ]
  },
  "silbato": {
    "file": "silbato.png",
    "box": [
      180,
      81,
      1593,
      807
    ]
  },
  "soplo": {
    "file": "soplo.png",
    "box": [
      164,
      98,
      1120,
      1103
    ]
  },
  "tijeras": {
    "file": "tijeras de papel picado.png",
    "box": [
      127,
      0,
      1618,
      887
    ]
  },
  "topon": {
    "file": "topon.png",
    "box": [
      231,
      174,
      1081,
      1050
    ]
  },
  "torito": {
    "file": "torito.png",
    "box": [
      168,
      26,
      1295,
      993
    ]
  },
  "torreta": {
    "file": "torreta.png",
    "box": [
      319,
      165,
      1536,
      747
    ]
  },
  "tortuga": {
    "file": "tortuga.png",
    "box": [
      155,
      124,
      1564,
      803
    ]
  },
  "tucan": {
    "file": "tucan.png",
    "box": [
      412,
      8,
      1715,
      695
    ]
  },
  "nahual": {
    "file": "uay de niebla.png",
    "box": [
      286,
      36,
      1477,
      850
    ]
  },
  "cuervo": {
    "file": "zanate.png",
    "box": [
      124,
      80,
      1713,
      828
    ]
  },
  "cuervoCeniza": {
    "file": "zanatedeceniza.png",
    "box": [
      201,
      144,
      1316,
      855
    ]
  },
  "zangano": {
    "file": "zangano.png",
    "box": [
      111,
      127,
      1425,
      767
    ]
  },
  "zopilote": {
    "file": "zopilote.png",
    "box": [
      45,
      95,
      2128,
      673
    ]
  }
};
  const imgs = Object.create(null), dibujos = MEC.FD;
  const vuelan = new Set('abeja avispa avispaMini buho cocuyo zopilote dron zangano murcielago gaviota garza zancudo libelula grulla polilla fragata carpintero cuervo cuervoCeniza charran silbato halcon tucan pajaro hadita'.split(' '));
  const nadan = new Set('mojarra koi botete medusa pezloro morena foca'.split(' '));
  const sinGiro = new Set('bailarina automata bocina campana aplastador cuadrito cucu goma sacapuntas esporin girasol ollita torito geoda cometa soplo zancudo arana aranaCeniza saltarina magma mojarra nauyaca diablito escarabajo garabato loro'.split(' '));
  const quietos = new Set('aplastador carambano bejuco esporin girasol sacapuntas bocina campana'.split(' '));
  function recurso(id) {
    if (!catalogo[id]) return null;
    let im=imgs[id];
    if (!im) { im=new Image(); im.decoding='async'; if (catalogo[id]?.file) im.src='../Roguelike/assets/enemigos/'+encodeURIComponent(catalogo[id].file); imgs[id]=im; }
    return im;
  }
  // Hojas de poses revisadas con Sprite Forge; la geometría y la colisión
  // siguen siendo las del enemigo. Los demás conservan su arte original.
  const hojasForge = {
    torito: { ruta: '../Roguelike/assets/forge/feria-san-roman/', archivo: 'torito-run-v1/processed-v6', layout: 'row', cellWidth: 128, cellHeight: 128, caja: [29,36,70,57], cajas: [[29,36,70,56],[29,38,71,55],[30,36,69,57],[30,36,69,53]], cuadros: [0,2], escalaCaja: [70,57], modo: 'toritoForge', acciones: ['correr: dos zancadas opuestas alternas'] },
    soplo: { archivo: 'soplo-v1/processed-v1', caja: [49,40,181,178], cajas: [[49,40,161,178],[55,49,141,158],[38,40,192,176],[50,43,154,165]], escalaCaja: [192,178], modo: 'soploForge', acciones: ['remolino: dos poses','inhalar','soplar','recuperar'] },
    topon: { archivo: 'topon-v1/processed-v1', caja: [45,40,167,185], cajas: [[45,40,165,178],[45,40,165,176],[44,66,168,153],[45,33,166,161]], escalaCaja: [168,185], modo: 'toponForge', acciones: ['caminar: dos poses alternas','aviso agachado','salto'] },
    torreta: { archivo: 'torreta-v1/processed-v1', caja: [25,65,208,118], cajas: [[26,79,207,104],[26,65,203,118],[26,65,197,118],[25,79,207,104]], escalaCaja: [208,118], modo: 'torretaForge', acciones: ['reposo','aviso de disparo','disparo: retroceso con destello','recarga'] },
    rover: { archivo: 'rover-rodar-v1', caja: [55, 64, 146, 124], acciones: ['rodar: cuatro poses', 'baliza intermitente'] },
    zopilote: { archivo: 'zopilote-vuelo-v1', caja: [27, 73, 199, 99], modo: 'vuelo', acciones: ['vuelo: cuatro poses de aleteo'] },
    zancudo: { archivo: 'zancudo-vuelo-v1', caja: [53, 64, 150, 123], modo: 'vuelo', acciones: ['vuelo: cuatro poses del enjambre'] },
    zangano: { archivo: 'zangano-vuelo-v1', caja: [22, 69, 212, 104], modo: 'vuelo', acciones: ['vuelo: cuatro poses'] },
    mono: { archivo: 'mono-v1', caja: [33, 39, 191, 178], modo: 'monoForge', acciones: ['reposo', 'lanzamiento', 'recuperación'] },
    oruga: { archivo: 'oruga-v1', caja: [26, 79, 207, 97], acciones: ['reptar: cuatro poses'] },
    polilla: { archivo: 'polilla-v1', caja: [40, 57, 179, 133], modo: 'vuelo', acciones: ['vuelo: cuatro poses'] },
    salamandra: { archivo: 'salamandra-v1', caja: [28, 82, 199, 92], modo: 'salamandraForge', acciones: ['caminar: dos poses', 'preparar disparo', 'disparar'] },
    tortuga: { archivo: 'tortuga-v1', caja: [36, 85, 184, 86], modo: 'caminarTortuga', acciones: ['caminar: dos poses', 'caparazón', 'deslizamiento'] },
    pavo: { archivo: 'pavo-v2', caja: [73, 80, 112, 89], modo: 'pavoForge', acciones: ['caminar: dos poses', 'abrir abanico', 'abanico abierto'] },
    tucan: { archivo: 'tucan-vuelo-v1', caja: [27, 47, 204, 140], modo: 'vuelo', acciones: ['vuelo: cuatro poses'] },
    pelicano: { archivo: 'pelicano-vuelo-v1', caja: [32, 77, 193, 98], modo: 'vuelo', acciones: ['vuelo: cuatro poses'] },
    jaguar: { archivo: 'jaguar-caminar-v1', caja: [44, 80, 167, 97], acciones: ['caminar: cuatro poses'] },
    medusa: { archivo: 'medusa-nado-v1', caja: [53, 30, 149, 205], modo: 'nadoMedusa', acciones: ['nado: cuatro poses'] },
    morena: { archivo: 'morena-nado-v1', caja: [23, 93, 209, 73], modo: 'morena', acciones: ['movimiento: cuatro poses'] },
    cangrejo: { archivo: 'cangrejo-caminar-v1', caja: [47, 84, 163, 90], acciones: ['caminar: cuatro poses alternadas', 'sueño: pose estable del nivel'] },
    murcielago: { archivo: 'murcielago-volar-v1', caja: [32, 73, 192, 108], modo: 'murcielago', acciones: ['vuelo: cuatro poses de alas', 'sueño: pose estable del estilo'] },
    rana: { archivo: 'rana-saltar-v1', caja: [44, 53, 170, 132], modo: 'salto', acciones: ['salto: aviso, impulso, ascenso y aterrizaje'] },
    culebra: { archivo: 'culebra-reptar-v1', caja: [24, 98, 209, 63], modo: 'culebra', acciones: ['reptar: cuatro poses alternadas', 'ataque y aturdimiento: conservar el dibujante del nivel'] },
    abeja: { archivo: 'abeja-vuelo-v1', caja: [23, 26, 209, 197], modo: 'vuelo', acciones: ['vuelo: cuatro poses de aleteo'] },
    abordador: { archivo: 'abordador-caminar-v1', caja: [60, 26, 144, 207], acciones: ['caminar: cuatro poses alternadas'] },
    alacranMini: { archivo: 'alacranmini-ataque-v1', caja: [26, 72, 204, 112], modo: 'embestida', acciones: ['reposo', 'preparación', 'embestida', 'cola arriba'] },
    arana: { archivo: 'arana-caminar-v1', hoja: 'atlas.png', caja: [19, 88, 216, 156], acciones: ['caminar: cuatro poses alternadas'] },
    automata: { archivo: 'automata-caminar-v1', hoja: 'atlas.png', caja: [52, 25, 152, 220], acciones: ['caminar: cuatro poses alternadas'] },
    avispaMini: { archivo: 'avispaMini-vuelo-picada-v1', caja: [44, 70, 165, 114], modo: 'swoop', acciones: ['vuelo: dos poses', 'picada', 'ascenso'] },
    aranaCeniza: { archivo: 'aranaCeniza-descenso-v1', caja: [57, 70, 136, 116], modo: 'descenso', acciones: ['reposo/vuelo: dos poses', 'descenso: aviso según altura'] },
    hormiga: { archivo: 'hormiga-v1', caja: [27, 81, 217, 98], modo: 'hormiga', acciones: ['caminar: cuatro poses alternadas', 'lleva hoja'] },
    libelula: { archivo: 'libelula-v1', caja: [57, 73, 132, 105], modo: 'libelula', acciones: ['reposo: dos poses de alas', 'aleteo: cuatro poses', 'vuelo rápido'] },
    bucanero: { archivo: 'bucanero-v1', caja: [79, 31, 112, 200], cajas: [[79, 31, 112, 200], [36, 34, 154, 198], [58, 26, 177, 198], [58, 26, 124, 197]], escalaCaja: [112, 200], escalaY: .79, modo: 'lanzamiento', acciones: ['reposo con coco', 'preparación', 'lanzamiento', 'recuperación'] },
    cocuyo: { archivo: 'cocuyo-v1', caja: [79, 80, 109, 103], cajas: [[79, 80, 109, 103], [62, 101, 120, 82], [78, 94, 112, 60], [62, 93, 119, 61]], escalaCaja: [120, 103], escalaArte: 1.4, modo: 'vuelo', acciones: ['aleteo: cuatro poses', 'posado'] },
    centinela: { archivo: 'centinela-v1', caja: [36, 14, 174, 230], modo: 'centinela', acciones: ['patrulla: paso alternado', 'lanza al frente', 'lanza elevada al atacar'] },
    nauyaca: { archivo: 'nauyaca-v1', caja: [40, 56, 203, 135], modo: 'nauyaca', acciones: ['enroscada', 'aviso del cascabel', 'mordida extendida', 'recuperación'] },
    erizo: { archivo: 'erizo-v1', caja: [72, 79, 140, 100], cajas: [[72, 79, 140, 100], [45, 79, 142, 100], [69, 79, 141, 100], [46, 79, 142, 100]], escalaCaja: [142, 100], modo: 'erizo', acciones: ['caminar: cuatro poses con patas alternadas', 'dormido: pose estable', 'curl: conserva las púas y la colisión del dibujante'] },
    saltarina: { archivo: 'saltarina-v1', caja: [38, 54, 184, 128], modo: 'salto', acciones: ['salto: aviso, impulso, ascenso y aterrizaje'] },
    fragata: { archivo: 'fragata-v1', caja: [38, 87, 184, 81], modo: 'swoop', acciones: ['aleteo: dos poses alternadas', 'picada', 'ascenso'] },
    babosa: { archivo: 'babosa-v1', caja: [24, 64, 208, 105], modo: 'salto', acciones: ['reposo', 'aviso breve', 'ascenso', 'descenso'] },
    calavera: { archivo: 'calavera-v1', caja: [58, 51, 135, 150], modo: 'salto', acciones: ['reposo', 'aviso de salto', 'ascenso', 'descenso'] },
    carambano: { archivo: 'carambano-v1', caja: [40, 37, 180, 183], modo: 'icicle', acciones: ['reposo', 'temblor de aviso', 'caída', 'regeneración progresiva'] },
    avispa: { archivo: 'avispa-v1', caja: [50, 72, 160, 113], modo: 'swoop', acciones: ['vuelo: dos poses', 'picada', 'ascenso'] },
    botete: { archivo: 'botete-v1', caja: [41, 55, 176, 157], modo: 'puffer', acciones: ['nado', 'inflado', 'púas expuestas mientras es dañino', 'desinflado'] },
    bocina: { archivo: 'bocina-v1', caja: [43, 31, 170, 192], modo: 'pulse', acciones: ['pulso rítmico', 'aviso de onda', 'máximo volumen'] },
    chapulin: { archivo: 'chapulin-v1', caja: [25, 34, 210, 159], modo: 'salto', acciones: ['reposo y aviso de salto', 'ascenso', 'descenso'] },
    conejo: { archivo: 'conejo-v1', caja: [48, 18, 164, 220], modo: 'conejo', acciones: ['reposo', 'agacharse como aviso', 'salto ascendente', 'caída'] },
    dron: { archivo: 'dron-v1', caja: [31, 87, 194, 89], modo: 'dron', acciones: ['patrulla: dos poses', 'aviso rojo', 'rayo vertical activo', 'apagado'] },
    alux: { archivo: 'alux-v1', caja: [53, 27, 156, 203], modo: 'alux', acciones: ['reposo y movimiento: dos cuadros', 'teleportación', 'desvanecimiento'] },
    aplastador: { archivo: 'aplastador-v2', caja: [13, 13, 230, 230], modo: 'aplastador', acciones: ['arriba/reposo', 'temblor', 'caída', 'abajo y ascenso'] },
    bailarin: { archivo: 'bailarin-v4', caja: [55, 40, 150, 180], modo: 'bailarin', acciones: ['baile según el compás', 'salto ascendente', 'caída'] },
    bestia: { archivo: 'bestia-v1', caja: [28, 70, 202, 115], modo: 'bestia', acciones: ['reposo', 'rugido de aviso', 'carrera', 'recuperación'] },
    campana: { archivo: 'campana-v1', caja: [26, 27, 194, 218], escalaX: 1.24, modo: 'campana', acciones: ['reposo', 'aviso de salto', 'salto', 'repique con onda de ataque'] },
    carcoma: { archivo: 'carcoma-v1', caja: [38, 63, 186, 140], modo: 'carcoma', acciones: ['reposo en el hogar', 'asomarse al borde', 'salida y huida: dos poses alternadas'] },
    buho: { archivo: 'buho-v1', caja: [15, 55, 226, 152], modo: 'buho', acciones: ['vuelo', 'picada', 'ascenso', 'dormido'] },
    escarabajo: { archivo: 'escarabajo-v1/processed', caja: [19,24,217,214], cajas: [[19,24,217,214],[19,26,217,212],[19,26,217,211],[19,34,217,203]], escalaCaja: [217,214], modo: 'escarabajo', acciones: ['reposo', 'caminar: dos poses alternas', 'encogido para aturdido, sueño o rodar'] },
    garabato: { archivo: 'garabato-v1/processed', caja: [27,20,202,217], cajas: [[27,20,202,217],[19,77,217,160],[46,20,164,217],[19,111,217,127]], escalaCaja: [217,217], modo: 'salto', acciones: ['reposo', 'compresión de aviso', 'ascenso', 'aterrizaje'] },
    gaviota: { archivo: 'gaviota-v1/processed', caja: [18,97,218,60], cajas: [[18,97,218,60],[18,29,219,196],[19,28,217,200],[18,40,218,176]], escalaCaja: [219,200], modo: 'gaviota', acciones: ['planeo', 'aleteo arriba', 'aleteo abajo', 'picada'] },
    hadita: { archivo: 'hadita-v1/processed', caja: [48,16,160,220], cajas: [[48,16,160,220],[19,22,218,210],[18,35,219,186],[37,19,184,218]], escalaCaja: [219,220], modo: 'hadita', acciones: ['vuelo: dos poses', 'aceleración', 'repliegue/recuperación'] },
    koi: { archivo: 'koi-v1/processed', caja: [18,78,219,101], cajas: [[18,78,219,101],[17,75,220,107],[18,51,219,152],[16,97,220,62]], escalaCaja: [220,152], modo: 'koi', acciones: ['planeo', 'ondulación arriba', 'ondulación abajo', 'nado rápido'] },
    mecha: { archivo: 'mecha-v1/processed-v2', caja: [72,19,111,217], cajas: [[72,19,111,217],[57,18,142,219],[57,19,141,218],[29,19,197,218]], escalaCaja: [197,219], modo: 'mecha', acciones: ['reposo', 'caminar: dos poses alternadas', 'carga', 'aturdido/reposo'] },
    iguana: { archivo: 'iguana-v1/processed', caja: [42, 148, 163, 89], cajas: [[42,148,163,89],[37,152,176,85],[9,154,184,84],[26,168,176,70]], escalaCaja: [163, 89], modo: 'iguana', acciones: ['caminar: dos poses', 'carrera agachada', 'dormida o aturdida'] },
    perro: { archivo: 'perro-v1/processed', caja: [23,94,213,142], cajas: [[23,94,213,142],[23,94,213,142],[23,108,213,128],[23,140,213,96]], escalaCaja: [213,142], modo: 'perro', acciones: ['caminar: dos poses', 'carrera de caza', 'descanso dormido'] },
    perroCeniza: { archivo: 'perro-ceniza-v1/processed-v2', caja: [18,61,218,176], cajas: [[18,61,218,176],[19,93,218,145],[19,98,217,139],[19,144,217,93]], escalaCaja: [218,176], modo: 'perroCeniza', acciones: ['alerta', 'caminar: dos poses', 'agacharse antes de cazar'] },
    pezloroGolfo: { archivo: 'pezloro-golfo-v1/processed-v1', caja: [19,61,217,133], cajas: [[19,61,217,133],[19,51,218,155],[19,64,217,129],[19,71,217,114]], escalaCaja: [218,155], modo: 'pezloroGolfo', acciones: ['nado: dos poses', 'mordida', 'pose de descanso'] },
    pintadorCarnaval: { archivo: 'pintador-carnaval-v1/processed-v1', caja: [73,18,109,219], cajas: [[73,18,109,219],[57,18,141,219],[60,18,135,218],[18,20,219,216]], escalaCaja: [219,219], modo: 'pintadorCarnaval', acciones: ['reposo', 'caminar: dos poses', 'lanzamiento de pintura'] },
    pezloro: { archivo: 'pezloro-v1/processed', caja: [19,69,217,117], cajas: [[19,69,217,117],[19,69,217,117],[19,69,217,117],[19,69,217,117]], escalaCaja: [217,117], modo: 'pezloro', acciones: ['nado: dos poses', 'mordida de burbuja', 'deriva cansada'] },
    pintador: { archivo: 'pintador-v1/processed-v2', caja: [45,22,167,212], cajas: [[45,22,167,212],[41,23,178,210],[37,26,187,203],[45,25,166,207]], escalaCaja: [187,212], modo: 'pintador', acciones: ['flotar: dos poses alternadas', 'lanzamiento de pintura', 'dormido o aturdido'] },
    invasor: { archivo: 'invasor-v1/processed-v2', caja: [51,19,154,217], cajas: [[51,19,154,217],[47,18,160,218],[51,18,154,218],[48,19,159,217]], escalaCaja: [160,218], modo: 'invasorForge', acciones: ['marcha: dos poses alternadas', 'salto', 'sueño: reposo'] },
    loro: { archivo: 'loro-v1/processed-v2', caja: [18,61,219,135], cajas: [[18,61,219,135],[18,65,219,125],[18,33,219,189],[18,63,218,130]], escalaCaja: [219,189], modo: 'loroForge', acciones: ['vuelo: cuatro poses de alas', 'picada'] },
    mancha: { archivo: 'mancha-v1/processed-v2', caja: [12,61,234,138], cajas: [[12,61,234,138],[70,17,120,225],[66,15,120,227],[17,50,222,164]], escalaCaja: [234,227], modo: 'manchaForge', acciones: ['reposo', 'trepar', 'bajar', 'pegada: pose comprimida y señal roja'] },
    ollita: { archivo: 'ollita-v1/processed-v2', caja: [18,28,219,199], cajas: [[18,28,219,199],[18,55,219,146],[18,21,219,214],[18,44,219,167]], escalaCaja: [219,214], modo: 'ollitaForge', acciones: ['reposo', 'agacharse antes de saltar', 'salto ascendente', 'aterrizaje'] },
    pirata: { archivo: 'pirata-v1/processed-v1', caja: [59,19,137,218], cajas: [[59,19,137,218],[48,19,160,218],[20,18,217,218],[33,18,190,218]], escalaCaja: [217,218], modo: 'pirataForge', acciones: ['reposo/caminar: dos poses', 'apuntar y arrojar hueso', 'retroceso'] },
    rinoceronte: { archivo: 'rinoceronte-v1/processed-v1', caja: [19,61,218,132], cajas: [[19,61,218,132],[19,64,217,126],[19,64,218,126],[18,82,218,92]], escalaCaja: [218,132], modo: 'rinoceronteForge', acciones: ['caminar: dos poses alternadas', 'aviso agachando el cuerno', 'embestida'] },
    sacapuntas: { archivo: 'sacapuntas-v1/processed-v2', caja: [19,50,217,156], cajas: [[19,50,217,156],[19,62,217,132],[19,54,217,148],[19,50,217,157]], escalaCaja: [217,157], modo: 'sacapuntasForge', acciones: ['manivela: tres posiciones cíclicas', 'carga del disparo de virutas'] },
    silbato: { archivo: 'silbato-v1/processed-v2', caja: [18,67,218,121], cajas: [[18,67,218,121],[18,52,218,150],[19,45,218,166],[19,65,218,126]], escalaCaja: [218,166], modo: 'silbatoForge', acciones: ['vuelo: tres poses de aleteo', 'silbido: pico abierto'] },
    carpintero: { archivo: 'carpintero-v1', caja: [25, 63, 190, 127], modo: 'carpintero', acciones: ['aleteo: dos poses alternadas', 'aviso de picoteo', 'picoteo', 'recuperación'] },
    contramaestre: { archivo: 'contramaestre-v1', caja: [43, 26, 162, 209], cajas: [[67, 31, 139, 205], [52, 31, 136, 191], [71, 25, 131, 201], [42, 33, 151, 193]], modo: 'contramaestre', acciones: ['caminar con tambor: cuatro poses', 'marcar el ritmo con baquetas', 'dormido o aturdido: reposo'] },
    cuadrito: { archivo: 'cuadrito-v1', caja: [41, 63, 178, 125], cajas: [[82, 84, 134, 103], [41, 63, 138, 125], [80, 99, 139, 65], [70, 88, 76, 72]], modo: 'cuadrito', acciones: ['caminar: dos poses', 'brinco', 'aterrizaje', 'dormido o bloque de vidrio'] },
    diablito: { archivo: 'diablito-v2', caja: [42, 33, 170, 183], cajas: [[60, 37, 146, 179], [51, 58, 152, 150], [53, 33, 153, 173], [42, 48, 166, 164]], modo: 'brinco', acciones: ['reposo y agacharse antes del salto', 'impulso ascendente', 'descenso y aterrizaje'] },
    escorpion: { archivo: 'escorpion-v1/atlas-256', hoja: 'atlas.png', caja: [18, 22, 218, 187], cajas: [[20, 51, 220, 158], [18, 22, 218, 187], [19, 57, 216, 151], [18, 45, 223, 169]], modo: 'escorpion', acciones: ['reposo y amenaza: cola elevada', 'aviso breve antes de atacar', 'embestida y picadura'] },
    jabali: { archivo: 'jabali-v1/atlas-256', hoja: 'atlas.png', caja: [15, 46, 222, 160], cajas: [[15, 46, 222, 160], [23, 60, 212, 145], [15, 57, 223, 141], [38, 52, 205, 153]], modo: 'jabali', acciones: ['reposo', 'carrera: dos poses', 'embestida', 'aturdido'] },
    cucu: { archivo: 'cucu-v1/atlas-256', hoja: 'atlas.png', caja: [24, 55, 205, 142], cajas: [[34, 64, 196, 129], [24, 63, 196, 130], [30, 29, 197, 159], [25, 69, 192, 137]], modo: 'cucu', acciones: ['reposo dentro del reloj', 'aviso de salida', 'extensión de alas', 'vuelo de ida y regreso'] },
    guardia: { archivo: 'guardia-v1/atlas-final', hoja: 'atlas.png', caja: [57, 46, 168, 154], cajas: [[71, 46, 115, 172], [66, 58, 122, 159], [57, 46, 168, 154], [60, 44, 121, 159]], modo: 'guardia', acciones: ['reposo: dos poses', 'apuntar: brillo del lanzadardos', 'lanzamiento de dardo', 'volteo lento'] },
    erizoTinta: { archivo: 'erizoTinta-v1/atlas-256', hoja: 'atlas.png', caja: [65, 90, 111, 80], cajas: [[80, 90, 111, 80], [65, 102, 111, 66], [93, 87, 82, 79], [67, 90, 108, 72]], modo: 'erizoTinta', acciones: ['caminar: dos poses alternadas', 'enrollarse', 'recuperarse', 'dormido: pose de imprenta'] },
    incendiario: { archivo: 'incendiario-v1/atlas-256', hoja: 'atlas.png', caja: [28, 40, 199, 182], cajas: [[64, 33, 129, 188], [65, 40, 134, 182], [28, 42, 199, 172], [56, 34, 129, 181]], modo: 'incendiario', acciones: ['reposo: dos poses', 'preparar antorcha', 'lanzar fuego', 'recuperación'] },
    bailarina: { archivo: 'bailarina-v1/processed-v2', hoja: 'sheet-transparent.png', caja: [94, 98, 68, 139], cajas: [[94, 98, 68, 139], [83, 98, 95, 139], [86, 98, 90, 139], [84, 98, 79, 139]], modo: 'bailarina', acciones: ['ciclo de baile: dos poses', 'salto ascendente', 'caída', 'reverencia', 'aturdida: reposo'] },
    bejuco: { archivo: 'bejuco-v1/processed-v3', hoja: 'sheet-transparent.png', caja: [76, 110, 75, 127], cajas: [[76, 110, 75, 127], [68, 101, 103, 136], [52, 98, 136, 139], [72, 134, 79, 103]], modo: 'bejuco', acciones: ['reposo y cierre: dos poses', 'apertura', 'descenso y ataque', 'aturdido', 'cerrado con luz'] },
    catrin: { archivo: 'catrin-v1/processed-v3', hoja: 'sheet-transparent.png', caja: [100, 98, 61, 139], cajas: [[100, 98, 61, 139], [74, 98, 84, 139], [71, 98, 86, 139], [81, 98, 86, 139]], modo: 'catrin', acciones: ['caminar: dos poses', 'preparación y lanzamiento del sombrero', 'recuperación sin sombrero'] },
    charran: { archivo: 'charran-v1/processed', hoja: 'sheet-transparent.png', caja: [59, 196, 139, 41], cajas: [[59, 196, 139, 41], [57, 125, 139, 112], [54, 128, 139, 109], [111, 126, 139, 111]], escalaCaja: [139, 112], modo: 'charran', acciones: ['planeo', 'aleteo: dos poses', 'aviso de amenaza', 'espanto'] },
    cometa: { archivo: 'cometa-v1/processed', hoja: 'sheet-transparent.png', caja: [59, 98, 138, 139], cajas: [[59, 98, 138, 139], [59, 98, 138, 139], [59, 98, 137, 139], [59, 98, 137, 139]], modo: 'cometa', acciones: ['espera fuera de pantalla', 'aviso con estrella', 'paso: dos poses'] },
    cuervo: { archivo: 'cuervo-v1/processed', hoja: 'sheet-transparent.png', caja: [59, 133, 139, 104], cajas: [[59, 133, 139, 104], [75, 183, 139, 54], [76, 151, 139, 86], [54, 163, 139, 74]], escalaCaja: [139, 104], modo: 'cuervo', acciones: ['vuelo: cuatro poses cíclicas', 'desaparecer: conservar el cierre propio del nivel'] },
    cuervoCeniza: { archivo: 'cuervoCeniza-v1/processed', hoja: 'sheet-transparent.png', caja: [59, 146, 138, 91], cajas: [[59, 146, 138, 91], [64, 101, 138, 136], [91, 130, 139, 107], [30, 108, 138, 129]], modo: 'cuervoCeniza', acciones: ['posado', 'aleteo: dos poses', 'vuelo de regreso', 'graznido'] },
    escribano: { archivo: 'escribano-v1/processed', hoja: 'sheet-transparent.png', caja: [94, 130, 85, 108], cajas: [[94, 130, 85, 108], [80, 130, 89, 108], [63, 132, 128, 106], [80, 131, 111, 107]], escalaCaja: [128, 108], modo: 'escribano', acciones: ['caminar: dos poses alternadas', 'pintar el glifo', 'recuperación', 'sueño: pose de reposo'] },
    esporin: { archivo: 'esporin-caminar-v2', hoja: 'sheet-transparent.png', cellSize: 627, caja: [136, 240, 365, 380], cajas: [[136,240,365,380],[136,240,365,380],[136,264,365,355],[136,264,365,355]], escalaCaja: [365,380], modo: 'esporin', acciones: ['caminar: cuatro pasos', 'descarga de esporas'] },
    fantasma: { archivo: 'fantasma-v1/processed', hoja: 'sheet-transparent.png', caja: [64, 102, 129, 137], cajas: [[64, 102, 129, 137], [54, 102, 129, 137], [74, 102, 131, 137], [63, 104, 137, 135]], modo: 'fantasma', acciones: ['flotar/desplazarse: tres poses', 'visible: ojos iluminados', 'dormido: conservar silueta del nivel'] },
    foca: { archivo: 'foca-v1/processed', hoja: 'sheet-transparent.png', caja: [56, 183, 143, 57], cajas: [[56, 183, 143, 57], [60, 155, 142, 85], [70, 163, 143, 77], [81, 155, 142, 85]], escalaCaja: [143, 85], modo: 'foca', acciones: ['sumergida: asomar', 'emerger', 'empujar témpano', 'replegarse'] },
    gargola: { archivo: 'gargola-v1/processed', hoja: 'sheet-transparent.png', caja: [62, 122, 143, 117], cajas: [[62, 122, 143, 117], [54, 117, 143, 122], [36, 97, 141, 142], [94, 132, 143, 108]], modo: 'gargola', acciones: ['posada', 'vuelo de regreso: dos poses', 'picada', 'dormido/vidrio: estado del nivel'] },
    geoda: { archivo: 'geoda-v1/processed', hoja: 'sheet-transparent.png', caja: [63, 102, 143, 137], cajas: [[63, 102, 143, 137], [57, 97, 143, 142], [62, 96, 132, 143], [65, 96, 135, 143]], modo: 'geoda', acciones: ['rodar: dos poses', 'aviso de choque', 'interior de amatista expuesto'] },
    girasol: { archivo: 'girasol-v1/processed', hoja: 'sheet-transparent.png', caja: [94, 99, 68, 140], cajas: [[94, 99, 68, 140], [89, 99, 85, 140], [91, 100, 73, 140], [80, 100, 94, 140]], modo: 'girasol', acciones: ['reposo: dos poses', 'voltear hacia Itzel', 'cargar', 'escupir semilla'] },
    grumo: { archivo: 'grumo-v1/processed', hoja: 'sheet-transparent.png', caja: [70, 159, 118, 81], cajas: [[70, 159, 118, 81], [103, 154, 118, 86], [69, 180, 118, 60], [22, 165, 118, 75]], modo: 'grumo', acciones: ['caminar: dos poses', 'alerta: dos poses', 'salto'] },
    halcon: { archivo: 'halcon-v1/processed', hoja: 'sheet-transparent.png', caja: [81, 182, 98, 55], cajas: [[81, 182, 98, 55], [73, 187, 98, 50], [80, 192, 98, 45], [89, 177, 98, 60]], modo: 'halcon', acciones: ['aleteo: dos poses', 'apuntar: círculo rojo', 'vuelo diagonal'] },
    muneco: { archivo: 'muneco-v1/processed', hoja: 'sheet-transparent.png', caja: [80, 95, 97, 145], cajas: [[80, 95, 97, 145], [89, 95, 98, 145], [92, 96, 112, 145], [82, 96, 94, 145]], modo: 'muneco', acciones: ['reposo', 'aviso y carga', 'lanzamiento', 'recuperación'] },
    guerrero: { archivo: 'guerrero-v1/processed', hoja: 'sheet-transparent.png', caja: [104, 104, 71, 133], cajas: [[104, 104, 71, 133], [106, 104, 79, 133], [19, 116, 133, 121], [71, 104, 108, 133]], escalaCaja: [133, 133], modo: 'guerrero', acciones: ['guardia: dos poses', 'caminar: dos poses', 'escudo activo con resplandor', 'escudo apagado'] },
    goma: { archivo: 'goma-v1/processed', hoja: 'sheet-transparent.png', caja: [84, 151, 111, 89], cajas: [[84, 151, 111, 89], [92, 140, 114, 100], [83, 126, 116, 113], [58, 147, 137, 95]], escalaCaja: [137, 113], modo: 'goma', acciones: ['caminar: dos poses', 'saltar', 'borrar línea'] },
    magma: { archivo: 'magma-v1/processed', hoja: 'sheet-transparent.png', caja: [65, 110, 141, 131], cajas: [[65, 110, 141, 131], [72, 106, 152, 135], [3, 81, 176, 160], [55, 155, 169, 86]], escalaCaja: [170, 154], modo: 'magma', acciones: ['reposo caliente', 'caminar: dos poses', 'recuperación tras daño', 'enfriado de piedra'] },
    mojarra: { archivo: 'mojarra-v1/processed', hoja: 'sheet-transparent.png', caja: [44, 87, 169, 84], cajas: [[44, 87, 169, 84], [60, 52, 137, 150], [45, 70, 165, 115], [48, 75, 161, 106]], escalaCaja: [161, 142], modo: 'mojarra', acciones: ['despegue', 'ascenso', 'cima', 'descenso'] },
  };
  const ataqueAbordador = new Image(); ataqueAbordador.decoding = 'async';
  ataqueAbordador.src = '../Roguelike/assets/forge/enemigos/abordador-ataque-v1/sheet-transparent.png';
  const imagenesForge = {};
  function hojaForge(id) {
    if (!hojasForge[id]) return null;
    if (!imagenesForge[id]) { const img = new Image(); img.decoding = 'async'; img.src = (hojasForge[id].ruta || '../Roguelike/assets/forge/enemigos/') + hojasForge[id].archivo + '/' + (hojasForge[id].hoja || 'sheet-transparent.png'); imagenesForge[id] = img; }
    return imagenesForge[id];
  }
  function pinta(c,e,t,id,im) {
    const box=catalogo[id]?.box || [0, 0, 512, 512], bx=box[0], by=box[1], sw=box[2]-bx, sh=box[3]-by;
    const k=e.escala||1, w=(e.w||12)/k, h=(e.h||10)/k;
    // Respetar la proporción y mantener la ilustración próxima a su colisión.
    const scale=Math.min(w*1.35/sw,h*1.35/sh), dw=sw*scale, dh=sh*scale;
    const air=vuelan.has(id), water=nadan.has(id), idle=quietos.has(id);
    const ph=(e.anim||t||0)*(air?10:water?5:7), pausa=e.quieto||e.st==='sleep'||e.st==='glass'||e.st==='off';
    const hoja = hojaForge(id);
    if (id === 'abordador' && e.ataqueVisual > 0 && !pausa && ataqueAbordador.complete && ataqueAbordador.naturalWidth) {
      const cuadro = Math.min(3, Math.floor(e.ataqueVisual * 4));
      const escala = h * 1.35 / 170, lado = 256 * escala;
      c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(ataqueAbordador, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256,
        -128 * escala, -210 * escala, lado, lado);
      c.restore(); return;
    }
    if (hoja && hoja.complete && hoja.naturalWidth) {
      const config = hojasForge[id];
      const cuadro = e.st === 'sleep' ? (['cuadrito','iguana','escarabajo','perro','perroCeniza','pezloro','pintador'].includes(config.modo) ? 3 : 0) : config.modo === 'monoForge' ? (e.throwT > .2 ? 1 : e.throwT > .1 ? 2 : e.throwT > 0 ? 3 : 0) : config.modo === 'salamandraForge' ? (e.aim > .25 ? 2 : e.aim > 0 ? 3 : Math.floor((e.anim || t || 0) * 6) % 2) : config.modo === 'caminarTortuga' ? (e.st === 'shell' ? 2 : e.st === 'slide' ? 3 : Math.floor((e.anim || t || 0) * 6) % 2) : config.modo === 'pavoForge' ? (e.abre > .5 ? 3 : e.abre > .1 ? 2 : Math.floor((e.anim || t || 0) * 5) % 2) : config.modo === 'toritoForge' ? Math.floor(((e.anim ?? t) * 60) / 8) % (config.cuadros?.length || 4) : config.modo === 'morena' ? (e.fase ? Math.floor((e.ft || 0) * 6) % 4 : 0) : config.modo === 'nadoMedusa' ? Math.floor((e.anim || t || 0) * 5) % 4 : config.modo === 'soploForge'
          ? (e.st === 'sleep' ? 0 : (e.sopla || 0) > .32 ? 1 : (e.sopla || 0) > 0 ? 2 : Math.floor((e.anim || t || 0) * 2) % 2 ? 3 : 0)
        : config.modo === 'toponForge'
          ? (e.st === 'sleep' ? 0 : (e.vy || 0) !== 0 ? 3 : (e.cd || 0) > 0 && MEC.onGround(e) ? 2 : Math.floor((e.anim || t || 0) * 6) % 2)
        : config.modo === 'torretaForge'
          ? (e.st === 'sleep' ? 0 : (e.disparo || 0) > 0 ? 2 : (e.tt || 0) > 0 && e.tt < .25 ? 1 : (e.tt || 0) > 2.1 ? 3 : 0)
        : config.modo === 'buho'
          ? (pausa ? 0 : e.st === 'dive' ? 2 : e.st === 'up' ? 3 : Math.floor((e.anim || 0) * 6) % 2)
        : config.modo === 'escarabajo'
          ? (pausa || e.st === 'stun' || e.st === 'shell' || e.st === 'roll' || (e.curl || 0) > .5 || (e.aturde || 0) > 0 ? 3 : Math.floor((e.anim || t) * 6) % 3)
        : config.modo === 'dron'
        ? (e.st === 'off' ? 3 : e.beam ? 2 : e.warn ? 1 : Math.floor((e.anim || 0) * 8) % 2)
        : config.modo === 'conejo'
          ? (e.aire ? ((e.dvy ?? e.vy ?? 0) < 0 ? 2 : 3) : e.agacha ? 1 : 0)
        : config.modo === 'alux'
          ? ((e.fade ?? 1) < .35 ? 3 : (e.tt || 0) < .3 ? 2 : Math.floor((e.anim || 0) * 5) % 2)
        : config.modo === 'aplastador'
          ? ({ tiembla: 1, cae: 2, abajo: 3, sube: 3 }[e.fase] ?? 0)
        : config.modo === 'bailarin'
          ? (Math.abs(e.vy || 0) > 1 ? (e.vy < 0 ? 2 : 3) : [0, 1, 3][(e.pose || 0) % 3])
        : config.modo === 'bestia'
          ? (e.ruge > 0 ? 1 : e.corre ? 2 : e.calma > 0 ? 3 : 0)
        : config.modo === 'campana'
          ? (e.repica > 0 ? 3 : (e.vy || 0) !== 0 ? 2 : e.cd > 0 && e.cd < .2 ? 1 : 0)
        : config.modo === 'carcoma'
          ? (!e.fuera ? (e.hogar && (e.x < e.hogar.x + 4 || e.x > e.hogar.x + e.hogar.w - 4) ? 1 : 0) : 2 + (Math.floor((e.anim || t) * 8) % 2))
        : config.modo === 'iguana'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : Math.abs(e.vx || 0) > 35 ? 2 : Math.floor((e.anim || t) * 6) % 2)
        : config.modo === 'perro'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : e.mode === 'hunt' ? 2 : Math.floor((e.anim || t) * 6) % 2)
        : config.modo === 'perroCeniza'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 || e.mode === 'hunt' ? 3 : Math.abs(e.vx || 0) > 1 ? 1 + (Math.floor((e.anim || t) * 6) % 2) : 0)
        : config.modo === 'pezloroGolfo'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : e.muerde ? 2 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'pintadorCarnaval'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : (e.lanza || 0) > 0 ? 3 : Math.floor((e.anim || t) * 3) % 3)
        : config.modo === 'pezloro'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : e.muerde ? 2 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'pintador'
          ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : (e.lanza || 0) > 0 ? 2 : Math.floor((e.anim || t) * 3) % 2)
        : config.modo === 'invasorForge'
          ? (pausa || e.st === 'sleep' ? 0 : (e.vy || 0) < -5 ? 3 : [0,1][Math.floor((e.anim || t) * 4) % 2])
        : config.modo === 'loroForge'
          ? (e.st === 'dive' || e.st === 'lunge' ? 3 : [0,1,2,1][Math.floor((e.anim || t) * 9) % 4])
        : config.modo === 'manchaForge'
          ? ((e.pegada || 0) > 0 ? 3 : e.sube > 0 ? 2 : e.sube < 0 ? 1 : 0)
        : config.modo === 'ollitaForge'
          ? ((e.vy || 0) < -20 ? 2 : (e.vy || 0) > 20 ? 3 : e.agacha ? 1 : 0)
        : config.modo === 'pirataForge'
          ? ((e.aturde || 0) > 0 || e.st === 'stun' ? 3 : (e.aim || 0) > 0 ? 2 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'rinoceronteForge'
          ? (e.st === 'stun' ? 0 : e.st === 'run' ? 3 : Math.floor((e.anim || t) * 5) % 3)
        : config.modo === 'sacapuntasForge'
          ? (e.st === 'sleep' ? 0 : e.carga ? 3 : Math.floor(((e.gira || 0) / (Math.PI / 2))) % 3)
        : config.modo === 'silbatoForge'
          ? (e.st === 'sleep' ? 0 : (e.silba || 0) > 0 ? 3 : Math.floor((e.anim || t) * 6) % 3)
        : config.modo === 'gaviota'
          ? (pausa || e.st === 'gone' ? 0 : e.st === 'dive' ? 3 : [0, 1, 2, 1][Math.floor((e.anim || t) * 8) % 4])
        : config.modo === 'hadita'
          ? (pausa ? 0 : e.st === 'dive' || e.ataque > 0 ? 2 : e.st === 'stun' || (e.aturde || 0) > 0 ? 3 : [0, 1, 0, 1][Math.floor((e.anim || t) * 7) % 4])
        : config.modo === 'koi'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : e.st === 'dive' ? 3 : Math.floor((e.anim || t) * 6) % 4)
        : config.modo === 'mecha'
          ? (pausa || e.st === 'stun' ? 0 : e.st === 'run' ? 3 : Math.abs(e.vx || 0) > 1 ? [1, 2][Math.floor((e.anim || t) * 8) % 2] : 0)
        : config.modo === 'carpintero'
          ? (e.pica ? 2 : e.ataca > 0 ? 3 : Math.floor((e.anim || 0) * 6) % 2)
        : config.modo === 'contramaestre'
          ? (pausa || (e.aturdido || 0) > 0 ? 0 : Math.floor((e.anim || t) * 6) % 4)
        : config.modo === 'cuadrito'
          ? (e.st === 'glass' || pausa ? 3 : [0, 1, 2, 1][Math.floor((e.anim || t) * 5) % 4])
        : config.modo === 'erizo'
          ? (pausa ? 0 : Math.floor((e.anim || t) * 4) % 4)
        : config.modo === 'brinco'
          ? (pausa ? 0 : (e.vy || 0) < -20 ? 2 : (e.vy || 0) > 20 ? 3 : (e.tt > 0 && e.tt < .24 ? 1 : Math.floor((e.anim || t) * 5) % 2))
        : config.modo === 'escorpion'
          ? (pausa ? 0 : e.st === 'lunge' ? 2 : (e.tt > 0 && e.tt < .35 ? 3 : Math.floor((e.anim || t) * 3) % 2))
        : config.modo === 'jabali'
          ? (pausa || e.st === 'stun' ? 3 : e.st === 'run' ? (Math.floor((e.anim || t) * 10) % 2 ? 2 : 1) : Math.floor((e.anim || t) * 3) % 2)
        : config.modo === 'cucu'
          ? (e.avisa ? 1 : (e.ext || 0) > .65 ? 2 : (e.ext || 0) > .02 ? 3 : 0)
        : config.modo === 'guardia'
          ? (e.apunta ? 1 : (e.tt ?? 1.5) > 2.02 ? 2 : e.voltea > 0 ? 3 : Math.floor((e.anim || t) * 2) % 2 ? 3 : 0)
        : config.modo === 'erizoTinta'
          ? ((e.curl || 0) > .5 ? 2 : (e.curl || 0) > .2 ? 3 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'incendiario'
          ? (e.st === 'sleep' || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : (e.lanza || 0) > 0 ? 2 : (e.cd || 0) < .35 ? 1 : Math.floor((e.anim || t) * 3) % 2 ? 3 : 0)
        : config.modo === 'bailarina'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : e.reverencia ? 3 : Math.abs(e.vy || 0) > 1 ? (e.vy < 0 ? 1 : 2) : e.ft == null ? 0 : 1 + (Math.floor((e.ft || 0) * 2) % 2))
        : config.modo === 'bejuco'
          ? (pausa ? 0 : e.st === 'stun' ? 3 : e.baja ? 2 : e.luz ? 0 : Math.floor((e.anim || t) * 3) % 2 ? 1 : 0)
        : config.modo === 'catrin'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : (e.lanza || 0) > 0 || (e.conSombrero && (e.cd ?? 1) <= .15) ? 2 : e.conSombrero === false ? 3 : Math.abs(e.vy || 0) > 1 ? 1 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'charran'
          ? (pausa ? 0 : (e.espanto || 0) > 0 ? 2 : (e.amenaza || 0) > 0 ? 3 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'cometa'
          ? (pausa ? 0 : e.avisa ? 1 : e.pasa ? 2 + (Math.floor((e.ct || t) * 8) % 2) : 0)
        : config.modo === 'culebra'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : Math.floor((e.anim || t) * 7) % 4)
        : config.modo === 'cuervo'
          ? (pausa ? 0 : Math.floor((e.anim || t) * 8) % 4)
        : config.modo === 'cuervoCeniza'
          ? (pausa ? 0 : (e.grazna || 0) > 0 ? 3 : e.vuela > 0 ? 1 + (Math.floor((e.anim || t) * 10) % 2) : e.vuelve ? 1 : 0)
        : config.modo === 'escribano'
          ? (pausa ? 0 : (e.pinta || 0) > .45 ? 2 : (e.pinta || 0) > 0 ? 3 : Math.abs(e.vx || 0) > .1 ? (Math.floor((e.anim || t) * 6) % 2 ? 1 : 0) : 0)
        : config.modo === 'esporin'
          ? (pausa ? 0 : Math.floor((e.anim || t) * 6) % 4)
        : config.modo === 'fantasma'
          ? (pausa ? 0 : e.visible ? 3 : Math.floor((e.anim || t) * 6) % 3)
        : config.modo === 'foca'
          ? (pausa ? 0 : (e.fuera || 0) > .72 ? 0 : (e.fuera || 0) > .48 ? 1 : (e.fuera || 0) > .18 ? 2 : (e.fuera || 0) > 0 ? 3 : 0)
        : config.modo === 'gargola'
          ? (pausa ? 0 : e.fase === 'baja' ? 3 : e.fase === 'sube' ? 1 + (Math.floor((e.anim || t) * 8) % 2) : 0)
        : config.modo === 'geoda'
          ? (pausa ? 0 : (e.choque || 0) > 0 ? 2 + (Math.floor((e.anim || t) * 12) % 2) : Math.floor(Math.abs(e.giro || 0) * 2) % 2)
        : config.modo === 'girasol'
          ? (pausa ? 0 : (e.carga || 0) > .65 ? 2 : (e.tt || 0) > 2.4 ? 3 : (e.carga || 0) > .05 ? 1 : Math.floor((e.anim || t) * 2) % 2)
        : config.modo === 'libelula'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 || (e._golpe || 0) > .25 ? 0 : e.to && Math.hypot(e.to[0] - e.x, e.to[1] - e.y) > 8 ? 2 + (Math.floor((e.anim || t) * 12) % 2) : Math.floor((e.anim || t) * 3) % 2)
        : config.modo === 'hormiga'
          ? (pausa || e.st === 'stun' ? 0 : Math.floor((e.anim || t) * 7) % 4)
        : config.modo === 'grumo'
          ? (pausa ? 0 : Math.abs(e.vy || 0) > 1 ? 3 : e.alert ? ((e.alertT || 0) < .45 ? 2 : 1) : Math.abs(e.vx || 0) > 1 ? 1 : 0)
        : config.modo === 'halcon'
          ? (pausa ? 0 : e.apunta ? 3 : (e.vx2 || e.vy2) ? 2 : Math.floor((e.anim || t) * 8) % 2)
        : config.modo === 'murcielago'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : Math.floor((e.anim || t) * 8) % 4)
        : config.modo === 'muneco'
          ? (pausa || e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : e.carga ? 1 : (e.tt || 0) > 2.3 ? 2 : (e.tt || 0) > 2 ? 3 : 0)
        : config.modo === 'guerrero'
          ? (pausa ? 0 : !e.escudo ? 3 : Math.abs(e.vx || 0) > 1 ? 1 + (Math.floor((e.anim || t) * 6) % 2) : Math.floor((e.anim || t) * 3) % 2 ? 2 : 0)
        : config.modo === 'goma'
          ? (pausa ? 0 : e.borra ? 3 : Math.abs(e.vy || 0) > 20 ? 2 : Math.floor((e.anim || t) * 5) % 2)
        : config.modo === 'magma'
          ? (e.piedra || e.st === 'glass' ? 3 : e.st === 'stun' ? 2 : Math.floor((e.anim || t) * 4) % 2)
        : config.modo === 'mojarra'
          ? ((e.vy || 0) < -300 ? 0 : (e.vy || 0) < -20 ? 1 : (e.vy || 0) < 150 ? 2 : 3)
        : pausa ? 0 : config.modo === 'salto'
        ? ((e.vy || 0) < -20 ? 2 : (e.vy || 0) > 20 ? 3 : (e.tt > 0 && e.tt < .2 ? 1 : 0))
        : config.modo === 'embestida'
          ? (e.st === 'lunge' ? Math.min(2, 1 + Math.floor(Math.max(0, .25 - (e.tt || 0)) / .0834)) : (e.tt > 0 && e.tt < .2 ? 3 : 0))
          : config.modo === 'swoop'
            ? (e.st === 'dive' ? 2 : e.st === 'up' ? 3 : Math.floor((e.anim || 0) * 8) % 2)
            : config.modo === 'icicle'
              ? (e.ic === 'shake' ? 1 : e.ic === 'fall' ? 2 : e.ic === 'regrow' ? 3 : 0)
            : config.modo === 'puffer'
              ? ((e.puff || 0) <= 0 ? 0 : (e.puff || 0) > .5 ? 2 : (e.puffPrev ?? e.puff) > e.puff ? 3 : 1)
            : config.modo === 'pulse'
              ? (e.late > .14 ? 2 : e.late > 0 ? 1 : Math.floor((e.anim || 0) * 8) % 4)
            : config.modo === 'descenso'
              ? (e.baja ? ((e.len || 0) > 12 ? 3 : 2) : Math.floor((e.anim || t) * 7) % 2)
              : config.modo === 'lanzamiento'
                ? (!(e.tiro > 0) ? 0 : e.tiro > .23 ? 1 : e.tiro > .11 ? 2 : 3)
                : config.modo === 'vuelo'
                  ? Math.floor((e.anim || 0) * 10) % 4
                  : config.modo === 'centinela'
                    ? (e.lanza > 0 ? 3 : Math.floor((e.anim || 0) * 6) % 3)
                    : config.modo === 'nauyaca'
                      ? (e.st === 'stun' || (e.aturde || 0) > 0 ? 0 : e.aviso > 0 ? 1 : e.ext > .65 ? 2 : e.ext > .05 ? 3 : 0)
            : Math.floor((e.anim || 0) * 8) % 4;
      const frameHoja = config.cuadros?.[cuadro] ?? cuadro;
      const recorte = config.cajas?.[frameHoja] || config.caja;
      // La hoja puede tener más transparencia que el arte original. Ajusta
      // el tamaño visible al recorte real y al hitbox, sin tocar la colisión.
      const escalaCaja = config.escalaCaja || [recorte[2], recorte[3]];
      const fit = Math.min(w * 1.35 / escalaCaja[0], h * 1.35 / escalaCaja[1]);
      const fw = recorte[2] * fit * (config.escalaArte || 1), fh = recorte[3] * fit * (config.escalaArte || 1);
      c.save(); if (config.modo === 'alux') c.globalAlpha *= e.fade ?? 1; if (id === 'fantasma') c.globalAlpha *= .22 + Math.max(0, Math.min(1, e.vis || 0)) * .7; if (id === 'bailarina') c.scale(Math.abs(Math.cos(e.giro || 0)) * .7 + .3, 1); if (id === 'bejuco') c.rotate(Math.sin(t * 3 + (e.hx || 0)) * .2); if (config.modo === 'icicle') { c.translate(e.jit || 0, 0); if (e.ic === 'regrow') { const grow = Math.max(0, Math.min(1, e.grow || 0)); c.translate(0, fh * .314 * grow); c.scale(grow * 1.3, grow * 1.5); } } if (config.escalaX || config.escalaY) c.scale(config.escalaX || 1, config.escalaY || 1); if (config.modo === 'geoda') { c.translate(0, -fh / 2); c.rotate(e.giro || 0); const ch = e.choque > 0 ? 1.15 : 1; c.scale(ch, 2 - ch); } if (config.modo === 'mojarra') { c.translate(0, -fh / 2); c.rotate(Math.atan2(e.vy || 0, Math.abs(e.vx || 0) + 1) * .4); c.translate(0, fh / 2); } if (!sinGiro.has(id)) c.scale(-1,1); c.imageSmoothingEnabled = id !== 'cuadrito';
      const celda = config.cellSize || 256;
      const sx = config.layout === 'row' ? frameHoja * config.cellWidth + recorte[0] : (frameHoja % 2) * celda + recorte[0], sy = config.layout === 'row' ? recorte[1] : Math.floor(frameHoja / 2) * celda + recorte[1];
      if (id === 'esporin' && e.infla > 0) c.scale(1 + Math.min(e.infla, .4) * .3, 1 + Math.min(e.infla, .4) * .2);
      // Dos cuadros del escribano tienen una línea de borde junto a las orejas.
      // Conserva las puntas de las orejas sin dibujar el resto de esa línea.
      if (id === 'escribano' && frameHoja >= 2) {
        const [izq, der] = frameHoja === 2 ? [114, 149] : [124, 139];
        c.save(); c.beginPath();
        c.rect(-fw / 2, -fh + 2 * fh / recorte[3], fw, fh);
        c.rect(-fw / 2 + (izq - recorte[0]) * fw / recorte[2], -fh, (der - izq) * fw / recorte[2], 2 * fh / recorte[3]);
        c.clip();
        c.drawImage(hoja, sx, sy, recorte[2], recorte[3], -fw / 2, -fh, fw, fh);
        c.restore();
      } else if (id === 'charran') {
        // El cuerpo ocupa posiciones distintas en cada celda: mantener su
        // centro fijo evita saltos al cambiar de aleteo o iniciar la picada.
        const ancla = [[125, 216], [125, 216], [117, 144], [168, 212]][frameHoja] || [125, 216];
        const escala = fit * (config.escalaArte || 1);
        c.drawImage(hoja, sx, sy, recorte[2], recorte[3], -(ancla[0] - recorte[0]) * escala, -5 - (ancla[1] - recorte[1]) * escala, fw, fh);
      } else c.drawImage(hoja, sx, sy, recorte[2], recorte[3], -fw/2, config.modo === 'geoda' ? -fh/2 : -fh, fw, fh);
      if (id === 'charran' && e.amenaza > 0) { c.save(); c.fillStyle = '#c8203a'; c.beginPath(); c.arc(0, -16, 3.5, 0, TAU); c.fill(); c.fillStyle = '#fff8df'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('!', 0, -14); c.restore(); }
      if (id === 'sacapuntas' && e.carga) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,211,107,${.45 + Math.sin(t * 30) * .12})`; c.beginPath(); c.arc(6, -6, 3, 0, Math.PI * 2); c.fill(); c.restore(); }
      if (id === 'halcon' && e.apunta) { c.save(); c.strokeStyle = '#f83800'; c.lineWidth = .5; c.beginPath(); c.arc(0, -4.6, 7 + Math.sin(t * 20), 0, TAU); c.stroke(); c.restore(); }
      // (quitado el círculo brillante del escudo del guerrero, a pedido de David)
      if (id === 'guardia' && e.apunta) { c.save(); c.scale(-1, 1); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,205,82,${.65 + Math.sin(t * 30) * .25})`; c.beginPath(); c.arc(10.4, -11.2, 2.2 + Math.sin(t * 30) * .35, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,244,190,.9)'; c.lineWidth = .45; c.beginPath(); c.moveTo(7.7, -11.2); c.lineTo(13.1, -11.2); c.moveTo(10.4, -13.9); c.lineTo(10.4, -8.5); c.stroke(); c.restore(); }
      if (id === 'nauyaca' && e.aviso > 0) { const v = Math.sin(t * 60) * .6; c.save(); c.fillStyle = '#d8c890'; for (let j = 0; j < 3; j++) { c.beginPath(); c.ellipse(-7.4 - j * 1.2 + v, -2 - j * .6, .8, .6, 0, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 4px "Alegreya Sans", sans-serif'; c.fillText('tsss', -11, -7); c.restore(); }
      c.restore(); return;
    }
    const amp=pausa?0:(air?.027:water?.018:idle?.006:.012);
    c.save();
    // Los originales de perfil miran hacia la izquierda; el motor dibuja
    // sus enemigos hacia la derecha antes de reflejarlos según e.dir.
    if(!sinGiro.has(id)) c.scale(-1,1);
    if(id==='fantasma') c.globalAlpha*=.22+Math.max(0,Math.min(1,e.vis||0))*.7;
    if(id==='pavo' && e.abre>0) c.scale(1+Math.min(1,e.abre)*.22,1);
    if(id==='botete' && e.puff>0) c.scale(1+Math.min(1,e.puff)*.12,1+Math.min(1,e.puff)*.12);
    c.imageSmoothingEnabled=true;
    const n=12;
    // Franjas contiguas sin capas duplicadas: el movimiento sigue una curva
    // suave y evita dibujar dos veces las alas, patas o la cola.
    for(let i=0;i<n;i++) {
      const y0=Math.round(sh*i/n), y1=Math.round(sh*(i+1)/n), u=(i+.5)/n;
      const mov=Math.sin(ph+u*3.2)*(air ? (1-u)*(1-u) : water ? u*(1-u) : u*u)*dw*amp;
      const sy=by+y0, dh1=(y1-y0)*scale;
      c.drawImage(im,bx,sy,sw,y1-y0,-dw/2+mov,-dh+y0*scale,dw,dh1+.015);
    }
    c.restore();
  }
  for(const id of new Set([...Object.keys(catalogo), ...Object.keys(hojasForge)])) {
    const anterior=dibujos[id]; if(typeof anterior!=='function') continue;
    function ilustracion(c,e,t,s) {
      // Los subjefes comparten el tipo del enemigo, pero conservan su arte original.
      if (e.sub) return anterior(c,e,t,s);
      // El torito solo usa la carrera Forge durante desplazamiento; quieto conserva su arte base.
      if (id === 'torito' && e.st !== 'run' && Math.abs(e.vx || 0) <= 1) return anterior(c,e,t,s);
      // La araña tiene seis cuadros de muerte; la hoja de caminar no debe borrar ese cierre.
      if (id === 'arana' && e.st === 'gone') return anterior(c,e,t,s);
      // El búho conserva la pose dormida del nivel y fija sus alas mientras duerme.
      if (id === 'buho' && e.st === 'sleep') return anterior(c,{...e,anim:1e-6,quieto:true},t,s);
      if (id === 'rinoceronte' && ['eco', 'miniatura'].includes(window.CUR?.def?.id)) return anterior(c,e,t,s);
      // La hoja del cocuyo solo cubre el aleteo; conservar el posado sin movimiento.
      if (id === 'cocuyo' && (e.st === 'sleep' || e.st === 'stun' || (e.aturde || 0) > 0)) return anterior(c,{...e,anim:0},t,s);
      const im=recurso(id);
      const hoja = hojaForge(id);
      // Mantener las señales de colisión de las conchas y las espinas.
      if ((id==='oruga' && e.trepa) || (id==='mojarra' && !e.nada) || ((!im?.complete || !im?.naturalWidth) && !(hoja && hoja.complete && hoja.naturalWidth)) || (id==='tortuga' && (e.st==='shell'||e.st==='slide') && !(hoja && hoja.complete && hoja.naturalWidth)) || (id==='erizo' && e.curl>0) || (id==='incendiario' && e.st==='sleep') || (id==='jabali' && e.st==='gone') || (id==='cangrejo' && e.st==='sleep') || ((id==='girasol'||id==='goma'||id==='grumo') && e.st==='sleep') || (id==='culebra' && (e.st==='lunge'||e.st==='gone'||e.st==='stun'||(e.aturde||0)>0||(e.tt>.3&&e.st==='ok'))) || (id==='chapulin' && window.CAMPECHE_UNO?.activo?.()) || ((id==='conejo' || id==='cometa') && e.st==='sleep')) return anterior(c,e,t,s);
      pinta(c,e,t,id,im);
    }
    ilustracion._assetNuevo=true;
    ilustracion._assetListo=()=>{const im=recurso(id), hoja=hojaForge(id);return !!((hoja&&hoja.complete&&hoja.naturalWidth)||(im&&im.complete&&im.naturalWidth));};
    dibujos[id]=ilustracion;
  }
  window.ENEMIGOS_ASSETS={catalogo, recurso, hojasForge, hojaForge, pinta};
})();
