#!/usr/bin/env node

/**
 * Implementación de Series Detectadas
 * Actualiza el frontmatter de los posts basado en la auditoría de contenido
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuración
const BLOG_DIR = path.join(rootDir, 'src/content/blog');

// Series detectadas en la auditoría
const DETECTED_SERIES = {
  'protocolos-automaticos': {
    name: 'Protocolos Automáticos',
    description: 'Serie sobre implementación de protocolos automáticos en desarrollo',
    posts: [
      {
        postId: 'protocolos-automaticos-ia-arquitectura',
        title: 'El Problema de los Protocolos que se Olvidan',
        order: 1,
        date: '2024-11-27'
      },
      {
        postId: 'anatomia-sistema-protocolos-automaticos',
        title: 'Anatomía de un Sistema de Protocolos Automáticos',
        order: 2,
        date: '2024-11-28'
      },
      {
        postId: 'auto-merge-inteligente-ux-control',
        title: 'Auto-Merge Inteligente: UX sobre Control',
        order: 3,
        date: '2024-11-29' // Corregida para orden lógico
      },
      {
        postId: 'migracion-sistemas-preservando-vision',
        title: 'Migración de Sistemas: Preservando la Visión',
        order: 4,
        date: '2024-11-30' // Corregida para orden lógico
      }
    ]
  },
  
  'deploy-wrangler': {
    name: 'Deploy Automático con Wrangler',
    description: 'Serie completa sobre deploy automático con Wrangler y GitHub Actions',
    posts: [
      {
        postId: 'configurar-wrangler-cloudflare-pages-2024',
        title: 'Configurar Wrangler y Cloudflare Pages: Guía Completa 2024',
        order: 1,
        date: '2024-05-05'
      },
      {
        postId: 'github-actions-deploy-automatico-wrangler',
        title: 'GitHub Actions para Deploy Automático: CI/CD con Wrangler',
        order: 2,
        date: '2024-05-10'
      },
      {
        postId: 'troubleshooting-wrangler-wsl-deploy',
        title: 'Troubleshooting Wrangler: Soluciones para WSL y Deploy Issues',
        order: 3,
        date: '2024-05-15' // Corregida para orden lógico
      }
    ],
    indexPost: {
      postId: 'deploy-automatico-wrangler-github-actions',
      title: 'Deploy Automático con Wrangler y GitHub Actions: Serie Completa',
      order: 0, // Post índice
      date: '2024-05-20' // Después de la serie
    }
  }
};

/**
 * Leer archivo de post
 */
async function readPost(postId) {
  try {
    const filePath = path.join(BLOG_DIR, `${postId}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar frontmatter de un post
 */
function updateFrontmatter(content, seriesId, seriesConfig, postConfig) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    console.log(`   ⚠️  No se encontró frontmatter válido`);
    return content;
  }
  
  let frontmatter = frontmatterMatch[1];
  const bodyContent = content.slice(frontmatterMatch[0].length);
  
  // Actualizar fecha si es necesario
  const datePattern = /date:\s*["']([^"']+)["']/;
  if (datePattern.test(frontmatter)) {
    frontmatter = frontmatter.replace(datePattern, `date: "${postConfig.date}"`);
  } else {
    frontmatter += `\ndate: "${postConfig.date}"`;
  }
  
  // Agregar campos de serie
  const seriesFields = `
# Serie
series: "${seriesId}"
seriesName: "${seriesConfig.name}"
seriesDescription: "${seriesConfig.description}"
seriesOrder: ${postConfig.order}
seriesTotal: ${seriesConfig.posts.length}`;

  // Verificar si ya existen campos de serie
  if (frontmatter.includes('series:')) {
    // Reemplazar campos existentes
    frontmatter = frontmatter.replace(/series:.*$/gm, '');
    frontmatter = frontmatter.replace(/seriesName:.*$/gm, '');
    frontmatter = frontmatter.replace(/seriesDescription:.*$/gm, '');
    frontmatter = frontmatter.replace(/seriesOrder:.*$/gm, '');
    frontmatter = frontmatter.replace(/seriesTotal:.*$/gm, '');
    frontmatter = frontmatter.replace(/\n\s*\n/g, '\n'); // Limpiar líneas vacías
  }
  
  frontmatter += seriesFields;
  
  return `---\n${frontmatter}\n---${bodyContent}`;
}

/**
 * Crear backup de un archivo
 */
async function createBackup(filePath) {
  try {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    const content = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, content);
    return { success: true, backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Implementar una serie
 */
async function implementSeries(seriesId, seriesConfig) {
  console.log(`\n📚 Implementando serie: "${seriesConfig.name}"`);
  console.log(`   Posts en la serie: ${seriesConfig.posts.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Procesar posts de la serie
  for (const postConfig of seriesConfig.posts) {
    console.log(`\n   📝 Procesando: "${postConfig.title}"`);
    console.log(`      PostId: ${postConfig.postId}`);
    console.log(`      Orden: ${postConfig.order}/${seriesConfig.posts.length}`);
    
    // Leer post
    const readResult = await readPost(postConfig.postId);
    if (!readResult.success) {
      console.log(`      ❌ Error leyendo archivo: ${readResult.error}`);
      errorCount++;
      continue;
    }
    
    // Crear backup
    const backupResult = await createBackup(readResult.filePath);
    if (!backupResult.success) {
      console.log(`      ⚠️  No se pudo crear backup: ${backupResult.error}`);
    } else {
      console.log(`      💾 Backup creado: ${path.basename(backupResult.backupPath)}`);
    }
    
    // Actualizar frontmatter
    const updatedContent = updateFrontmatter(
      readResult.content,
      seriesId,
      seriesConfig,
      postConfig
    );
    
    // Escribir archivo actualizado
    try {
      await fs.writeFile(readResult.filePath, updatedContent);
      console.log(`      ✅ Frontmatter actualizado`);
      successCount++;
    } catch (error) {
      console.log(`      ❌ Error escribiendo archivo: ${error.message}`);
      errorCount++;
    }
  }
  
  // Procesar post índice si existe
  if (seriesConfig.indexPost) {
    console.log(`\n   📖 Procesando post índice: "${seriesConfig.indexPost.title}"`);
    
    const readResult = await readPost(seriesConfig.indexPost.postId);
    if (readResult.success) {
      const backupResult = await createBackup(readResult.filePath);
      if (backupResult.success) {
        console.log(`      💾 Backup creado: ${path.basename(backupResult.backupPath)}`);
      }
      
      const updatedContent = updateFrontmatter(
        readResult.content,
        seriesId,
        seriesConfig,
        seriesConfig.indexPost
      );
      
      try {
        await fs.writeFile(readResult.filePath, updatedContent);
        console.log(`      ✅ Post índice actualizado`);
        successCount++;
      } catch (error) {
        console.log(`      ❌ Error actualizando post índice: ${error.message}`);
        errorCount++;
      }
    } else {
      console.log(`      ❌ Error leyendo post índice: ${readResult.error}`);
      errorCount++;
    }
  }
  
  console.log(`\n   📊 Resultado serie "${seriesConfig.name}":`);
  console.log(`      ✅ Exitosos: ${successCount}`);
  console.log(`      ❌ Errores: ${errorCount}`);
  
  return { successCount, errorCount };
}

/**
 * Generar reporte de implementación
 */
function generateImplementationReport(results) {
  console.log('\n📊 REPORTE DE IMPLEMENTACIÓN');
  console.log('='.repeat(50));
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  Object.entries(results).forEach(([seriesId, result]) => {
    totalSuccess += result.successCount;
    totalErrors += result.errorCount;
  });
  
  console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
  console.log(`   • Series implementadas: ${Object.keys(results).length}`);
  console.log(`   • Posts actualizados: ${totalSuccess}`);
  console.log(`   • Errores: ${totalErrors}`);
  
  console.log(`\n📚 SERIES CONFIGURADAS:`);
  Object.entries(DETECTED_SERIES).forEach(([seriesId, config]) => {
    const totalPosts = config.posts.length + (config.indexPost ? 1 : 0);
    console.log(`   • "${config.name}": ${totalPosts} posts`);
    console.log(`     ID: ${seriesId}`);
    console.log(`     Posts: ${config.posts.length} + ${config.indexPost ? '1 índice' : '0 índice'}`);
  });
  
  console.log(`\n🔧 CAMPOS AGREGADOS AL FRONTMATTER:`);
  console.log(`   • series: ID de la serie`);
  console.log(`   • seriesName: Nombre legible de la serie`);
  console.log(`   • seriesDescription: Descripción de la serie`);
  console.log(`   • seriesOrder: Orden del post en la serie`);
  console.log(`   • seriesTotal: Total de posts en la serie`);
  
  console.log(`\n📅 FECHAS CORREGIDAS:`);
  console.log(`   • Serie "Protocolos Automáticos": Orden cronológico lógico`);
  console.log(`   • Serie "Deploy Wrangler": Troubleshooting al final`);
  
  console.log(`\n📋 PRÓXIMOS PASOS:`);
  console.log(`   1. Verificar frontmatter actualizado en posts`);
  console.log(`   2. Crear componente SeriesNavigation.astro`);
  console.log(`   3. Implementar navegación en layouts`);
  console.log(`   4. Probar sistema de series en desarrollo`);
  console.log(`   5. Eliminar backups si todo funciona correctamente`);
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando implementación de series detectadas...\n');
  
  try {
    const results = {};
    
    // Implementar cada serie
    for (const [seriesId, seriesConfig] of Object.entries(DETECTED_SERIES)) {
      const result = await implementSeries(seriesId, seriesConfig);
      results[seriesId] = result;
    }
    
    // Generar reporte
    generateImplementationReport(results);
    
    const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.successCount, 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errorCount, 0);
    
    if (totalErrors === 0) {
      console.log('\n✅ IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE');
      console.log(`\n${totalSuccess} posts actualizados con información de series.`);
      console.log('El sistema de series está listo para usar.');
    } else {
      console.log('\n⚠️  IMPLEMENTACIÓN COMPLETADA CON ERRORES');
      console.log(`${totalSuccess} posts exitosos, ${totalErrors} errores.`);
      console.log('Revisar errores arriba y corregir manualmente si es necesario.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la implementación:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
