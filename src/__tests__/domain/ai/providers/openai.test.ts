import { createOpenAIProvider } from '../../../../domain/ai/providers/openai.js'
import { AI_CONSTANTS } from '../../../../domain/ai/constants.js'
import type { AIConfig } from '../../../../domain/ai/types.js'

// Mock OpenAI SDK
jest.mock('openai')
import OpenAI from 'openai'

const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('OpenAI Provider', () => {
  let mockCreate: jest.MockedFunction<any>

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock for the create method
    mockCreate = jest.fn()

    // Mock the OpenAI constructor to return an object with our mocked methods
    MockedOpenAI.mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        }) as any
    )
  })

  describe('createOpenAIProvider', () => {
    it('should create provider with valid API key', () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }

      const provider = createOpenAIProvider(config)

      expect(provider.name).toBe('OpenAI')
      expect(provider.isAvailable()).toBe(true)
    })

    it('should create provider without API key', () => {
      const config: AIConfig = {}

      const provider = createOpenAIProvider(config)

      expect(provider.name).toBe('OpenAI')
      expect(provider.isAvailable()).toBe(false)
    })

    it('should create provider with empty API key', () => {
      const config: AIConfig = {
        openaiApiKey: '',
      }

      const provider = createOpenAIProvider(config)

      expect(provider.name).toBe('OpenAI')
      expect(provider.isAvailable()).toBe(false)
    })
  })

  describe('isAvailable', () => {
    it('should return true when API key is provided', () => {
      const config: AIConfig = {
        openaiApiKey: 'sk-test123',
      }

      const provider = createOpenAIProvider(config)

      expect(provider.isAvailable()).toBe(true)
    })

    it('should return false when API key is not provided', () => {
      const config: AIConfig = {}

      const provider = createOpenAIProvider(config)

      expect(provider.isAvailable()).toBe(false)
    })

    it('should return false when API key is undefined', () => {
      const config: AIConfig = {
        openaiApiKey: undefined,
      }

      const provider = createOpenAIProvider(config)

      expect(provider.isAvailable()).toBe(false)
    })
  })

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const testPrompt = 'Generate a PR description'
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated PR description content',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)
      const result = await provider.generateContent(testPrompt)

      expect(result).toEqual({
        text: 'Generated PR description content',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        model: AI_CONSTANTS.MODELS.OPENAI.DEFAULT,
        messages: [{ role: 'user', content: testPrompt }],
        temperature: AI_CONSTANTS.MODELS.OPENAI.TEMPERATURE,
      })
    })

    it('should trim whitespace from response content', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const mockResponse = {
        choices: [
          {
            message: {
              content: '  \n  Generated content with whitespace  \n  ',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)
      const result = await provider.generateContent('test prompt')

      expect(result.text).toBe('Generated content with whitespace')
    })

    it('should throw error when API key is not available', async () => {
      const config: AIConfig = {}

      const provider = createOpenAIProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        AI_CONSTANTS.ERRORS.OPENAI_API_ERROR
      )

      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should throw error when no response content', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        AI_CONSTANTS.ERRORS.NO_RESPONSE_OPENAI
      )
    })

    it('should throw error when no choices in response', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const mockResponse = {
        choices: [],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        AI_CONSTANTS.ERRORS.NO_RESPONSE_OPENAI
      )
    })

    it('should handle OpenAI API errors', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const apiError = new Error('Rate limit exceeded')

      mockCreate.mockRejectedValue(apiError)

      const provider = createOpenAIProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        'OpenAI API error: Rate limit exceeded'
      )
    })

    it('should handle non-Error exceptions', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }

      mockCreate.mockRejectedValue('String error')

      const provider = createOpenAIProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        'OpenAI API error: String error'
      )
    })

    it('should create OpenAI client with correct API key', async () => {
      const config: AIConfig = {
        openaiApiKey: 'sk-test-key-123',
      }
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Response content',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)
      await provider.generateContent('test prompt')

      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'sk-test-key-123',
      })
    })

    it('should use correct model and temperature from constants', async () => {
      const config: AIConfig = {
        openaiApiKey: 'test-api-key',
      }
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Response content',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const provider = createOpenAIProvider(config)
      await provider.generateContent('test prompt')

      expect(mockCreate).toHaveBeenCalledWith({
        model: AI_CONSTANTS.MODELS.OPENAI.DEFAULT,
        messages: [{ role: 'user', content: 'test prompt' }],
        temperature: AI_CONSTANTS.MODELS.OPENAI.TEMPERATURE,
      })
    })
  })
})
