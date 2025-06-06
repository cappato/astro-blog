# Reglas Esenciales del Proyecto

**Versión**: 1.0  
**Aplicación**: Obligatoria para todos los agentes y desarrollo

---

## 🚫 ESTÁNDARES PROFESIONALES (NO NEGOCIABLES)

### Contenido Profesional
- **Sin emojis**: En código, commits, PRs, documentación o cualquier output
- **Sin nombres de agentes**: En commits, PRs o contenido público
- **Sin lenguaje casual**: Mantener tono técnico profesional únicamente
- **Sin referencias**: A "augment", "agent", firmas raras o menciones de IA
- **Enfoque técnico**: Todo contenido debe ser puramente técnico y profesional
- **Validación automática**: Los tests fallan si se violan estas reglas

### Comunicación
- **Idioma español**: Todas las interacciones en español
- **Excepción técnica**: Elementos técnicos (código, comandos, nombres de archivos)
- **Aplicación**: Documentación, explicaciones, comunicación

---

## ⚙️ DESARROLLO (FUNDAMENTALES)

### TypeScript Obligatorio
- **Regla**: Todo código JavaScript debe usar TypeScript con mejores prácticas
- **Aplicación**: Archivos .js, .ts, .astro con lógica
- **Contexto**: Mantener tipado fuerte y aprovechar beneficios de TypeScript

### Testing Continuo
- **Antes de commits**: `npm run dev`, `npm run build`, `npm run preview`
- **Sin excepciones**: Testing obligatorio antes de cualquier commit
- **Validación**: Funcionalidad crítica + consola limpia

### Reutilización sobre Creación
- **Regla**: Siempre reutilizar componentes antes de crear nuevos
- **Aplicación**: Cualquier nueva funcionalidad o vista
- **Contexto**: Consistencia visual y mantenibilidad del código

### Tailwind Expert Level
- **Regla**: Usar Tailwind como expertos, evitar CSS custom innecesario
- **Sistema híbrido**: `@layer components` con `@apply` para patrones repetitivos (3+ veces)
- **Aplicación**: Todos los estilos y componentes

---

## 🔄 WORKFLOW (OBLIGATORIOS)

### Protocolo de PRs
- **Regla**: Al crear un PR, compartir el link inmediatamente
- **Formato**: Título claro + resumen + estado de tests
- **Beneficio**: Trazabilidad y colaboración efectiva
- **Timing**: Inmediatamente después de crear el PR

### Acciones Destructivas
- **Regla**: NUNCA eliminar archivos sin permiso explícito del usuario
- **Aplicación**: Cualquier operación de eliminación o modificación destructiva
- **Proceso**: Solicitar confirmación antes de cualquier acción destructiva

### Aprendizaje Automático
- **Regla**: Incorporar feedback automáticamente a las reglas
- **Aplicación**: Cualquier feedback o corrección del usuario
- **Proceso**: Documentar y aplicar feedback inmediatamente

---

## 📝 FORMATO DE COMMITS PROFESIONAL

```
Descripción técnica breve de los cambios

- Cambio técnico específico 1
- Cambio técnico específico 2
- Tests: pasando
- Documentación: actualizada
```

## 📋 FORMATO DE PRs PROFESIONAL

```
Título técnico describiendo el cambio

## Resumen
Descripción técnica breve de los cambios implementados.

## Cambios
- Cambio técnico 1
- Cambio técnico 2

## Testing
- Tests pasando
- Build exitoso

## Documentación
- Documentación actualizada según necesidad
```

---

**Estas reglas son la base para mantener calidad profesional y consistencia en todo el desarrollo.**
