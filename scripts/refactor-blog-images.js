#!/usr/bin/env node

/**
 * Script de Refactoring del Sistema de Imágenes del Blog
 * Implementa el plan de optimización detectado en la investigación
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
const SHARED_DIR = path.join(IMAGES_DIR, 'shared');

// Series detectadas
const SERIES_CONFIG = {
  'wrangler-deploy': {
    name: 'Wrangler & Deploy',
    posts: [
      'troubleshooting-wrangler-wsl-deploy',
      'configurar-wrangler-cloudflare-pages-2024', 
      'github-actions-deploy-automatico-wrangler',
      'deploy-automatico-wrangler-github-actions'
    ]
  },
  'astro-development': {
    name: 'Astro Development',
    posts: [
      'primer-post',
      'arquitectura-modular-astro',
      'dark-mode-perfecto-astro',
      'optimizacion-performance-astro-tecnicas-avanzadas'
    ]
  },
  'sistemas-automaticos': {
    name: 'Sistemas Automáticos',
    posts: [
      'anatomia-sistema-protocolos-automaticos',
      'protocolos-automaticos-ia-arquitectura',
      'migracion-sistemas-preservando-vision',
      'sistema-triggers-automaticos-desarrollo-context-loading'
    ]
  },
  'automation-devops': {
    name: 'Automation & DevOps',
    posts: [
      'auto-merge-inteligente-ux-control',
      'debugging-auto-merge-github-actions-troubleshooting',
      'reglas-esenciales-proyectos-profesionales-estándares'
    ]
  }
};

// Variantes a mantener (reducidas de 9 a 6)
const ESSENTIAL_VARIANTS = [
  'portada.webp',
  'portada-avif.avif', 
  'portada-og.webp',
  'portada-thumb.webp',
  'portada-lqip.webp',
  'portada-lqip.txt'
];

// Variantes a eliminar
const VARIANTS_TO_REMOVE = [
  'portada-og-avif.avif',
  'portada-og-jpg.jpeg', 
  'portada-wsp.webp'
];

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
 * Crear estructura de directorios compartidos
 */
async function createSharedStructure() {
  console.log('📁 Creando estructura de directorios compartidos...');
  
  // Crear directorio base
  await fs.mkdir(SHARED_DIR, { recursive: true });
  
  // Crear directorios de series
  const seriesDir = path.join(SHARED_DIR, 'series');
  await fs.mkdir(seriesDir, { recursive: true });
  
  for (const seriesId of Object.keys(SERIES_CONFIG)) {
    const seriesPath = path.join(seriesDir, seriesId);
    await fs.mkdir(seriesPath, { recursive: true });
    console.log(`   ✅ Creado: ${seriesPath}`);
  }
  
  // Crear directorio standalone
  const standalonePath = path.join(SHARED_DIR, 'standalone');
  await fs.mkdir(standalonePath, { recursive: true });
  console.log(`   ✅ Creado: ${standalonePath}`);
}

/**
 * Identificar imagen representativa para cada serie
 */
async function identifySeriesImages() {
  console.log('🔍 Identificando imágenes representativas por serie...');
  
  const seriesImages = {};
  
  for (const [seriesId, config] of Object.entries(SERIES_CONFIG)) {
    console.log(`\n   📚 Analizando serie: ${config.name}`);
    
    // Tomar la imagen del primer post como representativa
    const firstPost = config.posts[0];
    const firstPostDir = path.join(IMAGES_DIR, firstPost);
    
    try {
      await fs.access(firstPostDir);
      seriesImages[seriesId] = {
        sourceDir: firstPostDir,
        representativePost: firstPost
      };
      console.log(`   ✅ Imagen representativa: ${firstPost}`);
    } catch (error) {
      console.log(`   ⚠️  No se encontró directorio para: ${firstPost}`);
    }
  }
  
  return seriesImages;
}

/**
 * Copiar imágenes esenciales a directorios compartidos
 */
async function copyEssentialImages(seriesImages) {
  console.log('\n📋 Copiando imágenes esenciales a directorios compartidos...');
  
  for (const [seriesId, imageInfo] of Object.entries(seriesImages)) {
    const targetDir = path.join(SHARED_DIR, 'series', seriesId);
    const sourceDir = imageInfo.sourceDir;
    
    console.log(`\n   🔄 Procesando serie: ${seriesId}`);
    
    for (const variant of ESSENTIAL_VARIANTS) {
      const sourcePath = path.join(sourceDir, variant);
      const targetPath = path.join(targetDir, variant);
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(`   ✅ Copiado: ${variant}`);
      } catch (error) {
        console.log(`   ⚠️  No se pudo copiar: ${variant} (${error.message})`);
      }
    }
  }
}

/**
 * Generar reporte de archivos a eliminar
 */
async function generateDeletionReport() {
  console.log('\n📊 Generando reporte de archivos a eliminar...');
  
  const deletionReport = {
    duplicates: [],
    unnecessaryVariants: [],
    totalFiles: 0,
    totalSize: 0
  };
  
  // Analizar cada serie
  for (const [seriesId, config] of Object.entries(SERIES_CONFIG)) {
    for (let i = 1; i < config.posts.length; i++) { // Saltar el primero (representativo)
      const postId = config.posts[i];
      const postDir = path.join(IMAGES_DIR, postId);
      
      try {
        const files = await fs.readdir(postDir);
        
        for (const file of files) {
          const filePath = path.join(postDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            deletionReport.duplicates.push({
              path: filePath,
              size: stats.size,
              series: seriesId,
              post: postId,
              file: file
            });
            
            deletionReport.totalFiles++;
            deletionReport.totalSize += stats.size;
          }
        }
      } catch (error) {
        // Directorio no existe, continuar
      }
    }
  }
  
  // Analizar variantes innecesarias en todos los posts
  const allDirs = await fs.readdir(IMAGES_DIR);
  
  for (const dir of allDirs) {
    const dirPath = path.join(IMAGES_DIR, dir);
    const stats = await fs.stat(dirPath);
    
    if (stats.isDirectory() && dir !== 'shared') {
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          if (VARIANTS_TO_REMOVE.includes(file)) {
            const filePath = path.join(dirPath, file);
            const fileStats = await fs.stat(filePath);
            
            deletionReport.unnecessaryVariants.push({
              path: filePath,
              size: fileStats.size,
              post: dir,
              file: file
            });
            
            deletionReport.totalFiles++;
            deletionReport.totalSize += fileStats.size;
          }
        }
      } catch (error) {
        // Error leyendo directorio, continuar
      }
    }
  }
  
  return deletionReport;
}

/**
 * Mostrar reporte de refactoring
 */
function showRefactoringReport(deletionReport) {
  console.log('\n📋 REPORTE DE REFACTORING');
  console.log('='.repeat(50));
  
  console.log(`\n📊 ARCHIVOS A ELIMINAR:`);
  console.log(`   • Duplicados de series: ${deletionReport.duplicates.length}`);
  console.log(`   • Variantes innecesarias: ${deletionReport.unnecessaryVariants.length}`);
  console.log(`   • Total archivos: ${deletionReport.totalFiles}`);
  console.log(`   • Espacio a liberar: ${(deletionReport.totalSize / 1024).toFixed(1)} KB`);
  
  console.log(`\n🗂️  SERIES CONFIGURADAS:`);
  for (const [seriesId, config] of Object.entries(SERIES_CONFIG)) {
    console.log(`   • ${config.name}: ${config.posts.length} posts`);
  }
  
  console.log(`\n⚡ OPTIMIZACIONES:`);
  console.log(`   • Variantes reducidas: 9 → 6 por imagen`);
  console.log(`   • Sistema de imágenes compartidas implementado`);
  console.log(`   • Estructura preparada para series`);
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando refactoring del sistema de imágenes...\n');
  
  try {
    // Fase 1: Crear estructura
    await createSharedStructure();
    
    // Fase 2: Identificar imágenes representativas
    const seriesImages = await identifySeriesImages();
    
    // Fase 3: Copiar imágenes esenciales
    await copyEssentialImages(seriesImages);
    
    // Fase 4: Generar reporte de eliminación
    const deletionReport = await generateDeletionReport();
    
    // Fase 5: Mostrar reporte
    showRefactoringReport(deletionReport);
    
    console.log('\n✅ Refactoring completado exitosamente!');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Revisar imágenes copiadas en public/images/shared/');
    console.log('   2. Actualizar frontmatter de posts con campo "series"');
    console.log('   3. Crear componente SharedImage.astro');
    console.log('   4. Ejecutar script de limpieza para eliminar duplicados');
    
  } catch (error) {
    console.error('❌ Error durante el refactoring:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
