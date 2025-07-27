// Types
export type {
  GitRepository,
  GitStatus,
  GitPlatform,
  BitbucketRepoInfo,
  GitHubRepoInfo,
} from './types.js'

// Constants
export { GIT_CONSTANTS } from './constants.js'

// Repository functions
export {
  getGitRepository,
  getGitRoot,
  getCurrentBranch,
  getDefaultBranch,
  getGitStatus,
  hasLocalChanges,
  hasUnpushedCommits,
  hasRemoteChanges,
} from './repository.js'

// Diff functions
export {
  generateDiff,
  generateDiffContent,
  checkGitRepository,
  checkGitChanges,
  getStagedChanges,
  getUnstagedChanges,
  getRemoteChanges,
} from './diff.js'

// Hosting functions
export { openPR, openBitbucketPR, openGitHubPR } from './hosting/index.js'
