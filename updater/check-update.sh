#!/bin/sh

CONFIG_FILE="/config/application.yml"
GITHUB_API="https://api.github.com/repos/lavalink-devs/youtube-source/releases/latest"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Get latest version from GitHub
LATEST=$(curl -sf "$GITHUB_API" | jq -r '.tag_name')

if [ -z "$LATEST" ] || [ "$LATEST" = "null" ]; then
    log "ERROR: Failed to fetch latest version from GitHub"
    exit 1
fi

# Get current version from config
CURRENT=$(grep 'youtube-plugin:' "$CONFIG_FILE" | sed 's/.*youtube-plugin:\([^"]*\).*/\1/')

if [ -z "$CURRENT" ]; then
    log "ERROR: Failed to read current version from config"
    exit 1
fi

log "Current: $CURRENT | Latest: $LATEST"

# Compare versions
if [ "$CURRENT" = "$LATEST" ]; then
    log "Already up to date"
    exit 0
fi

log "Update available! Updating $CURRENT -> $LATEST"

# Update the config file
sed -i "s/youtube-plugin:$CURRENT/youtube-plugin:$LATEST/" "$CONFIG_FILE"

# Verify the update
UPDATED=$(grep 'youtube-plugin:' "$CONFIG_FILE" | sed 's/.*youtube-plugin:\([^"]*\).*/\1/')
if [ "$UPDATED" != "$LATEST" ]; then
    log "ERROR: Failed to update config file"
    exit 1
fi

log "Config updated. Restarting Lavalink..."

# Restart lavalink container
docker restart lavalink

if [ $? -eq 0 ]; then
    log "Lavalink restarted successfully"
else
    log "ERROR: Failed to restart Lavalink"
    exit 1
fi

log "Update complete!"
