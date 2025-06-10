# 🔄 PR Workflow & Auto-merge System

**Propósito**: Documentar el sistema completo de PRs, auto-merge y workflows automatizados del proyecto.

---

## 🎯 **Sistema de Auto-merge**

### **Archivo Principal**
- **Ubicación**: `.github/workflows/pr-automation.yml`
- **Tipo**: Workflow unificado que gestiona todo el proceso

### **Condiciones para Auto-merge**

#### **Requisitos Obligatorios:**
1. ✅ **Label**: PR debe tener label `auto-merge`
2. ✅ **Branch**: PR debe apuntar a `main`
3. ✅ **Estado**: PR no debe ser draft
4. ✅ **Checks**: Todos los checks deben pasar (success/neutral)
5. ✅ **Status**: Todos los status checks deben pasar
6. ✅ **Mergeable**: PR no debe estar bloqueado (conflicts, etc.)

#### **Lógica de Verificación:**
```javascript
const hasAutoMergeLabel = pr.labels.some(label => label.name === 'auto-merge');
const checksReady = allChecksPassed && allStatusesPassed;
const notBlocked = pr.mergeable !== false;
const readyToMerge = checksReady && notBlocked && !pr.draft;
```

---

## 🚀 **Triggers del Workflow**

### **Eventos Inmediatos:**
- `pull_request`: [opened, synchronize, ready_for_review, labeled]
- `check_suite`: [completed]
- `check_run`: [completed]
- `pull_request_review`: [submitted]
- `workflow_run`: [completed]
- `status`: Cambios en status checks

### **Eventos de Backup:**
- `schedule`: Cada 5 minutos (`*/5 * * * *`)
- `workflow_dispatch`: Ejecución manual

---

## 📋 **Proceso Completo de PR**

### **1. Creación de PR**

#### **Método Recomendado (GitHub Actions):**
1. Ir a **Actions** tab en GitHub
2. Seleccionar **"Agent Automation Workflow"**
3. Click **"Run workflow"**
4. Llenar formulario:
   - **Task description**: Qué se logró
   - **Task type**: feat, fix, docs, style, refactor, test, chore
   - **Auto-merge**: Habilitar (recomendado)
5. Click **"Run workflow"**

#### **Método Manual:**
```bash
git checkout -b feat/your-feature-name
# Hacer cambios
git add .
git commit -m "feat: add new feature description"
git push origin feat/your-feature-name
node scripts/create-pr.js
```

### **2. Automatización Completa**
El sistema automáticamente:
- ✅ Crea feature branch con naming apropiado
- ✅ Commit con formato convencional
- ✅ Push a repositorio remoto
- ✅ Crea PR profesional
- ✅ Habilita auto-merge
- ✅ Espera que tests pasen
- ✅ Auto-merge del PR
- ✅ Elimina la branch
- ✅ Proporciona link del PR mergeado

### **3. Proceso de Merge**

#### **Método de Merge:**
- **Tipo**: Squash merge
- **Título**: `{PR title} (#{PR number})`
- **Cleanup**: Elimina la rama automáticamente

---

## 🏷️ **Sistema de Labels**

### **Labels de Tipo:**
- `type:feature` - Nuevas funcionalidades
- `type:bugfix` - Corrección de bugs
- `type:docs` - Cambios de documentación
- `type:style` - Formateo de código
- `type:refactor` - Refactoring
- `type:test` - Tests
- `type:chore` - Tareas de mantenimiento

### **Labels de Control:**
- `auto-merge` - **OBLIGATORIO** para auto-merge
- `size:small` - PR pequeño (0-300 líneas) - Auto-merge libre
- `size:medium` - PR mediano (301-800 líneas) - Auto-merge con warning
- `size:large` - PR grande (801-1500 líneas) - Auto-merge con issue de revisión
- `size:xl` - PR extra grande (>1500 líneas) - **BLOQUEADO** sin override

### **Límites de Bloqueo por Tipo:**
- **Base**: 1,500 líneas (bloquea auto-merge)
- **Documentación**: 1,200 líneas (override automático)
- **Docs + Refactor**: 2,000 líneas (override automático)
- **Migration**: 5,000 líneas (override automático)
- **Emergency**: Sin límite (override manual)

---

## 🏷️ **Sistema de Overrides de Tamaño**

### **Overrides Automáticos (por detección de contenido):**

| Tipo | Límite | Detección | Auto-merge |
|------|--------|-----------|------------|
| **Base** | 1,500 líneas | Por defecto | ❌ Bloqueado |
| **Documentation** | 1,200 líneas | `docs:` en título, archivos `docs/` | ✅ Permitido |
| **Docs + Refactor** | 2,000 líneas | `docs:` + `reorganize/refactor` | ✅ Permitido |
| **Migration** | 5,000 líneas | `migration/reorganize/complete` | ✅ Permitido |

### **Overrides Manuales (por etiquetas):**

| Etiqueta | Límite | Requiere Aprobación | Uso |
|----------|--------|-------------------|-----|
| `size/emergency` | Sin límite | ❌ No | Emergencias de seguridad |
| `size/migration` | 5,000 líneas | ❌ No | Migraciones grandes |
| `size/documentation` | 1,200 líneas | ❌ No | Solo documentación |
| `override:critical` | Sin límite | ✅ Sí | Fixes críticos producción |

### **Reglas de Aplicación:**
- ✅ **Detección automática** por título y archivos modificados
- ✅ **Overrides en cascada** (más específico gana)
- ✅ **Logging completo** de qué override se aplicó
- ✅ **Validación de patrones** de archivos para cada tipo

---

## 📊 **Naming Conventions**

### **Branches:**
```bash
feat/feature-name-timestamp
fix/bug-description-timestamp
docs/documentation-update-timestamp
```

### **Commits (Conventional):**
```bash
# Buenos ejemplos
feat: add user authentication
fix: resolve navigation bug
docs: update README
style: format code with prettier
refactor: reorganize component structure
test: add unit tests for validation
chore: update dependencies

# Malos ejemplos
added stuff
fixed bug
update
```

---

## 🔧 **Troubleshooting**

### **PR No Se Mergea**

#### **Verificar Condiciones:**
1. **Label**: ¿Tiene `auto-merge`?
2. **Checks**: ¿Todos pasando?
3. **Conflicts**: ¿Hay conflictos?
4. **Draft**: ¿Está marcado como draft?

#### **Revisar Logs:**
1. Ir a **Actions** → **PR Automation**
2. Buscar ejecución reciente
3. Revisar logs del job `auto-merge`
4. Identificar qué condición falla

### **Auto-merge No Funciona**
- Verificar que repositorio tiene auto-merge habilitado
- Verificar que todos los required status checks pasan
- Verificar branch protection rules
- Verificar permisos de GitHub Actions

### **Workflow Falla**
- Revisar Actions tab para logs detallados
- Problemas comunes: permisos, merge conflicts
- Cleanup automático remueve branches fallidas

---

## ⚙️ **Configuración del Sistema**

### **Permisos de GitHub Actions:**
```yaml
permissions:
  contents: write      # Para hacer merge
  pull-requests: write # Para gestionar PRs
  checks: read        # Para leer checks
  statuses: read      # Para leer status
```

### **Branch Protection:**
- **No requerido**: El workflow funciona sin branch protection
- **Compatible**: Funciona con branch protection habilitado
- **Recomendado**: Configurar required checks para mayor seguridad

---

## 🎯 **Mejores Prácticas para Agentes**

### **Antes de Crear PR:**
1. ✅ **Verificar tests** localmente
2. ✅ **Resolver conflictos** antes del auto-merge
3. ✅ **Usar conventional commits** siempre
4. ✅ **Agregar label** `auto-merge` solo cuando esté listo

### **Durante el Proceso:**
1. ✅ **Monitorear Actions** tab para progreso
2. ✅ **Reportar PR** inmediatamente tras creación
3. ✅ **No intervenir** durante auto-merge
4. ✅ **Verificar merge** exitoso

### **Después del Merge:**
1. ✅ **Confirmar branch** eliminada
2. ✅ **Verificar deploy** si aplica
3. ✅ **Actualizar local** con cambios
4. ✅ **Documentar** si hay lecciones aprendidas

---

## 🚨 **REGLAS CRÍTICAS: Lecciones de Fallos Reales**

> **Origen**: Documentación de fallos reales cometidos por agentes para prevenir repetición

### **🔴 REGLA #1: VALIDACIÓN OBLIGATORIA ANTES DE CUALQUIER PR**

#### **FALLO COMÚN:**
- Crear PRs sin validar primero
- No conocer límites del proyecto
- Violar reglas de tamaño

#### **REGLA ESTRICTA:**
```bash
# SIEMPRE EJECUTAR PRIMERO:
npm run pr:validate

# LEER los límites detectados automáticamente
# PLANIFICAR PRs que cumplan límites
# NO proceder si hay errores
```

#### **LÍMITES AUTOMÁTICOS:**
- **Máximo 15 archivos** por PR
- **Máximo 600 líneas** por PR
- **0 violaciones** de emoji policy
- **Tests críticos** deben pasar

---

### **🔴 REGLA #2: WORKFLOW DE PR COMPLETO Y OBLIGATORIO**

#### **FALLO COMÚN:**
- Crear PR pero no reportarlo
- No agregar etiquetas necesarias
- No verificar estado final

#### **SECUENCIA OBLIGATORIA:**
```bash
# 1. VALIDAR PRIMERO
npm run pr:validate

# 2. CREAR PR
gh pr create --title "..." --body "..."

# 3. REPORTAR PR (CRÍTICO)
npm run multi-agent:pr "<PR_URL>" "<PR_TITLE>"

# 4. AGREGAR ETIQUETA (CRÍTICO)
gh pr edit <NUM> --add-label "auto-merge"

# 5. VERIFICAR ESTADO FINAL
# Confirmar que auto-merge esté visible en GitHub
```

---

### **🔴 REGLA #3: MICRO-PRS OBLIGATORIOS**

#### **FALLO COMÚN:**
- PRs gigantes (93 archivos, 11k+ líneas)
- Múltiples propósitos en un PR
- Violación de límites del proyecto

#### **REGLA ESTRICTA:**
```bash
# LÍMITES ABSOLUTOS:
- Máximo 15 archivos por PR
- Máximo 600 líneas por PR
- UN propósito específico por PR
- DIVIDIR si excede límites

# EJEMPLOS CORRECTOS:
- PR #1: Solo documentación (8 archivos)
- PR #2: Solo scripts (1 archivo)
- PR #3: Solo tests (3 archivos)
```

---

### **🔴 REGLA #4: LIMPIEZA INMEDIATA DE BRANCHES**

#### **FALLO COMÚN:**
- Dejar branches obsoletos activos
- Confusión con múltiples branches
- Workspace desordenado

#### **REGLA ESTRICTA:**
```bash
# DESPUÉS de crear PRs exitosos:
git push origin --delete <branch-obsoleta>

# MANTENER workspace limpio
# ELIMINAR branches que no sirven
# NO acumular branches obsoletos
```

---

### **🔴 REGLA #5: VERIFICACIÓN FINAL OBLIGATORIA**

#### **FALLO COMÚN:**
- Reportar éxito sin verificar
- Asumir que auto-merge funciona
- No confirmar estado final

#### **REGLA ESTRICTA:**
```bash
# ANTES de reportar éxito:
1. ✅ Verificar etiqueta auto-merge visible
2. ✅ Confirmar que tests pasan
3. ✅ Verificar que PR no tiene conflictos
4. ✅ Confirmar auto-merge funcional
```

---

### **🔴 REGLA #6: ENTENDER WORKFLOW ANTES DE ACTUAR**

#### **FALLO COMÚN:**
- Actuar sin leer documentación
- No entender el proceso completo
- Múltiples iteraciones innecesarias

#### **REGLA ESTRICTA:**
```bash
# ANTES de empezar cualquier tarea:
1. ✅ Leer documentación del proyecto
2. ✅ Entender workflow completo
3. ✅ Conocer comandos disponibles
4. ✅ Aplicar principio "validar antes de actuar"
```

---

### **🔴 REGLA #7: SINTAXIS CORRECTA DE COMANDOS**

#### **FALLO COMÚN:**
- Ejecutar comandos sin parámetros
- Sintaxis incorrecta
- No leer mensajes de error

#### **REGLA ESTRICTA:**
```bash
# SINTAXIS CORRECTA:
npm run multi-agent:pr "<PR_URL>" "<PR_TITLE>"

# NO ejecutar sin parámetros:
npm run multi-agent:pr  # ❌ ERROR

# LEER mensajes de error y corregir
```

---

### **🔴 REGLA #8: PRINCIPIO DE VALIDACIÓN PROACTIVA**

#### **FALLO COMÚN:**
- Actuar sin validar estado
- Asumir que todo está bien
- No verificar antes de proceder

#### **REGLA ESTRICTA:**
```bash
# APLICAR SIEMPRE:
- Validar ANTES de actuar
- Verificar DESPUÉS de actuar
- Confirmar ANTES de reportar
- Limpiar DESPUÉS de completar
```

---

## 📈 **Indicadores de Éxito**

### **Workflow Exitoso:**
- ✅ Workflow muestra checkmark verde
- ✅ PR está merged y cerrado
- ✅ Branch está eliminada
- ✅ Paso final muestra URL del PR mergeado

### **Métricas a Monitorear:**
- **Tiempo promedio** de merge después de checks
- **Tasa de éxito** del auto-merge
- **PRs procesados** por día/semana
- **Errores comunes** y frecuencia

---

**Última actualización**: 2025-06-09
**Versión**: Consolidado v2.0 + Reglas Críticas
**Estado**: Activo y funcional con lecciones de fallos reales
