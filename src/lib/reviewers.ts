import path from 'path';
import { APP_CONSTANTS } from './constants.js';

/**
 * Reviewers configuration for Git hosting platforms
 */
export interface Reviewer {
  name: string;
  email?: string;
  username?: string;
}

/**
 * Reviewers configuration
 */
export interface ReviewersConfig {
  bitbucket?: Reviewer[];
  github?: Reviewer[];
  gitlab?: Reviewer[];
  default?: Reviewer[]; // Used when platform-specific reviewers are not defined
}

/**
 * Reviewers management
 */
export class Reviewers {
  private static config: ReviewersConfig = {};

  /**
   * Load reviewers configuration from file
   */
  static loadConfig(configPath?: string): void {
    try {
      const fs = require('fs');
      const defaultPath =
        configPath || path.join(process.cwd(), APP_CONSTANTS.REVIEWERS_FILE);

      if (fs.existsSync(defaultPath)) {
        const configData = fs.readFileSync(defaultPath, 'utf8');
        this.config = JSON.parse(configData);
        console.log(
          `${APP_CONSTANTS.EMOJIS.SUCCESS} ${APP_CONSTANTS.SUCCESS.LOADED_REVIEWERS}`
        );
      }
    } catch (error) {
      console.log(
        `${APP_CONSTANTS.EMOJIS.WARNING} No reviewers configuration found, using defaults`
      );
    }
  }

  /**
   * Get reviewers for a specific platform
   */
  static getReviewers(platform: 'bitbucket' | 'github' | 'gitlab'): Reviewer[] {
    return this.config[platform] || this.config.default || [];
  }

  /**
   * Get reviewers for Bitbucket
   */
  static getBitbucketReviewers(): Reviewer[] {
    return this.getReviewers('bitbucket');
  }

  /**
   * Get reviewers for GitHub
   */
  static getGitHubReviewers(): Reviewer[] {
    return this.getReviewers('github');
  }

  /**
   * Get reviewers for GitLab
   */
  static getGitLabReviewers(): Reviewer[] {
    return this.getReviewers('gitlab');
  }

  /**
   * Set reviewers configuration
   */
  static setConfig(config: ReviewersConfig): void {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  static getConfig(): ReviewersConfig {
    return this.config;
  }
}
