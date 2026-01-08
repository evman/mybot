# Discord Music Bot

A self-hosted Discord music bot that streams audio from YouTube using Lavalink. Built for personal/private use.

## Features

- Play music from YouTube URLs or search queries
- Queue management with skip, pause, resume, and stop
- Volume control (1-100%)
- Playlist support
- VPN integration for reliable playback on datacenter IPs

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Discord.js    │────▶│    Lavalink     │────▶│     gluetun     │
│   Bot (Node)    │     │  (Audio Server) │     │   (VPN Client)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                       │
   Slash Commands          Audio Streaming          VPN Tunnel
   Queue Management        YouTube Plugin           (Mullvad)
```

**Components:**
- **Bot** - Discord.js v14 + Shoukaku (Lavalink client)
- **Lavalink** - High-performance audio streaming server with YouTube plugin
- **gluetun** - VPN container (routes Lavalink traffic through VPN)

## Prerequisites

- Docker and Docker Compose
- Discord Bot Token ([create one here](https://discord.com/developers/applications))
- VPN subscription with WireGuard support (e.g., [Mullvad](https://mullvad.net))

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/evman/mybot.git
cd mybot
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
WIREGUARD_PRIVATE_KEY=your_wireguard_private_key
```

### 3. Configure VPN (gluetun)

Edit `docker-compose.yml` and update the gluetun environment variables for your VPN provider:

```yaml
environment:
  - VPN_SERVICE_PROVIDER=mullvad  # Your VPN provider
  - VPN_TYPE=wireguard
  - WIREGUARD_PRIVATE_KEY=${WIREGUARD_PRIVATE_KEY}
  - WIREGUARD_ADDRESSES=10.x.x.x/32  # From your WireGuard config
  - SERVER_CITIES=Zurich  # Your preferred server location
```

See [gluetun documentation](https://github.com/qdm12/gluetun-wiki) for other VPN providers.

### 4. Start the bot

```bash
docker compose up -d
```

### 5. Invite the bot to your server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3145728&scope=bot%20applications.commands
```

Required permissions:
- Connect (to voice channels)
- Speak (to play audio)

## Commands

| Command | Description |
|---------|-------------|
| `/play <query>` | Play a YouTube URL or search for a song |
| `/skip` | Skip the current track |
| `/stop` | Stop playback and clear the queue |
| `/queue` | Show the current queue |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/volume <1-100>` | Set playback volume |

## Project Structure

```
musicbot/
├── docker-compose.yml      # Docker services configuration
├── Dockerfile              # Bot container build
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            # Bot entry point
│   ├── config.ts           # Environment configuration
│   ├── commands/
│   │   ├── index.ts        # Command handler
│   │   ├── play.ts         # /play command
│   │   ├── skip.ts         # /skip command
│   │   ├── stop.ts         # /stop command
│   │   ├── queue.ts        # /queue command
│   │   ├── pause.ts        # /pause command
│   │   ├── resume.ts       # /resume command
│   │   └── volume.ts       # /volume command
│   └── music/
│       ├── manager.ts      # Shoukaku/Lavalink setup
│       └── player.ts       # Queue management
└── lavalink/
    └── application.yml     # Lavalink configuration
```

## Configuration

### Lavalink (`lavalink/application.yml`)

The YouTube plugin is configured with multiple client fallbacks and a remote cipher server for reliability:

```yaml
plugins:
  youtube:
    enabled: true
    allowSearch: true
    allowDirectVideoIds: true
    allowDirectPlaylistIds: true
    clients:
      - MUSIC
      - WEB
      - TV
      - IOS
    remoteCipher:
      url: "https://cipher.kikkia.dev/"
```

### Why VPN?

YouTube blocks or rate-limits requests from datacenter IP addresses. The gluetun container routes Lavalink's traffic through a VPN (residential IP), allowing reliable playback.

The bot container itself does NOT go through the VPN - only Lavalink does. This is achieved through Docker's `network_mode: "service:gluetun"`.

## Useful Commands

```bash
# View logs
docker compose logs -f bot        # Bot logs
docker compose logs -f lavalink   # Lavalink logs
docker compose logs -f gluetun    # VPN logs

# Restart services
docker compose restart bot
docker compose restart lavalink

# Rebuild after code changes
docker compose up -d --build

# Stop everything
docker compose down

# Check container status
docker compose ps

# Test Lavalink API directly
curl -s "http://localhost:2333/v4/loadtracks?identifier=ytsearch:test" \
  -H "Authorization: youshallnotpass"
```

## Troubleshooting

### "No Lavalink nodes available"
- Wait for Lavalink to fully start (check `docker compose logs lavalink`)
- The bot waits for Lavalink's healthcheck before starting

### "No results found"
- Check if gluetun is connected: `docker compose logs gluetun | grep -i "ip\|connected"`
- Verify VPN credentials in `.env`

### "This video is unavailable"
- The remote cipher server may be temporarily down
- Try a different video
- Check Lavalink logs for specific errors

### Audio cuts out or is choppy
- Increase Lavalink memory: change `-Xmx512M` to `-Xmx1G` in docker-compose.yml
- Check VPN connection stability

### Bot not responding to commands
- Ensure slash commands are registered: `docker compose logs bot | grep -i "command"`
- Try kicking and re-inviting the bot

## Tech Stack

- [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Discord.js v14](https://discord.js.org/) - Discord API wrapper
- [Shoukaku v4](https://github.com/shipgirlproject/Shoukaku) - Lavalink client
- [Lavalink v4](https://github.com/lavalink-devs/Lavalink) - Audio streaming server
- [youtube-source](https://github.com/lavalink-devs/youtube-source) - YouTube plugin for Lavalink
- [gluetun](https://github.com/qdm12/gluetun) - VPN client container

## Disclaimer

This bot is intended for **personal, private use only**.

Streaming content from YouTube may violate their Terms of Service. The developers of this project are not responsible for any misuse or any violations of third-party terms of service. Use at your own risk and discretion.

This project is not affiliated with Discord, YouTube, Google, or any VPN provider.

## License

MIT
