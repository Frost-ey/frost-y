const Filter = require('bad-words');
const { MessageEmbed } = require('discord.js');
const isExplicit = require(`../../../struct/Utils/imageScanner`);
const checker = new Filter();

//Some stuff left to do. will add stuff later on

module.exports = {
    name: "create",
    mainCmd: "network",
    async execute(interaction) {
        await interaction.reply({content: "What should your server network be called? Remember, choose a flashy name that stands out", fetchReply: true});
        
        
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
                msg.reply(`Network name set to ${msg.content}. Write a short description describing what this network is for?`)
                return;

            } else if(type === "Network Description") {
                const result = check(msg, 10 , 60);
                if(result) return;
                creationData.description = msg.content;
                type = "Network Icon";
                msg.reply(`Network description has been successfully set. Upload a network icon(gif or image) or send skip to add a default icon.`)
                return;

            } else if(type === "Network Icon"){
                if(received >= 6) {
                    collector.stop("processedLimit")
                    return;
                }
                if(msg.content.toLowerCase() === "skip") {
                    creationData.content = ``;
                    collector.stop("end");
                    return;
                }
                const result = await isExplicit(await msg);
                if(typeof result === 'string') return;
                if(result) {
                    msg.reply("The provided image has been deemed as explicit(inappropriate) image and cannot be saved as your network icon. Please send a nsfw image/gif.");
                    received += 1;
                    return;
                }
                msg.reply("The provided image has been uploaded as your new image. Please bear in mind that deleting the image from the hosted service will also delete it from the network");
                received = 0;

            }
        })
        
        collector.on('end', ( collected, reason) => {
            console.log(collected, reason)
            if(reason === "processedLimit")
                interaction.followUp({content: "Too many incorrect attempts. Try again and be sure to follow the instruction."});
            else if(reason === "time")
                interaction.followUp({content: "Time out. The interaction took too much time. Please try again"})
            else if(reason !== "end")
                interaction.followUp({content: "Countered a internal bot error. Please try again"})
        })

        function check(msg, minLength, maxLength) {
            received += 1;
            if(received >= 6 ){
                collector.stop("processedLimit");
                return true;
            }

            if(msg.attachments.size >= 1 || msg.embeds.length >= 1 || msg.stickers.size >= 1) return true;
            if(checker.isProfane(msg.content) || msg.content.length < minLength || msg.content.length > maxLength ) {
                const embed = new MessageEmbed()
                        .setTitle(`${type} not allowed`)
                        .setDescription(`Cant set the ${type} as ${msg.content}. Make sure that the ${type} your provide meets the following requirements:\n >>> 1) Is not a curse or bad word 2) Length is greater than or equal to \`${minLength}\` and less than or equal to \`${maxLength}\``)
                        .setColor('RED')
                        .setTimestamp();
                msg.reply({embeds : [embed] });
                return true;
            } else {
                received = 0;
                return false;
            }
        }
    }
}