# Shared UI Primitives

Framework: Static HTML5 / Vanilla CSS / Vanilla JavaScript (no bundler or component framework).

## `button` helper (`dist/index.html`)
- File: `dist/index.html`
- Description: Action button generator supporting `data-action`, custom HTML attributes, and `.primary` emphasis.
```js
const button=(label,action,extra='',primary=false)=>'<button type="button" data-action="'+action+'" '+extra+(primary?' class="primary"':'')+'>'+label+'</button>';
```

## `heading` helper (`dist/index.html`)
- File: `dist/index.html`
- Description: Stage header card displaying main `<h1>` title and muted subtitle.
```js
const heading=(title,sub)=>'<div class="panel hero"><h1>'+title+'</h1><p class="muted">'+sub+'</p></div>';
```

## `field` helper (`dist/index.html`)
- File: `dist/index.html`
- Description: Accessible stacked label + input/select/textarea wrapper.
```js
const field=(label,content)=>'<label><span>'+label+'</span>'+content+'</label>';
```

## `tableTask` (`dist/table.js`)
- File: `dist/table.js`
- Description: Active decision/roll/confirmMove/egg/duel/notice task renderer inside `.action-panel`.
```js
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
```
