import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  Events,
  ActivityType
} from "discord.js";
import fs from "fs";
import path from "path";
import { AudioPlayerStatus, generateDependencyReport } from "@discordjs/voice";
import { Command } from "../utils";
import player, { Player } from "./Player";
import { config } from "../utils";

class Meneo extends Client {
  commands: Collection<string, Command>;
  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    console.log(generateDependencyReport());
    this.commands = new Collection();
    this.startBot();
    // -- Event Handling -- 
    //Client Ready
    this.on(Events.ClientReady, interaction => {
      console.log(`Ready! Logged in as ${interaction.user.tag}`);
      interaction.user.setPresence({
        activities: [{ name: 'a ver que pasa...', type: ActivityType.Watching }],
        status: 'online',
      });
    })

    // Player Event
    player.AudioPlayer.on('stateChange', (oldState, newState) => {
      console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });

    player.AudioPlayer.on(AudioPlayerStatus.Idle, () => {
      this.user!.setPresence({ activities: [{ name: 'a ver que pasa...', type: ActivityType.Watching }] })
      player.isPlaying = false;
      player.playAudio()
      if (player.connection) {
        startIdleTimer(player)
      }
      console.log("Now Playing?: ",player.isPlaying)
    });
    player.AudioPlayer.on(AudioPlayerStatus.Playing, () => {
      player.isPlaying = true;
      this.user!.setPresence({ activities: [{ name: player.currentSong?.name || player.currentSong?.filename , type: ActivityType.Listening }] })
      console.log("Now Playing?: ",player.isPlaying)
      if (player.connection !== undefined) {
        resetIdleTimer(player)
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
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    });
    
    // TIMER
    // Time in milliseconds
    const idleTimeout = 1 * 60 * 1000; // 2 minutes 2*60*1000
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
    function resetIdleTimer(player: Player) {
      clearTimeout(idleTimeoutID);
    }
  }
  async startBot() {
    await this.clearCache();
    await this.loadCommands();
    await this.deployCommands();
    this.login(config.Token);
  }

  async clearCache() {
    const rest = new REST().setToken(config.Token!);

    const guildCommandsPromise = rest.put(
      Routes.applicationGuildCommands(config.ClientID!, config.GuildID!),
      { body: [] }
    );

    const globalCommandsPromise = rest.put(
      Routes.applicationCommands(config.ClientID!),
      { body: [] }
    );

    try {
      await Promise.all([guildCommandsPromise, globalCommandsPromise]);
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

      const data: any = await rest.put(
        Routes.applicationGuildCommands(config.ClientID!, config.GuildID!),
        { body: commands }
      );

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  }
}
const bot = new Meneo()
export default bot