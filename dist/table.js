function trackLabel(track){return track==='wild'?'Wild Wilds':'Mild Mile'}
function trackSelect(){
  return ['mild','wild'].map(track=>'<option value="'+track+'" '+(track===referee.config(state)?'selected':'')+'>'+trackLabel(track)+'</option>').join('');
}
function tablePre(){
  const suggestion=state.nextStarter===undefined?'Tentukan pemain pertama dari roll-off di meja.':'Usulan pemain pertama mengikuti posisi atau eliminasi race sebelumnya.';
  const awards=referee.medals[Math.min(state.round,4)-1];
  return heading('Siapkan race '+state.round,suggestion)+
    '<form class="panel" id="start"><div class="grid">'+field('Lintasan','<select name="track">'+trackSelect()+'</select>')+
    field('Pemain pertama','<select name="first">'+state.players.map((p,i)=>'<option value="'+i+'" '+(i===state.nextStarter?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select>')+
    '</div><p class="muted">Finis pertama +'+awards[0]+' poin · Finis kedua +'+awards[1]+' poin</p><h2>Atlet di Start</h2><ul>'+
    state.players.map(p=>'<li>'+esc(p.name)+' · <strong>'+esc(athlete(p).name)+'</strong></li>').join('')+
    '</ul><button class="primary">Siapkan papan dan mulai</button></form>';
}
function tableTask(t){
  const label=referee.name(state,state.active);
  if(!t)return '<p>Cocokkan catatan posisi dengan papan.</p>';
  if(t.type==='choice')return '<h2>'+esc(t.title)+'</h2><div class="row">'+t.choices.map((c,i)=>button(esc(c.label),'gm-choice','data-index="'+i+'"',i===0)).join('')+'</div>';
  if(t.type==='roll')return '<h2>Masukkan hasil dadu fisik</h2><div class="dice">'+Array.from({length:6},(_,i)=>button(i+1,'gm-roll','data-index="'+(i+1)+'"')).join('')+'</div>';
  if(t.type==='confirmMove'){
    const direction=t.total<0?'Mundur':t.total>0?'Maju':'Tetap di petak ini';
    return '<h2>'+direction+(t.total?' '+Math.abs(t.total)+' petak':'')+'</h2><p class="muted">Perhitungan '+esc(t.reason)+'. Setelah dikonfirmasi, cocokkan posisi akhir atlet dengan papan di meja.</p>'+button('Lanjutkan langkah utama','gm-confirm','',true);
  }
  if(t.type==='egg')return '<h2>'+esc(referee.name(state,t.i))+' · Salin kekuatan</h2><p>Ambil tiga kartu fisik dan pilih satu. Pilih nama yang sama di sini.</p><form id="gm-egg">'+field('Kartu yang dipilih','<select name="copy" required><option value="">Pilih atlet</option>'+availableRacers().map(n=>'<option>'+esc(n)+'</option>').join('')+'</select>')+'<button class="primary">Pakai kekuatan</button> '+button('Tidak ada kartu tersisa','gm-no-egg')+'</form>';
  if(t.type==='duel')return '<h2>Duel · '+esc(referee.name(state,t.i))+' vs '+esc(referee.name(state,t.j))+'</h2><form id="gm-duel"><div class="grid">'+field('Dadu '+esc(referee.name(state,t.i)),'<select name="a">'+numopts(1,6,1)+'</select>')+field('Dadu '+esc(referee.name(state,t.j)),'<select name="b">'+numopts(1,6,1)+'</select>')+'</div><button class="primary">Selesaikan duel</button></form>';
  return '<h2>'+esc(t.title||label)+'</h2><p>'+esc(t.body)+'</p>'+button('Lanjutkan','gm-notice','',true);
}
function leaderboard(){
  return '<div class="board-table"><table><thead><tr><th>Pemain</th><th>Total poin</th></tr></thead><tbody>'+
  state.players.map((p,i)=>({p,score:state.scores?.[i]||0})).sort((a,b)=>b.score-a.score).map(({p,score})=>'<tr><td>'+esc(p.name)+'</td><td><strong>'+score+'</strong></td></tr>').join('')+'</tbody></table></div>';
}
function syncForm(){
  const g=state.gm;
  return '<details><summary>Koreksi posisi, status, atau poin</summary><p class="muted">Gunakan jika catatan berbeda dari papan. Finis manual mengalokasikan medali. Koreksi posisi tidak memicu efek petak secara otomatis.</p><form id="gm-sync"><div class="grid">'+
  field('Atlet','<select name="racer">'+referee.ordered(state,g).map(i=>'<option value="'+i+'">'+esc(referee.name(state,i))+'</option>').join('')+'</select>')+
  field('Koreksi','<select name="kind"><option value="position">Pindahkan posisi</option><option value="point">Sesuaikan poin</option><option value="trip">Balik status tersandung</option><option value="finish">Catat finis</option><option value="out">Catat eliminasi</option></select>')+
  field('Petak baru atau perubahan poin','<input type="number" name="amount" min="-99" max="99" value="0" required>')+'</div><button>Terapkan koreksi</button></form></details>';
}
function tableRace(){
  const g=state.gm;
  if(!g)return heading('Lanjutkan race '+state.round,'Sinkronkan posisi dengan papan untuk memakai pemandu race.')+
    '<div class="panel">'+button('Buka pemandu race','gm-resume','',true)+'</div>';
  const t=g.q[0];
  const active=state.active;
  const stage=t?.type==='egg'||(g.turn===0)?'Sebelum race':t?.type==='roll'?'Lempar dadu':t?.type==='confirmMove'?'Langkah utama':'Selesaikan efek';
  const roundLog=state.log.slice(-4).reverse();
  const track=referee.config(state);
  const profile=track==='wild'?'Bintang +1 · batu tersandung · panah memicu gerakan baru':'Lintasan tanpa efek petak';
  return '<div class="panel hero race-head"><p class="tag">Race '+state.round+' · '+trackLabel(track)+' · Giliran '+Math.max(1,g.turn)+'</p><h1>'+esc(referee.name(state,active))+'</h1><p>'+esc(state.players[active].name)+' · '+referee.display(g.pos[active])+'</p></div>'+
    '<section class="panel action-panel" aria-live="polite"><p class="tag">'+stage+'</p>'+tableTask(t)+'</section>'+
    '<section class="panel"><div class="row spread"><h2>Posisi di papan</h2><span class="muted">Start 0 · Finis 30</span></div><p class="muted">'+profile+'</p><div class="board-table"><table><thead><tr><th>Atlet</th><th>Posisi</th><th>Poin</th></tr></thead><tbody>'+
    g.pos.map((pos,i)=>({pos,i})).sort((a,b)=>b.pos-a.pos).map(({pos,i})=>{
      const place=state.placed.indexOf(i);
      const status=place>=0?'Finis #'+(place+1):g.status[i]==='out'?'Eliminasi':referee.display(pos)+(g.tripped[i]?' · Tersandung':'');
      const power=referee.power(state,g,i);
      const original=referee.name(state,i);
      const progress='<progress aria-label="Jarak '+esc(original)+'" max="'+referee.finishLine+'" value="'+pos+'"></progress>';
      return '<tr class="'+(i===active?'active-row':'')+'"><td><strong>'+esc(original)+'</strong><small>'+esc(state.players[i].name)+(power!==original?' · '+esc(power):'')+'</small></td><td>'+status+progress+'</td><td><strong>'+state.scores[i]+'</strong></td></tr>';
    }).join('')+'</tbody></table></div></section>'+
    (roundLog.length?'<section class="panel"><h2>Baru terjadi</h2><ul>'+roundLog.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ul></section>':'')+
    syncForm()+'<details><summary>Riwayat race ('+state.log.length+')</summary><ol>'+state.log.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ol></details>'+
    '<details><summary>Kartu dan kemampuan</summary>'+roster(true)+'</details>';
}
function tableResults(){
  const results=state.results||[];
  const current=results.find(r=>r.round===state.round);
  const places=current?.places||state.placed.map(i=>({player:state.players[i].name,racer:referee.name(state,i)}));
  const max=Math.max(...(state.scores||[0]));
  const winners=state.players.filter((_,i)=>(state.scores?.[i]||0)===max).map(p=>esc(p.name));
  const ended=state.round>=state.slots;
  return heading(ended?'Hasil permainan':'Race '+state.round+' selesai',ended?'Pemenang · '+winners.join(' & '):trackLabel(referee.config(state)))+
    '<section class="panel"><h2>Podium</h2>'+(places.length?'<ol>'+places.map((p,i)=>'<li><strong>'+esc(p.racer)+'</strong> · '+esc(p.player)+' · +'+referee.medals[Math.min(state.round,4)-1][i]+' poin</li>').join('')+'</ol>':'<p>Belum ada atlet yang ditempatkan.</p>')+'</section>'+
    '<section class="panel"><h2>Klasemen</h2>'+leaderboard()+'</section>'+
    (results.length>1?'<details><summary>Podium race sebelumnya</summary>'+results.filter(r=>r.round!==state.round).map(r=>'<p><strong>Race '+r.round+' · '+trackLabel(r.track)+'</strong><br>'+r.places.map((p,i)=>'#'+(i+1)+' '+esc(p.racer)+' ('+esc(p.player)+')').join(' · ')+'</p>').join('')+'</details>':'')+
    (ended?button('Permainan baru','reset','',true):button('Siapkan Race '+(state.round+1),'round','',true));
}
function refereeForm(id,data){
  if(id==='gm-egg')referee.take(state,'egg',data.get('copy'));
  if(id==='gm-duel')referee.take(state,'duel',{a:Number(data.get('a')),b:Number(data.get('b'))});
  if(id==='gm-sync')referee.correct(state,Number(data.get('racer')),data.get('kind'),Number(data.get('amount')));
}
