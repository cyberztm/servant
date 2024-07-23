const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const CommandHandler = require('../handlers/commandHandler');
const EventHandler = require('../handlers/eventHandler');
require('dotenv').config();

class Servant {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    this.client.commands = new Collection();
    this.commandHandler = new CommandHandler();
  }

  async initialize({ commandsPath, eventsPath, guildIds = [] }) {
    if (!fs.existsSync(commandsPath)) {
      throw new Error(`The commands directory does not exist: ${commandsPath}`);
    }

    if (!fs.existsSync(eventsPath)) {
      throw new Error(`The events directory does not exist: ${eventsPath}`);
    }

    await this.commandHandler.loadCommands(commandsPath);
    await this.registerCommands(guildIds);
    this.setupEvents(eventsPath);
    await this.client.login(process.env.ClientToken);
  }

  async registerCommands(guildIds) {
    try {
      const guildIdArray = Array.isArray(guildIds) ? guildIds.map(id => id.toString()) : [];
      await this.commandHandler.initApplicationCommands(process.env.ClientId, process.env.ClientToken, guildIdArray);
    } catch (error) {
      console.error('Error registering application commands:', error);
    }
  }

  setupEvents(eventsPath) {
    new EventHandler(this.client, eventsPath);

    this.client.on(Events.InteractionCreate, async interaction => {
      if (interaction.isChatInputCommand()) {
        await this.commandHandler.handleCommand(interaction);
      }
    });
  }

  async run({ token, paths, guilds = { ids: [] } }) {
    if (!token || !paths) {
      throw new Error('Missing required parameters: token and paths.');
    }

    process.env.ClientToken = token;
    await this.initialize({
      commandsPath: paths.commands.path,
      eventsPath: paths.events.path,
      guildIds: guilds.ids || []
    });
  }
}

module.exports = Servant;