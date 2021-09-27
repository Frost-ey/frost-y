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
            const reason = interaction.options.getString("reason") || "No reason Provided";
            const client = interaction.client;
        
            function kick(member) {
                if(member === null || member === undefined) {
                    return "User not available in the server";
                }
        
                if(member.user.id === client.user.id) {
                    return `[Error 101!](<https://www.youtube.com/watch?v=dQw4w9WgXcQ>). ${client.user} encountered a fatal error. Check the link for the full log.`;
                }
        
                const authorRole = interaction.member.roles.highest.position;
                const memeberRole = member.roles.highest.position;
                const botRole = interaction.guild.me.roles.highest.position;
        
                if(memeberRole >= authorRole || memeberRole >= botRole) {
                    return `${member.user.tag} has role higher inorder than you or me.`;
                }
        
                if(!member.kickable) {
                    return `Cant kick ${member.user.tag}`;
                }
        
                return member.kick(reason);
            }
        
            if( mode == "normal") {
                const member = interaction.options.getMember("member");
                
                const kickInfo = kick(member);
        
                if(typeof kickInfo !== 'string') {
                    kickInfo.then( () => {
        
                        const embed = new MessageEmbed()
                                .setTitle(`${member.user?.tag ?? member.tag} has been kicked from the server`)
                                .setDescription(`>>> **Issued by:** ${interaction.user}\n**Reason:**${reason}`)
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
            
            //Multi kick mode codee's
            else if ( mode == "multi") {
        
                const members = interaction.options.getString("member");
        
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
                    
                    const kickInfo = kick(member);

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
                                .setDescription(`> **Issued By: ${interaction.user}\n> **Unsuccessfull Kicks:** ${unsuccessfullKicks.length}\n \n**Unsuccessfull kick Member's list** \n\`\`\`${unsuccessfullKicks.join('\n')}\`\`\` `)
                                .setColor('BLUE')
                                .setTimestamp();

                        interaction.reply({embeds: [embed], ephemeral:true})
                    } else {
                        interaction.reply({content: "Countered a internal error while executing the command. If the problem persist's try contacting Flame#5340", ephemeral: true})
                    }

                }
            } 

            //Network kick mode
            else if(mode === "network") {
                
            }
        }
}