# 🔧 Problemas Comunes

**Documento**: 4.1 - IMPORTANTE  
**Propósito**: Soluciones a problemas frecuentes del proyecto

---

## **🚨 Build Fallando**

### **Síntomas**
- `npm run build` falla
- Errores de TypeScript
- Problemas de importación

### **Soluciones**
```bash
# 1. Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# 2. Verificar tipos
npm run type-check

# 3. Build limpio
npm run build
```

### **Errores Comunes**
- **Tipos faltantes**: Instalar `@types/node`
- **Imports incorrectos**: Verificar rutas relativas
- **Config TypeScript**: Verificar `tsconfig.json`

---

## **🧪 Tests Fallando**

### **Tests de Imágenes Fallando**
**Síntomas**: `npm run test:blog:images` falla
**Causa**: Imágenes referenciadas no existen o formato incorrecto
**Solución**:
```bash
# Verificar imágenes
npm run blog:images
# Optimizar si es necesario
npm run optimize-images
```

### **Tests de Build Fallando**
**Síntomas**: `npm run test:build` falla
**Causa**: Errores de compilación o dependencias
**Solución**:
```bash
# Limpiar cache
rm -rf .astro dist
npm run build
```

### **Tests Unitarios Fallando**
**Síntomas**: `npm run test:unit` falla
**Solución**:
```bash
# Ejecutar tests en modo watch
npm run test:unit -- --watch
# Ver detalles específicos
npm run test:unit -- --reporter=verbose
```

---

## **🔄 Git y PR Issues**

### **PR Muy Grande**
**Síntomas**: PR excede 300-800 líneas
**Causa**: Demasiados cambios en un solo PR
**Solución**:
1. Cerrar PR actual
2. Dividir cambios en micro-PRs
3. Crear PRs más pequeños secuencialmente

### **Conflictos de Merge**
**Síntomas**: Git reporta conflictos
**Solución**:
```bash
# Actualizar branch
git checkout main
git pull origin main
git checkout tu-branch
git rebase main
# Resolver conflictos manualmente
git add .
git rebase --continue
```

### **Branch Desactualizada**
**Síntomas**: Branch muy atrás de main
**Solución**:
```bash
git checkout main
git pull origin main
git checkout tu-branch
git rebase main
```

---

## **🌐 Deployment Issues**

### **Cloudflare Pages Falla**
**Síntomas**: Deploy falla en Cloudflare
**Causa**: Build errors o configuración incorrecta
**Solución**:
1. Verificar build local: `npm run build`
2. Verificar Node.js version: 20
3. Verificar variables de entorno

### **Assets No Cargan**
**Síntomas**: Imágenes o CSS no cargan
**Causa**: Rutas incorrectas o assets faltantes
**Solución**:
```bash
# Verificar assets
npm run build
npm run preview
# Verificar rutas en browser
```

---

## **📊 Performance Issues**

### **Core Web Vitals Pobres**
**Síntomas**: LCP > 2.5s, CLS > 0.1
**Solución**:
```bash
# Analizar performance
npm run pagespeed
npm run lighthouse

# Optimizar imágenes
npm run optimize-images

# Verificar CSS crítico
npm run optimize:css
```

### **Bundle Size Grande**
**Síntomas**: JavaScript bundle > 100KB
**Solución**:
- Verificar imports innecesarios
- Usar dynamic imports
- Eliminar dependencias no usadas

---

## **🔍 SEO Issues**

### **Meta Tags Faltantes**
**Síntomas**: SEO audit falla
**Causa**: Meta description, title o OG tags faltantes
**Solución**:
```bash
# Verificar SEO
npm run test:seo
# Verificar meta tags en posts
npm run validate:content
```

### **Sitemap No Actualiza**
**Síntomas**: Sitemap.xml desactualizado
**Solución**:
- Verificar configuración en `astro.config.mjs`
- Rebuild y redeploy

---

## **🛠️ Development Issues**

### **Hot Reload No Funciona**
**Síntomas**: Cambios no se reflejan automáticamente
**Solución**:
```bash
# Reiniciar dev server
npm run dev
# Limpiar cache
rm -rf .astro
npm run dev
```

### **TypeScript Errors**
**Síntomas**: Errores de tipos en desarrollo
**Solución**:
```bash
# Verificar configuración
npm run type-check
# Reinstalar tipos
npm install @types/node --save-dev
```

---

## **📦 Dependencies Issues**

### **Vulnerabilidades de Seguridad**
**Síntomas**: `npm audit` reporta vulnerabilidades
**Solución**:
```bash
# Auditar y fix automático
npm audit fix
# Si persisten, actualizar manualmente
npm update
```

### **Conflictos de Versiones**
**Síntomas**: Errores de peer dependencies
**Solución**:
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
# Verificar compatibilidad
npm ls
```

---

## **🔧 Environment Issues**

### **Node.js Version Incorrecta**
**Síntomas**: Errores relacionados con Node.js
**Solución**:
```bash
# Verificar versión (debe ser 20)
node --version
# Usar nvm si es necesario
nvm use 20
```

### **Variables de Entorno**
**Síntomas**: Configuración no carga
**Solución**:
- Verificar `.env` existe
- Verificar nombres de variables
- Reiniciar dev server

---

## **🚨 Emergency Procedures**

### **Proyecto Completamente Roto**
```bash
# Reset completo
git stash
git checkout main
git pull origin main
rm -rf node_modules package-lock.json .astro dist
npm install
npm run build
npm run dev
```

### **Recuperar Trabajo Perdido**
```bash
# Ver historial
git reflog
# Recuperar commit específico
git checkout HEAD@{n}
# Crear branch de backup
git checkout -b recovery-backup
```

### **CI/CD Completamente Roto**
1. Verificar GitHub Actions logs
2. Verificar Cloudflare Pages settings
3. Verificar variables de entorno
4. Contactar con admin si persiste

---

## **📞 Escalation Path**

### **Cuando Escalar**
- Problema persiste después de seguir guías
- Afecta producción
- Requiere cambios de configuración de infraestructura
- Vulnerabilidades de seguridad críticas

### **Información a Incluir**
- Descripción detallada del problema
- Pasos para reproducir
- Logs de error completos
- Configuración del entorno
- Intentos de solución realizados

---

**Esta guía cubre los problemas más frecuentes. Para issues específicos, consultar documentos 4.2 y 4.3 para lecciones aprendidas.**
