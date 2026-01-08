import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer } from "../music/player.js";

export const pauseCommand = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current track"),

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

    if (guildPlayer.player.paused) {
      await interaction.reply({
        content: "Already paused",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await guildPlayer.player.setPaused(true);
    await interaction.reply({ content: "Paused", flags: MessageFlags.Ephemeral });
  },
};
