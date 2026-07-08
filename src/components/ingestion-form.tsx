"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FileDropzone } from "@/components/file-dropzone";
import { MetadataFields, MetadataField } from "@/components/metadata-fields";
import { StatusConsole, LogEntry } from "@/components/status-console";

export function IngestionForm() {
  // Form state
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<string[]>([]);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [documentTitle, setDocumentTitle] = useState("");
  const [customMetadata, setCustomMetadata] = useState<MetadataField[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const fetchCollections = useCallback(async () => {
    setIsLoadingCollections(true);
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setIsLoadingCollections(false);
    }
  }, []);

  const fetchCategories = useCallback(async (colName: string) => {
    if (!colName.trim()) {
      setCategories([]);
      return;
    }
    setIsLoadingCategories(true);
    try {
      const res = await fetch(`/api/categories?collection=${encodeURIComponent(colName.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  React.useEffect(() => {
    fetchCategories(collectionName);
  }, [collectionName, fetchCategories]);

  const addLog = useCallback((log: LogEntry) => {
    setLogs((prev) => [...prev, log]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!collectionName.trim()) {
      addLog({
        type: "error",
        message: "❌ Collection name is required.",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (!documentTitle.trim()) {
      addLog({
        type: "error",
        message: "❌ Document title is required.",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (!file) {
      addLog({
        type: "error",
        message: "❌ Please upload a PDF file.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setIsSubmitting(true);
    setLogs([]);

    addLog({
      type: "info",
      message: "🚀 Initiating ingestion pipeline...",
      timestamp: new Date().toISOString(),
    });

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("collectionName", collectionName.trim());
      formData.append("documentTitle", documentTitle.trim());
      formData.append("category", category.trim());
      formData.append("chunkSize", chunkSize.toString());
      formData.append("chunkOverlap", chunkOverlap.toString());

      // Build custom metadata object
      const metadataObj: Record<string, string> = {};
      customMetadata.forEach((f) => {
        if (f.key.trim() && f.value.trim()) {
          metadataObj[f.key.trim()] = f.value.trim();
        }
      });
      formData.append("customMetadata", JSON.stringify(metadataObj));

      // Send request and process SSE stream
      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              addLog({
                type: data.type,
                message: data.message,
                timestamp: data.timestamp,
              });
              if (data.type === "complete") {
                fetchCollections();
              }
            } catch {
              // Skip malformed SSE data
            }
          }
        }
      }
    } catch (error) {
      addLog({
        type: "error",
        message: `❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollections = collections.filter((c) =>
    c.toLowerCase().includes(collectionName.toLowerCase())
  );

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(category.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ─── Target Collection ─────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="collection-name" className="text-sm font-medium text-foreground/80">
          Target Collection
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 z-10 pointer-events-none">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <Input
            id="collection-name"
            placeholder="Select or type collection name..."
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value);
              setShowCollectionsDropdown(true);
            }}
            onFocus={() => setShowCollectionsDropdown(true)}
            onBlur={() => setShowCollectionsDropdown(false)}
            className="pl-10 h-11 bg-white/[0.03] border-white/10 placeholder:text-muted-foreground/30 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            disabled={isSubmitting}
            autoComplete="off"
          />
          {showCollectionsDropdown && filteredCollections.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-[#0f0f12]/95 backdrop-blur-md shadow-2xl z-50 py-1">
              {filteredCollections.map((name) => (
                <div
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCollectionName(name);
                    setShowCollectionsDropdown(false);
                  }}
                  className="px-4 py-2 text-sm text-foreground/80 hover:bg-violet-600 hover:text-white cursor-pointer transition-colors"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground/40">
          If collection doesn&apos;t exist, it will be created automatically.
        </p>
      </div>

      {/* ─── Document Metadata ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="document-title" className="text-sm font-medium text-foreground/80">
            Document Title <span className="text-red-400">*</span>
          </label>
          <Input
            id="document-title"
            placeholder="e.g. SOP Perawatan Turbin"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="h-11 bg-white/[0.03] border-white/10 placeholder:text-muted-foreground/30 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-foreground/80">
            Category / Tag
          </label>
          <div className="relative">
            <Input
              id="category"
              placeholder="e.g. Prosedur, Manual, Laporan"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setShowCategoriesDropdown(true);
              }}
              onFocus={() => setShowCategoriesDropdown(true)}
              onBlur={() => setShowCategoriesDropdown(false)}
              className="h-11 bg-white/[0.03] border-white/10 placeholder:text-muted-foreground/30 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
              disabled={isSubmitting}
              autoComplete="off"
            />
            {showCategoriesDropdown && filteredCategories.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0f0f12]/95 backdrop-blur-md shadow-2xl z-50 py-1">
                {filteredCategories.map((name) => (
                  <div
                    key={name}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCategory(name);
                      setShowCategoriesDropdown(false);
                    }}
                    className="px-4 py-2 text-sm text-foreground/80 hover:bg-violet-600 hover:text-white cursor-pointer transition-colors"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Custom Metadata ──────────────────────────────── */}
      <MetadataFields fields={customMetadata} onChange={setCustomMetadata} />

      {/* ─── File Upload ──────────────────────────────────── */}
      <FileDropzone file={file} onFileSelect={setFile} />

      {/* ─── Advanced RAG Settings ────────────────────────── */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger
            className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Advanced RAG Settings
            </div>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="space-y-2">
              <label htmlFor="chunk-size" className="text-sm font-medium text-foreground/80">
                Chunk Size
              </label>
              <Input
                id="chunk-size"
                type="number"
                min={100}
                max={10000}
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                className="h-10 bg-white/[0.03] border-white/10 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground/40">Characters per chunk (default: 1000)</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="chunk-overlap" className="text-sm font-medium text-foreground/80">
                Chunk Overlap
              </label>
              <Input
                id="chunk-overlap"
                type="number"
                min={0}
                max={5000}
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                className="h-10 bg-white/[0.03] border-white/10 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground/40">Overlap between chunks (default: 200)</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ─── Submit Button ────────────────────────────────── */}
      <Button
        type="submit"
        disabled={isSubmitting || !file || !collectionName.trim() || !documentTitle.trim()}
        className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2.5">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing Pipeline...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Start Ingestion Pipeline
          </div>
        )}
      </Button>

      {/* ─── Status Console ───────────────────────────────── */}
      <StatusConsole logs={logs} isActive={isSubmitting} />
    </form>
  );
}
