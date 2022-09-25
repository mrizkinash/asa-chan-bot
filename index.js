require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
	],
});

client.commands = new Collection();
client.events = new Collection();

const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
const handlerNames = handlerFiles.map(file => file.split('.')[0]);

handlerNames.forEach(handler => {
	const filePath = path.join(handlersPath, handler);
	require(filePath)(client);
});

client.login(process.env.BOT_TOKEN);