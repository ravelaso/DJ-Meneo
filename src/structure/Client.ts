import {ActivityType, Client, Collection, Events, GatewayIntentBits, Guild, REST, Routes,} from "discord.js";
import fs from "fs";
import path from "path";
import {generateDependencyReport} from "@discordjs/voice";
import {Command, config} from "../utils";
import {Player} from "./Player";

class Meneo extends Client {
    commands: Collection<string, Command>;
    GuildList?: Guild[];
    players: Map<Guild, Player>;
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        });
        
        console.log(generateDependencyReport());
        this.commands = new Collection();
        this.players = new Map();
        
        this.login(config.Token);
        
        // -- Event Handling -- 
        //Client Ready
        this.on(Events.ClientReady, interaction => {
            console.log(`Ready! Logged in as ${interaction.user.tag}`);
            
            this.GuildList = this.getGuilds();
            this.startBot();
            
            interaction.user.setPresence({
                activities: [{name: 'a ver que pasa...', type: ActivityType.Watching}],
                status: 'online',
            });
        })
        
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
    }

    async startBot() {
        await this.clearCache()
        await this.loadCommands()
        await this.deployCommands()
        await this.createPlayers()
    }
    
    getGuilds(): Guild[]{
        try {
            // Fetch all guilds the bot is connected to
            const guilds = this.guilds.cache;

            // Return an array of Guild objects
            return Array.from(guilds.values());
        } catch (error) {
            console.error('Error fetching guilds:', error);
            return [];
        }
    }
    
    async createPlayers() {
        for (const guild of this.GuildList!) {
            if (!this.players.has(guild)) {
                const player = new Player(guild);
                this.players.set(guild, player);
                console.log("Player created! for Guild:", guild.name);
            }
        }
    }
    
    async clearCache() {
        const rest = new REST().setToken(config.Token!);

        const globalCommandsPromise = rest.put(
            Routes.applicationCommands(config.ClientID!),
            {body: []}
        );

        const guildCommandsPromise = this.GuildList!.map(guild => {
            return rest.put(
                Routes.applicationGuildCommands(config.ClientID!, guild.id),
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
            
            for (const guild of this.GuildList!) {
                const data: any = await rest.put(
                    Routes.applicationGuildCommands(config.ClientID, guild.id),
                    { body: commands }
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guild.name}.`);
            }
        } catch (error) {
            console.error('Error deploying commands:', error);
        }
    }
}

const bot = new Meneo()
export default bot