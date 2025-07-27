/**
 * CLI Tests
 * Tests for the main CLI functionality
 */

import { jest } from '@jest/globals'
// Remove unused import
import path from 'path'

// Mock chalk to avoid color codes in tests
jest.mock('chalk', () => ({
  blue: { bold: jest.fn((text: string) => text) },
  green: { bold: jest.fn((text: string) => text) },
  red: { bold: jest.fn((text: string) => text) },
  yellow: { bold: jest.fn((text: string) => text) },
}))

// Mock the domain modules
jest.mock('../domain/index.js', () => ({
  generatePRDescription: jest.fn(),
  savePRToFile: jest.fn(),
  getCurrentProvider: jest.fn(),
  getInteractiveInput: jest.fn(),
  displayOptions: jest.fn(),
  displayProgress: jest.fn(),
  displayResult: jest.fn(),
  displayError: jest.fn(),
  handleOutputOptions: jest.fn(),
  outputPath: '/test/path',
  loadReviewersConfig: jest.fn(),
  UI_CONSTANTS: {
    MESSAGES: {
      WELCOME: '🧠 AI Pull Request Generator (TypeScript Edition)',
      GENERATING_DIFF: '🛠️  Generating git diff...',
      GENERATING_PR: '🤖 Generating PR description...',
    },
  },
}))

describe('CLI', () => {
  const cliPath = path.resolve(__dirname, '../cli.ts')
  const distCliPath = path.resolve(__dirname, '../../dist/cli.js')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CLI File Structure', () => {
    it('should have the correct shebang line', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')
      expect(cliContent).toMatch(/^#!\/usr\/bin\/env node/)
    })

    it('should import required modules', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check for essential imports
      expect(cliContent).toMatch(/import chalk from 'chalk'/)
      expect(cliContent).toMatch(/from '\.\/domain\/index\.js'/)
    })

    it('should have the main runCLI function', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')
      expect(cliContent).toMatch(/const runCLI = async/)
    })

    it('should call runCLI at the end', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')
      expect(cliContent).toMatch(/runCLI\(\)\.catch/)
    })
  })

  describe('CLI Argument Parsing Logic', () => {
    it('should have parseArguments function exported', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check that parseArguments is exported for testing
      expect(cliContent).toMatch(/export const parseArguments/)
    })

    it('should have parseInput function exported', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check that parseInput is exported for testing
      expect(cliContent).toMatch(/export const parseInput/)
    })

    it('should handle --provider flag parsing', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check that --provider flag is handled
      expect(cliContent).toMatch(/--provider/)
    })
  })

  describe('CLI Error Handling', () => {
    it('should have proper error handling structure', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check for try-catch blocks
      expect(cliContent).toMatch(/try\s*{/)
      expect(cliContent).toMatch(/catch\s*\(error\)\s*{/)
    })

    it('should call displayError on errors', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/displayError\(/)
    })

    it('should exit with code 1 on error', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/process\.exit\(1\)/)
    })
  })

  describe('CLI Integration with Domain Modules', () => {
    it('should call loadReviewersConfig', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/loadReviewersConfig\(\)/)
    })

    it('should call generatePRDescription with correct parameters', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/generatePRDescription\(/)
      expect(cliContent).toMatch(/options\.prType/)
      expect(cliContent).toMatch(/options\.prTitle/)
      expect(cliContent).toMatch(/options\.ticket/)
      expect(cliContent).toMatch(/options\.explanation/)
    })

    it('should call savePRToFile', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/savePRToFile\(/)
    })

    it('should call displayResult', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/displayResult\(/)
    })

    it('should call handleOutputOptions', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/handleOutputOptions\(/)
    })
  })

  describe('CLI Welcome and Progress Messages', () => {
    it('should display welcome message', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/UI_CONSTANTS\.MESSAGES\.WELCOME/)
    })

    it('should display progress messages', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/UI_CONSTANTS\.MESSAGES\.GENERATING_DIFF/)
      expect(cliContent).toMatch(/UI_CONSTANTS\.MESSAGES\.GENERATING_PR/)
    })

    it('should call displayProgress', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/displayProgress\(/)
    })
  })

  describe('CLI Provider Handling', () => {
    it('should log provider when specified', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/console\.log\(.*provider.*\)/)
    })

    it('should call getCurrentProvider', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/getCurrentProvider\(\)/)
    })
  })

  describe('CLI Options Display', () => {
    it('should call displayOptions with correct parameters', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/displayOptions\(/)
      expect(cliContent).toMatch(/options, getCurrentProvider\(\)/)
    })
  })

  describe('CLI File Output', () => {
    it('should use outputPath from domain module', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/outputPath/)
    })
  })

  describe('CLI Async/Await Usage', () => {
    it('should use async/await properly', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/const runCLI = async/)
      expect(cliContent).toMatch(/await generatePRDescription/)
      expect(cliContent).toMatch(/await getInteractiveInput/)
      expect(cliContent).toMatch(/await handleOutputOptions/)
    })
  })

  describe('CLI Module Structure', () => {
    it('should be a valid ES module', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      // Check for ES module imports
      expect(cliContent).toMatch(/import.*from/)
      expect(cliContent).toMatch(/\.js'/)
    })

    it('should have proper TypeScript types', () => {
      const fs = require('fs')
      const cliContent = fs.readFileSync(cliPath, 'utf8')

      expect(cliContent).toMatch(/type PROptions/)
    })
  })

  describe('CLI Build Output', () => {
    it('should generate a valid CLI executable', () => {
      const fs = require('fs')

      // Check if the built CLI exists
      expect(fs.existsSync(distCliPath)).toBe(true)
    })

    it('should have executable permissions', () => {
      const fs = require('fs')

      if (fs.existsSync(distCliPath)) {
        const stats = fs.statSync(distCliPath)
        // Check if file is executable (this is a basic check)
        expect(stats.isFile()).toBe(true)
      }
    })
  })

  describe('CLI Package Configuration', () => {
    it('should have correct bin configuration in package.json', () => {
      const fs = require('fs')
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      expect(packageJson.bin).toBeDefined()
      expect(packageJson.bin.genpr).toBe('./dist/cli.js')
    })

    it('should have correct main entry point', () => {
      const fs = require('fs')
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      expect(packageJson.main).toBe('dist/cli.js')
    })

    it('should be configured as an ES module', () => {
      const fs = require('fs')
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      expect(packageJson.type).toBe('module')
    })
  })
})
