import { Shoukaku, Connectors } from "shoukaku";
import { Client } from "discord.js";
import { config } from "../config.js";

const nodes = [
  {
    name: "main",
    url: `${config.lavalink.host}:${config.lavalink.port}`,
    auth: config.lavalink.password,
  },
];

export function createShoukaku(client: Client): Shoukaku {
  const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes, {
    moveOnDisconnect: false,
    resume: false,
    reconnectTries: 10,
    reconnectInterval: 5000,
  });

  shoukaku.on("ready", (name) => {
    console.log(`Lavalink node "${name}" connected`);
  });

  shoukaku.on("error", (name, error) => {
    console.error(`Lavalink node "${name}" error:`, error);
  });

  shoukaku.on("close", (name, code, reason) => {
    console.warn(`Lavalink node "${name}" closed: ${code} - ${reason}`);
  });

  shoukaku.on("disconnect", (name, count) => {
    console.warn(`Lavalink node "${name}" disconnected, ${count} players affected`);
  });

  return shoukaku;
}
