const json=(data,status=200,cache=300)=>new Response(JSON.stringify(data),{
 status,headers:{'content-type':'application/json; charset=utf-8','cache-control':`public, max-age=${cache}`,'access-control-allow-origin':'*'}
});
function parseCSV(csv){
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<csv.length;i++){
  const ch=csv[i],next=csv[i+1];
  if(ch==='"'){if(quoted&&next==='"'){field+='"';i++}else quoted=!quoted}
  else if(ch===','&&!quoted){row.push(field);field=''}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(field);field='';if(row.some(v=>String(v).trim()!==''))rows.push(row);row=[]}
  else field+=ch;
 }
 if(field.length||row.length){row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row)}
 return rows;
}
function normalizeDate(v){const m=String(v||'').trim().match(/(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);return m?`${m[1]}/${String(m[2]).padStart(2,'0')}/${String(m[3]).padStart(2,'0')}`:String(v||'').trim()}
function sheetRowsToResults(csv){
 const rows=parseCSV(csv);if(rows.length<2)return [];
 const h=rows[0].map(v=>String(v).trim().toLowerCase());
 const idx=(...names)=>{for(const n of names){const i=h.indexOf(n.toLowerCase());if(i>=0)return i}return -1};
 const c={date:idx('date','日付'),tournament:idx('tournament','competition','大会名'),opponent:idx('opponent','対戦相手'),kyutsu:idx('kyutsu_score','kyutsu得点','球通得点','得点'),opp:idx('opponent_score','相手得点','失点'),result:idx('result','勝敗'),logo:idx('opponent_logo','相手ロゴurl','ロゴurl')};
 const val=(r,i)=>i>=0?String(r[i]??'').trim():'';
 const out=rows.slice(1).map(r=>{
  const a=val(r,c.kyutsu),b=val(r,c.opp);let result=val(r,c.result);
  if(!result&&a!==''&&b!==''&&!Number.isNaN(+a)&&!Number.isNaN(+b))result=+a>+b?'勝ち':+a<+b?'負け':'引き分け';
  const logo=val(r,c.logo);
  return {date:normalizeDate(val(r,c.date)),tournament:val(r,c.tournament),opponent:val(r,c.opponent),score:a!==''&&b!==''?`${a}-${b}`:'',result,opponentLogo:/^(https?:\/\/|assets\/opponents\/[a-zA-Z0-9_.-]+$)/i.test(logo)?logo:null}
 }).filter(r=>r.date&&r.opponent&&r.score);
 return out.sort((a,b)=>new Date(b.date.replaceAll('/','-'))-new Date(a.date.replaceAll('/','-')))
}
function sheetRowsToPlayers(csv){
 const rows=parseCSV(csv);if(rows.length<2)return [];
 const h=rows[0].map(v=>String(v).trim().toLowerCase());
 const idx=(...names)=>{for(const n of names){const i=h.indexOf(n.toLowerCase());if(i>=0)return i}return -1};
 const c={number:idx('number','背番号'),name:idx('name','名前','選手名'),displayName:idx('display_name','表示名','英字名'),position:idx('position','ポジション'),batsThrows:idx('bats_throws','投打'),comment:idx('comment','一言','コメント'),active:idx('active','在籍状況','表示')};
 const val=(r,i)=>i>=0?String(r[i]??'').trim():'';
 return rows.slice(1).map(r=>({number:val(r,c.number),name:val(r,c.name),displayName:val(r,c.displayName),position:val(r,c.position),batsThrows:val(r,c.batsThrows),comment:val(r,c.comment),active:!['0','false','off','非表示','退団','inactive'].includes(val(r,c.active).toLowerCase())})).filter(p=>p.number&&p.name&&p.active).sort((a,b)=>(+a.number||9999)-(+b.number||9999))
}
async function fetchCSV(url){
 if(!url||!/^https:\/\/docs\.google\.com\/spreadsheets\//.test(url))throw Error('Google Sheets CSV URL is missing or invalid');
 const r=await fetch(url,{headers:{accept:'text/csv,text/plain,*/*'}});
 if(!r.ok)throw Error('Google Sheets fetch failed: '+r.status);
 const csv=await r.text();if(csv.trim().startsWith('<!doctype')||csv.includes('<html'))throw Error('Google Sheets returned HTML; check link sharing');
 return csv;
}
function decodeXml(s){return String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))}
function xmlTag(block,tag){const safe=tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=String(block||'').match(new RegExp('<'+safe+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+safe+'>','i'));return m?decodeXml(m[1]).trim():''}
function textOnly(s){return decodeXml(String(s||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()}
function noteImage(block){
 const direct=xmlTag(block,'media:thumbnail');if(/^https?:\/\//i.test(direct))return direct;
 let m=String(block||'').match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);if(m)return decodeXml(m[1]);
 m=String(block||'').match(/<media:content[^>]+url=["']([^"']+)["']/i);if(m)return decodeXml(m[1]);
 m=String(block||'').match(/<enclosure[^>]+url=["']([^"']+)["']/i);if(m)return decodeXml(m[1]);
 const body=xmlTag(block,'content:encoded')||xmlTag(block,'description');m=String(body||'').match(/<img[^>]+src=["']([^"']+)["']/i);return m?decodeXml(m[1]):'';
}
async function noteOgImage(url){
 if(!/^https:\/\/note\.com\//i.test(String(url||'')))return '';
 try{const r=await fetch(url,{headers:{accept:'text/html'}});if(!r.ok)return '';const html=await r.text();let m=html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);if(!m)m=html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);return m?decodeXml(m[1]):''}catch{return ''}
}
function parseNoteRss(xml){return [...String(xml||'').matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0,3).map(m=>{const block=m[0];const title=textOnly(xmlTag(block,'title'));const link=xmlTag(block,'link')||xmlTag(block,'guid');const pubDate=xmlTag(block,'pubDate');const excerpt=textOnly(xmlTag(block,'description')||xmlTag(block,'content:encoded')).slice(0,140);return {title,link,pubDate,image:noteImage(block),excerpt}}).filter(x=>x.title&&x.link)}
export {json,parseCSV,sheetRowsToResults,sheetRowsToPlayers,fetchCSV,parseNoteRss,noteOgImage};
