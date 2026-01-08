import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";

import { playCommand } from "./play.js";
import { skipCommand } from "./skip.js";
import { stopCommand } from "./stop.js";
import { queueCommand } from "./queue.js";
import { pauseCommand } from "./pause.js";
import { resumeCommand } from "./resume.js";
import { volumeCommand } from "./volume.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands: Command[] = [
  playCommand,
  skipCommand,
  stopCommand,
  queueCommand,
  pauseCommand,
  resumeCommand,
  volumeCommand,
];

const commandMap = new Map(commands.map((cmd) => [cmd.data.name, cmd]));

export async function handleCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = commandMap.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: "Unknown command",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const content = "An error occurred while executing this command";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  }
}
