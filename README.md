# 🧠 AI Pull Request Generator

Generate beautiful, structured pull request descriptions using **AI** (GPT-4 or Gemini), straight from your terminal.

This tool analyzes your Git diff, prompts for the PR type, title, and optional ticket ID, and generates a complete, professional-looking PR description saved to `pr-description.md`. It supports multiple AI providers with automatic fallback for maximum reliability.

---

---

## ✨ Features

### 🤖 AI Features

- Multiple AI providers (GPT-4 and Gemini)
- Automatic fallback if one provider fails
- Choose your preferred provider
- AI-generated titles and descriptions
- Smart context handling

### 💡 Core Features

- Detects current Git diff automatically
- Choose PR type (feature, bugfix, refactor, etc.)
- Optional title prompt or auto-generated
- Optional ticket ID (e.g. `RND-1234`)
- Markdown format with emojis

### 🎨 UI Features

- Beautiful colored terminal output
- Interactive prompts with arrow key navigation
- Preview output and copy to clipboard
- One-liner CLI usage with `genpr`
- Shows active AI provider
- **Automatic PR creation** in Bitbucket and GitHub (with API credentials)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Yarn package manager installed
- Git repository with changes

### Installing Yarn

If you don't have Yarn installed, you can install it via npm:

```bash
npm install -g yarn
```

Or follow the [official Yarn installation guide](https://classic.yarnpkg.com/en/docs/install/).

### Development Setup

This project uses ESLint and Prettier for code quality and formatting:

```bash
# Install dependencies
yarn install

# Run linting
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Check formatting
yarn format:check

# Run all checks (lint + format check)
yarn check

# Fix all issues (lint fix + format)
yarn fix
```

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-pr-generator.git
cd ai-pr-generator
```

### 2. Run the installer

```bash
chmod +x install.sh
./install.sh
```

The installer will:

- Check Node.js version compatibility
- Install required dependencies
- Prompt for your Gemini API key
- Add a global terminal alias `genpr` to your shell config

---

## 🔐 AI Provider Setup

During installation, you'll be prompted to configure one or both AI providers:

### OpenAI (GPT-4)

1. Visit: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Click **"Create new secret key"**
4. Copy your API key

### Gemini

1. Visit: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

The installer will create a `.env` file for you. If you prefer to set it up manually:

```env
# You need at least one of these:
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here

# Optional - for automatic PR creation in Bitbucket:
BITBUCKET_EMAIL=your_email@example.com
BITBUCKET_TOKEN=your_app_password_here

# Optional - for automatic PR creation in GitHub:
GITHUB_TOKEN=your_personal_access_token_here
```

## 🔗 Git Hosting API Setup (Optional)

For automatic PR creation in Bitbucket:

1. Visit: https://bitbucket.org/account/settings/app-passwords/
2. Click 'Create app password'
3. Give it a name (e.g., "AI PR Generator")
4. Select 'Pull requests: Write' permission
5. Copy your email and app password
6. Add to your `.env` file (or use the installer)

For automatic PR creation in GitHub:

1. Visit: https://github.com/settings/tokens
2. Click 'Generate new token (classic)'
3. Select 'repo' scope for full repository access
4. Copy your personal access token
5. Add to your `.env` file (or use the installer)

## 👥 Reviewers Configuration (Optional)

To automatically assign reviewers to your PRs:

1. Copy `reviewers.json.example` to `reviewers.json`
2. Update the file with your team's reviewers:

```json
{
  "bitbucket": [
    {
      "name": "John Doe",
      "username": "johndoe"
    },
    {
      "name": "Jane Smith",
      "username": "janesmith"
    }
  ],
  "github": [
    {
      "name": "John Doe",
      "username": "johndoe"
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

**Note:** For Bitbucket, the `username` field is required and will be used to create reviewers with `type: "user"`.

The tool will automatically assign these reviewers when creating PRs.

---

## 🧪 Usage Examples

### Interactive Mode

```bash
genpr
```

You'll be guided through:

- PR type selection (feature, bugfix, etc.)
- PR title input (optional)
- Ticket ID input (optional)
- Additional explanation for AI (optional)

### One-liner Mode

```bash
# Basic usage
genpr feat "Add search bar to homepage"
genpr fix "Fix login button alignment"
genpr refactor "Extract user service"

# Choose AI provider
genpr --provider GPT-4 feat "Add feature"
genpr --provider Gemini fix "Fix bug"
```

You can also skip the title and let the AI generate one. The tool will automatically use available providers, preferring GPT-4 when both are configured.

### Output Options

After generating the PR description, you can:

- **Copy to clipboard** - Copy the description to your clipboard
- **Open in editor** - Open the description in your default editor
- **Open PR in Bitbucket** - Automatically create a PR in Bitbucket (if API credentials are configured)
- **Open PR in GitHub** - Automatically create a PR in GitHub (if API credentials are configured)
- **Both** - Copy to clipboard and open in editor
- **Do nothing** - Just display the result

---

## 🛠️ Development

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: JavaScript/TypeScript linting with TypeScript-specific rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Static type checking and modern JavaScript features

### Available Scripts

```bash
# Build the project
npm run build

# Development mode (watch for changes)
npm run dev

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:verbose  # Run tests with verbose output

# Linting
npm run lint          # Check for linting issues
npm run lint:fix      # Fix auto-fixable linting issues

# Formatting
npm run format        # Format all files
npm run format:check  # Check if files are formatted

# Type checking
npm run tsc           # TypeScript type checking

# Combined checks
npm run check         # Run lint + format check + type check
npm run fix           # Run lint:fix + format
```

### Testing

This project uses Jest for testing with TypeScript support:

- **Test Framework**: Jest with ts-jest for TypeScript support
- **Coverage**: Built-in coverage reporting with HTML output
- **Watch Mode**: Interactive test watching with file filtering
- **ES Modules**: Full support for ES modules and import.meta
- **Mocking**: Built-in mocking capabilities for external dependencies

#### Test Structure
```
src/__tests__/
├── setup.ts          # Global test setup and mocks
├── basic.test.ts     # Basic functionality tests
└── [module].test.ts  # Module-specific tests
```

### Configuration Files

- `jest.config.ts` - Jest testing configuration with TypeScript support
- `eslint.config.js` - ESLint configuration with TypeScript support
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore during formatting
- `tsconfig.json` - TypeScript compiler configuration
- `.husky/pre-commit` - Pre-commit hook configuration
- `package.json` - lint-staged configuration for staged files

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

---

## ⚡️ Using the Alias

Once installed, you can run the script from any folder by simply typing:

```bash
genpr
```

No need to remember paths.

---

## 📁 Project Structure

```txt
ai-pr-generator/
├── src/
│   ├── cli.js             # CLI interface with interactive prompts
│   └── gen-pr.js          # Core logic for PR generation
├── package.json           # Node.js dependencies
├── install.sh             # Installer
├── pr-description.md      # AI-generated PR description
├── diff.txt               # Temp file for Git diff
├── .env                   # Your API key
└── README.md              # This file
```

---

---

## 🛠 Development

```bash
# Install dependencies
npm install

# Run locally
node src/cli.js

# Make CLI executable
chmod +x src/cli.js
```

---

## 🛠 Contributing

We welcome contributions!

### 📌 How to Contribute

1. Fork the repo
2. Create a branch (use `feat/`, `fix/`, or `docs/` prefixes)
3. Make your changes
4. Test your changes: `node src/cli.js`
5. Open a pull request

### 🧪 Before submitting

- [ ] Confirm it runs end-to-end
- [ ] Try multiple PR types and edge cases
- [ ] Test clipboard + markdown preview behavior
- [ ] Keep code formatting clean

---

## 💬 Troubleshooting

### Common Issues

1. **"Node.js is not installed"**

   - Install Node.js 18+ from [nodejs.org](https://nodejs.org/)

2. **"No AI providers available"**

   - Configure at least one API key in `.env`
   - Run `./install.sh` to set up your keys
   - Make sure your API keys are valid

3. **"Provider X failed"**

   - The tool will automatically try other providers
   - Check your API key for that provider
   - Check your API usage/limits

4. **"Permission denied"**

   - Run `chmod +x src/cli.js` to make the CLI executable

5. **"genpr command not found"**
   - Restart your terminal after installation
   - Or run `source ~/.zshrc` (or your shell config file)

### Provider Status

You can check your current provider:

```bash
# The active provider will be shown in the output
genpr
```

Or force a specific provider:

```bash
genpr --provider GPT-4
genpr --provider Gemini
```

---

## 📜 License

MIT © 2024 Yair Pinchasi
