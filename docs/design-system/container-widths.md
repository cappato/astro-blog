# Sistema de Anchos de Contenedor Centralizados

## Descripción General

Este documento describe el sistema centralizado de anchos de contenedor implementado para garantizar consistencia visual en todo el sitio web.

## Problema Resuelto

**Antes**: Cada página y componente definía sus propios anchos de manera individual:
- `max-w-3xl` en algunas secciones
- `max-w-4xl` en otras
- `max-w-6xl` en casos especiales
- Inconsistencia visual entre páginas

**Después**: Sistema centralizado con clases semánticas reutilizables.

## Clases CSS Centralizadas

### Ubicación
Las clases están definidas en `src/styles/theme.css` en la sección `@layer components`.

### Clases Disponibles

#### `.content-container`
```css
.content-container {
  @apply container mx-auto px-6 sm:px-4;
}
```
- **Uso**: Contenedor principal para todas las secciones
- **Reemplaza**: `container mx-auto px-6 sm:px-4`

#### `.content-width`
```css
.content-width {
  @apply max-w-4xl mx-auto;
}
```
- **Uso**: Ancho estándar para contenido principal
- **Reemplaza**: `max-w-4xl mx-auto`
- **Ancho**: 896px en desktop

#### `.content-width-wide`
```css
.content-width-wide {
  @apply max-w-6xl mx-auto;
}
```
- **Uso**: Contenido que necesita más espacio (galerías, tablas)
- **Ancho**: 1152px en desktop

#### `.content-width-narrow`
```css
.content-width-narrow {
  @apply max-w-2xl mx-auto;
}
```
- **Uso**: Formularios, contenido que se lee mejor en columnas estrechas
- **Ancho**: 672px en desktop

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
<section class="content-container py-10">
    <h2 class="content-width">Título</h2>
    <div class="content-width">
        <!-- Contenido -->
    </div>
</section>
```

### Casos de Uso

#### Contenido Principal (Estándar)
```astro
<section class="content-container py-10">
    <div class="content-width">
        <!-- Artículos, secciones principales -->
    </div>
</section>
```

#### Formularios y Contenido Estrecho
```astro
<section class="content-container py-10">
    <div class="content-width-narrow">
        <!-- Formularios de contacto, login -->
    </div>
</section>
```

#### Galerías y Contenido Amplio
```astro
<section class="content-container py-10">
    <div class="content-width-wide">
        <!-- Galerías de imágenes, tablas grandes -->
    </div>
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

1. Reemplazar `container mx-auto px-6 sm:px-4` con `content-container`
2. Reemplazar `max-w-4xl mx-auto` con `content-width`
3. Evaluar si necesita `content-width-narrow` o `content-width-wide`
4. Probar en diferentes tamaños de pantalla
