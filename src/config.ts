import { config as dotenvConfig } from "dotenv";

dotenvConfig();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  discord: {
    token: requireEnv("DISCORD_TOKEN"),
    clientId: requireEnv("DISCORD_CLIENT_ID"),
  },
  lavalink: {
    host: process.env.LAVALINK_HOST ?? "localhost",
    port: parseInt(process.env.LAVALINK_PORT ?? "2333", 10),
    password: process.env.LAVALINK_PASSWORD ?? "youshallnotpass",
  },
} as const;
