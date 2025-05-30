#!/usr/bin/env node
/**
 * Script de optimización de imágenes refactorizado
 * Versión modular y mantenible del optimizador de imágenes
 * 
 * COMANDOS DE EJEMPLO:
 * --------------------
 * 
 * 1. Optimizar todas las imágenes de todos los posts:
 *    node scripts/optimize-images-new.js
 * 
 * 2. Optimizar imágenes de un post específico:
 *    node scripts/optimize-images-new.js --postId=bienvenida
 * 
 * 3. Forzar regeneración de todas las imágenes:
 *    node scripts/optimize-images-new.js --force
 * 
 * 4. Optimizar una imagen específica:
 *    node scripts/optimize-images-new.js --file=images/raw/seccion/imagen.jpg
 * 
 * 5. Modo debug con información detallada:
 *    node scripts/optimize-images-new.js --debug
 */

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// Importar módulos refactorizados
import { PRESETS, getPreset, getPresetNames } from './lib/presets.js';
import { 
  ensureDirectories, 
  getPostDirectories, 
  getPostImages, 
  needsProcessing, 
  createOutputDirectory,
  resolveFilePath 
} from './lib/file-utils.js';
import { 
  processImageWithPreset, 
  generateLQIP, 
  validateImage 
} from './lib/image-processor.js';
import { logger, setLogLevel } from './lib/logger.js';

/**
 * Configuración de argumentos de línea de comandos
 */
const argv = yargs(hideBin(process.argv))
  .option('postId', {
    alias: 'p',
    type: 'string',
    description: 'ID del post a procesar'
  })
  .option('force', {
    alias: 'f',
    type: 'boolean',
    description: 'Forzar regeneración de todas las imágenes'
  })
  .option('file', {
    alias: 'i',
    type: 'string',
    description: 'Ruta específica de una imagen a procesar'
  })
  .option('debug', {
    alias: 'd',
    type: 'boolean',
    description: 'Activar modo debug con información detallada'
  })
  .option('preset', {
    type: 'string',
    description: 'Preset específico a aplicar (para uso con --file)',
    choices: getPresetNames()
  })
  .help()
  .alias('help', 'h')
  .argv;

/**
 * Procesar una imagen individual con un preset
 * @param {string} sourcePath - Ruta de la imagen fuente
 * @param {string} outputDir - Directorio de salida
 * @param {string} fileName - Nombre del archivo
 * @param {string} presetName - Nombre del preset
 * @param {boolean} force - Forzar regeneración
 * @returns {Promise<boolean>} True si se procesó exitosamente
 */
async function processImage(sourcePath, outputDir, fileName, presetName, force = false) {
  const preset = getPreset(presetName);
  if (!preset) {
    logger.error(`Preset no encontrado: ${presetName}`);
    return false;
  }

  // Verificar si necesita procesamiento
  const outputFileName = `${fileName.split('.')[0]}${presetName === 'default' ? '' : `-${presetName}`}.${preset.format}`;
  const outputPath = `${outputDir}/${outputFileName}`;
  
  if (!needsProcessing(sourcePath, outputPath, force)) {
    logger.skipped(`${outputFileName} (sin cambios)`);
    return true;
  }

  // Validar imagen antes de procesar
  const validation = await validateImage(sourcePath);
  if (!validation.valid) {
    logger.error(`Imagen inválida ${sourcePath}: ${validation.error}`);
    return false;
  }

  logger.processing(`${outputFileName}...`);

  // Procesar imagen
  const result = await processImageWithPreset(sourcePath, outputDir, fileName, preset, presetName);
  
  if (result.success) {
    const sizeKB = (result.size / 1024).toFixed(1);
    logger.success(`${result.outputFileName} (${sizeKB} KB)`);
    return true;
  } else {
    logger.error(`Error al procesar ${sourcePath}`, new Error(result.error));
    return false;
  }
}

/**
 * Procesar todas las imágenes de un post
 * @param {string} postId - ID del post
 * @param {boolean} force - Forzar regeneración
 * @returns {Promise<boolean>} True si se procesó exitosamente
 */
async function processPost(postId, force = false) {
  const images = getPostImages(postId);
  
  if (!images.exists) {
    logger.error(`No se encontró el directorio para el post "${postId}"`);
    return false;
  }

  logger.section(`Procesando post: ${postId}`);
  
  if (images.allImages.length === 0) {
    logger.warn(`No se encontraron imágenes en el post ${postId}`);
    return true;
  }

  logger.info(`Encontradas ${images.allImages.length} imágenes`);

  // Crear directorio de salida
  const outputDir = createOutputDirectory(postId);
  
  let processedCount = 0;
  let totalImages = 0;

  // Procesar imagen de portada con todos los presets
  if (images.coverImage) {
    logger.info(`Imagen de portada encontrada: ${images.coverImage}`);
    const coverPath = `${images.directory}/${images.coverImage}`;
    
    totalImages += getPresetNames().length;
    
    for (const presetName of getPresetNames()) {
      const success = await processImage(coverPath, outputDir, images.coverImage, presetName, force);
      if (success) processedCount++;
      
      logger.progress(processedCount, totalImages, 'portada');
    }

    // Generar LQIP para la portada
    if (getPreset('lqip')) {
      logger.processing('Generando LQIP...');
      const baseName = images.coverImage.split('.')[0];
      const lqipResult = await generateLQIP(coverPath, outputDir, baseName);
      
      if (lqipResult.success) {
        logger.success(`LQIP generado (${(lqipResult.size / 1024).toFixed(1)} KB)`);
      } else {
        logger.error('Error al generar LQIP', new Error(lqipResult.error));
      }
    }
  } else {
    logger.warn('No se encontró imagen de portada (portada.jpg/png/webp)');
    logger.warn('Las variantes para redes sociales no se generarán');
  }

  // Procesar otras imágenes solo con preset default
  if (images.otherImages.length > 0) {
    totalImages += images.otherImages.length;
    
    for (const image of images.otherImages) {
      const imagePath = `${images.directory}/${image}`;
      const success = await processImage(imagePath, outputDir, image, 'default', force);
      if (success) processedCount++;
      
      logger.progress(processedCount, totalImages, 'otras imágenes');
    }
  }

  return processedCount > 0;
}

/**
 * Procesar un archivo específico
 * @param {string} filePath - Ruta del archivo
 * @param {string} presetName - Preset a aplicar
 * @param {boolean} force - Forzar regeneración
 * @returns {Promise<boolean>} True si se procesó exitosamente
 */
async function processSpecificFile(filePath, presetName = 'default', force = false) {
  const fileInfo = resolveFilePath(filePath);
  
  if (!fileInfo.exists) {
    logger.error(`No se encontró el archivo: ${filePath}`);
    return false;
  }

  logger.section(`Procesando archivo específico: ${filePath}`);

  // Validar imagen
  const validation = await validateImage(fileInfo.absolutePath);
  if (!validation.valid) {
    logger.error(`Imagen inválida: ${validation.error}`);
    return false;
  }

  // Crear directorio de salida
  const outputDir = fileInfo.outputPath.split('/').slice(0, -1).join('/');
  
  // Procesar con el preset especificado
  const fileName = fileInfo.relativePath;
  return await processImage(fileInfo.absolutePath, outputDir, fileName, presetName, force);
}

/**
 * Función principal
 */
async function main() {
  // Configurar logging
  if (argv.debug) {
    setLogLevel('debug');
  }

  logger.start('Iniciando optimización de imágenes...');
  
  // Asegurar que existan los directorios
  ensureDirectories();

  try {
    // Procesar archivo específico
    if (argv.file) {
      const preset = argv.preset || 'default';
      const success = await processSpecificFile(argv.file, preset, argv.force);
      
      if (success) {
        logger.finish('Optimización de archivo específico completada');
      } else {
        logger.error('Error en la optimización del archivo');
        process.exit(1);
      }
      return;
    }

    // Procesar post específico
    if (argv.postId) {
      const success = await processPost(argv.postId, argv.force);
      
      if (success) {
        logger.finish(`Optimización del post "${argv.postId}" completada`);
      } else {
        logger.error(`Error en la optimización del post "${argv.postId}"`);
        process.exit(1);
      }
      return;
    }

    // Procesar todos los posts
    const postDirs = getPostDirectories();
    
    if (postDirs.length === 0) {
      logger.warn('No se encontraron directorios de posts en images/raw/');
      return;
    }

    logger.info(`Encontrados ${postDirs.length} directorios de posts`);

    let successCount = 0;
    for (const postId of postDirs) {
      const success = await processPost(postId, argv.force);
      if (success) successCount++;
    }

    if (successCount === postDirs.length) {
      logger.finish('Optimización de todos los posts completada');
    } else {
      logger.warn(`Se completaron ${successCount} de ${postDirs.length} posts`);
    }

  } catch (error) {
    logger.error('Error en el proceso principal', error);
    process.exit(1);
  }
}

// Ejecutar script
main().catch(error => {
  logger.error('Error fatal', error);
  process.exit(1);
});
