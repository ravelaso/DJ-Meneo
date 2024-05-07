import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
    AudioPlayer,
    AudioResource, AudioPlayerStatus,
} from "@discordjs/voice";
import {YouTube} from "youtube-sr";
import Queue from "./Queue";
import play from "play-dl";
import {audioType, Song, urlType} from "../utils";
import {ActivityType, ChatInputCommandInteraction, Guild, VoiceBasedChannel} from "discord.js";
import {createSongEmbed} from "../utils/embeds";

export class Player {
    guild: Guild;
    queue: Queue
    isPlaying: boolean
    connection: VoiceConnection | undefined
    AudioPlayer: AudioPlayer
    currentSong: Song | undefined
    resource: AudioResource | undefined

    constructor(guild: Guild) {
        this.queue = new Queue();
        this.isPlaying = false;
        this.AudioPlayer = createAudioPlayer();
        this.connection = undefined;
        this.currentSong = undefined;
        this.resource = undefined;
        this.guild = guild;
        // Player Event
        this.AudioPlayer.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });

        this.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
            guild.client.user.setPresence({activities: [{name: 'a ver que pasa...', type: ActivityType.Watching}]})
            this.isPlaying = false;
            this.playAudio()
            if (this.connection) {
                startIdleTimer(this)
            }
            console.log("Now Playing?: ", this.isPlaying)
        });

        this.AudioPlayer.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
            guild.client.user!.setPresence({
                activities: [{
                    name: this.currentSong!.name! ?? this.currentSong!.filename!,
                    type: ActivityType.Listening
                }]
            })
            console.log("Now Playing?: ", this.isPlaying)
            if (this.connection !== undefined) {
                resetIdleTimer()
            }
        });

        // TIMER
        // Time in milliseconds
        const idleTimeout = 60 * 1000; // 2 minutes 2*60*1000
        let idleTimeoutID: NodeJS.Timeout;

        function startIdleTimer(player: Player) {
            idleTimeoutID = setTimeout(() => {
                if (!player.connection) {
                    console.log("Connection already destroyed")
                }
                player.stop()
                console.log("Connection disconnected manually by TimeOut Function")

                // Additional logic or messages you may want to include after destroying the connection
            }, idleTimeout);
        }

        function resetIdleTimer() {
            clearTimeout(idleTimeoutID);
        }

    }

    async createConnection(channel: VoiceBasedChannel) {
        if (this.connection) {
            return
        }
        console.log("Creating voice connection")
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this.AudioPlayer)
    }

    async playAudio(channel?: VoiceBasedChannel, interaction?: ChatInputCommandInteraction) {
        try {
            if (this.isPlaying) {
                return
            }
            if (this.queue.isEmpty()) {
                this.currentSong = undefined;
                this.AudioPlayer.stop(true);
                console.log("Queue is Empty! Returning");
                return
            }
            await this.createConnection(channel!);
            this.currentSong = this.queue.shiftSong()
            console.log(this.currentSong)
            if (this.currentSong === undefined) {
                console.log("Could not fetch Song");
                return
            }
            if (this.currentSong.type === audioType.Sixtolo) {
                console.log("Playing Sixtolo");
                this.resource = createAudioResource(this.currentSong.url)
                this.AudioPlayer!.play(this.resource)
                if (interaction) {
                    const embed = createSongEmbed(this.currentSong, "Now Playing:");
                    await interaction.reply({embeds: [embed]});
                }
            } else if (this.currentSong.type === audioType.Youtube) {
                console.log("Playing Youtube");
                const stream = await play.stream(this.currentSong.url)
                this.resource = createAudioResource(stream.stream, {
                    inputType: stream.type
                })
                this.AudioPlayer.play(this.resource)
                if (interaction) {
                    const embed = createSongEmbed(this.currentSong, "Now Playing:");
                    await interaction.editReply({embeds: [embed]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async addPlaylistToQueue(playlistUrl: string): Promise<void> {
        const playlistId = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/)?.[1];
        if (!playlistId) {
            throw new Error("Invalid YouTube playlist URL");
        }
        const playlist = await YouTube.getPlaylist(playlistId);
        const videos = await playlist.fetch();
        for (const video of videos) {
            const url = `https://www.youtube.com/watch?v=${video.id}`
            const type = audioType.Youtube
            await this.addToQueue(url, type, video.title, undefined, video.thumbnail?.url);
        }
    }

    async addToQueue(url: string, type: audioType, name?: string, filename?: string, thumbnail?: string) {
        this.queue.addSong(url, type, name, filename, thumbnail);
    }

    async stop() {
        this.AudioPlayer.stop(true);
        this.resource = undefined
        this.isPlaying = false;
        this.queue.clear();
        if (this.connection) {
            this.connection.destroy();
            this.connection = undefined; // Set connection to undefined after destroying it
        }
    }

    async skip() {
        this.AudioPlayer.stop()
        await this.playAudio();
    }

    // async pause() {
    //   this.AudioPlayer.pause()
    //   setTimeout(() => this.AudioPlayer.unpause(), 15_000);
    // }
    public checkInput(input: string) {
        const youtubeVideoPattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+/;
        const youtubePlaylistPattern = input.match(/list=([a-zA-Z0-9_-]+)/)?.[1];
        const soundcloudPattern = /^https?:\/\/(soundcloud\.com)\/(.*)$/;

        if (youtubeVideoPattern.test(input)) {
            if (youtubePlaylistPattern) {
                return urlType.youtubePlaylist;
            }
            return urlType.youtubeVideo;
        }
        if (soundcloudPattern.test(input)) {
            return urlType.soundcloud;
        }
        return urlType.unknown;
    }
}

