# Estándares del Proyecto

**Versión**: 2.0  
**Estado**: Fuente única de verdad para todos los estándares  
**Aplicación**: Obligatoria para agentes, desarrolladores y automatización

---

## 🎯 Propósito

Este documento define los estándares profesionales no negociables del proyecto. Todas las demás referencias a estándares deben apuntar a este documento como fuente autoritativa.

---

## 📋 ESTÁNDARES PROFESIONALES

### Contenido y Comunicación

#### Política de Emojis
**PERMITIDO en:**
- Templates de PR (`.github/*`)
- Documentación de usuario (`docs/*`)
- Scripts de automatización (`scripts/*`)
- Git hooks (`.githooks/*`)
- README y archivos de ayuda
- Mensajes de console.log en herramientas

**PROHIBIDO en:**
- Código fuente (`src/*`)
- Tests (`tests/*`, `*.test.js`)
- Archivos de configuración (`*.json`, `*.yml`)
- Blog posts (`src/content/blog/*`)
- Componentes (`src/components/*`)

**Razón**: Balance entre profesionalismo en código y usabilidad en herramientas
**Validación**: Automática via scripts y tests

#### Sin Referencias a IA/Agentes
- **Aplicación**: Commits, PRs, documentación pública
- **Prohibido**: "ganzo", "augment", "agent", "AI generated"
- **Razón**: El código debe hablar por sí mismo
- **Validación**: Automática via scripts

#### Idioma Español
- **Aplicación**: Documentación, explicaciones, comunicación
- **Excepción**: Código, comandos, nombres técnicos (inglés estándar)
- **Configuración**: `language: 'es'`, `locale: 'es-ES'`
- **Razón**: Consistencia y audiencia objetivo

#### Tono Técnico Profesional
- **Prohibido**: Lenguaje casual, múltiples exclamaciones
- **Requerido**: Precisión técnica, claridad, concisión
- **Validación**: Patterns automáticos en validator

---

## 🔧 ESTÁNDARES TÉCNICOS

### TypeScript Obligatorio
- **Regla**: Todo JavaScript debe migrar a TypeScript
- **Excepción**: Archivos de configuración específicos
- **Beneficio**: Tipado fuerte, mejor mantenibilidad
- **Validación**: ESLint y tests automáticos

### Testing Continuo
- **Antes de commits**: `npm run dev`, `npm run build`, `npm run preview`
- **Obligatorio**: Tests pasando antes de cualquier PR
- **Validación**: Pre-commit hooks y CI/CD

### Reutilización sobre Creación
- **Regla**: Siempre revisar componentes existentes antes de crear
- **Aplicación**: Componentes, utilities, configuraciones
- **Beneficio**: Consistencia y mantenibilidad

---

## 🔄 ESTÁNDARES DE WORKFLOW

### Git y Commits
- **Formato**: Conventional Commits obligatorio
- **Estructura**: `type(scope): description`
- **Validación**: Git hooks automáticos
- **Idioma**: Español para descriptions

### Pull Requests
- **Formato**: Template estructurado
- **Idioma**: Español
- **Contenido**: Título técnico, resumen, cambios, testing
- **Proceso**: Compartir link inmediatamente tras creación
- **Regla Estricta**: SIEMPRE incluir link completo del PR al mencionarlo
- **Formato Link**: `https://github.com/cappato/astro-blog/pull/[número]`
- **Aplicación**: Obligatorio en toda comunicación sobre PRs

### Acciones Destructivas
- **Regla**: NUNCA eliminar sin permiso explícito
- **Proceso**: Solicitar confirmación antes de cualquier eliminación
- **Aplicación**: Archivos, configuraciones, datos

---

## 🤖 AUTOMATIZACIÓN

### Validación Automática
- **Scripts**: `intelligent-content-validator.js`
- **Git Hooks**: Pre-commit y commit-msg
- **CI/CD**: GitHub Actions workflows
- **Tests**: Professional standards test suite

### Configuración Técnica
- **Ubicación**: `src/config/site.ts` (fuente autoritativa)
- **Re-exportación**: `src/config/index.ts`
- **Features**: Configuraciones específicas por feature

---

## 📚 REFERENCIAS

### Implementación Técnica
- **Configuración**: `src/config/site.ts`
- **Validación**: `scripts/intelligent-content-validator.js`
- **Git Hooks**: `scripts/install-git-hooks.js`
- **Tests**: `tests/professional-standards.test.ts`

### Documentación
- **Reglas Simplificadas**: `docs/rules-essential.md`
- **Stack Técnico**: `docs/tech-stack.md`
- **Blog Educativo**: Posts sobre estándares profesionales

---

## ✅ CUMPLIMIENTO

### Para Agentes/IA
1. Consultar este documento antes de cualquier acción
2. Aplicar estándares automáticamente
3. Validar output contra estas reglas
4. Reportar violaciones detectadas
5. **OBLIGATORIO**: Incluir link completo al mencionar cualquier PR
6. **OBLIGATORIO**: Usar formato `https://github.com/cappato/astro-blog/pull/[número]`

### Para Desarrolladores
1. Configurar git hooks: `npm run setup:hooks`
2. Ejecutar validaciones: `npm run validate:standards`
3. Revisar este documento regularmente
4. Proponer mejoras via PR

### Para Automatización
1. Implementar validaciones basadas en estas reglas
2. Fallar builds si se violan estándares
3. Generar reportes de cumplimiento
4. Mantener métricas de calidad

---

**Este documento es la fuente única de verdad. Todas las demás referencias deben apuntar aquí.**
