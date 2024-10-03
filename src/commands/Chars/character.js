const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('View character info!')
		.addStringOption(option =>
			option.setName('char')
				.setDescription('The character name')
				.setRequired(true)
				),
	async execute(interaction) {
		const character = interaction.options.getString('char');
    interaction.reply(`A ${character} choice!`);
	},
};
