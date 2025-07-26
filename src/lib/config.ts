import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { APP_CONSTANTS, PR_TYPES, ENV_VARS } from './constants.js';
import { AIConfig, EnvironmentConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project paths
export const projectRoot = APP_CONSTANTS.PROJECT_ROOT;
export const outputPath = path.join(projectRoot, APP_CONSTANTS.OUTPUT_FILE);
export const diffPath = path.join(projectRoot, APP_CONSTANTS.DIFF_FILE);
export const reviewersPath = path.join(projectRoot, APP_CONSTANTS.REVIEWERS_FILE);

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// AI Configuration
export const aiConfig: AIConfig = {
  openaiApiKey: process.env[ENV_VARS.OPENAI_API_KEY],
  geminiApiKey: process.env[ENV_VARS.GEMINI_API_KEY],
};

// Environment Configuration
export const env: EnvironmentConfig = {
  OPENAI_API_KEY: process.env[ENV_VARS.OPENAI_API_KEY],
  GEMINI_API_KEY: process.env[ENV_VARS.GEMINI_API_KEY],
  BITBUCKET_EMAIL: process.env[ENV_VARS.BITBUCKET_EMAIL],
  BITBUCKET_TOKEN: process.env[ENV_VARS.BITBUCKET_TOKEN],
};

// PR Types
export const prTypes = PR_TYPES;
