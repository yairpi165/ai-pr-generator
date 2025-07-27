#!/usr/bin/env node

import chalk from 'chalk'
import {
  generatePRDescription,
  savePRToFile,
  getCurrentProvider,
  getInteractiveInput,
  displayOptions,
  displayProgress,
  displayResult,
  displayError,
  handleOutputOptions,
  outputPath,
  type PROptions,
  loadReviewersConfig,
  UI_CONSTANTS,
} from './domain/index.js'

/**
 * Parse command line arguments
 */
const parseArguments = (): { provider?: string } => {
  const args = process.argv.slice(2)
  const config: { provider?: string } = {}

  // Check for provider selection flag
  if (args[0] === '--provider' && args[1]) {
    config.provider = args[1]
    args.splice(0, 2) // Remove provider args
  }

  return config
}

/**
 * Parse input from command line or interactive prompts
 */
const parseInput = async (): Promise<PROptions> => {
  const args = process.argv.slice(2)
  const config = parseArguments()

  // If provider is specified, validate it (this would need to be implemented)
  if (config.provider) {
    console.log(`Using provider: ${config.provider}`)
  }

  if (args.length > 0) {
    return {
      prType: args[0],
      prTitle: args[1] || '',
      ticket: '',
      explanation: '',
    }
  }

  return await getInteractiveInput()
}

/**
 * Main CLI function
 */
const runCLI = async (): Promise<void> => {
  try {
    console.log(chalk.blue.bold(`${UI_CONSTANTS.MESSAGES.WELCOME}\n`))

    // Load reviewers configuration
    loadReviewersConfig()

    // Parse command line arguments or get interactive input
    const options = await parseInput()

    // Display selected options
    displayOptions(options, getCurrentProvider())

    // Generate PR description
    displayProgress(`\n${UI_CONSTANTS.MESSAGES.GENERATING_DIFF}`)
    displayProgress(UI_CONSTANTS.MESSAGES.GENERATING_PR)

    const result = await generatePRDescription(
      options.prType,
      options.prTitle,
      options.ticket,
      options.explanation
    )

    // Save and display result
    const savedPath = savePRToFile(result.fullDescription)
    displayResult(result.fullDescription, savedPath, getCurrentProvider())

    // Handle output options
    await handleOutputOptions(outputPath, result.title, result.body)
  } catch (error) {
    displayError(error instanceof Error ? error : new Error(String(error)))
    process.exit(1)
  }
}

// Run the CLI
runCLI().catch(error =>
  displayError(error instanceof Error ? error : new Error(String(error)))
)
