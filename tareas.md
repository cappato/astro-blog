# 📚 **Tutorial Completo: Deploy Automático con Wrangler y GitHub Actions**

## 🎯 **Objetivo**
Configurar deploy automático completo para proyectos Astro en Cloudflare Pages, resolviendo todos los problemas de WSL y estableciendo CI/CD profesional desde cero hasta producción.

## 📋 **Prerrequisitos**
- Proyecto Astro funcionando localmente
- Cuenta de Cloudflare activa
- Repositorio en GitHub
- Entorno WSL (cubrimos todos los problemas)
- Node.js y npm instalados

---

## 🚀 **FASE 1: Configuración Inicial de Cloudflare**

### **1.1 Autenticación con Cloudflare**
```bash
# IMPORTANTE: Usar npx para evitar problemas de WSL
npx wrangler login
```

**💡 Consejo**: Si estás en WSL, SIEMPRE usa `npx wrangler` en lugar de instalación global para evitar conflictos de binarios Windows/Linux.

### **1.2 Verificar Autenticación**
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
🔓 Token Permissions: If scopes are missing, you may need to logout and re-authenticate.
Scope (Access)
- account (read)
- pages (write)
- zone (read)
```

**⚠️ IMPORTANTE**: Guarda el Account ID, lo necesitarás más adelante.

### **1.3 Crear Proyecto en Cloudflare Pages**
```bash
# Crear proyecto (reemplaza 'tu-proyecto' con el nombre real)
npx wrangler pages project create tu-proyecto
```

### **1.4 Configurar wrangler.toml**
Crear archivo `wrangler.toml` en la raíz del proyecto:

```toml
name = "tu-proyecto"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
name = "tu-proyecto"
```

**💡 Consejo**: El `pages_build_output_dir` debe coincidir con el directorio de salida de Astro (por defecto `dist`).

---

## 🔧 **FASE 2: Configuración de Scripts de Deploy**

### **2.1 Problema Común en WSL**
**⚠️ PROBLEMA**: Al usar Wrangler en WSL, es común encontrar este error:
```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

**✅ SOLUCIÓN**: Usar `npx wrangler` en lugar de instalación global.

### **2.2 Limpiar Instalaciones Problemáticas (Si es necesario)**
```bash
# Si tienes problemas de binarios cruzados
rm -rf node_modules package-lock.json
npm install
```

### **2.3 Scripts Optimizados para package.json**
Agregar estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "npm run build && npx wrangler pages deploy dist --project-name=tu-proyecto --commit-dirty=true",
    "deploy:clean": "npm run build && npx wrangler pages deploy dist --project-name=tu-proyecto",
    "deploy:ci": "wrangler pages deploy dist --project-name=tu-proyecto",
    "deploy:preview": "npm run build && npx wrangler pages deploy dist --project-name=tu-proyecto-preview --commit-dirty=true",
    "pages:create": "npx wrangler pages project create tu-proyecto",
    "pages:list": "npx wrangler pages project list",
    "wrangler:install": "npm install -g wrangler",
    "wrangler:login": "npx wrangler login"
  }
}
```

### **2.4 Explicación Detallada de Scripts**
- **`deploy`**: Desarrollo rápido (permite cambios sin commit con `--commit-dirty=true`)
- **`deploy:clean`**: Producción (requiere commits limpios, sin `--commit-dirty`)
- **`deploy:ci`**: Para GitHub Actions (sin npx, usa wrangler directo)
- **`deploy:preview`**: Entorno de pruebas separado
- **`pages:create`**: Crear proyecto en Cloudflare
- **`pages:list`**: Listar proyectos existentes
- **`wrangler:login`**: Re-autenticación cuando sea necesario

### **2.5 Probar Deploy Manual**
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

**💡 Consejo**: Guarda la URL generada, será tu URL de preview para deploys manuales.

---

## 🤖 **FASE 3: Configuración de GitHub Actions CI/CD**

### **3.1 Crear Estructura de GitHub Actions**
```bash
# Crear directorio para workflows
mkdir -p .github/workflows
```

### **3.2 Crear .github/workflows/deploy.yml**
Crear el archivo con este contenido exacto:

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

**💡 Consejos importantes**:
- Usar `npm ci` en lugar de `npm install` para CI/CD (más rápido y determinístico)
- `node-version: '20'` es la versión LTS recomendada
- `cache: 'npm'` acelera las builds posteriores
- Reemplazar `tu-proyecto` con el nombre real de tu proyecto

### **3.3 Obtener Account ID de Cloudflare**
```bash
# Ejecutar y guardar el Account ID que aparece
npx wrangler whoami
```

**Ejemplo de salida**:
```
┌─────────────────────────────────────┬──────────────────────────────────┐
│ Account Name                        │ Account ID                       │
├─────────────────────────────────────┼──────────────────────────────────┤
│ Tu Nombre's Account                 │ 64411aa1bd74d6cc23e75f67e32bd6c0 │
└─────────────────────────────────────┴──────────────────────────────────┘
```

**⚠️ IMPORTANTE**: Copia exactamente el Account ID, lo necesitarás para los secrets.

### **3.4 Crear API Token en Cloudflare**

#### **Paso 3.4.1**: Ir al Dashboard de Cloudflare
- URL: https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"

#### **Paso 3.4.2**: Configurar Token Personalizado
- Seleccionar "Custom token"
- **Token name**: `GitHub-Actions-TuProyecto`
- **Permissions**:
  - `Account` → `Cloudflare Pages:Edit`
  - `Zone` → `Zone:Read` (opcional, para dominios personalizados)
- **Account Resources**:
  - `Include` → `Tu Cuenta Específica`
- **Zone Resources**:
  - `Include` → `All zones` (si usas dominios personalizados)

#### **Paso 3.4.3**: Crear y Copiar Token
- Click "Continue to summary"
- Click "Create Token"
- **⚠️ CRÍTICO**: Copia el token INMEDIATAMENTE (solo se muestra una vez)

### **3.5 Configurar Secrets en GitHub**

#### **Paso 3.5.1**: Navegar a Secrets
- Ir a tu repositorio en GitHub
- Settings → Secrets and variables → Actions
- Click "New repository secret"

#### **Paso 3.5.2**: Agregar CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Secret**: `64411aa1bd74d6cc23e75f67e32bd6c0` (tu Account ID real)
- Click "Add secret"

#### **Paso 3.5.3**: Agregar CLOUDFLARE_API_TOKEN
- Click "New repository secret" otra vez
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Secret**: [el token que copiaste de Cloudflare]
- Click "Add secret"

### **3.6 Verificar Configuración**
Deberías tener exactamente 2 secrets configurados:
- ✅ `CLOUDFLARE_ACCOUNT_ID`
- ✅ `CLOUDFLARE_API_TOKEN`

---

## 🛠️ **FASE 4: Resolución Completa de Problemas WSL**

### **4.1 El Problema Fundamental de WSL**
**Síntoma**: Error al ejecutar `wrangler` directamente:
```
Error: You installed workerd on another platform than the one you're currently using.
This won't work because workerd is written with native code and needs to
install a platform-specific binary executable.

Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

**Causa Raíz**:
- WSL ejecuta Linux pero puede heredar instalaciones de Windows
- Wrangler incluye binarios nativos específicos por plataforma
- El sistema detecta binarios de Windows cuando necesita binarios de Linux
- Esto ocurre cuando `node_modules` se comparte entre Windows y WSL

### **4.2 Diagnóstico del Problema**
```bash
# Verificar si tienes el problema
wrangler --version
# Si falla con el error de arriba, tienes el problema

# Verificar que npx funciona
npx wrangler --version
# Si esto funciona, confirma que npx es la solución
```

### **4.3 Solución Definitiva Paso a Paso**

#### **Opción A: Limpiar Instalaciones (Recomendado)**
```bash
# 1. Limpiar instalaciones cruzadas
rm -rf node_modules package-lock.json

# 2. Reinstalar completamente en WSL
npm install

# 3. Verificar que npx funciona
npx wrangler --version

# 4. NUNCA usar wrangler global en WSL
# ❌ NO HACER: npm install -g wrangler
# ✅ SIEMPRE USAR: npx wrangler
```

#### **Opción B: Usar Solo npx (Más Simple)**
```bash
# Si no quieres limpiar instalaciones, simplemente usa npx siempre
npx wrangler login
npx wrangler pages deploy dist --project-name=tu-proyecto
```

### **4.4 Por qué npx es la Solución Perfecta**
1. **Descarga automática**: npx descarga la versión correcta para la plataforma actual
2. **Sin conflictos**: Evita completamente los conflictos Windows/Linux
3. **Sin instalación global**: No requiere instalación global problemática
4. **Siempre actualizado**: Usa la versión más reciente disponible
5. **Funciona en cualquier entorno**: WSL, Linux nativo, macOS, Windows

### **4.5 Configuración Recomendada para WSL**
```bash
# En tu .bashrc o .zshrc (opcional)
alias wrangler="npx wrangler"

# Esto te permite usar 'wrangler' como comando normal
# pero internamente ejecuta 'npx wrangler'
```

### **4.6 Verificación Final**
```bash
# Estos comandos deben funcionar sin errores
npx wrangler whoami
npx wrangler pages project list
npm run deploy
```

**💡 Consejo Crítico**: En WSL, SIEMPRE usa `npx wrangler` en lugar de `wrangler` global. Esta es la diferencia entre que funcione o no.

---

## � **FASE 5: Primer Deploy y Verificación**

### **5.1 Commit y Push Inicial**
```bash
# Agregar todos los archivos de configuración
git add .

# Commit con mensaje descriptivo
git commit -m "🚀 Configure deploy automation

✅ Added wrangler.toml configuration
✅ Added GitHub Actions workflow
✅ Added deploy scripts to package.json
✅ Ready for automatic deployment"

# Push para activar el primer deploy automático
git push origin main
```

### **5.2 Monitorear el Deploy en GitHub Actions**
1. Ir a: `https://github.com/tu-usuario/tu-proyecto/actions`
2. Deberías ver un workflow ejecutándose
3. Click en el workflow para ver detalles
4. Monitorear cada paso:
   - ✅ Checkout
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Build project
   - ✅ Deploy to Cloudflare Pages

### **5.3 Verificar Deploy Exitoso**
**Indicadores de éxito**:
- ✅ Status: "Deploy successful!"
- ✅ Duración: ~1-2 minutos
- ✅ Preview URL generada
- ✅ Todos los pasos en verde

**Ejemplo de salida exitosa**:
```
deploy summary
Deploying with Cloudflare Pages
Name	Result
Last commit:	abc123def
Status:	✅ Deploy successful!
Preview URL:	https://xxxxxxxx.tu-proyecto.pages.dev
Branch Preview URL:	https://xxxxxxxx.tu-proyecto.pages.dev
```

### **5.4 Probar el Sitio Desplegado**
```bash
# Abrir la URL de preview para verificar
# La URL aparece en el summary de GitHub Actions
```

---

## 📝 **FASE 6: Documentación del Proyecto**

### **6.1 Crear DEPLOY.md Completo**
```markdown
# 🚀 Deploy Guide - [Nombre del Proyecto]

## 📋 Scripts Disponibles

### Desarrollo
- `npm run deploy` - Deploy rápido (permite cambios sin commit)
- `npm run deploy:preview` - Deploy a entorno de preview

### Producción
- `npm run deploy:clean` - Deploy limpio (requiere commits limpios)
- `git push origin main` - Deploy automático vía GitHub Actions

### Utilidades
- `npm run pages:list` - Listar proyectos en Cloudflare
- `npm run wrangler:login` - Re-autenticación con Cloudflare

## 🔄 Workflow Recomendado

### Desarrollo Local
1. `npm run dev` - Servidor de desarrollo
2. Hacer cambios y probar
3. `npm run deploy` - Deploy rápido para testing
4. Verificar en URL de preview

### Producción
1. `git add .` - Agregar cambios
2. `git commit -m "descripción"` - Commit limpio
3. `git push origin main` - Deploy automático
4. Verificar en GitHub Actions

## 🛠️ Troubleshooting

### Error de Binarios WSL
```bash
# Síntoma: Error de workerd platform
# Solución: Usar siempre npx wrangler
npx wrangler --version  # ✅ Funciona
wrangler --version      # ❌ Puede fallar
```

### Error de Autenticación
```bash
# Re-autenticar
npm run wrangler:login
```

### Error en GitHub Actions
- Verificar secrets configurados
- Verificar permisos del API token
- Revisar logs en GitHub Actions

## 📊 URLs Importantes
- **Producción**: https://tu-proyecto.pages.dev
- **GitHub Actions**: https://github.com/tu-usuario/tu-proyecto/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
```

### **6.2 Actualizar README.md**
```markdown
# 🍣 Tu Proyecto

Descripción del proyecto.

## 🚀 Deploy Automático Configurado
- ✅ GitHub Actions configurado para deploy automático
- ✅ Push a `main` → Deploy automático a Cloudflare Pages
- ✅ URL de producción: https://tu-proyecto.pages.dev

## 🔧 Desarrollo Local
```bash
npm install
npm run dev
```

## 📦 Deploy
```bash
# Deploy manual rápido
npm run deploy

# Deploy automático
git push origin main
```

## 📚 Documentación
- [Deploy Guide](./DEPLOY.md) - Guía completa de deploy
```

## 🔄 **FASE 7: Workflow Completo de Desarrollo**

### **7.1 Workflow de Desarrollo Diario**

#### **Para Cambios Pequeños (Desarrollo Rápido)**
```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev

# 3. Deploy rápido para testing (permite cambios sin commit)
npm run deploy

# 4. Verificar en URL de preview
# 5. Si está bien, hacer commit y push para producción
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

#### **Para Features Grandes (Desarrollo con Branches)**
```bash
# 1. Crear branch para la feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y probar localmente
npm run dev

# 3. Deploy a preview para testing
npm run deploy:preview

# 4. Cuando esté listo, merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
# ↑ Esto activa deploy automático a producción
```

### **7.2 Workflow de Producción**
```bash
# Cualquier push a main activa deploy automático
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# GitHub Actions automáticamente:
# 1. Hace checkout del código
# 2. Instala dependencias
# 3. Ejecuta build
# 4. Deploya a Cloudflare Pages
# 5. Genera URL de preview
```

### **7.3 Monitoreo y Verificación**
```bash
# Ver status de deploys
# GitHub Actions: https://github.com/tu-usuario/tu-proyecto/actions

# Ver proyectos en Cloudflare
npm run pages:list

# Re-autenticar si es necesario
npm run wrangler:login
```

---

## ✅ **FASE 8: Testing y Verificación Completa**

### **8.1 Checklist de Verificación Post-Configuración**

#### **✅ Verificar Configuración Local**
```bash
# 1. Verificar autenticación
npx wrangler whoami
# Debe mostrar tu cuenta y permisos

# 2. Verificar proyecto existe
npm run pages:list
# Debe mostrar tu proyecto

# 3. Probar deploy manual
npm run deploy
# Debe generar URL de preview exitosamente
```

#### **✅ Verificar GitHub Actions**
```bash
# 1. Hacer un cambio pequeño
echo "# Test deploy" >> README.md

# 2. Commit y push
git add .
git commit -m "test: verificar deploy automático"
git push origin main

# 3. Verificar en GitHub Actions
# Ir a: https://github.com/tu-usuario/tu-proyecto/actions
# Debe mostrar workflow ejecutándose
```

#### **✅ Verificar Secrets de GitHub**
- Ir a: `https://github.com/tu-usuario/tu-proyecto/settings/secrets/actions`
- Verificar que existen:
  - ✅ `CLOUDFLARE_ACCOUNT_ID`
  - ✅ `CLOUDFLARE_API_TOKEN`

### **8.2 Testing de URLs**

#### **URLs a Verificar**
```bash
# 1. URL de producción (después del primer deploy exitoso)
# https://tu-proyecto.pages.dev

# 2. URLs de preview (generadas en cada deploy)
# https://xxxxxxxx.tu-proyecto.pages.dev

# 3. GitHub Actions
# https://github.com/tu-usuario/tu-proyecto/actions
```

#### **Verificación de Funcionalidad**
- ✅ Sitio carga correctamente
- ✅ Todas las páginas funcionan
- ✅ Assets (imágenes, CSS, JS) cargan
- ✅ Funcionalidades específicas del proyecto

### **8.3 Performance y Optimización**

#### **Verificar Tiempos de Deploy**
- **Deploy manual**: ~30-60 segundos
- **Deploy automático**: ~1-2 minutos
- **Build time**: Depende del proyecto

#### **Optimizaciones Implementadas**
- ✅ `npm ci` en lugar de `npm install` (más rápido)
- ✅ Cache de Node.js en GitHub Actions
- ✅ Build optimizado de Astro
- ✅ CDN global de Cloudflare

---

## 🎯 **FASE 9: Resultado Final y Optimizaciones**

### **9.1 ✅ Lo que Tienes Funcionando**

#### **Deploy Automático Completo**
- ✅ **Push a main** → Deploy automático en ~1-2 minutos
- ✅ **GitHub Actions** ejecuta build y deploy
- ✅ **Cloudflare Pages** recibe y publica el sitio
- ✅ **URLs de preview** generadas automáticamente

#### **Deploy Manual para Desarrollo**
- ✅ **`npm run deploy`** - Deploy rápido con cambios sin commit
- ✅ **`npm run deploy:clean`** - Deploy limpio para producción
- ✅ **`npm run deploy:preview`** - Deploy a entorno de pruebas

#### **Resolución de Problemas WSL**
- ✅ **npx wrangler** funciona perfectamente en WSL
- ✅ **Sin conflictos** de binarios Windows/Linux
- ✅ **Workflow consistente** en cualquier entorno

### **9.2 📊 Comandos de Referencia Rápida**

#### **Comandos Diarios**
```bash
# Desarrollo local
npm run dev

# Deploy rápido (desarrollo)
npm run deploy

# Deploy automático (producción)
git push origin main
```

#### **Comandos de Utilidad**
```bash
# Ver proyectos en Cloudflare
npm run pages:list

# Re-autenticar
npm run wrangler:login

# Verificar configuración
npx wrangler whoami
```

#### **Comandos de Troubleshooting**
```bash
# Si hay problemas de binarios WSL
rm -rf node_modules package-lock.json
npm install

# Verificar que npx funciona
npx wrangler --version
```

### **9.3 🚀 Optimizaciones Avanzadas (Opcionales)**

#### **Dominios Personalizados**
```bash
# En Cloudflare Pages Dashboard:
# 1. Ir a tu proyecto
# 2. Custom domains → Set up a custom domain
# 3. Agregar tu dominio
# 4. Configurar DNS records
```

#### **Preview Deployments para Pull Requests**
```yaml
# Agregar a .github/workflows/deploy.yml
on:
  pull_request:
    branches: [ main ]
# Esto creará deploys de preview para cada PR
```

#### **Notificaciones de Deploy**
```yaml
# Agregar step al workflow para notificaciones
- name: Notify Deploy Success
  if: success()
  run: |
    echo "Deploy successful! URL: ${{ steps.deploy.outputs.url }}"
    # Aquí puedes agregar notificaciones a Slack, Discord, etc.
```

#### **Variables de Entorno**
```toml
# En wrangler.toml
[env.production.vars]
API_URL = "https://api.tu-proyecto.com"
DEBUG = "false"

[env.preview.vars]
API_URL = "https://api-staging.tu-proyecto.com"
DEBUG = "true"
```

### **9.4 📈 Métricas y Monitoreo**

#### **GitHub Actions Insights**
- **Tiempo promedio de deploy**: ~1-2 minutos
- **Tasa de éxito**: Debería ser >95%
- **Frecuencia de deploys**: Según tu ritmo de desarrollo

#### **Cloudflare Analytics**
- **Performance**: Core Web Vitals automáticos
- **Tráfico**: Visitantes y requests
- **Errores**: 4xx/5xx responses

### **9.5 🛡️ Seguridad y Mejores Prácticas**

#### **Gestión de Tokens**
- ✅ **Tokens en secrets**: Nunca en código
- ✅ **Permisos mínimos**: Solo lo necesario
- ✅ **Rotación regular**: Cambiar tokens periódicamente

#### **Workflow Seguro**
- ✅ **Branches protegidas**: Requerir reviews para main
- ✅ **Status checks**: Requerir que GitHub Actions pase
- ✅ **Signed commits**: Para mayor seguridad

#### **Backup y Rollback**
- ✅ **Git history**: Rollback a cualquier commit
- ✅ **Cloudflare rollback**: Rollback desde dashboard
- ✅ **Deploy tags**: Para releases importantes

---

## 🔧 **FASE 10: Troubleshooting Completo**

### **10.1 Problemas Comunes y Soluciones**

#### **🚨 Error de Binarios WSL**
**Síntoma**:
```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

**Diagnóstico**:
```bash
# Verificar si tienes el problema
wrangler --version  # ❌ Falla
npx wrangler --version  # ✅ Funciona
```

**Solución Completa**:
```bash
# Opción 1: Limpiar instalaciones
rm -rf node_modules package-lock.json
npm install

# Opción 2: Usar solo npx (recomendado)
# Siempre usar: npx wrangler
# Nunca usar: wrangler global en WSL

# Verificar solución
npx wrangler whoami  # Debe funcionar
```

#### **🔐 Error de Autenticación**
**Síntoma**:
```
Error: Authentication required
Error: Not authenticated
```

**Solución**:
```bash
# Re-autenticar
npx wrangler login

# Verificar autenticación
npx wrangler whoami

# Si persiste, logout y login
npx wrangler logout
npx wrangler login
```

#### **📂 Error de Proyecto No Encontrado**
**Síntoma**:
```
Error: Project not found
Error: Could not find project
```

**Diagnóstico**:
```bash
# Ver proyectos existentes
npm run pages:list
```

**Solución**:
```bash
# Crear proyecto si no existe
npm run pages:create

# Verificar nombre en wrangler.toml
# Debe coincidir exactamente con el proyecto en Cloudflare
```

#### **⚙️ Error en GitHub Actions**
**Síntoma**: Workflow falla en step "Deploy to Cloudflare Pages"

**Diagnóstico**:
```bash
# Verificar secrets en GitHub
# Settings → Secrets and variables → Actions
# Deben existir:
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID
```

**Solución**:
```bash
# 1. Verificar Account ID
npx wrangler whoami
# Copiar Account ID exacto

# 2. Verificar API Token
# Ir a: https://dash.cloudflare.com/profile/api-tokens
# Verificar permisos:
# - Account:Cloudflare Pages:Edit
# - Zone:Zone:Read (opcional)

# 3. Recrear secrets si es necesario
# GitHub → Settings → Secrets → Actions
# Eliminar y recrear ambos secrets
```

#### **🏗️ Error de Build**
**Síntoma**: Build falla en GitHub Actions

**Diagnóstico**:
```bash
# Probar build local
npm run build

# Verificar dependencias
npm ci
```

**Solución**:
```bash
# Si build local funciona pero CI falla:
# 1. Verificar Node.js version en workflow
# 2. Verificar package-lock.json está commiteado
# 3. Verificar scripts en package.json

# Si build local también falla:
# 1. Revisar errores específicos
# 2. Verificar dependencias
# 3. Verificar configuración de Astro
```

### **10.2 Comandos de Diagnóstico**

#### **Verificación Completa del Sistema**
```bash
# 1. Verificar Node.js y npm
node --version
npm --version

# 2. Verificar Wrangler
npx wrangler --version
npx wrangler whoami

# 3. Verificar proyecto local
npm run build
npm run pages:list

# 4. Verificar Git
git status
git remote -v

# 5. Probar deploy manual
npm run deploy
```

#### **Logs y Debugging**
```bash
# Deploy con logs detallados
npx wrangler pages deploy dist --project-name=tu-proyecto --verbose

# Ver logs de GitHub Actions
# GitHub → Actions → Click en workflow → Ver logs detallados

# Ver logs de Cloudflare
# Cloudflare Dashboard → Pages → Tu proyecto → View details
```

### **10.3 Recuperación de Errores**

#### **Rollback de Deploy**
```bash
# Opción 1: Rollback desde Cloudflare Dashboard
# Pages → Tu proyecto → Deployments → Rollback

# Opción 2: Rollback con Git
git revert HEAD
git push origin main  # Activa deploy automático del rollback
```

#### **Recrear Configuración Completa**
```bash
# Si todo falla, recrear desde cero:

# 1. Limpiar configuración local
rm -rf node_modules package-lock.json .wrangler
npm install

# 2. Re-autenticar
npx wrangler logout
npx wrangler login

# 3. Recrear proyecto
npx wrangler pages project create tu-proyecto-nuevo

# 4. Actualizar wrangler.toml
# name = "tu-proyecto-nuevo"

# 5. Recrear secrets en GitHub
# Eliminar y recrear CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID

# 6. Probar deploy
npm run deploy
```

---

## 💡 **FASE 11: Tips y Mejores Prácticas Avanzadas**

### **11.1 🔒 Seguridad y Gestión de Tokens**

#### **Gestión Segura de Tokens**
```bash
# ✅ HACER:
# - Usar secrets de GitHub para tokens
# - Crear tokens con permisos mínimos necesarios
# - Rotar tokens cada 3-6 meses
# - Usar nombres descriptivos para tokens

# ❌ NO HACER:
# - Commitear tokens en el código
# - Usar tokens con permisos excesivos
# - Compartir tokens por email/chat
# - Usar el mismo token para múltiples proyectos
```

#### **Configuración de Permisos Mínimos**
```
Token para GitHub Actions:
✅ Account: Cloudflare Pages:Edit
✅ Zone: Zone:Read (solo si usas dominio personalizado)
❌ Account: Admin (demasiado permisivo)
❌ Zone: Edit (innecesario para Pages)
```

### **11.2 ⚡ Optimización de Performance**

#### **GitHub Actions Optimizado**
```yaml
# Usar cache para acelerar builds
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← Esto acelera significativamente

# Usar npm ci en lugar de npm install
- name: Install dependencies
  run: npm ci  # ← Más rápido y determinístico que npm install
```

#### **Optimización de Build**
```bash
# En desarrollo (permite cambios sin commit)
npm run deploy  # Usa --commit-dirty=true

# En producción (requiere commit limpio)
git push origin main  # GitHub Actions usa npm ci + build optimizado
```

### **11.3 📝 Documentación y Mantenimiento**

#### **Documentación Esencial**
```markdown
# Crear estos archivos en tu proyecto:

1. DEPLOY.md - Guía de deploy completa
2. README.md - Overview del proyecto y quick start
3. .github/PULL_REQUEST_TEMPLATE.md - Template para PRs
4. CONTRIBUTING.md - Guía para contribuidores
```

#### **Checklist de Mantenimiento**
```bash
# Mensual:
# - Verificar que deploys funcionan correctamente
# - Revisar logs de GitHub Actions por errores
# - Actualizar dependencias: npm update

# Trimestral:
# - Rotar API tokens de Cloudflare
# - Revisar permisos de tokens
# - Actualizar documentación

# Anual:
# - Revisar configuración completa
# - Actualizar Node.js version en GitHub Actions
# - Evaluar nuevas features de Cloudflare Pages
```

### **11.4 🔄 Workflow Avanzado**

#### **Branches y Environments**
```bash
# Configuración recomendada:
main → Producción (deploy automático)
develop → Staging (deploy manual)
feature/* → Preview (deploy manual)

# Comandos por environment:
npm run deploy:clean      # Para main → producción
npm run deploy:preview    # Para features → preview
npm run deploy           # Para desarrollo rápido
```

#### **Preview Deployments para PRs**
```yaml
# Agregar a .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [ main ]
  pull_request:  # ← Esto crea previews para PRs
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... pasos existentes ...
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tu-proyecto
          directory: dist
          # GitHub automáticamente crea preview URLs para PRs
```

---

## 📚 **FASE 12: Recursos y Referencias Completas**

### **12.1 📖 Documentación Oficial**

#### **Cloudflare**
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [API Tokens Guide](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Pages GitHub Integration](https://developers.cloudflare.com/pages/platform/github-integration/)

#### **GitHub Actions**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Action](https://github.com/cloudflare/pages-action)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

#### **Astro**
- [Astro Deploy Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Astro Configuration](https://docs.astro.build/en/reference/configuration-reference/)

### **12.2 🛠️ Herramientas Útiles**

#### **CLI Tools**
```bash
# Wrangler (principal)
npx wrangler --help

# GitHub CLI (opcional)
gh workflow list
gh workflow run deploy.yml

# Cloudflare CLI alternativo
npm install -g @cloudflare/cli
```

#### **VS Code Extensions**
- Cloudflare Workers
- GitHub Actions
- Astro
- YAML

### **12.3 🌐 Comunidad y Soporte**

#### **Canales de Soporte**
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Astro Discord](https://astro.build/chat)
- [GitHub Community](https://github.community/)

#### **Ejemplos y Templates**
- [Cloudflare Pages Examples](https://github.com/cloudflare/pages-example-projects)
- [Astro Examples](https://github.com/withastro/astro/tree/main/examples)

---

## 🎯 **CONCLUSIÓN: Deploy Automático Profesional Completado**

### **✅ Lo que Has Logrado**

#### **Infraestructura Completa**
- ✅ **Deploy automático** en cada push a main
- ✅ **Deploy manual** para desarrollo rápido
- ✅ **GitHub Actions CI/CD** completamente configurado
- ✅ **Resolución de problemas WSL** implementada
- ✅ **Documentación completa** para el equipo

#### **Workflow Profesional**
- ✅ **Desarrollo**: `npm run dev` → `npm run deploy` → verificar
- ✅ **Producción**: `git push origin main` → deploy automático
- ✅ **Troubleshooting**: Guías completas para cualquier problema
- ✅ **Escalabilidad**: Configuración lista para equipos grandes

#### **Beneficios Obtenidos**
- ⚡ **Deploy en ~1-2 minutos** desde push
- 🔒 **Seguridad** con tokens y secrets apropiados
- 📊 **Monitoreo** completo con GitHub Actions
- 🌍 **CDN global** de Cloudflare automático
- 🔄 **Rollback fácil** si algo falla

### **🚀 Próximos Pasos Recomendados**

1. **Configurar dominio personalizado** en Cloudflare Pages
2. **Implementar preview deployments** para Pull Requests
3. **Agregar notificaciones** de deploy (Slack, Discord, email)
4. **Configurar métricas** y monitoreo avanzado
5. **Implementar Workers** para funcionalidades serverless

### **💡 Lecciones Clave Aprendidas**

1. **WSL + Wrangler**: Siempre usar `npx wrangler` para evitar problemas de binarios
2. **Secrets Management**: Usar GitHub Secrets para tokens, nunca commitear credenciales
3. **CI/CD Optimization**: `npm ci` + cache de Node.js acelera significativamente los builds
4. **Documentation**: Documentación clara es esencial para mantenimiento a largo plazo
5. **Testing**: Probar tanto deploy manual como automático antes de considerar completo

### **🎉 ¡Felicitaciones!**

Has implementado exitosamente un sistema de deploy automático profesional que:
- Funciona de manera consistente en cualquier entorno
- Escala para equipos de cualquier tamaño
- Incluye todas las mejores prácticas de la industria
- Está completamente documentado para futuro mantenimiento

**Este tutorial te servirá como referencia completa para replicar este setup en cualquier proyecto futuro.** 🚀

---

**💡 Tip Final**: Guarda este tutorial como referencia. Cada paso ha sido probado y validado en un proyecto real, y incluye todas las lecciones aprendidas del proceso completo.