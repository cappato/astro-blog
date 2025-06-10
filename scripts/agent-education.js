#!/usr/bin/env node

/**
 * Agent Education Script
 * Simple interactive education system for new agents
 */

const fs = require('fs');
const path = require('path');

function showStartup() {
  console.log('🤖 AGENT EDUCATION SYSTEM\n');
  
  try {
    const startupContent = fs.readFileSync('docs/AGENT-STARTUP.md', 'utf8');
    console.log(startupContent);
  } catch (error) {
    console.log('❌ Could not load startup guide');
    console.log('📍 Please check: docs/AGENT-STARTUP.md');
  }
}

function showQuickStart() {
  console.log('⚡ QUICK START GUIDE\n');
  console.log('🆔 Configure Identity:');
  console.log('   git config user.name "ganzo"');
  console.log('   git config user.email "ganzo@cappato.dev"\n');
  
  console.log('🚀 Main Commands:');
  console.log('   npm run pr:workflow-complete  # Create complete PR');
  console.log('   npm run blog:new              # New blog post');
  console.log('   npm run validate:pr           # Validate before PR');
  console.log('   npm run lessons:search "topic" # Find solutions\n');
  
  console.log('📚 Documentation:');
  console.log('   docs/agent-education/README.md - Main navigation');
  console.log('   docs/agent-education/onboarding/ - Critical docs');
  console.log('   docs/agent-education/workflows/ - Work flows\n');
  
  console.log('🚨 Critical Rules:');
  console.log('   ❌ NEVER emojis in .md files');
  console.log('   ✅ Spanish for docs, English for code');
  console.log('   ✅ Conventional commits required');
  console.log('   ✅ PRs < 300 lines ideally\n');
}

function showEducationMenu() {
  console.log('📚 AGENT EDUCATION MENU\n');
  console.log('Choose your learning path:\n');
  console.log('1. 📖 Complete Startup Guide (2 min)');
  console.log('2. ⚡ Quick Start Commands (30 sec)');
  console.log('3. 🧭 Full Documentation System');
  console.log('4. 🔧 Critical Documents Only');
  console.log('5. 🆘 Troubleshooting Guide');
  console.log('6. 🎯 Task-Specific Learning\n');
  
  console.log('💡 Recommendation: Start with option 1 or 2\n');
}

function openDocument(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf8');
    console.log(`\n📄 ${docPath}\n`);
    console.log('='.repeat(60));
    console.log(content);
    console.log('='.repeat(60));
  } catch (error) {
    console.log(`❌ Could not open: ${docPath}`);
  }
}

function showCriticalDocs() {
  console.log('🔴 CRITICAL DOCUMENTS\n');
  console.log('These 3 documents contain everything essential:\n');
  
  console.log('1.1 📋 Project Identity & Commands');
  console.log('    docs/agent-education/onboarding/project-identity.md\n');
  
  console.log('1.2 🚨 Standards & Rules');
  console.log('    docs/agent-education/onboarding/standards.md\n');
  
  console.log('2.4 🔄 Unified PR Workflow');
  console.log('    docs/agent-education/workflows/unified-pr-workflow.md\n');
  
  console.log('💡 Read these 3 and you\'ll know 90% of what you need!\n');
}

function showTaskSpecific() {
  console.log('🎯 TASK-SPECIFIC LEARNING\n');
  console.log('Tell me what you want to do:\n');
  
  console.log('📝 Create blog post → 1.1, 2.4, 3.1');
  console.log('🐛 Fix bug → 1.2, 2.4, 4.1, 4.3');
  console.log('🔧 Setup initial → 1.1, 1.2, 1.3');
  console.log('🔄 Create PR → 2.4 (unified workflow)');
  console.log('🔍 Git problem → 2.2, 2.4, 4.1');
  console.log('🧪 Testing fails → 2.3, 4.1\n');
  
  console.log('📍 All paths start from: docs/agent-education/README.md\n');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showEducationMenu();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'startup':
    case '1':
      showStartup();
      break;
      
    case 'quick':
    case '2':
      showQuickStart();
      break;
      
    case 'full':
    case '3':
      openDocument('docs/agent-education/README.md');
      break;
      
    case 'critical':
    case '4':
      showCriticalDocs();
      break;
      
    case 'troubleshooting':
    case '5':
      openDocument('docs/agent-education/troubleshooting/common-issues.md');
      break;
      
    case 'task':
    case '6':
      showTaskSpecific();
      break;
      
    case 'identity':
      openDocument('docs/agent-education/onboarding/project-identity.md');
      break;
      
    case 'standards':
      openDocument('docs/agent-education/onboarding/standards.md');
      break;
      
    case 'workflow':
      openDocument('docs/agent-education/workflows/unified-pr-workflow.md');
      break;
      
    default:
      console.log('❌ Unknown command:', command);
      showEducationMenu();
  }
}

if (require.main === module) {
  main();
}

module.exports = { showStartup, showQuickStart, showEducationMenu };
