import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.client.manager.players.get(interaction.guildId!);

        if (!player) {
            return interaction.reply({
                content: 'There is no music playing!',
                ephemeral: true
            });
        }

        if (player.queue.isEmpty) {
            return interaction.reply({
                content: 'There are no more songs in the queue!',
                ephemeral: true
            });
        }

        await player.skip();
        await interaction.reply('⏭️ Skipped to the next song!');
    },
};

export default command; 