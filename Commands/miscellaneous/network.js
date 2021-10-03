const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('network')
            .setDescription("Join or Create a new network for your server.Help subcommand for more info."),
            async execute(interaction) {
                
                const mode = interaction.options.getSubcommand();
                const client = interaction.client;

                if(mode === "create") {
                    await interaction.reply({content:"What should your server network be called. Be sure to pick a name that stands out!", fetchReply: true});
                    
                }
            }
}