import { AI_CONSTANTS } from './constants.js'
import type {
  AIProvider,
  AIResponse,
  AIConfig,
  ProviderManagerConfig,
} from './types.js'
import { createGeminiProvider } from './providers/gemini.js'
import { createOpenAIProvider } from './providers/openai.js'
import chalk from 'chalk'

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
            AI_CONSTANTS.INFO.USING_DEFAULT_PROVIDER.replace(
              '{provider}',
              defaultProvider.name
            )
          )
          const result = await defaultProvider.generateContent(prompt)
          console.log(
            AI_CONSTANTS.INFO.PROVIDER_SUCCESS.replace(
              '{provider}',
              defaultProvider.name
            )
          )
          return result
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          console.log(
            chalk.red(
              `${AI_CONSTANTS.INFO.PROVIDER_FAILED.replace('{provider}', defaultProvider.name)} ${errorMessage}`
            )
          )

          // Try other providers (excluding the default one)
          const fallbackProviders = managerConfig.providers.filter(
            p => p.name.toLowerCase() !== config.defaultProvider?.toLowerCase()
          )

          for (const provider of fallbackProviders) {
            try {
              console.log(
                AI_CONSTANTS.INFO.FALLBACK_TO_PROVIDER.replace(
                  '{provider}',
                  provider.name
                )
              )
              const result = await provider.generateContent(prompt)
              console.log(
                AI_CONSTANTS.INFO.PROVIDER_SUCCESS.replace(
                  '{provider}',
                  provider.name
                )
              )
              return result
            } catch (fallbackError) {
              const fallbackErrorMessage =
                fallbackError instanceof Error
                  ? fallbackError.message
                  : String(fallbackError)
              console.log(
                chalk.red(
                  `${AI_CONSTANTS.INFO.PROVIDER_FAILED.replace('{provider}', provider.name)} ${fallbackErrorMessage}`
                )
              )
            }
          }

          console.log(chalk.red(AI_CONSTANTS.INFO.ALL_PROVIDERS_FAILED))
          throw new Error(AI_CONSTANTS.ERRORS.ALL_PROVIDERS_FAILED)
        }
      }
    }

    // No default provider or default provider not found, try all providers
    for (const provider of managerConfig.providers) {
      try {
        console.log(
          AI_CONSTANTS.INFO.FALLBACK_TO_PROVIDER.replace(
            '{provider}',
            provider.name
          )
        )
        const result = await provider.generateContent(prompt)
        console.log(
          AI_CONSTANTS.INFO.PROVIDER_SUCCESS.replace(
            '{provider}',
            provider.name
          )
        )
        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.log(
          chalk.red(
            `${AI_CONSTANTS.INFO.PROVIDER_FAILED.replace('{provider}', provider.name)} ${errorMessage}`
          )
        )
      }
    }

    console.log(chalk.red(AI_CONSTANTS.INFO.ALL_PROVIDERS_FAILED))
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
