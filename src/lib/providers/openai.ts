import { AIProvider, AIResponse, AIConfig } from '../types.js'
import OpenAI from 'openai'
import { APP_CONSTANTS } from '../constants.js'

export class OpenAIProvider implements AIProvider {
  private openai?: OpenAI
  readonly name = 'GPT-4'

  constructor(private config: AIConfig) {
    if (this.isAvailable()) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      })
    }
  }

  isAvailable(): boolean {
    return !!this.config.openaiApiKey
  }

  async generateContent(prompt: string): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error(APP_CONSTANTS.ERRORS.OPENAI_API_ERROR)
    }

    if (!this.openai) {
      throw new Error(APP_CONSTANTS.ERRORS.OPENAI_API_ERROR)
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })

      const text = completion.choices[0]?.message?.content?.trim()
      if (!text) {
        throw new Error(APP_CONSTANTS.ERRORS.NO_RESPONSE_OPENAI)
      }

      return { text }
    } catch (error) {
      throw new Error(
        `OpenAI API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}
