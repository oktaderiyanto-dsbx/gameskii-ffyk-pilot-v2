# Perubahan dari arsip Google AI Studio asli

- **UI/UX**: layout, warna, font, ikon, gambar, struktur navigasi dan kartu dipertahankan; perubahan visual hanya teks/opsi pada selector peringkat Upload Result (1–3).
- **Poin**: #1 +50, #2 +35, #3 +25; posisi lain 0; 1.200 poin baseline demo.
- **Data**: 10 kompetisi yang sudah diaudit + 132 baris final + 33 podium + fingerprint per atlet.
- **Identitas**: penelusuran prestasi berdasarkan UID hash, bukan nama tim. Roster cadangan, UID hilang dan respons ambigu diberi flag.
- **Privasi**: tidak menyertakan PII mentah dari spreadsheet registrasi di ZIP.
- **Data lama**: akun dummy dan hasil mock dari arsip awal tidak otomatis menjadi seed lokal aktif; data FFYK baru yang dimuat.
- **Simulasi**: tombol verifikasi tetap ada (bagian UI asli), namun bukan otorisasi wasit sungguhan. Skema SQL opsional menyediakan pembatasan akses.
- **Batas resmi**: semua ranking historis impor masih PROVISIONAL.
