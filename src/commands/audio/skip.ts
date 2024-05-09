import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import { createSongEmbed } from "../../utils/embeds";
import bot from "../../structure/Client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current song"),

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
        
        const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
        const channel = guildMember!.voice.channel;
        if (!channel) {
            await interaction.reply({
              content: "You must be in a voice channel to use this command.",
              ephemeral: true,
            });
            return;
        }
        const nextSong = guildPlayer.queue.nextSong()
        const embed = createSongEmbed(nextSong!,"⏭Song skipped, Now Playing: ")
        await guildPlayer.skip();
        await interaction.reply({embeds:[embed]})          
    }
}