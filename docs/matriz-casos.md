# Matriz de casos de prueba — `calcularTotal`

Técnicas: **PE** = partición de equivalencia · **AVL** = análisis de valores límite · **INV** = entrada inválida / adivinación de errores · **EXP** = exploratoria.
Prioridad derivada del análisis de riesgos (`docs/plan-pruebas.md` §3). Cada caso se automatiza en `tests/compras.test.js` con el mismo ID (excepto CP-24, que es un script de medición).

Datos en el orden `(precio, cantidad, descuento)`.

| ID | Requisito | Técnica | Datos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RF-01 | PE válida | (10, 2, 0) | 20 | Alta | Diseñado |
| CP-02 | RF-01, RF-03 | PE válida (decimales) | (19.99, 3, 0) | 59.97 | Alta | Diseñado |
| CP-03 | RF-01 | AVL cantidad mínima válida | (25.5, 1, 0) | 25.5 | Media | Diseñado |
| CP-04 | RF-02 | PE descuento intermedio | (100, 1, 15) | 85 | Alta | Diseñado |
| CP-05 | RF-02 | AVL descuento = 0 | (50, 2, 0) | 100 | Alta | Diseñado |
| CP-06 | RF-02 | AVL descuento = 0.01 | (100, 1, 0.01) | 99.99 | Media | Diseñado |
| CP-07 | RF-02, RF-03 | AVL descuento = 99.99 | (100, 1, 99.99) | 0.01 | Media | Diseñado |
| CP-08 | RF-02, RF-03 | AVL descuento = 100 | (50, 2, 100) | 0 | Alta | Diseñado |
| CP-09 | RF-03 | INV coma flotante | (0.1, 3, 0) | 0.3 | Alta | Diseñado |
| CP-10 | RF-03 | PE redondeo con descuento | (33.33, 3, 33) | 66.99 | Alta | Diseñado |
| CP-11 | RF-03 | INV coma flotante | (1.1, 3, 0) | 3.3 | Media | Diseñado |
| CP-12 | RF-04 | AVL precio = 0 (válido) | (0, 5, 10) | 0 | Media | Diseñado |
| CP-13 | RF-04 | AVL precio = −0.01 | (−0.01, 1, 0) | RangeError | Alta | Diseñado |
| CP-14 | RF-04 | PE precio negativo | (−1, 1, 0) | RangeError | Alta | Diseñado |
| CP-15 | RF-04 | AVL cantidad = 0 | (10, 0, 0) | RangeError | Alta | Diseñado |
| CP-16 | RF-04 | PE cantidad negativa | (10, −2, 0) | RangeError | Alta | Diseñado |
| CP-17 | RF-04 | AVL descuento = −0.01 | (100, 1, −0.01) | RangeError | Alta | Diseñado |
| CP-18 | RF-04 | AVL descuento = 100.01 | (100, 1, 100.01) | RangeError | Alta | Diseñado |
| CP-19 | RF-05 | INV cadena numérica | ('10', 2, 0) | TypeError | Alta | Diseñado |
| CP-20 | RF-05 | INV no finito NaN | (NaN, 1, 0) | TypeError | Alta | Diseñado |
| CP-21 | RF-05 | INV no finito Infinity | (Infinity, 1, 0) | TypeError | Alta | Diseñado |
| CP-22 | RF-05 | INV booleano | (10, true, 0) | TypeError | Media | Diseñado |
| CP-23 | RF-05 | INV null / undefined | (10, 1, null) y (10, 1, undefined) | TypeError | Media | Diseñado |
| CP-24 | RNF-01 | EXP rendimiento | 1 000 000 llamadas válidas, 5 repeticiones | Mediana del tiempo medio por llamada registrada; referencia exploratoria < 1 µs/llamada | Baja | Diseñado |
| CP-25 | RF-04, RF-05 | INV orden de validación | ('−5', 1, 0) | TypeError (tipo antes que rango) | Baja | Diseñado |

## Trazabilidad requisito → casos

| Requisito | Casos | Nº |
|---|---|---|
| RF-01 | CP-01, CP-02, CP-03 | 3 |
| RF-02 | CP-04, CP-05, CP-06, CP-07, CP-08 | 5 |
| RF-03 | CP-02, CP-07, CP-08, CP-09, CP-10, CP-11 | 6 |
| RF-04 | CP-12, CP-13, CP-14, CP-15, CP-16, CP-17, CP-18, CP-25 | 8 |
| RF-05 | CP-19, CP-20, CP-21, CP-22, CP-23, CP-25 | 6 |
| RNF-01 | CP-24 | 1 |

Cobertura de particiones: todas las particiones válidas e inválidas de §4 del plan tienen al menos un caso. Cobertura de valores límite: 10/10 valores límite identificados (100 %).
