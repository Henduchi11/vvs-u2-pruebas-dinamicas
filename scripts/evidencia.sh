#!/usr/bin/env bash
# Uso: bash scripts/evidencia.sh <archivo-salida> [args extra de jest]
# Ejecuta la suite y guarda la salida con cabecera de trazabilidad (fecha, commit, entorno).
out="$1"; shift
{
  echo "=== Evidencia de ejecución de pruebas ==="
  echo "Fecha:   $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "Objeto:  src/compras.js sha256=$(sha256sum src/compras.js | cut -c1-12) (rama $(git rev-parse --abbrev-ref HEAD 2>/dev/null), base $(git rev-parse --short HEAD 2>/dev/null))"
  echo "Node.js: $(node -v) | npm: $(npm -v) | Jest: $(npx jest --version)"
  echo "SO:      $(uname -sm)"
  echo "Comando: npm test $*"
  echo "========================================="
  echo
  npm test -- "$@" 2>&1
  rc=$?
  echo
  echo "Código de salida de npm test: $rc"
} > "$out"
# Código de salida real de jest
grep -q "Tests:.*failed" "$out" && exit 1 || exit 0
