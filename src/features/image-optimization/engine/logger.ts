/**
 * Image Optimization Feature - Logger System
 * 
 * Comprehensive logging system with levels, colors,
 * and progress tracking for CLI operations.
 */

import type { LogLevel, ILogger } from './types.ts';
import { CLI_CONFIG } from './constants.ts';

/**
 * Logger Class
 * Handles all logging operations with level control and formatting
 */
export class Logger implements ILogger {
  private currentLevel: LogLevel;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4
  };

  constructor(level: LogLevel = CLI_CONFIG.DEFAULT_LOG_LEVEL) {
    this.currentLevel = level;
  }

  /**
   * Set logging level
   */
  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get current logging level
   */
  public getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Debug level logging
   */
  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('DEBUG', message, CLI_CONFIG.COLORS.INFO), ...args);
    }
  }

  /**
   * Info level logging
   */
  public info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('INFO', message, CLI_CONFIG.COLORS.INFO), ...args);
    }
  }

  /**
   * Warning level logging
   */
  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('WARN', message, CLI_CONFIG.COLORS.WARNING), ...args);
    }
  }

  /**
   * Error level logging
   */
  public error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const errorMessage = this.formatMessage('ERROR', message, CLI_CONFIG.COLORS.ERROR);
      
      if (error) {
        if (error instanceof Error) {
          console.error(errorMessage, '\n', error.message);
          if (this.currentLevel === 'debug' && error.stack) {
            console.error('Stack trace:', error.stack);
          }
        } else {
          console.error(errorMessage, error);
        }
      } else {
        console.error(errorMessage);
      }
    }
  }

  /**
   * Progress tracking
   */
  public progress(current: number, total: number, context?: string): void {
    if (this.shouldLog('info')) {
      const percentage = Math.round((current / total) * 100);
      const progressBar = this.createProgressBar(percentage);
      const contextStr = context ? ` (${context})` : '';
      
      // Use carriage return to overwrite the same line
      process.stdout.write(
        `\r${CLI_CONFIG.COLORS.INFO}Progress: ${progressBar} ${percentage}% (${current}/${total})${contextStr}${CLI_CONFIG.COLORS.RESET}`
      );
      
      // Add newline when complete
      if (current === total) {
        process.stdout.write('\n');
      }
    }
  }

  /**
   * Success/finish logging
   */
  public finish(message: string): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('SUCCESS', message, CLI_CONFIG.COLORS.SUCCESS));
    }
  }

  /**
   * Log with timestamp
   */
  public timestamped(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const timestampedMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'debug':
        this.debug(timestampedMessage, ...args);
        break;
      case 'info':
        this.info(timestampedMessage, ...args);
        break;
      case 'warn':
        this.warn(timestampedMessage, ...args);
        break;
      case 'error':
        this.error(timestampedMessage, ...args);
        break;
    }
  }

  /**
   * Log processing statistics
   */
  public stats(stats: {
    total: number;
    processed: number;
    skipped: number;
    errors: number;
    duration?: number;
  }): void {
    if (this.shouldLog('info')) {
      console.log('\n' + CLI_CONFIG.COLORS.INFO + '='.repeat(50) + CLI_CONFIG.COLORS.RESET);
      console.log(this.formatMessage('STATS', 'Processing Summary', CLI_CONFIG.COLORS.INFO));
      console.log(`  Total images: ${stats.total}`);
      console.log(`  Processed: ${CLI_CONFIG.COLORS.SUCCESS}${stats.processed}${CLI_CONFIG.COLORS.RESET}`);
      console.log(`  Skipped: ${CLI_CONFIG.COLORS.WARNING}${stats.skipped}${CLI_CONFIG.COLORS.RESET}`);
      console.log(`  Errors: ${CLI_CONFIG.COLORS.ERROR}${stats.errors}${CLI_CONFIG.COLORS.RESET}`);
      
      if (stats.duration) {
        console.log(`  Duration: ${this.formatDuration(stats.duration)}`);
      }
      
      console.log(CLI_CONFIG.COLORS.INFO + '='.repeat(50) + CLI_CONFIG.COLORS.RESET);
    }
  }

  /**
   * Log file operation
   */
  public fileOperation(operation: 'read' | 'write' | 'delete', filePath: string, success: boolean): void {
    if (this.shouldLog('debug')) {
      const status = success ? '✅' : '❌';
      const color = success ? CLI_CONFIG.COLORS.SUCCESS : CLI_CONFIG.COLORS.ERROR;
      console.log(`${color}${status} ${operation.toUpperCase()}: ${filePath}${CLI_CONFIG.COLORS.RESET}`);
    }
  }

  /**
   * Check if should log at current level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.currentLevel];
  }

  /**
   * Format log message with level and color
   */
  private formatMessage(level: string, message: string, color: string): string {
    return `${color}[${level}]${CLI_CONFIG.COLORS.RESET} ${message}`;
  }

  /**
   * Create ASCII progress bar
   */
  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * Format duration in human readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Create a separator line
   */
  public separator(char: string = '-', length: number = 50): void {
    if (this.shouldLog('info')) {
      console.log(CLI_CONFIG.COLORS.INFO + char.repeat(length) + CLI_CONFIG.COLORS.RESET);
    }
  }

  /**
   * Log table data
   */
  public table(data: Record<string, any>[]): void {
    if (this.shouldLog('info') && data.length > 0) {
      console.table(data);
    }
  }

  /**
   * Clear current line (useful for progress updates)
   */
  public clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }

  /**
   * Log with custom color
   */
  public colored(message: string, color: string): void {
    if (this.shouldLog('info')) {
      console.log(`${color}${message}${CLI_CONFIG.COLORS.RESET}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility function for setting log level
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}

// Logger class is already exported above
