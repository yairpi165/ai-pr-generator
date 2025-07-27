import inquirer from 'inquirer'
import { PR_CONSTANTS } from '../pr/constants.js'
import type { PROptions } from '../pr/types.js'

/**
 * Get user input through interactive prompts
 */
export const getInteractiveInput = async (): Promise<PROptions> => {
  const questions = [
    {
      type: 'list',
      name: 'prType',
      message: '🔧 Select PR type:',
      choices: PR_CONSTANTS.PR_TYPES,
    },
    {
      type: 'input',
      name: 'prTitle',
      message: '📝 Enter PR title (optional):',
      default: '',
    },
    {
      type: 'input',
      name: 'ticket',
      message: '🎫 Enter ticket name (optional):',
      default: '',
    },
    {
      type: 'input',
      name: 'explanation',
      message: '🗒️  Enter short explanation for AI (optional):',
      default: '',
    },
  ]

  return await inquirer.prompt<PROptions>(questions)
}
