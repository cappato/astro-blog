# 🎨 Guía de Estilos - Sistema Híbrido Tailwind + Semántico

## 🎯 Filosofía del Sistema

**Usar Tailwind al máximo + Clases semánticas mínimas para adaptación light/dark**

### ✅ USAR TAILWIND DIRECTO PARA:
- **Espaciado**: `px-4 py-2 mb-6 gap-3 space-y-4`
- **Tipografía**: `text-xl font-bold text-sm leading-relaxed`
- **Layout**: `flex grid container mx-auto max-w-3xl`
- **Estados**: `hover: focus: transition-all duration-200`

### 🎯 USAR CLASES SEMÁNTICAS PARA:
- **Colores que cambian entre light/dark**
- **Patrones específicos del proyecto**

## 📋 Clases Semánticas Disponibles

### **Texto Principal**
```html
<!-- Reemplaza: text-gray-900 dark:text-white -->
<h1 class="text-xl font-bold text-content">Título</h1>
```

### **Texto Secundario**
```html
<!-- Reemplaza: text-gray-500 dark:text-gray-400 -->
<p class="text-sm text-muted">Fecha: 24 de mayo</p>
```

### **Enlaces**
```html
<!-- Reemplaza: hover:text-blue-500 dark:hover:text-blue-400 -->
<a href="#" class="text-link">Enlace adaptativo</a>
```

### **Tags/Etiquetas**
```html
<!-- Reemplaza: hardcoded #A2F678 y bg-gray-700 -->
<a href="/tag/react" class="text-tag text-xs px-2 py-1 rounded-md font-medium">
  #react
</a>
```

## 🏗️ Patrones de Uso por Contexto

### **🏠 HOME CARDS (Experience, Education, Skills)**
```html
<div class="card-base p-6">
  <!-- Título principal -->
  <h3 class="text-xl font-bold text-secondary mb-2">Company Name</h3>
  
  <!-- Subtítulo -->
  <h4 class="text-lg text-content mb-2">Position</h4>
  
  <!-- Metadatos -->
  <p class="text-sm text-muted mb-4">2020 - Present</p>
  
  <!-- Contenido -->
  <p class="text-content">Description...</p>
</div>
```

### **📝 BLOG CARDS (Post previews)**
```html
<article class="card-base overflow-hidden">
  <!-- Título del post -->
  <h2 class="text-xl font-bold text-primary mb-2">Post Title</h2>
  
  <!-- Metadatos -->
  <div class="text-sm text-muted mb-3">
    <span>24 de mayo de 2023</span>
    <span>5 min lectura</span>
  </div>
  
  <!-- Descripción -->
  <p class="text-content mb-4">Post excerpt...</p>
  
  <!-- Tags -->
  <div class="flex gap-2">
    <a href="/tag/react" class="text-tag text-xs px-2 py-1 rounded-md">#react</a>
  </div>
</article>
```

### **🧭 NAVBAR (Navigation)**
```html
<nav class="nav-base">
  <!-- Logo/Brand -->
  <span class="text-2xl font-bold text-primary">Matías S. Cappato</span>
  
  <!-- Enlaces de navegación -->
  <a href="#about" class="text-link px-3 py-2 rounded-md">About</a>
  
  <!-- Botón activo -->
  <span class="text-primary font-medium px-3 py-2 bg-primary/10">Blog</span>
</nav>
```

## 🚫 NO HACER

### ❌ No crear clases custom innecesarias
```html
<!-- MAL -->
<p class="custom-subtitle-muted-large">Texto</p>

<!-- BIEN -->
<p class="text-lg text-muted">Texto</p>
```

### ❌ No hardcodear colores
```html
<!-- MAL -->
<p class="text-gray-500 dark:text-gray-400">Texto</p>

<!-- BIEN -->
<p class="text-muted">Texto</p>
```

### ❌ No usar !important
```css
/* MAL */
.custom-text {
  color: #A2F678 !important;
}

/* BIEN - usar clases semánticas */
.text-tag {
  @apply text-secondary;
}
```

## 🔧 Mantenimiento

### **Agregar nueva clase semántica:**
1. ¿Se repite 3+ veces en el proyecto?
2. ¿Necesita adaptación light/dark?
3. ¿Es un patrón específico del diseño?

Si respuesta es SÍ → Agregar a `src/styles/theme.css`
Si respuesta es NO → Usar Tailwind directo

### **Eliminar código basura:**
- Buscar `text-gray-*` hardcoded
- Buscar colores hex hardcoded
- Buscar CSS con alta especificidad
- Buscar archivos duplicados
