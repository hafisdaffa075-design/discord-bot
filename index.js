const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.TOKEN;

client.once("ready", () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const command = message.content.trim().replace("!", "");

  try {
    const data = JSON.parse(fs.readFileSync("./images.json", "utf8"));

    if (!data[command]) return;

    const images = data[command];
    const randomImage = images[Math.floor(Math.random() * images.length)];

    await message.channel.send(randomImage);
  } catch (error) {
    console.error("Error:", error);
  }
});

client.login(TOKEN);
