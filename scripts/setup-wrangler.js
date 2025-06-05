#!/usr/bin/env node

/**
 * Wrangler Setup Script for Cappato.dev Blog
 * Helps configure Wrangler for Cloudflare Pages deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_NAME = 'cappato-blog';
const DOMAIN = 'cappato.dev';

console.log('🚀 Setting up Wrangler for Cappato.dev Blog...\n');

// Check if wrangler is installed
function checkWranglerInstallation() {
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
    console.log('✅ Wrangler is installed');
    return true;
  } catch (error) {
    console.log('❌ Wrangler not found. Installing...');
    return false;
  }
}

// Install wrangler if not present
function installWrangler() {
  try {
    console.log('📦 Installing Wrangler...');
    execSync('npm install wrangler', { stdio: 'inherit' });
    console.log('✅ Wrangler installed successfully');
  } catch (error) {
    console.error('❌ Failed to install Wrangler:', error.message);
    process.exit(1);
  }
}

// Check authentication
function checkAuthentication() {
  try {
    execSync('wrangler whoami', { stdio: 'pipe' });
    console.log('✅ Already authenticated with Cloudflare');
    return true;
  } catch (error) {
    console.log('⚠️  Not authenticated with Cloudflare');
    return false;
  }
}

// Login to Cloudflare
function loginToCloudflare() {
  try {
    console.log('🔐 Opening browser for Cloudflare authentication...');
    execSync('wrangler login', { stdio: 'inherit' });
    console.log('✅ Successfully authenticated with Cloudflare');
  } catch (error) {
    console.error('❌ Failed to authenticate:', error.message);
    process.exit(1);
  }
}

// Check if project exists
function checkProject() {
  try {
    const output = execSync(`wrangler pages project show ${PROJECT_NAME}`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log('✅ Project already exists in Cloudflare Pages');
    return true;
  } catch (error) {
    console.log('⚠️  Project not found in Cloudflare Pages');
    return false;
  }
}

// Create project
function createProject() {
  try {
    console.log(`📝 Creating Cloudflare Pages project: ${PROJECT_NAME}...`);
    execSync(`wrangler pages project create ${PROJECT_NAME}`, { stdio: 'inherit' });
    console.log('✅ Project created successfully');
  } catch (error) {
    console.error('❌ Failed to create project:', error.message);
    console.log('💡 You may need to create the project manually in Cloudflare Dashboard');
  }
}

// Verify build works
function verifyBuild() {
  try {
    console.log('🔨 Testing build process...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check if dist directory exists
    if (fs.existsSync('dist')) {
      console.log('✅ Build successful - dist directory created');
      return true;
    } else {
      console.log('❌ Build failed - no dist directory found');
      return false;
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Show deployment instructions
function showInstructions() {
  console.log('\n🎉 Setup complete! Here are your deployment commands:\n');
  
  console.log('📋 Available Commands:');
  console.log('  npm run deploy              # Deploy to default environment');
  console.log('  npm run deploy:production   # Deploy to production');
  console.log('  npm run deploy:dev          # Deploy to development');
  console.log('  npm run wrangler:list       # List all projects');
  console.log('  npm run wrangler:info       # Show project info');
  
  console.log('\n🚀 Quick Deploy:');
  console.log('  npm run deploy');
  
  console.log('\n🌐 Custom Domain Setup:');
  console.log(`  1. Go to Cloudflare Dashboard > Pages > ${PROJECT_NAME}`);
  console.log(`  2. Go to Custom domains tab`);
  console.log(`  3. Add custom domain: ${DOMAIN}`);
  console.log('  4. Configure DNS records as instructed');
  
  console.log('\n📚 Documentation:');
  console.log('  https://developers.cloudflare.com/pages/');
  
  console.log('\n✨ Happy deploying!');
}

// Main setup process
async function main() {
  try {
    // Step 1: Check/Install Wrangler
    if (!checkWranglerInstallation()) {
      installWrangler();
    }
    
    // Step 2: Check/Setup Authentication
    if (!checkAuthentication()) {
      loginToCloudflare();
    }
    
    // Step 3: Check/Create Project
    if (!checkProject()) {
      createProject();
    }
    
    // Step 4: Verify Build
    if (!verifyBuild()) {
      console.log('⚠️  Build verification failed, but setup can continue');
    }
    
    // Step 5: Show instructions
    showInstructions();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
main();
