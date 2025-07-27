import { execSync } from 'child_process'
import open from 'open'
import chalk from 'chalk'
import { Reviewers } from './reviewers.js'
import { BitbucketPRData, GitHubPRData } from './types.js'
import { APP_CONSTANTS } from './constants.js'

/**
 * Git hosting services utilities
 */
export class GitHosting {
  /**
   * Creates a PR in Bitbucket automatically
   */
  static async openBitbucketPR(
    title?: string,
    description?: string
  ): Promise<void> {
    try {
      // Get the current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim()

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim()

      // Extract workspace and repository from URL
      let workspace: string
      let repository: string

      if (remoteUrl.startsWith('git@')) {
        // git@bitbucket.org:workspace/repo.git
        const match = remoteUrl.match(
          /git@bitbucket\.org:([^/]+)\/([^/]+)\.git/
        )
        if (!match) {
          throw new Error('Invalid Bitbucket SSH URL format')
        }
        workspace = match[1]
        repository = match[2]
      } else if (remoteUrl.startsWith('https://')) {
        // https://bitbucket.org/workspace/repo.git
        const match = remoteUrl.match(
          /https:\/\/bitbucket\.org\/([^/]+)\/([^/]+)\.git/
        )
        if (!match) {
          throw new Error('Invalid Bitbucket HTTPS URL format')
        }
        workspace = match[1]
        repository = match[2]
      } else {
        throw new Error('Unsupported remote URL format')
      }

      // Get default branch
      const defaultBranch =
        execSync(
          'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
          { encoding: 'utf8' }
        ).trim() || 'main'

      // Check if we have API credentials
      const bitbucketEmail = process.env.BITBUCKET_EMAIL
      const bitbucketToken = process.env.BITBUCKET_TOKEN

      if (!bitbucketEmail || !bitbucketToken) {
        // Fallback to opening in browser if no API credentials
        console.log(chalk.yellow(APP_CONSTANTS.INFO.NO_BITBUCKET_CREDENTIALS))
        console.log(chalk.blue(APP_CONSTANTS.INFO.SET_BITBUCKET_CREDENTIALS))

        const bitbucketUrl = `https://bitbucket.org/${workspace}/${repository}`
        const prUrl = `${bitbucketUrl}/pull-requests/new?source=${currentBranch}`
        await open(prUrl)
        console.log(
          chalk.green(
            `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.OPENED_BITBUCKET}`
          )
        )
        console.log(chalk.blue(`🔗 URL: ${prUrl}`))
        return
      }

      // Get reviewers
      const reviewers = Reviewers.getBitbucketReviewers()
      const reviewerUsernames = reviewers.map(r => r.username).filter(Boolean)

      // Prepare PR data
      const prData: BitbucketPRData = {
        title: title || `PR from ${currentBranch}`,
        description:
          description || `Pull request from branch: ${currentBranch}`,
        source: {
          branch: {
            name: currentBranch,
          },
        },
        destination: {
          branch: {
            name: defaultBranch,
          },
        },
      }

      // Add reviewers if available
      if (reviewerUsernames.length > 0) {
        prData.reviewers = reviewerUsernames
          .filter((username): username is string => username !== undefined)
          .map(username => ({
            display_name: username,
          }))
      }

      // Create PR via API
      const response = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${workspace}/${repository}/pullrequests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${bitbucketEmail}:${bitbucketToken}`
            ).toString('base64')}`,
          },
          body: JSON.stringify(prData),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(
          `Bitbucket API error: ${response.status} - ${errorData}`
        )
      }

      const prResponse = await response.json()
      const prUrl = prResponse.links.html.href

      // Open the created PR in browser
      await open(prUrl)
      console.log(
        chalk.green(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.PR_CREATED}`
        )
      )
      console.log(chalk.blue(`🔗 URL: ${prUrl}`))
      console.log(chalk.cyan(`📝 Title: ${prData.title}`))
    } catch (error) {
      console.error(
        chalk.red(`${APP_CONSTANTS.EMOJIS.ERROR} Error creating Bitbucket PR:`),
        error
      )
      console.log(chalk.yellow(APP_CONSTANTS.ERRORS.VALID_API_CREDENTIALS))
    }
  }

  /**
   * Creates a PR in GitHub automatically
   */
  static async openGitHubPR(
    title?: string,
    description?: string
  ): Promise<void> {
    try {
      // Get the current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim()

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim()

      // Extract owner and repository from URL
      let owner: string
      let repository: string

      if (remoteUrl.startsWith('git@')) {
        // git@github.com:owner/repo.git
        const match = remoteUrl.match(/git@github\.com:([^/]+)\/([^/]+)\.git/)
        if (!match) {
          throw new Error('Invalid GitHub SSH URL format')
        }
        owner = match[1]
        repository = match[2]
      } else if (remoteUrl.startsWith('https://')) {
        // https://github.com/owner/repo.git
        const match = remoteUrl.match(
          /https:\/\/github\.com\/([^/]+)\/([^/]+)\.git/
        )
        if (!match) {
          throw new Error('Invalid GitHub HTTPS URL format')
        }
        owner = match[1]
        repository = match[2]
      } else {
        throw new Error('Unsupported remote URL format')
      }

      // Get default branch
      const defaultBranch =
        execSync(
          'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
          { encoding: 'utf8' }
        ).trim() || 'main'

      // Check if we have API credentials
      const githubToken = process.env.GITHUB_TOKEN

      if (!githubToken) {
        // Fallback to opening in browser if no API credentials
        console.log(chalk.yellow(APP_CONSTANTS.INFO.NO_GITHUB_CREDENTIALS))
        console.log(chalk.blue(APP_CONSTANTS.INFO.SET_GITHUB_CREDENTIALS))

        const githubUrl = `https://github.com/${owner}/${repository}`
        const prUrl = `${githubUrl}/compare/${defaultBranch}...${currentBranch}?expand=1`
        await open(prUrl)
        console.log(
          chalk.green(
            `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.OPENED_GITHUB}`
          )
        )
        console.log(chalk.blue(`🔗 URL: ${prUrl}`))
        return
      }

      // Get reviewers
      const reviewers = Reviewers.getGitHubReviewers()
      const reviewerUsernames = reviewers
        .map(r => r.username)
        .filter(Boolean) as string[]

      // Prepare PR data
      const prData: GitHubPRData = {
        title: title || `PR from ${currentBranch}`,
        body: description || `Pull request from branch: ${currentBranch}`,
        head: currentBranch,
        base: defaultBranch,
      }

      // Add reviewers if available
      if (reviewerUsernames.length > 0) {
        prData.reviewers = reviewerUsernames
      }

      // Create PR via API
      const response = await fetch(
        `${APP_CONSTANTS.API_ENDPOINTS.GITHUB_PR}/${owner}/${repository}/pulls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AI-PR-Generator',
          },
          body: JSON.stringify(prData),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`GitHub API error: ${response.status} - ${errorData}`)
      }

      const prResponse = await response.json()
      const prUrl = prResponse.html_url

      // Open the created PR in browser
      await open(prUrl)
      console.log(
        chalk.green(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.PR_CREATED}`
        )
      )
      console.log(chalk.blue(`🔗 URL: ${prUrl}`))
      console.log(chalk.cyan(`📝 Title: ${prData.title}`))
    } catch (error) {
      console.error(
        chalk.red(`${APP_CONSTANTS.EMOJIS.ERROR} Error creating GitHub PR:`),
        error
      )
      console.log(chalk.yellow(APP_CONSTANTS.ERRORS.VALID_API_CREDENTIALS))
    }
  }

  /**
   * Opens a PR in GitLab
   */
  static async openGitLabPR(): Promise<void> {
    try {
      // Get the current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim()

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim()

      // Convert SSH to HTTPS if needed
      let gitlabUrl = remoteUrl
      if (remoteUrl.startsWith('git@')) {
        // Convert git@gitlab.com:username/repo.git to https://gitlab.com/username/repo
        gitlabUrl = remoteUrl
          .replace('git@gitlab.com:', 'https://gitlab.com/')
          .replace('.git', '')
      } else if (remoteUrl.startsWith('https://')) {
        // Remove .git suffix if present
        gitlabUrl = remoteUrl.replace('.git', '')
      }

      // Construct the PR URL
      const prUrl = `${gitlabUrl}/-/merge_requests/new?source_branch=${currentBranch}`

      // Open in browser
      await open(prUrl)
      console.log(chalk.green('✅ Opened GitLab MR page.'))
      console.log(chalk.blue(`🔗 URL: ${prUrl}`))
    } catch (error) {
      console.error(chalk.red('❌ Error opening GitLab MR:'), error)
      console.log(
        chalk.yellow('💡 Make sure you have a remote origin configured.')
      )
    }
  }

  /**
   * Detects the Git hosting platform and opens the appropriate PR page
   */
  static async openPR(title?: string, description?: string): Promise<void> {
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim()

      if (remoteUrl.includes('bitbucket.org')) {
        await this.openBitbucketPR(title, description)
      } else if (remoteUrl.includes('github.com')) {
        await this.openGitHubPR(title, description)
      } else if (remoteUrl.includes('gitlab.com')) {
        await this.openGitLabPR()
      } else {
        console.log(chalk.yellow(APP_CONSTANTS.INFO.UNKNOWN_GIT_PLATFORM))
        console.log(chalk.blue(APP_CONSTANTS.INFO.SUPPORTED_PLATFORMS))
      }
    } catch (error) {
      console.error(
        chalk.red(
          `${APP_CONSTANTS.EMOJIS.ERROR} Error detecting Git hosting platform:`
        ),
        error
      )
    }
  }
}
