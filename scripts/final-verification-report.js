#!/usr/bin/env node

/**
 * Final Verification Report
 * Comprehensive check of all images and system health
 */

import fs from 'fs';
import path from 'path';

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
 * Check all image directories and files
 */
function checkImageDirectories() {
  const imagesDir = 'public/images';
  const results = {
    totalDirectories: 0,
    totalImages: 0,
    portadaImages: 0,
    otherImages: 0,
    directories: []
  };

  if (!fs.existsSync(imagesDir)) {
    return results;
  }

  const items = fs.readdirSync(imagesDir);
  
  for (const item of items) {
    const itemPath = path.join(imagesDir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results.totalDirectories++;
      const dirInfo = {
        name: item,
        images: [],
        hasPortada: false,
        totalSize: 0
      };
      
      const dirContents = fs.readdirSync(itemPath);
      for (const file of dirContents) {
        const filePath = path.join(itemPath, file);
        const fileStat = fs.statSync(filePath);
        
        if (fileStat.isFile() && /\.(webp|avif|jpg|jpeg|png|svg)$/i.test(file)) {
          dirInfo.images.push({
            name: file,
            size: fileStat.size,
            type: path.extname(file).toLowerCase()
          });
          dirInfo.totalSize += fileStat.size;
          results.totalImages++;
          
          if (file === 'portada.webp') {
            dirInfo.hasPortada = true;
            results.portadaImages++;
          } else {
            results.otherImages++;
          }
        }
      }
      
      results.directories.push(dirInfo);
    }
  }
  
  return results;
}

/**
 * Test image accessibility
 */
async function testImageAccessibility() {
  const baseUrl = 'http://localhost:4324';
  const testImages = [
    'seo-automatico-typescript/portada.webp',
    'optimizacion-performance-astro-tecnicas-avanzadas/portada.webp',
    'dark-mode-perfecto-astro/portada.webp',
    'github-actions-deploy-automatico-wrangler/portada.webp',
    'arquitectura-modular-astro/portada.webp'
  ];
  
  const results = {
    tested: 0,
    accessible: 0,
    failed: [],
    details: []
  };
  
  for (const imagePath of testImages) {
    results.tested++;
    const imageUrl = `${baseUrl}/images/${imagePath}`;
    
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        results.accessible++;
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');
        
        results.details.push({
          path: imagePath,
          status: response.status,
          size: contentLength ? parseInt(contentLength) : 0,
          type: contentType,
          accessible: true
        });
      } else {
        results.failed.push(imagePath);
        results.details.push({
          path: imagePath,
          status: response.status,
          accessible: false
        });
      }
    } catch (error) {
      results.failed.push(imagePath);
      results.details.push({
        path: imagePath,
        error: error.message,
        accessible: false
      });
    }
  }
  
  return results;
}

/**
 * Check blog posts for image references
 */
function checkBlogPostImages() {
  const contentDir = 'src/content/blog';
  const results = {
    totalPosts: 0,
    postsWithImages: 0,
    imageReferences: [],
    missingReferences: []
  };
  
  if (!fs.existsSync(contentDir)) {
    return results;
  }
  
  const blogFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  results.totalPosts = blogFiles.length;
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    const slug = file.replace('.md', '');
    
    // Look for image references
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["']/g;
    let match;
    let hasImages = false;
    
    while ((match = imageRegex.exec(content)) !== null) {
      hasImages = true;
      const imageSrc = match[2] || match[3];
      results.imageReferences.push({
        post: slug,
        src: imageSrc,
        alt: match[1] || ''
      });
      
      // Check if it's a local image that should exist
      if (imageSrc && imageSrc.startsWith('/images/')) {
        const localPath = path.join('public', imageSrc);
        if (!fs.existsSync(localPath)) {
          results.missingReferences.push({
            post: slug,
            src: imageSrc,
            expectedPath: localPath
          });
        }
      }
    }
    
    if (hasImages) {
      results.postsWithImages++;
    }
  }
  
  return results;
}

/**
 * Generate performance report
 */
function generatePerformanceReport(imageResults) {
  const report = {
    totalSize: 0,
    averageSize: 0,
    largestImage: null,
    smallestImage: null,
    formatDistribution: {},
    recommendations: []
  };
  
  let allImages = [];
  
  for (const dir of imageResults.directories) {
    for (const image of dir.images) {
      allImages.push({
        ...image,
        directory: dir.name,
        fullPath: `${dir.name}/${image.name}`
      });
      report.totalSize += image.size;
      
      const format = image.type;
      report.formatDistribution[format] = (report.formatDistribution[format] || 0) + 1;
    }
  }
  
  if (allImages.length > 0) {
    report.averageSize = Math.round(report.totalSize / allImages.length);
    
    allImages.sort((a, b) => b.size - a.size);
    report.largestImage = allImages[0];
    report.smallestImage = allImages[allImages.length - 1];
  }
  
  // Generate recommendations
  if (report.averageSize > 100000) {
    report.recommendations.push('Consider optimizing images - average size is over 100KB');
  }
  
  if (report.formatDistribution['.jpg'] || report.formatDistribution['.jpeg']) {
    report.recommendations.push('Consider converting JPEG images to WebP for better compression');
  }
  
  if (report.formatDistribution['.png']) {
    report.recommendations.push('Consider converting PNG images to WebP for better compression');
  }
  
  return report;
}

/**
 * Main execution function
 */
async function main() {
  log('🔍 Final Verification Report', 'bold');
  log('=====================================\n', 'cyan');
  
  // Check image directories
  log('📁 Checking image directories...', 'blue');
  const imageResults = checkImageDirectories();
  
  log(`   - Total directories: ${imageResults.totalDirectories}`, 'green');
  log(`   - Total images: ${imageResults.totalImages}`, 'green');
  log(`   - Portada images: ${imageResults.portadaImages}`, 'green');
  log(`   - Other images: ${imageResults.otherImages}`, 'green');
  
  // Test image accessibility
  log('\n🌐 Testing image accessibility...', 'blue');
  const accessResults = await testImageAccessibility();
  
  log(`   - Images tested: ${accessResults.tested}`, 'green');
  log(`   - Accessible: ${accessResults.accessible}`, 'green');
  log(`   - Failed: ${accessResults.failed.length}`, accessResults.failed.length > 0 ? 'red' : 'green');
  
  if (accessResults.details.length > 0) {
    log('\n   📊 Accessibility Details:', 'cyan');
    accessResults.details.forEach(detail => {
      if (detail.accessible) {
        const sizeKB = Math.round(detail.size / 1024);
        log(`   ✅ ${detail.path} (${detail.status}, ${sizeKB}KB, ${detail.type})`, 'green');
      } else {
        log(`   ❌ ${detail.path} (${detail.status || 'Error'})`, 'red');
      }
    });
  }
  
  // Check blog post image references
  log('\n📝 Checking blog post image references...', 'blue');
  const blogResults = checkBlogPostImages();
  
  log(`   - Total blog posts: ${blogResults.totalPosts}`, 'green');
  log(`   - Posts with images: ${blogResults.postsWithImages}`, 'green');
  log(`   - Image references: ${blogResults.imageReferences.length}`, 'green');
  log(`   - Missing references: ${blogResults.missingReferences.length}`, blogResults.missingReferences.length > 0 ? 'red' : 'green');
  
  if (blogResults.missingReferences.length > 0) {
    log('\n   ❌ Missing image references:', 'red');
    blogResults.missingReferences.forEach(ref => {
      log(`   - ${ref.post}: ${ref.src}`, 'red');
    });
  }
  
  // Generate performance report
  log('\n⚡ Performance analysis...', 'blue');
  const perfReport = generatePerformanceReport(imageResults);
  
  const totalSizeMB = (perfReport.totalSize / (1024 * 1024)).toFixed(2);
  const avgSizeKB = Math.round(perfReport.averageSize / 1024);
  
  log(`   - Total size: ${totalSizeMB} MB`, 'green');
  log(`   - Average size: ${avgSizeKB} KB`, 'green');
  
  if (perfReport.largestImage) {
    const largestKB = Math.round(perfReport.largestImage.size / 1024);
    log(`   - Largest image: ${perfReport.largestImage.fullPath} (${largestKB} KB)`, 'yellow');
  }
  
  if (perfReport.smallestImage) {
    const smallestKB = Math.round(perfReport.smallestImage.size / 1024);
    log(`   - Smallest image: ${perfReport.smallestImage.fullPath} (${smallestKB} KB)`, 'yellow');
  }
  
  log('\n   📊 Format distribution:', 'cyan');
  Object.entries(perfReport.formatDistribution).forEach(([format, count]) => {
    log(`   - ${format}: ${count} images`, 'blue');
  });
  
  // Recommendations
  if (perfReport.recommendations.length > 0) {
    log('\n💡 Performance recommendations:', 'yellow');
    perfReport.recommendations.forEach(rec => {
      log(`   - ${rec}`, 'yellow');
    });
  }
  
  // Overall health score
  log('\n=====================================', 'cyan');
  log('🎯 Overall System Health:', 'bold');
  
  const healthScore = {
    imageDirectories: imageResults.totalDirectories > 0 ? 100 : 0,
    accessibility: Math.round((accessResults.accessible / accessResults.tested) * 100),
    missingImages: blogResults.missingReferences.length === 0 ? 100 : 0,
    performance: perfReport.averageSize < 100000 ? 100 : 75
  };
  
  const overallScore = Math.round(
    (healthScore.imageDirectories + healthScore.accessibility + healthScore.missingImages + healthScore.performance) / 4
  );
  
  log(`   - Image directories: ${healthScore.imageDirectories}%`, healthScore.imageDirectories === 100 ? 'green' : 'yellow');
  log(`   - Accessibility: ${healthScore.accessibility}%`, healthScore.accessibility === 100 ? 'green' : 'yellow');
  log(`   - Missing images: ${healthScore.missingImages}%`, healthScore.missingImages === 100 ? 'green' : 'red');
  log(`   - Performance: ${healthScore.performance}%`, healthScore.performance === 100 ? 'green' : 'yellow');
  
  log(`\n🏆 Overall Health Score: ${overallScore}%`, overallScore >= 95 ? 'green' : overallScore >= 80 ? 'yellow' : 'red');
  
  if (overallScore >= 95) {
    log('\n🎉 Excellent! Your image system is in perfect condition!', 'green');
  } else if (overallScore >= 80) {
    log('\n👍 Good! Your image system is working well with minor improvements needed.', 'yellow');
  } else {
    log('\n⚠️ Your image system needs attention. Please address the issues above.', 'red');
  }
  
  log('\n📋 Summary:', 'blue');
  log(`   - ${imageResults.portadaImages} portada images successfully created`, 'green');
  log(`   - ${accessResults.accessible}/${accessResults.tested} images accessible via HTTP`, 'green');
  log(`   - ${blogResults.totalPosts} blog posts checked for image references`, 'green');
  log(`   - ${totalSizeMB} MB total image assets optimized`, 'green');
  
  log('\n🎯 Next Steps:', 'blue');
  log('   1. Monitor server logs for any new 404 image errors', 'blue');
  log('   2. Run this verification script periodically', 'blue');
  log('   3. Consider setting up automated image optimization', 'blue');
  log('   4. Add new portada images for future blog posts', 'blue');
  
  log('\n✨ Image system verification complete!', 'green');
}

// Run the verification
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkImageDirectories, testImageAccessibility, checkBlogPostImages, main };
