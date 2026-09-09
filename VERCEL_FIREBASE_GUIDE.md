# Panduan Publish MysticDeck ke Vercel & Koneksi Firebase

Dokumen ini berisi langkah-langkah **step-by-step** untuk mempublikasikan website **MysticDeck** ke **Vercel.app** melalui GitHub, serta mengonfigurasi **Firebase Authentication** dan **Cloud Firestore** agar fitur Login Google/Email & Jurnal berfungsi 100% di domain Vercel Anda.

---

## 📌 RANGKUMAN LANGKAH UTAMA

1. **Push Kode ke GitHub**
2. **Deploy Repository ke Vercel**
3. **Daftarkan Domain Vercel di Firebase Console (Authorized Domains)**
4. **Isi API Key Firebase pada `js/config/firebase.js`**

---

## LANGKAH 1: Upload / Push Kode ke GitHub

1. Buka terminal di folder project Anda (`/Users/mac/Downloads/portoClau`).
2. Jalankan perintah git berikut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MysticDeck Web App"
   ```
3. Buat repository baru di [GitHub.com](https://github.com/new) (beri nama misal: `mysticdeck-web`).
4. Hubungkan dan push repository lokal Anda:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/mysticdeck-web.git
   git branch -M main
   git push -u origin main
   ```

---

## LANGKAH 2: Deploy Repository ke Vercel

1. Buka [Vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository `mysticdeck-web` dari daftar GitHub Anda lalu klik **"Import"**.
4. Pada bagian *Framework Preset*, pilih **Other** (karena ini adalah projek HTML/JS murni).
5. Klik **"Deploy"**.
6. Dalam hitungan detik, Vercel akan memberikan domain publik gratis untuk website Anda, contohnya:
   `https://mysticdeck-web.vercel.app`

---

## LANGKAH 3: Hubungkan Firebase Auth & Firestore ke Vercel

Agar fitur **Login (Google & Email)** serta **Cloud Firestore** dapat berjalan di domain Vercel Anda, ikuti 2 tahap ini:

### A. Masukkan Kredensial Firebase pada `js/config/firebase.js`
1. Buka [Console Firebase](https://console.firebase.google.com/).
2. Buat / Pilih Project Firebase Anda.
3. Tambahkan Web App (`</>`) di project settings.
4. Salin objek `firebaseConfig` dari Firebase Console:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "project-anda.firebaseapp.com",
     projectId: "project-anda",
     storageBucket: "project-anda.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```
5. Buka file [js/config/firebase.js](file:///Users/mac/Downloads/portoClau/js/config/firebase.js) pada kode Anda, lalu gantikan placeholder `apiKey` dsb dengan kredensial tersebut.
6. Commit & Push perubahan ke GitHub (`git commit -am "Update firebase config" && git push`), Vercel akan otomatis melakukan auto-redeploy!

---

### B. Otorisasi Domain Vercel di Firebase Authentication (*Sangat Penting!*)

Jika langkah ini tidak dilakukan, **Login Google akan ditolak oleh Firebase** karena domain Vercel belum diizinkan.

1. Di [Console Firebase](https://console.firebase.google.com/), buka menu **Build** -> **Authentication**.
2. Pilih tab **Settings** -> **Authorized domains**.
3. Klik **"Add domain"**.
4. Masukkan domain Vercel Anda, contoh: `mysticdeck-web.vercel.app`.
5. Klik **Save**.

---

### C. Aktifkan Fitur Sign-In Provider di Firebase Auth

1. Di Firebase Console -> **Authentication** -> tab **Sign-in method**.
2. Aktifkan **Google**:
   - Klik **Google** -> geser saklar **Enable**.
   - Masukkan *Project support email* Anda lalu klik **Save**.
3. Aktifkan **Email/Password**:
   - Klik **Email/Password** -> geser saklar **Enable** -> klik **Save**.

---

### D. Buat Database Cloud Firestore

1. Di Firebase Console -> **Build** -> **Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi server (misal: `asia-southeast1` / Singapura) -> klik **Next**.
4. Pilih **Start in test mode** atau muat aturan dari file `firestore.rules` -> klik **Create**.

---

🎉 **Selesai!** Website **MysticDeck** Anda kini sudah live di Vercel dengan domain `https://mysticdeck-web.vercel.app` dan terhubung penuh dengan Firebase Auth & Cloud Firestore.
