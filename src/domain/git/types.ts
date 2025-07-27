/**
 * Git Repository Information
 */
export type GitRepository = {
  readonly root: string
  readonly currentBranch: string
  readonly defaultBranch: string
  readonly remoteUrl: string
}

/**
 * Git Status Information
 */
export type GitStatus = {
  readonly hasLocalChanges: boolean
  readonly hasUnpushedCommits: boolean
  readonly hasRemoteChanges: boolean
}

/**
 * Git hosting platform types
 */
export type GitPlatform = 'bitbucket' | 'github' | 'gitlab'

/**
 * Bitbucket Repository Information
 */
export type BitbucketRepoInfo = {
  readonly workspace: string
  readonly repository: string
}

/**
 * GitHub Repository Information
 */
export type GitHubRepoInfo = {
  readonly owner: string
  readonly repository: string
}
