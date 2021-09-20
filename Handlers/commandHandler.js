const fs = require('fs');

module.exports = (client) => {
    const cmdFilesDir = fs.readdirSync('./Commands', { withFileTypes: true }).filter( dir => dir.isDirectory()).map(dir => dir.name);
    const commands = [];

    cmdFilesDir.forEach( commandDir => {
        const commandFiles = fs.readdirSync(`./Commands/${commandDir}`).filter( file => file.endsWith('.js'));
        
        commandFiles.forEach( files => {
            const command = require(`../Commands/${commandDir}/${files}`);
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        })
    })

    client.commands.set('Command Data', commands);
}