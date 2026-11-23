# Reporte de pruebas (informe de finalización) — `calcularTotal`

> Estructura basada en el *Test Completion Report* de ISO/IEC/IEEE 29119-3:2021. Características de calidad según ISO/IEC 25010:2023.

| Campo | Valor |
|---|---|
| Identificador | RP-VVS-U2-01 |
| Plan asociado | `docs/plan-pruebas.md` (PP-VVS-U2-01) |
| Objeto de prueba | `src/compras.js` — `calcularTotal(precio, cantidad, descuento)` |
| Autor | Henry Geovanny Duchi |
| Entorno | Node.js v24.22.1 · npm 11.21.1 · Jest 30.5.2 · Linux x86_64 (Intel Xeon, 8 núcleos lógicos, 15,6 GiB) |

## 1. Resumen ejecutivo

Se diseñaron **25 casos** (CP-01…CP-25) más **7 casos de regresión** (RG-01…RG-07) y se automatizaron **33 pruebas** Jest. Sobre el código inicial **fallaron 17 de 26 pruebas**, lo que confirmó **4 defectos** (2 críticos, 1 alto, 1 medio). Cada defecto se corrigió en un commit independiente con re-ejecución de la suite completa (confirmación + regresión). La ejecución final da **33/33 pruebas en verde** y **100 % de cobertura** de sentencias, ramas, funciones y líneas. Todos los criterios de salida del plan se cumplen. Se recomienda liberar el módulo con los riesgos residuales de §6 aceptados por el negocio.

## 2. Resultados de ejecución

| Ejecución | Versión de `src/compras.js` | Pruebas | Pasan | Fallan | Evidencia |
|---|---|---|---|---|---|
| Inicial | código entregado (sha256 `67c290e9b2e5`) | 26 | 9 | **17** | `evidencias/pruebas-iniciales.txt` |
| Tras DEF-01 | `fix(DEF-01)` | 26 | 16 | 10 | `evidencias/regresion-DEF-01.txt` |
| Tras DEF-02 | `fix(DEF-02)` | 26 | 20 | 6 | `evidencias/regresion-DEF-02.txt` |
| Tras DEF-03 | `fix(DEF-03)` | 26 | 22 | 4 | `evidencias/regresion-DEF-03.txt` |
| Tras DEF-04 | `fix(DEF-04)` | 26 | 26 | 0 | `evidencias/regresion-DEF-04.txt` |
| **Final + regresión** | versión corregida + suite RG | **33** | **33** | **0** | `evidencias/pruebas-finales.txt` |

La reducción monótona de fallos (17 → 10 → 6 → 4 → 0) sin que ninguna prueba previamente verde pasara a rojo demuestra que **ninguna corrección introdujo regresiones**.

### Cobertura estructural (jest --coverage, ejecución final)

| Métrica | Resultado | Criterio de salida |
|---|---|---|
| Sentencias | 100 % (16/16) | ≥ 90 % ✔ |
| Ramas | 100 % (12/12) | ≥ 90 % ✔ |
| Funciones | 100 % (2/2) | — |
| Líneas | 100 % (16/16) | — |

## 3. Defectos

| ID | Requisito | Severidad | Fallos que lo evidenciaron | Estado |
|---|---|---|---|---|
| DEF-01 | RF-05 — no lanza `TypeError` con `'10'`, `true`, `null`, `undefined`, `NaN`, `Infinity` | Alta | 7 | Cerrado (verificado) |
| DEF-02 | RF-04 — precio negativo / cantidad ≤ 0 aceptados (totales negativos) | Crítica | 4 | Cerrado (verificado) |
| DEF-03 | RF-04 — descuento fuera de [0, 100] aceptado (−0,01 % encarece; 100,01 % da total negativo) | Crítica | 2 | Cerrado (verificado) |
| DEF-04 | RF-03 — total sin redondear (`0.30000000000000004`, `66.9933`) | Media | 4 | Cerrado (verificado) |

Densidad: 4 defectos en 6 líneas de código inicial. Detalle completo (pasos, esperado, real, evidencia, causa raíz) en `docs/defectos.md`.

## 4. Rendimiento exploratorio (RNF-01, CP-24)

Script reproducible: `npm run perf` (`scripts/rendimiento.js`). Salida: `evidencias/rendimiento.txt`.

| Medida (1 000 000 llamadas × 5 repeticiones, tras calentamiento) | Valor |
|---|---|
| Versión corregida — mediana por llamada | 21,2 ns (p95 21,6 ns) |
| Versión inicial — mediana por llamada | 12,3 ns |
| Sobrecosto de validación + redondeo | ≈ 8,9 ns/llamada |
| Throughput de la versión corregida | ≈ 47 millones de llamadas/s |
| Camino de error (lanzar y capturar `RangeError`) | ≈ 2 793 ns/llamada |

**Interpretación** (eficiencia de desempeño – comportamiento temporal, ISO/IEC 25010:2023): las correcciones casi duplican el tiempo relativo, pero en términos absolutos el costo (≈ 9 ns) es despreciable frente a cualquier operación de E/S de una tienda (ms). El camino de error es ~130 veces más lento por la creación de la traza de pila; no es problema mientras los errores sean excepcionales, pero desaconseja usar excepciones para validar formularios masivamente.

**Entorno**: ver encabezado. **Limitaciones**: microbenchmark en un único proceso de Node.js; resultados sensibles al JIT de V8, al recolector de basura, a la frecuencia de CPU y a la carga de una máquina virtual compartida; los datos de entrada son sintéticos y deterministas; no se mide concurrencia, memoria ni latencia de extremo a extremo. Los valores son orientativos y deben repetirse en el entorno objetivo antes de fijar un requisito cuantitativo.

## 5. Cobertura por requisito (trazabilidad)

| Requisito | Casos diseñados | Pruebas automatizadas | Defectos hallados | Resultado final |
|---|---|---|---|---|
| RF-01 | CP-01, CP-02, CP-03, RG-03 | 4 | — | Cumple |
| RF-02 | CP-04…CP-08, RG-03 | 6 | (DEF-03 vía RF-04) | Cumple |
| RF-03 | CP-02, CP-07, CP-08, CP-08b, CP-09…CP-11, RG-01…RG-03, RG-06, RG-07 | 12 | DEF-04 | Cumple |
| RF-04 | CP-12…CP-18, CP-25, RG-05 | 9 | DEF-02, DEF-03 | Cumple |
| RF-05 | CP-19…CP-23b, CP-25, RG-04 | 8 | DEF-01 | Cumple |
| RNF-01 | CP-24 | script `npm run perf` | — | Medido (exploratorio) |

100 % de los requisitos con al menos un caso; 100 % de las particiones y valores límite identificados en el plan ejercitados.

## 6. Riesgos residuales

| ID | Riesgo residual | Probabilidad / Impacto | Recomendación |
|---|---|---|---|
| R-RES-01 | Se aceptan cantidades fraccionarias (1,5 unidades); la especificación no lo prohíbe. | Media / Media | Aclarar con negocio; si se exige entero, añadir RF y `Number.isInteger`. |
| R-RES-02 | Entradas finitas muy grandes (p. ej. 1e308 × 10) desbordan y devuelven `NaN`. | Baja / Alta | Definir un máximo de precio/cantidad o validar que el resultado sea finito. |
| R-RES-03 | Redondeo con `Number` binario: correcto en los casos probados (1.005 → 1.01), pero no garantizado para todo el dominio. | Baja / Media | Para dinero en producción, trabajar en centavos enteros o con una librería decimal. |
| R-RES-04 | Modo de redondeo (half-up) asumido; el negocio podría requerir redondeo bancario. | Baja / Baja | Confirmar con el responsable del requisito RF-03. |
| R-RES-05 | El rendimiento solo se midió en una máquina virtual y de forma exploratoria. | Media / Baja | Repetir en el entorno objetivo con un umbral acordado. |
| R-RES-06 | Solo se probó a nivel de componente; no hay pruebas de integración con carrito/pago. | Media / Media | Planificar pruebas de integración y de sistema en siguientes iteraciones. |

## 7. Evaluación de criterios de salida

| Criterio (plan §6) | Estado |
|---|---|
| 100 % de casos Alta/Media ejecutados | ✔ |
| 100 % de pruebas automatizadas en verde | ✔ 33/33 |
| Cada RF con ≥ 2 casos; RNF-01 medido | ✔ |
| Cobertura de sentencias y ramas ≥ 90 % | ✔ 100 % / 100 % |
| Defectos Alta/Crítica corregidos y verificados | ✔ 4/4 cerrados |
| Riesgos residuales documentados | ✔ §6 |

## 8. Lecciones aprendidas

1. Las pruebas de valores límite (−0,01 / 0 / 100 / 100,01) detectaron DEF-02 y DEF-03 que una sola prueba de "camino feliz" jamás habría revelado: 9 de 26 pruebas pasaban con el código defectuoso.
2. Los defectos propios del lenguaje (coerción de tipos y coma flotante) solo aparecen con adivinación de errores basada en experiencia; deben incluirse sistemáticamente en módulos de cálculo monetario en JavaScript.
3. Corregir un defecto por commit con re-ejecución completa hizo verificable cada paso y facilitó atribuir cualquier regresión.
4. La cobertura del 100 % es un indicador de completitud estructural, no de ausencia de defectos: R-RES-01…R-RES-03 siguen abiertos con cobertura total.
