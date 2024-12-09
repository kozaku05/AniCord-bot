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

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  let Index = 0;
  setInterval(async () => {
    let title = "";
    if (Index === 2) {
      let tid = Math.floor(Math.random() * 7302) + 1;
      let data = await get(tid);
      title = data.title;
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
  if (!interaction.member.permissions.has("Administrator")) {
    return interaction.reply("You do not have permission to use this command.");
  }
  if (interaction.commandName === "setchannel") {
    const channelID = interaction.channel.id;
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
    const channelID = interaction.channel.id;
    const data = fs.readFileSync("channelDB.json", "utf8");
    let jsonData = JSON.parse(data);
    if (!jsonData.includes(channelID)) {
      return interaction.reply("設定されていないチャンネルです。");
    }
    jsonData = jsonData.filter((id) => id !== channelID);
    fs.writeFileSync("channelDB.json", JSON.stringify(jsonData));
    interaction.reply("チャンネルを除外しました。");
  }
  if (interaction.commandName === "get") {
    let TID = interaction.options.getInteger("tid");
    if (!TID) {
      TID = Math.floor(Math.random() * 7302) + 1;
    }
    const data = await get(TID);
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
    interaction.reply(embedMessage);
  }
});

async function send() {
  const TID = Math.floor(Math.random() * 7302) + 1;
  const data = await get(TID);
  console.log(data);
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
  try {
    let channels = fs.readFileSync("channelDB.json", "utf8");
    channels = JSON.parse(channels);
    for (const channelId of channels) {
      const channel = await client.channels.fetch(channelId);
      await channel.send(embedMessage);
    }
  } catch (error) {
    console.log("チャンネル取得エラー");
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
    return;
  }
  await send();
});

schedule.scheduleJob("0 * * * *", send);
