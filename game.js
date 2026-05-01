// ============================================================
//  CONFIG — API Key diinput langsung di browser, tidak disimpan di sini
//  Ably free tier: https://ably.com
// ============================================================
const ABLY_API_KEY = '';

// ============================================================
//  DATA BENDERA (50 negara)
// ============================================================
// flag = kode negara 2 huruf (ISO 3166-1 alpha-2) untuk flagcdn.com
const FLAGS = [
  { flag: 'id', name: 'Indonesia' },
  { flag: 'us', name: 'Amerika Serikat' },
  { flag: 'gb', name: 'Inggris' },
  { flag: 'jp', name: 'Jepang' },
  { flag: 'kr', name: 'Korea Selatan' },
  { flag: 'cn', name: 'China' },
  { flag: 'de', name: 'Jerman' },
  { flag: 'fr', name: 'Prancis' },
  { flag: 'it', name: 'Italia' },
  { flag: 'es', name: 'Spanyol' },
  { flag: 'br', name: 'Brasil' },
  { flag: 'au', name: 'Australia' },
  { flag: 'ca', name: 'Kanada' },
  { flag: 'ru', name: 'Rusia' },
  { flag: 'in', name: 'India' },
  { flag: 'mx', name: 'Meksiko' },
  { flag: 'sa', name: 'Arab Saudi' },
  { flag: 'tr', name: 'Turki' },
  { flag: 'nl', name: 'Belanda' },
  { flag: 'se', name: 'Swedia' },
  { flag: 'no', name: 'Norwegia' },
  { flag: 'dk', name: 'Denmark' },
  { flag: 'fi', name: 'Finlandia' },
  { flag: 'pl', name: 'Polandia' },
  { flag: 'pt', name: 'Portugal' },
  { flag: 'gr', name: 'Yunani' },
  { flag: 'ch', name: 'Swiss' },
  { flag: 'at', name: 'Austria' },
  { flag: 'be', name: 'Belgia' },
  { flag: 'ar', name: 'Argentina' },
  { flag: 'cl', name: 'Chile' },
  { flag: 'co', name: 'Kolombia' },
  { flag: 'pe', name: 'Peru' },
  { flag: 've', name: 'Venezuela' },
  { flag: 'za', name: 'Afrika Selatan' },
  { flag: 'eg', name: 'Mesir' },
  { flag: 'ng', name: 'Nigeria' },
  { flag: 'ke', name: 'Kenya' },
  { flag: 'ma', name: 'Maroko' },
  { flag: 'th', name: 'Thailand' },
  { flag: 'vn', name: 'Vietnam' },
  { flag: 'ph', name: 'Filipina' },
  { flag: 'my', name: 'Malaysia' },
  { flag: 'sg', name: 'Singapura' },
  { flag: 'pk', name: 'Pakistan' },
  { flag: 'bd', name: 'Bangladesh' },
  { flag: 'ir', name: 'Iran' },
  { flag: 'iq', name: 'Irak' },
  { flag: 'ua', name: 'Ukraina' },
  { flag: 'cz', name: 'Ceko' },
  { flag: 'hu', name: 'Hungaria' },
  { flag: 'ro', name: 'Rumania' },
  { flag: 'bg', name: 'Bulgaria' },
  { flag: 'hr', name: 'Kroasia' },
  { flag: 'sk', name: 'Slovakia' },
  { flag: 'si', name: 'Slovenia' },
  { flag: 'lt', name: 'Lithuania' },
  { flag: 'lv', name: 'Latvia' },
  { flag: 'ee', name: 'Estonia' },
  { flag: 'is', name: 'Islandia' },
  { flag: 'il', name: 'Israel' },
  { flag: 'jo', name: 'Yordania' },
  { flag: 'lb', name: 'Lebanon' },
  { flag: 'kw', name: 'Kuwait' },
  { flag: 'qa', name: 'Qatar' },
  { flag: 'ae', name: 'Uni Emirat Arab' },
  { flag: 'nz', name: 'Selandia Baru' },
  { flag: 'pg', name: 'Papua Nugini' },
  { flag: 'fj', name: 'Fiji' },
  { flag: 'cu', name: 'Kuba' },
  { flag: 'jm', name: 'Jamaika' },
  { flag: 'pa', name: 'Panama' },
  { flag: 'cr', name: 'Kosta Rika' },
  { flag: 'gt', name: 'Guatemala' },
  { flag: 'ec', name: 'Ekuador' },
  { flag: 'bo', name: 'Bolivia' },
  { flag: 'py', name: 'Paraguay' },
  { flag: 'uy', name: 'Uruguay' },
  { flag: 'dz', name: 'Aljazair' },
  { flag: 'tn', name: 'Tunisia' },
  { flag: 'ly', name: 'Libya' },
  { flag: 'sd', name: 'Sudan' },
  { flag: 'et', name: 'Ethiopia' },
  { flag: 'gh', name: 'Ghana' },
  { flag: 'ci', name: 'Pantai Gading' },
  { flag: 'sn', name: 'Senegal' },
  { flag: 'cm', name: 'Kamerun' },
  { flag: 'mz', name: 'Mozambik' },
  { flag: 'tz', name: 'Tanzania' },
  { flag: 'ug', name: 'Uganda' },
  { flag: 'zw', name: 'Zimbabwe' },
  { flag: 'zm', name: 'Zambia' },
  { flag: 'mm', name: 'Myanmar' },
  { flag: 'kh', name: 'Kamboja' },
  { flag: 'la', name: 'Laos' },
  { flag: 'np', name: 'Nepal' },
  { flag: 'lk', name: 'Sri Lanka' },
  { flag: 'mv', name: 'Maladewa' },
];

const AVATARS = ['😎','🦊','🐼','🦁','🐯','🦄','🐸','🦋','🐺','🦅','🐙','🦈'];
const TIME_PER_QUESTION = 15; // detik

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
let players = {};       // { id: { name, avatar, score, answered } }
let questions = [];     // array of { flag, name, options }
let currentQ = 0;
let totalQ = 10;
let timerInterval = null;
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

    players[myId] = { name: myName, avatar: myAvatar, score: 0, answered: false };
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
      ${id === myId && !p.isHost ? '<span class="badge-you">KAMU</span>' : ''}
      ${id === myId && p.isHost ? '<span class="badge-you">KAMU</span>' : ''}
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

    // If I'm host, re-broadcast my presence so new joiners know who's in
    if (isHost) {
      setTimeout(() => {
        channel.publish('presence', {
          type: 'join',
          id: myId,
          name: myName,
          avatar: myAvatar,
          score: players[myId]?.score || 0,
          isHost: true
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
function generateQuestions(count) {
  const shuffled = shuffle(FLAGS).slice(0, count);
  return shuffled.map(item => {
    const wrong = shuffle(FLAGS.filter(f => f.name !== item.name)).slice(0, 3);
    const options = shuffle([item, ...wrong]);
    return { flag: item.flag, answer: item.name, options: options.map(o => o.name) };
  });
}

function startGame() {
  totalQ = parseInt(document.getElementById('select-questions').value);
  questions = generateQuestions(totalQ);
  currentQ = 0;

  // Reset scores
  Object.keys(players).forEach(id => {
    players[id].score = 0;
    players[id].answered = false;
  });

  channel.publish('game-start', {
    questions: questions,
    totalQ: totalQ,
    players: players
  });
}

// ============================================================
//  GAME EVENTS
// ============================================================
function onGameStart(msg) {
  const d = msg.data;
  questions = d.questions;
  totalQ = d.totalQ;
  currentQ = 0;
  gameStarted = true;

  // Sync players from host
  if (!isHost) {
    players = d.players;
    // Re-add myself if missing
    if (!players[myId]) {
      players[myId] = { name: myName, avatar: myAvatar, score: 0, answered: false };
    }
  }

  // Reset scores
  Object.keys(players).forEach(id => {
    players[id].score = 0;
    players[id].answered = false;
  });

  showScreen('game');
  preloadFlags(0, 5); // preload 5 soal pertama langsung
  showQuestion(currentQ);
}

// Preload gambar bendera beberapa soal ke depan
function preloadFlags(fromIdx, count = 3) {
  for (let i = fromIdx; i < Math.min(fromIdx + count, questions.length); i++) {
    const img = new Image();
    img.src = `https://flagcdn.com/w320/${questions[i].flag}.png`;
  }
}

function showQuestion(idx) {
  answered = false;
  timeLeft = TIME_PER_QUESTION;

  const q = questions[idx];
  document.getElementById('q-num').textContent = `${idx + 1}/${totalQ}`;

  const flagDiv = document.getElementById('flag-display');

  // Cek apakah gambar sudah di-cache browser
  const cachedImg = new Image();
  cachedImg.src = `https://flagcdn.com/w160/${q.flag}.png`;

  if (cachedImg.complete) {
    // Sudah di-cache, langsung tampil
    flagDiv.innerHTML = '';
    cachedImg.style.cssText = 'width:160px;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
    cachedImg.alt = 'Bendera';
    flagDiv.appendChild(cachedImg);
  } else {
    // Belum ada — tampilkan spinner TAPI timer tetap jalan
    flagDiv.innerHTML = `<div class="spinner" style="width:50px;height:50px;margin:20px auto"></div>`;
    cachedImg.onload = () => {
      flagDiv.innerHTML = '';
      cachedImg.style.cssText = 'width:160px;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
      cachedImg.alt = 'Bendera';
      flagDiv.appendChild(cachedImg);
    };
    cachedImg.onerror = () => {
      flagDiv.innerHTML = `<div style="font-size:1rem;color:#aaa;padding:20px">⚠️ Gagal load</div>`;
    };
  }

  // Preload 3 soal berikutnya di background
  preloadFlags(idx + 1, 3);

  document.getElementById('feedback').className = 'feedback';
  document.getElementById('feedback').textContent = '';

  // Options
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => submitAnswer(opt, q.answer, btn);
    grid.appendChild(btn);
  });

  renderLiveScoreboard();
  startTimer(); // timer langsung jalan, tidak nunggu gambar
}

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
        // Show correct answer
        const q = questions[currentQ];
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.disabled = true;
          if (btn.textContent === q.answer) btn.classList.add('correct');
        });
        showFeedback(false, '⏰ Waktu habis! Jawaban: ' + q.answer);
        broadcastScore(false);
        if (isHost) scheduleNextQuestion();
      }
    }
  }, 1000);
}

function submitAnswer(chosen, correct, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const isCorrect = chosen === correct;
  const points = isCorrect ? Math.max(100, Math.round(timeLeft / TIME_PER_QUESTION * 500)) : 0;

  // Disable all buttons, highlight
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });
  if (!isCorrect) btn.classList.add('wrong');

  if (isCorrect) {
    players[myId].score += points;
    showFeedback(true, `✅ Benar! +${points} poin`);
  } else {
    showFeedback(false, `❌ Salah! Jawaban: ${correct}`);
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
  // Wait 3 seconds then move to next
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
  // Reset answered state for all players
  Object.keys(players).forEach(id => players[id].answered = false);
  showQuestion(currentQ);
}

function onGameEnd(msg) {
  clearInterval(timerInterval);
  const scores = msg.data.scores;
  showResult(scores);
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
//  RESULT SCREEN
// ============================================================
function showResult(scores) {
  showScreen('result');

  // Podium (top 3)
  const podium = document.getElementById('podium');
  const top3 = scores.slice(0, 3);
  // Order: 2nd, 1st, 3rd for visual podium
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const medals = ['🥈', '🥇', '🥉'];
  const podiumRanks = [2, 1, 3];

  podium.innerHTML = podiumOrder.map((p, i) => `
    <div class="podium-item">
      <div class="p-avatar">${p.avatar}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-score">${p.score} pts</div>
      <div class="p-block">${medals[i]}</div>
    </div>
  `).join('');

  // Full list
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
    // Reset and go back to waiting room
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
  // Selalu tampilkan form API key, cek apakah sudah tersimpan di localStorage
  const saved = localStorage.getItem('ably_api_key');
  if (!saved) {
    document.getElementById('config-notice').style.display = 'block';
    document.getElementById('apikey-group').style.display = 'block';
  }
  // Kalau sudah tersimpan, tetap tampilkan field tapi isi dengan placeholder
  // sehingga user tahu key sudah ada
  if (saved) {
    document.getElementById('apikey-group').style.display = 'block';
    document.getElementById('input-apikey').placeholder = 'API Key ';
  }

  // Enter key support
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
