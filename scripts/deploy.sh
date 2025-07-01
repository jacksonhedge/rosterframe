#!/bin/bash

# Roster Frame Deployment Script
# This script handles the full deployment process to Vercel via GitHub

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting RosterFrame Deployment Process${NC}"
echo ""

# Function to check if there are uncommitted changes
check_git_status() {
    if [[ -n $(git status -s) ]]; then
        return 0  # Changes exist
    else
        return 1  # No changes
    fi
}

# Function to create commit message
get_commit_message() {
    if [ -z "$1" ]; then
        echo "chore: deploy updates to production"
    else
        echo "$1"
    fi
}

# Step 1: Check current directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in a Next.js project directory${NC}"
    echo "Please run this from the roster-frame root directory"
    exit 1
fi

echo -e "${YELLOW}📍 Current directory:${NC} $(pwd)"
echo ""

# Step 2: Check for uncommitted changes
if check_git_status; then
    echo -e "${YELLOW}📝 Uncommitted changes detected:${NC}"
    git status --short
    echo ""
    
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Get commit message
        read -p "Enter commit message (or press Enter for default): " commit_msg
        commit_msg=$(get_commit_message "$commit_msg")
        
        # Add all changes
        echo -e "${YELLOW}📦 Adding all changes...${NC}"
        git add -A
        
        # Commit changes
        echo -e "${YELLOW}💾 Committing changes...${NC}"
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping commit. Only previously committed changes will be deployed.${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

echo ""

# Step 3: Pull latest changes (to avoid conflicts)
echo -e "${YELLOW}🔄 Pulling latest changes from origin...${NC}"
if git pull origin main --no-edit; then
    echo -e "${GREEN}✅ Successfully pulled latest changes${NC}"
else
    echo -e "${RED}❌ Failed to pull. You may need to resolve conflicts.${NC}"
    exit 1
fi

echo ""

# Step 4: Run build test (optional but recommended)
read -p "Run build test before deploying? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔨 Running build test...${NC}"
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
        exit 1
    fi
fi

echo ""

# Step 5: Push to GitHub (triggers Vercel deployment)
echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
    echo ""
    
    # Get the latest commit hash
    COMMIT_HASH=$(git rev-parse --short HEAD)
    
    echo -e "${GREEN}🎉 Deployment triggered!${NC}"
    echo ""
    echo -e "📋 Deployment Details:"
    echo -e "  • Commit: ${COMMIT_HASH}"
    echo -e "  • Branch: main"
    echo -e "  • Time: $(date)"
    echo ""
    echo -e "🔗 Monitor deployment at:"
    echo -e "   ${YELLOW}https://vercel.com/jackson-fitzgeralds-projects/roster-frame${NC}"
    echo ""
    echo -e "🌐 Your site will be live at:"
    echo -e "   ${YELLOW}https://rosterframe.com${NC} (in ~2-3 minutes)"
    echo ""
    
    # Optional: Open Vercel dashboard
    read -p "Open Vercel dashboard in browser? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://vercel.com/jackson-fitzgeralds-projects/roster-frame"
    fi
    
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Deployment script completed!${NC}"