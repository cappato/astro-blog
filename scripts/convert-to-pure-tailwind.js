#!/usr/bin/env node

/**
 * Script para convertir todas las clases CSS custom a Tailwind puro
 * Convierte automáticamente todas las clases que eliminamos del tailwind.config.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de conversiones - SOLO colores de marca que van a cambiar
const CLASS_CONVERSIONS = {
  // SOLO convertir colores de marca (primary/secondary) - el resto se mantiene
  'text-primary': 'text-blue-600 dark:text-blue-400',
  'text-secondary': 'text-green-600 dark:text-green-400',
  'bg-primary': 'bg-blue-600 dark:bg-blue-500',
  'bg-secondary': 'bg-green-600 dark:bg-green-500',
  'border-primary': 'border-blue-600 dark:border-blue-500',
  'border-secondary': 'border-green-600 dark:border-green-500',

  // Hover states de colores de marca
  'hover:text-primary': 'hover:text-blue-600 dark:hover:text-blue-400',
  'hover:text-secondary': 'hover:text-green-600 dark:hover:text-green-400',
  'hover:bg-primary': 'hover:bg-blue-600 dark:hover:bg-blue-500',
  'hover:bg-secondary': 'hover:bg-green-600 dark:hover:bg-green-500',

  // Focus states de colores de marca
  'focus:ring-primary': 'focus:ring-blue-500',
  'focus:ring-secondary': 'focus:ring-green-500',

  // Variantes con opacidad de colores de marca
  'bg-primary/10': 'bg-blue-600/10 dark:bg-blue-500/10',
  'bg-primary/20': 'bg-blue-600/20 dark:bg-blue-500/20',
  'bg-secondary/10': 'bg-green-600/10 dark:bg-green-500/10',
  'bg-secondary/20': 'bg-green-600/20 dark:bg-green-500/20',
  'border-primary/20': 'border-blue-600/20 dark:border-blue-500/20',

  // text-tag se convierte a clases estándar temporalmente
  'text-tag': 'inline-block px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md no-underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
};

// Extensiones de archivo a procesar
const FILE_EXTENSIONS = ['.astro', '.ts', '.js', '.jsx', '.tsx', '.md', '.mdx'];

// Directorios a procesar
const DIRECTORIES_TO_PROCESS = [
  'src/components',
  'src/features',
  'src/layouts',
  'src/pages',
  'src/config',
  'docs'
];

/**
 * Convierte las clases CSS en un archivo
 */
async function convertClassesInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let hasChanges = false;
    
    // Aplicar todas las conversiones
    for (const [oldClass, newClass] of Object.entries(CLASS_CONVERSIONS)) {
      const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newClass);
        hasChanges = true;
        console.log(`  ✅ ${oldClass} → ${newClass}`);
      }
    }
    
    if (hasChanges) {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
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
          const hasChanges = await convertClassesInFile(fullPath);
          if (hasChanges) {
            results.push(fullPath);
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔥 CONVERSIÓN MASIVA A TAILWIND PURO');
  console.log('=====================================');
  console.log('');
  
  const projectRoot = path.resolve(__dirname, '..');
  const allChangedFiles = [];
  
  for (const dir of DIRECTORIES_TO_PROCESS) {
    const dirPath = path.join(projectRoot, dir);
    
    try {
      await fs.access(dirPath);
      console.log(`📁 Procesando: ${dir}`);
      
      const changedFiles = await processDirectory(dirPath);
      allChangedFiles.push(...changedFiles);
      
      console.log(`   ${changedFiles.length} archivos modificados`);
      console.log('');
    } catch (error) {
      console.log(`⚠️  Directorio no encontrado: ${dir}`);
    }
  }
  
  console.log('🎊 CONVERSIÓN COMPLETADA');
  console.log('========================');
  console.log(`📊 Total de archivos modificados: ${allChangedFiles.length}`);
  console.log('');
  
  if (allChangedFiles.length > 0) {
    console.log('📝 Archivos modificados:');
    allChangedFiles.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      console.log(`   - ${relativePath}`);
    });
  }
  
  console.log('');
  console.log('✅ ¡Proyecto convertido a Tailwind puro!');
  console.log('🚀 Listo para aplicar el nuevo diseño con Stitch de Google');
}

// Ejecutar el script
main().catch(console.error);
