import { ChatInputCommandInteraction, Collection, Message, InteractionResponse } from 'discord.js';
import { Manager } from 'moonlink.js';

export interface Command {
    data: {
        name: string;
        description: string;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<Message | InteractionResponse | void>;
}

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
        manager: Manager;
    }
} 