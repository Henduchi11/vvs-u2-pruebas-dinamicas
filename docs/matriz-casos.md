# Matriz de casos de prueba — `calcularTotal`

Técnicas: **PE** = partición de equivalencia · **AVL** = análisis de valores límite · **INV** = entrada inválida / adivinación de errores · **EXP** = exploratoria.
Estado tras la ejecución inicial (`evidencias/pruebas-iniciales.txt`) y final (`evidencias/pruebas-finales.txt`): «Falló → Pasa (DEF-xx)» indica que el caso detectó el defecto indicado y pasa tras su corrección.
Prioridad derivada del análisis de riesgos (`docs/plan-pruebas.md` §3). Cada caso se automatiza en `tests/compras.test.js` con el mismo ID (excepto CP-24, que es un script de medición).

Datos en el orden `(precio, cantidad, descuento)`.

| ID | Requisito | Técnica | Datos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RF-01 | PE válida | (10, 2, 0) | 20 | Alta | Pasa |
| CP-02 | RF-01, RF-03 | PE válida (decimales) | (19.99, 3, 0) | 59.97 | Alta | Pasa |
| CP-03 | RF-01 | AVL cantidad mínima válida | (25.5, 1, 0) | 25.5 | Media | Pasa |
| CP-04 | RF-02 | PE descuento intermedio | (100, 1, 15) | 85 | Alta | Pasa |
| CP-05 | RF-02 | AVL descuento = 0 | (50, 2, 0) | 100 | Alta | Pasa |
| CP-06 | RF-02 | AVL descuento = 0.01 | (100, 1, 0.01) | 99.99 | Media | Pasa |
| CP-07 | RF-02, RF-03 | AVL descuento = 99.99 | (100, 1, 99.99) | 0.01 | Media | Falló → Pasa (DEF-04) |
| CP-08 | RF-02, RF-03 | AVL descuento = 100 | (50, 2, 100) | 0 | Alta | Pasa |
| CP-09 | RF-03 | INV coma flotante | (0.1, 3, 0) | 0.3 | Alta | Falló → Pasa (DEF-04) |
| CP-10 | RF-03 | PE redondeo con descuento | (33.33, 3, 33) | 66.99 | Alta | Falló → Pasa (DEF-04) |
| CP-11 | RF-03 | INV coma flotante | (1.1, 3, 0) | 3.3 | Media | Falló → Pasa (DEF-04) |
| CP-12 | RF-04 | AVL precio = 0 (válido) | (0, 5, 10) | 0 | Media | Pasa |
| CP-13 | RF-04 | AVL precio = −0.01 | (−0.01, 1, 0) | RangeError | Alta | Falló → Pasa (DEF-02) |
| CP-14 | RF-04 | PE precio negativo | (−1, 1, 0) | RangeError | Alta | Falló → Pasa (DEF-02) |
| CP-15 | RF-04 | AVL cantidad = 0 | (10, 0, 0) | RangeError | Alta | Falló → Pasa (DEF-02) |
| CP-16 | RF-04 | PE cantidad negativa | (10, −2, 0) | RangeError | Alta | Falló → Pasa (DEF-02) |
| CP-17 | RF-04 | AVL descuento = −0.01 | (100, 1, −0.01) | RangeError | Alta | Falló → Pasa (DEF-03) |
| CP-18 | RF-04 | AVL descuento = 100.01 | (100, 1, 100.01) | RangeError | Alta | Falló → Pasa (DEF-03) |
| CP-19 | RF-05 | INV cadena numérica | ('10', 2, 0) | TypeError | Alta | Falló → Pasa (DEF-01) |
| CP-20 | RF-05 | INV no finito NaN | (NaN, 1, 0) | TypeError | Alta | Falló → Pasa (DEF-01) |
| CP-21 | RF-05 | INV no finito Infinity | (Infinity, 1, 0) | TypeError | Alta | Falló → Pasa (DEF-01) |
| CP-22 | RF-05 | INV booleano | (10, true, 0) | TypeError | Media | Falló → Pasa (DEF-01) |
| CP-23 | RF-05 | INV null / undefined | (10, 1, null) y (10, 1, undefined) | TypeError | Media | Falló → Pasa (DEF-01) |
| CP-24 | RNF-01 | EXP rendimiento | 1 000 000 llamadas válidas, 5 repeticiones | Mediana del tiempo medio por llamada registrada; referencia exploratoria < 1 µs/llamada | Baja | Ejecutado (ver `docs/reporte-pruebas.md` §4) |
| CP-25 | RF-04, RF-05 | INV orden de validación | ('−5', 1, 0) | TypeError (tipo antes que rango) | Baja | Falló → Pasa (DEF-01) |

## Casos de regresión añadidos tras las correcciones

| ID | Requisito | Técnica | Datos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| RG-01 | RF-03 | AVL redondeo (mitad exacta) | (1.005, 1, 0) | 1.01 | Media | Pasa |
| RG-02 | RF-03 | AVL redondeo (mitad exacta) | (2.675, 1, 0) | 2.68 | Media | Pasa |
| RG-03 | RF-01, RF-02, RF-03 | PE combinada | (19.99, 3, 10) | 53.97 | Alta | Pasa |
| RG-04 | RF-05 | INV mensaje de error | (10, 1, '5') | TypeError que menciona «descuento» | Baja | Pasa |
| RG-05 | RF-04 | INV mensaje de error | (10, 0, 0) | RangeError que menciona «cantidad» | Baja | Pasa |
| RG-06 | RF-03 | AVL 0 con 100 % | (0, 1, 100) | 0 (no −0) | Baja | Pasa |
| RG-07 | RF-03 | Determinismo | 1000 × (33.33, 3, 33) | siempre 66.99 | Baja | Pasa |

## Trazabilidad requisito → casos

| Requisito | Casos | Nº |
|---|---|---|
| RF-01 | CP-01, CP-02, CP-03, RG-03 | 4 |
| RF-02 | CP-04, CP-05, CP-06, CP-07, CP-08, RG-03 | 6 |
| RF-03 | CP-02, CP-07, CP-08, CP-08b, CP-09, CP-10, CP-11, RG-01, RG-02, RG-03, RG-06, RG-07 | 12 |
| RF-04 | CP-12, CP-13, CP-14, CP-15, CP-16, CP-17, CP-18, CP-25, RG-05 | 9 |
| RF-05 | CP-19, CP-20, CP-21, CP-22, CP-23, CP-25, RG-04 | 7 |
| RNF-01 | CP-24 | 1 |

Cobertura de particiones: todas las particiones válidas e inválidas de §4 del plan tienen al menos un caso. Cobertura de valores límite: 10/10 valores límite identificados (100 %).
