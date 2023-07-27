import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import dotenv from "dotenv"
dotenv.config()

export const config = {
  Token: process.env.Token!,
  ClientID: process.env.ClientID!,
  GuildID: process.env.GuildID!,
  SixtoloIMG: process.env.SixtoloIMG!,
  TOCPlaylist: process.env.TOCPlaylist!
}
// Types
export type Command = {
    data: SlashCommandBuilder; 
    execute: (interaction: CommandInteraction) => Promise<void>;
};

// Enum
export enum audioType {
    Sixtolo,
    Youtube,
    SoundCloud
  }

export enum urlType {
  youtubeVideo,
  youtubePlaylist,
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



