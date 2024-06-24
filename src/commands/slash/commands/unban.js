const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'unban',
  description: 'Unban a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to unban',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Why do you want to unban this user?',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  callback: async (client, interaction, prefix) => {
    try {
      const member = await interaction.options.getUser('user');
      const userId = member.id;
      const rsn = await interaction.options.getString('reason') || "No reason specified.";
      const reason = interaction.user.username + ": " + rsn;
      const mod = interaction.user.id;
      const banList = await interaction.guild.bans.fetch();

      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'You do not have permission to unban members.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'I do not have permission to unban members.', ephemeral: true });
    }

    if (!banList.get(userId)) {
        return interaction.reply({ content: 'This user is not banned.', ephemeral: true });
    }

      const result = await client.manager.unban(interaction, userId, reason, mod);
      if (result.err === "yes") {
        client.logger.error("Error in /unban: Received an error response from Manager.unban");
        throw new Error("Error in /unban: Received an error response from Manager.unban");
      }

      const em1 = new EmbedBuilder()
        .setTitle("User unbanned")
        .setDescription(`I have unbanned <@${userId}> for \`${reason}\`. The case ID is ${result.case}.`)


      interaction.reply({ embeds: [em1] }).catch((err) => console.error('Error when sending chat response', err))

      const modlogs = client.channels.cache.get(client.logChannel);
      const em2 = new EmbedBuilder()
        .setTitle("User unbanned")
        .setDescription(`**Moderator:** <@${mod}> \n**Target:** <@${userId}> \n**Reason:** \`${reason}\` \n**Case:** \`${result.case}\``)
      
      modlogs.send({embeds: [em2]});

    } catch (error) {
      client.logger.error('Error in unban command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to unban the user. Please try again later.', ephemeral: true });
    }
  }
};
