#!/usr/bin/env node

/**
 * Sistema de Validación Inteligente de Contenido
 * Detecta automáticamente problemas de calidad y sugiere soluciones
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class IntelligentContentValidator {
  constructor() {
    this.OPTIMAL_WORD_COUNT = {
      min: 300,
      ideal: 800,
      max: 1500,
      series_threshold: 2000
    };
    
    this.READING_TIME = {
      words_per_minute: 200,
      max_minutes: 8
    };
    
    this.CONTENT_QUALITY_RULES = {
      min_headings: 3,
      max_heading_levels: 4,
      min_code_examples: 1,
      max_topics_per_post: 3
    };
  }

  /**
   * Analiza todos los posts del blog y detecta problemas
   */
  async analyzeAllPosts() {
    console.log('🔍 Analizando calidad de contenido del blog...\n');
    
    const blogDir = 'src/content/blog';
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const results = {
      total: mdFiles.length,
      issues: [],
      suggestions: [],
      series_candidates: [],
      optimization_opportunities: []
    };
    
    for (const file of mdFiles) {
      const filePath = path.join(blogDir, file);
      const analysis = await this.analyzePost(filePath);
      
      if (analysis.issues.length > 0) {
        results.issues.push({ file, issues: analysis.issues });
      }
      
      if (analysis.suggestions.length > 0) {
        results.suggestions.push({ file, suggestions: analysis.suggestions });
      }
      
      if (analysis.should_divide) {
        results.series_candidates.push({
          file,
          reason: analysis.division_reason,
          suggested_parts: analysis.suggested_parts
        });
      }
      
      if (analysis.optimizations.length > 0) {
        results.optimization_opportunities.push({
          file,
          optimizations: analysis.optimizations
        });
      }
    }
    
    return results;
  }

  /**
   * Analiza un post individual
   */
  async analyzePost(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    const analysis = {
      file: path.basename(filePath),
      word_count: this.countWords(body),
      reading_time: this.calculateReadingTime(body),
      headings: this.analyzeHeadings(body),
      topics: this.extractTopics(body),
      code_examples: this.countCodeExamples(body),
      issues: [],
      suggestions: [],
      optimizations: [],
      should_divide: false,
      division_reason: null,
      suggested_parts: null
    };
    
    // Validar extensión
    this.validateLength(analysis);
    
    // Validar estructura
    this.validateStructure(analysis);
    
    // Validar calidad de contenido
    this.validateContentQuality(analysis);
    
    // Detectar candidatos para series
    this.detectSeriesCandidates(analysis);
    
    // Sugerir optimizaciones
    this.suggestOptimizations(analysis);
    
    return analysis;
  }

  /**
   * Valida la extensión del post
   */
  validateLength(analysis) {
    const { word_count, reading_time } = analysis;
    
    if (word_count < this.OPTIMAL_WORD_COUNT.min) {
      analysis.issues.push({
        type: 'length',
        severity: 'warning',
        message: `Post muy corto (${word_count} palabras, mínimo ${this.OPTIMAL_WORD_COUNT.min})`
      });
    }
    
    if (word_count > this.OPTIMAL_WORD_COUNT.max) {
      analysis.issues.push({
        type: 'length',
        severity: 'error',
        message: `Post muy largo (${word_count} palabras, máximo recomendado ${this.OPTIMAL_WORD_COUNT.max})`
      });
    }
    
    if (reading_time > this.READING_TIME.max_minutes) {
      analysis.issues.push({
        type: 'reading_time',
        severity: 'warning',
        message: `Tiempo de lectura excesivo (${reading_time} min, máximo recomendado ${this.READING_TIME.max_minutes} min)`
      });
    }
    
    if (word_count > this.OPTIMAL_WORD_COUNT.series_threshold) {
      analysis.should_divide = true;
      analysis.division_reason = `Post excesivamente largo (${word_count} palabras)`;
      analysis.suggested_parts = Math.ceil(word_count / this.OPTIMAL_WORD_COUNT.ideal);
    }
  }

  /**
   * Valida la estructura del contenido
   */
  validateStructure(analysis) {
    const { headings } = analysis;
    
    if (headings.count < this.CONTENT_QUALITY_RULES.min_headings) {
      analysis.issues.push({
        type: 'structure',
        severity: 'warning',
        message: `Pocas secciones (${headings.count} headings, mínimo ${this.CONTENT_QUALITY_RULES.min_headings})`
      });
    }
    
    if (headings.max_level > this.CONTENT_QUALITY_RULES.max_heading_levels) {
      analysis.issues.push({
        type: 'structure',
        severity: 'warning',
        message: `Jerarquía muy profunda (H${headings.max_level}, máximo recomendado H${this.CONTENT_QUALITY_RULES.max_heading_levels})`
      });
    }
    
    if (headings.hierarchy_issues.length > 0) {
      analysis.issues.push({
        type: 'structure',
        severity: 'error',
        message: `Problemas de jerarquía: ${headings.hierarchy_issues.join(', ')}`
      });
    }
  }

  /**
   * Valida la calidad del contenido
   */
  validateContentQuality(analysis) {
    const { code_examples, topics } = analysis;
    
    if (code_examples < this.CONTENT_QUALITY_RULES.min_code_examples) {
      analysis.suggestions.push({
        type: 'content',
        message: `Agregar ejemplos de código (${code_examples} encontrados, mínimo ${this.CONTENT_QUALITY_RULES.min_code_examples})`
      });
    }
    
    if (topics.length > this.CONTENT_QUALITY_RULES.max_topics_per_post) {
      analysis.should_divide = true;
      analysis.division_reason = `Demasiados temas (${topics.length} temas principales)`;
      analysis.suggested_parts = Math.min(topics.length, 4);
    }
  }

  /**
   * Detecta candidatos para dividir en series
   */
  detectSeriesCandidates(analysis) {
    const { topics, headings, word_count } = analysis;
    
    // Detectar patrones de serie
    const seriesPatterns = [
      /parte\s+\d+/i,
      /capítulo\s+\d+/i,
      /guía\s+completa/i,
      /serie\s+completa/i,
      /paso\s+a\s+paso/i
    ];
    
    const hasSeriesPattern = seriesPatterns.some(pattern => 
      analysis.file.match(pattern) || topics.some(topic => topic.match(pattern))
    );
    
    if (hasSeriesPattern && word_count > this.OPTIMAL_WORD_COUNT.ideal) {
      analysis.suggestions.push({
        type: 'series',
        message: 'Candidato para dividir en serie basado en patrones detectados'
      });
    }
  }

  /**
   * Sugiere optimizaciones
   */
  suggestOptimizations(analysis) {
    const { word_count, reading_time, headings } = analysis;
    
    // Optimización de longitud
    if (word_count > this.OPTIMAL_WORD_COUNT.ideal && word_count < this.OPTIMAL_WORD_COUNT.series_threshold) {
      analysis.optimizations.push({
        type: 'length',
        action: 'reduce',
        message: `Reducir contenido en ${word_count - this.OPTIMAL_WORD_COUNT.ideal} palabras para mejor UX`
      });
    }
    
    // Optimización de estructura
    if (headings.count > 10) {
      analysis.optimizations.push({
        type: 'structure',
        action: 'reorganize',
        message: 'Reorganizar en menos secciones principales para mejor navegación'
      });
    }
    
    // Optimización SEO
    if (reading_time > 5 && reading_time < 8) {
      analysis.optimizations.push({
        type: 'seo',
        action: 'add_toc',
        message: 'Agregar tabla de contenidos para mejorar navegación'
      });
    }
  }

  /**
   * Utilidades de análisis
   */
  parseFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      return { frontmatter: {}, body: content };
    }
    
    return {
      frontmatter: frontmatterMatch[1],
      body: frontmatterMatch[2]
    };
  }

  countWords(text) {
    // Remover código y elementos markdown
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Bloques de código
      .replace(/`[^`]+`/g, '') // Código inline
      .replace(/!\[.*?\]\(.*?\)/g, '') // Imágenes
      .replace(/\[.*?\]\(.*?\)/g, '') // Links
      .replace(/#{1,6}\s+/g, '') // Headers
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Bold/italic
      .replace(/\n+/g, ' ') // Saltos de línea
      .trim();
    
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(text) {
    const words = this.countWords(text);
    return Math.ceil(words / this.READING_TIME.words_per_minute);
  }

  analyzeHeadings(text) {
    const headingRegex = /^(#{2,6})\s+(.+)$/gm;
    const headings = [...text.matchAll(headingRegex)];
    
    const levels = headings.map(h => h[1].length);
    const hierarchy_issues = [];
    
    // Verificar jerarquía
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i-1] + 1) {
        hierarchy_issues.push(`Salto de H${levels[i-1]} a H${levels[i]}`);
      }
    }
    
    return {
      count: headings.length,
      levels: levels,
      max_level: Math.max(...levels, 0),
      hierarchy_issues: hierarchy_issues,
      titles: headings.map(h => h[2])
    };
  }

  extractTopics(text) {
    const headings = this.analyzeHeadings(text);
    const h2Headings = headings.titles.filter((_, i) => headings.levels[i] === 2);
    return h2Headings;
  }

  countCodeExamples(text) {
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
    const inlineCode = text.match(/`[^`]+`/g) || [];
    return codeBlocks.length + Math.floor(inlineCode.length / 3); // Inline code cuenta menos
  }

  /**
   * Genera reporte de análisis
   */
  generateReport(results) {
    console.log('📊 REPORTE DE CALIDAD DE CONTENIDO\n');
    console.log(`Total de posts analizados: ${results.total}\n`);
    
    // Issues críticos
    if (results.issues.length > 0) {
      console.log('🚨 PROBLEMAS DETECTADOS:');
      results.issues.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        item.issues.forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : '⚠️';
          console.log(`  ${icon} ${issue.message}`);
        });
      });
      console.log();
    }
    
    // Candidatos para series
    if (results.series_candidates.length > 0) {
      console.log('✂️ CANDIDATOS PARA DIVIDIR EN SERIES:');
      results.series_candidates.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        console.log(`  📝 Razón: ${item.reason}`);
        console.log(`  🔢 Partes sugeridas: ${item.suggested_parts}`);
      });
      console.log();
    }
    
    // Sugerencias
    if (results.suggestions.length > 0) {
      console.log('💡 SUGERENCIAS DE MEJORA:');
      results.suggestions.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        item.suggestions.forEach(suggestion => {
          console.log(`  💡 ${suggestion.message}`);
        });
      });
      console.log();
    }
    
    // Optimizaciones
    if (results.optimization_opportunities.length > 0) {
      console.log('🚀 OPORTUNIDADES DE OPTIMIZACIÓN:');
      results.optimization_opportunities.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        item.optimizations.forEach(opt => {
          console.log(`  🚀 ${opt.message}`);
        });
      });
      console.log();
    }
    
    // Resumen
    console.log('📈 RESUMEN:');
    console.log(`  Posts con problemas: ${results.issues.length}`);
    console.log(`  Candidatos para series: ${results.series_candidates.length}`);
    console.log(`  Posts con sugerencias: ${results.suggestions.length}`);
    console.log(`  Oportunidades de optimización: ${results.optimization_opportunities.length}`);
    
    const healthScore = Math.round(
      ((results.total - results.issues.length) / results.total) * 100
    );
    console.log(`  Puntuación de salud: ${healthScore}%`);
  }
}

// CLI Interface
async function main() {
  const validator = new IntelligentContentValidator();
  
  try {
    const results = await validator.analyzeAllPosts();
    validator.generateReport(results);
    
    // Retornar código de salida basado en problemas críticos
    const criticalIssues = results.issues.filter(item => 
      item.issues.some(issue => issue.severity === 'error')
    ).length;
    
    if (criticalIssues > 0) {
      console.log(`\n❌ ${criticalIssues} posts con problemas críticos detectados`);
      process.exit(1);
    } else {
      console.log('\n✅ Análisis completado sin problemas críticos');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error en análisis:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IntelligentContentValidator };
