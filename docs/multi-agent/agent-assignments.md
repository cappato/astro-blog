#  Agent Assignments

**Last Updated**: [Update this timestamp when making changes]

##  Current Active Agents

### Agent 1: Frontend Specialist
- **Type**: Frontend
- **Status**: ACTIVE
- **Assigned Since**: 2024-01-15

#### Responsibilities
- **Primary Files**:
  - `src/components/*`
  - `src/layouts/*`
  - `src/styles/*`
  - `src/features/*/components/*`
- **Features**:
  - UI Components
  - Theme System
  - Responsive Design
  - User Experience
- **Restrictions**:
  - Cannot modify: `src/pages/api/*`, `scripts/*`
  - Must coordinate with Backend Agent for: `src/utils/*`

#### Current Branch
- **Main Branch**: `agent/frontend/main`
- **Feature Branches**:
  - `agent/frontend/dark-mode-improvements`
  - `agent/frontend/responsive-design`

---

### Agent 2: Content Manager
- **Type**: Content
- **Status**: ACTIVE
- **Assigned Since**: 2024-01-15

#### Responsibilities
- **Primary Files**:
  - `src/content/*`
  - `docs/*`
  - `*.md` files
  - Blog post creation
- **Features**:
  - Blog Content
  - Documentation
  - SEO Optimization
  - Content Strategy
- **Restrictions**:
  - Cannot modify: `src/components/*`, `src/styles/*`
  - Must coordinate with Frontend Agent for: `src/layouts/*`

#### Current Branch
- **Main Branch**: `agent/content/main`
- **Feature Branches**:
  - `agent/content/blog-automation`
  - `agent/content/seo-improvements`

---

##  Restricted Areas (Require Coordination)

### Shared Configuration Files
- `package.json` - Requires DevOps agent approval
- `astro.config.mjs` - Requires Frontend + DevOps coordination
- `tailwind.config.js` - Requires Frontend agent approval
- `tsconfig.json` - Requires all agents coordination

### Core System Files
- `src/layouts/` - Frontend agent primary, others coordinate
- `src/config/` - Backend agent primary, others coordinate
- `docs/` - Content agent primary, others coordinate

### Critical Paths
- `src/pages/` - Requires coordination between Frontend/Backend
- `src/components/` - Frontend primary, others coordinate
- `src/features/` - Owner depends on feature type

##  Coordination Rules

### File Modification Protocol
1. **Check Ownership**: Verify file ownership in this document
2. **Request Permission**: If not owner, request permission in work-status.md
3. **Wait for Approval**: Don't proceed until owner approves
4. **Update Status**: Log the coordination in work-status.md

### Emergency Override
- **When**: Critical bugs or security issues
- **Process**:
  1. Mark as EMERGENCY in work-status.md
  2. Proceed with fix
  3. Notify all agents immediately
  4. Document in conflict-log.md

##  Assignment Templates

### Adding New Agent
```markdown
### Agent [N]: [AGENT_NAME]
- **Type**: [Agent Type]
- **Status**: ACTIVE
- **Assigned Since**: [Current Date]

#### Responsibilities
- **Primary Files**:
  - `path/to/assigned/files/*`
- **Features**:
  - [List of features]
- **Restrictions**:
  - Cannot modify: [List restricted paths]
  - Must coordinate with [OTHER_AGENTS] for: [Shared paths]

#### Current Branch
- **Main Branch**: `agent/[type]/[agent-name]`
- **Feature Branches**: []
```

### Modifying Assignments
1. Update this file
2. Notify affected agents in work-status.md
3. Update conflict-log.md with reasoning
4. Ensure smooth handoff of responsibilities

##  Quick Reference

### By File Type
- **`.astro` files**: Frontend Agent
- **`.ts/.js` files**: Depends on location
  - `src/components/`: Frontend
  - `src/utils/`: Backend
  - `src/features/`: Feature owner
- **`.md` files**: Content Agent
- **`.test.ts` files**: Testing Agent
- **Config files**: DevOps Agent (with coordination)

### By Directory
- `src/components/`: Frontend Agent
- `src/pages/`: Frontend + Backend coordination
- `src/features/`: Feature-specific ownership
- `src/utils/`: Backend Agent
- `docs/`: Content Agent
- `scripts/`: DevOps Agent
- Root configs: DevOps Agent (with coordination)

---

**️ Important**: Always update this file when:
- Adding/removing agents
- Changing responsibilities
- Modifying restrictions
- Creating new coordination rules
