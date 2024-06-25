const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'unban',
  description: 'Unban a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      if (!args[0] || !args[0].match(/^\d+$/)) {
        const emNM = new EmbedBuilder()
          .setTitle('Not enough arguments')
          .setDescription(`Make sure you use this command correctly. \n\`\`\`${prefix}unban userId reason\`\`\``);
        return message.reply({ embeds: [emNM] });
      }

      const userId = args[0];
      const rsn = args.slice(1).join(' ') || "No reason specified.";
      const reason = `${message.author.username}: ${rsn}`;
      const mod = message.author.id;
      const banList = await message.guild.bans.fetch();

      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply({ content: 'You do not have permission to unban members.' });
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply({ content: 'I do not have permission to unban members.' });
      }

      if (!banList.get(userId)) {
        return message.reply({ content: 'This user is not banned.' });
      }

      const result = await client.manager.unban(message, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /unban: Received an error response from Manager.unban");
        throw new Error("Error in /unban: Received an error response from Manager.unban");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User unbanned")
        .setDescription(`I have unbanned <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`);

      await message.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em2 = new EmbedBuilder()
        .setTitle("User unbanned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``);

      await modlogs.send({ embeds: [em2] });

    } catch (error) {
      client.logger.error('Error in unban command execution:', error);
      console.error(error);
      await message.reply({ content: 'There was an error trying to unban the user. Please try again later.' });
    }
  }
};
