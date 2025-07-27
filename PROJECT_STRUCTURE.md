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

## 🔧 Architecture Principles

### 1. **Separation of Concerns**

- **Types**: All interfaces and types in `types.ts`
- **Constants**: Global constants in `constants.ts`
- **Configuration**: App config in `config.ts`
- **Providers**: AI providers in `providers/` directory

### 2. **Single Responsibility**

- Each file has one clear purpose
- Functions are focused and cohesive
- Classes handle specific domains

### 3. **Dependency Injection**

- Configuration passed to constructors
- Providers managed by manager class
- Environment variables centralized

### 4. **Error Handling**

- Consistent error messages from constants
- Proper error propagation
- User-friendly error messages

## 📦 Key Components

### **AI Domain (`ai/`)**

- **Manager**: Provider orchestration and fallback logic
- **Types**: AI provider contracts and interfaces
- **Constants**: AI-specific constants and configurations
- **Providers**: OpenAI (GPT-4) and Google Gemini integrations

### **Configuration (`config/`)**

- **Environment**: Environment variable management
- **Paths**: File path configurations
- **Types**: Configuration interfaces
- **Constants**: Configuration constants

### **Git Domain (`git/`)**

- **Diff**: Git diff generation and analysis
- **Repository**: Repository validation and management
- **Types**: Git-related interfaces
- **Constants**: Git commands and constants
- **Hosting**: Bitbucket, GitHub, and GitLab integrations

### **PR Domain (`pr/`)**

- **Generator**: PR description generation logic
- **Reviewers**: Reviewers configuration and management
- **Types**: PR-related interfaces
- **Constants**: PR types and constants

### **UI Domain (`ui/`)**

- **Display**: User interface display functions
- **Interactive**: Interactive prompt handling
- **Output**: Output file and clipboard management
- **Types**: UI-related interfaces
- **Constants**: UI messages and constants
- **Gemini**: Google AI integration

## 🔄 Data Flow

1. **CLI** → **UI** → **PR Generator**
2. **PR Generator** → **Git Utils** → **AI Providers**
3. **AI Providers** → **Git Hosting** → **Reviewers**

## 🎯 Benefits

### **Maintainability**

- Clear file organization
- Consistent naming conventions
- Centralized constants
- Type safety

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

### **Performance**

- Lazy loading of providers
- Efficient error handling
- Optimized imports
- Minimal dependencies
