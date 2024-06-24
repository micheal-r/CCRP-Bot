const { InteractionType, EmbedBuilder, DiscordAPIError } = require("discord.js");
const config_js = require('../../config/config')
const fs = require('fs')
const path = require('path')

module.exports = async (client, interaction) => {
    if (!interaction.type === InteractionType.ApplicationCommand) return;
    const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
    if (command.staffOnly === true) {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficent permissions')
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({ format: 'png', size: 2048 })})
      .setColor(client.config.embedColor)
      .setDescription(`You do not have enough permissions to run this command, if you think this was a mistake please contact the server admin.`)
      .setFooter({text: `${client.config.name}`, iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      if (
        !interaction.member.roles.cache.some(role => config_js.ranks.staff.includes(role.id))
      ) {
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true});
    }};
    if (command.userPerms) {
      if (command.botPerms) {
        if (
          !interaction.guild.members.me.permissions.has(
          PermissionsBitField.resolve(command.botPerms || [])
          )
        ) {
          embed.setDescription(
          `I don't have **\`${
           command.botPerms
           }\`** permission in ${interaction.channel.toString()} to execute this **\`${
           command.name
           }\`** command.`
          );
        return interaction.reply({ embeds: [embed] });
        }
      }
      if (
        !interaction.member.permissions.has(
        PermissionsBitField.resolve(command.userPerms || [])
      )
      ) {
        embed.setDescription(
        `You don't have **\`${
          command.userPerms
        }\`** permission in ${interaction.channel.toString()} to execute this **\`${
          command.name
        }\`** command.`
      );
          return interaction.reply({ embeds: [embed] });
        }
    }
    try {
      const prefix = client.config.prefix;
      await command.callback(client, interaction, prefix)
    } catch (error) {

      // ===================== Check for certain errors ===================== //
      if (error instanceof DiscordAPIError && error.code === 50007) {
        return;
      }
      
      client.logger.error(error)
      let errorid = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      const length = 10
      let counter = 0;
      while (counter < length) {
        errorid += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      const errorEmbed = new EmbedBuilder()
      .setAuthor({name: `The bot raised an error`, iconURL: 'https://cdn.discordapp.com/emojis/1232696750339522620.webp?size=60&quality=lossless'})
      .setColor(client.config.embedColor)
      .setDescription(`The \`${command.name}\` command raised an error.\nJoin the [Hexalon Support](https://www.discord.gg/EdKqfrnZTg) server for details.\n**Error id**\n<:down_right:1194345511365390356>\`${errorid}\``)
      const directory = 'src/data/logs/';
      const fileName = `err_${errorid}.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        errorData: {
          type: `${error.name}`,
          error: `${error.stack}`,
          time: `${interaction.createdTimestamp}`
        },
        commandData: {
          command: `${command.name} (Prefix)`,
          channelId: `${interaction.channel.id}`,
          userId: `${interaction.user.id}`,
          guildId:`${interaction.guild.id}`,
        }
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
      
      if (interaction.replied) {
          await interaction.channel.send({
            embeds: [errorEmbed],
          })
          .catch(() => {});
      } else {
        if (interaction.deferred){interaction.deleteReply()};
        await interaction.channel.send({
          embeds: [errorEmbed],
        })
        .catch(() => {});
      }
    };
}