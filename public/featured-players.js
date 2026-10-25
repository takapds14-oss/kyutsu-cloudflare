// Four featured players. Match existing spreadsheet records by surname,
// not jersey number, so changing numbers does not break the selection.
const featuredRoot=document.getElementById('featuredPlayers');
const featuredNames=[
 {name:'武井',aliases:['武井','たけい','タケイ','TAKEI']},
 {name:'吉村',aliases:['吉村','よしむら','ヨシムラ','YOSHIMURA']},
 {name:'加藤',aliases:['加藤','かとう','カトウ','KATO','KATOU']},
 {name:'藤本',aliases:['藤本','ふじもと','フジモト','FUJIMOTO']}
];
const safeFeatured=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normFeatured=s=>String(s??'').normalize('NFKC').replace(/[\s　・._-]/g,'').toLowerCase();
function featuredMatch(item,record){
 const names=[record.name,record.displayName];
 return names.some(name=>item.aliases.some(alias=>normFeatured(name).includes(normFeatured(alias))));
}
function featuredCard(item,player){
 const label=safeFeatured(player?.displayName||player?.name||item.name);
 const number=String(player?.number||'').trim();
 const pos=safeFeatured(player?.position||'KYUTSU BASEBALL CLUB');
 const shortName=safeFeatured(item.name);
 const body=`<div class="featuredFallback"><span class="featuredTop">PLAYER PROFILE / KYUTSU</span>
   ${number?`<span class="featuredNo">${safeFeatured(number)}</span>`:''}
   <div><div class="featuredSurname">${label}</div><div class="featuredPosition">${pos}</div></div></div>`;
 const art=number?`assets/player-cards/${encodeURIComponent(number)}.jpg`:null;
 const photo=number?`assets/players/${encodeURIComponent(number)}.jpg`:null;
 const inner=art?`<img class="featuredArt" src="${art}" alt="${label}" loading="lazy"
   onerror="this.onerror=null;this.src='${photo}';this.onerror=()=>{this.remove();this.closest('.featuredVisual').querySelector('.featuredFallback').hidden=false};">
   <div class="featuredFallback" hidden><span class="featuredTop">PLAYER PROFILE / KYUTSU</span><span class="featuredNo">${safeFeatured(number)}</span><div><div class="featuredSurname">${label}</div><div class="featuredPosition">${pos}</div></div></div>`:body;
 return `<a class="featuredPerson" href="players.html" aria-label="${shortName}の選手プロフィールを見る">
    <div class="featuredVisual">${inner}</div></a>`;
}
async function loadFeatured(){
 let roster=[];
 try{
  const r=await fetch('/api/players',{headers:{accept:'application/json'}});
  if(r.ok){const data=await r.json();if(Array.isArray(data))roster=data;}
 }catch(e){}
 featuredRoot.innerHTML=featuredNames.map(item=>{
  const player=roster.find(p=>featuredMatch(item,p));
  return featuredCard(item,player);
 }).join('');
}
if(featuredRoot)loadFeatured();
