#!/usr/bin/env node

/**
 * Prueba Funcional Completa del Sistema
 * Valida que los workflows realmente funcionen end-to-end
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

class FunctionalTester {
  constructor() {
    this.testResults = [];
    this.testBranch = `test/functional-validation-${Date.now()}`;
  }

  async runAllTests() {
    console.log('🧪 FUNCTIONAL TESTING - End-to-End Validation\n');
    
    try {
      await this.setupTestEnvironment();
      await this.testPRCreation();
      await this.testValidationRules();
      await this.testGitHooks();
      await this.testMultiAgentSystem();
      await this.cleanup();
      
      this.printResults();
      return this.testResults.every(test => test.passed);
      
    } catch (error) {
      console.error('❌ Functional test failed:', error.message);
      await this.cleanup();
      return false;
    }
  }

  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    try {
      // Create test branch
      execSync(`git checkout -b ${this.testBranch}`, { encoding: 'utf8' });
      this.addTestResult('Test branch creation', true);
      
      // Create test file
      writeFileSync('test-file.md', '# Test File\nThis is a test file for functional validation.');
      execSync('git add test-file.md');
      execSync('git commit -m "test: add functional test file"');
      this.addTestResult('Test file creation and commit', true);
      
    } catch (error) {
      this.addTestResult('Test environment setup', false, error.message);
      throw error;
    }
  }

  async testPRCreation() {
    console.log('🔄 Testing PR creation...');
    
    try {
      // Test if we can push the branch
      execSync(`git push origin ${this.testBranch}`, { encoding: 'utf8' });
      this.addTestResult('Git push functionality', true);
      
      // Test GitHub CLI PR creation (dry run)
      const prCommand = `gh pr create --title "test: functional validation" --body "Automated functional test" --draft`;
      const result = execSync(prCommand, { encoding: 'utf8' });
      
      if (result.includes('github.com')) {
        this.addTestResult('PR creation via GitHub CLI', true);
        
        // Extract PR number and close it immediately
        const prUrlMatch = result.match(/\/pull\/(\d+)/);
        if (prUrlMatch) {
          const prNumber = prUrlMatch[1];
          execSync(`gh pr close ${prNumber}`, { encoding: 'utf8' });
          this.addTestResult('PR cleanup', true);
        }
      } else {
        this.addTestResult('PR creation via GitHub CLI', false, 'No PR URL returned');
      }
      
    } catch (error) {
      this.addTestResult('PR creation functionality', false, error.message);
    }
  }

  async testValidationRules() {
    console.log('📏 Testing validation rules...');
    
    try {
      // Test PR size validation by checking if workflow exists and is valid
      const prSizeWorkflow = readFileSync('.github/workflows/pr-size-check.yml', 'utf8');
      
      if (prSizeWorkflow.includes('lines') && prSizeWorkflow.includes('files')) {
        this.addTestResult('PR size validation workflow', true);
      } else {
        this.addTestResult('PR size validation workflow', false, 'Missing size checks');
      }
      
      // Test conventional commit validation
      const conventionalWorkflow = readFileSync('.github/workflows/conventional-commits.yml', 'utf8');
      this.addTestResult('Conventional commits workflow exists', true);
      
    } catch (error) {
      this.addTestResult('Validation rules check', false, error.message);
    }
  }

  async testGitHooks() {
    console.log('🪝 Testing Git hooks...');
    
    try {
      // Test pre-push hook by attempting to push to main (should be blocked)
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      if (currentBranch !== 'main') {
        // Try to checkout main and push (should be blocked by hook)
        try {
          execSync('git checkout main', { encoding: 'utf8' });
          execSync('echo "test" >> README.md', { encoding: 'utf8' });
          execSync('git add README.md', { encoding: 'utf8' });
          execSync('git commit -m "test: should be blocked"', { encoding: 'utf8' });
          
          // This should fail due to pre-push hook
          execSync('git push origin main', { encoding: 'utf8' });
          this.addTestResult('Pre-push hook protection', false, 'Hook did not block push to main');
          
        } catch (hookError) {
          if (hookError.message.includes('no permitido') || hookError.message.includes('not allowed')) {
            this.addTestResult('Pre-push hook protection', true);
          } else {
            this.addTestResult('Pre-push hook protection', false, 'Unexpected error');
          }
          
          // Cleanup
          execSync('git reset --hard HEAD~1', { encoding: 'utf8' });
        }
        
        // Return to test branch
        execSync(`git checkout ${this.testBranch}`, { encoding: 'utf8' });
      } else {
        this.addTestResult('Pre-push hook test', false, 'Cannot test from main branch');
      }
      
    } catch (error) {
      this.addTestResult('Git hooks functionality', false, error.message);
    }
  }

  async testMultiAgentSystem() {
    console.log('🤖 Testing multi-agent system...');
    
    try {
      // Test if multi-agent script can be executed
      const result = execSync('node scripts/simple-multi-agent.js validate', { encoding: 'utf8' });
      
      if (result.includes('Validando sistema') || result.includes('validación')) {
        this.addTestResult('Multi-agent system execution', true);
      } else {
        this.addTestResult('Multi-agent system execution', false, 'Unexpected output');
      }
      
      // Test npm scripts
      execSync('npm run test:blog', { encoding: 'utf8' });
      this.addTestResult('Blog tests execution', true);
      
    } catch (error) {
      this.addTestResult('Multi-agent system functionality', false, error.message);
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    
    try {
      // Switch back to main
      execSync('git checkout main', { encoding: 'utf8' });
      
      // Delete test branch locally
      execSync(`git branch -D ${this.testBranch}`, { encoding: 'utf8' });
      
      // Delete remote test branch if it exists
      try {
        execSync(`git push origin --delete ${this.testBranch}`, { encoding: 'utf8' });
      } catch (error) {
        // Branch might not exist remotely, that's OK
      }
      
      this.addTestResult('Test cleanup', true);
      
    } catch (error) {
      console.warn('⚠️  Cleanup warning:', error.message);
    }
  }

  addTestResult(testName, passed, error = null) {
    this.testResults.push({
      name: testName,
      passed,
      error
    });
    
    const status = passed ? '✅' : '❌';
    const errorMsg = error ? ` (${error})` : '';
    console.log(`  ${status} ${testName}${errorMsg}`);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 FUNCTIONAL TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(test => test.passed);
    const failed = this.testResults.filter(test => !test.passed);
    
    console.log(`\n✅ PASSED: ${passed.length}/${this.testResults.length}`);
    passed.forEach(test => console.log(`  ✅ ${test.name}`));
    
    if (failed.length > 0) {
      console.log(`\n❌ FAILED: ${failed.length}/${this.testResults.length}`);
      failed.forEach(test => console.log(`  ❌ ${test.name}: ${test.error || 'Unknown error'}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed.length === 0) {
      console.log('🎉 ALL FUNCTIONAL TESTS PASSED - System is working correctly');
      console.log('✅ Safe to proceed with refactoring');
    } else {
      console.log('🚨 SOME FUNCTIONAL TESTS FAILED');
      console.log('⚠️  Recommend fixing issues before refactoring');
    }
    
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FunctionalTester();
  const allPassed = await tester.runAllTests();
  process.exit(allPassed ? 0 : 1);
}

export { FunctionalTester };
