const qs=(s,root=document)=>root.querySelector(s);
const escapeNews=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const makeNewsHref=id=>'news.html?article='+encodeURIComponent(id);
function renderNewsRow(article){
 const {id,date,category,title,image}=article;
 return `<a class="homeNewsItem" href="${makeNewsHref(id)}">${image?`<img class="homeNewsThumb" loading="lazy" src="${escapeNews(image)}" alt="">`:''}
 <div class="homeNewsItemBody"><div class="homeNewsMeta">${escapeNews(date)}　/　${escapeNews(category)}</div><div class="homeNewsTitle">${escapeNews(title)}</div></div><span class="homeNewsItemArrow">›</span></a>`;
}
(async()=>{
 const home=qs('#homeNewsItems'),list=qs('#newsListing'),detail=qs('#newsDetail');
 if(!home&&!list&&!detail)return;
 try{
  const res=await fetch('/api/news');
  if(!res.ok)throw Error('news api');
  const data=await res.json();
  if(!Array.isArray(data))throw Error('bad news data');
  if(home)home.innerHTML=data.length?data.slice(0,3).map(renderNewsRow).join(''):'<p class="newsEmpty">ニュースは準備中です。</p>';
  if(list)list.innerHTML=data.length?data.map(renderNewsRow).join(''):'<p class="newsEmpty">ニュースは準備中です。</p>';
  if(detail){
    const id=new URLSearchParams(location.search).get('article');
    const a=data.find(x=>String(x.id)===String(id));
    if(!a)detail.innerHTML='<p class="newsEmpty">記事が見つかりません。</p>';
    else{
      document.title=a.title+' | KYUTSU BASEBALL CLUB';
      detail.innerHTML=`<p class="newsDetailMeta">${escapeNews(a.date)}　/　${escapeNews(a.category)}</p><h1>${escapeNews(a.title)}</h1>${a.image?`<img class="newsDetailImage" src="${escapeNews(a.image)}" alt="">`:''}<div class="newsDetailBody">${escapeNews(a.content).replace(/\n/g,'<br>')}</div><a class="newsBack" href="news.html">← NEWS一覧へ</a>`;
    }
  }
 }catch(e){
  const fail='<p class="newsEmpty">ニュースを取得できませんでした。時間をおいて再読み込みしてください。</p>';
  if(home)home.innerHTML=fail;
  if(list)list.innerHTML=fail;
  if(detail)detail.innerHTML=fail;
 }
})();
