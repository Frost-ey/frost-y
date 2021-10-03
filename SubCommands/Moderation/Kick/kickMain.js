module.exports = (member, interaction) => {
    const client = interaction.client;
    const reason = interaction.options.getString("reason") || "No reason Provided";
    
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