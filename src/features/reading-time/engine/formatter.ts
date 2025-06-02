/**
 * Reading Time Feature - Formatting Engine
 * Framework-agnostic text formatting utilities for reading time display
 */

import type {
  FormattingOptions,
  SupportedLocale,
  ReadingTimeResult
} from './types';
import { FORMAT_TEMPLATES } from './types';

/**
 * ReadingTimeFormatter class for formatting reading time display
 */
export class ReadingTimeFormatter {
  private locale: string;
  private template: string;

  constructor(options: FormattingOptions = {}) {
    this.locale = options.locale || 'es-ES';
    this.template = options.template || this.getDefaultTemplate();
  }

  /**
   * Format reading time with current configuration
   */
  public format(minutes: number): string {
    return this.template.replace('{time}', minutes.toString());
  }

  /**
   * Format reading time result object
   */
  public formatResult(result: ReadingTimeResult): string {
    return this.format(result.minutes);
  }

  /**
   * Format with custom template
   */
  public formatWithTemplate(minutes: number, template: string): string {
    return template.replace('{time}', minutes.toString());
  }

  /**
   * Format with pluralization support
   */
  public formatWithPluralization(
    minutes: number, 
    singular: string, 
    plural: string
  ): string {
    const unit = minutes === 1 ? singular : plural;
    return `${minutes} ${unit}`;
  }

  /**
   * Format for different locales
   */
  public formatForLocale(minutes: number, locale: SupportedLocale): string {
    const template = FORMAT_TEMPLATES[locale];
    return this.formatWithTemplate(minutes, template);
  }

  /**
   * Format with additional context (word count, speed)
   */
  public formatDetailed(result: ReadingTimeResult): string {
    const baseFormat = this.format(result.minutes);
    return `${baseFormat} (${result.wordCount} palabras)`;
  }

  /**
   * Format as short version (just number + unit)
   */
  public formatShort(minutes: number): string {
    return `${minutes}min`;
  }

  /**
   * Format with range (for variable reading speeds)
   */
  public formatRange(minMinutes: number, maxMinutes: number): string {
    if (minMinutes === maxMinutes) {
      return this.format(minMinutes);
    }
    return `${minMinutes}-${maxMinutes} min de lectura`;
  }

  /**
   * Update locale and template
   */
  public updateLocale(locale: string): void {
    this.locale = locale;
    this.template = this.getDefaultTemplate();
  }

  /**
   * Update template
   */
  public updateTemplate(template: string): void {
    if (!template.includes('{time}')) {
      throw new Error('Template must include {time} placeholder');
    }
    this.template = template;
  }

  /**
   * Get current configuration
   */
  public getConfig(): { locale: string; template: string } {
    return {
      locale: this.locale,
      template: this.template
    };
  }

  /**
   * Get default template for current locale
   */
  private getDefaultTemplate(): string {
    const supportedLocale = this.locale as SupportedLocale;
    return FORMAT_TEMPLATES[supportedLocale] || FORMAT_TEMPLATES['es-ES'];
  }
}

/**
 * Utility functions for quick formatting
 */

/**
 * Quick format function (backward compatibility)
 */
export function formatReadingTime(minutes: number): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.format(minutes);
}

/**
 * Format for specific locale
 */
export function formatForLocale(minutes: number, locale: SupportedLocale): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.formatForLocale(minutes, locale);
}

/**
 * Format with custom template
 */
export function formatWithTemplate(minutes: number, template: string): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.formatWithTemplate(minutes, template);
}

/**
 * Format short version
 */
export function formatShort(minutes: number): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.formatShort(minutes);
}

/**
 * Format detailed version with word count
 */
export function formatDetailed(result: ReadingTimeResult): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.formatDetailed(result);
}

/**
 * Format range for variable reading speeds
 */
export function formatRange(minMinutes: number, maxMinutes: number): string {
  const formatter = new ReadingTimeFormatter();
  return formatter.formatRange(minMinutes, maxMinutes);
}

/**
 * Create formatter with custom options
 */
export function createFormatter(options: FormattingOptions = {}): ReadingTimeFormatter {
  return new ReadingTimeFormatter(options);
}

/**
 * Get all available format templates
 */
export function getAvailableTemplates(): Record<SupportedLocale, string> {
  return { ...FORMAT_TEMPLATES };
}

/**
 * Validate format template
 */
export function validateTemplate(template: string): boolean {
  return template.includes('{time}');
}

/**
 * Generate format examples for all locales
 */
export function generateFormatExamples(minutes: number = 5): Record<SupportedLocale, string> {
  const examples: Record<string, string> = {};
  
  for (const [locale, template] of Object.entries(FORMAT_TEMPLATES)) {
    examples[locale] = template.replace('{time}', minutes.toString());
  }
  
  return examples as Record<SupportedLocale, string>;
}
