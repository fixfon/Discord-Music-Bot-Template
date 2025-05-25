import { Client, GatewayIntentBits, Collection, Partials, TextChannel } from 'discord.js';
import { Manager } from 'moonlink.js';
import { config } from 'dotenv';
import { deployCommands } from './utils/deployCommands';
import { Command } from './types';

// Load environment variables
config();

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User
    ]
});

// Initialize Moonlink manager
const manager = new Manager({
    nodes: [
        {
            identifier: 'AlfredBot',
            host: process.env.LAVALINK_HOST || 'localhost',
            port: Number(process.env.LAVALINK_PORT) || 2333,
            password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
            secure: process.env.LAVALINK_SECURE === 'true'
        }
    ],
    options: {
        defaultPlatformSearch: 'youtube',
        sortTypeNode: 'players',
        plugins: [
            {
                name: 'youtube',
                version: '1.13.2',
                load: (manager: any) => {
                    console.log('Youtube plugin loaded');
                },
                unload: (manager: any) => {
                    console.log('Youtube plugin unloaded');
                }
            }
        ],
    },
    sendPayload: (guildId: string, payload: any) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(JSON.parse(payload));
    }
});

// Add manager to client
client.manager = manager;

// Initialize commands collection
client.commands = new Collection<string, Command>();

// Load commands
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default;
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Event handlers
client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    
    // Initialize Moonlink manager
    if (client.user) {
        await manager.init(client.user.id);
    } else {
        console.error('Failed to initialize Moonlink manager: client.user is null');
        return;
    }
    
    // Deploy commands when the bot starts up
    await deployCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Add raw packet handler for voice
client.on('raw', (packet) => {
    client.manager.packetUpdate(packet);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const player = client.manager.players.get(oldState.guild.id);
    if (!player) return;

    const voiceChannel = oldState.guild.members.me?.voice.channel;
    if (!voiceChannel) return;

    if (voiceChannel.members.size === 1 && voiceChannel.members.has(client.user!.id)) {
        // Set a timeout to destroy the player if still alone after 30 seconds
        setTimeout(() => {
            const currentChannel = oldState.guild.members.me?.voice.channel;
            if (currentChannel && currentChannel.members.size === 1 && currentChannel.members.has(client.user!.id)) {
                if(player) player.destroy();
                
                const textChannel = client.channels.cache.get(player.textChannelId);
                if (textChannel instanceof TextChannel) {
                    textChannel.send('Left voice channel due to inactivity.');
                }
            }
        }, 30000);
    }
});

// Moonlink event handlers
client.manager.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel instanceof TextChannel) {
        channel.send(`Started playing ${track.title}`)
    }
});

// client.manager.on('trackEnd', (player, track) => {
//     const channel = client.channels.cache.get(player.textChannelId);
//     if (channel instanceof TextChannel) {
//         channel.send(`Finished playing ${track.title}`)
//     }
// });

client.manager.on('queueEnd', (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel instanceof TextChannel) {
        channel.send('Queue ended. Disconnecting in 30 seconds if no new tracks are added.');
        
        // Disconnect after a delay if no new tracks are added
        setTimeout(() => {
            if (player && !player.playing && player.queue.size === 0) {
                player.destroy();
                if (channel) {
                    channel.send('Disconnected due to inactivity.');
                }
            }
        }, 30000); // 30 seconds
    }
});

client.manager.on('playerMoved', (player) => {
    if(player.connected && player.queue.size > 0 && player.paused) player.resume()
})

client.manager.on('playerDisconnected', (player) => {
    if(player) player.destroy();
})

client.manager.on('nodeConnected', (node) => {
    console.log(`Node ${node.identifier} connected!`);
});

client.manager.on('nodeError', (node, error) => {
    console.error(`Node ${node.identifier} error:`, error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN); 