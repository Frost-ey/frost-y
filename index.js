require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

[ 'commandHandler', 'eventHandler' ].forEach( handlers => { const handler = require(`./Handlers/${handlers}`)(client) })

client.login(process.env.TOKEN);