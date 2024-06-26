const { PermissionsBitField, PermissionOverwrites, ChannelType } = require("discord.js");

module.exports = async (client) => {
    const modMailCategoryID = '1255227154246008924'; // Replace with your Modmail category ID
    const modMailLogChannelID = '1255529579519541330'; // Replace with your Modmail log channel ID

    client.on('messageCreate', async (message) => {
        if (message.content === '.close') {
            let uid;
            if (message.channel.parentId === '1255227154246008924') {
                const uid = message.channel.topic;
                message.channel.delete();
                const usr = client.users.fetch(uid);
                return usr.send('Your modmail thread has been closed.');
            } else {
                return message.reply('This channel is not a modmail channel.');
            }
        }

        if (message.author.bot) return;

        // If the message is a direct message to the bot
        if (message.guild === null) {
            const guild = client.guilds.cache.first();
            if (!guild) return;

            // Check if there's already a thread for this user
            let modmailChannel = guild.channels.cache.find(channel => channel.topic === message.author.id);
            
            if (!modmailChannel) {
                // Create a new channel for the user in the modmail category
                modmailChannel = await guild.channels.create({
                    name: `modmail-${message.author.username}`,
                    type: ChannelType.GuildText,
                    topic: message.author.id,
                    parent: modMailCategoryID,
                });

                // Log the creation of a new modmail thread
                const logChannel = guild.channels.cache.get(modMailLogChannelID);
                if (logChannel) {
                    logChannel.send(`Created a new modmail thread for ${message.author.tag}`);
                }
            }

            // Forward the user's message to the modmail channel
            const embed = {
                color: 0x0099ff,
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL({ dynamic: true }),
                },
                description: message.content,
                timestamp: new Date(),
            };

            modmailChannel.send({ embeds: [embed] });

            // Optionally, acknowledge receipt of the modmail
            message.author.send('Your message has been received by the moderation team.');
        }

        // If the message is in a modmail channel
        if (message.guild && message.channel.parentId === modMailCategoryID) {
            const user = await client.users.fetch(message.channel.topic);
            if (user) {
                // Forward the mod's message to the user
                user.send(`**${message.author.tag}**: ${message.content}`);
            }
        }
    });
};
