#  Conflict Resolution Template

Use this template when conflicts arise between agents to ensure systematic resolution.

---

##  Conflict Identification

### Basic Information
- **Conflict ID**: [CONFLICT-001]
- **Detection Date**: [YYYY-MM-DD HH:MM]
- **Detected By**: [AGENT_NAME]
- **Status**: [ACTIVE | ESCALATED | RESOLVED]

### Agents Involved
- **Primary Agent**: [AGENT_NAME] - [Agent Type]
- **Secondary Agent**: [AGENT_NAME] - [Agent Type]
- **Additional Agents**: [If more than 2 agents involved]

### Conflict Type
- [ ] **File Conflict** - Multiple agents need same file
- [ ] **Dependency Conflict** - Agent B needs Agent A's work
- [ ] **Architecture Conflict** - Conflicting design approaches
- [ ] **Resource Conflict** - Competing for limited resources
- [ ] **Timeline Conflict** - Scheduling/priority conflicts

---

##  Conflict Details

### Description
[Detailed description of the conflict situation]

### Affected Resources
#### Files
- `path/to/conflicted/file1.ts`
- `path/to/conflicted/file2.astro`

#### Features/Components
- [Feature 1]
- [Feature 2]

#### Dependencies
- [Dependency 1]
- [Dependency 2]

### Impact Assessment
#### Immediate Impact
- **Agent 1**: [How conflict affects Agent 1's work]
- **Agent 2**: [How conflict affects Agent 2's work]
- **Timeline**: [Estimated delay]

#### Potential Consequences
- **Code Quality**: [Risk to code quality]
- **Project Timeline**: [Impact on overall project]
- **Other Agents**: [Impact on other agents' work]

---

##  Resolution Strategy

### Priority Assessment
#### Agent Priority Matrix
| Agent | Task Priority | Deadline | Impact | Score |
|-------|---------------|----------|---------|-------|
| Agent1 | HIGH | 2h | Critical | 9 |
| Agent2 | MEDIUM | 4h | Moderate | 6 |

**Priority Winner**: [Agent with higher score]

#### Resolution Approach
- [ ] **Priority-Based**: Higher priority agent proceeds first
- [ ] **Time-Based**: Agent with tighter deadline proceeds
- [ ] **Coordination**: Both agents work together
- [ ] **Escalation**: Human intervention required
- [ ] **Alternative**: Find different approach

### Detailed Resolution Plan

#### Step 1: Immediate Actions
- **Agent 1**: [Specific action for Agent 1]
- **Agent 2**: [Specific action for Agent 2]
- **Timeline**: [When these actions should be completed]

#### Step 2: Coordination Phase
- **Communication**: [How agents will communicate]
- **Checkpoints**: [When to check progress]
- **Handoff**: [How work will be handed off]

#### Step 3: Integration
- **Merge Strategy**: [How changes will be integrated]
- **Testing**: [How integration will be tested]
- **Validation**: [How success will be measured]

---

##  Communication Protocol

### Initial Communication
```markdown
**From**: [AGENT_NAME]
**To**: [OTHER_AGENT_NAME]
**Subject**: Conflict Detected - [Brief Description]

 [Agent Name],

I've detected a conflict with our current work:
- **Conflict Type**: [Type]
- **Affected Files**: [List]
- **My Current Task**: [Description]
- **Your Current Task**: [Description]

Proposed resolution: [Brief proposal]

Please confirm your status and preferred resolution approach.

Best regards,
[Your Agent Name]
```

### Progress Updates
```markdown
**Conflict Update - [CONFLICT-ID]**
**Time**: [YYYY-MM-DD HH:MM]
**Status**: [Current status]

**Progress**:
- [Progress item 1]
- [Progress item 2]

**Next Steps**:
- [Next step 1]
- [Next step 2]

**ETA**: [Estimated resolution time]
```

### Resolution Confirmation
```markdown
**Conflict Resolved - [CONFLICT-ID]**
**Resolution Time**: [YYYY-MM-DD HH:MM]
**Total Duration**: [X hours/minutes]

**Final Resolution**:
- [How conflict was resolved]

**Outcome**:
- [Result for Agent 1]
- [Result for Agent 2]

**Lessons Learned**:
- [Key learning 1]
- [Key learning 2]
```

---

##  Resolution Process Checklist

### Phase 1: Detection & Assessment
- [ ] Conflict clearly identified and documented
- [ ] All affected agents notified
- [ ] Impact assessment completed
- [ ] Priority matrix calculated
- [ ] Resolution approach selected

### Phase 2: Communication & Planning
- [ ] Initial communication sent
- [ ] Response received from all agents
- [ ] Resolution plan agreed upon
- [ ] Timeline established
- [ ] Checkpoints scheduled

### Phase 3: Implementation
- [ ] Resolution plan executed
- [ ] Regular progress updates provided
- [ ] Coordination maintained
- [ ] Issues addressed promptly
- [ ] Quality maintained

### Phase 4: Integration & Validation
- [ ] Changes integrated successfully
- [ ] Tests passing
- [ ] No new conflicts introduced
- [ ] All agents can proceed
- [ ] Documentation updated

### Phase 5: Documentation & Learning
- [ ] Conflict logged in conflict-log.md
- [ ] Resolution documented
- [ ] Lessons learned captured automatically
- [ ] Process improvements identified
- [ ] Prevention strategies updated
- [ ] New rules added to dynamic learning system

---

##  Resolution Tracking

### Timeline
- **Detection**: [YYYY-MM-DD HH:MM]
- **Communication Started**: [YYYY-MM-DD HH:MM]
- **Resolution Plan Agreed**: [YYYY-MM-DD HH:MM]
- **Implementation Started**: [YYYY-MM-DD HH:MM]
- **Resolution Completed**: [YYYY-MM-DD HH:MM]
- **Total Duration**: [X hours/minutes]

### Metrics
- **Response Time**: [Time from detection to first response]
- **Planning Time**: [Time to agree on resolution]
- **Implementation Time**: [Time to execute resolution]
- **Success Rate**: [Did resolution work as planned?]

---

##  Escalation Procedures

### When to Escalate
- [ ] Agents cannot agree on resolution
- [ ] Conflict involves critical system changes
- [ ] Resolution would significantly impact timeline
- [ ] Technical complexity requires expert input
- [ ] Multiple conflicts creating cascade effect

### Escalation Process
1. **Document Current State**: [All attempts and current status]
2. **Prepare Escalation Report**: [Summary for human review]
3. **Pause All Related Work**: [Stop to prevent further conflicts]
4. **Request Human Intervention**: [Clear request with context]
5. **Implement Decision**: [Execute human-provided resolution]

### Escalation Template
```markdown
**ESCALATION REQUEST - [CONFLICT-ID]**
**Date**: [YYYY-MM-DD HH:MM]
**Agents**: [List all involved agents]

**Conflict Summary**: [Brief description]

**Resolution Attempts**:
- [Attempt 1 and result]
- [Attempt 2 and result]

**Current Blocker**: [Why escalation is needed]

**Impact**: [Effect on project/timeline]

**Recommendation**: [Agent recommendation if any]

**Urgency**: [HIGH/MEDIUM/LOW]
```

---

##  Common Resolution Patterns

### Pattern 1: File Ownership Conflict
**Scenario**: Two agents need to modify the same file
**Resolution**:
1. Check agent-assignments.md for ownership
2. Owner proceeds, other waits
3. Coordinate merge timing
4. Non-owner integrates changes

### Pattern 2: Dependency Chain
**Scenario**: Agent B needs Agent A's work to proceed
**Resolution**:
1. Agent A prioritizes blocking work
2. Agent B works on non-dependent tasks
3. Clear handoff communication
4. Integration testing

### Pattern 3: Architecture Decision
**Scenario**: Conflicting approaches to implementation
**Resolution**:
1. Document both approaches
2. Assess pros/cons of each
3. Make decision (or escalate)
4. Update architecture guidelines

---

## 🧠 Automatic Lesson Capture

### After Resolution
```bash
# Capture lesson learned automatically
npm run multi-

# Analyze patterns in lessons
npm run multi-
```

### Lesson Template
```markdown
**Lesson Learned**: [Brief description]
**Context**: [What caused this conflict]
**Resolution**: [How it was solved]
**Prevention**: [How to avoid in future]
**Rule Type**: [FUNDAMENTAL/CRITICAL/OBLIGATORY]
**Category**: [Code Quality/Communication/Development/Testing]
```

---

**Usage Instructions**:
1. Use this template immediately when conflict is detected
2. Fill out all relevant sections completely
3. Follow the resolution process checklist
4. Document everything for future learning
5. Update prevention strategies based on resolution
6. Capture lessons automatically using npm run multi-
