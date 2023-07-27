import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandBuilder, underscore } from "discord.js";
import player from "../../structure/Player";
import { audioType, urlType } from "../../utils";
import YouTube from "youtube-sr";
import { createSongEmbed } from "../../utils/embeds";

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
    const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
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
      await interaction.reply("No input detected!")
    }
    const inputType = player.checkInput(input);
    if (inputType === urlType.youtubeVideo) {
      console.log("Play Youtube Command Received!")
      const yt = await YouTube.searchOne(input)
      player.addToQueue(yt.url,audioType.Youtube,yt.title,undefined,yt.thumbnail!.url)
      if (player.isPlaying) {
          const nextSong = player.queue.nextSong()
          const embed = createSongEmbed(nextSong!,"Queued Song: ")
          await interaction.reply({embeds:[embed]})
      } else {
        await interaction.deferReply()
        player.playAudio(channel, interaction)
        
      }
    }
    else if (inputType === urlType.youtubePlaylist) {
      console.log("Play Youtube Playlist Command Received!")
      await player.addPlaylistToQueue(input)
      if (player.isPlaying) {
          const nextSong = player.queue.nextSong()
          const embed = createSongEmbed(nextSong!,"Queued Playlist: ")
          await interaction.reply({embeds:[embed]})
      } else {
        await interaction.deferReply()
        player.playAudio(channel, interaction)
        
      }
    }
    else if (inputType === urlType.unknown){
      const yt = await YouTube.searchOne(input)
      player.addToQueue(yt.url,audioType.Youtube,yt.title,undefined,yt.thumbnail!.url)
      if (player.isPlaying) {
          const nextSong = player.queue.nextSong()
          const embed = createSongEmbed(nextSong!,"Queued Song: ")
          await interaction.reply({embeds:[embed]})
      } else {
        await interaction.deferReply()
        player.playAudio(channel, interaction)
      }
    }
  },
};
