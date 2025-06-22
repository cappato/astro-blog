#!/usr/bin/env node

/**
 * Optimización del Sistema de Generación de Imágenes
 * Actualiza los presets para generar solo las variantes esenciales
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Archivos a modificar
const FILES_TO_UPDATE = [
  'src/features/image-optimization/engine/presets.ts',
  'docs/BLOG-POST-CREATION-WORKFLOW.md'
];

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  // Variantes ESENCIALES (6 en lugar de 9)
  essentialPresets: [
    'default',      // Imagen principal
    'avif',         // Formato moderno
    'og',           // Open Graph
    'thumb',        // Miniatura
    'lqip'          // Placeholder (se genera automáticamente)
  ],
  
  // Variantes ELIMINADAS (3 redundantes)
  removedPresets: [
    'og-jpg',       // Redundante: WebP es mejor que JPEG
    'og-avif',      // Redundante: ya tenemos 'avif'
    'wsp'           // Redundante: usar 'og' para WhatsApp
  ],
  
  // Razones de eliminación
  removalReasons: {
    'og-jpg': 'WebP es más eficiente y tiene mejor soporte',
    'og-avif': 'Redundante con preset "avif" principal',
    'wsp': 'Open Graph es suficiente para redes sociales'
  }
};

/**
 * Leer archivo con manejo de errores
 */
async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content, error: null };
  } catch (error) {
    return { success: false, content: null, error: error.message };
  }
}

/**
 * Escribir archivo con backup
 */
async function writeFileWithBackup(filePath, content) {
  try {
    // Crear backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    const originalContent = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, originalContent);
    
    // Escribir nuevo contenido
    await fs.writeFile(filePath, content);
    
    return { success: true, backupPath, error: null };
  } catch (error) {
    return { success: false, backupPath: null, error: error.message };
  }
}

/**
 * Optimizar archivo de presets
 */
async function optimizePresetsFile() {
  console.log('🔧 Optimizando archivo de presets...');
  
  const filePath = path.join(rootDir, 'src/features/image-optimization/engine/presets.ts');
  const result = await readFileContent(filePath);
  
  if (!result.success) {
    console.log(`   ❌ Error leyendo ${filePath}: ${result.error}`);
    return false;
  }
  
  let content = result.content;
  
  // 1. Actualizar función getCoverImagePresets
  const oldCoverFunction = `export function getCoverImagePresets(): string[] {
  return getPresetNames().filter(name => name !== 'default');
}`;

  const newCoverFunction = `export function getCoverImagePresets(): string[] {
  // Optimizado: Solo variantes esenciales (6 en lugar de 9)
  return ['og', 'thumb', 'avif', 'lqip'];
}`;

  content = content.replace(oldCoverFunction, newCoverFunction);
  
  // 2. Actualizar recomendaciones de blog_post
  const oldBlogPost = `blog_post: ['default', 'og', 'og-jpg', 'thumb', 'avif', 'lqip'],`;
  const newBlogPost = `blog_post: ['default', 'og', 'thumb', 'avif', 'lqip'], // Optimizado: eliminadas variantes redundantes`;
  
  content = content.replace(oldBlogPost, newBlogPost);
  
  // 3. Actualizar comentarios de presets eliminados
  const presetsToComment = [
    {
      old: `  /** Open Graph in JPEG for better compatibility */
  'og-jpg': {
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 80,
    fit: 'cover'
  },`,
      new: `  /** Open Graph in JPEG for better compatibility - DEPRECATED: WebP es más eficiente */
  // 'og-jpg': {
  //   width: 1200,
  //   height: 630,
  //   format: 'jpeg',
  //   quality: 80,
  //   fit: 'cover'
  // },`
    },
    {
      old: `  /** WhatsApp Stories (square) */
  wsp: {
    width: 1080,
    height: 1080,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },`,
      new: `  /** WhatsApp Stories (square) - DEPRECATED: Usar 'og' para redes sociales */
  // wsp: {
  //   width: 1080,
  //   height: 1080,
  //   format: 'webp',
  //   quality: 80,
  //   fit: 'cover'
  // },`
    },
    {
      old: `  /** Open Graph in AVIF */
  'og-avif': {
    width: 1200,
    height: 630,
    format: 'avif',
    quality: 65,
    fit: 'cover'
  },`,
      new: `  /** Open Graph in AVIF - DEPRECATED: Redundante con preset 'avif' */
  // 'og-avif': {
  //   width: 1200,
  //   height: 630,
  //   format: 'avif',
  //   quality: 65,
  //   fit: 'cover'
  // },`
    }
  ];
  
  presetsToComment.forEach(({ old, new: newContent }) => {
    content = content.replace(old, newContent);
  });
  
  // 4. Agregar comentario de optimización al inicio
  const optimizationComment = `/**
 * OPTIMIZACIÓN APLICADA (${new Date().toISOString().split('T')[0]})
 * 
 * Variantes reducidas de 9 a 6 para mejorar performance:
 * ✅ MANTENIDAS: default, og, thumb, avif, lqip (+ base64)
 * ❌ ELIMINADAS: og-jpg, og-avif, wsp (redundantes)
 * 
 * Beneficios:
 * - 33% menos archivos por imagen
 * - Menor tiempo de procesamiento
 * - Menos espacio de almacenamiento
 * - Mantenimiento simplificado
 */

`;

  // Insertar comentario después de los imports
  const importEndIndex = content.indexOf('/** Image optimization presets */');
  if (importEndIndex !== -1) {
    content = content.slice(0, importEndIndex) + optimizationComment + content.slice(importEndIndex);
  }
  
  // Escribir archivo optimizado
  const writeResult = await writeFileWithBackup(filePath, content);
  
  if (writeResult.success) {
    console.log(`   ✅ Archivo optimizado: ${filePath}`);
    console.log(`   💾 Backup creado: ${writeResult.backupPath}`);
    return true;
  } else {
    console.log(`   ❌ Error escribiendo ${filePath}: ${writeResult.error}`);
    return false;
  }
}

/**
 * Optimizar documentación
 */
async function optimizeDocumentation() {
  console.log('\n📝 Optimizando documentación...');
  
  const filePath = path.join(rootDir, 'docs/BLOG-POST-CREATION-WORKFLOW.md');
  const result = await readFileContent(filePath);
  
  if (!result.success) {
    console.log(`   ❌ Error leyendo ${filePath}: ${result.error}`);
    return false;
  }
  
  let content = result.content;
  
  // Actualizar lista de variantes generadas
  const oldVariantsList = `**Esto genera automáticamente:**
- ✅ \`portada.webp\` - Imagen principal
- ✅ \`portada-avif.avif\` - Formato AVIF moderno
- ✅ \`portada-og.webp\` - Open Graph para redes sociales
- ✅ \`portada-og-jpg.jpeg\` - JPEG para compatibilidad
- ✅ \`portada-og-avif.avif\` - AVIF para Open Graph
- ✅ \`portada-thumb.webp\` - **Miniatura para listados** ← CRÍTICO
- ✅ \`portada-lqip.webp\` - Low Quality Image Placeholder
- ✅ \`portada-lqip.txt\` - Datos del LQIP
- ✅ \`portada-wsp.webp\` - Versión para WhatsApp/Social`;

  const newVariantsList = `**Esto genera automáticamente (OPTIMIZADO - 6 variantes):**
- ✅ \`portada.webp\` - Imagen principal
- ✅ \`portada-avif.avif\` - Formato AVIF moderno
- ✅ \`portada-og.webp\` - Open Graph para redes sociales
- ✅ \`portada-thumb.webp\` - **Miniatura para listados** ← CRÍTICO
- ✅ \`portada-lqip.webp\` - Low Quality Image Placeholder
- ✅ \`portada-lqip.txt\` - Datos del LQIP

**Variantes eliminadas (redundantes):**
- ❌ \`portada-og-jpg.jpeg\` - WebP es más eficiente
- ❌ \`portada-og-avif.avif\` - Redundante con portada-avif.avif
- ❌ \`portada-wsp.webp\` - Usar portada-og.webp para redes sociales`;

  content = content.replace(oldVariantsList, newVariantsList);
  
  // Escribir documentación optimizada
  const writeResult = await writeFileWithBackup(filePath, content);
  
  if (writeResult.success) {
    console.log(`   ✅ Documentación optimizada: ${filePath}`);
    console.log(`   💾 Backup creado: ${writeResult.backupPath}`);
    return true;
  } else {
    console.log(`   ❌ Error escribiendo ${filePath}: ${writeResult.error}`);
    return false;
  }
}

/**
 * Generar reporte de optimización
 */
function generateOptimizationReport() {
  console.log('\n📊 REPORTE DE OPTIMIZACIÓN DEL SISTEMA');
  console.log('='.repeat(50));
  
  console.log('\n🎯 CAMBIOS APLICADOS:');
  console.log('   • getCoverImagePresets() → Solo variantes esenciales');
  console.log('   • blog_post presets → Eliminadas variantes redundantes');
  console.log('   • Presets deprecated → Comentados con razones');
  console.log('   • Documentación → Actualizada con nuevas variantes');
  
  console.log('\n📈 BENEFICIOS:');
  console.log('   • 33% menos archivos por imagen (9 → 6 variantes)');
  console.log('   • Procesamiento más rápido');
  console.log('   • Menos espacio de almacenamiento');
  console.log('   • Mantenimiento simplificado');
  
  console.log('\n🔧 VARIANTES OPTIMIZADAS:');
  console.log('   ✅ MANTENIDAS:');
  OPTIMIZATION_CONFIG.essentialPresets.forEach(preset => {
    console.log(`      - ${preset}`);
  });
  
  console.log('   ❌ ELIMINADAS:');
  OPTIMIZATION_CONFIG.removedPresets.forEach(preset => {
    const reason = OPTIMIZATION_CONFIG.removalReasons[preset];
    console.log(`      - ${preset} (${reason})`);
  });
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('   1. Probar generación: npm run optimize-images -- --postId=test-post');
  console.log('   2. Verificar que solo se generen 6 variantes');
  console.log('   3. Confirmar que el sistema funciona correctamente');
  console.log('   4. Eliminar backups si todo está bien');
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando optimización del sistema de generación de imágenes...\n');
  
  try {
    // 1. Optimizar archivo de presets
    const presetsSuccess = await optimizePresetsFile();
    
    // 2. Optimizar documentación
    const docsSuccess = await optimizeDocumentation();
    
    // 3. Generar reporte
    generateOptimizationReport();
    
    if (presetsSuccess && docsSuccess) {
      console.log('\n✅ OPTIMIZACIÓN COMPLETADA EXITOSAMENTE');
      console.log('\nEl sistema ahora generará solo 6 variantes esenciales por imagen.');
      console.log('Esto reducirá significativamente el tiempo de procesamiento y espacio usado.');
    } else {
      console.log('\n⚠️  OPTIMIZACIÓN PARCIAL');
      console.log('Algunos archivos no pudieron ser actualizados. Revisar errores arriba.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
