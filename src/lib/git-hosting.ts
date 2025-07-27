import { execSync } from 'child_process'
import open from 'open'
import chalk from 'chalk'
import { getBitbucketReviewers, getGitHubReviewers } from './reviewers.js'
import type { BitbucketPRData, GitHubPRData } from './types.js'
import { APP_CONSTANTS } from './constants.js'

/**
 * Git Repository Information
 */
export interface GitRepoInfo {
  readonly currentBranch: string
  readonly defaultBranch: string
  readonly remoteUrl: string
}

/**
 * Bitbucket Repository Information
 */
export interface BitbucketRepoInfo {
  readonly workspace: string
  readonly repository: string
}

/**
 * GitHub Repository Information
 */
export interface GitHubRepoInfo {
  readonly owner: string
  readonly repository: string
}

/**
 * Get git repository information
 */
const getGitRepoInfo = (): GitRepoInfo => {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim()

  const remoteUrl = execSync('git remote get-url origin', {
    encoding: 'utf8',
  }).trim()

  const defaultBranch =
    execSync('git remote show origin | grep "HEAD branch" | cut -d" " -f5', {
      encoding: 'utf8',
    }).trim() || 'main'

  return {
    currentBranch,
    defaultBranch,
    remoteUrl,
  }
}

/**
 * Parse Bitbucket repository information from URL
 */
const parseBitbucketRepo = (remoteUrl: string): BitbucketRepoInfo => {
  if (remoteUrl.startsWith('git@')) {
    // git@bitbucket.org:workspace/repo.git
    const match = remoteUrl.match(/git@bitbucket\.org:([^/]+)\/([^/]+)\.git/)
    if (!match) {
      throw new Error('Invalid Bitbucket SSH URL format')
    }
    return {
      workspace: match[1],
      repository: match[2],
    }
  } else if (remoteUrl.startsWith('https://')) {
    // https://bitbucket.org/workspace/repo.git
    const match = remoteUrl.match(
      /https:\/\/bitbucket\.org\/([^/]+)\/([^/]+)\.git/
    )
    if (!match) {
      throw new Error('Invalid Bitbucket HTTPS URL format')
    }
    return {
      workspace: match[1],
      repository: match[2],
    }
  } else {
    throw new Error('Unsupported remote URL format')
  }
}

/**
 * Parse GitHub repository information from URL
 */
const parseGitHubRepo = (remoteUrl: string): GitHubRepoInfo => {
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
 * Check Bitbucket API credentials
 */
const checkBitbucketCredentials = (): {
  email: string
  token: string
} | null => {
  const email = process.env.BITBUCKET_EMAIL
  const token = process.env.BITBUCKET_TOKEN

  if (!email || !token) {
    return null
  }

  return { email, token }
}

/**
 * Check GitHub API credentials
 */
const checkGitHubCredentials = (): string | null => {
  return process.env.GITHUB_TOKEN || null
}

/**
 * Create Bitbucket PR via API
 */
const createBitbucketPR = async (
  repoInfo: GitRepoInfo,
  bitbucketInfo: BitbucketRepoInfo,
  credentials: { email: string; token: string },
  title: string,
  description: string
): Promise<void> => {
  const reviewers = getBitbucketReviewers()
  const reviewerUsernames = reviewers
    .map(r => r.username)
    .filter((username): username is string => !!username)

  const prData: BitbucketPRData = {
    title,
    description,
    source: {
      branch: {
        name: repoInfo.currentBranch,
      },
    },
    destination: {
      branch: {
        name: repoInfo.defaultBranch,
      },
    },
    reviewers: reviewerUsernames.map(username => ({ display_name: username })),
  }

  const response = await fetch(
    `${APP_CONSTANTS.API_ENDPOINTS.BITBUCKET_PR}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}/pullrequests`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${credentials.email}:${credentials.token}`
        ).toString('base64')}`,
      },
      body: JSON.stringify(prData),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Bitbucket API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const prUrl = `${APP_CONSTANTS.BASE_URLS.BITBUCKET}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}/pull-requests/${result.id}`

  await open(prUrl)
  console.log(
    chalk.green(
      `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.PR_CREATED}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Open Bitbucket PR in browser (fallback)
 */
const openBitbucketPRInBrowser = async (
  bitbucketInfo: BitbucketRepoInfo,
  currentBranch: string
): Promise<void> => {
  const bitbucketUrl = `${APP_CONSTANTS.BASE_URLS.BITBUCKET}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}`
  const prUrl = `${bitbucketUrl}/pull-requests/new?source=${currentBranch}`

  await open(prUrl)
  console.log(
    chalk.green(
      `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.OPENED_BITBUCKET}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Create GitHub PR via API
 */
const createGitHubPR = async (
  repoInfo: GitRepoInfo,
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
    `${APP_CONSTANTS.API_ENDPOINTS.GITHUB_PR}/${githubInfo.owner}/${githubInfo.repository}/pulls`,
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
      `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.PR_CREATED}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Open GitHub PR in browser (fallback)
 */
const openGitHubPRInBrowser = async (
  githubInfo: GitHubRepoInfo,
  currentBranch: string
): Promise<void> => {
  const githubUrl = `${APP_CONSTANTS.BASE_URLS.GITHUB}/${githubInfo.owner}/${githubInfo.repository}`
  const prUrl = `${githubUrl}/compare/${githubInfo.owner}:${currentBranch}?expand=1`

  await open(prUrl)
  console.log(
    chalk.green(
      `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.OPENED_GITHUB}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Create a PR in Bitbucket automatically
 */
export const openBitbucketPR = async (
  title?: string,
  description?: string
): Promise<void> => {
  try {
    const repoInfo = getGitRepoInfo()
    const bitbucketInfo = parseBitbucketRepo(repoInfo.remoteUrl)
    const credentials = checkBitbucketCredentials()

    const finalTitle = title || `PR from ${repoInfo.currentBranch}`
    const finalDescription =
      description || `Pull request from branch: ${repoInfo.currentBranch}`

    if (credentials) {
      await createBitbucketPR(
        repoInfo,
        bitbucketInfo,
        credentials,
        finalTitle,
        finalDescription
      )
    } else {
      console.log(chalk.yellow(APP_CONSTANTS.INFO.NO_BITBUCKET_CREDENTIALS))
      console.log(chalk.blue(APP_CONSTANTS.INFO.SET_BITBUCKET_CREDENTIALS))
      await openBitbucketPRInBrowser(bitbucketInfo, repoInfo.currentBranch)
    }
  } catch (error) {
    console.error(chalk.red('Failed to create Bitbucket PR:'), error)
    throw error
  }
}

/**
 * Create a PR in GitHub automatically
 */
export const openGitHubPR = async (
  title?: string,
  description?: string
): Promise<void> => {
  try {
    const repoInfo = getGitRepoInfo()
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
      console.log(chalk.yellow(APP_CONSTANTS.INFO.NO_GITHUB_CREDENTIALS))
      console.log(chalk.blue(APP_CONSTANTS.INFO.SET_GITHUB_CREDENTIALS))
      await openGitHubPRInBrowser(githubInfo, repoInfo.currentBranch)
    }
  } catch (error) {
    console.error(chalk.red('Failed to create GitHub PR:'), error)
    throw error
  }
}

/**
 * Open PR based on detected platform
 */
export const openPR = async (
  title?: string,
  description?: string
): Promise<void> => {
  const repoInfo = getGitRepoInfo()
  const remoteUrl = repoInfo.remoteUrl

  if (remoteUrl.includes('bitbucket.org')) {
    await openBitbucketPR(title, description)
  } else if (remoteUrl.includes('github.com')) {
    await openGitHubPR(title, description)
  } else {
    console.log(chalk.yellow(APP_CONSTANTS.INFO.UNKNOWN_GIT_PLATFORM))
    console.log(chalk.blue(APP_CONSTANTS.INFO.SUPPORTED_PLATFORMS))
  }
}
