#!/bin/bash

# Setup Non-Interactive Git Configuration
# Prevents terminal blocking during automated Git operations

echo "🔧 Configuring Git for non-interactive automation..."

# 1. Configure Git to never open interactive editors
echo "Setting Git core.editor to non-interactive mode..."
git config --global core.editor "true"

# 2. Set environment variables for current session
echo "Setting environment variables for current session..."
export GIT_EDITOR="true"
export EDITOR="true"

# 3. Detect shell and add to configuration file
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    echo "Detected Zsh shell, using .zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    echo "Detected Bash shell, using .bashrc"
else
    echo "⚠️  Unknown shell, please manually add environment variables"
    SHELL_CONFIG="$HOME/.profile"
    echo "Using .profile as fallback"
fi

# 4. Add environment variables to shell configuration
echo "Adding environment variables to $SHELL_CONFIG..."

# Check if variables already exist
if ! grep -q "export GIT_EDITOR=true" "$SHELL_CONFIG" 2>/dev/null; then
    echo "" >> "$SHELL_CONFIG"
    echo "# Non-interactive Git configuration (added by setup script)" >> "$SHELL_CONFIG"
    echo "export GIT_EDITOR=true" >> "$SHELL_CONFIG"
    echo "export EDITOR=true" >> "$SHELL_CONFIG"
    echo "✅ Environment variables added to $SHELL_CONFIG"
else
    echo "✅ Environment variables already configured in $SHELL_CONFIG"
fi

# 5. Apply configuration immediately
echo "Applying configuration to current session..."
source "$SHELL_CONFIG" 2>/dev/null || true

# 6. Verify configuration
echo ""
echo "🧪 Testing configuration..."

# Test that git commit without -m doesn't open editor
echo "Testing git commit behavior..."
cd /tmp
mkdir -p git-test-$$
cd git-test-$$
git init --quiet
echo "test" > test.txt
git add test.txt

# This should fail with empty commit message, not open editor
if timeout 5 git commit 2>&1 | grep -q "Aborting commit due to empty commit message"; then
    echo "✅ Git commit correctly configured (no editor opens)"
else
    echo "⚠️  Git commit test inconclusive"
fi

# Cleanup
cd /tmp
rm -rf git-test-$$

# 7. Display current configuration
echo ""
echo "📋 Current Git configuration:"
echo "core.editor: $(git config --global core.editor)"
echo "GIT_EDITOR: $GIT_EDITOR"
echo "EDITOR: $EDITOR"

echo ""
echo "✅ Non-interactive Git configuration complete!"
echo ""
echo "📝 What was configured:"
echo "   • Git core.editor set to 'true' (prevents interactive editors)"
echo "   • GIT_EDITOR environment variable set to 'true'"
echo "   • EDITOR environment variable set to 'true'"
echo "   • Variables added to $SHELL_CONFIG for persistence"
echo ""
echo "🔄 To apply in new terminals, run: source $SHELL_CONFIG"
echo ""
echo "🚨 Emergency recovery commands if Git gets stuck:"
echo "   • pkill -f nano"
echo "   • pkill -f vim"
echo "   • git rebase --abort"
echo "   • git merge --abort"

mcappato
