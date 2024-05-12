import {ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';
import {audioType, config, Song} from '.';
import bot from '../structure/Client';



export function createModal(){
    const modal = new ModalBuilder()
			.setCustomId('myModal')
			.setTitle('My Modal');

		// Add components to modal

		// Create the text input components
		const title = new TextInputBuilder()
			.setCustomId('titlePoll')
		    // The label is the prompt the user sees for this input
			.setLabel("What's the poll about?")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const pollOptions = new TextInputBuilder()
			.setCustomId('pollOptions')
			.setLabel("What's some of your favorite hobbies?")
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(title);
		const secondActionRow = new ActionRowBuilder().addComponents(pollOptions);
        // Add inputs to the modal
        //@ts-ignore
		modal.addComponents(firstActionRow, secondActionRow);
        return modal
}


export function createSongEmbed(song: Song, text?: string): EmbedBuilder {
    if (song.type === audioType.Sixtolo) {
        return new EmbedBuilder()
            .setTitle(`🔊 ${text} ${song.filename}`)
            .setImage(config.SixtoloIMG)
            .setFooter({
                text: `DJ-Meneo - Sixtolo`,
            })
            .setColor('#5158db');
    }
    if (song.type === audioType.Youtube) {
        return new EmbedBuilder()
            .setTitle(`🔊 ${text} ${song.name}\n${song.url}`)
            .setImage(song.thumbnail!)
            .setFooter({
                text: `DJ-Meneo - Youtube`,
            })
            .setColor('#5158db');
    }
    else {
        return new EmbedBuilder()
    }
}

export function createHelpEmbed() {
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
export function createSixtoloEmbed(fileList: string) {
    return new EmbedBuilder()
        .setTitle('DJ-Meneo - Sixtolo Audios')
        .setDescription(`Here is a list of available Sixtolo Audios:\n🔊 ${fileList}`)
        .setThumbnail(`${config.SixtoloIMG}`)
        .setColor('#5158db')
}
export function createGeneralEmbed(title?: string, desc?: string) {
    return new EmbedBuilder()
        .setTitle(`DJ-Meneo - General:\n ${title}`)
        .setDescription(`This is a general response for internal commands:\n ${desc}`)
        .setColor('#db8f51')
}
