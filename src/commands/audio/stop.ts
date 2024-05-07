// import { SlashCommandBuilder } from "discord.js";
// import { ChatInputCommandInteraction } from "discord.js";
// import player from "../../structure/Player";
//
// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("stop")
//         .setDescription("Stops the audio player, also disconnects the bot"),
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
//         await player.stop();
//         await interaction.reply("Player Stopped and Bot Disconnected")
//     }
// }