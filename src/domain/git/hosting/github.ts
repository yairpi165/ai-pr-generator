import open from 'open'
import chalk from 'chalk'
import { getGitHubReviewers } from '../../pr/index.js'
import type { GitHubPRData } from '../../config/types.js'
import { CONFIG_CONSTANTS } from '../../config/constants.js'
import { UI_CONSTANTS } from '../../ui/constants.js'
import { getGitRepository } from '../repository.js'

/**
 * GitHub Repository Information
 */
export interface GitHubRepoInfo {
  readonly owner: string
  readonly repository: string
}

/**
 * Parse GitHub repository information from URL
 */
export const parseGitHubRepo = (remoteUrl: string): GitHubRepoInfo => {
  if (remoteUrl.startsWith('git@')) {
    // git@github.com:owner/repo.git
    const match = remoteUrl.match(/git@github\.com:([^/]+)\/([^/]+)\.git/)
    if (!match) {
      throw new Error('Invalid GitHub SSH URL format')
    }
    return {
      owner: match[1],
      repository: match[2],
    }
  } else if (remoteUrl.startsWith('https://')) {
    // https://github.com/owner/repo.git
    const match = remoteUrl.match(
      /https:\/\/github\.com\/([^/]+)\/([^/]+)\.git/
    )
    if (!match) {
      throw new Error('Invalid GitHub HTTPS URL format')
    }
    return {
      owner: match[1],
      repository: match[2],
    }
  } else {
    throw new Error('Unsupported remote URL format')
  }
}

/**
 * Check GitHub API credentials
 */
export const checkGitHubCredentials = (): string | null => {
  return process.env.GITHUB_TOKEN || null
}

/**
 * Create GitHub PR via API
 */
export const createGitHubPR = async (
  repoInfo: ReturnType<typeof getGitRepository>,
  githubInfo: GitHubRepoInfo,
  token: string,
  title: string,
  description: string
): Promise<void> => {
  const reviewers = getGitHubReviewers()
  const reviewerUsernames = reviewers
    .map(r => r.username)
    .filter((username): username is string => !!username)

  const prData: GitHubPRData = {
    title,
    body: description,
    head: repoInfo.currentBranch,
    base: repoInfo.defaultBranch,
    reviewers: reviewerUsernames,
  }

  const response = await fetch(
    `${CONFIG_CONSTANTS.API.GITHUB_PR}/${githubInfo.owner}/${githubInfo.repository}/pulls`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AI-PR-Generator',
      },
      body: JSON.stringify(prData),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const prUrl = result.html_url

  await open(prUrl)
  console.log(
    chalk.green(
      `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.PR_CREATED}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Open GitHub PR in browser (fallback)
 */
export const openGitHubPRInBrowser = async (
  githubInfo: GitHubRepoInfo,
  currentBranch: string
): Promise<void> => {
  const githubUrl = `${CONFIG_CONSTANTS.URLS.GITHUB}/${githubInfo.owner}/${githubInfo.repository}`
  const prUrl = `${githubUrl}/compare/${githubInfo.owner}:${currentBranch}?expand=1`

  await open(prUrl)
  console.log(
    chalk.green(
      `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.OPENED_GITHUB}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Create a PR in GitHub automatically
 */
export const openGitHubPR = async (
  title?: string,
  description?: string
): Promise<void> => {
  try {
    const repoInfo = getGitRepository()
    const githubInfo = parseGitHubRepo(repoInfo.remoteUrl)
    const token = checkGitHubCredentials()

    const finalTitle = title || `PR from ${repoInfo.currentBranch}`
    const finalDescription =
      description || `Pull request from branch: ${repoInfo.currentBranch}`

    if (token) {
      await createGitHubPR(
        repoInfo,
        githubInfo,
        token,
        finalTitle,
        finalDescription
      )
    } else {
      console.log(chalk.yellow(UI_CONSTANTS.INFO.NO_GITHUB_CREDENTIALS))
      console.log(chalk.blue(UI_CONSTANTS.INFO.SET_GITHUB_CREDENTIALS))
      await openGitHubPRInBrowser(githubInfo, repoInfo.currentBranch)
    }
  } catch (error) {
    console.error(chalk.red('Failed to create GitHub PR:'), error)
    throw error
  }
}
