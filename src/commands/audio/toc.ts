// import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
// import player from "../../structure/Player";
// import { config } from "../../utils";
// import { createSongEmbed } from "../../utils/embeds";
//
//
// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("toc")
//         .setDescription("Plays the Trial of The Crusader / Sixtolo - Playlist"),
//
//     async execute(interaction: ChatInputCommandInteraction) {
//         const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
//         const channel = guildMember!.voice.channel;
//         if (!channel) {
//             await interaction.reply({
//                 content: "You must be in a voice channel to use this command.",
//                 ephemeral: true,
//             });
//             return;
//         }
//         await player.addPlaylistToQueue(config.TOCPlaylist)
//         if (player.isPlaying) {
//             const nextSong = player.queue.nextSong()
//             const embed = createSongEmbed(nextSong!,"Queued Playlist: ")
//             await interaction.reply({embeds:[embed]})
//         } else {
//           await interaction.deferReply()
//           await player.playAudio(channel, interaction)
//         }
//     }
// }