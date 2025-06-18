#!/bin/bash

# Script para commit rápido con actualización de versión
# Uso: ./quick-commit.sh "mensaje del commit"

if [ $# -eq 0 ]; then
    echo "❌ Error: Necesitas proporcionar un mensaje de commit"
    echo "📝 Uso: ./quick-commit.sh \"mensaje del commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "🚀 Iniciando commit rápido..."
echo "📝 Mensaje: $COMMIT_MESSAGE"

# 1. Agregar todos los archivos
echo "📁 Agregando archivos..."
git add .

# 2. Hacer commit
echo "💾 Haciendo commit..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Error en el commit"
    exit 1
fi

# 3. Actualizar versión (patch)
echo "🔄 Actualizando versión..."
npm run version:patch

if [ $? -ne 0 ]; then
    echo "❌ Error actualizando versión"
    exit 1
fi

echo "✅ ¡Listo! Commit, versión actualizada y pusheado exitosamente 🎉"
