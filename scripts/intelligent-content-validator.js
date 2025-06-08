#!/usr/bin/env node

/**
 * Sistema Inteligente de Validación de Contenido
 *
 * ⚠️  PARTIALLY DEPRECATED: Blog validation has been migrated to standard tools
 *
 * Migration status:
 * - ✅ Frontmatter validation → Astro Content Collections (Zod schema)
 * - ✅ Markdown structure → remark-lint + markdownlint-cli2
 * - ✅ Schema.org validation → JSON Schema + AJV
 * - ✅ Basic validation → scripts/validate-blog-posts.js
 * - 🔄 This script still provides advanced content analysis but is being phased out
 *
 * New approach:
 * - npm run validate:blog (new unified validation)
 * - Astro build (automatic Zod validation)
 * - npm run lint:md (markdown structure)
 *
 * Legacy functionality:
 * Detecta automáticamente posts largos y valida estructura
 * Estándares: docs/STANDARDS.md (fuente autoritativa)
 * Validaciones: sin emojis, contenido técnico profesional
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntelligentContentValidator {
  constructor() {
    this.postsDir = path.join(__dirname, '../src/content/blog');
    this.maxPostLength = 3000; // palabras
    this.minHeadingStructure = 3; // mínimo 3 headings
    this.validationResults = [];
  }

  /**
   * Ejecuta validación completa de contenido
   */
  async validateAll() {
    console.log('Iniciando validación inteligente de contenido...');
    
    const posts = this.getPostFiles();
    
    for (const postFile of posts) {
      const result = await this.validatePost(postFile);
      this.validationResults.push(result);
    }
    
    return this.generateReport();
  }

  /**
   * Obtiene lista de archivos de posts
   */
  getPostFiles() {
    if (!fs.existsSync(this.postsDir)) {
      throw new Error(`Directorio de posts no encontrado: ${this.postsDir}`);
    }
    
    return fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.postsDir, file));
  }

  /**
   * Valida un post individual
   */
  async validatePost(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    const validation = {
      file: fileName,
      path: filePath,
      issues: [],
      suggestions: [],
      metrics: {}
    };

    // Análisis de métricas básicas
    validation.metrics = this.analyzeMetrics(content);
    
    // Validaciones específicas
    this.validateFileName(fileName, validation);
    this.validateLength(content, validation);
    this.validateStructure(content, validation);
    this.validateProfessionalStandards(content, validation);
    this.validateTechnicalContent(content, validation);
    
    return validation;
  }

  /**
   * Analiza métricas del contenido
   */
  analyzeMetrics(content) {
    const words = content.split(/\s+/).length;
    const lines = content.split('\n').length;
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    
    return {
      words,
      lines,
      headings,
      codeBlocks,
      readingTime: Math.ceil(words / 200) // 200 palabras por minuto
    };
  }

  /**
   * Valida nombre del archivo
   */
  validateFileName(fileName, validation) {
    // Caracteres problemáticos para compatibilidad multiplataforma
    const problematicChars = /[áéíóúüñÁÉÍÓÚÜÑ\s]/g;
    const matches = fileName.match(problematicChars);

    if (matches && matches.length > 0) {
      const uniqueChars = [...new Set(matches)].join(', ');
      validation.issues.push({
        type: 'filename',
        severity: 'error',
        message: `Nombre de archivo con caracteres problemáticos: "${uniqueChars}" - Causa problemas en Windows`
      });

      // Sugerir nombre corregido
      const correctedName = fileName
        .replace(/[áà]/g, 'a')
        .replace(/[éè]/g, 'e')
        .replace(/[íì]/g, 'i')
        .replace(/[óò]/g, 'o')
        .replace(/[úù]/g, 'u')
        .replace(/[ü]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ÁÀÂÃ]/g, 'A')
        .replace(/[ÉÈÊ]/g, 'E')
        .replace(/[ÍÌÎ]/g, 'I')
        .replace(/[ÓÒÔ]/g, 'O')
        .replace(/[ÚÙÛ]/g, 'U')
        .replace(/[Ü]/g, 'U')
        .replace(/[Ñ]/g, 'N')
        .replace(/\s+/g, '-')
        .toLowerCase();

      validation.suggestions.push({
        type: 'filename-correction',
        message: `Renombrar archivo a: "${correctedName}"`
      });
    }

    // Verificar que no tenga espacios
    if (fileName.includes(' ')) {
      validation.issues.push({
        type: 'filename',
        severity: 'warning',
        message: 'Nombre de archivo contiene espacios - usar guiones en su lugar'
      });
    }

    // Verificar longitud del nombre
    const nameWithoutExtension = fileName.replace('.md', '');
    if (nameWithoutExtension.length > 80) {
      validation.issues.push({
        type: 'filename',
        severity: 'warning',
        message: `Nombre de archivo muy largo: ${nameWithoutExtension.length} caracteres (máximo recomendado: 80)`
      });
    }
  }

  /**
   * Valida longitud del post
   */
  validateLength(content, validation) {
    const { words } = validation.metrics;
    
    if (words > this.maxPostLength) {
      validation.issues.push({
        type: 'length',
        severity: 'warning',
        message: `Post excesivamente largo: ${words} palabras (máximo recomendado: ${this.maxPostLength})`
      });
      
      validation.suggestions.push({
        type: 'division',
        message: 'Considerar dividir en serie de posts para mejor legibilidad'
      });
    }
  }

  /**
   * Valida estructura del contenido
   */
  validateStructure(content, validation) {
    const { headings } = validation.metrics;
    
    if (headings < this.minHeadingStructure) {
      validation.issues.push({
        type: 'structure',
        severity: 'warning',
        message: `Estructura insuficiente: ${headings} headings (mínimo recomendado: ${this.minHeadingStructure})`
      });
    }

    // Verificar jerarquía de headings
    const headingLevels = content.match(/^(#{1,6})\s/gm) || [];
    if (headingLevels.length > 0) {
      const levels = headingLevels.map(h => h.trim().length);
      const hasProperHierarchy = this.validateHeadingHierarchy(levels);
      
      if (!hasProperHierarchy) {
        validation.issues.push({
          type: 'hierarchy',
          severity: 'info',
          message: 'Jerarquía de headings podría mejorarse'
        });
      }
    }
  }

  /**
   * Valida estándares profesionales
   */
  validateProfessionalStandards(content, validation) {
    // Detectar emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiRegex);
    
    if (emojis && emojis.length > 0) {
      validation.issues.push({
        type: 'professional-standards',
        severity: 'error',
        message: `Emojis detectados: ${emojis.length} (violación de estándares profesionales)`
      });
    }

    // Detectar lenguaje informal
    const informalPatterns = [
      /\b(genial|increíble|súper|mega)\b/gi,
      /\b(wow|guau|ups)\b/gi,
      /!{2,}/g // múltiples exclamaciones
    ];
    
    informalPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        validation.issues.push({
          type: 'tone',
          severity: 'warning',
          message: `Lenguaje informal detectado: ${matches.length} ocurrencias`
        });
      }
    });
  }

  /**
   * Valida contenido técnico
   */
  validateTechnicalContent(content, validation) {
    const { codeBlocks } = validation.metrics;
    
    // Posts técnicos deberían tener ejemplos de código
    const isTechnical = /\b(código|script|función|variable|API|framework|biblioteca)\b/gi.test(content);
    
    if (isTechnical && codeBlocks === 0) {
      validation.suggestions.push({
        type: 'technical',
        message: 'Post técnico sin ejemplos de código - considerar agregar ejemplos prácticos'
      });
    }
  }

  /**
   * Valida jerarquía de headings
   */
  validateHeadingHierarchy(levels) {
    for (let i = 1; i < levels.length; i++) {
      const current = levels[i];
      const previous = levels[i - 1];
      
      // No debería saltar más de un nivel
      if (current > previous + 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Genera reporte de validación
   */
  generateReport() {
    const totalPosts = this.validationResults.length;
    const postsWithIssues = this.validationResults.filter(r => r.issues.length > 0).length;
    const totalIssues = this.validationResults.reduce((sum, r) => sum + r.issues.length, 0);
    
    const report = {
      summary: {
        totalPosts,
        postsWithIssues,
        totalIssues,
        validationDate: new Date().toISOString()
      },
      results: this.validationResults,
      recommendations: this.generateRecommendations()
    };
    
    this.printReport(report);
    return report;
  }

  /**
   * Genera recomendaciones basadas en resultados
   */
  generateRecommendations() {
    const recommendations = [];
    
    const longPosts = this.validationResults.filter(r => 
      r.issues.some(i => i.type === 'length')
    );
    
    if (longPosts.length > 0) {
      recommendations.push({
        type: 'content-strategy',
        message: `${longPosts.length} posts excesivamente largos detectados - considerar estrategia de series`
      });
    }
    
    const postsWithEmojis = this.validationResults.filter(r =>
      r.issues.some(i => i.type === 'professional-standards')
    );
    
    if (postsWithEmojis.length > 0) {
      recommendations.push({
        type: 'standards',
        message: `${postsWithEmojis.length} posts con violaciones de estándares profesionales - requiere limpieza`
      });
    }

    const postsWithFilenameIssues = this.validationResults.filter(r =>
      r.issues.some(i => i.type === 'filename')
    );

    if (postsWithFilenameIssues.length > 0) {
      recommendations.push({
        type: 'compatibility',
        message: `${postsWithFilenameIssues.length} archivos con nombres problemáticos - requiere renombrado para compatibilidad Windows`
      });
    }

    return recommendations;
  }

  /**
   * Imprime reporte en consola
   */
  printReport(report) {
    console.log('\n=== REPORTE DE VALIDACIÓN INTELIGENTE ===');
    console.log(`Posts analizados: ${report.summary.totalPosts}`);
    console.log(`Posts con problemas: ${report.summary.postsWithIssues}`);
    console.log(`Total de problemas: ${report.summary.totalIssues}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n--- RECOMENDACIONES ---');
      report.recommendations.forEach(rec => {
        console.log(`- ${rec.message}`);
      });
    }
    
    if (report.summary.totalIssues > 0) {
      console.log('\n--- DETALLES ---');
      report.results.forEach(result => {
        if (result.issues.length > 0) {
          console.log(`\n${result.file}:`);
          result.issues.forEach(issue => {
            console.log(`  [${issue.severity.toUpperCase()}] ${issue.message}`);
          });
        }
      });
    }
    
    console.log('\n=== FIN DEL REPORTE ===\n');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new IntelligentContentValidator();
  
  validator.validateAll()
    .then(report => {
      const hasErrors = report.results.some(r => 
        r.issues.some(i => i.severity === 'error')
      );
      
      process.exit(hasErrors ? 1 : 0);
    })
    .catch(error => {
      console.error('Error en validación:', error);
      process.exit(1);
    });
}

export default IntelligentContentValidator;
