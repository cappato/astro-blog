# 👥 Sistema Multi-Agente

**Documento**: 3.3 - IMPORTANTE  
**Propósito**: Coordinación y colaboración entre agentes IA en el proyecto

---

## **🎯 Arquitectura Multi-Agente**

### **Agente Principal**
- **Nombre**: ganzo
- **Email**: ganzo@cappato.dev
- **Especialización**: SEO specialist
- **Responsabilidades**: Blog posts, optimización SEO, documentación

### **Características del Sistema**
- ✅ **Sin estado persistente**: Agentes se activan solo cuando son llamados
- ✅ **Comportamiento por documentación**: Solo se controla via onboarding
- ✅ **Atribución única**: Todo el trabajo se atribuye a mcappato
- ✅ **Identidad consistente**: Siempre "ganzo" en lowercase, sin brackets

---

## **🤖 Comandos Multi-Agente**

### **Validación y Setup**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run multi-agent:validate` | Validar configuración multi-agente | Setup inicial, debugging |

### **Gestión de Contexto**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run multi-agent:context` | Cargar contexto para blog | Antes de crear contenido |

### **Creación de Contenido**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run multi-agent:post` | Crear post con contexto | Nuevo artículo automático |
| `npm run multi-agent:lesson` | Crear lección con contexto | Nueva lección automática |

### **Workflow y Reporting**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run multi-agent:pr` | Reportar PR según protocolo | Después de crear PR |
| `npm run multi-agent:workflow` | Workflow completo automatizado | Proceso end-to-end |

---

## **🔄 Workflow Multi-Agente**

### **Proceso de Onboarding**
1. **Leer documentación**: Documentos 1.1 → 1.2 → 1.3
2. **Configurar identidad**: Git config con ganzo@cappato.dev
3. **Validar setup**: `npm run multi-agent:validate`
4. **Cargar contexto**: `npm run multi-agent:context`

### **Proceso de Creación de Contenido**
```bash
# 1. Cargar contexto del proyecto
npm run multi-agent:context

# 2. Crear contenido con contexto
npm run multi-agent:post "Título del Post"

# 3. Workflow completo
npm run multi-agent:workflow "feat: add new post" "Add Post Title" "Post description"
```

### **Proceso de Reporte**
```bash
# Reportar PR creado
npm run multi-agent:pr https://github.com/user/repo/pull/123 "PR Title"
```

---

## **📋 Protocolo de Comunicación**

### **Estándares de Comunicación**
- ✅ **Terminar respuestas**: Siempre con "model Pato-2.0"
- ✅ **Tono profesional**: Sin referencias a IA/agentes en público
- ✅ **Idioma**: Español para docs, inglés para código
- ✅ **Commits**: Sin mencionar agentes, solo funcionalidad

### **Formato de Commits Multi-Agente**
```bash
# ✅ CORRECTO
feat(blog): add reading time calculation
fix(seo): improve meta description generation

# ❌ INCORRECTO  
feat(blog): ganzo adds reading time
fix(seo): AI agent improves meta tags
```

---

## **🎯 Coordinación de Tareas**

### **Distribución de Responsabilidades**
- **ganzo (SEO specialist)**:
  - Blog posts y contenido
  - Optimización SEO
  - Meta tags y structured data
  - Performance optimization

### **Evitar Conflictos**
- ✅ **Un agente por tarea**: No trabajar simultáneamente en mismo archivo
- ✅ **Comunicación clara**: Documentar qué se está trabajando
- ✅ **Branches separadas**: Cada agente en su propia branch
- ✅ **PRs pequeños**: Evitar conflictos con micro-PRs

---

## **📊 Sistema de Contexto**

### **Contexto del Proyecto**
```bash
npm run multi-agent:context
```
**Carga**:
- Información del proyecto actual
- Posts recientes del blog
- Métricas de performance
- Issues y PRs activos
- Lecciones aprendidas relevantes

### **Contexto para Blog Posts**
```javascript
// Contexto automático incluye:
{
  "recentPosts": [...],
  "popularTags": [...],
  "seoKeywords": [...],
  "performanceMetrics": {...},
  "contentGaps": [...]
}
```

---

## **🔧 Configuración Multi-Agente**

### **Variables de Entorno**
```bash
# .env
AGENT_NAME=ganzo
AGENT_EMAIL=ganzo@cappato.dev
AGENT_ROLE=seo-specialist
PROJECT_OWNER=mcappato
```

### **Git Configuration**
```bash
# Configuración automática
git config user.name "ganzo"
git config user.email "ganzo@cappato.dev"
git config --global core.editor "true"
```

---

## **📈 Métricas y Monitoring**

### **Tracking de Actividad**
- **Commits por agente**: Tracking automático
- **PRs creados**: Métricas de productividad
- **Issues resueltos**: Efectividad de resolución
- **Tiempo de respuesta**: Velocidad de trabajo

### **Quality Metrics**
- **Tests passing rate**: % de tests que pasan
- **PR merge rate**: % de PRs merged sin issues
- **Performance impact**: Impacto en Core Web Vitals
- **SEO improvements**: Mejoras en métricas SEO

---

## **🚨 Gestión de Conflictos**

### **Conflictos de Merge**
```bash
# Si hay conflictos, protocolo estándar:
# 1. Cerrar PR con conflictos
git checkout main
git pull origin main

# 2. Crear nueva branch
git checkout -b fix/resolve-conflicts

# 3. Aplicar cambios limpios
# 4. Crear nuevo PR
```

### **Conflictos de Trabajo**
- ✅ **Comunicar en PR**: Qué se está trabajando
- ✅ **Revisar PRs activos**: Antes de empezar trabajo similar
- ✅ **Coordinar timing**: No trabajar simultáneamente en features relacionadas

---

## **🎓 Educación Continua**

### **Sistema de Lecciones Compartidas**
```bash
# Crear lección para otros agentes
npm run lessons:new --multi-agent

# Buscar lecciones de otros agentes
npm run lessons:search --agent=all
```

### **Knowledge Sharing**
- ✅ **Documentar decisiones**: En lecciones aprendidas
- ✅ **Compartir soluciones**: Via sistema de lecciones
- ✅ **Actualizar documentación**: Cuando se aprende algo nuevo

---

## **⚡ Automatización Multi-Agente**

### **Workflow Automatizado Completo**
```bash
npm run multi-agent:workflow "commit message" "PR title" "PR description"
```

**Ejecuta automáticamente**:
1. Validar estado del proyecto
2. Cargar contexto relevante
3. Hacer commit con mensaje conventional
4. Push a branch
5. Crear PR con template
6. Reportar PR según protocolo
7. Configurar auto-merge si aplica

### **Integración con CI/CD**
- **Auto-merge**: PRs de agentes con auto-merge automático
- **Testing**: Validación automática antes de merge
- **Deployment**: Deploy automático a Cloudflare Pages
- **Monitoring**: Tracking de métricas post-deployment

---

## **🔒 Seguridad y Permisos**

### **Limitaciones de Agentes**
- ❌ **No pueden**: Cambiar configuración de infraestructura
- ❌ **No pueden**: Acceder a secrets o variables sensibles
- ❌ **No pueden**: Hacer cambios destructivos sin validación
- ❌ **No pueden**: Mergear PRs que fallan tests críticos

### **Permisos Permitidos**
- ✅ **Pueden**: Crear contenido y documentación
- ✅ **Pueden**: Hacer cambios de código no críticos
- ✅ **Pueden**: Crear PRs y branches
- ✅ **Pueden**: Ejecutar tests y validaciones

---

## **📞 Escalation y Support**

### **Cuándo Escalar**
- 🔴 **Conflictos no resolubles**: Entre agentes o con main
- 🔴 **Errores de infraestructura**: CI/CD, deployment issues
- 🔴 **Decisiones arquitectónicas**: Cambios importantes de diseño
- 🔴 **Problemas de seguridad**: Vulnerabilidades o accesos

### **Proceso de Escalation**
1. **Documentar problema**: En issue de GitHub
2. **Incluir contexto**: Logs, pasos para reproducir
3. **Marcar como escalation**: Label específico
4. **Pausar trabajo relacionado**: Hasta resolución

---

**Este sistema multi-agente está diseñado para maximizar productividad manteniendo calidad y consistencia del proyecto.**
