import Link from "next/link";
import { IngestionForm } from "@/components/ingestion-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* ─── Background Effects ───────────────────────────── */}
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/6 blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ─── Content ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          {/* Top bar: Badge + Docs link */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              RAG Pipeline v1.0
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-muted-foreground hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-300 transition-all duration-200 backdrop-blur-sm"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Dokumentasi
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Universal Vector
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Ingestion Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
            Upload PDF documents, extract text, generate vector embeddings via
            Google Gemini, and store them in your Qdrant collection.
          </p>
        </header>

        {/* Main Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
          <IngestionForm />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground/30">
          <p>
            Powered by{" "}
            <span className="text-muted-foreground/50">Gemini text-embedding-004</span>
            {" · "}
            <span className="text-muted-foreground/50">Qdrant Vector DB</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
