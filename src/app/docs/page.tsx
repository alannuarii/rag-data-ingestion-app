import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dokumentasi | Universal Vector Ingestion Engine",
  description:
    "Panduan lengkap penggunaan aplikasi RAG Data Ingestion: langkah-langkah proses, penjelasan istilah, dan konfigurasi yang dibutuhkan.",
};

/* ─── Data ───────────────────────────────────────────────── */

const steps = [
  {
    number: "01",
    title: "Konfigurasi Kredensial",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    color: "violet",
    description:
      "Sebelum menggunakan aplikasi, pastikan file .env telah dikonfigurasi dengan benar.",
    items: [
      {
        label: "GEMINI_API_KEY",
        value: "API Key dari Google AI Studio (makersuite.google.com). Digunakan untuk memanggil model gemini-embedding-2 guna menghasilkan vektor dari teks.",
      },
      {
        label: "QDRANT_URL",
        value: "Alamat URL server Qdrant yang dapat diakses dari mesin ini. Contoh: http://localhost:6333 untuk lokal, atau URL server remote.",
      },
      {
        label: "QDRANT_API_KEY",
        value: "API Key untuk otentikasi ke Qdrant. Diperlukan jika server Qdrant dikonfigurasi dengan pengamanan API key.",
      },
    ],
  },
  {
    number: "02",
    title: "Tentukan Target Collection",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    color: "purple",
    description:
      "Isi kolom Target Collection dengan nama collection Qdrant yang ingin dijadikan tujuan penyimpanan vektor.",
    items: [
      {
        label: "Nama Collection Baru",
        value: "Jika collection dengan nama tersebut belum ada di Qdrant, sistem akan membuatnya secara otomatis dengan konfigurasi dimensi 768 (sesuai Gemini) dan jarak Cosine.",
      },
      {
        label: "Nama Collection Lama",
        value: "Jika collection sudah ada, vektor baru akan ditambahkan (di-upsert) ke dalam collection yang sama tanpa menghapus data sebelumnya.",
      },
      {
        label: "Konvensi Penamaan",
        value: "Gunakan nama yang deskriptif dan konsisten, contoh: kb_engineering, kb_legal, kb_finance. Hindari spasi — gunakan underscore (_).",
      },
    ],
  },
  {
    number: "03",
    title: "Isi Metadata Dokumen",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "indigo",
    description:
      "Metadata akan disimpan bersama setiap vektor sebagai payload, sehingga dapat digunakan untuk filtering saat pencarian di RAG pipeline.",
    items: [
      {
        label: "Judul Dokumen (Wajib)",
        value: "Nama atau judul lengkap dokumen yang diunggah. Contoh: 'SOP Perawatan Turbin Unit 3'. Disimpan sebagai field document_title di payload Qdrant.",
      },
      {
        label: "Kategori / Tag",
        value: "Label kategorisasi dokumen. Contoh: 'Prosedur', 'Manual Teknis', 'Laporan Keuangan'. Disimpan sebagai field category.",
      },
      {
        label: "Custom Metadata (Key-Value)",
        value: "Atribut tambahan yang fleksibel sesuai kebutuhan domain. Klik tombol 'Add Field', isi kolom Key dan Value. Contoh: Key = nomor_unit, Value = Unit-4. Semua custom metadata akan disimpan langsung di payload Qdrant.",
      },
    ],
  },
  {
    number: "04",
    title: "Upload File PDF",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "blue",
    description:
      "Pilih atau seret file PDF ke area upload. Sistem akan memvalidasi tipe file dan ukurannya.",
    items: [
      {
        label: "Format yang Diterima",
        value: "Hanya file berekstensi .pdf yang dapat diunggah.",
      },
      {
        label: "Batas Ukuran",
        value: "Maksimal 20MB per file. File yang lebih besar dari batas ini akan ditolak sebelum dikirim ke server.",
      },
      {
        label: "Cara Upload",
        value: "Klik area dropzone untuk membuka file browser, atau seret (drag & drop) file langsung ke area tersebut. File yang sudah dipilih dapat dihapus dengan klik 'Remove file'.",
      },
    ],
  },
  {
    number: "05",
    title: "Atur Advanced RAG Settings (Opsional)",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    color: "emerald",
    description:
      "Klik panel 'Advanced RAG Settings' untuk memperluas pengaturan chunking. Nilai default sudah optimal untuk sebagian besar dokumen.",
    items: [
      {
        label: "Chunk Size (Default: 1000)",
        value: "Jumlah karakter maksimum per potongan teks (chunk). Nilai lebih kecil menghasilkan chunk yang lebih granular (cocok untuk FAQ/Q&A). Nilai lebih besar mempertahankan lebih banyak konteks per chunk (cocok untuk narasi panjang).",
      },
      {
        label: "Chunk Overlap (Default: 200)",
        value: "Jumlah karakter yang tumpang tindih (overlap) antar dua chunk berurutan. Overlap memastikan bahwa informasi yang berada di perbatasan dua chunk tidak hilang. Nilai yang disarankan: 10–20% dari Chunk Size.",
      },
    ],
  },
  {
    number: "06",
    title: "Jalankan Pipeline & Monitor Status",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
    color: "rose",
    description:
      "Klik tombol 'Start Ingestion Pipeline'. Status Console di bawah akan menampilkan log proses secara real-time.",
    items: [
      {
        label: "📥 Receiving form data",
        value: "Server menerima dan memvalidasi semua data formulir yang dikirim.",
      },
      {
        label: "🔗 Checking collection",
        value: "Aplikasi terhubung ke Qdrant dan memeriksa apakah collection tujuan sudah ada.",
      },
      {
        label: "📄 Parsing PDF",
        value: "Teks diekstraksi dari seluruh halaman PDF menggunakan library pdf-parse.",
      },
      {
        label: "✂️ Chunking text",
        value: "Teks dibagi menjadi potongan-potongan kecil sesuai pengaturan Chunk Size dan Overlap.",
      },
      {
        label: "🧠 Generating embeddings",
        value: "Setiap chunk dikirim ke Google Gemini API untuk diubah menjadi vektor numerik 768 dimensi.",
      },
      {
        label: "📤 Upserting vectors",
        value: "Semua vektor beserta payload metadata diunggah ke Qdrant secara batch.",
      },
      {
        label: "🎉 Pipeline complete",
        value: "Proses selesai. Jumlah vektor yang berhasil disimpan akan ditampilkan.",
      },
    ],
  },
];

const glossary = [
  {
    term: "RAG (Retrieval-Augmented Generation)",
    definition:
      "Teknik AI yang menggabungkan pencarian berbasis vektor (retrieval) dengan model bahasa besar (LLM). Dokumen disimpan sebagai vektor, lalu saat ada pertanyaan, sistem mencari potongan teks yang paling relevan untuk dijadikan konteks jawaban LLM.",
  },
  {
    term: "Vektor / Embedding",
    definition:
      "Representasi numerik dari teks dalam bentuk array angka (contoh: 768 angka). Teks yang bermakna serupa akan menghasilkan vektor yang jaraknya dekat secara matematika. Inilah yang memungkinkan pencarian semantik (bukan hanya kata kunci).",
  },
  {
    term: "Chunk",
    definition:
      "Potongan kecil dari teks dokumen yang diproses secara mandiri. Satu dokumen PDF biasanya dipecah menjadi puluhan hingga ratusan chunk sebelum masing-masing diubah menjadi vektor.",
  },
  {
    term: "Chunk Size",
    definition:
      "Panjang maksimum setiap chunk dalam satuan karakter. Menentukan seberapa besar konteks yang dibawa oleh satu vektor. Default: 1000 karakter.",
  },
  {
    term: "Chunk Overlap",
    definition:
      "Jumlah karakter yang disalin dari akhir chunk sebelumnya ke awal chunk berikutnya. Bertujuan mencegah hilangnya informasi yang berada di perbatasan antar chunk. Default: 200 karakter.",
  },
  {
    term: "Collection (Qdrant)",
    definition:
      "Unit penyimpanan utama di Qdrant, setara dengan 'tabel' di database relasional. Setiap collection menyimpan vektor dengan dimensi dan metode jarak yang sama. Anda dapat memiliki banyak collection untuk domain yang berbeda.",
  },
  {
    term: "Payload",
    definition:
      "Data tambahan yang disimpan bersama setiap vektor di Qdrant. Payload berisi metadata seperti judul dokumen, kategori, teks asli (source_text), dan atribut custom. Payload dapat digunakan untuk filter saat pencarian.",
  },
  {
    term: "Upsert",
    definition:
      "Operasi gabungan 'update + insert'. Jika titik (point) dengan ID yang sama sudah ada, datanya diperbarui. Jika belum ada, dibuat baru. Ini memastikan tidak ada duplikasi ID.",
  },
  {
    term: "Cosine Similarity",
    definition:
      "Metode pengukuran kemiripan dua vektor berdasarkan sudut di antara keduanya (bukan jarak Euclidean). Digunakan Qdrant untuk menemukan vektor yang paling mirip dengan query. Nilai 1.0 = identik, 0.0 = tidak berkaitan.",
  },
  {
    term: "gemini-embedding-2",
    definition:
      "Model embedding dari Google Gemini yang mengubah teks menjadi vektor 3072 dimensi. Model ini dioptimalkan untuk tugas pencarian semantik dan retrieval, dan mendukung pemrosesan batch hingga 100 teks sekaligus.",
  },
  {
    term: "SSE (Server-Sent Events)",
    definition:
      "Teknologi web yang memungkinkan server mengirim data ke browser secara real-time dalam satu koneksi HTTP. Digunakan oleh aplikasi ini untuk menampilkan log pipeline langsung di Status Console tanpa harus me-refresh halaman.",
  },
  {
    term: "Dimensi Vektor",
    definition:
      "Jumlah angka dalam satu array vektor. Model gemini-embedding-2 menghasilkan vektor 3072 dimensi. Collection Qdrant dikonfigurasi dengan ukuran ini agar semua vektor yang disimpan kompatibel.",
  },
];

const colorMap: Record<string, string> = {
  violet: "border-violet-500/30 bg-violet-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
  indigo: "border-indigo-500/30 bg-indigo-500/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
};

const iconColorMap: Record<string, string> = {
  violet: "text-violet-400 bg-violet-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  indigo: "text-indigo-400 bg-indigo-500/10",
  blue: "text-blue-400 bg-blue-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  rose: "text-rose-400 bg-rose-500/10",
};

const numberColorMap: Record<string, string> = {
  violet: "text-violet-500/40",
  purple: "text-purple-500/40",
  indigo: "text-indigo-500/40",
  blue: "text-blue-500/40",
  emerald: "text-emerald-500/40",
  rose: "text-rose-500/40",
};

/* ─── Page ───────────────────────────────────────────────── */

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full bg-violet-600/6 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-purple-600/5 blur-[80px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* ─── Back Nav ───────────────────── */}
        <nav className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Aplikasi
          </Link>
        </nav>

        {/* ─── Header ─────────────────────── */}
        <header className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Dokumentasi
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Panduan Penggunaan
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Universal Ingestion Engine
            </span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
            Ikuti langkah-langkah di bawah untuk memproses dokumen PDF Anda menjadi
            vektor yang siap digunakan dalam pipeline RAG.
          </p>
        </header>

        {/* ─── Steps ──────────────────────── */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
            Langkah-langkah Penggunaan
          </h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`rounded-xl border p-5 ${colorMap[step.color]}`}
              >
                {/* Step Header */}
                <div className="mb-4 flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColorMap[step.color]}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-mono font-bold ${numberColorMap[step.color]}`}>
                        {step.number}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground/90">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Items */}
                <div className="ml-14 space-y-2.5">
                  {step.items.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-xs font-semibold text-foreground/70 mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground/55 leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pipeline Diagram ────────────── */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
            Alur Pipeline (Diagram)
          </h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col items-center gap-0">
              {[
                { label: "PDF File", sublabel: "Input dokumen pengguna", icon: "📄", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
                { label: "PDF Parsing", sublabel: "Ekstraksi teks mentah", icon: "🔍", color: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
                { label: "Text Chunking", sublabel: "Pemecahan teks dengan overlap", icon: "✂️", color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
                { label: "Gemini Embedding", sublabel: "Teks → Vektor 768 dimensi", icon: "🧠", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" },
                { label: "Qdrant Upsert", sublabel: "Vektor + payload disimpan", icon: "💾", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
              ].map((node, idx, arr) => (
                <div key={idx} className="flex flex-col items-center w-full max-w-xs">
                  <div className={`w-full rounded-lg border px-4 py-3 text-center ${node.color}`}>
                    <div className="text-xl mb-1">{node.icon}</div>
                    <div className="text-sm font-semibold">{node.label}</div>
                    <div className="text-[11px] text-muted-foreground/50 mt-0.5">{node.sublabel}</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex flex-col items-center py-1.5">
                      <div className="h-4 w-px bg-white/10" />
                      <svg className="h-3 w-3 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l7 7a1 1 0 01-1.414 1.414L10 5.414l-6.293 6.293a1 1 0 01-1.414-1.414l7-7A1 1 0 0110 3z" clipRule="evenodd" transform="rotate(180 10 10)" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Glossary ───────────────────── */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
            Glosarium Istilah
          </h2>
          <div className="space-y-3">
            {glossary.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.10] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/10">
                    <span className="text-[10px] font-bold text-violet-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/85 mb-1">
                      {item.term}
                    </p>
                    <p className="text-xs text-muted-foreground/55 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Tips ───────────────────────── */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
            Tips & Praktik Terbaik
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: "📁",
                title: "Organisasi Collection",
                body: "Pisahkan domain berbeda ke collection yang berbeda. Contoh: kb_teknis untuk dokumen teknis, kb_keuangan untuk laporan keuangan. Ini mempermudah filtering saat retrieval.",
              },
              {
                icon: "📏",
                title: "Chunk Size Optimal",
                body: "Untuk dokumen naratif panjang gunakan 1000–1500 karakter. Untuk FAQ atau dokumen yang berisi poin pendek, gunakan 300–500 karakter agar granularitas lebih tinggi.",
              },
              {
                icon: "🔁",
                title: "Overlap yang Tepat",
                body: "Overlap idealnya 15–20% dari Chunk Size. Terlalu kecil berisiko kehilangan konteks di batas chunk. Terlalu besar menyebabkan redundansi dan biaya embedding lebih tinggi.",
              },
              {
                icon: "🏷️",
                title: "Manfaatkan Custom Metadata",
                body: "Tambahkan metadata spesifik seperti nomor_unit, tahun_terbit, atau penulis. Metadata ini dapat digunakan sebagai filter di query Qdrant untuk hasil pencarian yang lebih tepat sasaran.",
              },
              {
                icon: "📋",
                title: "Judul Dokumen Deskriptif",
                body: "Isi judul dokumen sejelas mungkin karena nilai ini disimpan di setiap chunk sebagai document_title. Judul yang baik membantu identifikasi sumber di hasil RAG.",
              },
              {
                icon: "⚡",
                title: "Batch Processing",
                body: "Untuk volume besar, unggah dokumen satu per satu ke collection yang sama. Operasi upsert bersifat idempoten — mengunggah ulang file yang sama tidak akan membuat duplikasi ID.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.10] transition-colors"
              >
                <div className="mb-2 text-2xl">{tip.icon}</div>
                <p className="text-sm font-semibold text-foreground/80 mb-1">{tip.title}</p>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ────────────────────────── */}
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-8 text-center">
          <p className="text-sm font-semibold text-foreground/80 mb-2">
            Siap untuk mulai?
          </p>
          <p className="text-xs text-muted-foreground/50 mb-5">
            Kembali ke aplikasi dan mulai proses ingestion dokumen pertama Anda.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Buka Aplikasi
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-muted-foreground/25">
          <p>Universal Vector Ingestion Engine · Powered by Gemini gemini-embedding-2 &amp; Qdrant</p>
        </footer>
      </div>
    </main>
  );
}
