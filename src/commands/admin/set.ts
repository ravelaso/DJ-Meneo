import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "discord.js";
import {config} from "../../utils";
import {createGeneralEmbed} from "../../utils/embeds";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set")
        .setDescription("Set config variables - Only Admin (For Debug purposes)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("sixtolo")
                .setDescription("Sets Sixtolo Image")
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("url")
                        .setDescription("The URL for new Sixtolo Image.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("toc")
                .setDescription("Sets ToC Playlist")
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName("url")
                        .setDescription("The URL for ToC Playlist")
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const input: string = interaction.options.getString("url")!;
        if (subcommand === "sixtolo") {
            config.SixtoloIMG = input;
            const embed = createGeneralEmbed(
                "Sixtolo Image Setup",
                `Sixtolo Image changed to: ${input}`
            );
            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === "toc") {
            config.TOCPlaylist = input;
            const embed = createGeneralEmbed(
                "ToC Playlist Setup",
                `Changed playlist for /toc to: ${input}`
            );
            await interaction.reply({embeds: [embed], ephemeral: true});
        }
    },
};
