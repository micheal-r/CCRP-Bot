const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'mute',
  description: 'Mute a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to mute',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Why do you want to mute this user?',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'duration',
      description: 'For how long do you want to mute this user? In minutes.',
      required: false,
      type: ApplicationCommandOptionType.Number,
    }
  ],
  callback: async (client, interaction, prefix) => {
    try {
      const member = await interaction.options.getMember('user');
      const userId = member.user.id;
      const rsn = await interaction.options.getString('reason') || "No reason specified.";
      const reason = interaction.user.username + ": " + rsn;
      const dur = await interaction.options.getNumber('duration') || 60;
      const duration = dur * 60_000
      const mod = interaction.user.id;
      if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return interaction.reply({ content: 'You do not have permission to mute members.', ephemeral: true });
    }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: 'You cannot mute this user because they have equal or higher role than you.', ephemeral: true });
    }

    if (userId === interaction.guild.ownerId) {
        return interaction.reply({ content: 'You cannot mute the server owner.', ephemeral: true});
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
        return interaction.reply({ content: 'I do not have permission to mute members.', ephemeral: true });
      }

      const result = await client.manager.mute(interaction, userId, reason, duration, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /mute: Received an error response from Manager.mute");
        throw new Error("Error in /mute: Received an error response from Manager.mute");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User muted")
        .setDescription(`I have muted <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`)

      const em2 = new EmbedBuilder()
        .setTitle("You have been muted")
        .setDescription(`You have been muted in \`${interaction.guild.name}\` for \`${reason}\`. The ID for this case is ${result.case}.`)

      interaction.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err))

      member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err))

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User muted")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``)
      
      modlogs.send({embeds: [em3]});

    } catch (error) {
      client.logger.error('Error in mute command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to mute the user. Please try again later.', ephemeral: true });
    }
  }
};
