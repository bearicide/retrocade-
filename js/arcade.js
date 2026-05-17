const RetroStore={
  key:'retrocadeState',
  defaults:{coins:500,tickets:0,xp:0,plays:0,wins:0,cabinets:{}},
  load(){try{const raw=localStorage.getItem(this.key);const saved=raw?JSON.parse(raw):{};return{...this.defaults,...saved,cabinets:{...this.defaults.cabinets,...(saved.cabinets||{})}}}catch(e){return{...this.defaults,cabinets:{}}}},
  save(state){try{localStorage.setItem(this.key,JSON.stringify({...this.defaults,...state,cabinets:{...(state&&state.cabinets||{})}}))}catch(e){}},
  award(tickets=0,xp=0,coins=0,cabinet='cabinet'){
    const state=this.load();
    state.tickets=Math.max(0,(state.tickets||0)+tickets);
    state.xp=Math.max(0,(state.xp||0)+xp);
    state.coins=Math.max(0,(state.coins||0)+coins);
    state.plays=(state.plays||0)+1;
    state.cabinets=state.cabinets||{};
    state.cabinets[cabinet]=(state.cabinets[cabinet]||0)+1;
    this.save(state);
    return state;
  }
};

(function mountGlobalTheme(){
  if(document.getElementById('retrocade-theme-layer'))return;
  const link=document.createElement('link');
  link.id='retrocade-theme-layer';
  link.rel='stylesheet';
  link.href='../css/retrocade-theme.css';
  document.head.appendChild(link);
})();

function retroLoadScript(id,src,onload){
  if(document.getElementById(id)){if(onload)onload();return;}
  const script=document.createElement('script');
  script.id=id;
  script.src=src;
  script.defer=true;
  if(onload)script.onload=onload;
  script.onerror=function(){console.warn('[RETROCADE] optional script unavailable:',src)};
  document.head.appendChild(script);
}
function retroLoadAudio(){if(window.RetroAudio||window.__retroAudioLoading)return;window.__retroAudioLoading=true;retroLoadScript('retro-audio-manager','../js/audio-manager.js')}
function retroLoadPass3(){if(window.RetroPass3||window.__retroPass3Loading)return;window.__retroPass3Loading=true;retroLoadScript('retro-pass3-system','../js/pass3-system.js',function(){if(window.RetroPass3&&RetroPass3.attract)RetroPass3.attract()})}

const RetroCabinet={
  brand:'b e a r i c i d e . g i t h u b . i o',
  moods:{
    SNAKE:['NEON BIOHAZARD','TAIL RITUAL','DIGEST THE SIGNAL'],
    BREAKOUT:['LASER CHAMBER','BRICK VIOLENCE','IMPACT ENGINE'],
    INVADERS:['ALIEN SIGNAL WAR','SKY BREACH','DEFEND THE SIGNAL'],
    ASTEROIDS:['VOID ROCK PANIC','SPACE JUNK RITUAL','VECTOR GRAVEYARD'],
    PONG:['HYPNOTIC WAR','TWO PADDLES ENTER','VECTOR DUEL'],
    'CLAW MACHINE':['PRIZE CULT','GRAB OR BE GRABBED','EMOTIONAL DAMAGE'],
    'BUBBLE SHOOTER':['POP CHEMISTRY','COLOR PANIC','GLASS CANDY'],
    'MEMORY MATCH':['CRT AMNESIA','REMEMBER WRONG','SIGNAL RECALL'],
    'MINI RACER':['NEON ROAD FEVER','ILLEGAL NIGHT DRIVE','NO BRAKES'],
    'RHYTHM PADS':['SPEAKER RITUAL','BUTTONS BECOME DRUMS','NOISE TEMPLE'],
    'FALLING BLOCKS':['REACTOR STACK','FALLING PANIC','GRID PRESSURE'],
    'FROG DASH':['CURSED CROSSING','ROAD DOOM','HOP OR DROP']
  },
  mountBranding(title){
    if(document.querySelector('.retro-brand-stripe'))return;
    const stripe=document.createElement('div');
    stripe.className='retro-brand-stripe';
    stripe.textContent=this.brand+'   •   '+title+'   •   '+this.brand;
    stripe.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:76;text-align:center;padding:6px 10px;background:rgba(0,0,0,.82);border-top:1px solid rgba(0,255,204,.35);font-size:11px;font-weight:1000;letter-spacing:.22em;pointer-events:none';
    document.body.appendChild(stripe);
  },
  boot(title){
    this.mountBranding(title);
    if(sessionStorage.getItem('booted-'+title))return;
    sessionStorage.setItem('booted-'+title,'1');
    const lines=this.moods[title]||['RETROCADE CABINET','WAKE UP','INSERT CHAOS'];
    const boot=document.createElement('aside');
    boot.className='retro-boot';
    boot.style.cssText='position:fixed;inset:0;z-index:996;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);transition:.35s';
    boot.innerHTML='<div class="retro-boot-card"><div class="retro-boot-brand">'+this.brand+'</div><h1>'+title+'</h1><p id="retro-boot-line">'+lines[0]+'</p><button type="button" class="retro-boot-button">ENTER MACHINE</button></div>';
    document.body.appendChild(boot);
    const card=boot.querySelector('.retro-boot-card');
    card.style.cssText='position:relative;width:min(90vw,520px);padding:30px;border-radius:28px;text-align:center;background:linear-gradient(145deg,#10131d,#050507);border:2px solid #00ffcc;box-shadow:0 0 40px rgba(0,255,204,.22),0 0 90px rgba(255,43,214,.16)';
    const button=boot.querySelector('button');
    let i=0;
    const line=boot.querySelector('#retro-boot-line');
    const timer=setInterval(function(){i++;if(line)line.textContent=lines[i%lines.length]},760);
    function close(){clearInterval(timer);boot.style.opacity='0';if(window.RetroAudio)RetroAudio.confirm();if(window.RetroPass3&&RetroPass3.flash)RetroPass3.flash('rgba(255,230,109,.18)',420);setTimeout(function(){boot.remove()},420)}
    button.addEventListener('pointerdown',close);
    setTimeout(function(){if(document.body.contains(boot))close()},3600);
  },
  signal(text,type=''){
    const sig=document.createElement('div');
    sig.className='retro-signal '+type;
    sig.textContent=text||this.brand;
    sig.style.cssText='position:fixed;left:50%;top:78px;transform:translateX(-50%);z-index:999;background:rgba(0,0,0,.9);border:2px solid #00ffcc;border-radius:999px;padding:10px 18px;color:#ffe66d;font-weight:1000;box-shadow:0 0 24px rgba(255,43,214,.35);pointer-events:none;max-width:92vw;text-align:center';
    document.body.appendChild(sig);
    setTimeout(function(){sig.remove()},1200);
  }
};

const RetroState={
  mount(){
    if(document.getElementById('retro-state'))return;
    const overlay=document.createElement('aside');
    overlay.id='retro-state';
    overlay.className='retro-state';
    overlay.setAttribute('aria-hidden','true');
    overlay.style.cssText='position:fixed;inset:0;z-index:995;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:.2s';
    overlay.innerHTML='<div class="retro-state-card"><h1 id="retro-state-title">READY</h1><p id="retro-state-sub">PRESS START</p></div>';
    document.body.appendChild(overlay);
  },
  show(title='READY',sub='',type='',ms=1100){
    this.mount();
    const overlay=document.getElementById('retro-state');
    const heading=document.getElementById('retro-state-title');
    const text=document.getElementById('retro-state-sub');
    if(!overlay||!heading||!text)return;
    overlay.className='retro-state show '+type;
    overlay.style.opacity='1';
    overlay.setAttribute('aria-hidden','false');
    heading.textContent=title;
    text.textContent=sub;
    clearTimeout(window.__retroStateTimer);
    if(ms!==0)window.__retroStateTimer=setTimeout(function(){RetroState.close()},ms);
    if(window.RetroAudio){if(type==='bigwin')RetroAudio.bigWin();else if(type==='danger')RetroAudio.gameOver();else RetroAudio.confirm()}
  },
  close(){const overlay=document.getElementById('retro-state');if(!overlay)return;overlay.style.opacity='0';overlay.setAttribute('aria-hidden','true')}
};

const RetroInput={
  keys:{},
  preventKeys:['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Spacebar'],
  init(){
    if(window.__retroInputReady)return;
    window.__retroInputReady=true;
    document.addEventListener('keydown',function(event){RetroInput.keys[event.key]=true;if(RetroInput.preventKeys.includes(event.key))event.preventDefault();if(event.key==='?'||event.key.toLowerCase()==='h')RetroInput.toggleHelp();if(event.key==='Escape'){RetroInput.closeHelp();RetroState.close()}},{passive:false});
    document.addEventListener('keyup',function(event){RetroInput.keys[event.key]=false});
    window.addEventListener('blur',function(){RetroInput.keys={};document.querySelectorAll('.is-pressed').forEach(function(button){button.classList.remove('is-pressed')})});
    document.addEventListener('pointerdown',function(event){const button=event.target.closest('button,.arcade-btn,.touch-btn');if(!button)return;button.classList.add('is-pressed');if(window.RetroAudio)RetroAudio.click()},true);
    ['pointerup','pointercancel','pointerleave'].forEach(function(type){document.addEventListener(type,function(event){const button=event.target.closest('button,.arcade-btn,.touch-btn');if(button)button.classList.remove('is-pressed')},true)});
  },
  enhanceControls(title){
    this.init();
    document.body.classList.add('retrocade-controls-ready');
    document.body.setAttribute('data-cabinet',title.toLowerCase());
    document.querySelectorAll('button,.arcade-btn,.touch-btn').forEach(function(button){if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim()||'Arcade control');button.setAttribute('draggable','false')});
    document.querySelectorAll('[data-dir],[data-move]').forEach(function(button){const dir=button.dataset.dir||button.dataset.move||button.textContent.trim();button.classList.add('direction-control');button.setAttribute('aria-label','Move '+dir)});
    const touch=document.querySelector('.touch-controls');
    if(touch){touch.setAttribute('aria-label',title+' arcade controls');touch.setAttribute('role','group');if(!touch.querySelector('.control-hint')){const hint=document.createElement('div');hint.className='control-hint';hint.textContent='Keyboard: WASD / Arrows • Touch: big glowing controls';touch.appendChild(hint)}}
    const note=document.querySelector('.note');
    if(note&&!note.querySelector('.control-chip')){const chip=document.createElement('span');chip.className='control-chip';chip.textContent='Controls';note.prepend(chip)}
    this.mountHelp(title);
    RetroState.mount();
    RetroCabinet.boot(title);
  },
  mountHelp(title){
    if(document.getElementById('retro-help'))return;
    const help=document.createElement('aside');
    help.id='retro-help';
    help.setAttribute('aria-hidden','true');
    help.innerHTML='<div class="retro-help-card"><button class="retro-help-close" type="button" onclick="RetroInput.closeHelp()">×</button><strong>'+title+' CONTROLS</strong><p><b>Move:</b> WASD / Arrow Keys / Touch Buttons</p><p><b>Main Action:</b> Space / Enter / Big glowing button</p><p><b>Help:</b> H or ?</p><p><b>Back:</b> RETROCADE top-left link</p><p><b>Signal:</b> '+RetroCabinet.brand+'</p></div>';
    document.body.appendChild(help);
  },
  toggleHelp(){const help=document.getElementById('retro-help');if(!help)return;const isOpen=help.classList.toggle('open');help.setAttribute('aria-hidden',isOpen?'false':'true')},
  closeHelp(){const help=document.getElementById('retro-help');if(!help)return;help.classList.remove('open');help.setAttribute('aria-hidden','true')}
};

function retroHeader(title){
  retroLoadAudio();
  retroLoadPass3();
  const bar=document.createElement('div');
  bar.className='top';
  bar.innerHTML='<a href="../index.html">RETROCADE</a><b>'+title+'</b><span id="hud"></span><button class="help-toggle" type="button" onclick="RetroInput.toggleHelp()" aria-label="Show controls">?</button>';
  document.body.prepend(bar);
  retroHud();
  setTimeout(function(){RetroInput.enhanceControls(title)},0);
}
function retroHud(){const state=RetroStore.load();const hud=document.getElementById('hud');if(hud)hud.textContent='Coins '+(state.coins||0)+' | Tickets '+(state.tickets||0)+' | Level '+(Math.floor((state.xp||0)/100)+1)}
function retroToast(text){let toast=document.getElementById('retro-toast');if(!toast){toast=document.createElement('div');toast.id='retro-toast';toast.style.cssText='position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:999;background:rgba(0,0,0,.9);border:2px solid #00ffcc;border-radius:999px;padding:10px 16px;color:#ffe66d;font-weight:1000;box-shadow:0 0 22px rgba(0,255,204,.35);opacity:0;transition:.18s;pointer-events:none;text-align:center;max-width:92vw';document.body.appendChild(toast)}toast.textContent=text;toast.style.opacity='1';clearTimeout(window.__retroToastTimer);window.__retroToastTimer=setTimeout(function(){toast.style.opacity='0'},1200)}
function retroWin(tickets=10,xp=20,coins=0,cabinet='cabinet'){const state=RetroStore.award(tickets,xp,coins,cabinet);retroHud();retroToast('+'+tickets+' tickets  +'+xp+' XP'+(coins?'  +'+coins+' coins':''));if(tickets>=20||coins>0)RetroState.show('BIG WIN','+'+tickets+' TICKETS','bigwin',900);if(tickets>=20)RetroCabinet.signal(RetroCabinet.brand,'win');return state}
function retroCanvasPoint(canvas,event){const rect=canvas.getBoundingClientRect();const source=event.touches&&event.touches[0]?event.touches[0]:event;return{x:((source.clientX-rect.left)/rect.width)*canvas.width,y:((source.clientY-rect.top)/rect.height)*canvas.height}}
function retroBindHold(button,down,up){if(!button)return;const release=up||function(){};button.addEventListener('pointerdown',function(event){event.preventDefault();button.classList.add('is-pressed');down(event)});['pointerup','pointerleave','pointercancel'].forEach(function(type){button.addEventListener(type,function(event){button.classList.remove('is-pressed');release(event)})})}
function retroSafeBoot(label,fn){try{fn()}catch(error){console.error('[RETROCADE]',label,error);retroToast('CABINET BOOT ERROR - patched mode needed')}}
window.addEventListener('error',function(event){console.error('[RETROCADE ERROR]',event.error||event.message);retroToast('CABINET GLITCH CAUGHT')});