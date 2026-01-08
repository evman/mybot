import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import { shoukaku } from "../index.js";
import { getPlayer, setPlayer, addToQueue, Track } from "../music/player.js";

export const playCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("YouTube URL or search query")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "Join a voice channel first",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const query = interaction.options.getString("query", true);
    const guildId = interaction.guildId!;

    const node = shoukaku.options.nodeResolver(shoukaku.nodes);
    if (!node) {
      await interaction.editReply("No Lavalink nodes available");
      return;
    }

    const isUrl = query.startsWith("http://") || query.startsWith("https://");
    const searchQuery = isUrl ? query : `ytsearch:${query}`;
    const result = await node.rest.resolve(searchQuery);

    if (!result || result.loadType === "empty" || result.loadType === "error") {
      await interaction.editReply("No results found");
      return;
    }

    let tracks: Track[] = [];
    if (result.loadType === "track") {
      tracks = [result.data as Track];
    } else if (result.loadType === "search") {
      tracks = [result.data[0] as Track];
    } else if (result.loadType === "playlist") {
      tracks = result.data.tracks as Track[];
    }

    if (tracks.length === 0) {
      await interaction.editReply("No results found");
      return;
    }

    let guildPlayer = getPlayer(guildId);

    if (!guildPlayer) {
      const player = await shoukaku.joinVoiceChannel({
        guildId,
        channelId: voiceChannel.id,
        shardId: 0,
      });

      guildPlayer = {
        player,
        queue: [],
        textChannel: interaction.channel as any,
        volume: 50,
      };

      await player.setGlobalVolume(50);

      player.on("end", async () => {
        const gp = getPlayer(guildId);
        if (!gp) return;

        const nextTrack = gp.queue.shift();
        if (nextTrack) {
          await gp.player.playTrack({ track: { encoded: nextTrack.encoded } });
          await gp.textChannel.send(`Now playing: **${nextTrack.info.title}**`);
        }
      });

      setPlayer(guildId, guildPlayer);
    }

    const firstTrack = tracks[0];
    const isPlaying = guildPlayer.player.track !== null;

    if (!isPlaying) {
      await guildPlayer.player.playTrack({ track: { encoded: firstTrack.encoded } });
      tracks.slice(1).forEach((track) => addToQueue(guildId, track));

      if (tracks.length === 1) {
        await interaction.editReply(`Now playing: **${firstTrack.info.title}**`);
      } else {
        await interaction.editReply(
          `Now playing: **${firstTrack.info.title}** (+${tracks.length - 1} queued)`
        );
      }
    } else {
      tracks.forEach((track) => addToQueue(guildId, track));

      if (tracks.length === 1) {
        await interaction.editReply(`Added to queue: **${firstTrack.info.title}**`);
      } else {
        await interaction.editReply(`Added ${tracks.length} tracks to queue`);
      }
    }
  },
};
