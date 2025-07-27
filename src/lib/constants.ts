import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Global application constants
 */
export const APP_CONSTANTS = {
  // Application info
  NAME: 'AI Pull Request Generator',
  VERSION: '1.0.0',
  DESCRIPTION: 'Generate PR descriptions using AI',

  // File paths
  PROJECT_ROOT: path.dirname(path.dirname(__dirname)),
  OUTPUT_FILE: 'pr-description.md',
  DIFF_FILE: 'diff.txt',
  REVIEWERS_FILE: 'reviewers.json',

  // Git commands
  GIT_COMMANDS: {
    GET_BRANCH: 'git rev-parse --abbrev-ref HEAD',
    GET_REMOTE_URL: 'git remote get-url origin',
    GET_DEFAULT_BRANCH:
      'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
    GET_STATUS: 'git status --porcelain',
    GET_DIFF: 'git diff origin/main...HEAD',
    GET_GIT_ROOT: 'git rev-parse --show-toplevel',
  },

  // API endpoints
  API_ENDPOINTS: {
    BITBUCKET_PR: 'https://api.bitbucket.org/2.0/repositories',
    GITHUB_PR: 'https://api.github.com/repos',
    OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
    GEMINI_GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models',
  },

  // Base URLs
  BASE_URLS: {
    BITBUCKET: 'https://bitbucket.org',
    GITHUB: 'https://github.com',
    GITLAB: 'https://gitlab.com',
    OPENAI: 'https://api.openai.com',
    GEMINI: 'https://generativelanguage.googleapis.com',
  },

  // Default values
  DEFAULTS: {
    DEFAULT_BRANCH: 'main',
    PR_TITLE_PREFIX: 'PR from',
    PR_DESCRIPTION_PREFIX: 'Pull request from branch:',
  },

  // Error messages
  ERRORS: {
    NOT_GIT_REPO:
      'Not in a git repository. Please run this command from a git repository.',
    NO_CHANGES: 'No changes found in the repository.',
    NO_API_CREDENTIALS: 'No API credentials found.',
    INVALID_URL_FORMAT: 'Invalid remote URL format.',
    API_ERROR: 'API error occurred.',
    GEMINI_API_ERROR: 'Gemini API key not configured',
    OPENAI_API_ERROR: 'OpenAI API key not configured',
    NO_AI_PROVIDERS:
      'No AI providers available. Please configure at least one API key.',
    ALL_PROVIDERS_FAILED:
      'All available AI providers failed to generate content.',
    NO_RESPONSE_OPENAI: 'No response from OpenAI',
    NO_REVIEWERS_CONFIG: 'No reviewers configuration found, using defaults',
    REMOTE_ORIGIN_MISSING: 'Make sure you have a remote origin configured.',
    VALID_API_CREDENTIALS:
      'Make sure you have a remote origin configured and valid API credentials.',
  },

  // Success messages
  SUCCESS: {
    PR_CREATED: 'Created PR successfully!',
    COPIED_CLIPBOARD: 'Copied to clipboard.',
    OPENED_EDITOR: 'Opened in editor.',
    LOADED_REVIEWERS: 'Loaded reviewers configuration',
    OPENED_BITBUCKET: 'Opened Bitbucket PR page.',
    OPENED_GITHUB: 'Opened GitHub PR page.',
    OPENED_GITLAB: 'Opened GitLab MR page.',
    COPIED_AND_OPENED: 'Copied and opened.',
    SKIPPING: 'Skipping clipboard and editor.',
  },

  // UI messages
  UI: {
    WELCOME: '🧠 AI Pull Request Generator (TypeScript Edition)',
    GENERATING_DIFF: '🛠️  Generating git diff...',
    GENERATING_PR: '🤖 Generating PR description...',
    SEE_YOU_NEXT: '🤖 See you next time....',
    SELECT_PR_TYPE: '🔧 Select PR type:',
    ENTER_PR_TITLE: '📝 Enter PR title (optional):',
    ENTER_TICKET: '🎫 Enter ticket name (optional):',
    ENTER_EXPLANATION: '🗒️  Enter short explanation for AI (optional):',
    WHAT_TO_DO:
      '📄 What would you like to do with the generated PR description?',
  },

  // Prompt templates
  PROMPTS: {
    PR_GENERATION: `You are an expert software developer. Generate a professional pull request description based on the following information:

PR Type: {prType}
PR Title: {prTitle}
Ticket: {ticket}
Explanation: {explanation}

Git Diff:
{diff}

Please create a comprehensive PR description that includes:
1. A clear summary of the changes
2. What was changed and why
3. Any important notes or considerations
4. Use emojis and markdown formatting
5. Keep it professional but engaging

Format the response as a complete PR description ready to use.`,

    PR_TITLE_GENERATION: `Generate a concise and descriptive PR title based on the following information:

PR Type: {prType}
Ticket: {ticket}
Explanation: {explanation}

Git Diff:
{diff}

The title should be:
- Clear and descriptive
- Follow conventional commit format
- Include ticket number if provided
- Be under 72 characters

Return only the title, nothing else.`,
  },

  // Emojis
  EMOJIS: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: '💡',
    LINK: '🔗',
    COPY: '📋',
    EDIT: '📝',
    BOTH: '📋 + 📝',
    NOTHING: '🚫',
    BITBUCKET: '🔗',
    AI: '🤖',
    GIT: '🛠️',
    PR: '📄',
    REVIEWERS: '👥',
  },

  // Info messages
  INFO: {
    NO_BITBUCKET_CREDENTIALS:
      'No Bitbucket API credentials found. Opening in browser instead.',
    SET_BITBUCKET_CREDENTIALS:
      'Set BITBUCKET_EMAIL and BITBUCKET_TOKEN environment variables for automatic PR creation.',
    NO_GITHUB_CREDENTIALS:
      'No GitHub API credentials found. Opening in browser instead.',
    SET_GITHUB_CREDENTIALS:
      'Set GITHUB_TOKEN environment variable for automatic PR creation.',
    UNKNOWN_GIT_PLATFORM: 'Unknown Git hosting platform.',
    SUPPORTED_PLATFORMS: 'Supported platforms: Bitbucket, GitHub, GitLab',
    PROVIDER_FAILED: 'Provider {provider} failed:',
    TRYING_NEXT_PROVIDER: 'Trying next available provider...',
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
 * Environment variable names
 */
export const ENV_VARS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  GEMINI_API_KEY: 'GEMINI_API_KEY',
  BITBUCKET_EMAIL: 'BITBUCKET_EMAIL',
  BITBUCKET_TOKEN: 'BITBUCKET_TOKEN',
  GITHUB_TOKEN: 'GITHUB_TOKEN',
} as const

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
