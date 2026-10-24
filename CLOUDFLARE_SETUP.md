# KYUTSU Ver.56 — Cloudflare Pages / Functions

## 本番のRenderサイトはそのまま維持
まずCloudflareの `*.pages.dev` のURLで動作確認してください。Renderは削除しないでください。

## Cloudflare Pagesを作成
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Pages → Gitリポジトリ接続
2. 既存の球通GitHubリポジトリを選択（Ver.56の中身をリポジトリのルートへアップロード）
3. Framework preset: None / Root directory: リポジトリルート
4. Build command: 空欄（または `exit 0`）
5. Build output directory: `public`
6. `functions` フォルダは `public` の外、リポジトリルートに配置する

## 環境変数（Cloudflare Pages → Settings → Variables and Secrets）
既存のRenderのEnvironmentから **値をコピー**。新しい公開リポジトリやチャットに秘密情報を貼らないこと。

- `GOOGLE_SHEET_CSV_URL` : GAME RESULTSの公開CSV URL
- `GOOGLE_PLAYERS_SHEET_CSV_URL` : PLAYERSの公開CSV URL
- `WEB3FORMS_ACCESS_KEY` : Web3Formsのフォームアクセスキー（ブラウザ側に渡す公開キー）

※ 本番・プレビューで異なる環境設定を使う場合は両方設定。
※ Gmailパスワードは一切不要。

## テスト順
- `/api/config-check` で3つが true
- `/api/results` が配列を返す
- `/api/players` が配列を返す
- `/api/note` が配列を返す
- TOPの試合結果 / PLAYER PROFILE / NOTE / GALLERY が表示できる
- 応募フォームの実送信テスト（受信先メールに届くこと）
- SP/PCの表示・画像・ボタンと日本語表記をチェック

※ Cloudflare Pagesの静的配信はRender Free Web Serviceのスリープ起動画面を回避できます。ただし外部Google/noteへの通信が失敗する場合やAPIの遅延は残り得ます。

## 移行とドメイン
動作確認後、Cloudflare Pages → Custom domains から独自ドメイン接続。Renderは切替後もしばらく残して確認すること。

## 注意
- `server.js`, `render.yaml`, Node.js依存のバックエンドはCloudflare Pagesへ配備しません。
- Cloudflare Functionsは `functions/api/` 内。従来と同じ `/api/results`, `/api/players`, `/api/note`, `/api/form-config` を提供します。
- 現在のRenderのURLはCSSやOGP/canonicalのメタデータ内に残っている可能性があります。独自ドメイン確定後に新ドメインへ書き換えてください。
- `public` の内容はビルド成果物であり、更新時はここを変更します。
