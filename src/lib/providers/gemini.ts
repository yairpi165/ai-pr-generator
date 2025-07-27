import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, AIResponse, AIConfig } from '../types.js'
import { APP_CONSTANTS } from '../constants.js'

export class GeminiProvider implements AIProvider {
  private genAI?: GoogleGenerativeAI
  readonly name = 'Gemini'

  constructor(private config: AIConfig) {
    if (this.isAvailable()) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey as string)
    }
  }

  isAvailable(): boolean {
    return !!this.config.geminiApiKey
  }

  async generateContent(prompt: string): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error(APP_CONSTANTS.ERRORS.GEMINI_API_ERROR)
    }

    if (!this.genAI) {
      throw new Error(APP_CONSTANTS.ERRORS.GEMINI_API_ERROR)
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      })
      const result = await model.generateContent(prompt)
      return {
        text: result.response.text().trim(),
      }
    } catch (error) {
      throw new Error(
        `Gemini API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}
