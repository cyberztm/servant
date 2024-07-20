const { readdirSync } = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const loadCommands = (commandsPath) => {
  const commands = [];
  const assocs = {};

  const commandFolders = readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        assocs[command.data.name] = command.execute;
      } else {
        console.warn(`[!] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  return { commands, assocs };
};

const initApplicationCommands = async (clientID, token, commands) => {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientID), { body: commands });
};

const handleCommand = async (interaction, assocs) => {
  const command = assocs[interaction.commandName];
  if (command) {
    try {
      await command(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  } else {
    console.error(`No command matching ${interaction.commandName} was found.`);
  }
};

module.exports = { loadCommands, initApplicationCommands, handleCommand };
