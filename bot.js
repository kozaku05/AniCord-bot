const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const get = require("./api-get");
const schedule = require("node-schedule");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

function createEmbed(title, id) {
  if (!title || !id) {
    return;
  }
  const embedMessage = {
    embeds: [
      {
        title: "**今回取得したアニメ**",
        description: "ランダムに取得されたアニメの情報です！",
        url: "https://cal.syoboi.jp/tid/" + id,
        color: 0x3498db,
        footer: {
          text: "使用API: https://cal.syoboi.jp",
        },
        fields: [
          {
            name: "**タイトル**",
            value: title,
            inline: true,
          },
          {
            name: "**ID**",
            value: id,
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
  return embedMessage;
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  let Index = 0;
  setInterval(async () => {
    let title = "";
    if (Index === 2) {
      let tid = Math.floor(Math.random() * 7302) + 1;
      let data = await get(tid);
      if (data.error) {
        title = "取得に失敗しました";
      } else {
        title = data.title;
      }
    }
    const activities = [
      {
        name: `${client.guilds.cache.size}サーバーで稼働中`,
        type: ActivityType.Watching,
      },
      {
        name: "公式鯖:discord.gg/tfyqW3CNZh",
        type: ActivityType.Playing,
      },
      {
        name: title,
        type: ActivityType.Watching,
      },
    ];

    client.user.setPresence({
      activities: [activities[Index]],
      status: "online",
    });
    Index = (Index + 1) % activities.length;
  }, 10000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "get") {
    try {
      let TID = interaction.options.getInteger("tid");
      if (!TID) {
        TID = Math.floor(Math.random() * 7302) + 1;
      }
      const data = await get(TID);
      const embedMessage = createEmbed(data.title, data.id);
      if (!embedMessage) {
        return interaction.reply("指定したTIDが見つかりませんでした");
      }
      await interaction.reply(embedMessage);
    } catch (error) {
      await interaction.reply("エラーが発生しました");
    }
  }
  if (interaction.commandName === "announce") {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "開発者以外実行できません",
        ephemeral: true,
      });
    }
    let channels = fs.readFileSync("channelDB.json", "utf8");
    channels = JSON.parse(channels);
    for (const channelId of channels) {
      try {
        let message = interaction.options.getString("message");
        const channel = await client.channels.fetch(channelId);
        await channel.send(message);
      } catch (error) {
        console.log("チャンネル取得エラー");
      }
    }
    interaction.reply({ content: "メッセージを送信しました", ephemeral: true });
  }
  if (interaction.commandName === "setchannel") {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply("管理者以外実行できません");
    }
    let channelID = "";
    try {
      channelID = interaction.channel.id;
    } catch (error) {
      return interaction.reply("チャンネル取得に失敗しました");
    }
    let jsonData = [];
    try {
      const data = fs.readFileSync("channelDB.json", "utf8");
      if (data) {
        jsonData = JSON.parse(data);
      }
    } catch (error) {
      jsonData = [];
    }
    if (jsonData.includes(channelID)) {
      return interaction.reply("すでに設定されているチャンネルです。");
    }
    jsonData.push(channelID);
    fs.writeFileSync("channelDB.json", JSON.stringify(jsonData));
    interaction.reply(
      "チャンネルを設定しました。一時間おきにランダムなアニメの情報をお届けします！"
    );
  }
  if (interaction.commandName === "deletechannel") {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply("管理者以外実行できません");
    }
    let channelID = "";
    try {
      channelID = interaction.channel.id;
    } catch (error) {
      return interaction.reply("チャンネル取得に失敗しました");
    }
    const data = fs.readFileSync("channelDB.json", "utf8");
    let jsonData = JSON.parse(data);
    if (!jsonData.includes(channelID)) {
      return interaction.reply("設定されていないチャンネルです。");
    }
    jsonData = jsonData.filter((id) => id !== channelID);
    fs.writeFileSync("channelDB.json", JSON.stringify(jsonData));
    interaction.reply("チャンネルを除外しました。");
  }
});

async function send() {
  const TID = Math.floor(Math.random() * 7302) + 1;
  const data = await get(TID);
  console.log(data);
  if (data.error) {
    return;
  }
  const embedMessage = createEmbed(data.title, data.id);
  if (!embedMessage) {
    return;
  }
  let channels = fs.readFileSync("channelDB.json", "utf8");
  channels = JSON.parse(channels);
  for (const channelId of channels) {
    try {
      const channel = await client.channels.fetch(channelId);
      await channel.send(embedMessage);
    } catch (error) {
      console.log("チャンネル取得エラー");
    }
  }
}

client.login(process.env.TOKEN).then(async () => {
  try {
    let channels = fs.readFileSync("channelDB.json", "utf8");
    channels = JSON.parse(channels);
    for (const channelId of channels) {
      const channel = await client.channels.fetch(channelId);
      channel.send("Botが起動しました！情報を一つ送信します...");
    }
  } catch (error) {
    console.log("チャンネル取得エラー");
  }
  send();
});

schedule.scheduleJob("0 * * * *", send);
