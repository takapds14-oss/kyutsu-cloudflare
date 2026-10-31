球通BC Google検索のアイコン・画像メタデータ調整（TOPページのみ）

更新対象：public/index.html のみ
GitHubの kyutsu-cloudflare → public に index.html を上書きアップロードしてください。
既存 assets/favicon.png (512x512), favicon.ico, assets/apple-touch-icon.png, assets/team.webp を使うため画像ファイルの追加は不要です。

変更内容：
・ファビコンのPNGサイズ・種類を明記。既存アイコンURLを維持。
・max-image-preview:large を明記。
・既存SportsTeam構造化データの image を文字入りOGPではなく実際のチーム写真に設定。
・WebPageのprimaryImageOfPageにチーム写真を指定。
・SNS共有用og:imageは従来の球通BCデザインを維持。

Google検索でのアイコンと写真の表示はGoogle側の判断であり保証できません。
GooglebotおよびGooglebot-Imageが画像を取得できるよう、CloudflareのSecurity Eventsでブロックされていないことを確認してください。
反映後はSearch ConsoleでTOPの公開URLテストと（必要なら）インデックス登録リクエストを実施してください。
