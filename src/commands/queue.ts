import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer, getQueue, formatDuration } from "../music/player.js";

export const queueCommand = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue"),

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

    const queue = getQueue(guildId);
    const currentTrack = guildPlayer.player.track;

    const embed = new EmbedBuilder()
      .setTitle("Music Queue")
      .setColor(0x5865f2);

    // Current track
    if (currentTrack) {
      // Note: currentTrack is encoded, we'd need to store info separately
      // For now, show position info
      embed.addFields({
        name: "Now Playing",
        value: "Current track (use /nowplaying for details)",
      });
    }

    // Queue
    if (queue.length === 0) {
      embed.addFields({
        name: "Up Next",
        value: "Queue is empty",
      });
    } else {
      const queueList = queue
        .slice(0, 10)
        .map((track, index) => {
          const duration = formatDuration(track.info.length);
          return `${index + 1}. **${track.info.title}** (${duration})`;
        })
        .join("\n");

      const remaining = queue.length > 10 ? `\n...and ${queue.length - 10} more` : "";

      embed.addFields({
        name: `Up Next (${queue.length} tracks)`,
        value: queueList + remaining,
      });
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
