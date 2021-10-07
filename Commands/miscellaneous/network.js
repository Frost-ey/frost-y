const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('network')
            .setDescription("Join or Create a new network for your server.Help subcommand for more info.")
            .addSubcommand( cmd => {
                cmd.setName("create")
                .setDescription("Create's a new server network.")
                return cmd;
            }),
            async execute(interaction) {
                
                const mode = interaction.options.getSubcommand();
                const client = interaction.client;

                if(!client.subCommands.has(mode)) return;
                const subCommand = client.subCommands.get(mode);
                if(subCommand.mainCmd !== interaction.commandName) return;
                subCommand.execute(interaction)
            }
}