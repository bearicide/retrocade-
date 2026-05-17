const RetroStore = {
  key: 'retrocadeState',
  defaults: { coins: 500, tickets: 0, xp: 0, plays: 0, wins: 0, cabinets: {} },
  load: function () {
    try {
      const raw = localStorage.getItem(this.key);
      const saved = raw ? JSON.parse(raw) : {};
      return { ...this.defaults, ...saved, cabinets: { ...this.defaults.cabinets, ...(saved.cabinets || {}) } };
    } catch (error) {
      return { ...this.defaults };
    }
  },
  save: function (state) {
    try { localStorage.setItem(this.key, JSON.stringify({ ...this.defaults, ...state })); } catch (error) {}
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

function retroLoadAudio() {
  if (window.RetroAudio || window.__retroAudioLoading) return;
  window.__retroAudioLoading = true;
  const script = document.createElement('script');
  script.src = '../js/audio-manager.js';
  script.defer = true;
  script.onerror = function () { console.warn('[RETROCADE] audio manager unavailable'); };
  document.head.appendChild(script);
}

const RetroInput = {
  keys: {},
  preventKeys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'],
  init: function () {
    if (window.__retroInputReady) return;
    window.__retroInputReady = true;

    document.addEventListener('keydown', function (event) {
      RetroInput.keys[event.key] = true;
      if (RetroInput.preventKeys.includes(event.key)) event.preventDefault();
      if (event.key === '?' || event.key.toLowerCase() === 'h') RetroInput.toggleHelp();
      if (event.key === 'Escape') {
        RetroInput.closeHelp();
        RetroState.close();
      }
    }, { passive: false });

    document.addEventListener('keyup', function (event) { RetroInput.keys[event.key] = false; });

    window.addEventListener('blur', function () {
      RetroInput.keys = {};
      document.querySelectorAll('.is-pressed').forEach(function (button) { button.classList.remove('is-pressed'); });
    });

    document.addEventListener('pointerdown', function (event) {
      const button = event.target.closest('button, .arcade-btn, .touch-btn');
      if (!button) return;
      button.classList.add('is-pressed');
      if (window.RetroAudio) RetroAudio.click();
    }, true);

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
      document.addEventListener(type, function (event) {
        const button = event.target.closest('button, .arcade-btn, .touch-btn');
        if (button) button.classList.remove('is-pressed');
      }, true);
    });
  },
  enhanceControls: function (title) {
    this.init();
    document.body.classList.add('retrocade-controls-ready');

    document.querySelectorAll('button, .arcade-btn, .touch-btn').forEach(function (button) {
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.textContent.trim() || 'Arcade control');
      button.setAttribute('draggable', 'false');
    });

    document.querySelectorAll('[data-dir]').forEach(function (button) {
      const dir = button.dataset.dir || button.textContent.trim();
      button.classList.add('direction-control');
      button.setAttribute('aria-label', 'Move ' + dir);
    });

    const touch = document.querySelector('.touch-controls');
    if (touch) {
      touch.setAttribute('aria-label', title + ' arcade controls');
      touch.setAttribute('role', 'group');
      if (!touch.querySelector('.control-hint')) {
        const hint = document.createElement('div');
        hint.className = 'control-hint';
        hint.textContent = 'Keyboard: WASD / Arrows • Touch: big glowing controls';
        touch.appendChild(hint);
      }
    }

    const note = document.querySelector('.note');
    if (note && !note.querySelector('.control-chip')) {
      const chip = document.createElement('span');
      chip.className = 'control-chip';
      chip.textContent = 'Controls';
      note.prepend(chip);
    }

    this.mountHelp(title);
    RetroState.mount();
  },
  mountHelp: function (title) {
    if (document.getElementById('retro-help')) return;
    const help = document.createElement('aside');
    help.id = 'retro-help';
    help.setAttribute('aria-hidden', 'true');
    help.innerHTML = '<div class="retro-help-card"><button class="retro-help-close" type="button" onclick="RetroInput.closeHelp()">×</button><strong>' + title + ' CONTROLS</strong><p><b>Move:</b> WASD / Arrow Keys / Touch Buttons</p><p><b>Main Action:</b> Space / Enter / Big glowing button</p><p><b>Help:</b> H or ?</p><p><b>Back:</b> RETROCADE top-left link</p></div>';
    document.body.appendChild(help);
  },
  toggleHelp: function () {
    const help = document.getElementById('retro-help');
    if (!help) return;
    const isOpen = help.classList.toggle('open');
    help.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  },
  closeHelp: function () {
    const help = document.getElementById('retro-help');
    if (!help) return;
    help.classList.remove('open');
    help.setAttribute('aria-hidden', 'true');
  }
};

const RetroState = {
  mount: function () {
    if (document.getElementById('retro-state')) return;
    const overlay = document.createElement('aside');
    overlay.id = 'retro-state';
    overlay.className = 'retro-state';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="retro-state-card"><h1 id="retro-state-title">READY</h1><p id="retro-state-sub">PRESS START</p></div>';
    document.body.appendChild(overlay);
  },
  show: function (title, sub, type, ms) {
    this.mount();
    const overlay = document.getElementById('retro-state');
    const heading = document.getElementById('retro-state-title');
    const text = document.getElementById('retro-state-sub');
    if (!overlay || !heading || !text) return;
    overlay.className = 'retro-state show ' + (type || '');
    overlay.setAttribute('aria-hidden', 'false');
    heading.textContent = title || 'READY';
    text.textContent = sub || '';
    clearTimeout(window.__retroStateTimer);
    if (ms !== 0) window.__retroStateTimer = setTimeout(function () { RetroState.close(); }, ms || 1100);
    if (window.RetroAudio) {
      if (type === 'bigwin') RetroAudio.bigWin();
      else if (type === 'danger') RetroAudio.gameOver();
      else RetroAudio.confirm();
    }
  },
  close: function () {
    const overlay = document.getElementById('retro-state');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  }
};

function retroHeader(title) {
  retroLoadAudio();
  const bar = document.createElement('div');
  bar.className = 'top';
  bar.innerHTML = '<a href="../index.html">RETROCADE</a><b>' + title + '</b><span id="hud"></span><button class="help-toggle" type="button" onclick="RetroInput.toggleHelp()" aria-label="Show controls">?</button>';
  document.body.prepend(bar);
  retroHud();
  setTimeout(function () { RetroInput.enhanceControls(title); }, 0);
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
    toast.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:99;background:rgba(0,0,0,.9);border:2px solid #00ffcc;border-radius:999px;padding:10px 16px;color:#ffe66d;font-weight:1000;box-shadow:0 0 22px rgba(0,255,204,.35);opacity:0;transition:.18s;pointer-events:none;text-align:center;max-width:92vw';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = '1';
  clearTimeout(window.__retroToastTimer);
  window.__retroToastTimer = setTimeout(function () { toast.style.opacity = '0'; }, 1200);
}

function retroWin(tickets, xp, coins, cabinet) {
  const state = RetroStore.award(tickets || 10, xp || 20, coins || 0, cabinet || 'cabinet');
  retroHud();
  retroToast('+' + (tickets || 10) + ' tickets  +' + (xp || 20) + ' XP' + ((coins || 0) ? '  +' + coins + ' coins' : ''));
  if ((tickets || 0) >= 20 || (coins || 0) > 0) RetroState.show('BIG WIN', '+' + (tickets || 10) + ' TICKETS', 'bigwin', 900);
  return state;
}

function retroCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches && event.touches[0] ? event.touches[0] : event;
  return { x: ((source.clientX - rect.left) / rect.width) * canvas.width, y: ((source.clientY - rect.top) / rect.height) * canvas.height };
}

function retroBindHold(button, down, up) {
  if (!button) return;
  const release = up || function () {};
  button.addEventListener('pointerdown', function (event) { event.preventDefault(); button.classList.add('is-pressed'); down(event); });
  button.addEventListener('pointerup', function (event) { button.classList.remove('is-pressed'); release(event); });
  button.addEventListener('pointerleave', function (event) { button.classList.remove('is-pressed'); release(event); });
  button.addEventListener('pointercancel', function (event) { button.classList.remove('is-pressed'); release(event); });
}

function retroSafeBoot(label, fn) {
  try { fn(); } catch (error) { console.error('[RETROCADE]', label, error); retroToast('CABINET BOOT ERROR - patched mode needed'); }
}

window.addEventListener('error', function (event) {
  console.error('[RETROCADE ERROR]', event.error || event.message);
  retroToast('CABINET GLITCH CAUGHT');
});