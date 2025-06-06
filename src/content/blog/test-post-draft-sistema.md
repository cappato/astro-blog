---
title: "Test del Sistema de Drafts: Post Oculto para Revisión"
description: "Post de prueba para verificar el sistema de drafts. Este post está oculto y solo es accesible por link directo para revisión antes de publicación."
date: "2024-12-19"
author: "Matías Cappato"
tags: ["test", "draft", "sistema", "prueba", "testing"]
postId: "test-post-draft-sistema"
imageAlt: "Test del sistema de drafts - Post oculto para revisión"
draft: true
---

🧪 **Este es un post de prueba del sistema de drafts**

Este post está configurado con `draft: true` en el frontmatter, lo que significa que:

## 🔒 Comportamiento en Producción

- ❌ **NO aparece** en `/blog` (listado principal)
- ❌ **NO aparece** en `/blog/tag/test` (páginas de tags)
- ❌ **NO aparece** en `/rss.xml` (feed RSS)
- ❌ **NO aparece** en `/sitemap.xml` (sitemap)
- ❌ **NO se indexa** en buscadores
- ✅ **SÍ es accesible** por URL directa: `/blog/test-post-draft-sistema`

## 🛠️ Comportamiento en Desarrollo

- ✅ **SÍ aparece** en todos los listados (para testing)
- ✅ **SÍ aparece** en RSS y sitemap (para verificación)
- ✅ **Completamente visible** para desarrollo y testing

## 🎯 Casos de Uso del Sistema Draft

### **1. Revisión de Contenido**
- Crear post con `draft: true`
- Compartir URL directa para revisión
- Recibir feedback sin exposición pública
- Cambiar a `draft: false` para publicar

### **2. Contenido Programado**
- Preparar posts con anticipación
- Mantener en draft hasta fecha de publicación
- Publicar cambiando solo el flag draft

### **3. Colaboración**
- Escritores crean drafts
- Editores revisan por URL directa
- Aprobación antes de publicación pública

## 🔧 Cómo Usar el Sistema

### **Crear Post Draft:**
```yaml
---
title: "Mi Post"
description: "Descripción del post"
date: "2024-12-19"
author: "Autor"
tags: ["tag1", "tag2"]
postId: "mi-post"
imageAlt: "Descripción de imagen"
draft: true  # ← Esto lo hace oculto
---
```

### **Publicar Post:**
```yaml
draft: false  # ← Cambiar a false para publicar
# O simplemente eliminar la línea draft
```

## 📊 Verificación del Sistema

### **URLs para Probar:**

1. **Post directo (accesible):**
   - https://cappato.dev/blog/test-post-draft-sistema

2. **Listado principal (NO debe aparecer):**
   - https://cappato.dev/blog

3. **Tag page (NO debe aparecer):**
   - https://cappato.dev/blog/tag/test

4. **RSS Feed (NO debe aparecer):**
   - https://cappato.dev/rss.xml

5. **Sitemap (NO debe aparecer):**
   - https://cappato.dev/sitemap.xml

## ✅ Funcionalidades Completas

### **Imágenes Optimizadas**
Este post tiene todas las variantes de imagen generadas:
- `portada.webp` - Imagen principal
- `portada-avif.avif` - Formato moderno
- `portada-thumb.webp` - Miniatura (no se mostrará en listados)
- `portada-og.webp` - Open Graph (para cuando se comparta)

### **SEO Optimizado**
- Meta tags correctos
- Open Graph configurado
- Schema.org markup
- Todo funcional pero oculto de índices

### **Tests Pasando**
- Estructura correcta
- Imágenes verificadas
- Frontmatter válido
- Build exitoso

## 🎉 Resultado de la Prueba

Si puedes acceder a este post por URL directa pero NO lo ves en:
- Listado principal del blog
- Páginas de tags
- RSS feed
- Sitemap

**¡El sistema de drafts funciona perfectamente!** ✅

---

**Estado:** 🔒 Draft - Solo accesible por URL directa  
**Próximo paso:** Cambiar `draft: false` para publicar  
**URL de prueba:** https://cappato.dev/blog/test-post-draft-sistema
