# Reading Time Feature

## 🎯 Core Purpose

Framework-agnostic reading time calculation system that estimates how long it takes to read text content. Provides accurate word counting, configurable reading speeds, and localized formatting.

## 🏗️ Architecture

### Modular Structure
```
src/features/reading-time/
├── index.ts                    # Public API exports
├── engine/
│   ├── types.ts               # TypeScript interfaces & constants
│   ├── calculator.ts          # Core reading time calculation
│   ├── text-processor.ts      # Text cleaning & word counting
│   └── formatter.ts           # Display formatting utilities
├── __tests__/
│   └── reading-time.test.ts   # Comprehensive test suite (24 tests)
└── README.md                  # This documentation
```

### Design Principles
- ✅ **Framework Agnostic** - Pure TypeScript, works anywhere
- ✅ **Zero Dependencies** - No external packages required
- ✅ **Backward Compatible** - Maintains original API
- ✅ **Highly Configurable** - Customizable speeds, formats, locales
- ✅ **Self-Contained** - All functionality within feature directory

## 📋 Specifications

### Core Functionality
- **Word Counting**: Accurate text processing with HTML/Markdown stripping
- **Reading Time Calculation**: Configurable words-per-minute rates
- **Multiple Formats**: Localized output in 6 languages
- **Text Processing**: HTML tag removal, markdown syntax handling
- **Speed Estimation**: Multiple reading speed calculations

### Configuration Options
```typescript
interface ReadingTimeConfig {
  wordsPerMinute: number;    // Default: 200
  minimumTime: number;       // Default: 1 minute
  locale: string;           // Default: 'es-ES'
  formatTemplate: string;   // Default: '{time} min de lectura'
}
```

### Supported Locales
- 🇪🇸 Spanish: "5 min de lectura"
- 🇺🇸 English: "5 min read"
- 🇫🇷 French: "5 min de lecture"
- 🇩🇪 German: "5 Min. Lesezeit"
- 🇮🇹 Italian: "5 min di lettura"
- 🇧🇷 Portuguese: "5 min de leitura"

## 🧩 Components

### 1. ReadingTimeCalculator
**Purpose**: Core calculation engine
```typescript
const calculator = new ReadingTimeCalculator({
  wordsPerMinute: 200,
  minimumTime: 1
});

const result = calculator.calculate(content);
// { minutes: 5, formatted: "5 min de lectura", wordCount: 1000, wordsPerMinute: 200 }
```

### 2. TextProcessor
**Purpose**: Text cleaning and word counting
```typescript
const processor = new TextProcessor({
  stripHtml: true,
  stripMarkdown: false
});

const wordCount = processor.countWords(htmlContent);
const cleanText = processor.processText(htmlContent);
```

### 3. ReadingTimeFormatter
**Purpose**: Localized formatting
```typescript
const formatter = new ReadingTimeFormatter({ locale: 'en-US' });
const formatted = formatter.format(5); // "5 min read"
```

### 4. ReadingTime (Main Class)
**Purpose**: Simplified API for common use cases
```typescript
const rt = new ReadingTime({ wordsPerMinute: 250 });
const result = rt.calculate(content); // "4 min de lectura"
```

## 💡 Examples

### Basic Usage (Backward Compatible)
```typescript
import { getReadingTime, formatReadingTime } from '@features/reading-time';

const content = "Your blog post content here...";
const minutes = getReadingTime(content, 200);
const formatted = formatReadingTime(minutes);
console.log(formatted); // "5 min de lectura"
```

### Advanced Usage
```typescript
import { ReadingTime, estimateForSpeeds } from '@features/reading-time';

// Custom configuration
const rt = new ReadingTime({
  wordsPerMinute: 250,
  locale: 'en-US',
  formatTemplate: 'About {time} minutes'
});

const result = rt.getDetails(content);
console.log(result.formatted); // "About 4 minutes"

// Multiple speed estimates
const estimates = estimateForSpeeds(content);
console.log(estimates.slow.formatted);    // "6 min de lectura"
console.log(estimates.average.formatted); // "5 min de lectura"
console.log(estimates.fast.formatted);    // "4 min de lectura"
```

### Text Processing
```typescript
import { TextProcessor, countWords } from '@features/reading-time';

// Quick word count
const wordCount = countWords('<p>Hello <strong>world</strong>!</p>');
console.log(wordCount); // 2

// Advanced processing
const processor = new TextProcessor({
  stripHtml: true,
  stripMarkdown: true,
  customPatterns: [/\[.*?\]/g] // Remove square brackets
});

const analysis = processor.analyzeText(content);
console.log(analysis.wordCount);
console.log(analysis.processedText);
```

### Formatting Options
```typescript
import { ReadingTimeFormatter, formatForLocale } from '@features/reading-time';

// Different locales
console.log(formatForLocale(5, 'en-US')); // "5 min read"
console.log(formatForLocale(5, 'fr-FR')); // "5 min de lecture"

// Custom formatting
const formatter = new ReadingTimeFormatter();
console.log(formatter.formatShort(5));     // "5min"
console.log(formatter.formatRange(3, 5));  // "3-5 min de lectura"
```

## 🚨 Error Handling

### Input Validation
```typescript
// Throws error for non-string input
getReadingTime(null); // Error: Content must be a string
getReadingTime(123);  // Error: Content must be a string

// Handles empty content gracefully
getReadingTime('');   // Returns 1 (minimum time)
getReadingTime('  '); // Returns 1 (minimum time)
```

### Configuration Validation
```typescript
// Invalid configuration throws errors
new ReadingTimeCalculator({
  wordsPerMinute: 0  // Error: Words per minute must be greater than 0
});

new ReadingTimeCalculator({
  minimumTime: -1    // Error: Minimum time cannot be negative
});
```

## 🧪 AI Context

### Feature Purpose
Reading time estimation for blog posts and articles to improve user experience by setting reading expectations.

### Key Integration Points
- **Blog Post Layout**: Display reading time in post headers
- **Content Cards**: Show reading time in post previews
- **RSS Feeds**: Include reading time in feed metadata
- **SEO**: Add reading time to structured data

### Testing Coverage
- ✅ **24 comprehensive tests** covering all functionality
- ✅ **Edge cases**: Empty content, HTML/Markdown, Unicode
- ✅ **Error handling**: Invalid inputs, configuration errors
- ✅ **Performance**: Large content handling
- ✅ **Localization**: Multiple language formats

### Migration Notes
- **Backward Compatible**: Original `getReadingTime()` and `formatReadingTime()` functions preserved
- **Enhanced API**: New classes provide advanced functionality
- **Zero Breaking Changes**: Existing code continues to work
- **Improved Performance**: Better text processing algorithms

---

## 🔧 Integration

### Current Usage
```typescript
// In PostLayout.astro
import { getReadingTime, formatReadingTime } from '@features/reading-time';

const readingTime = getReadingTime(post.body);
const formattedTime = formatReadingTime(readingTime);
```

### Migration Path
1. ✅ **Phase 1**: Feature modularized (current)
2. 🔄 **Phase 2**: Update imports in PostLayout.astro
3. 🔄 **Phase 3**: Remove old utils/readingTime.ts
4. ✅ **Phase 4**: Tests migrated and passing

This feature is **production-ready** and **fully tested** with zero external dependencies!
