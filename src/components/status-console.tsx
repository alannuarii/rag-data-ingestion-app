"use client";

import React, { useRef, useEffect } from "react";

export interface LogEntry {
  type: "info" | "success" | "error" | "warning" | "progress" | "complete";
  message: string;
  timestamp: string;
}

interface StatusConsoleProps {
  logs: LogEntry[];
  isActive: boolean;
}

const typeColors: Record<LogEntry["type"], string> = {
  info: "text-blue-400",
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  progress: "text-violet-400",
  complete: "text-emerald-300",
};

const typeLabels: Record<LogEntry["type"], string> = {
  info: "INFO",
  success: " OK ",
  error: "FAIL",
  warning: "WARN",
  progress: "PROG",
  complete: "DONE",
};

export function StatusConsole({ logs, isActive }: StatusConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">
          Status Console
        </label>
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-xs text-violet-400">Processing</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative h-64 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-4 font-mono text-xs leading-relaxed"
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative space-y-1">
          {logs.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground/30">
              <div className="text-center space-y-2">
                <svg
                  className="h-8 w-8 mx-auto opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <p>Waiting for pipeline to start...</p>
              </div>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-150 ${
                  log.type === "complete" ? "mt-2 pt-2 border-t border-emerald-500/20" : ""
                }`}
              >
                <span className="text-muted-foreground/30 select-none shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span
                  className={`shrink-0 font-bold ${typeColors[log.type]}`}
                >
                  [{typeLabels[log.type]}]
                </span>
                <span
                  className={`${
                    log.type === "complete"
                      ? "text-emerald-300 font-semibold"
                      : "text-foreground/70"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}

          {/* Blinking cursor */}
          {isActive && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-violet-500">❯</span>
              <span className="h-4 w-1.5 bg-violet-500 animate-pulse rounded-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
