/*
       Servant - NodeJS
       By: CyberZ
 */
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { loadCommands, initApplicationCommands, handleCommand } = require('./src/handlers/commandHandler');
const setupEvents = require('./src/handlers/eventHandler');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const { commands, assocs } = loadCommands(path.join(__dirname, 'src/commands'));
(async () => {
  try {
    await initApplicationCommands(process.env.ClientId, process.env.ClientToken, commands);
    console.log('[V] SlashCommands.');
  } catch (error) {
    console.error('Error registering application commands:', error);
  }
})();

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction, assocs);
  }
});

setupEvents(client);
client.login(process.env.ClientToken);
