const TRACK_SPACE_COLORS=['#DF76A5','#FED42C','#558B07','#599CCF','#E94107','#EB8212','#8D55CE','#20A1BF'];

function trackLabel(track){return track==='wild'?'Wild Wilds':'Mild Mile'}
function trackSelect(){
  return ['mild','wild'].map(track=>'<option value="'+track+'" '+(track===referee.config(state)?'selected':'')+'>'+trackLabel(track)+'</option>').join('');
}

function dieSvg(n){
  const pips={
    1:[[12,12]],
    2:[[7,7],[17,17]],
    3:[[7,7],[12,12],[17,17]],
    4:[[7,7],[17,7],[7,17],[17,17]],
    5:[[7,7],[17,7],[12,12],[7,17],[17,17]],
    6:[[7,6],[17,6],[7,12],[17,12],[7,18],[17,18]]
  }[n]||[];
  return '<svg class="die-pips" viewBox="0 0 24 24" aria-hidden="true">'+
    pips.map(([cx,cy])=>'<circle cx="'+cx+'" cy="'+cy+'" r="2.3" fill="currentColor"/>').join('')+
    '</svg>';
}

function medalSvg(rank){
  const fill=rank===1?'#180A03':rank===2?'#FFFFFF':'#180A03';
  const textFill=rank===1?'#FED42C':rank===2?'#8D55CE':'#FCFBED';
  return '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">'+
    '<circle cx="12" cy="10" r="7.5" fill="'+fill+'"/>'+
    '<path d="M8 16l-2 6 6-2 6 2-2-6" stroke="'+fill+'" stroke-width="2.2" fill="none"/>'+
    '<text x="12" y="13.5" text-anchor="middle" fill="'+textFill+'" font-size="10" font-weight="800" font-family="Titan One, Arial Black, sans-serif">'+rank+'</text>'+
    '</svg>';
}

function tablePre(){
  const suggestion=state.nextStarter===undefined
    ?'Tentukan pemain pertama dari roll-off di meja.'
    :'Usulan pemain pertama mengikuti posisi atau eliminasi race sebelumnya.';
  const awards=referee.medals[Math.min(state.round,4)-1];
  const track=referee.config(state);
  const firstIdx=state.nextStarter??0;
  const order=state.players.map((_,k)=>(firstIdx+k)%state.players.length);
  const preNotes=order.filter(i=>athlete(state.players[i]).pre);
  const raceColors=raceTokenColors(state.players);

  return heading('SIAPKAN RACE '+state.round,suggestion,'PRE-RACE · '+trackLabel(track).toUpperCase())+
    '<form class="panel" id="start">'+
      '<div class="grid-2">'+
        field('Lintasan','<select name="track">'+trackSelect()+'</select>')+
        field('Pemain pertama','<select name="first">'+state.players.map((p,i)=>'<option value="'+i+'" '+(i===state.nextStarter?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select>')+
      '</div>'+
      '<p class="muted" style="margin:6px 0 8px">Wild: warna provisional, menunggu referensi track fisik. Mild Mile memakai teal DNA (#20A1BF).</p>'+
      '<div id="prerace-track-note" class="track-card '+(track==='wild'?'wild':'mild')+'">'+
        '<strong style="font-family:var(--font-display);font-size:18px">'+trackLabel(track)+'</strong><br>'+
        '<span>'+(track==='wild'
          ?'Bintang (+1 poin) · Batu (tersandung) · Panah (geser posisi & picu reaksi)'
          :'Lintasan mulus 30 petak tanpa efek petak khusus.')+'</span>'+
        (track==='wild'?'<br><small>Catatan: Wild memakai warna provisional (#F46D57), menunggu referensi foto sisi balik track fisik.</small>':'')+
      '</div>'+
      '<div class="row" style="margin:10px 0 14px">'+
        '<span class="pill pill-teal">Finis #1 · <span class="num-display">+'+awards[0]+'</span> poin</span>'+
        '<span class="pill pill-purple">Finis #2 · <span class="num-display">+'+awards[1]+'</span> poin</span>'+
      '</div>'+
      (preNotes.length?'<div class="track-card" style="background:var(--color-secondary)"><strong>Perlu tindakan sebelum race:</strong> '+preNotes.map(i=>esc(athlete(state.players[i]).name)+' ('+esc(state.players[i].name)+')').join(', ')+'</div>':'')+
      '<h2 style="margin-top:14px">Lineup di Start</h2>'+
      '<div class="grid">'+order.map((i,pos)=>{
        const p=state.players[i], a=athlete(p), c=raceColors[i];
        const eff=rules.filter(([k])=>a[k]).map(([k,l])=>l+': '+a[k]).join(' · ');
        return '<div class="lineup-item">'+
          '<div class="racer-mini-band" style="background:'+c+'"></div>'+
          '<div class="row spread"><span class="row" style="gap:8px"><span class="racer-init-chip" style="background:'+c+';color:'+racerFg(c)+'" aria-hidden="true">'+esc((a.name||'?')[0])+'</span><strong style="font-family:var(--font-display);font-size:17px">'+esc(a.name)+'</strong></span><span class="pill pill-muted">Urutan <span class="num-display">#'+(pos+1)+'</span></span></div>'+
          '<span class="muted">Pemain: '+esc(p.name)+'</span>'+
          (a.pre?'<span class="pill pill-orange" style="align-self:flex-start">Pre-race: '+esc(a.pre)+'</span>':'')+
          (eff&&!a.pre?'<small>'+esc(eff)+'</small>':'')+
        '</div>';
      }).join('')+'</div>'+
      '<p style="margin-top:16px"><button class="primary btn-block">RACE!</button></p>'+
    '</form>';
}

function targetContextForTask(t,g){
  const spaces=new Set(), racers=new Set();
  if(!t||!g)return {spaces,racers};
  if(t.type==='duel'){
    racers.add(t.i);racers.add(t.j);
    spaces.add(g.pos[t.i]);
  }
  if(t.type==='choice'){
    for(const c of t.choices){
      const first=c.tasks?.[0];
      if(!first)continue;
      if(first.type==='ride'){
        const added=first.dest?.find(d=>d.rider);
        if(added){
          racers.add(added.i);
          spaces.add(g.pos[added.i]);
          spaces.add(added.p);
        }
        for(const d of first.dest||[]){
          if(!d.rider&&g.pos[d.i]!==d.p){racers.add(d.i);spaces.add(d.p)}
        }
      }
      if(first.type==='ability'){
        for(const sub of first.tasks||[]){
          if(sub.type==='swap'){racers.add(sub.i);racers.add(sub.j);spaces.add(g.pos[sub.i]);spaces.add(g.pos[sub.j])}
          if(sub.type==='pull'){racers.add(sub.j);spaces.add(g.pos[sub.j]);spaces.add(g.pos[sub.i])}
          if(sub.type==='arrive'&&sub.dest){for(const d of sub.dest)spaces.add(d.p)}
        }
      }
      if(first.type==='duel'){racers.add(first.i);racers.add(first.j);spaces.add(g.pos[first.i])}
      if(first.type==='pickCopy'){racers.add(first.i);racers.add(first.j);spaces.add(g.pos[first.j])}
    }
  }
  return {spaces,racers};
}

function renderChoiceTask(t,g){
  const active=state.active;
  const choices=t.choices||[];
  const isReroll=choices.some(c=>c.tasks?.[0]?.type==='reroll');
  const isSuckerfish=choices.some(c=>c.tasks?.[0]?.type==='ride');
  const isFlipFlop=choices.some(c=>c.tasks?.[0]?.type==='ability'&&c.tasks[0].label==='Flip Flop');
  const isGuess=choices.some(c=>c.tasks?.[0]?.type==='setGuess');

  if(isSuckerfish){
    const rideChoice=choices.find(c=>c.tasks?.[0]?.type==='ride');
    const rideTask=rideChoice?.tasks[0];
    const rider=rideTask?.dest?.find(d=>d.rider);
    const riderIdx=rider?.i;
    const ownerName=riderIdx!==undefined?state.players[riderIdx].name:'Pemain Suckerfish';
    const riderName=riderIdx!==undefined?referee.name(state,riderIdx):'Suckerfish';
    const originPos=riderIdx!==undefined?referee.display(g.pos[riderIdx]):'';
    const destPos=rider?referee.display(rider.p):'';
    const followedNames=(rideTask?.dest||[]).filter(d=>!d.rider&&g.pos[d.i]===g.pos[riderIdx]).map(d=>referee.name(state,d.i));
    return '<h2 id="task-focus" tabindex="-1">'+esc(t.title)+'</h2>'+
      '<div class="task-context">'+
        '<span class="pill pill-yellow">Pemilik: '+esc(ownerName)+' ('+esc(riderName)+')</span>'+
        (followedNames.length?'<span class="pill pill-pink">◆ Ikuti: '+esc(followedNames.join(', '))+'</span>':'')+
        (originPos&&destPos?'<span class="pill">Jalur: '+esc(originPos)+' → '+esc(destPos)+'</span>':'')+
      '</div>'+
      '<p class="muted">Pilih apakah Suckerfish ikut pindah atau tetap di petak sekarang.</p>'+
      '<div class="choice-stack">'+choices.map((c,i)=>button(esc(c.label),'gm-choice','data-index="'+i+'" class="btn-block"',i<choices.length-1)).join('')+'</div>';
  }

  if(isFlipFlop){
    const rollIdx=choices.findIndex(c=>c.tasks?.[0]?.type==='guess');
    const swaps=choices.map((c,i)=>({c,i})).filter(({i})=>i!==rollIdx);
    return '<h2 id="task-focus" tabindex="-1">Flip Flop · Tukar posisi atau lempar?</h2>'+
      '<div class="task-context">'+
        '<span class="pill pill-yellow">Pemilik: '+esc(state.players[active].name)+'</span>'+
        '<span class="pill">Posisi Flip Flop: '+esc(referee.display(g.pos[active]))+'</span>'+
      '</div>'+
      '<p class="muted">Tukar petak secara serentak tanpa melempar dadu, atau pilih lempar dadu biasa.</p>'+
      '<div class="choice-stack">'+
        swaps.map(({c,i})=>{
          const sub=c.tasks?.[0]?.tasks?.[0];
          const targetPlayer=sub&&sub.j!==undefined?'Pemilik: '+state.players[sub.j].name:'';
          return button('<span>'+esc(c.label)+(targetPlayer?' <small style="font-weight:700">('+esc(targetPlayer)+')</small>':'')+'</span>','gm-choice','data-index="'+i+'" class="btn-block"',true);
        }).join('')+
        (rollIdx>=0?'<hr style="border:0;border-top:2px dashed var(--color-ink);margin:4px 0">'+button(esc(choices[rollIdx].label),'gm-choice','data-index="'+rollIdx+'" class="btn-block"',false):'')+
      '</div>';
  }

  if(isReroll){
    const rerolls=choices.filter(c=>c.tasks?.[0]?.type==='reroll');
    const sources=rerolls.map(c=>{
      const rt=c.tasks[0];
      const owner=state.players[rt.source]?.name||'';
      return rt.kind+(owner?' ('+owner+')':'')+(rt.source!==active?' · '+rt.kind+' maju 1':'');
    });
    return '<h2 id="task-focus" tabindex="-1">'+esc(t.title)+'</h2>'+
      '<div class="task-context">'+
        '<span class="pill pill-yellow"><span class="die-roll-anim">'+dieSvg(g.die)+'</span> Dadu: <span class="num-display">'+g.die+'</span></span>'+
        sources.map(s=>'<span class="pill pill-teal">Sumber: '+esc(s)+'</span>').join('')+
      '</div>'+
      '<p class="muted">Tetap pakai angka <strong class="num-display">'+g.die+'</strong> untuk langkah utama, atau lakukan lempar ulang fisik.</p>'+
      '<div class="choice-stack">'+choices.map((c,i)=>{
        const keep=c.tasks?.[0]?.type==='finalRoll';
        return button(esc(c.label),'gm-choice','data-index="'+i+'" class="btn-block"',keep);
      }).join('')+'</div>';
  }

  if(isGuess){
    const skipIdx=choices.findIndex(c=>!c.tasks?.length);
    const nums=choices.map((c,i)=>({c,i})).filter(({i})=>i!==skipIdx);
    return '<h2 id="task-focus" tabindex="-1">'+esc(t.title)+'</h2>'+
      '<div class="task-context"><span class="pill pill-teal">Tebakan sebelum lempar (bukan dadu langkah)</span></div>'+
      '<p class="muted">Jika tebakan cocok dengan dadu langkah utama, Genius mendapat giliran ekstra.</p>'+
      '<div class="guess-grid">'+nums.map(({c,i})=>button(esc(c.label),'gm-choice','data-index="'+i+'" class="guess-btn"',false)).join('')+'</div>'+
      (skipIdx>=0?'<div class="choice-stack">'+button(esc(choices[skipIdx].label),'gm-choice','data-index="'+skipIdx+'" class="btn-block"',false)+'</div>':'');
  }

  return '<h2 id="task-focus" tabindex="-1">'+esc(t.title)+'</h2>'+
    '<div class="task-context"><span class="pill pill-yellow">Pemilik giliran: '+esc(state.players[active].name)+'</span></div>'+
    '<div class="choice-stack">'+choices.map((c,i)=>button(esc(c.label),'gm-choice','data-index="'+i+'" class="btn-block"',i===0)).join('')+'</div>';
}

function tableTask(t){
  const g=state.gm;
  const label=referee.name(state,state.active);
  if(!t)return '<p id="task-focus" tabindex="-1">Cocokkan catatan posisi dengan papan fisik.</p>';
  if(t.type==='choice')return renderChoiceTask(t,g);
  if(t.type==='roll'){
    const rerollCount=(g.magician||0)+(g.deal?1:0);
    return '<h2 id="task-focus" tabindex="-1">Masukkan hasil dadu fisik</h2>'+
      '<div class="task-context">'+
        '<span class="pill pill-yellow">'+esc(label)+' ('+esc(state.players[state.active].name)+')</span>'+
        (rerollCount?'<span class="pill pill-orange">Lempar ulang aktif</span>':'')+
      '</div>'+
      '<p class="muted">Lempar dadu di meja lalu ketuk angka hasilnya (1–6).</p>'+
      '<div class="dice">'+Array.from({length:6},(_,i)=>{
        const n=i+1;
        return '<button type="button" class="die-btn" data-action="gm-roll" data-index="'+n+'" aria-label="Dadu '+n+'">'+dieSvg(n)+'<span>'+n+'</span></button>';
      }).join('')+'</div>';
  }
  if(t.type==='confirmMove'){
    const direction=t.total<0?'Mundur':t.total>0?'Maju':'Tetap di petak ini';
    const startPos=g.pos[t.i];
    const parts=String(t.reason||'').split(/\s+(?=[+-])/);
    return '<h2 id="task-focus" tabindex="-1">'+direction+(t.total?' <span class="num-display">'+Math.abs(t.total)+'</span> petak':'')+'</h2>'+
      '<div class="math-strip">'+
        (g.die?'<span class="pill pill-white"><span class="die-roll-anim">'+dieSvg(g.die)+'</span> <span class="num-display">'+g.die+'</span></span>':'')+
        '<span class="pill pill-yellow">Dari '+esc(referee.display(startPos))+'</span>'+
        parts.map(p=>'<span class="pill">'+esc(p)+'</span>').join('')+
        '<span class="pill pill-teal">= '+esc(direction+(t.total?' '+Math.abs(t.total):''))+'</span>'+
      '</div>'+
      '<p class="muted">Setelah dikonfirmasi, geser pion fisik '+esc(referee.name(state,t.i))+' sesuai hasil akhir di papan.</p>'+
      button('LANJUTKAN!','gm-confirm','class="primary btn-block"',true);
  }
  if(t.type==='egg'){
    const avail=availableRacers();
    return '<h2 id="task-focus" tabindex="-1">'+esc(referee.name(state,t.i))+' · Salin kekuatan</h2>'+
      '<div class="task-context"><span class="pill pill-yellow">Pemilik: '+esc(state.players[t.i].name)+'</span><span class="pill pill-blue">Efek berlaku sepanjang race</span></div>'+
      '<p class="muted">Ambil 3 kartu atlet fisik dari kotak, pilih 1, lalu pilih nama kartu yang sama di bawah.</p>'+
      '<form id="gm-egg">'+
        field('Kartu yang dipilih','<select name="copy" required><option value="">Pilih atlet</option>'+avail.map(n=>'<option>'+esc(n)+'</option>').join('')+'</select>')+
        '<div class="row" style="margin-top:12px">'+
          '<button class="primary" style="flex:1">PAKAI KEKUATAN!</button>'+
          button('Tidak ada kartu tersisa','gm-no-egg')+
        '</div>'+
      '</form>';
  }
  if(t.type==='duel'){
    const nameA=referee.name(state,t.i), ownerA=state.players[t.i].name;
    const nameB=referee.name(state,t.j), ownerB=state.players[t.j].name;
    const radioStrip=(fieldName,def)=>'<div class="duel-radios">'+Array.from({length:6},(_,k)=>{
      const n=k+1;
      return '<label class="duel-radio"><input type="radio" name="'+fieldName+'" value="'+n+'"'+(n===def?' checked':'')+'><span>'+n+'</span></label>';
    }).join('')+'</div>';
    return '<h2 id="task-focus" tabindex="-1">Duel Dadu · '+esc(nameA)+' vs '+esc(nameB)+'</h2>'+
      '<div class="task-context"><span class="pill pill-orange">Pemenang maju 2 petak</span><span class="pill">Seri = '+esc(nameA)+' menang</span></div>'+
      '<p class="muted">Masukkan dadu duel masing-masing peserta (terpisah dari dadu langkah utama).</p>'+
      '<form id="gm-duel">'+
        '<div class="duel-pair">'+
          '<div class="duel-box"><strong>Dadu '+esc(nameA)+'</strong> <small>('+esc(ownerA)+')</small>'+radioStrip('a',1)+'</div>'+
          '<div class="duel-box"><strong>Dadu '+esc(nameB)+'</strong> <small>('+esc(ownerB)+')</small>'+radioStrip('b',1)+'</div>'+
        '</div>'+
        '<button class="primary btn-block">SELESAIKAN DUEL!</button>'+
      '</form>';
  }
  return '<h2 id="task-focus" tabindex="-1">'+esc(t.title||label)+'</h2><p>'+esc(t.body)+'</p>'+button('LANJUTKAN!','gm-notice','class="primary btn-block"',true);
}

function formatRecentEvents(log){
  const items=[];
  for(let idx=0;idx<log.length;idx++){
    const line=log[idx];
    const next=log[idx+1];
    const mAbility=/^(.+?)\s·\s([^→]+)$/.exec(line);
    if(mAbility&&next){
      const mMove=/^(.+?)\s·\s(Start|Petak \d+|Finis)\s→\s(Start|Petak \d+|Finis)\s·\s(.+)$/.exec(next);
      if(mMove&&mMove[1]===mAbility[1]&&mMove[4]===mAbility[2]){
        items.push(mMove[1]+' pindah dari '+mMove[2]+' ke '+mMove[3]+' ('+mMove[4]+')');
        idx++;
        continue;
      }
    }
    items.push(line);
  }
  return items.slice(-3).reverse();
}

function renderTrackBoard(g,t,raceColors){
  const track=referee.config(state);
  const active=state.active;
  const targets=targetContextForTask(t,g);
  const bySpace=Array.from({length:referee.finishLine+1},()=>[]);
  g.pos.forEach((pos,i)=>{
    if(g.status[i]==='out')return;
    const clamped=Math.max(0,Math.min(referee.finishLine,pos));
    bySpace[clamped].push(i);
  });

  const cells=Array.from({length:referee.finishLine+1},(_,p)=>{
    const tile=track==='wild'?referee.wild[p]:undefined;
    const occupants=bySpace[p];
    const hasActive=occupants.includes(active);
    const isTarget=targets.spaces.has(p);
    let cls='space-cell';
    let fx='';
    let bandColor=TRACK_SPACE_COLORS[(Math.max(0,p-1))%TRACK_SPACE_COLORS.length];
    if(p===0){cls+=' is-start';bandColor='#20A1BF';}
    else if(p===referee.finishLine){cls+=' is-finish';}
    else if(tile==='star'){cls+=' is-star';fx='★+1';bandColor='#FED42C';}
    else if(tile==='trip'){cls+=' is-trip';fx='▲';bandColor='#E94107';}
    else if(typeof tile==='number'){cls+=' is-arrow';fx=(tile>0?'+':'')+tile;bandColor=tile>0?'#558B07':'#8D55CE';}
    if(hasActive)cls+=' is-active';
    if(isTarget)cls+=' is-target';

    const shownTokens=occupants.slice(0,3).map(i=>{
      const rName=referee.name(state,i);
      const code=rName.replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||String(i+1);
      const rc=raceColors[i];
      const tCls='pawn'+(i===active?' is-active':g.tripped[i]?' is-tripped':targets.racers.has(i)?' is-target':'');
      return '<span class="'+tCls+'" style="--pawn-c:'+rc+';--pawn-fg:'+racerFg(rc)+'" title="'+esc(rName+' ('+state.players[i].name+')')+'">'+esc(code)+'</span>';
    }).join('');
    const stackBadge=occupants.length>1?'<span class="pawn-stack-count">'+occupants.length+'×</span>':'';
    const label=p===0?'S':p===referee.finishLine?'F':String(p);
    return '<div class="'+cls+'" style="--space-c:'+bandColor+'"><div class="space-band"></div><div class="space-inner"><div class="space-head"><span>'+label+'</span>'+(fx?'<span class="space-fx">'+fx+'</span>':'')+(isTarget?'<span aria-hidden="true">◆</span>':'')+'</div><div class="space-tokens">'+shownTokens+stackBadge+'</div></div></div>';
  }).join('');

  return '<div class="track-grid" aria-label="Peta petak lintasan 0 sampai '+referee.finishLine+'">'+cells+'</div>';
}

function leaderboard(){
  const sorted=state.players.map((p,i)=>({p,score:state.scores?.[i]||0})).sort((a,b)=>b.score-a.score);
  const counts={};
  sorted.forEach(item=>{counts[item.score]=(counts[item.score]||0)+1});
  let rank=0, prevScore=null;
  return '<div class="board-table"><table><thead><tr><th>Peringkat</th><th>Pemain</th><th style="text-align:right">Total poin</th></tr></thead><tbody>'+
  sorted.map(({p,score},idx)=>{
    if(score!==prevScore){rank=idx+1;prevScore=score}
    const tied=counts[score]>1;
    return '<tr><td><strong class="num-display">#'+rank+'</strong>'+(tied?' <span class="pill pill-yellow" style="min-height:24px;padding:1px 7px">Seri</span>':'')+'</td><td><strong>'+esc(p.name)+'</strong></td><td style="text-align:right"><strong class="num-display" style="font-size:18px">'+score+'</strong></td></tr>';
  }).join('')+'</tbody></table></div>';
}

function syncForm(){
  const g=state.gm;
  const liveRacers=referee.ordered(state,g);
  return '<details><summary>Koreksi posisi, status, atau poin</summary>'+
    '<p class="muted">Gunakan jika catatan berbeda dari papan fisik. Finis manual mengalokasikan medali; koreksi posisi tidak memicu efek petak secara otomatis.</p>'+
    (liveRacers.length?'<form id="gm-sync"><div class="grid">'+
      field('Atlet','<select name="racer">'+liveRacers.map(i=>'<option value="'+i+'">'+esc(referee.name(state,i))+' ('+esc(state.players[i].name)+')</option>').join('')+'</select>')+
      field('Koreksi','<select name="kind"><option value="position">Pindahkan posisi</option><option value="point">Sesuaikan poin</option><option value="trip">Balik status tersandung</option><option value="finish">Catat finis</option><option value="out">Catat eliminasi</option></select>')+
      field('Petak baru atau perubahan poin','<input type="number" name="amount" min="-99" max="99" value="0" required>')+
    '</div><button style="margin-top:8px">Terapkan koreksi</button></form>':'<p class="muted">Semua atlet sudah keluar atau finis.</p>')+
  '</details>';
}

function tableRace(){
  const g=state.gm;
  if(!g)return heading('LANJUTKAN RACE '+state.round,'Sinkronkan posisi dengan papan fisik untuk memakai pemandu race.')+
    '<div class="panel">'+button('BUKA PEMANDU RACE!','gm-resume','class="primary btn-block"',true)+'</div>';

  const t=g.q[0];
  const active=state.active;
  const track=referee.config(state);
  const awards=referee.medals[Math.min(state.round,4)-1];
  const stageLabel=t?.type==='egg'||g.turn===0?'Sebelum race':t?.type==='roll'?'Lempar dadu':t?.type==='confirmMove'?'Langkah utama':t?.type==='duel'?'Duel dadu':'Selesaikan efek';
  const roundLog=formatRecentEvents(state.log);
  const activeOriginal=referee.name(state,active);
  const activePower=referee.power(state,g,active);
  const targets=targetContextForTask(t,g);
  const raceColors=raceTokenColors(state.players);
  const activeColor=raceColors[active];
  const profile=track==='wild'
    ?'★ Bintang +1 poin · ▲ Batu tersandung · Panah geser & picu reaksi · Start bebas efek berbagi petak'
    :'Lintasan standar tanpa efek petak · Start bebas efek berbagi petak';

  const rowsHtml=g.pos.map((pos,i)=>({pos,i})).sort((a,b)=>{
    const pa=state.placed.indexOf(a.i), pb=state.placed.indexOf(b.i);
    if(pa>=0&&pb>=0)return pa-pb;
    if(pa>=0)return -1;
    if(pb>=0)return 1;
    if(g.status[a.i]==='out'&&g.status[b.i]!=='out')return 1;
    if(g.status[b.i]==='out'&&g.status[a.i]!=='out')return -1;
    return b.pos-a.pos;
  }).map(({pos,i})=>{
    const place=state.placed.indexOf(i);
    const original=referee.name(state,i);
    const power=referee.power(state,g,i);
    const rc=raceColors[i];
    const isActive=i===active&&g.status[i]==='race';
    const isTarget=targets.racers.has(i);
    const isOut=g.status[i]==='out';
    const pct=Math.max(0,Math.min(100,Math.round((pos/referee.finishLine)*100)));
    let statusBadge='<span class="pill pill-blue" style="min-height:24px;padding:1px 8px">Aktif</span>';
    if(place>=0)statusBadge='<span class="pill pill-green" style="min-height:24px;padding:1px 8px">Finis <span class="num-display">#'+(place+1)+'</span></span>';
    else if(isOut)statusBadge='<span class="pill pill-muted" style="min-height:24px;padding:1px 8px">Eliminasi</span>';
    else if(g.tripped[i])statusBadge='<span class="pill pill-error" style="min-height:24px;padding:1px 8px">Tersandung</span>';

    const rowCls='racer-row'+(isActive?' active-row':'')+(isTarget?' target-row':'')+(isOut?' out-row':'');
    return '<div class="'+rowCls+'">'+
      '<div>'+
        '<div class="racer-row-name"><span class="racer-dot" style="background:'+rc+'" aria-hidden="true"></span><span>'+esc(original)+'</span></div>'+
        '<div class="racer-row-meta">'+
          '<span class="muted">'+esc(state.players[i].name)+'</span>'+
          (power!==original?'<span class="pill" style="min-height:24px;padding:1px 8px">Menyalin: '+esc(power)+'</span>':'')+
          (isActive?'<span class="pill pill-ink" style="min-height:24px;padding:1px 8px">Giliran aktif</span>':statusBadge)+
          (isActive&&g.tripped[i]?'<span class="pill pill-error" style="min-height:24px;padding:1px 8px">Tersandung</span>':'')+
          (isTarget?'<span class="pill pill-pink" style="min-height:24px;padding:1px 8px">◆ Target</span>':'')+
        '</div>'+
      '</div>'+
      '<div class="racer-row-score">'+
        '<span class="racer-pos-num">'+(isOut?'Keluar':referee.display(pos))+'</span>'+
        '<span class="racer-pts">'+state.scores[i]+' poin</span>'+
      '</div>'+
      '<div class="track-meter" aria-hidden="true"><div class="track-meter-fill" style="width:'+pct+'%;background:'+rc+'"></div></div>'+
    '</div>';
  }).join('');

  return '<div class="race-layout">'+
    '<div class="race-col">'+
      '<header class="race-head '+(track==='wild'?'wild':'mild')+'">'+
        '<div class="race-head-top">'+
          '<span class="pill '+(track==='wild'?'pill-coral':'pill-teal')+'">Race <span class="num-display">'+state.round+'</span> · '+trackLabel(track)+'</span>'+
          '<span class="pill">'+(g.turn===0?'Sebelum race':'Giliran <span class="num-display">'+g.turn+'</span>')+' · <span class="num-display">#1 +'+awards[0]+' / #2 +'+awards[1]+'</span></span>'+
        '</div>'+
        '<h1><span class="racer-init-chip" style="background:'+activeColor+';color:'+racerFg(activeColor)+';vertical-align:middle;margin-right:8px" aria-hidden="true">'+esc((activeOriginal||'?')[0])+'</span>'+esc(activeOriginal)+'</h1>'+
        '<div class="race-head-meta">'+
          '<span>'+esc(state.players[active].name)+'</span>'+
          '<span class="pill pill-yellow"><span class="num-display">'+esc(referee.display(g.pos[active]))+'</span></span>'+
          '<span class="pill"><span class="num-display">'+state.scores[active]+'</span> poin</span>'+
          (activePower!==activeOriginal?'<span class="pill pill-purple">Menyalin: '+esc(activePower)+'</span>':'')+
          (g.guess?'<span class="pill pill-teal">Tebakan: <span class="num-display">'+g.guess+'</span></span>':'')+
          (g.tripped[active]?'<span class="pill pill-error">Tersandung</span>':'')+
        '</div>'+
      '</header>'+
      '<section class="panel action-panel"><span class="tag">'+stageLabel+'</span>'+tableTask(t)+'</section>'+
      (roundLog.length?'<section class="panel"><h2>Baru terjadi</h2><ul class="recent-list">'+roundLog.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ul></section>':'')+
    '</div>'+
    '<div class="race-col">'+
      '<section class="panel">'+
        '<div class="row spread"><h2>Posisi di papan</h2><span class="pill pill-muted">Start <span class="num-display">0</span> · Finis <span class="num-display">'+referee.finishLine+'</span></span></div>'+
        '<p class="muted" style="margin:6px 0 8px">'+profile+'</p>'+
        renderTrackBoard(g,t,raceColors)+
        '<div class="racer-rows">'+rowsHtml+'</div>'+
      '</section>'+
      syncForm()+
      '<details><summary>Riwayat race (<span class="num-display">'+state.log.length+'</span>)</summary>'+(state.log.length?'<ol class="full-log">'+state.log.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ol>':'<p class="muted">Belum ada kejadian tercatat.</p>')+'</details>'+
      '<details><summary>Kartu dan kemampuan</summary>'+roster(true)+'</details>'+
    '</div>'+
  '</div>';
}

function thirdPlaceRunner(places){
  const g=state.gm;
  if(!g||state.players.length<3)return null;
  const taken=new Set((places||[]).map(p=>p.player+'::'+p.racer));
  const candidates=state.players.map((pl,i)=>({
    player:pl.name,
    racer:referee.name(state,i),
    pos:g.pos[i]||0,
    out:g.status[i]==='out'
  })).filter(c=>!taken.has(c.player+'::'+c.racer));
  if(!candidates.length)return null;
  candidates.sort((a,b)=>(a.out===b.out?b.pos-a.pos:a.out?1:-1));
  return candidates[0];
}

function tableResults(){
  const results=state.results||[];
  const current=results.find(r=>r.round===state.round);
  const places=current?.places||state.placed.map(i=>({player:state.players[i].name,racer:referee.name(state,i)}));
  const awards=referee.medals[Math.min(state.round,4)-1];
  const max=Math.max(...(state.scores||[0]));
  const winners=state.players.filter((_,i)=>(state.scores?.[i]||0)===max).map(p=>esc(p.name));
  const ended=state.round>=state.slots;
  const track=trackLabel(referee.config(state));
  const third=thirdPlaceRunner(places);

  const isMastermindDouble=places.length===2&&places[0].player===places[1].player&&places[0].racer===places[1].racer;
  let podiumHtml='<p class="muted">Belum ada atlet yang ditempatkan.</p>';

  if(isMastermindDouble){
    podiumHtml='<div class="podium-grid">'+
      '<article class="podium-card podium-1" style="grid-column:1 / -1">'+
        '<div class="podium-rank">'+medalSvg(1)+' '+medalSvg(2)+'<span>Posisi #1 & #2 (Borong Podium · Mastermind)</span></div>'+
        '<div class="podium-racer">'+esc(places[0].racer)+'</div>'+
        '<div>Pemain: <strong>'+esc(places[0].player)+'</strong></div>'+
        '<div class="row" style="margin-top:6px"><span class="pill pill-ink">Prediksi diri sendiri tepat</span><span class="pill pill-yellow num-display">+'+awards[0]+' + '+awards[1]+' = +'+(awards[0]+awards[1])+' POIN</span></div>'+
      '</article>'+
    '</div>';
  }else if(places.length){
    const first=places[0];
    const second=places[1];
    podiumHtml='<div class="podium-grid">'+
      '<article class="podium-card podium-1">'+
        '<div class="podium-rank">'+medalSvg(1)+'<span>JUARA #1</span></div>'+
        '<div class="podium-racer">'+esc(first.racer)+'</div>'+
        '<div>Pemain: <strong>'+esc(first.player)+'</strong></div>'+
        '<div style="margin-top:4px"><span class="pill pill-yellow num-display">+'+awards[0]+' POIN</span></div>'+
      '</article>'+
      (second
        ?'<article class="podium-card podium-2">'+
          '<div class="podium-rank">'+medalSvg(2)+'<span>POSISI #2</span></div>'+
          '<div class="podium-racer">'+esc(second.racer)+'</div>'+
          '<div>Pemain: <strong>'+esc(second.player)+'</strong></div>'+
          '<div style="margin-top:4px"><span class="pill pill-yellow num-display">+'+awards[1]+' POIN</span></div>'+
        '</article>'
        :'<article class="podium-card podium-empty">'+
          '<div class="podium-rank"><span>POSISI #2</span></div>'+
          '<strong>Tidak dibagikan</strong>'+
          '<p class="muted">Hanya satu peserta tersisa hingga race berakhir.</p>'+
        '</article>')+
      (third
        ?'<article class="podium-card podium-3">'+
          '<div class="podium-rank">'+medalSvg(3)+'<span>POSISI #3</span></div>'+
          '<div class="podium-racer">'+esc(third.racer)+'</div>'+
          '<div>Pemain: <strong>'+esc(third.player)+'</strong></div>'+
          '<div style="margin-top:4px"><span class="pill pill-white">Runner-up · '+(third.out?'Eliminasi':'Petak '+third.pos)+'</span></div>'+
        '</article>'
        :'')+
    '</div>';
  }

  return heading(ended?'HASIL PERMAINAN!':'RACE '+state.round+' SELESAI!',ended?(winners.length>1?'Juara bersama: <b>'+winners.join(' & ')+'</b>':'Juara turnamen: <b>'+winners[0]+'</b>'):'Lintasan: <b>'+track+'</b>',track.toUpperCase(),'hero-podium')+
    '<section class="panel"><div class="row spread"><h2>Podium Race <span class="num-display">'+state.round+'</span></h2><button type="button" onclick="window.confettiBurst&&window.confettiBurst(180)">Rayakan lagi!</button></div>'+podiumHtml+'</section>'+
    '<section class="panel"><h2>Klasemen kumulatif</h2>'+leaderboard()+'</section>'+
    (results.length>1?'<details><summary>Podium race sebelumnya</summary>'+results.filter(r=>r.round!==state.round).map(r=>'<p><strong>Race '+r.round+' · '+trackLabel(r.track)+'</strong><br>'+r.places.map((p,i)=>'#'+(i+1)+' '+esc(p.racer)+' ('+esc(p.player)+')').join(' · ')+'</p>').join('')+'</details>':'')+
    '<div class="panel">'+(ended?button('MAIN LAGI!','reset','class="primary btn-block"',true):button('SIAPKAN RACE '+(state.round+1)+'!','round','class="primary btn-block"',true))+'</div>';
}

function refereeForm(id,data){
  if(id==='gm-egg')referee.take(state,'egg',data.get('copy'));
  if(id==='gm-duel')referee.take(state,'duel',{a:Number(data.get('a')),b:Number(data.get('b'))});
  if(id==='gm-sync')referee.correct(state,Number(data.get('racer')),data.get('kind'),Number(data.get('amount')));
}
