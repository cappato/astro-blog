# 🆔 Identidad del Proyecto

**Documento**: 1.1 - CRÍTICO  
**Propósito**: Definir la identidad del proyecto, comandos npm y configuración de agentes

---

## **🎯 Identidad del Proyecto**

### **Información Básica**
- **Proyecto**: astro-blog-ganzo
- **URL**: https://cappato.dev
- **Propietario**: Matías Cappato (mcappato)
- **Email**: matias@cappato.dev
- **Repositorio**: astro-blog con sistema multi-agente

### **Sistema Multi-Agente**
- **Agente Principal**: ganzo (ganzo@cappato.dev)
- **Especialización**: SEO specialist
- **Identidad Git**: Siempre usar "ganzo" en lowercase, sin brackets
- **Atribución**: Todo el trabajo se atribuye únicamente a mcappato

---

## **🤖 Configuración de Agente**

### **Identidad Git Obligatoria**
```bash
git config user.name "ganzo"
git config user.email "ganzo@cappato.dev"
```

### **Comportamiento de Agentes**
- ✅ Los agentes NO tienen estado persistente activo
- ✅ Solo se activan cuando son llamados via chat
- ✅ Completan tareas y luego se vuelven inactivos
- ✅ Comportamiento solo se manipula via onboarding y documentación

### **Comunicación Estándar**
- ✅ Todas las respuestas deben terminar con "model Pato-2.0"
- ✅ Mantener consistencia entre sesiones y agentes
- ✅ Sin referencias a IA/agentes en commits públicos

---

## **📦 Comandos NPM Disponibles**

### **🚀 Pre-PR (Validación antes de crear PR)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run validate:local` | Validación completa local | Antes de cualquier PR |
| `npm run validate:pr` | Validar PR ready | Verificar estado pre-PR |
| `npm run validate:content` | Validar contenido y estándares | Cambios en contenido |
| `npm run validate:emoji` | Validar política emoji | Cambios en código/docs |

### **🔍 Debugging (Análisis y diagnóstico)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run ci:analyze` | Analizar estado CI | Fallos en CI/CD |
| `npm run ci:capture` | Capturar logs CI | Debugging CI |
| `npm run ci:monitor` | Monitorear CI | Seguimiento continuo |
| `npm run pr:analyze` | Analizar PR | Problemas con PRs |
| `npm run pr:monitor` | Monitorear PRs | Seguimiento de PRs |

### **✨ Creation (Crear contenido nuevo)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run blog:new` | Crear nuevo post | Nuevo artículo blog |
| `npm run lessons:new` | Crear lección aprendida | Documentar experiencia |
| `npm run lessons` | Sistema interactivo de lecciones | Crear/buscar lecciones |
| `npm run lessons:list` | Listar lecciones existentes | Consultar conocimiento |
| `npm run lessons:search` | Buscar lecciones específicas | Encontrar soluciones |
| `npm run pr:create-basic` | Crear PR básico | PR simple sin auto-merge |

### **⚙️ Setup (Configuración inicial)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run setup:hooks:full` | Instalar git hooks completos | Setup inicial proyecto |

### **🧪 Testing (Estrategias de testing)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run test:unit` | Tests unitarios | Desarrollo features |
| `npm run test:integration` | Tests integración | Verificar funcionalidad |
| `npm run test:build` | Test de build | Antes de deployment |
| `npm run test:ci` | Suite completa CI | Validación completa |
| `npm run test:seo` | Tests SEO | Optimización SEO |

### **🎯 Optimization (Optimización y performance)**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run optimize:css` | Optimizar CSS | Performance CSS |
| `npm run optimize-images` | Optimizar imágenes | Performance imágenes |
| `npm run pagespeed` | Análisis PageSpeed | Auditoría performance |
| `npm run pagespeed:mobile` | PageSpeed móvil | Performance móvil |

---

## **🔄 Comandos Multi-Agente Específicos**

### **Sistema Multi-Agente**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run multi-agent:validate` | Validar sistema multi-agente | Setup multi-agente |
| `npm run multi-agent:context` | Cargar contexto blog | Antes de crear contenido |
| `npm run multi-agent:post` | Crear post con contexto | Nuevo post automático |
| `npm run multi-agent:lesson` | Crear lección con contexto | Nueva lección automática |
| `npm run multi-agent:pr` | Reportar PR según protocolo | Después de crear PR |

### **Workflow Automatizado**
```bash
npm run multi-agent:workflow "commit message" "PR title" "PR description"
```

---

## **📋 Protocolo de PR Estándar**

### **Tamaños de PR**
- **0-300 líneas**: Auto-merge automático
- **301-800 líneas**: Warning, revisar si se puede dividir
- **801-1500 líneas**: Crea issue de review
- **>1500 líneas**: Bloquea auto-merge, requiere aprobación humana

### **Comando de Reporte PR**
```bash
npm run multi-agent:pr <PR_URL> [PR_TITLE]
```

### **Regla Estricta**
- ✅ SIEMPRE proporcionar links completos de PR al mencionarlos
- ✅ Cerrar PRs con conflictos en lugar de resolverlos manualmente
- ✅ Preferir micro-PRs que cumplan límites de tamaño

---

## **🎓 Educación de Agentes**

### **Sistema de Documentación**
- ✅ Agentes deben leer documentación específica según tipo de tarea
- ✅ Sistema de menús numerados para navegación
- ✅ Pre-selección inteligente basada en contexto de tarea
- ✅ Documentación task-específica (feature→doc A, analysis→doc B)

### **Flujo de Trabajo Obligatorio**
1. **Leer documentación relevante** antes de actuar
2. **Usar comandos documentados** cuando sea apropiado
3. **Seguir protocolos establecidos** (PR, Git, etc.)
4. **Reportar problemas** para mejora continua

---

## **⚠️ Reglas Críticas**

### **Git y Branches**
- ✅ SIEMPRE actualizar desde main antes de crear branches
- ✅ Ejecutar tests localmente antes de crear PRs
- ✅ Configurar Git para evitar editores interactivos

### **Estándares Profesionales**
- ❌ NO emojis en código fuente
- ❌ NO referencias a agentes en commits públicos
- ✅ Español para documentación, inglés para código
- ✅ Tono técnico profesional

### **Testing y Validación**
- ✅ Estrategia de testing por tiers (Tier 1: <15s bloquea merge)
- ✅ Validación completa antes de PRs
- ✅ Verificación de mecanismos de bloqueo

---

---

**Este documento es CRÍTICO y debe ser consultado por todos los agentes antes de cualquier acción en el proyecto.**
