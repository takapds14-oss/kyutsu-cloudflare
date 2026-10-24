(() => {
  const grid=document.querySelector('#noteStoryGrid');
  if(!grid)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=s=>{
    const d=new Date(s);
    if(Number.isNaN(d.getTime()))return '';
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };
  const card=(p,i)=>`<a class="noteStoryCard" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">
    <div class="noteStoryImage ${p.image?'':'noImage'}">${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:`<span>KYUTSU<br>NOTE</span>`}</div>
    <div class="noteStoryMeta"><span>${date(p.pubDate)}</span><b>0${i+1}</b></div>
    <h3>${esc(p.title)}</h3>
    ${p.excerpt?`<p>${esc(p.excerpt)}</p>`:''}
    <i>READ ON NOTE <span>↗</span></i>
  </a>`;
  fetch('/api/note',{headers:{accept:'application/json'}})
    .then(r=>{if(!r.ok)throw new Error('note');return r.json()})
    .then(posts=>{
      if(!Array.isArray(posts)||!posts.length)throw new Error('empty');
      grid.innerHTML=posts.slice(0,3).map(card).join('');
    })
    .catch(()=>{
      grid.innerHTML=`<a class="noteStoryCard noteFallback" href="https://note.com/kyutsubb_2026" target="_blank" rel="noopener noreferrer">
        <div class="noteStoryImage noImage"><span>KYUTSU<br>NOTE</span></div>
        <div class="noteStoryMeta"><span>OFFICIAL NOTE</span><b>↗</b></div>
        <h3>球通ベースボールクラブのnoteを見る</h3>
        <i>VIEW NOTE <span>↗</span></i>
      </a>`;
    });
})();