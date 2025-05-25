import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

const commands: SlashCommandBuilder[] = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

// Load all commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default;
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

// Deploy commands
export async function deployCommands() {
    try {
        console.log(`[DEPLOY] Starting deployment of ${commands.length} application (/) commands...`);

        // The put method is used to fully refresh all commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands },
        );

        console.log(`[DEPLOY] Successfully deployed ${(data as any[]).length} application (/) commands.`);
        console.log('[DEPLOY] Commands will be available in a few minutes.');
    } catch (error) {
        console.error('[DEPLOY] Error deploying commands:', error);
        throw error; // Re-throw to handle it in the calling code
    }
} 