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
import { runConfig } from './commands/config.js'

/**
 * Helper function to extract flag value from arguments
 */
const extractFlagValue = (
  args: string[],
  flags: string[]
): { value?: string; remainingArgs: string[] } => {
  const flagIndex = args.findIndex(arg => flags.includes(arg))
  if (flagIndex === -1 || flagIndex + 1 >= args.length) {
    return { remainingArgs: args }
  }

  const value = args[flagIndex + 1]
  const remainingArgs = args.filter(
    (_, index) => index !== flagIndex && index !== flagIndex + 1
  )

  return { value, remainingArgs }
}

/**
 * Helper function to check if any flag exists in arguments
 */
const hasFlag = (args: string[], flags: string[]): boolean => {
  return args.some(arg => flags.includes(arg))
}

export const parseArguments = (
  args: string[] = process.argv.slice(2)
): {
  command?: string
  provider?: string
  configAction?: 'view' | 'edit' | 'reset'
  remainingArgs: string[]
} => {
  const config: {
    command?: string
    provider?: string
    configAction?: 'view' | 'edit' | 'reset'
    remainingArgs: string[]
  } = {
    remainingArgs: [],
  }

  // Handle version flag early
  if (hasFlag(args, ['--version', '-v'])) {
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

  // Handle config command
  if (args.length > 0 && args[0] === 'config') {
    config.command = 'config'

    // Parse config action using the same pattern as provider flags
    const { value: action, remainingArgs } = extractFlagValue(args.slice(1), [
      '--action',
      '-a',
    ])
    if (action && ['view', 'edit', 'reset'].includes(action)) {
      config.configAction = action as 'view' | 'edit' | 'reset'
    }
    config.remainingArgs = remainingArgs

    return config
  }

  // Handle provider flag
  const { value: provider, remainingArgs } = extractFlagValue(args, [
    '--provider',
    '-p',
  ])
  if (provider) {
    config.provider = provider
  }
  config.remainingArgs = remainingArgs

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

    // Handle config command early - this prevents config from reaching parseInput
    if (config.command === 'config') {
      await runConfig({ action: config.configAction })
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

// Export runCLI for testing
export { runCLI }

// Run the CLI
runCLI().catch(error =>
  displayError(error instanceof Error ? error : new Error(String(error)))
)
