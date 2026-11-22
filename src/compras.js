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

  const subtotal = precio * cantidad;
  const valorDescuento = subtotal * descuento / 100;
  return subtotal - valorDescuento;
}
module.exports = { calcularTotal };
