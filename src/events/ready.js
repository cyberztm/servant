const { Events } = require('discord.js');
const loadChalk = require("../functions/loadChalk.js")

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const chalk = await loadChalk();
    console.log(chalk.blue.bold(`[V] Client ready as ${client.user.displayName}`));
  },
};
