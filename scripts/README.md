# 🖼️ Sistema de Optimización de Imágenes

Sistema modular y mantenible para optimización automática de imágenes del blog.

## 📁 Estructura del Proyecto

```
scripts/
├── optimize-images.js          # 🎯 Script principal refactorizado
├── optimize-images-old.js      # 📦 Versión original (backup)
├── lib/                        # 📚 Módulos especializados
│   ├── presets.js             # ⚙️ Configuración de presets
│   ├── file-utils.js          # 📂 Utilidades de archivos
│   ├── image-processor.js     # 🔧 Procesamiento de imágenes
│   └── logger.js              # 📝 Sistema de logging
└── README.md                   # 📖 Esta documentación
```

## 🚀 Uso del Script

### **Comandos básicos:**

```bash
# Optimizar todas las imágenes
npm run optimize-images

# Optimizar un post específico
npm run optimize-images -- --postId=mi-post

# Forzar regeneración de todas las imágenes
npm run optimize-images -- --force

# Optimizar una imagen específica
npm run optimize-images -- --file=images/raw/post/imagen.jpg

# Modo debug con información detallada
npm run optimize-images -- --debug
```

### **Opciones avanzadas:**

```bash
# Aplicar preset específico a una imagen
npm run optimize-images -- --file=imagen.jpg --preset=og

# Ver ayuda completa
npm run optimize-images -- --help
```

## ⚙️ Presets Disponibles

| Preset | Dimensiones | Formato | Calidad | Uso |
|--------|-------------|---------|---------|-----|
| `default` | 1200px ancho | WebP | 80% | Imágenes generales |
| `og` | 1200x630px | WebP | 80% | Open Graph (redes sociales) |
| `og-jpg` | 1200x630px | JPEG | 80% | Open Graph (compatibilidad) |
| `thumb` | 600x315px | WebP | 80% | Thumbnails |
| `wsp` | 1080x1080px | WebP | 80% | WhatsApp Stories |
| `avif` | 1200px ancho | AVIF | 65% | Formato moderno |
| `og-avif` | 1200x630px | AVIF | 65% | Open Graph moderno |
| `lqip` | 20px ancho | WebP | 20% | Placeholder baja calidad |

## 📂 Estructura de Archivos

### **Entrada (Raw):**
```
images/raw/
├── mi-post/
│   ├── portada.jpg        # ← Imagen principal (todos los presets)
│   ├── imagen-1.png       # ← Otras imágenes (solo default)
│   └── imagen-2.jpg
└── otro-post/
    └── portada.webp
```

### **Salida (Public):**
```
public/images/
├── mi-post/
│   ├── portada.webp           # Default
│   ├── portada-og.webp        # Open Graph
│   ├── portada-og-jpg.jpeg    # Open Graph JPEG
│   ├── portada-thumb.webp     # Thumbnail
│   ├── portada-wsp.webp       # WhatsApp
│   ├── portada-avif.avif      # AVIF moderno
│   ├── portada-og-avif.avif   # Open Graph AVIF
│   ├── portada-lqip.webp      # Placeholder
│   ├── portada-lqip.txt       # Base64 para inline
│   ├── imagen-1.webp          # Solo default
│   └── imagen-2.webp          # Solo default
└── otro-post/
    └── portada.webp
```

## 🔧 Arquitectura Modular

### **presets.js**
- ✅ Configuración centralizada de todos los presets
- ✅ Utilidades para validación de archivos
- ✅ Generación de nombres de archivo

### **file-utils.js**
- ✅ Operaciones del sistema de archivos
- ✅ Detección de cambios (timestamps)
- ✅ Gestión de directorios de entrada y salida

### **image-processor.js**
- ✅ Procesamiento con Sharp
- ✅ Validación de imágenes
- ✅ Generación de LQIP (placeholders)
- ✅ Cálculo de dimensiones optimizadas

### **logger.js**
- ✅ Logging estructurado con colores
- ✅ Barras de progreso
- ✅ Estadísticas de procesamiento
- ✅ Diferentes niveles (error, warn, info, debug)

## 📊 Características

### **✅ Mejoras del refactoring:**

- **🏗️ Modular**: Código separado por responsabilidades
- **🔧 Mantenible**: Fácil de modificar y extender
- **📝 Documentado**: Funciones con documentación clara
- **🚀 Performante**: Procesamiento optimizado
- **📊 Informativo**: Logging detallado con estadísticas
- **🛡️ Robusto**: Validación y manejo de errores
- **⚡ Inteligente**: Solo procesa archivos modificados

### **🎯 Funcionalidades:**

- **Detección automática** de imágenes de portada
- **Múltiples formatos** (WebP, JPEG, PNG, AVIF)
- **Presets personalizables** para diferentes usos
- **Generación de LQIP** para lazy loading
- **Validación de imágenes** antes del procesamiento
- **Barras de progreso** en tiempo real
- **Estadísticas detalladas** del procesamiento

## 🔄 Migración desde la versión anterior

El script refactorizado es **100% compatible** con la versión anterior:

- ✅ **Mismos comandos** funcionan igual
- ✅ **Misma estructura** de archivos
- ✅ **Mismos presets** disponibles
- ✅ **Mejor logging** y información
- ✅ **Más opciones** de debug

## 🐛 Debugging

Para obtener información detallada del procesamiento:

```bash
npm run optimize-images -- --debug
```

Esto mostrará:
- 🔍 Información detallada de cada paso
- 📊 Metadatos de las imágenes
- ⏱️ Tiempos de procesamiento
- 🗂️ Rutas de archivos procesados

## 📈 Estadísticas de Refactoring

| Métrica | Antes | Después |
|---------|-------|---------|
| **Líneas de código** | 304 líneas | 4 módulos especializados |
| **Funciones** | Mezcladas | Separadas por responsabilidad |
| **Mantenibilidad** | Difícil | Fácil |
| **Testabilidad** | Baja | Alta |
| **Reutilización** | Limitada | Modular |
| **Logging** | Básico | Profesional |