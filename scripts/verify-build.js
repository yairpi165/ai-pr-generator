#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

import fs from 'fs'

// Required files that must exist after build
const requiredFiles = [
  'dist/cli.js',
  'dist/commands/init.js',
  'dist/commands/index.js',
  'dist/domain/index.js',
  'dist/domain/ai/index.js',
  'dist/domain/ai/providers/gemini.js',
  'dist/domain/ai/providers/openai.js',
  'dist/domain/git/index.js',
  'dist/domain/git/hosting/bitbucket.js',
  'dist/domain/git/hosting/github.js',
  'dist/domain/pr/index.js',
  'dist/domain/ui/index.js',
  'dist/domain/ui/display.js',
  'dist/domain/ui/interactive.js',
  'dist/domain/ui/output.js',
]

// Check if all required files exist
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file))

if (missingFiles.length > 0) {
  console.error('❌ Build verification failed!')
  console.error('Missing required files:')
  missingFiles.forEach(file => console.error(`  - ${file}`))
  console.error('\nThis usually means the TypeScript build failed.')
  console.error('Please check for compilation errors and try again.')
  process.exit(1)
}

console.log('✅ Build verification passed!')
console.log(`All ${requiredFiles.length} required files are present.`)
