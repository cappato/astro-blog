#  Status Update Template

Use this template for regular status updates in work-status.md

---

##  Quick Status Update

### Agent [N]: [AGENT_NAME]
**Last Update**: [YYYY-MM-DD HH:MM]
**Status**: [🟢 ACTIVE | 🟡 PAUSED |  BLOCKED |  INACTIVE]
**Branch**: `agent/[type]/[feature-name]`

#### Current Task
- **Description**: [Brief description]
- **Files Involved**:
  - `path/to/file1`
  - `path/to/file2`
- **Progress**: [X]% complete
- **ETA**: [Time estimate]

#### Completed Today
- [x] Task 1
- [x] Task 2

#### Next Steps
- [ ] Next task 1
- [ ] Next task 2

#### Conflicts/Blockers
- [Description of any conflicts or blockers]

---

##  Detailed Status Update

### Agent Information
- **Agent Name**: [AGENT_NAME]
- **Agent Type**: [Frontend/Backend/Content/Testing/DevOps]
- **Session Start**: [YYYY-MM-DD HH:MM]
- **Last Update**: [YYYY-MM-DD HH:MM]
- **Current Branch**: `agent/[type]/[feature-name]`

### Current Work Session

#### Primary Task
- **Task ID**: [TASK-001]
- **Title**: [Task title]
- **Description**: [Detailed description]
- **Priority**: [HIGH/MEDIUM/LOW]
- **Started**: [YYYY-MM-DD HH:MM]
- **Progress**: [X]% complete
- **ETA**: [Estimated completion time]

#### Files Being Modified
- `src/components/Component.astro` - [Status: In Progress]
- `src/utils/helper.ts` - [Status: Completed]
- `docs/feature.md` - [Status: Pending]

#### Dependencies
- **Waiting for**: [Other agents/tasks this depends on]
- **Blocking**: [Tasks waiting for this work]

### Progress Details

#### Completed This Session
- [x] **[HH:MM]** Implemented core functionality
- [x] **[HH:MM]** Added error handling
- [x] **[HH:MM]** Updated unit tests

#### Currently Working On
- [ ] **[Current]** Refining user interface
- [ ] **[Next]** Adding accessibility features

#### Planned Next Steps
- [ ] Complete UI refinements (30 min)
- [ ] Run full test suite (15 min)
- [ ] Update documentation (20 min)
- [ ] Create pull request (10 min)

### Coordination Status

#### Active Coordination
- **With Agent [X]**: [Description of coordination]
- **Status**: [Ongoing/Waiting/Completed]
- **Next Action**: [What needs to happen next]

#### Conflicts Detected
- **Type**: [File/Dependency/Architecture/Resource]
- **Description**: [Detailed description]
- **Impact**: [How it affects current work]
- **Proposed Resolution**: [Suggested solution]

#### Communication Log
```
[HH:MM] → Agent2: "Starting work on shared utility file"
[HH:MM] ← Agent2: "Acknowledged, will wait for completion"
[HH:MM] → All: "Theme utilities updated, safe to proceed"
```

### Quality Metrics

#### Code Quality
- **Tests Written**: [X] new tests
- **Tests Passing**: [X/Y] tests passing
- **Code Coverage**: [X]% (target: 80%+)
- **Linting**:  No issues

#### Performance
- **Build Time**: [X] seconds
- **Bundle Size**: [X] KB (change: +/-[X] KB)
- **Performance Score**: [X]/100

### Risk Assessment

#### Current Risks
- **Risk 1**: [Description and mitigation]
- **Risk 2**: [Description and mitigation]

#### Blockers
- **Blocker 1**: [Description and resolution plan]
- **Blocker 2**: [Description and resolution plan]

---

##  Conflict Reporting Template

### Conflict Alert
**Detected**: [YYYY-MM-DD HH:MM]
**Type**: [File Conflict | Dependency Conflict | Architecture Conflict | Resource Conflict]
**Severity**: [LOW | MEDIUM | HIGH | CRITICAL]

#### Conflict Details
- **Agents Involved**: [Agent1] vs [Agent2]
- **Files/Resources**: [List affected files/resources]
- **Description**: [Detailed description of conflict]

#### Impact Assessment
- **Current Work Impact**: [How it affects ongoing work]
- **Timeline Impact**: [Delay estimation]
- **Quality Impact**: [Risk to code quality]

#### Proposed Resolution
- **Immediate Action**: [What to do right now]
- **Coordination Required**: [Who needs to be involved]
- **Timeline**: [Expected resolution time]

---

##  End-of-Session Summary

### Session Summary
- **Duration**: [X] hours
- **Tasks Completed**: [X]
- **Progress Made**: [X]% on current task
- **Files Modified**: [X] files
- **Tests Added/Updated**: [X] tests

### Handoff Information
- **Status for Next Agent**: [Information for next agent]
- **Pending Actions**: [Actions that need follow-up]
- **Important Notes**: [Critical information to remember]

### Lessons Learned
- [Learning 1]
- [Learning 2]

### Process Improvements
- [Suggestion 1]
- [Suggestion 2]

---

##  Status Update Frequency Guide

### Every 2 Hours (During Active Work)
- Update progress percentage
- Note any new conflicts
- Update ETA if changed

### Every 4 Hours (Extended Sessions)
- Full status update using detailed template
- Review and update coordination needs
- Assess risks and blockers

### End of Work Session
- Complete session summary
- Prepare handoff notes
- Update next day's priorities

### Emergency Updates
- Immediate conflict detection
- Critical blocker encountered
- Major scope changes

---

**Usage Instructions**:
1. Choose appropriate template based on update type
2. Fill in all relevant sections
3. Be specific and clear in descriptions
4. Update work-status.md with your section
5. Notify relevant agents of important changes
