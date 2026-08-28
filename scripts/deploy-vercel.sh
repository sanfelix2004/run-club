#!/bin/bash
set -euo pipefail
DEPLOY_ENDPOINT="https://claude-skills-deploy.vercel.com/api/deploy"
PROJECT_PATH="${1:-.}"
TEMP_DIR=$(mktemp -d)
TARBALL="$TEMP_DIR/project.tgz"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Creating deployment package..." >&2
tar -czf "$TARBALL" -C "$PROJECT_PATH" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='.secrets' \
  --exclude='download' \
  .

echo "Deploying to Vercel..." >&2
RESPONSE=$(curl -s -X POST "$DEPLOY_ENDPOINT" -F "file=@$TARBALL" -F "framework=nextjs")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Deploy error: $RESPONSE" >&2
  exit 1
fi

echo "$RESPONSE" | tee "$PROJECT_PATH/deploy-result.json" >&2
echo "$RESPONSE"
