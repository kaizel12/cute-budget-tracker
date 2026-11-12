# CuteCuan 🌸✨ v2.0 - Catatan Keuangan & Tabungan Gemas

Aplikasi web pencatat pengeluaran, pemasukan, dan celengan tabungan bertema **Pink Pastel & Soft Blue** dengan dukungan **Mode Malam (Dark Kawaii Mode)** dan siap langsung dideploy ke **Vercel**!

## 🎀 Fitur Utama

1. **Dashboard Ringkas & Rasio Tabungan**:
   - 💰 **Saldo Dompet**, 🌸 **Pemasukan**, 🛍️ **Pengeluaran**, dan 🐷 **Celengan Tabungan** + **Rasio Tabungan (%)**.
   - 📅 **Filter Periode Bulan**: Pantau keuangan per bulan tertentu atau semua periode sekaligus.
   - 🚨 **Rem Jajan Bulanan**: Atur batas maksimal pengeluaran dan pantau statusnya lewat progress bar interaktif.

2. **Pencatatan Cepat & Edit Fleksibel**:
   - **Chip Nominal Kilat** (`+10rb`, `+20rb`, `+50rb`, `+100rb`) + auto-format Rupiah.
   - **Edit Catatan**: Ubah nominal, kategori, catatan, atau tanggal kapan saja tanpa harus hapus-ulang.
   - Notifikasi *Toast* manis & modal konfirmasi kustom (bebas pop-up browser kaku).

3. **Celengan & Target Impian**:
   - Buat target impian, **Setor** atau **Tarik** dana celengan, serta confetti perayaan otomatis saat menabung atau target tercapai 100% 🎉.

4. **Grafik Visual & Ekspor Data**:
   - Grafik Batang perbandingan & Diagram Donat kategori pengeluaran (`Chart.js`).
   - **Unduh Excel (CSV)** untuk dibuka di Microsoft Excel / Google Sheets.
   - **Cadangkan & Pulihkan (Export/Import JSON)** agar data aman saat berpindah perangkat.
   - **Mode Malam (🌙 / ☀️)** dengan penyimpanan otomatis di browser.

## ☁️ Deploy ke Vercel

Proyek ini sudah dilengkapi `vercel.json` (`framework: null`, `buildCommand: null`, `outputDirectory: "."`) sehingga langsung siap jalan di **Vercel** tanpa error *build script* atau *output directory*!

## 🚀 Menjalankan Secara Lokal

```bash
npm start
```
Lalu buka [http://localhost:3000](http://localhost:3000) di browser, atau buka langsung file `index.html`.
