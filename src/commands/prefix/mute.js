const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'mute',
  description: 'Mute a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      if (!args[0] || !args[0].startsWith('<@') || !args[0].endsWith('>')) {
        const emNM = new EmbedBuilder()
          .setTitle('Not enough arguments')
          .setDescription(`Make sure you use this command correctly. \n\`\`\`${prefix}mute @user [duration in minutes] reason\`\`\``);
        return message.reply({ embeds: [emNM] });
      }

      const usr = args[0];
      const userId = usr.replace(/[<@!>]/g, '');
      const member = await message.guild.members.fetch(userId);

      const durationArg = parseInt(args[1]);
      const isDurationProvided = !isNaN(durationArg);
      const duration = isDurationProvided ? durationArg * 60_000 : 60 * 60_000;
      const reason = isDurationProvided ? args.slice(2).join(' ') : args.slice(1).join(' ');
      const fullReason = `${message.author.username}: ${reason || "No reason specified."}`;
      const mod = message.author.id;

      if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply({ content: 'You do not have permission to mute members.' });
      }

      if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && message.author.id !== message.guild.ownerId) {
        return message.reply({ content: 'You cannot mute this user because they have an equal or higher role than you.' });
      }

      if (userId === message.guild.ownerId) {
        return message.reply({ content: 'You cannot mute the server owner.' });
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply({ content: 'I do not have permission to mute members.' });
      }

      const result = await client.manager.mute(message, userId, fullReason, duration, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /mute: Received an error response from Manager.mute");
        throw new Error("Error in /mute: Received an error response from Manager.mute");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User muted")
        .setDescription(`I have muted <@${userId}> for \`${fullReason}\`. The case ID is ${result.case}.`);

      const em2 = new EmbedBuilder()
        .setTitle("You have been muted")
        .setDescription(`You have been muted in \`${message.guild.name}\` for \`${fullReason}\`. The ID for this case is ${result.case}.`);

      await message.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));
      await member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User muted")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${fullReason}\` \n**Case:** \`${result.case}\``);

      await modlogs.send({ embeds: [em3] });

    } catch (error) {
      client.logger.error('Error in mute command execution:', error);
      console.error(error);
      await message.reply({ content: 'There was an error trying to mute the user. Please try again later.' });
    }
  }
};
