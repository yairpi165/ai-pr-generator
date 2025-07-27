/**
 * Environment variables interface
 */
export type EnvironmentConfig = {
  OPENAI_API_KEY?: string
  GEMINI_API_KEY?: string
  BITBUCKET_EMAIL?: string
  BITBUCKET_TOKEN?: string
  GITHUB_TOKEN?: string
}

/**
 * Bitbucket PR data interface
 */
export type BitbucketPRData = {
  title: string
  description: string
  source: {
    branch: {
      name: string
    }
  }
  destination: {
    branch: {
      name: string
    }
  }
  reviewers?: Array<{
    display_name: string
  }>
}

/**
 * GitHub PR data interface
 */
export type GitHubPRData = {
  title: string
  body: string
  head: string
  base: string
  assignees?: string[]
  reviewers?: string[]
  labels?: string[]
}
