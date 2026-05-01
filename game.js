// ============================================================
//  CONFIG — API Key diinput langsung di browser, tidak disimpan di sini
//  Ably free tier: https://ably.com
// ============================================================
const ABLY_API_KEY = '';

// FLAGS di-load dari flags-data.js

const AVATARS = ['😎','🦊','🐼','🦁','🐯','🦄','🐸','🦋','🐺','🦅','🐙','🦈'];
const TIME_PER_QUESTION = 15;

// ============================================================
//  STATE
// ============================================================
let ably = null;
let channel = null;
let myId = null;
let myName = '';
let myAvatar = '';
let roomCode = '';
let isHost = false;
let players = {};
let questions = [];
let currentQ = 0;
let totalQ = 10;
let gameMode = 'flag-to-name'; // 'flag-to-name' | 'name-to-flag'
let timerInterval = null;
let countdownInterval = null;
let timeLeft = TIME_PER_QUESTION;
let answered = false;
let gameStarted = false;

// ============================================================
//  UTILS
// ============================================================
function genId() {
  return Math.random().toString(36).substr(2, 9);
}

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ============================================================
//  ABLY SETUP
// ============================================================
function getApiKey() {
  const stored = localStorage.getItem('ably_api_key');
  const inputEl = document.getElementById('input-apikey');
  if (inputEl && inputEl.value.trim()) return inputEl.value.trim();
  if (stored) return stored;
  return null;
}

function initAbly(apiKey) {
  return new Promise((resolve, reject) => {
    try {
      ably = new Ably.Realtime({ key: apiKey, clientId: myId });
      ably.connection.on('connected', () => resolve());
      ably.connection.on('failed', (err) => reject(err));
      setTimeout(() => reject(new Error('Connection timeout')), 8000);
    } catch (e) {
      reject(e);
    }
  });
}

// ============================================================
//  LOBBY ACTIONS
// ============================================================
async function createRoom() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) { showError('error-lobby', '⚠️ Masukkan nama kamu dulu!'); return; }

  const apiKey = getApiKey();
  if (!apiKey) {
    document.getElementById('apikey-group').style.display = 'block';
    document.getElementById('config-notice').style.display = 'block';
    showError('error-lobby', '⚠️ Masukkan Ably API Key kamu!');
    return;
  }

  myId = genId();
  myName = name;
  myAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  roomCode = genRoomCode();
  isHost = true;

  try {
    localStorage.setItem('ably_api_key', apiKey);
    await initAbly(apiKey);
    await joinChannel(roomCode);
    players[myId] = { name: myName, avatar: myAvatar, score: 0, answered: false, isHost: true };
    publishPresence();
    showWaitingRoom();
  } catch (e) {
    showError('error-lobby', '❌ Gagal konek: ' + e.message);
  }
}

async function joinRoom() {
  const name = document.getElementById('input-name').value.trim();
  const code = document.getElementById('input-room').value.trim().toUpperCase();
  if (!name) { showError('error-lobby', '⚠️ Masukkan nama kamu dulu!'); return; }
  if (code.length !== 6) { showError('error-lobby', '⚠️ Kode room harus 6 karakter!'); return; }

  const apiKey = getApiKey();
  if (!apiKey) {
    document.getElementById('apikey-group').style.display = 'block';
    document.getElementById('config-notice').style.display = 'block';
    showError('error-lobby', '⚠️ Masukkan Ably API Key kamu!');
    return;
  }

  myId = genId();
  myName = name;
  myAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  roomCode = code;
  isHost = false;

  try {
    localStorage.setItem('ably_api_key', apiKey);
    await initAbly(apiKey);
    await joinChannel(roomCode);
    players[myId] = { name: myName, avatar: myAvatar, score: 0, answered: false };
    publishPresence();
    showWaitingRoom();
  } catch (e) {
    showError('error-lobby', '❌ Gagal konek: ' + e.message);
  }
}

// ============================================================
//  CHANNEL
// ============================================================
async function joinChannel(code) {
  channel = ably.channels.get('flaggame-' + code);
  channel.subscribe('presence', onPresenceMsg);
  channel.subscribe('game-start', onGameStart);
  channel.subscribe('next-question', onNextQuestion);
  channel.subscribe('game-end', onGameEnd);
  channel.subscribe('play-again', onPlayAgain);
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function publishPresence() {
  channel.publish('presence', {
    type: 'join',
    id: myId,
    name: myName,
    avatar: myAvatar,
    score: 0,
    isHost: isHost
  });
}

// ============================================================
//  WAITING ROOM
// ============================================================
function showWaitingRoom() {
  document.getElementById('display-room-code').textContent = roomCode;
  document.getElementById('host-controls').style.display = isHost ? 'block' : 'none';
  document.getElementById('guest-waiting').style.display = isHost ? 'none' : 'block';
  renderPlayersList();
  showScreen('waiting');
}

function renderPlayersList() {
  const ul = document.getElementById('players-list');
  ul.innerHTML = '';
  const sorted = Object.entries(players).sort((a, b) => {
    if (a[1].isHost) return -1;
    if (b[1].isHost) return 1;
    return 0;
  });
  sorted.forEach(([id, p]) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="avatar">${p.avatar}</span>
      <span>${p.name}</span>
      ${p.isHost ? '<span class="badge-host">HOST</span>' : ''}
      ${id === myId ? '<span class="badge-you">KAMU</span>' : ''}
    `;
    ul.appendChild(li);
  });
  const count = Object.keys(players).length;
  document.getElementById('waiting-status').textContent =
    `${count} pemain di room · Butuh minimal 1 pemain untuk mulai`;
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode).then(() => {
    showToast('✅ Kode room disalin: ' + roomCode);
  }).catch(() => {
    showToast('Kode: ' + roomCode);
  });
}

function leaveRoom() {
  if (channel) {
    channel.publish('presence', { type: 'leave', id: myId });
    channel.unsubscribe();
  }
  if (ably) ably.close();
  ably = null; channel = null;
  players = {};
  gameStarted = false;
  showScreen('lobby');
}

// ============================================================
//  PRESENCE MESSAGES
// ============================================================
function onPresenceMsg(msg) {
  const d = msg.data;
  if (d.type === 'join') {
    players[d.id] = { name: d.name, avatar: d.avatar, score: d.score || 0, answered: false, isHost: d.isHost };
    if (d.id !== myId) showToast(`${d.avatar} ${d.name} bergabung!`);
    renderPlayersList();
    if (isHost) {
      setTimeout(() => {
        channel.publish('presence', {
          type: 'join', id: myId, name: myName,
          avatar: myAvatar, score: players[myId]?.score || 0, isHost: true
        });
      }, 500);
    }
  } else if (d.type === 'leave') {
    if (players[d.id]) {
      showToast(`${players[d.id].avatar} ${players[d.id].name} keluar`);
      delete players[d.id];
      renderPlayersList();
    }
  } else if (d.type === 'score-update') {
    if (players[d.id]) {
      players[d.id].score = d.score;
      players[d.id].answered = d.answered;
      renderLiveScoreboard();
    }
  }
}

// ============================================================
//  GAME GENERATION (host only)
// ============================================================
function generateQuestions(count, mode) {
  const shuffled = shuffle(FLAGS).slice(0, count);
  return shuffled.map(item => {
    const wrong = shuffle(FLAGS.filter(f => f.name !== item.name)).slice(0, 3);
    if (mode === 'flag-to-name') {
      // Tampilkan gambar bendera, tebak nama negara
      return {
        mode: 'flag-to-name',
        flag: item.flag,
        answer: item.name,
        options: shuffle([item.name, ...wrong.map(w => w.name)])
      };
    } else {
      // Tampilkan nama negara, tebak gambar bendera
      return {
        mode: 'name-to-flag',
        name: item.name,
        answer: item.flag,
        options: shuffle([item.flag, ...wrong.map(w => w.flag)])
      };
    }
  });
}

function startGame() {
  totalQ = parseInt(document.getElementById('select-questions').value);
  gameMode = document.getElementById('select-mode').value;
  questions = generateQuestions(totalQ, gameMode);
  currentQ = 0;

  Object.keys(players).forEach(id => {
    players[id].score = 0;
    players[id].answered = false;
  });

  channel.publish('game-start', {
    questions: questions,
    totalQ: totalQ,
    gameMode: gameMode,
    players: players
  });
}

// ============================================================
//  COUNTDOWN
// ============================================================
function preloadAllGameImages() {
  const urls = new Set();

  questions.forEach(q => {
    if (q.mode === 'flag-to-name') {
      // Preload gambar bendera soal
      urls.add(`https://flagcdn.com/w160/${q.flag}.png`);
      urls.add(`https://flagcdn.com/w320/${q.flag}.png`);
    } else {
      // Preload semua opsi gambar bendera
      q.options.forEach(code => {
        urls.add(`https://flagcdn.com/w160/${code}.png`);
      });
    }
  });

  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });

  console.log(`[Preload] ${urls.size} gambar bendera dimuat di background...`);
}

function showCountdown(callback) {
  showScreen('countdown');

  // Mulai preload semua gambar selama countdown berlangsung
  preloadAllGameImages();

  let count = 3;
  const el = document.getElementById('countdown-number');
  const sub = document.getElementById('countdown-sub');
  el.textContent = count;
  el.style.color = '#4fc3f7';
  sub.textContent = gameMode === 'flag-to-name' ? '🏳️ Tebak nama negara!' : '🔤 Tebak benderanya!';

  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      el.textContent = count;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'countPop 0.5s ease';
    } else {
      clearInterval(countdownInterval);
      el.textContent = 'GO!';
      el.style.color = '#66bb6a';
      setTimeout(callback, 700);
    }
  }, 1000);
}

// ============================================================
//  GAME EVENTS
// ============================================================
function onGameStart(msg) {
  const d = msg.data;
  questions = d.questions;
  totalQ = d.totalQ;
  gameMode = d.gameMode;
  currentQ = 0;
  gameStarted = true;

  if (!isHost) {
    players = d.players;
    if (!players[myId]) {
      players[myId] = { name: myName, avatar: myAvatar, score: 0, answered: false };
    }
  }

  Object.keys(players).forEach(id => {
    players[id].score = 0;
    players[id].answered = false;
  });

  // Preload semua gambar dilakukan di showCountdown
  showCountdown(() => {
    showScreen('game');
    showQuestion(currentQ);
  });
}

function showQuestion(idx) {
  answered = false;
  timeLeft = TIME_PER_QUESTION;

  const q = questions[idx];
  document.getElementById('q-num').textContent = `${idx + 1}/${totalQ}`;
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('feedback').textContent = '';

  const flagDiv = document.getElementById('flag-display');
  const questionLabel = document.getElementById('question-label');

  if (q.mode === 'flag-to-name') {
    questionLabel.textContent = 'Negara mana ini?';
    flagDiv.style.display = 'block';

    const cachedImg = new Image();
    cachedImg.src = `https://flagcdn.com/w160/${q.flag}.png`;

    if (cachedImg.complete) {
      flagDiv.innerHTML = '';
      cachedImg.style.cssText = 'width:160px;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
      cachedImg.alt = 'Bendera';
      flagDiv.appendChild(cachedImg);
    } else {
      flagDiv.innerHTML = `<div class="spinner" style="width:50px;height:50px;margin:20px auto"></div>`;
      cachedImg.onload = () => {
        flagDiv.innerHTML = '';
        cachedImg.style.cssText = 'width:160px;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
        cachedImg.alt = 'Bendera';
        flagDiv.appendChild(cachedImg);
      };
      cachedImg.onerror = () => {
        flagDiv.innerHTML = `<div style="color:#aaa;padding:20px">⚠️ Gagal load</div>`;
      };
    }

    // Opsi: teks nama negara
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    grid.className = 'options-grid';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => submitAnswer(opt, q.answer, btn);
      grid.appendChild(btn);
    });

    preloadFlags(idx + 1, 3);

  } else {
    // Mode name-to-flag
    questionLabel.textContent = `Mana bendera ${q.name}?`;
    flagDiv.style.display = 'none';

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    grid.className = 'options-grid options-grid-flags';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn option-btn-flag';
      btn.dataset.code = opt;

      const img = new Image();
      img.src = `https://flagcdn.com/w160/${opt}.png`;
      img.style.cssText = 'width:100%;height:auto;border-radius:6px;display:block';
      img.alt = opt;
      btn.appendChild(img);

      btn.onclick = () => submitAnswer(opt, q.answer, btn);
      grid.appendChild(btn);
    });

    preloadFlagsForQuestion(idx + 1, 4);
  }

  renderLiveScoreboard();
  startTimer();
}

// ============================================================
//  PRELOAD
// ============================================================
function preloadFlags(fromIdx, count = 3) {
  for (let i = fromIdx; i < Math.min(fromIdx + count, questions.length); i++) {
    if (questions[i].mode === 'flag-to-name') {
      const img = new Image();
      img.src = `https://flagcdn.com/w320/${questions[i].flag}.png`;
    }
  }
}

function preloadFlagsForQuestion(fromIdx, count = 4) {
  for (let i = fromIdx; i < Math.min(fromIdx + 2, questions.length); i++) {
    if (questions[i].options) {
      questions[i].options.slice(0, count).forEach(code => {
        const img = new Image();
        img.src = `https://flagcdn.com/w160/${code}.png`;
      });
    }
  }
}

// ============================================================
//  TIMER
// ============================================================
function startTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById('timer');
  const bar = document.getElementById('progress-bar');

  timerEl.textContent = timeLeft;
  timerEl.className = 'timer';
  bar.style.width = '100%';

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    bar.style.width = (timeLeft / TIME_PER_QUESTION * 100) + '%';
    if (timeLeft <= 5) timerEl.className = 'timer urgent';

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!answered) {
        answered = true;
        const q = questions[currentQ];
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.disabled = true;
          const val = btn.dataset.code || btn.textContent;
          if (val === q.answer) btn.classList.add('correct');
        });
        const answerLabel = q.mode === 'flag-to-name'
          ? '⏰ Waktu habis! Jawaban: ' + q.answer
          : '⏰ Waktu habis!';
        showFeedback(false, answerLabel);
        broadcastScore(false);
        if (isHost) scheduleNextQuestion();
      }
    }
  }, 1000);
}

// ============================================================
//  ANSWER
// ============================================================
function submitAnswer(chosen, correct, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const isCorrect = chosen === correct;
  const points = isCorrect ? Math.max(100, Math.round(timeLeft / TIME_PER_QUESTION * 500)) : 0;

  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    const val = b.dataset.code || b.textContent;
    if (val === correct) b.classList.add('correct');
  });
  if (!isCorrect) btn.classList.add('wrong');

  if (isCorrect) {
    players[myId].score += points;
    showFeedback(true, `✅ Benar! +${points} poin`);
  } else {
    const q = questions[currentQ];
    const hint = q.mode === 'flag-to-name' ? ` Jawaban: ${correct}` : '';
    showFeedback(false, `❌ Salah!${hint}`);
  }

  broadcastScore(true);
  if (isHost) scheduleNextQuestion();
}

function showFeedback(correct, msg) {
  const fb = document.getElementById('feedback');
  fb.textContent = msg;
  fb.className = 'feedback show ' + (correct ? 'correct-fb' : 'wrong-fb');
}

function broadcastScore(hasAnswered) {
  channel.publish('presence', {
    type: 'score-update',
    id: myId,
    score: players[myId].score,
    answered: hasAnswered
  });
}

function scheduleNextQuestion() {
  setTimeout(() => {
    currentQ++;
    if (currentQ >= totalQ) {
      channel.publish('game-end', { scores: getScores() });
    } else {
      channel.publish('next-question', { index: currentQ });
    }
  }, 3000);
}

function onNextQuestion(msg) {
  currentQ = msg.data.index;
  Object.keys(players).forEach(id => players[id].answered = false);
  showQuestion(currentQ);
}

function onGameEnd(msg) {
  clearInterval(timerInterval);
  showResult(msg.data.scores);
}

// ============================================================
//  SCOREBOARD
// ============================================================
function getScores() {
  return Object.entries(players)
    .map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function renderLiveScoreboard() {
  const scores = getScores();
  const sb = document.getElementById('live-scoreboard');
  sb.innerHTML = scores.map((p, i) => `
    <div class="score-row">
      <span class="rank">#${i + 1}</span>
      <span>${p.avatar}</span>
      <span class="name">${p.name}${p.id === myId ? ' (kamu)' : ''}</span>
      <span class="pts">${p.score}</span>
    </div>
  `).join('');
}

// ============================================================
//  RESULT
// ============================================================
function showResult(scores) {
  showScreen('result');

  const podium = document.getElementById('podium');
  const top3 = scores.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const medals = ['🥈', '🥇', '🥉'];

  podium.innerHTML = podiumOrder.map((p, i) => `
    <div class="podium-item">
      <div class="p-avatar">${p.avatar}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-score">${p.score} pts</div>
      <div class="p-block">${medals[i]}</div>
    </div>
  `).join('');

  const ul = document.getElementById('final-scores');
  const rankEmoji = ['🥇', '🥈', '🥉'];
  ul.innerHTML = scores.map((p, i) => `
    <li>
      <span class="rank-num">${rankEmoji[i] || (i + 1) + '.'}</span>
      <span>${p.avatar}</span>
      <span class="f-name">${p.name}${p.id === myId ? ' <span style="color:#4fc3f7;font-size:0.8rem">(kamu)</span>' : ''}</span>
      <span class="f-score">${p.score} pts</span>
    </li>
  `).join('');
}

function playAgain() {
  if (isHost) {
    Object.keys(players).forEach(id => {
      players[id].score = 0;
      players[id].answered = false;
    });
    channel.publish('play-again', {});
    showWaitingRoom();
  } else {
    showToast('Tunggu host untuk mulai lagi...');
  }
}

function onPlayAgain(msg) {
  if (!isHost) {
    Object.keys(players).forEach(id => {
      players[id].score = 0;
      players[id].answered = false;
    });
    showWaitingRoom();
  }
}

function backToLobby() {
  leaveRoom();
}

// ============================================================
//  INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('ably_api_key');
  if (!saved) {
    document.getElementById('config-notice').style.display = 'block';
    document.getElementById('apikey-group').style.display = 'block';
  }
  if (saved) {
    document.getElementById('apikey-group').style.display = 'block';
    document.getElementById('input-apikey').placeholder = 'Masukan Api Key)';
  }

  document.getElementById('input-room').addEventListener('keyup', e => {
    if (e.key === 'Enter') joinRoom();
  });
  document.getElementById('input-name').addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      const code = document.getElementById('input-room').value.trim();
      if (code.length === 6) joinRoom(); else createRoom();
    }
  });
});
