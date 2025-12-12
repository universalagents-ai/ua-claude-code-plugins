# Publishing UA Plugins to GitHub

This guide explains how to publish the `prototype-mode` plugin (and future UA plugins) to GitHub so your team can use them.

## Overview

**Current status:**
- ✅ `prototype-mode` is in `.claude-plugins/` (local development)
- ✅ Marketplace structure created in `.claude-plugins/.claude-plugin/marketplace.json`
- ✅ Team settings configured in `.claude/settings.json`
- ⏳ Need to create GitHub repo and push

## Step 1: Create GitHub Repository

### Option A: Public Repository (Recommended)
Public repos work seamlessly with Claude Code's marketplace system.

1. **Go to GitHub**: https://github.com/orgs/universalagents-ai/repositories/new
2. **Repository name**: `ua-claude-code-plugins`
3. **Description**: "Custom Claude Code plugins for Universal Agents team"
4. **Visibility**: Public
5. **DO NOT** initialize with README, .gitignore, or license (we'll add these)
6. **Click** "Create repository"

### Option B: Private Repository
Private repos require authentication. Team members need:
- GitHub access to the `universalagents-ai` organization
- SSH keys or personal access tokens configured

Same steps as above, but select **Private** for visibility.

⚠️ **Note:** If using private repo, team members must have GitHub access configured before plugins will auto-install.

## Step 2: Prepare Local Repository

Run these commands from `/Users/ollie/Documents/Repositories/interplay/.claude-plugins/`:

```bash
cd /Users/ollie/Documents/Repositories/interplay/.claude-plugins

# Initialize git repository
git init

# Create .gitignore
cat > .gitignore << 'EOF'
.DS_Store
*.log
node_modules/
.env
.env.*
EOF

# Create README
cat > README.md << 'EOF'
# UA Claude Code Plugins

Custom Claude Code plugins for the Universal Agents team.

## Available Plugins

### prototype-mode

Safe prototyping environment that focuses exclusively on frontend UI/UX development with mock data, blocking backend operations and external integrations.

**Features:**
- Frontend-only development mode
- Mock data generation
- Blocks backend operations
- Safe for UI/UX experimentation

**Installation:**

```bash
# Add UA marketplace
/plugin marketplace add universalagents-ai/ua-claude-code-plugins

# Install prototype-mode
/plugin install prototype-mode@ua-plugins
```

## For Team Members

If you're working on a project that has UA plugins configured in `.claude/settings.json`:

1. Trust the repository folder in Claude Code
2. Restart Claude Code
3. Plugins auto-install automatically

## Development

To develop plugins locally before publishing:

1. Clone this repository
2. Make changes to plugin files
3. Test locally: `/plugin marketplace add ./path/to/ua-claude-code-plugins`
4. Commit and push changes
5. Team members will get updates on next marketplace refresh

## Plugin Structure

```
ua-claude-code-plugins/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace manifest
├── prototype-mode/                # Custom prototype-mode plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   ├── agents/
│   ├── skills/
│   └── hooks/
└── README.md                      # This file
```

## License

MIT
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Add prototype-mode plugin and marketplace structure"
```

## Step 3: Link to GitHub and Push

```bash
# Add remote (replace with your actual repo URL)
git remote add origin git@github.com:universalagents-ai/ua-claude-code-plugins.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Verify on GitHub

1. Go to https://github.com/universalagents-ai/ua-claude-code-plugins
2. Check that you see:
   - `.claude-plugin/marketplace.json`
   - `prototype-mode/` directory
   - `README.md`

## Step 5: Test Installation

In Claude Code, test the marketplace:

```bash
# Add the marketplace
/plugin marketplace add universalagents-ai/ua-claude-code-plugins

# List marketplaces (should see ua-plugins)
/plugin marketplace list

# Install prototype-mode
/plugin install prototype-mode@ua-plugins

# Verify installation
/plugin
```

## Step 6: Team Rollout

Once verified:

1. **Commit** the changes in your main repo (`interplay`)
2. **Push** `.claude/settings.json` to your team
3. **Notify** team members to:
   - Pull latest changes
   - Trust the repository folder (if not already)
   - Restart Claude Code
4. Plugins will **auto-install** for everyone!

## Adding More Plugins

To add more UA plugins in the future:

1. **Develop locally** in `.claude-plugins/your-plugin/`
2. **Add to marketplace.json**:
   ```json
   {
     "name": "your-plugin",
     "source": "./your-plugin",
     "description": "Your plugin description"
   }
   ```
3. **Test locally**: `/plugin marketplace add ./path/to/.claude-plugins`
4. **Push to GitHub**: `git add . && git commit -m "Add your-plugin" && git push`
5. **Update** `.claude/settings.json` in main repo to enable for team

## Troubleshooting

### "Repository not found" error
- Ensure repo exists at `universalagents-ai/ua-claude-code-plugins`
- For private repos, verify GitHub access

### Plugins not auto-installing for team
- Verify `.claude/settings.json` is committed and pushed
- Team members must trust the repository folder
- Restart Claude Code after trusting

### Plugin updates not appearing
- Run `/plugin marketplace update ua-plugins`
- Or restart Claude Code to refresh all marketplaces

## Private Repository Notes

If using a private repository:

1. **Team members need GitHub access** to `universalagents-ai` org
2. **SSH keys configured** or GitHub CLI authenticated
3. **First-time setup**: May need to manually authenticate
4. **Alternative**: Use personal access tokens in git config

For seamless auto-installation, **public repos are recommended**.

## Resources

- [Claude Code Plugins Docs](https://code.claude.com/docs/en/plugins)
- [Plugin Marketplaces Guide](https://code.claude.com/docs/en/plugin-marketplaces)
- [Main Repo Setup Guide](../../../.claude/PLUGIN_SETUP.md)
