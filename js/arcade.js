const RetroStore = {
  key: 'retrocadeState',
  defaults: { coins: 500, tickets: 0, xp: 0, plays: 0, wins: 0, cabinets: {} },
  load: function () {
    try {
      const raw = localStorage.getItem(this.key);
      const saved = raw ? JSON.parse(raw) : {};
      return { ...this.defaults, ...saved, cabinets: { ...this.defaults.cabinets, ...(saved.cabinets || {}) } };
    } catch (error) { return { ...this.defaults }; }
  },
  save: function (state) { try { localStorage.setItem(this.key, JSON.stringify({ ...this.defaults, ...state })); } catch (error) {} },
  award: function (tickets, xp, coins, cabinet) {
    const state = this.load();
    state.tickets = Math.max(0, (state.tickets || 0) + (tickets || 0));
    state.xp = Math.max(0, (state.xp || 0) + (xp || 0));
    state.coins = Math.max(0, (state.coins || 0) + (coins || 0));
    state.plays = (state.plays || 0) + 1;
    if (cabinet) { state.cabinets = state.cabinets || {}; state.cabinets[cabinet] = (state.cabinets[cabinet] || 0) + 1; }
    this.save(state);
    return state;
  }
};

(function mountGlobalTheme(){
  if(document.getElementById('retrocade-theme-layer')) return;
  const link=document.createElement('link');
  link.id='retrocade-theme-layer';
  link.rel='stylesheet';
  link.href='../css/retrocade-theme.css';
  document.head.appendChild(link);
})();

function retroLoadAudio() {
  if (window.RetroAudio || window.__retroAudioLoading) return;
  window.__retroAudioLoading = true;
  const script = document.createElement('script');
  script.src = '../js/audio-manager.js';
  script.defer = true;
  script.onerror = function () { console.warn('[RETROCADE] audio manager unavailable'); };
  document.head.appendChild(script);
}

function retroLoadPass3() {
  if (window.RetroPass3 || window.__retroPass3Loading) return;
  window.__retroPass3Loading = true;
  const script = document.createElement('script');
  script.src = '../js/pass3-system.js';
  script.defer = true;
  script.onload = function () { if (window.RetroPass3 && RetroPass3.attract) RetroPass3.attract(); };
  script.onerror = function () { console.warn('[RETROCADE] pass3 system unavailable'); };
  document.head.appendChild(script);
}

const RetroCabinet = {
  brand: 'b e a r i c i d e . g i t h u b . i o',
  moods: {
    SNAKE: ['NEON BIOHAZARD', 'TAIL RITUAL', 'DIGEST THE SIGNAL'],
    BREAKOUT: ['LASER CHAMBER', 'BRICK VIOLENCE', 'IMPACT ENGINE'],
    INVADERS: ['ALIEN SIGNAL WAR', 'SKY BREACH', 'DEFEND THE SIGNAL'],
    PONG: ['HYPNOTIC WAR', 'TWO PADDLES ENTER', 'VECTOR DUEL'],
    RACER: ['NEON ROAD FEVER', 'ILLEGAL NIGHT DRIVE', 'NO BRAKES'],
    CLAW: ['PRIZE CULT', 'GRAB OR BE GRABBED', 'EMOTIONAL DAMAGE'],
    BUBBLE: ['POP CHEMISTRY', 'COLOR PANIC', 'GLASS CANDY'],
    MEMORY: ['CRT AMNESIA', 'REMEMBER WRONG', 'SIGNAL RECALL'],
    RHYTHM: ['SPEAKER RITUAL', 'BUTTONS BECOME DRUMS', 'NOISE TEMPLE'],
    BLOCKS: ['REACTOR STACK', 'FALLING PANIC', 'GRID PRESSURE'],
    FROG: ['CURSED CROSSING', 'ROAD DOOM', 'HOP OR DROP']
  },
  mountBranding: function (title) {
    if (document.querySelector('.retro-brand-stripe')) return;
    const stripe = document.createElement('div');
    stripe.className = 'retro-brand-stripe';
    stripe.textContent = this.brand + '   •   ' + title + '   •   ' + this.brand;
    document.body.appendChild(stripe);
    const cornerA = document.createElement('div');
    cornerA.className = 'retro-corner-brand left';
    cornerA.textContent = this.brand;
    const cornerB = document.createElement('div');
    cornerB.className = 'retro-corner-brand right';
    cornerB.textContent = this.brand;
    document.body.appendChild(cornerA);
    document.body.appendChild(cornerB);
  }
};