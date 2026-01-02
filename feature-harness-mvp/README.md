# Feature Harness MVP - MCP Access Validation Test

**Ticket**: [SPR-87](https://linear.app/sprocket-ux-limited/issue/SPR-87)
**Status**: Phase 1 - MCP Validation Testing
**Purpose**: Test critical assumption that Task tool agents can access plugin MCP servers

---

## ⚠️ CRITICAL TEST

This plugin contains a **validation test** that determines if the Feature Harness pure plugin approach is viable.

**Question being tested**: Can agents spawned via Task tool access MCP servers configured in the plugin's `.mcp.json`?

**If YES** → Plugin approach is feasible ✅ → Proceed to Phase 2 (full MVP implementation)
**If NO** → Plugin approach has fundamental blocker ❌ → Stay with Agent SDK or investigate alternatives

---

## What This Tests

1. **Linear MCP Access**: Can spawned agent call `list_projects` and other Linear MCP tools?
2. **Playwright MCP Access**: Can spawned agent use browser automation tools?

These are the two most critical MCP servers for Feature Harness functionality.

---

## Installation

```bash
# Plugin is already in the repository at:
# .claude-plugins/feature-harness-mvp/

# Claude Code should auto-discover it when you run commands
```

---

## Environment Setup

**No environment variables required!**

The plugin uses Linear's hosted MCP server (`https://mcp.linear.app/mcp`) which handles authentication via OAuth. This matches the configuration already set up in your root `.mcp.json` file.

---

## Running the Test

### Method 1: Use the Command (Recommended)

```bash
# In Claude Code, run:
/test-mcp-mvp
```

This will:
1. Spawn the test-mcp-agent via Task tool
2. Agent attempts to call Linear MCP and Playwright MCP
3. Results written to `test-results.txt`
4. Summary displayed to user

### Method 2: Direct Agent Invocation

You can also manually invoke the test agent if needed (for debugging).

---

## Expected Results

### If Test Passes ✅

```
✅ Linear MCP Access: SUCCESS
   - Tool available: Yes
   - Projects found: Feature Harness, Interplay, etc.
   - Spawned agents CAN access plugin MCP servers

✅ Playwright MCP Access: SUCCESS
   - Browser automation works from spawned agent
```

**Meaning**: Plugin approach is **VIABLE** → Proceed with Phase 2 (MVP plugin build)

### If Test Fails ❌

```
❌ Linear MCP Access: FAILED
   - Error: Linear MCP tools not available
   - Spawned agents CANNOT access plugin MCP servers
   - BLOCKER: Plugin approach may not be viable
```

**Meaning**: Fundamental blocker identified → Investigate alternatives or stay with Agent SDK

---

## Next Steps

### If Test Passes

1. Mark Phase 1 as complete in SPR-87
2. Proceed to **Phase 2**: Implement full MVP plugin with:
   - MVP Initializer agent (~150 lines)
   - MVP Coder agent (~150 lines)
   - `/feature-harness-mvp` main command
   - Test feature spec
3. Run full validation suite (7 tests)

### If Test Fails

1. Document blocker in SPR-87
2. Investigate potential workarounds:
   - Can we configure MCP differently?
   - Is there an alternative to Task tool agents?
   - Hybrid approach (plugin spawns Agent SDK app)?
3. Update SPR-86 with recommendation:
   - Stay with Agent SDK
   - Hybrid approach (original SPR-85 plan)
   - Other alternatives

---

## Technical Details

### Plugin Structure

```
.claude-plugins/feature-harness-mvp/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── .mcp.json                     # MCP server configuration
├── agents/
│   └── test-mcp-agent.md        # Test agent
├── commands/
│   └── test-mcp-mvp.md          # Test command
└── README.md                     # This file
```

### MCP Configuration

The `.mcp.json` file configures Linear and Playwright MCP servers:

```json
{
  "mcpServers": {
    "linear-server": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless", "--browser=chromium"]
    }
  }
}
```

**Linear MCP**: Uses Linear's hosted HTTP server (same as your root `.mcp.json` configuration). No API key needed - authentication via OAuth.

**Playwright MCP**: Uses stdio with local npx execution. Runs headless Chromium for browser automation.

### Test Agent Logic

The test-mcp-agent attempts to:
1. Call Linear MCP `list_projects` tool
2. Call Playwright MCP `browser_navigate` tool
3. Write results to `test-results.txt`
4. Report success/failure

---

## Troubleshooting

### "Linear MCP tools not available"

**Possible causes**:
1. Linear MCP server not authenticated (check OAuth in Claude Code settings)
2. MCP server failed to start or not reachable
3. **Task tool agents don't inherit plugin MCP configuration** (THE BLOCKER WE'RE TESTING FOR)

**Debug steps**:
1. Verify Linear MCP is enabled in Claude Code settings
2. Check you're authenticated with Linear (OAuth should be active)
3. Check Claude Code logs for MCP server connection errors
4. Try calling Linear MCP tools directly (not via Task tool) to verify it works

### "Agent failed to spawn"

**Possible causes**:
1. Plugin not properly installed
2. Agent markdown file has syntax errors
3. Command frontmatter issues

**Debug steps**:
1. Verify plugin structure matches expected layout
2. Check agent frontmatter YAML is valid
3. Review Claude Code plugin logs

---

## References

- **MVP Specification**: [specs/plugin-design/mvp-prototype.md](../../specs/plugin-design/mvp-prototype.md)
- **Full Architecture**: [specs/plugin-design/full-architecture.md](../../specs/plugin-design/full-architecture.md)
- **Parent Investigation**: [SPR-86](https://linear.app/sprocket-ux-limited/issue/SPR-86)
- **Implementation Ticket**: [SPR-87](https://linear.app/sprocket-ux-limited/issue/SPR-87)

---

## License

Private - Part of Interplay monorepo
