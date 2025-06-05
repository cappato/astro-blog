---
title: "Automatizá tu Deploy con Wrangler y GitHub Actions (Guía Paso a Paso)"
description: "Tutorial completo para configurar automatización de despliegues con Wrangler y GitHub Actions. Implementa CI/CD profesional, resuelve problemas WSL y crea deploy continuo con Cloudflare Workers."
date: "2024-12-19"
author: "Matías Cappato"
tags: ["astro", "cloudflare", "wrangler", "github-actions", "deploy", "automation", "devops", "ci-cd", "automatización", "despliegues", "integración-continua"]
postId: "deploy-automatico-wrangler-github-actions"
imageAlt: "Automatización de despliegues con Wrangler y GitHub Actions - Tutorial completo de CI/CD para desarrolladores"
---

# Automatizá tu Deploy con Wrangler y GitHub Actions (Guía Paso a Paso)

¿Cansado de hacer deploys manuales? ¿Quieres configurar un **flujo CI/CD profesional** para tus proyectos Astro? En este tutorial te enseño cómo implementar **automatización de despliegues** completa usando **Wrangler** y **GitHub Actions**, creando un **deploy continuo con Cloudflare Workers** y resolviendo todos los problemas comunes de WSL.

## 🎯 Lo que vas a lograr

Al final de este tutorial tendrás un **sistema de integración continua** completo:

- ✅ **Automatización de despliegues** en cada push a main
- ✅ **Deploy manual** para desarrollo rápido y testing
- ✅ **Pipeline CI/CD con GitHub Actions** completamente configurado
- ✅ **Integración con Cloudflare Workers** optimizada
- ✅ **Resolución de problemas WSL** implementada
- ✅ **Flujo de trabajo DevOps** profesional
- ✅ **Documentación completa** para tu equipo

## 📋 Prerrequisitos

Antes de empezar con este **tutorial de automatización DevOps**, asegúrate de tener:

- Proyecto Astro funcionando localmente ([ver nuestra guía de arquitectura modular](/blog/arquitectura-modular-astro))
- Cuenta de Cloudflare activa
- Repositorio en GitHub
- Node.js y npm instalados
- Entorno WSL (cubrimos todos los problemas de **integración continua**)

💡 **Tip**: Si aún no tienes configurado tu proyecto Astro con las mejores prácticas, te recomiendo leer primero sobre [arquitectura modular en Astro](/blog/arquitectura-modular-astro) para optimizar tu **flujo de desarrollo**.

## 🚀 FASE 1: Configuración Inicial de Cloudflare

### 1.1 Autenticación con Cloudflare

El primer paso es autenticarte con Cloudflare. **Importante**: Si estás en WSL, siempre usa `npx wrangler` para evitar problemas de binarios.

```bash
# IMPORTANTE: Usar npx para evitar problemas de WSL
npx wrangler login
```

💡 **Consejo**: Si estás en WSL, SIEMPRE usa `npx wrangler` en lugar de instalación global para evitar conflictos de binarios Windows/Linux.

### 1.2 Verificar Autenticación

```bash
# Verificar que estás autenticado correctamente
npx wrangler whoami
```

**Salida esperada**:
```
Getting User settings...
👤 You are logged in with an OAuth Token, associated with the email 'tu-email@gmail.com'.
┌─────────────────────────────────────┬──────────────────────────────────┐
│ Account Name                        │ Account ID                       │
├─────────────────────────────────────┼──────────────────────────────────┤
│ Tu Nombre's Account                 │ 64411aa1bd74d6cc23e75f67e32bd6c0 │
└─────────────────────────────────────┴──────────────────────────────────┘
```

⚠️ **IMPORTANTE**: Guarda el Account ID, lo necesitarás más adelante.

### 1.3 Crear Proyecto en Cloudflare Pages

```bash
# Crear proyecto (reemplaza 'tu-proyecto' con el nombre real)
npx wrangler pages project create tu-proyecto
```

### 1.4 Configurar wrangler.toml

Crea el archivo `wrangler.toml` en la raíz de tu proyecto:

```toml
name = "tu-proyecto"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

💡 **Consejo**: El `pages_build_output_dir` debe coincidir con el directorio de salida de Astro (por defecto `dist`).

## 🔧 FASE 2: Resolución de Problemas WSL

### 2.1 El Problema Común en WSL

⚠️ **PROBLEMA**: Al usar Wrangler en WSL, es común encontrar este error:

```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

### 2.2 La Solución Definitiva

✅ **SOLUCIÓN**: Usar `npx wrangler` en lugar de instalación global.

```bash
# Si tienes problemas de binarios cruzados
rm -rf node_modules package-lock.json
npm install

# Verificar que npx funciona
npx wrangler --version
```

### 2.3 Por qué npx es la Solución Perfecta

1. **Descarga automática**: npx descarga la versión correcta para la plataforma actual
2. **Sin conflictos**: Evita completamente los conflictos Windows/Linux
3. **Sin instalación global**: No requiere instalación global problemática
4. **Siempre actualizado**: Usa la versión más reciente disponible
5. **Funciona en cualquier entorno**: WSL, Linux nativo, macOS, Windows

## 🤖 FASE 3: Configuración de GitHub Actions

### 3.1 Crear el Workflow

Crea el directorio y archivo:

```bash
mkdir -p .github/workflows
```

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
        projectName: tu-proyecto
        directory: dist
```

### 3.2 Crear API Token en Cloudflare

#### Paso 1: Ir al Dashboard
- URL: https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"

#### Paso 2: Configurar Token Personalizado
- Seleccionar "Custom token"
- **Token name**: `GitHub-Actions-TuProyecto`
- **Permissions**:
  - `Account` → `Cloudflare Pages:Edit`
  - `Zone` → `Zone:Read` (opcional)
- **Account Resources**: `Include` → `Tu Cuenta Específica`

#### Paso 3: Crear y Copiar Token
- Click "Continue to summary"
- Click "Create Token"
- ⚠️ **CRÍTICO**: Copia el token INMEDIATAMENTE (solo se muestra una vez)

### 3.3 Configurar Secrets en GitHub

#### Navegar a Secrets
- Ir a tu repositorio en GitHub
- Settings → Secrets and variables → Actions
- Click "New repository secret"

#### Agregar los Secrets
1. **CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: Tu Account ID de Cloudflare

2. **CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: El token que copiaste

![GitHub Repository Secrets configurados correctamente](/images/deploy-automatico-wrangler-github-actions/github-secrets.webp)

*Así se ven los secrets correctamente configurados en GitHub. Ambos secrets son necesarios para el deploy automático.*

## 🚀 FASE 4: Scripts de Deploy Optimizados

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "npm run build && npx wrangler pages deploy dist --project-name=tu-proyecto --commit-dirty=true",
    "deploy:clean": "npm run build && npx wrangler pages deploy dist --project-name=tu-proyecto",
    "deploy:ci": "wrangler pages deploy dist --project-name=tu-proyecto",
    "pages:list": "npx wrangler pages project list",
    "wrangler:login": "npx wrangler login"
  }
}
```

### Explicación de Scripts

- **`deploy`**: Desarrollo rápido (permite cambios sin commit)
- **`deploy:clean`**: Producción (requiere commits limpios)
- **`deploy:ci`**: Para GitHub Actions
- **`pages:list`**: Listar proyectos existentes
- **`wrangler:login`**: Re-autenticación cuando sea necesario

## ✅ FASE 5: Primer Deploy y Verificación

### 5.1 Probar Deploy Manual

```bash
# Primer deploy manual para verificar configuración
npm run deploy
```

**Salida esperada**:
```
✨ Compiled successfully.
🌍 Uploading... (X files)
✨ Success! Uploaded X files (X.XX sec)
🌍 Deploying...
✨ Deployment complete! Take a peek over at https://xxxxxxxx.tu-proyecto.pages.dev
```

### 5.2 Activar Deploy Automático

```bash
# Commit y push para activar GitHub Actions
git add .
git commit -m "🚀 Configure deploy automation

✅ Added wrangler.toml configuration
✅ Added GitHub Actions workflow
✅ Added deploy scripts to package.json
✅ Ready for automatic deployment"

git push origin main
```

### 5.3 Monitorear el Deploy

1. Ir a: `https://github.com/tu-usuario/tu-proyecto/actions`
2. Ver el workflow ejecutándose
3. Verificar cada paso:
   - ✅ Checkout
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Build project
   - ✅ Deploy to Cloudflare Pages

![GitHub Actions workflow ejecutándose exitosamente](/images/deploy-automatico-wrangler-github-actions/github-actions-success.webp)

*El workflow de GitHub Actions ejecutándose correctamente. Puedes ver el estado "Deploy automático configurado" y el tiempo de ejecución (~1m 5s).*

## 🛠️ Troubleshooting Completo

### Error de Binarios WSL

**Síntoma**:
```
Error: You installed workerd on another platform...
```

**Solución**:
```bash
# Limpiar instalaciones
rm -rf node_modules package-lock.json
npm install

# Usar siempre npx
npx wrangler --version  # ✅ Funciona
wrangler --version      # ❌ Puede fallar
```

### Error de Autenticación

**Síntoma**:
```
Error: Authentication required
```

**Solución**:
```bash
# Re-autenticar
npx wrangler login
npx wrangler whoami
```

### Error en GitHub Actions

**Diagnóstico**:
- Verificar secrets en GitHub
- Verificar permisos del API token
- Revisar logs en GitHub Actions

**Solución**:
```bash
# Verificar Account ID
npx wrangler whoami

# Recrear secrets si es necesario
# GitHub → Settings → Secrets → Actions
```

## 📊 Workflow Completo de Desarrollo

### Para Desarrollo Diario

```bash
# 1. Desarrollo local
npm run dev

# 2. Deploy rápido para testing
npm run deploy

# 3. Si está bien, deploy a producción
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main  # Deploy automático
```

### Para Features Grandes

```bash
# 1. Crear branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y probar
npm run dev
npm run deploy  # Preview

# 3. Merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main  # Deploy automático
```

## 📊 Verificación Visual del Setup

### Secrets Configurados Correctamente
Como puedes ver en la primera imagen, los secrets de GitHub deben estar configurados exactamente así:
- `CLOUDFLARE_ACCOUNT_ID` - Tu Account ID de Cloudflare
- `CLOUDFLARE_API_TOKEN` - El token con permisos de Cloudflare Pages

### Workflow Funcionando
La segunda imagen muestra el workflow ejecutándose exitosamente:
- ✅ Estado: **Deploy automático configurado**
- ⏱️ Tiempo: **~1m 5s** (muy rápido!)
- 🔄 Trigger: **Push a main branch**
- 📝 Commit: Mensaje descriptivo del deploy

## 🎯 Beneficios Obtenidos

### Infraestructura Completa
- ✅ **Deploy automático** en cada push a main
- ✅ **Deploy manual** para desarrollo rápido
- ✅ **GitHub Actions CI/CD** completamente configurado
- ✅ **Resolución de problemas WSL** implementada

### Workflow Profesional
- ⚡ **Deploy en ~1-2 minutos** desde push
- 🔒 **Seguridad** con tokens y secrets apropiados
- 📊 **Monitoreo** completo con GitHub Actions
- 🌍 **CDN global** de Cloudflare automático
- 🔄 **Rollback fácil** si algo falla

## 🚀 Próximos Pasos

1. **Configurar dominio personalizado** en Cloudflare Pages
2. **Implementar preview deployments** para Pull Requests
3. **Agregar notificaciones** de deploy (Slack, Discord)
4. **Configurar métricas** y monitoreo avanzado

## 💡 Lecciones Clave

1. **WSL + Wrangler**: Siempre usar `npx wrangler` para evitar problemas
2. **Secrets Management**: Usar GitHub Secrets, nunca commitear credenciales
3. **CI/CD Optimization**: `npm ci` + cache acelera builds significativamente
4. **Documentation**: Documentación clara es esencial para mantenimiento

## 🎉 Conclusión

Has implementado exitosamente un **sistema de automatización de despliegues** profesional que:

- Funciona de manera consistente en cualquier entorno
- Escala para equipos de cualquier tamaño
- Incluye todas las **mejores prácticas DevOps** de la industria
- Está completamente documentado para futuro mantenimiento
- Proporciona un **flujo CI/CD robusto** y confiable

**Este setup de integración continua te servirá como base para cualquier proyecto futuro con Astro y Cloudflare Pages.** 🚀

## 🔗 Próximos Pasos en tu Journey DevOps

¿Te gustó este tutorial de **automatización de despliegues**? Continuá optimizando tu flujo de trabajo:

### 📚 **Tutoriales Relacionados:**
- **[Arquitectura Modular en Astro](/blog/arquitectura-modular-astro)** - Organiza tu código para máxima escalabilidad
- **[Testing Automatizado para Sitios Estáticos](/blog/testing-automatizado-sitios-estaticos)** - Automatiza también tu testing con CI/CD
- **[SEO Automático con TypeScript](/blog/seo-automatico-typescript)** - Optimiza tu SEO en el pipeline

### 🏷️ **Explora más sobre Automatización DevOps:**
- **[Ver todos los posts de Automation & DevOps](/blog/pillar/automation-devops)** - Hub completo de automatización
- **[Posts sobre GitHub Actions](/blog/tag/github-actions)** - Más workflows y automatizaciones
- **[Guías de Cloudflare](/blog/tag/cloudflare)** - Aprovecha al máximo la plataforma

### 💬 **¿Qué automatizar después?**
- **Testing automático** con Vitest y GitHub Actions
- **Optimización de imágenes** en el pipeline CI/CD
- **Notificaciones** de deploy en Slack/Discord
- **Métricas y monitoreo** automatizado

---

**¿Te ha resultado útil este tutorial de deploy continuo?** ¡Compártelo y ayuda a otros desarrolladores a configurar su **automatización de despliegues**!
