/**
 * Sistema de logging para el script de optimización
 * Proporciona logging estructurado con diferentes niveles
 */

/**
 * Niveles de log disponibles
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Colores para terminal
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Iconos para diferentes tipos de mensaje
 */
const ICONS = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  success: '✅',
  processing: '🔄',
  folder: '📁',
  image: '🖼️',
  rocket: '🚀',
  sparkles: '✨',
  trash: '🗑️'
};

/**
 * Clase Logger para manejo estructurado de logs
 */
class Logger {
  constructor(level = LOG_LEVELS.INFO) {
    this.level = level;
    this.startTime = Date.now();
    this.stats = {
      errors: 0,
      warnings: 0,
      processed: 0,
      skipped: 0
    };
  }

  /**
   * Verificar si un nivel de log debe mostrarse
   * @param {number} level - Nivel del mensaje
   * @returns {boolean} True si debe mostrarse
   */
  shouldLog(level) {
    return level <= this.level;
  }

  /**
   * Formatear timestamp
   * @returns {string} Timestamp formateado
   */
  getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  /**
   * Log de error
   * @param {string} message - Mensaje de error
   * @param {Error} error - Objeto de error opcional
   */
  error(message, error = null) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    this.stats.errors++;
    const timestamp = this.getTimestamp();
    const errorDetails = error ? ` - ${error.message}` : '';
    
    console.error(
      `${COLORS.gray}[${timestamp}]${COLORS.reset} ${ICONS.error} ${COLORS.red}${message}${errorDetails}${COLORS.reset}`
    );
    
    if (error && error.stack && this.level >= LOG_LEVELS.DEBUG) {
      console.error(COLORS.gray + error.stack + COLORS.reset);
    }
  }

  /**
   * Log de advertencia
   * @param {string} message - Mensaje de advertencia
   */
  warn(message) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    this.stats.warnings++;
    const timestamp = this.getTimestamp();
    
    console.warn(
      `${COLORS.gray}[${timestamp}]${COLORS.reset} ${ICONS.warn} ${COLORS.yellow}${message}${COLORS.reset}`
    );
  }

  /**
   * Log de información
   * @param {string} message - Mensaje informativo
   * @param {string} icon - Icono opcional
   */
  info(message, icon = ICONS.info) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const timestamp = this.getTimestamp();
    
    console.log(
      `${COLORS.gray}[${timestamp}]${COLORS.reset} ${icon} ${message}`
    );
  }

  /**
   * Log de éxito
   * @param {string} message - Mensaje de éxito
   */
  success(message) {
    this.info(`${COLORS.green}${message}${COLORS.reset}`, ICONS.success);
    this.stats.processed++;
  }

  /**
   * Log de procesamiento
   * @param {string} message - Mensaje de procesamiento
   */
  processing(message) {
    this.info(`${COLORS.cyan}${message}${COLORS.reset}`, ICONS.processing);
  }

  /**
   * Log de archivo omitido
   * @param {string} message - Mensaje de omisión
   */
  skipped(message) {
    this.info(`${COLORS.gray}${message}${COLORS.reset}`, '⏭️');
    this.stats.skipped++;
  }

  /**
   * Log de debug
   * @param {string} message - Mensaje de debug
   * @param {any} data - Datos adicionales
   */
  debug(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const timestamp = this.getTimestamp();
    
    console.log(
      `${COLORS.gray}[${timestamp}] 🐛 DEBUG: ${message}${COLORS.reset}`
    );
    
    if (data) {
      console.log(COLORS.gray + JSON.stringify(data, null, 2) + COLORS.reset);
    }
  }

  /**
   * Log de inicio de sección
   * @param {string} title - Título de la sección
   */
  section(title) {
    this.info(`\n${COLORS.blue}${title}${COLORS.reset}`, ICONS.folder);
  }

  /**
   * Log de inicio del proceso
   * @param {string} message - Mensaje de inicio
   */
  start(message) {
    this.info(`${COLORS.cyan}${message}${COLORS.reset}`, ICONS.rocket);
  }

  /**
   * Log de finalización del proceso
   * @param {string} message - Mensaje de finalización
   */
  finish(message) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    this.info(
      `\n${COLORS.green}${message}${COLORS.reset} ${COLORS.gray}(${duration}s)${COLORS.reset}`,
      ICONS.sparkles
    );
    this.printStats();
  }

  /**
   * Imprimir estadísticas del proceso
   */
  printStats() {
    const { processed, skipped, warnings, errors } = this.stats;
    const total = processed + skipped;
    
    if (total > 0) {
      console.log(`\n${COLORS.cyan}📊 Estadísticas:${COLORS.reset}`);
      console.log(`   ${ICONS.success} Procesadas: ${COLORS.green}${processed}${COLORS.reset}`);
      
      if (skipped > 0) {
        console.log(`   ⏭️ Omitidas: ${COLORS.gray}${skipped}${COLORS.reset}`);
      }
      
      if (warnings > 0) {
        console.log(`   ${ICONS.warn} Advertencias: ${COLORS.yellow}${warnings}${COLORS.reset}`);
      }
      
      if (errors > 0) {
        console.log(`   ${ICONS.error} Errores: ${COLORS.red}${errors}${COLORS.reset}`);
      }
      
      console.log(`   📈 Total: ${total} archivos`);
    }
  }

  /**
   * Crear barra de progreso simple
   * @param {number} current - Progreso actual
   * @param {number} total - Total de elementos
   * @param {string} label - Etiqueta del progreso
   */
  progress(current, total, label = '') {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(
      `\r${COLORS.cyan}${bar}${COLORS.reset} ${percentage}% ${label} (${current}/${total})`
    );
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }
}

/**
 * Instancia global del logger
 */
export const logger = new Logger();

/**
 * Configurar nivel de logging
 * @param {string} level - Nivel de logging ('error', 'warn', 'info', 'debug')
 */
export function setLogLevel(level) {
  const levels = {
    error: LOG_LEVELS.ERROR,
    warn: LOG_LEVELS.WARN,
    info: LOG_LEVELS.INFO,
    debug: LOG_LEVELS.DEBUG
  };
  
  logger.level = levels[level.toLowerCase()] ?? LOG_LEVELS.INFO;
}

/**
 * Crear nuevo logger con configuración específica
 * @param {number} level - Nivel de logging
 * @returns {Logger} Nueva instancia de logger
 */
export function createLogger(level = LOG_LEVELS.INFO) {
  return new Logger(level);
}
