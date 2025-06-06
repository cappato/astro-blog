#!/usr/bin/env node

/**
 * Sistema de Auto-División Inteligente de Posts en Series
 * Detecta automáticamente posts largos y los divide en series optimizadas
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class AutoSeriesDivider {
  constructor() {
    this.DIVISION_THRESHOLDS = {
      word_count: 1800,
      reading_time: 9,
      topics: 4,
      headings: 12
    };
    
    this.OPTIMAL_PART_SIZE = {
      words: 800,
      reading_time: 4,
      headings: 4
    };
  }

  /**
   * Analiza y divide automáticamente posts largos
   */
  async autoAnalyzeAndDivide() {
    console.log('🔍 Buscando posts candidatos para auto-división...\n');
    
    const blogDir = 'src/content/blog';
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const candidates = [];
    
    for (const file of mdFiles) {
      const filePath = path.join(blogDir, file);
      const analysis = await this.analyzeForDivision(filePath);
      
      if (analysis.should_divide) {
        candidates.push(analysis);
      }
    }
    
    if (candidates.length === 0) {
      console.log('✅ No se encontraron posts que requieran división automática');
      return;
    }
    
    console.log(`📋 Encontrados ${candidates.length} candidatos para división:\n`);
    
    for (const candidate of candidates) {
      console.log(`📄 ${candidate.file}:`);
      console.log(`  📊 ${candidate.word_count} palabras (${candidate.reading_time} min lectura)`);
      console.log(`  🎯 Razón: ${candidate.division_reason}`);
      console.log(`  ✂️ División sugerida: ${candidate.suggested_parts} partes\n`);
      
      // Auto-dividir si cumple criterios estrictos
      if (this.shouldAutoDivide(candidate)) {
        console.log(`🤖 Auto-dividiendo ${candidate.file}...`);
        await this.autoDividePost(candidate);
        console.log(`✅ ${candidate.file} dividido automáticamente\n`);
      } else {
        console.log(`⚠️ ${candidate.file} requiere revisión manual\n`);
      }
    }
  }

  /**
   * Analiza un post para determinar si necesita división
   */
  async analyzeForDivision(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    const analysis = {
      file: path.basename(filePath),
      filePath: filePath,
      word_count: this.countWords(body),
      reading_time: this.calculateReadingTime(body),
      headings: this.analyzeHeadings(body),
      topics: this.extractMainTopics(body),
      content: content,
      body: body,
      frontmatter: frontmatter,
      should_divide: false,
      division_reason: null,
      suggested_parts: null,
      division_points: []
    };
    
    // Evaluar criterios de división
    this.evaluateDivisionCriteria(analysis);
    
    return analysis;
  }

  /**
   * Evalúa si un post debe dividirse
   */
  evaluateDivisionCriteria(analysis) {
    const reasons = [];
    
    // Criterio 1: Extensión excesiva
    if (analysis.word_count > this.DIVISION_THRESHOLDS.word_count) {
      reasons.push(`Extensión excesiva (${analysis.word_count} palabras)`);
    }
    
    // Criterio 2: Tiempo de lectura largo
    if (analysis.reading_time > this.DIVISION_THRESHOLDS.reading_time) {
      reasons.push(`Tiempo de lectura largo (${analysis.reading_time} minutos)`);
    }
    
    // Criterio 3: Demasiados temas principales
    if (analysis.topics.length > this.DIVISION_THRESHOLDS.topics) {
      reasons.push(`Múltiples temas (${analysis.topics.length} temas principales)`);
    }
    
    // Criterio 4: Estructura compleja
    if (analysis.headings.count > this.DIVISION_THRESHOLDS.headings) {
      reasons.push(`Estructura compleja (${analysis.headings.count} secciones)`);
    }
    
    if (reasons.length > 0) {
      analysis.should_divide = true;
      analysis.division_reason = reasons.join(', ');
      analysis.suggested_parts = this.calculateOptimalParts(analysis);
      analysis.division_points = this.findDivisionPoints(analysis);
    }
  }

  /**
   * Calcula el número óptimo de partes
   */
  calculateOptimalParts(analysis) {
    const wordBasedParts = Math.ceil(analysis.word_count / this.OPTIMAL_PART_SIZE.words);
    const topicBasedParts = Math.min(analysis.topics.length, 5);
    const headingBasedParts = Math.ceil(analysis.headings.count / this.OPTIMAL_PART_SIZE.headings);
    
    // Usar el criterio más conservador pero no menos de 2
    return Math.max(2, Math.min(wordBasedParts, topicBasedParts, headingBasedParts));
  }

  /**
   * Encuentra puntos óptimos de división
   */
  findDivisionPoints(analysis) {
    const lines = analysis.body.split('\n');
    const divisionPoints = [];
    
    // Buscar H2 como puntos de división naturales
    const h2Positions = [];
    lines.forEach((line, index) => {
      if (line.match(/^##\s+/)) {
        h2Positions.push({
          line: index,
          title: line.replace(/^##\s+/, ''),
          content_before: lines.slice(0, index).join('\n'),
          word_count_before: this.countWords(lines.slice(0, index).join('\n'))
        });
      }
    });
    
    if (h2Positions.length >= analysis.suggested_parts) {
      // Dividir por H2 existentes
      const targetWordsPerPart = analysis.word_count / analysis.suggested_parts;
      let currentPart = 0;
      let currentWords = 0;
      
      for (const h2 of h2Positions) {
        if (currentWords > targetWordsPerPart * 0.7 && currentPart < analysis.suggested_parts - 1) {
          divisionPoints.push({
            type: 'heading',
            position: h2.line,
            title: h2.title,
            estimated_words: h2.word_count_before - currentWords
          });
          currentWords = h2.word_count_before;
          currentPart++;
        }
      }
    }
    
    return divisionPoints;
  }

  /**
   * Determina si debe auto-dividir sin intervención humana
   */
  shouldAutoDivide(analysis) {
    // Criterios estrictos para auto-división (ajustados para testing)
    const autoConditions = [
      analysis.word_count > 300, // Para testing: más bajo
      analysis.reading_time > 2, // Para testing: más bajo
      analysis.topics.length > 8, // Muchos temas
      analysis.division_points.length >= 2 // Al menos 2 puntos de división
    ];

    // Debe cumplir al menos 2 criterios estrictos
    const metConditions = autoConditions.filter(Boolean).length;
    console.log(`🔍 Criterios para auto-división de ${analysis.file}:`);
    console.log(`  📊 Palabras: ${analysis.word_count} (>300: ${analysis.word_count > 300})`);
    console.log(`  ⏱️ Tiempo: ${analysis.reading_time} min (>2: ${analysis.reading_time > 2})`);
    console.log(`  🎯 Temas: ${analysis.topics.length} (>8: ${analysis.topics.length > 8})`);
    console.log(`  ✂️ Puntos división: ${analysis.division_points.length} (>=2: ${analysis.division_points.length >= 2})`);
    console.log(`  ✅ Criterios cumplidos: ${metConditions}/4 (necesario: 2)`);

    return metConditions >= 2;
  }

  /**
   * Divide automáticamente un post
   */
  async autoDividePost(analysis) {
    const seriesTitle = this.generateSeriesTitle(analysis);
    const parts = this.createSeriesParts(analysis, seriesTitle);
    
    // Crear hub de la serie
    const hubContent = this.generateSeriesHub(seriesTitle, parts, analysis);
    const hubPath = analysis.filePath.replace('.md', '-serie.md');
    await fs.writeFile(hubPath, hubContent);
    
    // Crear posts individuales
    for (let i = 0; i < parts.length; i++) {
      const partPath = analysis.filePath.replace('.md', `-parte-${i + 1}.md`);
      await fs.writeFile(partPath, parts[i].content);
      
      // Generar imágenes para cada parte
      try {
        const postId = path.basename(partPath, '.md');
        execSync(`npm run optimize-images -- --postId=${postId}`, { stdio: 'pipe' });
      } catch (error) {
        console.log(`⚠️ Error generando imágenes para parte ${i + 1}`);
      }
    }
    
    // Renombrar archivo original como backup
    const backupPath = analysis.filePath.replace('.md', '-original-backup.md');
    await fs.rename(analysis.filePath, backupPath);
    
    console.log(`📁 Serie creada: ${parts.length} partes + hub`);
    console.log(`💾 Original respaldado como: ${path.basename(backupPath)}`);
  }

  /**
   * Genera título de serie automáticamente
   */
  generateSeriesTitle(analysis) {
    const originalTitle = this.extractTitleFromFrontmatter(analysis.frontmatter);
    
    // Remover palabras que indican completitud
    const cleanTitle = originalTitle
      .replace(/:\s*(guía\s+completa|serie\s+completa|tutorial\s+completo)/i, '')
      .replace(/\s*-\s*(completo|completa|total|definitivo|definitiva)$/i, '')
      .trim();
    
    return cleanTitle;
  }

  /**
   * Crea las partes de la serie
   */
  createSeriesParts(analysis, seriesTitle) {
    const parts = [];
    const divisionPoints = analysis.division_points;
    const lines = analysis.body.split('\n');
    
    if (divisionPoints.length === 0) {
      // División simple por longitud
      const wordsPerPart = Math.ceil(analysis.word_count / analysis.suggested_parts);
      let currentPart = [];
      let currentWords = 0;
      
      for (const line of lines) {
        currentPart.push(line);
        currentWords += this.countWords(line);
        
        if (currentWords >= wordsPerPart && parts.length < analysis.suggested_parts - 1) {
          parts.push({
            title: `${seriesTitle} - Parte ${parts.length + 1}`,
            content: this.generatePartContent(currentPart.join('\n'), seriesTitle, parts.length + 1, analysis.suggested_parts),
            word_count: currentWords
          });
          currentPart = [];
          currentWords = 0;
        }
      }
      
      // Última parte
      if (currentPart.length > 0) {
        parts.push({
          title: `${seriesTitle} - Parte ${parts.length + 1}`,
          content: this.generatePartContent(currentPart.join('\n'), seriesTitle, parts.length + 1, analysis.suggested_parts),
          word_count: currentWords
        });
      }
    } else {
      // División por puntos específicos
      let lastPoint = 0;
      
      for (let i = 0; i < divisionPoints.length; i++) {
        const point = divisionPoints[i];
        const partContent = lines.slice(lastPoint, point.position).join('\n');
        
        parts.push({
          title: `${seriesTitle} - ${point.title}`,
          content: this.generatePartContent(partContent, seriesTitle, i + 1, analysis.suggested_parts),
          word_count: this.countWords(partContent)
        });
        
        lastPoint = point.position;
      }
      
      // Última parte
      const finalContent = lines.slice(lastPoint).join('\n');
      if (finalContent.trim()) {
        parts.push({
          title: `${seriesTitle} - Parte Final`,
          content: this.generatePartContent(finalContent, seriesTitle, parts.length + 1, analysis.suggested_parts),
          word_count: this.countWords(finalContent)
        });
      }
    }
    
    return parts;
  }

  /**
   * Genera contenido de una parte individual
   */
  generatePartContent(content, seriesTitle, partNumber, totalParts) {
    const postId = this.generatePostId(`${seriesTitle} parte ${partNumber}`);
    const date = new Date().toISOString().split('T')[0];
    
    return `---
title: "${seriesTitle} - Parte ${partNumber}"
description: "Parte ${partNumber} de ${totalParts} de la serie ${seriesTitle}"
date: ${date}
tags: ["serie", "tutorial", "guía"]
pillar: "typescript-architecture"
series: "${seriesTitle}"
seriesPart: ${partNumber}
seriesTotal: ${totalParts}
postId: "${postId}"
---

${content}

## Navegación de la Serie

${this.generateSeriesNavigation(seriesTitle, partNumber, totalParts)}
`;
  }

  /**
   * Genera hub de la serie
   */
  generateSeriesHub(seriesTitle, parts, analysis) {
    const postId = this.generatePostId(seriesTitle);
    const date = new Date().toISOString().split('T')[0];
    const totalWords = parts.reduce((sum, part) => sum + part.word_count, 0);
    const totalReadingTime = Math.ceil(totalWords / 200);
    
    return `---
title: "${seriesTitle} - Serie Completa"
description: "Serie completa de ${parts.length} partes sobre ${seriesTitle}"
date: ${date}
tags: ["serie", "hub", "índice"]
pillar: "typescript-architecture"
seriesHub: true
seriesTitle: "${seriesTitle}"
postId: "${postId}"
---

## TL;DR

Serie completa de ${parts.length} partes sobre ${seriesTitle}. Tiempo total de lectura: ${totalReadingTime} minutos.

## Índice de la Serie

${parts.map((part, i) => `${i + 1}. [${part.title}](/blog/${this.generatePostId(part.title)}) (${Math.ceil(part.word_count / 200)} min)`).join('\n')}

## Resumen

Esta serie fue dividida automáticamente para optimizar la experiencia de lectura. Cada parte se enfoca en aspectos específicos del tema principal.

**Total**: ${totalWords} palabras, ${totalReadingTime} minutos de lectura
**Partes**: ${parts.length} posts independientes pero relacionados
**Nivel**: Intermedio a avanzado

## Navegación Rápida

- **Principiantes**: Empezar por la Parte 1
- **Experiencia intermedia**: Revisar índice y saltar a temas específicos
- **Referencia rápida**: Usar como guía de consulta por secciones
`;
  }

  /**
   * Utilidades
   */
  parseFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      return { frontmatter: '', body: content };
    }
    
    return {
      frontmatter: frontmatterMatch[1],
      body: frontmatterMatch[2]
    };
  }

  extractTitleFromFrontmatter(frontmatter) {
    const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
    return titleMatch ? titleMatch[1] : 'Serie de Posts';
  }

  countWords(text) {
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();
    
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(text) {
    const words = this.countWords(text);
    return Math.ceil(words / 200);
  }

  analyzeHeadings(text) {
    const headingRegex = /^(#{2,6})\s+(.+)$/gm;
    const headings = [...text.matchAll(headingRegex)];
    
    return {
      count: headings.length,
      levels: headings.map(h => h[1].length),
      titles: headings.map(h => h[2])
    };
  }

  extractMainTopics(text) {
    const headings = this.analyzeHeadings(text);
    return headings.titles.filter((_, i) => headings.levels[i] === 2);
  }

  generatePostId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  generateSeriesNavigation(seriesTitle, currentPart, totalParts) {
    const navigation = [];
    
    if (currentPart > 1) {
      navigation.push(`← [Parte ${currentPart - 1}](/blog/${this.generatePostId(`${seriesTitle} parte ${currentPart - 1}`)})`);
    }
    
    navigation.push(`[Índice de la Serie](/blog/${this.generatePostId(seriesTitle)})`);
    
    if (currentPart < totalParts) {
      navigation.push(`[Parte ${currentPart + 1}](/blog/${this.generatePostId(`${seriesTitle} parte ${currentPart + 1}`)}) →`);
    }
    
    return navigation.join(' | ');
  }
}

// CLI Interface
async function main() {
  const divider = new AutoSeriesDivider();
  
  try {
    await divider.autoAnalyzeAndDivide();
  } catch (error) {
    console.error('❌ Error en auto-división:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutoSeriesDivider };
