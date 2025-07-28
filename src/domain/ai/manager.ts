import { AI_CONSTANTS } from './constants.js'
import type {
  AIProvider,
  AIResponse,
  AIConfig,
  ProviderManagerConfig,
} from './types.js'
import { createGeminiProvider } from './providers/gemini.js'
import { createOpenAIProvider } from './providers/openai.js'

/**
 * Provider Manager Factory
 */
export const createProviderManager = (config: AIConfig) => {
  const providers = [
    createOpenAIProvider(config),
    createGeminiProvider(config),
  ].filter(provider => provider.isAvailable())

  const managerConfig: ProviderManagerConfig = {
    providers,
    fallbackEnabled: true,
  }

  /**
   * Check if any providers are available
   */
  const hasAvailableProviders = (): boolean => {
    return managerConfig.providers.length > 0
  }

  /**
   * Get available providers
   */
  const getAvailableProviders = (): AIProvider[] => {
    return [...managerConfig.providers]
  }

  /**
   * Generate content using the preferred provider or fallback
   */
  const generateContent = async (prompt: string): Promise<AIResponse> => {
    if (!hasAvailableProviders()) {
      throw new Error(AI_CONSTANTS.ERRORS.NO_AI_PROVIDERS)
    }

    // If default provider is specified, try it first
    if (config.defaultProvider) {
      const defaultProvider = managerConfig.providers.find(
        p => p.name.toLowerCase() === config.defaultProvider?.toLowerCase()
      )

      if (defaultProvider) {
        try {
          console.log(
            `${AI_CONSTANTS.INFO.TRYING_NEXT_PROVIDER} ${defaultProvider.name}`
          )
          return await defaultProvider.generateContent(prompt)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          console.log(
            `${AI_CONSTANTS.INFO.PROVIDER_FAILED} ${defaultProvider.name}: ${errorMessage}`
          )

          if (!managerConfig.fallbackEnabled) {
            throw error instanceof Error ? error : new Error(String(error))
          }
        }
      }
    }

    // Fallback to all providers in order
    let lastError: Error | null = null

    for (const provider of managerConfig.providers) {
      try {
        console.log(
          `${AI_CONSTANTS.INFO.TRYING_NEXT_PROVIDER} ${provider.name}`
        )
        return await provider.generateContent(prompt)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.log(
          `${AI_CONSTANTS.INFO.PROVIDER_FAILED} ${provider.name}: ${lastError.message}`
        )

        if (!managerConfig.fallbackEnabled) {
          throw lastError
        }
      }
    }

    throw new Error(AI_CONSTANTS.ERRORS.ALL_PROVIDERS_FAILED)
  }

  /**
   * Generate content with a specific provider
   */
  const generateContentWithProvider = async (
    providerName: string,
    prompt: string
  ): Promise<AIResponse> => {
    const provider = managerConfig.providers.find(p => p.name === providerName)

    if (!provider) {
      throw new Error(`Provider '${providerName}' not found or not available`)
    }

    return provider.generateContent(prompt)
  }

  return {
    hasAvailableProviders,
    getAvailableProviders,
    generateContent,
    generateContentWithProvider,
  }
}

/**
 * Type for the provider manager
 */
export type ProviderManager = ReturnType<typeof createProviderManager>
