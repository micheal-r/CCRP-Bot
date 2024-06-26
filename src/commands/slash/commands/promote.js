const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

const roleHierarchy = [
    '1255532775742771273',
    '1255532773201023028',
    '1255532764758020147',
];

module.exports = {
  name: 'promote',
  description: 'Promote a user',
  staffOnly: false,
  debugType: true,
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to promote',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],
  callback: async (client, interaction, prefix) => {
    try {
        const member = interaction.options.getMember('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply('You do not have permission to manage roles.');
        }

        let currentRoleIndex = roleHierarchy.findIndex(roleId => member.roles.cache.has(roleId));

        if (currentRoleIndex === -1) {
            return interaction.reply('Member does not have a promotable role.');
        }

        let nextRoleIndex = currentRoleIndex + 1;

        if (nextRoleIndex >= roleHierarchy.length) {
            return interaction.reply('Member is already at the highest rank.');
        }
        const currentRoleID = roleHierarchy[currentRoleIndex];
        const nextRoleID = roleHierarchy[nextRoleIndex];

        try {
            await member.roles.add(nextRoleID);
            await member.roles.remove(currentRoleID);
            return interaction.reply(`Successfully promoted ${member.displayName} to <@&${nextRoleID}>`);
        } catch (error) {
            console.error('Error promoting member:', error);
            return interaction.reply('There was an error promoting the member. Please try again later.');
        }
    } catch (error) {
      client.logger.error('Error in mute command execution:', error);
      console.error(error);
      await interaction.reply({ content: 'There was an error trying to promote the user. Please try again later.', ephemeral: true });
    }
  }
};
