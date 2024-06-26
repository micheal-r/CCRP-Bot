const { EmbedBuilder, DiscordAPIError } = require("discord.js");
const config = require('../../config/config');
const dotenv = require('dotenv');
const fs = require('fs')
const path = require('path')
const cooldown = []

module.exports = async (client, message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const prefix = config.prefix
    const prefixRegex = new RegExp(`^(<@${client.user.id}>|\\${prefix})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    
    let ccd;
    if (!command) {
      ccd = await client.data.getCustomCommand(message.guild, commandName)
      if (!ccd) {
        return;
      }
    };

    if (!ccd && command.staffOnly === true) {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficent permissions')
      .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL({ format: 'png', size: 2048 })})
      .setColor(client.config.embedColor)
      .setDescription(`You do not have enough permissions to run this command, if you think this was a mistake please contact the server admin.`)
      .setFooter({text: `${client.config.name}`, iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      if (
        !client.config.owner === message.member.user.id
      ) {
        return message.reply({ embeds: [noPermEmbed]});
    }};

    try {
        if (!ccd) {
          await command.callback(client, message, args, prefix, false)
        } else {
          await client.customCommands.executeCC(client, message, ccd, (err) => {
            if (err) {
                throw err;
            };
        });
        }
    } catch (error) {

      // ===================== Check for certain errors ===================== //
      if (error instanceof DiscordAPIError && error.code === 50007) {
        return;
      }

      client.logger.error(error)
      console.error("Error:", error)
      let errorid = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      const length = 8
      let counter = 0;
      while (counter < length) {
        errorid += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      const errorMessage = error.toString().replace(/^Error: /, '');
      let cn;
      if (command && command.name) {
        cn = "Prefix";
      } else {
        cn = "Custom command";
      }
      const errorEmbed = new EmbedBuilder()   
      .setAuthor({name: `The bot raised an error`, iconURL: 'https://cdn.discordapp.com/emojis/1232696750339522620.webp?size=60&quality=lossless'})
      .setColor(client.config.embedColor)
      .setDescription(`The \`${(command?.name ?? ccd.name)}\` command raised an error.\nJoin the [Hexalon Support](https://www.discord.gg/EdKqfrnZTg) server for details.\n**Error id**\n<:down_right:1194345511365390356>\`${errorid}\``)
      const directory = 'src/data/logs/';
      const fileName = `err_${errorid}.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        errorData: {
          type: `${error.name}`,
          error: `${error.stack}`,
          time: `${message.createdTimestamp}`
        },
        commandData: {
          command: `${(command?.name ?? ccd.name)} (${cn})`,
          channelId: `${message.channel.id}`,
          userId: `${message.author.id}`,
          guildId:`${message.guild.id}`,
        }
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
    try {
      if (message.replied) {
        await message
          .send({
            embeds: [errorEmbed],
          })
          .catch(() => {      
            message.channel.send({
            embeds: [errorEmbed],
          })});
      } else {
        await message
          .reply({
            embeds: [errorEmbed],
          })
          .catch(() => {      
            message.channel.send({
            embeds: [errorEmbed],
          })});
      }
    } catch (err) {
      message.channel.send({
        embeds: [errorEmbed],
      })
    }
    };
}