/**
 * Git module constants
 */
export const GIT_CONSTANTS = {
  // Error messages
  ERRORS: {
    NOT_GIT_REPO:
      'Not in a git repository. Please run this command from a git repository.',
    NO_CHANGES: 'No changes found in the repository.',
    INVALID_URL_FORMAT: 'Invalid remote URL format.',
    REMOTE_ORIGIN_MISSING: 'Make sure you have a remote origin configured.',
  },

  // Git commands
  COMMANDS: {
    GET_BRANCH: 'git rev-parse --abbrev-ref HEAD',
    GET_REMOTE_URL: 'git remote get-url origin',
    GET_DEFAULT_BRANCH:
      'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
    GET_STATUS: 'git status --porcelain',
    GET_DIFF: 'git diff origin/main...HEAD',
    GET_GIT_ROOT: 'git rev-parse --show-toplevel',
    GET_STAGED_DIFF: 'git diff --staged',
    GET_UNSTAGED_DIFF: 'git diff',
  },

  // Default values
  DEFAULTS: {
    DEFAULT_BRANCH: 'main',
  },

  // Git hosting platform patterns
  PLATFORMS: {
    BITBUCKET: {
      SSH_PATTERN: /git@bitbucket\.org:([^/]+)\/([^/]+)\.git/,
      HTTPS_PATTERN: /https:\/\/bitbucket\.org\/([^/]+)\/([^/]+)\.git/,
      DOMAIN: 'bitbucket.org',
    },
    GITHUB: {
      SSH_PATTERN: /git@github\.com:([^/]+)\/([^/]+)\.git/,
      HTTPS_PATTERN: /https:\/\/github\.com\/([^/]+)\/([^/]+)\.git/,
      DOMAIN: 'github.com',
    },
    GITLAB: {
      SSH_PATTERN: /git@gitlab\.com:([^/]+)\/([^/]+)\.git/,
      HTTPS_PATTERN: /https:\/\/gitlab\.com\/([^/]+)\/([^/]+)\.git/,
      DOMAIN: 'gitlab.com',
    },
  },
} as const
