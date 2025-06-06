# Blog Testing Guide

Este documento describe los tests automatizados para prevenir problemas comunes en los posts del blog.

## 🧪 Tests Disponibles

### 1. Test de Imágenes (`blog-images.test.ts`)

**Propósito:** Prevenir imágenes rotas y problemas de visualización.

**Verifica:**
-  Todas las variantes de imagen requeridas existen
-  Archivos tienen tamaño apropiado (>1KB, no placeholders)
-  Referencias de imagen en markdown son válidas
-  Posts tienen `imageAlt` definido

**Variantes requeridas para posts con `postId`:**
```
/images/{postId}/
├── portada.webp          # Imagen principal
├── portada-avif.avif     # Formato AVIF moderno
├── portada-og.webp       # Open Graph (redes sociales)
└── portada-og-jpg.jpeg   # Fallback JPEG
```

### 2. Test de Estructura (`blog-structure.test.ts`)

**Propósito:** Mantener estructura SEO correcta y consistencia.

**Verifica:**
-  No hay H1 en contenido markdown (solo en layout)
-  Jerarquía de headings correcta (H2 → H3 → H4)
-  Frontmatter tiene campos requeridos
-  Títulos y descripciones en rangos apropiados

##  Ejecutar Tests

```bash
# Todos los tests de blog
npm run test:blog

# Solo test de imágenes
npm run test:blog:images

# Solo test de estructura
npm run test:blog:structure
```

##  Reglas de Estructura

###  Estructura Correcta

```markdown
---
title: "Mi Post Increíble"
description: "Descripción entre 50-300 caracteres que explica el contenido del post de manera clara y concisa."
date: "2024-12-19"
author: "Matías Cappato"
postId: "mi-post-increible"
imageAlt: "Descripción de la imagen principal"
tags: ["tag1", "tag2", "tag3"]
---

Introducción del post sin H1.

## Primera Sección

Contenido de la primera sección.

### Subsección

Contenido de subsección.

## Segunda Sección

Más contenido.
```

###  Estructura Incorrecta

```markdown
---
title: "Título Extremadamente Largo Que Supera Los 80 Caracteres Y Causa Problemas SEO"
description: "Muy corto"
# Faltan campos requeridos
---

# Título H1 en Markdown (INCORRECTO)

## Sección

### Subsección

##### H5 sin H4 (jerarquía rota)
```

##  Solución de Problemas Comunes

### Problema: Imágenes faltantes

```bash
# Error: Missing image variants
# Solución: Crear todas las variantes requeridas

cp mi-imagen.webp public/images/mi-post/portada.webp
cp mi-imagen.webp public/images/mi-post/portada-avif.avif
cp mi-imagen.webp public/images/mi-post/portada-og.webp
cp mi-imagen.webp public/images/mi-post/portada-og-jpg.jpeg
```

### Problema: H1 en markdown

```markdown
<!--  Incorrecto -->
# Mi Título

## Sección

<!--  Correcto -->
## Mi Primera Sección
```

### Problema: Frontmatter inválido

```yaml
#  Incorrecto
title: "Título Súper Extremadamente Largo Que Supera Los Límites Recomendados Para SEO"
description: "Muy corto"

#  Correcto
title: "Título Conciso y Descriptivo"
description: "Descripción clara y completa que explica el contenido del post de manera efectiva y atractiva para los lectores."
```

##  Arquitectura H1

**Decisión:** El layout maneja el H1, no el markdown.

**Razones:**
-  Garantiza un solo H1 por página (SEO)
-  Consistencia visual en todos los posts
-  Control centralizado del diseño
-  Previene errores humanos

**Flujo:**
1. Frontmatter define `title`
2. Layout renderiza `<h1>{title}</h1>`
3. Markdown empieza con H2 (`##`)

##  Integración CI/CD

Agregar a `.github/workflows/`:

```yaml
- name: Run Blog Tests
  run: npm run test:blog
```

Esto previene que se mergeen PRs con:
- Imágenes rotas
- Estructura H1 incorrecta
- Frontmatter inválido

##  Métricas de Calidad

Los tests ayudan a mantener:
- **SEO Score:** Estructura semántica correcta
- **Performance:** Imágenes optimizadas
- **UX:** Sin imágenes rotas
- **Consistencia:** Todos los posts siguen las mismas reglas
