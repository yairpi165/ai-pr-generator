/**
 * Jest configuration for AI PR Generator
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
  // Test environment
  testEnvironment: 'node',

  // File extensions to look for
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
        moduleNameMapper: {
          '^(\\.{1,2}/.*)\\.js$': '$1',
        },
        isolatedModules: false,
      },
    ],
  },

  // Module extensions
  extensionsToTreatAsEsm: ['.ts'],

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Coverage exclusions
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/__tests__/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'types\\.ts$',
    'constants\\.ts$',
    'interfaces\\.ts$',
    'enums\\.ts$',
    'index\\.ts$',
    'environment\\.ts$',
    'paths\\.ts$',
    'mocks\\.ts$',
    '\\.d\\.ts$',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.*/(types|constants|interfaces|enums|mocks|index|environment|paths)\\.ts$',
    '\\.d\\.ts$',
  ],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(inquirer|chalk|clipboardy|open|#ansi-styles|ansi-styles|supports-color)/)',
  ],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}

export default config
