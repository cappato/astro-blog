#!/bin/bash

# Script to fix H1 headings in blog posts
# Blog posts should not have H1 headings in content since title is in frontmatter

echo "🔧 Fixing H1 headings in blog posts..."

# List of files with H1 headings
files=(
    "src/content/blog/migracion-sistemas-preservando-vision.md"
    "src/content/blog/debugging-auto-merge-github-actions-troubleshooting.md"
    "src/content/blog/protocolos-automaticos-ia-arquitectura.md"
    "src/content/blog/github-actions-deploy-automatico-wrangler.md"
    "src/content/blog/reglas-esenciales-proyectos-profesionales-estandares.md"
    "src/content/blog/auto-merge-inteligente-ux-control.md"
    "src/content/blog/arquitectura-modular-astro.md"
    "src/content/blog/testing-automatizado-sitios-estaticos.md"
    "src/content/blog/configurar-wrangler-cloudflare-pages-2024.md"
    "src/content/blog/deploy-automatico-wrangler-github-actions.md"
    "src/content/blog/troubleshooting-wrangler-wsl-deploy.md"
    "src/content/blog/anatomia-sistema-protocolos-automaticos.md"
    "src/content/blog/test-post-draft-sistema.md"
    "src/content/blog/sistema-triggers-automaticos-desarrollo-context-loading.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Processing: $file"
        
        # Remove the first H1 heading that duplicates the title
        # This removes lines that start with "# " followed by the title
        sed -i '/^# /d' "$file"
        
        echo "✅ Fixed: $file"
    else
        echo "❌ File not found: $file"
    fi
done

echo "🎉 All blog posts processed!"
echo "📊 Running validation to check results..."

# Run validation to see if we fixed the issues
npm run validate:blog
