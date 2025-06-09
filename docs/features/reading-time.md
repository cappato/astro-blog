# Reading Time Feature

## 🎯 Core Purpose

Framework-agnostic reading time calculation system that estimates how long it takes to read text content. Provides accurate word counting, configurable reading speeds, and localized formatting for blog posts and articles.

## 🏗️ Architecture

### Modular Structure
- **Location**: `src/features/reading-time/`
- **Type**: Framework-agnostic TypeScript feature
- **Dependencies**: Zero external dependencies
- **Tests**: 33 comprehensive tests

### Design Principles
- ✅ **Framework Agnostic** - Pure TypeScript, works anywhere
- ✅ **Zero Dependencies** - No external packages required
- ✅ **Backward Compatible** - Maintains original API
- ✅ **Highly Configurable** - Customizable speeds, formats, locales
- ✅ **Self-Contained** - All functionality within feature directory

## 📋 Specifications

### Core Functionality
- **Word Counting**: Accurate text processing with HTML/Markdown stripping
- **Reading Time Calculation**: Configurable words-per-minute rates (default: 200 WPM)
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
Core calculation engine with configurable options.

### 2. TextProcessor
Text cleaning and word counting with HTML/Markdown support.

### 3. ReadingTimeFormatter
Localized formatting for different languages and templates.

### 4. ReadingTime (Main Class)
Simplified API for common use cases.

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

## 🔧 Integration

### Current Usage
```typescript
// In PostLayout.astro
import { getReadingTime, formatReadingTime } from '@features/reading-time';

const readingTime = getReadingTime(post.body);
const formattedTime = formatReadingTime(readingTime);
```

### Migration Completed
- ✅ **Phase 1**: Feature modularized
- ✅ **Phase 2**: Imports updated in PostLayout.astro
- ✅ **Phase 3**: Old utils/readingTime.ts removed
- ✅ **Phase 4**: Tests migrated and passing (33 tests)

## 🧪 Testing

### Test Coverage
- ✅ **33 comprehensive tests** covering all functionality
- ✅ **Edge cases**: Empty content, HTML/Markdown, Unicode
- ✅ **Error handling**: Invalid inputs, configuration errors
- ✅ **Performance**: Large content handling
- ✅ **Localization**: Multiple language formats
- ✅ **Backward compatibility**: Original API preserved

### Test Commands
```bash
# Run reading time tests specifically
npx vitest run src/features/reading-time/__tests__/reading-time.test.ts

# Run all unit tests (includes reading time)
npm run test:unit
```

## 🚨 Error Handling

### Input Validation
- Throws error for non-string input
- Handles empty content gracefully (returns minimum time)
- Validates configuration parameters

### Configuration Validation
- Words per minute must be greater than 0
- Minimum time cannot be negative
- Format template must include {time} placeholder

## 🎯 AI Context

### Feature Purpose
Reading time estimation for blog posts and articles to improve user experience by setting reading expectations.

### Key Integration Points
- **Blog Post Layout**: Display reading time in post headers
- **Content Cards**: Show reading time in post previews
- **RSS Feeds**: Include reading time in feed metadata
- **SEO**: Add reading time to structured data

### Benefits Achieved
- ✅ **Modular Architecture**: Self-contained, reusable feature
- ✅ **Zero Dependencies**: No external packages required
- ✅ **Framework Agnostic**: Works with any JavaScript framework
- ✅ **Backward Compatible**: Existing code continues to work
- ✅ **Enhanced API**: New classes provide advanced functionality
- ✅ **Comprehensive Testing**: 33 tests ensure reliability
- ✅ **Improved Performance**: Better text processing algorithms

---

## 📊 Migration Summary

| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| **Location** | `src/utils/readingTime.ts` | `src/features/reading-time/` | ✅ Migrated |
| **Tests** | `src/utils/__tests__/` | `src/features/reading-time/__tests__/` | ✅ Migrated |
| **API** | Basic functions | Enhanced classes + backward compatibility | ✅ Enhanced |
| **Dependencies** | Zero | Zero | ✅ Maintained |
| **Usage** | `../utils/readingTime` | `../features/reading-time` | ✅ Updated |
| **Test Count** | 24 tests | 33 tests | ✅ Expanded |

This feature is **production-ready** and **fully tested** with zero external dependencies and complete backward compatibility!
