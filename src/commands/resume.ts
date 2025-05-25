import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the current song'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        const voiceChannel = member?.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: 'You need to be in a voice channel to use this command!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const player = interaction.client.manager.players.get(interaction.guildId!);

            if (!player) {
                return interaction.editReply('There is no music playing!');
            }

            if (!player.paused) {
                return interaction.editReply('The music is already playing!');
            }

            player.resume();

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Resumed')
                .setDescription('▶️ Resumed the current song')
                .addFields(
                    { name: 'Requested by', value: interaction.user.toString(), inline: true }
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error while trying to resume the song!');
        }
    },
};

export default command; 