import { EmbedBuilder } from 'discord.js';
import { Song, audioType, config } from '.';
import bot from '../structure/Client';

export function createSongEmbed(song: Song, text?: string): EmbedBuilder {
    if (song.type === audioType.Sixtolo) {
        const embed = new EmbedBuilder()
            .setTitle(`🔊 ${text} ${song.filename}`)
            .setImage(config.SixtoloIMG)
            .setFooter({
                text: `DJ-Meneo - Sixtolo`,
            })
            .setColor('#5158db');
        return embed;
    }
    if (song.type === audioType.Youtube) {
        const embed = new EmbedBuilder()
            .setTitle(`🔊 ${text} ${song.name}\n${song.url}`)
            .setImage(song.thumbnail!)
            .setFooter({
                text: `DJ-Meneo - Youtube`,
            })
            .setColor('#5158db');
        return embed;
    }
    else {
        const embed = new EmbedBuilder()
        return embed
    }
}
export function createHelpMessage() {
    const cachedCommands = bot.commands
    const embed = new EmbedBuilder()
        .setTitle('DJ-Meneo - Commands')
        .setDescription('Here is a list of available commands:')
        .setColor('#5158db');

    cachedCommands.forEach((command) => {
        embed.addFields({
            name: `/${command.data.name}`,
            value: `${command.data.description}`,
        });
    });
    return embed
}
export function createSixtoloList(fileList: string) {
    const embed = new EmbedBuilder()
        .setTitle('DJ-Meneo - Sixtolo Audios')
        .setDescription(`Here is a list of available Sixtolo Audios:\n🔊 ${fileList}`)
        .setThumbnail(`${config.SixtoloIMG}`)
        .setColor('#5158db');
            
    return embed
}

export function createRaidMessage() {
    // TODO
}
