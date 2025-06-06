---
title: "GitHub Actions para Deploy Automático: CI/CD con Wrangler"
description: "Configura GitHub Actions para deploy automático con Wrangler. Aprende a crear workflows CI/CD, configurar secrets y automatizar despliegues a Cloudflare Pages."
date: "2024-12-19"
author: "Matías Cappato"
tags: ["github-actions", "wrangler", "ci-cd", "deploy", "automation", "cloudflare", "workflow", "devops", "Astro", "testing"]
postId: "github-actions-deploy-automatico-wrangler"
imageAlt: "GitHub Actions y Wrangler - Configuración de CI/CD para deploy automático"
---

¿Ya tienes **Wrangler configurado** y quieres automatizar tus deploys? En esta guía te enseño cómo configurar **GitHub Actions para deploy automático** con Wrangler, creando un pipeline CI/CD profesional.

## 🎯 Lo que vas a lograr

Al final de esta guía tendrás:

- ✅ **GitHub Actions workflow** configurado para deploy automático
- ✅ **API Token de Cloudflare** creado con permisos correctos
- ✅ **Secrets de GitHub** configurados de forma segura
- ✅ **Deploy automático** en cada push a main
- ✅ **Pipeline CI/CD** funcionando profesionalmente

## 📋 Prerrequisitos

Antes de empezar necesitas:

- **Wrangler configurado** ([ver guía anterior](/blog/configurar-wrangler-cloudflare-pages-2024))
- Proyecto en GitHub
- Proyecto en Cloudflare Pages creado
- Account ID de Cloudflare a mano

💡 **Tip**: Si no completaste la configuración inicial, revisa primero la [guía de configuración de Wrangler](/blog/configurar-wrangler-cloudflare-pages-2024).

## 🔑 Paso 1: Crear API Token en Cloudflare

### 1.1 Acceder al Dashboard de API Tokens

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Click en **"Create Token"**

### 1.2 Configurar Token Personalizado

Selecciona **"Custom token"** y configura:

**Token name**: `GitHub-Actions-MiProyecto`

**Permissions**:
- `Account` → `Cloudflare Pages:Edit`
- `Zone` → `Zone:Read` (opcional, para dominios personalizados)

**Account Resources**: 
- `Include` → `Tu Cuenta Específica`

**Zone Resources** (si agregaste Zone:Read):
- `Include` → `All zones` o tu zona específica

### 1.3 Crear y Guardar Token

1. Click **"Continue to summary"**
2. Revisa los permisos
3. Click **"Create Token"**
4. ⚠️ **CRÍTICO**: Copia el token INMEDIATAMENTE (solo se muestra una vez)

```
Ejemplo de token:
aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef
```

## 🔒 Paso 2: Configurar Secrets en GitHub

### 2.1 Navegar a Repository Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

### 2.2 Agregar CLOUDFLARE_ACCOUNT_ID

1. **Name**: `CLOUDFLARE_ACCOUNT_ID`
2. **Secret**: Tu Account ID de Cloudflare (obtenido con `npx wrangler whoami`)
3. Click **"Add secret"**

### 2.3 Agregar CLOUDFLARE_API_TOKEN

1. **Name**: `CLOUDFLARE_API_TOKEN`
2. **Secret**: El token que copiaste en el paso anterior
3. Click **"Add secret"**

### 2.4 Verificar Secrets Configurados

Deberías ver ambos secrets listados:
- ✅ `CLOUDFLARE_ACCOUNT_ID`
- ✅ `CLOUDFLARE_API_TOKEN`

## 🤖 Paso 3: Crear GitHub Actions Workflow

### 3.1 Crear Estructura de Directorios

```bash
# Crear directorio para workflows
mkdir -p .github/workflows
```

### 3.2 Crear Archivo de Workflow

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build

    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: mi-proyecto
        directory: dist
        # Optional: Add git info to deployment
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 3.3 Personalizar el Workflow

**Cambios necesarios**:
- Reemplaza `mi-proyecto` con el nombre real de tu proyecto
- Ajusta `directory: dist` si tu build output es diferente
- Modifica `node-version` si usas una versión específica

## 🚀 Paso 4: Primer Deploy Automático

### 4.1 Commit y Push del Workflow

```bash
# Agregar archivos
git add .github/workflows/deploy.yml

# Commit con mensaje descriptivo
git commit -m "🚀 Add GitHub Actions workflow for automatic deployment

✅ Added deploy.yml workflow
✅ Configured Cloudflare Pages deployment
✅ Set up CI/CD pipeline with Node.js 20
✅ Ready for automatic deployment on push to main"

# Push para activar el workflow
git push origin main
```

### 4.2 Monitorear el Deploy

1. Ve a: `https://github.com/tu-usuario/tu-proyecto/actions`
2. Verás el workflow ejecutándose
3. Click en el workflow para ver detalles

**Pasos que verás**:
- ✅ **Checkout** - Descarga el código
- ✅ **Setup Node.js** - Configura Node.js 20 con cache
- ✅ **Install dependencies** - Ejecuta `npm ci`
- ✅ **Build project** - Ejecuta `npm run build`
- ✅ **Deploy to Cloudflare Pages** - Despliega a Cloudflare

### 4.3 Verificar Deploy Exitoso

**Indicadores de éxito**:
- ✅ Workflow completado sin errores
- ✅ Deploy URL mostrada en los logs
- ✅ Sitio accesible en la URL de Cloudflare Pages

## 📊 Paso 5: Optimizar el Workflow

### 5.1 Agregar Scripts Optimizados

Actualiza tu `package.json` con scripts específicos para CI:

```json
{
  "scripts": {
    "build": "astro build",
    "build:ci": "astro build",
    "deploy": "npm run build && npx wrangler pages deploy dist --project-name=mi-proyecto --commit-dirty=true",
    "deploy:ci": "wrangler pages deploy dist --project-name=mi-proyecto",
    "test": "echo 'No tests specified' && exit 0"
  }
}
```

### 5.2 Workflow Avanzado con Tests

Si tienes tests, puedes mejorar el workflow:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Test
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    name: Deploy
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build:ci

    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: mi-proyecto
        directory: dist
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 🔍 Verificación del Pipeline CI/CD

### Checklist de CI/CD Completo

- ✅ API Token creado con permisos correctos
- ✅ Secrets configurados en GitHub
- ✅ Workflow file creado y commiteado
- ✅ Deploy automático funcionando
- ✅ URL de producción accesible
- ✅ Logs de deploy sin errores

### Comandos para Verificar Localmente

```bash
# Verificar que el build funciona
npm run build

# Verificar estructura de archivos
ls -la dist/

# Verificar que wrangler puede acceder al proyecto
npx wrangler pages project list
```

## 🎯 Workflow de Desarrollo Completo

### Para Desarrollo Diario

```bash
# 1. Desarrollo local
npm run dev

# 2. Commit cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push para deploy automático
git push origin main  # ← Deploy automático se activa
```

### Para Pull Requests

El workflow también se ejecuta en PRs para verificar que el build funciona, pero no despliega a producción.

## 🚀 Próximos Pasos

¡Excelente! Ya tienes **deploy automático con GitHub Actions** funcionando. Ahora puedes:

### 📚 **Siguiente en la Serie:**
- **[Troubleshooting Wrangler: Soluciones para WSL y Deploy Issues](/blog/troubleshooting-wrangler-wsl-deploy)** - Resuelve problemas comunes

### 🏷️ **Explora más sobre CI/CD:**
- **[Ver todos los posts de GitHub Actions](/blog/tag/github-actions)** - Más workflows y automatizaciones
- **[Posts sobre Automation & DevOps](/blog/pillar/automation-devops)** - Hub completo de automatización

## 💡 Puntos Clave

1. **API Token**: Crea tokens específicos con permisos mínimos necesarios
2. **Secrets**: Nunca commitees credenciales, usa GitHub Secrets
3. **Cache**: `npm ci` + cache acelera builds significativamente
4. **Monitoreo**: Siempre verifica que el primer deploy funciona

---

**¿Te ha resultado útil esta guía de CI/CD?** ¡Continúa con el siguiente post para aprender troubleshooting avanzado!
