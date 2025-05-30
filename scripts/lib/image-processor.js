/**
 * Procesador de imágenes usando Sharp
 * Funciones puras para transformación y optimización de imágenes
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { generateOutputFilename } from './presets.js';

/**
 * Procesar una imagen con un preset específico
 * @param {string} sourcePath - Ruta de la imagen fuente
 * @param {string} outputDir - Directorio de salida
 * @param {string} fileName - Nombre del archivo
 * @param {Object} preset - Configuración del preset
 * @param {string} presetName - Nombre del preset
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export async function processImageWithPreset(sourcePath, outputDir, fileName, preset, presetName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const outputFileName = generateOutputFilename(baseName, presetName, preset.format);
  const outputPath = path.join(outputDir, outputFileName);
  
  try {
    // Configurar transformación base
    let transform = sharp(sourcePath).resize({
      width: preset.width,
      height: preset.height,
      fit: preset.fit || 'inside',
      withoutEnlargement: true
    });
    
    // Aplicar formato específico
    transform = applyFormat(transform, preset.format, preset.quality);
    
    // Guardar imagen
    await transform.toFile(outputPath);
    
    // Obtener información del archivo generado
    const stats = fs.statSync(outputPath);
    
    return {
      success: true,
      outputPath,
      outputFileName,
      preset: presetName,
      format: preset.format,
      size: stats.size,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      outputPath,
      outputFileName,
      preset: presetName,
      format: preset.format,
      size: 0,
      error: error.message
    };
  }
}

/**
 * Aplicar formato específico a la transformación Sharp
 * @param {Object} transform - Instancia de Sharp
 * @param {string} format - Formato deseado
 * @param {number} quality - Calidad de compresión
 * @returns {Object} Transformación con formato aplicado
 */
function applyFormat(transform, format, quality) {
  switch (format.toLowerCase()) {
    case 'webp':
      return transform.webp({ quality });
    
    case 'jpeg':
    case 'jpg':
      return transform.jpeg({ quality });
    
    case 'png':
      return transform.png({ 
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    
    case 'avif':
      return transform.avif({ quality });
    
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}

/**
 * Generar placeholder de baja calidad (LQIP)
 * @param {string} sourcePath - Ruta de la imagen fuente
 * @param {string} outputDir - Directorio de salida
 * @param {string} baseName - Nombre base del archivo
 * @returns {Promise<Object>} Resultado de la generación
 */
export async function generateLQIP(sourcePath, outputDir, baseName) {
  const lqipPath = path.join(outputDir, `${baseName}-lqip.webp`);
  const base64Path = path.join(outputDir, `${baseName}-lqip.txt`);
  
  try {
    // Generar imagen LQIP
    await sharp(sourcePath)
      .resize(20) // Muy pequeña
      .blur(5) // Aplicar desenfoque
      .webp({ quality: 20 })
      .toFile(lqipPath);
    
    // Generar versión base64 para inline
    const lqipBuffer = await fs.readFile(lqipPath);
    const base64 = lqipBuffer.toString('base64');
    const dataUri = `data:image/webp;base64,${base64}`;
    
    await fs.writeFile(base64Path, dataUri);
    
    return {
      success: true,
      lqipPath,
      base64Path,
      dataUri,
      size: lqipBuffer.length,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      lqipPath,
      base64Path,
      dataUri: null,
      size: 0,
      error: error.message
    };
  }
}

/**
 * Obtener metadatos de una imagen
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<Object>} Metadatos de la imagen
 */
export async function getImageMetadata(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    
    return {
      success: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasProfile: metadata.hasProfile,
      hasAlpha: metadata.hasAlpha,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      width: 0,
      height: 0,
      format: null,
      error: error.message
    };
  }
}

/**
 * Validar que una imagen se puede procesar
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<Object>} Resultado de la validación
 */
export async function validateImage(imagePath) {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(imagePath)) {
      return {
        valid: false,
        error: 'El archivo no existe'
      };
    }
    
    // Intentar leer metadatos
    const metadata = await getImageMetadata(imagePath);
    
    if (!metadata.success) {
      return {
        valid: false,
        error: `No se pueden leer los metadatos: ${metadata.error}`
      };
    }
    
    // Verificar dimensiones mínimas
    if (metadata.width < 10 || metadata.height < 10) {
      return {
        valid: false,
        error: 'La imagen es demasiado pequeña (mínimo 10x10px)'
      };
    }
    
    // Verificar formato soportado
    const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];
    if (!supportedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Formato no soportado: ${metadata.format}`
      };
    }
    
    return {
      valid: true,
      metadata,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Calcular dimensiones optimizadas manteniendo aspect ratio
 * @param {number} originalWidth - Ancho original
 * @param {number} originalHeight - Alto original
 * @param {number} maxWidth - Ancho máximo deseado
 * @param {number} maxHeight - Alto máximo deseado (opcional)
 * @returns {Object} Dimensiones optimizadas
 */
export function calculateOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight = null) {
  if (!maxHeight) {
    // Solo redimensionar por ancho manteniendo aspect ratio
    const ratio = originalWidth / originalHeight;
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.round(Math.min(originalWidth, maxWidth) / ratio)
    };
  }
  
  // Redimensionar manteniendo aspect ratio dentro de los límites
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}
