const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageCollector } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('test')
            .setDescription("Test of the cmd"),
            async execute(interaction) {

                const client = interaction.client;
                interaction.reply({content: "TEST", ephemeral: true})
                const filter = m => {
                    console.log(m)
                    return true;
                }
                const collector = interaction.channel.createMessageCollector({filter, time: 30000})

                collector.on('collect', m => {
                    console.log("Collected data: ",m);
                })

                collector.on('end', m => {
                    console.log('collector ended: ',m);
                })
            }
}