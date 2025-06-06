---
title: "The Auto-Merge Mystery: When GitHub Actions Lie to You"
description: "Discover why GitHub Actions auto-merge workflows fail silently and learn debugging techniques to solve mysterious "skipped" jobs in production."
date: "2025-06-05"
author: "Matías Cappato"
tags: ["GitHub Actions", "DevOps", "CI/CD", "Automation", "Debugging", "Workflow", "Git", "Development"]
postId: "auto-merge-mystery-github-actions"
imageAlt: "The Auto-Merge Mystery: When GitHub Actions Lie to You - Guía completa"
---

*Part 1 of "Building Bulletproof GitHub Automation" series*

## The Problem That Shouldn't Exist

Picture this: You've just implemented what should be a simple GitHub Actions workflow for auto-merging PRs. The logic is straightforward:

1. ✅ All checks pass
2. ✅ PR has the `auto-merge` label  
3. ✅ No merge conflicts
4. ✅ Auto-merge the PR

Simple, right? **Wrong.**

## When "Working" Code Doesn't Work

Here's what we started with - a workflow that looked perfect on paper:

```yaml
name: PR Automation
on:
  pull_request:
    types: [opened, edited, synchronize, ready_for_review]
  check_suite:
    types: [completed]

jobs:
  auto-merge:
    if: github.event_name == 'check_suite' && github.event.check_suite.conclusion == 'success'
    # ... merge logic
```

**The result?** PRs would sit there, all checks green, auto-merge label applied, and... nothing. The workflow would show as "skipped" with zero explanation.

## The Debugging Journey

### First Clue: The Mysterious Skip

When a GitHub Actions job shows as "skipped," it means the `if` condition evaluated to `false`. But why?

Our first debugging attempt was adding logging:

```javascript
console.log('Event name:', context.eventName);
console.log('Check suite conclusion:', context.payload.check_suite?.conclusion);
```

**Discovery #1:** The `check_suite` event was firing, but sometimes with `conclusion: null` instead of `success`.

### Second Clue: Timing is Everything

We noticed a pattern: the workflow would run immediately when a PR was created, but then never again. Even when all checks eventually passed.

**Discovery #2:** `check_suite.completed` fires when the *suite* completes, not when individual checks complete. If other workflows are still running, you get `null` conclusion.

### Third Clue: The Mergeable State Trap

Even when we fixed the timing, some PRs still wouldn't merge. The logs showed:

```
✅ All checks passed: true
✅ Has auto-merge label: true  
❌ Mergeable: null
```

**Discovery #3:** GitHub's `mergeable` field can be `null` when GitHub is still calculating merge conflicts. Our condition `pr.mergeable !== false` was too strict.

## The Real Problem: GitHub Actions Timing

The core issue wasn't our logic - it was **when** our workflow was running. Here's what was actually happening:

1. **PR created** → `check_suite` fires → Our workflow runs → Other checks still pending → Skip
2. **Checks complete** → No trigger fires → Our workflow never re-evaluates
3. **PR sits forever** → Manual intervention needed

## The Lightbulb Moment

The solution came from understanding GitHub's event model better. We needed our workflow to run not just when check suites complete, but when **individual status checks** update.

Enter the `status` trigger:

```yaml
on:
  pull_request:
    types: [opened, edited, synchronize, ready_for_review]
  check_suite:
    types: [completed]
  status:  # 🎯 This was the missing piece
```

The `status` event fires every time an individual check changes state - including when the *last* check completes.

## Lessons for Future Projects

### 1. GitHub Actions Timing is Tricky
- `check_suite.completed` ≠ "all checks done"
- Use `status` events for granular check updates
- Always log event timing in debugging

### 2. Null States Are Valid States
- `pr.mergeable` can be `null` (calculating)
- Only block on explicit `false`, allow `null`
- GitHub APIs are eventually consistent

### 3. Debug with Real Data
- Synthetic tests miss timing issues
- Use actual PRs for testing workflows
- Log everything during debugging phase

## What's Next

In **Part 2**, we'll dive deep into the technical solution: how to build robust triggers, handle edge cases, and create bulletproof auto-merge logic that works in production.

We'll cover:
- Advanced trigger strategies
- Error handling and fallbacks  
- Performance optimizations
- Security considerations

## Code Repository

All the code from this series is available at: [github.com/your-repo/bulletproof-automation](link)

---

*Have you encountered similar GitHub Actions timing issues? Share your debugging stories in the comments below.*

**Next:** [Part 2 - Timing is Everything: Mastering GitHub Actions Triggers](link-to-part-2)
