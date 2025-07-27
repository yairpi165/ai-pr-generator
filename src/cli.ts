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
export const parseArguments = (
  args: string[] = process.argv.slice(2)
): { provider?: string; remainingArgs: string[] } => {
  const config: { provider?: string; remainingArgs: string[] } = {
    remainingArgs: [],
  }

  // Find --provider flag anywhere in the arguments
  const providerIndex = args.findIndex(arg => arg === '--provider')
  if (providerIndex !== -1 && args[providerIndex + 1]) {
    config.provider = args[providerIndex + 1]
    // Remove --provider and its value from args
    config.remainingArgs = [
      ...args.slice(0, providerIndex),
      ...args.slice(providerIndex + 2),
    ]
  } else {
    config.remainingArgs = args
  }

  return config
}

/**
 * Parse input from command line or interactive prompts
 */
export const parseInput = async (config: {
  provider?: string
  remainingArgs: string[]
}): Promise<PROptions> => {
  // If provider is specified, validate it (this would need to be implemented)
  if (config.provider) {
    console.log(`Using provider: ${config.provider}`)
  }

  // Use remaining arguments (after --provider flag) for PR options
  const remainingArgs = config.remainingArgs

  if (remainingArgs.length > 0) {
    return {
      prType: remainingArgs[0],
      prTitle: remainingArgs[1] || '',
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
    const config = parseArguments()
    const options = await parseInput(config)

    // Display selected options
    displayOptions(options, getCurrentProvider())

    // Generate PR description
    displayProgress(`\n${UI_CONSTANTS.MESSAGES.GENERATING_DIFF}`)
    displayProgress(UI_CONSTANTS.MESSAGES.GENERATING_PR)

    const result = await generatePRDescription(
      options.prType,
      options.prTitle,
      options.ticket,
      options.explanation,
      config.provider
    )

    // Save and display result
    const savedPath = savePRToFile(result.fullDescription)
    displayResult(
      result.fullDescription,
      savedPath,
      config.provider || getCurrentProvider()
    )

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
