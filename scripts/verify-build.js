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

// Check executable permissions on cli.js
const cliPath = 'dist/cli.js'
try {
  const stats = fs.statSync(cliPath)
  const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0

  if (!isExecutable) {
    console.warn('⚠️  Warning: dist/cli.js is not executable')
    console.warn('This might cause issues when installing globally.')
    console.warn('Consider running: chmod +x dist/cli.js')
  } else {
    console.log('✅ dist/cli.js has executable permissions')
  }
} catch {
  console.warn(
    '⚠️  Warning: Could not check executable permissions on dist/cli.js'
  )
}

// Check file sizes to ensure they're not empty
const emptyFiles = requiredFiles.filter(file => {
  try {
    const stats = fs.statSync(file)
    return stats.size === 0
  } catch {
    return false
  }
})

if (emptyFiles.length > 0) {
  console.warn('⚠️  Warning: Some files appear to be empty:')
  emptyFiles.forEach(file => console.warn(`  - ${file}`))
}

// Check that cli.js has the correct shebang
try {
  const cliContent = fs.readFileSync(cliPath, 'utf8')
  if (!cliContent.startsWith('#!/usr/bin/env node')) {
    console.warn('⚠️  Warning: dist/cli.js does not start with correct shebang')
    console.warn('Expected: #!/usr/bin/env node')
  } else {
    console.log('✅ dist/cli.js has correct shebang')
  }
} catch {
  console.warn('⚠️  Warning: Could not check shebang in dist/cli.js')
}

console.log('✅ Build verification passed!')
console.log(`All ${requiredFiles.length} required files are present.`)
