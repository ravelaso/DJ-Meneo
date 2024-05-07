import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import { createSongEmbed } from "../../utils/embeds";
import bot from "../../structure/Client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playing")
        .setDescription("Tells the current song"),

    async execute(interaction: ChatInputCommandInteraction) {
        const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
        const channel = guildMember!.voice.channel;
        const guildId = interaction.guild!;
        const guildPlayer = bot.players.get(guildId);
        
        if (!guildPlayer) {
            await interaction.reply({
                content: "There is no player associated with this guild.",
                ephemeral: true,
            });
            return;
        }
        if (!channel) {
            await interaction.reply({
              content: "You must be in a voice channel to use this command.",
              ephemeral: true,
            });
            return;
        }
        const currentSong = guildPlayer.currentSong
        if(!currentSong){
            await interaction.reply("Nothing is playing.")
        }
        const embed = createSongEmbed(currentSong!,"You're Listening to: ")
        await interaction.reply({embeds: [embed]})
    }
}