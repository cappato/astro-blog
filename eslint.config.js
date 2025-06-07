import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import regexp from 'eslint-plugin-regexp';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        console: 'readonly',
        
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'regexp': regexp,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      
      // Professional standards: No emojis in source code
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{1F1E0}-\\u{1F1FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]',
          message: 'Emojis are not allowed in source code. Use descriptive text instead.'
        },
        {
          selector: 'TemplateElement[value.raw=/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{1F1E0}-\\u{1F1FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]',
          message: 'Emojis are not allowed in template literals. Use descriptive text instead.'
        },
        {
          selector: 'Literal[value=/\\b(ganzo|augment|multi-agent|ai assistant|claude|anthropic)\\b/i]',
          message: 'Agent references are not allowed in source code. Use generic terms instead.'
        }
      ],
      
      // Allow console.log in scripts directory
      'no-console': 'off',
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Special rules for test files
    files: ['**/*.test.{js,ts,tsx}', '**/__tests__/**/*.{js,ts,tsx}'],
    rules: {
      // Allow emojis and agent references in test files for testing purposes
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Special rules for scripts directory
    files: ['scripts/**/*.{js,mjs}'],
    rules: {
      // Allow emojis only in console.log statements in scripts
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{1F1E0}-\\u{1F1FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]:not(CallExpression[callee.object.name="console"] > Literal)',
          message: 'Emojis in scripts are only allowed in console.log statements.'
        }
      ],
    },
  },
];
