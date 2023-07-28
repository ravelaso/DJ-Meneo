import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createHelpEmbed } from '../../utils/embeds';

module.exports = {    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of all the commands'),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = createHelpEmbed()
        await interaction.reply({ embeds: [embed], ephemeral:true});
    }
}
