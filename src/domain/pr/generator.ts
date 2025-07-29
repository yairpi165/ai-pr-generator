import fs from 'fs'
import { outputPath } from '../config/index.js'
import { aiConfig } from '../config/index.js'
import { generateDiff } from '../git/index.js'
import type { PRResult, PRGenerationConfig, PRTitleInfo } from './types.js'
import { createProviderManager } from '../ai/index.js'

/**
 * Create PR generator configuration
 */
export const createPRGenerator = () => {
  const aiManager = createProviderManager(aiConfig)

  // Validate that at least one provider is available
  if (!aiManager.hasAvailableProviders()) {
    throw new Error(
      'No AI providers available. Please configure either OPENAI_API_KEY or GEMINI_API_KEY in your .env file.'
    )
  }

  const config: PRGenerationConfig = {
    aiManager,
    outputPath,
  }

  return config
}

/**
 * Parse PR title and extract ticket information
 */
const parsePRTitle = (prTitle: string): PRTitleInfo => {
  let title = ''
  let ticket = ''

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

  return { title, ticket }
}

/**
 * Build the prompt for generating a PR title
 */
const buildTitlePrompt = (diff: string, explanation: string): string => {
  let prompt = `
You're a senior software engineer writing a pull request.

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
 * Build the prompt for generating a PR description
 */
const buildDescriptionPrompt = (diff: string, explanation: string): string => {
  let prompt = `
You're a senior software engineer writing a pull request description.

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
 * Generate AI title using the AI provider
 */
const generateAITitle = async (
  config: PRGenerationConfig,
  diff: string,
  explanation: string,
  provider?: string
): Promise<string> => {
  const titlePrompt = buildTitlePrompt(diff, explanation)

  const titleResponse = provider
    ? await config.aiManager.generateContentWithProvider(provider, titlePrompt)
    : await config.aiManager.generateContent(titlePrompt)
  return titleResponse.text.trim().replace(/^["']|["']$/g, '')
}

/**
 * Generate PR description using AI
 */
const generateAIDescription = async (
  config: PRGenerationConfig,
  diff: string,
  explanation: string,
  provider?: string
): Promise<string> => {
  const descriptionPrompt = buildDescriptionPrompt(diff, explanation)

  const response = provider
    ? await config.aiManager.generateContentWithProvider(
        provider,
        descriptionPrompt
      )
    : await config.aiManager.generateContent(descriptionPrompt)
  return response.text.trim()
}

/**
 * Format the final PR title
 */
const formatPRTitle = (
  prType: string,
  title: string,
  ticket: string
): string => {
  const ticketPrefix = ticket ? `(${ticket})` : ''
  return `${prType}${ticketPrefix}: ${title}`.replace(/^:\s*/, '').trim()
}

/**
 * Generate a PR description using available AI providers
 */
export const generatePRDescription = async (
  prType: string,
  prTitle: string,
  ticket: string,
  explanation: string,
  provider?: string
): Promise<PRResult> => {
  const config = createPRGenerator()

  // Generate and load git diff
  const diff = generateDiff()

  // Parse PR title
  const { title: parsedTitle, ticket: parsedTicket } = parsePRTitle(prTitle)
  let finalTitle = parsedTitle
  const finalTicket = ticket || parsedTicket

  // Generate AI title if needed
  if (!finalTitle) {
    finalTitle = await generateAITitle(config, diff, explanation, provider)
  }

  // Build final title
  const formattedTitle = formatPRTitle(prType, finalTitle, finalTicket)

  // Generate description
  const prBody = await generateAIDescription(
    config,
    diff,
    explanation,
    provider
  )

  // Combine title and description
  const fullDescription = `# 🔖 ${formattedTitle}\n\n${prBody}`

  return {
    title: formattedTitle,
    body: prBody,
    fullDescription,
  }
}

/**
 * Save the PR description to a file
 */
export const savePRToFile = (content: string): string => {
  // Save the file
  fs.writeFileSync(outputPath, content, 'utf8')
  return outputPath
}

/**
 * Get current AI provider name
 */
export const getCurrentProvider = (): string => {
  const config = createPRGenerator()

  // If there's a default provider configured, return it
  const defaultProvider = config.aiManager.getDefaultProvider()
  if (defaultProvider) {
    return defaultProvider
  }

  // Otherwise return the first available provider or 'None'
  const providers = config.aiManager.getAvailableProviders()
  return providers[0]?.name || 'None'
}
