const cookieName = '__Host-kyutsu-viewer';
const adminCookieName = '__Host-kyutsu-admin';
const sessionSeconds = 60 * 60 * 24 * 7;

async function signingKey(env) {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(env.SESSION_SECRET + ':' + env.VIEW_PASSWORD),
    {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']
  );
}

async function createSession(env) {
  const expires = String(Math.floor(Date.now() / 1000) + sessionSeconds);
  const signature = await crypto.subtle.sign('HMAC', await signingKey(env), new TextEncoder().encode(expires));
  return expires + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hasSession(request, env) {
  if (!env.SESSION_SECRET || !env.VIEW_PASSWORD) return false;
  const token = request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith((env.COOKIE_NAME || cookieName) + '='))?.slice((env.COOKIE_NAME || cookieName).length + 1);
  if (!token) return false;
  const [expires, signature] = token.split('.');
  const now = Math.floor(Date.now() / 1000);
  if (!/^\d+$/.test(expires) || Number(expires) < now || Number(expires) > now + sessionSeconds) return false;
  try {
    const bytes = Uint8Array.from(atob(signature), char => char.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', await signingKey(env), bytes, new TextEncoder().encode(expires));
  } catch {
    return false;
  }
}

function passwordPage(message = '', status = 200, isAdmin = false) {
  return new Response(`<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>球通BC メンバー専用</title>
<style>*{box-sizing:border-box}body{margin:0;background:#101e35;color:#17263b;font:15px/1.8 Arial,sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}main{width:100%;max-width:390px;background:white;border-radius:12px;padding:32px}img{width:95px;height:95px;object-fit:contain;display:block;margin:0 auto 18px}h1{font-size:21px;margin:0 0 8px;text-align:center}p{font-size:12px;color:#687587}label{display:block;margin-top:22px}input,button{width:100%;font:inherit;padding:12px;border-radius:5px}input{border:1px solid #a7b3c0;margin:7px 0 16px}button{border:0;background:#101e35;color:white;cursor:pointer}.error{color:#a52626}a{color:#687587;font-size:11px}</style></head>
<body><main><img src="/handbook/logo.png" alt="球通BC"><h1>MEMBER HANDBOOK</h1><p>${isAdmin ? '管理者用パスワードを入力してください。' : 'チーム共通のパスワードを入力してください。'}</p>
<form method="post" action="${isAdmin ? '/handbook/admin-login' : '/handbook/viewer-login'}"><label for="password">${isAdmin ? '管理者パスワード' : '閲覧パスワード'}</label>
<input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128">
<button type="submit">${isAdmin ? '管理画面を開く' : 'ハンドブックを開く'}</button></form><p class="error" role="alert">${message}</p>
<p>この端末で7日間閲覧できます。</p><a href="/handbook/admin" target="_top">管理者ログイン</a></main></body></html>`,
    {status, headers:{...noCache,'Content-Type':'text/html; charset=utf-8',
      'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; form-action 'self'; frame-ancestors 'none'",
      'X-Robots-Tag':'noindex, nofollow, noarchive'}});
}

async function login(request,env,url,isAdmin = false) {
  const loginPage = (message, status) => passwordPage(message,status,isAdmin);
  if (!env.VIEW_PASSWORD || !env.SESSION_SECRET) return loginPage('閲覧設定を準備中です。',503);
  if (request.headers.get('origin') !== url.origin) return loginPage('ページを開き直してください。',403);
  if (Number(request.headers.get('content-length') || 0) > 1024) return loginPage('入力が長すぎます。',413);
  const body = await request.text();
  if (body.length > 1024) return loginPage('入力が長すぎます。',413);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));
  const bucket = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('') + ':' + Math.floor(Date.now()/600000);
  const attempt = await env.DB.prepare('INSERT INTO viewer_login_attempts (bucket, attempts) VALUES (?, 1) ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(bucket).first();
  if (attempt.attempts > 15) return loginPage('試行回数が多いため、10分ほど待ってからお試しください。',429);
  const password = new URLSearchParams(body).get('password') || '';
  const key = await signingKey(env);
  const signature = await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(env.VIEW_PASSWORD));
  const matches = await crypto.subtle.verify('HMAC',key,signature,new TextEncoder().encode(password));
  if (!matches) return loginPage('パスワードを確認してください。',401);
  return new Response(null,{status:303,headers:{...noCache,Location:isAdmin ? '/handbook/admin' : '/handbook/',
    'Set-Cookie':(env.COOKIE_NAME || cookieName)+'='+await createSession(env)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+sessionSeconds}});
}
