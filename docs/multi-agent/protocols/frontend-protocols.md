# Protocolos Frontend Agent

## Responsabilidades Especificas

### Archivos Primarios
- `src/components/*` - Componentes de UI
- `src/layouts/*` - Layouts de pagina
- `src/styles/*` - Estilos globales
- `src/features/*/components/*` - Componentes de features

### Coordinacion Requerida
- `src/utils/*` - Coordinar con Backend Agent
- `src/pages/*` - Coordinar con Backend Agent para paginas con logica
- `package.json` - Coordinar con DevOps Agent para dependencias frontend

---

## Protocolos de Desarrollo Frontend

### Tailwind Expert Level
- **Enforcement**: FUNDAMENTAL
- **Regla**: Usar Tailwind como experto, evitar CSS custom innecesario
- **Sistema Hibrido**:
  - Tailwind puro para: espaciado unico, layout especifico, estados unicos
  - Clases semanticas para: patrones repetitivos (3+ veces), temas, componentes base
  - Usar `@layer components` con `@apply` para clases semanticas

### Ejemplo de Sistema Hibrido
```css
/* Para patrones repetitivos */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
  
  .card-base {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}
```

### Responsive Design Obligatorio
- **Enforcement**: OBLIGATORY
- **Regla**: Todos los componentes deben ser responsive
- **Breakpoints**: Seguir sistema de Tailwind (sm, md, lg, xl, 2xl)
- **Testing**: Verificar en mobile y desktop antes de commit

### Componentes Reutilizables
- **Enforcement**: FUNDAMENTAL
- **Regla**: Crear componentes base reutilizables antes que especificos
- **Estructura**:
  ```
  src/components/
  ├── base/           # Componentes base reutilizables
  ├── layout/         # Componentes de layout
  └── ui/             # Componentes de interfaz especificos
  ```

---

## Protocolos de Calidad Frontend

### Accesibilidad
- **Enforcement**: OBLIGATORY
- **Reglas**:
  - Usar etiquetas semanticas HTML5
  - Incluir atributos `alt` en imagenes
  - Mantener contraste adecuado (WCAG AA)
  - Navegacion por teclado funcional
  - Estados de focus visibles

### Performance Frontend
- **Enforcement**: CRITICAL
- **Reglas**:
  - Optimizar imagenes antes de usar
  - Lazy loading para imagenes below-the-fold
  - Minimizar CSS custom
  - Usar componentes Astro para SSG cuando sea posible

### Dark/Light Mode
- **Enforcement**: OBLIGATORY
- **Regla**: Todos los componentes deben soportar ambos temas
- **Implementacion**: Usar CSS variables y clases de Tailwind
- **Testing**: Verificar ambos modos antes de commit

---

## Protocolos de Testing Frontend

### Testing Visual
- **Enforcement**: OBLIGATORY
- **Checklist antes de commit**:
  - [ ] Componente se ve correcto en desktop
  - [ ] Componente se ve correcto en mobile
  - [ ] Dark mode funciona correctamente
  - [ ] Light mode funciona correctamente
  - [ ] Estados hover/focus funcionan
  - [ ] Animaciones son suaves

### Testing de Interaccion
- **Enforcement**: OBLIGATORY
- **Checklist**:
  - [ ] Todos los botones funcionan
  - [ ] Formularios validan correctamente
  - [ ] Navegacion funciona
  - [ ] Modales abren/cierran correctamente
  - [ ] Dropdowns funcionan

### Cross-browser Testing
- **Enforcement**: RECOMMENDED
- **Browsers minimos**: Chrome, Firefox, Safari
- **Funcionalidad critica**: Debe funcionar en todos
- **Funcionalidad avanzada**: Puede tener fallbacks

---

## Protocolos de Coordinacion Frontend

### Con Backend Agent
- **Cuando coordinar**:
  - Modificar `src/utils/*` que afecte logica
  - Crear nuevas paginas con logica de servidor
  - Cambiar APIs o endpoints
  - Modificar tipos TypeScript compartidos

### Con Content Agent
- **Cuando coordinar**:
  - Cambiar layouts que afecten contenido
  - Modificar componentes de blog
  - Actualizar estilos de markdown
  - Cambiar estructura de paginas de contenido

### Con Testing Agent
- **Cuando coordinar**:
  - Crear nuevos componentes (necesitan tests)
  - Cambiar comportamiento existente
  - Modificar APIs publicas de componentes
  - Actualizar snapshots de tests visuales

---

## Protocolos de Documentacion Frontend

### Documentacion de Componentes
- **Enforcement**: OBLIGATORY
- **Para cada componente nuevo**:
  ```typescript
  /**
   * Componente de boton reutilizable
   * @param variant - Estilo del boton (primary, secondary, danger)
   * @param size - Tamano del boton (sm, md, lg)
   * @param disabled - Si el boton esta deshabilitado
   */
  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }
  ```

### Storybook/Ejemplos
- **Enforcement**: RECOMMENDED
- **Para componentes base**: Crear ejemplos de uso
- **Para componentes complejos**: Documentar todos los estados
- **Para layouts**: Mostrar con contenido de ejemplo

---

## Protocolos de Mantenimiento Frontend

### Auditoria de Componentes
- **Frecuencia**: Mensual
- **Checklist**:
  - [ ] Identificar componentes duplicados
  - [ ] Consolidar patrones repetitivos
  - [ ] Actualizar componentes obsoletos
  - [ ] Optimizar bundle size

### Actualizacion de Dependencias
- **Enforcement**: CRITICAL
- **Proceso**:
  1. Coordinar con DevOps Agent
  2. Testing exhaustivo despues de updates
  3. Verificar que no se rompa funcionalidad
  4. Documentar cambios breaking

### Refactoring de Estilos
- **Enforcement**: RECOMMENDED
- **Cuando refactorizar**:
  - CSS custom > 20% del total
  - Patrones repetidos > 3 veces
  - Componentes sin sistema de temas
  - Performance issues detectados

---

## Herramientas Especificas Frontend

### Comandos de Desarrollo
```bash
# Desarrollo con hot reload
npm run dev

# Build para verificar produccion
npm run build

# Preview de build
npm run preview

# Optimizacion de imagenes
npm run optimize-images
```

### Comandos de Testing
```bash
# Tests de componentes
npm run test:unit

# Tests de integracion visual
npm run test:integration

# Performance testing
npm run pagespeed
```

### Comandos de Calidad
```bash
# Validar accesibilidad
npm run test:a11y

# Optimizar CSS
npm run optimize:css

# Analizar bundle
npm run analyze:bundle
```

---

## Escalacion Frontend

### Cuando Escalar
- **Conflictos de diseno**: Multiples enfoques visuales posibles
- **Performance critica**: Optimizaciones complejas requeridas
- **Accesibilidad compleja**: Implementaciones WCAG avanzadas
- **Arquitectura de componentes**: Decisiones de estructura global

### Proceso de Escalacion
1. Documentar opciones de diseno/implementacion
2. Incluir mockups o ejemplos visuales
3. Especificar impacto en performance/accesibilidad
4. Proporcionar recomendacion preliminar
5. Esperar decision antes de proceder

---

**Frontend Protocol Version**: 1.0
**Integracion**: Cargado automaticamente por Frontend Agents
**Especializacion**: Basado en protocolos compartidos + especificos frontend
