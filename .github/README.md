# GitHub Actions

This repository uses GitHub Actions for continuous integration and releases.

## Workflows

### CI (`ci.yml`)
**Triggers**: Push to `main`, Pull Requests to `main`

**What it does**:
- ✅ Runs on Node.js 18 and 20
- ✅ Installs dependencies with Yarn
- ✅ Runs linting (`yarn lint`)
- ✅ Runs type checking (`yarn tsc`)
- ✅ Runs tests (`yarn test`)
- ✅ Builds the project (`yarn build`)
- ✅ Checks build output
- ✅ Runs security audit (`yarn audit`)

### Release (`release.yml`)
**Triggers**: Manual (workflow_dispatch)

**What it does**:
- ✅ Runs tests and builds
- ✅ Determines version (patch/minor/major/custom)
- ✅ Creates GitHub Release with changelog
- ✅ Updates package.json version
- ✅ Creates Git tag and pushes to repository
- ✅ Creates release branch (release/v1.0.0)

## How to Create a Release

### 1. Manual Release
1. Go to [Actions](https://github.com/yairpi165/ai-pr-generator/actions)
2. Click on "Create GitHub Release"
3. Click "Run workflow"
4. Choose version type:
   - **patch**: 1.0.0 → 1.0.1 (bug fixes)
   - **minor**: 1.0.0 → 1.1.0 (new features)
   - **major**: 1.0.0 → 2.0.0 (breaking changes)
   - **custom**: Specify exact version (e.g., 1.0.0-beta.1)
5. Click "Run workflow"

### 2. What happens during release
1. **Tests**: Runs all tests to ensure quality
2. **Build**: Compiles TypeScript to JavaScript
3. **Version**: Updates package.json version
4. **Release**: Creates GitHub Release with changelog
5. **Tag**: Creates Git tag and pushes to repository
6. **Branch**: Creates release branch (release/v1.0.0)

## Local Development

To test the release process locally:

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Build project
yarn build

# Check build output
ls -la dist/
node dist/cli.js --help

# Test npm pack (dry run)
npm pack --dry-run
```

## Troubleshooting

### Release fails
- Verify package.json has correct name and version
- Ensure all tests pass
- Check that build output is valid

### CI fails
- Check Node.js version compatibility
- Verify all dependencies are installed
- Run tests locally to debug issues
- Check linting and type checking 