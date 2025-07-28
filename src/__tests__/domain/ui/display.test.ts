// Mock external dependencies at module level
jest.mock('chalk', () => ({
  blue: { bold: jest.fn((str: string) => str) },
  gray: jest.fn((str: string) => str),
  yellow: jest.fn((str: string) => str),
  green: { bold: jest.fn((str: string) => str) },
  white: jest.fn((str: string) => str),
  red: Object.assign(
    jest.fn((str: string) => str),
    {
      bold: jest.fn((str: string) => str),
    }
  ),
}))

import {
  displayOptions,
  displayProgress,
  displayResult,
  displayError,
} from '../../../domain/ui/display.js'
import type { PROptions } from '../../../domain/pr/types.js'
import chalk from 'chalk'

const mockChalk = chalk as jest.Mocked<typeof chalk>

describe('UI Display Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock console methods to avoid test output noise
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('displayOptions', () => {
    const testOptions: PROptions = {
      prType: 'feat',
      prTitle: 'Add new feature',
      ticket: 'PROJ-123',
      explanation: 'This adds a new feature to the application',
    }

    it('should display all options with values', () => {
      displayOptions(testOptions, 'OpenAI')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Selected Options:')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Type: feat')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Title: Add new feature')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Ticket: PROJ-123')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Explanation: This adds a new feature to the application'
        )
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('AI Provider: OpenAI')
      )
    })

    it('should display auto-generated for empty title', () => {
      const optionsWithoutTitle: PROptions = {
        ...testOptions,
        prTitle: '',
      }

      displayOptions(optionsWithoutTitle, 'Gemini')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Title: Auto-generated')
      )
    })

    it('should display None for empty ticket', () => {
      const optionsWithoutTicket: PROptions = {
        ...testOptions,
        ticket: '',
      }

      displayOptions(optionsWithoutTicket, 'OpenAI')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Ticket: None')
      )
    })

    it('should display None for empty explanation', () => {
      const optionsWithoutExplanation: PROptions = {
        ...testOptions,
        explanation: '',
      }

      displayOptions(optionsWithoutExplanation, 'OpenAI')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Explanation: None')
      )
    })

    it('should handle all empty optional fields', () => {
      const minimalOptions: PROptions = {
        prType: 'fix',
        prTitle: '',
        ticket: '',
        explanation: '',
      }

      displayOptions(minimalOptions, 'Gemini')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Type: fix')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Title: Auto-generated')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Ticket: None')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Explanation: None')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('AI Provider: Gemini')
      )
    })

    it('should use chalk.blue.bold for header', () => {
      displayOptions(testOptions, 'OpenAI')

      expect(mockChalk.blue.bold).toHaveBeenCalledWith('\n📋 Selected Options:')
    })

    it('should use chalk.gray for option values', () => {
      displayOptions(testOptions, 'OpenAI')

      expect(mockChalk.gray).toHaveBeenCalledWith('   Type: feat')
      expect(mockChalk.gray).toHaveBeenCalledWith('   Title: Add new feature')
      expect(mockChalk.gray).toHaveBeenCalledWith('   Ticket: PROJ-123')
      expect(mockChalk.gray).toHaveBeenCalledWith(
        '   Explanation: This adds a new feature to the application'
      )
      expect(mockChalk.gray).toHaveBeenCalledWith('   AI Provider: OpenAI')
    })

    it('should handle special characters in values', () => {
      const specialOptions: PROptions = {
        prType: 'feat',
        prTitle: 'Add émojis 🚀 and special chars',
        ticket: 'UNICODE-123',
        explanation: 'Support for émojis: 🎉 and chars like ñ, ü',
      }

      displayOptions(specialOptions, 'Custom Provider')

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Add émojis 🚀 and special chars')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Support for émojis: 🎉 and chars like ñ, ü')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Custom Provider')
      )
    })

    it('should handle very long values', () => {
      const longOptions: PROptions = {
        prType: 'refactor',
        prTitle: 'A'.repeat(200),
        ticket: 'LONG-' + 'B'.repeat(50),
        explanation: 'C'.repeat(500),
      }

      displayOptions(longOptions, 'LongProviderName'.repeat(10))

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('A'.repeat(200))
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('C'.repeat(500))
      )
    })

    it('should add empty line at the end', () => {
      displayOptions(testOptions, 'OpenAI')

      const logCalls = (console.log as jest.Mock).mock.calls
      const lastCall = logCalls[logCalls.length - 1]
      expect(lastCall).toEqual([])
    })

    it('should handle different PR types', () => {
      const prTypes = ['feat', 'fix', 'refactor', 'docs', 'chore', 'other']

      prTypes.forEach(prType => {
        jest.clearAllMocks()
        const options = { ...testOptions, prType }

        displayOptions(options, 'TestProvider')

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining(`Type: ${prType}`)
        )
      })
    })
  })

  describe('displayProgress', () => {
    it('should display progress message with emoji', () => {
      displayProgress('Generating PR description...')

      expect(console.log).toHaveBeenCalledWith(
        '⏳ Generating PR description...'
      )
      expect(mockChalk.yellow).toHaveBeenCalledWith(
        '⏳ Generating PR description...'
      )
    })

    it('should handle empty message', () => {
      displayProgress('')

      expect(console.log).toHaveBeenCalledWith('⏳ ')
      expect(mockChalk.yellow).toHaveBeenCalledWith('⏳ ')
    })

    it('should handle special characters in message', () => {
      const message = 'Processing émojis 🚀 and special chars...'
      displayProgress(message)

      expect(console.log).toHaveBeenCalledWith(`⏳ ${message}`)
    })

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500)
      displayProgress(longMessage)

      expect(console.log).toHaveBeenCalledWith(`⏳ ${longMessage}`)
      expect(mockChalk.yellow).toHaveBeenCalledWith(`⏳ ${longMessage}`)
    })

    it('should use chalk.yellow for styling', () => {
      displayProgress('Test message')

      expect(mockChalk.yellow).toHaveBeenCalledTimes(1)
    })

    it('should handle newlines in message', () => {
      const messageWithNewlines = 'Line 1\nLine 2\nLine 3'
      displayProgress(messageWithNewlines)

      expect(console.log).toHaveBeenCalledWith(`⏳ ${messageWithNewlines}`)
    })
  })

  describe('displayResult', () => {
    const testDescription =
      '# Feature\n\nThis is a test PR description.\n\n## Changes\n- Added feature A\n- Fixed bug B'
    const testPath = '/path/to/pr-description.md'
    const testProvider = 'OpenAI'

    it('should display complete result information', () => {
      displayResult(testDescription, testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ PR Description Generated!')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Provider: OpenAI')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Saved to: /path/to/pr-description.md')
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Content:')
      )
    })

    it('should display the description content', () => {
      displayResult(testDescription, testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(
        chalk.white('\n' + '─'.repeat(50))
      )
      expect(console.log).toHaveBeenCalledWith(chalk.white(testDescription))
      expect(console.log).toHaveBeenCalledWith(chalk.white('─'.repeat(50)))
    })

    it('should use correct chalk colors', () => {
      displayResult(testDescription, testPath, testProvider)

      expect(mockChalk.green.bold).toHaveBeenCalledWith(
        '\n✅ PR Description Generated!'
      )
      expect(mockChalk.gray).toHaveBeenCalledWith('   Provider: OpenAI')
      expect(mockChalk.gray).toHaveBeenCalledWith(
        '   Saved to: /path/to/pr-description.md'
      )
      expect(mockChalk.gray).toHaveBeenCalledWith('   Content:')
      expect(mockChalk.white).toHaveBeenCalledWith('\n' + '─'.repeat(50))
      expect(mockChalk.white).toHaveBeenCalledWith(testDescription)
      expect(mockChalk.white).toHaveBeenCalledWith('─'.repeat(50))
    })

    it('should handle empty description', () => {
      displayResult('', testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(chalk.white(''))
    })

    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(10000)
      displayResult(longDescription, testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(chalk.white(longDescription))
    })

    it('should handle special characters in all fields', () => {
      const specialDescription = 'PR with émojis 🚀 and special chars ñ, ü'
      const specialPath = '/path/with spaces/and-émojis🚀/pr.md'
      const specialProvider = 'Custom Provider with émojis 🤖'

      displayResult(specialDescription, specialPath, specialProvider)

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(specialDescription)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(specialPath)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(specialProvider)
      )
    })

    it('should handle multiline descriptions correctly', () => {
      const multilineDescription = 'Line 1\nLine 2\n\nLine 4\n  Indented line'
      displayResult(multilineDescription, testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(
        chalk.white(multilineDescription)
      )
    })

    it('should add empty line at the end', () => {
      displayResult(testDescription, testPath, testProvider)

      const logCalls = (console.log as jest.Mock).mock.calls
      const lastCall = logCalls[logCalls.length - 1]
      expect(lastCall).toEqual([])
    })

    it('should create proper visual separation with borders', () => {
      displayResult(testDescription, testPath, testProvider)

      const expectedBorder = '─'.repeat(50)
      expect(console.log).toHaveBeenCalledWith(
        chalk.white('\n' + expectedBorder)
      )
      expect(console.log).toHaveBeenCalledWith(chalk.white(expectedBorder))
    })

    it('should handle edge case with only markdown headers', () => {
      const headerOnlyDescription = '# Header 1\n## Header 2\n### Header 3'
      displayResult(headerOnlyDescription, testPath, testProvider)

      expect(console.log).toHaveBeenCalledWith(
        chalk.white(headerOnlyDescription)
      )
    })
  })

  describe('displayError', () => {
    it('should display error message with emoji', () => {
      const error = new Error('Test error message')
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error:')
      )
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      )
    })

    it('should use chalk.red.bold for header', () => {
      const error = new Error('Test error')
      displayError(error)

      expect(mockChalk.red.bold).toHaveBeenCalledWith('\n❌ Error:')
    })

    it('should use chalk.red for error message', () => {
      const error = new Error('Test error message')
      displayError(error)

      expect(mockChalk.red).toHaveBeenCalledWith('Test error message')
    })

    it('should handle empty error message', () => {
      const error = new Error('')
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(chalk.red(''))
    })

    it('should handle very long error messages', () => {
      const longMessage = 'Error: ' + 'A'.repeat(1000)
      const error = new Error(longMessage)
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(chalk.red(longMessage))
    })

    it('should handle special characters in error message', () => {
      const specialMessage = 'Error with émojis 🚨 and special chars ñ, ü'
      const error = new Error(specialMessage)
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(chalk.red(specialMessage))
    })

    it('should handle multiline error messages', () => {
      const multilineMessage = 'Error line 1\nError line 2\nError line 3'
      const error = new Error(multilineMessage)
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(chalk.red(multilineMessage))
    })

    it('should add empty line at the end', () => {
      const error = new Error('Test error')
      displayError(error)

      const errorCalls = (console.error as jest.Mock).mock.calls
      const lastCall = errorCalls[errorCalls.length - 1]
      expect(lastCall).toEqual([])
    })

    it('should handle errors with stack traces', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\n    at function1\n    at function2'

      displayError(error)

      // Should only display the message, not the stack
      expect(console.error).toHaveBeenCalledWith(chalk.red('Test error'))
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('at function1')
      )
    })

    it('should handle TypeError instances', () => {
      const error = new TypeError('Type error message')
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(
        chalk.red('Type error message')
      )
    })

    it('should handle custom error instances', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const error = new CustomError('Custom error message')
      displayError(error)

      expect(console.error).toHaveBeenCalledWith(
        chalk.red('Custom error message')
      )
    })

    it('should be consistent with other display function formatting', () => {
      const error = new Error('Test error')
      displayError(error)

      // Should use console.error (not console.log) for errors
      expect(console.error).toHaveBeenCalled()
      expect(console.log).not.toHaveBeenCalled()
    })
  })

  describe('display functions integration', () => {
    it('should use consistent emoji and formatting patterns', () => {
      const options: PROptions = {
        prType: 'feat',
        prTitle: 'Test',
        ticket: 'TEST-1',
        explanation: 'Test explanation',
      }

      displayOptions(options, 'OpenAI')
      displayProgress('Testing...')
      displayResult('Test description', '/test/path', 'OpenAI')
      displayError(new Error('Test error'))

      // All functions should use emoji in their main messages
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📋'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('⏳'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅'))
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('❌'))
    })

    it('should handle null and undefined values gracefully', () => {
      const optionsWithNulls = {
        prType: 'feat',
        prTitle: null as string | null,
        ticket: undefined as string | undefined,
        explanation: '',
      }

      // Should not throw
      expect(() =>
        displayOptions(optionsWithNulls as unknown as PROptions, 'OpenAI')
      ).not.toThrow()
      expect(() => displayProgress(null as unknown as string)).not.toThrow()
      expect(() =>
        displayResult('test', null as unknown as string, 'OpenAI')
      ).not.toThrow()
    })
  })
})
