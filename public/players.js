const root = document.querySelector('#playerGroups');
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Spreadsheet accepts Japanese names and common English baseball abbreviations.
// Important: OF/IF were previously omitted, so those players landed in OTHER.
const GROUPS = [
  {key:'PITCHER', label:'PITCHER'},
  {key:'CATCHER', label:'CATCHER'},
  {key:'INFIELDER', label:'INFIELDER'},
  {key:'OUTFIELDER', label:'OUTFIELDER'},
  {key:'STAFF', label:'STAFF'},
  {key:'OTHER', label:'OTHER'}
];

function groupFor(position='') {
  const raw=String(position ?? '').normalize('NFKC').trim().toLowerCase();
  // Recognize compound strings such as "IF / OF" by the first declared position.
  const tokens=raw.split(/[,、/・\s]+/).filter(Boolean);
  const staff=/(スタッフ|監督|コーチ|マネージャー|代表|gm|staff|manager|coach|trainer|scorer)/i;
  const pitcher=/(投手|ピッチャー|pitcher|投捕)/i;
  const catcher=/(捕手|キャッチャー|catcher)/i;
  const infielder=/(内野|一塁|二塁|三塁|遊撃|ショート|ファースト|セカンド|サード|infielder|infield|first base|second base|third base|shortstop)/i;
  const outfielder=/(外野|左翼|中堅|右翼|レフト|センター|ライト|outfielder|outfield|left field|center field|right field)/i;
  function test(part) {
    if (staff.test(part) || /^(staff|mgr|manager|coach)$/.test(part)) return 'STAFF';
    if (pitcher.test(part) || /^(p|sp|rp|cp|投)$/.test(part)) return 'PITCHER';
    if (catcher.test(part) || /^(c|捕)$/.test(part)) return 'CATCHER';
    if (infielder.test(part) || /^(if|inf|1b|2b|3b|ss|内)$/.test(part)) return 'INFIELDER';
    if (outfielder.test(part) || /^(of|out|lf|cf|rf|外)$/.test(part)) return 'OUTFIELDER';
    return null;
  }
  const key=tokens.map(test).find(Boolean) || test(raw) || 'OTHER';
  return GROUPS.find(g=>g.key===key);
}

function card(p){
  const rawNo = String(p.number || '').trim();
  const no = esc(rawNo || '—');
  const display = esc(p.displayName || p.name || '');
  const playerPhoto = `assets/players/${encodeURIComponent(rawNo || 'unknown')}.jpg`;
  const finishedCard = `assets/player-cards/${encodeURIComponent(rawNo || 'unknown')}.jpg`;
  const pos = esc(p.position || 'PLAYER');
  const bats = p.batsThrows ? `<span class="profileThrows">${esc(p.batsThrows)}</span>` : '';
  const comment = p.comment ? `<p class="profileComment">${esc(p.comment)}</p>` : '';

  return `<article class="profileCard">
    <div class="profileVisual">
      <img class="profileCardArtwork" src="${finishedCard}" alt="${display} PLAYER PROFILE"
        onerror="this.remove();this.closest('.profileVisual').classList.add('useGenerated')">

      <div class="profileGenerated">
        <img class="profilePlayerPhoto" src="${playerPhoto}" alt="${display}"
          onerror="this.closest('.profileGenerated').classList.add('noPhoto');this.remove()">
        <span class="profileGhostNo">${no}</span>
        <span class="profileVerticalName">${display}</span>
        <div class="profileFallback"><b>${display}</b><span>#${no}</span></div>
        <div class="profileName">
          <strong>${display}</strong>
          <i></i>
          <span>${pos}</span>
        </div>
        <div class="profileNumber">${no}</div>
      </div>
    </div>
    <div class="profileExtra">${bats}${comment}</div>
  </article>`;
}

function render(players){
  if(!players.length){
    root.innerHTML='<p class="emptyRoster">PLAYER DATA COMING SOON.</p>';
    return;
  }
  const buckets = new Map(GROUPS.map(g=>[g.key,[]]));
  players.forEach(p=>buckets.get(groupFor(p.position).key).push(p));

  root.innerHTML = GROUPS.map((g,idx)=>{
    const list=buckets.get(g.key);
    if(!list.length)return '';
    return `<section class="positionGroup">
      <div class="positionHead">
        <span>${String(idx+1).padStart(2,'0')}</span>
        <h2>${g.label}</h2>
        <b>${String(list.length).padStart(2,'0')} PLAYERS</b>
      </div>
      <div class="profileGrid">${list.map(card).join('')}</div>
    </section>`;
  }).join('');
}

async function run(){
  try{
    const r=await fetch('/api/players',{headers:{accept:'application/json'}});
    if(r.ok){
      const data=await r.json();
      if(Array.isArray(data)&&data.length)return render(data);
    }
  }catch(e){}
  render(Array.isArray(window.KYUTSU_PLAYERS)?window.KYUTSU_PLAYERS:[]);
}
run();
