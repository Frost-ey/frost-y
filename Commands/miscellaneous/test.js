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
                const emoName = msg.content;
                if(interaction.user.id !== msg.author.id) return;

                const emo = msg.guild.emojis.cache.find( emoji => emoji.name == msg.content );
                // console.log(emo)
                msg.channel.send(`Emoji id: \`${emo.id}\` `)
                
            })
            collector.on('end', (collected, reason) => {
                console.log(collected)
                console.log(reason)
            })
        }
}