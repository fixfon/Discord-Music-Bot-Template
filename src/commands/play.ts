import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { SearchOptions } from '../types/moonlink';
import { IPlayerConfig, Player } from 'moonlink.js';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song to play')
                .setRequired(true)),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('query', true);
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
            const playerConfig: IPlayerConfig = {
                guildId: interaction.guildId!,
                voiceChannelId: voiceChannel.id,
                textChannelId: interaction.channelId,
                autoPlay: false,
                volume: 80,
            };

            const player = interaction.client.manager.createPlayer(playerConfig);

            if (!player.connected) {
                console.log('Attempting to connect to voice channel...');
                try {
                    player.connect({ setMute: false, setDeaf: true });
                } catch (error) {
                    return interaction.editReply('Failed to connect to voice channel. Please check if the bot has the necessary permissions.');
                }
            }

            const searchOptions: SearchOptions = {
                query,
                requester: interaction.user.id,
            };

            const result = await interaction.client.manager.search(searchOptions);

            if (!result.tracks.length) {
                return interaction.editReply('No results found!');
            }

            const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Added to Queue')

            switch (result.loadType) {
                case 'playlist':
                  // For playlists, add all tracks to the queue
                  console.log('result', result.playlistInfo)
                  player.queue.add(result.tracks);
                  embed.setDescription(`${result.playlistInfo.name}`)
                  embed.addFields(
                    { name: 'Total Song Count', value: result.tracks.length.toString(), inline: true },
                    { name: 'Duration', value: `${Math.floor(result.playlistInfo.duration / 60000)}:${((result.playlistInfo.duration % 60000) / 1000).toFixed(0).padStart(2, '0')}`, inline: true },
                    { name: 'Requested by', value: interaction.user.toString(), inline: true }
                  );

                  // Start playback if not already playing
                  startPlaying(player);
                  break;
                  
                case 'search':
                case 'track':
                  // For single tracks, add just that track to the queue
                  player.queue.add(result.tracks[0]);
                  
                  embed.setDescription(`[${result.tracks[0].title}](${result.tracks[0].url})`)
                  embed.addFields(
                    { name: 'Duration', value: `${Math.floor(result.tracks[0].duration / 60000)}:${((result.tracks[0].duration % 60000) / 1000).toFixed(0).padStart(2, '0')}`, inline: true },
                    { name: 'Requested by', value: interaction.user.toString(), inline: true }
                  );

                  // Start playback if not already playing
                  startPlaying(player);
                  break;
                  
                case 'empty':
                  // No matches found
                  embed.setDescription('No matches found for your query!');
                  break;
                  
                case 'error':
                  // Error loading track
                  embed.setDescription(`Error loading track: ${result.error || 'Unknown error'}`);
                  break;
              }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error while trying to play the song!');
        }
    },
};

function startPlaying(player: Player) {
    if (player && !player.playing) return player.play();
    if (player && player.paused) return player.resume();
}

export default command; 