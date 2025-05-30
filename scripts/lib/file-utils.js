/**
 * Utilidades para manejo de archivos y directorios
 * Funciones puras para operaciones del sistema de archivos
 */

import fs from 'fs-extra';
import path from 'path';
import { PATHS, isSupportedImage, isCoverImage } from './presets.js';

/**
 * Obtener rutas absolutas del proyecto
 * @param {string} cwd - Directorio de trabajo actual
 * @returns {Object} Objeto con rutas absolutas
 */
export function getProjectPaths(cwd = process.cwd()) {
  return {
    rawDir: path.join(cwd, PATHS.RAW_DIR),
    publicDir: path.join(cwd, PATHS.PUBLIC_DIR)
  };
}

/**
 * Asegurar que existan los directorios necesarios
 * @param {string} cwd - Directorio de trabajo actual
 */
export function ensureDirectories(cwd = process.cwd()) {
  const { rawDir, publicDir } = getProjectPaths(cwd);
  fs.ensureDirSync(rawDir);
  fs.ensureDirSync(publicDir);
}

/**
 * Obtener todos los directorios de posts
 * @param {string} cwd - Directorio de trabajo actual
 * @returns {string[]} Array con nombres de directorios de posts
 */
export function getPostDirectories(cwd = process.cwd()) {
  const { rawDir } = getProjectPaths(cwd);
  
  if (!fs.existsSync(rawDir)) {
    return [];
  }
  
  return fs.readdirSync(rawDir)
    .filter(item => fs.statSync(path.join(rawDir, item)).isDirectory());
}

/**
 * Obtener archivos de imagen en un directorio de post
 * @param {string} postId - ID del post
 * @param {string} cwd - Directorio de trabajo actual
 * @returns {Object} Objeto con archivos de imagen categorizados
 */
export function getPostImages(postId, cwd = process.cwd()) {
  const { rawDir } = getProjectPaths(cwd);
  const postRawDir = path.join(rawDir, postId);
  
  if (!fs.existsSync(postRawDir)) {
    return {
      exists: false,
      coverImage: null,
      otherImages: [],
      allImages: []
    };
  }
  
  const allFiles = fs.readdirSync(postRawDir);
  const imageFiles = allFiles.filter(isSupportedImage);
  
  const coverImage = imageFiles.find(isCoverImage);
  const otherImages = imageFiles.filter(file => !isCoverImage(file));
  
  return {
    exists: true,
    coverImage,
    otherImages,
    allImages: imageFiles,
    directory: postRawDir
  };
}

/**
 * Verificar si un archivo necesita ser procesado
 * @param {string} sourcePath - Ruta del archivo fuente
 * @param {string} outputPath - Ruta del archivo de salida
 * @param {boolean} force - Forzar regeneración
 * @returns {boolean} True si necesita procesamiento
 */
export function needsProcessing(sourcePath, outputPath, force = false) {
  if (force) {
    return true;
  }
  
  if (!fs.existsSync(outputPath)) {
    return true;
  }
  
  const sourceStats = fs.statSync(sourcePath);
  const outputStats = fs.statSync(outputPath);
  
  // Si el archivo fuente es más reciente, necesita procesamiento
  return sourceStats.mtimeMs > outputStats.mtimeMs;
}

/**
 * Crear directorio de salida para un post
 * @param {string} postId - ID del post
 * @param {string} cwd - Directorio de trabajo actual
 * @returns {string} Ruta del directorio de salida
 */
export function createOutputDirectory(postId, cwd = process.cwd()) {
  const { publicDir } = getProjectPaths(cwd);
  const outputDir = path.join(publicDir, postId);
  fs.ensureDirSync(outputDir);
  return outputDir;
}

/**
 * Resolver ruta de archivo específico
 * @param {string} filePath - Ruta del archivo (puede ser relativa)
 * @param {string} cwd - Directorio de trabajo actual
 * @returns {Object} Información sobre el archivo
 */
export function resolveFilePath(filePath, cwd = process.cwd()) {
  const { rawDir, publicDir } = getProjectPaths(cwd);
  const absolutePath = path.resolve(cwd, filePath);
  
  if (!fs.existsSync(absolutePath)) {
    return {
      exists: false,
      absolutePath,
      isInRawDir: false,
      relativePath: null,
      outputPath: null
    };
  }
  
  const isInRawDir = absolutePath.includes(rawDir);
  let relativePath;
  let outputPath;
  
  if (isInRawDir) {
    // Si está en raw, mantener estructura en public
    relativePath = path.relative(rawDir, absolutePath);
    outputPath = path.join(publicDir, relativePath);
    // Cambiar extensión a webp
    outputPath = outputPath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  } else {
    // Si no está en raw, optimizar en el mismo lugar
    relativePath = path.basename(absolutePath);
    outputPath = absolutePath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  }
  
  return {
    exists: true,
    absolutePath,
    isInRawDir,
    relativePath,
    outputPath
  };
}

/**
 * Obtener información de un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {Object} Información del archivo
 */
export function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const parsed = path.parse(filePath);
  
  return {
    path: filePath,
    name: parsed.name,
    ext: parsed.ext,
    base: parsed.base,
    dir: parsed.dir,
    size: stats.size,
    modified: stats.mtime,
    isImage: isSupportedImage(parsed.base),
    isCover: isCoverImage(parsed.base)
  };
}

/**
 * Limpiar archivos antiguos en directorio de salida
 * @param {string} outputDir - Directorio de salida
 * @param {string[]} expectedFiles - Archivos que deberían existir
 */
export function cleanupOldFiles(outputDir, expectedFiles = []) {
  if (!fs.existsSync(outputDir)) {
    return;
  }
  
  const existingFiles = fs.readdirSync(outputDir);
  const filesToDelete = existingFiles.filter(file => !expectedFiles.includes(file));
  
  filesToDelete.forEach(file => {
    const filePath = path.join(outputDir, file);
    try {
      fs.removeSync(filePath);
      console.log(`🗑️ Eliminado archivo obsoleto: ${file}`);
    } catch (error) {
      console.warn(`⚠️ No se pudo eliminar ${file}:`, error.message);
    }
  });
}
