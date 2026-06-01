# AI2md

ChatGPT、Claude、Gemini のAI返答本文をMarkdownファイルとして保存するChrome拡張です。

## 機能

- 各AI返答の近くに `MD` ボタンを追加し、その返答だけを `.md` で保存します。
- ポップアップの「全AI返答を保存」から、会話内のAI返答本文だけを順番にまとめて保存します。
- ユーザー発言、URL、日時、ページタイトルなどのメタ情報はMarkdown本文へ含めません。
- 見出し、箇条書き、番号リスト、リンク、引用、コードブロック、表を可能な範囲でMarkdownへ変換します。

## 開発

```bash
npm install
npm run build
npm test
```

## ローカル読み込み

1. `npm run build` を実行します。
2. Chromeで `chrome://extensions` を開きます。
3. デベロッパーモードを有効にします。
4. 「パッケージ化されていない拡張機能を読み込む」から `dist` を選びます。

## 手動確認

1. ChatGPT、Claude、Geminiの会話ページを開きます。
2. AI返答の近くに `MD` ボタンが表示されることを確認します。
3. `MD` ボタンから単体のMarkdown保存が開始されることを確認します。
4. 拡張ポップアップから「全AI返答を保存」を実行し、AI返答本文だけがMarkdownで保存されることを確認します。

## 出力ファイル名

- 単体: `YYYY-MM-DD_HH-mm-ss_{site}_response-{index}.md`
- 全体: `YYYY-MM-DD_HH-mm-ss_{site}_responses.md`
