#!/usr/bin/env node

/**
 * Optimización de Imágenes del Blog (Sin Series)
 * Enfoque en eliminar duplicados y reducir variantes innecesarias
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuración
const IMAGES_DIR = path.join(rootDir, 'public/images');

// Variantes a eliminar (reducir de 9 a 6)
const VARIANTS_TO_REMOVE = [
  'portada-og-avif.avif',  // Redundante con portada-avif.avif
  'portada-og-jpg.jpeg',   // WebP es suficiente para OG
  'portada-wsp.webp'       // Usar portada-og.webp para WhatsApp
];

// Variantes esenciales a mantener
const ESSENTIAL_VARIANTS = [
  'portada.webp',          // Principal
  'portada-avif.avif',     // Formato moderno
  'portada-og.webp',       // Open Graph
  'portada-thumb.webp',    // Miniatura
  'portada-lqip.webp',     // Placeholder
  'portada-lqip.txt'       // Base64 placeholder
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
 * Analizar todos los directorios de imágenes
 */
async function analyzeImageDirectories() {
  console.log('🔍 Analizando directorios de imágenes...');
  
  const directories = [];
  const items = await fs.readdir(IMAGES_DIR);
  
  for (const item of items) {
    const itemPath = path.join(IMAGES_DIR, item);
    const stats = await fs.stat(itemPath);
    
    if (stats.isDirectory() && item !== 'shared') {
      directories.push({
        name: item,
        path: itemPath
      });
    }
  }
  
  console.log(`   ✅ ${directories.length} directorios encontrados`);
  return directories;
}

/**
 * Encontrar imágenes duplicadas por hash
 */
async function findDuplicateImages(directories) {
  console.log('\n🔍 Detectando imágenes duplicadas...');
  
  const hashMap = new Map();
  const duplicates = [];
  
  for (const dir of directories) {
    try {
      const files = await fs.readdir(dir.path);
      
      for (const file of files) {
        const filePath = path.join(dir.path, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && file.endsWith('.webp') || file.endsWith('.avif') || file.endsWith('.jpeg')) {
          const hash = await getFileHash(filePath);
          
          if (hash) {
            if (hashMap.has(hash)) {
              // Encontrado duplicado
              const existing = hashMap.get(hash);
              
              // Buscar si ya existe un grupo para este hash
              let duplicateGroup = duplicates.find(d => d.hash === hash);
              
              if (!duplicateGroup) {
                duplicateGroup = {
                  hash,
                  files: [existing]
                };
                duplicates.push(duplicateGroup);
              }
              
              duplicateGroup.files.push({
                directory: dir.name,
                file,
                path: filePath,
                size: stats.size
              });
            } else {
              hashMap.set(hash, {
                directory: dir.name,
                file,
                path: filePath,
                size: stats.size
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error procesando ${dir.name}: ${error.message}`);
    }
  }
  
  console.log(`   ✅ ${duplicates.length} grupos de duplicados encontrados`);
  return duplicates;
}

/**
 * Encontrar variantes innecesarias
 */
async function findUnnecessaryVariants(directories) {
  console.log('\n🔍 Detectando variantes innecesarias...');
  
  const unnecessaryFiles = [];
  
  for (const dir of directories) {
    try {
      const files = await fs.readdir(dir.path);
      
      for (const file of files) {
        if (VARIANTS_TO_REMOVE.includes(file)) {
          const filePath = path.join(dir.path, file);
          const stats = await fs.stat(filePath);
          
          unnecessaryFiles.push({
            directory: dir.name,
            file,
            path: filePath,
            size: stats.size,
            reason: 'Variante innecesaria'
          });
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error procesando ${dir.name}: ${error.message}`);
    }
  }
  
  console.log(`   ✅ ${unnecessaryFiles.length} variantes innecesarias encontradas`);
  return unnecessaryFiles;
}

/**
 * Generar reporte de optimización
 */
function generateOptimizationReport(duplicates, unnecessaryFiles) {
  console.log('\n📊 REPORTE DE OPTIMIZACIÓN');
  console.log('='.repeat(50));
  
  // Calcular estadísticas
  let totalDuplicateFiles = 0;
  let totalDuplicateSize = 0;
  
  duplicates.forEach(group => {
    // Contar todos menos el primero (que se mantiene)
    totalDuplicateFiles += group.files.length - 1;
    group.files.slice(1).forEach(file => {
      totalDuplicateSize += file.size;
    });
  });
  
  let totalUnnecessarySize = 0;
  unnecessaryFiles.forEach(file => {
    totalUnnecessarySize += file.size;
  });
  
  console.log(`\n📈 ESTADÍSTICAS:`);
  console.log(`   • Grupos de duplicados: ${duplicates.length}`);
  console.log(`   • Archivos duplicados a eliminar: ${totalDuplicateFiles}`);
  console.log(`   • Espacio duplicados: ${(totalDuplicateSize / 1024).toFixed(1)} KB`);
  console.log(`   • Variantes innecesarias: ${unnecessaryFiles.length}`);
  console.log(`   • Espacio variantes: ${(totalUnnecessarySize / 1024).toFixed(1)} KB`);
  console.log(`   • TOTAL A ELIMINAR: ${totalDuplicateFiles + unnecessaryFiles.length} archivos`);
  console.log(`   • ESPACIO TOTAL A LIBERAR: ${((totalDuplicateSize + totalUnnecessarySize) / 1024).toFixed(1)} KB`);
  
  return {
    totalFiles: totalDuplicateFiles + unnecessaryFiles.length,
    totalSize: totalDuplicateSize + totalUnnecessarySize
  };
}

/**
 * Mostrar detalles de duplicados (primeros 10)
 */
function showDuplicateDetails(duplicates) {
  console.log(`\n🔍 DETALLES DE DUPLICADOS (primeros 10):`);
  
  duplicates.slice(0, 10).forEach((group, index) => {
    console.log(`\n   ${index + 1}. Hash: ${group.hash.substring(0, 8)}... (${group.files.length} archivos)`);
    
    // Mostrar el archivo que se mantiene
    const keepFile = group.files[0];
    console.log(`      ✅ MANTENER: ${keepFile.directory}/${keepFile.file} (${(keepFile.size / 1024).toFixed(1)} KB)`);
    
    // Mostrar archivos a eliminar
    group.files.slice(1).forEach(file => {
      console.log(`      ❌ ELIMINAR: ${file.directory}/${file.file} (${(file.size / 1024).toFixed(1)} KB)`);
    });
  });
  
  if (duplicates.length > 10) {
    console.log(`\n   ... y ${duplicates.length - 10} grupos más`);
  }
}

/**
 * Mostrar variantes innecesarias (primeras 15)
 */
function showUnnecessaryVariants(unnecessaryFiles) {
  console.log(`\n🗑️  VARIANTES INNECESARIAS (primeras 15):`);
  
  unnecessaryFiles.slice(0, 15).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.directory}/${file.file} (${(file.size / 1024).toFixed(1)} KB) - ${file.reason}`);
  });
  
  if (unnecessaryFiles.length > 15) {
    console.log(`   ... y ${unnecessaryFiles.length - 15} archivos más`);
  }
}

/**
 * Generar script de limpieza
 */
async function generateCleanupScript(duplicates, unnecessaryFiles) {
  console.log('\n📝 Generando script de limpieza...');
  
  let script = '#!/bin/bash\n';
  script += '# Script de limpieza automática de imágenes\n';
  script += '# Generado automáticamente - REVISAR antes de ejecutar\n\n';
  script += 'echo "🧹 Iniciando limpieza de imágenes..."\n\n';
  
  // Eliminar duplicados
  script += '# Eliminar archivos duplicados\n';
  duplicates.forEach(group => {
    group.files.slice(1).forEach(file => {
      script += `rm "${file.path}"\n`;
    });
  });
  
  script += '\n# Eliminar variantes innecesarias\n';
  unnecessaryFiles.forEach(file => {
    script += `rm "${file.path}"\n`;
  });
  
  script += '\necho "✅ Limpieza completada"\n';
  script += 'echo "📊 Archivos eliminados: ' + (duplicates.reduce((acc, g) => acc + g.files.length - 1, 0) + unnecessaryFiles.length) + '"\n';
  
  const scriptPath = path.join(rootDir, 'scripts/cleanup-images.sh');
  await fs.writeFile(scriptPath, script);
  
  // Hacer ejecutable
  await fs.chmod(scriptPath, 0o755);
  
  console.log(`   ✅ Script creado: ${scriptPath}`);
  return scriptPath;
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando optimización de imágenes del blog...\n');
  
  try {
    // 1. Analizar directorios
    const directories = await analyzeImageDirectories();
    
    // 2. Encontrar duplicados
    const duplicates = await findDuplicateImages(directories);
    
    // 3. Encontrar variantes innecesarias
    const unnecessaryFiles = await findUnnecessaryVariants(directories);
    
    // 4. Generar reporte
    const stats = generateOptimizationReport(duplicates, unnecessaryFiles);
    
    // 5. Mostrar detalles
    if (duplicates.length > 0) {
      showDuplicateDetails(duplicates);
    }
    
    if (unnecessaryFiles.length > 0) {
      showUnnecessaryVariants(unnecessaryFiles);
    }
    
    // 6. Generar script de limpieza
    const scriptPath = await generateCleanupScript(duplicates, unnecessaryFiles);
    
    console.log('\n✅ OPTIMIZACIÓN COMPLETADA');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Revisar el script generado: scripts/cleanup-images.sh');
    console.log('   2. Ejecutar: bash scripts/cleanup-images.sh');
    console.log(`   3. Liberar ${(stats.totalSize / 1024).toFixed(1)} KB de espacio`);
    console.log(`   4. Eliminar ${stats.totalFiles} archivos innecesarios`);
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
