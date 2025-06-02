/**
 * Reading Time Feature - Calculation Engine
 * Framework-agnostic reading time calculation with configurable options
 */

import type {
  ReadingTimeConfig,
  ReadingTimeResult,
  ReadingTimeOptions,
  TextProcessingOptions
} from './types';
import { DEFAULT_CONFIG } from './types';
import { TextProcessor } from './text-processor';

/**
 * ReadingTimeCalculator class for calculating reading times
 */
export class ReadingTimeCalculator {
  private config: ReadingTimeConfig;
  private textProcessor: TextProcessor;

  constructor(config: Partial<ReadingTimeConfig> = {}, textOptions: TextProcessingOptions = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.textProcessor = new TextProcessor(textOptions);
  }

  /**
   * Calculate reading time for given content
   */
  public calculate(content: string, options: ReadingTimeOptions = {}): ReadingTimeResult {
    // Validate input
    this.validateInput(content);

    // Get configuration values (options override config)
    const wordsPerMinute = options.wordsPerMinute ?? this.config.wordsPerMinute;
    const minimumTime = options.minimumTime ?? this.config.minimumTime;

    // Count words in content
    const wordCount = this.textProcessor.countWords(content);

    // Calculate reading time
    const rawMinutes = wordCount / wordsPerMinute;
    const minutes = Math.max(minimumTime, Math.round(rawMinutes));

    // Format the result
    const formatted = this.formatReadingTime(minutes);

    return {
      minutes,
      formatted,
      wordCount,
      wordsPerMinute
    };
  }

  /**
   * Calculate reading time and return only minutes
   */
  public calculateMinutes(content: string, wordsPerMinute?: number): number {
    const result = this.calculate(content, { wordsPerMinute });
    return result.minutes;
  }

  /**
   * Calculate reading time and return only formatted string
   */
  public calculateFormatted(content: string, wordsPerMinute?: number): string {
    const result = this.calculate(content, { wordsPerMinute });
    return result.formatted;
  }

  /**
   * Get word count for content
   */
  public getWordCount(content: string): number {
    this.validateInput(content);
    return this.textProcessor.countWords(content);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ReadingTimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ReadingTimeConfig {
    return { ...this.config };
  }

  /**
   * Format reading time according to configuration
   */
  public formatReadingTime(minutes: number): string {
    return this.config.formatTemplate.replace('{time}', minutes.toString());
  }

  /**
   * Validate input content
   */
  private validateInput(content: unknown): asserts content is string {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
  }
}

/**
 * Utility functions for quick calculations
 */

/**
 * Quick function to calculate reading time (backward compatibility)
 */
export function getReadingTime(content: string, wordsPerMinute: number = 200): number {
  const calculator = new ReadingTimeCalculator({ wordsPerMinute });
  return calculator.calculateMinutes(content);
}

/**
 * Quick function to format reading time (backward compatibility)
 */
export function formatReadingTime(minutes: number): string {
  const calculator = new ReadingTimeCalculator();
  return calculator.formatReadingTime(minutes);
}

/**
 * Quick function to calculate and format reading time
 */
export function calculateReadingTime(
  content: string, 
  options: ReadingTimeOptions = {}
): ReadingTimeResult {
  const calculator = new ReadingTimeCalculator();
  return calculator.calculate(content, options);
}

/**
 * Create a reading time calculator with custom configuration
 */
export function createCalculator(
  config: Partial<ReadingTimeConfig> = {},
  textOptions: TextProcessingOptions = {}
): ReadingTimeCalculator {
  return new ReadingTimeCalculator(config, textOptions);
}

/**
 * Estimate reading time for different reading speeds
 */
export function estimateForSpeeds(content: string): {
  slow: ReadingTimeResult;
  average: ReadingTimeResult;
  fast: ReadingTimeResult;
} {
  const calculator = new ReadingTimeCalculator();
  
  return {
    slow: calculator.calculate(content, { wordsPerMinute: 150 }),
    average: calculator.calculate(content, { wordsPerMinute: 200 }),
    fast: calculator.calculate(content, { wordsPerMinute: 250 })
  };
}

/**
 * Validate reading time configuration
 */
export function validateConfig(config: Partial<ReadingTimeConfig>): void {
  if (config.wordsPerMinute !== undefined) {
    if (config.wordsPerMinute <= 0) {
      throw new Error('Words per minute must be greater than 0');
    }
  }

  if (config.minimumTime !== undefined) {
    if (config.minimumTime < 0) {
      throw new Error('Minimum time cannot be negative');
    }
  }

  if (config.formatTemplate !== undefined) {
    if (!config.formatTemplate.includes('{time}')) {
      throw new Error('Format template must include {time} placeholder');
    }
  }
}
