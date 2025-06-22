---
title: "Configurar Wrangler y Cloudflare Pages: Guía Completa 2024"
description: "Aprende a configurar Wrangler y Cloudflare Pages desde cero. Guía paso a paso con autenticación, creación de proyectos y configuración inicial para deploy..."
date: "2024-05-05"
author: "Matías Cappato"
tags: ["automation", "ci-cd", "cloudflare", "cloudflare-pages", "configuración", "deploy", "pages", "setup", "wrangler", "wrangler-setup"]
postId: "configurar-wrangler-cloudflare-pages-2024"
imageAlt: "Configuración de Wrangler y Cloudflare Pages - Guía paso a paso para desarrolladores"
series: "deploy-wrangler"
seriesName: "Deploy Automático con Wrangler"
seriesDescription: "Serie completa sobre deploy automático con Wrangler y GitHub Actions"
seriesOrder: 1
seriesTotal: 3
---

¿Quieres configurar **Wrangler y Cloudflare Pages** para tu proyecto pero no sabes por dónde empezar? En esta guía te enseño paso a paso cómo hacer la **configuración inicial de Cloudflare Pages** y preparar tu proyecto para deploy automático.

##  Lo que vas a lograr

Al final de esta guía tendrás:

-  **Wrangler configurado** y funcionando correctamente
-  **Autenticación con Cloudflare** establecida
-  **Proyecto en Cloudflare Pages** creado
-  **Configuración base** lista para deploy
-  **Resolución de problemas WSL** implementada

##  Prerrequisitos

Antes de empezar con la **configuración de Wrangler**, asegúrate de tener:

- Proyecto Astro funcionando localmente
- Cuenta de Cloudflare activa (gratuita está bien)
- Node.js y npm instalados
- Terminal con acceso a npm/npx

 **Tip**: Si estás en WSL, esta guía incluye todas las soluciones para problemas comunes.

##  Paso 1: Instalación y Autenticación

### 1.1 ¿Instalar Globalmente o Usar npx?

**Recomendación**: Usa `npx wrangler` en lugar de instalación global, especialmente en WSL.

**¿Por qué npx es mejor?**
-  Evita problemas de binarios cruzados Windows/Linux
-  Siempre usa la versión más reciente
-  No requiere instalación global
-  Funciona en cualquier entorno

### 1.2 Autenticación con Cloudflare

```bash
# IMPORTANTE: Usar npx para evitar problemas de WSL
npx wrangler login
```

Esto abrirá tu navegador para autenticarte con Cloudflare. Autoriza la aplicación y regresa al terminal.

### 1.3 Verificar Autenticación

```bash
# Verificar que estás autenticado correctamente
npx wrangler whoami
```

**Salida esperada**:
```
Getting User settings...
 You are logged in with an OAuth Token, associated with the email 'tu-email@gmail.com'.
┌─────────────────────────────────────┬──────────────────────────────────┐
│ Account Name                        │ Account ID                       │
├─────────────────────────────────────┼──────────────────────────────────┤
│ Tu Nombre's Account                 │ 64411aa1bd74d6cc23e75f67e32bd6c0 │
└─────────────────────────────────────┴──────────────────────────────────┘
```

️ **IMPORTANTE**: Guarda el **Account ID**, lo necesitarás más adelante para GitHub Actions.

## ️ Paso 2: Crear Proyecto en Cloudflare Pages

### 2.1 Crear el Proyecto

```bash
# Crear proyecto (reemplaza 'mi-proyecto' con el nombre real)
npx wrangler pages project create mi-proyecto
```

**Salida esperada**:
```
 Successfully created the 'mi-proyecto' project.
 View your project at: https://dash.cloudflare.com/[account-id]/pages/view/mi-proyecto
```

### 2.2 Listar Proyectos Existentes

```bash
# Ver todos tus proyectos de Pages
npx wrangler pages project list
```

Esto te muestra todos los proyectos que tienes en Cloudflare Pages.

## ️ Paso 3: Configurar wrangler.toml

### 3.1 Crear el Archivo de Configuración

Crea el archivo `wrangler.toml` en la raíz de tu proyecto:

```toml
name = "mi-proyecto"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
name = "mi-proyecto"

[env.preview]
name = "mi-proyecto-preview"
```

### 3.2 Explicación de la Configuración

- **`name`**: Nombre de tu proyecto (debe coincidir con el creado en Pages)
- **`compatibility_date`**: Fecha de compatibilidad de Cloudflare Workers
- **`pages_build_output_dir`**: Directorio de salida de tu build (Astro usa `dist`)
- **`env.production`**: Configuración para producción
- **`env.preview`**: Configuración para previews (opcional)

 **Consejo**: El `pages_build_output_dir` debe coincidir exactamente con el directorio de salida de Astro.

##  Paso 4: Resolución de Problemas WSL

### 4.1 El Problema Común en WSL

️ **PROBLEMA**: Al usar Wrangler en WSL, es común encontrar este error:

```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

### 4.2 La Solución Definitiva

 **SOLUCIÓN**: Usar `npx wrangler` en lugar de instalación global.

```bash
# Si tienes problemas de binarios cruzados
rm -rf node_modules package-lock.json
npm install

# Verificar que npx funciona
npx wrangler --version
```

### 4.3 ¿Por qué Funciona npx?

1. **Descarga automática**: npx descarga la versión correcta para la plataforma actual
2. **Sin conflictos**: Evita completamente los conflictos Windows/Linux
3. **Sin instalación global**: No requiere instalación global problemática
4. **Siempre actualizado**: Usa la versión más reciente disponible
5. **Funciona en cualquier entorno**: WSL, Linux nativo, macOS, Windows

## 🧪 Paso 5: Primer Deploy de Prueba

### 5.1 Agregar Scripts a package.json

Agrega estos scripts útiles a tu `package.json`:

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "npm run build && npx wrangler pages deploy dist --project-name=mi-proyecto --commit-dirty=true",
    "deploy:clean": "npm run build && npx wrangler pages deploy dist --project-name=mi-proyecto",
    "pages:list": "npx wrangler pages project list",
    "wrangler:login": "npx wrangler login"
  }
}
```

### 5.2 Probar Deploy Manual

```bash
# Primer deploy manual para verificar configuración
npm run deploy
```

**Salida esperada**:
```
 Compiled successfully.
 Uploading... (X files)
 Success! Uploaded X files (X.XX sec)
 Deploying...
 Deployment complete! Take a peek over at https://xxxxxxxx.mi-proyecto.pages.dev
```

 **¡Felicitaciones!** Tu proyecto ya está desplegado en Cloudflare Pages.

##  Verificación de la Configuración

### Checklist de Configuración Completa

-  Wrangler autenticado (`npx wrangler whoami`)
-  Proyecto creado en Cloudflare Pages
-  Archivo `wrangler.toml` configurado
-  Scripts de deploy agregados a `package.json`
-  Deploy manual funcionando
-  URL de producción accesible

### Comandos Útiles para Verificar

```bash
# Verificar autenticación
npx wrangler whoami

# Listar proyectos
npx wrangler pages project list

# Ver información del proyecto
npx wrangler pages project get mi-proyecto

# Deploy rápido para testing
npm run deploy
```

##  Próximos Pasos

¡Excelente! Ya tienes la **configuración base de Wrangler y Cloudflare Pages** funcionando. Ahora puedes continuar con:

###  **Siguiente en la Serie:**
- **[GitHub Actions para Deploy Automático: CI/CD con Wrangler](/blog/github-actions-deploy-automatico-wrangler)** - Automatiza tus deploys con GitHub Actions
- **[Troubleshooting Wrangler: Soluciones para WSL y Deploy Issues](/blog/troubleshooting-wrangler-wsl-deploy)** - Resuelve problemas comunes

### ️ **Explora más sobre Cloudflare:**
- **[Ver todos los posts de Cloudflare](/blog/tag/cloudflare)** - Aprovecha al máximo la plataforma
- **[Posts sobre Deploy](/blog/tag/deploy)** - Más estrategias de despliegue

##  Puntos Clave

1. **npx > instalación global**: Especialmente importante en WSL
2. **Account ID**: Guárdalo para configurar GitHub Actions
3. **wrangler.toml**: Configuración centralizada del proyecto
4. **Deploy manual primero**: Verifica que todo funciona antes de automatizar

---

**¿Te ha resultado útil esta guía de configuración?** ¡Continúa con el siguiente post para automatizar tus deploys con GitHub Actions!
