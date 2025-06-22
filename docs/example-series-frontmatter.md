# 📝 Ejemplo: Actualización de Frontmatter para Series

**Propósito**: Mostrar cómo actualizar el frontmatter de posts para usar el nuevo sistema de series e imágenes compartidas.

---

## 🔄 Antes vs Después

### **❌ ANTES (Sistema Actual)**

```yaml
---
title: "Configurar Wrangler y Cloudflare Pages: Guía Completa 2024"
description: "Aprende a configurar Wrangler y Cloudflare Pages desde cero..."
date: "2024-05-05"
author: "Matías Cappato"
tags: ["automation", "ci-cd", "cloudflare", "wrangler"]
postId: "configurar-wrangler-cloudflare-pages-2024"
imageAlt: "Configuración de Wrangler y Cloudflare Pages"
---
```

### **✅ DESPUÉS (Sistema Optimizado)**

```yaml
---
title: "Configurar Wrangler y Cloudflare Pages: Guía Completa 2024"
description: "Aprende a configurar Wrangler y Cloudflare Pages desde cero..."
date: "2024-05-05"
author: "Matías Cappato"
tags: ["automation", "ci-cd", "cloudflare", "wrangler"]
postId: "configurar-wrangler-cloudflare-pages-2024"
imageAlt: "Configuración de Wrangler y Cloudflare Pages"
# 🆕 NUEVOS CAMPOS PARA SERIES
series: "wrangler-deploy"
seriesOrder: 2
seriesTotal: 4
---
```

---

## 📚 Configuración por Serie

### **1. Serie "Wrangler & Deploy"**

**Posts en orden cronológico:**

```yaml
# Post 1
---
title: "Troubleshooting Wrangler: Soluciones para WSL y Deploy Issues"
series: "wrangler-deploy"
seriesOrder: 1
seriesTotal: 4
postId: "troubleshooting-wrangler-wsl-deploy"
---

# Post 2  
---
title: "Configurar Wrangler y Cloudflare Pages: Guía Completa 2024"
series: "wrangler-deploy"
seriesOrder: 2
seriesTotal: 4
postId: "configurar-wrangler-cloudflare-pages-2024"
---

# Post 3
---
title: "GitHub Actions para Deploy Automático: CI/CD con Wrangler"
series: "wrangler-deploy"
seriesOrder: 3
seriesTotal: 4
postId: "github-actions-deploy-automatico-wrangler"
---

# Post 4
---
title: "Deploy Automático con Wrangler y GitHub Actions: Serie Completa"
series: "wrangler-deploy"
seriesOrder: 4
seriesTotal: 4
postId: "deploy-automatico-wrangler-github-actions"
---
```

### **2. Serie "Astro Development"**

```yaml
# Post 1
---
title: "Hola mundo con Astro"
series: "astro-development"
seriesOrder: 1
seriesTotal: 4
postId: "primer-post"
---

# Post 2
---
title: "Arquitectura Modular en Astro: Features Reutilizables"
series: "astro-development"
seriesOrder: 2
seriesTotal: 4
postId: "arquitectura-modular-astro"
---

# Post 3
---
title: "Dark Mode Perfecto: Anti-flicker y Persistencia con Astro"
series: "astro-development"
seriesOrder: 3
seriesTotal: 4
postId: "dark-mode-perfecto-astro"
---

# Post 4
---
title: "Optimización de Performance en Astro: Técnicas Avanzadas"
series: "astro-development"
seriesOrder: 4
seriesTotal: 4
postId: "optimizacion-performance-astro-tecnicas-avanzadas"
---
```

### **3. Serie "Sistemas Automáticos"**

```yaml
# Post 1
---
title: "Anatomía de un Sistema de Protocolos Automáticos"
series: "sistemas-automaticos"
seriesOrder: 1
seriesTotal: 4
postId: "anatomia-sistema-protocolos-automaticos"
---

# Post 2
---
title: "El Problema de los Protocolos que se Olvidan"
series: "sistemas-automaticos"
seriesOrder: 2
seriesTotal: 4
postId: "protocolos-automaticos-ia-arquitectura"
---

# Post 3
---
title: "Migración de Sistemas: Preservando la Visión"
series: "sistemas-automaticos"
seriesOrder: 3
seriesTotal: 4
postId: "migracion-sistemas-preservando-vision"
---

# Post 4
---
title: "Sistema de Triggers Automáticos para Desarrollo"
series: "sistemas-automaticos"
seriesOrder: 4
seriesTotal: 4
postId: "sistema-triggers-automaticos-desarrollo-context-loading"
---
```

### **4. Serie "Automation & DevOps"**

```yaml
# Post 1
---
title: "Auto-merge Inteligente: UX y Control en CI/CD"
series: "automation-devops"
seriesOrder: 1
seriesTotal: 3
postId: "auto-merge-inteligente-ux-control"
---

# Post 2
---
title: "Debugging Auto-merge en GitHub Actions"
series: "automation-devops"
seriesOrder: 2
seriesTotal: 3
postId: "debugging-auto-merge-github-actions-troubleshooting"
---

# Post 3
---
title: "Reglas Esenciales para Proyectos Profesionales"
series: "automation-devops"
seriesOrder: 3
seriesTotal: 3
postId: "reglas-esenciales-proyectos-profesionales-estándares"
---
```

---

## 🖼️ Uso del Componente SharedImage

### **En el Layout de Blog Post**

```astro
---
// src/layouts/BlogPost.astro
import SharedImage from '../components/SharedImage.astro';

const { frontmatter } = Astro.props;
const { title, series, postId, imageAlt } = frontmatter;
---

<article>
  <header>
    <!-- Imagen principal usando sistema compartido -->
    <SharedImage 
      series={series}
      postId={postId}
      alt={imageAlt}
      variant="main"
      loading="eager"
      fetchpriority="high"
      width={1200}
      height={630}
    />
    
    <h1>{title}</h1>
  </header>
  
  <main>
    <slot />
  </main>
</article>
```

### **En Cards de Blog**

```astro
---
// src/components/BlogCard.astro
import SharedImage from './SharedImage.astro';

const { post } = Astro.props;
const { title, series, postId, imageAlt } = post.data;
---

<article class="blog-card">
  <!-- Thumbnail usando imagen compartida -->
  <SharedImage 
    series={series}
    postId={postId}
    alt={imageAlt}
    variant="thumb"
    loading="lazy"
    width={400}
    height={210}
    class="card-image"
  />
  
  <div class="card-content">
    <h3>{title}</h3>
    <!-- Resto del contenido -->
  </div>
</article>
```

### **Para Open Graph**

```astro
---
// src/layouts/BaseLayout.astro
import SharedImage from '../components/SharedImage.astro';

const { frontmatter } = Astro.props;
const { series, postId, imageAlt } = frontmatter;

// Generar URL absoluta para OG
const ogImageUrl = series 
  ? `${Astro.site}images/shared/series/${series}/portada-og.webp`
  : `${Astro.site}images/${postId}/portada-og.webp`;
---

<head>
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
</head>
```

---

## 🔧 Script de Actualización Automática

```bash
#!/bin/bash
# update-frontmatter.sh
# Script para actualizar automáticamente el frontmatter de posts

# Serie Wrangler & Deploy
sed -i '/^postId: "troubleshooting-wrangler-wsl-deploy"$/a series: "wrangler-deploy"\nseriesOrder: 1\nseriesTotal: 4' src/content/blog/troubleshooting-wrangler-wsl-deploy.md

sed -i '/^postId: "configurar-wrangler-cloudflare-pages-2024"$/a series: "wrangler-deploy"\nseriesOrder: 2\nseriesTotal: 4' src/content/blog/configurar-wrangler-cloudflare-pages-2024.md

# ... más actualizaciones
```

---

## 📊 Beneficios del Nuevo Sistema

### **🚀 Performance**
- **Una imagen por serie** en lugar de duplicados
- **Carga más rápida** con imágenes optimizadas
- **Menos transferencia** de datos

### **🔧 Mantenimiento**
- **Cambio centralizado** de imagen de serie
- **Consistencia visual** automática
- **Menos archivos** que gestionar

### **📈 SEO & UX**
- **Navegación entre posts** de la serie
- **Structured data** mejorado
- **Mejor experiencia** de usuario

---

**Este sistema optimizado reduce significativamente la duplicación de imágenes mientras mejora la organización y navegación del blog.**
