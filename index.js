require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

[ 'ClientDB', 'commandHandler', 'eventHandler' ].forEach( handlers => require(`./Handlers/${handlers}`)(client))

client.login(process.env.TOKEN);