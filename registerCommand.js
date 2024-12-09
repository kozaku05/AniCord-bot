const { REST, Routes } = require("discord.js");
require("dotenv").config();
if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  console.error("環境変数が設定されていません。");
  console.error("TOKEN と CLIENT_ID を .env ファイルに設定してください。");
  process.exit(1);
}
const commands = [
  {
    name: "setchannel",
    description: "送信先のチャンネルを指定します。",
  },
  {
    name: "deletechannel",
    description: "送信先のチャンネルを削除します。",
  },
  {
    name: "get",
    description: "アニメの情報を取得します。",
    options: [
      {
        name: "tid",
        type: 4,
        required: false,
        description: "アニメのTIDを指定します。ない場合ランダムに取得します。",
      },
    ],
  },
  {
    name: "announce",
    description: "このコマンドは開発者以外実行できません",
    options: [
      {
        name: "message",
        type: 3,
        required: true,
        description: "メッセージを指定します。",
      },
    ],
  },
];
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
async function registerCommands() {
  try {
    console.log("スラッシュコマンドの登録を開始します...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("スラッシュコマンドの登録が完了しました！");
  } catch (error) {
    console.error("コマンドの登録中にエラーが発生しました:", error);
  }
}
registerCommands();
