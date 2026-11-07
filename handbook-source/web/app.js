const BASE='https://docs.google.com/spreadsheets/d/1l9Jlq4sM-nnSYnrsC9CSdJBDMHb8myhjz7YFFmb4syw/edit';
const pages={home:['ホーム','⌂','チームのことを、ここに。','規律も、仲間も、試合の記録も。球通の共通認識が集まる場所。'],rules:['行動ルール','≡','球通の、共通基準。','試合・運営・新入団。迷ったときに戻れる、チームの約束。'],policy:['2026行動目標','⚑','勝ち切る型を、つくる。','全員で理解し、再現する。2026シーズンの目標と進む方向。'],playbook:['PLAY BOOK','▤','判断とプレーの、共通基準。','守備・走塁・攻撃。球通の野球を、グラウンドで実行するために。'],members:['メンバー・背番号','♧','一人ひとりが、球通。','名前・背番号・ポジションから、仲間を探す。'],videos:['試合動画','▷','あの一球を、次につなぐ。','対戦相手や大会で探せる、試合映像のアーカイブ。'],reviews:['試合振り返り','↗','振り返りを、次の一勝へ。','できたことと、もっと良くできること。チームの学びを共有。'],roles:['コーディネーター','◎','チームを動かす、役割。','勝つ確率を上げるための、観点・判断基準・情報を共有する。'],links:['関連リンク','↗','いつもの場所へ、すぐに。','チーム運営に使うリンクを、ひとつの入口に。']};
const gids={home:1582696227,rules:17288450,members:1293346457,videos:0,reviews:166813681,policy:1579605973,roles:1651327107,links:1582696227};
const $=s=>document.querySelector(s),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external=(url,label,cls='')=>/^https:\/\//.test(url)?`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>`:'';
let current='home';
$('#nav').innerHTML=Object.entries(pages).map(([id,p])=>`<a href="#${id}" data-page="${id}"><i>${p[1]}</i>${p[0]}</a>`).join('');
const menuToggle = $('#menu-toggle');
const menuNav = $('#nav');

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});
menuNav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  if (menuToggle.getAttribute('aria-expanded') === 'true') menuToggle.focus();
  setMenuOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  setMenuOpen(false);
  menuToggle.focus();
});
window.addEventListener('hashchange', () => setMenuOpen(false));

const roster=DATA.roster,active=roster.filter(r=>r[1]!=='助っ人用'&&!r[3]);
function title(t,link,label='すべて見る'){return `<div class="sectiontitle"><h2>${t}</h2>${link?`<a href="#${link}">${label} →</a>`:''}</div>`}
function home(){return `<section class="hero"><div class="eyebrow">OUR STANDARD / 2026</div><h2>勝ち切る型を、つくる。</h2><p>「どう勝つか」を全員で理解し、再現できるチームへ。<br>勝つための準備・戦略・役割を共有し、球通らしさを形にする。</p><a href="#policy">2026行動目標を読む　→</a></section><div class="stats"><a href="#members" class="stat"><label>登録メンバー</label><strong>${active.length}<small>名</small></strong></a><a href="#videos" class="stat"><label>試合アーカイブ</label><strong>${DATA.videos.length}<small>試合</small></strong></a><a href="#rules" class="stat"><label>行動ルール</label><strong>${DATA.rules.length}<small>項目</small></strong></a></div>${title('すぐにアクセス')}<div class="quickgrid">${[['rules','≡','行動ルール','集合・出欠・チームの規律'],['members','♧','メンバー・背番号','名前とポジションを確認'],['videos','▷','試合動画','対戦相手から映像を探す'],['reviews','↗','試合振り返り','GOOD / MOREを共有']].map(x=>`<a href="#${x[0]}" class="quick"><i>${x[1]}</i><span class="arrow">↗</span><h3>${x[2]}</h3><p>${x[3]}</p></a>`).join('')}</div><div class="twocol"><section>${title('まず確認したいこと','rules','ルールへ')}<div class="panel">${DATA.rules.filter(r=>['出欠管理','試合前のスケジュール','teamsへ試合結果個人結果を入力'].includes(r[1])).map(r=>'<details><summary>'+e(r[1])+'</summary><div class="detail">'+e(r[2])+'</div></details>').join('') || '<a href="#rules">行動ルールを確認 →</a>'}${external('https://teams.one/teams/kyutsu/community','teamsを開く','linkbutton')}</div></section><section>${title('試合映像を見返す','videos','一覧へ')}<div class="panel">${DATA.videos.slice().sort((a,b)=>b[1].localeCompare(a[1])).slice(0,3).map(r=>`<a href="#videos" class="lineitem"><span><small>${e(r[1])} / ${e(r[2]||'大会未記入')}</small><br>vs ${e(r[3])}</span><span>▷</span></a>`).join('')}<p class="sub" style="margin-top:15px">試合日が新しい順に表示しています。</p></div></section></div>`}
function controls(placeholder,opts=[]){return `<div class="toolbar"><input id="search" type="search" aria-label="${placeholder}" placeholder="${placeholder}">${opts.map(([id,label,values])=>`<select id="${id}" aria-label="${label}"><option value="">${label}</option>${values.map(v=>`<option>${e(v)}</option>`).join('')}</select>`).join('')}</div><div id="results"></div>`}
function memberPage(){return `<p class="sub">登録メンバー ${active.length}名。休部・退団・助っ人用の記載も確認できます。空き番号の確定は管理者へ。</p>${controls('名前・背番号・ポジションで検索',[['status','通常在籍',[ 'すべて','休部','退団','助っ人用']]])}`}
function membersRender(){let q=$('#search').value.trim().toLowerCase(),status=$('#status').value;let rows=roster.filter(r=>(status==='すべて'||(status==='助っ人用'?r[1]==='助っ人用':status?r[3]===status:!r[3]&&r[1]!=='助っ人用'))&&r.join(' ').toLowerCase().includes(q));$('#results').innerHTML=`<div class="count">${rows.length} 件</div><div class="listgrid players">${rows.map(r=>`<article class="player"><span class="num">${e(r[0])}</span><div class="en">${e(r[2]||'KYUTSU BC')}</div><h3>${e(r[1])}</h3><p>${e(r[4]||'ポジション未記入')}</p>${r[5]?`<p>SUB / ${e(r[5])}</p>`:''}<span class="badge">${e(r[3]|| (r[1]==='助っ人用'?'助っ人用':'登録'))}</span></article>`).join('')||'<div class="empty">条件に合うメンバーが見つかりません。</div>'}</div>`}
function videosRender(){let q=$('#search').value.trim().toLowerCase(),t=$('#tournament').value,year=$('#year').value;let rows=DATA.videos.filter(r=>r.join(' ').toLowerCase().includes(q)&&(!t||r[2]===t)&&(!year||r[1].startsWith(year))).sort((a,b)=>b[1].localeCompare(a[1]));$('#results').innerHTML=`<div class="count">${rows.length} 試合 / 日付の新しい登録から表示</div><div class="listgrid">${rows.map(r=>{let urls=r[4].match(/https:\/\/youtu\.be\/[\w-]+/g)||[],labels=r[4].match(/【([^】]+)】/g)||[];return `<article class="videocard"><div class="videohead"><div class="label">${e(r[2]||'大会未記入')}</div><span>${e(r[1])}</span><b>▷</b></div><div class="videobody"><h3>vs ${e(r[3])}</h3><div class="links">${urls.length?urls.map((u,i)=>external(u,labels[i]?.replace(/[【】]/g,'')||'動画を見る')).join(''):'<span class="sub">動画URL未登録</span>'}</div></div></article>`}).join('')||'<div class="empty">条件に合う試合が見つかりません。</div>'}</div>`}
function rulesRender(){let q=$('#search').value.trim().toLowerCase(),group=$('#group').value;let rows=DATA.rules.filter(r=>(!group||r[0]===group)&&r.join(' ').toLowerCase().includes(q));$('#results').innerHTML=`<div class="count">${rows.length} 項目 / タップして詳細を確認</div>`+[...new Set(rows.map(r=>r[0]))].map(g=>`<section class="rulegroup"><h2>${e(g)}</h2>${rows.filter(r=>r[0]===g).map(r=>`<details ${q?'open':''}><summary>${e(r[1])}<small>${e(r[5])}</small></summary><div class="detail">${e(r[2])}<div class="meta">意図・背景：${e(r[3])}<br>主なシーン：${e(r[4])} / オーナー：${e(r[5])}</div></div></details>`).join('')}</section>`).join('')+(rows.length?'':'<div class="empty">条件に合うルールが見つかりません。</div>')}
function reviews(){return DATA.reviews.slice().reverse().map(r=>`<article class="panel review"><div class="label">${e(r[1])} / ${e(r[2])}</div><h3>vs ${e(r[3])}</h3><div class="reviewcols"><div><div class="label">GOOD / できたこと</div><p>${e(r[5]||'振り返り未記入')}</p></div><div><div class="label">MORE / 次に向けて</div><p>${e(r[6]||'振り返り未記入')}</p></div></div>${external(r[4],'試合結果を見る','linkbutton')}</article>`).join('')}
function policy(){return `<div class="goalgrid">${[['品川区2部','優勝','都大会ベスト4進出'],['Victoria 4部','優勝','プロスタ決勝の実現'],['年間勝率','60%','40試合で24勝ライン'],['チーム平均得点','4点','1点を積み重ねる']].map(x=>`<div class="panel"><span class="sub">${x[0]}</span><b>${x[1]}</b><span class="sub">${x[2]}</span></div>`).join('')}</div><details open><summary>2026行動目標の全文<small>チーム方針</small></summary><div class="detail policy">${e(DATA.policy)}</div></details>`}
function links(){return `<div class="linklist">${DATA.index.map(r=>{let url=r[3].match(/^https:\/\/\S+/)?.[0];let internal={'試合動画ストック':'videos','コーディネーター':'roles','背番号管理':'members'}[r[1]];return `<div class="panel"><div class="label">${e(r[2]||'KYUTSU BC')}</div><h3>${e(r[1])}</h3><p class="sub">${e(r[4]||'')}</p><div style="margin-top:15px">${url?external(url,'開く','linkbutton'):internal?`<a href="#${internal}" class="linkbutton">ページを開く →</a>`:`${'<span class="sub">リンク未登録</span>'}`}</div></div>`}).join('')}</div>`}
function render(){current=location.hash.slice(1);if(!pages[current])current='home';let p=pages[current];$('#crumb').textContent=p[0];$('#heading').textContent=p[2];$('#intro').textContent=p[3];$('#source').hidden=!CAN_EDIT;document.querySelectorAll('nav a').forEach(a=>{a.classList.toggle('active',a.dataset.page===current);a.dataset.page===current ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current')});let html=current==='home'?home():current==='members'?memberPage():current==='videos'?controls('対戦相手・大会名で検索',[['year','すべての年',[...new Set(DATA.videos.map(r=>r[1].slice(0,4)))].sort().reverse()],['tournament','すべての大会',[...new Set(DATA.videos.map(r=>r[2]).filter(Boolean))]]]):current==='rules'?controls('ルール・キーワードで検索',[['group','すべての区分',[...new Set(DATA.rules.map(r=>r[0]))]]]):current==='playbook'?playbook():current==='reviews'?reviews():current==='policy'?policy():current==='roles'?`<div class="panel"><div class="label">COORDINATOR / 2026</div><h2 style="font-size:20px">コーディネーターの定義</h2><p class="policy">${e(DATA.roles)}</p><p class="sub" style="margin-top:20px">各部門の担当は「2026行動目標」の記載を確認してください。</p><a href="#policy" class="linkbutton" style="margin-top:15px">2026行動目標を読む →</a></div>`:links();$('#content').innerHTML=html;let fn={members:membersRender,videos:videosRender,rules:rulesRender}[current];if(fn){$('#content').querySelectorAll('input,select').forEach(i=>i.addEventListener('input',fn));fn()}window.scrollTo(0,0)}
addEventListener('hashchange',render);render();

function playbook() {
  const chapters = DATA.playbook.split(/\n⸻\n/).map(chapter => chapter.trim()).filter(Boolean);
  return '<div class="playbook-head"><img src="/handbook/logo.png" alt="球通BCロゴ"><div><div class="eyebrow">KYUTSU BASEBALL CLUB</div><h2>PLAY BOOK</h2><p class="sub">球通BCの野球・判断・プレー基準</p></div></div>' +
    chapters.map((chapter,index) => {
      const lines = chapter.split('\n');
      const headingIndex = lines.findIndex(line => /^\d+｜/.test(line));
      const heading = headingIndex >= 0 ? lines[headingIndex] : 'PLAY BOOK';
      const body = lines.slice(headingIndex + 1).join('\n').trim().replace(/\n{3,}/g,'\n\n');
      return '<details' + (index === 0 ? ' open' : '') + '><summary>' + e(heading) +
        '</summary><div class="detail playbook-body">' + e(body).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>') + '</div></details>';
    }).join('');
}
