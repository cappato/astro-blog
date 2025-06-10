# 📝 Sistema de Blog

**Documento**: 3.1 - IMPORTANTE  
**Propósito**: Guía completa del sistema de blog y creación de posts

---

## **🎯 Flujo de Creación de Posts**

### **Paso 1: Crear Nuevo Post**
```bash
npm run blog:new
```
- Ejecuta script interactivo
- Solicita título, descripción, tags
- Genera archivo markdown con metadata
- Crea estructura de directorios si es necesario

### **Paso 2: Escribir Contenido**
```markdown
---
title: "Título del Post"
description: "Descripción SEO optimizada"
pubDate: 2025-01-15
tags: ["javascript", "astro", "seo"]
pillar: "desarrollo"
featured: false
---

# Título del Post

Contenido del post en markdown...
```

### **Paso 3: Validar y Publicar**
```bash
npm run validate:content    # Validar contenido
npm run test:blog          # Tests específicos de blog
npm run validate:pr        # Validación pre-PR
```

---

## **📊 Estructura de Content Collections**

### **Blog Collection Schema**
```typescript
const blogSchema = z.object({
  title: z.string(),
  description: z.string().max(160),
  pubDate: z.date(),
  tags: z.array(z.string()),
  pillar: z.enum(['desarrollo', 'seo', 'performance', 'tools']),
  featured: z.boolean().default(false),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
});
```

### **Directorio de Posts**
```
src/content/blog/
├── 2025/
│   ├── 01/
│   │   ├── mi-primer-post.md
│   │   └── segundo-post.md
│   └── 02/
└── images/
    ├── 2025/
    └── thumbnails/
```

---

## **🏷️ Sistema de Tags y Pillars**

### **Pillars Disponibles**
| Pillar | Propósito | Ejemplos |
|--------|-----------|----------|
| `desarrollo` | Programación, frameworks | React, TypeScript, Astro |
| `seo` | Optimización SEO | Meta tags, Core Web Vitals |
| `performance` | Optimización performance | Lazy loading, caching |
| `tools` | Herramientas y workflows | Git, CI/CD, automation |

### **Tags Comunes**
```typescript
const commonTags = [
  'javascript', 'typescript', 'astro', 'react',
  'seo', 'performance', 'css', 'html',
  'git', 'ci-cd', 'testing', 'automation'
];
```

---

## **🖼️ Gestión de Imágenes**

### **Comandos de Imágenes**
```bash
npm run blog:images        # Optimizar imágenes del blog
npm run optimize-images    # Optimización general
npm run test:blog:images   # Validar imágenes
```

### **Estructura de Imágenes**
```
public/images/blog/
├── 2025/
│   ├── 01/
│   │   ├── post-image.webp
│   │   └── post-image-thumb.webp
│   └── thumbnails/
└── placeholders/
```

### **Optimización Automática**
- **Formatos**: WebP/AVIF preferidos
- **Tamaños**: Multiple sizes para responsive
- **Lazy Loading**: Automático en componentes
- **Alt Text**: Obligatorio para accesibilidad

---

## **📈 SEO y Metadata**

### **Meta Tags Automáticos**
```astro
---
// src/layouts/BlogPost.astro
const { frontmatter } = Astro.props;
const { title, description, pubDate, tags } = frontmatter;
---

<head>
  <title>{title} | Cappato Dev</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

### **Structured Data**
```typescript
const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Person",
    "name": "Matías Cappato"
  },
  "datePublished": pubDate.toISOString(),
};
```

---

## **⏱️ Reading Time**

### **Cálculo Automático**
```typescript
// src/utils/reading-time.ts
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

### **Uso en Templates**
```astro
---
const readingTime = calculateReadingTime(post.body);
---
<span class="reading-time">{readingTime} min de lectura</span>
```

---

## **🔗 Sistema de Enlaces**

### **Enlaces Internos**
```markdown
[Otro post relacionado](/blog/2025/01/otro-post/)
[Página de contacto](/contacto/)
```

### **Enlaces Externos**
```markdown
[Documentación de Astro](https://docs.astro.build){:target="_blank" rel="noopener"}
```

### **Related Posts**
```typescript
// Automático basado en tags comunes
function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[]) {
  return allPosts
    .filter(post => post.slug !== currentPost.slug)
    .filter(post => hasCommonTags(post.tags, currentPost.tags))
    .slice(0, 3);
}
```

---

## **📱 Responsive Design**

### **Breakpoints**
```css
/* Mobile First */
.blog-post {
  @apply text-base leading-relaxed;
}

/* Tablet */
@screen md {
  .blog-post {
    @apply text-lg leading-loose;
  }
}

/* Desktop */
@screen lg {
  .blog-post {
    @apply text-xl leading-loose max-w-4xl mx-auto;
  }
}
```

---

## **🧪 Testing del Blog**

### **Tests Automáticos**
```bash
npm run test:blog           # Suite completa de tests
npm run test:blog:structure # Validar estructura de posts
npm run test:blog:images    # Validar imágenes
npm run test:seo           # Tests SEO específicos
```

### **Validaciones**
- ✅ **Frontmatter**: Schema válido
- ✅ **Imágenes**: Existen y están optimizadas
- ✅ **Enlaces**: No hay enlaces rotos
- ✅ **SEO**: Meta tags completos
- ✅ **Performance**: Tamaño de página

---

## **📊 Analytics y Métricas**

### **Métricas Tracked**
- **Page Views**: Por post individual
- **Reading Time**: Tiempo real de lectura
- **Bounce Rate**: Engagement por post
- **Social Shares**: Compartidos en redes

### **Performance Monitoring**
```bash
npm run pagespeed          # Core Web Vitals
npm run lighthouse         # Audit completo
```

---

## **🔄 Workflow Completo**

### **Crear Post Completo**
```bash
# 1. Crear post
npm run blog:new

# 2. Escribir contenido
# Editar archivo generado

# 3. Validar
npm run validate:content
npm run test:blog

# 4. Crear PR
npm run validate:pr
npm run git:complete
```

### **Publicación Automática**
- **Merge a main**: Deployment automático
- **Cloudflare Pages**: Build y deploy
- **Sitemap**: Actualización automática
- **RSS Feed**: Actualización automática

---

**Este sistema está optimizado para SEO, performance y experiencia de usuario, con automatización completa del workflow de publicación.**
