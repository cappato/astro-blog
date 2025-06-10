#!/usr/bin/env node

/**
 * Analizador de Imágenes del Blog
 * Detecta imágenes duplicadas, analiza estructura de posts y series
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuración
const BLOG_DIR = path.join(rootDir, 'src/content/blog');
const IMAGES_DIR = path.join(rootDir, 'public/images');

/**
 * Calcular hash MD5 de un archivo
 */
async function getFileHash(filePath) {
  try {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Analizar metadata de un post
 */
async function analyzePost(postPath) {
  try {
    const content = await fs.readFile(postPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      return null;
    }

    const frontmatter = frontmatterMatch[1];
    const metadata = {};
    
    // Extraer campos básicos
    const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
    const postIdMatch = frontmatter.match(/postId:\s*["']([^"']+)["']/);
    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/s);
    const dateMatch = frontmatter.match(/date:\s*["']([^"']+)["']/);
    const seriesMatch = frontmatter.match(/series:\s*["']([^"']+)["']/);
    
    metadata.title = titleMatch ? titleMatch[1] : 'Sin título';
    metadata.postId = postIdMatch ? postIdMatch[1] : path.basename(postPath, '.md');
    metadata.date = dateMatch ? dateMatch[1] : 'Sin fecha';
    metadata.series = seriesMatch ? seriesMatch[1] : null;
    
    if (tagsMatch) {
      metadata.tags = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim().replace(/["']/g, ''))
        .filter(tag => tag.length > 0);
    } else {
      metadata.tags = [];
    }

    return metadata;
  } catch (error) {
    console.error(`Error analizando ${postPath}:`, error.message);
    return null;
  }
}

/**
 * Analizar directorio de imágenes de un post
 */
async function analyzePostImages(postId) {
  const imageDir = path.join(IMAGES_DIR, postId);
  
  try {
    const files = await fs.readdir(imageDir);
    const imageAnalysis = {
      directory: imageDir,
      totalFiles: files.length,
      variants: {},
      totalSize: 0
    };

    for (const file of files) {
      const filePath = path.join(imageDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        const hash = await getFileHash(filePath);
        const size = stats.size;
        
        imageAnalysis.totalSize += size;
        
        // Categorizar por tipo de variante
        let variant = 'unknown';
        if (file.includes('portada.webp')) variant = 'main';
        else if (file.includes('portada-og')) variant = 'og';
        else if (file.includes('portada-thumb')) variant = 'thumbnail';
        else if (file.includes('portada-lqip')) variant = 'lqip';
        else if (file.includes('portada-avif')) variant = 'avif';
        else if (file.includes('portada-wsp')) variant = 'whatsapp';
        
        if (!imageAnalysis.variants[variant]) {
          imageAnalysis.variants[variant] = [];
        }
        
        imageAnalysis.variants[variant].push({
          file,
          size,
          hash,
          path: filePath
        });
      }
    }

    return imageAnalysis;
  } catch (error) {
    return {
      directory: imageDir,
      error: error.message,
      totalFiles: 0,
      variants: {},
      totalSize: 0
    };
  }
}

/**
 * Detectar imágenes duplicadas por hash
 */
function findDuplicateImages(allImages) {
  const hashMap = new Map();
  const duplicates = [];

  for (const postId in allImages) {
    const postImages = allImages[postId];
    
    if (postImages.variants) {
      for (const variant in postImages.variants) {
        for (const image of postImages.variants[variant]) {
          if (image.hash) {
            if (hashMap.has(image.hash)) {
              const existing = hashMap.get(image.hash);
              duplicates.push({
                hash: image.hash,
                files: [existing, { postId, variant, ...image }]
              });
            } else {
              hashMap.set(image.hash, { postId, variant, ...image });
            }
          }
        }
      }
    }
  }

  return duplicates;
}

/**
 * Detectar series de posts
 */
function detectSeries(posts) {
  const series = new Map();
  const potentialSeries = new Map();

  for (const post of posts) {
    if (post.series) {
      if (!series.has(post.series)) {
        series.set(post.series, []);
      }
      series.get(post.series).push(post);
    }

    // Detectar series potenciales por tags similares
    const tagKey = post.tags.slice().sort().join(',');
    if (tagKey.length > 0) {
      if (!potentialSeries.has(tagKey)) {
        potentialSeries.set(tagKey, []);
      }
      potentialSeries.get(tagKey).push(post);
    }
  }

  return {
    explicit: Array.from(series.entries()).map(([name, posts]) => ({ name, posts })),
    potential: Array.from(potentialSeries.entries())
      .filter(([_, posts]) => posts.length > 1)
      .map(([tags, posts]) => ({ tags, posts }))
  };
}

/**
 * Detectar series potenciales por contenido y tags
 */
function detectPotentialSeries(posts) {
  const potentialSeries = new Map();

  // Agrupar por palabras clave en títulos
  const titleKeywords = new Map();

  for (const post of posts) {
    const title = post.title.toLowerCase();

    // Detectar palabras clave comunes
    const keywords = [
      'wrangler', 'github-actions', 'deploy', 'cloudflare',
      'automatico', 'protocolos', 'sistema', 'astro',
      'performance', 'seo', 'testing', 'troubleshooting'
    ];

    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        if (!titleKeywords.has(keyword)) {
          titleKeywords.set(keyword, []);
        }
        titleKeywords.get(keyword).push(post);
      }
    }
  }

  // Filtrar grupos con más de 1 post
  const series = Array.from(titleKeywords.entries())
    .filter(([_, posts]) => posts.length > 1)
    .map(([keyword, posts]) => ({
      keyword,
      posts: posts.sort((a, b) => new Date(a.date) - new Date(b.date)),
      count: posts.length
    }));

  return series;
}

/**
 * Función principal de análisis
 */
async function analyzeAll() {
  console.log('🔍 Iniciando análisis del blog...\n');

  // 1. Analizar posts
  console.log('📝 Analizando posts...');
  const postFiles = await fs.readdir(BLOG_DIR);
  const posts = [];

  for (const file of postFiles) {
    if (file.endsWith('.md')) {
      const postPath = path.join(BLOG_DIR, file);
      const metadata = await analyzePost(postPath);
      if (metadata) {
        posts.push({ ...metadata, file });
      }
    }
  }

  console.log(`   ✅ ${posts.length} posts analizados\n`);

  // 2. Analizar imágenes
  console.log('🖼️  Analizando imágenes...');
  const allImages = {};
  let totalImageSize = 0;
  let totalImageFiles = 0;

  for (const post of posts) {
    const imageAnalysis = await analyzePostImages(post.postId);
    allImages[post.postId] = imageAnalysis;
    totalImageSize += imageAnalysis.totalSize;
    totalImageFiles += imageAnalysis.totalFiles;
  }

  console.log(`   ✅ ${totalImageFiles} archivos de imagen analizados\n`);

  // 3. Detectar duplicados
  console.log('🔍 Detectando imágenes duplicadas...');
  const duplicates = findDuplicateImages(allImages);
  console.log(`   ✅ ${duplicates.length} grupos de duplicados encontrados\n`);

  // 4. Detectar series
  console.log('📚 Detectando series de posts...');
  const seriesAnalysis = detectSeries(posts);
  const potentialSeries = detectPotentialSeries(posts);
  console.log(`   ✅ ${seriesAnalysis.explicit.length} series explícitas, ${potentialSeries.length} series potenciales\n`);

  // 5. Generar reporte
  console.log('📊 REPORTE DE ANÁLISIS');
  console.log('='.repeat(50));
  
  console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
  console.log(`   • Posts totales: ${posts.length}`);
  console.log(`   • Archivos de imagen: ${totalImageFiles}`);
  console.log(`   • Tamaño total imágenes: ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   • Promedio por post: ${(totalImageFiles / posts.length).toFixed(1)} archivos`);

  console.log(`\n🖼️  ANÁLISIS DE IMÁGENES:`);
  console.log(`   • Grupos de duplicados: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log(`\n   🔍 IMÁGENES DUPLICADAS DETECTADAS:`);
    duplicates.forEach((dup, index) => {
      console.log(`   ${index + 1}. Hash: ${dup.hash.substring(0, 8)}...`);
      dup.files.forEach(file => {
        console.log(`      - ${file.postId}/${file.variant}/${file.file} (${(file.size / 1024).toFixed(1)} KB)`);
      });
    });
  }

  console.log(`\n📚 ANÁLISIS DE SERIES:`);
  if (seriesAnalysis.explicit.length > 0) {
    console.log(`   ✅ Series explícitas encontradas:`);
    seriesAnalysis.explicit.forEach(series => {
      console.log(`   • "${series.name}": ${series.posts.length} posts`);
      series.posts.forEach(post => {
        console.log(`     - ${post.title}`);
      });
    });
  }

  if (potentialSeries.length > 0) {
    console.log(`\n   🤔 Series potenciales detectadas:`);
    potentialSeries.forEach(series => {
      console.log(`   • "${series.keyword}": ${series.count} posts`);
      series.posts.forEach(post => {
        console.log(`     - ${post.title} (${post.date})`);
      });
      console.log('');
    });
  }

  console.log(`\n💡 RECOMENDACIONES:`);
  
  if (duplicates.length > 0) {
    console.log(`   🔧 Imágenes duplicadas: Considerar sistema de imágenes compartidas para series`);
  }
  
  const avgVariants = totalImageFiles / posts.length;
  if (avgVariants > 8) {
    console.log(`   🔧 Muchas variantes por imagen (${avgVariants.toFixed(1)}): Revisar si todas son necesarias`);
  }

  if (potentialSeries.length > 3) {
    console.log(`   🔧 Series potenciales: Considerar agrupar posts relacionados en series explícitas`);
  }

  console.log(`\n📋 PLAN DE REFACTORING SUGERIDO:`);
  console.log(`   1. 🗂️  Crear sistema de imágenes compartidas para series`);
  console.log(`   2. 🔄 Implementar campo 'series' en frontmatter de posts relacionados`);
  console.log(`   3. 🗑️  Eliminar ${duplicates.length * 6} archivos duplicados (~${((duplicates.length * 200) / 1024).toFixed(1)} KB ahorrados)`);
  console.log(`   4. ⚡ Reducir variantes de imagen de 9 a 6 por post`);
  console.log(`   5. 🏗️  Crear componente SharedImage.astro para series`);

  console.log(`\n✅ Análisis completado. Revisa las recomendaciones para optimizar el sistema.`);
}

// Ejecutar análisis
analyzeAll().catch(console.error);
