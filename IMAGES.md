# Sistema de Imágenes Optimizadas para el Blog

Este documento explica cómo funciona el sistema de imágenes optimizadas para el blog y cómo usarlo correctamente.

## Estructura de carpetas

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

## Cómo añadir imágenes a un post

1. **Crear el directorio para el post**:
   ```
   mkdir -p images/raw/[postId]
   ```
   Donde `[postId]` es un identificador corto y único para el post.

2. **Añadir las imágenes originales**:
   - **OBLIGATORIO**: Coloca la imagen principal como `portada.jpg` (o .png/.webp)
     - Esta imagen se usará para generar todas las variantes para redes sociales
     - Sin esta imagen, no se generarán las variantes para compartir
   - Otras imágenes adicionales pueden tener cualquier nombre

3. **Ejecutar el script de optimización**:
   ```
   npm run optimize-images --postId=[postId]
   ```

4. **Actualizar el frontmatter del post**:
   ```yaml
   ---
   title: "Mi artículo"
   description: "Descripción del artículo"
   date: "2023-06-15"
   author: "Matías Cappato"
   postId: "mi-articulo"
   imageAlt: "Descripción de la imagen principal"
   tags: ["tag1", "tag2"]
   ---
   ```

## Variantes de imágenes generadas

Para la imagen `portada.jpg` se generan automáticamente:

- **portada.webp**: Versión estándar (1200px de ancho)
- **portada-og.webp**: Optimizada para Open Graph (1200x630px)
- **portada-thumb.webp**: Miniatura (600x315px)
- **portada-wsp.webp**: Optimizada para WhatsApp (1080x1080px)

Para las demás imágenes, solo se genera la versión estándar optimizada.

## Uso en los componentes

```astro
<!-- Para la portada y sus variantes -->
<ImageVariants 
  postId="mi-articulo" 
  type="og" 
  alt="Descripción de la imagen" 
/>

<!-- Para otras imágenes del post -->
<img src="/images/mi-articulo/extra1.webp" alt="Descripción de la imagen adicional" />
```

Opciones para `type` en ImageVariants:
- `default` (o no especificado): Imagen principal
- `og`: Versión para Open Graph
- `thumb`: Miniatura
- `wsp`: Versión para WhatsApp

## Comandos disponibles

```bash
# Optimizar todas las imágenes nuevas
npm run optimize-images

# Optimizar imágenes de un post específico
npm run optimize-images --postId=mi-articulo

# Forzar regeneración de todas las imágenes
npm run optimize-images --force
```

## Notas importantes

- Las imágenes originales en `/images/raw/` no se suben al repositorio
- No borres manualmente las imágenes generadas en `/public/images/`
- Usa identificadores cortos para los `postId`
- **SIEMPRE** nombra la imagen principal como `portada.jpg` (o .png/.webp)
