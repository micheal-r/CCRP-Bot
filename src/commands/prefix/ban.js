const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      if (!args[0] || !args[0].startsWith('<@') || !args[0].endsWith('>')) {
        const emNM = new EmbedBuilder()
          .setTitle('Not enough arguments')
          .setDescription(`Make sure you use this command correctly. \n\`\`\`${prefix}ban @user reason\`\`\``);
        return message.reply({ embeds: [emNM] });
      }

      const usr = args[0];
      const userId = usr.replace(/[<@!>]/g, ''); // Extract the user ID from the mention
      const member = await message.guild.members.fetch(userId);

      const rsn = args.slice(1).join(' ') || "No reason specified.";
      const reason = `${message.author.username}: ${rsn}`;
      const mod = message.author.id;

      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply({ content: 'You do not have permission to ban members.' });
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply({ content: 'I do not have permission to ban members.' });
      }

      if (userId === message.guild.ownerId) {
        return message.reply({ content: 'You cannot ban the server owner.' });
      }

      if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && message.author.id !== message.guild.ownerId) {
        return message.reply({ content: 'You cannot ban this user because they have an equal or higher role than you.' });
      }

      const result = await client.manager.ban(message, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /ban: Received an error response from Manager.ban");
        throw new Error("Error in /ban: Received an error response from Manager.ban");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User banned")
        .setDescription(`I have banned <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`);

      await message.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em2 = new EmbedBuilder()
        .setTitle("User banned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``);

      await modlogs.send({ embeds: [em2] });

    } catch (error) {
      client.logger.error('Error in ban command execution:', error);
      console.error(error);
      await message.reply({ content: 'There was an error trying to ban the user. Please try again later.' });
    }
  }
};
