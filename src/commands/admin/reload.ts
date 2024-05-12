import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import bot from "../../structure/Client";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Reload commands to GuildID"),

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.guild!.members.cache.get(interaction.user.id);
    await interaction.reply({ content: "Restarting Bot..." });
    await bot.startBot();
    await interaction.followUp({
      content: "Bot restarted on all servers",
      ephemeral: false,
    });
    return;
  },
};
