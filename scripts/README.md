# Scripts Directory

This directory contains utility scripts for the project.

## Available Scripts

### ⚠️ Git Workflow Automation - MIGRATED TO GITHUB ACTIONS
**All git workflow automation has been moved to GitHub Actions for better reliability:**
- **Location**: `.github/workflows/agent-automation.yml`
- **Trigger**: Manual via GitHub Actions UI
- **Features**: Complete automated workflow from commit to merge
- **Benefits**: Professional CI/CD integration, no console operations needed

**To use automation**: Go to Actions tab → Agent Automation Workflow → Run workflow

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

