# COMMIT GUIDELINES

## COMMIT_PROTOCOL

### PRE_COMMIT_REQUIREMENTS:
**MANDATORY_CHECKLIST:**
- All tests passing (development-protocol.md)
- Functionality verified (testing-checklist.md)
- Documentation updated
- No breaking changes
- Code quality maintained

---

## COMMIT_MESSAGE_FORMAT:

### STANDARD_FORMAT:
```
[PHASE_X] Brief description of changes

- Specific change 1
- Specific change 2
- Tests: status
- Docs: status
```

### EXAMPLES:

#### GOOD_COMMITS:
```
[PHASE_1] Create astro-advanced-starter template

- Cloned astro-blog repository
- Purged blog-specific content
- Maintained 7 core features
- Tests: all passing
- Docs: state-machine updated
```

---

## COMMIT_SEQUENCE:

### 1. PRE_COMMIT_VERIFICATION:
```bash
# Run full test suite
npm run dev # Verify development
npm run build # Verify build
npm run preview # Verify preview

# Check for issues
git status
git diff
```

### 2. STAGING_CHANGES:
```bash
# Stage specific files
git add [specific-files]

# OR stage all (if verified)
git add .

# Verify staged changes
git diff --cached
```

### 3. COMMIT_EXECUTION:
```bash
# Commit with proper message
git commit -m "[PHASE_X] Description

- Change 1
- Change 2
- Tests: passing
- Docs: updated"
```

### 4. IMMEDIATE_PUSH:
```bash
# Push immediately after commit
git push origin main

# Verify remote update
git log --oneline -5
```

---

## QUALITY_GATES:

### GATE_1_CODE_QUALITY:
- [ ] No syntax errors
- [ ] No TypeScript errors
- [ ] No linting violations
- [ ] Consistent formatting

### GATE_2_FUNCTIONALITY:
- [ ] All features working
- [ ] No breaking changes
- [ ] Performance maintained
- [ ] Tests passing

### GATE_3_DOCUMENTATION:
- [ ] State machine updated
- [ ] Context preserved
- [ ] Changes documented
- [ ] Next steps clear

---

**COMMIT_GUIDELINES_VERSION:** 1.0 
**LAST_UPDATE:** 2025-01-02 
**ENFORCEMENT:** MANDATORY_FOR_ALL_COMMITS