# AUGMENT SYSTEM MVP

## SYSTEM_VERSION: 1.2
## LAST_UPDATE: 2025-01-02
## STATUS: ACTIVE - PROJECT_CONTEXT_INTEGRATED

---

## SYSTEM_OVERVIEW:

**PURPOSE:** Autonomous task management system for Augment Code
**SCOPE:** Interactive task selection with maintenance protocols
**ARCHITECTURE:** File-based state management with user choice workflow

---

## ENTRY_PROTOCOL:

### FOR_NEW_CHAT:
```markdown
Hola! Lee docs/.augment/START-HERE.md
```

### AUGMENT_WORKFLOW:
1. Read essential rules from `docs/.augment/SYSTEM.md`
2. **LOAD ALL PROTOCOLS OBLIGATORILY:**
 - code-quality.md (professional standards - CRITICAL)
 - communication.md (Spanish mandatory)
 - development.md (incremental workflow)
 - testing.md (continuous testing)
 - commit.md (documented commits)
 - maintenance.md (documentation updates)
 - DYNAMIC-RULES.md (learned rules - FUNDAMENTAL)
3. **LOAD PROJECT CONTEXT:**
 - README.md (project description, structure, technologies)
 - package.json (dependencies, scripts, configuration)
 - astro.config.mjs (Astro-specific configuration)
4. **Confirm internalization of critical rules and project context**
5. Show available tasks from `docs/.augment/TASK-HISTORY.md`
6. Ask user: resume existing task or create new one
7. Based on response: load specific context or start new task
8. **Apply protocols in every decision during execution**
9. Execute task objective with protocol compliance
10. Update documentation per `docs/.augment/protocols/maintenance.md`

---

## FILE_STRUCTURE:

```
docs/.augment/
+-- START-HERE.md # Entry point with interactive flow
+-- CURRENT-TASK.md # Active task details
+-- TASK-HISTORY.md # Complete task log
+-- SYSTEM.md # This file
+-- protocols/ # Development protocols
| +-- code-quality.md # Professional standards protocol
| +-- communication.md # Spanish language protocol
| +-- development.md # Development workflow
| +-- testing.md # Testing requirements
| +-- commit.md # Commit standards
| +-- maintenance.md # Documentation maintenance
+-- history/ # Session archives
```

---

## PROTOCOLS_SUMMARY:

### CODE-QUALITY.MD:
- Professional software engineering standards mandatory
- Escalation protocol for architectural conflicts
- Quality over speed principle
- No suboptimal solutions allowed

### COMMUNICATION.MD:
- Spanish language mandatory for all interactions
- Technical exceptions for code and commands
- Structured response format
- Professional but friendly tone

### DEVELOPMENT.MD:
- Mandatory workflow before/during/after development
- Quality gates and testing requirements
- Documentation update obligations

### TESTING.MD:
- `npm run dev` - Development server verification
- `npm run build` - Production build verification
- `npm run preview` - Preview functionality verification
- Manual functionality testing per project

### COMMIT.MD:
- Standard commit message format
- Pre-commit verification requirements
- Immediate push protocol
- Documentation update requirements

### MAINTENANCE.MD:
- Mandatory documentation updates before ending session
- Specific format for session logs
- Consistency verification procedures
- Task transition management

---

## AUTONOMOUS_AGENT_RULES:

### FUNDAMENTAL_PRINCIPLE:
- **PROFESSIONAL SOFTWARE ENGINEERING STANDARDS** - Every solution must meet professional software engineering standards. If a task cannot be resolved with a clean, maintainable, and professional approach, STOP and request user guidance rather than implementing suboptimal solutions.

### MANDATORY_BEHAVIORS:
- **INTERACT IN SPANISH** - Always communicate in Spanish language
- **PROFESSIONAL SOLUTIONS ONLY** - All code must be production-ready, maintainable, and follow best practices
- **REQUEST GUIDANCE WHEN STUCK** - If facing architectural conflicts or complex decisions, ask user for direction instead of implementing workarounds
- Always read CURRENT-TASK.md first
- Follow all protocols without exception
- Update documentation before ending session
- Maintain technical focus (no fluff)
- Verify functionality before committing
- **MAXIMUM MODULARIZATION** - Extract components to maximum extent
- **REUSABLE COMPONENTS** - Create documented, tested, reusable components
- **LEVERAGE EXISTING AUDITS** - Use existing performance/SEO analysis

### PROHIBITED_BEHAVIORS:
- **IMPLEMENT SUBOPTIMAL SOLUTIONS** - Never implement workarounds, fallbacks, or temporary fixes that compromise code quality
- **PROCEED WITHOUT CLARITY** - Never continue with implementation when facing architectural uncertainty or conflicting approaches
- **DUPLICATE SYSTEMS** - Never create multiple systems that serve the same purpose
- Communicate in English (except technical elements)
- Skip testing protocols
- Commit without documentation update
- End session without state update
- Break existing functionality
- Deviate from defined protocols

---

## INTERACTIVE_WORKFLOW:

### TASK_SELECTION_FLOW:
1. **Show available tasks** from TASK-HISTORY.md
2. **Ask user preference:** resume or create new
3. **Load appropriate context** based on choice
4. **Execute with full protocols**

### USER_OPTIONS:
- **Resume existing task:** Load CURRENT-TASK.md context
- **Create new task:** Initialize new task structure
- **Switch tasks:** Change active task focus

---

## SUCCESS_METRICS:

### SYSTEM_WORKING_WHEN:
- Context preserved 100% between sessions
- All protocols followed consistently
- Tasks completed according to success criteria
- Documentation always current
- No functionality regressions
- User has clear control over task selection

### FAILURE_INDICATORS:
- Context lost between chats
- Protocols skipped or ignored
- Incomplete task documentation
- Broken functionality after changes
- Inconsistent file states
- User confusion about available options

---

**SYSTEM_STATUS:** OPERATIONAL 
**CONFIDENCE_LEVEL:** HIGH 
**READY_FOR_PRODUCTION:** YES