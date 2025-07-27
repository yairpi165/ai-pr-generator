import { AIProvider, AIConfig, AIResponse } from '../types.js'
import { GeminiProvider } from './gemini.js'
import { OpenAIProvider } from './openai.js'
import { APP_CONSTANTS } from '../constants.js'

export class AIProviderManager {
  private providers: AIProvider[] = []
  private currentProvider?: AIProvider

  constructor(config: AIConfig) {
    // Add providers in order of preference
    this.providers = [
      new OpenAIProvider(config), // Try GPT-4 first
      new GeminiProvider(config), // Fallback to Gemini
    ]

    // Find first available provider
    this.currentProvider = this.providers.find(p => p.isAvailable())
  }

  /**
   * Get the current active provider
   */
  getCurrentProvider(): AIProvider | undefined {
    return this.currentProvider
  }

  /**
   * List all available providers
   */
  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(p => p.isAvailable())
  }

  /**
   * Set a specific provider by name
   */
  setProvider(name: string): boolean {
    const provider = this.providers.find(
      p => p.name === name && p.isAvailable()
    )
    if (provider) {
      this.currentProvider = provider
      return true
    }
    return false
  }

  /**
   * Generate content using the current provider
   * If the current provider fails, try the next available one
   */
  async generateContent(prompt: string): Promise<AIResponse> {
    const availableProviders = this.getAvailableProviders()

    if (availableProviders.length === 0) {
      throw new Error(APP_CONSTANTS.ERRORS.NO_AI_PROVIDERS)
    }

    // Start with current provider if available
    if (this.currentProvider && this.currentProvider.isAvailable()) {
      try {
        return await this.currentProvider.generateContent(prompt)
      } catch (error) {
        console.warn(
          APP_CONSTANTS.INFO.PROVIDER_FAILED.replace(
            '{provider}',
            this.currentProvider.name
          ),
          error
        )
        // Continue to try other providers
      }
    }

    // Try each available provider in order
    for (const provider of availableProviders) {
      if (provider === this.currentProvider) continue // Skip current provider as we already tried it

      try {
        const result = await provider.generateContent(prompt)
        this.currentProvider = provider // Update current provider to the successful one
        return result
      } catch (error) {
        console.warn(
          APP_CONSTANTS.INFO.PROVIDER_FAILED.replace(
            '{provider}',
            provider.name
          ),
          error
        )
        continue
      }
    }

    throw new Error(APP_CONSTANTS.ERRORS.ALL_PROVIDERS_FAILED)
  }
}
