import inquirer from 'inquirer'
import chalk from 'chalk'

export interface AIModelConfig {
  openaiModel: string
  geminiModel: string
  defaultProvider: string
}

export interface CustomModelInputs {
  customOpenaiModel?: string
  customGeminiModel?: string
}

/**
 * Shared AI model selection logic used in both init and config commands
 */
export const selectAIModels = async (
  currentConfig?: Partial<AIModelConfig>
): Promise<AIModelConfig> => {
  const { openaiModel, geminiModel, defaultProvider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'openaiModel',
      message: '🤖 Select OpenAI Model:',
      choices: [
        { name: 'GPT-4o Mini (Fast & Cheap)', value: 'gpt-4o-mini' },
        { name: 'GPT-4o (Best Quality)', value: 'gpt-4o' },
        { name: 'GPT-4 Turbo (Balanced)', value: 'gpt-4-turbo' },
        { name: 'Custom Model', value: 'custom' },
      ],
      default: currentConfig?.openaiModel || 'gpt-4o-mini',
    },
    {
      type: 'list',
      name: 'geminiModel',
      message: '🤖 Select Gemini Model:',
      choices: [
        { name: 'Gemini 2.0 Flash (Fast)', value: 'gemini-2.0-flash' },
        { name: 'Gemini 2.0 Pro (Best Quality)', value: 'gemini-2.0-pro' },
        { name: 'Gemini 1.5 Pro (Balanced)', value: 'gemini-1.5-pro' },
        { name: 'Custom Model', value: 'custom' },
      ],
      default: currentConfig?.geminiModel || 'gemini-2.0-flash',
    },
    {
      type: 'list',
      name: 'defaultProvider',
      message: '🎯 Default AI Provider:',
      choices: [
        { name: 'Auto-select (Recommended)', value: '' },
        { name: 'OpenAI (GPT)', value: 'openai' },
        { name: 'Gemini', value: 'gemini' },
      ],
      default: currentConfig?.defaultProvider || '',
    },
  ])

  // Handle custom model inputs
  let finalOpenaiModel = openaiModel
  let finalGeminiModel = geminiModel

  if (openaiModel === 'custom') {
    const { customOpenaiModel } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customOpenaiModel',
        message: '🔧 Enter custom OpenAI model name:',
        default: currentConfig?.openaiModel || 'gpt-4o-mini',
      },
    ])
    finalOpenaiModel = customOpenaiModel
  }

  if (geminiModel === 'custom') {
    const { customGeminiModel } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customGeminiModel',
        message: '🔧 Enter custom Gemini model name:',
        default: currentConfig?.geminiModel || 'gemini-2.0-flash',
      },
    ])
    finalGeminiModel = customGeminiModel
  }

  return {
    openaiModel: finalOpenaiModel,
    geminiModel: finalGeminiModel,
    defaultProvider,
  }
}

/**
 * Shared action handling logic for configuration commands
 */
export interface ActionHandler {
  view: () => void
  edit: () => Promise<void>
  reset: () => Promise<void>
}

export const handleConfigActions = async (
  options: { action?: 'view' | 'edit' | 'reset' },
  handlers: ActionHandler
): Promise<void> => {
  if (options.action === 'view' || Object.keys(options).length === 0) {
    handlers.view()
    return
  }

  if (options.action === 'edit') {
    await handlers.edit()
    return
  }

  if (options.action === 'reset') {
    await handlers.reset()
    return
  }

  // Interactive mode
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📋 View current configuration', value: 'view' },
        { name: '✏️  Edit configuration', value: 'edit' },
        { name: '🔄 Reset configuration', value: 'reset' },
        { name: '❌ Cancel', value: 'cancel' },
      ],
    },
  ])

  if (action === 'view') {
    handlers.view()
  } else if (action === 'edit') {
    await handlers.edit()
  } else if (action === 'reset') {
    await handlers.reset()
  }
}

/**
 * Shared reset confirmation logic
 */
export const confirmReset = async (): Promise<boolean> => {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '⚠️  Are you sure you want to reset all configuration?',
      default: false,
    },
  ])
  return confirm
}

/**
 * Shared success message display
 */
export const displayConfigUpdateSuccess = (displayConfig: () => void): void => {
  console.log('')
  console.log(chalk.green.bold('✅ Configuration updated!'))
  console.log(chalk.green('=========================='))
  console.log('')
  console.log('Your new settings:')
  displayConfig()
}
