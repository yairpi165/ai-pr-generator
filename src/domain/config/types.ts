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
