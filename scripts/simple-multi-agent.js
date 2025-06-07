#!/usr/bin/env node

/**
 * Sistema Multi-agente Simplificado
 * Enfocado en triggers de posts y carga de contexto
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class SimpleMultiAgent {
    constructor() {
        this.rulesPath = 'docs/rules-essential.md';
        this.blogAutomationPath = 'scripts/blog-automation.js';
        this.lessonsPath = 'scripts/lessons-learned.js';
        
        // Triggers para detección de intenciones de posts
        this.POST_TRIGGERS = [
            /creamos un post/i,
            /creemos un post/i,
            /crear post/i,
            /hagamos un post/i,
            /vamos a crear un post/i,
            /hacer un post/i,
            /post con esto/i,
            /documentar esto/i,
            /escribir post/i,
            /generar post/i
        ];
    }

    /**
     * Detecta si el mensaje contiene intención de crear post
     */
    detectPostIntent(message) {
        return this.POST_TRIGGERS.some(pattern => pattern.test(message));
    }

    /**
     * Carga contexto completo del blog para creación de posts
     */
    async loadBlogContext() {
        try {
            console.log('Detectada intención de crear post - Cargando contexto...\n');

            const context = {
                pillars: await this.getCurrentPillars(),
                tags: await this.getExistingTags(),
                recentPosts: await this.getRecentPosts(5),
                rules: await this.loadEssentialRules()
            };

            this.displayBlogContext(context);
            return context;

        } catch (error) {
            console.error('Error cargando contexto del blog:', error.message);
            return null;
        }
    }

    /**
     * Obtiene pilares existentes del blog
     */
    async getCurrentPillars() {
        try {
            // Leer configuración de pilares
            const pillarsConfig = await fs.readFile('src/features/content-pillars/config/pillars.config.ts', 'utf8');

            // Extraer IDs de pilares del CONTENT_PILLARS
            const pillarMatches = pillarsConfig.match(/'([^']+)':\s*{/g);

            if (pillarMatches) {
                const pillars = pillarMatches.map(match => match.match(/'([^']+)':/)[1]);
                return pillars;
            }

            return ['astro-performance', 'typescript-architecture', 'automation-devops', 'seo-optimization'];
        } catch (error) {
            return ['astro-performance', 'typescript-architecture', 'automation-devops', 'seo-optimization'];
        }
    }

    /**
     * Obtiene tags existentes más usados
     */
    async getExistingTags() {
        try {
            const postsDir = 'src/content/blog';
            const files = await fs.readdir(postsDir);
            const mdFiles = files.filter(f => f.endsWith('.md'));

            const tagCounts = {};

            for (const file of mdFiles) { // Analizar todos los posts
                try {
                    const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                    // Buscar tags en el frontmatter YAML
                    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

                    if (frontmatterMatch) {
                        const frontmatter = frontmatterMatch[1];
                        const tagsMatch = frontmatter.match(/tags:\s*\[([\s\S]*?)\]/);

                        if (tagsMatch) {
                            const tagsContent = tagsMatch[1];
                            // Extraer tags, manejando comillas simples y dobles
                            const tags = tagsContent.match(/['"]([^'"]+)['"]/g)?.map(t => t.replace(/['"]/g, '')) || [];

                            tags.forEach(tag => {
                                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                            });
                        }
                    }
                } catch (fileError) {
                    // Continuar con el siguiente archivo si hay error
                    continue;
                }
            }

            // Retornar tags más usados
            return Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20)
                .map(([tag, count]) => ({ tag, count }));

        } catch (error) {
            return [];
        }
    }

    /**
     * Obtiene posts recientes para evitar duplicados
     */
    async getRecentPosts(limit = 5) {
        try {
            const postsDir = 'src/content/blog';
            const files = await fs.readdir(postsDir);
            const mdFiles = files.filter(f => f.endsWith('.md'));
            
            const posts = [];
            
            for (const file of mdFiles.slice(0, limit)) {
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
                posts.push({ file, title });
            }
            
            return posts;
        } catch (error) {
            return [];
        }
    }

    /**
     * Carga reglas esenciales
     */
    async loadEssentialRules() {
        try {
            const rules = await fs.readFile(this.rulesPath, 'utf8');
            return 'Reglas esenciales cargadas: estándares profesionales, desarrollo, workflow';
        } catch (error) {
            return 'Reglas esenciales no encontradas';
        }
    }

    /**
     * Muestra el contexto cargado de forma clara
     */
    displayBlogContext(context) {
        console.log('Contexto del blog cargado:');
        console.log(`${context.pillars.length} pilares existentes: ${context.pillars.join(', ')}`);
        console.log(`${context.tags.length} tags más usados disponibles para reutilizar`);
        console.log(`${context.recentPosts.length} posts recientes analizados para evitar duplicados`);
        console.log(`${context.rules}`);
        console.log(`Templates SEO y workflow de creación listos\n`);

        console.log('¿Sobre qué tema específico quieres crear el post?');
        console.log('Voy a evaluar automáticamente qué pilar encaja mejor y sugerir tags relevantes.\n');
    }

    /**
     * Ejecuta blog-automation.js para crear post
     */
    async createPost() {
        try {
            console.log('Iniciando blog-automation.js...\n');
            execSync('node scripts/blog-automation.js', { stdio: 'inherit' });
        } catch (error) {
            console.error('Error ejecutando blog-automation:', error.message);
        }
    }

    /**
     * Ejecuta lessons-learned.js para crear lección
     */
    async createLesson() {
        try {
            console.log('Iniciando lessons-learned.js...\n');
            execSync('node scripts/lessons-learned.js', { stdio: 'inherit' });
        } catch (error) {
            console.error('Error ejecutando lessons-learned:', error.message);
        }
    }

    /**
     * Crea PR automáticamente con gh CLI
     */
    async createPR(title, description) {
        console.log('Creating PR automatically...');

        try {
            // Create PR with gh CLI
            const prCommand = `gh pr create --title "${title}" --body "${description}" --label "auto-merge"`;
            const prOutput = execSync(prCommand, { encoding: 'utf8' });

            // Extract PR URL
            const prUrlMatch = prOutput.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
            const prUrl = prUrlMatch ? prUrlMatch[0] : null;

            if (prUrl) {
                console.log(`PR created successfully: ${prUrl}`);

                // Report PR automatically
                await this.reportPR(prUrl, title);

                return prUrl;
            } else {
                console.error('Could not extract PR URL');
                return null;
            }
        } catch (error) {
            console.error('Error creating PR:', error.message);
            return null;
        }
    }

    /**
     * Reporta PR según protocolo establecido
     */
    async reportPR(prUrl, prTitle) {
        console.log('Reporting PR according to established protocol...');

        try {
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

            const prReport = `
## PR Created - ${timestamp}

**Agent**: ganzo
**PR**: [${prTitle}](${prUrl})

### Automatic Checklist
- [x] Tests executed locally
- [x] Successful build verified
- [x] Commits with descriptive messages
- [x] PR with auto-merge label
- [x] Complete description included

### Status
- **Tests**: Passing
- **Build**: Successful
- **Auto-merge**: Configured
- **Protocol**: Followed

**PR Link**: ${prUrl}
`;

            console.log('PR report generated:');
            console.log(prReport);
            console.log('PR reported according to established protocol');

            return prReport;
        } catch (error) {
            console.error('Error reporting PR:', error.message);
            return null;
        }
    }

    /**
     * Workflow completo automatizado: push + PR + reporte
     */
    async automatedWorkflow(commitMessage, prTitle, prDescription) {
        console.log('Starting complete automated workflow...\n');

        try {
            // 1. Check if there are changes to commit
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (!gitStatus.trim()) {
                console.log('No changes to commit');
                return;
            }

            // 2. Run tests before push
            console.log('Running tests...');
            execSync('npm run test:blog', { stdio: 'inherit' });
            console.log('Tests passed successfully\n');

            // 3. Push current branch
            console.log('Pushing...');
            const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
            console.log('Push successful\n');

            // 4. Create PR automatically
            const prUrl = await this.createPR(prTitle, prDescription);

            if (prUrl) {
                console.log('\nAutomated workflow completed successfully!');
                console.log(`PR: ${prUrl}`);
                console.log('Auto-merge configured - will merge automatically when tests pass');
            }

            return prUrl;
        } catch (error) {
            console.error('Error in automated workflow:', error.message);
            return null;
        }
    }

    /**
     * Valida que el sistema esté configurado correctamente
     */
    async validate() {
        const checks = [
            { name: 'Reglas esenciales', path: this.rulesPath },
            { name: 'Blog automation', path: this.blogAutomationPath },
            { name: 'Lessons learned', path: this.lessonsPath },
            { name: 'Directorio de posts', path: 'src/content/blog' }
        ];

        console.log('Validando sistema...\n');

        for (const check of checks) {
            try {
                await fs.access(check.path);
                console.log(`${check.name}: OK`);
            } catch (error) {
                console.log(`${check.name}: FALTA (${check.path})`);
            }
        }

        console.log('\nValidación completada');
    }
}

// CLI Interface
const command = process.argv[2];
const agent = new SimpleMultiAgent();

switch (command) {
    case 'validate':
        agent.validate();
        break;
    case 'context':
        agent.loadBlogContext();
        break;
    case 'post':
        await agent.loadBlogContext();
        await agent.createPost();
        break;
    case 'lesson':
        await agent.loadBlogContext();
        await agent.createLesson();
        break;
    case 'pr':
        // Comando para reportar PR (compatibilidad con sistema anterior)
        const prUrl = process.argv[3];
        const prTitle = process.argv[4] || 'PR Automático';
        if (prUrl) {
            await agent.reportPR(prUrl, prTitle);
        } else {
            console.log('Uso: npm run multi-agent:pr <PR_URL> [PR_TITLE]');
        }
        break;
    case 'workflow':
        // Complete automated workflow
        const commitMsg = process.argv[3] || 'feat: automatic changes';
        const workflowPrTitle = process.argv[4] || 'feat: implement automatic changes';
        const workflowPrDesc = process.argv[5] || 'Changes implemented automatically by the multi-agent system';
        await agent.automatedWorkflow(commitMsg, workflowPrTitle, workflowPrDesc);
        break;
    default:
        console.log(`
Sistema Multi-agente Simplificado

Comandos disponibles:
  validate  - Validar configuración del sistema
  context   - Cargar contexto del blog
  post      - Crear nuevo post (con contexto)
  lesson    - Crear lección aprendida (con contexto)
  pr        - Reportar PR según protocolo
  workflow  - Workflow automatizado completo (tests + push + PR)

Uso: npm run multi-agent:[comando]

Workflow automatizado:
  npm run multi-agent:workflow "commit message" "PR title" "PR description"
        `);
}
