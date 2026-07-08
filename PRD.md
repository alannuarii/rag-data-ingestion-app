# Project Name: RAG Data Ingestion App

## 1. Project Overview
Buatlah sebuah aplikasi web monolitik menggunakan Next.js (App Router) yang berfungsi sebagai "Universal Data Ingestion Pipeline". Aplikasi ini bertugas menerima unggahan file PDF dari berbagai domain (tidak spesifik pada satu jenis dokumen), mengekstrak teksnya, melakukan chunking, memproses teks menjadi vektor menggunakan Google Gemini API (text-embedding-004), dan mendistribusikan data tersebut ke Qdrant Collection yang dipilih oleh pengguna.

## 2. Tech Stack
* **Framework:** Next.js (App Router - React 18+)
* **Styling:** Tailwind CSS + Shadcn UI (untuk komponen UI yang cepat dan bersih).
* **PDF Parser:** `pdf-parse` (kompatibel dengan Node.js backend).
* **AI SDK:** `@google/generative-ai`
* **Vector DB SDK:** `@qdrant/js-client-rest`

## 3. Environment Variables (.env)
Aplikasi harus menggunakan variabel lingkungan berikut:
* `GEMINI_API_KEY`: API Key untuk Google Gemini.
* `QDRANT_URL`: URL lokal/server Qdrant.
* `QDRANT_API_KEY`: API Key utama (Write Access) untuk Qdrant.
* *(Catatan: QDRANT_COLLECTION_NAME dihapus dari .env karena akan ditentukan secara dinamis melalui antarmuka pengguna).*

## 4. Fitur & Spesifikasi Frontend (UI)
Buat halaman utama tunggal (`/page.tsx`) yang bertindak sebagai dashboard operasional.
Komponen yang harus ada:
* **Form Header:** Judul "Universal Vector Ingestion Engine".
* **Routing / Target Database:**
  * **Input Collection Name:** Text input atau Combobox untuk menentukan nama *Collection* tujuan di Qdrant (Misal: `kb_engineering`, `kb_legal`, `kb_finance`). Jika collection belum ada di database, sistem harus membuatnya otomatis.
* **Universal Metadata Inputs (Payload Dinamis):**
  * **Judul Dokumen:** Text input wajib.
  * **Kategori/Tag:** Text input (Misal: "Prosedur", "Laporan Keuangan", "Manual").
  * **Custom Metadata (Key-Value):** Fitur dinamis (tombol "Add Field") yang memungkinkan user menambah atribut metadata spesifik sesuai kebutuhan dokumen (Misal: Key = `nomor_unit`, Value = `Unit-4`; atau Key = `departemen`, Value = `HR`).
* **File Uploader:** Area *drag-and-drop* file `.pdf` (Maksimal 20MB).
* **Advanced RAG Settings (Accordion):**
  * *Chunk Size:* Input angka (Default: 1000 karakter).
  * *Chunk Overlap:* Input angka (Default: 200 karakter).
* **Submit Button:** Tombol aksi dengan indikator *loading state*.
* **Live Status Console:** Kotak log terminal tiruan untuk menampilkan progres pemrosesan (Parsing PDF -> Chunking -> Embedding -> Upsert).

## 5. Fitur & Spesifikasi Backend (API Routes Next.js)
Buat API Endpoint di `app/api/ingest/route.ts` (POST) untuk memproses FormData.
Logika pemrosesan:

1. **Penerimaan & Validasi:** Ekstrak file PDF, Target Collection, dan data Metadata dinamis dari Request.
2. **Manajemen Qdrant:** Koneksi ke Qdrant. Cek apakah *Target Collection* yang diminta dari UI sudah eksis. Jika tidak ada, panggil fungsi `createCollection` dengan konfigurasi `size: 768` (dimensi Gemini) dan `distance: Cosine`.
3. **Parsing Data:** Ekstraksi teks murni dari PDF.
4. **Algoritma Chunking:** Potong teks berdasarkan parameter *Chunk Size* dan *Overlap* yang dikirim dari UI, dengan toleransi pemotongan agar tidak merusak batas kata.
5. **Proses Embedding:** Gunakan iterasi untuk memanggil model Gemini `text-embedding-004` pada setiap chunk teks.
6. **Upsert Universal:**
   * Susun array `Point` untuk Qdrant.
   * Masukkan semua metadata statis (Judul, Kategori) dan metadata dinamis (Custom Key-Value) ke dalam `payload` masing-masing chunk.
   * Sisipkan juga potongan teks aslinya ke dalam payload dengan key `source_text`.
   * Eksekusi batch upsert ke *Target Collection* yang spesifik.
7. **Response:** Kirim JSON berisi status sukses dan jumlah vektor yang berhasil di-upsert.

## 6. Persyaratan Deployment (Docker)
Aplikasi harus menyertakan `Dockerfile` standar Node.js:
* Base image: `node:20-alpine`.
* Gunakan perintah standar untuk `npm install`, `npm run build`, dan `npm start`.
* Aplikasi berjalan di port 3000.
