#!/usr/bin/env node

/**
 * System Metrics and Monitoring
 * Tracks performance and health of the refactored automation system
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

class SystemMetrics {
  constructor() {
    this.metricsDir = 'metrics';
    this.ensureMetricsDir();
  }

  ensureMetricsDir() {
    if (!existsSync(this.metricsDir)) {
      mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  async collectMetrics() {
    const timestamp = new Date().toISOString();
    
    const metrics = {
      timestamp,
      system: await this.getSystemMetrics(),
      performance: await this.getPerformanceMetrics(),
      quality: await this.getQualityMetrics(),
      automation: await this.getAutomationMetrics()
    };

    // Save metrics
    const filename = join(this.metricsDir, `metrics-${timestamp.split('T')[0]}.json`);
    writeFileSync(filename, JSON.stringify(metrics, null, 2));

    return metrics;
  }

  async getSystemMetrics() {
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      return {
        branch: currentBranch,
        uncommitted_changes: gitStatus.split('\n').filter(l => l.trim()).length,
        git_status: gitStatus.trim() ? 'dirty' : 'clean'
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getPerformanceMetrics() {
    const metrics = {};

    try {
      // Test validation speed
      const validationStart = Date.now();
      execSync('npm run validate:emoji', { stdio: 'pipe' });
      metrics.emoji_validation_time = Date.now() - validationStart;
    } catch (error) {
      metrics.emoji_validation_time = -1;
    }

    try {
      // Test build speed
      const buildStart = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      metrics.build_time = Date.now() - buildStart;
    } catch (error) {
      metrics.build_time = -1;
    }

    try {
      // Test test speed
      const testStart = Date.now();
      execSync('npm run test:blog', { stdio: 'pipe' });
      metrics.test_time = Date.now() - testStart;
    } catch (error) {
      metrics.test_time = -1;
    }

    return metrics;
  }

  async getQualityMetrics() {
    const metrics = {};

    try {
      // Count files by type
      const jsFiles = execSync('find . -name "*.js" -not -path "./node_modules/*" | wc -l', { encoding: 'utf8' }).trim();
      const tsFiles = execSync('find . -name "*.ts" -not -path "./node_modules/*" | wc -l', { encoding: 'utf8' }).trim();
      const mdFiles = execSync('find . -name "*.md" -not -path "./node_modules/*" | wc -l', { encoding: 'utf8' }).trim();
      
      metrics.file_counts = {
        javascript: parseInt(jsFiles),
        typescript: parseInt(tsFiles),
        markdown: parseInt(mdFiles)
      };

      // Check for duplications
      const scriptFiles = execSync('find scripts -name "*.js" | wc -l', { encoding: 'utf8' }).trim();
      metrics.script_count = parseInt(scriptFiles);

      // Check emoji compliance
      try {
        execSync('npm run validate:emoji', { stdio: 'pipe' });
        metrics.emoji_compliance = true;
      } catch (error) {
        metrics.emoji_compliance = false;
      }

    } catch (error) {
      metrics.error = error.message;
    }

    return metrics;
  }

  async getAutomationMetrics() {
    const metrics = {};

    try {
      // Check if unified system is enabled
      metrics.unified_pr_system = process.env.USE_UNIFIED_PR_SYSTEM === 'true';
      
      // Count automation files
      const automationFiles = [
        'scripts/simple-multi-agent.js',
        'scripts/unified-pr-manager.js',
        'scripts/validate-pr-ready.js',
        'scripts/validate-emoji-policy.js',
        'scripts/i18n-system.js',
        'scripts/system-metrics.js'
      ];

      metrics.automation_files = {
        total: automationFiles.length,
        existing: automationFiles.filter(f => existsSync(f)).length
      };

      // Check GitHub Actions
      const workflowFiles = execSync('find .github/workflows -name "*.yml" | wc -l', { encoding: 'utf8' }).trim();
      metrics.github_actions = parseInt(workflowFiles);

      // Check package.json scripts
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = Object.keys(pkg.scripts || {});
      metrics.npm_scripts = {
        total: scripts.length,
        multi_agent: scripts.filter(s => s.startsWith('multi-agent')).length,
        validation: scripts.filter(s => s.startsWith('validate')).length,
        pr_related: scripts.filter(s => s.startsWith('pr:')).length
      };

    } catch (error) {
      metrics.error = error.message;
    }

    return metrics;
  }

  async generateReport() {
    const metrics = await this.collectMetrics();
    
    console.log('📊 SYSTEM METRICS REPORT');
    console.log('='.repeat(50));
    
    console.log('\n🖥️  System Status:');
    console.log(`  Branch: ${metrics.system.branch}`);
    console.log(`  Git Status: ${metrics.system.git_status}`);
    console.log(`  Uncommitted Changes: ${metrics.system.uncommitted_changes}`);
    
    console.log('\n⚡ Performance:');
    console.log(`  Emoji Validation: ${metrics.performance.emoji_validation_time}ms`);
    console.log(`  Build Time: ${metrics.performance.build_time}ms`);
    console.log(`  Test Time: ${metrics.performance.test_time}ms`);
    
    console.log('\n📋 Quality:');
    console.log(`  JavaScript Files: ${metrics.quality.file_counts?.javascript || 'N/A'}`);
    console.log(`  TypeScript Files: ${metrics.quality.file_counts?.typescript || 'N/A'}`);
    console.log(`  Markdown Files: ${metrics.quality.file_counts?.markdown || 'N/A'}`);
    console.log(`  Script Files: ${metrics.quality.script_count || 'N/A'}`);
    console.log(`  Emoji Compliance: ${metrics.quality.emoji_compliance ? '✅' : '❌'}`);
    
    console.log('\n🤖 Automation:');
    console.log(`  Unified PR System: ${metrics.automation.unified_pr_system ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  Automation Files: ${metrics.automation.automation_files?.existing}/${metrics.automation.automation_files?.total}`);
    console.log(`  GitHub Actions: ${metrics.automation.github_actions}`);
    console.log(`  Total npm Scripts: ${metrics.automation.npm_scripts?.total}`);
    console.log(`  Multi-agent Scripts: ${metrics.automation.npm_scripts?.multi_agent}`);
    console.log(`  Validation Scripts: ${metrics.automation.npm_scripts?.validation}`);
    console.log(`  PR Scripts: ${metrics.automation.npm_scripts?.pr_related}`);
    
    console.log('\n='.repeat(50));
    console.log(`📁 Metrics saved to: ${this.metricsDir}/`);
    
    return metrics;
  }

  async compareWithBaseline() {
    const current = await this.collectMetrics();
    
    // Try to load baseline
    const baselineFile = join(this.metricsDir, 'baseline.json');
    if (!existsSync(baselineFile)) {
      console.log('📊 No baseline found, creating baseline...');
      writeFileSync(baselineFile, JSON.stringify(current, null, 2));
      return { baseline_created: true };
    }

    const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));
    
    const comparison = {
      timestamp: current.timestamp,
      improvements: [],
      regressions: [],
      changes: {}
    };

    // Compare performance
    if (current.performance.emoji_validation_time < baseline.performance.emoji_validation_time) {
      comparison.improvements.push(`Emoji validation faster: ${baseline.performance.emoji_validation_time}ms → ${current.performance.emoji_validation_time}ms`);
    } else if (current.performance.emoji_validation_time > baseline.performance.emoji_validation_time) {
      comparison.regressions.push(`Emoji validation slower: ${baseline.performance.emoji_validation_time}ms → ${current.performance.emoji_validation_time}ms`);
    }

    // Compare automation
    const baselineScripts = baseline.automation.npm_scripts?.total || 0;
    const currentScripts = current.automation.npm_scripts?.total || 0;
    if (currentScripts > baselineScripts) {
      comparison.improvements.push(`More npm scripts: ${baselineScripts} → ${currentScripts}`);
    }

    // Compare quality
    if (current.quality.emoji_compliance && !baseline.quality.emoji_compliance) {
      comparison.improvements.push('Emoji compliance achieved');
    } else if (!current.quality.emoji_compliance && baseline.quality.emoji_compliance) {
      comparison.regressions.push('Emoji compliance lost');
    }

    console.log('\n📈 COMPARISON WITH BASELINE');
    console.log('='.repeat(50));
    
    if (comparison.improvements.length > 0) {
      console.log('\n✅ Improvements:');
      comparison.improvements.forEach(imp => console.log(`  • ${imp}`));
    }
    
    if (comparison.regressions.length > 0) {
      console.log('\n❌ Regressions:');
      comparison.regressions.forEach(reg => console.log(`  • ${reg}`));
    }
    
    if (comparison.improvements.length === 0 && comparison.regressions.length === 0) {
      console.log('\n📊 No significant changes detected');
    }
    
    return comparison;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const metrics = new SystemMetrics();
  const command = process.argv[2];

  switch (command) {
    case 'collect':
      await metrics.collectMetrics();
      console.log('📊 Metrics collected');
      break;

    case 'report':
      await metrics.generateReport();
      break;

    case 'compare':
      await metrics.compareWithBaseline();
      break;

    case 'baseline':
      const current = await metrics.collectMetrics();
      writeFileSync(join(metrics.metricsDir, 'baseline.json'), JSON.stringify(current, null, 2));
      console.log('📊 Baseline created');
      break;

    default:
      console.log(`
📊 System Metrics

Usage:
  node system-metrics.js collect   - Collect current metrics
  node system-metrics.js report    - Generate full report
  node system-metrics.js compare   - Compare with baseline
  node system-metrics.js baseline  - Set current as baseline
      `);
  }
}

export { SystemMetrics };
