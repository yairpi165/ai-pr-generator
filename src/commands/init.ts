#!/usr/bin/env node

import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import type { InitOptions } from './types.js'
import { selectAIModels } from './shared.js'

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
      console.log(chalk.yellow('\n🔧 Quick Fix:'))
      console.log(chalk.yellow('   Using nvm: nvm install 18 && nvm use 18'))
      console.log(chalk.yellow('   Or download from: https://nodejs.org/'))
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
    console.log(chalk.yellow('\n🔧 Installation Options:'))
    console.log(chalk.yellow('   • Download from: https://nodejs.org/'))
    console.log(
      chalk.yellow(
        '   • Using nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'
      )
    )
    console.log(chalk.yellow('   • Using Homebrew: brew install node'))
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
    console.log(chalk.yellow('\n🔧 Installation Options:'))
    console.log(chalk.yellow('   • Download from: https://git-scm.com/'))
    console.log(chalk.yellow('   • Using Homebrew: brew install git'))
    console.log(chalk.yellow('   • Using apt: sudo apt-get install git'))
    console.log(chalk.yellow('   • Using yum: sudo yum install git'))
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

    // AI Models Setup
    console.log('')
    console.log(chalk.cyan('2️⃣  AI Models Setup'))
    console.log(chalk.cyan('=================='))
    console.log('Choose your preferred AI models:')
    console.log('')

    const { openaiModel, geminiModel, defaultProvider } = await selectAIModels()

    // Save model configurations
    if (openaiKey) {
      envContent += `OPENAI_MODEL=${openaiModel}\n`
      console.log(chalk.green(`✅ OpenAI model set to: ${openaiModel}`))
    }

    if (geminiKey) {
      envContent += `GEMINI_MODEL=${geminiModel}\n`
      console.log(chalk.green(`✅ Gemini model set to: ${geminiModel}`))
    }

    if (defaultProvider) {
      envContent += `DEFAULT_PROVIDER=${defaultProvider}\n`
      console.log(chalk.green(`✅ Default provider set to: ${defaultProvider}`))
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

    // Provide specific error guidance based on error type
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      if (
        errorMessage.includes('permission') ||
        errorMessage.includes('eacces')
      ) {
        console.log(
          chalk.yellow('\n🔧 Permission Error - Try these solutions:')
        )
        console.log(
          chalk.yellow('1. Run with sudo: sudo npm install -g ai-pr-generator')
        )
        console.log(
          chalk.yellow(
            '2. Fix npm permissions: npm config set prefix ~/.npm-global'
          )
        )
        console.log(chalk.yellow('3. Use nvm to manage Node.js versions'))
      } else if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')
      ) {
        console.log(chalk.yellow('\n🌐 Network Error - Try these solutions:'))
        console.log(chalk.yellow('1. Check your internet connection'))
        console.log(chalk.yellow('2. Try again in a few minutes'))
        console.log(chalk.yellow('3. Use a different network if available'))
      } else if (
        errorMessage.includes('disk') ||
        errorMessage.includes('space')
      ) {
        console.log(
          chalk.yellow('\n💾 Disk Space Error - Try these solutions:')
        )
        console.log(chalk.yellow('1. Free up disk space'))
        console.log(chalk.yellow('2. Clear npm cache: npm cache clean --force'))
        console.log(chalk.yellow('3. Check available space: df -h'))
      } else if (
        errorMessage.includes('typescript') ||
        errorMessage.includes('tsc')
      ) {
        console.log(
          chalk.yellow('\n🔧 TypeScript Error - Try these solutions:')
        )
        console.log(
          chalk.yellow('1. Update TypeScript: npm install -g typescript')
        )
        console.log(chalk.yellow('2. Clear node_modules and reinstall'))
        console.log(chalk.yellow('3. Check TypeScript version: tsc --version'))
      } else {
        console.log(chalk.yellow('\n🔧 General Error - Try these solutions:'))
        console.log(chalk.yellow('1. Clear npm cache: npm cache clean --force'))
        console.log(
          chalk.yellow('2. Delete node_modules and package-lock.json')
        )
        console.log(chalk.yellow('3. Reinstall: npm install'))
        console.log(chalk.yellow('4. Check Node.js version: node --version'))
      }
    }

    console.log(chalk.blue('\n📖 For more help:'))
    console.log(
      chalk.blue(
        '   GitHub Issues: https://github.com/yairpi165/ai-pr-generator/issues'
      )
    )
    console.log(
      chalk.blue(
        '   Documentation: https://github.com/yairpi165/ai-pr-generator#readme'
      )
    )

    return
  }
}

// Run init if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  runInit()
}
