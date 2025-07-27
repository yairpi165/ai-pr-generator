// Mock external dependencies at module level
jest.mock('open', () => jest.fn())
jest.mock('chalk', () => ({
  green: jest.fn((str: string) => str),
  yellow: jest.fn((str: string) => str),
  blue: jest.fn((str: string) => str),
  red: jest.fn((str: string) => str),
}))
jest.mock('../../../../domain/config/constants.js', () => ({
  CONFIG_CONSTANTS: {
    API: {
      BITBUCKET_PR: 'https://api.bitbucket.org/2.0/repositories',
    },
    URLS: {
      BITBUCKET: 'https://bitbucket.org',
    },
    PATHS: {
      PROJECT_ROOT: '/test/project/root',
      OUTPUT_FILE: 'pr-description.md',
      DIFF_FILE: 'diff.txt',
      REVIEWERS_FILE: 'reviewers.json',
    },
    ENV_VARS: {
      OPENAI_API_KEY: 'OPENAI_API_KEY',
      GEMINI_API_KEY: 'GEMINI_API_KEY',
      BITBUCKET_EMAIL: 'BITBUCKET_EMAIL',
      BITBUCKET_TOKEN: 'BITBUCKET_TOKEN',
      GITHUB_TOKEN: 'GITHUB_TOKEN',
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
      OPENED_BITBUCKET: 'Opened Bitbucket PR page.',
    },
    INFO: {
      NO_BITBUCKET_CREDENTIALS: 'No Bitbucket API credentials found.',
      SET_BITBUCKET_CREDENTIALS: 'Set BITBUCKET_EMAIL and BITBUCKET_TOKEN.',
    },
  },
}))
jest.mock('../../../../domain/pr/index.js', () => ({
  getBitbucketReviewers: jest.fn(),
}))
jest.mock('../../../../domain/git/repository.js', () => ({
  getGitRepository: jest.fn(),
}))

import open from 'open'
// Remove unused chalk import
import { UI_CONSTANTS } from '../../../../domain/ui/constants.js'
import { getBitbucketReviewers } from '../../../../domain/pr/index.js'
import { getGitRepository } from '../../../../domain/git/repository.js'
import {
  parseBitbucketRepo,
  checkBitbucketCredentials,
  createBitbucketPR,
  openBitbucketPRInBrowser,
  openBitbucketPR,
  type BitbucketRepoInfo,
} from '../../../../domain/git/hosting/bitbucket.js'
import { CONFIG_CONSTANTS } from '../../../../domain/config/index.js'

const mockOpen = open as jest.MockedFunction<typeof open>
// Remove unused mockChalk variable
const mockGetBitbucketReviewers = getBitbucketReviewers as jest.MockedFunction<
  typeof getBitbucketReviewers
>
const mockGetGitRepository = getGitRepository as jest.MockedFunction<
  typeof getGitRepository
>

// Mock fetch globally
global.fetch = jest.fn()

describe('Bitbucket Git Hosting', () => {
  const mockRepoInfo = {
    root: '/path/to/repo',
    currentBranch: 'feature-branch',
    defaultBranch: 'main',
    remoteUrl: 'git@bitbucket.org:workspace/repo.git',
  }

  const mockBitbucketInfo: BitbucketRepoInfo = {
    workspace: 'workspace',
    repository: 'repo',
  }

  const mockCredentials = {
    email: 'test@example.com',
    token: 'test-token',
  }

  const mockReviewers = [
    { username: 'reviewer1', name: 'Reviewer One' },
    { username: 'reviewer2', name: 'Reviewer Two' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    mockGetGitRepository.mockReturnValue(mockRepoInfo)
    mockGetBitbucketReviewers.mockReturnValue(mockReviewers)
    mockOpen.mockResolvedValue({} as any)

    // Mock fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 123 }),
      text: jest.fn().mockResolvedValue(''),
    })

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('parseBitbucketRepo', () => {
    describe('SSH URLs', () => {
      it('should parse SSH URL correctly', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:workspace/repo.git'
        )

        expect(result).toEqual({
          workspace: 'workspace',
          repository: 'repo',
        })
      })

      it('should parse SSH URL with hyphenated workspace', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:my-workspace/repo.git'
        )

        expect(result).toEqual({
          workspace: 'my-workspace',
          repository: 'repo',
        })
      })

      it('should parse SSH URL with underscored names', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:workspace/my_repo.git'
        )

        expect(result).toEqual({
          workspace: 'workspace',
          repository: 'my_repo',
        })
      })

      it('should parse SSH URL with numeric characters', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:workspace123/repo456.git'
        )

        expect(result).toEqual({
          workspace: 'workspace123',
          repository: 'repo456',
        })
      })

      it('should throw error for invalid SSH URL format', () => {
        expect(() => parseBitbucketRepo('git@bitbucket.org:invalid')).toThrow(
          'Invalid Bitbucket SSH URL format'
        )
      })
    })

    describe('HTTPS URLs', () => {
      it('should parse HTTPS URL correctly', () => {
        const result = parseBitbucketRepo(
          'https://bitbucket.org/workspace/repo.git'
        )

        expect(result).toEqual({
          workspace: 'workspace',
          repository: 'repo',
        })
      })

      it('should parse HTTPS URL with complex names', () => {
        const result = parseBitbucketRepo(
          'https://bitbucket.org/my-workspace/my_repo.git'
        )

        expect(result).toEqual({
          workspace: 'my-workspace',
          repository: 'my_repo',
        })
      })

      it('should parse HTTPS URL with special characters', () => {
        const result = parseBitbucketRepo(
          'https://bitbucket.org/workspace123/repo456.git'
        )

        expect(result).toEqual({
          workspace: 'workspace123',
          repository: 'repo456',
        })
      })

      it('should throw error for invalid HTTPS URL format', () => {
        expect(() =>
          parseBitbucketRepo('https://bitbucket.org/invalid')
        ).toThrow('Invalid Bitbucket HTTPS URL format')
      })

      it('should throw error for unsupported domains or protocols', () => {
        expect(() =>
          parseBitbucketRepo('https://github.com/owner/repo.git')
        ).toThrow('Invalid Bitbucket HTTPS URL format')
      })

      it('should throw error for unsupported protocols', () => {
        expect(() =>
          parseBitbucketRepo('ftp://bitbucket.org/workspace/repo.git')
        ).toThrow('Unsupported remote URL format')
      })
    })

    describe('Unsupported URL formats', () => {
      it('should throw error for unsupported URL protocols', () => {
        expect(() => parseBitbucketRepo('ftp://example.com/repo.git')).toThrow(
          'Unsupported remote URL format'
        )
      })

      it('should handle empty or malformed URLs', () => {
        expect(() => parseBitbucketRepo('')).toThrow(
          'Unsupported remote URL format'
        )
        expect(() => parseBitbucketRepo('not-a-url')).toThrow(
          'Unsupported remote URL format'
        )
      })
    })

    describe('Edge cases', () => {
      it('should handle URLs with trailing slashes', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:workspace/repo.git/'
        )

        expect(result).toEqual({
          workspace: 'workspace',
          repository: 'repo',
        })
      })

      it('should handle case sensitivity correctly', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:WORKSPACE/REPO.git'
        )

        expect(result).toEqual({
          workspace: 'WORKSPACE',
          repository: 'REPO',
        })
      })

      it('should preserve exact workspace and repository names', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:MyWorkspace/MyRepo.git'
        )

        expect(result).toEqual({
          workspace: 'MyWorkspace',
          repository: 'MyRepo',
        })
      })

      it('should handle minimal valid names', () => {
        const result = parseBitbucketRepo('git@bitbucket.org:a/b.git')

        expect(result).toEqual({
          workspace: 'a',
          repository: 'b',
        })
      })

      it('should handle long names', () => {
        const longWorkspace = 'a'.repeat(50)
        const longRepo = 'b'.repeat(50)
        const result = parseBitbucketRepo(
          `git@bitbucket.org:${longWorkspace}/${longRepo}.git`
        )

        expect(result).toEqual({
          workspace: longWorkspace,
          repository: longRepo,
        })
      })
    })

    describe('Real-world examples', () => {
      it('should parse typical company workspace URLs', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:acme-corp/project.git'
        )

        expect(result).toEqual({
          workspace: 'acme-corp',
          repository: 'project',
        })
      })

      it('should parse personal repository URLs', () => {
        const result = parseBitbucketRepo(
          'git@bitbucket.org:john-doe/my-project.git'
        )

        expect(result).toEqual({
          workspace: 'john-doe',
          repository: 'my-project',
        })
      })
    })
  })

  describe('checkBitbucketCredentials', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return credentials when both email and token are set', () => {
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = 'test-token'

      const result = checkBitbucketCredentials()

      expect(result).toEqual({
        email: 'test@example.com',
        token: 'test-token',
      })
    })

    it('should return null when email is missing', () => {
      process.env.BITBUCKET_EMAIL = undefined
      process.env.BITBUCKET_TOKEN = 'test-token'

      const result = checkBitbucketCredentials()

      expect(result).toBeNull()
    })

    it('should return null when token is missing', () => {
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = undefined

      const result = checkBitbucketCredentials()

      expect(result).toBeNull()
    })

    it('should return null when both credentials are missing', () => {
      process.env.BITBUCKET_EMAIL = undefined
      process.env.BITBUCKET_TOKEN = undefined

      const result = checkBitbucketCredentials()

      expect(result).toBeNull()
    })

    it('should return null when email is empty string', () => {
      process.env.BITBUCKET_EMAIL = ''
      process.env.BITBUCKET_TOKEN = 'test-token'

      const result = checkBitbucketCredentials()

      expect(result).toBeNull()
    })

    it('should return null when token is empty string', () => {
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = ''

      const result = checkBitbucketCredentials()

      expect(result).toBeNull()
    })
  })

  describe('createBitbucketPR', () => {
    it('should create PR successfully with reviewers', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123 }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createBitbucketPR(
        mockRepoInfo,
        mockBitbucketInfo,
        mockCredentials,
        'Test PR Title',
        'Test PR Description'
      )

      expect(mockFetch).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.API.BITBUCKET_PR}/${mockBitbucketInfo.workspace}/${mockBitbucketInfo.repository}/pullrequests`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${mockCredentials.email}:${mockCredentials.token}`).toString('base64')}`,
          },
          body: JSON.stringify({
            title: 'Test PR Title',
            description: 'Test PR Description',
            source: {
              branch: {
                name: mockRepoInfo.currentBranch,
              },
            },
            destination: {
              branch: {
                name: mockRepoInfo.defaultBranch,
              },
            },
            reviewers: [
              { display_name: 'reviewer1' },
              { display_name: 'reviewer2' },
            ],
          }),
        })
      )

      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${mockBitbucketInfo.workspace}/${mockBitbucketInfo.repository}/pull-requests/123`
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
        createBitbucketPR(
          mockRepoInfo,
          mockBitbucketInfo,
          mockCredentials,
          'Test PR Title',
          'Test PR Description'
        )
      ).rejects.toThrow('Bitbucket API error: 400 - Bad Request')
    })

    it('should handle empty reviewers list', async () => {
      mockGetBitbucketReviewers.mockReturnValue([])
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123 }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createBitbucketPR(
        mockRepoInfo,
        mockBitbucketInfo,
        mockCredentials,
        'Test PR Title',
        'Test PR Description'
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.reviewers).toEqual([])
    })

    it('should filter out reviewers without usernames', async () => {
      mockGetBitbucketReviewers.mockReturnValue([
        { username: 'reviewer1', name: 'Reviewer One' },
        { username: '', name: 'Reviewer Two' },
        { username: undefined, name: 'Reviewer Four' },
      ])

      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123 }),
        text: jest.fn().mockResolvedValue(''),
      })

      await createBitbucketPR(
        mockRepoInfo,
        mockBitbucketInfo,
        mockCredentials,
        'Test PR Title',
        'Test PR Description'
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.reviewers).toEqual([{ display_name: 'reviewer1' }])
    })
  })

  describe('openBitbucketPRInBrowser', () => {
    it('should open Bitbucket PR page in browser', async () => {
      await openBitbucketPRInBrowser(mockBitbucketInfo, 'feature-branch')

      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${mockBitbucketInfo.workspace}/${mockBitbucketInfo.repository}/pull-requests/new?source=feature-branch`
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.SUCCESS.OPENED_BITBUCKET)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔗 URL:')
      )
    })

    it('should handle different branch names', async () => {
      await openBitbucketPRInBrowser(mockBitbucketInfo, 'main')

      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${mockBitbucketInfo.workspace}/${mockBitbucketInfo.repository}/pull-requests/new?source=main`
      )
    })
  })

  describe('openBitbucketPR', () => {
    it('should create PR with credentials when available', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123 }),
        text: jest.fn().mockResolvedValue(''),
      })

      // Mock checkBitbucketCredentials to return credentials
      const originalEnv = process.env
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = 'test-token'

      await openBitbucketPR('Test Title', 'Test Description')

      expect(mockGetGitRepository).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
      expect(mockOpen).toHaveBeenCalled()

      process.env = originalEnv
    })

    it('should fallback to browser when no credentials', async () => {
      // Mock checkBitbucketCredentials to return null by clearing env vars
      const originalEnv = process.env
      delete process.env.BITBUCKET_EMAIL
      delete process.env.BITBUCKET_TOKEN

      await openBitbucketPR('Test Title', 'Test Description')

      expect(mockGetGitRepository).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.INFO.NO_BITBUCKET_CREDENTIALS)
      )
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(UI_CONSTANTS.INFO.SET_BITBUCKET_CREDENTIALS)
      )
      // Should open browser instead of creating PR via API
      expect(mockOpen).toHaveBeenCalledWith(
        `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${mockBitbucketInfo.workspace}/${mockBitbucketInfo.repository}/pull-requests/new?source=${mockRepoInfo.currentBranch}`
      )

      process.env = originalEnv
    })

    it('should use default title and description when not provided', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123 }),
        text: jest.fn().mockResolvedValue(''),
      })

      const originalEnv = process.env
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = 'test-token'

      await openBitbucketPR()

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.title).toBe(`PR from ${mockRepoInfo.currentBranch}`)
      expect(callBody.description).toBe(
        `Pull request from branch: ${mockRepoInfo.currentBranch}`
      )

      process.env = originalEnv
    })

    it('should handle errors and rethrow them', async () => {
      const testError = new Error('Test error')
      mockGetGitRepository.mockImplementation(() => {
        throw testError
      })

      await expect(openBitbucketPR()).rejects.toThrow('Test error')
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create Bitbucket PR:'),
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
      process.env.BITBUCKET_EMAIL = 'test@example.com'
      process.env.BITBUCKET_TOKEN = 'test-token'

      await expect(
        openBitbucketPR('Test Title', 'Test Description')
      ).rejects.toThrow('Bitbucket API error: 401 - Unauthorized')

      process.env = originalEnv
    })
  })
})
