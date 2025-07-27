/**
 * UI module constants
 */
export const UI_CONSTANTS = {
  // UI messages
  MESSAGES: {
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

  // Success messages
  SUCCESS: {
    PR_CREATED: 'Created PR successfully!',
    COPIED_CLIPBOARD: 'Copied to clipboard.',
    OPENED_EDITOR: 'Opened in editor.',
    OPENED_BITBUCKET: 'Opened Bitbucket PR page.',
    OPENED_GITHUB: 'Opened GitHub PR page.',
    OPENED_GITLAB: 'Opened GitLab MR page.',
    COPIED_AND_OPENED: 'Copied and opened.',
    SKIPPING: 'Skipping clipboard and editor.',
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

  // Output choices configuration
  OUTPUT_CHOICES: [
    { name: '📋 Copy to clipboard', value: 'clipboard' },
    { name: '📝 Open in editor', value: 'editor' },
    { name: '🔗 Open PR in Bitbucket', value: 'bitbucket' },
    { name: '🐙 Open PR in GitHub', value: 'github' },
    { name: '📋 + 📝 Both', value: 'both' },
    { name: '🚫 Do nothing', value: 'nothing' },
  ] as const,
} as const
