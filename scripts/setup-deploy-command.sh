#!/bin/bash

# Setup script for /deploy command

echo "Setting up /deploy command..."

# Add to .zshrc if not already present
if ! grep -q "alias /deploy=" ~/.zshrc 2>/dev/null; then
    echo "" >> ~/.zshrc
    echo "# RosterFrame deployment command" >> ~/.zshrc
    echo "alias /deploy='cd /Users/jacksonfitzgerald/Documents/roster-frame && ./scripts/deploy.sh'" >> ~/.zshrc
    echo "✅ Added /deploy command to ~/.zshrc"
else
    echo "✅ /deploy command already exists in ~/.zshrc"
fi

# Also create a global script (optional)
if [ -d "/usr/local/bin" ]; then
    echo "Creating global deploy command..."
    cat > /tmp/deploy-rosterframe << 'EOF'
#!/bin/bash
cd /Users/jacksonfitzgerald/Documents/roster-frame && ./scripts/deploy.sh
EOF
    
    if sudo mv /tmp/deploy-rosterframe /usr/local/bin/deploy-rosterframe 2>/dev/null && \
       sudo chmod +x /usr/local/bin/deploy-rosterframe 2>/dev/null; then
        echo "✅ Created global 'deploy-rosterframe' command"
    else
        echo "⚠️  Could not create global command (requires sudo)"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To use the command:"
echo "  1. Run: source ~/.zshrc"
echo "     OR close and reopen your terminal"
echo "  2. Type: /deploy"
echo ""
echo "The command will work from any directory!"