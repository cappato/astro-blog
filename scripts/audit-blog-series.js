#!/usr/bin/env node

/**
 * Auditoría de Series del Blog
 * Analiza el contenido de los posts para detectar referencias cruzadas
 * y determinar series reales basadas en el texto
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuración
const BLOG_DIR = path.join(rootDir, 'src/content/blog');

// Patrones de búsqueda para detectar series
const SERIES_PATTERNS = {
  // Referencias a series
  series: [
    /en esta serie/gi,
    /esta serie de/gi,
    /serie sobre/gi,
    /serie de posts/gi,
    /serie completa/gi,
    /primera parte/gi,
    /segunda parte/gi,
    /tercera parte/gi,
    /cuarta parte/gi,
    /parte \d+/gi,
    /capítulo \d+/gi
  ],
  
  // Referencias a posts anteriores/siguientes
  navigation: [
    /en el post anterior/gi,
    /post anterior/gi,
    /artículo anterior/gi,
    /en el siguiente post/gi,
    /próximo post/gi,
    /siguiente artículo/gi,
    /como vimos en/gi,
    /como mencioné en/gi,
    /continuando con/gi,
    /siguiendo con/gi
  ],
  
  // Referencias específicas a otros posts
  references: [
    /\[.*?\]\(.*?\.md\)/gi,  // Links markdown internos
    /href=".*?"/gi,          // Links HTML
    /ver post/gi,
    /revisar el post/gi,
    /en mi post sobre/gi,
    /escribí sobre/gi
  ]
};

/**
 * Leer y analizar un post
 */
async function analyzePost(postPath) {
  try {
    const content = await fs.readFile(postPath, 'utf-8');
    const fileName = path.basename(postPath, '.md');
    
    // Extraer frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const bodyContent = frontmatterMatch 
      ? content.slice(frontmatterMatch[0].length)
      : content;
    
    const metadata = {};
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
      const dateMatch = frontmatter.match(/date:\s*["']([^"']+)["']/);
      const postIdMatch = frontmatter.match(/postId:\s*["']([^"']+)["']/);
      
      metadata.title = titleMatch ? titleMatch[1] : fileName;
      metadata.date = dateMatch ? dateMatch[1] : 'Sin fecha';
      metadata.postId = postIdMatch ? postIdMatch[1] : fileName;
    }
    
    // Buscar patrones de series
    const seriesMatches = [];
    const navigationMatches = [];
    const referenceMatches = [];
    
    // Analizar cada tipo de patrón
    SERIES_PATTERNS.series.forEach(pattern => {
      const matches = [...bodyContent.matchAll(pattern)];
      matches.forEach(match => {
        seriesMatches.push({
          pattern: pattern.source,
          match: match[0],
          context: extractContext(bodyContent, match.index, 100)
        });
      });
    });
    
    SERIES_PATTERNS.navigation.forEach(pattern => {
      const matches = [...bodyContent.matchAll(pattern)];
      matches.forEach(match => {
        navigationMatches.push({
          pattern: pattern.source,
          match: match[0],
          context: extractContext(bodyContent, match.index, 100)
        });
      });
    });
    
    SERIES_PATTERNS.references.forEach(pattern => {
      const matches = [...bodyContent.matchAll(pattern)];
      matches.forEach(match => {
        referenceMatches.push({
          pattern: pattern.source,
          match: match[0],
          context: extractContext(bodyContent, match.index, 80)
        });
      });
    });
    
    return {
      fileName,
      metadata,
      analysis: {
        seriesMatches,
        navigationMatches,
        referenceMatches,
        totalMatches: seriesMatches.length + navigationMatches.length + referenceMatches.length
      },
      content: {
        length: content.length,
        bodyLength: bodyContent.length
      }
    };
    
  } catch (error) {
    return {
      fileName: path.basename(postPath, '.md'),
      error: error.message,
      analysis: { seriesMatches: [], navigationMatches: [], referenceMatches: [], totalMatches: 0 }
    };
  }
}

/**
 * Extraer contexto alrededor de una coincidencia
 */
function extractContext(text, index, contextLength = 100) {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + contextLength);
  const context = text.slice(start, end);
  
  // Limpiar saltos de línea y espacios extra
  return context.replace(/\s+/g, ' ').trim();
}

/**
 * Detectar series basadas en análisis de contenido
 */
function detectSeriesFromContent(posts) {
  const potentialSeries = new Map();
  const navigationRelations = [];
  
  posts.forEach(post => {
    // Analizar referencias de navegación
    post.analysis.navigationMatches.forEach(match => {
      navigationRelations.push({
        post: post.metadata.title,
        postId: post.metadata.postId,
        date: post.metadata.date,
        type: 'navigation',
        match: match.match,
        context: match.context
      });
    });
    
    // Analizar menciones de series
    post.analysis.seriesMatches.forEach(match => {
      const seriesKey = `series_${post.metadata.postId}`;
      
      if (!potentialSeries.has(seriesKey)) {
        potentialSeries.set(seriesKey, {
          basedOn: post.metadata.title,
          posts: [],
          evidence: []
        });
      }
      
      potentialSeries.get(seriesKey).evidence.push({
        match: match.match,
        context: match.context
      });
    });
  });
  
  return {
    potentialSeries: Array.from(potentialSeries.entries()),
    navigationRelations
  };
}

/**
 * Generar reporte de auditoría
 */
function generateAuditReport(posts, seriesAnalysis) {
  console.log('📋 AUDITORÍA DE SERIES DEL BLOG');
  console.log('='.repeat(50));
  
  // Estadísticas generales
  const postsWithReferences = posts.filter(p => p.analysis.totalMatches > 0);
  const postsWithSeries = posts.filter(p => p.analysis.seriesMatches.length > 0);
  const postsWithNavigation = posts.filter(p => p.analysis.navigationMatches.length > 0);
  
  console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
  console.log(`   • Posts analizados: ${posts.length}`);
  console.log(`   • Posts con referencias: ${postsWithReferences.length}`);
  console.log(`   • Posts con menciones de serie: ${postsWithSeries.length}`);
  console.log(`   • Posts con navegación: ${postsWithNavigation.length}`);
  
  // Posts con menciones de series
  if (postsWithSeries.length > 0) {
    console.log(`\n📚 POSTS CON MENCIONES DE SERIES:`);
    postsWithSeries.forEach(post => {
      console.log(`\n   📖 "${post.metadata.title}"`);
      console.log(`      ID: ${post.metadata.postId}`);
      console.log(`      Fecha: ${post.metadata.date}`);
      console.log(`      Menciones encontradas:`);
      
      post.analysis.seriesMatches.forEach((match, index) => {
        console.log(`      ${index + 1}. "${match.match}"`);
        console.log(`         Contexto: "${match.context}"`);
      });
    });
  }
  
  // Posts con navegación
  if (postsWithNavigation.length > 0) {
    console.log(`\n🧭 POSTS CON NAVEGACIÓN ENTRE POSTS:`);
    postsWithNavigation.forEach(post => {
      console.log(`\n   📖 "${post.metadata.title}"`);
      console.log(`      ID: ${post.metadata.postId}`);
      console.log(`      Fecha: ${post.metadata.date}`);
      console.log(`      Referencias encontradas:`);
      
      post.analysis.navigationMatches.forEach((match, index) => {
        console.log(`      ${index + 1}. "${match.match}"`);
        console.log(`         Contexto: "${match.context}"`);
      });
    });
  }
  
  // Relaciones de navegación
  if (seriesAnalysis.navigationRelations.length > 0) {
    console.log(`\n🔗 RELACIONES DE NAVEGACIÓN DETECTADAS:`);
    seriesAnalysis.navigationRelations.forEach((relation, index) => {
      console.log(`\n   ${index + 1}. Post: "${relation.post}"`);
      console.log(`      Tipo: ${relation.type}`);
      console.log(`      Referencia: "${relation.match}"`);
      console.log(`      Contexto: "${relation.context}"`);
    });
  }
  
  // Recomendaciones
  console.log(`\n💡 RECOMENDACIONES:`);
  
  if (postsWithSeries.length > 0) {
    console.log(`   🔧 ${postsWithSeries.length} posts mencionan series - Revisar para agrupar`);
  }
  
  if (postsWithNavigation.length > 0) {
    console.log(`   🔧 ${postsWithNavigation.length} posts tienen navegación - Identificar orden`);
  }
  
  if (postsWithReferences.length === 0) {
    console.log(`   ✅ No se detectaron series explícitas en el contenido`);
  }
  
  console.log(`\n📋 PRÓXIMOS PASOS:`);
  console.log(`   1. Revisar manualmente los posts con menciones de series`);
  console.log(`   2. Identificar el orden correcto basado en fechas y referencias`);
  console.log(`   3. Actualizar frontmatter con campos de serie`);
  console.log(`   4. Implementar navegación entre posts relacionados`);
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Iniciando auditoría de series del blog...\n');
  
  try {
    // 1. Leer todos los posts
    const postFiles = await fs.readdir(BLOG_DIR);
    const markdownFiles = postFiles.filter(file => file.endsWith('.md'));
    
    console.log(`📝 Analizando ${markdownFiles.length} posts...`);
    
    // 2. Analizar cada post
    const posts = [];
    for (const file of markdownFiles) {
      const postPath = path.join(BLOG_DIR, file);
      const analysis = await analyzePost(postPath);
      posts.push(analysis);
    }
    
    console.log(`   ✅ Análisis completado\n`);
    
    // 3. Detectar series basadas en contenido
    const seriesAnalysis = detectSeriesFromContent(posts);
    
    // 4. Generar reporte
    generateAuditReport(posts, seriesAnalysis);
    
    console.log('\n✅ Auditoría completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la auditoría:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
