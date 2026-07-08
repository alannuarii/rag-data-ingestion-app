/**
 * Qdrant Vector Database Client
 *
 * Handles connection, collection management, and batch upsert operations.
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";

const VECTOR_SIZE = 3072; // Gemini gemini-embedding-2 dimension

let client: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!client) {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url) {
      throw new Error("QDRANT_URL environment variable is not set");
    }

    client = new QdrantClient({
      url,
      apiKey: apiKey || undefined,
    });
  }
  return client;
}

/**
 * Ensure a collection exists in Qdrant.
 * If it doesn't exist, create it with the correct vector configuration.
 */
export async function ensureCollection(collectionName: string): Promise<boolean> {
  const qdrant = getClient();

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      return true; // newly created
    }

    return false; // already existed
  } catch (error) {
    throw new Error(
      `Failed to ensure collection "${collectionName}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export interface PointPayload {
  source_text: string;
  document_title: string;
  category: string;
  chunk_index: number;
  total_chunks: number;
  [key: string]: string | number; // dynamic metadata
}

/**
 * Batch upsert points (vectors + payloads) into a Qdrant collection.
 *
 * @param collectionName - Target collection
 * @param embeddings - Array of embedding vectors
 * @param payloads - Array of payload objects (must match embeddings length)
 * @param onProgress - Optional progress callback
 * @returns Number of points upserted
 */
export async function batchUpsert(
  collectionName: string,
  embeddings: number[][],
  payloads: PointPayload[],
  onProgress?: (completed: number, total: number) => void
): Promise<number> {
  const qdrant = getClient();
  const BATCH_SIZE = 100;
  let totalUpserted = 0;

  for (let i = 0; i < embeddings.length; i += BATCH_SIZE) {
    const batchEmbeddings = embeddings.slice(i, i + BATCH_SIZE);
    const batchPayloads = payloads.slice(i, i + BATCH_SIZE);

    const points = batchEmbeddings.map((vector, idx) => ({
      id: uuidv4(),
      vector,
      payload: batchPayloads[idx],
    }));

    await qdrant.upsert(collectionName, {
      wait: true,
      points,
    });

    totalUpserted += points.length;

    if (onProgress) {
      onProgress(totalUpserted, embeddings.length);
    }
  }

  return totalUpserted;
}
