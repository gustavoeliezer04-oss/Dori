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

  const seaLife = ['luffy','zoro','nami','usopp','sanji','chopper','robin','franky','brook','sunny'];
  const pairCounts = { easy: 6, normal: 8, hard: 10 };
  const iconArt = {"luffy":{"label":"Chapéu de palha","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M24 65Q50 10 76 65Q50 77 24 65Z\" fill=\"#e9b94f\" stroke=\"#243746\" stroke-width=\"4\"/><path d=\"M23 62Q50 71 77 62L74 75Q50 84 26 75Z\" fill=\"#c94d43\" stroke=\"#243746\" stroke-width=\"4\"/><path d=\"M10 78Q50 65 90 78Q50 96 10 78Z\" fill=\"#e9b94f\" stroke=\"#243746\" stroke-width=\"4\"/></svg>"},"zoro":{"label":"Três espadas","svg":"<svg viewBox=\"0 0 100 100\"><g stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 82 78 20M40 90 88 38M12 57 60 9\" stroke=\"#263b49\" stroke-width=\"11\"/><path d=\"M20 82 78 20M40 90 88 38M12 57 60 9\" stroke=\"#d8e0dc\" stroke-width=\"6\"/><path d=\"m15 78 12 11m8-4 12 11M7 52l12 11\" stroke=\"#c94d43\" stroke-width=\"8\"/></g></svg>"},"nami":{"label":"Clima-tact","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M50 12v76\" stroke=\"#263b49\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M50 12v76\" stroke=\"#e9b94f\" stroke-width=\"4\"/><circle cx=\"50\" cy=\"20\" r=\"12\" fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"4\"/><circle cx=\"50\" cy=\"80\" r=\"12\" fill=\"#5ba7b7\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M50 4v8m0 76v8\" stroke=\"#263b49\" stroke-width=\"4\"/></svg>"},"usopp":{"label":"Estilingue","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M23 83 50 53 77 83M50 53V18\" fill=\"none\" stroke=\"#263b49\" stroke-width=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M23 83 50 53 77 83M50 53V18\" fill=\"none\" stroke=\"#b47b43\" stroke-width=\"5\"/><path d=\"M50 18Q29 26 23 14M50 18Q71 26 77 14\" fill=\"none\" stroke=\"#c94d43\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"18\" r=\"7\" fill=\"#e9b94f\" stroke=\"#263b49\" stroke-width=\"3\"/></svg>"},"sanji":{"label":"Chama azul","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M51 8Q65 34 55 47Q72 38 72 25Q96 67 73 86Q51 105 28 84Q9 63 34 39Q35 55 43 59Q39 33 51 8Z\" fill=\"#e9b94f\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M52 51Q67 68 57 83Q43 91 39 78Q35 66 52 51Z\" fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"3\"/></svg>"},"chopper":{"label":"Chapéu rosa","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M19 65Q18 25 50 20Q82 25 81 65Z\" fill=\"#e8e0c9\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M12 63Q50 51 88 63L84 79Q50 67 16 79Z\" fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M36 43h28\" stroke=\"#e9b94f\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M50 34v18M41 43h18\" stroke=\"#263b49\" stroke-width=\"3\"/></svg>"},"robin":{"label":"Flor de arqueóloga","svg":"<svg viewBox=\"0 0 100 100\"><g fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"3\"><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\"/><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\" transform=\"rotate(60 50 50)\"/><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\" transform=\"rotate(120 50 50)\"/><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\" transform=\"rotate(180 50 50)\"/><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\" transform=\"rotate(240 50 50)\"/><ellipse cx=\"50\" cy=\"25\" rx=\"10\" ry=\"22\" transform=\"rotate(300 50 50)\"/></g><circle cx=\"50\" cy=\"50\" r=\"10\" fill=\"#e9b94f\" stroke=\"#263b49\" stroke-width=\"3\"/><path d=\"M50 60v28\" stroke=\"#4e8a70\" stroke-width=\"5\"/></svg>"},"franky":{"label":"Garrafa de cola","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M37 10h26v16l9 12v48q0 7-8 7H36q-8 0-8-7V38l9-12Z\" fill=\"#5ba7b7\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M37 10h26v12H37Z\" fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M29 59h42v20H29Z\" fill=\"#e9b94f\" stroke=\"#263b49\" stroke-width=\"3\"/><path d=\"m52 60-9 10h8l-3 8 13-13h-9l4-5Z\" fill=\"#fff8e7\"/></svg>"},"brook":{"label":"Violino soul","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M50 10v80\" stroke=\"#263b49\" stroke-width=\"5\"/><path d=\"M50 37Q30 13 24 35Q20 48 37 53Q18 72 38 82Q48 87 50 69Q66 88 79 77Q91 63 68 53Q86 36 73 27Q61 19 50 37Z\" fill=\"#b47b43\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M50 38v31M36 53h28\" stroke=\"#f5e5bf\" stroke-width=\"3\"/><path d=\"M34 14q16-9 32 0\" fill=\"none\" stroke=\"#c94d43\" stroke-width=\"5\" stroke-linecap=\"round\"/></svg>"},"sunny":{"label":"Thousand Sunny","svg":"<svg viewBox=\"0 0 100 100\"><path d=\"M10 69Q50 84 90 69L78 88H22Z\" fill=\"#b47b43\" stroke=\"#263b49\" stroke-width=\"4\"/><path d=\"M50 10v61\" stroke=\"#263b49\" stroke-width=\"5\"/><path d=\"M46 16 19 60h27Z\" fill=\"#f5f0e5\" stroke=\"#263b49\" stroke-width=\"3\"/><path d=\"M55 25 82 61H55Z\" fill=\"#c94d43\" stroke=\"#263b49\" stroke-width=\"3\"/><circle cx=\"50\" cy=\"71\" r=\"10\" fill=\"#e9b94f\" stroke=\"#263b49\" stroke-width=\"3\"/><path d=\"M44 71h12m-6-6v12\" stroke=\"#263b49\" stroke-width=\"2\"/></svg>"}};
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

  function getBest() {
    try {
      const value = localStorage.getItem('memory-piece-best-' + difficulty.value);
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
      try { localStorage.setItem('memory-piece-best-' + difficulty.value, JSON.stringify({ seconds, moves })); } catch (_) {}
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
    const icon = iconArt[animal];
    card.setAttribute('aria-label', 'Carta virada para baixo');
    card.innerHTML = '<span class="card-inner"><span class="card-face card-back" aria-hidden="true"><span class="card-back-mark">☠</span><small>GRAND LINE</small></span><span class="card-face card-front" role="img" aria-label="' + icon.label + '"><span class="card-art">' + icon.svg + '</span><small class="card-caption">' + icon.label + '</small></span></span>';
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
    card.setAttribute('aria-label', 'Retrato revelado: ' + card.dataset.animal);
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
    winDialog.querySelector('.new-record')?.remove();
    if (isRecord) {
      const label = document.createElement('p');
      label.className = 'eyebrow new-record';
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
})();