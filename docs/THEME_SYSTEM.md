# 🌙☀️ Sistema de Temas Dark/Light Mode

Sistema completo de temas con soporte para modo claro y oscuro, incluyendo persistencia, detección automática y transiciones suaves.

## 🎯 Características

### ✅ **Funcionalidades implementadas:**
- **Toggle button** con animación suave y iconos dinámicos
- **Persistencia** en localStorage con fallback a preferencia del sistema
- **Detección automática** de `prefers-color-scheme`
- **Transiciones suaves** entre temas (300ms)
- **Integración completa** con sistema de colores centralizado
- **Accesibilidad** completa (ARIA, keyboard navigation, focus management)
- **Prevención de flash** de tema incorrecto en carga inicial
- **Event system** para comunicación entre componentes

## 🏗️ Arquitectura

### **📁 Componentes principales:**

```
src/components/
├── ui/ThemeToggle.astro          # Botón de toggle con lógica completa
├── scripts/ThemeScript.astro     # Script de inicialización temprana
└── layout/
    ├── BaseLayout.astro          # Layout base con soporte de temas
    ├── Navbar.astro              # Navegación con toggle integrado
    └── BlogNavbar.astro          # Navegación del blog con toggle
```

### **⚙️ Configuración:**

```javascript
// tailwind.config.js
{
  darkMode: 'class', // Habilita dark mode con clase CSS
  theme: {
    extend: {
      colors: {
        // Colores optimizados para ambos temas
        background: {
          primary: '#FFFFFF',    // Claro por defecto
          secondary: '#F9FAFB',  // dark:bg-gray-900
          tertiary: '#F3F4F6'    // dark:bg-gray-800
        },
        text: {
          primary: '#111827',    // dark:text-gray-100
          secondary: '#374151',  // dark:text-gray-300
          tertiary: '#6B7280',   // dark:text-gray-400
          muted: '#9CA3AF'       // dark:text-gray-500
        }
      }
    }
  }
}
```

## 🎨 Uso del Sistema

### **1. 🔘 ThemeToggle Component**

```astro
---
import ThemeToggle from '../ui/ThemeToggle.astro';
---

<!-- Tamaños disponibles: sm, md, lg -->
<ThemeToggle size="md" className="custom-class" />
```

### **2. 🎨 Clases CSS para temas**

```astro
<!-- Fondo que cambia según el tema -->
<div class="bg-background-primary dark:bg-gray-900">

<!-- Texto que se adapta al tema -->
<p class="text-text-primary dark:text-gray-100">

<!-- Bordes responsivos al tema -->
<div class="border border-border-primary dark:border-gray-600">

<!-- Transiciones suaves -->
<div class="bg-white dark:bg-gray-800 transition-colors duration-300">
```

### **3. 📱 Detección de tema en JavaScript**

```javascript
// Escuchar cambios de tema
window.addEventListener('theme-changed', (e) => {
  console.log('Nuevo tema:', e.detail.theme);
});

// Obtener tema actual
const currentTheme = localStorage.getItem('theme-preference') || 'light';
```

## 🔧 Implementación Técnica

### **⚡ Inicialización temprana**

```javascript
// ThemeScript.astro - Se ejecuta antes del renderizado
(function() {
  const theme = getInitialTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
})();
```

### **🎯 Lógica del toggle**

```typescript
class ThemeManager {
  private currentTheme: 'light' | 'dark';
  
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.updateIcons();
    
    // Event para otros componentes
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: newTheme }
    }));
  }
}
```

### **🎨 Animaciones de iconos**

```css
#sun-icon, #moon-icon {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* Tema claro: mostrar sol */
.theme-light #sun-icon {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* Tema oscuro: mostrar luna */
.theme-dark #moon-icon {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
```

## 🎯 Patrones de Uso

### **1. 📄 Páginas con tema**

```astro
---
// Layout automáticamente incluye ThemeScript
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Mi Página">
  <div class="bg-background-primary dark:bg-gray-900 min-h-screen">
    <h1 class="text-text-primary dark:text-gray-100">Título</h1>
  </div>
</BaseLayout>
```

### **2. 🧩 Componentes con soporte de tema**

```astro
---
interface Props {
  variant?: 'light' | 'dark' | 'auto';
}

const { variant = 'auto' } = Astro.props;
---

<div class={`
  ${variant === 'auto' ? 'bg-background-secondary dark:bg-gray-800' : ''}
  ${variant === 'light' ? 'bg-white text-gray-900' : ''}
  ${variant === 'dark' ? 'bg-gray-900 text-white' : ''}
  transition-colors duration-300
`}>
  <slot />
</div>
```

### **3. 🎨 Estilos condicionales**

```astro
<style>
  .card {
    @apply bg-white dark:bg-gray-800;
    @apply border border-gray-200 dark:border-gray-700;
    @apply shadow-sm dark:shadow-gray-900/20;
    transition: all 0.3s ease-in-out;
  }
  
  .card:hover {
    @apply shadow-md dark:shadow-gray-900/40;
  }
</style>
```

## 🧪 Testing

### **🔍 Casos de prueba:**

1. **Persistencia**: Tema se mantiene al recargar página
2. **Sistema**: Detecta preferencia `prefers-color-scheme`
3. **Toggle**: Cambia tema correctamente con click/keyboard
4. **Iconos**: Animaciones suaves entre sol/luna
5. **Accesibilidad**: Focus, ARIA labels, keyboard navigation
6. **Performance**: Sin flash de tema incorrecto

### **🧪 Comandos de testing:**

```bash
# Tests unitarios
npm run test -- ThemeToggle

# Tests E2E
npm run test:e2e -- theme-toggle.spec.ts

# Tests de accesibilidad
npm run test:a11y
```

## 🚀 Beneficios

### **👤 Para usuarios:**
- ✅ **Experiencia personalizada** según preferencia
- ✅ **Mejor legibilidad** en diferentes condiciones de luz
- ✅ **Transiciones suaves** sin parpadeos
- ✅ **Persistencia** de preferencia

### **👨‍💻 Para desarrolladores:**
- ✅ **Sistema centralizado** fácil de mantener
- ✅ **Clases semánticas** con Tailwind
- ✅ **TypeScript** para type safety
- ✅ **Event system** para comunicación
- ✅ **Documentación completa**

### **🏢 Para el proyecto:**
- ✅ **Funcionalidad moderna** muy valorada
- ✅ **Accesibilidad** completa
- ✅ **Performance** optimizada
- ✅ **Mantenimiento** simplificado

## 🔮 Futuras mejoras

- **🎨 Temas personalizados** (no solo claro/oscuro)
- **🌈 Modo automático** basado en hora del día
- **🎯 Temas por página** o sección
- **📱 Gestos táctiles** para cambio de tema
- **🔄 Sincronización** entre pestañas
