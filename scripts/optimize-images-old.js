#!/usr/bin/env node
/**
 * Script de optimización de imágenes para blog en Astro
 * 
 * COMANDOS DE EJEMPLO:
 * --------------------
 * 
 * 1. Optimizar todas las imágenes de todos los posts:
 *    npm run optimize-images
 * 
 * 2. Optimizar imágenes de un post específico:
 *    npm run optimize-images -- --postId=bienvenida
 * 
 * 3. Forzar regeneración de todas las imágenes:
 *    npm run optimize-images -- --force
 * 
 * 4. Optimizar una imagen específica:
 *    npm run optimize-images -- --file=images/raw/seccion/imagen.jpg
 *    (Generará: public/images/seccion/imagen.webp)
 * 
 * 5. Optimizar por slug (no implementado aún):
 *    npm run optimize-images -- --slug=bienvenida-a-mi-blog
 */

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import * as glob from 'glob';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parsear argumentos
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
  .option('slug', {
    alias: 's',
    type: 'string',
    description: 'Slug del post a procesar (alternativa a postId)'
  })
  .option('file', {
    alias: 'i',
    type: 'string',
    description: 'Ruta específica de una imagen a procesar'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Configuración de rutas
const RAW_DIR = path.join(process.cwd(), 'images', 'raw');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images');

// Presets de imágenes
const PRESETS = {
  default: { width: 1200, height: null, format: 'webp', quality: 80 },
  og: { width: 1200, height: 630, format: 'webp', quality: 80, fit: 'cover' },
  'og-jpg': { width: 1200, height: 630, format: 'jpeg', quality: 80, fit: 'cover' }, // Versión JPG para mayor compatibilidad
  thumb: { width: 600, height: 315, format: 'webp', quality: 80, fit: 'cover' },
  wsp: { width: 1080, height: 1080, format: 'webp', quality: 80, fit: 'cover' },
  'avif': { width: 1200, height: null, format: 'avif', quality: 65, fit: 'inside' },
  'og-avif': { width: 1200, height: 630, format: 'avif', quality: 65, fit: 'cover' },
  'lqip': { width: 20, height: null, format: 'webp', quality: 20, fit: 'inside' },
};

// Asegurar que existan los directorios
fs.ensureDirSync(RAW_DIR);
fs.ensureDirSync(PUBLIC_DIR);

// Función para procesar una imagen
async function processImage(sourcePath, postId, fileName, preset, presetName) {
  const outputDir = path.join(PUBLIC_DIR, postId);
  fs.ensureDirSync(outputDir);
  
  const baseName = path.basename(fileName, path.extname(fileName));
  const suffix = presetName === 'default' ? '' : `-${presetName}`;
  const outputPath = path.join(outputDir, `${baseName}${suffix}.${preset.format}`);
  
  // Verificar si la imagen ya existe y no se fuerza regeneración
  if (!argv.force && fs.existsSync(outputPath)) {
    const sourceStats = fs.statSync(sourcePath);
    const outputStats = fs.statSync(outputPath);
    
    // Si la imagen de origen no es más reciente, omitir
    if (sourceStats.mtimeMs <= outputStats.mtimeMs) {
      console.log(`Omitiendo ${baseName}${suffix}.${preset.format} (sin cambios)`);
      return;
    }
  }
  
  console.log(`Procesando ${baseName}${suffix}.${preset.format}...`);
  
  try {
    // Configurar transformación
    let transform = sharp(sourcePath).resize({
      width: preset.width,
      height: preset.height,
      fit: preset.fit || 'inside',
      withoutEnlargement: true
    });
    
    // Aplicar formato
    if (preset.format === 'webp') {
      transform = transform.webp({ quality: preset.quality });
    } else if (preset.format === 'jpeg' || preset.format === 'jpg') {
      transform = transform.jpeg({ quality: preset.quality });
    } else if (preset.format === 'png') {
      transform = transform.png({ quality: preset.quality });
    } else if (preset.format === 'avif') {
      transform = transform.avif({ quality: preset.quality });
    }
    
    // Guardar imagen
    await transform.toFile(outputPath);
    console.log(`✅ Generado: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error al procesar ${sourcePath}:`, error);
  }
}

// Función para procesar un directorio de post
async function processPostDirectory(postId) {
  const postRawDir = path.join(RAW_DIR, postId);
  
  if (!fs.existsSync(postRawDir)) {
    console.error(`❌ No se encontró el directorio para el postId "${postId}"`);
    return;
  }
  
  console.log(`\n📁 Procesando imágenes para post: ${postId}`);
  
  // Obtener todas las imágenes en el directorio
  const imageFiles = fs.readdirSync(postRawDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  
  if (imageFiles.length === 0) {
    console.log(`⚠️ No se encontraron imágenes en ${postRawDir}`);
    return;
  }
  
  console.log(`Encontradas ${imageFiles.length} imágenes`);
  
  // Verificar si existe la imagen de portada
  const portadaFile = imageFiles.find(file => file.match(/^portada\.(jpg|jpeg|png|webp)$/i));
  
  if (!portadaFile) {
    console.warn(`⚠️ No se encontró una imagen de portada (portada.jpg/png/webp) en ${postRawDir}`);
    console.warn('Las variantes para redes sociales no se generarán sin una imagen de portada.');
  } else {
    console.log(`✅ Imagen de portada encontrada: ${portadaFile}`);
    
    // Procesar la portada con todos los presets
    const portadaPath = path.join(postRawDir, portadaFile);
    for (const [presetName, preset] of Object.entries(PRESETS)) {
      await processImage(portadaPath, postId, portadaFile, preset, presetName);
    }
  }
  
  // Procesar el resto de imágenes (que no sean portada) solo con el preset default
  for (const file of imageFiles) {
    if (!file.match(/^portada\.(jpg|jpeg|png|webp)$/i)) {
      const sourcePath = path.join(postRawDir, file);
      await processImage(sourcePath, postId, file, PRESETS.default, 'default');
    }
  }
}

// Función para procesar un archivo específico
async function processSpecificFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No se encontró el archivo: ${filePath}`);
    return;
  }
  
  console.log(`\n🖼️ Procesando imagen específica: ${filePath}`);
  
  // Determinar si está dentro de la carpeta raw
  const isInRawDir = filePath.includes(RAW_DIR);
  
  // Obtener la ruta relativa
  let relativePath;
  let outputPath;
  
  if (isInRawDir) {
    // Si está en raw, mantener la estructura pero en public
    relativePath = path.relative(RAW_DIR, filePath);
    outputPath = path.join(PUBLIC_DIR, relativePath);
    
    // Cambiar la extensión a webp
    outputPath = outputPath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  } else {
    // Si no está en raw, simplemente optimizar en el mismo lugar
    relativePath = path.basename(filePath);
    outputPath = filePath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  }
  
  // Crear el directorio de salida si no existe
  fs.ensureDirSync(path.dirname(outputPath));
  
  console.log(`Generando: ${outputPath}`);
  
  try {
    // Usar el preset default para la optimización
    await sharp(filePath)
      .resize({
        width: PRESETS.default.width,
        height: PRESETS.default.height,
        fit: PRESETS.default.fit || 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: PRESETS.default.quality })
      .toFile(outputPath);
      
    console.log(`✅ Imagen optimizada guardada en: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando optimización de imágenes...');
  
  // Si se especificó un archivo específico
  if (argv.file) {
    const filePath = path.resolve(process.cwd(), argv.file);
    await processSpecificFile(filePath);
    console.log('\n✨ Proceso de optimización de archivo específico completado!');
    return;
  }
  
  // Si se especificó un postId, procesar solo ese directorio
  if (argv.postId) {
    await processPostDirectory(argv.postId);
  } 
  // Si se especificó un slug, buscar el postId correspondiente (implementación futura)
  else if (argv.slug) {
    console.log(`⚠️ La búsqueda por slug no está implementada aún. Use --postId en su lugar.`);
    // Aquí se podría implementar la búsqueda del postId a partir del slug
  } 
  // De lo contrario, procesar todos los directorios
  else {
    const postDirs = fs.readdirSync(RAW_DIR)
      .filter(item => fs.statSync(path.join(RAW_DIR, item)).isDirectory());
    
    if (postDirs.length === 0) {
      console.log('⚠️ No se encontraron directorios de posts en images/raw/');
      return;
    }
    
    console.log(`Encontrados ${postDirs.length} directorios de posts`);
    
    for (const postId of postDirs) {
      await processPostDirectory(postId);
    }
  }
  
  console.log('\n✨ Proceso de optimización completado!');
}

// Ejecutar
main().catch(err => {
  console.error('❌ Error en el proceso:', err);
  process.exit(1);
});

// Añadir esta función para generar placeholders de baja calidad
async function generateLQIP(sourcePath, outputDir, baseName) {
  const lqipPath = path.join(outputDir, `${baseName}-lqip.webp`);
  
  try {
    await sharp(sourcePath)
      .resize(20) // Muy pequeña
      .blur(5) // Aplicar desenfoque
      .webp({ quality: 20 })
      .toFile(lqipPath);
      
    console.log(`✅ Generado LQIP: ${lqipPath}`);
    
    // Opcional: convertir a base64 para inline
    const lqipBuffer = await fs.readFile(lqipPath);
    const base64 = lqipBuffer.toString('base64');
    await fs.writeFile(
      path.join(outputDir, `${baseName}-lqip.txt`),
      `data:image/webp;base64,${base64}`
    );
  } catch (error) {
    console.error(`❌ Error al generar LQIP:`, error);
  }
}
