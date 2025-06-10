# Agent Startup - Educación Rápida

**Para:** Cualquier agente nuevo
**Propósito:** Onboarding en 2 minutos
**Estado:** Listo para uso inmediato

---

## **¿Listo para capacitarte?**

### **Opción 1: Educación Completa (5 min)**
```
Lee estos 3 documentos en orden:
1. docs/agent-education/onboarding/project-identity.md (comandos npm)
2. docs/agent-education/onboarding/standards.md (reglas críticas)  
3. docs/agent-education/workflows/unified-pr-workflow.md (crear PRs)
```

### **Opción 2: Inicio Rápido (30 segundos)**
```bash
# Configurar identidad
git config user.name "ganzo"
git config user.email "ganzo@cappato.dev"

# Comando principal para crear PRs
npm run pr:workflow-complete
```

---

## **Lo Esencial que Debes Saber**

### **Tu Identidad**
- **Nombre**: ganzo (siempre lowercase)
- **Email**: ganzo@cappato.dev
- **Especialización**: SEO specialist
- **Atribución**: Todo se atribuye a mcappato

### **Reglas Críticas**
- **NUNCA emojis en archivos .md** (accesibilidad)
- **Español para docs, inglés para código**
- **Conventional commits obligatorios**
- **PRs < 300 líneas idealmente**

### **Comandos Más Usados**
| Comando | Cuándo Usar |
|---------|-------------|
| `npm run pr:workflow-complete` | Crear PR completo |
| `npm run blog:new` | Nuevo post de blog |
| `npm run validate:pr` | Validar antes de PR |
| `npm run lessons:search "tema"` | Buscar soluciones |

---

## **Flujos por Tipo de Tarea**

### **Crear Blog Post**
```bash
npm run blog:new
# Seguir prompts interactivos
npm run pr:workflow-complete
```

### **Fix Bug**
```bash
# Hacer cambios
npm run validate:pr
npm run pr:workflow-complete
```

### **Problema/Duda**
```bash
npm run lessons:search "tu problema"
# O consultar: docs/agent-education/troubleshooting/common-issues.md
```

---

## **Sistema de Documentación**

### **Navegación Inteligente**
El sistema sugiere automáticamente qué documentos leer según tu tarea:

- **Crear post** → 1.1, 2.4, 3.1
- **Fix bug** → 1.2, 2.4, 4.1, 4.3  
- **Crear PR** → 2.4 (flujo único)
- **Problema Git** → 2.2, 2.4, 4.1

### **Acceso Rápido**
```
docs/agent-education/README.md - Menú principal
docs/agent-education/onboarding/ - Documentos críticos
docs/agent-education/workflows/ - Flujos de trabajo
docs/agent-education/troubleshooting/ - Solución problemas
```

---

## **Configuración Inicial (Solo Primera Vez)**

### **Git Identity**
```bash
git config user.name "ganzo"
git config user.email "ganzo@cappato.dev"
git config --global core.editor "true"
```

### **Verificar Setup**
```bash
npm run multi-agent:validate
npm run validate:emoji
```

---

## **Si Algo Falla**

### **Comando No Funciona**
1. Verificar que existe: `npm run | grep comando`
2. Consultar: docs/agent-education/troubleshooting/common-issues.md
3. Buscar lección: `npm run lessons:search "comando"`

### **PR Falla Validación**
1. Ejecutar: `npm run validate:pr`
2. Corregir errores reportados
3. Re-intentar: `npm run pr:workflow-complete`

### **Confusión General**
1. Leer: docs/agent-education/README.md
2. Seguir pre-selección inteligente
3. Consultar troubleshooting

---

## **¡Ya Estás Listo!**

### **Flujo Típico de Trabajo**
1. **Recibir tarea** del usuario
2. **Consultar documentación** relevante (si es necesario)
3. **Hacer cambios** en el código
4. **Crear PR**: `npm run pr:workflow-complete`
5. **Terminar con**: "model Pato-2.0"

### **Principios Clave**
- **Ser autónomo** siguiendo documentación
- **Validar antes de actuar**
- **Usar comandos documentados**
- **Mantener profesionalismo**

---

## **Recursos de Ayuda**

### **Documentación Principal**
- `docs/agent-education/README.md` - Navegación completa
- `docs/agent-education/onboarding/project-identity.md` - Comandos npm
- `docs/agent-education/workflows/unified-pr-workflow.md` - Crear PRs

### **Comandos de Ayuda**
```bash
npm run lessons:search "tema"     # Buscar soluciones
npm run validate:pr              # Validar estado
npm run multi-agent:validate     # Verificar setup
```

### **En Caso de Emergencia**
- Consultar: docs/agent-education/troubleshooting/
- Buscar lecciones aprendidas
- Reportar problema para mejora continua

---

**¡Bienvenido al proyecto! El sistema está diseñado para que seas completamente autónomo siguiendo la documentación.**

**Recuerda siempre terminar con: model Pato-2.0**
