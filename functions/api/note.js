import {json,parseNoteRss,noteOgImage} from './_shared.js';
export async function onRequestGet(){
 try{
  const r=await fetch('https://note.com/kyutsubb_2026/rss',{headers:{accept:'application/rss+xml,application/xml,text/xml,*/*'}});
  if(!r.ok)throw Error('note RSS status '+r.status);
  const posts=parseNoteRss(await r.text());if(!posts.length)throw Error('no posts');
  const enriched=await Promise.all(posts.map(async p=>p.image?p:{...p,image:await noteOgImage(p.link)}));
  return json(enriched,200,1800)
 }catch(e){console.error('note:',e);return json({error:'noteを読み込めませんでした'},503,0)}
}
