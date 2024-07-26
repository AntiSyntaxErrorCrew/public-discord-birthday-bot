require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

var currentYear = new Date().getFullYear();
var nextYear = currentYear + 1;
// list of birthday(s) in the format "MM/DD/YYYY, 12:00:00 AM"
var birthdayList = [];

// list of Discord user ID(s)
const discordUserList = [];

function updateBirthdayYears() {
  var now = new Date();
  for (let i = 0; i < birthdayList.length; i++) {
    var birthday = new Date(birthdayList[i]);
    if (now.getFullYear() == birthday.getFullYear()) {
      if (now.getTime() > birthday.getTime()) {
        birthday.setFullYear(nextYear);
        birthdayList[i] = birthday.toLocaleString();
      }
    }
  }
}
updateBirthdayYears();

// Discord channel ID to send birthday messages
const channelId = "";

client.on("ready", (message) => {
  console.log(`Logged in as ${message.user.tag}`);

  const channel = client.channels.cache.get(channelId);
  setInterval(function () {
    var now = new Date();
    for (let i = 0; i < birthdayList.length; i++) {
      var birthday = new Date(birthdayList[i]);
      if (now.getTime() > birthday.getTime()) {
        channel
          .send(`Happy birthday <@${discordUserList[i]}> 🎉`)
          .catch(console.error);
        birthday.setFullYear(nextYear);
        birthdayList[i] = birthday.toLocaleString();
        console.log(birthdayList[i]);
      }
    }
  }, 10000);
  startTime = Date.now();
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes("hello")) {
    let option1 = "hello";
    let option2 = "안녕하세요";
    let chosen_option = Math.random() < 0.5 ? option1 : option2;
    message.reply(chosen_option);
  }

  if (message.content.toLowerCase() === "!uptime") {
    const currentTime = Date.now();
    const uptime = currentTime - startTime;
    const formattedUptime = formatUptime(uptime);

    message.reply(`${formattedUptime}`);
  }
});

function formatUptime(uptime) {
  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

client.login(process.env.TOKEN);
