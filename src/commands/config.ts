#!/usr/bin/env node

import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import dotenv from 'dotenv'
import { AI_CONSTANTS } from '../domain/ai/constants.js'
import {
  selectAIModels,
  handleConfigActions,
  confirmReset,
  displayConfigUpdateSuccess,
} from './shared.js'
import { getEnvPath } from '../domain/config/paths.js'

interface SettingsOptions {
  action?: 'view' | 'edit' | 'reset'
}

interface EnvConfig {
  OPENAI_API_KEY?: string
  GEMINI_API_KEY?: string
  OPENAI_MODEL?: string
  GEMINI_MODEL?: string
  DEFAULT_PROVIDER?: string
  BITBUCKET_EMAIL?: string
  BITBUCKET_TOKEN?: string
  GITHUB_TOKEN?: string
}

/**
 * Load current environment configuration
 */
const loadEnvConfig = (): EnvConfig => {
  const envPath = getEnvPath()

  if (!fs.existsSync(envPath)) {
    return {}
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const envConfig = dotenv.parse(envContent)

  return envConfig
}

/**
 * Save environment configuration
 */
const saveEnvConfig = (config: EnvConfig): void => {
  const envPath = getEnvPath()
  let envContent = ''

  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      envContent += `${key}=${value}\n`
    }
  })

  fs.writeFileSync(envPath, envContent)
  console.log(chalk.green('✅ Configuration saved to .env file'))
}

/**
 * Display current configuration
 */
const displayCurrentConfig = (config: EnvConfig): void => {
  console.log('')
  console.log(chalk.blue.bold('🔧 Current Configuration'))
  console.log(chalk.blue('========================'))
  console.log('')

  // AI Providers
  console.log(chalk.cyan('🤖 AI Providers:'))
  console.log(
    `   OpenAI API Key: ${config.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`
  )
  console.log(
    `   Gemini API Key: ${config.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`
  )
  console.log('')

  // AI Models
  console.log(chalk.cyan('🧠 AI Models:'))
  console.log(
    `   OpenAI Model: ${config.OPENAI_MODEL || AI_CONSTANTS.MODELS.OPENAI.DEFAULT}`
  )
  console.log(
    `   Gemini Model: ${config.GEMINI_MODEL || AI_CONSTANTS.MODELS.GEMINI.DEFAULT}`
  )
  console.log(
    `   Default Provider: ${config.DEFAULT_PROVIDER || 'Auto-select'}`
  )
  console.log('')

  // Git Hosting
  console.log(chalk.cyan('🔗 Git Hosting:'))
  console.log(
    `   Bitbucket: ${config.BITBUCKET_EMAIL && config.BITBUCKET_TOKEN ? '✅ Configured' : '❌ Not configured'}`
  )
  console.log(
    `   GitHub: ${config.GITHUB_TOKEN ? '✅ Configured' : '❌ Not configured'}`
  )
  console.log('')
}

/**
 * Edit AI Provider Keys
 */
const editAIProviderKeys = async (
  currentConfig: EnvConfig
): Promise<EnvConfig> => {
  console.log('')
  console.log(chalk.cyan('🔑 AI Provider API Keys'))
  console.log(chalk.cyan('========================'))
  console.log('')

  const { openaiKey, geminiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'openaiKey',
      message: '🔑 OpenAI API Key (press Enter to keep current):',
      default: currentConfig.OPENAI_API_KEY || '',
    },
    {
      type: 'input',
      name: 'geminiKey',
      message: '🔑 Gemini API Key (press Enter to keep current):',
      default: currentConfig.GEMINI_API_KEY || '',
    },
  ])

  const newConfig = { ...currentConfig }
  newConfig.OPENAI_API_KEY = openaiKey
  newConfig.GEMINI_API_KEY = geminiKey

  return newConfig
}

/**
 * Edit AI Models
 */
const editAIModels = async (currentConfig: EnvConfig): Promise<EnvConfig> => {
  console.log('')
  console.log(chalk.cyan('🧠 AI Models Configuration'))
  console.log(chalk.cyan('=========================='))
  console.log('')

  const { openaiModel, geminiModel, defaultProvider } = await selectAIModels({
    openaiModel: currentConfig.OPENAI_MODEL,
    geminiModel: currentConfig.GEMINI_MODEL,
    defaultProvider: currentConfig.DEFAULT_PROVIDER,
  })

  const newConfig = { ...currentConfig }
  newConfig.OPENAI_MODEL = openaiModel
  newConfig.GEMINI_MODEL = geminiModel
  newConfig.DEFAULT_PROVIDER = defaultProvider

  return newConfig
}

/**
 * Edit Git Hosting
 */
const editGitHosting = async (currentConfig: EnvConfig): Promise<EnvConfig> => {
  console.log('')
  console.log(chalk.cyan('🔗 Git Hosting Configuration'))
  console.log(chalk.cyan('============================'))
  console.log('')

  const { bitbucketEmail, bitbucketToken, githubToken } = await inquirer.prompt(
    [
      {
        type: 'input',
        name: 'bitbucketEmail',
        message: '📧 Bitbucket Email (press Enter to keep current):',
        default: currentConfig.BITBUCKET_EMAIL || '',
      },
      {
        type: 'password',
        name: 'bitbucketToken',
        message: '🔑 Bitbucket App Password (press Enter to keep current):',
        default: currentConfig.BITBUCKET_TOKEN || '',
      },
      {
        type: 'password',
        name: 'githubToken',
        message:
          '🔑 GitHub Personal Access Token (press Enter to keep current):',
        default: currentConfig.GITHUB_TOKEN || '',
      },
    ]
  )

  const newConfig = { ...currentConfig }
  newConfig.BITBUCKET_EMAIL = bitbucketEmail
  newConfig.BITBUCKET_TOKEN = bitbucketToken
  newConfig.GITHUB_TOKEN = githubToken

  return newConfig
}

/**
 * Edit configuration interactively with sub-menus
 */
const editConfiguration = async (
  currentConfig: EnvConfig
): Promise<EnvConfig> => {
  let newConfig = { ...currentConfig }

  while (true) {
    console.log('')
    console.log(chalk.blue.bold('⚙️  Edit Configuration'))
    console.log(chalk.blue('=================='))
    console.log('')

    const { editSection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'editSection',
        message: 'What would you like to edit?',
        choices: [
          { name: '🔑 AI Provider API Keys', value: 'providers' },
          { name: '🧠 AI Models & Preferences', value: 'models' },
          { name: '🔗 Git Hosting Credentials', value: 'hosting' },
          { name: '✅ Save and Exit', value: 'save' },
          { name: '❌ Cancel without saving', value: 'cancel' },
        ],
      },
    ])

    if (editSection === 'providers') {
      newConfig = await editAIProviderKeys(newConfig)
      console.log(chalk.green('✅ AI Provider keys updated'))
    } else if (editSection === 'models') {
      newConfig = await editAIModels(newConfig)
      console.log(chalk.green('✅ AI Models updated'))
    } else if (editSection === 'hosting') {
      newConfig = await editGitHosting(newConfig)
      console.log(chalk.green('✅ Git Hosting credentials updated'))
    } else if (editSection === 'save') {
      return newConfig
    } else if (editSection === 'cancel') {
      return currentConfig
    }
  }
}

/**
 * Main settings function
 */
export const runConfig = async (
  options: SettingsOptions = {}
): Promise<void> => {
  try {
    console.log(chalk.blue.bold('⚙️  AI Pull Request Generator - Settings'))
    console.log(chalk.blue('============================================'))
    console.log('')

    const currentConfig = loadEnvConfig()

    await handleConfigActions(options, {
      view: () => displayCurrentConfig(currentConfig),
      edit: async () => {
        const newConfig = await editConfiguration(currentConfig)
        saveEnvConfig(newConfig)
        displayConfigUpdateSuccess(() => displayCurrentConfig(newConfig))
      },
      reset: async () => {
        const confirm = await confirmReset()
        if (confirm) {
          const envPath = getEnvPath()
          if (fs.existsSync(envPath)) {
            fs.unlinkSync(envPath)
            console.log(chalk.green('✅ Configuration reset!'))
            console.log(chalk.yellow('Run "genpr init" to set up again.'))
          } else {
            console.log(chalk.yellow('ℹ️  No configuration file found.'))
          }
        }
      },
    })
  } catch (error) {
    console.log(chalk.red('❌ Settings failed:'))
    console.log(
      chalk.red(error instanceof Error ? error.message : String(error))
    )
  }
}

// Run config if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('config.js')) {
  runConfig()
}
