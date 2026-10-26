# KYUTSU Ver.66
## デプロイ
このZIPは差分。GitHubリポジトリのルートに中身をアップロードしてください。
public/index.html, public/style.css, public/script.js, public/news.html, public/news.js, functions/api/news.js を更新・追加します。
既存の functions/api/_shared.js の上書きは不要（同ファイルはZIPに含めません）。

## NEWSのスプレッドシート連携
既存の選手名鑑・試合結果を管理しているGoogleスプレッドシートに「NEWS」タブを作成。
NEWS_SHEET_TEMPLATE.csv と同じ列:
date / category / title / content / image_url / visible
・date: YYYY-MM-DD、category: お知らせ・募集・活動報告など
・image_url: https://で始まる公開画像URL、空でもOK
・visible: TRUE で公開 / FALSE で非公開
・content: セル内改行に対応
タブをWeb公開できる設定にして、CSVエクスポートURLを取得。
Cloudflare Pages > Settings > Variables and Secrets の Productionに
GOOGLE_NEWS_SHEET_CSV_URL = 該当タブの公開CSV URL
を追加し、再デプロイしてください。
設定するまではサイトには「ニュースは準備中です。」と表示されます。

SPメニュー: 全画面・不透明濃紺・縦並び・背景スクロール停止。
NEWS: TOP最新3件、一覧ページ news.html、記事詳細 news.html?article=ID。
注意: シートで記事を並び替えるとIDが変わるため、既存の詳細URLが変わる場合があります。
