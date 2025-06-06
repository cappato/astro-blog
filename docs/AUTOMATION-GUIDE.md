# 🤖 Agent Automation Guide

## 🚀 **GitHub Actions Automation System**

This repository uses **GitHub Actions** for complete workflow automation. No manual console operations required!

## 📋 **How to Use**

### **Step 1: Trigger Automation**
1. Go to the **Actions** tab in GitHub
2. Select **"Agent Automation Workflow"**
3. Click **"Run workflow"**
4. Fill in the form:
   - **Task description**: What you accomplished
   - **Task type**: Choose from feat, fix, docs, style, refactor, test, chore
   - **Auto-merge**: Enable (recommended)
5. Click **"Run workflow"**

### **Step 2: Watch the Magic**
The system will automatically:
- ✅ Create a feature branch with proper naming
- ✅ Commit all changes with conventional format
- ✅ Push to remote repository
- ✅ Create a professional Pull Request
- ✅ Enable auto-merge
- ✅ Wait for tests to pass
- ✅ Auto-merge the PR
- ✅ Delete the branch
- ✅ Provide final merged PR link

## 🎯 **Benefits**

### **Professional CI/CD Integration**
- ✅ **Robust**: Uses GitHub's native automation
- ✅ **Reliable**: No console operations that can fail
- ✅ **Auditable**: Full workflow history in Actions
- ✅ **Scalable**: Works for any number of agents

### **Zero Manual Work**
- ❌ No more console commands
- ❌ No more manual PR creation
- ❌ No more manual merging
- ✅ Just trigger and get merged PR link

### **Repository Protection**
- 🔒 **Branch protection** on main
- 🔒 **Required status checks**
- 🔒 **Auto-merge** only when tests pass
- 🔒 **Conventional commits** enforced

## 🛠️ **Repository Setup**

### **Automatic Setup**
The repository is automatically configured when you run the **"Setup Repository Automation"** workflow:

- **Branch Protection**: Main branch protected
- **Auto-merge**: Enabled at repository level
- **Labels**: All automation labels created
- **Settings**: Optimized for automation

### **Manual Setup (if needed)**
If automatic setup fails (requires admin permissions):

1. **Enable auto-merge**:
   - Go to Settings → General
   - Check "Allow auto-merge"
   - Check "Allow squash merging"

2. **Configure branch protection**:
   - Go to Settings → Branches
   - Add rule for `main`
   - Require status checks
   - Require PR reviews (optional)

## 📊 **Workflow Types**

### **Task Types Available**
- **feat**: New features or enhancements
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code formatting (no logic changes)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### **Automatic Branch Naming**
- `feat/add-new-feature-1234567890`
- `fix/resolve-bug-issue-1234567890`
- `docs/update-readme-1234567890`

## 🔍 **Monitoring**

### **Workflow Status**
- Check **Actions** tab for workflow progress
- Each step is logged and visible
- Failures include cleanup and error details

### **PR Status**
- PRs are created with professional templates
- Auto-merge enabled when tests pass
- Branch deleted automatically after merge

## 🚨 **Troubleshooting**

### **Workflow Fails**
- Check Actions tab for detailed logs
- Common issues: permissions, merge conflicts
- Automatic cleanup removes failed branches

### **Auto-merge Not Working**
- Ensure repository has auto-merge enabled
- Check if all required status checks pass
- Verify branch protection rules

### **No Changes to Commit**
- Workflow will exit gracefully
- No PR created if no changes detected
- Check if files were actually modified

## 📚 **Migration from Manual Scripts**

### **Old Way (Deprecated)**
```bash
npm run git:branch
npm run git:commit  
npm run git:push
npm run git:pr
```

### **New Way (Current)**
1. Go to Actions tab
2. Run "Agent Automation Workflow"
3. Get merged PR link

## 🎉 **Success Indicators**

When automation completes successfully:
- ✅ Workflow shows green checkmark
- ✅ PR is merged and closed
- ✅ Branch is deleted
- ✅ Final step shows merged PR URL

## 🔗 **Related Documentation**

- [Agent Automation Rules](./AGENT-AUTOMATION-RULES.md)
- [Conventional Commits Guide](../.github/workflows/conventional-commits.yml)
- [GitHub Actions Workflows](../.github/workflows/)

---

**🤖 This automation system ensures all agents work consistently and professionally while maintaining code quality and security standards.**
