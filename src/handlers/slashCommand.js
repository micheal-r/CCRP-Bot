const { readdirSync } = require("fs");
const { PermissionsBitField, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

module.exports = (client) => {
  const data = [];
  let count = 0;
  readdirSync("./src/commands/slash/").forEach((dir) => {
    const slashCommandFile = readdirSync(`./src/commands/slash/${dir}`).filter(
      (files) => files.endsWith(".js")
    );

    for (const file of slashCommandFile) {
      const slashCommand = require(`../commands/slash/${dir}/${file}`);

      if (!slashCommand.name)
        return client.logger.error('slashCommandError: Application command name is required');

      if (!slashCommand.description)
        return client.logger.error('slashCommandError: Application command description is required');

      client.slashCommands.set(slashCommand.name, slashCommand);
      
      
      data.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(
              slashCommand.default_member_permissions
            ).toString()
          : null,
      });
      count++;
    }
  });
  client.logger.client(`Successfully loaded ${count} slash commands`)
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  (async () => {
    try {
      client.logger.client('Started reloading slash commands');
      rest.put(Routes.applicationCommands(client.config.id), {
        body: data,
      });
      client.logger.client('Successfully reloaded slash commands')
    } catch (error) {
      client.logger.error(error)
    }
  })();
};