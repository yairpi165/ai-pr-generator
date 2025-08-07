import path from 'path'
import fs from 'fs'

/**
 * Get the project root directory (where package.json is located)
 * This ensures that all file operations are relative to the project root,
 * regardless of where the command is run from.
 */
export const getProjectRoot = (): string => {
  // Get the directory where the current script is located
  const scriptDir = path.dirname(new URL(import.meta.url).pathname)
  let currentDir = path.resolve(scriptDir, '..', '..', '..') // Go up to project root

  // Walk up the directory tree to find package.json
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      return currentDir
    }
    currentDir = path.dirname(currentDir)
  }

  // Fallback to current directory if package.json not found
  return process.cwd()
}

/**
 * Get the path to a file relative to the project root
 */
export const getProjectPath = (relativePath: string): string => {
  return path.join(getProjectRoot(), relativePath)
}

/**
 * Get the path to the .env file in the project root
 */
export const getEnvPath = (): string => {
  return path.join(getProjectRoot(), '.env')
}

/**
 * Get the path to the output file
 */
export const getOutputPath = (): string => {
  return getProjectPath('pr-description.md')
}

/**
 * Get the path to the diff file
 */
export const getDiffPath = (): string => {
  return getProjectPath('diff.txt')
}

/**
 * Get the path to the reviewers file
 */
export const getReviewersPath = (): string => {
  return getProjectPath('reviewers.json')
}
