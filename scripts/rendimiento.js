/**
 * RNF-01 · Medición exploratoria de rendimiento de calcularTotal.
 * Uso: npm run perf   (o: node scripts/rendimiento.js [iteraciones] [repeticiones])
 *
 * Método: calentamiento del JIT, N repeticiones de M llamadas, tiempo con
 * process.hrtime.bigint(); se reportan mediana, mínimo, máximo y p95 por llamada.
 * Se compara con la versión inicial (sin validaciones) para estimar el costo
 * de las correcciones, y se mide aparte el camino de error (excepciones).
 * Es una medición EXPLORATORIA (no es una prueba de carga): ver limitaciones.
 */
const os = require('os');
const { calcularTotal } = require('../src/compras');

// Versión inicial (línea base, código entregado con defectos) solo para comparar.
function calcularTotalInicial(precio, cantidad, descuento) {
  const subtotal = precio * cantidad;
  const valorDescuento = subtotal * descuento / 100;
  return subtotal - valorDescuento;
}

const ITER = Number(process.argv[2]) || 1_000_000;
const REPS = Number(process.argv[3]) || 5;

// Datos deterministas (sin Math.random) para reproducibilidad.
const datos = Array.from({ length: 1000 }, (_, i) => [
  (i % 500) + 0.99, (i % 10) + 1, i % 101,
]);

function medir(fn, iter) {
  let sink = 0; // evita eliminación de código muerto
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iter; i++) {
    const d = datos[i % 1000];
    sink += fn(d[0], d[1], d[2]);
  }
  const ns = Number(process.hrtime.bigint() - t0);
  if (Number.isNaN(sink)) throw new Error('resultado inesperado');
  return ns / iter;
}

function medirErrores(iter) {
  const t0 = process.hrtime.bigint();
  let errores = 0;
  for (let i = 0; i < iter; i++) {
    try { calcularTotal(-1, 1, 0); } catch (e) { errores++; }
  }
  return { nsPorLlamada: Number(process.hrtime.bigint() - t0) / iter, errores };
}

function estadisticas(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const p = (q) => s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)];
  return { mediana: p(0.5), min: s[0], max: s[s.length - 1], p95: p(0.95) };
}

const fmt = (n) => n.toFixed(1).padStart(8);

console.log('=== RNF-01 · Medición exploratoria de rendimiento ===');
console.log(`Fecha:        ${new Date().toISOString()}`);
console.log(`Node.js:      ${process.version} (V8 ${process.versions.v8})`);
console.log(`SO:           ${os.type()} ${os.release()} ${os.arch()}`);
console.log(`CPU:          ${os.cpus()[0].model} × ${os.cpus().length} núcleos lógicos`);
console.log(`Memoria:      ${(os.totalmem() / 2 ** 30).toFixed(1)} GiB`);
console.log(`Parámetros:   ${ITER.toLocaleString('es')} llamadas × ${REPS} repeticiones (+1 calentamiento)`);
console.log('');

// Calentamiento (optimización JIT)
medir(calcularTotal, ITER); medir(calcularTotalInicial, ITER);

const corr = [], ini = [];
for (let r = 0; r < REPS; r++) {
  corr.push(medir(calcularTotal, ITER));
  ini.push(medir(calcularTotalInicial, ITER));
}
const ec = estadisticas(corr), ei = estadisticas(ini);
console.log('ns por llamada         mediana       min       max       p95');
console.log(`Versión corregida   ${fmt(ec.mediana)}  ${fmt(ec.min)}  ${fmt(ec.max)}  ${fmt(ec.p95)}`);
console.log(`Versión inicial     ${fmt(ei.mediana)}  ${fmt(ei.min)}  ${fmt(ei.max)}  ${fmt(ei.p95)}`);
console.log(`Sobrecosto de validación + redondeo (mediana): ${(ec.mediana - ei.mediana).toFixed(1)} ns/llamada`);
console.log(`Throughput versión corregida (mediana): ${(1e9 / ec.mediana / 1e6).toFixed(1)} millones de llamadas/s`);

const err = medirErrores(Math.max(10_000, Math.floor(ITER / 10)));
console.log(`Camino de error (RangeError): ${err.nsPorLlamada.toFixed(1)} ns/llamada (${err.errores.toLocaleString('es')} excepciones)`);
console.log('');
const umbral = 1000; // 1 µs: referencia exploratoria, NO es un requisito
console.log(`Referencia exploratoria CP-24 (< ${umbral} ns/llamada): ${ec.mediana < umbral ? 'CUMPLE' : 'NO CUMPLE'}`);
console.log('Limitaciones: microbenchmark en un solo proceso; influyen el JIT de V8, el GC,');
console.log('la carga de la máquina y la frecuencia de CPU. No mide concurrencia ni latencia de red.');
