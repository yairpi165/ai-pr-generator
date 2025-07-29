/**
 * AI Response interface
 */
export type AIResponse = {
  text: string
}

/**
 * AI Configuration
 */
export type AIConfig = {
  openaiApiKey?: string
  geminiApiKey?: string
  openaiModel?: string
  geminiModel?: string
  defaultProvider?: string
}

/**
 * AI Provider interface
 */
export type AIProvider = {
  /**
   * Name of the provider
   */
  readonly name: string

  /**
   * Whether this provider is available (has API key)
   */
  isAvailable(): boolean

  /**
   * Generate content using the provider
   */
  generateContent(prompt: string): Promise<AIResponse>
}

/**
 * Provider Manager Configuration
 */
export type ProviderManagerConfig = {
  readonly providers: AIProvider[]
  readonly fallbackEnabled: boolean
}

/**
 * Provider Manager interface
 */
export type ProviderManager = {
  hasAvailableProviders(): boolean
  getAvailableProviders(): AIProvider[]
  getDefaultProvider(): string | null
  generateContent(prompt: string): Promise<AIResponse>
  generateContentWithProvider(
    providerName: string,
    prompt: string
  ): Promise<AIResponse>
}

/**
 * Gemini AI Provider Configuration
 */
export type GeminiConfig = {
  readonly apiKey: string
  readonly model: string
}

/**
 * OpenAI Provider Configuration
 */
export type OpenAIConfig = {
  readonly apiKey: string
  readonly model: string
  readonly temperature: number
}
