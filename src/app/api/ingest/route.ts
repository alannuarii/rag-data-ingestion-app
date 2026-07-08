/**
 * POST /api/ingest
 *
 * Ingestion pipeline API endpoint.
 * Accepts FormData with a PDF file, metadata, and chunking parameters.
 * Streams progress updates via Server-Sent Events (SSE).
 */

import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import { chunkText } from "@/lib/chunking";
import { generateEmbeddings } from "@/lib/embeddings";
import { ensureCollection, batchUpsert, PointPayload } from "@/lib/qdrant";

export const maxDuration = 300; // 5 minutes max for large PDFs

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, message: string, data?: Record<string, unknown>) => {
        const event = JSON.stringify({ type, message, timestamp: new Date().toISOString(), ...data });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };

      try {
        // ─── 1. Parse FormData ───────────────────────────────────
        sendEvent("info", "📥 Receiving form data...");
        const formData = await request.formData();

        const file = formData.get("file") as File | null;
        const collectionName = formData.get("collectionName") as string;
        const documentTitle = formData.get("documentTitle") as string;
        const category = formData.get("category") as string;
        const chunkSize = parseInt(formData.get("chunkSize") as string) || 1000;
        const chunkOverlap = parseInt(formData.get("chunkOverlap") as string) || 200;
        const customMetadataRaw = formData.get("customMetadata") as string;

        // Validate required fields
        if (!file) {
          sendEvent("error", "❌ No PDF file uploaded.");
          controller.close();
          return;
        }

        if (!collectionName || collectionName.trim().length === 0) {
          sendEvent("error", "❌ Collection name is required.");
          controller.close();
          return;
        }

        if (!documentTitle || documentTitle.trim().length === 0) {
          sendEvent("error", "❌ Document title is required.");
          controller.close();
          return;
        }

        if (file.size > 20 * 1024 * 1024) {
          sendEvent("error", "❌ File exceeds 20MB limit.");
          controller.close();
          return;
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {
          sendEvent("error", "❌ Only PDF files are accepted.");
          controller.close();
          return;
        }

        // Parse custom metadata
        let customMetadata: Record<string, string> = {};
        if (customMetadataRaw) {
          try {
            customMetadata = JSON.parse(customMetadataRaw);
          } catch {
            sendEvent("warning", "⚠️ Could not parse custom metadata, skipping.");
          }
        }

        sendEvent("success", `✅ Form data received. File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

        // ─── 2. Qdrant Collection Management ─────────────────────
        sendEvent("info", `🔗 Connecting to Qdrant — checking collection "${collectionName}"...`);

        const isNew = await ensureCollection(collectionName);
        if (isNew) {
          sendEvent("success", `✅ Collection "${collectionName}" created (3072-dim Cosine).`);
        } else {
          sendEvent("success", `✅ Collection "${collectionName}" already exists.`);
        }

        // ─── 3. Parse PDF ────────────────────────────────────────
        sendEvent("info", "📄 Parsing PDF — extracting text...");

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const pdf = new PDFParse({ data: uint8Array });
        const textResult = await pdf.getText();
        const rawText = textResult.text;
        const infoResult = await pdf.getInfo();
        const numPages = infoResult.total;
        await pdf.destroy();

        if (!rawText || rawText.trim().length === 0) {
          sendEvent("error", "❌ No text content found in PDF.");
          controller.close();
          return;
        }

        sendEvent("success", `✅ PDF parsed. Extracted ${rawText.length.toLocaleString()} characters from ${numPages} pages.`);

        // ─── 4. Chunk Text ───────────────────────────────────────
        sendEvent("info", `✂️ Chunking text (size: ${chunkSize}, overlap: ${chunkOverlap})...`);

        const chunks = chunkText(rawText, { chunkSize, chunkOverlap });

        if (chunks.length === 0) {
          sendEvent("error", "❌ No text chunks produced.");
          controller.close();
          return;
        }

        sendEvent("success", `✅ Created ${chunks.length} chunks.`);

        // ─── 5. Generate Embeddings ──────────────────────────────
        sendEvent("info", `🧠 Generating embeddings for ${chunks.length} chunks via Gemini gemini-embedding-2...`);

        const embeddings = await generateEmbeddings(chunks, (completed, total) => {
          sendEvent("progress", `⏳ Embedding progress: ${completed}/${total} chunks processed.`);
        });

        sendEvent("success", `✅ All ${embeddings.length} embeddings generated.`);

        // ─── 6. Upsert to Qdrant ─────────────────────────────────
        sendEvent("info", `📤 Upserting ${embeddings.length} vectors to "${collectionName}"...`);

        const payloads: PointPayload[] = chunks.map((chunk, index) => ({
          source_text: chunk,
          document_title: documentTitle,
          category: category || "",
          chunk_index: index,
          total_chunks: chunks.length,
          ...customMetadata,
        }));

        const upsertedCount = await batchUpsert(
          collectionName,
          embeddings,
          payloads,
          (completed, total) => {
            sendEvent("progress", `⏳ Upsert progress: ${completed}/${total} vectors stored.`);
          }
        );

        // ─── 7. Done ─────────────────────────────────────────────
        sendEvent("complete", `🎉 Pipeline complete! ${upsertedCount} vectors upserted to "${collectionName}".`, {
          vectorCount: upsertedCount,
          collection: collectionName,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        sendEvent("error", `❌ Pipeline failed: ${message}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
