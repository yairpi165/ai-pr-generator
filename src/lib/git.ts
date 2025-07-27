import { execSync } from 'child_process'
import fs from 'fs'
import { diffPath } from './config.js'
import { APP_CONSTANTS } from './constants.js'

/**
 * Git utilities for PR generation
 */
export class GitUtils {
  private static gitRoot: string | null = null

  /**
   * Gets and caches the git repository root directory
   * @throws {Error} If not in a git repository
   */
  private static getGitRoot(): string {
    if (!this.gitRoot) {
      try {
        this.gitRoot = execSync('git rev-parse --show-toplevel', {
          encoding: 'utf8',
        }).trim()
      } catch {
        throw new Error(
          'Not in a git repository. Please run this command from a git repository.'
        )
      }
    }
    return this.gitRoot
  }

  /**
   * Checks if the current directory is a git repository
   * @throws {Error} If not in a git repository
   */
  static checkGitRepository(): void {
    try {
      // Get and change to repository root
      const root = this.getGitRoot()
      process.chdir(root)
    } catch {
      throw new Error(APP_CONSTANTS.ERRORS.NOT_GIT_REPO)
    }
  }

  /**
   * Checks if there are any changes in the repository
   * @throws {Error} If no changes found
   */
  static checkGitChanges(): void {
    try {
      // Make sure we're in the repository root
      this.checkGitRepository()

      // Check for local changes (staged or unstaged)
      const status = execSync('git status --porcelain', { encoding: 'utf8' })
      if (status.trim()) {
        return // We have local changes
      }

      // If no local changes, check if we're on a feature branch
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim()
      const defaultBranch =
        execSync(
          'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
          { encoding: 'utf8' }
        ).trim() || 'main'

      if (currentBranch !== defaultBranch) {
        // Check if we have unpushed commits or if branch exists on remote
        try {
          const unpushedCommits = execSync(
            `git log origin/${defaultBranch}..${currentBranch}`,
            { encoding: 'utf8' }
          )
          if (unpushedCommits.trim()) {
            return // We have unpushed commits
          }

          // Check if branch exists on remote and has commits
          const remoteDiff = execSync(
            `git diff origin/${defaultBranch}...origin/${currentBranch}`,
            { encoding: 'utf8' }
          )
          if (remoteDiff.trim()) {
            return // We have changes on remote
          }
        } catch {
          // Ignore errors here as they might be due to remote branch not existing
        }
      }

      throw new Error('No changes found in the repository.')
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
   * Generates a git diff and saves it to a file
   * @returns {string} The generated diff
   */
  static generateDiff(): string {
    try {
      // Check repository and changes
      this.checkGitRepository()
      this.checkGitChanges()

      // Try to get changes from the current branch
      let diff
      try {
        // First try to get staged changes
        diff = execSync('git diff --staged', { encoding: 'utf8' })
        if (!diff.trim()) {
          // If no staged changes, get unstaged changes
          diff = execSync('git diff', { encoding: 'utf8' })
        }
      } catch {
        throw new Error('Failed to get git diff')
      }

      // If no local changes, try to get changes from remote
      if (!diff.trim()) {
        try {
          // Get the default branch name
          const defaultBranch =
            execSync(
              'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
              { encoding: 'utf8' }
            ).trim() || 'main'

          // Get current branch name
          const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf8',
          }).trim()

          // Generate diff against default branch
          diff = execSync(
            `git diff origin/${defaultBranch}...${currentBranch}`,
            {
              encoding: 'utf8',
            }
          )
        } catch {
          // If all attempts fail, throw error
          throw new Error(APP_CONSTANTS.ERRORS.NO_CHANGES)
        }
      }

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
}
