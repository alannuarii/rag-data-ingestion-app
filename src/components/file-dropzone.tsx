"use client";

import React, { useCallback, useState, useRef } from "react";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export function FileDropzone({ onFileSelect, file }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (f: File): boolean => {
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are accepted.");
        return false;
      }
      if (f.size > 20 * 1024 * 1024) {
        setError("File exceeds 20MB limit.");
        return false;
      }
      setError(null);
      return true;
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      if (selectedFile && validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80">
        Upload PDF
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-all duration-300 ease-out
          ${
            isDragOver
              ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
              : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {file ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <svg
                  className="h-6 w-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="mt-1 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <svg
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-violet-400 font-medium">
                    Click to browse
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PDF files only • Max 20MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
