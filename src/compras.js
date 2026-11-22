/**
 * Calcula el total de una compra aplicando un descuento porcentual.
 * @param {number} precio    Precio unitario.
 * @param {number} cantidad  Unidades compradas.
 * @param {number} descuento Porcentaje de descuento.
 * @returns {number} Total.
 */
function validarNumero(valor, nombre) {
  // RF-05 (DEF-01): rechaza cadenas, booleanos, null, undefined, NaN e ±Infinity
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new TypeError(`${nombre} debe ser un número finito`);
  }
}

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

  const subtotal = precio * cantidad;
  const valorDescuento = subtotal * descuento / 100;
  return subtotal - valorDescuento;
}
module.exports = { calcularTotal };
