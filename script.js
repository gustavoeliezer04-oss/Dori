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
  const iconArt = {"luffy":{"label":"Luffy","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#f2bd45\" d=\"M17 38Q22 8 58 8Q94 8 103 38L110 48Q62 40 10 49Z\"/><path fill=\"#d94335\" d=\"M12 42Q59 34 108 43L111 54Q60 46 9 56Z\"/><path fill=\"#f0bf4d\" d=\"M5 53Q58 44 115 54Q107 67 60 68Q17 67 5 53Z\"/><path fill=\"#f0c18a\" d=\"M25 63Q20 88 37 104Q59 119 82 103Q99 88 92 62Q77 52 60 56Q42 53 25 63Z\"/><path fill=\"#fff\" d=\"M34 78q8-8 17 0q-8 12-17 0m25 0q9-8 17 0q-8 12-17 0\" stroke-width=\"2.5\"/><path fill=\"#17212a\" d=\"M43 78q4-5 7 0q-2 8-6 5m20-5q4-5 7 0q-2 8-6 5\" stroke-width=\"1\"/><path fill=\"none\" d=\"M53 91q7 5 14 0M48 97q12 5 24 0\" stroke-width=\"2.4\"/><path fill=\"none\" d=\"M48 86q3 4 6 0m12 0q3 4 6 0\" stroke=\"#b65b4a\" stroke-width=\"2\"/></g><path d=\"M29 18l-7 9m16-13-5 10m46-8 8 10m-1-15 8 10\" stroke=\"#8c5b2b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"zoro":{"label":"Zoro","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#75a96a\" d=\"M20 54Q13 18 42 13Q64 2 87 20Q106 37 96 67L83 90H30Z\"/><path fill=\"#f0c48e\" d=\"M29 49Q60 35 91 50L88 91Q75 110 57 108Q36 105 29 87Z\"/><path fill=\"#75a96a\" d=\"M22 49Q30 35 43 36L51 50L60 34L71 49L84 36Q96 39 99 53L91 67L79 60L68 70L56 59L44 69L31 60Z\"/><path fill=\"#17212a\" d=\"M34 71l19 3-4 7-17-4m36-6 18-4-2 9-18 5\" stroke-width=\"2\"/><path fill=\"none\" d=\"M49 91q11 7 23-1\" stroke-width=\"3\"/><path fill=\"#b94b42\" d=\"M43 110l-7 6m13-7-3 8m35-8 7 6\" stroke-width=\"2\"/></g><path d=\"M31 24l-8 12m17-17-5 12m49-8 8 11\" stroke=\"#d9e6c8\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M17 15l85 91\" stroke=\"#d8dce0\" stroke-width=\"4\" opacity=\".9\"/></svg>"},"nami":{"label":"Nami","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#f28b32\" d=\"M23 53Q9 18 44 9Q77-1 94 26Q109 51 94 92L80 108H30L18 84Z\"/><path fill=\"#f4c997\" d=\"M31 48Q60 34 87 50L84 91Q72 108 56 106Q35 102 29 82Z\"/><path fill=\"#f28b32\" d=\"M28 50Q37 35 51 39Q65 43 69 28Q76 45 91 43L91 61Q80 57 75 51Q62 66 46 55L30 69Z\"/><path fill=\"#fff\" d=\"M39 73q8-7 15 1q-7 10-15-1m22 0q8-7 15 1q-7 10-15-1\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M45 74q4-5 7 1m15-1q4-5 7 1\" stroke-width=\"2\"/><path fill=\"none\" d=\"M51 91q9 6 18-1\" stroke-width=\"3\"/><path fill=\"none\" d=\"M24 72q-8 9-3 21m76-25q9 12 2 23\" stroke-width=\"3\"/></g><path d=\"M35 16l-7 13m20-16-5 12m38-4 8 12\" stroke=\"#ffd18a\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"usopp":{"label":"Usopp","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#c58b42\" d=\"M17 61Q9 23 49 13Q83 3 99 35L101 78L84 104H34L17 82Z\"/><path fill=\"#eebf8a\" d=\"M29 52Q60 37 89 53L84 90Q69 107 52 103Q33 98 29 80Z\"/><path fill=\"#c58b42\" d=\"M29 48Q47 31 65 39Q83 31 92 51L83 60Q69 48 59 54Q43 48 31 63Z\"/><path fill=\"#17212a\" d=\"M36 70q10-9 18 1m8-1q10-10 19-1\" fill=\"none\" stroke-width=\"4\"/><path fill=\"#fff\" d=\"M39 75q7-8 14 0q-7 9-14 0m24 0q7-8 14 0q-7 9-14 0\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M47 75q3-4 5 0m19 0q3-4 5 0\" stroke-width=\"2\"/><path fill=\"none\" d=\"M49 91q10 6 20-1\" stroke-width=\"3\"/><path fill=\"none\" d=\"M60 79q-3 7 1 9\" stroke-width=\"2\"/><path fill=\"#a85e3d\" d=\"M34 105q-9 8-13 2m65-2q9 8 13 2\" stroke-width=\"3\"/></g><path d=\"M21 30l-8 11m22-23-5 12m48-14 8 12\" stroke=\"#e6c17f\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"sanji":{"label":"Sanji","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#f0d05a\" d=\"M21 59Q9 21 42 11Q79-3 96 31Q108 61 91 91L75 107H34L20 84Z\"/><path fill=\"#f0c28e\" d=\"M30 50Q59 35 88 51L85 90Q73 107 56 105Q36 102 29 82Z\"/><path fill=\"#f0d05a\" d=\"M26 49Q34 31 48 36Q58 39 66 24Q71 41 90 44L89 62Q76 54 70 48Q54 62 43 53L29 67Z\"/><path fill=\"#17212a\" d=\"M35 72q10-8 19 0m11-1q9-8 16-1\" fill=\"none\" stroke-width=\"3\"/><path fill=\"#fff\" d=\"M38 77q7-7 14 0q-7 8-14 0m27 0q7-7 13 0q-7 8-13 0\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M44 77q3-4 5 0m23 0q3-4 5 0\" stroke-width=\"2\"/><path fill=\"none\" d=\"M50 92q10 6 19-1\" stroke-width=\"3\"/><path fill=\"none\" d=\"M66 82q-2 5 2 7\" stroke=\"#b85a48\" stroke-width=\"2.5\"/></g><path d=\"M34 18l-6 12m18-15-4 11m40-4 8 12\" stroke=\"#fff0a4\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"chopper":{"label":"Chopper","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#9a6b46\" d=\"M17 66Q12 23 60 14Q107 24 102 66L88 101H31Z\"/><path fill=\"#e9b88d\" d=\"M29 56Q60 40 90 57L83 91Q70 106 57 105Q38 102 30 86Z\"/><path fill=\"#e9e2cf\" d=\"M13 50Q8 12 59 8Q111 13 107 50L91 61Q60 45 29 61Z\"/><path fill=\"#d94b42\" d=\"M10 47Q60 34 110 47L105 62Q60 51 15 63Z\"/><path fill=\"#fff\" d=\"M37 73q8-8 16 0q-8 10-16 0m24 0q8-8 16 0q-8 10-16 0\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M44 73q3-5 6 0m17 0q3-5 6 0\" stroke-width=\"2\"/><path fill=\"none\" d=\"M50 90q10 7 20 0\" stroke-width=\"3\"/><path fill=\"#e9b88d\" d=\"M13 70q-8-3-9 6q0 10 13 9m90-15q8-3 9 6q0 10-13 9\" stroke-width=\"3\"/></g><path d=\"M32 17l-7 13m20-17-4 12m39-8 7 13\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"robin":{"label":"Robin","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#342a35\" d=\"M20 60Q10 13 58 9Q104 12 100 63L91 107H28Z\"/><path fill=\"#e9bd96\" d=\"M31 48Q60 34 88 51L84 91Q71 106 57 104Q38 101 30 82Z\"/><path fill=\"#342a35\" d=\"M25 49Q32 19 55 21Q77 14 94 42L87 56Q77 41 69 31Q57 50 43 48L29 66Z\"/><path fill=\"#fff\" d=\"M38 72q8-7 15 0q-7 9-15 0m23 0q8-7 15 0q-7 9-15 0\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M44 72q3-4 6 0m17 0q3-4 6 0\" stroke-width=\"2\"/><path fill=\"none\" d=\"M50 90q10 6 20-1\" stroke-width=\"3\"/><path fill=\"none\" d=\"M34 61q-7 8-4 16m57-16q7 8 4 16\" stroke=\"#8d5c75\" stroke-width=\"2.5\"/></g><path d=\"M29 26l-7 14m18-21-5 12m44-8 8 13\" stroke=\"#776779\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"franky":{"label":"Franky","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#48a9bd\" d=\"M18 55Q12 14 59 11Q108 14 101 57L92 95H27Z\"/><path fill=\"#efc28c\" d=\"M30 50Q60 36 89 51L84 89Q72 106 56 104Q37 101 30 82Z\"/><path fill=\"#48a9bd\" d=\"M20 47Q28 26 47 31L59 40L73 30Q92 26 99 48L88 62L73 52L60 60L45 51L29 62Z\"/><path fill=\"#17212a\" d=\"M35 69l18 3-5 9-17-3m37-7 18-3-3 10-17 4\" stroke-width=\"3\"/><path fill=\"#fff\" d=\"M38 74l11 2-4 5-8-2m28-5 11-2-3 6-8 2\" stroke-width=\"1.5\"/><path fill=\"none\" d=\"M48 91q12 8 24-1\" stroke-width=\"3\"/><path fill=\"#d94b42\" d=\"M18 83q-11 7-4 18l14-4m75-14q11 7 4 18l-14-4\" stroke-width=\"3\"/></g><path d=\"M30 19l-7 13m18-16-5 12m39-11 8 13\" stroke=\"#a7e4e8\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"brook":{"label":"Brook","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#24272c\" d=\"M17 62Q12 12 60 10Q108 14 102 62L90 107H30Z\"/><path fill=\"#f1e9d7\" d=\"M30 50Q60 37 90 50L86 90Q72 106 59 106Q42 104 31 88Z\"/><path fill=\"#24272c\" d=\"M22 49Q30 18 59 22Q83 17 98 47L88 62L77 49L65 58L54 46L42 59L29 62Z\"/><path fill=\"#17212a\" d=\"M39 72l13 0m16 0 13 0\" stroke-width=\"5\"/><path fill=\"none\" d=\"M48 91q12 7 24 0\" stroke-width=\"3\"/><path fill=\"none\" d=\"M54 79l5 5 5-5\" stroke-width=\"2\"/><path fill=\"#d94b42\" d=\"M37 52q10-12 20 0m7 0q10-12 20 0\" stroke-width=\"3\"/></g><path d=\"M29 26l-7 14m18-20-4 12m44-10 8 14\" stroke=\"#777c80\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"},"sunny":{"label":"Jinbe","svg":"<svg viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#17212a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#5ca5bc\" d=\"M13 63Q10 18 60 12Q109 18 107 63L91 102H28Z\"/><path fill=\"#e9b98d\" d=\"M28 52Q60 37 91 52L84 90Q72 107 57 105Q38 102 29 85Z\"/><path fill=\"#5ca5bc\" d=\"M18 49Q28 29 43 31L60 42L76 29Q93 30 102 49L89 62L75 52L60 61L44 51L29 63Z\"/><path fill=\"#17212a\" d=\"M35 71q10-8 18 0m13 0q10-8 18 0\" fill=\"none\" stroke-width=\"4\"/><path fill=\"#fff\" d=\"M39 75q7-7 13 0q-6 8-13 0m27 0q7-7 13 0q-6 8-13 0\" stroke-width=\"2\"/><path fill=\"#17212a\" d=\"M45 75q3-4 5 0m28 0q3-4 5 0\" stroke-width=\"2\"/><path fill=\"none\" d=\"M49 91q11 7 22-1\" stroke-width=\"3\"/><path fill=\"none\" d=\"M20 78l-10 8m90-8 10 8\" stroke=\"#e9b98d\" stroke-width=\"4\"/></g><path d=\"M29 24l-7 13m18-17-5 12m42-8 8 13\" stroke=\"#b6e0e8\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg>"}};
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