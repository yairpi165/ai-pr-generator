#!/bin/bash

set -e

echo "📦 Setting up AI PR Generator..."

# 1. Create virtual environment if not exists
if [ ! -d "./venv" ]; then
  echo "🐍 Creating virtual environment..."
  python3 -m venv venv
fi

# 2. Activate and install dependencies
source venv/bin/activate
echo "📥 Installing dependencies..."
pip install -r requirements.txt
deactivate

# 3. Add alias
echo "🔗 Adding alias..."
bash ./add-alias.sh

# 4. Prompt for Gemini API key if .env doesn't exist
if [ ! -f ".env" ]; then
  echo "🔐 Gemini API Key Setup"
  echo "Visit https://makersuite.google.com/app/apikey to generate your key."
  read -p "Paste your Gemini API Key here: " GEMINI_API_KEY
  echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env
  echo "✅ .env file created."
else
  echo "🟢 .env file already exists. Skipping API key setup."
fi

echo ""
echo "✅ Installation complete! You can now run: genpr"