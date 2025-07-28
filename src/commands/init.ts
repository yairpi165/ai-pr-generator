#!/usr/bin/env node

import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer'

interface InitOptions {
  openaiKey?: string
  geminiKey?: string
  bitbucketEmail?: string
  bitbucketToken?: string
  githubToken?: string
}

/**
 * Check if Node.js is installed and has correct version
 */
const checkNodeVersion = (): boolean => {
  try {
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

    if (majorVersion < 18) {
      console.log(chalk.red('❌ Node.js version 18+ is required.'))
      console.log(chalk.red(`   Current version: ${nodeVersion}`))
      console.log(chalk.blue('   Visit: https://nodejs.org/'))
      return false
    }

    console.log(chalk.green(`✅ Node.js ${nodeVersion} detected`))
  } catch {
    console.log(
      chalk.red(
        '❌ Node.js is not installed. Please install Node.js 18+ first.'
      )
    )
    console.log(chalk.blue('   Visit: https://nodejs.org/'))
    return false
  }
  return true
}

/**
 * Check if git is installed
 */
const checkGit = (): void => {
  try {
    execSync('git --version', { stdio: 'ignore' })
    console.log(chalk.green('✅ Git detected'))
  } catch {
    console.log(
      chalk.yellow('⚠️  Git is not installed. Some features may not work.')
    )
    console.log(chalk.blue('   Visit: https://git-scm.com/'))
  }
}

/**
 * Create .env file with API keys
 */
const createEnvFile = async (options: InitOptions): Promise<void> => {
  const envPath = path.join(process.cwd(), '.env')

  if (fs.existsSync(envPath)) {
    console.log(chalk.green('✅ .env file already exists'))
    return
  }

  console.log('')
  console.log(chalk.blue.bold('🔐 AI Provider Setup'))
  console.log(chalk.blue('=================='))
  console.log('You need at least one API key to use this tool.')
  console.log('')

  // OpenAI setup
  console.log(chalk.cyan('1️⃣  OpenAI (GPT-4) Setup'))
  console.log(chalk.cyan('----------------------'))
  console.log('1. Visit: https://platform.openai.com/api-keys')
  console.log('2. Sign in with your OpenAI account')
  console.log("3. Click 'Create new secret key'")
  console.log('4. Copy your API key')
  console.log('')

  const { openaiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'openaiKey',
      message: '🔑 Enter your OpenAI API key (press Enter to skip):',
      default: options.openaiKey || '',
    },
  ])

  console.log('')
  console.log(chalk.cyan('2️⃣  Gemini Setup'))
  console.log(chalk.cyan('-------------'))
  console.log('1. Visit: https://makersuite.google.com/app/apikey')
  console.log('2. Sign in with your Google account')
  console.log("3. Click 'Create API Key'")
  console.log('4. Copy your API key')
  console.log('')

  const { geminiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'geminiKey',
      message: '🔑 Enter your Gemini API key (press Enter to skip):',
      default: options.geminiKey || '',
    },
  ])

  if (openaiKey || geminiKey) {
    let envContent = ''

    if (openaiKey) {
      envContent += `OPENAI_API_KEY=${openaiKey}\n`
      console.log(chalk.green('✅ OpenAI API key saved'))
    }

    if (geminiKey) {
      envContent += `GEMINI_API_KEY=${geminiKey}\n`
      console.log(chalk.green('✅ Gemini API key saved'))
    }

    // Bitbucket setup
    console.log('')
    console.log(chalk.cyan('3️⃣  Bitbucket Setup (Optional)'))
    console.log(chalk.cyan('---------------------------'))
    console.log(
      'For automatic PR creation, you can set up Bitbucket API credentials:'
    )
    console.log(
      '1. Visit: https://bitbucket.org/account/settings/app-passwords/'
    )
    console.log(
      "2. Create a new app password with 'Pull requests: Write' permission"
    )
    console.log('3. Copy your email and app password')
    console.log('')

    const { bitbucketEmail, bitbucketToken } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bitbucketEmail',
        message: '🔑 Enter your Bitbucket email (press Enter to skip):',
        default: options.bitbucketEmail || '',
      },
      {
        type: 'password',
        name: 'bitbucketToken',
        message: '🔑 Enter your Bitbucket app password (press Enter to skip):',
        default: options.bitbucketToken || '',
      },
    ])

    if (bitbucketEmail && bitbucketToken) {
      envContent += `BITBUCKET_EMAIL=${bitbucketEmail}\n`
      envContent += `BITBUCKET_TOKEN=${bitbucketToken}\n`
      console.log(chalk.green('✅ Bitbucket credentials saved'))
    }

    // GitHub setup
    console.log('')
    console.log(chalk.cyan('4️⃣  GitHub Setup (Optional)'))
    console.log(chalk.cyan('------------------------'))
    console.log(
      'For automatic PR creation, you can set up GitHub API credentials:'
    )
    console.log('1. Visit: https://github.com/settings/tokens')
    console.log("2. Click 'Generate new token (classic)'")
    console.log("3. Select 'repo' scope for full repository access")
    console.log('4. Copy your personal access token')
    console.log('')

    const { githubToken } = await inquirer.prompt([
      {
        type: 'password',
        name: 'githubToken',
        message:
          '🔑 Enter your GitHub personal access token (press Enter to skip):',
        default: options.githubToken || '',
      },
    ])

    if (githubToken) {
      envContent += `GITHUB_TOKEN=${githubToken}\n`
      console.log(chalk.green('✅ GitHub credentials saved'))
    }

    fs.writeFileSync(envPath, envContent)
    console.log(chalk.green('✅ API keys saved to .env file'))
  } else {
    console.log(
      chalk.yellow(
        "⚠️  No API keys provided. You'll need to create a .env file manually."
      )
    )
    console.log('   Add one or both:')
    console.log('   OPENAI_API_KEY=your_openai_key_here')
    console.log('   GEMINI_API_KEY=your_gemini_key_here')
  }
}

/**
 * Create reviewers.json.example if it doesn't exist
 */
const createReviewersExample = (): void => {
  const reviewersPath = path.join(process.cwd(), 'reviewers.json.example')

  if (fs.existsSync(reviewersPath)) {
    console.log(chalk.green('✅ reviewers.json.example already exists'))
    return
  }

  const reviewersContent = {
    bitbucket: [
      {
        name: 'John Doe',
        username: 'johndoe',
      },
      {
        name: 'Jane Smith',
        username: 'janesmith',
      },
    ],
    github: [
      {
        name: 'John Doe',
        username: 'johndoe',
      },
      {
        name: 'Jane Smith',
        username: 'janesmith',
      },
    ],
    gitlab: [
      {
        name: 'John Doe',
        username: 'johndoe',
      },
      {
        name: 'Jane Smith',
        username: 'janesmith',
      },
    ],
    default: [
      {
        name: 'Default Reviewer',
        username: 'default',
      },
    ],
  }

  fs.writeFileSync(reviewersPath, JSON.stringify(reviewersContent, null, 2))
  console.log(chalk.green('✅ Created reviewers.json.example'))
}

/**
 * Add .env to .gitignore if not already there
 */
const updateGitignore = (): void => {
  const gitignorePath = path.join(process.cwd(), '.gitignore')

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '.env\n')
    console.log(chalk.green('✅ Created .gitignore with .env'))
    return
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')

  if (!gitignoreContent.includes('.env')) {
    fs.appendFileSync(gitignorePath, '\n.env\n')
    console.log(chalk.green('✅ Added .env to .gitignore'))
  } else {
    console.log(chalk.green('✅ .env already in .gitignore'))
  }
}

/**
 * Main init function
 */
export const runInit = async (options: InitOptions = {}): Promise<void> => {
  try {
    console.log(
      chalk.blue.bold('🧠 AI Pull Request Generator - Initialization')
    )
    console.log(
      chalk.blue('==================================================')
    )
    console.log('')

    // Check prerequisites
    if (!checkNodeVersion()) {
      return
    }
    checkGit()
    console.log('')

    // Create necessary files
    await createEnvFile(options)
    createReviewersExample()
    updateGitignore()

    console.log('')
    console.log(chalk.green.bold('🎉 Initialization complete!'))
    console.log(chalk.green('=============================='))
    console.log('')
    console.log('Usage:')
    console.log('  genpr                    # Interactive mode')
    console.log("  genpr feat 'Add feature' # One-liner mode")
    console.log('')
    console.log(
      'Make sure to restart your terminal if the genpr command is not found.'
    )
  } catch (error) {
    console.log(chalk.red('❌ Initialization failed:'))
    console.log(
      chalk.red(error instanceof Error ? error.message : String(error))
    )
    return
  }
}

// Run init if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  runInit()
}
