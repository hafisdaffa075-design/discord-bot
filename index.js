const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
  if (!message.content.startsWith("!")) return;

  const command = message.content.slice(1).toLowerCase();

  try {
    const data = JSON.parse(fs.readFileSync("./images.json", "utf8"));

    // COMMAND LIST
    if (command === "list") {
      const commandList = Object.keys(data)
        .map((cmd) => `!${cmd}`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 Daftar Command")
        .setDescription(commandList)
        .setColor(0x00aeff);

      return message.channel.send({ embeds: [embed] });
    }

    // COMMAND GAMBAR
    if (!data[command]) {
      return message.reply(
        "❌ Command tidak ditemukan! Ketik !list untuk melihat daftar.",
      );
    }

    const images = data[command];
    const randomImage = images[Math.floor(Math.random() * images.length)];

    const embed = new EmbedBuilder()
      .setTitle(`📸 Gambar ${command}`)
      .setImage(randomImage)
      .setColor(0x00aeff)
      .setFooter({ text: `Diminta oleh ${message.author.username}` });

    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error:", error);
    message.reply("⚠ Terjadi kesalahan membaca data.");
  }
});

client.login(TOKEN);
