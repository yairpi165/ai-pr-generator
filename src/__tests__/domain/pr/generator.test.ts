// Mock all dependencies before importing
const mockGetOutputPath = jest.fn()
const mockAiConfig = jest.fn()
const mockGenerateDiff = jest.fn()
const mockCreateProviderManager = jest.fn()

// Mock config dependencies first to prevent import.meta.url issues
jest.mock('../../../domain/config/paths.js', () => ({
  getProjectRoot: jest.fn(() => '/test/project'),
  getProjectPath: jest.fn((path: string) => `/test/project/${path}`),
  getEnvPath: jest.fn(() => '/test/project/.env'),
  getOutputPath: jest.fn(() => '/test/project/pr-description.md'),
}))

jest.mock('../../../domain/config/index.js', () => ({
  getOutputPath: mockGetOutputPath,
  aiConfig: mockAiConfig,
}))

jest.mock('../../../domain/git/index.js', () => ({
  generateDiff: mockGenerateDiff,
}))

jest.mock('../../../domain/ai/index.js', () => ({
  createProviderManager: mockCreateProviderManager,
}))

// Import after mocking
import {
  generatePRDescription,
  savePRToFile,
  getCurrentProvider,
  createPRGenerator,
} from '../../../domain/pr/generator.js'
import fs from 'fs'
import type { AIConfig, ProviderManager } from '../../../domain/ai/types.js'

const mockFs = fs as jest.Mocked<typeof fs>

describe('PR Generator', () => {
  const mockProviderManager: jest.Mocked<ProviderManager> = {
    hasAvailableProviders: jest.fn(),
    getAvailableProviders: jest.fn(),
    generateContent: jest.fn(),
    generateContentWithProvider: jest.fn(),
    getDefaultProvider: jest.fn(),
  }

  const mockDiff = `diff --git a/src/feature.ts b/src/feature.ts
index abc123..def456 100644
--- a/src/feature.ts
+++ b/src/feature.ts
@@ -1,3 +1,4 @@
export const feature = () => {
+  // New implementation
  return 'enhanced feature'
 }`

  const mockTitleResponse = { text: 'Add enhanced feature functionality' }
  const mockDescriptionResponse = {
    text: `## 🧠 Summary
This PR enhances the feature functionality with improved implementation.

## ✅ Changes
- Updated feature function with new implementation
- Added documentation comments
- Improved code readability`,
  }

  const mockAiConfigValue: AIConfig = { openaiApiKey: 'test-key' }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    mockGetOutputPath.mockReturnValue('/test/project/pr-description.md')
    mockAiConfig.mockReturnValue(mockAiConfigValue)
    mockCreateProviderManager.mockReturnValue(mockProviderManager)
    mockProviderManager.hasAvailableProviders.mockReturnValue(true)
    mockProviderManager.getAvailableProviders.mockReturnValue([
      { name: 'OpenAI', isAvailable: () => true, generateContent: jest.fn() },
    ])
    mockGenerateDiff.mockReturnValue(mockDiff)

    // Reset fs mock to default behavior
    mockFs.writeFileSync.mockImplementation(() => {})
  })

  describe('createPRGenerator', () => {
    it('should create PR generator configuration', () => {
      const config = createPRGenerator()

      expect(config).toHaveProperty('aiManager')
      expect(config).toHaveProperty('outputPath')
      expect(mockCreateProviderManager).toHaveBeenCalledWith(mockAiConfig)
    })

    it('should throw error when no AI providers available', () => {
      mockProviderManager.hasAvailableProviders.mockReturnValue(false)

      expect(() => createPRGenerator()).toThrow(
        'No AI providers available. Please configure either OPENAI_API_KEY or GEMINI_API_KEY in your .env file.'
      )
    })

    it('should validate AI provider availability', () => {
      createPRGenerator()

      expect(mockProviderManager.hasAvailableProviders).toHaveBeenCalled()
    })
  })

  describe('generatePRDescription', () => {
    beforeEach(() => {
      // Reset mocks for each test
      mockProviderManager.generateContent.mockReset()
    })

    it('should generate PR with provided title', async () => {
      // Mock only description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'feat',
        'Add new feature',
        'PROJ-123',
        'This adds a new feature to the app'
      )

      expect(result).toEqual({
        title: 'feat(PROJ-123): Add new feature',
        body: mockDescriptionResponse.text,
        fullDescription: `# 🔖 feat(PROJ-123): Add new feature\n\n${mockDescriptionResponse.text}`,
      })
      expect(mockGenerateDiff).toHaveBeenCalled()
      expect(mockProviderManager.generateContent).toHaveBeenCalledTimes(1) // Only description, not title
    })

    it('should generate PR with AI-generated title when title not provided', async () => {
      // Mock both title and description generation
      mockProviderManager.generateContent
        .mockResolvedValueOnce(mockTitleResponse) // For title generation
        .mockResolvedValueOnce(mockDescriptionResponse) // For description generation

      const result = await generatePRDescription(
        'feat',
        '',
        'PROJ-123',
        'This adds a new feature'
      )

      expect(result.title).toBe(
        'feat(PROJ-123): Add enhanced feature functionality'
      )
      expect(mockProviderManager.generateContent).toHaveBeenCalledTimes(2) // Both title and description
    })

    it('should parse title with ticket from colon-separated format', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'fix',
        'PROJ-456: Fix critical bug',
        '',
        'Bug fix explanation'
      )

      expect(result.title).toBe('fix(PROJ-456): Fix critical bug')
    })

    it('should handle title without ticket', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'refactor',
        'Improve code structure',
        '',
        'Refactoring explanation'
      )

      expect(result.title).toBe('refactor: Improve code structure')
    })

    it('should use ticket parameter over parsed ticket', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'feat',
        'OLD-123: Add feature',
        'NEW-456',
        'Feature explanation'
      )

      expect(result.title).toBe('feat(NEW-456): Add feature')
    })

    it('should handle single word input as ticket', async () => {
      // Mock both title and description generation since single word is treated as ticket
      mockProviderManager.generateContent
        .mockResolvedValueOnce(mockTitleResponse) // For title generation
        .mockResolvedValueOnce(mockDescriptionResponse) // For description generation

      const result = await generatePRDescription(
        'feat',
        'PROJ-789',
        '',
        'Feature explanation'
      )

      // Should generate AI title since single word is treated as ticket
      expect(result.title).toBe(
        'feat(PROJ-789): Add enhanced feature functionality'
      )
      expect(mockProviderManager.generateContent).toHaveBeenCalledTimes(2)
    })

    it('should remove quotes from AI-generated title', async () => {
      mockProviderManager.generateContent
        .mockResolvedValueOnce({ text: '"Add enhanced feature"' })
        .mockResolvedValueOnce(mockDescriptionResponse)

      const result = await generatePRDescription('feat', '', '', 'explanation')

      expect(result.title).toBe('feat: Add enhanced feature')
    })

    it('should handle empty explanation', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'fix',
        'Fix bug',
        'BUG-123',
        ''
      )

      expect(result.title).toBe('fix(BUG-123): Fix bug')
      expect(mockProviderManager.generateContent).toHaveBeenCalled()
    })

    it('should build correct prompts for AI generation', async () => {
      // Mock both title and description generation
      mockProviderManager.generateContent
        .mockResolvedValueOnce(mockTitleResponse) // For title generation
        .mockResolvedValueOnce(mockDescriptionResponse) // For description generation

      await generatePRDescription('feat', '', '', 'Add new functionality')

      // Check title prompt
      const titleCall = mockProviderManager.generateContent.mock.calls[0][0]
      expect(titleCall).toContain('senior software engineer')
      expect(titleCall).toContain('pull request')
      expect(titleCall).toContain('Add new functionality')
      expect(titleCall).toContain(mockDiff)

      // Check description prompt
      const descCall = mockProviderManager.generateContent.mock.calls[1][0]
      expect(descCall).toContain('🧠 Summary')
      expect(descCall).toContain('✅ Changes')
      expect(descCall).toContain('Add new functionality')
      expect(descCall).toContain(mockDiff)
    })

    it('should handle different PR types', async () => {
      // Mock description generation since titles are provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const prTypes = ['feat', 'fix', 'refactor', 'docs', 'chore']

      for (const prType of prTypes) {
        const result = await generatePRDescription(
          prType,
          'Test title',
          '',
          'Test explanation'
        )
        expect(result.title).toMatch(new RegExp(`^${prType}:`))
      }
    })

    it('should handle AI provider errors gracefully', async () => {
      // Mock the first call (title generation) to fail
      mockProviderManager.generateContent.mockRejectedValueOnce(
        new Error('AI provider failed')
      )

      await expect(
        generatePRDescription('feat', '', '', 'explanation')
      ).rejects.toThrow('AI provider failed')
    })

    it('should handle git diff errors', async () => {
      mockGenerateDiff.mockImplementation(() => {
        throw new Error('No git repository')
      })

      await expect(
        generatePRDescription('feat', 'title', '', 'explanation')
      ).rejects.toThrow('No git repository')
    })

    it('should trim whitespace from AI responses', async () => {
      mockProviderManager.generateContent
        .mockResolvedValueOnce({ text: '  Trimmed Title  ' })
        .mockResolvedValueOnce({ text: '  \n  Trimmed Description  \n  ' })

      const result = await generatePRDescription('feat', '', '', 'explanation')

      expect(result.title).toBe('feat: Trimmed Title')
      expect(result.body).toBe('Trimmed Description')
    })
  })

  describe('savePRToFile', () => {
    it('should save PR content to file', () => {
      const content = '# PR Title\n\nPR description content'

      const result = savePRToFile(content)

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/pr-description.md',
        content,
        'utf8'
      )
      expect(result).toBe('/test/project/pr-description.md')
    })

    it('should handle file writing errors', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      expect(() => savePRToFile('content')).toThrow('Permission denied')
    })

    it('should save empty content', () => {
      const result = savePRToFile('')

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/pr-description.md',
        '',
        'utf8'
      )
      expect(result).toBe('/test/project/pr-description.md')
    })

    it('should handle large content', () => {
      const largeContent = 'A'.repeat(10000)

      const result = savePRToFile(largeContent)

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/pr-description.md',
        largeContent,
        'utf8'
      )
      expect(result).toBe('/test/project/pr-description.md')
    })
  })

  describe('getCurrentProvider', () => {
    it('should return default provider when configured', () => {
      mockProviderManager.getDefaultProvider = jest
        .fn()
        .mockReturnValue('OpenAI')
      mockProviderManager.getAvailableProviders.mockReturnValue([
        { name: 'OpenAI', isAvailable: () => true, generateContent: jest.fn() },
        { name: 'Gemini', isAvailable: () => true, generateContent: jest.fn() },
      ])

      const provider = getCurrentProvider()

      expect(provider).toBe('OpenAI')
      expect(mockProviderManager.getDefaultProvider).toHaveBeenCalled()
    })

    it('should return first available provider when no default is configured', () => {
      mockProviderManager.getDefaultProvider = jest.fn().mockReturnValue(null)
      mockProviderManager.getAvailableProviders.mockReturnValue([
        { name: 'Gemini', isAvailable: () => true, generateContent: jest.fn() },
        { name: 'OpenAI', isAvailable: () => true, generateContent: jest.fn() },
      ])

      const provider = getCurrentProvider()

      expect(provider).toBe('Gemini')
      expect(mockProviderManager.getDefaultProvider).toHaveBeenCalled()
    })

    it('should return "None" when no providers available', () => {
      mockProviderManager.getDefaultProvider = jest.fn().mockReturnValue(null)
      mockProviderManager.getAvailableProviders.mockReturnValue([])

      const provider = getCurrentProvider()

      expect(provider).toBe('None')
    })

    it('should handle provider manager creation errors', () => {
      mockCreateProviderManager.mockImplementation(() => {
        throw new Error('Failed to create provider manager')
      })

      expect(() => getCurrentProvider()).toThrow(
        'Failed to create provider manager'
      )
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle special characters in title and ticket', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const result = await generatePRDescription(
        'feat',
        'Add special chars: @#$%^&*()',
        'PROJ-123-$',
        'Special chars explanation'
      )

      expect(result.title).toBe('feat(PROJ-123-$): @#$%^&*()')
    })

    it('should handle very long titles', async () => {
      // Mock both title and description generation since single word is treated as ticket
      mockProviderManager.generateContent
        .mockResolvedValueOnce(mockTitleResponse) // For title generation
        .mockResolvedValueOnce(mockDescriptionResponse) // For description generation

      const longTitle = 'A'.repeat(200)

      const result = await generatePRDescription(
        'feat',
        longTitle,
        'PROJ-123',
        'explanation'
      )

      // Since longTitle is a single word without spaces, it's treated as a ticket
      // and an AI title is generated
      expect(result.title).toBe(
        `feat(PROJ-123): Add enhanced feature functionality`
      )
      // Verify that both title and description were generated
      expect(mockProviderManager.generateContent).toHaveBeenCalledTimes(2)
    })

    it('should handle Unicode characters', async () => {
      // Mock description generation since title is provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const unicodeTitle = 'Add émojis and ñ characters 🚀'

      const result = await generatePRDescription(
        'feat',
        unicodeTitle,
        'PROJ-123',
        'Unicode explanation'
      )

      expect(result.title).toBe(`feat(PROJ-123): ${unicodeTitle}`)
    })

    it('should handle empty AI responses', async () => {
      mockProviderManager.generateContent
        .mockResolvedValueOnce({ text: '' })
        .mockResolvedValueOnce({ text: '' })

      const result = await generatePRDescription('feat', '', '', 'explanation')

      expect(result.title).toBe('feat:')
      expect(result.body).toBe('')
    })

    it('should handle malformed title input', async () => {
      // Mock description generation since titles are provided
      mockProviderManager.generateContent.mockResolvedValue(
        mockDescriptionResponse
      )

      const malformedInputs = [':', '::', ': : ', 'PROJ-123:', ':Fix bug']

      for (const input of malformedInputs) {
        const result = await generatePRDescription(
          'fix',
          input,
          '',
          'explanation'
        )
        expect(result.title).toContain('fix')
      }
    })

    it('should use specific provider when provided', async () => {
      const specificProvider = 'openai'
      // Mock generateContentWithProvider method
      mockProviderManager.generateContentWithProvider = jest
        .fn()
        .mockResolvedValueOnce(mockTitleResponse)
        .mockResolvedValueOnce(mockDescriptionResponse)

      const result = await generatePRDescription(
        'feat',
        '',
        '',
        'explanation',
        specificProvider
      )

      expect(
        mockProviderManager.generateContentWithProvider
      ).toHaveBeenCalledTimes(2)
      expect(
        mockProviderManager.generateContentWithProvider
      ).toHaveBeenCalledWith(specificProvider, expect.any(String))
      expect(result.title).toBe('feat: Add enhanced feature functionality')
    })
  })
})
