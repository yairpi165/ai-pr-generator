/**
 * Jest test setup file
 * This file runs before each test
 */

// ==============================================================================
// COMMON MODULE MOCKS
// ==============================================================================

// Mock chalk module with comprehensive support for chained methods
jest.mock('chalk', () => {
  const mockChalk = jest.fn((text: string) => text)
  return {
    // Basic color functions
    blue: Object.assign(mockChalk, {
      bold: jest.fn((text: string) => text),
    }),
    green: Object.assign(mockChalk, {
      bold: jest.fn((text: string) => text),
    }),
    red: Object.assign(mockChalk, {
      bold: jest.fn((text: string) => text),
    }),
    yellow: Object.assign(mockChalk, {
      bold: jest.fn((text: string) => text),
    }),
    cyan: Object.assign(mockChalk, {
      bold: jest.fn((text: string) => text),
    }),
    bold: jest.fn((text: string) => text),
    gray: jest.fn((text: string) => text),
    // Default export support
    default: {
      blue: Object.assign(mockChalk, {
        bold: jest.fn((text: string) => text),
      }),
      green: Object.assign(mockChalk, {
        bold: jest.fn((text: string) => text),
      }),
      red: Object.assign(mockChalk, {
        bold: jest.fn((text: string) => text),
      }),
      yellow: Object.assign(mockChalk, {
        bold: jest.fn((text: string) => text),
      }),
      cyan: Object.assign(mockChalk, {
        bold: jest.fn((text: string) => text),
      }),
      bold: jest.fn((text: string) => text),
      gray: jest.fn((text: string) => text),
    },
  }
})

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  lstatSync: jest.fn(),
  unlinkSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
  },
}))

// Mock child process operations
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
  exec: jest.fn(),
  fork: jest.fn(),
}))

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  resolve: jest.fn((...args: string[]) => '/' + args.join('/')),
  dirname: jest.fn((path: string) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path: string) => path.split('/').pop() || ''),
  extname: jest.fn((path: string) => {
    const parts = path.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  }),
  sep: '/',
  delimiter: ':',
}))

// Mock inquirer for interactive prompts
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}))

// Mock open module for opening URLs/files
jest.mock('open', () => jest.fn())

// Mock clipboardy for clipboard operations
jest.mock('clipboardy', () => ({
  writeSync: jest.fn(),
  readSync: jest.fn(),
}))

// ==============================================================================
// GLOBAL UTILITIES
// ==============================================================================

// Mock global fetch for API calls
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// Mock process.exit to prevent tests from actually exiting
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit() was called - prevented in tests')
})

// Utility to reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
  // Reset process.exit mock
  mockProcessExit.mockClear()
  // Reset fetch mock
  ;(global.fetch as jest.MockedFunction<typeof fetch>).mockClear()
})

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
