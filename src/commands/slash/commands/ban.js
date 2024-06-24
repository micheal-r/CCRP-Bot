const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to ban',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Why do you want to ban this user?',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  callback: async (client, interaction, prefix) => {
    try {
      const member = await interaction.options.getMember('user');
      const userId = member.user.id;
      const rsn = await interaction.options.getString('reason') || "No reason specified.";
      const reason = interaction.user.username + ": " + rsn;
      const mod = interaction.user.id;

      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'I do not have permission to ban members.', ephemeral: true });
    }

    if (userId === interaction.guild.ownerId) {
      return interaction.reply({ content: 'You cannot ban the server owner.', ephemeral: true});
  }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: 'You cannot ban this user because they have equal or higher role than you.', ephemeral: true });
    }

      const result = await client.manager.ban(interaction, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /ban: Received an error response from Manager.ban");
        throw new Error("Error in /ban: Received an error response from Manager.ban");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User banned")
        .setDescription(`I have banned <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`)


      interaction.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err))

      const modlogs = client.channels.cache.get(client.logChannel);
      const em2 = new EmbedBuilder()
        .setTitle("User banned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``)
      
      modlogs.send({embeds: [em2]});

    } catch (error) {
      client.logger.error('Error in ban command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to ban the user. Please try again later.', ephemeral: true });
    }
  }
};
