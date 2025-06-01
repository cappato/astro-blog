# Image Optimization Scripts

Automated image optimization system for blog posts with multiple formats and presets.

## Quick Start

```bash
# Optimize all images
npm run optimize-images

# Optimize specific post
npm run optimize-images -- --postId=my-post

# Force regeneration
npm run optimize-images -- --force

# Debug mode
npm run optimize-images -- --debug

# Help
npm run optimize-images -- --help
```

## 📚 Complete Documentation

For detailed usage, configuration, architecture, and troubleshooting information, see:

**[📖 Image Optimization System Documentation](../docs/image-optimization-system.md)**

## Scripts Overview

- `optimize-images.js` - Main CLI script with argument parsing
- `lib/presets.js` - Preset configuration and validation
- `lib/file-utils.js` - File system operations and directory management
- `lib/image-processor.js` - Sharp processing and LQIP generation
- `lib/logger.js` - Comprehensive logging system
- `lib/__tests__/` - Complete test suite (75 tests)

## Key Features

- ✅ **Multiple formats** (WebP, AVIF, JPEG, PNG)
- ✅ **Smart processing** (skip unchanged files)
- ✅ **Cover image variants** (8 presets for social media)
- ✅ **LQIP generation** (base64 placeholders)
- ✅ **Robust error handling** (continue on failures)
- ✅ **Professional logging** (progress bars, statistics)

---

**For complete documentation with examples, configuration options, and architecture details, see the [full documentation](../docs/image-optimization-system.md).**

