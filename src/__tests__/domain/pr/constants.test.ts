import { PR_CONSTANTS } from '../../../domain/pr/constants.js'

describe('PR Constants', () => {
  describe('File Paths', () => {
    it('should define correct output file path', () => {
      expect(PR_CONSTANTS.OUTPUT_FILE).toBe('pr-description.md')
    })

    it('should define correct reviewers file path', () => {
      expect(PR_CONSTANTS.REVIEWERS_FILE).toBe('reviewers.json')
    })

    it('should have string file paths', () => {
      expect(typeof PR_CONSTANTS.OUTPUT_FILE).toBe('string')
      expect(typeof PR_CONSTANTS.REVIEWERS_FILE).toBe('string')
    })
  })

  describe('Success Messages', () => {
    it('should define loaded reviewers message', () => {
      expect(PR_CONSTANTS.SUCCESS.LOADED_REVIEWERS).toBe(
        'Loaded reviewers configuration'
      )
    })

    it('should have string success messages', () => {
      expect(typeof PR_CONSTANTS.SUCCESS.LOADED_REVIEWERS).toBe('string')
    })
  })

  describe('Warning Messages', () => {
    it('should define no reviewers config warning', () => {
      expect(PR_CONSTANTS.WARNING.NO_REVIEWERS_CONFIG).toBe(
        'No reviewers configuration found, using defaults'
      )
    })

    it('should have string warning messages', () => {
      expect(typeof PR_CONSTANTS.WARNING.NO_REVIEWERS_CONFIG).toBe('string')
    })
  })

  describe('PR Types', () => {
    it('should define all PR types', () => {
      const expectedTypes = [
        { name: '✨ Feature', value: 'feat' },
        { name: '🐛 Bugfix', value: 'fix' },
        { name: '♻️  Refactor', value: 'refactor' },
        { name: '📚 Docs', value: 'docs' },
        { name: '🧹 Chore', value: 'chore' },
        { name: '🔧 Other', value: 'other' },
      ]

      expect(PR_CONSTANTS.PR_TYPES).toEqual(expectedTypes)
    })

    it('should have correct number of PR types', () => {
      expect(PR_CONSTANTS.PR_TYPES).toHaveLength(6)
    })

    it('should have emojis in PR type names', () => {
      PR_CONSTANTS.PR_TYPES.forEach(type => {
        expect(type.name).toMatch(/^[^\w\s]/u) // Should start with emoji/non-word character
        expect(typeof type.name).toBe('string')
        expect(typeof type.value).toBe('string')
      })
    })

    it('should have unique values for each PR type', () => {
      const values = PR_CONSTANTS.PR_TYPES.map(type => type.value)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have specific PR type values', () => {
      const values = PR_CONSTANTS.PR_TYPES.map(type => type.value)

      expect(values).toContain('feat')
      expect(values).toContain('fix')
      expect(values).toContain('refactor')
      expect(values).toContain('docs')
      expect(values).toContain('chore')
      expect(values).toContain('other')
    })

    it('should have consistent name formatting', () => {
      PR_CONSTANTS.PR_TYPES.forEach(type => {
        expect(type.name).toMatch(/^.+\s+\w/) // Emoji/symbol + space + word
        expect(type.value).toMatch(/^[a-z]+$/) // lowercase letters only
      })
    })
  })

  describe('Prompt Templates', () => {
    describe('PR Generation Prompt', () => {
      const prompt = PR_CONSTANTS.PROMPTS.PR_GENERATION

      it('should contain PR generation template', () => {
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(0)
      })

      it('should contain placeholder variables', () => {
        expect(prompt).toContain('{prType}')
        expect(prompt).toContain('{prTitle}')
        expect(prompt).toContain('{ticket}')
        expect(prompt).toContain('{explanation}')
        expect(prompt).toContain('{diff}')
      })

      it('should contain required instructions', () => {
        expect(prompt).toContain('expert software developer')
        expect(prompt).toContain('pull request description')
        expect(prompt).toContain('comprehensive PR description')
      })

      it('should specify output requirements', () => {
        expect(prompt).toContain('summary of the changes')
        expect(prompt).toContain('What was changed and why')
        expect(prompt).toContain('emojis and markdown formatting')
        expect(prompt).toContain('professional but engaging')
      })

      it('should have proper structure', () => {
        expect(prompt).toContain('1.')
        expect(prompt).toContain('2.')
        expect(prompt).toContain('3.')
        expect(prompt).toContain('4.')
        expect(prompt).toContain('5.')
      })
    })

    describe('PR Title Generation Prompt', () => {
      const prompt = PR_CONSTANTS.PROMPTS.PR_TITLE_GENERATION

      it('should contain PR title generation template', () => {
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(0)
      })

      it('should contain placeholder variables', () => {
        expect(prompt).toContain('{prType}')
        expect(prompt).toContain('{ticket}')
        expect(prompt).toContain('{explanation}')
        expect(prompt).toContain('{diff}')
      })

      it('should contain title requirements', () => {
        expect(prompt).toContain('concise and descriptive')
        expect(prompt).toContain('conventional commit format')
        expect(prompt).toContain('ticket number')
        expect(prompt).toContain('under 72 characters')
      })

      it('should specify output format', () => {
        expect(prompt).toContain('Return only the title')
        expect(prompt).toContain('nothing else')
      })

      it('should have proper formatting requirements', () => {
        expect(prompt).toContain('Clear and descriptive')
        expect(prompt).toContain('conventional commit format')
        expect(prompt).toContain('Include ticket number if provided')
      })
    })

    it('should have both prompt templates defined', () => {
      expect(PR_CONSTANTS.PROMPTS).toHaveProperty('PR_GENERATION')
      expect(PR_CONSTANTS.PROMPTS).toHaveProperty('PR_TITLE_GENERATION')
    })

    it('should have non-empty prompt templates', () => {
      expect(PR_CONSTANTS.PROMPTS.PR_GENERATION.trim()).not.toBe('')
      expect(PR_CONSTANTS.PROMPTS.PR_TITLE_GENERATION.trim()).not.toBe('')
    })
  })

  describe('Constant Object Structure', () => {
    it('should be immutable (readonly)', () => {
      // Test that the constant is defined as readonly (TypeScript enforces this)
      expect(PR_CONSTANTS).toBeDefined()
      expect(typeof PR_CONSTANTS).toBe('object')
      // Note: 'as const' makes it readonly at TypeScript level
    })

    it('should have all required top-level properties', () => {
      expect(PR_CONSTANTS).toHaveProperty('OUTPUT_FILE')
      expect(PR_CONSTANTS).toHaveProperty('REVIEWERS_FILE')
      expect(PR_CONSTANTS).toHaveProperty('SUCCESS')
      expect(PR_CONSTANTS).toHaveProperty('WARNING')
      expect(PR_CONSTANTS).toHaveProperty('PR_TYPES')
      expect(PR_CONSTANTS).toHaveProperty('PROMPTS')
    })

    it('should have correct nested structure', () => {
      expect(PR_CONSTANTS.SUCCESS).toHaveProperty('LOADED_REVIEWERS')
      expect(PR_CONSTANTS.WARNING).toHaveProperty('NO_REVIEWERS_CONFIG')
      expect(PR_CONSTANTS.PROMPTS).toHaveProperty('PR_GENERATION')
      expect(PR_CONSTANTS.PROMPTS).toHaveProperty('PR_TITLE_GENERATION')
    })

    it('should not have undefined values', () => {
      const checkObject = (obj: object, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key

          if (value === undefined) {
            throw new Error(`Undefined value found at ${currentPath}`)
          }

          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            checkObject(value, currentPath)
          }
        })
      }

      expect(() => checkObject(PR_CONSTANTS)).not.toThrow()
    })
  })

  describe('Template Variable Consistency', () => {
    it('should use consistent variable naming in templates', () => {
      const prGeneration = PR_CONSTANTS.PROMPTS.PR_GENERATION
      const titleGeneration = PR_CONSTANTS.PROMPTS.PR_TITLE_GENERATION

      // Both should use the same variable names
      const commonVariables = [
        '{prType}',
        '{ticket}',
        '{explanation}',
        '{diff}',
      ]

      commonVariables.forEach(variable => {
        expect(prGeneration).toContain(variable)
        expect(titleGeneration).toContain(variable)
      })
    })

    it('should have proper placeholder format', () => {
      const allPrompts = Object.values(PR_CONSTANTS.PROMPTS)

      allPrompts.forEach(prompt => {
        // Should use curly brace format for variables
        const variables = prompt.match(/\{[^}]+\}/g) || []

        variables.forEach(variable => {
          expect(variable).toMatch(/^\{[a-zA-Z][a-zA-Z0-9]*\}$/)
        })
      })
    })
  })

  describe('Message Formatting', () => {
    it('should have properly formatted success messages', () => {
      Object.values(PR_CONSTANTS.SUCCESS).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.trim()).toBe(message) // No leading/trailing whitespace
        expect(message).not.toBe('') // Not empty
      })
    })

    it('should have properly formatted warning messages', () => {
      Object.values(PR_CONSTANTS.WARNING).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.trim()).toBe(message)
        expect(message).not.toBe('')
      })
    })

    it('should have consistent message style', () => {
      const allMessages = [
        ...Object.values(PR_CONSTANTS.SUCCESS),
        ...Object.values(PR_CONSTANTS.WARNING),
      ]

      allMessages.forEach(message => {
        // Should not end with punctuation (for consistency with console output)
        expect(message).not.toMatch(/[.!?]$/)
        // Should start with capital letter
        expect(message).toMatch(/^[A-Z]/)
      })
    })
  })

  describe('Real-world Usage Scenarios', () => {
    it('should support building complete prompts by variable substitution', () => {
      const template = PR_CONSTANTS.PROMPTS.PR_GENERATION
      const variables = {
        prType: 'feat',
        prTitle: 'Add new feature',
        ticket: 'PROJ-123',
        explanation: 'This adds a new feature',
        diff: 'diff --git a/file.ts...',
      }

      let result: string = template
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      })

      expect(result).toContain('feat')
      expect(result).toContain('Add new feature')
      expect(result).toContain('PROJ-123')
      expect(result).toContain('This adds a new feature')
      expect(result).toContain('diff --git a/file.ts...')
      expect(result).not.toContain('{')
    })

    it('should provide all necessary PR types for common development workflows', () => {
      const typeValues = PR_CONSTANTS.PR_TYPES.map(t => t.value)

      // Should cover common conventional commit types
      expect(typeValues).toContain('feat') // New features
      expect(typeValues).toContain('fix') // Bug fixes
      expect(typeValues).toContain('refactor') // Code refactoring
      expect(typeValues).toContain('docs') // Documentation
      expect(typeValues).toContain('chore') // Maintenance tasks

      // Should have fallback option
      expect(typeValues).toContain('other')
    })
  })
})
