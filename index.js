require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
// const { MongoClient } = require('mongodb');
//Will add a database later on

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

[ 'commandHandler', 'eventHandler' ].forEach( handlers => { const handler = require(`./Handlers/${handlers}`)(client) })

client.login(process.env.TOKEN);