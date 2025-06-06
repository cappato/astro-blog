# Protocolos Content Agent

## Responsabilidades Especificas

### Archivos Primarios
- `src/content/*` - Todo el contenido del sitio
- `docs/*` - Documentacion del proyecto
- `*.md` files - Archivos markdown en general
- Blog post creation y management

### Coordinacion Requerida
- `src/layouts/*` - Coordinar con Frontend Agent para layouts de contenido
- `src/components/blog/*` - Coordinar con Frontend Agent para componentes de blog
- SEO metadata - Coordinar con Backend Agent para implementacion tecnica

---

## Protocolos de Creacion de Contenido

### Blog Post Creation
- **Enforcement**: FUNDAMENTAL
- **Estructura Obligatoria**:
  ```markdown
  ---
  title: "Titulo del Post"
  description: "Descripcion SEO optimizada"
  pubDate: "YYYY-MM-DD"
  tags: ["tag1", "tag2", "tag3"]
  image: "/images/post-image.webp"
  ---
  
  # Titulo H1 (debe coincidir con title del frontmatter)
  
  Contenido del post...
  ```

### SEO Optimization
- **Enforcement**: OBLIGATORY
- **Reglas**:
  - Title: 50-60 caracteres, incluir keyword principal
  - Description: 150-160 caracteres, incluir LSI keywords
  - H1: Solo uno por post, incluir keyword principal
  - H2-H6: Estructura jerarquica logica
  - Internal linking: Minimo 2-3 links internos relevantes
  - External linking: Solo a fuentes autoritativas

### Imagen Optimization
- **Enforcement**: CRITICAL
- **Proceso**:
  1. Usar script de optimizacion: `npm run optimize-images`
  2. Formato preferido: WebP
  3. Alt text descriptivo y SEO-friendly
  4. Lazy loading para imagenes below-the-fold
  5. Responsive images con srcset

---

## Protocolos de Calidad de Contenido

### Estructura de Posts
- **Enforcement**: OBLIGATORY
- **Longitud**: Minimo 800 palabras para SEO
- **Estructura**:
  - Introduccion (100-150 palabras)
  - Desarrollo en secciones con H2
  - Conclusion con CTA
  - Tags relevantes (3-5 tags)

### Splitting de Posts Largos
- **Enforcement**: RECOMMENDED
- **Cuando dividir**: Posts > 2500 palabras
- **Estrategia**: Dividir en 2-3 partes logicas
- **Linking**: Conectar partes con navegacion clara
- **SEO**: Cada parte debe ser independiente para SEO

### Markdown Best Practices
- **Enforcement**: OBLIGATORY
- **Reglas**:
  - Usar sintaxis markdown estandar
  - Code blocks con syntax highlighting
  - Listas ordenadas/desordenadas apropiadas
  - Links descriptivos (no "click aqui")
  - Emphasis moderado (no overuse de bold/italic)

---

## Protocolos de Documentacion

### Documentacion Tecnica
- **Enforcement**: FUNDAMENTAL
- **Estructura**:
  ```markdown
  # Titulo Principal
  
  ## Overview
  Descripcion breve y proposito
  
  ## Quick Start
  Pasos minimos para empezar
  
  ## Detailed Guide
  Instrucciones completas
  
  ## Examples
  Ejemplos practicos
  
  ## Troubleshooting
  Problemas comunes y soluciones
  ```

### README Updates
- **Enforcement**: OBLIGATORY
- **Cuando actualizar**:
  - Cambios en estructura del proyecto
  - Nuevas features agregadas
  - Cambios en comandos o scripts
  - Actualizaciones de dependencias importantes

### Changelog Maintenance
- **Enforcement**: RECOMMENDED
- **Formato**:
  ```markdown
  ## [Version] - YYYY-MM-DD
  
  ### Added
  - Nueva funcionalidad
  
  ### Changed
  - Cambios en funcionalidad existente
  
  ### Fixed
  - Bugs corregidos
  
  ### Removed
  - Funcionalidad eliminada
  ```

---

## Protocolos de SEO Avanzado

### Schema.org Markup
- **Enforcement**: OBLIGATORY
- **Para blog posts**: Article schema
- **Para paginas**: WebPage schema
- **Para organizacion**: Organization schema
- **Coordinacion**: Con Backend Agent para implementacion

### Internal Linking Strategy
- **Enforcement**: CRITICAL
- **Reglas**:
  - Crear pillar content hubs
  - Conectar posts relacionados
  - Usar anchor text descriptivo
  - Mantener link juice flow logico
  - Evitar orphan pages

### Content Clusters
- **Enforcement**: RECOMMENDED
- **Estrategia**:
  - Identificar topic clusters
  - Crear pillar pages
  - Conectar cluster content
  - Optimizar para topic authority

---

## Protocolos de Automatizacion

### Blog Automation Script
- **Enforcement**: RECOMMENDED
- **Uso**: `npm run blog`
- **Funcionalidades**:
  - Creacion automatica de posts
  - Optimizacion de imagenes
  - Generacion de metadata
  - Validacion de estructura

### Content Validation
- **Enforcement**: OBLIGATORY
- **Checklist automatico**:
  - [ ] Frontmatter completo y valido
  - [ ] Solo un H1 por post
  - [ ] Imagenes optimizadas
  - [ ] Links internos funcionando
  - [ ] SEO metadata presente

### Draft/Hidden Posts
- **Enforcement**: RECOMMENDED
- **Uso**: Para review antes de publicacion
- **Implementacion**: `draft: true` en frontmatter
- **Acceso**: Solo por link directo, no indexado

---

## Protocolos de Testing de Contenido

### Content Testing
- **Enforcement**: OBLIGATORY
- **Comandos**:
  ```bash
  # Validar estructura de blog
  npm run test:blog:structure
  
  # Validar imagenes
  npm run test:blog:images
  
  # Validar contenido
  npm run test:content
  ```

### SEO Testing
- **Enforcement**: CRITICAL
- **Comandos**:
  ```bash
  # Tests de SEO
  npm run test:seo
  
  # Validar schemas
  npm run validate:schemas
  
  # Performance SEO
  npm run test:seo:performance
  ```

### Manual Content Review
- **Enforcement**: OBLIGATORY
- **Checklist**:
  - [ ] Ortografia y gramatica correctas
  - [ ] Tone of voice consistente
  - [ ] Informacion actualizada y precisa
  - [ ] Links funcionando correctamente
  - [ ] Imagenes cargando correctamente

---

## Protocolos de Coordinacion Content

### Con Frontend Agent
- **Cuando coordinar**:
  - Cambios en layouts de blog
  - Nuevos componentes de contenido
  - Modificaciones en estilos de markdown
  - Actualizaciones de tema/diseno

### Con Backend Agent
- **Cuando coordinar**:
  - Implementacion de schemas SEO
  - Nuevos endpoints para contenido
  - Cambios en RSS feed
  - Optimizaciones de performance

### Con Testing Agent
- **Cuando coordinar**:
  - Nuevos tipos de contenido (necesitan tests)
  - Cambios en estructura de frontmatter
  - Actualizaciones de validacion
  - Tests de contenido automatizados

---

## Protocolos de Mantenimiento Content

### Content Audit
- **Frecuencia**: Trimestral
- **Checklist**:
  - [ ] Identificar contenido obsoleto
  - [ ] Actualizar informacion desactualizada
  - [ ] Consolidar contenido duplicado
  - [ ] Optimizar posts con bajo performance

### Link Maintenance
- **Frecuencia**: Mensual
- **Proceso**:
  1. Verificar links externos (broken links)
  2. Actualizar links internos
  3. Optimizar anchor text
  4. Revisar link juice distribution

### Image Maintenance
- **Frecuencia**: Mensual
- **Proceso**:
  1. Optimizar imagenes nuevas
  2. Convertir formatos obsoletos
  3. Actualizar alt text
  4. Verificar responsive images

---

## Herramientas Especificas Content

### Comandos de Contenido
```bash
# Crear nuevo blog post
npm run blog:new

# Analizar contenido existente
npm run blog:analyze

# Optimizar imagenes
npm run blog:images

# Generar reporte de contenido
npm run blog:report
```

### Comandos de SEO
```bash
# Validar schemas
npm run validate:schemas

# Tests de SEO
npm run test:seo

# Analizar performance
npm run pagespeed
```

---

## Escalacion Content

### Cuando Escalar
- **Estrategia de contenido**: Decisiones de content strategy
- **SEO complejo**: Implementaciones tecnicas avanzadas
- **Content architecture**: Restructuracion mayor de contenido
- **Legal/compliance**: Contenido que requiere revision legal

### Proceso de Escalacion
1. Documentar objetivo de contenido
2. Incluir research y data de soporte
3. Especificar impacto en SEO/user experience
4. Proporcionar recomendacion basada en best practices
5. Esperar aprobacion antes de implementar cambios mayores

---

**Content Protocol Version**: 1.0
**Integracion**: Cargado automaticamente por Content Agents
**Especializacion**: Basado en protocolos compartidos + especificos content
