#!/usr/bin/env node

/**
 * Blog Automation System
 * Sistema completo de automatización para creación y gestión de posts
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Para importar el motor de similitud
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuración
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// Límites para división de posts
const WORD_LIMITS = {
  SHORT: 600,      // Post corto ideal
  MEDIUM: 1000,    // Post medio ideal  
  LONG: 1500,      // Límite antes de considerar división
  VERY_LONG: 2000  // División obligatoria
};

/**
 * Función principal
 */
async function main() {
  console.log('🤖 Blog Automation System\n');
  
  const action = await askQuestion(`¿Qué quieres hacer?
1. 📝 Crear nuevo post desde cero
2. 📄 Crear post desde archivo existente
3. 🔍 Analizar post existente (longitud, SEO, etc.)
4. 🖼️ Generar solo imágenes para post existente
5. 🔗 Analizar y sugerir relaciones (tags, pilares)
6. ✂️ Dividir post largo en serie
7. 🧪 Ejecutar tests completos
8. 📊 Reporte completo del blog
9. 🎯 Preview de posts relacionados para post existente

Elige (1-9): `);
  
  switch(action) {
    case '1':
      await createNewPost();
      break;
    case '2':
      await createFromExistingFile();
      break;
    case '3':
      await analyzeExistingPost();
      break;
    case '4':
      await generateImagesOnly();
      break;
    case '5':
      await analyzeRelationships();
      break;
    case '6':
      await divideLongPost();
      break;
    case '7':
      await runCompleteTests();
      break;
    case '8':
      await generateBlogReport();
      break;
    default:
      console.log('Opción no válida');
  }
  
  rl.close();
}

/**
 * Crear nuevo post desde cero
 */
async function createNewPost() {
  console.log('\n📝 Creando nuevo post desde cero...\n');
  
  const title = await askQuestion('Título del post: ');
  const description = await askQuestion('Descripción (120-160 chars): ');
  const tags = await askQuestion('Tags (separados por comas): ');
  const postId = await askQuestion(`PostId sugerido: ${generatePostId(title)} (Enter para usar o escribir otro): `) || generatePostId(title);
  
  // Verificar que el postId no existe
  if (fs.existsSync(`src/content/blog/${postId}.md`)) {
    console.log('❌ Error: Ya existe un post con ese ID');
    return;
  }
  
  // Crear contenido del post
  const frontmatter = generateFrontmatter({
    title,
    description,
    date: CURRENT_DATE,
    author: 'Matías Cappato',
    tags: tags.split(',').map(t => t.trim()),
    postId,
    imageAlt: `${title} - Guía completa`
  });
  
  const content = `${frontmatter}

${description}

## 🎯 Lo que vas a lograr

Al final de esta guía tendrás:

- ✅ [Objetivo 1]
- ✅ [Objetivo 2]
- ✅ [Objetivo 3]

## 📋 Prerrequisitos

Antes de empezar necesitas:

- [Prerrequisito 1]
- [Prerrequisito 2]

## 🚀 Paso 1: [Primer Paso]

[Contenido del primer paso]

## 🔧 Paso 2: [Segundo Paso]

[Contenido del segundo paso]

## ✅ Verificación

[Cómo verificar que todo funciona]

## 🎯 Próximos Pasos

[Qué hacer después]

---

**¿Te ha resultado útil esta guía?** ¡Compártela y déjanos tus comentarios!`;

  // Escribir archivo
  fs.writeFileSync(`src/content/blog/${postId}.md`, content);
  console.log(`✅ Post creado: src/content/blog/${postId}.md`);
  
  // Preguntar si quiere generar imágenes
  const generateImages = await askQuestion('¿Generar imágenes automáticamente? (y/n): ');
  if (generateImages.toLowerCase() === 'y') {
    await generateImagesForPost(postId);
  }
  
  // Ejecutar tests
  console.log('\n🧪 Ejecutando tests...');
  try {
    execSync('npm run test:blog', { stdio: 'inherit' });
    console.log('✅ Tests pasaron correctamente');
  } catch (error) {
    console.log('❌ Tests fallaron - revisar errores arriba');
  }
}

/**
 * Crear post desde archivo existente
 */
async function createFromExistingFile() {
  console.log('\n📄 Creando post desde archivo existente...\n');
  
  const filePath = await askQuestion('Ruta del archivo .md existente: ');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Error: Archivo no encontrado');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Analizar contenido
  const analysis = analyzeContent(content);
  console.log('\n📊 Análisis del contenido:');
  console.log(`- Palabras: ${analysis.wordCount}`);
  console.log(`- Tiempo de lectura: ~${analysis.readingTime} minutos`);
  console.log(`- Recomendación: ${analysis.recommendation}`);
  
  if (analysis.wordCount > WORD_LIMITS.LONG) {
    const divide = await askQuestion('\n⚠️ El post es largo. ¿Dividir en serie? (y/n): ');
    if (divide.toLowerCase() === 'y') {
      await divideLongPostFromContent(content);
      return;
    }
  }
  
  // Continuar con post único
  const title = await askQuestion('Título del post: ');
  const description = await askQuestion('Descripción (120-160 chars): ');
  const tags = await askQuestion('Tags (separados por comas): ');
  const postId = await askQuestion(`PostId sugerido: ${generatePostId(title)} (Enter para usar): `) || generatePostId(title);
  
  // Generar frontmatter y combinar
  const frontmatter = generateFrontmatter({
    title,
    description,
    date: CURRENT_DATE,
    author: 'Matías Cappato',
    tags: tags.split(',').map(t => t.trim()),
    postId,
    imageAlt: `${title} - Guía completa`
  });
  
  const finalContent = `${frontmatter}\n\n${content.replace(/^---[\s\S]*?---\s*/, '')}`;
  
  // Escribir archivo
  fs.writeFileSync(`src/content/blog/${postId}.md`, finalContent);
  console.log(`✅ Post creado: src/content/blog/${postId}.md`);
  
  // Generar imágenes
  await generateImagesForPost(postId);
  
  // Tests
  await runTestsForPost(postId);
}

/**
 * Analizar post existente
 */
async function analyzeExistingPost() {
  console.log('\n🔍 Analizando post existente...\n');
  
  const posts = getExistingPosts();
  console.log('Posts disponibles:');
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title} (${post.slug})`);
  });
  
  const choice = await askQuestion('Selecciona post (número): ');
  const selectedPost = posts[parseInt(choice) - 1];
  
  if (!selectedPost) {
    console.log('❌ Selección inválida');
    return;
  }
  
  const content = fs.readFileSync(`src/content/blog/${selectedPost.slug}.md`, 'utf-8');
  const analysis = analyzeContent(content);
  
  console.log(`\n📊 Análisis completo de "${selectedPost.title}":`);
  console.log(`- Palabras: ${analysis.wordCount}`);
  console.log(`- Tiempo de lectura: ~${analysis.readingTime} minutos`);
  console.log(`- Headings: ${analysis.headings.length}`);
  console.log(`- Imágenes en markdown: ${analysis.images.length}`);
  console.log(`- Links externos: ${analysis.externalLinks.length}`);
  console.log(`- Recomendación: ${analysis.recommendation}`);
  
  // Verificar imágenes
  if (selectedPost.postId) {
    const imageStatus = checkPostImages(selectedPost.postId);
    console.log(`\n🖼️ Estado de imágenes:`);
    console.log(`- Variantes existentes: ${imageStatus.existing.length}/4`);
    if (imageStatus.missing.length > 0) {
      console.log(`- Faltantes: ${imageStatus.missing.join(', ')}`);
    }
  }
  
  // Sugerir acciones
  console.log('\n💡 Sugerencias:');
  if (analysis.wordCount > WORD_LIMITS.LONG) {
    console.log('- Considerar dividir en serie');
  }
  if (analysis.headings.length < 3) {
    console.log('- Agregar más estructura con headings');
  }
  if (selectedPost.postId && imageStatus.missing.length > 0) {
    console.log('- Generar variantes de imagen faltantes');
  }
}

/**
 * Generar imágenes para post existente
 */
async function generateImagesOnly() {
  console.log('\n🖼️ Generando imágenes para post existente...\n');

  const posts = getExistingPosts().filter(p => p.postId);
  console.log('Posts con postId:');
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title} (${post.postId})`);
  });

  const choice = await askQuestion('Selecciona post (número): ');
  const selectedPost = posts[parseInt(choice) - 1];

  if (!selectedPost) {
    console.log('❌ Selección inválida');
    return;
  }

  await generateImagesForPost(selectedPost.postId);
}

/**
 * Analizar relaciones de posts (tags, pilares)
 */
async function analyzeRelationships() {
  console.log('\n🔗 Analizando relaciones de posts...\n');

  const posts = getExistingPosts();
  const tagAnalysis = analyzeTagRelationships(posts);
  const pillarSuggestions = suggestPillarRelationships(posts);

  console.log('📊 Análisis de Tags:');
  console.log(`- Tags únicos: ${tagAnalysis.uniqueTags.length}`);
  console.log(`- Tags más usados: ${tagAnalysis.topTags.slice(0, 5).map(t => `${t.tag} (${t.count})`).join(', ')}`);
  console.log(`- Tags huérfanos: ${tagAnalysis.orphanTags.length}`);

  console.log('\n🏛️ Sugerencias de Pilares:');
  pillarSuggestions.forEach(suggestion => {
    console.log(`- ${suggestion.pillar}: ${suggestion.posts.length} posts`);
  });

  // Sugerir acciones
  console.log('\n💡 Acciones recomendadas:');
  if (tagAnalysis.orphanTags.length > 0) {
    console.log(`- Revisar tags huérfanos: ${tagAnalysis.orphanTags.slice(0, 3).join(', ')}`);
  }
  if (pillarSuggestions.some(p => p.posts.length >= 3)) {
    console.log('- Crear pilares para grupos de 3+ posts relacionados');
  }
}

/**
 * Dividir post largo en serie
 */
async function divideLongPost() {
  console.log('\n✂️ Dividir post largo en serie...\n');

  const posts = getExistingPosts();
  console.log('Posts disponibles:');
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title} (${post.slug})`);
  });

  const choice = await askQuestion('Selecciona post a dividir (número): ');
  const selectedPost = posts[parseInt(choice) - 1];

  if (!selectedPost) {
    console.log('❌ Selección inválida');
    return;
  }

  const content = fs.readFileSync(`src/content/blog/${selectedPost.slug}.md`, 'utf-8');
  await divideLongPostFromContent(content, selectedPost.title);
}

/**
 * Dividir contenido largo en serie
 */
async function divideLongPostFromContent(content, originalTitle = '') {
  const analysis = analyzeContent(content);

  if (analysis.wordCount < WORD_LIMITS.LONG) {
    console.log('⚠️ El post no es lo suficientemente largo para dividir');
    return;
  }

  console.log(`\n✂️ Dividiendo post de ${analysis.wordCount} palabras...`);

  const seriesTitle = await askQuestion('Título de la serie: ') || originalTitle;
  const numParts = await askQuestion('¿En cuántas partes dividir? (2-4): ') || '3';

  const parts = parseInt(numParts);
  if (parts < 2 || parts > 4) {
    console.log('❌ Número de partes inválido (2-4)');
    return;
  }

  // Dividir contenido por headings
  const sections = divideContentBySections(content, parts);

  console.log(`\n📝 Creando ${parts} posts de la serie...`);

  for (let i = 0; i < parts; i++) {
    const partTitle = await askQuestion(`Título de la parte ${i + 1}: `);
    const partId = generatePostId(partTitle);

    const partContent = generateSeriesPost({
      title: partTitle,
      seriesTitle,
      partNumber: i + 1,
      totalParts: parts,
      content: sections[i],
      postId: partId
    });

    fs.writeFileSync(`src/content/blog/${partId}.md`, partContent);
    console.log(`✅ Creado: ${partId}.md`);

    // Generar imágenes
    await generateImagesForPost(partId);
  }

  // Crear post hub
  const hubId = generatePostId(seriesTitle);
  const hubContent = generateSeriesHub({
    seriesTitle,
    parts: Array.from({length: parts}, (_, i) => ({
      number: i + 1,
      title: `Parte ${i + 1}`,
      id: generatePostId(`${seriesTitle} parte ${i + 1}`)
    }))
  });

  fs.writeFileSync(`src/content/blog/${hubId}.md`, hubContent);
  console.log(`✅ Hub creado: ${hubId}.md`);
}

/**
 * Ejecutar tests completos
 */
async function runCompleteTests() {
  console.log('\n🧪 Ejecutando tests completos...\n');

  try {
    console.log('📊 Tests de estructura...');
    execSync('npm run test:blog:structure', { stdio: 'inherit' });

    console.log('\n🖼️ Tests de imágenes...');
    execSync('npm run test:blog:images', { stdio: 'inherit' });

    console.log('\n🏗️ Build test...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('\n✅ Todos los tests pasaron correctamente');
  } catch (error) {
    console.log('\n❌ Algunos tests fallaron - revisar errores arriba');
  }
}

/**
 * Generar reporte completo del blog
 */
async function generateBlogReport() {
  console.log('\n📊 Generando reporte completo del blog...\n');

  const posts = getExistingPosts();
  const tagAnalysis = analyzeTagRelationships(posts);

  // Análisis de contenido
  let totalWords = 0;
  let postsWithImages = 0;
  let postsWithPostId = 0;

  for (const post of posts) {
    const content = fs.readFileSync(`src/content/blog/${post.slug}.md`, 'utf-8');
    const analysis = analyzeContent(content);
    totalWords += analysis.wordCount;

    if (analysis.images.length > 0) postsWithImages++;
    if (post.postId) postsWithPostId++;
  }

  console.log('📈 Estadísticas del Blog:');
  console.log(`- Total de posts: ${posts.length}`);
  console.log(`- Posts con postId: ${postsWithPostId}`);
  console.log(`- Posts con imágenes: ${postsWithImages}`);
  console.log(`- Palabras totales: ${totalWords.toLocaleString()}`);
  console.log(`- Promedio por post: ${Math.round(totalWords / posts.length)} palabras`);
  console.log(`- Tags únicos: ${tagAnalysis.uniqueTags.length}`);

  // Verificar imágenes
  let totalMissingImages = 0;
  for (const post of posts.filter(p => p.postId)) {
    const imageStatus = checkPostImages(post.postId);
    totalMissingImages += imageStatus.missing.length;
  }

  console.log(`\n🖼️ Estado de Imágenes:`);
  console.log(`- Posts con sistema nuevo: ${postsWithPostId}`);
  console.log(`- Variantes faltantes: ${totalMissingImages}`);

  if (totalMissingImages > 0) {
    console.log('\n⚠️ Acciones requeridas:');
    console.log('- Ejecutar generación de imágenes faltantes');
    console.log('- Verificar tests de imágenes');
  }
}

/**
 * Generar imágenes para un post
 */
async function generateImagesForPost(postId) {
  console.log(`\n🖼️ Generando imágenes para ${postId}...`);
  
  // Verificar si existe directorio raw
  const rawDir = `images/raw/${postId}`;
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
    console.log(`📁 Creado directorio: ${rawDir}`);
  }
  
  // Verificar si existe imagen fuente
  const sourceImage = `${rawDir}/portada.webp`;
  if (!fs.existsSync(sourceImage)) {
    console.log('⚠️ No existe imagen fuente. Usando placeholder...');
    // Copiar imagen placeholder
    execSync(`cp public/images/blog/seo-cover.webp ${sourceImage}`);
  }
  
  // Ejecutar optimización
  try {
    console.log('🔄 Ejecutando optimización de imágenes...');
    execSync(`npm run optimize-images -- --postId=${postId} --force`, { stdio: 'inherit' });
    console.log('✅ Imágenes generadas correctamente');
  } catch (error) {
    console.log('❌ Error generando imágenes');
  }
}

/**
 * Ejecutar tests para un post específico
 */
async function runTestsForPost(postId) {
  console.log(`\n🧪 Ejecutando tests para ${postId}...`);
  
  try {
    execSync('npm run test:blog', { stdio: 'inherit' });
    console.log('✅ Tests pasaron correctamente');
  } catch (error) {
    console.log('❌ Tests fallaron - revisar errores');
  }
}

/**
 * Utilidades
 */
function generatePostId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function generateFrontmatter(data) {
  return `---
title: "${data.title}"
description: "${data.description}"
date: "${data.date}"
author: "${data.author}"
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
postId: "${data.postId}"
imageAlt: "${data.imageAlt}"
---`;
}

function analyzeContent(content) {
  const words = content.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // 200 palabras por minuto
  
  const headings = (content.match(/^#{1,6}\s+.+$/gm) || []);
  const images = (content.match(/!\[.*?\]\(.*?\)/g) || []);
  const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []);
  
  let recommendation = '';
  if (words < WORD_LIMITS.SHORT) {
    recommendation = 'Post corto - considerar expandir contenido';
  } else if (words <= WORD_LIMITS.MEDIUM) {
    recommendation = 'Longitud ideal para post único';
  } else if (words <= WORD_LIMITS.LONG) {
    recommendation = 'Post largo pero manejable';
  } else {
    recommendation = 'Post muy largo - considerar dividir en serie';
  }
  
  return {
    wordCount: words,
    readingTime,
    headings,
    images,
    externalLinks,
    recommendation
  };
}

function getExistingPosts() {
  const blogDir = 'src/content/blog';
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  return files.map(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["'](.+)["']/);
      const postIdMatch = frontmatter.match(/postId:\s*["'](.+)["']/);
      
      return {
        slug: file.replace('.md', ''),
        title: titleMatch ? titleMatch[1] : file,
        postId: postIdMatch ? postIdMatch[1] : null
      };
    }
    
    return {
      slug: file.replace('.md', ''),
      title: file,
      postId: null
    };
  });
}

function checkPostImages(postId) {
  const imageDir = `public/images/${postId}`;
  const requiredVariants = [
    'portada.webp',
    'portada-avif.avif',
    'portada-thumb.webp',
    'portada-og.webp'
  ];

  const existing = [];
  const missing = [];

  requiredVariants.forEach(variant => {
    if (fs.existsSync(path.join(imageDir, variant))) {
      existing.push(variant);
    } else {
      missing.push(variant);
    }
  });

  return { existing, missing };
}

function analyzeTagRelationships(posts) {
  const tagCounts = {};
  const allTags = [];

  posts.forEach(post => {
    const content = fs.readFileSync(`src/content/blog/${post.slug}.md`, 'utf-8');
    const tagsMatch = content.match(/tags:\s*\[(.*?)\]/);

    if (tagsMatch) {
      const tags = tagsMatch[1].split(',').map(tag =>
        tag.trim().replace(/['"]/g, '')
      );

      tags.forEach(tag => {
        if (tag) {
          allTags.push(tag);
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  const uniqueTags = Object.keys(tagCounts);
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const orphanTags = topTags.filter(t => t.count === 1).map(t => t.tag);

  return {
    uniqueTags,
    topTags,
    orphanTags,
    tagCounts
  };
}

function suggestPillarRelationships(posts) {
  const pillarKeywords = {
    'automation-devops': ['automation', 'devops', 'ci-cd', 'github-actions', 'deploy'],
    'frontend-development': ['frontend', 'astro', 'react', 'typescript', 'css'],
    'seo-content': ['seo', 'content', 'blog', 'marketing'],
    'testing-quality': ['testing', 'quality', 'tests', 'qa'],
    'performance': ['performance', 'optimization', 'speed', 'core-web-vitals']
  };

  const suggestions = [];

  Object.entries(pillarKeywords).forEach(([pillar, keywords]) => {
    const relatedPosts = posts.filter(post => {
      const content = fs.readFileSync(`src/content/blog/${post.slug}.md`, 'utf-8').toLowerCase();
      return keywords.some(keyword =>
        content.includes(keyword) || post.title.toLowerCase().includes(keyword)
      );
    });

    if (relatedPosts.length > 0) {
      suggestions.push({
        pillar,
        posts: relatedPosts,
        keywords
      });
    }
  });

  return suggestions.sort((a, b) => b.posts.length - a.posts.length);
}

function divideContentBySections(content, numParts) {
  // Remover frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '');

  // Dividir por headings H2
  const sections = contentWithoutFrontmatter.split(/^## /gm).filter(s => s.trim());

  if (sections.length < numParts) {
    // Si no hay suficientes secciones, dividir por párrafos
    const paragraphs = contentWithoutFrontmatter.split(/\n\s*\n/);
    const paragraphsPerPart = Math.ceil(paragraphs.length / numParts);

    const parts = [];
    for (let i = 0; i < numParts; i++) {
      const start = i * paragraphsPerPart;
      const end = start + paragraphsPerPart;
      parts.push(paragraphs.slice(start, end).join('\n\n'));
    }
    return parts;
  }

  // Distribuir secciones entre partes
  const sectionsPerPart = Math.ceil(sections.length / numParts);
  const parts = [];

  for (let i = 0; i < numParts; i++) {
    const start = i * sectionsPerPart;
    const end = start + sectionsPerPart;
    const partSections = sections.slice(start, end);

    // Reagregar ## a las secciones (excepto la primera si es introducción)
    const formattedSections = partSections.map((section, index) => {
      if (index === 0 && i === 0) {
        return section; // Primera sección del primer post
      }
      return `## ${section}`;
    });

    parts.push(formattedSections.join('\n\n'));
  }

  return parts;
}

function generateSeriesPost({ title, seriesTitle, partNumber, totalParts, content, postId }) {
  const description = `Parte ${partNumber} de ${totalParts} de la serie "${seriesTitle}". Guía paso a paso completa.`;

  return `---
title: "${title}"
description: "${description}"
date: "${CURRENT_DATE}"
author: "Matías Cappato"
tags: ["serie", "tutorial", "guía"]
postId: "${postId}"
imageAlt: "${title} - Parte ${partNumber} de ${totalParts}"
---

**📚 Serie:** ${seriesTitle} - Parte ${partNumber} de ${totalParts}

${content}

## 🚀 Próximos Pasos en la Serie

${partNumber < totalParts ?
  `### **Siguiente:** [Parte ${partNumber + 1}](/blog/parte-${partNumber + 1})` :
  '### **¡Serie Completada!** 🎉'
}

### **📚 Serie Completa:**
${Array.from({length: totalParts}, (_, i) =>
  `- ${i + 1 === partNumber ? '**' : ''}[Parte ${i + 1}](/blog/parte-${i + 1})${i + 1 === partNumber ? ' ← Estás aquí**' : ''}`
).join('\n')}

---

**¿Te ha resultado útil esta parte?** ¡Continúa con la siguiente parte de la serie!`;
}

function generateSeriesHub({ seriesTitle, parts }) {
  const description = `Serie completa de ${parts.length} partes sobre ${seriesTitle}. Guía paso a paso desde principiante hasta avanzado.`;

  return `---
title: "${seriesTitle}: Serie Completa"
description: "${description}"
date: "${CURRENT_DATE}"
author: "Matías Cappato"
tags: ["serie", "hub", "guía-completa"]
postId: "${generatePostId(seriesTitle)}"
imageAlt: "${seriesTitle} - Serie completa"
---

¿Quieres dominar **${seriesTitle}**? Esta serie completa te lleva desde los conceptos básicos hasta la implementación avanzada, paso a paso.

## 🎯 Lo que vas a dominar

Al completar esta serie tendrás:

- ✅ Conocimiento completo de ${seriesTitle}
- ✅ Implementación práctica paso a paso
- ✅ Mejores prácticas y troubleshooting
- ✅ Experiencia real aplicable

## 📚 Serie Completa: ${parts.length} Partes Especializadas

${parts.map((part, index) => `
### **Parte ${part.number}: ${part.title}**
**[${part.title}](/blog/${part.id})**

${index === 0 ? 'Empezar aquí' : index === parts.length - 1 ? 'Nivel avanzado' : 'Nivel intermedio'}
- Tiempo: ~5-7 minutos de lectura
- Nivel: ${index === 0 ? 'Principiante' : index === parts.length - 1 ? 'Avanzado' : 'Intermedio'}
`).join('\n')}

## 🚀 Ruta de Aprendizaje Recomendada

### **Para Principiantes**
1. **[Parte 1](/blog/${parts[0].id})** - Empieza aquí
2. Continúa secuencialmente hasta completar la serie

### **Para Desarrolladores con Experiencia**
- ¿Ya tienes conocimientos básicos? → **[Parte 2](/blog/${parts[1]?.id})**
- ¿Buscas troubleshooting? → **[Parte ${parts.length}](/blog/${parts[parts.length - 1].id})**

## 💡 Beneficios de Completar la Serie

### **Para Desarrolladores**
- ⚡ Implementación completa en menos de 1 hora
- 🔒 Mejores prácticas profesionales
- 📊 Troubleshooting completo
- 🌍 Aplicación real en proyectos

### **Para Equipos**
- 👥 Workflow estandarizado
- 📚 Documentación completa
- 🚀 Productividad aumentada
- 🛡️ Menos errores en producción

---

**¿Listo para empezar?** 👉 **[Comienza con la Parte 1](/blog/${parts[0].id})**`;
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  createNewPost,
  createFromExistingFile,
  analyzeExistingPost,
  generateImagesForPost,
  analyzeContent
};
