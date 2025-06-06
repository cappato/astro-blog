# DEVELOPMENT PROTOCOL

## MANDATORY_WORKFLOW

### BEFORE_ANY_CODE_CHANGE:
1. **READ_CONTEXT:** state-machine.md for current task
2. **CONFIRM_UNDERSTANDING:** Requirements and success criteria
3. **IDENTIFY_SCOPE:** Files and components to be modified
4. **VERIFY_ENVIRONMENT:** Development setup ready

---

## DURING_DEVELOPMENT:

### INCREMENTAL_APPROACH:
1. **SMALL_CHANGES:** One component/feature at a time
2. **IMMEDIATE_TESTING:** `npm run dev` after each change
3. **VERIFY_FUNCTIONALITY:** Manual check of modified features
4. **NO_BREAKING_CHANGES:** Maintain existing functionality

---

## BEFORE_COMMIT (MANDATORY_CHECKLIST):

### 1. TECHNICAL_TESTS:
- [ ] `npm run dev` - Development server starts without errors
- [ ] `npm run build` - Production build completes successfully
- [ ] `npm run preview` - Preview works (if applicable)
- [ ] `npm test` - All tests pass (if tests exist)

### 2. FUNCTIONALITY_VERIFICATION:
- [ ] **Core features working:** All critical functionality intact
- [ ] **No console errors:** Clean browser console
- [ ] **Responsive design:** Mobile and desktop layouts
- [ ] **Performance maintained:** No significant slowdowns
- [ ] **Links functional:** All navigation and external links work

### 3. DOCUMENTATION_UPDATE (MANDATORY):
- [ ] **CURRENT-TASK.md:** Progress updated
- [ ] **TASK-HISTORY.md:** Session logged
- [ ] **README.md:** Updated if structure changed

---

## COMMIT_PROTOCOL:

### COMMIT_CONDITIONS:
**ONLY_COMMIT_IF:**
- All technical tests pass
- Functionality verified
- Documentation updated
- No breaking changes introduced

### COMMIT_MESSAGE_FORMAT:
```
[PHASE_X] Brief description of changes

- Specific change 1
- Specific change 2
- Tests: all passing
- Docs: updated
```

---

## CRITICAL_RULES:

### NEVER:
- Communicate in English (ALWAYS use Spanish)
- Commit without testing
- Push without documentation update
- End session without state update
- Break existing functionality
- Skip manual verification

### ALWAYS:
- **Interact in Spanish language**
- Test before commit
- Update documentation
- Verify functionality
- Log session progress
- Prepare next session context

---

**PROTOCOL_VERSION:** 1.0 
**LAST_UPDATE:** 2025-01-02 
**ENFORCEMENT:** MANDATORY_FOR_ALL_SESSIONS