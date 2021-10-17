const Filter = require('bad-words');
const { MessageEmbed } = require('discord.js');
const isExplicit = require(`../../../struct/Utils/imageScanner`);
const config = require(`../../../config`);
const checker = new Filter();

module.exports = {
    name: "create",
    mainCmd: "network",
    async execute(interaction) {
        await interaction.reply({embeds: embed({ desc: `What should your server network be called? Remember, choose a flashy name that stands out`}), fetchReply: true});
        const client = interaction.client;
        const ClientDB = client.db;
        
        const creationData = new Object();
        let type = "Network Name";
        const filter = msg => msg.author.id === interaction.user.id;
        const collector = await interaction.channel.createMessageCollector({filter, time: 120*1000});
        let received = 0;
        
        collector.on('collect', async msg => {

            if(type === "Network Name"){
                const result = check(msg, 3, 20);
                if(result) return;
                type = "Network Description";
                creationData.name = msg.content;
                msg.reply({embeds : embed({desc: `Network name set to ${msg.content}. Write a short description describing what this network is for?`}) })
                return;

            } else if(type === "Network Description") {
                const result = check(msg, 20 , 500);
                if(result) return;
                creationData.desc = msg.content;
                type = "Network Icon";
                msg.reply({embeds: embed({ desc: `Network description has been successfully set. Upload a network icon(gif or image) or send skip to add a default icon.`}) })
                return;

            } else if(type === "Network Icon"){
                received += 1;
                if(received >= 6) {
                    collector.stop("processedLimit");
                    return;
                }
                creationData.info = {
                    mainGuildID : msg.guild.id,
                    creatorID : msg.author.id,
                    networkGuilds : [msg.guild.id],
                    exceptionGuilds : [],
                    createdAt : Math.round(Date.now() / 1000),
                }
                if(msg.content.toLowerCase() === "skip") {
                    creationData.icon = `https://cdn.discordapp.com/attachments/881125362459869185/896397014051463168/unknown.png`;
                    collector.stop("completed");
                    return;
                }
                if(!(msg.attachments.size >= 1 || msg.embeds.length >= 1 || msg.stickers.size >= 1)) return;
                const reaction = await msg.react(config.emojis.checking);
                const result = await isExplicit(await msg);
                reaction.remove();
                if(typeof result === 'string') return;
                if(result.isExplicit) {
                    msg.reply({embeds: embed({ desc: `The provided image has been deemed as an explicit(inappropriate) image/gif and cannot be saved as your network icon. Please send a sfw image/gif.`}) });
                    msg.react(config.emojis.rejected)
                    received += 1;
                    return;
                }
                msg.react(config.emojis.success);
                creationData.icon = result.imgUrl;
                collector.stop("completed");
                received = 0;

            }
        })
        
        collector.on('end', async (collected, reason) => {

            if(reason === "completed"){
                const result = await ClientDB.db('BotData').collection("Server Networks").insertOne(creationData);
                if(result.acknowledged != true) {
                    console.log(result);
                    interaction.followUp({embeds: embed({desc: "Countered a internal error while executing that command. Please try again or if the problem persists try contacting `Flame#5340`", color: 'RED'}) , ephemeral: true});
                    return;
                }
                const success = {
                    title: "New Network Created",
                    desc: "You have successfully created a new server network. To view or manage the network use the command `network view` to get the detailed view of the network.You can also manage other network related options there.",
                    color: 'GREEN',
                }
                interaction.followUp({embeds: embed(success) })
                return;
            }
            if(reason === "processedLimit")
                interaction.followUp({embed: embed({desc: "Too many incorrect attempts. Try again and be sure to follow the instruction.", color: 'RED'}) });
            else if(reason === "time")
                interaction.followUp({embed: embed({desc: "Time out. The interaction took too much time. Please try again", color: 'RED'}) });
            else {
                interaction.followUp({content: "Countered a internal bot error. Please try again"});
                console.log(reason);
            }
        })

        function check(msg, minLength, maxLength) {
            if(received >= 6 ){
                collector.stop("processedLimit");
                return true;
            }

            if(msg.attachments.size >= 1 || msg.embeds.length >= 1 || msg.stickers.size >= 1) return true;
            received += 1;
            const embedObj = {
                title: `${type} not allowed`,
                color: 'RED'
            }
            if(checker.isProfane(msg.content)) {
                embedObj.desc= `Can't set the ${type}. The provided message contents inappropirate words and cant be set as ${type}. Try again`;
            }else if(msg.content.length < minLength || msg.content.length > maxLength ) {
                embedObj.desc = `Can't set the ${type}. Invalid message length. Make sure that the minimum length is ${minLength} and maximum length is ${maxLength}. Try again`;
            } else {
                received = 0;
                collector.resetTimer();
                return false;
            }
            interaction.reply({embeds: embed(embedObj) });
        }

        function embed(embedObj) {
            const embed = new MessageEmbed()
                    .setTitle(embedObj?.title || ` `)
                    .setDescription(embedObj?.desc || ` `)
                    .setColor(embedObj?.color || 'RANDOM')
                    .setTimestamp();
            return [embed];
        }
    }
}