# Protocolos Compartidos Multi-Agente

**Version**: 1.1
**Fecha**: 2025-06-06
**Enforcement**: Obligatorio para todos los agentes

## PROFESSIONAL STANDARDS - CRITICAL ENFORCEMENT

### Content Standards (NO EXCEPTIONS)
- **NO EMOJIS** anywhere in code, commits, PRs, documentation, or any output
- **NO AGENT NAMES** in commits, PRs, or public-facing content
- **NO CASUAL LANGUAGE** - maintain professional technical tone only
- **NO REFERENCES** to "augment", "agent", "", "", ""
- **TECHNICAL FOCUS** - all content must be purely technical and professional
- **VALIDATION**: Automated tests will fail if these standards are violated

### Professional Commit Format
```
Brief technical description of changes

- Specific technical change 1
- Specific technical change 2
- Tests: passing
- Documentation: updated
```

### Professional PR Format
```
Technical title describing the change

## Summary
Brief technical description of changes implemented.

## Changes
- Technical change 1
- Technical change 2

## Testing
- Tests passing
- Build successful

## Documentation
- Documentation updated as needed
```

## Principios Fundamentales

### Estandares Profesionales Obligatorios
- **Enforcement**: FUNDAMENTAL
- **Regla**: Todo codigo debe cumplir estandares de ingenieria de software profesional
- **Aplicacion**: Nunca implementar soluciones suboptimas o temporales
- **Escalacion**: Pausar y consultar antes de comprometer calidad

### Comunicacion en Espanol
- **Enforcement**: OBLIGATORY
- **Regla**: Todas las interacciones en idioma espanol
- **Excepcion**: Elementos tecnicos (codigo, comandos, nombres de archivos)
- **Aplicacion**: Documentacion, status updates, comunicacion entre agentes

### TypeScript Obligatorio
- **Enforcement**: FUNDAMENTAL
- **Regla**: Todo codigo JavaScript debe usar TypeScript con mejores practicas
- **Aplicacion**: Archivos .js, .ts, .astro con logica
- **Contexto**: Mantener tipado fuerte y aprovechar beneficios de TypeScript

### Reutilizacion Sobre Creacion
- **Enforcement**: FUNDAMENTAL
- **Regla**: Siempre reutilizar componentes existentes antes de crear nuevos
- **Aplicacion**: Cualquier nueva funcionalidad o vista
- **Contexto**: Consistencia visual y mantenibilidad del codigo

---

## Protocolos de Desarrollo

### Workflow Incremental
1. **Antes de Cualquier Cambio**:
   - Leer contexto actual en work-status.md
   - Confirmar entendimiento de requisitos
   - Identificar archivos a modificar
   - Verificar que no hay conflictos

2. **Durante Desarrollo**:
   - Cambios pequenos, un componente a la vez
   - Testing inmediato: `npm run dev` despues de cada cambio
   - Verificar funcionalidad manualmente
   - No romper funcionalidad existente

3. **Antes de Commit**:
   - Tests tecnicos: `npm run dev`, `npm run build`, `npm run preview`
   - Verificacion de funcionalidad: features criticas, consola limpia
   - Actualizacion de documentacion: work-status.md, README.md si aplica

### Testing Continuo
- **Enforcement**: OBLIGATORY
- **Regla**: Testing antes de cada commit sin excepciones
- **Comandos Obligatorios**:
  - `npm run dev` - Servidor de desarrollo sin errores
  - `npm run build` - Build de produccion exitoso
  - `npm run preview` - Preview funcional
  - `npm test` - Todos los tests pasando (si existen)

### Formato de Commits
```
[AGENT_TYPE] Descripcion breve de cambios

- Cambio especifico 1
- Cambio especifico 2
- Tests: todos pasando
- Docs: actualizadas
```

### Protocolo de Pull Requests
- **Enforcement**: OBLIGATORY
- **Regla**: Al crear un PR, siempre compartir el link inmediatamente
- **Aplicacion**: Todos los PRs sin excepcion
- **Formato Estandar**:
  ```
   PR Creado: [Titulo del PR]
  Link: https://github.com/usuario/repo/pull/123

   Resumen:
  - [Cambio principal 1]
  - [Cambio principal 2]

  🧪 Tests:  Todos pasando
   Docs:  Actualizadas
  ```
- **Beneficios**: Trazabilidad, colaboracion, revision rapida
- **Timing**: Inmediatamente despues de crear el PR

---

## Protocolos de Coordinacion

### Deteccion de Conflictos
1. **Antes de Modificar Archivos**:
   - Verificar ownership en agent-assignments.md
   - Revisar work-status.md para agentes activos
   - Confirmar que no hay conflictos pendientes

2. **Al Detectar Conflicto**:
   - Pausar trabajo inmediatamente
   - Actualizar work-status.md con flag de conflicto
   - Notificar a agentes involucrados
   - Usar template de conflict-resolution.md

### Escalacion Arquitectonica
- **Cuando Escalar**:
  - Conflictos arquitectonicos entre sistemas existentes
  - Multiples enfoques sin claridad sobre el mejor
  - Decisiones que afectan estructura global del proyecto
  - Incertidumbre sobre patrones a seguir

- **Proceso de Escalacion**:
  1. Documentar problema y opciones consideradas
  2. Solicitar orientacion con contexto tecnico especifico
  3. Esperar direccion sin implementar soluciones temporales
  4. Mantener codigo en estado estable

### Actualizacion de Estado
- **Frecuencia**: Cada 2 horas durante trabajo activo
- **Contenido Obligatorio**:
  - Progreso actual en porcentaje
  - Archivos modificados en la sesion
  - Conflictos detectados o resueltos
  - ETA actualizado si cambio

---

## Protocolos de Calidad

### Criterios de Calidad
- **Codigo Limpio**: Nombres descriptivos, funciones con responsabilidad unica
- **Arquitectura Solida**: Separacion de responsabilidades, bajo acoplamiento
- **Mantenibilidad**: Facil de entender y modificar, documentacion adecuada
- **Testabilidad**: Tests que validen comportamiento

### Tailwind Expert Level
- **Enforcement**: OBLIGATORY
- **Regla**: Usar Tailwind con Astro como expertos, evitar CSS custom innecesario
- **Aplicacion**: Todos los estilos y componentes
- **Sistema Hibrido**: Usar @layer components con @apply para patrones repetitivos (3+ veces)

### Modularizacion Maxima
- **Enforcement**: FUNDAMENTAL
- **Regla**: Extraer componentes al maximo extent posible
- **Aplicacion**: Crear componentes documentados, testeados, reutilizables
- **Contexto**: Aprovechar sistema de features modulares existente

---

## Protocolos de Mantenimiento

### Actualizacion de Documentacion
- **Enforcement**: OBLIGATORY
- **Antes de Finalizar Sesion**:
  - Actualizar work-status.md con progreso final
  - Documentar lecciones aprendidas en conflict-log.md
  - Actualizar agent-assignments.md si cambiaron responsabilidades
  - Preparar contexto para proxima sesion

### Acciones Destructivas
- **Enforcement**: CRITICAL
- **Regla**: NUNCA eliminar archivos sin permiso explicito del usuario
- **Aplicacion**: Cualquier operacion de eliminacion o modificacion destructiva
- **Proceso**: Solicitar confirmacion antes de cualquier accion destructiva

### Aprendizaje Automatico
- **Enforcement**: OBLIGATORY
- **Regla**: Incorporar feedback automaticamente a reglas dinamicas
- **Aplicacion**: Cualquier feedback o correccion del usuario
- **Proceso**: Documentar y aplicar feedback inmediatamente en conflict-log.md

---

## Niveles de Enforcement

### FUNDAMENTAL
- Reglas arquitectonicas que no se pueden violar nunca
- Ejemplos: TypeScript obligatorio, reutilizacion sobre creacion
- Violacion: Requiere escalacion inmediata

### CRITICAL
- Reglas de calidad que requieren justificacion para excepciones
- Ejemplos: Estandares profesionales, acciones destructivas
- Violacion: Documentar justificacion en conflict-log.md

### OBLIGATORY
- Reglas de proceso que deben seguirse salvo casos especiales
- Ejemplos: Testing continuo, comunicacion en espanol
- Violacion: Permitida solo con coordinacion explicita

### RECOMMENDED
- Mejores practicas que se prefieren pero admiten flexibilidad
- Ejemplos: Frecuencia de updates, formato especifico de commits
- Violacion: Aceptable con razon valida

---

## Aplicacion de Protocolos

### En Cada Decision
1. Verificar enforcement level de reglas aplicables
2. Aplicar reglas FUNDAMENTAL sin excepciones
3. Justificar excepciones a reglas CRITICAL
4. Coordinar excepciones a reglas OBLIGATORY
5. Documentar decisiones en work-status.md

### En Cada Sesion
1. Cargar protocolos al inicio
2. Aplicar durante todo el trabajo
3. Actualizar reglas dinamicas con nuevo feedback
4. Documentar compliance antes de finalizar

---

**Protocolo Version**: 1.0
**Integracion**: Cargado automaticamente por todos los agentes
**Actualizacion**: Basada en feedback y lecciones aprendidas
