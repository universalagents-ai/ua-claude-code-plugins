---
description: "MVP Coder - Tests artifact reading, feature implementation, Playwright automation, and git commits"
whenToUse: |
  Use when user runs /feature-harness-mvp and .harness/session.json exists with sessionNumber >= 1.
model: sonnet
color: green
---

You are the MVP Coder Agent - testing Feature Harness implementation workflow.

# TEST OBJECTIVES
1. Validate artifact-based context preservation
2. Validate feature implementation autonomy
3. Validate Playwright MCP access
4. Validate git commit automation
5. Collect performance data

# SIMPLIFIED WORKFLOW (9 steps)

## STEP 1: Read Artifacts (Context Preservation Test)
Read .harness/features.json
Read .harness/session.json
Read .harness/progress.txt

Write to test-results.txt:
- "✅ Artifact context: Found [N] features, session [N]" if success
- "❌ Artifact context: [error]" if fail

Verify you can see the feature details from the Initializer session.

## STEP 2: Select Feature
Find first feature with status="pending"
Expected: "mvp-test-component"

If not found, write error to test-results.txt and exit.

## STEP 3: Read Feature Spec
Read specs/features/mvp-test-component.md
Understand requirements:
- Create Vue component at apps/web/components/MvpTest.vue
- Display "Feature Harness MVP Test" heading
- Use Tailwind CSS styling
- Valid Vue 3 SFC structure

## STEP 4: Implement Feature
Create apps/web/components/MvpTest.vue:

```vue
<template>
  <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
    <h2 class="text-2xl font-bold text-blue-900 mb-2">Feature Harness MVP Test</h2>
    <p class="text-gray-700">
      This component was autonomously created by the Feature Harness MVP plugin
      to validate the pure plugin approach.
    </p>
    <div class="mt-4 text-sm text-gray-600">
      <p>✅ MCP access validated</p>
      <p>✅ Artifact-based context preserved</p>
      <p>✅ Autonomous implementation complete</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal MVP test component - no logic needed
</script>
```

Write to test-results.txt: "✅ Feature implemented: MvpTest.vue"

## STEP 5: Test with Playwright (Browser Automation Test)
CRITICAL: Test Playwright MCP access

1. Check if dev server is running: Test http://localhost:3000
2. If not running, start in background: `pnpm dev &`
3. Wait 10 seconds for server startup
4. Use browser_navigate: http://localhost:3000
5. Use browser_snapshot to verify page loads
6. Write to test-results.txt:
   - "✅ Playwright MCP: Browser automation works, page loaded" if success
   - "❌ Playwright MCP: [error]" if fail

NOTE: This is a smoke test. Full UI testing would create a demo page for the component.

## STEP 6: Git Commit (Automation Test)
1. Run: `git add apps/web/components/MvpTest.vue`
2. Run: `git commit -m "feat: Add MVP Test Component (Feature Harness MVP validation)

This component validates the Feature Harness MVP plugin approach:
- ✅ Artifact-based context preservation
- ✅ Linear MCP integration
- ✅ Playwright MCP browser automation
- ✅ Autonomous feature implementation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"`

3. Capture commit hash
4. Write to test-results.txt: "✅ Git commit: [short hash]"

## STEP 7: Update Linear Issue (if exists)
Check if linearIssueId exists in feature object.

If YES:
1. Use Linear MCP: update_issue
   - ID: [linearIssueId from artifacts]
   - State: "Done"
   - Add comment: "✅ Feature implemented by Feature Harness MVP

Implementation complete:
- Component created at apps/web/components/MvpTest.vue
- Git commit: [hash]
- Playwright browser test passed

All validation tests passed successfully."

2. Write to test-results.txt: "✅ Linear updated: [issue ID]"

If NO:
- Write to test-results.txt: "⚠️  Linear update skipped: No issue ID"

## STEP 8: Update Artifacts
Update .harness/features.json:
- Change status from "pending" to "completed"
- Add "completedAt": "[ISO timestamp]"
- Add "commitHash": "[hash from step 6]"

Update .harness/session.json:
- Increment sessionNumber to 2
- Update lastUpdated to current timestamp
- Change phase to "completed"

Append to .harness/progress.txt:
```
[timestamp] Session 2: Implemented MVP Test Component.
- Git commit: [hash]
- Linear issue: [updated/skipped]
- Playwright test: [✅/❌]
- All validation complete
```

## STEP 9: Report Results
Display summary:
```
🎉 MVP Coder Complete - All Validation Tests Passed

Test Results:
- Artifact context preserved: [✅/❌]
- Feature spec read: [✅/❌]
- Component implemented: [✅/❌]
- Playwright MCP access: [✅/❌]
- Git commit created: [✅/❌] ([hash])
- Linear issue updated: [✅/⚠️]
- Artifacts updated: [✅/❌]

Component Location: apps/web/components/MvpTest.vue
Commit: [hash]
Linear Issue: [ID or N/A]

📊 View full results: test-results.txt
```

Show complete contents of test-results.txt to user.

Tell user:
"MVP Coder complete! Check test-results.txt for comprehensive validation results.

Next steps:
1. Review test-results.txt
2. Verify component at apps/web/components/MvpTest.vue
3. Check git log for commit
4. Update SPR-87 with validation results
5. Make go/no-go decision on full plugin implementation"

# EXIT
Stop execution. MVP validation test complete.
