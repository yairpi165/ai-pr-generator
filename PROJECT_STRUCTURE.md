# 🏗️ Project Structure

## 📁 Directory Organization

```
src/
├── domain/                 # Core domain functionality
│   ├── index.ts           # Main exports
│   ├── ai/                # AI provider implementations
│   │   ├── index.ts       # AI exports
│   │   ├── manager.ts     # AI provider management
│   │   ├── types.ts       # AI types and interfaces
│   │   ├── constants.ts   # AI constants
│   │   └── providers/     # AI provider implementations
│   │       ├── openai.ts  # OpenAI (GPT-4) provider
│   │       └── gemini.ts  # Google Gemini provider
│   ├── config/            # Configuration management
│   │   ├── index.ts       # Config exports
│   │   ├── environment.ts # Environment variables
│   │   ├── paths.ts       # File paths
│   │   ├── types.ts       # Config types
│   │   └── constants.ts   # Config constants
│   ├── git/               # Git utilities
│   │   ├── index.ts       # Git exports
│   │   ├── diff.ts        # Git diff generation
│   │   ├── repository.ts  # Repository management
│   │   ├── types.ts       # Git types
│   │   ├── constants.ts   # Git constants
│   │   └── hosting/       # Git hosting platform integrations
│   │       ├── index.ts   # Hosting exports
│   │       ├── bitbucket.ts # Bitbucket integration
│   │       ├── github.ts  # GitHub integration
│   │       └── types.ts   # Hosting types
│   ├── pr/                # PR generation
│   │   ├── index.ts       # PR exports
│   │   ├── generator.ts   # PR description generation
│   │   ├── reviewers.ts   # Reviewers management
│   │   ├── types.ts       # PR types
│   │   └── constants.ts   # PR constants
│   └── ui/                # User interface utilities
│       ├── index.ts       # UI exports
│       ├── display.ts     # Display functions
│       ├── interactive.ts # Interactive prompts
│       ├── output.ts      # Output handling
│       ├── types.ts       # UI types
│       └── constants.ts   # UI constants
└── cli.ts                 # Command-line interface
```

## 🏛️ Modular Architecture

### Module Independence

Each domain module is designed to be independent:

1. **Own Types**: Each module defines its own types in `types.ts`
2. **Own Constants**: Each module has its own constants in `constants.ts`
3. **Own Index**: Each module exports its public API through `index.ts`
4. **No Cross-Dependencies**: Modules don't directly import from other modules' internal files
5. **Central Management**: The main `src/domain/index.ts` manages all modules

### Module Communication

Modules communicate through well-defined interfaces:

- **Configuration Module**: Provides configuration to all other modules
- **Git Module**: Provides repository and diff information
- **AI Module**: Provides content generation capabilities
- **PR Module**: Orchestrates PR generation using other modules
- **UI Module**: Handles user interaction and display

## 🔧 Architecture Principles

### 1. **Separation of Concerns**

- **Types**: Domain-specific interfaces and types in each module's `types.ts`
- **Constants**: Module constants in `constants.ts`
- **Configuration**: Environment and app config in `config/` module
- **Providers**: AI providers in `ai/providers/` directory

### 2. **Single Responsibility**

- Each file has one clear purpose
- Functions are focused and cohesive
- Modules handle specific domains

### 3. **Dependency Injection**

- Configuration passed to constructors
- Providers managed by manager class
- Environment variables centralized

### 4. **Functional Programming**

- Prefers functions over classes
- Immutable data structures
- Pure functions where possible

### 5. **Error Handling**

- Consistent error messages from constants
- Proper error propagation
- User-friendly error messages

## 📦 Domain Modules

### **Configuration Module (`config/`)**

**Purpose**: Manages application configuration, environment variables, and file paths.

**Key Files**:
- `environment.ts` - Environment variable management
- `paths.ts` - File path management
- `types.ts` - Configuration-related types
- `constants.ts` - Configuration constants

**Key Types**:
- `EnvironmentConfig` - Environment variables interface
- `BitbucketPRData` - Bitbucket PR data structure
- `GitHubPRData` - GitHub PR data structure

### **AI Module (`ai/`)**

**Purpose**: Manages AI providers and content generation with fallback logic.

**Key Files**:
- `manager.ts` - AI provider management with fallback logic
- `providers/gemini.ts` - Google Gemini provider
- `providers/openai.ts` - OpenAI provider
- `types.ts` - AI-related types
- `constants.ts` - AI provider constants

**Key Types**:
- `AIProvider` - AI provider interface
- `AIResponse` - AI response structure
- `ProviderManager` - Provider manager interface

### **Git Module (`git/`)**

**Purpose**: Handles all Git-related operations including repository management, diff generation, and hosting platform integration.

**Key Files**:
- `repository.ts` - Repository information and status
- `diff.ts` - Git diff generation and validation
- `hosting/github.ts` - GitHub-specific operations
- `hosting/bitbucket.ts` - Bitbucket-specific operations
- `types.ts` - Git-related types

**Key Types**:
- `GitRepository` - Repository information
- `GitStatus` - Repository status
- `GitPlatform` - Supported platforms

### **PR Module (`pr/`)**

**Purpose**: Handles PR generation, reviewers management, and PR-related operations.

**Key Files**:
- `generator.ts` - PR description generation
- `reviewers.ts` - Reviewers configuration management
- `types.ts` - PR-related types
- `constants.ts` - PR constants and prompt templates

**Key Types**:
- `PROptions` - PR generation options
- `PRResult` - PR generation result
- `Reviewer` - Reviewer information

### **UI Module (`ui/`)**

**Purpose**: Handles user interaction, display, and output management.

**Key Files**:
- `interactive.ts` - Interactive user input
- `output.ts` - Output handling (clipboard, editor, etc.)
- `display.ts` - Display functions
- `types.ts` - UI-related types
- `constants.ts` - UI messages

**Key Types**:
- `OutputChoice` - Output action choices

## 🔄 Data Flow

1. **CLI** → **UI** → **PR Generator**
2. **PR Generator** → **Git Utils** → **AI Providers**
3. **AI Providers** → **Git Hosting** → **Reviewers**

## 💻 Usage Example

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

## 🎯 Benefits

### **Maintainability**

- Clear file organization
- Consistent naming conventions
- Centralized constants per domain
- Type safety throughout

### **Extensibility**

- Easy to add new AI providers
- Simple to add new Git platforms
- Modular architecture
- Plugin-like structure

### **Testability**

- Isolated components
- Dependency injection
- Clear interfaces
- Mockable dependencies

### **Reusability**

- Modules can be reused in other projects
- Well-defined public APIs
- Independent functionality

### **Performance**

- Lazy loading of providers
- Efficient error handling
- Optimized imports
- Minimal dependencies

## 🔄 Migration from Previous Structure

**Previous Structure**:
- Single `types.ts` file with all interfaces
- Single `constants.ts` file with all constants
- Classes instead of functional patterns
- Mixed responsibilities in single files

**Current Structure Benefits**:
- Domain-specific organization
- Functional programming patterns
- Clear separation of concerns
- Better maintainability and scalability
