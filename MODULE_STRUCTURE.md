# Module Structure Documentation

## Overview

The project has been refactored to use a modular architecture where each domain folder is treated as an independent module. Each module has its own types, constants, and index files, making the codebase more maintainable and following SOLID principles.

## Module Organization

### 1. Configuration Module (`src/domain/config/`)

**Purpose**: Manages application configuration, environment variables, and file paths.

**Files**:

- `types.ts` - Configuration-related types
- `constants.ts` - Configuration constants (API endpoints, URLs, environment variables)
- `environment.ts` - Environment variable management
- `paths.ts` - File path management
- `index.ts` - Module exports

**Key Types**:

- `EnvironmentConfig` - Environment variables interface
- `BitbucketPRData` - Bitbucket PR data structure
- `GitHubPRData` - GitHub PR data structure

**Key Constants**:

- `CONFIG_CONSTANTS` - Application info, API endpoints, URLs, environment variable names

### 2. Git Module (`src/domain/git/`)

**Purpose**: Handles all Git-related operations including repository management, diff generation, and hosting platform integration.

**Files**:

- `types.ts` - Git-related types
- `constants.ts` - Git commands and error messages
- `repository.ts` - Repository information and status
- `diff.ts` - Git diff generation and validation
- `hosting/` - Git hosting platform integration
  - `bitbucket.ts` - Bitbucket-specific operations
  - `github.ts` - GitHub-specific operations
  - `index.ts` - Hosting platform exports
- `index.ts` - Module exports

**Key Types**:

- `GitRepository` - Repository information
- `GitStatus` - Repository status
- `GitPlatform` - Supported platforms
- `BitbucketRepoInfo` - Bitbucket repository info
- `GitHubRepoInfo` - GitHub repository info

**Key Constants**:

- `GIT_CONSTANTS` - Git commands, error messages, platform patterns

### 3. AI Module (`src/domain/ai/`)

**Purpose**: Manages AI providers and content generation with fallback logic.

**Files**:

- `types.ts` - AI-related types
- `constants.ts` - AI provider constants and error messages
- `manager.ts` - AI provider management with fallback logic
- `providers/` - AI provider implementations
  - `gemini.ts` - Google Gemini provider
  - `openai.ts` - OpenAI provider
- `index.ts` - Module exports

**Key Types**:

- `AIResponse` - AI response structure
- `AIConfig` - AI configuration
- `AIProvider` - AI provider interface
- `ProviderManager` - Provider manager interface
- `ProviderManagerConfig` - Provider manager configuration

**Key Constants**:

- `AI_CONSTANTS` - Error messages, API endpoints, model configurations

### 4. PR Module (`src/domain/pr/`)

**Purpose**: Handles PR generation, reviewers management, and PR-related operations.

**Files**:

- `types.ts` - PR-related types
- `constants.ts` - PR constants and prompt templates
- `generator.ts` - PR description generation
- `reviewers.ts` - Reviewers configuration management
- `index.ts` - Module exports

**Key Types**:

- `PRTypeChoice` - PR type selection
- `PROptions` - PR generation options
- `PRResult` - PR generation result
- `PRGenerationConfig` - PR generation configuration
- `Reviewer` - Reviewer information
- `ReviewersConfig` - Reviewers configuration

**Key Constants**:

- `PR_CONSTANTS` - PR types, prompt templates, file paths

### 5. UI Module (`src/domain/ui/`)

**Purpose**: Handles user interaction, display, and output management.

**Files**:

- `types.ts` - UI-related types
- `constants.ts` - UI messages and constants
- `interactive.ts` - Interactive user input
- `output.ts` - Output handling (clipboard, editor, etc.)
- `display.ts` - Display functions
- `index.ts` - Module exports

**Key Types**:

- `OutputChoice` - Output action choices

**Key Constants**:

- `UI_CONSTANTS` - UI messages, success messages, info messages, emojis

## Module Independence

Each module is designed to be independent:

1. **Own Types**: Each module defines its own types in `types.ts`
2. **Own Constants**: Each module has its own constants in `constants.ts`
3. **Own Index**: Each module exports its public API through `index.ts`
4. **No Cross-Dependencies**: Modules don't directly import from other modules' internal files
5. **Central Management**: The main `src/domain/index.ts` manages all modules

## Module Communication

Modules communicate through well-defined interfaces:

- **Configuration Module**: Provides configuration to all other modules
- **Git Module**: Provides repository and diff information
- **AI Module**: Provides content generation capabilities
- **PR Module**: Orchestrates PR generation using other modules
- **UI Module**: Handles user interaction and display

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Changes in one module don't affect others
3. **Testability**: Each module can be tested independently
4. **Reusability**: Modules can be reused in other projects
5. **Scalability**: New modules can be added easily
6. **Type Safety**: Strong typing throughout the application
7. **Functional Patterns**: Uses modern TypeScript/JavaScript patterns

## Usage Example

```typescript
// Import from the main domain index
import {
  generatePRDescription,
  openPR,
  getInteractiveInput,
  displayResult,
  aiConfig,
  GIT_CONSTANTS,
} from './domain/index.js'

// Use the modules
const result = await generatePRDescription(prType, title, ticket, explanation)
await openPR(result.title, result.body)
```

## Migration from Old Structure

The old structure had:

- Single `types.ts` file with all interfaces
- Single `constants.ts` file with all constants
- Classes instead of functional patterns
- Mixed responsibilities in single files

The new structure provides:

- Domain-specific organization
- Functional programming patterns
- Clear separation of concerns
- Better maintainability and scalability
