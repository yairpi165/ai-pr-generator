#!/bin/bash

# 📂 Determine script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 🔧 Select PR type
if [ -z "$1" ]; then
  echo "🔧 Select PR type:"
  echo "  [1] ✨ Feature"
  echo "  [2] 🐛 Bugfix"
  echo "  [3] ♻️  Refactor"
  echo "  [4] 📚 Docs"
  echo "  [5] 🧹 Chore"
  echo "  [6] 🔧 Other"
  printf "👉 Your choice [1-6]: "
  read -n 1 PR_TYPE_NUM
  echo ""

  case $PR_TYPE_NUM in
    1) TYPE="feat" ;;
    2) TYPE="fix" ;;
    3) TYPE="refactor" ;;
    4) TYPE="docs" ;;
    5) TYPE="chore" ;;
    6) TYPE="other" ;;
    *) echo "❌ Invalid option. Defaulting to 'other'"; TYPE="other" ;;
  esac
else
  TYPE="$1"
fi

# 📝 Get PR title
if [ -z "$2" ]; then
  read -p "📝 Enter PR title: " TITLE
else
  TITLE="$2"
fi

# 🎫 Optional: ticket name
read -p "🎫 Enter ticket name (optional): " TICKET

# 🗒️ Optional: user explanation
read -p "🗒️  Enter short explanation for AI (optional): " EXPLANATION

# 🧠 Compose full title
if [ -n "$TITLE" ] && [ -n "$TICKET" ]; then
  FULL_TITLE="$TICKET: $TITLE"
elif [ -n "$TITLE" ]; then
  FULL_TITLE="$TITLE"
elif [ -n "$TICKET" ]; then
  FULL_TITLE="$TICKET"
else
  FULL_TITLE=""
fi

echo ""
[ -n "$TYPE" ] && echo "📋 PR Type:  $TYPE"
[ -n "$TITLE" ] && echo "📝 PR Title: $TITLE"
[ -n "$TICKET" ] && echo "🎫 Ticket:   $TICKET"
[ -n "$EXPLANATION" ] && echo "🗒️  Explanation: $EXPLANATION"

# 🛠️ Generate the git diff
git diff origin/main...HEAD > "$SCRIPT_DIR/diff.txt"

# 🐍 Activate virtual environment
source "$SCRIPT_DIR/venv/bin/activate"

# 🌍 Export environment variables
export PR_TYPE="$TYPE"
export PR_TITLE="$FULL_TITLE"
export PR_TICKET="$TICKET"
export PR_EXPLANATION="$EXPLANATION"

# 🤖 Call Gemini API
echo "🤖 Generating PR description with Gemini..."
python3 "$SCRIPT_DIR/gen_pr.py"

# 📤 Output options
echo ""
echo "📄 What would you like to do with the generated PR description?"
echo "  [1] 📋 Copy to clipboard"
echo "  [2] 📝 Open in editor"
echo "  [3] 📋 + 📝 Both"
echo "  [4] 🚫 Do nothing"
printf "👉 Your choice [1-4]: "
read -n 1 ACTION_NUM
echo ""

case $ACTION_NUM in
  1)
    pbcopy < "$SCRIPT_DIR/pr-description.md"
    echo "✅ Copied to clipboard."
    ;;
  2)
    open "$SCRIPT_DIR/pr-description.md"
    ;;
  3)
    pbcopy < "$SCRIPT_DIR/pr-description.md"
    open "$SCRIPT_DIR/pr-description.md"
    echo "✅ Copied and opened."
    ;;
  4)
    echo "⚠️ Skipping clipboard and editor."
    ;;
  *)
    echo "❌ Invalid choice. Doing nothing."
    ;;
esac

# 🔚 Deactivate environment
echo "🤖 See you next time...."
deactivate