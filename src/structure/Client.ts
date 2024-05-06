import {ActivityType, Client, Collection, Events, GatewayIntentBits, REST, Routes,} from "discord.js";
import fs from "fs";
import path from "path";
import {AudioPlayerStatus, generateDependencyReport} from "@discordjs/voice";
import {Command, config} from "../utils";
import player, {Player} from "./Player";

class Meneo extends Client {
    commands: Collection<string, Command>;
    GuildList?: string[]
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        });

        console.log(generateDependencyReport());
        this.commands = new Collection();
        this.login(config.Token);
        
        // -- Event Handling -- 
        //Client Ready
        this.on(Events.ClientReady, interaction => {
            console.log(`Ready! Logged in as ${interaction.user.tag}`);

            this.GuildList = this.getGuildIds();
            this.startBot();
            
            interaction.user.setPresence({
                activities: [{name: 'a ver que pasa...', type: ActivityType.Watching}],
                status: 'online',
            });
        })

        // Player Event
        player.AudioPlayer.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });

        player.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.user!.setPresence({activities: [{name: 'a ver que pasa...', type: ActivityType.Watching}]})
            player.isPlaying = false;
            player.playAudio()
            if (player.connection) {
                startIdleTimer(player)
            }
            console.log("Now Playing?: ", player.isPlaying)
        });

        player.AudioPlayer.on(AudioPlayerStatus.Playing, () => {
            player.isPlaying = true;
            this.user!.setPresence({
                activities: [{
                    name: player.currentSong!.name! ?? player.currentSong!.filename!,
                    type: ActivityType.Listening
                }]
            })
            console.log("Now Playing?: ", player.isPlaying)
            if (player.connection !== undefined) {
                resetIdleTimer()
            }
        });
        
        //Command Interaction
        this.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;
            const command = this.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
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

    async startBot() {
        await this.clearCache()
        await this.loadCommands()
        await this.deployCommands()
    }
    
    getGuildIds(){
        try {
            // Fetch all guilds the bot is connected to
            const guilds = this.guilds.cache;

            // Extract guild IDs
            return guilds.map(guild => guild.id);
        } catch (error) {
            console.error('Error fetching guild IDs:', error);
            return [];
        }
    }
    
    async clearCache() {
        const rest = new REST().setToken(config.Token!);

        const globalCommandsPromise = rest.put(
            Routes.applicationCommands(config.ClientID!),
            {body: []}
        );

        const guildCommandsPromise = this.GuildList!.map(guildId => {
            return rest.put(
                Routes.applicationGuildCommands(config.ClientID!, guildId),
                { body: [] }
            );
        });
        
        try {
            await Promise.all([guildCommandsPromise,globalCommandsPromise]);
            console.log("Successfully deleted all guild and application commands.");
        } catch (error) {
            console.error(error);
        }
    }

    async loadCommands() {
        const foldersPath = path.join(__dirname, "..", "commands");
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file: string) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command: Command = require(filePath);
                try {
                    this.commands.set(command.data.name, command);
                } catch (err) {
                    console.log(
                        `[WARNING] The command at ${filePath}: ${err}`
                    );
                }
            }
        }
    }
    
    async deployCommands() {
        const rest = new REST().setToken(config.Token!);
        try {
            const commands = Array.from(this.commands.values()).map(command => command.data.toJSON());

            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            for (const guildId of this.GuildList!) {
                const data: any = await rest.put(
                    Routes.applicationGuildCommands(config.ClientID, guildId),
                    { body: commands }
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
            }
        } catch (error) {
            console.error('Error deploying commands:', error);
        }
    }
}

const bot = new Meneo()
export default bot