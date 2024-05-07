import {SlashCommandBuilder} from "discord.js"
import path from "path"
import fs from "fs"
import {ChatInputCommandInteraction} from "discord.js"
import {audioType} from "../../utils"
import {createSixtoloEmbed, createSongEmbed} from "../../utils/embeds"
import bot from "../../structure/Client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sixtolo")
        .setDescription("Play a random audio file from the sixtolo folder")
        .addSubcommand((subcommand) =>
            subcommand.setName("random").setDescription("Play a random audio file")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("List available audio files")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("play")
                .setDescription("Play a specific audio file")
                .addStringOption((option) =>
                    option
                        .setName("filename")
                        .setDescription("The name of the audio file")
                        .setRequired(true)
                )
        ),
    //.toJSON(),
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
        console.log('Sixtolo command received');
        const guildMember = interaction.guild!.members.cache.get(interaction.user.id)
        const voiceChannel = guildMember!.voice.channel;
        const subcommand = interaction.options.getSubcommand();
        const folderPath = path.resolve(__dirname, '..', '..', 'public', 'sixtolo');
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.mp3'));
        if (subcommand === 'random') {
            if (!files.length) {
                return await interaction.reply('No .mp3 files found in the sixtolo folder.');
            }
            if (!voiceChannel) {
                return await interaction.reply('You need to be in a voice channel to use this command.');
            }
            const filename = files[Math.floor(Math.random() * files.length)];
            const filePath = path.join(folderPath, filename);
            await guildPlayer.addToQueue(filePath, audioType.Sixtolo, undefined, filename)
            if (guildPlayer.isPlaying) {
                const nextSong = guildPlayer.queue.nextSong()
                const embed = createSongEmbed(nextSong!, "Queued Sixtolo: ")
                await interaction.reply({embeds: [embed]})
            }
            await guildPlayer.playAudio(voiceChannel, interaction)
        } else if (subcommand === 'list') {
            if (!files.length) {
                return await interaction.reply({
                    content: 'No .mp3 files found in the sixtolo folder.',
                    ephemeral: true
                });
            }
            const fileList = files.map(file => `${file.slice(0, -4)}`).join('\n🔊  ');
            const embed = createSixtoloEmbed(fileList)
            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === 'play') {
            if (!voiceChannel) {
                return await interaction.reply('You need to be in a voice channel to use this command.');
            }
            const filename = interaction.options.getString('filename');
            if (files.includes(`${filename}.mp3`)) {
                const filePath = path.join(folderPath, `${filename}.mp3`);
                await guildPlayer.addToQueue(filePath, audioType.Sixtolo, undefined, filename!)
                if (guildPlayer.isPlaying) {
                    const nextSong = guildPlayer.queue.nextSong()
                    const embed = createSongEmbed(nextSong!, "Queued Sixtolo: ")
                    await interaction.reply({embeds: [embed]})
                } else {
                    await guildPlayer.playAudio(voiceChannel, interaction)
                }
            } else {
                await interaction.reply(`The audio file "${filename}.mp3" was not found in the sixtolo folder.`);
            }
        }
    },
};
