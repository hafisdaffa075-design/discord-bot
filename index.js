const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// TOKEN diambil dari Environment Variable
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error(
    "TOKEN tidak ditemukan! Pastikan sudah set Environment Variable.",
  );
  process.exit(1);
}

client.once("ready", () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  console.log("Pesan masuk:", message.content);

  if (message.content.trim() === "!g") {
    try {
      const data = JSON.parse(fs.readFileSync("./images.json", "utf8"));

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("Data gambar kosong!");
      }

      const randomImage = data[Math.floor(Math.random() * data.length)];

      await message.channel.send({ content: randomImage });
    } catch (error) {
      console.error("Error baca JSON:", error);
      message.reply("Terjadi kesalahan membaca file gambar.");
    }
  }
});

client.login(TOKEN);
