/**
 * Reading Time Feature - Main API Class
 * Simplified interface for common use cases
 */

import type { ReadingTimeConfig, ReadingTimeResult, ReadingTimeOptions } from './types';
import { ReadingTimeCalculator } from './calculator';
import { ReadingTimeFormatter } from './formatter';

/**
 * Main Reading Time API - Simplified interface for common use cases
 */
export class ReadingTime {
  private calculator: ReadingTimeCalculator;
  private formatter: ReadingTimeFormatter;

  constructor(config: Partial<ReadingTimeConfig> = {}) {
    this.calculator = new ReadingTimeCalculator(config);
    this.formatter = new ReadingTimeFormatter({ locale: config.locale });
  }

  /**
   * Calculate and format reading time in one call
   */
  public calculate(content: string, wordsPerMinute?: number): string {
    const minutes = this.calculator.calculateMinutes(content, wordsPerMinute);
    return this.formatter.format(minutes);
  }

  /**
   * Get detailed reading time information
   */
  public getDetails(content: string, options: ReadingTimeOptions = {}): ReadingTimeResult {
    return this.calculator.calculate(content, options);
  }

  /**
   * Get just the minutes
   */
  public getMinutes(content: string, wordsPerMinute?: number): number {
    return this.calculator.calculateMinutes(content, wordsPerMinute);
  }

  /**
   * Get word count
   */
  public getWordCount(content: string): number {
    return this.calculator.getWordCount(content);
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ReadingTimeConfig>): void {
    this.calculator.updateConfig(config);
    if (config.locale) {
      this.formatter.updateLocale(config.locale);
    }
  }
}

/**
 * Create a new ReadingTime instance with configuration
 */
export function createReadingTime(config: Partial<ReadingTimeConfig> = {}): ReadingTime {
  return new ReadingTime(config);
}

/**
 * Default ReadingTime instance for quick usage
 */
export const readingTime = new ReadingTime();
