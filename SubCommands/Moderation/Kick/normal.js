const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "normal",
    mainCmd: "kick",
    execute(interaction) {
        const member = interaction.options.getMember("member");
        const reason = interaction.options.getString("reason") || "No reason Provided";

        const kickInfo = require(`./kickMain`)(member, interaction);

        if(typeof kickInfo !== 'string') {
            kickInfo.then( () => {

                const embed = new MessageEmbed()
                        .setTitle(`${member.user?.tag ?? member.tag} has been kicked from the server`)
                        .setDescription(`>>> **Issued by:** ${interaction.user}\n**Reason:** ${reason}`)
                        .setColor('BLUE')
                        .setTimestamp();

                interaction.reply({embeds: [embed], ephemeral: true});
            }).catch( err => {
                interaction.reply({content: "There was a error executing that command. Try again", ephemeral: true});
                console.log(err);
            })
        } else if(typeof kickInfo === 'string') {
            interaction.reply({content: kickInfo, ephemeral: true});
        }
    }
}