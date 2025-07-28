// Mock external dependencies at module level
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}))
jest.mock('chalk', () => ({
  green: jest.fn((str: string) => str),
  yellow: jest.fn((str: string) => str),
}))
jest.mock('clipboardy', () => ({
  write: jest.fn(),
}))
jest.mock('open', () => jest.fn())
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))
jest.mock('../../../domain/git/index.js', () => ({
  openBitbucketPR: jest.fn(),
  openGitHubPR: jest.fn(),
}))

import { handleOutputOptions } from '../../../domain/ui/output.js'
import { UI_CONSTANTS } from '../../../domain/ui/constants.js'
import inquirer from 'inquirer'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import open from 'open'
import fs from 'fs'
import { openBitbucketPR, openGitHubPR } from '../../../domain/git/index.js'

const mockInquirer = inquirer as jest.Mocked<typeof inquirer>
const mockChalk = chalk as jest.Mocked<typeof chalk>
const mockClipboardy = clipboardy as jest.Mocked<typeof clipboardy>
const mockOpen = open as jest.MockedFunction<typeof open>
const mockFs = fs as jest.Mocked<typeof fs>
const mockOpenBitbucketPR = openBitbucketPR as jest.MockedFunction<
  typeof openBitbucketPR
>
const mockOpenGitHubPR = openGitHubPR as jest.MockedFunction<
  typeof openGitHubPR
>

describe('UI Output Handling', () => {
  const testOutputPath = '/path/to/pr-description.md'
  const testTitle = 'feat(PROJ-123): Add new feature'
  const testDescription = 'PR description content'
  const testFileContent = '# PR Title\n\nPR content'

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset all mocks to default behavior
    mockFs.readFileSync.mockReturnValue(testFileContent)
    mockClipboardy.write.mockResolvedValue(undefined)
    mockOpen.mockResolvedValue({} as unknown as ReturnType<typeof open>)
    mockOpenBitbucketPR.mockResolvedValue(undefined)
    mockOpenGitHubPR.mockResolvedValue(undefined)
    mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

    // Mock console.log to avoid test output noise
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('handleOutputOptions', () => {
    it('should prompt user with output choices', async () => {
      mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

      await handleOutputOptions(testOutputPath, testTitle, testDescription)

      expect(mockInquirer.prompt).toHaveBeenCalledTimes(1)
      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'list',
          name: 'action',
          message: UI_CONSTANTS.MESSAGES.WHAT_TO_DO,
          choices: UI_CONSTANTS.OUTPUT_CHOICES,
        },
      ])
    })

    describe('clipboard action', () => {
      it('should copy file content to clipboard', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockFs.readFileSync).toHaveBeenCalledWith(testOutputPath, 'utf8')
        expect(mockClipboardy.write).toHaveBeenCalledWith(testFileContent)
        expect(console.log).toHaveBeenCalled()
      })

      it('should handle file read errors', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })
        mockFs.readFileSync.mockImplementationOnce(() => {
          throw new Error('File not found')
        })

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('File not found')
      })

      it('should handle clipboard write errors', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })
        mockClipboardy.write.mockRejectedValueOnce(
          new Error('Clipboard unavailable')
        )

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('Clipboard unavailable')
      })
    })

    describe('editor action', () => {
      it('should open file in default editor', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'editor' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockOpen).toHaveBeenCalledWith(testOutputPath)
        expect(console.log).toHaveBeenCalled()
      })

      it('should handle editor open errors', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'editor' })
        mockOpen.mockRejectedValueOnce(new Error('No default editor'))

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('No default editor')
      })
    })

    describe('bitbucket action', () => {
      it('should open Bitbucket PR', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'bitbucket' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockOpenBitbucketPR).toHaveBeenCalledWith(
          testTitle,
          testDescription
        )
      })

      it('should handle Bitbucket PR creation errors', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'bitbucket' })
        mockOpenBitbucketPR.mockRejectedValueOnce(
          new Error('Bitbucket API error')
        )

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('Bitbucket API error')
      })

      it('should work without title and description', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'bitbucket' })

        await handleOutputOptions(testOutputPath)

        expect(mockOpenBitbucketPR).toHaveBeenCalledWith(undefined, undefined)
      })
    })

    describe('github action', () => {
      it('should open GitHub PR', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'github' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockOpenGitHubPR).toHaveBeenCalledWith(
          testTitle,
          testDescription
        )
      })

      it('should handle GitHub PR creation errors', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'github' })
        mockOpenGitHubPR.mockRejectedValueOnce(new Error('GitHub API error'))

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('GitHub API error')
      })

      it('should work without title and description', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'github' })

        await handleOutputOptions(testOutputPath)

        expect(mockOpenGitHubPR).toHaveBeenCalledWith(undefined, undefined)
      })
    })

    describe('both action', () => {
      it('should copy to clipboard and open editor', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'both' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockFs.readFileSync).toHaveBeenCalledWith(testOutputPath, 'utf8')
        expect(mockClipboardy.write).toHaveBeenCalledWith(testFileContent)
        expect(mockOpen).toHaveBeenCalledWith(testOutputPath)
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining(UI_CONSTANTS.SUCCESS.COPIED_AND_OPENED)
        )
      })

      it('should handle partial failures gracefully', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'both' })
        mockClipboardy.write.mockRejectedValueOnce(
          new Error('Clipboard failed')
        )

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('Clipboard failed')

        // Should not reach open call due to clipboard failure
        expect(mockOpen).not.toHaveBeenCalled()
      })
    })

    describe('nothing action', () => {
      it('should do nothing and display skip message', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockFs.readFileSync).not.toHaveBeenCalled()
        expect(mockClipboardy.write).not.toHaveBeenCalled()
        expect(mockOpen).not.toHaveBeenCalled()
        expect(mockOpenBitbucketPR).not.toHaveBeenCalled()
        expect(mockOpenGitHubPR).not.toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining(UI_CONSTANTS.SUCCESS.SKIPPING)
        )
      })
    })

    describe('output choices configuration', () => {
      it('should use UI_CONSTANTS.OUTPUT_CHOICES', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        const promptCall = mockInquirer.prompt.mock
          .calls[0][0] as unknown as Array<{
          type: string
          name: string
          message: string
          choices: Array<{ name: string; value: string }>
        }>
        expect(promptCall[0].choices).toEqual(UI_CONSTANTS.OUTPUT_CHOICES)
      })

      it('should include all expected output choices', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        const promptCall = mockInquirer.prompt.mock
          .calls[0][0] as unknown as Array<{
          type: string
          name: string
          message: string
          choices: Array<{ name: string; value: string }>
        }>
        const choices = promptCall[0].choices

        expect(choices).toContainEqual({
          name: '📋 Copy to clipboard',
          value: 'clipboard',
        })
        expect(choices).toContainEqual({
          name: '📝 Open in editor',
          value: 'editor',
        })
        expect(choices).toContainEqual({
          name: '🔗 Open PR in Bitbucket',
          value: 'bitbucket',
        })
        expect(choices).toContainEqual({
          name: '🐙 Open PR in GitHub',
          value: 'github',
        })
        expect(choices).toContainEqual({ name: '📋 + 📝 Both', value: 'both' })
        expect(choices).toContainEqual({
          name: '🚫 Do nothing',
          value: 'nothing',
        })
      })
    })

    describe('message formatting', () => {
      it('should use chalk for colored output', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockChalk.green).toHaveBeenCalled()
      })

      it('should include emojis in success messages', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining(UI_CONSTANTS.EMOJIS.SUCCESS)
        )
      })

      it('should use different colors for different message types', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'nothing' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockChalk.yellow).toHaveBeenCalled()
      })
    })

    describe('edge cases', () => {
      it('should handle unknown action gracefully', async () => {
        mockInquirer.prompt.mockResolvedValue({
          action: 'unknown' as 'clipboard' | 'editor' | 'pr' | 'nothing',
        })

        // Should not throw, just not match any case
        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockFs.readFileSync).not.toHaveBeenCalled()
        expect(mockClipboardy.write).not.toHaveBeenCalled()
        expect(mockOpen).not.toHaveBeenCalled()
      })

      it('should handle empty file paths', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions('', testTitle, testDescription)

        expect(mockFs.readFileSync).toHaveBeenCalledWith('', 'utf8')
      })

      it('should handle very large file content', async () => {
        const largeContent = 'A'.repeat(100000)
        mockFs.readFileSync.mockReturnValue(largeContent)
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockClipboardy.write).toHaveBeenCalledWith(largeContent)
      })

      it('should handle special characters in file paths', async () => {
        const specialPath = '/path/with spaces/and-émojis🚀/pr.md'
        mockInquirer.prompt.mockResolvedValue({ action: 'editor' })

        await handleOutputOptions(specialPath, testTitle, testDescription)

        expect(mockOpen).toHaveBeenCalledWith(specialPath)
      })

      it('should handle binary file content', async () => {
        const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString(
          'utf8'
        )
        mockFs.readFileSync.mockReturnValue(binaryContent)
        mockInquirer.prompt.mockResolvedValue({ action: 'clipboard' })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(mockClipboardy.write).toHaveBeenCalledWith(binaryContent)
      })
    })

    describe('async error handling', () => {
      it('should propagate inquirer prompt errors', async () => {
        mockInquirer.prompt.mockRejectedValueOnce(new Error('User cancelled'))

        await expect(
          handleOutputOptions(testOutputPath, testTitle, testDescription)
        ).rejects.toThrow('User cancelled')
      })

      it('should handle concurrent action execution', async () => {
        mockInquirer.prompt.mockResolvedValue({ action: 'both' })

        // Simulate slow operations
        let clipboardResolved = false
        let openResolved = false

        mockClipboardy.write.mockImplementationOnce(() => {
          return new Promise<void>(resolve => {
            setTimeout(() => {
              clipboardResolved = true
              resolve()
            }, 10)
          })
        })

        mockOpen.mockImplementationOnce(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              openResolved = true
              resolve({} as unknown as ReturnType<typeof open>)
            }, 5)
          })
        })

        await handleOutputOptions(testOutputPath, testTitle, testDescription)

        expect(clipboardResolved).toBe(true)
        expect(openResolved).toBe(true)
      })
    })

    describe('platform integration', () => {
      it('should handle platform-specific parameters correctly', async () => {
        const platforms = ['bitbucket', 'github'] as const

        for (const platform of platforms) {
          jest.clearAllMocks()
          // Reset mocks to default behavior
          mockFs.readFileSync.mockReturnValue(testFileContent)
          mockClipboardy.write.mockResolvedValue(undefined)
          mockOpen.mockResolvedValue({} as unknown as ReturnType<typeof open>)
          mockOpenBitbucketPR.mockResolvedValue(undefined)
          mockOpenGitHubPR.mockResolvedValue(undefined)
          mockInquirer.prompt.mockResolvedValue({ action: platform })

          await handleOutputOptions(testOutputPath, testTitle, testDescription)

          if (platform === 'bitbucket') {
            expect(mockOpenBitbucketPR).toHaveBeenCalledWith(
              testTitle,
              testDescription
            )
            expect(mockOpenGitHubPR).not.toHaveBeenCalled()
          } else if (platform === 'github') {
            expect(mockOpenGitHubPR).toHaveBeenCalledWith(
              testTitle,
              testDescription
            )
            expect(mockOpenBitbucketPR).not.toHaveBeenCalled()
          }
        }
      })
    })
  })
})
