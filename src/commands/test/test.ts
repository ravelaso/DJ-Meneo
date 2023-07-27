import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import path from "path"
import fs from "fs"
import { ChatInputCommandInteraction } from "discord.js"
import player from "../../structure/Player"
import { audioType } from "../../utils"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Multiple Test Commands - Only Admin (For Debug purposes)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("sixtolo").setDescription("test sixtolo type")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("youtube").setDescription("test yt type")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("playlist").setDescription("test yt playlist")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stop").setDescription("test player stop")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("skip").setDescription("test player skip")
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
    const voiceChannel = guildMember!.voice.channel;
    const subcommand = interaction.options.getSubcommand(); // Get the subcommand
    try {
      const folderPath = path.resolve(__dirname, '..', '..', 'sounds', 'sixtolo');
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.mp3'));
      if (!voiceChannel) {
        return
      }
      if (subcommand === 'sixtolo') {
        console.log('Sixtolo command received');
        const filename = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(folderPath, filename);
        player.addToQueue(filePath, audioType.Sixtolo, filename)
        if (player.isPlaying) {
          await interaction!.reply({
            content: `Added to Queue! 🔊 ${filename}`
          });
        } else {
          player.playAudio(voiceChannel, interaction)
        }
      }
      else if (subcommand === 'youtube') {
        console.log('Youtube command received');
        await player.queue.addSong("https://www.youtube.com/watch?v=BZP1rYjoBgI", audioType.Youtube)
        if (player.isPlaying) {
          await interaction!.reply({
            content: `🔊 Added to Queue!`
          });
        } else {
          player.playAudio(voiceChannel, interaction)
        }
      }
      else if (subcommand === 'playlist') {
          await player.addPlaylistToQueue("https://www.youtube.com/playlist?list=PL33vJEM2z2rQpvZyXAzg-3ZN50jBb1_xJ")
          if (player.isPlaying) {
            await interaction!.reply({
              content: `🔊 Added to Queue!`
            });
          } else {
            player.playAudio(voiceChannel, interaction)
          }
      }
      else if (subcommand === 'stop'){
        player.stop()
        await interaction!.reply("Player stopped!")
      }
      else if(subcommand === 'skip'){
        player.skip()
        await interaction!.reply("Song Skipped!")
      }
    } catch (err) {
      await interaction.reply(`Error: ${err}`)
    }
  },
};