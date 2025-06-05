# 🚀 Deploy Guide - Cappato.dev Blog

## 📋 **Configuración Inicial**

### **1. Instalación de Dependencias**
```bash
# Instalar todas las dependencias (incluye Wrangler)
npm install
```

### **2. Setup Automático de Wrangler**
```bash
# Ejecutar script de configuración automática
npm run wrangler:setup
```

Este script automáticamente:
- ✅ Verifica/instala Wrangler
- ✅ Autentica con Cloudflare (abre browser)
- ✅ Crea el proyecto en Cloudflare Pages
- ✅ Verifica que el build funcione
- ✅ Muestra instrucciones de uso

### **3. Setup Manual (Alternativo)**
```bash
# Autenticar con Cloudflare
npm run wrangler:login

# Verificar autenticación
wrangler whoami

# Listar proyectos existentes
npm run wrangler:list
```

## 🚀 **Comandos de Deploy**

### **Deploy Básico**
```bash
# Build y deploy en un comando
npm run deploy
```

### **Deploy por Ambiente**
```bash
# Deploy a producción
npm run deploy:production

# Deploy a desarrollo
npm run deploy:dev
```

### **Deploy Manual**
```bash
# Build primero
npm run build

# Deploy manual
wrangler pages deploy dist
```

## 🔧 **Comandos de Gestión**

### **Información del Proyecto**
```bash
# Ver información del proyecto
npm run wrangler:info

# Listar todos los proyectos
npm run wrangler:list

# Ver deployments recientes
wrangler pages deployment list --project-name cappato-blog
```

### **Logs y Debug**
```bash
# Ver logs de deployment
wrangler pages deployment tail --project-name cappato-blog

# Debug de configuración
wrangler pages project show cappato-blog
```

## 🌐 **Configuración de Dominio Personalizado**

### **1. En Cloudflare Dashboard**
1. Ve a **Pages** > **cappato-blog**
2. Pestaña **Custom domains**
3. Clic en **Set up a custom domain**
4. Ingresa: `cappato.dev`
5. Sigue las instrucciones de DNS

### **2. Configuración DNS**
```
# Registros DNS necesarios
Type: CNAME
Name: @
Target: cappato-blog.pages.dev

Type: CNAME  
Name: www
Target: cappato-blog.pages.dev
```

## 📁 **Estructura de Archivos**

```
cappato.dev-blog/
├── wrangler.toml              # Configuración de Wrangler
├── package.json               # Scripts de deploy
├── scripts/
│   └── setup-wrangler.js      # Script de configuración automática
├── dist/                      # Output de build (generado)
├── src/                       # Código fuente
└── DEPLOY.md                  # Esta documentación
```

## ⚙️ **Configuración Avanzada**

### **Variables de Entorno**
```toml
# En wrangler.toml
[vars]
NODE_ENV = "production"
SITE_URL = "https://cappato.dev"
```

### **Headers Personalizados**
Los headers están configurados en `public/_headers` y se aplican automáticamente.

### **Redirects**
Los redirects están configurados en `public/_redirects` y se aplican automáticamente.

## 🔄 **Workflow Recomendado**

### **Desarrollo**
```bash
# 1. Desarrollo local
npm run dev

# 2. Testing
npm run test:all

# 3. Build local
npm run build

# 4. Preview local
npm run preview
```

### **Deploy a Producción**
```bash
# 1. Commit cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Deploy
npm run deploy:production

# 3. Verificar en https://cappato.dev
```

## 🛠️ **Troubleshooting**

### **Problemas Comunes**

#### **Error de Autenticación**
```bash
# Re-autenticar
npm run wrangler:login
```

#### **Proyecto No Encontrado**
```bash
# Crear proyecto manualmente
wrangler pages project create cappato-blog
```

#### **Build Falla**
```bash
# Limpiar y rebuild
rm -rf dist node_modules
npm install
npm run build
```

#### **Deploy Falla**
```bash
# Verificar configuración
npm run wrangler:info

# Deploy con más información
wrangler pages deploy dist --project-name cappato-blog --verbose
```

### **Comandos de Debug**
```bash
# Ver configuración actual
cat wrangler.toml

# Verificar build output
ls -la dist/

# Test de conectividad
wrangler pages project list
```

## 📊 **Beneficios del Setup**

### **✅ Ventajas**
- 🚀 **Deploy en segundos** con un comando
- 🌐 **CDN global** de Cloudflare
- 🔒 **HTTPS automático** y certificados SSL
- 📈 **Analytics integrado** de Cloudflare
- 🛡️ **DDoS protection** incluida
- ⚡ **Performance optimizada** automáticamente

### **🎯 Casos de Uso**
- **Desarrollo**: `npm run deploy:dev`
- **Staging**: `npm run deploy`  
- **Producción**: `npm run deploy:production`
- **Hotfix**: `npm run deploy && git push`

## 🆘 **Soporte**

### **Documentación Oficial**
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Astro Deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)

### **Comandos de Ayuda**
```bash
# Ayuda de Wrangler
wrangler --help

# Ayuda específica de Pages
wrangler pages --help

# Versión actual
wrangler --version
```

---

¡Con esta configuración, el deploy del blog es tan simple como ejecutar `npm run deploy`! 🎉
