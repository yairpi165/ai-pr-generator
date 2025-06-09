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

# Load the diff
with open(diff_path, "r") as file:
    diff = file.read()

# Load optional variables
pr_type = os.getenv("PR_TYPE", "feature").capitalize()
pr_title = os.getenv("PR_TITLE")

# Prepare prompt based on title presence
if pr_title:
    prompt = f"""
You're a senior software engineer writing a pull request description for Bitbucket.

The PR type is: **{pr_type}**
The title of the PR is: **{pr_title}**

Please generate a professional PR description in **Markdown format** using the following sections:

# {pr_title}

## 🧠 Summary
## ✅ Changes
## 🔍 Context

Use the following git diff as input:

{diff}

Please return only the raw Markdown content, without wrapping it in triple backticks.
"""
else:
    prompt = f"""
You're a senior software engineer writing a pull request description for Bitbucket.

The PR type is: **{pr_type}**

Please come up with a professional and concise PR title based on the diff and generate a full PR description in **Markdown format** using the following sections:

# <Generated Title>

## 🧠 Summary
## ✅ Changes
## 🔍 Context

Use the following git diff as input:

{diff}

Please return only the raw Markdown content, including the title as an H1 heading (#).
"""

# Generate response
response = model.generate_content(prompt)
pr_description = response.text.strip()

# Print result
print("\n--- ✨ Generated PR Description ---\n")
print(pr_description)
print("\n-----------------------------------\n")

# Save to pr-description.md
md_output_path = os.path.join(base_dir, "pr-description.md")
with open(md_output_path, "w") as f:
    f.write(pr_description)

print(f"✅ Saved to: {md_output_path}")