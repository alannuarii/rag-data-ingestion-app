/**
 * Google Gemini Embedding Client
 *
 * Uses the gemini-embedding-2 model to generate 3072-dimensional embeddings.
 * Supports batch processing for efficiency.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-2";
const BATCH_SIZE = 100; // Gemini supports up to 100 texts per batch request

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate embeddings for a batch of text chunks.
 * Automatically splits into sub-batches of BATCH_SIZE.
 *
 * @param texts - Array of text strings to embed
 * @param onProgress - Optional callback for progress updates
 * @returns Array of embedding vectors (number[][])
 */
export async function generateEmbeddings(
  texts: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<number[][]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await model.batchEmbedContents({
      requests: batch.map((text) => ({
        content: { role: "user", parts: [{ text }] },
      })),
    });

    const batchEmbeddings = result.embeddings.map((e) => e.values);
    allEmbeddings.push(...batchEmbeddings);

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, texts.length), texts.length);
    }
  }

  return allEmbeddings;
}
