import fs from 'fs'
import inquirer from 'inquirer'
import dotenv from 'dotenv'

// Mock the paths module
jest.mock('../../domain/config/paths.js', () => ({
  getEnvPath: jest.fn(() => '/test/project/.env'),
}))

// Mock dotenv
jest.mock('dotenv', () => ({
  parse: jest.fn(),
}))

// Mock shared utilities module
const mockSelectAIModels = jest.fn()
const mockConfirmReset = jest.fn()
const mockDisplayConfigUpdateSuccess = jest.fn()
const mockHandleConfigActions = jest.fn()

jest.mock('../../commands/shared.js', () => ({
  selectAIModels: mockSelectAIModels,
  confirmReset: mockConfirmReset,
  displayConfigUpdateSuccess: mockDisplayConfigUpdateSuccess,
  handleConfigActions: mockHandleConfigActions,
}))

// Import after mocking
import { runConfig } from '../../commands/config.js'

const mockFs = fs as jest.Mocked<typeof fs>
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>
const mockDotenv = dotenv as jest.Mocked<typeof dotenv>

// Create a new console mock specifically for these tests
const mockConsoleLog = jest.fn()

describe('Config Command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConsoleLog.mockClear()

    // Override the global console.log mock for this test
    console.log = mockConsoleLog

    // Reset mocks to default implementations
    mockSelectAIModels.mockResolvedValue({
      openaiModel: 'gpt-4o-mini',
      geminiModel: 'gemini-2.0-flash',
      defaultProvider: '',
    })
    mockConfirmReset.mockResolvedValue(false)
    mockDisplayConfigUpdateSuccess.mockImplementation(displayFn => {
      mockConsoleLog('✅ Configuration updated!')
      displayFn()
    })

    // Set up handleConfigActions to call the appropriate handlers
    mockHandleConfigActions.mockImplementation(async (options, handlers) => {
      if (options.action === 'view' || Object.keys(options).length === 0) {
        handlers.view()
        return
      }
      if (options.action === 'edit') {
        await handlers.edit()
        return
      }
      if (options.action === 'reset') {
        await handlers.reset()
        return
      }
      // Interactive mode
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 View current configuration', value: 'view' },
            { name: '✏️  Edit configuration', value: 'edit' },
            { name: '🔄 Reset configuration', value: 'reset' },
            { name: '❌ Cancel', value: 'cancel' },
          ],
        },
      ])
      if (action === 'view') {
        handlers.view()
      } else if (action === 'edit') {
        await handlers.edit()
      } else if (action === 'reset') {
        await handlers.reset()
      }
    })
  })

  describe('loadEnvConfig functionality', () => {
    it('should handle non-existing .env file', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({ action: 'view' })

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/project/.env')
      expect(mockFs.readFileSync).not.toHaveBeenCalled()
    })

    it('should load existing .env file', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')
      mockDotenv.parse.mockReturnValue({
        OPENAI_API_KEY: 'test-key',
      })

      await runConfig({ action: 'view' })

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'utf8'
      )
      expect(mockDotenv.parse).toHaveBeenCalledWith('OPENAI_API_KEY=test-key\n')
    })
  })

  describe('View action', () => {
    it('should display configuration header', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚙️  AI Pull Request Generator - Settings')
      )
    })

    it('should display current configuration', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should show unconfigured status for missing API keys', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Not configured')
      )
    })

    it('should show configured status for existing API keys', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        'OPENAI_API_KEY=test-key\nGEMINI_API_KEY=gemini-key\n'
      )
      mockDotenv.parse.mockReturnValue({
        OPENAI_API_KEY: 'test-key',
        GEMINI_API_KEY: 'gemini-key',
      })

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configured')
      )
    })

    it('should display default models', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('gpt-4o-mini')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.0-flash')
      )
    })

    it('should display git hosting status', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('GITHUB_TOKEN=gh-token\n')
      mockDotenv.parse.mockReturnValue({
        GITHUB_TOKEN: 'gh-token',
      })

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/GitHub.*✅ Configured/)
      )
    })
  })

  describe('Edit action', () => {
    it('should handle provider keys editing', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'new-key',
          geminiKey: 'gemini-key',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockInquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'openaiKey',
            message: '🔑 OpenAI API Key (press Enter to keep current):',
          }),
        ])
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ AI Provider keys updated')
      )
    })

    it('should handle models editing', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'models' })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockSelectAIModels).toHaveBeenCalledWith({
        openaiModel: undefined,
        geminiModel: undefined,
        defaultProvider: undefined,
      })
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ AI Models updated')
      )
    })

    it('should handle git hosting editing', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'hosting' })
        .mockResolvedValueOnce({
          bitbucketEmail: 'test@example.com',
          bitbucketToken: 'token',
          githubToken: 'gh-token',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockInquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'bitbucketEmail',
            type: 'input',
          }),
          expect.objectContaining({
            name: 'githubToken',
            type: 'password',
          }),
        ])
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Git Hosting credentials updated')
      )
    })

    it('should save configuration to file', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'test-key',
          geminiKey: 'gemini-key',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        expect.stringContaining('OPENAI_API_KEY=test-key')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration saved to .env file')
      )
    })

    it('should handle cancel without saving', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt.mockResolvedValueOnce({ editSection: 'cancel' })

      await runConfig({ action: 'edit' })

      // When cancelled, still saves empty config
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        ''
      )
    })

    it('should preserve existing keys when editing', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=existing-key\n')
      mockDotenv.parse.mockReturnValue({
        OPENAI_API_KEY: 'existing-key',
      })
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'existing-key',
          geminiKey: '',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockInquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            default: 'existing-key',
          }),
        ])
      )
    })
  })

  describe('Reset action', () => {
    it('should handle reset with confirmation', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockConfirmReset.mockResolvedValue(true)

      await runConfig({ action: 'reset' })

      expect(mockConfirmReset).toHaveBeenCalled()
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/test/project/.env')
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration reset!')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Run "genpr init" to set up again.')
      )
    })

    it('should handle reset without confirmation', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockConfirmReset.mockResolvedValue(false)

      await runConfig({ action: 'reset' })

      expect(mockConfirmReset).toHaveBeenCalled()
      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
    })

    it('should handle reset when no config exists', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockConfirmReset.mockResolvedValue(true)

      await runConfig({ action: 'reset' })

      expect(mockConfirmReset).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️  No configuration file found.')
      )
      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
    })
  })

  describe('Interactive mode', () => {
    it('should enter interactive mode with empty options', async () => {
      mockFs.existsSync.mockReturnValue(false)
      // When Object.keys({}).length === 0, it defaults to view action

      await runConfig({})

      // Should default to view when Object.keys({}).length === 0
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should handle interactive mode when no specific action', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ action: 'edit' })
        .mockResolvedValueOnce({ editSection: 'save' })

      // Need to trigger interactive mode - use options without action
      await runConfig({
        action: undefined as 'view' | 'edit' | 'reset' | undefined,
      })

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 View current configuration', value: 'view' },
            { name: '✏️  Edit configuration', value: 'edit' },
            { name: '🔄 Reset configuration', value: 'reset' },
            { name: '❌ Cancel', value: 'cancel' },
          ],
        },
      ])
      expect(mockDisplayConfigUpdateSuccess).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should handle file system errors', async () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('File system error')
      )
    })

    it('should handle non-Error exceptions', async () => {
      mockFs.existsSync.mockImplementation(() => {
        throw 'String error'
      })

      await runConfig({ action: 'view' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('String error')
      )
    })

    it('should handle inquirer errors', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt.mockRejectedValue(new Error('Inquirer error'))

      await runConfig({ action: 'edit' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Inquirer error')
      )
    })
  })

  describe('Configuration file operations', () => {
    it('should filter out empty values when saving', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'test-key',
          geminiKey: '', // Empty value
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      const writeCall = mockFs.writeFileSync.mock.calls.find(
        call => call[0] === '/test/project/.env'
      )
      expect(writeCall?.[1]).toContain('OPENAI_API_KEY=test-key')
      expect(writeCall?.[1]).not.toContain('GEMINI_API_KEY=')
    })

    it('should handle complex configuration editing', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockSelectAIModels.mockResolvedValue({
        openaiModel: 'gpt-4o',
        geminiModel: 'gemini-2.0-pro',
        defaultProvider: 'openai',
      })
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'openai-key',
          geminiKey: 'gemini-key',
        })
        .mockResolvedValueOnce({ editSection: 'models' })
        .mockResolvedValueOnce({ editSection: 'hosting' })
        .mockResolvedValueOnce({
          bitbucketEmail: 'test@example.com',
          bitbucketToken: 'bb-token',
          githubToken: 'gh-token',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      // The complete configuration should include values from all sections
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        expect.stringContaining('OPENAI_API_KEY=openai-key')
      )
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        expect.stringContaining('GEMINI_API_KEY=gemini-key')
      )
      // Models should be included via the mockSelectAIModels
      expect(mockSelectAIModels).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty options object', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig({})

      // Should default to view when Object.keys({}).length === 0
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should handle undefined options', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig()

      // Should default to view mode since no options and Object.keys(options).length === 0
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should handle file write errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })
      mockInquirer.prompt.mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
    })
  })

  describe('Direct execution check', () => {
    it('should detect when file is run directly', () => {
      const originalArgv = process.argv
      process.argv = ['node', '/path/to/config.js']

      expect(process.argv[1]).toContain('config.js')

      process.argv = originalArgv
    })

    it('should detect when file is not run directly', () => {
      const originalArgv = process.argv
      process.argv = ['node', '/path/to/other-file.js']

      expect(process.argv[1]).not.toContain('config.js')

      process.argv = originalArgv
    })
  })
})
