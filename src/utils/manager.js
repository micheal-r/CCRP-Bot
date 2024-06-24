const Moderations = require('../schema/Moderations.js');

module.exports = class Manager {
  // --------------- Moderation Management --------------- \\
  static async warn(interaction, target, reason, moderator) {
    try {
      const count = await Moderations.countDocuments();

      const id = count + 1;

      const newWarning = new Moderations({
        target: target,
        reason: reason,
        moderator: moderator,
        case: id,
        type: "Warning",
      });

      await newWarning.save();

      const totalWarns = await Moderations.countDocuments({ target: target, type: "Warning" });

      return {
        err: "no",
        case: id,
        totalWarns: totalWarns.toString(),
      };
    } catch (e) {
      console.error('Error in Manager.warn:', e);
      return { err: "yes" };
    }
  }

  static async kick(interaction, target, reason, moderator) {
    try {
      const count = await Moderations.countDocuments();

      const id = count + 1;

      const targetMember = await interaction.guild.members.fetch(target);
      targetMember.kick(reason).catch((err) => console.error("Error while kicking the user", err));

      const newKick = new Moderations({
        target: target,
        reason: reason,
        moderator: moderator,
        case: id,
        type: "Kick",
      });

      await newKick.save();

      return {
        err: "no",
        case: id,
      };
    } catch (e) {
      console.error('Error in Manager.kick:', e);
      return { err: "yes" };
    }
  }

  static async ban(interaction, target, reason, moderator) {
    try {
      const count = await Moderations.countDocuments();

      const id = count + 1;

      await interaction.guild.members.ban(target, { reason }).catch((err) => console.error("Error while banning this user.", err));

      const newBan = new Moderations({
        target: target,
        reason: reason,
        moderator: moderator,
        case: id,
        type: "Ban",
      });

      await newBan.save();

      return {
        err: "no",
        case: id,
      };
    } catch (e) {
      console.error('Error in Manager.ban:', e);
      return { err: "yes" };
    }
  }

  static async unban(interaction, target, reason, moderator) {
    try {
      const count = await Moderations.countDocuments();

      const id = count + 1;
      await interaction.guild.members.unban(target, reason).catch((err) => console.error("Error while unbanning this user.", err));

      const newUnban = new Moderations({
        target: target,
        reason: reason,
        moderator: moderator,
        case: id,
        type: "Unban",
      });

      await newUnban.save();

      return {
        err: "no",
        case: id,
      };
    } catch (e) {
      console.error('Error in Manager.unban:', e);
      return { err: "yes" };
    }
  }

  static async mute(interaction, target, reason, duration, moderator) {
    try {
      const targetMember = await interaction.guild.members.fetch(target);
      const count = await Moderations.countDocuments();

      const id = count + 1;

      await targetMember.timeout(duration, reason).catch((err) => console.error("Error while muting this user.", err));

      const newMute = new Moderations({
        target: target,
        reason: reason,
        moderator: moderator,
        case: id,
        type: "Mute",
      });

      await newMute.save();

      return {
        err: "no",
        case: id,
      };
    } catch (e) {
      console.error('Error in Manager.mute:', e);
      return { err: "yes" };
    }
  }
};
