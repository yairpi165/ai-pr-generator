// Mock external dependencies at module level
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
  outputPath: '/tmp/pr.md',
  loadReviewersConfig: jest.fn(),
  UI_CONSTANTS: {
    MESSAGES: {
      WELCOME: '🚀 AI PR Generator',
      GENERATING_DIFF: 'Generating diff...',
      GENERATING_PR: 'Generating PR description...',
    },
  },
}))

jest.mock('../commands/init.js', () => ({
  runInit: jest.fn(),
}))

// process.exit is already mocked in setup.ts

import { parseArguments, parseInput } from '../cli.js'
import {
  generatePRDescription,
  savePRToFile,
  getCurrentProvider,
  getInteractiveInput,
} from '../domain/index.js'
import type { PROptions } from '../domain/index.js'

const mockGeneratePRDescription = generatePRDescription as jest.MockedFunction<
  typeof generatePRDescription
>
const mockSavePRToFile = savePRToFile as jest.MockedFunction<
  typeof savePRToFile
>
const mockGetCurrentProvider = getCurrentProvider as jest.MockedFunction<
  typeof getCurrentProvider
>
const mockGetInteractiveInput = getInteractiveInput as jest.MockedFunction<
  typeof getInteractiveInput
>

describe('CLI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // mockExit is handled in setup.ts
  })

  describe('parseArguments', () => {
    it('should parse provider flag correctly', () => {
      const args = ['--provider', 'openai', 'feat', 'Add new feature']
      const result = parseArguments(args)

      expect(result.provider).toBe('openai')
      expect(result.remainingArgs).toEqual(['feat', 'Add new feature'])
    })

    it('should handle provider flag at the beginning', () => {
      const args = ['--provider', 'gemini', 'fix', 'Bug fix']
      const result = parseArguments(args)

      expect(result.provider).toBe('gemini')
      expect(result.remainingArgs).toEqual(['fix', 'Bug fix'])
    })

    it('should handle provider flag in the middle', () => {
      const args = ['feat', '--provider', 'openai', 'Add feature']
      const result = parseArguments(args)

      expect(result.provider).toBe('openai')
      expect(result.remainingArgs).toEqual(['feat', 'Add feature'])
    })

    it('should handle provider flag at the end', () => {
      const args = ['feat', 'Add feature', '--provider', 'gemini']
      const result = parseArguments(args)

      expect(result.provider).toBe('gemini')
      expect(result.remainingArgs).toEqual(['feat', 'Add feature'])
    })

    it('should return all args as remaining when no provider flag', () => {
      const args = ['feat', 'Add new feature', 'PROJ-123']
      const result = parseArguments(args)

      expect(result.provider).toBeUndefined()
      expect(result.remainingArgs).toEqual([
        'feat',
        'Add new feature',
        'PROJ-123',
      ])
    })

    it('should handle provider flag without value', () => {
      const args = ['--provider']
      const result = parseArguments(args)

      expect(result.provider).toBeUndefined()
      expect(result.remainingArgs).toEqual(['--provider'])
    })

    it('should handle empty args array', () => {
      const result = parseArguments([])

      expect(result.provider).toBeUndefined()
      expect(result.remainingArgs).toEqual([])
    })

    it('should handle multiple provider flags (uses first)', () => {
      const args = ['--provider', 'openai', '--provider', 'gemini', 'feat']
      const result = parseArguments(args)

      expect(result.provider).toBe('openai')
      expect(result.remainingArgs).toEqual(['--provider', 'gemini', 'feat'])
    })

    it('should use process.argv by default', () => {
      const originalArgv = process.argv
      process.argv = ['node', 'cli.js', '--provider', 'test', 'feat']

      const result = parseArguments()

      expect(result.provider).toBe('test')
      expect(result.remainingArgs).toEqual(['feat'])

      process.argv = originalArgv
    })

    it('should handle provider with special characters', () => {
      const args = ['--provider', 'custom-provider-123', 'feat']
      const result = parseArguments(args)

      expect(result.provider).toBe('custom-provider-123')
      expect(result.remainingArgs).toEqual(['feat'])
    })

    it('should preserve order of remaining args', () => {
      const args = ['arg1', '--provider', 'test', 'arg2', 'arg3', 'arg4']
      const result = parseArguments(args)

      expect(result.provider).toBe('test')
      expect(result.remainingArgs).toEqual(['arg1', 'arg2', 'arg3', 'arg4'])
    })

    it('should handle only provider flag and value', () => {
      const args = ['--provider', 'openai']
      const result = parseArguments(args)

      expect(result.provider).toBe('openai')
      expect(result.remainingArgs).toEqual([])
    })

    it('should parse init command correctly', () => {
      const args = ['init']
      const result = parseArguments(args)

      expect(result.command).toBe('init')
      expect(result.remainingArgs).toEqual([])
      expect(result.provider).toBeUndefined()
    })

    it('should parse init command with additional args', () => {
      const args = ['init', '--some', 'options']
      const result = parseArguments(args)

      expect(result.command).toBe('init')
      expect(result.remainingArgs).toEqual(['--some', 'options'])
      expect(result.provider).toBeUndefined()
    })

    it('should not parse init when it is not the first argument', () => {
      const args = ['feat', 'init', 'something']
      const result = parseArguments(args)

      expect(result.command).toBeUndefined()
      expect(result.remainingArgs).toEqual(['feat', 'init', 'something'])
    })
  })

  describe('parseInput', () => {
    const mockPROptions: PROptions = {
      prType: 'feat',
      prTitle: 'Test feature',
      ticket: 'PROJ-123',
      explanation: 'Test explanation',
    }

    beforeEach(() => {
      mockGetInteractiveInput.mockResolvedValue(mockPROptions)
    })

    it('should log provider when specified', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const config = { provider: 'openai', remainingArgs: ['feat'] }

      await parseInput(config)

      expect(consoleSpy).toHaveBeenCalledWith('Using provider: openai')
      consoleSpy.mockRestore()
    })

    it('should parse command line args when provided', async () => {
      const config = {
        provider: 'gemini',
        remainingArgs: ['feat', 'Add new feature'],
      }

      const result = await parseInput(config)

      expect(result).toEqual({
        prType: 'feat',
        prTitle: 'Add new feature',
        ticket: '',
        explanation: '',
      })
      expect(mockGetInteractiveInput).not.toHaveBeenCalled()
    })

    it('should handle single argument (prType only)', async () => {
      const config = { remainingArgs: ['fix'] }

      const result = await parseInput(config)

      expect(result).toEqual({
        prType: 'fix',
        prTitle: '',
        ticket: '',
        explanation: '',
      })
      expect(mockGetInteractiveInput).not.toHaveBeenCalled()
    })

    it('should use interactive input when no args provided', async () => {
      const config = { remainingArgs: [] }

      const result = await parseInput(config)

      expect(result).toEqual(mockPROptions)
      expect(mockGetInteractiveInput).toHaveBeenCalledTimes(1)
    })

    it('should handle provider without remainingArgs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const config = { provider: 'openai', remainingArgs: [] }

      const result = await parseInput(config)

      expect(consoleSpy).toHaveBeenCalledWith('Using provider: openai')
      expect(result).toEqual(mockPROptions)
      expect(mockGetInteractiveInput).toHaveBeenCalledTimes(1)
      consoleSpy.mockRestore()
    })

    it('should not log provider when not specified', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const config = { remainingArgs: ['feat'] }

      await parseInput(config)

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle multiple command line arguments', async () => {
      const config = {
        remainingArgs: ['refactor', 'Refactor authentication', 'AUTH-456'],
      }

      const result = await parseInput(config)

      expect(result).toEqual({
        prType: 'refactor',
        prTitle: 'Refactor authentication',
        ticket: '',
        explanation: '',
      })
      expect(mockGetInteractiveInput).not.toHaveBeenCalled()
    })

    it('should handle empty string arguments', async () => {
      const config = { remainingArgs: ['feat', '', ''] }

      const result = await parseInput(config)

      expect(result).toEqual({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })
    })

    it('should handle special characters in arguments', async () => {
      const config = {
        remainingArgs: ['feat', 'Add émojis 🚀', 'UNICODE-123'],
      }

      const result = await parseInput(config)

      expect(result.prType).toBe('feat')
      expect(result.prTitle).toBe('Add émojis 🚀')
    })

    it('should forward interactive input errors', async () => {
      const error = new Error('Interactive input failed')
      mockGetInteractiveInput.mockRejectedValue(error)
      const config = { remainingArgs: [] }

      await expect(parseInput(config)).rejects.toThrow(
        'Interactive input failed'
      )
    })

    it('should handle long argument strings', async () => {
      const longTitle = 'A'.repeat(200)
      const config = { remainingArgs: ['docs', longTitle] }

      const result = await parseInput(config)

      expect(result.prType).toBe('docs')
      expect(result.prTitle).toBe(longTitle)
    })

    it('should handle whitespace in arguments', async () => {
      const config = {
        remainingArgs: ['feat', '  spaced title  ', 'PROJ-123'],
      }

      const result = await parseInput(config)

      expect(result.prTitle).toBe('  spaced title  ')
    })
  })

  describe('CLI Integration', () => {
    const mockPRResult = {
      title: 'Generated PR Title',
      body: 'Generated PR body',
      fullDescription: 'Full PR description',
    }

    beforeEach(() => {
      mockGetCurrentProvider.mockReturnValue('gemini')
      mockGeneratePRDescription.mockResolvedValue(mockPRResult)
      mockSavePRToFile.mockReturnValue('/tmp/pr.md')
      mockGetInteractiveInput.mockResolvedValue({
        prType: 'feat',
        prTitle: 'Test feature',
        ticket: 'PROJ-123',
        explanation: 'Test explanation',
      })
    })

    it('should handle complete CLI workflow with command line args', async () => {
      // Mock the process to avoid actual CLI execution
      const originalArgv = process.argv
      process.argv = [
        'node',
        'cli.js',
        '--provider',
        'openai',
        'feat',
        'New feature',
      ]

      // Import and run CLI logic manually since we can't run the actual CLI
      const config = parseArguments([
        '--provider',
        'openai',
        'feat',
        'New feature',
      ])
      const options = await parseInput(config)

      expect(config.provider).toBe('openai')
      expect(options.prType).toBe('feat')
      expect(options.prTitle).toBe('New feature')

      process.argv = originalArgv
    })

    it('should handle CLI workflow with interactive input', async () => {
      const config = parseArguments([])
      const options = await parseInput(config)

      expect(mockGetInteractiveInput).toHaveBeenCalled()
      expect(options.prType).toBe('feat')
      expect(options.prTitle).toBe('Test feature')
    })

    it('should handle provider fallback correctly', async () => {
      const config = parseArguments(['feat', 'New feature'])
      await parseInput(config)

      // When no provider is specified in args, should work with current provider
      expect(config.provider).toBeUndefined()
    })

    it('should validate argument parsing edge cases', async () => {
      const testCases = [
        { args: [], expectedProvider: undefined, shouldUseInteractive: true },
        {
          args: ['feat'],
          expectedProvider: undefined,
          shouldUseInteractive: false,
        },
        {
          args: ['--provider', 'test'],
          expectedProvider: 'test',
          shouldUseInteractive: true,
        },
        {
          args: ['--provider', 'test', 'feat'],
          expectedProvider: 'test',
          shouldUseInteractive: false,
        },
      ]

      for (const testCase of testCases) {
        const config = parseArguments(testCase.args)
        expect(config.provider).toBe(testCase.expectedProvider)

        const options = await parseInput(config)
        if (testCase.shouldUseInteractive) {
          expect(mockGetInteractiveInput).toHaveBeenCalled()
        }
        expect(options).toBeDefined()

        jest.clearAllMocks()
      }
    })

    it('should handle various PR types correctly', async () => {
      const prTypes = ['feat', 'fix', 'refactor', 'docs', 'chore', 'other']

      for (const prType of prTypes) {
        const config = parseArguments([prType, 'Test title'])
        const options = await parseInput(config)

        expect(options.prType).toBe(prType)
        expect(options.prTitle).toBe('Test title')
      }
    })

    it('should maintain argument order and structure', async () => {
      const config = parseArguments([
        'complex-arg',
        '--provider',
        'test-provider',
        'another-arg',
        'final-arg',
      ])

      expect(config.provider).toBe('test-provider')
      expect(config.remainingArgs).toEqual([
        'complex-arg',
        'another-arg',
        'final-arg',
      ])

      const options = await parseInput(config)
      expect(options.prType).toBe('complex-arg')
      expect(options.prTitle).toBe('another-arg')
    })

    it('should handle Unicode and special characters', async () => {
      const config = parseArguments([
        '🚀',
        'Title with émojis 🎉',
        '--provider',
        'test',
      ])

      expect(config.provider).toBe('test')
      expect(config.remainingArgs).toEqual(['🚀', 'Title with émojis 🎉'])

      const options = await parseInput(config)
      expect(options.prType).toBe('🚀')
      expect(options.prTitle).toBe('Title with émojis 🎉')
    })
  })

  describe('Error Handling', () => {
    it('should handle parseInput errors gracefully', async () => {
      const error = new Error('Parse error')
      mockGetInteractiveInput.mockRejectedValue(error)

      const config = parseArguments([])
      await expect(parseInput(config)).rejects.toThrow('Parse error')
    })

    it('should handle malformed arguments', () => {
      const malformedArgs = ['--provider'] // Missing value
      const result = parseArguments(malformedArgs)

      expect(result.provider).toBeUndefined()
      expect(result.remainingArgs).toEqual(['--provider'])
    })

    it('should handle null and undefined inputs', () => {
      // Test with empty arrays and edge cases
      expect(() => parseArguments([])).not.toThrow()
      expect(() => parseArguments([''])).not.toThrow()
    })
  })

  describe('Type Safety', () => {
    it('should return proper TypeScript types', async () => {
      const config = parseArguments(['feat', 'Test'])
      const options = await parseInput(config)

      // TypeScript compile-time checks
      expect(typeof config.provider).toBe('undefined')
      expect(Array.isArray(config.remainingArgs)).toBe(true)
      expect(typeof options.prType).toBe('string')
      expect(typeof options.prTitle).toBe('string')
      expect(typeof options.ticket).toBe('string')
      expect(typeof options.explanation).toBe('string')
    })

    it('should maintain type consistency across functions', () => {
      const config = parseArguments(['--provider', 'test', 'feat'])

      expect(config).toHaveProperty('provider')
      expect(config).toHaveProperty('remainingArgs')
      expect(typeof config.provider).toBe('string')
      expect(Array.isArray(config.remainingArgs)).toBe(true)
    })
  })
})
