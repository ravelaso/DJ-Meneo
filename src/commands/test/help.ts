import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createHelpMessage } from '../../utils/embeds';

module.exports = {    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of all the commands'),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = createHelpMessage()
        await interaction.reply({ embeds: [embed], ephemeral:true});
    }
}
