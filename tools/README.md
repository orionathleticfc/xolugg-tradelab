# Preview FUTBIN — Fase 2

Abrir con Live Server: `http://127.0.0.1:5500/tools/futbin-importer.html`.
Seleccionar el PDF; la extracción y el análisis son locales. La librería PDF.js
se descarga desde el CDN configurado en el importador.

## Archivos

- `futbin-importer.html/js/css`: diagnóstico, tabla de cartas, filtros, detalles y descargas.
- `futbin-parser.mjs`: módulo ESM puro, sin DOM, almacenamiento ni red.
- `futbin-parser-worker.mjs`: ejecuta el parser sin bloquear la interfaz.
- `futbin-parser.test.mjs`: pruebas con Node, sin dependencias externas.
- `fixtures-local/`: entradas privadas de prueba; excluidas por `tools/.gitignore`.

## Algoritmo

`parseFutbinDiagnostic(diagnostic)` recibe el JSON de diagnóstico de la Fase 1
y devuelve `{parserVersion, fileName, metrics, errors, cards}`.

1. Agrupa tokens por página, columna y bandas Y con tolerancias. No depende del
   orden de extracción. Las cuatro columnas parten de X ≈ 41.6 y se separan 132 puntos.
2. Detecta cuerpos mediante PAC/DIV o el par OVR/posición principal. Este segundo
   ancla permite conservar cartas sin estadísticas. No genera celdas vacías.
3. Busca filas económicas con dos valores por celda y las asocia por el offset
   vertical observado (+113.25 respecto de los labels de stats).
4. Una fila económica pendiente al pie de una página puede asociarse al primer
   cuerpo recortado de la página inmediatamente siguiente. Se consume por columna
   una sola vez. Las filas no asociadas quedan visibles como ambiguas.
5. Lee nombre, posición, stats, pie, skills, weak foot, rating y popularidad en
   sus bandas geométricas. Las posiciones derechas se conservan sin duplicar.
   Cuando falta una estadística, los valores restantes se asocian por X; no se
   desplazan para llenar huecos.
6. Conserva `null` donde falta evidencia y añade warnings. Los conflictos o la
   ausencia de identidad esencial producen `ambiguous`; las carencias restantes,
   `partial`. Un cero económico es un dato válido.
7. Cada carta conserva `sourcePage`, `priceSourcePage`, columna, ancla Y y
   tokens de evidencia con sus coordenadas originales. No se fabrican coordenadas.

`parseMarketValue` acepta enteros y decimales con sufijos K/M, preserva el valor
original y no atribuye significado al valor secundario.

## Validación

Ejecutar desde la raíz:

```text
node --test tools/futbin-parser.test.mjs
node --check tools/futbin-importer.js
node --check tools/futbin-parser.mjs
node --check tools/futbin-parser-worker.mjs
```

El test real se ejecuta si existe
`fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json`.
Si no existe se omite explícitamente; las pruebas sintéticas siguen funcionando.

Resultado del fixture de 17 páginas y 6465 tokens:
250 celdas/cartas, 232 complete, 18 partial, 0 ambiguous, 0 errores.
Las 18 parciales son 12 cartas sin stats y 6 porteros sin rating.
Las cuatro asociaciones entre páginas 1 y 2 se comprueban por nombre, precio,
valor secundario y páginas de procedencia, exclusivamente en los tests.
El parser no contiene esos nombres ni exige un total fijo de cartas.

También se verificó el flujo real en Edge headless: extracción PDF.js, worker,
filtros, detalles, paginación y las dos descargas JSON.

## Límites

El perfil geométrico actual está calibrado para páginas 612 × 792, sin rotación,
origen (0, 0) y userUnit 1. Otros perfiles producen errores explícitos, no una
conversión silenciosa. Cambios grandes de maquetación requieren otro perfil.
Los nombres en múltiples líneas o cambios de agrupación de tokens pueden requerir
ajustes; el panel de evidencia permite revisarlos. No hay OCR ni comparación con
catálogos, snapshots, persistencia o actualización de precios.


## Comparación con catálogo — Fase 3

La página carga `../players-data.js` en modo de solo lectura. El módulo puro
`futbin-matcher.mjs` recibe las cartas del parser y el catálogo, y
`futbin-matcher-worker.mjs` ejecuta la comparación fuera del hilo de la UI.
No modifica el parser, el catálogo ni la aplicación principal.

`compareFutbinSnapshot(snapshot, catalog, metadata)` devuelve:
`metadata`, `summary`, `unchanged`, `updated`, `new`,
`notInCurrentSnapshot` y `needsReview`.

La identidad normaliza nombre (diacríticos, mayúsculas y espacios), OVR, posición,
seis stats de campo o de portero, pie, skills y weakFoot. No usa el ID para resolver
coincidencias, ni incluye precios, popularidad, rating o página PDF.
Las posiciones alternativas se comparan como conjuntos y solo generan una
advertencia si difieren.

- Una identidad completa e igual produce `exact_identity / high`, aunque el
  parser marque la carta partial por falta de rating.
- Una identidad parcial con nombre, OVR y posición, sin conflictos en los campos
  conocidos y con un único candidato, produce `partial_identity / medium`.
- Candidatos múltiples, identidad insuficiente o conflictos estructurales con el
  mismo nombre/OVR requieren revisión.
- Un OVR distinto, o la ausencia de candidatos razonables, permite clasificar NEW.
- Si varias cartas del PDF reclaman el mismo registro, todas pasan a revisión;
  no se resuelve el conflicto por orden, ID, precio ni popularidad.
- Los candidatos pendientes de revisión no se marcan como ausentes. Por ello,
  exact + partial + notInCurrentSnapshot no necesariamente suma todo el catálogo.

Los cuatro campos de mercado generan diffs con old, new, delta y deltaPercent.
Null se conserva como ausencia: una transición hacia/desde null es visible,
pero no tiene delta numérico. Old = 0 tampoco genera porcentaje.
Perder un valor de mercado en el PDF añade `missing_snapshot_market_value`.
Todo es preview; estos diffs no constituyen instrucciones de actualización.

Validación adicional:

```text
node --test tools/futbin-parser.test.mjs tools/futbin-matcher.test.mjs
node --check tools/futbin-matcher.mjs
node --check tools/futbin-matcher-worker.mjs
```

Resultado real de esta fase:
- Catálogo: 250; snapshot: 250.
- Exact matches definitivos: 189; partial matches definitivos: 0.
- Unchanged: 0; updated: 189; new: 35.
- Not in current snapshot: 37; needs review: 26.
- 14 registros requieren revisión por candidatos múltiples; 12 por reclamaciones
  repetidas del mismo registro desde el PDF. Los parciales con candidato único
  aparecen también acompañados de otra carta que reclama ese candidato.
- Gordon, Frimpong, Pedro Neto y Mamardashvili son exact matches con cambios de
  mercado. Barcola y Lamine Yamal incluyen identidades no distinguibles con los
  campos disponibles y conservan sus candidatos para revisión.

Pasaron 20 pruebas y el flujo con PDF real en Edge: filtros de comparación,
detalle de conflictos, exportación de comparación, las dos exportaciones
anteriores y comprobación de que window.PLAYERS_DATA permanece sin cambios.


## Saneamiento — Fase 3.1 (política vigente)

Esta sección sustituye la política de precios cero y conciliación de parciales
descrita para la Fase 3 anterior.

- Antes del matching, se detectan identidades fuertes repetidas (incluidos stats
  de portero). Cuando hay una aparición parcial, se usa la identidad candidata
  nombre/OVR/posición/pie/skills/weakFoot.
- Los grupos son evidencia pendiente de revisión, nunca una fusión automática.
  Dos cartas completas con stats contradictorios no se agrupan por sí solas.
  Si una parcial conecta ambas, el grupo explicita el conflicto estructural.
- Se comparan también los valores de mercado originales para señalar conflictos,
  sin emplearlos como identidad ni escoger una aparición ganadora.
- Cada aparición pertenece exclusivamente a un estado final del snapshot.
  El JSON exporta `snapshotDuplicates` como lista de grupos con índices desde 0,
  motivos, conflictos y `occurrences`. Cada aparición conserva `parserCard`
  original, `pdfCard` comercial y candidatos del catálogo.
- `summary.snapshotDuplicates` cuenta apariciones (30), mientras que
  `summary.snapshotDuplicateGroups` cuenta grupos (15). Ninguna aparición de
  esos grupos se repite en new o needsReview.
- Un precio fuente cero genera `precioFuenteRaw: "0"`,
  `precioDisponible: false`, `precioReferencia: null` en la vista comercial.
  El parser y su exportación original conservan precio numérico 0 y todos sus tokens.
- Cuando no hay precio disponible, no se genera diff destructivo de precio.
  `priceDecision` expone el precio actual conservado; los otros campos de mercado
  pueden cambiar. No se escribe nada en el catálogo.
- Una carta sin stats y sin grupo conciliable requiere revisión manual incluso
  si el catálogo ofrece un único candidato. Missing rating por sí solo sigue
  permitiendo un match exacto.

Resultado con los fixtures reales:
catálogo 250, snapshot 250, exactMatches 189, partialMatches 0;
unchanged 1, updated 188, new 27, needsReview 4;
snapshotDuplicates 30 apariciones en 15 grupos;
notInCurrentSnapshot 37; unavailableZeroPrices 49.

Balance del snapshot: 1 + 188 + 27 + 4 + 30 = 250.
Los 37 ausentes pertenecen al catálogo previo y no se suman a ese balance.

Los 15 grupos pendientes son Fernando Torres, White, Pepe, Schweinsteiger,
Rummenigge, Heath, Formiga, Nagasato, Riise, Pirlo, Barcola, Marmoush,
Lamine Yamal, Agüero y Diaby (cada uno con dos apariciones).
Las cuatro revisiones de catálogo restantes son Diomande, Endrick,
Álvaro Carreras y Nmecha, por candidatos múltiples.

Comprobaciones de Fase 3.1:

```text
node --test tools/futbin-parser.test.mjs tools/futbin-matcher.test.mjs tools/futbin-matcher-sanitization.test.mjs
```

26 pruebas aprobadas. También pasó el PDF real en Edge: sección de 15 grupos,
30 filas de apariciones, evidencia expandible, precios normalizados, filtros y
las tres exportaciones. Van de Ven conserva el precio actual y cambia su
popularidad; los seis porteros sin rating siguen teniendo identidad exacta.

