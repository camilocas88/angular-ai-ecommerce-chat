# 🚀 Guía de Deployment Automático y Versionado

## 📋 Resumen

Este proyecto incluye **CI/CD automático** que:
- ✅ **Versiona automáticamente** basado en conventional commits
- ✅ **Despliega automáticamente** en cada push a `main`
- ✅ **Crea tags** de Git automáticamente
- ✅ **Valida commits** con git hooks

## 🛠️ Configuración Inicial

### **Paso 1: Ejecutar script de configuración**

```bash
# Dale permisos y ejecuta
chmod +x setup-ci-cd.sh
./setup-ci-cd.sh
```

### **Paso 2: Obtener tokens de Vercel**

#### **2.1 VERCEL_TOKEN**
1. Ve a [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Clic en **"Create Token"**
3. Nombre: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. **Copia el token** (solo se muestra una vez)

#### **2.2 VERCEL_ORG_ID y VERCEL_PROJECT_ID**
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** > **General**
3. Encuentra:
   - **Team ID** = `VERCEL_ORG_ID`
   - **Project ID** = `VERCEL_PROJECT_ID`

### **Paso 3: Configurar GitHub Secrets**

1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Clic en **"New repository secret"**
4. Crea estos 3 secrets:

| Secret Name | Valor |
|-------------|-------|
| `VERCEL_TOKEN` | Token de Vercel (paso 2.1) |
| `VERCEL_ORG_ID` | Team ID de Vercel (paso 2.2) |
| `VERCEL_PROJECT_ID` | Project ID de Vercel (paso 2.2) |

## 🔖 Sistema de Versionado Automático

### **Conventional Commits**

El versionado se basa en el **formato del commit message**:

```
<type>(<scope>): <description>
```

### **Tipos de Versión**

| Commit Type | Versión | Ejemplo |
|------------|---------|---------|
| `fix:`, `docs:`, `style:`, `chore:` | **PATCH** (1.0.X) | `fix(api): resolve timeout` |
| `feat:`, `Add:` | **MINOR** (1.X.0) | `feat(chat): add voice recognition` |
| `BREAKING CHANGE`, `feat!:` | **MAJOR** (X.0.0) | `feat!: change auth system` |

### **Ejemplos de Commits**

```bash
# 📦 PATCH (bug fixes, docs, etc.)
git commit -m "fix(api): resolve 404 errors"
git commit -m "docs: update README"
git commit -m "chore: update dependencies"

# 🚀 MINOR (new features)
git commit -m "feat(chat): add bilingual support"
git commit -m "feat(ui): add dark mode"

# 💥 MAJOR (breaking changes)
git commit -m "feat!: change API response format"
git commit -m "refactor!: restructure database schema"
```

## 🔄 Flujo de Trabajo

### **1. Desarrollo Local**
```bash
# Hacer cambios
git add .
git commit -m "feat(chat): add voice recognition"
```

### **2. Push a Main**
```bash
git push origin main
```

### **3. GitHub Actions Automático**
1. ✅ **Build** y **test** del proyecto
2. 🔖 **Version bump** automático basado en commit
3. 📝 **Commit** de nueva versión + **tag**
4. 🚀 **Deploy** automático a Vercel
5. 📱 **Notificación** de deployment exitoso

### **4. Resultado**
- Nueva versión en `package.json`
- Nuevo tag en GitHub (ej: `v1.2.3`)
- Aplicación desplegada automáticamente
- URL de producción actualizada

## 📊 Monitoreo

### **GitHub Actions**
- Ve a: **Actions** tab en tu repositorio
- Monitorea el progreso de cada deployment
- Revisa logs si hay errores

### **Vercel Dashboard**
- Ve el status de deployments
- Revisa logs de build
- Monitorea performance

## 🛡️ Validaciones Automáticas

### **Git Hook (commit-msg)**
Valida que tus commits sigan conventional commits:

```bash
# ✅ Válido
git commit -m "feat(api): add user authentication"

# ❌ Inválido (rechazado automáticamente)
git commit -m "added some stuff"
```

### **GitHub Actions Checks**
- Build exitoso antes de deploy
- Tests automáticos (si están configurados)
- Validation de dependency vulnerabilities

## 🎯 Comandos Útiles

```bash
# Ver versión actual
npm version

# Ver tags
git tag -l

# Ver último deployment
vercel ls

# Rollback manual (si es necesario)
vercel rollback [URL]
```

## 🔧 Troubleshooting

### **Error: "No VERCEL_TOKEN"**
- Verifica que agregaste el secret en GitHub
- Verifica que el nombre sea exactamente `VERCEL_TOKEN`

### **Error: "Build failed"**
- Revisa los logs en GitHub Actions
- Verifica que las dependencias estén actualizadas
- Asegúrate que el build funcione localmente

### **Error: "Permission denied"**
- Verifica que el token de Vercel tenga permisos completos
- Verifica que el `VERCEL_PROJECT_ID` sea correcto

### **Commits rechazados por hook**
- Usa conventional commits format
- Ejemplo: `feat(scope): description`
- Types válidos: feat, fix, docs, style, refactor, test, chore, perf, ci, revert

## 🎉 ¡Listo!

Ahora cada commit a `main` disparará automáticamente:
1. 🔖 **Versionado semántico**
2. 🚀 **Deployment a producción**
3. 📝 **Tag de Git**
4. 📱 **Notificaciones**

¡Tu Angular AI Ecommerce Chat se desplegará automáticamente! 🚀 
