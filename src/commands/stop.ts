import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer, deletePlayer, clearQueue } from "../music/player.js";
import { shoukaku } from "../index.js";

export const stopCommand = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),

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

    clearQueue(guildId);
    await guildPlayer.player.stopTrack();
    await shoukaku.leaveVoiceChannel(guildId);
    deletePlayer(guildId);

    await interaction.reply({ content: "Stopped playback and cleared the queue", flags: MessageFlags.Ephemeral });
  },
};
