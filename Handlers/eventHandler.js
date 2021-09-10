const fs = require('fs');

module.exports = (client) => {
    const eventFiles = fs.readdirSync('./Events').filter( file => file.endsWith('.js'));
    
    eventFiles.forEach( file => {
        
        const event = require(`../Events/${file}`);
        if(!event.name) return;
        
        if(event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    })
}