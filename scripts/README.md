# Scripts de Utilidad para el Blog

Este directorio contiene scripts de utilidad para el mantenimiento y optimización del blog.

## Optimización de Imágenes (`optimize-images.js`)

Script para optimizar automáticamente las imágenes del blog, generando versiones WebP y diferentes variantes para redes sociales.

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run optimize-images` | Optimiza todas las imágenes de todos los posts |
| `npm run optimize-images -- --postId=bienvenida` | Optimiza solo las imágenes del post especificado |
| `npm run optimize-images -- --force` | Fuerza la regeneración de todas las imágenes, incluso si no han cambiado |
| `npm run optimize-images -- --file=images/raw/seccion/imagen.jpg` | Optimiza una imagen específica (genera: public/images/seccion/imagen.webp) |

### Estructura de Directorios

```
/images
  ├─ /raw/           ← Solo local, no comiteada (en .gitignore)
  │    └─ /postId/     ← ID corto único del post
  │         ├─ portada.jpg  ← OBLIGATORIO: Imagen principal del post
  │         └─ extra1.jpg, extra2.jpg...  ← Imágenes adicionales (opcionales)
  └─ /public/images/
       └─ /postId/     ← Archivos optimizados exportados
            ├─ portada.webp
            ├─ portada-og.webp
            ├─ portada-thumb.webp
            ├─ portada-wsp.webp
            └─ extra1.webp...
```

### Presets de Optimización

| Preset | Dimensiones | Formato | Calidad | Uso |
|--------|-------------|---------|---------|-----|
| default | 1200px ancho | WebP | 80% | Imagen estándar para el blog |
| og | 1200x630px | WebP | 80% | Open Graph (redes sociales) |
| og-jpg | 1200x630px | JPEG | 80% | Open Graph (mayor compatibilidad) |
| thumb | 600x315px | WebP | 80% | Miniaturas |
| wsp | 1080x1080px | WebP | 80% | WhatsApp |
| avif | 1200px ancho | AVIF | 65% | Formato moderno (menor tamaño) |
| og-avif | 1200x630px | AVIF | 65% | Open Graph en formato AVIF |
| lqip | 20px ancho | WebP | 20% | Placeholder de baja calidad |

### Ejemplos de Uso

#### Optimizar una imagen específica

```bash
npm run optimize-images -- --file=images/raw/ui/logo.png
```

Esto generará `public/images/ui/logo.webp` optimizado.

#### Optimizar todas las imágenes de un post

```bash
npm run optimize-images -- --postId=mi-articulo
```

Esto procesará todas las imágenes en `images/raw/mi-articulo/` y generará las versiones optimizadas en `public/images/mi-articulo/`.