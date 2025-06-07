# Validation Scripts

This directory contains validation scripts for the multi-agent system refactoring.

## Scripts

- **validate-emoji-policy.js** - Validates emoji policy compliance across content
- **validate-pr-ready.js** - Validates PR readiness and size limits
- **functional-test.js** - Comprehensive functional testing for system capabilities

## Usage

These scripts are used to ensure code quality and compliance with project standards before creating pull requests.

```bash
# Validate emoji policy
node scripts/validation/validate-emoji-policy.js

# Validate PR readiness
node scripts/validation/validate-pr-ready.js

# Run functional tests
node scripts/validation/functional-test.js
```
