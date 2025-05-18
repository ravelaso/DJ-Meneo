import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
    AudioPlayer,
    AudioResource,
    AudioPlayerStatus,
    demuxProbe,
    StreamType
} from "@discordjs/voice";
import { YouTube } from "youtube-sr";
import Queue from "./Queue";
import fs from "fs";
// import play from "play-dl";
import ytdl from "@distube/ytdl-core";
import { audioType, config, Song, urlType } from "../utils";
import {
    ActivityType,
    ChatInputCommandInteraction,
    Guild,
    VoiceBasedChannel,
} from "discord.js";
import { createSongEmbed } from "../utils/embeds";
import { Logger } from "./Logger";


// Read cookies JSON from file (relative to your project root)
const cookiesData = fs.readFileSync(config.YTDL_COOKIES, "utf-8");
const cookies = JSON.parse(cookiesData);
console.log("Cookies: ", cookies);
const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
};
const agent = ytdl.createAgent(cookies, agentOptions);

export class Player {
    guild: Guild;
    queue: Queue;
    isPlaying: boolean;
    connection: VoiceConnection | undefined;
    AudioPlayer: AudioPlayer;
    currentSong: Song | undefined;
    resource: AudioResource | undefined;

    constructor(guild: Guild) {
        this.queue = new Queue();
        this.isPlaying = false;
        this.AudioPlayer = createAudioPlayer();
        this.connection = undefined;
        this.currentSong = undefined;
        this.resource = undefined;
        this.guild = guild;


        // Player Event
        this.AudioPlayer.on("stateChange", (oldState, newState) => {
            Logger.LogMessage(
                `Audio player transitioned from ${oldState.status} to ${newState.status}`
            );
        });

        this.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
            guild.client.user.setPresence({
                activities: [
                    { name: "a ver que pasa...", type: ActivityType.Watching },
                ],
            });
            this.isPlaying = false;
            this.playAudio();
            if (this.connection) {
                startIdleTimer(this);
            }
            Logger.LogMessage("Now Playing?: ", this.isPlaying);
        });

        this.AudioPlayer.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
            guild.client.user!.setPresence({
                activities: [
                    {
                        name: this.currentSong!.name! ?? this.currentSong!.filename!,
                        type: ActivityType.Listening,
                    },
                ],
            });
            Logger.LogMessage("Now Playing?: ", this.isPlaying);
            if (this.connection !== undefined) {
                resetIdleTimer();
            }
        });

        // TIMER
        // Time in milliseconds
        const idleTimeout = 60 * 1000; // 2 minutes 2*60*1000
        let idleTimeoutID: NodeJS.Timeout;

        function startIdleTimer(player: Player) {
            idleTimeoutID = setTimeout(() => {
                if (!player.connection) {
                    Logger.LogMessage("Connection already destroyed");
                }
                player.stop();
                Logger.LogMessage(
                    "Connection disconnected manually by TimeOut Function"
                );

                // Additional logic or messages you may want to include after destroying the connection
            }, idleTimeout);
        }

        function resetIdleTimer() {
            clearTimeout(idleTimeoutID);
        }
    }

    async createConnection(channel: VoiceBasedChannel) {
        if (this.connection) {
            return;
        }
        Logger.LogMessage("Creating voice connection");
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this.AudioPlayer);
    }

    async playAudio(
        channel?: VoiceBasedChannel,
        interaction?: ChatInputCommandInteraction
    ) {
        try {
            if (this.isPlaying) {
                return;
            }
            if (this.queue.isEmpty()) {
                this.currentSong = undefined;
                this.AudioPlayer.stop(true);
                Logger.LogMessage("Queue is Empty! Returning");
                return;
            }
            await this.createConnection(channel!);
            this.currentSong = this.queue.shiftSong();
            Logger.LogMessage(
                "Fetching: ",
                this.currentSong?.name ?? this.currentSong?.filename
            );
            if (this.currentSong === undefined) {
                Logger.LogMessage("Could not fetch Song");
                return;
            }
            if (this.currentSong.type === audioType.Sixtolo) {
                Logger.LogMessage("Playing Sixtolo");
                this.resource = createAudioResource(this.currentSong.url);
                this.AudioPlayer!.play(this.resource);
                if (interaction) {
                    const embed = createSongEmbed(this.currentSong, "Now Playing:");
                    await interaction.reply({ embeds: [embed] });
                }
            } else if (this.currentSong.type === audioType.Youtube) {
                Logger.LogMessage("Playing Youtube");
                /* 1️⃣  ──────────────  download ONLY the audio  */
                const stream = ytdl(this.currentSong.url, {
                    agent,
                    filter: "audioonly",        // built-in ytdl filter – guarantees NO video
                    quality: "highestaudio",
                    highWaterMark: 1 << 25,     // 32 MiB buffer eliminates most network hiccups
                    liveBuffer: 5,
                });
                /* 2️⃣  ──────────────  let @discordjs/voice detect the container/codec  */
                const { stream: probed, type } = await demuxProbe(stream);

                /* 3️⃣  ──────────────  create the resource with the correct input type  */
                this.resource = createAudioResource(probed, { inputType: type });
                this.AudioPlayer.play(this.resource);

                /* handle unexpected stream errors */
                stream.once("error", (e) => Logger.Error("YTDL stream error:", e));

                if (interaction) {
                    const embed = createSongEmbed(this.currentSong, "Now Playing:");
                    await interaction.editReply({ embeds: [embed] });
                }

            }
        } catch (err: any) {
            Logger.Error(err);
        }
    }

    async addPlaylistToQueue(playlistUrl: string): Promise<void> {
        const match = playlistUrl.match(
            /\/watch\?v=([a-zA-Z0-9_-]+)&list=([a-zA-Z0-9_-]+)/
        );
        if (!match) {
            throw new Error("Invalid YouTube playlist URL");
        }

        const [, videoId, playlistId] = match;

        try {
            let playlist = await YouTube.getPlaylist(playlistUrl);
            if (playlist === null) playlist = await YouTube.getPlaylist(playlistId);

            if (playlist === null) {
                const url = `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`;
                playlist = await YouTube.getPlaylist(url);
            }

            const videos = await playlist.fetch();
            for (const video of videos) {
                const url = `https://www.youtube.com/watch?v=${video.id}`;
                const type = audioType.Youtube;
                await this.addToQueue(
                    url,
                    type,
                    video.title,
                    undefined,
                    video.thumbnail?.url
                );
            }
        } catch {
            const video = await YouTube.getVideo(
                `https://www.youtube.com/watch?v=${videoId}`
            );
            const url = `https://www.youtube.com/watch?v=${video.id}`;
            const type = audioType.Youtube;
            await this.addToQueue(
                url,
                type,
                video.title,
                undefined,
                video.thumbnail?.url
            );
        }
    }

    async addToQueue(
        url: string,
        type: audioType,
        name?: string,
        filename?: string,
        thumbnail?: string
    ) {
        this.queue.addSong(url, type, name, filename, thumbnail);
    }

    async stop() {
        this.AudioPlayer.stop(true);
        this.resource = undefined;
        this.isPlaying = false;
        this.queue.clear();
        if (this.connection) {
            this.connection.destroy();
            this.connection = undefined; // Set connection to undefined after destroying it
        }
    }

    async skip() {
        this.AudioPlayer.stop();
        await this.playAudio();
    }

    // async pause() {
    //   this.AudioPlayer.pause()
    //   setTimeout(() => this.AudioPlayer.unpause(), 15_000);
    // }

    public checkInput(input: string): urlType {
        const youtubeVideoPattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+/;
        const youtubePlaylistPattern = /list=([a-zA-Z0-9_-]+)/;
        const youtubeShortsPattern = /https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
        const soundcloudPattern = /^https?:\/\/(soundcloud\.com)\/(.*)$/;

        if (youtubeVideoPattern.test(input)) {
            if (youtubePlaylistPattern.test(input)) {
                return urlType.youtubePlaylist;
            }
            if (youtubeShortsPattern.test(input)) {
                return urlType.youtubeShorts;
            }
            return urlType.youtubeVideo;
        }
        if (soundcloudPattern.test(input)) {
            return urlType.soundcloud;
        }
        return urlType.unknown;
    }

    public convertShortsToWatch(url: string): string {
        const shortsRegex = /https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
        const match = url.match(shortsRegex);

        if (match && match[1]) {
            const videoId = match[1];
            return `https://www.youtube.com/watch?v=${videoId}`;
        } else {
            throw new Error("Invalid YouTube Shorts URL");
        }
    }

    public getSingleVideoURL(input: string): string {
        // Define the regex pattern to match YouTube video URLs
        const youtubeVideoPattern =
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/watch\?v=([a-zA-Z0-9_-]+)/;

        // Use regex to match and extract the video ID from the input URL
        const match = input.match(youtubeVideoPattern);

        // If a match is found and it contains the video ID
        if (match && match[4]) {
            // Construct the cleaned YouTube video URL
            return `https://www.youtube.com/watch?v=${match[4]}`;
        } else {
            // Return the original input if it doesn't match the expected format
            return input;
        }
    }
}
