const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
async function Announcement(message) {
  try {
    let channels = fs.readFileSync("channelDB.json", "utf8");
    channels = JSON.parse(channels);
    for (const channelId of channels) {
      const channel = await client.channels.fetch(channelId);
      await channel.send(message);
    }
  } catch (error) {
    console.log("チャンネル取得エラー");
  }
}
const message = "お知らせの内容";
client.login(process.env.TOKEN).then(() => {
  Announcement(message);
});
