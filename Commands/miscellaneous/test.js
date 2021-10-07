const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require('axios').default;
const test = require(`../../struct/Utils/imageScanner`)

module.exports = {
    data: new SlashCommandBuilder()
            .setName('test')
            .setDescription("pleach no test"),
        async execute(interaction) {
            const collector = interaction.channel.createMessageCollector();

            collector.on('collect', async msg => {
                test(await msg);
                
            })
            collector.on('end', (collected, reason) => {
                console.log(collected)
                console.log(reason)
            })
        }
}