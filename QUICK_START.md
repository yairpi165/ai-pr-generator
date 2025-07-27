# 🚀 Quick Start - Node.js Version

## Prerequisites

- Node.js 18+ installed
- Git repository with changes

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-pr-generator.git
cd ai-pr-generator

# Run the installer (detects Node.js automatically)
chmod +x install.sh
./install.sh
```

The installer will:

- ✅ Detect Node.js 18+
- 📦 Install dependencies (`yarn install`)
- 🔑 Prompt for Gemini API key
- 🔗 Add `genpr` alias to your shell

## Usage

### Interactive Mode

```bash
genpr
```

### One-liner Mode

```bash
genpr feat "Add search bar"
genpr fix "Fix login bug"
genpr refactor "Extract service"
```

## Features

- 🎨 Beautiful colored terminal output
- ⌨️ Arrow key navigation in prompts
- 📋 Copy to clipboard option
- 📝 Open in editor option
- 🤖 AI-generated titles (optional)
- 🎫 Ticket ID support

## What's Different from Python Version?

- **Better UI**: Colors, arrow keys, better prompts
- **Faster startup**: No virtual environment activation
- **Modern JS**: ES6+ async/await syntax
- **Same output**: Identical PR descriptions

## Troubleshooting

- **"genpr not found"**: Restart terminal or run `source ~/.zshrc`
- **"API key required"**: Create `.env` file with `GEMINI_API_KEY=your_key`
- **"Permission denied"**: Run `chmod +x src/cli.js`

---

**Both Python and Node.js versions work identically! Choose what you prefer.**
