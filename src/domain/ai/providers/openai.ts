import OpenAI from 'openai'
import { AI_CONSTANTS } from '../constants.js'
import type {
  AIProvider,
  AIResponse,
  AIConfig,
  OpenAIConfig,
} from '../types.js'

/**
 * OpenAI Provider Factory
 */
export const createOpenAIProvider = (config: AIConfig): AIProvider => {
  const openAIConfig: OpenAIConfig = {
    apiKey: config.openaiApiKey as string,
    model: AI_CONSTANTS.MODELS.OPENAI.DEFAULT,
    temperature: AI_CONSTANTS.MODELS.OPENAI.TEMPERATURE,
  }

  /**
   * Check if OpenAI provider is available
   */
  const isAvailable = (): boolean => {
    return !!openAIConfig.apiKey
  }

  /**
   * Initialize OpenAI client
   */
  const createClient = (): OpenAI => {
    if (!isAvailable()) {
      throw new Error(AI_CONSTANTS.ERRORS.OPENAI_API_ERROR)
    }
    return new OpenAI({ apiKey: openAIConfig.apiKey })
  }

  /**
   * Generate content using OpenAI
   */
  const generateContent = async (prompt: string): Promise<AIResponse> => {
    try {
      const openai = createClient()
      const completion = await openai.chat.completions.create({
        model: openAIConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: openAIConfig.temperature,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error(AI_CONSTANTS.ERRORS.NO_RESPONSE_OPENAI)
      }

      return {
        text: content.trim(),
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`OpenAI API error: ${errorMessage}`)
    }
  }

  return {
    name: 'OpenAI',
    isAvailable,
    generateContent,
  }
}
