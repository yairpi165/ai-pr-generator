# 🏗️ Project Structure

## 📁 Directory Organization

```
src/
├── lib/                    # Core library functionality
│   ├── index.ts           # Main exports
│   ├── types.ts           # All TypeScript interfaces and types
│   ├── constants.ts       # Global constants and configurations
│   ├── config.ts          # Application configuration
│   ├── git.ts             # Git utilities
│   ├── git-hosting.ts     # Git hosting platform integrations
│   ├── reviewers.ts       # Reviewers management
│   ├── pr-generator.ts    # PR description generation
│   ├── ui.ts              # User interface utilities
│   └── providers/         # AI provider implementations
│       ├── manager.ts     # AI provider management
│       ├── openai.ts      # OpenAI (GPT-4) provider
│       └── gemini.ts      # Google Gemini provider
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

### **Types (`types.ts`)**

- All TypeScript interfaces
- AI provider contracts
- Configuration interfaces
- Git hosting types

### **Constants (`constants.ts`)**

- Application constants
- Error messages
- Success messages
- UI messages
- Git commands
- API endpoints
- Emojis and symbols

### **Configuration (`config.ts`)**

- Environment variables
- File paths
- AI configuration
- PR types

### **Git Utilities (`git.ts`)**

- Repository validation
- Diff generation
- Branch management
- Git operations

### **Git Hosting (`git-hosting.ts`)**

- Bitbucket integration
- GitHub integration
- GitLab integration
- PR creation

### **Reviewers (`reviewers.ts`)**

- Reviewers configuration
- Platform-specific reviewers
- Configuration loading

### **AI Providers (`providers/`)**

- **Manager**: Provider orchestration
- **OpenAI**: GPT-4 integration
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
