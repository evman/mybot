import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer } from "../music/player.js";

export const resumeCommand = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the current track"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const guildPlayer = getPlayer(guildId);

    if (!guildPlayer) {
      await interaction.reply({
        content: "Nothing is playing",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!guildPlayer.player.paused) {
      await interaction.reply({
        content: "Not paused",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await guildPlayer.player.setPaused(false);
    await interaction.reply({ content: "Resumed", flags: MessageFlags.Ephemeral });
  },
};
