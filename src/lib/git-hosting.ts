import { execSync } from 'child_process';
import open from 'open';
import chalk from 'chalk';
import { Reviewers } from './reviewers.js';
import { BitbucketPRData } from './types.js';

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
      }).trim();

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();

      // Extract workspace and repository from URL
      let workspace: string;
      let repository: string;

      if (remoteUrl.startsWith('git@')) {
        // git@bitbucket.org:workspace/repo.git
        const match = remoteUrl.match(
          /git@bitbucket\.org:([^\/]+)\/([^\/]+)\.git/
        );
        if (!match) {
          throw new Error('Invalid Bitbucket SSH URL format');
        }
        workspace = match[1];
        repository = match[2];
      } else if (remoteUrl.startsWith('https://')) {
        // https://bitbucket.org/workspace/repo.git
        const match = remoteUrl.match(
          /https:\/\/bitbucket\.org\/([^\/]+)\/([^\/]+)\.git/
        );
        if (!match) {
          throw new Error('Invalid Bitbucket HTTPS URL format');
        }
        workspace = match[1];
        repository = match[2];
      } else {
        throw new Error('Unsupported remote URL format');
      }

      // Get default branch
      const defaultBranch =
        execSync(
          'git remote show origin | grep "HEAD branch" | cut -d" " -f5',
          { encoding: 'utf8' }
        ).trim() || 'main';

      // Check if we have API credentials
      const bitbucketEmail = process.env.BITBUCKET_EMAIL;
      const bitbucketToken = process.env.BITBUCKET_TOKEN;

      if (!bitbucketEmail || !bitbucketToken) {
        // Fallback to opening in browser if no API credentials
        console.log(
          chalk.yellow(
            '⚠️  No Bitbucket API credentials found. Opening in browser instead.'
          )
        );
        console.log(
          chalk.blue(
            '💡 Set BITBUCKET_EMAIL and BITBUCKET_TOKEN environment variables for automatic PR creation.'
          )
        );

        const bitbucketUrl = `https://bitbucket.org/${workspace}/${repository}`;
        const prUrl = `${bitbucketUrl}/pull-requests/new?source=${currentBranch}`;
        await open(prUrl);
        console.log(chalk.green('✅ Opened Bitbucket PR page.'));
        console.log(chalk.blue(`🔗 URL: ${prUrl}`));
        return;
      }

      // Get reviewers
      const reviewers = Reviewers.getBitbucketReviewers();
      const reviewerUsernames = reviewers
        .map((r) => r.username)
        .filter(Boolean);

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
      };

      // Add reviewers if available
      if (reviewerUsernames.length > 0) {
        prData.reviewers = reviewerUsernames
          .filter((username): username is string => username !== undefined)
          .map((username) => ({
            display_name: username,
          }));
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
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Bitbucket API error: ${response.status} - ${errorData}`
        );
      }

      const prResponse = await response.json();
      const prUrl = prResponse.links.html.href;

      // Open the created PR in browser
      await open(prUrl);
      console.log(chalk.green('✅ Created Bitbucket PR successfully!'));
      console.log(chalk.blue(`🔗 URL: ${prUrl}`));
      console.log(chalk.cyan(`📝 Title: ${prData.title}`));
    } catch (error) {
      console.error(chalk.red('❌ Error creating Bitbucket PR:'), error);
      console.log(
        chalk.yellow(
          '💡 Make sure you have a remote origin configured and valid API credentials.'
        )
      );
    }
  }

  /**
   * Opens a PR in GitHub
   */
  static async openGitHubPR(): Promise<void> {
    try {
      // Get the current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();

      // Convert SSH to HTTPS if needed
      let githubUrl = remoteUrl;
      if (remoteUrl.startsWith('git@')) {
        // Convert git@github.com:username/repo.git to https://github.com/username/repo
        githubUrl = remoteUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('.git', '');
      } else if (remoteUrl.startsWith('https://')) {
        // Remove .git suffix if present
        githubUrl = remoteUrl.replace('.git', '');
      }

      // Construct the PR URL
      const prUrl = `${githubUrl}/compare/${currentBranch}?expand=1`;

      // Open in browser
      await open(prUrl);
      console.log(chalk.green('✅ Opened GitHub PR page.'));
      console.log(chalk.blue(`🔗 URL: ${prUrl}`));
    } catch (error) {
      console.error(chalk.red('❌ Error opening GitHub PR:'), error);
      console.log(
        chalk.yellow('💡 Make sure you have a remote origin configured.')
      );
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
      }).trim();

      // Get the remote URL
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();

      // Convert SSH to HTTPS if needed
      let gitlabUrl = remoteUrl;
      if (remoteUrl.startsWith('git@')) {
        // Convert git@gitlab.com:username/repo.git to https://gitlab.com/username/repo
        gitlabUrl = remoteUrl
          .replace('git@gitlab.com:', 'https://gitlab.com/')
          .replace('.git', '');
      } else if (remoteUrl.startsWith('https://')) {
        // Remove .git suffix if present
        gitlabUrl = remoteUrl.replace('.git', '');
      }

      // Construct the PR URL
      const prUrl = `${gitlabUrl}/-/merge_requests/new?source_branch=${currentBranch}`;

      // Open in browser
      await open(prUrl);
      console.log(chalk.green('✅ Opened GitLab MR page.'));
      console.log(chalk.blue(`🔗 URL: ${prUrl}`));
    } catch (error) {
      console.error(chalk.red('❌ Error opening GitLab MR:'), error);
      console.log(
        chalk.yellow('💡 Make sure you have a remote origin configured.')
      );
    }
  }

  /**
   * Detects the Git hosting platform and opens the appropriate PR page
   */
  static async openPR(): Promise<void> {
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();

      if (remoteUrl.includes('bitbucket.org')) {
        await this.openBitbucketPR();
      } else if (remoteUrl.includes('github.com')) {
        await this.openGitHubPR();
      } else if (remoteUrl.includes('gitlab.com')) {
        await this.openGitLabPR();
      } else {
        console.log(chalk.yellow('⚠️  Unknown Git hosting platform.'));
        console.log(
          chalk.blue('💡 Supported platforms: Bitbucket, GitHub, GitLab')
        );
      }
    } catch (error) {
      console.error(
        chalk.red('❌ Error detecting Git hosting platform:'),
        error
      );
    }
  }
}
