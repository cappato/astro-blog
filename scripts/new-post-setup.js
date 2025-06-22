#!/usr/bin/env node

/**
 * New Post Setup Script
 * Automatically sets up images for new blog posts
 */

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Default high-quality images for different categories
 */
const CATEGORY_IMAGES = {
  'typescript': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  'javascript': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  'react': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  'astro': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&crop=center',
  'performance': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'testing': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'github': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'deployment': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'architecture': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&crop=center',
  'security': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop&crop=center',
  'ui': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&crop=center',
  'ux': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&crop=center',
  'tutorial': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
  'guide': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
  'default': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center'
};

/**
 * Determine the best image category based on post slug and tags
 */
function determineImageCategory(slug, tags = []) {
  const allTerms = [slug, ...tags].join(' ').toLowerCase();
  
  // Check for specific technology matches
  for (const [category, url] of Object.entries(CATEGORY_IMAGES)) {
    if (category !== 'default' && allTerms.includes(category)) {
      return { category, url };
    }
  }
  
  // Check for compound terms
  if (allTerms.includes('dark') || allTerms.includes('mode')) {
    return { category: 'ui', url: CATEGORY_IMAGES.ui };
  }
  
  if (allTerms.includes('auto') || allTerms.includes('automation')) {
    return { category: 'github', url: CATEGORY_IMAGES.github };
  }
  
  if (allTerms.includes('debug') || allTerms.includes('troubleshoot')) {
    return { category: 'testing', url: CATEGORY_IMAGES.testing };
  }
  
  // Default fallback
  return { category: 'default', url: CATEGORY_IMAGES.default };
}

/**
 * Download portada image for a new post
 */
async function downloadPortadaImage(slug, category, imageUrl) {
  const imagePath = path.join(process.cwd(), 'public/images', slug, 'portada.webp');
  
  try {
    log(`⬇️ Downloading ${category} image for: ${slug}`, 'cyan');
    log(`   URL: ${imageUrl}`, 'blue');
    
    // Ensure directory exists
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Download and save
    const fileStream = createWriteStream(imagePath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Downloaded: ${slug}/portada.webp`, 'green');
    return imagePath;
  } catch (error) {
    log(`❌ Download failed: ${error.message}`, 'red');
    
    // Create SVG placeholder as fallback
    const svgContent = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle" dy=".3em">Blog Post: ${slug}</text>
    </svg>`;
    
    const svgPath = imagePath.replace('.webp', '.svg');
    fs.writeFileSync(svgPath, svgContent);
    
    log(`📝 Created placeholder: ${slug}/portada.svg`, 'yellow');
    return svgPath;
  }
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  
  const frontmatterText = frontmatterMatch[1];
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/"/g, '');
      
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        frontmatter[key.trim()] = arrayContent
          .split(',')
          .map(item => item.trim().replace(/"/g, ''))
          .filter(item => item.length > 0);
      } else {
        frontmatter[key.trim()] = value;
      }
    }
  }
  
  return frontmatter;
}

/**
 * Setup images for a specific post
 */
async function setupPostImages(slug) {
  const postPath = path.join('src/content/blog', `${slug}.md`);
  
  if (!fs.existsSync(postPath)) {
    log(`❌ Blog post not found: ${postPath}`, 'red');
    return false;
  }
  
  // Read post content and extract metadata
  const content = fs.readFileSync(postPath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  
  const title = frontmatter.title || slug;
  const tags = frontmatter.tags || [];
  
  log(`📝 Setting up images for: "${title}"`, 'blue');
  log(`   Slug: ${slug}`, 'blue');
  log(`   Tags: [${tags.join(', ')}]`, 'blue');
  
  // Check if portada image already exists
  const existingPortada = path.join('public/images', slug, 'portada.webp');
  if (fs.existsSync(existingPortada)) {
    log(`⏭️ Portada image already exists: ${slug}/portada.webp`, 'yellow');
    return true;
  }
  
  // Determine best image category
  const { category, url } = determineImageCategory(slug, tags);
  log(`🎨 Selected category: ${category}`, 'magenta');
  
  // Download the image
  const result = await downloadPortadaImage(slug, category, url);
  
  if (result) {
    log(`✅ Successfully set up images for: ${slug}`, 'green');
    return true;
  } else {
    log(`❌ Failed to set up images for: ${slug}`, 'red');
    return false;
  }
}

/**
 * Setup images for all posts missing portada images
 */
async function setupAllMissingImages() {
  const contentDir = 'src/content/blog';
  
  if (!fs.existsSync(contentDir)) {
    log(`❌ Content directory not found: ${contentDir}`, 'red');
    return;
  }
  
  const blogFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  const missingImages = [];
  
  // Check which posts are missing portada images
  for (const file of blogFiles) {
    const slug = file.replace('.md', '');
    const portadaPath = path.join('public/images', slug, 'portada.webp');
    
    if (!fs.existsSync(portadaPath)) {
      missingImages.push(slug);
    }
  }
  
  if (missingImages.length === 0) {
    log('✅ All blog posts already have portada images!', 'green');
    return;
  }
  
  log(`🔍 Found ${missingImages.length} posts missing portada images:`, 'yellow');
  missingImages.forEach(slug => log(`   - ${slug}`, 'yellow'));
  
  // Setup images for each missing post
  const results = [];
  for (let i = 0; i < missingImages.length; i++) {
    const slug = missingImages[i];
    log(`\n[${i + 1}/${missingImages.length}] Processing: ${slug}`, 'cyan');
    
    const success = await setupPostImages(slug);
    results.push({ slug, success });
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log('\n=====================================', 'cyan');
  log('📊 Setup Summary:', 'bold');
  log(`   - Posts processed: ${results.length}`, 'blue');
  log(`   - Successful: ${successful}`, successful > 0 ? 'green' : 'yellow');
  log(`   - Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (successful > 0) {
    log('\n✅ Successfully set up images for:', 'green');
    results.filter(r => r.success).forEach(r => {
      log(`   - ${r.slug}`, 'green');
    });
  }
  
  if (failed > 0) {
    log('\n❌ Failed to set up images for:', 'red');
    results.filter(r => !r.success).forEach(r => {
      log(`   - ${r.slug}`, 'red');
    });
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  log('🖼️ New Post Image Setup', 'bold');
  log('=====================================\n', 'cyan');
  
  if (args.length === 0) {
    // Setup all missing images
    await setupAllMissingImages();
  } else {
    // Setup specific post
    const slug = args[0];
    log(`🎯 Setting up images for specific post: ${slug}`, 'blue');
    await setupPostImages(slug);
  }
  
  log('\n💡 Usage examples:', 'blue');
  log('   - Setup all missing images: node scripts/new-post-setup.js', 'blue');
  log('   - Setup specific post: node scripts/new-post-setup.js my-new-post-slug', 'blue');
  
  log('\n🎉 Image setup complete!', 'green');
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { setupPostImages, setupAllMissingImages, determineImageCategory, main };
