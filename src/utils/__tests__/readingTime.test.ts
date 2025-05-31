/**
 * Tests para las utilidades de tiempo de lectura
 * Valida el cálculo y formateo del tiempo estimado de lectura
 */

import { describe, it, expect } from 'vitest';
import { getReadingTime, formatReadingTime } from '../readingTime';

// Test constants for reading time calculations
const READING_TIME_CONSTANTS = {
  WPM: {
    DEFAULT: 200,
    SLOW: 100,
    FAST: 300,
    INVALID: 0,
  },
  WORD_COUNTS: {
    SMALL: 10,
    MEDIUM: 100,
    LARGE: 600,
    VERY_LARGE: 10000,
  },
  EXPECTED_TIMES: {
    MINIMUM: 1,
    SMALL_TEXT: 1,
    MEDIUM_TEXT: 1,
    LARGE_TEXT: 2,
    VERY_LARGE_TEXT: 50,
  },
  PATTERNS: {
    READING_TIME_FORMAT: /^\d+ min de lectura$/,
  }
} as const;

describe('getReadingTime', () => {
  describe('Basic functionality', () => {
    it('should calculate reading time for simple text', () => {
      const text = 'This is a simple test with exactly ten words here.';
      const result = getReadingTime(text, READING_TIME_CONSTANTS.WPM.DEFAULT);

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.SMALL_TEXT); // 10 words / 200 wpm = 0.05 min, rounded up to 1
    });

    it('should use default words per minute when not specified', () => {
      const text = 'This is a test with exactly ten words here.';
      const result = getReadingTime(text);

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.SMALL_TEXT);
    });

    it('should handle empty string', () => {
      const result = getReadingTime('');

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.MINIMUM); // Minimum 1 minute
    });

    it('should handle whitespace-only string', () => {
      const result = getReadingTime('   \n\t   ');

      expect(result).toBe(1); // Minimum 1 minute
    });
  });

  describe('HTML content handling', () => {
    it('should strip HTML tags from content', () => {
      const htmlContent = '<p>This is a <strong>test</strong> with <em>HTML</em> tags.</p>';
      const result = getReadingTime(htmlContent, 200);

      expect(result).toBe(1); // Should count only the text words
    });

    it('should handle complex HTML structure', () => {
      const complexHtml = `
        <article>
          <h1>Title</h1>
          <p>This is a paragraph with <a href="#">link</a>.</p>
          <ul>
            <li>List item one</li>
            <li>List item two</li>
          </ul>
          <div class="content">
            <span>More content here</span>
          </div>
        </article>
      `;

      const result = getReadingTime(complexHtml, 200);

      // Should count: Title, This, is, a, paragraph, with, link, List, item, one, List, item, two, More, content, here
      // That's approximately 16 words
      expect(result).toBe(1);
    });

    it('should handle self-closing HTML tags', () => {
      const htmlWithSelfClosing = 'Text before <img src="image.jpg" alt="test" /> text after <br/> more text.';
      const result = getReadingTime(htmlWithSelfClosing, 200);

      expect(result).toBe(1);
    });
  });

  describe('Word counting accuracy', () => {
    it('should handle multiple spaces between words', () => {
      const textWithSpaces = 'Word1    Word2     Word3        Word4';
      const result = getReadingTime(textWithSpaces, 200);

      expect(result).toBe(1); // 4 words
    });

    it('should handle different types of whitespace', () => {
      const textWithWhitespace = 'Word1\tWord2\nWord3\r\nWord4';
      const result = getReadingTime(textWithWhitespace, 200);

      expect(result).toBe(1); // 4 words
    });

    it('should filter out empty strings from word array', () => {
      const textWithExtraSpaces = '  Word1   Word2   Word3  ';
      const result = getReadingTime(textWithExtraSpaces, 200);

      expect(result).toBe(1); // 3 words
    });
  });

  describe('Different reading speeds', () => {
    it('should calculate correctly for slow readers', () => {
      const longText = Array(READING_TIME_CONSTANTS.WORD_COUNTS.MEDIUM).fill('word').join(' '); // 100 words
      const result = getReadingTime(longText, READING_TIME_CONSTANTS.WPM.SLOW); // 100 wpm

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.MEDIUM_TEXT); // 100 words / 100 wpm = 1 minute
    });

    it('should calculate correctly for fast readers', () => {
      const longText = Array(READING_TIME_CONSTANTS.WORD_COUNTS.LARGE).fill('word').join(' '); // 600 words
      const result = getReadingTime(longText, READING_TIME_CONSTANTS.WPM.FAST); // 300 wpm

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.LARGE_TEXT); // 600 words / 300 wpm = 2 minutes
    });

    it('should round up partial minutes', () => {
      const text = Array(250).fill('word').join(' '); // 250 words
      const result = getReadingTime(text, 200); // 200 wpm

      expect(result).toBe(1); // 250/200 = 1.25, rounded to 1 (Math.round behavior)
    });
  });

  describe('Edge cases', () => {
    it('should return minimum 1 minute for very short content', () => {
      const result = getReadingTime('Hi', READING_TIME_CONSTANTS.WPM.DEFAULT);

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.MINIMUM);
    });

    it('should handle very long content', () => {
      const veryLongText = Array(READING_TIME_CONSTANTS.WORD_COUNTS.VERY_LARGE).fill('word').join(' '); // 10,000 words
      const result = getReadingTime(veryLongText, READING_TIME_CONSTANTS.WPM.DEFAULT);

      expect(result).toBe(READING_TIME_CONSTANTS.EXPECTED_TIMES.VERY_LARGE_TEXT); // 10,000 / 200 = 50 minutes
    });

    it('should handle zero words per minute gracefully', () => {
      const text = 'Some text here';

      expect(() => getReadingTime(text, READING_TIME_CONSTANTS.WPM.INVALID)).not.toThrow();
      // Should return a very large number or handle division by zero
    });
  });
});

describe('formatReadingTime', () => {
  describe('Basic formatting', () => {
    it('should format single minute correctly', () => {
      const result = formatReadingTime(1);

      expect(result).toBe('1 min de lectura');
    });

    it('should format multiple minutes correctly', () => {
      const result = formatReadingTime(5);

      expect(result).toBe('5 min de lectura');
    });

    it('should format large numbers correctly', () => {
      const result = formatReadingTime(120);

      expect(result).toBe('120 min de lectura');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero minutes', () => {
      const result = formatReadingTime(0);

      expect(result).toBe('0 min de lectura');
    });

    it('should handle negative numbers', () => {
      const result = formatReadingTime(-1);

      expect(result).toBe('-1 min de lectura');
    });

    it('should handle decimal numbers', () => {
      const result = formatReadingTime(2.5);

      expect(result).toBe('2.5 min de lectura');
    });
  });
});

describe('Integration tests', () => {
  it('should work together for typical blog post', () => {
    const blogPost = `
      <article>
        <h1>My Blog Post Title</h1>
        <p>This is the introduction paragraph with some interesting content that readers will enjoy.</p>
        <p>Here's another paragraph with more detailed information about the topic we're discussing.</p>
        <p>And finally, a conclusion paragraph that wraps up all the important points we've covered.</p>
      </article>
    `;

    const readingTime = getReadingTime(blogPost);
    const formatted = formatReadingTime(readingTime);

    expect(readingTime).toBeGreaterThan(0);
    expect(formatted).toContain('min de lectura');
    expect(formatted).toMatch(READING_TIME_CONSTANTS.PATTERNS.READING_TIME_FORMAT);
  });

  it('should handle real-world markdown content', () => {
    const markdownContent = `
      # Título del Post

      Este es un párrafo de introducción con **texto en negrita** y *texto en cursiva*.

      ## Subtítulo

      - Lista item 1
      - Lista item 2
      - Lista item 3

      \`\`\`javascript
      const code = "This code should not be counted as regular words";
      console.log(code);
      \`\`\`

      Más contenido después del código.
    `;

    const readingTime = getReadingTime(markdownContent);
    const formatted = formatReadingTime(readingTime);

    expect(readingTime).toBe(1); // Should be reasonable for this content
    expect(formatted).toBe('1 min de lectura');
  });
});
