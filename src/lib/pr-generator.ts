import fs from 'fs'
import { outputPath, aiConfig } from './config.js'
import { GitUtils } from './git.js'
import { PRResult } from './types.js'
import { AIProviderManager } from './providers/manager.js'

/**
 * Main PR description generator class
 */
export class PRGenerator {
  private aiManager: AIProviderManager

  constructor() {
    this.aiManager = new AIProviderManager(aiConfig)

    // Validate that at least one provider is available
    if (this.aiManager.getAvailableProviders().length === 0) {
      throw new Error(
        'No AI providers available. Please configure either OPENAI_API_KEY or GEMINI_API_KEY in your .env file.'
      )
    }
  }

  /**
   * Get the current AI provider name
   */
  getCurrentProvider(): string {
    return this.aiManager.getCurrentProvider()?.name || 'None'
  }

  /**
   * Set a specific AI provider
   */
  setProvider(name: string): boolean {
    return this.aiManager.setProvider(name)
  }

  /**
   * Generates a PR description using available AI providers
   */
  async generatePRDescription(
    prType: string,
    prTitle: string,
    ticket: string,
    explanation: string
  ): Promise<PRResult> {
    // Generate and load git diff
    const diff = GitUtils.generateDiff()

    let title = ''

    // Parse PR title
    if (prTitle?.includes(':')) {
      const parts = prTitle.split(':', 2)
      ticket = parts[0].trim()
      title = parts[1].trim()
    } else if (prTitle) {
      if (prTitle.includes(' ')) {
        title = prTitle
      } else {
        ticket = prTitle
      }
    }

    // Generate AI title if needed
    if (!title) {
      const titlePrompt = this.buildTitlePrompt(diff, explanation)
      const titleResponse = await this.aiManager.generateContent(titlePrompt)
      title = titleResponse.text.trim().replace(/^["']|["']$/g, '')
    }

    // Build final title
    const ticketPrefix = ticket ? `(${ticket})` : ''
    const formattedTitle = `${prType}${ticketPrefix}: ${title}`
      .replace(/^:\s*/, '')
      .trim()

    // Generate description
    const descriptionPrompt = this.buildDescriptionPrompt(diff, explanation)
    const response = await this.aiManager.generateContent(descriptionPrompt)
    const prBody = response.text.trim()

    // Combine title and description
    const fullDescription = `# 🔖 ${formattedTitle}\n\n${prBody}`

    return {
      title: formattedTitle,
      body: prBody,
      fullDescription,
    }
  }

  /**
   * Builds the prompt for generating a PR title
   */
  private buildTitlePrompt(diff: string, explanation: string): string {
    let prompt = `
You're a senior software engineer writing a Bitbucket pull request.

Based on this git diff, generate a short, descriptive PR title in sentence case.
Do NOT include any punctuation or markdown — just return the title text.

Git diff:
${diff}
`

    if (explanation) {
      prompt += `\nAdditional context from the author:\n${explanation}`
    }

    return prompt
  }

  /**
   * Builds the prompt for generating a PR description
   */
  private buildDescriptionPrompt(diff: string, explanation: string): string {
    let prompt = `
You're a senior software engineer writing a Bitbucket pull request description.

Please generate a professional, **short and concise** PR description in **Markdown format** — no title.

Keep it focused and direct. Avoid redundant wording. Use bullet points where possible.

Use this structure:

## 🧠 Summary
A 2-3 sentence summary of what this PR does, in clear language.

## ✅ Changes
A concise bullet list of changes (ideally 3-5 items).

Use the following git diff as input:

${diff}
`

    if (explanation) {
      prompt += `\nAdditional context from the author:\n${explanation}`
    }

    prompt +=
      '\n\nDo not include any title or triple backticks. Only return the description body.'

    return prompt
  }

  /**
   * Saves the PR description to a file
   */
  saveToFile(content: string): string {
    // Make sure we're in the repository root
    GitUtils.checkGitRepository()

    // Save the file
    fs.writeFileSync(outputPath, content, 'utf8')
    return outputPath
  }
}
