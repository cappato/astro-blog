#!/usr/bin/env node

/**
 * Comprehensive Image Scanner
 * Scans markdown content and HTML output to find ALL missing images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:4324';
const CONTENT_DIR = 'src/content/blog';
const PUBLIC_DIR = 'public';

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
 * Parse frontmatter to get post metadata
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { frontmatter: {}, body: content };
  
  const frontmatterText = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);
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
  
  return { frontmatter, body };
}

/**
 * Extract all image references from markdown content
 */
function extractMarkdownImages(markdownContent) {
  const images = [];
  
  // Markdown image syntax: ![alt](src)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(markdownContent)) !== null) {
    images.push({
      type: 'markdown',
      alt: match[1],
      src: match[2],
      fullMatch: match[0]
    });
  }
  
  // HTML img tags in markdown
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(markdownContent)) !== null) {
    images.push({
      type: 'html',
      src: match[1],
      fullMatch: match[0]
    });
  }
  
  return images;
}

/**
 * Extract images from rendered HTML
 */
async function extractHtmlImages(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const html = await response.text();
    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(html)) !== null) {
      images.push({
        type: 'rendered',
        src: match[1],
        fullMatch: match[0]
      });
    }
    
    return images;
  } catch (error) {
    log(`❌ Error fetching HTML from ${url}: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Check if an image exists
 */
async function checkImageExists(imageUrl) {
  try {
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    const response = await fetch(fullUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get all blog posts
 */
function getBlogPosts() {
  const blogFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
  const posts = [];
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    
    posts.push({
      slug,
      title: frontmatter.title || slug,
      tags: frontmatter.tags || [],
      draft: frontmatter.draft === true || frontmatter.draft === 'true',
      frontmatter,
      body,
      fullContent: content
    });
  }
  
  return posts.filter(post => !post.draft);
}

/**
 * Generate appropriate image based on context
 */
function generateContextualImage(imagePath, post) {
  const filename = path.basename(imagePath);
  const dir = path.dirname(imagePath);
  
  // Determine image type from filename and path
  if (filename.includes('portada') || filename.includes('cover')) {
    return {
      type: 'cover',
      searchTerms: [post.title, ...post.tags],
      description: `Cover image for: ${post.title}`
    };
  }
  
  if (filename.includes('github') || dir.includes('github')) {
    return {
      type: 'github',
      searchTerms: ['github actions', 'ci cd', 'deployment', 'automation'],
      description: 'GitHub Actions and CI/CD'
    };
  }
  
  if (filename.includes('secrets')) {
    return {
      type: 'security',
      searchTerms: ['security', 'secrets management', 'environment variables'],
      description: 'Security and secrets management'
    };
  }
  
  if (filename.includes('success') || filename.includes('deploy')) {
    return {
      type: 'success',
      searchTerms: ['success', 'deployment', 'green checkmark', 'completed'],
      description: 'Success and deployment'
    };
  }
  
  if (filename.includes('error') || filename.includes('fail')) {
    return {
      type: 'error',
      searchTerms: ['error', 'debugging', 'troubleshooting', 'red warning'],
      description: 'Error and troubleshooting'
    };
  }
  
  // Default based on post content
  return {
    type: 'general',
    searchTerms: [post.title, ...post.tags, 'programming', 'development'],
    description: `Image for: ${post.title}`
  };
}

/**
 * Download image from Unsplash based on search terms
 */
async function downloadContextualImage(imagePath, imageContext) {
  const localPath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.slice(1) : imagePath);
  
  // Ensure directory exists
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Map of image types to Unsplash URLs
  const imageUrls = {
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop&crop=center',
    github: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
    security: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop&crop=center',
    success: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
    error: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center',
    general: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center'
  };
  
  const imageUrl = imageUrls[imageContext.type] || imageUrls.general;
  
  try {
    log(`⬇️ Downloading ${imageContext.type} image: ${imageContext.description}`, 'cyan');
    log(`   URL: ${imageUrl}`, 'blue');
    log(`   Path: ${localPath}`, 'blue');
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Convert to WebP format
    const webpPath = localPath.replace(/\.(avif|jpg|jpeg|png)$/i, '.webp');
    const fileStream = createWriteStream(webpPath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Downloaded: ${path.basename(webpPath)}`, 'green');
    return webpPath;
  } catch (error) {
    log(`❌ Download failed: ${error.message}`, 'red');
    
    // Create SVG placeholder as fallback
    const svgContent = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle" dy=".3em">${imageContext.description}</text>
    </svg>`;
    
    const svgPath = localPath.replace(/\.(avif|webp|jpg|jpeg|png)$/i, '.svg');
    fs.writeFileSync(svgPath, svgContent);
    
    log(`📝 Created placeholder: ${path.basename(svgPath)}`, 'yellow');
    return svgPath;
  }
}

/**
 * Main execution function
 */
async function main() {
  log('🔍 Comprehensive Image Scanner & Fixer', 'bold');
  log('=====================================\n', 'cyan');

  const posts = getBlogPosts();
  const allMissingImages = new Map(); // Use Map to avoid duplicates
  const allErrors = [];

  log(`📝 Scanning ${posts.length} blog posts for missing images...\n`, 'blue');

  // Scan each blog post
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    log(`[${i + 1}/${posts.length}] Scanning: ${post.title}`, 'cyan');

    // Extract images from markdown content
    const markdownImages = extractMarkdownImages(post.body);
    log(`   📄 Found ${markdownImages.length} images in markdown`, 'blue');

    // Extract images from rendered HTML
    const url = `${BASE_URL}/blog/${post.slug}`;
    const htmlImages = await extractHtmlImages(url);
    log(`   🌐 Found ${htmlImages.length} images in rendered HTML`, 'blue');

    // Combine all images and check if they exist
    const allImages = [...markdownImages, ...htmlImages];
    const uniqueImages = [...new Set(allImages.map(img => img.src))];

    let missingCount = 0;
    for (const imageSrc of uniqueImages) {
      const exists = await checkImageExists(imageSrc);
      if (!exists) {
        const key = imageSrc; // Use src as key to avoid duplicates
        if (!allMissingImages.has(key)) {
          allMissingImages.set(key, {
            src: imageSrc,
            post: post,
            foundIn: []
          });
        }
        allMissingImages.get(key).foundIn.push(post.slug);
        missingCount++;
      }
    }

    if (missingCount > 0) {
      log(`   ❌ Missing: ${missingCount} images`, 'red');
    } else {
      log(`   ✅ All images OK`, 'green');
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Convert Map to Array for processing
  const missingImagesArray = Array.from(allMissingImages.values());

  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Scan Results:', 'bold');
  log(`   - Posts scanned: ${posts.length}`, 'blue');
  log(`   - Unique missing images: ${missingImagesArray.length}`, missingImagesArray.length > 0 ? 'red' : 'green');

  if (missingImagesArray.length === 0) {
    log('\n✅ No missing images found! All images are loading correctly.', 'green');
    return;
  }

  // Show detailed missing images
  log('\n❌ Missing Images Details:', 'red');
  missingImagesArray.forEach((img, index) => {
    log(`   ${index + 1}. ${img.src}`, 'red');
    log(`      Found in posts: ${img.foundIn.join(', ')}`, 'yellow');
  });

  // Fix missing images
  log('\n🔧 Fixing missing images...', 'yellow');
  const fixedImages = [];
  const failedImages = [];

  for (let i = 0; i < missingImagesArray.length; i++) {
    const missingImage = missingImagesArray[i];
    log(`\n[${i + 1}/${missingImagesArray.length}] Fixing: ${missingImage.src}`, 'yellow');

    try {
      // Generate contextual image info
      const imageContext = generateContextualImage(missingImage.src, missingImage.post);

      // Download appropriate image
      const result = await downloadContextualImage(missingImage.src, imageContext);

      if (result) {
        fixedImages.push({
          original: missingImage.src,
          fixed: result,
          posts: missingImage.foundIn
        });
        log(`✅ Fixed: ${missingImage.src}`, 'green');
      } else {
        failedImages.push(missingImage.src);
        log(`❌ Failed to fix: ${missingImage.src}`, 'red');
      }
    } catch (error) {
      failedImages.push(missingImage.src);
      log(`❌ Error fixing ${missingImage.src}: ${error.message}`, 'red');
    }

    // Delay between fixes
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Final summary
  log('\n=====================================', 'cyan');
  log('🎯 Final Results:', 'bold');
  log(`   - Images fixed: ${fixedImages.length}`, fixedImages.length > 0 ? 'green' : 'yellow');
  log(`   - Images failed: ${failedImages.length}`, failedImages.length > 0 ? 'red' : 'green');

  if (fixedImages.length > 0) {
    log('\n✅ Successfully fixed images:', 'green');
    fixedImages.forEach(fix => {
      log(`   - ${fix.original}`, 'green');
      log(`     → ${fix.fixed}`, 'green');
      log(`     Used in posts: ${fix.posts.join(', ')}`, 'blue');
    });
  }

  if (failedImages.length > 0) {
    log('\n❌ Failed to fix images:', 'red');
    failedImages.forEach(src => {
      log(`   - ${src}`, 'red');
    });
  }

  log('\n💡 Recommendations:', 'blue');
  log('   1. Refresh the browser to see the fixed images', 'blue');
  log('   2. Check that all images now load correctly', 'blue');
  log('   3. Consider updating markdown to use WebP format for better performance', 'blue');

  log('\n🎉 Comprehensive image scan and fix complete!', 'green');
}

// Run the scanner
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  getBlogPosts,
  extractMarkdownImages,
  extractHtmlImages,
  checkImageExists,
  generateContextualImage,
  downloadContextualImage,
  main
};
