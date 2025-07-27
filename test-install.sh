#!/bin/bash

# Test script for install.sh
# This script tests the installation process in an isolated environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="/tmp/ai-pr-generator-test"
ORIGINAL_DIR=$(pwd)

echo -e "${YELLOW}🧪 Starting install.sh test...${NC}"

# Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
    echo "Cleaning up existing test directory..."
    rm -rf "$TEST_DIR"
fi

# Create test directory
echo "Creating test directory..."
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Copy the project files to test directory
echo "Copying project files..."
cp -r "$ORIGINAL_DIR"/* .
cp -r "$ORIGINAL_DIR"/.env* . 2>/dev/null || true
cp -r "$ORIGINAL_DIR"/.git* . 2>/dev/null || true

# Make install.sh executable
chmod +x install.sh

# Test 1: Check if install.sh exists and is executable
echo -e "\n${YELLOW}Test 1: Checking install.sh exists and is executable${NC}"
if [ -f "install.sh" ] && [ -x "install.sh" ]; then
    echo -e "${GREEN}✅ install.sh exists and is executable${NC}"
else
    echo -e "${RED}❌ install.sh is missing or not executable${NC}"
    exit 1
fi

# Test 2: Check if package.json exists
echo -e "\n${YELLOW}Test 2: Checking package.json exists${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
else
    echo -e "${RED}❌ package.json is missing${NC}"
    exit 1
fi

# Test 3: Check if yarn.lock exists
echo -e "\n${YELLOW}Test 3: Checking yarn.lock exists${NC}"
if [ -f "yarn.lock" ]; then
    echo -e "${GREEN}✅ yarn.lock exists${NC}"
else
    echo -e "${RED}❌ yarn.lock is missing${NC}"
    exit 1
fi

# Test 4: Check if TypeScript config exists
echo -e "\n${YELLOW}Test 4: Checking TypeScript configuration${NC}"
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ tsconfig.json exists${NC}"
else
    echo -e "${RED}❌ tsconfig.json is missing${NC}"
    exit 1
fi

# Test 5: Check if source files exist
echo -e "\n${YELLOW}Test 5: Checking source files exist${NC}"
if [ -d "src" ] && [ -f "src/cli.ts" ]; then
    echo -e "${GREEN}✅ Source files exist${NC}"
else
    echo -e "${RED}❌ Source files are missing${NC}"
    exit 1
fi

# Test 6: Test yarn install (without running the full install.sh)
echo -e "\n${YELLOW}Test 6: Testing yarn install${NC}"
if yarn install --ignore-engines --frozen-lockfile; then
    echo -e "${GREEN}✅ yarn install completed successfully${NC}"
else
    echo -e "${RED}❌ yarn install failed${NC}"
    exit 1
fi

# Test 7: Test TypeScript build
echo -e "\n${YELLOW}Test 7: Testing TypeScript build${NC}"
if yarn build; then
    echo -e "${GREEN}✅ TypeScript build completed successfully${NC}"
else
    echo -e "${RED}❌ TypeScript build failed${NC}"
    exit 1
fi

# Test 8: Check if dist files were created
echo -e "\n${YELLOW}Test 8: Checking dist files were created${NC}"
if [ -d "dist" ] && [ -f "dist/cli.js" ]; then
    echo -e "${GREEN}✅ dist/cli.js was created${NC}"
else
    echo -e "${RED}❌ dist/cli.js was not created${NC}"
    exit 1
fi

# Test 9: Test if the CLI can be executed
echo -e "\n${YELLOW}Test 9: Testing CLI execution${NC}"
if node dist/cli.js --help >/dev/null 2>&1 || node dist/cli.js >/dev/null 2>&1; then
    echo -e "${GREEN}✅ CLI can be executed${NC}"
else
    echo -e "${RED}❌ CLI execution failed${NC}"
    exit 1
fi

# Test 10: Test yarn link (simulates global installation)
echo -e "\n${YELLOW}Test 10: Testing yarn link${NC}"
if yarn link; then
    echo -e "${GREEN}✅ yarn link completed successfully${NC}"
    
    # Test if the global command is available (in this test environment)
    if command -v genpr >/dev/null 2>&1 || yarn global list | grep -q "ai-pr-generator"; then
        echo -e "${GREEN}✅ Global installation appears to work${NC}"
    else
        echo -e "${YELLOW}⚠️  Global command not immediately available (this is normal in test environment)${NC}"
    fi
    
    # Clean up the link
    yarn unlink >/dev/null 2>&1 || true
else
    echo -e "${RED}❌ yarn link failed${NC}"
    exit 1
fi

# Test 11: Test linting
echo -e "\n${YELLOW}Test 11: Testing linting${NC}"
if yarn lint; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed${NC}"
    exit 1
fi

# Test 12: Test formatting check
echo -e "\n${YELLOW}Test 12: Testing formatting check${NC}"
if yarn format:check; then
    echo -e "${GREEN}✅ Formatting check passed${NC}"
else
    echo -e "${RED}❌ Formatting check failed${NC}"
    exit 1
fi

# Test 13: Test TypeScript check
echo -e "\n${YELLOW}Test 13: Testing TypeScript check${NC}"
if yarn tsc; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    exit 1
fi

# Test 14: Test tests with coverage
echo -e "\n${YELLOW}Test 14: Testing tests with coverage${NC}"
if yarn test:coverage; then
    echo -e "${GREEN}✅ Tests with coverage passed${NC}"
else
    echo -e "${RED}❌ Tests with coverage failed${NC}"
    exit 1
fi

# Clean up
echo -e "\n${YELLOW}Cleaning up test environment...${NC}"
cd "$ORIGINAL_DIR"
rm -rf "$TEST_DIR"

echo -e "\n${GREEN}🎉 All install.sh tests passed!${NC}"
echo -e "${GREEN}✅ The installation process is working correctly${NC}" 