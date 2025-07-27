import path from 'path'
import dotenv from 'dotenv'
import { CONFIG_CONSTANTS } from './constants.js'
import type { EnvironmentConfig } from './types.js'
import type { AIConfig } from '../ai/types.js'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

// AI Configuration
export const aiConfig: AIConfig = {
  openaiApiKey: process.env[CONFIG_CONSTANTS.ENV_VARS.OPENAI_API_KEY],
  geminiApiKey: process.env[CONFIG_CONSTANTS.ENV_VARS.GEMINI_API_KEY],
}

// Environment Configuration
export const env: EnvironmentConfig = {
  OPENAI_API_KEY: process.env[CONFIG_CONSTANTS.ENV_VARS.OPENAI_API_KEY],
  GEMINI_API_KEY: process.env[CONFIG_CONSTANTS.ENV_VARS.GEMINI_API_KEY],
  BITBUCKET_EMAIL: process.env[CONFIG_CONSTANTS.ENV_VARS.BITBUCKET_EMAIL],
  BITBUCKET_TOKEN: process.env[CONFIG_CONSTANTS.ENV_VARS.BITBUCKET_TOKEN],
  GITHUB_TOKEN: process.env[CONFIG_CONSTANTS.ENV_VARS.GITHUB_TOKEN],
}
