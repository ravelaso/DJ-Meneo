import {AutocompleteInteraction, CommandInteraction, SlashCommandBuilder} from "discord.js";
import dotenv from "dotenv"

dotenv.config()

export const config = {
    Token: process.env.Token!,
    ClientID: process.env.ClientID!,
    SixtoloIMG: process.env.SixtoloIMG!,
    TOCPlaylist: process.env.TOCPlaylist!,
    YoutubeAPI: process.env.YoutubeAPI!,
    YTDL_COOKIES: "cookies.json"
}

// Types
export type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
    autocomplete?: (Interaction: AutocompleteInteraction) => Promise<void>;
};

// Enum
export enum audioType {
    Sixtolo,
    Youtube
}

export enum urlType {
    youtubeVideo,
    youtubePlaylist,
    youtubeShorts,
    soundcloud,
    unknown
}

// Interfaces
export interface Song {
    url: string;
    type: audioType;
    name?: string;
    filename?: string;
    thumbnail?: string;
}



