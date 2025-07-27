import path from 'path'
import fs from 'fs'
import { APP_CONSTANTS } from './constants.js'

/**
 * Reviewer information
 */
export interface Reviewer {
  readonly name: string
  readonly email?: string
  readonly username?: string
}

/**
 * Reviewers configuration for Git hosting platforms
 */
export interface ReviewersConfig {
  readonly bitbucket?: readonly Reviewer[]
  readonly github?: readonly Reviewer[]
  readonly gitlab?: readonly Reviewer[]
  readonly default?: readonly Reviewer[] // Used when platform-specific reviewers are not defined
}

import type { GitPlatform } from './types.js'

/**
 * Reviewers state
 */
interface ReviewersState {
  config: ReviewersConfig
  isLoaded: boolean
}

// Module state
const state: ReviewersState = {
  config: {},
  isLoaded: false,
}

/**
 * Load reviewers configuration from file
 */
export const loadReviewersConfig = (configPath?: string): void => {
  try {
    const defaultPath =
      configPath || path.join(process.cwd(), APP_CONSTANTS.REVIEWERS_FILE)

    if (fs.existsSync(defaultPath)) {
      const configData = fs.readFileSync(defaultPath, 'utf8')
      state.config = JSON.parse(configData)
      state.isLoaded = true

      console.log(
        `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.LOADED_REVIEWERS}`
      )
    }
  } catch {
    console.log(
      `${APP_CONSTANTS.EMOJIS.WARNING} No reviewers configuration found, using defaults`
    )
  }
}

/**
 * Get reviewers for a specific platform
 */
export const getReviewers = (platform: GitPlatform): readonly Reviewer[] => {
  if (!state.isLoaded) {
    loadReviewersConfig()
  }

  return state.config[platform] || state.config.default || []
}

/**
 * Get reviewers for Bitbucket
 */
export const getBitbucketReviewers = (): readonly Reviewer[] => {
  return getReviewers('bitbucket')
}

/**
 * Get reviewers for GitHub
 */
export const getGitHubReviewers = (): readonly Reviewer[] => {
  return getReviewers('github')
}

/**
 * Get reviewers for GitLab
 */
export const getGitLabReviewers = (): readonly Reviewer[] => {
  return getReviewers('gitlab')
}

/**
 * Set reviewers configuration
 */
export const setReviewersConfig = (config: ReviewersConfig): void => {
  state.config = config
  state.isLoaded = true
}

/**
 * Get current configuration
 */
export const getReviewersConfig = (): ReviewersConfig => {
  if (!state.isLoaded) {
    loadReviewersConfig()
  }

  return { ...state.config }
}

/**
 * Check if reviewers are loaded
 */
export const isReviewersLoaded = (): boolean => {
  return state.isLoaded
}
