---
title: "Timing is Everything: Mastering GitHub Actions Triggers"
description: "Master GitHub Actions timing with multi-trigger strategies, robust error handling, and bulletproof auto-merge logic for production workflows."
date: "2025-06-05"
author: "Matías Cappato"
tags: ["GitHub Actions", "DevOps", "CI/CD", "Automation", "Triggers", "Production", "Workflow", "Error Handling"]
postId: "github-actions-timing-mastery"
imageAlt: "Timing is Everything: Mastering GitHub Actions Triggers - Guía completa"
---

*Part 2 of "Building Bulletproof GitHub Automation" series*

## The Solution: Multi-Trigger Strategy

In [Part 1](link), we discovered that timing issues were breaking our auto-merge workflow. Now let's build the bulletproof solution.

The key insight: **Don't rely on a single trigger.** Use multiple triggers to catch every scenario.

## The Complete Trigger Matrix

```yaml
on:
  pull_request:
    types: [opened, edited, synchronize, ready_for_review]
  pull_request_review:
    types: [submitted]
  check_suite:
    types: [completed]
  status:
  workflow_run:
    workflows: ["Conventional Commits", "Automated Testing Suite"]
    types: [completed]
```

Each trigger serves a specific purpose:

- **`pull_request`**: Initial evaluation and updates
- **`pull_request_review`**: Re-evaluate after approvals
- **`check_suite`**: Batch check completions
- **`status`**: Individual check updates (the game-changer)
- **`workflow_run`**: Specific workflow completions

## The Smart Conditional Logic

The job condition needs to handle all these trigger types:

```yaml
jobs:
  auto-merge:
    if: |
      (github.event_name == 'check_suite' && github.event.check_suite.conclusion == 'success') ||
      (github.event_name == 'pull_request' && github.event.action == 'ready_for_review') ||
      (github.event_name == 'pull_request' && github.event.action == 'synchronize') ||
      (github.event_name == 'pull_request_review' && github.event.review.state == 'approved') ||
      (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success') ||
      (github.event_name == 'status')
```

**Key insight:** For `status` events, we always run - the filtering happens in the script logic.

## Intelligent PR Detection

Different events provide PR information differently. Here's how to handle them all:

```javascript
let prs = [];

if (context.eventName === 'pull_request' || context.eventName === 'pull_request_review') {
  // Direct access to PR
  prs = [context.payload.pull_request];
} else if (context.eventName === 'check_suite') {
  // Find PRs by commit SHA
  const { data: prList } = await github.rest.pulls.list({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open'
  });
  prs = prList.filter(pr => pr.head.sha === context.payload.check_suite.head_sha);
} else if (context.eventName === 'status') {
  // Find PRs by commit SHA from status event
  const { data: prList } = await github.rest.pulls.list({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open'
  });
  prs = prList.filter(pr => pr.head.sha === context.payload.sha);
} else if (context.eventName === 'workflow_run') {
  // Find PRs by workflow run commit
  const { data: prList } = await github.rest.pulls.list({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open'
  });
  prs = prList.filter(pr => pr.head.sha === context.payload.workflow_run.head_sha);
}
```

## Robust Mergeable State Handling

The `mergeable` field is tricky. Here's the bulletproof approach:

```javascript
// Only block if explicitly false, allow null (calculating) and true
const notBlocked = pr.mergeable !== false;

console.log(`Mergeable state: ${pr.mergeable} (null=calculating, true=ready, false=blocked)`);
```

**States explained:**
- `null`: GitHub is calculating (allow merge)
- `true`: Ready to merge (allow merge)  
- `false`: Blocked by conflicts (block merge)

## Comprehensive Check Validation

Handle both check runs and status checks with fallbacks:

```javascript
// Check runs validation
const allChecksPassed = checks.check_runs.length === 0 || checks.check_runs.every(check =>
  check.status === 'completed' &&
  (check.conclusion === 'success' || check.conclusion === 'neutral')
);

// Status checks with error handling
let allStatusesPassed = true;
try {
  const { data: statuses } = await github.rest.repos.getCombinedStatusForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: pr.head.sha
  });
  allStatusesPassed = statuses.state === 'success' || statuses.statuses.length === 0;
} catch (error) {
  console.log('Status checks not accessible, relying on check runs only');
  // Graceful degradation - continue with check runs only
}
```

## Production-Ready Logging

Debugging in production requires comprehensive logging:

```javascript
console.log(`🔄 Checking PR #${pr.number}: ${pr.title}`);
console.log(`  - Has auto-merge label: ${hasAutoMergeLabel}`);
console.log(`  - Is draft: ${pr.draft}`);
console.log(`  - Target branch: ${pr.base.ref}`);
console.log(`  - Check runs: ${checks.check_runs.length}`);
console.log(`  - All checks passed: ${allChecksPassed}`);
console.log(`  - All statuses passed: ${allStatusesPassed}`);
console.log(`  - Mergeable state: ${pr.mergeable}`);
console.log(`  - Ready to merge: ${readyToMerge}`);
```

## Security and Permissions

Don't forget the required permissions:

```yaml
permissions:
  contents: write      # For merging PRs
  pull-requests: write # For PR management  
  issues: write        # For labeling
  checks: read         # For check validation
  statuses: read       # For status checks
  actions: read        # For workflow information
```

## Performance Optimizations

### 1. Early Exit Conditions
```javascript
// Skip non-main branch PRs immediately
if (pr.base.ref !== 'main') {
  console.log(`⏭️ Skipping PR #${pr.number} - not targeting main`);
  continue;
}
```

### 2. Efficient API Usage
```javascript
// Batch API calls when possible
const [checks, reviews] = await Promise.all([
  github.rest.checks.listForRef({...}),
  github.rest.pulls.listReviews({...})
]);
```

## Testing Strategy

### 1. Real PR Testing
Create actual PRs to test timing scenarios:
```bash
git checkout -b test/auto-merge-timing
echo "test" >> README.md
git commit -m "test: verify auto-merge timing"
git push origin test/auto-merge-timing
```

### 2. Event Simulation
Use GitHub's workflow dispatch for testing:
```yaml
on:
  workflow_dispatch:
    inputs:
      test_scenario:
        description: 'Test scenario to run'
        required: true
```

## Common Pitfalls to Avoid

### 1. Race Conditions
- Multiple triggers can fire simultaneously
- Use idempotent operations
- Check if PR is already merged

### 2. API Rate Limits
- GitHub has rate limits for API calls
- Implement exponential backoff
- Cache results when possible

### 3. Permission Errors
- Different events have different permission contexts
- Always handle permission errors gracefully
- Provide clear error messages

## What's Next

In **Part 3**, we'll cover the methodology for continuous improvement: how to process community feedback, implement changes incrementally, and maintain production systems.

---

**Previous:** [Part 1 - The Auto-Merge Mystery](link-to-part-1)  
**Next:** [Part 3 - From Feedback to Production](link-to-part-3)
