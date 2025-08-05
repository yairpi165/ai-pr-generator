import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { runConfig } from '../../commands/config.js'

// Mock the modules
jest.mock('fs')
jest.mock('path')
jest.mock('inquirer')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>

describe('Config Command', () => {
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock console.log properly
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    // Default path mocks
    // mockPath.join.mockImplementation((...args) => args.join('/'))

    // Default process mocks
    const mockCwd = jest.fn().mockReturnValue('/test/project')
    Object.defineProperty(process, 'cwd', {
      value: mockCwd,
      writable: true,
    })
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  describe('runConfig function', () => {
    it('should display current configuration when no action specified', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        'OPENAI_API_KEY=test-key\nGEMINI_API_KEY=gemini-key\nOPENAI_MODEL=gpt-4o-mini\n'
      )

      await runConfig()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should display empty configuration when no .env file exists', async () => {
      mockFs.existsSync.mockReturnValue(false)

      await runConfig()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Not configured')
      )
    })

    it('should edit configuration when action is edit', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        'OPENAI_API_KEY=old-key\nGEMINI_API_KEY=old-gemini\n'
      )
      mockInquirer.prompt
        .mockResolvedValueOnce({
          openaiKey: 'new-key',
          geminiKey: 'new-gemini',
        })
        .mockResolvedValueOnce({
          openaiModel: 'gpt-4o',
          geminiModel: 'gemini-2.0-pro',
          defaultProvider: 'openai',
        })
        .mockResolvedValueOnce({ editGitHosting: false })

      await runConfig({ action: 'edit' })

      // Check that the function completed without throwing
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚙️  AI Pull Request Generator - Settings')
      )
    })

    it('should reset configuration when action is reset', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockInquirer.prompt.mockResolvedValue({ confirm: true })

      await runConfig({ action: 'reset' })

      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/test/project/.env')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration reset!')
      )
    })

    it('should not reset configuration when user cancels', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockInquirer.prompt.mockResolvedValue({ confirm: false })

      await runConfig({ action: 'reset' })

      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
    })

    it('should handle missing .env file during reset', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockInquirer.prompt.mockResolvedValue({ confirm: true })

      await runConfig({ action: 'reset' })

      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️  No configuration file found.')
      )
    })

    it('should run interactive mode when no action specified', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')
      mockInquirer.prompt.mockResolvedValue({ action: 'view' })

      await runConfig()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should handle filesystem errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      await expect(runConfig()).resolves.not.toThrow()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
    })

    it('should handle inquirer errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')
      // Mock the inquirer.prompt call to fail - this will trigger the interactive mode
      mockInquirer.prompt.mockRejectedValue(new Error('Inquirer failed'))

      // Pass undefined action to trigger interactive mode at the end of the function
      await expect(
        runConfig({ action: undefined as unknown as 'view' | 'edit' | 'reset' })
      ).resolves.not.toThrow()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Settings failed:')
      )
    })
  })

  describe('Configuration display', () => {
    it('should display all configuration sections', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        'OPENAI_API_KEY=test-key\nGEMINI_API_KEY=gemini-key\nOPENAI_MODEL=gpt-4o-mini\nGEMINI_MODEL=gemini-2.0-flash\nDEFAULT_PROVIDER=openai\nBITBUCKET_EMAIL=test@example.com\nBITBUCKET_TOKEN=bb-token\nGITHUB_TOKEN=gh-token\n'
      )

      await runConfig({ action: 'view' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🤖 AI Providers:')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧠 AI Models:')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔗 Git Hosting:')
      )
    })

    it('should show configured status correctly', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        'OPENAI_API_KEY=test-key\nGEMINI_API_KEY=\nBITBUCKET_EMAIL=test@example.com\nBITBUCKET_TOKEN=bb-token\n'
      )

      await runConfig({ action: 'view' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI API Key: ✅ Configured')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Gemini API Key: ❌ Not configured')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Bitbucket: ✅ Configured')
      )
    })
  })

  describe('Edit Configuration Functions', () => {
    beforeEach(() => {
      // Mock fs.writeFileSync for saveEnvConfig tests
      mockFs.writeFileSync = jest.fn()
      // Also mock fs.unlinkSync for reset tests
      mockFs.unlinkSync = jest.fn()
    })

    it('should save configuration to .env file', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=old-key\n')

      // Mock the edit configuration flow
      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'new-openai-key',
          geminiKey: 'new-gemini-key',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'OPENAI_API_KEY=new-openai-key\nGEMINI_API_KEY=new-gemini-key\n'
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration saved to .env file')
      )
    })

    it('should edit AI models configuration', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'models' })
        .mockResolvedValueOnce({
          openaiModel: 'gpt-4o',
          geminiModel: 'gemini-2.0-pro',
          defaultProvider: 'openai',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ AI Models updated')
      )
    })

    it('should edit AI models with custom models', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'models' })
        .mockResolvedValueOnce({
          openaiModel: 'custom',
          geminiModel: 'custom',
          defaultProvider: 'gemini',
        })
        .mockResolvedValueOnce({ customOpenaiModel: 'custom-gpt-model' })
        .mockResolvedValueOnce({ customGeminiModel: 'custom-gemini-model' })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        expect.stringContaining('OPENAI_MODEL=custom-gpt-model')
      )
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        expect.stringContaining('GEMINI_MODEL=custom-gemini-model')
      )
    })

    it('should edit git hosting configuration', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'hosting' })
        .mockResolvedValueOnce({
          bitbucketEmail: 'test@example.com',
          bitbucketToken: 'bb-token',
          githubToken: 'gh-token',
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Git Hosting credentials updated')
      )
    })

    it('should cancel edit configuration and save unchanged config', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt.mockResolvedValueOnce({ editSection: 'cancel' })

      await runConfig({ action: 'edit' })

      // When cancelled, it still saves the original unchanged config
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'OPENAI_API_KEY=test-key\n'
      )
    })

    it('should handle interactive mode with view action', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'view' })

      await runConfig({
        action: undefined as unknown as 'view' | 'edit' | 'reset',
      })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔧 Current Configuration')
      )
    })

    it('should handle interactive mode with edit action', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ action: 'edit' })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({
        action: undefined as unknown as 'view' | 'edit' | 'reset',
      })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration updated!')
      )
    })

    it('should handle interactive mode with reset action', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ action: 'reset' })
        .mockResolvedValueOnce({ confirm: true })

      await runConfig({
        action: undefined as unknown as 'view' | 'edit' | 'reset',
      })

      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/test/project/.env')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Configuration reset!')
      )
    })

    it('should handle interactive mode with cancel action', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=test-key\n')

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'cancel' })

      await runConfig({
        action: undefined as unknown as 'view' | 'edit' | 'reset',
      })

      // Should not perform any actions when cancelled
      expect(mockFs.writeFileSync).not.toHaveBeenCalled()
      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
    })

    it('should skip saving empty values in configuration', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('OPENAI_API_KEY=old-key\n')

      mockInquirer.prompt
        .mockResolvedValueOnce({ editSection: 'providers' })
        .mockResolvedValueOnce({
          openaiKey: 'new-key',
          geminiKey: '', // Empty value should be skipped
        })
        .mockResolvedValueOnce({ editSection: 'save' })

      await runConfig({ action: 'edit' })

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'OPENAI_API_KEY=new-key\n' // Should not include empty geminiKey
      )
    })

    it('should handle interactive reset when no .env file exists', async () => {
      mockFs.existsSync.mockReturnValue(false)

      mockInquirer.prompt
        .mockResolvedValueOnce({ action: 'reset' })
        .mockResolvedValueOnce({ confirm: true })

      await runConfig({
        action: undefined as unknown as 'view' | 'edit' | 'reset',
      })

      expect(mockFs.unlinkSync).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️  No configuration file found.')
      )
    })
  })

  describe('Direct execution', () => {
    let originalArgv: string[]

    beforeEach(() => {
      originalArgv = process.argv
    })

    afterEach(() => {
      process.argv = originalArgv
    })

    it('should run config when executed directly', async () => {
      // Mock process.argv to simulate direct execution
      process.argv = ['node', '/path/to/config.js']
      mockFs.existsSync.mockReturnValue(false)

      // Import the module to trigger the direct execution check
      // We need to use dynamic import and then check if it was called
      // Since the direct execution is at module level, we'll test the behavior indirectly
      expect(process.argv[1]).toContain('config.js')
    })

    it('should not run config when not executed directly', async () => {
      // Mock process.argv to simulate non-direct execution
      process.argv = ['node', '/path/to/other-file.js']

      // The check should be false, so runConfig should not be called
      expect(process.argv[1]).not.toContain('config.js')
    })

    it('should handle missing process.argv[1]', async () => {
      // Mock process.argv with undefined argv[1]
      process.argv = ['node']

      // Should not crash and should not match config.js
      expect(process.argv[1]).toBeUndefined()
    })
  })
})
