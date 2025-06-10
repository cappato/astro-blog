# 🤖 Sistemas de Automatización

**Documento**: 3.2 - IMPORTANTE  
**Propósito**: Guía completa de automatización y workflows del proyecto

---

## **🎯 Automatización Disponible**

### **🚀 Pre-PR Automation**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run validate:local` | Validación completa local | Lint, build, tests, emoji check |
| `npm run validate:pr` | Validar PR ready | Estado Git, tests críticos, tamaño |
| `npm run validate:content` | Validar contenido | Schema, SEO, imágenes |
| `npm run validate:emoji` | Política emojis | Scan código fuente por emojis |

### **🔍 Debugging Automation**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run ci:analyze` | Analizar estado CI | Logs, status, fallos |
| `npm run ci:capture` | Capturar logs CI | Download logs, análisis |
| `npm run ci:monitor` | Monitorear CI | Seguimiento continuo |
| `npm run pr:analyze` | Analizar PR | Tamaño, conflictos, status |
| `npm run pr:monitor` | Monitorear PRs | Estado de PRs activos |

### **✨ Creation Automation**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run blog:new` | Crear nuevo post | Template, metadata, estructura |
| `npm run lessons:new` | Crear lección | Template lección aprendida |
| `npm run lessons` | Sistema interactivo | Crear/buscar/gestionar lecciones |
| `npm run pr:create-basic` | Crear PR básico | PR sin auto-merge |

---

## **🔄 Multi-Agent Automation**

### **Sistema Multi-Agente**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run multi-agent:validate` | Validar sistema | Configuración multi-agente |
| `npm run multi-agent:context` | Cargar contexto | Contexto para blog posts |
| `npm run multi-agent:post` | Post automático | Crear post con contexto |
| `npm run multi-agent:lesson` | Lección automática | Crear lección con contexto |
| `npm run multi-agent:pr` | Reportar PR | Protocolo de reporte PR |
| `npm run multi-agent:workflow` | Workflow completo | Commit → PR → reporte |

### **Workflow Automatizado Completo**
```bash
npm run multi-agent:workflow "feat: add new feature" "Add Feature X" "Detailed description"
```
**Automatiza**: commit → push → create PR → report PR

---

## **🧪 Testing Automation**

### **Estrategia Automatizada por Tiers**
| Comando | Tier | Tiempo | Auto-Block |
|---------|------|--------|------------|
| `npm run test:build` | 1 | <15s | ✅ SÍ |
| `npm run test:unit` | 2 | 30s | ❌ NO |
| `npm run test:integration` | 3 | 1-5min | ❌ NO |
| `npm run test:ci` | All | 45s | ❌ NO |

### **Testing Específico**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run test:seo` | Tests SEO | Meta tags, structured data |
| `npm run test:blog` | Tests blog | Posts, imágenes, estructura |
| `npm run test:blog:structure` | Estructura posts | Frontmatter, schema |
| `npm run test:blog:images` | Imágenes blog | Existencia, optimización |

---

## **🎯 Optimization Automation**

### **Performance Automation**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run optimize:css` | Optimizar CSS | Purge, minify, critical CSS |
| `npm run optimize-images` | Optimizar imágenes | WebP, resize, compress |
| `npm run pagespeed` | Análisis performance | Core Web Vitals audit |
| `npm run pagespeed:mobile` | Performance móvil | Mobile-specific audit |

### **SEO Automation**
```bash
npm run blog:analyze        # Análisis SEO automático
npm run blog:report         # Reporte SEO completo
```

---

## **⚙️ Setup Automation**

### **Configuración Inicial**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run setup:hooks:full` | Git hooks completos | Pre-commit, pre-push hooks |
| `npm run setup:dev` | Setup desarrollo | Install + hooks |

### **Git Workflow Automation**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run git:status` | Estado Git | Branch, cambios, sync |
| `npm run git:branch` | Nueva branch | Crear branch con naming |
| `npm run git:commit` | Commit automático | Conventional commit |
| `npm run git:push` | Push automático | Push con tracking |
| `npm run git:pr` | Crear PR | PR con template |
| `npm run git:complete` | Workflow completo | Todo el flujo Git |

---

## **📊 Lessons Learned Automation**

### **Sistema de Lecciones**
| Comando | Propósito | Automatiza |
|---------|-----------|------------|
| `npm run lessons` | Sistema interactivo | Menú completo lecciones |
| `npm run lessons:new` | Nueva lección | Template + metadata |
| `npm run lessons:list` | Listar lecciones | Búsqueda y filtrado |
| `npm run lessons:search` | Buscar lecciones | Búsqueda por keywords |

### **Integración con Workflow**
```bash
# Crear lección desde error
npm run lessons:new --from-error "Error description"

# Buscar soluciones existentes
npm run lessons:search "build failing"
```

---

## **🔧 Scripts de Automatización**

### **Estructura de Scripts**
```
scripts/
├── automation/
│   ├── validate-pr-ready.js      # Validación PR
│   ├── multi-agent-workflow.js   # Workflow multi-agente
│   └── ci-monitor.js             # Monitoreo CI
├── blog/
│   ├── create-post.js            # Crear posts
│   ├── optimize-images.js        # Optimizar imágenes
│   └── seo-analysis.js           # Análisis SEO
├── git/
│   ├── git-workflow.js           # Workflow Git
│   └── conventional-commit.js    # Commits automáticos
└── lessons-learned.js            # Sistema lecciones
```

### **Configuración de Scripts**
```json
// package.json
{
  "scripts": {
    "validate:pr": "node scripts/automation/validate-pr-ready.js",
    "multi-agent:workflow": "node scripts/automation/multi-agent-workflow.js",
    "blog:new": "node scripts/blog/create-post.js",
    "git:complete": "node scripts/git/git-workflow.js complete"
  }
}
```

---

## **🚀 CI/CD Automation**

### **GitHub Actions Automation**
```yaml
# .github/workflows/auto-merge.yml
name: Auto Merge
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  auto-merge:
    if: github.actor == 'ganzo'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-merge if conditions met
        run: |
          npm run validate:pr
          npm run pr:analyze
```

### **Cloudflare Pages Automation**
- **Auto-deploy**: Merge a main → deploy automático
- **Preview deploys**: PR → preview automático
- **Rollback**: Automático si deploy falla

---

## **📱 Monitoring Automation**

### **Performance Monitoring**
```bash
# Monitoreo automático
npm run ci:monitor &          # Background monitoring
npm run pagespeed:schedule    # Scheduled performance checks
```

### **Error Tracking**
```bash
# Captura automática de errores
npm run ci:capture --on-failure
npm run lessons:auto-create --from-ci-failure
```

---

## **🎯 Automation Best Practices**

### **Uso Eficiente**
- ✅ **Usar comandos específicos** para tareas específicas
- ✅ **Combinar comandos** para workflows complejos
- ✅ **Monitorear resultados** de automatización
- ✅ **Mantener scripts actualizados**

### **Debugging Automation**
```bash
# Ver qué hace un comando
npm run validate:pr -- --dry-run

# Ejecutar con verbose
npm run multi-agent:workflow -- --verbose

# Debug específico
DEBUG=true npm run git:complete
```

### **Customización**
```bash
# Configurar comportamiento
export AUTO_MERGE_SIZE_LIMIT=250
export ENABLE_PERFORMANCE_MONITORING=true
npm run validate:pr
```

---

## **⚠️ Limitaciones y Consideraciones**

### **Limitaciones Conocidas**
- ❌ **No puede resolver conflictos** de merge automáticamente
- ❌ **No puede tomar decisiones** de diseño complejas
- ❌ **Requiere configuración** inicial correcta
- ❌ **Dependiente de APIs** externas (GitHub, Cloudflare)

### **Cuándo NO Usar Automation**
- 🔴 **Cambios arquitectónicos** importantes
- 🔴 **Decisiones de negocio** complejas
- 🔴 **Debugging complejo** que requiere análisis humano
- 🔴 **Configuración inicial** del proyecto

### **Fallbacks Manuales**
```bash
# Si automation falla, usar comandos manuales
git status
git add .
git commit -m "manual commit"
git push
# Crear PR manualmente en GitHub
```

---

**Esta automatización está diseñada para acelerar workflows comunes manteniendo control y calidad del proyecto.**
