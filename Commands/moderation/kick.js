const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const kickMode = {
    normal: 'Normal Kick mode. Kicks the mentioned user from the server.',
    multi: 'Kick multiple mentioned member\'s from the server.',
    network: 'Kicks the mentioned user from multiple server which are in a network.', 
}

function command() {
    const modes = Object.keys(kickMode);
    const command = new SlashCommandBuilder()
                .setName('kick')
                .setDescription("Kicks one or more mentioned member from the server or network");
    
    const cmdOption = (option) => {
        option.setName("member")
        .setDescription("Mention the member to kick")
        .setRequired(true)
        return option;
    }

    modes.forEach( mode => {
        command.addSubcommand( cmd => {
            cmd.setName(`${mode}`)
            .setDescription(`${kickMode[mode]}`)

            if(mode === 'multi')
                cmd.addStringOption( option => cmdOption(option) );
            else
                cmd.addUserOption( option => cmdOption(option) );
            
            cmd.addStringOption( reason => {
                reason.setName("reason")
                .setDescription("Reason to kick the member.")
                if(mode === 'network')
                    reason.setRequired(true);
                return reason;
            })
            return cmd;
        })
    })
    return command;
}

module.exports = {
    data: command(),
        async execute(interaction) {
            const mode = interaction.options.getSubcommand();
            const client = interaction.client;
            
            if(!client.subCommands.has(mode)) return;
            const subCommand = client.subCommands.get(mode);
            if(subCommand.mainCmd !== interaction.commandName) return;
            subCommand.execute(interaction)
        }
}