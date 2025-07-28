# 🧠 AI Pull Request Generator

Generate beautiful, structured pull request descriptions using **AI** (GPT or Gemini), straight from your terminal.

This tool analyzes your Git diff, prompts for the PR type, title, and optional ticket ID, and generates a complete, professional-looking PR description.

## ✨ Features

- 🤖 **Multiple AI Providers**: GPT and Gemini with automatic fallback
- 🎯 **Smart Context**: Analyzes your Git diff automatically
- 🎨 **Beautiful Output**: Markdown format with emojis and structure
- 💻 **Interactive UI**: Colored terminal output with arrow key navigation
- 📋 **Copy to Clipboard**: One-click copy to clipboard
- 🚀 **One-liner Usage**: Quick commands like `genpr feat "Add feature"`
- 🔗 **Automatic PR Creation**: Create PRs directly in Bitbucket/GitHub (with API credentials)

## 🚀 Quick Start

### 1. Install

```bash
npm install -g ai-pr-generator
```

### 2. Initialize

Set up your API keys and AI models:

```bash
genpr init
```

This will guide you through setting up:
- OpenAI API key (GPT)
- Gemini API key
- AI model selection (GPT-4o, Gemini 2.0, etc.)
- Default AI provider preference
- Optional Bitbucket/GitHub credentials for automatic PR creation

### 3. Use

```bash
# Interactive mode
genpr

# One-liner mode
genpr feat "Add new feature"
genpr fix "Fix bug in login"
genpr docs "Update README"
```

## 🔐 API Keys Setup

You'll need at least one AI provider:

### OpenAI
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in and create a new secret key
3. Copy your API key

### Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create an API key
4. Copy your API key

## ⚙️ Configuration Management

### Available AI Models

The tool supports multiple AI models from OpenAI and Google Gemini:

#### OpenAI Models
- **GPT-4o Mini** (`gpt-4o-mini`) - Fast and cost-effective for most use cases
- **GPT-4o** (`gpt-4o`) - Best quality for complex tasks
- **GPT-4 Turbo** (`gpt-4-turbo`) - Balanced performance and quality
- **Custom Models** - Use any OpenAI-compatible model

#### Gemini Models
- **Gemini 2.0 Flash** (`gemini-2.0-flash`) - Fast and efficient
- **Gemini 2.0 Pro** (`gemini-2.0-pro`) - Best quality for complex tasks
- **Gemini 1.5 Pro** (`gemini-1.5-pro`) - Balanced performance and quality
- **Custom Models** - Use any Gemini-compatible model

### Initial Setup
During `genpr init`, you can configure:
- **AI Models**: Choose from:
  - **OpenAI**: GPT-4o Mini (Fast & Cheap), GPT-4o (Best Quality), GPT-4 Turbo (Balanced), or custom models
  - **Gemini**: Gemini 2.0 Flash (Fast), Gemini 2.0 Pro (Best Quality), Gemini 1.5 Pro (Balanced), or custom models
- **Default Provider**: Set your preferred AI provider (OpenAI or Gemini)
- **Auto-select**: Let the tool automatically choose the best available provider

### Configuration Management
Use `genpr config` to:
- **View** current configuration
- **Edit** API keys, models, and preferences
- **Reset** all configuration and start fresh

### Environment Variables
The tool uses these environment variables (in `.env`):
```bash
# AI Providers
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# AI Models
OPENAI_MODEL=gpt-4o-mini  # Options: gpt-4o-mini, gpt-4o, gpt-4-turbo, or custom
GEMINI_MODEL=gemini-2.0-flash  # Options: gemini-2.0-flash, gemini-2.0-pro, gemini-1.5-pro, or custom
DEFAULT_PROVIDER=openai  # Options: openai, gemini, or empty for auto-select

# Git Hosting (Optional)
BITBUCKET_EMAIL=your_email
BITBUCKET_TOKEN=your_token
GITHUB_TOKEN=your_token
```

## 🎯 Usage Examples

### Basic Usage
```bash
# Interactive mode - guided prompts
genpr

# One-liner with PR type and title
genpr feat "Add search functionality"
genpr bugfix "Fix responsive layout"
genpr refactor "Extract authentication logic"
```

### Choose AI Provider
```bash
# Force specific provider
genpr --provider GPT feat "Add feature"
genpr --provider Gemini bugfix "Fix bug"
```

### Manage Configuration
```bash
# View current configuration
genpr config

# Edit configuration
genpr config --action edit

# Reset configuration
genpr config --action reset
```

### Output Options
After generating, you can:
- **Copy to clipboard** - Copy the description
- **Open in editor** - Open in your default editor
- **Create PR in Bitbucket** - Automatically create PR (if configured)
- **Create PR in GitHub** - Automatically create PR (if configured)

## 📋 Example Output

```markdown
# 🔖 feat(RND-1234): Add search bar to homepage

## 🧠 Summary

This PR introduces a responsive search bar with autosuggest capabilities on the homepage, improving user navigation and search experience.

## ✅ Changes

- Added new `SearchBar` component with TypeScript support
- Integrated with backend autocomplete API endpoint
- Updated homepage layout to accommodate search functionality
- Added keyboard navigation support for accessibility
- Implemented debounced search to optimize performance
```

## 🔗 Optional: Automatic PR Creation

For automatic PR creation in Bitbucket or GitHub:

### Bitbucket Setup
1. Visit [Bitbucket App Passwords](https://bitbucket.org/account/settings/app-passwords/)
2. Create a new app password with 'Pull requests: Write' permission
3. Add your email and app password during `genpr init`

### GitHub Setup
1. Visit [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Generate new token with 'repo' scope
3. Add your token during `genpr init`

## 👥 Reviewers Configuration

To automatically assign reviewers:

1. Copy `reviewers.json.example` to `reviewers.json`
2. Update with your team's reviewers:

```json
{
  "bitbucket": [
    {
      "name": "John Doe",
      "username": "johndoe"
    }
  ],
  "github": [
    {
      "name": "Jane Smith",
      "username": "janesmith"
    }
  ],
  "default": [
    {
      "name": "Default Reviewer",
      "username": "default"
    }
  ]
}
```

## 🛠️ Development

### Prerequisites
- Node.js 20+ (for development)
- Git repository with changes

### Local Development
```bash
# Clone and install
git clone https://github.com/yairpi165/ai-pr-generator.git
cd ai-pr-generator
npm install

# Build
npm run build

# Run locally
npm start

# Development mode
npm run dev
```

### Available Scripts
```bash
npm run build          # Build TypeScript
npm test               # Run tests
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run format         # Format code
npm run check          # Run all checks
```

## 🐛 Troubleshooting

### Common Issues

**"genpr command not found"**
- Restart your terminal after installation
- Or run: `source ~/.zshrc` (or your shell config)

**"No AI providers available"**
- Run `genpr init` to set up your API keys
- Make sure your API keys are valid

**"Provider X failed"**
- The tool will automatically try other providers
- Check your API key and usage limits

**"Permission denied"**
- Make sure you have Node.js 18+ installed
- Check file permissions

### Check Provider Status
```bash
# See active provider in output
genpr

# Force specific provider
genpr --provider GPT
genpr --provider Gemini
```

## 📦 Installation Details

### Global Installation
```bash
npm install -g ai-pr-generator
```

The package will:
- ✅ Install globally with `genpr` command available
- ✅ Run `postinstall` script to build TypeScript
- ✅ Be ready to use immediately

### Local Installation (Development)
```bash
git clone https://github.com/yairpi165/ai-pr-generator.git
cd ai-pr-generator
npm install
npm run build
```

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch (`feat/`, `fix/`, `docs/`)
3. Make your changes
4. Test: `npm test` and `npm run lint`
5. Build and test: `npm run build && npm start`
6. Open a pull request

## 📄 License

MIT © 2025 Yair Pinchasi

## 🔗 Links

- [GitHub Repository](https://github.com/yairpi165/ai-pr-generator)
- [Issues](https://github.com/yairpi165/ai-pr-generator/issues)
- [Quick Start Guide](QUICK_START.md)
