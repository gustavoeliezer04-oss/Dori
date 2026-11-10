(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const board = $('#board');
  const difficulty = $('#difficulty');
  const timerEl = $('#timer');
  const movesEl = $('#moves');
  const pairsEl = $('#pairs');
  const progressEl = $('#progress');
  const hintEl = $('#hint');
  const soundButton = $('#sound-toggle');
  const helpDialog = $('#help-dialog');
  const winDialog = $('#win-dialog');
  const accountDialog = $('#account-dialog');
  let currentUser = null;
  const difficultyNames = { easy:'East Blue', normal:'Grand Line', hard:'Novo Mundo' };

  async function api(path, options = {}) {
    const response = await fetch('/api' + path, { credentials:'same-origin', headers:{ 'Content-Type':'application/json', ...(options.headers || {}) }, ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
    return data;
  }
  function renderAccount() {
    const button = $('#account-button');
    button.textContent = currentUser ? currentUser.username : 'Entrar';
    button.title = currentUser ? 'Conta de ' + currentUser.username : 'Entrar ou criar conta';
    $('#account-view').hidden = !currentUser;
    if (currentUser) { $('#account-username').textContent = currentUser.username; $('#account-email').textContent = currentUser.email; renderAccountRecords(); }
  }
  async function renderAccountRecords() {
    const target = $('#account-records');
    if (!currentUser) return;
    target.textContent = 'Carregando recordes...';
    try {
      const { records } = await api('/records'); target.replaceChildren();
      ['easy','normal','hard'].forEach(level => {
        const record = records.find(item => item.difficulty === level);
        const row = document.createElement('div'); row.className = 'account-record';
        const name = document.createElement('span'); name.textContent = difficultyNames[level];
        const score = document.createElement('strong'); score.textContent = record ? formatTime(record.seconds) + ' · ' + record.moves + ' tentativas' : 'Ainda sem recorde';
        row.append(name, score); target.appendChild(row);
      });
    } catch (error) { target.textContent = error.message; }
  }
  async function checkSession() {
    try { const data = await api('/me'); currentUser = data.user; } catch (_) { currentUser = null; }
    renderAccount();
    if (currentUser) enterGame(); else showAuth('login');
    updateBest();
  }
  function showAuth(mode = 'login') {
    $('#auth-screen').hidden = false;
    $('#game-screen').hidden = true;
    setAuthMode(mode === 'register');
  }
  function enterGame() {
    $('#auth-screen').hidden = true;
    $('#game-screen').hidden = false;
    renderAccount();
    updateBest();
  }
  function setAuthMode(register) {
    $('#login-form').hidden = register; $('#register-form').hidden = !register;
    $('#auth-title').textContent = register ? 'Junte-se à tripulação' : 'Entre para sua tripulação';
    $('#auth-description').textContent = register ? 'Crie sua conta e guarde seus recordes.' : 'Entre para acessar seus recordes salvos.';
    $('#login-tab').classList.toggle('active', !register);
    $('#register-tab').classList.toggle('active', register);
    $('#login-tab').setAttribute('aria-selected', String(!register));
    $('#register-tab').setAttribute('aria-selected', String(register));
    $('#login-error').textContent = ''; $('#register-error').textContent = '';
    $('#auth-description').textContent = register ? 'Crie sua conta e comece a guardar seus recordes.' : 'Entre na sua conta para acessar seus recordes.';
  }

  const seaLife = ['luffy','zoro','nami','usopp','sanji','chopper','robin','franky','brook','jinbe'];
  const pairCounts = { easy: 6, normal: 8, hard: 10 };
  const iconArt = {"luffy":{"label":"Luffy","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character1.jpg"},"zoro":{"label":"Zoro","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character2.jpg"},"nami":{"label":"Nami","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character3.jpg"},"usopp":{"label":"Usopp","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character4.jpg"},"sanji":{"label":"Sanji","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character5.jpg"},"chopper":{"label":"Chopper","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character6.jpg"},"robin":{"label":"Robin","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character7.jpg"},"franky":{"label":"Franky","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character8.jpg"},"brook":{"label":"Brook","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character9.jpg"},"jinbe":{"label":"Jinbe","src":"https://sp.shonenjump.com/j/rensai/img/onepiece_character10.jpg"}};
  let deck = [], firstCard = null, secondCard = null, locked = false;
  let moves = 0, matched = 0, seconds = 0, timerId = null, started = false;
  let soundOn = true, musicOn = true, audioContext = null, musicTimer = null, musicStep = 0;

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function formatTime(value) {
    const min = Math.floor(value / 60).toString().padStart(2, '0');
    const sec = (value % 60).toString().padStart(2, '0');
    return min + ':' + sec;
  }

  function playTone(frequency = 440, duration = .09, type = 'sine') {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(.055, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* áudio é opcional */ }
  }


  // Melodia original em clima de cantiga marítima; não reproduz a composição de Binks' Sake.
  const shantyNotes = [440,523.25,587.33,659.25,587.33,523.25,392,440,349.23,392,440,523.25,493.88,440,392,349.23];
  const shantyBass = [110,0,146.83,0,130.81,0,98,0];
  function playMusicNote(frequency, duration = .3, volume = .018) {
    if (!musicOn || !audioContext || !frequency) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.type = 'triangle'; filter.type = 'lowpass'; filter.frequency.value = 1500;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
    osc.start(now); osc.stop(now + duration + .02);
  }
  function musicLoop() {
    if (!musicOn || !audioContext) return;
    const note = shantyNotes[musicStep % shantyNotes.length];
    playMusicNote(note, .27, .018);
    if (musicStep % 2 === 0) playMusicNote(shantyBass[(musicStep / 2) % shantyBass.length], .42, .012);
    musicStep++;
    musicTimer = window.setTimeout(musicLoop, 330);
  }
  function startMusic() {
    if (!musicOn || musicTimer !== null) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      musicLoop();
    } catch (_) { /* música opcional */ }
  }
  function stopMusic() {
    if (musicTimer !== null) window.clearTimeout(musicTimer);
    musicTimer = null;
  }

  function startTimer() {
    if (started) return;
    started = true;
    startMusic();
    timerId = window.setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
  }

  async function updateBest() {
    const label = $('#best-score');
    if (!currentUser) { label.textContent = 'Entre para salvar seus recordes'; return; }
    try {
      const { records } = await api('/records');
      const best = records.find(item => item.difficulty === difficulty.value);
      label.textContent = best ? 'Seu recorde: ' + formatTime(best.seconds) + ' · ' + best.moves + ' tentativas' : 'Seu recorde: —';
    } catch (_) { label.textContent = 'Recorde indisponível'; }
  }
  async function saveBest() {
    if (!currentUser) return false;
    try {
      const result = await api('/records', { method:'POST', body:JSON.stringify({ difficulty:difficulty.value, seconds:Math.max(1,seconds), moves:Math.max(1,moves) }) });
      return result.isRecord;
    } catch (error) { hintEl.textContent = 'Não foi possível salvar o recorde: ' + error.message; return false; }
  }

  function updateStats() {
    const total = pairCounts[difficulty.value];
    timerEl.textContent = formatTime(seconds);
    movesEl.textContent = moves;
    pairsEl.textContent = matched + '/' + total;
    progressEl.style.width = (matched / total * 100) + '%';
  }

  function createCard(animal, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.animal = animal;
    card.dataset.index = index;
    const icon = iconArt[animal];
    card.setAttribute('aria-label', 'Carta virada para baixo');
    card.innerHTML = '<span class="card-inner"><span class="card-face card-back" aria-hidden="true"><span class="card-back-mark">☠</span><small>GRAND LINE</small></span><span class="card-face card-front"><span class="card-art"><img src="' + icon.src + '" alt="' + icon.label + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span><small class="card-caption">' + icon.label + '</small></span></span>';
    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function newGame() {
    stopTimer();
    stopMusic();
    musicStep = 0;
    firstCard = secondCard = null;
    locked = false;
    moves = matched = seconds = 0;
    started = false;
    const total = pairCounts[difficulty.value];
    deck = shuffle(seaLife.slice(0, total).flatMap(animal => [animal, animal]));
    board.replaceChildren();
    board.className = 'board ' + (difficulty.value === 'hard' ? 'hard' : difficulty.value === 'easy' ? 'easy' : '');
    deck.forEach((animal, index) => board.appendChild(createCard(animal, index)));
    hintEl.textContent = 'Encontre dois desenhos iguais para formar um par.';
    updateStats();
    updateBest();
    if (winDialog.open) winDialog.close();
  }

  function flipCard(card) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    startTimer();
    card.classList.add('flipped');
    card.setAttribute('aria-label', 'Personagem revelado: ' + iconArt[card.dataset.animal].label);
    playTone(520, .07);
    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves++;
    movesEl.textContent = moves;
    if (firstCard.dataset.animal === secondCard.dataset.animal) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      firstCard.disabled = secondCard.disabled = true;
      firstCard.setAttribute('aria-label', 'Par encontrado: ' + iconArt[firstCard.dataset.animal].label);
      secondCard.setAttribute('aria-label', 'Par encontrado: ' + iconArt[secondCard.dataset.animal].label);
      matched++;
      firstCard = secondCard = null;
      updateStats();
      hintEl.textContent = 'Boa! Mais um par encontrado. Continue assim!';
      playTone(740, .12);
      if (matched === pairCounts[difficulty.value]) finishGame();
    } else {
      locked = true;
      hintEl.textContent = 'Não foi dessa vez! Tente memorizar as posições.';
      window.setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.setAttribute('aria-label', 'Carta virada para baixo');
        secondCard.setAttribute('aria-label', 'Carta virada para baixo');
        firstCard = secondCard = null;
        locked = false;
      }, 850);
    }
  }

  async function finishGame() {
    stopTimer();
    const isRecord = await saveBest();
    $('#final-time').textContent = formatTime(seconds);
    $('#final-moves').textContent = moves;
    hintEl.textContent = currentUser ? 'Você encontrou todos os pares. Parabéns!' : 'Entre ou crie uma conta para salvar seu recorde.';
    updateBest();
    winDialog.querySelector('.new-record')?.remove();
    if (isRecord) {
      const label = document.createElement('p');
      label.className = 'eyebrow new-record';
      label.textContent = '✦ NOVO RECORDE SALVO NA SUA CONTA!';
      winDialog.querySelector('.win-stats').after(label);
    }
    window.setTimeout(() => {
      if (!winDialog.open) winDialog.showModal();
      playTone(660, .16);
      window.setTimeout(() => playTone(880, .2), 140);
    }, 450);
  }


  $('#account-button').addEventListener('click', () => {
    if (!currentUser) { showAuth('login'); return; }
    renderAccount();
    accountDialog.showModal();
  });
  $('#guest-button').addEventListener('click', enterGame);
  $('#login-tab').addEventListener('click', () => setAuthMode(false));
  $('#register-tab').addEventListener('click', () => setAuthMode(true));
  $('#login-form').addEventListener('submit', async event => {
    event.preventDefault(); const error = $('#login-error'); error.textContent = '';
    const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const data = await api('/login', { method:'POST', body:JSON.stringify({ email:$('#login-email').value, password:$('#login-password').value }) });
      currentUser = data.user; event.currentTarget.reset(); enterGame();
    } catch (err) { error.textContent = err.message; } finally { button.disabled = false; }
  });
  $('#register-form').addEventListener('submit', async event => {
    event.preventDefault(); const error = $('#register-error'); error.textContent = '';
    const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const data = await api('/register', { method:'POST', body:JSON.stringify({ username:$('#register-username').value, email:$('#register-email').value, password:$('#register-password').value }) });
      currentUser = data.user; event.currentTarget.reset(); enterGame();
    } catch (err) { error.textContent = err.message; } finally { button.disabled = false; }
  });
  $('#logout-button').addEventListener('click', async () => {
    try { await api('/logout', { method:'POST', body:'{}' }); } catch (_) {}
    currentUser = null; renderAccount(); updateBest(); accountDialog.close(); showAuth('login');
  });

  $('#restart').addEventListener('click', newGame);
  difficulty.addEventListener('change', newGame);
  $('#play-again').addEventListener('click', newGame);
  $('#help-button').addEventListener('click', () => helpDialog.showModal());
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $('#music-toggle').addEventListener('click', () => {
    musicOn = !musicOn;
    $('#music-toggle').textContent = musicOn ? '🎵' : '🎼';
    $('#music-toggle').title = musicOn ? 'Música ligada' : 'Música desligada';
    $('#music-toggle').setAttribute('aria-label', musicOn ? 'Desligar música' : 'Ligar música');
    if (musicOn && started) startMusic(); else stopMusic();
  });
  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? '🔊' : '🔇';
    soundButton.setAttribute('aria-label', soundOn ? 'Desativar sons' : 'Ativar sons');
    soundButton.title = soundOn ? 'Som ligado' : 'Som desligado';
    if (soundOn) playTone(620, .08);
  });

  newGame();
  checkSession();
})();