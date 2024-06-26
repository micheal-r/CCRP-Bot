const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'unmute',
  description: 'Unmute a user',
  staffOnly: false,
  debugType: true,
  callback: async (client, message, args, prefix) => {
    try {
      const userId = args[0].replace(/[<@!>]/g, '');
      const rsn = args.slice(1).join(' ') || "No reason specified.";
      const reason = message.author.username + ": " + rsn;
      const mod = message.author.id;

      const member = await message.guild.members.fetch(userId);
      if (!member) {
        return message.reply("User not found.");
      }

      if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply("You do not have permission to unmute members.");
      }

      if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && message.author.id !== message.guild.ownerId) {
        return message.reply("You cannot unmute this user because they have an equal or higher role than you.");
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return message.reply("I do not have permission to unmute members.");
      }

      if (!member.isCommunicationDisabled()) {
        return message.reply("This user does not have an active timeout.");
      }

      const result = await client.manager.unmute(message, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /unmute: Received an error response from Manager.unmute");
        throw new Error("Error in /unmute: Received an error response from Manager.unmute");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User unmuted")
        .setDescription(`I have unmuted <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`);

      const em2 = new EmbedBuilder()
        .setTitle("You have been unmuted")
        .setDescription(`You have been unmuted in \`${message.guild.name}\` for \`${reason}\`. The ID for this case is ${result.case}.`);

      message.channel.send({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err));

      member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err));

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User unmuted")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``);
      
      modlogs.send({ embeds: [em3] });

    } catch (error) {
      client.logger.error('Error in unmute command execution:', error);
      console.error(error);
      message.reply('There was an error trying to unmute the user. Please try again later.');
    }
  }
};
