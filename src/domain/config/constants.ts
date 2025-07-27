/**
 * Configuration module constants
 */
export const CONFIG_CONSTANTS = {
  // Application info
  APP: {
    NAME: 'AI Pull Request Generator',
    VERSION: '1.0.0',
    DESCRIPTION: 'Generate PR descriptions using AI',
  },

  // File paths
  PATHS: {
    PROJECT_ROOT: process.cwd(),
    OUTPUT_FILE: 'pr-description.md',
    DIFF_FILE: 'diff.txt',
    REVIEWERS_FILE: 'reviewers.json',
  },

  // API endpoints
  API: {
    BITBUCKET_PR: 'https://api.bitbucket.org/2.0/repositories',
    GITHUB_PR: 'https://api.github.com/repos',
    OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
    GEMINI_GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models',
  },

  // Base URLs
  URLS: {
    BITBUCKET: 'https://bitbucket.org',
    GITHUB: 'https://github.com',
    GITLAB: 'https://gitlab.com',
    OPENAI: 'https://api.openai.com',
    GEMINI: 'https://generativelanguage.googleapis.com',
  },

  // Environment variable names
  ENV_VARS: {
    OPENAI_API_KEY: 'OPENAI_API_KEY',
    GEMINI_API_KEY: 'GEMINI_API_KEY',
    BITBUCKET_EMAIL: 'BITBUCKET_EMAIL',
    BITBUCKET_TOKEN: 'BITBUCKET_TOKEN',
    GITHUB_TOKEN: 'GITHUB_TOKEN',
  },
} as const

/**
 * PR Types configuration
 */
export const PR_TYPES = [
  { name: '✨ Feature', value: 'feat' },
  { name: '🐛 Bugfix', value: 'fix' },
  { name: '♻️  Refactor', value: 'refactor' },
  { name: '📚 Docs', value: 'docs' },
  { name: '🧹 Chore', value: 'chore' },
  { name: '🔧 Other', value: 'other' },
] as const

/**
 * Output choices configuration
 */
export const OUTPUT_CHOICES = [
  { name: '📋 Copy to clipboard', value: 'clipboard' },
  { name: '📝 Open in editor', value: 'editor' },
  { name: '🔗 Open PR in Bitbucket', value: 'bitbucket' },
  { name: '🐙 Open PR in GitHub', value: 'github' },
  { name: '📋 + 📝 Both', value: 'both' },
  { name: '🚫 Do nothing', value: 'nothing' },
] as const

/**
 * Git hosting platform patterns
 */
export const GIT_PLATFORMS = {
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
} as const
