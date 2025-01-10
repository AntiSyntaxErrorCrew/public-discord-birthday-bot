require("dotenv").config();
const { MongoClient } = require("mongodb");
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const uri = "" // your mongodb uri
const mongoClient = new MongoClient(uri);

const channelId = "" // your channel id;
let startTime;
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

async function connectDB() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(""); // your mongodb database name
    const collection = db.collection(""); // your mongodb collection name
    return collection;
  } catch (error) {
    console.error("error connecting to mongodb:", error);
  }
}

async function updateBirthdayYears() {
  const collection = await connectDB();
  const now = new Date();

  try {
    const birthdays = await collection.find().toArray();

    const updates = birthdays.map((birthdayObj) => {
      let birthday = new Date(birthdayObj.date);
      if (
        now.getFullYear() === birthday.getFullYear() &&
        now.getTime() > birthday.getTime()
      ) {
        birthday.setFullYear(nextYear);
        return collection.updateOne(
          { _id: birthdayObj._id },
          { $set: { date: birthday.toLocaleString() } }
        );
      }
    });

    await Promise.all(updates);
    console.log("updated birthdays");
  } catch (error) {
    console.error("error updating birthdays:", error);
  }
}
updateBirthdayYears();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = client.channels.cache.get(channelId);

  setInterval(async () => {
    const now = new Date();
    const collection = await connectDB();
    const birthdays = await collection.find().toArray();

    birthdays.forEach(async (birthdayObj) => {
      let birthday = new Date(birthdayObj.date);
      if (now.getTime() > birthday.getTime()) {
        channel
          .send(`Happy birthday <@${birthdayObj._id}> 🎉`)
          .catch(console.error);
        birthday.setFullYear(nextYear);
        await collection.updateOne(
          { _id: birthdayObj._id },
          { $set: { date: birthday.toLocaleString() } }
        );
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
