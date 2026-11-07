const noCache = {'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff', 'X-Robots-Tag':'noindex, nofollow, noarchive'};
const json = (value,status=200) => Response.json(value,{status,headers:noCache});

function adminEnvironment(env) {
  return {...env, VIEW_PASSWORD:env.ADMIN_PASSWORD, COOKIE_NAME:adminCookieName};
}

function normalize(content) {
  const result = {};
  for (const [key,[,fields,required]] of Object.entries(sections)) {
    const value = content?.[key];
    if (!fields) {
      if (typeof value !== 'string' || value.length > 50000) throw new Error('本文が長すぎるか、形式が違います。');
      result[key] = value;
      continue;
    }
    if (!Array.isArray(value) || value.length > 2000) throw new Error('一覧の形式が違います。');
    result[key] = value.map(row => {
      if (!Array.isArray(row)) throw new Error('行の形式が違います。');
      const cells = fields.map((_,i) => row[i] ?? '');
      if (cells.some(cell => typeof cell !== 'string' || cell.length > 10000) ||
          required.some(i => !cells[i].trim())) throw new Error('必須項目と入力内容を確認してください。');
      if (['videos','reviews'].includes(key) && !/^\d{4}\/\d{2}\/\d{2}$/.test(cells[1])) {
        throw new Error('試合日は YYYY/MM/DD 形式で入力してください。');
      }
      return cells;
    });
  }
  return result;
}

async function getContent(env) {
  const row = await env.DB.prepare('SELECT revision, content FROM handbook WHERE id = 1').first();
  return row ? {revision:row.revision,content:{...seed,...JSON.parse(row.content)}} : {revision:0,content:seed};
}

export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/handbook(?=\/|$)/,'') || '/';
    const canEdit = await hasSession(request,adminEnvironment(env));
    const adminPath = ['/admin','/admin.js','/schema.js','/api/admin'].includes(path);
    if (adminPath && !canEdit) {
      if (path === '/admin') return passwordPage('',200,true);
      return json({error:'管理者パスワードが必要です。'},403);
    }
    try {
      if (path === '/admin-login' && request.method === 'POST') return await login(request,adminEnvironment(env),url,true);
      if (path === '/viewer-login' && request.method === 'POST') return await login(request,env,url);
      if (path !== '/logo.png' && !canEdit && !await hasSession(request,env)) {
        if (path === '/' || path === '/viewer-login') return passwordPage();
        return json({error:'閲覧パスワードを入力してください。'},401);
      }
      if (request.method === 'GET' && (path === '/api/admin' || path === '/data.js')) {
        const data = await getContent(env);
        if (path === '/api/admin') return json(data);
        return new Response('const DATA = '+JSON.stringify(data.content)+';\nconst CAN_EDIT = '+canEdit+';', {
          headers:{...noCache,'Content-Type':'text/javascript; charset=utf-8'}
        });
      }
      if (path === '/api/admin' && request.method === 'PUT') {
        if (request.headers.get('origin') !== url.origin ||
            request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
          return json({error:'ダッシュボードから保存してください。'},403);
        }
        const body = await request.text();
        if (body.length > 1000000) return json({error:'データ量が上限を超えています。'},413);
        let revision, content;
        try {
          const payload = JSON.parse(body);
          revision = payload.revision;
          if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('版情報が無効です。');
          content = normalize(payload.content);
        } catch (error) {
          return json({error:error.message},400);
        }
        const query = revision === 0
          ? env.DB.prepare('INSERT INTO handbook (id, revision, content) VALUES (1, 1, ?) ON CONFLICT(id) DO NOTHING').bind(JSON.stringify(content))
          : env.DB.prepare('UPDATE handbook SET revision = revision + 1, content = ? WHERE id = 1 AND revision = ?').bind(JSON.stringify(content),revision);
        const result = await query.run();
        if (!result.meta.changes) return json({error:'別の画面で更新されました。最新内容を開き直してください。'},409);
        return json({revision:revision+1,content});
      }
      const asset = Object.hasOwn(assets,path) && assets[path];
      if (request.method === 'GET' && asset) return new Response(asset[2] ? Uint8Array.from(atob(asset[0]), char => char.charCodeAt(0)) : asset[0], {
        headers:{...noCache,'Content-Type':asset[1]+'; charset=utf-8'}
      });
      return json({error:'ページが見つかりません。'},404);
    } catch (error) {
      console.error('Handbook request failed',error);
      return json({error:'データに接続できません。時間をおいて再度お試しください。'},503);
    }
  }
};
