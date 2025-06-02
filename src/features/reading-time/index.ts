/**
 * Reading Time Feature - Public API
 * Framework-agnostic reading time calculation system
 *
 * @example
 * ```typescript
 * import { getReadingTime, formatReadingTime } from '@features/reading-time';
 *
 * const content = "Your blog post content here...";
 * const minutes = getReadingTime(content);
 * const formatted = formatReadingTime(minutes);
 * console.log(formatted); // "5 min de lectura"
 * ```
 */

// Type exports first
export type {
  ReadingTimeConfig,
  ReadingTimeResult,
  ReadingTimeOptions,
  TextProcessingOptions,
  FormattingOptions,
  SupportedLocale
} from './engine/types';

export {
  DEFAULT_CONFIG,
  READING_SPEEDS,
  FORMAT_TEMPLATES
} from './engine/types';

// Core engine exports
export {
  ReadingTimeCalculator,
  getReadingTime,
  formatReadingTime,
  calculateReadingTime,
  createCalculator,
  estimateForSpeeds,
  validateConfig
} from './engine/calculator';

export {
  TextProcessor,
  stripHtml,
  countWords,
  cleanText,
  validateTextInput,
  isEmptyText
} from './engine/text-processor';

export {
  ReadingTimeFormatter,
  formatReadingTime as formatTime,
  formatForLocale,
  formatWithTemplate,
  formatShort,
  formatDetailed,
  formatRange,
  createFormatter,
  getAvailableTemplates,
  validateTemplate,
  generateFormatExamples
} from './engine/formatter';

// Main API exports
export {
  ReadingTime,
  createReadingTime,
  readingTime
} from './engine/main-api';

/**
 * Quick utility functions (backward compatibility with original API)
 */

/**
 * Calculate reading time in minutes (original API)
 * @param content - Text content to analyze
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function getReadingTimeMinutes(content: string, wordsPerMinute: number = 200): number {
  return getReadingTime(content, wordsPerMinute);
}

/**
 * Calculate and format reading time (original API)
 * @param content - Text content to analyze
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Formatted reading time string
 */
export function getFormattedReadingTime(content: string, wordsPerMinute: number = 200): string {
  const minutes = getReadingTime(content, wordsPerMinute);
  return formatReadingTime(minutes);
}

/**
 * Feature metadata for documentation and tooling
 */
export const FEATURE_INFO = {
  name: 'Reading Time',
  version: '1.0.0',
  description: 'Framework-agnostic reading time calculation system',
  dependencies: [],
  exports: [
    'getReadingTime',
    'formatReadingTime', 
    'ReadingTime',
    'ReadingTimeCalculator',
    'TextProcessor',
    'ReadingTimeFormatter'
  ],
  compatibility: {
    frameworks: ['Astro', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
    environments: ['Browser', 'Node.js', 'Deno', 'Bun']
  }
} as const;
