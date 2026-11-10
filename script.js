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

  const seaLife = ['🐙','🐬','🦀','🐢','🐠','🪼','🦈','🐳','🦑','🦭','🦐','🐡'];
  const pairCounts = { easy: 6, normal: 8, hard: 12 };
  let deck = [], firstCard = null, secondCard = null, locked = false;
  let moves = 0, matched = 0, seconds = 0, timerId = null, started = false;
  let soundOn = true, audioContext = null;

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

  function startTimer() {
    if (started) return;
    started = true;
    timerId = window.setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
  }

  function getBest() {
    try {
      const value = localStorage.getItem('dori-best-' + difficulty.value);
      return value ? JSON.parse(value) : null;
    } catch (_) { return null; }
  }

  function updateBest() {
    const best = getBest();
    $('#best-score').textContent = best
      ? 'Recorde: ' + formatTime(best.seconds) + ' · ' + best.moves + ' tentativas'
      : 'Seu recorde: —';
  }

  function saveBest() {
    const previous = getBest();
    if (!previous || seconds < previous.seconds || (seconds === previous.seconds && moves < previous.moves)) {
      try { localStorage.setItem('dori-best-' + difficulty.value, JSON.stringify({ seconds, moves })); } catch (_) {}
      return true;
    }
    return false;
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
    card.setAttribute('aria-label', 'Carta virada para baixo');
    card.innerHTML = '<span class="card-inner"><span class="card-face card-back" aria-hidden="true"></span><span class="card-face card-front" aria-hidden="true">' + animal + '</span></span>';
    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function newGame() {
    stopTimer();
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
    card.setAttribute('aria-label', 'Carta revelada: ' + card.dataset.animal);
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
      firstCard.setAttribute('aria-label', 'Par encontrado: ' + firstCard.dataset.animal);
      secondCard.setAttribute('aria-label', 'Par encontrado: ' + secondCard.dataset.animal);
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

  function finishGame() {
    stopTimer();
    const isRecord = saveBest();
    $('#final-time').textContent = formatTime(seconds);
    $('#final-moves').textContent = moves;
    hintEl.textContent = 'Você encontrou todos os pares. Parabéns!';
    updateBest();
    if (isRecord) {
      const label = document.createElement('p');
      label.className = 'eyebrow';
      label.textContent = '✦ NOVO RECORDE!';
      winDialog.querySelector('.win-stats').after(label);
    }
    window.setTimeout(() => {
      if (!winDialog.open) winDialog.showModal();
      playTone(660, .16);
      window.setTimeout(() => playTone(880, .2), 140);
    }, 450);
  }

  $('#restart').addEventListener('click', newGame);
  difficulty.addEventListener('change', newGame);
  $('#play-again').addEventListener('click', newGame);
  $('#help-button').addEventListener('click', () => helpDialog.showModal());
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? '🔊' : '🔇';
    soundButton.setAttribute('aria-label', soundOn ? 'Desativar sons' : 'Ativar sons');
    soundButton.title = soundOn ? 'Som ligado' : 'Som desligado';
    if (soundOn) playTone(620, .08);
  });

  newGame();
})();