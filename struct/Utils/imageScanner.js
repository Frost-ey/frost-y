const axios = require('axios').default;
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');

module.exports = async msg => {
    try {
        const match = await msg.attachments?.first() || msg.embeds[0] || msg.content.match(/(?:https|http):\/\/[a-zA-Z0-9.\/_]+?\.(?:png|gif|jpeg|jpg)/i) || null;
        let url = match?.thumbnail?.url || match?.url || match?.[0] || null;

        if(url === null) return "Url not Found";
        if(match?.type === "gifv" && !url.includes(".gif")) url = match?.url + '.gif';
        const pic = await axios.get(url, { responseType: 'arraybuffer'});
        
        if(!pic.headers['content-type'].includes("image")) return "invalid Url";
        const imgExtension = pic.headers['content-type'].split('/').pop().toLocaleLowerCase();
        const supportedExt = ['bmp', 'jpg', 'jpeg', 'png', 'gif'];
        if(!supportedExt.includes(imgExtension)) return "Unsupported File format";
        
        const predictions = {
            Neutral: 0,
            Drawing: 0,
            Sexy: 0,
            Porn: 0,
            Hentai: 0,
        }
        const model = await nsfw.load();
        if(imgExtension === "gif") {
            const prediction = await model.classifyGif(pic.data);
            
            prediction.forEach( frameArray => {
                frameArray.forEach( predictionClass => {
                    const className = predictionClass.className;
                    predictions[className] = predictions[className] + predictionClass.probability;
                })
            })
            const classNames = Object.keys(predictions);
            classNames.forEach( classes => {
                const probability = (predictions[classes] / prediction.length) * 100;
                predictions[classes] = Math.round(probability);
            })
        } else {
            const image = await tf.node.decodeImage(pic.data,3);
            const prediction = await model.classify(image);
            image.dispose();
            prediction.forEach( predictionClass => {
                predictions[predictionClass.className] = Math.round(predictionClass.probability * 100);
            })
        }
        const normalityRate = predictions.Neutral + predictions.Drawing;
        if(normalityRate < 60)
            return {imgUrl: url, isExplicit: true}
        else
            return {imgUrl: url, isExplicit: false}

    } catch (error) {
        msg.reply("Countered a internal error while executing that command. The error was either originated from the bot itself or from the Discord API. If the problem persists try contacting `Flame#5340` ")
        console.log(error);
    }
}