const RetroStore={
  key:'retrocadeState',
  defaults:{coins:500,tickets:0,xp:0,plays:0,wins:0,cabinets:{}},
  load(){try{const raw=localStorage.getItem(this.key);const saved=raw?JSON.parse(raw):{};return{...this.defaults,...saved,cabinets:{...this.defaults.cabinets,...(saved.cabinets||{})}}}catch(error){return{...this.defaults,cabinets:{}}}},
  save(state){try{localStorage.setItem(this.key,JSON.stringify({...this.defaults,...state,cabinets:{...(state&&state.cabinets||{})}}))}catch(error){}},
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

const RetroCatalog={
  SNAKE:{type:'Classic',summary:'Guide the snake, collect points, and avoid the walls.',controls:'Arrow keys or WASD. Touch players can use the direction deck.'},
  BREAKOUT:{type:'Classic',summary:'Move the paddle, keep the ball alive, and clear every brick.',controls:'Move left and right with keyboard, pointer, or touch controls.'},
  INVADERS:{type:'Shooter',summary:'Move across the bottom lane and defend the screen from incoming waves.',controls:'Move left/right, fire with the action button, Space, or touch controls.'},
  ASTEROIDS:{type:'Shooter',summary:'Steer, thrust, and clear drifting hazards while staying in control.',controls:'Rotate, thrust, and fire with keyboard or touch controls.'},
  PONG:{type:'Classic',summary:'A clean two-paddle reflex game with simple scoring and fast rounds.',controls:'Move the paddle with keyboard, pointer, or touch controls.'},
  'CLAW MACHINE':{type:'Prize',summary:'Line up the claw, drop at the right time, and collect prizes.',controls:'Move the claw with direction controls, then use the grab button.'},
  'BUBBLE SHOOTER':{type:'Puzzle',summary:'Aim, match colors, and clear the board with careful shots.',controls:'Aim with pointer or touch. Use the action button to shoot when available.'},
  'MEMORY MATCH':{type:'Puzzle',summary:'Flip cards, remember positions, and match pairs for tickets.',controls:'Click or tap cards. Keyboard help is available with H.'},
  'MINI RACER':{type:'Racing',summary:'Steer through the lane, dodge obstacles, and keep the run alive.',controls:'Move with arrows, WASD, or touch controls.'},
  'RHYTHM PADS':{type:'Music',summary:'Tap pads, trigger sounds, and build a quick rhythm pattern.',controls:'Use the pad grid, keyboard, or touch controls.'},
  'FALLING BLOCKS':{type:'Puzzle',summary:'Move, rotate, and place falling pieces to clear lines.',controls:'Use arrows or WASD to move and rotate. Touch controls are available.'},
  'FROG DASH':{type:'Arcade',summary:'Cross the lanes, time each move, and reach the goal safely.',controls:'Use direction controls to move one step at a time.'}
};

const RetroCabinet={
  brand:'bearicide.github.io',
  moods:{},
  mountBranding(title){
    if(document.querySelector('.retro-brand-stripe'))return;
    const stripe=document.createElement('div');
    stripe.className='retro-brand-stripe';
    stripe.textContent='RETROCADE • '+title+' • MATTBEAR';
    document.body.appendChild(stripe);
  },
  boot(title){
    this.mountBranding(title);
  },
  signal(text,type=''){
    const sig=document.createElement('div');
    sig.className='retro-signal '+type;
    sig.textContent=text||'RETROCADE';
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
    overlay.setAttribute('aria-hidden','false');
    heading.textContent=title;
    text.textContent=sub;
    clearTimeout(window.__retroStateTimer);
    if(ms!==0)window.__retroStateTimer=setTimeout(function(){RetroState.close()},ms);
    if(window.RetroAudio){if(type==='bigwin')RetroAudio.bigWin();else if(type==='danger')RetroAudio.gameOver();else RetroAudio.confirm()}
  },
  close(){const overlay=document.getElementById('retro-state');if(!overlay)return;overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true')}
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
    document.body.setAttribute('data-cabinet',title.toLowerCase().replace(/\s+/g,'-'));
    document.querySelectorAll('button,.arcade-btn,.touch-btn').forEach(function(button){if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim()||'Arcade control');button.setAttribute('draggable','false')});
    document.querySelectorAll('[data-dir],[data-move]').forEach(function(button){const dir=button.dataset.dir||button.dataset.move||button.textContent.trim();button.classList.add('direction-control');button.setAttribute('aria-label','Move '+dir)});
    const touch=document.querySelector('.touch-controls');
    if(touch){touch.setAttribute('aria-label',title+' arcade controls');touch.setAttribute('role','group');if(!touch.querySelector('.control-hint')){const hint=document.createElement('div');hint.className='control-hint';hint.textContent='Keyboard: WASD / Arrows • Touch: on-screen controls';touch.appendChild(hint)}}
    const note=document.querySelector('.note');
    const info=RetroCatalog[title]||{type:'Arcade',summary:'Play the cabinet, score points, and return to RETROCADE when finished.',controls:'Use keyboard or touch controls.'};
    if(note){note.innerHTML='<span class="control-chip">Controls</span>'+info.controls}
    this.mountGameInfo(title,info);
    this.mountHelp(title,info);
    RetroState.mount();
    RetroCabinet.mountBranding(title);
  },
  mountGameInfo(title,info){
    if(document.querySelector('.game-intro'))return;
    const wrap=document.querySelector('.game-wrap');
    if(!wrap)return;
    const intro=document.createElement('section');
    intro.className='game-intro';
    intro.innerHTML='<div><span class="cabinet-type">'+info.type+'</span><h1>'+title+'</h1><p>'+info.summary+'</p></div><nav class="game-links" aria-label="Game links"><a href="../index.html">RETROCADE</a><a href="https://bearicide.github.io/MATTBEARCADE/">Arcade</a><a href="https://bearicide.github.io/projects.html#games">Projects</a></nav>';
    wrap.parentNode.insertBefore(intro,wrap);
  },
  mountHelp(title,info){
    if(document.getElementById('retro-help'))return;
    const help=document.createElement('aside');
    help.id='retro-help';
    help.setAttribute('aria-hidden','true');
    help.innerHTML='<div class="retro-help-card"><button class="retro-help-close" type="button" onclick="RetroInput.closeHelp()">×</button><strong>'+title+' Controls</strong><p>'+info.summary+'</p><p><b>Controls:</b> '+info.controls+'</p><p><b>Help:</b> Press H or ? to open this panel. Press Escape to close overlays.</p><p><b>Back:</b> Use the RETROCADE link at the top of the page.</p></div>';
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
function retroToast(text){let toast=document.getElementById('retro-toast');if(!toast){toast=document.createElement('div');toast.id='retro-toast';document.body.appendChild(toast)}toast.textContent=text;toast.classList.add('show');clearTimeout(window.__retroToastTimer);window.__retroToastTimer=setTimeout(function(){toast.classList.remove('show')},1200)}
function retroWin(tickets=10,xp=20,coins=0,cabinet='cabinet'){const state=RetroStore.award(tickets,xp,coins,cabinet);retroHud();retroToast('+'+tickets+' tickets  +'+xp+' XP'+(coins?'  +'+coins+' coins':''));if(tickets>=20||coins>0)RetroState.show('BIG WIN','+'+tickets+' TICKETS','bigwin',900);if(tickets>=20)RetroCabinet.signal('RETROCADE','win');return state}
function retroCanvasPoint(canvas,event){const rect=canvas.getBoundingClientRect();const source=event.touches&&event.touches[0]?event.touches[0]:event;return{x:((source.clientX-rect.left)/rect.width)*canvas.width,y:((source.clientY-rect.top)/rect.height)*canvas.height}}
function retroBindHold(button,down,up){if(!button)return;const release=up||function(){};button.addEventListener('pointerdown',function(event){event.preventDefault();button.classList.add('is-pressed');down(event)});['pointerup','pointerleave','pointercancel'].forEach(function(type){button.addEventListener(type,function(event){button.classList.remove('is-pressed');release(event)})})}
function retroSafeBoot(label,fn){try{fn()}catch(error){console.error('[RETROCADE]',label,error);retroToast('Cabinet needs a quick patch')}}
window.addEventListener('error',function(event){console.error('[RETROCADE ERROR]',event.message,event.error);retroToast('Cabinet error logged')});
window.addEventListener('unhandledrejection',function(event){console.error('[RETROCADE PROMISE]',event.reason);retroToast('Cabinet error logged')});
