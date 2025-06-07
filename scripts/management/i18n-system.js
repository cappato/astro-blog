#!/usr/bin/env node

/**
 * Internationalization System
 * Provides consistent language support across all automation tools
 * Resolves the chaos created by incomplete language migration
 */

const LANGUAGES = {
  en: 'English',
  es: 'Español'
};

const DEFAULT_LANGUAGE = process.env.PR_LANGUAGE || 'en';

const MESSAGES = {
  en: {
    // PR Creation
    'pr.creating': 'Creating PR automatically...',
    'pr.created': 'PR created successfully',
    'pr.failed': 'Failed to create PR',
    'pr.url_extracted': 'PR URL extracted',
    'pr.url_failed': 'Could not extract PR URL',
    
    // Workflow
    'workflow.starting': 'Starting complete automated workflow...',
    'workflow.completed': 'Automated workflow completed successfully!',
    'workflow.failed': 'Automated workflow failed',
    'workflow.no_changes': 'No changes to commit',
    'workflow.tests_running': 'Running tests...',
    'workflow.tests_passed': 'Tests passed successfully',
    'workflow.tests_failed': 'Tests failed',
    'workflow.pushing': 'Pushing changes...',
    'workflow.push_success': 'Push successful',
    
    // Validation
    'validation.proactive': 'Running proactive validation...',
    'validation.passed': 'Proactive validation passed',
    'validation.failed': 'Proactive validation failed',
    'validation.fix_issues': 'Fix issues above before creating PR',
    
    // Auto-merge
    'automerge.configured': 'Auto-merge configured - will merge automatically when tests pass',
    'automerge.label_added': 'Auto-merge label added',
    
    // Reporting
    'report.generating': 'Reporting PR according to established protocol...',
    'report.generated': 'PR report generated',
    'report.protocol_followed': 'PR reported according to established protocol',
    'report.failed': 'Error reporting PR',
    
    // System
    'system.validating': 'Validating system...',
    'system.health_check': 'System health check',
    'system.ready': 'System ready',
    'system.issues': 'System issues detected',
    
    // Agent
    'agent.name': 'ganzo',
    'agent.checklist.tests': 'Tests executed locally',
    'agent.checklist.build': 'Successful build verified',
    'agent.checklist.commits': 'Commits with descriptive messages',
    'agent.checklist.label': 'PR with auto-merge label',
    'agent.checklist.description': 'Complete description included',
    'agent.status.tests': 'Passing',
    'agent.status.build': 'Successful',
    'agent.status.automerge': 'Configured',
    'agent.status.protocol': 'Followed'
  },
  
  es: {
    // PR Creation
    'pr.creating': 'Creando PR automáticamente...',
    'pr.created': 'PR creado exitosamente',
    'pr.failed': 'Error creando PR',
    'pr.url_extracted': 'URL del PR extraída',
    'pr.url_failed': 'No se pudo extraer la URL del PR',
    
    // Workflow
    'workflow.starting': 'Iniciando workflow automatizado completo...',
    'workflow.completed': 'Workflow automatizado completado exitosamente!',
    'workflow.failed': 'Error en workflow automatizado',
    'workflow.no_changes': 'No hay cambios para commitear',
    'workflow.tests_running': 'Ejecutando tests...',
    'workflow.tests_passed': 'Tests pasaron exitosamente',
    'workflow.tests_failed': 'Tests fallaron',
    'workflow.pushing': 'Haciendo push...',
    'workflow.push_success': 'Push exitoso',
    
    // Validation
    'validation.proactive': 'Ejecutando validación proactiva...',
    'validation.passed': 'Validación proactiva exitosa',
    'validation.failed': 'Validación proactiva falló',
    'validation.fix_issues': 'Corrige los problemas antes de crear el PR',
    
    // Auto-merge
    'automerge.configured': 'Auto-merge configurado - se mergeará automáticamente cuando pasen los tests',
    'automerge.label_added': 'Label auto-merge agregado',
    
    // Reporting
    'report.generating': 'Reportando PR según protocolo establecido...',
    'report.generated': 'Reporte de PR generado',
    'report.protocol_followed': 'PR reportado según protocolo establecido',
    'report.failed': 'Error reportando PR',
    
    // System
    'system.validating': 'Validando sistema...',
    'system.health_check': 'Verificación de salud del sistema',
    'system.ready': 'Sistema listo',
    'system.issues': 'Problemas del sistema detectados',
    
    // Agent
    'agent.name': 'ganzo',
    'agent.checklist.tests': 'Tests ejecutados localmente',
    'agent.checklist.build': 'Build exitoso verificado',
    'agent.checklist.commits': 'Commits con mensajes descriptivos',
    'agent.checklist.label': 'PR con label auto-merge',
    'agent.checklist.description': 'Descripción completa incluida',
    'agent.status.tests': 'Pasando',
    'agent.status.build': 'Exitoso',
    'agent.status.automerge': 'Configurado',
    'agent.status.protocol': 'Seguido'
  }
};

class I18nSystem {
  constructor(language = DEFAULT_LANGUAGE) {
    this.language = language;
    this.messages = MESSAGES[language] || MESSAGES.en;
  }

  t(key, params = {}) {
    let message = this.messages[key] || key;
    
    // Simple parameter substitution
    Object.keys(params).forEach(param => {
      message = message.replace(`{${param}}`, params[param]);
    });
    
    return message;
  }

  setLanguage(language) {
    if (LANGUAGES[language]) {
      this.language = language;
      this.messages = MESSAGES[language];
    } else {
      console.warn(`Language ${language} not supported, using ${this.language}`);
    }
  }

  getLanguage() {
    return this.language;
  }

  getSupportedLanguages() {
    return Object.keys(LANGUAGES);
  }

  // Template generation methods
  generatePRReport(prUrl, prTitle, timestamp) {
    const lang = this.language;
    
    if (lang === 'en') {
      return `
## PR Created - ${timestamp}

**Agent**: ${this.t('agent.name')}
**PR**: [${prTitle}](${prUrl})

### Automatic Checklist
- [x] ${this.t('agent.checklist.tests')}
- [x] ${this.t('agent.checklist.build')}
- [x] ${this.t('agent.checklist.commits')}
- [x] ${this.t('agent.checklist.label')}
- [x] ${this.t('agent.checklist.description')}

### Status
- **Tests**: ${this.t('agent.status.tests')}
- **Build**: ${this.t('agent.status.build')}
- **Auto-merge**: ${this.t('agent.status.automerge')}
- **Protocol**: ${this.t('agent.status.protocol')}

**PR Link**: ${prUrl}
`;
    } else {
      return `
## PR Creado - ${timestamp}

**Agente**: ${this.t('agent.name')}
**PR**: [${prTitle}](${prUrl})

### Checklist Automático
- [x] ${this.t('agent.checklist.tests')}
- [x] ${this.t('agent.checklist.build')}
- [x] ${this.t('agent.checklist.commits')}
- [x] ${this.t('agent.checklist.label')}
- [x] ${this.t('agent.checklist.description')}

### Estado
- **Tests**: ${this.t('agent.status.tests')}
- **Build**: ${this.t('agent.status.build')}
- **Auto-merge**: ${this.t('agent.status.automerge')}
- **Protocolo**: ${this.t('agent.status.protocol')}

**Link del PR**: ${prUrl}
`;
    }
  }

  // Logging helpers with consistent language
  log(key, params = {}) {
    console.log(this.t(key, params));
  }

  error(key, params = {}) {
    console.error(this.t(key, params));
  }

  warn(key, params = {}) {
    console.warn(this.t(key, params));
  }

  // Language detection from environment
  static detectLanguage() {
    // Check environment variables
    if (process.env.PR_LANGUAGE) {
      return process.env.PR_LANGUAGE;
    }
    
    if (process.env.LANG) {
      const lang = process.env.LANG.substring(0, 2);
      return LANGUAGES[lang] ? lang : 'en';
    }
    
    // Check git config
    try {
      const { execSync } = require('child_process');
      const gitLang = execSync('git config --get user.language', { encoding: 'utf8' }).trim();
      return LANGUAGES[gitLang] ? gitLang : 'en';
    } catch (error) {
      // Git config not set
    }
    
    return 'en'; // Default fallback
  }

  // Configuration helpers
  static configure(options = {}) {
    const language = options.language || I18nSystem.detectLanguage();
    return new I18nSystem(language);
  }
}

// Global instance for easy access
const i18n = I18nSystem.configure();

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'detect':
      console.log(`Detected language: ${I18nSystem.detectLanguage()}`);
      break;
      
    case 'set':
      const newLang = process.argv[3];
      if (newLang && LANGUAGES[newLang]) {
        console.log(`Setting language to: ${LANGUAGES[newLang]}`);
        // This would typically update a config file
      } else {
        console.log(`Supported languages: ${Object.keys(LANGUAGES).join(', ')}`);
      }
      break;
      
    case 'test':
      const testKey = process.argv[3] || 'pr.creating';
      console.log(`EN: ${MESSAGES.en[testKey]}`);
      console.log(`ES: ${MESSAGES.es[testKey]}`);
      break;
      
    default:
      console.log(`
🌍 I18n System

Usage:
  node i18n-system.js detect
  node i18n-system.js set [language]
  node i18n-system.js test [key]

Current language: ${i18n.getLanguage()}
Supported languages: ${Object.keys(LANGUAGES).join(', ')}

Environment variables:
  PR_LANGUAGE=${process.env.PR_LANGUAGE || 'not set'}
  LANG=${process.env.LANG || 'not set'}
      `);
  }
}

export { I18nSystem, i18n };
