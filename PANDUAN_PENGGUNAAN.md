# 🎭 Panduan Penggunaan Sistem Ticketing LSPR COMM30-6SP

Panduan lengkap ini disusun khusus untuk **Panitia Ticketing & Gatekeeper Event Musical Theater LSPR COMM30-6SP** di Sudirman Park Auditorium.

---

## 📋 Daftar Isi
1. [Struktur Sistem & Halaman](#1-struktur-sistem--halaman)
2. [Alur Pembelian Tiket Oleh Pengunjung](#2-alur-pembelian-tiket-oleh-pengunjung)
3. [Panduan Admin Dashboard Panitia](#3-panduan-admin-dashboard-panitia)
4. [Panduan Check-In Mobile QR Scanner di Hari-H](#4-panduan-check-in-mobile-qr-scanner-di-hari-h)
5. [Integrasi Midtrans (Sandbox & Production)](#5-integrasi-midtrans-sandbox--production)
6. [Integrasi Email E-Ticket (Resend)](#6-integrasi-email-e-ticket-resend)
7. [Checklist Panitia di Hari-H Acara](#7-checklist-panitia-di-hari-h-acara)

---

## 1. Struktur Sistem & Halaman

| Halaman | URL Path | Fungsi Utama |
| :--- | :--- | :--- |
| **Landing Page & Seating Map** | `/` | Tampilan promosi tema *American High School*, daftar harga tiket, dan **peta denah kursi interaktif 400 seat**. |
| **Halaman E-Ticket Resmi** | `/ticket/[orderId]` | E-Ticket digital berdesain *Admit-One Vintage*, memuat nomor kursi, QR Code unik, dan tombol Cetak/Simpan PDF. |
| **Dashboard Admin** | `/admin` | Laporan pendapatan real-time, statistik kursi terjual per kategori, daftar transaksi lengkap, dan ekspor data ke Excel/CSV. |
| **Mobile QR Scanner** | `/scanner` | Pemindai kamera ponsel untuk validasi tiket penonton di pintu masuk (gate). |

---

## 2. Alur Pembelian Tiket Oleh Pengunjung

1. **Memilih Kursi**:
   - Pengunjung membuka website di ponsel atau laptop.
   - Pada bagian **Denah Kursi (400 Seat)**, pengunjung dapat memilih nomor kursi yang diinginkan.
   - Kursi yang tersedia memiliki warna sesuai kategori (VIP: Pink, Sapphire: Biru, Diamond: Kuning, Platinum: Hijau, Ruby: Merah).
   - Maksimal pembelian adalah **6 kursi per transaksi**.
2. **Penguncian Kursi (Anti Double-Booking)**:
   - Begitu kursi diklik, sistem secara otomatis mengunci kursi tersebut selama **10 menit**.
   - Pengunjung lain tidak akan bisa memilih kursi yang sedang di-hold.
3. **Mengisi Data Diri**:
   - Pengunjung mengisi Nama Lengkap, Alamat Email, dan Nomor WhatsApp aktif.
   - Memilih metode pembayaran (QRIS / Virtual Account).
4. **Pembayaran**:
   - Pengunjung memindai kode QRIS atau mentransfer ke Virtual Account yang muncul.
   - Begitu dana diterima, webhook memverifikasi transaksi secara otomatis.
5. **Penerbitan E-Ticket**:
   - Pengunjung langsung diarahkan ke halaman E-Ticket resmi yang dilengkapi QR Code unik.
   - E-Ticket juga dikirimkan langsung ke email customer.

---

## 3. Panduan Admin Dashboard Panitia (`/admin`)

Halaman ini digunakan oleh koordinator ticketing untuk memantau performa penjualan:

- **Ringkasan KPI**:
  - **Total Pendapatan (Rp)**: Akumulasi seluruh tiket berstatus `PAID` (Target maksimal kapasitas: Rp 19.500.000).
  - **Tiket Terjual**: Jumlah kursi yang telah lunas dari total 400 kursi.
  - **Kursi Tersedia**: Sisa kapasitas kursi yang belum terjual.
  - **Kehadiran (Check-In)**: Jumlah pengunjung yang sudah melewati gate pemindaian QR code di hari-H.
- **Pencarian Cepat**:
  - Panitia dapat mencari data penonton hanya dengan mengetik **Nama**, **Nomor WhatsApp**, **Order ID** (misal `LSPR-6SP-XXXXXX`), atau **Nomor Kursi** (misal `A3-L12`).
- **Ekspor Data ke Excel/CSV**:
  - Klik tombol **"Export CSV (Excel)"** di pojok kanan atas.
  - File spreadsheet akan otomatis terunduh berisi seluruh riwayat pemesanan untuk arsip bendahara & registrasi fisik.
- **Fitur Reset Data**:
  - Tombol *"Reset Data"* disediakan untuk membersihkan transaksi uji coba (demo/sandbox) sebelum link resmi disebarkan ke publik.

---

## 4. Panduan Check-In Mobile QR Scanner di Hari-H (`/scanner`)

Di hari pementasan di LSPR Sudirman Park, panitia gatekeeper cukup membuka URL `/scanner` di browser HP masing-masing:

1. Klik tombol **"AKTIFKAN KAMERA SCANNER"** dan izinkan akses kamera di browser.
2. Arahkan kamera HP ke QR Code pada E-Ticket penonton (bisa dari layar HP penonton atau lembaran print).
3. **Interpretasi Hasil Validasi**:
   - 🟢 **HIJAU (TIKET VALID - CHECKED IN)**:
     - Terdengar bunyi beep sukses nada tinggi.
     - Menampilkan nama penonton, nomor kursi, dan kategori tiket.
     - Penonton dipersilakan masuk dan diberikan wristband.
   - 🟡 **KUNING (ALREADY CHECKED IN!)**:
     - Terdengar bunyi peringatan.
     - Menandakan tiket tersebut **sudah pernah dipindai sebelumnya** beserta jam scan pertama kali.
     - Mencegah tiket yang sama dibagikan ke orang lain / digandakan!
   - 🔴 **MERAH (INVALID TICKET!)**:
     - Terdengar nada buzz rendah.
     - Kode QR tidak terdaftar dalam database atau pembayaran belum diselesaikan.
4. **Input Manual Fallback**:
   - Jika kamera mengalami kendala pencahayaan redup atau layar HP penonton retak, panitia dapat mengetikkan 6 digit Order ID pada kolom input manual di bawah kamera.

---

## 5. Integrasi Midtrans (Sandbox & Production)

1. Buka [dashboard.midtrans.com](https://dashboard.midtrans.com) dan masuk ke akun panitia.
2. Buka menu **Settings > Access Keys**.
3. Salin `Client Key` dan `Server Key`.
4. Masukkan ke dalam file `.env.local` di server:
   ```env
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx
   MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
   MIDTRANS_IS_PRODUCTION=true
   ```
5. Pada menu **Settings > Configuration** di Midtrans:
   - Isi **Payment Notification URL** dengan:
     `https://domain-website-kalian.com/api/payment/webhook`

---

## 6. Integrasi Email E-Ticket (Resend)

1. Daftar akun di [resend.com](https://resend.com).
2. Buat API Key di menu **API Keys**.
3. Masukkan ke `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   TICKET_FROM_EMAIL=tickets@domain-acara.com
   ```

---

## 7. Checklist Panitia di Hari-H Acara

- [ ] Pastikan seluruh petugas gate membuka `/scanner` dan menguji pemindaian 1 tiket percobaan.
- [ ] Siapkan koneksi Wi-Fi cadangan atau kuota data seluler untuk petugas gate.
- [ ] Sediakan lembaran cetak data penonton (dari fitur *Export CSV*) di meja helpdesk ticketing jika ada pengunjung yang kehabisan baterai HP.
- [ ] Pisahkan antrean penonton kategori VIP (Fast-Track) dengan kategori Balcony/Main Floor biasa untuk menghindari penumpukan di pintu masuk Auditorium LSPR Sudirman Park.

