import chalk from 'chalk'
import type { PROptions } from '../pr/types.js'

/**
 * Display selected options
 */
export const displayOptions = (
  options: PROptions,
  providerName: string
): void => {
  console.log(chalk.blue.bold('\n📋 Selected Options:'))
  console.log(chalk.gray(`   Type: ${options.prType}`))
  console.log(chalk.gray(`   Title: ${options.prTitle || 'Auto-generated'}`))
  console.log(chalk.gray(`   Ticket: ${options.ticket || 'None'}`))
  console.log(chalk.gray(`   Explanation: ${options.explanation || 'None'}`))
  console.log(chalk.gray(`   AI Provider: ${providerName}`))
  console.log()
}

/**
 * Display progress message
 */
export const displayProgress = (message: string): void => {
  console.log(chalk.yellow(`⏳ ${message}`))
}

/**
 * Display the generated result
 */
export const displayResult = (
  description: string,
  savedPath: string,
  providerName: string
): void => {
  console.log(chalk.green.bold('\n✅ PR Description Generated!'))
  console.log(chalk.gray(`   Provider: ${providerName}`))
  console.log(chalk.gray(`   Saved to: ${savedPath}`))
  console.log(chalk.gray('   Content:'))
  console.log(chalk.white('\n' + '─'.repeat(50)))
  console.log(chalk.white(description))
  console.log(chalk.white('─'.repeat(50)))
  console.log()
}

/**
 * Display error message
 */
export const displayError = (error: Error): void => {
  console.error(chalk.red.bold('\n❌ Error:'))
  console.error(chalk.red(error.message))
  console.error()
}
