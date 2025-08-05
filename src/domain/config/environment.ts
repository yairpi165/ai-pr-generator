import dotenv from 'dotenv'
import type { AIConfig } from '../ai/types.js'
import { getEnvPath } from './paths.js'

const envPath = getEnvPath()

// Load environment variables from project root
dotenv.config({ path: envPath })

// AI Configuration - contains all AI-related environment variables
export const aiConfig: AIConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL,
  geminiModel: process.env.GEMINI_MODEL,
  defaultProvider: process.env.DEFAULT_PROVIDER,
}
