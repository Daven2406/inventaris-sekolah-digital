# 🏫 Inventaris Sekolah Digital

Aplikasi manajemen inventaris sekolah modern yang dibangun dengan fokus pada kemudahan penggunaan, kecepatan, dan sinkronisasi data secara real-time.

## 🚀 Teknologi yang Digunakan

Jika ditanya mengenai teknologi di balik aplikasi ini, berikut adalah jawabannya:

*   **Bahasa Pemrograman**: JavaScript (ES6+)
*   **Framework Frontend**: [React.js](https://reactjs.org/) dengan [Vite](https://vitejs.dev/) sebagai build tool.
*   **Styling (Desain)**: [Tailwind CSS](https://tailwindcss.com/) untuk antarmuka yang modern dan responsif.
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Backend-as-a-Service).
    *   **Database**: Cloud Firestore (NoSQL Real-time Database).
    *   **Autentikasi**: Firebase Auth (Google Login).
*   **Ikon**: [Lucide React](https://lucide.dev/).
*   **Animasi**: [Motion](https://motion.dev/) (Framer Motion).
*   **Runtime**: Node.js.

---

## 💻 Cara Menjalankan di VS Code (Lokal)

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer Anda:

### 1. Persiapan
Pastikan Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan).
*   [Git](https://git-scm.com/).

### 2. Instalasi
Buka terminal di VS Code (Ctrl + `) dan jalankan perintah berikut:

```bash
# 1. Install semua library yang dibutuhkan
npm install

# 2. Buat file .env (Salin dari .env.example)
cp .env.example .env
```

### 3. Menjalankan Aplikasi
Setelah instalasi selesai, jalankan perintah:

```bash
npm run dev
```
Buka browser dan akses alamat yang muncul di terminal (biasanya `http://localhost:3000` atau `http://localhost:5173`).

---

## 📂 Struktur Folder

*   `src/components/`: Berisi semua komponen UI (Dashboard, Form, List, dll).
*   `src/AuthContext.jsx`: Mengatur logika login dan hak akses pengguna.
*   `src/firebase.js`: Konfigurasi koneksi ke database Firebase.
*   `firestore.rules`: Aturan keamanan database (siapa yang boleh baca/tulis).
*   `package.json`: Daftar library yang digunakan dalam proyek ini.

---

## 🔐 Keamanan & Role Pengguna

Aplikasi ini memiliki sistem keamanan berbasis peran (Role-Based Access Control):
1.  **Admin**: Hak akses penuh (Tambah, Edit, Hapus, Kelola User).
2.  **Petugas**: Hak akses operasional (Tambah, Edit, Pinjam Barang).
3.  **Logout Otomatis**: Jika Admin menghapus seorang user, user tersebut akan otomatis ter-logout dari aplikasi secara real-time.

---
*Dibuat dengan ❤️ menggunakan Google AI Studio Build.*
