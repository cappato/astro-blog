# PROTOCOLO DE MANTENIMIENTO

## ACTUALIZACION OBLIGATORIA AL FINALIZAR CADA SESION

### REGLA CRITICA:
**NUNCA terminar una sesion sin actualizar la documentacion de estado**

---

## ARCHIVOS A ACTUALIZAR:

### 1. `.augment/CURRENT-TASK.md` (SIEMPRE):

#### **Si la tarea continua:**
```markdown
## STATUS: [actualizar si cambio]
## PROGRESS: [actualizar progreso]

## NEXT_ACTION: [proxima accion especifica]

## SUCCESS_CRITERIA:
- [x] [criterios completados]
- [ ] [criterios pendientes]
```

#### **Si la tarea se completo:**
```markdown
## STATUS: COMPLETED
## PROGRESS: 4/4_phases_complete
## COMPLETION_DATE: [fecha]
## NEXT_TASK: [siguiente tarea en cola]
```

### 2. `.augment/TASK-HISTORY.md` (SOLO CAMBIOS CRITICOS):

#### **Agregar entrada SOLO para:**
- **Transiciones de estado importantes** (tarea completada, nueva tarea iniciada)
- **Decisiones arquitectonicas criticas** (cambios de enfoque, conflictos resueltos)
- **Problemas/soluciones no obvias** (bugs complejos, workarounds necesarios)

#### **Formato simplificado:**
```markdown
### Session #X - [FECHA] ([TIPO]: [TEMA_BREVE])
**DECISION_CRITICA:** [solo si aplica]
**ESTADO_TRANSICION:** [estado_anterior] - [estado_nuevo]
**CONTEXTO_PROXIMA_SESION:** [solo lo esencial para continuar]
```

---

## CHECKLIST DE FINALIZACION:

### **ANTES DE TERMINAR CADA SESION:**
- [ ] **CURRENT-TASK.md actualizado** con progreso real
- [ ] **TASK-HISTORY.md actualizado** SOLO si hay cambios criticos
- [ ] **DYNAMIC-RULES.md actualizado** si recibi nuevo feedback
- [ ] **Proxima accion** claramente definida en CURRENT-TASK.md
- [ ] **Contexto preservado** para siguiente sesion
- [ ] **Estado consistente** entre archivos criticos

---

## GESTION DE TRANSICIONES:

### **CUANDO SE COMPLETA UNA TAREA:**
1. **Marcar como COMPLETED** en CURRENT-TASK.md
2. **Mover a COMPLETED_TASKS** en TASK-HISTORY.md
3. **Actualizar ACTIVE_TASK** con siguiente tarea
4. **Crear contexto** para nueva tarea activa

### **CUANDO SE CREA NUEVA TAREA:**
1. **Agregar a UPCOMING_TASKS** en TASK-HISTORY.md
2. **Crear entrada** en CURRENT-TASK.md si es inmediata
3. **Definir SUCCESS_CRITERIA** especificos
4. **Establecer FILES_NEEDED** y dependencias

---

## OBJETIVO DEL MANTENIMIENTO:

### **GARANTIZAR:**
- **Contexto completo** para proximas sesiones
- **Progreso documentado** de manera precisa
- **Decisiones registradas** para referencia futura
- **Estado consistente** en todos los archivos
- **Recuperacion posible** ante cualquier interrupcion

---

**PROTOCOLO_VERSION:** 1.0 
**ENFORCEMENT:** CRITICO - NUNCA OMITIR 
**LAST_UPDATE:** 2025-01-02 
**VERIFICACION:** OBLIGATORIA ANTES DE FINALIZAR SESION