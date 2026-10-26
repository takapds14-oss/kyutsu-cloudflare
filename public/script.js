const b=document.querySelector('.menu'),n=document.querySelector('#mobileSiteNav');
function setMobileMenu(open){
 if(!b||!n)return;
 n.classList.toggle('open',open);
 document.body.classList.toggle('mobileMenuOpen',open);
 b.setAttribute('aria-expanded',String(open));
 b.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');
 b.querySelector('span').textContent=open?'×':'☰';
 b.querySelector('small').textContent=open?'CLOSE':'MENU';
}
if(b&&n){
 b.onclick=()=>setMobileMenu(!n.classList.contains('open'));
 n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMobileMenu(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')setMobileMenu(false)});
 window.addEventListener('resize',()=>{if(window.innerWidth>720)setMobileMenu(false)});
}
const FALLBACK_RESULTS=[
 {date:'2026/09/27',opponent:'SAVERS',score:'2-3',result:'負け'},
 {date:'2026/04/12',opponent:'GDO',score:'1-2',result:'勝ち'},
 {date:'2026/04/12',opponent:'江戸川GLITTERS',score:'1-7',result:'負け'},
 {date:'2026/04/05',opponent:'シモックナイン',score:'3-7',result:'勝ち'},
 {date:'2026/03/29',opponent:'routees',score:'5-0',result:'勝ち'}
];
function normalizeScore(raw){const m=String(raw).match(/(\d+)\s*[-–—]\s*(\d+)/);return m?[m[1],m[2]]:['–','–']}
function resultEN(v){return String(v).includes('勝')?'WIN':String(v).includes('負')?'LOSE':'DRAW'}
function resultEsc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function opponentLogoMarkup(r,cls){const name=String(r.opponent||'?');const fallback=resultEsc(name.slice(0,1));const src=String(r.opponentLogo||'');const good=/^https?:\/\//i.test(src)||/^assets\/opponents\/[a-zA-Z0-9_.-]+$/.test(src);return `<span class="${cls}${good?' hasLogo':''}">${good?`<img src="${resultEsc(src)}" alt="${resultEsc(name)}" onerror="this.remove()">`:fallback}</span>`}
function card(r){const [a,c]=normalizeScore(r.score),out=resultEN(r.result);return `<article class="resultCard"><div class="resultTop"><span>GAME RESULT</span><span>${resultEsc(String(r.date).replaceAll('/','.'))}</span></div><div class="resultTournament">${resultEsc(r.tournament||r.competition||'大会名未登録')}</div><div class="resultScore kyutsuStackScore"><div class="club"><div class="teamIdentity"><span class="miniMark"><img src="assets/kyutsu-logo.png" alt="KYUTSU"></span><small>KYUTSU</small></div><strong>${resultEsc(a)}</strong></div><div class="scoreLine"></div><div class="club opponent"><div class="teamIdentity">${opponentLogoMarkup(r,'opponentMark')}<small>${resultEsc(r.opponent)}</small></div><strong>${resultEsc(c)}</strong></div></div><div class="resultBottom"><b class="${out.toLowerCase()}">${out}</b></div></article>`}
function renderResults(rows){const track=document.getElementById('resultTrack');if(!track)return;const data=(rows&&rows.length?rows:FALLBACK_RESULTS).slice(0,5);const html=data.map(card).join('');track.innerHTML=html+html}
async function loadResults(){try{const res=await fetch('/api/results',{headers:{accept:'application/json'}});if(!res.ok)throw 0;renderResults(await res.json())}catch(e){renderResults(FALLBACK_RESULTS)}}
loadResults();
const gallery=[
 ['assets/action01.webp','AT BAT'],['assets/action04.webp','ON THE MOUND'],['assets/action08.webp','DEFENSE'],['assets/action06.webp','READY'],['assets/action05.webp','INFIELD'],['assets/action09.webp','PITCH'],['assets/action10.webp','BATTER'],['assets/action07.webp','THROW'],['assets/action03.webp','ONE'],['assets/action02.webp','MOUND'],['assets/dugout.webp','DUGOUT'],['assets/huddle.webp','TOGETHER'],['assets/team.webp','THE CLUB'],['assets/lineup.webp','LINEUP'],['assets/bench.webp','BENCH']
];
const gt=document.getElementById('galleryTrack');if(gt){const set=gallery.map((x,i)=>`<figure class="g${(i%4)+1}"><img src="${x[0]}" alt="KYUTSU ${x[1]}" loading="lazy" decoding="async"><figcaption>${String(i+1).padStart(2,'0')} / ${x[1]}</figcaption></figure>`).join('');gt.innerHTML=set+set}
