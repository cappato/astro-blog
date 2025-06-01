#!/usr/bin/env node
/**
 * Image Optimization CLI - Compatibility Wrapper
 *
 * Simple wrapper that delegates to the modular CLI.
 * Maintains backward compatibility for npm scripts.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the modular CLI
const cliPath = join(__dirname, '../cli/optimize-images.ts');

// Forward all arguments to the modular CLI
const args = process.argv.slice(2);

// Use tsx to run TypeScript directly
const child = spawn('npx', ['tsx', cliPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Failed to start image optimization CLI:', error);
  process.exit(1);
});


