const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'warn',
  description: 'Warn a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to warn',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Why do you want to warn this user?',
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
        return interaction.reply({ content: 'You do not have permission to warn members.', ephemeral: true });
    }

    if (userId === interaction.guild.ownerId) {
      return interaction.reply({ content: 'You cannot warn the server owner.', ephemeral: true});
  }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0 && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: 'You cannot warn this user because they have equal or higher role than you.', ephemeral: true });
    }

      const result = await client.manager.warn(interaction, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /warn: Received an error response from Manager.warn");
        throw new Error("Error in /warn: Received an error response from Manager.warn");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User warned")
        .setDescription(`I have warned <@${userId}> for \`${reason}\`. This user now has ${result.totalWarns} warnings, and the case ID is ${result.case}.`)

      const em2 = new EmbedBuilder()
        .setTitle("You have been warned")
        .setDescription(`You have been warned in \`${interaction.guild.name}\` for \`${reason}\`. You now have ${result.totalWarns} warnings. The ID for this case is ${result.case}.`)

      interaction.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err))

      member.user.send({ embeds: [em2] }).catch((err) => console.error('Error when sending DM response', err))

      const modlogs = client.channels.cache.get(client.logChannel);
      const em3 = new EmbedBuilder()
        .setTitle("User warned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``)
      
      modlogs.send({embeds: [em3]});

    } catch (error) {
      client.logger.error('Error in warn command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to warn the user. Please try again later.', ephemeral: true });
    }
  }
};
