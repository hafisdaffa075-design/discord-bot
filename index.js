const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.TOKEN;
const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const cooldown = new Set();

// ================= DATABASE =================
function loadData() {
  return JSON.parse(fs.readFileSync("./images.json", "utf8"));
}

function saveData(data) {
  fs.writeFileSync("./images.json", JSON.stringify(data, null, 2));
}

// ================= READY =================
client.once("ready", () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);
});

// ================= MESSAGE COMMAND =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const data = loadData();

  // Anti Spam Cooldown 5 detik
  if (cooldown.has(message.author.id)) {
    return message.reply("Tunggu 5 detik!");
  }
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 5000);

  // ================= LIST =================
  if (command === "list") {
    const categoryNames = Object.keys(data);

    if (categoryNames.length === 0) {
      return message.reply("❌ Belum ada kategori di database!");
    }

    let totalGambar = 0;

    const listKategori = categoryNames
      .map((cat, i) => {
        const jumlah = data[cat].length;
        totalGambar += jumlah;
        return `**${i + 1}. ${cat.toUpperCase()}**\n🖼️ ${jumlah} Gambar | 🔎 !${cat}`;
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("📂 DAFTAR KATEGORI BOT")
      .setDescription(listKategori)
      .addFields(
        {
          name: "📊 Total Kategori",
          value: `${categoryNames.length}`,
          inline: true,
        },
        {
          name: "🖼️ Total Semua Gambar",
          value: `${totalGambar}`,
          inline: true,
        },
      )
      .setColor(0x00aeff)
      .setFooter({
        text: `Diminta oleh ${message.author.username}`,
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // ================= ADD =================
  if (command === "add") {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("Khusus Admin!");
    }

    const kategori = args[0];
    const link = args[1];

    if (!kategori || !link) {
      return message.reply("Contoh: !add kucing https://link.jpg");
    }

    if (!data[kategori]) data[kategori] = [];
    data[kategori].push(link);
    saveData(data);

    return message.reply(`Gambar berhasil ditambahkan ke ${kategori}`);
  }

  // ================= KIRIM GAMBAR =================
  if (!data[command]) {
    return message.reply("Kategori tidak ditemukan!");
  }

  const randomImage =
    data[command][Math.floor(Math.random() * data[command].length)];

  const embed = new EmbedBuilder()
    .setTitle(`📸 ${command.toUpperCase()}`)
    .setImage(randomImage)
    .setColor(0x00aeff)
    .setFooter({ text: `Diminta oleh ${message.author.username}` });

  message.reply({ embeds: [embed] });
});

client.login(TOKEN);
