---
title: "Troubleshooting Wrangler: Soluciones para WSL y Deploy"
description: "Resuelve problemas comunes con Wrangler en WSL, errores de deploy y issues de autenticación. Guía completa de troubleshooting para desarrolladores."
date: "2024-05-15"
author: "Matías Cappato"
tags: ["wrangler", "troubleshooting", "wsl", "deploy", "cloudflare", "problemas", "soluciones", "debugging"]
postId: "troubleshooting-wrangler-wsl-deploy"
imageAlt: "Troubleshooting Wrangler - Soluciones para problemas comunes en WSL y deploy"
series: "deploy-wrangler"
seriesName: "Deploy Automático con Wrangler"
seriesDescription: "Serie completa sobre deploy automático con Wrangler y GitHub Actions"
seriesOrder: 3
seriesTotal: 3
---

¿Tienes problemas con **Wrangler en WSL** o errores en tus deploys? En esta guía encuentras las **soluciones a los problemas más comunes** con Wrangler, desde errores de binarios hasta issues de autenticación.

##  Problemas que vas a resolver

Esta guía cubre las soluciones para:

-  **Errores de binarios cruzados** en WSL
-  **Problemas de autenticación** con Cloudflare
-  **Errores en GitHub Actions** y CI/CD
-  **Issues de deploy** y configuración
-  **Workflow completo** de desarrollo optimizado

##  Prerrequisitos

Para seguir esta guía necesitas:

- Conocimiento básico de Wrangler ([configuración inicial](/blog/configurar-wrangler-cloudflare-pages-2024))
- GitHub Actions configurado ([guía de CI/CD](/blog/github-actions-deploy-automatico-wrangler))
- Acceso a terminal y logs de error

##  Problema #1: Errores de Binarios WSL

### Síntoma

```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

### Causa

WSL mezcla binarios de Windows y Linux, causando conflictos en las dependencias de Wrangler.

###  Solución Definitiva

```bash
# 1. Limpiar instalaciones problemáticas
rm -rf node_modules package-lock.json

# 2. Reinstalar dependencias
npm install

# 3. Usar SIEMPRE npx en lugar de instalación global
npx wrangler --version  #  Funciona
wrangler --version      #  Puede fallar

# 4. Verificar que funciona
npx wrangler whoami
```

### Prevención

**Regla de oro**: En WSL, SIEMPRE usa `npx wrangler` en lugar de `wrangler` global.

```bash
#  Correcto
npx wrangler login
npx wrangler pages deploy dist

#  Problemático en WSL
wrangler login
wrangler pages deploy dist
```

##  Problema #2: Errores de Autenticación

### Síntoma

```
Error: Authentication required
Error: You need to be logged in to perform this action
```

### Diagnóstico

```bash
# Verificar estado de autenticación
npx wrangler whoami
```

###  Soluciones por Escenario

#### Escenario A: No autenticado

```bash
# Re-autenticar
npx wrangler login

# Verificar
npx wrangler whoami
```

#### Escenario B: Token expirado

```bash
# Logout y login nuevamente
npx wrangler logout
npx wrangler login
```

#### Escenario C: Problemas de permisos

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Verifica que tu token tiene permisos de `Cloudflare Pages:Edit`
3. Regenera el token si es necesario

## 🤖 Problema #3: Errores en GitHub Actions

### Síntoma

```
Error: Authentication failed
Error: Project not found
Error: Invalid account ID
```

###  Diagnóstico y Solución

#### Verificar Secrets

1. Ve a: `GitHub Repo → Settings → Secrets → Actions`
2. Confirma que existen:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`

#### Verificar Account ID

```bash
# Obtener Account ID correcto
npx wrangler whoami

# Copiar el Account ID y actualizar en GitHub Secrets
```

#### Verificar API Token

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Verifica permisos del token:
   - `Account` → `Cloudflare Pages:Edit`
   - `Account Resources` → Tu cuenta específica

#### Recrear Secrets si es Necesario

```bash
# 1. Obtener datos actualizados
npx wrangler whoami

# 2. Ir a GitHub → Settings → Secrets → Actions
# 3. Actualizar CLOUDFLARE_ACCOUNT_ID
# 4. Regenerar y actualizar CLOUDFLARE_API_TOKEN
```

##  Problema #4: Errores de Deploy

### Síntoma A: Proyecto no encontrado

```
Error: Project "mi-proyecto" not found
```

**Solución**:
```bash
# Listar proyectos existentes
npx wrangler pages project list

# Crear proyecto si no existe
npx wrangler pages project create mi-proyecto

# Verificar nombre en wrangler.toml
cat wrangler.toml
```

### Síntoma B: Directorio de build incorrecto

```
Error: Could not find directory "dist"
```

**Solución**:
```bash
# Verificar que el build funciona
npm run build

# Verificar directorio de salida
ls -la dist/

# Actualizar wrangler.toml si es necesario
# pages_build_output_dir = "dist"  # o el directorio correcto
```

### Síntoma C: Archivos muy grandes

```
Error: File too large for upload
```

**Solución**:
```bash
# Verificar tamaño de archivos
du -sh dist/*

# Optimizar build si es necesario
npm run build

# Verificar .gitignore para excluir archivos innecesarios
```

##  Problema #5: Issues de Configuración

### wrangler.toml Incorrecto

**Configuración mínima correcta**:
```toml
name = "mi-proyecto"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

### package.json Scripts Optimizados

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "npm run build && npx wrangler pages deploy dist --project-name=mi-proyecto --commit-dirty=true",
    "deploy:clean": "npm run build && npx wrangler pages deploy dist --project-name=mi-proyecto",
    "deploy:ci": "wrangler pages deploy dist --project-name=mi-proyecto",
    "pages:list": "npx wrangler pages project list",
    "wrangler:login": "npx wrangler login",
    "wrangler:whoami": "npx wrangler whoami"
  }
}
```

##  Herramientas de Diagnóstico

### Comandos de Verificación

```bash
# Verificar autenticación
npx wrangler whoami

# Listar proyectos
npx wrangler pages project list

# Verificar configuración del proyecto
npx wrangler pages project get mi-proyecto

# Test de deploy (sin hacer deploy real)
npm run build && echo "Build successful"

# Verificar versión de Wrangler
npx wrangler --version
```

### Logs Útiles

```bash
# Deploy con logs detallados
npx wrangler pages deploy dist --project-name=mi-proyecto --verbose

# Verificar logs de GitHub Actions
# GitHub Repo → Actions → Click en workflow → Ver logs detallados
```

##  Workflow Completo de Desarrollo

### Para Desarrollo Local

```bash
# 1. Desarrollo
npm run dev

# 2. Test de build
npm run build

# 3. Deploy de prueba (opcional)
npm run deploy

# 4. Si todo está bien, commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main  # Deploy automático
```

### Para Debugging

```bash
# 1. Verificar autenticación
npm run wrangler:whoami

# 2. Verificar proyectos
npm run pages:list

# 3. Test de build local
npm run build

# 4. Deploy manual para debugging
npm run deploy
```

##  Optimizaciones de Performance

### Cache en GitHub Actions

Asegúrate de que tu workflow use cache:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← Importante para performance
```

### Scripts Optimizados

```bash
# Para desarrollo rápido (permite dirty commits)
npm run deploy

# Para producción (requiere commits limpios)
npm run deploy:clean

# Para CI/CD (sin npx)
npm run deploy:ci
```

##  Mejores Prácticas

### 1. Entorno WSL

-  Siempre usar `npx wrangler`
-  Limpiar `node_modules` si hay problemas
-  Verificar autenticación regularmente

### 2. GitHub Actions

-  Usar secrets para credenciales
-  Verificar permisos de API tokens
-  Monitorear logs de deploy

### 3. Desarrollo

-  Test local antes de push
-  Commits descriptivos
-  Deploy manual para debugging

##  Checklist de Troubleshooting

Cuando tengas problemas, sigue este checklist:

- [ ] ¿Estás usando `npx wrangler` en WSL?
- [ ] ¿Está autenticado? (`npx wrangler whoami`)
- [ ] ¿Existen los secrets en GitHub?
- [ ] ¿El proyecto existe en Cloudflare Pages?
- [ ] ¿El build local funciona? (`npm run build`)
- [ ] ¿El `wrangler.toml` está configurado correctamente?
- [ ] ¿Los permisos del API token son correctos?

##  Conclusión

Con estas soluciones tienes las herramientas para resolver los problemas más comunes con **Wrangler y deploy automático**. Recuerda:

1. **WSL**: Siempre `npx wrangler`
2. **Autenticación**: Verificar regularmente
3. **GitHub Actions**: Secrets y permisos correctos
4. **Deploy**: Test local primero

###  **Serie Completa:**
- **[Configurar Wrangler y Cloudflare Pages](/blog/configurar-wrangler-cloudflare-pages-2024)** - Configuración inicial
- **[GitHub Actions para Deploy Automático](/blog/github-actions-deploy-automatico-wrangler)** - CI/CD setup

### ️ **Explora más:**
- **[Posts sobre Troubleshooting](/blog/tag/troubleshooting)** - Más soluciones
- **[Automation & DevOps Hub](/blog/pillar/automation-devops)** - Automatización completa

---

**¿Te ayudaron estas soluciones?** ¡Guarda esta guía como referencia para futuros problemas con Wrangler!
