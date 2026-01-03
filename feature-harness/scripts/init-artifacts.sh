#!/bin/bash
# Initialize .harness/ artifact directory structure
# Used by agents for multi-session context management

set -e

HARNESS_DIR="${1:-.harness}"

echo "Initializing Feature Harness artifacts in: $HARNESS_DIR"

# Create directory structure
mkdir -p "$HARNESS_DIR/checkpoints"

# Create empty artifacts if they don't exist
if [ ! -f "$HARNESS_DIR/session.json" ]; then
  cat > "$HARNESS_DIR/session.json" <<EOF
{
  "sessionNumber": 0,
  "status": "not_initialized",
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  echo "✓ Created session.json"
fi

if [ ! -f "$HARNESS_DIR/features.json" ]; then
  cat > "$HARNESS_DIR/features.json" <<EOF
{
  "features": [],
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  echo "✓ Created features.json"
fi

if [ ! -f "$HARNESS_DIR/progress.txt" ]; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Feature Harness initialized" > "$HARNESS_DIR/progress.txt"
  echo "✓ Created progress.txt"
fi

echo "✅ Artifact directory initialized successfully"
echo ""
echo "Directory structure:"
echo "$HARNESS_DIR/"
echo "├── session.json           # Session state"
echo "├── features.json          # Feature tracking"
echo "├── progress.txt           # Audit log"
echo "├── .linear_project.json   # (created by initializer)"
echo "├── codebase-inventory.json # (created by spec-writer or initializer)"
echo "└── checkpoints/           # Failure recovery data"
