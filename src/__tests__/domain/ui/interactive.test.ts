// Mock external dependencies at module level
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}))

import { getInteractiveInput } from '../../../domain/ui/interactive.js'
import { PR_CONSTANTS } from '../../../domain/pr/constants.js'
import type { PROptions } from '../../../domain/pr/types.js'
import inquirer from 'inquirer'

const mockInquirer = inquirer as jest.Mocked<typeof inquirer>

describe('UI Interactive Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getInteractiveInput', () => {
    it('should prompt for all required PR options', async () => {
      const mockAnswers: PROptions = {
        prType: 'feat',
        prTitle: 'Add new feature',
        ticket: 'PROJ-123',
        explanation: 'This adds a new feature to the application',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result).toEqual(mockAnswers)
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(1)
    })

    it('should configure correct prompt questions', async () => {
      const mockAnswers: PROptions = {
        prType: 'fix',
        prTitle: '',
        ticket: '',
        explanation: '',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>
      expect(promptCall).toHaveLength(4)

      // Check PR type question
      expect(promptCall[0]).toEqual({
        type: 'list',
        name: 'prType',
        message: '🔧 Select PR type:',
        choices: PR_CONSTANTS.PR_TYPES,
      })

      // Check PR title question
      expect(promptCall[1]).toEqual({
        type: 'input',
        name: 'prTitle',
        message: '📝 Enter PR title (optional):',
        default: '',
      })

      // Check ticket question
      expect(promptCall[2]).toEqual({
        type: 'input',
        name: 'ticket',
        message: '🎫 Enter ticket name (optional):',
        default: '',
      })

      // Check explanation question
      expect(promptCall[3]).toEqual({
        type: 'input',
        name: 'explanation',
        message: '🗒️  Enter short explanation for AI (optional):',
        default: '',
      })
    })

    it('should use PR_CONSTANTS.PR_TYPES for type choices', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>
      const prTypeQuestion = promptCall[0]

      expect(prTypeQuestion.choices).toBe(PR_CONSTANTS.PR_TYPES)
      expect(prTypeQuestion.choices).toContainEqual({
        name: '✨ Feature',
        value: 'feat',
      })
      expect(prTypeQuestion.choices).toContainEqual({
        name: '🐛 Bugfix',
        value: 'fix',
      })
    })

    it('should handle all PR types correctly', async () => {
      const prTypes = ['feat', 'fix', 'refactor', 'docs', 'chore', 'other']

      for (const prType of prTypes) {
        mockInquirer.prompt.mockResolvedValue({
          prType,
          prTitle: 'Test title',
          ticket: 'TEST-123',
          explanation: 'Test explanation',
        })

        const result = await getInteractiveInput()
        expect(result.prType).toBe(prType)
      }
    })

    it('should handle empty optional fields', async () => {
      const mockAnswers: PROptions = {
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result.prTitle).toBe('')
      expect(result.ticket).toBe('')
      expect(result.explanation).toBe('')
    })

    it('should handle all fields filled', async () => {
      const mockAnswers: PROptions = {
        prType: 'refactor',
        prTitle: 'Refactor user authentication module',
        ticket: 'AUTH-456',
        explanation: 'Simplify authentication flow and improve error handling',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result).toEqual(mockAnswers)
      expect(result.prType).toBe('refactor')
      expect(result.prTitle).toBe('Refactor user authentication module')
      expect(result.ticket).toBe('AUTH-456')
      expect(result.explanation).toBe(
        'Simplify authentication flow and improve error handling'
      )
    })

    it('should handle special characters in input', async () => {
      const mockAnswers: PROptions = {
        prType: 'feat',
        prTitle: 'Add émojis and ñ special chars 🚀',
        ticket: 'UNICODE-123',
        explanation:
          'Support for émojis: 🎉 and special characters like ñ, ü, ç',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result.prTitle).toBe('Add émojis and ñ special chars 🚀')
      expect(result.explanation).toBe(
        'Support for émojis: 🎉 and special characters like ñ, ü, ç'
      )
    })

    it('should handle very long input strings', async () => {
      const longTitle = 'A'.repeat(200)
      const longExplanation = 'B'.repeat(1000)

      const mockAnswers: PROptions = {
        prType: 'docs',
        prTitle: longTitle,
        ticket: 'LONG-123',
        explanation: longExplanation,
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result.prTitle).toBe(longTitle)
      expect(result.explanation).toBe(longExplanation)
    })

    it('should handle inquirer prompt errors', async () => {
      const error = new Error('User interrupted')
      mockInquirer.prompt.mockRejectedValue(error)

      await expect(getInteractiveInput()).rejects.toThrow('User interrupted')
    })

    it('should handle unexpected user cancellation', async () => {
      // Simulate user pressing Ctrl+C
      mockInquirer.prompt.mockRejectedValue(
        new Error('User force closed the prompt')
      )

      await expect(getInteractiveInput()).rejects.toThrow(
        'User force closed the prompt'
      )
    })

    it('should use consistent emoji formatting in messages', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>

      expect(promptCall[0].message).toMatch(/^🔧/)
      expect(promptCall[1].message).toMatch(/^📝/)
      expect(promptCall[2].message).toMatch(/^🎫/)
      expect(promptCall[3].message).toMatch(/^🗒️/)
    })

    it('should maintain proper question order', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>

      expect(promptCall[0].name).toBe('prType')
      expect(promptCall[1].name).toBe('prTitle')
      expect(promptCall[2].name).toBe('ticket')
      expect(promptCall[3].name).toBe('explanation')
    })

    it('should use correct input types for questions', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>

      expect(promptCall[0].type).toBe('list') // PR type is a selection
      expect(promptCall[1].type).toBe('input') // Title is text input
      expect(promptCall[2].type).toBe('input') // Ticket is text input
      expect(promptCall[3].type).toBe('input') // Explanation is text input
    })

    it('should set empty string as default for optional fields', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>

      expect(promptCall[1].default).toBe('') // prTitle default
      expect(promptCall[2].default).toBe('') // ticket default
      expect(promptCall[3].default).toBe('') // explanation default
    })

    it('should handle whitespace-only input', async () => {
      const mockAnswers: PROptions = {
        prType: 'feat',
        prTitle: '   ',
        ticket: '  \t  ',
        explanation: ' \n ',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      expect(result.prTitle).toBe('   ')
      expect(result.ticket).toBe('  \t  ')
      expect(result.explanation).toBe(' \n ')
    })

    it('should return proper TypeScript types', async () => {
      const mockAnswers: PROptions = {
        prType: 'feat',
        prTitle: 'Test',
        ticket: 'TEST-1',
        explanation: 'Test explanation',
      }

      mockInquirer.prompt.mockResolvedValue(mockAnswers)

      const result = await getInteractiveInput()

      // TypeScript type checking
      expect(typeof result.prType).toBe('string')
      expect(typeof result.prTitle).toBe('string')
      expect(typeof result.ticket).toBe('string')
      expect(typeof result.explanation).toBe('string')

      // Verify return type matches PROptions interface
      const typedResult: PROptions = result
      expect(typedResult).toBeDefined()
    })

    it('should handle inquirer configuration edge cases', async () => {
      mockInquirer.prompt.mockResolvedValue({
        prType: 'feat',
        prTitle: '',
        ticket: '',
        explanation: '',
      })

      await getInteractiveInput()

      // Verify that prompt was called with an array of questions
      expect(mockInquirer.prompt).toHaveBeenCalledWith(expect.any(Array))

      const promptCall = mockInquirer.prompt.mock
        .calls[0][0] as unknown as Array<{
        type: string
        name: string
        message: string
        choices?: Array<{ name: string; value: string }>
        default?: string
      }>
      expect(Array.isArray(promptCall)).toBe(true)
      expect(promptCall.length).toBe(4)

      // Verify each question has required properties
      promptCall.forEach(
        (question: { type: string; name: string; message: string }) => {
          expect(question).toHaveProperty('type')
          expect(question).toHaveProperty('name')
          expect(question).toHaveProperty('message')
        }
      )
    })
  })
})
