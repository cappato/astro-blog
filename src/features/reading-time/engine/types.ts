/**
 * Reading Time Feature - Type Definitions
 * Framework-agnostic TypeScript interfaces for reading time calculations
 */

/**
 * Configuration options for reading time calculation
 */
export interface ReadingTimeConfig {
  /** Words per minute reading speed (default: 200) */
  wordsPerMinute: number;
  /** Minimum reading time in minutes (default: 1) */
  minimumTime: number;
  /** Locale for formatting (default: 'es-ES') */
  locale: string;
  /** Custom format template (default: '{time} min de lectura') */
  formatTemplate: string;
}

/**
 * Result of reading time calculation
 */
export interface ReadingTimeResult {
  /** Reading time in minutes */
  minutes: number;
  /** Formatted reading time string */
  formatted: string;
  /** Word count used for calculation */
  wordCount: number;
  /** Words per minute used */
  wordsPerMinute: number;
}

/**
 * Options for reading time calculation
 */
export interface ReadingTimeOptions {
  /** Words per minute (overrides config default) */
  wordsPerMinute?: number;
  /** Minimum time in minutes (overrides config default) */
  minimumTime?: number;
  /** Include word count in result */
  includeWordCount?: boolean;
}

/**
 * Text processing options
 */
export interface TextProcessingOptions {
  /** Strip HTML tags (default: true) */
  stripHtml?: boolean;
  /** Strip markdown syntax (default: false) */
  stripMarkdown?: boolean;
  /** Custom regex patterns to remove */
  customPatterns?: RegExp[];
}

/**
 * Formatting options
 */
export interface FormattingOptions {
  /** Locale for formatting */
  locale?: string;
  /** Custom format template */
  template?: string;
  /** Pluralization rules */
  pluralization?: {
    singular: string;
    plural: string;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ReadingTimeConfig = {
  wordsPerMinute: 200,
  minimumTime: 1,
  locale: 'es-ES',
  formatTemplate: '{time} min de lectura'
} as const;

/**
 * Common reading speeds for different audiences
 */
export const READING_SPEEDS = {
  SLOW: 150,        // Slow readers
  AVERAGE: 200,     // Average adult reading speed
  FAST: 250,        // Fast readers
  SPEED_READER: 400 // Speed readers
} as const;

/**
 * Language-specific format templates
 */
export const FORMAT_TEMPLATES = {
  'es-ES': '{time} min de lectura',
  'en-US': '{time} min read',
  'fr-FR': '{time} min de lecture',
  'de-DE': '{time} Min. Lesezeit',
  'it-IT': '{time} min di lettura',
  'pt-BR': '{time} min de leitura'
} as const;

export type SupportedLocale = keyof typeof FORMAT_TEMPLATES;
