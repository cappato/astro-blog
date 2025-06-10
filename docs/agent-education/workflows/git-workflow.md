# 🔄 Git Workflow

**Documento**: 2.2 - IMPORTANTE  
**Propósito**: Flujo Git y comandos específicos para agentes ganzo

---

## **🎯 Configuración Obligatoria**

### **Identidad Git**
```bash
git config user.name "ganzo"
git config user.email "ganzo@cappato.dev"
```

### **Configuración Anti-Interactive**
```bash
git config --global core.editor "true"
export GIT_EDITOR=true
```

---

## **🚀 Comandos Git Disponibles**

### **Workflow Completo**
| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm run git:status` | Ver estado actual | Verificar estado antes de actuar |
| `npm run git:branch` | Crear nueva branch | Iniciar nueva feature/fix |
| `npm run git:commit` | Commit con mensaje | Guardar cambios |
| `npm run git:push` | Push a remote | Subir cambios |
| `npm run git:pr` | Crear PR | Solicitar merge |
| `npm run git:complete` | Workflow completo | Automatizar todo el flujo |

### **Comando Completo Automatizado**
```bash
npm run git:complete
# Ejecuta: status → add → commit → push → create-pr
```

---

## **📋 Flujo de Trabajo Estándar**

### **Paso 1: Verificar Estado**
```bash
npm run git:status
# Verifica: branch actual, cambios pendientes, estado de sync
```

### **Paso 2: Actualizar desde Main**
```bash
git checkout main
git pull origin main
```

### **Paso 3: Crear Nueva Branch**
```bash
npm run git:branch
# Crea branch con formato: feature/YYYY-MM-DD-description
```

### **Paso 4: Hacer Cambios y Commit**
```bash
# Hacer cambios en archivos
npm run git:commit
# Prompt interactivo para mensaje conventional
```

### **Paso 5: Push y PR**
```bash
npm run git:push
npm run git:pr
# Crea PR automáticamente con template
```

---

## **🏷️ Naming Conventions**

### **Branch Names**
```bash
feature/2025-01-15-add-blog-search
fix/2025-01-15-seo-meta-tags
docs/2025-01-15-update-readme
chore/2025-01-15-update-deps
```

### **Commit Messages**
```bash
feat(blog): add search functionality with filters
fix(seo): correct meta description length validation
docs(readme): update installation instructions
chore(deps): update astro to v5.8.0
```

---

## **⚡ Comandos Git Rápidos**

### **Estado y Navegación**
```bash
git status                    # Estado actual
git branch -a                 # Ver todas las branches
git log --oneline -10         # Últimos 10 commits
git diff                      # Ver cambios no staged
git diff --cached             # Ver cambios staged
```

### **Gestión de Cambios**
```bash
git add .                     # Agregar todos los cambios
git add -p                    # Agregar cambios selectivamente
git reset HEAD~1              # Deshacer último commit (mantener cambios)
git reset --hard HEAD~1       # Deshacer último commit (perder cambios)
```

### **Branches y Remote**
```bash
git checkout main             # Cambiar a main
git checkout -b nueva-branch  # Crear y cambiar a nueva branch
git push -u origin branch     # Push inicial con tracking
git pull origin main          # Actualizar desde remote
```

---

## **🔧 Resolución de Problemas Comunes**

### **Branch Desactualizada**
```bash
git checkout main
git pull origin main
git checkout tu-branch
git rebase main
# Si hay conflictos: resolver → git add . → git rebase --continue
```

### **Commit Message Incorrecto**
```bash
git commit --amend -m "nuevo mensaje correcto"
# Solo si no has hecho push aún
```

### **Deshacer Cambios**
```bash
git checkout -- archivo.txt   # Deshacer cambios en archivo específico
git reset --hard HEAD         # Deshacer todos los cambios no committed
git clean -fd                  # Eliminar archivos no tracked
```

### **Problemas con Push**
```bash
git push --force-with-lease    # Force push seguro
git push -u origin branch      # Establecer tracking de branch
```

---

## **📊 Verificación de Estado**

### **Antes de Cualquier Acción**
```bash
npm run git:status
# Verifica:
# - Branch actual
# - Cambios pendientes  
# - Estado de sync con remote
# - Archivos untracked
```

### **Antes de Crear PR**
```bash
npm run validate:pr
# Verifica:
# - Tests pasan
# - Build exitoso
# - Tamaño de PR dentro de límites
# - No hay conflictos
```

---

## **🎯 Mejores Prácticas**

### **Commits Frecuentes**
- ✅ Commits pequeños y atómicos
- ✅ Un cambio lógico por commit
- ✅ Mensajes descriptivos y claros
- ✅ Conventional commits siempre

### **Branches Limpias**
- ✅ Una feature por branch
- ✅ Nombres descriptivos con fecha
- ✅ Actualizar desde main frecuentemente
- ✅ Eliminar branches merged

### **Colaboración**
- ✅ Pull antes de push
- ✅ Resolver conflictos localmente
- ✅ No force push a branches compartidas
- ✅ Comunicar cambios importantes

---

## **⚠️ Reglas Críticas**

### **Antes de Cualquier Trabajo**
- ✅ SIEMPRE estar en main actualizado
- ✅ SIEMPRE crear nueva branch para cambios
- ✅ SIEMPRE configurar identidad git correcta

### **Antes de Push**
- ✅ SIEMPRE ejecutar tests localmente
- ✅ SIEMPRE verificar que build funciona
- ✅ SIEMPRE usar conventional commits

### **Gestión de Conflictos**
- ✅ Resolver conflictos localmente
- ✅ Probar después de resolver conflictos
- ✅ Si es complejo, cerrar PR y crear nuevo

---

## **🚨 Comandos de Emergencia**

### **Recuperar Trabajo Perdido**
```bash
git reflog                    # Ver historial de acciones
git checkout HEAD@{n}         # Recuperar estado específico
git cherry-pick commit-hash   # Aplicar commit específico
```

### **Limpiar Estado Corrupto**
```bash
git reset --hard origin/main  # Resetear a estado remoto
git clean -fdx                # Limpiar todo (incluso node_modules)
git fetch --all               # Re-sincronizar con remote
```

### **Backup de Emergencia**
```bash
git stash push -m "backup antes de operación riesgosa"
git branch backup-$(date +%Y%m%d-%H%M%S)
```

---

**Este workflow está optimizado para el sistema multi-agente y garantiza consistencia en el manejo de Git.**
