# VVS U2 · Laboratorio de pruebas dinámicas con Jest

- **Asignatura:** Verificación y Validación de Software — Unidad 2: Evaluación dinámica
- **Autor:** Henry Geovanny Duchi
- **Universidad:** Universidad Politécnica Salesiana — sede Cuenca
- **Informe:** `Duchi_Henry_VVS_U2.pdf` (entregado en el aula virtual)

Laboratorio de pruebas dinámicas sobre el módulo `src/compras.js` de una tienda digital, entregado con defectos intencionales: planificación, diseño de casos (particiones de equivalencia, valores límite, entradas inválidas), automatización con Jest, gestión de defectos, corrección incremental con regresión y medición exploratoria de rendimiento.

[![Pruebas Jest](https://github.com/Henduchi11/vvs-u2-pruebas-dinamicas/actions/workflows/pruebas.yml/badge.svg)](https://github.com/Henduchi11/vvs-u2-pruebas-dinamicas/actions/workflows/pruebas.yml) ![tests](https://img.shields.io/badge/tests-33%2F33%20passing-brightgreen) ![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) ![defects](https://img.shields.io/badge/defectos-4%20cerrados-blue)

## Especificación (base de prueba)

| ID | Requisito |
|---|---|
| RF-01 | `subtotal = precio × cantidad` para números positivos |
| RF-02 | Descuento de 0 a 100 % |
| RF-03 | Total con dos decimales (100 % produce 0) |
| RF-04 | `RangeError` para precio negativo, cantidad ≤ 0 o descuento fuera de rango |
| RF-05 | `TypeError` para entradas no numéricas o no finitas |
| RNF-01 | Exploración limitada de rendimiento |

## Estructura

```
├── src/compras.js              # Módulo bajo prueba (versión corregida)
├── tests/compras.test.js       # 33 pruebas Jest (CP-01..CP-25 y RG-01..RG-07)
├── docs/
│   ├── plan-pruebas.md         # Fase A: alcance, riesgos, técnicas, ambiente, criterios
│   ├── matriz-casos.md         # Fase A: 25 casos + 7 de regresión con trazabilidad
│   ├── defectos.md             # Fase C: DEF-01..DEF-04
│   └── reporte-pruebas.md      # Fase D: resultados, cobertura, rendimiento, riesgos
├── evidencias/
│   ├── pruebas-iniciales.txt   # Código inicial: 17 de 26 pruebas fallan
│   ├── regresion-DEF-0X.txt    # Re-ejecución tras cada corrección
│   ├── pruebas-finales.txt     # 33/33 en verde + cobertura 100 %
│   └── rendimiento.txt         # Medición RNF-01
├── scripts/
│   ├── evidencia.sh            # Ejecuta la suite y guarda evidencia con entorno
│   └── rendimiento.js          # Benchmark exploratorio reproducible
├── .github/workflows/pruebas.yml  # Integración continua (Node 20/22/24)
├── package.json
└── package-lock.json
```

## Cómo ejecutar

Requisitos: Node.js ≥ 18 (probado con v24.22.1) y npm.

```bash
git clone https://github.com/Henduchi11/vvs-u2-pruebas-dinamicas.git
cd vvs-u2-pruebas-dinamicas
npm ci                 # instala Jest exactamente según package-lock.json
npm test               # jest --runInBand
npm run coverage       # pruebas + informe de cobertura
npm run perf           # medición exploratoria de rendimiento (RNF-01)
bash scripts/evidencia.sh evidencias/mi-ejecucion.txt   # regenerar evidencia
```

Para reproducir los **fallos iniciales**: `git checkout d539522 && npm ci && npm test` (17 fallos esperados); volver con `git checkout main`.

## Resultados

| Ejecución | Pruebas | Pasan | Fallan |
|---|---|---|---|
| Código inicial | 26 | 9 | 17 |
| Tras DEF-01 / DEF-02 / DEF-03 | 26 | 16 / 20 / 22 | 10 / 6 / 4 |
| Tras DEF-04 | 26 | 26 | 0 |
| Final con regresión | 33 | 33 | 0 |

Cobertura final: **100 %** sentencias (16/16), ramas (12/12), funciones (2/2) y líneas.

### Defectos

| ID | Requisito | Severidad | Corrección |
|---|---|---|---|
| DEF-01 | RF-05 | Alta | Validación `typeof === 'number'` y `Number.isFinite` |
| DEF-02 | RF-04 | Crítica | `RangeError` si precio < 0 o cantidad ≤ 0 |
| DEF-03 | RF-04 | Crítica | `RangeError` si descuento ∉ [0, 100] |
| DEF-04 | RF-03 | Media | Redondeo a 2 decimales con `Math.round` + `Number.EPSILON` |

### Rendimiento (exploratorio)

≈ 21 ns por llamada (≈ 47 M llamadas/s) en la versión corregida frente a ≈ 12 ns en la inicial; el camino de error cuesta ≈ 2,8 µs por la traza de pila. Ver limitaciones en `docs/reporte-pruebas.md` §4.

## Historial de commits (una fase / una corrección por commit)

1. Fase A — código inicial, plan y matriz de casos
2. Fase B — Node.js/Jest, pruebas automatizadas y evidencia inicial
3. Fase C — registro de defectos
4. `fix(DEF-01)` … 7. `fix(DEF-04)` — correcciones incrementales con regresión
8. Regresión — casos RG y evidencia final con cobertura
9. Fase D — rendimiento y reporte final
10. README
11. CI — GitHub Actions ejecuta `npm ci` + `npm run coverage` en Node 20/22/24 en cada push

## Referencias

- ISTQB (2024). *Certified Tester Foundation Level Syllabus*, v4.0.1.
- ISO/IEC/IEEE 29119-2:2021, 29119-3:2021 y 29119-4:2021. *Software and systems engineering — Software testing*.
- ISO/IEC 25010:2023. *Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*.
