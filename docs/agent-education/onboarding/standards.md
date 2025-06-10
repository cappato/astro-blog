# 📏 Estándares Profesionales

**Documento**: 1.2 - CRÍTICO  
**Propósito**: Estándares profesionales consolidados para el proyecto

---

## **🎯 Estándares Críticos**

### **Reglas Fundamentales**
- ✅ **Profesionalismo**: Tono técnico profesional en toda comunicación
- ✅ **Consistencia**: Aplicar estándares uniformemente
- ✅ **Calidad**: Priorizar calidad sobre velocidad
- ✅ **Escalabilidad**: Pensar en mantenimiento a largo plazo

---

## **🚫 Política de Emojis**

### **✅ PERMITIDOS (Solo Scripts y Logs)**
- **Scripts**: Archivos de automatización (.js en scripts/)
- **Logs**: Mensajes de debug y desarrollo (console.log)
- **Comentarios de código**: Solo en explicaciones técnicas

### **❌ PROHIBIDOS (Todo lo demás)**
- **Archivos .md**: NUNCA emojis en markdown (incluye docs/)
- **Código TypeScript/JavaScript**: Variables, funciones, clases
- **Archivos de configuración**: package.json, tsconfig.json, etc.
- **Templates**: Archivos .astro, componentes
- **Estilos**: CSS, archivos de estilo
- **Documentación**: README.md, guías, docs/ - SIN EMOJIS

### **🚨 REGLA CRÍTICA: ARCHIVOS .MD SIN EMOJIS**
- **Razón**: Accesibilidad, legibilidad, profesionalismo
- **Incluye**: Todos los archivos en docs/, README.md, CHANGELOG.md
- **Excepción**: NINGUNA - archivos .md siempre sin emojis
- **Validación**: `npm run validate:emoji` debe bloquear

### **Razón de la Política**
- **Accesibilidad**: Lectores de pantalla pueden tener problemas
- **Profesionalismo**: Código limpio y profesional
- **Compatibilidad**: Evitar problemas de encoding
- **Mantenimiento**: Facilitar búsqueda y refactoring

---

## **📝 Conventional Commits**

### **Formato Obligatorio**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### **Tipos Permitidos**
| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| `feat` | Nueva funcionalidad | `feat(blog): add reading time calculation` |
| `fix` | Corrección de bug | `fix(seo): correct meta description length` |
| `docs` | Cambios en documentación | `docs(readme): update installation guide` |
| `style` | Cambios de formato | `style(css): fix indentation in main.css` |
| `refactor` | Refactoring de código | `refactor(utils): simplify date formatting` |
| `test` | Agregar/modificar tests | `test(blog): add unit tests for post creation` |
| `chore` | Tareas de mantenimiento | `chore(deps): update astro to v5.8.0` |

### **Scopes Comunes**
- `blog`: Sistema de blog
- `seo`: Optimización SEO
- `ui`: Interfaz de usuario
- `config`: Configuración
- `deps`: Dependencias
- `ci`: Integración continua

---

## **🌐 Idiomas y Comunicación**

### **Español**
- ✅ **Documentación**: README, guías, comentarios explicativos
- ✅ **Commits**: Mensajes de commit en español
- ✅ **Issues**: Descripción de problemas y features
- ✅ **PRs**: Títulos y descripciones

### **Inglés**
- ✅ **Código**: Variables, funciones, clases, comentarios técnicos
- ✅ **Configuración**: Archivos de config, scripts
- ✅ **Dependencies**: Nombres de paquetes y librerías
- ✅ **URLs**: Rutas y endpoints

### **Tono Profesional**
- ❌ NO lenguaje casual o coloquial
- ❌ NO referencias a IA o agentes en commits públicos
- ✅ Terminología técnica precisa
- ✅ Comunicación clara y directa

---

## **🔧 Estándares de Código**

### **TypeScript**
- ✅ **Strict mode**: Siempre habilitado
- ✅ **Tipos explícitos**: Para parámetros de función
- ✅ **Interfaces**: Para objetos complejos
- ✅ **Enums**: Para constantes relacionadas

### **Naming Conventions**
```typescript
// Variables y funciones: camelCase
const blogPostTitle = "Mi Post";
function calculateReadingTime() {}

// Clases: PascalCase
class BlogPostManager {}

// Constantes: UPPER_SNAKE_CASE
const MAX_POST_LENGTH = 5000;

// Archivos: kebab-case
// blog-post-utils.ts
// seo-meta-tags.astro
```

### **Estructura de Archivos**
```
src/
├── components/     # Componentes reutilizables
├── layouts/        # Layouts de página
├── pages/          # Páginas del sitio
├── utils/          # Utilidades y helpers
├── types/          # Definiciones de tipos
└── styles/         # Estilos globales
```

---

## **🧪 Estándares de Testing**

### **Estrategia por Tiers**
- **Tier 1**: Build, lint, size (<15s, bloquea merge)
- **Tier 2**: Unit tests (30s-1min, opcional)
- **Tier 3**: Integration, performance (1-5min, no bloquea)

### **Cobertura Mínima**
- ✅ **Funciones críticas**: 100% cobertura
- ✅ **Utilidades**: 90% cobertura
- ✅ **Componentes**: 80% cobertura

### **Comandos de Validación**
```bash
npm run validate:local    # Validación completa
npm run test:unit        # Tests unitarios
npm run test:build       # Test de build
npm run validate:emoji   # Validar política emoji
```

---

## **📊 Estándares de Performance**

### **Métricas Objetivo**
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle size**: < 100KB inicial

### **Optimizaciones Obligatorias**
- ✅ **Imágenes**: WebP/AVIF, lazy loading
- ✅ **CSS**: Critical CSS inline
- ✅ **JavaScript**: Code splitting, tree shaking
- ✅ **Fonts**: Preload, font-display: swap

---

## **🔒 Estándares de Seguridad**

### **Dependencias**
- ✅ **Auditoría regular**: `npm audit`
- ✅ **Actualizaciones**: Mantener dependencias actualizadas
- ✅ **Vulnerabilidades**: 0 vulnerabilidades críticas/altas

### **Configuración**
- ✅ **Variables de entorno**: Para datos sensibles
- ✅ **HTTPS**: Siempre en producción
- ✅ **Headers de seguridad**: CSP, HSTS, etc.

---

## **📋 Checklist de Estándares**

### **Antes de Commit**
- [ ] Código sigue naming conventions
- [ ] No hay emojis en código fuente
- [ ] Commit message es conventional
- [ ] Tests pasan localmente

### **Antes de PR**
- [ ] `npm run validate:local` pasa
- [ ] Documentación actualizada si es necesario
- [ ] PR title/description en español
- [ ] Tamaño de PR dentro de límites

### **Antes de Merge**
- [ ] Todos los checks de CI pasan
- [ ] Code review aprobado
- [ ] No hay conflictos
- [ ] Branch actualizado con main

---

## **⚠️ Violaciones Comunes**

### **Errores Frecuentes**
- ❌ Emojis en código TypeScript
- ❌ Commits sin conventional format
- ❌ Variables en español en código
- ❌ PRs sin descripción adecuada

### **Consecuencias**
- 🔴 **CI falla**: PR bloqueado automáticamente
- 🔴 **Review rechazado**: Requiere corrección
- 🔴 **Auto-merge deshabilitado**: Revisión manual

---

**Estos estándares son CRÍTICOS y deben seguirse en todo momento para mantener la calidad y profesionalismo del proyecto.**
