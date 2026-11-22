# Registro de defectos — `calcularTotal`

Formato basado en el *Incident Report* de ISO/IEC/IEEE 29119-3:2021. Terminología ISTQB CTFL v4.0.1: un **defecto** en el código provoca un **fallo** observable al ejecutar la prueba.
Evidencia de detección: `evidencias/pruebas-iniciales.txt` (17 de 26 pruebas fallan sobre el código inicial, sha256 `67c290e9b2e5`).

**Escala de severidad**: Crítica (pérdida económica directa o datos corruptos sin aviso) · Alta (incumple un requisito funcional con impacto en el resultado) · Media (resultado incorrecto pero acotado/visible) · Baja (cosmético).
**Prioridad de corrección**: orden en que se corrigió (1 = primero). Se corrigió primero la validación de tipo porque condiciona la de rango (orden de validación definido en el plan, §1).

## Resumen

| ID | Título | Requisito | Severidad | Prioridad | Casos que lo detectan | Estado | Commit de corrección |
|---|---|---|---|---|---|---|---|
| DEF-01 | Entradas no numéricas o no finitas no lanzan `TypeError` | RF-05 | Alta | 1 | CP-19, CP-20, CP-21, CP-22, CP-23a, CP-23b, CP-25 | Cerrado | `fix(DEF-01)` |
| DEF-02 | Precio negativo o cantidad ≤ 0 no lanzan `RangeError` | RF-04 | Crítica | 2 | CP-13, CP-14, CP-15, CP-16 | Cerrado | `fix(DEF-02)` |
| DEF-03 | Descuento fuera de [0, 100] no lanza `RangeError` | RF-04, RF-02 | Crítica | 3 | CP-17, CP-18 | Cerrado | `fix(DEF-03)` |
| DEF-04 | El total no se redondea a dos decimales | RF-03 | Media | 4 | CP-07, CP-09, CP-10, CP-11 | Cerrado | `fix(DEF-04)` |

---

## DEF-01 · Entradas no numéricas o no finitas no lanzan `TypeError`

| Campo | Detalle |
|---|---|
| Requisito | RF-05 |
| Severidad / Prioridad | Alta / 1 |
| Entorno | Node.js v24.22.1, Jest 30.5.2, Linux x86_64 |
| Pasos para reproducir | 1. `npm install` · 2. `node -e "const {calcularTotal}=require('./src/compras'); console.log(calcularTotal('10',2,0), calcularTotal(10,true,0), calcularTotal(10,1,null), calcularTotal(NaN,1,0))"` · 3. o bien `npm test` (casos CP-19…CP-23b, CP-25) |
| Resultado esperado | `TypeError` en todos los casos |
| Resultado real | Devuelve `20`, `10`, `10` y `NaN` respectivamente; no lanza excepción. La coerción implícita de JavaScript (`'10' * 2 → 20`, `true → 1`, `null → 0`) acepta datos corruptos y `NaN`/`Infinity` se propagan al total. |
| Evidencia | `evidencias/pruebas-iniciales.txt`: «CP-19 · cadena numérica → TypeError … Received function did not throw» (7 fallos) |
| Causa raíz | Ausencia de validación de tipo y finitud de los parámetros. |
| Corrección | Validar cada argumento con `typeof valor === 'number' && Number.isFinite(valor)` antes de cualquier cálculo; si no, `throw new TypeError(...)`. |
| Verificación | Prueba de confirmación: CP-19…CP-25 pasan; regresión: CP-01…CP-12 sin cambios (`evidencias/regresion-DEF-01.txt`). |

## DEF-02 · Precio negativo o cantidad ≤ 0 no lanzan `RangeError`

| Campo | Detalle |
|---|---|
| Requisito | RF-04 |
| Severidad / Prioridad | Crítica / 2 |
| Pasos para reproducir | `node -e "const {calcularTotal}=require('./src/compras'); console.log(calcularTotal(-1,1,0), calcularTotal(10,0,0), calcularTotal(10,-2,0))"` o `npm test` (CP-13…CP-16) |
| Resultado esperado | `RangeError` |
| Resultado real | Devuelve `-1`, `0` y `-20`: totales negativos o nulos que en producción equivaldrían a reembolsos o pedidos vacíos aceptados. |
| Evidencia | `evidencias/pruebas-iniciales.txt`: «CP-14 · precio negativo (-1, 1, 0) → RangeError … Received function did not throw» (4 fallos) |
| Causa raíz | No se validan los rangos `precio ≥ 0` y `cantidad > 0`. |
| Corrección | `if (precio < 0) throw new RangeError(...)`; `if (cantidad <= 0) throw new RangeError(...)`. |
| Verificación | CP-13…CP-16 pasan; CP-12 (precio = 0, límite válido) sigue pasando (`evidencias/regresion-DEF-02.txt`). |

## DEF-03 · Descuento fuera de [0, 100] no lanza `RangeError`

| Campo | Detalle |
|---|---|
| Requisito | RF-04 (y RF-02) |
| Severidad / Prioridad | Crítica / 3 |
| Pasos para reproducir | `node -e "const {calcularTotal}=require('./src/compras'); console.log(calcularTotal(100,1,-0.01), calcularTotal(100,1,100.01))"` o `npm test` (CP-17, CP-18) |
| Resultado esperado | `RangeError` |
| Resultado real | Devuelve `100.01` (un descuento negativo **encarece** la compra) y `-0.010000000000005116` (total negativo). |
| Evidencia | `evidencias/pruebas-iniciales.txt`: «CP-17 · descuento = -0.01 … Received function did not throw» y CP-18 (2 fallos) |
| Causa raíz | No se valida el rango del porcentaje de descuento. |
| Corrección | `if (descuento < 0 || descuento > 100) throw new RangeError(...)`. |
| Verificación | CP-17, CP-18 pasan; los límites válidos CP-05 (0) y CP-08 (100) siguen pasando (`evidencias/regresion-DEF-03.txt`). |

## DEF-04 · El total no se redondea a dos decimales

| Campo | Detalle |
|---|---|
| Requisito | RF-03 |
| Severidad / Prioridad | Media / 4 |
| Pasos para reproducir | `node -e "const {calcularTotal}=require('./src/compras'); console.log(calcularTotal(0.1,3,0), calcularTotal(33.33,3,33), calcularTotal(100,1,99.99))"` o `npm test` (CP-07, CP-09, CP-10, CP-11) |
| Resultado esperado | `0.3`, `66.99`, `0.01` |
| Resultado real | `0.30000000000000004`, `66.9933`, `0.010000000000005116` (artefactos de coma flotante IEEE-754 y más de dos decimales). |
| Evidencia | `evidencias/pruebas-iniciales.txt`: «CP-09 · Expected: 0.3 Received: 0.30000000000000004» (4 fallos) |
| Causa raíz | El resultado se devuelve sin redondear. |
| Corrección | `Math.round((total + Number.EPSILON) * 100) / 100`, normalizando `-0` a `0`. |
| Verificación | CP-07, CP-09…CP-11 pasan; suite completa 26/26 en verde (`evidencias/pruebas-finales.txt`). |

## Observaciones (no defectos, fuera de especificación)

| ID | Observación | Decisión |
|---|---|---|
| OBS-01 | Se aceptan cantidades fraccionarias (p. ej. 1.5). | La especificación no exige enteros; no se cambia el requisito. Se reporta como riesgo residual R-RES-01. |
| OBS-02 | Productos muy grandes (p. ej. `precio = 1e308`, `cantidad = 10`) desbordan a `Infinity`. | Entradas finitas válidas pero resultado no finito; se reporta como riesgo residual R-RES-02. |
