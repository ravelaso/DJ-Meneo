import {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  SlashCommandBuilder,
} from "discord.js";
import { audioType, urlType } from "../../utils";
import YouTube from "youtube-sr";
import { createSongEmbed } from "../../utils/embeds";
import bot from "../../structure/Client"; // Import the bot instance to access players
import { Logger } from "../../structure/Logger";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays audio from a YouTube video.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("input")
        .setDescription("The URL or search query for the YouTube video.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!;
    const guildPlayer = bot.players.get(guildId);

    if (!guildPlayer) {
      await interaction.reply({
        content: "There is no player associated with this guild.",
        ephemeral: true,
      });
      return;
    }

    const guildMember = interaction.guild!.members.cache.get(
      interaction.user.id
    );
    const channel = guildMember!.voice.channel;
    if (!channel) {
      await interaction.reply({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }

    const input: string = interaction.options.getString("input")!;
    if (input === null) {
      await interaction.reply("No input detected!");
    }

    const inputType = guildPlayer.checkInput(input);

    if (inputType === urlType.youtubeVideo) {
      Logger.LogMessage("Play Youtube Command Received!");

      const yt = await YouTube.getVideo(input);

      await guildPlayer.addToQueue(
        input,
        audioType.Youtube,
        yt.title,
        undefined,
        yt.thumbnail!.url
      );

      if (guildPlayer.isPlaying) {
        const nextSong = guildPlayer.queue.nextSong();
        const embed = createSongEmbed(nextSong!, "Queued Song: ");
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.deferReply();
        await guildPlayer.playAudio(channel, interaction);
      }
    } else if (inputType === urlType.youtubePlaylist) {
      Logger.LogMessage("Play Youtube Playlist Command Received!");
      await guildPlayer.addPlaylistToQueue(input);
      if (guildPlayer.isPlaying) {
        const nextSong = guildPlayer.queue.nextSong();
        const embed = createSongEmbed(nextSong!, "Queued Playlist: ");
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.deferReply();
        await guildPlayer.playAudio(channel, interaction);
      }
    } else if (inputType === urlType.unknown) {
      const yt = await YouTube.searchOne(input);
      await guildPlayer.addToQueue(
        yt.url,
        audioType.Youtube,
        yt.title,
        undefined,
        yt.thumbnail!.url
      );
      if (guildPlayer.isPlaying) {
        const nextSong = guildPlayer.queue.nextSong();
        const embed = createSongEmbed(nextSong!, "Queued Song: ");
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.deferReply();
        await guildPlayer.playAudio(channel, interaction);
      }
    }
  },
};
