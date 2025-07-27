import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIResponse, AIConfig } from '../types.js'
import { APP_CONSTANTS } from '../constants.js'

/**
 * Gemini AI Provider Configuration
 */
export interface GeminiConfig {
  readonly apiKey: string
  readonly model: string
}

/**
 * Gemini Provider Factory
 */
export const createGeminiProvider = (config: AIConfig): AIProvider => {
  const geminiConfig: GeminiConfig = {
    apiKey: config.geminiApiKey as string,
    model: 'gemini-2.0-flash',
  }

  /**
   * Check if Gemini provider is available
   */
  const isAvailable = (): boolean => {
    return !!geminiConfig.apiKey
  }

  /**
   * Initialize Gemini AI client
   */
  const createClient = (): GoogleGenerativeAI => {
    if (!isAvailable()) {
      throw new Error(APP_CONSTANTS.ERRORS.GEMINI_API_ERROR)
    }
    return new GoogleGenerativeAI(geminiConfig.apiKey)
  }

  /**
   * Generate content using Gemini AI
   */
  const generateContent = async (prompt: string): Promise<AIResponse> => {
    try {
      const genAI = createClient()
      const model = genAI.getGenerativeModel({ model: geminiConfig.model })
      const result = await model.generateContent(prompt)

      return {
        text: result.response.text().trim(),
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`Gemini API error: ${errorMessage}`)
    }
  }

  return {
    name: 'Gemini',
    isAvailable,
    generateContent,
  }
}
