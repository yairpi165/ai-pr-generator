import { execSync } from 'child_process'
import fs from 'fs'
import { GIT_CONSTANTS } from './constants.js'
import { getGitRepository, getGitStatus } from './repository.js'

/**
 * Get staged changes
 */
export const getStagedChanges = (): string => {
  return execSync(GIT_CONSTANTS.COMMANDS.GET_STAGED_DIFF, { encoding: 'utf8' })
}

/**
 * Get unstaged changes
 */
export const getUnstagedChanges = (): string => {
  return execSync(GIT_CONSTANTS.COMMANDS.GET_UNSTAGED_DIFF, {
    encoding: 'utf8',
  })
}

/**
 * Get changes from remote branch
 */
export const getRemoteChanges = (
  repo: ReturnType<typeof getGitRepository>
): string => {
  return execSync(
    `git diff origin/${repo.defaultBranch}...${repo.currentBranch}`,
    { encoding: 'utf8' }
  )
}

/**
 * Generate git diff content
 */
export const generateDiffContent = (): string => {
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
    throw new Error(GIT_CONSTANTS.ERRORS.NO_CHANGES)
  }

  return diff
}

/**
 * Check if the current directory is a git repository
 */
export const checkGitRepository = (): void => {
  try {
    const repo = getGitRepository()
    process.chdir(repo.root)
  } catch {
    throw new Error(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
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

    throw new Error(GIT_CONSTANTS.ERRORS.NO_CHANGES)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Not a git repository')
    ) {
      throw new Error(GIT_CONSTANTS.ERRORS.NOT_GIT_REPO)
    }
    throw error
  }
}

/**
 * Generate a git diff and save it to a file
 */
export const generateDiff = (diffPath?: string): string => {
  try {
    checkGitRepository()
    checkGitChanges()

    const diff = generateDiffContent()

    // Save diff to file if path is provided
    if (diffPath) {
      fs.writeFileSync(diffPath, diff, 'utf8')
    }
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
