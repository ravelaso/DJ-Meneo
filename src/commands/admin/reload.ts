import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {ChatInputCommandInteraction} from "discord.js";
import client from "../../structure/Client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Reload commands to GuildID"),

    async execute(interaction: ChatInputCommandInteraction) {
        interaction.guild!.members.cache.get(interaction.user.id);
        await client.startBot();

        await interaction.reply({
            content: "Bot commands reloaded to all servers",
            ephemeral: false,
        });
        return;
    }
}
