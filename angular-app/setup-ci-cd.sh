#!/bin/bash

# 🚀 Script de configuración CI/CD para Angular AI Ecommerce Chat
# Este script te ayuda a configurar deployment automático y versionado

echo "🚀 Configurando CI/CD Automático..."
echo ""

# Configurar template de commits
echo "📝 Configurando template de conventional commits..."
git config commit.template .gitmessage
echo "✅ Template de commits configurado"
echo ""

# Información sobre tokens de Vercel
echo "🔑 CONFIGURACIÓN DE TOKENS DE VERCEL:"
echo ""
echo "Para configurar deployment automático necesitas obtener:"
echo ""
echo "1. VERCEL_TOKEN:"
echo "   - Ve a: https://vercel.com/account/tokens"
echo "   - Crea un nuevo token"
echo "   - Cópialo (solo se muestra una vez)"
echo ""
echo "2. VERCEL_ORG_ID y VERCEL_PROJECT_ID:"
echo "   - Ve a tu proyecto en Vercel"
echo "   - Settings > General"
echo "   - Encontrarás ambos IDs ahí"
echo ""

# Información sobre GitHub Secrets
echo "🔐 CONFIGURACIÓN DE GITHUB SECRETS:"
echo ""
echo "Ve a tu repositorio en GitHub:"
echo "Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Crea estos secrets:"
echo "- VERCEL_TOKEN (el token que obtuviste)"
echo "- VERCEL_ORG_ID (del dashboard de Vercel)"
echo "- VERCEL_PROJECT_ID (del dashboard de Vercel)"
echo ""

# Información sobre versionado automático
echo "🔖 SISTEMA DE VERSIONADO AUTOMÁTICO:"
echo ""
echo "El sistema detecta automáticamente el tipo de versión basado en tu commit:"
echo ""
echo "📦 PATCH (1.0.X) - Para:"
echo "   - fix: bug fixes"
echo "   - docs: documentación"
echo "   - style: formateo"
echo "   - refactor: refactoring"
echo "   - test: tests"
echo "   - chore: mantenimiento"
echo ""
echo "🚀 MINOR (1.X.0) - Para:"
echo "   - feat: nuevas funcionalidades"
echo "   - Add: agregar características"
echo ""
echo "💥 MAJOR (X.0.0) - Para:"
echo "   - BREAKING CHANGE: cambios que rompen compatibilidad"
echo "   - feat!: features con breaking changes"
echo ""

echo "📋 EJEMPLOS DE COMMITS:"
echo ""
echo "feat(chat): add voice recognition"
echo "fix(api): resolve timeout issues"
echo "docs: update deployment guide"
echo "feat!: change authentication system"
echo "chore: update dependencies"
echo ""

echo "🎯 PRÓXIMOS PASOS:"
echo ""
echo "1. Configura los GitHub Secrets (URLs arriba)"
echo "2. Haz un commit usando conventional commits:"
echo "   git commit -m 'feat(ci): add automatic deployment'"
echo "3. Push a main:"
echo "   git push origin main"
echo "4. ¡Verifica que funcione en GitHub Actions!"
echo ""

# Configurar algunos git hooks útiles
echo "🪝 Configurando git hooks..."
mkdir -p .git/hooks

# Hook para validar mensaje de commit
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Commit message inválido!"
    echo ""
    echo "Formato esperado: type(scope): description"
    echo "Ejemplos:"
    echo "  feat(chat): add voice recognition"
    echo "  fix(api): resolve timeout issues"
    echo "  docs: update README"
    echo ""
    echo "Types válidos: feat, fix, docs, style, refactor, test, chore, perf, ci, revert"
    exit 1
fi
EOF

chmod +x .git/hooks/commit-msg
echo "✅ Hook de validación de commits configurado"
echo ""

echo "🎉 ¡Configuración completada!"
echo ""
echo "💡 Tip: Usa 'git commit' (sin -m) para abrir el template de commits"
echo ""
