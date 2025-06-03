#!/usr/bin/env node

/**
 * CSS Classes Optimization Script
 * Reemplaza clases CSS repetitivas por clases semánticas
 */

import fs from 'fs/promises';
import path from 'path';

// Mapeo de clases repetitivas a clases semánticas
const CLASS_REPLACEMENTS = {
  'text-gray-900 dark:text-white': 'text-content',
  'bg-white dark:bg-gray-800': 'bg-card',
  'border-gray-200 dark:border-gray-700': 'border-card',
  'text-gray-600 dark:text-gray-300': 'text-secondary',
  
  // Combinaciones complejas
  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm': 'card-base',
  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700': 'bg-card border border-card'
};

// Extensiones de archivo a procesar
const FILE_EXTENSIONS = ['.astro', '.ts', '.js', '.jsx', '.tsx'];

// Directorios a procesar
const DIRECTORIES_TO_PROCESS = [
  'src/components',
  'src/features',
  'src/layouts',
  'src/pages'
];

/**
 * Optimiza las clases CSS en un archivo
 */
async function optimizeClassesInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let optimizedContent = content;
    let hasChanges = false;

    // Aplicar cada reemplazo
    for (const [oldClasses, newClasses] of Object.entries(CLASS_REPLACEMENTS)) {
      const regex = new RegExp(oldClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(optimizedContent)) {
        optimizedContent = optimizedContent.replace(regex, newClasses);
        hasChanges = true;
      }
    }

    // Escribir archivo solo si hay cambios
    if (hasChanges) {
      await fs.writeFile(filePath, optimizedContent, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Procesa recursivamente un directorio
 */
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const results = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Procesar subdirectorio recursivamente
        const subResults = await processDirectory(fullPath);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Verificar si es un archivo que debemos procesar
        const ext = path.extname(entry.name);
        if (FILE_EXTENSIONS.includes(ext)) {
          const hasChanges = await optimizeClassesInFile(fullPath);
          if (hasChanges) {
            results.push(fullPath);
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error procesando directorio ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🎨 OPTIMIZACIÓN DE CLASES CSS');
  console.log('============================');
  console.log('');
  
  const projectRoot = path.resolve(process.cwd());
  const allChangedFiles = [];
  
  for (const dir of DIRECTORIES_TO_PROCESS) {
    const dirPath = path.join(projectRoot, dir);
    
    try {
      await fs.access(dirPath);
      console.log(`📁 Procesando: ${dir}`);
      
      const changedFiles = await processDirectory(dirPath);
      allChangedFiles.push(...changedFiles);
      
      console.log(`   ${changedFiles.length} archivos optimizados`);
      console.log('');
    } catch (error) {
      console.log(`⚠️  Directorio no encontrado: ${dir}`);
    }
  }
  
  console.log('🎊 OPTIMIZACIÓN COMPLETADA');
  console.log('==========================');
  console.log(`📊 Total de archivos optimizados: ${allChangedFiles.length}`);
  console.log('');
  
  if (allChangedFiles.length > 0) {
    console.log('📝 Archivos modificados:');
    allChangedFiles.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      console.log(`   - ${relativePath}`);
    });
    
    console.log('');
    console.log('✅ Clases CSS optimizadas:');
    Object.entries(CLASS_REPLACEMENTS).forEach(([old, newClass]) => {
      console.log(`   ${old} → ${newClass}`);
    });
  }
  
  console.log('');
  console.log('🚀 ¡Proyecto optimizado con clases semánticas!');
}

// Ejecutar el script
main().catch(console.error);
