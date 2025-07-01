#!/usr/bin/env python3

import os
import subprocess
import sys
import re
import webbrowser

def get_remote_url():
    try:
        return subprocess.check_output(
            ['git', 'remote', 'get-url', 'origin']
        ).decode().strip()
    except Exception:
        print("⚠️ Could not get git remote URL. Exiting.")
        sys.exit(1)

def get_current_branch():
    try:
        return subprocess.check_output(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD']
        ).decode().strip()
    except Exception:
        print("⚠️ Could not get current git branch. Exiting.")
        sys.exit(1)

def detect_provider_and_repo(remote_url):
    remote_url = re.sub(r'\.git$', '', remote_url)
    if "github.com" in remote_url:
        provider = "github"
        m = re.search(r"github\.com[:/](.+)/(.+)", remote_url)
    elif "bitbucket.org" in remote_url:
        provider = "bitbucket"
        m = re.search(r"bitbucket\.org[:/](.+)/(.+)", remote_url)
    elif "gitlab.com" in remote_url:
        provider = "gitlab"
        m = re.search(r"gitlab\.com[:/](.+)/(.+)", remote_url)
    else:
        print("⚠️ Unsupported git provider in remote URL.")
        sys.exit(1)

    if not m:
        print("⚠️ Could not parse owner/repo from remote URL.")
        sys.exit(1)

    owner = m.group(1)
    repo = m.group(2)
    return provider, owner, repo

def build_pr_url(provider, owner, repo, source_branch, target_branch):
    if provider == "github":
        return f"https://github.com/{owner}/{repo}/compare/{target_branch}...{source_branch}?expand=1"
    elif provider == "bitbucket":
        return f"https://bitbucket.org/{owner}/{repo}/pull-requests/new?source={source_branch}&dest={target_branch}"
    elif provider == "gitlab":
        return f"https://gitlab.com/{owner}/{repo}/-/merge_requests/new?merge_request[source_branch]={source_branch}&merge_request[target_branch]={target_branch}"
    else:
        print("⚠️ No supported provider found.")
        sys.exit(1)

def main():
    print("\n🌐 Preparing to open PR page in browser...")

    remote_url = get_remote_url()
    source_branch = get_current_branch()
    target_branch = os.getenv("PR_TARGET_BRANCH", "main").strip()

    provider, owner, repo = detect_provider_and_repo(remote_url)

    pr_url = build_pr_url(provider, owner, repo, source_branch, target_branch)

    print(f"\n🌐 Opening PR page in browser:\n{pr_url}\n")
    webbrowser.open(pr_url)

if __name__ == "__main__":
    main()