require('dotenv').config()
const { export_channels } = require('./config.json')

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const token = process.env.DISCORD_TOKEN;

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
    const channelsToExport = client.channels.cache.filter(channel => channel.isText() && export_channels.includes(channel.name))
    channelsToExport.map(channel => {
        channel.messages.fetch().then(messages => {
            console.log(messages)
        })
    })
});

// Login to Discord with your client's token
client.login(token);

