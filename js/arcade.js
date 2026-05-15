const RetroStore = {
  key: 'retrocadeState',
  defaults: { coins: 500, tickets: 0, xp: 0, plays: 0, wins: 0, cabinets: {} },
  load: function () {
    try {
      return { ...this.defaults, ...(JSON.parse(localStorage.getItem(this.key) || '{}')) };
    } catch (error) {
      return { ...this.defaults };
    }
  },
  save: function (state) {
    localStorage.setItem(this.key, JSON.stringify({ ...this.defaults, ...state }));
  },
  award: function (tickets, xp, coins, cabinet) {
    const state = this.load();
    state.tickets = Math.max(0, (state.tickets || 0) + (tickets || 0));
    state.xp = Math.max(0, (state.xp || 0) + (xp || 0));
    state.coins = Math.max(0, (state.coins || 0) + (coins || 0));
    state.plays = (state.plays || 0) + 1;
    if (cabinet) {
      state.cabinets = state.cabinets || {};
      state.cabinets[cabinet] = (state.cabinets[cabinet] || 0) + 1;
    }
    this.save(state);
    return state;
  }
};
function retroHeader(title) {
  const bar = document.createElement('div');
  bar.className = 'top';
  bar.innerHTML = '<a href="../index.html">RETROCADE</a><b>' + title + '</b><span id="hud"></span>';
  document.body.prepend(bar);
  retroHud();
}
function retroHud() {
  const state = RetroStore.load();
  const hud = document.getElementById('hud');
  if (hud) hud.textContent = 'Coins ' + (state.coins || 0) + ' | Tickets ' + (state.tickets || 0) + ' | Level ' + (Math.floor((state.xp || 0) / 100) + 1);
}
function retroToast(text) {
  let toast = document.getElementById('retro-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'retro-toast';
    toast.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:99;background:rgba(0,0,0,.9);border:2px solid #00ffcc;border-radius:999px;padding:10px 16px;color:#ffe66d;font-weight:1000;box-shadow:0 0 22px rgba(0,255,204,.35);opacity:0;transition:.18s;pointer-events:none;text-align:center';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = '1';
  clearTimeout(window.__retroToastTimer);
  window.__retroToastTimer = setTimeout(function () { toast.style.opacity = '0'; }, 1100);
}
function retroWin(tickets, xp, coins, cabinet) {
  const state = RetroStore.award(tickets || 10, xp || 20, coins || 0, cabinet || 'cabinet');
  retroHud();
  retroToast('+' + (tickets || 10) + ' tickets  +' + (xp || 20) + ' XP' + ((coins || 0) ? '  +' + coins + ' coins' : ''));
  return state;
}