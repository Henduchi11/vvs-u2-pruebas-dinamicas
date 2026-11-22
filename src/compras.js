function validarNumero(valor, nombre) {
  // RF-05 (DEF-01): rechaza cadenas, booleanos, null, undefined, NaN e ±Infinity
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new TypeError(`${nombre} debe ser un número finito`);
  }
}

/**
 * Calcula el total de una compra aplicando un descuento porcentual.
 * @param {number} precio    Precio unitario.
 * @param {number} cantidad  Unidades compradas.
 * @param {number} descuento Porcentaje de descuento.
 * @returns {number} Total redondeado a dos decimales.
 * @throws {TypeError}  Si alguna entrada no es un número finito (RF-05).
 * @throws {RangeError} Si precio < 0, cantidad <= 0 o descuento fuera de [0, 100] (RF-04).
 */
function calcularTotal(precio, cantidad, descuento) {
  validarNumero(precio, 'precio');
  validarNumero(cantidad, 'cantidad');
  validarNumero(descuento, 'descuento');

  // RF-04 (DEF-02): precio negativo o cantidad <= 0 fuera de rango
  if (precio < 0) {
    throw new RangeError('precio no puede ser negativo');
  }
  if (cantidad <= 0) {
    throw new RangeError('cantidad debe ser mayor que 0');
  }
  // RF-04 / RF-02 (DEF-03): descuento debe estar en [0, 100]
  if (descuento < 0 || descuento > 100) {
    throw new RangeError('descuento debe estar entre 0 y 100');
  }

  const subtotal = precio * cantidad;
  const valorDescuento = subtotal * descuento / 100;
  const total = subtotal - valorDescuento;

  // RF-03 (DEF-04): redondeo a dos decimales; "+ 0" normaliza -0 a 0
  return Math.round((total + Number.EPSILON) * 100) / 100 + 0;
}
module.exports = { calcularTotal };
