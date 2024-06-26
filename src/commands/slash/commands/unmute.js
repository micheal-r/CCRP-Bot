const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'unmute',
  description: 'Unmute a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to unmute',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Why do you want to unmute this user?',
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
      if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return interaction.reply({ content: 'You do not have permission to unmute members.', ephemeral: true });
    }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: 'You cannot unmute this user because they have equal or higher role than you.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return interaction.reply({ content: 'I do not have permission to unmute members.', ephemeral: true });
      }

    if (!member.isCommunicationDisabled()) {
        return interaction.reply({ content:'This user does not have an active timeout.', ephemeral: true });
    }

      const result = await client.manager.unmute(interaction, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /mute: Received an error response from Manager.unmute");
        throw new Error("Error in /mute: Received an error response from Manager.unmute");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User unmuted")
        .setDescription(`I have unmuted <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`)

      const em2 = new EmbedBuilder()
        .setTitle("You have been unmuted")
        .setDescription(`You have been muted in \`${interaction.guild.name}\` for \`${reason}\`. The ID for this case is ${result.case}.`)

      interaction.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err))

      member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err))

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User unmuted")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``)
      
      modlogs.send({embeds: [em3]});

    } catch (error) {
      client.logger.error('Error in unmute command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to unmute the user. Please try again later.', ephemeral: true });
    }
  }
};
