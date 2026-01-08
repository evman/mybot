import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { getPlayer } from "../music/player.js";

export const volumeCommand = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the playback volume")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Volume level (0-100)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ) as SlashCommandBuilder,

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

    const level = interaction.options.getInteger("level", true);

    await guildPlayer.player.setGlobalVolume(level);
    guildPlayer.volume = level;

    await interaction.reply({ content: `Volume set to ${level}%`, flags: MessageFlags.Ephemeral });
  },
};
