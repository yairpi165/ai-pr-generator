#!/bin/bash

ALIAS_NAME="genpr"
TARGET_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/generate.sh"
SHELL_CONFIG=""

# Detect shell config file
if [[ $SHELL == *"zsh" ]]; then
  SHELL_CONFIG="$HOME/.zshrc"
elif [[ $SHELL == *"bash" ]]; then
  SHELL_CONFIG="$HOME/.bashrc"
else
  echo "❗️Unsupported shell. Please add the alias manually."
  exit 1
fi

# Check if alias already exists
if grep -q "alias $ALIAS_NAME=" "$SHELL_CONFIG"; then
  echo "⚠️ Alias '$ALIAS_NAME' already exists in $SHELL_CONFIG"
else
  echo "alias $ALIAS_NAME=\"$TARGET_PATH\"" >> "$SHELL_CONFIG"
  echo "✅ Alias '$ALIAS_NAME' added to $SHELL_CONFIG"
  echo "👉 Run 'source $SHELL_CONFIG' or restart your terminal to apply it."
fi