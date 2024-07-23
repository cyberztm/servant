const { readdirSync } = require('fs');
const path = require('path');
const { REST, Routes, ApplicationCommandType } = require('discord.js');
const loadChalk = require('../functions/loadChalk.js');

class CommandHandler {
  constructor() {
    this.commands = [];
    this.assocs = {};
  }

  async loadCommands(commandsPath) {
    const chalk = await loadChalk();
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.name && command.execute) {
          this.commands.push(command);
          this.assocs[command.name] = command.execute;
          console.log(chalk.green(`[V] Loaded command: ${command.name}`));
        } else {
          console.warn(chalk.yellow(`[!] The command at ${filePath} is missing a required "name" or "execute" property.`));
        }
      }
    }
  }

  async removeOutdatedCommands(rest, clientID, existingCommands, commandNames, type, guildId = null) {
    const chalk = await loadChalk();
    for (const cmd of existingCommands) {
      if (!commandNames.has(cmd.name)) {
        try {
          const route = guildId ? Routes.applicationGuildCommand(clientID, guildId, cmd.id) : Routes.applicationCommand(clientID, cmd.id);
          await rest.delete(route);
          console.log(chalk.red(`[!] Removed ${type} command${guildId ? ` for guild ID ${guildId}` : ''}: ${cmd.name}`));
        } catch (error) {
          console.error(chalk.red(`Error removing ${type} command ${cmd.name}${guildId ? ` for guild ID ${guildId}` : ''}:`), error);
        }
      }
    }
  }

  async initApplicationCommands(clientID, token, guilds = []) {
    const chalk = await loadChalk();
    const rest = new REST({ version: '10' }).setToken(token);

    let existingGlobalCommands = await rest.get(Routes.applicationCommands(clientID));
    existingGlobalCommands = existingGlobalCommands.map(cmd => ({ ...cmd, type: ApplicationCommandType.ChatInput }));

    const commandNames = new Set(this.commands.map(cmd => cmd.name));

    await this.removeOutdatedCommands(rest, clientID, existingGlobalCommands, commandNames, 'global');

    const globalCommands = this.commands.filter(cmd => !cmd.onlyGuild);
    if (globalCommands.length > 0) {
      await rest.put(Routes.applicationCommands(clientID), { body: globalCommands });
      console.log(chalk.blue('[V] Registered global commands:'));
      globalCommands.forEach(cmd => console.log(chalk.cyan(`  - ${cmd.name}`)));
    }

    const guildCommands = this.commands.filter(cmd => cmd.onlyGuild);

    for (const guildId of guilds) {
      console.log(`Registering commands for guild ID: ${guildId}`); 

      try {
        let existingGuildCommands = await rest.get(Routes.applicationGuildCommands(clientID, guildId));
        existingGuildCommands = existingGuildCommands.map(cmd => ({ ...cmd, type: ApplicationCommandType.ChatInput }));

        await this.removeOutdatedCommands(rest, clientID, existingGuildCommands, commandNames, 'guild', guildId);

        if (guildCommands.length > 0) {
          await rest.put(Routes.applicationGuildCommands(clientID, guildId), { body: guildCommands });
          console.log(chalk.blue(`[V] Registered guild commands for guild ID ${guildId}:`));
          guildCommands.forEach(cmd => console.log(chalk.cyan(`  - ${cmd.name}`)));
        } else {
          console.log(chalk.yellow(`No guild-specific commands to register for guild ID ${guildId}`));
        }
      } catch (error) {
        console.error(chalk.red(`Error retrieving or registering commands for guild ID ${guildId}:`), error);
      }
    }
  }

  async handleCommand(interaction) {
    const chalk = await loadChalk();
    const command = this.assocs[interaction.commandName];
    if (command) {
      try {
        await command(interaction);
      } catch (error) {
        console.error(chalk.red('Error executing command:'), error);
        const replyMethod = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
        await interaction[replyMethod]({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    } else {
      console.error(chalk.red(`No command matching ${interaction.commandName} was found.`));
    }
  }
}

module.exports = CommandHandler;
