#!/usr/bin/env node

import chalk from 'chalk'
import type { PROptions } from './domain/pr/types.js'
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
  loadReviewersConfig,
  UI_CONSTANTS,
} from './domain/index.js'
import { runInit } from './commands/init.js'

/**
 * Parse command line arguments
 */
export const parseArguments = (
  args: string[] = process.argv.slice(2)
): { command?: string; provider?: string; remainingArgs: string[] } => {
  const config: {
    command?: string
    provider?: string
    remainingArgs: string[]
  } = {
    remainingArgs: [],
  }

  // Handle version flag early
  if (args.includes('--version') || args.includes('-v')) {
    console.log(
      `ai-pr-generator v${process.env.npm_package_version || '1.0.0'}`
    )
    process.exit(0)
  }

  // Handle init command
  if (args.length > 0 && args[0] === 'init') {
    config.command = 'init'
    config.remainingArgs = args.slice(1)
    return config
  }

  // Handle provider flag
  const providerIndex = args.findIndex(
    arg => arg === '--provider' || arg === '-p'
  )
  if (providerIndex !== -1 && providerIndex + 1 < args.length) {
    config.provider = args[providerIndex + 1]
    config.remainingArgs = args.filter(
      (_, index) => index !== providerIndex && index !== providerIndex + 1
    )
  } else {
    config.remainingArgs = args
  }

  return config
}

/**
 * Parse input from command line or interactive prompts
 *
 * @param config - Configuration object containing command, provider, and remaining arguments
 * @returns Promise<PROptions> - Parsed PR options for generation
 *
 * @throws {Error} If init command is passed (should be handled before calling this function)
 *
 * Note: This function should only be called after init commands have been filtered out
 * in runCLI(). The function includes runtime assertions to ensure type safety.
 */
export const parseInput = async (config: {
  command?: string
  provider?: string
  remainingArgs: string[]
}): Promise<PROptions> => {
  // Runtime assertion: init commands should never reach this function
  if (config.command === 'init' || config.remainingArgs.includes('init')) {
    throw new Error('Init command should be handled before calling parseInput')
  }

  if (
    config.provider &&
    !['openai', 'gemini', 'GPT', 'Gemini'].includes(config.provider)
  ) {
    console.warn(`Unknown provider: ${config.provider}`)
  }
  // If provider is specified, validate it (this would need to be implemented)
  if (config.provider) {
    console.log(`Using provider: ${config.provider}`)
  }

  if (config.remainingArgs.length > 0) {
    return {
      prType: config.remainingArgs[0],
      prTitle: config.remainingArgs[1] || '',
      ticket: '',
      explanation: '',
    } satisfies PROptions
  }

  return await getInteractiveInput()
}

/**
 * Main CLI function
 *
 * Handles the complete CLI flow:
 * 1. Parse command line arguments
 * 2. Handle init command early (before parseInput)
 * 3. Parse PR options (init commands filtered out)
 * 4. Generate and display PR description
 */
const runCLI = async (): Promise<void> => {
  try {
    // Parse command line arguments or get interactive input
    const config = parseArguments()

    // Handle init command early - this prevents init from reaching parseInput
    if (config.command === 'init') {
      await runInit()
      return
    }

    console.log(chalk.blue.bold(`${UI_CONSTANTS.MESSAGES.WELCOME}\n`))

    // Load reviewers configuration
    loadReviewersConfig()

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
