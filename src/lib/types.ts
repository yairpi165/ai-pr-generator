/**
 * PR Type choice for the CLI
 */
export interface PRTypeChoice {
  name: string;
  value: string;
}

/**
 * PR Generation options
 */
export interface PROptions {
  prType: string;
  prTitle: string;
  ticket: string;
  explanation: string;
}

/**
 * PR Generation result
 */
export interface PRResult {
  title: string;
  body: string;
  fullDescription: string;
}

/**
 * Output action choice
 */
export interface OutputChoice {
  name: string;
  value: 'clipboard' | 'editor' | 'both' | 'nothing' | 'bitbucket';
}

/**
 * AI Response interface
 */
export interface AIResponse {
  text: string;
}

/**
 * AI Configuration
 */
export interface AIConfig {
  openaiApiKey?: string;
  geminiApiKey?: string;
}

/**
 * AI Provider interface
 */
export interface AIProvider {
  /**
   * Name of the provider
   */
  readonly name: string;

  /**
   * Whether this provider is available (has API key)
   */
  isAvailable(): boolean;

  /**
   * Generate content using the provider
   */
  generateContent(prompt: string): Promise<AIResponse>;
}

/**
 * Bitbucket PR data interface
 */
export interface BitbucketPRData {
  title: string;
  description: string;
  source: {
    branch: {
      name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
  };
  reviewers?: Array<{
    display_name: string;
  }>;
}

/**
 * Git hosting platform types
 */
export type GitPlatform = 'bitbucket' | 'github' | 'gitlab';

/**
 * Environment variables interface
 */
export interface EnvironmentConfig {
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  BITBUCKET_EMAIL?: string;
  BITBUCKET_TOKEN?: string;
}
