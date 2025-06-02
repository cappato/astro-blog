/**
 * Reading Time Feature - Text Processing Engine
 * Framework-agnostic text processing utilities for reading time calculations
 */

import type { TextProcessingOptions } from './types';

/**
 * Default HTML tag removal regex
 * Matches opening and closing HTML tags including self-closing tags
 */
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

/**
 * Basic markdown syntax removal patterns
 */
const MARKDOWN_PATTERNS = [
  /#{1,6}\s+/g,           // Headers (# ## ### etc.)
  /\*\*(.*?)\*\*/g,       // Bold **text**
  /\*(.*?)\*/g,           // Italic *text*
  /`{1,3}(.*?)`{1,3}/g,   // Code `code` or ```code```
  /\[(.*?)\]\(.*?\)/g,    // Links [text](url)
  /!\[(.*?)\]\(.*?\)/g,   // Images ![alt](url)
  /^\s*[-*+]\s+/gm,       // List items
  /^\s*\d+\.\s+/gm,       // Numbered lists
  /^\s*>\s+/gm,           // Blockquotes
  /^\s*---+\s*$/gm,       // Horizontal rules
  /^\s*\|.*\|\s*$/gm      // Tables
];

/**
 * Word splitting regex
 * Splits on any whitespace character (space, tab, newline, etc.)
 */
const WORD_SPLIT_REGEX = /\s+/g;

/**
 * TextProcessor class for handling text cleaning and word counting
 */
export class TextProcessor {
  private options: Required<TextProcessingOptions>;

  constructor(options: TextProcessingOptions = {}) {
    this.options = {
      stripHtml: true,
      stripMarkdown: false,
      customPatterns: [],
      ...options
    };
  }

  /**
   * Process text and return clean text for word counting
   */
  public processText(content: string): string {
    let processedText = content;

    // Strip HTML tags if enabled
    if (this.options.stripHtml) {
      processedText = this.stripHtmlTags(processedText);
    }

    // Strip markdown syntax if enabled
    if (this.options.stripMarkdown) {
      processedText = this.stripMarkdownSyntax(processedText);
    }

    // Apply custom patterns
    if (this.options.customPatterns.length > 0) {
      processedText = this.applyCustomPatterns(processedText);
    }

    return processedText.trim();
  }

  /**
   * Count words in processed text
   */
  public countWords(content: string): number {
    const processedText = this.processText(content);
    
    if (!processedText) {
      return 0;
    }

    // Split by whitespace and filter out empty strings
    const words = processedText
      .split(WORD_SPLIT_REGEX)
      .filter(word => word.length > 0);

    return words.length;
  }

  /**
   * Get detailed text analysis
   */
  public analyzeText(content: string): {
    originalLength: number;
    processedLength: number;
    wordCount: number;
    characterCount: number;
    processedText: string;
  } {
    const processedText = this.processText(content);
    const wordCount = this.countWords(content);

    return {
      originalLength: content.length,
      processedLength: processedText.length,
      wordCount,
      characterCount: processedText.replace(/\s/g, '').length,
      processedText
    };
  }

  /**
   * Remove HTML tags from text
   */
  private stripHtmlTags(text: string): string {
    return text.replace(HTML_TAG_REGEX, '');
  }

  /**
   * Remove markdown syntax from text
   */
  private stripMarkdownSyntax(text: string): string {
    let cleanText = text;

    // Apply all markdown patterns
    for (const pattern of MARKDOWN_PATTERNS) {
      cleanText = cleanText.replace(pattern, '$1');
    }

    return cleanText;
  }

  /**
   * Apply custom regex patterns
   */
  private applyCustomPatterns(text: string): string {
    let cleanText = text;

    for (const pattern of this.options.customPatterns) {
      cleanText = cleanText.replace(pattern, '');
    }

    return cleanText;
  }
}

/**
 * Utility functions for quick text processing
 */

/**
 * Quick function to strip HTML tags from text
 */
export function stripHtml(text: string): string {
  return text.replace(HTML_TAG_REGEX, '');
}

/**
 * Quick function to count words in text (with HTML stripping)
 */
export function countWords(text: string, stripHtmlTags: boolean = true): number {
  const processor = new TextProcessor({ stripHtml: stripHtmlTags });
  return processor.countWords(text);
}

/**
 * Quick function to clean text for word counting
 */
export function cleanText(text: string, options: TextProcessingOptions = {}): string {
  const processor = new TextProcessor(options);
  return processor.processText(text);
}

/**
 * Validate text input
 */
export function validateTextInput(text: unknown): string {
  if (typeof text !== 'string') {
    throw new Error('Text input must be a string');
  }
  return text;
}

/**
 * Check if text is effectively empty after processing
 */
export function isEmptyText(text: string, options: TextProcessingOptions = {}): boolean {
  const processor = new TextProcessor(options);
  const processed = processor.processText(text);
  return processed.length === 0;
}
