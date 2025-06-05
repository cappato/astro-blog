# 🚀 Deploy Setup - Cappato.dev Blog

## 📋 **Secrets de GitHub que necesitas crear**

Ve a: **GitHub Repository > Settings > Secrets and variables > Actions**

### **1. CLOUDFLARE_API_TOKEN**
- **Valor:** El token que creaste en Cloudflare Dashboard
- **Permisos necesarios:**
  - `Cloudflare Pages:Edit`
  - `Zone:Read`

### **2. CLOUDFLARE_ACCOUNT_ID**
- **Valor:** Tu Account ID de Cloudflare
- **Dónde encontrarlo:** 
  - Ve a Cloudflare Dashboard
  - Lado derecho, sección "API" 
  - Copia el "Account ID"

---

## 🔐 **Cómo crear el Token en Cloudflare**

### **Paso 1: Ir a API Tokens**
https://dash.cloudflare.com/profile/api-tokens

### **Paso 2: Create Token**
- Click en **"Create Token"**
- Usar **"Custom token"**

### **Paso 3: Configuración del Token**
```
Token name: cappato-blog-deploy

Permissions:
- Cloudflare Pages:Edit
- Zone:Read

Account resources: Include - All accounts
Zone resources: Include - All zones
```

### **Paso 4: Copiar el Token**
- Copia el token generado
- **¡IMPORTANTE!** Solo se muestra una vez

---

## 🌐 **Configuración del Dominio**

### **Después del primer deploy:**

1. **Ve a Cloudflare Dashboard**
   - Pages > cappato-blog
   - Pestaña "Custom domains"

2. **Agregar dominio personalizado**
   - Click "Set up a custom domain"
   - Ingresa: `cappato.dev`

3. **Configurar DNS** (si es necesario)
   - El dominio ya debería estar en Cloudflare
   - Verificar que apunte al proyecto de Pages

---

## ⚡ **Workflow Automático**

### **Triggers:**
- ✅ **Push a main:** Deploy automático a producción
- ✅ **Pull Request:** Deploy de preview para testing

### **Proceso:**
1. Checkout del código
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Run tests (`npm run test:all`)
5. Build project (`npm run build`)
6. Deploy to Cloudflare Pages

### **Resultado:**
- **Main branch:** https://cappato.dev
- **PR previews:** https://[hash].cappato-blog.pages.dev

---

## 🧪 **Testing Local**

### **Antes de hacer push:**
```bash
# Test completo
npm run test:all

# Build local
npm run build

# Preview local
npm run preview
```

---

## 🔧 **Troubleshooting**

### **Error: Invalid API Token**
- Verificar que el token tenga los permisos correctos
- Regenerar el token si es necesario

### **Error: Account ID not found**
- Verificar que el CLOUDFLARE_ACCOUNT_ID sea correcto
- Debe ser el Account ID, no el Zone ID

### **Error: Project not found**
- El proyecto se crea automáticamente en el primer deploy
- Verificar que el nombre sea `cappato-blog`

### **Build fails**
- Verificar que `npm run test:all` pase localmente
- Verificar que `npm run build` funcione localmente

---

## 📊 **Estado del Setup**

### **✅ Completado:**
- [x] Workflow de GitHub Actions configurado
- [x] Configuración de Wrangler lista
- [x] Build process verificado

### **⏳ Pendiente (manual):**
- [ ] Crear CLOUDFLARE_API_TOKEN en GitHub Secrets
- [ ] Crear CLOUDFLARE_ACCOUNT_ID en GitHub Secrets
- [ ] Hacer primer push para activar el workflow
- [ ] Configurar dominio personalizado en Cloudflare

---

## 🎉 **Una vez configurado:**

¡El deploy será completamente automático! Cada push a `main` deployará automáticamente a https://cappato.dev

**Workflow:**
```
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# 🚀 Deploy automático en ~2-3 minutos
```

---

## ✅ **Status: SECRETS CONFIGURADOS**

Los secrets de GitHub han sido creados correctamente:
- ✅ CLOUDFLARE_API_TOKEN
- ✅ CLOUDFLARE_ACCOUNT_ID

**¡Listo para el primer deploy automático!** 🚀
