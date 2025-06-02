# Sistema de Anchos de Contenedor Centralizados

## Descripción General

Este documento describe el sistema centralizado de anchos de contenedor implementado para garantizar consistencia visual en todo el sitio web usando componentes Astro reutilizables.

## Problema Resuelto

**Antes**: Cada página y componente definía sus propios anchos de manera individual:
- `max-w-3xl` en algunas secciones
- `max-w-4xl` en otras
- `max-w-6xl` en casos especiales
- Inconsistencia visual entre páginas

**Después**: Sistema centralizado con clases semánticas reutilizables.

## Componentes Astro Centralizados

### Ubicación
Los componentes están en `src/components/layout/`:
- `ContentContainer.astro` - Contenedor principal
- `ContentWidth.astro` - Control de ancho

### ⚠️ IMPORTANTE: Evitar Anidamiento Problemático

**❌ INCORRECTO** - Anidamiento que causa problemas:
```astro
<div class="max-w-4xl mx-auto">
  <div class="max-w-4xl mx-auto">  <!-- ¡Problemático! -->
    <p>Contenido más estrecho de lo esperado</p>
  </div>
</div>
```

**✅ CORRECTO** - Jerarquía clara:
```astro
<ContentContainer>  <!-- Solo container + padding -->
  <ContentWidth width="standard">  <!-- Solo max-width -->
    <p>Contenido con ancho correcto</p>
  </ContentWidth>
</ContentContainer>
```

### Componentes Disponibles

#### `ContentContainer`
```astro
<ContentContainer padding={true} as="section">
  <!-- Contenido -->
</ContentContainer>
```
- **Responsabilidad**: Container + padding (NO max-width)
- **Props**: `padding`, `as`, `className`
- **Reemplaza**: `container mx-auto px-6 sm:px-4`

#### `ContentWidth`
```astro
<ContentWidth width="standard" as="div">
  <!-- Contenido -->
</ContentWidth>
```
- **Responsabilidad**: Control de ancho (SÍ max-width)
- **Props**: `width`, `as`, `className`
- **Anchos disponibles**:
  - `standard`: max-w-4xl (896px) - Ancho estándar
  - `wide`: max-w-6xl (1152px) - Galerías, tablas
  - `narrow`: max-w-2xl (672px) - Formularios
  - `full`: w-full - Ancho completo

## Implementación

### Estructura Típica
```astro
<!-- Antes -->
<section class="container mx-auto px-6 sm:px-4 py-10">
    <h2 class="max-w-4xl mx-auto">Título</h2>
    <div class="max-w-4xl mx-auto">
        <!-- Contenido -->
    </div>
</section>

<!-- Después -->
<ContentContainer as="section" className="py-10">
    <ContentWidth width="standard">
        <h2>Título</h2>
        <div>
            <!-- Contenido -->
        </div>
    </ContentWidth>
</ContentContainer>
```

### Casos de Uso

#### Contenido Principal (Estándar)
```astro
---
import ContentContainer from '@/components/layout/ContentContainer.astro';
import ContentWidth from '@/components/layout/ContentWidth.astro';
---

<ContentContainer as="section" className="py-10">
    <ContentWidth width="standard">
        <!-- Artículos, secciones principales -->
    </ContentWidth>
</ContentContainer>
```

#### Formularios y Contenido Estrecho
```astro
<ContentContainer as="section" className="py-10">
    <ContentWidth width="narrow">
        <!-- Formularios de contacto, login -->
    </ContentWidth>
</ContentContainer>
```

#### Galerías y Contenido Amplio
```astro
<ContentContainer as="section" className="py-10">
    <ContentWidth width="wide">
        <!-- Galerías de imágenes, tablas grandes -->
    </ContentWidth>
</ContentContainer>
```

#### Solo Control de Ancho (sin padding)
```astro
<!-- Cuando ya tienes un contenedor con padding -->
<section class="py-10 px-6">
    <ContentWidth width="standard">
        <!-- Solo necesitas controlar el ancho -->
    </ContentWidth>
</section>
```

## Archivos Actualizados

### Componentes de Secciones
- `src/components/sections/AboutSection.astro`
- `src/components/sections/ExperienceSection.astro`
- `src/components/sections/SkillsSection.astro`
- `src/components/sections/EducationSection.astro`
- `src/components/sections/AchievementsSection.astro`
- `src/components/sections/HobbiesSection.astro`
- `src/components/sections/ContactSection.astro`

### Layouts
- `src/layouts/PostLayout.astro`

### Páginas
- `src/pages/blog/index.astro`

## Beneficios

1. **Consistencia Visual**: Todas las páginas tienen el mismo ancho
2. **Mantenimiento Centralizado**: Cambiar el ancho en un solo lugar
3. **Semántica Clara**: Nombres descriptivos para diferentes casos de uso
4. **Flexibilidad**: Diferentes anchos para diferentes tipos de contenido
5. **Responsive**: Mantiene el comportamiento responsive existente

## Configuración Global

Para cambiar el ancho estándar de todo el sitio, editar en `src/styles/theme.css`:

```css
.content-width {
  @apply max-w-5xl mx-auto; /* Cambiar aquí para todo el sitio */
}
```

## Responsive Behavior

- **Desktop**: Anchos fijos según la clase
- **Tablet**: Se adapta automáticamente con padding lateral
- **Mobile**: Usa ancho completo con padding mínimo (`px-6 sm:px-4`)

## Migración

Para migrar componentes existentes:

1. **Importar componentes**:
   ```astro
   ---
   import ContentContainer from '@/components/layout/ContentContainer.astro';
   import ContentWidth from '@/components/layout/ContentWidth.astro';
   ---
   ```

2. **Reemplazar contenedores**:
   - `container mx-auto px-6 sm:px-4` → `<ContentContainer>`
   - `max-w-4xl mx-auto` → `<ContentWidth width="standard">`

3. **Evitar anidamiento problemático**:
   - NO anidar múltiples `max-w-*` classes
   - Usar jerarquía clara: Container → Width → Content

4. **Evaluar anchos específicos**:
   - Formularios → `width="narrow"`
   - Galerías → `width="wide"`
   - Contenido estándar → `width="standard"`

5. **Probar en diferentes tamaños de pantalla**
