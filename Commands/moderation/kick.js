const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { User } = require('discord.js');

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
            const reason = interaction.options.getString("reason");
            const client = interaction.client;

            function kick(member) {

                if(member === null){
                    let error = 'Cant find the mentioned member. Double check that the member you want to kick is in the server.';
                    return { kicked:false, error}
                }

                if(member.user.id === client.user.id){
                    let error = `[Error 101](<https://www.youtube.com/watch?v=dQw4w9WgXcQ>), Countered a fatal error. Check the link for the whole error log -.-`;
                    return { kicked:false, error}
                }

                const authorRole = interaction.member.roles.highest.position;
                const memberRole = member.roles.highest.position;
                const botRole = interaction.guild.me.roles.highest.position;

                if(memberRole >= authorRole) {
                    let error = `Can't kick ${member.user}. Make sure that your role is higher than that of the member you want to kick.`;
                    return { kicked:false, error}
                }

                if(memberRole >= botRole) {
                    let error = `Can't Kick ${member.user}. Make sure that my role is higher in order than the member you want to kick.`;
                    return { kicked:false, error}
                }
            
                if(!member.kickable){
                    let error = `Cant kick ${member.user}`;
                    return { kicked:false, error}
                }
            
                return member.kick(reason).then( () => {
                    
                    return true;
                }).catch( err => {
                    interaction.reply({content: "Countered an error while executing the command. Please try again", ephemeral: true});
                    console.log(err);
                    return;
                })
            }
            
            if(mode === "normal") {
                const member = interaction.options.getMember("member");

                const kickInfo = kick(member);

                if(typeof kickInfo.kicked !== 'boolean') {
                    kickInfo.then( result => {

                        if(result === true) {
                            
                            const embed = new MessageEmbed()
                                .setDescription(`${member.user?.tag ?? member.tag} has been succesfully kicked from the server \n > **Issued by:** ${interaction.user.tag} \n > **Reason:** ${reason || "No reason specified"}`)
                                .setColor('NAVY')
                                .setTimestamp();

                            interaction.reply({embeds: [embed]})
                            setTimeout(() => { interaction.deleteReply() }, 10*1000);
                        }
                    })
                } else if(kickInfo.kicked === false)
                    interaction.reply({content: kickInfo.error, ephemeral: true});
                else
                    return;

            } else if( mode === 'multi') {
                const members = interaction.options.getString('member');

                const membersID = [...members.matchAll(/@!?(\d+)>|(\d{18})/g)];

                let succesfullKicks = 0;
                let unsuccessfullKicks = [];
                let userID;

                membersID.forEach( (id, index) => {
                    if( id[1] === undefined)
                        userID = id[0];
                    else
                        userID = id[1];

                    interaction.guild.members.fetch(userID).then( async member => {

                    const kickInfo = kick(member);
                    let result;

                    if(typeof kickInfo !== 'boolean')
                        result = await kickInfo;
                    else
                        result = kickInfo.kicked;

                    if(result)
                        succesfullKicks += 1;
                    else
                        unsuccessfullKicks.push(member?.user.tag);

                    if( index+1 >= membersID.length)
                        reply();

                    }).catch( err => {
                        let error = err.toString().substr(17);
                        unsuccessfullKicks.push(`${error}(ID provided: ${id})`);
                        console.log(err);
                        console.log(error)
                    })

                })

               function reply() {
                if(succesfullKicks >= 1) {
                    const embed = new MessageEmbed()
                            .setDescription(`Succesfully kicked multiple members: \n > **Successfull kicks:** ${succesfullKicks} \n > **Unsuccessfull kicks:** ${unsuccessfullKicks.length} \n \t**__Unsuccesfull kick list__** \`\`\`${unsuccessfullKicks.join('\t') || "None"} \`\`\` `)
                            .setColor('AQUA')
                            .setTimestamp();

                    interaction.reply({embeds: [embed], ephemeral: true})
                    } else if(unsuccessfullKicks.length >= 1) {
                        // will add more code in the future to send a embed informing the user about unsuccessfull kicks.
                    }
               }
            }
            
        }
}