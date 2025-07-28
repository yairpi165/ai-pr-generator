# 🚀 Quick Start Guide

## Installation

Install globally via npm:

```bash
npm install -g ai-pr-generator
```

Or via yarn:

```bash
yarn global add ai-pr-generator
```

## Initialization

After installation, run the initialization command:

```bash
genpr init
```

This will guide you through setting up your API keys for OpenAI and/or Gemini.

## Usage

### Interactive Mode

```bash
genpr
```

### One-liner Mode

```bash
genpr feat "Add new feature"
genpr bugfix "Fix critical bug"
genpr refactor "Improve code structure"
```

## API Keys Setup

You'll need at least one API key:

### OpenAI (GPT)

1. Visit: https://platform.openai.com/api-keys
2. Sign in and create a new secret key
3. Copy your API key

### Gemini

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create an API key
4. Copy your API key

## Optional: Automatic PR Creation

For automatic PR creation in Bitbucket or GitHub, you can set up additional credentials during initialization.

## Troubleshooting

- **"genpr command not found"**: Restart your terminal after installation
- **"No AI providers available"**: Run `genpr init` to set up your API keys
- **Permission issues**: Make sure you have Node.js 18+ installed

## Examples

```bash
# Generate a feature PR
genpr feat "Add user authentication"

# Generate a bugfix PR
genpr bugfix "Fix login button not working"

# Generate a refactor PR
genpr refactor "Extract user service to separate module"
```

The tool will:

1. Analyze your Git diff
2. Generate a professional PR description
3. Offer to copy to clipboard or open in editor
