import {json,parseCSV,fetchCSV} from './_shared.js';

export async function onRequestGet({env}) {
  const url=env.GOOGLE_NEWS_SHEET_CSV_URL;
  if(!url) return json([],200,60);
  try {
    const rows=parseCSV(await fetchCSV(url));
    if(rows.length<2)return json([],200,300);
    const headers=rows[0].map(x=>String(x).trim().toLowerCase());
    const get=(row,...keys)=>{
      const i=keys.map(k=>headers.indexOf(k.toLowerCase())).find(i=>i>=0);
      return i===undefined?'':String(row[i]??'').trim()
    };
    const articles=rows.slice(1).map((r,i)=>{
      const date=get(r,'date','日付'),category=get(r,'category','種類'),
      title=get(r,'title','タイトル'),content=get(r,'content','本文','内容'),
      image=get(r,'image_url','画像url','写真url'),visible=get(r,'visible','公開','表示').toLowerCase();
      return {id:i+1,date,category,title,content,image:/^https:\/\//i.test(image)?image:'',
        visible:!['false','0','off','no','非公開','非表示'].includes(visible)}
    }).filter(x=>x.visible&&x.title);
    articles.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return json(articles,200,300);
  }catch(e){
    console.error('news:',e);
    return json({error:'ニュースを読み込めませんでした'},503,0)
  }
}
