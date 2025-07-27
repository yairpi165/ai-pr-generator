import chalk from 'chalk'
import { openBitbucketPR } from './bitbucket.js'
import { openGitHubPR } from './github.js'
import { getGitRepository } from '../repository.js'
import { UI_CONSTANTS } from '../../ui/constants.js'

/**
 * Open PR based on detected platform
 */
export const openPR = async (
  title?: string,
  description?: string
): Promise<void> => {
  const repoInfo = getGitRepository()
  const remoteUrl = repoInfo.remoteUrl

  if (remoteUrl.includes('bitbucket.org')) {
    await openBitbucketPR(title, description)
  } else if (remoteUrl.includes('github.com')) {
    await openGitHubPR(title, description)
  } else {
    console.log(chalk.yellow(UI_CONSTANTS.INFO.UNKNOWN_GIT_PLATFORM))
    console.log(chalk.blue(UI_CONSTANTS.INFO.SUPPORTED_PLATFORMS))
  }
}

// Re-export hosting services
export { openBitbucketPR } from './bitbucket.js'
export { openGitHubPR } from './github.js'
