KYUTSU APPLICATION FORM — Gmail setup

The application form sends POST /api/apply to server.js.
Email credentials stay only on the server and are never embedded in HTML/JS.

1. Install Node.js 18+.
2. In this folder run: npm install
3. For the Gmail account, turn on 2-Step Verification and create a Google "App Password".
4. Set these environment variables on your hosting service:
   GMAIL_USER = Gmail address used to send
   GMAIL_APP_PASSWORD = App Password (not the normal Gmail password)
   GMAIL_TO = Gmail address that should receive applications
5. Run: npm start
6. Open /application.html and submit a test application.

For local testing on macOS/Linux:
GMAIL_USER="...@gmail.com" GMAIL_APP_PASSWORD="..." GMAIL_TO="...@gmail.com" npm start

IMPORTANT:
- Do not put an App Password in HTML, script.js, GitHub, or any public repository.
- Static-only hosting cannot execute /api/apply. Use hosting that can run this Node server, or convert the endpoint to a serverless function.


受信先: kyutsubb2024@gmail.com
Gmailの通常パスワードは使用・共有しないでください。Googleアカウント側で発行したアプリパスワードをGMAIL_APP_PASSWORDに設定します。
