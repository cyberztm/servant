const { ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Reply with pong",
  type: ApplicationCommandType.ChatInput,
  async execute(interaction) {
    interaction.reply({ ephemeral: true, content: "Pong" });
  }
};

