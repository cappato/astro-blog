#!/usr/bin/env node

/**
 * Blog Image Generator
 * Genera imágenes automáticamente para posts del blog usando placeholders
 */

import fs from 'fs/promises';
import path from 'path';

// Configuración de imágenes placeholder
const PLACEHOLDER_CONFIG = {
  baseUrl: 'https://picsum.photos',
  width: 1200,
  height: 630,

  // Temas para cada post
  themes: {
    architecture: {
      seed: 'architecture',
      filter: 'grayscale',
      overlay: 'Arquitectura Modular'
    },
    seo: {
      seed: 'analytics',
      filter: 'sepia',
      overlay: 'SEO Automático'
    },
    darkmode: {
      seed: 'night',
      filter: 'dark',
      overlay: 'Dark Mode Perfecto'
    },
    testing: {
      seed: 'code',
      filter: 'tech',
      overlay: 'Testing Automatizado'
    }
  }
};

// URLs de imágenes para cada post
const IMAGE_URLS = {
  architecture: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&crop=center',
  seo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
  darkmode: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&crop=center',
  testing: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&crop=center'
};

/**
 * Descarga imagen desde URL
 */
async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));

    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return false;
  }
}

/**
 * Genera imagen para un post específico
 */
async function generateImage(postName, outputDir) {
  const imageUrl = IMAGE_URLS[postName];
  if (!imageUrl) {
    throw new Error(`URL de imagen para ${postName} no encontrada`);
  }

  // Generar en formato WebP
  const webpFilename = `${postName}-cover.webp`;
  const webpPath = path.join(outputDir, webpFilename);

  const success = await downloadImage(imageUrl, webpPath);

  if (success) {
    console.log(`✅ Generada: ${webpFilename}`);
  } else {
    console.log(`❌ Error generando: ${webpFilename}`);
  }

  return success;
}

/**
 * Función principal
 */
async function main() {
  const outputDir = 'public/images/blog';

  // Crear directorio si no existe
  await fs.mkdir(outputDir, { recursive: true });

  console.log('🎨 Descargando imágenes para blog posts...\n');

  let successCount = 0;

  // Generar imagen para cada post
  for (const postName of Object.keys(IMAGE_URLS)) {
    try {
      const success = await generateImage(postName, outputDir);
      if (success) successCount++;
    } catch (error) {
      console.error(`❌ Error generando ${postName}:`, error.message);
    }
  }

  console.log(`\n🎉 ¡${successCount}/${Object.keys(IMAGE_URLS).length} imágenes descargadas exitosamente!`);
  console.log(`📁 Ubicación: ${outputDir}`);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateImage, IMAGE_URLS };
