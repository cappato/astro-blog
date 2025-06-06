# Automated Git Workflow System

## Overview

Simple automated Git workflow system for the Astro blog project. Provides automated PR creation, validation, and merging while maintaining code quality.

## System Components

### 1. GitHub Actions Workflows

#### PR Automation (`.github/workflows/pr-automation.yml`)
- **PR Validation**: Validates PR titles follow conventional commit format
- **Auto Merge**: Automatically merges PRs when all conditions are met

#### Conventional Commits (`.github/workflows/conventional-commits.yml`)
- Validates all commit messages follow conventional commit format
- Blocks PRs with non-conventional commits

#### Automated Testing (`.github/workflows/automated-testing.yml`)
- Runs comprehensive test suite on all PRs
- Required for auto-merge functionality

### 2. Scripts

#### PR Creator (`scripts/create-pr.js`)
- Automatically creates PRs from feature branches
- Applies appropriate labels and metadata

## Workflow Process

### 1. Creating a Feature Branch
```bash
git checkout -b feat/your-feature-name
# Make changes
git add .
git commit -m "feat: add new feature description"
git push origin feat/your-feature-name
```

### 2. Create PR
```bash
node scripts/create-pr.js
```

### 3. Auto-Merge
When all conditions are met:
- All tests pass ✅
- PR has `auto-merge` label ✅
- No merge conflicts ✅
- Conventional commit compliance ✅

The PR will be automatically merged and branch deleted.

## Configuration

### Labels
- `type:feature`, `type:bugfix`
- `auto-merge`

## Best Practices

### Commit Messages
```bash
# Good examples
feat: add user authentication
fix: resolve navigation bug
docs: update README

# Bad examples
added stuff
fixed bug
update
```

### Branch Naming
```bash
feat/feature-name
fix/bug-description
docs/documentation-update
```

## Troubleshooting

### PR Not Auto-Merging
1. Check if `auto-merge` label is applied
2. Verify all tests are passing
3. Ensure no merge conflicts exist
4. Check conventional commit compliance

### Commit Validation Failures
1. Review commit message format
2. Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, etc.
3. Keep first line under 50 characters
