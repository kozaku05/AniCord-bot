import { Client, GatewayIntentBits, Message } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const token = process.env.TOKEN;
import get from "./api-get.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "setchannel") {
    const channelID = interaction.channel.id;

    try {
      const data = await fs.promises.readFile("channelDB.json", "utf8");
      let jsonData = data ? JSON.parse(data) : [];

      if (jsonData.includes(channelID)) {
        await interaction.reply({
          content: `すでに設定されているチャンネルです。`,
        });
        return;
      }

      jsonData.push(`${channelID}`);
      await fs.promises.writeFile("channelDB.json", JSON.stringify(jsonData));

      await interaction.reply({
        content: `送信先のチャンネルを ${interaction.channel.name} に設定しました。一時間おきに送信されます。`,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `エラーが発生しました。`,
        ephemeral: true,
      });
    }
  }
  if (interaction.commandName === "deletechannel") {
    const channelID = interaction.channel.id;
    try {
      const data = await fs.promises.readFile("channelDB.json", "utf8");
      let jsonData = data ? JSON.parse(data) : [];
      jsonData = jsonData.filter((id) => id !== channelID);
      await fs.promises.writeFile("channelDB.json", JSON.stringify(jsonData));
      await interaction.reply({
        content: `送信先のチャンネルを削除しました。`,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `エラーが発生しました。`,
        ephemeral: true,
      });
    }
  }
});

async function sendData() {
  let TID = Math.floor(Math.random() * 7302) + 1;
  console.log("生成されたTID:", TID);
  const data = await get(TID);
  console.log("取得したデータ:", data);
  const json = await fs.promises.readFile("channelDB.json", "utf8");
  const channels = JSON.parse(json);
  if (channels.length === 0) {
    console.log("送信先チャンネルが登録されていません");
    return;
  }

  const embedMessage = {
    embeds: [
      {
        title: "**今回取得したアニメ**",
        description: "ランダムに取得されたアニメの情報です！",
        url: "https://cal.syoboi.jp/tid/" + data.id,
        color: 0x3498db,
        footer: {
          text: "使用API: https://cal.syoboi.jp",
        },
        fields: [
          {
            name: "**タイトル**",
            value: data.title,
            inline: true,
          },
          {
            name: "**ID**",
            value: data.id,
            inline: true,
          },
          {
            name: "ツール制作者",
            value:
              "[Github @kozaku05](https://github.com/kozaku05/AniCord-bot)",
            inline: false,
          },
        ],
      },
    ],
  };
  for (const channelId of channels) {
    const channel = await client.channels.fetch(channelId);
    await channel.send(embedMessage);
  }
}
client.login(token);
setInterval(async () => {
  await sendData();
}, 60 * 60 * 1000);
setTimeout(sendData, 5000);
