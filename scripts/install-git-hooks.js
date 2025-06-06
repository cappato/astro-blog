#!/usr/bin/env node

/**
 * Git Hooks Installer
 * Created by Carlos (Carlitos) - Astro Blog Agent
 * 
 * Installs git hooks to prevent direct pushes to main branch
 * Works even without GitHub branch protection (for private repos)
 */

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const createPrePushHook = () => {
  const hookContent = `#!/bin/bash

# Pre-push hook created by Carlos (Carlitos) - Astro Blog Agent
# Prevents direct pushes to protected branches

protected_branches="main master develop"
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\\(.*\\),\\1,')

# Check if current branch is protected
for branch in $protected_branches; do
    if [ "$current_branch" = "$branch" ]; then
        echo ""
        echo "🚨 CARLOS PROTECTION: Direct push to '$branch' branch is not allowed!"
        echo "🤖 Carlos must work through feature branches and Pull Requests."
        echo ""
        echo "✅ Correct workflow:"
        echo "   1. git checkout -b feat/your-feature"
        echo "   2. # make changes"
        echo "   3. git add . && git commit -m 'feat: description'"
        echo "   4. git push origin feat/your-feature"
        echo "   5. Create Pull Request"
        echo ""
        echo "🔧 Quick fix:"
        echo "   npm run git:branch  # Create feature branch"
        echo ""
        exit 1
    fi
done

echo "✅ Push to '$current_branch' branch allowed"
exit 0
`;

  const hooksDir = '.git/hooks';
  const hookPath = join(hooksDir, 'pre-push');

  // Ensure hooks directory exists
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  // Write hook file
  writeFileSync(hookPath, hookContent);
  
  // Make executable
  chmodSync(hookPath, 0o755);
  
  console.log('✅ Pre-push hook installed');
  console.log(`   Location: ${hookPath}`);
  console.log('   Protection: Prevents direct pushes to main/master/develop');
};

const createCommitMsgHook = () => {
  const hookContent = `#!/bin/bash

# Commit message hook created by Carlos (Carlitos) - Astro Blog Agent
# Validates conventional commit format

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo ""
    echo "🚨 CARLOS PROTECTION: Invalid commit message format!"
    echo "🤖 Carlos uses conventional commit format."
    echo ""
    echo "✅ Correct format:"
    echo "   feat: add new feature"
    echo "   fix: resolve bug issue"
    echo "   docs: update documentation"
    echo "   style: format code"
    echo "   refactor: improve code structure"
    echo "   test: add tests"
    echo "   chore: maintenance tasks"
    echo ""
    echo "📋 Your message: $(cat $1)"
    echo ""
    exit 1
fi

echo "✅ Conventional commit format validated"
exit 0
`;

  const hooksDir = '.git/hooks';
  const hookPath = join(hooksDir, 'commit-msg');

  // Write hook file
  writeFileSync(hookPath, hookContent);
  
  // Make executable
  chmodSync(hookPath, 0o755);
  
  console.log('✅ Commit message hook installed');
  console.log(`   Location: ${hookPath}`);
  console.log('   Protection: Validates conventional commit format');
};

const createPreCommitHook = () => {
  const hookContent = `#!/bin/bash

# Pre-commit hook created by Carlos (Carlitos) - Astro Blog Agent
# Additional validations before commit

protected_branches="main master develop"
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\\(.*\\),\\1,')

# Check if current branch is protected
for branch in $protected_branches; do
    if [ "$current_branch" = "$branch" ]; then
        echo ""
        echo "🚨 CARLOS PROTECTION: Direct commit to '$branch' branch is not allowed!"
        echo "🤖 Carlos must work on feature branches."
        echo ""
        echo "🔧 Switch to feature branch first:"
        echo "   npm run git:branch"
        echo ""
        exit 1
    fi
done

# Check for large files (>50MB)
large_files=$(git diff --cached --name-only | xargs -I {} find {} -size +50M 2>/dev/null)
if [ -n "$large_files" ]; then
    echo ""
    echo "🚨 CARLOS PROTECTION: Large files detected!"
    echo "📁 Files larger than 50MB:"
    echo "$large_files"
    echo ""
    echo "🔧 Consider using Git LFS for large files"
    echo ""
    exit 1
fi

echo "✅ Pre-commit validations passed"
exit 0
`;

  const hooksDir = '.git/hooks';
  const hookPath = join(hooksDir, 'pre-commit');

  // Write hook file
  writeFileSync(hookPath, hookContent);
  
  // Make executable
  chmodSync(hookPath, 0o755);
  
  console.log('✅ Pre-commit hook installed');
  console.log(`   Location: ${hookPath}`);
  console.log('   Protection: Prevents commits to protected branches');
};

const testHooks = async () => {
  console.log('\n🧪 Testing git hooks...\n');

  const { execSync } = await import('child_process');

  try {
    // Test current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`Current branch: ${currentBranch}`);

    if (['main', 'master', 'develop'].includes(currentBranch)) {
      console.log('⚠️  WARNING: Currently on protected branch!');
      console.log('🔧 Hooks will prevent commits/pushes on this branch');
    } else {
      console.log('✅ On feature branch - hooks will allow operations');
    }

  } catch (error) {
    console.log('❌ Error testing hooks:', error.message);
  }
};

const main = async () => {
  console.log('🤖 Carlos (Carlitos) - Git Hooks Installer\n');
  console.log('🛡️  Installing protection hooks for private repository...\n');
  
  try {
    // Install hooks
    createPrePushHook();
    createCommitMsgHook();
    createPreCommitHook();
    
    console.log('\n🎉 Git hooks installed successfully!\n');
    console.log('🛡️  Protection enabled:');
    console.log('   ❌ No direct commits to main/master/develop');
    console.log('   ❌ No direct pushes to main/master/develop');
    console.log('   ✅ Conventional commit format enforced');
    console.log('   ✅ Large file detection');
    console.log('\n🤖 Carlos is now protected from breaking workflow rules!');
    
    // Test hooks
    await testHooks();
    
  } catch (error) {
    console.error('\n❌ Failed to install git hooks:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createPrePushHook, createCommitMsgHook, createPreCommitHook };
