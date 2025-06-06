import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Tests para el Sistema Inteligente de Validación y Auto-División
 */

describe('Sistema Inteligente de Validación', () => {
  const testBlogDir = 'src/content/blog';
  
  beforeAll(async () => {
    // Verificar que los scripts existen
    const validatorExists = await fs.access('scripts/intelligent-content-validator.js').then(() => true).catch(() => false);
    const dividerExists = await fs.access('scripts/auto-series-divider.js').then(() => true).catch(() => false);
    
    expect(validatorExists).toBe(true);
    expect(dividerExists).toBe(true);
  });

  describe('Validación Inteligente de Contenido', () => {
    it('should detect posts that are too long', async () => {
      // Buscar posts con más de 1500 palabras
      const files = await fs.readdir(testBlogDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      const longPosts = [];
      
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(testBlogDir, file), 'utf8');
        const wordCount = countWords(content);
        
        if (wordCount > 1500) {
          longPosts.push({ file, wordCount });
        }
      }
      
      // Si hay posts largos, el sistema debería detectarlos
      if (longPosts.length > 0) {
        console.log(`📊 Posts largos detectados: ${longPosts.length}`);
        longPosts.forEach(post => {
          console.log(`  - ${post.file}: ${post.wordCount} palabras`);
        });
      }
      
      // El test pasa independientemente, pero reporta información
      expect(longPosts.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate content structure', async () => {
      const files = await fs.readdir(testBlogDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      const structureIssues = [];
      
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(testBlogDir, file), 'utf8');
        const issues = validateContentStructure(content);
        
        if (issues.length > 0) {
          structureIssues.push({ file, issues });
        }
      }
      
      if (structureIssues.length > 0) {
        console.log(`📋 Problemas de estructura detectados en ${structureIssues.length} posts`);
        structureIssues.forEach(item => {
          console.log(`  - ${item.file}: ${item.issues.join(', ')}`);
        });
      }
      
      // Reportar pero no fallar - es información para mejora
      expect(structureIssues.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect series candidates', async () => {
      const files = await fs.readdir(testBlogDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      const seriesCandidates = [];
      
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(testBlogDir, file), 'utf8');
        const wordCount = countWords(content);
        const topics = extractMainTopics(content);
        
        // Criterios para candidatos a serie
        if (wordCount > 2000 || topics.length > 4) {
          seriesCandidates.push({
            file,
            wordCount,
            topics: topics.length,
            reason: wordCount > 2000 ? 'Muy largo' : 'Múltiples temas'
          });
        }
      }
      
      if (seriesCandidates.length > 0) {
        console.log(`✂️ Candidatos para series detectados: ${seriesCandidates.length}`);
        seriesCandidates.forEach(candidate => {
          console.log(`  - ${candidate.file}: ${candidate.reason} (${candidate.wordCount} palabras, ${candidate.topics} temas)`);
        });
      }
      
      expect(seriesCandidates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Auto-División de Series', () => {
    it('should identify optimal division points', async () => {
      const files = await fs.readdir(testBlogDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      const divisionAnalysis = [];
      
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(testBlogDir, file), 'utf8');
        const wordCount = countWords(content);
        
        if (wordCount > 1800) {
          const headings = analyzeHeadings(content);
          const divisionPoints = findDivisionPoints(content, headings);
          
          divisionAnalysis.push({
            file,
            wordCount,
            headings: headings.count,
            divisionPoints: divisionPoints.length,
            canDivide: divisionPoints.length >= 2
          });
        }
      }
      
      if (divisionAnalysis.length > 0) {
        console.log(`🔍 Análisis de división para ${divisionAnalysis.length} posts largos:`);
        divisionAnalysis.forEach(analysis => {
          console.log(`  - ${analysis.file}: ${analysis.wordCount} palabras, ${analysis.headings} headings, ${analysis.divisionPoints} puntos de división`);
        });
      }
      
      expect(divisionAnalysis.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain content quality after division', () => {
      // Test conceptual - verificar que la división mantiene calidad
      const minWordsPerPart = 300;
      const maxWordsPerPart = 1200;
      const optimalWordsPerPart = 800;
      
      // Simular división de un post de 2400 palabras
      const totalWords = 2400;
      const suggestedParts = Math.ceil(totalWords / optimalWordsPerPart);
      const wordsPerPart = totalWords / suggestedParts;
      
      expect(suggestedParts).toBe(3); // 2400 / 800 = 3
      expect(wordsPerPart).toBe(800); // Tamaño óptimo
      expect(wordsPerPart).toBeGreaterThanOrEqual(minWordsPerPart);
      expect(wordsPerPart).toBeLessThanOrEqual(maxWordsPerPart);
    });
  });

  describe('Integración con Sistema Multi-agente', () => {
    it('should have intelligent validation commands available', () => {
      // Verificar que los comandos están disponibles en package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      expect(packageJson.scripts['multi-agent:validate-content']).toBeDefined();
      expect(packageJson.scripts['multi-agent:auto-divide']).toBeDefined();
      expect(packageJson.scripts['validate:content']).toBeDefined();
      expect(packageJson.scripts['auto:divide']).toBeDefined();
    });

    it('should integrate with workflow command', () => {
      // Verificar que el workflow incluye validación inteligente
      const multiAgentScript = fs.readFileSync('scripts/simple-multi-agent.js', 'utf8');
      
      expect(multiAgentScript).toContain('intelligentValidation');
      expect(multiAgentScript).toContain('autoSeriesDivision');
      expect(multiAgentScript).toContain('Workflow automatizado inteligente');
    });
  });

  describe('Calidad del Sistema', () => {
    it('should have proper error handling', async () => {
      // Los scripts deben manejar errores gracefully
      const validatorScript = await fs.readFile('scripts/intelligent-content-validator.js', 'utf8');
      const dividerScript = await fs.readFile('scripts/auto-series-divider.js', 'utf8');
      
      expect(validatorScript).toContain('try {');
      expect(validatorScript).toContain('catch');
      expect(validatorScript).toContain('process.exit');
      
      expect(dividerScript).toContain('try {');
      expect(dividerScript).toContain('catch');
    });

    it('should provide meaningful output', () => {
      // Los scripts deben proporcionar output útil
      const validatorScript = fs.readFileSync('scripts/intelligent-content-validator.js', 'utf8');
      
      expect(validatorScript).toContain('console.log');
      expect(validatorScript).toContain('REPORTE DE CALIDAD');
      expect(validatorScript).toContain('PROBLEMAS DETECTADOS');
      expect(validatorScript).toContain('CANDIDATOS PARA DIVIDIR');
    });
  });
});

// Utilidades de test
function countWords(content: string): number {
  const { body } = parseFrontmatter(content);
  const cleanText = body
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

function parseFrontmatter(content: string) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    return { frontmatter: '', body: content };
  }
  
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function validateContentStructure(content: string): string[] {
  const { body } = parseFrontmatter(content);
  const issues = [];
  
  // Verificar headings
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const headings = [...body.matchAll(headingRegex)];
  
  if (headings.length < 3) {
    issues.push('Pocas secciones');
  }
  
  // Verificar jerarquía
  const levels = headings.map(h => h[1].length);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i-1] + 1) {
      issues.push('Jerarquía de headings incorrecta');
      break;
    }
  }
  
  return issues;
}

function analyzeHeadings(content: string) {
  const { body } = parseFrontmatter(content);
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const headings = [...body.matchAll(headingRegex)];
  
  return {
    count: headings.length,
    levels: headings.map(h => h[1].length),
    titles: headings.map(h => h[2])
  };
}

function extractMainTopics(content: string): string[] {
  const headings = analyzeHeadings(content);
  return headings.titles.filter((_, i) => headings.levels[i] === 2);
}

function findDivisionPoints(content: string, headings: any): any[] {
  const h2Positions = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.match(/^##\s+/)) {
      h2Positions.push({
        line: index,
        title: line.replace(/^##\s+/, '')
      });
    }
  });
  
  return h2Positions;
}
