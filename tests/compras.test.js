/**
 * Pruebas de componente para calcularTotal (src/compras.js).
 * Cada prueba lleva el ID del caso de docs/matriz-casos.md para mantener la
 * trazabilidad requisito → caso → prueba automatizada.
 * Datos en el orden (precio, cantidad, descuento).
 */
const { calcularTotal } = require('../src/compras');

describe('RF-01 · Subtotal = precio × cantidad (partición válida)', () => {
  test('CP-01 · (10, 2, 0) → 20', () => {
    expect(calcularTotal(10, 2, 0)).toBe(20);
  });

  test('CP-02 · (19.99, 3, 0) → 59.97 (precio con decimales)', () => {
    expect(calcularTotal(19.99, 3, 0)).toBe(59.97);
  });

  test('CP-03 · AVL cantidad mínima válida (25.5, 1, 0) → 25.5', () => {
    expect(calcularTotal(25.5, 1, 0)).toBe(25.5);
  });
});

describe('RF-02 · Descuento porcentual de 0 a 100 %', () => {
  test('CP-04 · descuento intermedio (100, 1, 15) → 85', () => {
    expect(calcularTotal(100, 1, 15)).toBe(85);
  });

  test.each([
    ['CP-05', 50, 2, 0, 100],
    ['CP-06', 100, 1, 0.01, 99.99],
    ['CP-07', 100, 1, 99.99, 0.01],
    ['CP-08', 50, 2, 100, 0],
  ])('%s · AVL descuento (%p, %p, %p) → %p', (_id, precio, cantidad, descuento, esperado) => {
    expect(calcularTotal(precio, cantidad, descuento)).toBe(esperado);
  });
});

describe('RF-03 · Total con dos decimales', () => {
  test.each([
    ['CP-09', 0.1, 3, 0, 0.3],
    ['CP-10', 33.33, 3, 33, 66.99],
    ['CP-11', 1.1, 3, 0, 3.3],
  ])('%s · (%p, %p, %p) → %p', (_id, precio, cantidad, descuento, esperado) => {
    expect(calcularTotal(precio, cantidad, descuento)).toBe(esperado);
  });

  test('CP-08b · descuento 100 % produce exactamente 0 (no -0)', () => {
    expect(Object.is(calcularTotal(19.99, 7, 100), 0)).toBe(true);
  });
});

describe('RF-04 · RangeError para valores fuera de rango', () => {
  test('CP-12 · AVL precio = 0 es válido (0, 5, 10) → 0', () => {
    expect(calcularTotal(0, 5, 10)).toBe(0);
  });

  test.each([
    ['CP-13', 'precio = -0.01', -0.01, 1, 0],
    ['CP-14', 'precio negativo', -1, 1, 0],
    ['CP-15', 'cantidad = 0', 10, 0, 0],
    ['CP-16', 'cantidad negativa', 10, -2, 0],
    ['CP-17', 'descuento = -0.01', 100, 1, -0.01],
    ['CP-18', 'descuento = 100.01', 100, 1, 100.01],
  ])('%s · %s (%p, %p, %p) → RangeError', (_id, _desc, precio, cantidad, descuento) => {
    expect(() => calcularTotal(precio, cantidad, descuento)).toThrow(RangeError);
  });
});

describe('RF-05 · TypeError para entradas no numéricas o no finitas', () => {
  test.each([
    ['CP-19', 'cadena numérica', '10', 2, 0],
    ['CP-20', 'NaN', NaN, 1, 0],
    ['CP-21', 'Infinity', Infinity, 1, 0],
    ['CP-22', 'booleano', 10, true, 0],
    ['CP-23a', 'null', 10, 1, null],
    ['CP-23b', 'undefined', 10, 1, undefined],
    ['CP-25', 'cadena negativa (tipo antes que rango)', '-5', 1, 0],
  ])('%s · %s → TypeError', (_id, _desc, precio, cantidad, descuento) => {
    expect(() => calcularTotal(precio, cantidad, descuento)).toThrow(TypeError);
  });
});

/**
 * Suite de regresión añadida tras las correcciones DEF-01..DEF-04.
 * Protege las correcciones frente a cambios futuros (ISTQB CTFL v4.0.1 §2.2.3)
 * y ejercita combinaciones no cubiertas por los casos originales.
 */
describe('Regresión · tras correcciones DEF-01..DEF-04', () => {
  test.each([
    ['RG-01', 'redondeo half-up de 1.005', 1.005, 1, 0, 1.01],
    ['RG-02', 'redondeo half-up de 2.675', 2.675, 1, 0, 2.68],
    ['RG-03', 'combinación decimales + descuento', 19.99, 3, 10, 53.97],
  ])('%s · %s (%p, %p, %p) → %p', (_id, _desc, precio, cantidad, descuento, esperado) => {
    expect(calcularTotal(precio, cantidad, descuento)).toBe(esperado);
  });

  test('RG-04 · el TypeError identifica el parámetro inválido (DEF-01)', () => {
    expect(() => calcularTotal(10, 1, '5')).toThrow(/descuento/);
  });

  test('RG-05 · el RangeError identifica el parámetro inválido (DEF-02)', () => {
    expect(() => calcularTotal(10, 0, 0)).toThrow(/cantidad/);
  });

  test('RG-06 · precio 0 con descuento 100 % devuelve 0 y no -0 (DEF-04)', () => {
    expect(Object.is(calcularTotal(0, 1, 100), 0)).toBe(true);
  });

  test('RG-07 · función determinista: 1000 invocaciones iguales dan el mismo resultado', () => {
    const resultados = new Set();
    for (let i = 0; i < 1000; i++) resultados.add(calcularTotal(33.33, 3, 33));
    expect([...resultados]).toEqual([66.99]);
  });
});
