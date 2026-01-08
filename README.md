# Discord Music Bot

A self-hosted Discord bot that plays music from YouTube in voice channels.

> **Important:** This bot is for **personal/private use only**. See [Disclaimer](#disclaimer) at the bottom.

---

## Requirements

Before you start, you need:

1. **Docker Desktop** (or Docker + Docker Compose on Linux)
   - Windows/Mac: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Linux: Install Docker Engine and Docker Compose

2. **A Discord Bot Token**
   - You'll create this in the setup steps below

3. **A VPN subscription with WireGuard support**
   - Recommended: [Mullvad VPN](https://mullvad.net) (~$5/month)
   - Why? YouTube blocks datacenter IPs. The VPN makes it work.

---

## Setup Guide

### Step 1: Download the bot

```bash
git clone https://github.com/evman/mybot.git
cd mybot
```

Or download as ZIP from GitHub and extract it.

---

### Step 2: Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "Music Bot") and click **Create**
4. Go to the **"Bot"** tab on the left
5. Click **"Reset Token"** and copy the token - **save this somewhere safe!**
6. Scroll down and enable these settings:
   - **Presence Intent** - OFF (not needed)
   - **Server Members Intent** - OFF (not needed)
   - **Message Content Intent** - OFF (not needed)

**Copy these two things:**
- **Token** - from the Bot tab (looks like `MTQ1ODA2MzkyNTQ3MDk1NzY3Nw.GRDYt9.xxxxx`)
- **Application ID** - from the General Information tab (a number like `1458063925470957677`)

---

### Step 3: Get VPN credentials

**For Mullvad (recommended):**

1. Go to [mullvad.net](https://mullvad.net) and create an account
2. Go to [mullvad.net/en/account/wireguard-config](https://mullvad.net/en/account/wireguard-config)
3. Generate a WireGuard configuration
4. Download the config file and open it in a text editor
5. You need these two values:
   - **PrivateKey** - looks like `AL/uVnzW+omjg/tBRMp42SRjvAHiagEMcFimOMIeeV4=`
   - **Address** - looks like `10.64.216.95/32`

---

### Step 4: Create your config file

1. Copy the example config:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor (Notepad, VS Code, nano, etc.)

3. Replace the placeholder values with your actual values:

   ```env
   # Paste your Discord bot token here
   DISCORD_TOKEN=MTQ1ODA2MzkyNTQ3MDk1NzY3Nw.GRDYt9.xxxxx

   # Paste your Discord Application ID here
   DISCORD_CLIENT_ID=1458063925470957677

   # Leave these as-is
   LAVALINK_HOST=localhost
   LAVALINK_PORT=2333
   LAVALINK_PASSWORD=youshallnotpass

   # Paste your WireGuard PrivateKey here
   WIREGUARD_PRIVATE_KEY=AL/uVnzW+omjg/tBRMp42SRjvAHiagEMcFimOMIeeV4=

   # Paste your WireGuard Address here
   WIREGUARD_ADDRESSES=10.64.216.95/32
   ```

4. Save the file

---

### Step 5: Start the bot

Open a terminal in the bot folder and run:

```bash
docker compose up -d
```

**First time will take a few minutes** - it's downloading everything it needs.

To check if it's running:
```bash
docker compose ps
```

You should see three containers all showing "Up" or "healthy":
- `gluetun` - the VPN
- `lavalink` - the audio server
- `musicbot` - the bot itself

---

### Step 6: Invite the bot to your Discord server

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click on your application
3. Go to **"OAuth2"** > **"URL Generator"**
4. Under **Scopes**, check:
   - `bot`
   - `applications.commands`
5. Under **Bot Permissions**, check:
   - `Connect`
   - `Speak`
6. Copy the generated URL at the bottom
7. Open the URL in your browser and select your server

---

### Step 7: Use the bot!

1. Join a voice channel in your Discord server
2. Type `/play` followed by a song name or YouTube URL
3. The bot will join and start playing!

---

## Commands

| Command | What it does |
|---------|--------------|
| `/play <song>` | Play a song (YouTube URL or search) |
| `/skip` | Skip to the next song |
| `/stop` | Stop playing and leave the channel |
| `/queue` | Show what's coming up next |
| `/pause` | Pause the music |
| `/resume` | Unpause the music |
| `/volume <1-100>` | Change the volume |

---

## Common Problems

### "No Lavalink nodes available"

The audio server isn't ready yet. Wait 30 seconds and try again.

Check if it's running:
```bash
docker compose ps
```

If `lavalink` shows "unhealthy", check the logs:
```bash
docker compose logs lavalink
```

---

### "No results found"

The VPN might not be connected. Check gluetun:
```bash
docker compose logs gluetun
```

Look for a line that says "Healthy!" or shows an IP address.

If you see errors about authentication, double-check your WireGuard credentials in `.env`.

---

### Bot doesn't respond to commands

1. Make sure the bot is online in Discord (should show in member list)
2. Try kicking the bot and re-inviting it
3. Check the bot logs:
   ```bash
   docker compose logs bot
   ```

---

### Music stops randomly or sounds bad

The VPN connection might be unstable. Try changing the server location in `docker-compose.yml`:

```yaml
- SERVER_CITIES=Zurich  # Change this to another city
```

Then restart:
```bash
docker compose down
docker compose up -d
```

---

## Useful Commands

```bash
# Start the bot
docker compose up -d

# Stop the bot
docker compose down

# Restart everything
docker compose restart

# See what's running
docker compose ps

# View logs (all)
docker compose logs

# View bot logs only
docker compose logs bot

# View logs in real-time (press Ctrl+C to stop)
docker compose logs -f

# Rebuild after making code changes
docker compose up -d --build
```

---

## Updating the Bot

```bash
git pull
docker compose up -d --build
```

---

## File Structure

```
mybot/
├── .env                 # YOUR SECRETS - never share this!
├── .env.example         # Template for .env
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # How to build the bot
├── package.json         # Node.js dependencies
├── lavalink/
│   └── application.yml  # Audio server config
└── src/                 # Bot source code
    ├── index.ts
    ├── config.ts
    ├── commands/
    └── music/
```

---

## Changing VPN Provider

The bot uses [gluetun](https://github.com/qdm12/gluetun) which supports many VPN providers.

Edit `docker-compose.yml` and change the gluetun environment section. See the [gluetun wiki](https://github.com/qdm12/gluetun-wiki) for your provider's settings.

---

## Disclaimer

**This bot is for personal, private use only.**

Streaming audio from YouTube may violate their Terms of Service. By using this software, you accept full responsibility for how you use it. The developers are not responsible for any misuse or violations of third-party terms of service.

This project is not affiliated with Discord, YouTube, Google, or any VPN provider.

---

## License

MIT - Do whatever you want with it.
