# Image Optimization

## Purpose
Complete image optimization system for blog posts that generates multiple formats (WebP, AVIF, JPEG), social media variants, thumbnails, and LQIP placeholders. Modular architecture with robust CLI, comprehensive validation, and centralized configuration.

## Architecture
CLI script with modular libraries for Sharp processing, file management, preset configuration, and comprehensive validation.

## Files
- `scripts/optimize-images.js` - Main CLI script with argument parsing
- `scripts/lib/presets.js` - Preset configuration and validation
- `scripts/lib/image-processor.js` - Sharp processing and LQIP generation
- `scripts/lib/file-utils.js` - File system operations and directory management
- `scripts/lib/logger.js` - Comprehensive logging system
- `scripts/lib/__tests__/` - Complete test suite (75 tests)
- `scripts/README.md` - Quick-start guide and CLI documentation
- `src/components/media/OptimizedImage.astro` - Astro component integration

## Usage

### CLI Commands (NPM Scripts)
```bash
# Optimize all images from all posts
npm run optimize-images

# Optimize images from a specific post
npm run optimize-images -- --postId=bienvenida

# Force regeneration of all images
npm run optimize-images -- --force

# Optimize a specific image with preset
npm run optimize-images -- --file=images/raw/section/image.jpg --preset=og

# Debug mode with detailed information
npm run optimize-images -- --debug

# Combine options
npm run optimize-images -- --postId=test --force --debug
```

### Available Options
| Option | Type | Description |
|--------|------|-------------|
| `--postId` | string | Process specific post directory |
| `--force` | boolean | Force regeneration of existing images |
| `--file` | string | Process single image file |
| `--preset` | string | Preset to use with --file |
| `--debug` | boolean | Enable detailed logging |

### Processing Behavior
- **Cover images** (`portada.jpg/png/webp`): Generate ALL presets (8 variants)
- **Other images**: Generate only DEFAULT preset (1 variant)
- **LQIP generation**: Automatic for cover images (base64 + file)
- **Smart detection**: Skip processing if output is newer than source

## Configuration

### Available Presets
| Preset | Dimensions | Format | Quality | Use Case |
|--------|------------|--------|---------|----------|
| `default` | 1200px width | WebP | 80% | General images |
| `og` | 1200x630px | WebP | 80% | Open Graph (social media) |
| `og-jpg` | 1200x630px | JPEG | 80% | Open Graph (compatibility) |
| `thumb` | 600x315px | WebP | 80% | Thumbnails |
| `wsp` | 1080x1080px | WebP | 80% | WhatsApp Stories |
| `avif` | 1200px width | AVIF | 65% | Modern format |
| `og-avif` | 1200x630px | AVIF | 65% | Modern Open Graph |
| `lqip` | 20px width | WebP | 20% | Low Quality Placeholder |

### Preset Configuration
```typescript
export const PRESETS = {
  default: {
    width: 1200,
    height: null,
    format: 'webp',
    quality: 80
  },
  og: {
    width: 1200,
    height: 630,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },
  // ... more presets
};
```

### Image Configuration
```typescript
export const IMAGE_CONFIG = {
  DEFAULT_PRESET: 'default',
  MIN_DIMENSIONS: { width: 100, height: 100 },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  LQIP: { width: 20, blur: 5, quality: 20 }
};
```

### Path Configuration
```typescript
export const PATHS = {
  RAW_DIR: 'images/raw',
  PUBLIC_DIR: 'public/images'
};
```

## Generated Output

### File Structure
```
public/images/test/
├── portada.webp              # Default preset (1200px wide)
├── portada-og.webp           # Open Graph (1200x630)
├── portada-og-jpg.jpeg       # Open Graph JPEG (1200x630)
├── portada-thumb.webp        # Thumbnail (600x315)
├── portada-wsp.webp          # WhatsApp Stories (1080x1080)
├── portada-avif.avif         # AVIF format (1200px wide)
├── portada-og-avif.avif      # Open Graph AVIF (1200x630)
├── portada-lqip.webp         # Low Quality Placeholder (20px)
├── portada-lqip.txt          # Base64 data URI for inline use
├── logo-modern.webp          # Other images (default preset only)
└── profile.webp              # Other images (default preset only)
```

### Integration with Astro
```astro
---
// src/components/media/OptimizedImage.astro
const isPostImage = src.includes('/images/') && src.includes('/portada');
const basePath = `/images/${postId}/portada`;

const avifSrc = `${basePath}${suffix}.avif`;
const webpSrc = `${basePath}${suffix}.webp`;
const lqipSrc = `${basePath}-lqip.webp`;
---

<picture>
  <source srcset={avifSrc} type="image/avif" />
  <source srcset={webpSrc} type="image/webp" />
  <img src={fallbackSrc} alt={alt} loading={loading} />
</picture>
```

## Processing Pipeline

### Image Processing Flow
```typescript
async function processImage(sourcePath, outputDir, fileName, presetName, force = false) {
  // Validate preset exists and is valid
  const preset = getPreset(presetName);
  if (!preset || !validatePreset(preset)) {
    return false;
  }

  // Generate output filename using centralized function
  const outputFileName = generateOutputFilename(baseName, presetName, preset.format);
  
  // Check if processing is needed
  if (!needsProcessing(sourcePath, outputPath, force)) {
    return true; // Skip if up to date
  }

  // Validate image before processing
  const validation = await validateImage(sourcePath);
  if (!validation.valid) {
    return false;
  }

  // Process with Sharp
  const result = await processImageWithPreset(sourcePath, outputDir, fileName, preset, presetName);
  return result.success;
}
```

### LQIP Generation
```typescript
export async function generateLQIP(sourcePath, outputDir, baseName) {
  await sharp(sourcePath)
    .resize(IMAGE_CONFIG.LQIP.width)
    .blur(IMAGE_CONFIG.LQIP.blur)
    .webp({ quality: IMAGE_CONFIG.LQIP.quality })
    .toFile(lqipPath);
    
  // Generate base64 version for inline use
  const base64 = lqipBuffer.toString('base64');
  const dataUri = `data:image/webp;base64,${base64}`;
}
```

## Validation System

### Preset Validation
```typescript
export function validatePreset(preset) {
  return !!(
    preset.format &&
    typeof preset.format === 'string' &&
    (preset.width || preset.height) &&
    preset.quality &&
    typeof preset.quality === 'number' &&
    preset.quality > 0 &&
    preset.quality <= 100
  );
}
```

### Image Validation
```typescript
export async function validateImage(imagePath) {
  // File existence check
  if (!fs.existsSync(imagePath)) return { valid: false, error: 'File not found' };
  
  // Metadata validation
  const metadata = await getImageMetadata(imagePath);
  if (!metadata.success) return { valid: false, error: metadata.error };
  
  // Dimension validation
  if (metadata.width < IMAGE_CONFIG.MIN_DIMENSIONS.width) {
    return { valid: false, error: 'Image too small' };
  }
  
  // Format validation
  const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];
  if (!supportedFormats.includes(metadata.format)) {
    return { valid: false, error: `Unsupported format: ${metadata.format}` };
  }
  
  return { valid: true, metadata };
}
```

## Extension

### Adding New Presets
1. Add preset configuration to `PRESETS` in `scripts/lib/presets.js`
2. Define width, height, format, quality, and fit parameters
3. Update tests in `scripts/lib/__tests__/presets.test.js`

### Custom Format Support
1. Extend `applyFormat()` function in `scripts/lib/image-processor.js`
2. Add format validation in `validatePreset()` function
3. Update supported extensions in `SUPPORTED_EXTENSIONS`

## AI Context
```yaml
feature_type: "image_optimization"
purpose: "image_processing_automation"
input_sources: ["raw_images", "blog_posts", "preset_configuration"]
output_formats: ["webp", "avif", "jpeg", "png", "lqip"]
processing_engine: "sharp"
architecture: "modular_cli_system"
validation: ["preset_validation", "image_validation", "file_existence_checks"]
performance_impact: "build_time_only"
cli_interface: "yargs_based"
test_coverage: "75_comprehensive_tests"
dependencies: ["sharp", "fs-extra", "yargs", "path"]
key_files: ["optimize-images.js", "presets.js", "image-processor.js", "file-utils.js", "logger.js"]
```
