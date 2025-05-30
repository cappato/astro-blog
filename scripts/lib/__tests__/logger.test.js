/**
 * Tests para el módulo de logging
 * Valida sistema de logging, niveles y formateo de mensajes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LOG_LEVELS,
  logger,
  setLogLevel,
  createLogger
} from '../logger.js';

// Mock de console para capturar outputs
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

// Mock de process.stdout para progress bars
const mockStdout = {
  write: vi.fn()
};

describe('LOG_LEVELS constants', () => {
  it('should have correct log level values', () => {
    expect(LOG_LEVELS.ERROR).toBe(0);
    expect(LOG_LEVELS.WARN).toBe(1);
    expect(LOG_LEVELS.INFO).toBe(2);
    expect(LOG_LEVELS.DEBUG).toBe(3);
  });

  it('should have levels in correct order', () => {
    expect(LOG_LEVELS.ERROR).toBeLessThan(LOG_LEVELS.WARN);
    expect(LOG_LEVELS.WARN).toBeLessThan(LOG_LEVELS.INFO);
    expect(LOG_LEVELS.INFO).toBeLessThan(LOG_LEVELS.DEBUG);
  });
});

describe('Logger class functionality', () => {
  let testLogger;

  beforeEach(() => {
    // Crear nuevo logger para cada test
    testLogger = createLogger(LOG_LEVELS.DEBUG);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
    vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    vi.spyOn(process.stdout, 'write').mockImplementation(mockStdout.write);

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shouldLog method', () => {
    it('should respect log levels correctly', () => {
      const errorLogger = createLogger(LOG_LEVELS.ERROR);
      const infoLogger = createLogger(LOG_LEVELS.INFO);
      const debugLogger = createLogger(LOG_LEVELS.DEBUG);

      // Error logger solo debe mostrar errores
      expect(errorLogger.shouldLog(LOG_LEVELS.ERROR)).toBe(true);
      expect(errorLogger.shouldLog(LOG_LEVELS.WARN)).toBe(false);
      expect(errorLogger.shouldLog(LOG_LEVELS.INFO)).toBe(false);
      expect(errorLogger.shouldLog(LOG_LEVELS.DEBUG)).toBe(false);

      // Info logger debe mostrar error, warn e info
      expect(infoLogger.shouldLog(LOG_LEVELS.ERROR)).toBe(true);
      expect(infoLogger.shouldLog(LOG_LEVELS.WARN)).toBe(true);
      expect(infoLogger.shouldLog(LOG_LEVELS.INFO)).toBe(true);
      expect(infoLogger.shouldLog(LOG_LEVELS.DEBUG)).toBe(false);

      // Debug logger debe mostrar todo
      expect(debugLogger.shouldLog(LOG_LEVELS.ERROR)).toBe(true);
      expect(debugLogger.shouldLog(LOG_LEVELS.WARN)).toBe(true);
      expect(debugLogger.shouldLog(LOG_LEVELS.INFO)).toBe(true);
      expect(debugLogger.shouldLog(LOG_LEVELS.DEBUG)).toBe(true);
    });
  });

  describe('error method', () => {
    it('should log error messages', () => {
      testLogger.error('Test error message');

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(testLogger.stats.errors).toBe(1);

      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('❌');
      expect(logCall).toContain('Test error message');
    });

    it('should log error with error object', () => {
      const error = new Error('Test error object');
      testLogger.error('Error occurred', error);

      // Puede llamar console.error múltiples veces (mensaje + stack trace)
      expect(console.error).toHaveBeenCalled();
      expect(testLogger.stats.errors).toBe(1);

      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('Error occurred');
      expect(logCall).toContain('Test error object');
    });

    it('should not log when level is too low', () => {
      const warnLogger = createLogger(LOG_LEVELS.WARN);
      warnLogger.error('This should not appear');

      // Error level (0) <= Warn level (1), so it should log
      expect(console.error).toHaveBeenCalledTimes(1);

      // Reset and test with higher level
      vi.clearAllMocks();
      const infoLogger = createLogger(LOG_LEVELS.INFO);
      infoLogger.level = -1; // Set to below error level
      infoLogger.error('This should not appear');

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('warn method', () => {
    it('should log warning messages', () => {
      testLogger.warn('Test warning message');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(testLogger.stats.warnings).toBe(1);

      const logCall = console.warn.mock.calls[0][0];
      expect(logCall).toContain('⚠️');
      expect(logCall).toContain('Test warning message');
    });

    it('should respect log level', () => {
      const errorLogger = createLogger(LOG_LEVELS.ERROR);
      errorLogger.warn('This should not appear');

      expect(console.warn).not.toHaveBeenCalled();
      expect(errorLogger.stats.warnings).toBe(0);
    });
  });

  describe('info method', () => {
    it('should log info messages', () => {
      testLogger.info('Test info message');

      expect(console.log).toHaveBeenCalledTimes(1);

      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('ℹ️');
      expect(logCall).toContain('Test info message');
    });

    it('should use custom icon', () => {
      testLogger.info('Test with custom icon', '🚀');

      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('🚀');
      expect(logCall).toContain('Test with custom icon');
    });
  });

  describe('success method', () => {
    it('should log success messages and update stats', () => {
      testLogger.success('Operation completed');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(testLogger.stats.processed).toBe(1);

      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('✅');
      expect(logCall).toContain('Operation completed');
    });
  });

  describe('skipped method', () => {
    it('should log skipped messages and update stats', () => {
      testLogger.skipped('File skipped');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(testLogger.stats.skipped).toBe(1);

      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('⏭️');
      expect(logCall).toContain('File skipped');
    });
  });

  describe('debug method', () => {
    it('should log debug messages with data', () => {
      const debugData = { key: 'value', number: 42 };
      testLogger.debug('Debug message', debugData);

      expect(console.log).toHaveBeenCalledTimes(2); // message + data

      const messageCall = console.log.mock.calls[0][0];
      expect(messageCall).toContain('🐛');
      expect(messageCall).toContain('DEBUG: Debug message');

      const dataCall = console.log.mock.calls[1][0];
      expect(dataCall).toContain('"key": "value"');
      expect(dataCall).toContain('"number": 42');
    });

    it('should not log debug when level is too low', () => {
      const infoLogger = createLogger(LOG_LEVELS.INFO);
      infoLogger.debug('This should not appear');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('progress method', () => {
    it('should display progress bar', () => {
      testLogger.progress(5, 10, 'Processing');

      expect(process.stdout.write).toHaveBeenCalledTimes(1);

      const progressCall = process.stdout.write.mock.calls[0][0];
      expect(progressCall).toContain('50%');
      expect(progressCall).toContain('Processing');
      expect(progressCall).toContain('(5/10)');
    });

    it('should add newline when complete', () => {
      testLogger.progress(10, 10, 'Complete');

      // Debería haber dos llamadas: una para la barra y otra para el newline
      expect(process.stdout.write).toHaveBeenCalledTimes(2);

      const progressCall = process.stdout.write.mock.calls[0][0];
      expect(progressCall).toContain('100%');

      const newlineCall = process.stdout.write.mock.calls[1][0];
      expect(newlineCall).toBe('\n');
    });

    it('should not display progress when level is too low', () => {
      const errorLogger = createLogger(LOG_LEVELS.ERROR);
      errorLogger.progress(5, 10, 'Processing');

      expect(process.stdout.write).not.toHaveBeenCalled();
    });
  });

  describe('statistics tracking', () => {
    it('should track all statistics correctly', () => {
      expect(testLogger.stats.errors).toBe(0);
      expect(testLogger.stats.warnings).toBe(0);
      expect(testLogger.stats.processed).toBe(0);
      expect(testLogger.stats.skipped).toBe(0);

      testLogger.error('Error 1');
      testLogger.error('Error 2');
      testLogger.warn('Warning 1');
      testLogger.success('Success 1');
      testLogger.success('Success 2');
      testLogger.success('Success 3');
      testLogger.skipped('Skipped 1');

      expect(testLogger.stats.errors).toBe(2);
      expect(testLogger.stats.warnings).toBe(1);
      expect(testLogger.stats.processed).toBe(3);
      expect(testLogger.stats.skipped).toBe(1);
    });
  });
});

describe('setLogLevel function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set log level correctly', () => {
    setLogLevel('error');
    expect(logger.level).toBe(LOG_LEVELS.ERROR);

    setLogLevel('warn');
    expect(logger.level).toBe(LOG_LEVELS.WARN);

    setLogLevel('info');
    expect(logger.level).toBe(LOG_LEVELS.INFO);

    setLogLevel('debug');
    expect(logger.level).toBe(LOG_LEVELS.DEBUG);
  });

  it('should handle case insensitive input', () => {
    setLogLevel('ERROR');
    expect(logger.level).toBe(LOG_LEVELS.ERROR);

    setLogLevel('Debug');
    expect(logger.level).toBe(LOG_LEVELS.DEBUG);

    setLogLevel('WaRn');
    expect(logger.level).toBe(LOG_LEVELS.WARN);
  });

  it('should default to INFO for invalid levels', () => {
    setLogLevel('invalid');
    expect(logger.level).toBe(LOG_LEVELS.INFO);

    setLogLevel('');
    expect(logger.level).toBe(LOG_LEVELS.INFO);
  });
});

describe('createLogger function', () => {
  it('should create logger with specified level', () => {
    const errorLogger = createLogger(LOG_LEVELS.ERROR);
    expect(errorLogger.level).toBe(LOG_LEVELS.ERROR);

    const debugLogger = createLogger(LOG_LEVELS.DEBUG);
    expect(debugLogger.level).toBe(LOG_LEVELS.DEBUG);
  });

  it('should create logger with default level', () => {
    const defaultLogger = createLogger();
    expect(defaultLogger.level).toBe(LOG_LEVELS.INFO);
  });

  it('should create independent logger instances', () => {
    const logger1 = createLogger(LOG_LEVELS.ERROR);
    const logger2 = createLogger(LOG_LEVELS.DEBUG);

    logger1.error('Error in logger1');
    logger2.error('Error in logger2');

    expect(logger1.stats.errors).toBe(1);
    expect(logger2.stats.errors).toBe(1);
    expect(logger1.stats).not.toBe(logger2.stats);
  });
});
