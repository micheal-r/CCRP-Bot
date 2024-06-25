const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      if (!args[0] || !args[0].startsWith('<@') || !args[0].endsWith('>')) {
        const emNM = new EmbedBuilder()
          .setTitle('Not enough arguments')
          .setDescription(`Make sure you use this command correctly. \n\`\`\`${prefix}kick @user reason\`\`\``);
        return message.reply({ embeds: [emNM] });
      }

      const usr = args[0];
      const userId = usr.replace(/[<@!>]/g, '');
      const member = await message.guild.members.fetch(userId);

      const rsn = args.slice(1).join(' ') || "No reason specified.";
      const reason = `${message.author.username}: ${rsn}`;
      const mod = message.author.id;

      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply({ content: 'You do not have permission to kick members.' });
      }

      if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && message.author.id !== message.guild.ownerId) {
        return message.reply({ content: 'You cannot kick this user because they have an equal or higher role than you.' });
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply({ content: 'I do not have permission to kick members.' });
      }

      if (userId === message.guild.ownerId) {
        return message.reply({ content: 'You cannot kick the server owner.' });
      }

      const result = await client.manager.kick(message, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /kick: Received an error response from Manager.kick");
        throw new Error("Error in /kick: Received an error response from Manager.kick");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User kicked")
        .setDescription(`I have kicked <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`);

      await message.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em2 = new EmbedBuilder()
        .setTitle("User kicked")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``);

      await modlogs.send({ embeds: [em2] });

    } catch (error) {
      client.logger.error('Error in kick command execution:', error);
      console.error(error);
      await message.reply({ content: 'There was an error trying to kick the user. Please try again later.' });
    }
  }
};
