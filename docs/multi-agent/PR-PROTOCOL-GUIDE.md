#  Protocolo de Pull Requests - Guía Rápida

##  Objetivo
Estandarizar el proceso de creación y reporte de PRs para mejorar la trazabilidad y colaboración en el sistema multi-agente.

##  Protocolo Obligatorio

###  Al Crear un PR:

1. **Crear el PR en GitHub/GitLab**
2. **Inmediatamente ejecutar (OPCIÓN RECOMENDADA - Auto-detección):**
   ```bash
   npm run multi- "Nombre_Agente"
   ```
3. **O manualmente si la auto-detección falla:**
   ```bash
   npm run multi- "Nombre_Agente" "URL_del_PR" "Título del PR"
   ```

###  Ejemplos Prácticos:

#### **Método Recomendado (Auto-detección):**
```bash
# El sistema detecta automáticamente el último PR
npm run multi- ""
npm run multi- "Frontend Specialist"
npm run multi- "Content Manager"
```

#### **Método Manual (Backup):**
```bash
# Si la auto-detección falla, usar método manual
npm run multi- "" "https://github.com/user/repo/pull/123" "Fix SEO meta tags optimization"
npm run multi- "Frontend Specialist" "https://github.com/user/repo/pull/124" "Add responsive navigation component"
npm run multi- "Content Manager" "https://github.com/user/repo/pull/125" "Update blog post templates"
```

#### **Consultar Último PR:**
```bash
# Ver información del último PR antes de reportar
npm run multi--pr
```

##  Qué Hace el Comando

### **Modo Auto-detección (Recomendado):**
1. **Consulta automáticamente** el último PR creado usando GitHub CLI
2. **Detecta URL y título** automáticamente
3. **Evita errores** de numeración y conflictos entre agentes
4. **Genera reporte completo** usando template estandarizado
5. **Agrega a work-status.md** para trazabilidad

### **Modo Manual (Backup):**
1. **Usa información proporcionada** manualmente
2. **Genera reporte completo** usando template estandarizado
3. **Agrega a work-status.md** para trazabilidad
4. **Crea checklist** para revisión sistemática
5. **Documenta métricas** y estado de tests

##  Template Generado

El comando genera automáticamente:

-  **Información básica** (fecha, agente, link, título)
-  **Checklist de tests** (unitarios, integración, build, SEO)
-  **Estado de documentación** (README, docs técnicas, changelog)
-  **Análisis de impacto** (tipo, área, breaking changes)
-  **Revisión requerida** (code review, testing, SEO, performance)
-  **Métricas** (performance, bundle size, SEO score)
-  **Deploy status** (staging, production, rollback plan)
-  **Enlaces relacionados** (issues, documentación, demos)

##  Beneficios

### Para el Equipo:
- **Trazabilidad completa** de todos los PRs
- **Revisión sistemática** con checklists estandarizados
- **Comunicación clara** entre agentes
- **Historial centralizado** en work-status.md

### Para el Proyecto:
- **Calidad consistente** con validaciones obligatorias
- **Documentación automática** de cambios
- **Métricas de impacto** para cada PR
- **Proceso escalable** para múltiples agentes
- **Prevención de conflictos** con auto-detección de PRs

## ️ Enforcement Level: OBLIGATORY

- **Regla**: Al crear un PR, SIEMPRE compartir el link inmediatamente
- **Aplicación**: Todos los PRs sin excepción
- **Violación**: Permitida solo con coordinación explícita
- **Documentación**: Automática en work-status.md

##  Workflow Completo

### 1. Desarrollo
```bash
# Trabajo normal del agente
git checkout -b feature/nueva-funcionalidad
# ... desarrollo ...
git commit -m "[AGENT] Implementar nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. Crear PR
```bash
# Crear PR en GitHub/GitLab
# Obtener URL del PR
```

### 3. Reportar PR (INMEDIATAMENTE)
```bash
npm run multi- "Nombre_Agente" "URL_del_PR" "Título del PR"
```

### 4. Completar Checklist
- Revisar el reporte generado en `docs/multi-agent/work-status.md`
- Completar manualmente los checkboxes según corresponda
- Actualizar métricas y notas adicionales

### 5. Seguimiento
- El reporte queda documentado para revisión
- Otros agentes pueden ver el estado del PR
- Facilita la coordinación y revisión

##  Comandos Relacionados

```bash
# Ver ayuda completa
npm run multi-agent

# Verificar protocolos
npm run multi-

# Actualizar estado del agente
npm run multi- "Nombre_Agente"

# Consultar último PR (NUEVO)
npm run multi--pr

# Reportar PR con auto-detección (RECOMENDADO)
npm run multi- "Agente"

# Reportar PR manualmente (backup)
npm run multi- "Agente" "URL" "Título"
```

##  Archivos Involucrados

- **Protocolo**: `docs/multi-agent/protocols/shared-protocols.md`
- **Template**: `docs/multi-agent/templates/pr-report.md`
- **Reportes**: `docs/multi-agent/work-status.md`
- **Script**: `scripts/multi-agent-manager.js`
- **Comandos**: `package.json`

##  Tips y Mejores Prácticas

###  Hacer:
- Ejecutar el comando inmediatamente después de crear el PR
- Completar el checklist antes de solicitar revisión
- Actualizar métricas si hay datos disponibles
- Agregar notas adicionales relevantes

###  Evitar:
- Olvidar reportar el PR
- Dejar el checklist incompleto
- No actualizar el estado de tests
- Omitir información de impacto

##  Evolución del Protocolo

Este protocolo puede evolucionar basado en:
- Feedback del equipo
- Lecciones aprendidas
- Nuevas necesidades del proyecto
- Mejoras en automatización

---

**Implementado por**:  (SEO Specialist)
**Fecha**: 2025-06-06
**Versión**: 1.0
**Estado**: Activo y obligatorio
