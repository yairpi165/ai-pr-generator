import path from 'path'
import dotenv from 'dotenv'
import { CONFIG_CONSTANTS } from './constants.js'
import type { AIConfig } from '../ai/types.js'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

// AI Configuration - contains all AI-related environment variables
export const aiConfig: AIConfig = {
  openaiApiKey: process.env[CONFIG_CONSTANTS.ENV_VARS.OPENAI_API_KEY],
  geminiApiKey: process.env[CONFIG_CONSTANTS.ENV_VARS.GEMINI_API_KEY],
  openaiModel: process.env.OPENAI_MODEL,
  geminiModel: process.env.GEMINI_MODEL,
  defaultProvider: process.env.DEFAULT_PROVIDER,
}
