const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");
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
    return null;
  }

  const embedMessage = new EmbedBuilder()
    .setTitle("**今回取得したアニメ**")
    .setDescription("ランダムに取得されたアニメの情報です！")
    .setURL(`https://cal.syoboi.jp/tid/${id}`)
    .setColor(0x3498db)
    .setFooter({
      text: "使用API: https://cal.syoboi.jp",
      iconURL: client.user.displayAvatarURL(),
    })
    .addFields(
      { name: "**タイトル**", value: title, inline: true },
      { name: "**ID**", value: id, inline: true },
      {
        name: "ツール制作者",
        value: "[Github @kozaku05](https://github.com/kozaku05/AniCord-bot)",
        inline: false,
      }
    );

  return embedMessage;
}

client.on("ready", () => {
  console.log(`ログイン : ${client.user.tag}`);
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
      let ephemeral = interaction.options.getBoolean("ephemeral");
      if (!TID) {
        TID = Math.floor(Math.random() * 7302) + 1;
      }
      const data = await get(TID);
      if (data.error) {
        return interaction.reply({
          content: `エラー : ${data.error}`,
          ephemeral: true,
        });
      }
      const embedMessage = createEmbed(data.title, data.id);
      if (!embedMessage) {
        return interaction.reply({
          content: "指定したTIDが見つかりませんでした : " + TID,
          ephemeral: true,
        });
      }
      return await interaction.reply({
        embeds: [embedMessage],
        ephemeral: ephemeral,
      });
    } catch (error) {
      return await interaction.reply({
        content: "エラーが発生しました",
        ephemeral: true,
      });
    }
  }
  if (!interaction.channel) {
    await interaction.reply({
      content: "ここでは実行できません。",
      ephemeral: true,
    });
    return;
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
        console.log(
          `command-announce:(${channelId})メッセージ送信に失敗しました`
        );
      }
    }
    interaction.reply({ content: "メッセージを送信しました", ephemeral: true });
  }
  if (interaction.commandName === "setchannel") {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "管理者以外実行できません",
        ephemeral: true,
      });
    }
    let channelID = "";
    try {
      channelID = interaction.channel.id;
    } catch (error) {
      return interaction.reply({
        content: "チャンネル取得に失敗しました",
        ephemeral: true,
      });
    }
    let jsonData = [];
    try {
      const data = fs.readFileSync("channelDB.json", "utf8");
      if (data) {
        jsonData = JSON.parse(data);
      }
    } catch (error) {
      interaction.reply({
        content: "チャンネルDBの読み込みに失敗しました",
        ephemeral: true,
      });
      return;
    }
    if (jsonData.includes(channelID)) {
      return interaction.reply({
        content: "すでに設定されているチャンネルです。",
        ephemeral: true,
      });
    }
    jsonData.push(channelID);
    try {
      fs.writeFileSync("channelDB.json", JSON.stringify(jsonData));
    } catch (error) {
      interaction.reply({
        content: "チャンネルDBの書き込みに失敗しました",
        ephemeral: true,
      });
      console.log(`command-setchannel: 書き込み失敗${error}`);
      return;
    }
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
      return interaction.reply({
        content: "チャンネル取得に失敗しました",
        ephemeral: true,
      });
    }
    let data;
    try {
      data = fs.readFileSync("channelDB.json", "utf8");
    } catch (error) {
      return interaction.reply({
        content: "チャンネルDBの読み込みに失敗しました",
        ephemeral: true,
      });
    }
    if (!data) {
      return interaction.reply({
        content: "設定されていないチャンネルです。",
        ephemearl: true,
      });
    }
    let jsonData = JSON.parse(data);
    if (!jsonData.includes(channelID)) {
      return interaction.reply({
        content: "設定されていないチャンネルです。",
        ephemeral: true,
      });
    }
    jsonData = jsonData.filter((id) => id !== channelID);
    try {
      fs.writeFileSync("channelDB.json", JSON.stringify(jsonData));
    } catch (error) {
      interaction.reply({
        content: "チャンネルDBの書き込みに失敗しました",
        ephemeral: true,
      });
      console.log(`command-setchannel: 書き込み失敗${error}`);
      return;
    }
    interaction.reply("チャンネルを除外しました。");
  }
});

async function send() {
  const TID = Math.floor(Math.random() * 7302) + 1;
  const data = await get(TID);
  if (data.error) {
    return;
  }
  const embedMessage = createEmbed(data.title, data.id);
  if (!embedMessage) {
    return;
  }
  console.log(data);
  let channels = fs.readFileSync("channelDB.json", "utf8");
  if (!channels) return;
  channels = JSON.parse(channels);
  for (const channelId of channels) {
    try {
      const channel = await client.channels.fetch(channelId);
      await channel.send({ embeds: [embedMessage] });
    } catch (error) {
      console.log(`send:(${channelId})メッセージ送信に失敗しました`);
    }
  }
}

client.login(process.env.TOKEN).then(async () => {
  let channels;
  try {
    channels = fs.readFileSync("channelDB.json", "utf8");
  } catch (error) {
    console.log("チャンネルDBの読み込みに失敗しました");
    return;
  }
  if (!channels) return;
  channels = JSON.parse(channels);
  for (const channelId of channels) {
    try {
      const channel = await client.channels.fetch(channelId);
      channel.send("Botが起動しました！情報を一つ送信します...");
    } catch (error) {
      console.log(`login:(${channelId})メッセージ送信に失敗しました`);
    }
  }
  send();
});

schedule.scheduleJob("0 * * * *", send);
