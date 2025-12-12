---
name: exit-prototype
description: Exit prototyping mode with cleanup, summary, and production handoff notes
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Exit Prototype Mode

Safely exit prototyping mode, save all work, generate handoff documentation, and provide next steps for production development.

## Instructions

When this command is invoked, perform the following steps in order:

### 1. Verify Prototype Mode is Active

Check if `.claude/prototyping-mode.local.md` exists and is enabled:

```bash
Read: .claude/prototyping-mode.local.md
```

**If file doesn't exist or enabled: false:**
- Inform user that prototype mode is not currently active
- Exit gracefully

**If file exists and enabled: true:**
- Proceed with exit process
- Read configuration to understand what was allowed/blocked

### 2. Analyze Changes Made During Prototyping

Gather information about work completed:

**Git Changes:**
```bash
git status --short
git diff --stat
```

**Files Created:**
```bash
git ls-files --others --exclude-standard
```

**Files Modified:**
```bash
git diff --name-only
```

Categorize files:
- **Components created**: Files in `components/`
- **Pages created**: Files in `pages/`
- **Composables created**: Files in `composables/`
- **Mock data created**: Files in `mocks/`, `fixtures/`, `__mock__/`
- **Styles modified**: Files in `assets/`, `styles/`

### 3. Save All Mock Data

Ensure all mock data files are committed:

**Identify mock data locations:**
- `mocks/**/*.json`
- `fixtures/**/*.json`
- `__mock__/**/*.js`
- `data/**/*.json`

**Verify mock data is not in .gitignore:**
- Read `.gitignore`
- Check if mock directories are excluded
- If excluded, inform user that mock data won't be committed

**Create comprehensive mock data inventory:**
- List all mock data files
- Note their purpose (users, products, metrics, etc.)
- Document relationships between mock data files

### 4. Generate Summary Report

Create a comprehensive summary of prototype work:

**Summary includes:**
1. **Overview**
   - What was built (feature description)
   - Time period (from activation to now)
   - Branch name
   - Framework used

2. **Files Created/Modified**
   - Components (count + list)
   - Pages (count + list)
   - Composables (count + list)
   - Mock data files (count + list)
   - Other files (count + list)

3. **Features Implemented**
   - List of features/components built
   - User flows implemented
   - UI/UX patterns used

4. **Mock Data Structure**
   - Data schemas created
   - Relationships between entities
   - Sample data patterns

5. **Next Steps for Production**
   - Backend APIs needed
   - Database schema requirements
   - Authentication/authorization needs
   - External integrations required
   - State management considerations

### 5. Create Production Handoff Document

Generate detailed handoff notes for development team:

Create file: `PROTOTYPE_HANDOFF.md` in project root

```markdown
# Prototype Handoff Documentation

**Generated:** [current date/time]
**Branch:** [branch name]
**Framework:** [framework]
**Prototype Duration:** [start] to [end]

## Executive Summary

[Brief description of what was prototyped and key features]

## Features Implemented

### [Feature 1 Name]
- **Description:** [What this feature does]
- **User Flow:** [Entry point → Steps → Exit point]
- **Components:**
  - `[component path]` - [purpose]
- **Mock Data:** `[mock data file]`
- **Status:** Prototype complete, ready for production

### [Feature 2 Name]
[Repeat structure]

## Components Created

| Component | Location | Purpose | Dependencies |
|-----------|----------|---------|--------------|
| [Name] | [Path] | [Purpose] | [shadcn/ui, composables, etc.] |

## Mock Data to Production API Mapping

### Users
- **Mock:** `mocks/users.json`
- **Production API:** `GET /api/users`
- **Schema:**
  ```typescript
  {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
    // ... other fields
  }
  ```
- **Relationships:** users.teamId → teams.id

### [Other Data Entities]
[Repeat structure for each mock data file]

## Backend Requirements

### API Endpoints Needed

1. **GET /api/users**
   - Purpose: Fetch user list
   - Query params: page, limit, search
   - Response: Paginated user list
   - Mock: `mocks/users.json`

2. **POST /api/users**
   - Purpose: Create new user
   - Body: User data
   - Response: Created user object
   - Mock: Simulated in `composables/useMockUsers.ts`

[List all required endpoints]

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- [Other tables based on mock data]
```

### Authentication & Authorization

- **Current:** Mock authentication (always logged in as admin)
- **Required:**
  - User authentication (email/password or OAuth)
  - Role-based access control
  - Session management
  - Protected routes: [list routes]

### External Integrations

- **Figma:** Used for design imports (keep in production)
- **Playwright:** Used for testing (keep in production)
- **[Others]:** [Note usage]

## State Management

**Current:** Composables with `useState`
**Production Consideration:**
- Evaluate if Pinia store needed for complex state
- Consider server state management (TanStack Query/nuxt-query)
- Implement proper error handling and retry logic

## Deployment Considerations

- **Environment Variables:** [List required env vars]
- **Build Process:** [Any build notes]
- **Testing:** [Areas that need testing]
- **Performance:** [Any performance considerations]

## Known Limitations

1. All data is mock data - no real persistence
2. No error handling for network failures (simulated delays only)
3. Authentication is mocked - all users appear as admin
4. [Other limitations]

## Recommended Next Steps

1. **Immediate:**
   - Review this handoff document
   - Set up backend API endpoints
   - Create database schema
   - Implement authentication

2. **Short-term:**
   - Replace mock data with real API calls
   - Add proper error handling
   - Implement loading states with real async data
   - Set up state management if needed

3. **Before Production:**
   - Security audit
   - Performance testing
   - Accessibility review
   - Cross-browser testing

## Questions for Development Team

- [Any questions or areas needing clarification]
- [Technical decisions that need to be made]
- [Trade-offs to consider]

## Contact

For questions about this prototype:
- Prototype created by: [User name]
- Date range: [Start] - [End]
- Branch: [branch name]
```

### 6. Update Prototype Mode Settings

Disable prototype mode in settings file:

```yaml
Edit: .claude/prototyping-mode.local.md

Change:
enabled: true

To:
enabled: false
deactivated: [current date/time]
```

Add exit summary to settings file:

```markdown
## Exit Summary

**Deactivated:** [date/time]
**Duration:** [duration in hours/days]
**Files changed:** [count]
**Components created:** [count]
**Mock data files:** [count]

See PROTOTYPE_HANDOFF.md for complete details.
```

### 7. Commit Changes (Optional)

Ask user if they want to commit all changes:

```
Would you like to commit all prototype work?

- All prototype files will be committed
- Mock data will be preserved
- Handoff documentation will be included

Commit message will be:
"Complete prototype: [brief description]

- [count] components created
- [count] pages created
- [count] mock data files
- See PROTOTYPE_HANDOFF.md for details

🤖 Generated with Claude Code - Prototype Mode"
```

**If user confirms:**
```bash
git add .
git commit -m "[generated commit message]"
```

**If user declines:**
- Skip commit
- Inform user they can commit manually

### 8. Present Exit Summary

Show user concise summary:

```
✅ Prototype Mode Deactivated

Duration: [duration]
Branch: [branch name]

## Summary

📁 Files: [total count]
   - [count] components
   - [count] pages
   - [count] composables
   - [count] mock data files

📋 Documentation:
   - PROTOTYPE_HANDOFF.md created
   - Mock data preserved
   - Production roadmap provided

## Handoff Highlights

🎯 Features: [list key features]
🔌 APIs Needed: [count] endpoints
🗄️  Database: [count] tables
🔐 Auth: Required for production

## Next Steps

1. Review PROTOTYPE_HANDOFF.md
2. Share with development team
3. Set up backend infrastructure
4. Replace mock data with real APIs

The prototype is complete and ready for production development!

Prototype mode is now inactive. You can re-enter with /prototype-mode if needed.
```

## Important Notes

- **Preserve work**: Ensure all mock data and components are saved
- **Comprehensive handoff**: Generate detailed documentation for dev team
- **Ask before committing**: User may want to review changes first
- **Update settings**: Mark prototype mode as disabled
- **Clear summary**: Provide actionable next steps

## Error Scenarios

**Settings file not found:**
- Inform user that prototype mode wasn't active
- Ask if they want to generate handoff docs anyway

**Git not available:**
- Skip git-related analysis
- Generate handoff based on file system scan
- Inform user about missing git information

**Permission errors writing files:**
- Inform user about permission issues
- Provide summary verbally instead
- Suggest manual documentation approach

## Post-Exit State

After this command completes:
- Prototype mode is disabled
- Safety hooks no longer block operations
- All work is preserved and documented
- User can continue with production development
- Re-entering prototype mode is possible with `/prototype-mode`
