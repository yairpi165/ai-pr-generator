#!/bin/bash

# 📂 Determine script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧠 AI Pull Request Generator - Universal Installer"
echo "=================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install Node.js dependencies and build
echo "📦 Installing Node.js dependencies..."
yarn install --ignore-engines

echo "🔨 Building TypeScript..."
yarn build

echo "🔑 Installing CLI globally..."
yarn link

# Ensure the CLI has execute permissions
chmod +x dist/cli.js

# Setup environment file
ENV_FILE="$SCRIPT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo "🔐 AI Provider Setup"
    echo "=================="
    echo "You need at least one API key to use this tool."
    echo ""
    echo "1️⃣  OpenAI (GPT-4) Setup"
    echo "----------------------"
    echo "1. Visit: https://platform.openai.com/api-keys"
    echo "2. Sign in with your OpenAI account"
    echo "3. Click 'Create new secret key'"
    echo "4. Copy your API key"
    echo ""
    read -p "🔑 Enter your OpenAI API key (press Enter to skip): " OPENAI_KEY
    
    echo ""
    echo "2️⃣  Gemini Setup"
    echo "-------------"
    echo "1. Visit: https://makersuite.google.com/app/apikey"
    echo "2. Sign in with your Google account"
    echo "3. Click 'Create API Key'"
    echo "4. Copy your API key"
    echo ""
    read -p "🔑 Enter your Gemini API key (press Enter to skip): " GEMINI_KEY
    
    if [ -n "$OPENAI_KEY" ] || [ -n "$GEMINI_KEY" ]; then
        # Create .env file (truncate if exists)
        > "$ENV_FILE"
        
        if [ -n "$OPENAI_KEY" ]; then
            echo "OPENAI_API_KEY=$OPENAI_KEY" >> "$ENV_FILE"
            echo "✅ OpenAI API key saved"
        fi
        if [ -n "$GEMINI_KEY" ]; then
            echo "GEMINI_API_KEY=$GEMINI_KEY" >> "$ENV_FILE"
            echo "✅ Gemini API key saved"
        fi
        
        echo ""
        echo "3️⃣  Bitbucket Setup (Optional)"
        echo "---------------------------"
        echo "For automatic PR creation, you can set up Bitbucket API credentials:"
        echo "1. Visit: https://bitbucket.org/account/settings/app-passwords/"
        echo "2. Create a new app password with 'Pull requests: Write' permission"
        echo "3. Copy your email and app password"
        echo ""
        read -p "🔑 Enter your Bitbucket email (press Enter to skip): " BITBUCKET_EMAIL
        read -p "🔑 Enter your Bitbucket app password (press Enter to skip): " BITBUCKET_TOKEN
        
        if [ -n "$BITBUCKET_EMAIL" ] && [ -n "$BITBUCKET_TOKEN" ]; then
            echo "BITBUCKET_EMAIL=$BITBUCKET_EMAIL" >> "$ENV_FILE"
            echo "BITBUCKET_TOKEN=$BITBUCKET_TOKEN" >> "$ENV_FILE"
            echo "✅ Bitbucket credentials saved"
        fi
        
        echo ""
        echo "4️⃣  GitHub Setup (Optional)"
        echo "------------------------"
        echo "For automatic PR creation, you can set up GitHub API credentials:"
        echo "1. Visit: https://github.com/settings/tokens"
        echo "2. Click 'Generate new token (classic)'"
        echo "3. Select 'repo' scope for full repository access"
        echo "4. Copy your personal access token"
        echo ""
        read -p "🔑 Enter your GitHub personal access token (press Enter to skip): " GITHUB_TOKEN
        
        if [ -n "$GITHUB_TOKEN" ]; then
            echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> "$ENV_FILE"
            echo "✅ GitHub credentials saved"
        fi
        
        echo "✅ API keys saved to .env file"
    else
        echo "⚠️  No API keys provided. You'll need to create a .env file manually."
        echo "   Add one or both:"
        echo "   OPENAI_API_KEY=your_openai_key_here"
        echo "   GEMINI_API_KEY=your_gemini_key_here"
    fi
else
    echo "✅ .env file already exists"
fi

# Add global alias
echo ""
echo "🔗 Setting up global alias..."

# Define the alias command
ALIAS_CMD="node \"$SCRIPT_DIR/dist/cli.js\""

# Find shell config file
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
    # Check if alias already exists
    if grep -q "alias genpr=" "$SHELL_CONFIG"; then
        echo "✅ 'genpr' alias already exists in $SHELL_CONFIG"
    else
        # Add the alias
        echo "" >> "$SHELL_CONFIG"
        echo "# AI PR Generator alias" >> "$SHELL_CONFIG"
        echo "alias genpr=\"$ALIAS_CMD\"" >> "$SHELL_CONFIG"
        echo "✅ Added 'genpr' alias to $SHELL_CONFIG"
        echo "   Restart your terminal or run: source $SHELL_CONFIG"
    fi
else
    echo "⚠️  Could not find shell config file. Please add manually:"
    echo "   alias genpr=\"$ALIAS_CMD\""
fi

echo ""
echo "🎉 Installation complete!"
echo "========================"
echo ""
echo "Usage:"
echo "  genpr                    # Interactive mode"
echo "  genpr feat 'Add feature' # One-liner mode"
echo ""
echo "If 'genpr' command is not found, restart your terminal or run:"
echo "  source $SHELL_CONFIG"