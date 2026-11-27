const referee = (() => {
  const finishLine = 30;
  const medals = [[3,1],[4,2],[4,2],[5,3]];
  // Numbered checkpoints for reading the physical board.
  const wild = {1:'star',5:'trip',7:3,11:1,13:'star',16:-4,17:'trip',23:2,24:-2,26:'trip'};
  const config = s => s.track || (s.round % 2 ? 'mild' : 'wild');
  const name = (s,i) => s.players[i].team[s.players[i].pick].name;
  const racer = (s,i) => s.players[i].team[s.players[i].pick];
  const live = (g,i) => g.status[i] === 'race';
  const ordered = (s,g) => g.pos.map((_,i)=>(i+s.active)%g.pos.length).filter(i=>live(g,i));
  const leaders = g => g.pos.map((_,i)=>i).filter(i=>live(g,i)&&g.pos[i]===Math.max(...g.pos.filter((_,j)=>live(g,j))));
  const tail = g => g.pos.map((_,i)=>i).filter(i=>live(g,i)&&g.pos[i]===Math.min(...g.pos.filter((_,j)=>live(g,j))));
  const display = n => n===0?'Start':n>=finishLine?'Finis':'Petak '+n;
  const task = (type, props={}) => ({type,...props});
  const move = (i,d,label,extra={}) => task('move',{i,d,label,...extra});
  const warp = (i,p,label) => task('arrive',{dest:[{i,p}],label,warp:true});
  const select = (title,choices) => task('choice',{title,choices});
  const option = (label,...tasks) => ({label,tasks});
  const prompt = (title,choices,skip='Lewati efek') => select(title,[...choices,option(skip)]);
  function log(s,line){s.log.push(line)}
  function score(s,i,delta,label,medal=false){
    const old=s.scores[i];
    s.bonus ||= s.scores.map(()=>0);
    const shift=delta<0?Math.max(delta,-s.bonus[i]):delta;
    if(!medal)s.bonus[i]+=shift;
    s.scores[i]+=shift;
    if(s.scores[i]!==old)log(s,name(s,i)+' '+(delta>0?'+':'')+(s.scores[i]-old)+' poin · '+label);
  }
  function base(s,g,i){return g.copied[i] || name(s,i)}
  function power(s,g,i){
    if(base(s,g,i)!=='Copycat')return base(s,g,i);
    const lead=leaders(g);
    if(!lead.length||(lead.length===1&&lead[0]===i))return 'Copycat';
    const choices=lead.filter(j=>j!==i&&base(s,g,j)!=='Copycat');
    const target=choices.includes(g.copycat[i])?g.copycat[i]:choices[0];
    return target===undefined?'Copycat':base(s,g,target);
  }
  function owners(s,g,k){return ordered(s,g).filter(i=>power(s,g,i)===k)}
  function activate(s,g,i,label){
    log(s,name(s,i)+' · '+label);
    return owners(s,g,'Scoocher').filter(j=>j!==i).map(j=>move(j,1,'Scoocher'));
  }
  const ability = (i,label,...tasks) => task('ability',{i,label,tasks});
  function conclude(s,g){
    s.results ||= [];
    s.results.push({round:s.round,track:config(s),places:s.placed.map(i=>({player:s.players[i].name,racer:name(s,i),power:base(s,g,i)})),scores:[...s.scores]});
    s.nextStarter=g.out[0] ?? tail(g).find(i=>!s.placed.includes(i));
    s.stage=6;
    g.q=[];
  }
  function place(s,g,i){
    const points=medals[Math.min(s.round,4)-1];
    g.status[i]='finish';
    g.pos[i]=finishLine;
    s.placed.push(i);
    score(s,i,points[s.placed.length-1],'Finis #'+s.placed.length,true);
    if(s.placed.length===1){
      const winner=ordered(s,g).find(j=>g.prediction[j]===i)
        ?? (g.prediction[i]===i ? i : undefined);
      if(winner!==undefined){
        g.status[winner]='finish';
        g.pos[winner]=finishLine;
        s.placed.push(winner);
        score(s,winner,points[1],'Prediksi Mastermind',true);
      }
    }
    if(s.placed.length===2)conclude(s,g);
  }
  function checkSurvivors(s,g){
    if(!g.out.length)return;
    const survivors=ordered(s,g);
    if(survivors.length!==1&&survivors.length!==0)return;
    if(survivors.length===1)place(s,g,survivors[0]);
    if(s.stage===5)conclude(s,g);
  }
  function start(s,starting,resume=false){
    const n=s.players.length;
    s.scores ||= Array(n).fill(0);
    s.active=starting;
    const g={pos:Array(n).fill(0),status:Array(n).fill('race'),tripped:Array(n).fill(false),q:[],out:[],copied:{},copycat:{},copyAsked:{},predicted:{},prediction:{},turn:0,visited:[],start:0,die:0};
    s.gm=g;
    if(resume){
      const medalsForRace=medals[Math.min(s.round,4)-1];
      s.placed.forEach((i,index)=>{
        g.pos[i]=finishLine;
        g.status[i]='finish';
        score(s,i,medalsForRace[index],'Finis dari catatan sebelumnya',true);
      });
      g.q.push(task('notice',{title:'Sinkronkan papan fisik',body:'Gunakan Koreksi posisi, status, atau poin untuk memasukkan posisi saat ini sebelum melanjutkan.'}));
    }else{
      g.q.push(...ordered(s,g).map(i=>task('pre',{i,depth:0})));
    }
    g.q.push(task('begin'));
    settle(s);
  }
  function pre(s,g,t){
    const i=t.i,k=base(s,g,i);
    if(t.depth>4)return [task('notice',{title:'Periksa salinan efek sebelum race',body:details(racer(s,i).pre)})];
    if(k==='Sisyphus')return [task('score',{i,d:4,label:'Sisyphus · sebelum race'})];
    if(k==='Egg')return [task('egg',{i,depth:t.depth})];
    if(k==='Twin'){
      const winners=[...new Map((s.results||[]).filter(r=>r.places[0]).map(r=>[r.places[0].racer,r.places[0].power])).entries()];
      if(winners.length)return [prompt(name(s,i)+' · Pilih juara yang disalin',winners.map(([r,k])=>option(r,task('copy',{i,k}),task('pre',{i,depth:t.depth+1}))))];
      return [];
    }
    return custom(s,i,'pre',0);
  }
  const details = value => value || 'Cek kartu fisik sebelum melanjutkan.';
  function custom(s,i,key,die){
    const a=racer(s,i);
    if(racerPowers[a.name]?.[key]===a[key]||!a[key])return [];
    return (a[key]||'').split('\n').flatMap(line=>{
      const text=line.trim();
      if(!text)return [];
      const m=/^([1-6](?:\s*,\s*[1-6])*)\s*:\s*(.+)$/.exec(text);
      if(m&&die&&!m[1].split(',').map(Number).includes(die))return [];
      return [task('notice',{title:name(s,i),body:m?m[2]:text})];
    });
  }
  function copyChoices(s,g){
    const choices=[];
    for(const i of ordered(s,g).filter(i=>base(s,g,i)==='Copycat')){
      const candidates=leaders(g).filter(j=>j!==i&&base(s,g,j)!=='Copycat');
      const key=candidates.join(',');
      if(g.copyAsked[i]===key)continue;
      g.copyAsked[i]=key;
      if(candidates.length>1)choices.push(select(name(s,i)+' · Pemimpin seri. Salin siapa?',candidates.map(j=>option(name(s,j),task('pickCopy',{i,j})))));
    }
    return choices;
  }
  function before(s,g){
    const i=s.active,k=power(s,g,i),others=ordered(s,g).filter(j=>i!==j);
    const next=[];
    if(k==='Mastermind'&&!g.predicted[i]){
      g.predicted[i]=true;
      next.push(select(name(s,i)+' · Tebak pemenang',ordered(s,g).map(j=>option(name(s,j),task('prediction',{i,j})))));
    }
    if(k==='Cheerleader')next.push(prompt('Cheerleader · Majukan atlet terakhir?',[
      option('Beri dorongan',ability(i,'Cheerleader',task('batch',{moves:tail(g).map(j=>({i:j,d:2})),label:'Cheerleader'}),move(i,1,'Cheerleader')))]));
    if(k==='Hypnotist'&&others.length)next.push(prompt('Hypnotist · Tarik atlet ke '+display(g.pos[i])+'?',others.map(j=>option(name(s,j),ability(i,'Hypnotist',task('pull',{i,j}))))));
    if(k==='Third Wheel'){
      const spaces=[...new Set(ordered(s,g).map(j=>g.pos[j]))].filter(p=>p!==g.pos[i]&&ordered(s,g).filter(j=>g.pos[j]===p).length===2);
      if(spaces.length)next.push(prompt('Third Wheel · Teleportasi?',spaces.map(p=>option(display(p),ability(i,'Third Wheel',warp(i,p,'Third Wheel'))))));
    }
    if(k==='Lovable Loser'&&tail(g).length===1&&tail(g)[0]===i)next.push(ability(i,'Lovable Loser',task('score',{i,d:1,label:'Sendirian di posisi terakhir'})));
    if(k==='Party Animal'){
      const moves=others.filter(j=>g.pos[j]!==g.pos[i]).map(j=>({i:j,d:Math.sign(g.pos[i]-g.pos[j])}));
      if(moves.length)next.push(ability(i,'Party Animal',task('batch',{moves,label:'Party Animal'})));
    }
    return [...next,...custom(s,i,'before',0),task('main')];
  }
  function main(s,g){
    const i=s.active,k=power(s,g,i);
    if(!live(g,i))return [task('after')];
    if(g.tripped[i]){
      g.tripped[i]=false;
      log(s,name(s,i)+' berdiri kembali · langkah utama dilewati');
      return [task('after')];
    }
    if(k==='Hare'&&g.hareSkip){
      return [ability(i,'Hare sendirian di depan · tanpa dadu'),task('after')];
    }
    const roll=option('Lempar dadu fisik',task('guess'));
    if(k==='Legs')return [select('Legs · Pilih langkah utama',[option('Jog · maju 5 tanpa dadu',ability(i,'Legs'),task('mainMove',{i,value:5}),task('after')),roll])];
    if(k==='Flip Flop'){
      const choices=ordered(s,g).filter(j=>j!==i).map(j=>option('Tukar dengan '+name(s,j)+' · '+display(g.pos[j]),ability(i,'Flip Flop',task('swap',{i,j})),task('after')));
      return [select('Flip Flop · Tukar petak atau lempar?', [...choices,roll])];
    }
    return [task('guess')];
  }
  function rollOptions(s,g){
    const i=s.active,k=power(s,g,i);
    const sources=owners(s,g,'Dicemonger');
    const options=[];
    if(k==='Magician'&&g.magician<2)options.push(option('Reroll Magician · '+(2-g.magician)+' tersisa',task('reroll',{source:i,kind:'Magician'})));
    if(sources.length&&!g.deal)options.push(option('Reroll Dicemonger',task('reroll',{source:sources[0],kind:'Dicemonger'})));
    if(!options.length)return [task('finalRoll')];
    return [select('Dadu '+g.die+' · Pakai hasil ini?', [option('Pakai '+g.die,task('finalRoll')),...options])];
  }
  function finalRoll(s,g){
    const i=s.active,k=power(s,g,i),die=g.die;
    const next=[];
    if(die===1){
      g.jump=owners(s,g,'Skipper')[0];
      if(g.jump!==undefined)next.push(ability(g.jump,'Skipper mengambil giliran berikutnya'));
      const worms=owners(s,g,'Inchworm').filter(j=>j!==i);
      if(worms.length){
        next.push(...worms.map(j=>ability(j,'Inchworm · langkah lawan batal',move(j,1,'Inchworm'))));
        if(k==='Genius'&&g.guess===die&&g.jump===undefined)g.extra=true;
        return [...next,task('after')];
      }
    }
    if(die===6)next.push(...owners(s,g,'Lackey').filter(j=>j!==i).map(j=>ability(j,'Lackey',move(j,2,'Lackey'))));
    if(k==='Genius'&&g.guess===die&&g.jump===undefined){
      g.extra=true;
      next.push(ability(i,'Tebakan Genius benar · giliran ekstra'));
    }
    if(k==='Sisyphus'&&die===6){
      return [...next,ability(i,'Sisyphus',task('score',{i,d:-1,label:'Sisyphus'}),warp(i,0,'Sisyphus')),task('after')];
    }
    next.push(...custom(s,i,'own',die),...ordered(s,g).filter(j=>j!==i).flatMap(j=>custom(s,j,'other',die)));
    next.push(task('chooseMove',{i,die}),task('after'));
    return next;
  }
  function distance(s,g,i,value){
    const k=power(s,g,i);
    const modifiers=[];
    if(k==='Blimp')modifiers.push([i,g.start<15?3:-1,'Blimp']);
    if(k==='Hare')modifiers.push([i,2,'Hare']);
    if(k==='Party Animal'){
      const share=ordered(s,g).filter(j=>j!==i&&g.pos[j]===g.pos[i]).length;
      if(share)modifiers.push([i,share,'Party Animal']);
    }
    for(const j of ordered(s,g)){
      const p=power(s,g,j);
      if(p==='Coach'&&g.pos[j]===g.pos[i])modifiers.push([j,1,'Coach']);
      if(p==='Gunk'&&j!==i)modifiers.push([j,-1,'Gunk']);
    }
    const total=modifiers.reduce((sum,m)=>sum+m[1],value);
    const reason=[String(value),...modifiers.map(([,n,k])=>(n>0?'+':'')+n+' '+k)].join(' ');
    return {total,reason,modifiers};
  }
  function target(s,g,i,d){
    let p=g.pos[i], left=Math.abs(d), step=Math.sign(d), hops=0;
    const jump=power(s,g,i)==='Leaptoad';
    const occupied=new Set(ordered(s,g).filter(j=>j!==i).map(j=>g.pos[j]));
    while(left>0&&p+step>=0){
      p+=step;
      if(jump&&p>0&&p<finishLine&&occupied.has(p))hops++;
      else left--;
    }
    const stick=owners(s,g,'Stickler').find(j=>j!==i);
    return stick!==undefined&&p>finishLine?{p:g.pos[i],stick}:{p,hops};
  }
  function gather(s,g,motions,label,pending=[]){
    const valid=motions.filter(m=>live(g,m.i)&&m.d);
    if(!valid.length)return pending;
    const dest=valid.map(m=>({i:m.i,...target(s,g,m.i,m.d)}));
    const handled=[];
    const arrivals=dest.filter(d=>d.p!==g.pos[d.i]);
    for(const d of dest){
      if(d.stick!==undefined)handled.push(ability(d.stick,'Stickler · gerakan '+name(s,d.i)+' batal'));
    }
    if(!arrivals.length)return [...handled,...pending];
    const riders=owners(s,g,'Suckerfish');
    return [...handled,task('ride',{riders,dest:arrivals,label,index:0}),...arrivals.flatMap(d=>Array.from({length:d.hops||0},()=>ability(d.i,'Leaptoad · lewati petak berisi atlet'))),...pending];
  }
  function follow(s,g,t){
    for(let n=t.index;n<t.riders.length;n++){
      const i=t.riders[n];
      if(!live(g,i)||t.dest.some(d=>d.i===i))continue;
      const neighbors=t.dest.filter(d=>g.pos[d.i]===g.pos[i]);
      if(!neighbors.length)continue;
      const next=task('ride',{...t,index:n+1});
      return [select(name(s,i)+' · Ikut atlet yang meninggalkan '+display(g.pos[i])+'?',[
        ...neighbors.map(d=>option('Ikuti '+name(s,d.i)+' ke '+display(d.p),task('ride',{...next,dest:[...t.dest,{i,p:d.p,hops:0,rider:true}]}))),
        option('Tetap di petak ini',next)
      ])];
    }
    return [task('arrive',{dest:t.dest,label:t.label})];
  }
  function arrive(s,g,t){
    const before=[...g.pos];
    const prior=ordered(s,g);
    const powers=Object.fromEntries(prior.map(i=>[i,power(s,g,i)]));
    const candidates=t.dest.filter(d=>live(g,d.i)&&before[d.i]!==d.p);
    const moving=new Set(candidates.map(d=>d.i));
    const babyEffects=[];
    const dest=candidates.map(d=>{
      if(d.p<=0||d.p>=finishLine||powers[d.i]==='Huge Baby')return d;
      const baby=prior.find(j=>powers[j]==='Huge Baby'&&!moving.has(j)&&before[j]===d.p);
      if(baby===undefined)return d;
      babyEffects.push(ability(baby,'Huge Baby · '+name(s,d.i)+' ditempatkan 1 petak di belakang'));
      return {...d,p:d.p-1};
    }).filter(d=>before[d.i]!==d.p);
    if(!dest.length)return babyEffects;
    const arrivals=new Set(dest.map(d=>d.i));
    for(const d of dest){
      g.pos[d.i]=Math.max(0,Math.min(finishLine,d.p));
      log(s,name(s,d.i)+' · '+display(before[d.i])+' → '+display(g.pos[d.i])+' · '+t.label);
    }
    for(const d of dest.filter(d=>g.pos[d.i]>=finishLine)){
      place(s,g,d.i);
      if(s.stage===6)return [];
    }
    const board=[], impacts=[], assisted=[];
    const react=(i,...jobs)=>impacts.push({i,jobs});
    const put=(i,p,label)=>task('arrive',{dest:[{i,p}],warp:true,label});
    for(const d of dest){
      const i=d.i,p=g.pos[i];
      if(!live(g,i))continue;
      const tile=config(s)==='wild'?wild[p]:undefined;
      if(tile==='star')board.push(task('score',{i,d:1,label:'Bintang Wild Wilds'}));
      if(tile==='trip')board.push(task('trip',{i,label:'Batu Wild Wilds'}));
      if(typeof tile==='number')board.push(move(i,tile,'Panah Wild Wilds'));
      const passed=j=>!t.warp&&((before[i]<before[j]&&before[j]<d.p)||(before[i]>before[j]&&before[j]>d.p));
      for(const j of prior.filter(j=>j!==i&&live(g,j))){
        if(powers[j]==='Banana'&&passed(j)&&!arrivals.has(j))react(j,ability(j,'Banana',task('trip',{i,label:'Banana'})));
        if(powers[i]==='Centaur'&&passed(j)&&!arrivals.has(j))react(i,ability(i,'Centaur',move(j,-2,'Centaur')));
      }
      const stationary=prior.filter(j=>j!==i&&live(g,j)&&!arrivals.has(j)&&g.pos[j]===p);
      if(p>0){
        if(powers[i]==='Huge Baby'){
          for(const j of prior.filter(j=>j!==i&&live(g,j)&&g.pos[j]===p))react(i,ability(i,'Huge Baby',put(j,p-1,'Huge Baby')));
        }
      }
      if(powers[i]==='Baba Yaga'){
        for(const j of stationary)react(i,ability(i,'Baba Yaga',task('trip',{i:j,label:'Baba Yaga'})));
      }
      for(const j of stationary.filter(j=>powers[j]==='Baba Yaga'))react(j,ability(j,'Baba Yaga',task('trip',{i,label:'Baba Yaga'})));
      if(stationary.length===1){
        if(powers[i]==='M.O.U.T.H.')react(i,ability(i,'M.O.U.T.H.',task('eliminate',{i:stationary[0]})));
        for(const j of owners(s,g,'Romantic'))react(j,ability(j,'Romantic',move(j,2,'Romantic')));
      }
      assisted.push(...custom(s,i,'move',0));
      if(d.rider)assisted.push(...activate(s,g,i,'Suckerfish mengikuti'));
    }
    const duels=owners(s,g,'Duelist').filter(i=>prior.some(j=>j!==i&&live(g,j)&&g.pos[j]===g.pos[i])&&dest.some(d=>g.pos[d.i]===g.pos[i]));
    for(const i of duels)react(i,task('offerDuel',{i}));
    const order=ordered(s,g);
    board.sort((a,b)=>order.indexOf(a.i)-order.indexOf(b.i));
    impacts.sort((a,b)=>order.indexOf(a.i)-order.indexOf(b.i));
    return [...board,...copyChoices(s,g),...babyEffects,...impacts.flatMap(item=>item.jobs),...assisted];
  }
  function duel(s,g,i){
    const options=ordered(s,g).filter(j=>j!==i&&g.pos[j]===g.pos[i]).map(j=>option('Tantang '+name(s,j),task('duel',{i,j})));
    return options.length?[prompt(name(s,i)+' · Duel dengan atlet satu petak?',options,'Lewati duel')]:[];
  }
  function automatic(s,g,t){
    const i=s.active,k=power(s,g,i);
    switch(t.type){
      case 'pre':return pre(s,g,t);
      case 'copy':g.copied[t.i]=t.k;log(s,name(s,t.i)+' menyalin '+t.k);return [];
      case 'pickCopy':g.copycat[t.i]=t.j;return [];
      case 'prediction':g.predicted[t.i]=true;g.prediction[t.i]=t.j;log(s,name(s,t.i)+' menebak '+name(s,t.j));return [];
      case 'score':score(s,t.i,t.d,t.label);return [];
      case 'trip':if(live(g,t.i)){g.tripped[t.i]=true;log(s,name(s,t.i)+' tersandung · '+t.label)}return [];
      case 'ability':return live(g,t.i)?[...(t.tasks||[]),...activate(s,g,t.i,t.label)]:[];
      case 'begin':
        g.turn++;g.start=g.pos[i];g.die=0;g.guess=null;g.magician=0;g.deal=false;g.jump=undefined;g.extra=false;g.visited=[];g.resolutions=0;
        g.hareSkip=leaders(g).length===1&&leaders(g)[0]===i;
        return [...copyChoices(s,g),...owners(s,g,'Duelist').map(j=>task('offerDuel',{i:j})),task('before')];
      case 'before':return live(g,i)?before(s,g):[task('after')];
      case 'main':return main(s,g);
      case 'guess':
        if(!live(g,i))return [task('after')];
        return k==='Genius'?[prompt('Genius · Tebak hasil dadu',Array.from({length:6},(_,j)=>option(String(j+1),task('setGuess',{n:j+1})))) ,task('roll')]:[task('roll')];
      case 'setGuess':g.guess=t.n;return [];
      case 'rollOptions':return rollOptions(s,g);
      case 'reroll':
        if(t.kind==='Magician')g.magician++;
        else g.deal=true;
        return [ability(t.source,t.kind+' · reroll',...(t.source!==i?[move(t.source,1,'Dicemonger')]:[])),task('roll')];
      case 'finalRoll':return live(g,i)?finalRoll(s,g):[task('after')];
      case 'chooseMove':{
        if(!live(g,t.i))return [];
        const normal=task('mainMove',{i:t.i,value:t.die});
        if(k==='Alchemist'&&t.die<=2)return [select('Alchemist · Ganti angka langkah?', [option('Pakai '+t.die,normal),option('Pakai 4',ability(i,'Alchemist'),task('mainMove',{i,value:4}))])];
        if(k==='Rocket Scientist')return [select('Rocket Scientist · Gandakan jarak dasar?', [option('Pakai '+t.die,normal),option('Gandakan jadi '+2*t.die,ability(i,'Rocket Scientist'),task('mainMove',{i,value:2*t.die}),task('trip',{i,label:'Rocket Scientist'}))])];
        return [normal];
      }
      case 'mainMove':{
        if(!live(g,t.i))return [];
        const d=distance(s,g,t.i,t.value);
        return [task('confirmMove',{i:t.i,...d})];
      }
      case 'pull':return live(g,t.j)?[warp(t.j,g.pos[t.i],'Hypnotist')]:[];
      case 'swap':return live(g,t.j)?[task('arrive',{dest:[{i:t.i,p:g.pos[t.j]},{i:t.j,p:g.pos[t.i]}],warp:true,label:'Flip Flop'})]:[];
      case 'move':return gather(s,g,[t],t.label);
      case 'batch':return gather(s,g,t.moves,t.label);
      case 'ride':return follow(s,g,t);
      case 'arrive':return arrive(s,g,t);
      case 'offerDuel':return live(g,t.i)?duel(s,g,t.i):[];
      case 'eliminate':
        if(live(g,t.i)){g.status[t.i]='out';g.out.push(t.i);log(s,name(s,t.i)+' tereliminasi');checkSurvivors(s,g)}
        return [];
      case 'after':{
        const hits=Math.abs(g.pos[i]-g.start)<=1?owners(s,g,'Heckler').map(j=>ability(j,'Heckler',move(j,2,'Heckler'))):[];
        return [...hits,task('nextTurn')];
      }
      case 'nextTurn':{
        const chosen=g.jump??(g.extra?i:undefined);
        if(chosen!==undefined&&live(g,chosen))s.active=chosen;
        else{
          const next=ordered(s,g).find(j=>j!==i);
          if(next===undefined&&!live(g,i)){conclude(s,g);return []}
          s.active=next??i;
        }
        return [task('begin')];
      }
      default:throw new Error('Unknown referee task '+t.type);
    }
  }
  const interactive=new Set(['choice','roll','confirmMove','egg','notice','duel']);
  function settle(s){
    const g=s.gm;
    let steps=0;
    while(s.stage===5&&g.q.length&&!interactive.has(g.q[0].type)){
      const t=g.q.shift();
      g.resolutions=(g.resolutions||0)+1;
      if(++steps>180||g.resolutions>600){
        g.resolutions=0;
        g.q=[task('notice',{title:'Rangkaian efek perlu dicek',body:'Selesaikan sisa efek di meja dan koreksi posisi atau poin sebelum lanjut ke giliran berikutnya.'}),task('nextTurn')];
        break;
      }
      if(['move','batch','arrive'].includes(t.type)){
        const signature=JSON.stringify([t,g.pos,g.status,g.tripped,s.scores,g.q[0]?.type]);
        if(g.visited.includes(signature)){log(s,'Efek berulang dihentikan · '+(t.label||t.type));continue}
        g.visited.push(signature);
      }
      const next=automatic(s,g,t);
      if(s.stage===5)g.q.unshift(...next);
    }
  }
  function take(s,type,value){
    const g=s.gm,t=g.q[0];
    if(!t||t.type!==type)return;
    let jobs=[];
    if(type==='choice'){
      if(!t.choices[value])return;
      jobs=t.choices[value].tasks;
    }
    if(type==='roll'){
      if(value<1||value>6)return;
      g.die=value;log(s,name(s,s.active)+' · dadu '+value);
      jobs=[task('rollOptions')];
    }
    if(type==='confirmMove'){
      jobs=[move(t.i,t.total,'Langkah utama · '+t.reason),...t.modifiers.flatMap(([i,,label])=>activate(s,g,i,label))];
    }
    if(type==='egg'&&value&&racerPowers[value])jobs=[task('copy',{i:t.i,k:value}),task('pre',{i:t.i,depth:t.depth+1})];
    if(type==='duel'){
      const {a,b}=value,winner=a>=b?t.i:t.j;
      jobs=[ability(t.i,'Duel · '+a+' vs '+b,move(winner,2,'Menang duel'))];
    }
    g.q.shift();
    g.q.unshift(...jobs);
    settle(s);
  }
  function correct(s,i,kind,d){
    const g=s.gm;
    if(!live(g,i))return;
    if(kind==='position'){
      const prev=g.pos[i];
      g.pos[i]=Math.max(0,Math.min(finishLine-1,d));
      if(i===s.active&&g.start===prev&&g.die===0){g.start=g.pos[i];g.hareSkip=leaders(g).length===1&&leaders(g)[0]===i}
    }
    if(kind==='point'){
      const delta=Math.max(-s.scores[i],d);
      s.scores[i]+=delta;
      s.bonus ||= s.scores.map(()=>0);
      s.bonus[i]=Math.max(0,s.bonus[i]+delta);
      log(s,name(s,i)+' · Penyesuaian poin '+delta);
    }
    if(kind==='trip')g.tripped[i]=!g.tripped[i];
    if(kind==='finish')place(s,g,i);
    if(kind==='out')automatic(s,g,task('eliminate',{i}));
    log(s,name(s,i)+' · Koreksi '+display(g.pos[i]));
    if(s.stage===5&&!live(g,s.active)){
      g.q=[task('nextTurn')];
      settle(s);
    }
  }
  return {start,resume:s=>start(s,s.active,true),correct,take,config,wild,medals,finishLine,display,power,name,racer,ordered,leaders,tail,place,conclude,settle};
})();
