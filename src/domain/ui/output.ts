import inquirer from 'inquirer'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import open from 'open'
import fs from 'fs'
import { UI_CONSTANTS } from './constants.js'
import type { OutputChoice } from './types.js'
import { openBitbucketPR, openGitHubPR } from '../git/index.js'

/**
 * Handle output options for the generated PR description
 */
export const handleOutputOptions = async (
  outputPath: string,
  title?: string,
  description?: string
): Promise<void> => {
  const choices: OutputChoice[] = [...UI_CONSTANTS.OUTPUT_CHOICES]

  const { action } = await inquirer.prompt<{ action: OutputChoice['value'] }>([
    {
      type: 'list',
      name: 'action',
      message: UI_CONSTANTS.MESSAGES.WHAT_TO_DO,
      choices,
    },
  ])

  switch (action) {
    case 'clipboard':
      await clipboardy.write(fs.readFileSync(outputPath, 'utf8'))
      console.log(
        chalk.green(
          `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.COPIED_CLIPBOARD}`
        )
      )
      break
    case 'editor':
      await open(outputPath)
      console.log(
        chalk.green(
          `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.OPENED_EDITOR}`
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
          `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.COPIED_AND_OPENED}`
        )
      )
      break
    case 'nothing':
      console.log(
        chalk.yellow(
          `${UI_CONSTANTS.EMOJIS.INFO} ${UI_CONSTANTS.SUCCESS.SKIPPING}`
        )
      )
      break
  }
}
