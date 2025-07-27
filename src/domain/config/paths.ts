import path from 'path'
import { CONFIG_CONSTANTS } from './constants.js'

// Project paths
export const projectRoot = CONFIG_CONSTANTS.PATHS.PROJECT_ROOT
export const outputPath = path.join(
  projectRoot,
  CONFIG_CONSTANTS.PATHS.OUTPUT_FILE
)
export const diffPath = path.join(projectRoot, CONFIG_CONSTANTS.PATHS.DIFF_FILE)
export const reviewersPath = path.join(
  projectRoot,
  CONFIG_CONSTANTS.PATHS.REVIEWERS_FILE
)
