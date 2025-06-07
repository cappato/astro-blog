/**
 * Reading Time Feature Tests
 * Comprehensive test suite for reading time calculation system
 * Migrated from src/utils/__tests__/readingTime.test.ts
 */

import { describe, test, expect } from 'vitest';
import {
  getReadingTime,
  formatReadingTime,
  ReadingTimeCalculator,
  TextProcessor,
  ReadingTimeFormatter,
  ReadingTime,
  createReadingTime,
  calculateReadingTime,
  estimateForSpeeds,
  DEFAULT_CONFIG,
  READING_SPEEDS
} from '../index.ts';

describe('Reading Time Feature', () => {
  describe('Core Functions (Backward Compatibility)', () => {
    test('should calculate reading time for simple text', () => {
      const text = 'This is a simple test with exactly ten words here.';
      const result = getReadingTime(text, 200);
      expect(result).toBe(1); // 10 words at 200 wpm = 0.05 min, rounded up to 1
    });

    test('should handle empty text', () => {
      expect(getReadingTime('', 200)).toBe(1); // Minimum time
      expect(getReadingTime('   ', 200)).toBe(1); // Whitespace only
    });

    test('should handle HTML content', () => {
      const htmlText = '<p>This is a <strong>test</strong> with <em>HTML</em> tags.</p>';
      const result = getReadingTime(htmlText, 200);
      expect(result).toBe(1); // Should strip HTML and count words
    });

    test('should respect minimum reading time', () => {
      const shortText = 'Short.';
      const result = getReadingTime(shortText, 200);
      expect(result).toBe(1); // Should be at least 1 minute
    });

    test('should calculate longer reading times correctly', () => {
      const longText = 'word '.repeat(400); // 400 words
      const result = getReadingTime(longText, 200);
      expect(result).toBe(2); // 400 words at 200 wpm = 2 minutes
    });

    test('should handle different reading speeds', () => {
      const text = 'word '.repeat(300); // 300 words
      
      expect(getReadingTime(text, 100)).toBe(3); // Slow reader
      expect(getReadingTime(text, 200)).toBe(2); // Average reader  
      expect(getReadingTime(text, 300)).toBe(1); // Fast reader
    });

    test('should format reading time correctly', () => {
      expect(formatReadingTime(1)).toBe('1 min de lectura');
      expect(formatReadingTime(5)).toBe('5 min de lectura');
      expect(formatReadingTime(10)).toBe('10 min de lectura');
    });
  });

  describe('ReadingTimeCalculator Class', () => {
    test('should create calculator with default config', () => {
      const calculator = new ReadingTimeCalculator();
      const config = calculator.getConfig();
      
      expect(config.wordsPerMinute).toBe(200);
      expect(config.minimumTime).toBe(1);
      expect(config.locale).toBe('es-ES');
    });

    test('should create calculator with custom config', () => {
      const calculator = new ReadingTimeCalculator({
        wordsPerMinute: 250,
        minimumTime: 2,
        locale: 'en-US'
      });
      
      const config = calculator.getConfig();
      expect(config.wordsPerMinute).toBe(250);
      expect(config.minimumTime).toBe(2);
      expect(config.locale).toBe('en-US');
    });

    test('should calculate detailed results', () => {
      const calculator = new ReadingTimeCalculator();
      const text = 'word '.repeat(100); // 100 words
      
      const result = calculator.calculate(text);
      
      expect(result.minutes).toBe(1);
      expect(result.wordCount).toBe(100);
      expect(result.wordsPerMinute).toBe(200);
      expect(result.formatted).toBe('1 min de lectura');
    });

    test('should update configuration', () => {
      const calculator = new ReadingTimeCalculator();
      
      calculator.updateConfig({ wordsPerMinute: 300 });
      
      const config = calculator.getConfig();
      expect(config.wordsPerMinute).toBe(300);
    });
  });

  describe('TextProcessor Class', () => {
    test('should strip HTML tags', () => {
      const processor = new TextProcessor({ stripHtml: true });
      const html = '<p> <strong>world</strong>!</p>';
      
      const processed = processor.processText(html);
      expect(processed).toBe('world!');
    });

    test('should count words correctly', () => {
      const processor = new TextProcessor();
      
      expect(processor.countWords(' world')).toBe(1);
      expect(processor.countWords('     world  ')).toBe(2);
      expect(processor.countWords('')).toBe(0);
    });

    test('should handle markdown when enabled', () => {
      const processor = new TextProcessor({ stripMarkdown: true });
      const markdown = '# Title\n\nThis is **bold** and *italic* text.';
      
      const processed = processor.processText(markdown);
      expect(processed).not.toContain('#');
      expect(processed).not.toContain('**');
      expect(processed).not.toContain('*');
    });

    test('should apply custom patterns', () => {
      const processor = new TextProcessor({
        customPatterns: [/\[.*?\]/g] // Remove square brackets
      });
      
      const text = ' [world] test';
      const processed = processor.processText(text);
      expect(processed).toBe('test');
    });

    test('should analyze text comprehensively', () => {
      const processor = new TextProcessor();
      const text = '<p> world</p>';
      
      const analysis = processor.analyzeText(text);
      
      expect(analysis.originalLength).toBe(text.length);
      expect(analysis.wordCount).toBe(1);
      expect(analysis.processedText).toBe('world');
    });
  });

  describe('ReadingTimeFormatter Class', () => {
    test('should format with default template', () => {
      const formatter = new ReadingTimeFormatter();
      
      expect(formatter.format(5)).toBe('5 min de lectura');
    });

    test('should format for different locales', () => {
      const formatter = new ReadingTimeFormatter();
      
      expect(formatter.formatForLocale(5, 'en-US')).toBe('5 min read');
      expect(formatter.formatForLocale(5, 'fr-FR')).toBe('5 min de lecture');
    });

    test('should format with custom template', () => {
      const formatter = new ReadingTimeFormatter();
      
      const result = formatter.formatWithTemplate(5, 'Reading time: {time} minutes');
      expect(result).toBe('Reading time: 5 minutes');
    });

    test('should format short version', () => {
      const formatter = new ReadingTimeFormatter();
      
      expect(formatter.formatShort(5)).toBe('5min');
    });

    test('should format range', () => {
      const formatter = new ReadingTimeFormatter();
      
      expect(formatter.formatRange(3, 5)).toBe('3-5 min de lectura');
      expect(formatter.formatRange(5, 5)).toBe('5 min de lectura');
    });
  });

  describe('ReadingTime Main Class', () => {
    test('should calculate and format in one call', () => {
      const rt = new ReadingTime();
      const text = 'word '.repeat(200); // 200 words
      
      const result = rt.calculate(text);
      expect(result).toBe('1 min de lectura');
    });

    test('should get detailed information', () => {
      const rt = new ReadingTime();
      const text = 'word '.repeat(300); // 300 words
      
      const details = rt.getDetails(text);
      
      expect(details.minutes).toBe(2);
      expect(details.wordCount).toBe(300);
      expect(details.formatted).toBe('2 min de lectura');
    });

    test('should update configuration', () => {
      const rt = new ReadingTime();
      
      rt.updateConfig({ wordsPerMinute: 300, locale: 'en-US' });
      
      const text = 'word '.repeat(300); // 300 words
      const result = rt.calculate(text);
      
      expect(result).toBe('1 min read'); // 300 words at 300 wpm = 1 min
    });
  });

  describe('Utility Functions', () => {
    test('should estimate for different speeds', () => {
      const text = 'word '.repeat(300); // 300 words
      const estimates = estimateForSpeeds(text);
      
      expect(estimates.slow.minutes).toBe(2); // 300/150 = 2
      expect(estimates.average.minutes).toBe(2); // 300/200 = 1.5 → 2
      expect(estimates.fast.minutes).toBe(1); // 300/250 = 1.2 → 1
    });

    test('should create reading time with config', () => {
      const rt = createReadingTime({ wordsPerMinute: 250 });
      const text = 'word '.repeat(250); // 250 words
      
      const result = rt.calculate(text);
      expect(result).toBe('1 min de lectura');
    });

    test('should calculate reading time with options', () => {
      const text = 'word '.repeat(400); // 400 words
      
      const result = calculateReadingTime(text, { wordsPerMinute: 200 });
      
      expect(result.minutes).toBe(2);
      expect(result.wordCount).toBe(400);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle non-string input gracefully', () => {
      expect(() => getReadingTime(null as any)).toThrow();
      expect(() => getReadingTime(undefined as any)).toThrow();
      expect(() => getReadingTime(123 as any)).toThrow();
    });

    test('should handle very long content', () => {
      const longText = 'word '.repeat(10000); // 10,000 words
      const result = getReadingTime(longText, 200);
      
      expect(result).toBe(50); // 10,000 / 200 = 50 minutes
    });

    test('should handle special characters and unicode', () => {
      const unicodeText = 'Hola 世界  café naïve résumé';
      const result = getReadingTime(unicodeText, 200);
      
      expect(result).toBe(1); // Should count words correctly
    });

    test('should handle mixed content types', () => {
      const mixedContent = `
        <h1>Title</h1>
        <p>Regular paragraph with <strong>bold</strong> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <code>const code = "example";</code>
      `;
      
      const result = getReadingTime(mixedContent, 200);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Configuration and Constants', () => {
    test('should have correct default configuration', () => {
      expect(DEFAULT_CONFIG.wordsPerMinute).toBe(200);
      expect(DEFAULT_CONFIG.minimumTime).toBe(1);
      expect(DEFAULT_CONFIG.locale).toBe('es-ES');
      expect(DEFAULT_CONFIG.formatTemplate).toBe('{time} min de lectura');
    });

    test('should have reading speed constants', () => {
      expect(READING_SPEEDS.SLOW).toBe(150);
      expect(READING_SPEEDS.AVERAGE).toBe(200);
      expect(READING_SPEEDS.FAST).toBe(250);
      expect(READING_SPEEDS.SPEED_READER).toBe(400);
    });
  });
});
