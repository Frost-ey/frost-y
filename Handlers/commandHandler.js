const fs = require('fs');

module.exports = (client) => {
    const commandFiles = fs.readdirSync('./Commands').filter( file => file.endsWith('.js'));
    const commands = [];

    commandFiles.forEach( files => {

        const command = require(`../Commands/${files}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    })

    client.commands.set('Command Data', commands);
}