// Mock external dependencies at module level
// open and chalk are already mocked in setup.ts
jest.mock('../../../../domain/config/constants.js', () => ({
  CONFIG_CONSTANTS: {
    API: {
      GITHUB_PR: 'https://api.github.com/repos',
    },
    URLS: {
      GITHUB: 'https://github.com',
    },
  },
}))
jest.mock('../../../../domain/ui/constants.js', () => ({
  UI_CONSTANTS: {
    EMOJIS: {
      SUCCESS: '✅',
    },
    SUCCESS: {
      PR_CREATED: 'Created PR successfully!',
      OPENED_GITHUB: 'Opened GitHub PR page.',
    },
    INFO: {
      NO_GITHUB_CREDENTIALS: 'No GitHub API credentials found.',
      SET_GITHUB_CREDENTIALS: 'Set GITHUB_TOKEN environment variable.',
    },
  },
}))
jest.mock('../../../../domain/pr/index.js', () => ({
  getGitHubReviewers: jest.fn(),
}))
jest.mock('../../../../domain/git/repository.js', () => ({
  getGitRepository: jest.fn(),
}))

import open from 'open'
// Remove unused chalk import
import { CONFIG_CONSTANTS } from '../../../../domain/config/constants.js'
import { UI_CONSTANTS } from '../../../../domain/ui/constants.js'
import { getGitHubReviewers } from '../../../../domain/pr/index.js'
import {
  parseGitHubRepo,
  checkGitHubCredentials,
  createGitHubPR,
  openGitHubPRInBrowser,
  openGitHubPR,
  type GitHubRepoInfo,
} from '../../../../domain/git/hosting/github.js'
import { getGitRepository } from '../../../../domain/git/repository.js'

const mockOpen = open as jest.MockedFunction<typeof open>
// Remove unused mockChalk variable
const mockGetGitHubReviewers = getGitHubReviewers as jest.MockedFunction<
  typeof getGitHubReviewers
>
const mockGetGitRepository = getGitRepository as jest.MockedFunction<
  typeof getGitRepository
>

// Mock fetch globally
// global.fetch is already mocked in setup.ts

describe('GitHub Git Hosting', () => {
  const mockRepoInfo = {
    root: '/path/to/repo',
    currentBranch: 'feature-branch',
    defaultBranch: 'main',
    remoteUrl: 'git@github.com:owner/repo.git',
  }

  const mockGitHubInfo: GitHubRepoInfo = {
    owner: 'owner',
    repository: 'repo',
  }

  const mockToken = 'test-token'

  const mockReviewers = [
    { username: 'reviewer1', name: 'Reviewer One' },
    { username: 'reviewer2', name: 'Reviewer Two' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    mockGetGitRepository.mockReturnValue(mockRepoInfo)
    mockGetGitHubReviewers.mockReturnValue(mockReviewers)
    mockOpen.mockResolvedValue({} as unknown as ReturnType<typeof open>)

    // Mock fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        html_url: 'https://github.com/owner/repo/pull/123',
      }),
      text: jest.fn().mockResolvedValue(''),
    })

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('parseGitHubRepo', () => {
    describe('SSH URLs', () => {
      it('should parse SSH URL correctly', () => {
        const result = parseGitHubRepo('git@github.com:owner/repo.git')

        expect(result).toEqual({
          owner: 'owner',
          repository: 'repo',
        })
      })

      it('should parse SSH URL with hyphenated names', () => {
        const result = parseGitHubRepo('git@github.com:my-owner/repo.git')

        expect(result).toEqual({
          owner: 'my-owner',
          repository: 'repo',
        })
      })

      it('should parse SSH URL with underscored names', () => {
        const result = parseGitHubRepo('git@github.com:owner/my_repo.git')

        expect(result).toEqual({
          owner: 'owner',
          repository: 'my_repo',
        })
      })

      it('should parse SSH URL with numeric characters', () => {
        const result = parseGitHubRepo('git@github.com:owner123/repo456.git')

        expect(result).toEqual({
          owner: 'owner123',
          repository: 'repo456',
        })
      })

      it('should parse SSH URL with dots in names', () => {
        const result = parseGitHubRepo(
          'git@github.com:owner.test/repo.example.git'
        )

        expect(result).toEqual({
          owner: 'owner.test',
          repository: 'repo.example',
        })
      })

      it('should throw error for invalid SSH URL format', () => {
        expect(() => parseGitHubRepo('git@github.com:invalid')).toThrow(
          'Invalid GitHub SSH URL format'
        )
      })
    })

    describe('HTTPS URLs', () => {
      it('should parse HTTPS URL correctly', () => {
        const result = parseGitHubRepo('https://github.com/owner/repo.git')

        expect(result).toEqual({
          owner: 'owner',
          repository: 'repo',
        })
      })

      it('should parse HTTPS URL with complex names', () => {
        const result = parseGitHubRepo(
          'https://github.com/my-owner/my_repo.git'
        )

        expect(result).toEqual({
          owner: 'my-owner',
          repository: 'my_repo',
        })
      })

      it('should parse HTTPS URL with dots', () => {
        const result = parseGitHubRepo(
          'https://github.com/owner.test/repo.example.git'
        )

        expect(result).toEqual({
          owner: 'owner.test',
          repository: 'repo.example',
        })
      })

      it('should throw error for invalid HTTPS URL format', () => {
        expect(() => parseGitHubRepo('https://github.com/invalid')).toThrow(
          'Invalid GitHub HTTPS URL format'
        )
      })

      it('should throw error for unsupported domains or protocols', () => {
        expect(() =>
          parseGitHubRepo('https://bitbucket.org/owner/repo.git')
        ).toThrow('Invalid GitHub HTTPS URL format')
      })

      it('should throw error for unsupported protocols', () => {
        expect(() =>
          parseGitHubRepo('ftp://github.com/owner/repo.git')
        ).toThrow('Unsupported remote URL format')
      })
    })

    describe('Unsupported URL formats', () => {
      it('should throw error for unsupported URL protocols', () => {
        expect(() => parseGitHubRepo('ftp://example.com/repo.git')).toThrow(
          'Unsupported remote URL format'
        )
      })

      it('should handle empty or malformed URLs', () => {
        expect(() => parseGitHubRepo('')).toThrow(
          'Unsupported remote URL format'
        )
        expect(() => parseGitHubRepo('not-a-url')).toThrow(
          'Unsupported remote URL format'
        )
      })
    })

    describe('Edge cases', () => {
      it('should handle URLs with trailing slashes', () => {
        const result = parseGitHubRepo('git@github.com:owner/repo.git/')

        expect(result).toEqual({
          owner: 'owner',
          repository: 'repo',
        })
      })

      it('should handle case sensitivity correctly', () => {
        const result = parseGitHubRepo('git@github.com:OWNER/REPO.git')

        expect(result).toEqual({
          owner: 'OWNER',
          repository: 'REPO',
        })
      })

      it('should preserve exact owner and repository names', () => {
        const result = parseGitHubRepo('git@github.com:MyOwner/MyRepo.git')

        expect(result).toEqual({
          owner: 'MyOwner',
          repository: 'MyRepo',
        })
      })

      it('should handle minimal valid names', () => {
        const result = parseGitHubRepo('git@github.com:a/b.git')

        expect(result).toEqual({
          owner: 'a',
          repository: 'b',
        })
      })

      it('should handle long names', () => {
        const longOwner = 'a'.repeat(50)
        const longRepo = 'b'.repeat(50)
        const result = parseGitHubRepo(
          `git@github.com:${longOwner}/${longRepo}.git`
        )

        expect(result).toEqual({
          owner: longOwner,
          repository: longRepo,
        })
      })
    })

    describe('Real-world examples', () => {
      it('should parse popular open source repositories', () => {
        const result = parseGitHubRepo('git@github.com:facebook/react.git')

        expect(result).toEqual({
          owner: 'facebook',
          repository: 'react',
        })
      })

      it('should parse organization repositories', () => {
        const result = parseGitHubRepo(
          'git@github.com:microsoft/typescript.git'
        )

        expect(result).toEqual({
          owner: 'microsoft',
          repository: 'typescript',
        })
      })

      it('should parse personal repositories', () => {
        const result = parseGitHubRepo('git@github.com:john-doe/my-project.git')

        expect(result).toEqual({
          owner: 'john-doe',
          repository: 'my-project',
        })
      })

      it('should parse repositories with dots in names', () => {
        const result = parseGitHubRepo(
          'git@github.com:company.com/api.service.git'
        )

        expect(result).toEqual({
          owner: 'company.com',
          repository: 'api.service',
        })
      })

      it('should parse forked repositories', () => {
        const result = parseGitHubRepo('git@github.com:myusername/react.git')

        expect(result).toEqual({
          owner: 'myusername',
          repository: 'react',
        })
      })
    })
  })

  describe('checkGitHubCredentials', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return token when GITHUB_TOKEN is set', () => {
      process.env.GITHUB_TOKEN = 'test-token'

      const result = checkGitHubCredentials()

      expect(result).toBe('test-token')
    })

    it('should return null when GITHUB_TOKEN is not set', () => {
      process.env.GITHUB_TOKEN = undefined

      const result = checkGitHubCredentials()

      expect(result).toBeNull()
    })

    it('should return null when GITHUB_TOKEN is empty string', () => {
      process.env.GITHUB_TOKEN = ''

      const result = checkGitHubCredentials()

      expect(result).toBeNull()
    })

    it('should return whitespace token when GITHUB_TOKEN is whitespace only', () => {
      process.env.GITHUB_TOKEN = '   '

      const result = checkGitHubCredentials()

      expect(result).toBe('   ')
    })
  })

  describe('createGitHubPR', () => {
    it('should create PR successfully with reviewers', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          html_url: 'https://github.com/owner/repo/pull/123',
        }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createGitHubPR(
        mockRepoInfo,
        mockGitHubInfo,
        mockToken,
        'Test PR Title',
        'Test PR Description'
      )

      expect(mockFetch).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.API.GITHUB_PR}/${mockGitHubInfo.owner}/${mockGitHubInfo.repository}/pulls`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${mockToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AI-PR-Generator',
          },
          body: JSON.stringify({
            title: 'Test PR Title',
            body: 'Test PR Description',
            head: mockRepoInfo.currentBranch,
            base: mockRepoInfo.defaultBranch,
            reviewers: ['reviewer1', 'reviewer2'],
          }),
        })
      )

      expect(mockOpen).toHaveBeenCalledWith(
        'https://github.com/owner/repo/pull/123'
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.SUCCESS.PR_CREATED)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔗 URL:')
      )
    })

    it('should handle API errors', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      })

      await expect(
        createGitHubPR(
          mockRepoInfo,
          mockGitHubInfo,
          mockToken,
          'Test PR Title',
          'Test PR Description'
        )
      ).rejects.toThrow('GitHub API error: 400 - Bad Request')
    })

    it('should handle empty reviewers list', async () => {
      mockGetGitHubReviewers.mockReturnValue([])
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          html_url: 'https://github.com/owner/repo/pull/123',
        }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createGitHubPR(
        mockRepoInfo,
        mockGitHubInfo,
        mockToken,
        'Test PR Title',
        'Test PR Description'
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.reviewers).toEqual([])
    })

    it('should filter out reviewers without usernames', async () => {
      mockGetGitHubReviewers.mockReturnValue([
        { username: 'reviewer1', name: 'Reviewer One' },
        { username: '', name: 'Reviewer Two' },
        { username: undefined, name: 'Reviewer Three' },
      ])

      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          html_url: 'https://github.com/owner/repo/pull/123',
        }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createGitHubPR(
        mockRepoInfo,
        mockGitHubInfo,
        mockToken,
        'Test PR Title',
        'Test PR Description'
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.reviewers).toEqual(['reviewer1'])
    })
  })

  describe('openGitHubPRInBrowser', () => {
    it('should open GitHub PR page in browser', async () => {
      await openGitHubPRInBrowser(mockGitHubInfo, 'feature-branch')

      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.GITHUB}/${mockGitHubInfo.owner}/${mockGitHubInfo.repository}/compare/${mockGitHubInfo.owner}:feature-branch?expand=1`
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.SUCCESS.OPENED_GITHUB)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔗 URL:')
      )
    })

    it('should handle different branch names', async () => {
      await openGitHubPRInBrowser(mockGitHubInfo, 'main')

      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.GITHUB}/${mockGitHubInfo.owner}/${mockGitHubInfo.repository}/compare/${mockGitHubInfo.owner}:main?expand=1`
      )
    })
  })

  describe('openGitHubPR', () => {
    it('should create PR with credentials when available', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          html_url: 'https://github.com/owner/repo/pull/123',
        }),
        text: jest.fn().mockResolvedValue(''),
      })

      // Mock checkGitHubCredentials to return token
      const originalEnv = process.env
      process.env.GITHUB_TOKEN = 'test-token'

      await openGitHubPR('Test Title', 'Test Description')

      expect(mockGetGitRepository).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
      expect(mockOpen).toHaveBeenCalled()

      process.env = originalEnv
    })

    it('should fallback to browser when no credentials', async () => {
      // Mock checkGitHubCredentials to return null
      const originalEnv = process.env
      delete process.env.GITHUB_TOKEN

      await openGitHubPR('Test Title', 'Test Description')

      expect(mockGetGitRepository).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.INFO.NO_GITHUB_CREDENTIALS)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.INFO.SET_GITHUB_CREDENTIALS)
      )
      expect(mockOpen).toHaveBeenCalled()

      process.env = originalEnv
    })

    it('should use default title and description when not provided', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          html_url: 'https://github.com/owner/repo/pull/123',
        }),
        text: jest.fn().mockResolvedValue(''),
      })

      const originalEnv = process.env
      process.env.GITHUB_TOKEN = 'test-token'

      await openGitHubPR()

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.title).toBe(`PR from ${mockRepoInfo.currentBranch}`)
      expect(callBody.body).toBe(
        `Pull request from branch: ${mockRepoInfo.currentBranch}`
      )

      process.env = originalEnv
    })

    it('should handle errors and rethrow them', async () => {
      const testError = new Error('Test error')
      mockGetGitRepository.mockImplementation(() => {
        throw testError
      })

      await expect(openGitHubPR()).rejects.toThrow('Test error')
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create GitHub PR:'),
        testError
      )
    })

    it('should handle API errors gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      })

      const originalEnv = process.env
      process.env.GITHUB_TOKEN = 'test-token'

      await expect(
        openGitHubPR('Test Title', 'Test Description')
      ).rejects.toThrow('GitHub API error: 401 - Unauthorized')

      process.env = originalEnv
    })
  })
})
