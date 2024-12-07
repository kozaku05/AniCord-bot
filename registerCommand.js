const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "setchannel",
    description: "送信先のチャンネルを指定します。",
  },
  {
    name: "deletechannel",
    description: "送信先のチャンネルを削除します。",
  },
];

new REST()
  .setToken(process.env.TOKEN)
  .put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
  .then(() => console.log("コマンド登録完了"))
  .catch(console.error);
