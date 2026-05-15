const RetroStore = {
  key: 'retrocadeState',
  load: function () {
    return JSON.parse(localStorage.getItem(this.key) || '{"coins":500,"tickets":0,"xp":0,"plays":0,"wins":0}');
  },
  save: function (state) {
    localStorage.setItem(this.key, JSON.stringify(state));
  },
  award: function (tickets, xp, coins) {
    const state = this.load();
    state.tickets = (state.tickets || 0) + (tickets || 0);
    state.xp = (state.xp || 0) + (xp || 0);
    state.coins = (state.coins || 0) + (coins || 0);
    state.plays = (state.plays || 0) + 1;
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
function retroWin(tickets, xp, coins) {
  RetroStore.award(tickets || 10, xp || 20, coins || 0);
  retroHud();
}