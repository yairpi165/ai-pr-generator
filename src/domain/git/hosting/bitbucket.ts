import open from 'open'
import chalk from 'chalk'
import type { BitbucketPRData } from '../../config/types.js'

import { CONFIG_CONSTANTS } from '../../config/constants.js'
import { UI_CONSTANTS } from '../../ui/constants.js'
import { getGitRepository } from '../repository.js'
// import { getBitbucketReviewers } from '../../pr/index.js'

/**
 * Bitbucket Repository Information
 */
export interface BitbucketRepoInfo {
  readonly workspace: string
  readonly repository: string
}

/**
 * Parse Bitbucket repository information from URL
 */
export const parseBitbucketRepo = (remoteUrl: string): BitbucketRepoInfo => {
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
    // https://username@bitbucket.org/workspace/repo.git
    // https://bitbucket.org/workspace/repo.git
    const match = remoteUrl.match(
      /https:\/\/(?:[^@]+@)?bitbucket\.org\/([^/]+)\/([^/]+)\.git/
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
 * Check Bitbucket API credentials
 */
export const checkBitbucketCredentials = (): {
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
 * Create Bitbucket PR via API
 */
export const createBitbucketPR = async (
  repoInfo: ReturnType<typeof getGitRepository>,
  bitbucketInfo: BitbucketRepoInfo,
  credentials: { email: string; token: string },
  title: string,
  description: string
): Promise<void> => {
  // const reviewers = getBitbucketReviewers()
  // const reviewerUsernames = reviewers
  //   .map(r => r.username)
  //   .filter((username): username is string => !!username)

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
    // reviewers: reviewerUsernames.length > 0 ? reviewerUsernames.map(username => ({ display_name: username })) : undefined,
  }

  const response = await fetch(
    `${CONFIG_CONSTANTS.API.BITBUCKET_PR}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}/pullrequests`,
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
  const prUrl = `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}/pull-requests/${result.id}`

  await open(prUrl)
  console.log(
    chalk.green(
      `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.PR_CREATED}`
    )
  )
  console.log(chalk.blue(`🔗 URL: ${prUrl}`))
}

/**
 * Open Bitbucket PR in browser (fallback)
 */
export const openBitbucketPRInBrowser = async (
  bitbucketInfo: BitbucketRepoInfo,
  currentBranch: string
): Promise<void> => {
  const bitbucketUrl = `${CONFIG_CONSTANTS.URLS.BITBUCKET}/${bitbucketInfo.workspace}/${bitbucketInfo.repository}`
  const prUrl = `${bitbucketUrl}/pull-requests/new?source=${currentBranch}`

  await open(prUrl)
  console.log(
    chalk.green(
      `${UI_CONSTANTS.EMOJIS.SUCCESS} ${UI_CONSTANTS.SUCCESS.OPENED_BITBUCKET}`
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
    const repoInfo = getGitRepository()
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
      console.log(chalk.yellow(UI_CONSTANTS.INFO.NO_BITBUCKET_CREDENTIALS))
      console.log(chalk.blue(UI_CONSTANTS.INFO.SET_BITBUCKET_CREDENTIALS))
      await openBitbucketPRInBrowser(bitbucketInfo, repoInfo.currentBranch)
    }
  } catch (error) {
    console.error(chalk.red('Failed to create Bitbucket PR:'), error)
    throw error
  }
}
