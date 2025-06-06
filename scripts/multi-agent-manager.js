#!/usr/bin/env node

/**
 * Multi-Agent Manager
 * Automation script for managing multi-agent coordination
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const DOCS_DIR = 'docs/multi-agent';
const TEMPLATES_DIR = `${DOCS_DIR}/templates`;

class MultiAgentManager {
  constructor() {
    this.agentAssignments = null;
    this.workStatus = null;
    this.conflictLog = null;
  }

  async init() {
    console.log('🤖 Multi-Agent Manager initialized');
    await this.loadCurrentState();
  }

  async loadCurrentState() {
    try {
      // Load current files
      const assignmentsPath = `${DOCS_DIR}/agent-assignments.md`;
      const statusPath = `${DOCS_DIR}/work-status.md`;
      const conflictPath = `${DOCS_DIR}/conflict-log.md`;

      this.agentAssignments = await fs.readFile(assignmentsPath, 'utf8');
      this.workStatus = await fs.readFile(statusPath, 'utf8');
      this.conflictLog = await fs.readFile(conflictPath, 'utf8');

      console.log(' Current state loaded');
    } catch (error) {
      console.error(' Error loading current state:', error.message);
    }
  }

  async checkConflicts() {
    console.log(' Checking for potential conflicts...');

    try {
      // Get current git status
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const modifiedFiles = gitStatus
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3));

      // Parse work status to find active agents
      const activeAgents = this.parseActiveAgents();

      // Check for file conflicts
      const conflicts = this.detectFileConflicts(modifiedFiles, activeAgents);

      if (conflicts.length > 0) {
        console.log('️  Potential conflicts detected:');
        conflicts.forEach(conflict => {
          console.log(`   - ${conflict.file}: ${conflict.agents.join(' vs ')}`);
        });
        return conflicts;
      } else {
        console.log(' No conflicts detected');
        return [];
      }
    } catch (error) {
      console.error(' Error checking conflicts:', error.message);
      return [];
    }
  }

  parseActiveAgents() {
    // Simple parser for active agents from work-status.md
    const lines = this.workStatus.split('\n');
    const agents = [];

    let currentAgent = null;
    for (const line of lines) {
      if (line.startsWith('### Agent')) {
        const match = line.match(/### Agent \d+: (.+)/);
        if (match) {
          currentAgent = {
            name: match[1],
            status: null,
            files: []
          };
        }
      } else if (currentAgent && line.includes('**Status**:')) {
        const statusMatch = line.match(/\*\*Status\*\*:\s*🟢\s*ACTIVE/);
        if (statusMatch) {
          currentAgent.status = 'ACTIVE';
        }
      } else if (currentAgent && line.includes('- `')) {
        const fileMatch = line.match(/- `([^`]+)`/);
        if (fileMatch) {
          currentAgent.files.push(fileMatch[1]);
        }
      } else if (line.startsWith('---') && currentAgent) {
        if (currentAgent.status === 'ACTIVE') {
          agents.push(currentAgent);
        }
        currentAgent = null;
      }
    }

    return agents;
  }

  detectFileConflicts(modifiedFiles, activeAgents) {
    const conflicts = [];
    const fileAgentMap = new Map();

    // Map files to agents
    activeAgents.forEach(agent => {
      agent.files.forEach(file => {
        if (!fileAgentMap.has(file)) {
          fileAgentMap.set(file, []);
        }
        fileAgentMap.get(file).push(agent.name);
      });
    });

    // Check for conflicts
    modifiedFiles.forEach(file => {
      const agents = fileAgentMap.get(file);
      if (agents && agents.length > 1) {
        conflicts.push({
          file,
          agents
        });
      }
    });

    return conflicts;
  }

  async createTaskAssignment(agentName, taskData) {
    console.log(` Creating task assignment for ${agentName}...`);

    try {
      const template = await fs.readFile(`${TEMPLATES_DIR}/task-assignment.md`, 'utf8');

      // Replace template placeholders
      let taskAssignment = template
        .replace(/\[AGENT_NAME\]/g, agentName)
        .replace(/\[YYYY-MM-DD\]/g, new Date().toISOString().split('T')[0])
        .replace(/\[Task title\]/g, taskData.title || 'New Task')
        .replace(/\[Detailed description of what needs to be done\]/g, taskData.description || 'Task description');

      // Save task assignment
      const filename = `task-${agentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
      const filepath = `${DOCS_DIR}/tasks/${filename}`;

      // Ensure tasks directory exists
      await fs.mkdir(`${DOCS_DIR}/tasks`, { recursive: true });
      await fs.writeFile(filepath, taskAssignment);

      console.log(` Task assignment created: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(' Error creating task assignment:', error.message);
    }
  }

  async updateAgentStatus(agentName, statusData) {
    console.log(` Updating status for ${agentName}...`);

    try {
      // Create status update from template
      const template = await fs.readFile(`${TEMPLATES_DIR}/status-update.md`, 'utf8');

      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      let statusUpdate = template
        .replace(/\[AGENT_NAME\]/g, agentName)
        .replace(/\[YYYY-MM-DD HH:MM\]/g, timestamp)
        .replace(/\[Brief description\]/g, statusData.description || 'Working on assigned tasks')
        .replace(/\[X\]% complete/g, `${statusData.progress || 0}% complete`)
        .replace(/\[Time estimate\]/g, statusData.eta || 'TBD');

      console.log(' Status update prepared:');
      console.log(statusUpdate.substring(0, 200) + '...');

      return statusUpdate;
    } catch (error) {
      console.error(' Error updating agent status:', error.message);
    }
  }

  async getLastPR() {
    console.log(' Consultando último PR creado...');

    try {
      // Intentar con GitHub CLI primero
      try {
        const { execSync } = await import('child_process');
        const result = execSync('gh pr list --limit 1 --json number,url,title,author --state open', {
          encoding: 'utf-8',
          timeout: 10000
        });

        const prs = JSON.parse(result);
        if (prs && prs.length > 0) {
          const lastPR = prs[0];
          console.log(` Último PR encontrado: #${lastPR.number}`);
          console.log(`   Título: ${lastPR.title}`);
          console.log(`   Autor: ${lastPR.author.login}`);
          console.log(`   URL: ${lastPR.url}`);

          return {
            number: lastPR.number,
            url: lastPR.url,
            title: lastPR.title,
            author: lastPR.author.login
          };
        }
      } catch (ghError) {
        console.log('️ GitHub CLI no disponible, intentando método alternativo...');
      }

      // Método alternativo: buscar en git log
      try {
        const { execSync } = await import('child_process');
        const branches = execSync('git branch -r --format="%(refname:short)"', {
          encoding: 'utf-8',
          timeout: 5000
        });

        // Buscar ramas que parezcan PRs
        const prBranches = branches.split('\n')
          .filter(branch => branch.includes('origin/') && !branch.includes('main'))
          .map(branch => branch.trim())
          .filter(Boolean);

        if (prBranches.length > 0) {
          console.log(` Ramas encontradas que podrían ser PRs:`);
          prBranches.forEach((branch, index) => {
            console.log(`   ${index + 1}. ${branch}`);
          });

          return {
            method: 'git-branches',
            branches: prBranches,
            suggestion: `Última rama: ${prBranches[0]}`
          };
        }
      } catch (gitError) {
        console.log('️ Error consultando git branches');
      }

      console.log(' No se pudo determinar el último PR automáticamente');
      return null;

    } catch (error) {
      console.error(' Error consultando último PR:', error.message);
      return null;
    }
  }

  async reportPR(agentName, prData) {
    console.log(` Reporting PR for ${agentName}...`);

    try {
      // Si no se proporciona link, intentar obtener el último PR
      if (!prData.link) {
        console.log(' No se proporcionó link, consultando último PR...');
        const lastPR = await this.getLastPR();

        if (lastPR && lastPR.url) {
          prData.link = lastPR.url;
          if (!prData.title && lastPR.title) {
            prData.title = lastPR.title;
          }
          console.log(` Usando último PR: ${prData.link}`);
        } else {
          console.error(' No se pudo obtener el último PR automáticamente');
          console.error(' Proporciona el link manualmente: npm run multi- "Agent" "PR_URL" "Title"');
          return null;
        }
      }

      // Validate required PR data
      if (!prData.link || !prData.title) {
        console.error(' PR link and title are required');
        return null;
      }

      // Load PR report template
      const templatePath = `${TEMPLATES_DIR}/pr-report.md`;
      const template = await fs.readFile(templatePath, 'utf-8');

      // Generate timestamp
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      // Replace template placeholders
      let prReport = template
        .replace(/\[AGENT_NAME\]/g, agentName)
        .replace(/\[YYYY-MM-DD HH:MM\]/g, timestamp)
        .replace(/\[PR_TITLE\]/g, prData.title)
        .replace(/\[PR_LINK\]/g, prData.link);

      // Replace change list if provided
      if (prData.changes && prData.changes.length > 0) {
        const changesList = prData.changes.map(change => `- ${change}`).join('\n');
        prReport = prReport.replace(/- \[Cambio principal 1\]\n- \[Cambio principal 2\]\n- \[Cambio principal 3\]/, changesList);
      }

      console.log(' PR report generated from template');
      console.log(' Please complete the checklist items manually');

      // Append to work status
      const workStatusPath = `${DOCS_DIR}/work-status.md`;
      const currentStatus = await fs.readFile(workStatusPath, 'utf-8');
      const updatedStatus = currentStatus + '\n' + prReport + '\n';
      await fs.writeFile(workStatusPath, updatedStatus);

      console.log(' PR report added to work-status.md');
      console.log(' Next: Complete the checklist and update status as needed');

      return prReport;
    } catch (error) {
      console.error(' Error reporting PR:', error.message);
      return null;
    }
  }

  async generateReport() {
    console.log(' Generating multi-agent coordination report...');

    try {
      const activeAgents = this.parseActiveAgents();
      const conflicts = await this.checkConflicts();

      const report = {
        timestamp: new Date().toISOString(),
        activeAgents: activeAgents.length,
        totalConflicts: conflicts.length,
        agents: activeAgents.map(agent => ({
          name: agent.name,
          status: agent.status,
          filesCount: agent.files.length
        })),
        conflicts: conflicts
      };

      // Save report
      const reportPath = `reports/multi-agent-${Date.now()}.json`;
      await fs.mkdir('reports', { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      console.log(' Report generated:', reportPath);
      console.log(' Summary:');
      console.log(`   - Active Agents: ${report.activeAgents}`);
      console.log(`   - Active Conflicts: ${report.totalConflicts}`);

      return report;
    } catch (error) {
      console.error(' Error generating report:', error.message);
    }
  }

  async validateSetup() {
    console.log(' Validating multi-agent setup...');

    const requiredFiles = [
      `${DOCS_DIR}/agent-assignments.md`,
      `${DOCS_DIR}/work-status.md`,
      `${DOCS_DIR}/conflict-log.md`,
      `${TEMPLATES_DIR}/task-assignment.md`,
      `${TEMPLATES_DIR}/status-update.md`,
      `${TEMPLATES_DIR}/conflict-resolution.md`,
      `${DOCS_DIR}/protocols/shared-protocols.md`,
      `${DOCS_DIR}/protocols/frontend-protocols.md`,
      `${DOCS_DIR}/protocols/content-protocols.md`
    ];

    const issues = [];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        console.log(` ${file}`);
      } catch {
        console.log(` ${file} - Missing`);
        issues.push(`Missing file: ${file}`);
      }
    }

    // Validate protocol compliance
    const protocolIssues = await this.validateProtocolCompliance();
    issues.push(...protocolIssues);

    if (issues.length === 0) {
      console.log(' Multi-agent setup is valid!');
    } else {
      console.log('️  Setup issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return issues;
  }

  async validateProtocolCompliance() {
    console.log(' Validating protocol compliance...');
    const issues = [];

    try {
      // Check if agents are following shared protocols
      const activeAgents = this.parseActiveAgents();

      for (const agent of activeAgents) {
        // Check if agent has required status fields
        if (!agent.files || agent.files.length === 0) {
          issues.push(`Agent ${agent.name}: No files specified in status`);
        }

        // Check if agent is updating status regularly
        // This would require timestamp parsing - simplified for now
        console.log(` Agent ${agent.name}: Basic compliance check passed`);
      }

      console.log(' Protocol compliance validated');
    } catch (error) {
      console.error(' Error validating protocol compliance:', error.message);
      issues.push('Protocol compliance validation failed');
    }

    return issues;
  }

  async checkProtocolCompliance() {
    console.log(' Checking protocol compliance...');

    try {
      const activeAgents = this.parseActiveAgents();
      const violations = [];

      for (const agent of activeAgents) {
        // Check TypeScript usage (simplified check)
        const jsFiles = agent.files.filter(file => file.endsWith('.js') && !file.includes('config'));
        if (jsFiles.length > 0) {
          violations.push(`Agent ${agent.name}: Using JavaScript files instead of TypeScript: ${jsFiles.join(', ')}`);
        }

        // Check status update frequency (simplified)
        if (!agent.lastUpdate || agent.lastUpdate === '[YYYY-MM-DD HH:MM]') {
          violations.push(`Agent ${agent.name}: Status not updated with real timestamp`);
        }

        // Check file ownership
        const unauthorizedFiles = this.checkFileOwnership(agent);
        if (unauthorizedFiles.length > 0) {
          violations.push(`Agent ${agent.name}: Working on unauthorized files: ${unauthorizedFiles.join(', ')}`);
        }
      }

      if (violations.length === 0) {
        console.log(' All agents following protocols');
      } else {
        console.log('️  Protocol violations detected:');
        violations.forEach(violation => console.log(`   - ${violation}`));
      }

      return violations;
    } catch (error) {
      console.error(' Error checking protocol compliance:', error.message);
      return [];
    }
  }

  checkFileOwnership(agent) {
    // Simplified file ownership check
    // In a real implementation, this would parse agent-assignments.md
    const unauthorizedFiles = [];

    // Example rules (would be loaded from agent-assignments.md)
    const frontendFiles = ['src/components/', 'src/layouts/', 'src/styles/'];
    const backendFiles = ['src/pages/api/', 'src/utils/'];
    const contentFiles = ['src/content/', 'docs/', '.md'];

    if (agent.name.includes('Frontend')) {
      agent.files.forEach(file => {
        if (backendFiles.some(pattern => file.includes(pattern))) {
          unauthorizedFiles.push(file);
        }
      });
    }

    return unauthorizedFiles;
  }

  async captureLesson(lessonData) {
    console.log('🧠 Capturing new lesson learned...');

    try {
      const conflictLogPath = `${DOCS_DIR}/conflict-log.md`;
      let conflictLog = await fs.readFile(conflictLogPath, 'utf8');

      // Create lesson entry
      const timestamp = new Date().toISOString().split('T')[0];
      const lessonEntry = this.formatLessonEntry(lessonData, timestamp);

      // Find insertion point in Dynamic Learning System
      const insertionPoint = conflictLog.indexOf('### Rule Application Protocol');
      if (insertionPoint !== -1) {
        const beforeInsertion = conflictLog.slice(0, insertionPoint);
        const afterInsertion = conflictLog.slice(insertionPoint);

        // Insert new lesson
        conflictLog = beforeInsertion + lessonEntry + '\n' + afterInsertion;

        // Write updated file
        await fs.writeFile(conflictLogPath, conflictLog);
        console.log(' Lesson captured and integrated');

        return true;
      } else {
        console.error(' Could not find insertion point in conflict-log.md');
        return false;
      }
    } catch (error) {
      console.error(' Error capturing lesson:', error.message);
      return false;
    }
  }

  formatLessonEntry(lessonData, timestamp) {
    const { type, description, context, enforcement, category } = lessonData;

    return `
#### ${category || 'General'} Rules
- **${type}**: ${description}
- **Context**: ${context}
- **Enforcement**: ${enforcement || 'OBLIGATORY'}
- **Learned**: ${timestamp}
`;
  }

  async interactiveLessonCapture() {
    console.log(' Interactive Lesson Capture');
    console.log('');
    console.log('Describe the lesson learned:');
    console.log('');

    // In a real implementation, this would use readline for interactive input
    // For now, showing the structure
    const exampleLesson = {
      type: 'New Rule Learned',
      description: 'Always validate input parameters before processing',
      context: 'Discovered during conflict resolution that missing validation caused issues',
      enforcement: 'CRITICAL',
      category: 'Development'
    };

    console.log('Example lesson format:');
    console.log(JSON.stringify(exampleLesson, null, 2));
    console.log('');
    console.log('To capture a lesson, use:');
    console.log('npm run multi-');
    console.log('');
    console.log('Or integrate lesson capture into conflict resolution workflow');

    return exampleLesson;
  }

  async analyzePatterns() {
    console.log(' Analyzing conflict and lesson patterns...');

    try {
      // Read conflict log to analyze patterns
      const conflictLogPath = `${DOCS_DIR}/conflict-log.md`;
      const conflictLog = await fs.readFile(conflictLogPath, 'utf8');

      // Extract lessons learned
      const lessons = this.extractLessonsFromLog(conflictLog);

      // Analyze patterns
      const patterns = this.identifyPatterns(lessons);

      // Generate recommendations
      const recommendations = this.generateRecommendations(patterns);

      const analysis = {
        timestamp: new Date().toISOString(),
        totalLessons: lessons.length,
        patterns: patterns,
        recommendations: recommendations
      };

      // Save analysis
      const analysisPath = `reports/lesson-analysis-${Date.now()}.json`;
      await fs.mkdir('reports', { recursive: true });
      await fs.writeFile(analysisPath, JSON.stringify(analysis, null, 2));

      console.log(' Pattern analysis completed');
      console.log(` Analysis saved: ${analysisPath}`);
      console.log('');
      console.log(' Key Findings:');
      console.log(`   - Total lessons: ${lessons.length}`);
      console.log(`   - Patterns identified: ${patterns.length}`);
      console.log(`   - Recommendations: ${recommendations.length}`);

      return analysis;
    } catch (error) {
      console.error(' Error analyzing patterns:', error.message);
      return null;
    }
  }

  extractLessonsFromLog(conflictLog) {
    const lessons = [];
    const lines = conflictLog.split('\n');

    let currentLesson = null;
    for (const line of lines) {
      if (line.startsWith('- **') && line.includes('**:')) {
        if (currentLesson) {
          lessons.push(currentLesson);
        }

        const match = line.match(/- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          currentLesson = {
            type: match[1],
            description: match[2],
            category: 'extracted'
          };
        }
      }
    }

    if (currentLesson) {
      lessons.push(currentLesson);
    }

    return lessons;
  }

  identifyPatterns(lessons) {
    const patterns = [];

    // Pattern 1: Repeated rule types
    const ruleTypes = {};
    lessons.forEach(lesson => {
      const type = lesson.type.toLowerCase();
      ruleTypes[type] = (ruleTypes[type] || 0) + 1;
    });

    Object.entries(ruleTypes).forEach(([type, count]) => {
      if (count > 1) {
        patterns.push({
          type: 'repeated_rule_type',
          description: `Rule type "${type}" appears ${count} times`,
          significance: count > 2 ? 'high' : 'medium'
        });
      }
    });

    // Pattern 2: Common themes
    const themes = {
      typescript: lessons.filter(l => l.description.toLowerCase().includes('typescript')).length,
      communication: lessons.filter(l => l.description.toLowerCase().includes('comunicacion')).length,
      testing: lessons.filter(l => l.description.toLowerCase().includes('test')).length
    };

    Object.entries(themes).forEach(([theme, count]) => {
      if (count > 0) {
        patterns.push({
          type: 'theme_frequency',
          description: `${theme} theme appears in ${count} lessons`,
          significance: count > 2 ? 'high' : 'low'
        });
      }
    });

    return patterns;
  }

  generateRecommendations(patterns) {
    const recommendations = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'repeated_rule_type' && pattern.significance === 'high') {
        recommendations.push({
          type: 'process_improvement',
          description: `Consider creating automated validation for ${pattern.description}`,
          priority: 'high'
        });
      }

      if (pattern.type === 'theme_frequency' && pattern.significance === 'high') {
        recommendations.push({
          type: 'training_focus',
          description: `Focus on improving ${pattern.description.split(' ')[0]} practices`,
          priority: 'medium'
        });
      }
    });

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'system_health',
        description: 'System is learning effectively, continue current practices',
        priority: 'low'
      });
    }

    return recommendations;
  }
}

// CLI Interface
async function main() {
  const manager = new MultiAgentManager();
  await manager.init();

  const command = process.argv[2];

  switch (command) {
    case 'check':
      await manager.checkConflicts();
      break;

    case 'report':
      await manager.generateReport();
      break;

    case 'validate':
      await manager.validateSetup();
      break;

    case 'protocols':
      await manager.checkProtocolCompliance();
      break;

    case 'learn':
      await manager.interactiveLessonCapture();
      break;

    case 'analyze':
      await manager.analyzePatterns();
      break;

    case 'status':
      const agentName = process.argv[3];
      if (!agentName) {
        console.error(' Please provide agent name: npm run multi-agent status "Agent Name"');
        process.exit(1);
      }
      await manager.updateAgentStatus(agentName, {
        description: 'Status update via CLI',
        progress: 50,
        eta: '2 hours'
      });
      break;

    case 'pr':
      const prAgentName = process.argv[3];
      const prLink = process.argv[4];
      const prTitle = process.argv[5];

      if (!prAgentName) {
        console.error(' Usage: npm run multi-agent pr "Agent Name" ["PR_Link"] ["PR Title"]');
        console.error('Examples:');
        console.error('  npm run multi-agent pr ""  # Auto-detect last PR');
        console.error('  npm run multi-agent pr "" "https://github.com/user/repo/pull/123" "Fix SEO meta tags"');
        process.exit(1);
      }

      await manager.reportPR(prAgentName, {
        link: prLink, // Can be undefined for auto-detection
        title: prTitle, // Can be undefined for auto-detection
        changes: ['Changes via CLI - please update manually'],
        testsStatus: '️ Please verify tests',
        docsStatus: '️ Please verify docs',
        impact: 'To be specified'
      });
      break;

    case 'last-pr':
      const lastPR = await manager.getLastPR();
      if (lastPR) {
        if (lastPR.url) {
          console.log('\n ÚLTIMO PR ENCONTRADO:');
          console.log(`   Número: #${lastPR.number}`);
          console.log(`   Título: ${lastPR.title}`);
          console.log(`   Autor: ${lastPR.author}`);
          console.log(`   URL: ${lastPR.url}`);
          console.log('\n Para reportar este PR:');
          console.log(`   npm run multi- "tu_nombre" "${lastPR.url}" "${lastPR.title}"`);
        } else if (lastPR.branches) {
          console.log('\n RAMAS ENCONTRADAS (posibles PRs):');
          lastPR.branches.forEach((branch, index) => {
            console.log(`   ${index + 1}. ${branch}`);
          });
          console.log('\n Verifica manualmente cuál es tu PR en GitHub');
        }
      } else {
        console.log(' No se encontraron PRs recientes');
      }
      break;

    default:
      console.log('🤖 Multi-Agent Manager');
      console.log('');
      console.log('Available commands:');
      console.log('  check     - Check for conflicts');
      console.log('  report    - Generate coordination report');
      console.log('  validate  - Validate setup and protocols');
      console.log('  protocols - Check protocol compliance');
      console.log('  learn     - Capture new lesson learned');
      console.log('  analyze   - Analyze lesson patterns');
      console.log('  status    - Update agent status');
      console.log('  pr        - Report PR creation (follows protocol)');
      console.log('  last-pr   - Get last PR info for easy reporting');
      console.log('');
      console.log('Usage examples:');
      console.log('  node scripts/multi-agent-manager.js check');
      console.log('  node scripts/multi-agent-manager.js report');
      console.log('  node scripts/multi-agent-manager.js validate');
      console.log('  node scripts/multi-agent-manager.js protocols');
      console.log('  node scripts/multi-agent-manager.js learn');
      console.log('  node scripts/multi-agent-manager.js analyze');
      console.log('  node scripts/multi-agent-manager.js status "Frontend Agent"');
      console.log('  node scripts/multi-agent-manager.js pr ""  # Auto-detect last PR');
      console.log('  node scripts/multi-agent-manager.js pr "" "https://github.com/user/repo/pull/123" "Fix SEO meta tags"');
      console.log('  node scripts/multi-agent-manager.js last-pr  # Show last PR info');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MultiAgentManager;
