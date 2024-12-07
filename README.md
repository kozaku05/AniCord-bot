# < AniCord💫 > bot

### プロジェクトの説明

この Bot は、アニメの API からランダムな作品を設定した間隔で取得し、Discord チャンネルに自動的に投稿する Discord Bot です。
- 招待リンク https://discord.com/oauth2/authorize?client_id=1314916746469179423&permissions=2147568640&integration_type=0&scope=bot+applications.commands
---

## セットアップ方法

1. `.env`ファイルを作成し、以下の環境変数を設定:

   ```
   DISCORD_TOKEN=あなたのBotトークン
   CLIENT_ID=BotのクライアントID
   ```

2. 依存関係をインストール:

   ```bash
   npm install
   ```

3. Bot を起動:
   ```bash
   node index.js
   ```

---

## コマンド一覧

- `/setchannel` - 一時間おきに送信されるチャンネルの設定
- `/deletechannel` - 自動投稿の解除

---

## 注意事項

- この Bot は、初学者が学習を目的として作成したものです。
- Discord API の利用制限に注意してください。
- 自由に改変していただけますが、コピーライトの記載をお願いします。

---

## 必要要件

- Node.js 16.x 以上
- Discord.js v14
- Discord Bot トークン

---

## コントリビュート

バグの報告や機能追加のリクエストは歓迎します！お気軽に Issue や Pull Request を送ってください。

---

## コピーライト

© 2024 kozaku05. All rights reserved.  
Discord: [@kozaku05](https://discord.com/users/962165673742717014)  
My Discord Server: [how to program に参加する](https://discord.gg/tfyqW3CNZh)
