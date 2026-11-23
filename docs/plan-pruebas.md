# Plan de pruebas — Módulo `calcularTotal` (src/compras.js)

> Plan elaborado siguiendo la estructura de plan de pruebas de ISO/IEC/IEEE 29119-3:2021 (cláusula *Test Plan*) y el proceso de gestión de pruebas de ISO/IEC/IEEE 29119-2:2021. Terminología según ISTQB CTFL v4.0.1.

| Campo | Valor |
|---|---|
| Identificador | PP-VVS-U2-01 |
| Versión | 1.0 |
| Autor | Henry Geovanny Duchi |
| Objeto de prueba | `calcularTotal(precio, cantidad, descuento)` en `src/compras.js` |
| Base de prueba | Especificación RF-01 … RF-05 y RNF-01 del enunciado (Unidad 2) |

## 1. Contexto y base de prueba

Una tienda digital entrega un módulo de cálculo de compras con defectos intencionales. La base de prueba (ISTQB CTFL v4.0.1, §1.4.1) es la especificación:

| ID | Requisito |
|---|---|
| RF-01 | `subtotal = precio × cantidad` para números positivos. |
| RF-02 | El descuento es un porcentaje de 0 a 100 % (ambos incluidos). |
| RF-03 | El total se devuelve con dos decimales; un descuento de 100 % produce 0. |
| RF-04 | Lanzar `RangeError` si el precio es negativo, la cantidad es ≤ 0 o el descuento está fuera de [0, 100]. |
| RF-05 | Lanzar `TypeError` si alguna entrada no es numérica o no es finita (`NaN`, `±Infinity`, cadenas, `null`, `undefined`, booleanos…). |
| RNF-01 | Exploración limitada de rendimiento (eficiencia de desempeño – comportamiento temporal, ISO/IEC 25010:2023). |

**Interpretaciones documentadas** (no modifican los requisitos, aclaran ambigüedades):
- *Precio 0*: RF-04 solo prohíbe precio **negativo**, por lo que `precio = 0` es un valor límite válido (total 0).
- *Cantidad fraccionaria* (p. ej. 1.5): la especificación no exige cantidad entera; se acepta y se registra como riesgo residual / pregunta al negocio.
- *Orden de validación*: primero tipo (RF-05) y luego rango (RF-04); así `'-5'` produce `TypeError` y no `RangeError`.
- *Dos decimales*: el valor devuelto es un `number` redondeado a 2 decimales (redondeo aritmético "half-up"), no una cadena.

## 2. Alcance

**Dentro del alcance**
- Pruebas funcionales de caja negra de la función `calcularTotal` (RF-01 … RF-05).
- Pruebas de valores límite del descuento, precio y cantidad.
- Pruebas de manejo de errores (tipo y clase de excepción).
- Medición exploratoria de tiempo de respuesta (RNF-01).
- Pruebas de regresión tras cada corrección.
- Cobertura estructural (sentencias / ramas) como criterio de salida complementario.

**Fuera del alcance**
- Integración con carrito, pasarela de pago, impuestos (IVA) o monedas.
- Pruebas de carga/estrés con concurrencia real, seguridad y usabilidad.
- Cambios de requisitos: las correcciones se limitan a hacer que el código cumpla la especificación existente.

## 3. Riesgos de producto y de proyecto (pruebas basadas en riesgo)

Análisis de riesgo según ISTQB CTFL v4.0.1 §5.2 (probabilidad × impacto, escala 1–3).

| ID | Riesgo | Tipo | Prob. | Impacto | Nivel | Mitigación |
|---|---|---|---|---|---|---|
| R-01 | Totales negativos por precio/cantidad inválidos (cobro o reembolso erróneo) | Producto | 3 | 3 | **9** | Casos de límite y error RF-04, prioridad Alta |
| R-02 | Descuento > 100 % o < 0 % altera el total (pérdida económica) | Producto | 3 | 3 | **9** | Valores límite 0/100 y vecinos ±0,01 |
| R-03 | Coerción implícita de JavaScript (`'10' * 2 = 20`, `true = 1`, `null = 0`) acepta datos corruptos | Producto | 3 | 2 | **6** | Partición de inválidos por tipo (RF-05) |
| R-04 | Errores de coma flotante IEEE-754 (`0.1*3 = 0.30000000000000004`) | Producto | 3 | 2 | **6** | Casos de redondeo RF-03 con decimales |
| R-05 | Corrección de un defecto introduce otro (regresión) | Proyecto/Producto | 2 | 3 | **6** | Suite completa en cada commit (`npm test`) |
| R-06 | Especificación ambigua (precio 0, cantidad fraccionaria, modo de redondeo) | Proyecto | 2 | 2 | 4 | Interpretaciones documentadas en §1 |
| R-07 | Mediciones de rendimiento no representativas (JIT, máquina compartida) | Proyecto | 2 | 1 | 2 | Calentamiento, repeticiones, mediana y p95 |

## 4. Enfoque: tipos, niveles y técnicas

| Aspecto | Decisión | Justificación |
|---|---|---|
| Nivel de prueba | Prueba de componente (unitaria) | El objeto es una función aislada sin dependencias (CTFL §2.2.1). |
| Tipos de prueba | Funcional; no funcional (rendimiento exploratorio); de confirmación y regresión | CTFL §2.2.2 y §2.2.3. |
| Técnicas de caja negra | Partición de equivalencia (PE), análisis de valores límite de 2 valores (AVL), pruebas de entradas inválidas / adivinación de errores | Las entradas son rangos numéricos con fronteras explícitas (0, 100, ≤ 0) — CTFL §4.2.1, §4.2.2, §4.4.1. |
| Técnica de caja blanca | Cobertura de sentencias y ramas medida con `jest --coverage` | Evidencia complementaria de completitud (CTFL §4.3). |
| Técnica basada en experiencia | Adivinación de errores sobre coerción de tipos y coma flotante en JavaScript | Defectos típicos del lenguaje (CTFL §4.4.1). |
| Automatización | Jest 30, `jest --runInBand` | Ejecución determinista y repetible. |

### Particiones de equivalencia identificadas

| Variable | Partición válida | Particiones inválidas |
|---|---|---|
| precio | `[0, +∞)` finito | `< 0` (RangeError); no número / no finito (TypeError) |
| cantidad | `(0, +∞)` finito | `≤ 0` (RangeError); no número / no finito (TypeError) |
| descuento | `[0, 100]` | `< 0`, `> 100` (RangeError); no número / no finito (TypeError) |

### Valores límite (AVL de 2 valores, paso 0,01)

| Variable | Límites a probar |
|---|---|
| precio | −0,01 (inválido) · 0 (válido) |
| cantidad | 0 (inválido) · 1 (válido; además cantidad negativa −2) |
| descuento | −0,01 · 0 · 0,01 · 99,99 · 100 · 100,01 |

## 5. Ambiente de pruebas

| Elemento | Valor |
|---|---|
| Sistema operativo | Linux x86-64 (contenedor) |
| Runtime | Node.js v24.x |
| Framework | Jest 30.x (devDependency, fijado en `package-lock.json`) |
| Control de versiones | Git + GitHub (repositorio público) |
| Comando | `npm test` → `jest --runInBand`; `npm run coverage`; `npm run perf` |

## 6. Criterios de entrada y de salida

**Criterios de entrada**
1. Especificación RF-01…RF-05 y RNF-01 disponible y revisada.
2. Código inicial `src/compras.js` versionado en Git (línea base).
3. Node.js y Jest instalados; `npm test` ejecutable.
4. Matriz de casos (`docs/matriz-casos.md`) revisada con trazabilidad a requisitos.

**Criterios de salida**
1. 100 % de los casos de prioridad Alta y Media ejecutados.
2. 100 % de las pruebas automatizadas pasan en la ejecución final (`evidencias/pruebas-finales.txt`).
3. Cada requisito RF-01…RF-05 cubierto por al menos 2 casos; RNF-01 medido.
4. Cobertura de sentencias y ramas de `src/compras.js` ≥ 90 %.
5. Todos los defectos de severidad Alta/Crítica corregidos y verificados (prueba de confirmación).
6. Riesgos residuales documentados en `docs/reporte-pruebas.md`.

## 7. Actividades y entregables (ISO/IEC/IEEE 29119-2)

| Proceso 29119-2 | Actividad | Entregable |
|---|---|---|
| Planificación | Definir alcance, riesgos, enfoque | `docs/plan-pruebas.md` |
| Diseño e implementación | Derivar condiciones y casos; automatizar | `docs/matriz-casos.md`, `tests/compras.test.js` |
| Ejecución | Ejecutar sobre código inicial | `evidencias/pruebas-iniciales.txt` |
| Reporte de incidentes | Registrar defectos | `docs/defectos.md` |
| Corrección + confirmación/regresión | Corregir incrementalmente y re-ejecutar | commits `fix(DEF-xx)`, `evidencias/pruebas-finales.txt` |
| Monitoreo y cierre | Rendimiento exploratorio, informe final | `evidencias/rendimiento.txt`, `docs/reporte-pruebas.md` |

## 8. Roles

| Rol | Responsable |
|---|---|
| Analista / diseñador de pruebas | Henry Geovanny Duchi |
| Automatizador y ejecutor | Henry Geovanny Duchi |
| Desarrollador (corrección) | Henry Geovanny Duchi |
