---
name: prototype-feature
description: Launch guided feature prototyping with requirements gathering and step-by-step development
argument-hint: "[optional: feature name or description]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Prototype Feature (Guided)

Launch the Feature Guide Agent to walk through step-by-step feature prototyping with requirements gathering, user journey mapping, and UI implementation.

## Instructions

When this command is invoked:

### 1. Check if Prototype Mode is Active

Verify prototype mode is enabled:

```bash
Read: .claude/prototyping-mode.local.md
```

**If NOT active:**
- Inform user: "Prototype mode is not active. Would you like to activate it first?"
- If yes: Execute `/prototype-mode` command first
- If no: Exit gracefully

**If active:**
- Proceed with feature guide

### 2. Parse Command Arguments

Check if user provided a feature name or description:

**If argument provided:**
- Use as initial feature context
- Example: `/prototype-feature user dashboard` → Feature: "user dashboard"

**If no argument:**
- Will gather feature details in guided process

### 3. Launch Feature Guide Agent

Use the Task tool to launch the Feature Guide Agent:

```
Task tool with:
- subagent_type: "feature-guide"
- description: "Guide user through feature prototyping"
- prompt: "[Pass any feature context from arguments]

  Guide the user through prototyping this feature with a step-by-step process:

  1. Gather requirements and user goals
  2. Map user journey and flows
  3. Design UI with frontend-design skill
  4. Implement components with mock data
  5. Test and iterate

  The user has prototype mode active, so focus exclusively on frontend development with mock data.

  [If feature name provided]: The user wants to prototype: [feature name]
  [If no feature name]: Start by asking what feature they want to prototype.
  "
```

### 4. Inform User

While agent launches, briefly explain what will happen:

```
Launching Feature Guide Agent...

The Feature Guide Agent will walk you through:

1. 📋 Requirements Gathering
   - What are you building?
   - Who is it for?
   - What's the goal?

2. 🗺️  User Journey Mapping
   - Entry points
   - User flows
   - Key interactions

3. 🎨 UI Design
   - Layout planning
   - Component design
   - Frontend-design integration

4. 🔨 Implementation
   - Component creation
   - Mock data setup
   - State management

5. ✅ Testing & Iteration
   - Flow testing
   - Refinement

Let's get started!
```

## Important Notes

- **Verify prototype mode**: Must be active before proceeding
- **Launch agent**: Use Task tool to launch feature-guide agent
- **Pass context**: Include any feature description from arguments
- **User-friendly**: Explain what the agent will do
- **Safety**: Agent has access to all tools for full implementation

## Error Scenarios

**Prototype mode not active:**
- Offer to activate it
- Don't proceed without activation

**Feature Guide Agent not available:**
- Fall back to manual guided process
- Ask requirements questions directly
- Follow same workflow without agent

## Feature Guide Process

If launching agent fails, follow this manual process:

### Phase 1: Requirements Gathering (ask these questions)

1. **What feature are you prototyping?**
   - Get clear feature description

2. **Who will use this feature?**
   - User persona (admin, user, guest)
   - Technical level (beginner, expert)
   - Context (desktop, mobile, both)

3. **What is the goal?**
   - What problem does it solve?
   - What outcome do you want?
   - How will you measure success?

4. **Where does this live in the interface?**
   - New page or existing page?
   - Navigation placement
   - Access permissions

### Phase 2: User Journey Mapping

1. **Entry points:**
   - How do users access this feature?
   - From where in the app?

2. **Happy path:**
   - Ideal flow from start to finish
   - What steps do they take?

3. **Edge cases:**
   - What can go wrong?
   - Empty states?
   - Error scenarios?

4. **Exit points:**
   - How does the flow complete?
   - Where do users go next?

### Phase 3: UI Design

1. **Invoke frontend-design skill:**
   - "Let's use the frontend-design skill to create professional UI for this feature"

2. **Layout planning:**
   - Overall page structure
   - Component placement
   - Responsive considerations

3. **Component identification:**
   - What components are needed?
   - shadcn/ui components to use?
   - Custom components to build?

### Phase 4: Mock Data Planning

1. **Identify data needs:**
   - What data does this feature display?
   - What data does it collect?

2. **Create mock data structures:**
   - JSON schemas
   - Realistic sample data
   - Edge cases (empty, long text, etc.)

3. **Plan composables:**
   - What composables to create?
   - State management needs?

### Phase 5: Implementation

1. **Create components:**
   - Build UI components
   - Integrate shadcn/ui
   - Apply Tailwind styling

2. **Implement mock data:**
   - Create mock data files
   - Build composables
   - Connect to components

3. **Add states:**
   - Loading states
   - Error states
   - Empty states
   - Success states

4. **Test flows:**
   - Walk through user journey
   - Verify interactions work
   - Check responsive design

### Phase 6: Iteration

1. **Review with user:**
   - Show what's been built
   - Get feedback
   - Identify improvements

2. **Refine:**
   - Make requested changes
   - Polish UI
   - Improve UX

3. **Document:**
   - Note what was built
   - Record decisions made
   - List production considerations

## After Feature Guide Completes

Summarize what was built:

```
✅ Feature Prototype Complete: [feature name]

## What Was Built

📁 Components:
   - [list components created]

📋 Pages:
   - [list pages created]

🔧 Composables:
   - [list composables created]

📊 Mock Data:
   - [list mock data files]

## Next Steps

- Continue prototyping more features with `/prototype-feature`
- Exit prototype mode when ready with `/exit-prototype`
- Test the feature by running the development server

The feature is ready for user testing and feedback!
```

## Tips for Effective Feature Prototyping

- **Start small**: Begin with core functionality
- **Iterate quickly**: Get feedback early
- **Use real scenarios**: Test with realistic use cases
- **Document decisions**: Note why choices were made
- **Focus on UX**: Prioritize user experience
- **Keep it simple**: Avoid over-engineering prototypes

## Integration with Other Skills

The Feature Guide Agent automatically uses:
- **prototyping-best-practices**: For mock data and frontend patterns
- **user-journey-design**: For UX patterns and flow mapping
- **frontend-design**: For professional UI generation
- **external-code-interpretation**: If user provides code to adapt

All skills work together to create a comprehensive prototyping experience.
