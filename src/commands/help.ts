import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const commands = interaction.client.commands;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Available Commands')
            .setDescription('Here are all the available commands:')
            .setTimestamp();

        commands.forEach((cmd) => {
            embed.addFields({ name: `/${cmd.data.name}`, value: cmd.data.description });
        });

        await interaction.reply({ embeds: [embed] });
    },
};

export default command; 