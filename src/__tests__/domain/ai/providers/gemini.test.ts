import { createGeminiProvider } from '../../../../domain/ai/providers/gemini.js'
import { AI_CONSTANTS } from '../../../../domain/ai/constants.js'
import type { AIConfig } from '../../../../domain/ai/types.js'

// Mock Google Generative AI SDK
jest.mock('@google/generative-ai')
import { GoogleGenerativeAI } from '@google/generative-ai'

const MockedGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<
  typeof GoogleGenerativeAI
>

describe('Gemini Provider', () => {
  let mockGenerateContent: jest.MockedFunction<any>
  let mockGetGenerativeModel: jest.MockedFunction<any>
  let mockGoogleAIInstance: jest.Mocked<GoogleGenerativeAI>

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock methods
    mockGenerateContent = jest.fn()
    mockGetGenerativeModel = jest.fn()

    // Create mock GoogleGenerativeAI instance
    mockGoogleAIInstance = {
      getGenerativeModel: mockGetGenerativeModel,
    } as any

    // Setup mock getGenerativeModel to return object with generateContent
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    })

    // Make the GoogleGenerativeAI constructor return our mock instance
    MockedGoogleGenerativeAI.mockImplementation(() => mockGoogleAIInstance)
  })

  describe('createGeminiProvider', () => {
    it('should create provider with valid API key', () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }

      const provider = createGeminiProvider(config)

      expect(provider.name).toBe('Gemini')
      expect(provider.isAvailable()).toBe(true)
    })

    it('should create provider without API key', () => {
      const config: AIConfig = {}

      const provider = createGeminiProvider(config)

      expect(provider.name).toBe('Gemini')
      expect(provider.isAvailable()).toBe(false)
    })

    it('should create provider with empty API key', () => {
      const config: AIConfig = {
        geminiApiKey: '',
      }

      const provider = createGeminiProvider(config)

      expect(provider.name).toBe('Gemini')
      expect(provider.isAvailable()).toBe(false)
    })
  })

  describe('isAvailable', () => {
    it('should return true when API key is provided', () => {
      const config: AIConfig = {
        geminiApiKey: 'AIzaSy-test-key',
      }

      const provider = createGeminiProvider(config)

      expect(provider.isAvailable()).toBe(true)
    })

    it('should return false when API key is not provided', () => {
      const config: AIConfig = {}

      const provider = createGeminiProvider(config)

      expect(provider.isAvailable()).toBe(false)
    })

    it('should return false when API key is undefined', () => {
      const config: AIConfig = {
        geminiApiKey: undefined,
      }

      const provider = createGeminiProvider(config)

      expect(provider.isAvailable()).toBe(false)
    })
  })

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const testPrompt = 'Generate a PR description'
      const mockResponse = {
        response: {
          text: () => 'Generated PR description content',
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)
      const result = await provider.generateContent(testPrompt)

      expect(result).toEqual({
        text: 'Generated PR description content',
      })

      expect(MockedGoogleGenerativeAI).toHaveBeenCalledWith('test-api-key')
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: AI_CONSTANTS.MODELS.GEMINI.DEFAULT,
      })
      expect(mockGenerateContent).toHaveBeenCalledWith(testPrompt)
    })

    it('should trim whitespace from response content', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const mockResponse = {
        response: {
          text: () => '  \n  Generated content with whitespace  \n  ',
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)
      const result = await provider.generateContent('test prompt')

      expect(result.text).toBe('Generated content with whitespace')
    })

    it('should throw error when API key is not available', async () => {
      const config: AIConfig = {}

      const provider = createGeminiProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        AI_CONSTANTS.ERRORS.GEMINI_API_ERROR
      )

      expect(mockGenerateContent).not.toHaveBeenCalled()
    })

    it('should handle Gemini API errors', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const apiError = new Error('API quota exceeded')

      mockGenerateContent.mockRejectedValue(apiError)

      const provider = createGeminiProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        'Gemini API error: API quota exceeded'
      )
    })

    it('should handle non-Error exceptions', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }

      mockGenerateContent.mockRejectedValue('String error')

      const provider = createGeminiProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        'Gemini API error: String error'
      )
    })

    it('should create GoogleGenerativeAI client with correct API key', async () => {
      const config: AIConfig = {
        geminiApiKey: 'AIzaSy-test-key-123',
      }
      const mockResponse = {
        response: {
          text: () => 'Response content',
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)
      await provider.generateContent('test prompt')

      expect(MockedGoogleGenerativeAI).toHaveBeenCalledWith(
        'AIzaSy-test-key-123'
      )
    })

    it('should use correct model from constants', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const mockResponse = {
        response: {
          text: () => 'Response content',
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)
      await provider.generateContent('test prompt')

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: AI_CONSTANTS.MODELS.GEMINI.DEFAULT,
      })
    })

    it('should handle response.text() returning empty string', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const mockResponse = {
        response: {
          text: () => '',
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)
      const result = await provider.generateContent('test prompt')

      expect(result.text).toBe('')
    })

    it('should handle response.text() throwing an error', async () => {
      const config: AIConfig = {
        geminiApiKey: 'test-api-key',
      }
      const mockResponse = {
        response: {
          text: () => {
            throw new Error('Text extraction failed')
          },
        },
      }

      mockGenerateContent.mockResolvedValue(mockResponse)

      const provider = createGeminiProvider(config)

      await expect(provider.generateContent('test prompt')).rejects.toThrow(
        'Gemini API error: Text extraction failed'
      )
    })
  })
})
