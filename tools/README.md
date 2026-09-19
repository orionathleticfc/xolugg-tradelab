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


## Catálogo candidato — Fase 4A

Tras la comparación se genera automáticamente una propuesta **en memoria**.
La sección «Catálogo candidato» permite revisar métricas y trazabilidad y descargar:

- `players-data.candidate.js`: asignación compatible `window.PLAYERS_DATA = [...];`.
- `catalog-generation-report.json`: metadata, summary, updatedApplied,
  newApplied, unchanged, preservedNotInSnapshot, skippedSnapshotDuplicates,
  skippedNeedsReview, generationNeedsReview y validation.

No se reemplaza ningún archivo ni se escribe en localStorage. El reporte sigue
disponible si el candidato no supera la validación; la descarga del JS queda
deshabilitada. Los registros excluidos por colisión u otras incidencias no se
añaden; quedan en generationNeedsReview y el resto de la propuesta se valida.

### Módulos reutilizables

- `futbin-generator.mjs`: generateCandidateCatalog, generateCardId,
  validateCandidateCatalog y serializeCandidateCatalog; sin DOM, almacenamiento
  ni red.
- `futbin-generator-worker.mjs`: construcción y serialización en un worker.
- `futbin-generator.test.mjs`: regresiones sintéticas y con fixtures locales.

El generador clona catálogo y evidencia. Conserva todos los registros existentes
en su orden original; las nuevas cartas se agregan al final. Las entradas que
no reciben un update seguro se conservan íntegramente, incluido activo.

Solo aplica UPDATED con exact_identity y confidence high, y comprueba que la
identidad y el registro actual coincidan aún con los usados por el matcher.
Los campos estructurales e IDs no cambian. Solo se actualizan los cuatro campos
de mercado respaldados y los campos de fuente permitidos. Un valor ausente no
borra el dato existente. Un precio raw "0" preserva el precio actual y se
registra como "0" en fuente.precioPrincipalRaw.

Los IDs nuevos se forman con nombre normalizado, OVR, posición, stats, pie,
skills y weakFoot. No incluyen mercado, popularidad, página o fecha. Las
colisiones contra el catálogo o entre propuestas quedan en revisión; no se
resuelven agregando sufijos dependientes del orden.

El reporte incluye los campos cambiados con old/new, los nuevos IDs, los
índices de snapshot omitidos y su evidencia. Los 15 grupos y cuatro revisiones
siguen pendientes sin seleccionar ninguna aparición.

### Validación de la Fase 4A

```text
node --test tools/futbin-parser.test.mjs tools/futbin-matcher.test.mjs tools/futbin-matcher-sanitization.test.mjs tools/futbin-generator.test.mjs
node --check tools/futbin-importer.js
node --check tools/futbin-generator.mjs
node --check tools/futbin-generator-worker.mjs
```

Resultado del fixture real: 250 registros iniciales, 188 updates aplicados,
27 nuevas, 1 unchanged, 37 fuera del snapshot conservadas intactas,
15 grupos / 30 apariciones omitidas y 4 revisiones omitidas.
Candidato: **277 registros**, 0 colisiones, 0 incidencias de generación,
0 errores de validación.

Pasaron 37 pruebas. Se ejecutó también el PDF real en Edge: extracción, parser,
matcher, generador, detalles, filtros y las cinco descargas. El JS candidato
se ejecutó en un objeto window aislado y produjo 277 registros con IDs únicos,
sin precios operativos cero; catálogo original y localStorage no cambiaron.


## Fase 6A: enlaces del PDF (solo diagnóstico)

Abrir `tools/futbin-importer.html` con Live Server y seleccionar el PDF local.
La sección **Enlaces FUTBIN** muestra asociaciones por aparición, todos los dominios,
las URLs y sus rectángulos. **Exportar diagnóstico de enlaces** descarga
`futbin-links-diagnostic.json`: metadata, summary, cards, links y annotations.
Los IDs `snapshot-card-N` son referencias locales al índice del snapshot (base cero),
no IDs del catálogo. `playerId` se conserva como cadena.

PDF.js 5.4.624 lee `page.getAnnotations()` antes de liberar cada página. No visita
las URLs extraídas. El diagnóstico no se incorpora al matcher ni al generator.
Las coordenadas son las originales del PDF, sin viewport, con Y creciente hacia arriba.
Se reutiliza la geometría del parser: columna de 132 unidades y banda vertical
anchorY - 66 a anchorY + 86, limitada a la página. En fragmentos de otra página
se utiliza únicamente la evidencia económica que ya identificó el parser.
Se exige una intersección de al menos el 50% del área del rectángulo o de la región
para descartar pequeños solapamientos con la columna vecina. Se conservan todas las
candidatas; varias URLs distintas, áreas compartidas o rutas FUTBIN no reconocidas
producen AMBIGUOUS_LINK. Fragmentos con la misma URL en una carta no se duplican.
Un fallo al leer anotaciones marca el diagnóstico incompleto y las cartas afectadas
como ambiguas, sin interrumpir el comparador. NO_LINK y NON_FUTBIN_LINK cuentan en
`summary.noLink`; este último también tiene contador informativo separado.

Validación local del PDF FUTBIN2: 279 anotaciones, 278 URLs, 268 de FUTBIN,
17 páginas con enlaces y 250/250 apariciones asociadas, 0 sin enlace y 0 ambiguas.
Hay 254 anotaciones de cartas (cuatro cartas tienen fragmentos entre páginas 1 y 2),
14 enlaces genéricos FUTBIN y 10 externos. La forma de carta observada es
`https://www.futbin.com/27/player/{playerId}/{slug}`. Los enlaces genéricos quedan
como evidencia sin asociar. Esto comprueba el vínculo conservado en el PDF, no la
vigencia del destino ni otros diseños/versiones de PDF; no se consulta FUTBIN.

Pruebas sintéticas, sin red: `node --test tools/futbin-links.test.mjs`.
La validación con el PDF y JSON reales usa fixtures locales ignorados por Git.

## Fase 6B: metadata FUTBIN en el candidato

El worker recibe `linksDiagnostic`. El generador usa `futbin-catalog-links.mjs`
para recalcular con `buildLinksDiagnostic` la asociación geométrica contra las
cartas de esta comparación. Conserva `pageInfo` para reproducir el recorte de
regiones. Solo aplica MATCHED + exact_identity + high sobre un registro existente
no ambiguo ni reclamado por otra aparición; NEW requiere una comparación posterior
contra el catálogo incorporado. Nunca construye enlaces por nombre ni visita URLs.

Cada registro recibe únicamente `futbin: { game, playerId, slug, url }`.
Se exige game 27, playerId entero positivo representable exactamente como number,
slug no vacío y URL canónica HTTPS de www.futbin.com, sin query ni fragmento.
Un playerId diferente al existente se omite como conflicto. Un cambio de slug del
mismo playerId puede aplicarse con evidencia válida. Ausencia, ambigüedad, duplicados,
revisiones o cartas fuera del snapshot preservan la metadata anterior.
La validación completa también rechaza metadata preexistente inválida.

El reporte contiene `futbinLinks` (decisión por aparición, índices, candidatos,
URLs y old/proposed cuando corresponde) y `futbinPreserved` (por registro).
Los contadores `futbinLinksApplied` y `futbinLinksPreserved` cuentan registros;
`futbinLinksSkippedDuplicates` cuenta apariciones, no grupos;
`futbinLinksSkippedNeedsReview` cuenta apariciones en revisión;
`futbinLinksMissing` cuenta matches seguros sin enlace geométrico MATCHED.
URLs inválidas, conflictos de ID y matches inseguros tienen contadores separados.
La UI muestra los cinco contadores solicitados y detalles auditables.

Validación offline reproducible con los fixtures locales de Fase 6A:

```powershell
$tests = @(Get-ChildItem tools -Filter '*.test.mjs' | ForEach-Object FullName)
node --test @tests
node tools/futbin-phase6b-local.mjs --export
Get-ChildItem tools -File | Where-Object Extension -In '.js','.mjs' | ForEach-Object { node --check $_.FullName }
```

`futbin-phase6b-local.mjs` es un lector de anotaciones exclusivo del fixture Skia
local con diccionarios sin comprimir; verifica el árbol de páginas y rechaza sintaxis
no soportada. Lee el PDF original de nuevo, sin reutilizar resultados parciales.
El importador continúa usando PDF.js. El script usa el diagnóstico de texto local
para el parser, ejecuta dos veces matcher/generator, comprueba igualdad completa
(incluido importedAt) y exporta `tools/players-data.candidate.js` y
`tools/catalog-generation-report.json`. Los fixtures privados siguen ignorados.

Resultado real: 277 registros, 216 enlaces aplicados, 0 preservados inicialmente,
30 apariciones / 15 grupos duplicados omitidos, 4 NEEDS_REVIEW, 0 faltantes,
0 conflictos y 0 errores. Segunda ejecución: 0 aplicados, 216 preservados,
catálogo idéntico. No se reemplaza el catálogo de producción ni se usa localStorage.

## Publicar actualización FUTBIN

`update-futbin.ps1` publica en `main` un catálogo candidato descargado desde el
importador. El flujo normal busca el archivo `players-data.candidate*.js` más
reciente en `Downloads`:

~~~powershell
.\tools\update-futbin.ps1
~~~

También se puede indicar el candidato de forma explícita:

~~~powershell
.\tools\update-futbin.ps1 -Candidate "C:\...\players-data.candidate.js"
~~~

Para comprobar la selección, Git, sintaxis, validación semántica y tests sin
modificar el catálogo, crear commits ni hacer push:

~~~powershell
.\tools\update-futbin.ps1 -DryRun
.\tools\update-futbin.ps1 -Candidate "C:\...\players-data.candidate.js" -DryRun
~~~

Si la política local bloquea scripts, se puede iniciar un único proceso de prueba
sin cambiar la política del sistema:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\update-futbin.ps1 -DryRun
~~~

El flujo rutinario es:

1. Cargar el PDF en el importador.
2. Revisar que existan 0 colisiones y 0 errores.
3. Descargar `players-data.candidate.js`.
4. Ejecutar `update-futbin.ps1`.
5. Revisar la ruta, fecha, tamaño, SHA-256 y resumen calculado.
6. Escribir `PUBLICAR` cuando el script lo solicite.
7. Esperar la confirmación del commit y del push.

El resumen indica `CAMBIOS DETECTADOS` o `SIN CAMBIOS` después de comparar los
catálogos ya analizados y validados, por lo que diferencias de formato no cuentan
como una actualización. Si son semánticamente idénticos, la ejecución real muestra
`SIN CAMBIOS PARA PUBLICAR` y termina correctamente sin copiar, hacer staging,
crear un commit ni hacer push. `-DryRun` muestra el mismo estado sin modificar nada.

La publicación real exige un repositorio `xolugg-tradelab` limpio, sin operaciones
Git pendientes y con `origin` configurado. Cambia de forma segura a `main` y ejecuta
`git pull --ff-only origin main`; nunca usa reset, clean ni force push. El validador
rechaza IDs eliminados o duplicados, cambios de identidad, alteraciones del orden,
precios cero, esquemas inválidos y enlaces FUTBIN no canónicos. No fija un tamaño
histórico del catálogo.

Antes de copiar se conserva `players-data.js` en un archivo temporal. Si falla una
validación antes del commit, el archivo original se restaura automáticamente. Solo
se permite incluir `players-data.js` en el commit. Si el push directo es rechazado,
el commit queda local y el script informa el fallo sin reintentar ni usar force.
La suite histórica del importador no se reescribe: el publicador ejecuta las
pruebas genéricas del validador como barrera estable para catálogos futuros.
+

## Fase 10: snapshot Popular autoritativo (política vigente)

Esta sección sustituye las políticas acumulativas descritas en las fases históricas
anteriores. El PDF actual de Popular Players determina pertenencia, orden,
popularidad y mercado del catálogo candidato. El catálogo anterior se consulta
solo para reutilizar un ID inequívoco y metadata segura; una carta ausente no se
copia al candidato.

Flujo vigente:

1. PDF.js extrae texto, anotaciones y una muestra raster local de cada carta.
2. El parser conserva todas las cartas geométricamente válidas y clasifica
   `tipoCarta` como `gold`, `special` o `unknown`. La clasificación usa
   ratios de color del área de carta; una señal insuficiente queda `unknown` y
   no se descarta.
3. Las annotations se asocian por geometría. No se visita ni busca FUTBIN.
4. La identidad prioriza `futbin.playerId`, luego URL exacta, fingerprint
   estructural y fallback conservador. Un playerId nuevo nunca hereda el ID de
   otra variante. Para una carta conocida se conserva su ID histórico; una
   variante nueva enlazada usa `futbin-27-{playerId}`.
5. El generator recorre el snapshot en su orden y construye el candidato desde
   cero. Un playerId repetido se consolida si la estructura es coherente.
   PlayerIds distintos se conservan como variantes diferentes.
6. Si varios playerIds tienen fingerprint y tipo equivalentes, exactamente una
   variante tiene precio y las demás traen raw `"0"`, se conserva la variante
   comercial y se registran las demás en `excludedUnavailableTwins`. Si todas
   son no disponibles, el grupo pasa a `NEEDS_REVIEW`.
7. Raw `"0"` siempre produce `precioReferencia: null`. No recupera el precio
   histórico.
8. Cada carta aceptada recibe `fuente.snapshotObservedAt` e `importedAt` del
   snapshot nuevo, aunque el mercado no cambie. `lastMarketChangedAt` se mueve
   solo cuando cambia un valor de mercado. Así, un manual anterior expira y uno
   posterior sigue ganando.

El JS exportado mantiene `window.PLAYERS_DATA` y añade
`window.PLAYERS_DATA_META` con modo, archivo, fechas, parsed/accepted, tipos,
twins excluidos y revisiones. El reporte contiene removals (con IDs), nuevas,
actualizadas, sin cambios, tipos, precios null, duplicados, revisiones,
colisiones, enlaces y errores.

### Validator y publicador

En `authoritative-snapshot`, el validator permite removals y cambios de orden,
pero exige metadata coherente, candidato no vacío, counts consistentes, cobertura
mínima, IDs y playerIds únicos, precios positivos o null, tipos válidos y
timestamps válidos. Una caída de al menos 40% frente al catálogo anterior emite
una advertencia crítica reforzada; no fija tamaños históricos.

`update-futbin.ps1 -DryRun` muestra modo, actual, candidato, removals, additions,
gold/special/unknown, null prices, unavailable twins, needs review y errores.
No copia, commitea ni hace push. Si hay removals, la publicación real exige escribir
exactamente `REEMPLAZAR`; sin removals conserva `PUBLICAR`. Antes de copiar crea
un backup temporal y restaura `players-data.js` si falla una barrera previa al
commit. El script no toca localStorage.

### Cambios deliberados de tests históricos

Se actualizaron únicamente expectativas que codificaban la filosofía anterior:

- “ausente se conserva” cambió a “ausente se elimina del candidato”;
- “raw 0 conserva precio viejo” cambió a “raw 0 produce null”;
- “registros actuales primero y nuevos al final” cambió a “orden del snapshot”;
- “duplicados por fingerprint se bloquean todos” cambió a playerId exacto,
  variantes separadas y regla unavailable twin;
- “el validator rechaza removals” se mantiene solo en modo legacy; el modo
  autoritativo los permite con metadata y barreras.

La suite cubre los casos A–Z de Fase 10 entre parser, links, matcher, generator,
validator, manual prices, autocomplete y publicador. El harness
`futbin-phase10-browser.cjs` procesa un PDF local en Edge headless, no consulta
FUTBIN y deja cualquier candidato de prueba únicamente en TEMP.
