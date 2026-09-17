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

