/**
 * Jest test setup file
 * This file runs before each test
 */

// Mock chalk module
jest.mock('chalk', () => ({
  blue: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  bold: jest.fn((text: string) => text),
  gray: jest.fn((text: string) => text),
  default: {
    blue: jest.fn((text: string) => text),
    yellow: jest.fn((text: string) => text),
    red: jest.fn((text: string) => text),
    green: jest.fn((text: string) => text),
    bold: jest.fn((text: string) => text),
    gray: jest.fn((text: string) => text),
  },
}))

// Mock open module
jest.mock('open', () => jest.fn())

// Set test environment variables
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

// Global test timeout
jest.setTimeout(10000)

// Mock environment variables for testing
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.BITBUCKET_EMAIL = 'test@example.com'
process.env.BITBUCKET_TOKEN = 'test-bitbucket-token'
process.env.GITHUB_TOKEN = 'test-github-token'
