import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer, shiftQueue, deletePlayer } from "../music/player.js";
import { shoukaku } from "../index.js";

export const skipCommand = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track"),

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

    const nextTrack = shiftQueue(guildId);

    if (nextTrack) {
      await guildPlayer.player.playTrack({ track: { encoded: nextTrack.encoded } });
      await interaction.reply({ content: `Skipped. Now playing: **${nextTrack.info.title}**`, flags: MessageFlags.Ephemeral });
    } else {
      await guildPlayer.player.stopTrack();
      await shoukaku.leaveVoiceChannel(guildId);
      deletePlayer(guildId);
      await interaction.reply({ content: "Skipped. Queue is empty, leaving voice channel.", flags: MessageFlags.Ephemeral });
    }
  },
};
