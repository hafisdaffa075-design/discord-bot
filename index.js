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
      return message.reply("❌ Tidak ada kategori di database!");
    }

    let totalGambar = 0;

    const kategori = categoryNames
      .map((cat, i) => {
        const jumlah = data[cat].length;
        totalGambar += jumlah;
        return `\`[${i + 1}]\` 📁 **${cat.toUpperCase()}**\n> 🖼️ ${jumlah} Gambar\n> ⚡ Gunakan : \`!${cat}\`\n`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📂 LIST KATEGORI BOT")
      .setDescription(
        `
${kategori}
━━━━━━━━━━━━━━━━━━
📊 **Total Kategori :** ${categoryNames.length}
🖼️ **Total Gambar   :** ${totalGambar}
━━━━━━━━━━━━━━━━━━
`,
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
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
    const kode = args[1];
    const link = args[2];

    if (!kategori || !kode || !link) {
      return message.reply("Contoh: !add foto img1 https://link.jpg");
    }

    if (!data[kategori]) data[kategori] = [];

    data[kategori].push({
      kode: kode,
      url: link,
    });

    saveData(data);

    return message.reply(
      `✅ Gambar (${kode}) berhasil ditambahkan ke ${kategori}`,
    );
  }

  // ================= REMOVE =================
  if (command === "remove") {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("❌ Khusus Admin!");
    }

    const kategori = args[0];
    const kode = args[1];

    if (!kategori || !kode) {
      return message.reply("Contoh: !remove foto img1");
    }

    if (!data[kategori]) {
      return message.reply("❌ Kategori tidak ditemukan!");
    }

    const index = data[kategori].findIndex((g) => g.kode === kode);

    if (index === -1) {
      return message.reply("❌ Kode gambar tidak ditemukan!");
    }

    data[kategori].splice(index, 1);

    if (data[kategori].length === 0) {
      delete data[kategori];
    }

    saveData(data);

    return message.reply(
      `✅ Gambar dengan kode (${kode}) berhasil dihapus dari ${kategori}`,
    );
  }

  // ================= KIRIM GAMBAR =================
  if (!data[command]) {
    return message.reply("Kategori tidak ditemukan!");
  }

  const randomImage =
    data[command][Math.floor(Math.random() * data[command].length)].url;

  const embed = new EmbedBuilder()
    .setTitle(`📸 ${command.toUpperCase()}`)
    .setImage(randomImage)
    .setColor(0x00aeff)
    .setFooter({ text: `Diminta oleh ${message.author.username}` });

  message.reply({ embeds: [embed] });
});

client.login(TOKEN);
