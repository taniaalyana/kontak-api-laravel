<div align="center">

# 🚀 Laravel 11 REST API - Contact Management System
**Praktikum Pemrograman Internet • Teknologi Informasi Universitas Udayana**

</div>

---

## 👨‍💻 Identitas Mahasiswa

| Informasi | Detail |
| :--- | :--- |
| **Nama** | Ni Kadek Tania Alyana |
| **NIM** | **2505551049** |
| **Mata Kuliah** | Pemrograman Internet |
| **Program Studi** | Teknologi Informasi |
| **Universitas** | Universitas Udayana |

---

## 📖 Deskripsi Proyek

Proyek ini merupakan backend **REST API** modern berarsitektur *Decoupled* yang dibangun menggunakan **Laravel 11** dan database ringan **SQLite**. Aplikasi ini dirancang untuk sistem **Manajemen Kontak** yang dilengkapi dengan sistem keamanan autentikasi berbasis token (*Laravel Sanctum*) serta relasi basis data antartabel.

### 🌟 Fitur Utama
1. **Autentikasi Token (Laravel Sanctum):** Keamanan berbasis *Bearer Token* untuk proses registrasi, login, dan logout pengguna.
2. **Relasi Database Eloquent ORM (1:N):** Hubungan *One-to-Many* antara tabel `kontak` dan `kontak_phones` (satu entitas kontak dapat memiliki banyak nomor telepon sekaligus)[cite: 1].
3. **Validasi & Proteksi Keamanan:** Validasi input ketat pada level Controller serta proteksi *Endpoint* menggunakan *middleware* `auth:sanctum`[cite: 1].
4. **SQLite Database Integration:** Penyimpanan data efisien dalam satu file lokal (`db_kontak.sqlite`) tanpa konfigurasi server database eksternal yang rumit[cite: 1].

---

## 📐 Arsitektur & Konsep Inti 

Proyek ini menerapkan konsep-konsep esensial arsitektur backend modern sesuai standar industri:

### 1. Pola Arsitektur MVC (Model-View-Controller)
* **Router (`routes/api.php`):** Menerima HTTP Request dari *client* (seperti React, Mobile, atau API Tester) dan mengarahkannya ke Controller yang sesuai[cite: 2].
* **Controller (`App\Http\Controllers\Api\...`):** Sebagai pusat logika bisnis (*business logic*), memvalidasi input, berinteraksi dengan model, dan menghasilkan format **JSON Response Payload**[cite: 2].
* **Model & Eloquent ORM (`App\Models\...`):** Jembatan pemetaan objek PHP (*Object-Relational Mapping*) ke tabel basis data relasional[cite: 2].

### 2. Siklus Hidup Request (Request Lifecycle)
Setiap permintaan HTTP yang masuk melewati alur sistem yang terstruktur:
1. **Single Entry Point (`public/index.php`):** Gerbang utama penampung seluruh masuknya *request*[cite: 2].
2. **HTTP Kernel & Service Providers:** Memuat konfigurasi inti aplikasi dan menyalakan pustaka layanan[cite: 2].
3. **Middleware Pipeline (Pipa Perantara):** Menyaring *request* sebelum mencapai Controller (seperti proteksi CORS, pembatas laju *Rate Limiter*, dan validasi Token Sanctum)[cite: 2].
4. **Controller & Database Dispatcher:** Eksekusi kode logika dan interaksi kueri basis data[cite: 2].

---

## 🛠️ Tech Stack & Requirements

| Komponen | Teknologi / Versi |
| :--- | :--- |
| **Language** | PHP $\ge$ 8.2[cite: 1] |
| **Framework** | Laravel 11[cite: 1] |
| **Database** | SQLite 3[cite: 1] |
| **Package Manager** | Composer[cite: 1] |
| **Authentication** | Laravel Sanctum[cite: 1] |
| **Environment** | Ubuntu (WSL) / Linux / Windows[cite: 1] |

---

## 🗄️ Skema Struktur Database

Basis data menggunakan SQLite dengan rincian tabel sebagai berikut:

| Nama Tabel | Deskripsi Kolom Utama | Relasi / Keterangan |
| :--- | :--- | :--- |
| **`users`** | `id`, `name`, `email`, `password`, `timestamps` | Tabel bawaan Laravel untuk Autentikasi |
| **`personal_access_tokens`** | `id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, dll | Tabel manajemen token Sanctum |
| **`kontak`** | `id`, `nama`, `alamat`, `tanggal_lahir`, `timestamps` | Tabel utama penyimpan data personal kontak[cite: 1] |
| **`kontak_phones`** | `id`, `kontak_id`, `jenis` (Rumah/HP/Kantor), `nomor_telepon`, `timestamps` | **Foreign Key:** `kontak_id` merujuk ke `kontak.id` (Cascade Delete)[cite: 1] |

---

## 📡 Daftar Endpoint REST API

Berikut adalah daftar *endpoint* yang tersedia dan diuji melalui Web API Tester (`/api-tester.html`) atau Postman[cite: 1]:

| Method | Endpoint | Middleware / Akses | Deskripsi |
| :---: | :--- | :--- | :--- |
| **POST** | `/api/register` | Public | Mendaftarkan akun pengguna baru & mereturn token[cite: 1] |
| **POST** | `/api/login` | Public | Masuk sistem & menghasilkan *Bearer Token* Sanctum[cite: 1] |
| **GET** | `/api/kontak` | Protected (`auth:sanctum`) | Menampilkan seluruh data kontak beserta *nested array* telepon[cite: 1] |
| **POST** | `/api/kontak` | Protected (`auth:sanctum`) | Menambahkan data kontak baru beserta banyak nomor telepon[cite: 1] |
| **GET** | `/api/kontak/{id}` | Protected (`auth:sanctum`) | Menampilkan detail spesifik satu kontak berdasarkan ID[cite: 1] |
| **DELETE** | `/api/kontak/{id}` | Protected (`auth:sanctum`) | Menghapus data kontak beserta nomor telepon terkait[cite: 1] |

---

## 🧪 Dokumentasi Hasil Pengujian (Testing)

Berikut adalah bukti hasil pengujian fungsionalitas REST API menggunakan *Web API Tester* (`http://127.0.0.1:8000/api-tester.html`)[cite: 1]:

### 1. Pengujian Register (POST `/api/register`)
> Mengirim data JSON registrasi pengguna baru dan mengembalikan respons sukses beserta token awal[cite: 1].
> ![Register Test](assets/register-test.png)

### 2. Pengujian Login (POST `/api/login`)
> Melakukan otentikasi kredensial pengguna untuk menerbitkan *Bearer Token* Laravel Sanctum yang otomatis tersimpan pada kolom token[cite: 1].
> ![Login Test](assets/login-test.png)

### 3. Pengujian Tambah Kontak & Relasi 1:N (POST `/api/kontak`)
> Menambahkan data personal kontak beserta *array* nomor telepon. Berhasil mengeksekusi *Cascade Create* dengan status HTTP `201 Created`[cite: 1].
> ![Tambah Kontak Test](assets/tambah-kontak-test.png)

### 4. Pengujian Ambil Data Kontak (GET `/api/kontak`)
> Menarik seluruh data kontak dari database beserta relasi *nested array phones* (nomor telepon) yang dilindungi oleh *middleware* `auth:sanctum`[cite: 1].
> ![Get Kontak Test](assets/get-kontak-test.png)

---

## 📦 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal (direkomendasikan menggunakan terminal WSL/Ubuntu)[cite: 1]:

### 1. Kloning Repositori & Masuk Folder
```bash
git clone [https://github.com/taniaalyana/kontak-api-laravel.git](https://github.com/taniaalyana/kontak-api-laravel.git)
cd kontak-api
