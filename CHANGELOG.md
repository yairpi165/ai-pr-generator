# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **GitHub Integration**: Full support for GitHub pull request creation
- **Multi-Provider AI Support**: Support for both OpenAI (GPT-4) and Google Gemini AI providers
- **Interactive CLI**: Beautiful colored terminal interface with arrow key navigation
- **Platform-Agnostic Prompts**: AI prompts now work with any Git hosting platform
- **Comprehensive Test Suite**: 396 tests with 98.98% code coverage
- **ESLint Configuration**: Modern ESLint setup with TypeScript and unused imports detection
- **Domain-Driven Architecture**: Refactored to use clean domain separation (`src/domain/`)
- **Reviewers Configuration**: Support for platform-specific code reviewers
- **Output Options**: Copy to clipboard, open in editor, and direct PR creation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript Support**: Full TypeScript implementation with strict typing

### Changed
- **Architecture Refactor**: Moved from `src/lib/` to `src/domain/` structure
- **Package Manager**: Standardized on Yarn instead of npm
- **Test Coverage**: Increased coverage threshold from 35% to 60%
- **CLI Testing**: Replaced brittle regex-based tests with proper unit testing
- **Documentation**: Updated all documentation to reflect new architecture
- **ESLint Configuration**: Removed duplicate `.eslintrc.json`, standardized on `eslint.config.js`
- **AI Prompts**: Made prompts platform-agnostic (removed Bitbucket-specific references)

### Fixed
- **CLI Installation**: Fixed circular alias issue in `install.sh`
- **Provider Selection**: Fixed `--provider` flag to correctly select AI model
- **Interactive Flow**: Fixed UI to show full interactive prompts when using `--provider`
- **Test Coverage**: Fixed failing tests and improved coverage across all modules
- **ESLint Issues**: Fixed all linting errors and warnings
- **Documentation**: Fixed outdated references to old architecture and npm commands
- **Environment Variables**: Added missing GitHub token to `.env.example`

### Removed
- **Duplicate ESLint Config**: Removed `.eslintrc.json` to prevent conflicts
- **Platform-Specific Prompts**: Removed hardcoded "Bitbucket" references from AI prompts
- **Brittle Tests**: Removed regex-based CLI testing in favor of proper unit tests

## [1.0.0] - 2024-01-XX

### Added
- **Initial Release**: First stable version of AI PR Generator
- **Node.js Implementation**: Complete rewrite from Python to Node.js/TypeScript
- **Core Functionality**: 
  - Git diff generation and analysis
  - AI-powered PR description generation
  - Interactive command-line interface
  - File output and clipboard support
  - Bitbucket integration for PR creation
- **Configuration System**: Environment-based configuration with `.env` support
- **Error Handling**: Comprehensive error handling and user feedback
- **Documentation**: Complete README, quick start guide, and project structure docs

### Technical Details
- **Language**: TypeScript with ES modules
- **Runtime**: Node.js 18+
- **Package Manager**: Yarn
- **Testing**: Jest with comprehensive test suite
- **Linting**: ESLint with TypeScript and Prettier
- **Coverage**: 98.98% statement coverage, 96.01% branch coverage
- **Architecture**: Domain-driven design with clean separation of concerns

---

## Version History

### Semantic Versioning
- **MAJOR**: Breaking changes in API or CLI interface
- **MINOR**: New features added in backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Release Process
1. **Development**: Features developed on feature branches
2. **Testing**: Comprehensive test suite with high coverage requirements
3. **Code Review**: All changes reviewed via pull requests
4. **Documentation**: README and changelog updated
5. **Release**: Tagged releases with semantic versioning

---

## Contributing

When contributing to this project, please:

1. **Update CHANGELOG.md**: Add entries for any changes that affect users
2. **Follow Semantic Versioning**: Use appropriate version bump based on change type
3. **Update Documentation**: Keep README and other docs current
4. **Maintain Test Coverage**: Ensure new code is properly tested
5. **Follow Code Style**: Use ESLint and Prettier for consistent formatting

### Changelog Entry Format

```markdown
### Added
- New features or capabilities

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in future releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security-related fixes
``` 