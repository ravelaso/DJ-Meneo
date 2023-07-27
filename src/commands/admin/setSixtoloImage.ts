import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { config } from "../../utils";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsixtoloimage')
        .setDescription('Sets the new image URL for Sixtolo Messages - Only Admin (For Debug purposes)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName("image")
                .setDescription("The URL or search query for the YouTube video.")
                .setRequired(true)
    ),
    async execute(interaction: ChatInputCommandInteraction) {
        const input:string = interaction.options.getString("image")!;
        config.SixtoloIMG = input
        await interaction.reply("Done")
    }
}