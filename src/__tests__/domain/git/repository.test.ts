import {
  getGitRoot,
  getCurrentBranch,
  getDefaultBranch,
  getGitRepository,
  hasLocalChanges,
  hasUnpushedCommits,
  hasRemoteChanges,
  getGitStatus,
} from '../../../domain/git/repository.js'
import { GIT_CONSTANTS } from '../../../domain/git/constants.js'
import type { GitRepository } from '../../../domain/git/types.js'

// child_process is already mocked in setup.ts
import { execSync } from 'child_process'

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>

describe('Git Repository Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getGitRoot', () => {
    it('should return git root directory', () => {
      const mockRoot = '/path/to/repo'
      mockExecSync.mockReturnValue(`${mockRoot}\n`)

      const result = getGitRoot()

      expect(result).toBe(mockRoot)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git rev-parse --show-toplevel',
        {
          encoding: 'utf8',
        }
      )
    })

    it('should throw error when not in git repository', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository')
      })

      expect(() => getGitRoot()).toThrow(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
    })

    it('should trim whitespace from git output', () => {
      const mockRoot = '/path/to/repo'
      mockExecSync.mockReturnValue(`  ${mockRoot}  \n  `)

      const result = getGitRoot()

      expect(result).toBe(mockRoot)
    })
  })

  describe('getCurrentBranch', () => {
    it('should return current branch name', () => {
      const mockBranch = 'feature/new-feature'
      mockExecSync.mockReturnValue(`${mockBranch}\n`)

      const result = getCurrentBranch()

      expect(result).toBe(mockBranch)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git rev-parse --abbrev-ref HEAD',
        {
          encoding: 'utf8',
        }
      )
    })

    it('should handle main branch', () => {
      mockExecSync.mockReturnValue('main\n')

      const result = getCurrentBranch()

      expect(result).toBe('main')
    })

    it('should handle master branch', () => {
      mockExecSync.mockReturnValue('master\n')

      const result = getCurrentBranch()

      expect(result).toBe('master')
    })

    it('should trim whitespace from branch name', () => {
      mockExecSync.mockReturnValue('  feature/test  \n')

      const result = getCurrentBranch()

      expect(result).toBe('feature/test')
    })
  })

  describe('getDefaultBranch', () => {
    it('should return default branch from remote', () => {
      const mockBranch = 'main'
      mockExecSync.mockReturnValue(`${mockBranch}\n`)

      const result = getDefaultBranch()

      expect(result).toBe(mockBranch)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
        { encoding: 'utf8' }
      )
    })

    it('should return default branch when command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No remote origin')
      })

      const result = getDefaultBranch()

      expect(result).toBe(GIT_CONSTANTS.DEFAULTS.DEFAULT_BRANCH)
    })

    it('should handle master as default branch', () => {
      mockExecSync.mockReturnValue('master\n')

      const result = getDefaultBranch()

      expect(result).toBe('master')
    })

    it('should trim whitespace from default branch', () => {
      mockExecSync.mockReturnValue('  main  \n')

      const result = getDefaultBranch()

      expect(result).toBe('main')
    })
  })

  describe('getGitRepository', () => {
    it('should return complete repository information', () => {
      // Mock all the individual functions
      mockExecSync
        .mockReturnValueOnce('/path/to/repo\n') // getGitRoot
        .mockReturnValueOnce('feature/branch\n') // getCurrentBranch
        .mockReturnValueOnce('main\n') // getDefaultBranch
        .mockReturnValueOnce('git@github.com:user/repo.git\n') // getRemoteUrl

      const result = getGitRepository()

      expect(result).toEqual({
        root: '/path/to/repo',
        currentBranch: 'feature/branch',
        defaultBranch: 'main',
        remoteUrl: 'git@github.com:user/repo.git',
      })
    })

    it('should handle HTTPS remote URL', () => {
      mockExecSync
        .mockReturnValueOnce('/path/to/repo\n')
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('https://github.com/user/repo.git\n')

      const result = getGitRepository()

      expect(result.remoteUrl).toBe('https://github.com/user/repo.git')
    })

    it('should handle Bitbucket remote URL', () => {
      mockExecSync
        .mockReturnValueOnce('/path/to/repo\n')
        .mockReturnValueOnce('develop\n')
        .mockReturnValueOnce('master\n')
        .mockReturnValueOnce('git@bitbucket.org:workspace/repo.git\n')

      const result = getGitRepository()

      expect(result).toEqual({
        root: '/path/to/repo',
        currentBranch: 'develop',
        defaultBranch: 'master',
        remoteUrl: 'git@bitbucket.org:workspace/repo.git',
      })
    })
  })

  describe('hasLocalChanges', () => {
    it('should return true when there are local changes', () => {
      mockExecSync.mockReturnValue('M  file.txt\nA  newfile.txt\n')

      const result = hasLocalChanges()

      expect(result).toBe(true)
      expect(mockExecSync).toHaveBeenCalledWith(
        GIT_CONSTANTS.COMMANDS.GET_STATUS,
        {
          encoding: 'utf8',
        }
      )
    })

    it('should return false when there are no local changes', () => {
      mockExecSync.mockReturnValue('')

      const result = hasLocalChanges()

      expect(result).toBe(false)
    })

    it('should return false when git command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed')
      })

      const result = hasLocalChanges()

      expect(result).toBe(false)
    })

    it('should handle whitespace-only status output', () => {
      mockExecSync.mockReturnValue('   \n   \n')

      const result = hasLocalChanges()

      expect(result).toBe(false)
    })
  })

  describe('hasUnpushedCommits', () => {
    const mockRepo: GitRepository = {
      root: '/path/to/repo',
      currentBranch: 'feature/branch',
      defaultBranch: 'main',
      remoteUrl: 'git@github.com:user/repo.git',
    }

    it('should return true when there are unpushed commits', () => {
      mockExecSync.mockReturnValue('commit abc123\ncommit def456\n')

      const result = hasUnpushedCommits(mockRepo)

      expect(result).toBe(true)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git log origin/main..feature/branch',
        { encoding: 'utf8' }
      )
    })

    it('should return false when there are no unpushed commits', () => {
      mockExecSync.mockReturnValue('')

      const result = hasUnpushedCommits(mockRepo)

      expect(result).toBe(false)
    })

    it('should return false when git command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed')
      })

      const result = hasUnpushedCommits(mockRepo)

      expect(result).toBe(false)
    })

    it('should handle different branch names', () => {
      const repo = {
        ...mockRepo,
        currentBranch: 'develop',
        defaultBranch: 'master',
      }
      mockExecSync.mockReturnValue('')

      hasUnpushedCommits(repo)

      expect(mockExecSync).toHaveBeenCalledWith(
        'git log origin/master..develop',
        { encoding: 'utf8' }
      )
    })
  })

  describe('hasRemoteChanges', () => {
    const mockRepo: GitRepository = {
      root: '/path/to/repo',
      currentBranch: 'feature/branch',
      defaultBranch: 'main',
      remoteUrl: 'git@github.com:user/repo.git',
    }

    it('should return true when there are remote changes', () => {
      mockExecSync.mockReturnValue('diff --git a/file.txt b/file.txt\n')

      const result = hasRemoteChanges(mockRepo)

      expect(result).toBe(true)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff origin/main...origin/feature/branch',
        { encoding: 'utf8' }
      )
    })

    it('should return false when there are no remote changes', () => {
      mockExecSync.mockReturnValue('')

      const result = hasRemoteChanges(mockRepo)

      expect(result).toBe(false)
    })

    it('should return false when git command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed')
      })

      const result = hasRemoteChanges(mockRepo)

      expect(result).toBe(false)
    })

    it('should handle different branch configurations', () => {
      const repo = {
        ...mockRepo,
        currentBranch: 'hotfix',
        defaultBranch: 'master',
      }
      mockExecSync.mockReturnValue('')

      hasRemoteChanges(repo)

      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff origin/master...origin/hotfix',
        { encoding: 'utf8' }
      )
    })
  })

  describe('getGitStatus', () => {
    const mockRepo: GitRepository = {
      root: '/path/to/repo',
      currentBranch: 'feature/branch',
      defaultBranch: 'main',
      remoteUrl: 'git@github.com:user/repo.git',
    }

    it('should return complete git status', () => {
      // Mock hasLocalChanges
      mockExecSync
        .mockReturnValueOnce('M  file.txt\n') // hasLocalChanges
        .mockReturnValueOnce('commit abc123\n') // hasUnpushedCommits
        .mockReturnValueOnce('diff content\n') // hasRemoteChanges

      const result = getGitStatus(mockRepo)

      expect(result).toEqual({
        hasLocalChanges: true,
        hasUnpushedCommits: true,
        hasRemoteChanges: true,
      })
    })

    it('should return all false when no changes', () => {
      mockExecSync
        .mockReturnValueOnce('') // hasLocalChanges
        .mockReturnValueOnce('') // hasUnpushedCommits
        .mockReturnValueOnce('') // hasRemoteChanges

      const result = getGitStatus(mockRepo)

      expect(result).toEqual({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })
    })

    it('should handle mixed status scenarios', () => {
      mockExecSync
        .mockReturnValueOnce('M  file.txt\n') // hasLocalChanges: true
        .mockReturnValueOnce('') // hasUnpushedCommits: false
        .mockReturnValueOnce('diff content\n') // hasRemoteChanges: true

      const result = getGitStatus(mockRepo)

      expect(result).toEqual({
        hasLocalChanges: true,
        hasUnpushedCommits: false,
        hasRemoteChanges: true,
      })
    })

    it('should handle git command failures gracefully', () => {
      // First call succeeds, others fail
      mockExecSync
        .mockReturnValueOnce('M  file.txt\n') // hasLocalChanges: true
        .mockImplementationOnce(() => {
          throw new Error('Failed')
        }) // hasUnpushedCommits: false
        .mockImplementationOnce(() => {
          throw new Error('Failed')
        }) // hasRemoteChanges: false

      const result = getGitStatus(mockRepo)

      expect(result).toEqual({
        hasLocalChanges: true,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })
    })
  })
})
