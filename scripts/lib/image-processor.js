/**
 * Image processor using Sharp
 * Pure functions for image transformation and optimization
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { generateOutputFilename, IMAGE_CONFIG, SUPPORTED_EXTENSIONS } from './presets.js';

/**
 * Process an image with a specific preset
 * @param {string} sourcePath - Source image path
 * @param {string} outputDir - Output directory
 * @param {string} fileName - File name
 * @param {Object} preset - Preset configuration
 * @param {string} presetName - Preset name
 * @returns {Promise<Object>} Processing result
 */
export async function processImageWithPreset(sourcePath, outputDir, fileName, preset, presetName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const outputFileName = generateOutputFilename(baseName, presetName, preset.format);
  const outputPath = path.join(outputDir, outputFileName);

  try {
    // Configure base transformation
    let transform = sharp(sourcePath).resize({
      width: preset.width,
      height: preset.height,
      fit: preset.fit || 'inside',
      withoutEnlargement: true
    });

    // Apply specific format
    transform = applyFormat(transform, preset.format, preset.quality);

    // Save image
    await transform.toFile(outputPath);

    // Get generated file information
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
 * Apply specific format to Sharp transformation
 * @param {Object} transform - Sharp instance
 * @param {string} format - Desired format
 * @param {number} quality - Compression quality
 * @returns {Object} Transformation with applied format
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
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Generate Low Quality Image Placeholder (LQIP)
 * @param {string} sourcePath - Source image path
 * @param {string} outputDir - Output directory
 * @param {string} baseName - Base file name
 * @returns {Promise<Object>} Generation result
 */
export async function generateLQIP(sourcePath, outputDir, baseName) {
  const lqipPath = path.join(outputDir, `${baseName}-lqip.webp`);
  const base64Path = path.join(outputDir, `${baseName}-lqip.txt`);

  try {
    // Generate LQIP image using centralized configuration
    await sharp(sourcePath)
      .resize(IMAGE_CONFIG.LQIP.width) // Very small
      .blur(IMAGE_CONFIG.LQIP.blur) // Apply blur
      .webp({ quality: IMAGE_CONFIG.LQIP.quality })
      .toFile(lqipPath);

    // Generate base64 version for inline use
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
