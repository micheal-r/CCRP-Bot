const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
  } = require("discord.js");
  const mongoose = require('mongoose');
  
  class Bot extends Client {
    constructor() {
      super({
        allowedMentions: {
          parse: ["everyone", "roles", "users"],
        },
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildEmojisAndStickers,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.GuildInvites,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildPresences,
        ],
        partials: [
          Partials.Channel,
          Partials.Message,
          Partials.User,
          Partials.GuildMember,
        ],
      });
      this.slashCommands = new Collection();
      this.config = require("../config/config");
      this.owner = this.config.owner;
      this.prefix = this.config.prefix;
      this.embedColor = this.config.embedColor;
      this.aliases = new Collection();
      this.commands = new Collection();
      this.manager = require('../utils/manager');
      this.logger = require('../utils/logger');
      this.logChannel = "1254025439735840771";
      if (!this.token) this.token = process.env.TOKEN;
  
      this.rest.on("rateLimited", (info) => {
        this.logger.error(`Ratelimited: ${info}`);
      });

      const dbOptions = {
        useNewUrlParser: true,
        autoIndex: false,
        connectTimeoutMS: 10000,
        family: 4,
        useUnifiedTopology: true,
      };
      mongoose.connect(process.env.MONGO_URL, dbOptions);
      mongoose.Promise = global.Promise;
      mongoose.connection.on("connected", () => {
        this.logger.log("[DB] DATABASE CONNECTED", "ready");
      });
      mongoose.connection.on("err", (err) => {
        console.log(`Mongoose connection error: \n ${err.stack}`, "error");
      });
      mongoose.connection.on("disconnected", () => {
        console.log("Mongoose disconnected");
      });

      ["commands", "slashCommand", "events", "errorHandler"].forEach((handler) => {
        require(`../handlers/${handler}`)(this);
      });
    }
  
    connect(token) {
      return super.login(token);
    }
  }
  
  module.exports = Bot;