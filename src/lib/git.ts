import { execSync } from 'child_process'
import fs from 'fs'
import { diffPath } from './config.js'
import { APP_CONSTANTS } from './constants.js'

/**
 * Git Repository Information
 */
export interface GitRepository {
  readonly root: string
  readonly currentBranch: string
  readonly defaultBranch: string
}

/**
 * Git Status Information
 */
export interface GitStatus {
  readonly hasLocalChanges: boolean
  readonly hasUnpushedCommits: boolean
  readonly hasRemoteChanges: boolean
}

/**
 * Get git repository root directory
 */
const getGitRoot = (): string => {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
    }).trim()
  } catch {
    throw new Error(APP_CONSTANTS.ERRORS.NOT_GIT_REPO)
  }
}

/**
 * Get current branch name
 */
const getCurrentBranch = (): string => {
  return execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim()
}

/**
 * Get default branch name
 */
const getDefaultBranch = (): string => {
  try {
    return execSync(
      'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
      { encoding: 'utf8' }
    ).trim()
  } catch {
    return 'main'
  }
}

/**
 * Get git repository information
 */
const getGitRepository = (): GitRepository => {
  const root = getGitRoot()
  const currentBranch = getCurrentBranch()
  const defaultBranch = getDefaultBranch()

  return {
    root,
    currentBranch,
    defaultBranch,
  }
}

/**
 * Check if there are local changes (staged or unstaged)
 */
const hasLocalChanges = (): boolean => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    return status.trim().length > 0
  } catch {
    return false
  }
}

/**
 * Check if there are unpushed commits
 */
const hasUnpushedCommits = (repo: GitRepository): boolean => {
  try {
    const unpushedCommits = execSync(
      `git log origin/${repo.defaultBranch}..${repo.currentBranch}`,
      { encoding: 'utf8' }
    )
    return unpushedCommits.trim().length > 0
  } catch {
    return false
  }
}

/**
 * Check if there are remote changes
 */
const hasRemoteChanges = (repo: GitRepository): boolean => {
  try {
    const remoteDiff = execSync(
      `git diff origin/${repo.defaultBranch}...origin/${repo.currentBranch}`,
      { encoding: 'utf8' }
    )
    return remoteDiff.trim().length > 0
  } catch {
    return false
  }
}

/**
 * Get git status information
 */
const getGitStatus = (repo: GitRepository): GitStatus => {
  return {
    hasLocalChanges: hasLocalChanges(),
    hasUnpushedCommits: hasUnpushedCommits(repo),
    hasRemoteChanges: hasRemoteChanges(repo),
  }
}

/**
 * Check if the current directory is a git repository
 */
export const checkGitRepository = (): void => {
  try {
    const repo = getGitRepository()
    process.chdir(repo.root)
  } catch {
    throw new Error(APP_CONSTANTS.ERRORS.NOT_GIT_REPO)
  }
}

/**
 * Check if there are any changes in the repository
 */
export const checkGitChanges = (): void => {
  try {
    checkGitRepository()
    const repo = getGitRepository()
    const status = getGitStatus(repo)

    if (status.hasLocalChanges) {
      return // We have local changes
    }

    if (repo.currentBranch !== repo.defaultBranch) {
      if (status.hasUnpushedCommits || status.hasRemoteChanges) {
        return // We have changes on this branch
      }
    }

    throw new Error(APP_CONSTANTS.ERRORS.NO_CHANGES)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Not a git repository')
    ) {
      throw new Error(APP_CONSTANTS.ERRORS.NOT_GIT_REPO)
    }
    throw error
  }
}

/**
 * Get staged changes
 */
const getStagedChanges = (): string => {
  return execSync('git diff --staged', { encoding: 'utf8' })
}

/**
 * Get unstaged changes
 */
const getUnstagedChanges = (): string => {
  return execSync('git diff', { encoding: 'utf8' })
}

/**
 * Get changes from remote branch
 */
const getRemoteChanges = (repo: GitRepository): string => {
  return execSync(
    `git diff origin/${repo.defaultBranch}...${repo.currentBranch}`,
    { encoding: 'utf8' }
  )
}

/**
 * Generate git diff content
 */
const generateDiffContent = (): string => {
  const repo = getGitRepository()

  // Try to get local changes first
  let diff = getStagedChanges()
  if (!diff.trim()) {
    diff = getUnstagedChanges()
  }

  // If no local changes, try remote changes
  if (!diff.trim()) {
    diff = getRemoteChanges(repo)
  }

  if (!diff.trim()) {
    throw new Error(APP_CONSTANTS.ERRORS.NO_CHANGES)
  }

  return diff
}

/**
 * Generate a git diff and save it to a file
 */
export const generateDiff = (): string => {
  try {
    checkGitRepository()
    checkGitChanges()

    const diff = generateDiffContent()

    // Save diff to file
    fs.writeFileSync(diffPath, diff, 'utf8')
    return diff
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Not a git repository') ||
        error.message.includes('No changes found')
      ) {
        throw error
      }
      throw new Error(`Failed to generate git diff: ${error.message}`)
    }
    throw error
  }
}
