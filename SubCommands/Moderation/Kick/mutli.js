const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "multi",
    mainCmd: "kick",
    execute(interaction) {
        const members = interaction.options.getString("member");
        const reason = interaction.options.getString("reason") || "No reason Provided";
        const client = interaction.client;
        
        const membersID = [...members.matchAll(/@!?(\d+)>|(\d{18})/g)];

        let successfullKicks = 0;
        let unsuccessfullKicks = [];

        membersID.forEach( async (id, index) => {
            const member = await interaction.guild.members.fetch(id[1] || id[0]).catch( err => { if(!err.toString().includes("Unknown Member")) console.log(err) })
            if(member === undefined) { 
                unsuccessfullKicks.push(`ID: ${id[1] || id[0]}\nReason: Member not available in the server\n`);
                reply(index);
                return;
            }

            if(member.user.id === client.user.id) {
                unsuccessfullKicks.push(`User tag: ${client.user.tag}\n Reason: Can't Kick myslef. ;-;`)
                reply(index);
                return;
            }
            
            const kickInfo = require(`./kickMain`)(member, interaction);

            if(typeof kickInfo !== 'string') {
                kickInfo.then( () => {
                    successfullKicks += 1;
                    reply(index);
                }).catch( err => {
                    unsuccessfullKicks.push(`User tag: ${member.user?.tag ?? member.tag}\nReason: Internal Bot error\n`);
                    console.log(err);
                })
            } else if(typeof kickInfo === 'string') {
                unsuccessfullKicks.push(`User tag: ${member.user.tag}\nReason: ${kickInfo}\n`);
                reply(index);
            }

        })

        function reply(index) {
            if(index+1 !== membersID.length) return;

            if(successfullKicks >= 1) {
                const embed = new MessageEmbed()
                        .setTitle(`Multiple Member's Kicked from the server`)
                        .setDescription(`> **Issued By:** ${interaction.user}\n > **Reason:** ${reason}\n> **Successfull Kicks:** ${successfullKicks}\n> **Unsuccessfull Kicks:** ${unsuccessfullKicks.length}\n \n**Unsuccessfull kicks list:** (User ID) \`\`\`${unsuccessfullKicks.join('\n') || "NONE"}\`\`\` `)
                        .setColor('BLURPLE')
                        .setTimestamp();
                    
                interaction.reply({embeds: [embed], ephemeral: true});
            } else if(unsuccessfullKicks.length >= 1 ) {
                const embed = new MessageEmbed()
                        .setTitle(`No member's were kicked`)
                        .setDescription(`> **Issued By:** ${interaction.user}\n> **Unsuccessfull Kicks:** ${unsuccessfullKicks.length}\n \n**Unsuccessfull kick Member's list** \n\`\`\`${unsuccessfullKicks.join('\n')}\`\`\` `)
                        .setColor('BLUE')
                        .setTimestamp();

                interaction.reply({embeds: [embed], ephemeral:true})
            } else {
                interaction.reply({content: "Countered a internal error while executing the command. If the problem persist's try contacting Flame#5340", ephemeral: true})
            }

        }
    }
}