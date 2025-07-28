# GitHub Actions

This repository uses GitHub Actions for continuous integration and releases.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

### Continuous Integration (`ci.yml`)
- ✅ Installs dependencies with npm
- ✅ Runs linting (`npm run lint`)
- ✅ Runs type checking (`npm run tsc`)
- ✅ Runs tests (`npm test`)
- ✅ Builds the project (`npm run build`)
- ✅ Runs on Node.js 18 and 20
- ✅ Runs security audit (`npm audit`)

### Release Process (`release.yml`)
- ✅ Manual trigger only (`workflow_dispatch`)
- ✅ Version bumping (patch, minor, major, custom)
- ✅ Creates Git tag and release branch
- ✅ Creates GitHub Release
- ✅ Runs on Node.js 18 and 20

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
git clone https://github.com/yairpi165/ai-pr-generator.git
cd ai-pr-generator
npm install
```

### Development Commands
```bash
npm test          # Run tests
npm run build     # Build TypeScript
npm run lint      # Check linting
npm run lint:fix  # Fix linting issues
npm run format    # Format code
npm run check     # Run all checks
npm start         # Run locally
npm run dev       # Development mode
``` 