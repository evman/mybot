import { Player } from "shoukaku";
import { TextChannel } from "discord.js";

export interface Track {
  encoded: string;
  info: {
    title: string;
    author: string;
    length: number;
    uri: string;
  };
}

export interface GuildPlayer {
  player: Player;
  queue: Track[];
  textChannel: TextChannel;
  volume: number;
}

// Store players per guild
export const players = new Map<string, GuildPlayer>();

export function getPlayer(guildId: string): GuildPlayer | undefined {
  return players.get(guildId);
}

export function setPlayer(guildId: string, guildPlayer: GuildPlayer): void {
  players.set(guildId, guildPlayer);
}

export function deletePlayer(guildId: string): void {
  players.delete(guildId);
}

export function addToQueue(guildId: string, track: Track): number {
  const guildPlayer = players.get(guildId);
  if (!guildPlayer) return -1;
  guildPlayer.queue.push(track);
  return guildPlayer.queue.length;
}

export function getQueue(guildId: string): Track[] {
  return players.get(guildId)?.queue ?? [];
}

export function clearQueue(guildId: string): void {
  const guildPlayer = players.get(guildId);
  if (guildPlayer) {
    guildPlayer.queue = [];
  }
}

export function shiftQueue(guildId: string): Track | undefined {
  const guildPlayer = players.get(guildId);
  if (!guildPlayer) return undefined;
  return guildPlayer.queue.shift();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
