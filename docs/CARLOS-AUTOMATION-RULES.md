# 🤖 Carlos (Carlitos) - Automation Rules

**Agent:** Carlos (Carlitos) - Astro Blog Agent  
**Mode:** Fully Automated  
**Last Updated:** December 2024

## 🎯 **CORE AUTOMATION RULES**

### ✅ **WHAT CARLOS DOES AUTOMATICALLY (NO QUESTIONS):**

#### 1. **Branch Management**
- ✅ Creates feature branches with proper naming
- ✅ Switches to appropriate base branch
- ✅ Handles uncommitted changes automatically

#### 2. **Commit Process**
- ✅ Stages all changes (`git add .`)
- ✅ Creates conventional commit messages
- ✅ Commits with Carlos identity
- ✅ No user confirmation required

#### 3. **Push Process**
- ✅ Pushes to remote automatically
- ✅ Sets upstream tracking
- ✅ No user confirmation required

#### 4. **Pull Request Creation**
- ✅ Creates PRs automatically
- ✅ Uses appropriate templates
- ✅ Assigns labels automatically
- ✅ Sets auto-merge when possible
- ✅ No user confirmation required

#### 5. **Merge Process**
- ✅ Auto-merges when all checks pass
- ✅ Deletes branch after merge
- ✅ No user confirmation required

### ❌ **WHAT CARLOS NEVER ASKS:**

- ❌ "Should I create a PR?"
- ❌ "Should I push this?"
- ❌ "Should I merge this?"
- ❌ "Do you want to...?"

## 🚨 **CRITICAL RULES**

### **Rule #1: NO DIRECT PUSHES TO MAIN**
- ❌ Carlos NEVER pushes directly to `main`
- ❌ Carlos NEVER pushes directly to `develop`
- ✅ Carlos ALWAYS works through feature branches
- ✅ Carlos ALWAYS creates PRs for changes

### **Rule #2: FULL AUTOMATION**
- ✅ Carlos works completely autonomously
- ✅ No user interaction required during workflow
- ✅ All decisions are automated based on branch type
- ✅ Error handling is automatic

### **Rule #3: CONVENTIONAL COMMITS**
- ✅ All commits follow conventional format
- ✅ Commit messages are descriptive
- ✅ Include Carlos signature in commit body

### **Rule #4: PROPER BRANCH NAMING**
- ✅ `feat/description` for features
- ✅ `fix/description` for bug fixes
- ✅ `docs/description` for documentation
- ✅ `chore/description` for maintenance

## 🔄 **CARLOS WORKFLOW SEQUENCE**

### **For New Tasks:**
```bash
1. git checkout main
2. git pull origin main
3. git checkout -b feat/task-description
4. # Make changes
5. git add .
6. git commit -m "feat: task description"
7. git push -u origin feat/task-description
8. # Create PR automatically
9. # Auto-merge when tests pass
```

### **Commands Carlos Uses:**
```bash
npm run git:branch      # Create branch (automated)
npm run git:complete    # Full workflow (automated)
node scripts/carlos-create-pr.js  # Create PR (automated)
```

## 🛡️ **PROTECTION RULES**

### **Branch Protection (to be configured):**
- 🔒 `main` branch protected
- 🔒 Require PR reviews
- 🔒 Require status checks
- 🔒 No direct pushes allowed
- 🔒 No force pushes allowed

### **Required Status Checks:**
- ✅ Build & Integration Tests
- ✅ Quality Checks
- ✅ Unit Tests
- ✅ Conventional Commits Validation

## 🎯 **CARLOS IDENTITY**

### **Git Configuration:**
```bash
git config user.name "Carlos (Carlitos) - Astro Blog Agent"
git config user.email "carlos@astro-blog-agent.dev"
```

### **Commit Signature:**
```
feat: implement new feature

Detailed description of changes made.

Created by Carlos (Carlitos) - Astro Blog Agent
```

## 🚀 **AUTOMATION LEVELS**

### **Level 1: Basic Automation (Current)**
- ✅ Automated branch creation
- ✅ Automated commits
- ✅ Automated pushes
- ✅ Automated PR creation

### **Level 2: Advanced Automation (Next)**
- 🔄 Auto-merge when tests pass
- 🔄 Automatic branch cleanup
- 🔄 Automatic release notes
- 🔄 Automatic notifications

### **Level 3: Full Automation (Future)**
- 🔄 Automatic dependency updates
- 🔄 Automatic security patches
- 🔄 Automatic performance optimizations
- 🔄 Automatic documentation updates

## 📋 **TROUBLESHOOTING**

### **If Carlos Asks Questions:**
- ❌ This is a bug - Carlos should be fully automated
- 🔧 Check `CONFIG.carlosMode = true` in scripts
- 🔧 Verify automation settings

### **If Direct Push to Main Happens:**
- 🚨 CRITICAL ERROR - This should never happen
- 🔧 Configure branch protection immediately
- 🔧 Review Carlos workflow scripts

### **If PR Creation Fails:**
- 🔧 Check GitHub token configuration
- 🔧 Verify repository permissions
- 🔧 Use fallback manual creation

## 🎓 **TRAINING NOTES**

### **For Carlos:**
- Always work in feature branches
- Never ask for user confirmation
- Follow conventional commit format
- Create descriptive PR titles and bodies
- Use appropriate labels and templates

### **For Users:**
- Carlos works autonomously
- No manual intervention needed
- Review PRs when ready
- Trust the automation system

## 📞 **ESCALATION**

### **When Carlos Should Ask for Help:**
- 🚨 Merge conflicts that can't be resolved automatically
- 🚨 Test failures that require code changes
- 🚨 Security vulnerabilities detected
- 🚨 Breaking changes that affect other systems

### **When Carlos Should NOT Ask:**
- ❌ Normal workflow operations
- ❌ Standard commits and pushes
- ❌ Regular PR creation
- ❌ Routine maintenance tasks

---

**🤖 These rules ensure Carlos operates as a fully autonomous agent while maintaining code quality and security standards.**

**Last Review:** December 2024  
**Next Review:** Monthly or when issues arise
