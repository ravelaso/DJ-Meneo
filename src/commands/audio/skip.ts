// import { SlashCommandBuilder } from "discord.js";
// import { ChatInputCommandInteraction } from "discord.js";
// import player from "../../structure/Player";
// import { createSongEmbed } from "../../utils/embeds";
//
// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("skip")
//         .setDescription("Skips the current song"),
//
//     async execute(interaction: ChatInputCommandInteraction) {
//         const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
//         const channel = guildMember!.voice.channel;
//         if (!channel) {
//             await interaction.reply({
//               content: "You must be in a voice channel to use this command.",
//               ephemeral: true,
//             });
//             return;
//         }
//         const nextSong = player.queue.nextSong()
//         const embed = createSongEmbed(nextSong!,"⏭Song skipped, Now Playing: ")
//         await player.skip();
//         await interaction.reply({embeds:[embed]})          
//     }
// }