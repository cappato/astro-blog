import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar el validador
const validatorPath = path.join(__dirname, '../../scripts/intelligent-content-validator.js');

describe('Sistema de Validación Inteligente de Contenido', () => {
  const testPostsDir = path.join(__dirname, '../temp-test-posts');
  
  beforeEach(async () => {
    // Crear directorio temporal para tests
    if (!fs.existsSync(testPostsDir)) {
      fs.mkdirSync(testPostsDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // Limpiar directorio temporal
    if (fs.existsSync(testPostsDir)) {
      fs.rmSync(testPostsDir, { recursive: true, force: true });
    }
  });

  describe('Detección de Posts Largos', () => {
    it('debería detectar posts excesivamente largos', async () => {
      // Crear post largo (más de 3000 palabras)
      const longContent = `---
title: "Post Muy Largo"
pillar: "test"
tags: ["test"]
---

# Post de Prueba

${'Palabra '.repeat(3500)}
`;

      const testFile = path.join(testPostsDir, 'post-largo.md');
      fs.writeFileSync(testFile, longContent);

      // Importar y ejecutar validador
      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('length');
      expect(result.issues[0].severity).toBe('warning');
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].type).toBe('division');
    });

    it('debería aprobar posts de longitud normal', async () => {
      const normalContent = `---
title: "Post Normal"
pillar: "test"
tags: ["test"]
---

# Post de Prueba

## Introducción

Este es un post de longitud normal con contenido técnico apropiado.

## Desarrollo

Contenido técnico detallado pero conciso.

## Conclusión

Resumen y conclusiones del post.
`;

      const testFile = path.join(testPostsDir, 'post-normal.md');
      fs.writeFileSync(testFile, normalContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const lengthIssues = result.issues.filter(issue => issue.type === 'length');
      expect(lengthIssues).toHaveLength(0);
    });
  });

  describe('Validación de Estándares Profesionales', () => {
    it('debería detectar emojis en el contenido', async () => {
      const contentWithEmojis = `---
title: "Post con Emojis"
pillar: "test"
tags: ["test"]
---

# Post de Prueba 🚀

Este post tiene emojis 😊 que violan los estándares profesionales.

## Sección 📋

Más contenido con emojis ✅ que deben ser detectados.
`;

      const testFile = path.join(testPostsDir, 'post-emojis.md');
      fs.writeFileSync(testFile, contentWithEmojis);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const professionalIssues = result.issues.filter(issue => issue.type === 'professional-standards');
      expect(professionalIssues).toHaveLength(1);
      expect(professionalIssues[0].severity).toBe('error');
    });

    it('debería detectar lenguaje informal', async () => {
      const informalContent = `---
title: "Post Informal"
pillar: "test"
tags: ["test"]
---

# Post Genial

Este post es súper increíble y mega útil!!!

## Sección Wow

Contenido informal que debe ser detectado.
`;

      const testFile = path.join(testPostsDir, 'post-informal.md');
      fs.writeFileSync(testFile, informalContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const toneIssues = result.issues.filter(issue => issue.type === 'tone');
      expect(toneIssues.length).toBeGreaterThan(0);
    });

    it('debería aprobar contenido profesional', async () => {
      const professionalContent = `---
title: "Post Profesional"
pillar: "test"
tags: ["test"]
---

# Análisis Técnico de Performance

Este post presenta un análisis detallado de optimización de performance.

## Metodología

Descripción técnica de la metodología utilizada.

## Resultados

Presentación objetiva de los resultados obtenidos.

## Conclusiones

Análisis profesional de las conclusiones.
`;

      const testFile = path.join(testPostsDir, 'post-profesional.md');
      fs.writeFileSync(testFile, professionalContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const professionalIssues = result.issues.filter(issue => 
        issue.type === 'professional-standards' || issue.type === 'tone'
      );
      expect(professionalIssues).toHaveLength(0);
    });
  });

  describe('Validación de Estructura', () => {
    it('debería detectar estructura insuficiente', async () => {
      const poorStructureContent = `---
title: "Post Sin Estructura"
pillar: "test"
tags: ["test"]
---

# Post de Prueba

Contenido sin estructura adecuada, sin headings suficientes.
`;

      const testFile = path.join(testPostsDir, 'post-estructura.md');
      fs.writeFileSync(testFile, poorStructureContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const structureIssues = result.issues.filter(issue => issue.type === 'structure');
      expect(structureIssues).toHaveLength(1);
      expect(structureIssues[0].severity).toBe('warning');
    });

    it('debería aprobar estructura adecuada', async () => {
      const goodStructureContent = `---
title: "Post Bien Estructurado"
pillar: "test"
tags: ["test"]
---

# Post de Prueba

## Introducción

Contenido de introducción.

## Desarrollo

### Subsección 1

Contenido detallado.

### Subsección 2

Más contenido.

## Conclusión

Resumen final.
`;

      const testFile = path.join(testPostsDir, 'post-estructura-buena.md');
      fs.writeFileSync(testFile, goodStructureContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const structureIssues = result.issues.filter(issue => issue.type === 'structure');
      expect(structureIssues).toHaveLength(0);
    });
  });

  describe('Validación de Contenido Técnico', () => {
    it('debería sugerir ejemplos de código para posts técnicos', async () => {
      const technicalWithoutCodeContent = `---
title: "Post Técnico Sin Código"
pillar: "test"
tags: ["test"]
---

# Análisis de API

Este post habla sobre desarrollo de APIs, funciones y variables pero no incluye ejemplos de código.

## Framework Utilizado

Descripción del framework sin ejemplos prácticos.
`;

      const testFile = path.join(testPostsDir, 'post-tecnico.md');
      fs.writeFileSync(testFile, technicalWithoutCodeContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const technicalSuggestions = result.suggestions.filter(suggestion => suggestion.type === 'technical');
      expect(technicalSuggestions).toHaveLength(1);
    });

    it('debería aprobar posts técnicos con ejemplos de código', async () => {
      const technicalWithCodeContent = `---
title: "Post Técnico Completo"
pillar: "test"
tags: ["test"]
---

# Implementación de API

Este post muestra cómo implementar una API con ejemplos prácticos.

## Código de Ejemplo

\`\`\`javascript
function createAPI() {
  return {
    get: (path) => fetch(path),
    post: (path, data) => fetch(path, { method: 'POST', body: data })
  };
}
\`\`\`

## Uso de Variables

Ejemplo de uso de variables en el código.
`;

      const testFile = path.join(testPostsDir, 'post-tecnico-completo.md');
      fs.writeFileSync(testFile, technicalWithCodeContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      const technicalSuggestions = result.suggestions.filter(suggestion => suggestion.type === 'technical');
      expect(technicalSuggestions).toHaveLength(0);
    });
  });

  describe('Análisis de Métricas', () => {
    it('debería calcular métricas correctamente', async () => {
      const testContent = `---
title: "Post de Métricas"
pillar: "test"
tags: ["test"]
---

# Post de Prueba

## Sección 1

Contenido con palabras para contar.

### Subsección

\`\`\`javascript
console.log('código de ejemplo');
\`\`\`

## Sección 2

Más contenido para análisis.
`;

      const testFile = path.join(testPostsDir, 'post-metricas.md');
      fs.writeFileSync(testFile, testContent);

      const { default: IntelligentContentValidator } = await import(validatorPath);
      const validator = new IntelligentContentValidator();
      validator.postsDir = testPostsDir;

      const result = await validator.validatePost(testFile);

      expect(result.metrics.words).toBeGreaterThan(0);
      expect(result.metrics.lines).toBeGreaterThan(0);
      expect(result.metrics.headings).toBe(3); // H1, H2, H3
      expect(result.metrics.codeBlocks).toBe(1);
      expect(result.metrics.readingTime).toBeGreaterThan(0);
    });
  });
});
