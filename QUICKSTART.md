# Quick Start: Publish UA Plugins to GitHub

Follow these steps in order to publish your plugins and enable team access.

## Step 1: Create GitHub Repository

1. Go to: https://github.com/organizations/universalagents-ai/repositories/new
2. Fill in:
   - **Name**: `ua-claude-code-plugins`
   - **Description**: "Custom Claude Code plugins for Universal Agents team"
   - **Visibility**: **Public** (recommended) or Private
   - **DO NOT** check "Initialize with README"
3. Click **"Create repository"**

## Step 2: Initialize and Push Plugin Repository

Copy and paste these commands:

```bash
# Navigate to the plugins directory
cd /Users/ollie/Documents/Repositories/interplay/.claude-plugins

# Initialize git
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

Custom Claude Code plugins for Universal Agents team.

## Available Plugins

- **prototype-mode**: Safe prototyping environment for frontend UI/UX development

## Installation

```bash
/plugin marketplace add universalagents-ai/ua-claude-code-plugins
/plugin install prototype-mode@ua-plugins
```

See individual plugin directories for documentation.
EOF

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Add prototype-mode plugin and marketplace"

# Add remote (GitHub will show you this URL after creating the repo)
git remote add origin git@github.com:universalagents-ai/ua-claude-code-plugins.git

# Push
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Visit https://github.com/universalagents-ai/ua-claude-code-plugins to verify files are there

## Step 3: Remove Old ua-plugins Directory

```bash
# Navigate back to main repo
cd /Users/ollie/Documents/Repositories/interplay

# Remove the old directory
rm -rf ua-plugins/

# Verify it's gone
ls -la | grep ua-plugins  # Should return nothing
```

## Step 4: Commit Main Repo Changes

```bash
# Still in /Users/ollie/Documents/Repositories/interplay

# Check status
git status

# You should see:
# - Modified: .gitignore
# - New: .claude/settings.json
# - New: .claude/PLUGIN_SETUP.md
# - New: .claude/MIGRATION_GUIDE.md
# - Deleted: ua-plugins/ (14 directories)

# Stage changes
git add .claude/settings.json
git add .claude/PLUGIN_SETUP.md
git add .claude/MIGRATION_GUIDE.md
git add .gitignore

# Remove ua-plugins from git
git rm -r ua-plugins/

# Commit
git commit -m "Migrate to marketplace-based plugin management

- Add Anthropic official marketplace
- Add UA custom plugins marketplace
- Enable all 13 Anthropic plugins + prototype-mode
- Remove local plugin copies (~10k LOC)
- Add comprehensive plugin documentation"

# Push
git push
```

## Step 5: Test Plugin Installation

In Claude Code:

```bash
# Add Anthropic marketplace
/plugin marketplace add anthropics/claude-code

# Add UA marketplace (from GitHub)
/plugin marketplace add universalagents-ai/ua-claude-code-plugins

# Verify marketplaces
/plugin marketplace list
# Should show: anthropic-plugins, ua-plugins

# Check plugins are available
/plugin
# Should see all 14 plugins available

# Test prototype-mode installation
/plugin install prototype-mode@ua-plugins
```

## Step 6: Notify Your Team

Send this message to your team:

---

**📢 Plugin Management Update**

We've migrated to marketplace-based plugin management. Please follow these steps:

1. **Pull latest changes** from the `interplay` repo
2. **Trust the repository folder** in Claude Code (if not already)
3. **Restart Claude Code**

Plugins will auto-install automatically!

All Anthropic plugins (13) + our custom `prototype-mode` plugin are now enabled.

**Resources:**
- Setup Guide: `.claude/PLUGIN_SETUP.md`
- Migration Details: `.claude/MIGRATION_GUIDE.md`

Questions? Check the docs or ask in team chat.

---

## Verification Checklist

After completing all steps:

- [ ] GitHub repo created at `universalagents-ai/ua-claude-code-plugins`
- [ ] Repo contains `.claude-plugin/marketplace.json` and `prototype-mode/`
- [ ] Old `ua-plugins/` directory removed from local machine
- [ ] Changes committed and pushed to `interplay` repo
- [ ] Both marketplaces added in Claude Code
- [ ] All 14 plugins visible in `/plugin` menu
- [ ] `prototype-mode` installs successfully
- [ ] Team notified

## What Happens Next

### For You
- Plugins load from GitHub marketplaces
- Updates are automatic
- Clean repository structure

### For Your Team
- Trust folder → Restart → Plugins auto-install
- No manual setup required
- Consistent tooling across team

## Troubleshooting

### Can't push to GitHub
- Verify you have write access to `universalagents-ai` org
- Check SSH keys: `ssh -T git@github.com`
- Or use HTTPS: `git remote set-url origin https://github.com/universalagents-ai/ua-claude-code-plugins.git`

### Plugins not showing up
- Refresh marketplaces: `/plugin marketplace update ua-plugins`
- Or restart Claude Code

### Team members can't access private repo
- They need access to `universalagents-ai` org
- Alternative: Make repo public (recommended for plugins)

## Next Steps

See [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md) for:
- Adding more plugins
- Development workflow
- Advanced configuration
