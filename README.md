# Gameskii MVP — Esports Athlete Passport & DIY ELO Leaderboard (FFYK Pilot 10 Kompetisi)

**Import ulang ZIP ini ke Google AI Studio sebagai project React/Vite.** Desain visual, susunan halaman (Passport / Upload Result / Leaderboard), gaya midnight navy + antique gold, komponen kartu dan navigasi mengikuti arsip asli. **Satu-satunya perubahan pada formulir Upload Result adalah pilihan peringkat menjadi #1, #2, dan #3** beserta petunjuk poinnya.

## Data pilot (snapshot 5 November 2026)

Data ini berasal dari **Google Drive Yogyakarta Free Fire Community** dan workbook audit `Gameskii FFYK | Pilot 10 Kompetisi — Klasemen & Audit Sumber (2026-11-05)`.

| Entitas | Jumlah | Letak |
|---|---:|---|
| Kompetisi | **10** | `src/data/pilot-free-fire.json` → `competitions` |
| Divisi final | **11** | Dua divisi dari IFL S3 adalah satu kompetisi |
| Baris klasemen final | **132** | `standings` — semua 12 finalis tiap divisi |
| Juara 1–3 | **33** | `podiums` |
| Tag roster pada podium | **137** | `team_memberships` (termasuk cadangan/nama tanpa UID) |
| Atribusi prestasi individu sementara | **98** | `achievement_attributions` |
| Identitas pemain dengan UID terhash | **78** | `athletes` |
| Pemain terlihat di lebih dari satu tim | **11** | Tetap satu identitas individu |

Seluruh kompetisi dan klasemen tersedia sebagai **data pendukung lokal yang langsung dimuat aplikasi**, bukan sekadar contoh pada README. Prototipe berjalan tanpa menghubungkan Supabase. Detail sumber setiap kompetisi, baris hasil final, dan status pencocokan tercatat di JSON tersebut. Untuk tampilan leaderboard, sistem menghitung ulang nilai dari `achievement_attributions`, bukan dari nama tim.

### Skema poin — hanya podium

| Rank final | Poin yang dikreditkan ke pemain yang lolos flagging |
|---|---:|
| 1 | **+50** |
| 2 | **+35** |
| 3 | **+25** |
| 4–16 / lainnya | **0 dan tidak dimasukkan ke leaderboard prestasi** |

Setiap pemain memulai dari **1.200 poin** untuk simulasi. Istilah `elo_points` dipertahankan agar kompatibel dengan UI arsip lama. **Perhitungannya adalah poin prestasi berbasis podium, bukan Elo matematis berdasarkan kekuatan lawan**.

### Flagging prestasi ke individu, tidak terikat satu tim

- Identitas antar-event menggunakan **fingerprint SHA-256 dari UID Free Fire** dengan format input terstandardisasi. UID asli **tidak dimasukkan ke project ZIP**.
- Setiap hasil podium memiliki `competition_id`, `division`, `team_at_event`, `rank`, dan `achievement_delta`. Pemain yang masuk tim berbeda pada turnamen berikutnya tetap menerima agregasi prestasi pada UID yang sama.
- `team_name` pada paspor hanya keterangan terakhir/"Lintas Tim", bukan kunci relasi prestasi. Catatan sejarah ada di `team_memberships` dan `achievement_attributions`.
- Hanya **empat slot utama yang terdaftar** yang dapat mendapat poin **sementara**. Cadangan tidak otomatis diberi poin. Empat slot pendaftaran **bukan** bukti lineup bermain di final.
- Nama pemain saja tanpa UID **tidak** disatukan dengan orang lain yang kebetulan memakai nickname sama. Hasil tim tetap masuk `standings` dan `podiums` untuk ditinjau, tetapi tidak diberi poin individu.
- Identitas hasil impor yang belum memiliki domisili/role terkonfirmasi ditampilkan sebagai **Belum Terverifikasi / Belum Ditentukan**, bukan dikarang sebagai atlet wilayah/role tertentu.
- Bila pengguna memasukkan UID yang sama di onboarding Free Fire, prototipe bisa menautkan data historis dengan fingerprint UID dalam **mode lokal**. Ini **bukan verifikasi kepemilikan akun**, dan tidak boleh digunakan untuk klaim resmi tanpa autentikasi dan konfirmasi organizer.

### Batas validasi dan catatan penting

**SELURUH POIN ATLET DARI ARSIP ADALAH `PROVISIONAL_ROSTER_MATCH`, BUKAN RANKING RESMI/TERSERTIFIKASI.** Kecocokan nama tim di formulir dan klasemen tidak membuktikan susunan empat pemain yang betul-betul bertanding.

- Audit sebelumnya menemukan **9 respons tim duplikat dan 2 nama tim mirip** dari 132 baris final.
- Untuk podium, hasil **TRUST PROCESS (C01, rank 3)** memerlukan konfirmasi kesamaan nama; **PSSJ TEAM CERIA (C08, rank 1)** memiliki beberapa respons pendaftaran. Keduanya disimpan sebagai podium, **tanpa poin individu otomatis**.
- AXIS Cup Kota (C09) dan Bantul (C10) menyimpan roster dengan format nama bebas, sering **tanpa UID Free Fire yang dapat dipastikan**. Kedua kompetisi tetap masuk database dengan tiga juara masing-masing, tetapi pemain tanpa UID **tidak diberi poin individu**.
- Sumber tim juara C10 rank 3 tidak menghasilkan roster yang layak ditautkan otomatis. Diberi flag `INCOMPLETE_PRIMARY_ROSTER`.
- Sebagian formulir utama memiliki UID kosong atau duplikasi slot kapten; hanya atribusi yang memenuhi filter dimasukkan ke leaderboard. Untuk validasi resmi perlu lineup final, kontrol peran wasit, dan proses banding.
- **Do not interpret** `wins/matches_played` pada data impor sebagai *win rate pertandingan*: `matches_played` adalah jumlah tampil di podium pada arsip, `wins` adalah jumlah gelar juara 1; total partisipasi dan kekalahan pemain belum dikumpulkan.
- Tampilan aplikasi asli menggunakan label seperti *resmi/ESI*. Label UI **dipertahankan atas permintaan**, bukan merupakan bukti afiliasi atau otorisasi lembaga.

### Privasi data

Data yang **dikecualikan dari ZIP**: nama legal, nomor WhatsApp, email, rekening, bukti pembayaran, foto KTP, dan UID Free Fire mentah. JSON berisi IGN, UID fingerprint, UID tersamar (`••••1234`), klasemen, serta link dokumen sumber. **Jangan menjadikan fingerprint sebagai autentikasi**.

## Menjalankan di Google AI Studio / lokal

1. Unggah ZIP sebagai project, bukan sebagai dataset terbuka.
2. Jalankan aplikasi React sesuai mekanisme Google AI Studio. Di lokal:
   ```bash
   npm install
   npm run dev
   ```
3. Bila memakai browser yang pernah membuka MVP sebelumnya, data baru menggunakan kunci localStorage `*_ff_pilot_v3` agar seed dummy lama tidak terbaca.
4. Aplikasi awalnya tidak otomatis login atas nama peserta yang diimpor. Buka **Leaderboard** untuk melihat data, pilih satu profil untuk inspeksi, atau buat paspor sendiri. Jangan gunakan sign-in demo untuk mengklaim kepemilikan peserta sungguhan.
5. Tab **Upload Result** mempertahankan kategori turnamen, pilihan game, statistik KDA, screenshot, riwayat, sanggahan, dan simulasi verifikasi. Yang berubah hanya pilihan rank **1–3**; kode juga menolak verifikasi peringkat lain atau duplikat verifikasi.

### Supabase (opsional, belum otomatis disinkronkan)

Prototipe langsung berfungsi menggunakan **JSON fixture + localStorage**. Bila ingin memindahkan data pendukung menjadi tabel PostgreSQL Supabase:

1. Buat project Supabase **terpisah khusus pengembangan**.
2. Di SQL Editor jalankan `supabase/pilot_schema.sql`, kemudian `supabase/pilot_seed.sql`.
3. Tersedia tabel `pilot_competitions`, `pilot_final_standings`, `pilot_podiums`, `pilot_athletes`, `pilot_roster_tags`, `pilot_achievement_attributions` dan VIEW `pilot_ff_athlete_leaderboard`.
4. Tabel pilot tidak memberi hak tulis ke anon/authenticated. Impor SQL perlu akun administrator/SQL Editor; **tidak diperlukan untuk membuka prototipe**.
5. Tombol SQL pada modal Supabase UI lama masih untuk tabel aplikasi `profiles`/`matches`, **bukan** untuk tabel pilot. Integrasi produksi antara keduanya memerlukan backend API, RLS, dan wasit berwenang.
6. Verifikasi melalui tombol aplikasi adalah **simulasi sisi-klien**. Dengan RLS lebih aman, perubahan ke `Verified` membutuhkan servis/verifikator tepercaya dan tidak disetujui oleh pengguna biasa.

## Struktur file baru/penting

- `src/data/pilot-free-fire.json` — data 10 kompetisi, 132 hasil, 33 podium, tag roster, fingerprint identitas dan atribusi.
- `src/data/pilot.ts` — penghitungan ulang leaderboard individu dari atribut UID, tahan pergantian tim.
- `src/lib/athleteIdentity.ts` — fingerprint UID untuk pencocokan paspor demo saat onboarding.
- `src/data/constants.ts` — fungsi poin juara #1–3 saja.
- `src/components/MatchSubmissionView.tsx` — pilihan rank #1–3 saja, UI lainnya sama.
- `src/lib/supabase.ts` — seed data pilot & penyimpanan demo.
- `supabase/pilot_schema.sql` & `supabase/pilot_seed.sql` — migrasi DB pendukung opsional.

**Tindakan sebelum publikasi:** verifikasi peserta terdaftar vs lineup yang benar-benar bertanding, periksa duplikasi/identitas, bangun akses wasit dan pencatatan audit server-side, pisahkan identitas/PII privat dari daftar publik, serta ubah label *resmi* jika belum ada mandat penyelenggara.
