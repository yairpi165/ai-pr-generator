import {
  getStagedChanges,
  getUnstagedChanges,
  getRemoteChanges,
  generateDiffContent,
  checkGitRepository,
  checkGitChanges,
  generateDiff,
} from '../../../domain/git/diff.js'
import { GIT_CONSTANTS } from '../../../domain/git/constants.js'
import type { GitRepository } from '../../../domain/git/types.js'

// Mock child_process and fs
jest.mock('child_process')
jest.mock('fs')
jest.mock('../../../domain/git/repository.js')

import { execSync } from 'child_process'
import fs from 'fs'
import {
  getGitRepository,
  getGitStatus,
} from '../../../domain/git/repository.js'

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>
const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<
  typeof fs.writeFileSync
>
const mockGetGitRepository = getGitRepository as jest.MockedFunction<
  typeof getGitRepository
>
const mockGetGitStatus = getGitStatus as jest.MockedFunction<
  typeof getGitStatus
>

// Mock process.chdir
const originalChdir = process.chdir
const mockChdir = jest.fn()

describe('Git Diff Generation', () => {
  const mockRepo: GitRepository = {
    root: '/path/to/repo',
    currentBranch: 'feature/branch',
    defaultBranch: 'main',
    remoteUrl: 'git@github.com:user/repo.git',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.chdir = mockChdir
    mockGetGitRepository.mockReturnValue(mockRepo)
    // Reset execSync mock to avoid interference between tests
    mockExecSync.mockReset()
  })

  afterEach(() => {
    process.chdir = originalChdir
  })

  describe('getStagedChanges', () => {
    it('should return staged changes', () => {
      const mockDiff = 'diff --git a/file.txt b/file.txt\n+new line'
      mockExecSync.mockReturnValue(mockDiff)

      const result = getStagedChanges()

      expect(result).toBe(mockDiff)
      expect(mockExecSync).toHaveBeenCalledWith(
        GIT_CONSTANTS.COMMANDS.GET_STAGED_DIFF,
        { encoding: 'utf8' }
      )
    })

    it('should return empty string when no staged changes', () => {
      mockExecSync.mockReturnValue('')

      const result = getStagedChanges()

      expect(result).toBe('')
    })

    it('should handle git command with complex diff output', () => {
      const complexDiff = `diff --git a/src/file1.ts b/src/file1.ts
index abc123..def456 100644
--- a/src/file1.ts
+++ b/src/file1.ts
@@ -1,3 +1,4 @@
 export const test = () => {
+  // New comment
   return 'hello'
 }`
      mockExecSync.mockReturnValue(complexDiff)

      const result = getStagedChanges()

      expect(result).toBe(complexDiff)
    })
  })

  describe('getUnstagedChanges', () => {
    it('should return unstaged changes', () => {
      const mockDiff = 'diff --git a/file.txt b/file.txt\n-old line\n+new line'
      mockExecSync.mockReturnValue(mockDiff)

      const result = getUnstagedChanges()

      expect(result).toBe(mockDiff)
      expect(mockExecSync).toHaveBeenCalledWith(
        GIT_CONSTANTS.COMMANDS.GET_UNSTAGED_DIFF,
        { encoding: 'utf8' }
      )
    })

    it('should return empty string when no unstaged changes', () => {
      mockExecSync.mockReturnValue('')

      const result = getUnstagedChanges()

      expect(result).toBe('')
    })

    it('should handle binary file changes', () => {
      const binaryDiff = `diff --git a/image.png b/image.png
index abc123..def456 100644
Binary files a/image.png and b/image.png differ`
      mockExecSync.mockReturnValue(binaryDiff)

      const result = getUnstagedChanges()

      expect(result).toBe(binaryDiff)
    })
  })

  describe('getRemoteChanges', () => {
    it('should return remote changes', () => {
      const mockDiff = 'diff --git a/remote.txt b/remote.txt\n+remote change'
      mockExecSync.mockReturnValue(mockDiff)

      const result = getRemoteChanges(mockRepo)

      expect(result).toBe(mockDiff)
      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff origin/main...feature/branch',
        { encoding: 'utf8' }
      )
    })

    it('should handle different branch configurations', () => {
      const repo = {
        ...mockRepo,
        currentBranch: 'develop',
        defaultBranch: 'master',
      }
      mockExecSync.mockReturnValue('diff content')

      getRemoteChanges(repo)

      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff origin/master...develop',
        { encoding: 'utf8' }
      )
    })

    it('should return empty string when no remote changes', () => {
      mockExecSync.mockReturnValue('')

      const result = getRemoteChanges(mockRepo)

      expect(result).toBe('')
    })
  })

  describe('generateDiffContent', () => {
    it('should return staged changes when available', () => {
      const stagedDiff = 'staged changes'
      mockExecSync
        .mockReturnValueOnce(stagedDiff) // getStagedChanges
        .mockReturnValueOnce('unstaged changes') // getUnstagedChanges (not called)
        .mockReturnValueOnce('remote changes') // getRemoteChanges (not called)

      const result = generateDiffContent()

      expect(result).toBe(stagedDiff)
      expect(mockExecSync).toHaveBeenCalledTimes(1) // Only getStagedChanges called
    })

    it('should return unstaged changes when no staged changes', () => {
      const unstagedDiff = 'unstaged changes'
      mockExecSync
        .mockReturnValueOnce('') // getStagedChanges (empty)
        .mockReturnValueOnce(unstagedDiff) // getUnstagedChanges
        .mockReturnValueOnce('remote changes') // getRemoteChanges (not called)

      const result = generateDiffContent()

      expect(result).toBe(unstagedDiff)
      expect(mockExecSync).toHaveBeenCalledTimes(2)
      expect(mockExecSync).toHaveBeenNthCalledWith(
        1,
        GIT_CONSTANTS.COMMANDS.GET_STAGED_DIFF,
        { encoding: 'utf8' }
      )
      expect(mockExecSync).toHaveBeenNthCalledWith(
        2,
        GIT_CONSTANTS.COMMANDS.GET_UNSTAGED_DIFF,
        { encoding: 'utf8' }
      )
    })

    it('should return remote changes when no local changes', () => {
      const remoteDiff = 'remote changes'
      mockExecSync
        .mockReturnValueOnce('') // getStagedChanges (empty)
        .mockReturnValueOnce('') // getUnstagedChanges (empty)
        .mockReturnValueOnce(remoteDiff) // getRemoteChanges

      const result = generateDiffContent()

      expect(result).toBe(remoteDiff)
      expect(mockExecSync).toHaveBeenCalledTimes(3)
      expect(mockExecSync).toHaveBeenNthCalledWith(
        1,
        GIT_CONSTANTS.COMMANDS.GET_STAGED_DIFF,
        { encoding: 'utf8' }
      )
      expect(mockExecSync).toHaveBeenNthCalledWith(
        2,
        GIT_CONSTANTS.COMMANDS.GET_UNSTAGED_DIFF,
        { encoding: 'utf8' }
      )
      expect(mockExecSync).toHaveBeenNthCalledWith(
        3,
        'git diff origin/main...feature/branch',
        { encoding: 'utf8' }
      )
    })

    it('should throw error when no changes found', () => {
      mockExecSync
        .mockReturnValueOnce('') // getStagedChanges
        .mockReturnValueOnce('') // getUnstagedChanges
        .mockReturnValueOnce('') // getRemoteChanges

      expect(() => generateDiffContent()).toThrow(
        GIT_CONSTANTS.ERRORS.NO_CHANGES
      )
    })

    it('should handle whitespace-only changes', () => {
      mockExecSync
        .mockReturnValueOnce('   \n   ') // getStagedChanges (whitespace only)
        .mockReturnValueOnce('   ') // getUnstagedChanges (whitespace only)
        .mockReturnValueOnce('actual changes') // getRemoteChanges

      const result = generateDiffContent()

      expect(result).toBe('actual changes')
      expect(mockExecSync).toHaveBeenCalledTimes(3)
    })
  })

  describe('checkGitRepository', () => {
    it('should change directory to git root when in git repo', () => {
      mockGetGitRepository.mockReturnValue(mockRepo)

      expect(() => checkGitRepository()).not.toThrow()
      expect(mockChdir).toHaveBeenCalledWith(mockRepo.root)
    })

    it('should throw error when not in git repository', () => {
      mockGetGitRepository.mockImplementation(() => {
        throw new Error('Not a git repository')
      })

      expect(() => checkGitRepository()).toThrow(
        GIT_CONSTANTS.ERRORS.NOT_GIT_REPO
      )
      expect(mockChdir).not.toHaveBeenCalled()
    })

    it('should propagate git repository errors', () => {
      mockGetGitRepository.mockImplementation(() => {
        throw new Error('Not a git repository')
      })

      expect(() => checkGitRepository()).toThrow(
        GIT_CONSTANTS.ERRORS.NOT_GIT_REPO
      )
    })
  })

  describe('checkGitChanges', () => {
    beforeEach(() => {
      // Default setup: valid git repo
      mockGetGitRepository.mockReturnValue(mockRepo)
    })

    it('should pass when there are local changes', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: true,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })

      expect(() => checkGitChanges()).not.toThrow()
    })

    it('should pass when on feature branch with unpushed commits', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: true,
        hasRemoteChanges: false,
      })

      expect(() => checkGitChanges()).not.toThrow()
    })

    it('should pass when on feature branch with remote changes', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: true,
      })

      expect(() => checkGitChanges()).not.toThrow()
    })

    it('should throw error when on default branch with no changes', () => {
      const mainBranchRepo = { ...mockRepo, currentBranch: 'main' }
      mockGetGitRepository.mockReturnValue(mainBranchRepo)
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })

      expect(() => checkGitChanges()).toThrow(GIT_CONSTANTS.ERRORS.NO_CHANGES)
    })

    it('should throw error when on feature branch with no changes', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })

      expect(() => checkGitChanges()).toThrow(GIT_CONSTANTS.ERRORS.NO_CHANGES)
    })

    it('should handle git repository errors', () => {
      mockGetGitRepository.mockImplementation(() => {
        throw new Error('Not a git repository')
      })

      expect(() => checkGitChanges()).toThrow(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
    })

    it('should handle repository-related errors correctly', () => {
      mockGetGitRepository.mockImplementation(() => {
        const error = new Error('fatal: Not a git repository')
        throw error
      })

      expect(() => checkGitChanges()).toThrow(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
    })

    it('should propagate non-repository errors', () => {
      mockGetGitRepository.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      expect(() => checkGitChanges()).toThrow('Permission denied')
    })
  })

  describe('generateDiff', () => {
    beforeEach(() => {
      // Setup valid git repository
      mockGetGitRepository.mockReturnValue(mockRepo)
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: true,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })
    })

    it('should generate diff without saving to file', () => {
      const mockDiff = 'diff content'
      // Mock the staged changes call specifically
      mockExecSync.mockReturnValue(mockDiff)

      const result = generateDiff()

      expect(result).toBe(mockDiff)
      expect(mockWriteFileSync).not.toHaveBeenCalled()
    })

    it('should generate diff and save to file when path provided', () => {
      const mockDiff = 'diff content'
      const diffPath = '/path/to/diff.txt'
      mockExecSync.mockReturnValue(mockDiff)

      const result = generateDiff(diffPath)

      expect(result).toBe(mockDiff)
      expect(mockWriteFileSync).toHaveBeenCalledWith(diffPath, mockDiff, 'utf8')
    })

    it('should throw error when not in git repository', () => {
      mockGetGitRepository.mockImplementation(() => {
        throw new Error('Not a git repository')
      })

      expect(() => generateDiff()).toThrow(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
    })

    it('should throw error when no changes found', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })

      expect(() => generateDiff()).toThrow(GIT_CONSTANTS.ERRORS.NO_CHANGES)
    })

    it('should handle diff generation errors', () => {
      // checkGitRepository and checkGitChanges pass, but generateDiffContent fails
      // First call succeeds (getStagedChanges), second fails
      mockExecSync
        .mockReturnValueOnce('') // getStagedChanges (empty)
        .mockReturnValueOnce('') // getUnstagedChanges (empty)
        .mockReturnValueOnce('') // getRemoteChanges (empty - triggers NO_CHANGES error)

      expect(() => generateDiff()).toThrow(GIT_CONSTANTS.ERRORS.NO_CHANGES)
    })

    it('should propagate known errors without wrapping', () => {
      mockGetGitStatus.mockReturnValue({
        hasLocalChanges: false,
        hasUnpushedCommits: false,
        hasRemoteChanges: false,
      })

      expect(() => generateDiff()).toThrow(GIT_CONSTANTS.ERRORS.NO_CHANGES)
    })

    it('should handle non-Error exceptions', () => {
      mockExecSync.mockImplementation(() => {
        throw 'String error'
      })

      expect(() => generateDiff()).toThrow('String error')
    })

    it('should handle file writing with different paths', () => {
      const mockDiff = 'diff content'
      mockExecSync.mockReturnValue(mockDiff)

      generateDiff('./custom-diff.txt')

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        './custom-diff.txt',
        mockDiff,
        'utf8'
      )
    })

    it('should handle complex diff scenarios', () => {
      const complexDiff = `diff --git a/src/file1.ts b/src/file1.ts
index abc123..def456 100644
--- a/src/file1.ts
+++ b/src/file1.ts
@@ -1,10 +1,12 @@
 export class Example {
+  private newProperty: string
+
   constructor() {
-    console.log('old')
+    console.log('new')
   }
 }`
      mockExecSync.mockReturnValue(complexDiff)

      const result = generateDiff('/tmp/complex.diff')

      expect(result).toBe(complexDiff)
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '/tmp/complex.diff',
        complexDiff,
        'utf8'
      )
    })
  })
})
