/**
 * PR Type choice for the CLI
 */
export type PRTypeChoice = {
  name: string
  value: string
}

/**
 * PR Generation options
 */
export type PROptions = {
  prType: string
  prTitle: string
  ticket: string
  explanation: string
}

/**
 * PR Generation result
 */
export type PRResult = {
  title: string
  body: string
  fullDescription: string
}

import type { ProviderManager } from '../ai/types.js'

/**
 * PR Generation Configuration
 */
export type PRGenerationConfig = {
  readonly aiManager: ProviderManager
  readonly outputPath: string
}

/**
 * PR Title and Ticket Information
 */
export type PRTitleInfo = {
  readonly title: string
  readonly ticket: string
}

/**
 * Reviewer information
 */
export type Reviewer = {
  readonly name: string
  readonly email?: string
  readonly username?: string
}

/**
 * Reviewers configuration for Git hosting platforms
 */
export type ReviewersConfig = {
  readonly bitbucket?: readonly Reviewer[]
  readonly github?: readonly Reviewer[]
  readonly gitlab?: readonly Reviewer[]
  readonly default?: readonly Reviewer[] // Used when platform-specific reviewers are not defined
  [key: string]: readonly Reviewer[] | undefined
}

/**
 * Reviewers state
 */
export type ReviewersState = {
  config: ReviewersConfig
  isLoaded: boolean
}
