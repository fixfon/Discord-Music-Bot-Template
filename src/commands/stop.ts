import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current song and clear the queue'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.client.manager.players.get(interaction.guildId!);

        if (!player) {
            return interaction.reply({
                content: 'There is no music playing!',
                ephemeral: true
            });
        }

        player.destroy();
        await interaction.reply('⏹️ Music stopped and queue cleared!');
    },
};

export default command; 