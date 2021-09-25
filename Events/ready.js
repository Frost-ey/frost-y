const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

    const Client_ID = client.user.id;
    const Test_Guild_ID = process.env.Test_Guild;
    const rest = new REST({ version: '9'}).setToken(process.env.TOKEN);
    
    (async () => {
        try{
            if(Test_Guild_ID) {
                await rest.put(
                    Routes.applicationGuildCommands(Client_ID, Test_Guild_ID), {
                        body: client.cmdData
                    },
                );
                console.log(`All the commands have been loaded in test mode for ${client.user.tag}`);
            } else {
                await rest.put(
                    Routes.applicationCommands(Client_ID), {
                        body: client.cmdData
                    },
                );
                console.log(`All the commands have been loaded globally and ready to use for ${client.user.tag}`)
            }
        } catch (err) {
            console.log(err)
        }
    })();

    console.log(`${client.user.tag} is now online :)`);

    }
    

}