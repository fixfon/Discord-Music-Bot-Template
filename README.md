# Discord Bot with TypeScript

A Discord bot boilerplate built with TypeScript and Discord.js v14.

## Features

- TypeScript support
- Command handler
- Example commands (ping, help)
- Environment variable configuration
- Type safety

## Prerequisites

- Node.js 16.9.0 or higher
- npm (comes with Node.js)
- A Discord bot token (get it from [Discord Developer Portal](https://discord.com/developers/applications))

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the bot:
   ```bash
   npm start
   ```

## Development

- Run in development mode:
  ```bash
  npm run dev
  ```
- Watch for changes:
  ```bash
  npm run watch
  ```

## Adding New Commands

1. Create a new file in the `src/commands` directory
2. Follow the command structure in the example commands
3. The command will be automatically loaded when the bot starts

## License

ISC 