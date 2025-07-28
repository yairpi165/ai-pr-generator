import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import { runInit } from '../../commands/init.js'

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>

// Mock console methods for this specific test
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()

describe('Init Command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConsoleLog.mockClear()

    // Default path mocks
    mockPath.join.mockImplementation((...args) => args.join('/'))

    // Default process mocks
    Object.defineProperty(process, 'version', {
      value: 'v18.0.0',
      writable: true,
    })

    const mockCwd = jest.fn().mockReturnValue('/test/project')
    Object.defineProperty(process, 'cwd', {
      value: mockCwd,
      writable: true,
    })
  })

  describe('runInit function', () => {
    it('should complete basic initialization flow', async () => {
      // Setup successful mocks
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version 2.39.0'))
      mockInquirer.prompt
        .mockResolvedValueOnce({ openaiKey: 'test-key' })
        .mockResolvedValueOnce({ geminiKey: '' })
        .mockResolvedValueOnce({ bitbucketEmail: '', bitbucketToken: '' })
        .mockResolvedValueOnce({ githubToken: '' })

      await runInit({})

      // Verify basic file operations were called
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'OPENAI_API_KEY=test-key\n'
      )
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/reviewers.json.example',
        expect.any(String)
      )
    })

    it('should handle Node.js version check failure', async () => {
      Object.defineProperty(process, 'version', {
        value: 'v16.0.0',
        writable: true,
      })

      await runInit({})

      // Should not create files when Node version is too old
      expect(mockFs.writeFileSync).not.toHaveBeenCalled()
    })

    it('should handle existing .env file', async () => {
      mockFs.existsSync.mockImplementation(filePath => {
        if (filePath === '/test/project/.env') return true
        return false
      })
      mockExecSync.mockReturnValue(Buffer.from('git version'))

      await runInit({})

      // Should not overwrite existing .env file
      expect(mockFs.writeFileSync).not.toHaveBeenCalledWith(
        '/test/project/.env',
        expect.any(String)
      )
    })

    it('should create .gitignore when it does not exist', async () => {
      mockFs.existsSync.mockImplementation(filePath => {
        if (filePath === '/test/project/.gitignore') return false
        return false
      })
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.gitignore',
        '.env\n'
      )
    })

    it('should append to existing .gitignore if .env not present', async () => {
      mockFs.existsSync.mockImplementation(filePath => {
        if (filePath === '/test/project/.gitignore') return true
        return false
      })
      mockFs.readFileSync.mockReturnValue('node_modules/\n*.log\n')
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        '/test/project/.gitignore',
        '\n.env\n'
      )
    })

    it('should not modify .gitignore if .env already present', async () => {
      mockFs.existsSync.mockImplementation(filePath => {
        if (filePath === '/test/project/.gitignore') return true
        return false
      })
      mockFs.readFileSync.mockReturnValue('node_modules/\n.env\n*.log\n')
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      expect(mockFs.appendFileSync).not.toHaveBeenCalled()
    })

    it('should handle git not being available', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockImplementation(() => {
        throw new Error('git not found')
      })
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      // Should continue initialization even without git
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/reviewers.json.example',
        expect.any(String)
      )
    })

    it('should create reviewers.json.example with correct structure', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      const reviewersCall = mockFs.writeFileSync.mock.calls.find(
        call => call[0] === '/test/project/reviewers.json.example'
      )
      expect(reviewersCall).toBeDefined()

      const reviewersContent = JSON.parse(reviewersCall?.[1] as string)
      expect(reviewersContent).toHaveProperty('bitbucket')
      expect(reviewersContent).toHaveProperty('github')
      expect(reviewersContent).toHaveProperty('gitlab')
      expect(reviewersContent).toHaveProperty('default')
      expect(reviewersContent.bitbucket).toHaveLength(2)
    })

    it('should handle multiple API keys correctly', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt
        .mockResolvedValueOnce({ openaiKey: 'openai-key' })
        .mockResolvedValueOnce({ geminiKey: 'gemini-key' })
        .mockResolvedValueOnce({
          bitbucketEmail: 'test@example.com',
          bitbucketToken: 'bb-token',
        })
        .mockResolvedValueOnce({ githubToken: 'gh-token' })

      await runInit({})

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.env',
        'OPENAI_API_KEY=openai-key\nGEMINI_API_KEY=gemini-key\nBITBUCKET_EMAIL=test@example.com\nBITBUCKET_TOKEN=bb-token\nGITHUB_TOKEN=gh-token\n'
      )
    })

    it('should handle initialization errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockRejectedValue(new Error('Inquirer failed'))

      // Should not throw an error
      await expect(runInit({})).resolves.not.toThrow()
    })

    it('should use provided options as defaults', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt
        .mockResolvedValueOnce({ openaiKey: 'preset-key' })
        .mockResolvedValueOnce({ geminiKey: '' })
        .mockResolvedValueOnce({ bitbucketEmail: '', bitbucketToken: '' })
        .mockResolvedValueOnce({ githubToken: '' })

      await runInit({ openaiKey: 'preset-key' })

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'input',
          name: 'openaiKey',
          message: '🔑 Enter your OpenAI API key (press Enter to skip):',
          default: 'preset-key',
        },
      ])
    })
  })

  describe('Edge cases', () => {
    it('should handle filesystem errors', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })
      mockInquirer.prompt
        .mockResolvedValueOnce({ openaiKey: 'test-key' })
        .mockResolvedValueOnce({ geminiKey: '' })
        .mockResolvedValueOnce({ bitbucketEmail: '', bitbucketToken: '' })
        .mockResolvedValueOnce({ githubToken: '' })

      // Should not throw an error
      await expect(runInit({})).resolves.not.toThrow()
    })

    it('should handle missing process version', async () => {
      Object.defineProperty(process, 'version', {
        get: () => {
          throw new Error('Version not available')
        },
      })

      await runInit({})

      // Should not proceed with initialization
      expect(mockFs.writeFileSync).not.toHaveBeenCalled()
    })

    it('should handle empty API key responses', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockReturnValue(Buffer.from('git version'))
      mockInquirer.prompt.mockResolvedValue({ openaiKey: '', geminiKey: '' })

      await runInit({})

      // Should not create .env file with empty keys
      expect(mockFs.writeFileSync).not.toHaveBeenCalledWith(
        '/test/project/.env',
        expect.any(String)
      )
      // But should still create other files
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/reviewers.json.example',
        expect.any(String)
      )
    })
  })
})
