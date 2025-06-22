#!/usr/bin/env node

/**
 * Comprehensive Image Fixer Script
 * Visits all blog pages, detects missing images, and downloads appropriate replacements
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
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

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
 * Get all blog posts and their metadata
 */
function getBlogPosts() {
  const blogFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
  const posts = [];
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    
    posts.push({
      slug,
      title: frontmatter.title || slug,
      tags: frontmatter.tags || [],
      pillar: frontmatter.pillar,
      draft: frontmatter.draft === true || frontmatter.draft === 'true',
      description: frontmatter.description || '',
      thumbnail: frontmatter.thumbnail || '',
      content
    });
  }
  
  return posts;
}

/**
 * Extract image URLs from HTML content
 */
function extractImageUrls(html) {
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}

/**
 * Check if an image URL returns 404
 */
async function checkImageExists(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate search terms from blog post metadata
 */
function generateSearchTerms(post) {
  const terms = [];
  
  // Primary terms from title
  if (post.title) {
    terms.push(post.title);
    // Extract key technical terms
    const techTerms = post.title.match(/\b(React|TypeScript|JavaScript|Astro|Node\.js|CSS|HTML|API|GitHub|Docker|AWS|Performance|SEO|Testing|Architecture|Development|Programming|Web|Frontend|Backend|Database|Security|Deployment|CI\/CD|DevOps|Automation|Framework|Library|Tool|Guide|Tutorial)\b/gi);
    if (techTerms) {
      terms.push(...techTerms.map(term => `${term} programming development`));
    }
  }
  
  // Secondary terms from tags
  if (post.tags && post.tags.length > 0) {
    terms.push(post.tags.join(' ') + ' development programming');
  }
  
  // Fallback terms based on slug
  const slugTerms = post.slug
    .replace(/-/g, ' ')
    .replace(/\b(automatico|sistema|desarrollo|web|blog|post)\b/gi, '')
    .trim();
  if (slugTerms) {
    terms.push(slugTerms + ' programming technology');
  }
  
  // Generic fallback
  terms.push('web development programming code technology');
  
  return terms.filter(term => term.length > 3);
}

/**
 * Search for images using web search
 */
async function searchForImage(searchTerm) {
  try {
    log(`🔍 Searching for: "${searchTerm}"`, 'blue');
    
    // Use a more specific search query for better results
    const query = `${searchTerm} programming development technology -logo -icon`;
    
    const searchResponse = await fetch('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY || 'demo-key'
      }
    });
    
    if (!searchResponse.ok) {
      log(`⚠️ Search API failed, using fallback method`, 'yellow');
      return null;
    }
    
    const searchData = await searchResponse.json();
    
    // Look for image results
    if (searchData.images && searchData.images.length > 0) {
      const image = searchData.images[0];
      return {
        url: image.url,
        title: image.title || searchTerm,
        width: image.width || 800,
        height: image.height || 600
      };
    }
    
    return null;
  } catch (error) {
    log(`❌ Search failed: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl, localPath) {
  try {
    log(`⬇️ Downloading: ${imageUrl}`, 'cyan');
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Download and save
    const fileStream = createWriteStream(localPath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Saved: ${localPath}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Download failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Generate a placeholder image if download fails
 */
async function createPlaceholderImage(localPath, width = 800, height = 400, text = 'Blog Post Image') {
  try {
    // Create a simple SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
    </svg>`;
    
    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save as SVG (change extension to .svg)
    const svgPath = localPath.replace(/\.(webp|jpg|jpeg|png)$/i, '.svg');
    fs.writeFileSync(svgPath, svg);
    
    log(`📝 Created placeholder: ${svgPath}`, 'yellow');
    return svgPath;
  } catch (error) {
    log(`❌ Placeholder creation failed: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Visit a page and check for missing images
 */
async function checkPageImages(url, post = null) {
  try {
    log(`🔍 Checking: ${url}`, 'cyan');
    
    const response = await fetch(url);
    if (!response.ok) {
      log(`⚠️ Page failed to load: ${response.status}`, 'yellow');
      return { missingImages: [], errors: [`Page ${url} returned ${response.status}`] };
    }
    
    const html = await response.text();
    const imageUrls = extractImageUrls(html);
    const missingImages = [];
    const errors = [];
    
    for (const imageUrl of imageUrls) {
      // Convert relative URLs to absolute
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
      
      const exists = await checkImageExists(fullImageUrl);
      if (!exists) {
        log(`❌ Missing image: ${imageUrl}`, 'red');
        missingImages.push({
          url: imageUrl,
          fullUrl: fullImageUrl,
          post: post
        });
      }
    }
    
    return { missingImages, errors };
  } catch (error) {
    log(`❌ Error checking page: ${error.message}`, 'red');
    return { missingImages: [], errors: [error.message] };
  }
}

/**
 * Fix a missing image by downloading a replacement
 */
async function fixMissingImage(missingImage) {
  const { url, post } = missingImage;

  // Determine local path
  const localPath = path.join(process.cwd(), 'public', url.startsWith('/') ? url.slice(1) : url);

  if (!post) {
    // For non-blog images, create a generic placeholder
    log(`📝 Creating generic placeholder for: ${url}`, 'yellow');
    return await createPlaceholderImage(localPath, 800, 400, 'Image');
  }

  // Generate search terms for the blog post
  const searchTerms = generateSearchTerms(post);

  // Try to find and download an appropriate image
  for (const searchTerm of searchTerms.slice(0, 3)) { // Try first 3 search terms
    const imageResult = await searchForImage(searchTerm);

    if (imageResult) {
      const success = await downloadImage(imageResult.url, localPath);
      if (success) {
        return localPath;
      }
    }

    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // If all searches failed, create a placeholder
  log(`📝 Creating placeholder for: ${post.title}`, 'yellow');
  return await createPlaceholderImage(localPath, 800, 400, post.title.slice(0, 30));
}

/**
 * Main execution function
 */
async function main() {
  log('🖼️ Missing Images Fixer', 'bold');
  log('=====================================\n', 'cyan');

  const posts = getBlogPosts();
  const allMissingImages = [];
  const allErrors = [];

  // Test routes to check
  const routes = [
    { url: `${BASE_URL}/`, description: 'Homepage' },
    { url: `${BASE_URL}/blog`, description: 'Blog listing' },
    { url: `${BASE_URL}/blog/pillars`, description: 'Blog pillars' },

    // Individual blog posts
    ...posts
      .filter(post => !post.draft)
      .map(post => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        description: `Blog post: ${post.title}`,
        post
      }))
  ];

  log(`🔍 Checking ${routes.length} pages for missing images...\n`, 'blue');

  // Check each route
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    log(`[${i + 1}/${routes.length}] ${route.description}`, 'cyan');

    const result = await checkPageImages(route.url, route.post);

    if (result.missingImages.length > 0) {
      log(`  ❌ Found ${result.missingImages.length} missing images`, 'red');
      allMissingImages.push(...result.missingImages);
    } else {
      log(`  ✅ All images OK`, 'green');
    }

    if (result.errors.length > 0) {
      allErrors.push(...result.errors);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary of missing images
  log('\n=====================================', 'cyan');
  log('📊 Missing Images Summary:', 'bold');
  log(`   - Total pages checked: ${routes.length}`, 'blue');
  log(`   - Missing images found: ${allMissingImages.length}`, allMissingImages.length > 0 ? 'red' : 'green');
  log(`   - Errors encountered: ${allErrors.length}`, allErrors.length > 0 ? 'red' : 'green');

  if (allMissingImages.length === 0) {
    log('\n✅ No missing images found! All images are loading correctly.', 'green');
    return;
  }

  // Fix missing images
  log('\n🔧 Fixing missing images...', 'yellow');
  const fixedImages = [];
  const failedImages = [];

  for (let i = 0; i < allMissingImages.length; i++) {
    const missingImage = allMissingImages[i];
    log(`\n[${i + 1}/${allMissingImages.length}] Fixing: ${missingImage.url}`, 'yellow');

    try {
      const result = await fixMissingImage(missingImage);
      if (result) {
        fixedImages.push({ original: missingImage.url, fixed: result });
        log(`✅ Fixed: ${missingImage.url}`, 'green');
      } else {
        failedImages.push(missingImage.url);
        log(`❌ Failed to fix: ${missingImage.url}`, 'red');
      }
    } catch (error) {
      failedImages.push(missingImage.url);
      log(`❌ Error fixing ${missingImage.url}: ${error.message}`, 'red');
    }

    // Delay between fixes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final summary
  log('\n=====================================', 'cyan');
  log('🎯 Final Results:', 'bold');
  log(`   - Images fixed: ${fixedImages.length}`, fixedImages.length > 0 ? 'green' : 'yellow');
  log(`   - Images failed: ${failedImages.length}`, failedImages.length > 0 ? 'red' : 'green');

  if (fixedImages.length > 0) {
    log('\n✅ Successfully fixed images:', 'green');
    fixedImages.forEach(fix => {
      log(`   - ${fix.original} → ${fix.fixed}`, 'green');
    });
  }

  if (failedImages.length > 0) {
    log('\n❌ Failed to fix images:', 'red');
    failedImages.forEach(url => {
      log(`   - ${url}`, 'red');
    });
  }

  if (allErrors.length > 0) {
    log('\n⚠️ Other errors encountered:', 'yellow');
    allErrors.forEach(error => {
      log(`   - ${error}`, 'yellow');
    });
  }

  log('\n💡 Recommendation: Refresh the browser to see the fixed images!', 'blue');
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  getBlogPosts,
  checkPageImages,
  generateSearchTerms,
  searchForImage,
  downloadImage,
  createPlaceholderImage,
  fixMissingImage,
  main
};
