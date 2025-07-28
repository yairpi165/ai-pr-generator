/**
 * AI module constants
 */
export const AI_CONSTANTS = {
  // Error messages
  ERRORS: {
    GEMINI_API_ERROR: 'Gemini API key not configured',
    OPENAI_API_ERROR: 'OpenAI API key not configured',
    NO_AI_PROVIDERS:
      'No AI providers available. Please configure at least one API key.',
    ALL_PROVIDERS_FAILED:
      'All available AI providers failed to generate content.',
    NO_RESPONSE_OPENAI: 'No response from OpenAI',
  },

  // Info messages
  INFO: {
    PROVIDER_FAILED: '❌ Provider {provider} failed:',
    TRYING_NEXT_PROVIDER: 'Trying next available provider...',
    USING_DEFAULT_PROVIDER: 'Using default provider: {provider}',
    FALLBACK_TO_PROVIDER: 'Falling back to: {provider}',
    PROVIDER_SUCCESS: '✅ Successfully generated content with {provider}',
    ALL_PROVIDERS_FAILED:
      '❌ All available AI providers failed to generate content.',
  },

  // API endpoints
  API_ENDPOINTS: {
    OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
    GEMINI_GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models',
  },

  // Base URLs
  BASE_URLS: {
    OPENAI: 'https://api.openai.com',
    GEMINI: 'https://generativelanguage.googleapis.com',
  },

  // Model configurations
  MODELS: {
    GEMINI: {
      DEFAULT: 'gemini-2.0-flash',
    },
    OPENAI: {
      DEFAULT: 'gpt-4o-mini',
      TEMPERATURE: 0.3,
    },
  },
} as const
