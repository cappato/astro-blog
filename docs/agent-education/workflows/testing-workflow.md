# 🧪 Testing Workflow

**Documento**: 2.3 - IMPORTANTE  
**Propósito**: Estrategias de testing y validación antes de PRs

---

## **🎯 Estrategia de Testing por Tiers**

### **Tier 1: Tests Críticos (<15 segundos)**
**Bloquean merge automáticamente**
```bash
npm run test:build        # Build exitoso
npm run validate:emoji    # Política de emojis
npm run validate:pr       # Validación PR ready
```

### **Tier 2: Tests Unitarios (30s-1min)**
**Opcionales pero recomendados**
```bash
npm run test:unit         # Tests unitarios
npm run test:seo          # Validación SEO
npm run validate:content  # Contenido válido
```

### **Tier 3: Tests Integración (1-5min)**
**No bloquean merge**
```bash
npm run test:integration  # Tests de integración
npm run pagespeed         # Performance audit
npm run test:blog         # Suite completa blog
```

---

## **🚀 Comandos de Testing Disponibles**

### **Validación Pre-PR**
| Comando | Propósito | Tiempo | Bloquea |
|---------|-----------|--------|---------|
| `npm run validate:pr` | Validación completa PR | <15s | ✅ SÍ |
| `npm run validate:local` | Validación local completa | 30s | ❌ NO |
| `npm run validate:content` | Validar contenido | 10s | ❌ NO |
| `npm run validate:emoji` | Política emojis | 5s | ✅ SÍ |

### **Testing de Build**
| Comando | Propósito | Tiempo | Bloquea |
|---------|-----------|--------|---------|
| `npm run test:build` | Build exitoso | 10s | ✅ SÍ |
| `npm run test:ci` | Suite CI completa | 45s | ❌ NO |
| `npm run build` | Build producción | 15s | ✅ SÍ |

### **Testing de Contenido**
| Comando | Propósito | Tiempo | Bloquea |
|---------|-----------|--------|---------|
| `npm run test:blog` | Tests blog completos | 30s | ❌ NO |
| `npm run test:blog:structure` | Estructura posts | 10s | ❌ NO |
| `npm run test:blog:images` | Validar imágenes | 15s | ❌ NO |
| `npm run test:seo` | Validación SEO | 20s | ❌ NO |

---

## **📋 Workflow de Testing Obligatorio**

### **Antes de Cualquier PR**
```bash
# 1. Validación crítica (OBLIGATORIO)
npm run validate:pr

# 2. Si falla, corregir y repetir
# 3. Solo crear PR si pasa
```

### **Desarrollo Local Recomendado**
```bash
# Durante desarrollo
npm run test:unit --watch    # Tests en background

# Antes de commit
npm run validate:local       # Validación completa

# Antes de push
npm run test:build          # Verificar build
```

---

## **🔧 Configuración de Testing**

### **Vitest Configuration**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### **Test Structure**
```
tests/
├── unit/              # Tests unitarios
│   ├── utils/         # Tests de utilidades
│   ├── components/    # Tests de componentes
│   └── content/       # Tests de content collections
├── integration/       # Tests de integración
├── e2e/              # Tests end-to-end (futuro)
└── fixtures/         # Datos de prueba
```

---

## **🎯 Testing de Componentes**

### **Ejemplo Test Unitario**
```typescript
// tests/unit/utils/reading-time.test.ts
import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from '@/utils/reading-time';

describe('calculateReadingTime', () => {
  it('should calculate correct reading time', () => {
    const content = 'word '.repeat(200); // 200 words
    expect(calculateReadingTime(content)).toBe(1);
  });

  it('should handle empty content', () => {
    expect(calculateReadingTime('')).toBe(0);
  });
});
```

### **Testing de Content Collections**
```typescript
// tests/unit/content/blog.test.ts
import { describe, it, expect } from 'vitest';
import { getCollection } from 'astro:content';

describe('Blog Content', () => {
  it('should have valid frontmatter', async () => {
    const posts = await getCollection('blog');
    posts.forEach(post => {
      expect(post.data.title).toBeDefined();
      expect(post.data.description).toBeDefined();
      expect(post.data.description.length).toBeLessThanOrEqual(160);
    });
  });
});
```

---

## **📊 Performance Testing**

### **Core Web Vitals**
```bash
npm run pagespeed           # Desktop audit
npm run pagespeed:mobile    # Mobile audit
```

### **Bundle Analysis**
```bash
npm run build              # Build con análisis
npm run analyze            # Análisis de bundle
```

### **Métricas Objetivo**
- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1
- **Bundle Size**: < 100KB inicial

---

## **🔍 SEO Testing**

### **Validación SEO Automática**
```bash
npm run test:seo
```

### **Checks Incluidos**
- ✅ Meta description presente y < 160 chars
- ✅ Title tags únicos y descriptivos
- ✅ H1 único por página
- ✅ Alt text en imágenes
- ✅ Structured data válido
- ✅ Sitemap actualizado

---

## **🖼️ Image Testing**

### **Validación de Imágenes**
```bash
npm run test:blog:images
```

### **Checks de Imágenes**
- ✅ Imágenes referenciadas existen
- ✅ Formatos optimizados (WebP/AVIF)
- ✅ Alt text presente
- ✅ Tamaños apropiados
- ✅ Lazy loading configurado

---

## **🚨 Debugging Tests Fallidos**

### **Tests de Build Fallan**
```bash
# Ver detalles del error
npm run build 2>&1 | tee build.log

# Limpiar cache
rm -rf .astro dist
npm run build
```

### **Tests Unitarios Fallan**
```bash
# Modo verbose
npm run test:unit -- --reporter=verbose

# Test específico
npm run test:unit -- tests/unit/specific-test.test.ts

# Modo watch para debugging
npm run test:unit -- --watch
```

### **Validación PR Falla**
```bash
# Ver qué específicamente falla
npm run validate:pr -- --verbose

# Ejecutar validaciones individuales
npm run validate:emoji
npm run test:build
npm run validate:content
```

---

## **⚡ Testing en CI/CD**

### **GitHub Actions Testing**
```yaml
# .github/workflows/test.yml
- name: Run Tier 1 Tests
  run: |
    npm run validate:pr
    npm run test:build

- name: Run Tier 2 Tests  
  run: |
    npm run test:unit
    npm run test:seo

- name: Run Tier 3 Tests
  run: |
    npm run test:integration
    npm run pagespeed
```

### **Parallel Testing**
```bash
# Tests en paralelo para velocidad
npm run test:unit & npm run test:seo & wait
```

---

## **📋 Checklist Pre-PR**

### **Validación Mínima (OBLIGATORIO)**
- [ ] `npm run validate:pr` pasa ✅
- [ ] `npm run test:build` pasa ✅
- [ ] No hay errores de TypeScript ✅
- [ ] Commit messages son conventional ✅

### **Validación Recomendada**
- [ ] `npm run test:unit` pasa
- [ ] `npm run validate:content` pasa
- [ ] `npm run test:seo` pasa si hay cambios de contenido
- [ ] `npm run test:blog:images` pasa si hay imágenes nuevas

### **Validación Completa**
- [ ] `npm run validate:local` pasa
- [ ] `npm run test:ci` pasa
- [ ] Performance no se degrada
- [ ] Accessibility no se afecta

---

## **🎯 Best Practices**

### **Durante Desarrollo**
- ✅ Ejecutar tests unitarios en watch mode
- ✅ Validar frecuentemente con `validate:local`
- ✅ Corregir errores inmediatamente
- ✅ No acumular deuda técnica

### **Antes de Push**
- ✅ SIEMPRE ejecutar `validate:pr`
- ✅ Verificar que build funciona
- ✅ Probar funcionalidad manualmente
- ✅ Revisar cambios una vez más

### **Gestión de Fallos**
- ✅ Leer mensajes de error completamente
- ✅ Corregir un error a la vez
- ✅ Verificar fix con test específico
- ✅ Re-ejecutar suite completa

---

**Este workflow garantiza calidad y estabilidad del proyecto mediante testing sistemático y validación automática.**
