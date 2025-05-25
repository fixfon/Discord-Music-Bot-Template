import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.client.manager.players.get(interaction.guildId!);

        if (!player) {
            return interaction.reply({
                content: 'There is no music playing!',
                ephemeral: true
            });
        }

        if (player.paused) {
            return interaction.reply({
                content: 'The music is already paused!',
                ephemeral: true
            });
        }

        player.pause();
        await interaction.reply('⏸️ Music paused!');
    },
};

export default command; 