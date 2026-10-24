const FALLBACK_RESULTS=[
  {date:'2026/09/27',tournament:'VICTORIA LEAGUE',opponent:'SAVERS',score:'2-3',result:'負け'},
  {date:'2026/04/12',tournament:'OPEN GAME',opponent:'GDO',score:'2-1',result:'勝ち'},
  {date:'2026/04/12',tournament:'OPEN GAME',opponent:'江戸川GLITTERS',score:'1-7',result:'負け'},
  {date:'2026/04/05',tournament:'OPEN GAME',opponent:'シモックナイン',score:'7-3',result:'勝ち'},
  {date:'2026/03/29',tournament:'OPEN GAME',opponent:'routees',score:'5-0',result:'勝ち'}
];

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const score=v=>{const m=String(v||'').match(/(\d+)\s*[-–—]\s*(\d+)/);return m?[Number(m[1]),Number(m[2])]:[null,null]};
const outcome=v=>String(v||'').includes('勝')?'WIN':String(v||'').includes('負')?'LOSE':String(v||'').toUpperCase().includes('WIN')?'WIN':String(v||'').toUpperCase().includes('LOSE')?'LOSE':'DRAW';
const yearOf=r=>{const m=String(r.date||'').match(/(20\d{2})/);return m?m[1]:'—'};
const dateLabel=v=>String(v||'').replaceAll('/','.').replaceAll('-','.');

let allRows=[],activeYear='',activeFilter='ALL';

function opponentImage(r){const name=String(r.opponent||'?');const src=String(r.opponentLogo||'');const good=/^https?:\/\//i.test(src)||/^assets\/opponents\/[a-zA-Z0-9_.-]+$/.test(src);return good?`<img src="${esc(src)}" alt="${esc(name)}" onerror="this.remove()">`:esc(name.slice(0,1));}
function card(r){
 const [a,b]=score(r.score),o=outcome(r.result),opponent=esc(r.opponent||'OPPONENT');
 return `<article class="archiveCard">
 <div class="archiveTop"><b>GAME RESULT</b><span>${esc(dateLabel(r.date))}</span></div>
 <div class="archiveTournament">${esc(r.tournament||r.competition||'GAME')}</div>
 <div class="archiveScore kyutsuStackScore">
 <div class="archiveClub"><div class="archiveIdentity"><span class="archiveMark"><img src="assets/kyutsu-logo.png" alt="KYUTSU"></span><small>KYUTSU</small></div><strong>${a??'–'}</strong></div>
 <div class="archiveDash"></div>
 <div class="archiveClub opponent"><div class="archiveIdentity"><span class="archiveOpponentMark${r.opponentLogo?' hasLogo':''}">${opponentImage(r)}</span><small>${opponent}</small></div><strong>${b??'–'}</strong></div>
 </div><div class="archiveBottom"><b class="${o.toLowerCase()}">${o}</b></div></article>`;
}
function updateStats(rows){
  const games=rows.length;
  const win=rows.filter(r=>outcome(r.result)==='WIN').length;
  const lose=rows.filter(r=>outcome(r.result)==='LOSE').length;
  const draw=rows.filter(r=>outcome(r.result)==='DRAW').length;
  const pct=games?Math.round((win/games)*100):0;
  document.getElementById('seasonStats').innerHTML=`
    <div class="stat"><span>GAMES</span><strong>${games}</strong></div>
    <div class="stat"><span>WIN</span><strong>${win}</strong></div>
    <div class="stat"><span>LOSE</span><strong>${lose}</strong></div>
    <div class="stat"><span>DRAW</span><strong>${draw}</strong></div>
    <div class="stat"><span>WIN %</span><strong>${pct}</strong></div>`;
}

function render(){
  const seasonRows=allRows.filter(r=>yearOf(r)===activeYear);
  updateStats(seasonRows);

  const rows=activeFilter==='ALL'?seasonRows:seasonRows.filter(r=>outcome(r.result)===activeFilter);
  document.getElementById('archiveCount').textContent=`${String(rows.length).padStart(2,'0')} GAMES / ${activeYear} SEASON`;
  document.getElementById('allResults').innerHTML=rows.length?rows.map(card).join(''):'<div class="emptyResults">NO RESULTS.</div>';
}

function buildYears(){
  const years=[...new Set(allRows.map(yearOf).filter(y=>y!=='—'))].sort((a,b)=>b.localeCompare(a));
  activeYear=years[0]||String(new Date().getFullYear());
  document.getElementById('seasonTabs').innerHTML=years.map((y,i)=>`<button class="seasonBtn${i===0?' active':''}" data-year="${y}">${y} SEASON</button>`).join('');
  document.querySelectorAll('.seasonBtn').forEach(btn=>btn.addEventListener('click',()=>{
    activeYear=btn.dataset.year;
    document.querySelectorAll('.seasonBtn').forEach(x=>x.classList.toggle('active',x===btn));
    render();
  }));
}

document.querySelectorAll('.resultFilter').forEach(btn=>btn.addEventListener('click',()=>{
  activeFilter=btn.dataset.filter;
  document.querySelectorAll('.resultFilter').forEach(x=>x.classList.toggle('active',x===btn));
  render();
}));

async function run(){
  let rows=FALLBACK_RESULTS;
  try{
    const r=await fetch('/api/results',{headers:{accept:'application/json'}});
    if(r.ok){
      const d=await r.json();
      if(Array.isArray(d)&&d.length)rows=d;
    }
  }catch(e){}
  allRows=[...rows].sort((x,y)=>new Date(String(y.date).replaceAll('/','-'))-new Date(String(x.date).replaceAll('/','-')));
  buildYears();
  render();
}
run();
