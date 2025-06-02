# Breadcrumbs Feature

## Core Purpose
Sistema modular de navegación jerárquica que genera breadcrumbs automáticamente basado en la ruta actual. Proporciona contexto de navegación y mejora la experiencia del usuario y SEO.

## Architecture
Sistema basado en patrones de rutas configurables que permite escalabilidad sin modificar el componente principal.

### Components
- `Breadcrumbs.astro` - Componente principal que renderiza la navegación
- `utils/breadcrumbs.ts` - Lógica de generación y validación
- `config/routes.ts` - Configuración de patrones de rutas
- `tests/breadcrumbs.test.ts` - Tests exhaustivos

### Key Features
- **Generación automática** basada en URL
- **Configuración por patrones** escalable
- **SEO optimizado** con structured data
- **Accesibilidad completa** con ARIA labels
- **Responsive design** con breakpoints móviles
- **Validación robusta** de breadcrumbs generados

## Specs

### Supported Routes
- `/` → Inicio
- `/blog` → Inicio > Blog
- `/blog/post-slug` → Inicio > Blog > [Título del Post]
- `/blog/tag/tag-name` → Inicio > Blog > #tag-name
- `/blog/pillars` → Inicio > Blog > Pilares de Contenido
- `/blog/pillar/pillar-slug` → Inicio > Blog > Pilares > [Nombre del Pilar]

### Configuration
```typescript
// Agregar nuevas rutas en config/routes.ts
{
  pattern: /^\/nueva-seccion$/,
  generator: () => [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: 'Nueva Sección', current: true, icon: '📄' }
  ]
}
```

## Examples

### Basic Usage
```astro
---
import { Breadcrumbs } from '../../features/breadcrumbs';
---

<Breadcrumbs />
```

### With Custom Title
```astro
<Breadcrumbs customTitle="Mi Artículo Personalizado" />
```

### Programmatic Generation
```typescript
import { generateBreadcrumbs } from '../features/breadcrumbs';

const breadcrumbs = generateBreadcrumbs('/blog/mi-post', 'Mi Post');
// Returns: [
//   { label: 'Inicio', href: '/', icon: '🏠' },
//   { label: 'Blog', href: '/blog', icon: '📝' },
//   { label: 'Mi Post', current: true, icon: '📄' }
// ]
```

## Error Handling
- **Rutas desconocidas**: Fallback a breadcrumb de inicio
- **Validación automática**: Verifica estructura correcta
- **Graceful degradation**: Funciona sin JavaScript

## AI Context
Sistema completamente modular y autocontenido. Para agregar nuevas rutas, solo modificar `config/routes.ts`. El componente se conecta una sola vez en `BaseLayout.astro` y funciona automáticamente en toda la aplicación. Tests cubren todos los casos de uso principales.
