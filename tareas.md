# 📚 **Tutorial: Deploy Automático con Wrangler y GitHub Actions**

## 🎯 **Objetivo**
Configurar deploy automático para proyectos Astro en Cloudflare Pages, resolviendo problemas de WSL y estableciendo CI/CD profesional.

## 📋 **Prerrequisitos**
- Proyecto Astro funcionando
- Cuenta de Cloudflare
- Repositorio en GitHub
- Entorno WSL (opcional, pero cubierto)

---

## 🚀 **Paso 1: Configuración Inicial de Cloudflare**

### **1.1 Crear Proyecto en Cloudflare Pages**
```bash
# Instalar Wrangler (usar npx para evitar problemas WSL)
npx wrangler login

# Crear proyecto
npx wrangler pages project create tu-proyecto
```

### **1.2 Configurar wrangler.toml**
```toml
name = "tu-proyecto"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
name = "tu-proyecto"
```

---

## 🔧 **Paso 2: Scripts de Deploy en package.json**

### **2.1 Agregar Scripts Optimizados**
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
    "wrangler:login": "npx wrangler login"
  }
}
```

### **2.2 Explicación de Scripts**
- **`deploy`**: Desarrollo rápido (permite cambios sin commit)
- **`deploy:clean`**: Producción (requiere commits limpios)
- **`deploy:ci`**: Para GitHub Actions (sin npx)
- **`deploy:preview`**: Entorno de pruebas

---

## 🤖 **Paso 3: GitHub Actions CI/CD**

### **3.1 Crear .github/workflows/deploy.yml**
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

### **3.2 Configurar Secrets en GitHub**
1. Ir a Settings → Secrets and variables → Actions
2. Agregar:
   - `CLOUDFLARE_API_TOKEN`: Token de Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta

### **3.3 Obtener Tokens de Cloudflare**
```bash
# Ver Account ID
npx wrangler whoami

# Crear API Token en Cloudflare Dashboard:
# My Profile → API Tokens → Create Token
# Template: "Custom token"
# Permissions: Zone:Zone:Read, Account:Cloudflare Pages:Edit
```

---

## 🛠️ **Paso 4: Resolver Problemas de WSL**

### **4.1 El Problema Común**
```
Error: You installed workerd on another platform than the one you're currently using.
Specifically the "@cloudflare/workerd-windows-64" package is present but this platform
needs the "@cloudflare/workerd-linux-64" package instead.
```

### **4.2 Solución Definitiva**
```bash
# Limpiar instalaciones cruzadas
rm -rf node_modules package-lock.json

# Reinstalar en WSL
npm install

# USAR npx en lugar de instalación global
npx wrangler --version  # ✅ Funciona
wrangler --version      # ❌ Falla en WSL
```

### **4.3 Por qué npx Funciona**
- Descarga binarios correctos para la plataforma actual
- Evita conflictos Windows/Linux
- No requiere instalación global problemática

---

## 📝 **Paso 5: Documentación del Proyecto**

### **5.1 Crear DEPLOY.md**
```markdown
# 🚀 Deploy Guide

## Scripts Disponibles
- `npm run deploy` - Deploy rápido (desarrollo)
- `npm run deploy:clean` - Deploy limpio (producción)
- `npm run deploy:preview` - Deploy a preview

## Workflow
1. Desarrollo: `npm run dev`
2. Deploy rápido: `npm run deploy`
3. Producción: Push a main (GitHub Actions)

## Troubleshooting WSL
Si tienes errores de binarios, usar `npx wrangler` siempre.
```

---

## 🔄 **Paso 6: Workflow Completo**

### **6.1 Desarrollo Local**
```bash
# 1. Hacer cambios
git checkout -b feature/nueva-funcionalidad

# 2. Probar localmente
npm run dev

# 3. Deploy rápido para testing
npm run deploy

# 4. Verificar en URL temporal
```

### **6.2 Producción**
```bash
# 1. Commit limpio
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main

# 3. GitHub Actions hace deploy automático
# 4. Verificar en producción
```

---

## ✅ **Paso 7: Verificación y Testing**

### **7.1 Probar Deploy Manual**
```bash
npm run deploy:clean
```

### **7.2 Probar GitHub Actions**
```bash
git push origin main
# Verificar en GitHub → Actions tab
```

### **7.3 Verificar URLs**
- **Producción**: https://tu-proyecto.pages.dev
- **Preview**: URLs temporales en cada deploy

---

## 🎯 **Resultado Final**

### **✅ Lo que Obtienes**
- Deploy automático en cada push a main
- Deploy manual rápido para desarrollo
- Resolución de problemas WSL
- Workflow profesional y escalable
- Documentación clara para el equipo

### **📊 Comandos Clave**
```bash
# Desarrollo
npm run deploy

# Producción manual
npm run deploy:clean

# Ver proyectos
npm run pages:list

# Re-autenticar
npm run wrangler:login
```

### **🚀 Próximos Pasos**
1. Configurar dominios personalizados
2. Agregar Workers para funcionalidades avanzadas
3. Implementar preview deployments por PR
4. Configurar notificaciones de deploy

---

## 🔧 **Troubleshooting Común**

### **Error de Binarios WSL**
```bash
# Síntoma
Error: You installed workerd on another platform...

# Solución
rm -rf node_modules package-lock.json
npm install
# Usar siempre npx wrangler
```

### **Error de Autenticación**
```bash
# Síntoma
Error: Authentication required

# Solución
npx wrangler login
```

### **Error de Proyecto No Encontrado**
```bash
# Síntoma
Error: Project not found

# Solución
npm run pages:create
npm run pages:list
```

### **Error en GitHub Actions**
```bash
# Verificar secrets configurados:
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID

# Verificar permisos del token:
# Account:Cloudflare Pages:Edit
# Zone:Zone:Read
```

---

## 💡 **Tips y Mejores Prácticas**

### **🔒 Seguridad**
- Nunca commitear tokens en el código
- Usar secrets de GitHub para tokens
- Rotar tokens periódicamente
- Usar permisos mínimos necesarios

### **⚡ Performance**
- Usar `npm ci` en CI/CD (más rápido que `npm install`)
- Cachear `node_modules` en GitHub Actions
- Usar `--commit-dirty=true` solo en desarrollo

### **📝 Documentación**
- Mantener DEPLOY.md actualizado
- Documentar secrets necesarios
- Incluir troubleshooting común
- Explicar workflow al equipo

### **🔄 Workflow**
- Usar branches para features
- Deploy manual para testing rápido
- GitHub Actions para producción
- Preview deployments para PRs

---

**💡 Tip Final**: Siempre usar `npx wrangler` en WSL para evitar problemas de binarios. Esta configuración funciona de manera consistente y profesional en cualquier proyecto Astro + Cloudflare Pages.

---

## 📚 **Recursos Adicionales**

- [Documentación oficial de Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages GitHub Action](https://github.com/cloudflare/pages-action)
- [Astro Deploy Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)