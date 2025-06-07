#!/bin/bash

# Script para instalar git hooks personalizados
# Configura hooks que previenen push directo a main

echo "🔧 Instalando Git Hooks personalizados..."

# Crear directorio de hooks si no existe
mkdir -p .git/hooks

# Copiar pre-push hook
if [ -f ".githooks/pre-push" ]; then
    cp .githooks/pre-push .git/hooks/pre-push
    chmod +x .git/hooks/pre-push
    echo "✅ Pre-push hook instalado"
else
    echo "❌ Error: .githooks/pre-push no encontrado"
    exit 1
fi

# Configurar Git para usar directorio de hooks personalizado
git config core.hooksPath .githooks

echo ""
echo "🎉 Git hooks instalados exitosamente!"
echo ""
echo "📋 Hooks activos:"
echo "   • pre-push: Previene push directo a main"
echo ""
echo "🔧 Para desinstalar: git config --unset core.hooksPath"
echo "🚨 Para saltear (emergencias): git push --no-verify"
