import { execSync } from 'child_process'
import { GIT_CONSTANTS } from './constants.js'
import type { GitRepository, GitStatus } from './types.js'

/**
 * Get git repository root directory
 */
export const getGitRoot = (): string => {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
    }).trim()
  } catch {
    throw new Error(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
  }
}

/**
 * Get current branch name
 */
export const getCurrentBranch = (): string => {
  return execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim()
}

/**
 * Get default branch name
 */
export const getDefaultBranch = (): string => {
  try {
    return execSync(
      'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
      { encoding: 'utf8' }
    ).trim()
  } catch {
    return GIT_CONSTANTS.DEFAULTS.DEFAULT_BRANCH
  }
}

/**
 * Get git repository information
 */
export const getGitRepository = (): GitRepository => {
  const root = getGitRoot()
  const currentBranch = getCurrentBranch()
  const defaultBranch = getDefaultBranch()
  const remoteUrl = execSync(GIT_CONSTANTS.COMMANDS.GET_REMOTE_URL, {
    encoding: 'utf8',
  }).trim()

  return {
    root,
    currentBranch,
    defaultBranch,
    remoteUrl,
  }
}

/**
 * Check if there are local changes (staged or unstaged)
 */
export const hasLocalChanges = (): boolean => {
  try {
    const status = execSync(GIT_CONSTANTS.COMMANDS.GET_STATUS, {
      encoding: 'utf8',
    })
    return status.trim().length > 0
  } catch {
    return false
  }
}

/**
 * Check if there are unpushed commits
 */
export const hasUnpushedCommits = (repo: GitRepository): boolean => {
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
export const hasRemoteChanges = (repo: GitRepository): boolean => {
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
export const getGitStatus = (repo: GitRepository): GitStatus => {
  return {
    hasLocalChanges: hasLocalChanges(),
    hasUnpushedCommits: hasUnpushedCommits(repo),
    hasRemoteChanges: hasRemoteChanges(repo),
  }
}
