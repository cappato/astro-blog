#!/bin/bash
# Script para limpiar archivos Zone.Identifier
# Uso: ./clean-zone-identifiers.sh [directorio]

DIR="${1:-.}"

echo "🧹 Limpiando archivos Zone.Identifier en: $DIR"

# Contar archivos antes de eliminar
count=$(find "$DIR" -name "*:Zone.Identifier" -type f | wc -l)

if [ "$count" -eq 0 ]; then
    echo "✅ No se encontraron archivos Zone.Identifier"
    exit 0
fi

echo "📁 Encontrados $count archivos Zone.Identifier"

# Eliminar archivos
find "$DIR" -name "*:Zone.Identifier" -type f -delete

echo "✅ Limpieza completada. $count archivos eliminados."
