import {
  ActivityType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Guild,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
import { generateDependencyReport } from "@discordjs/voice";
import { Command, config } from "../utils";
import { Player } from "./Player";
import { Logger } from "./Logger";

class Meneo extends Client {
  commands: Collection<string, Command>;
  GuildList?: Guild[];
  players: Map<Guild, Player>;

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    Logger.LogMessage(generateDependencyReport());
    this.commands = new Collection();
    this.players = new Map();

    this.login(config.Token);

    // -- Event Handling --
    //Client Ready
    this.on(Events.ClientReady, (interaction) => {
      Logger.LogMessage("Ready! Logged in as", interaction.user.tag);

      this.GuildList = this.getGuilds();
      this.startBot();

      interaction.user.setPresence({
        activities: [
          { name: "a ver que pasa...", type: ActivityType.Watching },
        ],
        status: "online",
      });
    });

    //Command Interaction
    this.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        const command = this.commands.get(interaction.commandName);

        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error: any) {
          Logger.Error(error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      } else if (interaction.isAutocomplete()) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
          Logger.Error(
            "No command matching was found for:",
            interaction.commandName
          );
          return;
        }

        try {
          await command.autocomplete!(interaction);
        } catch (error: any) {
          Logger.Error(error);
        }
      }
    });
  }

  async startBot() {
    this.clearCache();
    this.loadCommands();
    this.deployCommands();
    this.createPlayers();
  }

  getGuilds(): Guild[] {
    try {
      const guilds = this.guilds.cache;
      return Array.from(guilds.values());
    } catch (error: any) {
      Logger.Error("Error fetching guilds:", error);
      return [];
    }
  }

  createPlayers() {
    for (const guild of this.GuildList!) {
      if (!this.players.has(guild)) {
        const player = new Player(guild);
        this.players.set(guild, player);
        Logger.LogMessage("Player created! for Guild:", guild.name);
      }
    }
  }

  clearCache() {
    const rest = new REST().setToken(config.Token!);

    const globalCommandsPromise = rest.put(
      Routes.applicationCommands(config.ClientID!),
      { body: [] }
    );

    const guildCommandsPromise = this.GuildList!.map((guild) => {
      return rest.put(
        Routes.applicationGuildCommands(config.ClientID!, guild.id),
        { body: [] }
      );
    });

    try {
      Promise.all([guildCommandsPromise, globalCommandsPromise]);
      Logger.LogMessage(
        "Successfully deleted all guild and application commands."
      );
    } catch (error: any) {
      Logger.Error(error);
    }
  }

  loadCommands() {
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
        } catch (err: any) {
          Logger.Error(`[WARNING] The command at ${filePath}`, err);
        }
      }
    }
  }

  deployCommands() {
    const rest = new REST().setToken(config.Token!);
    try {
      const commands = Array.from(this.commands.values()).map((command) =>
        command.data.toJSON()
      );

      Logger.LogMessage(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      for (const guild of this.GuildList!) {
        const data: any = rest.put(
          Routes.applicationGuildCommands(config.ClientID, guild.id),
          { body: commands }
        );
        Logger.LogMessage(
          `Successfully reloaded ${data.length} application (/) commands for guild ${guild.name}.`
        );
      }
    } catch (error: any) {
      Logger.Error("Error deploying commands:", error);
    }
  }
}

const bot = new Meneo();
export default bot;
