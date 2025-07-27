/**
 * PR module constants
 */
export const PR_CONSTANTS = {
  // File paths
  OUTPUT_FILE: 'pr-description.md',
  REVIEWERS_FILE: 'reviewers.json',

  // Success messages
  SUCCESS: {
    LOADED_REVIEWERS: 'Loaded reviewers configuration',
  },

  // Warning messages
  WARNING: {
    NO_REVIEWERS_CONFIG: 'No reviewers configuration found, using defaults',
  },

  // PR Types configuration
  PR_TYPES: [
    { name: '✨ Feature', value: 'feat' },
    { name: '🐛 Bugfix', value: 'fix' },
    { name: '♻️  Refactor', value: 'refactor' },
    { name: '📚 Docs', value: 'docs' },
    { name: '🧹 Chore', value: 'chore' },
    { name: '🔧 Other', value: 'other' },
  ] as const,

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
} as const
