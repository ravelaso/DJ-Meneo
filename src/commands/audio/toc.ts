import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../../utils";
import { createSongEmbed } from "../../utils/embeds";
import bot from "../../structure/Client";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toc")
    .setDescription("Plays the Trial of The Crusader / Sixtolo - Playlist"),

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
    await guildPlayer.addPlaylistToQueue(config.TOCPlaylist);
    if (guildPlayer.isPlaying) {
      const nextSong = guildPlayer.queue.nextSong();
      const embed = createSongEmbed(nextSong!, "Queued Playlist: ");
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.deferReply();
      await guildPlayer.playAudio(channel, interaction);
    }
  },
};
