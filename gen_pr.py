# gen_pr.py

import google.generativeai as genai
import os
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.abspath(__file__))
diff_path = os.path.join(base_dir, "diff.txt")

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

# Load git diff
with open(diff_path, "r") as file:
    diff = file.read()

# Load PR metadata
pr_type = os.getenv("PR_TYPE", "feature").lower()
pr_title_raw = os.getenv("PR_TITLE", "").strip()
ticket = os.getenv("PR_TICKET", "").strip()
explanation = os.getenv("PR_EXPLANATION", "").strip()

title = ""
use_ai_title = False

# Parse PR title
if ":" in pr_title_raw:
    parts = pr_title_raw.split(":", 1)
    ticket = parts[0].strip()
    title = parts[1].strip()
elif pr_title_raw:
    if " " in pr_title_raw:
        title = pr_title_raw
    else:
        ticket = pr_title_raw

# If title is missing, use AI to generate one
if not title:
    use_ai_title = True
    title = "AI-generated title"

# Generate AI title if needed
if use_ai_title:
    title_prompt = f"""
You're a senior software engineer writing a Bitbucket pull request.

Based on this git diff, generate a short, descriptive PR title in sentence case.
Do NOT include any punctuation or markdown — just return the title text.

Git diff:
{diff}
"""

    if explanation:
        title_prompt += f"""

Additional context from the author (use this to improve accuracy and relevance):

{explanation}
"""

    title_response = model.generate_content(title_prompt)
    title = title_response.text.strip().strip('"').strip()

# Build title string
ticket_prefix = f"({ticket})" if ticket else ""
formatted_title = f"{pr_type}{ticket_prefix}: {title}".strip(": ").strip()

# Construct prompt (AI generates only the body)
prompt = f"""
You're a senior software engineer writing a Bitbucket pull request description.

Please generate a professional, **short and concise** PR description in **Markdown format** — no title.

Keep it focused and direct. Avoid redundant wording. Use bullet points where possible.

Use this structure:

## 🧠 Summary
A 2-3 sentence summary of what this PR does, in clear language.

## ✅ Changes
A concise bullet list of changes (ideally 3-5 items).

## 🔍 Context
1-2 sentences of context on why this is needed.

Use the following git diff as input:

{diff}
"""

# Add optional user-provided explanation
if explanation:
    prompt += f"""

Additional context from the author (use this to improve accuracy and relevance):

{explanation}
"""

prompt += "\n\nDo not include any title or triple backticks. Only return the description body."

# Generate description from Gemini
response = model.generate_content(prompt)
pr_body = response.text.strip()

# Final output with our controlled title
full_description = f"# 🔖 title: {formatted_title}\n\n{pr_body}"

# Print result
print("\n--- ✨ Generated PR Description ---\n")
print(full_description)
print("\n-----------------------------------\n")

# Save to file
md_output_path = os.path.join(base_dir, "pr-description.md")
with open(md_output_path, "w") as f:
    f.write(full_description)

print(f"✅ Saved to: {md_output_path}")