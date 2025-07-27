import inquirer from 'inquirer'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import open from 'open'
import fs from 'fs'
import { prTypes } from './config.js'
import { OUTPUT_CHOICES } from './constants.js'
import type { PROptions, OutputChoice } from './types.js'
import { openBitbucketPR, openGitHubPR } from './git-hosting.js'
import { APP_CONSTANTS } from './constants.js'

/**
 * Get user input through interactive prompts
 */
export const getInteractiveInput = async (): Promise<PROptions> => {
  const questions = [
    {
      type: 'list',
      name: 'prType',
      message: APP_CONSTANTS.UI.SELECT_PR_TYPE,
      choices: prTypes,
    },
    {
      type: 'input',
      name: 'prTitle',
      message: APP_CONSTANTS.UI.ENTER_PR_TITLE,
      default: '',
    },
    {
      type: 'input',
      name: 'ticket',
      message: APP_CONSTANTS.UI.ENTER_TICKET,
      default: '',
    },
    {
      type: 'input',
      name: 'explanation',
      message: APP_CONSTANTS.UI.ENTER_EXPLANATION,
      default: '',
    },
  ]

  return await inquirer.prompt<PROptions>(questions)
}

/**
 * Handle output options for the generated PR description
 */
export const handleOutputOptions = async (
  outputPath: string,
  title?: string,
  description?: string
): Promise<void> => {
  const choices: OutputChoice[] = [...OUTPUT_CHOICES]

  const { action } = await inquirer.prompt<{ action: OutputChoice['value'] }>([
    {
      type: 'list',
      name: 'action',
      message: APP_CONSTANTS.UI.WHAT_TO_DO,
      choices,
    },
  ])

  switch (action) {
    case 'clipboard':
      await clipboardy.write(fs.readFileSync(outputPath, 'utf8'))
      console.log(
        chalk.green(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.COPIED_CLIPBOARD}`
        )
      )
      break
    case 'editor':
      await open(outputPath)
      console.log(
        chalk.green(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.OPENED_EDITOR}`
        )
      )
      break
    case 'bitbucket':
      await openBitbucketPR(title, description)
      break
    case 'github':
      await openGitHubPR(title, description)
      break
    case 'both':
      await clipboardy.write(fs.readFileSync(outputPath, 'utf8'))
      await open(outputPath)
      console.log(
        chalk.green(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.COPIED_AND_OPENED}`
        )
      )
      break
    case 'nothing':
      console.log(
        chalk.yellow(
          `${APP_CONSTANTS.EMOJIS.INFO} ${APP_CONSTANTS.SUCCESS.SKIPPING}`
        )
      )
      break
  }
}

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
