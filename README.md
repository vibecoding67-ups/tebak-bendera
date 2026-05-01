# 🌍 Tebak Bendera - Mabar!

Game tebak bendera negara multiplayer real-time. Main bareng teman pakai kode room unik!

## 🚀 Setup (5 menit)

### 1. Daftar Ably (gratis)
1. Buka [ably.com](https://ably.com) → Sign Up gratis
2. Buat App baru (nama bebas)
3. Masuk ke **API Keys** → copy key yang ada permission `subscribe` + `publish`
   - Format key: `xxxxx.xxxxx:xxxxxxxxxxxxxxxxxx`

### 2. Masukkan API Key
**Cara A — Langsung di browser (paling gampang):**
- Buka `index.html`, klik **Buat Room Baru**
- Kalau muncul form API Key, paste key kamu di sana
- Key otomatis tersimpan di browser (localStorage)

**Cara B — Edit file:**
- Buka `game.js`, baris pertama:
```js
const ABLY_API_KEY = 'YOUR_ABLY_API_KEY_HERE';
```
- Ganti dengan key kamu:
```js
const ABLY_API_KEY = 'xxxxx.xxxxx:xxxxxxxxxxxxxxxxxx';
```

### 3. Jalankan
- Buka `index.html` langsung di browser, **atau**
- Pakai live server (VS Code extension) untuk pengalaman lebih baik

## 🎮 Cara Main

1. **Buat Room** → masukkan nama → klik "Buat Room Baru"
2. **Share kode** → copy kode 6 huruf → kirim ke teman
3. **Teman gabung** → buka game → masukkan nama + kode room → "Gabung Room"
4. **Host mulai** → pilih jumlah soal → klik "Mulai Game!"
5. **Tebak bendera** → pilih jawaban secepat mungkin (makin cepat = makin banyak poin!)
6. **Lihat hasil** → podium + skor akhir semua pemain

## ✨ Fitur

- 🌍 100+ bendera negara
- ⚡ Real-time multiplayer via Ably
- 🏆 Skor live selama game berlangsung
- ⏱️ Timer 15 detik per soal (jawab cepat = poin lebih banyak)
- 🎯 4 pilihan jawaban per soal
- 🥇 Podium & leaderboard di akhir game
- 🔄 Main lagi tanpa keluar room
- 📱 Responsive (mobile-friendly)

## 📊 Sistem Poin

- Jawaban benar: **100–500 poin** (tergantung kecepatan)
- Jawaban salah / timeout: **0 poin**
- Rumus: `max(100, round(sisa_waktu / 15 * 500))`

## 🆓 Free Tier Ably

- 200 koneksi bersamaan
- 6 juta pesan/bulan
- Lebih dari cukup untuk main bareng teman!
