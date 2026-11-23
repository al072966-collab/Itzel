'use strict';
// Datos comprobados y agrupados por el lugar o tema del nivel. Las fuentes
// viajan con cada dato para poder consultarlas desde la pantalla de pausa.
const DATOS_CAMPECHE = (() => {
  const U = {
    muralla: 'https://whc.unesco.org/en/list/895',
    astillero: 'https://revistas.inah.gob.mx/index.php/antropologia/article/download/4988/5014',
    edzna: 'https://lugares.inah.gob.mx/es/node/4339',
    calakmul: 'https://whc.unesco.org/en/list/1061',
    chicanna: 'https://www.inah.gob.mx/zonas/zona-arqueologica-chicanna',
    chenes: 'https://lugares.inah.gob.mx/es/node/4457',
    aluxes: 'https://www.revistas.inah.gob.mx/index.php/cuicuilco/article/download/20595/22035/43500',
    cavernas: 'https://lugares.inah.gob.mx/images/exposiciones/catalogos/Catalogo_928.pdf',
    laguna: 'https://simec.conanp.gob.mx/informacion/ficha/118',
    manglar: 'https://conanp.gob.mx/conanp/dominios/lagunadeterminos/cuerpo%20biodiversidad.htm',
    petenes: 'https://conanp.gob.mx/conanp/dominios/petenes/index.php',
    gastronomia: 'https://sic.cultura.gob.mx/ficha.php?table=gastronomia&table_id=17',
    cazon: 'https://www.gob.mx/conapesca/articulos/cazon-pescado-de-buen-sazon?idiom=es',
    textil: 'https://sic.cultura.gob.mx/ficha.php?disciplina=&table=artepmex&table_id=14',
    jipi: 'https://sic.cultura.gob.mx/ficha.php?table=frpintangible&table_id=117',
    uayamon: 'https://www.cultura.gob.mx/turismocultural/guias/pdf/guia_campeche.pdf',
    tren: 'https://www.semabicce.campeche.gob.mx/wp-content/uploads/2024/08/POEL-DZITBALCHE.pdf',
    muertos: 'https://autoridaddelpatrimoniocultural.campeche.gob.mx/?page_id=6939',
    pomuch: 'https://ucs.campeche.gob.mx/prepara-apcec-mejoramiento-de-la-imagen-urbana-de-pomuch/',
    catedral: 'https://lugares.inah.gob.mx/es/pagina-de-elemento/3196',
    carnaval: 'https://revistas.inah.gob.mx/plugins/generic/pdfJsViewer/pdf.js/web/viewer.html?file=https%3A%2F%2Frevistas.inah.gob.mx%2Findex.php%2Fglifos%2Farticle%2Fdownload%2F22940%2F24417%2F50209',
    musica: 'https://indefos.gob.mx/portal/campeche/',
    volcan: 'https://tesiunamdocumentos.dgb.unam.mx/ptd2018/abril/0772393/0772393.pdf',
    xtampak: 'https://lugares.inah.gob.mx/es/node/4457',
    conanp: 'https://conanp.gob.mx/conanp/dominios/regiongolfo/lagunaterminos.php',
    cenotes: 'https://cicy.repositorioinstitucional.mx/jspui/bitstream/1003/2577/1/2020-03-12-Eliana-Noguera-Los-cenotes.pdf',
    arcas: 'https://digaohm.semar.gob.mx/cuestionarios/cnarioCayoarcas.pdf',
    arrecifes: 'https://www.conanp.gob.mx/que_hacemos/riq_natural.php',
    tinte: 'https://sistemas.sectur.gob.mx/dgots/---14-guias-turismo/palizada-campeche.pdf',
    palizada: 'https://indefos.gob.mx/portal/palizada/',
    calle59: 'https://www.gob.mx/cultura/prensa/festival-de-jazz-de-campeche-vuelve-con-nuevos-brios',
  };
  const f = (texto, clave, fuente) => ({ texto, url: U[clave], fuente });
  const grupos = {
    muralla: [
      f('La muralla de Campeche formaba un hexágono irregular alrededor de la ciudad.', 'muralla', 'UNESCO'),
      f('El recinto amurallado tuvo ocho baluartes y cuatro puertas.', 'muralla', 'UNESCO'),
      f('Las obras de la nueva muralla comenzaron en 1686 y terminaron en 1704.', 'muralla', 'UNESCO'),
      f('San Miguel y San José el Alto complementaron las defensas desde los cerros.', 'muralla', 'UNESCO'),
    ],
    centro: [
      f('El centro histórico de Campeche conserva un trazado de calles en forma de cuadrícula.', 'muralla', 'UNESCO'),
      f('La ciudad fortificada de Campeche forma parte del Patrimonio Mundial desde 1999.', 'muralla', 'UNESCO'),
      f('La plaza principal estaba rodeada de edificios de gobierno y religiosos.', 'muralla', 'UNESCO'),
      f('El Teatro Toro y la catedral forman parte del conjunto histórico de Campeche.', 'muralla', 'UNESCO'),
    ],
    catedral: [
      f('La primera iglesia parroquial de Campeche se dedicó a la Purísima Concepción.', 'catedral', 'INAH'),
      f('Una de las torres de la catedral se conoce como La Española.', 'catedral', 'INAH'),
      f('En esa torre se colocó el primer reloj público de la ciudad.', 'catedral', 'INAH'),
      f('La catedral forma parte del centro histórico fortificado de Campeche.', 'muralla', 'UNESCO'),
    ],
    astillero: [
      f('En los astilleros campechanos trabajaban carpinteros de ribera que construían barcos.', 'astillero', 'INAH'),
      f('Entre los navíos construidos en Campeche estuvieron La Guadalupe, El Blandón y El Victorioso.', 'astillero', 'INAH'),
      f('En el puerto trabajaban capitanes, contramaestres y especialistas en velas.', 'astillero', 'INAH'),
      f('El puerto de Campeche fue parte de rutas marítimas que lo conectaban con La Habana y Veracruz.', 'muralla', 'UNESCO'),
    ],
    edzna: [
      f('En Edzná se construyeron canales y depósitos para aprovechar el agua de lluvia.', 'edzna', 'INAH'),
      f('El Edificio de los Cinco Pisos tiene cuartos abovedados en sus niveles visibles.', 'edzna', 'INAH'),
      f('Los mascarones de Edzná representan al Sol en el amanecer y en el ocaso.', 'edzna', 'INAH'),
      f('La antigua ciudad de Edzná tiene una Gran Acrópolis y un juego de pelota.', 'edzna', 'INAH'),
    ],
    calakmul: [
      f('La antigua ciudad maya de Calakmul se encuentra en medio de una selva tropical protegida.', 'calakmul', 'UNESCO'),
      f('La selva de Calakmul es hábitat de jaguares y pumas.', 'calakmul', 'UNESCO'),
      f('En la región de Calakmul se han encontrado caminos mayas llamados sacbés.', 'calakmul', 'UNESCO'),
      f('La ciudad y los bosques protegidos de Calakmul son Patrimonio Mundial cultural y natural.', 'calakmul', 'UNESCO'),
    ],
    riobec: [
      f('En Chicanná hay fachadas decoradas con grandes mascarones del Monstruo de la Tierra.', 'chicanna', 'INAH'),
      f('Chicanná está cerca de Becán, otra antigua ciudad maya de Campeche.', 'chicanna', 'INAH'),
      f('La arquitectura Río Bec se reconoce, entre otros rasgos, por sus torres gemelas decorativas.', 'calakmul', 'UNESCO'),
      f('La región de Río Bec conserva fachadas adornadas con mosaicos de piedra.', 'calakmul', 'UNESCO'),
    ],
    chenes: [
      f('Santa Rosa Xtampak fue una ciudad maya importante del noreste de Campeche.', 'chenes', 'INAH'),
      f('En la región de los Chenes hay edificios con grandes mascarones en sus fachadas.', 'xtampak', 'INAH'),
      f('En Santa Rosa Xtampak hay ejemplos que combinan rasgos arquitectónicos Chenes y Puuc.', 'xtampak', 'INAH'),
      f('En Santa Rosa Xtampak se conserva un chultún: un depósito subterráneo para agua de lluvia.', 'xtampak', 'INAH'),
    ],
    aluxes: [
      f('En la tradición oral de Campeche, los aluxes son seres relacionados con la milpa y el monte.', 'aluxes', 'INAH'),
      f('Algunas leyendas campechanas cuentan que los aluxes cuidan las milpas.', 'aluxes', 'INAH'),
      f('Según algunas narraciones, los aluxes fueron modelados con barro.', 'aluxes', 'INAH'),
      f('En relatos mayas, los aluxes también se relacionan con la lluvia y la fertilidad de la tierra.', 'aluxes', 'INAH'),
    ],
    cuevas: [
      f('En la región del Puuc, algunas comunidades obtenían agua de grutas profundas.', 'cavernas', 'INAH'),
      f('John Lloyd Stephens describió la extracción de agua en grutas como la de Bolonchén.', 'cavernas', 'INAH'),
      f('Para los antiguos mayas, algunas cuevas tenían un significado sagrado.', 'cavernas', 'INAH'),
      f('En la región cercana se encuentra Santa Rosa Xtampak, una antigua ciudad maya de los Chenes.', 'xtampak', 'INAH'),
    ],
    costa: [
      f('La Laguna de Términos es un área natural protegida en la costa de Campeche.', 'laguna', 'CONANP'),
      f('En la Laguna de Términos hay manglares y praderas de pastos marinos.', 'conanp', 'CONANP'),
      f('Los manglares ofrecen alimento y refugio a peces, moluscos, aves y otras especies.', 'manglar', 'CONANP'),
      f('En el área protegida de la Laguna de Términos se ha registrado al manatí.', 'conanp', 'CONANP'),
    ],
    cenotes: [
      f('En el ejido Miguel Colorado, Champotón, se encuentran el Cenote Azul y Los Patos.', 'cenotes', 'Centro de Investigación Científica de Yucatán'),
      f('El Cenote Azul y Los Patos son cenotes abiertos, rodeados de vegetación.', 'cenotes', 'Centro de Investigación Científica de Yucatán'),
      f('La vegetación alrededor de los cenotes ofrece hábitat a la fauna silvestre.', 'cenotes', 'Centro de Investigación Científica de Yucatán'),
      f('Los cenotes de Miguel Colorado forman parte de un entorno de selva campechana.', 'cenotes', 'Centro de Investigación Científica de Yucatán'),
    ],
    arcas: [
      f('Cayo Arcas es un conjunto de tres pequeños cayos frente a Campeche.', 'arcas', 'Secretaría de Marina'),
      f('Cayo Arcas forma parte de una zona de arrecifes del Golfo de México.', 'arrecifes', 'CONANP'),
      f('Los arrecifes albergan una gran variedad de formas de vida marina.', 'arrecifes', 'CONANP'),
      f('En la costa de Campeche también existen manglares y praderas de pastos marinos.', 'conanp', 'CONANP'),
    ],
    tinte: [
      f('El palo de tinte también se conoce como palo de Campeche.', 'tinte', 'Secretaría de Turismo'),
      f('La madera del palo de tinte se aprovechaba para teñir telas.', 'tinte', 'Secretaría de Turismo'),
      f('Desde la zona de Palizada se transportaba palo de tinte por el río hacia el puerto del Carmen.', 'palizada', 'INDEFOS'),
      f('El palo de tinte crece en la región de la Laguna de Términos.', 'laguna', 'CONANP'),
    ],
    calle59: [
      f('La Calle 59 une la Puerta de Tierra con la Puerta de Mar en el centro histórico.', 'calle59', 'Secretaría de Cultura'),
      f('El centro histórico de Campeche tiene un trazado de calles en cuadrícula.', 'muralla', 'UNESCO'),
      f('Campeche conserva parte de sus antiguas murallas y su sistema de fortificaciones.', 'muralla', 'UNESCO'),
      f('El centro histórico fortificado de Campeche es Patrimonio Mundial.', 'muralla', 'UNESCO'),
    ],
    petenes: [
      f('Los petenes son islas de vegetación que se encuentran en la costa de Campeche.', 'petenes', 'CONANP'),
      f('Además de la península de Yucatán, existen petenes en Cuba y Florida.', 'petenes', 'CONANP'),
      f('La Reserva de la Biosfera Los Petenes también protege pastos marinos.', 'petenes', 'CONANP'),
      f('Los manglares pueden servir de refugio para aves y animales acuáticos.', 'manglar', 'CONANP'),
    ],
    comida: [
      f('El pan de cazón se prepara con tortillas de maíz, frijol, cazón y salsa de tomate.', 'cazon', 'CONAPESCA'),
      f('Aunque se llama pan de cazón, este platillo se arma con tortillas.', 'cazon', 'CONAPESCA'),
      f('Entre los platillos campechanos están los camarones al coco y el pámpano en escabeche.', 'gastronomia', 'Secretaría de Cultura'),
      f('En Champotón se prepara arroz con ostiones como parte de la cocina regional.', 'gastronomia', 'Secretaría de Cultura'),
    ],
    artes: [
      f('En Campeche se elaboran hipiles y otras prendas con bordados de flores y colores.', 'textil', 'Secretaría de Cultura'),
      f('En Bécal, las familias artesanas tejen sombreros con fibra de jipi.', 'jipi', 'Secretaría de Cultura'),
      f('La humedad de las cuevas ayuda a que la fibra de jipi sea más fácil de trabajar.', 'jipi', 'Secretaría de Cultura'),
      f('Con jipi también se hacen abanicos, canastos y otras piezas tejidas.', 'jipi', 'Secretaría de Cultura'),
    ],
    hacienda: [
      f('La hacienda Uayamón fue una estancia ganadera antes de diversificar su producción.', 'uayamon', 'Secretaría de Cultura'),
      f('En Uayamón se produjeron cultivos como caña de azúcar, henequén y maíz.', 'uayamon', 'Secretaría de Cultura'),
      f('Una vía del Ferrocarril Campechano unió Chiná con la hacienda Uayamón.', 'tren', 'Gobierno de Campeche'),
      f('El proyecto ferroviario que conectó Uayamón con Chiná llegó hasta allí en 1908.', 'tren', 'Gobierno de Campeche'),
    ],
    muertos: [
      f('En el Hanal Pixán se preparan ofrendas para recordar a familiares y amigos fallecidos.', 'muertos', 'Autoridad del Patrimonio Cultural de Campeche'),
      f('El pibipollo es un tamal grande que se prepara para las celebraciones de Hanal Pixán.', 'muertos', 'Autoridad del Patrimonio Cultural de Campeche'),
      f('En las ofrendas pueden colocarse fotografías, bebidas y comidas preferidas de los familiares.', 'muertos', 'Autoridad del Patrimonio Cultural de Campeche'),
      f('En Pomuch se conserva el Choo Baak, una tradición de cuidado de los restos de familiares.', 'pomuch', 'Gobierno de Campeche'),
    ],
    fiesta: [
      f('La jarana es música y baile tradicional presente en fiestas de Campeche.', 'musica', 'INDEFOS'),
      f('Durante el carnaval de Campeche se organizan comparsas, desfiles, bailes y conciertos.', 'carnaval', 'INAH'),
      f('En algunas poblaciones, las comparsas de carnaval bailan de casa en casa.', 'carnaval', 'INAH'),
      f('En las fiestas de Campeche también se preparan comidas y artesanías regionales.', 'musica', 'INDEFOS'),
    ],
    ceniza: [
      f('El Chichón o Chichonal está en Chiapas, no en Campeche.', 'volcan', 'UNAM'),
      f('La erupción del Chichón ocurrió en 1982 y produjo una extensa nube de ceniza.', 'volcan', 'UNAM'),
      f('La ceniza de esa erupción llegó a Campeche y otras partes de la península.', 'volcan', 'UNAM'),
      f('El nivel imagina el paisaje de Campeche bajo la ceniza; el volcán está en Chiapas.', 'volcan', 'UNAM'),
    ],
  };
  // Los niveles de fantasía reciben datos reales de su lugar o región, sin
  // presentar sus mecánicas imaginarias como hechos históricos.
  const niveles = {
    pixel:'muralla', ocaso:'costa', acuarela:'cenotes', paper:'calle59', biolum:'petenes', flat:'costa', sumie:'tinte', neon:'muralla',
    bruma:'aluxes', lowpoly:'cuevas', codex:'edzna', oleo:'muralla', vitral:'catedral', cuaderno:'chenes', grabado:'astillero',
    anime:'centro', nouveau:'centro', deco:'centro', cyber:'costa', cinema:'riobec', barro:'artes',
    eco:'muralla', fuego:'muralla', agua:'arcas', hielo:'centro', cielo:'edzna', hollin:'ceniza', bits8:'centro', bits32:'muralla', bits64:'calakmul',
    templo:'muralla', vuelo:'edzna', cocina:'comida', imprenta:'centro', posadas:'centro', animas:'muertos', carnaval:'fiesta', desfile:'fiesta', feria:'centro',
    jarana:'fiesta', pesca:'costa', planos:'muralla', bordado:'artes', cabeza:'costa', torres:'catedral',
    chicanna:'riobec', abordaje:'astillero', miniatura:'calakmul', uayamon_selva:'hacienda', uayamon_taller:'hacienda',
  };
  const jefes = { mythos:'calakmul', golem:'edzna', serpiente:'riobec', jaguar:'calakmul', hadas:'chenes', cocodrilo:'costa', pirata:'astillero', chaac:'chenes', camazotz:'calakmul', abeja:'petenes', ruptura:'edzna' };
  const memoria = Object.create(null), CLAVE = 'itzel-datos-curiosos-v1';
  let guardado = {};
  try { const v = JSON.parse(localStorage.getItem(CLAVE) || '{}'); if (v && typeof v === 'object' && !Array.isArray(v)) guardado = v; } catch (_) {}
  function para(id, jefe = false) { return grupos[(jefe ? jefes : niveles)[id] || 'centro']; }
  function siguiente(id, jefe = false) {
    const lista = para(id, jefe), llave = (jefe ? 'jefe:' : 'nivel:') + id;
    const n = Number.isSafeInteger(guardado[llave]) && guardado[llave] >= 0 ? guardado[llave] : (memoria[llave] || 0);
    const dato = lista[n % lista.length]; memoria[llave] = guardado[llave] = (n + 1) % lista.length;
    try { localStorage.setItem(CLAVE, JSON.stringify(guardado)); } catch (_) {}
    return dato;
  }
  return { para, siguiente, niveles, grupos };
})();
