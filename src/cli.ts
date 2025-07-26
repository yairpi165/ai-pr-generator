#!/usr/bin/env node

import chalk from 'chalk';
import { 
  PRGenerator, 
  UI, 
  outputPath, 
  PROptions, 
  Reviewers, 
  APP_CONSTANTS 
} from './lib/index.js';

/**
 * Main CLI class
 */
class CLI {
  private generator: PRGenerator;

  constructor() {
    this.generator = new PRGenerator();
    // Load reviewers configuration
    Reviewers.loadConfig();
  }

  /**
   * Runs the CLI
   */
  async run(): Promise<void> {
    try {
      console.log(chalk.blue.bold(`${APP_CONSTANTS.UI.WELCOME}\n`));

      // Parse command line arguments or get interactive input
      const options = await this.parseInput();

      // Display selected options
      UI.displayOptions(options, this.generator.getCurrentProvider());

      // Generate PR description
      UI.displayProgress(`\n${APP_CONSTANTS.UI.GENERATING_DIFF}`);
      UI.displayProgress(APP_CONSTANTS.UI.GENERATING_PR);

      const result = await this.generator.generatePRDescription(
        options.prType,
        options.prTitle,
        options.ticket,
        options.explanation
      );

      // Save and display result
      const savedPath = this.generator.saveToFile(result.fullDescription);
      UI.displayResult(
        result.fullDescription,
        savedPath,
        this.generator.getCurrentProvider()
      );

      // Handle output options
      await UI.handleOutputOptions(outputPath, result.title, result.body);
    } catch (error) {
      UI.displayError(
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  }

  /**
   * Parses command line arguments or gets interactive input
   */
  private async parseInput(): Promise<PROptions> {
    const args = process.argv.slice(2);

    if (args.length > 0) {
      // Check for provider selection flag
      if (args[0] === '--provider' && args[1]) {
        if (!this.generator.setProvider(args[1])) {
          throw new Error(`Invalid or unavailable provider: ${args[1]}`);
        }
        args.splice(0, 2); // Remove provider args
      }

      if (args.length > 0) {
        return {
          prType: args[0],
          prTitle: args[1] || '',
          ticket: '',
          explanation: '',
        };
      }
    }

    return await UI.getInteractiveInput();
  }
}

// Run the CLI
const cli = new CLI();
cli
  .run()
  .catch((error) =>
    UI.displayError(error instanceof Error ? error : new Error(String(error)))
  );
