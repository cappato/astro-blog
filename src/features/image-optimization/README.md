# Image Optimization Feature

## Purpose
Framework-agnostic image optimization engine with multi-format support and CLI interface. Provides automated image processing with WebP, AVIF, JPEG formats, LQIP generation, and comprehensive validation. Achieves 89.4% average file size reduction while maintaining visual quality.

## Architecture
Pure TypeScript/JavaScript engine with plug & play portability. Completely framework-agnostic - works with any JavaScript project (Node.js, React, Vue, Astro, etc.). Self-contained with CLI interface and comprehensive testing suite.

## Files
- `index.ts` - Public API exports and feature metadata
- `engine/` - Core processing engine with TypeScript classes
  - `types.ts` - Complete TypeScript type definitions
  - `constants.ts` - Configuration constants and error codes
  - `presets.ts` - Image optimization presets and validation
  - `image-processor.ts` - Sharp-based image processing engine
  - `file-utils.ts` - File system operations and utilities
  - `logger.ts` - Comprehensive logging system with levels
- `cli/optimize-images.ts` - Modular CLI interface
- `scripts/optimize-images.js` - CLI wrapper for backward compatibility
- `__tests__/image-optimization.test.ts` - Unified test suite (27 tests)
- `README.md` - Feature documentation

**Note**: This is a pure TypeScript/JavaScript engine. No framework-specific components included for maximum portability. All files are self-contained within the feature directory.

## Usage

### Framework-Agnostic Engine
This is a pure TypeScript/JavaScript image processing engine. Use it programmatically or via CLI - no framework dependencies.

### Programmatic Usage
```typescript
import { ImageProcessor, optimizeImage } from '../features/image-optimization';

// Using the convenience function
const result = await optimizeImage(
  '/source/image.jpg',
  '/output/directory',
  { preset: 'og', generateLQIP: true }
);

// Using the processor directly
const processor = new ImageProcessor();
const result = await processor.processImageWithPreset(
  '/source/image.jpg',
  '/output/directory',
  'image.jpg',
  'og'
);
```

### CLI Usage (Backward Compatible)
```bash
# Optimize all images from all posts
npm run optimize-images

# Optimize images from specific post
npm run optimize-images -- --postId=my-post

# Optimize specific file with preset
npm run optimize-images -- --file=images/raw/post/image.jpg --preset=og

# Force regeneration with debug output
npm run optimize-images -- --force --debug --stats

# Dry run to see what would be processed
npm run optimize-images -- --dry-run
```

### Setup Function
```typescript
import { setupImageOptimization } from '../features/image-optimization';

const { processor, fileUtils, logger } = await setupImageOptimization({
  logLevel: 'debug',
  customPaths: {
    rawDir: 'custom/raw',
    publicDir: 'custom/public'
  }
});
```

## Engine Classes

### Core Processing Classes
Framework-agnostic TypeScript classes for image optimization.

### ImageProcessor
Core image processing engine using Sharp.

**Methods:**
- `processImageWithPreset(sourcePath, outputDir, fileName, presetName): Promise<ProcessingResult>`
- `generateLQIP(sourcePath, outputDir, baseName): Promise<LQIPResult>`
- `validateImage(imagePath): Promise<ImageValidationResult>`
- `getImageMetadata(imagePath): Promise<ImageMetadata>`
- `calculateOptimalDimensions(originalWidth, originalHeight, targetWidth, targetHeight?): DimensionResult`

### FileUtils
File system operations and directory management.

**Methods:**
- `ensureDirectories(): void`
- `getPostDirectories(): string[]`
- `getPostImages(postId): PostImages`
- `needsProcessing(sourcePath, outputPath, force): boolean`
- `createOutputDirectory(postId): string`
- `resolveFilePath(filePath, cwd?): FileResolutionResult`

### Logger
Comprehensive logging system with levels and formatting.

**Methods:**
- `debug(message, ...args): void`
- `info(message, ...args): void`
- `warn(message, ...args): void`
- `error(message, error?): void`
- `progress(current, total, context?): void`
- `finish(message): void`
- `stats(stats): void`

## Presets

### Available Presets
```typescript
const presets = {
  default: { width: 1200, height: null, format: 'webp', quality: 80 },
  og: { width: 1200, height: 630, format: 'webp', quality: 80, fit: 'cover' },
  'og-jpg': { width: 1200, height: 630, format: 'jpeg', quality: 80, fit: 'cover' },
  thumb: { width: 600, height: 315, format: 'webp', quality: 80, fit: 'cover' },
  wsp: { width: 1080, height: 1080, format: 'webp', quality: 80, fit: 'cover' },
  avif: { width: 1200, height: null, format: 'avif', quality: 65, fit: 'inside' },
  'og-avif': { width: 1200, height: 630, format: 'avif', quality: 65, fit: 'cover' },
  lqip: { width: 20, height: null, format: 'webp', quality: 20, fit: 'inside' }
};
```

### Custom Presets
```typescript
import { createCustomPreset, validatePreset } from '../features/image-optimization';

const customPreset = createCustomPreset('my-preset', {
  width: 800,
  height: 600,
  format: 'webp',
  quality: 85,
  fit: 'cover'
});
```

## Configuration

### Default Configuration
```typescript
export const IMAGE_OPTIMIZATION_CONFIG = {
  defaultPreset: 'default',
  minDimensions: { width: 100, height: 100 },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  lqip: { width: 20, blur: 5, quality: 20 }
};
```

### Project Paths
```typescript
export const PROJECT_PATHS = {
  rawDir: 'images/raw',
  publicDir: 'public/images'
};
```

## Generated Output

### Real Performance Results
**Test case**: 6 images (6.2MB) → 14 optimized files (676KB)
**Total reduction**: 89.4% (5.5MB saved)

### File Structure
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

## Features

### Multi-format Support
- **WebP**: Modern format with excellent compression
- **AVIF**: Next-generation format for modern browsers
- **JPEG**: Fallback format for maximum compatibility
- **PNG**: Lossless format when needed

### Processing Features
- **LQIP Generation**: Low Quality Image Placeholders for smooth loading
- **Responsive Optimization**: Multiple sizes and formats
- **Validation System**: Comprehensive image and preset validation
- **Error Handling**: Graceful failure with detailed error messages
- **Performance**: Concurrent processing with memory management

### CLI Features
- **Batch Processing**: Process all posts or specific posts
- **Force Regeneration**: Override existing optimized images
- **Debug Mode**: Detailed logging and processing information
- **Dry Run**: Preview what would be processed
- **Progress Tracking**: Real-time progress updates
- **Statistics**: Detailed processing statistics

## Testing

### Test Coverage
- **27 comprehensive tests** covering all functionality
- **Engine tests**: Image processing, file utilities, logging
- **Preset tests**: Validation, generation, custom presets
- **CLI tests**: Argument parsing, processing workflows
- **Integration tests**: End-to-end processing scenarios
- **Framework-agnostic**: Pure TypeScript testing without UI dependencies

### Running Tests
```bash
npm run test:run -- image-optimization
```

### Test Results
```
✓ 27 tests passing (100% success rate)
✓ All engine classes tested
✓ All preset configurations validated
✓ File processing workflows verified
✓ Error handling scenarios covered
```

## Error Handling

### Validation Errors
```typescript
try {
  const result = await processor.processImageWithPreset(sourcePath, outputDir, fileName, preset);
  if (!result.success) {
    console.error('Processing failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

### Graceful Fallbacks
- **Invalid images**: Detailed validation error messages
- **Missing files**: File existence checks with clear errors
- **Processing failures**: Graceful degradation with error logging
- **Invalid presets**: Preset validation with helpful suggestions

## Performance

### Optimization Features
- **Concurrent processing**: Multiple images processed simultaneously
- **Memory management**: Sharp memory limits and cleanup
- **File modification checking**: Skip unchanged files
- **Progressive enhancement**: Component works without JavaScript

### Caching Strategy
- **File modification time**: Only process when source is newer
- **Force flag**: Override caching when needed
- **Incremental processing**: Process only what's needed

## Migration Guide

### From Legacy System
```diff
- import OptimizedImage from '../components/media/OptimizedImage.astro';
+ import { OptimizedImage } from '../features/image-optimization';

- import { processImageWithPreset } from '../scripts/lib/image-processor.js';
+ import { processImageWithPreset } from '../features/image-optimization';
```

### CLI Compatibility
All existing CLI commands continue to work unchanged:
```bash
npm run optimize-images              # ✅ Works
npm run optimize-images -- --postId=test  # ✅ Works
npm run optimize-images -- --force --debug  # ✅ Works
```

## AI Context
```yaml
feature_type: "image_optimization_engine"
purpose: "framework_agnostic_image_processing_and_optimization"
input_sources: ["raw_images", "cli_commands", "preset_configuration"]
output_formats: ["webp", "avif", "jpeg", "png", "lqip"]
processing_engine: "sharp_with_typescript"
architecture: "pure_typescript_engine_plug_and_play"
framework_compatibility: "agnostic_works_with_any_javascript_project"
validation: "comprehensive_image_and_preset_validation"
cli_interface: "yargs_based_with_backward_compatibility"
testing: "27_comprehensive_tests_framework_agnostic"
typescript_integration: "complete_type_safety"
dependencies: ["sharp", "fs-extra", "yargs"]
key_files: ["index.ts", "engine_directory", "cli_directory", "tests_directory"]
performance_features: ["concurrent_processing", "memory_management", "caching"]
real_world_performance: "89_4_percent_average_file_size_reduction"
test_case_results: "6_2mb_to_676kb_with_14_optimized_variants"
```
