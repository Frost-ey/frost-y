const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = (client) => {

    client.commands = new Collection();
    client.subCommands = new Collection();
    client.miniCommands = new Collection();
    
    //Function that reads the provided dir and returns all the file inside a dir.
    function getFiles(dir, files_) {
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()){
                getFiles(name, files_);
            } else {
                files_.push(`.${name}`);
            }
        }
        return files_;
    }

    // For command files
    const commandFiles = getFiles('./Commands'); //Getting all the files inside the Commands dir
    const commands = [];
    commandFiles.forEach( file => {
        const commandFile = file.split('.').pop() === 'js';
        if(!commandFile) return;
        const command = require(file);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command); 
    })
    client.cmdData = commands;

    //Sub command files
    const subCommandFiles = getFiles('./SubCommands');
    subCommandFiles.forEach( file => {
        const commandFile = file.split('.').pop() === 'js';
        if(!commandFile) return;
        const command = require(file);
        if(!command.name) return;
        client.subCommands.set(command.name, command);
    })

    // Mini command files
    const miniCommandFiles = getFiles('./miniCommands');
    miniCommandFiles.forEach( file => {
        const commandFile = file.split('.').pop() === 'js';
        if(!commandFile) return;
        const command = require(file);
        client.miniCommands.set(command.name, command)
    })

}