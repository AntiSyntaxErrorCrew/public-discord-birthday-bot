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

// edit
const channelId = "";

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

// edit
const birthdayData = [                       
  { date: "01/1/2024, 12:00:00 AM", userId: "" },
];

let startTime;

function updateBirthdayYears() {
  const now = new Date();
  birthdayData.forEach((birthdayObj) => {
    let birthday = new Date(birthdayObj.date);

    // Check if the birthday has already occurred this year
    if (now.getFullYear() === birthday.getFullYear()) {
      if (now.getTime() > birthday.getTime()) {
        // Move birthday to next year
        birthday.setFullYear(nextYear);
        birthdayObj.date = birthday.toLocaleString();
      }
    }
  });
}

// Update birthday years initially
updateBirthdayYears();
console.log(birthdayData);

client.on("ready", (message) => {
  console.log(`Logged in as ${message.user.tag}`);

  const channel = client.channels.cache.get(channelId);

  // Check birthdays every 10 seconds
  setInterval(() => {
    const now = new Date();
    birthdayData.forEach((birthdayObj) => {
      let birthday = new Date(birthdayObj.date);
      if (now.getTime() > birthday.getTime()) {
        channel
          .send(`Happy birthday <@${birthdayObj.userId}> 🎉`)
          .catch(console.error);
        birthday.setFullYear(nextYear);
        birthdayObj.date = birthday.toLocaleString();
      }
    });
  }, 10000);

  startTime = Date.now();
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes("hello")) {
    const greetings = ["hello", "안녕하세요"];
    const chosenGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];
    message.reply(chosenGreeting);
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
