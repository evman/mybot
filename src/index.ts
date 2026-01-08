import { Client, GatewayIntentBits, Events, REST, Routes } from "discord.js";
import { config } from "./config.js";
import { createShoukaku } from "./music/manager.js";
import { commands, handleCommand } from "./commands/index.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Initialize Shoukaku BEFORE login so it catches shard events
export const shoukaku = createShoukaku(client);

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  // Register slash commands
  const rest = new REST().setToken(config.discord.token);
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: commands.map((cmd) => cmd.data.toJSON()),
    });
    console.log("Slash commands registered");
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleCommand(interaction);
});

client.login(config.discord.token);

// Graceful shutdown
function shutdown() {
  console.log("Shutting down...");
  client.destroy();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
