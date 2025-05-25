import { Manager, IConfigManager, IOptionsManager, TSearchSources, TPlayerLoop } from 'moonlink.js';
import { Client } from 'discord.js';

declare module 'discord.js' {
    export interface Client {
        manager: Manager;
    }
}

export interface MoonlinkNode {
    host: string;
    port: number;
    password: string;
    secure: boolean;
    identifier: string;
}

export interface SearchOptions {
    query: string;
    source?: TSearchSources;
    requester?: string;
}