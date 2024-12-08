# AniCord💫 - アニメ情報 Discord Bot

## 概要

AniCord は、一時間ごとに自動でアニメ情報を投稿する Discord Bot です。アニメ API と連携して、ランダムなアニメ作品の情報を指定されたチャンネルに定期的に投稿します。

- 招待リンク https://discord.com/oauth2/authorize?client_id=1314916746469179423&permissions=2147568640&integration_type=0&scope=bot+applications.commands

## 機能

- 🕒 一時間ごとの自動投稿
- 🎯 複数チャンネルへの同時配信
- 🔄 ランダムなアニメ情報の取得
- 👑 管理者権限による設定管理

## セットアップ

### 必要要件

- Node.js v16.x 以上
- npm
- Discord Bot トークン

### インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/kozaku05/anicord-bot.git
cd anicord-bot
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数の設定
   `.env`ファイルを作成し、以下の内容を設定：

```env
DISCORD_TOKEN=あなたのBotトークン
CLIENT_ID=BotのクライアントID
```

4. Bot の起動

```bash
node bot2.js
```

## コマンド一覧

| コマンド         | 説明                                   | 権限   |
| ---------------- | -------------------------------------- | ------ |
| `/setchannel`    | 現在のチャンネルを自動投稿先として設定 | 管理者 |
| `/deletechannel` | 現在のチャンネルの自動投稿を解除       | 管理者 |

## 技術仕様

- **実行環境**: Node.js
- **主要パッケージ**:
  - discord.js v14
  - node-schedule
  - dotenv
- **自動投稿間隔**: 1 時間（毎時 0 分）

## トラブルシューティング

よくある問題と解決方法：

1. Bot が応答しない

   - トークンが正しく設定されているか確認
   - Bot の権限設定を確認

2. 自動投稿が動作しない
   - チャンネル ID が正しく保存されているか確認
   - Bot がチャンネルへの書き込み権限を持っているか確認

## ライセンス

© 2024 kozaku05. All rights reserved.

## 作者情報

**kozaku05**

- Discord: [@kozaku05](https://discord.com/users/962165673742717014)
- サポートサーバー: [how to program](https://discord.gg/tfyqW3CNZh)

不具合の報告や機能要望は、GitHub の Issue または Discord サポートサーバーにてお願いします。
