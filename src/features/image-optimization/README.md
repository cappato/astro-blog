# Image Optimization

## Purpose
Framework-agnostic image optimization engine that generates multiple formats (WebP, AVIF, JPEG), social media variants, thumbnails, and LQIP placeholders. Achieves 89.4% average file size reduction while maintaining visual quality. Pure TypeScript engine with CLI interface.

## Architecture
Modular TypeScript feature with plug & play portability. Completely framework-agnostic - works with any JavaScript project. Self-contained with comprehensive testing and CLI interface.

## Files
- `src/features/image-optimization/` - Complete modular feature
  - `index.ts` - Public API exports and feature metadata
  - `engine/` - Core TypeScript processing engine
    - `types.ts` - Complete TypeScript type definitions
    - `constants.ts` - Configuration constants and error codes
    - `presets.ts` - Image optimization presets and validation
    - `image-processor.ts` - Sharp-based image processing engine
    - `file-utils.ts` - File system operations and utilities
    - `logger.ts` - Comprehensive logging system with levels
  - `cli/optimize-images.ts` - Modular CLI interface
  - `__tests__/image-optimization.test.ts` - Unified test suite (27 tests)
  - `README.md` - Feature documentation
- `scripts/optimize-images.js` - CLI wrapper for backward compatibility

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

### Real Performance Results
**Test case**: 6 images (6.2MB) → 14 optimized files (676KB)
**Total reduction**: 89.4% (5.5MB saved)

### File Structure with Real Sizes
```
public/images/test/
├── portada.webp              # 44KB  (from 2MB JPEG - 97.9% reduction)
├── portada-og.webp           # 37KB  (1200x630 social media)
├── portada-og-jpg.jpeg       # 73KB  (JPEG fallback)
├── portada-thumb.webp        # 15KB  (600x315 thumbnail)
├── portada-wsp.webp          # 58KB  (1080x1080 WhatsApp Stories)
├── portada-avif.avif         # 34KB  (modern AVIF format)
├── portada-og-avif.avif      # 30KB  (AVIF social media)
├── portada-lqip.webp         # 90B   (ultra-small placeholder)
├── portada-lqip.txt          # 143B  (base64 data URI)
├── logo-modern-ligth.webp    # 121KB (from 1.5MB PNG - 92.1% reduction)
├── logo-modern.webp          # 38KB  (from 63KB PNG - 39.7% reduction)
├── logo-transparent.webp     # 78KB  (from 1.4MB PNG - 94.6% reduction)
├── logo.webp                 # 28KB  (from 1.1MB PNG - 97.5% reduction)
└── profile.webp              # 92KB  (from 138KB JPEG - 33.3% reduction)
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
1. Add preset configuration to `IMAGE_PRESETS` in `src/features/image-optimization/engine/presets.ts`
2. Define width, height, format, quality, and fit parameters
3. Update tests in `src/features/image-optimization/__tests__/image-optimization.test.ts`

### Custom Format Support
1. Extend `applyFormat()` function in `src/features/image-optimization/engine/image-processor.ts`
2. Add format validation in `validatePreset()` function
3. Update supported extensions in `SUPPORTED_EXTENSIONS` constant

## AI Context
```yaml
feature_type: "image_optimization_engine"
purpose: "framework_agnostic_image_processing_automation"
input_sources: ["raw_images", "cli_commands", "preset_configuration"]
output_formats: ["webp", "avif", "jpeg", "png", "lqip"]
processing_engine: "sharp_with_typescript"
architecture: "modular_typescript_feature_plug_and_play"
framework_compatibility: "agnostic_works_with_any_javascript_project"
validation: ["comprehensive_image_and_preset_validation", "typescript_type_safety"]
performance_impact: "build_time_only"
cli_interface: "yargs_based_with_backward_compatibility"
test_coverage: "27_comprehensive_tests_framework_agnostic"
real_world_performance: "89_4_percent_average_file_size_reduction"
test_case_results: "6_2mb_to_676kb_with_14_optimized_variants"
dependencies: ["sharp", "fs-extra", "yargs"]
key_files: ["src/features/image-optimization/index.ts", "engine_directory", "cli_directory", "tests_directory"]
migration_status: "legacy_cli_maintained_for_backward_compatibility"
```
