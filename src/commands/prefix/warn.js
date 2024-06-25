const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'warn',
  description: 'Warn a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      if (!args[0] || !args[0].startsWith('<@') || !args[0].endsWith('>')) {
        const emNM = new EmbedBuilder()
          .setTitle('Not enough arguments')
          .setDescription(`Make sure you use this command correctly. \n\`\`\`${prefix}warn @user reason\`\`\``);
        return message.reply({ embeds: [emNM] });
      }

      const usr = args[0];
      const userId = usr.replace(/[<@!>]/g, '');
      const member = await message.guild.members.fetch(userId);

      const reason = args.slice(1).join(' ') || "No reason specified.";
      const fullReason = `${message.author.username}: ${reason}`;
      const mod = message.author.id;

      if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply({ content: 'You do not have permission to warn members.' });
      }

      if (userId === message.guild.ownerId) {
        return message.reply({ content: 'You cannot warn the server owner.' });
      }

      if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && message.author.id !== message.guild.ownerId) {
        return message.reply({ content: 'You cannot warn this user because they have an equal or higher role than you.' });
      }

      const result = await client.manager.warn(message, userId, fullReason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /warn: Received an error response from Manager.warn");
        throw new Error("Error in /warn: Received an error response from Manager.warn");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User warned")
        .setDescription(`I have warned <@${userId}> for \`${fullReason}\`. This user now has ${result.totalWarns} warnings, and the case ID is ${result.case}.`);

      const em2 = new EmbedBuilder()
        .setTitle("You have been warned")
        .setDescription(`You have been warned in \`${message.guild.name}\` for \`${fullReason}\`. You now have ${result.totalWarns} warnings. The ID for this case is ${result.case}.`);

      await message.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));
      await member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User warned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${fullReason}\` \n**Case:** \`${result.case}\``);

      await modlogs.send({ embeds: [em3] });

    } catch (error) {
      client.logger.error('Error in warn command execution:', error);
      console.error(error);
      await message.reply({ content: 'There was an error trying to warn the user. Please try again later.' });
    }
  }
};
