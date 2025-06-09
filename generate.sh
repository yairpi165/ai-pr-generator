#!/bin/bash

# Prompt for PR type if not provided
if [ -z "$1" ]; then
  echo "🔧 Select PR type:"
  select opt in feature bugfix refactor docs chore other; do
    TYPE=$opt
    break
  done
else
  TYPE="$1"
fi

# Prompt for PR title if not provided
if [ -z "$2" ]; then
  read -p "📝 Enter PR title: " TITLE
else
  TITLE="$2"
fi

# Optional: ticket name (e.g. RND-1234)
read -p "🎫 Enter ticket name (optional): " TICKET

# Compose full title (only if user gave a title)
if [ -n "$TITLE" ]; then
  if [ -n "$TICKET" ]; then
    FULL_TITLE="$TICKET: $TITLE"
  else
    FULL_TITLE="$TITLE"
  fi
  export PR_TITLE="$FULL_TITLE"
fi

echo ""
echo "📋 PR Type: $TYPE"
echo "📝 PR Title: $FULL_TITLE"

# Generate the git diff
echo "🛠️ Generating git diff..."
git diff origin/main...HEAD > ~/generate-pr-desc/diff.txt

echo "📦 Activating virtual environment..."
source ~/generate-pr-desc/venv/bin/activate

# Export variables
export PR_TYPE="$TYPE"
export PR_TITLE="$FULL_TITLE"

echo "🤖 Calling Gemini API..."
python3 ~/generate-pr-desc/gen_pr.py

# Ask user what to do with the result
echo ""
echo "📄 What would you like to do with the PR description?"
select action in "📋 Copy to clipboard" "📝 Open in editor" "📋 + 📝 Both" "🚫 Nothing"; do
  case $action in
    "📋 Copy to clipboard")
      pbcopy < ~/generate-pr-desc/pr-description.md
      echo "✅ Copied to clipboard."
      break
      ;;
    "📝 Open in editor")
      open ~/generate-pr-desc/pr-description.md
      break
      ;;
    "📋 + 📝 Both")
      pbcopy < ~/generate-pr-desc/pr-description.md
      open ~/generate-pr-desc/pr-description.md
      echo "✅ Copied and opened."
      break
      ;;
    "🚫 Nothing")
      echo "⚠️ Skipping clipboard and editor."
      break
      ;;
  esac
done

echo "🛑 Deactivating virtual environment..."
deactivate