# 📝 Flujo de Creación de Posts del Blog

## 🎯 Propósito

Este documento define el **flujo completo y correcto** para crear posts del blog, asegurando que todas las imágenes, tests y optimizaciones funcionen correctamente.

## ⚠️ Problema Identificado

**Fecha:** 2024-12-19  
**Issue:** Las miniaturas de posts nuevos no se mostraban correctamente porque faltaban variantes de imagen requeridas.  
**Causa:** No seguimos el flujo completo de optimización de imágenes al crear posts nuevos.

## ✅ Flujo Correcto de Creación de Posts

### **Paso 1: Crear el Post Markdown**

```bash
# Crear el archivo del post
touch src/content/blog/mi-nuevo-post.md
```

**Frontmatter requerido:**
```yaml
---
title: "Título del Post"
description: "Descripción de 50-300 caracteres para SEO"
date: "YYYY-MM-DD"
author: "Matías Cappato"
tags: ["tag1", "tag2", "tag3"]
postId: "mi-nuevo-post"                    # ← CRÍTICO: ID único
imageAlt: "Descripción de la imagen principal"
---
```

### **Paso 2: Preparar Imágenes (OBLIGATORIO)**

#### **2.1 Crear directorio de imágenes fuente:**
```bash
mkdir -p images/raw/mi-nuevo-post
```

#### **2.2 Agregar imagen principal:**
```bash
# OBLIGATORIO: Nombrar como 'portada.webp' (o .jpg/.png)
cp mi-imagen-principal.jpg images/raw/mi-nuevo-post/portada.webp
```

⚠️ **CRÍTICO:** La imagen DEBE llamarse `portada.webp` (o .jpg/.png) para que el sistema la reconozca.

### **Paso 3: Generar Variantes de Imagen (OBLIGATORIO)**

```bash
# Generar TODAS las variantes necesarias
npm run optimize-images -- --postId=mi-nuevo-post --force --debug
```

**Esto genera automáticamente:**
- ✅ `portada.webp` - Imagen principal
- ✅ `portada-avif.avif` - Formato AVIF moderno
- ✅ `portada-og.webp` - Open Graph para redes sociales
- ✅ `portada-og-jpg.jpeg` - JPEG para compatibilidad
- ✅ `portada-og-avif.avif` - AVIF para Open Graph
- ✅ `portada-thumb.webp` - **Miniatura para listados** ← CRÍTICO
- ✅ `portada-lqip.webp` - Low Quality Image Placeholder
- ✅ `portada-lqip.txt` - Datos del LQIP
- ✅ `portada-wsp.webp` - Versión para WhatsApp/Social

### **Paso 4: Verificar con Tests (OBLIGATORIO)**

```bash
# Verificar que todas las imágenes están correctas
npm run test:blog:images

# Verificar estructura del post
npm run test:blog:structure

# Ejecutar todos los tests del blog
npm run test:blog
```

**Los tests DEBEN pasar antes de continuar.**

### **Paso 5: Build y Verificación Local**

```bash
# Verificar que el build funciona
npm run build

# Verificar en desarrollo
npm run dev
# Ir a http://localhost:4321/blog y verificar que la miniatura se ve
```

### **Paso 6: Commit y Deploy**

```bash
# Solo después de que TODO funcione localmente
git add .
git commit -m "feat(blog): add new post - [título]

✅ Post content created
✅ All image variants generated  
✅ Tests passing
✅ Build successful
✅ Local verification completed"

git push origin main
```

## 🚨 Checklist de Verificación

### **Antes del Commit:**
- [ ] **Frontmatter completo** con `postId` único
- [ ] **Imagen fuente** en `images/raw/{postId}/portada.webp`
- [ ] **Variantes generadas** con `npm run optimize-images`
- [ ] **Tests pasando** con `npm run test:blog`
- [ ] **Build exitoso** con `npm run build`
- [ ] **Verificación visual** en desarrollo

### **Después del Deploy:**
- [ ] **Miniatura visible** en `/blog`
- [ ] **Post accesible** en `/blog/{slug}`
- [ ] **Imágenes cargando** correctamente
- [ ] **SEO tags** funcionando (Open Graph, etc.)

## 🔧 Comandos de Troubleshooting

### **Si faltan imágenes:**
```bash
# Verificar qué imágenes faltan
npm run test:blog:images

# Regenerar todas las variantes
npm run optimize-images -- --postId=mi-post --force

# Verificar que se generaron
ls -la public/images/mi-post/
```

### **Si los tests fallan:**
```bash
# Ver detalles del error
npm run test:blog:images -- --reporter=verbose

# Verificar estructura de archivos
find public/images/mi-post/ -name "portada*" | sort
```

### **Si la miniatura no aparece:**
```bash
# Verificar que existe portada-thumb.webp
ls -la public/images/mi-post/portada-thumb.webp

# Regenerar si falta
npm run optimize-images -- --postId=mi-post --force
```

## 📊 Variantes de Imagen Explicadas

### **Para Listados de Blog:**
- `portada-thumb.webp` - **Miniatura principal** (600x315px)
- `portada-lqip.webp` - Placeholder mientras carga

### **Para Redes Sociales:**
- `portada-og.webp` - Open Graph estándar (1200x630px)
- `portada-og-jpg.jpeg` - JPEG para compatibilidad
- `portada-og-avif.avif` - AVIF para navegadores modernos

### **Para el Post:**
- `portada.webp` - Imagen principal del post
- `portada-avif.avif` - Versión AVIF moderna

### **Para WhatsApp/Stories:**
- `portada-wsp.webp` - Formato cuadrado (1080x1080px)

## 🎯 Mejores Prácticas

### **Naming Convention:**
- **PostId:** Usar kebab-case, descriptivo pero conciso
- **Imágenes:** Siempre `portada.webp` como fuente
- **Tags:** Máximo 8 tags, relevantes al contenido

### **Optimización:**
- **Imagen fuente:** Mínimo 1200px de ancho
- **Formato:** WebP preferido, JPEG aceptable
- **Tamaño:** Máximo 2MB para la fuente

### **SEO:**
- **Título:** Máximo 60 caracteres
- **Descripción:** 120-160 caracteres ideal
- **ImageAlt:** Descriptivo y específico

## 🔄 Automatización Futura

### **Scripts a Crear:**
```bash
# Script completo de creación de post
npm run create-post -- --title="Mi Post" --postId="mi-post"

# Verificación completa antes de commit
npm run verify-post -- --postId="mi-post"
```

### **GitHub Actions:**
- Verificar que tests pasan en CI
- Validar que todas las imágenes existen
- Bloquear merge si faltan variantes

## 📚 Referencias

- [Sistema de Optimización de Imágenes](../src/features/image-optimization/README.md)
- [Tests del Blog](../src/tests/blog-images.test.ts)
- [Configuración de Imágenes](../IMAGES.md)

---

**¡IMPORTANTE:** Este flujo es OBLIGATORIO para todos los posts nuevos. No saltarse pasos para evitar problemas en producción.
