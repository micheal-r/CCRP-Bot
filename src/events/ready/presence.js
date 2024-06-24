require('dotenv').config();
const { ActivityType, setActivity} = require('discord.js')

module.exports = async (client) => {
try {
    client.user.setStatus('online');
    let status = [
        {
          name: 'over CCRP',
          type:  ActivityType.Watching,
        },
    ];

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
  client.logger.client('Changed client presence')
} catch (error) {
  client.logger.error('An error occured while changing client presence')
} {
}
};