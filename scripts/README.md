# Scripts Directory

This directory contains general utility scripts for the project.

## Available Scripts

### PageSpeed Analyzer
Performance analysis tool for the website.

- **`pagespeed-analyzer.js`** - Comprehensive performance testing

## Migrated Features

### Image Optimization
**⚠️ MIGRATED**: The image optimization system has been moved to a modular feature.

**New Location**: `src/features/image-optimization/`

**CLI Usage** (unchanged):
```bash
npm run optimize-images
npm run optimize-images -- --postId=my-post
npm run optimize-images -- --help
```

**Documentation**:
- [📖 Feature Documentation](../src/features/image-optimization/README.md)
- [📖 System Documentation](../docs/image-optimization.md)

---

**Note**: This directory now only contains general utility scripts. Feature-specific scripts are located within their respective feature directories in `src/features/`.

