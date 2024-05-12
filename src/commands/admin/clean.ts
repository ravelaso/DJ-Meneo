import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import bot from "../../structure/Client";
import { Logger } from "../../structure/Logger";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clean")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Clean Cache of Bot and Commands"),

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.guild!.members.cache.get(interaction.user.id);
    await interaction.reply({ content: "Cleaning Bot Commands..." });
    bot.clearCache();
    await interaction.followUp({
      content: "Bot commands reloaded to all servers",
      ephemeral: false,
    });
    return;
  },
};
